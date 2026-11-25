/**
 * App Store mağaza kaydı çevirileri: her eşlenen dil için dosya var, alanlar Apple sınırı içinde,
 * uygulama adı ve depo bağlantısı korunmuş. Mağazaya `ios-ekran-goruntuleri.yml -f tur=asc
 * -f asc_islem=diller` yazar.
 */
const { ASC_DILLERI, BIRINCIL_YEREL } = require('../../scripts/app-store-dilleri.js') as {
  ASC_DILLERI: Record<string, string[]>;
  BIRINCIL_YEREL: string;
};
const { hepsiniDenetle, kayitDenetle } = require('../../scripts/app-store-kayit-denetle.js') as {
  hepsiniDenetle: (diller: string[]) => Record<string, string[]>;
  kayitDenetle: (kayit: Record<string, unknown>) => string[];
};
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const KOK = path.resolve(__dirname, '../..');

describe('App Store mağaza kaydı dilleri', () => {
  test('her eşlenen dil için geçerli bir kayıt dosyası var', () => {
    const hatali = Object.entries(hepsiniDenetle(Object.keys(ASC_DILLERI))).filter(([, h]) => h.length);
    expect(hatali).toEqual([]);
  });

  test('her eşlenen dil uygulamada var', () => {
    const sozlukler = fs.readdirSync(path.join(KOK, 'src/core/dil/sozluk'));
    for (const dil of Object.keys(ASC_DILLERI)) expect(sozlukler).toContain(dil);
  });

  test('klasörde eşlemede olmayan dosya yok', () => {
    const dosyalar = fs.readdirSync(path.join(KOK, 'docs/app-store/app-store-kayitlari')).map((f) => f.replace(/\.json$/, ''));
    expect(dosyalar.sort()).toEqual(Object.keys(ASC_DILLERI).sort());
  });

  test('birincil dil eşlenen bir yerel', () => {
    expect(Object.values(ASC_DILLERI).flat()).toContain(BIRINCIL_YEREL);
  });

  test('denetleyici sınır aşımını ve kurala aykırı anahtar kelimeyi yakalar', () => {
    const hatalar = kayitDenetle({
      name: 'Namaz Akışı: ' + 'x'.repeat(30),
      subtitle: 'a',
      keywords: 'bir, iki',
      promotionalText: 'p',
      description: 'bağlantısız',
      whatsNew: 'y',
    });
    expect(hatalar.some((h) => h.startsWith('name'))).toBe(true);
    expect(hatalar).toContain('açıklamada depo bağlantısı yok');
    expect(hatalar).toContain('anahtar kelimelerde virgül çevresinde boşluk var');
  });
});
