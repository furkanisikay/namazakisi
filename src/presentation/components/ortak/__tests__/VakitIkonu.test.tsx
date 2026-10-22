/**
 * NÖBETÇİ: telefon vakit simgeleri Wear OS çizimleriyle (ic_vakit_*.xml) BİREBİR aynı aile.
 * Biri değişirse öteki de değişmeli (saat, telefon ve TV'de aynı vakit aynı simge).
 */
import * as fs from 'fs';
import * as path from 'path';
import { VAKIT_IKON_PARCALARI, vakitIkonKodu, type VakitIkonKodu } from '../VakitIkonu';

const KOK = path.resolve(__dirname, '../../../../..');

describe('VakitIkonu', () => {
    it.each(Object.keys(VAKIT_IKON_PARCALARI) as VakitIkonKodu[])('%s Wear çizimiyle aynı', (kod) => {
        const xml = fs.readFileSync(path.join(KOK, `wear/app/src/main/res/drawable/ic_vakit_${kod}.xml`), 'utf8');
        const wearYollari = [...xml.matchAll(/android:pathData="([^"]+)"/g)].map((m) => m[1]);
        expect(VAKIT_IKON_PARCALARI[kod].map((p) => p.d)).toEqual(wearYollari);
    });

    it('görünen ad ve VakitAdi aynı simgeye düşer; bilinmeyen yedeğe', () => {
        expect(vakitIkonKodu('Sabah')).toBe('imsak');
        expect(vakitIkonKodu('Cuma')).toBe('ogle');
        expect(vakitIkonKodu('İkindi')).toBe('ikindi');
        expect(vakitIkonKodu('yatsi')).toBe('yatsi');
        expect(vakitIkonKodu('Vakit')).toBeNull();
    });

    it('her vakit ayrı çizim (iki vakit aynı simgeyi paylaşmaz)', () => {
        const imzalar = Object.values(VAKIT_IKON_PARCALARI).map((p) => p.map((x) => x.d).join('|'));
        expect(new Set(imzalar).size).toBe(imzalar.length);
    });
});
