/**
 * YedekBirlestirmeServisi testleri (saf servis — Depolama/şifreleme mock'u YOK).
 *
 * Bu servis içe-aktarmanın beyni: mevcut veri ile gelen yedeği karşılaştırır (fark)
 * ve seçilen stratejilerle bir yazım planı (anahtar → değer) üretir. Yazımı/store
 * tazelemeyi orkestratör thunk (Task 7) yapar — burada yalnız NE yazılacağı hesaplanır.
 *
 * Sözleşme: HİÇBİR strateji yıkıcı değildir (anahtar SİLİNMEZ; mevcut-yalnız günler korunur).
 */

import {
  farkCikar,
  birlestirNamazGunleri,
  birlestirmePlaniOlustur,
} from '../YedekBirlestirmeServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { YedekPayload, KategoriSecimleri, NamazGunleri } from '../../../core/types';

const KILINAN_ONEK = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_`;

/** Boş ayarlar (hiçbir alt-ayar yok). */
const bosAyarlar = {
  muhafiz: null,
  vakitBildirim: null,
  konum: null,
  takvim: null,
  vakitSayac: null,
  sahurSayac: null,
  iftarSayac: null,
  seriAyarlari: null,
  ozelGun: null,
};

/** Test için minimal ama tam-şekilli bir payload kurucusu. */
const payloadKur = (kismi: Partial<YedekPayload>): YedekPayload => ({
  namazGunleri: {},
  kilinanVakitler: {},
  seri: null,
  rozetler: [],
  seviye: null,
  bonusPuan: 0,
  istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
  kaza: null,
  kazaTempo: {},
  ayarlar: { ...bosAyarlar },
  ...kismi,
});

/** Dört kategoriyi de aynı stratejiye ayarlar (global mod). */
const secimler = (s: KategoriSecimleri['namaz']): KategoriSecimleri => ({
  namaz: s,
  puan: s,
  kaza: s,
  ayarlar: s,
});

describe('YedekBirlestirmeServisi — birlestirNamazGunleri', () => {
  it('akilli: gün+namaz bazında union; bir tarafta true ise korunur (geri alma YOK)', () => {
    const mevcut: NamazGunleri = { g1: { Sabah: true, 'Öğle': false } };
    const gelen: NamazGunleri = { g1: { Sabah: false, 'Öğle': true } };
    expect(birlestirNamazGunleri('akilli', mevcut, gelen)).toEqual({
      g1: { Sabah: true, 'Öğle': true },
    });
  });

  it('akilli: her iki taraftaki tarihler birleşir', () => {
    const mevcut: NamazGunleri = { g1: { Sabah: true } };
    const gelen: NamazGunleri = { g2: { Yatsı: true } };
    expect(birlestirNamazGunleri('akilli', mevcut, gelen)).toEqual({
      g1: { Sabah: true },
      g2: { Yatsı: true },
    });
  });

  it('uzerineYaz: çakışan günde gelen değeri yazılır; gelen-yalnız eklenir; mevcut-yalnız korunur', () => {
    const mevcut: NamazGunleri = { g1: { Sabah: true, 'Öğle': true }, g3: { Yatsı: true } };
    const gelen: NamazGunleri = { g1: { Sabah: false }, g2: { Akşam: true } };
    expect(birlestirNamazGunleri('uzerineYaz', mevcut, gelen)).toEqual({
      g1: { Sabah: false },
      g2: { Akşam: true },
      g3: { Yatsı: true },
    });
  });

  it('eksikleriEkle: çakışan gün mevcut korunur; yalnız yeni gün eklenir', () => {
    const mevcut: NamazGunleri = { g1: { Sabah: true } };
    const gelen: NamazGunleri = { g1: { Sabah: false, 'Öğle': true }, g2: { Akşam: true } };
    expect(birlestirNamazGunleri('eksikleriEkle', mevcut, gelen)).toEqual({
      g1: { Sabah: true },
      g2: { Akşam: true },
    });
  });
});

describe('YedekBirlestirmeServisi — farkCikar', () => {
  it('gün sayıları, çakışan gün ve rozet/kaza/ayar bayraklarını doğru çıkarır', () => {
    const mevcut = payloadKur({
      namazGunleri: { g1: { Sabah: true }, g2: { Yatsı: true } },
    });
    const gelen = payloadKur({
      namazGunleri: { g2: { Yatsı: true }, g3: { Akşam: true }, g4: { Sabah: true } },
      rozetler: [{ id: 'ilk_hafta' }],
      kaza: { toplamTamamlanan: 5 },
      ayarlar: { ...bosAyarlar, konum: { sehir: 'İstanbul' } },
    });

    const fark = farkCikar(mevcut, gelen);
    expect(fark.mevcutGunSayisi).toBe(2);
    expect(fark.gelenGunSayisi).toBe(3);
    expect(fark.cakisanGunSayisi).toBe(1); // yalnız g2
    expect(fark.rozetVar).toBe(true);
    expect(fark.kazaVar).toBe(true);
    expect(fark.ayarVar).toBe(true);
  });

  it('boş gelen yedekte bayraklar false ve sayılar 0', () => {
    const fark = farkCikar(payloadKur({}), payloadKur({}));
    expect(fark).toEqual({
      gelenGunSayisi: 0,
      mevcutGunSayisi: 0,
      cakisanGunSayisi: 0,
      rozetVar: false,
      kazaVar: false,
      ayarVar: false,
    });
  });
});

describe('YedekBirlestirmeServisi — birlestirmePlaniOlustur (akilli)', () => {
  const mevcut = payloadKur({
    namazGunleri: { g1: { Sabah: true, 'Öğle': false } },
    kilinanVakitler: { g1: ['sabah'] },
    bonusPuan: 100,
    rozetler: [{ id: 'a' }, { id: 'b' }],
    seri: { mevcutSeri: 9 },
    seviye: { seviye: 5 },
    istatistik: { toplamKilinan: 999, mukemmelGun: 50, toparlanma: 7 },
    ayarlar: { ...bosAyarlar, konum: { sehir: 'Cihazınız' } },
  });
  const gelen = payloadKur({
    namazGunleri: { g1: { Sabah: false, 'Öğle': true }, g2: { Yatsı: true } },
    kilinanVakitler: { g1: ['ogle'], g2: ['yatsi'] },
    bonusPuan: 40,
    rozetler: [{ id: 'b' }, { id: 'c' }],
    kaza: { toplamTamamlanan: 3 },
    ayarlar: { ...bosAyarlar, konum: { sehir: 'Gelen' } },
  });

  const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));

  it('namaz_gun_* anahtarları gün+namaz union ile birleşmiş yazılır', () => {
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}g1`]).toEqual({
      Sabah: true,
      'Öğle': true,
    });
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}g2`]).toEqual({ Yatsı: true });
  });

  it('kılınan vakitler tarih bazında küme birleşimi olarak yazılır', () => {
    expect(plan[`${KILINAN_ONEK}g1`]).toEqual(['sabah', 'ogle']);
    expect(plan[`${KILINAN_ONEK}g2`]).toEqual(['yatsi']);
  });

  it('BONUS_PUAN max(mevcut, gelen); rozetler id-tekil birleşim', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN]).toBe(100);
    const rozetler = plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI] as Array<{ id: string }>;
    expect(rozetler.map((r) => r.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('seviye/istatistik/seri anahtarları YAZILMAZ (reconcile türetir)', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SERI_DURUMU);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI);
  });

  it('ayarlar akilli: hiçbir ayar anahtarı yazılmaz (cihaz korunur)', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI);
  });

  it('kaza akilli: daha ilerlemiş anlık görüntü gelen ise KAZA_DURUMU=gelen yazılır', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_DURUMU]).toEqual({ toplamTamamlanan: 3 });
  });
});

describe('YedekBirlestirmeServisi — birlestirmePlaniOlustur (uzerineYaz)', () => {
  const mevcut = payloadKur({
    namazGunleri: { g1: { Sabah: true } },
    bonusPuan: 100,
    ayarlar: { ...bosAyarlar, konum: { sehir: 'Cihaz' } },
  });
  const gelen = payloadKur({
    namazGunleri: { g1: { Sabah: false } },
    kilinanVakitler: { g1: ['ogle'] },
    bonusPuan: 40,
    rozetler: [{ id: 'c' }],
    seri: { mevcutSeri: 2 },
    seviye: { seviye: 1 },
    istatistik: { toplamKilinan: 10, mukemmelGun: 1, toparlanma: 0 },
    kaza: { toplamTamamlanan: 1 },
    kazaTempo: { g1: 2 },
    ayarlar: {
      ...bosAyarlar,
      konum: { sehir: 'Gelen' },
      muhafiz: { aktif: true },
    },
  });

  const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('uzerineYaz'));

  it('puan kategorisinde tüm puan/seviye/istatistik anahtarları gelenden yazılır', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN]).toBe(40);
    expect(plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI]).toEqual([{ id: 'c' }]);
    expect(plan[DEPOLAMA_ANAHTARLARI.SERI_DURUMU]).toEqual({ mevcutSeri: 2 });
    expect(plan[DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU]).toEqual({ seviye: 1 });
    expect(plan[DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ]).toBe(10);
    expect(plan[DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI]).toBe(1);
    expect(plan[DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI]).toBe(0);
  });

  it('kaza kategorisinde KAZA_DURUMU ve KAZA_TEMPO_GECMIS gelenden yazılır', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_DURUMU]).toEqual({ toplamTamamlanan: 1 });
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS]).toEqual({ g1: 2 });
  });

  it('ayarlar kategorisinde null-olmayan alt-ayarlar ilgili anahtara yazılır', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI]).toEqual({ sehir: 'Gelen' });
    expect(plan[DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI]).toEqual({ aktif: true });
    // null kalan alt-ayarlar yazılmaz
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI);
  });

  it('namaz_gun_* çakışan günde gelen değeri yazılır', () => {
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}g1`]).toEqual({ Sabah: false });
    expect(plan[`${KILINAN_ONEK}g1`]).toEqual(['ogle']);
  });
});

describe('YedekBirlestirmeServisi — birlestirmePlaniOlustur (eksikleriEkle)', () => {
  const mevcut = payloadKur({
    namazGunleri: { g1: { Sabah: true } },
    kilinanVakitler: { g1: ['sabah'] },
    bonusPuan: 100,
  });
  const gelen = payloadKur({
    namazGunleri: { g1: { Sabah: false }, g2: { Yatsı: true } },
    kilinanVakitler: { g1: ['ogle'], g2: ['yatsi'] },
    bonusPuan: 40,
    rozetler: [{ id: 'c' }],
    kaza: { toplamTamamlanan: 9 },
    ayarlar: { ...bosAyarlar, konum: { sehir: 'Gelen' } },
  });

  const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('eksikleriEkle'));

  it('yalnız mevcutta OLMAYAN gün eklenir; çakışan gün ATLANIR', () => {
    expect(plan).not.toHaveProperty(`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}g1`);
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}g2`]).toEqual({ Yatsı: true });
  });

  it('kılınan vakitler yalnız eksik tarihler için eklenir', () => {
    expect(plan).not.toHaveProperty(`${KILINAN_ONEK}g1`);
    expect(plan[`${KILINAN_ONEK}g2`]).toEqual(['yatsi']);
  });

  it('puan/kaza/ayar kategorilerine hiçbir anahtar eklenmez', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.BONUS_PUAN);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.ROZET_VERILERI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
  });
});

describe('YedekBirlestirmeServisi — kaza akilli daha-ileri seçimi', () => {
  it('mevcut daha ilerlemişse gelen seçilmez (KAZA_DURUMU plana eklenmez)', () => {
    const mevcut = payloadKur({ kaza: { toplamTamamlanan: 10 } });
    const gelen = payloadKur({ kaza: { toplamTamamlanan: 3 } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
  });

  it('tempo tarih bazında max ile birleşir', () => {
    const mevcut = payloadKur({ kaza: { toplamTamamlanan: 1 }, kazaTempo: { g1: 5, g2: 1 } });
    const gelen = payloadKur({ kaza: { toplamTamamlanan: 2 }, kazaTempo: { g1: 3, g3: 4 } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS]).toEqual({ g1: 5, g2: 1, g3: 4 });
  });
});
