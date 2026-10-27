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
import { aktifDil, aktifDilSifirla, aktifRakamSistemi, metin } from '../../../core/dil/aktifDil';
import { de } from '../../../core/dil/sozluk/de';
import { fr } from '../../../core/dil/sozluk/fr';
import { TEMEL_TAKIM } from '../../../core/dil/vakitTakimlari';
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
    cihaz('ja_JP');
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

  describe('kapalı (seçilemez) dil kaydı', () => {
    const genel = globalThis as unknown as { __DEV__: boolean };
    const oncekiDev = genel.__DEV__;
    afterEach(() => {
      genel.__DEV__ = oncekiDev;
    });

    it('ÜRETİMDE kayıtlı dil SEÇİLEBİLİR değilse (yedekten gelen yarım dil) kendiliğinden açılmaz', async () => {
      genel.__DEV__ = false;
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

    // Bugün kapalı dil yok: Arapça bu testlerde kapalı sayılır (yeni dil açılmadan önceki durum).
    const arapcayiKapat = () => jest.replaceProperty(DILLER.find((d) => d.kod === 'ar')!, 'secilebilir', false);

    it('NÖBETÇİ: kapalı dil yalnız GELİŞTİRME derlemesinde kayıttan kurulur (kare hattı)', async () => {
      arapcayiKapat();
      cihaz('tr_TR');
      disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'ar', goc: 1 };
      genel.__DEV__ = false;
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('tr');
      genel.__DEV__ = true;
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('ar');
    });

    it('NÖBETÇİ: kare hattı işareti kapalı dili geliştirme modu KAPALIYKEN de açar (kare hattı js_dev_mode=false)', async () => {
      arapcayiKapat();
      cihaz('tr_TR');
      genel.__DEV__ = false;
      disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'ar', goc: 1 };
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('tr');
      disk[DEPOLAMA_ANAHTARLARI.KARE_TURU] = true;
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('ar');
      delete disk[DEPOLAMA_ANAHTARLARI.KARE_TURU];
    });

    it('cihaz dili kapalı dili geliştirme derlemesinde de açmaz', async () => {
      arapcayiKapat();
      genel.__DEV__ = true;
      cihaz('ar_SA');
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('tr');
    });
  });

  it('açık sağdan sola diller cihaz dilinden kurulur (ar_SA → ar, ur_PK → ur)', async () => {
    cihaz('ar_SA');
    await DilServisi.yukle(true);
    expect(aktifDil()).toBe('ar');
    cihaz('ur_PK');
    await DilServisi.yukle(true);
    expect(aktifDil()).toBe('ur');
  });

  it('cihaz diline dönüş açık seçimi siler, metin dilini korur', async () => {
    cihaz('ja_JP');
    disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'en', ozelAnonsDili: 'en' };
    await DilServisi.cihazDilineDon();
    expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ ozelAnonsDili: 'en', goc: 1 });
    expect(await DilServisi.secimVar()).toBe(false);
    expect(aktifDil()).toBe('tr');
    expect(await DilServisi.ozelAnonsDili()).toBe('en');
  });

  describe('çok dil öncesi kurulum göçü (bir kez)', () => {
    it('eski kurulum (sihirbaz bitmiş), kayıt yok, telefon İngilizce → Türkçe KAYDEDİLİR, sessiz sapma yok', async () => {
      cihaz('en_US');
      disk[DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI] = true;
      await DilServisi.yukle(true);
      expect(aktifDil()).toBe('tr');
      expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ kod: 'tr', goc: 1 });
      expect(await DilServisi.secimVar()).toBe(true);
    });

    it('yeni kurulum (sihirbaz bitmemiş) → cihaz dili izlenir; sihirbaz sonra bitse de göç tekrar çalışmaz', async () => {
      cihaz('en_US');
      await DilServisi.yukle(true);
      const en = DILLER.find((d) => d.kod === 'en')!;
      expect(aktifDil()).toBe(en.secilebilir ? 'en' : 'tr');
      expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ goc: 1 });
      disk[DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI] = true;
      await DilServisi.yukle(true);
      expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ goc: 1 });
      expect(aktifDil()).toBe(en.secilebilir ? 'en' : 'tr');
    });

    it('kayıt varsa seçim korunur, yalnız işaret eklenir', async () => {
      cihaz('tr_TR');
      disk[DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI] = true;
      disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'en', ozelAnonsDili: 'en' };
      await DilServisi.yukle(true);
      expect(disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI]).toEqual({ kod: 'en', ozelAnonsDili: 'en', goc: 1 });
    });
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

  describe('vakit adı takımı', () => {
    const mockAdlar = jest.fn();
    beforeEach(() => {
      const k = require('../../../../modules/expo-countdown-notification/src');
      k.vakitAdlariniAyarla = (j: string | null) => mockAdlar(j);
      mockAdlar.mockClear();
    });
    afterEach(() => {
      delete require('../../../../modules/expo-countdown-notification/src').vakitAdlariniAyarla;
    });

    it('seçim yoksa konumun ülkesine göre varsayılan; açık seçim ülkeyi ezer', async () => {
      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'DZ' };
      await DilServisi.kaydet('fr');
      expect(metin().vakit.adlar.imsak).toBe('Sobh');
      expect(mockAdlar).toHaveBeenLastCalledWith(expect.stringContaining('Sobh'));

      expect(await DilServisi.vakitTakimiKaydet(TEMEL_TAKIM)).toBe(true);
      expect(metin().vakit.adlar).toEqual(fr.vakit.adlar);
      expect(mockAdlar).toHaveBeenLastCalledWith(null);
      expect(await DilServisi.vakitTakimiSecimi()).toBe(TEMEL_TAKIM);
    });

    it('konum ülkesi değişince yayma adımı varsayılanı yeniden çözer', async () => {
      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'FR' };
      await DilServisi.kaydet('fr');
      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'TN' };
      await DilServisi.vakitTakiminiYenile();
      expect(metin().vakit.adlar.ogle).toBe('Dohr');
      expect(metin().vakit.adlar.aksam).toBe('Maghreb');
    });

    it('her dilin seçimi ayrı tutulur; bilinmeyen kimlik kaydedilmez ve diskte yok sayılır', async () => {
      await DilServisi.kaydet('de');
      expect(await DilServisi.vakitTakimiKaydet('yok-boyle')).toBe(false);
      expect(await DilServisi.vakitTakimiKaydet('diyanet-de')).toBe(true);
      expect(metin().vakit.adlar.ogle).toBe('Mittagsgebet');
      await DilServisi.kaydet('fr');
      expect(metin().vakit.adlar.ogle).not.toBe('Mittagsgebet');
      await DilServisi.kaydet('de');
      expect(metin().vakit.adlar.ogle).toBe('Mittagsgebet');

      disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'de', vakitTakimi: { de: 'silinmis-takim' } };
      await DilServisi.vakitTakiminiYenile();
      expect(metin().vakit.adlar).toEqual(de.vakit.adlar);
      expect(await DilServisi.vakitTakimiSecimi()).toBeNull();
    });

    it('otomatiğe dönüş yalnız etkin dilin seçimini siler', async () => {
      await DilServisi.kaydet('de');
      await DilServisi.vakitTakimiKaydet('turkce');
      await DilServisi.kaydet('fr');
      await DilServisi.vakitTakimiKaydet('magrip');
      await DilServisi.vakitTakimiKaydet(null);
      expect((disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] as { vakitTakimi: object }).vakitTakimi).toEqual({ de: 'turkce' });
    });
  });
  describe('rakam sistemi', () => {
    const mockAndroidRakam = jest.fn();
    const mockIosRakam = jest.fn();
    beforeEach(() => {
      require('../../../../modules/expo-countdown-notification/src').rakamSisteminiAyarla = (k: string | null) => mockAndroidRakam(k);
      require('../../../../modules/expo-siri-kisayollari/src').rakamSisteminiAyarla = (k: string | null) => mockIosRakam(k);
      mockAndroidRakam.mockClear();
      mockIosRakam.mockClear();
    });
    afterEach(() => {
      delete require('../../../../modules/expo-countdown-notification/src').rakamSisteminiAyarla;
      delete require('../../../../modules/expo-siri-kisayollari/src').rakamSisteminiAyarla;
    });

    it('Arapçada ülkeye göre: Körfez Doğu Arap, Mağrip Batı rakamı; native çözülmüş değeri alır', async () => {
      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'SA' };
      await DilServisi.kaydet('ar');
      expect(aktifRakamSistemi()).toBe('arab');
      expect(mockAndroidRakam).toHaveBeenLastCalledWith('arab');
      expect(mockIosRakam).toHaveBeenLastCalledWith('arab');

      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'MA' };
      await DilServisi.vakitTakiminiYenile();
      expect(aktifRakamSistemi()).toBe('latn');
      expect(mockAndroidRakam).toHaveBeenLastCalledWith(null);
      expect(mockIosRakam).toHaveBeenLastCalledWith(null);
    });

    it('açık seçim kaydedilir ve ülkeyi ezer; otomatiğe dönüş seçimi siler', async () => {
      disk[DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI] = { konumModu: 'otomatik', ulkeKodu: 'DZ' };
      await DilServisi.kaydet('ar');
      expect(aktifRakamSistemi()).toBe('latn');
      expect(await DilServisi.rakamSecimi()).toBeNull();

      expect(await DilServisi.rakamKaydet('arab')).toBe(true);
      expect(aktifRakamSistemi()).toBe('arab');
      expect(mockAndroidRakam).toHaveBeenLastCalledWith('arab');
      expect(await DilServisi.rakamSecimi()).toBe('arab');
      expect((disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] as { rakam: object }).rakam).toEqual({ ar: 'arab' });

      expect(await DilServisi.rakamKaydet(null)).toBe(true);
      expect(aktifRakamSistemi()).toBe('latn');
      expect((disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] as { rakam: object }).rakam).toEqual({});
    });

    it('seçimi olmayan dilde kaydedilmez; dil değişince Batı rakamına dönülür, seçim korunur', async () => {
      await DilServisi.kaydet('ar');
      await DilServisi.rakamKaydet('latn');
      await DilServisi.kaydet('ur');
      expect(aktifRakamSistemi()).toBe('latn');
      expect(await DilServisi.rakamKaydet('arab')).toBe(false);
      expect(aktifRakamSistemi()).toBe('latn');
      expect(mockAndroidRakam).toHaveBeenLastCalledWith(null);
      await DilServisi.kaydet('ar');
      expect(aktifRakamSistemi()).toBe('latn');
      expect(await DilServisi.rakamSecimi()).toBe('latn');
    });

    it('bozuk kayıttaki seçim yok sayılır', async () => {
      disk[DEPOLAMA_ANAHTARLARI.DIL_AYARI] = { kod: 'ar', rakam: { ar: 'hindi' } };
      await DilServisi.kaydet('ar');
      expect(aktifRakamSistemi()).toBe('arab');
      expect(await DilServisi.rakamSecimi()).toBeNull();
    });
  });
});

