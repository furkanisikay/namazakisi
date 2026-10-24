# Çok dil (arayüz dili)

Ne zaman okunur: ekrana, bildirime, sesli okumaya ya da native yüzeye (widget, saat, TV) metin ekliyor ya da değiştiriyorsan; dil seçimi, sözlük, çoğul ve çeviri işinde. Tasarım: `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md` §4 P0 ve §9.

Katmanlar: `src/core/dil/` (saf: `tipler`, `cogul`, `bicim`, `diller`, `aktifDil`, `sozluk/<dil>/`) · `DilServisi` (disk + cihaz dili) · `baglamHazir()` (giriş kapısı) · `dilSlice` + `useMetin()` (ekran).

## Kurallar

- **Yeni ekran metni sözlüğe yazılır, koda değil:** önce `sozluk/tr/<adAlani>.ts`, aynı anahtar her dilde (`Sozluk` tipi Türkçeden türer, eksik anahtar `tsc` hatası). Ekranda `const m = useMetin(); m.kurulum.baslik`; yer tutucu `bicim(m.x, { ad })`, sayı `sayili(m.y, n)` (`{n}` kendiliğinden). Nöbetçi: `turkceMetinSayaci.test.ts` (dosya başına Türkçe sabit metin tavanı; metin çıkarınca `node scripts/dil/turkceMetinSay.js --yaz`).
- **Headless/servis metni `metin()`'den** (`core/dil/aktifDil`): bildirim içeriği, sesli okuma, widget yükü. Giriş noktaları `baglamHazir()`'ı bekler (hesap ayarı + dil); yeni giriş noktası da.
- **Yarım dil yok:** `DILLER`'de `secilebilir: true` yalnız o dilde Türkçe sabit metin kalmamış (cırcır sıfır, kullanıcıya görünen dosyalar) ve native metinler üretilmişken. Seçilemeyen dil cihaz dili olsa bile kendiliğinden açılmaz. Gözden geçirilmemiş çeviri `beta: true`.
- **Çoğul ELLE yazılmış CLDR kuralıyla** (`cogul.ts`; Hermes'te `Intl.PluralRules`'a güvenilmez). Yeni dil eklerken kuralını yaz; nöbetçi `cogul.test.ts` Node ICU ile 0–1000 karşılaştırır, `aktifDil.test.ts` her çoğul metnin o dilin bütün kategorilerini taşıdığını denetler.
- **Büyük/küçük harf dönüşümü yine YASAK** (`toUpperCase`/`toLocale*`): büyük harf gereken yerde sözlükte ayrı anahtar.
- **Tarih ve ay/gün adları sözlükte**, `Intl.DateTimeFormat`/`toLocale*` kullanılmaz (Hermes ICU'ya bağlı).
- **Cihaz dili:** Android `I18nManager.getConstants().localeIdentifier`, iOS `SettingsManager.settings.AppleLanguages[0]`; `expo-localization` eklenmedi (native bağımlılık gereksiz). Dil seçici açılınca `DIL_AYARI` yedeğin üç beyaz listesine girer.

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
