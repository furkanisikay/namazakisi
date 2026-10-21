/**
 * NÖBETÇİ (denetim D-16): rozet/uyarı/"Yeni" animasyonları tek kapıdan geçer
 * (`components/hareket/dongu`). Eskiden temizliksiz `Animated.loop`'lar İlerleme
 * sekmesinden çıkınca ve Ayarlar'da sonsuza dek dönüyordu. `Animated.loop` ve
 * `Animated.sequence` sahtelenir — gerçek zamanlayıcı kurulmaz (CI asılma dersi).
 */
import * as React from 'react';
import { Animated, AppState } from 'react-native';
import { act, render } from '@testing-library/react-native';

let mockAzalt = false;
jest.mock('../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => mockAzalt }));
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));

import { RozetKarti } from '../RozetKarti';
import { YeniRozet } from '../YeniRozet';
import { ToparlanmaKarti } from '../ToparlanmaKarti';
import type { RozetDetay } from '../../../core/types/SeriTipleri';

const KAZANILMIS: RozetDetay = {
  id: 'ilk_adim',
  rozetId: 'ilk_adim',
  ad: 'İlk Adım',
  aciklama: 'İlk haftayı tamamladınız!',
  ikon: '🌱',
  tip: 'seri',
  seviye: 'bronz',
  kosul: 7,
  kazanildiMi: true,
  kazanilmaTarihi: '2026-01-01',
} as RozetDetay;

describe('D-16 — döngü kapısı', () => {
  let donguBaslat: jest.Mock;
  let donguDurdur: jest.Mock;
  let siraBaslat: jest.Mock;
  let loopCasusu: jest.SpyInstance;
  let appStateDinleyici: ((d: string) => void) | null;

  beforeEach(() => {
    mockAzalt = false;
    donguBaslat = jest.fn();
    donguDurdur = jest.fn();
    siraBaslat = jest.fn();
    loopCasusu = jest
      .spyOn(Animated, 'loop')
      .mockReturnValue({ start: donguBaslat, stop: donguDurdur, reset: jest.fn() } as unknown as Animated.CompositeAnimation);
    jest
      .spyOn(Animated, 'sequence')
      .mockReturnValue({ start: siraBaslat, stop: jest.fn(), reset: jest.fn() } as unknown as Animated.CompositeAnimation);
    appStateDinleyici = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, cb: (d: string) => void) => {
      appStateDinleyici = cb;
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener);
  });

  afterEach(() => jest.restoreAllMocks());

  it('RozetKarti: kazanılmış rozetin parlaması arka planda DURUR, unmount\'ta temizlenir', () => {
    const r = render(<RozetKarti rozet={KAZANILMIS} />);
    expect(donguBaslat).toHaveBeenCalledTimes(1);
    act(() => appStateDinleyici?.('background'));
    expect(donguDurdur).toHaveBeenCalledTimes(1);
    act(() => appStateDinleyici?.('active'));
    expect(donguBaslat).toHaveBeenCalledTimes(2);
    r.unmount();
    expect(donguDurdur).toHaveBeenCalledTimes(2);
  });

  it('RozetKarti: kilitli rozette ve "Animasyonları azalt"ta döngü HİÇ kurulmaz', () => {
    render(<RozetKarti rozet={{ ...KAZANILMIS, kazanildiMi: false }} />);
    mockAzalt = true;
    render(<RozetKarti rozet={KAZANILMIS} />);
    expect(donguBaslat).not.toHaveBeenCalled();
  });

  it('ToparlanmaKarti: ikon nabzı odak dışında durur', () => {
    const { NavigationContext } = require('@react-navigation/native');
    const dinleyiciler: Record<string, () => void> = {};
    const gezinme = {
      isFocused: () => true,
      addListener: (olay: string, cb: () => void) => {
        dinleyiciler[olay] = cb;
        return () => undefined;
      },
    };
    render(
      <NavigationContext.Provider value={gezinme}>
        <ToparlanmaKarti
          toparlanmaDurumu={{ tamamlananGun: 1, hedefGunSayisi: 2, baslangicTarihi: '2026-01-01', oncekiSeri: 10 }}
          oncekiSeri={10}
        />
      </NavigationContext.Provider>,
    );
    expect(donguBaslat).toHaveBeenCalledTimes(1);
    act(() => dinleyiciler.blur());
    expect(donguDurdur).toHaveBeenCalledTimes(1);
  });

  it('YeniRozet (ayar listesi): sonsuz döngü YOK, yalnız BİR KEZ oynar', () => {
    const r = render(<YeniRozet />);
    expect(loopCasusu).not.toHaveBeenCalled();
    expect(siraBaslat).toHaveBeenCalledTimes(1);
    // Arka plan → ön plan dönüşü yeniden OYNATMAZ.
    act(() => appStateDinleyici?.('background'));
    act(() => appStateDinleyici?.('active'));
    r.rerender(<YeniRozet etiket="Yeni" />);
    expect(siraBaslat).toHaveBeenCalledTimes(1);
  });
});
