import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text: T } = require('react-native');
    return (p: { name: string }) => <T>{`ikon:${p.name}`}</T>;
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ metin: '#000', metinIkincil: '#666', sinir: '#ddd', kartArkaplan: '#fff', birincil: '#4CAF50' }),
}));

import { DurumAlani, DurumSeridi } from '../DurumAlani';

const oge = (anahtar: 'kerahat' | 'muhafiz' | 'seferilik', metin: string) => ({ anahtar, ozet: metin, dugum: <Text>{metin}</Text> });

describe('DurumAlani', () => {
    it('boşken hiçbir şey çizmez', () => {
        const { toJSON } = render(<DurumAlani ogeler={[]} />);
        expect(toJSON()).toBeNull();
    });

    it('yalnız en önemlisini gösterir; "+N daha" diğerlerini açar ve kapatır', () => {
        const { getByText, queryByText, getByTestId } = render(
            <DurumAlani ogeler={[oge('seferilik', 'Yolculuk'), oge('kerahat', 'Kerahat'), oge('muhafiz', 'Vakit çıkıyor')]} />,
        );
        expect(getByText('Kerahat')).toBeTruthy();
        expect(queryByText('Vakit çıkıyor')).toBeNull();
        const daha = getByTestId('durum-alani-daha');
        expect(daha.props.accessibilityLabel).toBe('2 uyarı daha: Vakit çıkıyor, Yolculuk');
        fireEvent.press(getByText('+2 daha'));
        expect(getByText('Vakit çıkıyor')).toBeTruthy();
        expect(getByText('Yolculuk')).toBeTruthy();
        fireEvent.press(getByText('Daha az'));
        expect(queryByText('Yolculuk')).toBeNull();
    });

    it('öne çıkan uyarı değişince açık liste kapanır', () => {
        const { getByText, queryByText, rerender } = render(
            <DurumAlani ogeler={[oge('muhafiz', 'Vakit çıkıyor'), oge('seferilik', 'Yolculuk')]} />,
        );
        fireEvent.press(getByText('+1 daha'));
        expect(getByText('Yolculuk')).toBeTruthy();
        rerender(<DurumAlani ogeler={[oge('kerahat', 'Kerahat'), oge('seferilik', 'Yolculuk')]} />);
        expect(getByText('Kerahat')).toBeTruthy();
        expect(queryByText('Yolculuk')).toBeNull();
    });

    it('tek uyarıda "+N daha" düğmesi çıkmaz', () => {
        const { queryByTestId } = render(<DurumAlani ogeler={[oge('muhafiz', 'Vakit çıkıyor')]} />);
        expect(queryByTestId('durum-alani-daha')).toBeNull();
    });
});

describe('DurumSeridi', () => {
    it('dokunulabilirken düğme rolü ve başlık etiketi taşır', () => {
        const onPress = jest.fn();
        const { getByLabelText } = render(<DurumSeridi ikon="bolt" renk="#4CAF50" baslik="Toparlanma" onPress={onPress} />);
        fireEvent.press(getByLabelText('Toparlanma'));
        expect(onPress).toHaveBeenCalled();
    });
});
