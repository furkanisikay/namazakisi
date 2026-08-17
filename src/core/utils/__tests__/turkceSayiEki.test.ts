import { turkceIyelikEki } from '../turkceSayiEki';

describe('turkceIyelikEki', () => {
  test('15 -> "i" (on beş)', () => {
    expect(turkceIyelikEki(15)).toBe('i');
  });

  test('3 -> "ü" (üç)', () => {
    expect(turkceIyelikEki(3)).toBe('ü');
  });

  test('40 -> "ı" (kırk)', () => {
    expect(turkceIyelikEki(40)).toBe('ı');
  });

  test('20 -> "si" (yirmi — ünlüyle biter, tampon "s" gerekir)', () => {
    expect(turkceIyelikEki(20)).toBe('si');
  });

  test('0 -> "ı" (sıfır)', () => {
    expect(turkceIyelikEki(0)).toBe('ı');
  });

  test('2 -> "si" (iki — ünlüyle biter)', () => {
    expect(turkceIyelikEki(2)).toBe('si');
  });

  test('21 -> "i" (yirmi bir — son sözcük "bir")', () => {
    expect(turkceIyelikEki(21)).toBe('i');
  });

  test('60 -> "ı" (altmış)', () => {
    expect(turkceIyelikEki(60)).toBe('ı');
  });

  test('90 -> "ı" (doksan)', () => {
    expect(turkceIyelikEki(90)).toBe('ı');
  });

  test('7 -> "si" (yedi — ünlüyle biter)', () => {
    expect(turkceIyelikEki(7)).toBe('si');
  });

  test('negatif ve NaN girdide güvenli varsayılana düşer', () => {
    expect(turkceIyelikEki(-15)).toBe('i');
    expect(turkceIyelikEki(NaN)).toBe('i');
  });
});
