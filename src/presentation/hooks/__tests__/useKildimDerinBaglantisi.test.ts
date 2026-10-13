/**
 * `namazakisi://kildim` geri bildirim metni (issue #276) — arayüz dili kibar "siz",
 * saate hal eki EKLENMEZ.
 */
const mockDegerlendir = jest.fn();
const mockAdayiIsaretle = jest.fn();
const mockSimdikiKildim = jest.fn();
jest.mock('../../../domain/services/KildimKuyruguServisi', () => ({
    KildimKuyruguServisi: {
        getInstance: () => ({
            simdikiVaktiDegerlendir: mockDegerlendir,
            adayiIsaretle: mockAdayiIsaretle,
            simdikiVaktiKildim: mockSimdikiKildim,
        }),
    },
}));
const mockBaglantiKarari = jest.fn();
const mockSoruyuYanitla = jest.fn();
jest.mock('../../../domain/services/KildimGuvenServisi', () => ({
    KildimGuvenServisi: {
        derinBaglantiKarari: (...a: unknown[]) => mockBaglantiKarari(...a),
        soruyuYanitla: (...a: unknown[]) => mockSoruyuYanitla(...a),
    },
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

import { Linking } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';
import { kildimOnayBasligi, kildimSonucMetni, useKildimDerinBaglantisi } from '../useKildimDerinBaglantisi';

const ADAY = { tur: 'aday' as const, vakitAdi: 'Öğle', kayitVakti: 'ogle', tarih: '2026-10-13' };
const KIMLIKSIZ = { eylem: 'sor', paket: null, ad: '', herZaman: false, engel: false };
const RUTIN = 'com.samsung.android.app.routines';
const RUTIN_SORU = { eylem: 'sor', paket: RUTIN, ad: 'Modlar ve Rutinler', herZaman: true, engel: true };

describe('useKildimDerinBaglantisi — dışarıdan gelen bağlantı SESSİZCE işaretlemez', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('namazakisi://kildim');
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never);
        mockDegerlendir.mockResolvedValue(ADAY);
        mockAdayiIsaretle.mockResolvedValue({ tur: 'isaretlendi', vakitAdi: 'Öğle' });
        mockSimdikiKildim.mockResolvedValue({ tur: 'isaretlendi', vakitAdi: 'Öğle' });
        mockBaglantiKarari.mockResolvedValue(KIMLIKSIZ);
        mockSoruyuYanitla.mockResolvedValue(true);
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

describe('useKildimDerinBaglantisi — güven listesi (issue #299)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('namazakisi://kildim');
        jest.spyOn(Linking, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never);
        mockDegerlendir.mockResolvedValue(ADAY);
        mockAdayiIsaretle.mockResolvedValue({ tur: 'isaretlendi', vakitAdi: 'Öğle' });
        mockSimdikiKildim.mockResolvedValue({ tur: 'isaretlendi', vakitAdi: 'Öğle' });
        mockSoruyuYanitla.mockResolvedValue(true);
    });

    it('izinli uygulama ya da ana ekran: SORMADAN işaretlenir', async () => {
        mockBaglantiKarari.mockResolvedValue({ eylem: 'dogrudan', paket: RUTIN, ad: 'R', herZaman: false, engel: false });
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(mockSimdikiKildim).toHaveBeenCalledTimes(1));
        expect(result.current.onayAdayi).toBeNull();
        await waitFor(() => expect(kisaBildirimGoster).toHaveBeenCalledWith('Öğle namazınız kılındı olarak işaretlendi.'));
    });

    it('engellenmiş uygulama: hiçbir şey yapılmaz, mesaj bile gösterilmez', async () => {
        mockBaglantiKarari.mockResolvedValue({ eylem: 'yokSay', paket: RUTIN, ad: 'R', herZaman: false, engel: false });
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(mockBaglantiKarari).toHaveBeenCalled());
        await act(async () => { await Promise.resolve(); });
        expect(mockDegerlendir).not.toHaveBeenCalled();
        expect(mockSimdikiKildim).not.toHaveBeenCalled();
        expect(kisaBildirimGoster).not.toHaveBeenCalled();
        expect(result.current.onayAdayi).toBeNull();
    });

    it('ilk kez gelen uygulama: soru açılır, "Her zaman izin ver" kararı saklar ve işaretler', async () => {
        mockBaglantiKarari.mockResolvedValue(RUTIN_SORU);
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.baslatan).toEqual(RUTIN_SORU));
        expect(result.current.onayAdayi).toEqual(ADAY);
        act(() => result.current.herZamanIzinVer());
        expect(mockSoruyuYanitla).toHaveBeenCalledWith(RUTIN, 'izin');
        await waitFor(() => expect(mockAdayiIsaretle).toHaveBeenCalledWith(ADAY));
        expect(result.current.baslatan).toBeNull();
    });

    it('"Yalnız bu sefer" kararı SAKLAMAZ', async () => {
        mockBaglantiKarari.mockResolvedValue(RUTIN_SORU);
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.onayAdayi).not.toBeNull());
        act(() => result.current.onayla());
        await waitFor(() => expect(mockAdayiIsaretle).toHaveBeenCalledWith(ADAY));
        expect(mockSoruyuYanitla).not.toHaveBeenCalled();
    });

    it('"Engelle" kararı saklar, hiçbir şey işaretlenmez', async () => {
        mockBaglantiKarari.mockResolvedValue(RUTIN_SORU);
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.onayAdayi).not.toBeNull());
        act(() => result.current.engelle());
        expect(mockSoruyuYanitla).toHaveBeenCalledWith(RUTIN, 'engel');
        await waitFor(() =>
            expect(kisaBildirimGoster).toHaveBeenCalledWith(
                'Modlar ve Rutinler artık namazlarınızı işaretleyemez. Ayarlardan değiştirebilirsiniz.'
            )
        );
        expect(mockAdayiIsaretle).not.toHaveBeenCalled();
    });

    it('tarayıcı (her zaman sunulmaz): "Her zaman" yolu karar YAZMAZ', async () => {
        mockBaglantiKarari.mockResolvedValue({ ...RUTIN_SORU, paket: 'com.android.chrome', herZaman: false });
        const { result } = renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(result.current.onayAdayi).not.toBeNull());
        act(() => result.current.herZamanIzinVer());
        expect(mockSoruyuYanitla).not.toHaveBeenCalled();
    });

    it('bağlantı başına karar YALNIZ BİR KEZ sorulur (native kayıt tüketilir)', async () => {
        mockBaglantiKarari.mockResolvedValue(RUTIN_SORU);
        renderHook(() => useKildimDerinBaglantisi(true));
        await waitFor(() => expect(mockDegerlendir).toHaveBeenCalled());
        expect(mockBaglantiKarari).toHaveBeenCalledTimes(1);
    });
});
