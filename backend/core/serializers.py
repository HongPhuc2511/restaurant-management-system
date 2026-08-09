from rest_framework import serializers
from core.models import *

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data=super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model= Category
        fields = ['id', 'name','description','image','active']

    def to_representation(self, instance):
        data=super().to_representation(instance)
        if instance.image:
           data['image'] = instance.image.url
        return data

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model= Food
        fields = ['id', 'name','price','description','image','category','active']

    def to_representation(self, instance):
        data=super().to_representation(instance)
        if instance.image:
           data['image'] = instance.image.url
        return data

class FoodDetailSerializer(FoodSerializer):
    category = CategorySerializer(read_only=True)
    class Meta:
        model=FoodSerializer.Meta.model
        fields=FoodSerializer.Meta.fields

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','first_name','last_name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=SimpleUserSerializer.Meta.model
        fields=SimpleUserSerializer.Meta.fields+['phone','password','role']
        extra_kwargs={'password':{'write_only':True}}

    def create(self, validated_data):
        user=User(**validated_data)
        user.set_password(user.password)
        user.save()
        return user

class FoodReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model=FoodReview
        fields=['id','rating','comment','customer','food','created_date']
        extra_kwargs={'customer':{'write_only':True}}

        def to_representation(self, instance):
            data=super().to_representation(instance)
            data['customer'] = SimpleUserSerializer(instance.customer).data
            return data

class RestaurantTableSerializer(serializers.ModelSerializer):
    class Meta:
        model=RestaurantTable
        fields=('id','number','capacity','status','active')

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Reservation
        fields=['id','reservation_time','number_of_people','status','note','customer','table']
        read_only_fields=['status']

    def to_representation(self, instance):
        data=super().to_representation(instance)
        data['table']=RestaurantTableSerializer(instance.table).data if instance.table else None
        return data

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrderItem
        fields=['id','food','quantity','unit_price','subtotal']
        read_only_fields=['unit_price','subtotal']

    def to_representation(self, instance):
        data=super().to_representation(instance)
        data['food']=FoodDetailSerializer(instance.food).data
        return data

class OrderSerializer(serializers.ModelSerializer):
    items=OrderItemSerializer(many=True)
    class Meta:
        model=Order
        fields=['id','order_time','status','note','address','customer','employee','table','reservation','items']
        read_only_fields=['customer','status','employee']

    def to_representation(self, instance):
            data=super().to_representation(instance)
            data['table']=RestaurantTableSerializer(instance.table).data if instance.table else None
            data['customer']=SimpleUserSerializer(instance.customer).data if instance.customer else None
            if hasattr(instance,'bill'):
                data['bill']=BillSerializer(instance.bill).data
            return data

    def create(self, validated_data):
            items_data=validated_data.pop('items')
            order=Order.objects.create(**validated_data)

            order_items=[]
            for item in items_data:
                food=item['food']
                oi=OrderItem(order=order,food=food,quantity=item['quantity'],unit_price=food.price)
                oi.subtotal=oi.quantity*oi.unit_price

                order_items.append(oi)
            OrderItem.objects.bulk_create(order_items)

            total = sum(oi.subtotal for oi in order_items)
            Bill.objects.create(order=order,total_amount=total,
                                discount=0,final_amount=total,)
            return order

    def update(self, instance, validated_data):
            validated_data.pop('items')
            return super().update(instance, validated_data)

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = ['id', 'order', 'total_amount', 'discount', 'final_amount']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'bill', 'amount', 'payment_method', 'payment_status', 'paid_at']
        read_only_fields = ['payment_status', 'paid_at']

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['id', 'code', 'discount', 'start_date', 'end_date', 'image', 'description', 'active']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data


class FoodReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodReview
        fields = ['id', 'rating', 'comment', 'customer', 'food', 'created_date']
        extra_kwargs = {
            'customer': {'write_only': True},
            'food': {'write_only': True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['customer'] = SimpleUserSerializer(instance.customer).data
        return data

