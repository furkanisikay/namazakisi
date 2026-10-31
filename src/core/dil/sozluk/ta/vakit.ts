import type { Sozluk } from '../tr';

/**
 * Tamilce vakit adları (IslamQA Tamilce ve TNTJ yazımı; ض/ظ için ல, /f/ /ğ/ için ஃ):
 * ஃபஜ்ர் · சூரிய உதயம் · லுஹர் · அஸர் · மஃரிப் · இஷா; cuma ஜுமுஆ (meal 62:9). Tamil yazısında
 * büyük/küçük harf yok: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`)
 * fecir adıdır, "Imsak" değil. "சூரிய உதயம்" dinî terim değil, gündelik Tamilce (isim biçimi
 * kaynakla DOĞRULANMADI). Terimler: namaz தொழுகை · Kıldım = "தொழுதேன்" (TNTJ hadis çevirisi) ·
 * Kılındı = "தொழுதாகிவிட்டது" (türetildi, DOĞRULANMADI) · kaza களா (களா தொழுகை) · nafile
 * சுன்னத் · kerahat "தொழக் கூடாத நேரம்" (TNTJ) · kıble கிப்லா · cami பள்ளிவாசல் · ezan பாங்கு ·
 * abdest உளூ · kuşluk லுஹா · teheccüd தஹஜ்ஜுத் · vitir வித்ர் · seri தொடர் · Namaz Muhafızı
 * "தொழுகைக் காவலர்" · hesap yöntemi "கணக்கீட்டு முறை". Yönetim kipi நீங்கள் + ‑வும்/‑ங்கள்,
 * düğme kısa ‑க (தொடர்க); ibadete çağrı ‑ங்கள் ("தொழுகையை நிலைநிறுத்துங்கள்"), mealdeki
 * ‑வீராக ve çıplak நீ emri YOK. Rakam Batı (0-9).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ஃபஜ்ர்', gunes: 'சூரிய உதயம்', ogle: 'லுஹர்', ikindi: 'அஸர்', aksam: 'மஃரிப்', yatsi: 'இஷா' },
  buyuk: { imsak: 'ஃபஜ்ர்', gunes: 'சூரிய உதயம்', ogle: 'லுஹர்', ikindi: 'அஸர்', aksam: 'மஃரிப்', yatsi: 'இஷா' },
  kucuk: { imsak: 'ஃபஜ்ர்', gunes: 'சூரிய உதயம்', ogle: 'லுஹர்', ikindi: 'அஸர்', aksam: 'மஃரிப்', yatsi: 'இஷா' },
  imsakVakti: 'ஃபஜ்ர்',
  cuma: 'ஜுமுஆ',
  cumaKucuk: 'ஜுமுஆ',
  gunesDogusu: 'சூரிய உதயம்',
  gunesDogusuKucuk: 'சூரிய உதயம்',
  durum: { kilindi: 'தொழுதாகிவிட்டது', vaktiGeldi: 'தொழும் நேரம்', girmedi: 'இன்னும் நேரமாகவில்லை', gecti: 'தொழவில்லை' },
  durumKucuk: { kilindi: 'தொழுதாகிவிட்டது', vaktiGeldi: 'தொழும் நேரம்', girmedi: 'இன்னும் நேரமாகவில்லை', gecti: 'தொழவில்லை' },
  eylem: { kildim: 'தொழுதேன்', kilindi: 'தொழுதாகிவிட்டது' },
  kerahatVakti: 'தொழக் கூடாத நேரம்',
  isaretle: 'தொழுததாகக் குறிக்கவும்',
  geriAlEtiketi: '{durum}, செயல்தவிர்க்கத் தட்டவும்',
  geriAlindi: 'குறி நீக்கப்பட்டது',
};
