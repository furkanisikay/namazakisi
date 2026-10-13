import React from 'react';
import { Text } from 'react-native';
import { render, within } from '@testing-library/react-native';

import { GunSayfasiDuzeni } from '../GunSayfasiDuzeni';

const ciz = (ikiBolmeli: boolean) =>
  render(
    <GunSayfasiDuzeni
      ikiBolmeli={ikiBolmeli}
      ustBolum={<Text>vakit-karti</Text>}
      akis={<Text>gunluk-akis</Text>}
    />
  );

describe('GunSayfasiDuzeni', () => {
  it('kompakt: tek sütun, üst bölüm akıştan ÖNCE gelir', () => {
    const ekran = ciz(false);
    expect(ekran.queryByTestId('anasayfa-iki-bolme')).toBeNull();
    const metinler = ekran.getAllByText(/vakit-karti|gunluk-akis/).map((d) => d.props.children);
    expect(metinler).toEqual(['vakit-karti', 'gunluk-akis']);
  });

  it('iki bölmeli: vakit kartı solda, akış sağda', () => {
    const ekran = ciz(true);
    expect(ekran.getByTestId('anasayfa-iki-bolme')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sol-bolme')).getByText('vakit-karti')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sag-bolme')).getByText('gunluk-akis')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sol-bolme')).queryByText('gunluk-akis')).toBeNull();
  });
});
