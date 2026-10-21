/**
 * iOS yolu: VisionKit tarayıcısı OLAYLA bildirir. Kullanıcı tarayıcıyı kendisi kapatırsa JS'e
 * hiçbir olay gelmez → düğme kilitlenmemeli (jest varsayılan platformu iOS).
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { TelevizyonSayfasi } from '../TelevizyonSayfasi';
import { useRenkler } from '../../../core/theme';

const mockOkumaDinleyicileri: ((olay: { data: string }) => void)[] = [];
const mockLaunch = jest.fn(async () => undefined);
const mockDismiss = jest.fn(async () => undefined);
const mockFetch = jest.fn();

jest.mock('expo-camera', () => ({
    CameraView: {
        launchScanner: (...a: unknown[]) => mockLaunch(...(a as [])),
        dismissScanner: () => mockDismiss(),
        onModernBarcodeScanned: (cb: (olay: { data: string }) => void) => {
            mockOkumaDinleyicileri.push(cb);
            return { remove: () => mockOkumaDinleyicileri.splice(mockOkumaDinleyicileri.indexOf(cb), 1) };
        },
    },
    Camera: { requestCameraPermissionsAsync: async () => ({ granted: true }) },
}));
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), setParams: jest.fn() }),
    useRoute: () => ({}),
}));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) =>
        sec({
            konum: {
                konumModu: 'manuel',
                gpsAdres: null,
                seciliIlceAdi: 'Şahinbey',
                seciliIlAdi: 'Gaziantep',
                koordinatlar: { lat: 37.06, lng: 37.38 },
            },
        }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
const mockEsles = jest.fn(async () => 'onay');
jest.mock('../../../domain/services/CihazEslesmeServisi', () => ({ esles: (...a: unknown[]) => (mockEsles as (...x: unknown[]) => unknown)(...a) }));
jest.mock('../../../domain/services/TvSenkronServisi', () => ({ TvSenkronServisi: { getInstance: () => ({ gonder: async () => ({}) }) } }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Rect: 'Rect' }));

describe('TelevizyonSayfasi (iOS)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOkumaDinleyicileri.length = 0;
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#eee', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336',
        });
        mockFetch.mockResolvedValue({ text: async () => '{"ok":true}' });
        (global as unknown as { fetch: unknown }).fetch = mockFetch;
    });

    it('tarayıcı kapatılırsa (olay gelmez) düğme yeniden basılabilir', async () => {
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(mockLaunch).toHaveBeenCalledTimes(1));
        await act(async () => {
            await Promise.resolve();
        });
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(mockLaunch).toHaveBeenCalledTimes(2));
    });

    it('okunan TV kodu tarayıcıyı kapatır, onaydan sonra eşleşir; başka QR yok sayılır', async () => {
        const { getByTestId, findByText, getByText } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(mockLaunch).toHaveBeenCalled());
        act(() => mockOkumaDinleyicileri.forEach((cb) => cb({ data: 'https://ornek.com' })));
        expect(mockFetch).not.toHaveBeenCalled();
        act(() =>
            mockOkumaDinleyicileri.forEach((cb) =>
                cb({ data: 'namazakisi://tv?v=2&a=192.168.1.23&p=47123&i=0123456789abcdef&s=AwoRGB8mLTQ7QklQV15lbHN6gYiPlp2kq7K5wMfO1dw&d=Salon%20TV' }),
            ),
        );
        expect(mockDismiss).toHaveBeenCalled();
        await findByText(/Şu TV'ye bağlanıyorsunuz: Salon TV/);
        expect(mockEsles).not.toHaveBeenCalled();
        fireEvent.press(getByText('Bağlanın'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/Salon TV eklendi\. TV artık Şahinbey, Gaziantep/));
    });
});
