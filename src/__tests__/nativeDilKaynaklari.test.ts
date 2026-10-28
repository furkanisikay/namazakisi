/**
 * Native çeviri nöbetçisi (YARIM DİL YOK): her Android kaynak kökünde `values/` (Türkçe,
 * varsayılan) ile her dilin `values-<niteleyici>/` dizini aynı dizge kümesini taşır
 * (`translatable="false"` hariç) ve her dizgenin yer tutucuları (`%1$s`, `%d`) aynıdır. Eksik
 * çeviri Android'de sessizce Türkçeye düşer; CI derlemesi bunu yakalamaz. iOS'ta aynı denetim
 * `targets/siri-kisayollari/<dil>.lproj` ve `locales/<dil>.json` için.
 *
 * Endonezce Android niteleyicisi `in`dir (`values-id` hiç seçilmez: `java.util.Locale` "id"yi
 * "in"e çevirir — lint `LocaleFolder`); `dil_kodu` dizgesi yine "id". Soranî Kürtçesi üç harflidir:
 * niteleyici BCP-47 biçimi `b+ckb` (`values-ckb` aapt'ta geçersiz niteleyicidir). Kural:
 * `docs/ajan/coklu-dil.md > Native dil tabloları`.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DILLER as TANIMLI_DILLER } from '../core/dil/diller';

const KOK = path.join(__dirname, '..', '..');
const DILLER = TANIMLI_DILLER.map((d) => d.kod).filter((k) => k !== 'tr');
/** Android kaynak niteleyicisi (dil kodundan farklıysa). */
const NITELEYICI: Record<string, string> = { id: 'in', ckb: 'b+ckb' };
const nitelik = (dil: string) => NITELEYICI[dil] ?? dil;
/** Android lint `MissingQuantity` HATA'dır: dilin CLDR çoğul kategorileri `<plurals>`'ta olmalı. */
const COGUL: Record<string, string[]> = {
  tr: ['one', 'other'],
  en: ['one', 'other'],
  id: ['other'],
  ms: ['other'],
  de: ['one', 'other'],
  fr: ['one', 'many', 'other'],
  bs: ['one', 'few', 'other'],
  ru: ['one', 'few', 'many', 'other'],
  ar: ['zero', 'one', 'two', 'few', 'many', 'other'],
  ur: ['one', 'other'],
  es: ['one', 'many', 'other'],
  nl: ['one', 'other'],
  sq: ['one', 'other'],
  hi: ['one', 'other'],
  bn: ['one', 'other'],
  fa: ['one', 'other'],
  ps: ['one', 'other'],
  ckb: ['one', 'other'],
  ug: ['one', 'other'],
};

function resDizinleri(): string[] {
  const adaylar = ['android/app/src/main/res', 'wear/app/src/main/res', 'tv/app/src/main/res'];
  for (const m of fs.readdirSync(path.join(KOK, 'modules'))) adaylar.push(`modules/${m}/android/src/main/res`);
  return adaylar.filter((d) => fs.existsSync(path.join(KOK, d, 'values')));
}

interface Dizge {
  imza: string;
  icerik: string;
  nicelikler: string[];
}

/** `ad → yer tutucu KÜMESİ` (dizge ve çoğul). Basit XML okuma: kaynak dosyaları tek düzeydir. */
function dizgeler(dizin: string): Map<string, Dizge> {
  const sonuc = new Map<string, Dizge>();
  if (!fs.existsSync(dizin)) return sonuc;
  for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith('.xml'))) {
    const xml = fs.readFileSync(path.join(dizin, dosya), 'utf8');
    for (const m of xml.matchAll(/<(string|plurals)\s+name="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
      if (/translatable="false"/.test(m[3])) continue;
      const imza = [...new Set([...m[4].matchAll(/%(\d+\$)?[sd]/g)].map((x) => x[0]))].sort().join(',');
      const nicelikler = [...m[4].matchAll(/quantity="(\w+)"/g)].map((x) => x[1]);
      sonuc.set(`${m[1]}:${m[2]}`, { imza, icerik: m[4], nicelikler });
    }
  }
  return sonuc;
}

describe.each(resDizinleri())('%s', (res) => {
  const tr = dizgeler(path.join(KOK, res, 'values'));
  it.each(DILLER)('%s: anahtarları, yer tutucuları ve çoğul kategorileri Türkçeyle uyumlu', (dil) => {
    const dizin = path.join(KOK, res, `values-${nitelik(dil)}`);
    if (!fs.existsSync(dizin)) {
      // Kökte çevrilecek dizge yoksa (yalnız translatable="false") values-<dil> gerekmez.
      expect([...tr.keys()]).toEqual([]);
      return;
    }
    const ceviri = dizgeler(dizin);
    expect([...ceviri.keys()].sort()).toEqual([...tr.keys()].sort());
    const farkli = [...tr].filter(([ad, d]) => ceviri.get(ad)?.imza !== d.imza).map(([ad]) => ad);
    expect(farkli).toEqual([]);
    const eksikCogul = [...ceviri]
      .filter(([ad]) => ad.startsWith('plurals:'))
      .filter(([, d]) => COGUL[dil].some((k) => !d.nicelikler.includes(k)))
      .map(([ad]) => ad);
    expect(eksikCogul).toEqual([]);
    const dilKodu = ceviri.get('string:dil_kodu');
    if (dilKodu) expect(dilKodu.icerik).toBe(dil);
  });

  it('Endonezce yalnız values-in (values-id hiç seçilmez)', () => {
    expect(fs.existsSync(path.join(KOK, res, 'values-id'))).toBe(false);
  });

  it('Soranî yalnız values-b+ckb (values-ckb geçersiz niteleyici, derleme düşer)', () => {
    expect(fs.existsSync(path.join(KOK, res, 'values-ckb'))).toBe(false);
  });
});

/** `.strings` → `anahtar → değer`. Satır biçimi: `"anahtar" = "değer";`. */
function stringsOku(dosya: string): Map<string, string> {
  const sonuc = new Map<string, string>();
  for (const m of fs.readFileSync(dosya, 'utf8').matchAll(/^"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)";\s*$/gm)) {
    sonuc.set(m[1], m[2]);
  }
  return sonuc;
}
const yerTutucular = (s: string) => [...new Set(s.match(/\$\{\w+\}|%(?:\d+\$)?(?:@|lld|d)/g) ?? [])].sort();

describe('iOS Siri/Kısayollar .lproj', () => {
  const kaynak = path.join(KOK, 'targets', 'siri-kisayollari');
  const tr = path.join(kaynak, 'tr.lproj');
  const dosyalar = fs.readdirSync(tr).filter((f) => f.endsWith('.strings'));

  it.each(DILLER)('%s.lproj Türkçeyle aynı anahtarları ve yer tutucuları taşır', (dil) => {
    for (const dosya of dosyalar) {
      const a = stringsOku(path.join(tr, dosya));
      const b = stringsOku(path.join(kaynak, `${dil}.lproj`, dosya));
      expect(a.size).toBeGreaterThan(0);
      expect([...b.keys()].sort()).toEqual([...a.keys()].sort());
      const farkli = [...a].filter(([k, v]) => yerTutucular(b.get(k) ?? '').join() !== yerTutucular(v).join()).map(([k]) => k);
      expect(farkli).toEqual([]);
    }
  });
});

describe('iOS izin metinleri (locales/<dil>.json)', () => {
  const en = JSON.parse(fs.readFileSync(path.join(KOK, 'locales', 'en.json'), 'utf8')) as Record<string, string>;
  it.each(DILLER)('locales/%s.json İngilizceyle aynı anahtarları taşır ve geçerli .strings satırı üretir', (dil) => {
    const metin = JSON.parse(fs.readFileSync(path.join(KOK, 'locales', `${dil}.json`), 'utf8')) as Record<string, string>;
    expect(Object.keys(metin).sort()).toEqual(Object.keys(en).sort());
    // Expo `InfoPlist.strings`'i kaçışsız yazar (bkz. plugins/__tests__/siriYerellestirme.test.ts).
    const bozuk = Object.entries(metin)
      .map(([k, v]) => `${k} = "${v}";`)
      .filter((satir) => !/^(?:[A-Za-z0-9_.]+|"[^"\\\n]+") = "[^"\\\n]*";$/.test(satir));
    expect(bozuk).toEqual([]);
    expect(Object.values(metin).filter((v) => !v.trim())).toEqual([]);
  });
});
