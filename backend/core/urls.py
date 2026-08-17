from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core import views
from core.views import CreateVNPAYPaymentView, VNPayCallbackView, ApplyVoucherView, GoogleLoginView, PaymentView

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('foods', views.FoodViewSet, basename='food')
router.register('users', views.UserViewSet, basename='user')
router.register('tables', views.RestaurantTableViewSet, basename='table')
router.register('reservations', views.ReservationViewSet, basename='reservation')
router.register('orders', views.OrderViewSet, basename='order')
router.register('vouchers', views.VoucherViewSet, basename='voucher')

urlpatterns = [
    path('payments/', PaymentView.as_view(), name='payments'),
    path('payment/create-vnpay/', CreateVNPAYPaymentView.as_view(), name='create-vnpay'),
    path('payment/vnpay-callback/', VNPayCallbackView.as_view(), name='vnpay-callback'),
    path('vouchers/apply/', ApplyVoucherView.as_view(), name='apply-voucher'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('', include(router.urls)),
]