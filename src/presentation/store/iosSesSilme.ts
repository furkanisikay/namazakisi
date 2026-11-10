/**
 * iPhone'da eklenen ses dosyasını SİLMEK — tek yol (`useIosSesSecimi.sil`).
 *
 * Silinen dosyayı kullanan HER kayıt (muhafız, nafile, ek yüzeyler, vakit sesi) varsayılana
 * döner, değişen yüzeylerin slice'ları diskten yeniden yüklenir (eski kimlik ekranda kalıp bir
 * sonraki kayıtta geri yazılmasın) ve planlar TEK yayma listesiyle (`konumDegistiUygula`)
 * yenilenir: planlı bildirim olmayan dosyayı isteseydi iOS onun yerine SİSTEMİN sesini
 * çalardı (sessiz sapma). Dil değişince metin değiştirme akışının (`dilSlice.ozelAnonslariDegistir`)
 * ikizi. Ağır modüller TEMBEL `require` ile yüklenir.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { kullaniciSesDosyasi } from '../../core/muhafiz/ios/paketSesleri';
import { eklenmisSesleriAyarla } from '../../core/muhafiz/sesKimligi';
import type { SesYuzeyi } from '../../core/hatirlatma/sesReferanslari';
import { Logger } from '../../core/utils/Logger';

type Kopru = typeof import('../../../modules/expo-muhafiz-anons/src');
interface DurumKaynagi {
    konum?: { koordinatlar?: { lat: number; lng: number } | null };
}

/** Değişen yüzey → slice yükleyicisi (diskten tazele). */
const YUKLEYICILER: Readonly<Record<SesYuzeyi, () => unknown>> = {
    muhafiz: () => (require('./muhafizSlice') as typeof import('./muhafizSlice')).muhafizAyarlariniYukle(),
    nafile: () => (require('./nafileSlice') as typeof import('./nafileSlice')).nafileAyarlariniYukle(),
    cuma: () =>
        (require('./cumaHatirlatmaSlice') as typeof import('./cumaHatirlatmaSlice')).cumaHatirlatmaAyarlariniYukle(),
    camiyeGit: () => (require('./camiyeGitSlice') as typeof import('./camiyeGitSlice')).camiyeGitAyarlariniYukle(),
    yatis: () =>
        (require('./yatisHatirlatmaSlice') as typeof import('./yatisHatirlatmaSlice')).yatisHatirlatmaAyarlariniYukle(),
    takvim: () =>
        (require('./takvimCakismaSlice') as typeof import('./takvimCakismaSlice')).takvimCakismaAyarlariniYukle(),
    vakitSesi: () =>
        (require('./vakitBildirimSlice') as typeof import('./vakitBildirimSlice')).vakitBildirimSesleriniYukle(),
};

/** `dosya:<ad>` kimliğini siler; değişen yüzeyleri döndürür. */
export const iosSesiniSil = createAsyncThunk<SesYuzeyi[], string>(
    'ses/iosSil',
    async (kimlik, { dispatch, getState }) => {
        const dosya = kullaniciSesDosyasi(kimlik);
        if (!dosya) return [];
        const kopru = require('../../../modules/expo-muhafiz-anons/src') as Kopru;
        await kopru.iceAktarilanSesiSil(dosya);
        // Ad üreticisi silinen dosyayı hemen "çalınmaz" görsün (okunamadıysa dokunulmaz).
        const liste = await kopru.iceAktarilanSesler();
        if (liste) eklenmisSesleriAyarla(liste.map((d) => d.dosya));

        const { LocalSesReferansServisi } = require('../../data/local/LocalSesReferansServisi') as
            typeof import('../../data/local/LocalSesReferansServisi');
        const degisen = await LocalSesReferansServisi.varsayilanaDondur(kimlik);
        if (degisen.length === 0) return degisen;

        try {
            for (const y of degisen) await dispatch(YUKLEYICILER[y]() as never);
        } catch (e) {
            Logger.warn('iosSesSilme', 'Ayarlar yeniden yüklenemedi', e);
        }
        const k = (getState() as DurumKaynagi).konum?.koordinatlar;
        if (k && !(k.lat === 0 && k.lng === 0)) {
            try {
                const { konumDegistiUygula } = require('../../domain/services/KonumDegisikligiServisi') as
                    typeof import('../../domain/services/KonumDegisikligiServisi');
                await konumDegistiUygula(k);
            } catch (e) {
                Logger.warn('iosSesSilme', 'Planlar yenilenemedi', e);
            }
        }
        return degisen;
    }
);
