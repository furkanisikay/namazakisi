import React from 'react';
import { Modal } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

// @expo/vector-icons'i ikon adını metne indir (native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});

// Tema renklerini deterministik sabit bir palete sabitle
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    arkaplan: '#FAFAFA',
    hata: '#F44336',
    bilgi: '#2196F3',
    basarili: '#4CAF50',
  }),
}));

// Android donanım geri tuşu hook'u: test ortamında pasif geç
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));

import { BildirimModali } from '../BildirimModali';
import { useDonanimGeriTusu } from '../../../hooks/useDonanimGeriTusu';

describe('BildirimModali Bileşeni', () => {
  const temelProps = {
    gorunur: true,
    tip: 'hata' as const,
    baslik: 'Yedek oluşturulamadı',
    mesaj: 'Yedeğiniz oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.',
    onKapat: jest.fn(),
  };

  it('görünür olduğunda başlık ve mesajı gösterir', () => {
    const { getByText } = render(<BildirimModali {...temelProps} />);
    expect(getByText('Yedek oluşturulamadı')).toBeTruthy();
    expect(getByText(temelProps.mesaj)).toBeTruthy();
  });

  it('gorunur=true iken Modal visible=true, gorunur=false iken false geçirir', () => {
    const { UNSAFE_getByType, rerender } = render(<BildirimModali {...temelProps} gorunur />);
    expect(UNSAFE_getByType(Modal).props.visible).toBe(true);
    rerender(<BildirimModali {...temelProps} gorunur={false} />);
    expect(UNSAFE_getByType(Modal).props.visible).toBe(false);
  });

  it('kapat butonuna basınca onKapat çağrılır', () => {
    const onKapat = jest.fn();
    const { getByLabelText } = render(<BildirimModali {...temelProps} onKapat={onKapat} />);
    fireEvent.press(getByLabelText('Kapat'));
    expect(onKapat).toHaveBeenCalledTimes(1);
  });

  it('birincilEtiket verilince birincil buton görünür ve onBirincil çağrılır', () => {
    const onBirincil = jest.fn();
    const { getByLabelText } = render(
      <BildirimModali {...temelProps} birincilEtiket="Tekrar dene" onBirincil={onBirincil} />
    );
    fireEvent.press(getByLabelText('Tekrar dene'));
    expect(onBirincil).toHaveBeenCalledTimes(1);
  });

  it('birincilEtiket yokken yalnız kapat butonu render edilir', () => {
    const { queryByLabelText, getByLabelText } = render(<BildirimModali {...temelProps} />);
    expect(getByLabelText('Kapat')).toBeTruthy();
    expect(queryByLabelText('Tekrar dene')).toBeNull();
  });

  it('tip türüne göre doğru ikonu gösterir (hata/bilgi/başarı)', () => {
    const { getByText, rerender } = render(<BildirimModali {...temelProps} tip="hata" />);
    expect(getByText('exclamation-circle')).toBeTruthy();
    rerender(<BildirimModali {...temelProps} tip="bilgi" />);
    expect(getByText('info-circle')).toBeTruthy();
    rerender(<BildirimModali {...temelProps} tip="basari" />);
    expect(getByText('check-circle')).toBeTruthy();
  });

  it('özel kapatEtiketi kullanılabilir', () => {
    const { getByLabelText } = render(<BildirimModali {...temelProps} kapatEtiketi="Anladım" />);
    expect(getByLabelText('Anladım')).toBeTruthy();
  });

  it('donanım geri tuşu hook’u görünürlük ve onKapat ile çağrılır', () => {
    const onKapat = jest.fn();
    render(<BildirimModali {...temelProps} gorunur onKapat={onKapat} />);
    expect(useDonanimGeriTusu).toHaveBeenCalledWith(true, onKapat);
  });
});
