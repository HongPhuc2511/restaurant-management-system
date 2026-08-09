import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom";
import Apis, { endpoints } from "../configs/Apis";
import { MyCartContext } from "../configs/Contexts";

const FoodList = ({ cateId }) => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [, cartDispatch] = useContext(MyCartContext);
    const [note, setNote] = useState("");

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    const loadFoods = async () => {
        setLoading(true);
        try {
            let url = `${endpoints['foods']}?page=${page}`; 
            if (cateId !== null) url += `&category_id=${cateId}`;

            let res = await Apis.get(url);
            setFoods(res.data.results);
            setHasNext(res.data.next !== null);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPage(1);
    }, [cateId]);

    useEffect(() => {
        loadFoods();
    }, [cateId, page]);

    const addToCart = (food) => {
        cartDispatch({ type: "ADD_ITEM", payload: { food, quantity: 1 } });
        setNote(`Đã thêm "${food.name}" vào giỏ hàng!`);
        setTimeout(() => setNote(""), 2000);
    }

    if (loading)
        return <p className="mt-6 text-center">Đang tải...</p>;
    if (foods.length === 0)
        return <p className="text-gray-500 mt-6 text-center">Không có món ăn nào.</p>;

    return (
      <div className="relative">
          {note && (
              <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-50">
                  {note}
              </div>
          )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-6">
            {foods.map((food, index) => (
                <div
                    key={food.id}
                    className="food-card-animate rounded-2xl overflow-hidden shadow-md bg-white min-h-[400px] flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    style={{ animationDelay: `${index * 80}ms` }}>
                    <img src={food.image} alt={food.name} className="w-full h-64 object-cover" />

                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">{food.name}</h2>
                            <Link to={`/foods/${food.id}`} className="text-red-600 text-sm font-medium hover:underline shrink-0">
                                Chi tiết
                            </Link>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <p className="text-red-600 font-bold">
                                {Number(food.price).toLocaleString("vi-VN")}đ
                            </p>
                            <button onClick={() => addToCart(food)} className="bg-red-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-red-700 transition">
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
                Trước
            </button>
            <span className="text-sm text-gray-600">Trang {page}</span>
            <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext}
                className="px-4 py-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
                Sau
            </button>
        </div>
      </div>
    );
}

export default FoodList;