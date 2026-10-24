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
import { aktifDil, aktifDiliKur } from '../../core/dil/aktifDil';
import { cihazDilindenSec, DILLER, dilKoduMu, VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';

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
}

/** Kayıttaki dil yalnız SEÇİLEBİLİRSE geçerlidir (yedekten gelen yarım dil kendiliğinden açılmaz). */
const secilebilirKod = (x: unknown): DilKodu | null =>
  dilKoduMu(x) && DILLER.some((d) => d.kod === x && d.secilebilir) ? x : null;

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

async function diskten(): Promise<DilKodu> {
  try {
    const ham = await eskiKurulumGocu(await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI));
    const kod = secilebilirKod(ham?.kod) ?? cihazDilindenSec(cihazYerelAyari()) ?? VARSAYILAN_DIL;
    aktifDiliKur(kod);
  } catch (e) {
    Logger.warn('DilServisi', 'Dil ayarı okunamadı, Türkçe kullanılıyor', e);
  }
  anonsDiliniBildir(aktifDil());
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
    await Depolama.guncelle<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI, (m) => ({ ...kayitNesnesi(m), kod }));
    const degisti = aktifDiliKur(kod);
    yukleme = Promise.resolve(aktifDil());
    anonsDiliniBildir(aktifDil());
    return degisti;
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
