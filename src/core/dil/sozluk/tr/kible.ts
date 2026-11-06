/** Kıble ekranı: pusula, kamera görünümü, kalibrasyon rehberi, yön cümleleri. */
export const kible = {
  baslik: 'Kıble',
  /** Yön cümlesi (`yonCumlesi`): ekran ve ekran okuyucu. */
  yon: {
    hizali: 'Kıble yönündesiniz',
    arkada: 'Kıble arkanızda, geri dönün',
    sagda: 'Kıble {derece}° sağınızda',
    solda: 'Kıble {derece}° solunuzda',
  },
  /** Pusula kadranındaki yön harfleri. */
  harf: { kuzey: 'K', dogu: 'D', guney: 'G', bati: 'B' },
  sekme: {
    pusula: 'Pusula',
    pusulaErisim: 'Pusula modu',
    pusulaAciklama: 'Kâbe işareti üstteki çentiğe gelince kıble yönündesiniz.',
    kamera: 'Kamera',
    kameraErisim: 'Kamera modu',
    kameraAciklama: 'Telefonu dik tutun; Kâbe işareti kıble yönünde belirir.',
  },
  sayfa: {
    baslatiliyor: 'Pusula başlatılıyor…',
    izinKapali: 'Konum izni kapalı; yönü bulmak için konumunuz gerekiyor.',
  },
  hata: {
    izinGerekli: 'Kıble yönünü bulmak için konum izni gerekiyor.',
    konumServisi: 'Konum servislerine erişilemiyor. Lütfen cihazınızın konum ayarlarını kontrol edin.',
    baslatilamadi: 'Kıble servisi başlatılamadı.',
  },
  pusula: {
    ufuk: 'ufuk',
    konumAliniyor: 'Konumunuz alınıyor…',
    hazirlaniyor: 'Pusula hazırlanıyor…',
    kuzeydenAci: 'Kıble kuzeyden {derece}°',
    kabeUzakta: 'Kâbe {mesafe} uzakta',
    kuzeydenSaatYonu: 'Kuzeyden saat yönünde',
    kuzeyden: 'kuzeyden {derece}°',
    kabeUzaktaKuzeyden: 'Kâbe {mesafe} uzakta, kuzeyden {derece}°',
    pusulaErisim: 'Kıble pusulası. {cumle}',
    pusulaYok: 'Bu cihazda pusula yok; kuzeye göre yönü gösteriyoruz.',
    kayiyorsa: 'Yön kayıyorsa telefonunuzu havada 8 çizer gibi hareket ettirin.',
    kamerayla: 'Kamerayla görün',
  },
  kamera: {
    pusulayiKullanin: 'Pusulayı kullanın',
    kullanilamiyorBaslik: 'Kamera görünümü bu telefonda kullanılamıyor',
    kullanilamiyorMetin:
      'Telefonunuzun algılayıcıları dik tutuşta güvenilir yön vermiyor. Pusula yönü doğru göstermeye devam eder.',
    izinBaslik: 'Kıbleyi kamerayla görün',
    izinMetin:
      'Telefonunuzu dik tutup çevrenize baktığınızda Kâbe işareti kıble yönünde belirir. Bunun için kamera izni gerekiyor; görüntü kaydedilmez ve telefonunuzdan çıkmaz.',
    kamerayiAcin: 'Kamerayı açın',
    izinKapaliBaslik: 'Kamera izni kapalı',
    izinKapaliMetin: 'Kameralı görünüm için Ayarlar’dan kamera iznini açabilirsiniz. Pusula izinsiz de çalışır.',
    ayarlariAcin: 'Ayarları açın',
    acilamadiBaslik: 'Kamera açılamadı',
    acilamadiMetin: 'Kamera şu an kullanılamıyor. Pusula ile kıble yönünü bulabilirsiniz.',
    hesaplaniyor: 'Yön hesaplanıyor…',
    dikTutun: 'Telefonunuzu dik tutun',
  },
  kalibrasyon: {
    tesekkurErisim: 'Teşekkürler, yön artık daha doğru',
    tesekkur: 'Teşekkürler, yön artık daha doğru ✓',
    baslik: 'Pusulayı kalibre edin',
    sallayin: 'Telefonunuzu havada 8 çizer gibi sallayın.',
    metal: 'Metal eşyalardan ve mıknatıslı kılıftan uzaklaşın.',
    dogruluk: 'Doğruluk',
    simdiDegil: 'Şimdi değil',
  },
} as const;
