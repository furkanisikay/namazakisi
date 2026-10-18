# Birleşik hatırlatma modülü — uygulama planı

> Bu belge PLANDIR (kod yok). Sahip onayı VERİLDİ (2026-10-18): "Onaylıyorum, direkt internal
> teste gönder hepsini bitince." Önceki plan: `2026-10-17-ortak-hatirlatma-yuzeyleri.md`
> (altyapı yayında). Bu plan onun **K5 kararını GERİ ALIR**, K3 ve K4'ü gerekçesiyle korur.
> Mock: sahibe gösterilen etkileşimli HTML (önce/sonra, telefon çerçevesi).

## 0. Özet

Sahibin geri bildirimi (aynen): *"Hatırlatmalar her yerde aynı olsun dedim; namaz muhafızındaki
hatırlatmalar ve özelleştirmeler her yerdeki hatırlatmalar ile aynı mı? Sesli metin
özelleştirmeyi diğerlerinde göremedim. […] 2 tane durum için 4 tane kart göstermek yerine daha
iyi, daha basit, daha anlaşılır ve her türlü esnekliğe uygun bir hatırlatmalar modülü tasarla ve
TTS metnine kadar her yerde bu modülü kullan. […] 'bildirim / sesli / ikisi birden / sessiz' diye
seçiyor; halbuki bu ikisi 2 anahtar olabilir."*

Denetimin cevabı: **Hayır, aynı değil.** Altyapı (adım dizisi, teslimci, kanal uzayı, alarm, bütçe)
ortak; ama yedi yüzeyden beşinde sesli anons METNİ düzenlenemez, nafilede adım aç/kapa anahtarı
yok, ekranların her biri aynı orkestrasyonu (rıza, detay, önizleme) ayrı ayrı kopyalıyor ve kanal
seçimi iki bağımsız evet/hayır sorusunu dört kartlı tek seçime çeviriyor.

Karar özeti:
1. **Kanal = bağımsız anahtarlar.** "Nasıl uyarsın" dört kartı (Kapalı / Bildirim / Sesli anons /
   İkisi de) kalkar; yerine **Bildirim** ve **Sesli okuma** iki anahtar, Bildirim'in altında
   **Ses** satırı ve **Titreşim** anahtarı. "Kapalı" artık kanal değil, adım satırındaki anahtar.
   **Veri modeli DEĞİŞMEZ** (`UyariKanallari` zaten küme) → göç YOK.
2. **Sesli okuma metni HER yüzeyde düzenlenir** (K5 geri alındı): tek `AnonsMetniEditoru`,
   yüzeye özgü güvenli yer tutucular (`{vakit}` `{süre}` `{yön}`; takvimde etkinlik adı YOK),
   "Otomatik cümle" seçeneği (boş metin = bugünkü bağlamsal cümle → eski kayıtlar birebir).
3. **Tek modül:** `HatirlatmaModulu` bileşeni + `useHatirlatmaDuzenleyici` hook'u. Yüzey yalnız
   `PencereTanimi` + kısıt + okuyucu/yazıcı verir; kart, detay, önizleme, sesli ve alarm rızası
   modülün içindedir. Beş kopya orkestrasyon (378–631 satırlık dosyalar) tek yere iner.
4. **İlerleyen açıklama:** detay sayfasında **Temel** = *Ne zaman* + *Nasıl*; **Gelişmiş**
   (açılır, kapalı başlar) = tekrar, ton (yalnız muhafız), gerçek alarm + kapsamı. Kart sayısı:
   kanal 4 kart → 2 anahtar; sıklık 2 kart → 1 anahtar ("Tekrarla"); yön 2 uzun kart → 2 parçalı
   kısa seçici; yoğunluk 3 uzun kart → 3 parçalı seçici.
5. **Korunan istisnalar** (yine ekranda gerekçeli): K3 yön sabit (cuma, camiye gitme, yatış,
   takvim), K4 ton yalnız muhafızda. Platform: iOS'ta ses seçici ve titreşim yok (cihaz gerçeği).

## 1. Denetim tablosu (2026-10-18, `origin/master` 8964013)

Yüzeyler: **M** = muhafız (5 vakit) · **N** = nafile (kuşluk, evvâbîn, teheccüd) · **C** = cuma ·
**G** = camiye gitme · **Y** = yatış/muhasebe · **T** = takvim çakışması.

| Yetenek | M | N | C | G | Y | T | Fark gerçek teknik engel mi? |
|---|---|---|---|---|---|---|---|
| Adım sayısı | 1–6 (`MUHAFIZ_MAKS_ADIM`) | 1–3 (`NAFILE_MAKS_ADIM`) | 1–3 (`EK_HATIRLATMA_MAKS_ADIM`, `adimDizisi.ts:44`) | 1–3 | 1–3 | 1–3 | Hayır — bütçe kararı (ek yüzey payları `butceSabitleri.ts`). Korunur. |
| Eşik | komşuya kilitli, pencereden tavan | 1..pencere | 15–180, adım 15 (`cumaAyarlari.ts:32-34`) | 1–180, adım 5 (`camiyeGitAyarlari.ts:73-75`) | 5–120 (`yatisAyarlari.ts:47-49`) | 10–120 (`takvimCakismaAyarlari.ts:53-55`) | Hayır — yüzeyin anlamı. Korunur. |
| Yön | seçilir | seçilir | sabit + gerekçe | sabit + gerekçe | sabit + gerekçe | sabit + gerekçe | **Kısmen** — K3: olay tabanlı yüzeyde "giriş yönü" anlamsız (ör. "cuma girdikten sonra" = hutbe kaçtı). Korunur, gerekçe satırı modülde. |
| Ton | 4 ton | yok | yok | yok | yok | yok | **Evet (bilinçli)** — K4: nafilede fıkıh kararı; ton acil kanala (DND deler) ve "vakit çıkıyor" metin diline bağlı. Korunur. |
| Tekrar/sıklık | 1–30 dk | 10–60 | 5–60 | 5–60 | 5–60 | 5–60 | Hayır — aralık sınırı. Korunur, UI tek anahtar olur. |
| Bildirim | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Sesli anons | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — (kanal her yerde açılabilir) |
| **Sesli metin düzenleme** | ✓ editör + 3 şablon (`AdimDetayModal.tsx:835-900`) | ✗ "Telefonunuz şöyle okur" (`pencereTanimi.ts:689-691`) | ✗ (`pencereTanimi.ts:619-625`) | ✗ | ✗ | ✗ | **EVET, üç gerçek engel** (§4.1): (a) `adimNormalize` metni zorla boşaltır (`adimDizisi.ts:64-74, 115-141`) → yazılsa açılışta silinir; (b) planlayıcılar `uyari.anonsMetni`'ni bağlamsal cümleyle EZER (`cumaPlani.ts:104`, `camiyeGitPlani.ts:136`, `nafilePlani.ts:219`, `yatisPlani.ts:459`, `takvimCakismaPlani.ts:321`); (c) teslimci `{vakit}`'i MUHAFIZ vaktinden çözer (`AndroidMuhafizTeslimcisi.ts:489`, `IosMuhafizTeslimcisi.ts:574`) → cumada "Öğle", nafilede sahte `'ogle'`. Ayrıca sesli açılınca boş kutuyu dolduran yol muhafız şablonu yazar (`seviyeAcKapa.ts:64-67`). |
| Titreşim | ✓ (Android) | ✓ | ✓ | ✓ | ✓ | ✓ | iOS'ta yok — platform (`platformYetenekleri.ts:93-95`). |
| Gerçek alarm + kapsam | ✓ | ✓ | ✓ (bilgi türü) | ✓ (bilgi) | ✓ (vakit) | ✓ (bilgi) | — |
| Bildirim sesi seçimi | ✓ (Android) | ✓ | ✓ | ✓ | ✓ | ✓ | iOS'ta yok — platform. |
| Adım aç/kapa anahtarı (kart satırı) | ✓ | **✗** (`NafileAyarlariSayfasi` `onAdimAcKapa` geçmiyor) | ✓ | ✓ | ✓ | ✓ | **Hayır — yalnız UI eksiği.** Düzeltilir. |
| "Kapalı" kanal çipi | ✓ | ✗ (`kapaliCipiVar` false) | ✓ | ✓ | ✓ | ✓ | Hayır — UI. Yeni modelde çip yok, anahtar var. |
| Akış önizleme | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — (metin yüzey üreticisinden: `onizlemeMetni`) |
| Zaman şeridi | ✓ | ✓ | ✓ | ✓ (sıradaki vakit) | ✓ | ✗ (olay tabanlı) | Takvimde sabit pencere yok — gerçek. Korunur. |
| Hazır yoğunluk | ✓ Hafif/Normal/Yoğun/Özel | ✗ | ✗ | ✗ | ✗ | ✗ | Hayır — tek-adımlı varsayılanla açılan yüzeyde gereksiz. Korunur (muhafıza özgü). |
| Sesli rıza | muhafız `sesliOnayi` (ekranda `SesliOnayModal`) | yüzeyin kendi | kendi | kendi | kendi | kendi | Hayır — rıza yüzey başınadır (AGENTS.md). Modüle taşınır, kayıt yeri aynı. |
| Alarm rızası | `AlarmOnayModal` modal ağacının içinde | sayfada | sayfada | sayfada | sayfada | sayfada | Hayır — iki farklı yer; modüle tek yerde. |
| Ön plan banner'ı | ✓ | — | — | — | — | — | Olgu (ön plan muhafızı yalnız farz). |
| iOS farkı | sesli = cihazda sentezlenmiş bildirim sesi (ön planda üretilir), sessiz anahtarını DELMEZ; alarm = AlarmKit; ses/titreşim seçimi yok | aynı | aynı | aynı | aynı | aynı | Platform. `serbestAnonsMetni` iOS'ta da `true` (`platformYetenekleri.ts:94`) — `pencereTanimi.ts:296-303`'teki "iOS'ta HAYIR" yorumu BAYAT, düzeltilir. |

### 1.1 "2 durum için 4 kart" nedir?
Adım detayındaki **"NASIL UYARSIN"** ızgarası (`pencereTanimi.ts:117-124 KANAL_CIPLERI`,
`AdimDetayModal.tsx:363-399`): Kapalı · Bildirim · Sesli anons · İkisi de. Bunlar iki bağımsız
evet/hayır sorusunun (bildirim? sesli?) dört bileşimi. Aynı desenin küçük ikizleri:
**SIKLIK** (Bir kez / Tekrarlı — 2 kart, aslında "tekrarla?" anahtarı), **NE ZAMAN
HATIRLATILSIN** (2 büyük kart; tek seçim, doğru kontrol ama çok yer kaplıyor) ve **HATIRLATMA
YOĞUNLUĞU** (3 büyük kart). Ekran görüntüsü kanıtı: `android-ozellik-kareleri` (koşu
38562479115) `08-adim-detay.png`, `07-muhafiz-zaman-seridi.png`, `18-nafile.png`.

### 1.2 Kod yapısı bulgusu
Beş yüzey (`NafileAyarlariSayfasi` 548, `CumaHatirlatmaBolumu` 378, `CamiyeGitBolumu` 631,
`YatisHatirlatmaBolumu` 522, `TakvimCakismaBolumu` 595 satır) aynı durum makinesini kopyalar:
`detay` / `onizleme` / `sesliBekleyen` / `alarmOnayiBekliyor`, `adimEkleyin`, `adimAcKapa`,
bütçe kapısı, iki rıza modalı. Muhafız ekranı aynı işi `MuhafizAyarlariSayfasi`'nda kendi yolundan
yapar. "Her yerde aynı" ancak bu tek yere indiğinde kalıcı olur.

## 2. Araştırma ve gerekçe

- **Bağımsız seçenek = anahtar/onay kutusu; birbirini dışlayan = tek seçim.** NN/g: onay
  kutuları "independent of each other" seçenekler içindir, kullanıcı hiçbirini, bazısını ya da
  hepsini seçebilir; radyo düğmesinde yalnız bir seçim olur
  ([NN/g — Toggle-Switch Guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/)).
  Bildirim ve sesli okuma bağımsızdır; dört bileşimi tek seçim olarak çizmek kullanıcıya
  "İkisi de"yi ayrı bir şeymiş gibi öğretir. Anahtarlar anında etki eder (kaydet düğmesi yok) —
  bu ekranın davranışı zaten böyle
  ([Open UI switch explainer](https://open-ui.org/components/switch.explainer),
  [PatternFly switch](https://patternfly.org/2022.05/components/switch/design-guidelines),
  [Helsinki DS](https://hds.hel.fi/foundation/guidelines/checkbox-radiobutton-toggle)).
- **Platformların kendi bildirim ayarları da bağımsız anahtardır.** Android kanal ayarında ses ve
  titreşim ayrı ayrı değiştirilir ("Users can modify the settings for notification channels,
  including behaviors such as vibration and alert sound" —
  [Android: notification channels](https://developer.android.com/develop/ui/views/notifications/channels));
  iOS Ayarlar > Bildirimler'de Sesler ve Rozetler ayrı anahtar, uyarı biçimleri ayrı onay
  işaretleridir; Google Saat alarmında ses satırı ve "Titreşim" ayrı (gözlem). Kullanıcının
  zihnindeki model zaten "her kanal ayrı açılır".
- **Ses/titreşim bildirimin ALT özelliğidir.** Android'de titreşim kanal özelliği (AGENTS.md:
  titreşim de kanal id'sinin girdisi); bildirim kapalıyken titreşim tek başına "sessiz uyarı"
  olur ve `kanallarNormalize` onu zaten bildirime geri açar (`adimDizisi.ts:92-98`). Bu yüzden
  Titreşim ve Ses satırı Bildirim'in altında, yalnız o açıkken görünür (hiyerarşi = gerçek).
- **İlerleyen açıklama, en fazla iki seviye.** "Show the few options most users need up front";
  iki seviyeyi aşan tasarımların kullanılabilirliği düşer
  ([NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)).
  Bugün: ekran → kart akordiyonu → detay modalı → (ton/alarm kapsamı) = fiilen üç seviye. Yeni:
  ekran (kartlar) → detay (Temel görünür, Gelişmiş aynı sayfada açılır bölüm). Açılır bölüm yeni
  bir gezinme seviyesi değildir.
- **Namaz uygulamaları vakit başına tek bir "bildirim türü" seçtirir** (Al-Azan: vakit başına
  ezan sesi seçimi — [F-Droid](https://f-droid.org/packages/com.github.meypod.al_azan/);
  Athani: vakit başına ses, ses düzeyi, titreşim, zamanlama —
  [App Store](https://apps.apple.com/dz/app/id6745261280);
  Nimaz: vakit başına anahtarlar + vakit öncesi hatırlatma —
  [belge](https://www.mintlify.com/arshad-shah/Nimaz/customization/notifications)). Bizim farkımız
  çok adımlı akış; ama her adımın içi yine "anahtarlar" düzeyinde kalmalı.
- **Varsayılan ve önizleme:** her yeni adım yalnız Bildirim açık doğar (bugünkü `ekAdim`), sesli
  açılınca metin kutusu "Otomatik cümle" ile gelir ve **Dinle** her zaman yanında — duymadan
  karar verdirmeyiz (mevcut `DinleButonu` deseni).
- **Erişilebilirlik:** anahtar satırının tamamı dokunma hedefi (≥44 dp), `accessibilityRole="switch"`
  + `checked`; yer tutucu çipleri `button` + "Ekleyin: vakit adı" etiketi; devre dışı anahtar
  (son açık kanal) `disabled` + nedenini okuyan ipucu.

## 3. Tasarım

### 3.1 Ekranlar (yüzey başına değişen yalnız ÜST bölüm)
- **Muhafız:** ana anahtar + konum + **Hatırlatma yoğunluğu** (3 parçalı seçici: Hafif · Normal ·
  Yoğun; "Özel" yalnız yedek varsa 4. parça) + 5 vakit kartı (akordiyon; değişmez).
- **Nafile:** "Ana ekranda göster" + 3 nafile kartı; her kartın gövdesi `HatirlatmaModulu`.
- **Bildirim ayarları:** cuma, camiye gitme, yatış, takvim bölümleri — her birinin yüzeye özgü üst
  ayarları (camiye: vakit çipleri + yola çıkış; yatış: saat + yatsı/muhasebe; takvim: rıza + ad
  göster) aynen kalır, altında `HatirlatmaModulu stil="gomulu"`.

### 3.2 `HatirlatmaModulu` (kartın gövdesi — her yüzeyde aynı)
1. **Ne zaman hatırlatılsın** — yön seçilebiliyorsa 2 parçalı kısa seçici (`sign-out-alt` "Vakit
   çıkarken" · `sign-in-alt` "Vakit girer girmez") + seçili yönün tek satır açıklaması + "?"
   (iki yön yan yana — bugünkü modal). Yön sabitse aynı yerde gerekçe satırı (`yonSabitGerekcesi`).
2. **Zaman şeridi** (imza öğesi; değişmez) + cümlesi.
3. **Hatırlatmalar** listesi: satır = ikon çipi · "N. hatırlatma" (+ ton) · özet
   ("45 dk kala · bildirim + sesli · titreşim") · ›  · aç/kapa anahtarı (kardeş, içinde değil).
   **Nafile dahil her yüzeyde** anahtar var.
4. "+ Hatırlatma ekleyin" (sınıra gelince sınır notu) · "Akışı önizle".

### 3.3 Adım detayı (bottom-sheet; her yüzeyde aynı bileşen)
```
[ikon] 1. hatırlatma                      [×]
       Sabah · Nazik ton
── NE ZAMAN ─────────────────────────────────
 Vaktin çıkmasına            [ – 45 dk kala + ]
── NASIL ────────────────────────────────────
 [🔔] Bildirim                          (●  )
       Ses: Uygulama sesi  ›   [Dinle]
       [📳] Titreşim                     (  ●)
 [🔊] Sesli okuma                       (●  )
       Telefonunuz şöyle okur:
       ┌─────────────────────────────────┐
       │ {vakit} vakti çıkıyor, son      │
       │ {süre} dakika.                  │
       └─────────────────────────────────┘
       Ekleyin: [Vakit adı] [Dakika] [kaldı/geçti]
       Hazır cümleler: [Otomatik] [1] [2] [3]
       → "Sabah vakti çıkıyor, son 45 dakika." [▶ Dinle]
── ▸ Gelişmiş (tekrar, ton, gerçek alarm) ───
   Tekrarla                              (●  )
     Her [ – 5 dk + ]
   Ton: [Nazik][Uyarı][Sert][Acil]   (yalnız muhafız)
   Gerçek alarm                          (  ●)
     [Yalnız ilk uyarıda] [Her uyarıda]
```
Kurallar:
- **İki ana anahtar = `kanallar.bildirim` ve `kanallar.sesli`.** Titreşim ve Ses satırı yalnız
  Bildirim açıkken görünür. Gerçek alarm Gelişmiş'te (açıkken kapalı Gelişmiş başlığına
  "Gerçek alarm açık" rozeti yazılır — gizli bir seçim sessiz kalmaz).
- **Son açık kanal kapatılamaz** (anahtar `disabled`, altında: "Bu hatırlatmayı kapatmak için
  listedeki anahtarı kullanın."). Adımın aç/kapa'sı tek yerdedir: liste satırı (`seviyeyiKapat` /
  `seviyeyiAc` + `oncekiKanallar` hafızası — değişmez). Detay kapalı adımda açılırsa bugünkü
  "Bu adım kapalı" boş durumu + **"Açın"** düğmesi.
- Titreşim/alarm açıkken Bildirim kapatılırsa: `kanallarNormalize` kuralıyla tutarlı olmak için
  Bildirim kapatılınca titreşim de kapanır; alarm ise sesli açıksa kalır (alarmın tekrarları
  bildirim yerine okunur) — bugünkü geçerli kümeler dışında küme üretilmez (nöbetçi: üretilen
  her küme `kanallarNormalize(k) === k`).
- **Gelişmiş açılır bölümü** kapalı başlar; içinde ayar değiştirilmiş adımda (tekrar, ton≠nazik,
  alarm) açık başlar. Başlık özetler: "Gelişmiş · her 5 dk · Uyarı tonu".
- **Sıra**: Ne zaman → Nasıl → Gelişmiş. (Bugün Nasıl önce geliyordu; "ne zaman" hatırlatmanın
  kimliğidir.)
- Ton, iOS bilgi notları, Türkçe TTS uyarısı, bütçe/seyreltme notları (`AdimNotlari`) aynen
  taşınır — sessiz sapma yok.

### 3.4 Sesli okuma metni (her yüzeyde)
- **Boş metnin anlamı yüzeye göre FARKLI kalır — iki bugünkü davranış da korunur:**
  - **Ek yüzeyler + nafile: boş = Otomatik cümle** (yüzeyin bugünkü bağlamsal cümlesi). Eski
    kayıtlarda metin zaten boş → **plan birebir aynı** (nöbetçi).
  - **Muhafız: boş = SESSİZ** (bugün `AndroidMuhafizTeslimcisi.anonsPlanla` boş/boşluk metinde
    erken döner — `AndroidMuhafizTeslimcisi.ts:478`; AGENTS.md "metin boşsa konuşma yok").
    Muhafızda "Otomatik" çipi boş bırakmaz, varsayılan şablonu (`varsayilanAnonsMetni(yon)`)
    KUTUYA YAZAR (`seviyeyiAc` doldurma deseni). Böylece kutuyu elle silmiş bir muhafız
    kullanıcısı konuşmaya başlamaz; kayıt-oynat snapshot'ı değişmez.
  - Ayrım `PencereTanimi.bosMetinOtomatik: boolean` ile taşınır (muhafız false, diğerleri true);
    editör boş-metin ipucunu buna göre yazar ("Boş bırakırsanız otomatik cümle okunur" / "Boş
    bırakırsanız bu adım sesli okumaz").
- `PencereTanimi` yeni alanları (bugünkü `anonsOrnegiOlustur`/`anonsMetniDuzenlenebilir: false`
  bunlarla değişir):
  - `anonsYerTutuculari: { anahtar: string; etiket: string }[]` — çip olarak eklenir.
  - `anonsSablonlari: string[]` — yüzeye uygun hazır cümleler (fıkıh/kayıt kuralına uygun).
  - `otomatikAnons(adim): string` — örnek otomatik cümle (önizleme/placeholder).
  - `anonsCoz(sablon, baglam): string` — **SAF**, `core/hatirlatma/anonsYerTutucu.ts`'te tek
    çözücü + yüzey sözlüğü.
- **Yüzey sözlüğü** (`ANONS_SOZLUKLERI`):

| Yüzey | `{vakit}` | `{süre}` | `{yön}` | Hazır cümle örnekleri (kayıt) |
|---|---|---|---|---|
| M | Sabah…Yatsı | ölçü dk | kaldı / geçti | bugünkü `ANONS_SABLONLARI` / `_GIRIS` (sen) |
| N | Kuşluk / Evvâbîn / Teheccüd | ölçü dk | kaldı / geçti | "{vakit} vakti, {süre} dakika {yön}. İki rekât için güzel bir an." (davet; emir yalnız uyandırmada) |
| C | Cuma | öğleye kalan dk | — (çip yok) | "Cuma namazına {süre} dakika kaldı. Hazırlan, camiye yola çık." (sen) |
| G | o vakit | girişe kalan dk | — | "{vakit} vaktine {süre} dakika kaldı. Camiye yola çık." (sen) |
| Y | Yatsı | yatışa kalan dk | — | "Yatmadan önce yatsıyı kıl." (sen) — **yalnız yatsı içeriğinde** kullanılır; gün sonu muhasebesi daima otomatik (yatsı kılınmışken "yatsıyı kıl" okumamak için; editör bunu yazar) |
| T | o vakit | etkinliğe kalan dk | — | "Takviminizdeki bir etkinlik {vakit} vaktine denk geliyor." (siz) — **etkinlik adı/saati için yer tutucu YOK** |
- Çözücü **bilinmeyen `{…}`'yi boş dizeye** indirger (TTS "süslü parantez" okumasın) ve
  takvim sözlüğünde ad alanı tip olarak bulunmaz (girdi tipine etkinlik nesnesi geçmez).
- **Fıkıh/metin kuralları** (AGENTS.md): hazır cümleler "secde", "terk", vakte özgü nass
  içermez; nass anonsta OKUNMAZ (bugünkü kural). Kullanıcının kendi yazdığı metin kendi
  sorumluluğundadır — denetlenmez, ezilmez.
- `{yön}` yalnız yön taşıyan yüzeylerde çip olarak sunulur; yön değişiminde
  `yonDegisimindeMetniCevir` yalnız muhafızda kalır (nafilenin şablonları `{yön}` ile yazılır →
  çeviri gerekmez).
- **iOS:** `serbestAnonsMetni` zaten `true`; metin ÖN PLANDA klibe sentezlenir (arka planda
  var olan klip ya da paket sesi). Editör altında not: "iPhone'da sesli okuma bildirim sesidir;
  sessiz anahtarı açıkken duyulmaz." (bugünkü `AdimNotlari` satırı).

### 3.5 Yoğunluk ve rıza modallarının yeri
- Yoğunluk yalnız muhafızda (üst seviye); preset sözleşmesi (`presetUygula` kanalları + aciliyeti
  yazar, `anonsMetni`/`bildirimSesi`/`kanallar.alarm` korunur) DEĞİŞMEZ.
- `SesliOnayModal` ve `AlarmOnayModal` **modülün içinde, detay modal ağacında** (iOS iki kardeş
  modal sunamaz — AGENTS.md alarm rızası maddesi). Rıza kaydı yüzeyin kendi alanına
  (`muhafizSlice.sesliOnayi`, `NafileAyarlari.sesliOnayi`, ek yüzeylerin `sesliOnayi`/`alarmOnayi`)
  hook'un `rizaYaz(tur)` geri çağrısıyla yazılır. Geri tuşu = vazgeç (değişmez).

## 4. Veri ve göç

### 4.1 Değişen çekirdek
1. **`adimNormalize` anons metnini KORUR** (`adimDizisi.ts:119-141`): `typeof ham.anonsMetni ===
   'string'` ise kırpmadan taşınır, uzunluk tavanı 240 karakter (TTS ve bildirim yükü). Yorum
   ("anons metni ZORLANIR") güncellenir. `ekAdim` yine `''` doğurur.
2. **Planlayıcılar** (`cumaPlani`, `camiyeGitPlani`, `nafilePlani`, `yatisPlani` [yalnız yatsı
   içeriği], `takvimCakismaPlani`): `anonsMetni = adim.anonsMetni ? anonsCoz(adim.anonsMetni,
   sozluk, baglam) : <bugünkü otomatik cümle>`. Adım, `UyariPlani.adimIndeks` ile kronolojik
   diziden bulunur. Teslimciye giden metin YER TUTUCUSUZDUR (bugünkü sözleşme; teslimcinin
   `anonsMetniniCoz` çağrısı değişmez ve metne dokunmaz).
3. **Sesli açılınca doldurma**: ek yüzeylerde ve nafilede kutu BOŞ kalır (= otomatik); muhafız
   bugünkü gibi `varsayilanAnonsMetni(yon)` ile doldurur (muhafızda boş = sessiz, §3.4). `seviyeyiAc(seviye, yon, doldur?)`
   üçüncü argümanı alır; `AdimDetayModal.kanallariSec` `tanim.anonsDoldur` bayrağına bakar.
4. **`onizlemeMetni(adim, ilk).anons`** adımın metnini kullanır (önizleme–plan paritesi).
5. **Kanal kümesi, `adimKapaliMi`, `oncekiKanallar`, preset ve göç zinciri DEĞİŞMEZ.**
   Anahtarların ürettiği kümeler bugünkü dört çipin ürettiği kümelerin aynısıdır
   (`{bildirim}`, `{sesli}`, `{bildirim,sesli}` + bağımsız `titresim`/`alarm`); kapalı = boş küme
   (yalnız liste anahtarı yazar).

### 4.2 Göç
**YOK.** Kanıt: (a) kanal veri modeli aynı; (b) ek yüzeylerde ve nafilede `anonsMetni` diskte
bugün daima `''` (normalize zorluyordu) → yeni planlayıcı boş metinde bugünkü cümleyi üretir;
(c) muhafız yolu (`vakitUyariPlaniOlustur` + teslimci) değişmez; muhafızda boş metin sessiz
kalır (§3.4). Kayıt-oynat snapshot'ı
(`ArkaplanMuhafizServisi.kayitOynat.test.ts`) `-u` olmadan geçmeli.

Geriye uyumluluk: yeni sürümde yazılmış özel metin, eski sürüme geri yüklenirse eski normalize
onu siler ve otomatik cümleye düşer (veri kaybı değil, sessiz geri düşüş) — kabul.

## 5. Test (nöbetçiler)
- `adimDizisi.test.ts`: **metin diskten birebir döner** (her yüzeyin normalize'ı); 240 tavanı.
- **Boş metin ayrımı nöbetçisi:** muhafız hücresi sesli + `anonsMetni: ''` → TTS planlanmaz
  (bugünkü gibi); ek yüzey/nafile adımı sesli + `''` → otomatik cümle planlanır. Muhafız
  editöründe "Otomatik" çipi şablonu yazar, boş bırakmaz.
- `anonsYerTutucu.test.ts`: her yüzey sözlüğü; bilinmeyen `{x}` → ''; **takvim sözlüğünde ad /
  saat / başlık anahtarı yok** ve `{etkinlik}` boşa çözülür; `toLowerCase`/`toUpperCase`
  kullanılmaz (İkindi tuzağı) — sabit haritalar.
- Yüzey plan testleri (`cumaPlani`, `camiyeGitPlani`, `nafilePlani`, `yatisPlani`,
  `takvimCakismaPlani`): **boş metin → dondurulmuş eski çıktıyla birebir**; dolu metin → çözülmüş
  metin, yer tutucusuz; yatışta muhasebe tetiği özel metni KULLANMAZ.
- `BildirimDefteriParite.test.ts`: metin sayıyı değiştirmez.
- `pencereTanimiYetenek.test.ts > YETENEK STANDARDI`: istisna listesi yalnız `yonSecilebilir`
  (gerekçe zorunlu) + `tonSecilebilir`; `anonsMetniDuzenlenebilir` artık HER tanımda
  `yetenekler.serbestAnonsMetni`'ne eşit; her tanımda `anonsYerTutuculari` dolu.
- `AdimDetayModal.test.tsx`: iki anahtar her kombinasyonda bugünkü çip kümesini üretir (tablo
  testi); son açık kanal anahtarı `disabled`; titreşim satırı bildirim kapalıyken yok; Gelişmiş
  kapalı başlar, değiştirilmiş adımda açık başlar; **editör her yüzey tanımında çizilir**.
- `HatirlatmaModulu.test.tsx` + `useHatirlatmaDuzenleyici.test.ts`: sesli rıza ilk seçimde,
  reddedince adım bildirimle kalır; alarm rızası; bütçe kapısı yalnız yapısal artışta
  (`adimYukuArtiyorMu` / `nafileYukuArtiyorMu` / muhafız `degisiklikSimuleEt`); nafile listesinde
  aç/kapa anahtarı var.
- Kayıt-oynat (Android + iOS teslimci) `-u` OLMADAN geçer.
- Maestro/simülatör özellik turu: `08-adim-detay`, `09-adim-detay-anahtarlar` akışları
  `testID`'lerle güncellenir (`adim-bildirim-anahtari`, `adim-sesli-anahtari`,
  `adim-titresim-anahtari`, `adim-alarm-anahtari`, `adim-gelismis`), yeni kare
  `14b-cuma-sesli-metin`.

## 6. Dilimleme (her biri ayrı PR, master'a sırayla; sonda internal)
- **PR-1 çekirdek (görünmez):** `adimNormalize` metni korur · `core/hatirlatma/anonsYerTutucu.ts`
  + sözlükler · planlayıcılar adım metnini kullanır · nöbetçiler. Davranış değişmez (metin boş).
- **PR-2 detay yeniden düzeni:** `AdimDetayModal` → Temel/Gelişmiş, iki anahtar, "Tekrarla"
  anahtarı, `AnonsMetniEditoru` (yer tutucu çipleri + hazır cümleler + Otomatik + Dinle);
  `KANAL_CIPLERI` ve `kanalCipiSeciliMi`/`cipKanallariniBirlestir` silinir (yerine
  `kanalAnahtariniUygula`). Muhafız ekranında yön/yoğunluk kısa seçiciler. `kapaliCipiVar`
  alanı ölür → `PencereTanimi` ve `STANDART_YETENEKLER` nöbetçisinden kaldırılır;
  `seviyeOzetiOlustur` tam-dize nöbetçisi (`seviyeOzeti.test.ts`) yeni özet biçimine
  ("bildirim + sesli · titreşim") güncellenir — "Kapalı — uyarı almazsınız" dizesi aynen kalır.
- **PR-3 tek modül:** `useHatirlatmaDuzenleyici` + `HatirlatmaModulu`; yüzeyler sırayla geçer
  (nafile → cuma → camiye → yatış → takvim → muhafız vakit kartı). Nafile aç/kapa anahtarı.
- **PR-4 metin her yerde açık:** `ekHatirlatmaPencereTanimi`/`nafilePencereTanimi` istisnası
  kalkar, sözlükler bağlanır, `YeniOzellikler.ts` duyurusu (`platformlar: ['android','ios']`,
  `surum` CI'nin keseceği sürüm), AGENTS.md maddeleri (§8).
- Sonra: `android-ekran-goruntuleri.yml tur=ozellik` + iOS özellik turu ile kare doğrulama →
  internal (Play) + TestFlight dispatch. Merge'ler serileştirilir (AGENTS.md release kuralı);
  dört PR yerine tek release istenirse dalda birleştirilip tek merge.

## 7. Riskler
- **Metin kullanıcıya sorumluluk yükler**: fıkha aykırı ya da yanlış bilgi yazılabilir —
  denetlenmez (kullanıcının kendi telefonu). Hazır cümleler kurallara uyar.
- **Yatış muhasebesi** özel metni kullanmaz — kullanıcı bunu "metnim okunmadı" sanabilir; editör
  açıkça yazar.
- **iOS klip sayısı**: her özel metin × süre değeri ayrı klip; ek yüzeylerde tekrarlı adım
  süre başına klip üretir (yaşa dayalı GC 7 gün). Sentez yalnız ön planda → ilk değişiklik
  sonrası arka planda paket sesi duyulabilir (bugünkü bedel).
- **Görsel değişiklik** alışkanlığı bozar: muhafız kullanıcısı kartları arar. Kart sayısı
  azalırken her eski seçim yeni yerde birebir temsil edilir (tablo testi).
- **PR-3 kapsamı büyük**: yüzey yüzey commit'lenir, her adımda ekran testleri yeşil.

## 8. AGENTS.md (PR-4 ile, doğrulanınca)
- "Ortak hatırlatma yüzeyleri" bölümüne: K5 geri alındı; metin her yüzeyde, yer tutucular
  planlayıcıda yüzey sözlüğüyle çözülür; takvimde ad yer tutucusu YOK; boş = otomatik.
- "Uyarı biçimi ARTIK KÜME" maddesine: ekranda çip YOK, iki anahtar + bildirimin alt satırları;
  son açık kanal kapatılamaz, kapatma liste anahtarıdır.
- "Muhafız ayarları ekranı" ve "Titreşim ekranda ÇİP DEĞİL" maddeleri yeni düzene göre
  güncellenir (eskiyen kısımlar silinir).
- `pencereTanimi.ts` iOS "serbest anons metni yok" yorumu düzeltilir.

## 9. Cihazda doğrulanacaklar
- One UI'da iki anahtarla kurulan "yalnız sesli" adımın kilit ekranında okunması.
- iOS'ta özel metin klibinin ilk ön plan turunda üretilip arka planda çaldığı.
- TalkBack/VoiceOver: devre dışı son kanal anahtarının nedenini okuması; yer tutucu çiplerinin
  imleç konumuna eklenmesi (`TextInput` seçim aralığı).
