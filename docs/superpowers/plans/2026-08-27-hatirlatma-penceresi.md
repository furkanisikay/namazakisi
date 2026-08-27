# Uygulama Planı: Hatırlatma Penceresi — ortak hatırlatma motoru

> Tarih: 2026-08-27 · Sürüm: **v2** (Fable incelemesi sonrası, 14 bulgu işlendi) · Tasarım: [spec](../specs/2026-08-27-hatirlatma-penceresi-ortak-motor-design.md) · Dal: `claude/toparlanma-calculation-bug-47ojw1` (PR #233)

## Kapatılan açık sorular (kullanıcı kararı)

| Soru | Karar |
|---|---|
| Faz sırası | **Hepsi yapılacak.** Faz 0 ve 5 paralel, gerisi sıralı. |
| Seri gün sınırının imsağa kayması kabul mü? | **Kabul — duyuru YOK.** Mevcut davranış zaten bozuk (motor 05:00, bildirim imsak). |
| `themeType: 'seri'` native layout mı? | **Yeni layout.** Native değişiklik → debug APK build doğrulaması zorunlu. |
| Faz 3 (ortak bileşen) ile 4 (cuma) sırası | **Birlikte.** |

## v1 → v2 farkı (inceleme bulguları)

v1 planı adversaryal incelemeden geçti; **14 bulgunun tamamı geçerli çıktı** ve plana işlendi. En ciddi üçü:

- **Ters eskalasyon (B1):** `aktifSeviyeyiBul` "kapsayan içinden en KÜÇÜK eşik kazanır" der. `girisindenItibaren` yönünde `olcuDk` 1'den başlar → 1. dakikada tüm eşikler kapsar → **acil kademe** kazanır. Kullanıcı vakit girer girmez "VAKİT ÇIKIYOR!" tonuyla karşılanır, süre geçtikçe nazikleşir ve `olcuDk` en büyük eşiği aşınca motor tamamen susar. v1'in "gövde değişmez" iddiası çok-seviyeli matriste yanlıştı.
- **Native mekanizma tespiti (B14):** spec "foreground service + CountDownTimer" diyordu; **modülde Service sınıfı yok**. Gerçek yol `NotificationManager.notify` + `RemoteViews.setChronometerCountDown` — sayacı sistem çizer. Sonuç: pil gerekçesi düşer, **chronometer hedefte durmaz** (sıfırı geçince saymaya devam eder).
- **Faz 5a testi tersti (B2):** v1 "imsak 03:30 iken 04:00 düne sayılır" diyordu — bu tam olarak düzeltilmek istenen eski 05:00 davranışı. Doğrusu: 04:00 **bugüne** sayılır.

## Dal stratejisi

Harness kuralı gereği tüm iş **mevcut dala** (PR #233) gider. Her faz ayrı commit; PR açıklaması faz bittikçe güncellenir.

## Değişmez kurallar (her fazda geçerli)

AGENTS.md'de yaşanmış bug olarak kayıtlı; hiçbir faz gevşetemez:

1. **Beş tüketici**: `ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`, `ArkaplanGorevServisi`, `KonumTakipServisi`. Son ikisi **ham AsyncStorage** okur; `muhafizMatrisiniCoz` tek kapı kalmalı.
2. **Konum tüketici listesi İKİ yerde yaşar**: `KonumDegisikligiServisi.konumDegistiUygula` **ve** `App.tsx` açılış zinciri. Yeni tüketici ikisine de eklenir.
3. **Göç idempotent + aynı referans** (değişiklik yoksa girdi nesnesi aynen döner).
4. **Yükleme yolu diske yazıyorsa `{...parsed, ...sonuc}`** — tiplenmemiş alanlar silinmemeli.
5. **Ön plan / arka plan id paritesi**: `muhafizBildirimIdOlustur` tek üretici.
6. **Kanal id'si sesin fonksiyonu**; kurulduktan sonra sesi değişmez, silip yeniden kurmak tombstone'a takılır. **Taban kanallar (`muhafiz`/`muhafiz_acil`) asla silinmez.**
7. **`npm run verify` her fazın sonunda yeşil**; lint uyarısı ≤ **372**; dokunulan dosyaya yeni uyarı eklenmez.

---

## Faz 0 — Dinamik eşik tavanı

**Amaç:** `ESIK_MUTLAK_MAX = 120` sabitini kaldır; tavan vaktin bugünkü penceresinden gelsin.

### Dosyalar
- `src/core/muhafiz/esikSinirlari.ts`
  - `esikSinirlariniHesapla(seviyeler, indeks, secenekler?: { pencereUzunluguDk?: number })`
  - **B5 (a):** `ESIK_GUVENLIK_TAVANI = 720` tek başına yetmez — `TEKRAR_MIN_DK = 1` iken 720 dk eşik tek vakitte 720 bildirim + (sesli modda) 720 exact alarm üretebilir; Android'in eşzamanlı alarm sınırı (~500) tek vakitte aşılır. Tavanla birlikte **plan uzunluğu muhafızı** gelir (aşağıda).
  - **B5 (b):** `pencereUzunluguDk` **verilmezse tavan `ESIK_MUTLAK_MIN_TAVAN = 120`** (gerçek geriye uyumluluk). v1'de "verilmezse 720" yazıyordu, testi ise "eski davranış" bekliyordu — çelişkiliydi.
  - Tavan = `min(pencereUzunluguDk - 1, ESIK_GUVENLIK_TAVANI)`, sonra komşu kısıtı.
- **Yeni:** `src/core/muhafiz/pencereUzunlugu.ts` — `pencereUzunluguDkHesapla(giris, cikis)`, `adimPencereyeSigarMi(esikDk, pencereUzunluguDk)`
- **Yeni:** `src/core/muhafiz/planButcesi.ts` — `planUzunluguGecerliMi(esikDk, siklik)` + `PLAN_ADIM_UST_SINIRI = 60` (vakit başına). `vakitUyariPlaniOlustur` çıktısı bu sınırı aşarsa **sıklık orantılı yükseltilir** (adım kaybı yerine seyrekleşme) ve `Logger.warn` düşer.
- `src/core/muhafiz/motorAdaptoru.ts` — `vakitUyariPlaniOlustur` plan bütçesini uygular.
- `src/presentation/screens/MuhafizAyarlariSayfasi.tsx` — o günün vakit aralıklarını `NamazVaktiHesaplayiciServisi`'nden alıp aşağı geçirir.
- `src/presentation/screens/MuhafizAyarlari/VakitKarti.tsx` + `SeviyeDetayModal.tsx` — stepper sınırı yeni imzadan; sığmayan adımda uyarı satırı.

### UI kuralı
Sığmayan adım satırı: **"Bu adım bugün çalışmayacak — yatsı bugün 6 sa 40 dk"**. Kibar "siz" dili; gövde metni tema token'ı, ikon dekoratif (`durum.uyari`'ya **zorlama** — AGENTS kontrast tuzağı).

### Testler
- `esikSinirlari.test.ts`: pencere 400 → tavan 399 · pencere 900 → 720 (güvenlik) · **pencere verilmezse 120 (eski davranış)** · komşu kısıtı tavanın önüne geçer.
- `pencereUzunlugu.test.ts`: gece yarısını aşan pencere (yatsı → imsak).
- `planButcesi.test.ts`: 720 dk eşik + 1 dk sıklık → plan `PLAN_ADIM_UST_SINIRI`'nı aşmaz, sıklık yükselir.
- `MuhafizAyarlariSayfasi.test.tsx`: sığmayan adımda uyarı render edilir, sığanda edilmez.

---

## Faz 1 — `olcuDk` + pencere yönü

**Amaç:** motor iki yönlü olsun. **En riskli faz** — B1, B3, B8, B11, B12 burada.

### 1a. Yön-farkında kazanan seçimi (B1 — kritik)
`aktifSeviyeyiBul` yön almalı:

| Yön | Kapsama koşulu | Kazanan | Eşik sırası |
|---|---|---|---|
| `cikisaDogru` (mevcut) | `olcuDk <= esikDk` | en **küçük** eşik | kesin **azalan** (nazik 45 → acil 5) |
| `girisindenItibaren` | `olcuDk >= esikDk` | en **büyük** eşik | kesin **artan** (nazik 5 → acil 45) |

Eşit eşikte tie-break: her iki yönde de **daha sert kademe** kazanır (mevcut davranış korunur).

`esikSinirlariniHesapla` da yön almalı: giriş yönünde komşu kısıtı ters çevrilir (bir üst komşudan **büyük**, bir alt komşudan **küçük**). `esikSiralamasiGecerliMi` aynı şekilde.

### 1b. Ön plan anonsunda sıra garantisi (B3 — kritik)
Mevcut tekilleştirme kanıtı: `kalanDk = floor(kalanSureMs/60000)` ⟹ `şimdi ≤ alarm anı` → ön plan, **henüz tetiklenmemiş** alarmı `FLAG_UPDATE_CURRENT` ile ezer.

Giriş yönünde bu ters döner: `olcuDk = floor((şimdi−giriş)/60000)` ⟹ `şimdi ≥ giriş + olcuDk·60000` → **alarm zaten tetiklenmiş**. Ön planın `planlaAnons(id, şimdi+1sn)` çağrısı onu geçmişe değil 1 sn sonraya yeniden kurar → arka plan dakika başında, ön plan aynı dakika içinde **ikinci kez** konuşur.

**Karar:** `girisindenItibaren` yönünde ön plan **anons planlamaz** (banner gösterir, sesi arka plan alarmı verir). `NamazMuhafiziServisi.onPlanAnonsuPlanla` yön kapısı alır.

### 1c. `VakitBilgisi.giris` (B8)
`VakitBilgisi` bugün yalnız `saat` (çıkış) + `kalanSureMs` taşıyor; giriş yok → `olcuDk = şimdi − baslangic` hesaplanamaz. `NamazVaktiHesaplayiciServisi` **A3'ün alanına** eklenir; `VakitBilgisi`'ye `giris: Date` gelir.

### 1d. Metin yüzeyleri (B11)
"Kaldı/çıkıyor" dili yalnız `anonsMetniniCoz`'da değil, **kullanıcı verisinde** de yaşıyor: `seviyeyeUygula`/`seviyeyiAc` boş anons kutusunu `ANONS_SABLONLARI[0]` ("…vakti çıkıyor, son {süre} dakika") ile doldurur. Yön girişe çevrilince diskteki metin "son 42 dakika" diye seslendirilir.

Kapsama girenler:
- `anonsMetni.ts` — yön-uygun şablon havuzu; `anonsMetniniCoz` `{süre}` çözümü yöne göre ("kaldı"/"geçti").
- `matrisIslemleri.seviyeyeUygula` + `seviyeAcKapa.seviyeyiAc` — boş kutuyu **yön-uygun** şablonla doldurur; **kullanıcının yazdığı metni ezmez** (modSec sözleşmesinin ikizi).
- `seviyeOzeti.ts` ("45 dk kala"), `vakitOzeti.ts` ("45 dk kala başlar"), `NamazMuhafiziServisi.seviyeMesajiOlustur` ("… dk kaldı") — yöne göre.
- Seviye-3 içerik havuzu (`SEYTANLA_MUCADELE_ICERIGI`, "vakit çıkıyor" nassları) → giriş yönünde bu havuz **kullanılmaz**, nötr havuz seçilir.

### 1e. Vakit sayacı uyumu (B12)
`vakitSayacYardimcisi.sayacBaslangicEsikleriHesapla` `esikDk`'yı "çıkışa kala" varsayar. Giriş yönüne çevrilen vakitte sayaç yanlış anda başlar ve #90 bastırma penceresi kayar. **Karar:** giriş-yönlü vakitler bastırma açısından "tümü kapsanır" sayılır (sayaç o vakit için planlanmaz) — en güvenli davranış; nöbetçi test.

### Dosyalar
- **Yeni:** `src/core/muhafiz/pencereTipleri.ts` — `PencereYonu`, `HatirlatmaPenceresi`, `olcuDkHesapla`
- `matrisTipleri.ts` — `VakitMuhafizAyari.yon?: PencereYonu` (yoksa `'cikisaDogru'`)
- `aktifSeviye.ts`, `esikSinirlari.ts`, `motorAdaptoru.ts`, `anonsMetni.ts`, `seviyeOzeti.ts`, `vakitOzeti.ts`, `matrisIslemleri.ts`, `seviyeAcKapa.ts`
- `NamazVaktiHesaplayiciServisi.ts` (`giris` alanı), `ArkaplanMuhafizServisi.ts`, `NamazMuhafiziServisi.ts`
- `src/core/utils/vakitSayacYardimcisi.ts`

### Kritik tuzak
Giriş yönünde uyarı pencere boyunca sürekli tetiklenir → **kılınmışlık hidrasyonu** (#92) kritik: `acilistaKilinanlariYukle` `baslat`'tan ÖNCE await edilmeli.

### Testler
- `pencereTipleri.test.ts`: iki yönde `olcuDk`; gece yarısı aşan pencere; pencere dışı davranış.
- `aktifSeviye.test.ts`: **giriş yönünde 1. dakikada NAZİK kazanır, son dakikada ACİL** (B1 nöbetçisi).
- `motorAdaptoru.test.ts`: `cikisaDogru` planı **birebir eskisiyle aynı** (regresyon); giriş yönü planı artan eskalasyon.
- `NamazMuhafiziServisi.test.ts`: giriş yönünde `planlaAnons` **çağrılmaz** (B3); kılınmış vakitte uyarı yok.
- `anonsMetni.test.ts` + `seviyeOzeti.test.ts`: yöne göre "kaldı"/"geçti"; **mevcut tam-dize testleri değişmeden geçer**.
- `vakitSayacYardimcisi.test.ts`: giriş-yönlü vakit bastırma listesinde (B12).

---

## Faz 2 — `UyariModu` → `UyariKanallari` göçü

**Amaç:** mod enum'unu kanal kümesine çevir; `titresim` alanı açılır (bağlanmaz).

### Dosyalar (B6 ile genişletildi)
- `matrisTipleri.ts` — `UyariKanallari`; `SeviyeAyari.mod` → `kanallar`; `oncekiMod` → `oncekiKanallar`
- **Yeni:** `src/core/muhafiz/kanalKumesi.ts` — `hicKanalAcikMi`, `kanalAc/Kapat`, `modKanallaraCevir`
- `muhafizGoc.ts` — `modlariKanallaraGoc`; **`eskidenMatriseGoc` de `mod:'bildirim'` üretiyor** → kanal yazacak
- `motorAdaptoru.ts`, `aktifSeviye.ts`, `seviyeAcKapa.ts`, `matrisIslemleri.ts`, `seviyeOzeti.ts`, `vakitOzeti.ts`
- **`kanalPlani.ts:38`** (`mod === 'sessiz'` okur) — v1'de atlanmıştı
- **`vakitSayacYardimcisi.ts:54`** (`muhafizUyarilanVakitleriBul`, #90 bastırması) — v1'de atlanmıştı
- **`presentation/store/muhafizSlice.ts`** (`HATIRLATMA_PRESETLERI` hücreleri `mod:` yazar) — v1 bunu `matrisIslemleri` başlığında anıyordu, dosya başka yerde
- `NamazMuhafiziServisi.VARSAYILAN_MATRIS`
- Ekranlar: `MuhafizAyarlari/sabitler.ts` (`MOD_BILGILERI` → kanal çipleri), `SeviyeDetayModal.tsx`, `VakitKarti.tsx`, `AnonsBilesenleri.tsx`
- Beş tüketici + `AnonsOnizlemeServisi` + `AkisOnizlemeModal`

### `oncekiMod` göçü (B10)
Kapalı adım bugün `mod:'sessiz' + oncekiMod:'ikisi'` taşır. Yalnız `mod` çevrilirse `oncekiMod` öksüz kalır ve `seviyeyiAc` `{bildirim:true}` yedeğine düşer → "ikisi + özel ses + anons" kurup kapatmış kullanıcı adımı geri açınca kurduğunu kaybeder (seviyeAcKapa'nın varlık sebebi olan bug geri gelir). Göç **`oncekiMod`'u da çevirir**.

### Göç mekaniği
İki nokta (`eskiAlarmSesiniGoc` deseni): `muhafizMatrisiniCoz` (ham AsyncStorage okuyanlar için) **ve** `muhafizAyarlariniYukle` (diske yazar → görünür olur).

### Testler
- `kanalKumesi.test.ts`, `muhafizGoc.test.ts`: dört modun eşlemesi; **`oncekiMod` da çevrilir**; değişiklik yoksa aynı referans.
- **Nöbetçi (B10):** "kapalı adım göç sonrası açılınca eski kanallarıyla döner".
- `seviyeOzeti.test.ts`: mevcut tam-dize testleri (em-dash dahil) **değişmeden** geçer.
- `muhafizSlice.test.ts`: preset hücre sayıları korunur (hafif 4/vakit 0 sesli · normal 6/vakit 1 sesli · yoğun 7/vakit 2 sesli).
- Nöbetçi: `sesliOnayi` rıza kaydı göçle **uydurulmaz**.

---

## Faz 3+4 — Ortak bileşen + cuma periyodik hatırlatma

**Amaç:** muhafız/cuma/seri aynı bileşeni kullansın; cuma tek adım + periyot alsın.

### Dosyalar
- **Yeni:** `src/presentation/components/hatirlatma/` — `PencereKarti.tsx` (← `MuhafizAyarlari/VakitKarti`), `AdimDetayModal.tsx` (← `SeviyeDetayModal`), `SesSecimSatiri.tsx`, `AkisOnizlemeModal.tsx`, `pencereTanimi.ts`
- `MuhafizAyarlariSayfasi.tsx` — 5 × `PencereKarti`
- `BildirimAyarlariSayfasi.tsx` — cuma bölümü 1 × `PencereKarti` (`maksAdim: 1`, `yonSecilebilir: false`)
- `LocalCumaHatirlatmaServisi.ts` — `siklik: Siklik` (varsayılan `'birkez'` → geriye uyumlu)
- `CumaHatirlatmaServisi.ts`, `cumaYardimcisi.ts`
- **Metin yüzeyleri (B11 devamı):** özet/banner metinleri yöne göre — ortak bileşene taşınırken korunur

### Cuma'da korunacaklar
Dört hafta ileri planlama · her cuma ayrı `PrayerTimes` · `NamazAdi.Ogle` kimliği · cumaya özgü nass · `vakit_bildirim` kanalı · koordinat **parametre** (getKonfig'ten okunmaz) · `(0,0)` reddi · `surenPlanlama` yarış koruması.

### Korunacak UI kuralları
İç içe modal yok · Switch satırı saran Touchable'ın **kardeşi** · serbest metin `onEndEditing`/blur'da · eşik stepper'ı komşulara kilitli · debounce'lu (1200 ms) **gerçek planı da tazeler**, unmount'ta hemen · adım renkleri kasten hardcoded, gövde metni tema token'ı · `SayisalSecici`'ye `aciklama` zorunlu · `DinleButonu` duyulacak şey yoksa çizilmez.

### Testler
- `PencereKarti.test.tsx`, `AdimDetayModal.test.tsx`
- `MuhafizAyarlariSayfasi.test.tsx` — mevcut testler geçmeye devam eder
- `CumaHatirlatmaServisi.test.ts` — periyodik plan; `'birkez'` eski davranışı **birebir** üretir
- Nöbetçi: cuma ekranı `maksAdim: 1` ile tek adım gösterir

---

## Faz 5 — Seri gün sınırı + büyük sayaçlı bildirim (paralel kulvar)

### 5a — Gün sınırı düzeltmesi (önce)
- `SeriHesaplayiciServisi.namazGunuHesapla` imsak tabanlı; **konum yoksa 05:00 fallback**.
- `useSeriAyi.ts` aynı kaynak.
- **B13 — çift yönlü kayma:** yazın imsak (~03:30) < 05:00 → sınır geriye; **kışın imsak (~06:40) > 05:00 → sınır İLERİ** kayar (05:00–06:40 arası işlemler artık düne sayılır). İki mevsim de test edilir.
- **B13 — hidrasyon sırası:** `useSeriAyi` render'da senkron çağırır, `KonumYoneticiServisi` konfigi açılışta geç dolar → 02:00–imsak aralığında ilk render 05:00 dalına düşüp konum gelince "bugün" etiketi **görünür biçimde zıplayabilir** (AnaSayfa snap-back tuzağının ikizi). Kural: **konum hazır değilse 05:00 fallback'inde SABİT kal**, konum gelince tazele.
- **Duyuru YOK.**

**Testler (B2 — v1'de tersti):**
- imsak 03:30 iken **04:00 → BUGÜNE** sayılır; 03:00 → düne
- imsak 06:40 iken **05:30 → DÜNE** sayılır (kış)
- konum yoksa 05:00 davranışı korunur
- konum gelmeden önceki render deterministik (zıplama yok)

### 5b — Sayaç bildirimi
- **Hedef (B4):** `sonrakiGunImsakVaktiGetir` **koşulsuz yarının** fajr'ını döndürür → saat 02:00'de seri gününün gerçek sonu **bugünün** imsağıdır (~1,5 saat), yarınınki değil (~27 saat). Hedef = **"şu andan sonraki İLK fajr"**. Gece-yarısı nöbetçi testi zorunlu.
- **Durdurma (B14):** chronometer hedefte kendiliğinden durmaz, sıfırı geçince saymaya devam eder → hedef anında `stopCountdown` tetiği.
- **Seri zaten tamamsa sayaç HİÇ çıkmaz** (bugünkü düz bildirimde bu kapı yok).
- Başlangıç eşiği kullanıcı ayarı; varsayılan **2 saat** (gerekçe: pil değil, kalıcı bildirim dikkat maliyeti — B14).
- Native: `CountdownNotificationHelper.kt` `themeType: 'seri'` dalı + `custom_seri_notification.xml` / `_collapsed.xml`.
- **`modules/expo-countdown-notification/src/index.ts` doc-yorumu düzeltilir** ("Foreground Service + CountDownTimer" iddiası bayat — B14).
- **Konum tüketicisi İKİ yere eklenir (B7):** `KonumDegisikligiServisi.konumDegistiUygula` **ve** `App.tsx` açılış zinciri. Aksi halde açılışta sayaç eski hedefte kalır.

### Doğrulama
Native değişiklik → `npm run verify` YETMEZ. Dala push + `gh workflow run android-build.yml --ref <dal> -f build_type=debug` yeşil olmalı.

---

## Faz 6 — Titreşimi bağla

- **Taban kanal istisnası (B9):** `muhafizKanalIdOlustur` varsayılan sesi hash'lemez, sabit `muhafiz`/`muhafiz_acil` taban kanallarına eşler; bu kanallar mevcut cihazlarda **zaten kurulu** ve titreşim de kanal-oluşturma-sonrası değiştirilemez. **Karar:** varsayılan titreşim → taban kanal (sıfır geçiş maliyeti korunur); **varsayılan-olmayan titreşim seçilen hücre taban eşlemesinden çıkıp hash'li kanala geçer**.
- `sesKimligi.muhafizKanalIdOlustur` hash girdisine titreşim deseni eklenir.
- `MuhafizKanallari.kt` — `setVibrationPattern`.
- `ArkaplanMuhafizServisi` bildirim `vibrationPattern`; `NamazMuhafiziServisi` ön planda `Vibration.vibrate`.
- Ekran: kanal çipine titreşim.
- **Testler (üç durum):** varsayılan ses + varsayılan titreşim → **taban kanal** · varsayılan ses + özel titreşim → **hash'li kanal** · aynı ses + farklı titreşim → **farklı id**.
- Native değişiklik → debug APK build doğrulaması.

---

## Subagent görev dağılımı

```
Faz 0 ────┐
          ├─→ Faz 1 ─→ Faz 2 ─→ Faz 3+4
          │                  └─→ Faz 6
Faz 5a ─→ 5b (paralel kulvar)
```

| Agent | Faz | Dokunduğu alan | Ön koşul |
|---|---|---|---|
| A1 | 0 | `esikSinirlari`, `pencereUzunlugu`, `planButcesi`, `motorAdaptoru` (yalnız plan bütçesi), muhafız ekranı | — |
| A2 | 5a | `SeriHesaplayiciServisi`, `useSeriAyi`, `SeriTipleri` | — |
| A3 | 1 | `pencereTipleri`, `aktifSeviye`, `esikSinirlari`, `motorAdaptoru`, `anonsMetni`, `seviyeOzeti`, `vakitOzeti`, `matrisIslemleri`, `seviyeAcKapa`, `NamazVaktiHesaplayiciServisi`, iki muhafız servisi, `vakitSayacYardimcisi` | A1 |
| A4 | 5b | native countdown (`.kt` + layout XML + `index.ts`), `SeriSayacBildirimServisi`, **`KonumDegisikligiServisi`**, `App.tsx` | A2 |
| A5 | 2 | `matrisTipleri`, `kanalKumesi`, `muhafizGoc`, `kanalPlani`, `muhafizSlice`, preset'ler, ekran sabitleri, beş tüketici — **`KonumDegisikligiServisi`'ne DOKUNMAZ** (A4'e rezerve; gerekirse helper içinde kalır) | A3 |
| A6 | 3+4 | `components/hatirlatma/`, `MuhafizAyarlariSayfasi`, `BildirimAyarlariSayfasi`, cuma servisi + yardımcısı | A5 |
| A7 | 6 | `sesKimligi`, `MuhafizKanallari.kt`, bildirim yolları, kanal çipi | A5 |

**Çakışma notu (B6):** A3 ve A5 ikisi de `vakitSayacYardimcisi`'na dokunur ama **sıralıdır** (A5, A3'ten sonra) — sorun yok. A4 ve A5 paralel olabilir; `KonumDegisikligiServisi` A4'e rezerve edildiği için çakışma yok.

Her agent: **kırmızı test önce** (davranışı üreten nöbetçi) → düzeltme → `npm run verify` → tek commit.

## Kabul kriterleri

1. `npm run verify` yeşil; lint uyarısı ≤ 372.
2. Mevcut 2135 testin tamamı geçer (davranış değişen yerlerde test **güncellenir**, silinmez).
3. Yön/kanal alanı olmayan eski kayıt **birebir eski davranışı** üretir (nöbetçi testler).
4. Native dokunuşu olan fazlarda (5b, 6) debug APK build'i yeşil.
5. AGENTS.md her fazda güncellenir.
6. `YeniOzellikler.ts`: dinamik eşik, giriş yönü, cuma periyodik, seri sayacı, titreşim duyurulur. **Seri gün sınırı duyurulmaz.**
