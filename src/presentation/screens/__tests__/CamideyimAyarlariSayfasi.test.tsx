/**
 * Camideyim (#297) + Namaz modu (#277) ayar sayfaları — köprü (native) mock'lu.
 *
 * Ölçülenler: köprü yoksa açıklayıcı boş durum; açmak "Her zaman" konum izni
 * yoksa ÖNCE açıklama (Prominent Disclosure) gösterir; yer satırında "cami değil"
 * native'e doğru kaydı yazar; Namaz modu erişimi yoksa rehber çıkar.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import * as kopru from '../../../../modules/expo-cami-geofence/src';

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../../domain/services/CamideyimServisi', () => ({
    CamideyimServisi: { getInstance: () => ({ planlariGonder: jest.fn(() => Promise.resolve()) }) },
}));

import { CamideyimAyarlariSayfasi } from '../CamideyimAyarlariSayfasi';
import { NamazModuAyarlariSayfasi } from '../NamazModuAyarlariSayfasi';

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const k = kopru as jest.Mocked<typeof kopru>;
const L = Location as jest.Mocked<typeof Location>;

const MOD_DURUMU = {
    destek: 'kural' as const,
    erisim: true,
    kuralVar: true,
    aktif: false,
    ayarlar: { etkin: true, cuma: true, vakit: false, vakitSureDk: 20, kildimKapat: true },
};

const NATIVE_DURUM = {
    veriVar: true,
    kayitSayisi: 3,
    veriZamani: 0,
    izin: 'tamam' as const,
    izlenenSayisi: 3,
    camide: null,
    sessizBitisMs: 0,
    namazModu: MOD_DURUMU,
};

beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
        sec({ konum: { koordinatlar: { lat: 41.01, lng: 28.97 } } })
    );
    k.camiModuluVarMi.mockReturnValue(true);
    k.ayarlariAl.mockResolvedValue({ aktif: false });
    k.durumAl.mockResolvedValue(NATIVE_DURUM);
    k.gunlukAl.mockResolvedValue([]);
    k.yakinCamiler.mockResolvedValue([]);
    k.ayarlariYaz.mockResolvedValue('kuruldu');
    k.namazModuDurumu.mockResolvedValue(MOD_DURUMU);
    k.namazModuAyarlariniYaz.mockResolvedValue('tamam');
});

const bosalt = () => act(async () => {
    await Promise.resolve();
    await Promise.resolve();
});

describe('CamideyimAyarlariSayfasi', () => {
    it('köprü yoksa (iOS) açıklayıcı boş durum, ayar yok', async () => {
        k.camiModuluVarMi.mockReturnValue(false);
        const e = render(<CamideyimAyarlariSayfasi />);
        await bosalt();
        expect(e.getByText('Camideyim yalnız Android telefonlarda kullanılabilir.')).toBeTruthy();
        expect(e.queryByTestId('camideyim-ana')).toBeNull();
    });

    it('"Her zaman" izni yoksa açmak ÖNCE açıklamayı gösterir; native henüz yazılmaz', async () => {
        L.getBackgroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamideyimAyarlariSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Camideyim'), 'valueChange', true);
        await waitFor(() => expect(e.getByText('Camideyim için Konum')).toBeTruthy());
        expect(k.ayarlariYaz).not.toHaveBeenCalled();
    });

    it('izin varsa doğrudan açılır ve izleme merkezi konumdur', async () => {
        L.getBackgroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
        const e = render(<CamideyimAyarlariSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Camideyim'), 'valueChange', true);
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect(k.ayarlariYaz.mock.calls[0][0]).toMatchObject({ aktif: true });
        expect(k.ayarlariYaz.mock.calls[0][1]).toEqual({ lat: 41.01, lng: 28.97 });
    });

    it('yakın cami listesi: "Cami değil" hariç kaydı yazar', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Kare Camii', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137 },
        ]);
        const e = render(<CamideyimAyarlariSayfasi />);
        await waitFor(() => expect(e.getByText('Kare Camii')).toBeTruthy());
        fireEvent.press(e.getByTestId('cami-osm:w1'));
        expect(e.getByText(/bina sınırı kullanılıyor/)).toBeTruthy();
        fireEvent.press(e.getByLabelText('Kare Camii: cami değil'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect((k.ayarlariYaz.mock.calls[0][0] as { yerler: unknown }).yerler).toEqual({ 'osm:w1': { durum: 'haric', ad: 'Kare Camii' } });
    });

    it('son algılamalar: neden algılanmadığını yazar', async () => {
        k.gunlukAl.mockResolvedValue([{ zamanMs: Date.now(), tur: 'olcum', sonuc: 'supheli', dogrulukM: 48 }]);
        const e = render(<CamideyimAyarlariSayfasi />);
        await waitFor(() => expect(e.getByText('Ölçüm yeterince hassas değildi')).toBeTruthy());
    });

    it('cami verisi yokken kendi yerlerin yine çalıştığı söylenir', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.durumAl.mockResolvedValue({ ...NATIVE_DURUM, veriVar: false });
        const e = render(<CamideyimAyarlariSayfasi />);
        await waitFor(() => expect(e.getByText(/Bu sürümde cami verisi yok/)).toBeTruthy());
    });
});

describe('NamazModuAyarlariSayfasi', () => {
    it('etkinken tetikler görünür; cuma kapatılınca native\'e yazılır', async () => {
        const e = render(<NamazModuAyarlariSayfasi />);
        await waitFor(() => expect(e.getByText('Cuma hutbesi')).toBeTruthy());
        fireEvent(e.getByLabelText('Cuma hutbesi'), 'valueChange', false);
        await waitFor(() => expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ cuma: false })));
    });

    it('erişim yoksa uyarı ve rehber; rehberden ayar ekranı açılır', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, erisim: false });
        k.erisimAyariniAc.mockResolvedValue(true);
        const e = render(<NamazModuAyarlariSayfasi />);
        await waitFor(() => expect(e.getByTestId('namaz-modu-erisim-uyarisi')).toBeTruthy());
        fireEvent.press(e.getByTestId('namaz-modu-erisim-uyarisi'));
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Erişim ayarını açın'));
        await waitFor(() => expect(k.erisimAyariniAc).toHaveBeenCalled());
    });

    it('etkinleştirme erişim yüzünden kurulamazsa rehber kendiliğinden açılır', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, ayarlar: { ...MOD_DURUMU.ayarlar, etkin: false } });
        k.namazModuAyarlariniYaz.mockResolvedValue('erisimYok');
        const e = render(<NamazModuAyarlariSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Namaz modunu kullanın'), 'valueChange', true);
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
    });
});
