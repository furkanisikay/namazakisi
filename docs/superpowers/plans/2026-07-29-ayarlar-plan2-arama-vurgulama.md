# Plan 2 — Ayarlar: arama, çapa/vurgulama, büyük başlık

**Spec:** `docs/superpowers/specs/2026-07-29-ayarlar-sayfasi-yeniden-kurulum-design.md` (§4, §5)
**Dal:** `fix/muhafiz-kapali-adim-etiketi`
**Önkoşul:** Plan 1 tamamlandı.
**Revizyon:** 2026-07-29 — bağımsız incelemeden sonra revize edildi (2 kritik,
6 önemli madde). Değişenler: ölçüm reçetesi `measureLayout`'a taşındı, kabuk
ScrollView'ü **devralmıyor**, çapa→sayfa tablosu eklendi, kırılacak test
envanteri eklendi, Task 6 ikiye bölündü, "kerahat" kriteri kaldırıldı.

## Global Constraints

- **`npm run verify` (typecheck + lint + test) GEÇMELİDİR.**
- Kibar **"siz"** dili, sentence case, aktif fiil.
- **ASLA hardcoded renk** — `useRenkler()`. `durum.*` yalnız dekoratif.
- **`Alert.alert` KULLANILMAZ.** Dokunma hedefleri **≥44dp**;
  `accessibilityRole` + `accessibilityLabel` zorunlu.
- `src/core/` **saf** kalmalı: React/Redux/AsyncStorage/native import YOK.
  Navigasyon tipine ihtiyaç olursa **yalnız `import type`** (runtime bağ kurma).
- Yeni bağımlılık **eklenmez**. `android/`, CI, sürüm **değiştirilmez**.
- Dokunulan dosyaya **yeni lint warning eklenmez** (`catch { }` kullan).
- **Alt sayfaların mevcut davranışı DEĞİŞMEZ** — bu plan onlara yalnız çapa ve
  vurgu yeteneği ekler; hiçbir ayarın mantığına, düzenine, metnine dokunmaz.

### Test mock reçetesi (bu repoda zorunlu)

Ekran testlerinde `@react-navigation/native` mock'lanırken **`useRoute` de**
verilmelidir; eksikse sayfa render'da çöker:

```ts
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: () => ({ params: undefined }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
```

---

## Task 1 — Ekran adları tek kaynak + navigatör tiplemesi

**Yeni:** `src/navigation/ayarlarEkranlari.ts`
**Değişen:** `src/navigation/AppNavigator.tsx`

```ts
export const AYARLAR_EKRANLARI = [
  'AyarlarAna', 'KonumAyarlari', 'GorünumAyarlari', 'BildirimAyarlari',
  'SeriHedefAyarlari', 'MuhafizAyarlari', 'Hakkinda', 'RamazanAyarlari',
  'DebugLogs', 'TakvimAyarlari', 'NelerYeni', 'YedeklemeAktarim',
  'IceAktarmaSihirbazi', 'TaniGeriBildirim',
] as const;

export type AyarlarEkranAdi = (typeof AYARLAR_EKRANLARI)[number];

/** `vurgula` çapası olan HER hedef sayfaya gidebilir. */
export type AyarlarStackParamList = Record<AyarlarEkranAdi, { vurgula?: string } | undefined>;
```

`GorünumAyarlari` Türkçe `ü` içerir — **mevcut ad budur, düzeltilmez.**

`AppNavigator.tsx`: `createNativeStackNavigator<AyarlarStackParamList>()`.
`const Stack` yalnız AyarlarStack'te kullanılıyor (doğrulandı) — başka navigatör
etkilenmez. Mevcut çağrılar **kırılmaz**: `as never` yalnız
`YedeklemeSayfasi.tsx:147` ve `TaniGeriBildirimSayfasi.tsx:175,220`'de ve `never`
her tipe atanabilir.

### Senkron garantisi — nöbetçi test DEĞİL, DERLEME ZAMANI

Ekran adı listesi ile navigatörün ayrışmaması **test yerine tiple** garanti edilir
(navigatörü testte render etmek `NavigationContainer` gerektirir ve
`AyarlarStack` export edilmiyor — kaynak-metin grep'i ise kırılgandır):

`AppNavigator.tsx` içinde ekran tanımlarını bir haritadan üret:

```ts
const AYARLAR_EKRAN_TANIMLARI: Record<
  AyarlarEkranAdi,
  { component: React.ComponentType<any>; options?: NativeStackNavigationOptions }
> = { AyarlarAna: { component: AyarlarSayfasi, options: { headerShown: false } }, ... };
```

`Record<AyarlarEkranAdi, …>` **tüm adları zorunlu kılar** — biri eksikse veya
fazlaysa `npm run typecheck` düşer. Sonra `Object.entries(...)` üzerinden
`<Stack.Screen>` map'lenir. Mevcut ekran başlıkları ve `headerShown` değerleri
**birebir korunur** (`AppNavigator.tsx:84-153`'ten kopyala).

### Test
- `AYARLAR_EKRANLARI` içindeki adlar benzersiz.
- Ek nöbetçi test **gerekmez** — garanti tip sisteminde.

---

## Task 2 — Türkçe metin katlama

**Yeni:** `src/core/ayarlar/metinKatlama.ts` + `__tests__`

```ts
/** Arama karşılaştırması için metni katlar. `toLowerCase()` KULLANMAZ. */
export function aramaIcinKatla(metin: string): string
```

**`toLowerCase()` YASAK** — AGENTS.md `toUpperCase()` tuzağının ikizi:
- `'İstanbul'.toLowerCase()` → `'i̇stanbul'` (U+0307 **birleşen nokta** kalır);
  kullanıcının yazdığı `'istanbul'` ile eşleşmez.
- `'I'.toLowerCase()` → `'i'`; Türkçede `'ı'` olmalıdır.

Sabit harita + **aksan-duyarsız** indirgeme (Türkçe klavyesi olmayan kullanıcı
"muhafiz" yazıp "Muhafız"ı bulsun):

```
İ,I,ı,i → i    Ş,ş,S,s → s    Ğ,ğ,G,g → g
Ü,ü,U,u → u    Ö,ö,O,o → o    Ç,ç,C,c → c
diğer A-Z → a-z (ASCII); kalan karakterler olduğu gibi
```

`Intl` / `localeCompare` **kullanılmaz** (Hermes'te ICU garanti değil).

### Test
- `aramaIcinKatla('İstanbul') === aramaIcinKatla('istanbul') === aramaIcinKatla('ISTANBUL')`
- `aramaIcinKatla('Muhafız') === aramaIcinKatla('muhafiz')`
- **Regresyon nöbetçisi:** çıktı **U+0307 birleşen nokta İÇERMEZ**
  (`expect(sonuc).not.toContain('̇')`) — `toLowerCase`'e dönülürse kırılır.
- Boş dize, sayı, noktalama.

---

## Task 3 — Çapa sabitleri, arama indeksi, eşleştirme

**Yeni:** `src/core/ayarlar/capalar.ts` · `aramaIndeksi.ts` · `ayarAra.ts` + testler

### `capalar.ts`
17 çapa id'si (aşağıdaki tabloda). Sabit nesne + `CapaId` tipi.

### Çapa → sayfa tablosu (DOĞRULANDI — birebir uy)

| Çapa | Sayfa | Kontrol (referans) |
|---|---|---|
| `konumModu` | `KonumAyarlari` | konum modu seçimi (~:343) |
| `akilliTakip` | `KonumAyarlari` | akıllı takip (~:125) |
| `tema` | `GorünumAyarlari` | tema seçimi (~:32) |
| `palet` | `GorünumAyarlari` | palet seçimi (~:95) |
| `vakitBildirimleri` | `BildirimAyarlari` | vakit switch'leri (~:354) |
| `cumaHatirlatmasi` | `BildirimAyarlari` | cuma bölümü (~:164) |
| `vakitSayaci` | `BildirimAyarlari` | vakit sayacı |
| **`gunSonuBildirimi`** | **`BildirimAyarlari`** | **gün sonu switch'i (~:574) — SeriHedef DEĞİL** |
| `tamGunEsigi` | `SeriHedefAyarlari` | tam gün eşiği (~:365) |
| `ozelGunModu` | `SeriHedefAyarlari` | özel gün modu (~:399) |
| `iftarSayaci` | `RamazanAyarlari` | iftar sayacı |
| `sahurSayaci` | `RamazanAyarlari` | sahur sayacı |
| `takvimSenkron` | `TakvimAyarlari` | senkron switch'i (~:114) |
| `muhafizAnaSwitch` | `MuhafizAyarlari` | ana switch (~:346) |
| `muhafizYogunluk` | `MuhafizAyarlari` | yoğunluk seçimi |
| `disaAktar` | `YedeklemeAktarim` | dışa aktar (~:236) |
| `iceAktar` | `YedeklemeAktarim` | içe aktar (~:244) |

`gunSonuBildirimi`'nin sayfası sezgiye aykırıdır (ad "seri"yi çağrıştırır ama
kontrol Bildirimler'dedir) — **yanlış sayfaya çapalanırsa arama var olmayan bir
kontrole götürür.** Satır numaraları YAKLAŞIKTIR; dosyayı aç, doğru kontrolü bul.

### `aramaIndeksi.ts`
```ts
export interface AyarIndeksKaydi {
  id: string;
  baslik: string;
  anahtarKelimeler: string[];
  sayfa: AyarlarEkranAdi;   // import type ile — runtime bağ kurma
  grup: string;             // sonuçta bağlam olarak gösterilir
  capa?: CapaId;
}
export const AYAR_INDEKSI: AyarIndeksKaydi[]
```

İçerik: **(a)** Ayarlar ana sayfasındaki **11 navigasyon satırı** (çapasız,
yalnız sayfaya götürür) + **(b)** yukarıdaki 17 çapa kaydı.

**Titreşim ve Ses efektleri toggle'ları indekslenmez** (bilinçli): onlar
`AyarlarAna`'da yaşar, "dokununca nereye gider?" sorusunun anlamlı cevabı yok.

**İndeks BİLİNÇLİ OLARAK SINIRLIDIR** — her ayar değil, en çok aranacaklar.
Bu sınır `aramaIndeksi.ts` başındaki yorumda **açıkça yazılır** ki sonraki
okuyucu listeyi "kapsamlı" sanmasın.

Anahtar kelimeler kullanıcının gerçekten yazacağı sözcükler olmalı:
`vakitBildirimleri` → `['ezan', 'vakit bildirimi', 'namaz vakti']`;
`ozelGunModu` → `['mazeret', 'özel gün', 'seri dondurma']`;
`muhafizYogunluk` → `['hafif', 'normal', 'yoğun', 'sıklık', 'ısrarcı']`.

### `ayarAra.ts`
```ts
export function ayarAra(indeks: AyarIndeksKaydi[], sorgu: string): AyarIndeksKaydi[]
```
- Boş/yalnız-boşluk sorgu → **boş dizi**.
- Karşılaştırma `aramaIcinKatla` ile.
- Skor: başlık **başlangıcı** (3) > başlık **içi** (2) > anahtar kelime (1);
  eşit skorda indeks sırası korunur (stabil sıralama).

### Test
- Türkçesiz yazımla eşleşme; boş sorgu → boş dizi; skor sıralaması; eşleşmeyen
  sorgu → boş dizi.
- **Nöbetçi 1:** her `sayfa` `AYARLAR_EKRANLARI` içinde (testte iki modülü de
  runtime import et).
- **Nöbetçi 2:** her `capa` `CAPALAR` değerleri içinde.
- **Nöbetçi 3:** `id` alanları benzersiz.

---

## Task 4 — Vurgu altyapısı

**Yeni:** `src/presentation/components/ayar/VurguSaglayici.tsx` ·
`AyarCapasi.tsx` · `useVurguKurulumu.ts` + testler

### Tasarım kararı: kabuk ScrollView'ü DEVRALMAZ

İlk taslak `AyarSayfasiKabugu`'nun sayfaların `ScrollView`'ünü değiştirmesini
öngörüyordu. **Bu yaklaşım terk edildi:** 9 sayfanın `className` /
`contentContainerStyle` / kardeş `<Modal>` yapılarını taşımak en olası regresyon
kaynağıdır ve bu planın "alt sayfaların davranışı değişmez" kısıtıyla çelişir.

Yerine: **sayfa kendi `ScrollView`'ünü tutar**, yalnız ref'i sağlayıcıya verir.

```tsx
// Sayfa kökü:
<VurguSaglayici>
  <ScrollView ref={useVurguKurulumu()} ...mevcut proplar>
```

`useVurguKurulumu()` ScrollView ref'ini döndürür ve `useRoute().params.vurgula`
değerini sağlayıcıya yazar. **Savunmalı okuma zorunlu:**
`(useRoute().params as { vurgula?: string } | undefined)?.vurgula` — automock'lu
testlerde ve parametresiz açılışta güvenli olur.

### `AyarCapasi`

Props: `{ id: CapaId; children }`.

**Ölçüm `onLayout` ile YAPILMAZ.** `onLayout`'un verdiği `y` **ebeveyne** görelidir,
ScrollView içeriğine değil; çapalanacak kontroller kart/`View` katmanlarının
içinde olduğu için vurgu rastgele bir noktaya kayar. Doğru reçete:

```tsx
// Vurgu ANINDA ölç (kayıt anında değil):
capaRef.current?.measureLayout(
  scrollRef.current?.getInnerViewRef?.(),
  (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: !hareketAzalt }),
  () => { /* ölçüm başarısız — sessizce geç */ },
);
```

Üç zorunlu ayrıntı:
1. **`findNodeHandle` KULLANMA** (Fabric'te deprecated) — ref'i doğrudan geçir,
   hedef olarak `scrollRef.current?.getInnerViewRef?.()`.
2. Çapa `View`'üne **`collapsable={false}`** ver — Android view-flattening
   ölçümü boşa düşürür.
3. Zamanlama: `useFocusEffect` + `InteractionManager.runAfterInteractions`
   içinde çalıştır — native-stack giriş animasyonu sürerken `scrollTo` erken
   tetiklenirse hedefi ıskalar.

Vurgu efekti: `renkler.birincil + '20'` tinti **2 kez ~600 ms** nabızlar
(`Animated`, opacity, `useNativeDriver: true`).
**Reduced motion açıksa** (`AccessibilityInfo.isReduceMotionEnabled()`): nabız
yok, `animated: false` scroll + sabit tint, 2 sn sonra söner.
Vurgu **bir kez** çalışır; ölçüm/eşleşme başarısızsa **sessizce hiçbir şey olmaz**.

`AccessibilityInfo` jest'te RN preset mock'uyla `false` döner — ek altyapı
gerekmez; `true` senaryosu `jest.spyOn` ile yazılır.

### Test
- Eşleşen id ile `scrollTo` çağrılır; eşleşmeyen id ile çağrılmaz.
- `vurgula` parametresi yokken hiçbir şey olmaz.
- Reduced motion açıkken nabız animasyonu **başlatılmaz**.
- `measureLayout` hata geri çağrısı tetiklendiğinde çökme olmaz.

---

## Task 5 — Arama arayüzü + büyük başlık

**Yeni:** `screens/Ayarlar/AramaAlani.tsx` · `AramaSonuclari.tsx`
**Değişen:** `AyarlarSayfasi.tsx` ve testi

### `AramaAlani`
Hap biçimli giriş: sol `search` ikonu, `placeholder="Ayarlarda arayın"`, doluyken
sağda temizle butonu (≥44dp). `accessibilityLabel="Ayarlarda arayın"`.

### `AramaSonuclari`
Her satır: başlık + `grup` bağlamı ("Hatırlatmalar › Bildirimler"). Dokununca:
`navigation.navigate(kayit.sayfa, kayit.capa ? { vurgula: kayit.capa } : undefined)`.

**Navigasyon tipi açıkça belirtilmeli** — tipsiz `useNavigation()`
`navigate(string, params)` kabul etmez:
`useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>()`.

Sonuç yoksa kibar boş durum: **"Eşleşen ayar bulunamadı"** + "Farklı bir sözcük
deneyin." (özür yok, yön gösterir). Sonuç sayısı erişilebilirlik için duyurulur.

### `AyarlarSayfasi` entegrasyonu
- Sorgu **boş değilken**: gruplar ve sağlık kartı gizlenir, yalnız sonuçlar görünür.
- Sorgu boşken: Plan 1 düzeni aynen.
- **`keyboardShouldPersistTaps="handled"` ZORUNLU** — yoksa sonuç listesine ilk
  dokunuş yalnız klavyeyi kapatır ve kullanıcı iki kez dokunmak zorunda kalır.
- **Büyük başlık:** "Ayarlar" içerik akışının başında (`text-3xl font-bold`).
  Yukarı kaydırınca üstte kompakt başlık **opacity + translateY** ile belirir
  (`Animated.ScrollView` + `onScroll`, `useNativeDriver: true`).
  **`fontSize` animasyonu YAPMA** — native driver'da çalışmaz; çapraz geçiş kullan.

### Yapışkanlık ↔ giriş animasyonu çatışması — DİKKAT
Bugün `AyarlarSayfasi.tsx`'te **tüm içerik tek bir `Animated.View` içinde**
(Plan 1'in fade+slide giriş animasyonu). `stickyHeaderIndices` yalnız
`ScrollView`'ün **doğrudan** çocuğuna işler. Arama hapı yapışkan olacaksa hap
(ve büyük başlık) animasyon sarmalayıcısının **dışına**, ScrollView'ün doğrudan
çocuğu olacak şekilde çıkarılmalıdır. Giriş animasyonu geri kalan içerikte korunur.

### Test
- Sorgu yazılınca gruplar gizlenir, sonuçlar görünür; temizlenince geri gelir.
- Sonuca dokununca doğru `navigate(sayfa, { vurgula })` çağrılır.
- Çapasız kayıtta ikinci argüman `undefined` gider.
- Eşleşme yoksa boş durum metni görünür.
- **Performans:** mock bileşenlere çocuk render ettirme; sahte zamanlayıcı
  kullanma; `waitFor` gerçek zamanda (AGENTS.md CI dersleri).

---

## Task 6a — Basit alt sayfalar (4 sayfa)

**Değişen:** `KonumAyarlariSayfasi` · `GorünumAyarlariSayfasi` ·
`RamazanAyarlariSayfasi` · `SeriHedefAyarlariSayfasi`

Her sayfa için: kökü `VurguSaglayici` ile sar, `ScrollView`'e
`useVurguKurulumu()` ref'ini ver, tablodaki kontrolleri `AyarCapasi` ile sar.
**Sayfanın mevcut proplarına, düzenine, metnine dokunma.**

### Kırılacak test — güncellenmeli
- `__tests__/SeriHedefAyarlariSayfasi.test.tsx:11-14` — mock factory yalnız
  `useNavigation` + `CommonActions`; `useRoute` eklenmeli.
- `__tests__/KonumAyarlariSayfasi.test.tsx` — navigasyon **hiç mock'lanmamış**;
  gerçek `useRoute` "Couldn't find a route object" fırlatır → mock eklenmeli.

### Temsilci test
`KonumAyarlariSayfasi`: `vurgula` parametresiyle açılınca `scrollTo` çağrılır;
parametresiz açılınca sayfa normal render edilir.

---

## Task 6b — Karmaşık alt sayfalar (4 sayfa)

**Değişen:** `BildirimAyarlariSayfasi` · `TakvimAyarlariSayfasi` ·
`MuhafizAyarlariSayfasi` · `Yedekleme/YedeklemeSayfasi`

Aynı üç adım. Ek dikkat:
- `TakvimAyarlariSayfasi`'ndaki bottom-sheet backdrop'u `StyleSheet.absoluteFill`
  ile **kardeş** kalmalı (AGENTS.md: içeriği saran `TouchableWithoutFeedback`
  scroll'u takar). Bu sayfalardaki `<Modal>`'lar `ScrollView`'ün **dışında**
  kardeştir — `VurguSaglayici` onları kapsayabilir ama `ScrollView` yapısına
  dokunulmaz.
- **Modal içindeki kontrollere çapa VERİLMEZ** — `measureLayout` kapalı
  modaldaki öğeyi bulamaz. Tablodaki 17 çapanın hepsi sayfa düzeyindedir
  (doğrulandı); yeni çapa eklerken bu kurala uy.

### Kırılacak test — güncellenmeli
- `__tests__/MuhafizAyarlariSayfasi.test.tsx:22` — factory yalnız
  `useNavigation`; `useRoute` eklenmeli.
- `Yedekleme/__tests__/YedeklemeSayfasi.test.tsx:10` —
  `jest.mock('@react-navigation/native')` **automock**; `useRoute()` `undefined`
  döner → savunmalı okuma bunu kurtarır ama mock'u yine de açık yaz.
- `BildirimAyarlariSayfasi`'nin **testi YOK** — bu görevde sıfırdan tam-sayfa
  test yazma (809 satır, 5 slice; AGENTS.md CI-timeout yüzeyi). `npm run verify`
  yeterli doğrulamadır.

### Temsilci test
`MuhafizAyarlariSayfasi` (mevcut testi var): `vurgula` ile `scrollTo` çağrılır.

---

## Kabul kriterleri

1. `npm run verify` geçer.
2. "iftar", "muhafiz", "yedek", "mazeret" arandığında ilgili ayar bulunur;
   dokununca o sayfaya gidip kontrolü vurgular.
   *(Not: "kerahat" bir AYAR DEĞİLDİR — yalnız ana ekranda yaşar, indekste yoktur.)*
3. Türkçe karakter kullanmadan arama çalışır ("muhafiz" → "Muhafız").
4. Arama boşken sayfa Plan 1'deki gibi görünür.
5. Alt sayfaların mevcut davranışı değişmemiştir.
6. Reduced motion açıkken nabız animasyonu çalışmaz.
