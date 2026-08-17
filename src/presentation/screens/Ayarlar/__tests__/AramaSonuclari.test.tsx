/**
 * AramaSonuclari render + navigasyon testleri.
 *
 * `AYAR_INDEKSI`'nden gerçek kayıtlar kullanılır — sabit mock veri yerine
 * gerçek `id`/`sayfa`/`grup` alanlarıyla test etmek bağlam birleştirme
 * mantığının (`baglamOlustur`) gerçek veriyle uyumlu kaldığını doğrular.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../../core/theme';
import { AYAR_INDEKSI } from '../../../../core/ayarlar/aramaIndeksi';
import { AramaSonuclari } from '../AramaSonuclari';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: () => ({ params: undefined }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
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

function kaydiBul(id: string) {
  const kayit = AYAR_INDEKSI.find(k => k.id === id);
  if (!kayit) throw new Error(`AYAR_INDEKSI'nde "${id}" bulunamadı`);
  return kayit;
}

describe('AramaSonuclari', () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock });
  });

  it('eşleşme yoksa kibar boş durum metni gösterir', () => {
    const { getByText } = render(<AramaSonuclari sonuclar={[]} />);

    expect(getByText('Eşleşen ayar bulunamadı')).toBeTruthy();
    expect(getByText('Farklı bir sözcük deneyin.')).toBeTruthy();
  });

  it('çapalı bir kayda dokununca navigate(sayfa, { vurgula }) çağrılır', () => {
    const kayit = kaydiBul('vakitBildirimleri');
    const { getByText } = render(<AramaSonuclari sonuclar={[kayit]} />);

    fireEvent.press(getByText(kayit.baslik));

    expect(navigateMock).toHaveBeenCalledWith('BildirimAyarlari', { vurgula: 'vakitBildirimleri' });
  });

  it('çapasız bir kayda (nav satırı) dokununca ikinci argüman undefined gider', () => {
    const kayit = kaydiBul('sayfa-konum');
    const { getByText } = render(<AramaSonuclari sonuclar={[kayit]} />);

    fireEvent.press(getByText(kayit.baslik));

    expect(navigateMock).toHaveBeenCalledWith('KonumAyarlari', undefined);
  });

  it('çapalı kayıt bağlamı "üst grup › alt grup" biçiminde birleşir', () => {
    // vakitBildirimleri: sayfa=BildirimAyarlari, capa grubu='Bildirimler';
    // BildirimAyarlari'nin nav kaydındaki (sayfa-bildirim) grup='Hatırlatmalar'.
    const kayit = kaydiBul('vakitBildirimleri');
    const { getByText } = render(<AramaSonuclari sonuclar={[kayit]} />);

    expect(getByText('Hatırlatmalar › Bildirimler')).toBeTruthy();
  });

  it('çapasız (nav) kayıt bağlamı yalnız kendi grubunu gösterir', () => {
    const kayit = kaydiBul('sayfa-konum');
    const { getByText } = render(<AramaSonuclari sonuclar={[kayit]} />);

    expect(getByText('Namaz vakitleri')).toBeTruthy();
  });
});
