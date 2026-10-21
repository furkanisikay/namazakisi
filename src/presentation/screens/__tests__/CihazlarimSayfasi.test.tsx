/**
 * Cihazlarım — TV listesi, durum, iki anahtar, kaldırma (onaylı), boş durum.
 * Depo ve eşitleme servisi mock'lanır; ekran yalnız onların sözleşmesini kullanır.
 */
import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { CihazlarimSayfasi } from '../CihazlarimSayfasi';
import { useRenkler } from '../../../core/theme';
import type { CihazUyeligi } from '../../../data/local/CihazAgiDeposu';

const mockNavigate = jest.fn();
const mockListe = jest.fn();
const mockGuncelle = jest.fn();
const mockGonder = jest.fn();
const mockKaldir = jest.fn();

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: () => void | (() => void)) => {
        const React = require('react');
        React.useEffect(cb, [cb]);
    },
}));
jest.mock('../../../data/local/CihazAgiDeposu', () => ({
    CihazAgiDeposu: { liste: () => mockListe(), guncelle: (...a: unknown[]) => mockGuncelle(...a) },
}));
jest.mock('../../../domain/services/TvSenkronServisi', () => ({
    TvSenkronServisi: { getInstance: () => ({ gonder: () => mockGonder(), kaldir: (k: string) => mockKaldir(k) }) },
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});

const tv = (o: Partial<CihazUyeligi> = {}): CihazUyeligi => ({
    tur: 'tv',
    aliciKimlik: '0123456789abcdef',
    aliciAdi: 'Salon TV',
    uye: 'fedcba9876543210',
    anahtar: 'AAAA',
    adres: '192.168.1.23',
    port: 47123,
    n: 3,
    durumumSayilsin: false,
    tvHatirlat: true,
    eklenmeMs: 1,
    sonEsitlemeMs: Date.now() - 5 * 60000,
    durum: 'tamam',
    ...o,
});

describe('CihazlarimSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.replaceProperty(Platform, 'OS', 'android');
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50',
        });
        // Durumlu sahte depo: ekran yazdıktan sonra yeniden okuduğunda yazdığını görmeli.
        let kayit = tv();
        mockListe.mockImplementation(async () => [kayit]);
        mockGuncelle.mockImplementation(async (_k: string, d: Partial<CihazUyeligi>) => (kayit = { ...kayit, ...d }));
        mockGonder.mockResolvedValue({});
        mockKaldir.mockResolvedValue(undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    it('TV adını, son eşitlemeyi ve dürüst vaadi gösterir; odakta bir eşitleme turu başlatır', async () => {
        const { findByTestId, getByTestId, getAllByText } = render(<CihazlarimSayfasi />);
        expect((await findByTestId('cihaz-durum-0123456789abcdef')).props.children).toBe('Son eşitleme 5 dk önce');
        expect(getAllByText('Salon TV').length).toBeGreaterThan(0);
        expect(getByTestId('cihazlarim-vaat').props.children).toMatch(/15 dakikalık kontrolde/);
        expect(mockGonder).toHaveBeenCalled();
    });

    it('"durumum sayılsın" kapalıyken hatırlatma anahtarı pasiftir; açınca kaydedilip gönderilir', async () => {
        const { findByTestId, getByTestId } = render(<CihazlarimSayfasi />);
        const sayilsin = await findByTestId('cihaz-sayilsin-0123456789abcdef');
        expect(getByTestId('cihaz-hatirlat-0123456789abcdef')).toBeDisabled();
        mockGonder.mockClear();
        fireEvent(sayilsin, 'valueChange', true);
        await waitFor(() => expect(mockGuncelle).toHaveBeenCalledWith('0123456789abcdef', { durumumSayilsin: true }));
        await waitFor(() => expect(mockGonder).toHaveBeenCalled());
        await waitFor(() => expect(getByTestId('cihaz-hatirlat-0123456789abcdef')).not.toBeDisabled());
    });

    it('Kaldırın: önce onay ister, onaydan sonra iki uçtan kaldırır', async () => {
        const { findByLabelText, getByText, getAllByText } = render(<CihazlarimSayfasi />);
        fireEvent.press(await findByLabelText("Salon TV TV'sini kaldırın"));
        expect(getByText('Bu TV kaldırılsın mı?')).toBeTruthy();
        expect(mockKaldir).not.toHaveBeenCalled();
        // Kartın düğmesi ile modalın birincil düğmesi aynı adı taşır; sonuncusu modaldır.
        const dugmeler = getAllByText('Kaldırın');
        fireEvent.press(dugmeler[dugmeler.length - 1]);
        await waitFor(() => expect(mockKaldir).toHaveBeenCalledWith('0123456789abcdef'));
    });

    it('reddedilen TV için yeniden ekleme yolunu gösterir', async () => {
        mockListe.mockResolvedValue([tv({ durum: 'reddedildi' })]);
        const { findByLabelText, queryByTestId } = render(<CihazlarimSayfasi />);
        fireEvent.press(await findByLabelText("Salon TV TV'sini yeniden ekleyin"));
        expect(mockNavigate).toHaveBeenCalledWith('TelevizyonAyarlari');
        expect(queryByTestId('cihaz-sayilsin-0123456789abcdef')).toBeNull();
    });

    it('TV yoksa boş durum + TV ekleyin', async () => {
        mockListe.mockResolvedValue([]);
        const { findByTestId, getByTestId } = render(<CihazlarimSayfasi />);
        await findByTestId('cihazlarim-bos');
        fireEvent.press(getByTestId('cihazlarim-tv-ekle'));
        expect(mockNavigate).toHaveBeenCalledWith('TelevizyonAyarlari');
    });
});
