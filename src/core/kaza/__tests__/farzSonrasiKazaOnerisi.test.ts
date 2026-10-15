import { NamazAdi } from '../../constants/UygulamaSabitleri';
import { KAZA_NAMAZ_LISTESI, type KazaNamazAdi } from '../../types/KazaTipleri';
import {
  KAZA_ADLARI_KUCUK,
  bosKazaOneriKaydi,
  kazaOneriAyarlariniNormalize,
  kazaOneriKaydiniNormalize,
  kazaOnerisiKarari,
  kazaOnerisiOnKosulu,
  onerilecekKazayiSec,
  simdiDegilKaydet,
  soruAcildiKaydet,
  type KazaBorcGorunumu,
  type KazaOneriGirdisi,
} from '../farzSonrasiKazaOnerisi';

const GUN = '2026-10-13';
const DUN = '2026-10-12';

const defter = (borclar: Partial<Record<KazaNamazAdi, number>>): KazaBorcGorunumu[] =>
  KAZA_NAMAZ_LISTESI.map((namazAdi) => ({ namazAdi, kalanBorc: borclar[namazAdi] ?? 0 }));

const girdi = (degisiklik: Partial<KazaOneriGirdisi> = {}): KazaOneriGirdisi => ({
  ayarlar: { farzSonrasiOner: true },
  tamamlandi: true,
  kilinanNamaz: NamazAdi.Ogle,
  gosterilenGun: GUN,
  aktifGun: GUN,
  suankiVakitNamazi: NamazAdi.Ogle,
  kerahatMi: false,
  kayit: bosKazaOneriKaydi(GUN),
  namazlar: defter({ 'Öğle': 4, Sabah: 10 }),
  ...degisiklik,
});

describe('kazaOnerisiKarari — nöbetçiler (issue #294)', () => {
  it('her şey uygunsa sorar ve kılınan farzın kendi kazasını önerir', () => {
    expect(kazaOnerisiKarari(girdi())).toEqual({ sor: true, kazaNamazi: 'Öğle' });
  });

  it('KERAHAT vaktinde sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ kerahatMi: true }))).toEqual({ sor: false, sebep: 'kerahat' });
  });

  it('kerahat bilinmiyorsa (konum yok) sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ kerahatMi: null }))).toEqual({
      sor: false,
      sebep: 'kerahatBilinmiyor',
    });
  });

  it('kaza defteri BOŞSA sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ namazlar: defter({}) }))).toEqual({ sor: false, sebep: 'defterBos' });
  });

  it('kaza defteri yüklenemediyse sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ namazlar: null }))).toEqual({ sor: false, sebep: 'defterBos' });
  });

  it('GERİ ALMADA (kılmadım) sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ tamamlandi: false }))).toEqual({ sor: false, sebep: 'geriAlma' });
  });

  it('GEÇMİŞ GÜN işaretlemesinde sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ gosterilenGun: DUN }))).toEqual({ sor: false, sebep: 'gecmisGun' });
  });

  it('şu an süren vaktin namazı değilse (önceki vakti sonradan işaretleme) sormaz', () => {
    expect(
      kazaOnerisiKarari(girdi({ kilinanNamaz: NamazAdi.Sabah, suankiVakitNamazi: NamazAdi.Ogle }))
    ).toEqual({ sor: false, sebep: 'suankiVakitDegil' });
  });

  it('Güneş vaktinde (öğle henüz girmedi) sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ suankiVakitNamazi: NamazAdi.Gunes }))).toEqual({
      sor: false,
      sebep: 'suankiVakitDegil',
    });
  });

  it('Güneş bir farz değildir', () => {
    expect(
      kazaOnerisiKarari(girdi({ kilinanNamaz: NamazAdi.Gunes, suankiVakitNamazi: NamazAdi.Gunes }))
    ).toEqual({ sor: false, sebep: 'farzDegil' });
  });

  it('AYAR KAPALIYKEN sormaz', () => {
    expect(kazaOnerisiKarari(girdi({ ayarlar: { farzSonrasiOner: false } }))).toEqual({
      sor: false,
      sebep: 'ayarKapali',
    });
  });

  it('GÜNDE BİR KEZ: aynı vakit aynı gün ikinci kez sorulmaz (kıldım → geri al → kıldım)', () => {
    const kayit = soruAcildiKaydet(bosKazaOneriKaydi(GUN), GUN, NamazAdi.Ogle);
    expect(kazaOnerisiKarari(girdi({ kayit }))).toEqual({ sor: false, sebep: 'zatenSoruldu' });
    // Başka vakit aynı gün sorulabilir (cevap "Kıldım" idiyse).
    expect(
      kazaOnerisiKarari(
        girdi({ kayit, kilinanNamaz: NamazAdi.Ikindi, suankiVakitNamazi: NamazAdi.Ikindi })
      )
    ).toEqual({ sor: true, kazaNamazi: 'Sabah' });
  });

  it('"Şimdi değil" denince o gün HİÇBİR vakitte bir daha sorulmaz', () => {
    const kayit = simdiDegilKaydet(soruAcildiKaydet(bosKazaOneriKaydi(GUN), GUN, NamazAdi.Ogle), GUN);
    expect(
      kazaOnerisiKarari(
        girdi({ kayit, kilinanNamaz: NamazAdi.Aksam, suankiVakitNamazi: NamazAdi.Aksam })
      )
    ).toEqual({ sor: false, sebep: 'bugunErtelendi' });
  });

  it('dünün kaydı bugünü susturmaz (yeni gün = yeni hak)', () => {
    const dunku = simdiDegilKaydet(soruAcildiKaydet(bosKazaOneriKaydi(DUN), DUN, NamazAdi.Ogle), DUN);
    expect(kazaOnerisiKarari(girdi({ kayit: dunku }))).toEqual({ sor: true, kazaNamazi: 'Öğle' });
  });

  it('ön kapı defterden bağımsızdır (hook diske gitmeden eleyebilsin)', () => {
    expect(kazaOnerisiOnKosulu(girdi())).toBeNull();
    expect(kazaOnerisiOnKosulu(girdi({ kerahatMi: true }))).toBe('kerahat');
  });
});

describe('onerilecekKazayiSec', () => {
  it('kılınan farzın kendi kazası borçluysa onu seçer', () => {
    expect(onerilecekKazayiSec('Yatsı', defter({ 'Yatsı': 1, Sabah: 50 }))).toBe('Yatsı');
  });

  it('kendi kazası yoksa EN ÇOK borçlu olanı seçer', () => {
    expect(onerilecekKazayiSec('Öğle', defter({ Sabah: 3, 'İkindi': 7, Vitir: 5 }))).toBe('İkindi');
  });

  it('eşitlikte defter sırası (Sabah önce)', () => {
    expect(onerilecekKazayiSec('Öğle', defter({ 'Akşam': 2, Sabah: 2 }))).toBe('Sabah');
  });

  it('yatsı borcu yoksa vitir de önerilebilir', () => {
    expect(onerilecekKazayiSec('Yatsı', defter({ Vitir: 2 }))).toBe('Vitir');
  });

  it('negatif/NaN borç sayılmaz', () => {
    const bozuk: KazaBorcGorunumu[] = [
      { namazAdi: 'Sabah', kalanBorc: -3 },
      { namazAdi: 'Öğle', kalanBorc: Number.NaN },
    ];
    expect(onerilecekKazayiSec('Öğle', bozuk)).toBeNull();
  });
});

describe('normalize', () => {
  it('ayar yoksa/bozuksa varsayılan AÇIK', () => {
    expect(kazaOneriAyarlariniNormalize(null)).toEqual({ farzSonrasiOner: true });
    expect(kazaOneriAyarlariniNormalize('x')).toEqual({ farzSonrasiOner: true });
    expect(kazaOneriAyarlariniNormalize({ farzSonrasiOner: 'evet' })).toEqual({ farzSonrasiOner: true });
    expect(kazaOneriAyarlariniNormalize({ farzSonrasiOner: false })).toEqual({ farzSonrasiOner: false });
  });

  it('kayıt başka güne aitse ya da bozuksa boş döner', () => {
    expect(kazaOneriKaydiniNormalize(null, GUN)).toEqual(bosKazaOneriKaydi(GUN));
    expect(kazaOneriKaydiniNormalize([1], GUN)).toEqual(bosKazaOneriKaydi(GUN));
    expect(kazaOneriKaydiniNormalize({ tarih: DUN, ertelendi: true }, GUN)).toEqual(bosKazaOneriKaydi(GUN));
    expect(
      kazaOneriKaydiniNormalize({ tarih: GUN, sorulanVakitler: ['Öğle', 3], ertelendi: 'evet' }, GUN)
    ).toEqual({ tarih: GUN, sorulanVakitler: ['Öğle'], ertelendi: false });
  });

  it('kayıt yazıcıları değişiklik yoksa aynı referansı döndürür', () => {
    const k = soruAcildiKaydet(bosKazaOneriKaydi(GUN), GUN, 'Öğle');
    expect(soruAcildiKaydet(k, GUN, 'Öğle')).toBe(k);
    const e = simdiDegilKaydet(k, GUN);
    expect(simdiDegilKaydet(e, GUN)).toBe(e);
  });
});

describe('KAZA_ADLARI_KUCUK', () => {
  it('İkindi doğru küçülür (toLowerCase tuzağı)', () => {
    expect(KAZA_ADLARI_KUCUK['İkindi']).toBe('ikindi');
    for (const ad of KAZA_NAMAZ_LISTESI) expect(KAZA_ADLARI_KUCUK[ad]).not.toContain('̇');
  });
});
