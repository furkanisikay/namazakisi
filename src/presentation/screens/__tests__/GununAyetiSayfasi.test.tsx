/**
 * Günün ayeti sayfası — bugünün ayeti widget'la aynı seçimden gelir, künye ve meal kaynağı
 * görünür, paylaşılan metin atıfı taşır; İngilizcede Türkçe metin kalmaz.
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';
import { GununAyetiSayfasi, ayetPaylasimMetni } from '../GununAyetiSayfasi';
import { aktifNamazGunu, gununAyetiGorunumu, gununAyetiKaydi, isoGun } from '../../../core/icerik/gununAyeti';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const mockNavigate = jest.fn();
jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#fff', kartArkaplan: '#eee', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc' }),
    KOYU_TEMA: { renkler: { arkaplan: '#121212', metin: '#fff', metinIkincil: '#bbb' } },
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: { koordinatlar: { lat: 0, lng: 0 } } }),
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../Ayarlar/AyarSatiri', () => {
    const { Text: T } = require('react-native');
    return {
        AyarSatiri: ({ baslik, ozet, onPress }: { baslik: string; ozet?: string; onPress?: () => void }) => (
            <T onPress={onPress}>{`${baslik} | ${ozet ?? ''}`}</T>
        ),
    };
});

/** Konum yokken (0,0) gün sınırı yerel 05:00. */
const bugununAyeti = (dil: 'tr' | 'en') =>
    gununAyetiGorunumu(gununAyetiKaydi(isoGun(aktifNamazGunu(new Date(), () => null))), dil);

describe('GununAyetiSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('bugünün ayetini künyesiyle gösterir; ayar satırı ayar sayfasına gider', () => {
        const a = bugununAyeti('tr');
        const e = render(<GununAyetiSayfasi />);
        expect(e.getAllByText(a.kisaKunye).length).toBeGreaterThan(0);
        expect(e.getAllByText(a.tamKunye).length).toBeGreaterThan(0);
        expect(e.getAllByText(a.meal as string).length).toBeGreaterThan(0);
        expect(e.getByText(/^Dün/)).toBeTruthy();
        fireEvent.press(e.getByText(/^Widget ve duvar kâğıdı/));
        expect(mockNavigate).toHaveBeenCalledWith('GununAyetiAyarlari');
    });

    it('metin paylaşımı Arapça, meal ve meal kaynağını birlikte gönderir', () => {
        const paylas = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
        const e = render(<GununAyetiSayfasi />);
        fireEvent.press(e.getByTestId('gunun-ayeti-metin-paylas'));
        expect(paylas).toHaveBeenCalledWith({ message: ayetPaylasimMetni(bugununAyeti('tr')) });
    });

    it('Tanzil bağlantısı sabit https adresini açar', () => {
        const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
        const e = render(<GununAyetiSayfasi />);
        fireEvent.press(e.getByTestId('gunun-ayeti-tanzil'));
        expect(ac).toHaveBeenCalledWith('https://tanzil.net/');
    });

    it('ayetPaylasimMetni: atıf satırları her zaman sonda', () => {
        const a = bugununAyeti('tr');
        const satirlar = ayetPaylasimMetni(a).split('\n');
        expect(satirlar[0]).toBe(a.ar);
        expect(satirlar.slice(-2)).toEqual([a.kisaKunye, a.mealKaynagi]);
    });

    describe('İngilizce', () => {
        let geriAl: () => void;
        beforeEach(() => {
            geriAl = ingilizceyeGec();
        });
        afterEach(() => act(() => geriAl()));

        it('Türkçe metin kalmaz, İngilizce meal ve künye çizilir', () => {
            const a = bugununAyeti('en');
            const e = render(<GununAyetiSayfasi />);
            expect(turkceKalanlar(e.toJSON() as never, ['Günün', 'Kur'])).toEqual([]);
            expect(e.getAllByText(a.meal as string).length).toBeGreaterThan(0);
            expect(e.getByText(/^Yesterday/)).toBeTruthy();
        });
    });
});
