# Faz 1 — Seri sekmesi: saf çekirdek + statik render

**Spec:** `docs/superpowers/specs/2026-07-29-seri-sekmesi-takimyildizi-design.md`
**Görsel referans (BAĞLAYICI):** `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`
**Dal:** `fix/muhafiz-kapali-adim-etiketi`
**Kapsam:** Spec §6b "Faz 1". **Hareket YOK** — açılış dizisi, parıltı, nabız
Faz 2'ye aittir. Bu fazın sonunda ekran nihai hâlinde, hareketsiz görünür.

## Global Constraints

- **`npm run verify` (typecheck + lint + test) GEÇMELİDİR.**
- Kibar **"siz"** dili, sentence case, aktif fiil. İbadet-çağrı "sen" istisnası
  bu ekranda **geçerli değildir**.
- **Yeni bağımlılık EKLENMEZ.** `react-native-svg` (15.12.1) ve
  `react-native-reanimated` (~4.1.1) zaten doğrudan bağımlılıktır.
  `android/`, CI, sürüm numarası, `package.json` **değiştirilmez**.
- `src/core/` **saf** olmalı: React / Redux / AsyncStorage / native import YOK.
  Zaman **dışarıdan enjekte edilir** — core `new Date()` çağırmaz.
- **Katman yönü tek yönlüdür:** `core` en alttadır ve `domain`/`presentation`'dan
  import EDEMEZ.
- **ASLA hardcoded renk** — TEK istisna spec §1'deki gök sahnesi ton tablosudur
  ve tümü `screens/Seri/sabitler.ts`'de gerekçesiyle toplanır. Gövde metni ve
  etiketler daima tema token'ı (`useRenkler`).
- `Alert.alert` **KULLANILMAZ**. Dokunma hedefleri **≥44dp**;
  `accessibilityRole` + `accessibilityLabel` zorunlu.
- Dokunulan dosyaya **yeni lint warning eklenmez** (`catch { }` kullan).
- **Mevcut üç sekme (Günlük/Haftalık/Aylık) DEĞİŞMEZ.**

### Test mock reçeteleri — repoda henüz YOK, yazılacak

- **`react-native-svg`**: per-file mock (repo deseni). `Svg`, `G`, `Path`,
  `Circle`, `Ellipse`, `Line`, `Rect`, `Text`, `Defs`, `RadialGradient`,
  `LinearGradient`, `Stop` düz `View`/`Text`'e indirgenir.
  **Mock bileşenlere ÇOCUK RENDER ETTİRME** (AGENTS.md CI-timeout dersi).
- **`react-native-reanimated`**: mevcut reçete `KibleSayfasi.test.tsx:41-45`
  (`require('react-native-reanimated/mock')`).
- Sahte zamanlayıcı **KULLANMA** (tam-sayfa render, CI'da asılır).

### ⚠️ Cihaz doğrulaması bu fazın DIŞINDA bir kapıdır

`react-native-svg` bu projede `src/` içinde **hiç kullanılmamıştır** — her
release'te derlenmiştir ama Fabric altında runtime'da hiç çalışmamıştır.
`npm run verify` bunu **göstermez** (AGENTS.md: "bağımlılığın build'i kırıp
kırmadığını verify göstermez" ilkesinin runtime ikizi).

Bu planın hiçbir görevi cihaz doğrulaması yapamaz (bu ortamda emülatör yok).
Faz 1 bittiğinde **kullanıcı** ekranı cihazda açıp gök panelinin ve tesbihin
gerçekten çizildiğini doğrulamalıdır. Faz 2 (animasyon) **o doğrulamadan önce
başlamaz**.

---

## Task 1 — `gunTamMi` taşıması + özel gün kümesi

**Yeni:** `src/core/seri/gunTamMi.ts` · `src/core/seri/ozelGunKumesi.ts` (+ testler)
**Değişen:** `src/domain/services/SeriHesaplayiciServisi.ts`

### 1a. `gunTamMi` core'a taşınır

Bugün `SeriHesaplayiciServisi.ts:109`'da. Zincir kuralı ile seri kuralı
**aynı olmalı ve kopyalanmamalı**; `core` `domain`'den import edemeyeceği için
fonksiyon aşağı iner.

```ts
// src/core/seri/gunTamMi.ts  — SAF
/** Bir günde kılınan namaz sayısı eşiği karşılıyor mu? Seri motoru ve
 *  takımyıldızı haritası AYNI kuralı kullanır; kopyalanmaz. */
export function gunTamMi(kilinanSayisi: number, tamGunEsigi: number): boolean;
```

`SeriHesaplayiciServisi` bunu import eder ve **mevcut imzasını korur**
(`gunTamMi(gunlukNamazlar, esik)` — içeride sayıyı çıkarıp core'a delege eder).
**Davranış birebir korunur**; mevcut seri testleri nöbetçidir.

### 1b. `ozelGunKumesi`

`OzelGunKaydi` bir **aralıktır** (`baslangicTarihi`–`bitisTarihi`), tek tarih
değil. Genişletme kuralları:

```ts
export interface OzelGunGirdisi {
  ozelGunModuAktif: boolean;
  aktifOzelGun: { baslangicTarihi: string; bitisTarihi: string } | null;
  gecmisKayitlar: { baslangicTarihi: string; bitisTarihi: string }[];
}
export function ozelGunKumesi(g: OzelGunGirdisi): Set<string>;  // ISO tarihler
```

- `gecmisKayitlar`'daki her aralık **koşulsuz** genişletilir (geçmişte
  dondurulmuş dönemlerdir).
- `aktifOzelGun` **yalnız `ozelGunModuAktif === true`** iken katılır — motorun
  kapısı budur (`ozelGunAktifMi`, `SeriHesaplayiciServisi:154`). Kapıyı atlamak,
  modu kapatmış kullanıcıya dondurulmuş gün gösterir.
- Ters aralık (bitiş < başlangıç) → boş, çökme yok.
- Aralık uzunluğu makul bir üst sınırla korunur (ör. 400 gün) — bozuk kayıt
  sonsuz döngü üretmesin.

Tarih aritmetiği için `src/core/utils/TarihYardimcisi` kullanılır (`gunEkle`,
`tarihiISOFormatinaCevir`); yeni tarih yardımcısı **yazılmaz**.

### Test
- `gunTamMi`: eşik altı/eşit/üstü.
- `SeriHesaplayiciServisi`'nin mevcut testleri **hâlâ geçmeli** (taşımanın
  davranışı değiştirmediğinin kanıtı).
- `ozelGunKumesi`: aralık genişletme; `ozelGunModuAktif:false` iken
  `aktifOzelGun` **katılmaz**; `gecmisKayitlar` koşulsuz katılır; ters aralık;
  tek günlük aralık; üst sınır.

---

## Task 2 — `aylikIzgara` + `zincir`

**Yeni:** `src/core/seri/aylikIzgara.ts` · `src/core/seri/zincir.ts` (+ testler)

```ts
export type GunDurumu =
  | { tip: 'kilindi'; vakitler: boolean[] }   // uzunluk 5, NAMAZ_ISIMLERI sırası
  | { tip: 'dondurulmus' }
  | { tip: 'gelecek' };

export interface IzgaraGunu {
  tarih: string;      // ISO
  gunNo: number;      // ayın günü
  digerAy: boolean;   // komşu ay — soluk çizilir ama GERÇEKTİR
  durum: GunDurumu;
}

export function aylikIzgaraOlustur(g: {
  yil: number;
  ay: number;                                // 0-tabanlı
  kayitlar: Record<string, boolean[]>;       // tarih -> 5 vakit
  dondurulmusTarihler: ReadonlySet<string>;
  bugun: string;                             // ENJEKTE — core new Date() çağırmaz
}): IzgaraGunu[];                            // 28, 35 veya 42 hücre
```

**Izgara pazartesi başlar.** Ayın 1'inden önceki pazartesiden, son gününden
sonraki pazara kadar doldurulur. Pazartesi başlayan 28 günlük ay (ör. Şubat
2027) **tam 28 hücre** üretir — "hep 35" varsayma.

`tarih > bugun` ise `{tip:'gelecek'}`. Dondurulmuş kontrolü kılınmışlıktan
**önce** gelir.

```ts
export interface ZincirBagi {
  indeks: number;        // sol günün ızgara indeksi
  ikisiTam: boolean;     // iki uç da 5/5 → KALIN ve parlak çizilir
  satirSarmasi: boolean; // indeks % 7 === 6 → satırlar arası yay
}
export function zincirBaglari(izgara: IzgaraGunu[], tamGunEsigi: number): ZincirBagi[];
```

`zincirKorur(gun)` = `dondurulmus` **veya** (`kilindi` ve
`gunTamMi(kılınanSayısı, esik)`). Task 1'deki core fonksiyonu kullanılır,
kural **kopyalanmaz**.

Bağ, `i` ve `i+1` **ızgarada ardışıksa** kurulur — ay sınırı tanınmaz
(30 Haziran → 1 Temmuz bağı kurulur), satır sınırı da bağı engellemez
(yalnız `satirSarmasi` işaretlenir).

### Test
- Temmuz 2026 (1 Temmuz Çarşamba) → ilk 2 hücre Haziran 29-30, son 2 hücre
  Ağustos 1-2, toplam 35.
- **Şubat 2027 (pazartesi başlar, 28 gün) → tam 28 hücre.**
- `bugun` enjekte edilir: bugünden sonrası `gelecek`, bugün **gelecek DEĞİL**.
- Dondurulmuş gün, kılınmış kaydı olsa bile `dondurulmus` görünür.
- Zincir: yalnız `zincirKorur` çiftler arasında; **ay sınırında bağ KURULUR**;
  satır sonunda `satirSarmasi: true`; `ikisiTam` yalnız 5/5–5/5'te.
- Eşik değişince (3 vs 5) bağ sayısı değişir.

---

## Task 3 — `gokGeometrisi` + `gokErisimEtiketi`

**Yeni:** `src/core/seri/gokGeometrisi.ts` · `src/core/seri/gokErisimEtiketi.ts`
(+ testler)

### `gokGeometrisi`

```ts
export interface GokOlculeri {
  panelGenislik: number; satirSayisi: number;
  yatayPay: number; ustPay: number; satirAraligi: number;
}
export interface GokYerlesimi {
  hucreGenislik: number; toplamYukseklik: number;
  merkez(indeks: number): { x: number; y: number };
}
export function gokYerlesimi(o: GokOlculeri): GokYerlesimi;

/** Bir bağın SVG yol dizesi. Satır sarmasında satırlar arası şeritten geçen
 *  tek bir kübik yay; kenarlara gidip geri dönen KUTU biçimi REDDEDİLDİ. */
export function bagYolu(a: {x:number;y:number}, b: {x:number;y:number},
                        satirSarmasi: boolean, seritY: number, bosluk: number): string;

/** Yol uzunluğu — JS'te hesaplanır. `getTotalLength()` react-native-svg'de
 *  VARDIR ama imperatif ref + native çağrı ister; mount öncesi ve testte
 *  kullanılamaz, çizelgeyi saf tutmayı engeller. Düz yol: Öklid. Kübik: 16
 *  adımda örnekleme (hata < %0.5). */
export function yolUzunlugu(yol: string): number;
```

Merkez hesabı (ölçüm YOK, hesap VAR):
```
hucreGenislik = (panelGenislik - 2*yatayPay) / 7
merkezX(sutun) = yatayPay + hucreGenislik*(sutun + 0.5)
merkezY(satir) = ustPay + (hucreGenislik + satirAraligi)*satir + hucreGenislik/2
```

### `gokErisimEtiketi`

```ts
export function gokErisimEtiketi(izgara: IzgaraGunu[], ayAdi: string,
                                 mevcutSeri: number, tamGunEsigi: number): string;
// "Temmuz 2026. 18 gün hedef tutuldu, 12 günde beş vakit tamamlandı,
//  2 gün dondurulmuş. Mevcut seri 15 gün."
```
Salt-Svg panel ekran okuyucuya hiçbir şey söylemez; bu etiket zorunludur.
Boş ayda çökmez, sayılar 0 olur.

### Test
- Merkez hesabı bilinen ölçülerle; ilk/son hücre.
- `bagYolu` düz ve sarmalı için beklenen komut dizisi.
- `yolUzunlugu`: düz yol = Öklid mesafesi; bilinen bir kübik eğriye karşı
  örnekleme hatası **< %1**.
- `gokErisimEtiketi`: dolu ay, boş ay, dondurulmuş günlü ay.

---

## Task 4 — `Tesbih` bileşeni (ilk gerçek `react-native-svg` kullanımı)

**Yeni:** `src/presentation/screens/Seri/Tesbih.tsx` ·
`src/presentation/screens/Seri/sabitler.ts` (+ test)

**Bu, projenin `src/` içindeki İLK `react-native-svg` kullanımıdır** — bilerek
en küçük yüzeyde başlıyoruz.

Referans (HTML, `tesbihCiz`) birebir izlenir. Üç öğe **zorunlu**, biri eksikse
tesbih okunmuyor:
1. **İp boncukların İÇİNDEN geçer** — tek sürekli çizgi, aralarına parça konmaz.
2. **Durak diskleri** — ince dikey elipsler.
3. **İmame + püskül** — uzun gövde (`Rect` rx ile), tepe düğmesi (`Circle`),
   üç telli püskül (`Line`).

Boncuklar: dolu → `renkler.birincil` dolgu + üst-solda beyaz ışık noktası
(küre hissi); boş → yalnız kontur.

### Boncuk sayısı — referansta olmayan iki durum burada kapatılır
```
hedef = sonrakiHedefiBul(mevcutSeri)        // 7 | 21 | 60 | 90 | null
boncukSayisi = hedef === null ? 33 : Math.min(hedef, 33)
gunPerBoncuk = hedef === null ? 1 : Math.ceil(hedef / boncukSayisi)
durakAraligi = boncukSayisi > 21 ? 11 : 7
```
- `hedef === null` (tüm rozetler kazanılmış) → tesbih **tam dolu**, alt yazı
  "Tüm rozetleri tamamladınız".
- Dolu boncuk sayısı = `min(boncukSayisi, floor(mevcutSeri / gunPerBoncuk))`.
- Alt yazı **gerçek gün sayısını** taşır: "Kararlılık rozetine 18 gün kaldı".

### Erişilebilirlik
Tek düğüm, `accessibilityRole="progressbar"`,
`accessibilityLabel="Alışkanlık ustası rozeti: 21 günün 15'i tamamlandı."`

### `sabitler.ts`
Spec §1'deki **gök sahnesi ton tablosunun tamamı**, her tonun ne için
kullanıldığı yorumla yazılır. Bunlar temada karşılığı olmayan, koyu sahneye
özgü dekoratif tonlardır — AGENTS.md "hardcoded renk" kuralının bilinçli ve
tek istisnası. Zamanlama sabitleri de burada (Faz 2 kullanacak).

### Test
`react-native-svg` per-file mock ile: boncuk sayısı 21 hedefte 21, 60 hedefte
33; dolu boncuk sayısı; `null` hedefte tam dolu + doğru metin; erişim etiketi.

---

## Task 5 — `GokPaneli` (statik, animasyonsuz)

**Yeni:** `src/presentation/screens/Seri/GokPaneli.tsx` (+ test)

**Ayın tamamı TEK bir `<Svg>` içinde** çizilir (spec §3.1). 35 ayrı bileşen
**değil**: ölçüm turu yok, native view sayısı 1.

Katman sırası (alttan üste):
1. Gök zemini — `Defs` + `RadialGradient` ×2 + `LinearGradient`
   (CSS radial-gradient'in RN karşılığı budur; `expo-linear-gradient` yalnız
   doğrusaldır, tek başına yetmez).
2. Zincir bağları — `Path`, `bagYolu`'ndan; `ikisiTam` olanlar kalın (1.9) ve
   parlak (0.62 opaklık), diğerleri ince (0.9 / 0.3), satır sarması ince (0.9 / 0.16).
3. Yıldızlar — durumuna göre (spec §1 tablosu).
4. Gün numaraları — aynı tuvalde `Text`; **dikey hizalama `dy` ile elle**
   (`alignmentBaseline` Android'de atipik).

### Parlama: `filter` KULLANILMAZ
`FeGaussianBlur` Android'de yaklaşık ve sınırlıdır (deprecated RenderScript,
yarıçap 25'e sabit). Hâle **`RadialGradient` dolgulu daire** ile kurulur
(merkezde renk → kenarda şeffaf) — düz düşük-opaklık daire **sert kenarlı**
görünür, referanstaki yumuşaklık CSS `blur`'den geliyordu.
Işın parlaması: parlak ince çizginin **altına** kalın + düşük opaklıklı ikinci çizgi.

### Yıldız anatomisi
Beş ışın, sabah tepede saat yönünde: `-90 + i*72` derece.
5/5 ile hedef-tuttu arasındaki fark **cins farkıdır** — 5/5'te hüzmeler + çift
halka + beyaz-sıcak çekirdek + güçlü hâle; hedef-tuttu'da **halka var, ışıma
YOK**. İkisini yaklaştırmak tasarımın ana fikrini yok eder.

Komşu ay günleri `opacity: 0.42` ile çizilir (gerçek ama soluk).
Bugünün hücresine yuvarlatılmış kare çerçeve (nabız Faz 2'de).

Panel genişliği **bir kez** `onLayout` ile alınır; genişlik gelmeden Svg
çizilmez (0 genişlikte hesap saçmalar).

### Erişilebilirlik
Panel tek erişilebilir düğümdür: `accessible`, `accessibilityRole="image"`,
`accessibilityLabel={gokErisimEtiketi(...)}`.

### Test
Mock'lu render: doğru sayıda yıldız; zincir yolu sayısı `zincirBaglari` ile
uyumlu; `panelGenislik` 0 iken çökmez; erişim etiketi panelde.

---

## Task 6 — `SeriSekmesi` + sekme entegrasyonu

**Yeni:** `src/presentation/screens/Seri/SeriSekmesi.tsx` ·
`src/presentation/hooks/useSeriAyi.ts` (+ testler)
**Değişen:** `src/presentation/screens/IstatistikSayfasi.tsx`

### `useSeriAyi` — adaptör + veri
`localTarihAraligindakiNamazlariGetir` `ApiYanit<GunlukNamazlar[]>` döner;
`GunlukNamazlar.namazlar` `NAMAZ_ISIMLERI` sırasındadır ve bu sıra **ışın
sırasıyla birebir aynıdır**. Hook bunu `Record<tarih, boolean[5]>`'e çevirir —
**adaptör sunumda yaşar, core'da değil**.

`bugun` **takvim günü DEĞİL**: `namazGunuHesapla(new Date(), gunBitisSaati)` ile
üretilir (gece yarısı–05:00 arası düne sayılır). Yoksa gece 02:00'de açan
kullanıcıya bugünü "gelecek" diye gösteririz.

**Hata yolu ZORUNLU:** `basarili:false` geldiğinde ekran **sonsuz spinner'da
kalmaz** (AGENTS.md'nin yaşanmış dersi) — kibar hata + "Yeniden deneyin".

**Hidrasyon nöbetçisi:** `seri` slice'ını yalnız `AnaSayfa` yükler
(`AnaSayfa.tsx:299`). Soğuk açılışta hidrasyon garanti değildir; hidrate
edilmemiş state'te `tamGunEsigi` varsayılana düşer ve **harita yanlış eşikle
çizilir**. `SeriSekmesi` mount'ta `seriVerileriniYukle` dispatch eder (idempotent).

### Sekme entegrasyonu
`IstatistikSayfasi`'na **dördüncü** sekme: `TabTipi`'ne `'seri'` eklenir, sekme
düğmesi mevcut üçüyle aynı desende (`accessibilityRole="tab"` +
`accessibilityState={{selected}}`, ≥44dp), içerik koşullu render.
**Mevcut üç sekme değişmez.**

Sekme koşullu render edildiği için `SeriSekmesi` her girişte **yeniden mount
olur** — Faz 2'nin açılış animasyonu buna dayanacak. `useFocusEffect`
**kullanılmaz** (bunlar react-navigation sekmesi değil, yerel `useState`).

### Test
- Sekme render olur; mevcut üç sekme hâlâ çalışır.
- **Okuma reddedilince sonsuz spinner YOK**, hata durumu görünür.
- Mount'ta `seriVerileriniYukle` dispatch edilir (nöbetçi).
- Boş veride çökmez.
- `bugun`'ün `namazGunuHesapla`'dan geldiği (takvim gününden değil).

---

## Kabul kriterleri

1. `npm run verify` geçer.
2. İstatistikler'de dördüncü sekme var; ay bir gök haritası olarak çiziliyor.
3. 5/5 günler ile hedef-tutan günler **bakışta ayırt ediliyor** (cins farkı).
4. Zincir ay sınırında kopmuyor; satır sarması yay olarak çiziliyor.
5. Tesbihte ip boncukların içinden geçiyor, durak ve imame var.
6. Hiçbir animasyon yok (Faz 2).
7. `rg "#[0-9A-Fa-f]{6}" src/presentation/screens/Seri/` sonuçlarının **tamamı**
   `sabitler.ts` içinde.
8. **Kullanıcı kapısı:** ekran cihazda açılıp gök panelinin ve tesbihin
   gerçekten çizildiği doğrulanır. Faz 2 bu doğrulamadan önce başlamaz.
