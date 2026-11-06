/**
 * Cihazlarım — TV listesi, durum, iki anahtar, kaldırma (onaylı), boş durum.
 * Depo ve eşitleme servisi mock'lanır; ekran yalnız onların sözleşmesini kullanır.
 */
import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { CihazlarimSayfasi } from '../CihazlarimSayfasi';
import { useRenkler } from '../../../core/theme';
import type { CihazUyeligi } from '../../../data/local/CihazAgiDeposu';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

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
const mockSaatDurumu = jest.fn();
jest.mock('../../../domain/services/CihazDurumOkuyucu', () => ({ alaniOku: () => mockSaatDurumu() }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path' }));
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
        mockSaatDurumu.mockResolvedValue(null);
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

    it('NÖBETÇİ (a11y): harita kartı tek düğüme düzleşmez; boş haritadaki "TV ekleyin" ayrı düğmedir', async () => {
        mockListe.mockResolvedValue([]);
        const { findByTestId, getAllByLabelText } = render(<CihazlarimSayfasi />);
        const harita = await findByTestId('cihazlarim-harita');
        fireEvent(harita, 'layout', { nativeEvent: { layout: { width: 360, height: 400 } } });
        expect(harita.props.accessible).toBeFalsy();
        // Harita içi düğme + sayfa altındaki birincil düğme.
        expect(getAllByLabelText('TV ekleyin').length).toBe(2);
    });

    it('harita düğümleri bağ durumunu söyler', async () => {
        const { findByLabelText, findByTestId } = render(<CihazlarimSayfasi />);
        fireEvent(await findByTestId('cihazlarim-harita'), 'layout', { nativeEvent: { layout: { width: 360, height: 400 } } });
        expect(await findByLabelText('Salon TV: bağlı · 5 dk önce')).toBeTruthy();
    });

    it('saat satırı GERÇEK durumu söyler: bağlı saat varsa haritada da düğüm olur; Wear yoksa satır gizlenir', async () => {
        mockSaatDurumu.mockResolvedValue('esli');
        const { findByTestId, findByLabelText } = render(<CihazlarimSayfasi />);
        expect((await findByTestId('cihazlarim-saat-durum')).props.children).toMatch(/kendiliğinden gider/);
        fireEvent(await findByTestId('cihazlarim-harita'), 'layout', { nativeEvent: { layout: { width: 360, height: 400 } } });
        expect(await findByLabelText('Akıllı saat: bağlı')).toBeTruthy();
    });

    it('Wear desteği olmayan telefonda saat satırı yok', async () => {
        mockSaatDurumu.mockResolvedValue('yok');
        const { findByTestId, queryByTestId } = render(<CihazlarimSayfasi />);
        await findByTestId('cihaz-durum-0123456789abcdef');
        await waitFor(() => expect(queryByTestId('cihazlarim-saat')).toBeNull());
    });
});

describe('CihazlarimSayfasi — İngilizce', () => {
    const YASAKLI = ['Televizyon', 'Tablet ve', 'Saat\\b', 'TV ekleyin', 'dk\\b', 'Kaldır', 'Vazge', 'Yeniden'];
    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
        jest.replaceProperty(Platform, 'OS', 'android');
        (useRenkler as jest.Mock).mockReturnValue({
            arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50',
        });
        mockListe.mockResolvedValue([
            tv(),
            tv({ aliciKimlik: 'aaaa', aliciAdi: 'Bedroom TV', durum: 'reddedildi' }),
            tv({ aliciKimlik: 'bbbb', aliciAdi: 'Kitchen TV', durum: 'ulasilamadi', durumumSayilsin: true }),
            tv({ tur: 'tablet', aliciKimlik: 'cccc', aliciAdi: 'Tablet', eklenmeMs: 2 }),
        ]);
        mockGonder.mockResolvedValue({});
        mockSaatDurumu.mockResolvedValue('esli');
    });
    afterEach(() => {
        act(() => geriAl());
        jest.restoreAllMocks();
    });

    it('liste, harita, saat satırı ve kaldırma onayı İngilizce', async () => {
        const e = render(<CihazlarimSayfasi />);
        fireEvent(await e.findByTestId('cihazlarim-harita'), 'layout', { nativeEvent: { layout: { width: 360, height: 400 } } });
        expect(await e.findByText('Your smartwatch is connected')).toBeTruthy();
        expect(await e.findByLabelText('Salon TV: connected · 5 min ago')).toBeTruthy();
        fireEvent.press(await e.findByLabelText('Remove the TV Salon TV'));
        expect(e.getByText('Remove this TV?')).toBeTruthy();
        expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
    });

    it('boş durum İngilizce', async () => {
        mockListe.mockResolvedValue([]);
        mockSaatDurumu.mockResolvedValue('esliDegil');
        const e = render(<CihazlarimSayfasi />);
        await e.findByTestId('cihazlarim-bos');
        expect(await e.findByText('No watch connected')).toBeTruthy();
        // Marka adı ("Namaz Akışı") cümle içinde her dilde aynı kalır.
        const kalanlar = turkceKalanlar(e.toJSON() as never, YASAKLI).filter((m) => turkceKalanlar(m.replace(/Namaz Akışı/g, ''), YASAKLI).length > 0);
        expect(kalanlar).toEqual([]);
    });
});
