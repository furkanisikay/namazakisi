/**
 * Sade görünümde "dokununca sesli okuma" (issue #295).
 *
 * YENİ BAĞIMLILIK YOK — mevcut iki TTS yolundan biri kullanılır:
 *   - iOS (cihaz-içi anons modülü varsa): `anonsuKonus` hemen konuşur
 *     (`AVSpeechSynthesizer`, çevrimdışı).
 *   - Android: native `planlaAnons` → exact alarm → `AnonsReceiver` → TTS.
 *     Native tarafta "hemen konuş" API'si yoktur; kısa bir gecikmeyle tek atışlık
 *     alarm kurulur (muhafız önizlemesinin aynı deseni). SABİT kimlik: üst üste
 *     dokunuşta alarm çoğalmaz, değişir (`FLAG_UPDATE_CURRENT`); muhafız
 *     (`muhafiz_`) ve nafile (`nafile_`) önek iptalleriyle çakışmaz.
 *
 * Bilinen davranış: Android anonsu `USAGE_ALARM` ile konuşur (sessiz modda da
 * duyulur — kullanıcı dokunarak istediği için uygundur) ve Camideyim'de
 * camideyken konuşmaz (native `sessiz_bitis_ms` kapısı).
 *
 * Native çağrı UI'ı asla düşürmez → hata yutulup loglanır.
 */
import { Platform } from 'react-native';
import { planlaAnons } from '../../../modules/expo-countdown-notification/src';
import { anonsModuluVarMi, anonsuKonus, anonsuSustur } from '../../../modules/expo-muhafiz-anons/src';
import { Logger } from '../../core/utils/Logger';

/** Sade görünüm okumasının sabit anons kimliği. */
export const SADE_OKUMA_ANONS_ID = 'sade_gorunum_okuma';

/** Dokunuştan konuşmaya kadar bırakılan pay (Android exact alarm). */
export const SADE_OKUMA_GECIKMESI_MS = 300;

/** Bu cihazda dokununca sesli okuma yapılabilir mi? */
export function sesliOkumaDestekleniyorMu(): boolean {
  return anonsModuluVarMi() || Platform.OS === 'android';
}

/**
 * Metni okutur. Okuma başlatılabildiyse `true` (TTS paketinin cihazda olup
 * olmadığını bilemez — o soru `useTurkceTtsDestegi`'nindir).
 */
export function sesliOku(metin: string): boolean {
  const temiz = (metin ?? '').trim();
  if (!temiz) return false;

  if (anonsModuluVarMi()) {
    void anonsuSustur();
    void anonsuKonus(temiz);
    return true;
  }
  if (Platform.OS !== 'android') return false;

  try {
    planlaAnons(SADE_OKUMA_ANONS_ID, Date.now() + SADE_OKUMA_GECIKMESI_MS, temiz);
    return true;
  } catch (error) {
    Logger.error('SesliOkuma', 'Okuma planlanamadi:', error);
    return false;
  }
}
