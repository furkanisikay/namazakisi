# Tasarım: Muhafız ekranı yeniden kurulumu + vakit/seviye bazlı sesli uyarı (TTS)

**Tarih:** 2026-07-17
**Durum:** Tasarım onaylandı (brainstorming), implementasyon fazlara bölündü — henüz başlanmadı.
**İlgili:** #78 (namaza özel bildirim/ses), muhafız bildirim başlığı PR #172.

---

## 1. Problem

İki bağlantılı sorun:

1. **Muhafız ayarları ekranı karışık.** Kullanıcı 4 iç içe zaman penceresini ("Nazik Hatırlatma", "Uyarı", "Şeytanla Mücadele", "Acil Alarm") ve her birinin eşik + sıklığını (özel modda 8 sayısal ayar) aynı anda kafasında kurmak zorunda. Eşiklerin sıralı olması gerekiyor; bozulursa davranış tuhaflaşıyor.
2. **Sesli uyarı yok.** Kullanıcı vaktin çıkmasına az kala telefonu cebindeyken bildirimi görmeyebilir. Sesli anons ("İkindi vakti çıkıyor, son 3 dakika") bu boşluğu doldurur — ama kullanıcı bunu **vakit ve seviye bazında** kontrol edebilmeli.

## 2. Hedef ve kısıt

- Kullanıcı **her vakit × her seviye** için nasıl uyarılacağını seçebilsin: sessiz / bildirim / sesli / ikisi.
- Ayrıca her hücre için: **kaç dk kala** (eşik), **sıklık**, **bildirim sesi**, **sesli anons metni**.
- **Tek tık ile tüm vakitlere uygula.**
- Tüm bu granülariteye rağmen ekran **basit ve anlaşılır** kalsın (kullanıcının açık isteği).
- Sesli uyarı uygulama kapalıyken de çalışsın (asıl değer bu).

Bu iki hedef — maksimum kontrol ve sadelik — doğal gerilimde. Çözüm: **progressive disclosure** (katmanlı gizleme). Üst katman sade; granülarite talep üzerine açılır.

## 3. Kullanıcı deneyimi — üç katman

### Katman 1: Vakit listesi (en sade)
- Ana switch (muhafız açık/kapalı) + Yoğunluk preset'i (Hafif/Normal/Yoğun — global, tek seçim).
- 5 vakit satırı: İmsak, Öğle, İkindi, Akşam, Yatsı. (Güneş muhafızda planlanmaz.)
- Her satırda **dinamik özet** (ayarlara göre canlı üretilir): "Öğle — Sadece bildirim", "İkindi — Sesli + bildirim".
- Kullanıcı hiçbir şey açmadan durumu görür. 20 hücre görünmez.

### Katman 2: Vakit açık → adımlar
- Vakite dokununca o vaktin **4 sabit seviyesi** (adımı) listelenir: Nazik hatırlatma / Uyarı / Sert uyarı / Acil.
- **Adım sayısı sabittir** — kullanıcı ekleyip çıkaramaz (öngörülebilirlik). Her adım düzenlenir veya kapatılır (sessiz = kapalı).
- Her adım satırı **dinamik özet** taşır: "30 dk kala · bildirim · çan", "15 dk kala · bildirim + sesli anons · melodi". Özet, seçili mod/eşik/ses'e göre canlı üretilir; statik değildir.
- İki buton:
  - **"Tüm vakitlere uygula"** — bu vaktin tüm ayarını diğer 4 vakte kopyalar. Ana karmaşıklık yönetim aracı: kullanıcı bir vakti kurar, hepsine yayar.
  - **"Akışı önizle"** — bu vaktin tüm hatırlatma akışını canlı gösterir (bkz. 3.4).

### Katman 3: Adıma dokun → detay
Bir adımın tüm boyutları, sade satırlar halinde:
- **Nasıl uyarsın** — mod segmenti: sessiz / bildirim / sesli / ikisi (4 seçenek, ikonlu).
- **Kaç dk kala** — eşik, artı/eksi stepper (ör. 30 dk).
- **Sıklık** — bir kez / tekrarlı (ör. her 15 dk).
- **Bildirim sesi** — uygulama içi hazır seslerden (çan/melodi/alarm…) + ▶ önizleme. (Mod bildirim/ikisi ise görünür.)
- **Sesli anons metni** — mod sesli/ikisi ise görünür. Hazır şablon + serbest düzenleme (bkz. 3.3).

### 3.3 Dinamik sesli anons metni (kritik)
- Metin **statik süre içermez.** `{süre}` yer tutucusu kullanılır: "İkindi vakti çıkıyor, son **{süre}** dakika."
- Sebep: sıklık "tekrarlı" ise her tetiklemede kalan süre değişir (30 → 24 → 18). Statik "30 dakika" yanlış olur.
- TTS her konuşmada `{süre}`'yi o anki gerçek kalan dakikayla değiştirir.
- Kullanıcı `{süre}`'yi cümlede **istediği yere** koyabilir. Hazır şablonlar verilir ("Vakit çıkıyor, son {süre} dakika" / "İkindi vaktini kaçırma, {süre} dakika kaldı"); isteyen kendi metnini yazar.
- Şablon + serbest düzenleme: kolay başlangıç + tam özgürlük. Boş kutu bırakılmaz (kötü ilk deneyim).

### 3.4 Önizleme — vaktin tüm akışı
- Vakit düzeyinde "Akışı önizle": o vaktin adımlarını **zaman çizelgesinde sırayla** oynatır (30dk→nazik, 15dk→uyarı, 3dk→acil).
- Her adımda: bildirim iner → (varsa) ses çalar → (varsa) sesli anons konuşur, `{süre}` gerçek değerle.
- Amaç: kullanıcı ayarladığı bildirimlerin gerçekte **hangi akışla ve nasıl** geleceğini kurarken görsün.
- Not: tek-adım önizlemesi değil, tüm-akış seçildi. Detay sayfasındaki "önizle" de bu akıştan o adımı vurgulayabilir.

## 4. Veri modeli

Mevcut `ArkaplanMuhafizAyarlari` (global eşik/sıklık) yerine vakit×seviye matrisi:

```
MuhafizAyarlari {
  aktif: boolean
  koordinatlar: {lat, lng}
  yogunluk: 'hafif' | 'normal' | 'yogun'   // global preset (eşikleri toplu ölçekler)
  vakitler: Record<VakitAdi, VakitMuhafizAyari>   // imsak/ogle/ikindi/aksam/yatsi
}

VakitMuhafizAyari {
  seviyeler: [SeviyeAyari, SeviyeAyari, SeviyeAyari, SeviyeAyari]  // sabit 4: nazik/uyari/sert/acil
}

SeviyeAyari {
  mod: 'sessiz' | 'bildirim' | 'sesli' | 'ikisi'
  esikDk: number          // kaç dk kala
  siklik: 'birkez' | number  // birkez | her N dk
  bildirimSesi: string    // uygulama içi ses id (mod bildirim/ikisi ise)
  anonsMetni: string      // {süre} placeholder içerebilir (mod sesli/ikisi ise)
}
```

- **Türetilmiş özet** (UI): `mod + esikDk + bildirimSesi`'nden dinamik metin üretilir. Kalıcı değil.
- **"Tüm vakitlere uygula":** bir `VakitMuhafizAyari`'yı diğer tüm anahtarlara kopyalar (saf fonksiyon).
- Store deseni: mevcut `*Yukle`/`*Guncelle` + AsyncStorage thunk. Muhafız ayarları zaten Redux'ta; şekil genişler.

## 5. TTS mimari (native — araştırma sentezi)

Kaynak: 2026-07-17 araştırması. Doğrulama fazı oturum limitine takıldı ama iddialar developer.android.com'dan çıkarılmış standart platform davranışları.

**Nerede:** Mevcut Kotlin foreground service içinde (`modules/expo-countdown-notification`). Android 15'te audio focus zaten yalnız foreground service'e verilir — mevcut mimari doğru yer.

**Tetikleme:** Mevcut `expo-notifications` trigger'ları Doze'da çalışıyor (kullanıcı bildirimleri alıyor); TTS aynı noktada tetiklenir. (Gerekirse `setExactAndAllowWhileIdle` Doze'u delen yedek.)

**Ses akışı / DND:** `USAGE_ALARM` (STREAM_ALARM) — sessiz modu ve DND'yi aşar, ezan/namaz uygulaması kullanıcı beklentisi. **Varsayılan karar:** sesli uyarı alarm akışında çalar. (İstenirse ileride "sessizde çalma" seçeneği eklenebilir; ilk sürümde alarm akışı.)

**Audio focus:** `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK` — müzik/podcast kısılır, TTS konuşur, biter, geri gelir. Konuşma bitince `abandonAudioFocus`. `AudioAttributes` TTS'e `setAudioAttributes` ile bağlanır (aynı attributes hem focus hem player'da).

**Lifecycle tuzağı:** `TextToSpeech` init'i asenkron (`OnInitListener`). Servis TTS hazır olmadan konuşamaz. `UtteranceProgressListener` ile bitişi bekle → sonra audio focus bırak + servisi durdur. Yoksa konuşma yarıda kesilir.

**Türkçe dil:** her cihazda garanti değil (bazı Huawei/Çin cihazları). `isLanguageAvailable(tr-TR)` kontrol → `LANG_MISSING_DATA`/`LANG_NOT_SUPPORTED` ise (a) kullanıcıyı `ACTION_INSTALL_TTS_DATA`'ya yönlendir **veya** (b) sessizce sadece-bildirime düş (TTS'siz). İlk sürüm: yoksa bildirime düş + ayarlarda uyarı göster.

**İzinler (Android 13/14/15):** `FOREGROUND_SERVICE` (mevcut), `POST_NOTIFICATIONS` (mevcut). Android 14+ foreground service **type** zorunlu.
- **AÇIK RİSK:** TTS için `mediaPlayback` (+`FOREGROUND_SERVICE_MEDIA_PLAYBACK`) mantıklı görünür ama Google Play `mediaPlayback`'i "kullanıcının başlattığı sürekli medya" için ister; kısa uyarı TTS'i buna uymayabilir → **uygulama reddi riski**. `specialUse` alternatifi Play review gerektirir. **Bu karar implementasyondan ÖNCE netleşmeli** (Play Console policy + mevcut countdown service'in hâlihazırdaki type'ı incelenerek).

**Pil/performans:** `TextToSpeech` her konuşma için init/shutdown (singleton sürekli hazır tutmak pil/RAM yer). Foreground service zaten kısa ömürlü (countdown süresince).

## 6. Bildirim sesleri
- **Kaynak:** uygulama içi hazır sesler (çan/melodi/alarm…). Cihaz zil sesi karışmaz; telif temiz; öngörülebilir.
- Ses dosyaları `android/app/src/main/res/raw/` veya notification channel'a bağlı.
- ▶ önizleme: ayarda sesi çalıp dinletir.

## 7. Migrasyon
Mevcut global muhafız ayarı → vakit×seviye modeli:
- Mevcut global eşik/sıklık **tüm 5 vakit × 4 seviyeye** kopyalanır (varsayılan hepsi aynı).
- Mod = `bildirim` (mevcut davranış; ses yoktu).
- `bildirimSesi` = varsayılan, `anonsMetni` = boş (TTS kapalı — opt-in).
- İdempotent, veri kaybı yok (mevcut ayar korunur, dönüştürülür).

## 8. Karar günlüğü (brainstorming)
- Sunum: **vakit-merkezli progressive disclosure** (global+override ve tam-matris elendi — biri granülariteyi gömüyor, diğeri 380px'de okunmuyor).
- Adım modeli: **sabit 4 seviye** (esnek ekle/çıkar elendi — sadelik).
- TTS içeriği: **kullanıcı seçsin** (kısa anons / içerik metni) + `{süre}` dinamik.
- Anons metni: **şablon + serbest düzenleme**.
- Bildirim sesi: **uygulama içi hazır sesler** (cihaz sesi ileride).
- Önizleme: **vaktin tüm akışı**.
- TTS motoru: **native foreground service** (expo-speech/JS elendi — kapalıyken çalışmaz).

## 9. Implementasyon fazları (decomposition)

Bu tek PR değil. Bağımlılık sırasıyla:

- **Faz 1 — Veri modeli + migrasyon (saf, native yok).** `MuhafizAyarlari` yeni şekil, slice, kalıcılık, migrasyon, "tümüne uygula" saf fonksiyonu, dinamik özet üreticisi, `{süre}` interpolasyon motoru. Tamamı test edilebilir, cihaz gerektirmez.
- **Faz 2 — Ekran yeniden kurulumu (RN/UI, TTS'siz).** 3 katman: vakit listesi → adımlar → detay. Mod/eşik/sıklık/ses UI. "Tümüne uygula" butonu. Sesli mod satırları görünür ama "yakında" (Faz 3'e kadar pasif) VEYA yalnız bildirim modları aktif. Bildirim sesleri (uygulama içi) bu fazda çalışır.
- **Faz 3 — TTS native altyapı.** Kotlin foreground service'e TTS + audio focus + Türkçe dil kontrolü + izinler. **Play Store FGS-type kararı ÖNCE.** Sabit anonsla cihazda doğrula (debug APK build). En riskli faz.
- **Faz 4 — TTS'i ekrana bağla.** Sesli mod aktifleşir, anons metni Faz 3 köprüsüne gider.
- **Faz 5 — Tüm-akış önizleme.** Vakit düzeyinde animasyonlu önizleme (bildirim + ses + TTS simülasyonu).

Her faz kendi spec/plan/PR döngüsüne sahip olabilir. Native fazlar (3) cihaz doğrulaması ister (`gh workflow run android-build.yml`).

## 10. Açık riskler / karara bağlı
1. **Play Store FGS-type** (mediaPlayback vs specialUse) — Faz 3 öncesi netleşmeli, uygulama reddi riski.
2. **Cihaz doğrulaması** — TTS davranışı (Doze, audio focus, sessiz mod, Türkçe dil eksik cihaz) yalnız gerçek cihazda doğrulanır; unit test yetmez.
3. **DND/alarm akışı** — varsayılan alarm akışı agresif; kullanıcı geri bildirimine göre "sessizde çalma" opt-out'u gerekebilir.
4. **Sıklık × dinamik metin** — tekrarlı hatırlatmada `{süre}` doğru interpolasyon (Faz 1 test kapsamı).

## 11. Kapsam dışı (bu tasarım DEĞİL)
- Cuma namazı hatırlatıcısı (#173 — ayrı issue).
- Cihaz zil seslerinden seçim (ileride, Faz 6+).
- iOS TTS (proje Android).
