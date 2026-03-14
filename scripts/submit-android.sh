#!/bin/bash
# Play Store'a AAB yükle ve CHANGELOG'dan release notes ekle.
#
# Kullanım:
#   ./scripts/submit-android.sh              → en son EAS build'i submit et
#   ./scripts/submit-android.sh <BUILD_ID>   → belirli bir build'i submit et
#
# Gereksinimler:
#   - EAS'ta Google Service Account tanımlı olmalı
#     (eas credentials ile ekle veya EXPO_GOOGLE_SERVICES_KEY env var)
#   - eas-cli yüklü olmalı: npm install -g eas-cli

set -e

BUILD_ID=$1
NOTES_FILE=$(mktemp /tmp/release-notes-XXXX.txt)

# CHANGELOG'dan en son versiyon notlarını çıkar
echo "Release notes çıkarılıyor..."
node "$(dirname "$0")/extract-changelog.js" > "$NOTES_FILE"

echo "--- Release Notes ---"
cat "$NOTES_FILE"
echo "---------------------"

# Submit komutu
if [ -n "$BUILD_ID" ]; then
  echo "Build $BUILD_ID submit ediliyor..."
  npx eas-cli submit \
    --platform android \
    --profile production \
    --id "$BUILD_ID" \
    --release-notes-file "$NOTES_FILE" \
    --non-interactive
else
  echo "En son build submit ediliyor..."
  npx eas-cli submit \
    --platform android \
    --profile production \
    --latest \
    --release-notes-file "$NOTES_FILE" \
    --non-interactive
fi

rm -f "$NOTES_FILE"
echo "Submit tamamlandı."
