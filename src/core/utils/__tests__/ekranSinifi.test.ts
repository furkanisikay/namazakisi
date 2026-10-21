import {
  ekranSinifiHesapla,
  ikiBolmeliMi,
  icerikDaraltilmaliMi,
  ORTA_KIRILIM_DP,
  GENIS_KIRILIM_DP,
  OKUNABILIR_MAKS_GENISLIK_DP,
  gezinmeTuruSec,
  ucSutunluMu,
  anaAyrintiMi,
} from '../ekranSinifi';

describe('geniş ekran düzen kararları', () => {
  it('gezinme: telefon alt çubuk, orta ray, geniş kalıcı kenar', () => {
    expect(gezinmeTuruSec(411)).toBe('alt');
    expect(gezinmeTuruSec(744)).toBe('ray'); // iPad mini dikey
    expect(gezinmeTuruSec(1032)).toBe('kenar'); // iPad 13" dikey
  });

  it('üç sütun yalnız yatayda ve gezinme düşüldükten sonra yeterli genişlikte', () => {
    expect(ucSutunluMu(1376, 1032)).toBe(true); // iPad 13" yatay
    expect(ucSutunluMu(1280, 800)).toBe(true); // Pixel Tablet yatay
    expect(ucSutunluMu(1032, 1376)).toBe(false); // dikey: iki sütun
    expect(ucSutunluMu(1133, 744)).toBe(false); // iPad mini yatay: 1133-220 < 960
    expect(ucSutunluMu(Number.NaN, 800)).toBe(false);
  });

  it('ana-ayrıntı yalnız geniş pencerede (Split View dar pencere tek sayfa)', () => {
    expect(anaAyrintiMi(500)).toBe(false);
    expect(anaAyrintiMi(744)).toBe(false);
    expect(anaAyrintiMi(1032)).toBe(true);
  });
});

describe('ekranSinifiHesapla', () => {
  it('telefon genişlikleri kompakttır', () => {
    expect(ekranSinifiHesapla(320)).toBe('kompakt');
    expect(ekranSinifiHesapla(411)).toBe('kompakt');
    // Galaxy Z Fold kapak ekranı (~344 dp) ve Flip (~412 dp) de telefondur.
    expect(ekranSinifiHesapla(344)).toBe('kompakt');
  });

  it('kırılımlar alt sınırda DAHİLDİR (599 kompakt, 600 orta, 839 orta, 840 geniş)', () => {
    expect(ekranSinifiHesapla(ORTA_KIRILIM_DP - 1)).toBe('kompakt');
    expect(ekranSinifiHesapla(ORTA_KIRILIM_DP)).toBe('orta');
    expect(ekranSinifiHesapla(GENIS_KIRILIM_DP - 1)).toBe('orta');
    expect(ekranSinifiHesapla(GENIS_KIRILIM_DP)).toBe('genis');
  });

  it('kırılım değerleri Material pencere sınıflarıyla aynıdır', () => {
    expect(ORTA_KIRILIM_DP).toBe(600);
    expect(GENIS_KIRILIM_DP).toBe(840);
  });

  it('Fold iç ekranı dikeyde orta, tablet yatayda geniştir', () => {
    expect(ekranSinifiHesapla(673)).toBe('orta');
    expect(ekranSinifiHesapla(1280)).toBe('genis');
  });

  it('geçersiz genişlik güvenli tarafa (kompakt) düşer', () => {
    expect(ekranSinifiHesapla(Number.NaN)).toBe('kompakt');
    expect(ekranSinifiHesapla(-1)).toBe('kompakt');
    expect(ekranSinifiHesapla(0)).toBe('kompakt');
    expect(ekranSinifiHesapla(Number.POSITIVE_INFINITY)).toBe('kompakt');
  });
});

describe('ikiBolmeliMi', () => {
  it('telefonda düzen DEĞİŞMEZ; orta ve geniş sınıf iki bölmelidir', () => {
    expect(ikiBolmeliMi('kompakt')).toBe(false);
    expect(ikiBolmeliMi('orta')).toBe(true);
    expect(ikiBolmeliMi('genis')).toBe(true);
  });
});

describe('icerikDaraltilmaliMi', () => {
  it('yalnız okunabilir genişlikten geniş pencerede daraltır', () => {
    expect(icerikDaraltilmaliMi(411)).toBe(false);
    expect(icerikDaraltilmaliMi(OKUNABILIR_MAKS_GENISLIK_DP)).toBe(false);
    expect(icerikDaraltilmaliMi(OKUNABILIR_MAKS_GENISLIK_DP + 1)).toBe(true);
    expect(icerikDaraltilmaliMi(Number.NaN)).toBe(false);
  });
});
