#!/usr/bin/env bash
# iPad geniş ekran kareleri (dikey + yatay): Bugün, Ayarlar ve Kaza ana-ayrıntı, ev ekranı.
#
# Kullanim: bash scripts/simulator-ipad-genis.sh <udid> <bundle> <.app yolu> <cikis dizini>
#
# Gezinme idb dokunusu DEGIL derin baglantiyla (`simctl openurl namazakisi://ayarlar`):
# yatayda erisilebilirlik koordinatlari dikey cerceveye gore gelebiliyor.
#
# YATAY: simulator saati/yonu `simctl` ile dondurulemez. Kurulu .app imzasizdir
# (CODE_SIGNING_ALLOWED=NO) → Info.plist'te iPad yonleri YALNIZ yatay yapilip yeniden
# kurulur; sistem arayuzu yataya cevirir. `simctl io screenshot` cihazin dikey cercevesinde
# kaydeder → kare `sips` ile yataya cevrilir.
set -euo pipefail
UDID="$1"; BUNDLE="$2"; APP="$3"; CIKIS="$4"
mkdir -p "$CIKIS"

kare() { xcrun simctl io "$UDID" screenshot "$CIKIS/$1.png" >/dev/null 2>&1 || echo "UYARI: $1 cekilemedi"; }
ac() { xcrun simctl openurl "$UDID" "$1" || echo "UYARI: $1 acilamadi"; sleep "${2:-6}"; }
yeniden_ac() {
  xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 2
  xcrun simctl launch "$UDID" "$BUNDLE" >/dev/null
  sleep "${1:-14}"
}

# --- DIKEY (iki sutun + ana-ayrinti) ---
yeniden_ac
kare dikey-01-bugun
ac "namazakisi://ayarlar"; kare dikey-02-ayarlar
ac "namazakisi://kaza"; kare dikey-03-kaza

# --- YATAY (uc sutun) ---
PL="$APP/Info.plist"
/usr/libexec/PlistBuddy -c "Delete :UISupportedInterfaceOrientations~ipad" "$PL" >/dev/null 2>&1 || true
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations~ipad array" \
  -c "Add :UISupportedInterfaceOrientations~ipad:0 string UIInterfaceOrientationLandscapeLeft" \
  -c "Add :UISupportedInterfaceOrientations~ipad:1 string UIInterfaceOrientationLandscapeRight" "$PL"
xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
xcrun simctl install "$UDID" "$APP"
yeniden_ac
kare yatay-01-bugun
ac "namazakisi://ayarlar"; kare yatay-02-ayarlar
ac "namazakisi://kaza"; kare yatay-03-kaza
ac "namazakisi://ilerleme"; kare yatay-04-ilerleme

# --- EV EKRANI (ayar diskten acilir; yatay tam ekranda pano) ---
xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
KAP=$(xcrun simctl get_app_container "$UDID" "$BUNDLE" data)
MAN=$(find "$KAP" -name manifest.json -path '*RCTAsyncLocalStorage*' | head -1)
if [ -n "$MAN" ]; then
  node -e 'const fs=require("fs");const p=process.argv[1];const m=JSON.parse(fs.readFileSync(p,"utf8"));m["@namaz_akisi/ev_ekrani_ayari"]=JSON.stringify({acik:true});fs.writeFileSync(p,JSON.stringify(m));' "$MAN"
  yeniden_ac
  kare yatay-05-ev-ekrani
else
  echo "UYARI: manifest.json yok, ev ekranı karesi atlandı"
fi

# Yatay kareler dikey cercevede kaydedildiyse (en < boy) yataya cevir.
for f in "$CIKIS"/yatay-*.png; do
  [ -f "$f" ] || continue
  G=$(sips -g pixelWidth "$f" | tail -1 | awk '{print $2}')
  Y=$(sips -g pixelHeight "$f" | tail -1 | awk '{print $2}')
  if [ "$G" -lt "$Y" ]; then sips -r 270 "$f" >/dev/null; fi
done
for f in "$CIKIS"/*.png; do echo "$f -> $(sips -g pixelWidth -g pixelHeight "$f" | tail -2 | tr '\n' ' ')"; done
