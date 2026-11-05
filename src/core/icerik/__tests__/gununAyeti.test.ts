/**
 * Günün ayeti seçimi: namaz günü sınırı (imsak), dilden bağımsız seçim, tam tur, künye.
 */
import { aktifNamazGunu, ayetMealiOku, dilHavuzu, gununAyetiGorunumu, gununAyetiKaydi, gununAyetiPlani, gunNumarasi, tumHavuz } from '../gununAyeti';
import { GUNUN_AYETI_HAVUZU } from '../../data/gununAyetiHavuzu';

/** Her gün 06:00'da imsak. */
const imsak6 = (t: Date) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 6, 0);

it('imsaktan önce dünün namaz günü sürer, imsakta yeni gün başlar', () => {
  expect(aktifNamazGunu(new Date(2026, 9, 24, 3, 0), imsak6).getDate()).toBe(23);
  expect(aktifNamazGunu(new Date(2026, 9, 24, 6, 0), imsak6).getDate()).toBe(24);
  expect(aktifNamazGunu(new Date(2026, 9, 24, 23, 59), imsak6).getDate()).toBe(24);
});

it('imsak bilinmiyorsa (konum yok) sınır yerel 05:00', () => {
  const yok = () => null;
  expect(aktifNamazGunu(new Date(2026, 9, 24, 4, 59), yok).getDate()).toBe(23);
  expect(aktifNamazGunu(new Date(2026, 9, 24, 5, 0), yok).getDate()).toBe(24);
});

it('seçim tarihten deterministik ve dilden bağımsız; ardışık günler farklı', () => {
  expect(gununAyetiKaydi('2026-10-24')).toBe(gununAyetiKaydi('2026-10-24'));
  expect(gununAyetiKaydi('2026-10-24')).not.toBe(gununAyetiKaydi('2026-10-25'));
  const tr = gununAyetiGorunumu(gununAyetiKaydi('2026-10-24'), 'tr');
  const en = gununAyetiGorunumu(gununAyetiKaydi('2026-10-24'), 'en');
  expect(tr.ref).toBe(en.ref);
  expect(tr.ar).toBe(en.ar);
});

it('havuz boyu kadar ardışık günde her ayet tam bir kez çıkar', () => {
  const n = GUNUN_AYETI_HAVUZU.length;
  const bas = gunNumarasi('2026-01-01');
  const gorulen = new Set<string>();
  for (let i = 0; i < n; i++) {
    const t = new Date(Date.UTC(1970, 0, 1 + bas + i));
    gorulen.add(gununAyetiKaydi(t.toISOString().slice(0, 10)).ref);
  }
  expect(gorulen.size).toBe(n);
});

it('künye: Türkçede sûre adıyla, İngilizcede "Quran"; meal kaynağı yayımcı ve sürümle', () => {
  const kayit = GUNUN_AYETI_HAVUZU.find((k) => k.ref === '94:6');
  expect(kayit).toBeDefined();
  const tr = gununAyetiGorunumu(kayit!, 'tr');
  expect(tr.kisaKunye).toBe('İnşirâh 94:6');
  expect(tr.meal).toBe(kayit!.mealler.tr);
  expect(tr.mealKaynagi).toMatch(/^Rowwad Translation Center, QuranEnc \d/);
  expect(tr.tamKunye).toContain('Tanzil');
  const en = gununAyetiGorunumu(kayit!, 'en');
  expect(en.kisaKunye).toBe('Quran 94:6');
  expect(en.mealKaynagi).toMatch(/^Noor International Center, QuranEnc \d/);
});

it('meal kaynağı olan dil yalnız meali sığan ayetlerden seçer; meali hep dolu', () => {
  const havuz = dilHavuzu('ms');
  expect(havuz.length).toBeLessThan(GUNUN_AYETI_HAVUZU.length);
  expect(dilHavuzu('tr')).toHaveLength(GUNUN_AYETI_HAVUZU.length);
  expect(dilHavuzu('ms')).toBe(havuz);
  for (let g = 0; g < 400; g++) {
    const gun = new Date(Date.UTC(2026, 0, 1 + g)).toISOString().slice(0, 10);
    const gorunum = gununAyetiGorunumu(gununAyetiKaydi(gun, 'ms'), 'ms');
    expect(gorunum.meal).toBeTruthy();
    expect(gorunum.mealKaynagi).toMatch(/QuranEnc \d/);
  }
});

it('mealsiz diller (ku, tk, tt, sd, pl; sahip kararı 2026-11-02; pa 2026-11-04): bütün havuz, meal ve meal künyesi yok, Arapça künye', () => {
  for (const dil of ['ku', 'tk', 'tt', 'sd', 'pl', 'pa'] as const) {
    expect(dilHavuzu(dil)).toBe(tumHavuz());
    for (let g = 0; g < 30; g++) {
      const gun = new Date(Date.UTC(2026, 0, 1 + g)).toISOString().slice(0, 10);
      const kayit = gununAyetiKaydi(gun, dil);
      const gorunum = gununAyetiGorunumu(kayit, dil);
      expect(gorunum.meal).toBeNull();
      expect(gorunum.mealKaynagi).toBeNull();
      expect(gorunum.ar).toBe(kayit.ar);
      expect(gorunum.kisaKunye).toContain(kayit.ref);
      // Künye Arapça kaynağını yazar (meal kaynağı olmadan).
      expect(gorunum.tamKunye).toContain(kayit.ref);
      expect(gorunum.tamKunye).not.toContain('QuranEnc');
    }
  }
  // Plan yükü (widget, duvar kâğıdı) her kayıtta `meal: null` taşır.
  const plan = gununAyetiPlani(new Date(2026, 10, 2, 12), imsak6, 3, 'sd');
  expect(plan.length).toBeGreaterThan(0);
  for (const p of plan) expect(p.meal).toBeNull();
});

it('meali olan dalga 11 dilleri (ja, gu, bg, mk) kendi havuzundan seçer; Japonca mealde "*" ve not numarası yok', () => {
  for (const dil of ['ja', 'gu', 'bg', 'mk'] as const) {
    expect(dilHavuzu(dil).length).toBeGreaterThan(100);
    const gorunum = gununAyetiGorunumu(gununAyetiKaydi('2026-11-02', dil), dil);
    expect(gorunum.meal).toBeTruthy();
    expect(gorunum.mealKaynagi).toMatch(/QuranEnc \d/);
  }
  for (const k of dilHavuzu('ja')) expect(ayetMealiOku(k, 'ja')).not.toMatch(/[*]|\[\p{Nd}+\]/u);
  // Baştaki ayet numarası silinir (Gucarati rakamı "૨૫૫." dahil).
  for (const dil of ['gu', 'bg', 'mk'] as const) for (const k of dilHavuzu(dil)) expect(ayetMealiOku(k, dil)).not.toMatch(/^\s*\p{Nd}+\s*[.)]/u);
});

it('meali olan dalga 12 dilleri (fil, te, kn, mr, as, ne, si, km) kendi havuzundan seçer; Pencapça mealsiz', () => {
  for (const dil of ['fil', 'te', 'kn', 'mr', 'as', 'ne', 'si', 'km'] as const) {
    expect(dilHavuzu(dil).length).toBeGreaterThan(100);
    const gorunum = gununAyetiGorunumu(gununAyetiKaydi('2026-11-04', dil), dil);
    expect(gorunum.meal).toBeTruthy();
    expect(gorunum.mealKaynagi).toMatch(/QuranEnc \d/);
  }
  // Telugu "[1]" ve Marathi/Nepalce baştaki ayet numarası silinir.
  for (const k of dilHavuzu('te')) expect(ayetMealiOku(k, 'te')).not.toMatch(/\[\p{Nd}+\]/u);
  for (const dil of ['mr', 'ne'] as const) for (const k of dilHavuzu(dil)) expect(ayetMealiOku(k, dil)).not.toMatch(/^\s*\p{Nd}+\s*[.)]/u);
  expect(dilHavuzu('pa')).toBe(tumHavuz());
});

it('dalga 13 dillerinin hepsi meali olan diller: kendi havuzundan seçer, baştaki ayet numarası silinmiş', () => {
  for (const dil of ['he', 'ka', 'lt', 'mg', 'lg', 'rw', 'rn', 'ln', 'dag', 'mos', 'aa', 'mdh', 'ak', 'ceb', 'nqo'] as const) {
    // Kirundi havuzu 75 (uzun meal elenir), öteki diller 100'ün üstünde.
    expect([dil, dilHavuzu(dil).length > (dil === 'rn' ? 70 : 100)]).toEqual([dil, true]);
    const gorunum = gununAyetiGorunumu(gununAyetiKaydi('2026-11-04', dil), dil);
    expect(gorunum.meal).toBeTruthy();
    expect(gorunum.mealKaynagi).toMatch(/QuranEnc \d/);
  }
  // Litvanca, Dagbani, Afarca "255." ve İbranice noktasız "255 " baştaki ayet numarası silinir.
  for (const dil of ['lt', 'dag', 'aa', 'he'] as const) for (const k of dilHavuzu(dil)) expect(ayetMealiOku(k, dil)).not.toMatch(/^\s*\p{Nd}/u);
});

it('plan süren günden başlar, başlangıçlar imsak ve artan sırada', () => {
  const plan = gununAyetiPlani(new Date(2026, 9, 24, 3, 0), imsak6, 3, 'tr');
  expect(plan.map((p) => p.gun)).toEqual(['2026-10-23', '2026-10-24', '2026-10-25']);
  expect(new Date(plan[1].baslangicMs).getHours()).toBe(6);
  expect(plan[0].baslangicMs).toBeLessThan(plan[1].baslangicMs);
  expect(plan[1].ref).toBe(gununAyetiKaydi('2026-10-24').ref);
});
