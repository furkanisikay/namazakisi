import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** `dilAdlari`: CLDR ff adları; CLDR'de olmayanlar (bs, sq, ps, ckb, ug, az, uz, kk, ky, tg, sw, om) "-eere" kalıbıyla türetildi. */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ɗemngal · Dil',
  aciklama: 'Suɓee ɗemngal jaaɓngal ngal. Tintine e janngugol e hito huutortoo ngal kadi.',
  grup: 'Ɗemngal jaaɓngal',
  dilAdlari: { tr: 'Turkeere', en: 'Engeleere', id: 'Endonesiire', de: 'Docceere', fr: 'Farayseere', bs: 'Bosniyeere', ru: 'Riis', ms: 'Malayeere', ar: 'Aarabeere', ur: 'Urdu', es: 'Español', nl: 'Dacceere', sq: 'Albaniyeere', hi: 'Hinndi', bn: 'Bengali', fa: 'Perseere', ps: 'Pastooere', ckb: 'Kurdeere Hakkundeere', ug: 'Uyguureere', az: 'Ajerbayjaneere', uz: 'Usbekeere', kk: 'Kasakeere', ky: 'Kirgiseere', tg: 'Tajikeere', sw: 'Swahiliyeere', ha: 'Hawsaŋkoore', am: 'Amarik', om: 'Oromoore', so: 'Somalii', ff: 'Pular', yo: 'Yorrubaa' },
  cihazDili: 'Ɗemngal kaɓirgal',
  cihazDiliKullaniliyor: 'Jooni {ad}',
  cihazDiliDesteklenmiyor: 'Ɗemngal kaɓirgal mon heɓaaka haa jooni; Turkeere ko huutortee.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Firooji Beta hino ndaaree; won binndi waawi wonde ko timmaani.',
    vakit: 'Ɗemngal ngal waylataa no saa’iiji juulɗe hiisirtee.',
    nass: 'E ɗemɗe ɗe wonaa Turkeere, firooji Alqur’aana tan ɓannginte; binndi hadiis ɗin iwi ko e iwdi Turkeere, ɗum noon ɗi ɓannginteeke.',
  },
  ozelAnons: {
    baslik: 'Binndi janngugol e hito ɗi on mbinndi',
    govde: cogul({
      one: '{n} binndol ngol on mbinndi ngam janngugol e hito hino heddii e ɗemngal adiingal. Lomtinee ngol binndol moƴƴinaangol e ɗemngal hesngal?',
      other: '{n} binndi ɗi on mbinndi ngam janngugol e hito hino heddii e ɗemngal adiingal. Lomtinee ɗi binndi moƴƴinaaɗi e ɗemngal hesngal?',
    }),
    degistir: 'Lomtinee binndi moƴƴinaaɗi',
    koru: 'Accee no woni',
    degisti: cogul({ one: '{n} binndol lomtinaama.', other: '{n} binndi lomtinaama.' }),
  },
  vakitAdlari: {
    baslik: 'Inɗe juulɗe',
    aciklama: 'Suɓee no inɗe saa’iiji juulɗe mbinndirtee.',
    otomatik: 'Rewrude e leydi',
    otomatikAciklama: 'Huutortoo inɗe ɓurɗe huutoreede e leydi nokkuure mon.',
    takimlar: { temel: 'Inɗe Aarabeere', diyanetDe: 'Diyanet (Docceere)', turkce: 'Inɗe Turkeere', magrip: 'Binndol Magrib', cezayir: 'Binndol Alaseri', afgan: 'Inɗe Afganistaan' },
  },
  yazi: {
    baslik: 'Binndol',
    aciklama: 'Suɓee binndol ngol binndi mbinndirtee.',
    otomatik: 'Rewrude e leydi',
    otomatikAciklama: 'Huutortoo binndol ɓurngol huutoreede e leydi nokkuure mon.',
    latin: 'Binndol Latin',
    kiril: 'Binndol Siril',
  },
  kaydedilemedi: 'Ɗemngal ngal mooftaaki. Etee kadi.',
  sihirbazBaglantisi: 'Ɗemngal · Dil',
  sihirbazBaglantisiAciklama: 'Waylee ɗemngal jaaɓngal ngal',
};
