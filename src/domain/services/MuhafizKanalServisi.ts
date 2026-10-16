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
import type { MuhafizMatrisi, VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
import {
    ayarlardanKanallariCikar,
    cozulemeyenSesleriDusur,
    matristenKanallariCikar,
    ozelSesleriTopla,
    type MuhafizKanalTanimi,
} from '../../core/muhafiz/kanalPlani';
import {
    ozelSesMi,
    sesGorunenAdi,
    silinebilirMuhafizKanaliMi,
} from '../../core/muhafiz/sesKimligi';
import { Logger } from '../../core/utils/Logger';
import {
    muhafizKanaliniGarantile,
    muhafizKanallariniTemizle,
    sesAdiAl,
} from '../../../modules/expo-countdown-notification/src';
import { LocalNafileServisi } from '../../data/local/LocalNafileServisi';
import {
    nafileCozulemeyenSesleriDusur,
    nafileKanalAyarlari,
    nafileOzelSesleriniTopla,
} from '../../core/nafile/nafileAdimlari';
import type { NafileAyarlari } from '../../core/nafile/nafileTipleri';

/** Android bildirim ayarlarinda kanal adi — kullanici hangisi oldugunu ayirt edebilmeli. */
function kanalAdiOlustur(tanim: MuhafizKanalTanimi): string {
    // `sesGorunenAdi` ozel ses icin AYIRT EDICI yedek doner ("Seçtiğiniz ses").
    // Duz "Uygulama sesi" yazsaydik, adi cozulemeyen ozel sesli kanal TABAN kanalla
    // BIREBIR ayni isimle gorunur ve kullanici ikisini ayirt edemezdi.
    const sesAdi = sesGorunenAdi(tanim.sesKimligi, tanim.sesAdi);
    const taban = tanim.acilMi ? `Acil Hatırlatıcı · ${sesAdi}` : `Namaz Muhafızı · ${sesAdi}`;
    // Faz 6: ayni ses iki ayri kanalda (titresimli/titresimsiz) yasayabilir —
    // Android bildirim ayarlarinda ikisi ayni isimde gorunmemeli.
    return tanim.titresim ? `${taban} · Titreşimli` : taban;
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
async function cozulemeyenSesleriBul(uriler: readonly string[]): Promise<Set<string>> {
    const cozulemeyen = new Set<string>();
    for (const uri of uriler) {
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

        // Kanal uzayı nafileyle ORTAKTIR (issue #273): çöp toplama nafilenin
        // kullandığı kanalları da korumalı, yoksa her muhafız turu nafile
        // bildirimlerinin kanalını siler (Android 8+ o bildirimi HİÇ göstermez).
        // Diskten okunur: arka plan görevinde nafile servisi aynı süreçte
        // kayıt bırakmamış olabilir.
        const ekTanimlar = ayarlardanKanallariCikar(await nafileKanalAyarlariniOku());

        if (!matris) {
            await kanallariOlustur(ekTanimlar);
            await copleriTopla(ekTanimlar.map((t) => t.kanalId));
            return matris;
        }

        let dogrulanmisMatris = matris;
        try {
            const cozulemeyen = await cozulemeyenSesleriBul(ozelSesleriTopla(matris));
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
            for (const ek of ekTanimlar) {
                if (!tanimlar.some((t) => t.kanalId === ek.kanalId)) tanimlar.push(ek);
            }
        } catch (error) {
            Logger.error('MuhafizKanal', 'Kanal listesi cikarilamadi', error);
            return dogrulanmisMatris;
        }

        await kanallariOlustur(tanimlar);

        // GC: matriste artik referans verilmeyen hash'li kanallar silinir.
        // Kullanici sesi her degistirdiginde eskisi oksuz kalir; toplanmazsa
        // bildirim ayarlarinda olu kanallar birikir.
        await copleriTopla(tanimlar.map((t) => t.kanalId));

        return dogrulanmisMatris;
    },

    /**
     * Muhafız DIŞI tüketicinin (nafile, issue #273) kanallarını YALNIZ oluşturur —
     * çöp TOPLAMAZ. Toplama `hazirla`'nın işidir ve iki kaynağın birleşimini bilir;
     * ikinci bir toplayıcı muhafız kanallarını silerdi. Asla fırlatmaz.
     */
    ekKanallariHazirla: async (ayarlar: ReadonlyArray<VakitMuhafizAyari>): Promise<void> => {
        if (Platform.OS !== 'android') return;
        try {
            await kanallariOlustur(ayarlardanKanallariCikar(ayarlar));
        } catch (error) {
            Logger.error('MuhafizKanal', 'Ek kanallar hazirlanamadi', error);
        }
    },

    /**
     * NAFİLE ayarlarının özel seslerini doğrular (`hazirla`'nın matris doğrulamasının
     * ikizi, issue #273): çözülemeyen `content://` sesi varsayılana düşer. Nafile
     * planı, nafile kanal hazırlığı ve muhafızın çöp toplamada koruduğu nafile kanal /
     * alarm kanalı id'leri HEPSİ bu doğrulanmış ayardan türemeli — biri ham ayarı
     * okusaydı kanal id'leri ayrışır, korunan kanal ölü sesli olurdu. Diske YAZILMAZ
     * (ekran kaydıyla yarışmasın); her tur yeniden doğrulanır. Android dışında ve
     * hatada ayarı AYNEN döndürür, asla fırlatmaz.
     */
    nafileSesleriniDogrula: async (ayarlar: NafileAyarlari): Promise<NafileAyarlari> => {
        if (Platform.OS !== 'android') return ayarlar;
        try {
            const cozulemeyen = await cozulemeyenSesleriBul(nafileOzelSesleriniTopla(ayarlar));
            if (cozulemeyen.size === 0) return ayarlar;
            Logger.info('MuhafizKanal', `${cozulemeyen.size} nafile özel sesi çözülemedi; varsayılan sese düşürülüyor`);
            return nafileCozulemeyenSesleriDusur(ayarlar, cozulemeyen);
        } catch (error) {
            Logger.error('MuhafizKanal', 'Nafile ses dogrulamasi basarisiz', error);
            return ayarlar;
        }
    },

    /** Testler icin: GC onbellegini sifirlar. */
    onbellegiSifirla: (): void => {
        sonToplananKume = null;
    },
};

/** Nafile ayarlarının kanal ihtiyacı (diskten, sesleri doğrulanmış; bozuk/okunamaz → boş). */
async function nafileKanalAyarlariniOku(): Promise<VakitMuhafizAyari[]> {
    try {
        // DOĞRULANMIŞ ayardan: nafile turu kanalları doğrulanmış seslerle kurar;
        // ham ayardan türetilen id ölü sesli kanalı korur, gerçek kanalı silerdi.
        return nafileKanalAyarlari(await MuhafizKanalServisi.nafileSesleriniDogrula(await LocalNafileServisi.getAyarlar()));
    } catch {
        return [];
    }
}

/**
 * Hash'li kanalları oluşturur. TRY/CATCH HER KANAL İÇİN AYRI: tek ortak catch
 * ilk patlayan kanalda döngüyü keserdi ve kalan adımlar hiç gösterilmezdi.
 */
async function kanallariOlustur(tanimlar: ReadonlyArray<MuhafizKanalTanimi>): Promise<void> {
    // Yalniz HASH'LI kanallar burada olusturulur; taban kanallari (`muhafiz`/
    // `muhafiz_acil`) BildirimServisi.izinIste kuruyor.
    for (const tanim of tanimlar) {
        if (!silinebilirMuhafizKanaliMi(tanim.kanalId)) continue;
        try {
            await muhafizKanaliniGarantile(
                tanim.kanalId,
                kanalAdiOlustur(tanim),
                kanalAciklamasiOlustur(tanim),
                // VARSAYILAN ses `null` gider: 'varsayilan' DIZESI native'e gecseydi
                // `Uri.parse("varsayilan")` ile OLU bir ses kurulurdu.
                ozelSesMi(tanim.sesKimligi) ? tanim.sesKimligi : null,
                tanim.acilMi,
                tanim.titresim
            );
        } catch (error) {
            Logger.error('MuhafizKanal', `Kanal olusturulamadi: ${tanim.kanalId}`, error);
        }
    }
}

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
