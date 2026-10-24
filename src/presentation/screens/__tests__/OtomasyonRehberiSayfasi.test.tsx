/**
 * OtomasyonRehberiSayfasi (issue #278) — sekmeler, anahtar kelimeler, değişkenler,
 * güven listesine geçiş ve iOS'ta "yalnız Android" bilgisi.
 */
import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useRenkler } from '../../../core/theme';

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{`ikon:${props.name}`}</Text> };
});
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));
const mockCihaz: { samsung: boolean | null } = { samsung: null };
jest.mock('../../hooks/useCihazDurumu', () => ({
    useCihazDurumu: () => ({ durum: mockCihaz, yenile: jest.fn() }),
}));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

import { OtomasyonRehberiSayfasi } from '../OtomasyonRehberiSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    dikkat: '#E65100',
};

const kur = () => {
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    return render(<OtomasyonRehberiSayfasi />);
};

describe('OtomasyonRehberiSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        mockCihaz.samsung = null;
    });

    it('Rutinler sekmesi anahtar kelimeleri ve kısayol adımını gösterir', () => {
        const ekran = kur();
        expect(ekran.getByText('Öğle vakti girdi')).toBeTruthy();
        expect(ekran.getByText('vakti girdi')).toBeTruthy();
        expect(ekran.getByText('Camidesiniz')).toBeTruthy();
        expect(ekran.getByTestId('rehber-rutin-kildim')).toBeTruthy();
        expect(ekran.getByText(/Bazı One UI sürümlerinde/)).toBeTruthy();
        expect(ekran.queryByText('%vakit')).toBeNull();
    });

    it('Tasker sekmesine geçince eklenti adımları ve değişkenler görünür', () => {
        const ekran = kur();
        fireEvent.press(ekran.getByTestId('rehber-sekme-eklenti'));
        expect(ekran.getByText('%vakit')).toBeTruthy();
        expect(ekran.getByText('%cami')).toBeTruthy();
        expect(ekran.getByTestId('rehber-eklenti-kildim')).toBeTruthy();
        expect(ekran.queryByText('Öğle vakti girdi')).toBeNull();
        expect(ekran.getByTestId('rehber-sekme-eklenti').props.accessibilityState).toEqual({ selected: true });
    });

    it('Samsung DEĞİLSE Rutinler sekmesi yok, yalnız eklenti rehberi', () => {
        mockCihaz.samsung = false;
        const ekran = kur();
        expect(ekran.queryByTestId('rehber-sekme-rutinler')).toBeNull();
        expect(ekran.getByTestId('rehber-eklenti-kildim')).toBeTruthy();
        expect(ekran.queryByText('Öğle vakti girdi')).toBeNull();
    });

    it('Samsung olup olmadığı BİLİNMİYORSA (null) Rutinler sekmesi gizlenmez', () => {
        mockCihaz.samsung = null;
        const ekran = kur();
        expect(ekran.getByTestId('rehber-sekme-rutinler')).toBeTruthy();
        expect(ekran.getByText('Öğle vakti girdi')).toBeTruthy();
    });

    it('güven listesine götürür', () => {
        const ekran = kur();
        fireEvent.press(ekran.getByTestId('rehber-guven-listesi'));
        expect(mockNavigate).toHaveBeenCalledWith('KildimUygulamalari');
    });

    it('iOS\'ta yalnız bilgi gösterir', () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const ekran = kur();
        expect(ekran.getByText(/yalnız Android/)).toBeTruthy();
        expect(ekran.queryByTestId('rehber-sekme-rutinler')).toBeNull();
    });
});

describe('OtomasyonRehberiSayfasi — İngilizce', () => {
    const YASAKLI = ['Vakit', 'vakit\\b', 'Rutin', 'Kapat', 'Cami\\b'];
    /** Değişken adları (`%vakit`) kimliktir. Telefon İngilizce: native etiketler de İngilizce. */
    const kalan = (e: ReturnType<typeof render>) => turkceKalanlar(e.toJSON() as never, YASAKLI).filter((m: string) => !m.startsWith('%'));
    let geriAl: () => void;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        mockCihaz.samsung = null;
        jest.spyOn(require('../../../domain/services/DilServisi'), 'cihazYerelAyari').mockReturnValue('en_US');
        geriAl = ingilizceyeGec();
    });
    afterEach(() => act(() => geriAl()));

    it('Rutinler ve Tasker sekmeleri, iOS bilgisi', () => {
        const ekran = kur();
        expect(kalan(ekran)).toEqual([]);
        // Kısayol adı telefonun dilinde (başlatıcı çözer) — İngilizce telefonda İngilizce.
        expect(ekran.getByText(/I've prayed the current prayer/)).toBeTruthy();
        expect(ekran.getByTestId('rehber-rutin-dil-notu')).toBeTruthy();
        fireEvent.press(ekran.getByTestId('rehber-sekme-eklenti'));
        expect(kalan(ekran)).toEqual([]);
        ekran.unmount();
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(kalan(kur())).toEqual([]);
    });
});
