import type { Sozluk } from '../tr';

/**
 * Lingala konuşan Müslümanların kalıpları (çeviri değil). Kaynaklı birebir "Allah kabul etsin"
 * kalıbı bulunamadı: "Allah andimela" QE 2:127 "Ndimela biso" ("kabul et bizden") kökünden
 * türetildi, Allah adı ana oturum kararıyla "Allah"; "Allah apambola" ("Allah bereket versin")
 * HadeethEnc ln'deki salavat kalıbından ("Nzambe apambola ye"). Yerli okuyucu bakmalı. Kandil ve
 * hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir; buradaki karşılıklar tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Allah apambola yango.',
  kabulDualari: ['Allah andimela bino', 'Allah andima yango', 'Allah andimela biso', 'Nkolo na biso andima yango'],
  kabulDuasi: 'Allah andimela bino',
  ekSabah: 'Ntɔngɔ ya lipamboli',
  ekYatsi: 'Butu ya lipamboli',
  tamGunAna: 'Allah andimela bino',
  tamGunAlt: 'Bosambeli losambo nyɔnsɔ mitano lɛlɔ.',
  kazaKabul: 'Qada mɔkɔ ya {vakit} elongwami na buku na bino. {dua}.',
  kandilGeceleri: {
    regaib: 'Butu ya lipamboli ya Raghaib',
    mirac: "Isra mpe Mi'raj ya lipamboli",
    berat: "Butu ya lipamboli ya Bara'a",
    mevlid: 'Mawlid ya lipamboli',
  },
  selamlar: {
    sahur: 'Suhur ya lipamboli',
    bayram: 'Eid Mubarak',
    iftar: 'Iftar ya lipamboli',
    kadir: 'Laylat al-Qadr ya lipamboli',
    arefe: 'Lipamboli na mokɔlɔ liboso ya Eid',
    hicriYilbasi: 'Mbula ya sika ya Hijri ya lipamboli',
    cuma: "Jumu'a Mubarak",
    ramazan: 'Ramadan Mubarak',
    sabah: 'Ntɔngɔ ya lipamboli',
  },
};
