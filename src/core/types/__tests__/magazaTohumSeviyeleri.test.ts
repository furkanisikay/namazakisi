/**
 * Nobetci: magaza ekran goruntusu tohumu (scripts/magaza-tohum-verisi.js) seviye
 * tablosunun bir KOPYASINI tasir, cunku betik TS kaynagini yukleyemez.
 *
 * Kopya ayrisirsa tohum yanlis seviye yazar, uygulama acilista "Seviye Atladın!"
 * kutlamasi acar ve o modalin animasyonu Android'de `uiautomator dump`'i
 * dusurur: magaza kareleri sessizce bozulur.
 */
import { SEVIYE_TANIMLARI } from '../SeriTipleri';

const { SEVIYELER, tohumVerisi, bugunKilinanlar, gun } = require('../../../../scripts/magaza-tohum-verisi');

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

    it('bugun yalniz vakti CIKMIS namazlari isaretler; o anki vakit kilinmamis (Istanbul, 14 Ekim)', () => {
        // Istanbul 14.10.2026: gunes ~07:08, ogle ~12:55, ikindi ~15:59, aksam ~18:35 (yerel, UTC+3).
        expect(bugunKilinanlar(new Date('2026-10-14T01:00:00Z'))).toEqual({});
        expect(bugunKilinanlar(new Date('2026-10-14T07:00:00Z'))).toEqual({ Sabah: true });
        // 14:00 yerel: ogle SURUYOR → kilinmamis (telefon Kildim gostersin, saatle celismesin).
        expect(bugunKilinanlar(new Date('2026-10-14T11:00:00Z'))).toEqual({ Sabah: true });
        expect(bugunKilinanlar(new Date('2026-10-14T14:00:00Z'))).toEqual({ Sabah: true, 'Öğle': true });
        expect(bugunKilinanlar(new Date('2026-10-14T16:00:00Z'))).toEqual({
            Sabah: true,
            'Öğle': true,
            'İkindi': true,
        });
    });

    it('tohumun bugunku kaydi enjekte edilen ana gore kurulur', () => {
        const simdi = new Date();
        const depo = tohumVerisi(simdi);
        expect(JSON.parse(depo[`namaz_gun_${gun(0)}`])).toEqual(bugunKilinanlar(simdi));
    });
});
