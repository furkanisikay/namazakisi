/**
 * Cihazlar arası eşitleme (issue #288) — ayar ekranı akışı.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { EsitlemeSayfasi, esitlemeZamaniniBicimle } from '../EsitlemeSayfasi';
import type { EsitlemeDurumu } from '../../../../core/esitleme/esitlemeTipleri';

const mockKanca = {
  durum: {
    aktif: false,
    saglayici: null,
    sonEtiket: null,
    sonOzet: null,
    sonEsitleme: null,
    sonHata: null,
  } as EsitlemeDurumu,
  yuklendi: true,
  saglayicilar: [{ kimlik: 'googleDrive', ad: 'Google Drive' }],
  mesgul: false,
  yenile: jest.fn(async () => undefined),
  esitle: jest.fn(async () => ({ tur: 'guncel' })),
  baglan: jest.fn(async () => ({ tur: 'tamam' })),
  uzakDurumu: jest.fn(async () => ({ tur: 'yok' })),
  kur: jest.fn(async (): Promise<{ tur: string; kod?: string }> => ({ tur: 'yuklendi' })),
  kapat: jest.fn(async () => ({ basarili: true })),
};

jest.mock('../../../hooks/useEsitleme', () => ({
  useEsitleme: () => mockKanca,
  esitlemeHataMetni: (kod: string) => `hata:${kod}`,
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#fff',
    kartArkaplan: '#eee',
    birincil: '#0a0',
    birincilMetin: '#fff',
    metin: '#111',
    metinIkincil: '#555',
    sinir: '#ccc',
    hata: '#f00',
    bilgi: '#00f',
    basarili: '#0f0',
  }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
const mockKisaBildirim = jest.fn();
jest.mock('../../../components/common/KisaBildirim', () => ({
  kisaBildirimGoster: (...a: unknown[]) => mockKisaBildirim(...a),
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

const kapaliDurum = (): EsitlemeDurumu => ({
  aktif: false,
  saglayici: null,
  sonEtiket: null,
  sonOzet: null,
  sonEsitleme: null,
  sonHata: null,
});

describe('EsitlemeSayfasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKanca.durum = kapaliDurum();
    mockKanca.saglayicilar = [{ kimlik: 'googleDrive', ad: 'Google Drive' }];
    mockKanca.uzakDurumu.mockResolvedValue({ tur: 'yok' });
    mockKanca.kur.mockResolvedValue({ tur: 'yuklendi' });
    mockKanca.baglan.mockResolvedValue({ tur: 'tamam' });
  });

  it('varsayılan KAPALI; açmak önce rıza ister (ne gider, kim görür, kurtarma yok)', async () => {
    const { getByLabelText, getByText } = render(<EsitlemeSayfasi />);
    expect(getByText('Kapalı')).toBeTruthy();
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
    expect(getByText(/Parolanızı unutursanız buluttaki veri kurtarılamaz/)).toBeTruthy();
    expect(getByText(/Ayarlarınız ve konumunuz her cihazda ayrı kalır/)).toBeTruthy();
    expect(mockKanca.baglan).not.toHaveBeenCalled();
  });

  it('ilk cihaz: bağlanır, parolayı İKİ KEZ ister, eşleşmezse uyarır, eşleşince kurar', async () => {
    const { getByLabelText, getByText, findByText } = render(<EsitlemeSayfasi />);
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
    fireEvent.press(getByText('Anladım, devam edin'));

    await findByText('Eşitleme parolası oluşturun');
    expect(mockKanca.baglan).toHaveBeenCalledWith('googleDrive');

    fireEvent.changeText(getByLabelText('Parola'), 'uzun bir parola');
    fireEvent.changeText(getByLabelText('Parola (tekrar)'), 'başka bir parola');
    fireEvent.press(getByText('Parolayı kaydedin'));
    expect(getByText(/Parolalar aynı değil/)).toBeTruthy();
    expect(mockKanca.kur).not.toHaveBeenCalled();

    fireEvent.changeText(getByLabelText('Parola (tekrar)'), 'uzun bir parola');
    await act(async () => {
      fireEvent.press(getByText('Parolayı kaydedin'));
    });
    expect(mockKanca.kur).toHaveBeenCalledWith('googleDrive', 'uzun bir parola', 'baslat');
    expect(mockKisaBildirim).toHaveBeenCalled();
  });

  it('iCloud hesabı yoksa seçmeden ÖNCE söylenir ve düğme pasif kalır', async () => {
    const ic = require('../../../../../modules/expo-icloud-esitleme/src');
    ic.icloudModuluVarMi.mockReturnValue(true);
    ic.icloudHesapVarMi.mockResolvedValue(false);
    mockKanca.saglayicilar = [
      { kimlik: 'googleDrive', ad: 'Google Drive' },
      { kimlik: 'icloud', ad: 'iCloud' },
    ];
    const { getByLabelText, getByText, findByText } = render(<EsitlemeSayfasi />);
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
    fireEvent.press(getByText('Anladım, devam edin'));
    await findByText(/iCloud'a giriş yapılmamış/);
    fireEvent.press(getByText('iCloud'));
    expect(mockKanca.baglan).not.toHaveBeenCalled();
    ic.icloudModuluVarMi.mockReturnValue(false);
  });

  it('iCloud hesabı BİLİNMİYORSA (köprü hatası → null) engel yazılmaz, iCloud seçilebilir', async () => {
    const ic = require('../../../../../modules/expo-icloud-esitleme/src');
    ic.icloudModuluVarMi.mockReturnValue(true);
    ic.icloudHesapVarMi.mockResolvedValue(null);
    mockKanca.saglayicilar = [
      { kimlik: 'googleDrive', ad: 'Google Drive' },
      { kimlik: 'icloud', ad: 'iCloud' },
    ];
    try {
      const { getByLabelText, getByText, queryByText } = render(<EsitlemeSayfasi />);
      fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
      fireEvent.press(getByText('Anladım, devam edin'));
      await waitFor(() => expect(ic.icloudHesapVarMi).toHaveBeenCalled());
      await act(async () => {
        await Promise.resolve();
      });
      expect(queryByText(/iCloud'a giriş yapılmamış/)).toBeNull();
      await act(async () => {
        fireEvent.press(getByText('iCloud'));
      });
      expect(mockKanca.baglan).toHaveBeenCalledWith('icloud');
    } finally {
      ic.icloudModuluVarMi.mockReturnValue(false);
      ic.icloudHesapVarMi.mockResolvedValue(false);
    }
  });

  it('kısa parola kabul edilmez', async () => {
    const { getByLabelText, getByText, findByText } = render(<EsitlemeSayfasi />);
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
    fireEvent.press(getByText('Anladım, devam edin'));
    await findByText('Eşitleme parolası oluşturun');
    fireEvent.changeText(getByLabelText('Parola'), 'kisa');
    fireEvent.changeText(getByLabelText('Parola (tekrar)'), 'kisa');
    fireEvent.press(getByText('Parolayı kaydedin'));
    expect(getByText(/en az 10 karakter/)).toBeTruthy();
    expect(mockKanca.kur).not.toHaveBeenCalled();
  });

  it('ikinci cihaz: uzakta veri varsa parolayı BİR kez ister; yanlışsa akışta kalır, "unuttum" sıfırlamaya götürür', async () => {
    mockKanca.uzakDurumu.mockResolvedValue({ tur: 'var' });
    mockKanca.kur.mockResolvedValueOnce({ tur: 'hata', kod: 'parolaYanlis' });
    const { getByLabelText, getByText, findByText, queryByLabelText } = render(<EsitlemeSayfasi />);
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', true);
    fireEvent.press(getByText('Anladım, devam edin'));

    await findByText('Eşitleme parolanızı girin');
    expect(queryByLabelText('Parola (tekrar)')).toBeNull();
    fireEvent.changeText(getByLabelText('Parola'), 'yanlış parola');
    await act(async () => {
      fireEvent.press(getByText('Eşitlemeyi başlatın'));
    });
    expect(getByText(/Parola eşleşmedi/)).toBeTruthy();

    fireEvent.press(getByText('Parolamı unuttum'));
    fireEvent.press(getByText('Buluttakini silin ve yeniden başlayın'));
    await findByText('Eşitleme parolası oluşturun');
    fireEvent.changeText(getByLabelText('Parola'), 'yepyeni parola 1');
    fireEvent.changeText(getByLabelText('Parola (tekrar)'), 'yepyeni parola 1');
    await act(async () => {
      fireEvent.press(getByText('Parolayı kaydedin'));
    });
    expect(mockKanca.kur).toHaveBeenLastCalledWith('googleDrive', 'yepyeni parola 1', 'sifirla');
  });

  it('açıkken son eşitleme zamanı + "Şimdi eşitleyin"; hata çözüm düğmesi', async () => {
    mockKanca.durum = {
      ...kapaliDurum(),
      aktif: true,
      saglayici: 'googleDrive',
      sonEsitleme: '2026-10-13T11:05:00.000Z',
      sonHata: 'yetkiYok',
    };
    const { getByText, getByLabelText } = render(<EsitlemeSayfasi />);
    expect(getByText('Açık · Google Drive')).toBeTruthy();
    expect(getByText('hata:yetkiYok')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByLabelText('Yeniden bağlanın'));
    });
    expect(mockKanca.baglan).toHaveBeenCalledWith('googleDrive', true);
    expect(mockKanca.esitle).toHaveBeenCalled();
  });

  it('kapatma: buluttakini de silme seçeneği', async () => {
    mockKanca.durum = { ...kapaliDurum(), aktif: true, saglayici: 'googleDrive' };
    const { getByText, getByLabelText } = render(<EsitlemeSayfasi />);
    fireEvent(getByLabelText('Cihazlar arası eşitleme'), 'valueChange', false);
    await act(async () => {
      fireEvent.press(getByText('Buluttaki veriyi de silin'));
    });
    expect(mockKanca.kapat).toHaveBeenCalledWith(true);
  });

  it('sağlayıcı yoksa yalnız bilgi satırı', () => {
    mockKanca.saglayicilar = [];
    const { getByText, queryByLabelText } = render(<EsitlemeSayfasi />);
    expect(getByText(/Bu sürümde eşitleme hizmeti etkin değil/)).toBeTruthy();
    expect(queryByLabelText('Cihazlar arası eşitleme')).toBeNull();
  });

  it('esitlemeZamaniniBicimle', () => {
    expect(esitlemeZamaniniBicimle(null)).toBe('Henüz eşitlenmedi');
    expect(esitlemeZamaniniBicimle('bozuk')).toBe('Henüz eşitlenmedi');
    const t = new Date(2026, 9, 13, 9, 5);
    expect(esitlemeZamaniniBicimle(t.toISOString())).toBe('13.10.2026 09:05');
  });

  it('yenileme odakta çağrılır', async () => {
    render(<EsitlemeSayfasi />);
    await waitFor(() => expect(mockKanca.yenile).toHaveBeenCalled());
  });
});
