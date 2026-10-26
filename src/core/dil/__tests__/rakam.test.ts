import * as fs from 'fs';
import * as path from 'path';
import {
  RAKAM_ULKE_VARSAYILANLARI,
  dilRakamVarsayilani,
  rakamlariCevir,
  rakamlariNormallestir,
  rakamSecilebilir,
  rakamSistemiCoz,
} from '../rakam';
import { DILLER } from '../diller';
import { aktifDiliKur, aktifDilSifirla, aktifRakamSistemi, rakamSisteminiKur } from '../aktifDil';

describe('rakamSistemiCoz', () => {
  it('Arapçada varsayılan Doğu Arap rakamı (Körfez/Ortadoğu ve ülke bilinmezken)', () => {
    expect(rakamSistemiCoz('ar', undefined, null)).toBe('arab');
    for (const ulke of ['SA', 'AE', 'EG', 'IQ', 'JO', 'KW', 'QA']) expect(rakamSistemiCoz('ar', undefined, ulke)).toBe('arab');
  });

  it('Mağrip ülkeleri (DZ, MA, TN, LY, MR, EH) Batı rakamı', () => {
    expect(Object.keys(RAKAM_ULKE_VARSAYILANLARI.ar ?? {}).sort()).toEqual(['DZ', 'EH', 'LY', 'MA', 'MR', 'TN']);
    for (const ulke of ['DZ', 'MA', 'TN', 'LY', 'MR', 'EH']) expect(rakamSistemiCoz('ar', undefined, ulke)).toBe('latn');
  });

  it('açık seçim ülkeyi ezer; geçersiz seçim yok sayılır', () => {
    expect(rakamSistemiCoz('ar', 'arab', 'MA')).toBe('arab');
    expect(rakamSistemiCoz('ar', 'latn', 'SA')).toBe('latn');
    expect(rakamSistemiCoz('ar', 'hindi', 'MA')).toBe('latn');
    expect(rakamSistemiCoz('ar', 42, 'SA')).toBe('arab');
  });

  it('Urduca ve diğer diller her zaman Batı rakamı; seçim ve ülke yok sayılır (seçici yok)', () => {
    expect(rakamSistemiCoz('ur', 'arab', 'PK')).toBe('latn');
    for (const d of DILLER) {
      if (d.kod === 'ar') continue;
      expect(rakamSecilebilir(d.kod)).toBe(false);
      expect(rakamSistemiCoz(d.kod, 'arab', 'SA')).toBe('latn');
      expect(dilRakamVarsayilani(d.kod)).toBe('latn');
    }
    expect(rakamSecilebilir('ar')).toBe(true);
  });
});

describe('rakamlariCevir / rakamlariNormallestir', () => {
  it('Batı rakamlarını Doğu Arap rakamına çevirir, diğer karakterlere dokunmaz', () => {
    expect(rakamlariCevir('05:12 · 1447 هـ', 'arab')).toBe('٠٥:١٢ · ١٤٤٧ هـ');
    expect(rakamlariCevir('0123456789', 'arab')).toBe('٠١٢٣٤٥٦٧٨٩');
    expect(rakamlariCevir('12:05', 'latn')).toBe('12:05');
  });

  it('girişte Doğu Arap ve Farsça/Urduca rakamları Batıya çevirir', () => {
    expect(rakamlariNormallestir('١٩٩٥')).toBe('1995');
    expect(rakamlariNormallestir('۲۰۲۶')).toBe('2026');
    expect(rakamlariNormallestir('١2۳')).toBe('123');
    expect(rakamlariNormallestir('abc')).toBe('abc');
  });

  it('gidiş-dönüş kayıpsız', () => {
    const ornek = '2026-10-26 18:45';
    expect(rakamlariNormallestir(rakamlariCevir(ornek, 'arab'))).toBe(ornek);
  });
});

describe('etkin rakam sistemi (aktifDil)', () => {
  afterEach(() => aktifDilSifirla());

  it('dil değişince dilin varsayılanına döner; kurulan değer okunur', () => {
    expect(aktifRakamSistemi()).toBe('latn');
    aktifDiliKur('ar');
    expect(aktifRakamSistemi()).toBe('arab');
    expect(rakamSisteminiKur('latn')).toBe(true);
    expect(rakamSisteminiKur('latn')).toBe(false);
    aktifDiliKur('ur');
    expect(aktifRakamSistemi()).toBe('latn');
  });
});

/**
 * Nöbetçi: sözlükte Doğu Arap (U+0660–0669) ya da Farsça (U+06F0–06F9) rakamı OLMAZ. Rakamlar
 * her zaman Batı rakamıyla yazılır; Doğu rakamı yalnız çizimde (metin kapısı) üretilir —
 * yoksa Mağrip kullanıcısı ve rakam seçimini değiştiren kişi karışık rakam görür.
 */
describe('nöbetçi: sözlükte Doğu rakamı yok', () => {
  const kok = path.join(__dirname, '..', 'sozluk');
  const dosyalar: string[] = [];
  const gez = (d: string) => {
    for (const ad of fs.readdirSync(d)) {
      const p = path.join(d, ad);
      if (fs.statSync(p).isDirectory()) gez(p);
      else if (/\.tsx?$/.test(ad)) dosyalar.push(p);
    }
  };
  gez(kok);

  it('hiçbir sözlük dosyasında yok (dosya:satır listesi boş)', () => {
    expect(dosyalar.length).toBeGreaterThan(100);
    const ihlaller = dosyalar.flatMap((p) =>
      fs
        .readFileSync(p, 'utf8')
        .split('\n')
        .flatMap((satir, i) => (/[\u0660-\u0669\u06F0-\u06F9]/.test(satir) ? [`${path.relative(kok, p)}:${i + 1}`] : []))
    );
    expect(ihlaller).toEqual([]);
  });
});
