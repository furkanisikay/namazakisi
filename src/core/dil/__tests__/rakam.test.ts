import * as fs from 'fs';
import * as path from 'path';
import {
  RAKAM_SECIMLI_DILLER,
  RAKAM_ULKE_VARSAYILANLARI,
  dilRakamVarsayilani,
  dilYerelRakami,
  rakamSecimiGecerliMi,
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

  it('Bengalcede Bangladeş ve Hindistan dahil HER ülkede Bengalce rakam; ülke istisnası yok', () => {
    expect(RAKAM_ULKE_VARSAYILANLARI.bn).toBeUndefined();
    for (const ulke of [null, 'BD', 'IN', 'GB', 'US', 'TR', 'MA', 'SA']) expect(rakamSistemiCoz('bn', undefined, ulke)).toBe('beng');
    expect(dilRakamVarsayilani('bn')).toBe('beng');
  });

  it('Bengalcede açık seçim (Batı ya da Bengalce) ülkeyi ezer; başka dilin yerel rakamı geçersiz', () => {
    expect(rakamSistemiCoz('bn', 'latn', 'BD')).toBe('latn');
    expect(rakamSistemiCoz('bn', 'beng', 'IN')).toBe('beng');
    expect(rakamSistemiCoz('bn', 'arab', 'BD')).toBe('beng');
    expect(rakamSistemiCoz('ar', 'beng', 'SA')).toBe('arab');
    expect(rakamSistemiCoz('ar', 'beng', 'MA')).toBe('latn');
    expect(rakamSecimiGecerliMi('bn', 'arab')).toBe(false);
    expect(rakamSecimiGecerliMi('ar', 'beng')).toBe(false);
    expect(rakamSecimiGecerliMi('bn', 'latn')).toBe(true);
    expect(rakamSecimiGecerliMi('tr', 'latn')).toBe(false);
  });

  it('dil → yerel rakam eşlemesi TEK yerde: Arapça, Bengalce, Farsça, Peştuca, Soranî', () => {
    expect([...RAKAM_SECIMLI_DILLER].sort()).toEqual(['ar', 'bn', 'ckb', 'fa', 'ps']);
    expect(dilYerelRakami('ar')).toBe('arab');
    expect(dilYerelRakami('bn')).toBe('beng');
    expect(dilYerelRakami('fa')).toBe('arabext');
    expect(dilYerelRakami('ps')).toBe('arabext');
    expect(dilYerelRakami('ckb')).toBe('arab');
    expect(dilYerelRakami('ur')).toBeNull();
    expect(dilYerelRakami('ug')).toBeNull();
  });

  it('Farsça ve Peştuca Fars rakamıyla, Soranî Doğu Arap rakamıyla başlar; seçim yalnız kendi sistemi ya da Batı', () => {
    for (const ulke of [null, 'IR', 'AF', 'TR']) {
      expect(rakamSistemiCoz('fa', undefined, ulke)).toBe('arabext');
      expect(rakamSistemiCoz('ps', undefined, ulke)).toBe('arabext');
      expect(rakamSistemiCoz('ckb', undefined, ulke)).toBe('arab');
    }
    expect(rakamSistemiCoz('fa', 'latn', 'IR')).toBe('latn');
    expect(rakamSistemiCoz('ps', 'latn', 'AF')).toBe('latn');
    expect(rakamSistemiCoz('ckb', 'latn', 'IQ')).toBe('latn');
    // Başka sistemin seçimi geçersiz: Farsçada `arab`, Soranîde `arabext`.
    expect(rakamSecimiGecerliMi('fa', 'arab')).toBe(false);
    expect(rakamSecimiGecerliMi('ps', 'arab')).toBe(false);
    expect(rakamSecimiGecerliMi('fa', 'arabext')).toBe(true);
    expect(rakamSecimiGecerliMi('fa', 'latn')).toBe(true);
    expect(rakamSecimiGecerliMi('ckb', 'arabext')).toBe(false);
    expect(rakamSecimiGecerliMi('ckb', 'arab')).toBe(true);
    expect(rakamSecimiGecerliMi('ar', 'arabext')).toBe(false);
    expect(rakamSistemiCoz('fa', 'arab', 'IR')).toBe('arabext');
    expect(rakamSistemiCoz('ckb', 'arabext', 'IQ')).toBe('arab');
    // Uygurcada yerel rakam yok: seçici yok, her zaman Batı.
    expect(rakamSecilebilir('ug')).toBe(false);
    expect(rakamSistemiCoz('ug', 'arabext', 'CN')).toBe('latn');
  });

  it('Urduca ve diğer diller her zaman Batı rakamı; seçim ve ülke yok sayılır (seçici yok)', () => {
    expect(rakamSistemiCoz('ur', 'arab', 'PK')).toBe('latn');
    for (const d of DILLER) {
      if (RAKAM_SECIMLI_DILLER.includes(d.kod)) continue;
      expect(rakamSecilebilir(d.kod)).toBe(false);
      expect(dilYerelRakami(d.kod)).toBeNull();
      expect(rakamSistemiCoz(d.kod, 'arab', 'SA')).toBe('latn');
      expect(rakamSistemiCoz(d.kod, 'beng', 'BD')).toBe('latn');
      expect(rakamSistemiCoz(d.kod, 'arabext', 'IR')).toBe('latn');
      expect(dilRakamVarsayilani(d.kod)).toBe('latn');
    }
    expect(rakamSecilebilir('ar')).toBe(true);
    expect(rakamSecilebilir('bn')).toBe(true);
  });
});

describe('rakamlariCevir / rakamlariNormallestir', () => {
  it('Batı rakamlarını Doğu Arap rakamına çevirir, diğer karakterlere dokunmaz', () => {
    expect(rakamlariCevir('05:12 · 1447 هـ', 'arab')).toBe('٠٥:١٢ · ١٤٤٧ هـ');
    expect(rakamlariCevir('0123456789', 'arab')).toBe('٠١٢٣٤٥٦٧٨٩');
    expect(rakamlariCevir('12:05', 'latn')).toBe('12:05');
  });

  it('Batı rakamlarını Bengalce rakama çevirir (০ U+09E6)', () => {
    expect(rakamlariCevir('0123456789', 'beng')).toBe('০১২৩৪৫৬৭৮৯');
    expect(rakamlariCevir('আসর 15:42', 'beng')).toBe('আসর ১৫:৪২');
  });

  it('Batı rakamlarını Fars rakamına çevirir (۰ U+06F0)', () => {
    expect(rakamlariCevir('0123456789', 'arabext')).toBe('۰۱۲۳۴۵۶۷۸۹');
    expect(rakamlariCevir('12:05', 'arabext')).toBe('۱۲:۰۵');
  });

  it('girişte Doğu Arap ve Farsça/Urduca rakamları Batıya çevirir', () => {
    expect(rakamlariNormallestir('١٩٩٥')).toBe('1995');
    expect(rakamlariNormallestir('۲۰۲۶')).toBe('2026');
    expect(rakamlariNormallestir('١2۳')).toBe('123');
    expect(rakamlariNormallestir('abc')).toBe('abc');
  });

  it('girişte Bengalce rakamları da Batıya çevirir', () => {
    expect(rakamlariNormallestir('১৯৯৫')).toBe('1995');
    expect(rakamlariNormallestir('২0২৬')).toBe('2026');
    expect(rakamlariNormallestir('বছর ২০২৬')).toBe('বছর 2026');
  });

  it('gidiş-dönüş kayıpsız', () => {
    const ornek = '2026-10-26 18:45';
    expect(rakamlariNormallestir(rakamlariCevir(ornek, 'arab'))).toBe(ornek);
    expect(rakamlariNormallestir(rakamlariCevir(ornek, 'beng'))).toBe(ornek);
    expect(rakamlariNormallestir(rakamlariCevir(ornek, 'arabext'))).toBe(ornek);
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
    aktifDiliKur('bn');
    expect(aktifRakamSistemi()).toBe('beng');
    aktifDiliKur('fa');
    expect(aktifRakamSistemi()).toBe('arabext');
    aktifDiliKur('ckb');
    expect(aktifRakamSistemi()).toBe('arab');
    aktifDiliKur('ug');
    expect(aktifRakamSistemi()).toBe('latn');
  });

  it('etkin dile ait olmayan sistem kurulamaz (dilin varsayılanına düşer)', () => {
    aktifDiliKur('bn');
    expect(rakamSisteminiKur('arab')).toBe(false);
    expect(aktifRakamSistemi()).toBe('beng');
    aktifDiliKur('tr');
    expect(rakamSisteminiKur('beng')).toBe(false);
    expect(aktifRakamSistemi()).toBe('latn');
  });
});

/**
 * Nöbetçi: sözlükte Doğu Arap (U+0660–0669), Farsça (U+06F0–06F9) ya da Bengalce (U+09E6–09EF)
 * rakamı OLMAZ. Rakamlar her zaman Batı rakamıyla yazılır; yerel rakam yalnız çizimde (metin
 * kapısı) üretilir — yoksa Mağrip kullanıcısı ve rakam seçimini değiştiren kişi karışık rakam görür.
 */
describe('nöbetçi: sözlükte yerel rakam yok', () => {
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
        .flatMap((satir, i) => (/[\u0660-\u0669\u06F0-\u06F9\u09E6-\u09EF]/.test(satir) ? [`${path.relative(kok, p)}:${i + 1}`] : []))
    );
    expect(ihlaller).toEqual([]);
  });
});
