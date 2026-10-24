/**
 * Ayarlar ana sayfasındaki Camideyim / Namaz modu satırlarının özet metni.
 * Kaynak native'dir; ekran açılışında ve uygulamaya dönüşte okunur.
 * Android'de köprü yoksa `kullanilabilir` false → satır çizilmez. iPhone'da satır daima
 * görünür ve Odak kurulum rehberini açar; özet rehberde işaretlenen adımlardan gelir.
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as kopru from '../../../modules/expo-cami-geofence/src';
import { camideyimAyarlariniNormalize } from '../../core/cami/camideyimAyarlari';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { iosSessizKurulumuNormalize, iosSessizOzeti } from '../../core/sessiz/iosSessizKurulum';
import { bicim, metin } from '../../core/dil/aktifDil';

export interface CamideyimOzeti {
    kullanilabilir: boolean;
    cami: string;
    namazModu: string;
    /** iPhone: satırın tüm özeti (Odak kurulum rehberi). Android'de yok. */
    iosOzeti?: string;
}

export function camideyimOzetiOlustur(
    ayarlarHam: unknown,
    durum: kopru.CamiNativeDurumu | null
): Pick<CamideyimOzeti, 'cami' | 'namazModu'> {
    const a = camideyimAyarlariniNormalize(ayarlarHam);
    const t = metin().cami.ozet;
    const cami = !a.aktif
        ? t.kapali
        : durum?.camide
          ? t.camidesiniz
          : durum && durum.izin !== 'tamam'
            ? t.konumIzni
            : bicim(t.bekleme, { dk: a.beklemeDk });
    const m = durum?.namazModu;
    const namazModu = !m?.ayarlar?.etkin
        ? t.kapali
        : !m.erisim
          ? t.erisimGerekli
          : m.aktif
            ? t.suAnAcik
            : [m.ayarlar.cuma ? t.cumaHutbesi : null, m.ayarlar.vakit ? t.vakitGirince : null, a.aktif && a.namazModu ? t.camide : null]
                  .filter(Boolean)
                  .join(', ') || t.acik;
    return { cami, namazModu };
}

export function useCamideyimOzeti(): CamideyimOzeti {
    // iPhone'da native modül yoktur; satır Odak + Kısayollar rehberini açar (`iosOzeti`).
    const ios = Platform.OS === 'ios';
    const native = kopru.camiModuluVarMi();
    const kullanilabilir = native || ios;
    const [ozet, setOzet] = useState<Omit<CamideyimOzeti, 'kullanilabilir'>>({ cami: '', namazModu: '' });

    const yenile = useCallback(async () => {
        if (native) {
            const [ham, durum] = await Promise.all([kopru.ayarlariAl(), kopru.durumAl()]);
            setOzet(camideyimOzetiOlustur(ham, durum));
        } else if (ios) {
            const ham = await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.IOS_SESSIZ_KURULUM).catch(() => null);
            setOzet({ cami: '', namazModu: '', iosOzeti: iosSessizOzeti(iosSessizKurulumuNormalize(ham)) });
        }
    }, [native, ios]);

    useEffect(() => {
        yenile().catch(() => undefined);
        const abonelik = AppState.addEventListener('change', (s) => {
            if (s === 'active') yenile().catch(() => undefined);
        });
        return () => abonelik.remove();
    }, [yenile]);

    return { kullanilabilir, ...ozet };
}
