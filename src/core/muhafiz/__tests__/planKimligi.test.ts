/**
 * Muhafız PLAN kimliği — saf kurallar.
 *
 * İKİ TARAFLI KİLİT: `android/app/src/test/resources/muhafiz-plan-kimligi-ornekleri.json`
 * hem bu test hem Kotlin `MuhafizPlanKimligiTest` tarafından okunur.
 */
import fs from 'fs';
import path from 'path';
import { KAZA_SABITLERI } from '../../constants/UygulamaSabitleri';
import { gurubKerahatiBaslangiciMs } from '../../vakit/kerahat';
import { muhafizBildirimIdOlustur } from '../anonsKimligi';
import { eskiErteleEylemiMi, eskiErtelemeKimligiMi, kimliktenKalanDk, muhafizPlanKimligiMi } from '../planKimligi';

const ORNEK = path.join(__dirname, '../../../../android/app/src/test/resources/muhafiz-plan-kimligi-ornekleri.json');
const ornek = JSON.parse(fs.readFileSync(ORNEK, 'utf8'));

describe('ortak fikstür (Kotlin ikiziyle AYNI)', () => {
    it('kimlikler', () => {
        for (const k of ornek.kimlikler as Array<{ kimlik: string; planMi: boolean; kalanDk: number | null; eskiErtelemeMi: boolean }>) {
            expect([k.kimlik, muhafizPlanKimligiMi(k.kimlik)]).toEqual([k.kimlik, k.planMi]);
            expect([k.kimlik, kimliktenKalanDk(k.kimlik)]).toEqual([k.kimlik, k.kalanDk]);
            expect([k.kimlik, eskiErtelemeKimligiMi(k.kimlik)]).toEqual([k.kimlik, k.eskiErtelemeMi]);
        }
    });

    it('eski ertele eylemleri (yalnız yok sayılmak için tanınır)', () => {
        for (const e of ornek.eylemler as Array<{ eylem: string; eskiErteleMi: boolean }>) {
            expect([e.eylem, eskiErteleEylemiMi(e.eylem)]).toEqual([e.eylem, e.eskiErteleMi]);
        }
        expect(eskiErteleEylemiMi(null)).toBe(false);
        expect(eskiErteleEylemiMi(undefined)).toBe(false);
    });
});

describe('kimlik uzayı', () => {
    it('plan kimliği üreticisiyle uyumlu', () => {
        expect(muhafizPlanKimligiMi(muhafizBildirimIdOlustur('ikindi', 2, '2026-10-13', 25))).toBe(true);
        expect(kimliktenKalanDk(muhafizBildirimIdOlustur('ikindi', 2, '2026-10-13', 25))).toBe(25);
    });
});

describe('gurub kerahati (kaza ekranı ve takvim çakışmasıyla TEK kaynak)', () => {
    it('akşam girişi − MEKRUH_TOLERANS_DK', () => {
        const aksam = Date.UTC(2026, 9, 13, 15, 0);
        expect(gurubKerahatiBaslangiciMs(aksam)).toBe(aksam - KAZA_SABITLERI.MEKRUH_TOLERANS_DK * 60_000);
    });
});
