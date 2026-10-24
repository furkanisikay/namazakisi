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

const mockAndroidDil = jest.fn();
const mockIosDil = jest.fn();
const mockAndroidArayuz = jest.fn();
const mockIosArayuz = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  anonsDiliniAyarla: (d: string) => mockAndroidDil(d),
  arayuzDiliniAyarla: (k: string) => mockAndroidArayuz(k),
}));
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({ arayuzDiliniAyarla: (k: string) => mockIosArayuz(k) }));
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
    expect(aktifDil()).toBe('en');
    aktifDilSifirla();
    await DilServisi.yukle(true);
    const en = DILLER.find((d) => d.kod === 'en')!;
    expect(aktifDil()).toBe(en.secilebilir ? 'en' : 'tr');
  });

  it('kayıtlı dil SEÇİLEBİLİR değilse (yedekten gelen yarım dil) kendiliğinden açılmaz', async () => {
    cihaz('tr_TR');
    const en = DILLER.find((d) => d.kod === 'en')!;
    jest.replaceProperty(en, 'secilebilir', false);
    disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'en' };
    await DilServisi.yukle(true);
    expect(aktifDil()).toBe('tr');
    jest.replaceProperty(en, 'secilebilir', true);
    await DilServisi.yukle(true);
    expect(aktifDil()).toBe('en');
  });

  it('cihaz diline dönüş açık seçimi siler, metin dilini korur', async () => {
    cihaz('de_DE');
    disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'en', ozelAnonsDili: 'en' };
    await DilServisi.cihazDilineDon();
    expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ ozelAnonsDili: 'en' });
    expect(await DilServisi.secimVar()).toBe(false);
    expect(aktifDil()).toBe('tr');
    expect(await DilServisi.ozelAnonsDili()).toBe('en');
  });

  it('elle yazılmış metinlerin varsayılan dili Türkçedir; kayıt seçimi ezmez', async () => {
    expect(await DilServisi.ozelAnonsDili()).toBe('tr');
    await DilServisi.kaydet('en');
    await DilServisi.ozelAnonsDiliniKaydet('en');
    expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ kod: 'en', ozelAnonsDili: 'en' });
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

  it('arayüz dili (dil kodu) native widget/bildirim/saat için ayrı anahtara yazılır', async () => {
    await DilServisi.yukle(true);
    expect(mockAndroidArayuz).toHaveBeenLastCalledWith('tr');
    expect(mockIosArayuz).toHaveBeenLastCalledWith('tr');
    await DilServisi.kaydet('en');
    expect(mockAndroidArayuz).toHaveBeenLastCalledWith('en');
    expect(mockIosArayuz).toHaveBeenLastCalledWith('en');
  });
});
