import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Seferîlik "đi xa" (meal 4:101). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Shafi‘i' },
  kaynaklar: {
    vatan: 'Quê nhà, nơi cư trú và nơi lưu lại tạm thời khi đi xa (tiếng Thổ Nhĩ Kỳ)',
    cem: 'Có được gộp Salah (jam‘) không? (tiếng Thổ Nhĩ Kỳ)',
    baslangic: 'Khi nào thì bắt đầu tính là đi xa? (tiếng Thổ Nhĩ Kỳ)',
    ziyaret: 'Người về thăm quê cha mẹ có được tính là người đi xa không? (tiếng Thổ Nhĩ Kỳ)',
  },
  bilgiNotu:
    'Đây là thông tin, không phải phán quyết. Việc bạn có được tính là người đi xa hay không tùy thuộc vào mục đích, độ dài chuyến đi và ý định của bạn.',
  baslik: 'Có vẻ bạn đang đi xa',
  mesafeSatiri: 'Bạn đang cách nơi cư trú khoảng {km} km theo đường chim bay. Diyanet truyền đạt cho trường phái {mezhep}:',
  maddeler: {
    hanefi: [
      'Theo trường phái Hanafi, khoảng cách đi xa (safar) là khoảng 90 km. Người định lưu lại nơi đến dưới 15 ngày được tính là người đi xa.',
      'Người đi xa hành lễ các Salah bắt buộc bốn rak’at thành hai rak’at (qasr).',
      'Theo trường phái Hanafi, gộp hai Salah (jam‘) chỉ có trong Hajj, tại Arafat và Muzdalifah. Diyanet cũng lưu ý rằng khi có lý do nghiêm trọng như đi xa, có thể theo quan điểm của các trường phái khác.',
    ],
    safii: [
      'Theo trường phái Shafi‘i, khoảng cách đi xa cũng là khoảng 90 km. Nếu thời gian lưu lại nơi đến dưới 4 ngày, không tính ngày đến và ngày đi, thì các quy định về đi xa vẫn áp dụng.',
      'Người đi xa hành lễ các Salah bắt buộc bốn rak’at thành hai rak’at (qasr).',
      'Theo trường phái Shafi‘i, đi xa là lý do hợp lệ để gộp (jam‘) Zhuhr với ‘Asr và Maghrib với ‘Isha’.',
    ],
  },
  ozetAcik: 'Bật · {mezhep}',
  ozetKapali: 'Tắt',
  baglantiAcilamadi: 'Không thể mở liên kết. Hãy kiểm tra kết nối internet.',
  ikametGuncellendi: 'Đã cập nhật nơi cư trú của bạn',
  ikametKaydedilemedi: 'Không thể lưu nơi cư trú của bạn',
  kartiKapatin: 'Đóng thẻ đi xa',
  burasiEvimErisim: 'Đây là nhà tôi, lưu làm nơi cư trú',
  burasiEvim: 'Đây là nhà',
  diyanetteOkuyunErisim: 'Đọc fatwa của Diyanet trong trình duyệt',
  diyanetteOkuyun: 'Đọc trên Diyanet',
  sayfa: {
    kayitliKonum: 'Vị trí đã lưu',
    henuzKaydedilmedi: 'Chưa lưu — vị trí đầu tiên của bạn được tính là nơi cư trú',
    buradasiniz: 'Bạn đang ở đây',
    uzaktasiniz: 'Bạn đang cách khoảng {km} km theo đường chim bay',
    konumBilinmiyor: 'Chưa biết vị trí của bạn; hãy chọn vị trí trước',
    giris:
      'Khi bạn cách nơi cư trú khoảng {km} km, một thẻ thông tin ngắn tóm tắt các fatwa của Diyanet sẽ hiện trên màn hình chính. Thẻ hiện một lần cho mỗi chuyến đi và không gửi thông báo.',
    bilgiKarti: 'Thẻ thông tin',
    kartBaslik: 'Thẻ thông tin đi xa',
    gosterilir: 'Hiện trên màn hình chính',
    gosterilmez: 'Không hiện',
    mezhepNotu: 'Thẻ theo trường phái của bạn; bạn có thể chọn trong Cài đặt › Giờ Salah.',
    ikametYeri: 'Nơi cư trú',
    ikametYapErisim: 'Lưu vị trí hiện tại làm nơi cư trú',
    ikametYap: 'Đặt vị trí hiện tại làm nơi cư trú',
    kaynaklar: 'Nguồn (Hội đồng Tôn giáo Tối cao Diyanet)',
    kaynakErisim: '{etiket}. Mở trong trình duyệt',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Nếu có câu hỏi, bạn có thể gọi đường dây fatwa 190 của Diyanet.',
  },
};
