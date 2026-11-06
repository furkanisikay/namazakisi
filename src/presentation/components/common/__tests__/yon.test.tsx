/**
 * Sağdan sola çizim kapısı (`yon.ts`, `YonluIkon`): yön anlamlı ikonlar aynalanır, yön anlamı
 * olmayanlar (medya, dairesel dönüş) aynalanmaz; kaymaların işareti döner; Arapça ayet her dilde
 * sağa yaslıdır. `isRTL` her çağrıda okunduğu için `jest.replaceProperty` ile kurulur.
 */
import React from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import {
  SOLDAN_SAGA,
  aynaStili,
  sagaYasliMetin,
  yatayIsaret,
  yonluIkonMu,
  yonluIkonStili,
} from '../yon';
import { YonluIkon } from '../YonluIkon';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (p: { name: string; style?: unknown }) => (
    <Text testID={`ikon-${p.name}`} style={p.style}>
      {p.name}
    </Text>
  );
});

const AYNA = { transform: [{ scaleX: -1 }] };

describe('yon (sağdan sola çizim kapısı)', () => {
  let geriAl: (() => void) | null = null;
  const sagdanSola = () => {
    geriAl = jest.replaceProperty(I18nManager, 'isRTL', true).restore;
  };
  afterEach(() => {
    geriAl?.();
    geriAl = null;
  });

  it('soldan sağa: hiçbir şey aynalanmaz, kayma işareti 1, ayet "right"', () => {
    expect(yonluIkonStili('chevron-right')).toBeUndefined();
    expect(aynaStili()).toBeUndefined();
    expect(yatayIsaret()).toBe(1);
    expect(sagaYasliMetin()).toEqual({ textAlign: 'right' });
  });

  it('sağdan sola: yönlü ikonlar aynalanır, kayma işareti -1, ayet doğal hizada (sağda) kalır', () => {
    sagdanSola();
    for (const ad of ['chevron-right', 'chevron-left', 'arrow-right', 'arrow-left', 'arrow-forward', 'sign-out-alt']) {
      expect(yonluIkonStili(ad)).toEqual(AYNA);
    }
    expect(yatayIsaret()).toBe(-1);
    // RN 0.86 sağdan solada 'right'ı SOLA çevirir: hiza bırakılır.
    expect(sagaYasliMetin().textAlign).toBeUndefined();
  });

  it('yön anlamı olmayan ikonlar sağdan solada da aynalanmaz', () => {
    sagdanSola();
    for (const ad of ['play', 'undo', 'redo', 'sync-alt', 'caret-down', 'chevron-down', 'chevron-up', 'compass', 'location-arrow', 'external-link-alt', 'share-alt', 'quote-left']) {
      expect(yonluIkonMu(ad)).toBe(false);
      expect(yonluIkonStili(ad)).toBeUndefined();
    }
    expect(yonluIkonStili(undefined)).toBeUndefined();
  });

  it('YonluIkon: yönlü adı aynalar, mevcut stili korur; yönsüz adı olduğu gibi çizer', () => {
    sagdanSola();
    const e = render(
      <>
        <YonluIkon name="chevron-right" size={12} style={{ marginLeft: 8 }} />
        <YonluIkon name="play" size={12} style={{ marginLeft: 8 }} />
      </>,
    );
    expect(StyleSheet.flatten(e.getByTestId('ikon-chevron-right').props.style)).toEqual({ marginLeft: 8, ...AYNA });
    expect(StyleSheet.flatten(e.getByTestId('ikon-play').props.style)).toEqual({ marginLeft: 8 });
  });

  it('coğrafi sahne kapsayıcısı soldan sağa sabittir', () => {
    expect(SOLDAN_SAGA).toEqual({ direction: 'ltr' });
  });
});
