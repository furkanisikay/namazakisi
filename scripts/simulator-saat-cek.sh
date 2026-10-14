#!/usr/bin/env bash
# Apple Watch magaza kareleri (issue #285) — `ios-ekran-goruntuleri.yml`, `tur: saat`.
#
# Kullanim: scripts/simulator-saat-cek.sh <cikti-dizini> <NamazSaat.app>
#
# Adimlar: en buyuk App Store boyutunu veren Apple Watch simulatoru (Ultra 3/4 = 422x514)
# + bir iPhone simulatoru olusturulur ve eslenir, saat uygulamasi kurulur, ornek yuk
# (`scripts/saat-tohum-yuku.js`) baslatma ortamiyla verilir ve her ekran temiz bir
# acilisla cekilir (`NAMAZ_SAAT_EKRAN`, yalniz simulator derlemesinde okunur).
#
# NEDEN WatchConnectivity DEGIL: eslenmis simulator ciftinde iPhone uygulamasindan
# yukun ne zaman (ve gelip gelmedigi) dogrulanamiyor; kare zamanlamaya bagli kalirdi.
# Yuku ortamdan vermek deterministik ve iPhone derlemesi (~25 dk) gerektirmez.
#
# Eksik kare HATA DEGIL: adim ozetinde UYARI olarak yazilir (diger kareler korunur).
set -uo pipefail

CIKTI="${1:?cikti dizini}"
APP="${2:?NamazSaat.app yolu}"
mkdir -p "$CIKTI"
OZET="${GITHUB_STEP_SUMMARY:-/dev/null}"

# stdin'deki JSON'u `j` olarak alip $1 ifadesini yazdirir. Ifadeler YALNIZ bu betikteki
# sabit dizelerdir (dis girdi degil); veri JSON.parse ile okunur.
json() { node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log(eval(process.argv[1]))})' "$1"; }

# --- Cihaz secimi -----------------------------------------------------------------
# Tercih sirasi = App Store'un kabul ettigi EN BUYUK kare. Simulatorun verdigi gercek
# boyut asagida sips ile olculur ve yazdirilir.
SAAT_RT=$(xcrun simctl list runtimes -j | json 'j.runtimes.filter(r=>r.platform==="watchOS"&&r.isAvailable).map(r=>r.identifier).pop()||""')
IOS_RT=$(xcrun simctl list runtimes -j | json 'j.runtimes.filter(r=>r.platform==="iOS"&&r.isAvailable).map(r=>r.identifier).pop()||""')
[ -z "$SAAT_RT" ] && { echo "watchOS runtime yok"; exit 1; }
SAAT_TIPI=$(xcrun simctl list devicetypes -j | json '(()=>{const t=j.devicetypes.map(x=>x.name);for(const re of [/^Apple Watch Ultra 4/,/^Apple Watch Ultra 3/,/^Apple Watch Ultra 2/,/^Apple Watch Ultra/,/^Apple Watch Series 1[0-9] \(46mm\)/,/^Apple Watch Series 9 \(45mm\)/]){const b=t.filter(n=>re.test(n)).sort();if(b.length)return b[b.length-1];}return "";})()')
TELEFON_TIPI=$(xcrun simctl list devicetypes -j | json '(()=>{const t=j.devicetypes.map(x=>x.name).filter(n=>/^iPhone 1[6-9]( Pro)?$/.test(n)).sort();return t.pop()||"";})()')
echo "watchOS runtime: $SAAT_RT · cihaz: $SAAT_TIPI"
echo "iOS runtime: $IOS_RT · eş telefon: $TELEFON_TIPI"
[ -z "$SAAT_TIPI" ] && { echo "Apple Watch cihaz tipi bulunamadi"; xcrun simctl list devicetypes | grep -i watch; exit 1; }

# --- Tohum (simulatorler acilmadan ONCE: saat dilimi ona gore kurulur) ---------------
TOHUM=$(node scripts/saat-tohum-yuku.js)
TZ_ADI=$(echo "$TOHUM" | json 'j.tz')
SAAT_METNI=$(echo "$TOHUM" | json 'j.durumCubuguSaati')
YUK=$(echo "$TOHUM" | json 'j.yuk')
echo "Saat dilimi: $TZ_ADI · ekrandaki saat: $SAAT_METNI · öğleye/ikindiye kalan: $(echo "$TOHUM" | json 'j.kalanDk') dk"
echo "İstanbul vakitleri ($(echo "$TOHUM" | json 'j.tarih')): $(echo "$TOHUM" | json 'JSON.stringify(j.istanbulVakitleri)')"

# Saatin KENDI saati (sag ustteki) uygulamanin geri sayimiyla tutarli olsun: watchOS
# simulatorunde `simctl status_bar override` CALISMAZ (olculdu) ve simulator saat
# dilimini Mac'ten alir → yalniz CI'da (gecici makine) Mac'in saat dilimi degistirilir.
if [ "${GITHUB_ACTIONS:-}" = "true" ] && [ -f "/usr/share/zoneinfo/$TZ_ADI" ]; then
  sudo ln -sf "/usr/share/zoneinfo/$TZ_ADI" /etc/localtime && echo "Mac saat dilimi: $TZ_ADI ($(date '+%H:%M %Z'))"
fi

# Turkce bolge + 24 saat: tercih dosyasi ACILISTAN ONCE yazilir (fastlane snapshot
# `localize_simulator` yontemi). `simctl spawn ... defaults write` KULLANMA — cfprefsd'yi
# bekleyip adimi kilitler (AGENTS.md).
yerellestir() {
  local tercih="$HOME/Library/Developer/CoreSimulator/Devices/$1/data/Library/Preferences/.GlobalPreferences.plist"
  mkdir -p "$(dirname "$tercih")"
  /usr/libexec/PlistBuddy -c "Delete :AppleLanguages" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleLanguages array" -c "Add :AppleLanguages:0 string tr-TR" "$tercih"
  /usr/libexec/PlistBuddy -c "Delete :AppleLocale" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleLocale string tr_TR" "$tercih"
  /usr/libexec/PlistBuddy -c "Delete :AppleICUForce24HourTime" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleICUForce24HourTime bool true" "$tercih"
}

SAAT=$(xcrun simctl create "magaza-saat" "$SAAT_TIPI" "$SAAT_RT")
yerellestir "$SAAT"
if [ -n "$IOS_RT" ] && [ -n "$TELEFON_TIPI" ]; then
  TELEFON=$(xcrun simctl create "magaza-saat-telefon" "$TELEFON_TIPI" "$IOS_RT")
  yerellestir "$TELEFON"
  # Esleme: saat uygulamasi telefona bagli (`WKRunsIndependentlyOfCompanionApp=false`).
  xcrun simctl pair "$SAAT" "$TELEFON" || echo "UYARI: esleme yapilamadi (saat tek basina denenecek)"
  xcrun simctl boot "$TELEFON" || true
fi
xcrun simctl boot "$SAAT" || true
xcrun simctl bootstatus "$SAAT" -b
echo "Saat simülatörünün saati: $(xcrun simctl spawn "$SAAT" date '+%H:%M %Z' 2>/dev/null || echo '?') (beklenen ~$SAAT_METNI)"

xcrun simctl install "$SAAT" "$APP"
BUNDLE=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP/Info.plist")
echo "saat paketi: $BUNDLE"

# --- Kareler ----------------------------------------------------------------------
# ad:ekran:bekleme(sn)
KARELER="01-ana:ana:12 02-vakitler:vakitler:8 03-kildim-onayi:onay:8 04-tesbihat:tesbihat:8"
BEKLENEN=0
for k in $KARELER; do
  IFS=: read -r AD EKRAN BEKLE <<<"$k"
  BEKLENEN=$((BEKLENEN + 1))
  xcrun simctl terminate "$SAAT" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 1
  if ! SIMCTL_CHILD_TZ="$TZ_ADI" \
    SIMCTL_CHILD_NAMAZ_SAAT_EKRAN="$EKRAN" \
    SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YUK="$YUK" \
    SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_TESBIHAT="45" \
    xcrun simctl launch "$SAAT" "$BUNDLE"; then
    echo "UYARI: $AD için uygulama başlatılamadı"
    continue
  fi
  sleep "$BEKLE"
  HAM="$CIKTI/$AD.ham.png"
  xcrun simctl io "$SAAT" screenshot --type=png "$HAM" || { echo "UYARI: $AD çekilemedi"; continue; }
  # App Store alfa kanali kabul etmez → JPEG'den gecirip alfasiz PNG yap.
  sips -s format jpeg -s formatOptions best "$HAM" --out "$CIKTI/$AD.jpg" >/dev/null
  sips -s format png "$CIKTI/$AD.jpg" --out "$CIKTI/$AD.png" >/dev/null
  rm -f "$HAM" "$CIKTI/$AD.jpg"
done

# --- Ozet -------------------------------------------------------------------------
{
  echo "### ⌚ Apple Watch kareleri"
  echo ""
  echo "Cihaz: **$SAAT_TIPI** · saat dilimi \`$TZ_ADI\` · ekran saati $SAAT_METNI"
  echo ""
  echo "| Kare | Boyut | Alfa |"
  echo "|---|---|---|"
} >>"$OZET"
CEKILEN=0
for k in $KARELER; do
  AD="${k%%:*}"
  F="$CIKTI/$AD.png"
  if [ -f "$F" ]; then
    CEKILEN=$((CEKILEN + 1))
    G=$(sips -g pixelWidth "$F" | awk '/pixelWidth/{print $2}')
    Y=$(sips -g pixelHeight "$F" | awk '/pixelHeight/{print $2}')
    A=$(sips -g hasAlpha "$F" | awk '/hasAlpha/{print $2}')
    echo "$AD.png -> ${G}x${Y} (alfa: $A)"
    echo "| $AD | ${G}×${Y} | $A |" >>"$OZET"
    case "${G}x${Y}" in
      422x514|410x502|416x496|396x484|368x448|312x390) ;;
      *) echo "UYARI: $AD boyutu (${G}x${Y}) App Store Apple Watch boyutlarından biri değil" | tee -a "$OZET" ;;
    esac
  else
    echo "UYARI: $AD.png eksik" | tee -a "$OZET"
  fi
done
echo "" >>"$OZET"
echo "Çekilen: $CEKILEN / $BEKLENEN" | tee -a "$OZET"
[ "$CEKILEN" -eq 0 ] && exit 1
exit 0
