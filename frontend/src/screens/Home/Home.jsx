import { useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis"; 
import { Link } from "react-router-dom"; 
import BrandIntro from "../../components/BrandIntro";
import imgMonChinh from "../../assets/monan.webp"
import imgLau from "../../assets/nuoclaucate.webp"
import imgNuocCham from "../../assets/nuocham.webp"
import imgNuocUong from "../../assets/nuocuongcate.webp"
import imgDoAnVat from "../../assets/doannhanh.webp"

const Home = () => {
  const [categories, setCategories] = useState([]);

  const categoryImages = {
    "Món chính": imgMonChinh, "Nước lẩu": imgLau,"Nước chấm": imgNuocCham ,"Đồ ăn vặt": imgDoAnVat,"Nước uống": imgNuocUong,
};
  const loadCategories = async () => {
    try {
      let res = await Apis.get(endpoints['categories']);
      const data = res.data.results || res.data;
      
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((c) => (
                <Link
                    to={`/menu?categoryId=${c.id}`}
                    key={c.id}
                    className="flex flex-col group cursor-pointer">
                    <div className="overflow-hidden rounded-[2rem] aspect-[3/4] mb-5 shadow-lg bg-gray-100">
                        <img
                            src={categoryImages[c.name] || "https://via.placeholder.com/300x400?text=No+Image"}   
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