/**
 * Ana ekranın proaktif onarım bandı için durum okuyucu (karar saf: `core/anaEkran/kurulumOnarimi`).
 *
 * Açılışta ve uygulamaya HER dönüşte (kullanıcı sistem ayarından izni açıp geri gelince bant
 * kendiliğinden kalksın) bildirim izni ile tam zamanlı alarm iznini YAN ETKİSİZ okur — izin
 * İSTEMEZ (`BildirimIzinOkuyucu`; `BildirimServisi.izinIste` diyalog açardı). "Şimdi değil"
 * yalnız bu süreç boyunca hatırlanır: kritik bir sorun kalıcı olarak susturulmaz.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { izinDurumunuOku, type BildirimIzinDurumu } from '../../domain/services/BildirimIzinOkuyucu';
import { tamAlarmDurumunuOku, type TamAlarmDurumu } from '../../domain/services/SistemDurumuOkuyucu';
import { durumEylemiUygula } from '../../domain/services/DurumEylemleri';
import { kurulumOnarimiSec, type OnarimTuru } from '../../core/anaEkran/kurulumOnarimi';
import { useAppSelector } from '../store/hooks';

const ertelenenler = new Set<OnarimTuru>();

export function useKurulumOnarimi(): { sorun: OnarimTuru | null; onar: () => void; ertele: () => void } {
    const [izin, setIzin] = useState<BildirimIzinDurumu>('belirsiz');
    const [tamAlarm, setTamAlarm] = useState<TamAlarmDurumu>('belirsiz');
    const [, setSurum] = useState(0);
    const bagli = useRef(true);
    const muhafizAktif = useAppSelector((s) => s.muhafiz?.aktif === true);
    const vakitBildirimAcik = useAppSelector((s) => Object.values(s.vakitBildirim?.ayarlar ?? {}).some((v) => v === true));

    const oku = useCallback(async () => {
        const [i, t] = await Promise.all([izinDurumunuOku(), tamAlarmDurumunuOku()]);
        if (!bagli.current) return;
        setIzin((onceki) => (onceki === i ? onceki : i));
        setTamAlarm((onceki) => (onceki === t ? onceki : t));
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

    const sorun = kurulumOnarimiSec({
        bildirimIzni: izin,
        tamAlarm,
        hatirlatmaVar: muhafizAktif || vakitBildirimAcik,
        ertelenenler: [...ertelenenler],
    });

    const onar = useCallback(() => {
        if (!sorun) return;
        void (async () => {
            await durumEylemiUygula(sorun);
            if (sorun !== 'bildirimIzni') return;
            // Bir kez reddedilmiş izinde sistem diyaloğu bir daha AÇILMAZ (Android 13+ / iOS):
            // istek sessizce "reddedildi" döner → kullanıcıyı uygulamanın ayar sayfasına götür.
            const sonra = await izinDurumunuOku();
            if (sonra === 'reddedildi') await Linking.openSettings().catch(() => undefined);
            if (bagli.current) setIzin(sonra);
        })();
    }, [sorun]);

    const ertele = useCallback(() => {
        if (!sorun) return;
        ertelenenler.add(sorun);
        setSurum((s) => s + 1);
    }, [sorun]);

    return { sorun, onar, ertele };
}

/** Yalnız testler: süreç belleğini sıfırlar. */
export function kurulumOnarimiErtelemeleriniSifirla(): void {
    ertelenenler.clear();
}
