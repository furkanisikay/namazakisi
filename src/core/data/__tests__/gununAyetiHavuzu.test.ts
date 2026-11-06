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
            // Noktasız baştaki numara da (hebrew_darussalam "255 אללה…").
            /^\s*\p{Nd}+\s*[.)]?\s/u.test(m) ||
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

  it('mealde kaynakta bozulmuş harf yok (hausa_gummi "¦aki": Ɗ yerine U+00A6)', () => {
    const bozuk = GUNUN_AYETI_HAVUZU.flatMap((k) => mealler(k).filter(([, m]) => /[\u00a6\ufffd]/u.test(m)).map(([d]) => `${k.ref}:${d}`));
    expect(bozuk).toEqual([]);
  });

  it('Marathi mealinde rakam yok (cümle sonu notu silinir, sözcüğe yapışık not numaralı kayıt elenir)', () => {
    const rakamli = GUNUN_AYETI_HAVUZU.filter((k) => /\p{Nd}/u.test(k.mealler.mr ?? '')).map((k) => k.ref);
    expect(rakamli).toEqual([]);
  });

  it('Latin dışı yazılı dalga 12 meallerinde Latin harf yok (sinhalese_mahir 2:277 "zසකාත්" kaynak bozulması)', () => {
    const bozuk = GUNUN_AYETI_HAVUZU.flatMap((k) =>
      (['te', 'kn', 'mr', 'as', 'ne', 'si', 'km', 'he', 'ka', 'nqo'] as const)
        .filter((d) => /\p{Script=Latin}/u.test(k.mealler[d] ?? ''))
        .map((d) => `${k.ref}:${d}`),
    );
    expect(bozuk).toEqual([]);
  });

  it('Latin harfli mealde Kiril harf yok (afar_hamza "Yalli как Aanee", lingala_zakaria "тропа" kaynak bozulması)', () => {
    const kiril = GUNUN_AYETI_HAVUZU.flatMap((k) =>
      mealler(k)
        .filter(([d]) => !['ru', 'uz', 'kk', 'ky', 'tg', 'uk', 'sr', 'bg', 'mk', 'el'].includes(d))
        .filter(([, m]) => /\p{Script=Cyrillic}/u.test(m))
        .map(([d]) => `${k.ref}:${d}`),
    );
    expect(kiril).toEqual([]);
  });

  it('mealin başında ve sonunda boşluk yok (kurdish_bamoki her ayeti satır sonuyla bitirir; üretici kırpar)', () => {
    const bosluklu = GUNUN_AYETI_HAVUZU.flatMap((k) => mealler(k).filter(([, m]) => m !== m.trim()).map(([d]) => `${k.ref}:${d}`));
    expect(bosluklu).toEqual([]);
  });

  it('Türkçe ve İngilizce her kayıtta; her meal dilinin künyesi var ve havuzu en az 100 ayet', () => {
    for (const k of GUNUN_AYETI_HAVUZU) expect([k.ref, typeof k.mealler.tr, typeof k.mealler.en]).toEqual([k.ref, 'string', 'string']);
    for (const dil of Object.keys(GUNUN_AYETI_KAYNAKLARI.mealler)) {
      const n = GUNUN_AYETI_HAVUZU.filter((k) => (k.mealler as Record<string, string | undefined>)[dil]).length;
      // İstisna Kirundi (dalga 13): `ikirundi_gehiti` açıklamalı ve uzun, 106 kayıt 200 harfi aşar → havuz 75
      // (QuranEnc'te tek Kirundi meal; sahibe soruldu).
      expect([dil, n >= (dil === 'rn' ? 70 : 100)]).toEqual([dil, true]);
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

describe('üreticinin meal temizliği (scripts/icerik/gunun-ayeti-uret.js)', () => {
  const { notNumarasiz, mealGerekce } = require('../../../../scripts/icerik/gunun-ayeti-uret');

  it('Japonca (sahip kararı 2026-11-02): sözlük işareti "*" ve not numarası silinir, tam genişlik parantez kalır', () => {
    expect(notNumarasiz('ja', 'アッラー*は…[1]')).toBe('アッラーは…');
    expect(notNumarasiz('ja', '（預言者よ、）アッラー*以外に[2]')).toBe('（預言者よ、）アッラー以外に');
    expect(mealGerekce(notNumarasiz('ja', 'アッラー*は…[1]'))).toEqual([]);
    // Yıldız kuralı YALNIZ Japoncada: diğer dillerde "*" dipnot işaretidir, meal alınmaz.
    expect(notNumarasiz('en', 'God* is…')).toBe('God* is…');
    expect(mealGerekce('God* is…')).toContain('dipnot');
  });

  it('Makedoncada not numarası, Gucaratça/Bulgarca/Makedoncada baştaki ayet numarası silinir (her yazının rakamı)', () => {
    expect(notNumarasiz('gu', '૨૫૫. અલ્લાહ')).toBe('અલ્લાહ');
    expect(notNumarasiz('bg', '255. Аллах')).toBe('Аллах');
    expect(notNumarasiz('mk', '255. Аллах[1] е')).toBe('Аллах е');
    // Kümede olmayan dilde numara silinmez (meal elenir).
    expect(notNumarasiz('sr', '255. Аллах')).toBe('255. Аллах');
  });

  it('dalga 12 (sahip kararları 2026-11-04): Telugu "[1]", Marathi ve Nepalce baştaki ayet numarası silinir', () => {
    expect(notNumarasiz('te', 'అల్లాహ్ ఉంటాడు.[1]')).toBe('అల్లాహ్ ఉంటాడు.');
    expect(notNumarasiz('mr', '१५३. हे ईमान राखणाऱ्यांनो!')).toBe('हे ईमान राखणाऱ्यांनो!');
    // Nepalce ayet numarası ")" ile: "१५३) …".
    expect(notNumarasiz('ne', '१५३) हे आस्थावानहरू ।')).toBe('हे आस्थावानहरू ।');
  });

  it('Marathi cümle sonuna yapışık not numarası: YALNIZ cümle sonu işaretinden hemen sonraki rakam silinir', () => {
    expect(notNumarasiz('mr', '१५३. अल्लाह साथ देतो.१')).toBe('अल्लाह साथ देतो.');
    expect(notNumarasiz('mr', 'हक्क आहे.१ ते या ग्रंथावर')).toBe('हक्क आहे. ते या ग्रंथावर');
    expect(notNumarasiz('mr', 'आहे?१ मुळीच नाही.')).toBe('आहे? मुळीच नाही.');
    expect(notNumarasiz('mr', 'देतो।१२')).toBe('देतो।');
    // Sözcüğe yapışık ya da boşluktan sonraki rakama dokunulmaz; o meal rakam taşıdığı için alınmaz.
    expect(notNumarasiz('mr', 'शिकवावे१ आणि')).toBe('शिकवावे१ आणि');
    expect(notNumarasiz('mr', 'मार्ग दाखव. १')).toBe('मार्ग दाखव. १');
    expect(mealGerekce(notNumarasiz('mr', 'शिकवावे१ आणि'), 'mr')).toContain('dipnot');
    expect(mealGerekce(notNumarasiz('mr', 'अल्लाह साथ देतो.१'), 'mr')).toEqual([]);
    // Kural yalnız Marathide: Nepalce/Hintçede cümle sonu rakamı silinmez.
    expect(notNumarasiz('hi', 'देता है.१')).toBe('देता है.१');
  });

  it('Latin dışı yazılı dalga 12 mealinde Latin harf kaynak bozulmasıdır (bozuk-karakter); Filipincede değil', () => {
    expect(mealGerekce('ද, zසකාත් පිර', 'si')).toContain('bozuk-karakter');
    expect(mealGerekce('ದುಷ್ಪೆçÃರಣೆ', 'kn')).toContain('bozuk-karakter');
    expect(mealGerekce('Tunay na si Allāh ay kasama ng mga nagtitiis.', 'fil')).toEqual([]);
  });

  it('dalga 13: Litvanca, Dagbani, Afarca baştaki "255." ve İbranice noktasız "255 " ayet numarası silinir', () => {
    expect(notNumarasiz('lt', '255. Allahas')).toBe('Allahas');
    expect(notNumarasiz('dag', '5.Yaa ti Duuma Naawuni')).toBe('Yaa ti Duuma Naawuni');
    expect(notNumarasiz('aa', '255. Yalli')).toBe('Yalli');
    expect(notNumarasiz('he', '255 אללה')).toBe('אללה');
    // Noktasız silme yalnız İbranicede; başka dilde noktasız baştaki numara meal eler.
    expect(notNumarasiz('ka', '255 ალაჰი')).toBe('255 ალაჰი');
    expect(mealGerekce('255 ალაჰი', 'ka')).toContain('basta-numara');
  });

  it('dalga 13: Latin harfli mealde Kiril/İbrani/Arap harfi ve satır sonu bozuk-karakter; ﷺ ve Yunan ε/ͻ (dag, mos, ak) elenmez; İbrani/Gürcü/N\'Ko mealinde Latin harf bozuk', () => {
    expect(mealGerekce('Yalli sin как waase', 'aa')).toContain('bozuk-karakter');
    expect(mealGerekce('ezali bilembo тропа bato', 'ln')).toContain('bozuk-karakter');
    expect(mealGerekce('Nokorε sε, Onyankopכn ne', 'ak')).toContain('bozuk-karakter');
    expect(mealGerekce('خ هanareo mpino!', 'mg')).toContain('bozuk-karakter');
    expect(mealGerekce('pahayag\n alang sa katawhan', 'ceb')).toContain('bozuk-karakter');
    expect(mealGerekce('Pranašas Muchammedas ﷺ', 'lt')).toEqual([]);
    expect(mealGerekce('Wonko ara na yε\u2019resom Woͻ', 'ak')).toEqual([]);
    expect(mealGerekce('אללה x', 'he')).toContain('bozuk-karakter');
    expect(mealGerekce('ალაჰი a', 'ka')).toContain('bozuk-karakter');
    // Kiril kuralı yalnız dalga 13 Latin dillerinde (Rusça meal Kiril yazılır).
    expect(mealGerekce('Аллах', 'ru')).toEqual([]);
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
