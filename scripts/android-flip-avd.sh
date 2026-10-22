#!/usr/bin/env bash
# Flip (dikey katlanan, Z Flip tipi) emulatoru: hazir Flip AVD profili YOK. emulator-runner
# `pre-emulator-launch-script` olarak cagirir: olusturulan AVD'nin (test) config.ini'sine
# kompakt ekran (1080x2640) ve YATAY mentese tanimi yazilir. Mentese tek bir sensordur:
# aci 180 = acik, ~90 = yari acik (masaustu postur), `adb emu sensor set hinge-angle0 <aci>`.
# Anahtarlar Android Studio'nun katlanabilir cihaz tanimlariyla ayni bicimde (AVD config.ini):
#   hw.sensor.hinge.areas = x-y-genislik-yukseklik (px); yatay mentese → yukseklik 0.
# Emulator sistem imajinin bu tanimdan FoldingFeature uretip uretmedigi DOGRULANMADI; hat
# karesi bunu gosterir (dumpsys device_state + karede masaustu duzeni var mi).
set -euo pipefail
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
ayarla hw.lcd.width 1080
ayarla hw.lcd.height 2640
ayarla hw.lcd.density 440
ayarla hw.sensor.hinge yes
ayarla hw.sensor.hinge.count 1
ayarla hw.sensor.hinge.type 0
ayarla hw.sensor.hinge.sub_type 0
ayarla hw.sensor.hinge.ranges 0-180
ayarla hw.sensor.hinge.defaults 180
ayarla hw.sensor.hinge.areas 0-1320-1080-0
ayarla hw.sensor.hinge_angles_posture_definitions 0-30,30-150,150-180
ayarla hw.sensor.posture_list 1,2,3
ayarla hw.sensor.hinge.fold_to_displayRegion.0.1_at_posture 1
echo "Flip AVD yapilandirmasi:"
grep -E "^hw\.(lcd|sensor\.hinge|sensor\.posture)" "$CONFIG"
