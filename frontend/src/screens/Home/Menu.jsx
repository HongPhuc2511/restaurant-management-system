import { useState } from "react";
import Header from "../../components/Header";
import CategoryList from "../../components/CategoryList";
import FoodList from "../../components/FoodList";
import Footer from "../../components/Footer";

const Menu=()=>{
  const[cateId,setCateId]=useState(null);
  const [q, setQ] = useState(""); 
  
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
 
        <CategoryList cateId={cateId} setCateId={setCateId} />

        <FoodList cateId={cateId}/>
 
      </div>
      <Footer/>
    </div>
  );
};
 
export default Menu;
