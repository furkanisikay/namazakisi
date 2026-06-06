# Namaz Akışı — Kapsamlı Repo Denetimi (2026-06-06)

> 6 paralel uzman ajanla yapılan derin inceleme. Tüm bulgular kodla/grep ile doğrulandı. Amaç: sağlam, "vibe coding"le sürdürülebilir, AI agent'ların çökmeden çalışabileceği bir repo. Bu belge **tespit**tir; düzeltmeler ayrı yapılacak.

## Genel değerlendirme

Repo, "vibe coding ile kirlenmiş" beklentisinin **aksine birçok yönden sağlam**: katman yönü temiz (`domain → presentation` import'u sıfır), `GuncellemeServisi` örnek bir Strategy pattern, kod savunmacı (`@ts-ignore` yok, Logger her serviste, izin/mutex guard'ları var). TODO/yedek-dosya kirliliği yok.

**Asıl borç tek bir kök desende toplanıyor:** *aynı kavramın birden çok yerde bağımsız implementasyonu* (kopya-yapıştır). Bu, kodu "gizli runtime coupling" ile birbirine bağlıyor ve **drift** üretiyor — bir kopya düzeltilip diğeri unutuluyor. AI agent'ların uygulamayı kırmasının da bir numaralı sebebi bu: agent bir yeri düzeltiyor, aynı mantığın 3 kopyasını görmüyor.

---

## 🔥 Tekrar eden kök kalıplar (senin sorduğun "sürekli yapılan hatalar")

| # | Kalıp | Nerede | Sonuç |
|---|---|---|---|
| **A** | **Aynı mantık çoğul kopya** | Vakit hesabı (`new PrayerTimes`) **7 serviste**; tarih helper'ları (`bugunTarihiAl/dunTarihiAl`) **6 yerde** (merkezi `bugunuAl()` varken!); `konumMetniOlustur` **3 ekranda**; `SayisalSecici` **4 ekranda**; storage anahtarları **3-4 yerde** elle string | Bakım N kat, drift kaçınılmaz |
| **B** | **Kopya senkronsuzluğu (drift)** | `index.ts` ↔ `App.tsx` "Kıldım" handler'ı **farklılaşmış** (biri sayaç+muhafiz iptal eder, diğeri sadece muhafiz); İftar/Sahur sayaçları "Kıldım" temizliğine **hiç dahil değil**; iki ayrı "dün" hesabı (biri timezone-bug'lı) | Aynı tık, açık/kapalı uygulamada **farklı davranıyor** |
| **C** | **Dev dosya / SRP yükü** | `TakvimAyarlari` **1786**, `Kurulum` **1561**, `KazaDefteri` **1290**, `KonumAyarlari` **1038** satır; `AnaSayfa`'da **230 satırlık tek `useEffect`** | İnceleme/test imkânsız; küçük LLM'ler zorlanır |
| **D** | **AsyncStorage'a körlemesine güven** | `JSON.parse(...) as Tip` ile alan koruması yok (vakit/iftar/sahur slice); Logger'sız sessiz `catch`; namaz yazımında **race condition** | Sessiz veri kaybı / çökme |
| **E** | **Ölü kod / hijyen** | **14 kullanılmayan bileşen (~2557 satır!)**, yetim `BataryaOptimizasyonu.ts`, **5 kullanılmayan paket**, kullanılmayan Redux action'ları | Gürültü; agent'ları yanlış yönlendirir |
| **F** | **Gevşek tip güvenliği** | `KonumModu` **iki serviste çelişen değer** (`'oto'` vs `'gps'`); `getState() as any`; `useNavigation<any>()`; `vakit as any` | Compiler koruması kapalı; çökme gizli |
| **G** | **Performans** | 1sn timer **her tick'te `new PrayerTimes`**; `AppState 'active'`'te 5 ağır zincir; `VakitKarti/VakitAkisi` memo değil → saniyede tüm liste re-render | Açılış/sayaç jank, batarya |
| **H** | **Tema/stil tutarsızlığı** | NativeWind vs StyleSheet **karışık** (hatta AnaSayfa'da ikisi); düzinelerce inline hex renk | Dark mode kontrast bug'ları |

---

## ✅ İyi yapılanlar (korunmalı)

- Katmanlı mimari yönü temiz (`core`/`data`/`domain`/`presentation`/`navigation`); ters bağımlılık yok.
- `GuncellemeServisi` — `GuncellemeKaynagi` interface + GitHub/PlayStore stratejileri + `resetInstance()`: projedeki DIP/Open-Closed örneği.
- `BildirimServisi.setOnKildimCallback` — domain'i store'a bağlamadan UI'ı haberdar eden doğru DIP refleksi.
- `data/local/**` — fonksiyon-tabanlı, `ApiYanit<T>` zarflı, AsyncStorage'ı düzgün izole eden persistence katmanı.
- Savunmacı kod: `@ts-ignore` yok, Logger 35/35 serviste, başlangıçta `Promise.all` + `InteractionManager` ertelemeleri, timer arka planda durduruluyor, Logger debounce'lu.
- `useDonanimGeriTusu` hook'u temiz ve tutarlı kullanılıyor.

---

## 🔴 KRİTİK bulgular (çökme / veri kaybı / yanlış davranış)

1. **Namaz işaretlemede race condition (veri kaybı).** `LocalNamazServisi.ts:23-40,73-95` read-modify-write; bildirimden "Kıldım" + UI'dan işaretleme aynı anda → biri sessizce kaybolur. → Yazmaları serial queue/mutex ardına al.
2. **"Kıldım" handler drift'i.** `index.ts:19-69` (arka plan) ↔ `App.tsx:266-306` (ön plan) farklı temizlik yapıyor; İftar/Sahur sayaçları hiç kapsanmıyor (`sayac_` prefix'i yalnız VakitSayac). → Tek `BildirimAksiyonIsleyici` servisi, tüm sayaç prefix'lerini kapsasın.
3. **`bugunVakitleriniHesapla()` ~150 satır birebir kopya, drift başlamış.** `ArkaplanMuhafizServisi:137-214` ↔ `VakitSayacBildirimServisi:148-223`; biri `gunes` filtreliyor diğeri değil. → `NamazVaktiHesaplayiciServisi`'ne tekil hesap; sayaç+muhafiz aynı kaynaktan.
4. **`KonumModu` çelişen tip.** `LocalKonumServisi:35` `'oto'|'manuel'` vs `KonumYoneticiServisi:16` `'gps'|'manuel'` — aynı kavram, uyumsuz literal, compiler asla yakalayamaz. → Tek tip `domain/entities/Konum.ts`.
5. **14 ölü bileşen (~2557 satır).** `NamazKarti`, `NamazGrid`, `KompaktNamazKarti`, `GunlukOzet`, `HizliIslemler`, `IftarSayaci`, `DaireselProgress`, `AnimasyonluSayac/Sayi`, `KalanSureSayaci`, `MotivasyonBanner`, `OzelGunKarti`, `SeriAtesiKarti`, `TarihNavigasyonu` — barrel dışında 0 referans. → Sil + barrel'dan çıkar.
6. **1sn timer her tick'te `new PrayerTimes`.** `AnaSayfa:223-254` → `getSuankiVakitBilgisi` her saniye tam vakit hesabı. → Vakitleri günde bir hesapla, tick'te sadece aritmetik.
7. **`vakit as any` + doğrulanmamış ID parse.** `App.tsx:298` çökme/yanlış-iptal riski. → `as VakitAdi` + runtime doğrulama.
8. **Storage anahtarları çoğul tanım.** `'@namaz_akisi/konum_takip_ayarlari'` constants'ta yok, 2 serviste + testlerde elle. → `DEPOLAMA_ANAHTARLARI`'na taşı.

---

## 🟠 ÖNEMLİ bulgular (özet)

- **Üç sayaç servisi klonlanmış** (~230 satır elenebilir): ortak `SayacBildirimServisiTabani` (kanal/temizleme/tarih). İftar/Sahur `console.*` kullanıyor (Logger değil).
- **Slice parse koruması tutarsız.** `vakit/iftar/sahur SayacSlice` `as Tip` ile körlemesine; `muhafiz/takvimSlice` doğru (`{...VARSAYILAN, ...parsed}` + `??`). → Doğru deseni kopyala.
- **Logger'sız sessiz catch'ler.** `iftarSayacSlice:45`, `LocalNamazServisi:27`, Takvim/Kurulum handler'ları → kullanıcıya görünür hata + Logger.
- **Kanal `importance` bağlanmıyor.** `MUHAFIZ`/`MUHAFIZ_ACIL` kanalları kuruluyor ama `channelId` set edilmiyor → özel ses/önem gelmiyor (ölü konfig). → `BildirimKanalYoneticisi`.
- **Native countdown ID ≠ notifee ID.** Tekil "Kıldım" iptali `stopCountdown` çağırmıyor → native sayaç asılı kalabilir.
- **`SayisalSecici` 4 kopya, `SayiGirisModali` 3+ kopya, `IlIlceSecici` (390 satır) ekran-içi.** → `components/common/`'a çıkar.
- **Devasa dosya bölme.** `TakvimAyarlari`/`Kurulum`/`KazaDefteri`/`KonumAyarlari` → alt klasör + adım/modal/seçici ayrımı.
- **`AnaSayfa` 230 satırlık effect** → `useVakitSayaci` + `useNamazMuhafizi` hook'ları.
- **5 kullanılmayan paket:** `expo-crypto`, `expo-status-bar`, `react-native-worklets-core`, `ts-jest`, `cosmiconfig` → kaldır.
- **Android manifest izin sapması:** `SYSTEM_ALERT_WINDOW`, `WRITE_EXTERNAL_STORAGE` app.json'da yok ama manifest'te var (Play Store policy hassas). → Kaynağını araştır.
- **`AppState 'active'` debounce yok** → her foreground'da tüm-bildirim-sil-yeniden-planla. → Koşullandır.
- **`VakitKarti/VakitAkisi` memo değil + callback'ler `useCallback` değil** → saniyede tüm liste re-render. **ScrollView `key`'inde `vakit`** → vakit geçişinde tam remount.

---

## 🟡 İYİLEŞTİRME bulguları (özet)

- `domain/entities/` katmanı yok; `VakitAdi` 4 yerde ayrı tanımlı → tek ev.
- Servis stili 4 ayrı konvansiyon (getInstance / dış singleton / fonksiyon / obje) → standartlaştır.
- `domain/services/index.ts` barrel yarım (18'den 9 servis).
- `vakitAdlari` (imsak→Sabah) sözlüğü 4 yerde → tek `VAKIT_GORUNUM_ISIMLERI`.
- İnline hex renkler → `core/theme/durumRenkleri` (dark mode kontrast bug'larını da çözer).
- NativeWind vs StyleSheet konvansiyon kararı.
- `eslint.config.js`'e `varsIgnorePattern: '^_'` ekle (kasıtlı omit uyarılarını sustur).
- Lint 291 uyarı (0 hata): kullanılmayan import'lar, `prefer-const`, ~200 `any` (çoğu test).
- `npm audit`: 31 zafiyet ama **tamamı transitive dev/build zinciri** (iOS build/jest), runtime app'i etkilemiyor → `npm audit fix` (non-breaking) + expo upgrade ertelenebilir.
- CI: çift cache mekanizması; iki build sistemi (raw Gradle + EAS) paralel → konsolidasyon değerlendir.
- `seciliSehirId` `@deprecated` ama aktif → storage migration gerekir, şimdilik bırak.
- Erişilebilirlik: ikon-butonlarda `accessibilityLabel` yok, dokunma hedefi <44pt.
- Reducer'larda fire-and-forget AsyncStorage yazımı (saf değil) → thunk'a taşı/debounce.

---

## 🔧 Ben düzeltebilirim vs. Sen (repo/dış ayar)

**Ben kod tarafında yapabilirim (onayınla):** ölü kod/paket temizliği, tüm DRY birleştirmeleri (vakit hesabı, tarih, konum metni, SayisalSecici, sayaç tabanı, storage anahtarları), drift düzeltmeleri (Kıldım handler birleştirme), slice parse koruması + Logger, race condition mutex'i, `any` → tipli, dev dosya bölme, performans (timer/memo/debounce), tema renk merkezileştirme, `domain/entities` kurma.

**Senin yapman/karar vermen gerekenler:**
1. **GitHub branch protection** — yeni blocking CI'ın gerçekten merge'i engellemesi için `master`'da "require status checks to pass" aç (Settings → Branches). *Ben repo ayarını değiştiremem; istersen `gh` ile komutunu hazırlarım.*
2. **Jules proje ayarları** — Setup: `npm install`, Test: `npm run verify` (AGENTS.md'de belgelendi; Jules arayüzünden sen girersin).
3. **Android manifest izinleri** — `SYSTEM_ALERT_WINDOW`/`WRITE_EXTERNAL_STORAGE` gerçekten gerekli mi? (Play Store policy kararı senin.)
4. **`npm audit fix`** — lock değişir; onayınla ben çalıştırırım. Expo 56'ya yükseltme breaking, ayrı planlanmalı.
5. **Konvansiyon kararları:** NativeWind mı StyleSheet mi? `KonumModu` kanonik değer (`'oto'` öneririm)? `konumMetniOlustur` birleşince hangi metin (kullanıcıya görünür)? İki build sistemi korunsun mu?

---

## Önerilen düzeltme sırası (faz faz)

- **Faz A — Hızlı kazanım, sıfır risk:** 14 ölü bileşen + `BataryaOptimizasyonu.ts` + 5 paket + kullanılmayan action/import sil (~2700 satır eksilir). `npm run verify` ile doğrula.
- **Faz B — Çökme/veri güvenliği:** race condition mutex, slice parse koruması + Logger, `vakit as any` doğrulama, sessiz catch'ler. (Kullanıcıyı koruyan en kritik faz.)
- **Faz C — DRY çekirdeği:** storage anahtarları → constants; tarih helper'ları → `TarihYardimcisi` (bkz. mevcut Faz-1 planı); vakit hesabı → `NamazVaktiHesaplayiciServisi`; `KonumModu`/konum tipleri → `domain/entities`.
- **Faz D — Bildirim mimarisi:** `BildirimAksiyonIsleyici` (Kıldım drift'i), `SayacBildirimServisiTabani`, `BildirimKanalYoneticisi`.
- **Faz E — UI/SRP:** ortak `SayisalSecici`/`SayiGirisModali`/`IlIlceSecici`; devasa dosya bölme; `AnaSayfa` hook ayrıştırma; tema renkleri.
- **Faz F — Performans:** timer PrayerTimes, memo, AppState debounce, ScrollView key.
- **Faz G — Hijyen:** lint config, `npm audit fix`, barrel, erişilebilirlik, CI sadeleştirme.

> Her faz TDD + `npm run verify` + frequent commits ile yürütülmeli. Faz A/B önce; C-F için her biri ayrı `writing-plans` oturumu önerilir.
