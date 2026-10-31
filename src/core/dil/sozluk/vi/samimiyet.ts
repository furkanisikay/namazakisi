import type { Sozluk } from '../tr';

/**
 * Vietnamca konuşan Müslümanların kalıpları (çeviri değil): fiil kökü "chấp nhận" QuranEnc
 * `vietnamese_rwwad` 2:127 ("xin Ngài chấp nhận việc làm này của bầy tôi") ve 5:27; Çam cemaatinin
 * Arapça litürjisinden "Taqabbal Allahu minna wa minkum"; bayram ve cuma için Arapça "Mubarak"
 * kalıpları. Kandil ve hicrî yılbaşı selamı Vietnam'da söylenmez (`selam.ts > KANDIL_ULKELERI`);
 * buradaki karşılıklar tip bütünlüğü içindir. Yerli okuyucuyla DOĞRULANMADI.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Cầu xin Allah ban phúc lành.',
  kabulDualari: ['Cầu xin Allah chấp nhận', 'Taqabbal Allahu minna wa minkum', 'Cầu xin Allah chấp nhận', 'Cầu xin Thượng Đế chấp nhận việc làm của chúng ta'],
  kabulDuasi: 'Cầu xin Allah chấp nhận',
  ekSabah: 'Chúc buổi sáng an lành',
  ekYatsi: 'Chúc buổi tối an lành',
  tamGunAna: 'Cầu xin Allah chấp nhận',
  tamGunAlt: 'Hôm nay bạn đã hành lễ đủ năm lần Salah.',
  kazaKabul: 'Đã trừ một lần Salah bù {vakit} khỏi sổ của bạn. {dua}.',
  kandilGeceleri: {
    regaib: 'Đêm Raghaib phúc lành',
    mirac: 'Isra’ và Mi‘raj phúc lành',
    berat: 'Đêm Bara’ah phúc lành',
    mevlid: 'Mawlid phúc lành',
  },
  selamlar: {
    sahur: 'Bữa Suhur an lành',
    bayram: 'Eid Mubarak',
    iftar: 'Bữa Iftar an lành',
    kadir: 'Đêm Laylatul Qadr phúc lành',
    arefe: 'Đêm trước Eid phúc lành',
    hicriYilbasi: 'Năm mới Hijri phúc lành',
    cuma: 'Jumu’ah Mubarak',
    ramazan: 'Ramadan Mubarak',
    sabah: 'Chúc buổi sáng an lành',
  },
};
