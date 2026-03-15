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
NOTES_FILE=$(mktemp /tmp/release-notes-XXXX.txt)

# CHANGELOG'dan en son versiyon notlarını çıkar
echo "Release notes çıkarılıyor..."
node "$(dirname "$0")/extract-changelog.js" > "$NOTES_FILE"

echo "--- Release Notes ---"
cat "$NOTES_FILE"
echo "---------------------"

# Submit komutu
if [ -n "$BUILD_ID" ]; then
  echo "Build $BUILD_ID submit ediliyor (profil: $SUBMIT_PROFILE)..."
  npx eas-cli submit \
    --platform android \
    --profile "$SUBMIT_PROFILE" \
    --id "$BUILD_ID" \
    --release-notes-file "$NOTES_FILE" \
    --non-interactive
else
  echo "En son build submit ediliyor (profil: $SUBMIT_PROFILE)..."
  npx eas-cli submit \
    --platform android \
    --profile "$SUBMIT_PROFILE" \
    --latest \
    --release-notes-file "$NOTES_FILE" \
    --non-interactive
fi

rm -f "$NOTES_FILE"
echo "Submit tamamlandı."
