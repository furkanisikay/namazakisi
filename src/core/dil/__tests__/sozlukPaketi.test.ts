/**
 * Nöbetçi: sıkıştırılmış sözlük paketleri (`core/dil/paket/`) kaynak sözlüklerle birebir aynı
 * ve diller arası dizin kaynaktan yeniden kurulunca aynı çıkar. Düşerse sözlük değişmiş ama
 * paket yenilenmemiştir: `npm run sozluk:paketle` koşun.
 */
import { strFromU8, unzlibSync } from 'fflate';
import { base64Coz } from '../base64';
import { DILLER, type DilKodu } from '../diller';
import { dillerArasiDizinKur } from '../dillerArasiDizin';
import { dillerArasiPaketi, SOZLUK_PAKETLERI } from '../paket';
import { acikSozlukKodlari, aktifDiliKur, aktifDilSifirla, metin, sozluk } from '../aktifDil';
import type { Sozluk } from '../sozluk/tr';

const YENILE = 'paket eski: `npm run sozluk:paketle` koşun';
const ac = (paket: string): unknown => JSON.parse(strFromU8(unzlibSync(base64Coz(paket))));
const kaynak = (kod: DilKodu): Sozluk => (require(`../sozluk/${kod}`) as Record<string, Sozluk>)[kod];

describe('sözlük paketleri', () => {
  const paketli = DILLER.map((d) => d.kod).filter((k) => k !== 'tr');

  it('Türkçe dışındaki her dilin paketi var, fazlası yok', () => {
    expect(Object.keys(SOZLUK_PAKETLERI).sort()).toEqual([...paketli].sort());
  });

  it.each(paketli)('%s paketi kaynak sözlükle birebir aynı', (kod) => {
    const acilan = ac(SOZLUK_PAKETLERI[kod as Exclude<DilKodu, 'tr'>]());
    // JSON gidiş-dönüşü kaynakta fonksiyon/undefined olmadığını da doğrular.
    if (JSON.stringify(acilan) !== JSON.stringify(kaynak(kod))) throw new Error(`${kod}: ${YENILE}`);
  });

  it('diller arası dizin kaynaktan yeniden kurulunca aynı', () => {
    const beklenen = dillerArasiDizinKur(kaynak);
    const acilan = ac(dillerArasiPaketi());
    if (JSON.stringify(acilan) !== JSON.stringify(beklenen)) throw new Error(YENILE);
    expect(acilan).toEqual(beklenen);
  });

  it('base64 çözücü Node ile aynı baytları verir (dolgu durumları)', () => {
    for (const s of ['', 'a', 'ab', 'abc', 'abcd', 'Allah kabul etsin ߊߟߊ߫']) {
      const b64 = Buffer.from(s, 'utf8').toString('base64');
      expect(Buffer.from(base64Coz(b64)).toString('utf8')).toBe(s);
    }
  });
});

describe('tembel yükleme', () => {
  afterEach(() => aktifDilSifirla());

  it('Türkçe açılışta öteki diller açılmaz; seçilen dil ilk istendiğinde açılır', () => {
    jest.isolateModules(() => {
      const ad = require('../aktifDil') as typeof import('../aktifDil');
      ad.metin();
      expect(ad.acikSozlukKodlari()).toEqual(['tr']);
      ad.aktifDiliKur('nqo');
      ad.metin();
      expect([...ad.acikSozlukKodlari()].sort()).toEqual(['nqo', 'tr']);
    });
  });

  it('paketten açılan sözlük etkin dil olarak doğru metni verir', () => {
    aktifDiliKur('lt');
    expect(metin().ortak).toEqual(kaynak('lt').ortak);
    expect(sozluk('ka').vakit.adlar).toEqual(kaynak('ka').vakit.adlar);
    expect(acikSozlukKodlari()).toEqual(expect.arrayContaining(['tr', 'lt', 'ka']));
  });
});
