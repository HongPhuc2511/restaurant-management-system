import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Apis, { endpoints } from "../../configs/Apis";

const PromotionDetail = () => {
    const { id } = useParams();
    const [voucher, setVoucher] = useState(null);
    const [copied, setCopied] = useState(false);

    const loadVoucher = async () => {
        let res = await Apis.get(`${endpoints['vouchers']}${id}/`);
        setVoucher(res.data);
    }

    useEffect(() => {
        loadVoucher();
    }, [id]);

    const copyCode = () => {
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    if (!voucher) return <p className="text-center mt-24 text-gray-500">Đang tải...</p>;

    return (
        <div>
            <Header/>

            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-6 py-10">

                    <Link to="/promotions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition mb-6">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Quay lại khuyến mãi
                    </Link>

                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <img src={voucher.image} alt={voucher.code} className="w-full h-72 object-cover" />

                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Giảm {Number(voucher.discount).toLocaleString("vi-VN")}đ
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Hiệu lực đến {new Date(voucher.end_date).toLocaleDateString("vi-VN")}
                            </p>

                            <p className="text-gray-600 mt-5 leading-relaxed whitespace-pre-line">
                                {voucher.description || "Chưa có mô tả chi tiết cho chương trình này."}
                            </p>

                            <div className="mt-8 bg-red-50 border border-dashed border-red-300 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Mã khuyến mãi</p>
                                    <p className="font-mono font-bold text-xl text-red-600 tracking-wide">{voucher.code}</p>
                                </div>
                                <button
                                    onClick={copyCode}
                                    className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
                                >
                                    {copied ? "Đã sao chép ✓" : "Sao chép mã"}
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-4">
                                Nhập mã này ở bước thanh toán trong giỏ hàng để được áp dụng giảm giá.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default PromotionDetail;