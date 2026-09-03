# Uygulama Planı: iOS portu — Namaz Muhafızı

> Tarih: 2026-09-03 · Sürüm: **v1 (onaya sunulan taslak)** · Durum: **KOD YAZILMADI, plan onay bekliyor** · Kapsam: iOS'ta derlenen, App Store'a gönderilebilen ve **muhafız motoru iOS'ta güvenilir çalışan** bir sürüm. Android **birebir korunur**.
>
> Ortam gerçeği: geliştirici **Windows'ta**, Mac/iPhone **yok**. Derleme EAS Build (bulut), yükleme EAS Submit (TestFlight/App Store). Cihaz gerektiren adımlar **§5'te ayrı listelenir ve olabildiğince geciktirilir**.

---

## 0. Bu plan neyi okudu, neye dayanıyor

- `AGENTS.md` (tamamı) · `src/core/muhafiz/*` (motorAdaptoru, matrisTipleri, kanalKumesi, kanalPlani, planButcesi, sesKimligi, sesDosyasi, anonsKimligi, anonsMetni) · `ArkaplanMuhafizServisi` · `NamazMuhafiziServisi` · `MuhafizKanalServisi` · `BildirimServisi` · `modules/expo-countdown-notification/src/index.ts` · `muhafizSlice` · `components/hatirlatma/*` · `MuhafizAyarlariSayfasi` · `App.tsx` · `app.json` · `eas.json` · `.github/workflows/*`.
- Görev tanımındaki **doğrulanmış iOS bulguları** (AlarmKit, 64 sınırı, ≤30 sn ses, Time Sensitive, arka planda kod yok) temel alındı, yeniden araştırılmadı.
- Bu turda ayrıca **npm kayıt defterinden** doğrulandı (2026-09-03): `react-native-nitro-ios-alarm-kit@1.0.41` **MIT** (peer: `react-native-nitro-modules`) · `expo-alarm-kit@0.1.11` **MIT** (peer: yalnız `expo`) · `expo-background-task` **MIT** · `expo-speech` **MIT**. Hiçbiri AGPL/SSPL değil. (npmjs.com sayfaları 403 verdi; README içerikleri okunamadı → API yüzeyleri **doğrulanacak**, §6.)
- `expo-background-fetch` **Expo tarafından kullanımdan kaldırıldı** (iOS Background Fetch API'si iOS 13'ten beri deprecated); yerine `expo-background-task` (BGTaskScheduler) — iOS'ta `BGTaskSchedulerPermittedIdentifiers` Info.plist anahtarı zorunlu ve dokümante edilmemiş (expo/expo#40440). Kaynaklar: [Expo SDK 53 changelog](https://expo.dev/changelog/sdk-53), [Goodbye background-fetch](https://expo.dev/blog/goodbye-background-fetch-hello-expo-background-task), [expo/expo#40440](https://github.com/expo/expo/issues/40440).

---

## 1. Karar özeti

### 1.1 Mimari: **"Aynı matris, platforma göre TESLİM"** (hibrit — önerilen mimari doğrulandı, iki noktada daraltıldı)

Motorun ne zaman / hangi adımın / hangi kanallarla konuşacağını söyleyen çekirdek (`muhafizMatrisiniCoz` → `aktifSeviyeyiBul` → `seviyeTetiklenirMi` → `vakitUyariPlaniOlustur` → `UyariPlani[]`) **platformdan bağımsız SAF kalır ve tek satırı değişmez.** Platform farkı yalnızca **teslim** katmanına girer: bir `UyariPlani`'nın cihazda *nasıl* duyulacağı.

| Hücre (matris) | Android (bugünkü, değişmez) | iOS 26+ (AlarmKit izni var) | iOS 26 altı / izin yok |
|---|---|---|---|
| `muhafizAcilKanalMi(...) === true` (bypassDnd kanalı) | `muhafiz_acil*` kanalı, MAX önem | **AlarmKit alarmı** (sessiz anahtarı + Focus'u deler) | Bildirim + `timeSensitive` |
| yalnız `bildirim` | Kanal sesi | Bildirim, `sound: bildirim.wav` (≤30 sn), `interruptionLevel` seviyeye göre | aynı |
| `sesli` (± bildirim) | Native TTS alarmı (`AnonsReceiver`) | Bildirim, **ses = ön-kayıtlı anons klibi** (≤30 sn, dakika sayısı yok) | aynı |
| `titresim` | Kanal titreşimi + ön plan `Vibration` | **Yok sayılır** (iOS'ta bildirim haptiği kontrol edilemez) — ekranda anahtar gizli | aynı |

**Neden bu eşleme doğru:** Android'de "acil kanal" tam olarak *DND'yi delen* kanaldır (`setBypassDnd(true)`); iOS'ta Focus'u ve sessiz anahtarı delen tek meşru araç AlarmKit'tir. Yani `acilKanal` bayrağının anlamı iki platformda **aynıdır**: "bu adım cihazın sessizliğini aşsın". Preset yazarının niyeti korunur: `yogun.acil` → alarm; `hafif`/`normal` → yalnız bildirim (Focus delinir, sessiz anahtar delinmez). Eski kayıt (`acilKanal: undefined`) `seviye >= 3` taban kuralıyla alarm alır — Android'deki tarihsel davranışın aynası.

**Önerilen mimariye göre iki daraltma:**
1. **"Sesli kanal → klip" iOS'ta bildirimden AYRI bir kanal değildir.** iOS'ta uygulama arka planda kod çalıştıramadığı için ses ancak bir *bildirimin* sesi olarak çalabilir. "Yalnız sesli" hücre iOS'ta yine bir bildirim gösterir (Android'in Faz 4 öncesi davranışıyla aynı: "yalnız SESLİ kanal bildirim gibi davranır ama TTS bayrağını taşır" — bu test zaten var). Kullanıcıya bu **söylenir** (`AdimNotlari`), gizlenmez.
2. **Time Sensitive her seviyeye değil.** Apple, Time Sensitive'in "gerçekten zamana duyarlı" bildirimlerle sınırlı kullanılmasını bekler; nazik hatırlatma (seviye 1) `active`, seviye 2–4 `timeSensitive` olur. Kural saf katmanda tek yerde durur; inceleme dönüşüne göre bir satırla değişir.

### 1.2 Dört soruya cevap

**(a) `muhafizMatrisiniCoz` / `seviyeTetiklenirMi` / `adimKapaliMi` saf kalabilir mi?** Evet, **dokunulmaz**. Dallanma iki yere girer ve ikisi de çekirdeğin *dışındadır*:
- **Saf iOS teslim katmanı** `src/core/muhafiz/ios/*` — `UyariPlani[]` alır, `IosTeslim[]` ("alarm" | "bildirim" + ses/seviye/klip) döner. `react-native` **import etmez**; platformu ve AlarmKit varlığını parametre (`PlatformYetenekleri`) olarak alır → jest'te platform mock'suz test edilir.
- **Domain teslimcisi** `MuhafizTeslimcisi` arayüzü — `ArkaplanMuhafizServisi` bugün `tekBildirimPlanla` + `anonsPlanla` + kanal hazırlığı + iptal zincirini kendisi yapıyor; bu dört iş bir arayüzün arkasına alınır. `AndroidMuhafizTeslimcisi` = **bugünkü kod birebir taşınır** (mantık değişikliği sıfır), `IosMuhafizTeslimcisi` yeni. Seçim tek yerde: `muhafizTeslimcisiSec()` (`Platform.OS`). Beş tüketicinin hepsi (`ArkaplanGorevServisi`, `KonumTakipServisi` dahil) `yapilandirVePlanla` boğazından geçtiği için teslimci **otomatik** kapsanır; AGENTS.md'nin "kanal hazırlığını başka yere taşıma" kuralı korunur.

**(b) 64 sınırı `vakitUyariPlaniOlustur` çıktısıyla nasıl uzlaşır?** Üretici seyreltilmez (AGENTS.md dersi: bütçe üreticiye konursa ön plan/önizleme ayrışır). Bunun yerine **teslim katmanında açık bir slot bütçesi** vardır (`ios/bildirimButcesi.ts`):
- Kullanılabilir slot = `64 − (muhafız DIŞI bekleyen bildirim sayısı, runtime'da getAllScheduledNotificationsAsync ile ölçülür) − IOS_GUVENLIK_PAYI(4)`. Bugün iOS'ta muhafız dışı tüketiciler: vakit bildirimleri ≤12 (2 gün × 6), cuma 4; sayaçlar (iftar/sahur/seri/vakit) Android'e özel → **~44–48 slot muhafıza kalır**.
- Yoğun preset **7/vakit × 5 = 35/gün** → bir tam gün sığar. iOS'ta güvenilir arka plan yenilemesi olmadığı için plan **2 gün** ileri üretilir (`IOS_PLAN_GUN_SAYISI = 2`; Android `1` kalır, davranış değişmez) ve **kronolojik sırayla** bütçeye sığdırılır — en yakın olanlar tutulur, taşanlar **loglanır** (sistem sessizce atsın diye bırakılmaz; kesilen sayı Tanı raporunda görünür). Her ön plana gelişte (`AppState active`, mevcut) yeniden planlanır → pencere kendini yeniler.
- **AlarmKit alarmları 64'e dahil değil** (doğrulanmış bulgu) → acil adım bütçeden çıkar; yoğun'un acil adımı (6 dk'da 3'er dk → 2 tetik/vakit) alarm olarak 2 gün ileri kurulur, bildirim bütçesini yemez.
- Nöbetçi: `varsayılan matris + normal preset + 2 gün` **hiç kesilmez**; yoğun + 2 gün kesilir ama ilk günün tamamı **kesintisiz** kalır.

**(c) `MuhafizKanalServisi`'nin iOS karşılığı ne?** **Yok — ve gerekmez.** Android'de kanal id'si (ses+titreşim) fonksiyonudur çünkü ses *kanal* özelliğidir ve sonradan değiştirilemez. iOS'ta ses **bildirim başına** verilir (`content.sound: 'dosya.wav'`) → değişmezlik/tombstone/GC sorunlarının hiçbiri yok. `MuhafizKanalServisi.hazirla` zaten `Platform.OS !== 'android'` iken matrisi aynen döndürüyor; **dokunulmaz**. iOS'ta "ses kimliği"nin karşılığı `ios/sesKlibi.ts`: `bildirimSesi`/`kanallar`/`yon` → paketlenmiş dosya adı. Kullanıcının `content://` sesi iOS'ta anlamsızdır (Android URI'si) → `cozulemeyenSesleriDusur` mantığının ikizi olarak **varsayılana düşer**, ekran iOS'ta ses seçim satırını hiç göstermez.

**(d) Ekran iOS'ta çalışmayan seçenekleri nasıl gizler?** `PencereTanimi` zaten "neyin düzenlenebileceğini" taşıyan tek parametre nesnesidir (cuma için `kanalSecimiVar:false`, `sesSecimiVar:false`). Aynı kapı genişletilir: `vakitPencereTanimi(vakit, yon, pencere, yetenekler: PlatformYetenekleri)` → iOS'ta `sesSecimiVar:false`, `anonsMetniDuzenlenebilir:false` (yeni), `titresimSecilebilir:false` (yeni). `AdimDetayModal`/`PencereKarti` yalnız tanımı okur → **`Platform.OS` bileşenlere sızmaz**, yeni ekran yazılmaz (AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA — yeni bir `PencereTanimi` üret"). Android'de `ANDROID_YETENEKLERI` sabiti verilir → çıktı bugünkünün **birebir aynısı** (nöbetçi test).

### 1.3 Reddedilen alternatifler

| Alternatif | Neden reddedildi |
|---|---|
| **Arka planda sessiz ses çalarak canlı kalmak** (`UIBackgroundModes: audio` + sessiz döngü) ve TTS'i canlı üretmek | App Store 2.5.4 ("background audio yalnız gerçekten ses çalan uygulamalar") **kumarı**; reddedilirse yeniden başvuru gecikir, kabul edilse bile pil şikâyeti ve Apple'ın sonraki denetiminde geri alınma riski. Kâr: dinamik dakika metni. Bedel: tüm sürümün riske girmesi. **Kesinlikle yapılmaz.** |
| **Critical Alerts** entitlement'ı | Yalnız sağlık/güvenlik/acil durum uygulamalarına veriliyor; namaz uygulamasına verilmez. Başvuru zaman kaybı. |
| **Yalnız AlarmKit** (her adım alarm) | Alarm = tam ekran/kilit ekranı uyarısı + ses; nazik hatırlatmayı alarma çevirmek kullanıcıyı boğar ve `hafif` preset'in var oluş sebebini (sessizlik) yok eder. Ayrıca iOS 26 altı %15'e hiçbir şey vermez. |
| **`expo-speech` ile ön planda canlı TTS** (arka planda klip) | Aynı adım uygulama açıkken "canlı, dakikalı" kapalıyken "klip, dakikasız" konuşur — bu projenin en pahalı dersi ön/arka plan **ayrışmasıdır**. Ek bağımlılık da getirir. Klip iki yerde de aynı → tek ses, tek metin. |
| **Uzak push (APNs) ile sunucudan zamanlama** | Sunucu yok, sunucu istenmiyor; konum verisi sunucuya gitmesi gerekirdi (Data Safety). |
| **`ArkaplanMuhafizServisi`'ni iOS için kopyalamak** (`IosArkaplanMuhafizServisi`) | Vakit hesabı, kılınmışlık, tarih seçimi, iptal zinciri iki yerde yaşardı; AGENTS.md'nin "beş tüketici / tek boğaz" kuralına aykırı. Teslimci arayüzü yalnız farkı ayırır. |
| **`ios/` dizinini git'e almak** | Windows'ta Pod kurulumu yok; dizin elle bakılamaz. EAS, `ios/` yoksa iOS için prebuild çalıştırır (Android'de `android/` git'te kalmaya devam eder — hibrit; ilk build'de **doğrulanacak**, §6). |
| **Mihrab'ın kodunu almak** | **AGPL-3.0** — GPL-3.0 + App Store ek izinli projeye giremez. *Yalnız referans olarak okunur, tek satır kopyalanmaz.* MIT olan `TheAbubakrAbu/Al-Adhan-Prayer-Times` kod referansı olarak serbest. |

---

## 2. Fazlar (3 faz; 2 ve 3 birbirinden bağımsız, ikisi de 1'e dayanır)

```
Faz 1 ── iOS derlenir, muhafız bildirimle çalışır, TestFlight'a çıkar   (cihaz GEREKMEZ)
  ├── Faz 2 ── sesli kanal = ön-kayıtlı klipler                          (cihaz GEREKMEZ; dinleme isteğe bağlı)
  └── Faz 3 ── acil adım = AlarmKit                                       (iOS 26 cihaz ŞART, en sona)
```

Her faz kendi başına `npm run verify` yeşil + Android nöbetçileri yeşil + kendi doğrulama adımıyla **teslim edilebilir**. Faz 2 takılırsa 3 ilerler (ve tersi).

### Faz 1 — Temel: iOS derlemesi + bildirim teslimi + ekran + yayın hattı

**Amaç:** iOS'ta uygulama açılır, çökmez, muhafız her açık adım için `timeSensitive`/`active` bildirim + ≤30 sn ses kurar, 64 bütçesine uyar, ekran iOS'ta çalışmayan seçenekleri gizler, EAS ile TestFlight'a yüklenir.

**Ne değişir:**
1. **Çökme tarama (iOS'ta import anında patlayanlar):**
   - `modules/expo-countdown-notification/src/index.ts:31` — `requireNativeModule('ExpoCountdownNotification')` **modül yüklenirken** çalışır; `expo-module.config.json` `platforms: ["android"]` olduğu için iOS'ta native modül yoktur → **uygulama açılışta çöker**. `requireOptionalNativeModule` + `null` iken her fonksiyon no-op (mevcut `Platform.OS !== 'android'` kapıları zaten var; iki savunma birlikte). Nöbetçi test: modül `null` iken tüm dışa aktarılan fonksiyonlar fırlatmaz.
   - `GuncellemeServisi` GitHub kaynağı: iOS'ta APK indirme linki sunmak App Store reddi. iOS'ta güncelleme kontrolü **kapalı** (`PlayStoreGuncellemeKaynagi.kullanilabilirMi` zaten Android'e bağlı; GitHub kaynağı da iOS'ta `null` döner).
   - `NativeModules.WidgetVeri`, `PlayStoreGuncelleme`, notifee ön plan dinleyicisi: zaten `Platform.OS` kapılı — **dokunulmaz**, yalnız listede doğrulanır.
2. **Saf iOS teslim katmanı** `src/core/muhafiz/ios/` (yeni; `react-native` import YOK):
   - `platformYetenekleri.ts` — `PlatformYetenekleri { platform; alarmKit; sesSecici; serbestAnonsMetni; titresimSecimi }`, `ANDROID_YETENEKLERI` (hepsi açık), `iosYetenekleri(alarmKitVar)`.
   - `teslimPlani.ts` — `IosTeslim = { tur: 'alarm'|'bildirim'; id; zaman; baslik; govde; ses: string; kesintiSeviyesi: 'active'|'timeSensitive'; vakit; tarih; seviye }`, `iosTeslimPlaniOlustur(uyarilar, ctx)`; §1.1 tablosu burada tek yerde yazılır. Faz 1'de `alarmKit:false` → her şey `bildirim`.
   - `bildirimButcesi.ts` — `IOS_BEKLEYEN_TAVANI = 64`, `IOS_GUVENLIK_PAYI = 4`, `IOS_PLAN_GUN_SAYISI = 2`, `butceyeSigdir(teslimler, kullanilabilirSlot) → { tutulan, kesilen }` (kronolojik; `alarm` türü sayılmaz).
   - `sesKlibi.ts` — `IOS_BILDIRIM_SESI = 'bildirim.wav'`; Faz 1'de `sesli` hücre de bu sesi alır (Faz 2 klibi bağlar). `content://` → varsayılan.
3. **Domain teslimcisi:**
   - `src/domain/services/MuhafizTeslimcisi.ts` (yeni) — arayüz `{ hazirla(matris): Promise<MuhafizMatrisi>; temizle(): Promise<void>; vaktiPlanla(vakit: VakitZamani, plan: UyariPlani[], yon): Promise<number>; vaktiIptalEt(vakit, tarihler: string[]): Promise<void> }` + `muhafizTeslimcisiSec()`.
   - `AndroidMuhafizTeslimcisi.ts` (yeni) — `ArkaplanMuhafizServisi`'nin `tekBildirimPlanla`, `anonsPlanla`, `bildirimMesajiOlustur`, kanal hazırlığı, `iptalEtTumAnonslar`/`iptalEtAnons` çağrıları **kesip-yapıştır** taşınır. Mantık değişmez.
   - `IosMuhafizTeslimcisi.ts` (yeni) — `vakitUyariPlaniOlustur` çıktısını `iosTeslimPlaniOlustur` → `butceyeSigdir` → `Notifications.scheduleNotificationAsync({ content: { title, body, sound, interruptionLevel, categoryIdentifier: MUHAFIZ (Kıldım aksiyonu iOS'ta da çalışır), data }, trigger: DATE })`. Kesilen sayıyı `Logger.warn` ile yazar.
   - `ArkaplanMuhafizServisi.ts` — `bugunVakitleriniHesapla(gunSayisi)` (Android'de `1`, iOS'ta `IOS_PLAN_GUN_SAYISI`; yarının vakitleri için `kilinan` boş kabul), teslim çağrıları teslimciye. `VakitZamani` arayüzü teslimciye taşınır (export).
   - `NamazMuhafiziServisi.ts` — iOS'ta `onPlanAnonsuPlanla` erken döner (ses bildirimden gelir; aşağıdaki "ön plan çift ses" kuralı). `titresimVer` iOS'ta `Vibration.vibrate()` desen yok sayılır — zararsız, dokunulmaz.
   - `BildirimServisi.izinIste` — iOS'ta `requestPermissionsAsync({ ios: { allowAlert, allowSound, allowBadge:false } })`; kanal bloğu zaten Android kapılı.
   - **Ön plan çift ses kuralı (iOS):** iOS'ta zamanlanmış bildirim uygulama **açıkken de** teslim edilir ve handler (`shouldPlaySound:true`) sesi çalar. Ön plan banner'ı ayrıca klip/ses çalarsa **çift** olur. Kural: iOS'ta banner çizilir, in-app ses **çalınmaz** (`AnaSayfa` bildirimSesi callback'i iOS'ta sessiz). Bedel: arka plan hiç planlayamadıysa (kullanıcı muhafızı açık ekranda yeni açtı ve o dakika geldi) ilk uyarı sessiz kalır — kabul, çünkü `yapilandirVePlanla` ekrandan çıkışta hemen çalışır.
4. **Ekran:**
   - `pencereTanimi.ts` — `PencereTanimi`'ne `anonsMetniDuzenlenebilir: boolean`, `titresimSecilebilir: boolean`; `vakitPencereTanimi(..., yetenekler = ANDROID_YETENEKLERI)`; `cumaPencereTanimi` etkilenmez.
   - `usePlatformYetenekleri.ts` (yeni hook) — `Platform.OS` + (Faz 3) AlarmKit köprüsünden yetenek nesnesi üretir; ekranlar `Platform.OS`'a kendisi bakmaz.
   - `AdimDetayModal.tsx` — `tanim.sesSecimiVar` (zaten var), `tanim.titresimSecilebilir`, `tanim.anonsMetniDuzenlenebilir` kapıları; iOS'ta anons bölümü "Hazır anons: *Yatsı vakti çıkıyor, namazını kaçırma.*" satırı + Dinle. `TurkceTtsUyarisi` yalnız Android (`useTurkceTtsDestegi` iOS'ta `null` döndürmeli — bugün `trDestekleniyorMu` iOS'ta `false` döndüğü için **yanlış uyarı** çıkardı).
   - `AdimNotlari.tsx` — iOS notları: "Sesli anons iPhone'da kısa bir ses klibi olarak gelir" · (Faz 3) "Bu adım alarm olarak çalar / iOS 26 altında bildirim olarak gelir" · "Titreşim iPhone'da sistem ayarına bağlıdır".
   - `SesliOnayModal.tsx` — **iOS'ta gösterilmez**: iOS'ta sesli kanal sessiz anahtarı/Focus'u delmez, rıza gerektiren bir şey yok. `presetUygula(..., sesliIzinVar = true)` geçilir, `sesliOnayi` **yazılmaz** (rıza kaydı uydurulamaz; alan Android'e özgü kalır). Faz 3'te AlarmKit'in kendi sistem izni rıza yerine geçer.
   - `KurulumSihirbaziSayfasi` — "sessiz mod/DND'de duyulur" kopyası iOS'ta klip semantiğine göre (`platformMetinleri.ts`, kibar "siz").
   - `MuhafizAyarlariSayfasi.tsx` — yetenekleri hook'tan alıp tanımlara geçirir; başka değişiklik yok.
5. **Varlıklar:** `assets/sounds/bildirim.wav` (mevcut `bildirim.mp3`'ten **ffmpeg ile Windows'ta** üretilir, ≤30 sn, 16-bit PCM 22.05 kHz mono; mp3 iOS'ta resmî değil). `app.json > expo-notifications.sounds` listesine eklenir; Android `res/raw/bildirim.mp3` **değişmez**.
6. **Yapılandırma / yayın:**
   - `app.json > ios`: `infoPlist` (`UIBackgroundModes: ['fetch']` — expo-background-fetch iOS'ta opportunistik, güvenlik ağı; `NSAlarmKitUsageDescription` Faz 3), `entitlements: { 'com.apple.developer.usernotifications.time-sensitive': true }`, `buildNumber` (CI yönetir), `supportsTablet` korunur. `expo-location` plugin'ine `isIosBackgroundLocationEnabled: true` (geofence "Always" ister).
   - `eas.json`: `build.production.ios` (`distribution: store`, credentials EAS-managed), `build.preview.ios.simulator: true` (Appetize için, §5), `submit.production.ios` (`ascAppId`, `appleTeamId`; App Store Connect **API key** — parola/2FA CI'da olmaz).
   - `.gitignore`: `ios/` (CNG hibrit).
   - `.github/workflows/expo-build.yml`: `build_ios` + `testflight_a_gonder` girdileri; AAB'deki `continue-on-error + eas build:list ile durum sor` deseni **aynen** iOS için. Release zincirine **eklenmez** (önce manuel dispatch; master'a her merge iOS build'i harcamasın).
   - Tek seferlik manuel kurulum (Windows'tan `eas credentials -p ios`): dağıtım sertifikası + provisioning EAS yönetir; App Store Connect'te uygulama kaydı + API anahtarı → GitHub Secrets.
7. **AGENTS.md** (aynı commit): "iOS" bölümü — teslimci deseni, 64 bütçesi, `requireOptionalNativeModule` tuzağı, "ses bildirim başına, kanal servisi iOS'ta yok", ön plan çift ses kuralı, `sesliOnayi` iOS'ta yazılmaz.

**Dosyalar:** §3 tablosu, "F1" satırları.

**Nasıl doğrulanır (cihazsız):**
- `npm run verify` yeşil; yeni testler: `ios/*.test.ts` (saf), `MuhafizTeslimcisi.test.ts`, `IosMuhafizTeslimcisi.test.ts` (Platform mock `ios`), `AndroidMuhafizTeslimcisi` = mevcut `ArkaplanMuhafizServisi.test.ts` **değişmeden** geçer + kayıt-oynat nöbetçisi (§4).
- `gh workflow run expo-build.yml -f build_ios=true` → EAS iOS **production build yeşil** (Xcode derlemesi + pods). İlk build'de prebuild'in `ios/` üretip ürettiği doğrulanır.
- `preview` profiliyle simulator `.app` → **Appetize.io** (tarayıcıda iOS simülatörü; ücretsiz katman) ile ekran akışı + yerel bildirimin geldiği + sesin çaldığı gözlenir (§5).
- Debug **APK** build (`android-build.yml … build_type=debug`) yeşil → Android araç zinciri bozulmadı (AGENTS.md: verify build'i göstermez).
- TestFlight'a yükleme (`eas submit`) yeşil.

### Faz 2 — Sesli kanal: ön-kayıtlı anons klipleri

**Amaç:** iOS'ta `sesli` hücre, Android TTS anonsunun **dakikasız** ikizi olan ≤30 sn'lik klibi bildirim sesi olarak çalar; ön plan/önizleme aynı klibi kullanır.

**Ne değişir:**
- **Klip seti:** `assets/sounds/anons/<vakit>_<yon>.wav` — 5 vakit × 2 yön = **10 klip** (≈3 sn, mono, ~100 KB → ~1 MB). Metinler `ANONS_SABLONLARI[0]`/`ANONS_SABLONLARI_GIRIS[0]`'ın **dakikasız** hali ("Yatsı vakti çıkıyor, namazını kaçırma." / "Yatsı vakti girdi, namazı geciktirme."). Metin havuzu genişlerse klip seti de büyür — `sesKlibi.ts` içindeki harita + nöbetçi test ("her (vakit, yön) için klip dosyası var").
- **Üretim kaynağı (kullanıcı kararı, §6):** (a) bulut nöral TTS tr-TR (Azure/Google — çıktı kullanım şartları **doğrulanacak**), (b) insan sesi kaydı, (c) Android cihazda sistem TTS `synthesizeToFile`. Tek fatura/lisans ölçütü: klipler uygulamayla dağıtılacak → çıktının ticari/dağıtım hakkı olmalı.
- `ios/sesKlibi.ts` — `anonsKlibiSec(vakit, yon)` bağlanır; `teslimPlani` sesli hücrede `ses = klip`.
- `app.json > expo-notifications.sounds` listesine 10 klip.
- **Ön plan / önizleme paritesi:** `OnizlemeSesServisi` iOS'ta klibi `expo-audio` ile çalar (metro varlığı, `sesDosyasiniCoz` deseni); `AnonsOnizlemeServisi.adimiOnizle` iOS'ta TTS yerine klip; `AkisOnizlemeModal` "Dinle" aynı yol. `AdimDetayModal` hazır anons satırı klibi çalar.
- **Anons metni alanı iOS'ta salt okunur** (Faz 1'de gizlendi) → matris `anonsMetni` iOS'ta **yazılmaz ama korunur** (yedek Android'e taşınınca kullanıcının metni kaybolmaz).
- AGENTS.md: klip seti kuralı ("havuza şablon eklerken klip de ekle", `{süre}` iOS'ta düşer).

**Nasıl doğrulanır:** `sesKlibi.test.ts` (harita ↔ dosya varlığı, `fs` ile; `moduleNameMapper` wav'ı sayı döndürür — mevcut mock deseni), `IosMuhafizTeslimcisi.test.ts` (sesli hücre → `sound: 'yatsi_cikis.wav'`, bildirim hücre → `bildirim.wav`), önizleme testleri (`AnonsOnizlemeServisi.test.ts` iOS dalı: `planlaAnons` çağrılmaz, çalar `expo-audio`). Appetize'de klibin bildirimle çaldığı işitilir (isteğe bağlı; sistem sesi simülatörde çalışır). Cihaz **gerekmez**.

### Faz 3 — Acil adım: AlarmKit (iOS 26+)

**Amaç:** `muhafizAcilKanalMi(...) === true` hücreler iOS 26+'da AlarmKit alarmı olarak kurulur (sessiz anahtar + Focus delinir; 64 sınırı dışında); izin yok / iOS 26 altı → Faz 1'in `timeSensitive` bildirimi (**sessiz sapma yok**, ekran söyler).

**Ne değişir:**
- **Köprü seçimi (spike ile, §6):** İlk aday `expo-alarm-kit` (MIT, yalnız `expo` peer'ı; bizim `modules/*` deseniyle aynı Expo Modules API). Gerekli yüzey: `izinIste() → 'verildi'|'reddedildi'`, `kullanilabilirMi()` (iOS 26 + izin), `planla(uuid, tarih, baslik, ses?)`, `iptalEt(uuid)`, `planlilariListele() → uuid[]` (öneke göre iptal için), alarmı durdurunca uygulamanın açılmaması. README okunamadı (403) → yüzey yetmiyorsa **fork → `modules/expo-muhafiz-alarm/`** (MIT → GPL-3.0 uyumlu, lisans metni + atıf korunur). `react-native-nitro-ios-alarm-kit` yedek aday: MIT ama `react-native-nitro-modules` + codegen getirir (yeni araç zinciri, Windows'ta doğrulanamaz) → ikinci sırada.
- `ios/alarmKimligi.ts` (saf) — AlarmKit id'si UUID ister; `muhafizBildirimIdOlustur` çıktısından **deterministik UUID** türetilir (id paritesi korunur: aynı bildirim id → aynı alarm id → iptal/yeniden kurma çakışmaz). Nöbetçi: deterministik + bir günün tüm id'leri çakışmaz.
- `ios/teslimPlani.ts` — `alarmKit:true` iken acil hücre → `tur:'alarm'`; alarm başlığı = bildirim başlığı (`basligiOlustur`), durdur düğmesi "Tamam". Alarm sesi: Faz 2 klibi varsa o, yoksa AlarmKit varsayılanı (`Library/Sounds` desteği **doğrulanacak**; sağlanmazsa yalnız paket sesi).
- `IosMuhafizTeslimcisi` — `hazirla()` içinde izin durumunu okur (**istemez**; izin ekrandan istenir), `vaktiPlanla` alarmları köprüye, `temizle()`/`vaktiIptalEt()` alarmları öneke göre iptal eder. Alarm sayısı loglanır.
- `app.json > ios.infoPlist.NSAlarmKitUsageDescription` (kibar "siz": "Vakit çıkmak üzereyken sessiz modda da duyabilmeniz için alarm kurulur."). Entitlement gerekip gerekmediği **doğrulanacak** — kaynaklar çelişiyor; ilk EAS build ve ilk cihaz denemesi cevabı verir.
- **İzin akışı / rıza:** Preset'te acil adım varken veya kullanıcı bir hücrede `acilKanal` açarken **önce** `AlarmOnayModal` (Android `SesliOnayModal` kalitesinde; "Alarm gibi çalar: telefonunuz sessizde veya Odak modundayken de duyulur") → onaylanınca sistem izni. Reddedilirse hücre **kaybolmaz**, bildirim olarak kalır; `AdimNotlari` "Alarm izni verilmedi — Ayarlar > Namaz Akışı'ndan açabilirsiniz". Kayıt: `muhafizSlice.alarmOnayi?: boolean` (yalnız modal görüldüyse yazılır; `sesliOnayi` ile aynı "uydurulamaz" kuralı; yükleme thunk'ında açıkça taşınır — AGENTS.md kalıcılık tuzağı).
- **Ön plan:** AlarmKit alarmı uygulama açıkken de sistem arayüzüyle çalar → in-app banner çizilir, ses zaten alarmdan (Faz 1 kuralıyla tutarlı).
- `usePlatformYetenekleri` → `alarmKit` köprüden; `AkisOnizlemeModal` alarm adımını rozetle gösterir ("Alarm").
- AGENTS.md: acilKanal ⇔ AlarmKit eşlemesi, UUID paritesi, izin/rıza kuralı, entitlement bulgusu.

**Nasıl doğrulanır:** `teslimPlani.test.ts` (alarm/bildirim karar tablosu, iOS 26 altı düşüşü), `alarmKimligi.test.ts`, `IosMuhafizTeslimcisi.test.ts` (köprü mock: planla/iptal id'leri, izin yokken bildirime düşüş), `muhafizSlice.test.ts` (`alarmOnayi` taşınır). **Cihaz ŞART** (§5): iOS 26 iPhone'da sessiz anahtar kapalı + Odak açıkken alarm çalar mı; aynı dakikaya alarm + bildirim çifti yok mu; "Kıldım" sonrası alarm iptal; günde ~10–35 alarmın sistemce kabulü.

---

## 3. Dosya bazlı değişiklik listesi

| Faz | Dosya | Durum | Değişiklik |
|---|---|---|---|
| F1 | `modules/expo-countdown-notification/src/index.ts` | değişir | `requireNativeModule` → `requireOptionalNativeModule`; `null` iken no-op (iOS açılış çökmesi) |
| F1 | `src/core/muhafiz/ios/platformYetenekleri.ts` | **yeni** | `PlatformYetenekleri`, `ANDROID_YETENEKLERI`, `iosYetenekleri()` |
| F1 | `src/core/muhafiz/ios/teslimPlani.ts` | **yeni** | `IosTeslim`, `iosTeslimPlaniOlustur`, kesinti seviyesi kuralı |
| F1 | `src/core/muhafiz/ios/bildirimButcesi.ts` | **yeni** | 64 bütçesi, 2-gün penceresi, kronolojik kesme |
| F1 | `src/core/muhafiz/ios/sesKlibi.ts` | **yeni** | `IOS_BILDIRIM_SESI`; F2'de klip haritası |
| F1 | `src/domain/services/MuhafizTeslimcisi.ts` | **yeni** | arayüz + `muhafizTeslimcisiSec()` + `VakitZamani` |
| F1 | `src/domain/services/AndroidMuhafizTeslimcisi.ts` | **yeni** | bugünkü teslim kodu birebir taşınır |
| F1 | `src/domain/services/IosMuhafizTeslimcisi.ts` | **yeni** | expo-notifications ile iOS teslimi + bütçe |
| F1 | `src/domain/services/ArkaplanMuhafizServisi.ts` | değişir | teslim → teslimci; `bugunVakitleriniHesapla(gunSayisi)` |
| F1 | `src/domain/services/NamazMuhafiziServisi.ts` | değişir | iOS'ta `onPlanAnonsuPlanla` erken döner |
| F1 | `src/domain/services/BildirimServisi.ts` | değişir | iOS izin seçenekleri |
| F1 | `src/domain/services/GuncellemeServisi.ts` (+ `GitHubGuncellemeKaynagi`) | değişir | iOS'ta GitHub kaynağı kapalı |
| F1 | `src/presentation/hooks/usePlatformYetenekleri.ts` | **yeni** | yetenek nesnesi |
| F1 | `src/presentation/hooks/useTurkceTtsDestegi.ts` | değişir | iOS'ta `null` (yanlış uyarı düzeltmesi) |
| F1 | `src/presentation/components/hatirlatma/pencereTanimi.ts` | değişir | `anonsMetniDuzenlenebilir`, `titresimSecilebilir`, `yetenekler` parametresi |
| F1 | `src/presentation/components/hatirlatma/AdimDetayModal.tsx` | değişir | üç yeni kapı; hazır anons satırı |
| F1 | `src/presentation/components/hatirlatma/AdimNotlari.tsx` | değişir | iOS notları |
| F1 | `src/presentation/screens/MuhafizAyarlari/SesliOnayModal.tsx` + `MuhafizAyarlariSayfasi.tsx` | değişir | iOS'ta modal atlanır, `sesliIzinVar=true`, `sesliOnayi` yazılmaz |
| F1 | `src/presentation/screens/MuhafizAyarlari/platformMetinleri.ts` | **yeni** | platforma göre kopyalar (sihirbaz + notlar) |
| F1 | `src/presentation/screens/AnaSayfa.tsx` | değişir | iOS'ta banner sesi çalınmaz |
| F1 | `assets/sounds/bildirim.wav` | **yeni** | mp3'ten ffmpeg ile, ≤30 sn |
| F1 | `app.json` | değişir | `ios.infoPlist`, `ios.entitlements`, `sounds` listesi, `expo-location` iOS bayrağı |
| F1 | `eas.json` | değişir | `production.ios`, `preview.ios.simulator`, `submit.production.ios` |
| F1 | `.gitignore` | değişir | `ios/` |
| F1 | `.github/workflows/expo-build.yml` | değişir | `build_ios` / `testflight_a_gonder` (önce sor — CI kuralı) |
| F1 | `AGENTS.md` | değişir | iOS bölümü |
| F1 | testler: `src/core/muhafiz/ios/__tests__/*.test.ts`, `src/domain/services/__tests__/{MuhafizTeslimcisi,IosMuhafizTeslimcisi,AndroidMuhafizTeslimcisi}.test.ts`, `pencereTanimi.test.ts`, `expo-countdown-notification/src/__tests__/index.test.ts` | **yeni/değişir** | §4 |
| F2 | `assets/sounds/anons/*.wav` (10) | **yeni** | klipler |
| F2 | `src/core/muhafiz/ios/sesKlibi.ts` | değişir | `anonsKlibiSec(vakit, yon)` |
| F2 | `src/domain/services/{OnizlemeSesServisi,AnonsOnizlemeServisi}.ts` | değişir | iOS'ta klip çalma |
| F2 | `src/presentation/components/hatirlatma/{AdimDetayModal,AkisOnizlemeModal}.tsx` | değişir | Dinle → klip |
| F2 | `app.json` | değişir | `sounds` + 10 klip |
| F3 | `modules/expo-muhafiz-alarm/` **veya** `package.json` (`expo-alarm-kit`) | **yeni** | AlarmKit köprüsü (yeni bağımlılık → önce sor) |
| F3 | `src/core/muhafiz/ios/alarmKimligi.ts` | **yeni** | deterministik UUID |
| F3 | `src/core/muhafiz/ios/teslimPlani.ts` | değişir | `tur:'alarm'` dalı |
| F3 | `src/domain/services/IosMuhafizTeslimcisi.ts` | değişir | alarm planla/iptal |
| F3 | `src/presentation/store/muhafizSlice.ts` | değişir | `alarmOnayi?` (yükleme thunk'ında taşınır) |
| F3 | `src/presentation/screens/MuhafizAyarlari/AlarmOnayModal.tsx` | **yeni** | rıza modalı |
| F3 | `app.json` | değişir | `NSAlarmKitUsageDescription` (+ entitlement, doğrulanırsa) |

**Dokunulmayanlar (bilinçli):** `motorAdaptoru.ts`, `kanalKumesi.ts`, `aktifSeviye.ts`, `planButcesi.ts`, `kanalPlani.ts`, `sesKimligi.ts`, `muhafizGoc.ts`, `matrisIslemleri.ts`, `MuhafizKanalServisi.ts`, `VakitSayacBildirimServisi.ts` ve diğer sayaçlar, `KonumTakipServisi.ts`, `ArkaplanGorevServisi.ts`, `android/**`, `modules/expo-countdown-notification/android/**`.

---

## 4. Android regresyon güvencesi (nöbetçi testler)

| # | Nöbetçi | Ne kanıtlar |
|---|---|---|
| N1 | **Kayıt-oynat (snapshot):** `ArkaplanMuhafizServisi.test.ts`'e refactor **öncesi** master'da kaydedilen sabit fikstür (yoğun preset, özel ses + titreşimli hücre, sesli hücre, dünün yatsısı senaryosu; tarih `bugunuAl()`/`dunuAl()` ile) için `scheduleNotificationAsync` + `planlaAnons` + `muhafizKanaliniGarantile` **çağrı argümanları JSON'u**; refactor sonrası birebir eşitlik. | Teslimci taşıması Android planını bir bayt değiştirmedi. |
| N2 | Mevcut `ArkaplanMuhafizServisi.test.ts` (Faz 3 matris, Faz 4 anons, ses/kanal seçimi, gece yarısı, kıldım/kılmadım suite'leri) **değiştirilmeden** geçer. | Davranış sözleşmesi korundu. |
| N3 | `MuhafizTeslimcisi.test.ts`: `Platform.OS='android'` → `AndroidMuhafizTeslimcisi`; iOS → `IosMuhafizTeslimcisi`. | Seçim tek kapıda. |
| N4 | `AndroidMuhafizTeslimcisi` **`bildirimButcesi`/`teslimPlani` import etmez** (jest'te modül kaynağına `grep` — `ios/` altındaki hiçbir dosya `react-native` import etmez testiyle aynı dosyada). | Bütçe/kesme Android'e sızmaz; çekirdek saf. |
| N5 | `pencereTanimi.test.ts`: `vakitPencereTanimi(v, yon, p)` (yetenek verilmeden) === `vakitPencereTanimi(v, yon, p, ANDROID_YETENEKLERI)` === bugünkü nesne (tam eşitlik). | Ekran Android'de değişmedi. |
| N6 | `MuhafizAyarlariSayfasi.test.tsx` mevcut haliyle geçer (hook varsayılanı Android). | Sayfa render'ı aynı. |
| N7 | `NamazMuhafiziServisi.test.ts` "ARKA PLANLA PARİTE" + "B3 çift konuşma" **değişmeden** geçer; ek: `Platform.OS='ios'` → `planlaAnons` **hiç** çağrılmaz. | Ön plan Android'de aynı; iOS'ta çift ses yok. |
| N8 | `expo-countdown-notification/src/__tests__`: native modül `null` iken 12 fonksiyonun tamamı fırlatmaz, `trDestekleniyorMu → false`, `sesSec → null`. | iOS açılış çökmesi kalıcı olarak kapalı. |
| N9 | `bildirimButcesi.test.ts`: varsayılan matris + 2 gün → kesilen 0; yoğun + 2 gün → ilk gün tam, kesilen > 0 ve kronolojik; `tur:'alarm'` sayılmaz. | Bütçe kuralı. |
| N10 | `motorAdaptoru.test.ts`, `kanalPlani.test.ts`, `sesKimligi.test.ts` **dokunulmaz** (dosya diff'i boş). | Çekirdek değişmedi. |
| N11 | Debug **APK build** (`android-build.yml`, `build_type=debug`) her fazın PR'ında yeşil; Faz 3'te yeni bağımlılık için **zorunlu** (AGENTS.md: verify build'i göstermez). | Araç zinciri. |
| N12 | Faz 3: `muhafizSlice.test.ts` — `alarmOnayi` yükleme thunk'ında taşınır; Android'de `undefined` kalır ve `presetAyarlariniOlustur` çıktısı değişmez. | Slice şekli Android'de aynı. |

Lint uyarı bütçesi aşılmaz; dokunulan dosyaya yeni uyarı eklenmez.

---

## 5. Cihaz gerektiren doğrulama noktaları

| Faz | Adım | Cihaz erişimi | Cihazsız alternatif |
|---|---|---|---|
| F1 | iOS derlemesi + TestFlight yükleme | **Yok** | EAS Build/Submit (bulut) |
| F1 | Ekran akışı, iOS'ta gizlenen seçenekler, yerel bildirim + ses + Time Sensitive rozeti | **Yok** (istenirse TestFlight test kullanıcısı) | `preview` simulator build → **Appetize.io** (tarayıcıda iOS simülatörü; yerel bildirimler simülatörde çalışır). iOS 26 imajı var mı → **doğrulanacak** |
| F1 | 64 bütçesi gerçek cihazda (sistemin kestiği yok mu) | İsteğe bağlı iPhone | `getAllScheduledNotificationsAsync` sayısı loglanır, Tanı raporuna girer; TestFlight kullanıcısı rapor gönderir |
| F1 | Geofence + arka plan yenilemesi iOS'ta | İsteğe bağlı iPhone (gerçek hareket) | Kapsam: konum değişince yeniden planlama zaten `konumDegistiUygula` ile; ilk sürümde ön plana geliş yenilemesi ana yol |
| F2 | Kliplerin bildirimle çalması, ses seviyesi | **Yok** | Appetize'de işitilir; klip kalitesi Windows'ta dinlenir |
| F3 | AlarmKit: izin diyaloğu, sessiz anahtar + Odak delme, alarm arayüzü, "Kıldım" sonrası iptal, ~10–35 alarm/gün kabulü, 64 dışı olduğu | **iOS 26 fiziksel iPhone ŞART** (ikinci el iPhone / TestFlight test kullanıcısı / bulut cihaz farmı — AWS Device Farm, BrowserStack) | Simülatörde AlarmKit'in çalışıp çalışmadığı **doğrulanacak**; çalışıyorsa Appetize kısmi kapsar (sessiz anahtar simüle edilemez) |
| F3 | Entitlement gerekli mi | Build + cihaz | EAS build hatası / alarm kurulamaması cevabı verir |

**Sıra ilkesi:** cihaz ihtiyacı yalnız Faz 3'te zorunludur ve Faz 3 en sondadır → Faz 1+2 cihazsız yayınlanabilir (`hafif`/`normal` kullanıcıları tam, `yoğun` kullanıcıları acil adımı Time Sensitive bildirimle alır).

---

## 6. Açık sorular / doğrulanacaklar

| # | Soru | Nasıl kapanır | Etki |
|---|---|---|---|
| S1 | AlarmKit için **entitlement** gerekiyor mu, yoksa yalnız `NSAlarmKitUsageDescription` mı? (Kaynaklar çelişiyor.) | Faz 3 ilk EAS build + cihazda `requestAuthorization` sonucu | Gerekiyorsa `ios.entitlements`'a eklenir; Apple onayı gerekmez (bulgu) |
| S2 | AlarmKit alarm sesi **`Library/Sounds`**'tan okunabiliyor mu, yoksa yalnız ana paket mi? | Faz 3 cihaz | Yalnız paket ise klipler paketten (zaten öyle); kullanıcı sesi (gelecek) etkilenir |
| S3 | Günde ~10–35 alarm (yoğun preset, 2 gün → ~70) sistemce **kabul ediliyor mu**, gizli sınır var mı? | Faz 3 cihaz + `AlarmManager.alarms` sayımı | Sınır varsa alarm da bütçeye alınır (`butceyeSigdir` `alarm` türünü de sayar — tek satır) |
| S4 | Aynı UUID ile ikinci `schedule` **değiştirir mi, hata mı verir**? | Faz 3 spike | Hata veriyorsa teslimci "önce iptal, sonra kur" (zaten planlanan sıra) |
| S5 | `expo-alarm-kit` API yüzeyi (planla/iptal/listele/izin/ses) yeterli mi? README 403 ile okunamadı. | Faz 3 başında 1 günlük spike; yetmezse fork | Köprü kararı |
| S6 | EAS, `android/` git'teyken `ios/` **yoksa** iOS için prebuild çalıştırıyor mu (hibrit CNG)? | Faz 1 ilk build | Çalıştırmıyorsa `expo prebuild -p ios` Windows'ta üretilip commit'lenir (Pods hariç) |
| S7 | Time Sensitive'i seviye 2–4'te kullanmak App Review'da sorun çıkarır mı? | İlk inceleme | Kural tek satır (`teslimPlani`) |
| S8 | `expo-background-fetch` iOS'ta (deprecated) hiç tetiklenmezse `ArkaplanGorevServisi`'nin iOS'ta değeri sıfır → `expo-background-task`'a geçiş (`BGTaskSchedulerPermittedIdentifiers` şart) **ayrı bir plan** mı? | Faz 1 sonrası TestFlight logları (`sonGpsGuncellemesi` nabzı) | Bu planda 2-gün penceresi + ön plana geliş yenilemesi yeterli sayılır |
| S9 | Klip üretim kaynağı: bulut TTS çıktısının **dağıtım hakkı**, insan kaydı, ya da Android TTS `synthesizeToFile`? | Kullanıcı kararı + sağlayıcı şartları | Faz 2 başlangıcı |
| S10 | `PrivacyInfo.xcprivacy` (required-reason API'ler: UserDefaults/AsyncStorage, file timestamps) SDK 54 pod'larından otomatik geliyor mu? | Faz 1 build uyarıları + App Store Connect yükleme | Eksikse `ios.privacyManifests` app.json'a |
| S11 | Appetize.io ücretsiz katmanında **iOS 26** simülatör imajı var mı? | Faz 1'de 5 dk kontrol | Yoksa iOS 18 imajı Faz 1–2 için yine yeterli (AlarmKit hariç) |
| S12 | iOS'ta `sesliOnayi` yazılmadan sesli hücre açılmış bir yedek Android'e taşınırsa: Android yükleme yolu bugün rızayı **yeniden sormaz**. Kabul mü, yoksa `YedekBirlestirmeServisi` platform damgası mı? | Kullanıcı kararı | Düşük olasılık; not düşülür |
| S13 | App Store Connect API anahtarı ve `eas credentials -p ios`'un **Windows'tan** sorunsuz çalıştığı | Faz 1 tek seferlik kurulum | Takılırsa EAS web arayüzünden yükleme |

---

## 7. Kapsam dışı (bilinçli)

- **WidgetKit** ana ekran widget'ı (`WidgetServisi` iOS'ta no-op kalır) ve **Live Activity / Dynamic Island** geri sayımı (iftar/sahur/seri/vakit sayaçları iOS'ta yok — Android `RemoteViews` chronometer'ın karşılığı ayrı bir proje).
- **Play Core karşılığı**: iOS'ta uygulama içi güncelleme akışı yok; güncelleme App Store'un işi. GitHub kaynağı iOS'ta kapatılır, yerine bir şey konmaz.
- **Kullanıcının kendi sesini seçmesi** (Android `RingtoneManager` ikizi): iOS'ta sistem seçici yok; dosya seçtirmek + ≤30 sn CAF'a dönüştürmek native AVFoundation işi (Mihrab'ın yaptığı — AGPL, kopyalanmaz). Gelecek planı; bu sürümde paket sesi.
- **Serbest anons metninin seslendirilmesi** iOS'ta (arka planda TTS yok) — klip seti sabittir.
- **Critical Alerts**, arka plan ses modu, uzak push.
- **Cuma hatırlatması / vakit bildirimleri / konum takibi** iOS'a özgü iyileştirme: mevcut `expo-notifications`/`expo-location` yolları iOS'ta zaten derlenir; yalnız 64 bütçesinde payları hesaba katılır.
- **iPad'e özel düzen**, Apple Watch, Siri/App Intents ("Kıldım"ı alarm arayüzüne koymak App Intent ister — Faz 3 sonrası değerlendirilir).
- **`expo-background-task` göçü** (S8) — ayrı plan.
- **Android davranışında herhangi bir değişiklik** — bu plan Android'e yalnız kod *taşır*, mantık eklemez.
