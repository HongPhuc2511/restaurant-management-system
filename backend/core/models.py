from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from core import enums


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class User(AbstractUser):
    role=models.CharField(max_length=20,choices=enums.Role.choices,default=enums.Role.USER)
    phone=models.CharField(max_length=15)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table='users'

    def __str__(self):
        return self.username

class Category(BaseModel):
    name=models.CharField(max_length=100)
    description=models.TextField(blank=True)

    class Meta:
        db_table='categories'

    def __str__(self):
        return self.name

class Food(BaseModel):
    name=models.CharField(max_length=100)
    price=models.DecimalField(decimal_places=0,max_digits=12)
    description=models.TextField(blank=True)
    image=CloudinaryField(null=True)
    category=models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,related_name='food')

    class Meta:
        db_table='foods'

    def __str__(self):
        return self.name

class FoodReview(BaseModel):
    rating=models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment=models.TextField(blank=True)
    customer=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='reviews')
    food=models.ForeignKey(Food,on_delete=models.CASCADE,related_name='reviews')

    class Meta:
        db_table='food_reviews'

class RestaurantTable(BaseModel):
    number=models.IntegerField()
    capacity=models.IntegerField()
    status=models.CharField(max_length=20,choices=enums.TableStatus.choices,default=enums.TableStatus.AVAILABLE)

    class Meta:
        db_table='restaurant_tables'

    def __str__(self):
        return f"Bàn {self.number}"

class Reservation(BaseModel):
    reservation_time=models.DateTimeField()
    number_of_people=models.IntegerField()
    status=models.CharField(max_length=20,choices=enums.ReservationStatus.choices,default=enums.ReservationStatus.PENDING)
    note=models.TextField(blank=True)
    customer=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='reservations')
    table=models.ForeignKey(RestaurantTable,on_delete=models.SET_NULL,null=True,related_name='reservations')

    class Meta:
        db_table='reservations'

class Ingredient(BaseModel):
    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=20)
    quantity = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    price = models.DecimalField(max_digits=12, decimal_places=0, default=0)

    class Meta:
        db_table = "ingredients"

    def __str__(self):
        return self.name

class FoodIngredient(BaseModel):
    food=models.ForeignKey(Food,on_delete=models.CASCADE,related_name='ingredients')
    ingredient=models.ForeignKey(Ingredient,on_delete=models.PROTECT,related_name='food_ingredients')
    quantity = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    class Meta:
        db_table = "food_ingredients"
        unique_together = (('food', 'ingredient'),)

class Supplier(BaseModel):
    name=models.CharField(max_length=50)
    phone=models.CharField(max_length=15)
    address=models.CharField(max_length=50)

    class Meta:
        db_table='suppliers'

    def __str__(self):
        return self.name

class ImportReceipt(BaseModel):
    supplier=models.ForeignKey(Supplier,on_delete=models.PROTECT,related_name='import_receipts')
    employee=models.ForeignKey(User,on_delete=models.PROTECT,related_name='import_receipts')
    total_amount=models.DecimalField(max_digits=10, decimal_places=0,default=0)
    note=models.TextField(blank=True)

    class Meta:
        db_table='import_receipts'

    def __str__(self):
        return f"Phiếu nhập {self.pk} - {self.supplier.name}"

class ImportReceiptDetail(BaseModel):
    receipt=models.ForeignKey(ImportReceipt,on_delete=models.CASCADE,related_name='details')
    ingredient=models.ForeignKey(Ingredient, on_delete=models.PROTECT,related_name='import_details')
    quantity=models.DecimalField(max_digits=10, decimal_places=0,default=0)
    unit_price=models.DecimalField(max_digits=10, decimal_places=0,default=0)
    sub_total=models.DecimalField(max_digits=10, decimal_places=0,default=0)

    class Meta:
        db_table='import_receipt_details'
        unique_together = ('receipt', 'ingredient')


class Order(BaseModel):
    order_time=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=20,choices=enums.OrderStatus.choices,default=enums.OrderStatus.PENDING)
    note=models.TextField(blank=True)
    customer=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='orders_customer')
    table=models.ForeignKey(RestaurantTable,on_delete=models.SET_NULL,null=True,related_name='orders')
    employee=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name='orders_employee')
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, null=True, blank=True,related_name='orders')

    class Meta:
        db_table='orders'

class OrderItem(BaseModel):
    order=models.ForeignKey(Order,on_delete=models.CASCADE,related_name='items')
    food=models.ForeignKey(Food,on_delete=models.PROTECT,related_name='order_items')
    quantity=models.DecimalField(max_digits=10, decimal_places=1,default=0)
    unit_price=models.DecimalField(max_digits=10, decimal_places=0,default=0)
    subtotal=models.DecimalField(max_digits=10, decimal_places=0,default=0)

    class Meta:
        db_table='order_items'

class Voucher(BaseModel):
    code=models.CharField(max_length=20,unique=True)
    discount=models.DecimalField(max_digits=6,decimal_places=0,default=0)
    start_date=models.DateTimeField()
    end_date=models.DateTimeField()

    class Meta:
        db_table='vouchers'

    def __str__(self):
        return self.code

class Bill(BaseModel):
    order=models.OneToOneField(Order,on_delete=models.CASCADE,related_name='bill')
    total_amount=models.DecimalField(max_digits=10, decimal_places=0,default=0)
    discount=models.DecimalField(max_digits=6,decimal_places=0,default=0)
    final_amount=models.DecimalField(max_digits=10,decimal_places=0,default=0)
    voucher=models.ForeignKey(Voucher,on_delete=models.SET_NULL,null=True,related_name='bills')

    class Meta:
        db_table='bills'

    def __str__(self):
        return f"Hóa đơn{self.order}"

class Payment(BaseModel):
    bill=models.ForeignKey(Bill,on_delete=models.PROTECT,related_name='payments')
    amount=models.DecimalField(max_digits=10,decimal_places=0,default=0)
    payment_method=models.CharField(max_length=20,choices=enums.PaymentMethod.choices,default=enums.PaymentMethod.CASH)
    payment_status=models.CharField(max_length=20,choices=enums.PaymentStatus.choices,default=enums.PaymentStatus.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table='payments'
# Create your models here.
