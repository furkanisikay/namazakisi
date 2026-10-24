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
bash scripts/emulator-hazir-bekle.sh
adb reverse tcp:8081 tcp:8081

APK=$(find android -name '*.apk' -path '*debug*' | head -1)
[ -z "$APK" ] && { echo "debug APK bulunamadi"; exit 1; }
adb install -r "$APK"

# ACCESS_BACKGROUND_LOCATION: Camideyim acik tohumlandigi icin ("Her zaman" yoksa sayfa izin uyarisi gosterir).
for izin in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION ACCESS_BACKGROUND_LOCATION; do
  adb shell pm grant "$PAKET" "android.permission.$izin" || true
done
# pixel_tablet imaji konum servisi KAPALI aciliyor: Kible "Konum servislerine erisilemiyor"
# deyip kamera yon cumlesini/kalibrasyon rehberini hic cizmiyordu (telefon imaji acik gelir).
adb shell cmd location set-location-enabled true || adb shell settings put secure location_mode 3 || true
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
  # Camideyim ayarlari native SharedPreferences'tadir (CamiDepo) — harita ve sinir
  # ayari kareleri icin ACIK tohumlanir.
  node scripts/ozellik-tohum-verisi.js --cami-xml > /tmp/namazakisi_cami.xml
  adb push /tmp/namazakisi_cami.xml /data/local/tmp/namazakisi_cami.xml >/dev/null
  adb shell run-as "$PAKET" mkdir -p shared_prefs
  adb shell run-as "$PAKET" cp /data/local/tmp/namazakisi_cami.xml shared_prefs/namazakisi_cami.xml
  # "Kendi dosyaniz" kaydi (SesIceAktarici): `ses` tohumundaki olu URI bizimmis gibi kayitli.
  node scripts/ozellik-tohum-verisi.js --ses-xml > /tmp/namazakisi_ses_ice_aktarim.xml
  adb push /tmp/namazakisi_ses_ice_aktarim.xml /data/local/tmp/namazakisi_ses_ice_aktarim.xml >/dev/null
  adb shell run-as "$PAKET" cp /data/local/tmp/namazakisi_ses_ice_aktarim.xml shared_prefs/namazakisi_ses_ice_aktarim.xml
}

# Akis oncesi cihaz hazirligi (`# hazirlik:` satiri). Sensor degerleri
# scripts/kible-emulator-pozu.js'ten — cekirdek fonksiyonlarimizla tutarli poz.
hazirlik_uygula() {
  case "$1" in
    masaustu)
      # Masaustu postur: mentese YATAY + yari acik. Fold'un ic ekraninda mentese dikeydir →
      # ekran dondurulur; Flip'te mentese zaten yatay. Yari acik = mentese acisi ~90.
      # Akis uygulamayi ACIK postürde baslatir; yari acik postür hazirlik_bitir'de, uygulama
      # calisirken verilir (WindowInfoTracker degisimi olay olarak alsin) ve kare adb ile alinir.
      adb emu sensor set hinge-angle0 180 || true
      # Ozel AVD'de (pixel_6 + config.ini menteşesi) cihaz durumu HALF_OPENED'a gecer ama
      # WindowManager Extensions'in mentese KONUMUNU okudugu kaynak (config_display_features)
      # imajda yok → FoldingFeature hic uretilmez. AOSP'nin gelistirici ayari ayni bilgiyi
      # verir ("fold-[sol,ust,sag,alt]"; durum device_state'ten gelir). Uygulama acilmadan once.
      case "$PROFIL" in
        flip) adb shell settings put global display_features "fold-[0,1320,1080,1320]" || true ;;
        katlanabilir) adb shell settings put global display_features "fold-[1104,0,1104,1840]" || true ;;
      esac
      sleep 2
      adb shell dumpsys device_state 2>/dev/null | grep -iE "state|posture" | head -8 || true
      adb shell wm size || true
      ;;
    kible-kamera*|kible-kalibrasyon)
      adb shell pm grant "$PAKET" android.permission.CAMERA || true
      # Kible taze konum ister; sabitleme her akistan once tazelenir (tablette konum gec acilir).
      adb shell cmd location set-location-enabled true >/dev/null 2>&1 || true
      adb emu geo fix 28.9784 41.0082 || true
      local poz
      poz=$(node scripts/kible-emulator-pozu.js "$1")
      echo "sensor pozu ($1): $poz"
      # Cikti: "<ivme x:y:z> <manyetik x:y:z>"
      adb emu sensor set acceleration "$(echo "$poz" | cut -d' ' -f1)" || true
      adb emu sensor set magnetic-field "$(echo "$poz" | cut -d' ' -f2)" || true
      if [ "$1" = "kible-kalibrasyon" ] || [ "$1" = "kible-kamera-25" ]; then
        # Rehberin ∞ animasyonu / yolun akan cevronlari icin animasyonlar ACIK (yoksa
        # "hareketi azalt" sayilir ve statik cizilir).
        for a in window_animation_scale transition_animation_scale animator_duration_scale; do
          adb shell settings put global "$a" 1
        done
      fi
      ;;
    guc-tasarrufu)
      # Sistem kosullari karesi: pil tasarrufu ACIK, sarjdan cikmis, Veri Tasarrufu ACIK
      # (Ayarlar cipi + esitleme bekleme satiri). hazirlik_bitir geri alir.
      # Pil tasarrufu sarjdayken acilamaz (sistem kapatir): once sarjdan cikar,
      # sistemin bunu islemesini bekle, sonra ac ve DOGRULA (yaris bir karede
      # tasarrufu kapali birakmisti).
      adb shell dumpsys battery unplug || true
      sleep 2
      for _ in 1 2 3 4 5; do
        adb shell settings put global low_power 1 || true
        sleep 1
        if adb shell dumpsys power | grep -qiE "mLowPowerModeEnabled=true|Battery saver: *ON|mBatterySaverEnabled=true"; then break; fi
      done
      adb shell cmd netpolicy set restrict-background true || true
      echo "sistem durumu: low_power=$(adb shell settings get global low_power | tr -d '
') $(adb shell dumpsys power | grep -iE 'mIsPowered|LowPowerMode' | tr -d '
' | tr '
' ' ')"
      ;;
    dunya-kl|dunya-kl-video)
      # Dunya konumu kareleri: cihaz Kuala Lumpur saatinde (yoksa vakitler Istanbul saatiyle
      # gosterilir; imsak gece yarisina duser). `-video`: kart gecisi icin animasyonlar ACIK
      # (kayit akistaki startRecording'le). hazirlik_bitir geri alir.
      adb shell cmd alarm set-timezone Asia/Kuala_Lumpur >/dev/null 2>&1 \
        || adb shell service call alarm 3 s16 Asia/Kuala_Lumpur >/dev/null 2>&1 || true
      echo "saat dilimi: $(adb shell getprop persist.sys.timezone | tr -d '\r')"
      if [ "$1" = "dunya-kl-video" ]; then
        # Kayit akistaki Maestro startRecording ile (kart gorununce baslar); burada yalniz
        # animasyonlar ACIK, yoksa kart gecisi "hareketi azalt" sayilip atlanir.
        for a in window_animation_scale transition_animation_scale animator_duration_scale; do
          adb shell settings put global "$a" 1
        done
      fi
      ;;
    *) echo "UYARI: bilinmeyen hazirlik $1" ;;
  esac
}

# Akis sonrasi: hazirligin actigi seyleri geri al (animasyon olcegi, ekran kaydi).
hazirlik_bitir() {
  case "$1" in
    masaustu)
      adb emu sensor set hinge-angle0 90 || adb emu posture 2 || true
      sleep 6
      adb shell dumpsys device_state 2>/dev/null | grep -E "mCommittedState" | head -2 || true
      adb shell dumpsys window 2>/dev/null | grep -iE "displayfeature|fold|hinge" | head -10 || true
      # Tani: WindowManager Extensions kutuphanesi imajda var mi, mentese ozelligi hangi
      # kaynaktan geliyor (FoldingFeature uygulamaya buradan ulasir).
      echo "--- window extensions ---"
      adb shell "ls /system_ext/framework /system/framework /vendor/framework 2>/dev/null | grep -i window" || true
      adb shell "pm list libraries | grep -i window" || true
      adb shell "getprop | grep -iE 'fold|hinge|display_feature|device_state|wm.extensions'" || true
      adb shell "settings get global display_features" || true
      # Uygulama surecinde WindowManager Extensions / modul uyarilari (FoldingFeature geldi mi?).
      echo "--- logcat (window/katlanma) ---"
      adb logcat -d 2>/dev/null | grep -iE "KatlanmaPosturu|WindowExtensions|ExtensionsUtil|WindowLayoutComponent|FoldingFeature|DeviceStateManagerFoldingFeature|RawFoldingFeature|androidx.window" | tail -40 || true
      adb exec-out screencap -p > "$CIKIS/${PROFIL}-$2/46-katlanabilir-masaustu.png" || true
      adb emu sensor set hinge-angle0 180 || true
      adb shell settings delete global display_features || true
      ;;
    dunya-kl|dunya-kl-video)
      if [ "$1" = "dunya-kl-video" ]; then
        for a in window_animation_scale transition_animation_scale animator_duration_scale; do
          adb shell settings put global "$a" 0
        done
      fi
      adb shell cmd alarm set-timezone Europe/Istanbul >/dev/null 2>&1 \
        || adb shell service call alarm 3 s16 Europe/Istanbul >/dev/null 2>&1 || true
      ;;
    guc-tasarrufu)
      adb shell settings put global low_power 0 || true
      adb shell cmd netpolicy set restrict-background false || true
      adb shell dumpsys battery reset || true
      ;;
    kible-kamera-25)
      # Akis kamera gorunumunde biter: yolun akisi 8 sn (artifact: kible-yolu-<tema>.mp4).
      adb shell rm -f /sdcard/kible-yolu.mp4 || true
      adb shell screenrecord --time-limit 8 --bit-rate 4000000 /sdcard/kible-yolu.mp4 || true
      sleep 1
      adb pull /sdcard/kible-yolu.mp4 "$CIKIS/kible-yolu-${2}.mp4" >/dev/null 2>&1 || echo "UYARI: yol videosu alinamadi"
      for a in window_animation_scale transition_animation_scale animator_duration_scale; do
        adb shell settings put global "$a" 0
      done
      ;;
    kible-kalibrasyon)
      # Akis rehber acikken biter (kamera gorunumu): 12 sn'lik video (artifact:
      # kalibrasyon-<tema>.mp4). Uygulamanin acilisi uzun suruyor; kayit bu yuzden SONDA.
      adb shell rm -f /sdcard/kalibrasyon.mp4 || true
      adb shell screenrecord --time-limit 12 --bit-rate 4000000 /sdcard/kalibrasyon.mp4 || true
      sleep 1
      adb pull /sdcard/kalibrasyon.mp4 "$CIKIS/kalibrasyon-${2}.mp4" >/dev/null 2>&1 || echo "UYARI: kalibrasyon videosu alinamadi"
      for a in window_animation_scale transition_animation_scale animator_duration_scale; do
        adb shell settings put global "$a" 0
      done
      ;;
  esac
}

# PERFORMANS_OLCUMU=1: Ilerleme sekmesinde kaydirma sirasinda kare suresi olcumu.
# DIKKAT: emulator-runner `disable-animations: true` ile animator olcegini 0 yapar →
# Reanimated useReducedMotion() true doner ve gok panelinin sonsuz animasyonlari HIC
# kurulmaz; takilma bu kosulda olusmaz. Olcum suresince olcekler 1'e alinir.
performans_olc() {
  local tema="${TEMALAR[0]}" ozet="$CIKIS/performans-ozet.md"
  for a in window_animation_scale transition_animation_scale animator_duration_scale; do
    adb shell settings put global "$a" 1
  done
  tohumla ozellik "$tema"
  maestro test scripts/maestro/performans/ilerleme-ac.yaml || echo "UYARI: ilerleme-ac tamamlanamadi"
  sleep 24   # acilis koreografisi + tek nefeslik nabiz/parilti bitsin (sonlu; bosta sifir hareket)
  local boyut w h
  boyut=$(adb shell wm size | sed -n 's/.*: *\([0-9]*x[0-9]*\).*/\1/p' | tail -1)
  w=${boyut%x*}; h=${boyut#*x}
  local x=$((w / 2)) alt=$((h * 3 / 4)) ust=$((h / 3))
  # 1) Bosta: 10 sn hic dokunmadan (surekli animasyonlarin maliyeti).
  adb shell dumpsys gfxinfo "$PAKET" reset >/dev/null
  sleep 10
  adb shell dumpsys gfxinfo "$PAKET" > "$CIKIS/performans-ilerleme-bosta.txt"
  # 2) Kaydirma: 12 asagi/yukari surukleme, gok paneli ekrana girip cikar.
  adb shell dumpsys gfxinfo "$PAKET" reset >/dev/null
  for i in $(seq 1 12); do
    adb shell input swipe "$x" "$alt" "$x" "$ust" 400
    sleep 0.4
    adb shell input swipe "$x" "$ust" "$x" "$alt" 400
    sleep 0.4
  done
  adb shell dumpsys gfxinfo "$PAKET" framestats > "$CIKIS/performans-ilerleme-kaydirma.txt"
  {
    echo "### Ilerleme performansi (gfxinfo, $(git rev-parse --short HEAD))"
    for tur in bosta kaydirma; do
      echo ""
      echo "**$tur**"
      echo '```'
      grep -E "Total frames rendered|Janky frames|percentile|Number Slow UI thread|Number Slow issue draw commands|Number Frame deadline missed" \
        "$CIKIS/performans-ilerleme-$tur.txt" | grep -v "GPU" | head -12 || true
      echo '```'
    done
  } > "$ozet"
  cat "$ozet"
  for a in window_animation_scale transition_animation_scale animator_duration_scale; do
    adb shell settings put global "$a" 0
  done
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
    # AKIS_FILTRESI (workflow girdisi `akis_filtresi`): yalniz uyan akislar — tek ekran
    # icin 3,5 saatlik turu beklememek. Bos = hepsi (varsayilan davranis birebir).
    if [ -n "${AKIS_FILTRESI:-}" ] && ! [[ "$(basename "$akis")" =~ $AKIS_FILTRESI ]]; then
      continue
    fi
    # `# profil: <ad>` satiri: akis yalniz o profilde koşar (ornek: katlanabilir).
    akis_profili=$(sed -n 's/^# profil: *\([a-z|]*\).*/\1/p' "$akis" | head -1)
    if [ -n "$akis_profili" ] && ! [[ "$PROFIL" =~ ^($akis_profili)$ ]]; then
      continue
    fi
    varyant=$(sed -n 's/^# tohum: *\([a-z]*\).*/\1/p' "$akis" | head -1)
    varyant="${varyant:-ozellik}"
    echo "=== [$PROFIL/$tema] $akis (tohum: $varyant) ==="
    tohumla "$varyant" "$tema"
    # `# hazirlik: <ad>` satiri: akistan once adb ile cihaz durumu (sensor, izin) kurulur.
    hazirlik=$(sed -n 's/^# hazirlik: *\([a-z0-9-]*\).*/\1/p' "$akis" | head -1)
    if [ -n "$hazirlik" ]; then hazirlik_uygula "$hazirlik"; fi
    isaret=$(mktemp)
    # Bir akis dusse de digerleri cekilsin (her biri uygulamayi kendisi baslatir).
    maestro test "$akis" || echo "UYARI: $akis tamamlanamadi ($PROFIL/$tema)"
    if [ -n "$hazirlik" ]; then hazirlik_bitir "$hazirlik" "$tema"; fi
    # Yalniz BU akisin kareleri: isaret dosyasindan yeni olanlar.
    find "$HOME/.maestro/tests" "$PWD/ozk" -newer "$isaret" -path '*ozk/*' \( -name '*.png' -o -name '*.mp4' \) \
      -exec cp {} "$HEDEF/" \; 2>/dev/null || true
    rm -f "$isaret"
    # `# kanal-dokumu` isaretli akis: paketin bildirim kanallari (ses/onem) metin olarak.
    if grep -q '^# kanal-dokumu' "$akis"; then
      sleep 5
      adb shell dumpsys notification 2>/dev/null         | awk -v pkg="$PAKET" '/AppSettings: /{i=($2==pkg);next} i&&/NotificationChannel\{/'         > "$HEDEF/kanallar-$(basename "$akis" .yaml).txt" || true
      echo "Kanal dokumu: $(wc -l < "$HEDEF/kanallar-$(basename "$akis" .yaml).txt") satir"
      grep -o "mId='vakit_bildirim[^']*'[^,]*\|mSound=[^,]*" "$HEDEF/kanallar-$(basename "$akis" .yaml).txt" | head -20 || true
    fi
  done
done

if [ "${PERFORMANS_OLCUMU:-}" = "1" ] && [ "$PROFIL" = "telefon" ]; then
  performans_olc || echo "UYARI: performans olcumu tamamlanamadi"
fi

# Ozet: dosya adi + boyut; akislarin bekledigi ama cikmayan kare → UYARI.
BEKLENEN=$(for a in scripts/maestro/ozellik/*.yaml; do p=$(sed -n 's/^# profil: *\([a-z|]*\).*/\1/p' "$a" | head -1); { [ -z "$p" ] || [[ "$PROFIL" =~ ^($p)$ ]]; } && grep -h 'takeScreenshot: ozk/' "$a"; done | sed 's/.*ozk\///' | sort -u || true)
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
