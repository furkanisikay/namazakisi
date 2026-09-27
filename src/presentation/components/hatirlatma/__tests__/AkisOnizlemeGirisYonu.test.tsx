/**
 * NOBETCI — "Akisi onizle" GIRIS yonunde BOS gelmemeli (yasanmis bug).
 *
 * `vakitUyariPlaniOlustur`'un ikinci argumani "cagiranin SU ANKI olcusu"dur ve
 * tarama oradan cikisa dogru AZALIR, girise dogru ARTAR. Onizleme tum pencereyi
 * gormek icin cikista buyuk bir sayi (`ONIZLEME_TARAMA_SINIRI_DK` = 1440) veriyordu;
 * ayni sayi giriste `baslangic = max(1440, 1)` yapip `bitis = pencere - 1`'i ASIYOR
 * ve dongu HIC calismiyordu → kullaniciya "tum adimlar kapali" gosteriliyordu.
 *
 * Bunun bedeli yalniz bos bir liste degildi: kullanici giris yonundeki TERS
 * ESKALASYONU onizlemede hic goremedi, hata bu yuzden sahada uzun sure yasadi.
 */
import { vakitUyariPlaniOlustur } from '../../../../core/muhafiz/motorAdaptoru';
import { SEVIYE_KADEMELERI } from '../../../../core/muhafiz/matrisTipleri';
import type { VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';
import { GIRIS_ZAMANLAMA_TABLOSU } from '../../../../core/muhafiz/girisZamanlamasi';
import { ONIZLEME_GIRIS_BASLANGIC_DK, ONIZLEME_TARAMA_SINIRI_DK } from '../pencereTanimi';

const YATSI_PENCERESI_DK = 525;

const girisAyari = (): VakitMuhafizAyari => ({
    yon: 'girisindenItibaren',
    seviyeler: SEVIYE_KADEMELERI.map((kademe) => ({
        kademe,
        kanallar: { bildirim: true },
        esikDk: GIRIS_ZAMANLAMA_TABLOSU.uzun.normal[kademe].esikDk,
        siklik: GIRIS_ZAMANLAMA_TABLOSU.uzun.normal[kademe].siklik,
        bildirimSesi: 'varsayilan',
        anonsMetni: '',
    })),
});

describe('AkisOnizleme — giris yonu tarama baslangici', () => {
    it('GIRIS baslangici ile plan DOLU gelir', () => {
        const plan = vakitUyariPlaniOlustur(girisAyari(), ONIZLEME_GIRIS_BASLANGIC_DK, {
            pencereUzunluguDk: YATSI_PENCERESI_DK,
        });

        expect(plan.length).toBeGreaterThan(0);
    });

    it('REGRESYON: cikis sabiti giriste plani BOSALTIR (bu yuzden yone gore secilir)', () => {
        const plan = vakitUyariPlaniOlustur(girisAyari(), ONIZLEME_TARAMA_SINIRI_DK, {
            pencereUzunluguDk: YATSI_PENCERESI_DK,
        });

        expect(plan).toHaveLength(0);
    });

    it('onizlemedeki adimlar ARTAN tonda ilerler (nazik → acil)', () => {
        const seviyeler = vakitUyariPlaniOlustur(girisAyari(), ONIZLEME_GIRIS_BASLANGIC_DK, {
            pencereUzunluguDk: YATSI_PENCERESI_DK,
        }).map((p) => p.seviye);

        expect(seviyeler[0]).toBe(1);
        expect(seviyeler[seviyeler.length - 1]).toBe(4);
        expect([...seviyeler].sort((a, b) => a - b)).toEqual(seviyeler);
    });
});
