#!/usr/bin/env bash
# iPhone'un PAKETLENMIS bildirim seslerini (zil/ikiton/damla/sabah) SENTEZLER.
#
# Neden sentez: sesler projenin kendi uretimidir (ffmpeg `aevalsrc`, disaridan ornek
# YOK) -> lisans sorusu dogmaz (GPLv3 + §7 ek izni, magaza dagitimi). Ayrinti:
# docs/ajan/muhafiz-ses-ve-kanal.md > iPhone'da bildirim sesi.
#
# Kullanim (repo kokunden): bash scripts/ios-paket-sesleri.sh
# Cikti: assets/sounds/<ad>_ios.wav — 16-bit PCM, 22.05 kHz, mono, tepe -6 dBFS, <4 sn.
# Dosya adi `_ios` sonekli: `expo-notifications.sounds` dizisi platform ortaktir; govde
# adi Android `res/raw` kaynaklariyla cakismamali (nobetci `sesVarlikCakismasi.test.ts`).
set -euo pipefail
OUT="assets/sounds"
GECICI="$(mktemp -d)"
trap 'rm -rf "$GECICI"' EXIT

# Notalari (F frekans, T notanin yerel zamani) d gecikmesiyle toplar.
dizi() {
  local sablon="$1"; shift
  local toplam=""
  for p in "$@"; do
    local d="${p%%:*}" f="${p##*:}"
    local n="${sablon//T/(t-$d)}"
    n="${n//F/$f}"
    toplam="$toplam+gte(t,$d)*$n"
  done
  echo "0$toplam"
}

uret() {
  local ad="$1" ifade="$2" sure="$3" kazanc="$4"
  local fade_st tepe
  fade_st=$(awk "BEGIN{print $sure-0.4}")
  ffmpeg -hide_banner -loglevel error -y -f lavfi \
    -i "aevalsrc='$kazanc*($ifade)':s=44100:d=$sure" \
    -af "afade=t=out:st=$fade_st:d=0.4" -ac 1 -c:a pcm_s16le "$GECICI/$ad.wav"
  # Tepeyi -6 dBFS'e esitle (sesler arasinda yukseklik farki olmasin).
  tepe=$(ffmpeg -hide_banner -i "$GECICI/$ad.wav" -af volumedetect -f null - 2>&1 \
    | sed -n 's/.*max_volume: \(-\{0,1\}[0-9.]*\) dB/\1/p')
  ffmpeg -hide_banner -loglevel error -y -i "$GECICI/$ad.wav" \
    -af "volume=$(awk "BEGIN{print -6-($tepe)}")dB" -ar 22050 -ac 1 -c:a pcm_s16le "$OUT/${ad}_ios.wav"
}

# Sakin zil: glokenspiel kismi oranlari (1, 2.76, 5.40), inen uc vurus G5-E5-C5.
ZIL='(st(1,1-exp(-T*300))*ld(1)*(sin(2*PI*F*T)*exp(-T/1.4)+0.30*sin(2*PI*F*2.76*T)*exp(-T/0.45)+0.12*sin(2*PI*F*5.40*T)*exp(-T/0.18)))'
uret zil "$(dizi "$ZIL" 0:783.99 0.42:659.25 0.84:523.25)" 3.4 0.22

# Iki ton: E5 -> C5.
IKI='(st(1,1-exp(-T*400))*ld(1)*(sin(2*PI*F*T)*exp(-T/1.0)+0.25*sin(2*PI*F*2*T)*exp(-T/0.35)+0.08*sin(2*PI*F*3*T)*exp(-T/0.2)))'
uret ikiton "$(dizi "$IKI" 0:659.25 0.55:523.25)" 2.8 0.3

# Damla: hizla yukari kayan kisa sinus, uc damla.
DAMLA='(st(1,1-exp(-T*600))*ld(1)*sin(2*PI*(F*T+F*0.9*0.05*(1-exp(-T/0.05))))*exp(-T/0.09))'
uret damla "$(dizi "$DAMLA" 0:700 0.38:900 0.62:780)" 1.4 0.5

# Sabah: marimba benzeri yukselen arpej C5-E5-G5-C6.
SABAH='(st(1,1-exp(-T*500))*ld(1)*(sin(2*PI*F*T)*exp(-T/0.55)+0.18*sin(2*PI*F*4*T)*exp(-T/0.08)))'
uret sabah "$(dizi "$SABAH" 0:523.25 0.2:659.25 0.4:783.99 0.6:1046.5)" 2.6 0.3

ls -la "$OUT"/*_ios.wav
