import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { KenarGezinme } from '../KenarGezinme';

jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        birincil: '#4CAF50',
        kartArkaplan: '#FFFFFF',
        metin: '#111111',
        metinIkincil: '#666666',
        sinir: '#DDDDDD',
    }),
}));

const rotalar = [
    { key: 'a', name: 'AnaSayfa', params: undefined },
    { key: 'b', name: 'Ayarlar', params: undefined },
];

const kur = (tur: 'ray' | 'kenar', ekSecenek: Record<string, unknown> = {}) => {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    const descriptors = {
        a: { options: { tabBarLabel: 'Bugün', tabBarIcon: () => <Text>ikon-a</Text>, ...ekSecenek } },
        b: { options: { tabBarLabel: 'Ayarlar', tabBarBadge: '', tabBarIcon: () => <Text>ikon-b</Text> } },
    };
    const ekran = render(
        <KenarGezinme
            state={{ index: 0, routes: rotalar } as never}
            descriptors={descriptors as never}
            navigation={navigation as never}
            insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
            tur={tur}
        />
    );
    return { ekran, navigation };
};

describe('KenarGezinme', () => {
    it('kenar çubuğunda uygulama adı ve sekmeler; seçili sekme işaretli; rozet etikette', () => {
        const { ekran } = kur('kenar');
        expect(ekran.getByTestId('kenar-gezinme')).toBeTruthy();
        expect(ekran.getByText('Namaz Akışı')).toBeTruthy();
        expect(ekran.getByLabelText('Bugün').props.accessibilityState).toEqual({ selected: true });
        expect(ekran.getByLabelText('Ayarlar, yeni')).toBeTruthy();
    });

    it('rayda uygulama adı yok, etiketler ikonun altında', () => {
        const { ekran } = kur('ray');
        expect(ekran.getByTestId('ray-gezinme')).toBeTruthy();
        expect(ekran.queryByText('Namaz Akışı')).toBeNull();
        expect(ekran.getByText('Ayarlar')).toBeTruthy();
    });

    it('başka sekmeye basınca tabPress yayılır ve gezinir', () => {
        const { ekran, navigation } = kur('kenar');
        fireEvent.press(ekran.getByLabelText('Ayarlar, yeni'));
        expect(navigation.emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'tabPress', target: 'b' }));
        expect(navigation.navigate).toHaveBeenCalledWith('Ayarlar', undefined);
    });

    it('sade görünüm sekme çubuğunu gizlediğinde kenar da çizilmez', () => {
        const { ekran } = kur('kenar', { tabBarStyle: { display: 'none' } });
        expect(ekran.queryByTestId('kenar-gezinme')).toBeNull();
    });
});
