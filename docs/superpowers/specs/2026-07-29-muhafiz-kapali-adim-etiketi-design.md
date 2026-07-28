# Muhafız: kapalı adımın etiketi — "Sessiz" → "Kapalı"

**Tarih:** 2026-07-29
**Kapsam:** Yalnız kullanıcıya görünen metin. Motor, disk şeması ve davranış değişmez.

## Problem

Namaz Muhafızı ekranında bir vaktin hatırlatma adımını (seviyesini) anahtarla
kapattığınızda, adım satırının alt yazısı **"Sessiz"** yazıyor.

Bu, uygulamanın kendi sözlüğünde ikinci bir anlamla çakışıyor: bildirim
**açıkken de** sesi kısılmış / sessiz modda gelen bir bildirim durumu vardır
(kanal sesi, cihazın sessiz modu, `bildirimSesi` seçimi). Kullanıcı "Sessiz"
etiketini gördüğünde makul biçimde **"bildirim gelecek ama ses çıkarmayacak"**
diye okuyor; oysa gerçek durum **hiç uyarı gelmeyecek**.

Kök neden: motorun iç dili (`mod === 'sessiz'`) kullanıcıya olduğu gibi sızmış.

### Sızıntının tam yeri (iki nokta)

| Dosya | Şu an | Nerede görünür |
|---|---|---|
| `src/core/muhafiz/seviyeOzeti.ts` | `if (seviye.mod === 'sessiz') return 'Sessiz';` | `VakitKarti` içindeki adım satırının alt yazısı |
| `src/presentation/screens/MuhafizAyarlari/sabitler.ts` | `{ id: 'sessiz', etiket: 'Sessiz', ikon: 'bell-slash' }` | `SeviyeDetayModal` → "NASIL UYARSIN" çipi |

### Doğru dil zaten var (tutarsızlık tek yönlü)

- `src/core/muhafiz/vakitOzeti.ts` — vaktin **tüm** adımları kapalıyken satır özeti
  zaten **`'Kapalı'`** döndürüyor.
- `SeviyeDetayModal` boş durumu zaten **"Bu adım kapalı. {vakit} vaktinde bu
  aşamada uyarı almazsınız."** diyor.

Yani düzeltme yeni bir kelime dağarcığı icat etmiyor; ekranın kendi içindeki
mevcut ve doğru terminolojiye (**"kapalı"**) hizalıyor.

### Modal çipi neden de yanlış

`SeviyeDetayModal.modSec` içinde `'sessiz'` seçmek **birebir `seviyeyiKapat(seviye)`**
çağırıyor — yani o çip zaten bir "kapat" eylemidir, bir "ses modu" değildir.
Etiketin "Sessiz" olması, kullanıcıya dört ses modu (sessiz/bildirim/sesli/ikisi)
arasında seçim yapıyormuş izlenimi veriyor; oysa seçenek "kapat" + üç uyarı biçimidir.

## Çözüm

1. `seviyeOzetiOlustur`: sessiz dalı **`'Kapalı — uyarı almazsınız'`** döndürür.
   - "bildirim" değil **"uyarı"**: adım `sesli` modda da olabilir; "uyarı"
     bildirimi de sesli anonsu da kapsar, dolayısıyla her modda doğru kalır.
   - Kibar "siz" dili (AGENTS.md arayüz metni kuralı) — bu bir *arayüz* metnidir,
     ibadete çağrı metni değil, dolayısıyla "sen" istisnası geçerli değildir.
   - Alt yazı `text-xs`; tek satıra sığar.
2. `MOD_BILGILERI` sessiz çipi etiketi: **`'Kapalı'`**. `id: 'sessiz'` ve
   `ikon: 'bell-slash'` **değişmez** (id disk/motor sözleşmesidir).

## Değişmeyenler (bilinçli)

- `UyariModu` tipi ve `'sessiz'` id'si — motor sözleşmesi, diskte yaşıyor.
- `SeviyeAyari.oncekiMod` aç/kapa hafızası ve `seviyeAcKapa.ts` mantığı.
- `vakitOzetiOlustur` (zaten `'Kapalı'`), `SeviyeDetayModal` boş durum metni.
- Beş motor tüketicisinin hiçbiri — bu değişiklik `src/core/muhafiz` içinde
  yalnızca bir dönüş dizesine ve bir UI sabitine dokunur.

## Test

Nöbetçi testler etiketi metin olarak doğrular; güncellenecekler:

- `src/core/muhafiz/__tests__/seviyeOzeti.test.ts` — sessiz dalı beklentisi.
- `src/presentation/screens/__tests__/MuhafizAyarlariSayfasi.test.tsx` —
  iki `getByLabelText('Sessiz')` → `getByLabelText('Kapalı')`.

Yeni test gerekmez: mevcut nöbetçiler zaten "kapatma yolu `oncekiMod` yazar"
davranışını koruyor; yalnız etiket dizesi güncellenir.

## Doğrulama

`npm run verify` (typecheck + lint + test) geçmelidir.
