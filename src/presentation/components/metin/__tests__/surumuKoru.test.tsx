import * as React from 'react';
import { surumuKoru } from '../surumuKoru';

describe('surumuKoru', () => {
  it('yalnız sürümü rakamKoru ile sarar, ayet numarası düz dize kalır', () => {
    const sonuc = surumuKoru("Kur'an 2:255 · Meal: Rowwad, QuranEnc 1.0.3 · Arapça metin: Tanzil", '1.0.3');
    expect(Array.isArray(sonuc)).toBe(true);
    const parcalar = sonuc as React.ReactNode[];
    expect(parcalar[0]).toBe("Kur'an 2:255 · Meal: Rowwad, QuranEnc ");
    const surum = parcalar[1] as React.ReactElement<{ rakamKoru?: boolean; children?: React.ReactNode }>;
    expect(surum.props.rakamKoru).toBe(true);
    expect(surum.props.children).toBe('1.0.3');
    expect(parcalar[2]).toBe(' · Arapça metin: Tanzil');
  });

  it('sürüm yoksa ya da metinde geçmiyorsa metni aynen döner', () => {
    expect(surumuKoru('2:255 · Arapça: Tanzil', null)).toBe('2:255 · Arapça: Tanzil');
    expect(surumuKoru('2:255', '1.0.3')).toBe('2:255');
  });
});
