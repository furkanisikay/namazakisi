/**
 * Live Update bilgi satırı (issue #282): yalnız Android'de, kibar metinle çizilir.
 * Platform MODÜLÜNÜ mock'lama (AGENTS.md): yalnız `OS` özelliği değiştirilir.
 */
import React from 'react';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { CanliGuncellemeBilgisi } from '../CanliGuncellemeBilgisi';

describe('CanliGuncellemeBilgisi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Android: bilgi satırı görünür', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { getByText } = render(<CanliGuncellemeBilgisi />);
    expect(getByText("Android 16+ cihazlarda sayaç durum çubuğunda ve Now Bar'da görünür.")).toBeTruthy();
  });

  it('iOS: hiçbir şey çizilmez (sayaç bildirimi yok)', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { queryByTestId } = render(<CanliGuncellemeBilgisi />);
    expect(queryByTestId('canli-guncelleme-bilgisi')).toBeNull();
  });
});
