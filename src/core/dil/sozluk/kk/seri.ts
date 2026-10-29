// ÇEVİRİ: kk — İngilizce iskelet; çeviri KİRİL yazılır (Latin biçim çalışma anında `kirildenLatine`, core/dil/yazi.ts), çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Your streak is burning',
    enUzun: cogul({ one: 'Longest streak: {n} day', other: 'Longest streak: {n} days' }),
    gunBuyuk: cogul({ one: 'DAY', other: 'DAYS' }),
    sonrakiHedef: 'Next goal: day {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} day left', other: '{n} days left' }),
    tamamlandi: 'Completed!',
    paylasErisim: 'Share your progress',
    paylasBuyuk: 'SHARE YOUR PROGRESS',
  },

  hedefler: {
    ilk_adim: { ad: 'First Week', aciklama: 'Pray for 7 days without a break', cumle: 'First week' },
    aliskanlik_ustasi: { ad: 'Habit Master', aciklama: '21 days - habit-building period', cumle: 'Habit master' },
    kararlilik: { ad: 'Steadfastness', aciklama: '60 days without a break', cumle: 'Steadfastness' },
    efsane: { ad: 'Legend', aciklama: '90 days - outstanding perseverance', cumle: 'Legend' },
  },

  /** Classical rank names, transliterated (not translated). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'First Step', aciklama: 'You completed your first week!', kosul: '7-day streak' },
    aliskanlik_ustasi: {
      ad: 'Habit Master',
      aciklama: '21 days - habit-building period completed!',
      kosul: '21-day streak',
    },
    kararlilik: { ad: 'Steadfast', aciklama: 'You prayed for 60 days without a break!', kosul: '60-day streak' },
    efsane: { ad: 'Legend', aciklama: '90 days - you showed outstanding perseverance!', kosul: '90-day streak' },
    toparlanma_ustasi: {
      ad: 'Recovery Master',
      aciklama: 'You completed recovery mode 3 times!',
      kosul: '3 recoveries',
    },
    mukemmeliyetci: { ad: 'Perfectionist', aciklama: 'You prayed 5/5 for 30 days!', kosul: '30 days of 5/5 prayers' },
    yuz_namaz: { ad: '100 Prayers', aciklama: 'You prayed 100 prayers in total!', kosul: 'Pray 100 prayers' },
    bin_namaz: { ad: '1000 Prayers', aciklama: 'You prayed 1000 prayers in total!', kosul: 'Pray 1000 prayers' },
  },

  rozetSeviyeleri: { bronz: 'BRONZE', gumus: 'SILVER', altin: 'GOLD', elmas: 'DIAMOND' },

  gunBitis: {
    erken: 'For early sleepers',
    varsayilan: 'Default - before Fajr in most places',
    gec: 'For late sleepers',
  },

  kutlama: {
    rozetEklendi: '🏅 Added to your badge collection',
    paylasin: 'Share',
    rozetBaslik: 'May Allah make it lasting',
    rozetMesaj: 'You earned the "{ad}" badge.',
    hedefBaslik: cogul({ one: '{n} day', other: '{n} days' }),
    hedefMesaj: 'You completed the "{ad}" goal. May Allah make it lasting.',
    yeniRank: 'New rank: {rank}',
    seviyeBaslik: 'Your new level',
    seviyeMesaj: 'You now continue as "{rank}". May Allah make it lasting.',
    toparlanmaBaslik: 'Your streak is back',
    toparlanmaMesaj: cogul({
      one: 'Your {n}-day streak continues where it left off. May Allah grant steadfastness.',
      other: 'Your {n}-day streak continues where it left off. May Allah grant steadfastness.',
    }),
    enUzunBaslik: 'Your longest streak',
    enUzunMesaj: cogul({
      one: '{n} day: your longest streak so far. May Allah make it lasting.',
      other: '{n} days: your longest streak so far. May Allah make it lasting.',
    }),
  },

  sekme: {
    hataOkunamadi: "Your past records couldn't be read right now.",
    yenidenErisim: 'Retry loading streak data',
    yenidenDeneyin: 'Try again',
    yukleniyor: 'Loading your streak data...',
    gunlukSeri: 'day streak',
    rekor: 'record',
    sozErisim: '{metin} Source: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Next goal',
    tumu: 'You completed all badges',
    kalan: cogul({ one: '{ad} badge: {n} day left', other: '{ad} badge: {n} days left' }),
    tumuErisim: 'You completed all badges: the tasbih is full.',
    erisim: '{ad} badge: {n} of {hedef} days completed.',
  },

  gok: {
    gunHarfleri: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} day met the goal', other: '{n} days met the goal' }),
    besVakit: cogul({ one: '{n} day with all five prayers', other: '{n} days with all five prayers' }),
    dondurulmus: cogul({ one: '{n} day frozen', other: '{n} days frozen' }),
    mevcutSeri: cogul({ one: 'Current streak: {n} day.', other: 'Current streak: {n} days.' }),
  },

  hedefAyar: {
    azalt: 'Decrease',
    deger: 'Value',
    artir: 'Increase',
    esik: cogul({ one: '{n} prayer', other: '{n} prayers' }),
    sifirlaBaslik: 'Reset streak',
    sifirlaMesaj: 'All your streak data (streak, badges, points) will be reset. This cannot be undone. Do you want to continue?',
    sifirla: 'Reset',
    iptal: 'Cancel',
    basarili: 'Done',
    sifirlandi: 'Your streak data has been reset.',
    hedefAyarlari: 'GOAL SETTINGS',
    tamGunEsigi: 'Full-day threshold',
    tamGunAciklama: 'Sets the minimum number of prayers a day needed for that day to count toward your streak',
    sifirlama: 'RESET',
    verileriSifirla: 'Reset streak data',
    verileriSifirlaAlt: 'Deletes all streak, badge and points data',
  },

  rozetKarti: {
    erisim: '{ad} badge, {durum}',
    kazanildi: 'earned',
    kilitli: 'locked',
  },

  toparlanma: {
    kartBaslik: 'RECOVERY MODE',
    kartAltBaslik: 'You can get your streak back',
    kartMesaj: 'You can continue your {vurgu} streak where you left off.',
    oncekiGun: cogul({ one: '{n}-day', other: '{n}-day' }),
    ilerleme: '{tamam}/{hedef} days completed',
    kalan: cogul({
      one: 'Complete all five prayers for {n} more day and your streak continues where it left off.',
      other: 'Complete all five prayers for {n} more days and your streak continues where it left off.',
    }),
    bugun: 'Complete today and your streak continues where it left off.',
    uyari: 'The days must be consecutive; if a day is missed in between, recovery starts over.',
    kapatErisim: 'Close recovery details',
    anladim: 'Got it',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Share your progress',
    hazirDegilBaslik: 'Image not ready',
    hazirDegilMesaj: "The image isn't ready yet. Try again in a few seconds.",
    olusturulamadiBaslik: "Couldn't create the image",
    olusturulamadiMesaj: 'Something went wrong while creating the image. Try again.',
    kullanilamiyorBaslik: 'Sharing unavailable',
    kullanilamiyorMesaj: "Sharing isn't available on this device.",
    kapat: 'Close',
    hikaye: 'Add to your story',
    platformlar: 'Can be shared on Instagram, WhatsApp and more.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'My Longest Streak: {n} Day', other: 'My Longest Streak: {n} Days' }),
    seriZincir: cogul({ one: 'DAY WITHOUT BREAKING THE CHAIN!', other: 'DAYS WITHOUT BREAKING THE CHAIN!' }),
    seriSoz: '"A small step every day, a great peace in my soul. 🔥"',
    rozetYeni: 'I EARNED A NEW BADGE!',
    rozetSozleri: [
      'Today I took a good step for myself! 🌟',
      'I keep going with resolve; this badge is mine! 💪',
      'I caught the blessing of the morning! 🌅',
      'I am part of this flow that does my soul good! ✨',
      'Small steps bring great peace. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'I EARNED A NEW BADGE!',
      hedef_tamamlandi: 'I REACHED MY GOAL!',
      seviye_atlandi: 'LEVEL UP!',
      toparlanma_tamamlandi: 'BACK ON TRACK!',
      en_uzun_seri: 'NEW RECORD!',
      varsayilan: 'ACHIEVEMENT!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['May my Lord make it lasting. 🤲', 'Small steps bring great peace. 🍃', 'May Allah grant us all steadfastness. 🌱'],
      hedef_tamamlandi: ['Small steps bring great peace. 🍃', 'May Allah make it lasting. 🤲', 'One more step every day. 🌱'],
      seviye_atlandi: [
        'A little further every day; may Allah make it easy. 🍃',
        'May Allah make it lasting. 🤲',
        'The journey continues. 🌱',
      ],
      toparlanma_tamamlandi: [
        'What matters is not falling but getting up. 🔄',
        'May Allah grant steadfastness. 🤲',
        'Every road is walked with patience. 🌱',
      ],
      en_uzun_seri: [
        'A small step every day, a great peace in my heart. 🍃',
        'May Allah make it lasting. 🤲',
        'May my Lord grant us all steadfastness. 🌱',
      ],
    },
  },
};
