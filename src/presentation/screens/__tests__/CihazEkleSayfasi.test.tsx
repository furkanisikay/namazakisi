/**
 * Cihaz ekleyin (telefon ↔ tablet): kod gösterme (gelen istek bu cihazda onaylanır) ve kod
 * okutma (okunan kodda bu cihazda onay, sonra eşleşme + ilk eşitleme). Servisler mock'lanır.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { CihazEkleSayfasi } from '../CihazEkleSayfasi';
import { useRenkler } from '../../../core/theme';
import { kareKodYolu } from '../../components/cihazlar/KareKod';
import { cihazQrYaz } from '../../../core/cihazAgi/eslesme';

const mockServis = {
    istekDinleyicisi: null as null | ((i: unknown) => void),
    eslesmeOturumuAc: jest.fn(),
    eslesmeOturumunuKapat: jest.fn(),
    eslesmeyiYanitla: jest.fn(async () => undefined),
    dinlemeyiBaslat: jest.fn(async () => 47600),
    yerelAdres: jest.fn(async () => '192.168.1.60'),
    esitle: jest.fn(async () => ({})),
};
let mockTur: 'tablet' | 'telefon' = 'tablet';
const mockEsles = jest.fn();
const mockQrOku = jest.fn();

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../domain/services/CihazEsServisi', () => ({
    CihazEsServisi: { getInstance: () => mockServis },
    buCihazinTuru: () => mockTur,
    cihazAgiDinleyicisiVarMi: () => true,
    cihazKimligi: async () => 'aaaaaaaaaaaaaaaa',
}));
jest.mock('../../../domain/services/CihazEslesmeServisi', () => ({
    esles: (...a: unknown[]) => mockEsles(...a),
    telefonAdi: () => 'Salon tableti',
}));
jest.mock('../../../domain/services/TvEslemeServisi', () => ({
    TvEslemeServisi: { qrOku: () => mockQrOku(), iosOkumaDinle: () => () => undefined },
}));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path', Rect: 'Rect' }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (p: { name: string }) => <Text>{p.name}</Text> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{p.name}</Text>;
});

const SIR = new Uint8Array(32).fill(3);

beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue({
        arkaplan: '#fff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333', metinIkincil: '#666', sinir: '#ccc', hata: '#F44336', bilgi: '#2196F3', basarili: '#4CAF50',
    });
    mockServis.eslesmeOturumuAc.mockResolvedValue({ adres: '192.168.1.50', port: 47555, kimlik: 'bbbbbbbbbbbbbbbb', sir: SIR });
});

it('kare kod yolu: modüller tek SVG yoluna çevrilir', () => {
    const { boyut, yol } = kareKodYolu('namazakisi://cihaz?v=2');
    expect(boyut).toBeGreaterThanOrEqual(21);
    expect(yol).toMatch(/^M\d+ \d+h1v1h-1z/);
});

it('tablette varsayılan: kod gösterilir; gelen istek BU cihazda sorulur, onayda eklenir', async () => {
    mockTur = 'tablet';
    const { findByLabelText, findByText, getByText, getByTestId } = render(<CihazEkleSayfasi />);
    expect(await findByLabelText('Diğer cihazla okutulacak kare kod')).toBeTruthy();
    act(() => mockServis.istekDinleyicisi?.({ ist: 'x', cihazAdi: "Ahmet'in telefonu", kimlik: 'aaaaaaaaaaaaaaaa', adres: '', port: 0, tur: 'telefon' }));
    await findByText(/Ahmet'in telefonu bu cihaza eklenecek/);
    fireEvent.press(getByText('Ekleyin'));
    await waitFor(() => expect(mockServis.eslesmeyiYanitla).toHaveBeenCalledWith(true));
    await waitFor(() => expect(getByTestId('cihaz-ekle-durum').props.children).toMatch(/Ahmet'in telefonu eklendi/));
});

it('telefonda varsayılan: kod okutulur, önce bu cihazda onay, sonra kendi adresiyle eşleşir ve eşitler', async () => {
    mockTur = 'telefon';
    mockQrOku.mockResolvedValue({ tur: 'okundu', metin: cihazQrYaz({ adres: '192.168.1.50', port: 47555, aliciKimlik: 'bbbbbbbbbbbbbbbb', sir: SIR, aliciAdi: 'Salon tableti', aliciTuru: 'tablet' }) });
    mockEsles.mockResolvedValue('onay');
    const { getByTestId, findByText, getByText } = render(<CihazEkleSayfasi />);
    fireEvent.press(getByTestId('cihaz-ekle-okut-dugme'));
    await findByText(/Şu cihaza bağlanıyorsunuz: Salon tableti/);
    expect(mockEsles).not.toHaveBeenCalled();
    fireEvent.press(getByText('Bağlanın'));
    await waitFor(() => expect(getByTestId('cihaz-ekle-durum').props.children).toMatch(/Salon tableti eklendi/));
    expect(mockEsles.mock.calls[0][1]).toMatchObject({ kendi: { kimlik: 'aaaaaaaaaaaaaaaa', adres: '192.168.1.60', port: 47600, tur: 'telefon' } });
    expect(mockServis.esitle).toHaveBeenCalled();
});

it('TV kodu okutulursa yön gösterir', async () => {
    mockTur = 'telefon';
    mockQrOku.mockResolvedValue({ tur: 'okundu', metin: 'namazakisi://tv?v=2&a=192.168.1.23&p=47123&i=0123456789abcdef&s=AwoRGB8mLTQ7QklQV15lbHN6gYiPlp2kq7K5wMfO1dw&d=TV' });
    const { getByTestId } = render(<CihazEkleSayfasi />);
    fireEvent.press(getByTestId('cihaz-ekle-okut-dugme'));
    await waitFor(() => expect(getByTestId('cihaz-ekle-durum').props.children).toMatch(/TV’ye ait/));
});
