#!/usr/bin/env bash
# Katlanabilir emulatorler: runner'daki cmdline-tools'ta `pixel_fold` profili YOK ve hazir
# Flip profili hic yok. emulator-runner `pre-emulator-launch-script` olarak cagirir;
# olusturulan AVD'nin (test) config.ini'sine ekran olcusu + mentese tanimi yazilir.
#   flip  — dikey katlanan kompakt telefon (Z Flip tipi): 1080x2640, mentese YATAY.
#   fold  — kitap gibi acilan (Pixel Fold tipi) ic ekran: 2208x1840, mentese DIKEY.
# Mentese tek sensordur: aci 180 = acik, ~90 = yari acik (`adb emu sensor set hinge-angle0`).
# hw.sensor.hinge.areas = x-y-genislik-yukseklik (px).
set -euo pipefail
TUR="${1:-flip}"
CONFIG="$HOME/.android/avd/test.avd/config.ini"
[ -f "$CONFIG" ] || { echo "AVD config bulunamadi: $CONFIG"; ls -la "$HOME/.android/avd" || true; exit 0; }
ayarla() {
  local anahtar="$1" deger="$2"
  if grep -q "^${anahtar} *=" "$CONFIG"; then
    sed -i "s|^${anahtar} *=.*|${anahtar}=${deger}|" "$CONFIG"
  else
    echo "${anahtar}=${deger}" >> "$CONFIG"
  fi
}
if [ "$TUR" = "fold" ]; then
  ayarla hw.lcd.width 2208
  ayarla hw.lcd.height 1840
  ayarla hw.lcd.density 420
  ayarla hw.sensor.hinge.areas 1104-0-0-1840
else
  ayarla hw.lcd.width 1080
  ayarla hw.lcd.height 2640
  ayarla hw.lcd.density 440
  ayarla hw.sensor.hinge.areas 0-1320-1080-0
fi
ayarla hw.sensor.hinge yes
ayarla hw.sensor.hinge.count 1
ayarla hw.sensor.hinge.type 1
ayarla hw.sensor.hinge.sub_type 1
ayarla hw.sensor.hinge.ranges 0-180
ayarla hw.sensor.hinge.defaults 180
ayarla hw.sensor.hinge_angles_posture_definitions 0-30,30-150,150-180
ayarla hw.sensor.posture_list 1,2,3
echo "Katlanabilir ($TUR) AVD yapilandirmasi:"
grep -E "^hw\.(lcd|sensor\.hinge|sensor\.posture)" "$CONFIG"
