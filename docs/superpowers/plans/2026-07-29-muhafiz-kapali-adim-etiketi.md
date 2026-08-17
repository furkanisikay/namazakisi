# Plan — Muhafız: kapalı adım etiketi "Sessiz" → "Kapalı"

**Spec:** `docs/superpowers/specs/2026-07-29-muhafiz-kapali-adim-etiketi-design.md`
**Dal:** `fix/muhafiz-kapali-adim-etiketi`

## Global Constraints

- Yalnız **kullanıcıya görünen metin** değişir. `UyariModu` tipi, `'sessiz'` id'si,
  disk şeması, `oncekiMod` hafızası, `seviyeAcKapa.ts` mantığı ve beş motor
  tüketicisi **DEĞİŞMEZ**.
- Kibar "siz" dili (AGENTS.md). Bu bir arayüz metnidir; ibadet-çağrı "sen"
  istisnası **geçerli değildir**.
- Yeni bağımlılık yok, yeni dosya yok, yeni test dosyası yok.
- `npm run verify` (typecheck + lint + test) **geçmelidir**.
- Dokunulan dosyaya **yeni lint warning eklenmez**.

## Task 1 — Etiketi değiştir ve nöbetçileri hizala

### Kod değişiklikleri (tam metin)

**1. `src/core/muhafiz/seviyeOzeti.ts`**

Satır 9'daki sessiz dalı:

```ts
if (seviye.mod === 'sessiz') return 'Sessiz';
```

şu hale gelir:

```ts
// Motorun ic dili 'sessiz'dir; kullaniciya "Kapali" denir. "Sessiz" demek,
// bildirimin gelip ses cikarmadigi (kanal sesi / cihazin sessiz modu) durumla
// karisiyordu. Ayrac ' — ': digerlerindeki ' · ' AYAR YUZLERINI ayirir, bu ise
// tek bir aciklamadir. "bildirim" degil "uyari": adim 'sesli' modda da olabilir.
if (seviye.mod === 'sessiz') return 'Kapalı — uyarı almazsınız';
```

**2. `src/presentation/screens/MuhafizAyarlari/sabitler.ts`**

`MOD_BILGILERI` içindeki ilk kayıt:

```ts
{ id: 'sessiz', etiket: 'Sessiz', ikon: 'bell-slash' },
```

şu hale gelir (yalnız `etiket` değişir; `id` ve `ikon` **aynı kalır**):

```ts
// etiket "Kapalı": bu cip bir ses modu DEGIL, bir kapatma eylemidir
// (SeviyeDetayModal.modSec 'sessiz' icin seviyeyiKapat() cagirir).
{ id: 'sessiz', etiket: 'Kapalı', ikon: 'bell-slash' },
```

**3. `src/presentation/screens/MuhafizAyarlari/SeviyeDetayModal.tsx`**

`modSec` içindeki yorumda geçen `"Sessiz" secmek` ifadesi `"Kapalı" secmek`
olarak güncellenir. Yorum dışında bu dosyada değişiklik **yoktur**.

### Test güncellemeleri

**4. `src/core/muhafiz/__tests__/seviyeOzeti.test.ts`**

- Test adı `'sessiz mod: yalnız "Sessiz"'` → `'kapalı adım: "Kapalı — uyarı almazsınız"'`
- Beklenti `.toBe('Sessiz')` → `.toBe('Kapalı — uyarı almazsınız')`

**5. `src/presentation/screens/__tests__/MuhafizAyarlariSayfasi.test.tsx`**

- İki `getByLabelText('Sessiz')` (yaklaşık satır 277 ve 349) → `getByLabelText('Kapalı')`
- ~337-342 arasındaki JSDoc ve test adındaki `"Sessiz"` → `"Kapalı"`
  (test adı: `'modaldan "Kapalı" seçmek de mod hafızasını yazar (anahtarla aynı davranır)'`)

### Açıkça yapılmayacaklar

- `MOD_BILGILERI` çipinin `accessibilityLabel`'ı `m.etiket`ten gelmeye
  **devam eder** — eylem diline ("Bu adımı kapatın") çevrilmez. Gerekçe spec'te.
- `vakitOzeti.ts` (zaten `'Kapalı'`), `AkisOnizlemeModal`, `SesliOnayModal`,
  `KurulumSihirbazi/adimlar.tsx` — **dokunulmaz**. Son ikisi *cihazın* sessiz
  modundan söz eder, farklı kavramdır.
- Yeni test eklenmez.

### Kabul kriterleri

1. `rg "'Sessiz'" src/` yalnızca kod yorumlarında/tanımlayıcılarda eşleşir;
   kullanıcıya görünen hiçbir etiket dizesi `'Sessiz'` olarak kalmaz.
2. `npx jest seviyeOzeti` geçer.
3. `npx jest MuhafizAyarlariSayfasi` geçer.
4. `npm run verify` geçer.
