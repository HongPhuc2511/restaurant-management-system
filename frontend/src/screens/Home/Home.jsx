import { useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis"; 
import { Link } from "react-router-dom"; 
import BrandIntro from "../../components/BrandIntro";

const Home = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      let res = await Apis.get(endpoints['categories']);
      // Nếu API trả về phân trang thì dùng res.data.results, nếu không thì dùng res.data
      const data = res.data.results || res.data;
      
      // Lấy 5 danh mục đầu tiên để hiển thị thành 5 cột như ý tưởng của bạn
      setCategories(data.slice(0, 5));
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="bg-white min-h-screen py-16">
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
            Danh Mục Nổi Bật
          </h2>
          <p className="text-gray-500 mt-2">Khám phá các hương vị đặc trưng của nhà hàng</p>
        </div>

        {/* Cấu trúc Grid chia 5 cột trên màn hình lớn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((c) => (
            /* Link bọc ngoài để khi click vào danh mục sẽ chuyển hướng sang trang Menu */
            <Link 
              to={`/menu?categoryId=${c.id}`} 
              key={c.id} 
              className="flex flex-col group cursor-pointer"
            >
              {/* Khung ảnh: bo góc lớn (rounded-[2rem]) và giữ tỷ lệ đứng (aspect-[3/4]) */}
              <div className="overflow-hidden rounded-[2rem] aspect-[3/4] mb-5 shadow-lg bg-gray-100">
                <img
                  src={c.image || "https://via.placeholder.com/300x400?text=No+Image"}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed text-justify line-clamp-4">
                {c.description || "Hương vị truyền thống đa dạng, đậm đà, mang đến trải nghiệm thơm ngon và trọn vị cho bữa ăn của bạn."}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <BrandIntro/>
    </div>
  );
}

export default Home;