# Faz 2 — Seri sekmesi: hareket

**Spec:** `docs/superpowers/specs/2026-07-29-seri-sekmesi-takimyildizi-design.md` (§2, §3.5, §3.6)
**Görsel referans (BAĞLAYICI):** `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`
**Dal:** `fix/muhafiz-kapali-adim-etiketi`
**Önkoşul:** Faz 1 tamamlandı ve **cihazda doğrulandı** — `react-native-svg` Fabric
altında çalışıyor, gök paneli ve tesbih doğru çiziliyor.

## Global Constraints

- **`npm run verify` (typecheck + lint + test) GEÇMELİDİR.**
- Yeni bağımlılık **EKLENMEZ**. `react-native-reanimated` (~4.1.1) zaten doğrudan
  bağımlılık, babel eklentisi kurulu, projede üretimde kullanılıyor
  (`KibleSayfasi/NativePusulaView.tsx`).
- **ASLA yeni hardcoded renk/sayı.** Tüm zamanlama sabitleri
  `screens/Seri/sabitler.ts` içindeki `GOK_ZAMANLAMA`'da toplanır.
- `src/core/` **saf** kalır: React/Reanimated/native import YOK, `new Date()` YOK.
- Dokunulan dosyaya **yeni lint warning eklenmez**.
- **Faz 1'in görsel sonucu DEĞİŞMEZ.** Hareket bittiğinde ekran, Faz 1'deki
  nihai hâliyle birebir aynı görünmelidir. Animasyon yalnız oraya *nasıl*
  varıldığını değiştirir.

### Zamanlama sabitleri — ÇOĞU ZATEN VAR, ikiz EKLEME

`sabitler.ts > GOK_ZAMANLAMA` şu anda **on bir sabit** içeriyor. Aşağıdaki
adlar **dosyadaki gerçek adlardır** — plan taslağındaki kısa adlar (`SEG_NORMAL`,
`PARILTI_MIN`, `NABIZ`…) YANLIŞTI, onları kullanma, ikiz sabit üretme:

| Mevcut sabit | Değer | Anlam |
|---|---|---|
| `CIZGI_ONCE_MS` | 30 | yıldız yandıktan sonra çizginin başlaması |
| `SEG_NORMAL_MS` | 85 | normal bağın çizilme süresi |
| `SEG_VURGU_MS` | 130 | 5/5 ↔ 5/5 bağı |
| `KOPUK_BOSLUK_MS` | 32 | zincir kopuk — kısa es |
| `PARILTI_SURE_TABAN_MS` | 4600 | parıltı taban süresi |
| `PARILTI_SURE_FAZ_ARALIGI_MS` | 2600 | süre faz-farkı aralığı |
| `PARILTI_GECIKME_SONRASI_MS` | 700 | açılış bittikten sonra parıltı gecikmesi |
| `PARILTI_GECIKME_FAZ_ARALIGI_MS` | 1800 | gecikme faz-farkı aralığı |
| `PARILTI_FAZ_CARPANI_SURE` | 617 | faz üretimi (asal) |
| `PARILTI_FAZ_CARPANI_GECIKME` | 431 | faz üretimi (asal) |
| `NABIZ_SURE_MS` | 3200 | bugünün karesi |

**Bu fazda EKLENECEK tek grup — giriş süreleri** (referans HTML satır 119-121):

| Yeni sabit | Değer |
|---|---|
| `GIRIS_TAM_MS` | 380 |
| `GIRIS_HEDEF_MS` | 300 |
| `GIRIS_SADE_MS` | 240 |

---

## Task 1 — `acilisCizelgesi` (saf zaman çizelgesi)

**Yeni:** `src/core/seri/acilisCizelgesi.ts` + `__tests__/acilisCizelgesi.test.ts`

```ts
export interface BagZamani { gecikme: number; sure: number; vurgulu: boolean }
export interface AcilisCizelgesi {
  yildizGecikme: number[];              // izgara indeksi -> ms
  bagZamani: Map<number, BagZamani>;    // bağın sol gün indeksi -> zaman
  toplam: number;                       // tüm dizinin süresi (ms)
}
export function acilisCizelgesi(
  izgara: IzgaraGunu[],
  baglar: ZincirBagi[],
  sabitler: { cizgiOnce: number; segNormal: number; segVurgu: number; kopukBosluk: number },
): AcilisCizelgesi;
```

### Model: BİRİKİMLİ, ardışık — sabit adımlı stagger DEĞİL

```
yıldız yanar → çizgi ona doğru uzar → VARDIĞINDA sonraki yıldız yanar → ...
```

Algoritma (referanstaki `CIZELGE` ile birebir):
```
t = 0; yildizGecikme[0] = 0
her i için (0 … n-2):
  bagli = i ile i+1 arasında bağ var mı?
  bagli ise:
    sure = vurgulu ? segVurgu : segNormal
    bagZamani[i] = { gecikme: t + cizgiOnce, sure, vurgulu }
    t += cizgiOnce + sure          // sonraki yıldız, çizgi VARDIĞINDA yanar
  değilse:
    t += kopukBosluk               // zincir kopuk — kısa es
  yildizGecikme[i+1] = t
```

**En kritik kural — kullanıcının açık talebiydi:** hiçbir bağ, bir öncekinin
**bitişinden önce başlamaz**. Referansta ölçüldü: 22 segment, **0 çakışma**,
zincir 3,21 sn'de tamamlanıyor.

### Test
- **NÖBETÇİ:** bağları gecikmeye göre sırala; her `i>0` için
  `bag[i].gecikme >= bag[i-1].gecikme + bag[i-1].sure`. Çakışma **sıfır** olmalı.
  (Sabit adımlı stagger'a dönülürse bu test düşer.)
- Kopuk zincirde es verilir, yıldız yine de belirir.
- `vurgulu` bağ `segVurgu`, diğeri `segNormal` süresi alır.
- Toplam süre makul sınırda (35 hücrelik ay için < 5 sn).
- Boş ızgara / bağsız ızgara → çökmez, `toplam = 0` veya eslere göre.
- Saf: `new Date()` yok, girdi dışında kaynak yok.

---

## Task 2 — Açılış animasyonu (yıldız girişi + zincirin çizilmesi)

**Değişen:** `src/presentation/screens/Seri/GokPaneli.tsx`, `sabitler.ts`

### 2a. Zincirin çizilmesi — `strokeDashoffset`

`Animated.createAnimatedComponent(Path)` + Reanimated `useAnimatedProps`.

- Yol uzunluğu **JS'te hesaplanır**: `gokGeometrisi.yolUzunlugu` (Faz 1'de yazıldı,
  test edildi). `getTotalLength()` **kullanılmaz** — imperatif ref + native çağrı
  ister, mount öncesi ve testte kullanılamaz.
- **`strokeDasharray` STATİK prop olarak verilir** (yol uzunluğu), yalnız
  `strokeDashoffset` animasyonlanır. Bilinen tuzak: ikisini birden animasyonlamak.
- Her bağ kendi `bagZamani`'ndan gecikme/süre alır → `withDelay(gecikme, withTiming(0, {duration: sure}))`.
- **`strokeDasharray`'e küçük bir PAY ver (×1.05).** `yolUzunlugu` kübik yolu 16
  adımlı çokgenle **alttan** tahmin eder (`gokGeometrisi.ts`, hata <%1). Dasharray
  tam bu değere eşitlenirse satır-sarması yaylarının ucunda **çizilmemiş minik bir
  kuyruk** kalır. Pay sıfır maliyetli sigortadır.
- Bilgi (sorun değil): `extractStroke.ts` offset 0'ı `null`'a çevirir — görsel
  eşdeğer.

**İLK İŞ — tek bağla cihaz smoke testi.** 20 bağı kurup sonra denemeyin: önce
TEK bir bağı animasyonlayıp emülatörde çizildiğini görün. `useAnimatedProps` +
`strokeDashoffset` + react-native-svg üçlüsü bu projede hiç denenmedi; mekanizma
kodda mevcut (`Shape.tsx`'te `getNativeScrollRef` hack'i + `setNativeProps`,
reanimated `fabricUtils` bunu kullanıyor) ama Fabric'te uçtan uca **doğrulanmadı**.

### 2b. Yıldız girişi — kademeli vurgu

Her yıldız `yildizGecikme[i]` ile başlar; **durumuna göre farklı** giriş:

| Durum | Süre | Hareket |
|---|---|---|
| 5/5 | `GIRIS_TAM` (380 ms) | opacity 0→1 **ve** scale 0.35 → **1.2** → 1 (taşma) |
| hedef tuttu | `GIRIS_HEDEF` (300 ms) | opacity 0→1, scale 0.82 → 1 (**taşma YOK**) |
| diğerleri | `GIRIS_SADE` (240 ms) | yalnız opacity 0→1 (scale YOK) |

**Referanstaki `filter: brightness` taşınmaz** — RN'de karşılığı yok. 5/5'in
"parlayarak girme" hissi **scale taşması + hâle opaklığının aşırı-atışı** ile
verilir (hâle katmanı girişte kısa süre daha opak olur, sonra oturur).

#### Ölçek animasyonu — `<G transform>` ÇALIŞMAZ, iki güvenli yol var

Taslakta "`<G>`'ye `useAnimatedProps` ile `transform`" yazıyordu; **bu büyük
olasılıkla çalışmaz** (incelemede `node_modules`'tan doğrulandı):
`RNSVGGroup`'un native dönüşüm prop'u **`matrix: Float[]`**'tir, `transform`
değil. JS'teki `transform` yalnız **render sırasında** `extractTransform` ile
matrise çevrilir (`G.tsx`); `useAnimatedProps`'un UI-thread yazımı bu JS
dönüşümünden **geçmez**. Reanimated'in kendi SVG CSS konfiginde de transform
satırları `// TODO - add preprocessor` durumunda.

İki seçenek — uygulayıcı birini seçer ve gerekçesini rapora yazar:

**(a) Matris animasyonu.** Worklet içinde 2D matrisi elle kur ve **`matrix`**
prop'unu animasyonla: ölçek `s` için `[s, 0, 0, s, 0, 0]`. Merkezin kayMAMASI
için bunu **iç içe ikinci bir `<G>`**'de yap — dıştaki `<G>` mevcut
`translate(merkezX merkezY)`'yi tutar, içteki yalnız ölçeği uygular. Böylece
ölçek yıldızın kendi merkezine göre çalışır.

**(b) Ölçekten vazgeç.** 5/5'in "parlayarak girme" hissini yalnız
**opacity + hâle opaklığının aşırı-atışı** ile ver (hâle girişte kısa süre daha
opak olur, sonra oturur). Daha az gösterişli ama sıfır riskli.

Hangisi seçilirse seçilsin **kademe farkı korunmalı**: 5/5 belirgin daha
vurgulu, hedef-tuttu sade, diğerleri yalnız soluklaşma.

#### Hook döngüde çağrılamaz — YENİDEN YAPILANDIRMA gerekiyor

Mevcut `GokPaneli` zincirleri ve yıldızları **aynı bileşenin gövdesinde `map`
ile** çiziyor. `useAnimatedProps`/`useSharedValue` **döngü içinde çağrılamaz** →
her bağ ve her yıldız **kendi child bileşenine** çıkarılmalı
(ör. `AnimasyonluBag`, `AnimasyonluYildiz`).

**Bu, Task 2'nin asıl işi ve "Faz 1 ile birebir aynı" kısıtının ana riskidir**:
JSX taşınırken katman sırası veya prop kayması görsel sapma üretebilir. Taşımadan
önce ve sonra `GokPaneli.test.tsx`'in geçtiğinden emin ol; katman sırasını
(zemin → bağlar → yıldızlar → gün numaraları) **koru**.

### 2c. Bir kez oynatma — `useFocusEffect` DEĞİL

`IstatistikSayfasi` sekmeleri react-navigation sekmesi **değil**, yerel
`useState` + koşullu render. Bu yüzden `SeriSekmesi` sekmeye her girişte
**yeniden mount olur**.

Kural: **mount'ta bir kez oynat, mount süresince veri değişiminde TEKRAR
OYNATMA** (`oynatildi` ref). Aksi halde kullanıcı bir günü işaretlediğinde tüm ay
yeniden örülür — sinir bozucu ve yanıltıcı.

**Kritik ek kural:** `oynatildi` true iken **sonradan mount olan öğe NİHAİ
durumda doğmalı** (opacity 1, dashoffset 0). Mount sırasında `tamGunEsigi`
değişirse (slice geç hidrasyonu) yeni bağlar/yıldızlar doğar; başlangıç değeri
"animasyon başı" olan bir shared value ile doğarlarsa **görünmez kalırlar**.

### Test
- Zincir yollarına `strokeDasharray` **statik** verilmiş, `strokeDashoffset`
  animasyonlu (mock'lu reanimated ile prop varlığı doğrulanır).
- Yıldız durumuna göre doğru giriş süresi seçiliyor.
- Veri değişiminde animasyon **yeniden başlamıyor** (`oynatildi` nöbetçisi).

---

## Task 3 — Sürekli hareket + azaltılmış hareket

**Değişen:** `GokPaneli.tsx`, `sabitler.ts`

### 3a. 5/5 parıltısı — Svg prop'u DEĞİL, ÜSTTEKİ KATMAN

Referans `filter: brightness()` ile parıldıyor; **RN'de karşılığı yok**.

Naif çözüm (yıldızın Svg prop'unu sonsuz animasyonlamak) 19-20 sonsuz
animasyonun her karede ~875-995 düğümlük tuvali geçersiz kılmasına yol açar —
cihazda ölçüldü, düşük-uç Android'de jank/pil riski.

Gerekçe mimari bir gerçek, spekülasyon değil (incelemede doğrulandı):
`VirtualView.java`'da herhangi bir sanal düğümün `invalidate()`'i
`clearParentCache()` zinciriyle `SvgView`'a taşınır ve `SvgView.onDraw` **tüm
ağacı** yeniden çizer.

**Doğrusu:** parıltı, yıldızın üstüne konan, `opacity`'si animasyonlanan bir
**`Animated.View` sarmalayıcı** ile yapılır — ama içi **düz renkli daire
OLMAZ**.

⚠️ **Faz 1'in kendi dersi:** "düz düşük-opaklık daire **sert kenarlı** görünür;
CSS blur'ün yumuşaklığı böyle taşınmaz" (AGENTS.md'de ve `GokPaneli.tsx` başlık
yorumunda kayıtlı — hâle bu yüzden `RadialGradient` ile kuruldu). Düz bir
`Animated.View` dairesi tam da reddedilen artefaktı geri getirir.

Doğru yapı: `Animated.View` (opacity animasyonlu, `pointerEvents="none"`)
**içinde statik mini bir `<Svg>`** — tek `RadialGradient` dolgulu daire.
Animasyon sarmalayıcının alpha'sında kalır → kompozitör katmanı, ana Svg ağacı
**yeniden çizilmez**, kenar da yumuşak kalır.

- `withRepeat(withTiming(...), -1, true)` + `withDelay`.
- **FAZ FARKI ZORUNLU:** süre `PARILTI_SURE_TABAN_MS + (i*PARILTI_FAZ_CARPANI_SURE)
  % PARILTI_SURE_FAZ_ARALIGI_MS`, gecikme benzer şekilde
  `PARILTI_GECIKME_FAZ_ARALIGI_MS` ve `PARILTI_FAZ_CARPANI_GECIKME` ile.
  Sabitler **zaten var**, formül referansla birebir. Senkron yanıp sönme **yapay**
  durur; `Math.random` KULLANMA (deterministik olmalı).
- Başlangıç: `cizelge.toplam + PARILTI_GECIKME_SONRASI_MS`.
- **Konumlandırma — `HEADER_YUKSEKLIK` ofsetini UNUTMA.** Izgara katmanı
  `<G transform="translate(0 HEADER_YUKSEKLIK)">` içinde çiziliyor, ama
  `gokYerlesimi().merkez(i)` **header'sız** koordinat verir. Overlay'in `top`
  hesabına `HEADER_YUKSEKLIK` eklenmezse tüm parıltılar 46 px yukarı kayar.
  Panel `overflow: hidden` — Svg de aynı sınırda kırptığı için görsel fark
  üretmez, sorun değil.

### 3b. Bugünün nabzı

Yuvarlatılmış kare çerçeve `NABIZ` (3200 ms) sürede büyüyüp soluyor
(scale + opacity). Bu **tek** öğe olduğu için Svg prop animasyonu kabul edilebilir,
ama tutarlılık için o da overlay `Animated.View` olabilir — uygulayıcı seçer,
gerekçesini rapora yazar.

### 3c. Azaltılmış hareket

`AccessibilityInfo.isReduceMotionEnabled()` **true** ise: **hiçbir animasyon
kurulmaz**, ekran doğrudan nihai hâlinde görünür. Eksik değil, **hareketsiz**.

**`AccessibilityInfo.isReduceMotionEnabled()` KULLANMA — senkron hook var.**
O API **async**tir ve giriş animasyonu opacity 0'dan başladığı için iki kötü
seçenek doğurur: ya yıldızlar 0 opaklıkla doğup değer gelene dek **boş gök**
görünür, ya nihai hâlde doğup değer gelince 0'a çekilerek **flaş** yapar.

Reanimated'in **senkron** `useReducedMotion()` hook'u kurulu sürümde mevcut
(`react-native-reanimated/src/hook/useReducedMotion.ts`) — karar **ilk render'da**
verilir, ikilem kökten kalkar.

⚠️ Hook `react-native-reanimated/mock` içinde **YOK** (`// useReducedMotion: ADD
ME IF NEEDED`) — per-file mock'a eklenmeli (aşağıdaki test reçetesi).

Taban durum **daima nihai durumdur** (referansın kendi deseni): reduced motion
açıkken hiçbir animasyon kurulmaz, ekran doğrudan son hâlinde görünür.

### Test
- Reduced motion **açıkken**: `withRepeat`/`withTiming` **çağrılmaz**, ekran
  nihai hâlinde render olur.
- Reduced motion **kapalıyken**: parıltı kurulur, süreler yıldızdan yıldıza
  **farklıdır** (faz farkı nöbetçisi — hepsi aynıysa test düşer).
- Bugünün nabzı yalnız bugünün hücresinde kurulur.

---

## Test mock reçeteleri (repoda mevcut, aynen kullan)

- **`react-native-svg`**: Faz 1'de yazılan per-file mock. Bileşenler **düz
  string**'e indirgenir (`Svg: 'Svg'`, `Circle: 'Circle'`…).
  **`jest.mock` fabrikasında `React.createElement` ÇAĞIRMA** — nativewind'in
  `jsxImportSource` transformu `_ReactNativeCSSInterop` kapsam-dışı değişken
  hatası verir (AGENTS.md'de kayıtlı).
- **`react-native-reanimated`**: taban `require('react-native-reanimated/mock')`
  (mevcut reçete: `KibleSayfasi.test.tsx:41-45`). AMA iki ekleme gerekir:

  1. **`withRepeat` çağrı sayısı ölçülemez** — mock'takiler `jest.fn` değil, düz
     fonksiyon (`withRepeat: ID`). "Reduced motion açıkken `withRepeat`
     çağrılmadı" gibi bir iddia için sarmalamak şart:
     ```js
     jest.mock('react-native-reanimated', () => {
       const m = require('react-native-reanimated/mock');
       return { ...m, withRepeat: jest.fn(m.withRepeat),
                useReducedMotion: jest.fn(() => false) };
     });
     ```
     (Fabrikada `React.createElement` YOK → nativewind kısıtına takılmaz.)
  2. **`useReducedMotion` mock'ta yok**, yukarıdaki gibi eklenmeli.

- **Animasyonlu prop'ları testte nasıl göreceksin:** mock'ta `useAnimatedProps`
  callback'i anında çağrılıp **düz nesne** döndürür ve `createAnimatedComponent`
  kimliktir. Yani değerler string-mock elemanın üstünde `animatedProps` prop'u
  olarak görünür. "dasharray statik + dashoffset animasyonlu" iddiası şöyle
  doğrulanır: `props.strokeDasharray` (statik) **var**, `props.animatedProps
  .strokeDashoffset` (animasyonlu) **var**.
- Sahte zamanlayıcı **KULLANMA** (tam-sayfa render, CI'da asılır).
- Mock bileşenlere **çocuk render ettirme**.

---

## Cihaz doğrulaması — bu fazın KAPISI

Faz 1'de emülatör doğrulaması **gerçek bir görsel sapma yakaladı** (halkalar
üstte çizilip ışın uçlarını kesiyordu); testler ve statik inceleme göremedi.
Hareket için bu daha da geçerlidir — zamanlama ve akıcılık **yalnız cihazda**
değerlendirilebilir.

Faz 2 bittiğinde emülatörde şunlar doğrulanır:
1. Zincir gerçekten **sırayla** örülüyor mu (bir bağ bitmeden sonraki başlamıyor)?
2. 5/5 girişi hedef-tuttudan **belirgin daha vurgulu** mu?
3. Parıltı **faz farklı** mı (senkron yanıp sönmüyor)?
4. Bugünün nabzı sakin mi, dikkat dağıtıyor mu?
5. Akıcılık: düşük-uç profilde jank var mı?
6. Toplam süre (~3,2 sn) uzun geliyor mu?

---

## Kabul kriterleri

1. `npm run verify` geçer.
2. Zincir ardışık örülür; nöbetçi test çakışmanın **sıfır** olduğunu doğrular.
3. 5/5 · hedef-tuttu · diğer girişleri üç ayrı vurgu kademesinde.
4. Parıltı yalnız 5/5'te, faz farklı, Svg ağacını yeniden çizmiyor.
5. Azaltılmış hareket açıkken hiçbir animasyon kurulmuyor.
6. Sekmeye tekrar girmeden, veri değişiminde animasyon yeniden başlamıyor.
7. **Hareket bittiğinde ekran Faz 1'deki nihai hâliyle birebir aynı.**
8. Cihaz doğrulaması yapılır (yukarıdaki altı soru).
