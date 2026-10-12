# Wear OS uyumluluğu — tasarım

Durum: ONAYLANDI (Fable — koşullu onay; zorunlu değişiklikler "Nihai kararlar" bölümünde uygulandı)
Kapsam: telefondaki Namaz Akışı'nın Wear OS saatlerde tam karşılığı.

## 1. Hedef ve kapsam

Kullanıcı saatinden, telefonu cebinden çıkarmadan:

1. Bugünün vakitlerini ve sıradaki vakte kalan süreyi görür (uygulama ekranı).
2. Saat kadranında **komplikasyon** olarak sıradaki vakti / kalan süreyi görür.
3. **Tile** (kaydırınca gelen kart) ile tek bakışta sıradaki vakti ve günün ilerlemesini görür.
4. Kıldığı namazı saatten **"Kıldım"** diye işaretler; telefon aynı işi bildirimdeki "Kıldım" düğmesiyle **birebir** yapar (kayıt + o vaktin muhafız/sayaç bildirimlerinin iptali).
5. Telefonun muhafız bildirimleri saate bugün olduğu gibi köprülenmeye devam eder (değişiklik yok).

Kapsam dışı (bilinçli): saatte ayar ekranı (ayarlar telefonda kalır), saatte bağımsız konum/vakit hesabı, iPhone'a eşli Wear saatleri, saatte muhafız motoru.

## 2. Mimari kararlar

### K1 — Saat uygulaması AYRI bir Gradle kökünde: `wear/`
`android/` RN + Expo eklentileriyle yapılandırılır ve EAS `:app:bundleRelease` çalıştırırken `settings.gradle`'daki **tüm** projeleri yapılandırır. Wear modülünü oraya eklemek Compose derleyici/Kotlin sürüm çakışmasını release hattına taşır (RN'nin Kotlin sürümüne kilitlenir). Bu yüzden `wear/` repo kökünde **bağımsız** bir Gradle projesi olur (kendi wrapper'ı, kendi sürüm kataloğu). `.gitignore`'a `/wear/build/`, `/wear/app/build/`, `/wear/.gradle/` **köke sabitlenmiş** kalıplarla eklenir (AGENTS.md `/ios/` dersi).

### K2 — Vakitler TELEFONDA hesaplanır, saate HAZIR gönderilir
Tüm uygulama `CalculationMethod.Turkey()` (adhan-js) kullanır. Saatte adhan-kotlin ile yeniden hesaplamak iki ayrı algoritma kopyası = sessiz sapma riski. Tek doğru kaynak telefondur; saat **gösterir**. Telefon her gönderimde **dün + bugün + 6 gün = 8 günlük** vakit yollar → telefonla bağlantı bir hafta kopsa da saat doğru gösterir. Dünün verisi gece yarısı sonrası (aktif gün = dün, yatsı sürüyor) için gereklidir.

### K3 — Taşıma: Wearable Data Layer `DataItem` (Message DEĞİL)
`DataItem`'lar bağlantı yokken kuyrukta bekler ve bağlanınca senkronlanır; `MessageClient` bağlantı yoksa düşer.
- Telefon → saat: tek öğe `/namazakisi/durum` (JSON, `setUrgent()`).
- Saat → telefon: vakit başına öğe `/namazakisi/kildim/<tarih>_<vakit>` → telefon işler, sonra **siler**.

### K4 — Yük sözleşmesi (sürümlü)
```json
{
  "surum": 1,
  "olusturmaMs": 1760000000000,
  "konumAdi": "Kadıköy, İstanbul",
  "gunler": [
    { "tarih": "2026-10-12",
      "vakitler": { "imsak": 0, "gunes": 0, "ogle": 0, "ikindi": 0, "aksam": 0, "yatsi": 0 },
      "kilinan": ["sabah", "ogle"] }
  ]
}
```
`vakitler` epoch ms. `kilinan` yalnız dün ve bugün için doludur (diğerleri boş dizi). Saat `surum > 1` görürse **eski** veriyi gösterir ve "Telefondaki uygulamayı güncelleyin" der. Sözleşme iki tarafta nöbetçi testle kilitlenir: JS (`core/wear/wearYuku.test.ts`) ve Kotlin (`YukCozucuTest`).

### K5 — Telefonda gönderim noktaları
Saf üretici `src/core/wear/wearYuku.ts` (`wearYukuOlustur(koordinat, kilinanlarOkuyucu, simdi, konumAdi)`), domain servisi `WearSenkronServisi.gonder()` (Android dışı/modül yoksa no-op; modül `NativeModules.WearSenkron`). Çağrı yerleri:
1. `App.tsx` açılış zinciri (WidgetServisi'nin yanında),
2. `KonumDegisikligiServisi.konumDegistiUygula` (konuma bağlı tüketicilerin **tek yayma noktası** — AGENTS.md; App.tsx listesine de eklenir),
3. `ArkaplanGorevServisi` 15-dk görevi — **muhafız erken dönüşlerinden ÖNCE** (cuma/seri sayaç dersi; 8 günlük pencere aksi halde tazelenmez),
4. Her kılınmışlık yazımından sonra: `LocalNamazServisi.localNamazDurumunuGuncelle` başarıyla yazınca (tüm yollar — UI toggle, bildirim "Kıldım", saat "Kıldım", içe aktarma — buradan geçer; tek nokta).

Gönderim debounce'lanmaz ama **içerik aynıysa** Data Layer zaten `onDataChanged` üretmez; ek koruma gerekmez.

### K6 — Saatten "Kıldım": Headless JS ile TELEFONUN kendi yolu
Saat `/namazakisi/kildim/<tarih>_<vakit>` yazar (`{ kilindi: true, zamanMs }`). Telefonda:
1. `WearDinleyiciServisi : WearableListenerService` (`DATA_CHANGED`, path prefix `/namazakisi/kildim`) öğeyi okuyup SharedPreferences kuyruğuna ekler, DataItem'ı siler.
2. `WearKildimGorevServisi : HeadlessJsTaskService` başlatılır → `index.ts`'te kayıtlı `WearKildim` görevi kuyruğu boşaltır (`WearSenkron.bekleyenleriAl()`), her öğe için `BildirimServisi.saattenKildimIsle(vakit, tarih)` → bu, bildirimdeki "Kıldım" ile **aynı** `kildimAksiyonunuIsle` gövdesini çağırır (kayıt + `vakitKilindiTemizle`).
3. Yedek: uygulama ön plana her geldiğinde kuyruk yine boşaltılır (headless başlatma OEM tarafından engellenirse kayıp olmaz).
4. İşlem sonunda K5/4 durum gönderir → saat tiki doğrular.

Saat **iyimser** gösterir (tik hemen düşer, gri "eşitleniyor" noktasıyla), telefondan güncel durum gelince nokta kalkar. Saatten **geri alma YOK** (yanlış dokunuşa karşı işaretleme öncesi onay ekranı var); geri alma telefondan yapılır — kerahat/puan/seri mantığı tek yerde kalır.

Kerahat: telefonda kerahat **uyar, engelleme** kuralı var (#82). Saatte onay ekranı kerahat vaktindeyse kısa bir not gösterir ("Kerahat vaktindesiniz") ama engellemez — kerahat hesabı telefondan gelmez; saat yalnız güneş doğuşu+20 dk / öğle−5 dk / akşam−20 dk pencerelerini yükteki vakitlerden türetir (`KazaHesaplayiciServisi.mekruhVakitKontrolEt` ile aynı sabitler).

### K7 — Saat uygulaması bileşenleri (Kotlin, Compose for Wear OS Material 3)
- `minSdk 30` (Wear OS 3), `targetSdk 35`. `com.google.android.wearable.standalone = false` (veri telefondan gelir).
- **Ana ekran:** `TimeText` + üstte sıradaki vakit ve canlı geri sayım, altında 6 vakit satırı (`ScalingLazyColumn`): saat, kılındı ise ✓; satıra dokununca onay → "Kıldım". Yuvarlak ekran uyumlu, dokunma hedefi ≥48dp. Veri yoksa: "Telefonunuzda Namaz Akışı'nı açın".
- **Tile:** sıradaki vakit adı + saati + kalan süre; vakit sınırlarında **zaman çizelgesi (timeline) girdileri** ile kendiliğinden değişir (uyanma gerektirmez); `freshnessIntervalMillis` = 0, telefon verisi gelince `TileService.getUpdater().requestUpdate()`.
- **Komplikasyon:** `SHORT_TEXT` (vakit kısa adı + kalan süre `TimeDifferenceComplicationText` — sistem canlı sayar), `RANGED_VALUE` (vakit penceresinin ilerlemesi), `LONG_TEXT` ("İkindi 15:42 · 1 sa 12 dk"). `ComplicationDataTimeline` ile vakit sınırlarında değişir.
- **Saf çekirdek** `VakitHesabi.kt`: `siradakiVakit(yuk, simdi)`, `aktifVakit`, `pencereIlerlemesi`, `kerahatMi`, `yukuCoz(json)` → JVM birim testleri (Robolectric yok).
- Metinler Türkçe, arayüz "siz" dili; büyük harf `toUpperCase` YOK (sabit harita).

### K8 — Sürüm ve dağıtım
- `versionName` ve `versionCode` **telefonla birlikte yürür**: `wear/app/build.gradle.kts` sürümü `android/app/build.gradle`'dan okur, `versionCode = telefon + 1_000_000` (Play aynı uygulamada benzersiz versionCode ister; release betiği DEĞİŞMEZ).
- CI: yeni `wear-build.yml` — `pull_request` (yol filtresi `wear/**`, `android/app/src/**/wear*`) + `workflow_dispatch`: `./gradlew test lint assembleDebug`. Release AAB + Play `wear:internal` yüklemesi **ayrı faz**: Play **yükleme anahtarı** EAS'te yönetiliyor; saat AAB'sinin aynı anahtarla imzalanması gerekir → anahtarın CI'a nasıl verileceği Furkan'ın kararıdır (Faz 2).

## 3. Telefon tarafı native değişiklikler (`android/app`)
- Bağımlılık: `com.google.android.gms:play-services-wearable` (+ `kotlinx-coroutines-play-services` gerekmez; `Tasks.await` arka plan thread'inde).
- `WearSenkronModulu.kt` (`durumGonder(json)`, `bekleyenleriAl()`), `WearSenkronPackage.kt`, `WearDinleyiciServisi.kt`, `WearKildimGorevServisi.kt`; manifest'e iki servis. Yeni **izin YOK**.
- `AndroidManifest` izin sızıntısı kontrolü: play-services-wearable izin eklemez (doğrulanacak: merged manifest).

## 4. Riskler
| Risk | Önlem |
|---|---|
| Headless JS OEM pil kısıtıyla başlatılamaz | Kuyruk SharedPreferences'ta kalıcı; ön planda boşaltılır |
| Saat ile telefon farklı vakit gösterir | K2: tek hesap kaynağı |
| Yük şeması değişir, eski saat bozulur | `surum` alanı + iki taraflı sözleşme testi |
| Release hattı kırılır | K1: ayrı Gradle kökü, `android/` yapılandırması değişmez (yalnız app bağımlılığı + Kotlin dosyaları) |
| Saatte "Kıldım" yanlış dokunuş | Onay ekranı; geri alma telefonda |

## 5. Doğrulama
`npm run verify` + `wear/` için `./gradlew test assembleDebug` (yerelde SDK ile) + telefon app'i için CI debug APK build'i (`android-build.yml`, `build_type=debug`). Cihaz/emülatör testi bu oturumda yapılamaz → PR'da açıkça belirtilir.


---

## Nihai kararlar (Fable incelemesi sonrası — yukarıdaki taslağın ÜZERİNDE geçerlidir)

1. **K5/4 düzeltmesi — kılınmışlık TEK noktadan yazılmıyor.** Üç yazıcı var (`localNamazDurumunuGuncelle`, `localTumNamazlariGuncelle`, `localVerileriTemizle`); `LocalNamazServisi` içinde **gözlemci** (`kayitDegistiDinleyicisiniAyarla`) eklendi, üçü de başarılı yolda haber verir. Data katmanı domain import etmez; `WearSenkronServisi.baslat()` açılışta kaydolur. İçe aktarma `Depolama.yaz` ile doğrudan yazdığı için `yedeklemeSlice` sonunda **açıkça** `gonder()` çağrılır.
2. **K4 anahtar uzayı tek: `VakitAdi`.** `kilinan` kaynağı `namaz_gun_` kayıtları (`localTarihAraligindakiNamazlariGetir`), muhafız kaydı değil. Konum adı `konumMetniHesapla`. `olusturmaMs` yükten ÇIKARILDI (her gönderim yeni içerik sayılırdı); JS son gönderilen JSON'u tutup aynısını yazmaz. Kerahat dakikaları yükle gönderilir (saatte ikinci kopya yok).
3. **K6 headless:** `HeadlessJsTaskConfig(..., allowedInForeground = true)`; ReactContext `RESUMED` ise headless yerine `WearKildimGeldi` olayı. `startService` başarısızlığı hata değil — kuyruk SharedPreferences'ta, **üç** boşaltma yolu: headless görev, `App.tsx` AppState `active` (debounce'suz) + canlı olay, `ArkaplanGorevServisi` 15 dk görevi (muhafız erken dönüşlerinden önce). `registerHeadlessTask` `index.ts` üst seviyesinde, senkron.
4. **Zehirli öğe:** her öğe ayrı try/catch; hata → `basarisiz` (deneme sayacı), 5 denemede düşer.
5. **K8 versionCode:** Play'deki telefon kodu `expo-build.yml`'in `date +%s` zaman damgasıdır, `build.gradle`'daki 100 değil. Saat AAB'si kendi hattında `-PwearVersionCode=$(date +%s)`; yerelde 1. `versionName` `app.json > expo.version`'dan.
6. **`ci.yml` `wear/**` ve `wear-build.yml`'i yok sayar** → saat commit'leri telefon release'i kesmez. `wear-build.yml` PR kontrolüdür (JS sözleşme testi + Kotlin test + lint + debug APK).
7. **K7 Tile canlı saymaz** → tile vakit adı + saat; canlı geri sayım komplikasyonda (`TimeDifferenceComplicationText`). İkisi de zaman çizelgesiyle vakit sınırlarında kendiliğinden ilerler; telefon verisi gelince `requestUpdate`/`requestUpdateAll`.
8. **Play gerçekleri:** `standalone=false` 2026'da kabul, bedeli telefonsuz saatlerde listelenmemek. `uses-feature watch` (required=false yok), ayrı Wear form faktörü + Wear track, tile önizleme görseli (meta-data), 48dp dokunma hedefi, targetSdk 36. Wear AAB telefonla **aynı upload key** ile imzalanmalı (anahtar EAS'te → `eas credentials -p android` ile alınıp CI secret'ı) — **Faz 2**.
9. `.gitignore` köke sabitli `/wear/...` kalıpları; `.easignore` eklenmez; Kotlin dosya adları ASCII.

### Emülatör çifti ile doğrulama reçetesi (cihaz testi bu PR'da yapılamadı)
1. Telefon AVD (Play Store imajı) + Wear OS AVD oluştur; Android Studio "Wear OS emülatörünü eşle" ya da `adb -s <telefon> forward tcp:5601 tcp:5601` + telefona "Wear OS" uygulaması.
2. Telefon: `android-build.yml` debug APK; saat: `wear-build.yml` debug APK (ikisi de `android/app/debug.keystore` ile imzalı → Data Layer eşleşir).
3. Telefonda uygulamayı açın → saatte vakitler görünmeli. Saatte bir vakti işaretleyin → telefonda kılınmış görünmeli, o vaktin muhafız bildirimleri iptal edilmeli (`dumpsys alarm`).
4. Uygulama kapalıyken tekrarlayın: logcat `WearDinleyici` — headless başlatılamadıysa uygulamayı açınca işlenmeli.
