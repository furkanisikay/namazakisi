/**
 * NÖBETÇİ (son inceleme — kontrast): `GUN_NUMARASI`/`GUN_ADI` gök panelinin
 * en açık zemin noktasına (`ZEMIN_VURGU_SOL_UST` — `GokPaneli`'ndeki
 * `zeminSolUst` radial vurgunun cx %22/cy %8 merkezinde tam opaklıkla çıkan
 * ton) karşı AA eşiğinin (4.5:1, 18.66px altı metin) ALTINA düşmemeli.
 * Bu tam da gün harflerinin ve ilk satır gün numaralarının durduğu bölge.
 */
import { kontrastOrani } from '../../../../core/utils/kontrastOrani';
import { GOK_TONLARI } from '../sabitler';

const AA_ESIGI = 4.5;

describe('GOK_TONLARI kontrast', () => {
  test('GUN_NUMARASI en açık gök zeminine (ZEMIN_VURGU_SOL_UST) karşı AA eşiğini geçer', () => {
    expect(kontrastOrani(GOK_TONLARI.GUN_NUMARASI, GOK_TONLARI.ZEMIN_VURGU_SOL_UST)).toBeGreaterThanOrEqual(AA_ESIGI);
  });

  test('GUN_ADI en açık gök zeminine (ZEMIN_VURGU_SOL_UST) karşı AA eşiğini geçer', () => {
    expect(kontrastOrani(GOK_TONLARI.GUN_ADI, GOK_TONLARI.ZEMIN_VURGU_SOL_UST)).toBeGreaterThanOrEqual(AA_ESIGI);
  });

  test('en koyu zemine (ZEMIN_KOYU) karşı kontrast daha da yüksektir (koyu zemin her zaman güvenli uç)', () => {
    expect(kontrastOrani(GOK_TONLARI.GUN_NUMARASI, GOK_TONLARI.ZEMIN_KOYU)).toBeGreaterThanOrEqual(AA_ESIGI);
    expect(kontrastOrani(GOK_TONLARI.GUN_ADI, GOK_TONLARI.ZEMIN_KOYU)).toBeGreaterThanOrEqual(AA_ESIGI);
  });
});
