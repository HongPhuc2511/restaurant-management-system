import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { authApis, endpoints } from "../../configs/Apis";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErr("Vui lòng đăng nhập để xem đơn hàng!");
          return;
        }
        const res = await authApis(token).get(endpoints["orders"]);
        setOrders(res.data.results || res.data);
      } catch (ex) {
        console.error(ex);
        setErr("Không thể tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Hàm hiển thị Badge trạng thái tương ứng với sắc thái màu
  const renderStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Chờ xử lý", style: "bg-amber-50 text-amber-700 border-amber-200" },
      CONFIRMED: { label: "Đã xác nhận", style: "bg-blue-50 text-blue-700 border-blue-200" },
      DELIVERING: { label: "Đang giao", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      COMPLETED: { label: "Hoàn thành", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", style: "bg-rose-50 text-rose-700 border-rose-200" },
    };

    const currentStatus = statusMap[status?.toUpperCase()] || {
      label: status || "Đang xử lý",
      style: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.style}`}>
        {currentStatus.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Tiêu đề & Tổng số đơn */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Đơn hàng của tôi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Quản lý và theo dõi lịch sử đặt món của bạn
            </p>
          </div>
          {!loading && !err && orders.length > 0 && (
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {orders.length} đơn hàng
            </span>
          )}
        </div>

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                  <div className="w-32 h-5 bg-gray-200 rounded"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-48 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : err ? (
          /* Trạng thái Lỗi */
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center">
            <p className="text-sm font-semibold">{err}</p>
            <Link to="/login" className="inline-block mt-3 text-xs font-bold text-red-600 underline">
              Đăng nhập ngay
            </Link>
          </div>
        ) : orders.length === 0 ? (
          /* Trạng thái Chưa có đơn hàng */
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Bạn chưa có đơn hàng nào</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Hãy thưởng thức những món ăn thơm ngon tại nhà hàng của chúng tôi ngay hôm nay!
            </p>
            <Link
              to="/menu"
              className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 active:scale-95"
            >
              Khám phá thực đơn
            </Link>
          </div>
        ) : (
          /* Danh sách Đơn hàng */
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 hover:shadow-md transition duration-300"
              >
                {/* Header card đơn hàng */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
                      #{order.id}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Mã đơn: #{order.id}</span>
                      <p className="text-xs text-gray-400 font-medium">
                        {order.order_time ? new Date(order.order_time).toLocaleString("vi-VN") : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                {/* Danh sách món ăn trong đơn */}
                <div className="py-4 space-y-3.5">
                  {order.items?.map((item) => (
                    <div key={item.id || item.food?.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.food?.image ? (
                          <img
                            src={item.food.image}
                            alt={item.food.name}
                            className="w-14 h-14 object-cover rounded-2xl border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {item.food?.name || `Món ăn #${item.food}`}
                          </p>
                          <p className="text-gray-400 text-xs font-medium mt-0.5">
                            Số lượng: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 text-sm shrink-0 ml-4">
                        {Number((item.food?.price || 0) * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer card: Địa chỉ & Tổng tiền */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">
                      Địa chỉ: <strong className="text-gray-700 font-semibold">{order.address || "Nhận tại nhà hàng"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <span className="text-xs font-medium text-gray-500">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-red-600 tracking-tight">
                      {Number(order.bill?.final_amount || order.total_amount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrder;