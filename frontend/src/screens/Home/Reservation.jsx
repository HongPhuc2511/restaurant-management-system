import { useEffect, useState,useContext } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Apis, {authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import background from "../../assets/nhahang.webp";

const Reservation=()=>{
    const [user] = useContext(MyUserContext);
    const [tables, setTables] = useState([]);
    const [form, setForm] = useState({});
    const [err, setErr] = useState();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadTables = async () => {
        let res = await Apis.get(endpoints['available-tables']);
        setTables(res.data);
    }

    useEffect(() => {
        loadTables();
    }, []);

    const validate = () => {
        const required = [
            { field: 'guest_name', label: 'Họ tên' },
            { field: 'guest_phone', label: 'Số điện thoại' },
            { field: 'reservation_time', label: 'Thời gian đến' },
            { field: 'number_of_people', label: 'Số người' },
        ];

        for (let i of required)
            if (!form[i.field]) {
                setErr(`Vui lòng nhập ${i.label}!`);
                return false;
            }

        if (!form.table) {
            setErr("Vui lòng chọn bàn!");
            return false;
        }

        return true;
    }

    const reserve = async (e) => {
        e.preventDefault();
        if (validate() === true) {
            setErr("");
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const api = token ? authApis(token) : Apis;

                await api.post(endpoints['reservations'], form);
                setSuccess(true);
                setForm({});
            } catch (ex) {
                console.error(ex);
                setErr("Đặt bàn thất bại, vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div>
            <Header/>
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-24"
                    style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${background})` }}>
                <div className="bg-gradient-to-b from-red-50 to-white min-h-screen rounded-3xl">
                    <div className="max-w-2xl mx-auto px-6 pt-20 pb-16">

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Đặt bàn</h1>
                            <p className="text-sm text-gray-500 mt-2">Không cần đăng nhập, chỉ cần điền thông tin bên dưới</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {err && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-5">
                                    {err}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5 mb-5 flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <path d="M22 4L12 14.01l-3-3" />
                                    </svg>
                                    Đặt bàn thành công! Chờ nhân viên xác nhận.
                                </div>
                            )}

                            <form onSubmit={reserve} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên</label>
                                        <input
                                            type="text"
                                            value={form.guest_name || ""}
                                            onChange={t => setForm({ ...form, guest_name: t.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={form.guest_phone || ""}
                                            onChange={t => setForm({ ...form, guest_phone: t.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                            placeholder="09xxxxxxxx"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời gian đến</label>
                                        <input
                                            type="datetime-local"
                                            value={form.reservation_time || ""}
                                            onChange={t => setForm({ ...form, reservation_time: t.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Số người</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.number_of_people || ""}
                                            onChange={t => setForm({ ...form, number_of_people: t.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                            placeholder="2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn bàn</label>
                                    <select
                                        value={form.table || ""}
                                        onChange={t => setForm({ ...form, table: t.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
                                    >
                                        <option value="">-- Chọn bàn trống --</option>
                                        {tables.map(table => (
                                            <option key={table.id} value={table.id}>
                                                Bàn {table.number} (sức chứa {table.capacity} người)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú (tùy chọn)</label>
                                    <textarea
                                        rows={3}
                                        value={form.note || ""}
                                        onChange={t => setForm({ ...form, note: t.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                                        placeholder="Ví dụ: cần ghế trẻ em, gần cửa sổ..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-md shadow-red-200 mt-1"
                                >
                                    {loading ? "Đang xử lý..." : "Xác nhận đặt bàn"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Reservation;