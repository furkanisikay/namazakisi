import type { Sozluk } from '../tr';

/** Kompas hərfləri: Şimal Şm · Şərq Şq · Cənub C · Qərb Q (şimal/şərq ikisi də Ş ilə başlayır). */
export const kible: Sozluk['kible'] = {
  baslik: 'Qiblə',
  yon: {
    hizali: 'Qiblə istiqamətindəsiniz',
    arkada: 'Qiblə arxanızdadır, geri dönün',
    sagda: 'Qiblə {derece}° sağınızdadır',
    solda: 'Qiblə {derece}° solunuzdadır',
  },
  harf: { kuzey: 'Şm', dogu: 'Şq', guney: 'C', bati: 'Q' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Kompas rejimi',
    pusulaAciklama: 'Kəbə işarəsi yuxarıdakı çəntiyə çatdıqda qiblə istiqamətindəsiniz.',
    kamera: 'Kamera',
    kameraErisim: 'Kamera rejimi',
    kameraAciklama: 'Telefonu şaquli tutun; Kəbə işarəsi qiblə istiqamətində görünür.',
  },
  sayfa: {
    baslatiliyor: 'Kompas başladılır…',
    izinKapali: 'Məkan icazəsi bağlıdır; istiqaməti tapmaq üçün məkanınız lazımdır.',
  },
  hata: {
    izinGerekli: 'Qiblə istiqamətini tapmaq üçün məkan icazəsi lazımdır.',
    konumServisi: 'Məkan xidmətlərinə daxil olmaq mümkün deyil. Cihazınızın məkan parametrlərini yoxlayın.',
    baslatilamadi: 'Qiblə xidməti başladılmadı.',
  },
  pusula: {
    ufuk: 'üfüq',
    konumAliniyor: 'Məkanınız müəyyən edilir…',
    hazirlaniyor: 'Kompas hazırlanır…',
    kuzeydenAci: 'Qiblə şimaldan {derece}°',
    kabeUzakta: 'Kəbə {mesafe} uzaqdadır',
    kuzeydenSaatYonu: 'Şimaldan saat əqrəbi istiqamətində',
    kuzeyden: 'şimaldan {derece}°',
    kabeUzaktaKuzeyden: 'Kəbə {mesafe} uzaqdadır, şimaldan {derece}°',
    pusulaErisim: 'Qiblə kompası. {cumle}',
    pusulaYok: 'Bu cihazda kompas yoxdur; istiqaməti şimala görə göstəririk.',
    kayiyorsa: 'İstiqamət sürüşürsə, telefonunuzu havada 8 rəqəmi çəkirmiş kimi hərəkət etdirin.',
    kamerayla: 'Kamera ilə baxın',
  },
  kamera: {
    pusulayiKullanin: 'Kompasdan istifadə edin',
    kullanilamiyorBaslik: 'Kamera görünüşü bu telefonda istifadə edilə bilməz',
    kullanilamiyorMetin:
      'Telefonunuzun sensorları şaquli tutulduqda etibarlı istiqamət vermir. Kompas istiqaməti düzgün göstərməyə davam edir.',
    izinBaslik: 'Qibləni kamera ilə görün',
    izinMetin:
      'Telefonunuzu şaquli tutub ətrafınıza baxdıqda Kəbə işarəsi qiblə istiqamətində görünür. Bunun üçün kamera icazəsi lazımdır; görüntü yazılmır və telefonunuzdan çıxmır.',
    kamerayiAcin: 'Kameranı açın',
    izinKapaliBaslik: 'Kamera icazəsi bağlıdır',
    izinKapaliMetin: 'Kamera görünüşü üçün Parametrlərdən kamera icazəsini aça bilərsiniz. Kompas icazəsiz də işləyir.',
    ayarlariAcin: 'Parametrləri açın',
    acilamadiBaslik: 'Kamera açılmadı',
    acilamadiMetin: 'Kamera hazırda istifadə edilə bilməz. Qiblə istiqamətini kompasla tapa bilərsiniz.',
    hesaplaniyor: 'İstiqamət hesablanır…',
    dikTutun: 'Telefonunuzu şaquli tutun',
  },
  kalibrasyon: {
    tesekkurErisim: 'Təşəkkürlər, istiqamət artıq daha dəqiqdir',
    tesekkur: 'Təşəkkürlər, istiqamət artıq daha dəqiqdir ✓',
    baslik: 'Kompası kalibrləyin',
    sallayin: 'Telefonunuzu havada 8 rəqəmi çəkirmiş kimi yelləyin.',
    metal: 'Metal əşyalardan və maqnitli qabdan uzaqlaşın.',
    dogruluk: 'Dəqiqlik',
    simdiDegil: 'İndi yox',
  },
};
