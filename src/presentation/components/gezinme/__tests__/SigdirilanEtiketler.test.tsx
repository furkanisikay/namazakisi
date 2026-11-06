import React from 'react';
import { Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import {
    SigdirilanBaslik,
    sigdirilanBaslikSecenegi,
    sigdirilanSekmeTanimlari,
} from '../SigdirilanEtiketler';

const rotalar = [
    { key: 'a', name: 'AnaSayfa', params: undefined },
    { key: 'b', name: 'Ayarlar', params: undefined },
];

const tanimlar = () => ({
    a: { options: { title: 'Namaz Akışı', tabBarLabel: 'இன்று' } },
    b: { options: { tabBarLabel: 'அமைப்புகள்', tabBarAccessibilityLabel: 'Ayarlar, yeni' } },
});

type EtiketFn = (p: { focused: boolean; color: string; position: string; children: string }) => React.ReactElement;

describe('sigdirilanSekmeTanimlari', () => {
    afterEach(() => jest.restoreAllMocks());

    it('dize etiket küçülebilen tek satırlık bileşene döner; children (title) değil KENDİ dizesini çizer', () => {
        const sonuc = sigdirilanSekmeTanimlari(tanimlar() as never, rotalar as never);
        const etiket = sonuc.a.options.tabBarLabel as unknown as EtiketFn;
        expect(typeof etiket).toBe('function');
        const { getByText, queryByText } = render(
            etiket({ focused: true, color: '#4CAF50', position: 'below-icon', children: 'Namaz Akışı' })
        );
        const yazi = getByText('இன்று');
        expect(yazi.props.numberOfLines).toBe(1);
        expect(yazi.props.adjustsFontSizeToFit).toBe(true);
        expect(yazi.props.minimumFontScale).toBeLessThan(1);
        expect(queryByText('Namaz Akışı')).toBeNull();
    });

    it('özgün seçenekler değişmez (kenar gezinme dizeyi okur)', () => {
        const kaynak = tanimlar();
        sigdirilanSekmeTanimlari(kaynak as never, rotalar as never);
        expect(kaynak.a.options.tabBarLabel).toBe('இன்று');
    });

    it('iOS: kütüphanenin dize etikette kurduğu erişilebilirlik etiketi korunur; verilmiş etiket ezilmez', () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const sonuc = sigdirilanSekmeTanimlari(tanimlar() as never, rotalar as never);
        expect(sonuc.a.options.tabBarAccessibilityLabel).toBe('இன்று, tab, 1 of 2');
        expect(sonuc.b.options.tabBarAccessibilityLabel).toBe('Ayarlar, yeni');
    });

    it('Android: erişilebilirlik etiketi eklenmez (kütüphane de eklemiyor)', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const sonuc = sigdirilanSekmeTanimlari(tanimlar() as never, rotalar as never);
        expect(sonuc.a.options.tabBarAccessibilityLabel).toBeUndefined();
    });

    it('dize olmayan etikete dokunmaz', () => {
        const fn = () => <Text>x</Text>;
        const sonuc = sigdirilanSekmeTanimlari({ a: { options: { tabBarLabel: fn } } } as never, [rotalar[0]] as never);
        expect(sonuc.a.options.tabBarLabel).toBe(fn);
    });
});

describe('sigdirilanBaslik', () => {
    afterEach(() => jest.restoreAllMocks());

    it('başlık tek satırda kalır, sığmazsa küçülür', () => {
        const { getByText } = render(<SigdirilanBaslik tintColor="#FFFFFF">நேரலைக் கவுண்ட்டவுன்கள்</SigdirilanBaslik>);
        const yazi = getByText('நேரலைக் கவுண்ட்டவுன்கள்');
        expect(yazi.props.numberOfLines).toBe(1);
        expect(yazi.props.adjustsFontSizeToFit).toBe(true);
        expect(yazi.props.accessibilityRole).toBe('header');
    });

    it('yalnız Android yığınına özel başlık verilir', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        expect(typeof sigdirilanBaslikSecenegi().headerTitle).toBe('function');
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(sigdirilanBaslikSecenegi().headerTitle).toBeUndefined();
    });
});
