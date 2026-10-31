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

  const mealler = (k: (typeof GUNUN_AYETI_HAVUZU)[number]) => Object.entries(k.mealler) as [string, string][];

  it('kural 1: kayıttaki her meal en fazla 200 karakter', () => {
    const uzun = GUNUN_AYETI_HAVUZU.flatMap((k) => mealler(k).filter(([, m]) => m.length > 200).map(([d]) => `${k.ref}:${d}`));
    expect(uzun).toEqual([]);
  });

  it('kural 2: mealde dipnot işareti, baştaki ya da sondaki ayet numarası yok (her yazının rakamı)', () => {
    // `\p{Nd}`: Batı, Devanagari (२), Bengalce (১), Gucarati (૨)…; ayraç içinde görünmez biçim karakteri olabilir.
    const dipnotlu = GUNUN_AYETI_HAVUZU.flatMap((k) =>
      mealler(k)
        .filter(
          ([, m]) =>
            /\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]|\*/u.test(m) ||
            /^\s*\p{Nd}+\s*[.)]\s/u.test(m) ||
            /\(\p{Nd}+\)\s*[.।]?\s*$/u.test(m) ||
            // Silinemeyen ayet numarası metnin içinde (uyghur_saleh: "(24)،", "(ـ18).", "(8ـ10)").
            /\([\p{Cf}\sـ\-–]*\p{Nd}[\p{Nd}\p{Cf}\sـ\-–]*\)/u.test(m),
        )
        .map(([d]) => `${k.ref}:${d}`),
    );
    expect(dipnotlu).toEqual([]);
  });

  it('boş meal yok (tamamlanmamış çeviri, korean_rwwad, bazı ayetleri boş verir; üretici eler)', () => {
    const bos = GUNUN_AYETI_HAVUZU.flatMap((k) => mealler(k).filter(([, m]) => !m.trim()).map(([d]) => `${k.ref}:${d}`));
    expect(bos).toEqual([]);
  });

  it('mealin başında ve sonunda boşluk yok (kurdish_bamoki her ayeti satır sonuyla bitirir; üretici kırpar)', () => {
    const bosluklu = GUNUN_AYETI_HAVUZU.flatMap((k) => mealler(k).filter(([, m]) => m !== m.trim()).map(([d]) => `${k.ref}:${d}`));
    expect(bosluklu).toEqual([]);
  });

  it('Türkçe ve İngilizce her kayıtta; her meal dilinin künyesi var ve havuzu en az 100 ayet', () => {
    for (const k of GUNUN_AYETI_HAVUZU) expect([k.ref, typeof k.mealler.tr, typeof k.mealler.en]).toEqual([k.ref, 'string', 'string']);
    for (const dil of Object.keys(GUNUN_AYETI_KAYNAKLARI.mealler)) {
      const n = GUNUN_AYETI_HAVUZU.filter((k) => (k.mealler as Record<string, string | undefined>)[dil]).length;
      expect([dil, n >= 100]).toEqual([dil, true]);
    }
    for (const k of GUNUN_AYETI_HAVUZU) {
      for (const dil of Object.keys(k.mealler)) expect(GUNUN_AYETI_KAYNAKLARI.mealler).toHaveProperty(dil);
    }
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
    for (const kunye of Object.values(GUNUN_AYETI_KAYNAKLARI.mealler)) {
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
