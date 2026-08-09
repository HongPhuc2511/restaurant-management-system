import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Apis, { endpoints } from "../../configs/Apis";
import background from "../../assets/nhahang.webp";

const Register = () => {
  const userInfo = [
    { field: 'full_name', label: 'Họ và tên' },
    { field: 'username', label: 'Tên đăng nhập' },
    { field: 'phone', label: 'Số điện thoại' },
    { field: 'password', label: 'Mật khẩu', secureTextEntry: true },
    { field: 'comfirm', label: 'Xác nhận mật khẩu', secureTextEntry: true }
  ];

  const [user, setUser] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    for (let i of userInfo) {
      if (!(i.field in user) || !user[i.field]?.trim()) {
        setErr(`Vui lòng nhập ${i.label.toLowerCase()}!`);
        return false;
      }
    }

    if (user.password !== user.comfirm) {
      setErr("Mật khẩu xác nhận không khớp!");
      return false;
    }
    return true;
  };

  const register = async (e) => {
    e.preventDefault();
    if (validate()) {
      setErr("");
      try {
        setLoading(true);
        let form = {};
        for (let key of Object.keys(user)) {
          if (key !== 'comfirm') form[key] = user[key];
        }
        let res = await Apis.post(endpoints['register'], form);
        if (res.status === 201) {
          nav("/login");
        } else {
          setErr("Hệ thống có lỗi, vui lòng thử lại!");
        }
      } catch (ex) {
        console.error(ex);
        setErr("Đăng ký thất bại, vui lòng kiểm tra lại thông tin!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Header />
      
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-24"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${background})` }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 my-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h1>
            <p className="text-sm text-gray-500 mt-1">Tạo tài khoản để trải nghiệm dịch vụ nhà hàng</p>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3.5 py-2.5 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={register} className="flex flex-col gap-4">
            {userInfo.map((i) => (
              <div key={i.field}>
                <input
                  type={i.secureTextEntry ? "password" : "text"}
                  placeholder={i.label}
                  value={user[i.field] || ""}
                  onChange={(t) => setUser({ ...user, [i.field]: t.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-gray-50/50 focus:bg-white"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-md shadow-red-200 mt-2 active:scale-[0.99]"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-red-600 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;