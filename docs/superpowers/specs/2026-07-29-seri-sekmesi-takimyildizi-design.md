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
  `kılınan >= tamGunEsigi`. Bu, motorun **gün-başına** kuralıyla (`gunTamMi`)
  birebir aynıdır — yeni bir yorum üretilmez.
- **AMA motorun seri SAYISI bundan ibaret değildir (bilinçli fark):** 7+ günlük
  bir seri koptuğunda motor **toparlanma modu** açar ve 3 tam günle önceki seriyi
  **kurtarır** (`SeriHesaplayiciServisi:319-376`). Böyle bir durumda başlıktaki
  `mevcutSeri` kopukluk öncesini içerirken harita kopukluğu gösterir. Bu
  **kapsam dışıdır ve kasıtlıdır**: harita *gün-bazlı gerçeği*, başlık *motorun
  seri sayısını* gösterir. Harita toparlanmayı görselleştirmeye çalışmaz.
  Kullanıcı çelişki hissederse çözüm ileride "toparlanma şeridi" eklemektir,
  haritayı motora uydurmak değil.
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
Hiçbir renk koda gömülmez — aşağıdaki **gök sahnesi tonları hariç**. Bunlar
temada karşılığı olmayan, koyu sahneye özgü dekoratif tonlardır ve
`src/presentation/screens/Seri/sabitler.ts`'de, gerekçesiyle birlikte, **tek
yerde** toplanır (tam liste; yeni ton eklemek spec değişikliğidir):

| Ton | Kullanım |
|---|---|
| `#080B16` `#111830` `#1B2440` `#17203C` | gök zemini katmanları |
| `#F2F6FF` | yıldız ışığı (ışın + çekirdek) |
| `#FFFFFF` | 5/5 çekirdeği |
| `#4E5A7C` | sönük (kılınmamış) ışın |
| `#6B77A0` | kılınmamış gün çekirdeği |
| `#4A5470` | gelecek gün noktası |
| `#9AA6C4` | dondurulmuş gün halkası ve çekirdeği |
| `#828EB0` | gün numaraları |
| `#8994AF` | gün adları (P S Ç…) |
| `#E8EDF8` | ay adı başlığı |
| `#8892AC` | ay gezinme okları |

**Gövde metni ve etiketler bu listeye girmez** — onlar daima tema token'ıdır.
Tesbih boncuğunun ışık noktası da bu listeye GİRMEZ — `Tesbih.tsx` kendi tema
token'ı `renkler.birincilMetin`'i kullanır, gök sahnesinin sabit tonu DEĞİL.

**Kontrast düzeltmesi (son inceleme):** gün numaraları/gün adları eski
tonları (`#63709A` / `#6E7897`) gök panelinin en açık zemin noktasına
(`ZEMIN_VURGU_SOL_UST` = `#1B2440`; `GokPaneli`'ndeki `zeminSolUst` radial
vurgunun cx %22/cy %8 merkezinde tam opaklıkla çıkan nokta — tam olarak gün
harflerinin ve ilk satır gün numaralarının durduğu bölge) karşı sırasıyla
yalnız **3.14:1** ve **3.49:1** veriyordu; AA eşiği (4.5:1, 18.66px altı
metin) altında (AGENTS.md'de kayıtlı kontrast tuzağının aynısı — PR
#139/#166). Yeni tonlar, **en açık zemin noktasına karşı ölçülerek**
seçildi (`kontrastOrani`, `src/core/utils/kontrastOrani.ts`):
- `#828EB0` (gün numaraları) → `#1B2440`'a karşı **4.69:1**, `#080B16`'ya
  (en koyu zemin ucu) karşı **6.02:1**.
- `#8994AF` (gün adları) → `#1B2440`'a karşı **5.04:1**, `#080B16`'ya karşı
  **6.47:1**.

Aynı mavi-gri ailede kalındı ve orijinal hiyerarşi (gün adları, gün
numaralarına göre biraz daha açık) korundu.

### Tesbih (rozet ilerlemesi)

Sıralı daireler tesbih okunmuyordu. Üç öğe zorunlu:
1. **İp boncukların İÇİNDEN geçer** — aralarına çizgi parçası konmaz.
2. **Durak diskleri** — her 7 boncukta bir ince dikey disk.
3. **İmame + püskül** — sonda uzun gövde, tepe düğmesi, üç telli püskül.
   **İmame hedeftir**: ipin ucundaki varış noktası, yani rozet.

Boncuklara üst-sol ışık noktası konur (düz daire değil, küre).

**Boncuk sayısı — referansın kapatmadığı iki durum (burada kapatılıyor):**
Rozet eşikleri 7, 21, **60, 90**'dır (`SERI_HEDEFLERI`). Referans 21 boncukla
tasarlandı; 60 veya 90 boncuk aynı şeride **sığmaz** (okunamaz küçülür).
Ayrıca `sonrakiHedefiBul` seri ≥ 90 iken **`null` döner**.

Kural:
- `boncukSayisi = min(hedef, 33)` — 33 geleneksel tesbih sayısıdır, üst sınır
  olarak da doğal.
- `hedef <= 33` ise **bir boncuk = bir gün**, durak her 7'de bir.
- `hedef > 33` ise bir boncuk = `ceil(hedef/33)` gün, durak her **11**'de bir
  (33'lük tesbihin geleneksel bölünmesi). Alt yazı gerçek sayıyı taşır:
  "Kararlılık rozetine 18 gün kaldı".
- `hedef === null` (tüm rozetler kazanılmış) → tesbih **tam dolu** çizilir,
  alt yazı "Tüm rozetleri tamamladınız".

Bu iki durum **referansta yok**; uygulanmadan önce referansa eklenmelidir
(referans bağlayıcıysa boşluğu da referansın boşluğudur).

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
35 ayrı native view, bir `onLayout` ölçüm turu, ve yol uzunluğu için mount
sonrası imperatif native çağrı.

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

`react-native-svg`'nin `FeGaussianBlur`'ü Android'de **yaklaşık ve sınırlıdır**
(kaynakta doğrulandı, `android/.../FeGaussianBlurView.java`): deprecated
RenderScript `ScriptIntrinsicBlur` kullanır, yarıçap **25'e sabitlenir**,
`stdDeviation` sezgisel olarak ×2 ölçeklenir, `edgeMode` desteklenmez.
Referanstaki `drop-shadow` ve `blur` **taşınmaz**; yerine **katmanlı sahte
parlama**:

- Hâle: geniş + çok düşük opaklıkta daire, altında dar + biraz daha opak daire.
- Işın parlaması: parlak ince çizginin **altına** daha kalın, düşük opaklıklı
  ikinci bir çizgi.

**Dikkat — yarım doğru bir benzetmeye kanmayın:** referansın `disBloom`/`icBloom`
daireleri düz düşük-opaklık daireler DEĞİL, CSS `blur(7px)/blur(5px)` ile
yumuşatılmış dairelerdir. Filtresiz düz daire **sert kenarlı** görünür. RN'de
hâle daireleri **`RadialGradient` dolgusuyla** (merkezde renk → kenarda şeffaf)
kurulur; yumuşaklık gradyandan gelir, filtreden değil. Aynı teknik ışınlara ve
çekirdeğe genişletilir.

### 3.3 Gök zemini: CSS radial-gradient YOK

`RadialGradient` + `LinearGradient` **`react-native-svg` içinde** kurulur (aynı
tuvalde, en altta). `expo-linear-gradient` yalnız doğrusal olduğu için tek
başına yetmez.

### 3.4 Zincirin çizilmesi: `strokeDashoffset`

`Animated.createAnimatedComponent(Path)` + Reanimated `useAnimatedProps`.

**Yol uzunluğu JS'te hesaplanır.** `getTotalLength()` `react-native-svg`'de
**vardır** (`Shape.tsx:332`, native `RNSVGRenderableModule` üzerinden) — ama
imperatif bir ref + native çağrı gerektirir: mount'tan önce kullanılamaz,
jest'te native modül yoktur, ve çizelgeyi saf tutmayı imkânsız kılar. Bu yüzden
**bilerek kullanılmaz**: düz bağlar için Öklid mesafesi, satır sarması kübik
eğrisi için **örnekleme** (16 adım, hata < %0.5). Saf fonksiyon, test edilir.

### 3.5 Sürekli parıltı — Svg prop'u DEĞİL, üstteki katman

Referans `filter: brightness()` ile parıldıyor; **RN'de bunun karşılığı yok**.
Naif çözüm (yıldızın Svg prop'unu sonsuz animasyonlamak) 20 sonsuz animasyonun
her karede ~420 düğümlük tuvali geçersiz kılmasına yol açar — düşük-uç Android'de
jank/pil riski.

**Doğrusu:** parıltı, yıldızın **üstüne konan küçük bir `Animated.View`'in
`opacity`'si** ile yapılır (yıldız merkezinde, hâle rengiyle dolu, yuvarlak).
Kompozitör katmanında animasyonlanır, Svg ağacı **hiç yeniden çizilmez**.
Reanimated `withRepeat(withDelay(...), -1, true)`; süre ve gecikme yıldız başına
farklı (faz farkı korunur).

Tek-atımlık açılış animasyonu (22 yol + giriş) Svg prop animasyonu olarak
kalabilir — sonsuz değil, bir kez koşar.

### 3.6 Açılış animasyonu: MOUNT'ta bir kez (`useFocusEffect` DEĞİL)

`IstatistikSayfasi` sekmeleri react-navigation sekmesi **değildir** — yerel
`useState` ve koşullu render (`aktifTab === 'seri' && <SeriSekmesi/>`).
Dolayısıyla `useFocusEffect` iç sekme geçişinde **tetiklenmez**; doğru mekanizma
değildir.

Koşullu render sayesinde `SeriSekmesi` sekmeye her girişte **yeniden mount olur**.
Bu yüzden kural: **mount'ta bir kez oynat, mount süresince veri değişiminde
TEKRAR OYNATMA** (`oynatildi` ref'i). Aksi halde kullanıcı bir günü
işaretlediğinde tüm ay yeniden örülür.

### 3.7 Gün numaraları

Aynı tuvalde `<Text>` (react-native-svg) olarak çizilir; ayrı RN `Text` katmanı
konumlandırma sorunları doğurur. İki tuzak: `alignmentBaseline` Android'de
kısmi/atipik → dikey hizalama **`dy` ile elle** yapılır; `tabular-nums`
karşılığı yoktur → rakam genişliği birebirlik beklenmez (sistem fontunda
rakamlar çoğunlukla zaten eşit genişliktedir).

### 3.8 İLK İŞ: runtime spike'ı

`react-native-svg` `package.json`'da doğrudan bağımlılıktır ama **`src/` içinde
hiç kullanılmamıştır** — yani her release'te derlenmiş ama Fabric altında
**runtime'da hiç çalıştırılmamıştır**. Aynı şekilde `useAnimatedProps` +
`strokeDashoffset` kombinasyonu bu projede denenmemiştir.

Bu yüzden ilk adım kod değil **spike**: emülatörde tek `Svg` + bir `RadialGradient`
+ Reanimated ile animasyonlanan tek bir `Path` (`strokeDashoffset`) çalıştırılır.
Bilinen tuzak: `strokeDasharray` **statik** prop olarak verilmeli, yalnız
`strokeDashoffset` animasyonlanmalıdır. Spike geçmeden gerisi yazılmaz —
AGENTS.md'nin "`npm run verify` build'i göstermez" ilkesinin runtime ikizi.

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

### Adaptör katmanı (spec'in atladığı halka — açıkça yazıldı)

`localTarihAraligindakiNamazlariGetir` `ApiYanit<GunlukNamazlar[]>` döner;
`GunlukNamazlar.namazlar` bir `Namaz[]`'dır ve `NAMAZ_ISIMLERI` sırasındadır
(Sabah, Öğle, İkindi, Akşam, Yatsı) — bu sıra **ışın sırasıyla birebir aynıdır**.
Saf çekirdeğe girmeden önce bir adaptör bunu `Record<tarih, boolean[5]>`'e
çevirir. Adaptör **sunum tarafında** yaşar (`useSeriAyi` hook'u), core'da değil;
core `ApiYanit`/`GunlukNamazlar` tiplerini tanımaz.

**Hata yolu ZORUNLU:** `basarili: false` geldiğinde ekran **sonsuz spinner'da
kalmamalı** (AGENTS.md'nin yaşanmış "sessiz sonsuz spinner" dersi). Boş gök +
kibar bir mesaj ("Geçmiş kayıtlarınız okunamadı") + yeniden dene gösterilir.

### Dondurulmuş günler: ARALIK → TARİH KÜMESİ

`OzelGunKaydi` bir **aralıktır** (`baslangicTarihi`–`bitisTarihi`), tek tarih
değil. Küme türetme kuralları:
- `gecmisKayitlar`'daki her aralık **koşulsuz** genişletilir (geçmişte
  dondurulmuş dönemlerdir).
- `aktifOzelGun` **yalnız** `ozelGunModuAktif` true iken katılır — motorun
  kapısı budur (`ozelGunAktifMi`, `SeriHesaplayiciServisi:154`). Kapıyı
  atlamak, modu kapatmış kullanıcıya dondurulmuş günler gösterir.
- Genişletme saf bir fonksiyondur (`ozelGunKumesi`), test edilir.

### "Bugün" hangi kurala göre?

Motorun günü takvim günü DEĞİLDİR: `namazGunuHesapla(new Date(), gunBitisSaati)`
— gece yarısı ile 05:00 arası **düne** sayılır. Izgaradaki "gelecek" işaretlemesi
**aynı kuralı** kullanmalıdır, yoksa gece 02:00'de açan kullanıcıya bugünü
"gelecek" diye gösteririz. `bugun` parametresi bu fonksiyondan üretilir ve saf
çekirdeğe **dışarıdan enjekte edilir** (core `new Date()` çağırmaz).

### Slice hidrasyonu — nöbetçi gerekli

`seri` slice'ını **yalnız `AnaSayfa` yükler** (`AnaSayfa.tsx:299`). İstatistik
ayrı bir sekmedir; soğuk açılışta yükleme async olduğu için hidrasyon garanti
değildir. Hidrate edilmemiş state'te `tamGunEsigi` varsayılana (5) düşer ve
**harita yanlış eşikle çizilir**. `SeriSekmesi` mount'ta `seriVerileriniYukle`
dispatch etmeli (idempotent). Nöbetçi test zorunlu — bu, AGENTS.md'de kayıtlı
"Ayarlar sayfası yanlış alarm" hatasının birebir ikizidir.

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
}): IzgaraGunu[];   // 28, 35 veya 42 hücre (pzt başlayan 28 günlük ay → 28)
```

**`src/core/seri/zincir.ts`**
```ts
export interface ZincirBagi { indeks: number; ikisiTam: boolean; satirSarmasi: boolean; }
export function zincirBaglari(izgara: IzgaraGunu[], tamGunEsigi: number): ZincirBagi[];
```
`zincirKorur` kuralı **`SeriHesaplayiciServisi.gunTamMi` ile aynı** olmalı ve
**kopyalanmaz**. Katman yönü tek yöndür: `src/core` en alttadır, `domain`'den
import EDEMEZ. Bu yüzden `gunTamMi` **core'a taşınır** (`src/core/seri/gunTamMi.ts`)
ve `SeriHesaplayiciServisi` onu oradan import eder. Davranış birebir korunur;
mevcut seri testleri nöbetçidir.

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

## 4b. Erişilebilirlik

Salt-Svg bir panel ekran okuyucuya **hiçbir şey** söylemez. Zorunlu:

- **Gök paneli** tek bir erişilebilir düğümdür (`accessible`,
  `accessibilityRole="image"`) ve özet etiket taşır:
  *"Temmuz 2026. 18 gün hedef tutuldu, 12 günde beş vakit tamamlandı,
  2 gün dondurulmuş. Mevcut seri 15 gün."* Etiket **saf bir fonksiyondan**
  üretilir (`gokErisimEtiketi`) ve test edilir.
- **Tesbih** ilerleme etiketi taşır: *"Alışkanlık ustası rozeti: 21 günün 15'i
  tamamlandı."* (referansta zaten `aria-label` olarak var).
- Sekme düğmesi `accessibilityRole="tab"` + `accessibilityState={{selected}}`
  — mevcut üç sekmeyle aynı desen.
- Dokunma hedefleri ≥44dp (sekme düğmesi).

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
| `aylikIzgara.test.ts` | Temmuz 2026 → 2 gün Haziran'dan, 2 gün Ağustos'tan; **Şubat 2027 (pzt başlar, 28 gün) → tam 28 hücre**; gelecek gün işaretleme; `bugun` gece 02:00 kuralıyla enjekte edildiğinde bugünün 'gelecek' sayılmaması |
| `zincir.test.ts` | Bağ yalnız `zincirKorur` günler arasında; ay sınırında bağ **kurulur**; satır sarması işaretlenir; `ikisiTam` yalnız 5/5–5/5'te |
| `acilisCizelgesi.test.ts` | **Nöbetçi: hiçbir bağ öncekinin bitişinden önce başlamaz**; kopuk zincirde es; toplam süre makul sınırda (< 5 sn) |
| `gokGeometrisi.test.ts` | Merkez hesabı; kübik yol uzunluğu örneklemesinin doğruluğu (bilinen bir eğriye karşı) |
| `ozelGunKumesi.test.ts` | Aralık→küme genişletmesi; `ozelGunModuAktif` kapalıyken `aktifOzelGun` **katılmaz**; `gecmisKayitlar` koşulsuz katılır |
| `gokErisimEtiketi.test.ts` | Özet etiket metni; boş ayda çökmez |
| `SeriSekmesi.test.tsx` | Sekme render olur; **okuma reddedilince sonsuz spinner YOK, hata durumu görünür**; mount'ta `seriVerileriniYukle` dispatch edilir; azaltılmış hareket açıkken animasyon kurulmaz |

### Mock reçeteleri — ikisi de ZORUNLU, repoda henüz YOK

- **`react-native-svg`**: repoda hiç mock'u yok (`__mocks__/` altında sadece
  expo-audio, expo-location, expo-notifications, sesDosyasiMock var).
  `jest.config.js` onu `transformIgnorePatterns` beyaz listesine almış ama mock
  kurulmamış. `SeriSekmesi.test.tsx` için per-file mock yazılır (repo deseni
  budur) — `Svg`, `Path`, `Circle`, `Line`, `G`, `Text`, `Defs`,
  `RadialGradient`, `Stop` düz `View`/`Text`'e indirgenir. **Çocuk render
  ETTİRME** (CI timeout dersi).
- **`react-native-reanimated`**: mevcut reçete `KibleSayfasi.test.tsx:41-45`
  (`require('react-native-reanimated/mock')`). Aynısı kullanılır.

### Test tuzakları (AGENTS.md)

- Sahte zamanlayıcı **kullanma** — tam-sayfa render'dır, CI'da asılır.
- `AccessibilityInfo.isReduceMotionEnabled()` **async**'tir → "asenkron hook'lu
  sayfa testinde `act` uyarısı" tuzağı birebir geçerli. Mevcut örnek:
  `AyarCapasi.test.tsx:141` (`jest.spyOn(...).mockResolvedValue(...)`).
- Mock bileşenlere çocuk render ettirme.

---

## 6b. Uygulama iki faza bölünür

Tek plana sığar ama sınırdadır ve teknik risk baştadır. Doğal kırılma:

**Faz 1 — çekirdek + statik render.** Runtime spike'ı (§3.8) · saf modüller
(`aylikIzgara`, `zincir`, `gokGeometrisi`, `ozelGunKumesi`, `gunTamMi` taşıması,
`gokErisimEtiketi`) + testleri · animasyonsuz gök paneli · tesbih · sekme
entegrasyonu · hidrasyon + hata yolu. **Tek başına teslim edilebilir** ve riskli
soruları (Fabric'te Svg, animasyonlu Path) erkenden yanıtlar.

**Faz 2 — hareket.** `acilisCizelgesi` + testi · zincirin sıralı çizilmesi ·
giriş kademeleri · sürekli parıltı (overlay tekniği) · bugünün nabzı ·
azaltılmış hareket.

## 7. Kapsam dışı (bilinçli)

- Aylar arası gezinme (`‹ ›` okları) — referansta görünür ama **bu spec'te
  uygulanmaz**; ilk sürüm içinde bulunulan ayı gösterir. Oklar ya gizlenir ya
  da sonraki iş olarak açılır.
- Bir güne dokunma / detay açma.
- Yıllık görünüm, ısı haritası, paylaşılabilir görsel.
- Rozet ekranıyla birleştirme.
- **Toparlanma modunun görselleştirilmesi** (bkz. §1 Zincir). Harita gün-bazlı
  gerçeği gösterir; motorun kurtardığı seri yalnız başlık sayısında görünür.

## 8. Doğrulama

`npm run verify` geçmelidir. Ayrıca uygulama, referans dosyayla **yan yana**
karşılaştırılmalıdır — sapma varsa bu spec'in başındaki kural işler.
