/**
 * Arayüz dili — disk ↔ etkin durum köprüsü (`HesapAyariServisi` deseni).
 *
 * Kullanıcı seçtiyse o dil; seçmediyse cihaz dili yalnız SEÇİLEBİLİR bir dilse (yarım dil
 * kendiliğinden açılmaz); değilse Türkçe. Her JS giriş noktası metin üretmeden önce
 * `DilServisi.hazir()`'ı bekler. Store'a bağımlı değil.
 */
import { I18nManager, Platform, Settings } from 'react-native';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import {
  aktifDil,
  aktifDiliKur,
  aktifRakamSistemi,
  aktifVakitTakimi,
  aktifYaziSistemi,
  rakamSisteminiKur,
  vakitTakiminiKur,
  yaziSisteminiKur,
} from '../../core/dil/aktifDil';
import { cihazDilindenSec, DILLER, dilKoduMu, VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';
import { takimCoz, takimKimlikleri } from '../../core/dil/vakitTakimlari';
import { dilRakamVarsayilani, rakamSecilebilir, rakamSecimiGecerliMi, rakamSistemiCoz, type RakamSistemi } from '../../core/dil/rakam';
import { dilYaziVarsayilani, yaziSecilebilir, yaziSecimiGecerliMi, yaziSistemiCoz, type YaziSistemi } from '../../core/dil/yazi';
import { kayitliUlkeKodu } from '../../core/konum/ulkeTespiti';

/**
 * Diskteki kayıt. `kod` yalnız kullanıcının açık seçimidir (yoksa cihaz dili izlenir).
 * `ozelAnonsDili`: kullanıcının elle yazdığı sesli okuma metinlerinin varsayılan dili
 * (yoksa Türkçe — uygulama yalnız Türkçeyken yazılmışlardır); dil değişince sorulan
 * "değiştirilsin mi?" sorusu bu dile dönüşte SORULMAZ.
 */
export interface DilAyari {
  kod?: DilKodu;
  ozelAnonsDili?: DilKodu;
  /** Çok dil öncesi kurulum göçü yapıldı mı (bkz. `eskiKurulumGocu`). */
  goc?: 1;
  /**
   * Dil başına vakit adı takımının AÇIK seçimi (`core/dil/vakitTakimlari`). Yoksa ülke
   * varsayılanı izlenir; dil değişince her dilin seçimi korunur.
   */
  vakitTakimi?: Partial<Record<DilKodu, string>>;
  /**
   * Dil başına rakam sisteminin AÇIK seçimi (`core/dil/rakam`; yerel rakamlı dillerde: Arapça,
   * Bengalce). Yoksa ülke varsayılanı (Arapçada Mağrip Batı rakamı) ya da dilin varsayılanı.
   */
  rakam?: Partial<Record<DilKodu, RakamSistemi>>;
  /**
   * Dil başına alfabenin AÇIK seçimi (`core/dil/yazi`; iki alfabeli dillerde: Özbekçe, Kazakça).
   * Yoksa ülke varsayılanı ya da dilin varsayılanı (Özbekçe Latin, Kazakça Kiril). Native yüzeyler
   * bu seçimi İZLEMEZ (dilin varsayılan yazısıyla yazılır; `docs/ajan/coklu-dil.md > Alfabe`).
   */
  yazi?: Partial<Record<DilKodu, YaziSistemi>>;
}

/** `__DEV__` (Metro/jest tanımlar); tanımsızsa üretim sayılır. */
const gelistirmeDerlemesi = (): boolean => typeof __DEV__ !== 'undefined' && __DEV__ === true;

/**
 * Kayıttaki dil yalnız SEÇİLEBİLİRSE geçerlidir (yedekten gelen yarım dil kendiliğinden açılmaz).
 * İSTİSNA: geliştirme derlemesi (`__DEV__`) ya da kare hattı işareti (`KARE_TURU`) varken kapalı
 * dil (ör. Arapça) kayıttan kurulabilir. Kare hattı JS geliştirme modunu KAPATIR
 * (`js_dev_mode_debug=false`, temiz kare), bu yüzden `__DEV__` orada yanlıştır; işareti yalnız
 * tohum yazar ve yedekten geri gelmez. Cihaz dili kapalı dili hiçbir durumda açmaz.
 */
const secilebilirKod = (x: unknown, kapaliAcik = false): DilKodu | null =>
  dilKoduMu(x) && DILLER.some((d) => d.kod === x && (d.secilebilir || kapaliAcik || gelistirmeDerlemesi())) ? x : null;

/** Kare hattı işareti okunur; okunamazsa `false`. */
async function kareTuruMu(): Promise<boolean> {
  try {
    return (await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.KARE_TURU)) === true;
  } catch {
    return false;
  }
}

let yukleme: Promise<DilKodu> | null = null;

/** Bozuk kayıt (dizi, sayı) boş nesne sayılır; bilinmeyen alanlar korunur. */
const kayitNesnesi = (m: DilAyari | null): DilAyari =>
  m && typeof m === 'object' && !Array.isArray(m) ? { ...m } : {};

/** Cihazın yerel ayar kimliği ("en_US"); okunamazsa null. Native modül yoksa (jest) sessiz. */
export function cihazYerelAyari(): string | null {
  try {
    if (Platform.OS === 'ios') {
      // `NativeModules.SettingsManager` New Architecture'da güvenilmez; `Settings` kararlı yol.
      // Cihazda DOĞRULANMADI.
      const diller = Settings.get('AppleLanguages') as string[] | undefined;
      return diller?.[0] ?? (Settings.get('AppleLocale') as string | undefined) ?? null;
    }
    const sabitler = (I18nManager as unknown as { getConstants?: () => { localeIdentifier?: string } }).getConstants?.();
    return sabitler?.localeIdentifier ?? null;
  } catch {
    return null;
  }
}

/**
 * Etkin dili native tarafa bildirir: arayüz dili (Android `namazakisi_dil/kod`, iOS App Group
 * `namazakisi_dil_kod`) ve sesli okuma dili (planlı anonslar konuşma anında okur). Native köprü TEMBEL yüklenir (jest'te yok);
 * eski native'de fonksiyon yoksa atlanır ve anons Türkçe konuşur. Asla fırlatmaz.
 */
function anonsDiliniBildir(kod: DilKodu): void {
  const tts = DILLER.find((d) => d.kod === kod)?.ttsDili ?? 'tr-TR';
  try {
    // Arayüz dili (widget, native bildirim, saat köprüsü) — sesli okuma dilinden AYRI anahtar.
    (require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src')).arayuzDiliniAyarla(kod);
    (require('../../../modules/expo-siri-kisayollari/src') as typeof import('../../../modules/expo-siri-kisayollari/src')).arayuzDiliniAyarla(kod);
  } catch {
    // Köprü yok (test/eski sürüm): native metinler Türkçe kalır.
  }
  try {
    (require('../../../modules/expo-countdown-notification/src') as typeof import('../../../modules/expo-countdown-notification/src')).anonsDiliniAyarla(tts);
    (require('../../../modules/expo-muhafiz-anons/src') as typeof import('../../../modules/expo-muhafiz-anons/src')).anonsDiliniAyarla(tts);
  } catch {
    // Köprü yok (test/eski sürüm): sesli okuma varsayılan dilde kalır.
  }
}

/**
 * BİR KEZ: dil seçimi gelmeden önce kurulmuş uygulamada dil kaydı yoktur. Cihaz dili İngilizce
 * olan mevcut kullanıcı güncellemeden sonra uygulamayı kendiliğinden İngilizce görmesin (sessiz
 * sapma yok): kurulum sihirbazı DAHA ÖNCE bitmişse Türkçe açıkça kaydedilir. Yeni kurulumda
 * (sihirbaz bitmemiş) yalnız göç işareti yazılır; cihaz dili izlenmeye devam eder.
 */
async function eskiKurulumGocu(ham: DilAyari | null): Promise<DilAyari | null> {
  if (ham && typeof ham === 'object' && ham.goc === 1) return ham;
  const eskiKurulum = (await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI)) != null;
  return Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => {
    const k = kayitNesnesi(m);
    return { ...k, ...(eskiKurulum && !dilKoduMu(k.kod) ? { kod: VARSAYILAN_DIL } : {}), goc: 1 };
  });
}

/** Kayıtlı konumun ülkesi (ham depolamadan; arka planda store yok). Okunamazsa null. */
async function kayitliUlke(): Promise<string | null> {
  try {
    const konum = await Depolama.oku<Parameters<typeof kayitliUlkeKodu>[0]>(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
    return konum && typeof konum === 'object' ? kayitliUlkeKodu(konum) : null;
  } catch {
    return null;
  }
}

/**
 * Takımın adlarını native'e iter (widget, native bildirim, kısayol); `null` = dil tablosu.
 * Eski native'de fonksiyon yoksa atlanır. Asla fırlatmaz.
 */
function vakitAdlariniBildir(): void {
  const takim = aktifVakitTakimi();
  const json = takim ? JSON.stringify(takim.adlar) : null;
  for (const yukle of [
    () => require('../../../modules/expo-countdown-notification/src'),
    () => require('../../../modules/expo-siri-kisayollari/src'),
  ]) {
    try {
      (yukle() as { vakitAdlariniAyarla?: (j: string | null) => void }).vakitAdlariniAyarla?.(json);
    } catch {
      // Köprü yok (test/eski sürüm): native adlar dil tablosundan gelir.
    }
  }
}

/**
 * Etkin rakam sistemini native'e iter (Android `namazakisi_dil/rakam_sistemi`, iOS App Group
 * `namazakisi_rakam_sistemi`): yerel rakamsa sistemin CLDR adı (`'arab'`, `'arabext'`, `'beng'`), Batıysa
 * `null` (anahtar silinir). Native yüzeyler (widget, bildirim, canlı etkinlik, Siri) kaydı yalnız
 * arayüz dilinin KENDİ yerel sistemiyle eşleşirse uygular (Arapçada ve Soranîde `arab`, Farsça ve Peştucada `arabext`, Bengalcede `beng`).
 * Eski native'de fonksiyon yoksa atlanır.
 */
function rakamSisteminiBildir(): void {
  const sistem = aktifRakamSistemi();
  const kod = sistem === 'latn' ? null : sistem;
  for (const yukle of [
    () => require('../../../modules/expo-countdown-notification/src'),
    () => require('../../../modules/expo-siri-kisayollari/src'),
  ]) {
    try {
      (yukle() as { rakamSisteminiAyarla?: (k: string | null) => void }).rakamSisteminiAyarla?.(kod);
    } catch {
      // Köprü yok (test/eski sürüm): native yüzeyler Batı rakamı yazar.
    }
  }
}

/**
 * Etkin dilin vakit adı takımını, rakam sistemini ve alfabesini kayıttan ve konumun ülkesinden
 * çözüp kurar. Asla fırlatmaz.
 */
async function takimiKur(ham?: DilAyari | null): Promise<void> {
  const dil = aktifDil();
  try {
    const kayit = kayitNesnesi((ham === undefined ? await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI) : ham) ?? null);
    const ulke = await kayitliUlke();
    vakitTakiminiKur(takimCoz(dil, kayit.vakitTakimi?.[dil], ulke));
    rakamSisteminiKur(rakamSistemiCoz(dil, kayit.rakam?.[dil], ulke));
    yaziSisteminiKur(yaziSistemiCoz(dil, kayit.yazi?.[dil], ulke));
  } catch (e) {
    Logger.warn('DilServisi', 'Vakit adı takımı / rakam sistemi / alfabe çözülemedi, varsayılanlar kullanılıyor', e);
    vakitTakiminiKur(null);
    rakamSisteminiKur(dilRakamVarsayilani(dil));
    yaziSisteminiKur(dilYaziVarsayilani(dil));
  }
  vakitAdlariniBildir();
  rakamSisteminiBildir();
}

async function diskten(): Promise<DilKodu> {
  let ham: DilAyari | null = null;
  try {
    ham = await eskiKurulumGocu(await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI));
    const kareTuru = ham?.kod != null && !secilebilirKod(ham.kod) ? await kareTuruMu() : false;
    const kod = secilebilirKod(ham?.kod, kareTuru) ?? cihazDilindenSec(cihazYerelAyari()) ?? VARSAYILAN_DIL;
    aktifDiliKur(kod);
    Logger.info('DilServisi', `Dil ${kod} (kayıt: ${String(ham?.kod ?? '-')}, kare turu: ${kareTuru})`);
  } catch (e) {
    Logger.warn('DilServisi', 'Dil ayarı okunamadı, Türkçe kullanılıyor', e);
  }
  anonsDiliniBildir(aktifDil());
  await takimiKur(ham);
  return aktifDil();
}

export const DilServisi = {
  /** Diski okur ve etkin dili kurar. `zorla` olmadan süreç başına bir kez. */
  yukle(zorla = false): Promise<DilKodu> {
    if (!yukleme || zorla) yukleme = diskten();
    return yukleme;
  },

  /** Giriş noktalarının beklediği kapı. ASLA reddetmez. */
  async hazir(): Promise<void> {
    await DilServisi.yukle();
  },

  /** Kullanıcının seçimini kaydeder ve kurar; dil değiştiyse `true`. */
  async kaydet(kod: DilKodu): Promise<boolean> {
    const ham = await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => ({ ...kayitNesnesi(m), kod }));
    const degisti = aktifDiliKur(kod);
    anonsDiliniBildir(aktifDil());
    await takimiKur(ham);
    yukleme = Promise.resolve(aktifDil());
    return degisti;
  },

  /**
   * Etkin dilin vakit adı takımının açık seçimi; `null` = otomatik (ülkeye göre). Geçersiz kimlik
   * kaydedilmez. Kurulan takım değiştiyse `true` (çağıran planları `konumDegistiUygula` ile yeniler).
   */
  async vakitTakimiKaydet(id: string | null): Promise<boolean> {
    const dil = aktifDil();
    if (id !== null && !takimKimlikleri(dil).includes(id)) return false;
    const onceki = aktifVakitTakimi()?.id ?? null;
    const ham = await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => {
      const k = kayitNesnesi(m);
      const { [dil]: _eski, ...digerleri } = k.vakitTakimi && typeof k.vakitTakimi === 'object' ? k.vakitTakimi : {};
      return { ...k, vakitTakimi: id === null ? digerleri : { ...digerleri, [dil]: id } };
    });
    await takimiKur(ham);
    return (aktifVakitTakimi()?.id ?? null) !== onceki;
  },

  /** Etkin dilin vakit adı takımının açık seçimi (`null` = otomatik). ASLA reddetmez. */
  async vakitTakimiSecimi(): Promise<string | null> {
    try {
      const secim = kayitNesnesi(await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI)).vakitTakimi?.[aktifDil()];
      return typeof secim === 'string' && takimKimlikleri(aktifDil()).includes(secim) ? secim : null;
    } catch {
      return null;
    }
  },

  /**
   * Etkin dilin rakam sisteminin açık seçimi; `null` = otomatik (ülkeye göre). Yerel rakamı
   * olmayan dilde ve dile ait olmayan değerde (Bengalcede `arab`) kaydedilmez. Kurulan sistem değiştiyse `true`.
   */
  async rakamKaydet(secim: RakamSistemi | null): Promise<boolean> {
    const dil = aktifDil();
    if (!rakamSecilebilir(dil) || (secim !== null && !rakamSecimiGecerliMi(dil, secim))) return false;
    const onceki = aktifRakamSistemi();
    const ham = await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => {
      const k = kayitNesnesi(m);
      const { [dil]: _eski, ...digerleri } = k.rakam && typeof k.rakam === 'object' ? k.rakam : {};
      return { ...k, rakam: secim === null ? digerleri : { ...digerleri, [dil]: secim } };
    });
    await takimiKur(ham);
    return aktifRakamSistemi() !== onceki;
  },

  /**
   * Etkin dilin alfabesinin açık seçimi; `null` = otomatik (ülkeye göre). Alfabe seçimi olmayan
   * dilde ve dile ait olmayan değerde kaydedilmez. Kurulan yazı değiştiyse `true` (metin değişir:
   * çağıran planları `konumDegistiUygula` ile yeniler).
   */
  async yaziKaydet(secim: YaziSistemi | null): Promise<boolean> {
    const dil = aktifDil();
    if (!yaziSecilebilir(dil) || (secim !== null && !yaziSecimiGecerliMi(dil, secim))) return false;
    const onceki = aktifYaziSistemi();
    const ham = await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => {
      const k = kayitNesnesi(m);
      const { [dil]: _eski, ...digerleri } = k.yazi && typeof k.yazi === 'object' ? k.yazi : {};
      return { ...k, yazi: secim === null ? digerleri : { ...digerleri, [dil]: secim } };
    });
    await takimiKur(ham);
    return aktifYaziSistemi() !== onceki;
  },

  /** Etkin dilin alfabesinin açık seçimi (`null` = otomatik). ASLA reddetmez. */
  async yaziSecimi(): Promise<YaziSistemi | null> {
    try {
      const secim = kayitNesnesi(await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI)).yazi?.[aktifDil()];
      return yaziSecimiGecerliMi(aktifDil(), secim) ? secim : null;
    } catch {
      return null;
    }
  },

  /** Etkin dilin rakam sisteminin açık seçimi (`null` = otomatik). ASLA reddetmez. */
  async rakamSecimi(): Promise<RakamSistemi | null> {
    try {
      const secim = kayitNesnesi(await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI)).rakam?.[aktifDil()];
      return rakamSecimiGecerliMi(aktifDil(), secim) ? secim : null;
    } catch {
      return null;
    }
  },

  /**
   * Konum (ülke) değişince ülke varsayılanını yeniden çözer. Konum yayma noktasının
   * (`konumDegistiUygula`) İLK adımıdır: metin üreten tüketicilerden önce koşar. Asla fırlatmaz.
   */
  async vakitTakiminiYenile(): Promise<void> {
    await DilServisi.hazir();
    await takimiKur();
  },

  /** Kullanıcının açık bir seçimi var mı (yoksa cihaz dili izlenir)? Okunamazsa `false`. */
  async secimVar(): Promise<boolean> {
    try {
      const ham = await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI);
      return dilKoduMu(ham?.kod);
    } catch {
      return false;
    }
  },

  /** Açık seçimi siler: cihaz dili (seçilebilirse) ya da Türkçe kurulur. Dil değiştiyse `true`. */
  async cihazDilineDon(): Promise<boolean> {
    const onceki = aktifDil();
    await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => {
      const { kod: _kod, ...kalan } = kayitNesnesi(m);
      return kalan;
    });
    const kod = await DilServisi.yukle(true);
    return kod !== onceki;
  },

  /** Elle yazılmış sesli okuma metinlerinin varsayılan dili (yoksa Türkçe). ASLA reddetmez. */
  async ozelAnonsDili(): Promise<DilKodu> {
    try {
      const ham = await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI);
      return dilKoduMu(ham?.ozelAnonsDili) ? ham.ozelAnonsDili : VARSAYILAN_DIL;
    } catch {
      return VARSAYILAN_DIL;
    }
  },

  async ozelAnonsDiliniKaydet(kod: DilKodu): Promise<void> {
    await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => ({ ...kayitNesnesi(m), ozelAnonsDili: kod }));
  },

  /** Testler için. */
  _sifirla(): void {
    yukleme = null;
  },
};
