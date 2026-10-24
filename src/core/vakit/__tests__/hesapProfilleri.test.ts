import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../hesapParametreleri';
import {
  HESAP_PROFILLERI,
  diyanetDokunulmamisMi,
  hesapAyariNormalize,
  hesapParametreleriOlustur,
  ummulKuraRamazanMi,
  type HesapProfiliKimligi,
} from '../hesapProfilleri';
import { GENEL_VARSAYILAN, ULKE_VARSAYILANLARI, ulkeVarsayilani } from '../ulkeProfilleri';
import {
  aktifHesapAyari,
  aktifHesapAyariniKur,
  aktifHesapSifirla,
  aktifHesapSurumu,
  aktifPrayerTimes,
} from '../aktifHesap';

const SAAT = (d: Date, tz: string) =>
  d.toLocaleTimeString('tr-TR', { timeZone: tz, hour: '2-digit', minute: '2-digit' });

const KUALA_LUMPUR = new Coordinates(3.139, 101.6869);
const ISTANBUL = new Coordinates(41.0082, 28.9784);
const LAHOR = new Coordinates(31.5204, 74.3587);
const OSLO = new Coordinates(59.9139, 10.7522);
const GUN = new Date(2026, 9, 24, 12);

describe('Diyanet profili (Türkiye DEĞİŞMEZ)', () => {
  it('ince ayarsız Diyanet, turkiyeHesapParametreleri() ile bayt bayt aynı', () => {
    expect(JSON.stringify(hesapParametreleriOlustur({ profil: 'diyanet' }))).toBe(
      JSON.stringify(turkiyeHesapParametreleri()),
    );
    expect(JSON.stringify(hesapParametreleriOlustur({ profil: 'diyanet' }, { tarih: GUN, enlem: 59 }))).toBe(
      JSON.stringify(CalculationMethod.Turkey()),
    );
  });

  it('Diyanet yüksek enlemde de kendi kuralını korur (MiddleOfTheNight)', () => {
    const p = hesapParametreleriOlustur({ profil: 'diyanet', ofsetler: { aksam: 1 } }, { enlem: 59.9 });
    expect(p.highLatitudeRule).toBe(HighLatitudeRule.MiddleOfTheNight);
    expect(p.madhab).toBe(Madhab.Shafi);
  });

  it('varsayılan etkin ayarla aktifPrayerTimes Turkey ile aynı vakitleri verir', () => {
    aktifHesapSifirla();
    const a = aktifPrayerTimes(ISTANBUL, GUN);
    const b = new PrayerTimes(ISTANBUL, GUN, CalculationMethod.Turkey());
    expect([a.fajr, a.sunrise, a.dhuhr, a.asr, a.maghrib, a.isha].map(Number)).toEqual(
      [b.fajr, b.sunrise, b.dhuhr, b.asr, b.maghrib, b.isha].map(Number),
    );
  });
});

describe('profiller', () => {
  it('her profil kurulur ve https kaynağı vardır', () => {
    for (const p of Object.values(HESAP_PROFILLERI)) {
      expect(p.kaynakUrl).toMatch(/^https:\/\//);
      const params = p.parametre();
      expect(params.fajrAngle).toBeGreaterThan(0);
    }
  });

  it('JAKIM, Singapore hazırından farklıdır (Malezya 2019 kararı: sabah 18°)', () => {
    const jakim = new PrayerTimes(KUALA_LUMPUR, GUN, hesapParametreleriOlustur({ profil: 'jakim' }));
    const sg = new PrayerTimes(KUALA_LUMPUR, GUN, CalculationMethod.Singapore());
    expect(SAAT(jakim.fajr, 'Asia/Kuala_Lumpur')).toBe('05:49');
    expect(SAAT(sg.fajr, 'Asia/Kuala_Lumpur')).toBe('05:39');
    expect(SAAT(jakim.isha, 'Asia/Kuala_Lumpur')).toBe('20:10');
  });

  it('Karachi profilinin varsayılan ikindisi asr-ı sânîdir; kullanıcı evvele çevirebilir', () => {
    const sani = new PrayerTimes(LAHOR, GUN, hesapParametreleriOlustur({ profil: 'karachi' }));
    const evvel = new PrayerTimes(LAHOR, GUN, hesapParametreleriOlustur({ profil: 'karachi', ikindi: 'evvel' }));
    expect(SAAT(sani.asr, 'Asia/Karachi')).toBe('15:43');
    expect(SAAT(evvel.asr, 'Asia/Karachi')).toBe('14:56');
  });

  it("Ümmü'l-Kurâ Ramazan'da yatsıyı 120 dk yapar", () => {
    const ramazan = new Date(2027, 1, 20, 12);
    expect(ummulKuraRamazanMi(ramazan)).toBe(true);
    expect(hesapParametreleriOlustur({ profil: 'ummulKura' }, { tarih: ramazan }).ishaInterval).toBe(120);
    expect(hesapParametreleriOlustur({ profil: 'ummulKura' }, { tarih: GUN }).ishaInterval).toBe(90);
  });

  it('Diyanet dışı profillerde 48° üstü 1/7 gece kuralı uygulanır', () => {
    expect(hesapParametreleriOlustur({ profil: 'mwl' }, { enlem: OSLO.latitude }).highLatitudeRule).toBe(
      HighLatitudeRule.SeventhOfTheNight,
    );
    expect(hesapParametreleriOlustur({ profil: 'mwl' }, { enlem: 41 }).highLatitudeRule).toBe(
      HighLatitudeRule.MiddleOfTheNight,
    );
  });

  it('kullanıcı ofsetleri adjustments alanına yazılır, kurum ofsetleri korunur', () => {
    const p = hesapParametreleriOlustur({ profil: 'jakim', ofsetler: { aksam: 2, imsak: -1 } });
    expect(p.adjustments.maghrib).toBe(2);
    expect(p.adjustments.fajr).toBe(-1);
    expect(p.methodAdjustments.maghrib).toBe(2);
  });
});

describe('ülke varsayılanları', () => {
  it('bilinen ülkeler', () => {
    expect(ulkeVarsayilani('TR').profil).toBe('diyanet');
    expect(ulkeVarsayilani('tr').profil).toBe('diyanet');
    expect(ulkeVarsayilani('MY').profil).toBe('jakim');
    expect(ulkeVarsayilani('SA').profil).toBe('ummulKura');
    expect(ulkeVarsayilani('PK')).toEqual({ profil: 'karachi', guven: 'kaynakli' });
    expect(ulkeVarsayilani('UZ').ikindi).toBe('sani');
  });

  it('bilinmeyen ya da boş ülke genel yönteme düşer', () => {
    expect(ulkeVarsayilani('ZZ')).toBe(GENEL_VARSAYILAN);
    expect(ulkeVarsayilani(undefined)).toBe(GENEL_VARSAYILAN);
    expect(ulkeVarsayilani('TUR')).toBe(GENEL_VARSAYILAN);
  });

  it('her satır var olan bir profile bağlı; Caferî hiçbir ülkenin varsayılanı değil (sahip kararı)', () => {
    for (const [kod, v] of Object.entries(ULKE_VARSAYILANLARI)) {
      expect(kod).toMatch(/^[A-Z]{2}$/);
      expect(HESAP_PROFILLERI[v.profil]).toBeDefined();
      expect(HESAP_PROFILLERI[v.profil].yalnizElle).toBeFalsy();
      expect(v.profil).not.toBe('caferi' as HesapProfiliKimligi);
    }
  });
});

describe('hesapAyariNormalize', () => {
  it('bozuk girdi Diyanet olur', () => {
    expect(hesapAyariNormalize(null)).toEqual({ profil: 'diyanet' });
    expect(hesapAyariNormalize({ profil: 'yok' })).toEqual({ profil: 'diyanet' });
    expect(hesapAyariNormalize([1])).toEqual({ profil: 'diyanet' });
  });

  it('ofset ve açı sınırlanır, sıfır ofset atılır', () => {
    const a = hesapAyariNormalize({
      profil: 'mwl', ikindi: 'sani', ofsetler: { aksam: 99, imsak: 0, ogle: 'x' }, aci: { fecr: 5 },
      sorulanUlkeler: ['MY', 'MY', 'xx'],
    });
    expect(a).toEqual({ profil: 'mwl', ikindi: 'sani', ofsetler: { aksam: 30 }, aci: { fecr: 10 }, sorulanUlkeler: ['MY'] });
    expect(diyanetDokunulmamisMi(hesapAyariNormalize({ profil: 'diyanet', sorulanUlkeler: ['MY'] }))).toBe(true);
  });
});

describe('etkin ayar', () => {
  afterEach(() => aktifHesapSifirla());

  it('yalnız içerik değişince sürüm artar', () => {
    aktifHesapSifirla();
    const s0 = aktifHesapSurumu();
    expect(aktifHesapAyariniKur({ profil: 'diyanet' })).toBe(false);
    expect(aktifHesapSurumu()).toBe(s0);
    expect(aktifHesapAyariniKur({ profil: 'jakim' })).toBe(true);
    expect(aktifHesapSurumu()).toBe(s0 + 1);
    expect(aktifHesapAyari().profil).toBe('jakim');
    expect(SAAT(aktifPrayerTimes(KUALA_LUMPUR, GUN).fajr, 'Asia/Kuala_Lumpur')).toBe('05:49');
  });
});

describe('bölge önerisi kartı', () => {
  const { bolgeOnerisi } = require('../ulkeProfilleri') as typeof import('../ulkeProfilleri');
  const { kayitliUlkeKodu } = require('../../konum/ulkeTespiti') as typeof import('../../konum/ulkeTespiti');

  it("Türkiye'deki eski kurulum hiçbir şey görmez", () => {
    expect(bolgeOnerisi('TR', { profil: 'diyanet' })).toBeNull();
  });

  it('yurt dışında bir kez sorulur', () => {
    expect(bolgeOnerisi('MY', { profil: 'diyanet' })).toEqual({ profil: 'jakim', guven: 'olculdu' });
    expect(bolgeOnerisi('MY', { profil: 'diyanet', sorulanUlkeler: ['MY'] })).toBeNull();
    expect(bolgeOnerisi('MY', { profil: 'jakim' })).toBeNull();
    expect(bolgeOnerisi(null, { profil: 'diyanet' })).toBeNull();
  });

  it('Azerbaycan: Sünnî varsayılan, QMİ (Caferî) ikinci seçenek; QMİ seçmişe sorulmaz (sahip kararı)', () => {
    expect(bolgeOnerisi('AZ', { profil: 'diyanet' })).toEqual({ profil: 'mwl', guven: 'genel', alternatif: 'qmi' });
    // Varsayılandaki kullanıcıya da BİR KEZ yalnız QMİ sorulur.
    expect(bolgeOnerisi('AZ', { profil: 'mwl' })).toEqual({ profil: 'mwl', guven: 'genel', alternatif: 'qmi' });
    expect(bolgeOnerisi('AZ', { profil: 'qmi' })).toBeNull();
    expect(bolgeOnerisi('AZ', { profil: 'mwl', sorulanUlkeler: ['AZ'] })).toBeNull();
    expect(ulkeVarsayilani('AZ').profil).not.toBe('qmi');
  });

  it('aynı profil ama farklı ikindi de önerilir (Orta Asya)', () => {
    expect(bolgeOnerisi('UZ', { profil: 'mwl' })?.ikindi).toBe('sani');
  });

  it('kayıtlı ülke: dünya şehri > ülke kodu > manuel il = TR', () => {
    expect(kayitliUlkeKodu({ konumModu: 'manuel', seciliIlId: 34 })).toBe('TR');
    expect(kayitliUlkeKodu({ konumModu: 'manuel', seciliIlId: null, dunyaSehri: { ulke: 'MY' } })).toBe('MY');
    expect(kayitliUlkeKodu({ konumModu: 'oto', ulkeKodu: 'DE' })).toBe('DE');
    expect(kayitliUlkeKodu({ konumModu: 'oto' })).toBeNull();
  });
});

/**
 * QMİ (Kafkas Müslümanları İdaresi) resmî tablosu, Bakü 2026 — https://qafqazislam.com/teqvim/2026/Baki/{6,10}.jpg
 * (2026-10-24 okundu). Profil bu tabloya ampirik uyduruldu; her vakit ±2 dk içinde kalmalı.
 */
describe('QMİ profili — Bakü resmî tablosu', () => {
  // [ay, gün, sabah ezanı, güneş, öğle, ikindi, akşam ezanı, yatsı]
  const TABLO: [number, number, string, string, string, string, string, string][] = [
    [10, 1, '05:17', '06:37', '12:30', '16:37', '18:36', '19:37'],
    [10, 16, '05:33', '06:53', '12:26', '16:16', '18:13', '19:13'],
    [10, 31, '05:48', '07:10', '12:24', '15:57', '17:53', '18:54'],
    [6, 4, '03:27', '05:11', '12:39', '17:51', '20:24', '21:44'],
    [6, 22, '03:23', '05:11', '12:43', '17:56', '20:31', '21:53'],
  ];
  const dk = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const yerel = (d: Date) => {
    const t = new Date(d.getTime() + 4 * 3600e3); // Bakü UTC+4, yaz saati yok
    return Math.round(t.getUTCHours() * 60 + t.getUTCMinutes() + t.getUTCSeconds() / 60);
  };
  it.each(TABLO)('%i/%i', (ay, gun, ...beklenen) => {
    const p = hesapParametreleriOlustur({ profil: 'qmi' }, { tarih: new Date(Date.UTC(2026, ay - 1, gun, 8)), enlem: 40.41 });
    const pt = new PrayerTimes(new Coordinates(40.4093, 49.8671), new Date(Date.UTC(2026, ay - 1, gun, 8)), p);
    const hesap = [pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha].map(yerel);
    hesap.forEach((h, i) => expect(Math.abs(h - dk(beklenen[i]))).toBeLessThanOrEqual(2));
  });
});
