from django.db import models

class Role(models.TextChoices):
    ADMIN = 'admin','Người quản trị'
    USER = 'user','Người dùng'
    STAFF = 'staff','Nhân viên'

class ImportReceiptStatus(models.TextChoices):
    PENDING = "PENDING", "Chờ xử lý"
    DONE = "DONE", "Hoàn tất"
    CANCELLED = "CANCELLED", "Đã hủy"


class TableStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Trống"
    OCCUPIED = "OCCUPIED", "Đang dùng"
    RESERVED = "RESERVED", "Đã đặt"


class ReservationStatus(models.TextChoices):
    PENDING = "PENDING", "Chờ xác nhận"
    CONFIRMED = "CONFIRMED", "Đã xác nhận"
    CANCELLED = "CANCELLED", "Đã hủy"


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Chờ xử lý"
    PREPARING = "PREPARING", "Đang chế biến"
    SERVED = "SERVED", "Đã phục vụ"
    COMPLETED = "COMPLETED", "Hoàn tất"
    CANCELLED = "CANCELLED", "Đã hủy"


class PaymentMethod(models.TextChoices):
    MOMO = "MOMO", "Momo"
    VNPAY = "VNPAY", "VNPay"
    CASH = "CASH", "Tiền mặt"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Chờ thanh toán"
    SUCCESS = "SUCCESS", "Thành công"
    FAILED = "FAILED", "Thất bại"