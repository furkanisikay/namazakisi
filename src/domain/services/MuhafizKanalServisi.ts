/**
 * Muhafiz bildirim kanallarini TEMBEL olusturur + artik kullanilmayanlari toplar.
 *
 * NEDEN AYRI SERVIS (BildirimServisi'nin metodu DEGIL): `BildirimServisi` zaten
 * `ArkaplanMuhafizServisi`'ni import ediyor; kanal hazirligini oraya koyup buradan
 * cagirmak DAIRESEL import uretirdi. Kanal hazirligi planlamanin hemen oncesinde
 * gerekiyor, o yuzden planlayan tarafa yakin ve bagimsiz duruyor.
 *
 * TEMBELLIK NEDEN SART: `BildirimServisi.izinIste()` her acilista
 * `setNotificationChannelAsync` cagiriyor ama kanallar zaten var oldugu icin
 * `sound` alani SESSIZCE cope gidiyor — bugun fark edilmiyor cunku deger hic
 * degismiyor. Yeni mimaride ayni tuzaga dusmemek icin kanal YOKSA olusturulur ve
 * ses degisikligi ASLA mevcut bir kanala yazilmaya calisilmaz: ses degisince
 * kanal ID'si de degisir (bkz. `core/muhafiz/sesKimligi.ts`).
 */
import { Platform } from 'react-native';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES_ADI } from '../../core/muhafiz/matrisTipleri';
import { matristenKanallariCikar, type MuhafizKanalTanimi } from '../../core/muhafiz/kanalPlani';
import { silinebilirMuhafizKanaliMi } from '../../core/muhafiz/sesKimligi';
import { Logger } from '../../core/utils/Logger';
import {
    muhafizKanaliniGarantile,
    muhafizKanallariniTemizle,
} from '../../../modules/expo-countdown-notification/src';

/** Android bildirim ayarlarinda kanal adi — kullanici hangisi oldugunu ayirt edebilmeli. */
function kanalAdiOlustur(tanim: MuhafizKanalTanimi): string {
    const sesAdi = tanim.sesAdi?.trim() || VARSAYILAN_SES_ADI;
    return tanim.acilMi ? `Acil Hatırlatıcı · ${sesAdi}` : `Namaz Muhafızı · ${sesAdi}`;
}

function kanalAciklamasiOlustur(tanim: MuhafizKanalTanimi): string {
    return tanim.acilMi
        ? 'Vakit çıkmak üzere — acil hatırlatmalar'
        : 'Namaz vakti hatırlatmaları';
}

export const MuhafizKanalServisi = {
    /**
     * Matrisin ihtiyac duydugu TUM kanallari hazirlar ve oksuz kalanlari siler.
     * Planlamadan HEMEN ONCE cagrilmalidir — var olmayan bir kanala gonderilen
     * bildirim Android 8+'ta hic gosterilmez.
     *
     * Asla firlatmaz: kanal hazirligi patlarsa bile planlama devam etmeli
     * (taban kanallar zaten mevcut, kullanici en azindan varsayilan sesi duyar).
     */
    hazirla: (matris: MuhafizMatrisi): void => {
        if (Platform.OS !== 'android') return;

        try {
            const tanimlar = matristenKanallariCikar(matris);

            // Yalniz HASH'LI (ozel sesli) kanallar burada olusturulur; taban
            // kanallari (`muhafiz`/`muhafiz_acil`) BildirimServisi.izinIste kuruyor
            // ve mevcut kurulumlarda kullanicinin tercihleri orada birikmis durumda.
            for (const tanim of tanimlar) {
                if (!silinebilirMuhafizKanaliMi(tanim.kanalId)) continue;
                muhafizKanaliniGarantile(
                    tanim.kanalId,
                    kanalAdiOlustur(tanim),
                    kanalAciklamasiOlustur(tanim),
                    tanim.sesKimligi,
                    tanim.acilMi
                );
            }

            // GC: matriste artik referans verilmeyen hash'li kanallar silinir.
            // Kullanici sesi her degistirdiginde eskisi oksuz kalir; toplanmazsa
            // bildirim ayarlarinda olu kanallar birikir.
            muhafizKanallariniTemizle(tanimlar.map((t) => t.kanalId));
        } catch (error) {
            Logger.error('MuhafizKanal', 'Bildirim kanallari hazirlanamadi', error);
        }
    },
};
