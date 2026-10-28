import type { Sozluk } from '../tr';

/**
 * Felemenkçe terim kararları (serbest çeviri yok; diğer dosyalar ve native tablolar bunları kullanır):
 * vakit adları Fajr · Zonsopkomst · Dhuhr · Asr · Maghrib · Isha (Arapça adlar özel addır, cümle
 * içinde de büyük harfle başlar; yalnız "zonsopkomst" küçük yazılır); cuma "Djoemoe'a"; kıble
 * "qibla"; kaza "inhaalgebed (qada)", kısa yerde "qada"; Kaza Defteri "inhaallogboek"; nafile
 * "vrijwillige gebeden"; "Kıldım" = "Gebeden" (düğme), "Kılındı" = "Gebeden" (durum); kerahat
 * "makruh-tijd"; seri "reeks"; Namaz Muhafızı "Gebedswachter"; hesap yöntemi "berekeningsmethode";
 * ezan "adhan"; Allah kabul etsin "Moge Allah het accepteren". Hitap "u" ("je" yok).
 * Çizelgedeki sabah satırı "Imsak" DEĞİL, fecir adıdır (coklu-dil.md).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Zonsopkomst', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'ZONSOPKOMST', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'zonsopkomst', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: "Djoemoe'a",
  cumaKucuk: "Djoemoe'a",
  gunesDogusu: 'Zonsopkomst',
  gunesDogusuKucuk: 'zonsopkomst',
  durum: { kilindi: 'Gebeden', vaktiGeldi: 'Tijd om te bidden', girmedi: 'Nog niet begonnen', gecti: 'Niet gebeden' },
  durumKucuk: { kilindi: 'gebeden', vaktiGeldi: 'tijd om te bidden', girmedi: 'nog niet begonnen', gecti: 'niet gebeden' },
  eylem: { kildim: 'Gebeden', kilindi: 'Gebeden' },
  kerahatVakti: 'Makruh-tijd',
  isaretle: 'Als gebeden markeren',
  geriAlEtiketi: '{durum}, tik om ongedaan te maken',
  geriAlindi: 'Markering verwijderd',
};
