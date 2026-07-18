/**
 * Muhafiz "Dinle" / akis onizlemesi icin BILDIRIM SESI calar (uygulama ici).
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
import { sesDosyasiniCoz, type SesKaynagi } from '../../core/muhafiz/sesDosyasi';
import { Logger } from '../../core/utils/Logger';

/** Onizleme bilincli bir aksiyondur → geri bildirim seslerinden yuksek calinir. */
export const ONIZLEME_SES_SEVIYESI = 0.9;

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
     * Palet id'sine karsilik gelen bildirim sesini bastan calar.
     * Ses calinamazsa sessizce vazgecer — onizleme UI'i asla dusurmemeli.
     */
    bildirimSesiniCal: async (sesId: string): Promise<void> => {
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

    /** Ekran kapanirken cagrilir — calari serbest birakir. */
    temizle: (): void => {
        calariBirak();
    },
};
