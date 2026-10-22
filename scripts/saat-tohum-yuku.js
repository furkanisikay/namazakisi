#!/usr/bin/env node
/**
 * Apple Watch magaza kareleri icin ORNEK YUK (Wear yuk bicimi v2,
 * `src/core/wear/wearYuku.ts` / `wear/app/src/test/resources/ornek-yuk.json`).
 *
 * Saat uygulamasi bu yuku yalniz SIMULATORDE baslatma ortamindan okur
 * (`targets/saat/SaatSimulatorTohumu.swift`); cihaz ikilisinde o kod yoktur.
 *
 * SAAT DILIMI HILESI (neden): kareler gercek saatte cekilir ve simulatorun saati
 * degistirilemez. Hat Istanbul'da sabah 10'da kossa ekranda "Gunes" (kilinamaz) gorunur,
 * "Kildim" onay karesi hic cekilemezdi. Bu yuzden vakitler Istanbul'un GERCEK duvar
 * saatleriyle uretilir ama uygulamaya oyle bir saat dilimi (`Etc/GMT±N`) verilir ki
 * su anki gercek an o dilimde ogle vaktinin ORTASINA (±30 dk) denk gelsin. Ekrandaki
 * vakit saatleri Istanbul'unkiyle birebir aynidir, geri sayim gercek saatle tutarlidir.
 *
 * Cikti (stdout, JSON): { tz, ofsetSa, durumCubuguSaati, tarih, kalanDk, istanbulVakitleri, yuk }
 *   yuk: tek satirlik JSON dizesi (SIMCTL_CHILD_NAMAZ_SAAT_TOHUM_YUK).
 * Secenek: --simdi <epoch ms> (test icin); --hedef simdi (ya da SAAT_HEDEF=simdi): dilim
 *   KAYDIRILMAZ, saat GERCEK Istanbul vaktini gosterir (telefon kareleriyle ayni vakit;
 *   pazarlama gorsellerinde telefon + saat birlikte). Gercek an gunes vaktindeyse (kilinamaz)
 *   ogle hilesine duser.
 *
 * Hesap = telefonun hesabi: adhan `CalculationMethod.Turkey()` (madhab verilmez →
 * asr-i evvel; `core/vakit/hesapParametreleri.ts > turkiyeHesapParametreleri`).
 */
const { Coordinates, CalculationMethod, PrayerTimes } = require('adhan');

const ISTANBUL = new Coordinates(41.0082, 28.9784);
const ISTANBUL_OFSET_SA = 3;
const SA = 3_600_000;
const GUN = 24 * SA;
const VAKITLER = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

function argSimdi(argv) {
  const i = argv.indexOf('--simdi');
  if (i >= 0 && argv[i + 1]) return Number(argv[i + 1]);
  return Date.now();
}

/** UTC bilesenleriyle `YYYY-MM-DD`. */
function isoTarih(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Istanbul'da verilen takvim gununun vakitleri (gercek epoch ms). */
function istanbulVakitleri(tarihIso) {
  const [y, m, d] = tarihIso.split('-').map(Number);
  // adhan tarihin YEREL bilesenlerini okur; yerel gece yarisi bilesenleri korur.
  const pt = new PrayerTimes(ISTANBUL, new Date(y, m - 1, d), CalculationMethod.Turkey());
  return {
    imsak: pt.fajr.getTime(),
    gunes: pt.sunrise.getTime(),
    ogle: pt.dhuhr.getTime(),
    ikindi: pt.asr.getTime(),
    aksam: pt.maghrib.getTime(),
    yatsi: pt.isha.getTime(),
  };
}

function gunuKaydir(tarihIso, gun) {
  return isoTarih(Date.parse(`${tarihIso}T00:00:00Z`) + gun * GUN);
}

/** Etc/GMT isaretleri TERSTIR: UTC+5 = "Etc/GMT-5". */
function saatDilimi(ofsetSa) {
  if (ofsetSa === 0) return 'Etc/GMT';
  return `Etc/GMT${ofsetSa > 0 ? '-' : '+'}${Math.abs(ofsetSa)}`;
}

/** Gercek Istanbul vaktinde aktif vakit: { gunFark, vakit } ya da gunes ise null. */
function gercekAktifVakit(simdi) {
  const istTarih = isoTarih(simdi + ISTANBUL_OFSET_SA * SA);
  const b = istanbulVakitleri(istTarih);
  if (simdi < b.imsak) return { gunFark: -1, vakit: 'yatsi' };
  if (simdi < b.gunes) return { gunFark: 0, vakit: 'imsak' };
  if (simdi < b.ogle) return null;
  for (const v of ['yatsi', 'aksam', 'ikindi', 'ogle']) if (simdi >= b[v]) return { gunFark: 0, vakit: v };
  return null;
}

function uret(simdi, secenek = {}) {
  const aktif = secenek.hedef === 'simdi' ? gercekAktifVakit(simdi) : null;
  // 1) Bugunun (Istanbul) ogle penceresinin ortasi, Istanbul duvar saatiyle (dk).
  const istTarih = isoTarih(simdi + ISTANBUL_OFSET_SA * SA);
  const bugun = istanbulVakitleri(istTarih);
  const orta = (bugun.ogle + bugun.ikindi) / 2;
  const ortaDk = Math.floor(((orta + ISTANBUL_OFSET_SA * SA) % GUN) / 60_000);
  const simdiDk = Math.floor((simdi % GUN) / 60_000);

  // 2) Su anki gercek ani o duvar saatine getiren tam saatlik dilim.
  let ofset = Math.round((ortaDk - simdiDk) / 60);
  ofset = ((ofset % 24) + 24) % 24;
  if (ofset > 14) ofset -= 24;
  if (aktif) ofset = ISTANBUL_OFSET_SA;

  // 3) O dilimdeki takvim gunu ve vakitler: Istanbul duvar saatleri, dilime tasinir.
  const tarih = isoTarih(simdi + ofset * SA);
  const kaydirma = (ISTANBUL_OFSET_SA - ofset) * SA;
  const gunler = [-1, 0, 1].map((fark) => {
    const t = gunuKaydir(tarih, fark);
    const ham = istanbulVakitleri(t);
    const vakitler = {};
    for (const v of VAKITLER) vakitler[v] = ham[v] + kaydirma;
    // Dun tamamen kilinmis, bugun yalniz sabah (ogle aktif, "Kildim" gorunsun), yarin bos.
    let kilinan = fark < 0 ? ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] : fark === 0 ? ['imsak'] : [];
    // Gercek vakit kipi: aktif vakitten ONCEKILER kilinmis, aktif vakit kilinmamis (Kildim gorunsun).
    if (aktif) {
      const sira = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
      const once = sira.slice(0, sira.indexOf(aktif.vakit));
      kilinan = fark < aktif.gunFark ? sira : fark === aktif.gunFark ? once : [];
    }
    return { tarih: t, vakitler, kilinan, ham };
  });

  const bugunGun = gunler[1];
  if (!aktif && !(bugunGun.vakitler.ogle <= simdi && simdi < bugunGun.vakitler.ikindi)) {
    throw new Error(`Ogle penceresi tutturulamadi (ofset ${ofset}, tarih ${tarih})`);
  }
  const yerel = new Date(simdi + ofset * SA);
  const durumCubuguSaati = `${String(yerel.getUTCHours()).padStart(2, '0')}:${String(yerel.getUTCMinutes()).padStart(2, '0')}`;
  const hhmm = (ms) => {
    const d = new Date(ms + ISTANBUL_OFSET_SA * SA);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };
  const yuk = {
    surum: 2,
    konumAdi: 'Fatih, İstanbul',
    kerahatDk: { suruk: 20, istiva: 5, gurub: 20 },
    gunler: gunler.map(({ tarih: t, vakitler, kilinan }) => ({ tarih: t, vakitler, kilinan })),
    muhafiz: [],
    // Kible karesi: telefonun gonderdigi gibi 1 ondaliga yuvarlanmis konum.
    konum: { lat: 41, lng: 29 },
    // Uyandirma karesi: yarinin sabah uyandirmasi (telefonun kimlik bicimiyle).
    uyandirma: [
      {
        id: `muhafiz_${gunler[2].tarih}_vakit_imsak_seviye_2_dk_34`,
        ms: gunler[2].vakitler.gunes - 34 * 60_000,
        sonMs: gunler[2].vakitler.gunes,
        tarih: gunler[2].tarih,
        tur: 'imsak',
        baslik: 'Sabah vakti',
        govde: 'Sabah namazı vakti, kalk.',
      },
    ],
  };
  return {
    tz: saatDilimi(ofset),
    ofsetSa: ofset,
    durumCubuguSaati,
    tarih,
    kalanDk: aktif ? null : Math.round((bugunGun.vakitler.ikindi - simdi) / 60_000),
    aktifVakit: aktif ? aktif.vakit : 'ogle',
    istanbulVakitleri: Object.fromEntries(VAKITLER.map((v) => [v, hhmm(bugunGun.ham[v])])),
    yuk: JSON.stringify(yuk),
  };
}

module.exports = { uret, saatDilimi };

if (require.main === module) {
  const i = process.argv.indexOf('--hedef');
  const hedef = i >= 0 ? process.argv[i + 1] : process.env.SAAT_HEDEF;
  process.stdout.write(`${JSON.stringify(uret(argSimdi(process.argv), { hedef }))}\n`);
}
