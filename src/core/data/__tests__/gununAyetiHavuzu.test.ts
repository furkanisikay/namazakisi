/**
 * NÖBETÇİ — "Günün ayeti" havuzu: üreticinin (`scripts/icerik/gunun-ayeti-uret.js`) eleme
 * kuralları üretilmiş veride yeniden doğrulanır. Havuza elle kayıt eklenirse ya da üretici
 * kuralı gevşetilirse burada kırılır.
 */
import { GUNUN_AYETI_HAVUZU, GUNUN_AYETI_KAYNAKLARI } from '../gununAyetiHavuzu';
import { SURE_ADLARI_TR, sureAdiTr } from '../sureAdlari';

/** Vakte özgü ayetler (AGENTS.md fıkıh kuralı) ve hiç kullanılmayan İsrâ 17:79. */
const YASAK_REFLER = [
  '11:114', '17:78', '17:79', '20:130', '30:17', '30:18', '50:39', '50:40', '2:238', '4:103', '62:9',
];

describe('günün ayeti havuzu', () => {
  it('en az 180 ayet taşır', () => {
    expect(GUNUN_AYETI_HAVUZU.length).toBeGreaterThanOrEqual(180);
  });

  it('kural 1: meal her iki dilde en fazla 200 karakter', () => {
    const uzun = GUNUN_AYETI_HAVUZU.filter((k) => k.mealler.tr.length > 200 || k.mealler.en.length > 200);
    expect(uzun.map((k) => k.ref)).toEqual([]);
  });

  it('kural 2: mealde dipnot işareti yok', () => {
    const dipnotlu = GUNUN_AYETI_HAVUZU.filter((k) => /\[\d+\]|\*/.test(k.mealler.tr + k.mealler.en));
    expect(dipnotlu.map((k) => k.ref)).toEqual([]);
  });

  it('kural 3: önceki ayetin cümlesinin devamı değil', () => {
    const devam = GUNUN_AYETI_HAVUZU.filter(({ mealler: { tr, en } }) => {
      return (
        /^(Ve|Ki|O|Onlar|Ama|Fakat|Çünkü|Böylece|Hani|Oysa|Bunun sebebi)[\s,;:!]/.test(tr) ||
        /^\((Ve|Ama|Fakat|Çünkü)\)/.test(tr) ||
        /^[a-zçğıöşü]/.test(tr) ||
        /^[-–—]/.test(tr) ||
        /^'|''/.test(tr) ||
        /^[a-z]/.test(en) ||
        /^(And|So|But|Then|Who|Those who|Except|Until|Or|Nor|Rather|While|That is because)[\s,]/.test(en) ||
        /^No!/.test(en) ||
        /^["”’]/.test(en) ||
        !/[.!?]["”’)\]]*$/.test(en) ||
        (en.match(/"/g) ?? []).length % 2 === 1 ||
        (tr.match(/“/g) ?? []).length !== (tr.match(/”/g) ?? []).length ||
        (tr.match(/"/g) ?? []).length % 2 === 1 ||
        /^.{0,40}\bsaid\b/.test(en) ||
        /^Said /.test(en)
      );
    });
    expect(devam.map((k) => k.ref)).toEqual([]);
  });

  it("kural 4: yalnız Peygamber'e hitap eden ayet yok", () => {
    const hitap = GUNUN_AYETI_HAVUZU.filter(
      ({ mealler: { tr, en } }) =>
        /O Muḥammad|O Prophet|O Messenger/.test(en) ||
        /Ey (Peygamber|Muhammed|Nebi|Rasûl|Resûl)|Rasûlüm|Resûlüm|Resulüm/.test(tr),
    );
    expect(hitap.map((k) => k.ref)).toEqual([]);
  });

  it('kural 5: vakte özgü ayet ve İsrâ 17:79 yok', () => {
    expect(GUNUN_AYETI_HAVUZU.filter((k) => YASAK_REFLER.includes(k.ref)).map((k) => k.ref)).toEqual([]);
  });

  it('kural 6: Arapça dolu ve Tanzil besmele öneki taşımıyor (1. ayet yalnız Fâtiha)', () => {
    expect(GUNUN_AYETI_HAVUZU.filter((k) => !k.ar.trim()).map((k) => k.ref)).toEqual([]);
    expect(GUNUN_AYETI_HAVUZU.filter((k) => k.ayet === 1 && k.sure !== 1).map((k) => k.ref)).toEqual([]);
  });

  it('künye tutarlı: ref = sûre:ayet, sûre 1–114, tekil ve sıralı', () => {
    for (const k of GUNUN_AYETI_HAVUZU) {
      expect(k.ref).toBe(`${k.sure}:${k.ayet}`);
      expect(Number.isInteger(k.sure) && k.sure >= 1 && k.sure <= 114).toBe(true);
      expect(Number.isInteger(k.ayet) && k.ayet >= 1).toBe(true);
    }
    expect(new Set(GUNUN_AYETI_HAVUZU.map((k) => k.ref)).size).toBe(GUNUN_AYETI_HAVUZU.length);
    const sirali = [...GUNUN_AYETI_HAVUZU].sort((a, b) => a.sure - b.sure || a.ayet - b.ayet);
    expect(sirali.map((k) => k.ref)).toEqual(GUNUN_AYETI_HAVUZU.map((k) => k.ref));
  });

  it('kaynak künyeleri dolu (yayımcı + sürüm, Tanzil bağlantısı)', () => {
    expect(GUNUN_AYETI_KAYNAKLARI.ar).toEqual(
      expect.objectContaining({ ad: 'Tanzil', url: 'https://tanzil.net', surum: expect.any(String) }),
    );
    for (const dil of ['tr', 'en'] as const) {
      const kunye = GUNUN_AYETI_KAYNAKLARI.mealler[dil];
      expect(kunye.anahtar).toBeTruthy();
      expect(kunye.surum).toMatch(/^\d+(\.\d+)*$/);
      expect(kunye.baslik).toBeTruthy();
      expect(kunye.baslik).not.toContain(' - ');
    }
  });
});

describe('sûre adları', () => {
  it('114 sûrenin hepsinin boş olmayan Türkçe adı var', () => {
    expect(SURE_ADLARI_TR).toHaveLength(114);
    for (let s = 1; s <= 114; s++) expect(sureAdiTr(s).trim()).not.toBe('');
  });

  it('bilinen adlar ve aralık dışı', () => {
    expect(sureAdiTr(1)).toBe('Fâtiha');
    expect(sureAdiTr(3)).toBe('Âl-i İmrân');
    expect(sureAdiTr(13)).toBe("Ra'd");
    expect(sureAdiTr(94)).toBe('İnşirâh');
    expect(sureAdiTr(114)).toBe('Nâs');
    expect(sureAdiTr(0)).toBe('');
    expect(sureAdiTr(115)).toBe('');
  });
});
