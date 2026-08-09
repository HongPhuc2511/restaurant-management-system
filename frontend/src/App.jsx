import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Menu from "./screens/Home/Menu";
import background from "./assets/bg.webp";
import Footer from "./components/Footer";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import { MyUserContext, MyCartContext } from "./configs/Contexts";
import { MyUserReducer, MyCartReducer } from "./reducers/reducers";
import { useReducer } from "react";
import Home from "./screens/Home/Home";
import Reservation from "./screens/Home/Reservation";
import Cart from "./screens/Home/Cart";
import VnPayReturn from "./screens/Home/VnPayReturn";
import MyReservation from "./screens/Home/MyReservation";
import FoodDetail from "./screens/Home/FoodDetail";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Promotions from "./screens/Home/Promotions";
import PromotionDetail from "./screens/Home/PromotionDetail";

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, cartDispatch] = useReducer(MyCartReducer, []);

  console.log("[" + import.meta.env.VITE_GOOGLE_CLIENT_ID + "]");
  console.log("Length:", import.meta.env.VITE_GOOGLE_CLIENT_ID.length);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <MyUserContext.Provider value={[user, dispatch]}>
        <MyCartContext.Provider value={[cart, cartDispatch]}>
          <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <div
                    className="min-h-screen bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${background})` }}>
                    <Header />
                  </div>
                  <Home/>
                  <Footer />
                </div>
              }
            />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reservation" element={<Reservation/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/vnpay-return" element={<VnPayReturn />} />
            <Route path="/my-reservation" element={<MyReservation />} />
            <Route path="/foods/:id" element={<FoodDetail />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/promotions/:id" element={<PromotionDetail />} />
          </Routes>
        </BrowserRouter>
        </MyCartContext.Provider>
      </MyUserContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default App;