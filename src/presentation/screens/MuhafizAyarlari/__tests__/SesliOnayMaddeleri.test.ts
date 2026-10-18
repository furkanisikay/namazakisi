jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({}) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
// Native köprü grafiği (AGENTS: requireNativeModule tuzağı) — maddeler saf, köprüye gerek yok.
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({}));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({}));
jest.mock('../../../../domain/services/AnonsOnizlemeServisi', () => ({ adimiOnizle: jest.fn() }));

import { sesliOnayMaddeleri } from '../SesliOnayModal';

const metin = (p: string) => sesliOnayMaddeleri(p).map((m) => m.metin).join(' ');

describe('sesliOnayMaddeleri — platforma göre doğru bilgi', () => {
    it("iPhone'da anons bildirim sesidir: sessiz anahtarı açıkken duyulmaz", () => {
        expect(metin('ios')).toContain('sessiz anahtarı açıkken duyulmaz');
        expect(metin('ios')).not.toContain('Rahatsız Etmeyin modundayken de duyulur');
    });
    it("Android'de alarm gibi davranır", () => {
        expect(metin('android')).toContain('Rahatsız Etmeyin modundayken de duyulur');
    });
    it('ikon anahtarları tekil', () => {
        for (const p of ['ios', 'android']) {
            const m = sesliOnayMaddeleri(p);
            expect(new Set(m.map((x) => x.ikon)).size).toBe(m.length);
        }
    });
});
