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
