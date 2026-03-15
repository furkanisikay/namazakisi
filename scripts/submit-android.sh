#!/bin/bash
# Play Store'a AAB yükle ve CHANGELOG'dan release notes ekle.
#
# Kullanım:
#   ./scripts/submit-android.sh                         → en son EAS build'i submit et (production)
#   ./scripts/submit-android.sh --profile closed-testing → closed testing'e submit et
#   ./scripts/submit-android.sh <BUILD_ID>              → belirli bir build'i submit et
#
# Gereksinimler:
#   - EAS'ta Google Service Account tanımlı olmalı
#     (eas credentials ile ekle veya EXPO_GOOGLE_SERVICES_KEY env var)
#   - eas-cli yüklü olmalı: npm install -g eas-cli

set -e

BUILD_ID=""
SUBMIT_PROFILE="production"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --profile) SUBMIT_PROFILE="$2"; shift ;;
    *) BUILD_ID="$1" ;;
  esac
  shift
done

# ==========================================
# Release notes → fastlane metadata klasörü
# EAS Submit bu klasörü otomatik okur.
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_CODE=$(cd "$ROOT_DIR" && node -p "require('./app.json').expo.android.versionCode")
METADATA_DIR="$ROOT_DIR/fastlane/metadata/android"

echo "Release notes CHANGELOG'dan çıkarılıyor (versionCode: $VERSION_CODE)..."
NOTES=$(node "$(dirname "$0")/extract-changelog.js")

echo "--- Release Notes ---"
echo "$NOTES"
echo "---------------------"

# Türkçe ve İngilizce metadata klasörlerine yaz
for LOCALE in "tr-TR" "en-US"; do
  LOCALE_DIR="$METADATA_DIR/$LOCALE/changelogs"
  mkdir -p "$LOCALE_DIR"
  echo "$NOTES" > "$LOCALE_DIR/${VERSION_CODE}.txt"
done

echo "✅ Release notes metadata klasörüne yazıldı"

# ==========================================
# Submit komutu
# ==========================================
if [ -n "$BUILD_ID" ]; then
  echo "Build $BUILD_ID submit ediliyor (profil: $SUBMIT_PROFILE)..."
  npx eas-cli submit \
    --platform android \
    --profile "$SUBMIT_PROFILE" \
    --id "$BUILD_ID" \
    --non-interactive
else
  echo "En son build submit ediliyor (profil: $SUBMIT_PROFILE)..."
  npx eas-cli submit \
    --platform android \
    --profile "$SUBMIT_PROFILE" \
    --latest \
    --non-interactive
fi

echo "Submit tamamlandı."
