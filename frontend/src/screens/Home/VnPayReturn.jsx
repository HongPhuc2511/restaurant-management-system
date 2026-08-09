import { useEffect, useState,useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apis, { endpoints } from "../../configs/Apis";

const VNPayReturn = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("processing");
    const called = useRef(false); // THÊM: chặn gọi API lần 2

    useEffect(() => {
        if (called.current) return; // THÊM: nếu đã gọi rồi thì dừng luôn
        called.current = true;       // THÊM: đánh dấu đã gọi

        const verifyPayment = async () => {
            const responseCode = searchParams.get("vnp_ResponseCode");
            const txnRef = searchParams.get("vnp_TxnRef");
            const amount = searchParams.get("vnp_Amount");

            if (!responseCode || !txnRef) {
                setStatus("failed");
                return;
            }

            if (responseCode === "00") {
                try {
                    await apis.post(endpoints['vnpay-callback'], {
                        vnp_ResponseCode: responseCode,
                        vnp_TxnRef: txnRef,
                        vnp_Amount: amount
                    });
                    setStatus("success");
                } catch (error) {
                    console.error("Lỗi cập nhật payment:", error);
                    setStatus("failed");
                }
            } else {
                setStatus("failed");
            }
        };

        verifyPayment();
    }, []); // SỬA: đổi từ [searchParams] thành [] - chỉ chạy đúng 1 lần khi mount

    return (
        <div className="max-w-md mx-auto my-20 p-6 bg-white rounded-lg shadow-md text-center">
            {status === "processing" && (
                <div className="py-4">
                    <p className="text-gray-500">Đang kiểm tra và cập nhật đơn hàng...</p>
                </div>
            )}

            {status === "success" && (
                <div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                    <p className="text-gray-600 mb-6">Hóa đơn và thanh toán đã được lưu vào hệ thống.</p>
                </div>
            )}

            {status === "failed" && (
                <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h2>
                    <p className="text-gray-600 mb-6">Giao dịch bị hủy hoặc không thể cập nhật thanh toán.</p>
                </div>
            )}

            <Link to="/" className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Về trang chủ
            </Link>
        </div>
    );
};

export default VNPayReturn;