import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri "chuỗi ngày"; övgü ve "!" yok (samimiyet kuralı). */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Chuỗi ngày của bạn đang cháy',
    enUzun: cogul({ other: 'Chuỗi dài nhất: {n} ngày' }),
    gunBuyuk: cogul({ other: 'NGÀY' }),
    sonrakiHedef: 'Mục tiêu tiếp theo: ngày {hedef} ({durum})',
    kalanGun: cogul({ other: 'Còn {n} ngày' }),
    tamamlandi: 'Đã hoàn thành',
    paylasErisim: 'Chia sẻ tiến độ của bạn',
    paylasBuyuk: 'CHIA SẺ TIẾN ĐỘ',
  },

  hedefler: {
    ilk_adim: { ad: 'Tuần đầu tiên', aciklama: 'Hành lễ 7 ngày không gián đoạn', cumle: 'Tuần đầu tiên' },
    aliskanlik_ustasi: { ad: 'Bậc thầy thói quen', aciklama: '21 ngày - giai đoạn hình thành thói quen', cumle: 'Bậc thầy thói quen' },
    kararlilik: { ad: 'Kiên định', aciklama: '60 ngày không gián đoạn', cumle: 'Kiên định' },
    efsane: { ad: 'Huyền thoại', aciklama: '90 ngày - sự bền bỉ vượt trội', cumle: 'Huyền thoại' },
  },

  /** Klasik mertebe adları, harf çevirisi (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Bước đầu tiên', aciklama: 'Bạn đã hoàn thành tuần đầu tiên.', kosul: 'Chuỗi 7 ngày' },
    aliskanlik_ustasi: {
      ad: 'Bậc thầy thói quen',
      aciklama: '21 ngày - đã hoàn thành giai đoạn hình thành thói quen.',
      kosul: 'Chuỗi 21 ngày',
    },
    kararlilik: { ad: 'Kiên định', aciklama: 'Bạn đã hành lễ 60 ngày không gián đoạn.', kosul: 'Chuỗi 60 ngày' },
    efsane: { ad: 'Huyền thoại', aciklama: '90 ngày - bạn đã thể hiện sự bền bỉ vượt trội.', kosul: 'Chuỗi 90 ngày' },
    toparlanma_ustasi: {
      ad: 'Bậc thầy phục hồi',
      aciklama: 'Bạn đã hoàn thành chế độ phục hồi 3 lần.',
      kosul: '3 lần phục hồi',
    },
    mukemmeliyetci: { ad: 'Trọn vẹn', aciklama: 'Bạn đã hành lễ 5/5 trong 30 ngày.', kosul: '30 ngày hành lễ 5/5' },
    yuz_namaz: { ad: '100 lần Salah', aciklama: 'Bạn đã hành lễ tổng cộng 100 lần Salah.', kosul: 'Hành lễ 100 lần Salah' },
    bin_namaz: { ad: '1000 lần Salah', aciklama: 'Bạn đã hành lễ tổng cộng 1000 lần Salah.', kosul: 'Hành lễ 1000 lần Salah' },
  },

  rozetSeviyeleri: { bronz: 'ĐỒNG', gumus: 'BẠC', altin: 'VÀNG', elmas: 'KIM CƯƠNG' },

  gunBitis: {
    erken: 'Cho người ngủ sớm',
    varsayilan: 'Mặc định - trước Fajr ở hầu hết các nơi',
    gec: 'Cho người ngủ muộn',
  },

  kutlama: {
    rozetEklendi: '🏅 Đã thêm vào bộ sưu tập huy hiệu',
    paylasin: 'Chia sẻ',
    rozetBaslik: 'Cầu xin Allah giúp duy trì',
    rozetMesaj: 'Bạn đã đạt huy hiệu “{ad}”.',
    hedefBaslik: cogul({ other: '{n} ngày' }),
    hedefMesaj: 'Bạn đã hoàn thành mục tiêu “{ad}”. Cầu xin Allah giúp duy trì.',
    yeniRank: 'Cấp bậc mới: {rank}',
    seviyeBaslik: 'Cấp độ mới của bạn',
    seviyeMesaj: 'Từ giờ bạn tiếp tục với cấp “{rank}”. Cầu xin Allah giúp duy trì.',
    toparlanmaBaslik: 'Chuỗi ngày của bạn đã trở lại',
    toparlanmaMesaj: cogul({
      other: 'Chuỗi {n} ngày của bạn tiếp tục từ chỗ đã dừng. Cầu xin Allah ban sự kiên định.',
    }),
    enUzunBaslik: 'Chuỗi dài nhất của bạn',
    enUzunMesaj: cogul({
      other: '{n} ngày: chuỗi dài nhất của bạn đến nay. Cầu xin Allah giúp duy trì.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Hiện không đọc được dữ liệu trước đây của bạn.',
    yenidenErisim: 'Tải lại dữ liệu chuỗi ngày',
    yenidenDeneyin: 'Thử lại',
    yukleniyor: 'Đang tải dữ liệu chuỗi ngày...',
    gunlukSeri: 'ngày liên tiếp',
    rekor: 'kỷ lục',
    sozErisim: '{metin} Nguồn: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Mục tiêu tiếp theo',
    tumu: 'Bạn đã hoàn thành mọi huy hiệu',
    kalan: cogul({ other: 'Huy hiệu {ad}: còn {n} ngày' }),
    tumuErisim: 'Bạn đã hoàn thành mọi huy hiệu: chuỗi Tasbih đã đầy.',
    erisim: 'Huy hiệu {ad}: đã hoàn thành {n} trên {hedef} ngày.',
  },

  gok: {
    gunHarfleri: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ other: '{n} ngày đạt mục tiêu' }),
    besVakit: cogul({ other: '{n} ngày đủ năm lần Salah' }),
    dondurulmus: cogul({ other: '{n} ngày được đóng băng' }),
    mevcutSeri: cogul({ other: 'Chuỗi hiện tại: {n} ngày.' }),
  },

  hedefAyar: {
    azalt: 'Giảm',
    deger: 'Giá trị',
    artir: 'Tăng',
    esik: cogul({ other: '{n} lần Salah' }),
    sifirlaBaslik: 'Đặt lại chuỗi ngày',
    sifirlaMesaj: 'Toàn bộ dữ liệu chuỗi ngày (chuỗi, huy hiệu, điểm) sẽ được đặt lại. Không thể hoàn tác. Bạn có muốn tiếp tục?',
    sifirla: 'Đặt lại',
    iptal: 'Hủy',
    basarili: 'Xong',
    sifirlandi: 'Dữ liệu chuỗi ngày của bạn đã được đặt lại.',
    hedefAyarlari: 'CÀI ĐẶT MỤC TIÊU',
    tamGunEsigi: 'Ngưỡng ngày trọn vẹn',
    tamGunAciklama: 'Đặt số lần Salah tối thiểu trong ngày để ngày đó được tính vào chuỗi',
    sifirlama: 'ĐẶT LẠI',
    verileriSifirla: 'Đặt lại dữ liệu chuỗi ngày',
    verileriSifirlaAlt: 'Xóa toàn bộ dữ liệu chuỗi, huy hiệu và điểm',
  },

  rozetKarti: {
    erisim: 'Huy hiệu {ad}, {durum}',
    kazanildi: 'đã đạt',
    kilitli: 'đã khóa',
  },

  toparlanma: {
    kartBaslik: 'CHẾ ĐỘ PHỤC HỒI',
    kartAltBaslik: 'Bạn có thể lấy lại chuỗi ngày',
    kartMesaj: 'Bạn có thể tiếp tục chuỗi {vurgu} từ chỗ đã dừng.',
    oncekiGun: cogul({ other: '{n} ngày' }),
    ilerleme: 'Đã hoàn thành {tamam}/{hedef} ngày',
    kalan: cogul({
      other: 'Hoàn thành đủ năm lần Salah thêm {n} ngày nữa và chuỗi ngày sẽ tiếp tục từ chỗ đã dừng.',
    }),
    bugun: 'Hoàn thành hôm nay và chuỗi ngày sẽ tiếp tục từ chỗ đã dừng.',
    uyari: 'Các ngày phải liên tiếp; nếu bỏ lỡ một ngày ở giữa, việc phục hồi sẽ bắt đầu lại.',
    kapatErisim: 'Đóng chi tiết phục hồi',
    anladim: 'Đã hiểu',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Chia sẻ tiến độ của bạn',
    hazirDegilBaslik: 'Ảnh chưa sẵn sàng',
    hazirDegilMesaj: 'Ảnh chưa sẵn sàng. Hãy thử lại sau vài giây.',
    olusturulamadiBaslik: 'Không thể tạo ảnh',
    olusturulamadiMesaj: 'Đã xảy ra lỗi khi tạo ảnh. Hãy thử lại.',
    kullanilamiyorBaslik: 'Không thể chia sẻ',
    kullanilamiyorMesaj: 'Thiết bị này không hỗ trợ chia sẻ.',
    kapat: 'Đóng',
    hikaye: 'Thêm vào tin của bạn',
    platformlar: 'Có thể chia sẻ trên Instagram, WhatsApp và nhiều nơi khác.',
    tamam: 'Đồng ý',
    seriEnUzun: cogul({ other: 'Chuỗi dài nhất của tôi: {n} ngày' }),
    seriZincir: cogul({ other: 'NGÀY KHÔNG ĐỨT CHUỖI' }),
    seriSoz: '“Mỗi ngày một bước nhỏ, tâm hồn tôi thêm bình an lớn. 🔥”',
    rozetYeni: 'TÔI ĐÃ ĐẠT HUY HIỆU MỚI',
    rozetSozleri: [
      'Hôm nay tôi đã bước một bước tốt cho bản thân. 🌟',
      'Tôi tiếp tục với quyết tâm; huy hiệu này là của tôi. 💪',
      'Tôi đã đón được phúc lành của buổi sáng. 🌅',
      'Tôi là một phần của dòng chảy làm tâm hồn tôi an lành. ✨',
      'Những bước nhỏ mang lại bình an lớn. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'TÔI ĐÃ ĐẠT HUY HIỆU MỚI',
      hedef_tamamlandi: 'TÔI ĐÃ ĐẠT MỤC TIÊU',
      seviye_atlandi: 'LÊN CẤP',
      toparlanma_tamamlandi: 'ĐÃ TRỞ LẠI',
      en_uzun_seri: 'KỶ LỤC MỚI',
      varsayilan: 'THÀNH QUẢ',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Cầu xin Thượng Đế của tôi giúp duy trì. 🤲', 'Những bước nhỏ mang lại bình an lớn. 🍃', 'Cầu xin Allah ban cho tất cả chúng ta sự kiên định. 🌱'],
      hedef_tamamlandi: ['Những bước nhỏ mang lại bình an lớn. 🍃', 'Cầu xin Allah giúp duy trì. 🤲', 'Mỗi ngày thêm một bước. 🌱'],
      seviye_atlandi: [
        'Mỗi ngày thêm một chút; cầu xin Allah ban sự dễ dàng. 🍃',
        'Cầu xin Allah giúp duy trì. 🤲',
        'Hành trình vẫn tiếp tục. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Điều quan trọng không phải là vấp ngã mà là đứng dậy. 🔄',
        'Cầu xin Allah ban sự kiên định. 🤲',
        'Con đường nào cũng đi được bằng sự kiên nhẫn. 🌱',
      ],
      en_uzun_seri: [
        'Mỗi ngày một bước nhỏ, lòng tôi thêm bình an lớn. 🍃',
        'Cầu xin Allah giúp duy trì. 🤲',
        'Cầu xin Thượng Đế của tôi ban cho tất cả chúng ta sự kiên định. 🌱',
      ],
    },
  },
};
