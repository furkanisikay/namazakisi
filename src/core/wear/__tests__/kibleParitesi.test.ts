/**
 * Kıble paritesi (saat yenileme W2): saatin `cekirdek/Kible.kt`'si telefonun
 * `adhan` `Qibla` hesabının İKİZİDİR. Kotlin `KibleTest` aynı fikstürü
 * (`wear/app/src/test/resources/kible-ornekleri.json`) kendi formülüyle doğrular;
 * bu test fikstürü telefonun yolundan YENİDEN hesaplar → telefon formülü değişirse
 * iki taraf birlikte kırılır (`TvVakitParitesi` deseni).
 */
import * as fs from 'fs';
import * as path from 'path';
import { Coordinates, Qibla } from 'adhan';

const FIKSTUR = path.join(__dirname, '../../../../wear/app/src/test/resources/kible-ornekleri.json');
const { NOKTALAR } = require('../../../../scripts/saat/kible-fikstur-uret');

interface Ornek {
    ad: string;
    lat: number;
    lng: number;
    aci: number;
    dejenere?: boolean;
}

const ornekler: Ornek[] = JSON.parse(fs.readFileSync(FIKSTUR, 'utf8'));

describe('kıble fikstürü (saat ↔ telefon)', () => {
    it('fikstür üreticinin nokta listesiyle güncel', () => {
        expect(ornekler.map(({ aci: _aci, ...n }) => n)).toEqual(NOKTALAR);
    });

    it.each(ornekler.filter((o) => !o.dejenere))('$ad: telefonun açısıyla birebir', (o) => {
        expect(Qibla(new Coordinates(o.lat, o.lng))).toBe(o.aci);
    });

    it('her açı sonlu ve [0, 360) aralığında (Kâbe dahil)', () => {
        for (const o of ornekler) {
            expect(Number.isFinite(o.aci)).toBe(true);
            expect(o.aci).toBeGreaterThanOrEqual(0);
            expect(o.aci).toBeLessThan(360);
        }
    });

    it('bilinen yönler: Türkiye güneydoğu/güney, Cakarta batı-kuzeybatı', () => {
        const aci = (ad: string) => ornekler.find((o) => o.ad === ad)!.aci;
        expect(Math.round(aci('İstanbul'))).toBe(152);
        expect(aci('Cakarta')).toBeGreaterThan(290);
        expect(aci('Cakarta')).toBeLessThan(300);
    });
});
