// Litvancada `buyuk` elle yazılır (`toUpperCase` YASAK; ą č ę ė į š ų ū ž → Ą Č Ę Ė Į Š Ų Ū Ž).
import type { Sozluk } from '../tr';

/**
 * Terim kararları (kaynak: dalga 13 terim tablosu > Litvanca). Vakit adları Litvanya Müftülüğü
 * çizelgesinden ("Maldų laikai"; Šaltinis: Diyanet): Fajr · Saulėtekis · Dhuhr · Asr · Maghrib ·
 * Isha. Arapça adlar özel addır, cümle içinde de büyük harfle başlar ve ÇEKİLMEZ; çekim "malda"
 * sözcüğündedir ("Dhuhr malda", "Asr maldos laikas"). Yalnız "saulėtekis" cins isimdir. Cuma
 * "Džumua" (müftülük "penktadienio Džumua malda"). Namaz = "malda" (QE, HE, müftülük). "Kıldım"
 * = "Atlikau maldą" (HE 65097 "atliko maldą"; 1. tekil cinsiyetsiz, türetildi), durum "Atlikta"
 * (malda dişil). Kaza "praleista malda" (HE 65088 fiil kalıbı; isim DOĞRULANMADI), nafile
 * "savanoriška malda" (HE 3732), kıble "kibla", kerahat "nepageidautinas laikas" (HE
 * "nepageidautina" = mekruh; terim DOĞRULANMADI).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Saulėtekis', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SAULĖTEKIS', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'saulėtekis', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  /** Çizelge satırı fecir adıdır (müftülük çizelgesinin ilk satırı "Fajr"). */
  imsakVakti: 'Fajr',
  cuma: 'Džumua',
  cumaKucuk: 'Džumua',
  gunesDogusu: 'Saulėtekis',
  gunesDogusuKucuk: 'saulėtekis',
  durum: { kilindi: 'Atlikta', vaktiGeldi: 'Maldos laikas', girmedi: 'Dar ne laikas', gecti: 'Neatlikta' },
  durumKucuk: { kilindi: 'atlikta', vaktiGeldi: 'maldos laikas', girmedi: 'dar ne laikas', gecti: 'neatlikta' },
  eylem: { kildim: 'Atlikau maldą', kilindi: 'Atlikta' },
  kerahatVakti: 'Nepageidautinas laikas',
  isaretle: 'Pažymėti kaip atliktą',
  geriAlEtiketi: '{durum}, palieskite, kad atšauktumėte',
  geriAlindi: 'Žymėjimas atšauktas',
};
