# Günün ayeti: widget ve duvar kâğıdı (#380, #381)

Ne zaman okunur: günün ayeti havuzuna/üreticisine, ayet widget'ına (Android, iOS), duvar kâğıdına, "Günün ayeti" sayfasına ya da ayarına dokunuyorsan. (#382 dinamik ikon sahip kararıyla YAPILMADI.)

## Sahip kararları (2026-10-24)
- **Yalnız ayet; hadis EKLENMEZ.** İçerik ayarı yok.
- **Gün imsakta değişir** (namaz günü). Türkçe ve İngilizce aynı gün aynı ayeti görür; diğer diller kendi alt havuzundan seçer (aşağıda).
- **Havuz kuralları:** meal her dilde en çok 200 harf; dipnot işaretli, önceki ayetin cümlesini sürdüren, yalnız Peygamber'e hitap eden ve vakte özgü ayet girmez; İsrâ 17/79 yok.
- **Duvar kâğıdında Arapça varsayılan KAPALI.** Fıkıh notu ("Bazı âlimler, ekranında ayet görünen telefonla lavaboya girilmemesini tavsiye eder.") duvar kâğıdını açarken onay penceresinde ve Arapça satırının altında gösterilir.
- **iOS'ta duvar kâğıdı uygulamadan değiştirilemez** (genel API yok): Kısayollar rehberi + App Intent.
- Tasarım tuvali (sahip onaylı): https://claude.ai/artifact/2HqCS9y8CWfv9dWDkT6ut6

## Kaynaklar ve lisans
- **Arapça: Tanzil Uthmani 1.1, birebir; değiştirilemez.** Gösterildiği her yerde "Tanzil" kaynağı ve tanzil.net bağlantısı (sayfada). Tanzil txt çıktısı sûrelerin 1. ayetine besmele ekler (1 ve 9 hariç) → 1. ayetler havuza girmez.
- **Mealler: QuranEnc, birebir ve KESİLMEDEN; yayımcı + "QuranEnc <sürüm>" her yüzeyde.** QuranEnc User-Agent başlığı olmadan 403 döner (üreticiler gönderir). Yeni sürümde `node scripts/icerik/gunun-ayeti-uret.js` ve `ayet-mealleri-uret.js` yeniden koşar; nöbetçi `gununAyetiHavuzu.test.ts` kuralları veride yeniden denetler.

## Meal kaynakları (dil başına)
| Dil | QuranEnc anahtarı | Dil havuzu (2026-10-25) |
|---|---|---|
| tr / en | `turkish_rwwad` / `english_saheeh` | 186 (havuzu bu ikisi belirler) |
| id | `indonesian_affairs` (Kemenag) | 142 |
| de | `german_bubenheim` | 175 |
| fr | `french_rashid` | 149 |
| bs | `bosnian_rwwad` | 185 |
| ru | `russian_rwwad` | 184 |
| ms | `malay_basumayyah` | 102 |
| ur | `urdu_junagarhi` | 185 (not numarası silinir) |
| es | `spanish_garcia` 1.0.2 (Isa Garcia) | 167 (ayet numarası silinir) |
| nl | `dutch_center` 2.0.10 | 156 |
| sq | `albanian_nahi` 1.1.0 | 178 |
| hi | `hindi_omari` 1.1.5 | 122 (60 kayıt `[n]` dipnotlu → elenir) |
| bn | `bengali_zakaria` 1.1.1 (listede yok, başlık `LISTEDE_OLMAYAN_BASLIKLAR`) | 183 (not numarası silinir) |
| fa | `persian_ih` 1.1.3 (Rowwad) | 179 (2026-10-28) |
| ps | `pashto_rwwad` 1.0.1 | 184 |
| ckb | `kurdish_bamoki` 1.1.1 (QuranEnc Kürtçeyi `ku` listesinde verir → başlık `LISTEDE_OLMAYAN_BASLIKLAR`) | 176 (sondaki satır sonu kırpılır) |
| ug | `uyghur_saleh` 1.0.2 | 138 (ayet numarası silinir; silinemeyen 3 kayıt elenir) |
| az | `azeri_musayev` 1.0.4 (Latin) | 185 (2026-10-29) |
| uz | `uzbek_rwwad` 1.0.4 (KİRİL; Latin alfabede çalışma anında çevrilir, `core/dil/yazi.ts`) | 186 |
| kk | `kazakh_altai` 1.0.0 (KİRİL; liste API'sinde yok → başlık `LISTEDE_OLMAYAN_BASLIKLAR`, sürüm `updates` ucundan) | 183 |
| ky | `kyrgyz_hakimov` 1.0.2 (Kiril; `[1]` dipnot işaretli 28 havuz kaydı elenir — not numarası silinmez, sahibe sorulmadı) | 149 |
| tg | `tajik_arifi` 1.0.2 (Kiril; köşeli ayraçlı tefsir eki "[Парвардигоро]" metnin parçası) | 167 |
| ar | — (yalnız Kur'an metni, sahip kararı) | 186 |
- **Sürüm her zaman `translations/updates?key=<anahtar>` ucundan okunur.** Liste API'si 87 çeviriyi (ru, ms dahil) göstermez; uç belgelenmemiştir → üretici biçim değişiminde ya da liste sürümüyle çelişkide hata verir, listede olmayanın başlığı `LISTEDE_OLMAYAN_BASLIKLAR`'dadır (sitedeki kart). Tanzil mealleri KULLANILMAZ: "yalnız ticari olmayan kullanım" şartı ve sürüm numarası yok.
- **Havuzu Türkçe + İngilizce belirler; diğer dilin meali kayda yalnız ≤200 harf ve dipnot işaretsizse girer, o dilin havuzu meali olan kayıtlardır** (`gununAyeti.ts > dilHavuzu`). Gerekçe: bütün dillerde kesişim havuzu 186'dan 89'a indiriyordu (Malayca Basmeih meali parantez içi tefsirle uzun, medyan 188 harf). Dil havuzu 100'ün altına inmez (nöbetçi).
- **Dipnot işareti (`[915]`, `*`), başta ("2. …") ya da sonda ("… (2)") ayet numarası taşıyan meal alınmaz**, metin değiştirilemediği için (`russian_aboadel` her ayetin başında numara taşır → seçilmedi). Desenler HER yazının rakamını kapsar (`\p{Nd}` + `u`: Devanagari २, Bengalce ১; ASCII `\d` kaçırır) ve ayraç içindeki görünmez biçim karakterini (`\p{Cf}`, bengali_zakaria 3:96 `[\u200c১]`) tolere eder; üretici (`DIPNOT`, `BASTA_NUMARA`, `SONDA_NUMARA`), `ayet-mealleri-uret.js > NUMARALI` ve nöbetçi kural 2 aynı desenler. Üretici dil başına "havuz kaydı → dil havuzu" eleme özetini yazar. Bildirim ayetinde (`ayetMealleri.ts`) o ayet o dilde gösterilmez.
- **İstisna — Urduca (`urdu_junagarhi`) ve Bengalce (`bengali_zakaria`) not numarası silinir** (sahip kararı 2026-10-26 Urduca; Bengalce 2026-10-27, dil iskeleti görevi): ayetlerin çoğu `[1]` / `[১]` taşır (Urduca 145, Bengalce 103 havuz kaydı) ve kuralla havuz yarıdan aşağı iniyordu; yalnız `NOT_NUMARASI` (`\s*\[…\p{Nd}+…\]`) silinir, meal sözcükleri birebir kalır, dipnot gösterilmez (`NOT_NUMARASI_SILINEN`, iki betikte aynı). Başka dile genişletmeden önce sahibe sor.
- **İstisna — ayet numarası silinen mealler (sahip kararı 2026-10-27): baştaki "153. " ve sondaki "(153)" silinir** (`AYET_NUMARASI_SILINEN`, iki betikte aynı; bugün `es` = `spanish_garcia` ve `ug` = `uyghur_saleh`, her ayeti numaralı). Silinemeyen numara ("(24)،", "(ـ18).", "(8ـ10)": ayet ortasında, tatvilli ya da aralık) mealin içinde kalırsa meal elenir (`ARA_NUMARA`, `NUMARALI`'nın dördüncüsü, nöbetçi kural 2). Mealin baştaki/sondaki boşluğu kırpılır (metin değil; `kurdish_bamoki` her ayeti `\n` ile bitirir). Numara çeviri değil işarettir; künye ayeti zaten yazar. Kararla kapsanan sıradaki numaralı mealler: `somali_yacob`, `gujarati_omari`, `bulgarian_translation`, `macedonian_group`, `nepali_central`, `kurmanji_ismail` — dil eklenince kümeye girer.
- **Açık risk (ru, ms):** QuranEnc bu çevirilerin indirme düğmelerini yeni sitede kaldırmış; yeniden yayım iznini yazılı teyit etmek sahibin işidir. Ret gelirse `MEALLER`'den anahtarı çıkarmak yeter: o dil yalnız Arapça gösterir (`meal: null`). Malezya'da 2023 Kur'an Metni Basım Yasası (LPPPQ onayı) yurt dışı uygulamayı kapsıyor mu, doğrulanmadı.
- **Fontlar:** Arapça Amiri Quran (OFL 1.1), meal Noto Serif (OFL). KFGQPC Uthmanic HAFS özel lisanslıdır, PAKETLENMEZ. Android: `android/app/src/main/assets/fonts/AmiriQuran-Regular.ttf` (1.003) + `OFL-AmiriQuran.txt`, `NotoSerif-Regular.ttf` (2.015, statik 400) + `OFL-NotoSerif.txt`; lisans metni her fontun YANINDA kalır. Kaynak: Google Fonts dosyalarının npm aynası `@expo-google-fonts/amiri-quran@0.4.1` ve `@expo-google-fonts/noto-serif@0.4.2` (`LICENSE_FONT` = OFL metni + telif satırı); google/fonts deposuna ajan ortamından erişilemedi (403), ayna aynı Google Fonts ikilisini taşır. Yükseltirken ayna paketin yeni sürümünden kopyala, lisans dosyasını birlikte güncelle. Noto Serif alt kümelenmez (OFL ayrılmış ad kuralı; +500 KB kabul).

## Tek beyin: JS plan yazar, native çizer
Seçim `src/core/icerik/gununAyeti.ts` (`gununAyetiPlani`). Native yüzeyler ayet SEÇMEZ ve namaz vakti HESAPLAMAZ: JS 14 günlük planı yazar, native `baslangicMs <= şimdi` olan SON kaydı çizer, plan biterse son kaydı göstermeye devam eder. Plan yazımı `GununAyetiServisi.yaz()`: açılış, konum değişimi (`konumDegistiUygula` + `App.tsx` listesi), arka plan görevi, dil ve duvar kâğıdı ayarı değişimi.

### Yük şeması (v1) — Android `WidgetVeri.gununAyetiKaydet(json)`, iOS `ExpoSiriKisayollari.gununAyetiKaydet(json)`
```json
{
  "v": 1,
  "dil": "tr",
  "metin": {
    "etiket": "GÜNÜN AYETİ",
    "sigmiyor": "Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun.",
    "acin": "Açın",
    "arapcaKaynagi": "Arapça: Tanzil"
  },
  "plan": [
    {
      "gun": "2026-10-24",
      "baslangicMs": 1792826580000,
      "ref": "94:6",
      "ar": "إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا",
      "meal": "Gerçekten güçlükle beraber bir kolaylık vardır.",
      "kisaKunye": "İnşirâh 94:6",
      "mealKaynagi": "Rowwad Translation Center, QuranEnc 1.0.4"
    }
  ],
  "duvar": { "acik": false, "yer": "kilit", "zemin": "gece", "arapca": false, "paletRenk": "#2E7D32" }
}
```
- Metinler JS'te etkin dilde çözülür; native ek çeviri taşımaz (dil değişince JS yükü yeniden yazar).
- `meal` null olabilir (meali olmayan dil): yalnız Arapça çizilir.
- `duvar.yer`: `kilit` | `ana` | `ikisi`; `zemin`: `gece` | `kagit` | `palet`. iOS `duvar`'ı yok sayar.
- Widget'a dokunma uygulamada "Günün ayeti" sayfasını açar: derin bağlantı `namazakisi://gunun-ayeti` (Ayarlar yığını, altında `AyarlarAna`; nöbetçi `derinBaglantilar.test.ts`).

## Uygulama ekranları
- **`GununAyetiSayfasi`** (rota `GununAyeti`) ve **`GununAyetiAyarlariSayfasi`** (`GununAyetiAyarlari`); Ayarlar'da "Ekran ve cihazlar" grubunda tek satır. İçerik ayarı YOK.
- **Sayfa ayeti widget'la aynı seçimden kurar** (`aktifNamazGunu` + `gununAyetiKaydi`, koordinat `{0,0}` = konum yok → 05:00). Tarih başlığı sözlükteki gün/ay adlarıyla kurulur, `toLocaleDateString` YOK (Hermes ICU).
- **Paylaşım:** metin `Share.share` (Arapça + meal + `kisaKunye` + `mealKaynagi`, atıf hep sonda; pano bağımlılığı bilinçli olarak yok, paylaşım menüsünde "Kopyala" zaten var). Görsel: ekran dışında çizilen `components/gununAyeti/AyetGorseli` → `captureRef` → `expo-sharing`. iPhone'un elle duvar kâğıdı görseli aynı bileşenin `duvar` türüdür (her zaman `KOYU_TEMA`, Arapça yok, meal %36–%80 bandında = Kısayollar eyleminin düzeni).
- **Arapça yazı tipi uygulamada `assets/fonts/AmiriQuran-Regular.ttf`** (+ `OFL.txt`), `expo-font` `useFonts` ile çalışma anında yüklenir (native değişiklik yok); jest `\.(ttf|otf)$`'i taklide eşler.
- **Tanzil bağlantısı sabit adresle doğrudan açılır, `guvenilirBaglantiMi`'ye EKLENMEZ:** o liste güncelleme APK indirmelerinin güven listesidir; genişletmek indirme güvenini de genişletirdi.
- **Duvar kâğıdı anahtarı yalnız onaydan sonra `acik: true` yazar** (`BildirimModali`, fıkıh notu içerikte); ardından `duvarKagidiniSimdiUygula`, `false` → "yerleştirilemedi" bilgi satırı. `durum().izinli === false` → anahtar soluk + neden. Yer/zemin/Arapça değişimi kaydedip hemen uygular; önizleme kayıtlı yükü okur.
- **iPhone rehberi Kısayollar eyleminin tam adını YAZMAZ** ("Duvar kâğıdı diye aratın"): eylemin adı iOS sürümüyle değişti ("Set Wallpaper" → "Set Wallpaper Photo"), Türkçe adı resmî kaynakta doğrulanamadı. "Kısayollar'ı açın" `shortcuts://` açar. Hazır kısayol (iCloud) bağlantısı YOK: sahibin cihazında üretilmesi gerekir.
- **Widget tek dokunuşla eklenir (Android):** `WidgetVeri.gununAyetiWidgetiniSabitle()` → `requestPinAppWidget` (API 26+, başlatıcının onay penceresi); `widgetSabitlemeDestekleniyorMu()` false ise düğme çizilmez, elle ekleme tarifi kalır.
- **Emülatör kareleri:** özellik turu `24-gunun-ayeti` (sayfa, önceki günler, ayar, onay) ve `25-gunun-ayeti-cihaz` (yalnız telefon: widget ekleme penceresi 63, duvar önizlemesi 64, ana ekranda widget 65, kilit ekranı 66). Kilit ekranı karesi Maestro'da değil `android-ozellik-hatti.sh` `hazirlik_bitir gunun-ayeti-cihaz` içinde adb ile (ekran kapat/aç → screencap → `wm dismiss-keyguard`); tus kilidi `locksettings set-disabled false` ile açılır.
- Nöbetçiler: `GununAyetiSayfasi.test.tsx`, `GununAyetiAyarlariSayfasi.test.tsx` (onaysız açılmaz, engelli/başarısız durum metni, iki dilde Türkçe kalmaz).

## Android
Katmanlar: saf `cekirdek/GununAyeti.kt` (yük çözümü, `gecerliKayit`, `sonrakiSinirMs`, düzen adayları, duvar bandı/renkleri/imzası; JVM testi `GununAyetiTest` + fikstür `android/app/src/test/resources/gunun-ayeti-ornek.json` — yük şeması değişirse fikstürü de değiştir) → `widget/GununAyeti*` (widget) ve `duvar/` (duvar kâğıdı) → köprüler `WidgetVeri.gununAyetiKaydet(json)`, `WidgetVeri.gununAyetiWidgetEkliMi()`, `DuvarKagidi.durum()/simdiUygula()/onizlemeUret(g, y)`.

### JS'in çağırması gerekenler
- **`WidgetVeri.gununAyetiKaydet(json)`** — her plan yazımında. Çözülemeyen yük YAZILMAZ (eski yük kalır, logda uyarı). Yazınca widget'lar çizilir, sınır alarmı kurulur, `duvar.acik` ise duvar kâğıdı İMZASI değiştiyse arka planda yazılır. Aynı yükü tekrar yazmak duvar kâğıdını yeniden YAZMAZ.
- **`DuvarKagidi.durum()`** → `{ izinli: boolean, sonHata: "yazilamadi" | null }`. `izinli` false → ayar satırı "Kullanılamıyor" + açıklama (iş/okul yönetimi). `sonHata` → "Bugünün görseli yerleştirilemedi…" bilgi satırı; başarılı yazımda silinir.
- **`DuvarKagidi.simdiUygula()`** → `boolean`; ayar ekranının sonuç kapısıdır, imzaya UYAR (aynı imza = yazmadan `true`). Yükü yazmak (`acik: true`) zaten aynı sıralı kuyrukta uygular; ardından gelen `simdiUygula` imzayı yok saysaydı kilit ekranı iki kez yazılırdı. İlk yazım başarısızsa imza kaydedilmez, `simdiUygula` yeniden dener ve gerçek sonucu döndürür.
- **`DuvarKagidi.onizlemeUret(genislik, yukseklik)`** → `file://…png` (önbellek, her çağrıda yeni ad, eskiler silinir) ya da `null` (yük yok). Yer `ana` ise ana ekran görseli, değilse kilit görseli. Önizleme KAYITLI yükün `duvar`'ını okur (ayrı depolama yok): kaydedilmemiş bir zemin/Arapça seçimini önizlemek için önce yük yazılır ve `acik: true` ise bu yazım duvar kâğıdını da DEĞİŞTİRİR — ayar ekranı bunu bilerek kurulmalı. `acik: true` yalnız onay penceresinden SONRA yazılır.
- Derin bağlantı `namazakisi://gunun-ayeti` (widget dokunuşu, MainActivity açık bileşen) JS navigasyonunda karşılanmalı.

### Widget (`GununAyetiWidget`, #380)
- **Namaz widget'larının `WidgetGuncelleyici.SAGLAYICILAR` listesine GİRMEZ:** o liste namaz çizimini, `widgetEkliMi` sayımını ve namaz sınır alarmının iptal sayımını besler. Ayrı kapı `GununAyetiGuncelleyici` (kendi `SAGLAYICILAR`, kendi alarmı: requestCode `0x41594501`, eylem `GUNUN_AYETI_SINIRI`). Sağlayıcı `NamazWidgetSaglayicisi`'nden türemez (onun `onUpdate`'i namaz çizer). Sınıf adı DEĞİŞTİRİLMEZ.
- **Alarm:** planın bir sonraki `baslangicMs`'ine TEK alarm (`SinirAlarmi` yöntemi). Yalnız widget varken `RTC` (uyandırmaz); `duvar.acik` ise `RTC_WAKEUP` + `setExactAndAllowWhileIdle` (izin yoksa `setAndAllowWhileIdle`): kilit ekranı kişi uyanmadan hazır olsun, günde bir uyanma. Widget yok ve duvar kapalıysa alarm iptal. Plan bittiyse alarm yok (son kayıt kalır). Periyodik iş / WorkManager YOK.
- **Sistem olayları** (`TIME_SET`, `TIMEZONE_CHANGED`, `DATE_CHANGED`, `BOOT_COMPLETED`, `MY_PACKAGE_REPLACED`) için manifest filtresi ikinci kez yazılmadı: `NamazWidgetAlarmAlici` bunları paket içi açık yayınla `GununAyetiAlarmAlici`'ye (`exported=false`) iletir; duvar kâğıdı işi orada `goAsync()` + tek iş parçacıklı yürütücüde.
- **Arapça satır RemoteViews'ta BEYAZ resimdir** (Amiri Quran `assets`'ten `Typeface`; RemoteViews pakete gömülü font kullanamaz), rengi `setImageTintList`/`setColorFilter` ile: Material You/gece modu başlatıcıda çözülür. Bitmap bütçesi (ekran × 4 × 1,5 bayt) boyut sayısına bölünür; aşan aday "sığmıyor" sayılır (Android 17'de aşım hata atar). Ekran okuyucu kökte ayetin TAMAMINI duyar (`erisimMetni`: etiket, meal ya da Arapça, künye), "dokunun" kartında da.
- **Sığma kararı ÖLÇÜMLE** (`StaticLayout`, `TypedValue.applyDimension(SP)` → sistem yazı ölçeği dahil), harf sayısıyla değil. Ölçü sayıları KODDA (`GununAyetiCizici.olcu`) ve çizime de oradan verilir (`setTextViewTextSize`, `setViewPadding`); XML yalnız iskelet. Metin `TextView`'leri XML'de `android:fontFamily="sans-serif"` (başlatıcı teması fontu değiştirmesin), ölçüm de aynı aileyle. API 31+ widget'ın GERÇEK boyutları (`OPTION_APPWIDGET_SIZES`) için ayrı ölçülür ve `RemoteViews(Map<SizeF,…>)`; öncesi dikey (MIN_WIDTH×MAX_HEIGHT) / yatay çift. Boyut değişince `onAppWidgetOptionsChanged` yeniden ölçer.
- **Düzen sırası** (`AyetDuzenSecici.adaylar`): yükseklik <100 dp → şerit (≤2 satır meal; Arapça yok); genişlik <230 dp → kare (meal ya da "hat" seçiliyse yalnız Arapça ≤3 satır, sığmazsa kısaltma yerine "dokunun"); yükseklik ≥260 dp → 4×3 (büyük yazı + tarih satırı → büyük meal → 4×2 yazısıyla Arapça+meal → meal); aksi 4×2 (Arapça ≤2 satır + meal → meal). Hiçbiri sığmazsa "dokunun" kartı (`kisaKunye` + `metin.sigmiyor` + `metin.acin`); meal "…" ile KESİLMEZ, yalnız künye satırı sonda kesilebilir. **Meal yoksa** (meali olmayan dil) her boyutta yalnız Arapça; şeritte tek satır sığarsa, değilse "dokunun".
- **Tema ve ayar mevcut widget'larla ORTAK:** `WidgetYapilandirmaActivity` + `WidgetAyari` (zemin, opaklık; `widgetFeatures=reconfigurable|configuration_optional`). Ayet widget'ında vakit seçenekleri gizlenir, iki seçenek görünür: `WidgetZemini.PALET` ("Uygulama rengi (açık ton)": `duvar.paletRenk`'in beyazla %78 karışımı, koyu metin; `DuvarKagidiKurallari.widgetPaleti`) ve kare boyut içeriği meal/hat (`GununAyetiDeposu.icerik`, `ayet_icerik_<id>`). Namaz widget'ı `PALET`'i görürse açık palete düşer.
- Tarih satırı (4×3) yükün dilinde `DateFormat.LONG` ("24 Ekim 2026"); veri yokken kart "Günün ayeti · Uygulamayı açın" (native kaynak metni). Yük `namazakisi_widget` prefs'inde `gunun_ayeti` anahtarında (`GununAyetiDeposu`).

### Duvar kâğıdı (`duvar/`, #381)
- **`WallpaperManager.setBitmap(bmp, null, true, FLAG_LOCK | FLAG_SYSTEM)`**, izin `SET_WALLPAPER` (normal izin, kurulumda sorulmaz; manifestte `tools:node="remove"` YOK). `isWallpaperSupported && isSetWallpaperAllowed` false → yazılmaz, `sonHata`. `setBitmap` 0 dönerse hata sayılır. Ön plan servisi, WorkManager, pil muafiyeti, depolama izni YOK; yeni Gradle bağımlılığı YOK.
- **İDEMPOTENT — imza (`GununAyetiKurallari.duvarImzasi`: gün, ref, Arapça, meal, künye, kaynaklar, yer, zemin, arapca, paletRenk):** son BAŞARILI yazımla aynıysa yazılmaz. Gerekçe: yük her açılışta/konum değişiminde/arka plan turunda yazılır; her `setBitmap` kilit ekranını titretir ve Material You renklerini yeniden türetir.
- **Yer:** `kilit` → FLAG_LOCK (kilit görseli), `ana` → FLAG_SYSTEM (ana görsel), `ikisi` → önce ana, sonra kilit (kilit en son yazılır). Mevcut duvar kâğıdı SAKLANMAZ (Android 14+ okunamaz): kapatınca ya da yer değişince eski ekrandaki ayet görseli kalır (geri yükleme yok, onay penceresi bunu söyler).
- **Çizim** (`DuvarKagidiCizici`, ekranın GERÇEK boyutu, dikey): tasarım tuvali 412 px genişliğe göre ölçeklenir. **Kilit: metin bandı %64–%82** (Android 14+ büyük kilit saati bildirim yokken ~%28–%62'yi kaplar, üstteki yıldız süsü saate değmesin diye ~%2 pay, kilit simgesi ~%84'ten başlar; emülatör karesi 66 ile ölçüldü), blok bandın ortasında, atıf bandın altında. iPhone'da saat üstte olduğundan Kısayollar görseli %36–%80'de kalır. Ana: bant %9–%34, yazı ×0,75, üstten başlar. Meal Noto Serif 24 px (Arapça varken 17), Arapça Amiri Quran 28 px (`duvar.arapca` ya da meal yoksa), künye `kisaKunye` OLDUĞU GİBİ (büyük harfe çevrilmez), ATIF satırı her görselde (`atifSatiri`: meal kaynağı + Arapça görünüyorsa Arapça kaynağı). Sığmazsa yazı %6 adımlarla ×0,6'ya kadar küçülür, yine sığmazsa Arapça düşer ve Arapçasız blok için küçültme baştan yeniden dener. Zeminler: gece `#14211A`, kâğıt `#F3F1EA`, palet = `paletRenk` (açık/koyu metin kontrasta göre; orta tonlu palet 4,5:1'i tutana kadar koyulaştırılır). Silik büyük sekiz köşeli yıldız süsü (metin değil).

**Cihazda DOĞRULANMADI:** başlatıcının `sans-serif` ölçümüyle birebir aynı satır kırdığı (4 dp güvenlik payı var); Samsung/One UI başlatıcısında boyut haritası; Arapça resmin tint'i (API < 31 `setColorFilter`); arka planda `setBitmap`'in her cihazda çalıştığı; yalnız FLAG_SYSTEM yazımında sistemin ortak görseli kilide taşıdığı (AOSP `migrateSystemToLockWallpaperLocked`); Samsung dinamik kilit ekranının ezip ezmediği; Doze'da `setAndAllowWhileIdle` gecikmesi; Material You renklerinin her gün yeniden türetilmesinin kullanıcıyı rahatsız edip etmediği. Android katmanı yerelde Robolectric `android-all` (API 34) + kök sınıflarla DERLENDİ (çalıştırılmadı); asıl doğrulama `android-build.yml`.

## iOS
- **Yük App Group'ta `namazakisi_gunun_ayeti`** (`SiriDeposu.gununAyetiYaz/gununAyeti`); köprü `ExpoSiriKisayollari.gununAyetiKaydet(json)` (TS: `siriVeriYazici()?.gununAyetiKaydet?.(json)`, eski ikilide yok) yazar ve YALNIZ `GununAyetiWidget` türünü tazeler (`reloadTimelines(ofKind:)`; `reloadAllTimelines` vakit widget'ının bütçesini yerdi). Olay anahtarı değil → `gocEt`'e girmez.
- **Saf karar `GununAyetiKarari` `WidgetKarari.swift` İÇİNDE** (yeni pod dosyası `POD_KOPYALARI`'na ve CI swiftc listesine ayrıca girmek zorunda kalırdı): `coz` (v≠1 / bozuk / boş plan → nil), `gecerliKayit` (`baslangicMs <= şimdi` son kayıt; plan bitince son, hiçbiri başlamadıysa ilk), `girdiler`, `kunyeSatiri`. Linux Swift testi `modules/expo-siri-kisayollari/test/main.swift` §10.
- **Widget `targets/widget/GununAyetiWidget.swift`:** aileler small, medium, large, accessoryRectangular. Zaman çizelgesi = şimdiki kayıt + gelecekteki her kayıt kendi `baslangicMs`'inde, `.atEnd`; gelecek kayıt yoksa `.never` (tek girdili `.atEnd` boşa yeniden yükleme döngüsü kurardı; JS her yazımda tazeler). Meal KESİLMEZ: `ViewThatFits(in: .vertical)` ile adım adım (büyük: tarih + Arapça + meal → yalnız meal → "dokunun" kartı; orta: meal → kart; küçük: etiketli meal → etiketsiz meal → kart; kilit: etiket + meal → meal → etiket + `kisaKunye`). `meal == nil` → Arapça (kilit ekranında `kisaKunye`). Arapça çizildiğinde künyeye `arapcaKaynagi` eklenir. Galeri adı ve "yük yok" metni yükte olmadığından widget'ta küçük tr/en tablosudur (`GununAyetiYerelMetinleri`).
- **Font:** `targets/widget/fontlar/AmiriQuran-Regular.ttf` (+ `OFL.txt`; PostScript adı `AmiriQuran-Regular`), `withNamazWidget` uzantının Resources fazına ve Info.plist `UIAppFonts`'a ekler (nöbetçi `withNamazWidget.test.ts`). Ana uygulamaya EKLENMEZ: görsel intent'i Arapça çizmez.
- **Duvar kâğıdı:** `targets/siri-kisayollari/GununAyetiGorseliIntent.swift` ("Günün ayeti görseli" / "Verse of the day image", `AppShortcutsProvider`'da 4/10) `IntentFile` (PNG) döndürür: ekranın dikey piksel boyutu (`nativeBounds`/`nativeScale`), koyu zemin, meal %36–%80 bandında, künye + meal kaynağı satırı ZORUNLU, Arapça HİÇ çizilmez (iOS `duvar`'ı yok sayar). Meal yoksa gövde `kisaKunye` (bugün erişilemez: tr ve en'in meali var). Yük yoksa "uygulamayı bir kez açın" hatası. Rehber kullanıcıya Kısayollar'da "Günün ayeti görseli" → duvar kâğıdı fotoğrafını ayarlayan eylem kısayolunu ve imsaktan sonraki bir saate "Günün Saati" otomasyonunu kurdurur. Otomasyon imsakı izleyemez: imsaktan önce çalışırsa dünün ayetini koyar.
- **CI açığı:** `ios-siri-derleme.yml` Metadata denetim listesinde `GununAyetiGorseliIntent` YOK (workflow değişikliği sahibe soruldu); derleme yine yakalar.
- **Cihazda DOĞRULANMADI:** `UIAppFonts`'un WidgetKit uzantısında Amiri Quran'ı çözdüğü; `ViewThatFits` adımlarının %130+ yazı boyutunda doğru inişi; plan bitince `.never` ile son kaydın kaldığı; arka planda başlatılan uygulamada `ImageRenderer`'ın PNG ürettiği ve boyutun duvar kâğıdı kırpmasıyla uyumu; "Duvar Kâğıdını Ayarla"nın `IntentFile`'ı kabul ettiği. Swift'in yalnız saf kısmı Linux'ta derlendi; SwiftUI dosyaları yalnız `swiftc -parse` (tip denetimi macOS CI'da).
