/**
 * Sırsız gölge: güvenli depo sessizce boşalınca (Keystore sıfırlanması) Cihazlarım boş liste
 * yerine "okunamadı" diyebilsin. Gölgede anahtar/adres YOK.
 */
const mockGuvenli = new Map<string, string>();
jest.mock('../GuvenliDepo', () => ({
    GuvenliDepo: {
        oku: async (k: string) => mockGuvenli.get(k) ?? null,
        yaz: async (k: string, v: string) => {
            mockGuvenli.set(k, v);
        },
        sil: async (k: string) => {
            mockGuvenli.delete(k);
        },
    },
}));
const mockDisk = new Map<string, unknown>();
jest.mock('../Depolama', () => ({
    Depolama: {
        oku: async (k: string) => mockDisk.get(k) ?? null,
        yaz: async (k: string, v: unknown) => {
            mockDisk.set(k, v);
        },
    },
}));

import { CihazAgiDeposu, type CihazUyeligi } from '../CihazAgiDeposu';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const uye = (kimlik: string, ad: string, tur: CihazUyeligi['tur'] = 'tv'): CihazUyeligi => ({
    tur,
    aliciKimlik: kimlik,
    aliciAdi: ad,
    uye: 'fedcba9876543210',
    anahtar: 'GIZLI-ANAHTAR',
    adres: '192.168.1.5',
    port: 47000,
    n: 0,
    durumumSayilsin: false,
    tvHatirlat: false,
    eklenmeMs: 1,
    sonEsitlemeMs: 0,
    durum: 'tamam',
});

beforeEach(() => {
    mockGuvenli.clear();
    mockDisk.clear();
});

describe('CihazAgiDeposu gölgesi', () => {
    it('eklenen üyelik gölgeye adıyla girer; anahtar ve adres girmez', async () => {
        await CihazAgiDeposu.kaydet(uye('0123456789abcdef', 'Salon TV'));
        const g = mockDisk.get(DEPOLAMA_ANAHTARLARI.CIHAZ_AGI_GOLGESI);
        expect(g).toEqual([{ kimlik: '0123456789abcdef', ad: 'Salon TV', tur: 'tv' }]);
        expect(JSON.stringify(g)).not.toMatch(/GIZLI|192\.168/);
        expect(await CihazAgiDeposu.kayiplar()).toEqual([]);
    });

    it('güvenli depo boşalınca kayıplar adıyla döner; unutunca susar', async () => {
        await CihazAgiDeposu.kaydet(uye('0123456789abcdef', 'Salon TV'));
        await CihazAgiDeposu.kaydet(uye('fedcba9876543210', 'Samsung tablet', 'tablet'));
        mockGuvenli.clear(); // Keystore sıfırlandı: secure-store kayıtları kendisi siler
        expect((await CihazAgiDeposu.kayiplar()).map((k) => k.ad).sort()).toEqual(['Salon TV', 'Samsung tablet']);
        await CihazAgiDeposu.kayiplariUnut();
        expect(await CihazAgiDeposu.kayiplar()).toEqual([]);
    });

    it('kullanıcının kaldırdığı üyelik kayıp sayılmaz', async () => {
        await CihazAgiDeposu.kaydet(uye('0123456789abcdef', 'Salon TV'));
        await CihazAgiDeposu.sil('0123456789abcdef');
        expect(await CihazAgiDeposu.kayiplar()).toEqual([]);
    });

    it('yeniden eşleştirme eski kayıpları bırakır', async () => {
        await CihazAgiDeposu.kaydet(uye('0123456789abcdef', 'Salon TV'));
        mockGuvenli.clear();
        await CihazAgiDeposu.kaydet(uye('1111111111111111', 'Yeni TV'));
        expect(await CihazAgiDeposu.kayiplar()).toEqual([]);
    });

    it('gölgesi olmayan eski kurulum ilk okumada gölgelenir (göç)', async () => {
        mockGuvenli.set('cihazAgi.liste', JSON.stringify(['0123456789abcdef']));
        mockGuvenli.set('cihazAgi.u.0123456789abcdef', JSON.stringify(uye('0123456789abcdef', 'Salon TV')));
        await CihazAgiDeposu.liste();
        expect(mockDisk.get(DEPOLAMA_ANAHTARLARI.CIHAZ_AGI_GOLGESI)).toEqual([{ kimlik: '0123456789abcdef', ad: 'Salon TV', tur: 'tv' }]);
    });
});
