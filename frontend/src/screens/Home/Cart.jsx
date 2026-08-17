import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MyUserContext, MyCartContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";

const Cart = () => {
  const [cart, cartDispatch] = useContext(MyCartContext);
  const [user] = useContext(MyUserContext);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [billId, setBillId] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");
  const [address, setAddress] = useState("");

  const nav = useNavigate();
  const location = useLocation();
  const total = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  const updateQuantity = (foodId, quantity) => {
    cartDispatch({ type: "UPDATE_QUANTITY", payload: { foodId, quantity } });
  };

  const removeItem = (foodId) => {
    cartDispatch({ type: "REMOVE_ITEM", payload: foodId });
  };

  const createOrder = async () => {
    if (user === null) {
      nav(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (cart.length === 0) return;

    if (!address.trim()) {
      setErr("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    setErr("");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Đã thêm address vào payload
      const orderData = {
        address: address,
        items: cart.map((item) => ({ food: item.food.id, quantity: item.quantity })),
      };

      const resOrder = await authApis(token).post(endpoints["orders"], orderData);
      setBillId(resOrder.data.bill.id);
      setFinalAmount(resOrder.data.bill.final_amount);
    } catch (ex) {
      console.error(ex);
      setErr(ex.response?.data?.message || "Đặt món thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode) return;
    setVoucherMsg("");
    try {
      const token = localStorage.getItem("token");
      let res = await authApis(token).post(endpoints["apply-voucher"], {
        bill_id: billId,
        code: voucherCode,
      });
      setDiscount(res.data.discount);
      setFinalAmount(res.data.final_amount);
      setVoucherMsg("Áp dụng mã thành công!");
    } catch (ex) {
      setVoucherMsg(ex.response?.data?.error || "Mã voucher không hợp lệ");
    }
  };

  const confirmPayment = async () => {
    setErr("");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (paymentMethod === "VNPAY") {
        const resPay = await authApis(token).post(endpoints["create-vnpay"], {
          order_id: billId,
          amount: finalAmount,
        });
        cartDispatch({ type: "CLEAR_CART" });
        if (resPay.data && resPay.data.payment_url) {
          window.location.href = resPay.data.payment_url;
        } else {
          setErr("Không thể tạo liên kết thanh toán VNPAY!");
        }
      } else {
        await authApis(token).post(endpoints["payments"], {
          bill: billId,
          amount: finalAmount,
          payment_method: "CASH",
        });
        cartDispatch({ type: "CLEAR_CART" });
        nav("/orders");
      }
    } catch (ex) {
      console.error(ex);
      setErr("Thanh toán thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Progress Step */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 ${billId === null ? "text-red-600" : "text-gray-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${billId === null ? "bg-red-600 text-white" : "bg-gray-200"}`}>1</div>
              <span className="font-medium text-sm">Giỏ hàng</span>
            </div>
            <div className="w-10 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${billId !== null ? "text-red-600" : "text-gray-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${billId !== null ? "bg-red-600 text-white" : "bg-gray-200"}`}>2</div>
              <span className="font-medium text-sm">Thanh toán</span>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-5">
              {err}
            </div>
          )}

          {cart.length === 0 && billId === null ? (
            <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mx-auto mb-4">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-gray-500">Giỏ hàng đang trống.</p>
            </div>
          ) : billId === null ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột bên trái: Danh sách món ăn và Ô địa chỉ */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <div key={item.food.id} className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-4">
                      <img src={item.food.image} alt={item.food.name} className="w-20 h-20 object-cover rounded-lg" />

                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-800 truncate">{item.food.name}</h2>
                        <p className="text-red-600 font-medium text-sm mt-0.5">
                          {Number(item.food.price).toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateQuantity(item.food.id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 transition">-</button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.food.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 transition">+</button>
                      </div>

                      <button onClick={() => removeItem(item.food.id)} className="text-gray-400 hover:text-red-500 transition shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Khung địa chỉ nhận hàng được đưa vào đây */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhận hàng</label>
                  <input
                    type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Cột bên phải: Chọn thanh toán & Tổng tiền */}
              <div className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>

                <div className="flex flex-col gap-2 mb-6">
                  <label className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${paymentMethod === "COD" ? "border-red-500 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-red-600" />
                    <span className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${paymentMethod === "VNPAY" ? "border-red-500 bg-red-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === "VNPAY"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-red-600" />
                    <span className="text-sm font-medium">VNPAY (ATM / QR Code)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex items-center justify-between font-bold text-lg mt-2 mb-5">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{total.toLocaleString("vi-VN")}đ</span>
                </div>

                <button
                  onClick={createOrder}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-md shadow-red-200"
                >
                  {loading ? "Đang xử lý..." : "Đặt món"}
                </button>
              </div>
            </div>
          ) : (
            /* Màn hình Xác nhận Voucher và Hoàn tất thanh toán */
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8">
              <p className="text-sm text-gray-500 mb-5">Đơn hàng đã tạo. Nhập mã giảm giá (nếu có) rồi xác nhận thanh toán:</p>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(t) => setVoucherCode(t.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
                <button onClick={applyVoucher} className="bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition">
                  Áp dụng
                </button>
              </div>
              {voucherMsg && (
                <p className={`text-sm mb-4 ${discount > 0 ? "text-green-600" : "text-red-600"}`}>{voucherMsg}</p>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6 mt-4">
                <div className="flex justify-between mb-1">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-red-600 text-base pt-2 mt-2 border-t border-gray-200">
                  <span>Thành tiền</span>
                  <span>{finalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <button
                onClick={confirmPayment}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-md shadow-red-200"
              >
                {loading ? "Đang xử lý..." : `Xác nhận thanh toán (${paymentMethod === "VNPAY" ? "VNPAY" : "COD"})`}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;