import type { Sozluk } from '../tr';

/** CLDR (az): ay adları tarix içində kiçik hərflə ("29 oktyabr 2026"), tək başına başlıqda böyük hərflə. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'],
  gunlerKisa: ['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'],
  aylar: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
  aylarYalin: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  aylarKisa: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
  /** Bazar ertəsi başlayır. */
  haftaHarfleri: ['Be', 'Ça', 'Çə', 'Ca', 'Cü', 'Şə', 'Ba'],
  uzun: '{gun} {ay} {yil}',
};
