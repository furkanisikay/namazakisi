#!/usr/bin/env bash
# Android emulatorunde magaza karelerini ceker.
# android-ekran-goruntuleri.yml icinden `bash scripts/android-kare-hatti.sh` ile cagrilir.
#
# NEDEN AYRI DOSYA: reactivecircus/android-emulator-runner `script` girdisindeki
# HER SATIRI ayri bir `/usr/bin/sh -c` (dash) cagrisiyla calistirir. Iki sonucu var:
#   1. `set -o pipefail` dash'te yok -> "Illegal option -o pipefail" ile duser.
#   2. Satirlar ayri kabukta calistigi icin `PAKET=...` gibi degiskenler sonraki
#      satira HIC ulasmaz.
# Tek bir bash betigi ikisini birden cozer.
set -euo pipefail

PAKET=$(node -e "console.log(require('./app.json').expo.android.package)")
echo "paket: $PAKET"

adb wait-for-device
# Debug APK JS paketini Metro'dan alir; emulatordeki 8081'i makinedekine bagla.
adb reverse tcp:8081 tcp:8081

APK=$(find android -name '*.apk' -path '*debug*' | head -1)
[ -z "$APK" ] && { echo "debug APK bulunamadi"; exit 1; }
echo "apk: $APK"
adb install -r "$APK"

# Izinler bastan verilsin: diyaloglar kareleri kirletmesin.
for izin in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION; do
  adb shell pm grant "$PAKET" "android.permission.$izin" || true
done
adb emu geo fix 28.9784 41.0082 || true

# Veritabani ancak uygulama bir kez calistiktan sonra olusur. Ilk acilista
# Metro paketi derledigi icin JS'in yuklenmesi uzun surebilir.
adb shell monkey -p "$PAKET" -c android.intent.category.LAUNCHER 1
for i in $(seq 1 40); do
  if adb shell run-as "$PAKET" ls databases/RKStorage >/dev/null 2>&1; then
    echo "RKStorage olustu (${i}. deneme)"
    break
  fi
  sleep 5
done
sleep 5
adb shell am force-stop "$PAKET"
sleep 2

# Android API 28+ SQLite'i varsayilan olarak WAL modunda acar: sema ve son
# yazimlar henuz `-wal` dosyasinda olabilir. Yalniz ana dosya cekilirse tablo
# "yok" gorunur. Uc dosyayi yan yana cekiyoruz; node:sqlite acarken birlestirir
# ve kapatirken ana dosyaya yazar (checkpoint).
rm -f /tmp/RKStorage /tmp/RKStorage-wal /tmp/RKStorage-shm
adb exec-out run-as "$PAKET" cat databases/RKStorage > /tmp/RKStorage
for ek in wal shm; do
  if adb shell run-as "$PAKET" ls "databases/RKStorage-$ek" >/dev/null 2>&1; then
    adb exec-out run-as "$PAKET" cat "databases/RKStorage-$ek" > "/tmp/RKStorage-$ek"
  fi
done
ls -la /tmp/RKStorage*
node scripts/android-tohumla.js /tmp/RKStorage
adb push /tmp/RKStorage /data/local/tmp/RKStorage
adb shell run-as "$PAKET" cp /data/local/tmp/RKStorage databases/RKStorage
adb shell run-as "$PAKET" rm -f databases/RKStorage-journal databases/RKStorage-wal databases/RKStorage-shm || true

# JS "dev mode"u kapat: __DEV__ false olunca altta cikan "Open debugger to view
# warnings." balonu (sekme ikonlarini ortuyordu) ve diger gelistirici arayuzu
# hic olusmaz. RN bu ayari varsayilan SharedPreferences'ta tutar
# (DevInternalSettings.kt > PREFS_JS_DEV_MODE_DEBUG_KEY, varsayilan true).
cat > /tmp/tercihler.xml <<XML
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="js_dev_mode_debug" value="false" />
    <boolean name="js_minify_debug" value="true" />
</map>
XML
adb push /tmp/tercihler.xml /data/local/tmp/tercihler.xml
adb shell run-as "$PAKET" mkdir -p shared_prefs
adb shell run-as "$PAKET" cp /data/local/tmp/tercihler.xml "shared_prefs/${PAKET}_preferences.xml"

# Temiz durum cubugu: Android'in sistem demo modu (iOS'taki 09:41 karsiligi).
adb shell settings put global sysui_demo_allowed 1
DEMO="adb shell am broadcast -a com.android.systemui.demo -e command"
$DEMO enter
$DEMO clock -e hhmm 0941
$DEMO battery -e level 100 -e plugged false
# `fully true` olmadan emulatorde internet dogrulanmadigi icin Wi-Fi ikonunun
# yaninda "!" gorunuyor.
$DEMO network -e fully true
$DEMO network -e wifi show -e level 4 -e fully true
$DEMO network -e mobile show -e datatype none -e level 4 -e fully true
$DEMO notifications -e visible false

adb shell monkey -p "$PAKET" -c android.intent.category.LAUNCHER 1
# Uretim paketi (minify) ilk istekte derlendigi icin JS'in yuklenmesi uzun surer.
sleep 30
mkdir -p kareler
# Dolasma Maestro ile: `uiautomator dump` arayuzun TAM 1 sn sessiz kalmasini
# bekler ve bulamayinca "could not get idle state" ile hic agac vermez. Ana
# ekrandaki geri sayim saniyede bir guncellendigi icin bu kosul hic olusmuyordu.
# Maestro'nun surucusu (androidx UiAutomator) zaman asimini hata saymaz.
export PATH="$HOME/.maestro/bin:$PATH"
for akis in scripts/maestro/*.yaml; do
  echo "=== $akis ==="
  # Bir akis dusse de digerleri cekilsin (her biri uygulamayi kendisi baslatir).
  maestro test "$akis" || echo "UYARI: $akis tamamlanamadi"
done
# Maestro `takeScreenshot` yolunu calisma dizinine degil kendi test ciktisina
# gore yazar: ~/.maestro/tests/<zaman>/<akis>/takeScreenshot/kareler/*.png
# (yasandi: tum adimlar COMPLETED, ama kareler/ BOS kaldi).
find "$HOME/.maestro/tests" -path '*takeScreenshot*' -name '[0-9][0-9]-*.png' -exec cp {} kareler/ \;
ls -la kareler
