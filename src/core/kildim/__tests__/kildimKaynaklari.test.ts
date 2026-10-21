import { readFileSync } from 'fs';
import { join } from 'path';
import { KILDIM_KAYNAKLARI, KILDIM_KAYNAGI_CIHAZ } from '../kildimKaynaklari';

describe('Kıldım kuyruğu kaynakları (JS ↔ Kotlin ↔ Swift ikizi)', () => {
    const fikstur = JSON.parse(readFileSync(join(__dirname, '../../../../android/app/src/test/resources/kildim-kaynaklari.json'), 'utf8')) as { kaynaklar: string[] };

    it('liste ortak fikstürle birebir aynı', () => {
        expect([...KILDIM_KAYNAKLARI].sort()).toEqual([...fikstur.kaynaklar].sort());
    });

    it('cihaz kaynağı Kotlin sabitiyle ve Swift sabitiyle aynı', () => {
        const kt = readFileSync(join(__dirname, '../../../../android/app/src/main/java/com/furkanisikay/namazakisi/cekirdek/KildimKuyruguKurallari.kt'), 'utf8');
        const sw = readFileSync(join(__dirname, '../../../../modules/expo-siri-kisayollari/ios/SiriDeposu.swift'), 'utf8');
        expect(kt).toContain(`KAYNAK_CIHAZ = "${KILDIM_KAYNAGI_CIHAZ}"`);
        expect(sw).toContain(`cihazKaynagi = "${KILDIM_KAYNAGI_CIHAZ}"`);
    });
});
