import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ngôn ngữ · Language',
  aciklama: 'Chọn ngôn ngữ của ứng dụng. Thông báo và đọc to cũng dùng ngôn ngữ này.',
  grup: 'Ngôn ngữ ứng dụng',
  dilAdlari: { tr: 'Tiếng Thổ Nhĩ Kỳ', en: 'Tiếng Anh', id: 'Tiếng Indonesia', de: 'Tiếng Đức', fr: 'Tiếng Pháp', bs: 'Tiếng Bosnia', ru: 'Tiếng Nga', ms: 'Tiếng Mã Lai', ar: 'Tiếng Ả Rập', ur: 'Tiếng Urdu', es: 'Tiếng Tây Ban Nha', nl: 'Tiếng Hà Lan', sq: 'Tiếng Albania', hi: 'Tiếng Hindi', bn: 'Tiếng Bangla', fa: 'Tiếng Ba Tư', ps: 'Tiếng Pashto', ckb: 'Tiếng Kurd Miền Trung', ug: 'Tiếng Uyghur', az: 'Tiếng Azerbaijan', uz: 'Tiếng Uzbek', kk: 'Tiếng Kazakh', ky: 'Tiếng Kyrgyz', tg: 'Tiếng Tajik', sw: 'Tiếng Swahili', ha: 'Tiếng Hausa', am: 'Tiếng Amharic', om: 'Tiếng Oromo', so: 'Tiếng Somali', ff: 'Tiếng Fulah', yo: 'Tiếng Yoruba', zh: 'Tiếng Trung (Giản thể)', ta: 'Tiếng Tamil', ml: 'Tiếng Malayalam', th: 'Tiếng Thái', ko: 'Tiếng Hàn', vi: 'Tiếng Việt' },
  cihazDili: 'Ngôn ngữ thiết bị',
  cihazDiliKullaniliyor: 'Hiện tại: {ad}',
  cihazDiliDesteklenmiyor: 'Ngôn ngữ thiết bị của bạn chưa được hỗ trợ; đang dùng tiếng Thổ Nhĩ Kỳ.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Bản dịch Beta đang được xem xét; một số nội dung có thể chưa hoàn chỉnh.',
    vakit: 'Ngôn ngữ không thay đổi cách tính giờ Salah.',
    nass: 'Ở các ngôn ngữ khác tiếng Thổ Nhĩ Kỳ, chỉ hiển thị bản dịch Qur’an; các bản Hadith lấy từ nguồn tiếng Thổ Nhĩ Kỳ nên không được hiển thị.',
  },
  ozelAnons: {
    baslik: 'Nội dung đọc to do bạn viết',
    govde: cogul({
      other: '{n} nội dung đọc to do bạn viết vẫn đang ở ngôn ngữ trước. Thay bằng nội dung soạn sẵn ở ngôn ngữ mới?',
    }),
    degistir: 'Thay bằng nội dung soạn sẵn',
    koru: 'Giữ nguyên',
    degisti: cogul({ other: 'Đã thay {n} nội dung.' }),
  },
  vakitAdlari: {
    baslik: 'Tên giờ Salah',
    aciklama: 'Chọn cách gọi tên các giờ Salah.',
    otomatik: 'Theo quốc gia',
    otomatikAciklama: 'Dùng tên phổ biến ở quốc gia nơi bạn đang ở.',
    takimlar: { temel: 'Tên Ả Rập', diyanetDe: 'Diyanet (tiếng Đức)', turkce: 'Tên Thổ Nhĩ Kỳ', magrip: 'Cách viết Maghreb', cezayir: 'Cách viết Algeria', afgan: 'Tên Afghanistan' },
  },
  yazi: {
    baslik: 'Bảng chữ cái',
    aciklama: 'Chọn bảng chữ cái dùng để viết nội dung.',
    otomatik: 'Theo quốc gia',
    otomatikAciklama: 'Dùng bảng chữ cái phổ biến ở quốc gia nơi bạn đang ở.',
    latin: 'Chữ Latinh',
    kiril: 'Chữ Kirin',
  },
  kaydedilemedi: 'Không thể lưu ngôn ngữ. Hãy thử lại.',
  sihirbazBaglantisi: 'Ngôn ngữ · Language',
  sihirbazBaglantisiAciklama: 'Đổi ngôn ngữ ứng dụng',
};
