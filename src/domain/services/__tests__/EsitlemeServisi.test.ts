/**
 * Cihazlar arası eşitleme (issue #288) — motor ve kurulum.
 *
 * Sahte sağlayıcı bellekte tek bir metin tutar; "cihaz" bellekte bir YedekPayload'dır
 * ve gelen veriyi gerçek birleştirme kuralıyla (`birlestirNamazGunleri`, akıllı) alır.
 */
const mockRastgele = (n: number) => new Uint8Array(require('crypto').randomBytes(n));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  getRandomBytes: (n: number) => mockRastgele(n),
}));

const mockYerel = { deger: null as unknown };
jest.mock('../YedeklemeServisi', () => ({
  mevcutVeriyiTopla: jest.fn(async () => mockYerel.deger),
  planiDiskeYaz: jest.fn(async () => undefined),
}));

import naclUtil from 'tweetnacl-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { YedekPayload } from '../../../core/types';
import {
  EsitlemeHatasi,
  EsitlemeSaglayicisi,
  UzakKayit,
  UzakMeta,
} from '../../../core/esitleme/esitlemeTipleri';
import { KdfParametreleri, anahtarTuret } from '../../../core/esitleme/anahtarTuretme';
import { zarfiAyristir, zarfiAc, zarfOlustur } from '../../../core/esitleme/esitlemeZarfi';
import { icerikOzeti } from '../../../core/esitleme/esitlemeIcerigi';
import { birlestirNamazGunleri } from '../YedekBirlestirmeServisi';
import { EsitlemeOrtami, EsitlemeServisi, diskeUygula, esitlemeTuru } from '../EsitlemeServisi';
import { saglayicilariAyarla } from '../esitlemeSaglayicilari';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const KDF: KdfParametreleri = {
  ad: 'scrypt',
  N: 2 ** 10,
  r: 8,
  p: 1,
  tuz: naclUtil.encodeBase64(new Uint8Array(16).fill(5)),
};

class SahteSaglayici implements EsitlemeSaglayicisi {
  readonly kimlik = 'googleDrive' as const;
  readonly ad = 'Sahte';
  icerik: string | null = null;
  surum = 0;
  okumaSayisi = 0;
  yazmaSayisi = 0;
  agYok = false;
  oturum = true;
  yapilandirildiMi() {
    return true;
  }
  async oturumVarMi() {
    return this.oturum;
  }
  async baglan() {
    return true;
  }
  async baglantiyiKes() {
    this.oturum = false;
  }
  private kontrol() {
    if (this.agYok) throw new EsitlemeHatasi('agYok');
  }
  async meta(): Promise<UzakMeta | null> {
    this.kontrol();
    return this.icerik === null ? null : { etiket: String(this.surum) };
  }
  async oku(): Promise<UzakKayit | null> {
    this.kontrol();
    this.okumaSayisi++;
    return this.icerik === null ? null : { icerik: this.icerik, etiket: String(this.surum) };
  }
  async yaz(icerik: string): Promise<UzakMeta> {
    this.kontrol();
    this.yazmaSayisi++;
    this.icerik = icerik;
    this.surum++;
    return { etiket: String(this.surum) };
  }
  async sil() {
    this.kontrol();
    this.icerik = null;
  }
}

const bos = (): YedekPayload => ({
  namazGunleri: {},
  kilinanVakitler: {},
  seri: null,
  rozetler: [],
  seviye: null,
  bonusPuan: 0,
  istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
  kaza: null,
  kazaTempo: {},
  ayarlar: {},
});

/** Bellekte bir cihaz: akıllı (union) birleştirme. */
const cihaz = (baslangic: Partial<YedekPayload>) => {
  let durum: YedekPayload = { ...bos(), ...baslangic };
  return {
    al: () => durum,
    yerelTopla: async () => durum,
    uygula: jest.fn(async (gelen: YedekPayload) => {
      durum = {
        ...durum,
        namazGunleri: birlestirNamazGunleri('akilli', durum.namazGunleri, gelen.namazGunleri),
        bonusPuan: Math.max(durum.bonusPuan, gelen.bonusPuan),
      };
    }),
  };
};

let anahtar: Uint8Array;
beforeAll(async () => {
  anahtar = await anahtarTuret('ortak parola 2026', KDF);
});

const ortam = (s: EsitlemeSaglayicisi, c: ReturnType<typeof cihaz>, a?: Uint8Array): EsitlemeOrtami => ({
  saglayici: s,
  yerelTopla: c.yerelTopla,
  uygula: c.uygula,
  anahtarAl: async () => ({ tur: 'hazir', anahtar: a ?? anahtar, kdf: KDF }),
  simdi: () => new Date('2026-10-13T10:00:00Z'),
});

const uzaktakiIcerik = (s: SahteSaglayici, a = anahtar): YedekPayload => {
  const ayr = zarfiAyristir(s.icerik as string);
  if (ayr.tur !== 'gecerli') throw new Error('zarf yok');
  return JSON.parse(zarfiAc(ayr.zarf, a) as string);
};

describe('esitlemeTuru (motor)', () => {
  it('BOŞ uzak: yerel veri şifreli olarak yüklenir, ayarlar buluta GİTMEZ', async () => {
    const s = new SahteSaglayici();
    const c = cihaz({
      namazGunleri: { '2026-10-01': { Sabah: true } },
      ayarlar: { konum: { lat: 41 } },
    });
    const sonuc = await esitlemeTuru(ortam(s, c), { sonEtiket: null, sonOzet: null });
    expect(sonuc.sonuc).toEqual({ tur: 'yuklendi' });
    expect(sonuc.etiket).toBe('1');
    expect(s.icerik).not.toContain('Sabah');
    expect(uzaktakiIcerik(s).namazGunleri).toEqual({ '2026-10-01': { Sabah: true } });
    expect(uzaktakiIcerik(s).ayarlar).toEqual({});
  });

  it('UNION: iki cihaz birbirinin namazlarını alır, hiçbiri geri alınmaz; sonra iki taraf da güncel', async () => {
    const s = new SahteSaglayici();
    const telefon = cihaz({ namazGunleri: { '2026-10-01': { Sabah: true, Öğle: false } } });
    const tablet = cihaz({ namazGunleri: { '2026-10-01': { Öğle: true }, '2026-10-02': { Yatsı: true } } });
    const telefonDurumu = { sonEtiket: null as string | null, sonOzet: null as string | null };
    const tabletDurumu = { sonEtiket: null as string | null, sonOzet: null as string | null };

    const t1 = await esitlemeTuru(ortam(s, telefon), telefonDurumu);
    Object.assign(telefonDurumu, { sonEtiket: t1.etiket, sonOzet: t1.ozet });

    const t2 = await esitlemeTuru(ortam(s, tablet), tabletDurumu);
    expect(t2.sonuc).toEqual({ tur: 'indirildiVeYuklendi' });
    Object.assign(tabletDurumu, { sonEtiket: t2.etiket, sonOzet: t2.ozet });
    expect(tablet.al().namazGunleri).toEqual({
      '2026-10-01': { Sabah: true, Öğle: true },
      '2026-10-02': { Yatsı: true },
    });

    const t3 = await esitlemeTuru(ortam(s, telefon), telefonDurumu);
    expect(t3.sonuc).toEqual({ tur: 'indirildi' });
    Object.assign(telefonDurumu, { sonEtiket: t3.etiket, sonOzet: t3.ozet });
    expect(telefon.al().namazGunleri['2026-10-01']).toEqual({ Sabah: true, Öğle: true });

    // Yakınsadı: iki taraf da artık hiçbir şey yüklemez.
    const yazmaOncesi = s.yazmaSayisi;
    expect((await esitlemeTuru(ortam(s, telefon), telefonDurumu)).sonuc).toEqual({ tur: 'guncel' });
    expect((await esitlemeTuru(ortam(s, tablet), tabletDurumu)).sonuc).toEqual({ tur: 'guncel' });
    expect(s.yazmaSayisi).toBe(yazmaOncesi);
  });

  it('uzak ve yerel DEĞİŞMEDİYSE içerik indirilmez, yüklenmez', async () => {
    const s = new SahteSaglayici();
    const c = cihaz({ namazGunleri: { '2026-10-01': { Sabah: true } } });
    const ilk = await esitlemeTuru(ortam(s, c), { sonEtiket: null, sonOzet: null });
    const okuma = s.okumaSayisi;
    const yazma = s.yazmaSayisi;
    const sonuc = await esitlemeTuru(ortam(s, c), { sonEtiket: ilk.etiket!, sonOzet: ilk.ozet! });
    expect(sonuc.sonuc).toEqual({ tur: 'guncel' });
    expect(s.okumaSayisi).toBe(okuma);
    expect(s.yazmaSayisi).toBe(yazma);
  });

  it('uzak değişmedi ama yerel değişti: indirmeden yükler', async () => {
    const s = new SahteSaglayici();
    const c = cihaz({ namazGunleri: { '2026-10-01': { Sabah: true } } });
    const ilk = await esitlemeTuru(ortam(s, c), { sonEtiket: null, sonOzet: null });
    await c.uygula({ ...bos(), namazGunleri: { '2026-10-01': { Öğle: true } } });
    const okuma = s.okumaSayisi;
    const sonuc = await esitlemeTuru(ortam(s, c), { sonEtiket: ilk.etiket!, sonOzet: ilk.ozet! });
    expect(sonuc.sonuc).toEqual({ tur: 'yuklendi' });
    expect(s.okumaSayisi).toBe(okuma);
    expect(uzaktakiIcerik(s).namazGunleri['2026-10-01']).toEqual({ Sabah: true, Öğle: true });
  });

  it('AĞ YOK: sessiz hata kodu, hiçbir şey uygulanmaz', async () => {
    const s = new SahteSaglayici();
    s.agYok = true;
    const c = cihaz({});
    const sonuc = await esitlemeTuru(ortam(s, c), { sonEtiket: null, sonOzet: null });
    expect(sonuc.sonuc).toEqual({ tur: 'hata', kod: 'agYok' });
    expect(c.uygula).not.toHaveBeenCalled();
  });

  it('YANLIŞ parola (başka cihazda değişmiş): parolaYanlis, uzak EZİLMEZ', async () => {
    const s = new SahteSaglayici();
    s.icerik = zarfOlustur(JSON.stringify({ ...bos(), bonusPuan: 5 }), anahtar, KDF);
    s.surum = 1;
    const once = s.icerik;
    const yanlis = await anahtarTuret('başka parola 999', KDF);
    const c = cihaz({});
    const sonuc = await esitlemeTuru(ortam(s, c, yanlis), { sonEtiket: null, sonOzet: null });
    expect(sonuc.sonuc).toEqual({ tur: 'hata', kod: 'parolaYanlis' });
    expect(s.icerik).toBe(once);
    expect(c.uygula).not.toHaveBeenCalled();
  });

  it('BOZUK uzak kayıt: bozukVeri, üzerine YAZILMAZ', async () => {
    const s = new SahteSaglayici();
    s.icerik = 'çöp';
    s.surum = 3;
    const sonuc = await esitlemeTuru(ortam(s, cihaz({})), { sonEtiket: null, sonOzet: null });
    expect(sonuc.sonuc).toEqual({ tur: 'hata', kod: 'bozukVeri' });
    expect(s.icerik).toBe('çöp');
  });

  it('daha YENİ sürüm uzak kayıt: surumYeni, üzerine YAZILMAZ', async () => {
    const s = new SahteSaglayici();
    const yeni = JSON.parse(zarfOlustur('{}', anahtar, KDF));
    s.icerik = JSON.stringify({ ...yeni, surum: 99 });
    s.surum = 1;
    const once = s.icerik;
    const sonuc = await esitlemeTuru(ortam(s, cihaz({})), { sonEtiket: null, sonOzet: null });
    expect(sonuc.sonuc).toEqual({ tur: 'hata', kod: 'surumYeni' });
    expect(s.icerik).toBe(once);
  });

  it('anahtar arka planda türetilemiyorsa ertelendi (hata değil)', async () => {
    const s = new SahteSaglayici();
    s.icerik = zarfOlustur('{}', anahtar, KDF);
    s.surum = 1;
    const o = { ...ortam(s, cihaz({})), anahtarAl: async () => ({ tur: 'ertelendi' as const }) };
    expect((await esitlemeTuru(o, { sonEtiket: null, sonOzet: null })).sonuc).toEqual({ tur: 'ertelendi' });
  });

  it('parola cihazda yoksa parolaGerekli', async () => {
    const s = new SahteSaglayici();
    const o = { ...ortam(s, cihaz({})), anahtarAl: async () => ({ tur: 'parolaYok' as const }) };
    expect((await esitlemeTuru(o, { sonEtiket: null, sonOzet: null })).sonuc).toEqual({
      tur: 'hata',
      kod: 'parolaGerekli',
    });
  });
});

describe('EsitlemeServisi (kurulum, tur, kapatma)', () => {
  let s: SahteSaglayici;
  const secureStore = require('expo-secure-store');

  beforeEach(async () => {
    await AsyncStorage.clear();
    secureStore.__sifirla();
    s = new SahteSaglayici();
    saglayicilariAyarla([s]);
    mockYerel.deger = { ...bos(), namazGunleri: { '2026-10-01': { Sabah: true } } };
  });

  afterAll(() => saglayicilariAyarla(null));

  it('varsayılan KAPALI: tur hiçbir şey yapmaz', async () => {
    expect(await EsitlemeServisi.esitle({ uygula: jest.fn(), turetebilir: true })).toEqual({ tur: 'kapali' });
    expect(await EsitlemeServisi.arkaplandaEsitle()).toEqual({ tur: 'kapali' });
    expect(s.yazmaSayisi).toBe(0);
  });

  it('ilk kurulum: yeni tuz, ilk yükleme, durum diske yazılır; parola AsyncStorage/yedeğe GİRMEZ', async () => {
    const sonuc = await EsitlemeServisi.kur({
      kimlik: 'googleDrive',
      parola: 'çok gizli parola',
      mod: 'baslat',
      uygula: jest.fn(),
    });
    expect(sonuc).toEqual({ tur: 'yuklendi' });
    const durum = await EsitlemeServisi.durumuOku();
    expect(durum).toMatchObject({ aktif: true, saglayici: 'googleDrive', sonEtiket: '1', sonHata: null });
    expect(durum.sonEsitleme).not.toBeNull();
    const tumAnahtarlar = await AsyncStorage.getAllKeys();
    const tumDegerler = await AsyncStorage.multiGet(tumAnahtarlar);
    expect(JSON.stringify(tumDegerler)).not.toContain('çok gizli parola');
    expect(await secureStore.getItemAsync('namaz_esitleme_parola')).toBe('çok gizli parola');
  });

  it('ikinci cihaz YANLIŞ parolayla katılamaz; hiçbir şey kaydedilmez', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    await EsitlemeServisi.kapat({ uzaktakiniSil: false });
    s.oturum = true;
    const sonuc = await EsitlemeServisi.kur({
      kimlik: 'googleDrive',
      parola: 'yanlış parola!!',
      mod: 'baslat',
      uygula: jest.fn(),
    });
    expect(sonuc).toEqual({ tur: 'hata', kod: 'parolaYanlis' });
    expect((await EsitlemeServisi.durumuOku()).aktif).toBe(false);
    expect(await secureStore.getItemAsync('namaz_esitleme_parola')).toBeNull();
  });

  it('ikinci cihaz DOĞRU parolayla katılır ve uzaktakini uygular (union)', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    secureStore.__sifirla();
    await AsyncStorage.clear();
    mockYerel.deger = { ...bos(), namazGunleri: { '2026-10-05': { Akşam: true } } };
    const uygula = jest.fn(async (gelen: YedekPayload) => {
      const yerel = mockYerel.deger as YedekPayload;
      mockYerel.deger = {
        ...yerel,
        namazGunleri: birlestirNamazGunleri('akilli', yerel.namazGunleri, gelen.namazGunleri),
      };
    });
    const sonuc = await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula });
    expect(sonuc).toEqual({ tur: 'indirildiVeYuklendi' });
    expect(uygula).toHaveBeenCalledTimes(1);
  });

  it('parolayı unutan kullanıcı "sıfırla" ile uzaktakini silip yeni parolayla kurar', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    secureStore.__sifirla();
    const sonuc = await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'yepyeni parola 1', mod: 'sifirla', uygula: jest.fn() });
    expect(sonuc).toEqual({ tur: 'yuklendi' });
    const yeniAnahtar = await anahtarTuret('yepyeni parola 1', (zarfiAyristir(s.icerik!) as { zarf: { kdf: KdfParametreleri } }).zarf.kdf);
    expect(uzaktakiIcerik(s, yeniAnahtar).namazGunleri).toEqual({ '2026-10-01': { Sabah: true } });
  });

  it('ağ yokken tur sessiz hata kaydeder; arka plan fırlatmaz', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    s.agYok = true;
    expect(await EsitlemeServisi.arkaplandaEsitle()).toEqual({ tur: 'hata', kod: 'agYok' });
    expect((await EsitlemeServisi.durumuOku()).sonHata).toBe('agYok');
  });

  it('oturum düşmüşse yetkiYok', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    s.oturum = false;
    expect(await EsitlemeServisi.esitle({ uygula: jest.fn(), turetebilir: true })).toEqual({ tur: 'hata', kod: 'yetkiYok' });
  });

  it('eşzamanlı turlar TEK turu paylaşır (çift yükleme yok)', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    mockYerel.deger = { ...bos(), namazGunleri: { '2026-10-01': { Sabah: true, Öğle: true } } };
    const yazma = s.yazmaSayisi;
    const [a, b] = await Promise.all([
      EsitlemeServisi.esitle({ uygula: jest.fn(), turetebilir: true }),
      EsitlemeServisi.esitle({ uygula: jest.fn(), turetebilir: true }),
    ]);
    expect(a).toEqual(b);
    expect(s.yazmaSayisi).toBe(yazma + 1);
  });

  it('kapat: cihazdaki parola ve durum silinir; isteğe bağlı uzaktaki de', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    expect(await EsitlemeServisi.kapat({ uzaktakiniSil: true })).toEqual({ basarili: true });
    expect(s.icerik).toBeNull();
    expect(await secureStore.getItemAsync('namaz_esitleme_parola')).toBeNull();
    expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.ESITLEME_DURUMU)).toBeNull();
  });

  it('kapat: uzaktaki silinemezse hiçbir şey değişmez', async () => {
    await EsitlemeServisi.kur({ kimlik: 'googleDrive', parola: 'çok gizli parola', mod: 'baslat', uygula: jest.fn() });
    s.agYok = true;
    expect(await EsitlemeServisi.kapat({ uzaktakiniSil: true })).toEqual({ basarili: false, kod: 'agYok' });
    expect((await EsitlemeServisi.durumuOku()).aktif).toBe(true);
  });

  it('uzakDurumu ve baglan', async () => {
    expect(await EsitlemeServisi.uzakDurumu('googleDrive')).toEqual({ tur: 'yok' });
    expect(await EsitlemeServisi.uzakDurumu('icloud')).toEqual({ tur: 'hata', kod: 'yapilandirilmamis' });
    expect(await EsitlemeServisi.baglan('googleDrive')).toEqual({ tur: 'tamam' });
    s.agYok = true;
    expect(await EsitlemeServisi.uzakDurumu('googleDrive')).toEqual({ tur: 'hata', kod: 'agYok' });
  });

  it('diskeUygula ortak disk adımından (akıllı strateji) geçer', async () => {
    const { planiDiskeYaz } = require('../YedeklemeServisi');
    await diskeUygula({ ...bos(), namazGunleri: { '2026-10-09': { Sabah: true } } });
    const plan = (planiDiskeYaz as jest.Mock).mock.calls.at(-1)[0];
    expect(plan[`${DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK}2026-10-09`]).toEqual({ Sabah: true });
  });

  it('cihaza özgü ayarlar içerik özetini değiştirmez (her cihaz kendi ayarını korur)', () => {
    expect(icerikOzeti(bos())).toBe(icerikOzeti({ ...bos(), ayarlar: { x: 1 } }));
  });
});
