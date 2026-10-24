# Çok dil, dünya konumu, günün ayeti/hadisi, duvar kâğıdı ve uygulama simgesi — tasarım

Tarih: 2026-10-24. Durum: sahip onayı bekliyor. İlgili issue'lar: #71 (çoklu dil), #380 (günün hadisi/ayeti widget'ı), #381 (duvar kâğıdı), #382 (dinamik simge).

## 0. Neden
- Uygulama bugün yalnız Türkçe ve yalnız Türkiye hesabıyla (`turkiyeHesapParametreleri()` = Diyanet) çalışıyor. Konumsuz (elle) seçim yalnız Türkiye il/ilçesini biliyor.
- Yurt dışındaki kullanıcı ya yanlış vakit görür ya da uygulamayı hiç kullanamaz. Rakiplerde en çok oy alan şikâyetler tam da bu: vakit camiyle tutmuyor, dil yarım çevrilmiş, widget dil seçimini izlemiyor.
- Sahip isteği (2026-10-24): çok dil (tüm ekosistemde), tüm dünya için elle konum, ülkenin namaz pratiğine göre hesap, günün hadisi/ayeti widget'ı, her gün değişen duvar kâğıdı, dinamik simge.

## 1. Hedefler
1. Seçilen ülkede varsayılan vakitler o ülkenin resmî/yaygın takvimiyle ölçülen ülkelerde ±2 dk içinde örtüşür (ampirik uydurma tablosundaki ülkeler; bkz. §6.2).
2. Türkiye'de hiçbir vakit bir milisaniye bile değişmez (mevcut nöbetçiler düzenlenmeden geçer).
3. Seçicide görünen her dil ekosistemin tamamında (uygulama, bildirim, Android widget/Wear/TV, iOS widget/canlı etkinlik/saat) eksiksizdir; yarım dil seçiciye girmez.
4. GPS olmadan dünyanın her ülkesinde şehir seçilebilir.
5. Günün içeriğinin her öğesi doğrulanmış kaynak taşır ve lisansı mağaza dağıtımına uygundur.

## 2. Hedef dışı
- **Canlı çizilen simge** (Samsung Saat, Google Takvim gibi): yalnız launcher'ın kendi bileşenlerine açık, üçüncü taraf uygulama yapamaz (AOSP `IconProvider` yalnız `calendar_component_name`/`clock_component_name`'i çizer).
- **iOS'ta otomatik duvar kâğıdı:** genel API yok. Yalnız Kısayollar otomasyonu rehberi.
- **Cami ikamet tablosu (Mawaqit benzeri):** ayrı bir iş; bu tasarım yalnız hesap yöntemini kapsar.
- **Transliterasyon (Latin harfle Kur'an):** Arapça kullanıcı itirazı var; yalnız istenirse, varsayılan kapalı ve bu kapsamda değil.
- **Kendi hadis çevirimiz:** lisansı temiz, dereceli bir hadis çeviri seti yok (§6.3). Dinî denetimden geçmemiş hadis çevirisi yayımlanmaz.

## 3. Kullanıcı hikâyeleri
- Berlin'deki Türk kullanıcı olarak Diyanet'in kendi Avrupa takvimine yakın vakit görmek ve farkın nereden geldiğini bilmek istiyorum.
- Lahor'daki kullanıcı olarak mahalle camiimin okuduğu ikindiyi (asr-ı sânî) varsayılan görmek istiyorum.
- Kuala Lumpur'daki kullanıcı olarak JAKIM takvimini görmek istiyorum (adhan'ın `Singapore` hazırı 2019'dan beri Malezya'ya uymuyor).
- Konum iznini vermeyen kullanıcı olarak ülke ve şehri yazarak seçmek istiyorum.
- Arapça kullanan kullanıcı olarak widget'ın, bildirimin ve saatin de Arapça olmasını istiyorum.
- Kilit ekranında her gün bir ayet görmek istiyorum; ama önceki duvar kâğıdımın geri gelmeyeceğini önceden bilmek istiyorum.

## 4. Gereksinimler

### P0 — Konum ve hesap
- **Türkiye değişmez.** `turkiyeHesapParametreleri()` bayt bayt aynı kalır; il/ilçe seçici (OSM, ODbL) olduğu gibi kalır. Nöbetçiler (`hesapParametreleri.test.ts`, `GunesVaktiHesaplama.test.ts`, TV paritesi) düzenlenmeden geçer.
- **Dünya şehirleri ayrı varlık dosyası:** GeoNames `cities15000` (+ küçük ülkeler için `cities5000`), CC BY 4.0; OSM verisinden AYRI dosya (ODbL paylaş-benzer şartı CC BY veriye bulaşmasın). Ana pakete TS modülü olarak gömülmez, tembel yüklenen varlık olur; boyut bütçesi ve nöbetçi testi var. Üretici betik `scripts/konum/` altında, `ilce-merkezleri-uret.js` deseninde.
- **Ülke → yöntem tablosu veri olarak:** her satırda `yontem`, `ikindi` (asr-ı evvel/sânî), dakika ofsetleri, yüksek enlem kuralı, `kaynak` (URL) ve `guven` (yüksek/orta/düşük). Kaynaksız ülke `MuslimWorldLeague`'e düşer ve ekranda "genel yöntem, camiyle karşılaştırın" yazar. Nöbetçi: her satırın kaynağı ve güveni dolu.
- **İkindi ayrı bir ayardır,** bölgeye göre varsayılanı vardır. `mezhepAyari`'ndan TÜRETİLMEZ (o ayarın "vakte dokunmaz" nöbetçisi geçerli kalır). Ekranda "Asr-ı evvel (gölge 1 boy)" / "Asr-ı sânî (gölge 2 boy, Hanefî)" diye açıkça adlandırılır.
- **Sessiz değişim yok.** Yöntem yalnız kullanıcı onayıyla değişir. Mevcut kurulum (yurt dışında bile) `Turkey`'de kalır ve bir kez "bölgenizin yöntemine geçelim mi?" kartı görür. Ülke değişince aynı kart çıkar.
- **Ana ekranda yöntem görünür:** küçük bir çip ("Diyanet", "Umm al-Qura", "JAKIM"…) dokununca yöntem sayfasını açar.
- **Vakit başına kalıcı dakika ofseti** ve özel Fecr/Yatsı açısı (gelişmiş).
- **Yüksek enlem:** 48°K üstünde bölge kuralı (Norveç `SeventhOfTheNight`, Diyanet Avrupa benzetimi vb.); ekranda "yaz aylarında vakitler tahminîdir".
- **Saat dilimi cihazdan;** seçilen şehrin IANA dilimi cihazınkinden farklıysa bilgi satırı.
- **Yayma:** yöntem değişikliği konum değişikliği gibi yayılır (`KonumDegisikligiServisi.konumDegistiUygula`, `App.tsx` açılış listesi, `ArkaplanGorevServisi` muhafız erken dönüşlerinden önce). Yeni ayar anahtarı yedeklemenin üç yerine eklenir.
- **Native hesap noktaları:** TV Kotlin (`VakitHesabi.kt`, adhan2), Apple TV Swift taşıması (`TvVakitHesabi.swift`, yalnız Turkey yolu), `NamazAsistanFonksiyonlari.kt`. Hepsi yöntemi yükten almalı; yoksa yurt dışında sessizce Türkiye vakti gösterirler.
- **Özel günler:** `ozelGunler.ts` Diyanet takvimidir; Türkiye dışında "Diyanet takvimine göre" etiketiyle gösterilir ya da susar (sahip kararı).

### P0 — Çok dil
- **Yarım dil yok:** bir dil seçicide yalnız JS, Android native ve iOS hedef metinlerinin hepsi tamamken görünür (nöbetçi). Gözden geçirilmemiş diller "beta" rozeti taşır.
- **Tipli sözlük:** `tr` kaynak; diğer diller aynı anahtar kümesini tip düzeyinde zorunlu tutar (eksik çeviri `tsc` hatası). Native `values-xx/strings.xml` ve iOS `.xcstrings` aynı kaynaktan betikle üretilir.
- **Dil seçimi her yüzeye gider:** AsyncStorage + SharedPreferences + iOS app-group; Wear/TV yükü telefon dilini taşır. Dil değişince bildirim planı, sesli okuma, widget ve saat yükü yeniden kurulur.
- **Hitap kaydı:** arayüz "siz", ibadete çağrı "sen" kuralı her dilde eşlenir (Sie/du, vous/tu, Anda/kamu…). Arapça ve Urducada emir kipi cinsiyetlidir → çağrı metinleri cinsiyetsiz kalıpla kurulur.
- **Namaz adları ve fıkıh terimleri sözlükle,** serbest makine çevirisiyle değil. Büyük harf için dil başına sabit harita (`toUpperCase` yasağı sürer).
- **RTL (Arapça, Urduca, Farsça) ayrı adım:** yön değişimi yeniden başlatma ister; widget ve saat düzenleri ayrıca denetlenir.
- **Hermes:** `Intl.PluralRules` yok varsayılır (polyfill ya da elle çoğul); `RelativeTimeFormat`/`ListFormat` yok → metin sözlükte.

### P1 — Günün ayeti/hadisi (#380) ve duvar kâğıdı (#381)
- Ortak havuz `src/core/` altında; seçim tarihten deterministik (`kabulDuasi` deseni). Widget, duvar kâğıdı ve uygulama aynı gün aynı sözü gösterir.
- **Ayet:** Arapça metin Tanzil (CC BY 3.0, birebir); mealler QuranEnc (sürüm saklanır, güncelleme yolu var, metin değiştirilmez/KESİLMEZ → widget'a sığan öğe seçilir, tamamı dokununca açılır).
- **Hadis:** Türkçede yalnız repoda kaynağı doğrulanmış öğeler; diğer dillerde izin alınana kadar ayet.
- Duvar kâğıdı: Android'de açık rızalı anahtar, native çizim, günde bir; "kapatınca önceki duvar kâğıdınız geri gelmez" bilgisi (Android 13+ mevcut duvar kâğıdını okuyamaz). iOS'ta Kısayollar rehberi + App Intent görseli.

### P2 — Simge (#382)
- Önerilen: kullanıcının bir kez seçtiği alternatif simge (iki platform). Otomatik değişim önerilmez: iOS her değişimde sistem uyarısı gösterir, Android alias değişiminde ana ekran simgesi düşebilir ve sabitlenmiş kısayollar devre dışı kalır.
- Alias kurulursa `MainActivity` ETKİN kalır (`shortcuts.xml`, asistan ve `NamazModu` ona bağlı); LAUNCHER filtresi alias'lara taşınır. Suçluluk imgesi (Duolingo'nun "eriyen baykuşu") yasak — samimiyet kuralı.

## 5. Dalgalar
1. **W2 Dünya konumu + yöntem:** veri, ayar, ekran, yayma, native yük.
2. **W3 i18n altyapısı:** Türkçe değişmeden metin çıkarımı, nöbetçiler, `docs/ajan/coklu-dil.md`.
3. **W4 Diller:** önce İngilizce; sonra QuranEnc meali olan ve namaz adları yerel otoriteden doğrulanabilen diller; RTL en sonda ayrı adım.
4. **W5 Native ve mağaza metinleri:** Android `values-xx`, Wear, TV, iOS hedefleri, izin metinleri, uygulama adı.
5. **W6:** #380 → #381 → #382.

## 6. Araştırma bulguları (2026-10-24)

### 6.1 Rakiplerdeki kullanıcı şikâyetleri
Kaynak: 14 rakipten ~30 bin Google Play yorumu (İngilizce, Türkçe, Arapça) + haber. Reddit giriş duvarı nedeniyle Reddit/forum alıntısı ALINAMADI. Play bağlantıları kazıyıcının verdiği yorum kimlikleridir, tarayıcıda tek tek açılıp doğrulanmadı.

| Tema | Alıntı (👍 = yararlı oyu) | Bağlantı |
|---|---|---|
| Ezan sessize saygı | "notification sound even though you turn off all notifications… acts like an alarm" (Quran Majeed 1★ 👍363) | https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed&reviewId=93ac1d60-1978-46d5-96eb-6489d359ee5d |
| Geciken alarm | "Late reminders for Azan, not accurate with time" (Al-Moazin 2★ 👍640) | https://play.google.com/store/apps/details?id=com.parfield.prayers.lite&reviewId=6fa0c5bb-4667-4dd2-ab7f-fd3b4698f417 |
| Yöntem sessizce değişiyor | "calculation method settings always gets changed to the UISK… only to find out during prayer times" (Athan 2★) | https://play.google.com/store/apps/details?id=com.athan&reviewId=754ae254-c386-498f-81d0-f749bc5379a9 |
| Resmî takvimle uyuşmazlık | "payer timings are not matching with the official ones in… Abu Dhabi and Dubai" (Salatuk 2★ 👍196) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=e757f34f-278a-480f-a880-e05a73daddcf |
| Diyanet'le uyuşmazlık | Diyanet'le tutmuyor, erken ezan "günaha sokar" (Quran Majeed 1★, Türkçe) | https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed&reviewId=99cd5147-57af-424b-a450-4368ce3bb400 |
| Özel açı | "In Kelowna, the angles are 15 and 17 degrees (according to local Mufti), but this is not an option" (Salatuk 3★) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=142261d6-0fe3-4bdb-aa03-1d6af1cded55 |
| Ofset kalıcı değil | "even if you manually adjust the time the next day is off" (Pillars 3★) | https://play.google.com/store/apps/details?id=com.pillars.pillars&reviewId=02121a53-76f1-452d-9b59-8b5fc160c3ff |
| Saat dilimi / yaz saati | "Jordan time is utc+3 since more than a year and you still haven't updated" (Salatuk 1★ 👍116) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=c0613cc1-4576-4503-a386-c1d21f11bedd |
| Konum zorlaması | "Spy app! You don't have to force us to activate location" (Salatuk 1★ 👍205) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=a76b124d-95e4-4f51-a555-5f7a6fb66a83 |
| Eksik ülke | "Nigeria is not included in the list of available countries" (Prayer Now 3★) | https://play.google.com/store/apps/details?id=com.AppRocks.now.prayer&reviewId=722c7e16-9d16-4917-8f9a-d5e6553856f6 |
| Yarım çeviri | Dil Türkçe seçili ama çok şey İngilizce (Athan 4★, Türkçe) | https://play.google.com/store/apps/details?id=com.athan&reviewId=8392de75-83f0-492f-a6f8-899aea04c0a6 |
| Yarım çeviri | Arapça eksik, başka dilde metinler var (Muslim Pro 1★ 👍514, Arapça) | https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro&reviewId=86d413a1-0e53-4321-945d-648456c78a5f |
| Widget dili izlemiyor | "When I have the Arabic language selected… [widget] reverts to English" (Salatuk 3★ 👍448) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=badc3623-fadc-43ff-a0cc-05d7fe5ed8af |
| Hadis kaynağı | "hadith references in this app are most of the time incorrect" (Islam360 3★) | https://play.google.com/store/apps/details?id=com.islam360&reviewId=33098820-7366-49ba-8c24-9f73722517d6 |
| Tekrar | "only picks from a selected few verses causing repeats quite often" (Daily One Quran Verse 3★) | https://play.google.com/store/apps/details?id=daily.quran&reviewId=58121d62-4a90-4d6c-8757-223843a13cf6 |
| Ücretli widget | "widget… has become a 'premium' feature available through paid subscription only" (Athan 1★ 👍184) | https://play.google.com/store/apps/details?id=com.athan&reviewId=bd2c1160-d54f-4c8d-85cf-3a5f80b4eaec |
| Widget bayatlıyor | "the widget stopped updating, meaning I had probably been praying late for a few days" (Salatuk 2★) | https://play.google.com/store/apps/details?id=com.masarat.salati&reviewId=ddf40ba6-65ef-4355-92ac-6ac1c1d313a7 |
| Reklam | "an ad full of music blaring right in the middle of the athan" (Athan 1★ 👍366) | https://play.google.com/store/apps/details?id=com.athan&reviewId=10fb0c41-da21-4fa8-89f0-f75b345119b6 |
| Gizlilik | Muslim Pro konum verisi X-Mode üzerinden ABD askerî yüklenicilerine (2020) | https://www.vice.com/en/article/g5bq89/muslim-pro-location-data-military-xmode |
| Suçluluk simgesi | Duolingo'nun hasta/eriyen baykuş simgesi tepkisi | https://www.creativebloq.com/design/logos-icons/is-duolingo-okay |

Diğer: akşamda gün dönümü (hicri tarih) isteği dört ayrı yorumda; dil talepleri Türkçe, Urduca (Roman Urdu dahil), Hintçe, Endonezce, Peştuca, Farsça, Svahili, Tamilce, Amharca, Yoruba (örneklem yalnız TR/EN/AR yorumları, yanlı). Makine çevirisi şikâyeti 30 binde yalnız 2: asıl sorun yarım çeviri.

### 6.2 Ülkelere göre hesap yöntemi
Ampirik (E): otoritenin 2026 tablosu adhan 4.4.3'e ofsetsiz uyduruldu; açı mevsimler boyunca ±0,3° içinde sabit kaldı, yani hepsi sabit açı + sabit dakika ofseti kullanıyor.

| Otorite / şehir | Fecr | Yatsı | Güneş | Öğle | İkindi (A1) | Akşam |
|---|---|---|---|---|---|---|
| Diyanet İstanbul (kontrol) | 18,0° | 17,15° | −7,1 | +5,1 | +5,2 | +7,8 |
| Diyanet Berlin (Eki–Kas) | 18,05° | 16,2° | −7,3 | +5,0 | +5,9 | +8,2 |
| Diyanet Oslo (Eki–Kas) | 18,05° | 16,15° | −7,8 | +5,0 | +6,9 | +8,4 |
| JAKIM (6 bölge) | 17,3–17,9° | 18,3–18,6° | −2…+2 | +2…+4 | +1…+3 | +1…+3 |
| MUIS Singapur | 19,85° | 18,1° | +0,6 | +1,6 | +0,5 | +0,7 |
| Kemenag Cakarta | 19,45° (≈20° −3 dk) | 18,6° | −3,2 | +3,5 | +2,6 | +3,2 |
| Ürdün Evkaf, Amman | 18,05° | 18,1° | −6,3 | +0,2 | +0,8 | +6,5 |
| IZ BiH Saraybosna | 18,0° | 16,0° | −6 | +1 | −0,3 | +6 |

Ülke varsayılanları (güven: Y/O/D):

| Ülke | Yöntem (adhan) ve ayar | İkindi | Güven |
|---|---|---|---|
| Türkiye | `Turkey` | A1 | Y |
| Suudi Arabistan | `UmmAlQura`, Ramazan'da yatsı +30 dk | A1 | Y |
| BAE / Katar / Kuveyt | `Dubai` / `Qatar` / `Kuwait` | A1 | O |
| Mısır | `Egyptian` | A1 | Y |
| Ürdün | `Other` 18/18, güneş −6, akşam +6 | A1 | O |
| Pakistan / Hindistan / Bangladeş / Afganistan | `Karachi` | A2 (Kerala A1) | O |
| Endonezya | `Other` 20/18 + ihtiyat (fecr +3, güneş −3, öğle +3, ikindi +2, akşam +3, yatsı +2) | A1 | Y |
| Malezya | `Other` 18/18 + ~+2 ihtiyat (`Singapore` DEĞİL) | A1 | Y |
| Singapur | `Singapore` | A1 | Y |
| Bosna-Hersek | `Other` 18/16, güneş −6, öğle +1, akşam +6 | A1 | Y |
| İran / Şia | `Tehran`; genel Caferî `Other` 16/14, akşam açısı 4° | — | O |
| ABD | `NorthAmerica` (FCNA 15/15) | A1 (Güney Asya camileri A2) | Y |
| Kanada | `Other` 13/13 (FCNA) | karışık | Y |
| Birleşik Krallık | `MoonsightingCommittee` en yakın; Londra ortak tablosu gözlemle kurulur | A1 + A2 ikisi | Y (formül yok) |
| Norveç | `SeventhOfTheNight` + MWL/Karachi | A2 olası | O |
| Almanya, Avusturya, Hollanda, Belçika, İsviçre (Türk diasporası) | Diyanet Avrupa: 45° üstünde yatsı takdirî; `Turkey` yatsıyı 5–7 dk GEÇ verir | A1 | O |
| Fas / Cezayir / Tunus | `Other` 19/17 / `MuslimWorldLeague` / 18/18 | A1 | D |
| Orta Asya, Afrika'nın çoğu, Körfez'in kalanı | bilinmiyor → `MuslimWorldLeague` + "camiyle karşılaştırın" | bölgeye göre | D |

Tuzaklar: adhan'ın `Singapore` hazırı Malezya için yanlış (MKİ 116, Kasım 2019, sabah 8 dk geç); ikindi nüfusun mezhebini izlemez (Türkiye ve Bosna Hanefî ama A1 okur); dakika ofsetleri iftar için açılar kadar önemli (akşamda 3–8 dk); Endonezya'da Kemenag 20° / Muhammediye 18°; Şia akşamı güneş batışından ~15–20 dk sonra (tahmin); Tataristan yazın formülsüz "göreli" yöntem kullanır.

Kaynaklar: adhan `CalculationMethod.ts` https://github.com/batoulapps/adhan-js/blob/master/src/CalculationMethod.ts · FCNA https://fiqhcouncil.org/the-suggested-calculation-method-for-fajr-and-isha/ · Londra https://londonsalahtimes.com/technical · IRN https://irn.no/prosjekter/felles-bonnetid/ · Diyanet Avrupa açıklaması https://www.diyanet.be/ (imsak-yatsı açıklaması PDF) · 45. enlem kararı https://kurul.diyanet.gov.tr/Cevap-Ara/Karar/4093/45-enlemin-otesinde-namaz-vakitleri · JAKIM https://www.e-solat.gov.my · MKİ 2019 https://www.bharian.com.my/berita/nasional/2019/11/633306/waktu-subuh-lewat-8-minit-babitkan-seluruh-negara-jakim · MUIS 2026 tablosu (by.gov.sg) · Kemenag 20° https://www.nu.or.id/nasional/kemenag-kriteria-waktu-subuh-20-derajat-benar-secara-fiqih-dan-sains-fDnQZ · Ürdün https://www.awqaf.gov.jo/ar/Pages/PrayerTime · IZ BiH https://api.vaktija.ba/vaktija/v1/77/2026/6 · ECFR https://www.e-cfr.org/blog/2017/11/04/eleventh-ordinary-session-european-council-fatwa-research/ · Tataristan https://trt-tv.ru/2025/07/28/dum-rt-izmenit-raspisanie-namazov-s-avgusta/

Erişilemeyen: habous.gov.ma (503), awqaf.gov.ae (JS uygulaması).

### 6.3 Lisanslar (canlı sayfalardan, 2026-10-24; hukuki görüş değildir)
- **Şehirler:** GeoNames CC BY 4.0 (GPLv3 uyumlu; atıf "GeoNames (geonames.org), CC BY 4.0" + değiştirildi notu). Yerel adlar Wikidata (CC0), ülke adları Unicode CLDR (Unicode v3). OSM verisinden ayrı dosya.
- **Kur'an Arapça:** Tanzil, CC BY 3.0, değiştirilmeden; kaynak ve tanzil.net bağlantısı.
- **Mealler:** Tanzil'deki mealler "non-commercial" → kullanılmaz. QuranEnc koşulları: değiştirme yok, yayımcı ve kaynak, sürüm numarası, en son sürüme güncelleme, uygunsuz reklam yok. Anahtarlar: `turkish_rwwad`, `english_saheeh`, `indonesian_affairs`, `urdu_junagarhi`, `bengali_zakaria`, `french_hameedullah`, `german_bubenheim`, `russian_aboadel`, `malay_basumayyah`, `persian_ih`, `bosnian_korkut`, `albanian_nahi`, `spanish_garcia`, `uzbek_sadiq`. Diyanet meali QuranEnc'te yok; yazılı izin gerekir. Elmalılı yalnız 1935–38 özgün metni (sadeleştirilmiş baskılar telifli).
- **Hadis:** lisansı temiz, dereceli çevrimdışı set bulunamadı. `fawazahmed0/hadith-api` Unlicense ama çeviri ve dereceler telifli kaynaklardan; sunnah.com izin ister.
- **Kütüphaneler:** i18next, react-i18next, expo-localization, Lingui: MIT; react-intl: BSD-3.
- **Topluluk çevirisi:** Weblate Libre (açık proje). Crowdin OSS çevirileri ortak belleğe akıtır.
- Atıflar `THIRD-PARTY-DATA` dosyasında ve uygulamada "Veri kaynakları" satırında toplanır.

### 6.4 Platform
- `android/` elle bakıldığı için `expo-localization` eklentisinin Android kısmı (locales_config, `localeConfig`, `configChanges`) elle yazılır. Android 12 ve altında receiver/widget bağlamı uygulama dilini görmez → tek yardımcı `yerelBaglam(context)`.
- Manifestteki `DATE_CHANGED` alıcısı API 26+ için ölü (örtük yayın istisna listesinde değil). `LOCALE_CHANGED` listede.
- iOS widget uygulama başına dili izlemez (iOS 16.1/17/18 regresyonu) → dil app-group'a yazılır, hedefler `Bundle(path: "<dil>.lproj")` ile okur.
- Native metin hacmi: Android Kotlin 289, Wear+TV 698 Türkçe literal; iOS hedeflerinde metin kataloğu yok. JS tarafında ~3.600 arayüz metni (ilçe adları hariç).
- Duvar kâğıdı: `SET_WALLPAPER` normal izin; arka planda `WallpaperManager.setBitmap` çalışır; mevcut duvar kâğıdı okunamaz → geri yüklenemez (Play "kolayca geri alınabilmeli" kuralıyla gerilim). `react-native-view-shot` headless'te çalışmaz → native çizim.

### 6.5 Doğrulanmayanlar
Reddit/forum alıntıları; Bahreyn, Umman, Orta Asya, Afrika'nın çoğu için yöntem; Diyanet'in güncel Avrupa yatsı kuralı (yayımlanan "akşam + 1 sa 20 dk" kuralı canlı tablolarla tutmuyor); Samsung'da kilit ekranı duvar kâğıdı ve alias davranışı; Wear OS ve Google TV'de uygulama başına dil arayüzü.

## 7. Sahip kararları (2026-10-24)
1. **Hesap:** Türkiye dışında varsayılan yerel otoritenin takvimidir (Güney Asya'da ikindi asr-ı sânî). Caferî yöntem yalnız elle seçilir. AGENTS.md'deki "Hanefî asr-ı sânî KULLANMA" kuralı Türkiye'ye (Diyanet profili) daraltılır; Türkiye bayt bayt aynı kalır.
2. **Simge:** Android'de vakte göre değişen simge (alias; `MainActivity` etkin kalır, değişim vakit başına en fazla bir ve yalnız kullanıcı açarsa). iOS'ta yalnız tek seferlik seçim. Yan etkiler (ana ekran simgesinin düşmesi, sabitlenmiş kısayol) ayar ekranında söylenir.
3. **İçerik:** Türkçe dışında yalnız ayet (Tanzil + QuranEnc, sürümlü). Hadis yalnız Türkçede ve repoda kaynağı doğrulanmış öğelerden. Arayüz çevirileri sözlükle hazırlanır; ana dili konuşan biri gözden geçirene kadar "beta" rozetiyle çıkar.
4. **Önce sor onayları:** yeni bağımlılıklar (`expo-localization`, gerekirse `intl-pluralrules`), `android/`/`wear/`/`tv/`/`targets/` native değişiklikleri, `SET_WALLPAPER`, iş akışı düzenlemeleri ve dalda CI koşuları onaylandı.

## 8. Açık sorular (sahip) — kararlarla kapandı (bkz. §7)
1. Türkiye dışında hesap politikası ve AGENTS.md'deki "Hanefî asr-ı sânî KULLANMA" kuralının yalnız Türkiye'ye daraltılması.
2. Şia (Caferî) desteği ve adlandırması.
3. Dil listesi ve gözden geçirilmemiş dillerin "beta" çıkıp çıkmayacağı.
4. Ayet/hadis çeviri kaynakları (QuranEnc, Diyanet'ten izin).
5. Simge: tek seferlik seçim mi, vakte göre değişim mi.
6. Yeni bağımlılıklar, `SET_WALLPAPER`, `android/`/`wear/`/`tv/`/`targets/` native değişiklikleri, iş akışı düzenlemeleri ve dalda CI koşuları.
