/**
 * Canlı güncelleme satırı (issue #282): ölçerek konuşur — yalnız sistem ayarı KAPALIYKEN
 * sebep + düğme; açık, desteklenmiyor ya da bilinmiyorsa hiçbir şey.
 * Platform MODÜLÜNÜ mock'lama (AGENTS.md): yalnız `OS` özelliği değiştirilir.
 */
import React from 'react';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
const mockDurum = { canliGuncelleme: null as string | null };
jest.mock('../../../hooks/useCihazDurumu', () => ({
  useCihazDurumu: () => ({
    durum: { surum: { platform: 'android', ana: 36, alt: 0, tam: '16' }, canliGuncelleme: mockDurum.canliGuncelleme },
    yenile: jest.fn(),
  }),
}));

import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { CanliGuncellemeBilgisi } from '../CanliGuncellemeBilgisi';

describe('CanliGuncellemeBilgisi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['acik', 'desteklenmiyor', null])('Android, durum %s: hiçbir şey çizilmez', (d) => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockDurum.canliGuncelleme = d;
    const { queryByTestId } = render(<CanliGuncellemeBilgisi />);
    expect(queryByTestId('canli-guncelleme-bilgisi')).toBeNull();
  });

  it('Android, sistemde kapalı: sebep + "Ayarları açın"', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockDurum.canliGuncelleme = 'kapali';
    const { getByText, getByLabelText } = render(<CanliGuncellemeBilgisi />);
    expect(getByText(/Canlı güncellemeler kapalı/)).toBeTruthy();
    expect(getByLabelText('Ayarları açın')).toBeTruthy();
  });

  it('iOS: hiçbir şey çizilmez (sayaç bildirimi yok)', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    mockDurum.canliGuncelleme = 'kapali';
    const { queryByTestId } = render(<CanliGuncellemeBilgisi />);
    expect(queryByTestId('canli-guncelleme-bilgisi')).toBeNull();
  });
});
