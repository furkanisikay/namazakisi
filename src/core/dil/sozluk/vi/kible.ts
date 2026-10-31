import type { Sozluk } from '../tr';

/** Kıble "Qiblah" (meal 2:144, IslamHouse); Kâbe "Ka‘bah". */
export const kible: Sozluk['kible'] = {
  baslik: 'Qiblah',
  yon: {
    hizali: 'Bạn đang hướng về Qiblah',
    arkada: 'Qiblah ở phía sau bạn, hãy quay lại',
    sagda: 'Qiblah lệch {derece}° về bên phải',
    solda: 'Qiblah lệch {derece}° về bên trái',
  },
  harf: { kuzey: 'B', dogu: 'Đ', guney: 'N', bati: 'T' },
  sekme: {
    pusula: 'La bàn',
    pusulaErisim: 'Chế độ la bàn',
    pusulaAciklama: 'Khi dấu Ka‘bah chạm vạch ở phía trên, bạn đang hướng về Qiblah.',
    kamera: 'Máy ảnh',
    kameraErisim: 'Chế độ máy ảnh',
    kameraAciklama: 'Giữ điện thoại thẳng đứng; dấu Ka‘bah sẽ hiện theo hướng Qiblah.',
  },
  sayfa: {
    baslatiliyor: 'Đang khởi động la bàn…',
    izinKapali: 'Quyền vị trí đang tắt; cần vị trí của bạn để tìm hướng.',
  },
  hata: {
    izinGerekli: 'Cần quyền vị trí để tìm hướng Qiblah.',
    konumServisi: 'Không thể truy cập dịch vụ vị trí. Hãy kiểm tra cài đặt vị trí của thiết bị.',
    baslatilamadi: 'Không thể khởi động dịch vụ Qiblah.',
  },
  pusula: {
    ufuk: 'đường chân trời',
    konumAliniyor: 'Đang lấy vị trí của bạn…',
    hazirlaniyor: 'Đang chuẩn bị la bàn…',
    kuzeydenAci: 'Qiblah cách hướng bắc {derece}°',
    kabeUzakta: 'Ka‘bah cách {mesafe}',
    kuzeydenSaatYonu: 'Theo chiều kim đồng hồ từ hướng bắc',
    kuzeyden: '{derece}° từ hướng bắc',
    kabeUzaktaKuzeyden: 'Ka‘bah cách {mesafe}, {derece}° từ hướng bắc',
    pusulaErisim: 'La bàn Qiblah. {cumle}',
    pusulaYok: 'Thiết bị này không có la bàn; hướng được hiển thị so với hướng bắc.',
    kayiyorsa: 'Nếu hướng bị lệch, hãy di chuyển điện thoại theo hình số 8 trong không khí.',
    kamerayla: 'Xem bằng máy ảnh',
  },
  kamera: {
    pusulayiKullanin: 'Dùng la bàn',
    kullanilamiyorBaslik: 'Chế độ máy ảnh không dùng được trên điện thoại này',
    kullanilamiyorMetin:
      'Cảm biến của điện thoại không cho hướng đáng tin cậy khi giữ thẳng đứng. La bàn vẫn hiển thị hướng chính xác.',
    izinBaslik: 'Xem Qiblah bằng máy ảnh',
    izinMetin:
      'Giữ điện thoại thẳng đứng và nhìn xung quanh; dấu Ka‘bah sẽ hiện theo hướng Qiblah. Việc này cần quyền máy ảnh; hình ảnh không được ghi lại và không rời khỏi điện thoại của bạn.',
    kamerayiAcin: 'Bật máy ảnh',
    izinKapaliBaslik: 'Quyền máy ảnh đang tắt',
    izinKapaliMetin: 'Bạn có thể cho phép truy cập máy ảnh trong Cài đặt để dùng chế độ máy ảnh. La bàn vẫn hoạt động mà không cần quyền này.',
    ayarlariAcin: 'Mở Cài đặt',
    acilamadiBaslik: 'Không thể mở máy ảnh',
    acilamadiMetin: 'Máy ảnh hiện không dùng được. Bạn có thể tìm Qiblah bằng la bàn.',
    hesaplaniyor: 'Đang tìm hướng…',
    dikTutun: 'Giữ điện thoại thẳng đứng',
  },
  kalibrasyon: {
    tesekkurErisim: 'Cảm ơn, hướng giờ đã chính xác hơn',
    tesekkur: 'Cảm ơn, hướng giờ đã chính xác hơn ✓',
    baslik: 'Hiệu chỉnh la bàn',
    sallayin: 'Di chuyển điện thoại theo hình số 8 trong không khí.',
    metal: 'Tránh xa vật kim loại và ốp lưng có nam châm.',
    dogruluk: 'Độ chính xác',
    simdiDegil: 'Để sau',
  },
};
