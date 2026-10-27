/** Türkiye dışı elle şehir seçimi: ülke listesi → şehir, aramayla doğrudan şehir, yöntem çipi. */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF', arkaplan: '#FAFAFA', sinir: '#E0E0E0', birincil: '#4CAF50',
    metin: '#212121', metinIkincil: '#757575',
    durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3', dikkat: '#E65100' },
  }),
}));
const mockOrnek = [
  '#S Asia/Kuala_Lumpur\tAsia/Riyadh\tEurope/Berlin',
  '#B MY.14\tKuala Lumpur\tSA.14\tMakkah\tDE.16\tBerlin',
  'Kuala Lumpur\t\t3.141\t101.687\tMY\t14\t0\t1454',
  'Kuala Terengganu\t\t5.330\t103.141\tMY\t\t0\t427',
  'Makkah\t\t21.427\t39.826\tSA\t14\t1\t1579',
  'Berlin\t\t52.524\t13.411\tDE\t16\t2\t3426',
].join('\n');
jest.mock('../../../data/local/dunyaSehirVerisi', () => {
  const { dunyaVerisiniCoz } = jest.requireActual('../../../core/konum/dunyaSehirleri');
  return { dunyaSehirVerisiniAl: jest.fn(async () => dunyaVerisiniCoz(mockOrnek)) };
});

import { DunyaSehirSecici } from '../DunyaSehirSecici';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

describe('DunyaSehirSecici', () => {
  it('ülke seçilip şehri seçilir; satır ülkenin önerilen takvimini gösterir', async () => {
    const onSec = jest.fn();
    const { getByLabelText, findByLabelText, getAllByText } = render(<DunyaSehirSecici secili={null} onSec={onSec} />);
    fireEvent.press(getByLabelText('Şehir seçin'));
    fireEvent.press(await findByLabelText('Malezya, şehirlerini gösterin'));
    expect(getAllByText('JAKIM').length).toBeGreaterThan(0);
    fireEvent.press(await findByLabelText('Kuala Lumpur, Kuala Lumpur · Malezya'));
    expect(onSec).toHaveBeenCalledWith(expect.objectContaining({ ad: 'Kuala Lumpur', ulke: 'MY', saatDilimi: 'Asia/Kuala_Lumpur' }));
  });

  it('arama dünyanın her yerinde şehir bulur (aksan/harf duyarsız)', async () => {
    const onSec = jest.fn();
    const { getByLabelText, findByLabelText, getAllByLabelText } = render(<DunyaSehirSecici secili={null} onSec={onSec} />);
    fireEvent.press(getByLabelText('Şehir seçin'));
    await findByLabelText('Almanya, şehirlerini gösterin');
    fireEvent.changeText(getAllByLabelText('Ülke ya da şehir arayın')[0], 'MAKK');
    fireEvent.press(await findByLabelText('Makkah, Makkah · Suudi Arabistan'));
    await waitFor(() => expect(onSec).toHaveBeenCalledWith(expect.objectContaining({ ulke: 'SA' })));
  });

  it('seçili şehri düğmede gösterir', () => {
    const { getByLabelText } = render(
      <DunyaSehirSecici secili={{ ad: 'Berlin', ulke: 'DE', bolge: 'Berlin', saatDilimi: 'Europe/Berlin' }} onSec={jest.fn()} />,
    );
    expect(getByLabelText('Şehir: Berlin, Almanya. Değiştirmek için dokunun')).toBeTruthy();
  });
});

describe('DunyaSehirSecici — İngilizce', () => {
  let geriAl: () => void;
  beforeEach(() => {
    geriAl = ingilizceyeGec();
  });
  afterEach(() => geriAl());

  it('ülke adları İngilizce tablodan; seçici metinleri İngilizce', async () => {
    const e = render(<DunyaSehirSecici secili={null} onSec={jest.fn()} />);
    expect(turkceKalanlar(e.toJSON() as never, ['Kapat', 'Konum'])).toEqual([]);
    fireEvent.press(e.getByLabelText('Choose a city'));
    fireEvent.press(await e.findByLabelText('Malaysia, show its cities'));
    expect(await e.findByLabelText('Kuala Lumpur, Kuala Lumpur · Malaysia')).toBeTruthy();
    // "Türkiye" ülkenin resmî İngilizce adıdır.
    const kalan = () => turkceKalanlar(e.toJSON() as never, ['Kapat']).filter((m) => !m.includes('For Türkiye'));
    expect(kalan()).toEqual([]);
    fireEvent.press(e.getByLabelText('Back to the country list'));
    fireEvent.changeText(e.getAllByLabelText('Search for a country or city')[0], 'zzzz');
    expect(await e.findByText('No results for "zzzz"')).toBeTruthy();
    expect(kalan()).toEqual([]);
  });

  it('seçili şehir düğmesi İngilizce', () => {
    const e = render(<DunyaSehirSecici secili={{ ad: 'Berlin', ulke: 'DE', bolge: 'Berlin', saatDilimi: 'Europe/Berlin' }} onSec={jest.fn()} />);
    expect(e.getByLabelText('City: Berlin, Germany. Tap to change')).toBeTruthy();
  });
});
