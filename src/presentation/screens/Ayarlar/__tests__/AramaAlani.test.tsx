/**
 * AramaAlani (arama hapı) render + etkileşim testleri.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import { AramaAlani } from '../AramaAlani';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
};

describe('AramaAlani', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
  });

  it('erişilebilirlik etiketi "Ayarlarda arayın" ile render edilir', () => {
    const { getByLabelText } = render(<AramaAlani deger="" onDegistir={jest.fn()} />);

    expect(getByLabelText('Ayarlarda arayın')).toBeTruthy();
  });

  it('boşken temizle butonu görünmez', () => {
    const { queryByLabelText } = render(<AramaAlani deger="" onDegistir={jest.fn()} />);

    expect(queryByLabelText('Aramayı temizle')).toBeNull();
  });

  it('doluyken temizle butonu görünür ve dokununca değeri boşaltır', () => {
    const onDegistir = jest.fn();
    const { getByLabelText } = render(<AramaAlani deger="muhafız" onDegistir={onDegistir} />);

    fireEvent.press(getByLabelText('Aramayı temizle'));

    expect(onDegistir).toHaveBeenCalledWith('');
  });

  it('metin girişi değiştiğinde onDegistir çağrılır', () => {
    const onDegistir = jest.fn();
    const { getByLabelText } = render(<AramaAlani deger="" onDegistir={onDegistir} />);

    fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'konum');

    expect(onDegistir).toHaveBeenCalledWith('konum');
  });
});
