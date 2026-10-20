/**
 * Ana ekranın proaktif onarım bandı için durum okuyucu (karar saf: `core/anaEkran/kurulumOnarimi`).
 *
 * Açılışta ve uygulamaya HER dönüşte (kullanıcı sistem ayarından izni açıp geri gelince bant
 * kendiliğinden kalksın) bildirim izni ile tam zamanlı alarm iznini YAN ETKİSİZ okur — izin
 * İSTEMEZ (`BildirimIzinOkuyucu`; `BildirimServisi.izinIste` diyalog açardı). "Şimdi değil"
 * 7 gün diskte hatırlanır (`KURULUM_ONARIM_ERTELEME`, cihaza özgü, yedeklenmez): bilerek
 * kapatan kullanıcı her açılışta dürtülmez, ama sorun kalıcı olarak da susturulmaz.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { izinDurumunuOku, type BildirimIzinDurumu } from '../../domain/services/BildirimIzinOkuyucu';
import { tamAlarmDurumunuOku, type TamAlarmDurumu } from '../../domain/services/SistemDurumuOkuyucu';
import { durumEylemiUygula, ANDROID_BILDIRIM_IZNI_API } from '../../domain/services/DurumEylemleri';
import { gecerliErtelemeler, kurulumOnarimiSec, type OnarimTuru } from '../../core/anaEkran/kurulumOnarimi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { useAppSelector } from '../store/hooks';

async function ertelemeKaydiniOku(): Promise<Record<string, number>> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KURULUM_ONARIM_ERTELEME);
        const o = ham ? (JSON.parse(ham) as unknown) : null;
        return o && typeof o === 'object' ? (o as Record<string, number>) : {};
    } catch {
        return {};
    }
}

export function useKurulumOnarimi(): { sorun: OnarimTuru | null; onar: () => void; ertele: () => void } {
    const [izin, setIzin] = useState<BildirimIzinDurumu>('belirsiz');
    const [tamAlarm, setTamAlarm] = useState<TamAlarmDurumu>('belirsiz');
    // Erteleme kaydı okunana dek bant GÖSTERİLMEZ (ertelenmiş bant açılışta bir an yanıp sönmesin).
    const [ertelenenler, setErtelenenler] = useState<OnarimTuru[] | null>(null);
    const bagli = useRef(true);
    const muhafizAktif = useAppSelector((s) => s.muhafiz?.aktif === true);
    const vakitBildirimAcik = useAppSelector((s) => Object.values(s.vakitBildirim?.ayarlar ?? {}).some((v) => v === true));

    const oku = useCallback(async () => {
        const [i, t, kayit] = await Promise.all([izinDurumunuOku(), tamAlarmDurumunuOku(), ertelemeKaydiniOku()]);
        if (!bagli.current) return;
        setIzin((onceki) => (onceki === i ? onceki : i));
        setTamAlarm((onceki) => (onceki === t ? onceki : t));
        const yeni = gecerliErtelemeler(kayit, Date.now());
        setErtelenenler((onceki) => (onceki && onceki.join() === yeni.join() ? onceki : yeni));
    }, []);

    useEffect(() => {
        bagli.current = true;
        void oku();
        const abonelik = AppState.addEventListener('change', (d) => {
            if (d === 'active') void oku();
        });
        return () => {
            bagli.current = false;
            abonelik.remove();
        };
    }, [oku]);

    const sorun =
        ertelenenler === null
            ? null
            : kurulumOnarimiSec({
                  bildirimIzni: izin,
                  tamAlarm,
                  hatirlatmaVar: muhafizAktif || vakitBildirimAcik,
                  ertelenenler,
              });

    const onar = useCallback(() => {
        if (!sorun) return;
        void (async () => {
            await durumEylemiUygula(sorun);
            if (sorun !== 'bildirimIzni') return;
            // Android 12 ve altında eylem ZATEN uygulama bildirim ayarlarını açar; ikinci niyet yok.
            if (Platform.OS === 'android' && Number(Platform.Version) < ANDROID_BILDIRIM_IZNI_API) return;
            // Bir kez reddedilmiş izinde sistem diyaloğu bir daha AÇILMAZ (Android 13+ / iOS):
            // istek sessizce "reddedildi" döner → kullanıcıyı uygulamanın ayar sayfasına götür.
            const sonra = await izinDurumunuOku();
            if (sonra === 'reddedildi') await Linking.openSettings().catch(() => undefined);
            if (bagli.current) setIzin(sonra);
        })();
    }, [sorun]);

    const ertele = useCallback(() => {
        if (!sorun) return;
        setErtelenenler((onceki) => [...(onceki ?? []), sorun]);
        void (async () => {
            const kayit = await ertelemeKaydiniOku();
            kayit[sorun] = Date.now();
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KURULUM_ONARIM_ERTELEME, JSON.stringify(kayit)).catch(() => undefined);
        })();
    }, [sorun]);

    return { sorun, onar, ertele };
}
