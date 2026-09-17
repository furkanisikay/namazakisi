/**
 * Anahtar — Android'de props DOKUNULMADAN gecer, iOS'ta yerel gorunum.
 * (iPhone ic testinde Android renkleriyle anahtarlar bozuk gorunuyordu.)
 */
// Platform MODULUNU mock'lama: RN ic parcalari (safe-area/css-interop) bozulur
// (AGENTS.md'de kayitli). Yalniz `OS` ozelligi test basina degistirilir.
import React from 'react';
import { Platform, Switch } from 'react-native';
import { render } from '@testing-library/react-native';
import { Anahtar, iosIzRengi, IOS_RENKLI_ZEMIN_IZI } from '../Anahtar';

const ANDROID_PROPS = {
  value: true,
  onValueChange: jest.fn(),
  trackColor: { false: '#E0E0E0', true: '#4CAF5060' },
  thumbColor: '#4CAF50',
};

describe('iosIzRengi', () => {
  it('alfali hex opak olur', () => expect(iosIzRengi('#4CAF5060')).toBe('#4CAF50'));
  it('opak hex aynen kalir', () => expect(iosIzRengi('#FFC0CB')).toBe('#FFC0CB'));
  it('renkli zemindeki yari saydam beyaz koyu tule doner', () =>
    expect(iosIzRengi('rgba(255,255,255,0.4)')).toBe(IOS_RENKLI_ZEMIN_IZI));
  it('tanimsiz aynen doner', () => expect(iosIzRengi(undefined)).toBeUndefined());
});

describe('Anahtar', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('iOS: renkli basparmak ATILIR, iz opak, kapali iz ios_backgroundColor', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { UNSAFE_getByType } = render(<Anahtar {...ANDROID_PROPS} />);
    const props = UNSAFE_getByType(Switch).props;

    expect(props.thumbColor).toBeUndefined();
    expect(props.trackColor).toEqual({ false: '#E0E0E0', true: '#4CAF50' });
    expect(props.ios_backgroundColor).toBe('#E0E0E0');
  });

  it('Android: props birebir aynen gecer', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { UNSAFE_getByType } = render(<Anahtar {...ANDROID_PROPS} />);
    const props = UNSAFE_getByType(Switch).props;

    expect(props.thumbColor).toBe('#4CAF50');
    expect(props.trackColor).toEqual(ANDROID_PROPS.trackColor);
  });
});
