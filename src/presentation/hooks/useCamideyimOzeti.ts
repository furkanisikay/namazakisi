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
    const cami = !a.aktif
        ? 'Kapalı'
        : durum?.camide
          ? 'Şu an camidesiniz'
          : durum && durum.izin !== 'tamam'
            ? 'Konum izni gerekiyor'
            : `Camide ${a.beklemeDk} dk kalınca`;
    const m = durum?.namazModu;
    const namazModu = !m?.ayarlar?.etkin
        ? 'Kapalı'
        : !m.erisim
          ? 'Rahatsız Etmeyin erişimi gerekiyor'
          : m.aktif
            ? 'Şu an açık'
            : [m.ayarlar.cuma ? 'Cuma hutbesi' : null, m.ayarlar.vakit ? 'vakit girince' : null, a.aktif && a.namazModu ? 'camide' : null]
                  .filter(Boolean)
                  .join(', ') || 'Açık';
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
