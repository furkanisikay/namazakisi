import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));

// Tema renklerini deterministik sabit bir palete sabitle
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    vurgu: '#00BFA5',
    metin: '#212121',
    metinIkincil: '#757575',
    arkaplan: '#FAFAFA',
    durum: { basarili: '#4CAF50', uyari: '#F59E0B' },
  }),
}));

// Android donanım geri tuşu hook'u: test ortamında pasif geç
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));

import { KerahatOnayModal } from '../KerahatOnayModal';

describe('KerahatOnayModal Bileşeni', () => {
  const varsayilanProps = {
    gorunur: true,
    aciklama: 'Güneş batış vaktidir (gurub). Bu vakitte namaz kılınması mekruhtur. Akşam ezanını bekleyiniz.',
    namazAdi: 'İkindi',
    onOnayla: jest.fn(),
    onVazgec: jest.fn(),
  };

  it('görünür olduğunda kerahat açıklamasını ve namaz adını gösterir', () => {
    const { getByText, getAllByText } = render(<KerahatOnayModal {...varsayilanProps} />);

    // Kerahat uyarı açıklaması birebir gösterilmeli (kullanıcı bilgilendirilir)
    expect(getByText(varsayilanProps.aciklama)).toBeTruthy();
    // İşaretlenecek namaz adı kullanıcıya gösterilmeli (en az bir yerde)
    expect(getAllByText(/İkindi/).length).toBeGreaterThan(0);
  });

  it('onaylama butonuna basınca onOnayla çağrılır (işaretlemeye İZİN verilir)', () => {
    const onOnayla = jest.fn();
    const { getByText } = render(
      <KerahatOnayModal {...varsayilanProps} onOnayla={onOnayla} />
    );

    fireEvent.press(getByText('Yine de İşaretle'));
    expect(onOnayla).toHaveBeenCalledTimes(1);
  });

  it('vazgeç butonuna basınca onVazgec çağrılır, onOnayla çağrılmaz', () => {
    const onOnayla = jest.fn();
    const onVazgec = jest.fn();
    const { getByText } = render(
      <KerahatOnayModal {...varsayilanProps} onOnayla={onOnayla} onVazgec={onVazgec} />
    );

    fireEvent.press(getByText('Vazgeç'));
    expect(onVazgec).toHaveBeenCalledTimes(1);
    expect(onOnayla).not.toHaveBeenCalled();
  });

  it('kibar "siz" dili kullanır ("istiyor musunuz")', () => {
    const { getByText } = render(<KerahatOnayModal {...varsayilanProps} />);
    // Kibar dil kontrolü: onay sorusu "musunuz" ile bitmeli
    expect(getByText(/musunuz/)).toBeTruthy();
  });
});
