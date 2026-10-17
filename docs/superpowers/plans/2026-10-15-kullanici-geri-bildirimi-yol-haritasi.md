# Kullanıcı geri bildirimi yol haritası (v0.31.0 iç test, 2026-10-15)

Tek doğru kaynak: sahibin v0.31.0 iç test turundaki iki mesajı. Her madde, sahibin koyduğu
kısıtla birlikte yazıldı. Durum: `bekliyor` · `sürüyor` · `onay bekliyor` · `bitti` · `araştırma`.

Kurallar:
- Her faz AYRI dal, master'a birleştirmeler SIRALI (her birleştirme release keser).
- **Ana ekrandaki her değişiklik birebir gösterilip ONAYLATILIR** (gerçek ekran görüntüsü,
  `android-ekran-goruntuleri.yml --ref <dal>`); onay beklerken diğer işler sürer.
- Yeni ekran/akış: AGENTS.md UI standardı (brainstorming → frontend-design → onay). Sahibin
  "serbestsin" yetkisi ana ekran DIŞINDA geçerli.
- Hareket: `motion-choreography` ilkeleri — olayla başlar, ≤3 sn biter, boşta sıfır hareket,
  ana ekranın saniyelik çizimine bağlanmaz, reduced-motion'da son kare. Pil önceliklidir.
- Lint bütçesi dolu: yeni kod yeni uyarı EKLEMEZ.

## Faz 1 — Hata düzeltmeleri (tek PR, önce bu)

| # | Madde | Durum | Not |
|---|---|---|---|
| 1.1 | "Fiziksel aktivite" izni | bitti (v0.31.1) | `expo-sensors` (pedometre) ekliyor; kullanılmıyor → `tools:node="remove"`. Debug APK ile manifest doğrulaması. |
| 1.2 | "Yakındaki cihazlar" izni | bitti (kod değişikliği yok) | SM-S721B'de ölçüldü: izin `ACCESS_LOCAL_NETWORK` (Android 17'nin yeni yerel ağ izni, "Yakındaki cihazlar" grubunda). Play'den kurulan v0.31.0 APK'sının manifestinde YOK; Android 17 onu INTERNET isteyen her uygulamaya örtük ekliyor (telefonda 703 izin kaydı). Bizim kaldıracağımız bir şey yok. |
| 1.3 | Takvim çakışması: izin verili ama "verilmedi" | bitti (v0.31.1) | Kök neden: SDK 57'de `expo-calendar` kök girişindeki eski fonksiyonlar HATA FIRLATIYOR; `expo-calendar/legacy`'ye geçildi (takvime namaz etkinliği yazma da bozuktu). Cihazda izin `granted` doğrulandı. Önceki not: | İzin isteği rıza modalı kapanırken atılıyor; ret sonrası durum yeniden okunmalı; ham `status`/`canAskAgain` loglanmalı. Cihazda tanı raporu istenecek. |
| 1.4 | Namazdayım "Modu açın" → ana ekran + Ayarlar hatası | bitti (v0.31.1) | Samsung'da olmayan ayar ekranı niyeti şüphesi; izin zaten verilmişse yönlendirme yapılmamalı; `ActivityNotFoundException` yedeği. |
| 1.5 | Now Bar: sabit bildirim + ilerleme çubuğu | araştırma | Cihaz: SM-S721B (S24 FE), Android 17 (API 37), One UI 9.0. `POST_PROMOTED_NOTIFICATIONS` verili. Sayaç ekrandayken `dumpsys notification` alınacak (ADB Tailscale üzerinden erişilebilir). |
| 1.6 | Süre artır/azalt | bitti (v0.31.1) | Ortak `SayisalSecici`: kısa basış = küçük adım, uzun basış = bırakılana/sınıra dek hızlanarak sürekli. Tüm ekranlar aynı. 1'den 15'e ulaşılamama hatası biter. |

## Faz 2 — Ortak hatırlatma yapısı (tek PR)

| # | Madde | Durum | Not |
|---|---|---|---|
| 2.1 | Tüm hatırlatma yüzeyleri aynı yetenekler | bitti (v0.35.0–v0.37.0: cuma, camiye gitme, yatış, takvim de ortak kartta) | `PencereTanimi` varsayılanı HER yetenek açık (alarm, ses, kanal, sıklık); kapatma gerekçeli istisna. Nafile + cuma + camiye gitme aynı kart. |
| 2.2 | Alarm kapsamı: ilk uyarı / her uyarı | bitti (v0.32.0) | Adım başına alan. Android muhafız payı (360) defterle ölçülür; iOS AlarmKit sınırı araştırılacak. |
| 2.3 | Önizlemede alarm | bitti (v0.32.0) | Alarm çalacak tetikte ikon + saat. |
| 2.4 | Kapalı eski adımlar | bitti (v0.32.0) | Göç kullanıcı seçimini ezmez → yalnız içeriği varsayılan olan gölge adımlar silinir + adım başına "Sil". |
| 2.5 | Nafile "ana ekranda göster" | bitti (v0.32.0; v0.34.0: anahtar her nafilenin kendi kartında) | Üç nafile için ayrı ayrı. |
| 2.6 | "Kıldım işaretleyebilen uygulamalar" | bitti (v0.32.0) | Ayarlar'dan çıkar, yalnız Otomasyon sayfasında. |

## Faz 3 — Tasarım teslimleri (önce onay, sonra kod)

| # | Madde | Durum | Not |
|---|---|---|---|
| 3.1 | Kaza defteri 2.0 (defter/kayıt modeli) | bitti (v0.33.0) | Ekleme-yalnız kayıt defteri; hesaplanan taban ayrı kayıt (yeniden hesap eskisini EZMEZ); otomatik ekleme geri alınabilir ve kaynağıyla izlenir; seçmeli temizlik. Diyagram + ekranlar sahibe gösterilecek. |
| 3.2 | Ana ekran | bekliyor | Birebir ekran görüntüsüyle onay. |
| 3.3 | Ayarlar bilgi mimarisi | bekliyor | Çok ekran, çok kaydırma → gruplama/arama. |
| 3.4 | Kıble: AR yerine kendi çözümümüz + pusula tasarımı | bekliyor | KARAR (2026-10-16): kameralı AR; KAMERA izni verilmezse kamerasız pusula. |
| 3.5 | İstatistik (gün/hafta/ay) | bekliyor | Sanal personalarla geri bildirim turu. |
| 3.6 | İkamet yeri haritadan/aramayla | bekliyor | Camideyim harita bileşeni. |
| 3.7 | Camide kılacağım: vakit × gün, boş seçimde süre gizli, "vakit yakınında" düzenlenebilir | bekliyor | |

## Faz 4 — Platform yenilemeleri

| # | Madde | Durum | Not |
|---|---|---|---|
| 4.1 | Seri ekranı (bağlantı çizgileri, iPhone sorunu) | bekliyor | |
| 4.2 | Tesbihat tasarımı | bekliyor | |
| 4.3 | Wear OS: yenileme + kıble ekranı | bekliyor | Yüke opsiyonel koordinat alanı (sürüm artmaz). |
| 4.4 | Apple Watch: yenileme + kıble | bekliyor | CoreLocation yön desteği doğrulanacak. |
| 4.5 | Android TV yenileme | bekliyor | |
| 4.6 | Katlanabilir (Fold/Flip, iPad) düzenleri | bekliyor | |
| 4.7 | Uygulama geneli hareket + görsel dil | bekliyor | motion-choreography; pil/performans. |

## Faz 5 — Araştırma / sonraya

| # | Madde | Durum | Not |
|---|---|---|---|
| 5.1 | İnternetsiz telefon↔telefon/tablet eşitleme | araştırma | Saatler zaten Bluetooth ile internetsiz. Telefon↔telefon: Nearby Connections (Android, "Yakındaki cihazlar" izni ister), Multipeer Connectivity (iOS), platformlar arası QR/yerel ağ. |
| 5.2 | Samsung Modlar ve Rutinler | araştırma | Bildirim tetikleyiciyle "aramayı reddet / mesaj gönder" seçilemiyor; Namaz modu Modlar listesinde görünmüyor (Rahatsız Etmeyin kuralı olarak yaşıyor). Üçüncü taraf tetik yolu araştırılacak. |
| 5.3 | Apple TV uygulaması | bekliyor | Yeni tvOS hedefi; imza için sahibin etkileşimli EAS adımı. |

## Yapılanlar (2026-10-17)
- Saat (Wear OS) ve TV paketleri her telefon sürümüyle Play'in `wear:internal` / `tv:internal` kanallarına gider (`expo-build.yml` > `saat_tv`). TV kanalı Play Console'da "Özel sürüm kanalı" açılınca dolar.

## Sahipten beklenenler
- Play Console: Wear OS dahili test kullanıcı listesi + Android TV özel kanal.
- Namaz modu: Rahatsız Etmeyin mi, yalnız titreşim mi (karar).
- Sayaç bildirimi göründüğü an haber (Now Bar dökümü için).

## Kararlar (2026-10-15)

**Kaza Defteri 2.0** (tasarım: https://claude.ai/artifact/BTqLPYNmHanmBcA9gmPvEi)
- Otomatik kayıt namaz kaydının AYNASIDIR. Sayısı fold anında İZDÜŞÜMLE türetilir: kapanmış her namaz günü ≥ başlangıç, özel gün değil, "bana sorun" bekleyeninde değil, temizlikle gizlenmemiş, aynı referanslı `bildirim` kaydı yok ve vakit işaretsiz ise +1. "Kıldım" deyince düşer, "kılmadım" deyince geri gelir. Kimlik `oto:<gün>_<vakit>` (temizlik gizleyebilsin). Geçmiş satırları için ayrı bir `tarama` olay günlüğü tutulur. Toggle olayı SAKLANMAZ; saklansaydı birleşim (union) ile çalışan namaz eşitlemesinde iki cihaz farklı sonuç üretirdi.
- Uygulamanın hiç açılmadığı (işaretsiz) günler: "Bana sorun" (varsayılan).
- Geçişle gelen taban ilk yeniden hesaplamada önizlemeyle birlikte TÜMDEN değiştirilir.
- Yeni hesaptan fazla kılınan sayı AYRI tutulur: yalnız gösterilir, sonradan eklenen borçlardan düşülmez.
- Vitir otomatiği ORTAK mezhep ayarına bağlı (Hanefî: vacip → eklenir).
- Otomatik ekleme namaz günü kapanınca yapılır; ek gecikme yok.
- Ayrı bildirim YOK. Gün sonu muhasebesine (#290) satır eklenir: tetik anında kayıt henüz yazılmamış olduğu için ileriye dönük ifade kullanılır ("işaretlemezseniz kazaya eklenecek").
- "Vakit seçmeden kıldım" (genel tamamlama) KALDIRILIR; arayüzde hiçbir düğme onu çağırmıyordu.
- Mezhep ORTAK ayar olur (bugün yalnız Seferîlik/yolculuk ekranında). Namaz vakti hesabına DOKUNMAZ (ikindi asr-ı evvel).

**Kıble (2026-10-16):** Kameralı AR. KAMERA izni yalnız AR ekranı açılırken istenir; reddedilirse ya da izin yoksa ekran kamerasız 3B pusulaya düşer (aynı yön hesabı). Veri güvenliği beyanı ve iOS `NSCameraUsageDescription` güncellenir.
