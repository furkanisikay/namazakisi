/** Cihaz rolü sorusu İngilizce çizildiğinde Türkçe metin kalmaz (dil çıkarımı nöbetçisi). */
import React from 'react';
import { act, render } from '@testing-library/react-native';
import { CihazRoluSorusu } from '../CihazRoluSorusu';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#fff', kartArkaplan: '#eee', birincil: '#4CAF50', birincilMetin: '#fff', metin: '#333', metinIkincil: '#666', sinir: '#ccc' }),
}));
jest.mock('../../../../core/cihaz/cihazRolu', () => ({ rolSorulmaliMi: () => true }));
jest.mock('../../../../data/local/LocalCihazRoluServisi', () => ({ cihazRoluOku: async () => null, cihazRoluYaz: async () => undefined }));
jest.mock('../../../hooks/useHatirlatmaKapisi', () => ({ cihazRoluAyarla: jest.fn() }));

let geriAl: () => void;
beforeEach(() => {
    geriAl = ingilizceyeGec();
});
afterEach(() => act(() => geriAl()));

it('cihaz rolü sorusu İngilizce', async () => {
    const e = render(<CihazRoluSorusu />);
    expect(await e.findByText('Is this your main phone?')).toBeTruthy();
    expect(turkceKalanlar(e.toJSON() as never, ['Sonra', 'Evet', 'Ayarlar'])).toEqual([]);
});
