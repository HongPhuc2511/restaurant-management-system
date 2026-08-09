import { useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";
import foodImg from "../assets/tatca.webp"

const CategoryList = ({ cateId, setCateId }) => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    let res = await Apis.get(endpoints['categories']);
    setCategories(res.data);
  }

  useEffect(() => {
    loadCategories()
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-6">
        <button
        onClick={() => setCateId(null)}
        className={`w-40 rounded-lg border bg-amber-50 overflow-hidden transition flex flex-col items-center justify-center
          ${cateId === null ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-red-300"}`}>
        <div className="w-full h-24 flex items-center justify-center bg-gray-50">
          <img src={foodImg} alt="Tất cả" className="w-full h-full object-cover"/>
        </div>
        <p className="text-center text-sm font-semibold text-red-600 py-2 px-1">Tất cả</p>
      </button>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => setCateId(c.id === cateId ? null : c.id)}
          className={`w-40 rounded-lg border bg-amber-50 overflow-hidden transition
            ${c.id === cateId ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-red-300"}`}>
          
          <div className="relative">
            <img src={c.image} alt={c.name} className="w-full h-24 object-cover"/>
          </div>
          
          <p className="text-center text-sm font-semibold text-red-600 py-2 px-1">
            {c.name}
          </p>
        </button>
      ))}
    </div>
  );
}

export default CategoryList;