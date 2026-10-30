import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Sesli okuma: ibadete çağrı tekil "Ka …" emriyle, kısa; "secde" yok. Takvim şablonları Türkçede
 * "siz" olduğu için 2. çoğul "ku". Sıra Türkçe şablonlarla BİREBİR eşleşir. "minti {süre}": Hausa'da
 * sayı addan sonra gelir, ad çekilmez.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'sun rage', girisindenItibaren: 'sun wuce' },
  cip: { vakit: 'Sunan salla', sure: 'Mintuna', yon: 'sun rage / sun wuce', cuma: 'Jumuʼa', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Lokacin {vakit} yana ƙarewa, saura minti {süre}.',
      'Kada ka bar {vakit} ta kuɓuce maka, saura minti {süre}.',
      'Lokaci yana ƙurewa, saura minti {süre} {vakit} ta ƙare.',
    ],
    muhafizGiris: [
      'Lokacin {vakit} ya yi, minti {süre} sun wuce.',
      'Kada ka jinkirta {vakit}, minti {süre} sun wuce.',
      'Lokaci yana tafiya, ka tsayar da sallar {vakit}, an yi minti {süre}.',
    ],
    nafile: [
      'Lokacin {vakit}, minti {süre} {yön}. Lokaci mai kyau don rakaʼa biyu.',
      'Lokacin {vakit} yana nan. Dama ce mai kyau ta yin rakaʼa biyu.',
      'Minti {süre} {yön} don {vakit}.',
    ],
    cuma: [
      'Saura minti {süre} zuwa sallar Jumuʼa. Ka shirya ka tafi masallaci.',
      'Lokacin Jumuʼa yana gabatowa, saura minti {süre}.',
      'Ka riski huɗuba, saura minti {süre} zuwa Jumuʼa.',
    ],
    camiyeGit: [
      'Saura minti {süre} zuwa {vakit}. Ka tafi masallaci.',
      'Lokacin zuwa masallaci ne, saura minti {süre} zuwa {vakit}.',
      'Ka tafi masallaci don sallar {vakit}.',
    ],
    yatis: ['Ka yi sallar Isha kafin ka kwanta.', 'Lokacin Isha yana nan, ka tsayar da salla kafin ka yi barci.', 'Kada ka yi barci kafin ka yi sallar Isha.'],
    takvim: [
      'Wani taro a kalandarku ya faɗa a lokacin {vakit}.',
      'Lokacin {vakit} ya ci karo da wani taro; kada ku manta ku fara yin salla.',
      'Bayan minti {süre} lokacin {vakit} zai ci karo da taronku; kada ku manta da salla.',
    ],
  },
  otomatik: {
    cuma: 'Saura {sure} zuwa Azahar don Jumuʼa. Ka shirya ka tafi masallaci.',
    camiyeGiris: 'Saura {sure} zuwa {vakit}.',
    camiyeHazirlan: 'Ka shirya ka tafi masallaci.',
    camiyeYola: 'Ka tafi masallaci.',
    takvimGiris: 'Wani taro a kalandarku ya faɗa a lokacin {vakit}.',
    takvimOnce: 'Kada ku manta ku yi salla kafin taron.',
    takvimKaplar: 'Kada ku manta ku ɗan huta ku yi salla.',
    yatsi: 'Ka yi sallar Isha kafin ka kwanta.',
    muhasebeTek: 'Da alama ba a yi alamar {vakit} ba yau.',
    muhasebeCoklu: cogul({ one: 'Da alama ba a yi alamar salla {n} ba yau.', other: 'Da alama ba a yi alamar salloli {n} ba yau.' }),
    geceCapasi: 'Lokacin shiru zai fara cikin minti {süre}. Ka yi sallar {vakit} kafin ka kwanta.',
    kuslukSuruyor: 'Lokacin Walaha yana nan.',
    kuslukGirdi: 'Lokacin Walaha ya yi. Lokaci mai kyau don rakaʼa biyu.',
    kuslukBitiyor: cogul({ one: 'Minti {n} ya rage a lokacin Walaha.', other: 'Minti {n} sun rage a lokacin Walaha.' }),
    evvabinSuruyor: 'Akwai sauran lokaci don Awwabin.',
    evvabinGirdi: 'Lokacin Awwabin. Lokaci mai kyau don rakaʼa biyu.',
    evvabinKalan: cogul({ one: 'Minti {n} ya rage don Awwabin.', other: 'Minti {n} sun rage don Awwabin.' }),
    teheccudSonUcte: 'Lokacin Tahajjudi. Kashi na uku na ƙarshe na dare ya fara.',
    teheccudKalan: cogul({ one: 'Lokacin Tahajjudi. Minti {n} ya rage zuwa Asuba.', other: 'Lokacin Tahajjudi. Minti {n} sun rage zuwa Asuba.' }),
  },
};
