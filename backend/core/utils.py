from django.core.mail import send_mail
from django.conf import settings

def send_reservation_email(reservation, action_type="CREATE"):
    recipient_email = getattr(reservation, 'guest_email', None)
    if not recipient_email and reservation.customer:
        recipient_email = reservation.customer.email

    if not recipient_email:
        return

    customer_name = reservation.guest_name
    if not customer_name and reservation.customer:
        customer_name = reservation.customer.get_full_name() or reservation.customer.username
    if not customer_name:
        customer_name = "Quý khách"

    formatted_time = ""
    if reservation.reservation_time:
        formatted_time = reservation.reservation_time.strftime("%H:%M ngày %d/%m/%Y")

    table_number = f"Bàn {reservation.table.number}" if reservation.table else "Sẽ được xếp khi đến"

    if action_type == "CREATE":
        subject = "Nhà hàng Ẩm thực Việt Xác nhận yêu cầu đặt bàn"
        message = f"""Xin chào {customer_name},

Cảm ơn bạn đã đặt bàn tại Nhà Hàng Ẩm thực Việt! Yêu cầu của bạn đã được ghi nhận.

THÔNG TIN ĐẶT BÀN:
- Mã phiếu: #{reservation.id}
- Thời gian: {formatted_time}
- Số lượng: {reservation.number_of_people} người
- Vị trí: {table_number}
- Ghi chú: {reservation.note or 'Không có'}

Bộ phận nhà hàng sẽ kiểm tra và xác nhận sớm nhất.
"""
    elif action_type == "CONFIRM":
        subject = "Nhà hàng Ẩm thực Việt Đặt bàn đã ĐƯỢC XÁC NHẬN"
        message = f"""Xin chào {customer_name},

Phiếu đặt bàn #{reservation.id} của bạn đã được nhân viên nhà hàng XÁC NHẬN thành công.

Rất hân hạnh được phục vụ bạn vào lúc {formatted_time}.
"""
    elif action_type == "CANCEL":
        subject = "Nhà hàng Ẩm thực Việt thông báo HỦY đặt bàn"
        message = f"""Xin chào {customer_name},

Phiếu đặt bàn #{reservation.id} của bạn vào lúc {formatted_time} đã bị HỦY.
Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ trực tiếp qua Hotline nhà hàng.
"""
    else:
        return

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=True
    )