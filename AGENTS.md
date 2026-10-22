# AGENTS.md — Namaz Akışı

> Proaktif İslami ibadet asistanı. **React Native 0.86 + Expo SDK 57** (bare workflow; `android/` git'te, `ios/` git'te DEĞİL — EAS üretir), **TypeScript 6 strict**, **Redux Toolkit**, **NativeWind/Tailwind**, **Jest + jest-expo**. New Architecture zorunlu, Hermes v1. Bağımsız Gradle kökleri: `wear/` (Wear OS), `tv/` (Android TV). iOS hedefleri `targets/` + `plugins/` ile prebuild'de eklenir.
>
> Bu dosya tüm kod ajanları (Claude, Codex, Cursor, Copilot, Gemini, Jules) için **tek doğru kaynaktır**: yalnız her işte geçerli kurallar burada. Alan bilgisi (bir özelliğin tuzakları, reçeteleri, nöbetçi testleri) `docs/ajan/` altındadır — dokunduğun alanın belgesini **kod yazmadan önce** oku (en altta konu dizini).

## ✅ İşi bitirmeden önce: DOĞRULAMA ZORUNLU
```bash
npm run verify    # = typecheck + lint + test (ÜÇÜ DE geçmeli)
```
Geçmiyorsa iş **bitmemiştir** — düzelt, çözemiyorsan açıkça raporla. Bozuk kod (tip hatası, tanımsız referans, kırık test) asla teslim edilmez.
- Lint **warning**'leri kapı değildir; ama dokunduğun dosyaya **yeni warning ekleme** (`any`, kullanılmayan değişken, `console.log`). Kullanmadığın `catch` parametresi de warning'dir → `catch { }` yaz.
- **`verify` build kırığını GÖSTERMEZ:** native kod, `app.json`, config plugin ya da `@expo/*` bağımlılık değişikliği yalnız APK/IPA üretiminde patlar → dala push + `gh workflow run android-build.yml --ref <dal> -f build_type=debug` (iOS: ilgili iOS iş akışı). Ayrıntı: [ci-ve-yayin](docs/ajan/ci-ve-yayin.md).

## Komutlar
| Amaç | Komut |
|---|---|
| Doğrulama kapısı | `npm run verify` |
| Kurulum | `npm install` (CI paritesi: `npm ci`) |
| Tip / lint / test | `npm run typecheck` · `npm run lint` (`lint:fix`) · `npm test` (tek dosya: `npx jest <ad>`) |
| Geliştirme | `npm start` / `npm run android` |

- `package.json` değiştiyse ya da master'dan çektiysen **önce `npm install`** — "modül bulunamadı" kod hatası değil, senkronsuz `node_modules`'tır.
- **Lockfile'ı npm 10 ile üret ve doğrula:** `npx -y npm@10 install` → `npx -y npm@10 ci` (exit 0 = senkron). npm 11 transitif paket düşürür; yerel `verify` geçer ama CI'nin `npm ci`'ı patlar ve release kesilmez.
- `npm audit fix --omit=dev` dev bağımlılıklarını siler → ardından `npm install`. Audit ayrıntıları: [expo-sdk-ve-bagimliliklar](docs/ajan/expo-sdk-ve-bagimliliklar.md).

## Proje yapısı
- `src/core/` — saf çekirdek: sabitler, tema, util, tipler, kurallar (React/native import ETMEZ; zaman `simdi: Date` ile enjekte edilir).
- `src/domain/` — servisler, iş kuralı (**store'a BAĞIMLI OLMAMALI**; tipleri yerelleştir, yapısal uyum yeter). Arka planda (headless görev) Redux yoktur → servisler ham depolamadan okur.
- `src/data/local/` — veri erişimi. **Tüm AsyncStorage erişimi `Depolama.ts` üzerinden** (anahtar-bazlı atomik yazma kuyruğu, `guncelle` = read-modify-write).
- `src/presentation/` — ekranlar, bileşenler, store (slice'lar `*Yukle` / `*Guncelle` deseni, kalıcılık thunk içinde), hooks.
- `src/navigation/AppNavigator.tsx` — Tab + Stack (ayar sayfaları `AyarlarStack` içinde).
- `modules/` (yerel Expo modülleri), `android/` (native, git'te), `wear/`, `tv/`, `targets/` + `plugins/` (iOS), `scripts/`. Testler her katmanda `__tests__/` içinde.

## Kod stili ve dil
- **Kod isimleri Türkçe** (`vakit`, `ayarlar`, `olustur`). **Dosya ve dizin adları SALT ASCII** (`ğüşıöç` YOK): macOS (NFD) Metro çözümlemesini kırar, Linux/Windows'ta görünmez. Kod içi tanımlayıcı/metin ve rota adları serbest. Nöbetçi: `kaynakDosyalariIzleniyor.test.ts` (ayrıca diskteki her kaynağın git'te izlendiğini doğrular).
- **Arayüz metni kibar "siz"** ("ekleyebilirsiniz", "kontrol edin"); asla "sen". Kapsam: ekran, buton, modal, hata/boş durum, ayar, "Neler Yeni". Sentence case, aktif fiil, aksiyon adı akış boyunca sabit.
- **İSTİSNA — ibadete çağrı metni "sen" + emir kipi** (muhafız `muhafizMetinYardimcisi`, `NamazMuhafiziServisi`, `ArkaplanMuhafizServisi`, `core/muhafiz/anonsMetni.ts`; `VakitBildirimIcerikleri.ts`; cuma/yatış yatsı hatırlatması). Kural: kullanıcı uygulamayı **yönetiyorsa** siz, uygulama kullanıcıyı **ibadete çağırıyorsa** sen. Kasıtlıdır, "düzeltme". Sertlik serbest, hakaret/suçlama yasak.
- **Fıkıh doğruluğu:** "secdeye kapan" YAZMA (secde namazın içindeki rükündür; vakit daralınca kişi **namaza durur** — nöbetçi var). **Terk ≠ geciktirme:** hatırlatma alan kişi gecikmiştir, "terk edenin küfrü" türü nass ona yanlış hedeftir. Vakte özgü nass (ör. Buhârî Ezân 34 = yatsı+sabah) genel havuza girmez. İsrâ 17/79 kullanma.
- **Türkçe büyük/küçük harf: `toUpperCase()`/`toLowerCase()` KULLANMA** (`'İkindi'` → `'İKINDI'` / `'i̇kindi'`; `toLocale*('tr-TR')` Hermes'te ICU'ya bağlı). Sabit haritalar: `VAKIT_ADLARI_BUYUK` (`core/utils/muhafizMetinYardimcisi.ts`), `VAKIT_ADLARI_KUCUK`. Yalnız `i` içeren sözcükler bozulduğu için testten kaçar → nöbetçi yaz.
- **`Alert.alert` KULLANMA** → `BildirimModali` (`components/common/BildirimModali.tsx`, `tip: 'hata'|'bilgi'|'basari'`) ya da `KerahatOnayModal` kalitesinde onay modalı.
- **`ToastAndroid` doğrudan KULLANMA** → `kisaBildirimGoster(mesaj, uzun?)` (`components/common/KisaBildirim.tsx`); iOS'ta ToastAndroid sessizce hiçbir şey yapmaz; orada `App.tsx` kökündeki `KisaBildirimKatmani` çizer. Testte modülü mock'la.
- Stil/format kurallarını elle kovalama — `npm run lint` yapar.

## Ekran / UI tasarım standardı (zorunlu)
- **Süreç:** `superpowers:brainstorming` → görsel kararlar için `frontend-design` → gerekirse `deep-research` → tasarımı **kullanıcıya onaylat** → sonra kur.
- **Kalite:** en acemi kullanıcının tek bakışta anladığı netlik, anlamlı ikon, ölçülü animasyon (reduced-motion'a saygı), cesaret tek imza öğesinde.
- **Görsel anlatı korunur (sahip kararı 2026-10-19):** sadeleştirme METNİ kısaltır, illüstrasyonu/animasyonlu anlatımı SİLMEZ. Hareket kuralı ekran türüne göre: tanıtım, sihirbaz ve boş durum ekranlarında sahne GÖRÜNÜRKEN yumuşak döngüyle oynayabilir; ayar listelerinde yalnız girişte (ya da seçim değişince) BİR KEZ oynar; ekran odak dışındayken, uygulama arka plandayken ve "Animasyonları azalt"ta durur (son kare = dinlenme pozu, resim eksiksiz). Tek kapı `components/hareket/dongu.ts` (`useDonguAcik` + `useDonguAnimasyonu`) — her sahneye ayrı kapı yazma. Yalnız transform/opaklık + native driver (genişlik/yükseklik animasyonu yok), renkler token. Ayrıntı: [ana-ekran-ve-ayarlar](docs/ajan/ana-ekran-ve-ayarlar.md).
- **Mevcut görsel dile sadık kal:** renkler YALNIZ `useRenkler` tokenlarından; kart `borderRadius: 24` + `rounded-xl/2xl`; tonlu ikon çipi (`renk + '20'`); `FontAwesome5`; ikincil buton `arkaplan`+`sinir`, birincil dolu `birincil` + ikon + beyaz metin. Referans kalite: `KerahatOnayModal`, `BildirimModali`.
- **Token ≠ en yakın görünen renk:** sabit rengi token'a bağlamadan önce (1) metin mi dekoratif mi ayır, (2) değer birebir aynı değilse kontrastı hesapla (`core/utils/kontrastOrani.ts`). `durum.uyari` = `#FFC107` sarı-amberdir; turuncu `durum.dikkat` (`#E65100`) yalnız DEKORATİF (ikon/çubuk/kenar). Uygun token yoksa temaya token ekle (yaşanmış: `RamazanAyarlariSayfasi.iftarRenk`'i `uyari`'ya bağlamak başlık kontrastını ~1.5:1'e düşürüyordu).
- **Modal:** `<Modal animationType="fade" transparent statusBarTranslucent>`; backdrop içeriği SARMAZ, `StyleSheet.absoluteFill` ile **kardeş** olur (yoksa iç liste kaymaz); sabit yükseklikli sheet `maxHeight` değil `height`. New Architecture'da `onRequestClose` Android geri tuşunda güvenilmez → her modalda **`useDonanimGeriTusu(gorunur, onKapat)`** (`onRequestClose`'u da bırak). İç içe iki kardeş modal iOS'ta sunulamaz → rıza modalını ana modal ağacının içine koy.
- **Sayfa başlığı tek yerde:** ayar ekranları başlığı header'dan alır (`AYARLAR_EKRAN_TANIMLARI`), `edges={['bottom','left','right']}`; gövdede tekrarlama. `headerShown: false` yalnız sekme kökü (`AyarlarAna`) ve kendi üst barını taşıyan sihirbaz (`IceAktarmaSihirbazi`) için.
- **Hatırlatma ayarı tek yerde:** yeni bir hatırlatma yüzeyi Ayarlar'a yeni satır/sayfa AÇMAZ — Hatırlatmalar sayfasına tek satır (anahtar + canlı cümle + ayrıntı) olarak girer; sesli okuma ve gerçek alarm rızası TEKDİR (`useGenelRiza`, yüzeye özgü rıza kaydı açma). Ekranda teknik terim yok ("kanal", "ton", "TTS", "{süre}" → "sertlik", "sesli okuma"). Ayrıntı: [hatirlatma-yuzeyleri](docs/ajan/hatirlatma-yuzeyleri.md).
- **Erişilebilirlik:** dokunma hedefi ≥44dp (`w-11 h-11`), `accessibilityRole`/`accessibilityLabel` (aynı ekranda birden çok stepper → `aciklama` ver), açık disabled durumları.

## Her yerde geçerli tuzaklar
- **Vakit hesabı:** her gün için ayrı `new PrayerTimes(koordinat, tarih, params)` (ör. `TakvimServisi.takvimOlaylariOlustur`); parametre TEK kaynak **`core/vakit/hesapParametreleri.ts > turkiyeHesapParametreleri()`** (= `CalculationMethod.Turkey()`, madhab verilmez = `Madhab.Shafi` → **ikindi asr-ı evvel**, Diyanet takvimiyle aynı; kaynak `docs/superpowers/specs/2026-10-14-ikindi-vakti-asr-i-evvel-kaynak.md`). Hanefî asr-ı sânî KULLANMA (ikindi ~45 dk kayar; "Hanefî kullanıcıya Hanefî" sezgisi yanlış). `CalculationMethod.Turkey()`'yi yerinde kurma. Nöbetçiler: `hesapParametreleri.test.ts`, `GunesVaktiHesaplama.test.ts`, TV paritesi.
- **"Gün" çoğu yerde takvim günü değil NAMAZ GÜNÜDÜR** (ertesi imsakta biter; gece yarısından sonra yatsı sürerken aktif gün dündür). Gün-bazlı kararda tabanı gösterilen güne kur; `new Date('YYYY-MM-DD')` UTC parse eder → `ISOTarihiDateNesnesiNeCevir`. Testte sabit tarih yazma → `bugunuAl()`/`dunuAl()`.
- **Konuma bağlı her tüketici TEK yayma noktasından beslenir:** `KonumDegisikligiServisi.konumDegistiUygula` (sıra: önce `NamazVaktiHesaplayiciServisi.yapilandir`; her tüketici kendi try/catch'inde; `{0,0}` = yapılandırılmadı). `App.tsx` açılışı ayrı liste taşır → yeni tüketiciyi **ikisine de** ekle; uzun ufuklu planlayıcılar ayrıca `ArkaplanGorevServisi`'nde **muhafız erken dönüşlerinden ÖNCE** tazelenir. Ayrıntı: [konum-geofence](docs/ajan/konum-geofence.md).
- **Kalıcı veri TÜREVDİR, sayaç artırma YAPMA:** puan/seri namaz kayıtlarından reconcile ile türetilir (olay-tetiklemeli sayaç toggle ile şişer); kaza defteri değişmez hareketlerden katlanır. Ayrıntı: [kaza-seri-puan](docs/ajan/kaza-seri-puan.md).
- **Slice'ların hepsi açılışta yüklenmez:** başka ekrandan okuduğun slice'ın hidrate olduğunu doğrula (`initialState`'i gerçek veri sanma); render kapısı `yukleniyor || !veri` olan sayfada reddedilen yükleme yolu da veriyi doldurmalı ya da hata göstermeli.
- **Ana ekranın geri sayımı kendi bileşenindedir (`GeriSayimMetni`, D-03) — ana ekrana saniyelik `setState` GERİ EKLEME.** Ekran yine her durum değişiminde çizilir: oraya geçen her geri çağrı `useCallback`, her nesne/tarih `useMemo` ya da dize olmalı (yeni referans `React.memo`'yu ve effect bağımlılıklarını kırar). Ayrıntı [ana-ekran-ve-ayarlar](docs/ajan/ana-ekran-ve-ayarlar.md).
- **Expo modülü `Function` JS thread'inde SENKRON koşar:** I/O, binder, MediaPlayer gibi ağır işi `AsyncFunction` yap, JS tarafında `await`le (ANR).
- **Kullanıcıya görünen sessiz sapma bırakma:** sistem bir ayarı uygulayamıyorsa (sınır, izin, platform) ekran bunu bir bilgi satırıyla söyler.
- **Erteleme bilinçli olarak YOK (sahip kararı 2026-10-19):** muhafızın amacı erteleme alışkanlığını önlemektir; erteleyen kişi unutur, son dakikada abdest/mescit yetişmez. Bildirimde ve gerçek alarmda yalnız "Kıldım" (alarmda ayrıca "Kapat"); Wear OS ve Apple Watch saatin sessiz uyandırmasında da (imsak/teheccüd) yalnız "Kıldım" / "Kapat". Eski #289 "Ertele"yi geri ekleme; güncelleme öncesi `_ertele` artıklarının göçü: [android-native](docs/ajan/android-native.md), saatin eski `ertele` cevabının göçü: [wear-tv](docs/ajan/wear-tv.md).
- **Plan/teslim kuralı üreticide:** bildirim planına yeni eleme/kesme kuralı ekliyorsan servise değil saf plan üreticisine koy (bildirim defteri ve önizleme aynı üreticiden beslenir).
- **Yeni ayar anahtarı yedeklenecekse beyaz listenin ÜÇ yerine** eklenir (`YedeklemeServisi.ayarlariTopla`, `YedekBirlestirmeServisi.AYAR_ANAHTARLARI`, `yedeklemeSlice` yükleme zinciri). Ayrıntı: [yedekleme-esitleme](docs/ajan/yedekleme-esitleme.md).

## Test konvansiyonu (genel)
- Slice testleri `presentation/store/__tests__`, servis testleri `domain/services/__tests__`. Redux state Immer ile donmuştur → `[...dizi].sort()`.
- **Jest'te `Platform.OS` varsayılanı `'ios'`.** Platforma göre dallanan kodu test ederken platformu açıkça kur (`jest.replaceProperty(Platform, 'OS', …)`; getter'lar için `jest.spyOn(Platform, 'Version', 'get')`). `react-native` modülünü tümden mock'lamak diğer export'ları düşürür.
- **`requireNativeModule` jest'te yoktur:** native köprü import eden servisi (doğrudan ya da DOLAYLI, automock dahil) yükleyen her test köprüyü mock'lamalı; ekranlarda native servisler tembel `require` ile yüklenir.
- **`jest.clearAllMocks()` implementasyonu silmez** → `beforeEach`'te kullandığın mock'ları `mockResolvedValue` ile açıkça sıfırla.
- **Tam sayfa RN render + `jest.useFakeTimers` CI'da asılır** (yerelde görünmez): senaryoyu mock girdisinden kur, beklemeyi gerçek zamanda `waitFor` ile yap; mock bileşene gereksiz çocuk çizdirme.
- **CI testleri UTC'de koşar**, yerel makine UTC+3: saat dilimine bağlı şüpheli testi `TZ=UTC npx jest <ad>` ile de koş.
- Ayrıntılı tuzaklar: [test-tuzaklari](docs/ajan/test-tuzaklari.md).

## Yapılandırma ve CI tuzakları
- **`.gitignore`'da dizin kalıbını köke sabitle: `/ios/`, `ios/` DEĞİL** — başında `/` olmayan kalıp her derinlikteki aynı adlı dizini (ör. `src/core/muhafiz/ios/`) yutar; EAS arşivi `.gitignore`'a göre kurulduğu için build yalnız orada patlar.
- **`eas`/`expo` CLI komutları `app.json`'ı kendiliğinden yeniden yazabilir** (`expo install` eklenti ekler, eas-cli izin enjekte eder — `RECORD_AUDIO` bilinçli olarak kaldırılmıştır). Her CLI komutundan sonra `git status`; yazmadığın değişikliği `git checkout app.json` ile at.
- **`expo prebuild` yalnız `-p ios --no-clean`** — `android/` elle bakılır ve prebuild onu siler.
- **master'a HER merge bir release keser** (semantic-version; `feat(...)` minor, diğerleri patch; imzalı APK + Play internal ~24 dk). Merge'leri serileştir (yeni push uçuştaki release'i iptal eder); ilişkili PR'ları tek dalda birleştir. Araç/betik/workflow işini ayrı dalda `gh workflow run <wf> --ref <dal>` ile geliştir; yalnız araç/belge içeren PR'ı `[skip ci]` konulu merge commit'iyle birleştir. Uygulamaya dokunmayan commit'e `feat:` verme.
- **Release adımında tag push'tan SONRA atılır** (rebase release commit'ini yeniden yazar). Sürüm numarasını elle değiştirme. Ayrıntı: [ci-ve-yayin](docs/ajan/ci-ve-yayin.md).

## Güvenlik
- Harici URL açmadan önce doğrula (`guvenilirBaglantiMi`: https + domain beyaz listesi).
- Loglar cihazda tutulur ve `DebugLogsSayfasi`/tanı raporuyla paylaşılabilir: hassas veri yazma; koordinat en fazla `toFixed(1)`; token redakte.
- Manifest: `allowBackup="false"`; kullanılmayan izinler (`RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, eski depolama, `ACTIVITY_RECOGNITION` — `expo-sensors` adımsayarı ekler, `Pedometer` kullanılırsa geri alınmalı; kullanılmayan FGS türleri) `tools:node="remove"` ile engelli. Yeni kütüphane eklerken izin sızıntısını `aapt2 dump permissions <apk>` ile kontrol et. Ayrıntı: [android-native](docs/ajan/android-native.md).
- WebView eklenirse (bugün YOK; kıble kendi kodumuz): `geolocationEnabled` açıksa `onShouldStartLoadWithRequest` ile host beyaz listesi zorunlu, dış linkler `Linking.openURL`.
- CI: `ci.yml` üst seviye `contents: read`; yazma izni yalnız `auto-release` işinde.

## Reçete — Yeni özellik duyurusu ("Neler Yeni")
Tek yer `src/core/constants/YeniOzellikler.ts`; rozet, tanıtım kartı ve "Neler Yeni" sayfası kendiliğinden beslenir. README'nin "Son eklenenler" listesi de oradan üretilir.
- **Bir özellik = bir öğe.** Özellik henüz mağazaya (production) çıkmadıysa ya da sonradan değiştiyse **YENİ öğe ekleme**: mevcut öğenin metnini bugünkü hâle getir, `surum`/`tarih`'i son değişikliğin değeriyle güncelle. Görülme `<id>@<surum>` anahtarıyla tutulur (`core/utils/yeniOzellikGorulme.ts`) → yükseltilen `surum` duyuruyu yeniden "yeni" gösterir. Öğe birleştirirken en eski `id`'yi koru, diğerlerini `oncekiIdler`'e yaz; `id` asla değişmez.
- **`platformlar` ZORUNLU** (`['android']` / `['ios']` / ikisi). Bir madde yalnız bazı cihazlarda geçerliyse maddeyi çıkar ya da öğeyi `yetenek` ile süz (`presentation/hooks/yeniOzellikYetenegi.ts`; ölçülemiyorsa gösterme). `PlatformYetenekleri`'ne bağlı özellik (iOS'ta ses seçici/titreşim yok) iki platforma işaretlenmez.
- **Metin:** kibar "siz", özelliğin bugünkü hâli (tarihçe yok), teknik terim yok (kanal/TTS/API → "sesli okuma", "bildirim"), **işletim sistemi sürümü ve izin şartı yok** (nöbetçi: `yeniOzellikYetenegi.test.ts`).

## 🚧 Sınırlar
- **✅ Her zaman:** `npm run verify` geçir · kibar "siz" dili · var olan deseni izle · öğrendiğin kalıcı bilgiyi doğru belgeye yaz (aşağıda).
- **⚠️ Önce sor:** yeni bağımlılık · `android/`/`wear/`/`tv/`/`targets/` native değişikliği · `.github/workflows` · public API/şema/store şekli · release/sürüm mantığı.
- **🚫 Asla:** secret/token/anahtar/kişisel veri commit'leme · `node_modules`/build/`coverage` düzenleme · `verify` kırıkken teslim · arayüzde "sen" dili · sürüm numarasını elle değiştirme.

### Lisans sınırı (mağaza dağıtımı buna bağlı)
Proje **GPL-3.0 + LICENSE'taki GPLv3 §7 ek izni** (App Store/Google Play). Ek izni tek telif sahibi verebildiği için:
- **Başka projeden kod KOPYALAMA.** GPL-uyumsuz (AGPL dahil) kod girerse uygulama mağazada dağıtılamaz. Okumak serbest, satır kopyalamak değil (ör. `Hassan-PS/Mihrab` AGPL → kopyalama; `TheAbubakrAbu/Al-Adhan-Prayer-Times` MIT → atıfla kullanılabilir).
- Yeni bağımlılıkta lisansa bak: AGPL/SSPL/ticari kısıtlı ALMA; MIT/Apache-2.0/BSD/ISC güvenli, LGPL dikkatli.
- Katkı lisans maddesi `LICENSE`, `README.md`, `CONTRIBUTING.md`'de aynı olmalı (telif devri yok). AGPL'e geçme.

## Bilgi tabanını güncel tutma
- **README.md / docs/index.md'deki `<!-- OTOMATIK:BASLA ad -->…<!-- OTOMATIK:BITIR ad -->` bölgelerini ve `docs/ekran-goruntuleri/`'ni ELLE DÜZENLEME** — kaynağı değiştir (`package.json`, `app.json`, `YeniOzellikler.ts`, mağaza kayıtları); `belgeler.yml` her release ve ekran görüntüsü koşusundan sonra yeniler. Ayrıntı: [ci-ve-yayin](docs/ajan/ci-ve-yayin.md).
- Her iş alanına özgü kalıcı bilgi (tuzak, reçete, nöbetçi test, kararın nedeni) ilgili `docs/ajan/<konu>.md`'ye; yalnız her alanda geçerli kural bu dosyaya. Yeni alan belgesi açarsan konu dizinine ekle.
- Biçim: **kural önce**, gerekçe tek cümle (hikâye değil), varsa `Nöbetçi: <test>`. Mevcut maddeyi güncelle/sil, şişirme; spekülasyon yazma ("cihazda doğrulanmadı" diye işaretle); sır/kişisel veri yazma.

## Ajan ortamı (Jules vb.)
Setup: `npm ci` (Node 20; `postinstall: patch-package` atlanmamalı) · Doğrulama: `npm run verify` · PR hedefi `master` · `git push` kullanan ajanda `CI=true`. Ayrıntı: [ci-ve-yayin](docs/ajan/ci-ve-yayin.md).

## Konu dizini — dokunduğun alanın belgesini önce oku
| Belge | Ne zaman oku |
|---|---|
| [muhafiz-motoru](docs/ajan/muhafiz-motoru.md) | Namaz Muhafızı motoru, matris/adım/ton/yön, preset'ler, göçler, muhafız ayar ekranı, vakit sayacı bastırma |
| [muhafiz-ses-ve-kanal](docs/ajan/muhafiz-ses-ve-kanal.md) | Bildirim kanalı/ses/titreşim, ses seçici, sesli okuma (TTS) planlama, önizleme, kanal teşhisi, emülatör reçeteleri |
| [hatirlatma-yuzeyleri](docs/ajan/hatirlatma-yuzeyleri.md) | Ortak hatırlatma modülü (`components/hatirlatma`), cuma, camiye gitme, yatış/muhasebe, takvim çakışması, nafile, özel gün susturma, gün sonu, bildirim sınırı rehberi |
| [gercek-alarm](docs/ajan/gercek-alarm.md) | Gerçek alarm kanalı (Android tam ekran alarm, iOS AlarmKit), yarının imsağı |
| [kaza-seri-puan](docs/ajan/kaza-seri-puan.md) | Puanlama, seri/toparlanma, Kaza Defteri 2.0, depolama göçü, Seri sekmesi/SVG, seri sayacı |
| [kible](docs/ajan/kible.md) | Kıble ekranı: gecikme/takılma kök nedenleri, sensör vektör tabanı, eksen denetimi, 3B pusula, kamera görünümü ve izni |
| [konum-geofence](docs/ajan/konum-geofence.md) | Konum takibi (geofence), konum yenileme, konum yayma listesi, seferîlik kartı |
| [ana-ekran-ve-ayarlar](docs/ajan/ana-ekran-ve-ayarlar.md) | AnaSayfa pager/gün navigasyonu, kerahat, stepper, Ayarlar ve slice hidrasyonu, sade görünüm, katlanabilir/tablet, güncelleme sistemi, tanı akışı |
| [android-native](docs/ajan/android-native.md) | Widget, hızlı ayarlar, kısayollar, "Kıldım" kuyruğu ve güven listesi, otomasyon, AppFunctions, Samsung/pil, Live Update/Now Bar, erteleme YOK kararı |
| [arac-destegi](docs/ajan/arac-destegi.md) | Android Auto (Car App Library, POI: vakit + yakındaki camiler), Play "Android Auto" form faktörü riski, CarPlay kategori analizi, CarPlay'de widget/canlı etkinlik/Siri |
| [camideyim](docs/ajan/camideyim.md) | Camideyim, Namaz modu, cami verisi, güven puanı, harita; iPhone "Namazda sessiz" (Odak + Kısayollar rehberi) |
| [wear-tv](docs/ajan/wear-tv.md) | Wear OS saat uygulaması, Android TV panosu, cihaz ağı v2 (telefon → TV şifreli eşitleme, telefon ↔ tablet olay günlüğü, iki uçta onaylı QR eşleştirme, Cihazlarım; 7 haneli kodla konum), saat/TV dağıtımı |
| [ios](docs/ajan/ios.md) | iOS teslim katmanı, Siri/Odak, widget + canlı etkinlik, Apple Watch, App Store Connect ve TestFlight hattı |
| [magaza-ekran-goruntuleri](docs/ajan/magaza-ekran-goruntuleri.md) | Simülatör/emülatör ekran görüntüsü hatları (iOS, Android, Watch, Wear, TV) |
| [yedekleme-esitleme](docs/ajan/yedekleme-esitleme.md) | Yedekleme/içe aktarma, cihazlar arası eşitleme |
| [expo-sdk-ve-bagimliliklar](docs/ajan/expo-sdk-ve-bagimliliklar.md) | Expo SDK yükseltmesi, bağımlılık/audit, patch-package |
| [ci-ve-yayin](docs/ajan/ci-ve-yayin.md) | GitHub Actions, sürümleme, EAS, dependabot, ajan ortamı |
| [test-tuzaklari](docs/ajan/test-tuzaklari.md) | Jest tuzakları ayrıntısı (mock, zamanlayıcı, act, platform) |
