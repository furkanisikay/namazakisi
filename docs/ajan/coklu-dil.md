# Çok dil (arayüz dili)

Ne zaman okunur: ekrana, bildirime, sesli okumaya ya da native yüzeye (widget, saat, TV) metin ekliyor ya da değiştiriyorsan; dil seçimi, sözlük, çoğul ve çeviri işinde. Tasarım: `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md` §4 P0 ve §9.

Katmanlar: `src/core/dil/` (saf: `tipler`, `cogul`, `bicim`, `diller`, `aktifDil`, `sozluk/<dil>/`) · `DilServisi` (disk + cihaz dili) · `baglamHazir()` (giriş kapısı) · `useMetin()` (ekran; etkin dile `useSyncExternalStore` ile ABONE, Redux'a bağlı değil — paylaşılan bileşenler sağlayıcısız test edilir) · `dilSlice` (yalnız kalıcılık/ayar ekranı).

- **Eski sabit tablo (`DUZEY_ADLARI[d]`) → `canli((s) => s.adAlani.tablo)`:** çağıranlar değişmeden etkin dili okur. Böyle bir değeri kullanan `useMemo`'ya `useMetin()` sonucunu bağımlılık olarak ekle (yoksa dil değişince eski metin önbellekte kalır).

## Kurallar

- **Yeni ekran metni sözlüğe yazılır, koda değil:** önce `sozluk/tr/<adAlani>.ts`, aynı anahtar her dilde (`Sozluk` tipi Türkçeden türer, eksik anahtar `tsc` hatası). Ekranda `const m = useMetin(); m.kurulum.baslik`; yer tutucu `bicim(m.x, { ad })`, sayı `sayili(m.y, n)` (`{n}` kendiliğinden). Nöbetçi: `turkceMetinSayaci.test.ts` (dosya başına Türkçe sabit metin tavanı; metin çıkarınca `node scripts/dil/turkceMetinSay.js --yaz`). Sayaç `.tsx`'te kendi satırındaki JSX metnini de sayar (eskiden yalnız `>metin<` tek satırdaydı; "TOPARLANMA MODU", tanı sayfası gibi çok satırlı metinler kaçmıştı). Türkçe harfsiz metni ("Devam Et", "Dinleyin") sayaç GÖRMEZ: JSX'e çıplak metin yazma, marka da sözlükten (`ortak.marka`).
- **Headless/servis metni `metin()`'den** (`core/dil/aktifDil`): bildirim içeriği, sesli okuma, widget yükü. Giriş noktaları `baglamHazir()`'ı bekler (hesap ayarı + dil); yeni giriş noktası da.
- **Yarım dil yok:** `DILLER`'de `secilebilir: true` yalnız Türkçe sabit metin kalmamışken (nöbetçi `turkceMetinSayaci.test.ts` "YARIM DİL YOK": Türkçe dışı bir dil seçilebilirse sayaç 0 olmalı) ve native metinler üretilmişken (W5'te nöbetçiye eklenir). Seçilemeyen dil cihaz dili olsa bile kendiliğinden açılmaz. Gözden geçirilmemiş çeviri `beta: true`.
- **Çevrilmeyen veri sayaçtan HARİÇ** (`turkceMetinSay.js > HARIC`, gerekçe dosya başına): yer adları (il, ilçe), dil başına üretilmiş ülke adları, ekrana çıkmayan Diyanet eşleme etiketleri (`ozelGunler.ts > ad`). Tek satırlık kimlik karşılaştırması (`case 'İmsak':`) satır sonu `// dil-haric: kimlik` ile işaretlenir. Çevrilecek veri ("Neler Yeni", ayar arama dizini) sayılır. Metni dosyalar arasında taşımak `--yaz` ile düzelmez: JSON'u elle düzenle, toplam artmasın.
- **Her çıkarılan ekrana İngilizce çizim testi:** `src/__tests__/yardimci/ingilizceDenetimi.ts` → `ingilizceyeGec()` (singleton da İngilizce olur; yalnız store'u değiştirmek `bicim`/`sayili`'yi Türkçe bırakır) + `turkceKalanlar(ekran.toJSON(), ['Kaza', …])`. Cırcırın göremediği Türkçe harfsiz metni (“Ayarlar”, “Kaza”) yasaklı sözcük listesi yakalar. Marka ve resmî adlar (`IZINLI`: "Namaz Akışı", "Türkiye") cümle içinde de süzülür. `BolumBasligi` metni büyük harfe çevirir → testte `'RECENT DETECTIONS'` gibi ara.
- **Dil değişince planlanmış metin yeniden kurulur** (seçici açılmadan ÖNCE): `diliKaydet`, `hesapAyariniKaydet` gibi `konumDegistiUygula` yolundan yayar; yoksa İngilizceye geçen kullanıcı Türkçe bildirim almaya devam eder.
- **Kimlik ≠ görünen ad:** `NamazAdi` ('Öğle') ve `KazaNamazAdi` değerleri Türkçedir ve depolama/karşılaştırma anahtarıdır; ekrana `namazAdiGoster(ad)`, `namazGorunenAdi` (cuma), `KAZA_ADLARI[_KUCUK]`, `VAKIT_ADLARI[_BUYUK|_KUCUK]` ile çıkar. Görünen adı bir eşitlikte ya da anahtarda KULLANMA (İngilizcede 'Dhuhr' hiçbir kimliğe eşleşmez).
- **Süre ve sayı tek yerden:** dakika → `dakikaKisa`/`dakikaUzun` (`core/dil/sure.ts`; "1 sa 5 dk" / "1 h 5 min", "1 hour 5 minutes" çoğullu), sayaç birimleri `kalanSureParcalari`, binlik ayırıcı `sayiYaz(n)` (`toLocaleString('tr-TR')` YAZMA). Tarih `TarihYardimcisi` (sözlük `tarih`; takvim yaprağı `aylarKisa`, haftalık panel `haftaHarfleri` — tarih dizesini `split(' ')` ile bölme, dil sırası değişir).
- **Samimiyet metinleri ÇEVİRİ DEĞİLDİR** (`kabulDuasi`, `KURULUM_BITTI_SELAMI`, `gunSelami`): her dilde o dilin geleneksel kalıplarından ayrı, DETERMİNİSTİK bir küme (sözlük `samimiyet.kabulDualari`, dört yuva); aynı kurallar (övgü yok, "!" yok, kılınmadıya yargı yok). **Kandil selamı GECE ve ÜLKE başınadır, hicrî yılbaşı ülke başına (sahip kararları 2026-10-24, `selam.ts > KANDIL_ULKELERI`):** ölçüt gecenin o ülkede resmî tatil ya da resmî din kurumu takviminde olması — Osmanlı mirası ülkeler (TR, CY, Balkanlar, Kafkasya/Orta Asya) dört geceyi; Mevlid ayrıca ID, MY, PK, BD, EG; Miraç ID, MY; Berat BD. Körfez kapalı (bid'at görüşü). Ülke bilinmiyorsa yalnız Türkçede. Kandil kimliği `ozelGunler.ts > gece`; selam metni gece başına (`samimiyet.kandilGeceleri`; Türkçede dördü aynı). Kaynaklar: `docs/superpowers/specs/2026-10-24-dil-onceligi-arastirmasi.md` §5. Kadir, arefe, bayram, Ramazan, cuma her yerde. Çağıran `ulkeKodu`'nu konum kaydından verir (`kayitliUlkeKodu`). Native ikizler dil parametreli (`kabulDuasi(dil)`: saat, TV, Android çekirdekleri, Swift `Samimiyet`); eski Türkçe sabitler testler için yerinde. Nöbetçi: `samimiyet.test.ts` (İngilizce bölümü). Önce `ana-ekran-ve-ayarlar.md > Samimiyet`.
- **Nass kuralı (sahip kararı 2026-10-24): Türkçe dışında hadis YOK, ayet QuranEnc mealiyle** (`core/icerik/nassDili.ts`: `hadisGosterilir`, `ayetMeali`). Meal birebir ve KESİLMEDEN (`ayetMealleri.ts`, üretici `node scripts/icerik/ayet-mealleri-uret.js`; yeni ayet → betiğin `AYETLER` listesi + yeniden koş); künye yayımcı + QuranEnc sürümü. Meali bir sonraki ayete bağlanan (ör. 8:2 "… they rely -") ayet çeviride kullanılmaz. Hadis düşünce havuz boşalmasın: `yalnizCeviri` ayet (Hûd 114) boşluğu doldurur. Nöbetçi: `icerik/__tests__/ingilizceMuhafiz.test.ts`.
- **Bildirim üreticileri saf ve etkin dilde** (`basligiOlustur`, `cumaBildirimMetni`, `camiyeGitMetniOlustur`, `takvimCakismaMetniOlustur`, `yatisIcerigiOlustur`, `gunSonuGovdesi`): önizleme ve defter aynı üreticiden okur. İngilizce başlıkta süre `10m` (bileklik 16 karakter: "Maghrib · 655m"); `prostrate`/`please` yazılmaz. Otomasyon anahtar kelimesi (`vakitGirdiBasligi`) dile göre değişir, Türkçe değer SABİT (kurulmuş rutinler).
- **Dil seçici (sahip kararı 2026-10-24):** Ayarlar'da ayrı "Dil · Language" satırı (`DilAyarlariSayfasi`; başlık iki dilli: yanlış dilde kalan kişi de bulsun) + cihaz dili Türkçe değilse kurulum sihirbazının ilk ekranında iki dilli bağlantı (`DilSecimModali`). İkisi aynı `components/dil/DilSecici`'yi kullanır: "Cihazın dili" (açık seçim silinir, `DilServisi.cihazDilineDon`) + `secilebilir` diller; dil adı KENDİ dilinde, açıklama arayüz dilinde, beta dilde "· Beta". Seçicide tek dil kalıyorsa satır/bağlantı gösterilmez.
- **Elle yazılmış sesli okuma metni dil değişince BİR KEZ sorulur:** `LocalOzelAnonsServisi` altı yüzey kaydında (`MUHAFIZ`, nafile, cuma, camiye git, yatış, takvim) `anonsMetni` alanlarını özyinelemeli dolaşır; boş metin ve herhangi bir dilin hazır şablonu SAYILMAZ (`core/hatirlatma/ozelAnonsMetinleri.ts`). "Değiştirin" → yüzeyin (muhafızda en yakın `yon`un) listesinden ilk şablon yazılır, değişen slice'lar diskten yeniden yüklenir (yoksa ekrandaki eski metin bir sonraki kayıtta geri yazılır) ve planlar yenilenir; bozuk kayda dokunulmaz (`hamGuncelle` null). Metinlerin VARSAYILAN DİLİ `DIL_AYARI.ozelAnonsDili`'dir (yoksa Türkçe): yeni dil buna eşitse sorulmaz (geri dönüşte "önceki dilde kaldı" yanlış olur); hiç metin yoksa ya da "değiştirin" denirse yeni dil olur. Nöbetçi: `ozelAnonsMetinleri.test.ts`, `DilAyarlariSayfasi.test.tsx`.
- **Çok dil öncesi kurulumlar Türkçe kalır (bir kez göç, `DilServisi.eskiKurulumGocu`):** dil kaydı yoksa ve kurulum sihirbazı DAHA ÖNCE bitmişse `{ kod: 'tr' }` açıkça yazılır — telefonu İngilizce olan mevcut kullanıcı güncellemeden sonra kendiliğinden İngilizceye geçmez. Yeni kurulumda yalnız `goc: 1` işareti yazılır, cihaz dili izlenir; işaret göçün bir daha çalışmasını önler (sihirbaz sonradan bitse de). Nöbetçi: `DilServisi.test.ts > çok dil öncesi kurulum göçü`.
- **Sesli okuma ses uyarısı ETKİN dilin sesini sorar** (`useTurkceTtsDestegi` — ad tarihsel; native kayıtlı sesli okuma dilini sorar, dil değişince yeniden sorulur); metin her dilde o dilin sesini söyler. Cihazda İngilizce ses akışı DOĞRULANMADI.
- **Kayıtlı dil yalnız `secilebilir` ise kurulur** (`DilServisi.diskten`): yedekten gelen `{kod:'en'}` yarım çevrili dili kendiliğinden açmaz. Nöbetçi: `DilServisi.test.ts`.
- **Native arayüz dili AYRI anahtardır (sesli okuma dilinden bağımsız):** `DilServisi` her yükleme/kayıtta yazar — Android SharedPreferences `namazakisi_dil` / `kod` (`expo-countdown-notification > ArayuzDili`; uygulama modülü ve diğer yerel modüller aynı dosyayı okur), iOS App Group `group.com.furkanisikay.namazakisi` / `namazakisi_dil_kod` (`SiriDeposu.arayuzDili()`; widget uzantısı ve saat köprüsü okur). Uygulama hiç açılmadıysa değer yoktur → Türkçe. Wear OS ve Android TV cihazın kendi dilini izler (standart `values-xx` kaynakları).
- **Sesli okuma etkin dilde konuşur:** `DilServisi` dili native'e bildirir (`anonsDiliniAyarla`: Android SharedPreferences `namazakisi_anons/dil` → `AnonsKonusucu` Locale; iOS UserDefaults → ses seçimi), varsayılan `tr-TR` (eski native'de köprü yoksa Türkçe). Hazır şablonlar kayda YAZILIDIR → çözüm anında `sablonuYerellestir` (`core/hatirlatma/anonsSablonlari.ts`) herhangi bir dildeki şablonu etkin dilin AYNI SIRADAKİ şablonuna çevirir; şablon listeleri her dilde aynı uzunlukta olmalı (nöbetçi `anonsSablonlari.test.ts`). Göç/yön değişimi şablonu `sablonKonumu` ile tanır (dil fark etmez). Kullanıcının yazdığı metin aynen kalır.
- **Sözlükte eşanlamlı/anahtar kelime listesi virgüllü TEK dizedir, dizi değil:** `as const` diziyi tuple yapar; diller arasında farklı uzunluk `tsc`'yi geçer ama `aktifDil.test` anahtar kümesi nöbetçisini düşürür. (Şablon listeleri gibi dizinle eşlenen diziler her dilde aynı uzunlukta kalır.)
- **`canli()` dizi döndürmez** (Proxy): dizi tablolar için getter ya da fonksiyon (`siklikSecenekleri()`); `Array.isArray(canliGorunum)` false'tur.
- **`// dil-haric` satırın yorumunun BAŞINDA olmalı**; başka bir yorumun sonuna eklenirse sayaç görmez.
- **Varsayılan prop metni:** `useMetin()`'i koşulsuz çağır, sonra `verilen ?? varsayilan` (`??` sağında hook çağrısı kuralı bozar).
- **Navigasyon başlıkları:** ekran tanımında `baslik: (e) => e.<Rota>` (`genel.ekranlar`), navigator bileşeni `useMetin()` çağırır; ana-ayrıntı düzeninde başlık tablosu canlı görünüm, varsayılan başlık getter.
- **Durum metinle karşılaştırılmaz:** özet hook'u metin döndürüyorsa yanında boolean bayrak da döndürür (`useCamideyimOzeti.camiKapali`); "Kapalı" ile eşitlik dil değişince bozulur.
- **Takvim etkinlik başlığı etkin dildedir** ("Dhuhr prayer"); temizleme süzgeci BÜTÜN dillerdeki başlıkları eşler (`TakvimAyarlari/sabitler.ts > vakitTemizleBasliklari`), yoksa dil değiştiren kullanıcının eski etkinlikleri silinmez.
- **Etkin dili ekranda `useAktifDil()` / `useMetin()` ile oku, `state.dil` ile değil:** paylaşılan bileşenler (sihirbaz, modallar) dil slice'ı olmayan test store'larıyla da çizilir.
- **Maestro akışlarında metinle değil `testID` ile seç:** dil başına kare turu metin seçicilerini kırar.
- **Çoğul ELLE yazılmış CLDR kuralıyla** (`cogul.ts`; Hermes'te `Intl.PluralRules`'a güvenilmez). Yeni dil eklerken kuralını yaz; nöbetçi `cogul.test.ts` Node ICU ile 0–1000 karşılaştırır, `aktifDil.test.ts` her çoğul metnin o dilin bütün kategorilerini taşıdığını denetler.
- **Büyük/küçük harf dönüşümü yine YASAK** (`toUpperCase`/`toLocale*`): büyük harf gereken yerde sözlükte ayrı anahtar.
- **Tarih ve ay/gün adları sözlükte**, `Intl.DateTimeFormat`/`toLocale*` kullanılmaz (Hermes ICU'ya bağlı).
- **Cihaz dili:** Android `I18nManager.getConstants().localeIdentifier`, iOS `Settings.get('AppleLanguages')[0]` (`NativeModules.SettingsManager` New Architecture'da güvenilmez; iOS yolu cihazda DOĞRULANMADI); `expo-localization` eklenmedi (native bağımlılık gereksiz). `DIL_AYARI` yedeğin üç beyaz listesindedir; geri yüklemede `diliYukle({ zorla: true })` hesap ayarından hemen sonra, planlanan metinlerden ÖNCE koşar.

## Sıradaki diller (W4)
Araştırma ve kaynaklar: `docs/superpowers/specs/2026-10-24-dil-onceligi-arastirmasi.md` (öncelik, ülke/otorite, yerleşik vakit adları, QuranEnc anahtarları, çoğul, hitap, kullanıcı şikâyetleri). Sahip kararları (2026-10-24): Azerbaycan'da Sünnî varsayılan, QMİ (Caferî) takvimi yalnız öneri; Arapça arayüzde ayet yalnız Kur'an metni (Tanzil, künyeli), meal/tefsir yok. Meal kaynakları ve sürüm okuma: [gunun-ayeti](gunun-ayeti.md) > Meal kaynakları.

## Vakit adı takımları (dil içi seçenek)
- **Bir dilde birden çok yerleşik adlandırma varsa alternatifler `core/dil/vakitTakimlari.ts`'te; sözlüğün `vakit.*` adları o dilin TEMEL takımıdır.** Çözüm: kullanıcının açık seçimi (`DIL_AYARI.vakitTakimi[dil]`, dil başına) → ülke varsayılanı (`ULKE_VARSAYILANLARI`, konum kaydının ülkesi) → temel. Bilinmeyen kimlik yok sayılır. Takım YALNIZ adlandırma alanlarını geçersiz kılar (`TAKIM_ALANLARI`); nöbetçi `vakitTakimlari.test.ts`.
- **Takım `aktifDil.ts`'te tek yerde uygulanır ve sonuç ÖNBELLEKTEDİR** (`metin()` referansı yalnız dil/takım değişince değişir; `useMetin` bunu `useSyncExternalStore` anlık görüntüsü olarak kullanır, her çağrıda yeni nesne React'i sonsuz döngüye sokar).
- **Çözüm `DilServisi.hazir()` içinde ve konum yayma noktasının İLK adımında** (`konumDegistiUygula` → `vakitTakiminiYenile`), metin üreten tüketicilerden önce. Native'e `vakitAdlariniAyarla(json|null)` ile itilir (widget/bildirim adları). Wear/TV adları henüz takımı izlemez.
- **Takımlar (2026-10-25 araştırması: mağaza uygulamaları, kurum sayfaları, 8 bin yorum):** de temel Fajr · Sonnenaufgang · Dhuhr · Asr · Maghrib · Isha; seçenek Diyanet DE Almancası (Morgengebet…) ve Türkçe adlar; ülke varsayılanı yok. fr temel Fajr · Lever du soleil · Dhuhr · Asr · Maghrib · Isha; `magrip` (Dohr, Maghreb, Icha, Chourouk) TN/MR varsayılanı, `cezayir` (Sobh…) DZ varsayılanı. id, ms, bs, ru tek otoritelidir (Kemenag, JAKIM, IZ BiH, DUM RF) → seçici yok. Rusçada güneş "Восход" (yorumlarda "Шурук" hiç geçmiyor). Volofça adların yazımı kaynaklarda tutarsız → eklenmedi.

## Bir dili seçicide açma kapısı (`secilebilir: true`)
Açık diller: Türkçe, İngilizce (beta, 2026-10-24). Bir dil açılırken AYNI commit'te: `diller.ts > secilebilir`, `app.json` Siri eklentisi `diller` listesi ve `locales/<dil>.json` (iOS izin metinleri + hızlı eylem başlıkları; nöbetçi `plugins/__tests__/siriYerellestirme.test.ts`), "Neler Yeni" öğesi `ceviri`si.
Her dil için ayrı ayrı; hepsi sağlanmadan açma (yarım dil kendiliğinden de açılır: cihaz dili):
1. JS cırcırı (`turkce-metin-tavani.json`) sıfıra ya da yalnız bilinçli HARIC'e inmiş; ekranların İngilizce/dil çizim testleri yeşil.
2. O dilin kullanıcısının gördüğü native yüzeyler (widget, bildirim eylemleri, Wear/TV başlıkları, iOS hedefleri) o dilde (W5).
3. "Neler Yeni"de dil seçici öğesi (`YeniOzellikler.ts`, `ceviri` ile) ve Ayarlar'da "Dil · Language" satırı.
4. Sesli okuma: cihazda o dilin TTS sesi denendi ya da sessizce varsayılana düştüğü bilgi satırıyla söyleniyor.
5. Fıkıh/hitap gözden geçirmesi (terim sözlüğü, "sen"/"siz" eşlemesi) ve `beta: true` rozeti.

## Hitap kaydı (her dilde eşlenir)

Türkçe kural sürer: kullanıcı uygulamayı yönetiyorsa "siz", uygulama ibadete çağırıyorsa "sen" + emir (AGENTS.md).

| Dil | Yönetim ("siz") | İbadete çağrı ("sen") |
|---|---|---|
| İngilizce | nötr emir, "please"siz ("Select your city") | doğrudan, kısa emir ("Asr ends in 10 minutes. Stand for prayer.") |
| Arapça, Urduca | çoğul/saygı kipi | emir kipi cinsiyetlidir → cinsiyetsiz kalıp (isim cümlesi: "حان وقت الصلاة") |

## Terim sözlüğü (İngilizce)

Serbest çeviri yok; aşağıdaki karşılıklar sabittir (Müslüman İngilizcesinde yerleşik olanlar).

| Türkçe | İngilizce |
|---|---|
| İmsak / Sabah | Fajr |
| Güneş | Sunrise |
| Öğle | Dhuhr |
| İkindi | Asr |
| Akşam | Maghrib |
| Yatsı | Isha |
| Cuma | Jumu'ah |
| Kıldım | I've prayed |
| Kılındı (durum) | Prayed |
| Kaza | Qada |
| Nafile | Nafl |
| Kuşluk / Evvâbîn / Teheccüd | Duha / Awwabin / Tahajjud |
| Kerahat vakti | Makruh time |
| Asr-ı evvel / Asr-ı sânî | Earlier Asr / Later Asr (Hanafi) |
| Ezan | Adhan |
| Kıble | Qibla |
| Seri | Streak |
| Namaz Muhafızı | Prayer Guardian |
| Allah kabul etsin | May Allah accept it |
| Hesap yöntemi | Calculation method |
| Toparlanma (seri) | Recovery |
| Seferîlik / yolcu | Travel (safar) / traveler |
| Kasr / cem | Qasr / jam' (combining) |
| Hanefî / Şâfiî | Hanafi / Shafi'i |
| Vitir | Witr |
| Kaza Defteri | Qada log |
