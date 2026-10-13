import {
  ekranSinifiHesapla,
  ikiBolmeliMi,
  icerikDaraltilmaliMi,
  ORTA_KIRILIM_DP,
  GENIS_KIRILIM_DP,
  OKUNABILIR_MAKS_GENISLIK_DP,
} from '../ekranSinifi';

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
