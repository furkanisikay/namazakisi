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
- **Fontlar:** Arapça Amiri Quran (OFL 1.1), meal Noto Serif (OFL). KFGQPC Uthmanic HAFS özel lisanslıdır, PAKETLENMEZ.

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
- **Arapça satır RemoteViews'ta resim (bitmap) olarak çizilir:** RemoteViews/Glance pakete gömülü font kullanamaz. Amiri Quran `assets`'ten `Typeface`; `setContentDescription` ile ekran okuyucuya meal + künye. Bitmap toplamı sınırlı (ekran genişlik × yükseklik × 4 × 1,5 bayt; Android 17'de aşım hata atar).
- **Sığma kararı ÖLÇÜMLE** (`StaticLayout`), harf sayısıyla değil: sistem yazı boyutu %130'da meal büyür, Arapça resim büyümez. Düzen boyuttan: 4×2 Arapça + meal (Arapça iki satırı aşarsa yalnız meal), 4×3 büyük, 2×2 meal, 2×2 hat (yalnız Arapça), 4×1 şerit (iki satır meal); sığmayan düzen "dokunun" kartına iner, "…" ile KESME YOK.
- **Duvar kâğıdı:** `WallpaperManager.setBitmap(…, FLAG_LOCK|FLAG_SYSTEM)`, izin `SET_WALLPAPER` (normal izin, kurulumda sorulmaz). `isSetWallpaperAllowed()` false ise ekranda "Kullanılamıyor" satırı. Android 14+ mevcut duvar kâğıdı okunamaz → geri yükleme YOK, açarken onay. Yenileme WorkManager tek seferlik iş, planın bir sonraki `baslangicMs`'ine; ön plan servisi, pil muafiyeti, depolama izni YOK. Metin bandı ekranın %36–%80'i (saat ve parmak izi alanı dışı). Arka planda `setBitmap`'in her cihazda çalıştığı ve Samsung dinamik kilit ekranının ezip ezmediği **cihazda doğrulanmadı**.

## iOS
- Widget uzantısı Amiri Quran'ı `UIAppFonts` ile taşır. Aileler: small, medium, large, accessoryRectangular (kilit ekranı; Arapça yok).
- Duvar kâğıdı: App Intent "Günün ayeti görseli" `IntentFile` (PNG) döndürür; rehber kullanıcıya Kısayollar'da "Günün ayeti görseli" → "Duvar Kâğıdını Ayarla" kısayolunu ve imsaktan sonraki bir saate "Günün Saati" otomasyonunu kurdurur. Otomasyon imsakı izleyemez: imsaktan önce çalışırsa dünün ayetini koyar.
