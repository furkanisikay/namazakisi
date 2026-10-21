import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { anaAyrintiYerlesimiOlustur, useAnaAyrintiSecimi } from '../AnaAyrintiDuzeni';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => ({ width: 1366, height: 1024, scale: 2, fontScale: 1 })),
}));
const pencere = require('react-native/Libraries/Utilities/useWindowDimensions').default as jest.Mock;

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ birincil: '#4CAF50', birincilMetin: '#FFFFFF', arkaplan: '#F5F5F5', sinir: '#DDD', metin: '#111' }),
}));

const Liste = () => {
    const nav = useNavigation<{ navigate: (ad: string) => void }>();
    const secili = useAnaAyrintiSecimi();
    return (
        <Pressable onPress={() => nav.navigate('Muhafiz')}>
            <Text>liste</Text>
            <Text>{`secili:${secili ?? 'yok'}`}</Text>
        </Pressable>
    );
};
const SeciliOkuyucu = () => <Text>{`secili:${useAnaAyrintiSecimi() ?? 'yok'}`}</Text>;
const Varsayilan = () => <Text>varsayilan-sayfa</Text>;

const Yerlesim = anaAyrintiYerlesimiOlustur({
    anaRota: 'Kok',
    Ana: Liste,
    Varsayilan,
    varsayilanRota: 'Hatirlatmalar',
    varsayilanBaslik: 'Hatırlatmalar',
    basliklar: { Muhafiz: 'Vakit çıkmadan', Alt: 'Alt sayfa' },
});

const navKur = (rotalar: string[]) => ({
    navigate: jest.fn(),
    popTo: jest.fn(),
    goBack: jest.fn(),
    getState: () => ({ index: rotalar.length - 1, routes: rotalar.map((name) => ({ name })) }),
});

describe('AnaAyrintiDuzeni', () => {
    beforeEach(() => pencere.mockReturnValue({ width: 1366, height: 1024, scale: 2, fontScale: 1 }));

    it('kökteyken solda liste (ekranın kendisi), sağda varsayılan sayfa ve başlığı', () => {
        const nav = navKur(['Kok']);
        const e = render(
            <Yerlesim route={{ name: 'Kok' }} navigation={nav}>
                <Text>kok-ekrani</Text>
            </Yerlesim>
        );
        expect(e.getByTestId('ana-ayrinti')).toBeTruthy();
        expect(e.getByText('kok-ekrani')).toBeTruthy();
        expect(e.getByText('varsayilan-sayfa')).toBeTruthy();
        expect(e.getByText('Hatırlatmalar')).toBeTruthy();
        expect(e.queryByLabelText('Geri')).toBeNull();
    });

    it('ayrıntıdayken listeden seçim yığını köke indirip yeni sayfayı açar', () => {
        const nav = navKur(['Kok', 'Muhafiz']);
        const e = render(
            <Yerlesim route={{ name: 'Muhafiz' }} navigation={nav}>
                <Text>muhafiz-ekrani</Text>
            </Yerlesim>
        );
        expect(e.getByText('Vakit çıkmadan')).toBeTruthy();
        fireEvent.press(e.getByText('liste'));
        expect(nav.popTo).toHaveBeenCalledWith('Kok');
        expect(nav.navigate).toHaveBeenCalledWith('Muhafiz');
    });

    it('ayrıntının alt sayfasında başlıkta geri oku çıkar', () => {
        const nav = navKur(['Kok', 'Muhafiz', 'Alt']);
        const e = render(
            <Yerlesim route={{ name: 'Alt' }} navigation={nav}>
                <Text>alt</Text>
            </Yerlesim>
        );
        fireEvent.press(e.getByLabelText('Geri'));
        expect(nav.goBack).toHaveBeenCalled();
    });

    it('listeye açık ayrıntının KÖK rotası seçili olarak verilir (alt sayfada da)', () => {
        const kok = render(
            <Yerlesim route={{ name: 'Kok' }} navigation={navKur(['Kok'])}>
                <SeciliOkuyucu />
            </Yerlesim>
        );
        expect(kok.getByText('secili:Hatirlatmalar')).toBeTruthy();
        const alt = render(
            <Yerlesim route={{ name: 'Alt' }} navigation={navKur(['Kok', 'Muhafiz', 'Alt'])}>
                <Text>alt</Text>
            </Yerlesim>
        );
        expect(alt.getByText('secili:Muhafiz')).toBeTruthy();
    });

    it('dar pencerede (telefon, Split View) ana-ayrıntı yok: yalnız ekran', () => {
        pencere.mockReturnValue({ width: 700, height: 1024, scale: 2, fontScale: 1 });
        const e = render(
            <Yerlesim route={{ name: 'Muhafiz' }} navigation={navKur(['Kok', 'Muhafiz'])}>
                <Text>muhafiz-ekrani</Text>
            </Yerlesim>
        );
        expect(e.queryByTestId('ana-ayrinti')).toBeNull();
        expect(e.queryByText('liste')).toBeNull();
        expect(e.getByText('muhafiz-ekrani')).toBeTruthy();
    });
});
