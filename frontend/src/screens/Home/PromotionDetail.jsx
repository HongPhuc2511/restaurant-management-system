import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Apis, { endpoints } from "../../configs/Apis";

const PromotionDetail = () => {
    const { id } = useParams();
    const [voucher, setVoucher] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadVoucher = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(`${endpoints['vouchers']}${id}/`);
            setVoucher(res.data);
        } catch (ex) {
            console.error("Lỗi tải thông tin voucher:", ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVoucher();
    }, [id]);

    const copyCode = () => {
        if (!voucher?.code) return;
        navigator.clipboard.writeText(voucher.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const isExpired = voucher?.end_date ? new Date(voucher.end_date) < new Date() : false;

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
                <Header />
                <div className="max-w-3xl mx-auto px-4 py-12 w-full animate-pulse">
                    <div className="w-32 h-6 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="w-full h-64 bg-gray-200 rounded-2xl mb-6"></div>
                        <div className="w-1/2 h-8 bg-gray-200 rounded-md mb-3"></div>
                        <div className="w-1/3 h-4 bg-gray-200 rounded-md mb-6"></div>
                        <div className="w-full h-20 bg-gray-100 rounded-2xl"></div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
                <Header />
                <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500 font-medium">Không tìm thấy thông tin khuyến mãi.</p>
                    <Link to="/promotions" className="inline-block mt-4 text-sm font-bold text-red-600 hover:underline">
                        Quay lại danh sách khuyến mãi
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
            <Header />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
                {/* Nút quay lại */}
                <Link to="/promotions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition mb-6 group">
                    <span className="p-1.5 rounded-full bg-white group-hover:bg-red-50 border border-gray-200 group-hover:border-red-200 transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </span>
                    Quay lại danh sách khuyến mãi
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {voucher.image && (
                        <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-gray-100">
                            <img src={voucher.image} alt={voucher.code} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                                    isExpired ? "bg-gray-800 text-white" : "bg-emerald-600 text-white"
                                }`}>
                                    {isExpired ? "Đã hết hạn" : "Đang áp dụng"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                    Giảm {Number(voucher.discount).toLocaleString("vi-VN")}đ
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Hạn sử dụng: {new Date(voucher.end_date).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Chi tiết ưu đãi</h3>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                {voucher.description || "Chưa có mô tả chi tiết cho chương trình này."}
                            </p>
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-dashed border-red-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                            <div className="w-full sm:w-auto text-center sm:text-left">
                                <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Mã giảm giá của bạn</span>
                                <span className="font-mono font-black text-2xl sm:text-3xl text-red-600 tracking-wider">
                                    {voucher.code}
                                </span>
                            </div>

                            <button
                                onClick={copyCode}
                                disabled={isExpired}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
                                    isExpired
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        : copied
                                        ? "bg-emerald-600 text-white shadow-emerald-200"
                                        : "bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-red-200"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Đã sao chép!
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Sao chép mã
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-4 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Áp dụng mã này tại bước thanh toán trong giỏ hàng để nhận giảm giá.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PromotionDetail;