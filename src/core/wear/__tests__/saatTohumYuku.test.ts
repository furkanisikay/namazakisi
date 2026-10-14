/**
 * Nobetci: saat ekran goruntusu tohumu (scripts/saat/saat-tohum-yuku.js).
 *
 * Betik TS kaynagini yukleyemedigi icin yuk seklini ve hesabi KOPYALAR. Ayrisirsa
 * zarar SESSIZDIR: Kotlin `YukCozucu` gecersiz yuku reddeder, saat "telefonunuzda
 * Namaz Akışı'nı açın" der ve hat yine "success" ile bos kareler uretir.
 */
import { wearYukuGecerliMi, WEAR_GUN_SAYISI, WEAR_KERAHAT_DK, WEAR_YUK_SURUMU } from '../wearYuku';
import { gunVakitleriniHesapla } from '../../nafile/gunVakitleri';

const { tohumYuku, tercihXml, istanbulGunu, KOORDINAT } = require('../../../../scripts/saat/saat-tohum-yuku');

// Istanbul 14.10.2026 (UTC+3): sabah ~05:43, ogle ~12:55, ikindi ~15:59, yatsi ~20:09.
const OGLEDEN_SONRA = Date.parse('2026-10-14T13:30:00Z'); // 16:30 → ikindi suruyor
const GECE_YARISINDAN_SONRA = Date.parse('2026-10-14T22:30:00Z'); // 15 Ekim 01:30 → yatsi (14) suruyor

describe('saat tohum yuku', () => {
    it('telefonun sozlesmesini gecer (Kotlin YukCozucu ile ayni dogrulayici)', () => {
        const yuk = tohumYuku(OGLEDEN_SONRA);
        expect(wearYukuGecerliMi(yuk)).toBe(true);
        expect(yuk.surum).toBe(WEAR_YUK_SURUMU);
        expect(yuk.gunler).toHaveLength(WEAR_GUN_SAYISI);
        expect(yuk.kerahatDk).toEqual(WEAR_KERAHAT_DK);
    });

    it('vakitler telefonun hesabiyla birebir (her gun)', () => {
        const yuk = tohumYuku(OGLEDEN_SONRA);
        for (const gun of yuk.gunler) {
            const v = gunVakitleriniHesapla(KOORDINAT, gun.tarih);
            expect(gun.vakitler).toEqual({
                imsak: v.imsak.getTime(),
                gunes: v.gunes.getTime(),
                ogle: v.ogle.getTime(),
                ikindi: v.ikindi.getTime(),
                aksam: v.aksam.getTime(),
                yatsi: v.yatsi.getTime(),
            });
        }
    });

    it('gunduz: dun tam, bugun su anki vakit HARIC girmis vakitler kilinmis', () => {
        const yuk = tohumYuku(OGLEDEN_SONRA);
        expect(yuk.gunler[0].tarih).toBe('2026-10-13');
        expect(yuk.gunler[1].tarih).toBe('2026-10-14');
        expect(yuk.gunler[0].kilinan).toEqual(['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi']);
        expect(yuk.gunler[1].kilinan).toEqual(['imsak', 'ogle']);
    });

    it('gece yarisindan sonra aktif gun DUN (yatsi suruyor, kilinmamis)', () => {
        const yuk = tohumYuku(GECE_YARISINDAN_SONRA);
        expect(istanbulGunu(GECE_YARISINDAN_SONRA)).toBe('2026-10-15');
        expect(yuk.gunler[0].tarih).toBe('2026-10-14');
        expect(yuk.gunler[0].kilinan).toEqual(['imsak', 'ogle', 'ikindi', 'aksam']);
        expect(yuk.gunler[1].kilinan).toEqual([]);
    });

    it('tercih dosyasi yuku kacirilmis ve geri cozulebilir tasir', () => {
        const yuk = tohumYuku(OGLEDEN_SONRA);
        const xml: string = tercihXml(yuk);
        const m = xml.match(/<string name="yuk">([^<]*)<\/string>/);
        expect(m).not.toBeNull();
        const cozulmus = m![1]
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        expect(JSON.parse(cozulmus)).toEqual(yuk);
    });
});
