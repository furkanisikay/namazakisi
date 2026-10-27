/**
 * Metin kapısı — NativeWind/css-interop ile BİRLİKTE çalıştığının kanıtı.
 *
 * `react-native-css-interop/test` gerçek css-interop çalışma zamanını kurar ve CSS'i kaydeder:
 * `className="text-lg"` çözülüp kapıya ÇÖZÜLMÜŞ stil olarak gelir (punto + satır yüksekliği),
 * kapı rakamları/yazı tipini uygular, ham `Text` çizilir. Testler babel'in `jsxImportSource:
 * nativewind` dönüşümüyle derlenir: uygulamadaki `<Text>` ile aynı yol.
 */
import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, registerCSS, render, screen, setupAllComponents } from 'react-native-css-interop/test';
import { aktifDiliKur, aktifDilSifirla, rakamSisteminiKur } from '../../../../core/dil/aktifDil';
import {
  MetinKapisi,
  NASTALIK_AILESI,
  NASTALIK_KALIN,
  metinKapisiniKur,
  nastalikStili,
  nastalikYuklendiKur,
} from '../MetinKapisi';

jest.mock('expo-font', () => ({ useFonts: () => [true] }));

let kaldir: () => void = () => undefined;

const CSS = '.text-lg { font-size: 18px; line-height: 28px; } .font-bold { font-weight: 700; }';

beforeEach(() => {
  setupAllComponents();
  registerCSS(CSS);
  kaldir = metinKapisiniKur();
});

afterEach(() => {
  kaldir();
  act(() => {
    aktifDilSifirla();
    nastalikYuklendiKur(false);
  });
});

const stil = (metin: string) => StyleSheet.flatten(screen.getByText(metin).props.style) ?? {};

describe('Türkçe (kapı kapalı)', () => {
  it('metne dokunmaz ve kapı bileşenini HİÇ çizmez (sıfır maliyet); className yine çözülür', () => {
    render(<Text className="text-lg">12:05</Text>);
    expect(stil('12:05')).toMatchObject({ fontSize: 18, lineHeight: 28 });
    expect(screen.UNSAFE_queryAllByType(MetinKapisi)).toHaveLength(0);
  });
});

describe('Arapça', () => {
  beforeEach(() => {
    act(() => {
      aktifDiliKur('ar');
    });
  });

  it('Doğu Arap rakamına çevirir; NativeWind stili korunur', () => {
    render(<Text className="text-lg">05:12 · 1447</Text>);
    expect(stil('٠٥:١٢ · ١٤٤٧')).toMatchObject({ fontSize: 18, lineHeight: 28 });
    expect(screen.queryByText('05:12 · 1447')).toBeNull();
  });

  it('sayı çocuğu ve karışık çocuk dizisi de çevrilir; iç Text kendi kapısından geçer', () => {
    render(
      <Text>
        {3} / {'10'} <Text>dk 45</Text>
      </Text>
    );
    expect(screen.getByText('dk ٤٥')).toBeTruthy();
    expect(screen.getByText(/٣ \/ ١٠/)).toBeTruthy();
  });

  it('Fragment içindeki rakamlar da çevrilir (BirimliSure geri sayımı)', () => {
    render(
      <Text testID="sure">
        {[5, 12].map((n, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            {String(n).padStart(2, '0')}
            <Text>{' dk'}</Text>
          </React.Fragment>
        ))}
      </Text>
    );
    expect(screen.getByText(/٠٥/)).toBeTruthy();
    expect(screen.getByText(/١٢/)).toBeTruthy();
    expect(screen.queryByText(/05/)).toBeNull();
  });

  it('rakamKoru metne dokunmaz ve prop native bileşene sızmaz', () => {
    render(<Text rakamKoru>1.2.3 (456)</Text>);
    const t = screen.getByText('1.2.3 (456)');
    expect(t.props.rakamKoru).toBeUndefined();
    expect(t.props.cssInterop).toBeUndefined();
  });

  it('Batı rakamı seçilince (Mağrip) dokunmaz; seçim değişince çizili metin güncellenir', () => {
    act(() => {
      rakamSisteminiKur('latn');
    });
    render(<Text>2026</Text>);
    expect(screen.getByText('2026')).toBeTruthy();
    act(() => {
      rakamSisteminiKur('arab');
    });
    expect(screen.getByText('٢٠٢٦')).toBeTruthy();
  });

  it('ref ham Text örneğine ulaşır', () => {
    const ref = React.createRef<React.ComponentRef<typeof Text>>();
    render(<Text ref={ref}>1</Text>);
    expect(ref.current).not.toBeNull();
  });
});

describe('Urduca', () => {
  beforeEach(() => {
    act(() => {
      aktifDiliKur('ur');
    });
  });

  it('Batı rakamı kalır; yazı tipi yüklenmeden sistem yazı tipi', () => {
    render(<Text className="text-lg">12</Text>);
    expect(stil('12').fontFamily).toBeUndefined();
  });

  it('yüklenince Nestalik ailesi verilir; className satır yüksekliği ≥ 1.8 × punto', () => {
    act(() => {
      nastalikYuklendiKur(true);
    });
    render(<Text className="text-lg">نماز 12</Text>);
    // text-lg: 18 / 28 → 28 < 18 × 1.8 = 32.4 → 33
    expect(stil('نماز 12')).toMatchObject({ fontFamily: NASTALIK_AILESI, fontSize: 18, lineHeight: 33 });
  });

  it('kalın metin kalın dosyayı alır (ağırlık normal); açık yazı tipine dokunulmaz', () => {
    act(() => {
      nastalikYuklendiKur(true);
    });
    render(
      <>
        <Text className="font-bold">عصر</Text>
        <Text style={{ fontWeight: '600', lineHeight: 40, fontSize: 16 }}>مغرب</Text>
        <Text style={{ fontFamily: 'AmiriQuran', lineHeight: 20 }}>آية</Text>
      </>
    );
    expect(stil('عصر')).toMatchObject({ fontFamily: NASTALIK_KALIN, fontWeight: 'normal' });
    // 40 ≥ 16 × 1.8 → olduğu gibi
    expect(stil('مغرب')).toMatchObject({ fontFamily: NASTALIK_KALIN, lineHeight: 40 });
    expect(stil('آية')).toMatchObject({ fontFamily: 'AmiriQuran', lineHeight: 20 });
  });

  it('adjustsFontSizeToFit küçültmesi en çok 0.85', () => {
    render(
      <Text adjustsFontSizeToFit minimumFontScale={0.5}>
        وقت
      </Text>
    );
    expect(screen.getByText('وقت').props.minimumFontScale).toBe(0.85);
  });

  it('rakamKoru yazı tipine de dokunmaz', () => {
    act(() => {
      nastalikYuklendiKur(true);
    });
    render(<Text rakamKoru>1234567</Text>);
    expect(stil('1234567').fontFamily).toBeUndefined();
  });
});

describe('nastalikStili', () => {
  it('satır yüksekliği yoksa eklemez (yazı tipinin kendi ölçüsü 2.5 em)', () => {
    expect(nastalikStili({ fontSize: 20 })).toEqual({ fontFamily: NASTALIK_AILESI, fontWeight: 'normal' });
  });
  it('punto yoksa 14 sayılır', () => {
    expect(nastalikStili({ lineHeight: 20 })?.lineHeight).toBe(26);
  });
});

describe('dil değişimi', () => {
  it('Türkçeye dönünce kapı kaydı özgün sarmalayıcıya döner', () => {
    act(() => {
      aktifDiliKur('ar');
    });
    act(() => {
      aktifDiliKur('tr');
    });
    render(<Text className="text-lg">7</Text>);
    expect(screen.UNSAFE_queryAllByType(MetinKapisi)).toHaveLength(0);
    expect(stil('7')).toMatchObject({ fontSize: 18 });
  });
});
