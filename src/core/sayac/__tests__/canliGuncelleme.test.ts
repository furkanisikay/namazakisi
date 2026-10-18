import {
  canliGuncellemeyeUygunMu,
  iftarCanliYukuOlustur,
  ilerlemeBolumleriOlustur,
  kisaKritikMetin,
  sahurCanliYukuOlustur,
  sonrakiTazelemeMs,
  vakitCanliYukuOlustur,
} from '../canliGuncelleme';

// Kotlin ikiziyle (CanliGuncellemeKurallari) ORTAK fikstür — iki dil ayrışmasın.
const fikstur = require('../../../../modules/expo-countdown-notification/android/src/test/resources/kisa-metin-ornekleri.json') as {
  kisaMetin: { kalanMs: number; metin: string }[];
  sonrakiTazeleme: { simdiMs: number; hedefMs: number; anMs: number | null }[];
};

const DK = 60_000;

describe('canliGuncelleme — hangi sayaç öne çıkar', () => {
  test('vakit, iftar, sahur öne çıkar; SERİ çıkmaz (baskı hissi istenmiyor)', () => {
    expect(canliGuncellemeyeUygunMu('vakit')).toBe(true);
    expect(canliGuncellemeyeUygunMu('iftar')).toBe(true);
    expect(canliGuncellemeyeUygunMu('sahur')).toBe(true);
    expect(canliGuncellemeyeUygunMu('seri')).toBe(false);
  });
});

describe('kisaKritikMetin — Kotlin ile ortak fikstür', () => {
  test.each(fikstur.kisaMetin)('$kalanMs ms → "$metin"', ({ kalanMs, metin }) => {
    expect(kisaKritikMetin(kalanMs)).toBe(metin);
  });

  test('örnekler: "12 dk", "1 sa 5 dk"', () => {
    expect(kisaKritikMetin(12 * DK)).toBe('12 dk');
    expect(kisaKritikMetin(65 * DK)).toBe('1 sa 5 dk');
  });
});

describe('sonrakiTazelemeMs — Kotlin ile ortak fikstür', () => {
  test.each(fikstur.sonrakiTazeleme)('şimdi=$simdiMs hedef=$hedefMs → $anMs', ({ simdiMs, hedefMs, anMs }) => {
    expect(sonrakiTazelemeMs(simdiMs, hedefMs)).toBe(anMs);
  });

  test('tazeleme anı kısa metnin gerçekten değiştiği andır', () => {
    const hedef = 30 * DK + 12_345;
    const an = sonrakiTazelemeMs(0, hedef)!;
    expect(kisaKritikMetin(hedef - (an - 1))).toBe('31 dk');
    expect(kisaKritikMetin(hedef - an)).toBe('30 dk');
  });
});

describe('ilerlemeBolumleriOlustur', () => {
  test('geçersiz aralık → boş (çubuk çizilmez)', () => {
    expect(ilerlemeBolumleriOlustur(10 * DK, 10 * DK)).toEqual([]);
    expect(ilerlemeBolumleriOlustur(10 * DK, 5 * DK)).toEqual([]);
    expect(ilerlemeBolumleriOlustur(0, 20_000)).toEqual([]); // < 1 dk yuvarlanır → 0
    expect(ilerlemeBolumleriOlustur(Number.NaN, 5 * DK)).toEqual([]);
  });

  test('sınırsız tek bölüm', () => {
    expect(ilerlemeBolumleriOlustur(0, 45 * DK)).toEqual([{ uzunlukDk: 45, vurgulu: false }]);
  });

  test('aralık dışı ve yinelenen sınırlar atılır, sıfır uzunluk oluşmaz', () => {
    expect(
      ilerlemeBolumleriOlustur(0, 60 * DK, [-5 * DK, 20 * DK, 20 * DK + 10_000, 90 * DK], 40 * DK)
    ).toEqual([
      { uzunlukDk: 20, vurgulu: false },
      { uzunlukDk: 20, vurgulu: false },
      { uzunlukDk: 20, vurgulu: true },
    ]);
  });

  test('vurgu başlangıcı aralıktan önceyse her bölüm vurgulu', () => {
    expect(ilerlemeBolumleriOlustur(10 * DK, 40 * DK, [20 * DK], 0)).toEqual([
      { uzunlukDk: 10, vurgulu: true },
      { uzunlukDk: 20, vurgulu: true },
    ]);
  });

  test('toplam uzunluk = başlangıç → hedef (dk)', () => {
    const b = ilerlemeBolumleriOlustur(0, 287 * DK + 20_000, [61 * DK + 40_000, 123 * DK], 200 * DK);
    expect(b.reduce((t, x) => t + x.uzunlukDk, 0)).toBe(287);
    expect(b.every((x) => x.uzunlukDk > 0)).toBe(true);
  });
});

describe('tema yükleri', () => {
  const t = (s: string) => new Date(s).getTime();

  test('vakit: giriş → çıkış, eşikten sonrası vurgulu, Kıldım taşır', () => {
    expect(
      vakitCanliYukuOlustur({
        girisMs: t('2026-10-13T15:30:00'),
        cikisMs: t('2026-10-13T18:00:00'),
        sayacBaslangicMs: t('2026-10-13T17:15:00'),
        tarih: '2026-10-13',
        vakit: 'ikindi',
      })
    ).toEqual({
      baslangicMs: t('2026-10-13T15:30:00'),
      bolumler: [
        { uzunlukDk: 105, vurgulu: false },
        { uzunlukDk: 45, vurgulu: true },
      ],
      kildim: { tarih: '2026-10-13', vakit: 'ikindi' },
    });
  });

  test('vakit: eşik girişten önceyse (kısa pencere) tüm pencere vurgulu', () => {
    const y = vakitCanliYukuOlustur({
      girisMs: t('2026-10-13T18:00:00'),
      cikisMs: t('2026-10-13T19:30:00'),
      sayacBaslangicMs: t('2026-10-13T17:00:00'),
      tarih: '2026-10-13',
      vakit: 'aksam',
    });
    expect(y.bolumler).toEqual([{ uzunlukDk: 90, vurgulu: true }]);
  });

  test('iftar: imsak → öğle → ikindi → akşam, son bölüm vurgulu, Kıldım YOK', () => {
    const y = iftarCanliYukuOlustur({
      imsakMs: t('2026-03-01T05:30:00'),
      ogleMs: t('2026-03-01T13:10:00'),
      ikindiMs: t('2026-03-01T16:20:00'),
      aksamMs: t('2026-03-01T18:55:00'),
    });
    expect(y.kildim).toBeUndefined();
    expect(y.bolumler).toEqual([
      { uzunlukDk: 460, vurgulu: false },
      { uzunlukDk: 190, vurgulu: false },
      { uzunlukDk: 155, vurgulu: true },
    ]);
  });

  test('sahur: yatsı → imsak, son 60 dk vurgulu', () => {
    const y = sahurCanliYukuOlustur({ yatsiMs: t('2026-03-01T20:30:00'), imsakMs: t('2026-03-02T05:28:00') });
    expect(y.kildim).toBeUndefined();
    expect(y.bolumler).toEqual([
      { uzunlukDk: 478, vurgulu: false },
      { uzunlukDk: 60, vurgulu: true },
    ]);
  });
});
