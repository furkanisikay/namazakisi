/**
 * Eşitleme durum/hata cümleleri (tek kaynak `useEsitleme`) ve parola kuralı etkin dilde
 * çıkar (dil çıkarımı nöbetçisi). Türkçe cümleler değişmeden kalır.
 */
jest.mock('../../../domain/services/EsitlemeServisi', () => ({ EsitlemeServisi: { getInstance: jest.fn() } }));
jest.mock('../../../domain/services/esitlemeSaglayicilari', () => ({ kullanilabilirSaglayicilar: () => [] }));
jest.mock('../../store/yedeklemeSlice', () => ({ iceAktarmayiUygula: jest.fn() }));
jest.mock('../../store/hooks', () => ({ useAppDispatch: jest.fn() }));

import { esitlemeBeklemeMetni, esitlemeHataMetni } from '../useEsitleme';
import { parolaSorunu } from '../../../core/esitleme/anahtarTuretme';
import { aktifDiliKur, aktifDilSifirla } from '../../../core/dil/aktifDil';

const TR = /[çğıöşüÇĞİÖŞÜ]/;
const NEDENLER = ['wifi', 'sarj', 'gucTasarrufu', 'veriTasarrufu', 'agYok', 'elle', 'siklik'] as const;
const KODLAR = ['agYok', 'yetkiYok', 'yapilandirilmamis', 'parolaGerekli', 'parolaYanlis', 'bozukVeri', 'surumYeni', 'boyutAsimi', 'bilinmiyor'] as const;

it('Türkçe cümleler aynı kalır', () => {
    expect(esitlemeBeklemeMetni('wifi')).toBe('Otomatik eşitleme Wi-Fi bağlantısını bekliyor.');
    expect(esitlemeHataMetni('parolaYanlis')).toBe(
        'Eşitleme parolanız başka bir cihazda değiştirilmiş görünüyor. Yeni parolayı girerek sürdürebilirsiniz.',
    );
    expect(parolaSorunu('kisa')).toBe('Parolanız en az 10 karakter olmalı.');
});

describe('İngilizce', () => {
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('bekleme ve hata cümleleri, parola kuralı İngilizce', () => {
        for (const n of NEDENLER) expect(esitlemeBeklemeMetni(n as never)).not.toMatch(TR);
        for (const k of KODLAR) expect(esitlemeHataMetni(k as never)).not.toMatch(TR);
        expect(esitlemeBeklemeMetni('wifi')).toBe('Automatic sync is waiting for a Wi-Fi connection.');
        expect(parolaSorunu('short')).toBe('Your password must be at least 10 characters.');
    });
});
