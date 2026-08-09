import logo from "../assets/logo.png"

function Footer() {
  const quickLinksLeft = ["Trang chủ", "Thực đơn", "Chi nhánh", "Khuyến mãi"];
  const quickLinksRight = ["Tuyển dụng", "Về Haidilao", "Thành viên", "Liên hệ"];

  return (
    <footer className="bg-[#121212] text-[#e0e0e0] pt-12 pb-6 px-4 font-sans border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-zinc-800">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white p-1">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Nhà hàng lẩu Haidilao</h3>
                <p className="text-xs text-zinc-400">海底捞火锅</p>
              </div>
            </div>
            
            <div className="text-sm space-y-2 text-zinc-300 pt-2">
              <p><strong className="text-white">Địa chỉ:</strong> Lô 09,10,11,12 Tầng 2, TTTM ICON 68, số 2, đường Hải Triều, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam</p>
              <p><strong className="text-white">Email:</strong> ynkfzxb@haidilao.com</p>
            </div>
          </div>

          <div className="md:pl-12">
            <h4 className="text-lg font-bold text-white mb-4">Truy cập nhanh</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="flex flex-col gap-y-3">
                {quickLinksLeft.map((link, index) => (
                  <a key={index} href="#" className="hover:text-white transition-colors duration-200">{link}</a>
                ))}
              </div>
              <div className="flex flex-col gap-y-3">
                {quickLinksRight.map((link, index) => (
                  <a key={index} href="#" className="hover:text-white transition-colors duration-200">{link}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-y-4">
            <div className="flex gap-x-6 items-start">
              <div>
                <p className="text-xs font-bold text-white mb-2 text-center md:text-left">QUÉT MÃ QR</p>
                <div className="w-24 h-24 bg-white p-1 rounded-sm">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Haidilao" alt="QR Code" className="w-full h-full" />
                </div>
              </div>
              
              <div className="flex flex-col gap-y-2">
                <p className="text-xs font-bold text-white mb-1">TẢI ỨNG DỤNG</p>
                <a href="#" className="flex items-center gap-x-2 bg-black border border-zinc-700 px-3 py-1.5 rounded-md hover:border-zinc-500 transition-all w-36">
                  <span className="text-xs text-white font-medium">✨ App Store</span>
                </a>
                <a href="#" className="flex items-center gap-x-2 bg-black border border-zinc-700 px-3 py-1.5 rounded-md hover:border-zinc-500 transition-all w-36">
                  <span className="text-xs text-white font-medium">🤖 Google Play</span>
                </a>
              </div>
            </div>

            <div className="flex gap-x-3 pt-2">
              {['FB', 'Zalo', 'IG', 'Tiktok', 'Web'].map((social, idx) => (
                <a key={idx} href="#" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 text-xs text-zinc-400">
          <div className="space-y-1">
            <p className="uppercase font-semibold text-zinc-300">Công ty TNHH Hai Di Lao Việt Nam Holdings - Chi nhánh Thành phố Hồ Chí Minh</p>
            <p>Mã số DN: 0108392659-001</p>
            <p>© 2026 Haidilao Vietnam mọi quyền bảo lưu</p>
          </div>
          
          <div className="flex items-center gap-x-4 self-end md:self-auto">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-zinc-500 cursor-pointer">
              <option>Tiếng Việt 🇻🇳</option>
              <option>English 🇬🇧</option>
            </select>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;