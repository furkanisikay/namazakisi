import React from 'react';
import { Text, Modal } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// @expo/vector-icons → sade metin (native font yüklemesini engelle)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: any) => <Text>{props.name}</Text> };
});

// Tema renkleri deterministik
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
    basarili: '#10b981',
  }),
}));

// Donanım geri tuşu hook'u: pasif geç
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({
  useDonanimGeriTusu: jest.fn(),
}));

// Görsel yakalama / paylaşım / blur bağımlılıklarını mockla
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: (props: any) => <View {...props} /> };
});

import { PaylasimModal } from '../PaylasimModal';

describe('PaylasimModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (captureRef as jest.Mock).mockResolvedValue('file://tmp/gorsel.png');
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  const Icerik = () => <Text>Paylaşılacak içerik</Text>;

  it('render olur ve içeriği gösterir', () => {
    const { getByText } = render(
      <PaylasimModal gorunur onKapat={jest.fn()}>
        <Icerik />
      </PaylasimModal>
    );
    expect(getByText('Başarını Paylaş')).toBeTruthy();
    expect(getByText('Paylaşılacak içerik')).toBeTruthy();
  });

  it('görsel/paylaşım hatasında tema-uyumlu hata modalı (Alert DEĞİL) gösterilir', async () => {
    // captureRef başarıyla çözülür, paylaşım sırasında hata fırlatılır → outer catch
    (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('boom'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <PaylasimModal gorunur onKapat={jest.fn()}>
        <Icerik />
      </PaylasimModal>
    );

    fireEvent.press(getByText('Hikayene Ekle'));

    await waitFor(() => {
      expect(getByText('Görsel oluşturulamadı')).toBeTruthy();
    });
    // Tamam butonu ile kapatılabilmeli
    expect(getByText('Tamam')).toBeTruthy();
    errSpy.mockRestore();
  });

  it('paylaşım desteklenmiyorsa bilgi modalı gösterilir', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    const { getByText } = render(
      <PaylasimModal gorunur onKapat={jest.fn()}>
        <Icerik />
      </PaylasimModal>
    );

    fireEvent.press(getByText('Hikayene Ekle'));

    await waitFor(() => {
      expect(getByText('Paylaşım kullanılamıyor')).toBeTruthy();
    });
  });

  it('hata modalındaki "Tamam"a basınca bildirim modalı kapanır (visible=false)', async () => {
    (captureRef as jest.Mock).mockRejectedValue(new Error('boom'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText, UNSAFE_getAllByType } = render(
      <PaylasimModal gorunur onKapat={jest.fn()}>
        <Icerik />
      </PaylasimModal>
    );

    fireEvent.press(getByText('Hikayene Ekle'));
    await waitFor(() => expect(getByText('Görsel oluşturulamadı')).toBeTruthy());

    // Bildirim modalı (ikinci Modal) görünür olmalı
    // NOT: jest'te Modal içeriği visible=false iken de render olur; güvenilir invariant
    // alttaki Modal'ın visible prop'udur (SayiGirisModali.test.tsx ile aynı kalıp).
    const modallarAcik = UNSAFE_getAllByType(Modal).map((m) => m.props.visible);
    expect(modallarAcik).toContain(true);

    fireEvent.press(getByText('Tamam'));
    await waitFor(() => {
      // Bildirim modalı artık kapalı: en az bir Modal'ın visible'ı true kalsa da
      // (dış paylaşım modalı), bildirim modalı (ikincisi) false olmalı.
      const modallar = UNSAFE_getAllByType(Modal);
      const bildirimModali = modallar[modallar.length - 1];
      expect(bildirimModali.props.visible).toBe(false);
    });
    errSpy.mockRestore();
  });
});
