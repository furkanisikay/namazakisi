#!/usr/bin/env node
/**
 * Ana App ID'deki (com.furkanisikay.namazakisi) iCloud yetenegini okur / acar.
 * YALNIZ ICLOUD'a dokunur; baska hicbir yetenegi degistirmez.
 *
 *   node scripts/asc-icloud.js durum   -> App ID'nin tum yeteneklerini (tur + ayar) yazar
 *   node scripts/asc-icloud.js ac      -> ICLOUD yoksa ekler (ICLOUD_VERSION=XCODE_6);
 *                                         varsa ayarina dokunmaz, yalniz yazar
 *
 * Neden var (2026-10-20): EAS'in yetenek esitlemesi iCloud'u yalniz
 * `com.apple.developer.icloud-container-identifiers` entitlement'ina esler.
 * Uygulama yalniz anahtar-deger deposunu (`ubiquity-kvstore-identifier`)
 * kullandigi icin Apple ID ile yapilan etkilesimli build iCloud'u App ID'de
 * KAPATTI ve uretilen profil iCloud'suz cikti. Ayrinti: docs/ajan/ios.md.
 *
 * Kimlik bilgileri: scripts/asc-istemci.js.
 */
const { api, hata, kimlikDenetle } = require('./asc-istemci');

const PAKET = process.env.ASC_BUNDLE_ID || 'com.furkanisikay.namazakisi';

async function paketKimligi() {
    const r = await api('GET', '/v1/bundleIds?filter[identifier]=' + encodeURIComponent(PAKET) + '&limit=20');
    if (r.kod !== 200) hata('bundleIds', r);
    // filter[identifier] onek eslesmesi yapabilir (.widget, .watchkitapp) -> tam eslesme
    const kayit = (r.j.data || []).find((b) => b.attributes.identifier === PAKET);
    if (!kayit) throw new Error('App ID bulunamadi: ' + PAKET);
    return kayit;
}

async function yetenekler(id) {
    const r = await api('GET', '/v1/bundleIds/' + id + '/bundleIdCapabilities');
    if (r.kod !== 200) hata('bundleIdCapabilities', r);
    return r.j.data || [];
}

function yaz(liste) {
    for (const y of liste) {
        const ayar = (y.attributes.settings || [])
            .map((s) => s.key + '=' + (s.options || []).filter((o) => o.enabled !== false).map((o) => o.key).join('|'))
            .join(', ');
        console.log('  - ' + y.attributes.capabilityType + (ayar ? '  [' + ayar + ']' : ''));
    }
}

async function main() {
    kimlikDenetle();
    const islem = process.argv[2] || 'durum';
    const paket = await paketKimligi();
    console.log('App ID: ' + PAKET + ' (' + paket.attributes.platform + ')');
    let liste = await yetenekler(paket.id);
    console.log('Yetenekler (' + liste.length + '):');
    yaz(liste);
    const icloud = liste.find((y) => y.attributes.capabilityType === 'ICLOUD');
    console.log('ICLOUD: ' + (icloud ? 'ACIK' : 'YOK'));
    if (islem === 'durum') return;
    if (islem !== 'ac') throw new Error('Bilinmeyen islem: ' + islem);
    if (icloud) {
        console.log('ICLOUD zaten acik; dokunulmadi.');
        return;
    }
    const r = await api('POST', '/v1/bundleIdCapabilities', {
        data: {
            type: 'bundleIdCapabilities',
            attributes: {
                capabilityType: 'ICLOUD',
                settings: [{ key: 'ICLOUD_VERSION', options: [{ key: 'XCODE_6', enabled: true }] }],
            },
            relationships: { bundleId: { data: { type: 'bundleIds', id: paket.id } } },
        },
    });
    if (r.kod !== 201) hata('ICLOUD ekleme', r);
    console.log('ICLOUD eklendi.');
    liste = await yetenekler(paket.id);
    console.log('Yetenekler (sonra, ' + liste.length + '):');
    yaz(liste);
}

main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
});
