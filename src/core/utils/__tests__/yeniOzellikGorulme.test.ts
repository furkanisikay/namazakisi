import { gorulmeAnahtari, ozellikKayittaMi } from '../yeniOzellikGorulme';

describe('yeniOzellikGorulme', () => {
  const ozellik = { id: 'muhafiz', surum: '0.31.0' };

  it('anahtar kimlik + sürümdür', () => {
    expect(gorulmeAnahtari(ozellik)).toBe('muhafiz@0.31.0');
  });

  it('bugünkü sürümün anahtarı görülmüş sayar', () => {
    expect(ozellikKayittaMi(ozellik, ['muhafiz@0.31.0'])).toBe(true);
  });

  it('sürümü yükseltilen duyuru yeniden okunmamış olur', () => {
    expect(ozellikKayittaMi({ id: 'muhafiz', surum: '0.42.0' }, ['muhafiz@0.31.0'])).toBe(false);
  });

  it('eski yalın kimlik yalnız eski biçimin son sürümüne kadarki içerik için geçerlidir', () => {
    expect(ozellikKayittaMi(ozellik, ['muhafiz'])).toBe(true);
    expect(ozellikKayittaMi({ id: 'muhafiz', surum: '0.41.0' }, ['muhafiz'])).toBe(true);
    expect(ozellikKayittaMi({ id: 'muhafiz', surum: '0.42.0' }, ['muhafiz'])).toBe(false);
  });

  it('birleştirilmiş öğe eski kayıtta ancak hepsi görülmüşse görülmüş sayılır', () => {
    const birlesik = { id: 'a', surum: '0.31.0', oncekiIdler: ['b', 'c'] };
    expect(ozellikKayittaMi(birlesik, ['a', 'b'])).toBe(false);
    expect(ozellikKayittaMi(birlesik, ['b', 'c'])).toBe(false);
    expect(ozellikKayittaMi(birlesik, ['a', 'b', 'c'])).toBe(true);
    expect(ozellikKayittaMi(birlesik, ['a@0.31.0'])).toBe(true);
  });
});
