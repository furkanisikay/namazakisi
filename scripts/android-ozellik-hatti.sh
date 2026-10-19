#!/usr/bin/env bash
# OZELLIK TURU (Android): yeni ekranlarin karelerini ceker — magaza turundan AYRI.
# android-ekran-goruntuleri.yml icinden `bash scripts/android-ozellik-hatti.sh <profil> <tema...>`
# ile cagrilir (ornek: `telefon acik koyu`, `tablet acik`).
#
# Magaza hattinin (android-kare-hatti.sh) dersleri burada da gecerli:
#   - emulator-runner `script` girdisinin her satirini ayri `sh` ile calistirir
#     → tum adimlar TEK bash betiginde;
#   - `uiautomator dump` geri sayim yuzunden bos doner → dolasma Maestro ile;
#   - Maestro `takeScreenshot` yolunu ~/.maestro/tests/<zaman>/<akis>/takeScreenshot/
#     altina yazar → kareler oradan toplanir;
#   - RKStorage WAL'dadir → uc dosya cekilir, tohumlayici ana dosyaya indirir.
#
# FARK: her akistan ONCE uygulama durdurulup YENIDEN tohumlanir. Akis dosyasinin
# basindaki `# tohum: <varyant>` satiri varyanti secer (ozellik | sade | butce;
# bkz. scripts/ozellik-tohum-verisi.js). Boylece sade gorunum ya da yogun butce
# tohumu diger akislari bozmaz ve her akis temiz acilistan baslar.
set -euo pipefail

PROFIL="${1:?profil etiketi (telefon|tablet) gerekli}"
shift
TEMALAR=("$@")
[ "${#TEMALAR[@]}" -eq 0 ] && TEMALAR=(acik)

PAKET=$(node -e "console.log(require('./app.json').expo.android.package)")
echo "paket: $PAKET  profil: $PROFIL  temalar: ${TEMALAR[*]}"
CIKIS="kareler-ozellik"
mkdir -p "$CIKIS"

adb wait-for-device
adb reverse tcp:8081 tcp:8081

APK=$(find android -name '*.apk' -path '*debug*' | head -1)
[ -z "$APK" ] && { echo "debug APK bulunamadi"; exit 1; }
adb install -r "$APK"

for izin in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION; do
  adb shell pm grant "$PAKET" "android.permission.$izin" || true
done
adb emu geo fix 28.9784 41.0082 || true

# Veritabani ancak uygulama bir kez calistiktan sonra olusur.
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

# JS dev mode KAPALI ("Open debugger to view warnings." balonu sekmeleri ortuyordu).
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

# Sistem hata/ANR pencerelerini gizle: yuklu emulatorde "Pixel Launcher isn't
# responding" penceresi uygulamanin ustune acilip TUM akislari dusurdu (b830769).
adb shell settings put global hide_error_dialogs 1 || true

# Gercek bildirimlerin heads-up bandi (or. tohumdaki Evvabin hatirlatmasi) karenin
# ustune biniyordu (20-now-bar). Bildirimler yine kurulur, yalniz ekrana inmez.
adb shell settings put global heads_up_notifications_enabled 0 || true

# Temiz durum cubugu (SystemUI demo modu).
adb shell settings put global sysui_demo_allowed 1
DEMO="adb shell am broadcast -a com.android.systemui.demo -e command"
$DEMO enter
$DEMO clock -e hhmm 0941
$DEMO battery -e level 100 -e plugged false
$DEMO network -e fully true
$DEMO network -e wifi show -e level 4 -e fully true
$DEMO network -e mobile show -e datatype none -e level 4 -e fully true
$DEMO notifications -e visible false

# Uygulamayi durdurur ve AsyncStorage'i verilen varyant + temayla yeniden tohumlar.
tohumla() {
  local varyant="$1" tema="$2"
  adb shell am force-stop "$PAKET"
  sleep 1
  rm -f /tmp/RKStorage /tmp/RKStorage-wal /tmp/RKStorage-shm
  adb exec-out run-as "$PAKET" cat databases/RKStorage > /tmp/RKStorage
  for ek in wal shm; do
    if adb shell run-as "$PAKET" ls "databases/RKStorage-$ek" >/dev/null 2>&1; then
      adb exec-out run-as "$PAKET" cat "databases/RKStorage-$ek" > "/tmp/RKStorage-$ek"
    fi
  done
  node scripts/android-tohumla.js /tmp/RKStorage --varyant "$varyant" --tema "$tema"
  adb push /tmp/RKStorage /data/local/tmp/RKStorage >/dev/null
  adb shell run-as "$PAKET" cp /data/local/tmp/RKStorage databases/RKStorage
  adb shell run-as "$PAKET" rm -f databases/RKStorage-journal databases/RKStorage-wal databases/RKStorage-shm || true
}

# Ilk acilis Metro paketini derler (minify): sonraki akislarin beklemesi kisalsin.
tohumla ozellik "${TEMALAR[0]}"
adb shell monkey -p "$PAKET" -c android.intent.category.LAUNCHER 1
sleep 30

export PATH="$HOME/.maestro/bin:$PATH"
for tema in "${TEMALAR[@]}"; do
  HEDEF="$CIKIS/${PROFIL}-${tema}"
  mkdir -p "$HEDEF"
  for akis in scripts/maestro/ozellik/[0-9]*.yaml; do
    varyant=$(sed -n 's/^# tohum: *\([a-z]*\).*/\1/p' "$akis" | head -1)
    varyant="${varyant:-ozellik}"
    echo "=== [$PROFIL/$tema] $akis (tohum: $varyant) ==="
    tohumla "$varyant" "$tema"
    isaret=$(mktemp)
    # Bir akis dusse de digerleri cekilsin (her biri uygulamayi kendisi baslatir).
    maestro test "$akis" || echo "UYARI: $akis tamamlanamadi ($PROFIL/$tema)"
    # Yalniz BU akisin kareleri: isaret dosyasindan yeni olanlar.
    find "$HOME/.maestro/tests" "$PWD/ozk" -newer "$isaret" -path '*ozk/*' -name '*.png' \
      -exec cp {} "$HEDEF/" \; 2>/dev/null || true
    rm -f "$isaret"
  done
done

# Ozet: dosya adi + boyut; akislarin bekledigi ama cikmayan kare → UYARI.
BEKLENEN=$(grep -h 'takeScreenshot: ozk/' scripts/maestro/ozellik/*.yaml | sed 's/.*ozk\///' | sort -u)
for tema in "${TEMALAR[@]}"; do
  HEDEF="$CIKIS/${PROFIL}-${tema}"
  echo "--- $HEDEF ---"
  for f in "$HEDEF"/*.png; do
    [ -e "$f" ] || continue
    node -e 'const b=require("fs").readFileSync(process.argv[1]);console.log(process.argv[1].split("/").pop(), b.readUInt32BE(16)+"x"+b.readUInt32BE(20), (b.length/1024).toFixed(0)+" KB")' "$f"
  done
  for ad in $BEKLENEN; do
    [ -e "$HEDEF/$ad.png" ] || echo "UYARI: eksik kare $PROFIL-$tema/$ad.png"
  done
done
