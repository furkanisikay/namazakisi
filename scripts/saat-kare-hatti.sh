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
# Kisa ve yavas kaydirma: hizli/uzun kaydirma ScalingLazyColumn'da firlatma olur,
# hedef satir bir adimda gorus alaninin disina kacar.
yukari_kaydir() { adb shell input swipe $((G / 2)) $((Y * 2 / 3)) $((G / 2)) $((Y / 3)) 600; sleep 1.5; }

dump_al() {
  adb shell uiautomator dump /data/local/tmp/ui.xml >/dev/null 2>&1 || true
  adb exec-out cat /data/local/tmp/ui.xml > /tmp/saat-ui.xml 2>/dev/null || true
}

# Uygulama ilk cizimini bitirene kadar bekler. swiftshader Wear emulatorunde soguk
# acilista sistemin "Starting..." ekrani `am start -W` donduktan SONRA da kalir ve
# bir dokunma olayi gelene kadar KALKMAZ (iki kosuda olculdu: 2 dk beklemede de
# kalkmadi, ilk kaydirmadan hemen sonra uygulama gorundu). Bu yuzden her denemede
# zararsiz bir "durtme" gonderilir: listenin basina dogru kisa kaydirma (liste zaten
# en ustteyse etkisiz). Sabit `sleep` YETMEZ.
hazir_bekle() {
  local desen="$1"
  for i in $(seq 1 15); do
    sleep 2
    dump_al
    if node scripts/saat/ui-merkez.js /tmp/saat-ui.xml "$desen" >/dev/null; then
      echo "hazir ($desen): ${i}. deneme"
      return 0
    fi
    adb shell input swipe $((G / 2)) $((Y / 3)) $((G / 2)) $((Y / 2)) 400
  done
  echo "UYARI: '$desen' gorunmedi"
  return 1
}

# Desene uyan dugumu bulana kadar listeyi kaydirir ve ona dokunur.
bul_ve_dokun() {
  local desen="$1" xy yy
  for _ in 1 2 3 4 5 6 7 8; do
    dump_al
    if xy=$(node scripts/saat/ui-merkez.js /tmp/saat-ui.xml "$desen"); then
      yy=${xy#* }
      # Yuvarlak ekranda alt kenardaki satir kirpiktir; ortaya gelsin.
      if [ "$yy" -gt $((Y * 3 / 4)) ]; then yukari_kaydir; continue; fi
      echo "dokunma ($desen): $xy"
      adb shell input tap $xy
      return 0
    fi
    yukari_kaydir
  done
  echo "UYARI: '$desen' bulunamadi"
  grep -o 'content-desc="[^"]\+"' /tmp/saat-ui.xml | head -20 || true
  return 1
}

# --- 01 / 02: ana ekran + vakit listesi ---
adb shell am start -W -n "$PAKET/$SINIF.ui.AnaAktivite"
hazir_bekle 'Sıradaki|Dokunarak|Kıldınız' || true
kare 01-ana-ekran 2 || true
# Iki adim: vakit satirlari ekranin ortasina gelsin (tek adimda baslik TimeText'in
# altinda yarim kaliyordu). Kare ekranda satirlar gorece buyuk → bir kisa adim daha.
yukari_kaydir
yukari_kaydir
if [ "$ETIKET" = kare ]; then
  adb shell input swipe $((G / 2)) $((Y / 2)) $((G / 2)) $((Y / 3)) 600
  sleep 1.5
fi
kare 02-vakitler 1 || true

# --- 03: "Kıldım" onayi (su anki vakit kilinmamis tohumlandi) ---
if bul_ve_dokun 'Dokunarak işaretleyin'; then
  kare 03-kildim-onayi 2 || true
  adb shell input keyevent KEYCODE_BACK
fi

# --- 04: tesbihat sayaci (gercek dokunuslarla) ---
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.TesbihatAktivite"
hazir_bekle 'Sübhânallah|Sayın|sayacı' || sleep 5
for _ in $(seq 1 21); do dokun_merkez; sleep 0.3; done
kare 04-tesbihat 2 || true

# --- 05 / 06: tile'lar ---
# `add-tile` DEBUG_SURFACE, `show-tile` ise DEBUG_SYSUI eylemidir (ilk kosuda
# show-tile DEBUG_SURFACE'e gonderildi → "Unrecognized operation"). Eklenen tile
# 0. siraya girer; gosterim basarisizsa kadrandan bir kez sola kaydirilir.
# Kadrandayken HOME'a basmak uygulama listesini acar (ilk kosuda tile karesi yerine
# o cikti) → uygulamadan cikis force-stop ile, HOME'suz.
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
  cikti=$(adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SYSUI \
    --es operation show-tile --ei index "$indeks" 2>&1 || true)
  echo "show-tile $indeks: $cikti"
  if ! echo "$cikti" | grep -q 'result=1'; then
    adb shell input swipe $((G * 4 / 5)) $((Y / 2)) $((G / 5)) $((Y / 2)) 300
  fi
  kare "$ad" 6
}
adb shell am force-stop "$PAKET"
sleep 2
tile_goster BugunTileServisi 05-tile-bugun || true
adb shell input keyevent KEYCODE_BACK
sleep 2
tile_goster VakitTileServisi 06-tile-vakit || true
adb shell input keyevent KEYCODE_BACK
sleep 2

# Kadranda komplikasyon karesi BILINCLI YOK: emulatorun tek kadrani (Orbita)
# yuvalarini kapali getirir ("set-complication failed ... Complication slot is not
# enabled", yuva >= 3 "out of range") ve imajda baska kadran yuklu degil.

ls -la "$CIKIS"
