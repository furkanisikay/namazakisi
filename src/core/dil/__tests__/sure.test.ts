/**
 * Sayı + birim ve ardışık parçalar arasındaki boşluk SÖZLÜKTEN gelir (`sure.birimli`,
 * `sure.parcali`). Nöbetçi: boşluklu dillerin çıktısı kalıplar gelmeden önceki sabit
 * boşluklu biçimle BİREBİR aynı; boşluksuz dil (Çince) boşluk yazmaz.
 */
import { aktifDiliKur, aktifDilSifirla, sayili, sozluk } from '../aktifDil';
import { DILLER, type DilKodu } from '../diller';
import { cogul } from '../tipler';
import { birimAyiraci, birimli, dakikaKalibinaUydur, dakikaKisa, dakikaUzun, parcaAyiraci, parcali } from '../sure';
import { kalanSureParcalari, kalanSureSesli } from '../../utils/kalanSureParcalari';

afterEach(() => aktifDilSifirla());

/**
 * En az bir ayıracı boşluksuz diller: Çince ikisi de bitişik, Korece yalnız sayı–birim
 * bitişik ("5분"), parçalar boşluklu ("1시간 5분").
 */
const BITISIK: readonly DilKodu[] = ['zh', 'ko'];
const BOSLUKLU = DILLER.map((d) => d.kod).filter((k) => !BITISIK.includes(k));

/** Kalıplar gelmeden ÖNCEKİ çekirdek (sabit boşluk) — yalnız karşılaştırma için. */
function eskiDakikaKisa(dk: number, kod: DilKodu): string {
  const k = sozluk(kod).sure.kisa;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return `${d} ${k.dk}`;
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? `${sa} ${k.sa}` : `${sa} ${k.sa} ${kalan} ${k.dk}`;
}
function eskiDakikaUzun(dk: number, kod: DilKodu): string {
  const s = sozluk(kod).sure;
  const d = Math.max(0, Math.floor(dk));
  if (d < 60) return sayili(s.dakika, d, {}, kod);
  const sa = Math.floor(d / 60);
  const kalan = d % 60;
  return kalan === 0 ? sayili(s.saat, sa, {}, kod) : `${sayili(s.saat, sa, {}, kod)} ${sayili(s.dakika, kalan, {}, kod)}`;
}

const DAKIKALAR = [0, 1, 2, 5, 11, 21, 42, 59, 60, 61, 65, 119, 120, 125, 600, 1439];
type Tur = 'saat' | 'dakika' | 'saniye';
const SAYACLAR: readonly [string, readonly [Tur, number][]][] = [
  ['01:09:09', [['saat', 1], ['dakika', 9]]],
  ['10:00:59', [['saat', 10], ['dakika', 0]]],
  ['00:09:05', [['dakika', 9], ['saniye', 5]]],
  ['00:01:01', [['dakika', 1], ['saniye', 1]]],
  ['00:00:42', [['saniye', 42]]],
  ['00:00:00', [['saniye', 0]]],
];

describe.each(BOSLUKLU)('%s: çıktı eski sabit boşluklu biçimle birebir aynı', (kod) => {
  it('dakikaKisa ve dakikaUzun', () => {
    for (const dk of DAKIKALAR) {
      expect([dk, dakikaKisa(dk, kod)]).toEqual([dk, eskiDakikaKisa(dk, kod)]);
      expect([dk, dakikaUzun(dk, kod)]).toEqual([dk, eskiDakikaUzun(dk, kod)]);
    }
  });

  it('sayaç parçaları ve sesli metin; ayıraçlar tek boşluk', () => {
    aktifDiliKur(kod);
    const s = sozluk(kod).sure;
    for (const [sayac, parcalar] of SAYACLAR) {
      const eski = parcalar.map(([tur, n]) => sayili(s[tur], n, {}, kod)).join(' ');
      expect([sayac, kalanSureSesli(sayac)]).toEqual([sayac, eski]);
    }
    expect(kalanSureSesli('--:--')).toBe('--:--');
    expect(kalanSureParcalari('00:09:05')).toEqual([{ sayi: '9', birim: s.kisa.dk }, { sayi: '05', birim: s.kisa.sn }]);
    expect(birimAyiraci(kod)).toBe(' ');
    expect(parcaAyiraci(kod)).toBe(' ');
    expect(birimli('+3', s.kisa.dk, kod)).toBe(`+3 ${s.kisa.dk}`);
  });
});

describe('boşluksuz dil (Çince)', () => {
  it('sayı ile birim ve parçalar arasında boşluk yok', () => {
    const k = sozluk('zh').sure.kisa;
    expect(birimAyiraci('zh')).toBe('');
    expect(parcaAyiraci('zh')).toBe('');
    expect(dakikaKisa(5, 'zh')).toBe(`5${k.dk}`);
    expect(dakikaKisa(65, 'zh')).toBe(`1${k.sa}5${k.dk}`);
    expect(dakikaKisa(120, 'zh')).toBe(`2${k.sa}`);
    expect(parcali(['1小时', '5分钟'], 'zh')).toBe('1小时5分钟');
    expect(birimli(5, '分钟', 'zh')).toBe('5分钟');
  });

  it('sesli sayaç metni parçaları boşluksuz birleştirir', () => {
    aktifDiliKur('zh');
    const s = sozluk('zh').sure;
    expect(kalanSureSesli('01:09:09')).toBe(`${sayili(s.saat, 1, {}, 'zh')}${sayili(s.dakika, 9, {}, 'zh')}`);
  });
});

describe('Korece: sayı–birim bitişik, parçalar boşluklu', () => {
  it('"5분", "1시간 5분"', () => {
    const k = sozluk('ko').sure.kisa;
    expect(birimAyiraci('ko')).toBe('');
    expect(parcaAyiraci('ko')).toBe(' ');
    expect(dakikaKisa(5, 'ko')).toBe(`5${k.dk}`);
    expect(dakikaKisa(65, 'ko')).toBe(`1${k.sa} 5${k.dk}`);
    expect(dakikaKisa(120, 'ko')).toBe(`2${k.sa}`);
    expect(dakikaUzun(65, 'ko')).toBe('1시간 5분');
    expect(birimli(5, '분', 'ko')).toBe('5분');
  });

  it('sesli sayaç metni parçaları boşlukla birleştirir', () => {
    aktifDiliKur('ko');
    expect(kalanSureSesli('01:09:09')).toBe('1시간 9분');
  });
});

it('kalıp biçimi: sayı önce, aralarında yalnız boşluk (native tablolar yalnız ayıraç taşır)', () => {
  for (const { kod } of DILLER) {
    const s = sozluk(kod).sure;
    expect([kod, /^\{n\}\s*\{birim\}$/.test(s.birimli)]).toEqual([kod, true]);
    expect([kod, /^\{once\}\s*\{sonra\}$/.test(s.parcali)]).toEqual([kod, true]);
  }
});

describe('dakikaUyumu: boşluksuz dakika kalıbı', () => {
  // Henüz çevrilmemiş boşluksuz ve çoğullu bir dil sınanır: kalıp `{n}` ile bitişik.
  const bitisik = cogul({ one: '{n}minute', other: '{n}minutes' });

  it('sayıdan sonra boşluk aranmaz, doğru biçime çekilir', () => {
    expect(dakikaKalibinaUydur('kalan 1minutes.', 1, bitisik, 'en')).toBe('kalan 1minute.');
    expect(dakikaKalibinaUydur('kalan 5minute', 5, bitisik, 'en')).toBe('kalan 5minutes');
  });

  it('boşluklu dilde bitişik yazım eskisi gibi dokunulmaz', () => {
    const bosluklu = cogul({ one: '{n} minute', other: '{n} minutes' });
    expect(dakikaKalibinaUydur('kalan 1minutes.', 1, bosluklu, 'en')).toBe('kalan 1minutes.');
    expect(dakikaKalibinaUydur('kalan 1 minutes.', 1, bosluklu, 'en')).toBe('kalan 1 minute.');
  });
});
