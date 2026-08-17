import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"
import img1 from "../assets/brandintro1.webp"
import img2 from "../assets/brandintro2.webp"
import img3 from "../assets/brandintro4.webp"

const images = [img1,img2,img3];

const BrandIntro = () => {
    const [index, setIndex] = useState(0);

    const prev = () => setIndex(i => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setIndex(i => (i === images.length - 1 ? 0 : i + 1));

    useEffect(() => {
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer); 
    }, [index]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            <div>
                <p className="text-xs font-bold text-gray-500 tracking-wide uppercase mb-2">
                    Thương hiệu nhà hàng lẩu chuẩn vị
                </p>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16  overflow-hidden">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover"/>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600">Nhà Hàng Ẩm thực Việt</h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Nhà Hàng Ẩm thực Việt mang đến trải nghiệm ẩm thực đậm đà với thực đơn được
                    tuyển chọn kỹ lưỡng và không gian ấm cúng, phù hợp cho gia đình,
                    bạn bè cùng tụ họp.
                </p>
                <div className="flex gap-3">
                    <Link
                        to="/reservation"
                        className="bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-700 transition shadow-md shadow-red-200">
                        Đặt bàn ngay
                    </Link>
                    <Link
                        to="/menu"
                        className="border border-red-600 text-red-600 px-6 py-2.5 rounded-full font-semibold hover:bg-red-50 transition"
                    >
                        Xem thực đơn
                    </Link>
                </div>
            </div>

            <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-xl aspect-[7/5]">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`Nhà hàng ${i + 1}`}
                            className={`rounded-2xl w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
                                i === index ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md transition"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md transition"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>

                <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                                i === index ? "w-6 bg-red-600" : "w-2 bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BrandIntro;