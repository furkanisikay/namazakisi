// Filipince (Latin; uygulama kodu `fil`, Android kaynağı `values-tl`): `buyuk` elle yazılır (`toUpperCase` YASAK; ñ → Ñ).
import type { Sozluk } from '../tr';

/**
 * Vakit adları HadeethEnc tl (Rowwad) yazımının diakritiksiz biçimi: Fajr, Dhuhr, Asr, Maghrib;
 * yatsı HE "'Eishah/`ishā" tutarsız → sade "Isha" (türetildi). Güneş doğuşu Tagalog
 * "pagsikat ng araw" (QE 20:130, HE 10604). Arapça adlar özel addır, cümle içinde de büyük
 * harfle başlar. Namaz "dasal", kılmak "magdasal" (QE, HE); "Kıldım" = "Nagdasal ako"
 * (HE 10638, kaynaklı); durum "Naidasal na" türetildi. Kerahat vakti karşılığı DOĞRULANMADI
 * ("makruh" alıntısı). Yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Pagsikat ng araw', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'PAGSIKAT NG ARAW', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'pagsikat ng araw', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: "Jumu'ah",
  cumaKucuk: "Jumu'ah",
  gunesDogusu: 'Pagsikat ng araw',
  gunesDogusuKucuk: 'pagsikat ng araw',
  durum: { kilindi: 'Naidasal na', vaktiGeldi: 'Oras na', girmedi: 'Hindi pa oras', gecti: 'Hindi naidasal' },
  durumKucuk: { kilindi: 'naidasal na', vaktiGeldi: 'oras na', girmedi: 'hindi pa oras', gecti: 'hindi naidasal' },
  eylem: { kildim: 'Nagdasal ako', kilindi: 'Naidasal na' },
  kerahatVakti: 'Makruh na oras',
  isaretle: 'Markahang naidasal na',
  geriAlEtiketi: '{durum}, i-tap para bawiin',
  geriAlindi: 'Inalis ang marka',
};
