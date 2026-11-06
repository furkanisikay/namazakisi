/**
 * "Saat ve widget" sayfası — İngilizce çizimde Türkçe metin kalmaz (dil çıkarımı nöbetçisi).
 * Başka alanların bileşenleri (geri sayım bölümü, bileklik rehberi) kendi testlerinde denetlenir.
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { SaatVeWidgetSayfasi } from '../SaatVeWidgetSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#fff', kartArkaplan: '#eee', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc' }),
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('../../hooks/useNowBarOzeti', () => ({ useNowBarOzeti: () => ({ kullanilabilir: true, ozet: 'x' }) }));
jest.mock('../../../domain/services/KildimGuvenServisi', () => ({ KildimGuvenServisi: { kullanilabilirMi: () => true } }));
jest.mock('../../components/ayar/VurguSaglayici', () => ({ VurguSaglayici: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('../../components/ayar/useVurguKurulumu', () => ({ useVurguKurulumu: () => ({ current: null }) }));
jest.mock('../../components/ayar/AyarCapasi', () => ({ AyarCapasi: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('../../components/hatirlatmalar/VakitSayaciBolumu', () => ({ VakitSayaciBolumu: () => null }));
jest.mock('../../components/bildirim/BileklikRehberKarti', () => ({ BileklikRehberKarti: () => null }));
jest.mock('../Ayarlar/AyarSatiri', () => {
    const { Text: T } = require('react-native');
    return { AyarSatiri: ({ baslik, ozet }: { baslik: string; ozet?: string }) => <T>{`${baslik} | ${ozet ?? ''}`}</T> };
});
jest.mock('../../components/ortak/BolumBasligi', () => {
    const { Text: T } = require('react-native');
    return { BolumBasligi: ({ metin }: { metin: string }) => <T>{metin}</T> };
});
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({ saatUygulamasiDestekli: () => true }));

const YASAKLI = ['Saat', 'Geri', 'Otomasyon', 'Rutinler'];

describe('SaatVeWidgetSayfasi — İngilizce', () => {
    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
    });
    afterEach(() => {
        act(() => geriAl());
        jest.restoreAllMocks();
    });

    it.each(['android', 'ios'] as const)('%s: satırlar ve gelişmiş katı', (os) => {
        jest.replaceProperty(Platform, 'OS', os);
        const e = render(<SaatVeWidgetSayfasi />);
        fireEvent.press(e.getByTestId('saat-gelismis'));
        expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
        expect(e.getByText('Countdown')).toBeTruthy();
        expect(e.UNSAFE_getAllByType(Text).length).toBeGreaterThan(0);
        e.unmount();
    });
});
