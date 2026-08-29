import { useEffect, useState } from "react";
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải danh sách đơn hàng...</div>
        ) : err ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{err}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                  <div>
                    <span className="font-bold text-gray-800">Đơn hàng #{order.id}</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ngày đặt: {order.order_time ? new Date(order.order_time).toLocaleDateString("vi-VN") : "Đang cập nhật"}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                    {order.status || "Đang xử lý"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {order.items?.map((item) => (
                    <div key={item.id || item.food?.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        {item.food?.image && (
                          <img src={item.food.image} alt={item.food.name} className="w-12 h-12 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-700">{item.food?.name || `Món ăn #${item.food}`}</p>
                          <p className="text-gray-400 text-xs">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-800">
                        {Number((item.food?.price || 0) * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm">
                  <p className="text-gray-500 text-xs sm:text-sm truncate">
                     Địa chỉ: <span className="text-gray-700 font-medium">{order.address}</span>
                  </p>
                  <div className="text-right">
                    <span className="text-gray-500 mr-2">Tổng tiền:</span>
                    <span className="text-red-600 font-bold text-base">
                      {Number(order.bill?.final_amount || order.total_amount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyOrder;