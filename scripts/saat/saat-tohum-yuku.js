#!/usr/bin/env node
/**
 * Wear OS saat ekran goruntuleri icin TOHUM YUKU (issue #269 sozlesmesi).
 *
 * Saat vakitleri telefondan Data Layer ile alir; emulatorde telefon yoktur. Hat bu
 * betikle, telefonun gonderecegi yukun BIREBIR seklini uretir ve saatin kendi
 * deposuna (`YukDeposu`: SharedPreferences `saat_veri`, anahtar `yuk`) `run-as` ile
 * yazar. Saat koduna tohum alicisi EKLENMEDI → uretim davranisi degismez.
 *
 * Hesap telefonun yoluyla ayni: `CalculationMethod.Turkey()` (asr-i evvel), gun
 * bazinda ayri `PrayerTimes`, Istanbul (Fatih) koordinati, dun + 30 gun (31 gun —
 * `WEAR_GUN_SAYISI`). Kilinmislik gercekci: vakti GIRMIS namazlar kilinmis, SU ANKI
 * vakit kilinmamis (ekranda "Kıldım" onayi cekilebilsin). Muhafiz plani BOS:
 * kare cekerken saatin kendi alarmlari bildirim gondermesin.
 *
 * Nobetci: src/core/wear/__tests__/saatTohumYuku.test.ts — `wearYukuGecerliMi`
 * ve `gunVakitleriniHesapla` ile birebir.
 *
 * Kullanim: node scripts/saat/saat-tohum-yuku.js <cikis-xml>
 */
'use strict';

const fs = require('fs');

const KOORDINAT = { lat: 41.0082, lng: 28.9784 };
const KONUM_ADI = 'Fatih, İstanbul';
const GUN_SAYISI = 31;
const SAAT_DILIMI = 'Europe/Istanbul';
const VAKITLER = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
const ADHAN_ALANI = { imsak: 'fajr', gunes: 'sunrise', ogle: 'dhuhr', ikindi: 'asr', aksam: 'maghrib', yatsi: 'isha' };

/** Anin Istanbul takvim gunu ('YYYY-MM-DD'). */
function istanbulGunu(ms) {
    // en-CA bicimi YYYY-MM-DD verir.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: SAAT_DILIMI,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(ms));
}

function gunEkle(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return t.toISOString().slice(0, 10);
}

/** Telefonun `gunVakitleriniHesapla` yolu (yerel y/a/g bilesenleriyle `Date`). */
function gunVakitleri(iso) {
    const { Coordinates, CalculationMethod, PrayerTimes } = require('adhan');
    const [y, m, d] = iso.split('-').map(Number);
    const pt = new PrayerTimes(
        new Coordinates(KOORDINAT.lat, KOORDINAT.lng),
        new Date(y, m - 1, d),
        CalculationMethod.Turkey()
    );
    const sonuc = {};
    for (const v of VAKITLER) sonuc[v] = pt[ADHAN_ALANI[v]].getTime();
    return sonuc;
}

/**
 * Yuk nesnesi. Aktif gun telefonla ayni kural: su an < bugunun imsaki ise DUN
 * (yatsi suruyor). Aktif gunde vakti girmis namazlar kilinmis, en son giren
 * (su anki) vakit kilinmamis; aktif gunden onceki gun tamamen kilinmis.
 */
function tohumYuku(simdiMs = Date.now()) {
    const bugun = istanbulGunu(simdiMs);
    const dun = gunEkle(bugun, -1);
    const gunler = [];
    for (let i = 0; i < GUN_SAYISI; i++) {
        const tarih = gunEkle(dun, i);
        gunler.push({ tarih, vakitler: gunVakitleri(tarih), kilinan: [] });
    }
    const aktifIndeks = simdiMs < gunler[1].vakitler.imsak ? 0 : 1;
    const farzlar = VAKITLER.filter((v) => v !== 'gunes');
    const girmis = farzlar.filter((v) => gunler[aktifIndeks].vakitler[v] <= simdiMs);
    gunler[aktifIndeks].kilinan = girmis.slice(0, -1);
    if (aktifIndeks === 1) gunler[0].kilinan = [...farzlar];

    return {
        surum: 2,
        konumAdi: KONUM_ADI,
        // KAZA_SABITLERI.MEKRUH_TOLERANS_DK / ISTIVA (testte karsilastirilir).
        kerahatDk: { suruk: 20, istiva: 5, gurub: 20 },
        gunler,
        muhafiz: [],
    };
}

function xmlKacir(metin) {
    return metin
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/** `YukDeposu` SharedPreferences dosyasi (`saat_veri.xml`). */
function tercihXml(yuk) {
    return [
        "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
        '<map>',
        `    <string name="yuk">${xmlKacir(JSON.stringify(yuk))}</string>`,
        '    <boolean name="guncelleme_gerekli" value="false" />',
        '</map>',
        '',
    ].join('\n');
}

module.exports = { tohumYuku, tercihXml, istanbulGunu, KOORDINAT };

if (require.main === module) {
    const cikis = process.argv[2];
    if (!cikis) {
        console.error('Kullanim: saat-tohum-yuku.js <cikis-xml>');
        process.exit(1);
    }
    const yuk = tohumYuku();
    fs.writeFileSync(cikis, tercihXml(yuk), 'utf8');
    const [dun, bugun] = yuk.gunler;
    console.log(
        `tohum yuku: ${yuk.gunler.length} gun, dun=${dun.tarih} [${dun.kilinan.join(',')}], ` +
            `bugun=${bugun.tarih} [${bugun.kilinan.join(',')}]`
    );
}
