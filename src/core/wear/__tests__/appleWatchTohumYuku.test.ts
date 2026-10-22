/**
 * Nöbetçi: Apple Watch mağaza karesi tohumu (`scripts/saat-tohum-yuku.js`) telefonun yük
 * sözleşmesini (`wearYukuGecerliMi`) karşılamalı — saat bozuk yükü SESSİZCE reddeder ve
 * kareler "Vakitler iPhone'unuzdan gelir" boş durumuyla çıkardı. Kıble ve uyandırma
 * kareleri (#285 cilası) için `konum` ve `uyandirma` da taşınır.
 */
import { wearYukuGecerliMi } from '../wearYuku';

const { uret } = require('../../../../scripts/saat-tohum-yuku');

describe('Apple Watch kare tohumu', () => {
    // 2026-10-20 10:00 UTC — sabit an (deterministik).
    const t = uret(Date.UTC(2026, 9, 20, 10, 0, 0));
    const yuk = JSON.parse(t.yuk);

    it('telefonun yük sözleşmesini karşılar', () => {
        expect(wearYukuGecerliMi(yuk)).toBe(true);
    });

    it('kıble için yuvarlanmış konum ve uyandırma karesi için bir sabah uyandırması taşır', () => {
        expect(yuk.konum).toEqual({ lat: 41, lng: 29 });
        expect(yuk.uyandirma).toHaveLength(1);
        expect(yuk.uyandirma[0].id).toMatch(/^muhafiz_\d{4}-\d{2}-\d{2}_vakit_imsak_seviye_2_dk_34$/);
        expect(yuk.uyandirma[0].sonMs).toBeGreaterThan(yuk.uyandirma[0].ms);
    });

    it('--hedef simdi: dilim kaydirilmaz, gece yarisindan sonra DUNUN yatsisi kilinmamis kalir', () => {
        // 2026-10-22 22:30 UTC = 23 Ekim 01:30 Istanbul (imsaktan once → aktif = dunun yatsisi).
        const g = uret(Date.UTC(2026, 9, 22, 22, 30, 0), { hedef: 'simdi' });
        const y = JSON.parse(g.yuk);
        expect(wearYukuGecerliMi(y)).toBe(true);
        expect(g.tz).toBe('Etc/GMT-3');
        expect(g.aktifVakit).toBe('yatsi');
        const dun = y.gunler.find((x: { tarih: string }) => x.tarih === '2026-10-22');
        expect(dun.kilinan).toEqual(['imsak', 'ogle', 'ikindi', 'aksam']);
    });

    it('--hedef simdi gunes vaktindeyse ogle hilesine duser', () => {
        // 2026-10-20 06:00 UTC = 09:00 Istanbul (gunes → ogle arasi, kilinamaz).
        const g = uret(Date.UTC(2026, 9, 20, 6, 0, 0), { hedef: 'simdi' });
        expect(g.aktifVakit).toBe('ogle');
        expect(g.tz).not.toBe('Etc/GMT-3');
    });
});
