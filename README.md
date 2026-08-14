# restaurant-management-system
Hệ thống quản lý nhà hàng toàn diện hỗ trợ đặt bàn trực tuyến, quản lý thực đơn, xử lý đơn hàng và tích hợp thanh toán tự động. Xây dựng dựa trên kiến trúc RESTful API chuẩn mực với **Django REST Framework** backend và **ReactJS** frontend.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-Red?style=for-the-badge&logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/ReactJS-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📌 Mô Tả Dự Án

* **Bài toán**: Số hóa toàn bộ quy trình vận hành nhà hàng từ việc khách hàng xem thực đơn, đặt bàn trực tuyến, thanh toán đến khâu quản lý dành cho Nhân viên (Staff) và Quản trị viên (Admin).
* **Cấu trúc dữ liệu**: Thiết kế cơ sở dữ liệu quan hệ chuẩn hóa gồm **17 Django ORM model classes** (User, Reservation, RestaurantTable, MenuItem, Order, Payment...).
* **Tính năng nổi bật**:
  * **Xác thực & Phân quyền**: Áp dụng OAuth2 (`django-oauth2-toolkit`) phân quyền nghiêm ngặt theo vai trò (**Admin / Staff / Customer**) và hỗ trợ đăng nhập qua **Google OAuth2**.
  * **Tự động hóa luồng đặt bàn**: Tự động chuyển đổi trạng thái bàn (`AVAILABLE` $\leftrightarrow$ `RESERVED`) và gửi email thông báo thời gian thực qua **Gmail SMTP** khi phiếu được tạo, xác nhận hoặc hủy.
  * **Tích hợp dịch vụ**: Cổng thanh toán trực tuyến **VNPay** và lưu trữ hình ảnh món ăn/avatar trên đám mây **Cloudinary**.

---

## 👥 Thành Viên Thực Hiện

| Họ và Tên | Vai Trò Chính |
| :--- | :--- |
| **Hoàng Hồng Phúc** | Full-stack Developer (Backend Architecture & Frontend Integration) |

---

## 🛠️ Công Nghệ Sử Dụng

* **Backend**: Python, Django REST Framework, OAuth2, `django-oauth2-toolkit`
* **Database**: MySQL (Django ORM, MySQL Client)
* **Frontend**: ReactJS, Tailwind CSS
* **Third-Party APIs**: Gmail SMTP API, VNPay Sandbox, Cloudinary API, Google OAuth2
* **Tools & Testing**: Postman (API Testing), `python-dotenv`, Git/GitHub

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống
* **Python** 3.10+
* **Node.js** 18+ & npm
* **MySQL Server**

### 1. Chạy Backend (Django API)
```bash
-Di chuyển vào thư mục backend
cd backend

-Tạo và kích hoạt môi trường ảo (Virtual Environment)
python -m venv .venv
-Trên Windows:
.venv\Scripts\activate
 Trên macOS/Linux:
source .venv/bin/activate

-Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

-Tạo file .env dựa trên file cấu hình mẫu và điền thông số DB/Mail
cp .env.example .env

-Thực thi Migration cơ sở dữ liệu
python manage.py makemigrations
python manage.py migrate

-Khởi chạy server Django
python manage.py runserver
```
### 2. Chạy Frontend (ReactJS)

#### 📋 Yêu cầu chuẩn bị
* **Node.js**: `v18.x` hoặc `v20.x` trở lên
* **npm**: `v9.x` trở lên (đi kèm khi cài Node.js)

#### 🛠️ Các bước cài đặt & chạy dự án

```bash
1. Di chuyển vào thư mục frontend
cd frontend

2. Cài đặt các gói phụ thuộc (node_modules)
npm install
🚀 Khởi chạy ứng dụng
Chạy trên môi trường phát triển (Development):

Bash
-Nếu dùng Vite:
npm run dev

-Hoặc nếu dùng Create React App:
npm start
Sau khi lệnh chạy thành công, mở trình duyệt và truy cập:

Vite: http://localhost:5173/

Create React App: http://localhost:3000/
