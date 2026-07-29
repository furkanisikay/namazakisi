import React from 'react';
import { render } from '@testing-library/react-native';
import { HakkindaSayfasi } from '../HakkindaSayfasi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { UYGULAMA } from '../../../core/constants/UygulamaSabitleri';

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../store/guncellemeSlice', () => ({
  guncellemeKontrolEt: jest.fn((arg) => ({ type: 'guncelleme/kontrolEt', payload: arg })),
}));
jest.mock('../../../domain/services/GuncellemeServisi', () => ({
  guvenilirBaglantiMi: jest.fn(() => true),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text>{`mi:${props.name}`}</Text>;
});

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  hata: '#F44336',
  bilgi: '#2196F3',
  basarili: '#10b981',
};

const guncellemeState = {
  kontrolEdiliyor: false,
  guncellemeMevcut: false,
  bilgi: null,
};

describe('HakkindaSayfasi', () => {
  beforeEach(() => {
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useAppSelector as jest.Mock).mockImplementation(
      (selector: (state: { guncelleme: typeof guncellemeState }) => unknown) =>
        selector({ guncelleme: guncellemeState })
    );
  });

  it("'Debug Logları' metni artık render edilmez", () => {
    const { queryByText } = render(<HakkindaSayfasi />);
    expect(queryByText('Debug Logları')).toBeNull();
  });

  it("'Tanı ve Geri Bildirim' metni artık render edilmez", () => {
    const { queryByText } = render(<HakkindaSayfasi />);
    expect(queryByText('Tanı ve Geri Bildirim')).toBeNull();
  });

  it("'Güncelleme Kontrolü' hâlâ render edilir (regresyon nöbetçisi)", () => {
    const { getByText } = render(<HakkindaSayfasi />);
    expect(getByText('Güncelleme Kontrolü')).toBeTruthy();
  });

  it('sürüm metni render edilir', () => {
    const { getByText } = render(<HakkindaSayfasi />);
    expect(getByText(UYGULAMA.VERSIYON)).toBeTruthy();
  });
});
