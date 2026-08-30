/**
 * Faz 2 — `UyariModu` enum'u yerine `UyariKanallari` KUMESI.
 *
 * Enum "sessiz | bildirim | sesli | ikisi" dort durumu tek bir eksende sikistiriyordu;
 * yeni kanal eklemek (titresim) kombinatoryal patlama demekti. Kume her kanali
 * BAGIMSIZ acar/kapatir.
 */
import {
  KANAL_ADLARI,
  adimKapaliMi,
  kanalAc,
  kanalAcikMi,
  kanalKapat,
  kanallarEsitMi,
  modKanallaraCevir,
} from '../kanalKumesi';

describe('modKanallaraCevir — dort eski modun eslemesi', () => {
  test("'sessiz' → hicbir kanal acik degil", () => {
    expect(adimKapaliMi(modKanallaraCevir('sessiz'))).toBe(true);
  });
  test("'bildirim' → yalniz bildirim", () => {
    const k = modKanallaraCevir('bildirim');
    expect(kanalAcikMi(k, 'bildirim')).toBe(true);
    expect(kanalAcikMi(k, 'sesli')).toBe(false);
  });
  test("'sesli' → yalniz sesli", () => {
    const k = modKanallaraCevir('sesli');
    expect(kanalAcikMi(k, 'bildirim')).toBe(false);
    expect(kanalAcikMi(k, 'sesli')).toBe(true);
  });
  test("'ikisi' → bildirim + sesli", () => {
    const k = modKanallaraCevir('ikisi');
    expect(kanalAcikMi(k, 'bildirim')).toBe(true);
    expect(kanalAcikMi(k, 'sesli')).toBe(true);
  });
  test('bilinmeyen/eksik deger → kapali (sessizce yanlis kanal acmaktansa hic acma)', () => {
    expect(adimKapaliMi(modKanallaraCevir(undefined))).toBe(true);
    expect(adimKapaliMi(modKanallaraCevir('zirva' as never))).toBe(true);
  });
  test('HICBIR eslemede titresim acilmaz (Faz 6 baglayacak)', () => {
    for (const mod of ['sessiz', 'bildirim', 'sesli', 'ikisi'] as const) {
      expect(kanalAcikMi(modKanallaraCevir(mod), 'titresim')).toBe(false);
    }
  });
});

describe('adimKapaliMi — motorun "kapali" kapisi', () => {
  test('bos nesne / undefined kapalidir', () => {
    expect(adimKapaliMi({})).toBe(true);
    expect(adimKapaliMi(undefined)).toBe(true);
  });
  test('acikca false yazilmis kanallar da kapalidir', () => {
    expect(adimKapaliMi({ bildirim: false, sesli: false })).toBe(true);
  });
  test('TITRESIM tek basina da adimi ACIK sayar (Faz 6 sozlesmesi)', () => {
    // Bugun hicbir yol titresim yazmaz; kural simdiden dogru olsun ki Faz 6
    // "titresim actim ama adim kapali gorunuyor" sapmasi dogmasin.
    expect(adimKapaliMi({ titresim: true })).toBe(false);
  });
  test('KANAL_ADLARI kumeyi tam kapsar', () => {
    expect([...KANAL_ADLARI].sort()).toEqual(['bildirim', 'sesli', 'titresim']);
  });
});

describe('kanalAc / kanalKapat — kimlik korunur', () => {
  test('zaten acik kanali acmak AYNI referansi dondurur', () => {
    const k = { bildirim: true };
    expect(kanalAc(k, 'bildirim')).toBe(k);
  });
  test('zaten kapali kanali kapatmak AYNI referansi dondurur', () => {
    const k = { bildirim: true };
    expect(kanalKapat(k, 'sesli')).toBe(k);
  });
  test('ac/kapat diger kanallara dokunmaz', () => {
    const acilan = kanalAc({ sesli: true }, 'bildirim');
    expect(kanalAcikMi(acilan, 'sesli')).toBe(true);
    const kapanan = kanalKapat({ bildirim: true, sesli: true }, 'sesli');
    expect(kanalAcikMi(kapanan, 'bildirim')).toBe(true);
    expect(kanalAcikMi(kapanan, 'sesli')).toBe(false);
  });
});

describe('kanallarEsitMi', () => {
  test('eksik alan ile acikca false ayni sayilir', () => {
    expect(kanallarEsitMi({ bildirim: true }, { bildirim: true, sesli: false })).toBe(true);
  });
  test('farkli kume esit degildir', () => {
    expect(kanallarEsitMi({ bildirim: true }, { bildirim: true, sesli: true })).toBe(false);
  });
});
