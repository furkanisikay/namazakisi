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

> **Lint warning'leri kapı DEĞİL** — yalnız *error* `verify`'ı durdurur. Ama dokunduğun dosyaya **yeni warning EKLEME** (`any`, kullanılmayan değişken, `console.log`…); mevcut warning'leri temizlemek zorunda değilsin, yenisini bırakma.

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

> ⚠️ **Lockfile'ı yeniden üretirken CI'nin npm sürümünü kullan (npm 10 / Node 20).** Yerelde npm 11 (Node 24) ile `npm install` yapıp lockfile'ı commit'lersen, npm 11 bazı transitifleri (yaşanmış: `cosmiconfig@9.0.2` — `@commitlint`/`cosmiconfig-typescript-loader` bağımlılığı) lockfile'dan **düşürür**; CI'nin npm 10 `npm ci`'ı `Missing: <paket> from lock file` ile patlar → master kırmızı, **auto-release atlanır (release kesilmez)**. `npm run verify` yerelde GEÇER (mevcut `node_modules`'ı kullanır, `npm ci` bütünlük kontrolünü yapmaz) → yanıltıcı. Doğru akış: `npx -y npm@10 install` ile yeniden üret, sonra **`npx -y npm@10 ci`** ile doğrula (CI'nin tam komutu; exit 0 = senkron). Combine ettiğin dependabot lockfile'larında bu özellikle önemli.

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
- **`Alert.alert` KULLANMA** (kullanıcıya görünen geri bildirim için): yerel/kötü görünür, uygulamanın görsel diline uymaz → tema-uyumlu modal kullan. Genel hata/bilgi/başarı bildirimi için **`BildirimModali`** (`src/presentation/components/common/BildirimModali.tsx`; `tip: 'hata'|'bilgi'|'basari'`, ops. `birincilEtiket`/`onBirincil`), onay için `KerahatOnayModal` kalitesinde modal. Aktif `Alert.alert` çağrısı **kalmadı** (dönüşüm tamam); yenisini EKLEME.
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
- **Kerahat (mekruh) vakti = UYAR, ENGELLEME**: Kerahat vaktinde namaz işaretleme **kilitlenmemeli** (issue #82 — yaşanmış bug). Ana ekranda `mekruhBilgi.mekruhMu` ile `kilitli=true` yapmak `VakitKarti`/`VakitAkisi` butonunu `disabled` ediyordu → kullanıcı kıldığı namazı işaretleyemiyordu. Doğru desen (`KazaDefteriSayfasi` gibi): uyarı bannerını GÖSTER + işaretlemeden önce kibar onay modalı (`KerahatOnayModal`) çıkar, onaylanırsa işaretle. `AnaSayfa.namazToggle` yalnız `tamamlandi && mekruhBilgi.mekruhMu && mevcutTarih===aktifGun` iken modal açar (geçmiş gün / geri-alma doğrudan geçer). DİKKAT: `vakitBilgisi.vakit==='gunes'` kilidi kerahat DEĞİL — "Öğle vakti henüz girmedi" demektir, KORUNMALI.
- **Depolama: gün-bazlı + merkezî katman**: Namaz kayıtları artık tek blob değil, `namaz_gun_<tarih>` anahtarlarında (`{namazAdi:bool}`). Tüm AsyncStorage erişimi `src/data/local/Depolama.ts` üzerinden geçmeli — **anahtar-bazlı atomik yazma kuyruğu** (`guncelle` = atomik read-modify-write) lost-update korumasını genelleştirir. Eski blob→gün-anahtarı göçü `LocalNamazServisi.migrasyonyiGarantile` ile **idempotent** (atomik skip-if-exists) ve eski blob **SİLİNMEZ** (sıfır veri-kaybı; bayatlar, yok sayılır). `onEkiOlanAnahtarlar(önek)` kullanan yeni anahtarlar öneki **çakıştırmamalı** (ör. migrasyon bayrağı `@namaz_akisi/...` ayrı önekte). Aralık okuması `cogunuOku` (multiGet) ile tek tur. **`cogunuOku`/multiGet HAM string döndürür** (`Depolama.oku`'nun aksine güvenli-parse uygulanmaz) → düz `JSON.parse` YERİNE güvenli çöz (`hamGunVerisiniCoz`): `JSON.parse('null')→null`, `('42')→sayı` gibi null/nesne-dışı sonuçlar downstream `gun[ad]` / `Object.entries(gun)` ile **çöker** (bot bulgusu). **Göç eşzamanlılık:** `migrasyonyiGarantile` bellek-içi **in-flight kilit** (`migrasyonKilidi`) + `finally`-temizle kullanır — eşzamanlı açılış çağrıları tek göçü paylaşır (blob 1 kez okunur), KALICI önbellek YOK (bayrak gerçek idempotency muhafızı; `finally`-temizle test-kontaminasyonunu önler — "yalnız-hatada-temizle" göçü kalıcı atlardı).

- **Kaza yükleme dayanıklılığı / sessiz sonsuz spinner (yaşanmış bug):** `LocalKazaServisi` KAZA_DURUMU'nu **HAM `AsyncStorage`+`JSON.parse`** ile okur (Depolama katmanı DEĞİL → güvenli-parse yok). Diskteki değer bozuk/nesne-dışıysa (`"null"`→`JSON.parse`=null→`.namazlar` patlar; kesik JSON; sayı/string) okuma `{başarılı:false}` döner → `kazaVerileriniYukle` thunk'ı **reddolur** → slice `rejected`'ta `yukleniyor=false` ama `kazaDurumu` **null kalır** → `KazaDefteriSayfasi` render kapısı `if (yukleniyor || !kazaDurumu)` **sonsuz "Yükleniyor..."** gösterir (kullanıcıya hata göstermeden). **Kural:** kaza okuma ASLA reddetmemeli — bozuk veride boş (kullanılabilir) durumla **başarılı** dön, ham değeri **ÜZERİNE YAZMA** (kurtarma için diskte sakla), `Logger` ile tanıla (`tip`/`önek`). **Genel desen:** render kapısı `yukleniyor || !veri` olan her sayfada, yükleyici thunk'ın **reddedilen yolu da `veri`yi doldurmalı veya UI hata/yeniden-dene göstermeli** — yoksa tek bir bozuk anahtar tüm sayfayı sessizce kilitler. Bug sürüme bağlı değildi (0.23.8–master aynı). Test: `LocalKazaServisi.test.ts`.
- **Vakit sayacı vs muhafız çakışması (#90):** Vakit sayacı bildirimi tam olarak muhafız seviye-1 eşiğinde (`baslangicEsikDk = esikler.seviye1`) başlar → muhafız AÇIKSA ilk-seviye hatırlatmasıyla eş zamanlı gereksiz "çıkmak üzere" bildirimi çıkar. `VakitSayacBildirimServisi.yapilandirVePlanla` `muhafizAktif` bayrağı alır; aktifse yalnız temizlik yapıp erken döner (muhafız kapalıyken sayaç normal çalışır). Çağıran her yer (`App.tsx`, `AnaSayfa.tsx`, `BildirimAyarlariSayfasi.tsx`) `muhafizAktif: state.muhafiz.aktif` geçmeli — yoksa bastırma devreye girmez.

- **AnaSayfa gün navigasyonu / snap-back (#13 + gece yarısı):** Pager gün-sayfalarında "aktif gün"e yerleşme mantığı iki bug üretmişti: (1) DateTimePicker'dan geçmiş gün seçince aktif güne geri-snap; (2) gece yarısı sonrası (yatsı sürerken, `now < fajr` → aktif gün=dün) açılışta önce bugüne sonra GÖRÜNÜR biçimde düne zıplama + yanlış "gelecek günlere gidemezsiniz" toast'ı. Kök neden: programatik `setPage` çağrıları `onPageSelected`'ı tetikler ve oradaki `yeniTarih > aktifGun` gelecek-gün engeli, programatik geçişleri kullanıcı kaydırmasından ayırt edemiyordu (pager `initialPage=bugün` iken aktif gün dün → bugün "gelecek" sanılıyordu). Çözüm desenleri: **(a)** açılış snap'i `setTimeout+setPage` (görünür kayma) yerine `setPageWithoutAnimation`; **(b)** `programatikGecisRef` bayrağı — açılış snap'i / tarih seçici / geri-snap öncesi set edilir, `onPageSelected` bu bayrak set iken toast+geri-snap YAPMAZ (yalnız state senkronu), bayrağı **tüketir**; bayrak yalnız hedef indeks mevcuttan FARKLIYSA set edilir (aynı sayfa `setPage` event üretmez → asılı kalıp sonraki kaydırmayı bozardı); **(c)** karar mantığı saf `src/core/utils/gunNavigasyonYardimcisi.ts`'de (`aktifGunuHesapla`, `gelecekGuneGecisMi`) — adhan'a bağımsız, test edilebilir; **(d)** `tarihiSayfaIndeksineCevir` `new Date(isoString)` (UTC) yerine `ISOTarihiDateNesnesiNeCevir` (yerel) kullanmalı — `sayfaIndeksiniTariheCevir` (`gunEkle`, yerel) ile TUTARLI olsun (UTC karışımı negatif timezone'da ±1 gün kaydırır).

## Güvenlik kuralları (bu projede öğrenildi)
- **Harici URL açmadan önce doğrula**: API'den gelen her indirme/yönlendirme linki `guvenilirBaglantiMi` (`GuncellemeServisi.ts`, https + domain beyaz listesi) ile doğrulanır; GitHub kaynağında doğrulama `indirmeBaglantisiBul()` içinde yapılır, güvenilmezse `releases/latest` fallback'i.
- **Loglara hassas veri yazma**: loglar AsyncStorage'da tutulur ve `DebugLogsSayfasi`'ndan paylaşılabilir. Koordinat loglanacaksa en fazla `toFixed(1)` (~11 km, şehir hassasiyeti).
- **AndroidManifest izinleri**: `allowBackup="false"`; kullanılmayan izinler (`RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, legacy storage) `tools:node="remove"` ile engellenir — kütüphane manifest merge'i geri ekleyemesin. Yeni kütüphane eklerken izin sızıntısını kontrol et.
- **WebView**: `geolocationEnabled` açıksa `onShouldStartLoadWithRequest` ile host beyaz listesi zorunlu; dış linkleri `Linking.openURL` ile sistem tarayıcısına devret (örnek: `WebPusulaView.tsx`).
- **CI izinleri**: `ci.yml` üst seviye `contents: read`; yazma izni yalnız `auto-release` job'unda (job-seviyesi izin üst seviyeyi override eder).

## Reçete — Yeni özellik duyurusu
Yeni özelliği kullanıcıya duyurmak için **tek yer**: `src/core/constants/YeniOzellikler.ts`. Diziye en üste bir `YeniOzellik` ekle (id, surum, tarih, baslik, aciklama özeti, detayAciklama, detaylar[], ops. hedefSayfa/ctaEtiketi/kartGoster). Ayarlar nokta rozeti + menü "Yeni" rozeti + (kartGoster ise) tanıtım kartı + "Neler Yeni" sayfası **otomatik** beslenir; ek kod gerekmez. Kopya kibar "siz" dilinde.

## Yedekleme & Aktarım (export/import) — mimari ve tuzaklar
Yerel (Faz 1) şifreli yedek + akıllı içe-aktarma sihirbazı. Katmanlar: **`YedeklemeServisi`** (tüm anahtarları `Depolama` ile topla → şifreli zarf; `zarfiCoz` parse→biçim→sürüm→çöz→checksum→null/payload; ASLA fırlatmaz, hatada `null`), **`YedekBirlestirmeServisi`** (SAF; AsyncStorage'a dokunmaz — `farkCikar` + `birlestirmePlaniOlustur` → anahtar→değer `YazimPlani`), **`core/utils/yedekSifreleme`** (tweetnacl `secretbox`, uygulama-yönetimli anahtar — **SIR DEĞİL**, yalnız gözden-saklama+bütünlük; gerçek gizlilik Faz 2/hesap-türevli anahtar), **`yedeklemeSlice.iceAktarmayiUygula`** (orkestratör). Paylaşılan tipler **`core/types/YedeklemeTipleri.ts`** (domain sunuma bağımlı olamaz!).
- **Veri-kaybı yok kuralı:** hiçbir strateji yıkıcı değil (anahtar silinmez, mevcut-yalnız günler korunur). "Akıllı birleştir" namazda `kılındı = mevcut || gelen` (union — asla geri alma). Akıllı'da **seviye/istatistik YAZILMAZ** → reconcile (`puanlamayiYenidenHesapla`) birleşmiş kayıttan türetir; **seri (streak)**: `enUzunSeri` (rekor) reconcile'dan türetilemez → akıllı'da birleştirilir (`max`; yedekte seri yoksa dokunulmaz, boş cihazda yedeğinki tümden geri yüklenir), güncel seri reconcile'dan türetilir; `bonusPuan = max` ve reconcile'dan **ÖNCE** diske yazılır (AGENTS.md puan kuralı).
- **İçe-aktarma sırası (kritik):** plan'ı `Depolama.yaz` ile yaz → göç bayrağı `DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_MIGRASYON='1'` (`hamYaz`) set et (açılış göçü içe-aktarılanı EZMESİN) → store'u **konum → (ayar/sayaç paralel) → namaz → seri → `seriKontrolet`→`puanlamayiYenidenHesapla` (SIRALI)** → kaza → özellikler tazele.
- Dışa aktarma `expo-file-system` (`File`/`Paths`) + `expo-sharing`; içe aktarma `expo-document-picker`. Bağımlılıklar: `tweetnacl`/`tweetnacl-util`/`expo-crypto`. Detay tasarım/plan: `docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md` + `docs/superpowers/plans/2026-06-14-yerel-yedekleme-aktarim.md`.

## Güncelleme sistemi (gotcha)
Provider: Play Store kurulumu → `PlayStoreGuncellemeKaynagi` (Play Core), aksi halde `GitHubGuncellemeKaynagi`. **Play Core sürüm ADI/changelog VERMEZ**, sadece `availableVersionCode` → modal sade "Yeni sürüm" gösterir; yenilikler güncelleme sonrası "Neler Yeni" sistemiyle (`YeniOzellikler.ts`) duyurulur. Kullanıcıya **asla** "versionCode N" gösterme. Play Store aktifken `guncellemeKontrolEt` önbelleği ATLAR (bayatlık tespit edilemediği için).
- **FLEXIBLE update: `completeUpdate` YALNIZCA kullanıcı onayıyla çağrılır (#91 — yaşanmış bug).** Play Core esnek güncelleme indirme bitince (`installStatus === 11 DOWNLOADED`) `completeUpdate()` uygulamayı ANINDA yeniden başlatır → kullanıcı ekranı görmeden dışarı atılır. Doğru desen: DOWNLOADED gelince `guncellemeSlice.indirmeTamamlandiIsaretle()` dispatch et → `GuncellemeBildirimi` "Yeniden Başlat" ONAY kartı gösterir → `completeUpdate` (`PlayStoreModulu.guncellemeYuklemeyiTamamla`) yalnız o butonla, **bir kez** (`tamamlamaBaslatildi` ref idempotency guard; hata olursa ref sıfırlanır) çağrılır. **`PlayStoreModulu.bekleyenGuncellemeVarMi()` otomatik completeUpdate ÇAĞIRMAZ** (yalnız bool döner); `App.tsx` AppState `active`'te bunu çağırıp true ise yine `indirmeTamamlandiIsaretle()` dispatch eder. Aynı DOWNLOADED durumuna birden çok yerden (component dinleyicisi + AppState) **otomatik** `completeUpdate` = açıl-kapan döngüsü; tek tetik = onay UI'ı.

## CI / Sürümleme
- APK = **Gradle** (`android-build.yml`), AAB = **EAS** (`expo-build.yml`) → Play Store internal track.
- `android-build.yml` reusable'dır ve `ci.yml`'in `auto-release` job'undan çağrılır. **Reusable'ın istediği izinler caller job'un izinlerinin ALT KÜMESİ olmalı** → `actions: write` hem `android-build.yml`'de hem `auto-release`'te gerekli, yoksa `startup_failure`.
- Release sırası: önce **GitHub Release yayınla**, EN SON EAS dispatch.
- `eas.json`: `appVersionSource: local`; sürüm numarasını CI yönetir.
- **master'a HER merge bir release keser (~24 dk).** `auto-release` her master push'unda (`paths-ignore: **.md/docs/LICENSE` hariç) çalışır; `paulhatch/semantic-version` `chore:` dahil her commit'te en az **patch bump** yapar → imzalı APK + Play Store internal. `ci.yml` `concurrency: cancel-in-progress: true` → arka arkaya merge'de sonraki push öncekinin release'ini **iptal eder**; bu yüzden merge'ler **serileştirilmeli** (her run bitmeden sonrakini merge etme). Release commit'i (`chore(release): X [skip ci]`) `package.json`+`package-lock.json`+`app.json`+`build.gradle`+`UygulamaSabitleri.ts`+`CHANGELOG.md`'yi değiştirip push'lar → açık tüm dependabot/lockfile PR'larını çakıştırır (rebase gerekir). **Çoklu PR merge'inde:** ardışık N release'ten kaçınmak için ilişkili/dependabot PR'larını tek dalda birleştir (tek tutarlı lockfile → `npx -y npm@10 ci` ile doğrula → tek release). `.md`-only commit'i doğrudan master'a push edebilirsin (release tetiklemez).

## Test konvansiyonu
- Slice testleri `src/presentation/store/__tests__`, servis testleri `src/domain/services/__tests__`.
- `jest.mock` ile mock'la: `expo-calendar`, `adhan`, `@react-native-async-storage/async-storage`, `react-native` (`Platform`). Örnek: `TakvimServisi.test.ts`.
- Redux state Immer ile **donmuş** → diziyi `.sort()` etmeden önce `[...dizi]` ile kopyala.
- **Yük/zayıf-VM dayanıklı süre sınırları (İKİ ayrı sınır var):** Tam-sayfa RN render testleri (KazaDefteri/DebugLogs/PaylasimModal/KonumAyarlari/IceAktarma gibi) gerçek timer + `waitFor` kullanır → CPU yükü altında veya Jules'un zayıf VM'inde varsayılanları aşıp **flaky timeout** verirdi (test bozuk değil, yalnız yavaş; boştayken hepsi geçer). İkisi de gerçek render maliyetine göre ayarlı, **düşürme**: (1) `jest.config.js > testTimeout: 30000` (test gövdesi sınırı; varsayılan 5000ms); (2) `jest.setup.js > configure({ asyncUtilTimeout: 10000 })` (`waitFor`/`findBy` penceresi; varsayılan 1000ms — testTimeout'tan BAĞIMSIZ, ayrı büyütülmeli). Yeni ağır sayfa testinde mümkünse `jest.useFakeTimers()` ile gerçek timer'lardan (setInterval/setTimeout, Logger debounce) kaçın.

## 🚧 Sınırlar
**✅ Her zaman:** `src/`'e yaz · değişiklikten sonra `npm run verify` çalıştır ve geçir · kibar "siz" dili · var olan deseni izle.
**⚠️ Önce sor / dikkatli ol:** yeni bağımlılık ekleme · `android/` native değişikliği · CI workflow (`.github/workflows`) düzenleme · public API/şema/store şekli değişimi · release/sürüm mantığı.
**🚫 Asla:** secret/token/anahtar/kişisel veri commit'leme · `node_modules` / `android/app/build` / `coverage` düzenleme · `npm run verify` kırıkken teslim etme · kullanıcıya görünen metinde "sen" dili · sürüm numarasını elle değiştirme (CI yönetir).

## Jules / agent ortam kurulumu
Jules kısa ömürlü bir Ubuntu VM açar. **Jules proje ayarlarında** şunları MUTLAKA tanımla (yoksa kendini doğrulamaz, bozuk PR açar — Jules'un en yaygın hata sebebi budur):
- **Setup script:** `npm ci` (lockfile ile paritede; CI de her yerde `npm ci` kullanır → "Jules'ta geçti, CI'da patladı" sapmasını önler). **İstisna:** Jules görev içinde `package.json`'a yeni bağımlılık eklerse `npm ci` o paketi kuramaz → o görevde `npm install` ile `package-lock.json`'u yeniden üretmelidir.
- **Test / validation command:** `npm run verify`

Böylece Jules PR açmadan önce typecheck + lint + test geçişini çalıştırır, başarısızsa suite geçene kadar iterasyon yapar. Prod anahtarı koyma; stub/local-only kullan.

**Ortam gerçekleri (Jules VM):**
- **Node 20** kullan (CI pin'i ile aynı; `package.json > engines.node >= 20.19.4`).
- `npm ci`/`npm install` **`postinstall: patch-package`**'i çalıştırır → `patches/` git'te, taze VM'de yamalar otomatik uygulanır; bu adımı **ATLAMA** (yoksa `react-native-css-interop` sessizce bozulur).
- **PR hedef dalı: `master`** (develop değil).
- Jules `git push` kullanıyorsa panelde **`CI=true`** env tanımla → `.githooks/pre-push` push'ta `verify`'ı gereksiz yere tekrar koşmaz (Jules GitHub App API ile PR açıyorsa hook tetiklenmez, gerek yok).
