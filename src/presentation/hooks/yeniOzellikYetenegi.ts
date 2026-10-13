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
import { canliEtkinlikDestekli } from '../../../modules/expo-siri-kisayollari/src';

const YETENEKLER: Record<YeniOzellikYetenegi, () => boolean> = {
  // iOS widget uzantısı + canlı etkinlik (#295): yalnız uzantıyı taşıyan iOS build'i.
  iosWidget: () => Platform.OS === 'ios' && canliEtkinlikDestekli(),
};

export function yeniOzellikGorunurMu(ozellik: YeniOzellik): boolean {
  if (!ozellik.yetenek) return true;
  try {
    return YETENEKLER[ozellik.yetenek]?.() === true;
  } catch {
    return false;
  }
}
