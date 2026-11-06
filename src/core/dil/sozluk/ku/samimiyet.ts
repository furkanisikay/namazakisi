import type { Sozluk } from '../tr';

/**
 * Kurmancî axêverên Misilman kalıpları (çeviri değil): namaz sonrası "Xwedê qebûl bike" (Allah
 * kabul etsin; Behdinî meal 2:127 "قەبویل بكە" kökü, Soranî "خوا قبوڵی بکات" emsali, iki yuva),
 * "Qebûl be" (kabul olsun), "Xwedê ji me û we qebûl bike" (bizden ve sizden kabul etsin).
 * Selamlar "… pîroz be" (Cejna we pîroz be) ve "… bi xêr be" (Sibeha we bi xêr be) kalıbıyla.
 * Hepsi yerli okuyucuyla DOĞRULANMADI. Kandil ve hicrî yılbaşı selamı ülke başınadır
 * (`selam.ts`; TR listede), Diyanet geleneğindeki adlarla.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Bi xêr û bereket be.',
  kabulDualari: ['Xwedê qebûl bike', 'Qebûl be', 'Xwedê qebûl bike', 'Xwedê ji me û we qebûl bike'],
  kabulDuasi: 'Xwedê qebûl bike',
  ekSabah: 'Sibeha we bi xêr be',
  ekYatsi: 'Şeva we bi xêr be',
  tamGunAna: 'Xwedê qebûl bike',
  tamGunAlt: 'We îro her pênc nimêj temam kirin.',
  kazaKabul: 'Qezayeke {vakit} ji deftera we hate kêmkirin. {dua}.',
  kandilGeceleri: {
    regaib: 'Şeva Regaibê pîroz be',
    mirac: 'Şeva Îsra û Mîracê pîroz be',
    berat: 'Şeva Beratê pîroz be',
    mevlid: 'Mewlûda Pêxember pîroz be',
  },
  selamlar: {
    sahur: 'Paşîva we bi xêr be',
    bayram: 'Cejna we pîroz be',
    iftar: 'Fitara we bi xêr be',
    kadir: 'Şeva Qedrê pîroz be',
    arefe: 'Roja Erefeyê pîroz be',
    hicriYilbasi: 'Sala nû ya koçî pîroz be',
    cuma: 'Îniya we pîroz be',
    ramazan: 'Remezana we pîroz be',
    sabah: 'Sibeha we bi xêr be',
  },
};
