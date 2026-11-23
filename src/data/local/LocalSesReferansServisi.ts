/**
 * Silinen ses dosyasının kayıtlardaki referanslarını varsayılana döndürür (iPhone'da eklenen
 * dosya listeden silinince). Yazım `Depolama.hamGuncelle` ile anahtar kuyruğunda atomiktir;
 * bozuk ya da boş kayda DOKUNULMAZ (çözülemeyen kaydın üstüne yazmak veriyi siler).
 * Değişen yüzeylerin slice'ları diskten yeniden yüklenmeli ve planlar yenilenmelidir
 * (çağıranın işi — `presentation/store/iosSesSilme.ts`). `LocalOzelAnonsServisi` ikizi.
 */
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { sesReferansiniKaldir, type SesYuzeyi } from '../../core/hatirlatma/sesReferanslari';
import { vakitSesleriniNormalize } from '../../core/bildirim/vakitBildirimSesi';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from './Depolama';

const YUZEY_ANAHTARLARI: Readonly<Record<SesYuzeyi, string>> = {
    muhafiz: DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
    nafile: DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
    cuma: DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
    camiyeGit: DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI,
    yatis: DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI,
    takvim: DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
    vakitSesi: DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_SESLERI,
};

const YUZEYLER = Object.keys(YUZEY_ANAHTARLARI) as SesYuzeyi[];

const coz = (ham: string | null): unknown => {
    if (ham == null) return null;
    try {
        return JSON.parse(ham) as unknown;
    } catch {
        return null;
    }
};

export const LocalSesReferansServisi = {
    /** `kimlik`i kullanan her kaydı varsayılana döndürür; değişen yüzeyleri döndürür. ASLA reddetmez. */
    varsayilanaDondur: async (kimlik: string): Promise<SesYuzeyi[]> => {
        const degisen: SesYuzeyi[] = [];
        for (const yuzey of YUZEYLER) {
            try {
                await Depolama.hamGuncelle(YUZEY_ANAHTARLARI[yuzey], (ham) => {
                    const kayit = coz(ham);
                    if (kayit === null) return null;
                    const yeni = sesReferansiniKaldir(kayit, kimlik);
                    if (yeni === kayit) return null;
                    degisen.push(yuzey);
                    // Vakit sesi: varsayılan = kayıt YOK (girdi silinir).
                    return JSON.stringify(yuzey === 'vakitSesi' ? vakitSesleriniNormalize(yeni) : yeni);
                });
            } catch (e) {
                Logger.warn('LocalSesReferansServisi', `${yuzey} sesleri düzeltilemedi`, e);
            }
        }
        return degisen;
    },
};
