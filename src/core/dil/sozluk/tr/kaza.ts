/** Kaza: namaz adları (vitir dahil) ve farz sonrası kaza önerisi. */
export const kaza = {
  adlar: { sabah: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı', vitir: 'Vitir' },
  /** Cümle içinde ("bir öğle kazası"); `toLowerCase` YAZMA (Türkçe İ tuzağı). */
  kucuk: { sabah: 'sabah', ogle: 'öğle', ikindi: 'ikindi', aksam: 'akşam', yatsi: 'yatsı', vitir: 'vitir' },
  oneri: {
    baslik: 'Bir kaza da kılar mısınız?',
    isaretlediniz: '{farz} namazınızı işaretlediniz',
    zincirErisim: '{farz} namazının ardından bir {kaza} kazası',
    kazasi: '{kaza} kazası',
    aciklama: 'Kıldığınız her farzın ardından bir kaza, borcunuzu adım adım azaltır. Bir {kaza} kazası kıldığınızda işaretleyin; defterinizden düşelim.',
    simdiDegil: 'Şimdi değil',
    kildimDusun: 'Kıldım, kazadan düşün',
    birDahaSormayin: 'Bir daha sormayın',
    birDahaIpucu: "Bu öneriyi kapatır; Kaza Defteri'nden yeniden açabilirsiniz",
    borcYok: 'Bu {kaza} kazası için borcunuz kalmamış.',
    kaydedilemedi: "Kaza kaydedilemedi. Kaza Defteri'nden işaretleyebilirsiniz.",
  },
} as const;
