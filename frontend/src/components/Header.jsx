import logo from "../assets/logo.png"
import { Link,useNavigate ,useLocation} from "react-router-dom";
import { useContext } from "react";
import { MyUserContext,MyCartContext } from "../configs/Contexts";

const menuItems = [
  { name: "Trang chủ", path: "/" },
  { name: "Thực đơn", path: "/menu" },
  { name: "Khuyến mãi", path: "/promotions" },
  { name: "Đặt bàn", path: "/reservation" },
];

function Header(){
    const [user, dispatch] = useContext(MyUserContext);
    const nav = useNavigate();
    const [cart, cartDispatch] = useContext(MyCartContext);   
    const location=useLocation();
    const isHome = location.pathname === "/"; 
 
    const logout = () => {
        dispatch({ type: "LOGOUT" });
        cartDispatch({ type: "CLEAR_CART" });  
        localStorage.removeItem('token');
        nav("/");
    }
    return(
        <header className={isHome
            ? "absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/60 to-transparent"
            : "sticky top-0 z-50 bg-white shadow-md"}>
            <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between ${isHome ? "text-white" : "text-gray-800"}`}>
                <div className="w-16 h-16  overflow-hidden">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover"/>
                </div>

            <nav className="flex items-center gap-x-10">
                {menuItems.map((item,index)=>(
                    <Link key={index} to={item.path} className={`relative group text-xl font-bold ${isHome ? "text-white" : "text-gray-800"}`}>{item.name}
                    <span className={`absolute left-0 -bottom-1 w-full h-0.5 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isHome ? "bg-white" : "bg-red-600"}`}></span>
                    </Link>
                ))}
            </nav>

                <div className="flex items-center gap-x-3 shrink-0">
                    <Link to="/cart" className="relative">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Link>
                    {user === null ? (
                        <>
                            <Link to="/login" state={{ from: location.pathname }} className={`text-sm font-bold px-6 py-2 border rounded-full transition-all duration-300 ${isHome ? "text-white hover:bg-white hover:text-red-600 hover:border-white" : "text-gray-800 border-gray-300 hover:bg-gray-100"}`}>
                                Đăng nhập
                            </Link>
                            <Link to="/register" className={`text-sm font-bold px-6 py-2 border rounded-full transition-all duration-300 ${isHome ? "text-white hover:bg-white hover:text-red-600 hover:border-white" : "text-gray-800 border-gray-300 hover:bg-gray-100"}`}>
                                Đăng ký
                            </Link>
                        </>
                    ) : (
                        <>  
                            <Link to="/my-reservation" className={`text-sm font-bold hover:text-orange-400 transition ${isHome ? "text-white" : "text-gray-800"}`}>
                                Lịch sử đặt bàn
                            </Link>
                            <span className={`text-sm font-bold max-w-[140px] truncate block" title={user.username} ${isHome ? "text-white" : "text-gray-800"}`}>
                                Xin chào, {user.username}
                            </span>
                            <button onClick={logout} className={`text-sm font-bold px-6 py-2 border rounded-full transition-all duration-300 ${isHome ? "text-white hover:bg-white hover:text-red-600 hover:border-white" : "text-gray-800 border-gray-300 hover:bg-gray-100"}`}>
                                Đăng xuất
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header