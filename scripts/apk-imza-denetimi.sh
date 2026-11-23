#!/usr/bin/env bash
# GitHub Release APK'sının imza sertifikasını denetler (android-build.yml, release).
#
# Kullanım: apk-imza-denetimi.sh <apk> <depodaki debug.keystore>
# Çıkış: 0 = APK depodaki debug anahtarından BAŞKA bir sertifikayla imzalı (yayınlanabilir)
#        3 = debug anahtarıyla imzalı (herkes aynı anahtarla "güncelleme" üretebilir → YAYINLAMA)
#        4 = imza okunamadı / araç yok (doğrulanamayan APK yayınlanmaz)
#
# Parmak izi sabit yazılmaz: depodaki debug.keystore'dan o an hesaplanır.
set -euo pipefail

APK="${1:?apk yolu gerekli}"
DEBUG_KEYSTORE="${2:?debug.keystore yolu gerekli}"

parmak_izi_sade() { tr -d ': \t\r' | tr 'A-F' 'a-f'; }

APKSIGNER="$(command -v apksigner || true)"
if [ -z "$APKSIGNER" ]; then
  for kok in "${ANDROID_HOME:-}" "${ANDROID_SDK_ROOT:-}"; do
    [ -n "$kok" ] && [ -d "$kok/build-tools" ] || continue
    APKSIGNER="$(find "$kok/build-tools" -maxdepth 2 -name apksigner -type f 2>/dev/null | sort -V | tail -1)"
    [ -n "$APKSIGNER" ] && break
  done
fi
if [ -z "$APKSIGNER" ] || ! command -v keytool >/dev/null 2>&1; then
  echo "::warning::apksigner ya da keytool bulunamadı; APK imzası doğrulanamadı"
  exit 4
fi

DEBUG_IZ="$(keytool -list -v -keystore "$DEBUG_KEYSTORE" -storepass android 2>/dev/null \
  | sed -n 's/^[[:space:]]*SHA256:[[:space:]]*//p' | head -1 | parmak_izi_sade)"
APK_IZLERI="$("$APKSIGNER" verify --print-certs "$APK" 2>/dev/null \
  | sed -n 's/^Signer #[0-9]* certificate SHA-256 digest:[[:space:]]*//p' | parmak_izi_sade)"

if [ -z "$DEBUG_IZ" ] || [ -z "$APK_IZLERI" ]; then
  echo "::warning::APK imza sertifikası okunamadı"
  exit 4
fi

if printf '%s\n' "$APK_IZLERI" | grep -qx "$DEBUG_IZ"; then
  echo "::warning::APK depodaki herkese açık debug anahtarıyla imzalı"
  exit 3
fi

echo "✅ APK imzası debug anahtarı değil (SHA-256: $(printf '%s' "$APK_IZLERI" | head -1))"
