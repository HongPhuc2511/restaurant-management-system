import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext, MyCartContext } from "../../configs/Contexts";

const StarIcon = ({ filled }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
);

const FoodDetail = () => {
    const { id } = useParams();
    const [user] = useContext(MyUserContext);
    const [, cartDispatch] = useContext(MyCartContext);

    const [food, setFood] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [added, setAdded] = useState(false);

    const loadFood = async () => {
        let res = await Apis.get(`${endpoints['foods']}${id}/`);
        setFood(res.data);
    }

    const loadReviews = async () => {
        let res = await Apis.get(`${endpoints['foods']}${id}/reviews/`);
        setReviews(res.data);
    }

    useEffect(() => {
        loadFood();
        loadReviews();
    }, [id]);

    const addToCart = () => {
        cartDispatch({ type: "ADD_ITEM", payload: { food, quantity: 1 } });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    }

    const submitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setErr("Vui lòng nhập nội dung bình luận!");
            return;
        }

        setErr("");
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await authApis(token).post(`${endpoints['foods']}${id}/reviews/`, { rating, comment });
            setComment("");
            setRating(5);
            loadReviews();
        } catch (ex) {
            console.error(ex);
            setErr("Gửi bình luận thất bại, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (!food) return <p className="text-center mt-24 text-gray-500">Đang tải...</p>;

    return (
        <div>
            <Header/>

            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-6 py-10">

                    <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition mb-6">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Quay lại thực đơn
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Bên trái - ảnh món ăn */}
                        <div className="bg-white rounded-2xl shadow-md p-3">
                            <img src={food.image} alt={food.name} className="w-full aspect-square object-cover rounded-xl" />
                        </div>

                        {/* Bên phải - thông tin + đánh giá */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <h1 className="text-2xl font-bold text-gray-800">{food.name}</h1>

                                {avgRating && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= Math.round(avgRating)} />)}
                                        <span className="text-sm text-gray-500 ml-1">{avgRating} ({reviews.length} đánh giá)</span>
                                    </div>
                                )}

                                <p className="text-red-600 font-bold text-2xl mt-3">
                                    {Number(food.price).toLocaleString("vi-VN")}đ
                                </p>
                                <p className="text-gray-600 mt-3 leading-relaxed">
                                    {food.description || "Chưa có mô tả cho món này."}
                                </p>

                                <button
                                    onClick={addToCart}
                                    className="mt-5 w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-md shadow-red-200"
                                >
                                    {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ"}
                                </button>
                            </div>

                            {/* Bình luận */}
                            <div className="bg-white rounded-2xl shadow-md p-6 mt-5">
                                <h2 className="font-semibold text-gray-800 mb-4">Bình luận ({reviews.length})</h2>

                                <div className="flex flex-col gap-4 mb-5 max-h-64 overflow-y-auto pr-1">
                                    {reviews.length === 0 && (
                                        <p className="text-sm text-gray-400">Chưa có bình luận nào.</p>
                                    )}
                                    {reviews.map(r => (
                                        <div key={r.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                {r.customer.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm text-gray-800">{r.customer.username}</span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= r.rating} />)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-0.5">{r.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {user === null ? (
                                    <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3 text-center">
                                        Đăng nhập để bình luận về món này.
                                    </p>
                                ) : (
                                    <form onSubmit={submitReview} className="flex flex-col gap-2.5 pt-4 border-t">
                                        {err && <p className="text-red-600 text-xs">{err}</p>}

                                        <select
                                            value={rating}
                                            onChange={e => setRating(Number(e.target.value))}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            {[5, 4, 3, 2, 1].map(n => (
                                                <option key={n} value={n}>{n} sao</option>
                                            ))}
                                        </select>

                                        <textarea
                                            rows={2}
                                            placeholder="Viết bình luận..."
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-red-600 text-white text-sm py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                        >
                                            {loading ? "Đang gửi..." : "Gửi bình luận"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default FoodDetail;