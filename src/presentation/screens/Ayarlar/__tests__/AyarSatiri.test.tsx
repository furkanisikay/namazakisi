/**
 * AyarSatiri — navigasyon ve toggle varyantlarının davranış testleri.
 */
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AyarSatiri } from '../AyarSatiri';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    metin: '#111111',
    metinIkincil: '#666666',
    sinir: '#E0E0E0',
    birincil: '#5C6BC0',
    birincilMetin: '#FFFFFF',
  }),
}));

const mockButonTiklandiFeedback = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../../core/feedback', () => ({
  useFeedback: () => ({ butonTiklandiFeedback: mockButonTiklandiFeedback }),
}));

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text: RNText } = require('react-native');
  return (props: { name: string }) => <RNText>{props.name}</RNText>;
});

describe('AyarSatiri — navigasyon varyantı', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başlık ve özeti render eder, erişim etiketi "başlık. özet" biçimindedir', () => {
    const { getByText, getByLabelText } = render(
      <AyarSatiri
        varyant="navigasyon"
        ikon={<Text>ikon</Text>}
        baslik="Konum"
        ozet="Kadıköy, İstanbul · otomatik"
        onPress={jest.fn()}
      />
    );

    expect(getByText('Konum')).toBeTruthy();
    expect(getByText('Kadıköy, İstanbul · otomatik')).toBeTruthy();
    expect(getByLabelText('Konum. Kadıköy, İstanbul · otomatik')).toBeTruthy();
  });

  it('dokununca butonTiklandiFeedback + onPress çağrılır', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <AyarSatiri
        varyant="navigasyon"
        ikon={<Text>ikon</Text>}
        baslik="Muhafız"
        ozet="Açık · normal yoğunluk"
        onPress={onPress}
      />
    );

    fireEvent.press(getByLabelText('Muhafız. Açık · normal yoğunluk'));

    await waitFor(() => {
      expect(mockButonTiklandiFeedback).toHaveBeenCalledTimes(1);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('yeniRozetGoster true iken "Yeni" rozeti render edilir', () => {
    const { getByText } = render(
      <AyarSatiri
        varyant="navigasyon"
        ikon={<Text>ikon</Text>}
        baslik="Neler yeni"
        ozet="2 yeni özellik"
        onPress={jest.fn()}
        yeniRozetGoster
      />
    );

    expect(getByText('Yeni')).toBeTruthy();
  });

  it('yeniRozetGoster verilmezse "Yeni" rozeti render edilmez', () => {
    const { queryByText } = render(
      <AyarSatiri
        varyant="navigasyon"
        ikon={<Text>ikon</Text>}
        baslik="Konum"
        ozet="İstanbul · otomatik"
        onPress={jest.fn()}
      />
    );

    expect(queryByText('Yeni')).toBeNull();
  });
});

describe('AyarSatiri — toggle varyantı', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Switch değeri prop ile eşleşir ve erişim etiketi "başlık. özet" biçimindedir', () => {
    const { getByLabelText } = render(
      <AyarSatiri
        varyant="toggle"
        ikon={<Text>ikon</Text>}
        baslik="Titreşim"
        ozet="Açık"
        deger
        onDegistir={jest.fn()}
      />
    );

    const anahtar = getByLabelText('Titreşim. Açık');
    expect(anahtar.props.value).toBe(true);
    expect(anahtar.props.accessibilityRole).toBe('switch');
  });

  it('değiştirilince butonTiklandiFeedback + onDegistir çağrılır', async () => {
    const onDegistir = jest.fn();
    const { getByLabelText } = render(
      <AyarSatiri
        varyant="toggle"
        ikon={<Text>ikon</Text>}
        baslik="Ses efektleri"
        ozet="Kapalı"
        deger={false}
        onDegistir={onDegistir}
      />
    );

    fireEvent(getByLabelText('Ses efektleri. Kapalı'), 'valueChange', true);

    await waitFor(() => {
      expect(mockButonTiklandiFeedback).toHaveBeenCalledTimes(1);
    });
    expect(onDegistir).toHaveBeenCalledWith(true);
  });
});
