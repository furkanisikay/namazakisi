import React from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, within } from '@testing-library/react-native';

import { GunSayfasiDuzeni } from '../GunSayfasiDuzeni';
import type { GunDuzeni, MenteseSiniri } from '../../../../core/utils/katlanmaPosturu';

const ciz = (duzen: GunDuzeni, mentese: MenteseSiniri | null = null) =>
  render(
    <GunSayfasiDuzeni
      duzen={duzen}
      ustBolum={<Text>vakit-karti</Text>}
      akis={<Text>gunluk-akis</Text>}
      masaustuUst={<Text>buyuk-sayac</Text>}
      masaustuBantlar={<Text>bantlar</Text>}
      mentese={mentese}
    />
  );

/**
 * Jest'in RN View mock'unda `measureInWindow` geri çağrıyı hiç çağırmaz; kök
 * görünümün örneğine gerçek ölçüyü veren bir uygulama takılır.
 */
const olcuVer = (ekran: ReturnType<typeof ciz>, y: number, yukseklik: number) => {
  const kok = ekran.UNSAFE_getAllByType(View).find((d) => d.props.testID === 'anasayfa-masaustu');
  expect(kok).toBeTruthy();
  const ornek = kok!.instance as { measureInWindow?: unknown } | null;
  expect(ornek).toBeTruthy();
  ornek!.measureInWindow = (cb: (x: number, y: number, g: number, h: number) => void) => cb(0, y, 800, yukseklik);
  act(() => {
    fireEvent(ekran.getByTestId('anasayfa-masaustu'), 'layout', { nativeEvent: { layout: {} } });
  });
};

const yukseklik = (ekran: ReturnType<typeof ciz>, testID: string) => {
  const stil = [ekran.getByTestId(testID).props.style].flat(Infinity) as Record<string, unknown>[];
  return Object.assign({}, ...stil.filter(Boolean)).height;
};

describe('GunSayfasiDuzeni', () => {
  it('tek: tek sütun, üst bölüm akıştan ÖNCE gelir', () => {
    const ekran = ciz('tek');
    expect(ekran.queryByTestId('anasayfa-iki-bolme')).toBeNull();
    expect(ekran.queryByTestId('anasayfa-masaustu')).toBeNull();
    const metinler = ekran.getAllByText(/vakit-karti|gunluk-akis/).map((d) => d.props.children);
    expect(metinler).toEqual(['vakit-karti', 'gunluk-akis']);
    expect(ekran.queryByText('buyuk-sayac')).toBeNull();
  });

  it('iki bölmeli: vakit kartı solda, akış sağda', () => {
    const ekran = ciz('ikiBolme');
    expect(ekran.getByTestId('anasayfa-iki-bolme')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sol-bolme')).getByText('vakit-karti')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sag-bolme')).getByText('gunluk-akis')).toBeTruthy();
    expect(within(ekran.getByTestId('anasayfa-sol-bolme')).queryByText('gunluk-akis')).toBeNull();
  });

  describe('masaüstü postürü', () => {
    const mentese: MenteseSiniri = { sol: 0, ust: 440, sag: 800, alt: 440 };

    it('üstte büyük sayaç, altta bantlar + akış; vakit kartı (Kıldım düğmesi) çizilmez', () => {
      const ekran = ciz('masaustu', mentese);
      const ust = ekran.getByTestId('anasayfa-masaustu-ust');
      const alt = ekran.getByTestId('anasayfa-masaustu-alt');
      expect(within(ust).getByText('buyuk-sayac')).toBeTruthy();
      expect(within(ust).queryByText('gunluk-akis')).toBeNull();
      const altMetinler = within(alt).getAllByText(/bantlar|gunluk-akis/).map((d) => d.props.children);
      expect(altMetinler).toEqual(['bantlar', 'gunluk-akis']);
      expect(ekran.queryByText('vakit-karti')).toBeNull();
    });

    it('ölçü gelmeden eşit yarılar (sabit yükseklik yok)', () => {
      const ekran = ciz('masaustu', mentese);
      expect(yukseklik(ekran, 'anasayfa-masaustu-ust')).toBeUndefined();
    });

    it('sayfa ölçülünce yarılar MENTEŞEYE göre boyutlanır', () => {
      const ekran = ciz('masaustu', mentese);
      // Sayfa pencerede 100. dp'de başlıyor (başlık), 700 dp yüksek → menteşe 440.
      olcuVer(ekran, 100, 700);
      expect(yukseklik(ekran, 'anasayfa-masaustu-ust')).toBe(340);
      expect(yukseklik(ekran, 'anasayfa-masaustu-alt')).toBe(360);
    });

    it('menteşe sayfanın kenarına çok yakınsa eşit yarılara düşer', () => {
      const ekran = ciz('masaustu', { sol: 0, ust: 150, sag: 800, alt: 150 });
      olcuVer(ekran, 100, 700);
      expect(yukseklik(ekran, 'anasayfa-masaustu-ust')).toBeUndefined();
    });
  });
});
