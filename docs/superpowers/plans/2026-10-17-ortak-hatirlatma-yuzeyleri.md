# Ortak hatırlatma yüzeyleri — uygulama planı (Faz 2b)

> Tarih: 2026-10-17 · Dal: `claude/faz2b-hatirlatma-yuzeyleri` (origin/master `3beaf13`)
> Kaynak: sahibin v0.32.0 geri bildirimi (yol haritası 2.1 + nafile gösterge yeri).
> Bu belge PLANDIR; kod yazılmadı. Kod öncesi iki onay gerekir: (1) §2'deki **sahip
> kararları**, (2) §9'daki ekran taslağı (AGENTS.md "Ekran / UI tasarım standardı").

## 0. Özet

1. **Her hatırlatma yüzeyi aynı modeli konuşur:** `{ aktif, yon (sabit), adimlar: SeviyeAyari[] }`
   — nafile (#273) deseni. Cuma, camiye gitme, yatış (yatsı + muhasebe) ve takvim çakışması
   bu modele taşınır; hepsi `MuhafizTeslimcisi`'nin **kendi önekli AYRI örneğinden** teslim
   edilir (`nafileTeslimcisiniAl` ikizi). Böylece kanal çipleri / sesli anons / ses seçimi /
   titreşim / gerçek alarm + kapsamı / tekrar / 1–3 adım / "Kapalı" çipi / akış önizlemesi
   hepsinde **aynı koddan** gelir.
2. **"Teslimciden geçmiyor" artık gerekçe değil.** Kalan istisnalar: **yön** (dördünde de tek
   anlamlı yön var — gerekçe EKRANDA yazılır) ve **ton** (nafile emsali, sahibin listesinde
   yok). Serbest anons metni yerine nafile gibi "Telefonunuz şöyle okur" örneği (§3.4).
3. **Göçler şekle bakar** (`adimlar` yoksa eski alanlardan), eski kayıt **birebir aynı planı**
   üretir; nöbetçi = dondurulmuş eski üretici + refactor ÖNCESİ alınmış kayıt-oynat snapshot'ı.
4. **Dört yapısal tuzak** önce altyapıda çözülür (§4): yatış kimliğinin `muhafiz_` uzayında
   olması, native alarmın yeni öneklerde ölü doğması, kanal/alarm-kanalı çöp toplamasının
   yalnız nafileyi koruması, bütçe paylarının yetmemesi.
5. **Nafile göstergesi** her nafilenin kendi kartına "Ana ekranda göster" satırı olarak iner.

---

## 1. Bugünkü durum (dosya:satır)

| Yüzey | Model | Teslim yolu | Kimlik | Kanal | Kategori | Ekran |
|---|---|---|---|---|---|---|
| Cuma (#173) | `{aktif, oncedenDk, siklik}` — `data/local/LocalCumaHatirlatmaServisi.ts:12` | `CumaHatirlatmaServisi.tekHatirlatmaPlanla` (`domain/services/CumaHatirlatmaServisi.ts:117`) doğrudan `scheduleNotificationAsync`; plan `core/bildirim/cumaPlani.ts:54` (tek adım `vakitUyariPlaniOlustur` ile) | `cuma_hatirlatma_<ISO>` (ilk), `_<kalanDk>` (tekrar) | `vakit_bildirim` | yok | `PencereKarti` + `cumaPencereTanimi` (`components/hatirlatma/pencereTanimi.ts:543`) — kanal/ses/titreşim/alarm/kapalı/yön KAPALI |
| Camiye gitme (#292) | `{aktif, vakitler, yurumeDk, hazirlikDk, yurumeKaynagi, camiAdi?}` — `core/camiyeGit/camiyeGitAyarlari.ts:26` | `CamiyeGitHatirlatmaServisi.tekHatirlatmaPlanla` (`:91`); plan `core/bildirim/camiyeGitPlani.ts:69` | `camiye_git_<gün>_<vakit>` | `vakit_bildirim` | yok | `CamiyeGitBolumu.tsx` — ortak kartı HİÇ kullanmıyor (gerekçesi dosya başı `:5`) |
| Yatış + muhasebe (#290) | `{aktif, saat, dakika, onceDk, yatsiHatirlatmasi, muhasebe}` — `core/yatis/yatisPlani.ts:42` | `YatisHatirlatmaServisi.planla` (`:197`); plan `yatisPlaniOlustur` (`yatisPlani.ts:341`) | `muhafiz_<gün>_vakit_yatsi_yatis`, `muhafiz_<gün>_vakit_<v>_muhasebe`, `muhasebe_<gün>` (`yatisPlani.ts:139-146`) | yatsı → `muhafiz` (taban), muhasebe → `vakit_bildirim` (`:216`) | `MUHAFIZ` / `muhasebe_tek` / `muhasebe_coklu` | `YatisHatirlatmaBolumu.tsx` + `yatisPencereTanimi` (`pencereTanimi.ts:593`) — tek adım, hepsi kapalı |
| Takvim çakışması (#291) | `{aktif, oncedenDk, baslikGoster, rizaZamani?}` — `core/takvimCakisma/takvimCakismaAyarlari.ts:19` | `TakvimCakismaServisi.planla` (`:186`); plan `takvimCakismaPlaniOlustur` (`core/bildirim/takvimCakismaPlani.ts:239`) | `takvim_cakisma_<gün>_<vakit>` | `vakit_bildirim` | yok | `TakvimCakismaBolumu.tsx` — ortak kartı kullanmıyor |
| Nafile (#273) — **şablon** | `{aktif, yon, adimlar}` + `sesliOnayi`/`alarmOnayi` | `nafileTeslimcisiniAl()` (`NafileHatirlatmaServisi.ts:52`) → ayrı `Android/IosMuhafizTeslimcisi` örneği | `nafile_<gün>_<tür>_<k>` | ortak muhafız uzayı + `nafile_uyandirma` | `MUHAFIZ` (paylaşılır) | `PencereKarti` + `AdimDetayModal`, tam yetenek |

Nafile ekranında gösterge anahtarları ayrı kartta: `screens/NafileAyarlariSayfasi.tsx:422-461`.

---

## 2. Sahip kararları (kod öncesi ONAY gerekir)

Plan aşağıdaki **önerilerle** yazıldı; sahip farklı seçerse ilgili bölüm değişir.

- **K1 — Android alarm havuzu payları.** Bugün `ANDROID_DIGER_PAYI = 120`'nin 60'ı nafilede; kalan
  60'a vakit bildirimi (~10), gün sonu (7), sayaç (~10), widget, iftar/sahur/seri girer. Varsayılan
  ayarla bile camiye gitme 35 + takvim en kötü 35 tetik üretir → **havuz bugün de nominal olarak
  aşılabiliyor**; yeni yetenekler (tekrar × sesli anons alarmı ×2) bunu büyütür. Seçenekler:
  - **(A, önerilen)** Yüzey başına üreticide kronolojik kesen pay (nafile deseni) +
    `ANDROID_DIGER_PAYI` bu payların TOPLAMINDAN türer, `ANDROID_MUHAFIZ_PAYI = 480 − diğer`:
    cuma 16 · camiye 50 · yatış 21 · takvim 35 · nafile 60 · mevcut diğerleri 40 → diğer 222,
    **muhafız 360 → 258**. Hazır yoğunluklar (vakit başına 4/6/7 uyarı ≈ 70 alarm) etkilenmez;
    yalnız uç özel matris (5×6 adım × 10 tetik + anons) seyrelir. `butceOnerileri` ve defter
    testlerindeki 360 sabitleri güncellenir.
  - **(B)** Muhafız 360 kalır; yüzey payları yalnız emniyet ağı, toplamı defterin 480 kapısı
    (`degisiklikSimuleEt`) korur. Bedel: takvime sonradan eklenen etkinlik gibi kullanıcı
    eyleminden bağımsız artış kapıya takılmadan 480'i aşabilir (sessiz kesme).
- **K2 — iOS AlarmKit payları.** `IOS_ALARMKIT_TAVANI = 24` (belgelenmemiş sınıra ihtiyatlı
  tavan), muhafız 20 + nafile 4 → yeni yüzeylere pay YOK. Öneri: tavan 24 korunur, **muhafız 16 ·
  nafile 4 · cuma 1 · camiye 1 · yatış 1 · takvim 1** (alarm yalnız ilk tetikte varsayılan; kesme
  kronolojik, fazlası bildirim olarak gelir — kayıp değil). Alternatif: tavanı 32'ye çıkarmak
  (doğrulanmadı).
- **K3 — Yön istisnası dördünde de.** Cuma/camiye gitme "vakit GİRMEDEN önce" (giriş yönü =
  hutbe/cemaat kaçmış demek), yatış "yatıştan önce" (pencerenin başı yok), takvim "etkinlikten
  önce" (olay tabanlı). Yön seçici çizilmez; yerine kartta tek satır gerekçe (§3.3). Sahip
  bunu "anlamsız istisna" saymazsa hangi yüzeyde ikinci yönün ne anlama geleceğini tanımlaması
  gerekir.
- **K4 — Ton yok** (nafile emsali; `kademe: 'nazik'`, `acilKanal: false` → Rahatsız Etmeyin
  delinmez). Sahibin listesinde ton yok.
- **K5 — Anons metni düzenlenemez**, bağlamdan üretilir ve "Telefonunuz şöyle okur" ile gösterilir
  (nafile emsali). Gerekçe: muhafız şablonları `{vakit}` + "vakit çıkıyor" dilinde; bu yüzeylerin
  hiçbiri vaktin sonunu anlatmıyor. İleride serbest metin istenirse ayrı iş.
- **K6 — PR bölümü.** Varsayılan: hepsi bu dalda. Önerilen bölüm (her biri ayrı release):
  **PR-A** = §8 adım 0–2 (nafile gösterge + altyapı + cuma) · **PR-B** = adım 3–4 (camiye gitme +
  yatış) · **PR-C** = adım 5 (takvim). Altyapı (adım 1) her durumda ilk girer.

---

## 3. Ortak hedef model ve kurallar

### 3.1 Model
```ts
interface EkHatirlatmaAyari {           // yüzeyin ayar blob'unun İÇİNDE (yeni anahtar YOK)
  aktif: boolean;
  adimlar: SeviyeAyari[];               // 1..EK_HATIRLATMA_MAKS_ADIM (3), kronolojik, eşik tekil
  sesliOnayi?: boolean;                 // yüzeyin KENDİ rızası — muhafız/nafileninki taşınmaz
  alarmOnayi?: boolean;                 // aynı
}
```
- `yon` modelde **yazılmaz** (sabit `cikisaDogru`; ölçü = yüzeyin çapasına "kala" dk).
- Adım kısıtları `core/hatirlatma/adimDizisi.ts`'te zorlanır (nafileninkinin genellemesi, §8 adım 1):
  `kademe: 'nazik'`, `acilKanal: false`, tekrar 5–60 dk (cuma alt sınırı 5 korunur; nafile 10),
  eşik tekil, en fazla 3 adım, `alarmKapsami` (`ilk`/`hepsi`) muhafızla aynı.
- Eski alanlar (`oncedenDk`, `siklik`, `onceDk`) diske **türev olarak yazılmaya devam eder**
  (ilk kronolojik adımdan) — eski sürüm bu yedeği açarsa çalışır (nafile `gostergeAktif` deseni).
- Yedekleme: anahtarlar zaten beyaz listenin üç yerinde (`YedeklemeServisi.ts:130-145`,
  `YedekBirlestirmeServisi.ts:52-60`, `yedeklemeSlice`) → **yeni anahtar yok**; ancak her yüzeyin
  normalize fonksiyonu yeni alanları (adımlar + iki rıza) **açıkça taşımalı** (muhafız `sesliOnayi`
  kalıcılık tuzağı).

### 3.2 Teslim
- Her yüzeyin teslimcisi: `<yuzey>TeslimcisiniAl()` / `<yuzey>TeslimcisiniAyarla()` (enjekte
  edilebilir — jest varsayılanı iOS).
  - Android: `new AndroidMuhafizTeslimcisi({ alarmButcesi: ANDROID_<X>_PAYI, kanalHazirligi: m => m,
    kimlikSecici, alarmDestegi: true, alarmKanalTemizligi: false })`
  - iOS: `new IosMuhafizTeslimcisi({ kimlikSecici, matrissizAnons: true, alarmDestegi: true,
    alarmKitPayi: IOS_ALARMKIT_<X>_PAYI })`
  - `kimlikSecici` YENİ seçenek (§4.1): önek yerine yüklem; cuma/camiye/takvim için
    `k => k.startsWith(ONEK)`, yatış için `yatisKimligiMi`.
- `OzelTeslim` genişler (`MuhafizTeslimcisi.ts:94`):
  - `kategori?: string | null` — `null` = kategori yok (cuma, camiye gitme, takvim bugün düğmesiz;
    muhafız `MUHAFIZ` kategorisi "Kıldım"ı FARZ'a yazardı). Yatış bugünkü kategorisini geçer.
  - `varsayilanKanalId?: string` — adım **varsayılan ses + titreşimsiz** iken kullanılacak kanal
    (`vakit_bildirim`) → göçten gelen kayıt bugünkü kanalda kalır; kullanıcı ses/titreşim seçince
    ortak `muhafiz_<hash8>` uzayına geçer. (`kanalId` zorlaması — nafile uyandırma — aynı kalır.)
  - `alarmTuru: 'bilgi' | 'vakit'` — §4.2.
  - `anonsMetni` serviste çözülmüş metindir (`uyari.anonsMetni`'ne yazılır, `vakit: 'ogle'` geçilir —
    nafile emsali; `anonsMetniniCoz` yer tutucusuz metne dokunmaz).
- Teslimcinin `priority` alanı yazması bugünküyle fark yaratır; Android 8+'ta kanal önemi kazanır
  (minSdk 24 → yalnız Android 7'de heads-up farkı). Kabul edildi, kayıt-oynat karşılaştırması
  `priority`'yi hariç tutar ve AGENTS.md'de yazılır.

### 3.3 Ekranda istisna gerekçesi
- `PencereTanimi`'ne `yonSabitGerekcesi?: string` eklenir; `PencereKarti` yön seçici yerine bu
  metni bilgi satırı olarak çizer (sessiz istisna yok):
  - Cuma: "Hatırlatma öğle vaktinden ÖNCE gelir; vakit girdikten sonra cuma için geç olur."
  - Camiye gitme: "Hatırlatma vakit girmeden önce gelir; camiye zamanında varmanız için."
  - Yatış: "Hatırlatma yatış saatinizden önce gelir."
  - Takvim: "Uyarı etkinliğinizden önce gelir; yön, etkinliğin saatine bağlıdır."
- `STANDART_YETENEKLER` nöbetçisi (`pencereTanimi.test.ts > YETENEK STANDARDI`) genişler: her
  tanımda istisna yalnız `yonSecilebilir` + `tonSecilebilir` + `anonsMetniDuzenlenebilir`
  olabilir; `yonSecilebilir: false` ise `yonSabitGerekcesi` dolu olmalı.

### 3.4 Anons metinleri (ibadet çağrısı = "sen"; bilgi = "siz")
| Yüzey | Örnek okunuş | Kayıt |
|---|---|---|
| Cuma | "Cuma namazına {süre} dakika kaldı. Hazırlan, camiye yola çık." | sen |
| Camiye gitme | "{Vakit} vaktine {süre} dakika kaldı. Camiye yola çık." | sen |
| Yatış — yatsı | "Yatmadan önce yatsıyı kıl." | sen |
| Yatış — muhasebe | "Bugün {n} vakit işaretlenmemiş görünüyor." | siz |
| Takvim | "Takviminizdeki bir etkinlik {vakit} vaktine denk geliyor. {Önce/Ara verip} kılmayı unutmayın." | siz |
- **Takvim: etkinlik adı TTS'e ASLA girmez** — `baslikGoster` açık olsa bile (sesli okuma rıza
  modalının ve gizlilik politikasının kapsamında değil). Nöbetçi test.
- Nass yalnız bildirim gövdesinde ve yalnız günün **ilk** tetiğinde (cuma `ilkMi` korunur); anonsta
  nass okunmaz.

### 3.5 Kimlik ve iptal
- İlk kronolojik adımın ilk tetiği **tarihsel kimliği korur** (göç birebirliği + Kıldım/iptal);
  diğerleri `_<kalanDk>` eki alır (cuma bugün böyle). Bir vakitte tek dakika tek kazanan → tekil.
- Takvim ve camiye gitme bugün **tam kimlikle** iptal ediyor → öneğe çevrilir:
  `takvimCakismaKimlikOneki(gün, vakit) = takvim_cakisma_<gün>_<vakit>` + sınır kontrolü
  (`k === onek || k.startsWith(onek + '_')`, `BildirimKildimKurallari` deseni). İptal = bekleyen
  expo + gösterilen + anons (native önekli) + alarm (`teslimci.vakitYanKanallariniIptalEt(onek)`).
- Yatış kimlik deseni `YATIS_KIMLIK_DESENI` (`yatisPlani.ts:143`) `(_\d+)?$` ile genişler; native
  "Kıldım" (#299) `muhafiz_<gün>_vakit_yatsi` önekiyle zaten hepsini (bildirim + anons + alarm) kapsar.

---

## 4. Altyapı tuzakları ve çözümleri (adım 1)

### 4.1 Yatış kimliği `muhafiz_` uzayında → muhafız turu onu SİLER
- Android: `AndroidMuhafizTeslimcisi.alarmlariHazirla` `onekliAlarmlariIptalEt('muhafiz_')`
  (`:203`) ve `tumYanKanallariIptalEt` `iptalEtOnekliAnonslar('muhafiz_')` (`:321`) her 15 dk
  turunda yatışın anons + alarmlarını da silerdi. iOS: muhafız kapalıyken `hazirla` tüm `muhafiz_`
  alarmlarını siler (`IosMuhafizTeslimcisi.ts:293`).
- **Karar: (b) muhafızın temizliğini SEÇİCİYE çevir** (yatış kimliği değişmez). Gerekçe: (a)
  (kimliği `yatis_…`'e taşımak) native `BildirimKildimKurallari.vakitCoz`'u, Kıldım önek iptalini,
  saat köprü etiketini ve otomasyonu yeniden açar; (b) iOS'ta zaten var olan deseni
  (`alarmKitIptalSecimi` + `muhafizPlanKimligiMi`) Android'e taşır.
  - Native (Android, "önce sor" sınırı): `expo-countdown-notification` → `kayitliAnonsKimlikleri():
    string[]` (`AsyncFunction`); `MuhafizAlarmModulu` → `kayitliAlarmKimlikleri(): string[]`. JS
    süzer (`muhafizPlanKimligiMi`, kapalı muhafızda `muhafizSahipliMi` = plan ∪ erteleme) ve
    mevcut tekil iptallerle (`iptalEtAnons`, `alarmIptalEt`) siler. Listeleme fonksiyonu yoksa
    (eski ikili; JS+native aynı APK'da gelir, yalnız savunma): öneği olan örnekler (muhafız `muhafiz_`
    yalnız yatış yoksa, nafile, cuma, camiye gitme, takvim) bugünkü önek yoluna düşer; **yatış
    örneği HİÇBİR ŞEY silmez + `Logger.warn`** (önek karşılığı `muhafiz_`dir, düşüş muhafızın tüm
    anons/alarmlarını silerdi). Nöbetçi: "listeleme yokken yatış teslimcisi hiçbir şeyi silmez".
  - `AndroidTeslimciSecenekleri.anonsOneki` → `kimlikSecici` (geri uyum: önek verilirse seçiciye
    çevrilir). iOS `kendiOneki` → `kimlikSecici` (aynı).
  - iOS muhafız-kapalı dalı `startsWith('muhafiz_')` → `muhafizSahipliMi`.
  - Nöbetçiler: "muhafız turu yatış alarmını/anonsunu SİLMEZ" (iki platform), kayıt-oynat
    snapshot'ı DEĞİŞMEZ.

### 4.2 Gerçek alarm yeni öneklerde native'de ölü doğar
- `MuhafizAlarmKurallari.yukCoz` (`android/.../cekirdek/MuhafizAlarmKurallari.kt:156,165`) kimlik
  ne muhafız vaktine ne nafileye çözülürse `null` → alarm ÇALMAZ, hata da vermez.
- **Karar:** yüke OPSİYONEL `tur: "vakit" | "nafile" | "bilgi"` alanı. **`YUK_SURUMU` ARTMAZ:**
  `yukCoz` sürüm uyuşmazlığında `null` döner → artırmak güncelleme ÖNCESİ kurulmuş alarmları
  (bugünün yatsısı dahil) tetik anında ve yeniden kurucuda sessizce öldürürdü. `tur` yoksa bugünkü
  kimlik çözümü varsayılandır (`vakitCoz` → vakit, `nafileCoz` → nafile, aksi → eskiden `null`,
  şimdi `bilgi`). Fikstüre "`tur`'suz eski yük" örneği girer. `bilgi` (cuma, camiye gitme, takvim): yalnız "Kapat"; "Kıldım" ve "Ertele" YOK
  (vakit girmeden çalar), otomasyon "vakit çıkıyor" olayı DOĞMAZ, geç tetik kuralı `cikisMs` yerine
  `sonMs` (pencere sonu: öğle girişi / vakit girişi / etkinlik başı) ile. Yatış `vakit` türüdür:
  `vakitCoz` zaten yatsı/muhasebe-tek kimliğini çözer → "Kıldım" farzı işaretler (doğru);
  çoklu muhasebe (`muhasebe_<gün>`) `bilgi`.
- Dosyalar: `cekirdek/MuhafizAlarmKurallari.kt`, `alarm/MuhafizAlarmEylemleri.kt`,
  `alarm/MuhafizAlarmBildirimi.kt` (düğme seti), `alarm/MuhafizAlarmActivity.kt`,
  `core/muhafiz/alarmYuku.ts`; ortak fikstür `android/app/src/test/resources/alarm-yuk-ornekleri.json`
  (JS + JVM testi).
- iOS: `modules/expo-muhafiz-alarmkit/ios/AlarmKurallari.swift` kimlik sınıflandırıcı
  `alarmTuru(kimlik)` (+ `test/alarmkit-ornek.json` genişler); `targets/muhafiz-alarmkit/`
  intent'i `bilgi` türünde ikincil düğme koymaz (yalnız sistem "Durdur").
- Otomasyon: `OtomasyonKurallari.cikiyorOlayi` yatış kimliğini (içinde `_dk_` yok) yok saymalı —
  nöbetçi JVM testi eklenir.

### 4.3 Kanal ve alarm-kanalı çöp toplaması yalnız nafileyi korur
- `MuhafizKanalServisi.hazirla` (`:101-113`) yalnız `nafileKanalAyarlariniOku()`'yu korur;
  `AndroidMuhafizTeslimcisi` alarm kanalı koruması yalnız `nafileAlarmKanallariniOku` (`:76,127`).
  Yeni yüzeyler ses/titreşim seçtiğinde `muhafiz_<hash8>` / `namaz_alarm_<hash8>` kanalları her
  muhafız turunda **silinir** → Android 8+ bildirimi HİÇ göstermez.
- **Karar:** `domain/services/ekHatirlatmaKaynaklari.ts` — DİSKTEN okuyan kayıt defteri:
  `{ ad, kanalAyarlari(): Promise<VakitMuhafizAyari[]>, alarmSesleri(): Promise<string[]> }[]`
  (nafile + dört yüzey). `MuhafizKanalServisi.hazirla` ve muhafız teslimcisinin
  `ekAlarmKanallari` varsayılanı listeyi birleştirir. Bir kaynak okunamazsa o turda **toplama
  yapılmaz** (bugünkü "bilinmeyeni silme" kuralı).
- Ses doğrulaması genelleşir: `MuhafizKanalServisi.adimSesleriniDogrula(adimlar)`;
  `nafileSesleriniDogrula` onun üstüne kurulur. Kanal + plan + GC aynı doğrulanmış sesi kullanır.
- Yüzey servisi kanalları yalnız OLUŞTURUR (`ekKanallariHazirla`), toplamaz.

### 4.4 Bütçe ve defter
- `butceSabitleri.ts`: `ANDROID_CUMA_PAYI`, `ANDROID_CAMIYE_GIT_PAYI`, `ANDROID_YATIS_PAYI`,
  `ANDROID_TAKVIM_CAKISMA_PAYI`, `IOS_ALARMKIT_<X>_PAYI` (K1/K2). Kesme **üreticide kronolojik**
  (nafile `alarmButcesi` deseni) — defter ve servis aynı sayıyı görür; teslimci sayacı emniyet ağı.
- `DefterKaydi.nafilePayi?: true` → `pay?: DefterKaynagi` (muhafızın 360'ına sayılmayan alarmlar;
  `defterOzeti` `!k.pay` ile süzer, `bildirimDefteri.ts:438`).
- Üreticiler `UyariPlani` (en azından `kanallar`, `alarm`, `sesliAnons`) döndürür; defter
  `alarm`/`anons` kayıtlarını muhafız/nafile ile **aynı kuralla** (`alarmKurarMi`,
  `anonsAlarmiKurarMi` genellemesi) ekler.
- iOS 64: her örnek "kendi dışı"nı ölçer → planlama SIRASI sonucu belirler. Sabit sıra
  (`KonumDegisikligiServisi.konumDegistiUygula` + `App.tsx` açılışı + `ArkaplanGorevServisi`):
  muhafız → vakit bildirimi → nafile → yatış → cuma → camiye gitme → takvim. Sıra AGENTS.md'ye yazılır.
- Ekleme kapısı: `nafileYukuArtiyorMu` → `adimYukuArtiyorMu(eski, yeni)` genellenir; dört yüzeyin
  ekranı yapısal artışta `degisiklikSimuleEt`'ten geçer (salt zaman değişimi geçmez — Fable M4).
  `butceOnerileri`'ne yeni öneri EKLENMEZ (kapsam dışı; rehber kartı sayıyı doğru gösterir).

---

## 5. Yüzey yüzey plan

### 5.1 Cuma (#173)
- **Hedef:** `CumaHatirlatmaAyarlari = EkHatirlatmaAyari` (+ türev `oncedenDk`, `siklik`). Ölçü =
  öğle GİRİŞİNE kalan dk (pencere = `cumaPenceresiOlustur`'un genellemesi: [öğle − 180, öğle]).
  Eşik sınırları 15–180 korunur, adım 15.
- **Göç:** `adimlar` yoksa → `[nazikAdim(oncedenDk, siklik, {bildirim:true})]`. Nöbetçi: dondurulmuş
  `cumaPlaniOlustur` (eski) ile yeni üretici aynı girdide birebir `{id, zaman, ilkMi}`.
- **Teslim:** `cuma_hatirlatma_` seçicisi; `ozel = { veri: {tip:'cuma_hatirlatma'}, kategori: null,
  varsayilanKanalId: VAKIT_BILDIRIM, alarmTuru: 'bilgi', alarmAdi: 'Cuma' }`. Metin: bugünkü
  gövde/başlık (önden okunur başlık `cumaBasligiOlustur`) birebir.
- **Kıldım:** yok (öğle girmeden). Takvim olay adı değişmez.
- **Ufuk:** 4 cuma korunur (iOS dahil); iOS'ta tekrarlı + 4 hafta 64'ü zorlar → defter söyler,
  `CUMA_IOS_*` ufku açılmaz (kapsam dışı, rehber önerisi ileride).
- **Çakışma:** camiye gitmenin cuma öğlesi atlaması (`cumaHatirlatmasiAcik`) aynen.
- **Tazeleme noktaları:** değişmez (`App.tsx`, slice thunk, `ArkaplanGorevServisi` muhafız erken
  dönüşlerinden ÖNCE, `konumDegistiUygula`, yedekten geri yükleme).
- **UI:** `cumaPencereTanimi` → `ekHatirlatmaPencereTanimi({...})` (STANDART + yön/ton/anons
  istisnası + `yonSabitGerekcesi` + `anonsOrnegiOlustur`); `BildirimAyarlariSayfasi.tsx:618`
  `onAdimEkle`, `onAdimAcKapa`, `onAkisiOnizle` (+ `AkisOnizlemeModal`), `pencere` (bu cumanın öğlesi
  — zaman şeridi), `SesliOnayModal`/`AlarmOnayModal` (cuma rızası).

### 5.2 Camiye gitme (#292)
- **Esik sahibi kararı:** `adimlar` tek doğru kaynaktır. Ölçü = vakit GİRİŞİNE kalan dk (cuma ile
  aynı). Beş vakit **tek adım dizisini paylaşır** (vakit başına aç/kapa korunur) → tek
  `PencereKarti` (dosya başındaki "beş ayrı kart" itirazı böyle karşılanır).
- `yurumeDk`/`hazirlikDk` "yola çıkış süresi" yardımcısı olarak kalır: değişince **ilk kronolojik
  adım değil, dizinin TÜMÜ** aynı farkla kaydırılır (`camiyeGitOfsetiniUygula(adimlar, eski, yeni)`;
  aralıklar korunur, eşik `[1, 180]` ve tekillik kenetlenir). "Favori caminize göre" düğmesi
  `yurumeDk`'yı yazar → aynı kaydırma. Özet satırı "Yola çıkış: 15 dk (yürüme 10 + hazırlık 5)".
- **Göç:** `[nazikAdim(yurumeDk + hazirlikDk, 'birkez')]`; birebir nöbetçi (eski
  `camiyeGitPlaniOlustur` donduruldu).
- **Teslim:** `camiye_git_`; `ozel = { veri: {tip:'camiye_git', vakit, tarih}, kategori: null,
  varsayilanKanalId: VAKIT_BILDIRIM, alarmTuru: 'bilgi', alarmAdi: '<Vakit> · camiye' }`.
- **Kimlik:** `camiye_git_<gün>_<vakit>` (+ `_<k>`); temizlik önekle (bugün de öyle).
- **Tazeleme noktaları:** değişmez — `App.tsx` açılışı · `konumDegistiUygula` listesi (+ nöbetçi) ·
  `ArkaplanGorevServisi` muhafız erken dönüşlerinden ÖNCE · yedekten geri yükleme (`!yayildi`
  dalı) · `cumaHatirlatmaAyariniGuncelle` (`aktif` değişince). Sıra §4.4'teki iOS 64 sırasıyla aynı.
- **UI:** `CamiyeGitBolumu.tsx`: ana anahtar + vakit çipleri + yola çıkış bölümü ÜSTTE, altında
  ortak `PencereKarti` (`stil="gomulu"`), zaman şeridi bugünkü sıradaki seçili vakit.

### 5.3 Yatış hatırlatması + muhasebe (#290)
- **Hedef:** `YatisAyarlari = {aktif, saat, dakika, yatsiHatirlatmasi, muhasebe} + EkHatirlatmaAyari`
  (`onceDk` türev). **TEK adım dizisi**; her tetiğin içeriği bugünkü kuralla tetik anında seçilir
  (`yatisIcerigiOlustur`): yatsı kılınmadıysa (ve yatsı hatırlatması açıksa) yatsı, değilse muhasebe.
- Ölçü = yatışa kalan dk; pencere = [yatış − 120, yatış]. **Yatsı girişi kayması** (`yatsiHatirlatmaTetigi`,
  `+ YATIS_YATSI_GIRIS_PAYI_DK`) **her tetiğe** uygulanır, sonra çakışanlar tek kazanana indirgenir.
  Tekrar = aynı içeriğin yatışa kadar yeniden teslimi.
- **Kayıttan üretilen içerik kararı:** içerik planlama anındaki kayıttan üretilir; kayıt değişince
  servis zaten yeniden planlar (yuva `yatis`, App.tsx + index.ts) → tekrarlar da taze kurulur.
  "Yatsı kılındı" olunca native Kıldım (`muhafiz_<gün>_vakit_yatsi` öneki) yatsı tetiklerinin
  bildirim + anons + alarmını JS'siz iptal eder, ardından JS yuvası muhasebe tetiklerini kurar.
- **Göç:** `[nazikAdim(onceDk)]` — tek tetik, bugünkü kanal (yatsı `muhafiz` tabanı = nazik +
  varsayılan ses zaten bu kanala düşer; muhasebe `varsayilanKanalId: VAKIT_BILDIRIM`), bugünkü
  kategori (`ozel.kategori` = `kayit.kategori`). Birebir nöbetçi.
- **Teslim:** `kimlikSecici = yatisKimligiMi`; `ozel.veri = kayit.data` (yatış/muhasebe yükü,
  `tip:'yatis'|'muhasebe'`), `alarmTuru: 'vakit'` (çoklu muhasebe `bilgi`).
- **Pencere tanımı:** `yatisPencereTanimi` STANDART'a döner; `esikAciklamasi` "Yatış saatinize".
- **Tazeleme noktaları:** değişmez — ayar thunk'ı · `App.tsx` açılışı · `konumDegistiUygula` listesi
  (+ nöbetçi) · `ArkaplanGorevServisi` muhafız erken dönüşlerinden ÖNCE · yedekten geri yükleme ·
  `LocalNamazServisi` adlı yuva `yatis` (`App.tsx` **ve** `index.ts` headless). Sıra §4.4 ile aynı.
- **Bilinen bedel (değişmez):** JS uyanmadan gösterilen bildirimin içeriği bayat olabilir.

### 5.4 Takvim çakışması (#291)
- **Hedef:** `TakvimCakismaAyarlari = {aktif, baslikGoster, rizaZamani} + EkHatirlatmaAyari`
  (`oncedenDk` türev). Vakit başına **tek ADIM DİZİSİ** (bugün "vakit başına tek uyarı").
- **Ölçü/çapa (tür başına, karar tablosu korunur):**
  - `once`: çapa = blok başı, taban = vakit girişi; her tetik `max(çapa − k, taban)`.
  - `kapliyor`: çapa = `min(blok, giriş)`, taban = `giriş − KAPLIYOR_AZAMI_ONCELIK_DK`; aynı formül.
  - Tekrar çapaya kadar sürer; çakışan tetikler (taban kenetlenmesi) tek kazanana indirgenir.
- **Kayıttan üretilen içerik kararı:** tekrar = aynı uyarının yeniden teslimi; etkinlik/kayıt
  değişince servis yeniden planlar (yuva `takvimCakisma`, 15 dk görevi). "Kıldım" (uygulama içi /
  native) → `kilinanlarinUyarilariniIptalEt` **önekle** bekleyen + gösterilen + anons + alarm iptal
  eder, takvim OKUMADAN.
- **Göç:** `[nazikAdim(oncedenDk)]`; karar tablosu nöbetçisi (`takvimCakismaPlani.test.ts`) aynen
  geçer + dondurulmuş eski üretici birebir.
- **Gizlilik:** bildirim başlık/gövdesi bugünkü kural (`baslikGoster`); `ozel.veri` ad içermez;
  **anons metni ve gerçek alarmın başlık + gövdesi adı HİÇ içermez** (`baslikGoster` açık olsa
  bile — tam ekran kilit ekranında açılır, sesli okuma duyulur). Gizlilik politikası metni
  (`docs/app-store/gizlilik-politikasi.md > Takvim`) sesli okuma/alarm satırıyla güncellenir.
- **Rıza zinciri:** takvim rızası (mevcut modal) ≠ sesli rızası ≠ alarm rızası; üçü ayrı alan.
  Kapatmak yalnız takvim rızasını siler (sesli/alarm rızası ayardır, kalır — nafile emsali).
- **Teslim:** `takvim_cakisma_`; `ozel = { veri: {tip:'takvim_cakisma', vakit, tarih}, kategori:
  null, varsayilanKanalId: VAKIT_BILDIRIM, alarmTuru: 'bilgi', alarmAdi: 'Takvim' }`.
- **İzin:** `verilmedi` → plan + anons + alarm temizlenir (teslimcinin `hazirla()`'sı önekle alarmları siler).
- **Tazeleme noktaları:** değişmez — ayar thunk'ı · `App.tsx` açılışı · `konumDegistiUygula` listesi
  (+ nöbetçi) · `ArkaplanGorevServisi` muhafız erken dönüşlerinden ÖNCE (sonradan eklenen toplantıyı
  yakalayan asıl yol) · yedekten geri yükleme · adlı yuva `takvimCakisma` (`App.tsx` + `index.ts`) ·
  defter yalnız özellik açıkken okur. Sıra §4.4 ile aynı.
- **UI:** `TakvimCakismaBolumu.tsx`: ana anahtar + rıza + "etkinlik adını göster" ÜSTTE, ortak
  `PencereKarti` altında; zaman şeridi çizilmez (`pencere` verilmez — olay tabanlı, sabit pencere yok).

---

## 6. iOS davranışı (özet)
- Kanal yok; ses = paket sesi (`iosSesiCoz`), sesli anons = planlamada klip (ön planda sentez,
  arka planda yalnız var olan klip); kesinti seviyesi `active` (ton yok → `timeSensitive` YOK;
  Odak delinmez — bugünkü davranış). Titreşim ve ses seçici iOS'ta gizli (`yetenekler`).
- AlarmKit: K2 payları; alarm bekleyen 64'e sayılmaz; `bilgi` türü yalnız "Durdur".
- Ufuklar değişmez: cuma 4 hafta, camiye/yatış/takvim 3 gün.
- Odak filtresi sessizliği ek teslimcilerde de uygulanır (nafile ile aynı `IosMuhafizTeslimcisi`).

---

## 7. Nafile göstergesi — yeni yer

- Ayrı "Ana ekranda göster" kartı (`NafileAyarlariSayfasi.tsx:422-461`) **kaldırılır**.
- Her nafile kartında, başlıktan hemen sonra (`kart`, `:366`), hatırlatma kapalıyken de görünen
  satır: `uyandirmaSatiri` (`:339`) kalıbı — `arkaplan` zemin + `sinir` çerçeve, `rounded-2xl`,
  sol tonlu ikon çipi `eye` (`renkler.birincil + '20'`), "Ana ekranda göster" / "Günlük akışta,
  vakitlerin arasında", sağda `Anahtar`.
- **`testID="nafile-gosterge-<tur>"` ve `accessibilityLabel` KORUNUR** (test + Maestro ileride).
- Başlıktaki anahtarın erişim etiketi "<Ad> hatırlatması" olur (iki anahtar karışmasın).
- `gostergeAktif` türev kalır; `guncelle({ gosterge: {...} })` yolu değişmez.
- Nafile kartına da `onAkisiOnizle` eklenir (bugün yok — "akış önizlemesi her yüzeyde").

---

## 8. Commit sırası (küçük, doğrulanabilir)

Her commit `npm run verify` geçer; native değişen commit'te ayrıca JVM/Swift testleri
(`./gradlew :app:testDebugUnitTest …` reçetesi, `swiftc` Linux reçetesi) ve dala push + debug APK
(`android-build.yml`) — verify native'i göstermez.

0. **feat(nafile): göstergeyi her nafilenin kendi kartına taşı** (+ nafile akış önizlemesi).
   Testler: `NafileAyarlariSayfasi.test.tsx` (anahtar kart içinde, hatırlatma kapalıyken görünür,
   testID aynı).
1. **Altyapı** (alt commit'ler):
   1a. `test: dört yüzeyin kayıt-oynat snapshot'ı` — refactor ÖNCESİ kod üzerinde
       (`<Yuzey>Servisi.kayitOynat.test.ts`; zaman "çapaya kalan dk", tarih `<BUGUN>`/`<DUN>`,
       `priority` hariç). Bu commit tek başına yeşil olmalı.
   1b. `refactor(hatirlatma): core/hatirlatma/adimDizisi` — nafileAdimlari genellemesi; nafile
       ona geçer, nafile testleri DEĞİŞMEDEN geçer.
   1c. `feat(teslim): kimlik seçici + OzelTeslim kategori/varsayilanKanalId/alarmTuru` + muhafız
       temizliğinin seçiciye çekilmesi (§4.1; native listeleme fonksiyonları). Kayıt-oynat
       (muhafız) birebir.
   1d. `feat(alarm): bilgi türü alarm yükü` — Kotlin + Swift + fikstür (§4.2).
   1e. `feat(kanal): ek hatırlatma kaynakları kayıt defteri` (§4.3).
   1f. `feat(butce): yüzey payları + defter pay alanı` (§4.4; K1/K2 kararına göre).
   1g. `feat(hatirlatma): ekHatirlatmaPencereTanimi + yonSabitGerekcesi` + nöbetçi.
2. **Cuma** — 2a model+göç+normalize · 2b üretici+defter+parite · 2c servis teslimciye
   (kayıt-oynat eşleşir) · 2d slice rızaları · 2e UI.
3. **Camiye gitme** — aynı alt sıra; 3a'da ofset kaydırma yardımcısı.
4. **Yatış** — aynı alt sıra; 4a'da kimlik deseni genişler.
5. **Takvim** — aynı alt sıra; 5c'de önekli iptal + gizlilik nöbetçileri; politika metni.
6. **docs: AGENTS.md** — her yüzey bölümü aynı commit'lerde güncellenir (CLAUDE.md kuralı); sonda
   "Hatırlatma arayüzü ORTAK bileşendir" maddesi yeni modelle yeniden yazılır, eski
   "cuma/yatış istisnaları" ifadeleri silinir. `YeniOzellikler.ts` duyurusu (`platformlar:
   ['android','ios']`, alarm iOS'ta AlarmKit yeteneğine bağlı → `yetenek` alanı kontrol edilir).

---

## 9. Ekran taslağı (kod öncesi sahip onayı)

`superpowers:brainstorming` + `frontend-design` ile dört yüzey + nafile kartı için tek sayfalık
taslak (mevcut görsel dil: `PencereKarti` `stil="gomulu"`, `borderRadius: 24`, tonlu ikon çipi,
`useRenkler`, `FontAwesome5`). İmza öğesi yeni değil: zaman şeridi (cuma, camiye gitme, yatış'ta
bugünün penceresi; takvimde yok). Onay olmadan 0, 2e, 3e, 4e, 5e başlamaz.

---

## 10. Test listesi

- **Göç (yüzey başına):** şekle bakar (bayrağa değil), idempotent, bozuk/eksik alan → varsayılan;
  eski üretici dondurulmuş, birebir `{id, zaman}`; türev eski alanlar diske yazılır; rıza
  alanları göçle YAZILMAZ.
- **Kayıt-oynat:** dört yüzey refactor öncesi snapshot'la eşleşir (`-u` olmadan); muhafız
  kayıt-oynat değişmez.
- **Teslim:** her örnek yalnız kendi seçicisini temizler; muhafız turu yatış anons/alarmını
  silmez (Android + iOS); `kategori: null` → `categoryIdentifier` yazılmaz; varsayılan ses →
  `vakit_bildirim`, özel ses/titreşim → `muhafiz_<hash8>`; `ozel.veri` muhafız yükü DEĞİL.
- **Kanal GC:** muhafız `hazirla` dört yüzeyin özel ses kanallarını ve alarm kanallarını korur;
  kaynak okunamazsa toplama yapılmaz.
- **Native:** `MuhafizAlarmKurallariTest` — `bilgi` yükü çözülür, Kıldım/ertele düğmesi yok,
  `sonMs` sonrası çalmaz; `OtomasyonKurallariTest` — yatış kimliği "vakit çıkıyor" doğurmaz;
  Swift `AlarmKurallari` fikstürü; anons/alarm kimlik listeleme köprüsü.
- **Defter/parite:** `BildirimDefteriParite` her yüzey: servisin kurduğu bildirim + anons + alarm
  sayısı = defter; pay kesmesi kronolojik; iOS AlarmKit payı; `bildirimDefteri.test.ts` pay alanı.
  **Eski-kayıt varyantı:** `BildirimDefteriServisi` dört yüzeyin ayarını servislerle AYNI
  normalize/göç yolundan okur — eski şekilli kayıtta defter ile servis aynı tetikleri sayar.
- **Pay toplamı nöbetçisi:** `ANDROID_DIGER_PAYI` = yüzey paylarının toplamı,
  `ANDROID_MUHAFIZ_PAYI + ANDROID_DIGER_PAYI = ANDROID_TOPLAM_TAVANI`; `IOS_ALARMKIT_*_PAYI` toplamı
  ≤ `IOS_ALARMKIT_TAVANI` (nafile payı bugün `TAVAN − MUHAFIZ` ile türüyor; açık sabite dönünce
  toplam kayabilir).
- **Plan kuralları:** cuma nass yalnız ilk tetikte; yatış yatsı kayması her tetikte + tek kazanan;
  takvim `once`/`kapliyor` taban kenetlenmesi + tek kazanan; camiye ofset kaydırma aralığı korur.
- **Kıldım/iptal:** takvim önekli iptal (bekleyen + gösterilen + anons + alarm); yatış native
  önek kapsaması (JVM); nafile değişmez.
- **Gizlilik:** takvim anons metni ve alarm başlığı etkinlik adını içermez (`baslikGoster: true` iken de).
- **Fıkıh/dil nöbetçileri:** anons metinleri "secde", "terk", küfür nassı içermez; ibadet çağrısı
  "sen", muhasebe/takvim "siz".
- **UI:** `pencereTanimi.test.ts > YETENEK STANDARDI` (istisna listesi + gerekçe zorunlu); dört
  bölümün ekran testi (kanal çipi, ses satırı, titreşim, alarm anahtarı + rıza modalı, adım ekle/sil,
  kapalı çip, akış önizleme, yön gerekçe satırı); `SesliOnayModal`/`AlarmOnayModal` yüzeyin kendi
  alanını yazar, muhafızınkini okumaz; ekleme kapısı yalnız yapısal artışta.
- **Tazeleme:** `KonumDegisikligiServisi.test.ts` sıra nöbetçisi (iOS 64 sırası); arka plan
  görevinde dört yüzey muhafız erken dönüşlerinden ÖNCE.

---

## 11. Riskler

- **Native değişiklik (Android + iOS):** "önce sor" sınırı — §4.1/§4.2 sahibe ayrıca bildirilir.
  Hata modu sessizdir (alarm çalmaz, kanal silinir) → JVM/Swift testleri + debug APK zorunlu.
- **Muhafız temizlik seçicisi** yanlışsa eski plan alarmları birikebilir (önek → seçici geçişi);
  kayıt-oynat + "eski tur alarmları silinir" testi.
- **Bütçe payı (K1)** muhafızı uç özel matriste seyreltebilir.
- **iOS 64** — beş muhafız-dışı örnek bağımsız ölçer; sıra yanlışsa önemli uyarı düşer.
- **Kanal geçişi:** kullanıcı ses seçince `vakit_bildirim` → `muhafiz_<hash>` kanalına geçer;
  `vakit_bildirim`'de yaptığı kanal ayarları (DND istisnası vb.) o adım için geçerliliğini yitirir
  (AdimNotlari'nda tek satır not).
- **Takvim gizliliği** sesli/alarm yeni yüzeyleri açar → politika metni şart.
- **Kapsam büyüklüğü** (K6) — tek PR'da inceleme yükü yüksek.

## 12. Cihazda doğrulanamayacaklar

- Android `bilgi` alarmının çalması, tam ekranda yalnız "Kapat", `sonMs` sonrası atlama
  (One UI dahil); `dumpsys alarm | grep -A3 com.furkanisikay.namazakisi`.
- Kanal GC'nin yeni hash'li kanalları koruması (`dumpsys notification`, paket bloğuna süzerek —
  AGENTS.md reçetesi).
- Muhafız turunun yatış anons/alarmını silmediği (uzun süreli, 15 dk görevli cihaz testi).
- iOS AlarmKit `bilgi` türünün düğmesiz sunumu, beş örneğin 64 ölçüm sırası, ön/arka planda
  anons klibi.
- Yatış tekrarlarında native Kıldım'ın uygulama kapalıyken tüm tetikleri susturması (Samsung uyku).
