import {
  SEFER_MESAFESI_KM,
  YOLCULUK_BITIS_KM,
  ikametUzakligiKm,
  kmMetni,
  konumKaydindanAd,
  mesafeYuvarla,
  seferilikDurumunuHesapla,
  type SeferilikGirdisi,
} from '../seferilikKarari';
import { VARSAYILAN_SEFERILIK_AYARLARI, type SeferilikAyarlari } from '../seferilikAyarlari';

const ANKARA = { lat: 39.9208, lng: 32.8541 };
const GOLBASI = { lat: 39.7905, lng: 32.8045 }; // ~15 km
const KIRIKKALE = { lat: 39.8468, lng: 33.5153 }; // ~57 km
const ESKISEHIR = { lat: 39.7767, lng: 30.5206 }; // ~200 km

const evdeAyar = (ek: Partial<SeferilikAyarlari> = {}): SeferilikAyarlari => ({
  ...VARSAYILAN_SEFERILIK_AYARLARI,
  ikamet: { ...ANKARA, kaynak: 'kullanici' },
  ...ek,
});

const girdi = (ek: Partial<SeferilikGirdisi> = {}): SeferilikGirdisi => ({
  ayarlar: evdeAyar(),
  hafiza: { yolculuktaKapatildi: false },
  konum: ESKISEHIR,
  ...ek,
});

describe('fikstür mesafeleri (testin kendi varsayımı)', () => {
  it('Gölbaşı < 30 km, Kırıkkale 30–90 km arası, Eskişehir > 150 km', () => {
    expect(ikametUzakligiKm(ANKARA, GOLBASI)).toBeLessThan(YOLCULUK_BITIS_KM);
    expect(ikametUzakligiKm(ANKARA, KIRIKKALE)).toBeGreaterThan(YOLCULUK_BITIS_KM);
    expect(ikametUzakligiKm(ANKARA, KIRIKKALE)).toBeLessThan(90);
    expect(ikametUzakligiKm(ANKARA, ESKISEHIR)).toBeGreaterThan(150);
  });
});

describe('SEFER_MESAFESI_KM — DİYK fetvası (kaynak notu)', () => {
  it('Hanefî ve Şâfiî eşiği ≈90 km (iki mezhepte de birincil metin aynı ölçüyü verir)', () => {
    expect(SEFER_MESAFESI_KM).toEqual({ hanefi: 90, safii: 90 });
  });
});

describe('seferilikDurumunuHesapla', () => {
  it('ikametten ≥90 km uzakta kart görünür ve mesafe verilir', () => {
    const s = seferilikDurumunuHesapla(girdi());
    expect(s.kartGoster).toBe(true);
    expect(s.yolculukta).toBe(true);
    expect(s.mesafeKm).toBeGreaterThan(150);
    expect(s.yeniIkamet).toBeNull();
    expect(s.hafizaSifirla).toBe(false);
  });

  it('Şâfiî mezhebinde de aynı eşik', () => {
    expect(seferilikDurumunuHesapla(girdi({ ayarlar: evdeAyar({ mezhep: 'safii' }) })).kartGoster).toBe(true);
  });

  it('90 km altında kart yok', () => {
    expect(seferilikDurumunuHesapla(girdi({ konum: KIRIKKALE })).kartGoster).toBe(false);
  });

  it('bu yolculukta kapatıldıysa kart yeniden ÇIKMAZ (konum değişse de)', () => {
    const s = seferilikDurumunuHesapla(girdi({ hafiza: { yolculuktaKapatildi: true } }));
    expect(s.yolculukta).toBe(true);
    expect(s.kartGoster).toBe(false);
  });

  it('kart ayarı kapalıysa görünmez', () => {
    expect(seferilikDurumunuHesapla(girdi({ ayarlar: evdeAyar({ kartAcik: false }) })).kartGoster).toBe(false);
  });

  it('ikamete dönülünce (<30 km) kapatma hafızası sıfırlanır — sonraki yolculukta kart çıkar', () => {
    const s = seferilikDurumunuHesapla(girdi({ konum: GOLBASI, hafiza: { yolculuktaKapatildi: true } }));
    expect(s.hafizaSifirla).toBe(true);
    expect(s.kartGoster).toBe(false);
  });

  it('TİTREME KORUMASI: 30–90 km arasında hafıza SIFIRLANMAZ', () => {
    const s = seferilikDurumunuHesapla(girdi({ konum: KIRIKKALE, hafiza: { yolculuktaKapatildi: true } }));
    expect(s.hafizaSifirla).toBe(false);
  });

  it('hafıza zaten temizse sıfırlama istenmez (gereksiz yazım yok)', () => {
    expect(seferilikDurumunuHesapla(girdi({ konum: GOLBASI })).hafizaSifirla).toBe(false);
  });

  it('ikamet yoksa ilk geçerli konum ikamet önerilir, kart çıkmaz', () => {
    const s = seferilikDurumunuHesapla(
      girdi({ ayarlar: { ...VARSAYILAN_SEFERILIK_AYARLARI }, konum: ESKISEHIR, konumAdi: ' Tepebaşı, Eskişehir ' }),
    );
    expect(s.kartGoster).toBe(false);
    expect(s.yeniIkamet).toEqual({ ...ESKISEHIR, kaynak: 'ilkKonum', ad: 'Tepebaşı, Eskişehir' });
  });

  it('{0,0} "yapılandırılmadı" nöbetçisi ve geçersiz konum: hiçbir şey yapılmaz', () => {
    for (const konum of [null, undefined, { lat: 0, lng: 0 }, { lat: NaN, lng: 1 }, { lat: 95, lng: 1 }]) {
      const s = seferilikDurumunuHesapla(girdi({ ayarlar: { ...VARSAYILAN_SEFERILIK_AYARLARI }, konum }));
      expect(s).toEqual({ kartGoster: false, mesafeKm: null, yolculukta: false, yeniIkamet: null, hafizaSifirla: false });
    }
  });
});

describe('mesafe yazımı', () => {
  it('100 km altı 1, üstü 5 km adımlı; binlik ayraç noktadır (Intl yok)', () => {
    expect(mesafeYuvarla(93.4)).toBe(93);
    expect(mesafeYuvarla(198)).toBe(200);
    expect(kmMetni(1243)).toBe('1.245');
    expect(kmMetni(-3)).toBe('0');
  });
});

describe('konumKaydindanAd', () => {
  it('otomatik modda GPS adresi; seçili il BAYAT olduğu için okunmaz', () => {
    expect(
      konumKaydindanAd({ konumModu: 'oto', gpsAdres: { ilce: 'Palandöken', il: 'Erzurum' }, seciliIlAdi: 'İstanbul' }),
    ).toBe('Palandöken, Erzurum');
    expect(konumKaydindanAd({ konumModu: 'oto', gpsAdres: null, seciliIlAdi: 'İstanbul' })).toBeUndefined();
  });

  it('manuel modda ilçe + il ya da yalnız il', () => {
    expect(konumKaydindanAd({ konumModu: 'manuel', seciliIlceAdi: 'Kadıköy', seciliIlAdi: 'İstanbul' })).toBe(
      'Kadıköy, İstanbul',
    );
    expect(konumKaydindanAd({ konumModu: 'manuel', seciliIlceAdi: '', seciliIlAdi: 'Bursa' })).toBe('Bursa');
    expect(konumKaydindanAd({ konumModu: 'manuel' })).toBeUndefined();
  });
});
