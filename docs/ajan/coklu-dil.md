# Çok dil (arayüz dili)

Ne zaman okunur: ekrana, bildirime, sesli okumaya ya da native yüzeye (widget, saat, TV) metin ekliyor ya da değiştiriyorsan; dil seçimi, sözlük, çoğul ve çeviri işinde. Tasarım: `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md` §4 P0 ve §9.

Katmanlar: `src/core/dil/` (saf: `tipler`, `cogul`, `bicim`, `diller`, `aktifDil`, `sozluk/<dil>/`) · `DilServisi` (disk + cihaz dili) · `baglamHazir()` (giriş kapısı) · `useMetin()` (ekran; etkin dile `useSyncExternalStore` ile ABONE, Redux'a bağlı değil — paylaşılan bileşenler sağlayıcısız test edilir) · `dilSlice` (yalnız kalıcılık/ayar ekranı).

- **Eski sabit tablo (`DUZEY_ADLARI[d]`) → `canli((s) => s.adAlani.tablo)`:** çağıranlar değişmeden etkin dili okur. Böyle bir değeri kullanan `useMemo`'ya `useMetin()` sonucunu bağımlılık olarak ekle (yoksa dil değişince eski metin önbellekte kalır).

## Kurallar

- **Yeni ekran metni sözlüğe yazılır, koda değil:** önce `sozluk/tr/<adAlani>.ts`, aynı anahtar her dilde (`Sozluk` tipi Türkçeden türer, eksik anahtar `tsc` hatası). Ekranda `const m = useMetin(); m.kurulum.baslik`; yer tutucu `bicim(m.x, { ad })`, sayı `sayili(m.y, n)` (`{n}` kendiliğinden). Nöbetçi: `turkceMetinSayaci.test.ts` (dosya başına Türkçe sabit metin tavanı; metin çıkarınca `node scripts/dil/turkceMetinSay.js --yaz`).
- **Headless/servis metni `metin()`'den** (`core/dil/aktifDil`): bildirim içeriği, sesli okuma, widget yükü. Giriş noktaları `baglamHazir()`'ı bekler (hesap ayarı + dil); yeni giriş noktası da.
- **Yarım dil yok:** `DILLER`'de `secilebilir: true` yalnız Türkçe sabit metin kalmamışken (nöbetçi `turkceMetinSayaci.test.ts` "YARIM DİL YOK": Türkçe dışı bir dil seçilebilirse sayaç 0 olmalı) ve native metinler üretilmişken (W5'te nöbetçiye eklenir). Seçilemeyen dil cihaz dili olsa bile kendiliğinden açılmaz. Gözden geçirilmemiş çeviri `beta: true`.
- **Çevrilmeyen veri sayaçtan HARİÇ** (`turkceMetinSay.js > HARIC`, gerekçe dosya başına): yer adları (il, ilçe), dil başına üretilmiş ülke adları, ekrana çıkmayan Diyanet eşleme etiketleri (`ozelGunler.ts > ad`). Tek satırlık kimlik karşılaştırması (`case 'İmsak':`) satır sonu `// dil-haric: kimlik` ile işaretlenir. Çevrilecek veri ("Neler Yeni", ayar arama dizini) sayılır. Metni dosyalar arasında taşımak `--yaz` ile düzelmez: JSON'u elle düzenle, toplam artmasın.
- **Her çıkarılan ekrana İngilizce çizim testi:** `src/__tests__/yardimci/ingilizceDenetimi.ts` → `ingilizceyeGec()` (singleton da İngilizce olur; yalnız store'u değiştirmek `bicim`/`sayili`'yi Türkçe bırakır) + `turkceKalanlar(ekran.toJSON(), ['Kaza', …])`. Cırcırın göremediği Türkçe harfsiz metni (“Ayarlar”, “Kaza”) yasaklı sözcük listesi yakalar.
- **Dil değişince planlanmış metin yeniden kurulur** (seçici açılmadan ÖNCE): `diliKaydet`, `hesapAyariniKaydet` gibi `konumDegistiUygula` yolundan yayar; yoksa İngilizceye geçen kullanıcı Türkçe bildirim almaya devam eder.
- **Kimlik ≠ görünen ad:** `NamazAdi` ('Öğle') ve `KazaNamazAdi` değerleri Türkçedir ve depolama/karşılaştırma anahtarıdır; ekrana `namazAdiGoster(ad)`, `namazGorunenAdi` (cuma), `KAZA_ADLARI[_KUCUK]`, `VAKIT_ADLARI[_BUYUK|_KUCUK]` ile çıkar. Görünen adı bir eşitlikte ya da anahtarda KULLANMA (İngilizcede 'Dhuhr' hiçbir kimliğe eşleşmez).
- **Süre ve sayı tek yerden:** dakika → `dakikaKisa`/`dakikaUzun` (`core/dil/sure.ts`; "1 sa 5 dk" / "1 h 5 min", "1 hour 5 minutes" çoğullu), sayaç birimleri `kalanSureParcalari`, binlik ayırıcı `sayiYaz(n)` (`toLocaleString('tr-TR')` YAZMA). Tarih `TarihYardimcisi` (sözlük `tarih`; takvim yaprağı `aylarKisa`, haftalık panel `haftaHarfleri` — tarih dizesini `split(' ')` ile bölme, dil sırası değişir).
- **Samimiyet metinleri ÇEVİRİ DEĞİLDİR** (`kabulDuasi`, `KURULUM_BITTI_SELAMI`, `gunSelami`): her dilde o dilin geleneksel kalıplarından ayrı, DETERMİNİSTİK bir küme (sözlük `samimiyet.kabulDualari`, dört yuva); aynı kurallar (övgü yok, "!" yok, kılınmadıya yargı yok). **Kandil ve hicrî yılbaşı selamı yalnız `GELENEK_SELAMI_DILLERI`'nde (bugün `tr`)**: Körfez, Güney Asya ve Batı'da bu geceleri kutlamak tartışmalıdır (aşure kararıyla aynı gerekçe); Kadir, arefe, bayram, Ramazan, cuma her dilde. Native ikizler (`KABUL_DUASI`, `TESBIHAT_TAMAM_METNI`) W5'e kadar Türkçe sabittir. Nöbetçi: `samimiyet.test.ts` (İngilizce bölümü). Önce `ana-ekran-ve-ayarlar.md > Samimiyet`.
- **Sesli okuma dili henüz Türkçedir:** `useTurkceTtsDestegi`, sade görünüm ve muhafız okuması Türkçe ses ister; dil seçilebilir olmadan önce TTS dili etkin dile bağlanmalı (bildirim/muhafız dalgası).
- **Maestro akışlarında metinle değil `testID` ile seç:** dil başına kare turu metin seçicilerini kırar.
- **Çoğul ELLE yazılmış CLDR kuralıyla** (`cogul.ts`; Hermes'te `Intl.PluralRules`'a güvenilmez). Yeni dil eklerken kuralını yaz; nöbetçi `cogul.test.ts` Node ICU ile 0–1000 karşılaştırır, `aktifDil.test.ts` her çoğul metnin o dilin bütün kategorilerini taşıdığını denetler.
- **Büyük/küçük harf dönüşümü yine YASAK** (`toUpperCase`/`toLocale*`): büyük harf gereken yerde sözlükte ayrı anahtar.
- **Tarih ve ay/gün adları sözlükte**, `Intl.DateTimeFormat`/`toLocale*` kullanılmaz (Hermes ICU'ya bağlı).
- **Cihaz dili:** Android `I18nManager.getConstants().localeIdentifier`, iOS `Settings.get('AppleLanguages')[0]` (`NativeModules.SettingsManager` New Architecture'da güvenilmez; iOS yolu cihazda DOĞRULANMADI); `expo-localization` eklenmedi (native bağımlılık gereksiz). Dil seçici açılınca `DIL_AYARI` yedeğin üç beyaz listesine girer.

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
