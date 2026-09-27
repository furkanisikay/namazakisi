/**
 * Nobetci: magaza ekran goruntusu tohumu (scripts/magaza-tohum-verisi.js) seviye
 * tablosunun bir KOPYASINI tasir, cunku betik TS kaynagini yukleyemez.
 *
 * Kopya ayrisirsa tohum yanlis seviye yazar, uygulama acilista "Seviye Atladın!"
 * kutlamasi acar ve o modalin animasyonu Android'de `uiautomator dump`'i
 * dusurur: magaza kareleri sessizce bozulur.
 */
import { SEVIYE_TANIMLARI } from '../SeriTipleri';

const { SEVIYELER, tohumVerisi } = require('../../../../scripts/magaza-tohum-verisi');

describe('magaza tohumu seviye tablosu', () => {
    it('SEVIYE_TANIMLARI ile birebir aynidir', () => {
        expect(SEVIYELER).toEqual(SEVIYE_TANIMLARI);
    });

    it('tohumlanan seviye puanla tutarlidir', () => {
        const seviye = JSON.parse(tohumVerisi().seviye_durumu);
        const tanim = SEVIYE_TANIMLARI.find((t) => t.seviye === seviye.mevcutSeviye);
        expect(tanim).toBeDefined();
        expect(seviye.toplamPuan).toBeGreaterThanOrEqual(tanim!.minPuan);
        expect(seviye.rank).toBe(tanim!.rank);
    });
});
