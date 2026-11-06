# Sıradaki arayüz dilleri — araştırma özeti (2026-10-24)

Kapsam: 20 aday dil. İlk 10 dil (ar, id, de, fr, ru, ur, bn, ms, bs, az) tam derinlikte, kalanlar (fa, sq, uz, kk, es, nl, hi, ha, sw, so) tablo + QuranEnc + çoğul + bir otorite/şikâyet denemesiyle incelendi. Kaynağı bulunamayan hücreler "doğrulanamadı" diye işaretli. Hesap yöntemi tablosu bu belgede tekrarlanmadı (spec §6.2).

---

## 0. Kısa sonuç

- **LTR adımı (önce):** 1 Endonezce · 2 Almanca · 3 Fransızca · 4 Rusça (önce QuranEnc betik açığı kapatılmalı) · 5 Boşnakça · 6 Malayca
- **RTL adımı (ayrı iş):** 7 Arapça · 8 Urduca. Toplam kullanıcı tabanında Arapça birinci sırada. Ancak RTL altyapısı (forceRTL, ayna düzen, native widget) bitmeden açılmamalı.
- **Sonra:** Bengalce, Azerbaycanca, Arnavutça, İspanyolca, Farsça (RTL), Felemenkçe, Özbekçe, Kazakça, Hintçe, Hausa, Svahili, Somalice.
- **Üç engel bulundu:** (1) QuranEnc'in liste API'si Rusça, Bengalce, Malayca, Kazakça ve Boşnakça Korkut çevirisini döndürmüyor, bu yüzden `ayet-mealleri-uret.js` bu dillerde hata verir ve sürüm numarası okunamaz (§1). (2) Kandil ülke listesi resmî tatil verisiyle çelişiyor: Endonezya, Malezya, Pakistan, Bangladeş ve Mısır'da Mevlid ve bazı kandiller devlet tatili (§5). (3) **Azerbaycan'da iki sahip kararı çakışıyor.** Karar 1 "Türkiye dışında varsayılan yerel otoritenin takvimi" diyor, karar 2 "Caferî yalnız elle seçilir" diyor. Oysa QMİ'nin resmî tablosu Caferî düzende: akşam ezanı gün batımından 14 dk sonra ve tabloda "Gecə yarısı" satırı var (§5). Hangisinin geçerli olacağına karar verilmeli.

---

## 1. QuranEnc (canlı, 2026-10-24)

Kaynaklar: tam anahtar listesi `https://quranenc.com/en/home` sayfasındaki `browse/<anahtar>` bağlantılarından (163 anahtar), sürümler `https://quranenc.com/api/v1/translations/list` adresinden (76 kayıt). Koşullar "Terms and Policies" bölümünde (https://quranenc.com/en/home/api/): içerik değiştirilmez, yayımcı ve kaynak (QuranEnc.com) belirtilir, sürüm numarası yazılır, en son sürüme güncellenir, uygunsuz reklam konmaz.

**Bulgu (repo kısıtı):** `scripts/icerik/ayet-mealleri-uret.js` künyeyi `translations/list/${dil}` adresinden okuyor ve bulamazsa hata veriyor. Bu adres `ru`, `bn`, `ms`, `kk`, `ar` ve `tt` için **boş** dönüyor (`{"translations":[]}`). Oysa `translation/aya/<anahtar>/…` aynı çevirileri sunuyor: `russian_rwwad`, `russian_aboadel`, `bengali_zakaria`, `malay_basumayyah`, `kazakh_altai`, `bosnian_korkut`, `french_hameedullah` ve `uzbek_sadiq` için HTTP 200 alındı. Bu çevirilerin sürüm numarası API'den okunamıyor, dolayısıyla QuranEnc'in 3. şartı (sürüm numarası) karşılanamıyor. Çözüm yolları (karar sahibinin): sürüm numarasını sqlite/pdf indirmesinden ya da QuranEnc'e yazarak almak ya da yalnız API listesindeki anahtarları kullanmak. Browse sayfasında sürüm metni yok (denendi).

| Dil | Anahtar · sürüm (API listesinde ✓) | API listesinde YOK (sürüm okunamıyor) | Not |
|---|---|---|---|
| Arapça | — (meal yok) | `arabic_mokhtasar`, `arabic_moyassar`, `arabic_saadi`, `arabic_seraj`, `arabic_nafahat`, `arabic_yaseer` | Bunlar **tefsir**, meal değil. Açık soru: §10 |
| Endonezce | `indonesian_affairs` 1.0.1 (Din İşleri Bakanlığı = Kemenag), `indonesian_sabiq` 1.1.3, `indonesian_complex` 1.0.1 | `indonesian_saadi` (tefsir), `indonesian_mokhtasar` | Resmî otoritenin meali var |
| Malayca | — | `malay_basumayyah` | Tamamı API dışında |
| Urduca (RTL) | `urdu_junagarhi` 1.1.3 | `urdu_saadi` (tefsir) | |
| Bengalce | — | `bengali_zakaria` (metin içinde `[১]` dipnot işareti), `bengali_rwwad`, `bengali_mokhtasar` | |
| Farsça (RTL) | `persian_ih` 1.1.3 | `persian_saadi`, `dari_badkhashani` (Darî) | |
| Fransızca | `french_rashid` 1.0.3, `french_montada` 1.0.0 | `french_hameedullah` | lisans-ozet'teki `french_hameedullah` API dışında |
| Almanca | `german_bubenheim` 1.1.4, `german_rwwad` 1.0.15 | `german_aburida` | |
| Boşnakça | `bosnian_rwwad` 2.0.4, `bosnian_mihanovich` 1.1.0 | `bosnian_korkut` | lisans-ozet'teki `bosnian_korkut` API dışında |
| Arnavutça | `albanian_nahi` 1.1.0, `albanian_rwwad` 1.0.5 | — | |
| Azerbaycanca | `azeri_musayev` 1.0.4 | `azeri_mokhtasar` | |
| Rusça | — | `russian_rwwad`, `russian_aboadel`, `russian_saadi` | Tamamı API dışında |
| Özbekçe | `uzbek_rwwad` 1.0.4, `uzbek_mansour` 1.0.0 | `uzbek_sadiq` (`[2]` dipnot işareti), `uzbek_moyassar` | **Üçü de KİRİL** (1:2 okundu: "Ҳамд оламлар Парвардигори…") |
| Kazakça | — | `kazakh_altai` (Kiril) | |
| Hausa | `hausa_gummi` 1.2.2 | — | |
| Svahili | `swahili_rwwad` 1.0.5, `swahili_barawani` 1.0.1 | `swahili_abubakr` | |
| Somalice | `somali_yacob` 1.0.26 | — | |
| Felemenkçe | `dutch_center` 2.0.10 | — | |
| İspanyolca | `spanish_garcia` 1.0.2, `spanish_montada_eu` 1.0.1, `spanish_montada_latin` 1.0.1 | `spanish_garcia_eu` | |
| Hintçe | `hindi_omari` 1.1.5 | `hindi_mokhtasar` | |
| (Tatarca) | — | — | QuranEnc'te yok |

Not: Bazı mealler metnin içinde dipnot işareti taşıyor (`bengali_zakaria` "[১]", `uzbek_sadiq` "[2]"). "Birebir, kısaltmadan" kuralı bu işaretlerin nasıl gösterileceğine karar gerektiriyor (§10).

---

## 2. Ana tablo

Kaynaklar: Müslüman nüfusu **ülkeye göre** Pew 2010–2020 veri setinden (https://www.pewresearch.org/wp-content/uploads/sites/20/2025/06/Religious-Composition-2010-2020-dataset.zip, 2020 yuvarlanmamış sayılar). Bu sayılar o dili **konuşanları** göstermez; dil eşlemesi bana ait. Dünya toplamı 2,02 milyar. Rakip uygulamaların dil listeleri App Store `languageCodesISO2A` alanından alındı (iTunes Lookup API, 2026-10-24; uygulama içi dil listesiyle aynı olmayabilir). Rakip sayısı beş uygulama üzerinden: Muslim Pro (22 dil), Muslim App/Assistant (19), Athan (9), Mawaqit (21), Pillars (2: EN, TR). Ek olarak:
- "Ezan Vakti Namaz Vakitleri Pro" (iOS, Muhammed Tanrıverdi, id1372054007): yalnız TR. Görevde kastedilen Android "Ezan Vakti Pro" ile aynı uygulama olup olmadığı doğrulanmadı.
- Hisnul Muslim için üç ayrı uygulama bulundu: Technology Maze (id603357832) yalnız EN; Greentech "Dua & Zikr" (id1402550533) BN ve EN; Quanticapps (id684520441) AR, NL, EN, FR ve DE.

| Dil | Ana ülkeler (Pew 2020 Müslüman) | Rakip (5 uygulamada) | QuranEnc | Yön | CLDR çoğul (tam sayı) | TTS Android / iOS |
|---|---|---|---|---|---|---|
| Arapça | Arap Birliği (Somali, Cibuti ve Komor hariç 19 ülke) ≈ 417 M; ayrıca TR'deki Suriyeliler ≈ 2,26 M | 4/5 | Tefsir var, meal yok | **RTL** | zero, one, two, few, many, other | ✓ / sayfada yok |
| Endonezce | ID 239 M (%87) | 4/5 | ✓ API (Kemenag) | LTR | other | ✓ / ✓ |
| Malayca | MY 21,7 M, BN 0,37 M, SG 0,91 M | 3/5 | Var, API dışında | LTR | other | ✓ / ✓ |
| Urduca | PK 226,9 M; IN 213 M (dil payı doğrulanamadı) | 3/5 | ✓ API | **RTL** | one, other | ✓ / sayfada yok |
| Bengalce | BD 151,4 M; IN (Batı Bengal) | 3/5 | Var, API dışında | LTR | one (0 ve 1), other | ✓ / ✓ "Bengali (India)" |
| Farsça/Darî | IR 87,5 M, AF 39,0 M, TJ 9,6 M | 2/5 | ✓ API (`persian_ih`) | **RTL** | one (0 ve 1), other | ✗ / ✓ "Farsi" |
| Fransızca | FR 6,0 M, BE 0,79 M; Mağrip ve Batı Afrika ikinci dil | 4/5 | ✓ API | LTR | one (**0 ve 1**), many (1e6), other | ✓ / ✓ |
| Almanca | DE 5,48 M, AT 0,74 M, CH 0,53 M | 4/5 | ✓ API | LTR | one, other | ✓ / ✓ |
| Boşnakça | BA 1,77 M (%54) + diaspora | 1/5 (Mawaqit) | ✓ API | LTR | one, few, other | ✓ / sayfada yok |
| Arnavutça | AL 2,14 M, XK 1,65 M, MK 0,65 M | 1/5 (Mawaqit) | ✓ API | LTR | one, other | ✓ / ✓ |
| Azerbaycanca | AZ 9,64 M (%95) | 2/5 | ✓ API | LTR | one, other | ✗ / ✗ |
| Rusça | RU 12,0 M; Orta Asya ortak dili (KZ 15,2 M, UZ 32,1 M, KG 6,1 M, TJ 9,6 M) | 3/5 | Var, API dışında | LTR | one, few, many, other | ✓ / ✓ |
| Özbekçe | UZ 32,1 M | 0/5 (Muslim Muna'da var) | ✓ API, yalnız Kiril | LTR | one, other | ✗ / ✗ |
| Kazakça | KZ 15,2 M (%78) | 0/5 (Adhan Times'da var) | Var, API dışında | LTR | one, other | ✗ / ✓ |
| Hausa | NG 120 M + NE 23,3 M (Hausa payı doğrulanamadı) | 0/5 (Namaz-NVAPPS'te var) | ✓ API | LTR | one, other | ✗ / ✗ |
| Svahili | TZ 18,2 M, KE 5,7 M | 0/5 (Azan Time Pro'da var) | ✓ API | LTR | one, other | ✓ "Kenya" / ✗ |
| Somalice | SO 16,6 M, DJ 1,08 M + diaspora | 0/5 (FivePrayer'da var) | ✓ API | LTR | one, other | ✗ / ✗ |
| Felemenkçe | NL 0,97 M, BE 0,79 M | 3/5 | ✓ API | LTR | one, other | ✓ / ✓ |
| İspanyolca | ES 1,70 M + Latin Amerika (küçük) | 4/5 | ✓ API (3 meal) | LTR | one, many (1e6), other | ✓ / ✓ |
| Hintçe | IN 213 M (Hintçe kullanan Müslüman payı doğrulanamadı) | 2/5 | ✓ API | LTR | one (0 ve 1), other | ✓ / ✓ |

Kaynaklar:
- Çoğul kuralları: Node (ICU 77.1, CLDR 47) `Intl.PluralRules` (örnek: fr 0→one, hi/bn/fa 0→one, ar 11→many, 100→other); kural tablosu: https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html. `src/core/dil/cogul.ts`'te ar, id, ms, ur, bn, fa, fr, de, bs, sq, az, ru, uz, kk için kural **zaten yazılı**. es, nl, hi, ha, sw, so yok: es fransızca kuralına benzer (one yalnız n=1, many 1e6), hi `sifirBir` ile aynı, diğerleri `birDiger`.
- TTS Android: Google'ın TalkBack TTS dil listesi https://support.google.com/accessibility/android/answer/11101402 (Farsça, Azerbaycanca, Özbekçe, Kazakça, Hausa, Somalice listede YOK).
- TTS iOS: https://www.apple.com/ios/feature-availability/ "VoiceOver, Live Speech, Read & Speak" bölümü (2026-10-24). Arapça, Urduca, Boşnakça, Azerbaycanca, Özbekçe, Svahili, Somalice ve Hausa listede **yok**. Arapçanın listede olmaması beklenmedik. Cihazda denenmeli; doğrulanamadı.
- Rakip dilleri: `https://itunes.apple.com/lookup?id=388389451,1137963102,505858403,1460522683,1559086853,1372054007,603357832`.

---

## 3. Hitap ve dilbilgisi (çeviri maliyeti)

| Dil | Yönetim ("siz") | Emir kipi cinsiyetli mi? | "Kıldım" gibi 1. tekil geçmiş zaman cinsiyetli mi? | Kaynak |
|---|---|---|---|---|
| Arapça | Resmî bağlamda saygı çoğulu أنتم; Mısır'da حضرتك | **Evet** (اُكْتُبْ / اُكْتُبِي) | Hayır (كَتَبْتُ tek biçim; tablodan okundu) | https://en.wikipedia.org/wiki/T%E2%80%93V_distinction_in_the_world%27s_languages · https://en.wikipedia.org/wiki/Arabic_verbs |
| Endonezce | **Anda**; yabancıya kamu/kau "kaba" sayılır | Hayır (dilbilgisel cinsiyet yok) | Hayır | T–V sayfası · https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Malayca | doğrulanamadı | Hayır (dilbilgisel cinsiyet yok) | Hayır | https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Urduca / Hintçe | **āp** (tum samimi, tū çok samimi/kaba). Emirde üç kademe var | Paradigmada cinsiyet yok | Hayır: geçişli perfektifte fiil **nesneyle** uyuşur ("namaz" dişil). Ancak geniş, şimdiki ve gelecek zaman konuşanın cinsiyetine göre çekilir (-tā/-tī, -gā/-gī) | https://en.wikipedia.org/wiki/Hindustani_grammar |
| Bengalce | **apni** (tumi samimi, tui çok yakın) | Hayır (dilbilgisel cinsiyet yok) | Hayır | T–V sayfası · https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Farsça | **šomā** (to samimi) | Hayır (dilbilgisel cinsiyet yok) | Hayır | T–V sayfası · https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Fransızca | **vous** / tu | doğrulanamadı | doğrulanamadı | T–V sayfası |
| Almanca | **Sie** / du | doğrulanamadı | doğrulanamadı | T–V sayfası |
| Boşnakça | **vi** / ti | doğrulanamadı | **Evet**: klanjao sam / klanjala sam (l-ortacı) | T–V sayfası · https://en.wikipedia.org/wiki/Serbo-Croatian_grammar |
| Rusça | **вы** / ты | Hayır | **Evet**: -л / -ла (помолился / помолилась) | T–V sayfası · https://en.wikipedia.org/wiki/Russian_grammar |
| İspanyolca | **usted** / tú | doğrulanamadı | doğrulanamadı | T–V sayfası |
| Felemenkçe | **u** (gayriresmî biçim sayfada açık değil) | doğrulanamadı | doğrulanamadı | T–V sayfası |
| Azerbaycanca, Özbekçe, Kazakça | doğrulanamadı | Hayır (Türk dilleri, cinsiyet yok) | Hayır | https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Arnavutça, Somalice | doğrulanamadı | Dilde dilbilgisel cinsiyet var (sq: eril/dişil/nötr; so: eril/dişil); fiile yansıması doğrulanamadı | doğrulanamadı | https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Svahili | doğrulanamadı | 16 isim sınıfı (cinsiyet değil, uyum sistemi); fiile yansıması doğrulanamadı | doğrulanamadı | https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |
| Hausa | doğrulanamadı | Yalnız Bauchi ve Zaria lehçelerinde cinsiyetsiz; standart Hausa'da cinsiyet var (fiile yansıması doğrulanamadı) | doğrulanamadı | https://en.wikipedia.org/wiki/List_of_languages_by_type_of_grammatical_genders |

Sonuç: Endonezce, Malayca, Bengalce, Farsça ve Türk dillerinde cinsiyet sorunu yok; bu dillerde çeviri maliyeti düşük. Rusça ve Boşnakçada "Kıldım" düğmesi ve kabul duası kalıpları için **cinsiyetsiz kalıp** gerekir (isim cümlesi, örneğin "Namaz kılındı" karşılığı). Bu, `coklu-dil.md`'deki Arapça kuralının genişletilmesidir.

---

## 4. Vakit adları ve terimler (yerel otoritenin ya da yaygın kaynağın biçimi)

| Dil | İmsak/Sabah | Güneş | Öğle | İkindi | Akşam | Yatsı | Kaynak |
|---|---|---|---|---|---|---|---|
| Arapça (Ürdün Evkaf) | الفجر | الشروق | الظهر | العصر | المغرب | العشاء | https://www.awqaf.gov.jo/ar/Pages/PrayerTime |
| Endonezce (Kemenag) | Imsak, Subuh | Terbit | Dzuhur | Ashar | Maghrib | Isya | Sayfa öğe adları (`icon-dzuhur`…) https://bimasislam.kemenag.go.id/jadwalshalat · ayrıca Dhuha |
| Malayca (JAKIM) | Imsak, Subuh | Syuruk | Zohor | Asar | Maghrib | Isyak | https://www.e-solat.gov.my/ (ayrıca `dhuha` alanı) |
| Urduca | فجر | طلوع آفتاب | ظہر | عصر | مغرب | عشاء | https://ihadis.com/ur/countries/pakistan/prayer-times-karachi (resmî otorite sayfası açılamadı) |
| Bengalce | ফজর | সূর্যোদয় | **যোহর / জোহর** (iki yazım) | আসর | মাগরিব | **ইশা / এশা** (iki yazım) | https://ihadis.com/bn/countries/bangladesh/prayer-times-dhaka · https://www.khoborsangjog.com/98558 |
| Farsça (İran) | اذان صبح | طلوع آفتاب | اذان ظهر | (ayrı satır yok) | غروب آفتاب + اذان مغرب | اذان عشاء; نیمه‌شب شرعی | https://www.bahesab.ir/time/tehran/ (arama özetinden; sayfa 503 verdi) |
| Fransızca (Mağrip) | Sobh (Imsak ayrı) | Chourouk | Dohr | Asr | Maghreb | Icha | https://www.algerie360.com/salat_horaire/horaires-de-prieres-a-in-salah/ |
| Fransızca (Diyanet FR) | Fajr (açıklamada "l'Aube") | Lever du soleil / Soleil | Dohr | Asr | Maghrib | Isha | https://namazvakitleri.diyanet.gov.tr/fr-FR/9541 |
| Almanca (Diyanet DE) | Morgengebet (Fastenbeginn) [meta: Fajr] | Sonnenaufgang | Mittagsgebet (Dhuhr) | Nachmittagsgebet (Asr) | Abendgebet (Maghrib) | Nachtgebet (Isha) | https://namazvakitleri.diyanet.gov.tr/de-DE/9541 |
| Boşnakça (IZ BiH) | Zora | Izlazak sunca | Podne | Ikindija | Akšam | Jacija | https://vaktija.ba/sarajevo (etiketler sayfanın paketlenmiş JS'indeki `vakatNames` dizisinden okundu) |
| Arnavutça (BIK Kosova) | Sabahu | L(indja) e Diellit | Dreka | Ikindia | Akshami | Jacia | https://bislame.net/takvimi/ |
| Azerbaycanca (QMİ) | İmsak vaxtı, Sübh azanı | Gün çıxır | Zöhr azanı | Əsr azanı | Gün batır + **Məğrib azanı (gün batımından 14 dk sonra)** | İşa azanı; Gecə yarısı | https://qafqazislam.com/teqvim/2026/Baki/10.jpg |
| Rusça (DUM RF) | Фаджр | Шурук (azan.ru: Восход) | Зухр | Аср | Магриб | Иша | https://www.dumrf.ru/ · https://www.azan.ru/ |
| Tatarca (DUM RT) | Иртәнге намаз | Кояш чыга | Өйлә | Икенде | Ахшам | Ястү | https://dumrt.ru/ru/namaz-time/ (Rusça sürüm: Фaджр, Шурук, Зухр, Аср, Магриб, Иша, https://dumrt.ru/ru/) |
| Özbekçe (muslim.uz, Kiril) | Бомдод | Қуёш | Пешин | Аср | Шом | Хуфтон | https://www.muslim.uz/ (sitede O'Z Latin seçeneği var) |
| Kazakça (QMDB) | Таң | Күн | Бесін | Екінті | Ақшам | Құптан | https://www.muftyat.kz/kk/namaz-times/ (Latin "Qaz" ve Arap harfli seçenek de var) |
| İspanyolca (Diyanet ES) | Imsak, Fajr | Amanecer (meta) | Dhuhr | Asr | Magrib / Maghrib | Isha | https://namazvakitleri.diyanet.gov.tr/es-ES/9541 · kıble = "alquibla". Karolarda "Imsak, Fajr, Dhuhr…" sırası var: Güneş karosu "Fajr" diye etiketlenmiş görünüyor, yani Diyanet'in kendi çevirisinde de tutarsızlık var |
| Hausa | Asuba(hi) | doğrulanamadı | Azahar | La'asar | Magariba | Isha | https://ha.wikipedia.com/wiki/Sallar_la%60asar · https://dar-alifta.org/ha/fatwa/details/21354/sallar-asubahi-ga-mutumin-da-zai-yi-tafiya-kafin-lokacinta (diğerleri arama özetinden) |
| Felemenkçe, Hintçe, Svahili, Somalice | doğrulanamadı | | | | | | Otorite sayfası bulunamadı |

Diğer terimler (yaygın kaynak, otorite değil):

| Terim | Urduca | Bengalce | Endonezce | Malayca | Arapça | Rusça |
|---|---|---|---|---|---|---|
| Teheccüd | تہجد | তাহাজ্জুদ | Tahajjud | Tahajjud | التهجد | doğrulanamadı |
| Kuşluk/Duha | صلوٰۃ الضحیٰ (+ اشراق ayrı) | সালাতুল দুহা (+ ইশরাক) | Dhuha | Dhuha (+ Isyraq) | صلاة الضحى (+ الإشراق) | doğrulanamadı |
| Kerahat vakti | نماز کے ممنوعہ اوقات; زوال | নামাজের নিষিদ্ধ সময় | doğrulanamadı | doğrulanamadı | doğrulanamadı | Макрух (azan.ru) |
| Nafile | نفل | নফল | doğrulanamadı | doğrulanamadı | doğrulanamadı | doğrulanamadı |

Kaynak: ihadis.com'un ur/bn/id/ms/ar sayfaları (yukarıdaki URL'ler; `/id/` ve `/ms/` için `…/countries/indonesia/prayer-times-jakarta`). Vitir, Kaza ve Kıble için dil başına otorite kaynağı bulunamadı; doğrulanamadı.

**"Allah kabul etsin" karşılığı:** Arapçada تقبّل الله. İbn Bâz "تقبل الله منك" için "lâ a'lemu fîhi be'sen" diyor, Levant/Irak'ta yaygın "حرماً" için ise "aslını bilmiyorum" diyor (https://binbaz.org.sa/fatwas/11233/). Mısır Dârü'l-İftâ "تقبل الله" demeyi meşru sayıyor (https://dar-alifta.org/ar/fatwa/details/17783/). Öteki diller için yerleşik kalıp doğrulanamadı (Rusça "Да примет Аллах" ve Boşnakça "Allah kabul ejlesun" aramaları kaynak vermedi).

---

## 5. Ülke, otorite ve kandil

Mezhep dağılımı (genel): Mâlikî Kuzey ve Batı Afrika'da, Hanefî Güney ve Orta Asya'da, Şâfiî Doğu Afrika ve Güneydoğu Asya'da, Hanbelî Arabistan'da baskın (https://en.wikipedia.org/wiki/Madhhab). Ülke yöntemleri ve ikindi farkı spec §6.2'de.

| Dil/ülke | Resmî vakit otoritesi | Not (namazla ilişkili) |
|---|---|---|
| Endonezce | Kemenag (Bimas Islam) | Kemenag 20° / Muhammediye 18° ikiliği (spec §6.2) |
| Malayca | JAKIM e-Solat | adhan `Singapore` hazır ayarı Malezya için yanlış (spec §6.2) |
| Arapça | Ülkeye göre (Ümmü'l-Kurâ, Mısır, Ürdün Evkaf…) | Suudi Ramazan yatsısı +30 dk (spec) |
| Urduca | Pakistan: tek resmî tablo doğrulanamadı | İkindi asr-ı sânî (spec) |
| Bengalce | İslamik Foundation Bangladeş (site açılamadı) | Gazeteler bölge ofsetleriyle günlük tablo yayımlıyor (khoborsangjog) |
| Farsça | Tahran Üniversitesi Jeofizik Enstitüsü (bahesab'ın beyanı) | Şia: akşam ezanı gün batımından sonra; tabloda ikindi ayrı satır değil |
| Azerbaycanca | QMİ (qafqazislam.com) | **Resmî tablo Caferî düzende:** Bakü 1 Ekim 2026 gün batımı 18:22, Məğrib azanı 18:36, ayrıca "Gecə yarısı". Sünnî kullanıcı için yöntem seçimi gerekir |
| Rusça/Tatarca | DUM RF (Moskova), DUM RT (Tataristan) | Kullanıcı Muslim Pro'dan "ДУМ РТ'yi yöntem olarak ekleyin" diye istiyor (§7) |
| Boşnakça | IZ BiH (vaktija.ba) | Şâfiî ikindi gibi A1 okur (spec) |
| Arnavutça | BIK (Kosova), KMSH (Arnavutluk; kmsh.al/takvimi 404) | |
| Özbekçe / Kazakça | muslim.uz / QMDB (muftyat.kz) | Resmî tablolar Kiril; Kazakçada Latin geçişi sürüyor (sitede "Qaz" seçeneği) |
| Fransızca / Almanca / Felemenkçe | Merkezî otorite yok; Türk camileri Diyanet AB, Faslı ve Cezayirli camiler Mawaqit/UOIF | spec §6.2 |

### Kandil ve Mevlid — resmî tatil verisi mevcut listeyle çelişiyor

Mevcut kural (`selam.ts > GELENEK_SELAMI_ULKELERI`): TR, CY, Balkanlar, AZ ve Orta Asya. Gerekçe: "Körfez, Güney Asya ve Batı'da tartışmalı". Bulunan veriler:

| Ülke | Resmî/kurumsal statü | Kaynak | Listede mi? |
|---|---|---|---|
| Endonezya | İsra Mi'rac (16 Oca 2026) ve Mevlid (25 Ağu 2026) **ulusal tatil** (SKB 3 Bakan) | https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2026 | Hayır |
| Malezya | Mevlid (Maulidur Rasul) **federal tatil**; İsra Mi'rac 4 eyalette, Nüzûl-i Kur'an bazı eyaletlerde | https://blog.wego.com/maulidur-rasul-malaysia/ · https://says.com/my/seismik/6-negeri-di-malaysia-ini-tidak-ambil-cuti-umum-hari-nuzul-al-quran-pada-7-mac-2026 | Hayır |
| Pakistan | Eid Milad-un-Nabi **resmî tatil** (26 Ağu 2026, Kabine Bölümü) | https://arynews.tv/public-holiday-announced-on-aug-26-for-eid-milad-un-nabi | Hayır (Güney Asya "tartışmalı" diye dışarıda) |
| Bangladeş | Şeb-i Berat ve Kadir Gecesi idari tatil; Mevlid genel tatil | https://tds-images.thedailystar.net/news/bangladesh/news/govt-announces-official-list-public-holidays-2026-4031596 | Hayır |
| Mısır | Mevlid resmî tatil; Dârü'l-İftâ kutlamayı ölçülü olmak şartıyla caiz sayıyor | https://date.nager.at/api/v3/PublicHolidays/2026/EG · https://dar-alifta.org/ar/fatwa/details/13207/ | Hayır |
| Suudi Arabistan | İbn Bâz: Mevlid kutlaması bid'at | https://binbaz.org.sa/fatawa/4975 | Hayır (doğru) |
| Bosna-Hersek | IZ BiH takviminde Regaib, Miraç ve Berat geceleri | https://static.islamskazajednica.ba/images/download/Znacajni_datumi_kalendar_IZ_2022.pdf | Evet |
| Kosova | BIK takviminde Mevlid, Regaib Gecesi ve Aşure | https://bislame.net/takvimi/ | Evet |
| Kazakistan | Regaib Gecesi haberi (25 Ara 2025; yalnız başlık görüldü) | https://ru.sputnik.kz/keyword_islam/ | Evet |
| Rusya (Tataristan) | doğrulanamadı | — | Hayır |
| AZ, AL, UZ | doğrulanamadı | — | Evet |

Öneri (karar sahibinin): "kandil" tek bir açma/kapama bayrağı olmaktan çıksın, gece başına ayrılsın. **Mevlid** ve **Miraç** ID, MY, PK, BD ve EG'de resmî düzeyde tanınıyor. **Berat** ve **Kadir** BD'de tanınıyor. **Regaib** ise yalnız Osmanlı/Balkan kaynaklarında (TR, BA, XK, KZ haberi) görüldü. Körfez'de kapalı kalması verilerle tutarlı. Ülke içindeki ayrılık (Selefî/Ehl-i Hadis/Deobandi muhalefeti) için ülke düzeyinde kaynak bulunamadı; doğrulanamadı.

---

## 6. Türk diasporası ve Diyanet ilgisi

- **Diyanet'in kendi namaz vakti sitesi** yalnız şu dilleri sunuyor: ar-SA, de-DE, en-US, es-ES, fr-FR, ru-RU ve tr-TR (`hreflang`, https://namazvakitleri.diyanet.gov.tr/en-US/9541). Diyanet terimlerinin bu dillerdeki karşılığı hazır kaynak olarak kullanılabilir.
- Türkiye'deki geçici korumalı Suriyeliler ≈ 2,26 milyon (İçişleri Bakanı, Haziran 2026; https://www.gazetebirlik.com/gundem/goc-idaresi-son-rakamlari-acikladi-turkiyede-kac-suriyeli-kaldi/987289). Bu kişiler Arapça konuşuyor ve Diyanet hesabını kullanıyor.
- Almanya'da Türk kökenli ≈ 2,9 milyon (ikincil kaynak, Mikrozensus tablosu bulunamadı; doğrulanamadı): https://fmcgroup.com/turkish-people-in-germany/
- Felemenkçe, Fransızca, Azerbaycanca, Boşnakça ve Arnavutça için Türk diasporası ya da yakınlık sayısı doğrulanamadı.

---

## 7. Kullanıcı şikâyetleri (dil/ülke başına)

Yöntem: Google Play yorumları `google-play-scraper` ile çekildi (dil ve ülke filtresi, yararlılık sırası, Muslim Pro, Athan ve Mawaqit, uygulama başına 300'e kadar; 2026-10-24). Ek olarak App Store RSS kullanıldı. Bağlantı biçimi `https://play.google.com/store/apps/details?id=<paket>&reviewId=<id>`. Paketler: Muslim Pro `com.bitsmedia.android.muslimpro`, Athan `com.athan`, Mawaqit `com.kanout.mawaqit`.

Sınırlar:
- Hausa ve Somalice filtresi İngilizce yorum döndürdü.
- sw/tz (5), kk/kz (8), sq/al (51) ve bs/ba (123) örneklemleri çok küçük.
- App Store RSS DE, PK, BD, MY, EG ve AE için boş geldi.
- Reddit erişilemedi (spec §6.1).
- Play `reviewId` bağlantıları kazıyıcının verdiği kimliklerdir; tarayıcıda tek tek açılıp doğrulanmadı (spec §6.1'deki uyarıyla aynı).
- Bütün ülkelerde en büyük tema **reklam**. Aşağıda yalnız dil, vakit ve yöntem şikâyetleri var.

| Dil | Şikâyet (kısa alıntı) | Kaynak (uygulama, yıldız, 👍) |
|---|---|---|
| Endonezce | Premium ödendiği hâlde reklam/çıkış ("sudah memiliki akun Premium… iklan jg masih sering muncul") | Muslim Pro 2★ 👍94 `reviewId=7c13211d-0056-42dd-acd6-0289b5c99fda` |
| Endonezce | Ezan bazen çalmıyor ("kadang zuhur ada asar sampai seterusnya gak ada") | Muslim Pro 3★ `d0a0302c-9245-4ee0-911c-dc77fc539a83` |
| Malayca | Sarawak'ta yatsı JAKIM'den 6 dk erken ("isyak nya… 7.35pm tapi di dalam muslim pro 7.29pm") | Muslim Pro 1★ 👍17 `d007ec75-516a-48a8-a7a6-33184fe9d169` |
| Malayca | Dua ve hadis İngilizce, Malayca yok ("doa dan hadis dalam bahasa ingeris") | Muslim Pro 1★ 👍15 `3f594f18-11a1-438b-ad46-9a408cd514d6` |
| Malayca | İkindi yanlış ("Waktu solat asar x tepat") | Athan 1★ 👍10 `8938db76-beff-4ccb-838f-9e44e6797b8d` |
| Rusça | Yerel otorite eksik ("добавлением… местной организации "ДУМ РТ", как в приложении Sajda") | Muslim Pro 3★ 👍124 `d51f6980-28c6-492f-8769-3cf3bf95a15b` |
| Rusça | Vakitler başka şehir gibi ("указано не верное время. Как будто на другой город") | Muslim Pro 1★ 👍111 `83c48587-ee50-4843-9e70-f79158527c0a` |
| Rusça | Almatı'da fecir ve iftar erken (App Store RU) | Muslim App 1★, RSS id `6014963559` |
| Almanca | "Gebetszeiten sind falsch", çeviri kötü | Muslim Pro 2★ 👍40 `e7c435bd-5cbe-4efe-a4ff-7073643fb169` |
| Almanca | Hesap ayarı kendiliğinden yanlış yönteme dönüyor | Muslim Pro 1★ `9e6f7904-1432-40aa-9bde-f5b41721f6fa` |
| Almanca | Arayüz Almanca, meal Fransızca | Mawaqit 3★ `9bdfc674-4435-40ed-93e8-c4410fe576b4` |
| Fransızca | Premium sonrası "les horaires sont erronés" | Muslim Pro 1★ 👍372 `3b9e8efa-cb4c-4c30-9fec-2d71f3483f74` |
| Fransızca | Dualar İngilizce ("traductions des du'a sont en anglais") | Athan 3★ 👍295 `a63059fe-b738-49c3-b072-20a6c6714d7c` |
| Fransızca | Fecir camiden 16 dk farklı (App Store FR) | Athan 1★, RSS id `9789578578` |
| İspanyolca | Dualar İngilizce, İspanyolca yok | Muslim Pro 3★ 👍133 `ccab97a3-d8a3-4826-adb5-a2aff03c3f88` |
| İspanyolca | "la traducción está mal" | Muslim Pro 1★ 👍107 `eac5c798-b850-4b04-9277-2931eeceea66` |
| İspanyolca | Fecir camiden 15 dk farklı (Vic) | Muslim Pro 3★ `8b42f068-66ea-4476-b514-23e92e324040` |
| Felemenkçe | Hollandaca mealde "bijna bij elke ayaat" hata | Muslim Pro 1★ 👍15 `edd9a5a6-a53b-464a-8a93-e341338901a6` |
| Felemenkçe | Konum değişince hesap yöntemi değişiyor | Athan 3★ `3c95f647-d390-4071-9760-dc9f721f946a` |
| Farsça (AF) | Farsça yok + Fransa'da vakit camiden 1 saat önce | Muslim Pro 1★ 👍30 `fb7a8584-468c-445e-92ae-18b35c6f44db` |
| Farsça (AF) | "İki uygulama aynı yere aynı vakti vermiyor" | Athan 3★ `2abab067-8e69-4a4f-a7d2-002244f8947f` |
| Özbekçe | Özbekçe yok, yalnız Rusça | Muslim Pro 3★ 👍22 `35adfa8d-cec8-40d2-aeeb-20d08b54c348` |
| Özbekçe | Yerli Islom.uz uygulamasına yönlendirme ("hammasi oʻzbekcha") | Muslim Pro 1★ 👍22 `4d3a29de-0df8-4a81-9be7-483f81b58a5d` |
| Azerbaycanca | "Azərbaycan, türk dili yoxdu" | Athan 1★ `2de14d86-dcd9-4ad1-b929-0aa1d478b877` |
| Azerbaycanca | Günün ayeti İngilizce kaldı | Muslim Pro 3★ `2e3bb75a-92de-4d4b-b0b5-5e002d53abd5` |
| Bengalce | Bengalce mealde şirke varan ifade şikâyeti | Muslim Pro 3★ `f787525b-cf71-4f24-b59d-b7b59956ffd4` |
| Bengalce | "Bengali language add please" | Muslim Pro 3★ 👍2 `d727660c-4163-4ea6-a6a2-56ec54f29999` |
| Kazakça | "Could you please add Kazakh language?!" | Muslim Pro 3★ 👍8 `a1ab5bbb-bf41-42fd-9d5b-48768247ad11` |
| Urduca | Günün ayeti yalnız İngilizce | Muslim Pro 3★ `4f12e484-b74b-4554-9f1e-f971831a4187` |
| Urduca | Çevirili okuma için Islam360'a geçiş ("far better app islam360… with translation") | Muslim Pro 3★ 👍3 `0de3c17c-efe3-4a0c-a1c7-07e9eeb0f33f` |
| Arapça | Arapça eksik/yarım çeviri; Arapça seçiliyken widget İngilizceye dönüyor; BAE'de resmî vakitle uyuşmazlık | spec §6.1 tablosu |
| Ortak (EN geri dönüş) | "Asr time keeps resetting… even after… Hanafi" | Muslim Pro 3★ `ce65544b-dd2a-4c2d-9915-377a20452752` |
| Boşnakça, Arnavutça, Hintçe, Hausa, Svahili, Somalice | Dil/vakit şikâyeti bulunamadı (örneklem küçük ya da İngilizce) | — |

Örüntüler:
1. **Yarım çeviri.** Dua, hadis ya da günün ayeti İngilizce kalıyor (fr, es, ms, az, ur).
2. **Yerel otorite eksik.** DUM RT, JAKIM eyalet farkları ve camiyle 15 dk fecir farkı.
3. **Yöntem sessizce değişiyor** (de, nl).
4. **Mealde hata algısı** (nl, es, bn). Yalnız birebir QuranEnc kullanmak bu riski yayımcıya devrediyor ama ortadan kaldırmıyor.

---

## 8. Önerilen sıra ve puanlama

Her eksen 1–3 puan. **Taban**: Müslüman nüfus ve pazar. **QuranEnc**: 3 = API'de var, 2 = meal var ama API dışında, 1 = meal yok ya da özel durum. **Teknik**: 3 = LTR, basit çoğul ve iki platformda TTS; her sorun 1 düşürür; RTL = 1. **Diaspora**: Türk diasporası ya da Türkiye bağı.

| Sıra | Dil | Taban | QuranEnc | Teknik | Diaspora | Toplam | Gerekçe |
|---|---|---|---|---|---|---|---|
| 1 | Endonezce | 3 | 3 | 3 | 1 | 10 | En büyük tek ülke (239 M). Kemenag'ın kendi meali API'de. Çoğul yok. TTS iki platformda var. Kemenag yöntemi zaten ampirik çıkarılmış |
| 2 | Almanca | 2 | 3 | 3 | 3 | 11 | En büyük Türk diasporası. Diyanet DE terimleri hazır. Bubenheim API'de. Toplam puanı en yüksek ama taban küçük, o yüzden Endonezceyle yer değiştirebilir |
| 3 | Fransızca | 2 | 3 | 2 (0 = one tuzağı) | 2 | 9 | FR 6 M + Mağrip/Batı Afrika. Diyanet FR var. Dua çevirisi talebi 👍295 |
| 4 | Rusça | 2 | 2 (API dışında) | 2 (4 kategori + cinsiyetli geçmiş zaman) | 2 | 8 | RU + Orta Asya ortak dili, Diyanet RU var. Önce §1'deki betik/sürüm açığı kapanmalı |
| 5 | Boşnakça | 1 | 3 | 2 (few + cinsiyetli geçmiş zaman, iOS TTS yok) | 3 | 9 | Kurala uyumu en yüksek dil: A1 ikindi, kandil ülkesi, IZ BiH yöntemi ampirik çıkarılmış. Tabanı küçük olduğu için 5. sırada |
| 6 | Malayca | 2 | 2 (API dışında) | 3 | 1 | 8 | JAKIM hazır. Endonezceye yakın ama ayrı yazım (Zohor/Isyak ↔ Dzuhur/Isya), tek sözlükle olmaz. Şikâyetler Malayca dua talebi gösteriyor |
| **RTL adımı** | | | | | | | |
| 7 | Arapça | 3 | 1 (özgün metin var; meal yok, tefsir mi? §10) | 1 (RTL, 6 kategori, cinsiyetli emir, iOS TTS listede yok) | 3 (Suriyeliler) | 8 | Toplam tabanda birinci. Diyanet AR var. RTL altyapısı bitince ilk açılacak dil |
| 8 | Urduca | 3 | 3 | 1 (RTL + Nastalik yazı tipi) | 1 | 8 | PK 227 M. A2 ikindi zaten var. iOS TTS listede yok |
| Sonra | Bengalce | 3 | 2 | 2 | 1 | 8 | Taban büyük ama QuranEnc API dışında; iki yazımlı terimler |
| Sonra | Azerbaycanca | 2 | 3 | 1 (TTS iki platformda yok) | 3 | 9 | Türkçeden çevirmek ucuz. Ancak resmî tablo Caferî (akşam +14 dk) ve Sünnî/Şii seçimi gerektiriyor. Sesli okuma yok |
| Sonra | Arnavutça | 1 | 3 | 3 | 2 | 9 | Kandil ülkesi. TTS iki platformda var. Tabanı küçük |
| Sonra | İspanyolca | 1 | 3 | 3 | 1 | 8 | Talep yorumları çok oylu. Diyanet ES var |
| Sonra | Farsça (RTL) | 3 | 3 | 1 (RTL, Android TTS yok) | 1 | 8 | İran'da Şia yöntemi yalnız elle seçilebiliyor (sahip kararı §7) |
| Sonra | Felemenkçe | 1 | 3 | 3 | 2 | 9 | Taban küçük |
| Sonra | Özbekçe | 2 | 2 (yalnız Kiril) | 1 (TTS yok, yazı ikiliği) | 2 | 7 | Önce Latin/Kiril kararı gerekiyor |
| Sonra | Kazakça | 2 | 2 | 2 | 2 | 8 | Kiril/Latin geçişi sürüyor |
| Sonra | Hintçe | 2? | 3 | 3 | 1 | 9? | Hint Müslümanlarının Hintçe/Urduca tercihi doğrulanamadı; taban puanı belirsiz |
| Sonra | Hausa / Svahili / Somalice | 2 / 1 / 1 | 3 | 1–2 (TTS çoğunlukla yok) | 1 | 6–8 | Terimler ve şikâyetler doğrulanamadı |

Not: Puan toplamı tek başına sıralamayı belirlemiyor. Sıralama kuralı: önce **Taban** (ilk 6'ya taban ≥ 2 olan diller girer; Boşnakça kurala uyumu ve diasporası nedeniyle tek istisna). Eşitlikte sırasıyla **QuranEnc API** → **Teknik** → **Diaspora** belirler. Hintçe, Azerbaycanca, Arnavutça ve Felemenkçe 9 puan alıp "Sonra"da kalıyor: Arnavutça ve Felemenkçenin tabanı 1, Hintçenin tabanı belirsiz, Azerbaycanca ise TTS yokluğu ve Caferî çakışması (§0) çözülmeden açılamaz. Almanca toplamda birinci ama Endonezce tabanda yaklaşık 40 kat büyük.

---

## 9. Çeviride dikkat (dil başına)

- **Tüm diller:** Kimlik ≠ görünen ad kuralı sürer. Yarım çeviri, rakiplerin bir numaralı şikâyeti: dua, ayet, bildirim ve widget aynı dilde olmalı (§7).
- **Arapça:** Emir kipi cinsiyetli → çağrılarda isim cümlesi. Bölgeye göre ad: "الشروق" mi "الشمس" mi? Ürdün الشروق kullanıyor. Namaz sonrası kalıp "تقبل الله" olsun; "حرماً" kullanılmasın (İbn Bâz "aslını bilmiyorum" diyor). Çoğulda 0, 1, 2, 3–10, 11–99 ve 100 ayrı biçim alır (100→other, 111→many).
- **Endonezce:** Kemenag yazımı Dzuhur, Ashar, Isya, Terbit. "Anda" kullanılmalı (kamu/kau yabancıya kaba). İmsak ayrı bir vakit ve Dhuha resmî tabloda var. Kemenag 20° / Muhammediye 18° tartışmasına arayüz metniyle girilmesin.
- **Malayca:** JAKIM yazımı Zohor, Asar, Isyak, Syuruk. Endonezce sözlük kopyalanmasın. Eyalet (zon) farkı şikâyet konusu.
- **Urduca:** "āp" kullanılmalı. Geniş ve gelecek zaman konuşanın cinsiyetine göre çekilir → birinci tekil cümleden kaçınılsın. Kerahat için "ممنوعہ اوقات" ve "زوال" yaygın. Nastalik yazı tipi ve widget'ta satır yüksekliği riski var (cihazda doğrulanmadı).
- **Bengalce:** যোহর/জোহর ve ইশা/এশা yazımları yan yana yaşıyor; tek biçim seçilip terim sözlüğüne sabitlenmeli. 0 tekil sayılır (0→one). "apni" kullanılmalı.
- **Farsça:** İran tablosunda ikindi ve yatsı ayrı satır değil (Caferî birleştirme), "نیمه‌شب شرعی" var. Sünnî Darî (AF, TJ) sözcük dağarı farklı olabilir (doğrulanamadı) ve QuranEnc'te ayrı `dari_badkhashani` var.
- **Fransızca:** Diyanet "Dohr/Asr/Maghrib/Isha" yazıyor, Mağrip camileri "Sobh/Chourouk/Dohr/Maghreb/Icha". Hangisinin kullanılacağına karar verilmeli; İngilizce transliterasyon kopyalanmasın. 0 tekildir ("0 prière" one biçimi alır). "vous" kullanılmalı.
- **Almanca:** Diyanet DE iki katmanlı: "Mittagsgebet (Dhuhr)". Kıble = "Gebetsrichtung". "Sie" kullanılmalı.
- **Boşnakça:** Yerleşik Osmanlı kökenli adlar Zora, Podne, Ikindija, Akšam, Jacija kullanılmalı, Arapça transliterasyon değil. "Kıldım" cinsiyetli (klanjao/klanjala) → cinsiyetsiz kalıp. Kandiller yerel adlarla: Lejletu'r-regaib, Lejletu'l-miradž, Lejletu'l-berat.
- **Arnavutça:** Sabahu, Dreka, Ikindia, Akshami, Jacia (BIK). Hitap biçimi doğrulanamadı.
- **Azerbaycanca:** QMİ tablosunda "Məğrib azanı" gün batımından 14 dk sonra ve "Gecə yarısı" var. "Akşam" vaktini gün batımına bağlayan metin Şii kullanıcıya yanlış gelir. Türkçeden mekanik aktarım tuzağı: "Sübh" (Sabah değil), "Gün çıxır".
- **Rusça:** DUM RF Фаджр, Шурук, Зухр, Аср, Магриб, Иша yazıyor; Tataristan kullanıcısı Tatarca (Иртәнге, Өйлә, Икенде, Ахшам, Ястү) bekleyebilir. Geçmiş zaman cinsiyetli. Çoğulda 0 ve 5–20 → many, 21 → one. Kerahat için "Макрух" kullanılıyor. Ruslar ДУМ РТ'yi yöntem olarak istiyor.
- **Özbekçe / Kazakça:** Resmî namaz tablosu ve QuranEnc mealleri Kiril. Latin arayüz + Kiril meal karışık görünür; yazı sistemi kararı önce verilmeli. Özbekçe adlar Бомдод, Пешин, Шом, Хуфтон; Kazakça Таң, Бесін, Екінті, Ақшам, Құптан.
- **İspanyolca:** Kıble = "alquibla" (Diyanet ES). "usted" kullanılmalı. 1.000.000 many alır.
- **Hintçe / Hausa / Svahili / Somalice:** Terim tablosu doğrulanamadı. Bu dillerde yerli bir gözden geçiren olmadan çeviri açılmasın.

---

## 10. Açık sorular (karar sahibinin)

1. **Arapça arayüzde "ayet yalnız QuranEnc meali" ne demek?** Yalnız Tanzil Arapça metni mi gösterilecek, yoksa `arabic_mokhtasar` gibi bir **tefsir** mi eklenecek? Tefsir meal değildir.
2. **API dışındaki mealler** (ru, bn, ms, kk, bosnian_korkut, french_hameedullah): sürüm numarası nereden alınacak, yoksa bu anahtarlar dışarıda mı kalacak?
3. **Dipnot işaretleri** (`[১]`, `[2]`): "birebir" kuralı gereği gösterilecek mi, yoksa dipnotsuz bir meal mi seçilecek?
4. **Kandil:** gece başına ve ülke başına ayrıştırma (§5) kabul ediliyor mu?
5. **Özbekçe/Kazakça yazı sistemi** ve **Azerbaycan'da Sünnî/Caferî varsayılanı**.

---

## Doğrulanamayanlar (özet)

- iOS'ta Arapça ve Urduca ses: Apple sayfasında listelenmiyor.
- sq, az, uz, kk, ms, ha, sw, so hitap biçimleri.
- Felemenkçe, Hintçe, Svahili ve Somalice vakit adları.
- Pakistan ve Bangladeş resmî vakit otoritesi sayfaları (Cloudflare veya erişim engeli).
- Rusya, Arnavutluk, Azerbaycan ve Özbekistan'da kandil statüsü.
- Almanya'da Türk kökenli nüfus (yalnız ikincil kaynak).
- Hint Müslümanlarında Hintçe/Urduca payı.
- Rakiplerin uygulama içi dil listeleri (App Store meta verisi farklı olabilir).
