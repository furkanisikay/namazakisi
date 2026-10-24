#!/usr/bin/env bash
# Android TV vakit panosunun Play magaza karelerini emulatorde ceker (1920x1080).
# android-ekran-goruntuleri.yml icinden `bash scripts/tv-kare-hatti.sh` ile cagrilir.
#
# Tek bash betigi: emulator-runner `script` girdisinin her satirini ayri `sh` ile
# calistirir (telefon hatti dersi).
#
# DOLASMA: yalniz D-pad tus olaylari. Pano saniyede bir cizildigi icin
# `uiautomator dump` "idle" beklerken bos doner (telefon hattindaki geri sayim
# dersinin aynisi); odak sirasi bilinen ekranlarda tus dizisi yeterli, koordinat gerekmez.
set -euo pipefail

PAKET="com.furkanisikay.namazakisi"
SINIF="$PAKET.tv"
CIKIS="kareler-tv"
mkdir -p "$CIKIS"

APK=$(find tv/app/build/outputs/apk/debug -name '*.apk' | head -1)
[ -z "$APK" ] && { echo "TV debug APK bulunamadi"; exit 1; }

adb wait-for-device
bash scripts/emulator-hazir-bekle.sh
adb shell getprop ro.build.version.release
adb shell wm size
adb shell settings put system time_12_24 24 || true
adb shell settings put global hide_error_dialogs 1 || true
adb shell svc power stayon true || true
adb install -r "$APK"

# Saat DEGISTIRILEMEZ (android-tv imaji production build: adb root yok, olculdu). Sessiz bant
# karesi yalniz Kadikoy'de bir vaktin son 30 dakikasindaysak cikar: hat o pencerede calistirilir.

kare() {
  local ad="$1"
  sleep "${2:-2}"
  adb exec-out screencap -p > "$CIKIS/$ad.png"
  if [ ! -s "$CIKIS/$ad.png" ]; then
    echo "UYARI: $ad bos cikti"
    rm -f "$CIKIS/$ad.png"
    return 1
  fi
  echo "kare: $CIKIS/$ad.png"
}
tus() { adb shell input keyevent "$1"; sleep "${2:-1}"; }

# --- Tohum: il secimi atlanir (Istanbul, plaka 34) ---
adb shell am force-stop "$PAKET"
cat > /tmp/namazakisi_tv.xml <<XML
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="il_plaka">34</string>
</map>
XML
adb push /tmp/namazakisi_tv.xml /data/local/tmp/namazakisi_tv.xml
adb shell run-as "$PAKET" mkdir -p shared_prefs
adb shell run-as "$PAKET" cp /data/local/tmp/namazakisi_tv.xml shared_prefs/namazakisi_tv.xml

# --- 01: pano (odak yokken; "Konumu değiştirin" dugmesi sakin gorunur) ---
adb shell am start -W -n "$PAKET/$SINIF.ui.PanoActivity"
kare 01-pano 6 || true

# --- 02-04: cihaz agi v2 UCTAN UCA (telefonu taklit eden SIFRELI istemci, curl DEGIL).
# Pano -> "Ayarlar" -> "Telefon ekleyin" (ilk odak) -> QR. Debug derleme QR metnini loga yazar
# (TvSunucusu); port host'a adb forward ile acilir. Istemci /esle (202) yollar, TV kumandayla
# "Bu telefonu ekleyelim mi?" sorar (03), DPAD_CENTER = "Ekleyin"; istemci onayi /esle-durum ile
# alir, ilk sifreli esitlemeyi yollar (konum + kilinmamis vakit + bant acik) -> eklendi sahnesi
# ve pano (sessiz bant ancak secilen ilde vaktin son dakikalarindaysak gorunur).
ISTEMCI="node scripts/tv/tv-esitleme-istemci.js"
UYELIK=/tmp/tv-uyelik.json
rm -f "$UYELIK"
adb logcat -c || true
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
kare 02-tv-ayarlar-bos 1 || true
tus KEYCODE_DPAD_CENTER 3
kare 02-esleme-qr 2 || true

QR=$(adb logcat -d -s TvEsleme:D | grep -o 'namazakisi://tv?[^ ]*' | tail -1 || true)
if [ -n "$QR" ]; then
  PORT=$(echo "$QR" | sed -n 's/.*[?&]p=\([0-9]*\).*/\1/p')
  echo "QR (v2): port=$PORT"
  adb forward tcp:47555 "tcp:$PORT"
  $ISTEMCI esle "$QR" 47555 "$UYELIK" > /tmp/tv-esle.log 2>&1 &
  ESLE_PID=$!
  for _ in $(seq 1 20); do grep -q ISTEK_GONDERILDI /tmp/tv-esle.log && break; sleep 0.5; done
  cat /tmp/tv-esle.log
  kare 03-onay-soruluyor 1.5 || true
  # Uygulama çöktüyse nedeni loga düşsün (kare hattı aksi halde yalnız "socket hang up" görür).
  adb logcat -d -b crash 2>/dev/null | grep -m1 -A20 "FATAL EXCEPTION" || true
  tus KEYCODE_DPAD_CENTER 0
  wait "$ESLE_PID" || echo "UYARI: eslestirme basarisiz"
  cat /tmp/tv-esle.log
  if [ -s "$UYELIK" ]; then
    $ISTEMCI esitle 47555 "$UYELIK" bant || echo "UYARI: ilk esitleme basarisiz"
    kare 04-eklendi-sahne 0.8 || true
    kare 04-pano-telefondan 5 || true
    $ISTEMCI esitle 47555 "$UYELIK" ramazan || echo "UYARI: ramazan esitlemesi basarisiz"
    kare 04-pano-ramazan 3 || true
    tus KEYCODE_DPAD_DOWN
    tus KEYCODE_DPAD_CENTER 3
    kare 04-tv-ayarlar-uyeler 1 || true
    tus KEYCODE_BACK 2
    # Guvenlik kapilari: yanlis anahtar ve tekrarlanan sayac -> ikisi de sessiz 403.
    $ISTEMCI redler 47555 "$UYELIK" || echo "UYARI: ret kapilari beklendigi gibi degil"
  fi
else
  echo "UYARI: QR logda bulunamadi (TV ag adresi yok mu?)"
  adb logcat -d -s TvEsleme:D | tail -5 || true
fi

# --- 05-07: kodla giris (ag yok yedegi). Pano -> Ayarlar -> "Konumu kodla girin". ---
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.PanoActivity"
sleep 4
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 2
for r in 1 6 8 4; do tus "KEYCODE_$r" 0.4; done
kare 05-kod-giris 1 || true
# Yanlis son hane: kutular titrer, kenarlar kirmizi, yonlendirici metin.
for r in 8 9 3; do tus "KEYCODE_$r" 0.3; done
kare 06-kod-hata 0.2 || true
tus KEYCODE_DEL 0.5
tus KEYCODE_2 0
kare 07-kod-basari 1.1 || true
sleep 4

# --- 08: il secimi (Ayarlar > "Ili kendim seceyim") ---
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
kare 08-il-secimi 2 || true
tus KEYCODE_BACK 2

# --- 09: ekran koruyucu (Daydream; en iyi gayret) ---
adb shell am force-stop "$PAKET"
adb shell settings put secure screensaver_enabled 1 || true
adb shell settings put secure screensaver_components "$PAKET/$SINIF.ui.PanoDreamServisi" || true
adb shell settings put secure screensaver_activate_on_sleep 1 || true
# IDreamManager.dream() = islem 1; olmazsa SystemUI'nin "Somnambulator"u.
adb shell service call dreams 1 || adb shell am start -n com.android.systemui/.Somnambulator || true
sleep 5
if adb shell dumpsys dreams 2>/dev/null | grep -q "PanoDreamServisi"; then
  kare 09-ekran-koruyucu 3 || true
else
  echo "UYARI: ekran koruyucu baslatilamadi"
  adb shell dumpsys dreams 2>/dev/null | head -30 || true
fi

# --- VIDEO: D-pad odak hareketi (odak halkası + büyüme, il ızgarası), en gayret ---
# Emulator `disable-animations: true` ile açılır; kayıt için animator ölçeği yalnız
# burada 1 yapılır. Vakit değişimi geçişi (zemin 600 ms) zamana bağlı olduğu için
# kayda alınamaz; yalnız kullanıcı olayıyla başlayan odak geçişleri kaydedilir.
VIDEO="videolar-tv"
mkdir -p "$VIDEO"
adb shell input keyevent KEYCODE_WAKEUP || true
adb shell settings put global animator_duration_scale 1 || true
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.PanoActivity"
sleep 5
adb shell rm -f /sdcard/odak.mp4 || true
adb shell screenrecord --time-limit 12 /sdcard/odak.mp4 &
KAYIT=$!
sleep 1.5
tus KEYCODE_DPAD_DOWN 1.5
tus KEYCODE_DPAD_CENTER 2.5
tus KEYCODE_DPAD_RIGHT 1
tus KEYCODE_DPAD_DOWN 1
tus KEYCODE_BACK 2
wait "$KAYIT" || true
sleep 1
if adb pull /sdcard/odak.mp4 "$VIDEO/tv-odak.mp4" >/dev/null 2>&1 && [ -s "$VIDEO/tv-odak.mp4" ]; then
  echo "video: $VIDEO/tv-odak.mp4"
else
  echo "UYARI: tv odak videosu alinamadi"
fi
adb shell settings put global animator_duration_scale 0 || true

ls -la "$CIKIS"
