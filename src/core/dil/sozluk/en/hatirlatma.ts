import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const hatirlatma: Sozluk['hatirlatma'] = {
  duzeyAdlari: { kapali: 'Off', hafif: 'Light', normal: 'Normal', yogun: 'Frequent' },
  fark: {
    dahaAz: 'fewer alerts',
    dahaCok: 'more alerts',
    dahaErken: 'starts earlier',
    dahaGec: 'starts later',
    sesliEk: '+ read aloud',
    sesliYok: 'no read aloud',
  },
  ozel: {
    ad: 'Your own setting',
    secili: 'You set each prayer yourself',
    geri: 'Return to your saved setting',
    cumle: 'Each prayer is reminded the way you set it.',
  },
  cumle: {
    kapali: 'No reminders before a prayer time ends.',
    sesliVar: 'Reads it aloud in the last minutes.',
    sesliYok: 'No read aloud.',
    birKez: 'Reminds you once, {dk} min before it ends. {ses}',
    coklu: cogul({ one: 'Starts {dk} min before it ends, {n} alert. {ses}', other: 'Starts {dk} min before it ends, {n} alerts. {ses}' }),
  },
  sesliBilgi: {
    alarm: 'Read aloud works like an alarm: you hear it in silent mode and Do Not Disturb too.',
    bildirim: 'Read aloud plays with the notification sound; you won’t hear it while the phone is on silent.',
  },
  kisa: {
    yok: 'No reminders',
    uyari: cogul({ one: '{n} alert per prayer', other: '{n} alerts per prayer' }),
    uyariSesli: cogul({ one: '{n} alert per prayer, read aloud', other: '{n} alerts per prayer, read aloud' }),
  },
  secici: {
    eskiAciklama: 'Your previous setting',
    eskiGuncelle: 'Apply the new recommendation',
    eskiKullaniliyor: 'Your previous {duzey} setting is in use.',
    eskiGuncelleEtiket: '{eylem}: current {duzey} level',
    eskiGuncelleEtiketFark: '{eylem}: current {duzey} level, {fark}',
    erisimEtiketi: 'Reminder level',
  },
  onizleme: {
    vakitCikar: 'Prayer time ends',
    hatirlatmaYok: 'No reminders',
    dk: '{dk} min',
  },
};
