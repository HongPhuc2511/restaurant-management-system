import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Apis, { endpoints } from "../../configs/Apis";

const Promotions = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            let res = await Apis.get(endpoints['vouchers']);
            setVouchers(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVouchers();
        // console.log(`/promotions/${v.id}`);
    }, []);

    return (
        <div>
            <Header/>

            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-2">Khuyến mãi</p>
                        <h1 className="text-3xl font-bold text-gray-800">Chương trình khuyến mãi</h1>
                    </div>

                    {loading && <p className="text-center text-gray-500">Đang tải...</p>}

                    {!loading && vouchers.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <p className="text-gray-500">Hiện chưa có chương trình khuyến mãi nào.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        {vouchers.map(v => (
                            <Link
                                key={v.id}
                                to={`/promotions/${v.id}`}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex hover:shadow-md transition"
                            >
                                {/* Ảnh - bên trái */}
                                <img
                                    src={v.image}
                                    alt={v.code}
                                    className="w-60 h-60 object-cover shrink-0"
                                />

                                {/* Thông tin - bên phải */}
                                <div className="p-5 flex flex-col justify-center">
                                    <p className="font-bold text-gray-800 text-lg">
                                        Giảm {Number(v.discount).toLocaleString("vi-VN")}đ
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {v.description || "Áp dụng cho đơn hàng tại nhà hàng."}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        HSD: {new Date(v.end_date).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Promotions;