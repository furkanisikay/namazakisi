#!/bin/bash
# Android production build + isteğe bağlı Play Store submit.
#
# Kullanım:
#   npm run build:android                    → build + Play Store'a gönder (varsayılan)
#   npm run build:android -- --no-publish    → sadece build, submit yok
#
# Gereksinimler (submit için):
#   - EAS'ta Google Service Account tanımlı olmalı (eas credentials ile ekle)
#   - eas-cli yüklü olmalı: npm install -g eas-cli

set -e

PUBLISH=true
SUBMIT_PROFILE="production"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --no-publish) PUBLISH=false ;;
    --submit-profile) SUBMIT_PROFILE="$2"; shift ;;
    *) echo "Bilinmeyen parametre: $1"; exit 1 ;;
  esac
  shift
done

echo ""
echo "🔨 EAS Android production build başlatılıyor..."

if [ "$PUBLISH" = "true" ]; then
  echo "📦 Build tamamlandığında Play Store'a otomatik gönderilecek."
fi

echo ""

# Build'i başlat ve bitene kadar bekle (--wait ile terminal bloklanır, ~10-15 dk)
npx eas-cli build \
  --platform android \
  --profile production \
  --non-interactive \
  --wait

BUILD_EXIT=$?

echo ""

if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ Build başarısız. Play Store submit atlanıyor."
  exit 1
fi

echo "✅ Build başarılı!"

if [ "$PUBLISH" = "false" ]; then
  echo "⏭️  Play Store submit atlanıyor (--no-publish)."
  exit 0
fi

echo ""
echo "🚀 Play Store'a gönderiliyor (profil: $SUBMIT_PROFILE)..."
bash "$(dirname "$0")/submit-android.sh" --profile "$SUBMIT_PROFILE"
