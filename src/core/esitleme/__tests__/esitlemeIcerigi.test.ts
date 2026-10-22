/**
 * Cihazlar arası eşitleme (issue #288) — içerik azaltma, normalize ve özet.
 */
import { YedekPayload } from '../../types/YedeklemeTipleri';
import {
  esitlemeIcerigineIndir,
  icerikNormalizeEt,
  icerikOzeti,
  kanonikJson,
} from '../esitlemeIcerigi';

const hareket = (id: string) => ({
  id,
  zaman: '2026-10-01T08:00:00.000Z',
  cihaz: 'abc',
  kaynak: 'manuel',
  vakit: 'sabah',
  adet: 1,
});

const payload = (ek: Partial<YedekPayload> = {}): YedekPayload => ({
  namazGunleri: { '2026-10-01': { Sabah: true, Öğle: false } },
  kilinanVakitler: { '2026-10-01': ['imsak'] },
  seri: { mevcutSeri: 3, enUzunSeri: 9 },
  rozetler: [{ id: 'ilk', tarih: 'x' }],
  seviye: { seviye: 4 },
  bonusPuan: 20,
  istatistik: { toplamKilinan: 50, mukemmelGun: 4, toparlanma: 1 },
  kaza: { toplamTamamlanan: 7 },
  kazaTempo: { '2026-10-01': 2 },
  ayarlar: { konum: { koordinatlar: { lat: 41, lng: 29 } } },
  ...ek,
});

describe('esitlemeIcerigineIndir (veri azaltma)', () => {
  it('ayarları (konum dahil), seviyeyi, istatistiği ve false işaretleri buluta göndermez', () => {
    const indirgenmis = esitlemeIcerigineIndir(payload());
    expect(indirgenmis.ayarlar).toEqual({});
    expect(indirgenmis.seviye).toBeNull();
    expect(indirgenmis.istatistik).toEqual({ toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 });
    expect(indirgenmis.namazGunleri).toEqual({ '2026-10-01': { Sabah: true } });
    expect(JSON.stringify(indirgenmis)).not.toContain('lat');
  });

  it('eski sürümlü cihazlar için kaza anlık görüntüsü hareketlerin YANINDA gider', () => {
    const indirgenmis = esitlemeIcerigineIndir(payload({ kazaHareketleri: [hareket('k1')] }));
    expect(indirgenmis.kaza).toEqual({ toplamTamamlanan: 7 });
    expect(indirgenmis.kazaHareketleri).toHaveLength(1);
  });

  it('hiç işaretli namazı olmayan gün atılır', () => {
    const indirgenmis = esitlemeIcerigineIndir(payload({ namazGunleri: { '2026-10-02': { Sabah: false } } }));
    expect(indirgenmis.namazGunleri).toEqual({});
  });
});

describe('icerikNormalizeEt (uzaktan gelen)', () => {
  it('nesne değilse null', () => {
    expect(icerikNormalizeEt(null)).toBeNull();
    expect(icerikNormalizeEt([1])).toBeNull();
    expect(icerikNormalizeEt('x')).toBeNull();
  });

  it('hareket alanı OLMAYAN yük (eski sürüm) ile boş dizi (yeni sürüm, boş defter) ayrışır', () => {
    expect(icerikNormalizeEt({ kaza: { toplamTamamlanan: 3 } })!.kazaHareketleri).toBeUndefined();
    expect(icerikNormalizeEt({ kazaHareketleri: [] })!.kazaHareketleri).toEqual([]);
    expect(icerikNormalizeEt({ kazaHareketleri: [42, hareket('k1')] })!.kazaHareketleri).toEqual([hareket('k1')]);
  });

  it('geçersiz tarih anahtarlarını, dizi olmayan kılınanları ve sayı olmayan tempoyu atar', () => {
    const sonuc = icerikNormalizeEt({
      namazGunleri: { '../kotu': { Sabah: true }, '2026-10-01': { Sabah: 'evet', Öğle: true } },
      kilinanVakitler: { '2026-10-01': 'imsak', '2026-10-02': ['ogle', 3, 'ogle'] },
      rozetler: 'yok',
      bonusPuan: 'çok',
      kazaTempo: { '2026-10-01': 'iki', '2026-10-02': 1 },
    });
    expect(sonuc).toMatchObject({
      namazGunleri: { '2026-10-01': { Öğle: true } },
      kilinanVakitler: { '2026-10-02': ['ogle'] },
      rozetler: [],
      bonusPuan: 0,
      kazaTempo: { '2026-10-02': 1 },
      ayarlar: {},
    });
  });
});

describe('icerikOzeti', () => {
  it('anahtar sırası değişse de aynı özet', () => {
    const a = payload();
    const b = payload({
      kazaTempo: { '2026-10-01': 2 },
      namazGunleri: { '2026-10-01': { Öğle: false, Sabah: true } },
    });
    expect(icerikOzeti(a)).toBe(icerikOzeti(b));
  });

  it('cihaza özgü alanlar (ayar, seviye, güncel seri, rozet tarihi) özeti DEĞİŞTİRMEZ — ping-pong olmasın', () => {
    const a = payload();
    const b = payload({
      ayarlar: {},
      seviye: { seviye: 9 },
      seri: { mevcutSeri: 0, enUzunSeri: 9 },
      rozetler: [{ id: 'ilk', tarih: 'baska' }],
      istatistik: { toplamKilinan: 1, mukemmelGun: 0, toparlanma: 0 },
    });
    expect(icerikOzeti(a)).toBe(icerikOzeti(b));
  });

  it('yeni kılınan namaz, rekor, bonus, kaza ilerlemesi özeti DEĞİŞTİRİR', () => {
    const taban = icerikOzeti(payload());
    expect(icerikOzeti(payload({ namazGunleri: { '2026-10-01': { Sabah: true, Öğle: true } } }))).not.toBe(taban);
    expect(icerikOzeti(payload({ seri: { enUzunSeri: 10 } }))).not.toBe(taban);
    expect(icerikOzeti(payload({ bonusPuan: 21 }))).not.toBe(taban);
    // Kaza Defteri 2.0: ilerleme SAYISI değil, hareket KİMLİK kümesi.
    expect(icerikOzeti(payload({ kazaHareketleri: [hareket('k1')] }))).not.toBe(taban);
  });

  it('kaza: türetilmiş anlık görüntü özeti DEĞİŞTİRMEZ; hareket sırası/tekrarı da değiştirmez', () => {
    const a = payload({ kazaHareketleri: [hareket('k1'), hareket('k2')] });
    const b = payload({ kaza: { toplamTamamlanan: 99 }, kazaHareketleri: [hareket('k2'), hareket('k1'), hareket('k1')] });
    expect(icerikOzeti(a)).toBe(icerikOzeti(b));
  });

  it('İLERİ UYUMLULUK: çözülemeyen (yeni sürüm) öğe korunur ve özete girer — iki cihaz buluşur', () => {
    const gelecek = { id: 'gelecek:1', zaman: '2026-10-01T00:00:00.000Z', kaynak: 'yeniTur', x: 1 };
    const yerel = payload({ kazaHareketleri: [hareket('k1'), gelecek] });
    const indirgenmis = esitlemeIcerigineIndir(yerel);
    expect(indirgenmis.kazaHareketleri).toEqual(expect.arrayContaining([gelecek]));
    // Uzaktan aynısı gelir (normalize) → aynı özet; öğeyi atan cihazın özeti farklı olurdu.
    const uzak = icerikNormalizeEt(JSON.parse(JSON.stringify(indirgenmis)))!;
    expect(icerikOzeti(uzak)).toBe(icerikOzeti(yerel));
    expect(icerikOzeti(payload({ kazaHareketleri: [hareket('k1')] }))).not.toBe(icerikOzeti(yerel));
  });

  it('kanonikJson iç içe anahtarları sıralar, undefined alanı atar', () => {
    expect(kanonikJson({ b: 1, a: { d: 2, c: undefined, b: [3, { z: 1, y: 2 }] } })).toBe(
      '{"a":{"b":[3,{"y":2,"z":1}],"d":2},"b":1}'
    );
  });
});

describe('cihaz olay günlüğü (özet)', () => {
  const olay = (cihaz: string, seq: number) => ({
    id: `${cihaz}:${seq}`,
    cihaz,
    seq,
    hlc: `${String(1000 + seq).padStart(15, '0')}-0000-${cihaz}`,
    tur: 'kildim',
    tarih: '2026-10-21',
    vakit: 'ogle',
  });
  const A = 'aaaaaaaaaaaaaaaa';
  const B = 'bbbbbbbbbbbbbbbb';

  it('NÖBETÇİ: alan yoksa, boşsa ya da yalnız bozuk öğe taşıyorsa özet DEĞİŞMEZ (eski cihazlarla ping-pong yok)', () => {
    const taban = icerikOzeti(payload());
    expect(icerikOzeti(payload({ cihazOlaylari: [] }))).toBe(taban);
    expect(icerikOzeti(payload({ cihazOlaylari: [{ id: 'bozuk' }] }))).toBe(taban);
    expect(esitlemeIcerigineIndir(payload()).cihazOlaylari).toBeUndefined();
  });

  it('kimlik kümesi yakınsar: sıra ve tekrar fark etmez; yeni olay özeti değiştirir', () => {
    const a = payload({ cihazOlaylari: [olay(A, 1), olay(B, 1)] });
    const b = payload({ cihazOlaylari: [olay(B, 1), olay(A, 1), olay(A, 1)] });
    expect(icerikOzeti(a)).toBe(icerikOzeti(b));
    expect(icerikOzeti(payload({ cihazOlaylari: [olay(A, 1), olay(B, 1), olay(A, 2)] }))).not.toBe(icerikOzeti(a));
  });

  it('normalize kurcalanmış olayları atar', () => {
    const n = icerikNormalizeEt({ ...payload(), cihazOlaylari: [olay(A, 1), { ...olay(A, 2), id: 'x' }] });
    expect((n?.cihazOlaylari ?? []).map((o) => (o as { id: string }).id)).toEqual([`${A}:1`]);
  });
});
