/**
 * Native çeviri nöbetçisi (YARIM DİL YOK): her Android kaynak kökünde `values/` (Türkçe,
 * varsayılan) ile `values-<dil>/` aynı dizge kümesini taşır (`translatable="false"` hariç) ve
 * her dizgenin yer tutucuları (`%1$s`, `%d`) iki dilde aynıdır. Eksik çeviri Android'de
 * sessizce Türkçeye düşer; CI derlemesi bunu yakalamaz.
 */
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.join(__dirname, '..', '..');
const DILLER = ['en'];

function resDizinleri(): string[] {
  const adaylar = ['android/app/src/main/res', 'wear/app/src/main/res', 'tv/app/src/main/res'];
  for (const m of fs.readdirSync(path.join(KOK, 'modules'))) adaylar.push(`modules/${m}/android/src/main/res`);
  return adaylar.filter((d) => fs.existsSync(path.join(KOK, d, 'values')));
}

/** `ad → yer tutucu imzası` (dizge ve çoğul). Basit XML okuma: kaynak dosyaları tek düzeydir. */
function dizgeler(dizin: string): Map<string, string> {
  const sonuc = new Map<string, string>();
  if (!fs.existsSync(dizin)) return sonuc;
  for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith('.xml'))) {
    const xml = fs.readFileSync(path.join(dizin, dosya), 'utf8');
    for (const m of xml.matchAll(/<(string|plurals)\s+name="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
      if (/translatable="false"/.test(m[3])) continue;
      const imza = [...m[4].matchAll(/%(\d+\$)?[sd]/g)].map((x) => x[0]).sort().join(',');
      sonuc.set(`${m[1]}:${m[2]}`, imza);
    }
  }
  return sonuc;
}

describe.each(resDizinleri())('%s', (res) => {
  const tr = dizgeler(path.join(KOK, res, 'values'));
  it.each(DILLER)('values-%s anahtarları ve yer tutucuları Türkçeyle aynı', (dil) => {
    if (!fs.existsSync(path.join(KOK, res, `values-${dil}`))) {
      // Kökte çevrilecek dizge yoksa (yalnız translatable="false") values-<dil> gerekmez.
      expect([...tr.keys()]).toEqual([]);
      return;
    }
    const ceviri = dizgeler(path.join(KOK, res, `values-${dil}`));
    expect([...ceviri.keys()].sort()).toEqual([...tr.keys()].sort());
    const farkli = [...tr].filter(([ad, imza]) => ceviri.get(ad) !== imza).map(([ad]) => ad);
    expect(farkli).toEqual([]);
  });
});
