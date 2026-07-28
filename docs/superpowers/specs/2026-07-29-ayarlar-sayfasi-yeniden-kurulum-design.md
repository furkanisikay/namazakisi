# Ayarlar sayfası yeniden kurulumu (One UI esinli)

**Tarih:** 2026-07-29
**Ekranlar:** `AyarlarSayfasi.tsx` (yeniden kurulur), `HakkindaSayfasi.tsx` (sadeleşir),
tüm ayar alt sayfaları (yalnız arama çapası eklenir).

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
diline sadık kalarak** getirmek: her satır mevcut değerini gösterir, ayarlar
amaca göre gruplanır, arama alt ayarları da bulur ve bulduğu kontrolü vurgular,
üstte kurulum sağlığı kartı durur.

Yeni bir görsel kimlik icat edilmez: `useRenkler` tokenları, `FontAwesome5`,
mevcut kart yarıçapları ve buton desenleri korunur (AGENTS.md "Ekran / UI
tasarım standardı").

---

## 1. Bilgi mimarisi

Dört grup. Grup adları kullanıcının **niçin geldiğine** göre seçildi, sistem
mimarisine göre değil.

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

---

## 2. Dinamik özetler

Her satırın ikinci satırı, o ayarın **mevcut değeridir**.

### Mimari

Yeni saf modül: **`src/core/ayarlar/ozetler.ts`**. Her özet bir saf fonksiyondur;
girdisi ilgili state parçasıdır, store'a veya React'a bağımlı değildir.

```
konumOzeti({ konumModu, seciliIlAdi })         -> "İstanbul · otomatik"
takvimOzeti(takvimAyarlari)                    -> "Kapalı"
muhafizOzeti({ aktif, yogunluk })              -> "Açık · normal yoğunluk"
bildirimOzeti(vakitAyarlari, cumaAktif)        -> "5 vakit · cuma hatırlatması açık"
seriOzeti(seriAyarlari)                        -> "Tam gün: 5 namaz · gün sonu açık"
ramazanOzeti(iftarAktif, sahurAktif)           -> "İftar sayacı kapalı"
gorunumOzeti(temaModu, paletAdi)               -> "Koyu tema · Zümrüt"
yedeklemeOzeti(sonYedekTarihi)                 -> "Son yedek: 12 Temmuz" | "Henüz yedek alınmadı"
hakkindaOzeti(surum, guncellemeVar)            -> "Sürüm 0.23.28 · güncel"
```

Palet adları temada gerçekten `ad` alanıyla tanımlıdır (`Zümrüt`, `Okyanus`,
`Lavanta`, `Güneş`, `Mercan`, `Gece`) — özet bu adları kullanır, renk sıfatı
uydurmaz.

### Veri kaynakları (doğrulandı)

| Özet | Kaynak |
|---|---|
| Konum | `konumSlice` (`konumModu`, `seciliIlAdi`) |
| Muhafız | `muhafizSlice` (`aktif`, `yogunluk`) |
| Bildirimler | `vakitBildirimSlice.ayarlar` + `cumaHatirlatmaSlice` |
| Seri | `seriSlice.ayarlar` |
| Ramazan | `iftarSayacSlice` + `sahurSayacSlice` |
| Takvim | `takvimSlice.ayarlar` |
| Görünüm | `useTema()` → `tema.mod`, `palet.ad` |
| Hakkında | `UYGULAMA.VERSIYON` + `guncellemeSlice` |
| Yedekleme | **yeni** `DEPOLAMA_ANAHTARLARI.SON_YEDEK_TARIHI` (aşağıda) |

### Yeni kalıcı veri: son yedekleme zamanı

Repo genelinde son yedekleme tarihi **hiçbir yerde saklanmıyor** (arandı,
bulunamadı). `YedeklemeServisi` başarılı bir dışa aktarımdan sonra
`SON_YEDEK_TARIHI` anahtarına ISO zaman damgası yazar.

**Bilinçli karar — bu bir sağlık kontrolü DEĞİLDİR.** "Hiç yedek almamışsınız"
uyarısı verilmez: damga ileriye dönük yazıldığı için, daha önce yedek almış
mevcut kullanıcılarda uygulama bunu bilemez ve **yanlış** uyarır. Damga yalnız
satır özetini besler; yokken satır dürüstçe "Henüz yedek alınmadı" der.

### Tazeleme — kritik

Özetler **`useFocusEffect` ile sayfaya her dönüşte yeniden okunur.**

Yoksa şu yaşanır: kullanıcı Konum'a girer, şehri değiştirir, geri döner ve
satırda hâlâ eski şehri görür → "kaydedilmedi" hisseder ve işlemi tekrarlar.
Redux'tan gelen özetler zaten reaktiftir; asıl gerekçe **Redux dışı** okumalardır:

- bildirim izni durumu (`Notifications.getPermissionsAsync`)
- son yedekleme damgası (AsyncStorage)

Bunlar `useAyarOzetleri()` hook'unda tek seferlik async okumayla alınır ve aynı
focus tetikleyicisine bağlanır.

---

## 3. Durum kartı — kurulum sağlığı (imza öğesi)

Sayfanın tek cesur öğesi budur; gerisi sakin kalır (AGENTS.md: "cesareti tek bir
imza öğesinde harca").

### Neden Ana Sayfa'nın tekrarı değil

Ana Sayfa vakitleri ve seriyi gösterir. Bu kart **ayarların sağlığını** gösterir —
yalnızca Ayarlar sayfasında anlamı olan, başka hiçbir yerde söylenmeyen bilgi.

### Mantık

Saf fonksiyon: **`src/core/ayarlar/kurulumSagligi.ts`** →
`kurulumSagligi(girdi): Sorun[]` (öncelik sırasına göre sıralı döner).

| # | Kontrol | Seviye | Neden |
|---|---|---|---|
| 1 | Bildirim izni verilmemiş | kritik | Muhafız çalışır ama **hiçbir** uyarı ulaşmaz |
| 2 | Koordinat yok veya `(0,0)` | kritik | Vakitler yanlış hesaplanır (`(0,0)` bu projede "yapılandırılmadı" nöbetçisidir) |
| 3 | Muhafız kapalı **ve** hiç vakit bildirimi açık değil | uyarı | Kullanıcı hiç hatırlatma almıyor, farkında olmayabilir |
| 4 | Konum takibi açık ama `sonGpsGuncellemesi` 7+ gün eski | bilgi | Şehir değiştiyse vakitler kayar |

`Sorun` tipi: `{ id, seviye, baslik, aciklama, eylemEtiketi?, hedefSayfa? }`.

### Görünüm

- **Sorun varsa:** en öncelikli sorun tam kart olarak çizilir — ikon çipi, başlık,
  bir cümlelik açıklama, birincil eylem butonu ve (varsa) "N sorun daha" metni.
  "N sorun daha"ya dokunmak kalan sorunları listeye açar (aynı kart genişler).
- **Sorun yoksa:** kart **tek satıra daralır** — yeşil onay ikonu +
  "Kurulumunuz eksiksiz · İstanbul · muhafız açık".

Kartın duruma göre rol ve boyut değiştirmesi bilinçlidir: kurulum sağlığı yalnız
bozukken ilgi çekicidir; her zaman büyük bir kart göstermek ölü alan üretirdi.

### Renk kuralı — bu projede iki PR bunun için reddedildi

`durum.*` renkleri **yalnız dekoratiftir**: ikon rengi, sol şerit, tint arkaplan.
Gövde metni **daima** `renkler.metin` / `renkler.metinIkincil`.

Gerekçe ölçüldü: `durum.uyari` açık temada `#FFC107`; beyaz üzerinde kontrast
**~1.63:1** — normal metin için WCAG AA (4.5:1) açık farkla kırılır.
`durum.hata` = `#F44336` de beyaz üzerinde ~3.7:1, küçük metin için yetersiz.
Eylem butonu `renkler.birincil` dolgu + beyaz metindir (mevcut birincil buton
deseni), dolayısıyla güvenlidir.

---

## 4. Arama ve vurgulama

### 4.1 İndeks

Yeni: **`src/core/ayarlar/aramaIndeksi.ts`**

```ts
interface AyarIndeksKaydi {
  id: string;              // benzersiz
  baslik: string;          // "Kerahat uyarısı"
  anahtarKelimeler: string[]; // ["mekruh", "güneş", "kerahat"]
  sayfa: string;           // AyarlarStack ekran adı
  grup: string;            // "Hatırlatmalar" — sonuçta bağlam olarak gösterilir
  capa?: string;           // alt sayfadaki kontrolün çapa id'si
}
```

Üst seviye satırların **ve** alt sayfa ayarlarının kayıtları burada durur.
`capa` yoksa sonuç yalnız sayfaya götürür.

### 4.2 Eşleştirme — Türkçe katlama tuzağı

Saf fonksiyon `ayarAra(indeks, sorgu): AyarIndeksKaydi[]`.

**`toLowerCase()` KULLANILMAZ.** AGENTS.md'deki `toUpperCase()` tuzağının
ikizidir ve aramayı sessizce bozar:

- `'İstanbul'.toLowerCase()` → `'i̇stanbul'` — noktalı i, **birleşen nokta**
  (U+0307) bırakır; kullanıcının yazdığı `'istanbul'` ile eşleşmez.
- `'I'.toLowerCase()` → `'i'` — Türkçede `'ı'` olmalıdır.

Çözüm: **sabit katlama haritası** (`İ→i`, `I→ı`, `Ş→ş`, `Ğ→ğ`, `Ü→ü`, `Ö→ö`,
`Ç→ç` + ASCII) ve ek olarak aksan-duyarsız eşleşme (`s↔ş`, `g↔ğ`, `i↔ı`,
`u↔ü`, `o↔ö`, `c↔ç`) — klavyesinde Türkçe karakter kullanmayan kullanıcı da
"muhafiz" yazarak "Muhafız"ı bulabilsin. `Intl`/`localeCompare` kullanılmaz
(Hermes'te ICU varlığı garanti değil — AGENTS.md).

Skorlama basit tutulur: başlık başlangıcı > başlık içi > anahtar kelime.

### 4.3 Vurgulama

- `AyarSayfasiKabugu` bir React bağlamı sağlar: ScrollView ref + aktif çapa id.
- Aranabilir kontrol `<AyarCapasi id="kerahat">…</AyarCapasi>` ile sarılır.
- Rota parametresi `vurgula` çapayla eşleşirse: `measureLayout` → `scrollTo`,
  ardından `birincil + '20'` tinti **2 kez ~600 ms** nabızlatılır (opacity,
  native driver).
- **Reduced motion açıksa** nabız yok: sabit tint, 2 sn sonra söner.
  (`AccessibilityInfo.isReduceMotionEnabled`)
- Çapa bulunamazsa **sessizce hiçbir şey yapılmaz** — sayfa yine açılır.

### 4.4 Bayatlama koruması

İndeks elle bakım gerektirir; bayatlarsa arama var olmayan sayfaya götürür.
Nöbetçi test: **indeksteki her `sayfa` değeri `AyarlarStack`'te tanımlı bir ekran
adı olmalıdır** ve her `capa` değeri kaynakta bir `AyarCapasi id` olarak geçmelidir.

---

## 5. Başlık, bölüm etiketleri ve hareket

- Büyük "Ayarlar" başlığı içerik akışının başındadır. Yukarı kaydırınca üstte
  kompakt başlık **opacity + translateY** ile belirir. `fontSize` animasyonu
  native driver'da çalışmadığı için boyut animasyonu yerine **çapraz geçiş**
  kullanılır.
- Arama hapı yapışkandır (başlığın altında kalır).
- **Bölüm başlıkları:** `renkler.birincil` renginde, normal yazım
  ("Namaz vakitleri"). Mevcut `GRİ · BÜYÜK HARF` biçimi bırakılır; One UI deseni
  ve AGENTS.md'nin sentence-case kuralıyla uyumludur. Uygulamanın diğer
  ekranlarındaki büyük-harf başlıklarla geçici bir tutarsızlık oluşur — bilinçli
  kabul edilir, bu spec onları dönüştürmez.
- Satır grupları tek kart içinde, aralarında hairline ayraç. Kart yarıçapı ve
  gölge mevcut desenle aynı.
- Giriş animasyonu mevcut fade+slide olarak korunur; yeni animasyon eklenmez.

---

## 6. Erişilebilirlik

- Tüm satırlar `accessibilityRole="button"`, etiket = `"<başlık>. <özet>"`.
- Toggle satırlarında Switch, satırı saran Touchable'ın **kardeşidir**, içinde
  değil (AGENTS.md: Touchable `accessible` ile çocukları tek düğüme düzleştirir).
- Dokunma hedefleri ≥44dp.
- Arama alanı `accessibilityLabel="Ayarlarda arayın"`; sonuç sayısı canlı bölge
  olarak duyurulur.
- Durum kartındaki eylem butonu ayrı odaklanabilir bir düğümdür.

---

## 7. Dosya planı

**Yeni (saf çekirdek):**
- `src/core/ayarlar/ozetler.ts`
- `src/core/ayarlar/kurulumSagligi.ts`
- `src/core/ayarlar/aramaIndeksi.ts`
- `src/core/ayarlar/metinKatlama.ts` (Türkçe katlama + aksan-duyarsız eşleşme)

**Yeni (sunum):**
- `src/presentation/screens/Ayarlar/AyarGrubu.tsx`
- `src/presentation/screens/Ayarlar/AyarSatiri.tsx` (navigasyon + toggle varyantı)
- `src/presentation/screens/Ayarlar/KurulumSagligiKarti.tsx`
- `src/presentation/screens/Ayarlar/AramaAlani.tsx`
- `src/presentation/screens/Ayarlar/AramaSonuclari.tsx`
- `src/presentation/components/ayar/AyarCapasi.tsx` + `VurguBaglami.tsx`
- `src/presentation/hooks/useAyarOzetleri.ts`

**Değişen:**
- `AyarlarSayfasi.tsx` (yeniden kurulur)
- `HakkindaSayfasi.tsx` (DESTEK ve GELİŞTİRİCİ bölümleri kaldırılır)
- `AppNavigator.tsx` (yalnız `TaniGeriBildirim` rota parametresi tipi + `vurgula`)
- `YedeklemeServisi` (son yedek damgası yazımı)
- Ayar alt sayfaları (yalnız `AyarCapasi` sarmalayıcıları)

---

## 8. Test planı

| Dosya | Neyi korur |
|---|---|
| `ozetler.test.ts` | Her özet fonksiyonu; boş/eksik state'te çökmeme |
| `kurulumSagligi.test.ts` | Öncelik sırası; sorunsuz durumda boş dizi; `(0,0)` nöbetçisi |
| `metinKatlama.test.ts` | `İstanbul`/`I`/`ı` katlaması; `toLowerCase` regresyonu |
| `ayarAra.test.ts` | Türkçesiz yazımla eşleşme ("muhafiz"→"Muhafız"); boş sorgu; skor sırası |
| `aramaIndeksi.test.ts` | **Nöbetçi:** her `sayfa` navigatörde var; her `capa` kaynakta var |
| `AyarlarSayfasi.test.tsx` | Gruplar render; özet gösterimi; arama filtreleme; focus'ta tazeleme |
| `HakkindaSayfasi.test.tsx` | Debug logları satırı **yok**; Tanı satırı **yok** |

Test performansı: `AyarlarSayfasi.test.tsx` tam sayfa render'dır. AGENTS.md
dersleri geçerli — mock bileşenlere **çocuk render ettirilmez**, sahte
zamanlayıcıdan kaçınılır, `waitFor` gerçek zamanda kullanılır.

---

## 9. Kapsam dışı (bilinçli)

- Diğer ekranlardaki büyük-harf bölüm başlıklarının dönüştürülmesi.
- Arama sonucundan **kontrolün kendisini değiştirme** (yalnız götürür ve vurgular).
- Ayar sayfalarının kendi içlerinin yeniden tasarımı.
- Yedekleme sağlık kontrolü (yukarıda gerekçelendirildi).
- Ana Sayfa ve diğer sekmeler.

## 10. Doğrulama

`npm run verify` (typecheck + lint + test) geçmelidir.
