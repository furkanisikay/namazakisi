#!/usr/bin/env bash
# Wear OS saat uygulamasinin Play magaza karelerini emulatorde ceker.
# android-ekran-goruntuleri.yml icinden `bash scripts/saat-kare-hatti.sh <etiket>` ile
# cagrilir (etiket = profil klasoru: `yuvarlak`, `kare`).
#
# Telefon hattinin dersleri burada da gecerli: emulator-runner `script` girdisinin
# her satirini ayri `sh` ile calistirir → tum adimlar TEK bash betiginde.
#
# VERI: saat vakitleri telefondan Data Layer ile alir, emulatorde telefon yok. Telefonun
# gonderecegi yukun aynisi `scripts/saat/saat-tohum-yuku.js` ile uretilip saatin kendi
# deposuna (`saat_veri.xml`) `run-as` ile yazilir — saat koduna tohum alicisi YOK.
#
# DOLASMA: `uiautomator dump` + koordinat. Dump ekranin ~1 sn bosta kalmasini bekler;
# saatin ana ekrani saniyelik sayac cizdigi icin uygulama `--ez ekran_goruntusu true`
# ile acilir: YALNIZ debug derlemede saniye dongusu donar (dakikalik tazeleme surer),
# "idle" durumu olusur (Maestro gerekmez). Release davranisi degismez.
#
# ICERIK ACIKLAMASI SOZLESMESI (Kotlin'de AnaEkranKarari / KildimOnayi ile ayni):
#   sayac dugumu   "<Vakit> vaktinin cikmasina|girmesine ..."
#   ana ekran Kildim  "<Vakit> vaktini kildim olarak isaretleyin"
#   onay katmani      kenar dugmesi "Kıldım"
#   kible ekrani      "Kıble ..." (pusula), sensorsuz: "... sensörü bulunmuyor ..." (KibleEkrani)
set -euo pipefail

ETIKET="${1:?profil etiketi (yuvarlak|kare) gerekli}"
PAKET="com.furkanisikay.namazakisi"
SINIF="$PAKET.saat"
CIKIS="kareler-saat/$ETIKET"
mkdir -p "$CIKIS"

APK=$(find wear/app/build/outputs/apk/debug -name '*.apk' | head -1)
[ -z "$APK" ] && { echo "saat debug APK bulunamadi"; exit 1; }

adb wait-for-device
bash scripts/emulator-hazir-bekle.sh
adb shell getprop ro.build.version.release
adb shell getprop ro.build.fingerprint
BOYUT=$(adb shell wm size | sed -n 's/.*: *\([0-9]*x[0-9]*\).*/\1/p' | tail -1)
G=${BOYUT%x*}
Y=${BOYUT#*x}
echo "saat ekrani: ${G}x${Y} (etiket: $ETIKET)"

# Ilk acilis karsilamasini (OOBE/egitim) atla; emulatorde "test modu" yayini bunu yapar.
adb shell am broadcast -a com.google.android.clockwork.action.TEST_MODE || true
# 24 saat bicimi (TimeText + kadran), hata/ANR pencerelerini gizle (telefon hatti dersi).
adb shell settings put system time_12_24 24 || true
adb shell settings put global hide_error_dialogs 1 || true
# Ekran kararmasin / ambient'e gecmesin: kareler etkilesimli gorunumden alinmali.
adb shell svc power stayon true || true
adb shell settings put system screen_off_timeout 1800000 || true

# -g: calisma zamani izinleri (POST_NOTIFICATIONS) kurulumda verilsin — izin
# penceresi ana ekranin ustune acilip ilk kareyi orterdi.
adb install -r -g "$APK"

# --- Tohum ---
adb shell am force-stop "$PAKET"
node scripts/saat/saat-tohum-yuku.js /tmp/saat_veri.xml
adb push /tmp/saat_veri.xml /data/local/tmp/saat_veri.xml
adb shell run-as "$PAKET" mkdir -p shared_prefs
adb shell run-as "$PAKET" cp /data/local/tmp/saat_veri.xml shared_prefs/saat_veri.xml
adb shell run-as "$PAKET" ls -la shared_prefs

kare() {
  local ad="$1"
  sleep "${2:-2}"
  adb exec-out screencap -p > "$CIKIS/$ad.png"
  if [ ! -s "$CIKIS/$ad.png" ]; then
    echo "UYARI: $ad bos cikti"
    rm -f "$CIKIS/$ad.png"
    return 1
  fi
  echo "kare: $CIKIS/$ad.png"
}

dokun_merkez() { adb shell input tap $((G / 2)) $((Y * 2 / 5)); }
# Kisa ve yavas kaydirma: hizli/uzun kaydirma ScalingLazyColumn'da firlatma olur,
# hedef satir bir adimda gorus alaninin disina kacar.
yukari_kaydir() { adb shell input swipe $((G / 2)) $((Y * 2 / 3)) $((G / 2)) $((Y / 3)) 600; sleep 1.5; }

dump_al() {
  adb shell uiautomator dump /data/local/tmp/ui.xml >/dev/null 2>&1 || true
  adb exec-out cat /data/local/tmp/ui.xml > /tmp/saat-ui.xml 2>/dev/null || true
}

# Uygulama ilk cizimini bitirene kadar bekler. swiftshader Wear emulatorunde soguk
# acilista sistemin "Starting..." ekrani `am start -W` donduktan SONRA da kalir ve
# bir dokunma olayi gelene kadar KALKMAZ (iki kosuda olculdu: 2 dk beklemede de
# kalkmadi, ilk kaydirmadan hemen sonra uygulama gorundu). Bu yuzden her denemede
# zararsiz bir "durtme" gonderilir: listenin basina dogru kisa kaydirma (liste zaten
# en ustteyse etkisiz). Sabit `sleep` YETMEZ.
hazir_bekle() {
  local desen="$1"
  for i in $(seq 1 15); do
    sleep 2
    dump_al
    if node scripts/saat/ui-merkez.js /tmp/saat-ui.xml "$desen" >/dev/null; then
      echo "hazir ($desen): ${i}. deneme"
      return 0
    fi
    adb shell input swipe $((G / 2)) $((Y / 3)) $((G / 2)) $((Y / 2)) 400
  done
  echo "UYARI: '$desen' gorunmedi"
  return 1
}

# Desene uyan dugumu bulana kadar listeyi kaydirir ve ona dokunur.
bul_ve_dokun() {
  local desen="$1" xy yy
  for _ in 1 2 3 4 5 6 7 8; do
    dump_al
    if xy=$(node scripts/saat/ui-merkez.js /tmp/saat-ui.xml "$desen"); then
      yy=${xy#* }
      # Yuvarlak ekranda alt kenardaki satir kirpiktir; ortaya gelsin.
      if [ "$yy" -gt $((Y * 3 / 4)) ]; then yukari_kaydir; continue; fi
      echo "dokunma ($desen): $xy"
      adb shell input tap $xy
      return 0
    fi
    yukari_kaydir
  done
  echo "UYARI: '$desen' bulunamadi"
  grep -o 'content-desc="[^"]\+"' /tmp/saat-ui.xml | head -20 || true
  return 1
}

ana_ac() {
  adb shell am start -S -W -n "$PAKET/$SINIF.ui.AnaAktivite" --ez ekran_goruntusu true
  hazir_bekle 'çıkmasına|girmesine|telefonunuzda' || true
}

# --- 01 / 02: ana ekran + vakit listesi ---
ana_ac
kare 01-ana-ekran 2 || true
# Ilk oge TAM EKRAN sayactir: uc kisa adim (her biri ekranin ~1/3'u) vakit satirlarini
# ekrana getirir. Kare ekranda satirlar gorece buyuk → bir kisa adim daha.
yukari_kaydir
yukari_kaydir
yukari_kaydir
if [ "$ETIKET" = kare ]; then
  adb shell input swipe $((G / 2)) $((Y / 2)) $((G / 2)) $((Y / 3)) 600
  sleep 1.5
fi
kare 02-vakitler 1 || true

# --- 03: "Kıldım" onayi (su anki vakit kilinmamis tohumlandi) — ana ekran dugmesinden ---
ana_ac
if bul_ve_dokun 'kıldım olarak işaretleyin'; then
  kare 03-kildim-onayi 2 || true
  adb shell input keyevent KEYCODE_BACK
fi

# --- 07: ana ekran ambient (always-on) ---
# Emulatorde ambient destegi DOGRULANMADI: ekran tumden kapanirsa kare siyah cikar →
# UYARI ile atlanir (magazaya konmaz; yalniz gorunum denetimi icin).
ana_ac
adb shell settings put global ambient_enabled 1 || true
adb shell input keyevent KEYCODE_SLEEP
sleep 4
if kare 07-ana-ambient 1; then
  # Siyah PNG ~2-3 KB; ambient icerigi (yay izi + rakam) belirgin daha buyuk.
  if [ "$(stat -c %s "$CIKIS/07-ana-ambient.png")" -lt 6000 ]; then
    echo "UYARI: 07-ana-ambient siyah (emulator ambient'e gecmedi)"
    rm -f "$CIKIS/07-ana-ambient.png"
  fi
fi
adb shell input keyevent KEYCODE_WAKEUP
sleep 2

# --- 04: tesbihat sayaci (gercek dokunuslarla) ---
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.TesbihatAktivite"
# Desen DILDEN BAGIMSIZ: zikir adi dile gore yazilir; bulunamayinca hazir_bekle'nin
# kaydirmasi sayaci sifirlama onayini aciyordu. "/ 33" her dilde sayacin altindadir;
# Dogu Arap rakamli yerel ayarda (ar-SA) "/ ٣٣" yazilir (saat rakami yerel ayardan alir).
hazir_bekle '/ ?(33|٣٣)' || sleep 5
for _ in $(seq 1 21); do dokun_merkez; sleep 0.3; done
kare 04-tesbihat 2 || true

# --- 09: tesbihat TAMAM (bitis ekrani; yuvarlak/kare ekranda tasma denetimi) ---
# 99 dokunus yerine durum dogrudan tohumlanir: `saat_tesbihat` (TesbihatDeposu) toplam=100,
# son dokunus = cihazin simdiki ani (90 dk'dan eski oturum acilista sifirlanir). Uygulama
# ONCE durdurulur, yoksa bellekteki prefs dosyanin ustune yazar.
adb shell am force-stop "$PAKET"
SIMDI_MS="$(adb shell date +%s | tr -d '\r')000"
printf "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n<map>\n    <int name=\"toplam\" value=\"100\" />\n    <long name=\"son_dokunus_ms\" value=\"%s\" />\n</map>\n" "$SIMDI_MS" > /tmp/saat_tesbihat.xml
adb push /tmp/saat_tesbihat.xml /data/local/tmp/saat_tesbihat.xml
adb shell run-as "$PAKET" cp /data/local/tmp/saat_tesbihat.xml shared_prefs/saat_tesbihat.xml
adb shell am start -W -n "$PAKET/$SINIF.ui.TesbihatAktivite"
hazir_bekle 'Tamamlandı|tamamlandı|146|١٤٦' || sleep 5
kare 09-tesbihat-tamam 2 || true

# --- 08: kible pusulasi ---
# Konum tohum yukunden gelir (`konum`, 1 ondalik). Emulator sensorleri konsoldan
# beslenir: yuz yukari yatay, saat kuzeye bakiyor (Istanbul alani: yatay ~26 uT
# kuzeye, dusey ~39 uT asagi). Emulatorun donme vektoru sunup sunmadigi
# DOGRULANMADI: sunmazsa ivme+manyetik yedek yolu cizer; hicbiri yoksa ekran
# "pusula sensoru bulunmuyor" der → kare UYARI ile silinir (magazaya konmaz).
adb emu sensor set acceleration 0:0:9.8 || true
adb emu sensor set magnetic-field 0:26:-39 || true
adb shell am force-stop "$PAKET"
adb shell am start -W -n "$PAKET/$SINIF.ui.KibleAktivite"
hazir_bekle 'Kıble|kıble|sensörü|°' || true
if kare 08-kible 3; then
  # Onceki ekranin dokumu kalmasin: dump basarisizsa bayat metinle karar verilmez.
  # Cihazdaki dosya da silinir: dump basarisiz olursa `exec-out cat` eskisini getirirdi.
  rm -f /tmp/saat-ui.xml
  adb shell rm -f /data/local/tmp/ui.xml || true
  dump_al
  if [ ! -s /tmp/saat-ui.xml ]; then
    echo "UYARI: 08-kible ekran dokumu alinamadi — sensor durumu belirsiz, kare yine de saklandi"
  elif grep -q 'sensörü bulunmuyor' /tmp/saat-ui.xml; then
    echo "UYARI: 08-kible pusula sensoru yok (emulator) — kare silindi"
    rm -f "$CIKIS/08-kible.png"
  fi
fi

# --- 05 / 06: tile'lar ---
# `add-tile` DEBUG_SURFACE, `show-tile` ise DEBUG_SYSUI eylemidir (ilk kosuda
# show-tile DEBUG_SURFACE'e gonderildi → "Unrecognized operation"). Eklenen tile
# 0. siraya girer; gosterim basarisizsa kadrandan bir kez sola kaydirilir.
# Kadrandayken HOME'a basmak uygulama listesini acar (ilk kosuda tile karesi yerine
# o cikti) → uygulamadan cikis force-stop ile, HOME'suz.
tile_goster() {
  local servis="$1" ad="$2" cikti indeks
  cikti=$(adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE \
    --es operation add-tile --ecn component "$PAKET/$SINIF.tile.$servis" 2>&1 || true)
  echo "add-tile $servis: $cikti"
  indeks=$(echo "$cikti" | sed -n 's/.*Index=\[\([0-9]*\)\].*/\1/p' | head -1)
  if [ -z "$indeks" ]; then
    echo "UYARI: $servis tile eklenemedi"
    return 1
  fi
  cikti=$(adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SYSUI \
    --es operation show-tile --ei index "$indeks" 2>&1 || true)
  echo "show-tile $indeks: $cikti"
  if ! echo "$cikti" | grep -q 'result=1'; then
    adb shell input swipe $((G * 4 / 5)) $((Y / 2)) $((G / 5)) $((Y / 2)) 300
  fi
  kare "$ad" 6
}
adb shell am force-stop "$PAKET"
sleep 2
tile_goster BugunTileServisi 05-tile-bugun || true
adb shell input keyevent KEYCODE_BACK
sleep 2
tile_goster VakitTileServisi 06-tile-vakit || true
adb shell input keyevent KEYCODE_BACK
sleep 2

# Kadranda komplikasyon karesi BILINCLI YOK: emulatorun tek kadrani (Orbita)
# yuvalarini kapali getirir ("set-complication failed ... Complication slot is not
# enabled", yuva >= 3 "out of range") ve imajda baska kadran yuklu degil.

# --- VIDEO: "Kıldım" onayi animasyonu (en gayret; kareleri ETKILEMEZ, en sonda) ---
# Emulator `disable-animations: true` ile acilir → animator olcegi 0 → uygulama
# "hareketi azalt" sanip son kareye atlar. Kayit icin olcek yalniz burada 1 yapilir.
# screenrecord MediaCodec ister; swiftshader'da tutmazsa UYARI ile gecilir.
VIDEO="videolar-saat"
mkdir -p "$VIDEO"
adb shell settings put global animator_duration_scale 1 || true
adb shell settings put global transition_animation_scale 1 || true
ana_ac
if dump_al && node scripts/saat/ui-merkez.js /tmp/saat-ui.xml 'kıldım olarak işaretleyin' > /tmp/kildim-xy; then
  adb shell rm -f /sdcard/kildim.mp4 || true
  adb shell screenrecord --time-limit 9 /sdcard/kildim.mp4 &
  KAYIT=$!
  sleep 1.5
  adb shell input tap $(cat /tmp/kildim-xy)
  sleep 2
  # Onay katmaninin kenar dugmesi ("Kıldım"): ekranin alt ortasi.
  adb shell input tap $((G / 2)) $((Y * 7 / 8))
  wait "$KAYIT" || true
  sleep 1
  if adb pull /sdcard/kildim.mp4 "$VIDEO/$ETIKET-kildim.mp4" >/dev/null 2>&1 && [ -s "$VIDEO/$ETIKET-kildim.mp4" ]; then
    echo "video: $VIDEO/$ETIKET-kildim.mp4"
  else
    echo "UYARI: kildim videosu alinamadi"
  fi
else
  echo "UYARI: video icin Kildim dugmesi bulunamadi"
fi
adb shell settings put global animator_duration_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true

# --- 10: sessiz uyandirma ekrani (magaza gorseli "Bilekte sessiz uyandirma") ---
# EN SONDA: saat degistirilir. `UyandirmaAktivite` disa kapali (exported=false) → kabuk
# onu ancak adbd root iken baslatabilir; kayit tohum yukunde (`uyandirma`, ani dunde →
# zincir calmaz). Metin "Sabah · 25 dk kaldi" oldugu icin saat 06:51'e alinir (telefonun alarm karesi ve vakit sonu 07:16 ile ayni an; gercek
# saat 17:43 gibi bir an gosterip metinle celisiyordu). Olmazsa kare UYARI ile atlanir;
# pazarlama gorseli o zaman ekranin cizimine duser (scripts/magaza-gorselleri).
adb root >/dev/null 2>&1 || true
adb wait-for-device
sleep 2
adb shell am force-stop "$PAKET"
adb shell settings put global auto_time 0 || true
adb shell settings put global auto_time_zone 0 || true
GUN="$(adb shell date +%m%d%Y | tr -d '\r')"
if [ ${#GUN} -eq 8 ] && adb shell date "${GUN:0:4}0651${GUN:4:4}.00" >/dev/null 2>&1; then
  echo "saat: $(adb shell date +%H:%M | tr -d '\r')"
else
  echo "UYARI: saat 06:51'e alinamadi (root yok?)"
fi
if adb shell am start -W -n "$PAKET/$SINIF.ui.UyandirmaAktivite" --es id magaza_karesi_uyandirma 2>&1 | grep -q 'Error\|Exception'; then
  echo "UYARI: 10-uyandirma ekrani baslatilamadi (root yok?) — kare atlandi"
elif hazir_bekle 'Kıldım|Kapat'; then
  # Emulator saati ana makineyle yeniden esitleyebiliyor (bir kosuda kare 21:56 gosterdi):
  # cekimden hemen once saati yeniden kur, ekrandaki saat guncellensin, sonra cek.
  for _ in 1 2 3; do
    adb shell date "${GUN:0:4}0651${GUN:4:4}.00" >/dev/null 2>&1 || true
    sleep 3
    [ "$(adb shell date +%H:%M | tr -d '\r')" = "06:51" ] && break
  done
  echo "cekim ani saat: $(adb shell date +%H:%M | tr -d '\r')"
  kare 10-uyandirma 0 || true
else
  echo "UYARI: 10-uyandirma ekrani acilmadi — kare atlandi"
fi
adb shell am force-stop "$PAKET"
adb shell settings put global auto_time 1 || true
adb shell settings put global auto_time_zone 1 || true

ls -la "$CIKIS"
