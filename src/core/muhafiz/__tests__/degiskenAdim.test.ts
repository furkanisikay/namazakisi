/**
 * Issue #274 Faz 0 — değişken uzunluklu `seviyeler` (1..6) ve ayrı "ton".
 *
 * Nöbetçiler: kronolojik sıralı görünüm, eşik tekilliği göçünün DAVRANIŞI
 * KORUMASI, vakit başı 60 uyarı tavanı, preset/yön yollarının N adımı çökertmemesi.
 */
import type {
  MuhafizMatrisi,
  SeviyeAyari,
  SeviyeKademe,
  UyariKanallari,
  VakitMuhafizAyari,
} from '../matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from '../matrisTipleri';
import {
  kronolojikIndeks,
  kronolojikSirala,
  esikSiralamasiGecerliMi,
} from '../aktifSeviye';
import { esikSinirlariniHesapla } from '../esikSinirlari';
import {
  adimButcesiHesapla,
  PLAN_ADIM_UST_SINIRI,
  VAKIT_PLAN_UST_SINIRI,
} from '../planButcesi';
import { matrisGecerliMi, muhafizMatrisiniCoz, vakitUyariPlaniOlustur } from '../motorAdaptoru';
import { esikTekilliginiGoc, yonEsiklerineGoc } from '../muhafizGoc';
import {
  presetUygula,
  presetZamanlamasiniUygula,
  vaktinYonunuDegistir,
  zamanlamayiUyarla,
  type PresetSeviyeleri,
} from '../matrisIslemleri';

const BILDIRIM: UyariKanallari = { bildirim: true };

const sv = (
  kademe: SeviyeKademe,
  esikDk: number,
  siklikDk: number | 'birkez' = 'birkez',
  kanallar: UyariKanallari = BILDIRIM
): SeviyeAyari => ({
  kademe,
  kanallar,
  esikDk,
  siklik: siklikDk === 'birkez' ? 'birkez' : { herDk: siklikDk },
  bildirimSesi: 'varsayilan',
  anonsMetni: '',
});

const matrisKur = (vakitAyari: () => VakitMuhafizAyari): MuhafizMatrisi =>
  Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakitAyari()])) as MuhafizMatrisi;

const NORMAL: PresetSeviyeleri = [
  { kademe: 'nazik', esikDk: 45, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
  { kademe: 'uyari', esikDk: 25, siklik: { herDk: 10 }, kanallar: BILDIRIM, acilKanal: false },
  { kademe: 'sert', esikDk: 10, siklik: { herDk: 5 }, kanallar: BILDIRIM, acilKanal: false },
  { kademe: 'acil', esikDk: 3, siklik: 'birkez', kanallar: BILDIRIM, acilKanal: false },
];

describe('kronolojik sıralı görünüm', () => {
  test('çıkışta eşik AZALAN, girişte ARTAN; girdi değişmez', () => {
    const dizi = [sv('sert', 10), sv('nazik', 45), sv('nazik', 25)];
    expect(kronolojikSirala(dizi, 'cikisaDogru').map((s) => s.esikDk)).toEqual([45, 25, 10]);
    expect(kronolojikSirala(dizi, 'girisindenItibaren').map((s) => s.esikDk)).toEqual([10, 25, 45]);
    expect(dizi.map((s) => s.esikDk)).toEqual([10, 45, 25]);
  });

  test('kronolojikIndeks tonu değil ZAMANI sayar', () => {
    const dizi = [sv('sert', 45), sv('nazik', 10)];
    expect(kronolojikIndeks(dizi, dizi[0], 'cikisaDogru')).toBe(0);
    expect(kronolojikIndeks(dizi, dizi[1], 'cikisaDogru')).toBe(1);
  });
});

describe('esikSinirlariniHesapla — sıralı görünüm (indeks değil)', () => {
  test('sırasız dizide komşular EŞİKTEN bulunur', () => {
    // 25'in eşiğe göre komşuları 10 ve 45 — dizideki yerleri önemsiz.
    const dizi = [sv('nazik', 10), sv('uyari', 45), sv('sert', 25)];
    expect(esikSinirlariniHesapla(dizi, 2)).toEqual({ min: 11, max: 44 });
  });

  test('tek adımda yalnız tavan sınırlar', () => {
    expect(esikSinirlariniHesapla([sv('nazik', 30)], 0, { pencereUzunluguDk: 90 })).toEqual({
      min: 1,
      max: 89,
    });
  });

  test('6 adımlı dizide orta adım iki komşusuna kilitlenir', () => {
    const dizi = [60, 50, 40, 30, 20, 10].map((e) => sv('uyari', e));
    expect(esikSinirlariniHesapla(dizi, 3)).toEqual({ min: 21, max: 39 });
  });
});

describe('vakit başı 60 uyarı tavanı', () => {
  test('seviye başı bütçe: 1–4 adım 15 (davranış değişmez), 5 adım 12, 6 adım 10', () => {
    expect([1, 2, 3, 4, 5, 6].map(adimButcesiHesapla)).toEqual([15, 15, 15, 15, 12, 10]);
    expect(adimButcesiHesapla(4)).toBe(PLAN_ADIM_UST_SINIRI);
  });

  test('6 adımlı, dakikada bir tekrarlı matriste vakit başı <= 60 uyarı', () => {
    const seviyeler = [600, 500, 400, 300, 200, 100].map((e, i) =>
      sv(SEVIYE_KADEMELERI[Math.min(i, 3)], e, 1)
    );
    const cikis = vakitUyariPlaniOlustur({ seviyeler }, Number.MAX_SAFE_INTEGER);
    expect(cikis.length).toBeLessThanOrEqual(VAKIT_PLAN_UST_SINIRI);
    // Her adım en az bir kez konuşur (bütçe adım SİLMEZ, seyreltir).
    expect(new Set(cikis.map((u) => u.adimIndeks)).size).toBe(6);

    const giris = vakitUyariPlaniOlustur(
      { seviyeler: [...seviyeler].reverse(), yon: 'girisindenItibaren' },
      1,
      { pencereUzunluguDk: 700 }
    );
    expect(giris.length).toBeLessThanOrEqual(VAKIT_PLAN_UST_SINIRI);
  });

  test('varsayılan 4 adımlı matris HİÇ seyrelmez (45/25/10/3 — 15/10/5/1)', () => {
    const seviyeler = [sv('nazik', 45, 15), sv('uyari', 25, 10), sv('sert', 10, 5), sv('acil', 3, 1)];
    const plan = vakitUyariPlaniOlustur({ seviyeler }, 1000);
    expect(plan.map((u) => u.olcuDk)).toEqual([45, 30, 25, 15, 10, 5, 3, 2, 1]);
  });
});

describe('UyariPlani.adimIndeks', () => {
  test('aynı tonlu iki adım ayrı sıra numarası taşır', () => {
    const seviyeler = [sv('nazik', 30), sv('nazik', 20), sv('sert', 5)];
    const plan = vakitUyariPlaniOlustur({ seviyeler }, 1000);
    expect(plan.map((u) => [u.olcuDk, u.seviye, u.adimIndeks])).toEqual([
      [30, 1, 0],
      [20, 1, 1],
      [5, 3, 2],
    ]);
  });
});

describe('esikTekilliginiGoc — davranışı BİREBİR korur', () => {
  const planlar = (m: MuhafizMatrisi) =>
    MUHAFIZ_VAKITLERI.map((v) =>
      vakitUyariPlaniOlustur(m[v], 1000).map((u) => [u.olcuDk, u.seviye, u.kanallar])
    );

  test('eşit eşikli eski matris geçerli hale gelir, plan değişmez, ayar kaybolmaz', () => {
    // Eski global ayarlardan gelmiş: sert = acil = 5 → sert hiç konuşmuyordu.
    const ham = matrisKur(() => ({
      seviyeler: [sv('nazik', 30, 10), sv('uyari', 15, 5), sv('sert', 5, 1), sv('acil', 5, 1)],
    }));
    expect(matrisGecerliMi(ham)).toBe(false);

    const goclu = esikTekilliginiGoc(ham);
    expect(matrisGecerliMi(goclu)).toBe(true);
    expect(planlar(goclu)).toEqual(planlar(ham));

    // Gölgede kalan adım KAPATILDI ama kanalları hafızada duruyor.
    const sert = goclu.ogle.seviyeler[2];
    expect(sert.kanallar).toEqual({});
    expect(sert.oncekiKanallar).toEqual(BILDIRIM);
    expect(sert.esikDk).toBe(6);
  });

  test('idempotent ve tekilse AYNI referans', () => {
    const ham = matrisKur(() => ({ seviyeler: [sv('nazik', 30), sv('acil', 30)] }));
    const bir = esikTekilliginiGoc(ham);
    expect(esikTekilliginiGoc(bir)).toBe(bir);
  });

  test('giriş yönünde gölgedeki adım ERKENE (eşik −1) kaydırılır', () => {
    const ham = matrisKur(() => ({
      yon: 'girisindenItibaren',
      seviyeler: [sv('nazik', 10), sv('sert', 10)],
    }));
    const goclu = esikTekilliginiGoc(ham);
    expect(goclu.aksam.seviyeler.map((s) => s.esikDk)).toEqual([9, 10]);
  });

  test('muhafizMatrisiniCoz eşit eşikli matrisi eskiden TÜRETMEZ (kanallar korunur)', () => {
    const ham = matrisKur(() => ({
      seviyeler: [sv('nazik', 30, 'birkez', { sesli: true }), sv('acil', 30)],
    }));
    const cozulen = muhafizMatrisiniCoz({
      matris: ham,
      esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
      sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });
    expect(cozulen.ogle.seviyeler).toHaveLength(2);
    expect(cozulen.ogle.seviyeler[0].oncekiKanallar).toEqual({ sesli: true });
  });
});

describe('yonEsiklerineGoc yalnız ESKİ 4 adımlı şekle dokunur', () => {
  test('ters sıralı ama yeni şekilli (3 adım) giriş kaydı EZİLMEZ', () => {
    const m = matrisKur(() => ({
      yon: 'girisindenItibaren',
      seviyeler: [sv('sert', 40), sv('nazik', 20), sv('nazik', 10)],
    }));
    expect(yonEsiklerineGoc(m, 'normal')).toBe(m);
  });

  test('eski şekil (nazik→acil, azalan) yine düzeltilir', () => {
    const m = matrisKur(() => ({
      yon: 'girisindenItibaren',
      seviyeler: [sv('nazik', 45), sv('uyari', 25), sv('sert', 10), sv('acil', 3)],
    }));
    const sonuc = yonEsiklerineGoc(m, 'normal');
    expect(esikSiralamasiGecerliMi(sonuc.yatsi.seviyeler, 'girisindenItibaren')).toBe(true);
  });
});

describe('preset ve yön yolları N adımı çökertmez', () => {
  test('presetUygula 6 adımlı vakti preset adımlarına (4) indirir, sesi korur', () => {
    const m = matrisKur(() => ({
      seviyeler: [60, 50, 40, 30, 20, 10].map((e) => ({ ...sv('sert', e), bildirimSesi: 'content://ses' })),
    }));
    const sonuc = presetUygula(m, NORMAL, false, 'normal');
    expect(sonuc.ogle.seviyeler.map((s) => [s.kademe, s.esikDk])).toEqual([
      ['nazik', 45],
      ['uyari', 25],
      ['sert', 10],
      ['acil', 3],
    ]);
    expect(sonuc.ogle.seviyeler.every((s) => s.bildirimSesi === 'content://ses')).toBe(true);
    expect(matrisGecerliMi(sonuc)).toBe(true);
  });

  test('presetUygula 2 adımlı vakti 4 adıma tamamlar', () => {
    const m = matrisKur(() => ({ seviyeler: [sv('nazik', 30), sv('sert', 5)] }));
    const sonuc = presetUygula(m, NORMAL, false, 'normal');
    expect(sonuc.imsak.seviyeler).toHaveLength(4);
    expect(matrisGecerliMi(sonuc)).toBe(true);
  });

  test('bir kerelik zamanlama göçü farklı yapıya DOKUNMAZ', () => {
    const m = matrisKur(() => ({ seviyeler: [sv('nazik', 33), sv('sert', 7)] }));
    const sonuc = presetZamanlamasiniUygula(m, NORMAL, 'normal');
    expect(sonuc.ogle.seviyeler.map((s) => s.esikDk)).toEqual([33, 7]);
  });

  test.each([1, 2, 3, 5, 6])('yön değişimi %i adımlı vakitte adım sayısını korur', (n) => {
    const ayar: VakitMuhafizAyari = {
      seviyeler: [70, 55, 40, 25, 10, 5].slice(0, n).map((e) => sv('uyari', e)),
    };
    const giris = vaktinYonunuDegistir(ayar, 'yatsi', 'girisindenItibaren', NORMAL, 'normal');
    expect(giris.seviyeler).toHaveLength(n);
    expect(esikSiralamasiGecerliMi(giris.seviyeler, 'girisindenItibaren')).toBe(true);

    const geri = vaktinYonunuDegistir(giris, 'yatsi', 'cikisaDogru', NORMAL, 'normal');
    // Yedek AYNEN geri gelir.
    expect(geri.seviyeler.map((s) => s.esikDk)).toEqual(ayar.seviyeler.map((s) => s.esikDk));
  });

  test('zamanlamayiUyarla: aynı sayı aynen, az ise SON adımlar, fazla ise boşluğa orta nokta', () => {
    expect(zamanlamayiUyarla(NORMAL, 4, 'cikisaDogru').map((z) => z.esikDk)).toEqual([45, 25, 10, 3]);
    expect(zamanlamayiUyarla(NORMAL, 2, 'cikisaDogru').map((z) => z.esikDk)).toEqual([10, 3]);
    const alti = zamanlamayiUyarla(NORMAL, 6, 'cikisaDogru').map((z) => z.esikDk);
    expect(alti).toHaveLength(6);
    expect(new Set(alti).size).toBe(6);
    expect(esikSiralamasiGecerliMi(alti.map((esikDk) => ({ esikDk })), 'cikisaDogru')).toBe(true);
  });
});
