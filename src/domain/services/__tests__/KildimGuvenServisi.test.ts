/**
 * KildimGuvenServisi (issue #299) — köprü yoksa/hata verirse GÜVENLİ varsayılan:
 * kimliksiz soru (sessiz işaretleme asla), boş liste, yazım yok.
 */
import { NativeModules, Platform } from 'react-native';
import { KildimGuvenServisi } from '../KildimGuvenServisi';
import { BILINMEYEN_BASLATAN } from '../../../core/kildim/kildimGuven';

const modul = {
    listeAl: jest.fn(),
    kararDegistir: jest.fn(),
    kaldir: jest.fn(),
    derinBaglantiKarari: jest.fn(),
    soruyuYanitla: jest.fn(),
};

describe('KildimGuvenServisi', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        delete (NativeModules as Record<string, unknown>).KildimGuven;
    });

    describe('iOS / köprü yok', () => {
        it('kullanılamaz; kimliksiz soru ve boş liste döner', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            (NativeModules as Record<string, unknown>).KildimGuven = modul;
            expect(KildimGuvenServisi.kullanilabilirMi()).toBe(false);
            expect(await KildimGuvenServisi.derinBaglantiKarari()).toEqual(BILINMEYEN_BASLATAN);
            expect(await KildimGuvenServisi.listeAl()).toEqual([]);
            expect(await KildimGuvenServisi.soruyuYanitla('a.b.c', 'izin')).toBe(false);
            expect(modul.derinBaglantiKarari).not.toHaveBeenCalled();
        });
    });

    describe('Android', () => {
        beforeEach(() => {
            jest.replaceProperty(Platform, 'OS', 'android');
            (NativeModules as Record<string, unknown>).KildimGuven = modul;
            Object.values(modul).forEach((f) => f.mockReset());
        });

        it('karar köprüden çözülür', async () => {
            modul.derinBaglantiKarari.mockResolvedValue(
                JSON.stringify({ eylem: 'dogrudan', paket: 'com.sec.android.app.launcher', ad: 'One UI Home', herZaman: false, engel: false })
            );
            expect((await KildimGuvenServisi.derinBaglantiKarari()).eylem).toBe('dogrudan');
        });

        it('köprü hata verirse kimliksiz soruya düşer', async () => {
            modul.derinBaglantiKarari.mockRejectedValue(new Error('x'));
            expect(await KildimGuvenServisi.derinBaglantiKarari()).toEqual(BILINMEYEN_BASLATAN);
        });

        it('liste ve yazım yolları', async () => {
            modul.listeAl.mockResolvedValue(JSON.stringify([{ paket: 'a.b.c', karar: 'izin', ad: 'A', zamanMs: 1 }]));
            modul.kararDegistir.mockResolvedValue(true);
            modul.kaldir.mockResolvedValue(null);
            modul.soruyuYanitla.mockResolvedValue(true);
            expect(await KildimGuvenServisi.listeAl()).toHaveLength(1);
            expect(await KildimGuvenServisi.kararDegistir('a.b.c', 'engel')).toBe(true);
            expect(modul.kararDegistir).toHaveBeenCalledWith('a.b.c', 'engel');
            expect(await KildimGuvenServisi.kaldir('a.b.c')).toBe(true);
            expect(await KildimGuvenServisi.soruyuYanitla('a.b.c', 'izin')).toBe(true);
        });

        it('yazım hatası false döner, fırlatmaz', async () => {
            modul.kararDegistir.mockRejectedValue(new Error('x'));
            modul.kaldir.mockRejectedValue(new Error('x'));
            expect(await KildimGuvenServisi.kararDegistir('a.b.c', 'izin')).toBe(false);
            expect(await KildimGuvenServisi.kaldir('a.b.c')).toBe(false);
        });
    });
});
