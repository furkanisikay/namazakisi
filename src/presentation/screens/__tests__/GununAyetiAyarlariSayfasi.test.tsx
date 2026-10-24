/**
 * Günün ayeti ayarı — Android'de duvar kâğıdı onaysız açılmaz, engelli cihazda neden yazılır,
 * yazım başarısızsa bilgi satırı çıkar; iPhone'da Kısayollar rehberi. İngilizcede Türkçe kalmaz.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';
import { GununAyetiAyarlariSayfasi } from '../GununAyetiAyarlariSayfasi';
import { VARSAYILAN_DUVAR_AYARI } from '../../../core/icerik/gununAyetiYuku';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const mockServis = {
    duvarAyariOku: jest.fn(),
    duvarAyariKaydet: jest.fn(),
    duvarKagidiDurumu: jest.fn(),
    duvarKagidiniSimdiUygula: jest.fn(),
    duvarOnizlemesi: jest.fn(),
};
jest.mock('../../../domain/services/GununAyetiServisi', () => ({ GununAyetiServisi: { getInstance: () => mockServis } }));
jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#fff', kartArkaplan: '#eee', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc' }),
    KOYU_TEMA: { renkler: { arkaplan: '#121212', metin: '#fff', metinIkincil: '#bbb' } },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: { koordinatlar: { lat: 0, lng: 0 } } }),
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../components/ortak/AnahtarSatiri', () => {
    const { Text: T } = require('react-native');
    return {
        AnahtarSatiri: (p: { testID?: string; baslik: string; ozet?: string; deger: boolean; devreDisi?: boolean; onDegistir: (d: boolean) => void }) => (
            <T testID={p.testID} onPress={() => !p.devreDisi && p.onDegistir(!p.deger)}>{`${p.baslik} | ${p.ozet ?? ''}`}</T>
        ),
    };
});
jest.mock('../../components/ortak/SecenekListesi', () => {
    const { Text: T } = require('react-native');
    return { SecenekListesi: ({ secenekler }: { secenekler: { etiket: string }[] }) => <T>{secenekler.map((s) => s.etiket).join(', ')}</T> };
});
jest.mock('../../components/common/BildirimModali', () => {
    const { Text: T, View: V } = require('react-native');
    return {
        BildirimModali: (p: { gorunur: boolean; baslik: string; mesaj: string; birincilEtiket?: string; onBirincil?: () => void; icerik?: React.ReactNode }) =>
            p.gorunur ? (
                <V>
                    <T>{p.baslik}</T>
                    <T>{p.mesaj}</T>
                    {p.icerik}
                    <T testID="onay-birincil" onPress={p.onBirincil}>{p.birincilEtiket}</T>
                </V>
            ) : null,
    };
});

const durum = (d: Partial<{ destekli: boolean; engelli: boolean; sonHataVar: boolean }> = {}) => ({
    destekli: true,
    engelli: false,
    sonHataVar: false,
    ...d,
});

describe('GununAyetiAyarlariSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockServis.duvarAyariOku.mockResolvedValue(VARSAYILAN_DUVAR_AYARI);
        mockServis.duvarAyariKaydet.mockResolvedValue(undefined);
        mockServis.duvarKagidiDurumu.mockResolvedValue(durum());
        mockServis.duvarKagidiniSimdiUygula.mockResolvedValue(true);
        mockServis.duvarOnizlemesi.mockResolvedValue(null);
    });

    describe('Android', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));
        afterEach(() => jest.restoreAllMocks());

        it('anahtar onay penceresi açar; "Açın" ayarı kaydeder ve hemen uygular', async () => {
            const e = render(<GununAyetiAyarlariSayfasi />);
            fireEvent.press(await e.findByTestId('gunun-ayeti-duvar-anahtar'));
            expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
            expect(e.getByText('Duvar kâğıdınız değişecek')).toBeTruthy();
            // Fıkıh notu onay penceresinde (sahip kararı).
            expect(e.getAllByText(/lavaboya/).length).toBeGreaterThan(0);
            fireEvent.press(e.getByTestId('onay-birincil'));
            await waitFor(() => expect(mockServis.duvarKagidiniSimdiUygula).toHaveBeenCalled());
            expect(mockServis.duvarAyariKaydet).toHaveBeenCalledWith({ ...VARSAYILAN_DUVAR_AYARI, acik: true });
        });

        it('uygulanamazsa bilgi satırı gösterir', async () => {
            mockServis.duvarKagidiniSimdiUygula.mockResolvedValue(false);
            const e = render(<GununAyetiAyarlariSayfasi />);
            fireEvent.press(await e.findByTestId('gunun-ayeti-duvar-anahtar'));
            fireEvent.press(e.getByTestId('onay-birincil'));
            expect(await e.findByText(/yerleştirilemedi/)).toBeTruthy();
        });

        it('sistem engelliyse anahtar açılmaz ve nedeni yazılır', async () => {
            mockServis.duvarKagidiDurumu.mockResolvedValue(durum({ engelli: true }));
            const e = render(<GununAyetiAyarlariSayfasi />);
            fireEvent.press(await e.findByTestId('gunun-ayeti-duvar-anahtar'));
            expect(e.queryByText('Duvar kâğıdınız değişecek')).toBeNull();
            expect(e.getByText(/iş ya da okul yönetimi/)).toBeTruthy();
            expect(e.getByText(/Kullanılamıyor/)).toBeTruthy();
        });

        it('açıkken seçenekler ve kapatma notu görünür', async () => {
            mockServis.duvarAyariOku.mockResolvedValue({ ...VARSAYILAN_DUVAR_AYARI, acik: true });
            const e = render(<GununAyetiAyarlariSayfasi />);
            expect(await e.findByText('Kilit ekranı, Ana ekran, İkisi')).toBeTruthy();
            expect(e.getByText(/galeriden kendiniz/)).toBeTruthy();
        });
    });

    describe('iOS', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'ios'));
        afterEach(() => jest.restoreAllMocks());

        it('Kısayollar rehberini gösterir, duvar kâğıdı servisine dokunmaz', () => {
            const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
            const e = render(<GununAyetiAyarlariSayfasi />);
            expect(e.getByText(/Günün Saati/)).toBeTruthy();
            fireEvent.press(e.getByTestId('gunun-ayeti-kisayollar'));
            expect(ac).toHaveBeenCalledWith('shortcuts://');
            expect(mockServis.duvarAyariOku).not.toHaveBeenCalled();
        });
    });

    describe('İngilizce', () => {
        let geriAl: () => void;
        beforeEach(() => {
            geriAl = ingilizceyeGec();
        });
        afterEach(() => {
            act(() => geriAl());
            jest.restoreAllMocks();
        });

        it.each(['android', 'ios'] as const)('%s: Türkçe metin kalmaz', async (os) => {
            jest.replaceProperty(Platform, 'OS', os);
            mockServis.duvarAyariOku.mockResolvedValue({ ...VARSAYILAN_DUVAR_AYARI, acik: true });
            const e = render(<GununAyetiAyarlariSayfasi />);
            await e.findByText('Add a widget to your home screen');
            if (os === 'android') await e.findByTestId('gunun-ayeti-duvar-anahtar');
            expect(turkceKalanlar(e.toJSON() as never, ['Günün', 'Kur'])).toEqual([]);
        });
    });
});
