jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 34, constants: { Model: 'SM-S721B', Release: '16' } },
}));
// `mock` önekli: jest.mock fabrikası closure'a erişebilsin. Varsayılan çıktı düz metindir;
// uçtan uca testler gerçek `Logger.exportLogs(veriDonustur)` sözleşmesini taklit eder.
const mockDisaAktar = jest.fn();
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { exportLogs: (veriDonustur?: (veri: unknown) => unknown) => mockDisaAktar(veriDonustur) },
}));

import { loglariMaskele, maskeliLogMetni, taniRaporuOlustur, veriyiMaskele } from '../TaniRaporuServisi';
import { UYGULAMA } from '../../../core/constants/UygulamaSabitleri';

beforeEach(() => {
  mockDisaAktar.mockReset();
  mockDisaAktar.mockReturnValue('konum 41.0082, 28.9784\nKaza render error');
});

describe('loglariMaskele', () => {
  test('konumDahil=false → koordinatları gizler', () => {
    const m = loglariMaskele('Yeni konum: 41.0082, 28.9784 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('konumDahil=true → koordinatı şehir düzeyine (toFixed 1) indirir', () => {
    const m = loglariMaskele('konum 41.0082, 28.9784', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('29.0');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('token/anahtar desenlerini redakte eder', () => {
    const m = loglariMaskele('token=abc123secret api_key: ZZZ', { konumDahil: false });
    expect(m).not.toContain('abc123secret');
    expect(m).not.toContain('ZZZ');
    expect(m).toContain('[gizlendi]');
  });

  test('Authorization: Bearer <jwt> → JWT tümden gizlenir', () => {
    const m = loglariMaskele('Authorization: Bearer eyJ0.payload.sig', { konumDahil: false });
    expect(m).not.toContain('eyJ0');
    expect(m).not.toContain('payload.sig');
    expect(m).toContain('[gizlendi]');
  });

  test('SIR koordinatı yutmamalı: "secret 41.0082, 28.9784" → koordinat sızmaz', () => {
    const m = loglariMaskele('secret 41.0082, 28.9784', { konumDahil: false });
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
    expect(m).toContain('[gizlendi]');
  });

  test('tırnaklı çok-kelimeli sır → değer tümden gizlenir', () => {
    const m = loglariMaskele('"password": "my secret password"', { konumDahil: false });
    expect(m).not.toContain('secret password');
    expect(m).not.toContain('my secret password');
    expect(m).toContain('[gizlendi]');
  });

  test('konumDahil=false → büyük-harfli "Il" alanındaki şehir adını gizler', () => {
    const log = 'Data: {\n  "Il": "Istanbul",\n  "konumModu": "manuel"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
  });

  test('konumDahil=false → adres alanını gizler', () => {
    const log = 'Data: {\n  "adres": "Atatürk Cad. No:5",\n  "konumModu": "manuel"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Atatürk Cad. No:5');
    expect(m).toContain('[konum gizlendi]');
    expect(m).toContain('"konumModu": "manuel"');
  });

  test('sıradan teknik logu değiştirmez', () => {
    const girdi = 'KazaDefteriSayfasi: render error stack at line 5';
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
  });

  // exportLogs() formatı: [tarih] [SEVİYE] [TAG] mesaj\nData: {"alan": "değer"}
  const exampleLogLine =
    '[2024-01-01T10:00:00.000Z] [INFO] [LocalKonumServisi] Yuklenen veri:\nData: {\n  "mod": "manuel",\n  "il": "Istanbul"\n}';

  test('konumDahil=false → il alanındaki şehir adını gizler', () => {
    const m = loglariMaskele(exampleLogLine, { konumDahil: false });
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
    // Alan adı ve yapı korunmalı
    expect(m).toContain('"il"');
  });

  test('konumDahil=true → il alanındaki şehir adı korunur', () => {
    const m = loglariMaskele(exampleLogLine, { konumDahil: true });
    expect(m).toContain('Istanbul');
    expect(m).not.toContain('[konum gizlendi]');
  });

  test('konumDahil=false → seciliIlAdi alanını gizler', () => {
    const log =
      '[2024-01-01T10:00:00.000Z] [DEBUG] [KonumSlice] State guncelleniyor (sync)\nData: {\n  "konumModu": "manuel",\n  "seciliIlAdi": "Ankara"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Ankara');
    expect(m).toContain('[konum gizlendi]');
    // konumModu gibi konum-dışı alan etkilenmemeli
    expect(m).toContain('"konumModu": "manuel"');
  });

  test('konumDahil=false → ilce alanını gizler', () => {
    const log = 'Data: {\n  "ilce": "Kadıköy",\n  "il": "Istanbul"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    expect(m).not.toContain('Kadıköy');
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('[konum gizlendi]');
  });

  test('konumDahil=false → konum-dışı string alanı etkilenmez', () => {
    const log = 'Data: {\n  "mesaj": "islem tamam",\n  "tag": "LocalKonumServisi"\n}';
    const m = loglariMaskele(log, { konumDahil: false });
    // "mesaj" ve "tag" şehir alanı değil — maskelenmemeli
    expect(m).toContain('"mesaj": "islem tamam"');
    expect(m).toContain('"tag": "LocalKonumServisi"');
  });

  test('1-ondalıklı koordinatı gizler (konumDahil=false)', () => {
    const m = loglariMaskele('Yeni konum: 41.0, 28.9 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0, 28.9');
  });

  test('1-ondalıklı koordinatı konumDahil=true ile korur', () => {
    const m = loglariMaskele('konum 41.0, 28.9', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('28.9');
  });

  test('negatif ve çoklu koordinat çiftlerini gizler (konumDahil=false)', () => {
    const m = loglariMaskele('a 41.0, -0.12 b 38.4, 27.1', { konumDahil: false });
    expect(m).not.toContain('41.0, -0.12');
    expect(m).not.toContain('38.4, 27.1');
  });
});

describe('taniRaporuOlustur', () => {
  test('konu sürümü içerir, gövde ortam+bağlam taşır, log maskeli (konum kapalı)', () => {
    const r = taniRaporuOlustur({ baglam: 'Kaza sayfası yüklenemedi', konumDahil: false, neOldu: 'açılmadı' });
    expect(r.konu).toContain(UYGULAMA.VERSIYON);
    expect(r.govde).toContain('Kaza sayfası yüklenemedi');
    expect(r.govde).toContain('SM-S721B');
    expect(r.govde).toContain('açılmadı');
    expect(r.logMetni).toContain('[konum gizlendi]');
    expect(r.logMetni).not.toContain('41.0082');
  });

  test('konumDahil=true → log şehir düzeyi konum içerir', () => {
    const r = taniRaporuOlustur({ konumDahil: true });
    expect(r.logMetni).toContain('41.0');
  });
});

// ==================== NÖBETÇİ: denetim B-4 ====================
// Eski maskeleyici yalnız "41.0082, 28.9784" çiftini, `"il"` gibi birkaç alanı ve tam
// sözcük `token`'ı tanıyordu; aşağıdaki dört girdi rapordan DEĞİŞMEDEN çıkıyordu.
describe('NÖBETÇİ B-4: metin yedek ağı denetimdeki dört girdiyi maskeler', () => {
  test('JSON biçimli koordinat (çiftin arasına alan adı girer)', () => {
    const girdi = 'Data: {\n  "lat": 41.008237,\n  "lng": 28.978359\n}';
    const m = loglariMaskele(girdi, { konumDahil: false });
    expect(m).not.toContain('41.008237');
    expect(m).not.toContain('28.978359');
    expect(m).toBe('Data: {\n  "lat": [konum gizlendi],\n  "lng": [konum gizlendi]\n}');
  });

  test('lat=… lng=… biçimi', () => {
    const m = loglariMaskele('konum lat=41.008237 lng=28.978359', { konumDahil: false });
    expect(m).toBe('konum lat=[konum gizlendi] lng=[konum gizlendi]');
  });

  test('yer adı alanları (seciliIlceAdi, konumAdi)', () => {
    const girdi = 'Data: {\n  "seciliIlceAdi": "Kadikoy",\n  "konumAdi": "Kadikoy, Istanbul",\n  "vakit": "ikindi"\n}';
    const m = loglariMaskele(girdi, { konumDahil: false });
    expect(m).not.toContain('Kadikoy');
    expect(m).not.toContain('Istanbul');
    expect(m).toContain('"vakit": "ikindi"');
  });

  test('sır alanı (anahtar) ve 7 haneli eşleme kodu', () => {
    const girdi = 'Data: {\n  "anahtar": "0123456789abcdef",\n  "kod": "1234567"\n}';
    const m = loglariMaskele(girdi, { konumDahil: false });
    expect(m).not.toContain('0123456789abcdef');
    expect(m).not.toContain('1234567');
    expect(m).toContain('[gizlendi]');
  });

  test('konumDahil=true → adıyla yazılmış koordinat 1 ondalığa iner, yer adı kalır', () => {
    expect(loglariMaskele('konum lat=41.008237 lng=28.978359', { konumDahil: true })).toBe('konum lat=41.0 lng=29.0');
    const json = loglariMaskele('{\n  "latitude": 41.008237,\n  "sonLng": -28.978359,\n  "konumAdi": "Kadikoy"\n}', { konumDahil: true });
    expect(json).toContain('"latitude": 41.0');
    expect(json).toContain('"sonLng": -29.0');
    expect(json).toContain('Kadikoy');
  });

  test.each([
    ['accessToken: abc123XYZ', 'abc123XYZ'],
    ['refresh_token=abc123XYZ', 'abc123XYZ'],
    ['"erisimBelirteci": "ya29.abc123XYZ"', 'ya29.abc123XYZ'],
    ['belirtec=abc123XYZ', 'abc123XYZ'],
    ['parola: "cok gizli parola"', 'cok gizli parola'],
    ['"sir": "c2lyLWRlZ2VyaQ=="', 'c2lyLWRlZ2VyaQ=='],
    ['ortakSir=c2lyLWRlZ2VyaQ', 'c2lyLWRlZ2VyaQ'],
    ['sahipAnahtari: 0123456789abcdef', '0123456789abcdef'],
  ])('bileşik/Türkçe sır alanı gizlenir: %s', (girdi, sir) => {
    const m = loglariMaskele(girdi, { konumDahil: false });
    expect(m).not.toContain(sir);
    expect(m).toContain('[gizlendi]');
  });

  test.each([
    'Drive belirteci yenilenemedi (kod=401)',
    'Kaza ayı bozuk, kardeş anahtara yazılıyor',
    'Güvenli depo okunamadı',
    'Sonraki vakit: ikindi, giris: 15:42',
    'siradaki bildirim sirasi: 3, kesir: 0.5',
    'Drive yetkisi alınamadı (kod=E_YETKI)',
    'versionCode: 1234567, sayac=12, surum=0.31.0',
    'plat: 3, format=2, salon: 5',
  ])('masum log satırı değişmeden kalır: %s', (girdi) => {
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
  });
});

describe('NÖBETÇİ B-4: veriyiMaskele alan adına göre VERİ üzerinde maskeler', () => {
  const GIZLI = '[gizlendi]';
  const KONUM = '[konum gizlendi]';

  test('koordinat: düz, iç içe, dizi içinde, camel/snake son sözcük, kap', () => {
    const veri = {
      lat: 41.008237,
      lng: 28.978359,
      konum: { latitude: 41.008237, longitude: 28.978359, dogruluk: 12 },
      gecmis: [{ sonLat: 40.1, son_lng: 29.9 }, { enlem: '39.92', boylam: '32.85' }],
      koordinatlar: [41.008237, 28.978359],
      coords: { lat: 41.008237, lng: 28.978359 },
    };
    expect(veriyiMaskele(veri, { konumDahil: false })).toEqual({
      lat: KONUM,
      lng: KONUM,
      konum: { latitude: KONUM, longitude: KONUM, dogruluk: 12 },
      gecmis: [{ sonLat: KONUM, son_lng: KONUM }, { enlem: KONUM, boylam: KONUM }],
      koordinatlar: [KONUM, KONUM],
      coords: { lat: KONUM, lng: KONUM },
    });
  });

  test('konumDahil=true → koordinat en fazla 1 ondalık, yer adı kalır', () => {
    const veri = {
      lat: 41.008237,
      lng: 28.978359,
      koordinatlar: [41.008237, 28.978359],
      enlem: '39.9234',
      seciliIlceAdi: 'Kadikoy',
      kod: '1234567',
    };
    expect(veriyiMaskele(veri, { konumDahil: true })).toEqual({
      lat: 41,
      lng: 29,
      koordinatlar: [41, 29],
      enlem: '39.9',
      seciliIlceAdi: 'Kadikoy',
      kod: '1234567',
    });
  });

  test('yer adı ve yeri ele veren kimlikler yalnız konumDahil=false iken gizlenir', () => {
    const veri = {
      il: 'Istanbul',
      seciliIlAdi: 'Istanbul',
      seciliIlceAdi: 'Kadikoy',
      konumAdi: 'Kadikoy, Istanbul',
      adres: 'Ataturk Cad. No:5',
      camiAdi: 'Merkez Camii',
      seciliIlId: 34,
      plakaKodu: '34',
      kod: '168 4892',
    };
    const m = veriyiMaskele(veri, { konumDahil: false }) as Record<string, unknown>;
    expect(Object.values(m).every((d) => d === KONUM)).toBe(true);
    expect(veriyiMaskele(veri, { konumDahil: true })).toEqual(veri);
  });

  test('sır alanları konum seçeneğinden bağımsız gizlenir (iç içe dahil)', () => {
    const veri = {
      accessToken: 'abc',
      refresh_token: 'def',
      belirtec: 'ghi',
      erisimBelirteci: 'jkl',
      anahtar: '0123456789abcdef',
      sahipAnahtari: 'mno',
      parola: 'pqr',
      sir: 'stu',
      ortakSir: 'vwx',
      apiKey: 'yz',
      Authorization: 'Bearer eyJ0.a.b',
      oturum: { token: { deger: 'ic-ice' }, pin: 1234 },
      liste: [{ password: 'dizi-ici' }],
    };
    for (const konumDahil of [false, true]) {
      const metin = JSON.stringify(veriyiMaskele(veri, { konumDahil }));
      for (const sizinti of ['abc', 'def', 'ghi', 'jkl', '0123456789abcdef', 'mno', 'pqr', 'stu', 'vwx', 'yz', 'eyJ0', 'ic-ice', '1234', 'dizi-ici']) {
        expect(metin).not.toContain(sizinti);
      }
      expect(metin).toContain(GIZLI);
    }
  });

  test('masum alanlar KORUNUR (tanı değeri yok edilmez)', () => {
    const veri = {
      vakit: 'ikindi',
      sayac: 3,
      surum: '0.31.0',
      versionCode: 1234567,
      konumModu: 'manuel',
      mod: 'otomatik',
      hata: 'Error: okunamadi',
      key: 'cihazAgi.liste',
      vakitKey: 'ogle',
      cacheKey: '@turkiye_iller',
      anahtarlar: ['a', 'b'],
      sira: 2,
      siradakiAdi: 'aksam',
      kod: 401,
      hataKodu: 'E_YETKI',
      ulkeKodu: 'TR',
      uzunluk: 16,
      izin: 'granted',
      tekrarSorulabilir: true,
      belirtecVar: true,
      token: null,
      seciliIlAdi: '',
      ic: { vakit: 'yatsi', liste: [1, 2, 3] },
    };
    expect(veriyiMaskele(veri, { konumDahil: false })).toEqual(veri);
  });

  test('girdiyi değiştirmez; ilkel, Error, Date, döngüsel ve aşırı derin veride çökmez', () => {
    const veri = { lat: 41.008237, ic: { token: 'abc' } };
    const kopya = JSON.parse(JSON.stringify(veri));
    veriyiMaskele(veri, { konumDahil: false });
    expect(veri).toEqual(kopya);

    expect(veriyiMaskele('duz metin', { konumDahil: false })).toBe('duz metin');
    expect(veriyiMaskele(42, { konumDahil: false })).toBe(42);
    expect(veriyiMaskele(null, { konumDahil: false })).toBeNull();
    expect(veriyiMaskele(undefined, { konumDahil: false })).toBeUndefined();
    const hata = new Error('x');
    expect(veriyiMaskele(hata, { konumDahil: false })).toBe(hata);
    expect(veriyiMaskele({ an: new Date(0) }, { konumDahil: false })).toEqual({ an: '1970-01-01T00:00:00.000Z' });

    const dongusel: Record<string, unknown> = { lat: 41.008237 };
    dongusel.kendisi = dongusel;
    const sonuc = JSON.stringify(veriyiMaskele(dongusel, { konumDahil: false }));
    expect(sonuc).not.toContain('41.008237');
    expect(sonuc).toContain(GIZLI);
  });

  test('`__proto__` adlı alan prototipi kirletmez, sıradan alan gibi maskelenir', () => {
    const veri = JSON.parse('{"__proto__": {"token": "abc", "kirli": true}, "vakit": "ogle"}');
    const m = veriyiMaskele(veri, { konumDahil: false }) as Record<string, unknown>;
    expect(JSON.stringify(m)).not.toContain('abc');
    expect(({} as Record<string, unknown>).kirli).toBeUndefined();
    expect(m.vakit).toBe('ogle');
  });
});

describe('NÖBETÇİ B-4: maskeliLogMetni uçtan uca (veri + metin)', () => {
  // Gerçek `Logger.exportLogs(veriDonustur)` biçimi: mesaj + "\nData: <girintili JSON>".
  const loglariKur = (kayitlar: { mesaj: string; veri?: unknown }[]): void => {
    mockDisaAktar.mockImplementation((veriDonustur?: (veri: unknown) => unknown) =>
      kayitlar
        .map((k) => {
          const veri = k.veri === undefined ? '' : `\nData: ${JSON.stringify(veriDonustur ? veriDonustur(k.veri) : k.veri, null, 2)}`;
          return `[2026-01-01T00:00:00.000Z] [INFO] [Test] ${k.mesaj}${veri}`;
        })
        .join('\n\n')
    );
  };

  const KAYITLAR = [
    { mesaj: 'Konum alindi', veri: { lat: 41.008237, lng: 28.978359 } },
    { mesaj: 'konum lat=41.008237 lng=28.978359' },
    { mesaj: 'Kaydediliyor', veri: { seciliIlceAdi: 'Kadikoy', konumAdi: 'Kadikoy, Istanbul', vakit: 'ikindi', sayac: 3 } },
    { mesaj: 'Eslesme', veri: { anahtar: '0123456789abcdef', kod: '1234567', surum: '0.31.0' } },
    { mesaj: 'Oturum', veri: { accessToken: 'ya29.abc', refresh_token: 'rt-1', belirtec: 'b-1', parola: 'p-1', sir: 's-1' } },
  ];
  const SIZINTILAR = ['41.008237', '28.978359', 'Kadikoy', 'Istanbul', '0123456789abcdef', '1234567', 'ya29.abc', 'rt-1', 'b-1', 'p-1', 's-1'];

  test('konumDahil=false → denetimdeki girdilerin hiçbiri çıkmaz, masum alanlar kalır', () => {
    loglariKur(KAYITLAR);
    const m = maskeliLogMetni({ konumDahil: false });

    for (const sizinti of SIZINTILAR) expect(m).not.toContain(sizinti);
    expect(m).toContain('"vakit": "ikindi"');
    expect(m).toContain('"sayac": 3');
    expect(m).toContain('"surum": "0.31.0"');
    expect(m).toContain('Kaydediliyor');
    // Maskeleme VERİ üzerinde yapıldı: Logger'a dönüştürücü verildi.
    expect(mockDisaAktar).toHaveBeenCalledWith(expect.any(Function));
  });

  test('konumDahil=true → kaba konum (1 ondalık, yer adı) kalır; sırlar yine gizli', () => {
    loglariKur(KAYITLAR);
    const m = maskeliLogMetni({ konumDahil: true });

    expect(m).not.toContain('41.008237');
    expect(m).not.toContain('28.978359');
    expect(m).toContain('"lat": 41');
    expect(m).toContain('lat=41.0 lng=29.0');
    expect(m).toContain('Kadikoy');
    for (const sir of ['0123456789abcdef', 'ya29.abc', 'rt-1', 'b-1', 'p-1', 's-1']) expect(m).not.toContain(sir);
  });

  test('taniRaporuOlustur log metnini aynı yoldan (veri dönüştürücüyle) üretir', () => {
    loglariKur(KAYITLAR);
    const r = taniRaporuOlustur({ konumDahil: false });

    for (const sizinti of SIZINTILAR) expect(r.logMetni).not.toContain(sizinti);
    expect(mockDisaAktar).toHaveBeenCalledWith(expect.any(Function));
  });
});
