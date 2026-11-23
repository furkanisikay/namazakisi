/**
 * Google Play mağaza kaydı çevirileri: her Play dili için dosya var, alanlar Play sınırı içinde,
 * uygulama adı ve depo bağlantısı korunmuş. Mağazaya `play-magaza.yml -f mod=diller` yazar.
 */
const { PLAY_DILLERI, VARSAYILAN_DIL } = require('../../scripts/play-kayit-dilleri.js') as {
  PLAY_DILLERI: Record<string, string>;
  VARSAYILAN_DIL: string;
};
const { hepsiniDenetle, kayitDenetle } = require('../../scripts/play-kayit-denetle.js') as {
  hepsiniDenetle: (kodlar: string[]) => Record<string, string[]>;
  kayitDenetle: (kayit: Record<string, unknown>) => string[];
};
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const KOK = path.resolve(__dirname, '../..');

describe('Play mağaza kaydı dilleri', () => {
  test('her Play dili için geçerli bir kayıt dosyası var', () => {
    const sonuc = hepsiniDenetle(Object.values(PLAY_DILLERI));
    const hatali = Object.entries(sonuc).filter(([, h]) => h.length);
    expect(hatali).toEqual([]);
  });

  test('her eşlenen uygulama dili gerçekten uygulamada var', () => {
    const sozlukler = fs.readdirSync(path.join(KOK, 'src/core/dil/sozluk'));
    for (const kod of Object.keys(PLAY_DILLERI)) expect(sozlukler).toContain(kod);
  });

  test('klasörde eşlemede olmayan dosya yok', () => {
    const dosyalar = fs.readdirSync(path.join(KOK, 'docs/app-store/play-kayitlari')).map((f) => f.replace(/\.json$/, ''));
    expect(dosyalar.sort()).toEqual(Object.values(PLAY_DILLERI).sort());
  });

  test('varsayılan dil İngilizce kayıttır', () => {
    expect(VARSAYILAN_DIL).toBe('en-US');
    expect(Object.values(PLAY_DILLERI)).toContain(VARSAYILAN_DIL);
  });

  test('denetleyici sınır aşımını ve eksik bağlantıyı yakalar', () => {
    const hatalar = kayitDenetle({ title: 'Namaz Akışı: ' + 'x'.repeat(30), shortDescription: 'kısa', fullDescription: 'bağlantısız' });
    expect(hatalar.some((h) => h.startsWith('title'))).toBe(true);
    expect(hatalar).toContain('tam açıklamada depo bağlantısı yok');
  });
});
