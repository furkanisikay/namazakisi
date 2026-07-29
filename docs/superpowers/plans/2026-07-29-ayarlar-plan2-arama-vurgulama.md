# Plan 2 — Ayarlar: arama, çapa/vurgulama, büyük başlık

**Spec:** `docs/superpowers/specs/2026-07-29-ayarlar-sayfasi-yeniden-kurulum-design.md` (§4, §5)
**Dal:** `fix/muhafiz-kapali-adim-etiketi`
**Önkoşul:** Plan 1 tamamlandı (dört grup, dinamik özetler, sağlık kartı yerinde).

## Global Constraints

- **`npm run verify` (typecheck + lint + test) GEÇMELİDİR.**
- Kibar **"siz"** dili, sentence case, aktif fiil. İbadet-çağrı "sen" istisnası
  bu ekranlarda **geçerli değildir**.
- **ASLA hardcoded renk** — `useRenkler()`. `durum.*` yalnız dekoratif.
- **`Alert.alert` KULLANILMAZ.**
- Dokunma hedefleri **≥44dp**, `accessibilityRole` + `accessibilityLabel`.
- `src/core/` **saf** kalmalı (React/Redux/AsyncStorage/native import YOK).
- Yeni bağımlılık **eklenmez**. `android/`, CI, sürüm **değiştirilmez**.
- Dokunulan dosyaya **yeni lint warning eklenmez**; kullanılmayan catch için
  `catch { }` yaz.
- **Alt sayfaların mevcut davranışı DEĞİŞMEZ.** Bu plan onlara yalnız çapa ve
  vurgu yeteneği ekler; hiçbir ayarın mantığına, düzenine veya metnine dokunmaz.
- **`useFocusEffect` test mock'u:** ekran testlerinde
  `jest.mock('@react-navigation/native', ...)` yazarken `useFocusEffect` ve
  `useRoute` de mock'lanmalı — eksik bırakılırsa sayfa render'da çöker
  (AGENTS.md'de kayıtlı).

---

## Task 1 — Ekran adları tek kaynak + navigatör tiplemesi

**Yeni:** `src/navigation/ayarlarEkranlari.ts`
**Değişen:** `src/navigation/AppNavigator.tsx`
**Yeni test:** `src/navigation/__tests__/ayarlarEkranlari.test.ts`

Bugün `AyarlarStack` **tamamen tipsiz** (`createNativeStackNavigator()`,
`AppNavigator.tsx:61`) ve ekranlar `navigate('X' as never)` ile geziyor. `vurgula`
parametresi tek bir ekrana değil, **çapası olan her hedef sayfaya** gideceği için
tek ekranlık tip yaması yetmez.

```ts
/** AyarlarStack ekran adlarının TEK kaynağı. Navigatör de arama indeksi de burayı okur. */
export const AYARLAR_EKRANLARI = [
  'AyarlarAna', 'KonumAyarlari', 'GorünumAyarlari', 'BildirimAyarlari',
  'SeriHedefAyarlari', 'MuhafizAyarlari', 'Hakkinda', 'RamazanAyarlari',
  'DebugLogs', 'TakvimAyarlari', 'NelerYeni', 'YedeklemeAktarim',
  'IceAktarmaSihirbazi', 'TaniGeriBildirim',
] as const;

export type AyarlarEkranAdi = (typeof AYARLAR_EKRANLARI)[number];

/** Cape (vurgu) parametresi çapası olan HER hedef sayfaya gidebilir. */
export type AyarlarStackParamList = Record<AyarlarEkranAdi, { vurgula?: string } | undefined>;
```

**`GorünumAyarlari` Türkçe `ü` içerir** — mevcut ad budur, düzeltilmez
(değiştirmek navigasyonu ve rozet eşleşmesini bozar).

`AppNavigator.tsx`: `createNativeStackNavigator<AyarlarStackParamList>()`.
Mevcut `as never` cast'leri artık gereksizse temizlenir; **davranış değişmez**.

### Test
- `AYARLAR_EKRANLARI` içindeki her ad benzersiz.
- **Nöbetçi:** `AppNavigator.tsx` kaynağındaki her `<Stack.Screen name="X">`
  değeri `AYARLAR_EKRANLARI` içinde var ve tersi de doğru. (Navigatörü render
  etmeden: `AyarlarStack` bileşenini oluşturup React elemanlarının `props.name`
  değerlerini toplamak yeterli — kaynak-metin grep'i kullanma.)

---

## Task 2 — Türkçe metin katlama

**Yeni:** `src/core/ayarlar/metinKatlama.ts`
**Yeni test:** `src/core/ayarlar/__tests__/metinKatlama.test.ts`

```ts
/** Arama karşılaştırması için metni katlar. `toLowerCase()` KULLANMAZ. */
export function aramaIcinKatla(metin: string): string
```

**`toLowerCase()` YASAK** — AGENTS.md'deki `toUpperCase()` tuzağının ikizi:
- `'İstanbul'.toLowerCase()` → `'i̇stanbul'` (U+0307 **birleşen nokta** kalır);
  kullanıcının yazdığı `'istanbul'` ile eşleşmez.
- `'I'.toLowerCase()` → `'i'`; Türkçede `'ı'` olmalıdır.

Sabit katlama haritası + **aksan-duyarsız** indirgeme (Türkçe klavyesi olmayan
kullanıcı "muhafiz" yazıp "Muhafız"ı bulabilsin):

```
İ,I,ı,i → i     Ş,ş,S,s → s     Ğ,ğ,G,g → g
Ü,ü,U,u → u     Ö,ö,O,o → o     Ç,ç,C,c → c
diğer A-Z → a-z (ASCII), diğer karakterler olduğu gibi
```

`Intl` / `localeCompare` **kullanılmaz** (Hermes'te ICU garanti değil).

### Test
- `aramaIcinKatla('İstanbul') === aramaIcinKatla('istanbul') === aramaIcinKatla('ISTANBUL')`
- `aramaIcinKatla('Muhafız') === aramaIcinKatla('muhafiz')`
- **Regresyon nöbetçisi:** çıktı **birleşen nokta (U+0307) İÇERMEZ**
  (`expect(sonuc).not.toContain('̇')`) — `toLowerCase`'e dönülürse kırılır.
- Boş dize, sayı, noktalama.

---

## Task 3 — Çapa sabitleri, arama indeksi ve eşleştirme

**Yeni:** `src/core/ayarlar/capalar.ts` · `aramaIndeksi.ts` · `ayarAra.ts`
**Yeni test:** üçü için `__tests__`

### `capalar.ts`
```ts
/** Alt sayfalardaki aranabilir kontrollerin çapa id'leri — TEK kaynak. */
export const CAPALAR = {
  konumModu: 'konumModu',
  akilliTakip: 'akilliTakip',
  tema: 'tema',
  palet: 'palet',
  vakitBildirimleri: 'vakitBildirimleri',
  cumaHatirlatmasi: 'cumaHatirlatmasi',
  vakitSayaci: 'vakitSayaci',
  tamGunEsigi: 'tamGunEsigi',
  gunSonuBildirimi: 'gunSonuBildirimi',
  ozelGunModu: 'ozelGunModu',
  iftarSayaci: 'iftarSayaci',
  sahurSayaci: 'sahurSayaci',
  takvimSenkron: 'takvimSenkron',
  muhafizAnaSwitch: 'muhafizAnaSwitch',
  muhafizYogunluk: 'muhafizYogunluk',
  disaAktar: 'disaAktar',
  iceAktar: 'iceAktar',
} as const;
export type CapaId = (typeof CAPALAR)[keyof typeof CAPALAR];
```

**Bu liste BİLİNÇLİ OLARAK SINIRLIDIR** — her ayarı indekslemiyoruz, en çok
aranacak olanları indeksliyoruz. Sınırın kendisi `aramaIndeksi.ts` başındaki
yorumda **açıkça yazılır** ki sonraki okuyucu "kapsamlı" sanmasın.

### `aramaIndeksi.ts`
```ts
export interface AyarIndeksKaydi {
  id: string;
  baslik: string;
  anahtarKelimeler: string[];
  sayfa: AyarlarEkranAdi;   // derleme zamanında doğrulanır
  grup: string;             // sonuçta bağlam olarak gösterilir
  capa?: CapaId;
}
export const AYAR_INDEKSI: AyarIndeksKaydi[]
```

İçerik: **(a)** Plan 1'deki 12 üst seviye satırın her biri (çapasız, yalnız
sayfaya götürür) + **(b)** yukarıdaki `CAPALAR` karşılıkları.

Anahtar kelimeler kullanıcının gerçekten yazacağı sözcükler olmalı — ör.
`vakitBildirimleri` için `['ezan', 'vakit bildirimi', 'namaz vakti bildirimi']`,
`ozelGunModu` için `['mazeret', 'özel gün', 'adet', 'seri dondurma']`,
`muhafizYogunluk` için `['hafif', 'normal', 'yoğun', 'sıklık', 'ısrarcı']`.

### `ayarAra.ts`
```ts
export function ayarAra(indeks: AyarIndeksKaydi[], sorgu: string): AyarIndeksKaydi[]
```
- Boş/boşluk sorgu → **boş dizi** (sonuç listesi hiç gösterilmez).
- Karşılaştırma `aramaIcinKatla` ile.
- Skor: başlık **başlangıcı** (3) > başlık **içi** (2) > anahtar kelime (1).
  Eşit skorda indeks sırası korunur (stabil).
- Sonuç sayısı sınırlanmaz.

### Test
- `ayarAra`: Türkçesiz yazımla eşleşme; boş sorgu → boş dizi; skor sıralaması;
  hiç eşleşmeyen sorgu → boş dizi.
- **Nöbetçi 1:** `AYAR_INDEKSI`'ndeki her `sayfa` `AYARLAR_EKRANLARI` içinde.
- **Nöbetçi 2:** her `capa` `CAPALAR` değerleri içinde.
- **Nöbetçi 3:** `id` alanları benzersiz.

---

## Task 4 — Vurgu altyapısı

**Yeni:** `src/presentation/components/ayar/VurguBaglami.tsx` ·
`AyarCapasi.tsx` · `AyarSayfasiKabugu.tsx`
**Yeni test:** üçü için `__tests__`

### `VurguBaglami`
React context: `{ aktifCapa: string | null; kayitOl: (capa, olcumFn) => void }`.
Kabuk sağlar, çapa tüketir.

### `AyarSayfasiKabugu`
Props: `{ children }`. Yaptıkları:
1. `useRoute()` ile `params.vurgula` okur.
2. Kendi `ScrollView`'ünü ref'ler ve bağlama koyar.
3. Alt sayfa bunu mevcut `ScrollView`'ünün **yerine** kullanır (kabuk
   `ScrollView`'ü kendi render eder, `contentContainerStyle` prop'unu geçirir).

**Yapışkan öğe uyarısı:** `stickyHeaderIndices` kullanılacaksa yapışkan öğe
`ScrollView`'ün **doğrudan** çocuğu olmalıdır.

### `AyarCapasi`
Props: `{ id: CapaId; children }`. Yaptıkları:
- Kendini `onLayout` ile ölçer, bağlama kaydeder.
- `aktifCapa === id` olduğunda: `scrollTo` ile görünüre kaydırır, sonra
  `renkler.birincil + '20'` tintini **2 kez ~600 ms** nabızlatır
  (`Animated`, opacity, `useNativeDriver: true`).
- **Reduced motion açıksa** (`AccessibilityInfo.isReduceMotionEnabled()`):
  nabız yok, sabit tint 2 sn sonra söner.
- Çapa bulunamazsa / ölçüm başarısızsa **sessizce hiçbir şey yapmaz**.
- Vurgu **bir kez** çalışır (aynı `vurgula` parametresiyle tekrar tetiklenmez).

### Test
- `AyarCapasi` eşleşen id ile mount olunca `scrollTo` çağrılır.
- Eşleşmeyen id → `scrollTo` çağrılmaz.
- Reduced motion açıkken animasyon **başlatılmaz** (mock'la).
- `vurgula` parametresi yokken hiçbir şey olmaz.

---

## Task 5 — Arama arayüzü + büyük başlık

**Yeni:** `src/presentation/screens/Ayarlar/AramaAlani.tsx` · `AramaSonuclari.tsx`
**Değişen:** `src/presentation/screens/AyarlarSayfasi.tsx`
**Değişen test:** `AyarlarSayfasi.test.tsx`

### `AramaAlani`
Hap biçimli giriş: sol `search` ikonu, `placeholder="Ayarlarda arayın"`, dolu
iken sağda temizle (`times`) butonu (≥44dp). `accessibilityLabel="Ayarlarda arayın"`.

### `AramaSonuclari`
`ayarAra` sonuçlarını listeler. Her satır: başlık + `grup` bağlamı
(ör. "Hatırlatmalar › Bildirimler"). Dokununca:
`navigation.navigate(kayit.sayfa, kayit.capa ? { vurgula: kayit.capa } : undefined)`.
Sonuç yoksa kibar boş durum: **"Eşleşen ayar bulunamadı"** + "Farklı bir sözcük
deneyin." (özür/muğlaklık yok, yön gösterir).
Sonuç sayısı erişilebilirlik için duyurulur.

### `AyarlarSayfasi` entegrasyonu
- Sorgu **boş değilken**: gruplar ve sağlık kartı gizlenir, yalnız sonuçlar görünür.
- Sorgu boşken: mevcut Plan 1 düzeni aynen.
- **Büyük başlık:** "Ayarlar" içerik akışının başında (`text-3xl font-bold`).
  Yukarı kaydırınca üstte kompakt başlık **opacity + translateY** ile belirir
  (`Animated.ScrollView` + `onScroll` `useNativeDriver: true`).
  **`fontSize` animasyonu YAPMA** — native driver'da çalışmaz; çapraz geçiş kullan.
- Arama hapı yapışkan kalır.

### Test
- Sorgu yazılınca gruplar gizlenir, sonuçlar görünür.
- Sonuca dokununca doğru `navigate(sayfa, { vurgula })` çağrılır.
- Çapasız kayıtta ikinci argüman `undefined` gider.
- Sorgu temizlenince gruplar geri gelir.
- Eşleşme yoksa boş durum metni görünür.
- **Test performansı:** mock bileşenlere çocuk render ettirme; sahte zamanlayıcı
  kullanma; `waitFor` gerçek zamanda (AGENTS.md CI dersleri).

---

## Task 6 — Alt sayfa entegrasyonu

**Değişen (9 sayfa):** `KonumAyarlariSayfasi` · `GorünumAyarlariSayfasi` ·
`BildirimAyarlariSayfasi` · `SeriHedefAyarlariSayfasi` · `RamazanAyarlariSayfasi` ·
`TakvimAyarlariSayfasi` · `MuhafizAyarlariSayfasi` · `YedeklemeSayfasi`

Her sayfa için **üç adım** (brief'in "yalnız sarmalayıcı" DEĞİL demesinin sebebi):
1. Sayfa düzeyindeki `ScrollView`'ü `AyarSayfasiKabugu` ile değiştir
   (mevcut `contentContainerStyle` ve `refreshControl` gibi proplar korunur).
2. Kabuk `useRoute().params.vurgula`'yı zaten okur — sayfada ek kod gerekmez.
3. `CAPALAR`'daki ilgili kontrolleri `<AyarCapasi id={CAPALAR.x}>` ile sar.

### Çapa kapsam kuralı — KRİTİK
Çapa **YALNIZ** sayfa düzeyindeki `ScrollView` içinde yaşayan kontrollere verilir.
Modal / bottom-sheet içindeki ayarlar (`TakvimAyarlari > VakitEditorModali`,
`MuhafizAyarlari > SeviyeDetayModal`) **ölçülemez** — `measureLayout` kapalı
modaldaki öğeyi bulamaz. Bunlar en yakın sayfa düzeyi öğeye (o modalı açan
satıra) çapalanır.

### Davranış korunumu — her sayfa için doğrula
Bu sayfaların **hiçbir mevcut davranışı değişmez**: scroll konumu, bottom-sheet
davranışı, `refreshControl`, klavye davranışı. `TakvimAyarlariSayfasi`'ndaki
bottom-sheet backdrop'unun `StyleSheet.absoluteFill` ile **kardeş** kalması
kritiktir (AGENTS.md: içerik saran `TouchableWithoutFeedback` scroll'u takar).

### Test
Her sayfa için tam test yazma — **iki temsilci** yeterli:
- `KonumAyarlariSayfasi` (basit) ve `BildirimAyarlariSayfasi` (karmaşık):
  `vurgula` parametresiyle açılınca `scrollTo` çağrılıyor mu; parametresiz
  açılınca sayfa normal render ediliyor mu.
- Diğer 7 sayfa için **mevcut testleri kırmama** yeterli doğrulamadır
  (`npm run verify`).

---

## Kabul kriterleri

1. `npm run verify` geçer.
2. Ayarlar'da "kerahat" / "iftar" / "muhafiz" / "yedek" arandığında ilgili alt
   ayar bulunur ve dokununca o sayfaya gidip kontrolü vurgular.
3. Türkçe karakter kullanmadan arama çalışır ("muhafiz" → "Muhafız").
4. Arama boşken sayfa Plan 1'deki gibi görünür.
5. Alt sayfaların mevcut davranışı değişmemiştir.
6. Reduced motion açıkken nabız animasyonu çalışmaz.
