/**
 * UYGULAMA ICI bildirim sesi calar — secili sesin TEK calma noktasi.
 *
 * IKI CAGIRAN:
 *  1. Muhafiz "Dinle" / akis onizlemesi (ekran).
 *  2. ON PLAN MUHAFIZ BANNER'I (`AnaSayfa`) — uygulama acikken de kullanicinin
 *     SECTIGI ses duyulmali. Once burada paketlenmis `bildirim.mp3` calan
 *     `SesServisi.bildirimSesiCal()` vardi: ayni adim uygulama acikken varsayilan
 *     can, kapaliyken (kanal sesi) secilen ses ile duyuluyordu.
 *
 * NEDEN GERCEK BILDIRIM GONDERILMIYOR: onizleme aninda duyulmali, bildirim
 * golgeligini kirletmemeli ve cihaz sessiz moddayken bile calismalidir. Bu
 * yuzden ses `expo-audio` ile UYGULAMA ICINDEN calinir; hicbir bildirim
 * planlanmaz/gonderilmez.
 *
 * TEKILLIK: tek bir calar tutulur. Kullanici "Dinle"ye ust uste basarsa ses
 * ust uste BINMEZ — mevcut calar basa sarilir. Kaynak degisirse eski calar
 * `release()` ile birakilir (bellek sizintisi yok).
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import {
    sesDosyasiniCoz,
    ozelSesOnizlemesiMi,
    type SesKaynagi,
} from '../../core/muhafiz/sesDosyasi';
import { Logger } from '../../core/utils/Logger';
import {
    sesiOnizle as nativeSesiOnizle,
    onizlemeyiDurdur as nativeOnizlemeyiDurdur,
    onizlemeCaliyorMu as nativeOnizlemeCaliyorMu,
} from '../../../modules/expo-countdown-notification/src';

/** Onizleme bilincli bir aksiyondur → geri bildirim seslerinden yuksek calinir. */
export const ONIZLEME_SES_SEVIYESI = 0.9;

/**
 * Ses bitisini beklerken asilmamak icin UST SINIR. Kullanici bir albüm parcasi
 * secmis olabilir; anonsu dakikalarca bekletmek kabul edilemez.
 */
export const BEKLEME_UST_SINIRI_MS = 8000;

/** Bitis yoklama araligi (calma baslamasi da bu kadar beklenir). */
const YOKLAMA_ARALIGI_MS = 200;

const bekle = (ms: number): Promise<void> => new Promise((coz) => setTimeout(coz, ms));

let aktifCalar: AudioPlayer | null = null;
let aktifKaynak: SesKaynagi | null = null;
let sesModuHazirlandi = false;

/**
 * Sessiz modda da duyulsun diye ses modunu bir kez ayarlar.
 * `FeedbackContext` acilista zaten ayni ayari yapar; burasi ekran dogrudan
 * acildiginda (feedback hazirlanmamissa) guvenlik agidir. Beklenmez — butonun
 * anlik hissi bozulmasin.
 */
function sesModunuHazirla(): void {
    if (sesModuHazirlandi) return;
    sesModuHazirlandi = true;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch((error) => {
        Logger.debug('OnizlemeSes', 'Ses modu ayarlanamadi:', error);
    });
}

/** Mevcut calari serbest birakir (idempotent). */
function calariBirak(): void {
    if (!aktifCalar) return;
    try {
        aktifCalar.release();
    } catch {
        // Zaten birakilmis olabilir — onizleme icin onemsiz.
    }
    aktifCalar = null;
    aktifKaynak = null;
}

/** Istenen kaynak icin calar dondurur; kaynak degistiyse eskisini birakir. */
function calariAl(kaynak: SesKaynagi): AudioPlayer | null {
    if (aktifCalar && aktifKaynak === kaynak) return aktifCalar;

    calariBirak();
    try {
        aktifCalar = createAudioPlayer(kaynak);
        aktifKaynak = kaynak;
        return aktifCalar;
    } catch (error) {
        Logger.debug('OnizlemeSes', 'Ses calar olusturulamadi:', error);
        aktifCalar = null;
        aktifKaynak = null;
        return null;
    }
}

export const OnizlemeSesServisi = {
    /**
     * Secili bildirim sesini bastan calar.
     * Ses calinamazsa sessizce vazgecer — onizleme UI'i asla dusurmemeli.
     *
     * IKI YOL (bilincli ayrik):
     *  - `content://...` (kullanicinin sistem seciciden sectigi ses) → NATIVE
     *    `RingtoneManager`. `expo-audio`'nun bu semayi calabildigi DOGRULANMADI;
     *    native yol garantilidir.
     *  - Paketlenmis varsayilan → mevcut `expo-audio` yolu (sessiz modda da calar).
     */
    bildirimSesiniCal: async (sesId: string): Promise<void> => {
        if (ozelSesOnizlemesiMi(sesId)) {
            try {
                // expo-audio calari elde tutmanin anlami yok; native taraf kendi
                // tekilligini saglar (onceki onizlemeyi durdurur).
                calariBirak();
                await nativeSesiOnizle(sesId);
            } catch (error) {
                Logger.debug('OnizlemeSes', 'Ozel ses calinamadi:', error);
            }
            return;
        }

        try {
            sesModunuHazirla();

            const calar = calariAl(sesDosyasiniCoz(sesId));
            if (!calar) return;

            // Ust uste basma: calan sesi durdur ve HER durumda basa sar —
            // aksi halde bitmis ses son konumunda kalir ve `play()` sessiz gecer.
            if (calar.playing) calar.pause();
            await calar.seekTo(0);
            calar.volume = ONIZLEME_SES_SEVIYESI;
            calar.play();
        } catch (error) {
            Logger.debug('OnizlemeSes', 'Bildirim sesi calinamadi:', error);
        }
    },

    /**
     * Calan onizlemenin BITMESINI bekler (ust sinirli).
     *
     * NEDEN: `ikisi` modunda once bildirim sesi calinir, sonra TTS konusur. Eskiden
     * araya SABIT bir pay (1,8 sn) konuyordu ve gerekcesi "palet sesleri kisa
     * (~1-2 sn)" idi — ama SABIT PALET KALDIRILDI; artik ses kullanicinin sistem
     * seciciden sectigi RASTGELE UZUNLUKTA bir dosyadir. 3 dakikalik bir muzik
     * secildiginde anons sesin ustune biniyordu.
     *
     * Bitis her iki yolda da YOKLANIR (native `Ringtone.isPlaying` / expo-audio
     * `playing`), ama bekleme `BEKLEME_UST_SINIRI_MS` ile tavanlanir: uzun ses
     * secen kullanici anonsu kaybetmez, yalnizca ustune binmemis olur.
     */
    bitisiniBekle: async (sesId: string): Promise<void> => {
        const bitis = Date.now() + BEKLEME_UST_SINIRI_MS;
        const ozel = ozelSesOnizlemesiMi(sesId);

        // Calmanin baslamasi icin bir tur bekle; aksi halde henuz baslamamis sesi
        // "bitmis" sanip aninda donebiliriz.
        await bekle(YOKLAMA_ARALIGI_MS);

        while (Date.now() < bitis) {
            try {
                const caliyor = ozel ? await nativeOnizlemeCaliyorMu() : !!aktifCalar?.playing;
                if (!caliyor) return;
            } catch (error) {
                Logger.debug('OnizlemeSes', 'Ses durumu okunamadi:', error);
                return;
            }
            await bekle(YOKLAMA_ARALIGI_MS);
        }
    },

    /** Ekran kapanirken cagrilir — her iki yolun da calan sesini birakir. */
    temizle: (): void => {
        calariBirak();
        try {
            // Native tarafta artik `AsyncFunction` → promise doner. Temizlik
            // yangin-ve-unut'tur; reddi yutulur ki unmount yolu hic dusmesin.
            void nativeOnizlemeyiDurdur();
        } catch (error) {
            Logger.debug('OnizlemeSes', 'Native onizleme durdurulamadi:', error);
        }
    },
};
