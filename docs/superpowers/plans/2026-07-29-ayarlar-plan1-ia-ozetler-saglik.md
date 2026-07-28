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

export interface KonumOzetGirdisi {
  konumModu: 'oto' | 'manuel';
  seciliIlAdi: string;
  gpsAdres: { il?: string; ilce?: string } | null;
}
konumOzeti(g: KonumOzetGirdisi): string
```

**Konum kuralı (nöbetçi test şart):**
- `konumModu === 'oto'`: `gpsAdres.ilce && gpsAdres.il` → `"Kadıköy, İstanbul · otomatik"`;
  yalnız `il` → `"İstanbul · otomatik"`; `gpsAdres` yok/boş → `"Konumunuz · otomatik"`.
- `konumModu === 'manuel'`: `"<seciliIlAdi> · manuel"`.
- **`seciliIlAdi` oto modda ASLA kullanılmaz** — GPS akışı ona dokunmadığı için bayattır.

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

yedeklemeOzeti(sonDisaAktarmaISO: string | null): string
// null -> "Henüz dışa aktarılmadı"
// dolu -> "Son dışa aktarma: 12 Temmuz"  (gün + Türkçe ay adı; YIL YAZILMAZ
//          eğer aynı yıldaysa, farklı yılsa "12 Temmuz 2025")

hakkindaOzeti(surum: string, guncellemeVar: boolean): string
// "Sürüm 0.23.28 · güncel" | "Sürüm 0.23.28 · güncelleme var"
```

**Tarih biçimi:** `Intl` KULLANMA (Hermes'te ICU garanti değil — AGENTS.md).
Ay adları için dosya içinde sabit dizi kullan (`['Ocak', … ,'Aralık']`).

### Test kapsamı
- Her fonksiyonun her dalı.
- **Nöbetçi:** oto modda `gpsAdres` okunur, `seciliIlAdi` okunmaz
  (`seciliIlAdi: 'İstanbul'`, `gpsAdres: { il: 'Erzurum' }` → çıktı Erzurum içerir,
  İstanbul İÇERMEZ).
- Boş/eksik girdide çökmeme (`gpsAdres: null`, boş `vakitler` nesnesi).
- Yıl geçişi: geçen yıla ait damga yıl içerir, bu yıla ait içermez.

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
| `bildirimIzni` | `izinDurumu === 'reddedildi'` | kritik | "Bildirim izni kapalı" | "Namaz muhafızı çalışıyor ama uyarılar size ulaşmıyor." | "İzni açın" → `BildirimAyarlari` |
| `konumAlinamadi` | `konumModu === 'oto' && !sonGpsGuncellemesi` | kritik | "Konumunuz alınamadı" | "Vakitler varsayılan konuma göre hesaplanıyor." | "Konumu ayarlayın" → `KonumAyarlari` |
| `hatirlatmaYok` | `!muhafizAktif && acikVakitBildirimSayisi === 0` | uyari | "Vakit hatırlatmaları kapalı" | "Ne muhafız ne de vakit bildirimleri açık." | "Hatırlatmaları açın" → `MuhafizAyarlari` |
| `konumBayat` | `akilliTakipAktif && sonGpsGuncellemesi` 7+ gün eski | bilgi | "Konumunuz 7 günden eski" | "Şehir değiştiyseniz vakitler kaymış olabilir." | "Konumu yenileyin" → `KonumAyarlari` |

**`(0,0)` KONTROLÜ YOK — bilinçli.** `VARSAYILAN_KONUM_AYARLARI` İstanbul
koordinatıyla başlar (`LocalKonumServisi:77`); `konumSlice` hiçbir yolda `(0,0)`
üretmez, kontrol ölü kod olurdu. `(0,0)` nöbetçisi yalnız ham AsyncStorage okuyan
arka plan servisleri içindir.

`konumBayat`, `konumAlinamadi` ile **aynı anda dönmez** (ikincisi zaten
`sonGpsGuncellemesi` yokluğunu kapsar; `konumBayat` damganın VAR olmasını ister).

### Test kapsamı
- Her kontrolün tetiklendiği ve tetiklenmediği durum.
- Sorunsuz girdide **boş dizi**.
- Sıralama: birden çok sorun varken kritik önce.
- Sınır: tam 7 gün / 7 gün 1 dk (`simdi` enjekte edilerek — `new Date()` yok).
- `konumModu === 'manuel'` iken `konumAlinamadi` **dönmez**.

---

## Task 3 — Altyapı: izin okuma + dışa aktarma damgası

### 3a. `BildirimServisi.izinDurumunuOku`

**Değişen:** `src/domain/services/BildirimServisi.ts`

```ts
/**
 * SALT OKUR — izin İSTEMEZ. `izinIste()` izin yoksa requestPermissionsAsync ile
 * DİYALOG AÇAR; Ayarlar sayfası onu çağırırsa ekrana her girişte izin penceresi
 * fırlar. Bu yüzden ayrı, yan etkisiz bir okuma yolu gerekir.
 */
export const izinDurumunuOku = async (): Promise<'verildi' | 'reddedildi' | 'belirsiz'>
```

`Notifications.getPermissionsAsync()` → `status === 'granted'` → `'verildi'`;
`'denied'` → `'reddedildi'`; diğer/hata → `'belirsiz'`. **Hata fırlatmaz**
(`catch { return 'belirsiz'; }`).

### 3b. Son dışa aktarma damgası

**Değişen:** `src/core/constants/UygulamaSabitleri.ts` — `DEPOLAMA_ANAHTARLARI`'na:

```ts
/** Son dışa aktarma zamanı (ISO). Cihaza özgü eylem geçmişi — YEDEĞE GİRMEZ. */
SON_DISA_AKTARMA: '@namaz_akisi/son_disa_aktarma',
```

`@namaz_akisi/` öneki **zorunlu** — `onEkiOlanAnahtarlar(önek)` tarayan kodlarla
çakışmasın (AGENTS.md).

**Değişen:** `src/domain/services/YedeklemeServisi.ts` — `yedeginiPaylas`
içinde, `Sharing.shareAsync` çağrısı **başarıyla döndükten SONRA** damgayı yaz
(`Depolama` üzerinden). `Sharing.isAvailableAsync()` false dönüp paylaşım hiç
açılmadıysa **yazma**.

Damganın anlamı: *"yedek dosyası oluşturuldu ve paylaşım açıldı"* — Android
kullanıcının dosyayı gerçekten kaydettiğini bildirmez, bu yüzden kullanıcıya
gösterilen metin de "yedek alındı" değil **"son dışa aktarma"**dır.

**`YedekBirlestirmeServisi.AYAR_ANAHTARLARI`'na EKLEME** (bilinçli): yedeğe
girseydi içe aktarma başka cihazın damgasını taşırdı.

### Test kapsamı
- `izinDurumunuOku`: üç durum + `getPermissionsAsync` reddederse `'belirsiz'`.
- Damga: paylaşım başarılıysa yazılır; `isAvailableAsync` false ise yazılmaz.
- **Nöbetçi:** `SON_DISA_AKTARMA` anahtarı `YedekBirlestirmeServisi.AYAR_ANAHTARLARI`
  içinde **DEĞİLDİR**.

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
- **Sol şerit kullanılıyorsa** `borderRadius` ile birlikte dikkat: tek kenarlı
  border + yuvarlak köşe kırık görünür → şerit için ayrı `View` kullan.

### `useAyarOzetleri()`
Redux'tan sync özetleri, `useFocusEffect` ile async olanları okur.

```ts
export function useAyarOzetleri(): {
  ozetler: Record<string, string>;   // satır id -> özet
  sorunlar: Sorun[];
  saglikOzetSatiri: string;
}
```

- Sync kaynaklar: `useAppSelector` ile ilgili slice'lar + `useTema()`.
- Async kaynaklar (`useFocusEffect` + `useCallback`): `izinDurumunuOku()` ve
  `SON_DISA_AKTARMA` okuması. İkisi de `Promise.all` ile tek turda.
- **Unmount güvenliği:** effect temizliğinde `iptal` bayrağı — çözülen promise
  unmount sonrası `setState` çağırmasın.
- `kurulumSagligi({..., simdi: new Date()})` burada çağrılır (saf fonksiyona
  zamanı enjekte eden yer burasıdır).

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

**Test performansı (AGENTS.md):** mock bileşenlere **çocuk render ettirme**;
sahte zamanlayıcı kullanma; `waitFor` gerçek zamanda.
**Mock notu:** `useAyarOzetleri` `expo-notifications`'a dokunur → bu testte
köprü mock'lanmalı, yoksa suite hiç çalışmaz (`requireNativeModule` tuzağı).

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
