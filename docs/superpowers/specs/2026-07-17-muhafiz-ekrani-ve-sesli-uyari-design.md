# Tasarım: Muhafız ekranı yeniden kurulumu + vakit/seviye bazlı sesli uyarı (TTS)

**Tarih:** 2026-07-17
**Durum:** Tasarım onaylandı (brainstorming) + Fable 5 spec review düzeltmeleri işlendi. Implementasyon fazlara bölündü — Faz 1 planlanabilir.
**İlgili:** #78 (namaza özel bildirim/ses), muhafız bildirim başlığı spec `2026-07-17-muhafiz-bildirim-basligi-design.md` + PR #172.

---

## 1. Problem

İki bağlantılı sorun:

1. **Muhafız ayarları ekranı karışık.** Kullanıcı 4 iç içe zaman penceresini ("Nazik Hatırlatma", "Uyarı", "Şeytanla Mücadele", "Acil Alarm") ve her birinin eşik + sıklığını (özel modda 8 sayısal ayar) aynı anda kafasında kurmak zorunda. Eşiklerin sıralı olması gerekiyor; bozulursa davranış tuhaflaşıyor.
2. **Sesli uyarı yok.** Kullanıcı vaktin çıkmasına az kala telefonu cebindeyken bildirimi görmeyebilir. Sesli anons bu boşluğu doldurur — kullanıcı bunu **vakit ve seviye bazında** kontrol edebilmeli.

## 2. Hedef ve kısıt

- Kullanıcı **her vakit × her seviye** için: sessiz / bildirim / sesli / ikisi.
- Her hücre için ayrıca: **kaç dk kala** (eşik), **sıklık**, **bildirim sesi**, **sesli anons metni**.
- **Tek tık ile tüm vakitlere uygula.**
- Granülariteye rağmen ekran **basit ve anlaşılır** kalsın → progressive disclosure.
- Sesli uyarı uygulama kapalıyken de çalışsın.

## 3. Kullanıcı deneyimi — üç katman

### Katman 1: Vakit listesi
- Ana switch + Yoğunluk preset'i (global — bkz. 4.1).
- 5 vakit satırı: **Sabah, Öğle, İkindi, Akşam, Yatsı**. (Güneş muhafızda planlanmaz.)
  - Görünen adlar kardeş spec ile tutarlı: `imsak→Sabah` (`VAKIT_ADLARI`, `muhafizMetinYardimcisi`). "İmsak" değil "Sabah" gösterilir. [M2]
- Her satırda **dinamik özet** (ayarlara göre canlı): "Öğle — Sadece bildirim".

### Katman 2: Vakit açık → adımlar
- 4 **sabit** seviye: Nazik hatırlatma / Uyarı / Sert uyarı / Acil. Ekle/çıkar yok; her adım düzenlenir veya kapatılır (sessiz).
- Her adım satırı **dinamik özet**: "30 dk kala · bildirim · çan". Mod/eşik/ses'ten türetilir, kalıcı değil.
- İki buton:
  - **"Tüm vakitlere uygula"** — bu vaktin ayarını diğer 4 vakte kopyalar (bkz. 4.3, `{vakit}` placeholder sayesinde metin güvenli).
  - **"Akışı önizle"** — vaktin tüm hatırlatma akışını oynatır (bkz. 3.4).

### Katman 3: Adıma dokun → detay
- **Nasıl uyarsın** — mod: sessiz / bildirim / sesli / ikisi.
- **Kaç dk kala** — eşik stepper.
- **Sıklık** — bir kez / tekrarlı (her N dk).
- **Bildirim sesi** — uygulama içi seslerden + ▶ önizleme (mod bildirim/ikisi ise). Kanal stratejisi: bkz. 6.
- **Sesli anons metni** — mod sesli/ikisi ise. Şablon + serbest düzenleme (bkz. 3.3).

### 3.3 Dinamik sesli anons metni
- Metin statik süre/vakit içermez. **İki yer tutucu:** `{vakit}` ve `{süre}`.
  - `{süre}` → o anki gerçek kalan dakika (tekrarlı sıklıkta her tetiklemede değişir: 30→24→18).
  - `{vakit}` → o vaktin adı ("Sabah"/"İkindi"…). **Bu, "tümüne uygula"nın metni bozmamasının anahtarı** [I1]: şablon "İkindi" yazmaz, `{vakit}` yazar; kopyalanınca Öğle'de doğru okunur.
- Hazır şablonlar **vakit-agnostik**: "{vakit} vakti çıkıyor, son {süre} dakika." / "{vakit} namazını kaçırma, {süre} dakika kaldı."
- Kullanıcı yer tutucuları cümlede istediği yere koyar; kendi metnini yazabilir.
- **Dil:** Sesli anons bir ibadet-hatırlatma metnidir → AGENTS.md'deki **muhafız sen-dili istisnası** kapsamında ("kullanıcı uygulamayı yönetiyorsa siz; ibadete çağırıyorsa sen"; #172 ile AGENTS.md'ye yazıldı). Şablonlar sen + emir kipi ("kaçırma"). Ekran arayüzü (butonlar/etiketler) kibar siz kalır. [M1]
- **Kopya sonrası uyarı:** kullanıcı serbest metne elle bir vakit adı yazdıysa ("İkindi") "tümüne uygula" onu düzeltmez → uygula onayında "metinlerde `{vakit}` kullanın" ipucu göster.

### 3.4 Önizleme — vaktin tüm akışı
- Vakit düzeyinde "Akışı önizle": adımları zaman çizelgesinde sırayla oynatır (30dk→nazik … 3dk→acil). Her adımda bildirim + (varsa) ses + (varsa) anons, `{vakit}`/`{süre}` gerçek değerle.

## 4. Veri modeli

```
type MuhafizVakti = Exclude<VakitAdi, 'gunes'>   // Sabah/Öğle/İkindi/Akşam/Yatsı [M6]

MuhafizAyarlari {
  aktif: boolean
  yogunluk: 'hafif' | 'normal' | 'yogun' | 'ozel'   // 'ozel' KORUNUR [I3]
  vakitler: Record<MuhafizVakti, VakitMuhafizAyari>
  // NOT: koordinatlar burada TUTULMAZ — çağrı anında konum state'inden enjekte edilir [M3]
}

VakitMuhafizAyari { seviyeler: [SeviyeAyari × 4] }   // sabit: nazik/uyari/sert/acil

SeviyeAyari {
  mod: 'sessiz' | 'bildirim' | 'sesli' | 'ikisi'
  esikDk: number
  siklik: 'birkez' | { herDk: number }
  bildirimSesi: string     // uygulama içi ses id
  anonsMetni: string       // {vakit}/{süre} içerebilir
}
```

### 4.1 Yoğunluk ↔ hücre etkileşimi [I3, Y2]
- `yogunluk` bir **preset**: hafif/normal/yogun tüm hücrelerin **yalnız `esikDk` + `siklik`** değerlerini toplu ayarlar. **`mod`/`bildirimSesi`/`anonsMetni` ASLA preset'ten etkilenmez** — bunlar kullanıcının ayrı ekseni (Y2: ezme kapsamı = sadece zamanlama).
- Kullanıcı **bir hücrenin eşik/sıklığını** elle değiştirince yoğunluk otomatik `'ozel'` olur (mevcut `gelismisMod` mantığının yerini alır). Mod/ses/anons değişikliği yoğunluğu `'ozel'` yapmaz (onlar preset ekseninde değil).
- Preset (hafif/normal/yogun) seçmek elle ayarlanmış **eşik/sıklıkları** preset değerlerine döndürür — kullanıcıya "özel eşik ayarlarınız preset'e dönecek" onayı gösterilir. Mod/ses/anons korunur.
- `'ozel'` iken preset çubuğunda hiçbiri seçili görünmez ("Özel" etiketi).

### 4.2 Eşik çakışma / sıralama semantiği [I2] — motive eden problem #1'in çözümü
- Eşikleri **zorla sıralama** (nazik>uyarı>sert>acil) — kullanıcı ters giremesin; stepper sınırları komşu seviyelere göre kısıtlanır.
- Aktif seviye kuralı (mevcut kodun "aynı dakikada en yüksek seviye" davranışını netleştirir): **kalan dakikayı kapsayan en küçük eşikli (en acil) aktif seviye kazanır.** Sessiz (kapalı) seviye pencere sağlamaz; o aralıkta bir alt seviye aktifse onun sıklığı işler.
- Faz 1 test kapsamı: ters sıra reddi, çakışan pencerede doğru seviye, sessiz seviyenin alt seviyeye etkisi.

### 4.3 "Tüm vakitlere uygula"
- Bir `VakitMuhafizAyari`'yı diğer tüm `MuhafizVakti` anahtarlarına kopyalar (saf fonksiyon).
- Metin güvenli çünkü şablonlar `{vakit}` kullanır (bkz. 3.3).

## 5. TTS / sesli uyarı mimari — GERÇEK kod tabanına göre [C1]

**Düzeltme:** `modules/expo-countdown-notification` bir foreground service İÇERMEZ. Bugünkü yapı: `CountdownNotificationHelper.kt` (düz `NotificationManager.notify` + chronometer `RemoteViews`), `CountdownReceiver.kt` (AlarmManager broadcast). Manifest'te `<service>` kaydı yok.

> **⚠️ FAZ 4 UYGULAMA KARARI (bu bölümün FGS önerisini GEÇERSİZ KILAR):** Foreground service **yazılmadı**. Android 14+ `foregroundServiceType` zorunluluğu (`mediaPlayback` → Play "kullanıcı-başlatan sürekli medya" ister; `specialUse` → Play review) **uygulama reddi riski** taşıyordu (aşağıdaki risk 2). Uygulanan mimari: `AnonsZamanlayici.planla` → `setExactAndAllowWhileIdle` → `AnonsReceiver` → **`goAsync()`** (~10 sn pencere) → `AnonsKonusucu` TTS → `onDone` → focus bırak + `shutdown` + `finish()`. Kısa anons (1-3 sn) pencereye sığar; **yeni izin/FGS type gerekmedi** (risk 1 ve 2 kapandı). Aşağıdaki ses akışı / audio focus / lifecycle / Türkçe dil maddeleri **aynen geçerli**; yalnız "FGS" yerine "receiver goAsync penceresi" okuyun.

Dolayısıyla TTS için:
- ~~**Foreground service SIFIRDAN yazılacak**~~ → **UYGULANMADI** (yukarıdaki karara bakın); tetikleme seçeneği (a) exact alarm → BroadcastReceiver seçildi.
- **Tetikleme mekanizması (açık soru, Faz 4 araştırması):** Zamanlanmış bir `expo-notifications` bildiriminin *gösterilmesi* uygulama kodu çalıştırmaz → TTS'i tetikleyecek kanca YOK. Seçenekler: (a) AlarmManager exact alarm → BroadcastReceiver → FGS başlat + konuş; (b) mevcut `CountdownReceiver` desenini genişlet. **Android 12+ arkaplandan FGS başlatma kısıtı var** — exact-alarm-tetikli receiver'ın FGS başlatma muafiyeti (ve `setExactAndAllowWhileIdle` vs `setAlarmClock` farkı; `setAlarmClock` durum çubuğunda alarm ikonu gösterir) Faz 4 öncesi **doğrulanmalı**.
- **Ses akışı / DND:** `USAGE_ALARM` — sessiz modu/DND'yi aşar (namaz uygulaması beklentisi). İlk sürüm varsayılanı; ileride "sessizde çalma" opt-out'u.
- **Audio focus:** `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK`; `AudioAttributes` TTS'e `setAudioAttributes`. Konuşma bitince `abandonAudioFocus`.
- **Lifecycle:** `TextToSpeech` init asenkron (`OnInitListener`); `UtteranceProgressListener` ile bitişi bekle → focus bırak → servisi durdur.
- **Türkçe dil:** `isLanguageAvailable(tr-TR)`; eksikse `ACTION_INSTALL_TTS_DATA` yönlendirmesi **veya** sessizce sadece-bildirime düş + ayarlarda uyarı.
- **İzinler (Android 13/14/15):** `FOREGROUND_SERVICE` (+ Android 14 için type ve eşleşen `FOREGROUND_SERVICE_*` izni), `POST_NOTIFICATIONS`, exact-alarm izni. **AÇIK RİSK:** FGS type `mediaPlayback` (Play "kullanıcı-başlatan sürekli medya" ister → kısa uyarı uymayabilir, **reddi riski**) vs `specialUse` (Play review). Faz 4 ÖNCESİ karar.
- **Pil:** `TextToSpeech` her konuşmada init/shutdown (singleton hazır tutma pil/RAM yer).

## 6. Bildirim sesleri — kanal stratejisi [I4]

**Android 8+ gerçeği:** bildirim sesi **notification channel özelliği**; kanal oluşturulunca ses değiştirilemez. Yani "hücre başına bildirimSesi" pratikte **ses başına ayrı kanal** demek.

- Ses dosyaları `android/app/src/main/res/raw/` = **native değişiklik** (AGENTS.md "android/ önce sor"). Bu yüzden **bildirim sesleri Faz 2'de değil, native fazda** ele alınır — Faz 2 saf RN/UI değildir bu açıdan; kanal stratejisi native gerektirir.
- Strateji: sabit bir "ses paleti" (çan/melodi/alarm/sessiz) → her biri için önceden tanımlı kanal; hücre `bildirimSesi` bir kanal seçer. Mevcut kod zaten seviye≥3'ü ayrı kanala bağlıyor (`ArkaplanMuhafizServisi` `channelId`, `MUHAFIZ_ACIL`) — yeni palet bununla **birleştirilmeli**, kanal enflasyonu (sonsuz kanal) önlenmeli. Eski/kullanılmayan kanal temizliği + kullanıcının sistemden kanalı susturması ele alınmalı.

## 7. Migrasyon [M4]
Mevcut global muhafız ayarı → vakit×seviye modeli:
- Mevcut global eşik/sıklık **tüm 5 vakit × 4 seviyeye** kopyalanır.
- `mod = 'bildirim'` (mevcut davranış; ses yoktu). `bildirimSesi` = varsayılan.
- `anonsMetni = ''` (TTS opt-in kapalı). Kullanıcı modu sesli/ikisi'ye çevirince UI, anons kutusunu vakit-agnostik şablonla (3.3) **ön-doldurur** — kullanıcı boş kutuyla karşılaşmaz.
- `yogunluk`: mevcut değeri korunur; mevcut `'ozel'`/`gelismisMod=true` → `'ozel'`.
- İdempotent, veri kaybı yok.

## 8. Karar günlüğü (brainstorming + review)
- Sunum: vakit-merkezli progressive disclosure (global+override, tam-matris elendi).
- Adım modeli: sabit 4 seviye (esnek ekle/çıkar elendi).
- TTS içeriği: kullanıcı seçsin + `{vakit}`/`{süre}` dinamik.
- Anons metni: şablon + serbest; şablonlar vakit-agnostik.
- Bildirim sesi: uygulama içi hazır sesler (kanal-tabanlı).
- Önizleme: vaktin tüm akışı.
- TTS motoru: native FGS (sıfırdan; expo-speech/JS elendi — kapalıyken çalışmaz).
- **Seviye-3 içerik havuzu** (`SEYTANLA_MUCADELE_ICERIGI`): mevcut bildirim gövdesi havuzu ile yeni `anonsMetni` AYRI şeyler [M5]. Havuz bildirim GÖVDESİNİ besler (kardeş spec), `anonsMetni` sesli anonstur. "Şeytanla Mücadele" görünen adı ekranda "Sert uyarı" olur (bilinçli — kod id'leri değişmez).

## 9. Implementasyon fazları

- **Faz 1 — Veri modeli + davranış semantiği (saf, native yok, test edilebilir).** `MuhafizVakti`/`MuhafizAyarlari` yeni şekil, slice, kalıcılık, migrasyon, "tümüne uygula" saf fonksiyonu, dinamik özet üreticisi, `{vakit}`/`{süre}` interpolasyon motoru, **eşik çakışma/sıralama kuralı (4.2)**, yoğunluk↔hücre kuralı (4.1). Cihaz gerektirmez.
- **Faz 2 — Ekran (RN/UI).** 3 katman + mod/eşik/sıklık UI + "tümüne uygula" + yoğunluk. Yalnız **bildirim modları** (TTS'siz) aktif; sesli mod satırı görünür ama pasif ("yakında").
- **Faz 3 — Motor adaptörü [C2].** Üç tüketiciyi (`ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`) yeni matristen okuyacak şekilde güncelle: mod=sessiz atla, per-vakit eşik/sıklık, bastırma (#90: sayaç vs muhafız), bildirim sesi kanal seçimi. **Bu olmadan Faz 2'nin yazdığını hiçbir şey uygulamaz.** Kanal stratejisi (bölüm 6) burada.
- **Faz 4 — TTS native.** FGS sıfırdan + tetikleme + audio focus + Türkçe dil + izinler. **Play Store FGS-type + Android 12+ FGS-başlatma kararı ÖNCE.** Cihazda doğrula (debug APK). En riskli.
- **Faz 5 — TTS'i ekrana bağla + tüm-akış önizleme.** Sesli mod aktifleşir; `anonsMetni` native köprüye; önizleme animasyonu.

> **✅ FAZ 5 UYGULAMA NOTLARI:** (a) sesli modlardaki **"yakında" rozeti kaldırıldı**; (b) `trDestekleniyorMu()` → `useTurkceTtsDestegi` hook'u, Türkçe paketi yoksa **bilgilendirme bandı** (engelleme YOK; `null`=bilinmiyor → uyarı gösterilmez); (c) **ön plan anonsu** `NamazMuhafiziServisi.kontrolEt` içinde — arka planla **aynı id** (`core/muhafiz/anonsKimligi.ts`) kullanılır, native `FLAG_UPDATE_CURRENT` alarmı çoğaltmak yerine **değiştirir**; ön plan her zaman arka plan alarmından önce çalıştığı için (`kalanDk = floor(kalanSureMs/60000)` ⟹ `şimdi ≤ çıkış − kalanDk·60000`) ezilecek alarm daima henüz tetiklenmemiştir → **çift konuşma yok**; (d) "Akışı önizle" (3.4) motorun saf `vakitUyariPlaniOlustur` planını gösterir — **gerçek bildirim göndermez**, yalnız isteğe bağlı "Dinle" ile sabit id'li tek atış anons okutur. Zaman çizelgesi **animasyonsuz** (statik liste) tutuldu: adım sayısı yoğunluğa göre 7–15 arası değişir, otomatik oynatma bekleme süresi yaratır ve AGENTS.md "abartılı animasyon yok" çıtasına aykırı olurdu.

Her faz kendi spec/plan/PR döngüsü. Native fazlar (3 kanal, 4 TTS) cihaz doğrulaması ister.

## 10. Açık riskler / karara bağlı
1. ~~**[C1] TTS tetikleme + FGS başlatma**~~ — **KAPANDI (Faz 4):** exact alarm → `BroadcastReceiver.goAsync()`; FGS hiç kullanılmadı → Android 12+ arkaplandan-FGS-başlatma kısıtı konu dışı.
2. ~~**Play Store FGS-type**~~ — **KAPANDI (Faz 4):** FGS yok → `foregroundServiceType` yok, red riski yok. Yeni izin de eklenmedi.
3. **Cihaz doğrulaması** — TTS + bildirim kanalları yalnız gerçek cihazda doğrulanır.
4. **DND/alarm akışı** — varsayılan agresif; opt-out gerekebilir.
5. **Kanal enflasyonu** [I4] — ses paleti sabit tutulmalı, sonsuz kanal üretilmemeli.

## 11. Kapsam dışı
- Cuma namazı hatırlatıcısı (#173).
- Cihaz zil seslerinden seçim (ileride).
- iOS TTS (proje Android).
