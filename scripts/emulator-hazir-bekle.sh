#!/usr/bin/env bash
# Emulatorun paket servisi kararli hale gelene kadar bekler (kare hatlari APK kurmadan once cagirir).
# Neden: `-change-locale` acilis tamamlanir tamamlanmaz framework'u yeniden baslatir; o arada
# `adb install` "Failure calling service package: Broken pipe" ile duser. `sys.boot_completed`
# yeniden baslatmada 1 kalir, tek basina yetmez → paket servisi ART ARDA 3 kez cevap verene dek bekle.
set -uo pipefail

ardisik=0
for _ in $(seq 1 90); do
  if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ] \
    && adb shell pm path android >/dev/null 2>&1; then
    ardisik=$((ardisik + 1))
    [ "$ardisik" -ge 3 ] && { echo "emulator hazir (yerel ayar: $(adb shell getprop persist.sys.locale | tr -d '\r'))"; exit 0; }
  else
    ardisik=0
  fi
  sleep 2
done
echo "emulator 3 dakikada hazir olmadi" >&2
exit 1
