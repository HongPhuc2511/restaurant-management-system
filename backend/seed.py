import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

# 1. Cấu hình môi trường Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Food, Supplier, RestaurantTable, ImportReceipt, User, Category, FoodReview
from core import enums


def seed_customers():
    print("\n--- 1. KHỞI TẠO TÀI KHOẢN KHÁCH HÀNG (DÙNG ĐỂ BÌNH LUẬN) ---")
    customers_data = [
        {"username": "nguyenvana", "email": "ana@gmail.com", "first_name": "Văn A", "last_name": "Nguyễn"},
        {"username": "tranthib", "email": "btran@gmail.com", "first_name": "Thị B", "last_name": "Trần"},
        {"username": "lehoangc", "email": "cle@gmail.com", "first_name": "Hoàng C", "last_name": "Lê"},
        {"username": "phamminhd", "email": "dpham@gmail.com", "first_name": "Minh D", "last_name": "Phạm"},
        {"username": "voquange", "email": "evo@gmail.com", "first_name": "Quang E", "last_name": "Võ"},
    ]

    customers = []
    user_role = enums.Role.USER if hasattr(enums, 'Role') else "USER"

    for c_info in customers_data:
        user, created = User.objects.get_or_create(
            username=c_info["username"],
            defaults={
                "email": c_info["email"],
                "first_name": c_info["first_name"],
                "last_name": c_info["last_name"],
                "role": user_role,
                "phone": f"09{random.randint(10000000, 99999999)}"
            }
        )
        if created or not user.check_password("123456"):
            user.set_password("123456")
            user.save()
        customers.append(user)

    print(f" Đã chuẩn bị {len(customers)} tài khoản khách hàng.")
    return customers


def seed_foods():
    print("\n--- 2. CẬP NHẬT MÔ TẢ DÀI VÀ MÓN ĂN (FOOD) ---")

    # Mô tả chi tiết dài ~80-100 chữ cho từng món ăn
    descriptions_data = {
        "Lẩu gà nhân sâm hạt sen": (
            "Lẩu gà nhân sâm hạt sen là sự kết hợp tinh tế giữa hương vị ẩm thực truyền thống và giá trị dinh dưỡng đỉnh cao. "
            "Nước dùng được ninh hầm kỹ lưỡng nhiều giờ từ xương gà ta tươi ngon cùng củ nhân sâm thượng hạng, hạt sen bùi ngậy và các vị thảo mộc thiên nhiên. "
            "Từng miếng thịt gà thả vườn săn chắc, thấm đượm vị ngọt thanh dịu mát, mang đến trải nghiệm ấm áp và bồi bổ sức khỏe tuyệt vời cho cả gia đình."
        ),
        "Trà chanh vải": (
            "Trà chanh vải là thức uống giải nhiệt lý tưởng mang hương vị bùng nổ cho những ngày oi nóng. "
            "Sự hòa quyện tuyệt vời giữa vị mặn mòi đậm đà của cốt trà xanh chọn lọc, vị chua thanh sảng khoái từ chanh tươi và hương thơm ngọt ngào mọng nước của những trái vải chín mộng. "
            "Ly trà được trang trí đẹp mắt kèm những miếng vải giòn sần sật, mang đến cảm giác thư thái và tươi mới ngay từ ngụm đầu tiên."
        ),
        "Trà trái cây nhiệt đới": (
            "Trà trái cây nhiệt đới là sự hòa tấu hương vị rực rỡ đến từ các loại hoa quả tươi ngon nhất mùa hè. "
            "Nền trà thanh nhẹ kết hợp hài hòa cùng vị chua ngọt tự nhiên của chanh dây, xoài chín, dưa hấu, và cam vàng tươi. "
            "Mỗi ly trà không chỉ cung cấp lượng Vitamin phong phú giúp làm đẹp da và tăng cường sức đề kháng mà còn là nguồn năng lượng tươi trẻ trọn vẹn cho buổi họp mặt."
        ),
        "Trà chanh lựu": (
            "Trà chanh lựu quyến rũ thực khách ngay từ ánh nhìn đầu tiên nhờ sắc đỏ mộng đẹp mắt cùng hương vị ngọt ngào khó cưỡng. "
            "Chiết xuất từ những hạt lựu đỏ mọng nước giàu chất chống oxy hóa, kết hợp hoàn hảo với cốt chanh tươi mát và trà olong hảo hạng. "
            "Hương vị chua thanh nhẹ nhàng hòa quyện cùng hậu vị ngọt dịu lưu lại nơi đầu lưỡi, đánh tan mọi cảm giác mệt mỏi trong ngày."
        ),
        "Gà viên chiên giòn": (
            "Gà viên chiên giòn là món ăn ăn kèm không thể thiếu dành cho mọi lứa tuổi khi ghé thăm nhà hàng. "
            "Từng viên thịt ức gà tươi được xay nhuyễn, tẩm ướp đậm đà theo công thức bí truyền rồi bọc lớp bột chiên xù cao cấp. "
            "Khi chiên trong dầu nóng chuẩn nhiệt độ, lớp vỏ bên ngoài trở nên vàng ươm giòn rụm trong khi phần thịt bên trong vẫn giữ nguyên độ mềm ngậy, mọng nước."
        ),
        "Thăn heo thái mỏng": (
            "Thăn heo thái mỏng là nguyên liệu nhúng lẩu chuẩn vị được mổ và chọn lọc tươi mới mỗi ngày. "
            "Phần thịt thăn mềm mại, ít mỡ nhưng không hề bị khô, được các đầu bếp xắt lát mỏng đều tay bằng máy chuyên dụng. "
            "Khi nhúng vào nồi nước lẩu đang sôi sùng sục, thịt chín tới nhanh chóng, giữ trọn vị ngọt ngào tự nhiên, độ giòn sần sật và độ mềm tan hoàn hảo."
        ),
        "Tôm cá sashimi": (
            "Tôm cá sashimi thể hiện đẳng cấp tươi ngon tuyệt đối với nguyên liệu hải sản được tuyển chọn khắt khe đạt chuẩn ăn sống. "
            "Những lát cá tươi rói cùng tôm biển bóc vỏ được phi lê khéo léo, xếp đẹp mắt trên tháp đá lạnh giữ nhiệt. "
            "Món ăn giữ trọn vị ngọt thanh khiết của biển cả, ăn kèm mù tạt cay nồng và nước tương Nhật Bản hảo hạng mang lại trải nghiệm ẩm thực tinh tế."
        ),
        "Bò sốt mật ong": (
            "Bò sốt mật ong đậm đà kích thích trọn vẹn mọi giác quan của người thưởng thức. "
            "Những miếng thịt bò thăn mềm mọng được thái quân cờ vừa ăn, áp chảo cùng sốt mật ong rừng nguyên chất, tỏi phi thơm và chút tiêu đen nồng nã. "
            "Lớp sốt sánh mịn óng ả bao bọc lấy từng miếng thịt đậm đà, vị ngọt thanh mát quyện cùng độ béo ngậy tạo nên sức hút khó cưỡng."
        ),
        "Trà hoa lạc thần": (
            "Trà hoa lạc thần (Hibiscus) mang sắc đỏ hồng ngọc kiêu sa cùng hương vị chua thanh tự nhiên đầy quyến rũ. "
            "Được hãm từ những đài hoa lạc thần sấy khô cao cấp kết hợp chút đường phèn thanh ngọt và cỏ ngọt dịu mát. "
            "Thức uống này chứa vô số dưỡng chất giúp hỗ trợ thanh lọc cơ thể, giảm mỡ máu, ổn định huyết áp và mang đến sự thư thái tuyệt vời."
        ),
        "Trà đào": (
            "Trà đào truyền thống đậm đà chuẩn vị là món uống yêu thích vượt thời gian của đông đảo khách hàng. "
            "Cốt trà đen đậm đà thơm lừng hòa quyện tinh tế với syrup đào ngọt ngào và vài giọt sả thanh nhẹ. "
            "Đặc biệt, ly trà đi kèm những miếng đào miếng ngâm vàng ươm, giòn rụm sần sật, tạo nên cảm giác thích thú và đã miệng khi vừa uống vừa thưởng thức."
        ),
        "Nước dưa hấu": (
            "Nước ép dưa hấu nguyên chất 100% là nguồn năng lượng thanh mát tinh khiết từ thiên nhiên. "
            "Được ép trực tiếp từ những quả dưa hấu đỏ chín mọng tuyển chọn, hoàn toàn không thêm đường hay chất bảo quản. "
            "Mỗi ngụm nước ép mang lại cảm giác giải nhiệt tức thì, cung cấp lượng nước dồi dào cùng Vitamin A, C giúp phục hồi sức khỏe nhanh chóng sau những giờ làm việc."
        ),
        "Nước cam": (
            "Nước cam tươi mọng nước được vắt trực tiếp từ những trái cam sành chín cây căng mọng. "
            "Thức uống giữ nguyên lượng tép cam tươi giòn cùng hàm lượng Vitamin C và chất khoáng dồi dào, mang lại vị chua ngọt đậm đà vô cùng dễ chịu. "
            "Đây là sự lựa chọn hoàn hảo để khởi đầu bữa ăn, giúp kích thích vị giác và nâng cao hệ miễn dịch cho cơ thể."
        ),
        "Matcha latte": (
            "Matcha latte là sự kết hợp chuẩn vị giữa bột trà xanh Uji thượng hạng nhập khẩu từ Nhật Bản và sữa tươi thanh trùng béo ngậy. "
            "Lớp bọt sữa mịn màng phủ trên bề mặt làm nổi bật vị chát nhẹ đặc trưng hòa quyện cùng độ ngọt dịu dàng của sữa. "
            "Món uống mang hương thơm thanh tao lưu dãi lâu, cung cấp năng lượng tỉnh táo và thư thái cho tinh thần."
        ),
        "Trà sữa chân châu": (
            "Trà sữa trân châu truyền thống gây thương nhớ với công thức pha chế đậm đà độc quyền. "
            "Trà hồng trà nướng thơm lừng kết hợp cùng kem béo thực vật tạo nên chất trà sánh mịn, đậm đà nhưng không hề gắt cổ. "
            "Đi kèm là những hạt trân châu đen ngâm đường đen mềm dẻo, giòn dai dẻo quánh, tạo nên thói quen nhai vô cùng thú vị."
        ),
        "Màn thầu chiên": (
            "Màn thầu chiên là món ăn kèm tráng miệng trọn vị với màu vàng ruộm hấp dẫn. "
            "Bánh màn thầu mềm xốp được chiên ngập dầu ở nhiệt độ chuẩn xác để vỏ ngoài giòn rụm nhưng ruột bên trong vẫn giữ độ mềm mịn thơm mùi sữa. "
            "Chấm cùng dĩa sữa đặc ngọt ngào béo ngậy, món ăn đơn giản này lại mang đến trải nghiệm ngất ngây đầy hoài niệm."
        ),
        "Viên tôm chiên": (
            "Viên tôm chiên giòn đậm đà được chế biến hoàn toàn từ thịt tôm biển tươi sống quết kỹ. "
            "Thịt tôm sau khi được quết dẻo mịn sẽ viên tròn vừa ăn và lăn qua lớp bột chiên giòn xù thơm phức. "
            "Món ăn có độ giòn rụm bên ngoài, bên trong dai giòn sần sật giữ trọn vị ngọt đậm đà đặc trưng của tôm tươi, chấm kèm sốt mayonaise béo ngậy."
        ),
        "Tempura tôm": (
            "Tempura tôm mang phong vị ẩm thực xứ sở Hoa Anh Đào vô cùng tinh tế. "
            "Những con tôm sú to khỏe được làm sạch, giữ lại đuôi và nhúng vào lớp bột tempura mỏng nhẹ chuẩn công thức Nhật. "
            "Khi chiên xong, lớp bột xù tung ôm trọn lấy con tôm ngọt lịm, giữ được độ giòn rụm lâu mà không hề tích dầu, ăn kèm nước tương ớt cay nhẹ."
        ),
        "Nước chấm thanh vị": (
            "Nước chấm thanh vị là điểm nhấn độc quyền giúp nâng tầm hương vị cho các món lẩu và đồ nhúng. "
            "Được pha chế tỉ mỉ từ nước cốt tắc tươi, đường phèn, tỏi ớt băm nhuyễn và công thức gia vị bí truyền. "
            "Nước chấm có độ sánh vừa phải, vị chua ngọt nhẹ nhàng thanh dịu, không làm lấn ạt mà tôn lên trọn vẹn vị ngọt tự nhiên của thịt cá."
        ),
        "Nước chấm hải sản": (
            "Nước chấm hải sản chua cay bùng nổ là người bạn đồng hành không thể thiếu cho các tín đồ đồ biển. "
            "Sự pha trộn hoàn hảo giữa muối ớt xanh Tây Ninh, cốt chanh tươi, lá chanh thái chỉ và sữa đặc béo ngậy. "
            "Vị cay nồng xộc lên mũi hòa cùng độ chua mặn ngọt vừa vặn giúp triệt tiêu hoàn toàn mùi tanh, tôn vinh độ tươi ngọt của tôm mực."
        ),
        "Nước chấm chua ngọt": (
            "Nước chấm chua ngọt chuẩn vị Việt mang đến sự cân bằng hoàn hảo cho các món chiên xào. "
            "Nước mắm truyền thống thơm lừng kết hợp cùng dấm nếp, đường cát và tỏi ớt dầm nhuyễn tạo nên màu sắc bắt mắt. "
            "Vị chua cay mặn ngọt đậm đà vừa phải giúp các món chiên giảm bớt độ ngấy, kích thích vị giác vô cùng hiệu quả."
        ),
        "Mực nang": (
            "Mực nang tươi sống được đánh bắt và vận chuyển trong ngày để đảm bảo chất lượng tuyệt đối. "
            "Thịt mực dày dặn, trắng tinh khôi được khía hoa tinh tế giúp ngấm trọn gia vị khi nhúng lẩu hoặc nướng. "
            "Khi thưởng thức, mực mang lại cảm giác giòn sần sật sảng khoái, vị ngọt đậm tự nhiên tràn ngập khoang miệng."
        ),
        "Cá mú đen": (
            "Cá mú đen tươi sống là loại hải sản cao cấp được săn đón hàng đầu tại nhà hàng. "
            "Thịt cá mú đặn, dẻo sần sật, giàu đạm và không hề có xương dăm, được phi lê mỏng khéo léo. "
            "Khi nhúng vào nước lẩu thanh ngọt, thịt cá săn lại thơm phức, mang lại vị béo ngậy tự nhiên cùng giá trị dinh dưỡng vô cùng tuyệt vời."
        ),
        "Bạch tuộc": (
            "Bạch tuộc đại dương tươi ngon sở hữu những xúc xắc căng mọng quyến rũ. "
            "Bạch tuộc được sơ chế sạch sẽ, giữ nguyên độ tươi nguyên bản cùng màu da óng ánh. "
            "Nhúng vào nồi lẩu Thái chua cay hay lẩu dầu cay, bạch tuộc săn lại giòn sần sật, vị ngọt mặn mòi của biển cả hòa quyện cùng gia vị lẩu tạo nên độ ngon mê húc."
        ),
        "Lẩu thái chua cay": (
            "Lẩu Thái chua cay bùng nổ hương vị đặc trưng của ẩm thực xứ Chùa Vàng. "
            "Nước lẩu được ninh từ xương ống đậm đà, kết hợp hoàn hảo cùng sả đập dập, lá chanh Kaffir, riềng tươi, ớt cay xè và cốt dừa béo ngậy. "
            "Vị chua cay nồng nã thấm đượm vào từng nguyên liệu nhúng, mang lại trải nghiệm ấm áp và sảng khoái tuyệt đối."
        ),
        "Lẩu dầu cay": (
            "Lẩu dầu cay Tứ Xuyên là thách thức vị giác đỉnh cao cho những tín đồ đam mê vị cay nồng. "
            "Nước lẩu sóng sánh sắc đỏ quyến rũ từ ớt khô Tứ Xuyên, tiêu hoa sương và vô số loại gia vị thảo mộc đắt giá. "
            "Hương vị cay tê rần rần nơi đầu lưỡi hòa cùng vị béo thơm của dầu ớt giúp nâng tầm các nguyên liệu thịt bò, bao tử khi nhúng."
        ),
        "Lẩu cà chua": (
            "Lẩu cà chua thanh nhẹ bổ dưỡng là sự lựa chọn tuyệt vời cho người yêu thích vị ngọt tự nhiên. "
            "Nước dùng được chế biến từ những quả cà chua chín đỏ mọng nấu nhuyễn cùng nước hầm xương đậm đà. "
            "Vị chua dịu nhẹ nhàng, dồi dào Lycopene và Vitamin giúp bữa ăn trở nên tròn vị, không lo ngấy và rất tốt cho sức khỏe làn da."
        ),
        "Lẩu gà nhân sâm": (
            "Lẩu gà nhân sâm đại bổ là món ăn chứa đựng trọn vẹn sự tinh túy và tâm huyết của đội ngũ bếp. "
            "Nước lẩu có màu vàng óng tự nhiên, thơm lừng mùi nhân sâm tươi, táo đỏ, kỷ tử và hạt sen ninh nhuyễn. "
            "Thịt gà ta thả vườn dai ngọt nhúng cùng nước lẩu nóng hổi mang lại nguồn năng lượng bồi bổ cơ thể tuyệt vời."
        ),
        "Lẩu ngò": (
            "Lẩu ngò thanh mát mang hương thơm thanh tao độc đáo khó quên. "
            "Được chế biến từ cốt rau ngò tươi nguyên chất kết hợp nước hầm xương gà thanh ngọt, tạo nên màu xanh tươi dịu mát mắt. "
            "Món lẩu này mang lại cảm giác thanh lọc cơ thể, giải nhiệt hiệu quả và đặc biệt rất hợp khi nhúng cùng hải sản tươi hoặc thịt heo."
        ),
        "Thịt bò rút xương": (
            "Thịt bò rút xương nhập khẩu cao cấp với chất lượng vân mỡ đan xen hoàn hảo. "
            "Từng miếng thịt được lọc sạch xương kỹ càng, giữ lại phần thịt mềm mại đậm đà nhất. "
            "Khi nhúng tái trong nước lẩu sôi, thịt bò như tan ra trong miệng, mọng nước và béo ngậy vị bơ tự nhiên."
        ),
        "Thịt bò bông tuyết": (
            "Thịt bò bông tuyết là siêu phẩm ẩm thực gây ấn tượng bởi những đường vân mỡ trắng mịn như tuyết. "
            "Thịt bò có độ mềm thượng hạng, vị béo ngậy đặc trưng không nơi nào sánh bằng. "
            "Chỉ cần nhúng nhanh 5 giây trong nước lẩu, miếng thịt chín tái mềm mọng, đậm đà vị ngọt tự nhiên đọng lại ngây ngất."
        ),
        "Thăn lõi vai bò": (
            "Thăn lõi vai bò giòn ngọt là sự lựa chọn lý tưởng cho các món nhúng lẩu hoặc nướng. "
            "Phần thịt có đường gân giòn ở giữa, xung quanh là dải thịt đỏ tươi mọng nước. "
            "Khi thưởng thức, bạn sẽ cảm nhận được sự hòa quyện tuyệt vời giữa độ giòn sần sật của gân và độ mềm ngọt đậm đà của thịt bò cao cấp."
        ),
        "Thịt bò nhúng lẩu": (
            "Thịt bò nhúng lẩu tươi ngon được thái mỏng chuẩn xác từng milimet. "
            "Thịt bò giữ nguyên màu đỏ tươi nguyên bản, không dùng chất bảo quản hay đông lạnh lâu ngày. "
            "Thịt nhúng tái vừa chín tới giữ trọn độ mọng nước, mềm mại và thơm lừng hương vị thịt bò tươi."
        ),
        "Bao tử bò": (
            "Bao tử bò tươi giòn sần sật được sơ chế và tẩy sạch tỉ mỉ qua nhiều công đoạn. "
            "Bao tử giữ được màu trắng ngà tự nhiên, sạch sẽ và hoàn toàn không còn mùi hôi. "
            "Khi nhúng vào lẩu dầu cay hoặc lẩu Thái, bao tử chín tới giòn sần sật, ngấm trọn vị chua cay nồng nã cực kỳ bắt miệng."
        ),
        "Thịt bò cao cấp": (
            "Thịt bò cao cấp tuyển chọn từ những trang trại bò đạt chuẩn quốc tế. "
            "Thịt bò có màu sắc tươi sáng, thớ thịt nhỏ mịn cùng hàm lượng dinh dưỡng vượt trội. "
            "Mỗi miếng thịt khi thưởng thức đều mang lại độ mềm ngọt tự nhiên, mọng nước và vị thơm ngậy đặc trưng."
        ),
        "Thịt bắp bò tươi thái lát": (
            "Thịt bắp bò tươi thái lát thu hút bởi những hoa vân thăn bò cực kỳ đẹp mắt. "
            "Bắp bò có sự đan xen hoàn hảo giữa thịt thăn tươi và các dải gân nhỏ giòn sần sật. "
            "Thái lát mỏng vừa ăn giúp bắp bò khi nhúng lẩu chín tới nhanh chóng, mang lại độ giòn ngọt đằm thắm vô cùng đã miệng."
        ),
        "Thịt bò đông tuyết thái lát": (
            "Thịt bò đông tuyết thái lát giữ nguyên độ tươi ngon nhờ công nghệ cấp đông siêu tốc hiện đại. "
            "Thịt bò được bào lát mỏng cuộn tròn đẹp mắt, sẵn sàng nhúng ngay vào nồi lẩu nóng. "
            "Thịt bò tan nhẹ trong khoang miệng, lan tỏa vị béo ngậy thanh nhẹ quyện cùng nước lẩu đậm đà."
        ),
        "Lõi vai bò thái lát": (
            "Lõi vai bò thái lát mỏng mịn là lựa chọn tuyệt vời cho bữa tiệc lẩu ấm cúng. "
            "Phần thịt lõi vai có tỉ lệ nạc mỡ cân bằng, giúp thịt khi chín không bị khô cứng mà luôn giữ được độ ẩm mịn mọng nước. "
            "Hương vị thịt bò đậm đà lưu lại hậu vị ngọt ngào sâu lắng."
        )
    }

    default_cat, _ = Category.objects.get_or_create(name="Thực đơn chung")
    updated_count = 0
    created_count = 0
    all_foods = []

    for name, description in descriptions_data.items():
        food = Food.objects.filter(name=name).first()
        if food:
            food.description = description
            food.save()
            updated_count += 1
            all_foods.append(food)
        else:
            new_food = Food.objects.create(
                name=name,
                description=description,
                price=random.choice([49000, 79000, 99000, 159000, 229000]),
                category=default_cat,
                active=True
            )
            created_count += 1
            all_foods.append(new_food)

    print(f" Đã cập nhật mô tả dài cho {updated_count} món ăn sẵn có.")
    if created_count > 0:
        print(f" Đã tạo mới {created_count} món ăn.")

    return all_foods


def seed_reviews(foods, customers):
    print("\n--- 3. KHỞI TẠO BÌNH LUẬN & ĐÁNH GIÁ MÓN ĂN (FOOD REVIEW) ---")

    sample_comments = [
        "Món ăn rất tươi ngon, nước dùng đậm đà vừa miệng. Gia đình mình ai cũng thích!",
        "Thịt tươi mọng nước, nước chấm ngon xuất sắc. Phục vụ nhanh nhẹn và nhiệt tình.",
        "Giá cả hợp lý so với chất lượng tuyệt vời. Sẽ quay lại ủng hộ nhà hàng nhiều lần nữa.",
        "Món này lên mâm nóng hổi, trình bày rất đẹp mắt. Rất đáng thử nhé mọi người!",
        "Vị chua thanh mát rất bắt miệng, nguyên liệu cảm giác rất sạch sẽ và tươi mới.",
        "Đồ ăn ngon tuyệt vời, chất lượng 5 sao! Sẽ giới thiệu cho bạn bè cùng trải nghiệm.",
        "Nước lẩu đậm đà, thịt nhúng tươi ngon mềm tan. Rất hài lòng về dịch vụ!",
        "Thức uống giải nhiệt đỉnh cao, vị ngọt dịu thanh mát không bị gắt."
    ]

    reviews_count = 0
    for food in foods:
        # Mỗi món ăn chọn từ 2 đến 4 khách hàng ngẫu nhiên để bình luận
        selected_customers = random.sample(customers, random.randint(2, 4))
        for customer in selected_customers:
            review, created = FoodReview.objects.get_or_create(
                food=food,
                customer=customer,
                defaults={
                    "rating": random.choice([4, 5, 5, 4, 5]),  # Ưu tiên rating cao 4-5 sao
                    "comment": random.choice(sample_comments),
                    "active": True
                }
            )
            if created:
                reviews_count += 1

    print(f" Đã tạo thành công {reviews_count} đánh giá/bình luận cho các món ăn.")


def seed_suppliers():
    print("\n--- 4. KHỞI TẠO NHÀ CUNG CẤP (SUPPLIER) ---")
    suppliers_data = [
        {"id": 1, "name": "Nhà cung cấp thịt", "phone": "0123456", "address": "Thành phố Hồ Chí Minh"},
        {"id": 2, "name": "Nhà cung cấp trái cây", "phone": "0123456", "address": "Thủ đô Hà Nội"},
        {"id": 3, "name": "Nhà cung cấp gia vị", "phone": "0123456", "address": "Tỉnh Gia Lai"},
        {"id": 4, "name": "Nhà cung cấp cá", "phone": "0123456", "address": "Tỉnh Bình Dương"},
        {"name": "Nông trại Rau củ sạch Đà Lạt Organic", "phone": "0945678901", "address": "Tỉnh Lâm Đồng"},
        {"name": "Công ty Nước giải khát & Bia Sài Gòn", "phone": "0956789012", "address": "Thành phố Hồ Chí Minh"},
    ]

    suppliers = []
    for item in suppliers_data:
        if "id" in item:
            sup, _ = Supplier.objects.update_or_create(
                id=item["id"],
                defaults={"name": item["name"], "phone": item["phone"], "address": item["address"], "active": True}
            )
        else:
            sup, _ = Supplier.objects.get_or_create(
                name=item["name"],
                defaults={"phone": item["phone"], "address": item["address"], "active": True}
            )
        suppliers.append(sup)

    print(f" Sẵn sàng {len(suppliers)} Nhà cung cấp.")
    return suppliers


def seed_tables():
    print("\n--- 5. KHỞI TẠO BÀN ĂN (RESTAURANT TABLE) ---")
    table_numbers = [1, 2, 3, 5, 8, 10, 12, 15, 18, 20, 22, 25, 30, 35, 40, 45, 48, 50, 56, 60]

    for num in table_numbers:
        RestaurantTable.objects.get_or_create(
            number=num,
            defaults={
                "capacity": random.choice([2, 4, 6, 8]),
                "status": enums.TableStatus.AVAILABLE if hasattr(enums, 'TableStatus') else "AVAILABLE",
                "active": True
            }
        )
    print(f" Khởi tạo danh sách {len(table_numbers)} Bàn ăn.")


def seed_employees():
    print("\n--- 6. KHỞI TẠO TÀI KHOẢN NHÂN VIÊN (USER) ---")
    employees_data = [
        {"username": "phuc", "email": "phuc@restaurant.com", "phone": "0901112223"},
        {"username": "quanly_kho", "email": "kho@restaurant.com", "phone": "0904445556"},
    ]
    employees = []
    staff_role = enums.Role.STAFF if hasattr(enums, 'Role') else "STAFF"

    for emp_info in employees_data:
        emp, created = User.objects.get_or_create(
            username=emp_info["username"],
            defaults={
                "email": emp_info["email"],
                "phone": emp_info["phone"],
                "role": staff_role,
            }
        )
        if created or not emp.check_password("123456"):
            emp.set_password("123456")
            emp.save()
        employees.append(emp)

    print(f" Sẵn sàng {len(employees)} Tài khoản nhân viên.")
    return employees


def seed_import_receipts(suppliers, employees):
    print("\n--- 7. KHỞI TẠO PHIẾU NHẬP KHO (IMPORT RECEIPT) ---")

    supplier_thit = Supplier.objects.filter(name__icontains="thịt").first() or suppliers[0]
    emp_phuc = User.objects.filter(username="phuc").first() or employees[0]

    naive_date = datetime(2026, 8, 11, 13, 49, 0)
    aware_date = timezone.make_aware(naive_date)

    receipt, _ = ImportReceipt.objects.update_or_create(
        id=1,
        defaults={
            "supplier": supplier_thit,
            "employee": emp_phuc,
            "total_amount": 100000.00,
            "active": True,
            "note": "Nhập hàng đợt 1"
        }
    )
    ImportReceipt.objects.filter(id=1).update(created_date=aware_date)

    now = timezone.now()
    amounts = [250000.00, 450000.00, 1200000.00, 2500000.00, 3800000.00]

    for i in range(2, 10):
        rec, created = ImportReceipt.objects.get_or_create(
            id=i,
            defaults={
                "supplier": random.choice(suppliers),
                "employee": random.choice(employees),
                "total_amount": random.choice(amounts),
                "active": True,
                "note": f"Phiếu nhập kho tự động số {i}"
            }
        )
        if created:
            random_date = now - timedelta(days=random.randint(1, 90))
            ImportReceipt.objects.filter(id=i).update(created_date=random_date)

    print(" Khởi tạo danh sách Phiếu nhập kho (ImportReceipt) thành công.")


def run_seed():
    print("==================================================")
    print(" BẮT ĐẦU CHẠY SEED DỮ LIỆU TỔNG HỢP HỆ THỐNG")
    print("==================================================")

    customers = seed_customers()
    foods = seed_foods()
    seed_reviews(foods, customers)
    suppliers = seed_suppliers()
    seed_tables()
    employees = seed_employees()
    seed_import_receipts(suppliers, employees)

    print("\n==================================================")
    print(" TẤT CẢ DỮ LIỆU MẪU ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG!")
    print("==================================================")


if __name__ == "__main__":
    run_seed()