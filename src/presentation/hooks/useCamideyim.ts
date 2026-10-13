/**
 * Camideyim ekranının durumu — kaynak native (`CamiDepo`); Redux'a yazılmaz.
 *
 * Neden store değil: karar uygulama süreci ölüyken native'de verilir ve
 * "Burası cami değil" gibi değişiklikler bildirimden doğrudan native'e yazılır.
 * İkinci bir kopya (slice + AsyncStorage) ayrışırdı. Ekran her odakta ve
 * uygulamaya dönüşte (izin ekranından geri) native'den tazeler.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { useAppSelector } from '../store/hooks';
import {
    camideyimAyarlariniNormalize,
    kullaniciYeriKimligi,
    VARSAYILAN_CAMIDEYIM_AYARLARI,
    yerDurumunuAyarla,
    type CamideyimAyarlari,
} from '../../core/cami/camideyimAyarlari';
import { KULLANICI_YERI_ALAN_M, type YerKaydi } from '../../core/cami/camiTipleri';
import { zamanCizelgesiOlustur, type OlaySatiri } from '../../core/cami/olayMetinleri';
import { CamideyimServisi } from '../../domain/services/CamideyimServisi';
import * as kopru from '../../../modules/expo-cami-geofence/src';

/** Ayar ekranında gösterilen yakın cami sayısı. */
export const LISTE_CAMI_SAYISI = 15;

export interface CamideyimDurumu {
    kullanilabilir: boolean;
    yuklendi: boolean;
    /** Ayarlı konum (yoksa null) — liste mesafeleri buna göre. */
    merkez: { lat: number; lng: number } | null;
    ayarlar: CamideyimAyarlari;
    durum: kopru.CamiNativeDurumu | null;
    yakinlar: kopru.YakinCami[];
    olaylar: OlaySatiri[];
    yenile: () => Promise<void>;
    /** @returns native sonucu ('kuruldu' | 'izinYok' | 'kapali' | 'hata' | …) */
    guncelle: (degisiklik: Partial<CamideyimAyarlari>) => Promise<string>;
    yerGuncelle: (id: string, degisiklik: Partial<YerKaydi>) => Promise<void>;
    yerSil: (id: string) => Promise<void>;
    /** Bulunduğunuz noktayı kullanıcı yeri olarak ekler. @returns eklendi mi */
    bulundugumYeriEkle: () => Promise<boolean>;
    gunluguTemizle: () => Promise<void>;
}

export function useCamideyim(): CamideyimDurumu {
    const kullanilabilir = kopru.camiModuluVarMi();
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const [ayarlar, setAyarlar] = useState<CamideyimAyarlari>(VARSAYILAN_CAMIDEYIM_AYARLARI);
    const [durum, setDurum] = useState<kopru.CamiNativeDurumu | null>(null);
    const [yakinlar, setYakinlar] = useState<kopru.YakinCami[]>([]);
    const [olaylar, setOlaylar] = useState<OlaySatiri[]>([]);
    const [yuklendi, setYuklendi] = useState(false);
    const ayarlarRef = useRef(ayarlar);
    ayarlarRef.current = ayarlar;

    const lat = koordinat?.lat ?? 0;
    const lng = koordinat?.lng ?? 0;
    // (0,0) "konum yapılandırılmadı" nöbetçisi: merkez yok.
    const merkez = useMemo(() => (lat === 0 && lng === 0 ? null : { lat, lng }), [lat, lng]);

    const yenile = useCallback(async () => {
        if (!kullanilabilir) {
            setYuklendi(true);
            return;
        }
        const [ham, d, g] = await Promise.all([kopru.ayarlariAl(), kopru.durumAl(), kopru.gunlukAl()]);
        setAyarlar(camideyimAyarlariniNormalize(ham));
        setDurum(d);
        setOlaylar(zamanCizelgesiOlustur(g));
        if (merkez) setYakinlar(await kopru.yakinCamiler(merkez.lat, merkez.lng, LISTE_CAMI_SAYISI));
        setYuklendi(true);
    }, [kullanilabilir, merkez]);

    useEffect(() => {
        yenile().catch(() => setYuklendi(true));
        const abonelik = AppState.addEventListener('change', (s) => {
            if (s === 'active') yenile().catch(() => undefined);
        });
        return () => abonelik.remove();
    }, [yenile]);

    const yaz = useCallback(
        async (yeni: CamideyimAyarlari): Promise<string> => {
            setAyarlar(yeni);
            const sonuc = await kopru.ayarlariYaz(yeni, merkez);
            await CamideyimServisi.getInstance().planlariGonder(merkez);
            await yenile();
            return sonuc;
        },
        [merkez, yenile]
    );

    const guncelle = useCallback(
        (d: Partial<CamideyimAyarlari>) => yaz({ ...ayarlarRef.current, ...d }),
        [yaz]
    );

    const yerGuncelle = useCallback(
        async (id: string, d: Partial<YerKaydi>) => {
            const a = ayarlarRef.current;
            await yaz({ ...a, yerler: yerDurumunuAyarla(a.yerler, id, d) });
        },
        [yaz]
    );

    const yerSil = useCallback(
        async (id: string) => {
            const a = ayarlarRef.current;
            const yerler = { ...a.yerler };
            delete yerler[id];
            await yaz({ ...a, yerler });
        },
        [yaz]
    );

    const bulundugumYeriEkle = useCallback(async (): Promise<boolean> => {
        try {
            const izin = await Location.getForegroundPermissionsAsync();
            if (izin?.status !== 'granted') {
                const istek = await Location.requestForegroundPermissionsAsync();
                if (istek?.status !== 'granted') return false;
            }
            const konum = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            if (!konum?.coords) return false;
            const a = ayarlarRef.current;
            const sayi = Object.values(a.yerler).filter((y) => y.kendi).length + 1;
            const id = kullaniciYeriKimligi(Date.now());
            await yaz({
                ...a,
                yerler: {
                    ...a.yerler,
                    [id]: {
                        durum: 'normal',
                        kendi: true,
                        ad: sayi === 1 ? 'Eklediğim yer' : `Eklediğim yer ${sayi}`,
                        lat: konum.coords.latitude,
                        lng: konum.coords.longitude,
                        alanM: KULLANICI_YERI_ALAN_M,
                    },
                },
            });
            return true;
        } catch {
            return false;
        }
    }, [yaz]);

    const gunluguTemizle = useCallback(async () => {
        await kopru.gunluguTemizle();
        setOlaylar([]);
    }, []);

    return {
        kullanilabilir,
        yuklendi,
        merkez,
        ayarlar,
        durum,
        yakinlar,
        olaylar,
        yenile,
        guncelle,
        yerGuncelle,
        yerSil,
        bulundugumYeriEkle,
        gunluguTemizle,
    };
}
