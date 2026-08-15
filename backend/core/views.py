import os
import google.generativeai as genai
import uuid
from datetime import datetime, timedelta
from django.utils import timezone
from oauth2_provider.models import Application, AccessToken

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, filters, permissions, status
from rest_framework.views import APIView

from core import serializers, paginators, enums
from core.models import Category, Food, User, Reservation, RestaurantTable, Order, Payment, Bill, Voucher
from core.vnpay import VNPAY
from .utils import send_reservation_email

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method == 'PATCH':
            s = serializers.SimpleUserSerializer(u, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            u = s.save()

        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

class ReservationViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.ReservationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in [enums.Role.ADMIN, enums.Role.STAFF]:
            return Reservation.objects.filter(active=True)
        if user.is_authenticated:
            return Reservation.objects.filter(active=True, customer=user)
        return Reservation.objects.none()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            reservation = serializer.save(customer=self.request.user)
        else:
            reservation = serializer.save()

        if reservation.table:
            reservation.table.status = enums.TableStatus.RESERVED
            reservation.table.save()

        send_reservation_email(reservation, action_type="CREATE")

    @action(methods=['patch'], detail=True, url_path='confirm', permission_classes=[permissions.IsAuthenticated])
    def confirm(self, request, pk):
        if request.user.role not in [enums.Role.ADMIN, enums.Role.STAFF]:
            return Response({'error': 'Bạn không có quyền thực hiện'}, status=status.HTTP_403_FORBIDDEN)

        reservation = generics.get_object_or_404(Reservation, pk=pk)
        reservation.status = enums.ReservationStatus.CONFIRMED
        reservation.save()

        send_reservation_email(reservation, action_type="CONFIRM")
        return Response(serializers.ReservationSerializer(reservation).data)

    @action(methods=['patch'], detail=True, url_path='cancel', permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk):
        if request.user.role not in [enums.Role.ADMIN, enums.Role.STAFF]:
            return Response({'error': 'Bạn không có quyền thực hiện'}, status=status.HTTP_403_FORBIDDEN)

        reservation = generics.get_object_or_404(Reservation, pk=pk)
        reservation.status = enums.ReservationStatus.CANCELLED
        reservation.save()

        if reservation.table:
            reservation.table.status = enums.TableStatus.AVAILABLE
            reservation.table.save()

        send_reservation_email(reservation, action_type="CANCEL")
        return Response(serializers.ReservationSerializer(reservation).data)

class RestaurantTableViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = RestaurantTable.objects.filter(active=True)
    serializer_class = serializers.RestaurantTableSerializer

    @action(methods=['get'], detail=False, url_path='available')
    def available(self, request):
        tables = self.queryset.filter(status=enums.TableStatus.AVAILABLE)
        return Response(serializers.RestaurantTableSerializer(tables, many=True).data)

class OrderViewSet(viewsets.ViewSet, generics.ListAPIView,generics.CreateAPIView):
    serializer_class = serializers.OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [enums.Role.ADMIN, enums.Role.STAFF]:
            return Order.objects.filter(active=True)
        return Order.objects.filter(active=True, customer=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role in [enums.Role.ADMIN, enums.Role.STAFF]:
            serializer.save(employee=user)
        else:
            serializer.save(customer=user)


class CreateVNPAYPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        amount = request.data.get('amount')
        order_info = request.data.get('order_info', f'Thanh toan don hang {order_id}')

        if not order_id or not amount:
            return Response({'error': 'Thiếu order_id hoặc số tiền thanh toán'}, status=status.HTTP_400_BAD_REQUEST)

        ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')

        txn_ref = str(order_id)

        vnp_amount = int(float(amount) * 100)

        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': os.getenv('VNPAY_TMN_CODE'),
            'vnp_Amount': vnp_amount,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': txn_ref,
            'vnp_OrderInfo': order_info,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': os.getenv('VNPAY_RETURN_URL'),
            'vnp_IpAddr': ip_addr,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
        }

        vnp = VNPAY()
        payment_url = vnp.get_payment_url(
            os.getenv('VNPAY_PAYMENT_URL'),
            os.getenv('VNPAY_HASH_SECRET'),
            vnp_params
        )

        return Response({'payment_url': payment_url}, status=status.HTTP_200_OK)


class VNPayCallbackView(APIView):
    def post(self, request):
        try:
            response_code = request.data.get('vnp_ResponseCode')
            order_id = request.data.get('vnp_TxnRef')
            amount = request.data.get('vnp_Amount')

            if response_code == "00":
                order = Order.objects.get(pk=order_id)
                actual_amount = float(amount) / 100 if amount else 0

                if hasattr(enums.OrderStatus, 'COMPLETED'):
                    order.status = enums.OrderStatus.COMPLETED
                order.save()

                bill, _ = Bill.objects.get_or_create(
                    order=order,
                    defaults={
                        'total_amount': actual_amount,
                        'final_amount': actual_amount,
                        'discount': 0
                    }
                )

                payment, created = Payment.objects.get_or_create(
                    bill=bill,
                    payment_method=enums.PaymentMethod.VNPAY,
                    defaults={
                        'amount': actual_amount,
                        'payment_status': enums.PaymentStatus.SUCCESS,
                        'paid_at': timezone.now(),
                    }
                )

                return Response({"message": "Thanh toán thành công!"}, status=status.HTTP_200_OK)

            return Response({"error": "Giao dịch không thành công"}, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({"error": f"Không tìm thấy Order #{order_id}"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error_message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VoucherViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    serializer_class = serializers.VoucherSerializer

    def get_queryset(self):
        now = timezone.now()
        return Voucher.objects.filter(
            active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by('end_date')

class ApplyVoucherView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        bill_id = request.data.get('bill_id')
        code = request.data.get('code', '').strip()

        if not bill_id or not code:
            return Response({'error': 'Thiếu bill_id hoặc mã voucher'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bill = Bill.objects.get(pk=bill_id)
        except Bill.DoesNotExist:
            return Response({'error': 'Không tìm thấy hóa đơn'}, status=status.HTTP_404_NOT_FOUND)

        try:
            voucher = Voucher.objects.get(code=code, active=True)
        except Voucher.DoesNotExist:
            return Response({'error': 'Mã voucher không tồn tại hoặc đã bị vô hiệu'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        if now < voucher.start_date or now > voucher.end_date:
            return Response({'error': 'Mã voucher đã hết hạn hoặc chưa có hiệu lực'}, status=status.HTTP_400_BAD_REQUEST)

        discount = min(voucher.discount, bill.total_amount)

        bill.voucher = voucher
        bill.discount = discount
        bill.final_amount = bill.total_amount - discount
        bill.save()

        return Response({
            'message': 'Áp dụng voucher thành công',
            'total_amount': bill.total_amount,
            'discount': bill.discount,
            'final_amount': bill.final_amount,
        }, status=status.HTTP_200_OK)


class FoodViewSet(viewsets.ViewSet, generics.ListAPIView,generics.RetrieveAPIView):
    queryset = Food.objects.filter(active=True).order_by('id')
    serializer_class = serializers.FoodSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    pagination_class = paginators.ItemPaginator
    search_fields = ['name']
    ordering_fields = ['id', 'price']

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(name__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            query = query.filter(category__id=cate_id)

        return query

    def get_permissions(self):
        if self.action == 'reviews' and self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'post'], url_path='reviews', detail=True)
    def reviews(self, request, pk):
        if request.method == 'POST':
            s = serializers.FoodReviewSerializer(data={
                'rating': request.data.get('rating'),
                'comment': request.data.get('comment'),
                'customer': request.user.pk,
                'food': pk,
            })
            s.is_valid(raise_exception=True)
            r = s.save()
            return Response(serializers.FoodReviewSerializer(r).data, status=status.HTTP_201_CREATED)

        reviews = self.get_object().reviews.filter(active=True).order_by('-created_date')
        return Response(serializers.FoodReviewSerializer(reviews, many=True).data, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({'error': 'Thiếu token Google'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), os.getenv('GOOGLE_CLIENT_ID')
            )
        except ValueError:
            return Response({'error': 'Token Google không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get('email')
        full_name = idinfo.get('name', '')

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': full_name,
                'phone': '',
            }
        )
        if created:
            user.set_unusable_password()
            user.save()


        application = Application.objects.first()
        access_token = AccessToken.objects.create(
            user=user,
            application=application,
            token=str(uuid.uuid4()).replace('-', ''),
            expires=timezone.now() + timedelta(hours=10),
            scope='read write',
        )

        return Response({
            'access_token': access_token.token,
            'user': {
                'id': user.id,
                'username': user.username,
                 'first_name': user.first_name,
            }
        })

# Create your views here.
