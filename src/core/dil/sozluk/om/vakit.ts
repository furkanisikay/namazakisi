import type { Sozluk } from '../tr';

/**
 * Oromo (Qubee). Vakit adları özel addır, cümle içinde de büyük harfle başlar (baha aduu hariç).
 * Kaynak: QuranEnc `oromo_ababor` (24:58, 50:39), byenah.com. "Ani salaateera" / "Salaatameera"
 * dilbilgisiyle türetildi (1. tekil geçmiş 3. tekil eril ile aynı yazıldığı için zamir açık) —
 * yerli okuyucu gözden geçirmeli.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subhii', gunes: 'Baha aduu', ogle: 'Zuhrii', ikindi: 'Asrii', aksam: 'Maghriba', yatsi: "Ishaa'ii" },
  buyuk: { imsak: 'SUBHII', gunes: 'BAHA ADUU', ogle: 'ZUHRII', ikindi: 'ASRII', aksam: 'MAGHRIBA', yatsi: "ISHAA'II" },
  kucuk: { imsak: 'Subhii', gunes: 'baha aduu', ogle: 'Zuhrii', ikindi: 'Asrii', aksam: 'Maghriba', yatsi: "Ishaa'ii" },
  imsakVakti: 'Subhii',
  cuma: 'Jimaata',
  cumaKucuk: 'Jimaata',
  gunesDogusu: 'Baha aduu',
  gunesDogusuKucuk: 'baha aduu',
  durum: { kilindi: 'Salaatameera', vaktiGeldi: 'Yeroon gaheera', girmedi: 'Yeroon hin geenye', gecti: 'Hin salaatamne' },
  durumKucuk: { kilindi: 'salaatameera', vaktiGeldi: 'yeroon gaheera', girmedi: 'yeroon hin geenye', gecti: 'hin salaatamne' },
  eylem: { kildim: 'Ani salaateera', kilindi: 'Salaatameera' },
  kerahatVakti: 'Yeroo jibbamaa',
  isaretle: 'Akka salaatameetti mallatteessaa',
  geriAlEtiketi: '{durum}, deebisuuf tuqaa',
  geriAlindi: 'Mallattoon haqameera',
};
