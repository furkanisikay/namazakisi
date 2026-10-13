/**
 * Muhafız gövde seçimi — telefon (Math.random) ile saat (kimlikten oran) AYNI
 * havuzlardan, AYNI kuralla seçer (issue #280).
 */
import { kimliktenOran, muhafizGovdesiSec } from '../muhafizGovdesi';
import { icerikMetniOlustur, uygunIcerikleriBul } from '../../data/SeytanlaMucadeleIcerigi';
import { GIRIS_ICERIK_HAVUZU, bildirimGovdesiOlustur } from '../../utils/muhafizMetinYardimcisi';

describe('muhafizGovdesiSec', () => {
    it('çıkış yönü: mücadele havuzundan, oranla indekslenir (eski Math.floor(r·n) kuralı)', () => {
        const havuz = uygunIcerikleriBul('yatsi', 3);
        expect(havuz.length).toBeGreaterThan(1);
        expect(muhafizGovdesiSec('yatsi', 3, 'cikisaDogru', () => 0)).toBe(icerikMetniOlustur(havuz[0]));
        expect(muhafizGovdesiSec('yatsi', 3, 'cikisaDogru', () => 0.9999)).toBe(
            icerikMetniOlustur(havuz[havuz.length - 1])
        );
    });

    it('giriş yönü: nötr havuz — mücadele havuzu KULLANILMAZ', () => {
        for (const r of [0, 0.5, 0.99]) {
            expect(GIRIS_ICERIK_HAVUZU[2]).toContain(muhafizGovdesiSec('ogle', 2, 'girisindenItibaren', () => r));
        }
    });

    it('varsayılan rastgelelik Math.random ve TEK çağrı (telefon davranışı değişmez)', () => {
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
        muhafizGovdesiSec('aksam', 4);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it('havuz boşsa yedek metin', () => {
        const bos = uygunIcerikleriBul('imsak', 1).length === 0;
        if (bos) expect(muhafizGovdesiSec('imsak', 1, 'cikisaDogru', () => 0)).toBe(bildirimGovdesiOlustur(1));
        else expect(muhafizGovdesiSec('imsak', 1, 'cikisaDogru', () => 0).length).toBeGreaterThan(0);
    });
});

describe('kimliktenOran', () => {
    it('[0,1) aralığında, kararlı ve kimliğe duyarlı', () => {
        const a = kimliktenOran('muhafiz_2026-10-12_vakit_ogle_seviye_3_dk_10');
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThan(1);
        expect(kimliktenOran('muhafiz_2026-10-12_vakit_ogle_seviye_3_dk_10')).toBe(a);
        expect(kimliktenOran('muhafiz_2026-10-12_vakit_ogle_seviye_3_dk_5')).not.toBe(a);
    });
});
