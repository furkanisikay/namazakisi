#!/usr/bin/env bash
# Wear OS saat uygulamasinin Play magaza karelerini emulatorde ceker.
# android-ekran-goruntuleri.yml icinden `bash scripts/saat-kare-hatti.sh <etiket>` ile
# cagrilir (etiket = profil klasoru: `yuvarlak`, `kare`).
#
# Telefon hattinin dersleri burada da gecerli: emulator-runner `script` girdisinin
# her satirini ayri `sh` ile calistirir → tum adimlar TEK bash betiginde.
#
# VERI: saat vakitleri telefondan Data Layer ile alir, emulatorde telefon yok. Telefonun
# gonderecegi yukun aynisi `scripts/saat/saat-tohum-yuku.js` ile uretilip saatin kendi
# deposuna (`saat_veri.xml`) `run-as` ile yazilir — saat koduna tohum alicisi YOK.
#
# DOLASMA: `uiautomator dump` + koordinat. Telefon ekraninin aksine saatin ana ekrani
# 30 sn'de bir cizilir, dump'in bekledigi "idle" durumu olusur (Maestro gerekmez).
set -euo pipefail

ETIKET="${1:?profil etiketi (yuvarlak|kare) gerekli}"
PAKET="com.furkanisikay.namazakisi"
SINIF="$PAKET.saat"
CIKIS="kareler-saat/$ETIKET"
mkdir -p "$CIKIS"

APK=$(find wear/app/build/outputs/apk/debug -name '*.apk' | head -1)
[ -z "$APK" ] && { echo "saat debug APK bulunamadi"; exit 1; }

adb wait-for-device
adb shell getprop ro.build.version.release
adb shell getprop ro.build.fingerprint
BOYUT=$(adb shell wm size | sed -n 's/.*: *\([0-9]*x[0-9]*\).*/\1/p' | tail -1)
G=${BOYUT%x*}
Y=${BOYUT#*x}
echo "saat ekrani: ${G}x${Y} (etiket: $ETIKET)"

# Ilk acilis karsilamasini (OOBE/egitim) atla; emulatorde "test modu" yayini bunu yapar.
adb shell am broadcast -a com.google.android.clockwork.action.TEST_MODE || true
# 24 saat bicimi (TimeText + kadran), hata/ANR pencerelerini gizle (telefon hatti dersi).
adb shell settings put system time_12_24 24 || true
adb shell settings put global hide_error_dialogs 1 || true
# Ekran kararmasin / ambient'e gecmesin: kareler etkilesimli gorunumden alinmali.
adb shell svc power stayon true || true
adb shell settings put system screen_off_timeout 1800000 || true

# -g: calisma zamani izinleri (POST_NOTIFICATIONS) kurulumda verilsin — izin
# penceresi ana ekranin ustune acilip ilk kareyi orterdi.
adb install -r -g "$APK"

# --- Tohum ---
adb shell am force-stop "$PAKET"
node scripts/saat/saat-tohum-yuku.js /tmp/saat_veri.xml
adb push /tmp/saat_veri.xml /data/local/tmp/saat_veri.xml
adb shell run-as "$PAKET" mkdir -p shared_prefs
adb shell run-as "$PAKET" cp /data/local/tmp/saat_veri.xml shared_prefs/saat_veri.xml
adb shell run-as "$PAKET" ls -la shared_prefs

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

dokun_merkez() { adb shell input tap $((G / 2)) $((Y * 2 / 5)); }
yukari_kaydir() { adb shell input swipe $((G / 2)) $((Y * 3 / 4)) $((G / 2)) $((Y / 4)) 350; sleep 1; }

# Desene uyan dugumu bulana kadar listeyi kaydirir ve ona dokunur.
bul_ve_dokun() {
  local desen="$1" xy
  for _ in 1 2 3 4 5 6; do
    adb shell uiautomator dump /data/local/tmp/ui.xml >/dev/null 2>&1 || true
    adb exec-out cat /data/local/tmp/ui.xml > /tmp/saat-ui.xml 2>/dev/null || true
    if xy=$(node scripts/saat/ui-merkez.js /tmp/saat-ui.xml "$desen"); then
      # Dugum kenara cok yakinsa (yuvarlak ekranda kirpik) bir kez daha kaydir.
      local yy=${xy#* }
      if [ "$yy" -gt $((Y * 4 / 5)) ]; then yukari_kaydir; continue; fi
      echo "dokunma ($desen): $xy"
      adb shell input tap $xy
      return 0
    fi
    yukari_kaydir
  done
  echo "UYARI: '$desen' bulunamadi"
  grep -o 'content-desc="[^"]*"' /tmp/saat-ui.xml | head -20 || true
  return 1
}

# --- 01 / 02: ana ekran + vakit listesi ---
adb shell am start -W -n "$PAKET/$SINIF.ui.AnaAktivite"
kare 01-ana-ekran 5 || true
yukari_kaydir
kare 02-vakitler || true

# --- 03: "Kıldım" onayi (su anki vakit kilinmamis tohumlandi) ---
if bul_ve_dokun 'Dokunarak işaretleyin'; then
  kare 03-kildim-onayi 2 || true
  adb shell input keyevent KEYCODE_BACK
fi

# --- 04: tesbihat sayaci (gercek dokunuslarla) ---
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.TesbihatAktivite"
sleep 2
for _ in $(seq 1 21); do dokun_merkez; sleep 0.3; done
kare 04-tesbihat 2 || true

# --- 05 / 06: tile'lar (Wear "debug surface" yayini) ---
tile_goster() {
  local servis="$1" ad="$2" cikti indeks
  cikti=$(adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE \
    --es operation add-tile --ecn component "$PAKET/$SINIF.tile.$servis" 2>&1 || true)
  echo "add-tile $servis: $cikti"
  indeks=$(echo "$cikti" | sed -n 's/.*Index=\[\([0-9]*\)\].*/\1/p' | head -1)
  if [ -z "$indeks" ]; then
    echo "UYARI: $servis tile eklenemedi"
    return 1
  fi
  adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE \
    --es operation show-tile --ei index "$indeks"
  kare "$ad" 5
}
adb shell am force-stop "$PAKET"
adb shell input keyevent KEYCODE_HOME
sleep 2
tile_goster BugunTileServisi 05-tile-bugun || true
tile_goster VakitTileServisi 06-tile-vakit || true

# --- 07: kadranda komplikasyon (en iyi gayret) ---
adb shell input keyevent KEYCODE_HOME
sleep 2
KADRAN=$(adb shell dumpsys wallpaper 2>/dev/null | sed -n 's/.*mWallpaperComponent=ComponentInfo{\([^}]*\)}.*/\1/p' | head -1)
echo "etkin kadran: ${KADRAN:-bilinmiyor}"
if [ -n "$KADRAN" ]; then
  # ComplicationData tipleri: SHORT_TEXT=3, RANGED_VALUE=5. Yuva 0..3 denenir.
  for yuva in 0 1 2 3; do
    adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE \
      --es operation set-complication \
      --ecn component "$PAKET/$SINIF.komplikasyon.VakitKomplikasyonServisi" \
      --ecn watchface "$KADRAN" --ei slot "$yuva" --ei type 3 || true
  done
  kare 07-kadran-komplikasyon 6 || true
else
  echo "UYARI: kadran bulunamadi, komplikasyon karesi atlandi"
fi

ls -la "$CIKIS"
