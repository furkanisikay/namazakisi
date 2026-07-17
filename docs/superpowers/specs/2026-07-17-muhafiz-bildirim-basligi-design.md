# Muhafız bildirim başlığı — kalan süreyi başa al

> **Durum:** Onaylandı · **Tarih:** 2026-07-17
> **Kapsam:** Muhafız uyarı metinleri (bildirim başlığı/gövdesi + banner gövdesi)

## Problem

Muhafız bildirimi, vaktin çıkmasına kaç dakika kaldığını **gövdenin sonunda** yazıyor. Android daraltılmış bildirimde başlık + gövdenin başını gösterir; kalan süre kırpılma bölgesine düşüyor → kullanıcı **saniyeler içinde karar vermesi gereken** bilgiyi görmek için bildirimi açmak zorunda kalıyor.

Mevcut seviye 4 (en kritik an):

```
🚨 VAKİT ÇIKIYOR!
VAKİT ÇIKIYOR! Hemen secdeye kapan! İkindi namazına 3 dakika kaldı!
```

Görünen iki satırın **ikisi de** "VAKİT ÇIKIYOR" ile açılıyor. Yani sorun yalnızca "süre sonda" değil — **başlık ve gövde aynı şeyi söylediği için** süre dışarı itiliyor.

Ek olarak, seviye 3'te kalan süre **hiç yok** (rastgele mücadele içeriği gösteriliyor).

## Hedef

Kalan süre, her seviyede, **başlıkta ve sabit konumda** görünsün; kullanıcı bildirimi açmadan "kaç dakikam var" sorusunu yanıtlasın.

## Tasarım

### Başlık kalıbı

```
<ikon> <süre> · <vakit adı> vakti <durum>
```

Süre **daima aynı yerde: ikondan hemen sonra, ilk sözcük** → göz, metni okumadan sayıyı yakalar. (Karakter indeksi vermiyoruz: `⚠️`/`🚨` iki UTF-16 birimi, `⏰` bir birim; sabit olan **görsel konum**, indeks değil.)

| Seviye | Başlık | Gövde |
|---|---|---|
| 1 | `⏰ 30 dk · Sabah vakti` | Vakit daralmaya başladı, fırsat varken kılabilirsiniz. |
| 2 | `⚠️ 15 dk · Sabah vakti daralıyor` | Namazı sona bırakmayın; şimdi kılmak için vakit uygun. |
| 3 | `🔥 8 dk · Sabah vakti kaçıyor` | *(içerik havuzundan — bu spec'te değişmiyor)* |
| 4 | `🚨 3 dk · SABAH VAKTİ ÇIKIYOR` | Hemen secdeye kapanın — sonra kaza etmek zorunda kalırsınız. |

Vakit adları: Sabah · Öğle · İkindi · Akşam · Yatsı. (`gunes` isim haritasında var ama muhafız onun için **planlama yapmıyor** — doğrulandı; ölü kayıt, dokunulmuyor.)

### Büyük harf: `toUpperCase()` KULLANMA (Türkçe tuzağı)

Seviye 4 başlığı büyük harf ister. **`'İkindi'.toUpperCase()` → `İKINDI`** üretir (noktalı `İ` kaybolur, `i`→`I`) → kullanıcıya **yanlış yazılmış namaz adı** gider. Ölçüldü:

| Girdi | `toUpperCase()` | `toLocaleUpperCase('tr-TR')` |
|---|---|---|
| İkindi | `İKINDI` ❌ | `İKİNDİ` ✅ |

**Karar: sabit büyük-harf haritası** (`VAKIT_ADLARI_BUYUK`), `toLocaleUpperCase('tr-TR')` değil. Gerekçe: locale-tabanlı çözüm Hermes'te Intl/ICU varlığına bağlıdır ve ortama göre değişebilir; sabit harita motordan **bağımsız ve kesin**. Yalnız `İkindi` etkilenir, ama görünür bir hatadır.

### Kırpılma değerlendirmesi

En uzun hâl `⚠️ 15 dk · İkindi vakti daralıyor` ≈ 33 karakter. Kırpılma artık **zararsız**: kesilen "daralıyor" ⚠️ ikonuyla zaten söyleniyor; kritik bilgi (süre) başta. Eski tasarımın kusuru uzunluk değil, **sıra**ydı.

> Bu, tasarım turunda elenen "çıkış saati" varyasyonundan (`🚨 3 dk · İkindi 17:42'de çıkıyor`) ayrılır: orada kesilen şey **yeni bilgi** (17:42) olurdu, burada **fazlalık**.

### Gövde kuralları

1. **Başlığı tekrarlama.** Başlık aciliyeti söyler; gövde ne yapılacağını söyler.
2. **Sondaki kalan süre kalkar** (bildirimde). Süre başlıkta; sonda tekrarlaması yer yiyor.
3. **Kibar "siz" dili** (AGENTS.md zorunlu kuralı). Sertlik korunur, kabalık değil:
   - "Hemen secdeye kapan!" → "Hemen secdeye kapanın."
   - "namazını sona bırakma" → "namazı sona bırakmayın"
   - "Şeytana uyma, namazını kıl!" → "Şeytana uymayın, namazı kılın!" *(seviye 3 **fallback**'i — havuz boşken kullanılır)*

> **Sınır — dosya sahipliğine göre:** **Servis dosyalarındaki** metinler kapsamdadır; **havuz dosyasındaki** (`SeytanlaMucadeleIcerigi.ts`) metinler değildir. Kapsama giren iki seviye-3 fallback'i vardır ve **ikisi de** düzeltilir:
> - `ArkaplanMuhafizServisi.bildirimMesajiOlustur` içindeki fallback (bildirim yüzeyi)
> - `NamazMuhafiziServisi.getRandomIcerik` içindeki `"Şeytana uyma, namazını kıl."` (banner yüzeyi)
>
> İkisinden yalnız birini düzeltmek, spec'in kendi drift önlemi ilkesini çiğnerdi.

### İki yüzey, iki kural (drift önlemi)

Aynı mesaj mantığının **iki kopyası** var:

| Yüzey | Dosya | Süre nerede? |
|---|---|---|
| Sistem bildirimi | `ArkaplanMuhafizServisi` | **Başlıkta** (gövdeden kalkar) |
| Uygulama içi banner | `NamazMuhafiziServisi` → `AnaSayfa` | **Gövdede kalır** |

Banner'da başlık sabittir (`AnaSayfa.tsx`, hardcoded) ve kırpılma yoktur → oradaki kalan süre (`(3 dk kaldı)`) **korunur**; yalnız "sen" dili düzeltilir.

İkisi ayrı ayrı düzeltilirse **kayarlar** — bu repoda yaşanmış bir kalıp ("Kıldım" handler drift'i, `docs/repo-denetim-2026-06-06.md`). Bu yüzden ikisi **aynı commit'te**, tutarlı ton ve sözcük dağarcığıyla düzeltilir.

## Kapsam dışı (bilinçli)

| Konu | Neden |
|---|---|
| Seviye 3 içerik havuzu | Ayrı iş: içerik modeli + kaynaklı havuz. Bu spec yalnız **başlığını** değiştirir. |
| TTS ("son 3 dakika" sesli) | Ayrı iş: yeni bağımlılık (`expo-speech`) + cihaz doğrulaması. |
| `siddetSeviyesi` 1 ve 2 ölü verisi | İçerik işine ait yapısal sorun (aşağıda "Bilinen borç"). |
| Banner'ın hardcoded renkleri | `AnaSayfa.tsx`'te `#FEE2E2`/`#DC2626` vb. var; ayrı iş, görsel doğrulama ister. |
| Ayarlar'daki seviye adları | `MuhafizAyarlariSayfasi.tsx:43` seviye 3'ü "Şeytanla Mücadele" diye adlandırıyor. Bildirim başlığı artık `🔥 8 dk · <vakit> vakti kaçıyor` olacağı için ayar adı ile bildirim görünümü **kopuyor**. Bilinçli kabul: seviye 3'ün kimliği gövdede (havuz içeriğinde) yaşamaya devam ediyor; ayar adı içerik işinde yeniden ele alınacak. |
| Eşikler / sıklıklar / kanallar / sesler | Davranış değişmiyor. |
| Vakit sayacı bildirimi | Ayrı bildirim; muhafız açıkken zaten bastırılıyor (#90). |

## Bilinen borç (bu turda düzeltilmiyor, kayda geçiyor)

1. **İçeriğin yarısı ölü.** Her iki servis de `siddetSeviyesi === 3` filtreliyor → `siddetSeviyesi: 1` ve `2` maddeleri (t1, t2, u1, u2) **hiç gösterilmiyor**. Uygulama 8 değil **4 metin** döndürüyor.
2. **Model uyumsuz.** İçerik ekseni 3 kademeli, muhafız 4 seviyeli; seviye 1/2/4 metinleri servislere gömülü sabitler.
3. **Vakte uymayan hadis.** `s1` (Buhârî, Ezân 34) *yatsı ve sabah*a özgüdür ama rastgele seçildiği için **öğlede de çıkabiliyor**.
4. **Telif riski (mevcut).** Dosyada kaynağı belirsiz meal metinleri var (Meryem 59, Alak 19). Türkçe mealler FSEK m.6/1 uyarınca **işlenme eser**; Kur'an'ın kamu malı olması meali serbestleştirmez. Karar: içerik işinde meal **gömülmeyecek**, kendi özgün metnimiz + künye kullanılacak.

## Gerekli refactor (test edilebilirlik için)

Başlık üretimi şu an **fonksiyon bile değil**: `ArkaplanMuhafizServisi`'nin planlama döngüsü içinde inline sabit atamalar (`aktifBaslik = '🚨 VAKİT ÇIKIYOR!'` vb.). `bildirimMesajiOlustur` ise `private` ve seviye 3'te `Math.random()` içeriyor → **saf değil**.

Bu yüzden metinleri doğrudan test edebilmek için küçük bir **extract** şart:

- Saf `basligiOlustur(vakit: VakitAdi, seviye: 1|2|3|4, kalanDk: number): string` çıkarılır.
- `vakitAdlari` haritası `bildirimMesajiOlustur` içinden **çıkarılıp paylaşılır** (başlık da aynı adlara ihtiyaç duyuyor) + `VAKIT_ADLARI_BUYUK` eklenir.
- `kalanDk` erişilebilir — doğrulandı: planlama döngüsünde `k` / `veri.dakika` mevcut.
- Rastgelelik (`Math.random`) `basligiOlustur`'a **girmez**; başlık deterministik kalır.

Bu refactor kapsamın parçasıdır, ayrı iş değildir — onsuz spec'in test maddeleri yazılamaz.

## Test

**Yeni testler:**
- Her seviyede başlık `<ikon> <süre> dk · ` öneki ile başlar (regex; karakter indeksi değil).
- Gövde, başlığın durum ifadesini **birebir tekrarlamaz**.
- Gövdede (bildirim) sondaki `(N dk kaldı)` **yoktur**; banner mesajında **vardır**.
- Beş vaktin beşi de doğru ada çözülür.
- **`İkindi` → `İKİNDİ`** (noktalı) — `İKINDI` **değil**. Bu testi yazmak zorunlu; tuzağın nöbetçisi budur.
- Bu spec'te değiştirilen metinlerde "sen" dili kalıbı geçmez. *(Havuz metinleri hariç — s4 hâlâ "sana… dinleme!" diyor ve seviye 3 gövdesi olarak gösterilmeye devam edecek; içerik işinde düzeltilecek.)*

**Güncellenmesi gereken MEVCUT testler** — eski başlıkları birebir assert ediyorlar, yeni format hepsini kırar:

| Dosya | Satır | Assert |
|---|---|---|
| `ArkaplanMuhafizServisi.test.ts` | 152, 190, 246 | `'🚨 VAKİT ÇIKIYOR!'` |
| `ArkaplanMuhafizServisi.test.ts` | 238 | `'⏰ Namaz Hatırlatıcı'` |
| `ArkaplanMuhafizServisi.test.ts` | 240 | `'⚠️ Vakit Daralıyor'` |
| `ArkaplanMuhafizServisi.test.ts` | 242 | `'🔥 Şeytanla Mücadele!'` |

`NamazMuhafiziServisi.test.ts` **kırılmaz** (`stringContaining` kullanıyor ve banner'da süre + "VAKİT ÇIKIYOR" korunuyor) — doğrulandı.

**Tuzak:** muhafız bildirim ID'leri tarih içerir; testlerde sabit tarih yazma — `bugunuAl()`/`dunuAl()` kullan (AGENTS.md).

## Doğrulama

`npm run verify` (typecheck + lint + test) geçmeli. Metin değişikliği olduğu için cihazda görsel teyit önerilir: daraltılmış bildirimde sürenin göründüğü doğrulanmalı.
