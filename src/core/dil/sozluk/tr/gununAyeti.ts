/**
 * Günün ayeti: widget, sayfa, ayar, duvar kâğıdı. Metinler W6 tasarım tuvalinden (sahip onaylı).
 * Büyük harfli başlıklar sabit yazılır (`toUpperCase` YASAK).
 */
export const gununAyeti = {
  baslik: 'Günün ayeti',
  /** Widget ve duvar kâğıdı üst etiketi. */
  etiket: 'GÜNÜN AYETİ',
  /** Kısa künye: "İnşirâh 94:6". */
  kisaKunye: '{sure} {ref}',
  /** Meal kaynağı: "Rowwad, QuranEnc 1.0.4". */
  mealKaynagi: '{yayimci}, QuranEnc {surum}',
  /** Sayfadaki tam künye. */
  sayfaKunye: "Kur'an {ref} · Meal: {yayimci}, QuranEnc {surum} · Arapça metin: Tanzil Projesi",
  /** Duvar kâğıdında Arapça açıkken künye eki. */
  arapcaKaynagi: 'Arapça: Tanzil',
  sigmiyor: 'Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun.',
  acin: 'Açın',
  sayfa: {
    kopyalayin: 'Kopyalayın',
    kopyalandi: 'Ayet kopyalandı',
    gorselPaylasin: 'Görsel paylaşın',
    widgetVeDuvar: 'Widget ve duvar kâğıdı',
    widgetVeDuvarAciklama: 'Ana ekrana ekleyin, kilit ekranında görün',
    oncekiGunler: 'Önceki günler',
    dun: 'Dün',
    kaynakNotu: "Mealler QuranEnc'ten değiştirilmeden alınır ve yeni sürüm çıktıkça güncellenir.",
    mealYok: 'Bu dilde meal henüz yok; Arapça metin gösteriliyor.',
  },
  ayar: {
    widgetBolum: 'Widget',
    widgetEkleyin: 'Ana ekrana widget ekleyin',
    widgetEkleyinAciklama: 'Uzun basın, Widget’lar, Namaz Akışı, Günün ayeti',
    duvarBolum: 'Duvar kâğıdı',
    duvarAnahtar: 'Her gün değiştirin',
    duvarAcikOzet: 'Açık · her gün imsakta yenilenir',
    duvarKapaliOzet: 'Kapalı',
    yer: 'Nerede',
    yerler: { kilit: 'Kilit ekranı', ana: 'Ana ekran', ikisi: 'İkisi' },
    zemin: 'Zemin',
    zeminler: { gece: 'Gece', kagit: 'Kâğıt', palet: 'Palet' },
    arapca: 'Arapça metni de gösterin',
    arapcaNot: 'Bazı âlimler, ekranında ayet görünen telefonla lavaboya girilmemesini tavsiye eder.',
    onizleyin: 'Bugünün görselini önizleyin',
    kapatNotu: 'Kapatırsanız son görsel ekranda kalır; önceki duvar kâğıdınızı galeriden kendiniz seçersiniz.',
    kullanilamiyor: 'Kullanılamıyor',
    engelli: 'Bu cihazda duvar kâğıdını değiştirme izni kapalı (iş ya da okul yönetimi). Ayarı bu yüzden açamıyorsunuz.',
    baskaHizmet:
      'Telefonunuzda kilit ekranını değiştiren başka bir hizmet açık. Günün ayetinin kalması için telefon ayarlarındaki duvar kâğıdı hizmetini kapatın.',
    yazilamadi: 'Bugünün görseli yerleştirilemedi. Uygulamayı açtığınızda yeniden denenir.',
  },
  onay: {
    baslik: 'Duvar kâğıdınız değişecek',
    metin:
      'Her gün imsakta kilit ekranınıza günün ayeti gelir. Şu anki duvar kâğıdınızı uygulama saklayamaz: kapatırsanız onu galeriden kendiniz seçersiniz.',
    acin: 'Açın',
  },
  ios: {
    aciklama:
      "iPhone'da uygulamalar duvar kâğıdını kendisi değiştiremez. Kısayollar uygulaması bunu her sabah sizin yerinize yapabilir; kurulumu bir kez yaparsınız.",
    ucAdim: 'Üç adım',
    adim1: 'Hazır kısayolu ekleyin. "Günün ayeti görseli" ve "Duvar Kâğıdını Ayarla" adımlarını taşır.',
    kisayoluEkleyin: 'Kısayolu ekleyin',
    adim2: "Kısayollar'da Otomasyon sekmesinde yeni bir Günün Saati otomasyonu açın ve imsaktan sonraki bir saat seçin (örneğin 07:30).",
    adim3: "Hemen Çalıştır'ı seçin ve eklediğiniz kısayolu bağlayın.",
    elle: 'Ya da elle',
    fotograflaraKaydedin: "Bugünün görselini Fotoğraflar'a kaydedin",
    kaydedildi: "Görsel Fotoğraflar'a kaydedildi",
    not: 'Otomasyon seçtiğiniz sabit saatte çalışır, imsak saatini izleyemez; imsaktan önce çalışırsa dünün ayetini koyar.',
  },
} as const;
