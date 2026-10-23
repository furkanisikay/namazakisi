#!/usr/bin/env bash
# Butun ham ekran goruntusu hatlarini TEK KOSUDA baslatir (pazarlama gorselleri).
# Neden birlikte: telefon, saat, TV ve tablet kareleri ayni vakitte cekilmezse cihazlar
# arasinda vakit/kalan sure celisir (ornek: telefon Ogle, saat Yatsi). Kosuyu OGLE
# penceresinde yapin; saat dilimi hilesi YOK, iOS saat hatti `saat_hedef=simdi` ile
# gercek Istanbul vaktini ceker.
#
# Zamanlama: derleme isteyen hatlar (telefon/iPad/tablet/katlanabilir) HEMEN baslar, ilk
# kareleri ~20-60 dk sonra gelir. Saat+TV ve iOS saat ilk kareyi dakikalar icinde cektigi
# icin `GEC_BASLAMA` (Istanbul HHMM, varsayilan 1257 = ogle girisi + ~3 dk) anina kadar
# BEKLER — ogle girmeden baslarlarsa "Gunes" vaktini cekerler. Hedef: telefon, saat ve TV
# kareleri birbirine ~10 dk icinde dussun. Ornek: 12:41'de `baslat` → 5 hat 12:41'de,
# saat hatlari 12:57'de.
#
# Kullanim:
#   bash scripts/kare-hatlarini-baslat.sh baslat [dal] [cikti]   # baslat, run id'leri yaz
#   bash scripts/kare-hatlarini-baslat.sh durum  [cikti]          # her hattin durumu (tek sefer)
#   bash scripts/kare-hatlarini-baslat.sh bekle  [cikti]          # hepsi bitene kadar 60 sn'de bir durum
# Varsayilanlar: dal = mevcut git dali, cikti = $KARE_KOSUSU ya da $TMPDIR/kare-kosusu.txt
# (satir: "<ad> <run id> <baslama saati>").
# Monitor ile beklemek icin: `bash scripts/kare-hatlarini-baslat.sh bekle` (degisiklikte satir
# basar, en sonda "HEPSI BITTI"). En uzun hat Android ikisi (APK + iki tur, ~1,5 sa);
# Watch hatti simulator acilisi yuzunden ~25-30 dk.
set -euo pipefail

KOMUT="${1:-baslat}"
VARSAYILAN_CIKTI="${KARE_KOSUSU:-${TMPDIR:-/tmp}/kare-kosusu.txt}"

hat_listesi() {
  # ad | workflow | ek -f girdileri (bosluklu) | gec (bos = hemen; "gec" = GEC_BASLAMA'da)
  cat <<'LISTE'
ios-ikisi|ios-ekran-goruntuleri.yml|tur=ikisi|
ios-ipad|ios-ekran-goruntuleri.yml|tur=ipad|
android-ikisi|android-ekran-goruntuleri.yml|tur=ikisi|
android-tablet|android-ekran-goruntuleri.yml|tur=tablet|
android-katlanabilir|android-ekran-goruntuleri.yml|tur=katlanabilir|
ios-saat|ios-ekran-goruntuleri.yml|tur=saat saat_hedef=simdi|gec
android-cihazlar|android-ekran-goruntuleri.yml|tur=cihazlar|gec
LISTE
}

# Istanbul saati (UTC+3, yaz saati yok). Git Bash zoneinfo bilmeyebilir → POSIX TZ.
istanbul() { TZ='<+03>-3' date "+$1"; }

son_run_id() {
  gh run list --workflow "$1" --branch "$2" --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId // 0'
}

tek_baslat() {
  local ad="$1" wf="$2" girdiler="$3" dal="$4" cikti="$5"
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
    return 0
  fi
  echo "$ad $yeni $(istanbul '%H:%M')" | tee -a "$cikti"
}

baslat() {
  local dal="${1:-$(git rev-parse --abbrev-ref HEAD)}"
  local cikti="${2:-$VARSAYILAN_CIKTI}"
  local gec="${GEC_BASLAMA:-1257}"
  local ad wf girdiler zaman
  : > "$cikti"
  echo "Dal: $dal · baslangic: $(istanbul '%Y-%m-%d %H:%M') (Istanbul) · gec hatlar: $gec"
  while IFS='|' read -r ad wf girdiler zaman; do
    if [ -n "$ad" ] && [ -z "$zaman" ]; then tek_baslat "$ad" "$wf" "$girdiler" "$dal" "$cikti"; fi
  done < <(hat_listesi)
  if [ "$((10#$(istanbul '%H%M')))" -lt "$((10#$gec))" ]; then
    echo "Gec hatlar icin $gec bekleniyor..."
    while [ "$((10#$(istanbul '%H%M')))" -lt "$((10#$gec))" ]; do sleep 15; done
  fi
  while IFS='|' read -r ad wf girdiler zaman; do
    if [ -n "$ad" ] && [ -n "$zaman" ]; then tek_baslat "$ad" "$wf" "$girdiler" "$dal" "$cikti"; fi
  done < <(hat_listesi)
  echo "Run id'ler: $cikti"
}

durum() {
  local cikti="${1:-$VARSAYILAN_CIKTI}"
  local bitmeyen=0 ad id s
  while read -r ad id _; do
    [ -n "$id" ] || continue
    s=$(gh run view "$id" --json status,conclusion --jq '.status + " " + (.conclusion // "")')
    echo "$ad $id $s"
    case "$s" in completed*) ;; *) bitmeyen=$((bitmeyen + 1)) ;; esac
  done < "$cikti"
  return "$bitmeyen"
}

bekle() {
  local cikti="${1:-$VARSAYILAN_CIKTI}"
  local onceki="" simdi kalan
  while true; do
    kalan=0
    simdi=$(durum "$cikti") || kalan=$?
    if [ "$simdi" != "$onceki" ]; then
      echo "--- $(istanbul '%H:%M') ---"
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
  durum) durum "${2:-$VARSAYILAN_CIKTI}" || true ;;
  bekle) bekle "${2:-$VARSAYILAN_CIKTI}" ;;
  *)
    echo "kullanim: $0 baslat|durum|bekle" >&2
    exit 2
    ;;
esac
