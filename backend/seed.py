import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Food

def run_seed():
    descriptions_data = {
        "Lẩu gà nhân sâm hạt sen": "Nước lẩu thanh ngọt bổ dưỡng kết hợp từ thịt gà tươi, nhân sâm quý và hạt sen bùi ngậy.",
        "Trà chanh vải": "Trà chanh mát lạnh hòa quyện cùng hương vị vải ngọt ngào, giải nhiệt tức thì.",
        "Trà trái cây nhiệt đới": "Sự kết hợp hoàn hảo từ các loại trái cây tươi nhiệt đới, mang lại hương vị tươi mát.",
        "Trà chanh lựu": "Vị chua thanh của chanh tươi quyện cùng hương lựu đỏ ngọt ngào.",
        "Gà viên chiên giòn": "Thịt gà viên được tẩm ướp đậm đà, chiên giòn rụm bên ngoài, mềm ngọt bên trong.",
        "Thăn heo thái mỏng": "Thịt thăn heo tươi ngon thái mỏng chuẩn vị, giòn ngọt khi nhúng lẩu.",
        "Tôm cá sashimi": "Hải sản tươi sống đạt chuẩn sashimi, giữ trọn vị ngọt tự nhiên của biển.",
        "Bò sốt mật ong": "Thịt bò mềm mọng kết hợp sốt mật ong đậm đà thơm lừng.",
        "Trà hoa lạc thần": "Trà hoa lạc thần đỏ mộng, vị chua nhẹ thanh mát và giàu chất chống oxy hóa.",
        "Trà đào": "Trà đào truyền thống thơm mát đi kèm những miếng đào giòn ngọt.",
        "Nước dưa hấu": "Nước ép dưa hấu nguyên chất 100% giải nhiệt sảng khoái.",
        "Nước cam": "Nước cam tươi mọng nước, giàu Vitamin C tốt cho sức khỏe.",
        "Matcha latte": "Matcha thượng hạng kết hợp cùng sữa tươi béo ngậy, thơm lừng.",
        "Trà sữa chân châu": "Trà sữa đậm vị trà, béo ngậy vị sữa kèm trân châu giòn dai hấp dẫn.",
        "Màn thầu chiên": "Màn thầu chiên vàng giòn bên ngoài, mềm xốp bên trong, ăn kèm sữa đặc.",
        "Viên tôm chiên": "Tôm tươi quết chặt, chiên vàng giòn rụm đậm đà.",
        "Tempura tôm": "Tôm tươi bọc bột tempura chiên giòn chuẩn phong cách Nhật Bản.",
        "Nước chấm thanh vị": "Nước chấm độc quyền thanh dịu, tôn vinh trọn vẹn vị ngọt của đồ nhúng.",
        "Nước chấm hải sản": "Nước chấm chua cay mặn ngọt đặc chế chuyên dành cho hải sản.",
        "Nước chấm chua ngọt": "Nước chấm chua ngọt chuẩn vị, kích thích vị giác.",
        "Mực nang": "Mực nang tươi giòn sần sật, ngọt đậm đà khi nhúng lẩu.",
        "Cá mú đen": "Thịt cá mú đen tươi sống, chắc thịt và thơm ngọt tự nhiên.",
        "Bạch tuộc": "Bạch tuộc tươi sống giòn sần sật, vị ngọt đậm đà.",
        "Lẩu thái chua cay": "Hương vị lẩu Thái truyền thống chua cay đậm đà, thơm lừng cốt dừa và sả ớt.",
        "Lẩu dầu cay": "Lẩu Tứ Xuyên dầu cay đậm đà, chuẩn vị cay nồng thách thức vị giác.",
        "Lẩu cà chua": "Vị lẩu cà chua thanh ngọt tự nhiên, dồi dào dinh dưỡng.",
        "Lẩu gà nhân sâm": "Nước dùng ninh từ gà tươi kết hợp nhân sâm bổ dưỡng, thơm ngậy.",
        "Lẩu ngò": "Nước lẩu ngò thanh mát, hương thơm thanh dịu độc đáo.",
        "Thịt bò rút xương": "Thịt bò tươi mềm rút xương, vân mỡ hoàn hảo nhúng lẩu cực ngon.",
        "Thịt bò bông tuyết": "Thịt bò nhập khẩu với lớp mỡ đan xen như bông tuyết, mềm tan trong miệng.",
        "Thăn lõi vai bò": "Thăn lõi vai bò giòn ngọt, vị đậm đà hấp dẫn.",
        "Thịt bò nhúng lẩu": "Thịt bò tươi thái mỏng, nhúng tái ngon trọn vị.",
        "Bao tử bò": "Bao tử bò làm sạch kỹ càng, giòn sần sật sảng khoái.",
        "Thịt bò cao cấp": "Thịt bò chọn lọc cao cấp, mềm ngọt đạt chuẩn chất lượng.",
        "Thịt bắp bò tươi thái lát": "Bắp bò tươi giòn sần sật, vân hoa đẹp mắt.",
        "Thịt bò đông tuyết thái lát": "Bò đông tuyết mỏng mịn, vị béo ngậy thơm ngon.",
        "Lõi vai bò thái lát": "Lõi vai bò mềm ngọt, thái mỏng vừa ăn."
    }

    updated_count = 0
    for name, description in descriptions_data.items():
        count = Food.objects.filter(name=name).update(description=description)
        updated_count += count

    print(f"Cập nhật thành công mô tả cho {updated_count} món ăn!")

if __name__ == '__main__':
    run_seed()