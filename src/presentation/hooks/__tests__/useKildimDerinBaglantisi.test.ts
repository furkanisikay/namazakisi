/**
 * `namazakisi://kildim` geri bildirim metni (issue #276) — arayüz dili kibar "siz",
 * saate hal eki EKLENMEZ.
 */
jest.mock('../../../domain/services/KildimKuyruguServisi', () => ({
    KildimKuyruguServisi: { getInstance: jest.fn() },
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

import { kildimSonucMetni } from '../useKildimDerinBaglantisi';

describe('kildimSonucMetni', () => {
    it('işaretlendi', () => {
        expect(kildimSonucMetni({ tur: 'isaretlendi', vakitAdi: 'Öğle' })).toBe('Öğle namazınız kılındı olarak işaretlendi.');
    });

    it('zaten kılınmış', () => {
        expect(kildimSonucMetni({ tur: 'zatenKilindi', vakitAdi: 'Akşam' })).toBe('Akşam namazı zaten kılındı olarak işaretli.');
    });

    it('vakit yok: sıradaki vakit ve girişi, hal eki olmadan', () => {
        const giris = new Date(2026, 5, 21, 13, 11).getTime();
        const metin = kildimSonucMetni({ tur: 'vakitYok', siradakiAdi: 'Öğle', girisMs: giris });
        expect(metin).toBe('Şu an kılınacak vakit yok. Sıradaki Öğle, giriş 13:11.');
        expect(metin).not.toMatch(/\d'de/);
    });

    it('konum yok: yön gösterir', () => {
        expect(kildimSonucMetni({ tur: 'konumYok' })).toMatch(/konumunuzu ayarlayın/);
    });

    it('"sen" dili kullanılmaz', () => {
        const hepsi = [
            kildimSonucMetni({ tur: 'isaretlendi', vakitAdi: 'Yatsı' }),
            kildimSonucMetni({ tur: 'vakitYok', siradakiAdi: null, girisMs: null }),
            kildimSonucMetni({ tur: 'konumYok' }),
        ].join(' ');
        expect(hepsi).not.toMatch(/\b(sen|senin|ayarla|aç)\b/i);
    });
});
