/**
 * Nöbetçi: Apple Watch mağaza karesi tohumu (`scripts/saat-tohum-yuku.js`) telefonun yük
 * sözleşmesini (`wearYukuGecerliMi`) karşılamalı — saat bozuk yükü SESSİZCE reddeder ve
 * kareler "Vakitler iPhone'unuzdan gelir" boş durumuyla çıkardı. Kıble ve uyandırma
 * kareleri (#285 cilası) için `konum` ve `uyandirma` da taşınır.
 */
import { wearYukuGecerliMi } from '../wearYuku';

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
});
