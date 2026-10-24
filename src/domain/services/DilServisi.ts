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
import { cihazDilindenSec, dilKoduMu, VARSAYILAN_DIL, type DilKodu } from '../../core/dil/diller';

/** Diskteki kayıt: yalnız kullanıcının açık seçimi. */
export interface DilAyari {
  kod: DilKodu;
}

let yukleme: Promise<DilKodu> | null = null;

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

async function diskten(): Promise<DilKodu> {
  try {
    const ham = await Depolama.oku<DilAyari>(DEPOLAMA_ANAHTARLARI.DIL_AYARI);
    const kod = dilKoduMu(ham?.kod) ? ham.kod : (cihazDilindenSec(cihazYerelAyari()) ?? VARSAYILAN_DIL);
    aktifDiliKur(kod);
  } catch (e) {
    Logger.warn('DilServisi', 'Dil ayarı okunamadı, Türkçe kullanılıyor', e);
  }
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
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.DIL_AYARI, { kod } satisfies DilAyari);
    const degisti = aktifDiliKur(kod);
    yukleme = Promise.resolve(aktifDil());
    return degisti;
  },

  /** Testler için. */
  _sifirla(): void {
    yukleme = null;
  },
};
