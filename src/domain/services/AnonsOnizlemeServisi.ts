/**
 * Sesli anons ONIZLEMESI (Faz 5) — kullanici "Dinle" dedigi anda metni okutur.
 *
 * Native taraf yalniz ZAMANLANMIS anons sunar (exact alarm -> AnonsReceiver ->
 * TTS); "hemen konus" API'si yok. Bu yuzden onizleme, ~1 sn sonrasina planlanan
 * tek atislik bir alarmdir.
 *
 * CAKISMA YOK — id SABIT ve muhafiz id uzayindan AYRI:
 *   - Gercek anons id'leri `muhafiz_<tarih>_vakit_<vakit>_seviye_<n>_dakika_<dk>`
 *     formatindadir; sabit onizleme id'si bunlarin hicbirine esit olamaz.
 *   - Ayni id ile ikinci `planlaAnons` cagrisi (kullanici ust uste "Dinle"ye
 *     basarsa) `FLAG_UPDATE_CURRENT` sayesinde mevcut alarmi DEGISTIRIR, yenisini
 *     EKLEMEZ -> ust uste konusma olmaz.
 *
 * Native cagri asla UI'i dusurmemeli -> hata yutulup loglanir.
 */
import { planlaAnons } from '../../../modules/expo-countdown-notification/src';
import { Logger } from '../../core/utils/Logger';

/** Onizleme anonslarinin sabit kimligi (gercek muhafiz id'leriyle carpismaz). */
export const ONIZLEME_ANONS_ID = 'muhafiz_anons_onizleme';

/** Kullanici butona bastiktan sonra konusmaya kadar birakilan pay. */
export const ONIZLEME_GECIKMESI_MS = 900;

/**
 * Verilen (yer tutuculari COZULMUS) metni kisa bir gecikmeyle okutur.
 * Bos metin sessizce yok sayilir.
 */
export function anonsuOnizle(cozulmusMetin: string): void {
    if (!cozulmusMetin || cozulmusMetin.trim().length === 0) return;

    try {
        planlaAnons(ONIZLEME_ANONS_ID, Date.now() + ONIZLEME_GECIKMESI_MS, cozulmusMetin);
    } catch (error) {
        Logger.error('AnonsOnizleme', 'Onizleme anonsu planlanamadi:', error);
    }
}
