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

Süre daima 3. karakterde → göz, metni okumadan sayıyı yakalar.

| Seviye | Başlık | Gövde |
|---|---|---|
| 1 | `⏰ 30 dk · Sabah vakti` | Vakit daralmaya başladı, fırsat varken kılabilirsiniz. |
| 2 | `⚠️ 15 dk · Sabah vakti daralıyor` | Namazı sona bırakmayın; şimdi kılmak için vakit uygun. |
| 3 | `🔥 8 dk · Sabah vakti kaçıyor` | *(içerik havuzundan — bu spec'te değişmiyor)* |
| 4 | `🚨 3 dk · SABAH VAKTİ ÇIKIYOR` | Vakit çıkmak üzere! Hemen secdeye kapanın. |

Vakit adları: Sabah · Öğle · İkindi · Akşam · Yatsı. (`gunes` isim haritasında var ama muhafız onun için **planlama yapmıyor** — doğrulandı; ölü kayıt, dokunulmuyor.)

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

> **Sınır:** Seviye 3'ün **fallback** metni bu spec'in kapsamındadır (servis dosyasında, `bildirimMesajiOlustur` içinde). `SeytanlaMucadeleIcerigi.ts`'teki **havuz** metinleri kapsam dışıdır — onlar içerik işine aittir ve orada "sen" dili ayrıca düzeltilecektir.

### İki yüzey, iki kural (drift önlemi)

Aynı mesaj mantığının **iki kopyası** var:

| Yüzey | Dosya | Süre nerede? |
|---|---|---|
| Sistem bildirimi | `ArkaplanMuhafizServisi` | **Başlıkta** (gövdeden kalkar) |
| Uygulama içi banner | `NamazMuhafiziServisi` → `AnaSayfa` | **Gövdede kalır** |

Banner'da başlık sabittir (`AnaSayfa.tsx`, hardcoded) ve kırpılma yoktur → oradaki kalan süre (`(3 dk kaldı)`) **korunur**; yalnız "sen" dili düzeltilir.

İkisi ayrı ayrı düzeltilirse **kayarlar** — AGENTS.md'de "Kıldım handler drift'i" olarak yaşanmış bir bug. Bu yüzden ikisi **aynı commit'te**, tutarlı ton ve sözcük dağarcığıyla düzeltilir.

## Kapsam dışı (bilinçli)

| Konu | Neden |
|---|---|
| Seviye 3 içerik havuzu | Ayrı iş: içerik modeli + kaynaklı havuz. Bu spec yalnız **başlığını** değiştirir. |
| TTS ("son 3 dakika" sesli) | Ayrı iş: yeni bağımlılık (`expo-speech`) + cihaz doğrulaması. |
| `siddetSeviyesi` 1 ve 2 ölü verisi | İçerik işine ait yapısal sorun (aşağıda "Bilinen borç"). |
| Banner'ın hardcoded renkleri | `AnaSayfa.tsx`'te `#FEE2E2`/`#DC2626` vb. var; ayrı iş, görsel doğrulama ister. |
| Eşikler / sıklıklar / kanallar / sesler | Davranış değişmiyor. |
| Vakit sayacı bildirimi | Ayrı bildirim; muhafız açıkken zaten bastırılıyor (#90). |

## Bilinen borç (bu turda düzeltilmiyor, kayda geçiyor)

1. **İçeriğin yarısı ölü.** Her iki servis de `siddetSeviyesi === 3` filtreliyor → `siddetSeviyesi: 1` ve `2` maddeleri (t1, t2, u1, u2) **hiç gösterilmiyor**. Uygulama 8 değil **4 metin** döndürüyor.
2. **Model uyumsuz.** İçerik ekseni 3 kademeli, muhafız 4 seviyeli; seviye 1/2/4 metinleri servislere gömülü sabitler.
3. **Vakte uymayan hadis.** `s1` (Buhârî, Ezân 34) *yatsı ve sabah*a özgüdür ama rastgele seçildiği için **öğlede de çıkabiliyor**.
4. **Telif riski (mevcut).** Dosyada kaynağı belirsiz meal metinleri var (Meryem 59, Alak 19). Türkçe mealler FSEK m.6/1 uyarınca **işlenme eser**; Kur'an'ın kamu malı olması meali serbestleştirmez. Karar: içerik işinde meal **gömülmeyecek**, kendi özgün metnimiz + künye kullanılacak.

## Test

`bildirimMesajiOlustur` ve başlık üretimi saf → metinler doğrudan test edilir:

- Her seviyede başlık `<ikon> <süre> dk · ` ile başlar (süre konumu sabit).
- Gövde, başlığın durum ifadesini **tekrarlamaz**.
- Gövdede (bildirim) sondaki `(N dk kaldı)` **yoktur**; banner mesajında **vardır**.
- Beş vaktin beşi de doğru ada çözülür.
- Hiçbir kullanıcı metninde "sen" dili kalıbı geçmez.

**Tuzak:** muhafız bildirim ID'leri tarih içerir; testlerde sabit tarih yazma — `bugunuAl()`/`dunuAl()` kullan (AGENTS.md).

## Doğrulama

`npm run verify` (typecheck + lint + test) geçmeli. Metin değişikliği olduğu için cihazda görsel teyit önerilir: daraltılmış bildirimde sürenin göründüğü doğrulanmalı.
