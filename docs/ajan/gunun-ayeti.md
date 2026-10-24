# Günün ayeti: widget ve duvar kâğıdı (#380, #381)

Ne zaman okunur: günün ayeti havuzuna/üreticisine, ayet widget'ına (Android, iOS), duvar kâğıdına, "Günün ayeti" sayfasına ya da ayarına dokunuyorsan. (#382 dinamik ikon sahip kararıyla YAPILMADI.)

## Sahip kararları (2026-10-24)
- **Yalnız ayet; hadis EKLENMEZ.** İçerik ayarı yok.
- **Gün imsakta değişir** (namaz günü). Aynı gün her dilde aynı ayet.
- **Havuz kuralları:** meal her dilde en çok 200 harf; dipnot işaretli, önceki ayetin cümlesini sürdüren, yalnız Peygamber'e hitap eden ve vakte özgü ayet girmez; İsrâ 17/79 yok.
- **Duvar kâğıdında Arapça varsayılan KAPALI.** Fıkıh notu ("Bazı âlimler, ekranında ayet görünen telefonla lavaboya girilmemesini tavsiye eder.") duvar kâğıdını açarken onay penceresinde ve Arapça satırının altında gösterilir.
- **iOS'ta duvar kâğıdı uygulamadan değiştirilemez** (genel API yok): Kısayollar rehberi + App Intent.
- Tasarım tuvali (sahip onaylı): https://claude.ai/artifact/2HqCS9y8CWfv9dWDkT6ut6

## Kaynaklar ve lisans
- **Arapça: Tanzil Uthmani 1.1, birebir; değiştirilemez.** Gösterildiği her yerde "Tanzil" kaynağı ve tanzil.net bağlantısı (sayfada). Tanzil txt çıktısı sûrelerin 1. ayetine besmele ekler (1 ve 9 hariç) → 1. ayetler havuza girmez.
- **Mealler: QuranEnc `turkish_rwwad`, `english_saheeh`, birebir ve KESİLMEDEN; yayımcı + "QuranEnc <sürüm>" her yüzeyde.** QuranEnc User-Agent başlığı olmadan 403 döner (üretici gönderir). Yeni sürümde `node scripts/icerik/gunun-ayeti-uret.js` yeniden koşar; nöbetçi `gununAyetiHavuzu.test.ts` kuralları veride yeniden denetler.
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
- Widget'a dokunma uygulamada "Günün ayeti" sayfasını açar: derin bağlantı `namazakisi://gunun-ayeti`.

## Android
Katmanlar: saf `cekirdek/GununAyeti.kt` (yük çözümü, `gecerliKayit`, `sonrakiSinirMs`, düzen adayları, duvar bandı/renkleri/imzası; JVM testi `GununAyetiTest` + fikstür `android/app/src/test/resources/gunun-ayeti-ornek.json` — yük şeması değişirse fikstürü de değiştir) → `widget/GununAyeti*` (widget) ve `duvar/` (duvar kâğıdı) → köprüler `WidgetVeri.gununAyetiKaydet(json)`, `WidgetVeri.gununAyetiWidgetEkliMi()`, `DuvarKagidi.durum()/simdiUygula()/onizlemeUret(g, y)`.

### JS'in çağırması gerekenler
- **`WidgetVeri.gununAyetiKaydet(json)`** — her plan yazımında. Çözülemeyen yük YAZILMAZ (eski yük kalır, logda uyarı). Yazınca widget'lar çizilir, sınır alarmı kurulur, `duvar.acik` ise duvar kâğıdı İMZASI değiştiyse arka planda yazılır. Aynı yükü tekrar yazmak duvar kâğıdını yeniden YAZMAZ.
- **`DuvarKagidi.durum()`** → `{ izinli: boolean, sonHata: "yazilamadi" | null }`. `izinli` false → ayar satırı "Kullanılamıyor" + açıklama (iş/okul yönetimi). `sonHata` → "Bugünün görseli yerleştirilemedi…" bilgi satırı; başarılı yazımda silinir.
- **`DuvarKagidi.simdiUygula()`** → `boolean`; imza ve `duvar.acik` denetlenmez (kullanıcı istedi). Açma onayından SONRA önce yükü `acik: true` ile yaz: kaydet zaten uygular; `simdiUygula` "şimdi yenile" içindir.
- **`DuvarKagidi.onizlemeUret(genislik, yukseklik)`** → `file://…png` (önbellek, her çağrıda yeni ad, eskiler silinir) ya da `null` (yük yok). Yer `ana` ise ana ekran görseli, değilse kilit görseli. Önce yükü yaz, sonra önizle.
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
- **Çizim** (`DuvarKagidiCizici`, ekranın GERÇEK boyutu, dikey): tasarım tuvali 412 px genişliğe göre ölçeklenir. Kilit: metin bandı %36–%80, blok bandın ortasında, atıf bandın altında. Ana: bant %9–%34, yazı ×0,75, üstten başlar. Meal Noto Serif 24 px (Arapça varken 17), Arapça Amiri Quran 28 px (`duvar.arapca` ya da meal yoksa), künye `kisaKunye` OLDUĞU GİBİ (büyük harfe çevrilmez), ATIF satırı her görselde (`atifSatiri`: meal kaynağı + Arapça görünüyorsa Arapça kaynağı). Sığmazsa yazı %6 adımlarla ×0,6'ya kadar küçülür, yine sığmazsa Arapça düşer. Zeminler: gece `#14211A`, kâğıt `#F3F1EA`, palet = `paletRenk` (açık/koyu metin kontrasta göre; orta tonlu palet 4,5:1'i tutana kadar koyulaştırılır). Silik büyük sekiz köşeli yıldız süsü (metin değil).

**Cihazda DOĞRULANMADI:** başlatıcının `sans-serif` ölçümüyle birebir aynı satır kırdığı (4 dp güvenlik payı var); Samsung/One UI başlatıcısında boyut haritası; Arapça resmin tint'i (API < 31 `setColorFilter`); arka planda `setBitmap`'in her cihazda çalıştığı; yalnız FLAG_SYSTEM yazımında sistemin ortak görseli kilide taşıdığı (AOSP `migrateSystemToLockWallpaperLocked`); Samsung dinamik kilit ekranının ezip ezmediği; Doze'da `setAndAllowWhileIdle` gecikmesi; Material You renklerinin her gün yeniden türetilmesinin kullanıcıyı rahatsız edip etmediği. Android katmanı yerelde Robolectric `android-all` (API 34) + kök sınıflarla DERLENDİ (çalıştırılmadı); asıl doğrulama `android-build.yml`.

## iOS
- Widget uzantısı Amiri Quran'ı `UIAppFonts` ile taşır. Aileler: small, medium, large, accessoryRectangular (kilit ekranı; Arapça yok).
- Duvar kâğıdı: App Intent "Günün ayeti görseli" `IntentFile` (PNG) döndürür; rehber kullanıcıya Kısayollar'da "Günün ayeti görseli" → "Duvar Kâğıdını Ayarla" kısayolunu ve imsaktan sonraki bir saate "Günün Saati" otomasyonunu kurdurur. Otomasyon imsakı izleyemez: imsaktan önce çalışırsa dünün ayetini koyar.
