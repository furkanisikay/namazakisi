/**
 * OtomasyonRehberiSayfasi (issue #278) — sekmeler, anahtar kelimeler, değişkenler,
 * güven listesine geçiş ve iOS'ta "yalnız Android" bilgisi.
 */
import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useRenkler } from '../../../core/theme';

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{`ikon:${props.name}`}</Text> };
});
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

import { OtomasyonRehberiSayfasi } from '../OtomasyonRehberiSayfasi';

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
    });

    it('Rutinler sekmesi anahtar kelimeleri ve kısayol adımını gösterir', () => {
        const ekran = kur();
        expect(ekran.getByText('Öğle vakti girdi')).toBeTruthy();
        expect(ekran.getByText('vakti girdi')).toBeTruthy();
        expect(ekran.getByText('Camidesiniz')).toBeTruthy();
        expect(ekran.getByTestId('rehber-rutin-kildim')).toBeTruthy();
        expect(ekran.getByText(/One UI 8/)).toBeTruthy();
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
