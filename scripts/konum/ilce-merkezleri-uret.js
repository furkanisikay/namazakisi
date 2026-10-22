#!/usr/bin/env node
/**
 * İlçe merkezi koordinat tablosunu üretir → src/core/konum/ilceMerkezleriVerisi.ts
 *
 * Kaynaklar (ikisi de çalıştırma anında indirilir, depoya ham hâli GİRMEZ):
 *  1) OpenStreetMap (ODbL) — Overpass:
 *       [out:json][timeout:600];
 *       area["ISO3166-1"="TR"]["admin_level"="2"]->.tr;
 *       rel(area.tr)["boundary"="administrative"]["admin_level"~"^(4|6)$"]->.d;
 *       .d out body center; node(r.d:"admin_centre"); out; node(r.d:"label"); out;
 *     İlçe = admin_level 6; ili, API'nin il merkezine en yakın aynı adlı aday (OSM `network` etiketi
 *     sahada yanlış olabildiği için kullanılmaz). Konum önceliği: admin_centre düğümü (ilçe
 *     merkezi kasaba) > label düğümü > sınır kutusunun merkezi.
 *  2) turkiyeapi.dev ilçe listesi (kimlik + ad + il), uygulamanın çalışma anında
 *     gördüğü kimlik/adla eşleşsin diye:
 *       https://api.turkiyeapi.dev/v1/districts?limit=1000&fields=id,name,provinceId
 *
 * Kullanım: node scripts/konum/ilce-merkezleri-uret.js <osm.json> <api_ilceler.json>
 * Eşleşmeyen ilçe varsa betik HATA verir (sessizce il merkezine düşmesin).
 */
const fs = require('fs');
const path = require('path');


// src/core/konum/ilceKoordinati.ts > adAnahtari ile AYNI kural (nöbetçi test eşitliği denetler).
const HARF = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', i: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u', â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u' };
function adAnahtari(ad) {
  let s = '';
  for (const h of ad.normalize('NFC')) {
    if (HARF[h] !== undefined) { s += HARF[h]; continue; }
    const k = h.charCodeAt(0);
    if (k >= 65 && k <= 90) s += String.fromCharCode(k + 32);
    else if ((k >= 97 && k <= 122) || (k >= 48 && k <= 57)) s += h;
  }
  return s;
}

function uret(osmYolu, apiYolu) {
  const elemanlar = JSON.parse(fs.readFileSync(osmYolu, 'utf8')).elements;
  const dugumler = new Map(elemanlar.filter((e) => e.type === 'node').map((e) => [e.id, e]));
  const iliskiler = elemanlar.filter((e) => e.type === 'relation');

  // İl merkezleri (en yakın il yedeği için)
  const iller = new Map();
  for (const r of iliskiler.filter((r) => r.tags.admin_level === '4')) {
    const m = /^TR-(\d+)$/.exec(r.tags['ISO3166-2'] || '');
    if (!m) continue;
    const ac = r.members.find((x) => x.role === 'admin_centre' && dugumler.has(x.ref));
    const d = ac ? dugumler.get(ac.ref) : { lat: r.center.lat, lon: r.center.lon };
    iller.set(Number(m[1]), { lat: d.lat, lng: d.lon, kaynak: ac ? 'admin_centre' : 'center' });
  }

  function konumu(r) {
    for (const rol of ['admin_centre', 'label']) {
      const uye = r.members.find((x) => x.role === rol && x.type === 'node' && dugumler.has(x.ref));
      if (uye) {
        const d = dugumler.get(uye.ref);
        return { lat: d.lat, lng: d.lon, kaynak: rol };
      }
    }
    return { lat: r.center.lat, lng: r.center.lon, kaynak: 'center' };
  }

  function mesafeKm(a, b) {
    const R = 6371, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // OSM ilçeleri: adAnahtari → aday listesi (TÜM Türkiye). `network` etiketi (TRnn-districts)
  // İL için KULLANILMAZ: sahada yanlış etiketli kayıtlar var (2026-10: Mersin ilçeleri TR31,
  // Zonguldak ilçeleri TR81). İl, API'nin il merkezine EN YAKIN aynı adlı aday seçilerek bulunur.
  const osmAd = new Map();
  for (const r of iliskiler.filter((r) => r.tags.admin_level === '6')) {
    const k = konumu(r);
    const adlar = new Set([r.tags.name, r.tags['name:tr'], r.tags.old_name].filter(Boolean));
    for (const ad of adlar) {
      const a = adAnahtari(ad);
      if (!osmAd.has(a)) osmAd.set(a, []);
      osmAd.get(a).push({ ...k, osmAd: r.tags.name, osmId: r.id });
    }
  }

  /** İl merkezinden bu kadar uzaktaki aday reddedilir (en geniş il Konya ≈ 200 km yarıçap). */
  const AZAMI_KM = 230;

  const api = JSON.parse(fs.readFileSync(apiYolu, 'utf8')).data;
  const cikti = {};
  const eksik = [];
  const kaynakSayisi = { admin_centre: 0, label: 0, center: 0 };
  let enUzak = { km: 0 };
  for (const ilce of api) {
    const ilId = ilce.provinceId;
    const ilMerkezi = iller.get(ilId);
    const ilAdi = ilce.province;
    if (!ilMerkezi) { eksik.push(`${ilAdi} (${ilId}) il merkezi OSM'de yok`); continue; }
    const adaylar = [ilce.name];
    // "Merkez" ilçeleri OSM'de çoğunlukla "<İl> Merkez" ya da il adıyla geçer
    if (ilce.name === 'Merkez') adaylar.push(`${ilAdi} Merkez`, ilAdi, `${ilAdi} Merkez İlçesi`);
    let bulunan = null;
    for (const a of adaylar) {
      const liste = osmAd.get(adAnahtari(a)) || [];
      for (const aday of liste) {
        const km = mesafeKm(ilMerkezi, aday);
        if (km <= AZAMI_KM && (!bulunan || km < bulunan.km)) bulunan = { ...aday, km };
      }
      if (bulunan) break;
    }
    if (!bulunan) {
      eksik.push(`${ilAdi} (${ilId}) / ${ilce.name} (${ilce.id})`);
      continue;
    }
    // "Merkez" ilçesinin merkezi = İLİN merkez düğümü (tanım gereği). İlçe ilişkisinin kendi
    // konumuna güvenilmez: Rize'de admin_centre yok (sınır kutusu ortası, 8 km), Çorum'da
    // admin_centre yanlışlıkla bir köy (Güzelyayla, 11 km).
    if (ilce.name === 'Merkez' && ilMerkezi.kaynak === 'admin_centre') {
      bulunan = { ...bulunan, lat: ilMerkezi.lat, lng: ilMerkezi.lng, kaynak: 'admin_centre' };
    }
    if (bulunan.km > enUzak.km) enUzak = { km: bulunan.km, ad: `${ilAdi}/${ilce.name}` };
    kaynakSayisi[bulunan.kaynak]++;
    (cikti[ilId] ||= []).push([ilce.id, ilce.name, Math.round(bulunan.lat * 1e4) / 1e4, Math.round(bulunan.lng * 1e4) / 1e4]);
  }

  if (eksik.length) {
    console.error(`Eşleşmeyen ${eksik.length} ilçe:\n` + eksik.join('\n'));
    process.exit(1);
  }
  console.log(`İl merkezine en uzak eşleşme: ${enUzak.ad} ${enUzak.km.toFixed(0)} km`);

  const siraliIller = Object.keys(cikti).map(Number).sort((a, b) => a - b);
  let ts = `/**
 * İlçe merkezi koordinatları — ÜRETİLMİŞ DOSYA, ELLE DÜZENLEMEYİN.
 * Üretici: scripts/konum/ilce-merkezleri-uret.js (kaynak ve sorgu orada).
 *
 * Koordinatlar © OpenStreetMap katkıcıları, Open Database License (ODbL) 1.0
 * (https://opendatacommons.org/licenses/odbl/1-0/; metin: assets/camiler/LICENSE.ODbL).
 * İlçe kimlik ve adları turkiyeapi.dev ile eşleşir.
 *
 * Biçim: il kimliği (plaka) → [turkiyeapi ilçe kimliği, ilçe adı, enlem, boylam][]
 * Toplam ${api.length} ilçe; konum kaynağı: admin_centre ${kaynakSayisi.admin_centre}, label ${kaynakSayisi.label}, sınır merkezi ${kaynakSayisi.center}.
 */
export const ILCE_MERKEZLERI: Readonly<Record<string, readonly (readonly [number, string, number, number])[]>> = {
`;
  for (const il of siraliIller) {
    const satirlar = cikti[il]
      .sort((a, b) => a[1].localeCompare(b[1], 'tr'))
      .map((k) => `[${k[0]}, ${JSON.stringify(k[1])}, ${k[2]}, ${k[3]}]`);
    ts += `  '${il}': [${satirlar.join(', ')}],\n`;
  }
  ts += '};\n';
  const hedef = path.join(__dirname, '..', '..', 'src', 'core', 'konum', 'ilceMerkezleriVerisi.ts');
  fs.writeFileSync(hedef, ts);
  console.log(`Yazıldı: ${hedef} — ${api.length} ilçe`, kaynakSayisi);
}

module.exports = { adAnahtari };

if (require.main === module) {
  const [osmYolu, apiYolu] = process.argv.slice(2);
  if (!osmYolu || !apiYolu) {
    console.error('Kullanım: node ilce-merkezleri-uret.js <osm.json> <api_ilceler.json>');
    process.exit(2);
  }
  uret(osmYolu, apiYolu);
}
