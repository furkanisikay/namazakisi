import { SESI_OLMAYAN_DILLER, sesliOkumaSesiYok } from '../sesliOkuma';
import { DILLER } from '../diller';

describe('sesliOkuma', () => {
  it('liste yalnız tanımlı dilleri taşır; sesi olan büyük diller listede değil', () => {
    const kodlar = new Set(DILLER.map((d) => d.kod));
    for (const d of SESI_OLMAYAN_DILLER) expect(kodlar.has(d)).toBe(true);
    for (const d of ['tr', 'en', 'ar', 'he', 'lt', 'ur'] as const) expect(sesliOkumaSesiYok(d)).toBe(false);
    expect(sesliOkumaSesiYok('nqo')).toBe(true);
  });
});
