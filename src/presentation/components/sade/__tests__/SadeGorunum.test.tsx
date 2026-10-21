/**
 * Sade görünüm bileşeni (issue #295). Karar mantığı saf çekirdekte (kendi testi
 * var); burada yalnız ÇİZİM ve dokunuş bağlantıları ölçülür.
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';

// nativewind fabrikada createElement'e izin vermez → düz string (AGENTS.md Seri dersi).
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Svg: 'Svg', Circle: 'Circle' }));
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    basarili: '#4CAF50',
    birincil: '#4CAF50',
    birincilKoyu: '#388E3C',
    birincilMetin: '#FFFFFF',
  }),
}));
const mockSesliOku = jest.fn((_m: string) => true);
const mockDestek = { var: true };
jest.mock('../../../../domain/services/SesliOkumaServisi', () => ({
  sesliOku: (m: string) => mockSesliOku(m),
  sesliOkumaDestekleniyorMu: () => mockDestek.var,
}));
const mockTts = { deger: null as boolean | null };
jest.mock('../../../hooks/useTurkceTtsDestegi', () => ({ useTurkceTtsDestegi: () => mockTts.deger }));

import { SadeGorunum, type SadeGorunumProps } from '../SadeGorunum';

const SIMDI = Date.now();
const props = (ek: Partial<SadeGorunumProps> = {}): SadeGorunumProps => ({
  vakit: 'ikindi',
  giris: new Date(SIMDI - 60 * 60000),
  sonrakiGirisIso: new Date(SIMDI + 42 * 60000 - 1000).toISOString(),
  sonrakiVakit: 'aksam',
  tamamlandi: false,
  kayitHazir: true,
  mekruhMu: false,
  cumaEtiketi: false,
  onKildim: jest.fn(),
  onTumUygulama: jest.fn(),
  ...ek,
});

describe('SadeGorunum', () => {
  let ekranOkuyucu: jest.SpyInstance;
  let duyuru: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDestek.var = true;
    mockTts.deger = null;
    ekranOkuyucu = jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    duyuru = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  const kur = async (p: SadeGorunumProps) => {
    const ekran = render(<SadeGorunum {...p} />);
    await act(async () => {
      await Promise.resolve();
    });
    return ekran;
  };

  it('issue örneği: "Şimdi İkindi · 42 dk · Kıldım" + sıradaki vakit', async () => {
    const p = props();
    const e = await kur(p);
    expect(e.getByTestId('sade-vakit-adi').props.children).toBe('İkindi');
    expect(e.getByTestId('sade-kalan').props.children).toBe('42 dk');
    expect(e.getByText('Kıldım')).toBeTruthy();
    expect(e.getByTestId('sade-sonraki').props.children).toMatch(/^Akşam · \d\d:\d\d$/);
    fireEvent.press(e.getByTestId('sade-kildim'));
    expect(p.onKildim).toHaveBeenCalledTimes(1);
  });

  it('kılındıysa düğme "Kılındı" ve basılamaz', async () => {
    const p = props({ tamamlandi: true });
    const e = await kur(p);
    expect(e.getByText('Kılındı')).toBeTruthy();
    expect(e.getByTestId('sade-kildim').props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(e.getByTestId('sade-kildim'));
    expect(p.onKildim).not.toHaveBeenCalled();
  });

  it('güneş → öğle arası: "Vakit henüz girmedi", basılamaz', async () => {
    const e = await kur(props({ vakit: 'gunes', sonrakiVakit: 'ogle' }));
    expect(e.getByTestId('sade-vakit-adi').props.children).toBe('Öğle');
    expect(e.getByText('Vakit henüz girmedi')).toBeTruthy();
    expect(e.getByTestId('sade-kildim').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('kerahatte düğme AÇIK kalır, bilgi satırı görünür', async () => {
    const e = await kur(props({ mekruhMu: true }));
    expect(e.getByTestId('sade-kildim').props.accessibilityState).toMatchObject({ disabled: false });
    expect(e.getByText(/kerahat vakti/)).toBeTruthy();
  });

  it('halkaya dokununca sesli okunur — metin halkanın erişilebilirlik etiketiyle aynı', async () => {
    const e = await kur(props());
    const halka = e.getByTestId('sade-halka');
    fireEvent.press(halka);
    expect(mockSesliOku).toHaveBeenCalledWith(halka.props.accessibilityLabel);
    expect(mockSesliOku.mock.calls[0][0]).toMatch(/^Şimdi ikindi vakti\. Çıkmasına 42 dakika var\./);
  });

  it('ekran okuyucu açıksa TTS KONUŞMAZ (iki ses binmesin) — duyuru yapılır', async () => {
    ekranOkuyucu.mockResolvedValue(true);
    const e = await kur(props());
    fireEvent.press(e.getByTestId('sade-halka'));
    expect(mockSesliOku).not.toHaveBeenCalled();
    expect(duyuru).toHaveBeenCalledWith(expect.stringMatching(/^Şimdi ikindi vakti/));
  });

  it('Türkçe ses paketi yoksa yön gösteren not; bilinmiyorsa (null) not YOK', async () => {
    const e = await kur(props());
    expect(e.queryByText(/Türkçe konuşma sesini/)).toBeNull();
    mockTts.deger = false;
    const e2 = await kur(props());
    expect(e2.getByText(/Türkçe konuşma sesini/)).toBeTruthy();
  });

  it('"Tüm uygulamayı açın" bağlantısı çağrılır', async () => {
    const p = props();
    const e = await kur(p);
    fireEvent.press(e.getByLabelText('Tüm uygulamayı açın'));
    expect(p.onTumUygulama).toHaveBeenCalled();
  });

  it('kılındı geçişinde ekran okuyucuya duyurulur', async () => {
    const p = props();
    const e = await kur(p);
    e.rerender(<SadeGorunum {...p} tamamlandi />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(duyuru).toHaveBeenCalledWith('İkindi namazı kılındı olarak işaretlendi');
  });
});
