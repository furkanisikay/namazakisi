/**
 * Ramazan ayarları sayfası — İngilizce çizimde Türkçe metin kalmaz (dil çıkarımı nöbetçisi).
 * İftar/sahur anahtarlarının yazma yolu `useRamazanSayaclari` testlerindedir.
 */
import React from 'react';
import { act, render } from '@testing-library/react-native';
import { RamazanAyarlariSayfasi } from '../RamazanAyarlariSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({
        arkaplan: '#fff',
        kartArkaplan: '#eee',
        birincil: '#4CAF50',
        metin: '#333',
        metinIkincil: '#666',
        sinir: '#ccc',
        durum: { dikkat: '#E65100', bilgi: '#2196F3', uyari: '#FFC107', basarili: '#4CAF50', hata: '#F44336' },
    }),
}));
jest.mock('../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn(async () => undefined) }) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('../../components/ayar/VurguSaglayici', () => ({ VurguSaglayici: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('../../components/ayar/useVurguKurulumu', () => ({ useVurguKurulumu: () => ({ current: null }) }));
jest.mock('../../components/ayar/AyarCapasi', () => ({ AyarCapasi: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('../../components/hareket/TanitimResmi', () => ({ TanitimResmi: () => null }));
jest.mock('../../components/common/CanliGuncellemeBilgisi', () => ({ CanliGuncellemeBilgisi: () => null }));
jest.mock('../../store/iftarSayacSlice', () => ({ iftarSayacAyarlariniYukle: () => ({ type: 'iftar/yukle' }) }));
jest.mock('../../store/sahurSayacSlice', () => ({ sahurSayacAyarlariniYukle: () => ({ type: 'sahur/yukle' }) }));
jest.mock('../../hooks/useRamazanSayaclari', () => ({
    useRamazanSayaclari: () => ({ iftar: true, sahur: true, iftarDegistir: jest.fn(), sahurDegistir: jest.fn() }),
}));
const mockState = { iftarSayac: { ayarlar: { aktif: false } }, sahurSayac: { ayarlar: { aktif: false } } };
jest.mock('../../store/hooks', () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: (sec: (s: typeof mockState) => unknown) => sec(mockState),
}));

const YASAKLI = ['Sahur\\b', 'Oruc', 'Vakit', 'vakit', 'dk\\b'];

describe('RamazanAyarlariSayfasi — İngilizce', () => {
    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
    });
    afterEach(() => act(() => geriAl()));

    it('anahtarlar kapalı ve açık (ayrıntılar, oruç notu)', () => {
        mockState.iftarSayac.ayarlar.aktif = false;
        mockState.sahurSayac.ayarlar.aktif = false;
        const kapali = render(<RamazanAyarlariSayfasi />);
        expect(turkceKalanlar(kapali.toJSON() as never, YASAKLI)).toEqual([]);
        kapali.unmount();
        mockState.iftarSayac.ayarlar.aktif = true;
        mockState.sahurSayac.ayarlar.aktif = true;
        const acik = render(<RamazanAyarlariSayfasi />);
        expect(turkceKalanlar(acik.toJSON() as never, YASAKLI)).toEqual([]);
        expect(acik.getByText('Iftar countdown')).toBeTruthy();
    });
});
