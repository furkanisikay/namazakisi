// Gürcüce (Mkhedruli) büyük/küçük harf ayrımı taşımaz (`buyuk` = `adlar`; Mtavruli büyük harfleri kullanılmaz).
import type { Sozluk } from '../tr';

/**
 * Vakit adları QuranEnc `georgian_rwwad` 17:78 + HadeethEnc ka: ფაჯრი · მზის ამოსვლა · ზუჰრი ·
 * ასრი · მაღრიბი · იშა. Namaz "ლოცვა" (QE/HE), cuma "პარასკევის ლოცვა" (QE 62:9). Ad cümlede
 * yalın (nominatif) kalır; yer tutuculu kalıplar adı özne ya da iki noktadan sonra kullanır.
 * "Kıldım" = "ვილოცე" (HE 10945, kaynaklı); durum "შესრულებულია" türetildi. Kerahat vakti
 * "აკრძალული დრო" (HE 10604 betimlemesinden, türetildi). Yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ფაჯრი', gunes: 'მზის ამოსვლა', ogle: 'ზუჰრი', ikindi: 'ასრი', aksam: 'მაღრიბი', yatsi: 'იშა' },
  buyuk: { imsak: 'ფაჯრი', gunes: 'მზის ამოსვლა', ogle: 'ზუჰრი', ikindi: 'ასრი', aksam: 'მაღრიბი', yatsi: 'იშა' },
  kucuk: { imsak: 'ფაჯრი', gunes: 'მზის ამოსვლა', ogle: 'ზუჰრი', ikindi: 'ასრი', aksam: 'მაღრიბი', yatsi: 'იშა' },
  imsakVakti: 'ფაჯრი',
  cuma: 'პარასკევის ლოცვა',
  cumaKucuk: 'პარასკევის ლოცვა',
  gunesDogusu: 'მზის ამოსვლა',
  gunesDogusuKucuk: 'მზის ამოსვლა',
  durum: { kilindi: 'შესრულებულია', vaktiGeldi: 'ლოცვის დროა', girmedi: 'ჯერ არ დამდგარა', gecti: 'არ შესრულებულა' },
  durumKucuk: { kilindi: 'შესრულებულია', vaktiGeldi: 'ლოცვის დროა', girmedi: 'ჯერ არ დამდგარა', gecti: 'არ შესრულებულა' },
  eylem: { kildim: 'ვილოცე', kilindi: 'შესრულებულია' },
  kerahatVakti: 'აკრძალული დრო',
  isaretle: 'შესრულებულად მონიშვნა',
  geriAlEtiketi: '{durum}, შეეხეთ გასაუქმებლად',
  geriAlindi: 'მონიშვნა მოიხსნა',
};
