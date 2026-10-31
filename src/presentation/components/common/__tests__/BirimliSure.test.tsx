/**
 * Sayı–birim ve parça arası boşluk sözlükten: Türkçede "1 sa 9 dk" birebir, boşluksuz
 * dilde (Çince) boşluk çizilmez.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

import { aktifDiliKur, aktifDilSifirla, sozluk } from '../../../../core/dil/aktifDil';
import { BirimliSure } from '../BirimliSure';

afterEach(() => aktifDilSifirla());

/** Ağaçtaki bütün metin çocuklarını sırayla birleştirir (iç içe `Text` dahil). */
function duzMetin(dugum: unknown): string {
  if (dugum == null) return '';
  if (typeof dugum === 'string') return dugum;
  if (Array.isArray(dugum)) return dugum.map(duzMetin).join('');
  return duzMetin((dugum as { children?: unknown }).children);
}

it('Türkçe: boşluklar eskisi gibi', () => {
  const { toJSON, getByTestId } = render(<BirimliSure testID="sure" sure="01:09:09" birimRengi="#999" rakamBoyu={40} />);
  expect(duzMetin(toJSON())).toBe('1 sa 9 dk');
  expect(getByTestId('sure').props.accessibilityLabel).toBe('1 saat 9 dakika');
});

it('boşluksuz dil (Çince): sayı ile birim ve parçalar bitişik', () => {
  aktifDiliKur('zh');
  const k = sozluk('zh').sure.kisa;
  const { toJSON } = render(<BirimliSure sure="00:09:05" birimRengi="#999" rakamBoyu={40} />);
  expect(duzMetin(toJSON())).toBe(`9${k.dk}05${k.sn}`);
});
