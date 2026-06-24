# Tanı & Sorun Bildirme — Tasarım

> Tarih: 2026-06-24 · Durum: onaylandı (brainstorming) · Sonraki: implementasyon planı

## 1. Amaç ve bağlam

Sessiz hatalar (uygulama çökmeden bir özelliğin bozulması; ör. yakalanmış bir `createAsyncThunk` reddi bir ekranı sonsuz "Yükleniyor"da bırakır — yaşanmış kaza-yükleme bug'ı) **Play Console / Android Vitals tarafından görülmez** (yalnız çökme + ANR yakalanır; yanıt-veren-ama-bozuk durumlar ANR bile vermez). Uygulamada otomatik crash reporting yok ve **eklenmeyecek** (gizlilik-hassas İslami uygulama; kullanıcı tercihi: dışarıya veri gönderen SaaS yok).

Bu özellik, **kullanıcı-başlatımlı, cihazda kalan, doğrudan geliştiriciye giden** bir tanı-bildirme akışı kurar: mevcut `Logger` → AsyncStorage kayıtlarını maskeleyip hazır bir e-postaya koyar; kullanıcı **görüp onaylayarak** gönderir. Arka planda hiçbir şey gitmez.

## 2. Hedefler / Hedef olmayanlar

**Hedefler**
- Sorun yaşayan kullanıcı, **tek "kontrol et & gönder"** adımıyla teknik tanıyı `support@furkanisikay.com`'a iletsin.
- "Arka planda veri kaçırılıyor" izlenimi **sıfır**: tam şeffaf, görünür, kontrol kullanıcıda.
- Kritik hatalarda proaktif (otomatik nazik teklif) + her zaman manuel erişim.

**Hedef olmayanlar (YAGNI)**
- Uzaktan/SaaS hata toplama (Sentry vb.) — bu fazda yok.
- Otomatik gönderim, sessiz telemetri — asla.
- Hesap/oturum, sunucu tarafı — uygulamada zaten yok.

## 3. Gizlilik ilkeleri (çekirdek — pazarlık yok)

1. **Otomatik gönderim YOK.** Otomatik kural yalnızca bir modal gösterir; e-posta ancak kullanıcı mail uygulamasında görüp gönderince çıkar (`expo-mail-composer` zaten göndermeden önce tüm e-postayı gösterir → ikinci doğal onay).
2. **Yeni veri toplanmaz.** Loglar zaten cihazda yerel (mevcut DebugLogs özelliği); akış yalnız var olanı derler.
3. **Kişisel ibadet verisi GİTMEZ:** namaz geçmişi, kaza kayıtları, puan, ham AsyncStorage dökümü e-postaya **konmaz**. Yalnız teknik loglar + ortam bilgisi.
4. **Konum opsiyonel, varsayılan KAPALI.** Konum (koordinat) varsayılan olarak **hiç gönderilmez**; kullanıcı önizlemede bilinçli açarsa yalnız **şehir düzeyinde** (`toFixed(1)`) eklenir.
5. **Önizleme zorunlu:** mail açılmadan kullanıcı "ne gider / ne gitmez"i görür ve dilerse tam logu inceler.

## 4. Kullanıcı akışı (UX)

### 4.1 Otomatik tetik modalı (`TaniBildirModali`)
- Kritik bir hata `sorunBildirildi(baglam)` dispatch eder. Modal yalnız `hatirlatmaAcik && !oturumdaGosterildi` iken çıkar; **oturumda en fazla bir kez**.
- **Sade, ikon-öncelikli** (interrupt anında yazıya boğmadan):
  - Ortalı amber ikon-çipi (`alert-triangle`), başlık **"Bir sorun oluştu"**, alt satır **"Bize bildirmek ister misiniz?"**.
  - İki görsel güven rozeti (yeşil tint): `lock` **"Otomatik gönderilmez"** · `circle-check` **"Onay sizde"**.
  - Butonlar: birincil **"Bildir"** (mail ikonu) → önizleme; ikincil **"Şimdi değil"**; ikincil **"Bir daha sorma"** → `hatirlatmaAcik=false`.
- Detayın tamamı bu modalda DEĞİL, önizleme ekranındadır.

### 4.2 Manuel giriş
- Ayarlar → yeni **"Tanı ve Geri Bildirim"** bölümü → **"Sorun Bildir"** → aynı önizleme ekranı. Her zaman erişilebilir (toggle kapalı olsa da).

### 4.3 Önizleme / onay ekranı (`TaniOnizlemeSayfasi`/modal)
- Başlık: **"Ne gönderiliyor?"** / "Göndermeden önce görün".
- **İmza öğesi — güven kartı:**
  - **Gönderilecek** (yeşil ✓): uygulama sürümü · telefon + Android sürümü · teknik kayıtlar (loglar) · *(konum açıksa)* yaklaşık konum (şehir).
  - **Gönderilmeyecek** (gri ✗): namaz/kaza/puan · kişisel veriler · *(konum kapalıyken)* yaklaşık konum.
- **Konum anahtarı** (varsayılan KAPALI): açılınca konum satırı "Gönderilmeyecek"ten "Gönderilecek"e **canlı geçer**, ipucu "Kapalı" → "Açık · yalnız şehir".
- Opsiyonel **"Ne oldu? (isteğe bağlı)"** metin alanı.
- **"Tam kaydı görüntüle"** → mevcut `DebugLogsSayfasi` (şeffaflık).
- Birincil **"E-postayı aç"** → `TaniGonderServisi`.

### 4.4 E-posta oluşturma (`TaniGonderServisi`)
- `expo-mail-composer` ile **alıcı + konu + gövde + log eki** önceden dolu açılır; kullanıcı gönderir.
  - Alıcı: `DESTEK_EPOSTA` = `support@furkanisikay.com`.
  - Konu: `Namaz Akışı tanı — v{sürüm}`.
  - Gövde: sürüm, versionCode, OS sürümü, cihaz modeli, tetik bağlamı, opsiyonel "Ne oldu?".
  - Ek: maskelenmiş loglar (`.txt`, `expo-file-system` ile cache'e yazılır).

### 4.5 Hata / fallback
- `MailComposer.isAvailableAsync()` false (mail uygulaması yok) → `expo-sharing` share-sheet ile **aynı maskelenmiş dosya** paylaşılır + `BildirimModali` ile bilgi.
- Compose iptal → no-op. Tüm hatalar `Logger` ile loglanır, çökme yok.

### 4.6 Animasyon / motion (AGENTS.md UI standardı)
- Modal: yumuşak scale+fade giriş (spring, `cubic-bezier(.34,1.5,.6,1)`); ikon ince "nefes"; birincil butonda hafif "hazır" halkası.
- Önizleme: güven kartı satırları kademeli (stagger) belirir; konum anahtarı yumuşak kaydırma + satır geçişi.
- `prefers-reduced-motion`/cihaz reduce → tüm hareket sadeleşir.

## 5. Mimari ve bileşenler

**Domain (store-bağımsız, saf, test edilebilir)**
- `domain/services/TaniRaporuServisi.ts` — `taniRaporuOlustur(baglam?, konumDahil): {konu, govde, logMetni}`; `Platform.constants` ile cihaz/OS, sürüm sabitleri, `Logger.exportLogs()`.
- `loglariMaskele(metin, { konumDahil })` — **saf**: `konumDahil=false` → koordinat desenlerini `[konum gizlendi]` yap; `true` → `toFixed(1)` (şehir). Her durumda token/anahtar redaksiyonu.
- `domain/services/TaniGonderServisi.ts` — `expo-mail-composer` sarmalı + temp dosya + `isAvailableAsync` + `expo-sharing` fallback.

**State (slice deseni + AsyncStorage)**
- `presentation/store/taniSlice.ts` — `{ sorunAlgilandi, baglam, hatirlatmaAcik (kalıcı, varsayılan true), oturumdaGosterildi }`. Action: `sorunBildirildi(baglam)`, `taniModaliKapat`, `hatirlatmaGuncelle`. Ayar `Depolama` ile kalıcı (`*Yukle`/`*Guncelle`).

**UI (presentation)**
- `TaniBildirModali` — App kök seviyesinde host (her ekranın üstünde çıkabilsin), `useDonanimGeriTusu`, tema.
- `TaniOnizleme` — güven kartı + konum anahtarı + opsiyonel metin + DebugLogs köprüsü + "E-postayı aç".
- `TaniGeriBildirimSayfasi` (Ayarlar) — Sorun Bildir, hatırlatma toggle, önizle, açıklama, DebugLogs linki → `AyarlarStack`'e ekle.

**Sabit + bağımlılık**
- `core/constants`: `DESTEK_EPOSTA = 'support@furkanisikay.com'`.
- Yeni bağımlılık: **`expo-mail-composer`** (Expo paketi, bare uyumlu) — onaylandı.

**Enstrümantasyon**
- İlk bağlanma: **kaza yükleme reddi** yolu (`fix/kaza-yukleme-dayaniklilik` ile uyumlu) → `dispatch(sorunBildirildi('Kaza sayfası yüklenemedi'))`. İleride başka kritik `catch`/`rejected` yolları eklenebilir.

## 6. Veri & maskeleme — özet
- **E-postaya giren:** sürüm/versionCode/OS/cihaz · maskelenmiş teknik loglar · opsiyonel "Ne oldu?" · *(opt-in)* şehir-düzeyi konum.
- **Asla girmeyen:** namaz/kaza/puan/kişisel veri, ham AsyncStorage, hassas token.
- **Maskeleme tek noktada** (`loglariMaskele`, saf, test edilir) ve cihazdan çıkmadan uygulanır.

## 7. Test stratejisi
- `loglariMaskele` (saf): konum kapalı → koordinat gizlenir; açık → `toFixed(1)`; token redaksiyonu; kişisel veri sızmaz.
- `taniRaporuOlustur`: alanları doğru toplar, maskelenmiş logu içerir, `konumDahil` bayrağına uyar.
- `taniSlice` reducer: `sorunBildirildi` flag set; `hatirlatmaAcik` kalıcı; oturumda-bir-kez kapısı.
- `TaniBildirModali` / `TaniOnizleme` render: şeffaf kopya + "Gönderilmeyecek" listesi görünür; konum anahtarı satırı taşır; reduced-motion'da hareket yok.
- `expo-mail-composer` + `expo-sharing` mock; fallback yolu test edilir.
- Ağır sayfa testlerinde `jest.useFakeTimers()` (AGENTS.md süre-sınırı notu).

## 8. Sınırlar / açık konular / gelecek
- Bu faz reaktif (kullanıcı onayıyla). Proaktif/toplu görünürlük (self-host veya opt-in-anonim uzak) ayrı/gelecek karar.
- `expo-mail-composer` cihazda mail uygulaması gerektirir → fallback share-sheet kapsar.
- Otomatik tetik yalnız açıkça işaretlenen kritik yollara bağlanır (her `warn`'a değil) — kapsam zamanla genişler.
