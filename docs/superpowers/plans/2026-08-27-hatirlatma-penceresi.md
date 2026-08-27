# Uygulama Planı: Hatırlatma Penceresi — ortak hatırlatma motoru

> Tarih: 2026-08-27 · Tasarım: [spec](../specs/2026-08-27-hatirlatma-penceresi-ortak-motor-design.md) · Dal: `claude/toparlanma-calculation-bug-47ojw1` (PR #233)

## Kapatılan açık sorular (kullanıcı kararı)

| Soru | Karar |
|---|---|
| Faz sırası | **Hepsi yapılacak.** Faz 0 ve 5 paralel, gerisi sıralı. |
| Seri gün sınırının imsağa kayması kabul mü? | **Kabul — duyuru YOK.** Mevcut davranış zaten bozuk (motor 05:00, bildirim imsak); bu bir düzeltme, davranış değişikliği duyurusu değil. |
| `themeType: 'seri'` native layout mı? | **Yeni layout.** İftar/sahurun kendi kimliği varken serinin de olmalı. Native değişiklik → debug APK build doğrulaması zorunlu. |
| Faz 3 (ortak bileşen) ile 4 (cuma) sırası | **Birlikte.** Tek tüketiciyle genelleştirme yanlış eksende soyutlama riski (spec §10). |

## Dal stratejisi

Harness kuralı gereği tüm iş **mevcut dala** (`claude/toparlanma-calculation-bug-47ojw1`, PR #233) gider. PR zaten 4 commit / 36 dosya; bu iş onu belirgin biçimde büyütecek. Her faz **ayrı commit**, PR açıklaması faz bittikçe güncellenir.

## Değişmez kurallar (her fazda geçerli)

Bunlar AGENTS.md'de yaşanmış bug olarak kayıtlı; hiçbir faz bunları gevşetemez:

1. **Beş tüketici**, üçü değil: `ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`, `ArkaplanGorevServisi`, `KonumTakipServisi`. Son ikisi store'u değil **ham AsyncStorage**'ı okur; `muhafizMatrisiniCoz` tek kapı kalmalı.
2. **Göç idempotent + aynı referans**: değişiklik yoksa girdi nesnesi aynen döner (`eskiAlarmSesiniGoc` deseni).
3. **Yükleme yolu diske yazıyorsa `{...parsed, ...sonuc}`**: tiplenmemiş alanlar (ör. eski `koordinatlar`) silinmemeli.
4. **Ön plan / arka plan id paritesi**: `muhafizBildirimIdOlustur` tek üretici; format saparsa çift sesli anons geri gelir.
5. **Kanal id'si sesin fonksiyonu**; kanal kurulduktan sonra sesi değiştirilemez, silip yeniden kurmak tombstone'a takılır.
6. **`npm run verify` her fazın sonunda yeşil** (typecheck + lint 0 error + test). Lint uyarı sayısı taban **372**'yi geçmemeli.
7. **Yeni uyarı ekleme**: dokunulan dosyada `any`, kullanılmayan değişken, `console.log` bırakma.

---

## Faz 0 — Dinamik eşik tavanı

**Amaç:** `ESIK_MUTLAK_MAX = 120` sabitini kaldır; tavan vaktin bugünkü penceresinden gelsin.

### Dosyalar
- `src/core/muhafiz/esikSinirlari.ts`
  - `esikSinirlariniHesapla(seviyeler, indeks, secenekler?: { pencereUzunluguDk?: number })`
  - `ESIK_GUVENLIK_TAVANI = 720` (yeni). Gerekçe kod yorumunda: pil değil **planlama bütçesi** — 600 dk / 5 dk = 120 zamanlanmış bildirim + exact alarm.
  - `pencereUzunluguDk` verilmezse mevcut davranış (geriye uyumlu): tavan `ESIK_GUVENLIK_TAVANI`.
  - Tavan = `min(pencereUzunluguDk - 1, ESIK_GUVENLIK_TAVANI)`, sonra komşu kısıtı.
- **Yeni saf yardımcı:** `src/core/muhafiz/pencereUzunlugu.ts`
  - `vakitPencereUzunluguDk(giris: Date, cikis: Date): number`
  - `adimPencereyeSigarMi(esikDk: number, pencereUzunluguDk: number): boolean`
- `src/presentation/screens/MuhafizAyarlariSayfasi.tsx` — o günün vakit aralıklarını `NamazVaktiHesaplayiciServisi`'nden alıp `VakitKarti`'ya geçir.
- `src/presentation/screens/MuhafizAyarlari/VakitKarti.tsx` + `SeviyeDetayModal.tsx` — stepper sınırı yeni imzadan; sığmayan adımda uyarı satırı.

### UI kuralı
Sığmayan adım için satır: **"Bu adım bugün çalışmayacak — yatsı bugün 6 sa 40 dk"**. Ton: kibar "siz" dili, suçlayıcı değil, yön gösterir. Renk `durum.uyari` **değil** (AGENTS kontrast tuzağı) — gövde metni tema token'ı, ikon dekoratif.

### Testler
- `esikSinirlari.test.ts`: pencere 400 dk → tavan 399; pencere 900 dk → tavan 720 (güvenlik); pencere verilmezse eski davranış; komşu kısıtı tavanın önüne geçer.
- `pencereUzunlugu.test.ts`: gece yarısını aşan pencere (yatsı → imsak) doğru hesaplanır.
- `MuhafizAyarlariSayfasi.test.tsx`: sığmayan adım için uyarı render edilir, sığanda edilmez.

### Kabul
Yatsının 1. seviyesi bugünkü pencere uzunluğuna kadar kurulabiliyor; öğle gibi kısa vakitte tavan otomatik daralıyor.

---

## Faz 1 — `olcuDk` + pencere yönü

**Amaç:** motor iki yönlü olsun: çıkışa doğru (mevcut) ve girişten itibaren (yeni).

### Dosyalar
- **Yeni:** `src/core/muhafiz/pencereTipleri.ts`
  ```ts
  export type PencereYonu = 'cikisaDogru' | 'girisindenItibaren';
  export interface HatirlatmaPenceresi { kaynak: string; baslangic: Date; bitis: Date; yon: PencereYonu; }
  export function olcuDkHesapla(pencere: HatirlatmaPenceresi, simdi: Date): number;
  ```
- `src/core/muhafiz/matrisTipleri.ts` — `VakitMuhafizAyari`'ya `yon?: PencereYonu` (yoksa `'cikisaDogru'`).
- `src/core/muhafiz/motorAdaptoru.ts`
  - `seviyeTetiklenirMi(seviye, olcuDk)` — parametre adı `kalanDk` → `olcuDk`. **Gövde değişmez**, alt sınır `olcuDk < 1` korunur.
  - `vakitUyariPlaniOlustur(vakitAyari, olcuDkSiniri)` — tarama aralığı yönden bağımsız.
  - `UyariPlani.kalanDk` → `olcuDk` (+ `yon` alanı taşınır; bildirim metni buna göre kurulur).
- `src/core/muhafiz/anonsMetni.ts` — `{süre}` çözümü yöne göre: `cikisaDogru` → "… dk kaldı", `girisindenItibaren` → "… dk geçti". Şablon havuzu tek yerde kalır.
- `src/domain/services/ArkaplanMuhafizServisi.ts` — plan üretirken pencereyi kur (giriş + çıkış), `olcuDk`ya göre zamanla.
- `src/domain/services/NamazMuhafiziServisi.ts` — `kontrolEt` aynı pencereden `olcuDk` hesaplar.
- `src/core/muhafiz/anonsKimligi.ts` — id formatına yön girmez (parite korunur), ama `olcuDk` değeri id'de kullanıldığı için **iki taraf da aynı ekseni** kullanmalı.

### Kritik tuzak
`girisindenItibaren` yönünde uyarı pencere boyunca sürekli tetiklenir → **kılınmışlık kontrolü** bugünkünden kritik. `NamazMuhafiziServisi.acilistaKilinanlariYukle` hidrasyonu `baslat`'tan ÖNCE await edilmeli (#92); aksi halde kullanıcı kıldığı namaz için pencere boyunca uyarı alır.

### Testler
- `pencereTipleri.test.ts`: iki yönde `olcuDk`; gece yarısı aşan pencere; `simdi` pencere dışındayken negatif/0 davranışı.
- `motorAdaptoru.test.ts`: `girisindenItibaren` yönünde plan; `cikisaDogru` planı **birebir eskisiyle aynı** (regresyon).
- `NamazMuhafiziServisi.test.ts`: giriş yönünde kılınmış vakit için uyarı ÇIKMAZ.
- `anonsMetni.test.ts`: yöne göre "kaldı"/"geçti".

### Kabul
Yön alanı olmayan mevcut kayıtlar birebir eski davranışı üretir (nöbetçi test). Yeni yön kurulunca vakit girişinden itibaren uyarı planlanır.

---

## Faz 2 — `UyariModu` → `UyariKanallari` göçü

**Amaç:** mod enum'unu kanal kümesine çevir; titreşim alanı açılır (bağlanmaz).

### Dosyalar
- `src/core/muhafiz/matrisTipleri.ts`
  ```ts
  export interface UyariKanallari { bildirim: boolean; sesliAnons: boolean; titresim: boolean; }
  ```
  `SeviyeAyari.mod` → `kanallar: UyariKanallari`; `oncekiMod` → `oncekiKanallar`.
- **Yeni:** `src/core/muhafiz/kanalKumesi.ts` — `hicKanalAcikMi`, `kanalAc/Kapat`, `modKanallaraCevir` (göç eşlemesi).
- `src/core/muhafiz/muhafizGoc.ts` — `modlariKanallaraGoc(matris)`: `sessiz → {}`, `bildirim → {bildirim}`, `sesli → {sesliAnons}`, `ikisi → {bildirim, sesliAnons}`. Değişiklik yoksa **aynı referans**.
- `src/core/muhafiz/motorAdaptoru.ts` — `sesliAnonsGerekliMi`/`bildirimSesiGerekliMi` kanal okur; `seviyeTetiklenirMi`'deki `mod === 'sessiz'` → `hicKanalAcikMi`.
- `src/core/muhafiz/aktifSeviye.ts` — aynı kapı.
- `src/core/muhafiz/seviyeAcKapa.ts` — `oncekiKanallar` hafızası; bozuk kayıt (`oncekiKanallar` boş) → `{bildirim:true}`.
- `src/core/muhafiz/matrisIslemleri.ts` + `HATIRLATMA_PRESETLERI` — preset'ler kanal yazar; `sesliIzinVar` zorunlu pozisyonel parametre **korunur**.
- `src/core/muhafiz/seviyeOzeti.ts` / `vakitOzeti.ts` — "Kapalı — uyarı almazsınız" tam dizesi **değişmez** (nöbetçi test em-dash dahil eşitlik arıyor).
- Ekran: `MuhafizAyarlari/sabitler.ts` `MOD_BILGILERI` → kanal çipleri.
- Beş tüketici + `AnonsOnizlemeServisi` + `AkisOnizlemeModal`.

### Göç mekaniği
`muhafizMatrisiniCoz` (ham AsyncStorage okuyan tüketiciler için) **ve** `muhafizAyarlariniYukle` (diske yazar → görünür olur) — `eskiAlarmSesiniGoc` ile aynı iki-nokta deseni.

### Testler
- `kanalKumesi.test.ts`, `muhafizGoc.test.ts`: dört modun eşlemesi; değişiklik yoksa aynı referans.
- `seviyeOzeti.test.ts`: mevcut tam-dize testleri **değişmeden** geçer.
- `muhafizSlice.test.ts`: preset hücre sayıları korunur (hafif 4/vakit 0 sesli · normal 6/vakit 1 sesli · yoğun 7/vakit 2 sesli).
- Nöbetçi: `sesliOnayi` rıza kaydı göçle **uydurulmaz** (kanal açılmaz).

### Kabul
Diskteki eski matris tek seferde göç eder, davranış birebir aynı kalır; `titresim` alanı her hücrede `false`.

---

## Faz 3+4 — Ortak bileşen + cuma periyodik hatırlatma

**Amaç:** muhafız/cuma/seri aynı arayüz bileşenini kullansın; cuma tek adım + periyot alsın.

### Dosyalar
- **Yeni:** `src/presentation/components/hatirlatma/`
  - `PencereKarti.tsx` ← `MuhafizAyarlari/VakitKarti.tsx` genelleştirilmiş
  - `AdimDetayModal.tsx` ← `SeviyeDetayModal.tsx`
  - `SesSecimSatiri.tsx`, `AkisOnizlemeModal.tsx` (taşınır)
  - `pencereTanimi.ts` — `PencereTanimi` tipi + adım renkleri/başlıkları (bugünkü `SEVIYE_BILGILERI`)
- `MuhafizAyarlariSayfasi.tsx` — 5 × `PencereKarti`
- `BildirimAyarlariSayfasi.tsx` — cuma bölümü 1 × `PencereKarti` (`maksAdim: 1`, `yonSecilebilir: false`)
- `src/data/local/LocalCumaHatirlatmaServisi.ts` — `CumaHatirlatmaAyarlari`'ya `siklik: Siklik` (varsayılan `'birkez'` → geriye uyumlu)
- `src/domain/services/CumaHatirlatmaServisi.ts` — pencere kur (`öğle − oncedenDk` → `öğle`), plan üreticisinden besle
- `src/core/utils/cumaYardimcisi.ts` — pencere üretimi

### Cuma'da korunacaklar
Dört hafta ileri planlama · her cuma ayrı `PrayerTimes` · `NamazAdi.Ogle` kimliği · cumaya özgü nass · `vakit_bildirim` kanalı · koordinat parametre (getKonfig'ten okunmaz) · `(0,0)` reddi.

### Korunacak UI kuralları
İç içe modal yok (akordiyon bilinçli) · Switch satırı saran Touchable'ın **kardeşi** · serbest metin `onEndEditing`/blur'da yazılır · eşik stepper'ı komşulara kilitli · ekran debounce'lu (1200 ms) **gerçek planı da tazeler**, unmount'ta hemen uygular · adım renkleri kasten hardcoded, gövde metni tema token'ı · `SayisalSecici`'ye `aciklama` prop'u zorunlu · `DinleButonu` duyulacak şey yoksa çizilmez.

### Testler
- `PencereKarti.test.tsx`, `AdimDetayModal.test.tsx` — taşınan davranışlar korunur.
- `MuhafizAyarlariSayfasi.test.tsx` — mevcut testler geçmeye devam eder.
- `CumaHatirlatmaServisi.test.ts` — periyodik plan; `'birkez'` ayarı eski davranışı birebir üretir.
- Nöbetçi: cuma ekranı `maksAdim: 1` ile tek adım gösterir.

### Kabul
Cuma'da "60 dk kala başla, 15 dk'da bir" kurulabiliyor; muhafız ekranı görsel olarak aynı kalıyor.

---

## Faz 5 — Seri gün sınırı + büyük sayaçlı bildirim (paralel gidebilir)

**Amaç:** serinin bittiği anı tek kaynağa bağla, sonra canlı sayaç kur.

### 5a — Gün sınırı düzeltmesi (önce)
- `src/domain/services/SeriHesaplayiciServisi.ts` — `namazGunuHesapla` imsak tabanlı çalışsın; konum yoksa 05:00'e düş.
- `src/core/types/SeriTipleri.ts` — `gunBitisSaati` gerçekten emekliye (yedek değer olarak kalır).
- `src/presentation/hooks/useSeriAyi.ts` — aynı kaynak.
- **Duyuru YOK** (kullanıcı kararı: mevcut davranış zaten bozuk).
- Test: imsak 03:30 iken 04:00'te kılınan namaz **dünün** gününe sayılır; konum yoksa 05:00 davranışı korunur.

### 5b — Sayaç bildirimi
- Native: `modules/expo-countdown-notification/android/.../CountdownNotificationHelper.kt` — `themeType: 'seri'` dalı + yeni layout XML (`custom_seri_notification.xml` / `_collapsed.xml`).
- `src/domain/services/` altına `SeriSayacBildirimServisi` — `startCountdown({ id: 'seri_gun_sonu', targetTimeMs: <ertesi imsak>, themeType: 'seri' })`.
- Başlangıç eşiği kullanıcı ayarı; **varsayılan dar (2 saat)** — foreground service saatlerce kalıcı bildirim demek.
- **Seri zaten tamamsa sayaç HİÇ çıkmaz** (bugünkü düz bildirimde bu kapı yok; eklenir).
- Konum/vakit değişiminde `KonumDegisikligiServisi.konumDegistiUygula` tüketici listesine eklenir (yedi → sekiz).

### Doğrulama
Native değişiklik → `npm run verify` YETMEZ. Dala push + `gh workflow run android-build.yml --ref <dal> -f build_type=debug` ile debug APK build'i yeşil olmalı.

---

## Faz 6 — Titreşimi bağla

- `sesKimligi.muhafizKanalIdOlustur` — hash girdisine **titreşim deseni** eklenir (kanal id'si ses+titreşim fonksiyonu olur).
- `MuhafizKanallari.kt` — `setVibrationPattern`.
- `ArkaplanMuhafizServisi` — bildirim `vibrationPattern`; `NamazMuhafiziServisi` ön planda `Vibration.vibrate`.
- Ekran: kanal çipine titreşim eklenir.
- Test: aynı ses + farklı titreşim → **farklı kanal id**.
- Native değişiklik → debug APK build doğrulaması.

---

## Subagent görev dağılımı

Paralel çalışan agent'lar **aynı dosyaya dokunmamalı**. Bağımlılık grafiği:

```
Faz 0 ────┐
          ├─→ Faz 1 ─→ Faz 2 ─→ Faz 3+4 ─→ Faz 6
Faz 5a ─→ 5b (paralel kulvar, çakışma yok)
```

| Agent | Faz | Dokunduğu alan | Ön koşul |
|---|---|---|---|
| A1 | 0 | `esikSinirlari`, `pencereUzunlugu`, muhafız ekranı | — |
| A2 | 5a | seri motoru, `useSeriAyi` | — |
| A3 | 1 | `pencereTipleri`, `motorAdaptoru`, `anonsMetni`, iki muhafız servisi | A1 |
| A4 | 5b | native countdown + `SeriSayacBildirimServisi` | A2 |
| A5 | 2 | `matrisTipleri`, `kanalKumesi`, `muhafizGoc`, preset, beş tüketici | A3 |
| A6 | 3+4 | `components/hatirlatma/`, muhafız + bildirim ekranları, cuma servisi | A5 |
| A7 | 6 | `sesKimligi`, `MuhafizKanallari.kt`, bildirim yolları | A5 |

Her agent: **kırmızı test önce** (davranışı üreten nöbetçi), sonra düzeltme, sonra `npm run verify`. Faz bitince tek commit.

## Kabul kriterleri (tümü)

1. `npm run verify` yeşil; lint uyarısı ≤ 372.
2. Mevcut 2135 testin tamamı geçer (davranış değişen yerlerde test **güncellenir**, silinmez).
3. Yön/kanal alanı olmayan eski kayıt birebir eski davranışı üretir (nöbetçi testler).
4. Native dokunuşu olan fazlarda (5b, 6) debug APK build'i yeşil.
5. AGENTS.md her fazda güncellenir (yeni tuzaklar, değişen kurallar).
6. `YeniOzellikler.ts`: kullanıcıya görünen yenilikler duyurulur (dinamik eşik, giriş yönü, cuma periyodik, seri sayacı, titreşim). Seri gün sınırı **duyurulmaz** (bug düzeltmesi).
