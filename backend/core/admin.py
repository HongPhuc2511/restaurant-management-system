import json

from django import forms
from django.contrib import admin
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDay, TruncQuarter
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.dateparse import parse_date
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from core.models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'phone', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'phone')
    list_editable = ('role',)

class FoodForm(forms.ModelForm):
    class Meta:
        model = Food
        fields='__all__'

class FoodIngredientInline(admin.TabularInline):
    model = FoodIngredient
    extra = 1

class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit', 'stock_status', 'price', 'active')
    search_fields = ('name',)
    list_filter = ('active', 'unit')

    def stock_status(self, obj):
        color = "red" if obj.quantity <= 10 else "green"
        return format_html(
            '<span style="color:{}; font-weight:bold;">{} {}</span>',
            color, obj.quantity, obj.unit
        )

    stock_status.short_description = "Tồn kho"

class FoodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price','category','active')
    search_fields = ('name','price','category')
    list_filter = ('category','active')
    readonly_fields = ('avatar',)
    form = FoodForm
    inlines = [FoodIngredientInline]

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
    list_display = ('id', 'supplier', 'employee', 'total_amount', 'active', 'created_date')
    list_filter = ('active', 'supplier')
    search_fields = ('supplier__name',)
    inlines = [ImportReceiptDetailInline]
    readonly_fields = ('total_amount',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "employee":
            kwargs["queryset"] = User.objects.filter(role__in=[enums.Role.ADMIN, enums.Role.STAFF])
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_formset(self, request, form, formset, change):
        instances = formset.save()
        receipt = form.instance
        total = sum(d.sub_total for d in receipt.details.all())
        receipt.total_amount = total
        receipt.save()

    def save_model(self, request, obj, form, change):
        if not obj.employee_id:
            obj.employee = request.user
        super().save_model(request, obj, form, change)

class ReservationInline(admin.TabularInline):
    model = Reservation
    extra = 0
    can_delete = False
    fields = ('customer', 'guest_name', 'guest_phone', 'reservation_time', 'number_of_people', 'status')
    readonly_fields = ('reservation_time',)

class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ('number', 'capacity', 'status')
    list_filter = ('status',)
    search_fields = ('number',)
    list_editable = ('status',)
    inlines = [ReservationInline]

class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id','get_customer_info','guest_phone','table',
        'reservation_time', 'number_of_people','status')
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

class SupplierAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'address', 'active')
    search_fields = ('name', 'phone')
    list_filter = ('active',)

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
        group_by = request.GET.get('group_by', 'month')
        start_date_str = request.GET.get('start_date', '')
        end_date_str = request.GET.get('end_date', '')

        payments = Payment.objects.filter(payment_status=enums.PaymentStatus.SUCCESS)

        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                payments = payments.filter(paid_at__date__gte=start_date)

        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                payments = payments.filter(paid_at__date__lte=end_date)

        if group_by == 'day':
            trunc_func = TruncDay('paid_at')
        elif group_by == 'quarter':
            trunc_func = TruncQuarter('paid_at')
        else:
            group_by = 'month'
            trunc_func = TruncMonth('paid_at')

        revenue_qs = (
            payments.annotate(period=trunc_func)
            .values('period')
            .annotate(total=Sum('amount'))
            .order_by('period')
        )

        revenue_labels = []
        for r in revenue_qs:
            p = r['period']
            if not p:
                continue
            if group_by == 'day':
                revenue_labels.append(p.strftime('%d/%m/%Y'))
            elif group_by == 'quarter':
                quarter_num = (p.month - 1) // 3 + 1
                revenue_labels.append(f"Q{quarter_num}/{p.year}")
            else:
                revenue_labels.append(p.strftime('%m/%Y'))

        revenue_data = [float(r['total']) for r in revenue_qs if r['period']]

        top_foods_qs = (
            Food.objects.annotate(sold=Sum('order_items__quantity'))
            .filter(sold__isnull=False)
            .order_by('-sold')[:5]
        )
        top_food_labels = [f.name for f in top_foods_qs]
        top_food_data = [float(f.sold) for f in top_foods_qs]

        orders_by_status = (
            Order.objects.values('status').annotate(count=Count('id')).order_by('-count')
        )
        status_labels = [o['status'] for o in orders_by_status]
        status_data = [o['count'] for o in orders_by_status]

        low_stock_ingredients = (
            Ingredient.objects.filter(active=True, quantity__lte=10)
            .order_by('quantity')
            .values('id', 'name', 'unit', 'quantity')
        )

        total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role=enums.Role.USER).count()

        return TemplateResponse(request, 'admin/restaurant_stats.html', {
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_customers': total_customers,
            'low_stock_ingredients': low_stock_ingredients,
            'revenue_labels': revenue_labels,
            'revenue_data': revenue_data,
            'top_food_labels': top_food_labels,
            'top_food_data': top_food_data,
            'status_labels': status_labels,
            'status_data': status_data,
            'selected_group_by': group_by,
            'start_date': start_date_str,
            'end_date': end_date_str,
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
admin_site.register(User,UserAdmin)
admin_site.register(Category,CategoryAdmin)
admin_site.register(Food,FoodAdmin)
admin_site.register(RestaurantTable,RestaurantTableAdmin)
admin_site.register(Reservation,ReservationAdmin)
admin_site.register(Ingredient,IngredientAdmin)
admin_site.register(Supplier,SupplierAdmin)
admin_site.register(ImportReceipt,ImportReceiptAdmin)
admin_site.register(Voucher,VoucherAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Bill, BillAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(FoodReview,FoodReviewAdmin)


# Register your models here.
