import * as React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazdaSessizIosSayfasi } from '../NamazdaSessizIosSayfasi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('../../store/hooks', () => ({
    useAppSelector: (secici: (s: unknown) => unknown) => secici({ konum: { koordinatlar: { lat: 41.0054, lng: 28.9768 } } }),
}));

jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        metin: '#15161A',
        metinIkincil: '#757575',
        sinir: '#E0E0E0',
    }),
    useTema: () => ({ koyuMu: false }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));

const mockCamiler = jest.fn();
jest.mock('../../../domain/services/IosCamiAramaServisi', () => ({
    yakinCamileriBul: (...a: unknown[]) => mockCamiler(...a),
}));

describe('NamazdaSessizIosSayfasi', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        mockCamiler.mockReset();
        mockCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Sultan Ahmet Camii', lat: 41.0054, lng: 28.9768, mesafeM: 120 },
            { id: 'osm:w2', ad: 'Firuz Ağa Camii', lat: 41.007, lng: 28.975, mesafeM: 1450 },
        ]);
    });

    it('üç adımı, yakındaki camileri ve bugünün pencerelerini gösterir', async () => {
        const ekran = render(<NamazdaSessizIosSayfasi />);
        expect(ekran.getByTestId('odak-semasi')).toBeTruthy();
        expect(ekran.getByText('Namaz odağını oluşturun')).toBeTruthy();
        expect(ekran.getByText('Camiye varınca açılsın')).toBeTruthy();
        expect(ekran.getByText('Namaz vakitlerinde açılsın')).toBeTruthy();
        await waitFor(() => expect(ekran.getByText('Sultan Ahmet Camii')).toBeTruthy());
        expect(ekran.getByText('120 m')).toBeTruthy();
        expect(ekran.getByText('1,4 km')).toBeTruthy();
        expect(mockCamiler).toHaveBeenCalledWith(41.0054, 28.9768, 4);
        expect(ekran.getByTestId('bugun-pencereleri')).toBeTruthy();
    });

    it('caminin satırı Haritalar’ı adıyla açar; Kısayollar düğmesi Kısayollar’ı açar', async () => {
        const ac = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
        const ekran = render(<NamazdaSessizIosSayfasi />);
        await waitFor(() => expect(ekran.getByTestId('cami-osm:w1')).toBeTruthy());
        fireEvent.press(ekran.getByTestId('cami-osm:w1'));
        expect(ac).toHaveBeenCalledWith('maps://?q=Sultan%20Ahmet%20Camii&ll=41.0054,28.9768');
        fireEvent.press(ekran.getByTestId('kisayollari-ac'));
        expect(ac).toHaveBeenCalledWith('shortcuts://');
        ac.mockRestore();
    });

    it('"Tamamladım" adımı işaretler ve diske yazar', async () => {
        const ekran = render(<NamazdaSessizIosSayfasi />);
        fireEvent.press(ekran.getByTestId('adim-odak-tamam'));
        await waitFor(() => expect(ekran.getByText('Tamamlandı')).toBeTruthy());
        await waitFor(async () => {
            const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.IOS_SESSIZ_KURULUM);
            expect(JSON.parse(ham ?? '{}').tamam).toEqual(['odak']);
        });
    });

    it('yakında cami yoksa yön gösteren satır çıkar', async () => {
        mockCamiler.mockResolvedValue([]);
        const ekran = render(<NamazdaSessizIosSayfasi />);
        await waitFor(() => expect(ekran.getByTestId('cami-yok')).toBeTruthy());
    });
});

describe('NamazdaSessizIosSayfasi — İngilizce', () => {
    const YASAKLI = ['Namaz\\b', 'Odak', 'Ayarlar', 'Konum', 'Kisayol', 'Otomasyon', 'Uygulama', 'Sonra', 'dk\\b', 'Tamam'];
    // Marka adı ("Namaz Akışı") her dilde aynı kalır; cami adları veridir.
    const kalan = (agac: unknown) =>
        turkceKalanlar(agac as never, YASAKLI).filter((m) => turkceKalanlar(m.replace(/Namaz Akışı/g, ''), YASAKLI).length > 0);
    let geriAl: () => void;
    beforeEach(async () => {
        geriAl = ingilizceyeGec();
        await AsyncStorage.clear();
        mockCamiler.mockReset();
        mockCamiler.mockResolvedValue([{ id: 'osm:w2', ad: 'Blue Mosque', lat: 41.007, lng: 28.975, mesafeM: 1450 }]);
    });
    afterEach(() => act(() => geriAl()));

    it('üç adım, menü yolları ve Kısayollar blokları İngilizce', async () => {
        const e = render(<NamazdaSessizIosSayfasi />);
        await waitFor(() => expect(e.getByText('Blue Mosque')).toBeTruthy());
        expect(e.getByText('1.4 km')).toBeTruthy();
        expect(e.getByText('Create the Prayer Focus')).toBeTruthy();
        expect(e.getByLabelText('Settings, then Focus, then +, then Custom, then Prayer')).toBeTruthy();
        fireEvent.press(e.getByTestId('adim-odak-tamam'));
        await waitFor(() => expect(e.getByText('Done')).toBeTruthy());
        expect(kalan(e.toJSON())).toEqual([]);
    });

    it('yakında cami yoksa İngilizce yönlendirme', async () => {
        mockCamiler.mockResolvedValue([]);
        const e = render(<NamazdaSessizIosSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-yok')).toBeTruthy());
        expect(kalan(e.toJSON())).toEqual([]);
    });
});
