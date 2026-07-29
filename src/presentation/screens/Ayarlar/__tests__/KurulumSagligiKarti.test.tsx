/**
 * KurulumSagligiKarti — sorunsuz özet satırı, ilk sorun kartı ve
 * "N sorun daha" genişletme davranışı.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { KurulumSagligiKarti } from '../KurulumSagligiKarti';
import type { Sorun } from '../../../../core/ayarlar/kurulumSagligi';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    metin: '#111111',
    metinIkincil: '#666666',
    sinir: '#E0E0E0',
    birincil: '#5C6BC0',
    birincilMetin: '#FFFFFF',
    kartArkaplan: '#FFFFFF',
    durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3' },
  }),
}));

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text: RNText } = require('react-native');
  return (props: { name: string }) => <RNText>{props.name}</RNText>;
});

const kritikSorun: Sorun = {
  id: 'bildirimIzni',
  seviye: 'kritik',
  baslik: 'Bildirim izni kapalı',
  aciklama: 'Uygulama bildirimleri size ulaşamıyor.',
  eylemEtiketi: 'İzni açın',
  eylem: { tip: 'sistemAyarlari' },
};

const uyariSorun: Sorun = {
  id: 'hatirlatmaYok',
  seviye: 'uyari',
  baslik: 'Vakit hatırlatmaları kapalı',
  aciklama: 'Ne muhafız ne de vakit bildirimleri açık.',
  eylemEtiketi: 'Hatırlatmaları açın',
  eylem: { tip: 'sayfa', sayfa: 'MuhafizAyarlari' },
};

const bilgiSorunEylemsiz: Sorun = {
  id: 'konumBayat',
  seviye: 'bilgi',
  baslik: 'Konumunuz 7 günden eski',
  aciklama: 'Şehir değiştiyseniz vakitler kaymış olabilir.',
};

describe('KurulumSagligiKarti — sorun yok', () => {
  it('özet satırını gösterir, onEylem hiç çağrılmaz', () => {
    const onEylem = jest.fn();
    const { getByText } = render(
      <KurulumSagligiKarti
        sorunlar={[]}
        onEylem={onEylem}
        ozetSatiri="Kurulumunuz eksiksiz · İstanbul · muhafız açık"
      />
    );

    expect(getByText('Kurulumunuz eksiksiz · İstanbul · muhafız açık')).toBeTruthy();
    expect(onEylem).not.toHaveBeenCalled();
  });
});

describe('KurulumSagligiKarti — tek sorun', () => {
  it('ilk sorunu tam kart olarak gösterir, "sorun daha" metni YOK', () => {
    const { getByText, queryByText } = render(
      <KurulumSagligiKarti sorunlar={[kritikSorun]} onEylem={jest.fn()} ozetSatiri="" />
    );

    expect(getByText('Bildirim izni kapalı')).toBeTruthy();
    expect(getByText('Uygulama bildirimleri size ulaşamıyor.')).toBeTruthy();
    expect(getByText('İzni açın')).toBeTruthy();
    expect(queryByText(/sorun daha/)).toBeNull();
  });

  it('eylem butonuna dokununca onEylem o sorunla çağrılır', () => {
    const onEylem = jest.fn();
    const { getByLabelText } = render(
      <KurulumSagligiKarti sorunlar={[kritikSorun]} onEylem={onEylem} ozetSatiri="" />
    );

    fireEvent.press(getByLabelText('İzni açın'));

    expect(onEylem).toHaveBeenCalledWith(kritikSorun);
  });

  it('eylemEtiketi olmayan sorunda eylem butonu render edilmez', () => {
    const { getByText, queryAllByRole } = render(
      <KurulumSagligiKarti sorunlar={[bilgiSorunEylemsiz]} onEylem={jest.fn()} ozetSatiri="" />
    );

    expect(getByText('Konumunuz 7 günden eski')).toBeTruthy();
    expect(queryAllByRole('button')).toHaveLength(0);
  });
});

describe('KurulumSagligiKarti — birden çok sorun', () => {
  it('yalnız ilk sorunu gösterir + "1 sorun daha" metni', () => {
    const { getByText, queryByText } = render(
      <KurulumSagligiKarti
        sorunlar={[kritikSorun, uyariSorun]}
        onEylem={jest.fn()}
        ozetSatiri=""
      />
    );

    expect(getByText('Bildirim izni kapalı')).toBeTruthy();
    expect(queryByText('Vakit hatırlatmaları kapalı')).toBeNull();
    expect(getByText('1 sorun daha')).toBeTruthy();
  });

  it('"N sorun daha" dokununca kalan sorunlar aynı kartta listelenir', () => {
    const { getByText, queryByText } = render(
      <KurulumSagligiKarti
        sorunlar={[kritikSorun, uyariSorun]}
        onEylem={jest.fn()}
        ozetSatiri=""
      />
    );

    fireEvent.press(getByText('1 sorun daha'));

    expect(getByText('Vakit hatırlatmaları kapalı')).toBeTruthy();
    expect(getByText('Hatırlatmaları açın')).toBeTruthy();
    // Genişledikten sonra "N sorun daha" metni artık gösterilmez.
    expect(queryByText('1 sorun daha')).toBeNull();
  });

  it('genişletilmiş listedeki ikinci sorunun eylem butonu doğru sorunla onEylem çağırır', () => {
    const onEylem = jest.fn();
    const { getByText, getByLabelText } = render(
      <KurulumSagligiKarti
        sorunlar={[kritikSorun, uyariSorun]}
        onEylem={onEylem}
        ozetSatiri=""
      />
    );

    fireEvent.press(getByText('1 sorun daha'));
    fireEvent.press(getByLabelText('Hatırlatmaları açın'));

    expect(onEylem).toHaveBeenCalledWith(uyariSorun);
  });
});
