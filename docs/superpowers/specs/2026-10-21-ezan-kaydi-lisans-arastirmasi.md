# Ezan kaydı paketleme — lisans araştırması ve karar (2026-10-21)

**Karar: uygulamayla ezan kaydı PAKETLENMEDİ.** "Vakit girdi" bildiriminde ezan isteyen kullanıcı
kendi ezan dosyasını "Kendi dosyanızdan seçin" yolundan ekler (Android 10+; dosya
MediaStore › Bildirimler/NamazAkisi'ye kopyalanır).

## Kıstas

Uygulama GPL-3.0 + GPLv3 §7 ek izniyle App Store / Google Play'de dağıtılıyor. Paketlenecek
ses yalnız açıkça **PD / CC0 / CC BY** olmalı (CC BY-SA ve NC dışarıda: ShareAlike'ın "ek
kısıtlama yok" maddesi mağaza DRM'iyle çelişir, NC ticari dağıtımı yasaklar). Lisans
etiketinin yanında **kaynağın inandırıcılığı** da kıstastır: yükleyen kişi kaydın sahibi
değilse etiket hiçbir şeyi temizlemez. Ezan bir icradır; saha kaydında kaydedenin CC0'ı
müezzinin icracı haklarını kapsamaz.

## İncelenen adaylar (Wikimedia Commons + Openverse/Freesound, `license=cc0,pdm,by`)

| Kayıt | Etiket | Neden reddedildi |
|---|---|---|
| Commons `File:Beautiful_adhan.ogg` (154 sn) | CC0 "own work" | Yükleyen hesap (Adam-synagda) çoklu hesap suistimalinden süresiz engelli; "kendi eserim" beyanı güvenilmez. |
| Commons `File:Adhan.ogg` (42 sn, mono) | CC0 "own work" | 2026-06'da açılmış toplu yükleme hesabı, dosya kategorisiz; kaynak doğrulanamıyor. |
| Commons `File:33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg` | CC BY 3.0 (Freesound'dan) | Dosya etiketleri Mescid-i Nebevî müezzininin yayın kaydını gösteriyor; yükleyen kaydın sahibi/icracısı değil. |
| Commons `File:Call_to_prayer_by_Sabah_Fakhry.mp3` | "Public domain" | 1985 tarihli sanatçı kaydı, kaynağı YouTube; PD iddiası icracı/yapımcı hakları açısından yanlış. |
| Freesound saha kayıtları (ör. lindacass #456941 "Blue Mosque Istanbul", kyles, 3bagbrew…) | CC0 | Kaydeden güvenilir ama CC0 yalnız onun hakkını kapsar (müezzinin icrası ayrı); ayrıca açık hava kaydı: ölçülen gürültü tabanı −39 dB, RMS −26 dB (~13 dB SNR) — trafik/kalabalık sesiyle bildirim sesi olarak kötü. |

## Sonuç

Mağaza dağıtımına "açıkça temiz" ve bildirim sesi olarak kullanılabilir bir ezan kaydı
bulunamadı. Gelecekte paketlenecekse: kaydı yaptıran/icra eden müezzinden **yazılı** CC0 ya da
CC BY izni alınmalı ve bu belgeye kaynak + izin metni eklenmeli. iOS'ta bildirim sesi en fazla
30 sn çalar (aşan ses HİÇ çalmaz) → ilk tekbir bölümü ~25 sn'ye kırpılıp `.wav`/`.caf`
olarak `app.json > expo-notifications.sounds`'a eklenmelidir; Android'de kanal sesi dosyanın
sonuna kadar çalar.
