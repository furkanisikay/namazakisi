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
  YEDEK_AYAR_ALANLARI,
} from '../YedekBirlestirmeServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { YedekPayload, KategoriSecimleri, KategoriStratejisi, KullaniciRozeti, NamazGunleri } from '../../../core/types';
import { yedekPayloadDogrula } from '../../../core/yedek/yedekPayloadDogrula';
import { hareketleriAyristir, hareketleriBirlestir, type KazaHareketi } from '../../../core/kaza/kazaHareketi';
import { defterHesapla, eskiAnlikGoruntuUret } from '../../../core/kaza/kazaDefteriHesabi';

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

/** Gerçek şekilli rozet kaydı (`KullaniciRozeti`). */
const rozet = (rozetId: string, kazanilmaTarihi: string | null = null): KullaniciRozeti => ({
  rozetId,
  kazanildiMi: kazanilmaTarihi !== null,
  kazanilmaTarihi,
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
    rozetler: [rozet('a'), rozet('b')],
    seri: { mevcutSeri: 9, enUzunSeri: 10 },
    seviye: { seviye: 5 },
    istatistik: { toplamKilinan: 999, mukemmelGun: 50, toparlanma: 7 },
    ayarlar: { ...bosAyarlar, konum: { sehir: 'Cihazınız' } },
  });
  const gelen = payloadKur({
    namazGunleri: { g1: { Sabah: false, 'Öğle': true }, g2: { Yatsı: true } },
    kilinanVakitler: { g1: ['ogle'], g2: ['yatsi'] },
    bonusPuan: 40,
    rozetler: [rozet('b'), rozet('c')],
    seri: { mevcutSeri: 4, enUzunSeri: 30 },
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

  it('BONUS_PUAN max(mevcut, gelen); rozetler rozetId-tekil birleşim', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN]).toBe(100);
    const rozetler = plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI] as KullaniciRozeti[];
    expect(rozetler.map((r) => r.rozetId)).toEqual(['a', 'b', 'c']);
  });

  it('seviye/istatistik anahtarları YAZILMAZ (reconcile türetir)', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI);
  });

  it('seri akilli: enUzunSeri max korunur (rekor kaybolmaz); güncel durum reconcile\'a bırakılır', () => {
    expect(plan[DEPOLAMA_ANAHTARLARI.SERI_DURUMU]).toEqual({ mevcutSeri: 9, enUzunSeri: 30 });
  });

  it('ayarlar akilli: hiçbir ayar anahtarı yazılmaz (cihaz korunur)', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI);
  });

  it('kaza: eski KAZA_DURUMU anlık görüntüsü ARTIK hiçbir yolda yazılmaz (defter hareketlerdir)', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
  });
});

describe('YedekBirlestirmeServisi — seri birleştirme kenar durumları (akilli)', () => {
  it('yeni/boş cihaz (mevcut seri yok) → yedeğin serisi tümden geri yüklenir', () => {
    const mevcut = payloadKur({ seri: null });
    const gelen = payloadKur({ seri: { mevcutSeri: 12, enUzunSeri: 45 } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));
    expect(plan[DEPOLAMA_ANAHTARLARI.SERI_DURUMU]).toEqual({ mevcutSeri: 12, enUzunSeri: 45 });
  });

  it('yedekte seri yoksa SERI_DURUMU yazılmaz (mevcut korunur)', () => {
    const mevcut = payloadKur({ seri: { mevcutSeri: 3, enUzunSeri: 8 } });
    const gelen = payloadKur({ seri: null });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SERI_DURUMU);
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

  it('kaza kategorisinde KAZA_TEMPO_GECMIS gelenden yazılır; KAZA_DURUMU yazılmaz', () => {
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
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

describe('YedekBirlestirmeServisi — eski yedeğin seferîlik mezhebi ortak ayara taşınır', () => {
  const eskiYedek = payloadKur({ ayarlar: { ...bosAyarlar, seferilik: { mezhep: 'safii', kartAcik: true }, mezhep: null } });

  it('uzerineYaz: ortak mezhep içermeyen eski yedekte seferîlik mezhebi MEZHEP_AYARI anahtarına da yazılır', () => {
    const mevcut = payloadKur({ ayarlar: { ...bosAyarlar, mezhep: { mezhep: 'hanefi' } } });
    const plan = birlestirmePlaniOlustur(mevcut, eskiYedek, secimler('uzerineYaz'));
    expect(plan[DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI]).toEqual({ mezhep: 'safii' });
    expect(plan[DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI]).toEqual({ mezhep: 'safii', kartAcik: true });
  });

  it('kullanıcının BİLİNÇLİ seçtiği ortak mezhep eski yedeğin seferîlik mezhebiyle EZİLMEZ', () => {
    const mevcut = payloadKur({ ayarlar: { ...bosAyarlar, mezhep: { mezhep: 'hanefi', secildi: true } } });
    const plan = birlestirmePlaniOlustur(mevcut, eskiYedek, secimler('uzerineYaz'));
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI);
  });

  it('yeni yedek kendi ortak mezhebini taşır; akıllı strateji ayarlara dokunmaz', () => {
    const yeni = payloadKur({ ayarlar: { ...bosAyarlar, seferilik: { mezhep: 'hanefi' }, mezhep: { mezhep: 'safii' } } });
    expect(birlestirmePlaniOlustur(payloadKur({}), yeni, secimler('uzerineYaz'))[DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI]).toEqual({ mezhep: 'safii' });
    expect(birlestirmePlaniOlustur(payloadKur({}), eskiYedek, secimler('akilli'))).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI);
  });
});

describe('YedekBirlestirmeServisi — tek rıza BİRLEŞİR, üzerine yazılmaz (Dalga 3)', () => {
  it('cihazdaki sesli onay, yalnız alarm onayı taşıyan yedekle SİLİNMEZ; ikisi birleşir', () => {
    const mevcut = payloadKur({ ayarlar: { ...bosAyarlar, hatirlatmaRizalari: { sesliOnayi: true } } });
    const gelen = payloadKur({ ayarlar: { ...bosAyarlar, hatirlatmaRizalari: { alarmOnayi: true } } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('uzerineYaz'));
    expect(plan[DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI]).toEqual({ sesliOnayi: true, alarmOnayi: true });
  });

  it('boş rıza kaydı taşıyan yedek cihazdaki onayı geri almaz', () => {
    const mevcut = payloadKur({ ayarlar: { ...bosAyarlar, hatirlatmaRizalari: { sesliOnayi: true, alarmOnayi: true } } });
    const gelen = payloadKur({ ayarlar: { ...bosAyarlar, hatirlatmaRizalari: {} } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('uzerineYaz'));
    expect(plan[DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI]).toEqual({ sesliOnayi: true, alarmOnayi: true });
  });

  it('rıza alanı olmayan eski yedek anahtara hiç dokunmaz', () => {
    const mevcut = payloadKur({ ayarlar: { ...bosAyarlar, hatirlatmaRizalari: { sesliOnayi: true } } });
    const plan = birlestirmePlaniOlustur(mevcut, payloadKur({ ayarlar: { ...bosAyarlar } }), secimler('uzerineYaz'));
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI);
  });
});

describe('YedekBirlestirmeServisi — "camide kılacağım" ayarı geri yüklenir (issue #292)', () => {
  it('uzerineYaz: gelen camiyeGit alt-ayarı CAMIYE_GIT_AYARLARI anahtarına yazılır', () => {
    const plan = birlestirmePlaniOlustur(
      payloadKur({}),
      payloadKur({ ayarlar: { ...bosAyarlar, camiyeGit: { aktif: true, yurumeDk: 12 } } }),
      secimler('uzerineYaz')
    );
    expect(plan[DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI]).toEqual({ aktif: true, yurumeDk: 12 });
  });
});

describe('YedekBirlestirmeServisi — kaza önerisi ayarı geri yüklenir (issue #294)', () => {
  it('uzerineYaz: gelen kazaOneri alt-ayarı KAZA_ONERI_AYARLARI anahtarına yazılır', () => {
    const plan = birlestirmePlaniOlustur(
      payloadKur({}),
      payloadKur({ ayarlar: { ...bosAyarlar, kazaOneri: { farzSonrasiOner: false } } }),
      secimler('uzerineYaz')
    );
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI]).toEqual({ farzSonrasiOner: false });
    // Sorulma hafızası cihaza özgüdür, yedekten asla yazılmaz.
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_ONERI_KAYDI]).toBeUndefined();
  });
});

describe('YedekBirlestirmeServisi — SON_DISA_AKTARMA yedeğe girmez (bilinçli)', () => {
  it('uzerineYaz stratejisinde bile SON_DISA_AKTARMA anahtarı plana eklenmez', () => {
    const mevcut = payloadKur({});
    const gelen = payloadKur({
      ayarlar: {
        ...bosAyarlar,
        // Cihaza özgü eylem geçmişi; AYAR_ANAHTARLARI eşlemesinde karşılığı YOK —
        // yedekte bulunsa bile plana yazılmamalı (başka cihazın damgasını taşımaz).
        sonDisaAktarma: '2026-01-01T00:00:00.000Z',
      },
    });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('uzerineYaz'));
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA);
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

describe('YedekBirlestirmeServisi — kaza tempo', () => {
  it('tempo tarih bazında max ile birleşir', () => {
    const mevcut = payloadKur({ kaza: { toplamTamamlanan: 1 }, kazaTempo: { g1: 5, g2: 1 } });
    const gelen = payloadKur({ kaza: { toplamTamamlanan: 2 }, kazaTempo: { g1: 3, g3: 4 } });
    const plan = birlestirmePlaniOlustur(mevcut, gelen, secimler('akilli'));
    expect(plan[DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS]).toEqual({ g1: 5, g2: 1, g3: 4 });
  });
});

describe('YedekBirlestirmeServisi — sade görünüm ayarı geri yüklenir (issue #295)', () => {
  it('uzerineYaz: gelen sadeGorunum alt-ayarı SADE_GORUNUM_AYARLARI anahtarına yazılır', () => {
    const plan = birlestirmePlaniOlustur(
      payloadKur({}),
      payloadKur({ ayarlar: { ...bosAyarlar, sadeGorunum: { aktif: true } } }),
      secimler('uzerineYaz')
    );
    expect(plan[DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI]).toEqual({ aktif: true });
  });

  it('uzerineYaz: gelen seferilik alt-ayarı SEFERILIK_AYARLARI (issue #296) anahtarına yazılır', () => {
    const plan = birlestirmePlaniOlustur(
      payloadKur({}),
      payloadKur({ ayarlar: { ...bosAyarlar, seferilik: { kartAcik: false, mezhep: 'safii', ikamet: null } } }),
      secimler('uzerineYaz')
    );
    expect(plan[DEPOLAMA_ANAHTARLARI.SEFERILIK_AYARLARI]).toEqual({ kartAcik: false, mezhep: 'safii', ikamet: null });
  });
});

// ==================== KAZA DEFTERİ 2.0 ====================

const BAGLAM = { zaman: '2026-10-15T10:00:00.000Z', cihaz: 'yeni1' };
const ONEK = DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK;

const eskiGoruntu = (sabahKalan: number, sabahKilinan: number) => ({
  namazlar: [
    { namazAdi: 'Sabah', kalanBorc: sabahKalan, tamamlanan: sabahKilinan, toplamBorc: sabahKalan + sabahKilinan },
    { namazAdi: 'Öğle', kalanBorc: 4, tamamlanan: 0, toplamBorc: 4 },
  ],
  toplamKalan: sabahKalan + 4,
  toplamTamamlanan: sabahKilinan,
  gunlukHedef: 0,
  gunlukTamamlanan: 0,
  gunlukHedefTarihi: '2026-10-15',
  toplamGizleMi: false,
  guncellemeTarihi: '2026-10-15',
});

/** Planın kaza ay anahtarlarını mevcut hareketlere uygular (diskteki tek kapının saf ikizi). */
const plandanHareketler = (plan: Record<string, unknown>, mevcut: KazaHareketi[]): KazaHareketi[] => {
  const yeni = Object.entries(plan)
    .filter(([a]) => a.startsWith(ONEK))
    .flatMap(([, liste]) => hareketleriAyristir(liste).taninan);
  return hareketleriBirlestir(mevcut, yeni);
};

const gorunum = (hareketler: KazaHareketi[]) =>
  defterHesapla({
    hareketler,
    bugunNamazGunu: '2026-10-15',
    bugunTakvim: '2026-10-15',
    isaretliler: {},
    ozelGunler: new Set(),
    vitirDahil: false,
    gunlukHedef: 0,
    toplamGizleMi: false,
  });

const sabah = (hareketler: KazaHareketi[]) => gorunum(hareketler).namazlar.find((n) => n.namazAdi === 'Sabah')!;

/** Yeni sürümün yükü: hareketler + türetilmiş eski şekilli görüntü. */
const yeniYuk = (hareketler: unknown[]) =>
  payloadKur({
    kazaHareketleri: hareketler,
    kaza: eskiAnlikGoruntuUret(gorunum(hareketleriAyristir(hareketler).taninan)),
  });

describe('YedekBirlestirmeServisi — Kaza Defteri 2.0 hareketleri', () => {
  it('ESKİ yedek boş deftere: anlık görüntü göç edilir, kalan BİREBİR aynı', () => {
    const plan = birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: [] }), payloadKur({ kaza: eskiGoruntu(10, 3) }), secimler('akilli'), BAGLAM);
    const h = plandanHareketler(plan, []);
    expect(sabah(h)).toMatchObject({ kalanBorc: 10, tamamlanan: 3 });
    expect(Object.keys(plan).filter((a) => a.startsWith(ONEK))).toEqual([`${ONEK}2026-10`]);
  });

  it('ESKİ yedek DOLU deftere: ikinci taban EKLENMEZ, yalnız "en az bu kadar kılındı" girer', () => {
    const mevcut = plandanHareketler(
      birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: [] }), payloadKur({ kaza: eskiGoruntu(10, 0) }), secimler('akilli'), BAGLAM),
      []
    );
    const plan = birlestirmePlaniOlustur(
      payloadKur({ kazaHareketleri: mevcut }),
      payloadKur({ kaza: eskiGoruntu(7, 3) }),
      secimler('akilli'),
      { ...BAGLAM, zaman: '2026-10-16T10:00:00.000Z' }
    );
    const sonra = plandanHareketler(plan, mevcut);
    expect(sonra.filter((h) => h.kaynak === 'taban')).toHaveLength(1);
    expect(sonra.filter((h) => h.kaynak === 'eskiGorunum')).toHaveLength(1);
    expect(sabah(sonra)).toMatchObject({ kalanBorc: 7, tamamlanan: 3 });
  });

  it('bayat eski görüntünün daha BÜYÜK borcu yeni hesabı geri getirmez (borç yönü alınmaz)', () => {
    const mevcut: KazaHareketi[] = [
      { id: 't1', zaman: '2026-10-01T00:00:00.000Z', cihaz: 'a', kaynak: 'taban', taban: { sabah: 2, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0, vitir: 0 } },
    ];
    const plan = birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: mevcut }), payloadKur({ kaza: eskiGoruntu(500, 0) }), secimler('akilli'), BAGLAM);
    expect(sabah(plandanHareketler(plan, mevcut)).kalanBorc).toBe(2);
  });

  it('yeni sürümün yükü: hareketler kimliğe göre birleşir; yalnız etkilenen aylar yazılır', () => {
    const ortak: KazaHareketi = { id: 'm1', zaman: '2026-09-01T00:00:00.000Z', cihaz: 'a', kaynak: 'manuel', vakit: 'sabah', adet: 1 };
    const yeni: KazaHareketi = { id: 'm2', zaman: '2026-10-02T00:00:00.000Z', cihaz: 'b', kaynak: 'kilindi', vakit: 'sabah', adet: 1 };
    const plan = birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: [ortak] }), yeniYuk([ortak, yeni]), secimler('uzerineYaz'), BAGLAM);
    expect(plan[`${ONEK}2026-10`]).toEqual([yeni]);
    // Gelende geçen her ay yazılır; tek kapı kimliğe göre birleştirdiği için zararsızdır.
    expect(plan[`${ONEK}2026-09`]).toEqual([ortak]);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU);
  });

  it('İLERİ UYUMLULUK: gelen ve mevcut çözülemeyen öğeler plana aynen girer', () => {
    const gelecek = { id: 'gelecek:1', zaman: '2026-10-03T00:00:00.000Z', kaynak: 'yeniTur', x: 1 };
    const mevcutGelecek = { id: 'gelecek:0', zaman: '2026-10-01T00:00:00.000Z', kaynak: 'yeniTur' };
    const plan = birlestirmePlaniOlustur(
      payloadKur({ kazaHareketleri: [mevcutGelecek] }),
      payloadKur({ kazaHareketleri: [gelecek] }),
      secimler('akilli'),
      BAGLAM
    );
    expect(plan[`${ONEK}2026-10`]).toEqual(expect.arrayContaining([gelecek, mevcutGelecek]));
  });

  it('KARIŞIK SÜRÜM EŞİTLEMESİ yakınsar: eski cihazda kılınan yeni cihaza gelir, sonra iki taraf durur', () => {
    // 1) Yeni cihaz A: eski kayıttan göç etmiş (sabah 10 kalan).
    let a = plandanHareketler(
      birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: [] }), payloadKur({ kaza: eskiGoruntu(10, 0) }), secimler('akilli'), BAGLAM),
      []
    );
    const aYuku = yeniYuk(a);

    // 2) Eski cihaz B, A'nın türetilmiş görüntüsünü DEĞİŞTİRMEDEN geri yükler → A hiçbir şey eklemez.
    const degismemis = birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: a }), payloadKur({ kaza: aYuku.kaza }), secimler('akilli'), BAGLAM);
    expect(Object.keys(degismemis).some((k) => k.startsWith(ONEK))).toBe(false);

    // 3) B'de 3 sabah kazası kılınır; B'nin yükünde hareket alanı YOKTUR (eski sürüm).
    const bGoruntusu = { ...(aYuku.kaza as object), ...eskiGoruntu(7, 3) };
    a = plandanHareketler(
      birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: a }), payloadKur({ kaza: bGoruntusu }), secimler('akilli'), {
        ...BAGLAM,
        zaman: '2026-10-16T10:00:00.000Z',
      }),
      a
    );
    expect(sabah(a)).toMatchObject({ kalanBorc: 7, tamamlanan: 3 });

    // 4) A'nın yeni görüntüsü B'ninkiyle aynı ilerlemede → eski cihazın "daha ilerlemiş olanı seç"
    //    kuralı artık değiştirmez (ping-pong yok).
    expect((yeniYuk(a).kaza as { toplamTamamlanan: number }).toplamTamamlanan).toBe(3);

    // 5) B aynı görüntüyü yeniden yüklese de A'ya yeni hareket girmez (idempotent).
    const tekrar = birlestirmePlaniOlustur(payloadKur({ kazaHareketleri: a }), payloadKur({ kaza: bGoruntusu }), secimler('akilli'), {
      ...BAGLAM,
      zaman: '2026-10-17T10:00:00.000Z',
    });
    expect(plandanHareketler(tekrar, a)).toHaveLength(a.length);
  });
});

// ─── Denetim G-1: rozet tekilleştirme ───────────────────────────────────────

describe('YedekBirlestirmeServisi — rozetler rozetId ile tekilleşir (G-1)', () => {
  const planla = (mevcut: unknown[], gelen: unknown[]): KullaniciRozeti[] =>
    birlestirmePlaniOlustur(payloadKur({ rozetler: mevcut }), payloadKur({ rozetler: gelen }), secimler('akilli'))[
      DEPOLAMA_ANAHTARLARI.ROZET_VERILERI
    ] as KullaniciRozeti[];

  it('cihazdaki "kazanılmadı" kaydı yedekteki kazanımı GÖLGELEMEZ: tek kayıt kalır, kazanılmış', () => {
    const sonuc = planla([rozet('ilk_adim'), rozet('efsane')], [rozet('ilk_adim', '2026-04-01T10:00:00.000Z')]);
    expect(sonuc).toEqual([rozet('ilk_adim', '2026-04-01T10:00:00.000Z'), rozet('efsane')]);
    // Tüketicinin gördüğü (`find` ilk eşleşmeyi döndürür) kazanılmış kayıttır.
    expect(sonuc.find((r) => r.rozetId === 'ilk_adim')?.kazanildiMi).toBe(true);
  });

  it('iki tarafta da kazanılmışsa en ESKİ kazanılma tarihi korunur (sıra bağımsız)', () => {
    const eski = rozet('ilk_adim', '2026-03-01T10:00:00.000Z');
    const yeni = rozet('ilk_adim', '2026-05-01T10:00:00.000Z');
    expect(planla([yeni], [eski])).toEqual([eski]);
    expect(planla([eski], [yeni])).toEqual([eski]);
  });

  it('cihazdaki kazanım, yedekte kazanılmamış görünse de geri alınmaz', () => {
    const kazanilmis = rozet('bin_namaz', '2026-02-01T10:00:00.000Z');
    expect(planla([kazanilmis], [rozet('bin_namaz')])).toEqual([kazanilmis]);
  });

  it('diskte kalmış bozuk rozet kaydı (null, eksik alan) birleştirmede temizlenir', () => {
    expect(planla([null, { id: 'eski' }, rozet('a')], [rozet('b')])).toEqual([rozet('a'), rozet('b')]);
  });

  it('rozet listesi dizi değilse (bozuk disk) fırlatmaz', () => {
    const mevcut = payloadKur({ rozetler: 'bozuk' as unknown as unknown[] });
    const plan = birlestirmePlaniOlustur(mevcut, payloadKur({ rozetler: [rozet('a')] }), secimler('akilli'));
    expect(plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI]).toEqual([rozet('a')]);
  });
});

// ─── Denetim B-2 / B-3: kötü amaçlı yedek ───────────────────────────────────

describe('YedekBirlestirmeServisi — kötü amaçlı yedek (B-2 / B-3)', () => {
  /** Kaynak koddaki açık anahtarla herkesin üretebileceği zarfın içeriği. */
  const kotuAmacliIcerik = (): unknown => {
    const gunler: Record<string, unknown> = {
      '2026-06-14': { Sabah: true, 'Öğle': 'evet', Teheccud: true },
      '../x': { Sabah: true },
      '': { Sabah: true },
      '2026-06-14/../../@namaz_akisi/bonus_puan': { Sabah: true },
    };
    for (let i = 0; i < 2000; i++) gunler[`cop-${i}`] = { Sabah: true };
    return JSON.parse(
      JSON.stringify({
        namazGunleri: gunler,
        kilinanVakitler: { '2026-06-14': ['imsak', 'cop', 5], '../y': ['imsak'], 'cop': ['imsak'] },
        seri: 'bozuk',
        rozetler: [null, { rozetId: { x: 1 }, kazanildiMi: 'evet' }, { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: null }],
        seviye: [1, 2, 3],
        bonusPuan: 1e308,
        istatistik: { toplamKilinan: 'abc', mukemmelGun: -5, toparlanma: 1e308 },
        kaza: { namazlar: 'yok' },
        kazaTempo: { '2026-06-10': 1e308, '../z': 3, 'cop': 1 },
        kazaHareketleri: [
          { id: 'manuel:1', zaman: '2026-06-14T08:00:00.000Z', cihaz: 'abc123', kaynak: 'manuel', vakit: 'sabah', adet: 2 },
          { id: 'x', zaman: '../../ay', kaynak: 'manuel', vakit: 'sabah', adet: 1 },
          null,
        ],
        ayarlar: { muhafiz: { aktif: true }, yabanci: { x: 1 }, '@namaz_akisi/bonus_puan': 9 },
      })
    );
  };

  const TARIH = '\\d{4}-\\d{2}-\\d{2}';
  const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const ONEKLI_DESENLER = [
    new RegExp(`^${esc(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK)}${TARIH}$`),
    new RegExp(`^${esc(KILINAN_ONEK)}${TARIH}$`),
    new RegExp(`^${esc(DEPOLAMA_ANAHTARLARI.KAZA_HAREKET_ONEK)}\\d{4}-\\d{2}$`),
  ];
  const SABIT_ANAHTARLAR = new Set<string>([
    DEPOLAMA_ANAHTARLARI.BONUS_PUAN,
    DEPOLAMA_ANAHTARLARI.ROZET_VERILERI,
    DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
    DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
    DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ,
    DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI,
    DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI,
    DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS,
    DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
    DEPOLAMA_ANAHTARLARI.MEZHEP_AYARI,
    DEPOLAMA_ANAHTARLARI.HATIRLATMA_RIZALARI,
  ]);
  const STRATEJILER: KategoriStratejisi[] = ['akilli', 'uzerineYaz', 'eksikleriEkle'];

  const planla = (strateji: KategoriStratejisi) => {
    const gelen = yedekPayloadDogrula(kotuAmacliIcerik(), YEDEK_AYAR_ALANLARI);
    if (!gelen) throw new Error('daraltıcı null döndü');
    return birlestirmePlaniOlustur(payloadKur({}), gelen, secimler(strateji));
  };

  it.each(STRATEJILER)('%s: planın TÜM anahtarları bilinen desenlere uyar (serbest metinli anahtar yok)', (strateji) => {
    const anahtarlar = Object.keys(planla(strateji));
    expect(anahtarlar.length).toBeGreaterThan(0);
    for (const anahtar of anahtarlar) {
      const bilinen = SABIT_ANAHTARLAR.has(anahtar) || ONEKLI_DESENLER.some((desen) => desen.test(anahtar));
      expect([anahtar, bilinen]).toEqual([anahtar, true]);
    }
    // 2000+ çöp günden yalnız tek gerçek gün plana girer.
    expect(anahtarlar.filter((a) => a.startsWith(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK))).toEqual([
      `${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}2026-06-14`,
    ]);
  });

  it.each(STRATEJILER)('%s: plan değerlerinde null rozet ve sonlu olmayan / dev sayı bulunmaz', (strateji) => {
    const plan = planla(strateji);
    const sayilar: number[] = [];
    const gez = (deger: unknown): void => {
      if (typeof deger === 'number') sayilar.push(deger);
      else if (deger && typeof deger === 'object') Object.values(deger).forEach(gez);
    };
    gez(plan);
    for (const s of sayilar) {
      expect(Number.isFinite(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1_000_000_000);
    }
    // Diske JSON olarak gider: `null`'a düşen (NaN/Infinity) sayı kalmamalı.
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan);
    if (strateji === 'eksikleriEkle') return;
    expect(plan[DEPOLAMA_ANAHTARLARI.ROZET_VERILERI]).toEqual([
      { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: null },
    ]);
    expect(plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN]).toBe(1_000_000_000);
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}2026-06-14`]).toEqual({ Sabah: true });
    expect(plan[`${KILINAN_ONEK}2026-06-14`]).toEqual(['imsak']);
  });

  it('uzerineYaz: bozuk seri/seviye anahtara `null` YAZMAZ (okuyucu null kaydı çözemez)', () => {
    const plan = planla('uzerineYaz');
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SERI_DURUMU);
    expect(plan).not.toHaveProperty(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU);
    // Beyaz liste dışı ayar alanı hiçbir anahtara dönüşmez.
    expect(plan[DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI]).toEqual({ aktif: true });
  });

  it('cihazdaki bonus bozuksa (sayı değil) akıllı birleştirme NaN yazmaz', () => {
    const mevcut = payloadKur({ bonusPuan: 'abc' as unknown as number });
    const plan = birlestirmePlaniOlustur(mevcut, payloadKur({ bonusPuan: 40 }), secimler('akilli'));
    expect(plan[DEPOLAMA_ANAHTARLARI.BONUS_PUAN]).toBe(40);
  });
});
