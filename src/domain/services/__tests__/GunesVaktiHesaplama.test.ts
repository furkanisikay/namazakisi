import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';

// Async Storage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Expo location mock
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 41.0082,
      longitude: 28.9784
    }
  }))
}));

describe('Güneş Vakti Hesaplama Entegrasyonu', () => {
  let servis: NamazVaktiHesaplayiciServisi;

  beforeAll(() => {
    servis = NamazVaktiHesaplayiciServisi.getInstance();
    // Konumu İstanbul olarak ayarla
    servis.yapilandir({
      latitude: 41.0082,
      longitude: 28.9784,
      method: 'Turkey',
      madhab: 'Hanafi'
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('currentPrayer sunrise -> vakit "gunes" eşlemesi doğru olmalı (mapping)', () => {
    // Bu test, fajr/sunrise/dhuhr ... -> imsak/gunes/ogle ... eşlemesinin
    // doğru olduğunu (özelde sunrise -> "gunes") doğrular; vaktin FİZİKİ
    // doğruluğunu değil. Doğruluk ayrı bir testte referans değerle kontrol edilir.
    const testDate = new Date('2026-02-01T12:00:00');

    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Güneş doğuşu ile öğle arasında bir an (currentPrayer === 'sunrise' olmalı)
    const gunesDogus = prayerTimes.sunrise;
    const ogle = prayerTimes.dhuhr;
    const gunesIleOgleArasi = new Date((gunesDogus.getTime() + ogle.getTime()) / 2);

    jest.setSystemTime(gunesIleOgleArasi);

    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi).not.toBeNull();
    // sunrise mapping'i: adhan 'sunrise' -> bizim 'gunes'
    expect(bilgi?.vakit).toBe('gunes');
  });

  it('İstanbul 1 Şubat 2026 güneş doğuşu (gunes) Diyanet referansına yakın olmalı (doğruluk)', () => {
    // Mapping değil, FİZİKİ doğruluk testi: adhan + CalculationMethod.Turkey
    // gerçekten doğru güneş doğuşunu üretmeli. method/koordinat/sürüm regresyonunu yakalar.
    const vakitler = servis.getGunlukVakitler(new Date('2026-02-01T12:00:00'));
    expect(vakitler).not.toBeNull();

    // adhan UTC Date döner; İstanbul Şubat'ta UTC+3 (DST yok) -> timezone-bağımsız assert
    const gunesTR = new Date(vakitler!.gunes.getTime() + 3 * 3600 * 1000);
    const dakika = gunesTR.getUTCHours() * 60 + gunesTR.getUTCMinutes();

    // Diyanet referansı: İstanbul 1 Şubat güneş ~08:08 TR; ±5 dk tolerans
    const beklenenDakika = 8 * 60 + 8; // 488
    expect(Math.abs(dakika - beklenenDakika)).toBeLessThanOrEqual(5);
  });

  it('Güneş doğuşundan hemen önce vakit "imsak" (veya sabah) olmalı', () => {
    // 1 Şubat 2026
    const testDate = new Date('2026-02-01T05:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // Güneş doğuşundan 1 dakika öncesi
    const gunesOncesi = new Date(prayerTimes.sunrise.getTime() - 60 * 1000);

    jest.setSystemTime(gunesOncesi);

    const bilgi = servis.getSuankiVakitBilgisi();

    // Adhan kütüphanesinde 'imsak' ile 'gunes' arası 'fajr' (Sabah) olarak geçer ama
    // bizim mapping'imizde 'imsak' olarak dönüyor olabilir, kontrol edelim.
    // NamazVaktiHesaplayiciServisi mapping: fajr -> imsak
    expect(bilgi?.vakit).toBe('imsak');
  });

  it('Öğle vaktinden hemen sonra vakit "ogle" olmalı ve sonraki vakit/saat/kalan süre alanları tutarlı olmalı', () => {
    // 1 Şubat 2026
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const prayerTimes = new PrayerTimes(coordinates, testDate, params);

    // (a) Öğle saatinin FİZİKİ doğruluğu: adhan saçma bir öğle dönmemeli.
    // getHours() yerel timezone'a bağlı olduğundan timezone-bağımsız UTC+3 (İstanbul, DST yok)
    // dönüşümüyle kontrol et. Diyanet referansı: İstanbul 1 Şubat öğle ~13:23 TR; ±5 dk tolerans.
    const ogleTR = new Date(prayerTimes.dhuhr.getTime() + 3 * 3600 * 1000);
    const ogleDakika = ogleTR.getUTCHours() * 60 + ogleTR.getUTCMinutes();
    const beklenenOgleDakika = 13 * 60 + 23; // 803
    expect(Math.abs(ogleDakika - beklenenOgleDakika)).toBeLessThanOrEqual(5);

    // Öğle vaktinden 1 dakika sonrası
    const ogleSonrasi = new Date(prayerTimes.dhuhr.getTime() + 60 * 1000);

    jest.setSystemTime(ogleSonrasi);

    const bilgi = servis.getSuankiVakitBilgisi();

    expect(bilgi).not.toBeNull();
    // İçinde bulunulan vakit: öğle
    expect(bilgi?.vakit).toBe('ogle');

    // (b) Dönen objenin diğer alanları: öğle içindeyken sıradaki vakit ikindi (asr) olmalı.
    // currentPrayer/nextPrayer karışması (üretim ~satır 182-191) burada yakalanır.
    expect(bilgi?.sonrakiVakitAdi).toBe('ikindi');
    // Vaktin çıkış saati = ikindi (asr) girişi
    expect(bilgi?.saat.getTime()).toBe(prayerTimes.asr.getTime());
    expect(bilgi?.sonrakiVakitGiris).toBe(prayerTimes.asr.toISOString());
    // Kalan süre = asr girişi - şu an (fake timer ogleSonrasi'na sabitli)
    expect(bilgi?.kalanSureMs).toBe(prayerTimes.asr.getTime() - ogleSonrasi.getTime());
  });

  it('İstanbul 1 Şubat 2026: imsak/akşam/yatsı vakitleri Diyanet referansına yakın olmalı (doğruluk)', () => {
    // gunes ve ogle ayrı testlerde doğrulandı; burada kalan vakitlerin de FİZİKİ
    // doğruluğunu sabitliyoruz. adhan + CalculationMethod.Turkey yanlış bir gün/method/sürüm
    // regresyonu üretirse (örn. fajrAngle/ishaAngle kayması) bu test FAIL eder.
    const vakitler = servis.getGunlukVakitler(new Date('2026-02-01T12:00:00'));
    expect(vakitler).not.toBeNull();

    // adhan UTC Date döner; İstanbul Şubat'ta UTC+3 (DST yok) -> timezone-bağımsız assert.
    const dakikaTR = (d: Date) => {
      const tr = new Date(d.getTime() + 3 * 3600 * 1000);
      return tr.getUTCHours() * 60 + tr.getUTCMinutes();
    };

    // Diyanet referansı (İstanbul 1 Şubat): imsak ~06:41, akşam ~18:28, yatsı ~19:50; ±5 dk tolerans.
    expect(Math.abs(dakikaTR(vakitler!.imsak) - (6 * 60 + 41))).toBeLessThanOrEqual(5);
    expect(Math.abs(dakikaTR(vakitler!.aksam) - (18 * 60 + 28))).toBeLessThanOrEqual(5);
    expect(Math.abs(dakikaTR(vakitler!.yatsi) - (19 * 60 + 50))).toBeLessThanOrEqual(5);

    // Sıralama tutarlılığı: imsak < gunes < ogle < ikindi < aksam < yatsi.
    // Vakit eşlemesi (fajr->imsak ... isha->yatsi) yanlış sıralanırsa yakalanır.
    expect(vakitler!.imsak.getTime()).toBeLessThan(vakitler!.gunes.getTime());
    expect(vakitler!.gunes.getTime()).toBeLessThan(vakitler!.ogle.getTime());
    expect(vakitler!.ogle.getTime()).toBeLessThan(vakitler!.ikindi.getTime());
    expect(vakitler!.ikindi.getTime()).toBeLessThan(vakitler!.aksam.getTime());
    expect(vakitler!.aksam.getTime()).toBeLessThan(vakitler!.yatsi.getTime());
  });

  it('Yatsı sonrası: vakit "yatsi" olmalı ve sonraki vakit YARININ imsakına sarkmalı (rollover dalı)', () => {
    // Üretim ~satır 157-164: bugün için sonraki vakit kalmadıysa (nextPrayer === 'none')
    // yarının imsak (fajr) vaktine bakılır. Bu kritik dal hiç test edilmemişti.
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const bugunPt = new PrayerTimes(coordinates, testDate, params);

    // Yatsıdan 1 dk SONRASI -> currentPrayer 'isha', nextPrayer 'none' (rollover tetiklenir).
    // Wall-clock string yerine adhan'ın kendi yatsı anına göreli an seçildiğinden timezone-bağımsız.
    const yatsiSonrasi = new Date(bugunPt.isha.getTime() + 60 * 1000);
    jest.setSystemTime(yatsiSonrasi);

    // Yarının imsak'ını üretimle BİREBİR aynı şekilde türet: new Date() + setDate(+1) -> getGunlukVakitler.
    // Böylece runner TZ'sinin setDate üzerindeki etkisi beklentide de aynı olur, flaky olmaz.
    const yarin = new Date();
    yarin.setDate(yarin.getDate() + 1);
    const yarinVakitler = servis.getGunlukVakitler(yarin);
    expect(yarinVakitler).not.toBeNull();

    const bilgi = servis.getSuankiVakitBilgisi();
    expect(bilgi).not.toBeNull();

    // İçinde bulunulan vakit: yatsı.
    expect(bilgi?.vakit).toBe('yatsi');
    // Sonraki vakit: imsak (yatsi sonrası -> yarının imsak'ı).
    expect(bilgi?.sonrakiVakitAdi).toBe('imsak');
    // Çıkış saati YARININ imsak'ı olmalı (bugünün imsak'ı DEĞİL) -> rollover doğru çalışıyor.
    expect(bilgi?.saat.getTime()).toBe(yarinVakitler!.imsak.getTime());
    expect(bilgi?.saat.getTime()).not.toBe(bugunPt.fajr.getTime());
    // Kalan süre POZİTİF ve = yarın imsak - şu an. (rollover'da yanlış işaret/yanlış gün regresyonu yakalanır.)
    expect(bilgi?.kalanSureMs).toBeGreaterThan(0);
    expect(bilgi?.kalanSureMs).toBe(yarinVakitler!.imsak.getTime() - yatsiSonrasi.getTime());
  });

  it('Gece (imsak öncesi): vakit fallback "yatsi" ve sonraki vakit BUGÜNÜN imsakı olmalı (rollover TETİKLENMEZ)', () => {
    // Üretim: imsaktan önce currentPrayer 'none' (-> fallback 'yatsi'), nextPrayer 'fajr'.
    // Bu durumda nextTime BUGÜNÜN fajr'ı olduğundan rollover dalı (next==='none') çalışmamalı.
    // Yatsı-sonrası testiyle birlikte rollover'ın YALNIZ yatsı sonrası tetiklendiğini kanıtlar.
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);
    const params = CalculationMethod.Turkey();
    const bugunPt = new PrayerTimes(coordinates, testDate, params);

    // İmsaktan 1 saat ÖNCESİ (gece) -> currentPrayer 'none', nextPrayer 'fajr'.
    const imsakOncesi = new Date(bugunPt.fajr.getTime() - 60 * 60 * 1000);
    jest.setSystemTime(imsakOncesi);

    const bilgi = servis.getSuankiVakitBilgisi();
    expect(bilgi).not.toBeNull();

    // currentPrayer 'none' -> vakitMapping fallback 'yatsi'.
    expect(bilgi?.vakit).toBe('yatsi');
    // Sonraki vakit imsak.
    expect(bilgi?.sonrakiVakitAdi).toBe('imsak');
    // Çıkış saati BUGÜNÜN imsak'ı olmalı (yarına SARKMAMALI) -> rollover yanlışlıkla tetiklenmemeli.
    expect(bilgi?.saat.getTime()).toBe(bugunPt.fajr.getTime());
    // Kalan süre = bugün imsak - şu an = ~1 saat (pozitif).
    expect(bilgi?.kalanSureMs).toBe(bugunPt.fajr.getTime() - imsakOncesi.getTime());
    expect(bilgi?.kalanSureMs).toBe(60 * 60 * 1000);
  });

  it('config madhab "Hanafi" olsa da ikindi Shafi (Turkey default) hesabıyla dönüyor (LATENT BUG karakterizasyonu)', () => {
    // yapilandir({ madhab: 'Hanafi' }) çağrılmasına rağmen prayerTimesAl her zaman
    // CalculationMethod.Turkey() kuruyor ve params.madhab'ı SET ETMİYOR. Turkey() varsayılanı
    // Shafi olduğundan ikindi (asr) Shafi gölge uzunluğu (1) ile hesaplanır; Hanafi (2) UYGULANMAZ.
    // Bu test mevcut (hatalı) davranışı SABİTLER: biri bug'ı düzeltip madhab'ı gerçekten
    // bağlarsa ikindi ~41 dk kayar ve bu test FAIL ederek değişikliği görünür kılar.
    const { Madhab } = require('adhan');
    const testDate = new Date('2026-02-01T12:00:00');
    const coordinates = new Coordinates(41.0082, 28.9784);

    const shafiParams = CalculationMethod.Turkey(); // madhab = Shafi (varsayılan)
    const shafiPt = new PrayerTimes(coordinates, testDate, shafiParams);

    const hanafiParams = CalculationMethod.Turkey();
    hanafiParams.madhab = Madhab.Hanafi;
    const hanafiPt = new PrayerTimes(coordinates, testDate, hanafiParams);

    // Ön koşul: iki madhab'ın ikindisi gerçekten farklı (test anlamlı olsun diye).
    expect(hanafiPt.asr.getTime()).not.toBe(shafiPt.asr.getTime());
    expect(hanafiPt.asr.getTime()).toBeGreaterThan(shafiPt.asr.getTime()); // Hanafi daha geç

    // Servis, madhab:'Hanafi' yapılandırılmış olmasına RAĞMEN Shafi ikindisini üretir.
    const vakitler = servis.getGunlukVakitler(testDate);
    expect(vakitler).not.toBeNull();
    expect(vakitler!.ikindi.getTime()).toBe(shafiPt.asr.getTime());
    expect(vakitler!.ikindi.getTime()).not.toBe(hanafiPt.asr.getTime());
  });
});
