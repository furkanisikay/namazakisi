import { kurulumOnarimiSec } from '../kurulumOnarimi';

const taban = { bildirimIzni: 'verildi', tamAlarm: 'verildi', hatirlatmaVar: true, ertelenenler: [] } as const;

describe('kurulumOnarimiSec', () => {
    it('her şey yolundaysa hiçbir şey göstermez', () => {
        expect(kurulumOnarimiSec(taban)).toBeNull();
    });

    it('NÖBETÇİ: bilinmeyen durum yanlış alarm üretmez', () => {
        expect(kurulumOnarimiSec({ ...taban, bildirimIzni: 'belirsiz', tamAlarm: 'belirsiz' })).toBeNull();
    });

    it('bildirim izni kapalıysa önce o söylenir', () => {
        expect(kurulumOnarimiSec({ ...taban, bildirimIzni: 'reddedildi', tamAlarm: 'reddedildi' })).toBe('bildirimIzni');
    });

    it('tam alarm yalnız bir hatırlatma açıkken sorundur', () => {
        expect(kurulumOnarimiSec({ ...taban, tamAlarm: 'reddedildi' })).toBe('tamAlarm');
        expect(kurulumOnarimiSec({ ...taban, tamAlarm: 'reddedildi', hatirlatmaVar: false })).toBeNull();
    });

    it('ertelenen tür bu oturumda gösterilmez, sıradaki gösterilir', () => {
        expect(
            kurulumOnarimiSec({ ...taban, bildirimIzni: 'reddedildi', tamAlarm: 'reddedildi', ertelenenler: ['bildirimIzni'] }),
        ).toBe('tamAlarm');
    });
});
