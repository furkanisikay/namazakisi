/**
 * Muhafiz adimi ONIZLEMESI (Faz 5) — kullanici "Dinle" dedigi anda o adim
 * GERCEKTE nasil duyulacaksa oyle calinir.
 *
 * Iki ayri ses yolu vardir ve mod hangilerini kullanacagini belirler:
 *   - BILDIRIM SESI -> `OnizlemeSesServisi` (uygulama ici, expo-audio; gercek
 *     bildirim GONDERILMEZ — aninda duyulur, bildirim golgeligi kirlenmez,
 *     sessiz modda bile calisir).
 *   - SESLI ANONS (TTS) -> native `planlaAnons`. Native taraf yalniz ZAMANLANMIS
 *     anons sunar (exact alarm -> AnonsReceiver -> TTS); "hemen konus" API'si
 *     yok. Bu yuzden onizleme, kisa bir sure sonrasina planlanan tek atislik bir
 *     alarmdir.
 *
 * `ikisi` modunda sira GERCEK AKISLA AYNIDIR: once bildirim sesi, ardindan
 * anons. TTS gecikmesi bu durumda bilincli olarak uzatilir ki bildirim sesi
 * anonsun altinda kalmasin.
 *
 * CAKISMA YOK — TTS id'si SABIT ve muhafiz id uzayindan AYRI:
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
import { sesliAnonsGerekliMi } from '../../core/muhafiz/motorAdaptoru';
import type { UyariModu } from '../../core/muhafiz/matrisTipleri';
import { OnizlemeSesServisi } from './OnizlemeSesServisi';

/** Onizleme anonslarinin sabit kimligi (gercek muhafiz id'leriyle carpismaz). */
export const ONIZLEME_ANONS_ID = 'muhafiz_anons_onizleme';

/** Kullanici butona bastiktan sonra konusmaya kadar birakilan pay. */
export const ONIZLEME_GECIKMESI_MS = 900;

/**
 * `ikisi` modunda TTS gecikmesi: bildirim sesi once duyulsun, anons onun
 * uzerine binmesin. Palet sesleri kisa (~1-2 sn) oldugu icin bu pay yeterlidir.
 */
export const BILDIRIM_SONRASI_ANONS_GECIKMESI_MS = 1800;

/** Mod bildirim sesi calmali mi? (`BILDIRIMLI_MODLAR`nin domain ikizi) */
function bildirimSesiGerekliMi(mod: UyariModu): boolean {
    return mod === 'bildirim' || mod === 'ikisi';
}

/**
 * Verilen (yer tutuculari COZULMUS) metni kisa bir gecikmeyle okutur.
 * Bos metin sessizce yok sayilir.
 */
export function anonsuOnizle(
    cozulmusMetin: string,
    gecikmeMs: number = ONIZLEME_GECIKMESI_MS
): void {
    if (!cozulmusMetin || cozulmusMetin.trim().length === 0) return;

    try {
        planlaAnons(ONIZLEME_ANONS_ID, Date.now() + gecikmeMs, cozulmusMetin);
    } catch (error) {
        Logger.error('AnonsOnizleme', 'Onizleme anonsu planlanamadi:', error);
    }
}

export interface AdimOnizlemeGirdisi {
    mod: UyariModu;
    /** Ses kimligi ('varsayilan' | 'content://...') */
    bildirimSesi: string;
    /** Yer tutuculari COZULMUS anons metni ('sesli'/'ikisi' disinda kullanilmaz) */
    cozulmusMetin: string;
}

/**
 * Bir adimi moduna gore onizler:
 *   sessiz   -> hicbir sey
 *   bildirim -> yalniz bildirim sesi
 *   sesli    -> yalniz TTS
 *   ikisi    -> once bildirim sesi, sonra TTS
 *
 * `sesli`/`ikisi` olsa bile anons metni BOSSA konusma yapilmaz (gercek akisla
 * ayni: bos metin okunmaz) — bu durumda `ikisi` yalniz bildirim sesi calar ve
 * TTS gecikmesi de gereksiz yere uzatilmaz.
 */
export function adimiOnizle({ mod, bildirimSesi, cozulmusMetin }: AdimOnizlemeGirdisi): void {
    if (mod === 'sessiz') return;

    const bildirimVar = bildirimSesiGerekliMi(mod);
    const anonsVar = sesliAnonsGerekliMi(mod) && cozulmusMetin.trim().length > 0;

    if (bildirimVar) {
        // Yangin-ve-unut: servis kendi hatalarini yutar, reddetmez.
        void OnizlemeSesServisi.bildirimSesiniCal(bildirimSesi);
    }

    if (anonsVar) {
        anonsuOnizle(
            cozulmusMetin,
            bildirimVar ? BILDIRIM_SONRASI_ANONS_GECIKMESI_MS : ONIZLEME_GECIKMESI_MS
        );
    }
}
