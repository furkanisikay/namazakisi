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
import {
    cozulemeyenSesleriDusur,
    matristenKanallariCikar,
    ozelSesleriTopla,
    type MuhafizKanalTanimi,
} from '../../core/muhafiz/kanalPlani';
import { sesGorunenAdi, silinebilirMuhafizKanaliMi } from '../../core/muhafiz/sesKimligi';
import { Logger } from '../../core/utils/Logger';
import {
    muhafizKanaliniGarantile,
    muhafizKanallariniTemizle,
    sesAdiAl,
} from '../../../modules/expo-countdown-notification/src';

/** Android bildirim ayarlarinda kanal adi — kullanici hangisi oldugunu ayirt edebilmeli. */
function kanalAdiOlustur(tanim: MuhafizKanalTanimi): string {
    // `sesGorunenAdi` ozel ses icin AYIRT EDICI yedek doner ("Seçtiğiniz ses").
    // Duz "Uygulama sesi" yazsaydik, adi cozulemeyen ozel sesli kanal TABAN kanalla
    // BIREBIR ayni isimle gorunur ve kullanici ikisini ayirt edemezdi.
    const sesAdi = sesGorunenAdi(tanim.sesKimligi, tanim.sesAdi);
    return tanim.acilMi ? `Acil Hatırlatıcı · ${sesAdi}` : `Namaz Muhafızı · ${sesAdi}`;
}

function kanalAciklamasiOlustur(tanim: MuhafizKanalTanimi): string {
    return tanim.acilMi
        ? 'Vakit çıkmak üzere — acil hatırlatmalar'
        : 'Namaz vakti hatırlatmaları';
}

/**
 * En son uygulanan GC kume izi. Kanal kumesi degismediyse native cop toplama
 * ATLANIR: `copleriTopla` cihazdaki TUM kanallari enumerate eder ve bu yol
 * acilista + ~15 dk'da bir arka plan gorevinde + her konum guncellemesinde
 * calisiyor. Kume ayni oldugu surece yapacak isi de yoktur.
 */
let sonToplananKume: string | null = null;

/** Ozel ses URI'lerini native'de cozerek gecerliligini dogrular. */
async function cozulemeyenSesleriBul(matris: MuhafizMatrisi): Promise<Set<string>> {
    const cozulemeyen = new Set<string>();
    for (const uri of ozelSesleriTopla(matris)) {
        try {
            // Bos ad = URI cozulemedi (silinmis dosya, baska cihazdan gelen yedek,
            // kaybedilmis erisim). `sesAdiAl` asla firlatmaz ama savunmaci kalalim.
            if (!(await sesAdiAl(uri))) cozulemeyen.add(uri);
        } catch (error) {
            Logger.debug('MuhafizKanal', 'Ses URI dogrulanamadi:', error);
            cozulemeyen.add(uri);
        }
    }
    return cozulemeyen;
}

export const MuhafizKanalServisi = {
    /**
     * Matrisin ihtiyac duydugu TUM kanallari hazirlar ve oksuz kalanlari siler.
     * Planlamadan HEMEN ONCE cagrilmalidir — var olmayan bir kanala gonderilen
     * bildirim Android 8+'ta hic gosterilmez.
     *
     * DONUS: DOGRULANMIS matris. Cozulemeyen ozel sesler varsayilana dusurulur;
     * cagiran taraf bildirimleri BU matrisle planlamalidir, aksi halde kanal id'si
     * ile planlanan id ayrisir ve bildirim var olmayan kanala gider (= hic gosterilmez).
     *
     * `matris` verilmezse (muhafiz KAPALI) yalnizca cop toplama yapilir: kapatma
     * anindaki kanallar aksi halde bildirim ayarlarinda sonsuza kadar oksuz kalirdi.
     *
     * Asla firlatmaz: kanal hazirligi patlarsa bile planlama devam etmeli.
     */
    hazirla: async (matris?: MuhafizMatrisi): Promise<MuhafizMatrisi | undefined> => {
        if (Platform.OS !== 'android') return matris;

        if (!matris) {
            await copleriTopla([]);
            return matris;
        }

        let dogrulanmisMatris = matris;
        try {
            const cozulemeyen = await cozulemeyenSesleriBul(matris);
            if (cozulemeyen.size > 0) {
                Logger.info(
                    'MuhafizKanal',
                    `${cozulemeyen.size} özel ses çözülemedi; varsayılan sese düşürülüyor`
                );
                dogrulanmisMatris = cozulemeyenSesleriDusur(matris, cozulemeyen);
            }
        } catch (error) {
            Logger.error('MuhafizKanal', 'Ses dogrulamasi basarisiz', error);
        }

        let tanimlar: MuhafizKanalTanimi[];
        try {
            tanimlar = matristenKanallariCikar(dogrulanmisMatris);
        } catch (error) {
            Logger.error('MuhafizKanal', 'Kanal listesi cikarilamadi', error);
            return dogrulanmisMatris;
        }

        // Yalniz HASH'LI (ozel sesli) kanallar burada olusturulur; taban
        // kanallari (`muhafiz`/`muhafiz_acil`) BildirimServisi.izinIste kuruyor
        // ve mevcut kurulumlarda kullanicinin tercihleri orada birikmis durumda.
        //
        // TRY/CATCH HER KANAL ICIN AYRI: tek bir ortak catch, ilk patlayan kanalda
        // DONGUYU KESERDI ve kalan kanallar hic olusmazdi. Kanali olusmayan bir
        // adim Android 8+'ta HIC GOSTERILMEZ (varsayilan sese DUSMEZ — kanal
        // zorunludur), yani bir kanalin hatasi otekileri de sessizce susturur.
        for (const tanim of tanimlar) {
            if (!silinebilirMuhafizKanaliMi(tanim.kanalId)) continue;
            try {
                await muhafizKanaliniGarantile(
                    tanim.kanalId,
                    kanalAdiOlustur(tanim),
                    kanalAciklamasiOlustur(tanim),
                    tanim.sesKimligi,
                    tanim.acilMi
                );
            } catch (error) {
                Logger.error('MuhafizKanal', `Kanal olusturulamadi: ${tanim.kanalId}`, error);
            }
        }

        // GC: matriste artik referans verilmeyen hash'li kanallar silinir.
        // Kullanici sesi her degistirdiginde eskisi oksuz kalir; toplanmazsa
        // bildirim ayarlarinda olu kanallar birikir.
        await copleriTopla(tanimlar.map((t) => t.kanalId));

        return dogrulanmisMatris;
    },

    /** Testler icin: GC onbellegini sifirlar. */
    onbellegiSifirla: (): void => {
        sonToplananKume = null;
    },
};

async function copleriTopla(korunacakIdler: string[]): Promise<void> {
    const kume = [...korunacakIdler].sort().join('|');
    if (kume === sonToplananKume) return;
    try {
        await muhafizKanallariniTemizle(korunacakIdler);
        sonToplananKume = kume;
    } catch (error) {
        // Onbellegi GUNCELLEME: bir sonraki cagri yeniden denesin.
        Logger.error('MuhafizKanal', 'Kanal cop toplama basarisiz', error);
    }
}
