#!/usr/bin/env bash
# Butun ham ekran goruntusu hatlarini AYNI ANDA baslatir (pazarlama gorselleri icin tek koşu).
# Neden ayni anda: telefon, saat, TV ve tablet kareleri ayni vakitte cekilmezse cihazlar
# arasinda vakit/kalan sure celisir (ornek: telefon Ogle, saat Yatsi). Kosuyu OGLE
# penceresinde baslatin (Istanbul: ogle girdikten sonra, ikindiden en az ~2 saat once);
# saat dilimi hilesi YOK, iOS saat hatti `saat_hedef=simdi` ile gercek vakti ceker.
#
# Kullanim:
#   bash scripts/kare-hatlarini-baslat.sh baslat [dal] [cikti]   # hepsini baslat, run id'leri yaz
#   bash scripts/kare-hatlarini-baslat.sh durum  [cikti]          # her hattin durumu (tek sefer)
#   bash scripts/kare-hatlarini-baslat.sh bekle  [cikti]          # hepsi bitene kadar 60 sn'de bir durum
# Varsayilanlar: dal = mevcut git dali, cikti = $KARE_KOSUSU ya da $TMPDIR/kare-kosusu.txt (satir: "<ad> <run id>").
# Monitor ile beklemek icin: `bash scripts/kare-hatlarini-baslat.sh bekle` (her satir bir olay;
# en sonda "HEPSI BITTI" yazar). Watch (iOS saat) hatti simulator acilisi yuzunden en uzun
# suren hattir (~35-45 dk); Android ikisi APK derleyip iki tur cektigi icin ~1,5-2 sa surebilir.
set -euo pipefail

KOMUT="${1:-baslat}"

hat_listesi() {
  # ad | workflow | ek -f girdileri (bosluklu)
  cat <<'EOF'
ios-saat|ios-ekran-goruntuleri.yml|tur=saat saat_hedef=simdi
ios-ikisi|ios-ekran-goruntuleri.yml|tur=ikisi
ios-ipad|ios-ekran-goruntuleri.yml|tur=ipad
android-ikisi|android-ekran-goruntuleri.yml|tur=ikisi
android-tablet|android-ekran-goruntuleri.yml|tur=tablet
android-cihazlar|android-ekran-goruntuleri.yml|tur=cihazlar
android-katlanabilir|android-ekran-goruntuleri.yml|tur=katlanabilir
EOF
}

son_run_id() {
  gh run list --workflow "$1" --branch "$2" --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId // 0'
}

baslat() {
  local dal="${1:-$(git rev-parse --abbrev-ref HEAD)}"
  local cikti="${2:-${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}}"
  : > "$cikti"
  echo "Dal: $dal · baslangic: $(TZ='<+03>-3' date '+%Y-%m-%d %H:%M') (Istanbul)"
  while IFS='|' read -r ad wf girdiler; do
    [ -n "$ad" ] || continue
    local onceki yeni argumanlar=()
    onceki=$(son_run_id "$wf" "$dal")
    for g in $girdiler; do argumanlar+=(-f "$g"); done
    gh workflow run "$wf" --ref "$dal" "${argumanlar[@]}"
    # Yeni kosunun listede gorunmesini bekle (dispatch kimlik dondurmez).
    yeni="$onceki"
    for _ in $(seq 1 30); do
      sleep 3
      yeni=$(son_run_id "$wf" "$dal")
      [ "$yeni" != "$onceki" ] && break
    done
    if [ "$yeni" = "$onceki" ]; then
      echo "UYARI: $ad kosusu listede gorunmedi" >&2
      continue
    fi
    echo "$ad $yeni" | tee -a "$cikti"
  done < <(hat_listesi)
  echo "Run id'ler: $cikti"
}

durum() {
  local cikti="${1:-${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}}"
  local bitmeyen=0
  while read -r ad id; do
    [ -n "$id" ] || continue
    local s
    s=$(gh run view "$id" --json status,conclusion --jq '.status + " " + (.conclusion // "")')
    echo "$ad $id $s"
    case "$s" in completed*) ;; *) bitmeyen=$((bitmeyen + 1)) ;; esac
  done < "$cikti"
  return "$bitmeyen"
}

bekle() {
  local cikti="${1:-${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}}"
  local onceki=""
  while true; do
    local simdi kalan=0
    simdi=$(durum "$cikti") || kalan=$?
    if [ "$simdi" != "$onceki" ]; then
      echo "--- $(TZ='<+03>-3' date '+%H:%M') ---"
      echo "$simdi"
      onceki="$simdi"
    fi
    if [ "$kalan" -eq 0 ]; then
      echo "HEPSI BITTI"
      return 0
    fi
    sleep 60
  done
}

case "$KOMUT" in
  baslat) baslat "${2:-}" "${3:-}" ;;
  durum) durum "${2:-${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}}" || true ;;
  bekle) bekle "${2:-${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}}" ;;
  *)
    echo "kullanim: $0 baslat|durum|bekle" >&2
    exit 2
    ;;
esac
