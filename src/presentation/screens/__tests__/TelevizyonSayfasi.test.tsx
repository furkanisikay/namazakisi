/**
 * TV ekleyin (eşleştirme v2) — QR okuma, BU telefonda onay (derin bağlantı dahil, denetim D-01),
 * eski TV uyarısı, ağsız kod. Platform Android'e çekilir (jest varsayılanı iOS).
 */
import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { TelevizyonSayfasi } from '../TelevizyonSayfasi';
import { useRenkler } from '../../../core/theme';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const kopru = require('../../../../modules/expo-tv-esleme/src');
const kamera = require('expo-camera');

const mockRoute: { params?: Record<string, string> } = {};
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockEsles = jest.fn();
const mockTvGonder = jest.fn();
let mockKonum: { lat: number; lng: number } = { lat: 40.9903, lng: 29.0291 };
let mockGpsAdres = { ilce: 'Kadıköy', il: 'İstanbul' };

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, setParams: mockSetParams }),
    useRoute: () => mockRoute,
}));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) =>
        sec({
            konum: { konumModu: 'oto', gpsAdres: mockGpsAdres, seciliIlceAdi: '', seciliIlAdi: '', koordinatlar: mockKonum },
        }),
}));
jest.mock('../../../domain/services/CihazEslesmeServisi', () => ({ esles: (...a: unknown[]) => mockEsles(...a) }));
jest.mock('../../../domain/services/TvSenkronServisi', () => ({
    TvSenkronServisi: { getInstance: () => ({ gonder: (...a: unknown[]) => mockTvGonder(...a) }) },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Rect: 'Rect' }));

const SIR = 'AwoRGB8mLTQ7QklQV15lbHN6gYiPlp2kq7K5wMfO1dw';
const QR = `namazakisi://tv?v=2&a=192.168.1.23&p=47123&i=0123456789abcdef&s=${SIR}&d=Salon%20TV`;

describe('TelevizyonSayfasi (v2)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50',
        });
        kamera.__izinAyarla({ granted: true, status: 'granted' });
        kopru.tvEslemeModuluVarMi.mockReturnValue(true);
        kopru.qrOku.mockResolvedValue(QR);
        mockEsles.mockResolvedValue('onay');
        mockTvGonder.mockResolvedValue({});
        mockRoute.params = undefined;
        mockKonum = { lat: 40.9903, lng: 29.0291 };
    });

    afterEach(() => jest.restoreAllMocks());

    it('ağsız yedek kodu gösterir', () => {
        const { getByTestId } = render(<TelevizyonSayfasi />);
        expect(getByTestId('tv-konum-kodu').props.children).toBe('167 6907');
    });

    it('QR okununca önce BU telefonda TV adıyla onay ister; onaydan sonra eşleşir ve ilk eşitlemeyi yollar', async () => {
        const { getByTestId, getByText, findByText } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await findByText(/Şu TV'ye bağlanıyorsunuz: Salon TV/);
        expect(mockEsles).not.toHaveBeenCalled();
        fireEvent.press(getByText('Bağlanın'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toBe('Salon TV eklendi. TV artık Kadıköy, İstanbul vakitlerini gösteriyor.'));
        expect(mockEsles.mock.calls[0][0]).toMatchObject({ adres: '192.168.1.23', port: 47123, aliciKimlik: '0123456789abcdef', aliciAdi: 'Salon TV' });
        expect(mockTvGonder).toHaveBeenCalledWith(true);
    });

    it('Vazgeçin: hiçbir şey gönderilmez', async () => {
        const { getByTestId, getByText, findByText } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await findByText(/Şu TV'ye bağlanıyorsunuz/);
        fireEvent.press(getByText('Vazgeçin'));
        expect(mockEsles).not.toHaveBeenCalled();
    });

    it('NÖBETÇİ (denetim D-01): derin bağlantı onaysız GÖNDERMEZ, yalnız onay ekranını açar', async () => {
        mockRoute.params = { v: '2', a: '192.168.1.23', p: '47123', i: '0123456789abcdef', s: SIR, d: 'Salon TV' };
        const { findByText } = render(<TelevizyonSayfasi />);
        await findByText(/Şu TV'ye bağlanıyorsunuz: Salon TV/);
        expect(mockEsles).not.toHaveBeenCalled();
        expect(mockSetParams).toHaveBeenCalled();
    });

    it('eski (v1) TV QR\'ı: TV uygulamasını güncellemesini söyler', async () => {
        kopru.qrOku.mockResolvedValue('namazakisi://tv?v=1&a=192.168.1.23&p=47123&k=0123456789abcdef');
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/TV'deki Namaz Akışı eski/));
    });

    it('başka bir QR reddedilir', async () => {
        kopru.qrOku.mockResolvedValue('https://ornek.com');
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/Namaz Akışı TV'ye ait değil/));
        expect(mockEsles).not.toHaveBeenCalled();
    });

    it('TV\'de "Hayır" seçilirse söylenir', async () => {
        mockEsles.mockResolvedValue('red');
        const { getByTestId, getByText, findByText } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await findByText(/Şu TV'ye bağlanıyorsunuz/);
        fireEvent.press(getByText('Bağlanın'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/“Hayır” seçildi/));
    });

    it('kamera izni yoksa tarayıcı açılmaz', async () => {
        kamera.__izinAyarla({ granted: false, status: 'denied' });
        const { getByTestId } = render(<TelevizyonSayfasi />);
        fireEvent.press(getByTestId('tv-kodu-okut'));
        await waitFor(() => expect(getByTestId('tv-sonuc').props.children).toMatch(/kamera izni gerekir/));
        expect(kopru.qrOku).not.toHaveBeenCalled();
    });

    it('konum yoksa önce konumu belirlemeye yönlendirir', () => {
        mockKonum = { lat: 0, lng: 0 };
        const { getByText, queryByTestId } = render(<TelevizyonSayfasi />);
        expect(getByText('Önce konumunuzu belirleyin')).toBeTruthy();
        expect(queryByTestId('tv-kodu-okut')).toBeNull();
    });
});

describe('TelevizyonSayfasi — İngilizce', () => {
    const YASAKLI = ['Kodu', 'okutun', 'Ekleyin', 'Vazge', 'Konum', 'Hazir'];
    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50',
        });
        kamera.__izinAyarla({ granted: true, status: 'granted' });
        kopru.tvEslemeModuluVarMi.mockReturnValue(true);
        kopru.qrOku.mockResolvedValue(QR);
        mockEsles.mockResolvedValue('onay');
        mockTvGonder.mockResolvedValue({});
        mockRoute.params = undefined;
        mockKonum = { lat: 51.5072, lng: -0.1276 };
        mockGpsAdres = { ilce: 'Westminster', il: 'London' };
    });
    afterEach(() => {
        act(() => geriAl());
        mockGpsAdres = { ilce: 'Kadıköy', il: 'İstanbul' };
        jest.restoreAllMocks();
    });
    // Marka adı ("Namaz Akışı") cümle içinde her dilde aynı kalır.
    const kalan = (agac: unknown) =>
        turkceKalanlar(agac as never, YASAKLI).filter((m) => turkceKalanlar(m.replace(/Namaz Akışı/g, ''), YASAKLI).length > 0);

    it('hazır ekran, onay ve sonuç İngilizce', async () => {
        const e = render(<TelevizyonSayfasi />);
        expect(kalan(e.toJSON())).toEqual([]);
        fireEvent.press(e.getByTestId('tv-kodu-okut'));
        await e.findByText(/You're connecting to the TV: Salon TV/);
        expect(kalan(e.toJSON())).toEqual([]);
        fireEvent.press(e.getByText('Connect'));
        await waitFor(() => expect(e.getByTestId('tv-sonuc').props.children).toBe('Salon TV added. The TV now shows prayer times for Westminster, London.'));
        expect(kalan(e.toJSON())).toEqual([]);
    });

    it('hatalar İngilizce', async () => {
        mockEsles.mockResolvedValue('ulasilamadi');
        const e = render(<TelevizyonSayfasi />);
        fireEvent.press(e.getByTestId('tv-kodu-okut'));
        fireEvent.press(await e.findByText('Connect'));
        await waitFor(() => expect(e.getByTestId('tv-sonuc').props.children).toMatch(/^The TV couldn't be reached/));
        expect(kalan(e.toJSON())).toEqual([]);
    });

    it('konum yoksa İngilizce yönlendirme', () => {
        mockKonum = { lat: 0, lng: 0 };
        const e = render(<TelevizyonSayfasi />);
        expect(e.getByText('Set your location first')).toBeTruthy();
        expect(kalan(e.toJSON())).toEqual([]);
    });
});
