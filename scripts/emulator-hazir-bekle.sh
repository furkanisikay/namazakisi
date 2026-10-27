#!/usr/bin/env bash
# Emulatoru kare hattinin diline alir ve paket servisi kararli hale gelene kadar bekler.
# Kare hatlari `adb wait-for-device`'tan hemen sonra, APK kurmadan once cagirir.
#
# Dil: TOHUM_DIL (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn) → cihaz dili; bilinmeyen kod tr-TR (saat/TV `values-en` tasidigi icin Turkce turda
# cihaz Turkce olmali). `-change-locale` emulator secenegi KULLANILMAZ: acilistan hemen sonra
# framework'u yeniden baslatir ve emulator-runner'in kendi kilit acma adimi (`input keyevent 82`)
# "Broken pipe" ile duser — o adim kapatilamaz. Burada dil, acilis tamamlandiktan sonra root ile
# yazilir ve framework bilincli olarak yeniden baslatilir.
#
# Bekleme: `sys.boot_completed` yeniden baslatmada 1 kalir, tek basina yetmez → paket servisi
# ART ARDA 3 kez cevap verene dek bekle.
set -uo pipefail

case "${TOHUM_DIL:-tr}" in
  en) HEDEF="en-US" ;; id) HEDEF="id-ID" ;; de) HEDEF="de-DE" ;; fr) HEDEF="fr-FR" ;;
  bs) HEDEF="bs-BA" ;; ru) HEDEF="ru-RU" ;; ms) HEDEF="ms-MY" ;;
  ar) HEDEF="ar-SA" ;; ur) HEDEF="ur-PK" ;;
  # es/nl/sq/hi/bn seçicide kapalıdır: tohumun dil kaydını (`dil_ayari.kod`) kare hattı işareti (`@namaz_akisi/kare_turu`) açar.
  es) HEDEF="es-ES" ;; nl) HEDEF="nl-NL" ;; sq) HEDEF="sq-AL" ;; hi) HEDEF="hi-IN" ;; bn) HEDEF="bn-BD" ;;
  *) HEDEF="tr-TR" ;;
esac

# Maestro akislari iki dillidir ("(Turkce|Ingilizce)" secicileri); baska dilin turunda
# secicilere sozlukten o dilin karsiligi eklenir (CI kopyasinda, yerinde; tekrar kosmak zararsiz).
case "${TOHUM_DIL:-tr}" in tr|en) ;; *) node scripts/maestro/akislari-yerellestir.js "$TOHUM_DIL" || echo "UYARI: akislar yerellestirilemedi" ;; esac

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
# Kök yetkisi olmayan imajda (Android TV) sistem dili degismez; kare hatti uygulama kurulunca
# uygulamaya ozel dili (Android 13+, `cmd locale set-app-locales`) bu dosyadan okur.
echo "$HEDEF" > "${RUNNER_TEMP:-/tmp}/kare-hedef-dil"
echo "emulator hazir (hedef dil: $HEDEF)"
