#!/usr/bin/env bash
# Emulatoru kare hattinin diline alir ve paket servisi kararli hale gelene kadar bekler.
# Kare hatlari `adb wait-for-device`'tan hemen sonra, APK kurmadan once cagirir.
#
# Dil: TOHUM_DIL (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo) → cihaz dili; bilinmeyen kod tr-TR (saat/TV `values-en` tasidigi icin Turkce turda
# cihaz Turkce olmali). `-change-locale` emulator secenegi KULLANILMAZ: acilistan hemen sonra
# framework'u yeniden baslatir ve emulator-runner'in kendi kilit acma adimi (`input keyevent 82`)
# "Broken pipe" ile duser — o adim kapatilamaz. Burada dil, acilis tamamlandiktan sonra root ile
# yazilir ve framework bilincli olarak yeniden baslatilir.
#
# Bekleme: `sys.boot_completed` yeniden baslatmada 1 kalir, tek basina yetmez → paket servisi
# ART ARDA 3 kez cevap verene dek bekle.
set -uo pipefail

case "${TOHUM_DIL:-tr}" in
  en) HEDEF="en-US" ;; id) HEDEF="id-ID" ;; de) HEDEF="de-DE" ;; fr) HEDEF="fr-FR" ;;
  bs) HEDEF="bs-BA" ;; ru) HEDEF="ru-RU" ;; ms) HEDEF="ms-MY" ;;
  ar) HEDEF="ar-SA" ;; ur) HEDEF="ur-PK" ;;
  es) HEDEF="es-ES" ;; nl) HEDEF="nl-NL" ;; sq) HEDEF="sq-AL" ;; hi) HEDEF="hi-IN" ;; bn) HEDEF="bn-BD" ;;
  fa) HEDEF="fa-IR" ;; ps) HEDEF="ps-AF" ;; ckb) HEDEF="ckb-IQ" ;; ug) HEDEF="ug-CN" ;;
  az) HEDEF="az-AZ" ;; uz) HEDEF="uz-UZ" ;; kk) HEDEF="kk-KZ" ;; ky) HEDEF="ky-KG" ;; tg) HEDEF="tg-TJ" ;;
  # Fula = Pular (Gine): ff-GN.
  sw) HEDEF="sw-TZ" ;; ha) HEDEF="ha-NG" ;; am) HEDEF="am-ET" ;; om) HEDEF="om-ET" ;; so) HEDEF="so-SO" ;; ff) HEDEF="ff-GN" ;; yo) HEDEF="yo-NG" ;;
  # zh/ta/ml/th/ko/vi seçicide kapalıdır: tohumun dil kaydını (`dil_ayari.kod`) kare hattı işareti (`@namaz_akisi/kare_turu`) açar.
  # Çince yalnız Basitleştirilmiş: sistem dili zh-Hans-CN (zh-TW betik uyuşmazlığıyla values-zh'yi seçmeyebilir).
  zh) HEDEF="zh-Hans-CN" ;; ta) HEDEF="ta-IN" ;; ml) HEDEF="ml-IN" ;; th) HEDEF="th-TH" ;; ko) HEDEF="ko-KR" ;; vi) HEDEF="vi-VN" ;;
  # pt/it/sv/uk/ro/hr/sr/el seçicide kapalıdır (kare hattı işareti açar). Portekizce Avrupa normu (pt-PT);
  # Sırpça KİRİL: betik açık yazılır (sr-Latn cihaz values-sr'yi seçmez, Türkçe values/'e düşer).
  pt) HEDEF="pt-PT" ;; it) HEDEF="it-IT" ;; sv) HEDEF="sv-SE" ;; uk) HEDEF="uk-UA" ;; ro) HEDEF="ro-RO" ;; hr) HEDEF="hr-HR" ;; sr) HEDEF="sr-Cyrl-RS" ;; el) HEDEF="el-GR" ;;
  # ku/tk/tt/sd/pl/ja/gu/bg/mk seçicide kapalıdır (kare hattı işareti açar). Kurmancî `ku` (values-ku; kmr değil),
  # Sindhçe Pakistan normu (Arap harfli, sağdan sola). Sistem dili `persist.sys.locale` ile yazılır: dilin
  # sistem ayarlarındaki listede olması gerekmez, kaynak seçimi BCP-47 etiketinden yapılır.
  ku) HEDEF="ku-TR" ;; tk) HEDEF="tk-TM" ;; tt) HEDEF="tt-RU" ;; sd) HEDEF="sd-PK" ;; pl) HEDEF="pl-PL" ;; ja) HEDEF="ja-JP" ;; gu) HEDEF="gu-IN" ;; bg) HEDEF="bg-BG" ;; mk) HEDEF="mk-MK" ;;
  # fil/te/kn/mr/pa/as/ne/si/km seçicide kapalıdır (kare hattı işareti açar). Filipince sistem dili fil-PH
  # (uygulama kaynağı values-tl; Android `fil` ile `tl`'yi eşdeğer sayar). Pencapça YALNIZ Şahmuki: betik açık
  # yazılır (pa-Arab-PK; kaynak values-b+pa+Arab, çıplak `pa` Gurmuki betiğe çözülür ve o dizini seçmez).
  fil) HEDEF="fil-PH" ;; te) HEDEF="te-IN" ;; kn) HEDEF="kn-IN" ;; mr) HEDEF="mr-IN" ;; pa) HEDEF="pa-Arab-PK" ;; as) HEDEF="as-IN" ;; ne) HEDEF="ne-NP" ;; si) HEDEF="si-LK" ;; km) HEDEF="km-KH" ;;
  # Dalga 13 seçicide kapalıdır (kare hattı işareti açar). İbranice he-IL (uygulama kaynağı values-iw: Android cihazın
  # `he`sini kaynak eşlemesinden önce `iw`ye çevirir); İbranice ve N'Ko sağdan sola. Üç harfli kodlar (dag, mos, mdh,
  # ceb, nqo) values-b+<kod>; CLDR'de yerel ayarı olmayan dag/mos/aa/mdh da BCP-47 etiketiyle kaynağı seçer.
  he) HEDEF="he-IL" ;; ka) HEDEF="ka-GE" ;; lt) HEDEF="lt-LT" ;; mg) HEDEF="mg-MG" ;; lg) HEDEF="lg-UG" ;; rw) HEDEF="rw-RW" ;; rn) HEDEF="rn-BI" ;; ln) HEDEF="ln-CD" ;;
  dag) HEDEF="dag-GH" ;; mos) HEDEF="mos-BF" ;; aa) HEDEF="aa-ET" ;; mdh) HEDEF="mdh-PH" ;; ak) HEDEF="ak-GH" ;; ceb) HEDEF="ceb-PH" ;; nqo) HEDEF="nqo-GN" ;;
  *) HEDEF="tr-TR" ;;
esac

# Maestro akislari iki dillidir ("(Turkce|Ingilizce)" secicileri); baska dilin turunda
# secicilere sozlukten o dilin karsiligi eklenir (CI kopyasinda, yerinde; tekrar kosmak zararsiz).
case "${TOHUM_DIL:-tr}" in tr|en) ;; *) node scripts/maestro/akislari-yerellestir.js "$TOHUM_DIL" || echo "UYARI: akislar yerellestirilemedi" ;; esac

bekle() {
  local ardisik=0
  for _ in $(seq 1 90); do
    if [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ] \
      && adb shell pm path android >/dev/null 2>&1; then
      ardisik=$((ardisik + 1))
      [ "$ardisik" -ge 3 ] && return 0
    else
      ardisik=0
    fi
    sleep 2
  done
  return 1
}

bekle || { echo "emulator 3 dakikada hazir olmadi" >&2; exit 1; }

MEVCUT=$(adb shell getprop persist.sys.locale | tr -d '\r')
[ -z "$MEVCUT" ] && MEVCUT=$(adb shell getprop ro.product.locale | tr -d '\r')
if [ "$MEVCUT" != "$HEDEF" ]; then
  echo "cihaz dili: '${MEVCUT:-varsayilan}' → $HEDEF"
  adb root >/dev/null 2>&1 || true
  adb wait-for-device
  if adb shell setprop persist.sys.locale "$HEDEF" 2>/dev/null; then
    adb shell setprop ctl.restart zygote
    sleep 8
    bekle || { echo "dil degisiminden sonra emulator hazir olmadi" >&2; exit 1; }
    adb shell input keyevent 82 >/dev/null 2>&1 || true
    adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
  else
    echo "UYARI: cihaz dili degistirilemedi (root yok); $MEVCUT ile devam" >&2
  fi
fi
# Kök yetkisi olmayan imajda (Android TV) sistem dili degismez; kare hatti uygulama kurulunca
# uygulamaya ozel dili (Android 13+, `cmd locale set-app-locales`) bu dosyadan okur.
echo "$HEDEF" > "${RUNNER_TEMP:-/tmp}/kare-hedef-dil"
echo "emulator hazir (hedef dil: $HEDEF)"
