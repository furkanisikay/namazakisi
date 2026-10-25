import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Sprache · Language',
  aciklama: 'Wählen Sie die Sprache der App. Auch Benachrichtigungen und das Vorlesen verwenden diese Sprache.',
  grup: 'App-Sprache',
  dilAdlari: { tr: 'Türkisch', en: 'Englisch', id: 'Indonesisch', de: 'Deutsch', fr: 'Französisch', bs: 'Bosnisch', ru: 'Russisch', ms: 'Malaiisch' },
  cihazDili: 'Gerätesprache',
  cihazDiliKullaniliyor: 'Derzeit {ad}',
  cihazDiliDesteklenmiyor: 'Die Sprache Ihres Geräts ist noch nicht verfügbar; Türkisch wird verwendet.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta-Übersetzungen werden noch geprüft; manche Texte können fehlerhaft sein.',
    vakit: 'Die Sprache ändert nichts an der Berechnung der Gebetszeiten.',
    nass: 'In anderen Sprachen als Türkisch werden nur Koranübersetzungen angezeigt; Hadith-Texte stammen aus einer türkischen Quelle und werden daher nicht angezeigt.',
  },
  ozelAnons: {
    baslik: 'Von Ihnen geschriebene Vorlesetexte',
    govde: cogul({
      one: '{n} von Ihnen geschriebener Vorlesetext ist noch in der vorherigen Sprache. Durch den fertigen Text in der neuen Sprache ersetzen?',
      other: '{n} von Ihnen geschriebene Vorlesetexte sind noch in der vorherigen Sprache. Durch die fertigen Texte in der neuen Sprache ersetzen?',
    }),
    degistir: 'Durch fertigen Text ersetzen',
    koru: 'Unverändert lassen',
    degisti: cogul({ one: '{n} Text ersetzt.', other: '{n} Texte ersetzt.' }),
  },
  kaydedilemedi: 'Die Sprache konnte nicht gespeichert werden. Versuchen Sie es erneut.',
  sihirbazBaglantisi: 'Sprache · Language',
  sihirbazBaglantisiAciklama: 'Sprache der App ändern',
};
