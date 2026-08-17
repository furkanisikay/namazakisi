# Plan 1 — Ayarlar: bilgi mimarisi, dinamik özetler, kurulum sağlığı

**Spec:** `docs/superpowers/specs/2026-07-29-ayarlar-sayfasi-yeniden-kurulum-design.md`
**Dal:** `fix/muhafiz-kapali-adim-etiketi` (üç iş aynı dalda toplanıyor)
**Kapsam:** Spec §7 "Plan 1". Arama / çapa / vurgulama / büyük başlık **bu planda YOK** (Plan 2).

## Global Constraints

- **`npm run verify` (typecheck + lint + test) GEÇMELİDİR.** Geçmiyorsa iş bitmemiştir.
- Kibar **"siz"** dili, sentence case, aktif fiil (AGENTS.md). İbadet-çağrı "sen"
  istisnası bu ekranlarda **geçerli değildir**.
- **ASLA hardcoded renk.** Tümü `useRenkler()`. `durum.*` renkleri **yalnız
  dekoratif** (ikon rengi, sol şerit, tint arkaplan); gövde metni daima
  `renkler.metin` / `renkler.metinIkincil`. Gerekçe: `durum.uyari` = `#FFC107`,
  beyaz üzerinde ~1.63:1 → WCAG AA kırılır.
- **`Alert.alert` KULLANILMAZ.** Gerekirse `BildirimModali`.
- Dokunma hedefleri **≥44dp** (`w-11 h-11`), `accessibilityRole` +
  `accessibilityLabel` zorunlu.
- Switch, satırı saran `TouchableOpacity`'nin **İÇİNE değil KARDEŞİNE** konur.
- Yeni bağımlılık **eklenmez**. `android/`, CI, sürüm numarası, `package.json`
  **değiştirilmez**.
- `src/core/` içindeki yeni modüller **saf** olmalı: store'a, React'a,
  AsyncStorage'a bağımlı olmamalı; girdilerini parametre olarak almalı.
- Dokunulan dosyaya **yeni lint warning eklenmez**. Kullanılmayan catch
  parametresi için `catch { }` yaz (`catch (_)` warning üretir).

---

## Task 1 — `ozetler.ts` (saf özet fonksiyonları)

**Yeni dosya:** `src/core/ayarlar/ozetler.ts`
**Yeni test:** `src/core/ayarlar/__tests__/ozetler.test.ts`

Her fonksiyon saf; yalnız verilen girdiden dize üretir. Hiçbiri `import`
etmemeli: store, React, AsyncStorage, native modül.

### İmzalar ve beklenen çıktılar

```ts
// Tipleri DOSYA İÇİNDE yerelleştir (AGENTS.md: core/domain store'a bağımlı olamaz).
// Yapısal uyum yeterlidir — slice tiplerini import ETME.
```

### Konum: MEVCUT tek kaynak yeniden kullanılır — ikiz YAZMA

`konumMetniHesapla` **zaten var** (`src/presentation/hooks/useKonumMetni.ts:8`),
kendini "KonumAyarlari ve MuhafizAyarlari ekranları için tek kaynak" ilan ediyor
ve bayat-şehir kuralını (oto modda `gpsAdres`, manuel modda `seciliIlceAdi, seciliIlAdi`)
**zaten doğru** uyguluyor. İkinci bir kopyasını yazmak AGENTS.md'nin "ikizler
ayrışırsa" dersinin tam ihlalidir.

Yapılacak:
1. `konumMetniHesapla`'yı **`src/core/ayarlar/konumMetni.ts`**'ye taşı. Girdi tipini
   dosya içinde yerelleştir (store'dan `KonumAyarlari` import ETME; yapısal uyum
   yeter: `{ konumModu, gpsAdres, seciliIlAdi, seciliIlceAdi }`). Davranışı
   **birebir koru** — dize çıktıları değişmemeli.
2. `useKonumMetni.ts` onu yeniden dışa aktarsın (`export { konumMetniHesapla } from …`)
   ki mevcut tüketiciler değişmesin.
3. `ozetler.ts`:

```ts
konumOzeti(konum: KonumMetniGirdisi): string
// `${konumMetniHesapla(konum)} · ${konum.konumModu === 'oto' ? 'otomatik' : 'manuel'}`
// örn. "Kadıköy, İstanbul · otomatik"  |  "Konum takip ediliyor · otomatik"
```

**Nöbetçi test şart:** `seciliIlAdi: 'İstanbul'` + `gpsAdres: { il: 'Erzurum' }` +
`konumModu: 'oto'` → çıktı **Erzurum** içerir, **İstanbul içermez**.

```ts
takvimOzeti(aktif: boolean): string
// true -> "Açık"   false -> "Kapalı"

muhafizOzeti(g: { aktif: boolean; yogunluk: 'hafif'|'normal'|'yogun'|'ozel' }): string
// kapalı -> "Kapalı"
// açık   -> "Açık · normal yoğunluk" ('ozel' -> "Açık · özel ayarlar")

bildirimOzeti(vakitler: Record<string, boolean>, cumaAktif: boolean): string
// 0 açık, cuma kapalı -> "Kapalı"
// n>0 -> "3 vakit" ; cuma açıksa " · cuma hatırlatması açık" eklenir
// 0 açık ama cuma açık -> "Yalnız cuma hatırlatması"

seriOzeti(g: { tamGunEsigi: number; gunSonuBildirimAktif: boolean }): string
// "Tam gün: 5 namaz · gün sonu açık" | "... · gün sonu kapalı"

ramazanOzeti(iftarAktif: boolean, sahurAktif: boolean): string
// ikisi de -> "İftar ve sahur sayacı açık"
// yalnız iftar -> "İftar sayacı açık" ; yalnız sahur -> "Sahur sayacı açık"
// hiçbiri -> "Kapalı"

gorunumOzeti(temaModu: 'acik'|'koyu', paletAdi: string): string
// "Koyu tema · Zümrüt"
// DİKKAT: girdi ÇÖZÜLMÜŞ mod olan `useTema().tema.mod`'dur ('acik'|'koyu').
// `useTema().mod` AYRI bir değerdir ve 'sistem' de olabilir (TemaContext) —
// onu geçmek tip hatası verir. Bkz. Task 4.

yedeklemeOzeti(sonDisaAktarmaISO: string | null, simdi: Date): string
// null -> "Henüz dışa aktarılmadı"
// dolu -> "Son dışa aktarma: 12 Temmuz"  (gün + Türkçe ay adı; aynı yıldaysa yıl
//          YAZILMAZ, farklı yılsa "12 Temmuz 2025")
// `simdi` ZORUNLU parametredir: "aynı yıl" kuralı bugünün yılına bağlı ve
// fonksiyon içinde `new Date()` çağırmak testi yılbaşında kırardı
// (AGENTS.md "testlerde sabit tarih yazma" dersinin ikizi).

hakkindaOzeti(surum: string, guncellemeVar: boolean): string
// "Sürüm 0.23.28 · güncel" | "Sürüm 0.23.28 · güncelleme var"
```

**Tarih biçimi:** `Intl` KULLANMA (Hermes'te ICU garanti değil — AGENTS.md).
Ay adları için dosya içinde sabit dizi kullan (`['Ocak', … ,'Aralık']`).

### Test kapsamı
- Her fonksiyonun her dalı.
- **Nöbetçi:** oto modda `gpsAdres` okunur, `seciliIlAdi` okunmaz (yukarıdaki
  Erzurum/İstanbul senaryosu).
- `konumMetni.ts` taşımasının davranışı değiştirmediği: taşınan fonksiyonun
  mevcut dört dalı (oto+ilçe+il, oto+yalnız il, oto+gpsAdres yok, manuel).
- Boş/eksik girdide çökmeme (`gpsAdres: null`, boş `vakitler` nesnesi).
- Yıl geçişi: `simdi` **enjekte edilerek** — geçen yıla ait damga yıl içerir,
  aynı yıla ait içermez.

---

## Task 2 — `kurulumSagligi.ts` (saf sağlık kontrolleri)

**Yeni dosya:** `src/core/ayarlar/kurulumSagligi.ts`
**Yeni test:** `src/core/ayarlar/__tests__/kurulumSagligi.test.ts`

```ts
export type SorunSeviyesi = 'kritik' | 'uyari' | 'bilgi';

export interface Sorun {
  id: 'bildirimIzni' | 'konumAlinamadi' | 'hatirlatmaYok' | 'konumBayat';
  seviye: SorunSeviyesi;
  baslik: string;
  aciklama: string;
  eylemEtiketi?: string;
  hedefSayfa?: string;   // AyarlarStack ekran adı; Plan 2'de tiplenecek
}

export interface SaglikGirdisi {
  izinDurumu: 'verildi' | 'reddedildi' | 'belirsiz';
  konumModu: 'oto' | 'manuel';
  sonGpsGuncellemesi: string | null;   // ISO
  akilliTakipAktif: boolean;
  muhafizAktif: boolean;
  acikVakitBildirimSayisi: number;
  /** Test edilebilirlik için ENJEKTE edilir — `new Date()` çağırma. */
  simdi: Date;
}

export function kurulumSagligi(g: SaglikGirdisi): Sorun[]
```

Dönen dizi **öncelik sırasıyla** sıralıdır (kritik → uyarı → bilgi; aynı
seviyede aşağıdaki tablo sırası).

| id | Koşul | Seviye | Başlık | Açıklama | Eylem → sayfa |
|---|---|---|---|---|---|
| `bildirimIzni` | `izinDurumu === 'reddedildi'` | kritik | "Bildirim izni kapalı" | "Uygulama bildirimleri size ulaşamıyor." | "İzni açın" → **sistem ayarları** |
| `konumAlinamadi` | `konumModu === 'oto' && !sonGpsGuncellemesi` | kritik | "Konumunuz alınamadı" | "Vakitler varsayılan konuma göre hesaplanıyor." | "Konumu ayarlayın" → `KonumAyarlari` |
| `hatirlatmaYok` | `!muhafizAktif && acikVakitBildirimSayisi === 0` | uyari | "Vakit hatırlatmaları kapalı" | "Ne muhafız ne de vakit bildirimleri açık." | "Hatırlatmaları açın" → `MuhafizAyarlari` |
| `konumBayat` | `akilliTakipAktif && sonGpsGuncellemesi` 7+ gün eski | bilgi | "Konumunuz 7 günden eski" | "Şehir değiştiyseniz vakitler kaymış olabilir." | "Konumu yenileyin" → `KonumAyarlari` |

**`(0,0)` KONTROLÜ YOK — bilinçli.** `VARSAYILAN_KONUM_AYARLARI` İstanbul
koordinatıyla başlar (`LocalKonumServisi:77`); `konumSlice` hiçbir yolda `(0,0)`
üretmez, kontrol ölü kod olurdu. `(0,0)` nöbetçisi yalnız ham AsyncStorage okuyan
arka plan servisleri içindir.

`konumBayat`, `konumAlinamadi` ile **aynı anda dönmez** (ikincisi zaten
`sonGpsGuncellemesi` yokluğunu kapsar; `konumBayat` damganın VAR olmasını ister).

**`bildirimIzni` açıklaması muhafız durumundan BAĞIMSIZ olmalı.** "Namaz muhafızı
çalışıyor ama uyarılar ulaşmıyor" gibi bir metin, muhafızı kapalı olan kullanıcıya
yalan söyler — koşul yalnız izin durumuna bakıyor. Nötr metin kullan.

**`bildirimIzni` eylemi `BildirimAyarlari`'na GİTMEZ — çıkmaz sokaktır.** O sayfada
izin isteme veya sistem ayarını açma akışı yok; ayrıca kalıcı reddedilmiş izinde
`requestPermissionsAsync` diyalog bile açmaz. Butona basınca `Linking.openSettings()`
çağrılır. `Sorun` tipine bunun için `hedefSayfa` yerine ayrımı taşıyan bir alan
gerekir: `eylem?: { tip: 'sayfa'; sayfa: string } | { tip: 'sistemAyarlari' }`.

### Test kapsamı
- Her kontrolün tetiklendiği ve tetiklenmediği durum.
- Sorunsuz girdide **boş dizi**.
- Sıralama: birden çok sorun varken kritik önce.
- Sınır: tam 7 gün / 7 gün 1 dk (`simdi` enjekte edilerek — `new Date()` yok).
- `konumModu === 'manuel'` iken `konumAlinamadi` **dönmez**.
- **Nöbetçi:** `izinDurumu === 'belirsiz'` iken `bildirimIzni` **dönmez**
  (yalnız `'reddedildi'` tetikler — yanlış alarm, uyarıyı hiç vermemekten kötüdür;
  AGENTS.md'deki TTS `null` kuralının ikizi).

---

## Task 3 — Altyapı: izin okuma + dışa aktarma damgası

### 3a. `izinDurumunuOku` — AYRI dosyada

**Yeni dosya:** `src/domain/services/BildirimIzinOkuyucu.ts`
**Yeni test:** `src/domain/services/__tests__/BildirimIzinOkuyucu.test.ts`

```ts
/**
 * SALT OKUR — izin İSTEMEZ. `BildirimServisi.izinIste()` izin yoksa
 * requestPermissionsAsync ile DİYALOG AÇAR; Ayarlar sayfası onu çağırırsa
 * ekrana her girişte izin penceresi fırlar.
 */
export const izinDurumunuOku = async (): Promise<'verildi' | 'reddedildi' | 'belirsiz'>
```

`Notifications.getPermissionsAsync()` → `status === 'granted'` → `'verildi'`;
`'denied'` → `'reddedildi'`; diğer/hata → `'belirsiz'`. **Hata fırlatmaz**
(`catch { return 'belirsiz'; }`).

**Neden `BildirimServisi.ts` içine DEĞİL — bu tasarımın önemli bir parçası:**
`BildirimServisi` `ArkaplanMuhafizServisi`'ni import ediyor, o da
`modules/expo-countdown-notification/src` **native köprüsünü** çekiyor. Fonksiyonu
oraya koymak, `useAyarOzetleri` üzerinden `AyarlarSayfasi.test.tsx`'e o ağır
grafiği taşır ve test dosyası köprüyü mock'lamazsa suite **hiç çalışmaz**
(AGENTS.md `requireNativeModule` tuzağı). Ayrı dosya yalnız `expo-notifications`
import eder — o da zaten global mock'ludur (`jest.config.js` → `__mocks__/expo-notifications.js`).

Testte global mock `getPermissionsAsync`'i `'granted'` sabitli döndürür; üç durum
`mockResolvedValueOnce` ile ezilir.

### 3b. Son dışa aktarma damgası

**Değişen:** `src/core/constants/UygulamaSabitleri.ts` — `DEPOLAMA_ANAHTARLARI`'na:

```ts
/** Son dışa aktarma zamanı (ISO). Cihaza özgü eylem geçmişi — YEDEĞE GİRMEZ. */
SON_DISA_AKTARMA: '@namaz_akisi/son_disa_aktarma',
```

`@namaz_akisi/` öneki **zorunlu** — `onEkiOlanAnahtarlar(önek)` tarayan kodlarla
çakışmasın (AGENTS.md).

**Değişen:** `src/domain/services/YedeklemeServisi.ts` — `yedeginiPaylas`
içinde, `Sharing.shareAsync` çağrısı **başarıyla döndükten SONRA** damgayı yaz.
`Sharing.isAvailableAsync()` false dönüp paylaşım hiç açılmadıysa **yazma**.

- **API:** `Depolama.yaz(anahtar, degerISO)` ile yaz, `Depolama.oku` ile oku
  (JSON çifti). `hamYaz` + `oku` karışımı yapma: `oku` JSON.parse ettiği için ham
  ISO dizesi parse hatası verir → damga sessizce hep "yok" görünür.
- **Kendi `try/catch`'inde olmalı** (`catch { }` + `Logger`). Paylaşım başarılıyken
  `Depolama.yaz` reddederse `yedeginiPaylas` reddolur ve UI, aslında başarılı olan
  paylaşımı hata gibi gösterir.

Damganın anlamı: *"yedek dosyası oluşturuldu ve paylaşım açıldı"* — Android
kullanıcının dosyayı gerçekten kaydettiğini bildirmez, bu yüzden kullanıcıya
gösterilen metin de "yedek alındı" değil **"son dışa aktarma"**dır.

**`YedekBirlestirmeServisi.AYAR_ANAHTARLARI`'na EKLEME** (bilinçli): yedeğe
girseydi içe aktarma başka cihazın damgasını taşırdı.

### Test kapsamı
- `izinDurumunuOku`: üç durum + `getPermissionsAsync` reddederse `'belirsiz'`.
- Damga: paylaşım başarılıysa yazılır; `isAvailableAsync` false ise yazılmaz;
  `Depolama.yaz` reddederse `yedeginiPaylas` **yine de başarılı döner**.
- **Nöbetçi — DAVRANIŞSAL yazılmalı.** `YedekBirlestirmeServisi.AYAR_ANAHTARLARI`
  **export edilmiyor** (düz `const`), doğrudan içeriğini sınayan test yazılamaz;
  sırf test için export etmek API'yi gereksiz genişletir. Bunun yerine iki yönü de
  davranışla doğrula: (a) `ayarlariTopla` / zarf oluşturma yolunda `Depolama.oku`
  **`SON_DISA_AKTARMA` ile hiç çağrılmaz**; (b) içe aktarma planında bu anahtar
  **bulunmaz**.
- **Mevcut testleri kırma uyarısı:** `YedeklemeServisi.test.ts`'teki `Depolama`
  mock nesnesinde `yaz` **yok**. Task 3 eklenirken mock'a `yaz: jest.fn()`
  eklenmezse mevcut paylaşım testleri "Depolama.yaz is not a function" ile kırılır.

---

## Task 4 — Sunum bileşenleri + `useAyarOzetleri`

**Yeni:** `src/presentation/screens/Ayarlar/AyarGrubu.tsx` ·
`AyarSatiri.tsx` · `KurulumSagligiKarti.tsx`
**Yeni:** `src/presentation/hooks/useAyarOzetleri.ts`

### `AyarGrubu`
Props: `{ baslik: string; children }`. Başlık `renkler.birincil`, **normal
yazım**, `text-xs font-semibold`, `mx-4 mb-2`. Çocukları tek kart içinde
(`renkler.kartArkaplan`, `rounded-2xl`, `mx-4`, `shadow-sm`), aralarında
`borderTopWidth: StyleSheet.hairlineWidth` ayraç (ilk satır hariç).

### `AyarSatiri`
İki varyant, tek dosya:
- **navigasyon:** ikon çipi (`w-11 h-11`, `renkler.birincil + '15'`), başlık,
  özet, opsiyonel `YeniRozet`, sağda `chevron-right`.
- **toggle:** aynı düzen, sağda `Switch`. Switch, satırı saran
  `TouchableOpacity`'nin **KARDEŞİ** olmalı (AGENTS.md TalkBack kuralı) —
  toggle varyantında satır tıklanabilir değilse `View` kullan ve Switch'i
  doğrudan yerleştir.

Her ikisi de `useFeedback().butonTiklandiFeedback()` çağırır (mevcut davranış
korunur). `accessibilityRole="button"` / `"switch"`,
`accessibilityLabel = "<başlık>. <özet>"`.

### `KurulumSagligiKarti`
Props: `{ sorunlar: Sorun[]; onEylem: (sorun: Sorun) => void; ozetSatiri: string }`.
- `sorunlar.length === 0` → tek satır: yeşil `check-circle` + `ozetSatiri`,
  `durum.basarili + '15'` tint arkaplan.
- Aksi halde: ilk sorun tam kart. İkon çipi ve sol şerit seviyeye göre
  (`kritik`→`durum.hata`, `uyari`→`durum.uyari`, `bilgi`→`durum.bilgi`) —
  **yalnız dekoratif**. Başlık/açıklama `renkler.metin`/`metinIkincil`.
  Eylem butonu dolu `renkler.birincil` + beyaz metin.
  `sorunlar.length > 1` → "N sorun daha" dokunulabilir metni; dokununca kalan
  sorunlar aynı kartın içinde listelenir (yerel `useState`).
- **Sol şerit:** iki geçerli yol var. (a) **Tercih edilen** — `MuhafizAyarlari/VakitKarti.tsx:122-128`
  deseni: tam çerçeve (`borderWidth` hairline) + `borderLeftWidth: 4` +
  `borderLeftColor`; köşeler düzgün çizilir ve mevcut görsel dile sadıktır.
  (b) Şerit için ayrı `View`. **Kaçınılacak olan** yalnızca *tek kenarlı* border
  (diğer kenarlar 0) + `borderRadius` birleşimidir — o kırık görünür.

### `useAyarOzetleri()`
Redux'tan sync özetleri, `useFocusEffect` ile async olanları okur.

**Dönüş sözleşmesi — Task 5 bunu birebir tüketir, anahtarlar tiplenmiş olmalı:**

```ts
export interface AyarOzetleri {
  konum: string; takvim: string; muhafiz: string; bildirim: string;
  seri: string; ramazan: string; gorunum: string; yedekleme: string;
  hakkinda: string;
}

export function useAyarOzetleri(): {
  ozetler: AyarOzetleri;
  sorunlar: Sorun[];
  saglikOzetSatiri: string;
}
```

`Record<string, string>` **kullanma** — Task 4 ile Task 5 farklı ellerde yazılırsa
anahtarlar sessizce ayrışır. Tiplenmiş arayüz bunu derleme zamanında yakalar.
(*Tanı ve geri bildirim* ve *Neler yeni* satırlarının dinamik özeti yoktur; statik
metin kullanırlar.)

**`saglikOzetSatiri` biçimi** (sorun yokken kartta gösterilen tek satır):
`"Kurulumunuz eksiksiz · <konumMetni> · muhafız açık|kapalı"`
— konum kısmı `konumMetniHesapla` çıktısıdır (mod eki olmadan).

**Selector yolları (birebir; store anahtarları doğrulandı):**

```
state.konum                          -> konumModu, seciliIlAdi, seciliIlceAdi,
                                        gpsAdres, sonGpsGuncellemesi, akilliTakipAktif
state.muhafiz.aktif / .yogunluk
state.vakitBildirim.ayarlar          -> { imsak, ogle, ikindi, aksam, yatsi }
state.cumaHatirlatma.ayarlar.aktif
state.seri.ayarlar                   -> tamGunEsigi, gunSonuBildirimAktif
state.iftarSayac.ayarlar.aktif
state.sahurSayac.ayarlar.aktif
state.takvim.ayarlar.aktif
state.guncelleme.guncellemeMevcut
```

**Tema:** `const { tema, palet } = useTema();` → `gorunumOzeti(tema.mod, palet.ad)`.
`useTema().mod` **kullanma** — o kullanıcı tercihidir ve `'sistem'` olabilir.

- Async kaynaklar (`useFocusEffect` + `useCallback`): `izinDurumunuOku()` ve
  `SON_DISA_AKTARMA` okuması, `Promise.all` ile tek turda.
- **Unmount güvenliği:** effect temizliğinde `iptal` bayrağı — çözülen promise
  unmount sonrası `setState` çağırmasın.
- `kurulumSagligi({..., simdi: new Date()})` ve `yedeklemeOzeti(iso, new Date())`
  burada çağrılır — saf fonksiyonlara zamanı enjekte eden tek yer burasıdır.

---

## Task 5 — `AyarlarSayfasi` yeniden kurulumu

**Değişen:** `src/presentation/screens/AyarlarSayfasi.tsx`
**Yeni test:** `src/presentation/screens/__tests__/AyarlarSayfasi.test.tsx`

Spec §1'deki dört grup, sırasıyla. Sayfa yapısı:

```
SafeAreaView
 └ ScrollView
    ├ (varsa) YeniOzellikKarti          ← KORUNUR
    ├ KurulumSagligiKarti
    ├ AyarGrubu "Namaz vakitleri"   → Konum, Takvim entegrasyonu
    ├ AyarGrubu "Hatırlatmalar"     → Namaz muhafızı, Bildirimler,
    │                                  Seri ve hedefler, Ramazan özel
    ├ AyarGrubu "Uygulama"          → Görünüm, Titreşim(toggle), Ses efektleri(toggle)
    └ AyarGrubu "Veri ve destek"    → Yedekleme ve aktarım, Tanı ve geri bildirim,
                                       Neler yeni, Hakkında
```

### KORUNACAK davranışlar (yeniden yazımda düşmemeli)
- `useYeniOzellikler`: `kart` → `YeniOzellikKarti`, satır rozeti
  `sayfaOkunmamisMi(sayfa)`, "Neler yeni" satırında `okunmamisVarMi`,
  `menuyeGit` içinde `sayfayiGorulduIsaretle(sayfa)` (NelerYeni hariç).
- `useFeedback` dokunma geri bildirimi.
- Giriş animasyonu (fade + slide).

### Ekran adları — birebir korunmalı
`KonumAyarlari` · `TakvimAyarlari` · `MuhafizAyarlari` · `BildirimAyarlari` ·
`SeriHedefAyarlari` · `RamazanAyarlari` · **`GorünumAyarlari`** (Türkçe `ü`!) ·
`YedeklemeAktarim` · `TaniGeriBildirim` · `NelerYeni` · `Hakkinda`

Yanlış yazım sessizce navigasyonu ve `sayfaOkunmamisMi` eşleşmesini bozar.

### Büyük başlık YOK
Bu planda başlık/arama Plan 2'ye ait. Sayfa `headerShown: false` ile gelmeye
devam eder; içeriğin başına **statik** bir "Ayarlar" başlığı konur
(`text-2xl font-bold`, `mx-4`). Animasyon Plan 2'de eklenecek.

### Test kapsamı
- Dört grup başlığı render edilir.
- Bir satırın özeti gösterilir (ör. muhafız açıkken "Açık · normal yoğunluk").
- Satıra dokununca doğru ekran adıyla `navigate` çağrılır.
- **Nöbetçi:** yeni-özellik tanıtım kartı ve satır rozeti hâlâ render edilir.
- Sağlık kartı: sorun varken uyarı, sorunsuzken özet satırı.
- Toggle satırları `useFeedback` durumunu değiştirir.

### Test mock reçetesi — DİKKAT, bu repoda yeni bir durum

**`useFocusEffect` bu repoda İLK KEZ kullanılıyor** (`src/` içinde şu an sıfır
kullanım var). Mevcut tüm ekran testleri navigasyonu şöyle mock'luyor:

```ts
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
```

Bu desen aynen kopyalanırsa `useFocusEffect` **undefined** olur ve sayfa render'da
çöker. Doğrusu:

```ts
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
```

Bu mock ile async okuma **gerçek zamanda** `waitFor` ile beklenir; sahte
zamanlayıcıya gerek kalmaz → AGENTS.md'nin "fake timers + tam sayfa render =
CI'da asılma" tuzağına girilmez. `useFocusEffect`'e verilen geri çağrı
`useCallback` ile sarılmalı (aksi halde bu mock'ta her render'da yeniden koşar).

**Native köprü mock'u:** `expo-notifications` **zaten global mock'lu**
(`jest.config.js` → `__mocks__/expo-notifications.js`), ek mock gerekmez.
Gerçek risk `modules/expo-countdown-notification/src` köprüsüdür. Task 3'te
`izinDurumunuOku` ayrı dosyaya alındığı için `useAyarOzetleri` o grafiği
**çekmemeli**; yine de import zinciri ağır bir servise uzanırsa repodaki mevcut
deseni uygula (örnek: `MuhafizAyarlariSayfasi.test.tsx:46`).

**Test performansı (AGENTS.md):** mock bileşenlere **çocuk render ettirme**;
sahte zamanlayıcı kullanma; `waitFor` gerçek zamanda.

---

## Task 6 — `HakkindaSayfasi` sadeleştirme

**Değişen:** `src/presentation/screens/HakkindaSayfasi.tsx`
**Yeni test:** `src/presentation/screens/__tests__/HakkindaSayfasi.test.tsx`

**Kaldırılacak iki bölüm:**
- `DESTEK` → "Tanı ve Geri Bildirim" satırı (üst seviyeye taşındı).
- `GELİŞTİRİCİ` → "Debug Logları" satırı (Tanı sayfasında iki giriş noktası var).

Artık kullanılmayan importlar temizlenir (`useNavigation` hâlâ gerekiyorsa kalır,
gerekmiyorsa kaldırılır — lint warning bırakma).

**Kalacaklar:** logo/başlık kartı, `UYGULAMA BILGILERI`, `GÜNCELLEME` bölümü,
telif satırı.

Navigatördeki `DebugLogs` ve `TaniGeriBildirim` rotaları **SİLİNMEZ**.

### Test kapsamı
- "Debug Logları" metni **yok**.
- "Tanı ve Geri Bildirim" metni **yok**.
- "Güncelleme Kontrolü" **var** (regresyon nöbetçisi).
- Sürüm metni render edilir.

---

## Kabul kriterleri (plan geneli)

1. `npm run verify` geçer.
2. Ayarlar sayfası dört gruplu, her satır dinamik özet gösteriyor.
3. Sağlık kartı sorun varken uyarıyor, yokken tek satıra daralıyor.
4. Yeni-özellik rozeti/kartı ve dokunma geri bildirimi çalışmaya devam ediyor.
5. Hakkında'da Debug ve Tanı satırları yok; Tanı üst seviyede erişilebilir.
6. `rg "durum\.(uyari|hata)" src/presentation/screens/Ayarlar/` sonuçlarının
   hiçbiri metin rengi olarak kullanılmıyor (yalnız ikon/şerit/tint).
