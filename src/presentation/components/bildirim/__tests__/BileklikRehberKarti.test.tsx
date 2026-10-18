/**
 * Bileklik rehberi (issue #287): yalnız Android, akordiyon, kategori ekranı köprüsü.
 */
import React from 'react';
import { Linking, Platform } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import { BileklikRehberKarti, bildirimKategorileriniAc } from '../BileklikRehberKarti';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});

const mockCihaz: { samsung: boolean | null } = { samsung: null };
jest.mock('../../../hooks/useCihazDurumu', () => ({
    useCihazDurumu: () => ({ durum: mockCihaz, yenile: jest.fn() }),
}));

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
};

describe('BileklikRehberKarti', () => {
    beforeEach(() => {
        (useRenkler as jest.Mock).mockReturnValue(RENKLER);
        jest.restoreAllMocks();
    });

    it('iOS: hiç çizilmez (bileklik aynalama rehberi Android içindir)', () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const ekran = render(<BileklikRehberKarti />);
        expect(ekran.queryByTestId('bileklik-rehberi')).toBeNull();
    });

    it('Android: kapalı başlar, dokununca adımlar ve düğme görünür', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const ekran = render(<BileklikRehberKarti />);
        expect(ekran.getByText('Bilekliğinize yalnız namaz hatırlatmalarını gönderin')).toBeTruthy();
        expect(ekran.queryByTestId('bileklik-rehberi-kategoriler')).toBeNull();
        fireEvent.press(ekran.getByTestId('bileklik-rehberi-baslik'));
        expect(ekran.getByTestId('bileklik-rehberi-kategoriler')).toBeTruthy();
        // Dürüstlük: kanal bazında süzme yok, sessiz kanal "çoğu" bantta aynalanmaz.
        expect(ekran.getByText(/uygulama bazında seçer/)).toBeTruthy();
        expect(ekran.getByText(/çoğu bilekliğe aktarılmaz/)).toBeTruthy();
    });

    it('Samsung Rutinler maddesi yalnız Samsung’da (bilinmiyorsa kalır)', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        mockCihaz.samsung = false;
        const ekran = render(<BileklikRehberKarti />);
        fireEvent.press(ekran.getByTestId('bileklik-rehberi-baslik'));
        expect(ekran.queryByText(/Samsung Rutinler/)).toBeNull();
        mockCihaz.samsung = null;
        const ikinci = render(<BileklikRehberKarti />);
        fireEvent.press(ikinci.getAllByTestId('bileklik-rehberi-baslik')[0]);
        expect(ikinci.getByText(/Samsung Rutinler/)).toBeTruthy();
    });

    it('düğme uygulamanın bildirim kategorileri ekranını açar', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const gonder = jest.spyOn(Linking, 'sendIntent').mockResolvedValue(undefined);
        const ekran = render(<BileklikRehberKarti />);
        fireEvent.press(ekran.getByTestId('bileklik-rehberi-baslik'));
        fireEvent.press(ekran.getByTestId('bileklik-rehberi-kategoriler'));
        await waitFor(() =>
            expect(gonder).toHaveBeenCalledWith('android.settings.APP_NOTIFICATION_SETTINGS', [
                { key: 'android.provider.extra.APP_PACKAGE', value: 'com.furkanisikay.namazakisi' },
                { key: 'app_package', value: 'com.furkanisikay.namazakisi' },
            ])
        );
    });

    it('kategori ekranı açılamazsa uygulama ayarlarına düşer', async () => {
        jest.spyOn(Linking, 'sendIntent').mockRejectedValue(new Error('yok'));
        const ayarlar = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
        await bildirimKategorileriniAc();
        expect(ayarlar).toHaveBeenCalledTimes(1);
    });
});
