import React from 'react';
import renderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { VakitKarti } from '../VakitKarti';

// Mock yaparken gercek modul yolunu kullanalim veya goreceli
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: 'FontAwesome5'
}));

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    vurgu: '#00BFA5',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
    devredisi: '#BDBDBD'
  })
}));

describe('VakitKarti Bileşeni', () => {
  const varsayilanProps = {
    vakitBilgisi: null,
    kalanSureStr: '01:30:00',
    suankiVakitAdi: 'Öğle',
    vakitAraligi: '13:00 - 16:30',
    tamamlandi: false,
    onTamamla: jest.fn(),
  };

  it('snapshot testi', () => {
    const tree = renderer.create(
      <VakitKarti {...varsayilanProps} kilitli={false} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('kilitli mod snapshot testi', () => {
    const tree = renderer.create(
      <VakitKarti {...varsayilanProps} kilitli={true} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
