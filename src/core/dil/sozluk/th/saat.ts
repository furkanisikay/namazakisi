// ÇEVİRİ: th — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'On the phone',
    telefonAciklama: 'The Fajr alarm and the Tahajjud wake-up ring on your phone.',
    saatBaslik: 'On the watch, silently',
    saatAciklama:
      "Only your wrist vibrates, so whoever sleeps beside you isn't woken. If you don't dismiss it on the watch, your phone rings as a backup {dk} minutes later. If Namaz Akışı isn't on your watch or isn't up to date, your phone rings {dk} minutes late every morning.",
    saatAciklamaIos:
      "Only your wrist vibrates, so whoever sleeps beside you isn't woken. If you don't dismiss it on the watch, your iPhone rings as a backup {dk} minutes later.",
    ikisiBaslik: 'On both',
    ikisiAciklama: 'The watch and phone ring together; dismissing it on the watch also silences the phone.',
    ikisiAciklamaIos: 'The watch and iPhone ring together; dismissing it on the watch also silences the iPhone.',
  },
  anons: {
    otomatikBaslik: "On the phone, on the watch when it's away",
    otomatikAciklama:
      "When your phone is with you, your phone reads aloud and your watch deliberately stays quiet (so both devices don't read the same sentence). When your phone is away, your watch reads aloud.",
    saatBaslik: 'Only on the watch',
    saatAciklama:
      "Your watch always reads aloud and your phone stays quiet. While your watch is charging, isn't connected to your phone or doesn't have Namaz Akışı, nothing is read aloud; if you don't want that, use the first option.",
    telefonBaslik: 'Only on the phone',
    telefonAciklama: 'Your watch never speaks.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'If Namaz Akışı is installed on your Apple Watch, it shares the work with your iPhone. Here you choose where the wake-up rings.',
    giris:
      'If Namaz Akışı is installed on your watch, it shares the work with your phone. Here you choose where the wake-up rings and where announcements are read aloud.',
    uyandirmaBaslik: 'Where should the wake-up ring?',
    uyandirmaNotu:
      'The wake-up is the real alarm you turn on for Fajr in the "Before time ends" reminder and the Tahajjud wake-up you turn on in Nafl prayers.',
    uyandirmaNotuIos:
      "watchOS can only set a silent alarm while the watch app is open: open Namaz Akışı on your watch once a day and the next wake-up is set then. While the watch is charging or if the app wasn't opened, your iPhone's backup rings.",
    uyandirmaNotuAndroid: "Your watch doesn't ring while charging; your phone rings instead.",
    muhafizAyarlari: 'Open "Before time ends" settings',
    nafileAyarlari: 'Open Nafl prayer settings',
    bilektenBaslik: 'What you can do from your wrist',
    bilektenIos: [
      "When your iPhone is away, reminders ring on your watch; they don't ring on both.",
      'You mark the prayers you have prayed from your wrist; your iPhone records them.',
      'You count tasbih with the Digital Crown and find the Qibla on your watch.',
    ],
    anonsBaslik: 'Where should read aloud happen?',
    anonsNotu:
      "Only reminders with read aloud turned on are read. The two devices don't read the same sentence together. Your watch also stays quiet while you're at the mosque or Prayer mode is on. If your watch has no speaker, text-to-speech engine or a voice in the app's language, it only vibrates. You can test the watch's sound right away with \"Test the sound\" in the Namaz Akışı watch app.",
    bilekten: [
      'You can turn Prayer mode on and off with the button on the watch (until the end of the prayer time, at most 30 minutes).',
      'At the mosque, your watch shows the status; you answer "This isn\'t a mosque" and "Are you at the mosque?" from your wrist.',
      'Screens that don\'t fit on the watch (Qada log, At the mosque, settings) open on your phone with "Open on phone".',
    ],
    namazModuNotu: 'To turn on Prayer mode from the watch, first turn it on once on your phone.',
    namazModuAyarlari: 'Open Prayer mode settings',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Where the wake-up rings',
    saatOzet: 'Where the wake-up rings and reads aloud',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Live countdowns',
    geriSayim: 'Countdown',
    gelismisErisim: "Advanced. Automations and apps that mark I've prayed",
    gelismis: 'Advanced',
    otomasyonlar: 'Automations',
    otomasyonBaslik: 'Use with automations',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: "Apps that mark I've prayed",
    kildimOzet: 'Apps you have allowed',
  },
};
