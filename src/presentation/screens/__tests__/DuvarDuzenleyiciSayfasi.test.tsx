/**
 * Duvar kâğıdı düzenleyicisi: sekmeler, hazır görünüm, "Uygulayın" (kaydet; Android'de açıksa
 * hemen uygula, kapalıysa yalnız kaydet), "Vazgeçin" (kaydetmez), yazı saat alanına girmez
 * (ekran okuyucu taşıması da kıstırılır), fotoğraf akışı (sistem seçicisi + uygulama kopyası;
 * değiştirilen ve uygulanmayan kopyalar silinir; iPhone'da eski ikilide bilgi satırı).
 *
 * Sahte zamanlayıcı YOK (tam sayfa render, test-tuzaklari.md).
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Image, Platform } from 'react-native';
import { DuvarDuzenleyiciSayfasi } from '../DuvarDuzenleyiciSayfasi';
import { VARSAYILAN_DUVAR_AYARI, type DuvarKagidiAyari } from '../../../core/icerik/gununAyetiYuku';
import { IZINLI_BANTLAR } from '../../../core/icerik/duvarTasarimi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const mockServis = {
    duvarAyariOku: jest.fn(),
    duvarAyariKaydet: jest.fn(),
    duvarKagidiniSimdiUygula: jest.fn(),
};
jest.mock('../../../domain/services/GununAyetiServisi', () => ({ GununAyetiServisi: { getInstance: () => mockServis } }));

const mockGoBack = jest.fn();
let mockParametreler: Record<string, unknown> | undefined;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ goBack: mockGoBack, navigate: jest.fn(), addListener: () => () => undefined }),
    useRoute: () => ({ params: mockParametreler }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#ffffff', kartArkaplan: '#eeeeee', birincil: '#2E7D32', metin: '#333333', metinIkincil: '#666666', sinir: '#cccccc' }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: { koordinatlar: { lat: 0, lng: 0 } } }),
}));
const mockKisaBildirim = jest.fn();
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: (...a: unknown[]) => mockKisaBildirim(...a) }));

// Fotoğraf: sistem seçicisi, dosya sistemi ve özet (gerçek `duvarFotografi` bunlarla çalışır).
const mockSec = jest.fn();
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: (...a: unknown[]) => mockSec(...a) }));
const mockKopyala = jest.fn();
const mockSil = jest.fn();
jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: 'file:///belge/',
    makeDirectoryAsync: jest.fn(() => Promise.resolve()),
    copyAsync: (...a: unknown[]) => mockKopyala(...a),
    deleteAsync: (...a: unknown[]) => mockSil(...a),
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'abcdef12-3456-7890-abcd-ef1234567890' }));
// iPhone köprüsünde `duvarFotografiniYaz` eski ikilide yok: bilgi satırı beklenir.
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({}));

const YENI_DOSYA = 'duvar-foto-abcdef1234567890.jpg';

const kaydedilen = (): DuvarKagidiAyari => mockServis.duvarAyariKaydet.mock.calls.at(-1)?.[0];

async function ac(ayar: Partial<DuvarKagidiAyari> = {}) {
    mockServis.duvarAyariOku.mockResolvedValue({ ...VARSAYILAN_DUVAR_AYARI, ...ayar });
    const e = render(<DuvarDuzenleyiciSayfasi />);
    const alan = await e.findByTestId('duvar-alan');
    fireEvent(alan, 'layout', { nativeEvent: { layout: { width: 360, height: 500, x: 0, y: 0 } } });
    await e.findByTestId('duvar-tuval');
    return e;
}

describe('DuvarDuzenleyiciSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockParametreler = undefined;
        mockServis.duvarAyariKaydet.mockResolvedValue(undefined);
        mockServis.duvarKagidiniSimdiUygula.mockResolvedValue(true);
        mockSec.mockResolvedValue({ canceled: true, assets: null });
        mockKopyala.mockResolvedValue(undefined);
        mockSil.mockResolvedValue(undefined);
        jest.replaceProperty(Platform, 'OS', 'android');
        // Kayıtlı fotoğrafın boyutu (kırpma için).
        jest.spyOn(Image, 'getSize').mockImplementation(((_u: string, ok: (g: number, y: number) => void) => ok(1000, 2000)) as never);
    });
    afterEach(() => jest.restoreAllMocks());

    it('sekmeler arasında geçilir; zemin, yazı tipi, hiza ve süs seçimi kaydedilir', async () => {
        const e = await ac();
        expect(e.getByText('Vakte uysun')).toBeTruthy();
        expect(e.getByText(/Her vakit girdiğinde/)).toBeTruthy();
        fireEvent.press(e.getByTestId('duvar-zemin-yatsi'));
        fireEvent(e.getByTestId('duvar-vakte-uysun'), 'valueChange', false);

        fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
        expect(e.queryByTestId('duvar-zemin-yatsi')).toBeNull();
        fireEvent.press(e.getByTestId('duvar-tip-zarif'));
        fireEvent.press(e.getByTestId('duvar-hiza-bas'));
        expect(e.getAllByText(/lavaboya/).length).toBeGreaterThan(0);
        fireEvent(e.getByTestId('duvar-arapca'), 'valueChange', true);

        fireEvent.press(e.getByTestId('duvar-sekme-sus'));
        fireEvent.press(e.getByTestId('duvar-sus-girih'));

        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({
            zemin: 'yatsi',
            vakteUysun: false,
            arapca: true,
            acik: false,
            yazi: { tip: 'zarif', hiza: 'bas' },
            sus: { tur: 'girih' },
        });
        // Duvar kâğıdı kapalı: yalnız kaydedilir, uygulanmaz ve açılmaz.
        expect(mockServis.duvarKagidiniSimdiUygula).not.toHaveBeenCalled();
        expect(mockKisaBildirim).toHaveBeenCalledWith('Görünüm kaydedildi');
    });

    it('Android\'de duvar kâğıdı açıksa "Uygulayın" kaydedip hemen uygular', async () => {
        const e = await ac({ acik: true });
        fireEvent.press(e.getByTestId('duvar-zemin-kusluk'));
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarKagidiniSimdiUygula).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({ acik: true, zemin: 'kusluk' });
        expect(mockKisaBildirim).toHaveBeenCalledWith('Duvar kâğıdı yerleştirildi', false);
    });

    it('"Vazgeçin" kaydetmeden döner', async () => {
        const e = await ac();
        fireEvent.press(e.getByTestId('duvar-zemin-aksam'));
        fireEvent.press(e.getByTestId('duvar-vazgec'));
        expect(mockGoBack).toHaveBeenCalled();
        expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
    });

    it('hazır görünüm açılışta bir kez uygulanır ve düzenlenebilir', async () => {
        mockParametreler = { hazir: 'mihrap' };
        const e = await ac({ zemin: 'gece', sus: { tur: 'yok', belirginlik: 0.5 } });
        fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
        fireEvent.press(e.getByTestId('duvar-tip-sade'));
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({ zemin: 'ikindi', sus: { tur: 'mihrap' }, yazi: { tip: 'sade' } });
    });

    it('yazı taşınırken saat alanına girmez (Android kilit ekranı)', async () => {
        const e = await ac();
        // Blok yüksekliği: tuval 484 px; 60 px blok ≈ ekranın %12'si.
        const yazi = e.getByTestId('duvar-yazi');
        fireEvent(yazi, 'layout', { nativeEvent: { layout: { width: 200, height: 60, x: 0, y: 0 } } });
        const tuval = e.getByTestId('duvar-tuval');
        for (let i = 0; i < 40; i++) {
            fireEvent(tuval, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
        }
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        const merkez = kaydedilen().yazi.kilitY as number;
        const blok = 60 / 484;
        const [ust, alt] = [merkez - blok / 2, merkez + blok / 2];
        // Yukarı taşındıkça saatin üstündeki ince banda geçer; saat alanına (%26–%64) asla girmez.
        expect(IZINLI_BANTLAR.android.kilit.some(([a, b]) => ust >= a - 1e-6 && alt <= b + 1e-6)).toBe(true);
        expect(alt <= 0.26 + 1e-6 || ust >= 0.64 - 1e-6).toBe(true);
    });

    it('"ikisi"nde kilit ve ana ekran ayrı düzenlenir', async () => {
        const e = await ac({ yer: 'ikisi' });
        fireEvent(e.getByTestId('duvar-yazi'), 'layout', { nativeEvent: { layout: { width: 200, height: 60, x: 0, y: 0 } } });
        fireEvent.press(e.getByTestId('duvar-ekran-ana'));
        fireEvent(e.getByTestId('duvar-tuval'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        expect(kaydedilen().yazi.kilitY).toBeNull();
        expect(kaydedilen().yazi.anaY).not.toBeNull();
    });

    describe('fotoğraf', () => {
        const secim = { canceled: false, assets: [{ uri: 'file:///secici/a.heic', width: 1200, height: 1600 }] };

        it('seçilen fotoğraf uygulama dizinine kopyalanır; uygulanınca eski kopya silinir', async () => {
            mockSec.mockResolvedValue(secim);
            mockParametreler = { hazir: 'foto' };
            const e = await ac({ foto: { ...VARSAYILAN_DUVAR_AYARI.foto, dosya: 'duvar-foto-eskieski1.jpg' } });
            await waitFor(() => expect(mockKopyala).toHaveBeenCalledWith({ from: 'file:///secici/a.heic', to: `file:///belge/duvar/${YENI_DOSYA}` }));
            expect(mockSec).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
            expect(await e.findByText('Fotoğrafınız')).toBeTruthy();
            fireEvent(e.getByTestId('duvar-okunurluk'), 'valueChange', false);
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
            expect(kaydedilen()).toMatchObject({ zemin: 'foto', foto: { dosya: YENI_DOSYA, okunurluk: false, x: 0.5, y: 0.5, yakinlik: 1 } });
            expect(mockSil).toHaveBeenCalledWith('file:///belge/duvar/duvar-foto-eskieski1.jpg', { idempotent: true });
            expect(mockSil).not.toHaveBeenCalledWith(`file:///belge/duvar/${YENI_DOSYA}`, expect.anything());
        });

        it('vazgeçilirse bu oturumda kopyalanan fotoğraf silinir, kayıtlı olana dokunulmaz', async () => {
            mockSec.mockResolvedValue(secim);
            const e = await ac({ zemin: 'foto', foto: { ...VARSAYILAN_DUVAR_AYARI.foto, dosya: 'duvar-foto-eskieski1.jpg' } });
            // Kayıtlı fotoğraf seçicisiz açılır; "Değiştirin" yenisini seçtirir.
            fireEvent.press(await e.findByTestId('duvar-foto-degistir'));
            await waitFor(() => expect(mockKopyala).toHaveBeenCalled());
            fireEvent.press(e.getByTestId('duvar-vazgec'));
            e.unmount();
            await waitFor(() => expect(mockSil).toHaveBeenCalledWith(`file:///belge/duvar/${YENI_DOSYA}`, { idempotent: true }));
            expect(mockSil).not.toHaveBeenCalledWith('file:///belge/duvar/duvar-foto-eskieski1.jpg', expect.anything());
            expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
        });

        it('kopyalanamazsa bilgi satırı çıkar, zemin değişmez', async () => {
            mockSec.mockResolvedValue(secim);
            mockKopyala.mockRejectedValue(new Error('disk'));
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-zemin-foto'));
            expect(await e.findByTestId('duvar-foto-hata')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            expect(kaydedilen().zemin).toBe('imsak');
        });

        it('iPhone\'da Kısayollar görseline aktaramayan eski ikilide bilgi satırı gösterir', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            mockSec.mockResolvedValue(secim);
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-zemin-foto'));
            expect(await e.findByTestId('duvar-foto-ios')).toBeTruthy();
            // iPhone'da "Vakte uysun" açıklamasında Android'e özgü cümle yok.
            fireEvent.press(e.getByTestId('duvar-zemin-imsak'));
            expect(e.queryByText(/Her vakit girdiğinde/)).toBeNull();
        });
    });

    it('İngilizcede Türkçe metin kalmaz', async () => {
        const geriAl = ingilizceyeGec();
        try {
            const e = await ac();
            for (const sekme of ['zemin', 'yazi', 'sus'] as const) {
                fireEvent.press(e.getByTestId(`duvar-sekme-${sekme}`));
                expect(turkceKalanlar(e.toJSON() as never, ['Günün', 'Kur'])).toEqual([]);
            }
        } finally {
            act(() => geriAl());
        }
    });
});
