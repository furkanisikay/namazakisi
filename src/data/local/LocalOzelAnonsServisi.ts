/**
 * Elle yazılmış sesli okuma metinleri — altı yüzey kaydında okuma ve toplu değiştirme.
 *
 * Dil değişince "bir kez sor" akışı (bkz. `core/hatirlatma/ozelAnonsMetinleri.ts`) buradan
 * sayar ve kullanıcı onaylarsa değiştirir. Yazım `Depolama.hamGuncelle` ile anahtar-kuyruğunda
 * atomiktir; bozuk ya da boş kayda DOKUNULMAZ (çözülemeyen kaydın üstüne yazmak veriyi siler).
 * Değiştirme sonrası ilgili slice'lar diskten yeniden yüklenmeli ve planlar yenilenmelidir
 * (çağıranın işi).
 */
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import {
    ozelAnonsSay,
    ozelAnonslariSablonlaDegistir,
    type AnonsYuzeyi,
} from '../../core/hatirlatma/ozelAnonsMetinleri';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from './Depolama';

const YUZEY_ANAHTARLARI: Readonly<Record<AnonsYuzeyi, string>> = {
    muhafiz: DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
    nafile: DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
    cuma: DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
    camiyeGit: DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
    yatis: DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
    takvim: DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
};

const YUZEYLER = Object.keys(YUZEY_ANAHTARLARI) as AnonsYuzeyi[];

const coz = (ham: string | null): unknown => {
    if (ham == null) return null;
    try {
        return JSON.parse(ham) as unknown;
    } catch {
        return null;
    }
};

export const LocalOzelAnonsServisi = {
    /** Elle yazılmış metin sayısı. ASLA reddetmez (okunamazsa 0 → soru sorulmaz). */
    say: async (): Promise<number> => {
        try {
            const kayitlar = await Depolama.cogunuOku(YUZEYLER.map((y) => YUZEY_ANAHTARLARI[y]));
            return kayitlar.reduce((t, [, ham]) => t + ozelAnonsSay(coz(ham)), 0);
        } catch (e) {
            Logger.warn('LocalOzelAnonsServisi', 'Sesli okuma metinleri okunamadı', e);
            return 0;
        }
    },

    /** Elle yazılmış metinleri etkin dilin hazır şablonuyla değiştirir; değişen yüzeyleri döndürür. */
    sablonlaDegistir: async (): Promise<AnonsYuzeyi[]> => {
        const degisen: AnonsYuzeyi[] = [];
        for (const yuzey of YUZEYLER) {
            try {
                await Depolama.hamGuncelle(YUZEY_ANAHTARLARI[yuzey], (ham) => {
                    const kayit = coz(ham);
                    if (kayit === null) return null;
                    const yeni = ozelAnonslariSablonlaDegistir(kayit, yuzey);
                    if (yeni === kayit) return null;
                    degisen.push(yuzey);
                    return JSON.stringify(yeni);
                });
            } catch (e) {
                Logger.warn('LocalOzelAnonsServisi', `${yuzey} metinleri değiştirilemedi`, e);
            }
        }
        return degisen;
    },
};
