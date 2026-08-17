# Ayarlar sayfası yeniden kurulumu (One UI esinli)

**Tarih:** 2026-07-29
**Ekranlar:** `AyarlarSayfasi.tsx` (yeniden kurulur), `HakkindaSayfasi.tsx` (sadeleşir),
ayar alt sayfaları (arama çapası + vurgu entegrasyonu).
**Revizyon:** 2026-07-29 — bağımsız incelemeden sonra 7 madde düzeltildi
(sağlık kontrolü #2, konum özeti girdisi, yedek damgası semantiği, navigatör
tipleme kapsamı, alt sayfa değişiklik kapsamı, yeni-özellik rozetlerinin
korunumu, nöbetçi testlerin sabit-tabanlı kurgusu).

## Problem

Bugünkü Ayarlar sayfası 10 satırlık düz bir liste + 2 toggle. Üç somut kusuru var:

1. **Alt yazılar statik.** "Tema ve renk paleti ayarları" cümlesi hangi temanın
   seçili olduğunu söylemez. Kullanıcı bir ayarın mevcut değerini öğrenmek için
   sayfaya girmek, bakmak ve geri çıkmak zorunda.
2. **Bilgi mimarisi düz ve kısmen yanlış.** 10 satır tek yığın halinde; ayrıca
   *Debug logları* hem `Hakkında` içinde hem de `Tanı ve geri bildirim` içinde
   duruyor (`TaniGeriBildirimSayfasi:175` ve `:220` — iki ayrı giriş noktası).
   *Tanı ve geri bildirim* ise `Hakkında`nın altına gömülü, oysa bir destek
   eylemidir, bir "uygulama künyesi" maddesi değil.
3. **Kurulum sorunları görünmez.** Bildirim izni kapalıysa Namaz Muhafızı
   çalışmaya devam eder ama tek bir uyarı bile ulaşmaz; kullanıcı bunu ancak
   namazı kaçırdıktan sonra fark eder. Ayarlar sayfası bunu söyleyebilecek tek
   yer, ama söylemiyor.

## Hedef

Samsung One UI Ayarlar'ının işe yarayan yanlarını, **uygulamanın mevcut görsel
diline sadık kalarak** getirmek. Yeni bir görsel kimlik icat edilmez:
`useRenkler` tokenları, `FontAwesome5`, mevcut kart yarıçapları ve buton
desenleri korunur (AGENTS.md "Ekran / UI tasarım standardı").

---

## 1. Bilgi mimarisi

Dört grup. Grup adları kullanıcının **niçin geldiğine** göre seçildi.

| Grup | Satırlar |
|---|---|
| **Namaz vakitleri** | Konum · Takvim entegrasyonu |
| **Hatırlatmalar** | Namaz muhafızı · Bildirimler · Seri ve hedefler · Ramazan özel |
| **Uygulama** | Görünüm · Titreşim (toggle) · Ses efektleri (toggle) |
| **Veri ve destek** | Yedekleme ve aktarım · Tanı ve geri bildirim · Neler yeni · Hakkında |

"Ramazan özel" *Hatırlatmalar*a girer: özü iftar/sahur sayacı ve onların
bildirimleridir.

### Taşınanlar ve kaldırılanlar

- **`Tanı ve geri bildirim`** — `Hakkında` içinden çıkar, üst seviyede
  *Veri ve destek* grubuna girer.
- **`Debug logları`** — `Hakkında`dan **tamamen kaldırılır**. Erişim yolu
  `Tanı ve geri bildirim` sayfasında zaten iki yerde var. Navigatördeki
  `DebugLogs` ekranı **kalır** (rota silinmez).
- **"Hızlı ayarlar" bölümü** kalkar; `Titreşim` ve `Ses efektleri` *Uygulama*
  grubunda birer satır olur (sağda Switch).
- `Hakkında` geriye şunları tutar: logo/başlık kartı, uygulama bilgileri,
  güncelleme kontrolü, telif satırı.

### KORUNACAK davranışlar (yeniden kurulumda düşmemeli)

Sayfa sıfırdan yazıldığı için bunlar açıkça sayılır — sessizce düşerlerse
uygulama genelinde bir sistem körleşir:

- **Yeni özellik duyurusu** (`useYeniOzellikler`): tanıtım kartı (`YeniOzellikKarti`),
  satır başına `sayfaOkunmamisMi(sayfa)` → `YeniRozet`, "Neler yeni" satırında
  `okunmamisVarMi`, ve satıra dokunulunca `sayfayiGorulduIsaretle(sayfa)`.
  AGENTS.md "Reçete — Yeni özellik duyurusu" bu mekanizmanın otomatik
  beslenmesine dayanır.
- **Dokunma geri bildirimi** (`useFeedback.butonTiklandiFeedback`) her satırda ve
  her toggle'da.
- Giriş animasyonu (fade + slide).

---

## 2. Dinamik özetler

Her satırın ikinci satırı, o ayarın **mevcut değeridir**.

### Mimari

Yeni saf modül: **`src/core/ayarlar/ozetler.ts`**. Her özet saf fonksiyondur;
girdisi ilgili state parçasıdır, store'a veya React'a bağımlı değildir.

```
konumOzeti({ konumModu, seciliIlAdi, gpsAdres })  -> "Kadıköy, İstanbul · otomatik"
takvimOzeti(takvimAyarlari)                       -> "Kapalı"
muhafizOzeti({ aktif, yogunluk })                 -> "Açık · normal yoğunluk"
bildirimOzeti(vakitAyarlari, cumaAktif)           -> "5 vakit · cuma hatırlatması açık"
seriOzeti(seriAyarlari)                           -> "Tam gün: 5 namaz · gün sonu açık"
ramazanOzeti(iftarAktif, sahurAktif)              -> "İftar sayacı kapalı"
gorunumOzeti(temaModu, paletAdi)                  -> "Koyu tema · Zümrüt"
yedeklemeOzeti(sonDisaAktarma)                    -> "Son dışa aktarma: 12 Temmuz"
hakkindaOzeti(surum, guncellemeVar)               -> "Sürüm 0.23.28 · güncel"
```

Palet adları temada gerçekten `ad` alanıyla tanımlıdır (`Zümrüt`, `Okyanus`,
`Lavanta`, `Güneş`, `Mercan`, `Gece`) — özet bu adları kullanır, renk sıfatı
uydurmaz.

### `konumOzeti` — bayat şehir tuzağı

`seciliIlAdi` **tek başına kullanılamaz.** GPS akışı (`KonumAyarlariSayfasi:237`)
`konumModu: 'oto'` + `gpsAdres` yazar ama `seciliIlAdi`'ye **dokunmaz**; o alan
son manuel seçimde (veya varsayılan `'Istanbul'`da) bayat kalır. Erzurum'da GPS
ile konumlanan kullanıcıya özet "İstanbul" derdi.

Kural: **oto** modda `gpsAdres` (`AnaSayfa.tsx:99` ile aynı desen:
`ilce, il` → yoksa `il` → yoksa kibar yedek "Konumunuz"), **manuel** modda
`seciliIlAdi`. Nöbetçi test yazılır.

### Veri kaynakları (dosya bazında doğrulandı)

| Özet | Kaynak |
|---|---|
| Konum | `konumSlice`: `konumModu`, `seciliIlAdi`, `gpsAdres` |
| Muhafız | `muhafizSlice`: `aktif`, `yogunluk` |
| Bildirimler | `vakitBildirimSlice.ayarlar` (5 boolean) + `cumaHatirlatmaSlice.ayarlar.aktif` |
| Seri | `seriSlice.ayarlar`: `tamGunEsigi`, `gunSonuBildirimAktif` |
| Ramazan | `iftarSayacSlice.ayarlar.aktif` + `sahurSayacSlice.ayarlar.aktif` |
| Takvim | `takvimSlice.ayarlar.aktif` |
| Görünüm | `useTema()` → `tema.mod`, `palet.ad` |
| Hakkında | `UYGULAMA.VERSIYON` + `guncellemeSlice.guncellemeMevcut` |
| Yedekleme | **yeni** anahtar (aşağıda) |
| Bildirim izni | **yeni** salt-okur sarmalayıcı (aşağıda) |

### Yeni kalıcı veri: son dışa aktarma zamanı

Repo genelinde böyle bir damga **yok** (arandı, `SON_YEDEK` hiç geçmiyor).

- **Anahtar:** `DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA = '@namaz_akisi/son_disa_aktarma'`.
  `@namaz_akisi/` öneki zorunlu — `onEkiOlanAnahtarlar(önek)` tarayan kodlarla
  çakışmasın (AGENTS.md; `NAMAZ_GUN_MIGRASYON` aynı deseni izler).
- **Semantik — dürüstlük gereği "yedek" değil "dışa aktarma".** `Sharing.shareAsync`
  Android'de kullanıcının dosyayı gerçekten kaydettiğini mi iptal ettiğini mi
  **bildirmez** (`YedeklemeServisi:214`). Damga bu yüzden "yedek alındı" değil,
  **"yedek dosyası oluşturuldu ve paylaşım açıldı"** anlamına gelir; kullanıcıya
  gösterilen metin de buna uyar: *"Son dışa aktarma: 12 Temmuz"*. Damga
  `shareAsync` çağrısından **sonra** yazılır; `Sharing.isAvailableAsync()` false
  dönüp paylaşım hiç açılmadıysa **yazılmaz**.
- **Yedekleme beyaz listesine EKLENMEZ** (bilinçli). `YedekBirlestirmeServisi.AYAR_ANAHTARLARI`
  bir beyaz listedir ve AGENTS.md yeni anahtarların açıkça eklenmesini ister —
  ama bu damga **cihaza özgü eylem geçmişidir**, bir tercih değil. Yedeğe girseydi
  içe aktarma başka cihazın damgasını taşır ve "son dışa aktarma" yalan söylerdi.

### Bildirim izni okuması

**`BildirimServisi.izinIste()` ÇAĞRILMAZ** — o fonksiyon izin yoksa
`requestPermissionsAsync` ile **diyalog açar** (`BildirimServisi:389-393`);
Ayarlar'a her girişte izin penceresi fırlardı.

`BildirimServisi`'ne salt-okur sarmalayıcı eklenir:
`izinDurumunuOku(): Promise<'verildi' | 'reddedildi' | 'belirsiz'>` →
yalnızca `Notifications.getPermissionsAsync()` okur, yan etkisizdir. Tek boğaz
noktası olur ve testte mock'lanabilir.

### Tazeleme — kritik

Özetler **`useFocusEffect` ile sayfaya her dönüşte yeniden okunur.**

Yoksa şu yaşanır: kullanıcı Konum'a girer, şehri değiştirir, geri döner ve
satırda hâlâ eski şehri görür → "kaydedilmedi" hisseder. Redux'tan gelen
özetler zaten reaktiftir; asıl gerekçe **Redux dışı** okumalardır:
bildirim izni durumu ve dışa aktarma damgası. İkisi de `useAyarOzetleri()`
hook'unda tek seferlik async okumayla alınır, aynı focus tetikleyicisine bağlanır.

---

## 3. Durum kartı — kurulum sağlığı (imza öğesi)

Sayfanın tek cesur öğesi budur; gerisi sakin kalır (AGENTS.md: "cesareti tek bir
imza öğesinde harca").

**Neden Ana Sayfa'nın tekrarı değil:** Ana Sayfa vakitleri ve seriyi gösterir.
Bu kart **ayarların sağlığını** gösterir — yalnızca Ayarlar sayfasında anlamı
olan bilgi.

### Mantık

Saf fonksiyon: **`src/core/ayarlar/kurulumSagligi.ts`** →
`kurulumSagligi(girdi): Sorun[]` (öncelik sırasına göre sıralı).

| # | Kontrol | Girdi | Seviye | Neden |
|---|---|---|---|---|
| 1 | Bildirim izni verilmemiş | `izinDurumu === 'reddedildi'` | kritik | Muhafız çalışır ama **hiçbir** uyarı ulaşmaz |
| 2 | Otomatik konum hiç alınamamış | `konumModu === 'oto' && !sonGpsGuncellemesi` | kritik | Vakitler varsayılan İstanbul'a göre hesaplanır, kullanıcı bunu bilmez |
| 3 | Muhafız kapalı **ve** hiç vakit bildirimi açık değil | `!muhafizAktif && vakitler.every(kapalı)` | uyarı | Kullanıcı hiç vakit hatırlatması almıyor olabilir |
| 4 | Konum takibi açık ama `sonGpsGuncellemesi` 7+ gün eski | `akilliTakipAktif` | bilgi | Şehir değiştiyse vakitler kayar |

`Sorun` tipi: `{ id, seviye, baslik, aciklama, eylemEtiketi?, hedefSayfa? }`.

**Kontrol #2 neden `(0,0)` DEĞİL:** `(0,0)` bu projede *ham AsyncStorage okuyan
arka plan servisleri* için bir nöbetçidir. `konumSlice` hiçbir yolda `(0,0)`
üretmez — `VARSAYILAN_KONUM_AYARLARI` İstanbul koordinatlarıyla başlar
(`LocalKonumServisi:77`). Store'dan beslenen bir `(0,0)` kontrolü **ölü kod**
olurdu. Anlamlı sinyal, oto modda hiç GPS sabitlemesi alınmamış olmasıdır.

**Kontrol #3 kapsamı bilinçli olarak dardır:** cuma hatırlatması, gün sonu
bildirimi ve vakit sayacı sayılmaz. Bunlar açıkken de "vakit hatırlatması yok"
denebilir; metin bu yüzden "hiç hatırlatma almıyorsunuz" değil, **"vakit
hatırlatmaları kapalı"** der.

### Görünüm

- **Sorun varsa:** en öncelikli sorun tam kart olarak çizilir — ikon çipi, başlık,
  bir cümlelik açıklama, birincil eylem butonu, (varsa) "N sorun daha".
  "N sorun daha"ya dokunmak kalan sorunları aynı kartın içinde açar.
- **Sorun yoksa:** kart **tek satıra daralır** — yeşil onay ikonu +
  "Kurulumunuz eksiksiz · Kadıköy, İstanbul · muhafız açık".

Kartın duruma göre rol ve boyut değiştirmesi bilinçlidir: kurulum sağlığı yalnız
bozukken ilgi çekicidir; her zaman büyük bir kart göstermek ölü alan üretirdi.

### Renk kuralı — bu projede iki PR bunun için reddedildi

`durum.*` renkleri **yalnız dekoratiftir**: ikon rengi, sol şerit, tint arkaplan.
Gövde metni **daima** `renkler.metin` / `renkler.metinIkincil`.

Ölçüldü: `durum.uyari` açık temada `#FFC107`, beyaz üzerinde **~1.63:1** —
normal metin için WCAG AA (4.5:1) açık farkla kırılır. `durum.hata` = `#F44336`
beyaz üzerinde ~3.7:1, küçük metin için yetersiz. Eylem butonu
`renkler.birincil` dolgu + beyaz metindir (mevcut birincil buton deseni) —
güvenlidir.

---

## 4. Arama ve vurgulama

### 4.1 Tek kaynaklı sabitler (bayatlama koruması)

Arama indeksi elle bakım gerektirir; bayatlarsa var olmayan sayfaya götürür.
Koruma **kaynak-metin grep'i ile değil, tek kaynak sabitleriyle** kurulur —
grep tabanlı nöbetçi, id'ler değişkenle verilince sessizce körleşirdi.

- **`src/navigation/ayarlarEkranlari.ts`** → `AYARLAR_EKRANLARI` sabiti ve
  ondan türeyen `AyarlarStackParamList`. Hem `AppNavigator` hem arama indeksi
  **bunu** kullanır. Ekran adlarının birebir yazımı burada tek yerde durur —
  mevcut adlardan biri `GorünumAyarlari` (Türkçe `ü` içerir); elle tekrar
  yazıldığında sessizce ıskalanabilecek bir tuzaktır.
- **`src/core/ayarlar/capalar.ts`** → `CAPALAR` sabiti. Sayfalar
  `<AyarCapasi id={CAPALAR.kerahat}>` yazar, indeks `capa: CAPALAR.kerahat`
  verir. Böylece nöbetçi test saf eşitlik kontrolüne iner.

### 4.2 İndeks

**`src/core/ayarlar/aramaIndeksi.ts`**

```ts
interface AyarIndeksKaydi {
  id: string;
  baslik: string;                        // "Kerahat uyarısı"
  anahtarKelimeler: string[];            // ["mekruh", "güneş"]
  sayfa: keyof AyarlarStackParamList;    // derleme zamanında doğrulanır
  grup: string;                          // "Hatırlatmalar" — sonuçta bağlam
  capa?: (typeof CAPALAR)[keyof typeof CAPALAR];
}
```

Üst seviye satırların **ve** alt sayfa ayarlarının kayıtları burada durur.

**Düzeltme (uygulama incelemesi):** yukarıdaki `"Kerahat uyarısı"` örneği
yanlıştır — **kerahat bir AYAR DEĞİLDİR.** Repoda yalnız ana ekranda yaşar
(`AnaSayfa`, `VakitAkisi`, `KerahatOnayModal`); hiçbir ayar sayfasında kerahat
kontrolü yoktur, dolayısıyla indekse girmez. Gerçek örnekler: "iftar sayacı"
(`RamazanAyarlari`), "özel gün modu" (`SeriHedefAyarlari`), "gün sonu bildirimi"
(**`BildirimAyarlari`** — adı "seri"yi çağrıştırsa da kontrol oradadır).

**Çapa kapsam kuralı:** çapa YALNIZ sayfa düzeyindeki `ScrollView` içinde
yaşayan kontrollere verilir. Modal/bottom-sheet içindeki ayarlar
(`TakvimAyarlari > VakitEditorModali`, `Muhafiz > SeviyeDetayModal`)
**ölçülemez** — `measureLayout` kapalı modaldaki öğeyi bulamaz. Bunlar en yakın
sayfa düzeyi öğeye (o modalı açan satıra) çapalanır. `capa` verilmeyen kayıt
yalnız sayfaya götürür.

### 4.3 Eşleştirme — Türkçe katlama tuzağı

Saf fonksiyon `ayarAra(indeks, sorgu): AyarIndeksKaydi[]`.

**`toLowerCase()` KULLANILMAZ.** AGENTS.md'deki `toUpperCase()` tuzağının
ikizidir:

- `'İstanbul'.toLowerCase()` → `'i̇stanbul'` — **birleşen nokta** (U+0307)
  bırakır; kullanıcının yazdığı `'istanbul'` ile eşleşmez.
- `'I'.toLowerCase()` → `'i'` — Türkçede `'ı'` olmalıdır.

Çözüm: **sabit katlama haritası** (`src/core/ayarlar/metinKatlama.ts`) +
aksan-duyarsız eşleşme (`s↔ş`, `g↔ğ`, `i↔ı`, `u↔ü`, `o↔ö`, `c↔ç`), böylece
Türkçe klavyesi olmayan kullanıcı "muhafiz" yazarak "Muhafız"ı bulur.
`Intl`/`localeCompare` kullanılmaz (Hermes'te ICU garanti değil — AGENTS.md).

Skorlama basit: başlık başlangıcı > başlık içi > anahtar kelime.

### 4.4 Vurgulama

- `VurguBaglami` bir React bağlamı sağlar: sayfanın `ScrollView` ref'i + aktif
  çapa id'si. Sayfa kabuğu (`AyarSayfasiKabugu`) bunu kurar ve
  `route.params.vurgula` değerini okur.
- Aranabilir kontrol `<AyarCapasi id={CAPALAR.x}>…</AyarCapasi>` ile sarılır;
  eşleşirse `measureLayout` → `scrollTo`, ardından `birincil + '20'` tinti
  **2 kez ~600 ms** nabızlatılır (opacity, native driver).
- **Reduced motion açıksa** nabız yok: sabit tint, 2 sn sonra söner
  (`AccessibilityInfo.isReduceMotionEnabled`).
- Çapa bulunamazsa **sessizce hiçbir şey yapılmaz** — sayfa yine açılır.

---

## 5. Başlık, bölüm etiketleri ve hareket

- Büyük "Ayarlar" başlığı içerik akışının başındadır. Yukarı kaydırınca üstte
  kompakt başlık **opacity + translateY** ile belirir. `fontSize` animasyonu
  native driver'da çalışmadığı için boyut animasyonu yerine **çapraz geçiş**.
- Arama hapı yapışkandır. `stickyHeaderIndices` kullanılacaksa yapışkan öğe
  `ScrollView`'ün **doğrudan** çocuğu olmalıdır — kabuk yapısı buna göre kurulur.
- **Bölüm başlıkları:** **normal yazım** ("Namaz vakitleri"), renk
  **`renkler.metinIkincil`**. Mevcut `BÜYÜK HARF` biçimi bu ekranda **terk
  edilir** (AGENTS.md sentence-case kuralı), ama renk **`birincil` DEĞİLDİR.**
  İlk tasarımda One UI aksanı için `birincil` seçilmişti; kontrast sonradan
  ölçüldü ve eşiği geçmiyor: açık temada Zümrüt **~2.7:1**, Güneş **~2.1:1**;
  koyu temada Gece **~2.0:1** — 12px semibold "normal metin" sayılır, eşik
  4.5:1'dir. Bu başlıklar dekoratif değil, sayfanın bilgi mimarisini taşır.
  `metinIkincil` ~4.5:1 verir. Grupları renk değil, kart sınırları ayırır.
  Diğer ekranlardaki büyük-harf başlıklarla geçici tutarsızlık **bilinçli kabul
  edilir**; bu spec onları dönüştürmez.
- Satır grupları tek kart içinde, aralarında hairline ayraç. Kart yarıçapı ve
  gölge mevcut desenle aynı.
- Yeni animasyon eklenmez; mevcut giriş animasyonu korunur.

---

## 6. Erişilebilirlik

- Satırlar `accessibilityRole="button"`, etiket = `"<başlık>. <özet>"`.
- Toggle satırlarında Switch, satırı saran Touchable'ın **kardeşidir**, içinde
  değil (AGENTS.md: Touchable `accessible` ile çocukları tek düğüme düzleştirir).
- Dokunma hedefleri ≥44dp.
- Arama alanı `accessibilityLabel="Ayarlarda arayın"`; sonuç sayısı duyurulur.
- Durum kartındaki eylem butonu ayrı odaklanabilir düğümdür.

---

## 7. Uygulama iki plana bölünür

Tasarım tek bütündür ama uygulama iki plan / iki PR olarak yürür. Gerekçe:
ikinci parça 9 alt sayfaya dokunur ve en kesişimsel iştir; birinci parça onsuz
da tek başına değer üretir ve gemiye binebilir.

### Plan 1 — Bilgi mimarisi, özetler, sağlık kartı

**Yeni (saf çekirdek):** `src/core/ayarlar/ozetler.ts` ·
`src/core/ayarlar/kurulumSagligi.ts`

**Yeni (sunum):** `screens/Ayarlar/AyarGrubu.tsx` · `AyarSatiri.tsx`
(navigasyon + toggle varyantı) · `KurulumSagligiKarti.tsx` ·
`hooks/useAyarOzetleri.ts`

**Değişen:** `AyarlarSayfasi.tsx` (yeniden kurulur; §1'deki KORUNACAK
davranışlar dahil) · `HakkindaSayfasi.tsx` (DESTEK + GELİŞTİRİCİ bölümleri
kaldırılır) · `BildirimServisi.ts` (`izinDurumunuOku` eklenir) ·
`YedeklemeServisi.ts` (dışa aktarma damgası) · `UygulamaSabitleri.ts`
(`SON_DISA_AKTARMA` anahtarı)

### Plan 2 — Arama, çapa, vurgulama, büyük başlık

**Yeni:** `src/navigation/ayarlarEkranlari.ts` (`AYARLAR_EKRANLARI` +
`AyarlarStackParamList`) · `src/core/ayarlar/capalar.ts` ·
`aramaIndeksi.ts` · `metinKatlama.ts` ·
`components/ayar/AyarCapasi.tsx` + `VurguBaglami.tsx` +
`AyarSayfasiKabugu.tsx` · `screens/Ayarlar/AramaAlani.tsx` +
`AramaSonuclari.tsx`

**Değişen:** `AppNavigator.tsx` — `AyarlarStack` **tiplenir**
(`createNativeStackNavigator<AyarlarStackParamList>()`); bugün tamamen tipsiz
(`AppNavigator:61`) ve ekranlar `navigate('X' as never)` ile geziyor.
`vurgula` parametresi tek bir ekrana değil, **çapası olan her hedef sayfaya**
gider — bu yüzden tek ekranlık tip yaması yeterli değildir.

**Değişen (alt sayfalar) — "yalnız sarmalayıcı" DEĞİL.** Her hedef sayfa üç şey
yapar: (a) kendi `ScrollView`'ünü kabuğa/ref sağlayıcıya bağlar, (b)
`route.params.vurgula` okur, (c) aranabilir kontrolleri `AyarCapasi` ile sarar.
Tüm ayar alt sayfaları sayfa düzeyinde `ScrollView` kullanıyor (doğrulandı;
`FlatList` tabanlı ayar sayfası yok) — yapısal uyum var, ama iş "sarmalayıcı
eklemek"ten fazladır.

---

## 8. Test planı

| Dosya | Neyi korur |
|---|---|
| `ozetler.test.ts` | Her özet; boş/eksik state'te çökmeme; **oto modda `gpsAdres`, manuel modda `seciliIlAdi`** nöbetçisi |
| `kurulumSagligi.test.ts` | Öncelik sırası; sorunsuz durumda boş dizi; kontrol #2'nin oto-mod koşulu |
| `metinKatlama.test.ts` | `İstanbul`/`I`/`ı` katlaması; `toLowerCase` regresyon nöbetçisi |
| `ayarAra.test.ts` | Türkçesiz yazımla eşleşme ("muhafiz"→"Muhafız"); boş sorgu; skor sırası |
| `aramaIndeksi.test.ts` | Her `sayfa` `AYARLAR_EKRANLARI` içinde; her `capa` `CAPALAR` içinde (saf eşitlik) |
| `AyarlarSayfasi.test.tsx` | Gruplar render; özet gösterimi; **yeni-özellik rozeti ve tanıtım kartı hâlâ var**; arama filtreleme; focus'ta tazeleme |
| `HakkindaSayfasi.test.tsx` | Debug logları satırı **yok**; Tanı satırı **yok**; güncelleme kontrolü **var** |

**Mock notu (AGENTS.md `requireNativeModule` tuzağı):** `useAyarOzetleri`
`expo-notifications`'a dokunur; bu hook'u **doğrudan veya dolaylı** yükleyen her
test dosyası köprüyü mock'lamalıdır — automock bile gerçek modülü yükler ve
suite hiç çalışmaz.

**Performans:** `AyarlarSayfasi.test.tsx` tam sayfa render'dır. Mock bileşenlere
**çocuk render ettirilmez**, sahte zamanlayıcıdan kaçınılır, `waitFor` gerçek
zamanda kullanılır (AGENTS.md test dersleri).

---

## 9. Kapsam dışı (bilinçli)

- Diğer ekranlardaki büyük-harf bölüm başlıklarının dönüştürülmesi.
- Arama sonucundan kontrolün **kendisini değiştirme** (yalnız götürür ve vurgular).
- Ayar alt sayfalarının kendi içlerinin yeniden tasarımı.
- Yedekleme sağlık kontrolü — damga ileriye dönük yazıldığı için daha önce yedek
  almış kullanıcıda **yanlış** uyarırdı.
- Ana Sayfa ve diğer sekmeler.

## 10. Doğrulama

`npm run verify` (typecheck + lint + test) geçmelidir.
