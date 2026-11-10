import { sesReferansiniKaldir } from '../sesReferanslari';
import { VARSAYILAN_SES } from '../../muhafiz/matrisTipleri';

const DOSYA = 'dosya:kullanici_ses_0123abcd.caf';
const BASKA = 'paket:zil';

describe('sesReferansiniKaldir', () => {
    it('HER derinlikteki referans varsayılana döner, görünen ad düşer; öteki sesler korunur', () => {
        const kayit = {
            matris: {
                imsak: { yon: 'cikisaDogru', seviyeler: [{ bildirimSesi: DOSYA, sesAdi: 'Ezan', esikDk: 30 }] },
                ogle: { seviyeler: [{ bildirimSesi: BASKA }, { bildirimSesi: DOSYA, sesAdi: 'Ezan' }] },
            },
            ozelMatrisYedegi: { yatsi: { seviyeler: [{ bildirimSesi: DOSYA, sesAdi: 'Ezan' }] } },
            adimlar: [{ bildirimSesi: 'content://media/1', sesAdi: 'Melodi' }],
        };
        const yeni = sesReferansiniKaldir(kayit, DOSYA);
        expect(yeni).toEqual({
            matris: {
                imsak: { yon: 'cikisaDogru', seviyeler: [{ bildirimSesi: VARSAYILAN_SES, esikDk: 30 }] },
                ogle: { seviyeler: [{ bildirimSesi: BASKA }, { bildirimSesi: VARSAYILAN_SES }] },
            },
            ozelMatrisYedegi: { yatsi: { seviyeler: [{ bildirimSesi: VARSAYILAN_SES }] } },
            adimlar: [{ bildirimSesi: 'content://media/1', sesAdi: 'Melodi' }],
        });
        // Değişmeyen dallar AYNI referans (gereksiz kopya yok).
        expect(yeni.adimlar).toBe(kayit.adimlar);
    });

    it('referans yoksa AYNI referans döner (disk yazılmaz)', () => {
        const kayit = { adimlar: [{ bildirimSesi: BASKA }], aktif: true };
        expect(sesReferansiniKaldir(kayit, DOSYA)).toBe(kayit);
        expect(sesReferansiniKaldir(null, DOSYA)).toBeNull();
        expect(sesReferansiniKaldir('metin', DOSYA)).toBe('metin');
    });

    it('vakit sesi kaydında girdi varsayılana iner (okuyucu onu kayıttan düşürür)', () => {
        const kayit = { imsak: { bildirimSesi: DOSYA, sesAdi: 'Ezan' }, ogle: { bildirimSesi: BASKA } };
        expect(sesReferansiniKaldir(kayit, DOSYA)).toEqual({
            imsak: { bildirimSesi: VARSAYILAN_SES },
            ogle: { bildirimSesi: BASKA },
        });
    });
});
