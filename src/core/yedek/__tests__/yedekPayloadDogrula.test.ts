/**
 * Yedek içeriği daraltıcısı — NÖBETÇİ (denetim B-2 / B-3).
 *
 * Yerel yedek zarfının anahtarı sır olmadığı için herkes "geçerli" zarf üretebilir;
 * diske giden değerlerin tek savunması bu daraltıcıdır. İki yönü de ölçer:
 * (1) uygulamanın kendi ürettiği içerik DEĞİŞMEDEN geçer, (2) kötü amaçlı her girdi
 * atılmış ya da güvenli varsayılana inmiş çıkar.
 */

import {
  AZAMI_GUN_SAYISI,
  YEDEK_PAYLOAD_ALANLARI,
  rozetleriTekillestir,
  yedekPayloadDogrula,
} from '../yedekPayloadDogrula';
import type { YedekPayload } from '../../types/YedeklemeTipleri';
import type { KullaniciRozeti, SeriDurumu, SeviyeDurumu } from '../../types/SeriTipleri';
import { ROZET_TANIMLARI } from '../../types/SeriTipleri';
import { NAMAZ_ISIMLERI } from '../../constants/UygulamaSabitleri';
import { hareketNormalize } from '../../kaza/kazaHareketi';
import { eskiAnlikGoruntuUret } from '../../kaza/kazaDefteriHesabi';
import type { KazaDurumu } from '../../types/KazaTipleri';

const AYAR_ALANLARI = ['muhafiz', 'konum', 'dil', 'mezhep'] as const;

const dogrula = (ham: unknown): YedekPayload => {
  const sonuc = yedekPayloadDogrula(ham, AYAR_ALANLARI);
  if (!sonuc) throw new Error('daraltıcı null döndü');
  return sonuc;
};

// ─── Gerçekçi içerik (uygulamanın yazdığı şekiller) ─────────────────────────

const seri: SeriDurumu = {
  mevcutSeri: 12,
  enUzunSeri: 45,
  sonTamGun: '2026-06-13',
  seriBaslangici: '2026-06-02',
  toparlanmaDurumu: { tamamlananGun: 1, baslangicTarihi: '2026-06-01', hedefGunSayisi: 2, oncekiSeri: 30 },
  dondurulduMu: false,
  dondurulmaTarihi: null,
  sonGuncelleme: '2026-06-14T05:12:00.000Z',
  bugunOncesi: {
    tarih: '2026-06-14',
    mevcutSeri: 11,
    enUzunSeri: 45,
    sonTamGun: '2026-06-12',
    seriBaslangici: '2026-06-02',
    toparlanmaDurumu: null,
    dondurulduMu: false,
    dondurulmaTarihi: null,
  },
  bugunKazanilanPuan: 25,
};

const rozetler: KullaniciRozeti[] = ROZET_TANIMLARI.map((tanim, sira) => ({
  rozetId: tanim.id,
  kazanildiMi: sira < 2,
  kazanilmaTarihi: sira < 2 ? `2026-05-0${sira + 1}T10:00:00.000Z` : null,
}));

const seviye: SeviyeDurumu = {
  mevcutSeviye: 4,
  toplamPuan: 1830,
  mevcutSeviyePuani: 330,
  sonrakiSeviyeKalanPuan: 170,
  rank: 'Rank',
  rankIkonu: '⭐',
};

const kazaGorunumu: KazaDurumu = {
  namazlar: [
    { namazAdi: 'Sabah', kalanBorc: 7, tamamlanan: 3, toplamBorc: 10 },
    { namazAdi: 'Öğle', kalanBorc: 0, tamamlanan: 0, toplamBorc: 0 },
    { namazAdi: 'İkindi', kalanBorc: 4, tamamlanan: 0, toplamBorc: 4 },
    { namazAdi: 'Akşam', kalanBorc: 0, tamamlanan: 0, toplamBorc: 0 },
    { namazAdi: 'Yatsı', kalanBorc: 1, tamamlanan: 9, toplamBorc: 10 },
    { namazAdi: 'Vitir', kalanBorc: 0, tamamlanan: 0, toplamBorc: 0 },
  ],
  toplamKalan: 12,
  toplamTamamlanan: 12,
  gunlukHedef: 3,
  gunlukTamamlanan: 1,
  gunlukHedefTarihi: '2026-06-14',
  toplamGizleMi: true,
  guncellemeTarihi: '2026-06-14T08:00:00.000Z',
};

const hareketler = [
  {
    id: 'taban:1',
    zaman: '2026-06-01T08:00:00.000Z',
    cihaz: 'abc123',
    kaynak: 'taban',
    taban: { sabah: 10, ogle: 0, ikindi: 4, aksam: 0, yatsi: 10, vitir: 0 },
    kapsamBitis: '2026-05-31',
  },
  { id: 'kilindi:1', zaman: '2026-06-10T08:00:00.000Z', cihaz: 'abc123', kaynak: 'kilindi', vakit: 'sabah', adet: 3 },
  { id: 'bildirim:1', zaman: '2026-06-11T08:00:00.000Z', cihaz: 'abc123', kaynak: 'bildirim', vakit: 'ogle', adet: 1, referans: '2026-06-10_ogle' },
  { id: 'gun:1', zaman: '2026-06-12T08:00:00.000Z', cihaz: 'abc123', kaynak: 'gunKarari', referans: '2026-06-09', karar: 'yoksay' },
].map((h) => {
  const normalize = hareketNormalize(h);
  if (!normalize) throw new Error('fikstür hareketi geçersiz');
  return normalize;
});

/** Bu sürümün çözemediği ama yapısal olarak geçerli (yeni sürüm) hareket. */
const bilinmeyenHareket = { id: 'gelecek:1', zaman: '2026-06-13T09:00:00.000Z', kaynak: 'yeniTur', ek: { ic: [1, 2] } };

const gercekciPayload = (): YedekPayload => ({
  namazGunleri: {
    '2026-06-13': { Sabah: true, 'Öğle': true, 'İkindi': true, 'Akşam': true, 'Yatsı': true },
    '2026-06-14': { Sabah: true, 'Öğle': false },
    '2026-06-15': {},
  },
  kilinanVakitler: { '2026-06-13': ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'], '2026-06-14': ['imsak'], '2026-06-15': [] },
  seri,
  rozetler,
  seviye,
  bonusPuan: 240,
  istatistik: { toplamKilinan: 1250, mukemmelGun: 42, toparlanma: 3 },
  kaza: eskiAnlikGoruntuUret(kazaGorunumu),
  kazaTempo: { '2026-06-10': 3, '2026-06-11': 0 },
  kazaHareketleri: [...hareketler, bilinmeyenHareket],
  ayarlar: { muhafiz: { aktif: true, sertlik: 2 }, konum: { sehir: 'İstanbul' }, dil: null, mezhep: { mezhep: 'hanefi' } },
});

/** Dosyadan gelen hâl: JSON'dan geçmiş (undefined'sız, prototipsiz düz veri). */
const dosyadan = <T,>(deger: T): T => JSON.parse(JSON.stringify(deger)) as T;

describe('yedekPayloadDogrula — geçerli içerik DEĞİŞMEZ', () => {
  it('uygulamanın ürettiği dolu içerik daraltıcıdan derin eşit çıkar', () => {
    const girdi = dosyadan(gercekciPayload());
    expect(dogrula(girdi)).toEqual(girdi);
    // JSON'a geri yazıldığında da aynı (eklenen `undefined`/fazla alan yok).
    expect(JSON.parse(JSON.stringify(dogrula(girdi)))).toEqual(girdi);
  });

  it('boş cihazın içeriği (seri/seviye/kaza yok) değişmez', () => {
    const girdi = dosyadan<YedekPayload>({
      namazGunleri: {},
      kilinanVakitler: {},
      seri: null,
      rozetler: [],
      seviye: null,
      bonusPuan: 0,
      istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
      kaza: null,
      kazaTempo: {},
      kazaHareketleri: [],
      ayarlar: { muhafiz: null, konum: null, dil: null, mezhep: null },
    });
    expect(dogrula(girdi)).toEqual(girdi);
  });

  it('eski sürümün içeriği: hareket alanı YOKSA yok kalır, ham KazaDurumu ve dondurma alansız seri değişmez', () => {
    const eskiSeri = { mevcutSeri: 3, enUzunSeri: 9, sonTamGun: '2025-01-02', seriBaslangici: '2024-12-31', toparlanmaDurumu: null, sonGuncelleme: '2025-01-02T20:00:00.000Z' };
    const girdi = dosyadan({ ...gercekciPayload(), seri: eskiSeri, kaza: kazaGorunumu, kazaHareketleri: undefined });
    const sonuc = dogrula(girdi);
    expect(sonuc).toEqual(girdi);
    expect('kazaHareketleri' in sonuc).toBe(false);
    expect(sonuc.seri).not.toHaveProperty('dondurulduMu');
    // Ham (türetilmemiş) görüntüye `defterOzeti` EKLENMEZ: varlığı "türetilmiş" demektir.
    expect(sonuc.kaza).not.toHaveProperty('defterOzeti');
  });

  it('daraltılmış içerik yeniden daraltılınca aynı kalır (tekrar uygulanabilir)', () => {
    const bir = dogrula(dosyadan(gercekciPayload()));
    expect(dogrula(dosyadan(bir))).toEqual(bir);
  });

  it('çıktıda yalnız bilinen YedekPayload alanları bulunur; yabancı üst alan atılır', () => {
    const sonuc = dogrula({ ...dosyadan(gercekciPayload()), yabanci: { x: 1 }, namaz_gun_x: true });
    for (const alan of Object.keys(sonuc)) expect(YEDEK_PAYLOAD_ALANLARI).toContain(alan);
    expect(sonuc).not.toHaveProperty('yabanci');
  });
});

describe('yedekPayloadDogrula — üst düzey', () => {
  it.each([[null], [undefined], [42], ['metin'], [true], [[]], [[{ namazGunleri: {} }]]])('düz nesne olmayan değer (%p) → null', (ham) => {
    expect(yedekPayloadDogrula(ham, AYAR_ALANLARI)).toBeNull();
  });

  it('boş nesne güvenli varsayılanlarla dolar', () => {
    expect(dogrula({})).toEqual({
      namazGunleri: {},
      kilinanVakitler: {},
      seri: null,
      rozetler: [],
      seviye: null,
      bonusPuan: 0,
      istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
      kaza: null,
      kazaTempo: {},
      ayarlar: {},
    });
  });

  it('her alan yanlış kapta gelse de (dizi yerine nesne, nesne yerine dizi/dize) fırlatmaz ve varsayılana iner', () => {
    const sonuc = dogrula({
      namazGunleri: [{ Sabah: true }],
      kilinanVakitler: 'imsak',
      seri: [1, 2],
      rozetler: { 0: { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: null } },
      seviye: 'usta',
      bonusPuan: { deger: 5 },
      istatistik: [1, 2, 3],
      kaza: ['Sabah'],
      kazaTempo: [3],
      kazaHareketleri: { id: 'x' },
      cihazOlaylari: { id: 'x' },
      ayarlar: ['muhafiz'],
    });
    expect(sonuc).toEqual(dogrula({}));
    expect('kazaHareketleri' in sonuc).toBe(false);
    expect('cihazOlaylari' in sonuc).toBe(false);
  });
});

describe('yedekPayloadDogrula — namaz günleri ve kılınan vakitler', () => {
  const COP_ANAHTARLAR = ['../x', '', 'g1', '2026-6-1', '2026-06-14 ', ' 2026-06-14', '2026-13-01', '2026-00-10', '2026-06-32', '2026-06-14\n', '__proto__', 'constructor', 'toString', '2026-06-14/../../x'];

  it('çöp tarih anahtarları atılır (depolama anahtarına serbest metin giremez)', () => {
    const gunler: Record<string, unknown> = { '2026-06-14': { Sabah: true } };
    const kilinan: Record<string, unknown> = { '2026-06-14': ['imsak'] };
    const tempo: Record<string, unknown> = { '2026-06-14': 2 };
    for (const anahtar of COP_ANAHTARLAR) {
      gunler[anahtar] = { Sabah: true };
      kilinan[anahtar] = ['imsak'];
      tempo[anahtar] = 5;
    }
    const sonuc = dogrula({ namazGunleri: gunler, kilinanVakitler: kilinan, kazaTempo: tempo });
    expect(Object.keys(sonuc.namazGunleri)).toEqual(['2026-06-14']);
    expect(Object.keys(sonuc.kilinanVakitler)).toEqual(['2026-06-14']);
    expect(Object.keys(sonuc.kazaTempo)).toEqual(['2026-06-14']);
  });

  it('__proto__ / constructor anahtarı prototipi KİRLETMEZ (dosyadan gelen hâliyle)', () => {
    const ham = JSON.parse(
      '{"__proto__":{"kirli":1},"constructor":{"prototype":{"kirli":1}},' +
        '"namazGunleri":{"__proto__":{"Sabah":true},"2026-06-14":{"__proto__":{"kirli":true},"constructor":true,"Sabah":true}},' +
        '"kilinanVakitler":{"__proto__":["imsak"]},"kazaTempo":{"__proto__":9},' +
        '"ayarlar":{"__proto__":{"kirli":1},"constructor":{"kirli":1},"muhafiz":{"aktif":true}}}'
    );
    const sonuc = dogrula(ham);
    expect(({} as Record<string, unknown>).kirli).toBeUndefined();
    expect(Object.getPrototypeOf(sonuc)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(sonuc.namazGunleri)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(sonuc.namazGunleri['2026-06-14'])).toBe(Object.prototype);
    expect(Object.getPrototypeOf(sonuc.ayarlar)).toBe(Object.prototype);
    expect(sonuc.namazGunleri).toEqual({ '2026-06-14': { Sabah: true } });
    expect(sonuc.kilinanVakitler).toEqual({});
    expect(sonuc.kazaTempo).toEqual({});
    expect(Object.keys(sonuc.ayarlar)).toEqual(['muhafiz']);
  });

  it('gün haritasında yalnız gerçek namaz adları ve boolean değer kalır', () => {
    const sonuc = dogrula({
      namazGunleri: {
        '2026-06-14': { Sabah: true, 'Öğle': 'evet', 'İkindi': 1, 'Akşam': null, 'Yatsı': false, sabah: true, Teheccud: true, '': true },
        '2026-06-15': 'dolu',
        '2026-06-16': ['Sabah'],
        '2026-06-17': null,
      },
    });
    expect(sonuc.namazGunleri).toEqual({ '2026-06-14': { Sabah: true, 'Yatsı': false } });
    for (const ad of NAMAZ_ISIMLERI) {
      expect(dogrula({ namazGunleri: { '2026-06-14': { [ad]: true } } }).namazGunleri['2026-06-14']).toEqual({ [ad]: true });
    }
  });

  it('kılınan vakitlerde yalnız gerçek vakit kodları kalır, tekrar atılır, dizi olmayan gün atılır', () => {
    const sonuc = dogrula({
      kilinanVakitler: {
        '2026-06-14': ['imsak', 'imsak', 'OGLE', 'ogle', 7, null, { vakit: 'aksam' }, 'toString', '__proto__', 'yatsi'],
        '2026-06-15': { 0: 'imsak' },
        '2026-06-16': 'imsak',
      },
    });
    expect(sonuc.kilinanVakitler).toEqual({ '2026-06-14': ['imsak', 'ogle', 'yatsi'] });
  });

  it('100 bin çöp anahtarlı gün haritası tümüyle atılır', () => {
    const gunler: Record<string, unknown> = {};
    for (let i = 0; i < 100_000; i++) gunler[`cop-${i}`] = { Sabah: true };
    const sonuc = dogrula({ namazGunleri: gunler, kilinanVakitler: gunler, kazaTempo: gunler });
    expect(sonuc.namazGunleri).toEqual({});
    expect(sonuc.kilinanVakitler).toEqual({});
    expect(sonuc.kazaTempo).toEqual({});
  });

  it('100 bin GEÇERLİ tarihli gün haritası sınırlanır ve en yeni günler kalır', () => {
    const gunler: Record<string, unknown> = {};
    const kilinan: Record<string, unknown> = {};
    const gun = new Date(Date.UTC(1900, 0, 1));
    let sonTarih = '';
    for (let i = 0; i < 100_000; i++) {
      sonTarih = gun.toISOString().slice(0, 10);
      gunler[sonTarih] = { Sabah: true };
      kilinan[sonTarih] = ['imsak'];
      gun.setUTCDate(gun.getUTCDate() + 1);
    }
    const sonuc = dogrula({ namazGunleri: gunler, kilinanVakitler: kilinan });
    const kalan = Object.keys(sonuc.namazGunleri);
    expect(kalan).toHaveLength(AZAMI_GUN_SAYISI);
    expect(Object.keys(sonuc.kilinanVakitler)).toHaveLength(AZAMI_GUN_SAYISI);
    expect(kalan).toContain(sonTarih);
    expect(kalan).not.toContain('1900-01-01');
  });
});

describe('yedekPayloadDogrula — sayılar', () => {
  const KOTU_SAYILAR: unknown[][] = [['abc'], ['50'], [NaN], [Infinity], [-Infinity], [-1], [-0.5], [null], [undefined], [true], [[5]], [{ deger: 5 }]];

  it.each(KOTU_SAYILAR)('bonusPuan / istatistik %p → 0', (kotu) => {
    const sonuc = dogrula({ bonusPuan: kotu, istatistik: { toplamKilinan: kotu, mukemmelGun: kotu, toparlanma: kotu } });
    expect(sonuc.bonusPuan).toBe(0);
    expect(sonuc.istatistik).toEqual({ toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 });
  });

  it('dev sayılar tavana iner, kesirli sayı tamsayıya', () => {
    const sonuc = dogrula({
      bonusPuan: 1e308,
      istatistik: { toplamKilinan: Number.MAX_VALUE, mukemmelGun: 1e15, toparlanma: 2.9 },
    });
    expect(sonuc.bonusPuan).toBe(1_000_000_000);
    expect(sonuc.istatistik.toplamKilinan).toBe(10_000_000);
    expect(sonuc.istatistik.mukemmelGun).toBe(100_000);
    expect(sonuc.istatistik.toparlanma).toBe(2);
  });

  it('daraltılmış içerikte sonlu olmayan ya da negatif sayı KALMAZ (JSON\'a `null` düşmez)', () => {
    const zehir = { a: NaN, b: Infinity, c: -5, d: 1e308 };
    const sonuc = dogrula({
      bonusPuan: Infinity,
      istatistik: zehir,
      seri: { mevcutSeri: Infinity, enUzunSeri: -3, bugunKazanilanPuan: NaN, toparlanmaDurumu: { tamamlananGun: NaN, baslangicTarihi: '2026-06-01', hedefGunSayisi: -1, oncekiSeri: 1e308 } },
      seviye: { mevcutSeviye: -4, toplamPuan: 1e308, mevcutSeviyePuani: NaN, sonrakiSeviyeKalanPuan: -Infinity },
      kaza: { namazlar: [{ namazAdi: 'Sabah', kalanBorc: Infinity, tamamlanan: -2, toplamBorc: NaN }], toplamKalan: NaN, toplamTamamlanan: 1e308, gunlukHedef: -1, gunlukTamamlanan: Infinity },
      kazaTempo: { '2026-06-10': Infinity, '2026-06-11': -1, '2026-06-12': NaN, '2026-06-13': '4', '2026-06-14': 1e308, '2026-06-15': 2 },
    });
    const sayilar: number[] = [];
    const gez = (deger: unknown): void => {
      if (typeof deger === 'number') sayilar.push(deger);
      else if (deger && typeof deger === 'object') Object.values(deger).forEach(gez);
    };
    gez({ ...sonuc, kazaHareketleri: undefined });
    expect(sayilar.length).toBeGreaterThan(10);
    for (const s of sayilar) {
      expect(Number.isFinite(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1_000_000_000);
    }
    expect(sonuc.kazaTempo).toEqual({ '2026-06-14': 100_000, '2026-06-15': 2 });
  });
});

describe('yedekPayloadDogrula — seri ve seviye', () => {
  it.each([['x'], [5], [true], [[]], [[seri]]])('nesne olmayan seri (%p) → null', (kotu) => {
    expect(dogrula({ seri: kotu }).seri).toBeNull();
  });

  it('çekirdek sayıları olmayan nesne seri sayılmaz → null', () => {
    expect(dogrula({ seri: {} }).seri).toBeNull();
    expect(dogrula({ seri: { mevcutSeri: 'çok', enUzunSeri: null, yabanci: 1 } }).seri).toBeNull();
  });

  it('seri alan alan daraltılır: yabancı alan atılır, bozuk tarih null, bozuk toparlanma null', () => {
    expect(
      dogrula({
        seri: {
          mevcutSeri: 4.7,
          enUzunSeri: 1e12,
          sonTamGun: '../../etc',
          seriBaslangici: 20260614,
          toparlanmaDurumu: { tamamlananGun: 1, baslangicTarihi: 'dün', hedefGunSayisi: 2, oncekiSeri: 5 },
          dondurulduMu: 'evet',
          dondurulmaTarihi: { $date: 1 },
          sonGuncelleme: 'şimdi',
          bugunOncesi: 'yok',
          bugunKazanilanPuan: '25',
          yabanci: [1, 2, 3],
        },
      }).seri
    ).toEqual({
      mevcutSeri: 4,
      enUzunSeri: 100_000,
      sonTamGun: null,
      seriBaslangici: null,
      toparlanmaDurumu: null,
      dondurulduMu: false,
      dondurulmaTarihi: null,
      sonGuncelleme: '1970-01-01T00:00:00.000Z',
      bugunOncesi: null,
      bugunKazanilanPuan: null,
    });
  });

  it('seviye: toplam puanı okunamayan kayıt null; okunabilen alan alan daraltılır', () => {
    expect(dogrula({ seviye: { mevcutSeviye: 3 } }).seviye).toBeNull();
    expect(dogrula({ seviye: [seviye] }).seviye).toBeNull();
    expect(
      dogrula({ seviye: { mevcutSeviye: 0, toplamPuan: 1e308, mevcutSeviyePuani: -1, sonrakiSeviyeKalanPuan: 'x', rank: 'x'.repeat(5000), rankIkonu: 7, yabanci: true } }).seviye
    ).toEqual({ mevcutSeviye: 1, toplamPuan: 1_000_000_000, mevcutSeviyePuani: 0, sonrakiSeviyeKalanPuan: 0 });
  });
});

describe('yedekPayloadDogrula — rozetler', () => {
  it('null ve biçimi tutmayan rozet öğeleri atılır', () => {
    const iyi = { rozetId: 'ilk_adim', kazanildiMi: false, kazanilmaTarihi: null };
    const sonuc = dogrula({
      rozetler: [
        iyi,
        null,
        undefined,
        'ilk_adim',
        42,
        [],
        {},
        { id: 'ilk_adim' },
        { rozetId: { x: 1 }, kazanildiMi: true, kazanilmaTarihi: null },
        { rozetId: 'efsane', kazanildiMi: 'evet', kazanilmaTarihi: null },
        { rozetId: '', kazanildiMi: true, kazanilmaTarihi: null },
        { rozetId: 'a b/../c', kazanildiMi: true, kazanilmaTarihi: null },
        { rozetId: 'x'.repeat(65), kazanildiMi: true, kazanilmaTarihi: null },
      ],
    });
    expect(sonuc.rozetler).toEqual([iyi]);
  });

  it('rozet öğesinde yabancı alan atılır, bozuk tarih null olur', () => {
    expect(
      dogrula({ rozetler: [{ rozetId: 'bin_namaz', kazanildiMi: true, kazanilmaTarihi: 12345, ek: 'x' }] }).rozetler
    ).toEqual([{ rozetId: 'bin_namaz', kazanildiMi: true, kazanilmaTarihi: null }]);
  });

  it('rozet listesi sınırlıdır (dev liste diske yazılamaz)', () => {
    const cok = Array.from({ length: 50_000 }, (_, i) => ({ rozetId: `r${i}`, kazanildiMi: true, kazanilmaTarihi: null }));
    expect(dogrula({ rozetler: cok }).rozetler).toHaveLength(500);
  });

  it('rozetleriTekillestir: aynı rozetin iki kaydında kazanılmış olan kalır, en eski tarih korunur', () => {
    expect(
      rozetleriTekillestir([
        { rozetId: 'ilk_adim', kazanildiMi: false, kazanilmaTarihi: null },
        { rozetId: 'efsane', kazanildiMi: true, kazanilmaTarihi: '2026-03-01T10:00:00.000Z' },
        { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-05-01T10:00:00.000Z' },
        { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-04-01T10:00:00.000Z' },
        { rozetId: 'efsane', kazanildiMi: false, kazanilmaTarihi: null },
        { rozetId: 'kararlilik', kazanildiMi: false, kazanilmaTarihi: null },
        { rozetId: 'kararlilik', kazanildiMi: false, kazanilmaTarihi: null },
      ])
    ).toEqual([
      { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-04-01T10:00:00.000Z' },
      { rozetId: 'efsane', kazanildiMi: true, kazanilmaTarihi: '2026-03-01T10:00:00.000Z' },
      { rozetId: 'kararlilik', kazanildiMi: false, kazanilmaTarihi: null },
    ]);
    expect(rozetleriTekillestir('yok')).toEqual([]);
  });
});

describe('yedekPayloadDogrula — kaza', () => {
  it('eski anlık görüntü alan alan daraltılır: yabancı namaz adı ve alan atılır', () => {
    expect(
      dogrula({
        kaza: {
          namazlar: [
            { namazAdi: 'Sabah', kalanBorc: 2, tamamlanan: 1, toplamBorc: 3, ek: 'x' },
            { namazAdi: 'Teravih', kalanBorc: 9, tamamlanan: 9, toplamBorc: 18 },
            { namazAdi: 'constructor', kalanBorc: 9, tamamlanan: 9, toplamBorc: 18 },
            null,
            'Sabah',
          ],
          toplamKalan: 2,
          toplamGizleMi: 'evet',
          gunlukHedefTarihi: { x: 1 },
          defterOzeti: 12,
          borclar: { x: 1 },
        },
      }).kaza
    ).toEqual({
      namazlar: [{ namazAdi: 'Sabah', kalanBorc: 2, tamamlanan: 1, toplamBorc: 3 }],
      toplamKalan: 2,
      toplamGizleMi: false,
      gunlukHedefTarihi: '',
    });
  });

  it('hareketler: tanınan normalize edilir, yeni sürümün öğesi AYNEN korunur, yapısız öğe atılır', () => {
    const sonuc = dogrula({
      kazaHareketleri: [
        { id: 'manuel:1', zaman: '2026-06-14T08:00:00.000Z', cihaz: 'abc123', kaynak: 'manuel', vakit: 'sabah', adet: 2, yabanci: 'x' },
        bilinmeyenHareket,
        null,
        'manuel:2',
        { id: 'manuel:3', zaman: 'dün', kaynak: 'manuel', vakit: 'sabah', adet: 1 },
        { id: 'manuel:4', zaman: '2026-06-14T08:00:00.000Z', kaynak: 7 },
      ],
    });
    expect(sonuc.kazaHareketleri).toEqual([
      { id: 'manuel:1', zaman: '2026-06-14T08:00:00.000Z', cihaz: 'abc123', kaynak: 'manuel', vakit: 'sabah', adet: 2 },
      bilinmeyenHareket,
    ]);
  });

  it('olay günlüğü: doğrulanamayan olaylar atılır; hiç olay kalmazsa alan yazılmaz', () => {
    const sonuc = dogrula({ cihazOlaylari: [null, { id: 'x' }, { tur: 'kildim', tarih: '2026-06-14', vakit: 'ogle' }] });
    expect('cihazOlaylari' in sonuc).toBe(false);
  });
});

describe('yedekPayloadDogrula — ayarlar', () => {
  it('yalnız beyaz listedeki alanlar kalır; değerler olduğu gibi taşınır', () => {
    const muhafiz = { aktif: true, ic: { derin: [1, 'iki', null] } };
    const sonuc = dogrula({
      ayarlar: { muhafiz, konum: null, yabanci: { x: 1 }, '@namaz_akisi/bonus_puan': 9, namaz_gun_x: {}, toString: 'x' },
    });
    expect(sonuc.ayarlar).toEqual({ muhafiz, konum: null });
  });

  it('beyaz liste boşsa (eşitleme) hiçbir ayar geçmez', () => {
    expect(yedekPayloadDogrula({ ayarlar: { muhafiz: { aktif: true } } }, [])?.ayarlar).toEqual({});
  });
});
