/**
 * `namazakisi://kildim` geri bildirim metni (issue #276) — arayüz dili kibar "siz",
 * saate hal eki EKLENMEZ.
 */
const mockDegerlendir = jest.fn();
const mockAdayiIsaretle = jest.fn();
jest.mock('../../../domain/services/KildimKuyruguServisi', () => ({
    KildimKuyruguServisi: {
        getInstance: () => ({ simdikiVaktiDegerlendir: mockDegerlendir, adayiIsaretle: mockAdayiIsaretle }),
    },
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

import { Linking } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import { kildimOnayBasligi, kildimSonucMetni, useKildimDerinBaglantisi } from '../useKildimDerinBaglantisi';

const ADAY = { tur: 'aday' as const, vakitAdi: 'Öğle', kayitVakti: 'ogle', tarih: '2026-10-13' };

describe('useKildimDerinBaglantisi — dışarıdan gelen bağlantı SESSİZCE işaretlemez', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('namazakisi://kildim');
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never);
        mockDegerlendir.mockResolvedValue(ADAY);
        mockAdayiIsaretle.mockResolvedValue({ tur: 'isaretlendi', vakitAdi: 'Öğle' });
    });

    it('bağlantı gelince yalnız onay penceresi açılır; işaretleme onaydan sonra', async () => {
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.onayAdayi).toEqual(ADAY));
        expect(mockAdayiIsaretle).not.toHaveBeenCalled();

        act(() => result.current.onayla());
        await waitFor(() => expect(mockAdayiIsaretle).toHaveBeenCalledWith(ADAY));
        expect(result.current.onayAdayi).toBeNull();
        await waitFor(() => expect(kisaBildirimGoster).toHaveBeenCalledWith('Öğle namazınız kılındı olarak işaretlendi.'));
    });

    it('vazgeçilirse hiçbir şey yazılmaz', async () => {
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.onayAdayi).not.toBeNull());
        act(() => result.current.vazgec());
        expect(result.current.onayAdayi).toBeNull();
        expect(mockAdayiIsaretle).not.toHaveBeenCalled();
    });

    it('işaretlenecek bir şey yoksa onay açılmaz, yalnız bilgi verilir', async () => {
        mockDegerlendir.mockResolvedValue({ tur: 'zatenKilindi', vakitAdi: 'Akşam' });
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(kisaBildirimGoster).toHaveBeenCalledWith('Akşam namazı zaten kılındı olarak işaretli.'));
        expect(result.current.onayAdayi).toBeNull();
    });

    it('sihirbaz sürerken (etkin=false) bağlantı yok sayılır', async () => {
        renderHook(() => useKildimDerinBaglantisi(false));
        await act(async () => { await Promise.resolve(); });
        expect(mockDegerlendir).not.toHaveBeenCalled();
    });

    it('onay başlığı kibar ve vakit adını taşır', () => {
        expect(kildimOnayBasligi(ADAY)).toBe('Öğle namazı kılındı olarak işaretlensin mi?');
    });
});

describe('kildimSonucMetni', () => {
    it('işaretlendi', () => {
        expect(kildimSonucMetni({ tur: 'isaretlendi', vakitAdi: 'Öğle' })).toBe('Öğle namazınız kılındı olarak işaretlendi.');
    });

    it('zaten kılınmış', () => {
        expect(kildimSonucMetni({ tur: 'zatenKilindi', vakitAdi: 'Akşam' })).toBe('Akşam namazı zaten kılındı olarak işaretli.');
    });

    it('vakit yok: sıradaki vakit ve girişi, hal eki olmadan', () => {
        const giris = new Date(2026, 5, 21, 13, 11).getTime();
        const metin = kildimSonucMetni({ tur: 'vakitYok', siradakiAdi: 'Öğle', girisMs: giris });
        expect(metin).toBe('Şu an kılınacak vakit yok. Sıradaki Öğle, giriş 13:11.');
        expect(metin).not.toMatch(/\d'de/);
    });

    it('konum yok: yön gösterir', () => {
        expect(kildimSonucMetni({ tur: 'konumYok' })).toMatch(/konumunuzu ayarlayın/);
    });

    it('"sen" dili kullanılmaz', () => {
        const hepsi = [
            kildimSonucMetni({ tur: 'isaretlendi', vakitAdi: 'Yatsı' }),
            kildimSonucMetni({ tur: 'vakitYok', siradakiAdi: null, girisMs: null }),
            kildimSonucMetni({ tur: 'konumYok' }),
        ].join(' ');
        expect(hepsi).not.toMatch(/\b(sen|senin|ayarla|aç)\b/i);
    });
});
