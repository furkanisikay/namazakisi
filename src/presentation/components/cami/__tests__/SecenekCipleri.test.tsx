import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ birincil: '#4CAF50', sinir: '#E0E0E0', arkaplan: '#FAFAFA', metin: '#212121', metinIkincil: '#757575' }),
}));

import { SecenekCipleri } from '../SecenekCipleri';

describe('SecenekCipleri', () => {
    it('uzun etiket çipin içinde sarılır: metin esner (ikonu dışarı itmez), üç satıra kadar', () => {
        const uzun = 'எனக்கு அருகிலுள்ள எல்லாப் பள்ளிவாசல்களும்';
        const { getByText } = render(
            <SecenekCipleri
                secenekler={[
                    { deger: 'a', etiket: uzun, ikon: 'mosque' },
                    { deger: 'b', etiket: 'Kısa', ikon: 'star' },
                ]}
                secili="a"
                onSec={jest.fn()}
                grupEtiketi="Kapsam"
            />
        );
        const metin = getByText(uzun);
        expect(StyleSheet.flatten(metin.props.style).flexShrink).toBe(1);
        expect(metin.props.numberOfLines).toBe(3);
    });
});
