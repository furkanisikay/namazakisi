/**
 * Telefon ayarlarındaki uygulamaya özel dil (Android 13+ / iOS) — sahip kararı 2026-11-05:
 * orada yapılan değişiklik BİR KEZ kazanır, uygulama içi seçim sisteme yazılır, cihazın genel
 * dili "cihaz dili" seçeneği için uygulamaya özel dilden bağımsız okunur.
 */
const disk: Record<string, unknown> = {};
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(async (k: string) => disk[k] ?? null),
    yaz: jest.fn(async (k: string, v: unknown) => {
      disk[k] = v;
    }),
    guncelle: jest.fn(async (k: string, f: (m: unknown) => unknown) => {
      disk[k] = f(disk[k] ?? null);
      return disk[k];
    }),
  },
}));

/** Telefonun ayar hâli: uygulamaya özel dil ve genel dil. */
const mockSistem: { uygulama: string | null; genel: string | null } = { uygulama: null, genel: 'tr-TR' };
const mockYazilan: (string | null)[] = [];
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({
  arayuzDiliniAyarla: jest.fn(),
  uygulamaDiliniOku: async () => mockSistem.uygulama,
  uygulamaDiliniYaz: async (e: string | null) => {
    mockYazilan.push(e);
    mockSistem.uygulama = e;
    return true;
  },
  cihazDiliniOku: async () => mockSistem.genel,
}));
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({ anonsDiliniAyarla: jest.fn(), arayuzDiliniAyarla: jest.fn() }));
jest.mock('../../../../modules/expo-muhafiz-anons/src', () => ({ anonsDiliniAyarla: jest.fn() }));

import { DilServisi, cihazYerelAyari } from '../DilServisi';
import { aktifDil, aktifDilSifirla } from '../../../core/dil/aktifDil';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

beforeEach(() => {
  for (const k of Object.keys(disk)) delete disk[k];
  mockSistem.uygulama = null;
  mockSistem.genel = 'tr-TR';
  mockYazilan.length = 0;
  aktifDilSifirla();
  DilServisi._sifirla();
});

describe('telefon ayarlarındaki uygulama dili (iOS köprüsü; Jest varsayılan platform)', () => {
  it('ilk görüşte değişim sayılmaz: uygulamanın seçimi sisteme yazılır', async () => {
    await DilServisi.kaydet('de');
    delete disk[DEPOLAMA_ANAHTARLARI.UYGULAMA_DILI_IZI];
    mockSistem.uygulama = null;
    expect(await DilServisi.sistemDiliDegisimi()).toBeNull();
    expect(mockSistem.uygulama).toBe('de');
  });

  it('uygulama içi seçim sisteme yazılır (Çince zh-Hans), aynı kalınca değişim yok', async () => {
    await DilServisi.kaydet('zh');
    expect(mockYazilan.at(-1)).toBe('zh-Hans');
    expect(await DilServisi.sistemDiliDegisimi()).toBeNull();
  });

  it('telefon ayarında uygulama dili değişince BİR KEZ o dil döner', async () => {
    await DilServisi.kaydet('en');
    mockSistem.uygulama = 'ar';
    expect(await DilServisi.sistemDiliDegisimi()).toBe('ar');
    expect(await DilServisi.sistemDiliDegisimi()).toBeNull();
  });

  it('telefon ayarında "sistem dili" seçilince cihaz diline dönülür', async () => {
    await DilServisi.kaydet('fr');
    mockSistem.uygulama = null;
    expect(await DilServisi.sistemDiliDegisimi()).toBe('cihaz');
  });

  it('eski kod (iw) seçilebilir dile eşlenir; seçilemeyen dil yok sayılır', async () => {
    await DilServisi.kaydet('en');
    mockSistem.uygulama = 'iw';
    expect(await DilServisi.sistemDiliDegisimi()).toBe('he');
    mockSistem.uygulama = 'is-IS';
    expect(await DilServisi.sistemDiliDegisimi()).toBeNull();
  });

  it('cihaz dili genel ayardan okunur: uygulama dili Arapça yazılı olsa da "cihaz dili" Almanca kalır', async () => {
    mockSistem.genel = 'de-DE';
    await DilServisi.hazir();
    await DilServisi.kaydet('ar');
    expect(cihazYerelAyari()).toBe('de-DE');
  });

  it('cihaz diline dönüşte önce telefon ayarı temizlenir', async () => {
    mockSistem.genel = 'en-US';
    await DilServisi.kaydet('ar');
    await DilServisi.cihazDilineDon();
    expect(mockSistem.uygulama).toBeNull();
    expect(aktifDil()).toBe('en');
  });
});
