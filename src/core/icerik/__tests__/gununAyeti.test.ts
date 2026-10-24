/**
 * Günün ayeti seçimi: namaz günü sınırı (imsak), dilden bağımsız seçim, tam tur, künye.
 */
import { aktifNamazGunu, gununAyetiGorunumu, gununAyetiKaydi, gununAyetiPlani, gunNumarasi } from '../gununAyeti';
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

it('plan süren günden başlar, başlangıçlar imsak ve artan sırada', () => {
  const plan = gununAyetiPlani(new Date(2026, 9, 24, 3, 0), imsak6, 3, 'tr');
  expect(plan.map((p) => p.gun)).toEqual(['2026-10-23', '2026-10-24', '2026-10-25']);
  expect(new Date(plan[1].baslangicMs).getHours()).toBe(6);
  expect(plan[0].baslangicMs).toBeLessThan(plan[1].baslangicMs);
  expect(plan[1].ref).toBe(gununAyetiKaydi('2026-10-24').ref);
});
