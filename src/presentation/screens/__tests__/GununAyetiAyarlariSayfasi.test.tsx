/**
 * Günün ayeti ayarı — Android'de duvar kâğıdı onaysız açılmaz, engelli cihazda neden yazılır,
 * yazım başarısızsa bilgi satırı çıkar; iPhone'da Kısayollar rehberi. Görünüm kartı (iki küçük
 * önizleme) düzenleyiciyi açar, hazır görünümler düzenleyiciye parametreyle gider. İngilizcede
 * Türkçe kalmaz.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';
import { GununAyetiAyarlariSayfasi } from '../GununAyetiAyarlariSayfasi';
import { VARSAYILAN_DUVAR_AYARI } from '../../../core/icerik/gununAyetiYuku';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';
import { aktifDiliKur, aktifDilSifirla } from '../../../core/dil/aktifDil';

const mockServis = {
    duvarAyariOku: jest.fn(),
    duvarAyariKaydet: jest.fn(),
    duvarKagidiDurumu: jest.fn(),
    duvarKagidiniSimdiUygula: jest.fn(),
    duvarOnizlemesi: jest.fn(),
    widgetSabitlenebilirMi: jest.fn(),
    widgetiSabitle: jest.fn(),
};
jest.mock('../../../domain/services/GununAyetiServisi', () => ({ GununAyetiServisi: { getInstance: () => mockServis } }));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: mockNavigate, addListener: () => () => undefined }),
}));
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
        mockServis.widgetSabitlenebilirMi.mockResolvedValue(false);
        mockServis.widgetiSabitle.mockResolvedValue(true);
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

        it('başlatıcı destekliyorsa widget tek dokunuşla eklenir, desteklemiyorsa düğme yok', async () => {
            const e = render(<GununAyetiAyarlariSayfasi />);
            await e.findByTestId('gunun-ayeti-duvar-anahtar');
            expect(e.queryByTestId('gunun-ayeti-widget-ekle')).toBeNull();
            e.unmount();

            mockServis.widgetSabitlenebilirMi.mockResolvedValue(true);
            const d = render(<GununAyetiAyarlariSayfasi />);
            fireEvent.press(await d.findByTestId('gunun-ayeti-widget-ekle'));
            expect(mockServis.widgetiSabitle).toHaveBeenCalled();
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

        it('Kısayollar rehberini gösterir; Android duvar köprüsüne ve açma anahtarına dokunmaz', async () => {
            const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
            const e = render(<GununAyetiAyarlariSayfasi />);
            expect(await e.findByText(/Günün Saati/)).toBeTruthy();
            fireEvent.press(e.getByTestId('gunun-ayeti-kisayollar'));
            expect(ac).toHaveBeenCalledWith('shortcuts://');
            expect(mockServis.duvarKagidiDurumu).not.toHaveBeenCalled();
            expect(e.queryByTestId('gunun-ayeti-duvar-anahtar')).toBeNull();
        });

        it('vakte uyan gökte ek otomasyon satırı görünür, düz zeminde görünmez', async () => {
            const e = render(<GununAyetiAyarlariSayfasi />);
            expect(await e.findByTestId('gunun-ayeti-vakte-uysun-ios')).toBeTruthy();
            e.unmount();
            mockServis.duvarAyariOku.mockResolvedValue({ ...VARSAYILAN_DUVAR_AYARI, zemin: 'gece' });
            const d = render(<GununAyetiAyarlariSayfasi />);
            await d.findByText(/Günün Saati/);
            await d.findByTestId('duvar-duzenle');
            expect(d.queryByTestId('gunun-ayeti-vakte-uysun-ios')).toBeNull();
        });
    });

    describe('görünüm kartı', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));
        afterEach(() => jest.restoreAllMocks());

        it('kilit ve ana ekran önizlemesi çizilir; düğme düzenleyiciyi açar', async () => {
            const e = render(<GununAyetiAyarlariSayfasi />);
            fireEvent.press(await e.findByTestId('duvar-duzenle'));
            expect(mockNavigate).toHaveBeenCalledWith('DuvarDuzenleyici');
            expect(e.getByTestId('duvar-onizleme-kilit')).toBeTruthy();
            expect(e.getByTestId('duvar-onizleme-ana')).toBeTruthy();
            expect(e.getByText('Görünümü düzenleyin')).toBeTruthy();
        });

        it('hazır görünüm çipleri düzenleyiciye adıyla gider ve kaydetmez', async () => {
            const e = render(<GununAyetiAyarlariSayfasi />);
            for (const ad of ['sade', 'mihrap', 'gece', 'foto'] as const) {
                fireEvent.press(await e.findByTestId(`duvar-hazir-${ad}`));
                expect(mockNavigate).toHaveBeenLastCalledWith('DuvarDuzenleyici', { hazir: ad });
            }
            expect(e.getByText('Sade')).toBeTruthy();
            expect(e.getByText('Mihrap')).toBeTruthy();
            expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
        });
    });

    describe('meal', () => {
        afterEach(() => {
            act(() => aktifDilSifirla());
            jest.restoreAllMocks();
        });

        it.each(['android', 'ios'] as const)('%s: meali olmayan dilde (sd) "meal yok" bilgi satırı görünür, meali olan dilde görünmez', async (os) => {
            jest.replaceProperty(Platform, 'OS', os);
            const tr = render(<GununAyetiAyarlariSayfasi />);
            await tr.findByText('Ana ekrana widget ekleyin');
            expect(tr.queryByTestId('gunun-ayeti-meal-yok')).toBeNull();
            tr.unmount();
            act(() => aktifDiliKur('sd'));
            const sd = render(<GununAyetiAyarlariSayfasi />);
            expect(await sd.findByTestId('gunun-ayeti-meal-yok')).toBeTruthy();
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
