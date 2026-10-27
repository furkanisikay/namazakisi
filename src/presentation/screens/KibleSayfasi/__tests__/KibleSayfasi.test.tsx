import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { I18nManager, StyleSheet, type ViewStyle } from 'react-native';
import { KibleSayfasi } from '../KibleSayfasi';
import { kalibrasyonOturumunuSifirla } from '../KalibrasyonRehberi';
import { useKible } from '../../../hooks/useKible';
import { useIsFocused } from '@react-navigation/native';
import { useRenkler } from '../../../../core/theme';
import { HaptikServisi } from '../../../../core/feedback/HaptikServisi';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('../../../hooks/useKible', () => {
  const gercek = jest.requireActual('../../../hooks/useKible');
  return { ...gercek, useKible: jest.fn() };
});
jest.mock('@react-navigation/native');
const mockKonum = {
  konumModu: 'manuel',
  gpsAdres: null,
  seciliIlceAdi: 'Fatih',
  seciliIlAdi: 'İstanbul',
};
jest.mock('../../../store/hooks', () => ({
  useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: mockKonum }),
}));
jest.mock('../../../../core/theme');
jest.mock('../../../../core/feedback/HaptikServisi', () => ({
  HaptikServisi: { basariTitresimi: jest.fn(() => Promise.resolve()) },
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));
// Düz dize bileşenler (nativewind/jest-hoist: fabrikada createElement YOK — AGENTS.md).
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Circle: 'Circle',
  Line: 'Line',
  Path: 'Path',
  G: 'G',
  Text: 'SvgText',
  Defs: 'Defs',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
}));
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const kamera = require('expo-camera');

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#2E7D32',
  birincilMetin: '#ffffff',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  hata: '#ff0000',
  dikkat: '#E65100',
  durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const ozet = (o: Partial<{ hazir: boolean; baslik: number; fark: number | null; hizali: boolean; dik: boolean }> = {}) => ({
  hazir: true,
  baslik: 140,
  fark: 12,
  hizali: false,
  dik: false,
  ...o,
});

function kibleDurumu(ek: Record<string, unknown> = {}) {
  return {
    kibleAcisi: 151.6,
    konum: { lat: 41.0082, lng: 28.9784 },
    ozet: ozet(),
    abone: jest.fn(() => () => undefined),
    vektorGuvenilir: true,
    izinVerildi: true,
    yukleniyor: false,
    hata: null,
    izinTekrarSorulabilir: null,
    pusulaDogrulugu: 3,
    pusulaVar: true,
    teshis: { alanBozuk: false, tutarsiz: false },
    izinIste: jest.fn(),
    ...ek,
  };
}

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('KibleSayfasi', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Kayıtlı görünüm testler arası sızmasın (Kamera seçen test sonrakini Kamera'da açardı).
    await AsyncStorage.clear?.();
    (useIsFocused as jest.Mock).mockReturnValue(true);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu());
    kamera.__izinAyarla({ granted: false, canAskAgain: true, status: 'undetermined' });
  });

  it('başlık ve iki mod; varsayılan Pusula (internetsiz, kamerasız)', () => {
    const { getByText, getByLabelText, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    expect(getByText('Kıble')).toBeTruthy();
    expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText('Kamera modu')).toBeTruthy();
    expect(getByTestId('kible-mod-aciklamasi').props.children).toContain('çentiğe');
    expect(queryByTestId('back-button')).toBeNull();
  });

  it('dış site / WebView YOK: kamera modu kendi görünümümüz', () => {
    const { getByLabelText, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    fireEvent.press(getByLabelText('Kamera modu'));
    expect(queryByTestId('mock-webview')).toBeNull();
    expect(getByTestId('kible-mod-aciklamasi').props.children).toContain('dik tutun');
  });

  it('odakta değilken hiçbir görünüm çizilmez ve sensörler kapalı istenir', () => {
    (useIsFocused as jest.Mock).mockReturnValue(false);
    const { queryByTestId } = render(<KibleSayfasi />);
    expect(useKible).toHaveBeenCalledWith(false);
    expect(queryByTestId('kible-yon-cumlesi')).toBeNull();
  });

  it('pusula: yön cümlesi, mesafe ve kıble açısı', () => {
    const { getByTestId, getByText } = render(<KibleSayfasi />);
    expect(getByTestId('kible-yon-cumlesi').props.children).toBe('Kıble 12° sağınızda');
    expect(getByText(/Kâbe 2\.\d{3} km uzakta, kuzeyden 152°/)).toBeTruthy();
    expect(getByTestId('kible-kabe-isareti')).toBeTruthy();
  });

  it('ilk yön okuması gelmeden "hazırlanıyor"; konum yoksa "konumunuz alınıyor"', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ hazir: false }) }));
    const a = render(<KibleSayfasi />);
    expect(a.getByTestId('kible-yon-cumlesi').props.children).toBe('Pusula hazırlanıyor…');
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ kibleAcisi: null, konum: null, ozet: ozet({ fark: null }) }));
    const b = render(<KibleSayfasi />);
    expect(b.getByTestId('kible-yon-cumlesi').props.children).toBe('Konumunuz alınıyor…');
  });

  it('hizalıyken onay işareti ve titreşim YALNIZ girişte bir kez', () => {
    const { rerender, getByTestId, queryByTestId } = render(<KibleSayfasi />);
    expect(queryByTestId('kible-hiza-onayi')).toBeNull();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 2, hizali: true }) }));
    rerender(<KibleSayfasi />);
    expect(getByTestId('kible-yon-cumlesi').props.children).toBe('Kıble yönündesiniz');
    expect(getByTestId('kible-hiza-onayi')).toBeTruthy();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 3, hizali: true, baslik: 149 }) }));
    rerender(<KibleSayfasi />);
    expect(HaptikServisi.basariTitresimi).toHaveBeenCalledTimes(1);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ fark: 20, hizali: false }) }));
    rerender(<KibleSayfasi />);
    expect(HaptikServisi.basariTitresimi).toHaveBeenCalledTimes(1); // çıkışta titreşim yok
  });

  it('telefon dikken pusulada "Kamerayla görün" önerisi kamera moduna geçirir', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ dik: true }) }));
    const { getByLabelText } = render(<KibleSayfasi />);
    fireEvent.press(getByLabelText('Kamerayla görün'));
    expect(getByLabelText('Kamera modu').props.accessibilityState).toEqual({ selected: true });
  });

  describe('kalibrasyon rehberi', () => {
    beforeEach(() => kalibrasyonOturumunuSifirla());

    it('doğruluk iyiyken ve teşhis temizken GÖRÜNMEZ (sürekli uyarı yok)', () => {
      const { queryByTestId } = render(<KibleSayfasi />);
      expect(queryByTestId('kalibrasyon-rehberi')).toBeNull();
    });

    it('doğruluk düşükken açılır; metal ipucu yok; eski ayrı uyarı bandı da yok', () => {
      (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaDogrulugu: 1 }));
      const { getByTestId, queryByTestId, getByText } = render(<KibleSayfasi />);
      expect(getByTestId('kalibrasyon-rehberi')).toBeTruthy();
      expect(getByText('Telefonunuzu havada 8 çizer gibi sallayın.')).toBeTruthy();
      expect(queryByTestId('kalibrasyon-metal-ipucu')).toBeNull();
      expect(queryByTestId('kible-kalibrasyon-belirgin')).toBeNull();
    });

    it('alan bozulmasında metal/mıknatıs ipucu; kamera görünümünde de AYNI rehber', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      (useKible as jest.Mock).mockReturnValue(kibleDurumu({ teshis: { alanBozuk: true, tutarsiz: false } }));
      const { getByTestId, getByLabelText } = render(<KibleSayfasi />);
      expect(getByTestId('kalibrasyon-metal-ipucu')).toBeTruthy();
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByTestId('kalibrasyon-rehberi')).toBeTruthy();
      expect(getByTestId('kalibrasyon-metal-ipucu')).toBeTruthy();
    });

    it('"Şimdi değil" kapatır ve o oturumda (mod değişse de) yeniden açılmaz', () => {
      (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaDogrulugu: 0 }));
      const { getByLabelText, queryByTestId } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Şimdi değil'));
      expect(queryByTestId('kalibrasyon-rehberi')).toBeNull();
      fireEvent.press(getByLabelText('Kamera modu'));
      fireEvent.press(getByLabelText('Pusula modu'));
      expect(queryByTestId('kalibrasyon-rehberi')).toBeNull();
    });
  });

  it('konum izni kapalıysa açıklamalı izin satırı (diyalog doğrudan açılmaz)', () => {
    (useKible as jest.Mock).mockReturnValue(
      kibleDurumu({ izinVerildi: false, hata: 'Kıble yönünü bulmak için konum izni gerekiyor.', izinTekrarSorulabilir: true }),
    );
    const { getByTestId } = render(<KibleSayfasi />);
    expect(getByTestId('kible-izin-satiri')).toBeTruthy();
  });

  it('yükleniyor ve genel hata', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ yukleniyor: true }));
    const a = render(<KibleSayfasi />);
    expect(a.getByText('Pusula başlatılıyor…')).toBeTruthy();
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ hata: 'Kıble servisi başlatılamadı.' }));
    const b = render(<KibleSayfasi />);
    expect(b.getByText('Kıble servisi başlatılamadı.')).toBeTruthy();
  });

  it('pusula algılayıcısı yoksa TAM statik pusula: kuzey yukarı, Kâbe 152°, büyük açı + yer, tek bilgi satırı', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaVar: false, ozet: ozet({ hazir: false, fark: null }) }));
    const { getByTestId, queryByTestId, getByText, queryByLabelText, UNSAFE_root } = render(<KibleSayfasi />);
    expect(getByTestId('kible-statik-aci').props.children).toEqual([152, '°']);
    expect(getByText(/^Fatih, İstanbul, Kâbe 2\.\d{3} km uzakta$/)).toBeTruthy();
    expect(getByTestId('kible-kabe-isareti')).toBeTruthy();
    // Yön harfleri SVG'de kadranla dönmez: ayrı, dik duran metin katmanı (G baş aşağı olmasın).
    const harfler = UNSAFE_root.findAll((n: { type: unknown; props: { children?: unknown } }) => n.type === 'SvgText');
    expect(harfler.length).toBe(0);
    for (const h of ['K', 'D', 'G', 'B']) expect(getByText(h)).toBeTruthy();
    expect(getByTestId('kible-statik-bilgi').props.children).toBe('Bu cihazda pusula yok; kuzeye göre yönü gösteriyoruz.');
    // Duruma uymayan yönerge ("çentiğe gelince…") ve dönen pusula ipuçları YOK.
    expect(queryByTestId('kible-mod-aciklamasi')).toBeNull();
    expect(queryByTestId('kible-yon-cumlesi')).toBeNull();
    expect(queryByLabelText('Kamerayla görün')).toBeNull();
  });

  it('yükleme ve hata ekranında mod açıklaması gizli; normalde tek satır', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ yukleniyor: true }));
    const a = render(<KibleSayfasi />);
    expect(a.queryByTestId('kible-mod-aciklamasi')).toBeNull();
    a.unmount();
    (useKible as jest.Mock).mockReturnValue(kibleDurumu());
    const b = render(<KibleSayfasi />);
    expect(b.getByTestId('kible-mod-aciklamasi').props.numberOfLines).toBe(1);
  });

  describe('son seçilen görünüm', () => {
    it('seçim kaydedilir; kamera izni varsa açılışta Kamera geri gelir', async () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const ilk = render(<KibleSayfasi />);
      await act(async () => {
        fireEvent.press(ilk.getByLabelText('Kamera modu'));
      });
      expect(await AsyncStorage.getItem('@namaz_akisi/kible_modu')).toBe('kamera');
      ilk.unmount();
      const ikinci = render(<KibleSayfasi />);
      await waitFor(() => expect(ikinci.getByLabelText('Kamera modu').props.accessibilityState).toEqual({ selected: true }));
    });

    it('kamera izni yoksa kayıt Kamera olsa da Pusula açılır (diyalog kendiliğinden çıkmaz)', async () => {
      await AsyncStorage.setItem('@namaz_akisi/kible_modu', 'kamera');
      const { getByLabelText } = render(<KibleSayfasi />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
      expect(kamera.__istek).not.toHaveBeenCalled();
    });
  });

  describe('kamera modu', () => {
    it('izin yoksa önce açıklama; "Kamerayı açın" sistem iznini ister', async () => {
      const { getByLabelText, getByText } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kıbleyi kamerayla görün')).toBeTruthy();
      expect(kamera.__istek).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.press(getByLabelText('Kamerayı açın'));
      });
      expect(kamera.__istek).toHaveBeenCalledTimes(1);
    });

    it('izin kalıcı reddedildiyse Ayarlar + pusulaya dönüş', () => {
      kamera.__izinAyarla({ granted: false, canAskAgain: false, status: 'denied' });
      const { getByLabelText, getByText } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kamera izni kapalı')).toBeTruthy();
      expect(getByLabelText('Ayarları açın')).toBeTruthy();
      fireEvent.press(getByLabelText('Pusulayı kullanın'));
      expect(getByLabelText('Pusula modu').props.accessibilityState).toEqual({ selected: true });
    });

    it('izin varken kamera önizlemesi + Kâbe işareti; dik değilse "dik tutun"', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const { getByLabelText, getByTestId, UNSAFE_root } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(UNSAFE_root.findAll((n: { type: unknown }) => n.type === 'CameraView').length).toBeGreaterThan(0);
      expect(getByTestId('kamera-kabe-isareti')).toBeTruthy();
      expect(getByTestId('kamera-yon-cumlesi').props.children).toBe('Telefonunuzu dik tutun');
    });

    it('yerdeki yol kamera görünümünde çizilir, ekran okuyucudan gizlidir ve kare aboneliğine bağlanır', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const durum = kibleDurumu();
      (useKible as jest.Mock).mockReturnValue(durum);
      const { getByLabelText, getByTestId } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      const yol = getByTestId('kible-yolu', { includeHiddenElements: true });
      expect(yol.props.accessibilityElementsHidden).toBe(true);
      expect(yol.props.pointerEvents).toBe('none');
      // Kâbe işareti + yol: iki ayrı kare aboneliği (pusula görünümü çizilmiyor).
      expect((durum.abone as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('eksenler bu cihazda güvenilmezse kamera görünümü açılmaz, pusula önerilir', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      (useKible as jest.Mock).mockReturnValue(kibleDurumu({ vektorGuvenilir: false }));
      const { getByLabelText, getByText, UNSAFE_root } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(getByText('Kamera görünümü bu telefonda kullanılamıyor')).toBeTruthy();
      expect(UNSAFE_root.findAll((n: { type: unknown }) => n.type === 'CameraView').length).toBe(0);
    });
  });

  // Coğrafi görünüm sağdan sola arayüzde AYNALANMAZ: Kâbe işareti `left:` + translateX ile
  // oturur, doğu sağdadır. Kapsayıcıda Yoga `direction: 'ltr'` (yon.ts > SOLDAN_SAGA).
  describe('sağdan sola arayüz', () => {
    let geriAl: () => void;
    beforeEach(() => {
      geriAl = jest.replaceProperty(I18nManager, 'isRTL', true).restore;
    });
    afterEach(() => geriAl());
    const ltrAtasiVar = (dugum: { parent: unknown; props: { style?: unknown } } | null): boolean => {
      for (let d = dugum; d; d = d.parent as typeof d) {
        if ((StyleSheet.flatten(d.props.style as ViewStyle) as ViewStyle | undefined)?.direction === 'ltr') return true;
      }
      return false;
    };

    it('pusula sahnesi soldan sağa sabit', () => {
      const { getByTestId } = render(<KibleSayfasi />);
      expect(ltrAtasiVar(getByTestId('kible-kabe-isareti') as never)).toBe(true);
      // Kontrol: ekranın geri kalanı (başlık, sekmeler) sabitlenmez.
      expect(ltrAtasiVar(getByTestId('kible-yon-cumlesi') as never)).toBe(false);
    });

    it('kamera görünümü soldan sağa sabit (sağ/sol okları fiziksel dönüş yönü)', () => {
      kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
      const { getByLabelText, getByTestId } = render(<KibleSayfasi />);
      fireEvent.press(getByLabelText('Kamera modu'));
      expect(ltrAtasiVar(getByTestId('kamera-kabe-isareti') as never)).toBe(true);
    });
  });
});

describe('KibleSayfasi — İngilizce', () => {
  // Türkçe harfsiz ama Türkçe sözcükler + kadrandaki tek harfli yön kısaltmaları (K/D/G/B).
  const YASAKLI = ['Pusula', 'Kamera', 'Kuzey', 'kuzey', 'Kabe', 'uzakta', 'Telefon', 'Konum', '^[KDGB]$'];
  let geriAl: () => void;
  const ilkKonum = { ...mockKonum };
  beforeEach(async () => {
    geriAl = ingilizceyeGec();
    jest.clearAllMocks();
    await AsyncStorage.clear?.();
    kalibrasyonOturumunuSifirla();
    Object.assign(mockKonum, { seciliIlceAdi: '', seciliIlAdi: 'London' });
    (useIsFocused as jest.Mock).mockReturnValue(true);
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu());
    kamera.__izinAyarla({ granted: false, canAskAgain: true, status: 'undetermined' });
  });
  afterEach(() => {
    Object.assign(mockKonum, ilkKonum);
    act(() => geriAl()); // bağlı ekran dil değişince act içinde yeniden çizilsin
  });
  const kalan = (agac: unknown) => turkceKalanlar(agac as never, YASAKLI);

  it('pusula: başlık, sekmeler, yön cümlesi, N/E/S/W, kalibrasyon rehberi', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ dik: true }), pusulaDogrulugu: 0, teshis: { alanBozuk: true, tutarsiz: false } }));
    const e = render(<KibleSayfasi />);
    expect(kalan(e.toJSON())).toEqual([]);
    expect(e.getByText('Qibla')).toBeTruthy();
    expect(e.getByText('The Qibla is 12° to your right')).toBeTruthy();
    for (const h of ['N', 'E', 'S', 'W']) expect(e.getByText(h)).toBeTruthy();
    expect(e.getByText('Calibrate the compass')).toBeTruthy();
  });

  it('hazırlanıyor, konum bekleniyor, hata ve statik pusula', () => {
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ ozet: ozet({ hazir: false }) }));
    expect(kalan(render(<KibleSayfasi />).toJSON())).toEqual([]);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ kibleAcisi: null, konum: null, ozet: ozet({ fark: null }) }));
    expect(kalan(render(<KibleSayfasi />).toJSON())).toEqual([]);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ yukleniyor: true }));
    expect(kalan(render(<KibleSayfasi />).toJSON())).toEqual([]);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ hata: "The Qibla service couldn't start." }));
    expect(kalan(render(<KibleSayfasi />).toJSON())).toEqual([]);
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ pusulaVar: false, ozet: ozet({ hazir: false, fark: null }) }));
    const statik = render(<KibleSayfasi />);
    expect(kalan(statik.toJSON())).toEqual([]);
    expect(statik.getByText(/London, Kaaba is 2,\d{3} km away/)).toBeTruthy();
  });

  const kameraModu = () => {
    const e = render(<KibleSayfasi />);
    fireEvent.press(e.getByLabelText('Camera mode'));
    return e;
  };
  it('kamera: izin açıklaması', () => {
    expect(kalan(kameraModu().toJSON())).toEqual([]);
  });
  it('kamera: kalıcı ret', () => {
    kamera.__izinAyarla({ granted: false, canAskAgain: false, status: 'denied' });
    expect(kalan(kameraModu().toJSON())).toEqual([]);
  });
  it('kamera: dik değil', () => {
    kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
    const dik = kameraModu();
    expect(kalan(dik.toJSON())).toEqual([]);
    expect(dik.getByText('Hold your phone upright')).toBeTruthy();
  });
  it('kamera: güvenilmez eksen', () => {
    kamera.__izinAyarla({ granted: true, canAskAgain: true, status: 'granted' });
    (useKible as jest.Mock).mockReturnValue(kibleDurumu({ vektorGuvenilir: false }));
    expect(kalan(kameraModu().toJSON())).toEqual([]);
  });
});
