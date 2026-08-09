import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";

const statusLabel = {
    PENDING: { text: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { text: "Đã xác nhận", color: "bg-green-100 text-green-700" },
    CANCELLED: { text: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const MyReservation = () => {
    const [user] = useContext(MyUserContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadReservations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let res = await authApis(token).get(endpoints['reservations']);
            setReservations(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReservations();
    }, []);

    if (user === null) return <Navigate to="/login" replace />;

    return (
        <div>
            <Header/>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-2xl font-bold mb-6">Lịch sử đặt bàn của tôi</h1>

                {loading && <p>Đang tải...</p>}

                {!loading && reservations.length === 0 && (
                    <p className="text-gray-500">Bạn chưa có lượt đặt bàn nào.</p>
                )}

                <div className="flex flex-col gap-4">
                    {reservations.map(r => (
                        <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">
                                    {new Date(r.reservation_time).toLocaleString("vi-VN")}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {r.number_of_people} người
                                    {r.table?.number && ` · Bàn ${r.table.number}`}
                                </p>
                                {r.note && <p className="text-sm text-gray-500 mt-1">Ghi chú: {r.note}</p>}
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabel[r.status]?.color}`}>
                                {statusLabel[r.status]?.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default MyReservation;