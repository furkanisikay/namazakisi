#!/usr/bin/env bash
# Emulatoru kare hattinin diline alir ve paket servisi kararli hale gelene kadar bekler.
# Kare hatlari `adb wait-for-device`'tan hemen sonra, APK kurmadan once cagirir.
#
# Dil: TOHUM_DIL=en → en-US, aksi hâlde tr-TR (saat/TV `values-en` tasidigi icin Turkce turda
# cihaz Turkce olmali). `-change-locale` emulator secenegi KULLANILMAZ: acilistan hemen sonra
# framework'u yeniden baslatir ve emulator-runner'in kendi kilit acma adimi (`input keyevent 82`)
# "Broken pipe" ile duser — o adim kapatilamaz. Burada dil, acilis tamamlandiktan sonra root ile
# yazilir ve framework bilincli olarak yeniden baslatilir.
#
# Bekleme: `sys.boot_completed` yeniden baslatmada 1 kalir, tek basina yetmez → paket servisi
# ART ARDA 3 kez cevap verene dek bekle.
set -uo pipefail

case "${TOHUM_DIL:-tr}" in en) HEDEF="en-US" ;; *) HEDEF="tr-TR" ;; esac

bekle() {
  local ardisik=0
  for _ in $(seq 1 90); do
    if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ] \
      && adb shell pm path android >/dev/null 2>&1; then
      ardisik=$((ardisik + 1))
      [ "$ardisik" -ge 3 ] && return 0
    else
      ardisik=0
    fi
    sleep 2
  done
  return 1
}

bekle || { echo "emulator 3 dakikada hazir olmadi" >&2; exit 1; }

MEVCUT=$(adb shell getprop persist.sys.locale | tr -d '\r')
[ -z "$MEVCUT" ] && MEVCUT=$(adb shell getprop ro.product.locale | tr -d '\r')
if [ "$MEVCUT" != "$HEDEF" ]; then
  echo "cihaz dili: '${MEVCUT:-varsayilan}' → $HEDEF"
  adb root >/dev/null 2>&1 || true
  adb wait-for-device
  if adb shell setprop persist.sys.locale "$HEDEF" 2>/dev/null; then
    adb shell setprop ctl.restart zygote
    sleep 8
    bekle || { echo "dil degisiminden sonra emulator hazir olmadi" >&2; exit 1; }
    adb shell input keyevent 82 >/dev/null 2>&1 || true
    adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
  else
    echo "UYARI: cihaz dili degistirilemedi (root yok); $MEVCUT ile devam" >&2
  fi
fi
echo "emulator hazir (hedef dil: $HEDEF)"
