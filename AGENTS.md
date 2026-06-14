# AGENTS.md — Namaz Akışı

> Proaktif İslami ibadet asistanı. **React Native 0.81 + Expo SDK 54** (bare workflow, `android/` native dizini git'te), **TypeScript 5.9 strict**, **Redux Toolkit**, **NativeWind/Tailwind**, **Jest + jest-expo**. New Architecture **açık** (`app.json: newArchEnabled: true`).
>
> Bu dosya tüm kod agent'ları (Jules, Codex, Cursor, Copilot, Gemini, Claude) için **tek doğru kaynaktır**. Kısa ve yüksek-sinyal tut: uzun anlatım değil, kural ve reçete yaz.

## ✅ İşi bitirmeden önce: DOĞRULAMA ZORUNLU
Her değişiklikten sonra, PR açmadan / işi teslim etmeden önce şunu çalıştır ve **GEÇMESİNİ SAĞLA**:

```bash
npm run verify    # = typecheck + lint + test (ÜÇÜ DE geçmeli)
```

Geçmiyorsa iş **bitmemiştir** — hatayı düzelt, çözemiyorsan açıkça raporla. Bozuk kod (tip hatası, tanımsız referans, kırık test) asla teslim edilmez; uygulama runtime'da çöker.

## Komutlar
| Amaç | Komut |
|---|---|
| **Doğrulama kapısı** | `npm run verify` |
| Bağımlılık kurulumu | `npm install` |
| Tip kontrolü | `npm run typecheck` |
| Lint | `npm run lint` (otomatik düzelt: `npm run lint:fix`) |
| Testler | `npm test` (tek dosya: `npx jest <isimParçası>`) |
| Geliştirme | `npm start` / `npm run android` |

> ⚠️ `package.json`'a yeni bağımlılık eklendiyse **veya master'dan yeni commit çektiysen önce `npm install` çalıştır** — yoksa typecheck "modül bulunamadı" verir. Bu bir kod hatası DEĞİL, senkronsuz `node_modules`'tır.

## Proje yapısı
- `src/domain/` — servisler, iş kuralı (**store'a BAĞIMLI OLMAMALI**; tipleri dosya-içi yerelleştir, yapısal uyum yeter)
- `src/data/local/` — veri erişim katmanı (AsyncStorage)
- `src/presentation/` — ekranlar, bileşenler, store (Redux slice'ları), hooks
- `src/core/` — sabitler, tema, util, tipler
- `src/navigation/AppNavigator.tsx` — Tab + Stack (ayar sayfaları `AyarlarStack` içinde)
- `android/` — native (git'te). Testler her katmanda `__tests__/` içinde.

## Kod stili ve isimlendirme
- **Kod isimleri Türkçe** (değişken/fonksiyon/dosya): `vakit`, `ayarlar`, `olustur`, `temizle`...
- **Kullanıcıya görünen TÜM metin kibar "siz" dilinde**: "ekleyebilirsiniz", "kontrol edin", "vakitleriniz". Asla "sen/senin". CTA da kibar: "Hemen kurun", "İnceleyin".
- State: her slice `*Yukle` / `*Guncelle` desenini izler; kalıcılık AsyncStorage ile thunk içinde.
- Stil/format kurallarını **sen kovalama** — `npm run lint` yapar. (Kullanıcıyla daima **Türkçe** konuş.)

## Kritik desenler ve tuzaklar (bu projede öğrenildi)
- **New Architecture açık** → RN core `<Modal>` `onRequestClose`'u Android donanım geri tuşunda **güvenilmez**. Her modalda `useDonanimGeriTusu(gorunur, onKapat)` kullan (`src/presentation/hooks/useDonanimGeriTusu.ts`). `onRequestClose`'u da bırak (zarar yok).
- **Bottom-sheet**: backdrop'u içeriği saran `TouchableWithoutFeedback` olarak DEĞİL, `StyleSheet.absoluteFill` ile **kardeş (sibling)** koy — yoksa içteki FlatList/ScrollView scroll'u takılır. Örnek: `TakvimAyarlariSayfasi.tsx`.
- **Sabit yükseklikli sheet**: `maxHeight` yerine `height` kullan (`flex:1` çocuklar ancak öyle çalışır).
- Namaz vakti hesabı **gün bazında**: her gün için ayrı `new PrayerTimes(coordinates, tarih, params)` (`TakvimServisi.takvimOlaylariOlustur`).
- **Foreground muhafız (ses/banner) açılışta diskten HYDRATE edilmeli**: `NamazMuhafiziServisi` kılınmışlığı **bellek-içi** `kilinanVakitler` map'inden okur; bu map açılışta BOŞtur → zaten kılınmış namaza vakte kısa süre kala (seviye ≥ 3) çan sesi çalardı (#92 — yaşanmış bug). `AnaSayfa`, `muhafiz.baslat()`'tan **ÖNCE** `await muhafiz.acilistaKilinanlariYukle()` çağırmalı (`baslat` ilk `kontrolEt`'i hemen çalıştırır → sıra şart; effect cleanup için `iptalEdildi` bayrağı geç `baslat`'ı engeller). Kılınmışlık **tek doğru kaynağı** disk: `kilinanVakitleriAl(tarih)` (`LocalNamazServisi`, `MUHAFIZ_AYARLARI_kilinan_<tarih>` → `VakitAdi[]`) — `ArkaplanMuhafizServisi`/`VakitSayacBildirimServisi` de bunu kullanır; toggle'da `vakitKilindiTemizle → vakitBildirimleriniIptalEt → kilinanVaktiKaydetTarihli` zinciri yazar. **Anahtar formatı uyumu kritik**: `kontrolEt`/`namazKilindiIsaretle` map anahtarı `${new Date().toDateString()}_${vakit}`; hydrate de aynı format kullanmalı. **Gece yarısı geçişi**: `kontrolEt` yatsıyı her zaman BUGÜNÜN `toDateString()`'i ile kontrol eder ama disk dünün yatsısını `dunuAl()` anahtarına yazar → hydrate dünün **yatsı**sını BUGÜN anahtarıyla da işaretler (gündüz zararsız; vakit aktif değil). Detay: `docs/superpowers/specs/2026-06-14-acilista-kilinan-namaz-ses-bug-design.md`.
- **Testlerde sabit tarih yazma**: muhafız bildirim ID'leri `muhafiz_{tarih}_vakit_...` formatında ve servis bugün/dün ile filtreler — mock ID'lerde sabit tarih, test yazıldığı günden sonra patlar. `bugunuAl()`/`dunuAl()` (`TarihYardimcisi`) kullan.
- `npm audit fix --omit=dev` node_modules'tan **dev bağımlılıklarını siler** (typecheck "Cannot find name 'describe'" verir) — ardından `npm install` çalıştır.
- **Puanlama = kayıttan TÜREV (karma türev/defter modeli)**: `toplamKilinanNamaz`, `mukemmelGunSayisi` (eşik = `tamGunEsigi` 3/4/5) ve `tabanPuan` (kılınan × 5) namaz kayıtlarından `puanlamayiYenidenHesapla` (reconcile) ile türetilir — **olay-tetiklemeli sayaç artırma YAPMA** (toggle "kıldım/kılmadım" ile şişer; yaşanmış bug). Yol-bağımlı `bonusPuan` (tam gün/seri/toparlanma/rozet) kalıcı; `toplamPuan = tabanPuan + bonusPuan`. **TEK-YAZICI:** `seviyeDurumu`'nu yalnız reconcile yazar, `seriKontrolet` yazmaz; yazım yolları `seriKontrolet → reconcile` **SIRALI** zincirlenir (paralel dispatch = yarış + veri kaybı). `bonusPuan` **açılışta diskten okunmalı** ve migrasyon (`eski toplamPuan − eski taban`) `seriVerileriniYukle` içinde yapılmalı (reconcile/seriKontrolet'ten önce); yoksa bayat-0 üzerine yazılıp meşru bonus kalıcı silinir. Detay tasarım: `docs/superpowers/specs/2026-06-14-puan-defteri-ve-veri-butunlugu-design.md`.
- **Depolama: gün-bazlı + merkezî katman**: Namaz kayıtları artık tek blob değil, `namaz_gun_<tarih>` anahtarlarında (`{namazAdi:bool}`). Tüm AsyncStorage erişimi `src/data/local/Depolama.ts` üzerinden geçmeli — **anahtar-bazlı atomik yazma kuyruğu** (`guncelle` = atomik read-modify-write) lost-update korumasını genelleştirir. Eski blob→gün-anahtarı göçü `LocalNamazServisi.migrasyonyiGarantile` ile **idempotent** (atomik skip-if-exists) ve eski blob **SİLİNMEZ** (sıfır veri-kaybı; bayatlar, yok sayılır). `onEkiOlanAnahtarlar(önek)` kullanan yeni anahtarlar öneki **çakıştırmamalı** (ör. migrasyon bayrağı `@namaz_akisi/...` ayrı önekte). Aralık okuması `cogunuOku` (multiGet) ile tek tur. **`cogunuOku`/multiGet HAM string döndürür** (`Depolama.oku`'nun aksine güvenli-parse uygulanmaz) → düz `JSON.parse` YERİNE güvenli çöz (`hamGunVerisiniCoz`): `JSON.parse('null')→null`, `('42')→sayı` gibi null/nesne-dışı sonuçlar downstream `gun[ad]` / `Object.entries(gun)` ile **çöker** (bot bulgusu). **Göç eşzamanlılık:** `migrasyonyiGarantile` bellek-içi **in-flight kilit** (`migrasyonKilidi`) + `finally`-temizle kullanır — eşzamanlı açılış çağrıları tek göçü paylaşır (blob 1 kez okunur), KALICI önbellek YOK (bayrak gerçek idempotency muhafızı; `finally`-temizle test-kontaminasyonunu önler — "yalnız-hatada-temizle" göçü kalıcı atlardı).

## Güvenlik kuralları (bu projede öğrenildi)
- **Harici URL açmadan önce doğrula**: API'den gelen her indirme/yönlendirme linki `guvenilirBaglantiMi` (`GuncellemeServisi.ts`, https + domain beyaz listesi) ile doğrulanır; GitHub kaynağında doğrulama `indirmeBaglantisiBul()` içinde yapılır, güvenilmezse `releases/latest` fallback'i.
- **Loglara hassas veri yazma**: loglar AsyncStorage'da tutulur ve `DebugLogsSayfasi`'ndan paylaşılabilir. Koordinat loglanacaksa en fazla `toFixed(1)` (~11 km, şehir hassasiyeti).
- **AndroidManifest izinleri**: `allowBackup="false"`; kullanılmayan izinler (`RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, legacy storage) `tools:node="remove"` ile engellenir — kütüphane manifest merge'i geri ekleyemesin. Yeni kütüphane eklerken izin sızıntısını kontrol et.
- **WebView**: `geolocationEnabled` açıksa `onShouldStartLoadWithRequest` ile host beyaz listesi zorunlu; dış linkleri `Linking.openURL` ile sistem tarayıcısına devret (örnek: `WebPusulaView.tsx`).
- **CI izinleri**: `ci.yml` üst seviye `contents: read`; yazma izni yalnız `auto-release` job'unda (job-seviyesi izin üst seviyeyi override eder).

## Reçete — Yeni özellik duyurusu
Yeni özelliği kullanıcıya duyurmak için **tek yer**: `src/core/constants/YeniOzellikler.ts`. Diziye en üste bir `YeniOzellik` ekle (id, surum, tarih, baslik, aciklama özeti, detayAciklama, detaylar[], ops. hedefSayfa/ctaEtiketi/kartGoster). Ayarlar nokta rozeti + menü "Yeni" rozeti + (kartGoster ise) tanıtım kartı + "Neler Yeni" sayfası **otomatik** beslenir; ek kod gerekmez. Kopya kibar "siz" dilinde.

## Güncelleme sistemi (gotcha)
Provider: Play Store kurulumu → `PlayStoreGuncellemeKaynagi` (Play Core), aksi halde `GitHubGuncellemeKaynagi`. **Play Core sürüm ADI/changelog VERMEZ**, sadece `availableVersionCode` → modal sade "Yeni sürüm" gösterir; yenilikler güncelleme sonrası "Neler Yeni" sistemiyle (`YeniOzellikler.ts`) duyurulur. Kullanıcıya **asla** "versionCode N" gösterme. Play Store aktifken `guncellemeKontrolEt` önbelleği ATLAR (bayatlık tespit edilemediği için).

## CI / Sürümleme
- APK = **Gradle** (`android-build.yml`), AAB = **EAS** (`expo-build.yml`) → Play Store internal track.
- `android-build.yml` reusable'dır ve `ci.yml`'in `auto-release` job'undan çağrılır. **Reusable'ın istediği izinler caller job'un izinlerinin ALT KÜMESİ olmalı** → `actions: write` hem `android-build.yml`'de hem `auto-release`'te gerekli, yoksa `startup_failure`.
- Release sırası: önce **GitHub Release yayınla**, EN SON EAS dispatch.
- `eas.json`: `appVersionSource: local`; sürüm numarasını CI yönetir.

## Test konvansiyonu
- Slice testleri `src/presentation/store/__tests__`, servis testleri `src/domain/services/__tests__`.
- `jest.mock` ile mock'la: `expo-calendar`, `adhan`, `@react-native-async-storage/async-storage`, `react-native` (`Platform`). Örnek: `TakvimServisi.test.ts`.
- Redux state Immer ile **donmuş** → diziyi `.sort()` etmeden önce `[...dizi]` ile kopyala.

## 🚧 Sınırlar
**✅ Her zaman:** `src/`'e yaz · değişiklikten sonra `npm run verify` çalıştır ve geçir · kibar "siz" dili · var olan deseni izle.
**⚠️ Önce sor / dikkatli ol:** yeni bağımlılık ekleme · `android/` native değişikliği · CI workflow (`.github/workflows`) düzenleme · public API/şema/store şekli değişimi · release/sürüm mantığı.
**🚫 Asla:** secret/token/anahtar/kişisel veri commit'leme · `node_modules` / `android/app/build` / `coverage` düzenleme · `npm run verify` kırıkken teslim etme · kullanıcıya görünen metinde "sen" dili · sürüm numarasını elle değiştirme (CI yönetir).

## Jules / agent ortam kurulumu
Jules kısa ömürlü bir Ubuntu VM açar. **Jules proje ayarlarında** şunları MUTLAKA tanımla (yoksa kendini doğrulamaz, bozuk PR açar — Jules'un en yaygın hata sebebi budur):
- **Setup script:** `npm install`
- **Test / validation command:** `npm run verify`

Böylece Jules PR açmadan önce typecheck + lint + test geçişini çalıştırır, başarısızsa suite geçene kadar iterasyon yapar. Prod anahtarı koyma; stub/local-only kullan.
