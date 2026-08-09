import hashlib
import hmac
import urllib.parse


class VNPAY:
    def __init__(self):
        self.responseData = {}

    def get_payment_url(self, payment_url, secret_key, params):
        # 1. Sắp xếp các tham số theo thứ tự alphabet (Bắt buộc với VNPAY)
        sorted_params = sorted(params.items())

        # 2. Tạo chuỗi query string
        has_data = False
        seq = ""
        for k, v in sorted_params:
            if v is not None and len(str(v)) > 0:
                if has_data:
                    seq += '&' + f"{k}={urllib.parse.quote_plus(str(v))}"
                else:
                    seq += f"{k}={urllib.parse.quote_plus(str(v))}"
                    has_data = True

        # 3. Tạo chữ ký SHA512
        hash_value = hmac.new(
            secret_key.encode('utf-8'),
            seq.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        return f"{payment_url}?{seq}&vnp_SecureHash={hash_value}"

    def validate_response(self, secret_key, request_params):
        # Kiểm tra chữ ký khi VNPAY trả kết quả về
        vnp_SecureHash = request_params.get('vnp_SecureHash', '')

        # Loại bỏ các tham số hash ra khỏi danh sách kiểm tra
        has_data = False
        seq = ""
        sorted_params = sorted(request_params.items())

        for k, v in sorted_params:
            if k != "vnp_SecureHash" and k != "vnp_SecureHashType" and v is not None and len(str(v)) > 0:
                if has_data:
                    seq += '&' + f"{k}={urllib.parse.quote_plus(str(v))}"
                else:
                    seq += f"{k}={urllib.parse.quote_plus(str(v))}"
                    has_data = True

        hash_value = hmac.new(
            secret_key.encode('utf-8'),
            seq.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        return hash_value.lower() == vnp_SecureHash.lower()