from django import forms
from django.contrib import admin
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
    readonly_fields = ('avatar')
    form = FoodForm

    def avatar(self, food):
            return mark_safe(f'<img src="{food.image.url}" width="150" />')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name','active')
    search_fields = ('name')
    list_filter = ('active')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['sub_total']

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'employee', 'table', 'status', 'order_time']
    list_filter = ['status', 'table']
    search_fields = ['customer__username', 'employee__username']
    inlines = [OrderItemInline]

class ImportReceiptDetailInline(admin.TabularInline):
    model = ImportReceiptDetail
    extra = 0
    readonly_fields = ['sub_total']


class ImportReceiptAdmin(admin.ModelAdmin):
    list_display = ['id', 'supplier', 'employee', 'total_amount', 'created_date']
    list_filter = ['supplier']
    inlines = [ImportReceiptDetailInline]


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0


class BillAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'total_amount', 'discount', 'final_amount', 'voucher']
    inlines = [PaymentInline]


class VoucherAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'discount', 'start_date', 'end_date', 'active']
    search_fields = ['code']

class RestaurantAdminSite(admin.AdminSite):
    site_header = 'Restaurant Management System'

admin_site=RestaurantAdminSite()
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Food)
admin.site.register(RestaurantTable)
admin.site.register(Reservation)
admin.site.register(Ingredient)
admin.site.register(FoodIngredient)
admin.site.register(Supplier)
admin.site.register(ImportReceipt)
admin.site.register(Voucher)


# Register your models here.
