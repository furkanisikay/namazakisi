/**
 * Yeni özellik duyurusunun bu cihazda/build'de GÖSTERİLİP gösterilmeyeceği.
 *
 * `YeniOzellik.yetenek` saf kataloğa (`core/constants/YeniOzellikler.ts`) yalnız bir
 * ANAHTAR yazar; anahtarın platform/native karşılığı burada (sunum katmanında) çözülür
 * → çekirdek native köprüye bağımlı olmaz. Özelliği taşımayan cihaza duyuru
 * gösterilmez (ör. iPhone widget'ı Android'de ya da widget bayrağı kapalı iOS
 * build'inde).
 */
import { Platform } from 'react-native';
import type { YeniOzellik, YeniOzellikYetenegi } from '../../core/constants/YeniOzellikler';
import { canliEtkinlikDestekli, saatUygulamasiDestekli } from '../../../modules/expo-siri-kisayollari/src';
import { googleYetkisiKullanilabilirMi } from '../../../modules/expo-google-yetki/src';

const YETENEKLER: Record<YeniOzellikYetenegi, () => boolean> = {
  // iOS widget uzantısı + canlı etkinlik (#295): yalnız uzantıyı taşıyan iOS build'i.
  iosWidget: () => Platform.OS === 'ios' && canliEtkinlikDestekli(),
  // Apple Watch (#285): yalnız saat hedefini taşıyan iOS build'i (iPad'de de görünmez).
  appleWatch: () => Platform.OS === 'ios' && saatUygulamasiDestekli(),
  // Gerçek alarm (#74): Android'de her cihazda; iPhone'da sistem alarmı yalnız iOS 26+ (AlarmKit).
  // Sürüm okunamazsa gösterilmez.
  gercekAlarm: () => {
    if (Platform.OS === 'android') return true;
    if (Platform.OS !== 'ios') return false;
    const ana = parseInt(String(Platform.Version), 10);
    return Number.isFinite(ana) && ana >= 26;
  },
  // Drive eşitlemesi (#288): yalnız köprüyü taşıyan Android build'i + Google Play hizmetleri.
  googleDrive: () => Platform.OS === 'android' && googleYetkisiKullanilabilirMi(),
  // iPad düzeni: yalnız iPad'de (iPhone kullanıcısına tablet duyurusu gösterilmez).
  ipad: () => Platform.OS === 'ios' && (Platform as { isPad?: boolean }).isPad === true,
};

export function yeniOzellikGorunurMu(ozellik: YeniOzellik): boolean {
  // Önce platform: yalnız Android'e gelen özellik iPhone'da (ya da tersi) duyurulmaz.
  // Liste bozuk/boşsa duyuru gösterilmez (yanlış platforma duyuru, hiç duyurmamaktan kötü).
  const platformlar = ozellik.platformlar;
  if (!Array.isArray(platformlar) || !platformlar.some((p) => p === Platform.OS)) return false;
  if (!ozellik.yetenek) return true;
  try {
    return YETENEKLER[ozellik.yetenek]?.() === true;
  } catch {
    return false;
  }
}
