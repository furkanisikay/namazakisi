/**
 * Kaza Defteri 2.0 — hareket normalize, birleştirme (G-Set), ileri uyumluluk.
 */
import {
  bilinmeyenHareketMi,
  hareketKimligi,
  hareketNormalize,
  hareketleriAyristir,
  hareketleriBirlestir,
  referansCoz,
  type KazaHareketi,
} from '../kazaHareketi';

const temel = { zaman: '2026-10-14T08:00:00.000Z', cihaz: 'abc' };
const m = (id: string, ek: Partial<KazaHareketi> = {}): KazaHareketi => ({
  id,
  ...temel,
  kaynak: 'manuel',
  vakit: 'sabah',
  adet: 1,
  ...ek,
});

describe('hareketNormalize', () => {
  it('geçerli hareketleri kaynağa göre doğrular', () => {
    expect(hareketNormalize(m('a'))).toEqual(m('a'));
    expect(hareketNormalize({ id: 'b', ...temel, kaynak: 'bildirim', referans: '2026-10-13_yatsi' })).toMatchObject({
      vakit: 'yatsi',
      adet: 1,
    });
    expect(
      hareketNormalize({ id: 't', ...temel, kaynak: 'taban', taban: { sabah: 3.7, ogle: -2, x: 9 }, kapsamBitis: '2026-10-14' })
    ).toMatchObject({ taban: { sabah: 3, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitir: 0 }, kapsamBitis: '2026-10-14' });
    expect(hareketNormalize({ id: 'd', ...temel, kaynak: 'duzeltme', vakit: 'ogle', adet: -4 })).toMatchObject({ adet: -4 });
    expect(hareketNormalize({ id: 'e', ...temel, kaynak: 'eskiGorunum', kilinanlar: { sabah: 5 } })).toMatchObject({
      kilinanlar: { sabah: 5, ogle: 0 },
    });
  });

  it.each([
    ['nesne değil', 42],
    ['kimliksiz', { ...temel, kaynak: 'manuel', vakit: 'sabah', adet: 1 }],
    ['zamanı bozuk', { id: 'x', zaman: 'dün', cihaz: 'a', kaynak: 'manuel', vakit: 'sabah', adet: 1 }],
    ['vakitsiz kılındı (genel tamamlama KALDIRILDI)', { id: 'x', ...temel, kaynak: 'kilindi', adet: 2 }],
    ['sıfır adet', { id: 'x', ...temel, kaynak: 'manuel', vakit: 'sabah', adet: 0 }],
    ['kesirli adet', { id: 'x', ...temel, kaynak: 'manuel', vakit: 'sabah', adet: 1.5 }],
    ['bozuk referans', { id: 'x', ...temel, kaynak: 'bildirim', referans: '2026-10-13_cuma' }],
    ['grupsuz göç kılınanı', { id: 'x', ...temel, kaynak: 'kilindi', vakit: 'sabah', adet: 1, gocmis: true }],
    ['boş temizlik', { id: 'x', ...temel, kaynak: 'temizlik', hedefIdler: [] }],
  ])('%s → null', (_ad, ham) => {
    expect(hareketNormalize(ham)).toBeNull();
  });

  it('tarama günlüğü geçersiz referansları ayıklar', () => {
    expect(
      hareketNormalize({ id: 'x', ...temel, kaynak: 'tarama', eklenen: ['2026-10-13_ogle', 'kötü'], cikan: [3] })
    ).toMatchObject({ eklenen: ['2026-10-13_ogle'], cikan: [] });
  });

  it('referansCoz', () => {
    expect(referansCoz('2026-10-13_vitir')).toEqual({ gun: '2026-10-13', vakit: 'vitir' });
    expect(referansCoz('2026-10-13')).toBeNull();
  });
});

describe('hareketleriBirlestir (G-Set)', () => {
  const a = m('a', { zaman: '2026-10-01T00:00:00.000Z' });
  const b = m('b', { zaman: '2026-10-02T00:00:00.000Z' });
  const c = m('c', { zaman: '2026-10-03T00:00:00.000Z' });

  it('değişmeli, birleşmeli ve tekrar uygulanabilir', () => {
    const x = hareketleriBirlestir([a, b], [c]);
    expect(hareketleriBirlestir([c], [b, a])).toEqual(x);
    expect(hareketleriBirlestir(hareketleriBirlestir([a], [b]), [c])).toEqual(hareketleriBirlestir([a], hareketleriBirlestir([b], [c])));
    expect(hareketleriBirlestir(x, x, [a])).toEqual(x);
  });

  it('aynı kimlikli iki farklı içerikte iki cihaz AYNI kazananı seçer', () => {
    const eski = m('k', { zaman: '2026-10-01T00:00:00.000Z', adet: 1 });
    const yeni = m('k', { zaman: '2026-10-05T00:00:00.000Z', adet: 2 });
    expect(hareketleriBirlestir([eski], [yeni])).toEqual(hareketleriBirlestir([yeni], [eski]));
    expect(hareketleriBirlestir([eski], [yeni])[0].adet).toBe(2);
  });
});

describe('ileri uyumluluk', () => {
  const gelecek = { id: 'g1', zaman: '2026-10-01T00:00:00.000Z', kaynak: 'yeniTur', ek: { a: 1 } };

  it('yapısal geçerli ama çözülemeyen öğe "bilinmeyen"dir; yapısız değer değildir', () => {
    expect(bilinmeyenHareketMi(gelecek)).toBe(true);
    // Tanınan kaynağın yeni sürümde değişmiş biçimi de korunur.
    expect(bilinmeyenHareketMi({ id: 'g2', zaman: gelecek.zaman, kaynak: 'manuel', vakit: 'yeniVakit', adet: 1 })).toBe(true);
    expect(bilinmeyenHareketMi(m('a'))).toBe(false);
    expect(bilinmeyenHareketMi({ id: 'x', zaman: 'bozuk', kaynak: 'yeniTur' })).toBe(false);
    expect(bilinmeyenHareketMi(null)).toBe(false);
  });

  it('ayrıştırma tanınanı normalize eder, bilinmeyeni HAM ve tekil tutar', () => {
    const { taninan, bilinmeyen } = hareketleriAyristir([m('a'), gelecek, gelecek, 7, 'x']);
    expect(taninan.map((h) => h.id)).toEqual(['a']);
    expect(bilinmeyen).toEqual([gelecek]);
    expect(hareketleriAyristir('dizi değil')).toEqual({ taninan: [], bilinmeyen: [] });
  });
});

describe('hareketKimligi', () => {
  afterEach(() => jest.restoreAllMocks());

  it('aynı milisaniyede ve sabit rastgelede bile tekil', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const kimlikler = Array.from({ length: 50 }, () => hareketKimligi('karar', 1_000));
    expect(new Set(kimlikler).size).toBe(50);
    expect(kimlikler[0].startsWith('karar:')).toBe(true);
  });
});
