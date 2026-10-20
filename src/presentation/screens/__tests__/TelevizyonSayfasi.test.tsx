/**
 * Televizyonda gösterin — QR ile aktarma, hata yönlendirmesi, ağsız kod ve derin bağlantı.
 * Platform Android'e çekilir (jest varsayılanı iOS): Android yolu native köprüden geçer.
 */
import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TelevizyonSayfasi } from '../TelevizyonSayfasi';
import { useRenkler } from '../../../core/theme';

const kopru = require('../../../../modules/expo-tv-esleme/src');
const kamera = require('expo-camera');

const mockRoute: { params?: Record<string, string> } = {};
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockKonum: { lat: number; lng: number } = { lat: 40.9903, lng: 29.0291 };

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, setParams: mockSetParams }),
    useRoute: () => mockRoute,
}));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) =>
        sec({
            konum: {
                konumModu: 'oto',
                gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' },
                seciliIlceAdi: '',
                seciliIlAdi: '',
                koordinatlar: mockKonum,
            },
        }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Rect: 'Rect' }));

const QR = 'namazakisi://tv?v=1&a=192.168.1.23&p=47123&k=0123456789abcdef';

describe('TelevizyonSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336',
        });
        kamera.__izinAyarla({ granted: true, status: 'granted' });
        kopru.tvEslemeModuluVarMi.mockReturnValue(true);
        kopru.qrOku.mockResolvedValue(QR);
        kopru.tvyeGonder.mockResolvedValue('{"ok":true}');
        mockRoute.params = undefined;
        mockKonum = { lat: 40.9903, lng: 29.0291 };
    });

    afterEach(() => jest.restoreAllMocks());

    it('ağsız yedek kodu gösterir (telefon ↔ TV aynı kodlama)', () => {
        const { getByTestId } = render(<TelevizyonSayfasi />);
        expect(getByTestId('tv-konum-kodu').props.children).toBe('167 6907');
    });

    it('QR okunur, konum yerel ağdaki TV\'ye gider ve sonuç söylenir', async () => {
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toBe('TV artık Kadıköy, İstanbul vakitlerini gösteriyor.'));
        expect(kopru.tvyeGonder).toHaveBeenCalledTimes(1);
        const [adres, port, govde] = kopru.tvyeGonder.mock.calls[0];
        expect([adres, port]).toEqual(['192.168.1.23', 47123]);
        expect(JSON.parse(govde)).toMatchObject({ v: 1, k: '0123456789abcdef', ad: 'Kadıköy, İstanbul', lat: 40.9903, lng: 29.0291 });
    });

    it('başka bir QR yönlendirici bir hatayla reddedilir, hiçbir şey gönderilmez', async () => {
        kopru.qrOku.mockResolvedValue('https://ornek.com');
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/Namaz Akışı TV'ye ait değil/));
        expect(kopru.tvyeGonder).not.toHaveBeenCalled();
    });

    it('süresi dolmuş QR: TV\'de yeni kodu okutmasını söyler', async () => {
        kopru.tvyeGonder.mockResolvedValue('{"ok":false,"hata":"anahtar"}');
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/süresi doldu/));
    });

    it('kamera izni yoksa tarayıcı açılmaz; izin ya da kod yolu söylenir', async () => {
        kamera.__izinAyarla({ granted: false, status: 'denied' });
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/kamera izni gerekir/));
        expect(kopru.qrOku).not.toHaveBeenCalled();
    });

    it('iptal edilen taramada hiçbir şey olmaz', async () => {
        kopru.qrOku.mockResolvedValue(null);
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(kopru.qrOku).toHaveBeenCalled());
        expect(getByTestId('tv-sonuc').props.children).toMatch(/Hazır/);
        expect(kopru.tvyeGonder).not.toHaveBeenCalled();
    });

    it('derin bağlantı (iPhone kamerası) gönderimi kendiliğinden başlatır', async () => {
        mockRoute.params = { v: '1', a: '192.168.1.23', p: '47123', k: '0123456789abcdef' };
        const { getByTestId } = render(<TelevizyonSayfasi />);
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/TV artık/));
        expect(kopru.tvyeGonder).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalled();
    });

    it('konum yoksa önce konumu belirlemeye yönlendirir, okutma düğmesi yok', () => {
        mockKonum = { lat: 0, lng: 0 };
        const { getByText, queryByTestId } = render(<TelevizyonSayfasi />);
        expect(getByText('Önce konumunuzu belirleyin')).toBeTruthy();
        expect(queryByTestId('tv-kodu-okut')).toBeNull();
        fireEvent.press(getByText('Konum ayarlarını açın'));
        expect(mockNavigate).toHaveBeenCalledWith('KonumAyarlari');
    });
});
