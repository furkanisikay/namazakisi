const disk: Record<string, unknown> = {};
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: {
    oku: jest.fn(async (k: string) => disk[k] ?? null),
    yaz: jest.fn(async (k: string, v: unknown) => {
      disk[k] = v;
    }),
  },
}));

const mockAndroidDil = jest.fn();
const mockIosDil = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({ anonsDiliniAyarla: (d: string) => mockAndroidDil(d) }));
jest.mock('../../../../modules/expo-muhafiz-anons/src', () => ({ anonsDiliniAyarla: (d: string) => mockIosDil(d) }));

import { I18nManager, Platform } from 'react-native';
import { DilServisi } from '../DilServisi';
import { aktifDil, aktifDilSifirla } from '../../../core/dil/aktifDil';
import { DILLER } from '../../../core/dil/diller';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const cihaz = (yerel: string) => {
  jest.replaceProperty(Platform, 'OS', 'android');
  (I18nManager as unknown as { getConstants: () => object }).getConstants = () => ({ localeIdentifier: yerel });
};

describe('DilServisi', () => {
  beforeEach(() => {
    for (const k of Object.keys(disk)) delete disk[k];
    aktifDilSifirla();
    DilServisi._sifirla();
  });
  afterEach(() => jest.restoreAllMocks());

  it('kayıt yoksa ve cihaz dili seçilebilir değilse Türkçe', async () => {
    cihaz('de_DE');
    await DilServisi.hazir();
    expect(aktifDil()).toBe('tr');
  });

  it('cihaz dili yalnız seçilebilirse kendiliğinden kurulur', async () => {
    cihaz('en_US');
    await DilServisi.hazir();
    const en = DILLER.find((d) => d.kod === 'en')!;
    expect(aktifDil()).toBe(en.secilebilir ? 'en' : 'tr');
  });

  it('kullanıcının seçimi cihaz dilini ezer ve kalıcıdır', async () => {
    cihaz('tr_TR');
    await DilServisi.kaydet('en');
    expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ kod: 'en' });
    aktifDilSifirla();
    await DilServisi.yukle(true);
    expect(aktifDil()).toBe('en');
  });

  it('bozuk kayıt Türkçeye düşer', async () => {
    cihaz('xx');
    disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'klingon' };
    await DilServisi.hazir();
    expect(aktifDil()).toBe('tr');
  });

  it('sesli okuma dili etkin dille birlikte native tarafa bildirilir (yükleme ve kayıt)', async () => {
    await DilServisi.yukle();
    expect(mockAndroidDil).toHaveBeenLastCalledWith('tr-TR');
    expect(mockIosDil).toHaveBeenLastCalledWith('tr-TR');
    await DilServisi.kaydet('en');
    expect(mockAndroidDil).toHaveBeenLastCalledWith('en-US');
    expect(mockIosDil).toHaveBeenLastCalledWith('en-US');
  });
});
