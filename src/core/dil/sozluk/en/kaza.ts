import type { Sozluk } from '../tr';

export const kaza: Sozluk['kaza'] = {
  adlar: { sabah: 'Fajr', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha', vitir: 'Witr' },
  kucuk: { sabah: 'Fajr', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha', vitir: 'Witr' },
  oneri: {
    baslik: 'Pray a qada too?',
    isaretlediniz: 'You marked {farz}',
    zincirErisim: 'After {farz}, one {kaza} qada',
    kazasi: '{kaza} qada',
    aciklama: "One qada after each obligatory prayer reduces what you owe step by step. Mark it when you pray a {kaza} qada; we'll deduct it from your log.",
    simdiDegil: 'Not now',
    kildimDusun: "I've prayed it, deduct it",
    birDahaSormayin: "Don't ask again",
    birDahaIpucu: 'Turns off this suggestion; you can turn it back on in the Qada log',
    borcYok: 'You have no {kaza} qada left to make up.',
    kaydedilemedi: "The qada couldn't be saved. You can mark it in the Qada log.",
  },
};
