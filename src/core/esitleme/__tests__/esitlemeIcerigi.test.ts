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
    expect(icerikOzeti(payload({ kaza: { toplamTamamlanan: 8 } }))).not.toBe(taban);
  });

  it('kanonikJson iç içe anahtarları sıralar, undefined alanı atar', () => {
    expect(kanonikJson({ b: 1, a: { d: 2, c: undefined, b: [3, { z: 1, y: 2 }] } })).toBe(
      '{"a":{"b":[3,{"y":2,"z":1}],"d":2},"b":1}'
    );
  });
});
