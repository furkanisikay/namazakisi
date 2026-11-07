import {
    VAKIT_BILDIRIM_TABAN_KANAL,
    benzersizVakitSesleri,
    cozulemeyenVakitSesleriniDusur,
    vakitBildirimKanalId,
    vakitKanalAdi,
    vakitSesGorunenAdi,
    vakitSesiniAyarla,
    vakitSesleriniNormalize,
    vakitIosSesi,
} from '../vakitBildirimSesi';
import { sesHashi } from '../../muhafiz/sesKimligi';

const A = 'content://media/external/audio/media/1';
const B = 'content://media/external_primary/audio/media/2';

describe('vakitBildirimSesi', () => {
    it('NÖBETÇİ: ses seçilmemiş vakit bugünkü TABAN kanalda kalır (mevcut kullanıcı birebir)', () => {
        expect(vakitBildirimKanalId(undefined)).toBe('vakit_bildirim');
        expect(vakitBildirimKanalId('varsayilan')).toBe(VAKIT_BILDIRIM_TABAN_KANAL);
        expect(vakitBildirimKanalId('')).toBe('vakit_bildirim');
    });

    it('kanal id sesin fonksiyonu; muhafız uzayıyla çakışmaz', () => {
        expect(vakitBildirimKanalId(A)).toBe(`vakit_bildirim_${sesHashi(A)}`);
        expect(vakitBildirimKanalId(A)).not.toBe(vakitBildirimKanalId(B));
        expect(vakitBildirimKanalId(A).startsWith('muhafiz')).toBe(false);
    });

    it('normalize: bozuk girdi, varsayılan ses ve bilinmeyen vakit düşer', () => {
        expect(vakitSesleriniNormalize(null)).toEqual({});
        expect(vakitSesleriniNormalize([1])).toEqual({});
        expect(
            vakitSesleriniNormalize({
                imsak: { bildirimSesi: ` ${A} `, sesAdi: ' Ezan ' },
                ogle: { bildirimSesi: 'varsayilan' },
                ikindi: 'x',
                gunes: { bildirimSesi: B },
            })
        ).toEqual({ imsak: { bildirimSesi: A, sesAdi: 'Ezan' } });
    });

    it('görünen ad ham URI göstermez', () => {
        expect(vakitSesGorunenAdi(undefined)).toBe('Telefonun bildirim sesi');
        expect(vakitSesGorunenAdi({ bildirimSesi: A })).toBe('Seçtiğiniz ses');
        expect(vakitKanalAdi({ bildirimSesi: A, sesAdi: 'Ezan' })).toBe('Vakit Bildirimleri · Ezan');
    });

    it('ayarla / düşür / benzersiz', () => {
        const k = vakitSesiniAyarla({}, 'imsak', { bildirimSesi: A, sesAdi: 'Ezan' });
        const k2 = vakitSesiniAyarla(k, 'yatsi', { bildirimSesi: A });
        expect(benzersizVakitSesleri(k2)).toHaveLength(1);
        expect(vakitSesiniAyarla(k2, 'imsak', null)).toEqual({ yatsi: { bildirimSesi: A } });
        expect(cozulemeyenVakitSesleriniDusur(k2, new Set())).toBe(k2);
        expect(cozulemeyenVakitSesleriniDusur(k2, new Set([A]))).toEqual({});
    });
});

describe('vakitBildirimSesi — iPhone (paket:/dosya:)', () => {
    const PAKET = 'paket:sabah';
    const DOSYA = 'dosya:kullanici_ses_0123abcd.caf';

    it('NÖBETÇİ: iPhone sesi Android kanalına GİRMEZ (taban kanal) ve Android doğrulamasına sokulmaz', () => {
        expect(vakitBildirimKanalId(PAKET)).toBe(VAKIT_BILDIRIM_TABAN_KANAL);
        expect(vakitBildirimKanalId(DOSYA)).toBe(VAKIT_BILDIRIM_TABAN_KANAL);
        expect(benzersizVakitSesleri({ imsak: { bildirimSesi: PAKET }, ogle: { bildirimSesi: A } })).toEqual([
            { bildirimSesi: A },
        ]);
    });

    it('kayıt iPhone seçimini SAKLAR (normalize + ayarla); bozuk kimlik düşer', () => {
        expect(
            vakitSesleriniNormalize({
                imsak: { bildirimSesi: PAKET },
                ogle: { bildirimSesi: DOSYA, sesAdi: 'Ezan' },
                aksam: { bildirimSesi: 'dosya:../x.caf' },
            })
        ).toEqual({ imsak: { bildirimSesi: PAKET }, ogle: { bildirimSesi: DOSYA, sesAdi: 'Ezan' } });
        expect(vakitSesiniAyarla({}, 'yatsi', { bildirimSesi: PAKET })).toEqual({ yatsi: { bildirimSesi: PAKET } });
    });

    it('görünen ad (iPhone): paket sözlükten, dosya kullanıcının adı; silinmiş dosya telefonun sesi', () => {
        const { sesPlatformunuAyarla, eklenmisSesleriAyarla } = require('../../muhafiz/sesKimligi');
        sesPlatformunuAyarla('ios');
        try {
            expect(vakitSesGorunenAdi({ bildirimSesi: PAKET })).toBe('Sabah');
            expect(vakitSesGorunenAdi({ bildirimSesi: DOSYA, sesAdi: 'Ezan' })).toBe('Ezan');
            eklenmisSesleriAyarla([]);
            expect(vakitSesGorunenAdi({ bildirimSesi: DOSYA, sesAdi: 'Ezan' })).toBe('Telefonun bildirim sesi');
        } finally {
            sesPlatformunuAyarla('android');
            eklenmisSesleriAyarla(null);
        }
    });

    it('vakitIosSesi: bildirimin ses dosyası; seçilmemiş/Android sesi null (sound: true kalır)', () => {
        expect(vakitIosSesi({ bildirimSesi: PAKET })).toBe('sabah_ios.wav');
        expect(vakitIosSesi({ bildirimSesi: DOSYA })).toBe('kullanici_ses_0123abcd.caf');
        expect(vakitIosSesi({ bildirimSesi: A })).toBeNull();
        expect(vakitIosSesi(undefined)).toBeNull();
    });
});
