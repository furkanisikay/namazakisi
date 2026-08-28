# Uygulama Planı: Hatırlatma Penceresi — ortak hatırlatma motoru

> Tarih: 2026-08-27 · Sürüm: **v5** (dördüncü tur; bütçe span'ı gerçek segmente bağlandı, sabit seviye-başına olarak yeniden tanımlandı) · **Durum: Faz 0 ve Faz 5a uygulanabilir onay aldı** · Tasarım: [spec](../specs/2026-08-27-hatirlatma-penceresi-ortak-motor-design.md) · Dal: `claude/toparlanma-calculation-bug-47ojw1` (PR #233)

## Kapatılan açık sorular (kullanıcı kararı)

| Soru | Karar |
|---|---|
| Faz sırası | **Hepsi yapılacak.** Faz 0 ve 5 paralel, gerisi sıralı. |
| Seri gün sınırının imsağa kayması kabul mü? | **Kabul — duyuru YOK.** Mevcut davranış zaten bozuk (motor 05:00, bildirim imsak). |
| `themeType: 'seri'` native layout mı? | **Yeni layout.** Native değişiklik → debug APK build doğrulaması zorunlu. |
| Faz 3 (ortak bileşen) ile 4 (cuma) sırası | **Birlikte.** |

## v2 → v3 farkı (ikinci tur)

İkinci tur incelemede **11 bulgu kapandı, 3'ü açık kaldı (B1, B5, B11) ve 4 yeni bulgu** çıktı. En ciddi ikisi:

- **B1 yarım kapatılmıştı (YENİ-1):** yön yalnız `aktifSeviyeyiBul`/`esikSinirlari`'na verilmişti; `seviyeTetiklenirMi`'nin pencere kapısı (`motorAdaptoru.ts:81`) ve `vakitUyariPlaniOlustur`'un tarama sınırı (satır 124) yönsüz kalmıştı → giriş yönünde kazanan seçilse bile `olcuDk > esikDk` kapısı onu eler, her adım yalnız tam eşik dakikasında bir kez konuşur (`herDk` tekrarı ölü doğar) ve tarama `enBuyukEsik`'te durduğu için "çıkana kadar devam et" hiç gerçekleşmez.
- **Plan bütçesi yanlış katmandaydı (YENİ-2):** `vakitUyariPlaniOlustur`'a konması, bu projenin kendi yazılı dersinin ihlali ("kuralı döngü sınırına değil `seviyeTetiklenirMi`ye koy — iki motor da oradan beslenir", AGENTS.md, yaşanmış çift-anons bug'ı). Arka plan seyreltilir, ön plan `kontrolEt` ham sıklıkla çalışır → banner her dakika sürer, önizleme de gerçeği göstermez.
- **Seri sayacı gece penceresinde hiç başlamıyordu (YENİ-3):** `startCountdown` yalnız JS'ten çağrılır ve `ArkaplanGorevServisi` (doğrulandı) **hiçbir sayaç servisini tazelemez** — yalnız muhafız + cuma. Seri eşiği imsak−2s ≈ 01:30–04:30'a düşer; kullanıcı o pencerede uygulamayı açmazsa sayaç hiç görünmez.

### v1 → v2 farkı (birinci tur)

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
- **Yeni:** `src/core/muhafiz/planButcesi.ts` — `etkinSiklikHesapla(span, siklik): Siklik` = `max(herDk, ceil(span / PLAN_ADIM_UST_SINIRI))`, **`PLAN_ADIM_UST_SINIRI = 15` (SEVİYE başına)** → dört adımlı bir vakitte toplam ~60, beş vakitte ~300 (Android exact alarm sınırı ~500'ün altında).
  - **DÖRDÜNCÜ TUR — sabit "vakit başına" diye belgelenmişti ama formül SEVİYE başına sınır koyuyor.** v4'ün kendi nöbetçisi ("vakit başına plan ≤ 60") bu yüzden kendi formülüne karşı kırmızı kalırdı: 700 dk pencerede 1+2+2+60 = ~65. Sabit artık açıkça seviye başınadır ve değeri vakit bütçesinden türetilir (4 × 15 = 60).
  - **`span` = seviyenin GERÇEKTEN kazandığı segment**, eşik değil. Eşikten türetmek giriş yönünde deliniyordu (bütçe hiç devreye girmiyordu); pencere sonuna bağlamak ise orta seviyeleri gereksiz seyreltip "seyreltildi" bilgi satırını neredeyse her adımda yakıyordu (yanlış pozitif).
    - `cikisaDogru` → `span = esikDk − (bir sonraki daha SERT açık komşunun eşiği ?? 0)`
    - `girisindenItibaren` → `span = (bir sonraki daha SERT açık komşunun eşiği ?? pencereUzunluguDk) − esikDk`
    - "Açık komşu" filtresi `aktifSeviyeyiBul`'un sessiz-atlama kuralıyla **aynı** olmalı (kapalı adım pencere sağlamaz → segmenti üstteki devralır).
  - `'birkez'` sıklığa **hiç dokunulmaz** — formül yalnız `{herDk}` koluna uygulanır.

  **Doğrulama (mevcut varsayılan matris, çıkış yönü):** nazik 45/15 → segment 15 → etkin 15 → 1 tetik · uyarı 30/10 → segment 15 → etkin 10 → 2 · sert 15/5 → segment 10 → etkin 5 → 2 · acil 5/1 → segment 5 → etkin 1 → 5. Toplam 10 — **bugünkü davranışın birebir aynısı**, seyreltme yok.
  **Giriş yönü (700 dk yatsı, nazik 5 / uyarı 15 / sert 30 / acil 45, herDk 1):** 10 + 15 + 15 + ~15 = ~55 ≤ 60; orta seviyelerde seyreltme yok → bilgi satırı yanlış pozitif vermez.
  - **YENİ-2 — bütçe `seviyeTetiklenirMi` İÇİNDE uygulanır**, plan üreticisinde değil. Üreticiye koymak AGENTS.md'nin yazılı dersini ihlal ederdi: arka plan seyreltilir ama ön plan `kontrolEt` ham sıklıkla çağırdığı için banner her dakika sürer ve `AkisOnizlemeModal` (üreticiden beslenir) gerçek davranışı göstermez. Tek kapıdan geçince üretici, ön plan ve önizleme kendiliğinden aynı kalır.
  - Fonksiyon **saf ve deterministik** (bool değil `Siklik` döner — "seyrelt" davranışı bool imzaya sığmaz).
  - **`Logger` çekirdeğe girmez** (`motorAdaptoru` saf: store/native bağımsız). Seyreltme logu `ArkaplanMuhafizServisi`'nde atılır.
- `src/core/muhafiz/motorAdaptoru.ts` — `seviyeTetiklenirMi` etkin sıklığı kullanır. Giriş yönünde `span` hesabı için `pencereUzunluguDk` parametresi gerekir: arka plan pencereyi zaten kuruyor, ön plan `VakitBilgisi.giris` geldiği için `cikis − giris` hesaplayabilir (Faz 1'de bağlanır; Faz 0'da yalnız çıkış yönü vardır, parametre opsiyoneldir).
- Seyreltme uygulanan adımda ekranda bilgi satırı (`SeviyeDetayModal`/`VakitKarti`) — Faz 0'ın kendi ilkesi gereği sessiz sapma bırakılmaz.
- `src/presentation/screens/MuhafizAyarlariSayfasi.tsx` — o günün vakit aralıklarını `NamazVaktiHesaplayiciServisi`'nden alıp aşağı geçirir.
- `src/presentation/screens/MuhafizAyarlari/VakitKarti.tsx` + `SeviyeDetayModal.tsx` — stepper sınırı yeni imzadan; sığmayan adımda uyarı satırı.

### UI kuralı
Sığmayan adım satırı: **"Bu adım bugün çalışmayacak — yatsı bugün 6 sa 40 dk"**. Kibar "siz" dili; gövde metni tema token'ı, ikon dekoratif (`durum.uyari`'ya **zorlama** — AGENTS kontrast tuzağı).

### Testler
- `esikSinirlari.test.ts`: pencere 400 → tavan 399 · pencere 900 → 720 (güvenlik) · **pencere verilmezse 120 (eski davranış)** · komşu kısıtı tavanın önüne geçer.
- `pencereUzunlugu.test.ts`: gece yarısını aşan pencere (yatsı → imsak).
- `planButcesi.test.ts`: tek açık seviye 720 dk eşik + 1 dk sıklık → etkin sıklık `ceil(720/15)=48` · **mevcut varsayılan matris hiç seyreltilmez** (yukarıdaki doğrulama tablosu birebir) · `'birkez'` dokunulmaz · kapalı komşu segmenti üstteki devralır.
- **Nöbetçi (Faz 1'de eklenir):** **giriş yönü** fikstürü — 700 dk pencere, dört adım, `herDk` 1 → **her seviye ≤ `PLAN_ADIM_UST_SINIRI`** ve vakit toplamı ≤ 60. Çıkış-yönü fikstürüyle yazılırsa deliği yakalamaz.
- **Nöbetçi (YENİ-2):** aynı ayar için `vakitUyariPlaniOlustur` (arka plan) ile `seviyeTetiklenirMi` (ön plan) **aynı dakikalarda** tetiklenir — iki motor ayrışmaz.
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

Eşit eşikte tie-break: her iki yönde de **daha sert kademe** kazanır (mevcut davranış korunur). Gerekçe: eşit eşikte iki seviye aynı dakika kümesini kapsar, hangisi kazanırsa öbürü kalıcı gölgede kalır; sertin kazanması eskalasyonun geri gitmemesini ve çıkış yönüyle simetriyi korur.

`esikSinirlariniHesapla` da yön almalı: giriş yönünde komşu kısıtı ters çevrilir (bir üst komşudan **büyük**, bir alt komşudan **küçük**). `esikSiralamasiGecerliMi` aynı şekilde.

**YENİ-1 — kazanan seçimi TEK BAŞINA yetmez.** Denklemin öbür yarısı da yön almalı, yoksa kazanan seçilir ama tetiklenmez:

| Yer | Bugün (çıkışa doğru) | Giriş yönünde olmalı |
|---|---|---|
| `seviyeTetiklenirMi` pencere kapısı (`motorAdaptoru.ts:81`) | `olcuDk > esikDk → false` | `olcuDk < esikDk → false` |
| Sıklık çapası | `(esikDk − olcuDk) % herDk === 0` | `(olcuDk − esikDk) % herDk === 0` |
| `birkez` | `olcuDk === esikDk` | aynı (değişmez) |
| `vakitUyariPlaniOlustur` tarama sınırı (satır 124) | `min(sınır, enBuyukEsik)` → 1'e kadar azalan | `1 … min(pencereUzunluguDk, ESIK_GUVENLIK_TAVANI)` artan — **`enBuyukEsik` DEĞİL** |

Tarama sınırı kritik: `enBuyukEsik`'te durulursa acil adım eşiğinden sonra pencere sonuna kadar sürmez → isteğin "çıkana kadar devam et" maddesi karşılanmaz ve ön plan (`kontrolEt` sürer) ile arka plan **ayrışır**.

Alt sınır `olcuDk >= 1` her iki yönde de korunur (AGENTS: vakit çıkarken/çıktıktan sonra uyarı yok).

### 1b. Ön plan anonsunda sıra garantisi (B3 — kritik)
Mevcut tekilleştirme kanıtı: `kalanDk = floor(kalanSureMs/60000)` ⟹ `şimdi ≤ alarm anı` → ön plan, **henüz tetiklenmemiş** alarmı `FLAG_UPDATE_CURRENT` ile ezer.

Giriş yönünde bu ters döner: `olcuDk = floor((şimdi−giriş)/60000)` ⟹ `şimdi ≥ giriş + olcuDk·60000` → **alarm zaten tetiklenmiş**. Ön planın `planlaAnons(id, şimdi+1sn)` çağrısı onu geçmişe değil 1 sn sonraya yeniden kurar → arka plan dakika başında, ön plan aynı dakika içinde **ikinci kez** konuşur.

**Karar:** `girisindenItibaren` yönünde ön plan **anons planlamaz** (banner gösterir, sesi arka plan alarmı verir). `NamazMuhafiziServisi.onPlanAnonsuPlanla` yön kapısı alır.

Anons kaybolmaz: arka plan alarmı açılış zincirinden (`App.tsx`), ekran debounce'undan (AGENTS §91h "ekran gerçek planı da tazeler") ve `ArkaplanGorevServisi` 15-dk yolundan kurulur; alarmlar uygulama açıkken de tetiklenir. Muhafız uygulama açıkken açılsa bile ekran `yapilandirVePlanla` çağırır. **Kabul edilen bedel:** banner ile ses 0–60 sn ayrışabilir (çıkış yönünde eş zamanlıydı).

### 1c. `VakitBilgisi.giris` (B8)
`VakitBilgisi` bugün yalnız `saat` (çıkış) + `kalanSureMs` taşıyor; giriş yok → `olcuDk = şimdi − baslangic` hesaplanamaz. `NamazVaktiHesaplayiciServisi` **A3'ün alanına** eklenir; `VakitBilgisi`'ye `giris: Date` gelir.

### 1d. Metin yüzeyleri (B11)
"Kaldı/çıkıyor" dili yalnız `anonsMetniniCoz`'da değil, **kullanıcı verisinde** de yaşıyor: `seviyeyeUygula`/`seviyeyiAc` boş anons kutusunu `ANONS_SABLONLARI[0]` ("…vakti çıkıyor, son {süre} dakika") ile doldurur. Yön girişe çevrilince diskteki metin "son 42 dakika" diye seslendirilir.

Kapsama girenler:
- `anonsMetni.ts` — yön-uygun şablon havuzu; `anonsMetniniCoz` `{süre}` çözümü yöne göre ("kaldı"/"geçti").
- `matrisIslemleri.seviyeyeUygula` + `seviyeAcKapa.seviyeyiAc` — boş kutuyu **yön-uygun** şablonla doldurur; **kullanıcının yazdığı metni ezmez** (modSec sözleşmesinin ikizi).
- **B11 açık kalan kısmı — YÖN DEĞİŞİM anı.** Doldurma anını çözmek yetmez: bugün otomatik doldurulmuş çıkış-dilli metin ("…vakti çıkıyor, son {süre} dakika") hücrede kalıcı durur; kullanıcı yönü girişe çevirince "son 42 dakika" diye seslendirilir. "Kullanıcı metnini ezme" kuralı otomatik-doldurulmuş şablonu kullanıcının yazdığından ayırt edemez. **Kural:** yön değişiminde hücre metni şablon havuzundaki bir şablonla **birebir eşleşiyorsa** karşı-yön şablonuyla değiştirilir; eşleşmiyorsa **dokunulmaz** + ekranda ipucu ("anons metniniz çıkış diliyle yazılmış olabilir"). Nöbetçi test: elle yazılmış metin yön değişiminde **korunur**, şablon metni **çevrilir**.

Dönüşüm **`matrisIslemleri.yonDegisimindeMetniCevir`**'de yaşar (Faz 1 / A3b yazar, Faz 3 / A6 çağırır) — sahipsiz kalmasın.
- `seviyeOzeti.ts` ("45 dk kala"), `vakitOzeti.ts` ("45 dk kala başlar"), `NamazMuhafiziServisi.seviyeMesajiOlustur` ("… dk kaldı") — yöne göre.
- Seviye-3 içerik havuzu (`SEYTANLA_MUCADELE_ICERIGI`, "vakit çıkıyor" nassları) → giriş yönünde bu havuz **kullanılmaz**, nötr havuz seçilir.

### 1e. Vakit sayacı uyumu (B12)
`vakitSayacYardimcisi.sayacBaslangicEsikleriHesapla` `esikDk`'yı "çıkışa kala" varsayar. Giriş yönüne çevrilen vakitte sayaç yanlış anda başlar ve #90 bastırma penceresi kayar. **Karar:** giriş-yönlü vakitler bastırma açısından "tümü kapsanır" sayılır (sayaç o vakit için planlanmaz). Kullanıcı hatırlatmasız kalmaz: bastırma yalnız `muhafizAktif` iken uygulanır (`VakitSayacBildirimServisi.ts:96-97,125`) ve giriş-yönlü vakitte muhafız pencere boyunca zaten uyarır; muhafız kapalıysa liste boş → sayaç çalışır.

**Ek şart:** yön kontrolü `muhafizUyarilanVakitleriBul` **içine** konur — böylece "giriş-yönlü ama tüm adımları kapalı" vakit yanlışlıkla bastırılmaz (helper'ın mevcut aktif-adım filtresiyle otomatik AND'lenir). Nöbetçi test.

### A3c'ye devir notları (A3b'de ölçüldü)
- **`anonsMetniniCoz`'un ÜÇÜNCÜ argümanı artık `olcuDk`** (seviyeyi kazandıran ölçü), `kalanDk` değil. Bugün iki çağıran da yanlış değeri geçiyor: `ArkaplanMuhafizServisi.ts:386` → `uyari.kalanDk` (doğrusu `uyari.olcuDk`), `NamazMuhafiziServisi.ts:256` → ham `kalanDk` (doğrusu `aktifSeviyeyiBul`'a giden ölçü). Çıkış yönünde ikisi eşit olduğu için bugün zararsız; giriş yönü etkinleşince ikisi de "son 42 dakika" üretir. **Parametre opsiyonel varsayılanlı olduğu için `npm run typecheck` bunu YAKALAMAZ** — elle düzelt.
- `seviyeOzetiOlustur(seviye, yon?)` opsiyonel 2. parametre aldı (`SeviyeAyari` yön taşımaz). Çağıranlar (`VakitKarti`, `AkisOnizlemeModal`) vaktin `yon`'unu geçirmeli — **A6'nın işi**, geçilmezse ekran sessizce çıkış dilinde kalır. `vakitOzetiOlustur` parametre almadı (`VakitMuhafizAyari` zaten `yon` taşıyor).
- `NamazMuhafiziServisi.seviyeMesajiOlustur` ve seviye-3 içerik havuzu (`SEYTANLA_MUCADELE_ICERIGI`, "vakit çıkıyor" nassları) **hâlâ yönsüz** — A3c'nin alanı.
- **A6 için:** `SeviyeDetayModal` yardım satırı hâlâ "{vakit} ve {süre} yer tutucularını kullanın" diyor; A3b `{yön}` yer tutucusunu ekledi (yön-nötr metin yazmayı mümkün kılar, yön değişiminde çevrilmesi gerekmez) ama kullanıcıya görünmüyor.

### A5/A6'ya devir notları (A3c'de ölçüldü) — Faz 1 KAPANDI
- **DÜZELTME — 1e (B12) üretim değişikliği aslında NO-OP'tu.** Plan "yön kontrolü `muhafizUyarilanVakitleriBul` içine konur" diyor; ölçüldü ki mevcut filtre (`en az bir açık adım`) giriş-yönlü vakitleri **zaten** listeye koyuyor → davranış değişmiyor ve kırmızı test yazılamıyor. Ölü `if` dalı yazmak yerine kapsama kuralı yorumla sabitlendi + nöbetçi eklendi. **A5 bu dosyaya dokunurken listeyi `esikDk` ile daraltmasın** — giriş yönünü sessizce bozar.
- **PLAN BOŞLUĞU — `src/core/utils/muhafizMetinYardimcisi.ts` hiçbir turun dosya listesinde yoktu, gerçek bir bug taşıyordu.** `basligiOlustur` giriş yönünde `kalanDk` ile çağrılınca yatsıda **"🚨 655 dk · YATSI VAKTİ ÇIKIYOR"** üretiyordu (acil adım girişin 45. dk'sında tetiklenir, çıkışa 655 dk vardır); arka plan gövdesi de mücadele havuzundan "Son dakikalar" diyordu. A3c opsiyonel `yon` parametresi (varsayılan çıkış → sıfır davranış değişimi) + nötr `GIRIS_ICERIK_HAVUZU` ile düzeltti. **A6:** `AkisOnizlemeModal` başlık önizlemesi yaparsa aynı `yon`'u geçmeli.
- **A6 — B3'ün kullanıcıya görünen bedeli hiçbir yerde yazmıyor:** giriş yönlü vakitte banner ile sesli anons **0–60 sn ayrışabilir** (çıkış yönünde eş zamanlıydı). Ekranda "sesli" adım kurulurken ima edilmeli ya da en azından `AkisOnizlemeModal` gerçeği göstermeli.
- **A4 — `VakitBilgisi.giris` artık ZORUNLU alan.** Üretimde savunma var (`giris` yoksa çıkış yönü davranışı), ama `getSuankiVakitBilgisi` mock'layan **yeni testler `giris` vermezse giriş yönü sessizce ölür**.
- Plandaki "mevcut 2135 test" sayısı bayat — depoda **2283** test var.

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
- `aktifSeviye.test.ts` (B1 nöbetçisi): **nazik eşiği 1 olan fikstürde** giriş yönünde 1. dakikada nazik, pencere sonunda acil kazanır. (Fikstür eşiği açıkça 1 olmalı — `olcuDk >= esikDk` kapsama kuralıyla "1. dakikada nazik" ancak öyle tutar.)
- `motorAdaptoru.test.ts` (YENİ-1): giriş yönünde **`herDk` tekrarı gerçekten çalışır** (adım yalnız tam eşik dakikasında değil, sonrasında da tetiklenir) ve **acil adımın sıklığı pencere sonuna kadar sürer**.
- `motorAdaptoru.test.ts` (regresyon): `cikisaDogru` planı **Faz 0 SONRASI (plan bütçeli) çıktıyla birebir aynı** — taban çizgisi Faz 0 öncesi değildir (bkz. YENİ-4).
- `NamazMuhafiziServisi.test.ts`: giriş yönünde `planlaAnons` **çağrılmaz** (B3); kılınmış vakitte uyarı yok.
- `anonsMetni.test.ts` + `seviyeOzeti.test.ts`: yöne göre "kaldı"/"geçti"; **mevcut tam-dize testleri değişmeden geçer**.
- `vakitSayacYardimcisi.test.ts`: giriş-yönlü vakit bastırma listesinde (B12).

---

## Faz 2 — `UyariModu` → `UyariKanallari` göçü

**Amaç:** mod enum'unu kanal kümesine çevir; `titresim` alanı açılır (bağlanmaz).

### Dosyalar (B6 ile genişletildi)
- `matrisTipleri.ts` — `UyariKanallari`; `SeviyeAyari.mod` → `kanallar`; `oncekiMod` → `oncekiKanallar`
- **Yeni:** `src/core/muhafiz/kanalKumesi.ts` — `adimKapaliMi`, `kanalAc/Kapat`, `modKanallaraCevir`
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

### A6/A7'ye devir notları (Faz 2'de uygulandı) — Faz 2 KAPANDI
- **`adimKapaliMi` TEK KAPI oldu.** Eski `mod !== 'sessiz'` ikizi **yedi** yerdeydi (plan altısını sayıyordu; `planButcesi.ts` iki ayrı yerde okuyordu: `cikisSegmentiHesapla` + `girisSegmentiHesapla`). Yeni bir "adım açık mı?" kontrolü yazma, oradan geç.
- **`sesliIzinVar=false` sözleşmesi netleşti:** sesli hücre **susturulmaz** — `sesli` kanalı kapatılıp `bildirim` kanalı **açılır** (`kanalAc(kanalKapat(...,'sesli'),'bildirim')`). Naif "yalnız sesli kanalı kapat" yazımı sadece-sesli bir preset hücresini tümden kapatırdı; eski `mod` şemasında bu dal `'sesli' → 'bildirim'` idi.
- **PLAN BOŞLUĞU — `ozelMatrisYedegi` göç listesinde yoktu.** `matrisGecerliMi` yalnız `esikDk` bakar, yani eski `mod` şemalı bir yedek "geçerli" görünür; "Özel"e dönmek onu doğrudan `matris`e yazar ve motor tüm hücreleri kapalı sayardı → **tek dokunuşla muhafız sessizce susardı**. Yükleme thunk'ı yedeği de `modlariKanallaraGoc`'tan geçirir ve göç gerekiyorsa diske yazar.
- **A7 (titreşim) için:** `UyariKanallari.titresim` alanı **açıldı ama hiçbir yere bağlanmadı**; `adimKapaliMi` onu **sayar** (yalnız titreşimle kurulmuş adım "açık"tır). Bağlarken üç yer gerekir: `KANAL_CIPLERI` (`MuhafizAyarlari/sabitler.ts` — bugün hiçbir çip titreşim yazmaz ve seçim kontrolü `kanallarEsitMi` ile TAM küme karşılaştırır → yeni çip düzeni gerekir), `sesKimligi.muhafizKanalIdOlustur` hash girdisi, bildirim yolları.
- **A6 için:** `MuhafizAyarlari/VakitKarti.tsx` Faz 2'de **hiç değişmedi** (yalnız `seviyeAcikMi`/özet yardımcılarını çağırıyor) — ortak bileşene taşırken kanal kümesi tipini de taşımak yeterli. `SeviyeDetayModal`'daki `MOD_BILGILERI` → **`KANAL_CIPLERI`** oldu (`id: 'kapali'|'bildirim'|'sesli'|'ikisi'` + `kanallar` yükü); erişilebilirlik etiketleri (`Kapalı`/`Bildirim`/`Sesli anons`/`İkisi de`) **değişmedi**, mevcut ekran testleri onlara dayanıyor.
- **Kapsam notu:** A4'e rezerve dosyalara üretim değişikliği YAPILMADI; yalnız `ArkaplanGorevServisi.test.ts` fikstüründe iki satır (`seviyeler[0].mod = 'sessiz'` → `kanallar = {}`) typecheck için güncellendi.

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
- **YENİ-5 (5a'da ölçüldü) — imsak kaynağı ÖLÜ: `KonumYoneticiServisi` üretimde HİÇ doldurulmuyor.** Grep ile doğrulandı: `koordinatlarAyarla`/`manuelKonumAyarla`/`gpsKonumuAl`/`durumYukle` üretim kodunda **hiçbir yerden** çağrılmıyor (yalnız kendi testlerinden). Sonuç: `seriSlice.ts:157`'deki `sonrakiGunImsakVaktiGetir()` bugün **daima null** dönüyor olmalı → gün sonu bildirimi pratikte hep 04:00 fallback'inde. 5a bu yüzden imsağı `NamazVaktiHesaplayiciServisi` (App.tsx'te gerçekten yapılandırılan singleton) üzerinden enjekte edilebilir bir sağlayıcıyla okur (`uygulamaImsakSaglayici`). **5b'de `seriSlice.ts:157` hattı da o kaynağa taşınmalı**; `KonumYoneticiServisi`'ye yeni bağımlılık EKLEME — sessizce ölü doğar.
- **Durdurma (B14):** chronometer hedefte kendiliğinden durmaz, sıfırı geçince saymaya devam eder → hedef anında `stopCountdown` tetiği.
- **Seri zaten tamamsa sayaç HİÇ çıkmaz** (bugünkü düz bildirimde bu kapı yok).
- Başlangıç eşiği kullanıcı ayarı; varsayılan **2 saat** (gerekçe: pil değil, kalıcı bildirim dikkat maliyeti — B14).
- Native: `CountdownNotificationHelper.kt` `themeType: 'seri'` dalı + `custom_seri_notification.xml` / `_collapsed.xml`.
- **`modules/expo-countdown-notification/src/index.ts` doc-yorumu düzeltilir** ("Foreground Service + CountDownTimer" iddiası bayat — B14).
- **Konum tüketicisi İKİ yere eklenir (B7):** `KonumDegisikligiServisi.konumDegistiUygula` **ve** `App.tsx` açılış zinciri. Aksi halde açılışta sayaç eski hedefte kalır.
- **YENİ-3 — başlatma tetiği (özelliğin yaşayıp yaşamayacağını belirler).** `startCountdown` yalnız JS'ten çağrılır; zamanlanmış native başlatma yolu yoktur (notifee `TimestampTrigger` yalnız statik bildirim atar). `ArkaplanGorevServisi` bugün **hiçbir sayaç servisini tazelemez** — yalnız `CumaHatirlatmaServisi` ve `ArkaplanMuhafizServisi` (doğrulandı). İftar bu boşluğu göstermez çünkü penceresi gündüz ve kullanıcı akşam uygulamayı zaten açar; **seri eşiği imsak−2s ≈ 01:30–04:30'a düşer** → kullanıcı o pencerede uygulamayı açmazsa sayaç hiç görünmez ve özellik "uygulama zaten açıkken çalışan bildirim"e iner.

  **Karar: `ArkaplanGorevServisi`'ne SeriSayaç tazelemesi eklenir.** 15 dk granülerlik → eşik anına ±15 dk sapma kabul edilir (sayaç 2 saat sürdüğü için oransal olarak önemsiz). Dosya listesine `ArkaplanGorevServisi.ts` girer; AGENTS.md'ye "arka plan görevi hangi servisleri tazeler" maddesi güncellenir.

  **İKİ SÖZLEŞME ŞARTI (ÜÇÜNCÜ TUR) — atlanırsa YENİ-3 başka biçimde geri gelir:**
  1. **Çağrı sırası:** görev, muhafız ayarı yoksa/kapalıysa **erken döner** (`NoData`). Cuma çağrısı tam bu yüzden erken dönüşlerden ÖNCE duruyor (AGENTS: "muhafızı kapatan kullanıcıda 4 haftalık pencere hiç tazelenmez"). Seri sayacı da muhafızdan bağımsızdır → çağrı **muhafız erken dönüşlerinden ÖNCE**, kendi `try/catch`'inde olmalı.
  2. **Store'suz okuma:** görevde Redux yoktur. "Seri zaten tamamsa sayaç çıkmaz" kapısı ve hedef imsak hesabı arka plan yolunda **ham AsyncStorage**'dan türetilmeli (`namaz_gun_<tarih>`, seri ayarları, `arkaplandaKoordinatOku`). `SeriSayacBildirimServisi` store'a bağımlı tasarlanırsa arka plan yolu **sessizce** çalışmaz — cuma servisinin "koordinat parametredir" dersinin ikizi.

  Nöbetçi testler: görev koştuğunda seri sayacı hedefiyle kurulur/tazelenir · **muhafız kapalıyken de tazelenir** (cuma nöbetçisinin ikizi).

### Doğrulama
Native değişiklik → `npm run verify` YETMEZ. Dala push + `gh workflow run android-build.yml --ref <dal> -f build_type=debug` yeşil olmalı.

---

## Faz 6 — Titreşimi bağla

- **Taban kanal istisnası (B9):** `muhafizKanalIdOlustur` varsayılan sesi hash'lemez, sabit `muhafiz`/`muhafiz_acil` taban kanallarına eşler; bu kanallar mevcut cihazlarda **zaten kurulu** ve titreşim de kanal-oluşturma-sonrası değiştirilemez. **Karar:** varsayılan titreşim → taban kanal (sıfır geçiş maliyeti korunur); **varsayılan-olmayan titreşim seçilen hücre taban eşlemesinden çıkıp hash'li kanala geçer**.
- `sesKimligi.muhafizKanalIdOlustur` hash girdisine titreşim deseni eklenir. **Hash imzası değişince `MuhafizKanalServisi` ve `kanalPlani.ts` de derlenmek zorunda** — ikisi de dosya listesinde (B9 netleştirmesi).
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
| A3a | 1 (çekirdek) | `pencereTipleri`, `aktifSeviye`, `esikSinirlari`, `motorAdaptoru` + nöbetçiler | A1 |
| A3b | 1 (metin/özet) | `anonsMetni`, `seviyeOzeti`, `vakitOzeti`, `matrisIslemleri`, `seviyeAcKapa` | A3a |
| A3c | 1 (servisler) | `NamazVaktiHesaplayiciServisi`, `ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `vakitSayacYardimcisi` | A3b |
| A4 | 5b | native countdown (`.kt` + layout XML + `index.ts`), **`SayacBildirimTemeli`** (`SayacKonfig.themeType` birliği `'seri'`yi kabul etmeli — yoksa typecheck kırılır), `SeriSayacBildirimServisi`, **`KonumDegisikligiServisi`**, `App.tsx`, **`ArkaplanGorevServisi`** | A2 |
| A5 | 2 | `matrisTipleri`, `kanalKumesi`, `muhafizGoc`, `kanalPlani`, `muhafizSlice`, preset'ler, ekran sabitleri, beş tüketici — **`KonumDegisikligiServisi` ve `ArkaplanGorevServisi`'ne DOKUNMAZ** (A4'e rezerve) | A3c |
| A6 | 3+4 | `components/hatirlatma/`, `MuhafizAyarlariSayfasi`, `BildirimAyarlariSayfasi`, cuma servisi + yardımcısı | A5 |
| A7 | 6 | `sesKimligi`, `MuhafizKanalServisi`, `kanalPlani`, `MuhafizKanallari.kt`, bildirim yolları, kanal çipi | A5 |

**Çakışma notu (B6):** A3c ve A5 ikisi de `vakitSayacYardimcisi`'na dokunur ama **sıralıdır** — sorun yok. A4 ve A5 paralel olabilir; `KonumDegisikligiServisi` + `ArkaplanGorevServisi` A4'e rezerve.

**YENİ-4 — A3 bölündü.** v2'de A3 tek turda 13 üretim + ~10 test dosyası taşıyordu ("en riskli faz" tek commit'te); kırmızı-test disiplinini sürdürmek zor, hata yarıçapı büyük. Üç sıralı alt-tura ayrıldı; **her alt-tur kendi `npm run verify` + kendi commit'i.**

**YENİ-4 — regresyon taban çizgisi.** Faz 1'in "çıkış yönü planı birebir aynı" nöbetçisi **Faz 0 SONRASI (plan bütçeli) çıktıyı** taban alır. Faz 0 öncesi çıktıyla birebirlik zaten mümkün değil: plan bütçesi devreye girdiği an büyük eşik + sık tekrar kombinasyonlarında dakika kümesi meşru biçimde seyrelir. A1 bu tabanı kendi commit'inde snapshot testi olarak sabitler.

**A1 → A3a imza zinciri.** A3a, A1'in yeni `esikSinirlariniHesapla(seviyeler, indeks, secenekler)` imzası ve `seviyeTetiklenirMi` içindeki bütçe uygulaması **üzerine** çalışır; sıralı oldukları için dosya çakışması yok.

**A3a uygulama şartı (dördüncü tur):** A3a'nın eklediği her yeni parametre **opsiyonel + varsayılan `'cikisaDogru'`** olmalı. Sebep: `seviyeTetiklenirMi`/`aktifSeviyeyiBul` çağıranları (`NamazMuhafiziServisi:189,195`, `ArkaplanMuhafizServisi`) **A3c'nin alanında** ve A3a kendi `npm run verify`'ını onlara dokunmadan geçirmek zorunda. `aktifSeviyeyiBul` için imza değişikliği gerekmeyebilir — yön zaten aldığı `vakitAyari.yon`'dan okunur; `seviyeTetiklenirMi` yönü ayrı almalı çünkü `SeviyeAyari` yön taşımaz.

Her agent: **kırmızı test önce** (davranışı üreten nöbetçi) → düzeltme → `npm run verify` → tek commit.

## Kabul kriterleri

1. `npm run verify` yeşil; lint uyarısı ≤ 372.
2. Mevcut 2135 testin tamamı geçer (davranış değişen yerlerde test **güncellenir**, silinmez).
3. Yön/kanal alanı olmayan eski kayıt **birebir eski davranışı** üretir (nöbetçi testler). **Tek bilinçli istisna — Faz 0 plan bütçesi:** `esikDk > 60 × herDk` olan kombinasyonlarda sıklık seyreltilir (bugün kurulabilir bir uç ayar: eşik 120 + `herDk` 1 → 120 tetik, bütçeyle 60). Seyreltme ekranda gösterilir; bu kriteri harfiyen test eden bir faz Faz 0'da kırmızıya takılmamalı.
4. Native dokunuşu olan fazlarda (5b, 6) debug APK build'i yeşil.
5. AGENTS.md her fazda güncellenir.
6. `YeniOzellikler.ts`: dinamik eşik, giriş yönü, cuma periyodik, seri sayacı, titreşim duyurulur. **Seri gün sınırı duyurulmaz.**
