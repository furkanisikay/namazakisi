#!/usr/bin/env bash
# Android TV vakit panosunun Play magaza karelerini emulatorde ceker (1920x1080).
# android-ekran-goruntuleri.yml icinden `bash scripts/tv-kare-hatti.sh` ile cagrilir.
#
# Tek bash betigi: emulator-runner `script` girdisinin her satirini ayri `sh` ile
# calistirir (telefon hatti dersi).
#
# DOLASMA: yalniz D-pad tus olaylari. Pano saniyede bir cizildigi icin
# `uiautomator dump` "idle" beklerken bos doner (telefon hattindaki geri sayim
# dersinin aynisi); panoda odaklanabilir TEK oge ("Konumu değiştirin") oldugu icin
# koordinat da gerekmez.
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

# --- 02: il secimi (panodaki dugmeden; secili il Istanbul odakta acilir) ---
tus KEYCODE_DPAD_DOWN
tus KEYCODE_DPAD_CENTER 3
kare 02-il-secimi 2 || true
tus KEYCODE_BACK 2

# --- 03: ekran koruyucu (Daydream; en iyi gayret) ---
adb shell am force-stop "$PAKET"
adb shell settings put secure screensaver_enabled 1 || true
adb shell settings put secure screensaver_components "$PAKET/$SINIF.ui.PanoDreamServisi" || true
adb shell settings put secure screensaver_activate_on_sleep 1 || true
# IDreamManager.dream() = islem 1; olmazsa SystemUI'nin "Somnambulator"u.
adb shell service call dreams 1 || adb shell am start -n com.android.systemui/.Somnambulator || true
sleep 5
if adb shell dumpsys dreams 2>/dev/null | grep -q "PanoDreamServisi"; then
  kare 03-ekran-koruyucu 3 || true
else
  echo "UYARI: ekran koruyucu baslatilamadi"
  adb shell dumpsys dreams 2>/dev/null | head -30 || true
fi

ls -la "$CIKIS"
