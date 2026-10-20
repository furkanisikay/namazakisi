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
adb shell getprop ro.build.version.release
adb shell wm size
adb shell settings put system time_12_24 24 || true
adb shell settings put global hide_error_dialogs 1 || true
adb shell svc power stayon true || true
adb install -r "$APK"

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

# --- 02: eslestirme (panodaki "Konumu degistirin" -> "Vakitleri telefonunuzdan alin", QR) ---
adb logcat -c || true
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
kare 02-esleme-qr 2 || true

# --- 03-04: QR yolu UCTAN UCA (telefonu taklit eden curl). Debug derleme QR metnini
# loga yazar (EslemeEkrani); port host'a adb forward ile acilir. Sahne: QR karelerinin
# katlanmasi (03a/03b), sonra gelen konumla pano (04).
QR=$(adb logcat -d -s TvEsleme:D | grep -o 'namazakisi://tv?[^ ]*' | tail -1 || true)
if [ -n "$QR" ]; then
  PORT=$(echo "$QR" | sed -n 's/.*[?&]p=\([0-9]*\).*/\1/p')
  ANAHTAR=$(echo "$QR" | sed -n 's/.*[?&]k=\([0-9a-f]*\).*/\1/p')
  echo "QR: port=$PORT"
  adb forward tcp:47555 "tcp:$PORT"
  GOVDE="{\"v\":1,\"k\":\"$ANAHTAR\",\"ad\":\"Kadıköy, İstanbul\",\"lat\":40.9903,\"lng\":29.0291}"
  # Yanlis anahtar once: TV reddetmeli (403) ve ekran degismemeli.
  RED=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    --data '{"v":1,"k":"ffffffffffffffff","ad":"X","lat":40,"lng":29}' http://127.0.0.1:47555/esle || true)
  echo "yanlis anahtar yaniti: $RED (beklenen 403)"
  (sleep 0.1; curl -s -X POST -H 'Content-Type: application/json; charset=utf-8' --data "$GOVDE" \
    http://127.0.0.1:47555/esle; echo) &
  kare 03-qr-katlaniyor 0.6 || true
  kare 03-qr-konum-geldi 1.0 || true
  wait || true
  kare 04-pano-telefondan 4 || true
else
  echo "UYARI: QR logda bulunamadi (TV ag adresi yok mu?)"
  adb logcat -d -s TvEsleme:D | tail -5 || true
fi

# --- 05-07: kodla giris (ag yok yedegi). Pano -> esleme -> "Kodla girin" (ilk odak). ---
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.PanoActivity"
sleep 4
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
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

# --- 08: il secimi (esleme ekranindan "Ili kendim seceyim") ---
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
tus KEYCODE_DPAD_RIGHT
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

ls -la "$CIKIS"
