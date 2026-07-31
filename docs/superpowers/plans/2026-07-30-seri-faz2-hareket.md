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

### Zamanlama sabitleri — referanstan, birebir

| Sabit | Değer | Anlam |
|---|---|---|
| `CIZGI_ONCE` | 30 ms | yıldız yandıktan sonra çizginin başlaması |
| `SEG_NORMAL` | 85 ms | normal bağın çizilme süresi |
| `SEG_VURGU` | 130 ms | 5/5 ↔ 5/5 bağı (daha ağır çizilir) |
| `KOPUK_BOSLUK` | 32 ms | zincir kopuk — kısa es |
| `GIRIS_TAM` | 380 ms | 5/5 yıldız girişi (taşmalı + parlamalı) |
| `GIRIS_HEDEF` | 300 ms | hedef-tuttu girişi (taşma/parlama YOK) |
| `GIRIS_SADE` | 240 ms | diğerleri (yalnız soluklaşma) |
| `PARILTI_MIN`/`MAX` | 4600 / 7200 ms | 5/5 parıltı süresi aralığı |
| `PARILTI_BASLANGIC` | +700 ms | açılış dizisi bittikten sonra |
| `NABIZ` | 3200 ms | bugünün karesi |

İlk dördü `GOK_ZAMANLAMA`'da **zaten var** (Faz 1, Task 4). Giriş süreleri ve
parıltı/nabız değerleri bu fazda eklenir.

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

Ölçek animasyonu için yıldız grubu bir `<G>` içinde; Reanimated ile
`useAnimatedProps` üzerinden `transform` verilir. **`transform-origin` yok** —
yıldız zaten kendi merkezinde çizildiği için `scale` merkeze göre çalışır.

### 2c. Bir kez oynatma — `useFocusEffect` DEĞİL

`IstatistikSayfasi` sekmeleri react-navigation sekmesi **değil**, yerel
`useState` + koşullu render. Bu yüzden `SeriSekmesi` sekmeye her girişte
**yeniden mount olur**.

Kural: **mount'ta bir kez oynat, mount süresince veri değişiminde TEKRAR
OYNATMA** (`oynatildi` ref). Aksi halde kullanıcı bir günü işaretlediğinde tüm ay
yeniden örülür — sinir bozucu ve yanıltıcı.

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

**Doğrusu:** parıltı, yıldızın **üstüne konan küçük bir `Animated.View`'in
`opacity`'si** ile yapılır (yıldız merkezinde, hâle rengiyle dolu, yuvarlak,
`pointerEvents="none"`). Kompozitör katmanında animasyonlanır, **Svg ağacı hiç
yeniden çizilmez**.

- `withRepeat(withTiming(...), -1, true)` + `withDelay`.
- **FAZ FARKI ZORUNLU:** her yıldız farklı süre (`PARILTI_MIN`–`PARILTI_MAX`
  arası, indeksten türetilmiş) ve farklı gecikme. Senkron yanıp sönme **yapay**
  durur; gökyüzü dağınık olmalı.
- Başlangıç: `cizelge.toplam + PARILTI_BASLANGIC`.
- Katman konumlandırma: gök paneli `position: relative`, parıltı katmanları
  `position: absolute` + hesaplanmış merkez koordinatları (`gokYerlesimi`).

### 3b. Bugünün nabzı

Yuvarlatılmış kare çerçeve `NABIZ` (3200 ms) sürede büyüyüp soluyor
(scale + opacity). Bu **tek** öğe olduğu için Svg prop animasyonu kabul edilebilir,
ama tutarlılık için o da overlay `Animated.View` olabilir — uygulayıcı seçer,
gerekçesini rapora yazar.

### 3c. Azaltılmış hareket

`AccessibilityInfo.isReduceMotionEnabled()` **true** ise: **hiçbir animasyon
kurulmaz**, ekran doğrudan nihai hâlinde görünür. Eksik değil, **hareketsiz**.

- Değer **async** gelir → AGENTS.md'nin "asenkron hook'lu sayfa testinde `act`
  uyarısı" tuzağı geçerli. Mevcut örnek: `AyarCapasi.test.tsx`
  (`jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(...)`).
- Değer gelene kadar animasyon **başlatılmaz** (yanlış başlayıp durdurmaktansa
  bekle); gelince tek seferde karar verilir.
- Unmount güvenliği: geç çözülen promise unmount sonrası state yazmasın.

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
- **`react-native-reanimated`**: `require('react-native-reanimated/mock')`
  (mevcut reçete: `KibleSayfasi.test.tsx:41-45`).
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
