# Saat (Wear OS) yenileme ve kıble — uygulama planı

> Yol haritası satırı: `2026-10-15-kullanici-geri-bildirimi-yol-haritasi.md` **4.3** ("Wear OS: yenileme + kıble ekranı — yüke opsiyonel koordinat alanı, sürüm artmaz").
> Onaylı tasarım: <https://claude.ai/artifact/JBYa7PEu6ScVJZpFbkjDJK> ("Saat uygulaması: vakit yayı"). Sahip beş kararın hepsine **evet** dedi:
> (1) ana ekran içinde bulunulan vaktin **çıkışına** sayar, güneş→öğle arası öğlenin **girişine**; (2) altı vakit rengi (yalnız yay, vakit adı, liste şeridi); (3) saniye yalnız ana ekranda, ambient eklenir, tile/komplikasyon dakika; (4) "Kıldım" kenar düğmeli onay katmanı + aynı katmanda dönüşen sonuç; (5) tile'da canlı saniye yok.
> Sahibin ek isteği: "saatin kendi pusulasıyla kıble gibi, çalıştığı sistemi iyi kullanan bir uygulama."
>
> Bu belge PLANDIR; kod yazılmadı. Uygulama `superpowers:executing-plans` / `subagent-driven-development` ile yapılır, her dilim ayrı PR.

## 0. Tasarım belgesinden sonra değişen gerçek

Tasarım belgesi "Komplikasyonlar: değişen tek şey sayılan an" diyordu. **Bu iş master'da zaten yapıldı** (a017969, `fix(wear): … vaktin çıkışına kalan süre`): `cekirdek/KomplikasyonCizelgesi.kt > KalanSure.gosterim` çıkışa sayar, güneş→öğle "Öğleye" der, komplikasyonlar `GuvenliKomplikasyonServisi` tabanından geçer. Bu planda komplikasyon için yeni kural YAZILMAZ; tersine, ana ekran ve "Bugün" tile'ı **aynı kuralı** okumaya geçer (bkz. A1).

## Değişmeyenler (AGENTS.md Wear OS bölümü — iki dilimde de dokunulmaz)

- Saat YALNIZ GÖSTERİR; vakit hesabı telefonda. Saatte ikinci motor yok, adhan2 saate girmez.
- "Kıldım" yolu: `KildimAlicisi` → ortak kuyruk. Ekranın `onKildim` geri çağrısı değişmez.
- Tek alarm zinciri (`AlarmZinciri`, `Hatirlatici.tazele`), `SonDakikalar` penceresi, köprü etiketi kuralları.
- `GunDurumu` gün durumunun TEK kaynağı; yeni yüzey `Senkron.yuzeyleriTazele` listesine eklenir.
- Tile iki dokunuş + nonce kuralı (`BugunTileKarari`), tile canlı sayım yapmaz.
- Komplikasyonlar `GuvenliKomplikasyonServisi` tabanından; GOAL_PROGRESS/WEIGHTED_ELEMENTS `SDK_INT` kapısı + `@bool/api33` ikiz servis düzeni.
- Wear Compose **1.6.2** hattı (1.7 → Compose 1.12 → compileSdk 37 + AGP 9.1; kapalı), AGP 8.13, minSdk 30, Compose BOM yok.
- Yük sürümü **2** kalır; eklenen her alan EKLEMELİ OPSİYONEL.
- `FLAG_KEEP_SCREEN_ON` yok; ambient = `androidx.wear:wear` `AmbientLifecycleObserver` (Compose'un `rememberAmbientModeManager`'ı DEĞİL — Wear OS 6+ SDK'ya dayanır, minSdk 30'da çöker).

---

## A) Onaylı yeniden tasarımın uygulanması (W1)

### A0. Tema ve renk — tek kaynak

| Dosya | İş |
|---|---|
| **yeni** `cekirdek/SaatPaleti.kt` | Saf Kotlin, `android.*` import ETMEZ. ARGB `Long` sabitleri: zemin `#000000`, yüzey `#111813`/`#1B241D`, metin `#F2F5F2`/`#A9B5AC`, iz `#1E2A21`, eylem/kılındı `#66BB6A` (+ üstündeki metin `#06210A`), acil `#FF7A6B`, kerahat bandı `#FFCA28`, vakit tonları imsak `#9FA8FF` · güneş `#FFCC80` · öğle `#FFE07A` · ikindi `#FFB37A` · akşam `#FF9E9E` · yatsı `#C3AEFF`. `vakitRengi(vakit)` sabit haritadan. |
| **yeni** `ui/tema/SaatTemasi.kt` | `MaterialTheme(colorScheme = …)` — `SaatPaleti`'nden. `dynamicColorScheme` KULLANILMAZ (kimlik). Tüm ekranlar (`AnaEkran`, `TesbihatEkrani`, yeni `KibleEkrani`) çıplak `MaterialTheme {}` yerine bunu sarar. |
| `tile/*`, `hatirlatma/SonDakikalarBildirimi.kt` | Sabit kodlu yeşil/amber kalkar; renk `SaatPaleti`'nden (protolayout `argb(...)`). "Dört farklı dil" sorunu tek dosyadan çözülür. |
| **yeni test** `SaatPaletiTest.kt` | Her vakit tonu, eylem yeşili ve acil rengi siyaha karşı **≥ 7:1** (WCAG bağıl parlaklık; tasarımdaki yaklaşık değerleri kesinleştirir). Kerahat sarısı yalnız bant (dekoratif) → metin olarak kullanılmadığı testte belirtilir. AGENTS "token ≠ en yakın renk" dersi: metin olan her renk ölçülür. |

Yazı: sistem yazısı; rakamlarda `fontFeatureSettings = "tnum"` (saniye değişince genişlik oynamasın).

### A1. "Sayılan an" — tek kural

- `KalanSure`'ün karar ettiği aralığı (mod ÇIKIŞ/GİRİŞ, vakit, başlangıç ms, hedef ms) döndüren saf fonksiyon: **`VakitHesabi.sayilanAn(yuk, simdi): SayilanAn?`**. `KalanSure.gosterim` ve komplikasyon servisi bunu kullanacak şekilde yeniden bağlanır (davranış aynı; `KomplikasyonCizelgesiTest` değişmeden geçmeli = nöbetçi).
- Ana ekran yayı, ana ekran sayacı, "Bugün" tile'ı ve vakit listesi şeridindeki "1:58 kaldı" **yalnız bunu** okur.
- Kenar durumları (JVM `VakitHesabiTest`'e eklenir): yatsı → ertesi imsak (gece yarısını aşar, aktif gün DÜN); güneş → öğle (mod GİRİŞ, yay öğlenin rengiyle "Öğleye"); yükün ilk anı (önceki vakit yok → sıradakinin girişi); yük bitti (null → "telefonunuzda açın" durumu).
- Acil eşik **15 dk** telefondaki `ACIL_TON_UST_DK` ile aynı olmalı → Kotlin'de `SaatPaleti.ACIL_ESIK_DK = 15` + jest nöbetçisi (`src/core/wear/__tests__/saatSabitleri.test.ts`) Kotlin dosyasını okuyup `ACIL_TON_UST_DK` ile karşılaştırır (`anahtarKelimeler.test.ts` deseni). Kerahat bandı süresi yükteki `kerahatDk.gurub`'dan (ikinci kopya yok).

### A2. Ana ekran (`ui/AnaEkran.kt`, yeni `ui/VakitYayi.kt`, `ui/AnaAktivite.kt`)

Yapı: `AppScaffold(timeText = TimeText)` → `ScreenScaffold` → liste. İlk öğe **tam ekran sayaç bileşeni**, sonra günün vakitleri, en altta konum adı + "Tesbihat" + (W2) "Kıble" girişleri.

Sayaç bileşeni (`VakitYayi`):
- `Canvas` + `drawArc`: iz 30°–330° (tepede `TimeText` boşluğu), parlak kısım kalan oran, baştaki nokta "şimdi". Saat yönünde boşalır.
- Orta: vakit adı (vakit renginde) · `S:DD` iri, `:ss` küçük ve soluk · "vaktin çıkmasına" / mod GİRİŞ'te "girmesine". Altında "Kıldım" (`Button`, eylem yeşili) ve beş nokta — noktalar **`GunDurumu.ozet`'ten** (`GunDurumu.noktalar` ile aynı veri; ikinci sayım YOK).
- Son 15 dk: yay, ad ve saniye acil rengine geçer (bir kez, 450 ms). İkindinin son `gurubDk` dakikasında yayın dışında kesikli kerahat bandı.
- Saniye döngüsü: `LaunchedEffect` + `repeatOnLifecycle(RESUMED)`, bir sonraki saniye sınırına hizalı `delay` — yalnız etkileşimli modda. Ambient'te koşmaz.
- Açılış: tek `Animatable` 0 → oran, 600 ms. Vakit sınırında ad/renk 450 ms geçiş, yay yeniden çizilir.

Ambient (yeni iş): `AnaAktivite`'ye `AmbientLifecycleObserver` bağlanır (tesbihattaki desen). Ambient görünüm: siyah zemin, yalnız ince yay izi + dış hatlı rakam, saniye yok, renk yok (acil/kerahat dahil), `onUpdateAmbient` ile dakikada bir tazelenir. Burn-in kaydırması `cekirdek/TesbihatAmbient`'in kaydırma kuralıyla — ortaklaştırılırsa `cekirdek/AmbientKaydirma.kt`'a taşınır ve tesbihat oradan okur (davranış aynı, `TesbihatAmbientTest` nöbetçi); **API 36+'da uygulama kaydırmaz** (sistem kaydırır — mevcut kural). Etkileşimli ağaç ambient'te kompozisyondan çıkar.

Kare / yuvarlak: `LocalConfiguration.current.isScreenRound`. Karede saat üstte düz yazılır, yay köşelere taşmadan aynı daire üzerinde; onay düğmesi yuvarlatılmış dikdörtgen.

### A3. Günün vakitleri

- `TransformingLazyColumn` (1.6.2'de varlığı **ilk derlemede doğrulanır**; yoksa mevcut `ScalingLazyColumn(initialCenterItemIndex = 0)` korunur — kare saatte TimeText altında kalma dersi).
- Satır: solda sabit genişlikte saat, ortada ad, sağda durum (kılındı = dolu yeşil daire, şu anki = solda vakit renginde şerit + "1:58 kaldı", güneş zeminsiz/soluk/dokunulmaz). Veri `VakitHesabi.satirlar`'dan aynen.
- "Dokunarak işaretleyin" talimatı kalkar; satıra dokunmak A4'teki aynı onayı açar.
- Rotary (taç): her listede `ScreenScaffold(scrollState)` + liste durumu bağlı olmalı; 1.6.2'de liste bileşenlerinin varsayılan rotary davranışı (`rotaryScrollableBehavior`) **ilk derlemede doğrulanır** — yoksa açıkça verilir. Emülatörde `adb shell input rotaryencoder scroll` ile denenir.

### A4. "Kıldım" — kenar düğmeli onay + aynı katmanda sonuç

- İlk dokunuş (ana ekran düğmesi ya da satır) katmanı açar: "Öğle'yi kıldınız mı?" + alt kenara yaslı onay düğmesi (`EdgeButton` / `AlertDialog`'un kenar düğmeli biçimi — **1.6.2'deki tam adlar ilk derlemede doğrulanır**; yoksa `Box` içinde alt hizalı özel düğme).
- Kerahat vaktinde soru altında kerahat rengiyle bir satır: uyarır, **engellemez** (telefon kuralı #82).
- İkinci dokunuş: düğme 180 ms daralır → 300 ms onay işaretine dönüşür + arkadaki yay yeşile döner → 450 ms katman kapanır; ana ekranda "Kılındı" kalır, ilgili nokta dolar. `HapticFeedbackType.Confirm`. `ConfirmationDialog` KULLANILMAZ (ekranı değiştirir).
- Vazgeç: küçük düğme + kaydırarak kapatma (`SwipeToDismissBox` davranışı). Geri tuşu = vazgeç.
- Onay anında karar yeniden doğrulanır (vakit değiştiyse işaretlemez — mevcut `onKildim` öncesi kontrol korunur). İyimser bekleyen (`bekleyen`) mantığı değişmez.

### A5. Tesbihat (`TesbihatEkrani.kt`, `TesbihatAmbientEkrani.kt`)

- Tek `Canvas`, üç yay (Sübhânallah / Elhamdülillâh / Allâhü ekber, 33'er). Ortada fazın kendi sayısı ("21 / 33").
- **Dördüncü faz (TEHLİL, 100. sayım)**: tasarımda yok, burada sabitlenir — üç yay tam dolu + bir kez parlama + ortada "Lâ ilâhe illallâh" ve "Tamamlandı". Faz ve sayı yalnız `Tesbihat.Durum`'dan türer.
- Çentikte yay 120 ms ilerler, hızlı çevirmede animasyon atlanır. 33/66/99'da biten yay 300 ms parlar + mevcut `TesbihatHaptik` deseni.
- Ambient: dolgu yok, ince yay izleri + dış hatlı rakam (mevcut ambient kuralları).
- `TacBiriktirici`, `TesbihatHaptik`, depolama, eskime kuralı AYNEN.

### A6. Tile'lar

- **"Bugün"** (`BugunTileServisi`): beş dilimli yay halkanın tamamına (kılınan yeşil, şu anki vakit renginde ve `sayilanAn` oranında dolu, gelecek koyu); ortada şu anki vakit + dakikalık kalan + tek "Kıldım". Ortadaki beş daire kalkar. İki dokunuş/"Tekrar" (`BugunTileKarari`) aynen; tesbihat kısayolunun ipucu satırı yeri (`tesbihatKisayoluGoster`) aynen.
- **"Sıradaki vakit"** (`VakitTileServisi`): giriş saati en büyük öğe, üstünde ad (vakit renginde), altında "ne kadar sonra"; altta günün kalan iki vakti; konum kalkar.
- Zaman çizelgesi ufku ve girdileri değişmez (yükün tamamı; sınırlarda girdi). Tile önizleme drawable'ları (`tile_onizleme`, `bugun_tile_onizleme`) yeni görünümle yeniden üretilir.

### A7. Komplikasyonlar

Yeni kural yok (bkz. §0). Yalnız: RANGED_VALUE `colorRamp` (API 33+, `SDK_INT` kapısı) vakit rengine bağlanabilir — **kadran çizicisi rengi yok sayabilir**, bu yüzden kozmetik ve isteğe bağlı; kapsam küçük.

### A8. Ongoing Activity ("son dakikalar")

Davranış aynı (`SonDakikalar`, `CanliGosterim`, Now Bar seçimi). Yalnız: bildirim vurgu rengi `SaatPaleti`'nden (vakit rengi), metin ana ekranla aynı dilde ("Öğle · çıkmasına"); dokunuş ana ekranı açar (zaten öyle — doğrula).

### A9. Erişilebilirlik

- Sayaç bileşeni **tek düğüm** (`semantics(mergeDescendants = true)`): "Öğle vaktinin çıkmasına 1 saat 58 dakika". Saniye metni ayrı düğüm DEĞİL, `liveRegion` YOK — TalkBack her saniye okumasın; açıklama dakika değişince güncellenir.
- Yay dekoratif (`clearAndSetSemantics` sayaç düğümünde). Beş nokta: "Bugün 2/5 kılındı".
- Dokunma hedefleri ≥ 48 dp (Wear yönergesi); kenar düğmesi zaten büyük.
- Yazı ölçeği: Wear en büyük ölçekte (1.24 dolaylarında) iri rakam taşmamalı → saat rakamı `autoSize`'a değil sabit-ölçekli üst sınıra; emülatörde `settings put system font_scale 1.24` ile kare.
- "Animasyonları kaldır" (`ANIMATOR_DURATION_SCALE == 0`) → her sahne son karesine atlar.
- Renk tek başına anlam taşımaz: acil durumda yay rengine ek olarak adın yanında "son 15 dk" metni; kılınan satırda daire + "kılındı" açıklaması.

---

## B) Kıble (W2)

### B1. Konum kaynağı — öneri: telefondan yükte opsiyonel koordinat

**Öneri:** yüke `konum?: { lat, lng }` (FusedLocation/saat GPS'i DEĞİL). Gerekçe:
1. Saat `standalone=false`; vakit, konum adı, kerahat zaten telefondan gelir. Konumun tek otoritesi telefon (otomatik/manuel mod, geofence, elle yenileme). Saatte ikinci konum kaynağı, telefon manuel "Erzurum" derken saatin GPS ile başka yer söylemesi gibi sessiz sapma doğurur.
2. **Sıfır yeni izin.** Saat APK'sı telefonla aynı Play kaydında; saate `ACCESS_FINE/COARSE_LOCATION` eklemek izin istemi + Data Safety beyanını yeniden açar. Koordinat kullanıcının kendi cihazları arasında Data Layer'la gider; yükte zaten konum türevi `konumAdi` var.
3. Manyetik sapma (`GeomagneticField`) aynı koordinatı ister — tek kaynaktan ikisi de çözülür.
4. Pil: saatte GPS sabitlemesi yok.

Bedel: telefon günlerce görünmezse kıble son bilinen konumla hesaplanır (yolcu için kabul edilir: ekranda "Konum: <konumAdi>" yazar, kullanıcı neye göre olduğunu görür). Alan yoksa (eski telefon) ekran: "Kıble için telefonunuzdaki Namaz Akışı'nı güncelleyin." — konum izni İSTENMEZ.

### B2. Yük alanı (sözleşme)

- `wearYuku.ts`: `konum?: { lat: number; lng: number }`, **4 ondalığa yuvarlanır** (≈ 11 m; kıble hatası ihmal edilir) — yuvarlama şart: kayan nokta gürültüsü her gönderimi "yeni" yapardı (AGENTS "yüke zaman damgası koyma" dersiyle aynı mekanizma). `{0,0}` "yapılandırılmadı" nöbetçisi → alan YAZILMAZ. Kaynak `wearYukuOlustur` girdisindeki `koordinat` (zaten var).
- Doğrulama **gevşek** (bilinçli sapma): `canli` bozuksa tüm yük `Gecersiz` olur; `konum` bozuksa (aralık dışı, sayı değil) yalnız `konum = null` — kıble ikincildir, vakit gösterimi ayakta kalmalı. JS `wearYukGecerliMi` ile Kotlin `YukCozucu` bu kuralı AYNI uygular.
- `Yuk.kt`: `val konum: Konum? = null`. Sürüm **2** kalır.
- Fikstür `wear/app/src/test/resources/ornek-yuk.json`'a `konum` eklenir; ayrıca `konum`suz bir varyant (geriye uyum) ve bozuk `konum`lu bir varyant (yük geçerli, konum null) test edilir — JS ve JVM tarafında.
- **Apple Watch:** `targets/saat/ortak/SaatYuku.swift` Codable → bilinmeyen anahtarı yok sayar; aynı fikstürü okuyan `targets/saat/test/main.swift` Linux `swiftc` ile koşturulup geçtiği doğrulanır. Apple Watch'ta kıble bu planın kapsamı dışı.
- `scripts/saat/saat-tohum-yuku.js` tohumuna Fatih/İstanbul koordinatı eklenir (nöbetçi `saatTohumYuku.test.ts` `wearYukuGecerliMi`'den geçirir).
- Boyut etkisi ~40 bayt; `WEAR_YUK_BAYT_SINIRI` etkilenmez.

### B3. Kıble açısı — fikstürle kilitli ikiz

- **yeni** `cekirdek/Kible.kt` (saf): adhan JS `Qibla` ile birebir — Mekke `21.4225241, 39.8261818`, `atan2(sin Δλ, cos φ·tan φk − sin φ·cos Δλ)`, `unwindAngle` (0–360). Saate adhan2 bağımlılığı EKLENMEZ.
- **yeni** `scripts/saat/kible-fikstur-uret.js` (`scripts/tv/tv-verisi-uret.js` kalıbı): adhan JS ile ~8 nokta → `wear/app/src/test/resources/kible-ornekleri.json`. Noktalar: İstanbul, Erzurum, Van, İzmir (TR), Londra (batı), Cakarta (doğu → açı ~295°), Oslo (kuzey), Medine/Mekke'ye çok yakın bir nokta (dejenere durum).
- JVM `KibleTest`: fikstürü okur, tolerans 1e-9. Jest `src/core/wear/__tests__/kibleParitesi.test.ts`: fikstürü adhan'dan yeniden üretip birebir karşılaştırır (`TvVakitParitesi` deseni) — telefon formülü değişirse iki taraf birlikte kırılır.

### B4. Sensör ve yön

- **yeni** `kible/KiblePusulasi.kt`: `SensorManager`'dan `TYPE_ROTATION_VECTOR` (jiroskoplu, yumuşak); yoksa `TYPE_GEOMAGNETIC_ROTATION_VECTOR` (düşük güç, jiroskopsuz); ikisi de yoksa `TYPE_ACCELEROMETER + TYPE_MAGNETIC_FIELD` (`getRotationMatrix`); hiçbiri yoksa ekran: "Bu saatte pusula sensörü bulunmuyor. Kıble yönünü telefonunuzdan görebilirsiniz." **İzin gerekmez** (gövde sensörü değil).
- `getRotationMatrixFromVector` → `getOrientation` → manyetik azimut; **gerçek kuzey = azimut + `GeomagneticField(lat, lng, 0, şimdi).declination`** (Türkiye'de ~5–7° doğu; telefon `trueHeading` ile bunu zaten yapıyor, saat yapmazsa iki cihaz farklı yön gösterir).
- Örnekleme `SENSOR_DELAY_UI`; kayıt **yalnız RESUMED ve etkileşimli** iken; ambient'e girince/arka plana gidince kayıt silinir (sensör CPU'yu uyanık tutar), son yön dondurulur.
- Yumuşatma: düşük geçiren süzgeç **açı uzayında** (sin/cos ortalaması; 359°→1° sıçraması olmasın) + ok dönüşünde en kısa yol (`NativePusulaView` deseni).
- Eğim: saat yüzü yataydan > ~35° saparsa "Saatinizi yere paralel tutun" ipucu (pitch/roll `getOrientation`'dan); yön göstermeye devam eder.
- Kalibrasyon: `onAccuracyChanged` ≤ `SENSOR_STATUS_ACCURACY_LOW` → "Kalibrasyon için bileğinizle havada 8 çizin" bandı (kibar "siz"); doğruluk yükselince kalkar.

### B5. Hizalama kararı + titreşim

- **yeni** `cekirdek/KibleKarari.kt` (saf): girdi kıble açısı + gerçek yön → `hedefAcisi` (cihaza göre, 0 = kıble önde), `hizali` durumu **histerezisli**: ≤ 5° girer, > 10° çıkar (telefonun `KIBLE_HIZALAMA_ESIGI` 10). JVM `KibleKarariTest` (sınırlar, 359/1 sarması, histerezis titremesi).
- Titreşim: hizaya **girişte bir kez** (`VibrationEffect.EFFECT_CLICK` / `HapticFeedbackType.Confirm`), çıkıp yeniden girmeden tekrar etmez; ambient'te yok.
- Görünüm: halka (kuzey işaretli, dönen) + Kâbe işaretli sabit hedef oku; hizalıyken ok ve halka eylem yeşili, ortada "Kıble yönündesiniz". Altta "Kıble 151° · Fatih". TalkBack: "Kıble 40 derece sağınızda" — dakika değil **10°'lik adımlarla** güncellenen açıklama (her sensör olayında okumasın).

### B6. Erişim noktaları

- Ana ekran listesinin dibinde "Kıble" (tesbihatın yanında) → **yeni** `ui/KibleAktivite.kt` (`exported=true`, filtresiz, `taskAffinity=""` — `TesbihatAktivite` deseni).
- **Komplikasyon** `KibleKomplikasyonServisi` (`GuvenliKomplikasyonServisi` tabanı): `MONOCHROMATIC_IMAGE` + `SMALL_IMAGE` (pusula simgesi) + `SHORT_TEXT` ("Kıble 151°", statik açı — kuzeye göre); dokunuş `KibleAktivite`'yi açar. Statik açı yalan değildir (kuzeye göre derece); dönen ok ÇİZİLMEZ (komplikasyon sensör okuyamaz). `Senkron.yuzeyleriTazele` listesine eklenir (konum değişince açı tazelenir).
- Kıble **tile'ı yok** (bkz. C).

### B7. Pil

Sensör yalnız ekran açık + etkileşimli + RESUMED iken. Ekranın kendi zaman aşımı geçerli (`FLAG_KEEP_SCREEN_ON` yok). Konum hiç sorgulanmaz. Loglarda koordinat YAZILMAZ (güvenlik kuralı).

---

## C) Sistem entegrasyonu — seçilenler ve reddedilenler

"Çalıştığı sistemi iyi kullanan" isteği şu ölçülebilir maddelere indirgenir:

| # | Madde | Karar | Gerekçe | Maliyet / risk | Test edilebilir ölçüt |
|---|---|---|---|---|---|
| 1 | Saatin kendi pusulası (kıble) | **AL** (W2) | Saatin en güçlü bağımsız sensör kullanımı; bilekte telefonu çıkarmadan yön | Orta; sensörsüz saatler | Sensör yoksa net mesaj; hizalanınca tek titreşim; JVM karar testleri |
| 2 | Ambient (ana ekran) | **AL** (W1) | Saat bilekte indirildiğinde de vakit okunur | Küçük; burn-in | Ambient karesi: saniye yok, renk yok, dakikada bir |
| 3 | Taç/rotary her listede | **AL** (W1) | Wear'in temel girişi | Küçük; 1.6.2 API adı | `input rotaryencoder` ile liste kayar |
| 4 | Haptik dili | **AL** | Kıldım `Confirm`, tesbihat mevcut, kıble hizalanma tek atım | Küçük | Ambient'te titreşim yok; tekrar yok |
| 5 | Ongoing Activity | **KORU + hizala** | Zaten var; yalnız renk/metin | Küçük | Davranış testleri değişmez |
| 6 | Komplikasyon kıble | **AL** (W2) | Kadrandan tek dokunuşla pusula | Küçük | Dokunuş `KibleAktivite`'yi açar |
| 7 | Watch Face Format kadranı | **REDDET** | Ayrı ürün (kod içermeyen ayrı paket, ayrı tasarım/bakım); bizim verimiz her kadrana komplikasyonla zaten giriyor | Büyük | — |
| 8 | Health Services / namaz algılama | **REDDET** | `BODY_SENSORS`/`ACTIVITY_RECOGNITION` + sağlık Data Safety yükü; algılama güvenilmez ve otomatik "kıldı" işaretlemek fıkhen/ürün olarak yanlış (terk ≠ gecikme, kayıt kullanıcının beyanı) | Büyük | — |
| 9 | Tile'da tek dokunuş "Kıldım" | **REDDET** | İki dokunuş + nonce kuralı kazara işaretlemeyi ve sistemin son tıklamayı yeniden göndermesini önlüyor | — | — |
| 10 | Kıble tile'ı | **REDDET** | Tile sensör okuyamaz; statik ok yön gösteriyormuş gibi yalan söyler. Açı bilgisi komplikasyonda | — | — |
| 11 | Tile'da canlı saniye | **REDDET** (karar 5) | protolayout dinamik zamanı eski çizicilerde boş metin riski | — | — |
| 12 | Saatte bağımsız GPS / standalone | **REDDET** | Tek hesap ve konum kaynağı telefon (B1) | — | — |
| 13 | Saatte bağımsız bildirim | **DEĞİŞMEZ** | #280 zinciri + köprü etiketi zaten var | — | — |
| 14 | Vakit renklerini telefona taşıma | **KAPSAM DIŞI** | Tasarım "ileride" diyor; ayrı karar | — | — |

---

## D) Sözleşme, izin, test ve kare değişiklikleri

**Yük:** yalnız W2'de `konum` (B2). W1 yüke DOKUNMAZ.

**İzinler:** iki dilimde de **yeni izin yok**. Manifest'e yalnız `KibleAktivite` + `KibleKomplikasyonServisi` girer. Data Safety: saat tarafında değişiklik beklenmez (konum izni yok; koordinat kullanıcının cihazları arasında). Sahibin Play Console'da "konum verisi telefon ile saat arasında aktarılıyor" maddesinin mevcut beyanla örtüştüğünü bir kez kontrol etmesi önerilir (risk, karar değil).

**JVM testleri (yeni/güncellenen):** `SaatPaletiTest`, `VakitHesabiTest` (sayilanAn), `KomplikasyonCizelgesiTest` (değişmeden geçmeli), `TesbihatTest` (4. faz görünüm durumu, saf kısım), `TesbihatAmbientTest`/`AmbientKaydirma` (ortaklaştırılırsa), `KibleTest` (fikstür), `KibleKarariTest`, `YukCozucuTest` (konum var/yok/bozuk).

**Jest:** `wearYuku.test.ts` (konum yuvarlama, `{0,0}` atlanır, bozuk konum yükü düşürmez), `kibleParitesi.test.ts`, `saatSabitleri.test.ts` (acil eşik), `saatTohumYuku.test.ts`.

**Ekran görüntüsü hattı** (`android-ekran-goruntuleri.yml`, `tur: saat`; betik `scripts/saat-kare-hatti.sh`). Hat içerik açıklamasıyla (`content-desc`) gezdiği için yeni bileşenler şu açıklamaları TAŞIMAK zorunda, betikteki desenler de buna göre değişir:

| Kare | Bekleme/dokunma deseni (yeni) | Not |
|---|---|---|
| `01-ana-ekran` | `hazir_bekle 'çıkmasına\|girmesine\|telefonunuzda'` | Eski `Sıradaki\|Dokunarak` desenleri kalkar |
| `02-vakitler` | kaydırma aynı | Şerit + "kaldı" görünmeli |
| `03-kildim-onayi` | `bul_ve_dokun 'Kıldım'` (ana ekran düğmesinin açıklaması: "<Vakit> vaktini kıldım olarak işaretleyin") | Eski `Dokunarak işaretleyin` kalkar |
| `04-tesbihat` | aynı | Üç yay |
| `05-tile-bugun`, `06-tile-vakit` | aynı | Yeni düzen |
| **yeni** `07-ana-ambient` | `adb shell input keyevent KEYCODE_SLEEP` sonrası (ambient emülatörde destekleniyorsa; desteklenmezse `UYARI` ile atlanır) | W1 |
| **yeni** `08-kible` | `am start … .ui.KibleAktivite`, `adb emu sensor set magnetic-field …` + `acceleration 0:0:9.8` | W2 |

`scripts/cihaz-kare-ozeti.js` beklenen listeyi betikteki `NN-ad` adlarından çıkarır → yeni kareler kendiliğinden beklenir. **Emülatörün dönme vektörü sensörü sunup sunmadığı DOĞRULANMADI:** sunmazsa `08-kible` B4'teki ivme+manyetik yedek yoluyla çizilir; o da yoksa kare "pusula sensörü bulunmuyor" durumunu çeker — özet adımı bunu `UYARI` olarak yazmalı, mağaza karesi olarak kullanılmaz. Gerekirse yedek: yalnız `BuildConfig.DEBUG`'da sabit yön veren bir intent ekstrası (release'e girmez) — ancak sensör emülasyonu başarısız olursa eklenir.

**Mağaza kareleri:** W1 ve W2 sonrasında hat yuvarlak + kare için yeniden koşulur; Play'deki Wear OS kareleri (`01`–`06` + `08-kible`) değiştirilir. Ambient karesi mağazaya konmaz.

**AGENTS.md** (aynı commit'lerde): Wear OS bölümüne SaatPaleti tek kaynak, `sayilanAn` tek kural, yük `konum` alanı (gevşek doğrulama + yuvarlama gerekçesi), kıble sensör/sapma/histerezis kuralları, kare hattı içerik açıklaması sözleşmesi eklenir.

---

## E) Dilimleme

### W1 — yeniden tasarım (yalnız `wear/**` + kare betiği)

Kapsam: A0–A9. Yüke, telefona, iOS'a dokunmaz → `ci.yml` `wear/**`'ı yok saydığı için **telefon release'i kesilmez** (betik commit'i `scripts/`'e dokunur → release keser; bu yüzden betik değişikliği ve AGENTS.md aynı PR'da, PR birleştirmesi tek release, ya da araç-yalnız kısmı `[skip ci]` kuralına göre ayrı ele alınır).

Sıra (her adım ayrı commit):
1. `SaatPaleti` + `SaatTemasi` + kontrast testi; ekranlar temaya sarılır (görünür değişiklik: lila → yeşil).
2. `VakitHesabi.sayilanAn` + `KalanSure` yeniden bağlama + testler.
3. `VakitYayi` + yeni ana ekran + saniye döngüsü + erişilebilirlik.
4. Ambient (ana aktivite) + `AmbientKaydirma` ortaklaştırması.
5. Vakit listesi + rotary.
6. Kenar düğmeli onay + sonuç dönüşümü.
7. Tesbihat üç yay + tehlil.
8. Tile'lar + önizleme drawable'ları; Ongoing renk.
9. Kare betiği desenleri + `07-ana-ambient`; AGENTS.md.

Doğrulama: `cd wear && ./gradlew testDebugUnitTest lintDebug assembleDebug` (Maven 429'da Google aynası init betiği) · PR'da `wear-build.yml` · `gh workflow run android-ekran-goruntuleri.yml --ref <dal> -f tur=saat` (dal kendi workflow sürümüyle koşar) → yuvarlak + kare kareleri gözle incelenir, özette `UYARI` yok · `npm run verify` (jest nöbetçisi eklendiği için).

### W2 — kıble + entegrasyon (W1 birleştikten sonra)

Kapsam: B1–B7, C6, D'deki yük değişikliği. Telefon dosyalarına dokunur (`wearYuku.ts`, fikstür, tohum, betik) → telefon release'i kesilir; saat ve telefon `saat_tv` ile aynı sürümde gider. Eski saat `konum`'u yok sayar, yeni saat eski telefonda "güncelleyin" der.

Sıra:
1. Yük `konum` (TS + Kotlin + fikstür varyantları + Swift fikstür testi) — tek başına geriye uyumlu.
2. `Kible.kt` + fikstür üretici + JVM/jest parite testleri.
3. `KibleKarari` + testler.
4. `KiblePusulasi` (sensör seçimi, sapma, süzgeç, eğim, kalibrasyon) + `KibleEkrani`/`KibleAktivite`.
5. Ana ekran girişi + `KibleKomplikasyonServisi` + `yuzeyleriTazele` listesi.
6. Tohum + kare `08-kible`; AGENTS.md.

Doğrulama: W1'dekiler + `npm run verify` + Linux `swiftc` ile `targets/saat/test/main.swift` (ortak fikstür) + emülatör çiftinde (telefon + saat, aynı debug imza) yükün `konum` taşıdığının `adb shell run-as … cat shared_prefs/saat_veri.xml` ile görülmesi.

---

## F) Riskler, doğrulanamayanlar, açık kararlar

**Riskler**
- 1.6.2'de `TransformingLazyColumn`, `EdgeButton`, `AlertDialog` kenar düğmesi yuvası ve liste rotary varsayılanının adları — ilk derlemede doğrulanır; yoksa A3/A4'teki yedekler.
- Ucuz saatlerde manyetometre yok ya da kötü: B4 mesajı ve yedek zinciri; kullanıcıya telefonun pusulası önerilir.
- Metal kordon/kasa manyetik sapması: kalibrasyon bandı yalnız sensör doğruluğuna bakar, sabit sapmayı yakalayamaz — ekranda "yaklaşık" dili ("Kıble yönündesiniz" ± 5°) ve telefonla karşılaştırma ipucu.
- Kare hattı içerik açıklamalarına bağımlı: yeni metinler sözleşme gibi davranır (D tablosu).
- `scripts/` değişikliği telefon release'i keser (AGENTS CI kuralı) — W1'de PR birleştirmesiyle tek release.

**Cihazda doğrulanamayanlar**
- Gerçek saatte kıble doğruluğu (Pixel Watch, Galaxy Watch) ve bilek pozisyonunda eğim davranışı.
- Ana aktivitede ambient'e geçiş ve `onUpdateAmbient` sıklığı (emülatör desteği sınırlı).
- Hizalanma titreşiminin farklı motorlardaki hissi; One UI Watch'ta `EFFECT_CLICK`.
- RANGED_VALUE `colorRamp`'in kadran çizicilerinde uygulanıp uygulanmadığı.
- Emülatörde dönme vektörü sensörünün varlığı (D).

**Sahibe sorulacak açık kararlar (en fazla 3)**
1. **Kıble konum kaynağı:** telefondan yükte koordinat (öneri — izin yok, tek otorite, sapma aynı kaynaktan) mı, saatin kendi konumu mu (izin + Data Safety + pil)?
2. **Kıble yüzeyleri:** liste girişi + kıble komplikasyonu, tile YOK (öneri) — yoksa ayrıca ikinci bir başlatıcı simgesi ("Kıble") de istenir mi?
3. **Hizalanma titreşimi:** girişte bir kez, histerezisli (öneri) mi; yoksa hizadayken aralıklı nabız mı (pil + rahatsızlık riski)?
