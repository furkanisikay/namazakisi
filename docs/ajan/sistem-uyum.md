# Sistem koşullarına uyum (güç, veri, ağ, şarj)

Ne zaman okunur: güç tasarrufu, Veri Tasarrufu / Düşük Veri Modu, Wi-Fi/ölçülen ağ, şarj ya da arka plan kısıtına göre davranış değiştiren bir şey yazıyorsan; eşitleme sıklığı/koşullarına dokunuyorsan.

Katmanlar: native köprü `modules/expo-sistem-durumu` (Android Kotlin + iOS Swift, SALT OKUR, ham sözlük) → saf `core/sistem/sistemDurumu.ts` (doğrulama + politika) ve `core/esitleme/esitlemePolitikasi.ts` (otomatik eşitleme kapısı) → `domain/services/SistemKosullariServisi.ts` (anlık okuma + tek native dinleyicili ekran deposu) → `presentation/hooks/useSistemKosullari.ts`.

## Temel kural: hatırlatma güvenilirliğine DOKUNULMAZ
- **Bildirim/alarm/sesli okuma planlayan hiçbir dosya sistem koşullarını okumaz.** Uyarlananlar yalnız ertelenebilir işlerdir. Yeni tüketici eklerken nöbetçinin izin listesine BİLEREK ekle; planlayıcıysa ekleme. Nöbetçi: `core/sistem/__tests__/sistemPolitikasiSiniri.test.ts`.
- **15 dk'lık arka plan görevine ağ/şarj kısıtı (WorkManager constraint) EKLENMEZ:** görev hatırlatmaları da tazeler; kısıt yalnız görevin İÇİNDEKİ eşitleme kapısındadır.
- **"Bilinmiyor" (`null`) hiçbir kısıtı tetiklemez:** köprüsüz eski build'de uygulama bugünkü gibi davranır; ekran uyarı/çip göstermez (yanlış alarm, hiç uyarmamaktan kötü).

## Politika tablosu
| Durum (algılama) | Uyarlama | Bilgilendirme |
|---|---|---|
| Android Pil Tasarrufu (`PowerManager.isPowerSaveMode`) / iOS Düşük Güç Modu (`ProcessInfo.isLowPowerModeEnabled`) | Dekoratif döngüler durur (`useHareketAzalt` → `dongu.ts`; geri sayım gibi bilgi taşıyan içerik etkilenmez) · tek seferlik konum ölçümü en fazla "dengeli" (`konumDogrulugunuSinirla`, `KonumTakipServisi`) · otomatik eşitleme şarja/mod kapanana dek bekler | Ayarlar çipi: iOS "hatırlatmalar etkilenmez"; Android yalnız pil muafiyeti varken ve kısıt yokken "etkilenmez", yoksa "gecikebilir" (dokununca pil rehberi) |
| Android Veri Tasarrufu (`getRestrictBackgroundStatus` = ENABLED) / iOS Düşük Veri Modu (`NWPath.isConstrained`) | Arka plan eşitlemesi ağa hiç çıkmaz (Android zaten arka plan verisini keser); ön plan turu sürer (küçük, kullanıcının kendi değişikliği) · otomatik güncelleme kontrolü ertelenir | Çip: "Veri tasarrufu açık — hatırlatmalar etkilenmez" |
| Ölçülen ağ (`isActiveNetworkMetered` / `isExpensive`) | Otomatik GitHub güncelleme kontrolü Wi-Fi'ye ertelenir (elle kontrol, ilk kontrol ve 7 günden eski önbellek ertelenmez) · eşitleme YALNIZ kullanıcı "Yalnız Wi-Fi'de" dediyse bekler | Eşitleme sayfasında bekleme satırı |
| Ağ yok | Otomatik eşitleme hiç denenmez (`agYok`) | Bekleme satırı |
| Şarjda (`BatteryManager.isCharging` / `UIDevice.batteryState`) | Güç tasarrufu ertelemesini kaldırır; "Yalnız şarjdayken" koşulunu sağlar | — |
| Android "Kısıtlı" kullanım (`isBackgroundRestricted`) ya da RESTRICTED bekleme kovası (`getAppStandbyBucket` = 45: günde tek alarm, ağ kapalı) | Değişiklik yok (planlar aynı kurulur) | Kurulum sağlığı `arkaPlanKisiti` (pil rehberi; `pilKisiti`'nin güçlü hâli, ikisi birden gösterilmez) |
| iOS Arka Planda Uygulama Yenileme kapalı/kısıtlı (`backgroundRefreshStatus`) | Değişiklik yok | Kurulum sağlığı `arkaPlanYenileme` (bilgi; Düşük Güç Modu açıkken tekrarlanmaz) |
| Canlı sayaç tazelemesi | Değişiklik yok: zaten UYANDIRMAYAN `RTC` + `setWindow` (ekran kapalıyken çalışmaz); güç tasarrufunda seyreltmek ekranda bayat dakika gösterirdi | — |
| Wear/TV gönderimi | Değişiklik yok: Wear zaten birleştiriliyor ve arka plan gönderimi `acil: false` (D-08); TV yalnız ev ağında, düz metinle tekilleştirilmiş | — |

## Eşitleme kapısı (`esitlemePolitikasi.esitlemeKarari`)
- **Tek kapı servistedir:** `EsitlemeServisi.otomatikEsitle(tetik, …)` ve `arkaplandaEsitle` aynı kapıdan geçer. Elle "Şimdi eşitleyin" (`esitle`) kapıdan GEÇMEZ.
- Sıra: yalnız elle → ağ yok → arka planda veri tasarrufu → yalnız Wi-Fi → yalnız şarjda → güç tasarrufu (şarjda değilken) → sıklık. Sıklık aralığı `sonDeneme`'ye (başarılı ya da hatalı son tur) göredir, 2 dk pay ile (15 dk görevi erken uyanabilir). "Değişince" tetiği aralığa takılmaz; açılış "Değişince"/"15 dk"da beklemez; bekleyen tur koşul düzelince (`kosulDegisti`) hemen koşar.
- Bekleme nedeni `EsitlemeDurumu.sonBekleme`'ye yazılır (yalnız görünür nedenler; `siklik`/`elle` olağandır) ve `sonHata`'dan AYRIDIR — ekran kırmızı hata değil "… bekliyor" der. `ertelendi` sonucu ayrı anlamdadır (KDF ön plana ertelendi); karıştırma.
- "Değişince hemen" = `LocalNamazServisi` adlı yuva `esitleme` (yalnız ön planda, `EsitlemeTetikleyici`), 30 sn bekleme. Headless'a kaydedilmez; 15 dk görevi kapsar.
- **Tercihler cihaza özgüdür, yedeğe ve eşitlemeye GİRMEZ** (`ESITLEME_TERCIHLERI`): Wi-Fi/şarj alışkanlığı cihaza göre değişir ve eşitleme tercihini eşitlemeyle taşımak döngüseldir (bir cihaz "Yalnız elle"yi içe alıp sessizce çekilirdi).

## Platform notları
- **Android:** `ACTION_RESTRICT_BACKGROUND_CHANGED` YALNIZ dinamik kayıtlı alıcıya gelir (manifest alıcısı almaz) → modül alıcıyı `OnStartObserving`'de kurar. Okuma binder çağrısıdır → `AsyncFunction`. Samsung "Maksimum güç tasarrufu" ve "uyuyan uygulamalar" için herkese açık API YOKTUR; genel `isPowerSaveMode`, `isBackgroundRestricted` ve bekleme kovası kullanılır (Samsung'da bu sinyallerin o modları yansıttığı cihazda DOĞRULANMADI). Muafiyet/"Kısıtlanmamış" yolu mevcut pil rehberidir (`docs/ajan/android-native.md`).
- **iOS:** `backgroundRefreshStatus` yalnız ana iş parçacığında → `durumAl` `.runOnQueue(.main)`. `batteryState` için önce `isBatteryMonitoringEnabled = true`. `NWPathMonitor` ilk güncellemeden önce ağ alanları yazılmaz (yanlış "ağ yok" demesin). NetInfo iOS'ta `isConstrained` vermez; köprü bu yüzden var.
- **Wear OS:** saat ağa çıkmaz (veri telefondan Data Layer ile gelir) → ağ politikası gerekmez. Pil tasarrufu/uyku/tiyatro modlarını sistem yönetir (bildirimleri susturur, ambient'i kapatabilir); `com.google.wear.modes` Wear OS SDK'sına dayanır ve eski saatte yoktur (tesbihat ambient dersi) → kullanılmadı.
- **Android TV / Apple TV:** TV prizde, panoda ağ kullanılmaz (vakitler cihazda hesaplanır); Apple TV uygulaması yok. Uyarlama gerekmez.
- **Apple Watch:** saat ağa çıkmaz (WatchConnectivity); komplikasyonlar yalnız vakit sınırlarında tazelenir. Düşük Güç Modu'nda sistem zaten arka plan işini kısar → kod gerekmez.

## Doğrulama reçetesi (emülatör)
`adb shell settings put global low_power 1` (güç tasarrufu; kapatmak 0) · `adb shell cmd netpolicy set restrict-background true` (Veri Tasarrufu) · `adb shell am set-standby-bucket com.furkanisikay.namazakisi restricted` (RESTRICTED kovası; geri almak `active`) · `adb shell cmd appops set com.furkanisikay.namazakisi RUN_ANY_IN_BACKGROUND ignore` ("Kısıtlı" kullanım). Ayarlar çipi ve kurulum sağlığı anında değişir (dinleyici + öne geliş).
