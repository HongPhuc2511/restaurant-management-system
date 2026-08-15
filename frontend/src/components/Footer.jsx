import logo from "../assets/logo.png"
import { Link } from "react-router-dom";

function Footer() {
  const quickLinksLeft = [
    { name: "Trang chủ", path: "/" },
    { name: "Thực đơn", path: "/menu" },
    { name: "Khuyến mãi", path: "/promotions" },
    { name: "Đặt bàn", path: "/reservation" },
  ];
  const quickLinksRight = [
    { name: "Giỏ hàng", path: "/cart" },
    { name: "Lịch sử đặt bàn", path: "/my-reservation" },
    { name: "Đăng nhập", path: "/login" },
    { name: "Đăng ký", path: "/register" },
  ];

  return (
    <footer className="bg-[#121212] text-[#e0e0e0] pt-12 pb-6 px-4 font-sans border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-zinc-800">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white p-1">
                <img src={logo} alt="Logo Nhà Hàng ABC" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Nhà Hàng Ẩm thực Việt</h3>
                <p className="text-xs text-zinc-400">Ẩm thực Việt Nam</p>
              </div>
            </div>

            <div className="text-sm space-y-2 text-zinc-300 pt-2">
              <p><strong className="text-white">Địa chỉ:</strong> Thành phố Hồ Chí Minh, Việt Nam</p>
              <p><strong className="text-white">Điện thoại:</strong> 0359 880 031</p>
              <p><strong className="text-white">Email:</strong> hoanghongphucgl123@gmail.com</p>
            </div>
          </div>

          <div className="md:pl-12">
            <h4 className="text-lg font-bold text-white mb-4">Truy cập nhanh</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="flex flex-col gap-y-3">
                {quickLinksLeft.map((link, index) => (
                  <Link key={index} to={link.path} className="hover:text-white transition-colors duration-200">{link.name}</Link>
                ))}
              </div>
              <div className="flex flex-col gap-y-3">
                {quickLinksRight.map((link, index) => (
                  <Link key={index} to={link.path} className="hover:text-white transition-colors duration-200">{link.name}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-y-4">
            <div>
              <p className="text-xs font-bold text-white mb-2 text-center md:text-left">GIỜ MỞ CỬA</p>
              <p className="text-sm text-zinc-300">Thứ 2 - Chủ nhật</p>
              <p className="text-sm text-zinc-300">9:00 - 22:00</p>
            </div>

            <div className="flex gap-x-3 pt-2">
              {['FB', 'Zalo', 'IG', 'Tiktok'].map((social, idx) => (
                <a key={idx} href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 text-xs text-zinc-400">
          <div className="space-y-1">
            <p className="uppercase font-semibold text-zinc-300">Nhà Hàng Ẩm thực Việt</p>
            <p>© 2026 Nhà Hàng Ẩm thực Việt. Mọi quyền được bảo lưu.</p>
          </div>

          <div className="flex items-center gap-x-4 self-end md:self-auto">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;