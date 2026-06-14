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

  // ============ GENİŞLETMELER (birincilIkon + tehlikeli) ============

  // GENİŞLETME 1: birincilIkon varsayılanı 'redo' (geriye uyumluluk — mevcut
  // yedek "Tekrar dene" akışının görseli korunur; testler bozulmamalı).
  it('birincil buton ikonu varsayılan olarak "redo" olur (geriye uyumlu)', () => {
    const { getByText } = render(
      <BildirimModali {...temelProps} birincilEtiket="Tekrar dene" onBirincil={jest.fn()} />
    );
    // hata tipi ikonu (exclamation-circle) + birincil buton ikonu (redo) birlikte bulunur
    expect(getByText('redo')).toBeTruthy();
  });

  // GENİŞLETME 2: birincilIkon override edilebilmeli (örn. "Tamam" → check).
  it('birincilIkon verilince o ikon kullanılır, varsayılan redo kullanılmaz', () => {
    const { getByText, queryByText } = render(
      <BildirimModali
        {...temelProps}
        birincilEtiket="Tamam"
        birincilIkon="check"
        onBirincil={jest.fn()}
      />
    );
    expect(getByText('check')).toBeTruthy();
    expect(queryByText('redo')).toBeNull();
  });

  // GENİŞLETME 3: birincilIkon='' ile ikon tümden gizlenebilmeli.
  it('birincilIkon boş string ise birincil buton ikonu render edilmez', () => {
    const { queryByText, getByLabelText } = render(
      <BildirimModali
        {...temelProps}
        birincilEtiket="Devam"
        birincilIkon=""
        onBirincil={jest.fn()}
      />
    );
    // Buton yine var ama içinde ikon (redo veya başka) yok
    expect(getByLabelText('Devam')).toBeTruthy();
    expect(queryByText('redo')).toBeNull();
  });

  // GENİŞLETME 4: tehlikeli=true → birincil buton renkler.hata rengini kullanır
  // (yıkıcı "Sil"/"Sıfırla" onayları). Varsayılanda birincil renk kalır.
  it('tehlikeli=true iken birincil buton hata rengini kullanır', () => {
    const { getByLabelText } = render(
      <BildirimModali {...temelProps} birincilEtiket="Sil" onBirincil={jest.fn()} tehlikeli />
    );
    const buton = getByLabelText('Sil');
    const stiller = Array.isArray(buton.props.style) ? buton.props.style : [buton.props.style];
    const arkaplanlar = stiller.map((s: any) => s?.backgroundColor).filter(Boolean);
    expect(arkaplanlar).toContain('#F44336'); // renkler.hata
    expect(arkaplanlar).not.toContain('#4CAF50'); // renkler.birincil DEĞİL
  });

  it('tehlikeli=false (varsayılan) iken birincil buton birincil rengi kullanır', () => {
    const { getByLabelText } = render(
      <BildirimModali {...temelProps} birincilEtiket="Devam et" onBirincil={jest.fn()} />
    );
    const buton = getByLabelText('Devam et');
    const stiller = Array.isArray(buton.props.style) ? buton.props.style : [buton.props.style];
    const arkaplanlar = stiller.map((s: any) => s?.backgroundColor).filter(Boolean);
    expect(arkaplanlar).toContain('#4CAF50'); // renkler.birincil
  });
});
