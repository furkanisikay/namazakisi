# İstatistikler → Seri sekmesi: ayın takımyıldızı

**Tarih:** 2026-07-29
**Görsel referans (BAĞLAYICI):** `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html`
**Ekran:** `src/presentation/screens/IstatistikSayfasi.tsx` — dördüncü sekme

## Problem

İstatistik sayfasında üç sekme var (Günlük / Haftalık / Aylık) ve hiçbiri
**seriyi** göstermiyor. Seri verisi (`seriSlice`, `SeriHesaplayiciServisi`)
mevcut, hesaplanıyor, puanlamayı besliyor — ama kullanıcı yalnızca ana ekranda
bir sayı olarak görüyor. "Kaç gündür kesintisiz?" sorusunun cevabı var,
"nerede koptu, ne zaman toparlandım?" sorusunun cevabı yok.

## Tasarım özeti

Ay, otuz ikonluk bir ızgara değil **bir gök haritası**. Gerekçe süsleme değil:
namaz vakitleri astronomiktir — uygulama onları güneşin açısından hesaplıyor
(`adhan`). Her gün **beş ışınlı bir yıldız**, her ışın bir vakit. Ardışık günler
bağlanıp ayın takımyıldızını çizer.

**Referans dosya bağlayıcıdır.** Ölçü, renk, zamanlama tartışmalarında referans
kazanır. Uygulama saparsa önce referans güncellenir, sonra kod (bkz.
`docs/tasarim/README.md`).

---

## 1. Görsel sözleşme

### Yıldız anatomisi

Beş ışın, **sabah tepede saat yönünde**: Sabah (−90°), Öğle (−18°), İkindi (54°),
Akşam (126°), Yatsı (198°). Kılınan vakit ışını yanar, kılınmayan sönük kalır.

| Durum | Koşul | Görünüm |
|---|---|---|
| **Beş vakit tamam** | 5/5 | Beş yöne uzanan **hüzmeler** + çift halka + beyaz-sıcak çekirdek + güçlü hâle |
| **Hedefi tutturdu** | `kılınan >= tamGunEsigi` (5 değil) | **Halka var, ışıma YOK.** Sabit ışık noktası |
| **Hedefin altında** | `0 < kılınan < eşik` | Yalnız kılınan ışınlar yanar, halka yok |
| **Henüz kılınmadı** | 0 | Sönük ışınlar + soluk çekirdek; yer belli, ışık yok |
| **Dondurulmuş** | özel gün | Kesikli halka + soluk çekirdek, ışın yok |
| **Gelecek** | tarih > bugün | Tek küçük nokta |

**Kritik ayrım:** hedefi tutturmak ile beş vakti tamamlamak arasındaki fark
**derece değil cins farkıdır**. Hedef tutan gün *sabit bir ışık noktası*, beş
vakit tamamlanan gün *hüzme salan bir cisim*. Bu yüzden hedef-tuttu durumu
bilerek kısılmıştır — parlaklık beş vakte ayrılmıştır. İkisini birbirine
yaklaştırmak tasarımın ana fikrini yok eder.

### Zincir

- Bağ **yalnız** `zincirKorur` günler arasında çizilir: `özel gün` veya
  `kılınan >= tamGunEsigi`. Bu, motorun seriyi saydığı kuralın **birebir**
  aynısıdır — yeni bir yorum üretilmez.
- **İki beş-vakit günü arasındaki bağ kalın ve parlak** (1.9 vs 0.9 kalınlık).
- **Ay sınırı tanımaz.** Izgara komşu ay günleriyle dolar (Temmuz için
  pazartesi-salı Haziran'dan). Bu günler soluk (%42) ama **gerçektir**: kendi
  durumlarını taşır ve zincire katılır. Zincir 30 Haziran'dan 1 Temmuz'a
  kesintisiz geçer.
- **Satır sarması.** Haftanın son günü ile ertesi haftanın ilk günü, yan yana
  olsalardı bağlanacaklarsa **satırlar arası şeritten geçen tek bir yayla**
  bağlanır. Kenarlara kadar götürüp geri getirmek satırları saran bir *kutu*
  çiziyordu — o yaklaşım denendi ve **reddedildi**. Bu yüzden satır aralığı
  (`row-gap` karşılığı) bilerek açıktır: yay hiçbir yıldızın üstünden geçmez.

### Gök paneli

Koyu, iki temada da. **Bu bilinçli:** gökyüzü bir yüzey değil, bir dünya.
Sayfanın gerisi temaya uyar; cesaret tek yerde harcanır (AGENTS.md "imza öğesi").

**Palet uyumu:** gök zemini sabit, ama yıldızın **hâlesi ve hüzmeleri
`renkler.birincil`'den** gelir. Zümrüt'te yeşil, Mercan'da mercan bir gökyüzü.
Hiçbir renk koda gömülmez — ışık beyazları (`#F0F5FF`, `#FFFFFF`) ve gök
zemini (`#080B16`–`#1B2440`) hariç; bunlar **temada karşılığı olmayan**
sahne renkleridir ve `src/presentation/screens/Seri/sabitler.ts`'de,
gerekçesiyle birlikte, tek yerde toplanır.

### Tesbih (rozet ilerlemesi)

Sıralı daireler tesbih okunmuyordu. Üç öğe zorunlu:
1. **İp boncukların İÇİNDEN geçer** — aralarına çizgi parçası konmaz.
2. **Durak diskleri** — her 7 boncukta bir ince dikey disk.
3. **İmame + püskül** — sonda uzun gövde, tepe düğmesi, üç telli püskül.
   **İmame hedeftir**: ipin ucundaki varış noktası, yani rozet.

Boncuklara üst-sol ışık noktası konur (düz daire değil, küre).
Boncuk sayısı **veriden gelir** (sonraki rozet eşiği), gelenekteki 33 değil —
tesbih burada süs değil ilerleme göstergesidir.

---

## 2. Hareket

**Referanstaki zamanlama bağlayıcıdır.** Ölçülen değerler:

### Açılış — zincir SIRAYLA örülür

Sabit adımlı stagger **reddedildi**: segmentler üst üste biniyordu. Doğru model
**birikimli çizelge** — bir bağlantı **bitmeden** sonraki başlamaz:

```
yıldız yanar → çizgi ona doğru uzar → VARDIĞINDA sonraki yıldız yanar → ...
```

| Sabit | Değer | Not |
|---|---|---|
| `CIZGI_ONCE` | 30 ms | yıldız yandıktan sonra çizginin başlamasına kadar |
| `SEG_NORMAL` | 85 ms | normal bağ |
| `SEG_VURGU` | 130 ms | 5/5 ↔ 5/5 bağı (daha ağır çizilir) |
| `KOPUK_BOSLUK` | 32 ms | zincir kopuk — kısa es |

Toplam ≈ **3,2 sn** (35 hücre, 22 bağ). Süreler kısa tutuldu çünkü segmentler
**ardışık** çalışır; referanstaki eski 430 ms'lik süreyle toplam 10 sn'yi
geçiyordu.

Giriş vurgusu kademelidir: 5/5 → 380 ms, parlayarak ve taşarak (0.35 → 1.2 → 1);
hedef tuttu → 300 ms, taşma ve parlama yok; diğerleri → 240 ms, yalnız soluklaşma.

### Sürekli hareket

- **5/5 parıltısı:** yavaş (4,6–7,2 sn) ve **faz farklı** — her yıldız farklı
  süre ve gecikmeyle. Senkron yanıp sönme yapay durur. Açılış dizisi bittikten
  ~700 ms sonra başlar.
- **Bugünün nabzı:** yuvarlatılmış kare 3,2 sn'de büyüyüp soluyor.
- Başka hiçbir şey sürekli hareket etmez.

### Azaltılmış hareket

`AccessibilityInfo.isReduceMotionEnabled()` true ise: **hiçbir animasyon
çalışmaz**, ekran doğrudan nihai hâlinde görünür. Eksik değil, hareketsiz.

---

## 3. React Native'e çeviri — DOM'u birebir taşımayın

Referans DOM+CSS'tir; RN'de aynı sonucu veren yol **farklıdır**. Bu bölüm
uygulayıcının tıkanacağı noktaları önceden çözer.

### 3.1 TEK `Svg` tuvali — 35 ayrı bileşen DEĞİL

Referansta her gün ayrı bir `<svg>`, zincir ayrı bir katman ve konumlar
`getBoundingClientRect` ile ölçülüyor. RN'de bunu taşımak üç sorun doğurur:
35 ayrı native view, `onLayout` ölçüm turu, ve `getTotalLength()` yokluğu.

**Doğrusu: ayın tamamı tek bir `<Svg>` içinde çizilir.** Hücre merkezleri
panel genişliğinden **hesaplanır** (ölçülmez):

```
hucreGenislik = (panelGenislik - 2*yatayPay) / 7
merkezX(sutun) = yatayPay + hucreGenislik*(sutun + 0.5)
merkezY(satir)  = ustPay + (hucreGenislik + satirAraligi)*satir + hucreGenislik/2
```

Kazanç: ölçüm turu yok · yol uzunlukları hesaplanabilir · native view sayısı
35+22'den **1**'e iner. Yalnız panelin kendi genişliği bir kez `onLayout` ile
alınır.

### 3.2 Parlama: `filter` YOK, KATMAN var

`react-native-svg` filtreleri (özellikle `FeGaussianBlur`) Android'de
güvenilmez. Referanstaki `drop-shadow` ve `blur` **taşınmaz**; yerine
**katmanlı sahte parlama**:

- Hâle: geniş + çok düşük opaklıkta daire, altında dar + biraz daha opak daire.
- Işın parlaması: parlak ince çizginin **altına** daha kalın, düşük opaklıklı
  ikinci bir çizgi.

Referans zaten hâleyi böyle kuruyor (`disBloom`/`icBloom`); aynı teknik ışınlara
ve çekirdeğe genişletilir. Sonuç gözle aynıdır, filtreye bağımlılık sıfırdır.

### 3.3 Gök zemini: CSS radial-gradient YOK

`RadialGradient` + `LinearGradient` **`react-native-svg` içinde** kurulur (aynı
tuvalde, en altta). `expo-linear-gradient` yalnız doğrusal olduğu için tek
başına yetmez.

### 3.4 Zincirin çizilmesi: `strokeDashoffset`

`Animated.createAnimatedComponent(Path)` + Reanimated `useAnimatedProps`.

**`getTotalLength()` RN'de YOKTUR** — yol uzunluğu **JS'te hesaplanmalıdır**.
Yolları biz ürettiğimiz için bu mümkün: düz bağlar için Öklid mesafesi; satır
sarması kübik eğrisi için **örnekleyerek** (16 adım yeterli, hata < %0.5).
Bu hesap saf bir fonksiyondur ve test edilir.

### 3.5 Sürekli parıltı

Reanimated `withRepeat(withTiming(...), -1, true)` + `withDelay`. 19 eşzamanlı
animasyon UI thread'inde koşar, JS thread'ini meşgul etmez.

### 3.6 Açılış animasyonu ODAKTA bir kez

Sekme her veri değişiminde yeniden render olur; açılış dizisi **her render'da
değil**, sekmeye her girişte **bir kez** çalışmalıdır (`useFocusEffect` +
bir `oynatildi` ref'i). Aksi halde kullanıcı bir günü işaretlediğinde tüm ay
yeniden örülür — sinir bozucu ve yanıltıcı.

### 3.7 Gün numaraları

Aynı tuvalde `<Text>` (react-native-svg) olarak çizilir; ayrı RN `Text`
katmanı konumlandırma sorunları doğurur.

---

## 4. Veri

### Kaynaklar (hepsi mevcut, yeni depolama YOK)

| Veri | Kaynak |
|---|---|
| Gün bazında kılınan vakitler | `localTarihAraligindakiNamazlariGetir(baslangic, bitis)` |
| Tam gün eşiği | `seriSlice.ayarlar.tamGunEsigi` |
| Dondurulmuş günler | `seriSlice.ozelGunAyarlari` (`aktifOzelGun` + `gecmisKayitlar`) |
| Mevcut seri / rekor | `seriSlice.seriDurumu` (`mevcutSeri`, `enUzunSeri`) |
| Sonraki rozet | `SeriHesaplayiciServisi.sonrakiHedefiBul(mevcutSeri)` |

**Aralık ızgaranın tamamını kapsamalı** — ayın 1'inden önceki pazartesiden,
son gününden sonraki pazara kadar. Yoksa komşu ay günleri boş görünür ve ay
sınırı zinciri kopuk çizilir.

### Saf çekirdek

**`src/core/seri/aylikIzgara.ts`**
```ts
export interface IzgaraGunu {
  tarih: string;            // ISO
  gunNo: number;
  digerAy: boolean;
  durum:
    | { tip: 'kilindi'; vakitler: boolean[] }   // uzunluk 5, vakit sırasında
    | { tip: 'dondurulmus' }
    | { tip: 'gelecek' };
}
export function aylikIzgaraOlustur(g: {
  yil: number; ay: number;                  // ay 0-tabanlı
  kayitlar: Record<string, boolean[]>;      // tarih -> 5 vakit
  dondurulmusTarihler: ReadonlySet<string>;
  bugun: string;
}): IzgaraGunu[];                            // 35 veya 42 hücre
```

**`src/core/seri/zincir.ts`**
```ts
export interface ZincirBagi { indeks: number; ikisiTam: boolean; satirSarmasi: boolean; }
export function zincirBaglari(izgara: IzgaraGunu[], tamGunEsigi: number): ZincirBagi[];
```
`zincirKorur` kuralı **`SeriHesaplayiciServisi` ile aynı** olmalı; kural
kopyalanmaz, ortak bir yardımcıya çıkarılır veya oradan import edilir.

**`src/core/seri/acilisCizelgesi.ts`**
```ts
export interface Cizelge { yildizGecikme: number[]; bagZamani: Map<number, {gecikme:number; sure:number}>; toplam: number; }
export function acilisCizelgesi(izgara: IzgaraGunu[], baglar: ZincirBagi[], esik: number): Cizelge;
```
Zamanlama **saf ve test edilebilir**. Nöbetçi test: **hiçbir bağ, bir
öncekinin bitişinden önce başlamaz** (bu, tasarımın açık talebiydi).

**`src/core/seri/gokGeometrisi.ts`** — hücre merkezleri, yol dizeleri, kübik
yol uzunluğu (örnekleme). Saf, test edilebilir.

---

## 5. Dosya planı

**Yeni (saf çekirdek):** `src/core/seri/aylikIzgara.ts` · `zincir.ts` ·
`acilisCizelgesi.ts` · `gokGeometrisi.ts` (+ testleri)

**Yeni (sunum):** `screens/Seri/SeriSekmesi.tsx` · `GokPaneli.tsx` (tek Svg) ·
`Tesbih.tsx` · `sabitler.ts` (sahne renkleri, zamanlama sabitleri)

**Değişen:** `IstatistikSayfasi.tsx` — dördüncü sekme eklenir; mevcut üç sekme
**değişmez**.

---

## 6. Test planı

| Dosya | Neyi korur |
|---|---|
| `aylikIzgara.test.ts` | Temmuz 2026 → 2 gün Haziran'dan, 2 gün Ağustos'tan; 31 günlük ay + pazar başlangıcı; gelecek gün işaretleme |
| `zincir.test.ts` | Bağ yalnız `zincirKorur` günler arasında; ay sınırında bağ **kurulur**; satır sarması işaretlenir; `ikisiTam` yalnız 5/5–5/5'te |
| `acilisCizelgesi.test.ts` | **Nöbetçi: hiçbir bağ öncekinin bitişinden önce başlamaz**; kopuk zincirde es; toplam süre makul sınırda (< 5 sn) |
| `gokGeometrisi.test.ts` | Merkez hesabı; kübik yol uzunluğu örneklemesinin doğruluğu (bilinen bir eğriye karşı) |
| `SeriSekmesi.test.tsx` | Sekme render olur; boş veride çökmez; azaltılmış hareket açıkken animasyon kurulmaz |

**Test tuzakları (AGENTS.md):** sahte zamanlayıcı **kullanma** — bu tam-sayfa
render'dır ve CI'da asılır; mock bileşenlere **çocuk render ettirme**;
`react-native-svg` testte mock'lanmalı (native köprü).

---

## 7. Kapsam dışı (bilinçli)

- Aylar arası gezinme (`‹ ›` okları) — referansta görünür ama **bu spec'te
  uygulanmaz**; ilk sürüm içinde bulunulan ayı gösterir. Oklar ya gizlenir ya
  da sonraki iş olarak açılır.
- Bir güne dokunma / detay açma.
- Yıllık görünüm, ısı haritası, paylaşılabilir görsel.
- Rozet ekranıyla birleştirme.

## 8. Doğrulama

`npm run verify` geçmelidir. Ayrıca uygulama, referans dosyayla **yan yana**
karşılaştırılmalıdır — sapma varsa bu spec'in başındaki kural işler.
