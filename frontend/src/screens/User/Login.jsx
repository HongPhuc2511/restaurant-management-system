import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { GoogleLogin } from '@react-oauth/google';
import background from "../../assets/nhahang.webp"; 

const Login = () => {
  const userInfo = [
    {
      field: 'username',
      label: 'Tên đăng nhập',
    }, 
    {
      field: 'password',
      label: 'Mật khẩu',
      secureTextEntry: true,
    }
  ];

  const [user, setUser] = useState({});
  const [err, setErr] = useState();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const [, dispatch] = useContext(MyUserContext);
  const from = location.state?.from || "/";

  const validate = () => {
    for (var i of userInfo)
      if (!(i.field in user) || !user[i.field]) {
        setErr(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    return true;
  }

  const login = async (e) => {
    e.preventDefault();
    if (validate() === true) {
      setErr("");
      try {
        setLoading(true);
        let form = new URLSearchParams();
        form.append('username', user.username);
        form.append('password', user.password);
        form.append("client_id", import.meta.env.VITE_CLIENT_ID);
        form.append("client_secret", import.meta.env.VITE_CLIENT_SECRET);
        form.append("grant_type", "password");

        let res = await Apis.post(endpoints['login'], form);
        localStorage.setItem('token', res.data.access_token);
        let u = await authApis(res.data.access_token).get(endpoints['current-user']);
        dispatch({ "type": "LOGIN", "payload": u.data });
        nav(from, { replace: true });
      } catch (ex) {
        setErr("Đăng nhập thất bại, vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setErr("");
    try {
      let res = await Apis.post(endpoints['google-login'], {
        credential: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.access_token);
      dispatch({ type: "LOGIN", payload: res.data.user });
      nav(from, { replace: true });
    } catch (ex) {
      setErr("Đăng nhập Google thất bại!");
    }
  }

  return (
    <div>
      <Header />
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-24"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${background})` }}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={login} className="flex flex-col gap-4">
            {userInfo.map(i => (
              <div key={i.field}>
                <input
                  type={i.secureTextEntry ? "password" : "text"}
                  placeholder={i.label}
                  value={user[i.field] || ""}
                  onChange={t => setUser({ ...user, [i.field]: t.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-md shadow-red-200"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErr("Đăng nhập Google thất bại!")}
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-red-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;