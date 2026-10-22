#!/usr/bin/env bash
# Apple Watch magaza kareleri (issue #285) — `ios-ekran-goruntuleri.yml`, `tur: saat`.
#
# Kullanim: scripts/simulator-saat-cek.sh <cikti-dizini> <NamazSaat.app>
#
# Adimlar: en buyuk App Store boyutunu veren Apple Watch simulatoru (Ultra 3/4 = 422x514)
# + bir iPhone simulatoru olusturulur ve eslenir, saat uygulamasi kurulur, ornek yuk
# (`scripts/saat-tohum-yuku.js`) baslatma ortamiyla verilir ve her ekran temiz bir
# acilisla cekilir (`NAMAZ_SAAT_EKRAN`, yalniz simulator derlemesinde okunur).
#
# NEDEN WatchConnectivity DEGIL: eslenmis simulator ciftinde iPhone uygulamasindan
# yukun ne zaman (ve gelip gelmedigi) dogrulanamiyor; kare zamanlamaya bagli kalirdi.
# Yuku ortamdan vermek deterministik ve iPhone derlemesi (~25 dk) gerektirmez.
#
# Eksik kare HATA DEGIL: adim ozetinde UYARI olarak yazilir (diger kareler korunur).
set -uo pipefail

CIKTI="${1:?cikti dizini}"
APP="${2:?NamazSaat.app yolu}"
mkdir -p "$CIKTI"
OZET="${GITHUB_STEP_SUMMARY:-/dev/null}"

# stdin'deki JSON'u `j` olarak alip $1 ifadesini yazdirir. Ifadeler YALNIZ bu betikteki
# sabit dizelerdir (dis girdi degil); veri JSON.parse ile okunur.
json() { node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log(eval(process.argv[1]))})' "$1"; }

# --- Cihaz secimi -----------------------------------------------------------------
# Tercih sirasi = App Store'un kabul ettigi EN BUYUK kare. Simulatorun verdigi gercek
# boyut asagida sips ile olculur ve yazdirilir.
SAAT_RT=$(xcrun simctl list runtimes -j | json 'j.runtimes.filter(r=>r.platform==="watchOS"&&r.isAvailable).map(r=>r.identifier).pop()||""')
IOS_RT=$(xcrun simctl list runtimes -j | json 'j.runtimes.filter(r=>r.platform==="iOS"&&r.isAvailable).map(r=>r.identifier).pop()||""')
[ -z "$SAAT_RT" ] && { echo "watchOS runtime yok"; exit 1; }
SAAT_TIPI=$(xcrun simctl list devicetypes -j | json '(()=>{const t=j.devicetypes.map(x=>x.name);for(const re of [/^Apple Watch Ultra 4/,/^Apple Watch Ultra 3/,/^Apple Watch Ultra 2/,/^Apple Watch Ultra/,/^Apple Watch Series 1[0-9] \(46mm\)/,/^Apple Watch Series 9 \(45mm\)/]){const b=t.filter(n=>re.test(n)).sort();if(b.length)return b[b.length-1];}return "";})()')
TELEFON_TIPI=$(xcrun simctl list devicetypes -j | json '(()=>{const t=j.devicetypes.map(x=>x.name).filter(n=>/^iPhone 1[6-9]( Pro)?$/.test(n)).sort();return t.pop()||"";})()')
echo "watchOS runtime: $SAAT_RT · cihaz: $SAAT_TIPI"
echo "iOS runtime: $IOS_RT · eş telefon: $TELEFON_TIPI"
[ -z "$SAAT_TIPI" ] && { echo "Apple Watch cihaz tipi bulunamadi"; xcrun simctl list devicetypes | grep -i watch; exit 1; }

# --- Tohum (simulatorler acilmadan ONCE: saat dilimi ona gore kurulur) ---------------
TOHUM=$(node scripts/saat-tohum-yuku.js)
TZ_ADI=$(echo "$TOHUM" | json 'j.tz')
SAAT_METNI=$(echo "$TOHUM" | json 'j.durumCubuguSaati')
YUK=$(echo "$TOHUM" | json 'j.yuk')
echo "Saat dilimi: $TZ_ADI · ekrandaki saat: $SAAT_METNI · öğleye/ikindiye kalan: $(echo "$TOHUM" | json 'j.kalanDk') dk"
echo "İstanbul vakitleri ($(echo "$TOHUM" | json 'j.tarih')): $(echo "$TOHUM" | json 'JSON.stringify(j.istanbulVakitleri)')"

# Saatin KENDI saati (sag ustteki) uygulamanin geri sayimiyla tutarli olsun: watchOS
# simulatorunde `simctl status_bar override` CALISMAZ (olculdu) ve simulator saat
# dilimini Mac'ten alir → yalniz CI'da (gecici makine) Mac'in saat dilimi degistirilir.
if [ "${GITHUB_ACTIONS:-}" = "true" ] && [ -f "/usr/share/zoneinfo/$TZ_ADI" ]; then
  sudo ln -sf "/usr/share/zoneinfo/$TZ_ADI" /etc/localtime && echo "Mac saat dilimi: $TZ_ADI ($(date '+%H:%M %Z'))"
fi

# Turkce bolge + 24 saat: tercih dosyasi simulator KAPALIYKEN yazilir.
# `simctl spawn ... defaults write` KULLANMA — cfprefsd'yi bekleyip adimi kilitler
# (AGENTS.md). Dosya ilk acilista olusur: hic acilmamis cihaza `data/` dizinini elle
# kurmak cihazi bozdu (uygulama "FBSOpenApplicationServiceErrorDomain code=4" ile
# acilmadi, yasandi) → once bir kez ac, kapat, sonra yaz.
yerellestir() {
  local tercih="$HOME/Library/Developer/CoreSimulator/Devices/$1/data/Library/Preferences/.GlobalPreferences.plist"
  if [ ! -f "$tercih" ]; then
    echo "UYARI: $1 tercih dosyası yok, bölge ayarlanmadı"
    return 0
  fi
  /usr/libexec/PlistBuddy -c "Delete :AppleLanguages" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleLanguages array" -c "Add :AppleLanguages:0 string tr-TR" "$tercih"
  /usr/libexec/PlistBuddy -c "Delete :AppleLocale" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleLocale string tr_TR" "$tercih"
  /usr/libexec/PlistBuddy -c "Delete :AppleICUForce24HourTime" "$tercih" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :AppleICUForce24HourTime bool true" "$tercih"
}

SAAT=$(xcrun simctl create "magaza-saat" "$SAAT_TIPI" "$SAAT_RT")
if [ -n "$IOS_RT" ] && [ -n "$TELEFON_TIPI" ]; then
  TELEFON=$(xcrun simctl create "magaza-saat-telefon" "$TELEFON_TIPI" "$IOS_RT")
  # Esleme: saat uygulamasi telefona bagli (`WKRunsIndependentlyOfCompanionApp=false`).
  xcrun simctl pair "$SAAT" "$TELEFON" || echo "UYARI: esleme yapilamadi (saat tek basina denenecek)"
  xcrun simctl boot "$TELEFON" || true
  # Saat uygulamasi esine bagli: yarim acilmis telefon test edilmemis bir sebep olurdu.
  xcrun simctl bootstatus "$TELEFON" -b >/dev/null 2>&1 || echo "UYARI: eş telefon açılışı bitmedi"
fi
# Saati acar ve bootstatus'un BASARIYLA bitmesini bekler; basarisizsa kapatip yeniden
# acar. DIKKAT: izlenen her acilis `Status=4294967295, isTerminal=YES … Finished` ile
# biter — bu NORMAL tamamlanmadir, hata sayma (yalniz cikis kodu).
saatiAc() {
  local deneme cikti kod
  for deneme in 1 2 3; do
    xcrun simctl boot "$SAAT" >/dev/null 2>&1 || true
    cikti=$(xcrun simctl bootstatus "$SAAT" -b 2>&1)
    kod=$?
    if [ "$kod" -eq 0 ]; then
      echo "saat açıldı (deneme $deneme)"
      return 0
    fi
    echo "UYARI: saat açılışı başarısız (deneme $deneme, kod $kod) — kapatılıp yeniden açılıyor"
    tail -3 <<<"$cikti"
    xcrun simctl shutdown "$SAAT" >/dev/null 2>&1 || true
    sleep 5
  done
  return 1
}

# Uygulama acilmadiginda (code=4) sebebi loga dussun: cokme raporu + sistem gunlugu.
tani() {
  echo "::group::Tanı: $1"
  xcrun simctl list pairs || true
  xcrun simctl list devices -j | json 'Object.values(j.devices).flat().filter(d=>/^magaza-saat/.test(d.name)).map(d=>d.name+": "+d.state).join("\n")' || true
  echo "uygulama kabı: $(xcrun simctl get_app_container "$SAAT" "$BUNDLE" 2>&1 || true)"
  ls -t "$HOME/Library/Logs/DiagnosticReports" 2>/dev/null | grep -i 'namaz' | head -3 | while read -r f; do
    echo "--- çökme raporu: $f"
    head -60 "$HOME/Library/Logs/DiagnosticReports/$f"
  done
  xcrun simctl spawn "$SAAT" log show --last 3m --style compact \
    --predicate 'eventMessage CONTAINS[c] "watchkitapp" OR process CONTAINS[c] "NamazSaat"' 2>/dev/null | tail -60
  echo "::endgroup::"
}

saatiAc || echo "UYARI: saat ilk açılışta ayağa kalkmadı"
# Ilk acilis tercih dosyasini olusturdu: kapat → Turkce bolge yaz → yeniden ac.
xcrun simctl shutdown "$SAAT" || true
yerellestir "$SAAT"
saatiAc || echo "UYARI: saat yeniden açılışta ayağa kalkmadı"

xcrun simctl install "$SAAT" "$APP"
BUNDLE=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP/Info.plist")
echo "saat paketi: $BUNDLE"

# --- Kareler ----------------------------------------------------------------------
# ad:ekran:bekleme(sn)
# Kible: simulatorde pusula yok → sabit yon (`NAMAZ_SAAT_TOHUM_YON`, Istanbul kiblesi
# ~152° → hizada (yesil halka)). Uyandirma: akilli alarm oturumu simulatorde tetiklenmez →
# ekran yukun ilk uyandirma kaydiyla, oturumsuz cizilir.
# Sayfalar (dikey TabView): 01 Simdi, 02 Bugun kadrani, 03 kilinmis Simdi, 04 Kible,
# 05 Tesbihat, 06 Uyandirma, 07 Kildim onayi.
# Uyandirma (ilk cizimde tam ekran kapak) EN SONDA: takildiginda sonraki acilislari da
# acilis ekraninda birakiyordu (kare hatti: 07 ancak saat yeniden acilinca cizildi).
KARELER="01-simdi:ana:20 02-bugun:vakitler:14 03-kilindi:kilindi:14 04-kible:kible:16 05-tesbihat:tesbihat:14 07-kildim-onayi:onay:12 06-uyandirma:uyandirma:16"
GECICI=$(mktemp -d)
EKSIKLER=""

# Uygulamayi verilen ekranla baslatir (`simctl launch` gecici hatalarina karsi 4 deneme).
# $1 ekran, $2 "1" ise sonuk (her zaman acik) varyant.
baslat() {
  local deneme
  for deneme in 1 2 3 4; do
    if SIMCTL_CHILD_TZ="$TZ_ADI" \
      SIMCTL_CHILD_NAMAZ_SAAT_EKRAN="$1" \
      SIMCTL_CHILD_NAMAZ_SAAT_SONUK="${2:-0}" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YUK="$YUK" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_TESBIHAT="45" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YON="150" \
      xcrun simctl launch "$SAAT" "$BUNDLE" >/dev/null 2>&1; then
      return 0
    fi
    sleep 20
  done
  return 1
}

# DOGRULANMIS kare: "launch ok" uygulamanin CIZILDIGI demek degil — watchOS simulatoru
# soguk acilista dakikalarca acilis ekraninda (siyah zemin + ortada simge) kalabiliyor ve
# eski hat o kareyi magaza karesi diye kaydediyordu (master 39759842547: 06/07 Ultra,
# 01/06 41 mm). Her kare `saat-kare-denetle.js` ile piksel analizinden gecer: acilis
# ekraniysa birkac kez yeniden yoklanir, yine acilissa uygulama yeniden baslatilir,
# ucuncu denemede saat yeniden acilip paket yeniden kurulur. Hepsi bosa giderse kare
# YAZILMAZ (sahte kare magazaya gitmesin), adi EKSIKLER'e eklenir ve hat uyariyla biter.
# $1 ad, $2 ekran, $3 hedef .png, $4 ilk bekleme (sn), $5 "1" ise sonuk.
kareCek() {
  local ad="$1" ekran="$2" hedef="$3" bekle="$4" sonuk="${5:-0}"
  local ham="$GECICI/$ad.png" bmp="$GECICI/$ad.bmp" deneme yoklama sonuc
  rm -f "$ham"
  for deneme in 1 2 3; do
    if [ "$deneme" -eq 3 ]; then
      echo "UYARI: $ad iki denemede çizilmedi — saat yeniden başlatılıp uygulama yeniden kuruluyor"
      xcrun simctl shutdown "$SAAT" >/dev/null 2>&1 || true
      saatiAc || true
      xcrun simctl install "$SAAT" "$APP" >/dev/null 2>&1 || true
    fi
    xcrun simctl terminate "$SAAT" "$BUNDLE" >/dev/null 2>&1 || true
    sleep 2
    if ! baslat "$ekran" "$sonuk"; then
      echo "UYARI: $ad başlatılamadı (deneme $deneme)"
      tani "$ad (deneme $deneme)"
      continue
    fi
    sleep "$bekle"
    for yoklama in 1 2 3 4; do
      if xcrun simctl io "$SAAT" screenshot --type=png "$ham" >/dev/null 2>&1 \
        && sips -s format bmp "$ham" --out "$bmp" >/dev/null 2>&1; then
        if sonuc=$(node scripts/saat-kare-denetle.js "$bmp"); then
          echo "$ad: $sonuc (deneme $deneme, yoklama $yoklama)"
          cp "$ham" "$hedef"
          return 0
        fi
        echo "$ad: $sonuc (deneme $deneme, yoklama $yoklama)"
      else
        echo "UYARI: $ad ekran görüntüsü alınamadı (deneme $deneme, yoklama $yoklama)"
      fi
      sleep 8
    done
  done
  # Son (acilis) karesi yalniz tani icin video dizinine; magaza dizinine ASLA.
  if [ -f "$ham" ] && [ -n "${VIDEO_DIZINI:-}" ]; then
    mkdir -p "$VIDEO_DIZINI/eksik" && cp "$ham" "$VIDEO_DIZINI/eksik/$(basename "$hedef")"
  fi
  echo "::warning title=Apple Watch karesi EKSIK::$ad uygulamayı göstermedi (3 deneme); kare yazılmadı"
  EKSIKLER="$EKSIKLER $ad"
  return 1
}

VIDEO_DIZINI="${3:-}"
BEKLENEN=0
KUCUK_BEKLENEN=0
KUCUK_CEKILEN=0
for k in $KARELER; do
  IFS=: read -r AD EKRAN BEKLE <<<"$k"
  BEKLENEN=$((BEKLENEN + 1))
  HAM="$CIKTI/$AD.ham.png"
  kareCek "$AD" "$EKRAN" "$HAM" "$BEKLE" || continue
  # App Store alfa kanali kabul etmez → JPEG'den gecirip alfasiz PNG yap.
  sips -s format jpeg -s formatOptions best "$HAM" --out "$CIKTI/$AD.jpg" >/dev/null
  sips -s format png "$CIKTI/$AD.jpg" --out "$CIKTI/$AD.png" >/dev/null
  rm -f "$HAM" "$CIKTI/$AD.jpg"
done

# --- Tani: cokme raporlari (bir kare acilis ekraninda kaldiysa nedeni buradadir) ----
for rapor in $(ls -t "$HOME/Library/Logs/DiagnosticReports/" 2>/dev/null | grep -i "NamazSaat" | head -2); do
  echo "::group::Çökme raporu: $rapor"
  head -c 6000 "$HOME/Library/Logs/DiagnosticReports/$rapor"
  echo "::endgroup::"
done

# --- Animasyon videolari (istege bagli 3. arguman: video dizini) -------------------
# Hareket yalniz olayla baslar (uyandirma ekrani acilinca ikon BIR KEZ seker) → acilisi
# kaydetmek animasyonu gosterir. Videolar ayri dizindedir: ASC'ye kare olarak gitmesin.
VIDEO="${3:-}"
if [ -n "$VIDEO" ]; then
  mkdir -p "$VIDEO"
  # kildim-sahnesi: Simdi acilir, 1,5 sn sonra "Kildim" kendiliginden oynar (halka kapanir + tik).
  # Ilk kayit bazen tek kare kaliyor (kaydedici isinmamis) → once bir isinma kaydi.
  for v in "isinma:ana" "kildim-sahnesi:kildimDemo" "simdi-acilisi:ana" "bugun-acilisi:vakitler" "kible-acilisi:kible" "uyandirma-acilisi:uyandirma"; do
    IFS=: read -r AD EKRAN <<<"$v"
    xcrun simctl terminate "$SAAT" "$BUNDLE" >/dev/null 2>&1 || true
    sleep 1
    xcrun simctl io "$SAAT" recordVideo --codec=h264 --force "$VIDEO/$AD.mp4" >/dev/null 2>&1 &
    KAYIT=$!
    sleep 2
    SIMCTL_CHILD_TZ="$TZ_ADI" \
      SIMCTL_CHILD_NAMAZ_SAAT_EKRAN="$EKRAN" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YUK="$YUK" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_TESBIHAT="45" \
      SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YON="150" \
      xcrun simctl launch "$SAAT" "$BUNDLE" >/dev/null 2>&1 || echo "UYARI: $AD videosu için uygulama başlatılamadı"
    sleep 24  # soguk acilis ~10 sn + sahne
    kill -INT "$KAYIT" 2>/dev/null || true
    wait "$KAYIT" 2>/dev/null || true
    if [ -s "$VIDEO/$AD.mp4" ]; then echo "video: $AD.mp4 ($(du -h "$VIDEO/$AD.mp4" | cut -f1))"; else echo "UYARI: $AD videosu yok"; fi
    if [ "$AD" = "isinma" ]; then rm -f "$VIDEO/$AD.mp4"; fi
  done
  # Her zaman acik (sonuk) varyant kareleri — inceleme icin, ASC'ye GITMEZ (video dizininde).
  for v in "sonuk-simdi:ana" "sonuk-bugun:vakitler" "sonuk-kilindi:kilindi" "sonuk-kible:kible"; do
    IFS=: read -r AD EKRAN <<<"$v"
    kareCek "$AD" "$EKRAN" "$VIDEO/$AD.png" 16 1 && echo "sönük kare: $AD.png"
  done
fi

# --- Kucuk ekran kaniti (istege bagli, video dizinine): en kucuk mevcut saat ----------
# Magaza seti Ultra'dan kalir; burada 41/42 mm sigmasi TAHMIN degil KARE ile gosterilir.
if [ -n "${VIDEO:-}" ]; then
  KUCUK_TIPI=$(xcrun simctl list devicetypes -j | json '(()=>{const t=j.devicetypes.map(x=>x.name);for(const re of [/^Apple Watch Series 9 \(41mm\)/,/^Apple Watch Series 1[0-9] \(42mm\)/,/^Apple Watch SE.*40mm/,/^Apple Watch Series [0-9]+ \(41mm\)/]){const b=t.filter(n=>re.test(n)).sort();if(b.length)return b[0];}return "";})()')
  if [ -n "$KUCUK_TIPI" ]; then
    echo "küçük saat: $KUCUK_TIPI"
    xcrun simctl shutdown "$SAAT" >/dev/null 2>&1 || true
    SAAT=$(xcrun simctl create "magaza-saat-kucuk" "$KUCUK_TIPI" "$SAAT_RT")
    if [ -n "${TELEFON:-}" ]; then
      xcrun simctl unpair "$(xcrun simctl list pairs -j | json 'Object.keys(j.pairs)[0]||""')" >/dev/null 2>&1 || true
      xcrun simctl pair "$SAAT" "$TELEFON" >/dev/null 2>&1 || echo "UYARI: küçük saat eşlenemedi"
    fi
    saatiAc || true
    xcrun simctl shutdown "$SAAT" >/dev/null 2>&1 || true
    yerellestir "$SAAT"
    saatiAc || true
    xcrun simctl install "$SAAT" "$APP" || echo "UYARI: küçük saate kurulamadı"
    mkdir -p "$VIDEO/kucuk"
    for v in "01-simdi:ana" "02-bugun:vakitler" "03-kilindi:kilindi" "04-kible:kible" "06-uyandirma:uyandirma"; do
      IFS=: read -r AD EKRAN <<<"$v"
      KUCUK_BEKLENEN=$((KUCUK_BEKLENEN + 1))
      if kareCek "kucuk-$AD" "$EKRAN" "$VIDEO/kucuk/$AD.png" 16; then
        KUCUK_CEKILEN=$((KUCUK_CEKILEN + 1))
        echo "küçük kare: $AD.png ($(sips -g pixelWidth "$VIDEO/kucuk/$AD.png" | awk '/pixelWidth/{print $2}') px)"
      fi
    done
  else
    echo "UYARI: küçük saat tipi bulunamadı"
    xcrun simctl list devicetypes | grep -i watch || true
  fi
fi

# --- Ozet -------------------------------------------------------------------------
{
  echo "### ⌚ Apple Watch kareleri"
  echo ""
  echo "Cihaz: **$SAAT_TIPI** · saat dilimi \`$TZ_ADI\` · ekran saati $SAAT_METNI"
  echo ""
  echo "| Kare | Boyut | Alfa |"
  echo "|---|---|---|"
} >>"$OZET"
CEKILEN=0
for k in $KARELER; do
  AD="${k%%:*}"
  F="$CIKTI/$AD.png"
  if [ -f "$F" ]; then
    CEKILEN=$((CEKILEN + 1))
    G=$(sips -g pixelWidth "$F" | awk '/pixelWidth/{print $2}')
    Y=$(sips -g pixelHeight "$F" | awk '/pixelHeight/{print $2}')
    A=$(sips -g hasAlpha "$F" | awk '/hasAlpha/{print $2}')
    echo "$AD.png -> ${G}x${Y} (alfa: $A)"
    echo "| $AD | ${G}×${Y} | $A |" >>"$OZET"
    case "${G}x${Y}" in
      422x514|410x502|416x496|396x484|368x448|312x390) ;;
      *) echo "UYARI: $AD boyutu (${G}x${Y}) App Store Apple Watch boyutlarından biri değil" | tee -a "$OZET" ;;
    esac
  else
    echo "UYARI: $AD.png eksik"
    echo "| $AD | **EKSIK** | — |" >>"$OZET"
  fi
done
echo "" >>"$OZET"
echo "Çekilen: $CEKILEN / $BEKLENEN" | tee -a "$OZET"
if [ "$KUCUK_BEKLENEN" -gt 0 ]; then
  echo "Küçük saat (41/42 mm): $KUCUK_CEKILEN / $KUCUK_BEKLENEN" | tee -a "$OZET"
fi
if [ -n "$EKSIKLER" ]; then
  # Hat KIRMIZI degil SARI biter: cekilen kareler artifact'e gider, eksikler isimle yazilir.
  echo "" >>"$OZET"
  echo "⚠️ **EKSIK** (uygulama çizilmedi, kare yazılmadı):$EKSIKLER" | tee -a "$OZET"
  echo "::warning title=Apple Watch kareleri eksik::$EKSIKLER"
fi
rm -rf "$GECICI"
[ "$CEKILEN" -eq 0 ] && exit 1
exit 0
