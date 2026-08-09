from django import forms
from django.contrib import admin
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from core.models import *

class FoodForm(forms.ModelForm):
    class Meta:
        model = Food
        fields='__all__'

class FoodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price','category','active')
    search_fields = ('name','price','category')
    list_filter = ('category','active')
    readonly_fields = ('avatar',)
    form = FoodForm

    def avatar(self, food):
            return mark_safe(f'<img src="{food.image.url}" width="150" />')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name','active')
    search_fields = ('name',)
    list_filter = ('active',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('food', 'quantity', 'unit_price', 'subtotal')
    readonly_fields = ('subtotal',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = ('id', 'customer', 'table', 'status', 'get_total_amount', 'order_time')
    list_filter = ('status', 'order_time')
    search_fields = ('id', 'customer__username', 'address')
    ordering = ('-order_time',)
    readonly_fields = ('get_total_amount',)
    inlines = [OrderItemInline]

    def get_total_amount(self, obj):
        total = sum(item.subtotal for item in obj.items.all() if item.subtotal)
        return f"{total:,.0f} VNĐ"

    get_total_amount.short_description = "Tổng tiền"

class ImportReceiptDetailInline(admin.TabularInline):
    model = ImportReceiptDetail
    extra = 0
    readonly_fields = ['sub_total']


class ImportReceiptAdmin(admin.ModelAdmin):
    list_display = ['id', 'supplier', 'employee', 'total_amount', 'created_date']
    list_filter = ['supplier']
    inlines = [ImportReceiptDetailInline]

class ReservationInline(admin.TabularInline):
    model = Reservation
    extra = 0
    can_delete = False
    fields = ('customer', 'guest_name', 'guest_phone', 'reservation_time', 'number_of_people', 'status')
    readonly_fields = ('reservation_time',)


@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ('number', 'capacity', 'status')
    list_filter = ('status',)
    search_fields = ('number',)
    list_editable = ('status',)
    inlines = [ReservationInline]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_customer_info',
        'guest_phone',
        'table',
        'reservation_time',
        'number_of_people',
        'status'
    )
    list_filter = ('status', 'reservation_time')
    search_fields = ('guest_name', 'guest_phone', 'customer__username', 'customer__email')
    readonly_fields = ('reservation_time',)

    @admin.display(description='Tên khách hàng')
    def get_customer_info(self, obj):
        if obj.customer:
            return obj.customer.username
        return obj.guest_name or "Khách vãng lai"

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ('paid_at',)
    can_delete = False

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'bill_link', 'amount_formatted', 'payment_method_badge', 'payment_status_badge', 'paid_at')
    list_filter = ('payment_method', 'payment_status', 'paid_at')
    search_fields = ('bill__id', 'bill__order__id')

    def bill_link(self, obj):
        return f"Hóa đơn #{obj.bill.id} (Đơn #{obj.bill.order.id})"
    bill_link.short_description = "Hóa Đơn"

    def amount_formatted(self, obj):
        return f"{obj.amount:,.0f} VNĐ"
    amount_formatted.short_description = "Số Tiền"

    def payment_method_badge(self, obj):
        color = "#17a2b8" if obj.payment_method == "VNPAY" else "#6c757d"
        return format_html(f'<span style="background-color: {color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{obj.payment_method}</span>')
    payment_method_badge.short_description = "P.Thức Thanh Toán"

    # Badge màu cho Trạng thái thanh toán
    def payment_status_badge(self, obj):
        colors = {
            'SUCCESS': '#28a745',
            'PENDING': '#ffc107',
            'FAILED': '#dc3545',
        }
        color = colors.get(obj.payment_status, '#6c757d')
        text_color = "black" if obj.payment_status == "PENDING" else "white"
        return format_html(f'<span style="background-color: {color}; color: {text_color}; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{obj.get_payment_status_display()}</span>')
    payment_status_badge.short_description = "Trạng Thái"

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_link', 'total_amount_formatted', 'final_amount_formatted', 'discount', 'created_date')
    list_filter = ('created_date',)
    search_fields = ('id', 'order__id')
    inlines = [PaymentInline]

    def order_link(self, obj):
        return f"Đơn hàng #{obj.order.id}"
    order_link.short_description = "Mã Đơn Hàng"

    def total_amount_formatted(self, obj):
        return f"{obj.total_amount:,.0f} VNĐ"
    total_amount_formatted.short_description = "Tổng Tiền"

    def final_amount_formatted(self, obj):
        return f"{obj.final_amount:,.0f} VNĐ"
    final_amount_formatted.short_description = "Thực Thu"


class VoucherAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'discount', 'start_date', 'end_date', 'active']
    search_fields = ['code']

class RestaurantAdminSite(admin.AdminSite):
    site_header = 'Restaurant Management System'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('restaurant-stats/', self.admin_view(self.restaurant_stats), name='restaurant_stats'),
        ]
        return custom_urls + urls

    def restaurant_stats(self, request):
        revenue_by_month = (
            Payment.objects.filter(payment_status=enums.PaymentStatus.SUCCESS)
            .annotate(month=TruncMonth('paid_at'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        top_foods = (
            Food.objects.annotate(sold=Sum('order_items__quantity'))
            .filter(sold__isnull=False)
            .order_by('-sold')[:5]
            .values('id', 'name', 'sold')
        )

        orders_by_status = (
            Order.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        reservations_by_status = (
            Reservation.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        total_revenue = Payment.objects.filter(
            payment_status=enums.PaymentStatus.SUCCESS
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role=enums.Role.USER).count()

        return TemplateResponse(request, 'admin/restaurant_stats.html', {
            'revenue_by_month': revenue_by_month,
            'top_foods': top_foods,
            'orders_by_status': orders_by_status,
            'reservations_by_status': reservations_by_status,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_customers': total_customers,
        })

class FoodReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'food', 'customer', 'rating_stars', 'short_comment', 'active', 'created_date')
    list_filter = ('rating', 'active', 'created_date')
    search_fields = ('food__name', 'customer__username', 'comment')
    list_editable = ('active',)
    readonly_fields = ('created_date',)
    ordering = ('-created_date',)

    def rating_stars(self, obj):
        stars = '⭐' * int(obj.rating) if obj.rating else ''
        return format_html(f'<span style="white-space: nowrap;">{stars} <b>({obj.rating}/5)</b></span>')

    rating_stars.short_description = "Đánh Giá"

    def short_comment(self, obj):
        if obj.comment and len(obj.comment) > 40:
            return f"{obj.comment[:40]}..."
        return obj.comment or "-"

    short_comment.short_description = "Nội Dung Bình Luận"

admin_site=RestaurantAdminSite()
admin_site.register(User)
admin_site.register(Category,CategoryAdmin)
admin_site.register(Food,FoodAdmin)
admin_site.register(RestaurantTable,RestaurantTableAdmin)
admin_site.register(Reservation,ReservationAdmin)
admin_site.register(Ingredient)
admin_site.register(FoodIngredient)
admin_site.register(Supplier)
admin_site.register(ImportReceipt,ImportReceiptAdmin)
admin_site.register(Voucher,VoucherAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Bill, BillAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(FoodReview,FoodReviewAdmin)


# Register your models here.
