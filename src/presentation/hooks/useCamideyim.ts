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
import { bicim, metin } from '../../core/dil/aktifDil';
import { useMetin } from './useMetin';
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
    /** Verilen noktayı (haritadaki iğne) kullanıcı yeri olarak ekler; ad boşsa sıralı ad verilir. @returns yeni kimlik */
    yerEkle: (yer: { lat: number; lng: number; ad?: string }) => Promise<string>;
    /** Bekleyen "Camide misiniz?" sorusunu cevaplar (true = Namaz modunu aç). */
    soruyuCevapla: (evet: boolean) => Promise<void>;
    gunluguTemizle: () => Promise<void>;
}

export function useCamideyim(): CamideyimDurumu {
    const kullanilabilir = kopru.camiModuluVarMi();
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const [ayarlar, setAyarlar] = useState<CamideyimAyarlari>(VARSAYILAN_CAMIDEYIM_AYARLARI);
    const [durum, setDurum] = useState<kopru.CamiNativeDurumu | null>(null);
    const [yakinlar, setYakinlar] = useState<kopru.YakinCami[]>([]);
    const [hamOlaylar, setHamOlaylar] = useState<Parameters<typeof zamanCizelgesiOlustur>[0]>([]);
    // Satırlar etkin dilde çizilsin: ham günlük saklanır, metin dil değişince yeniden kurulur.
    const sozluk = useMetin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const olaylar = useMemo<OlaySatiri[]>(() => zamanCizelgesiOlustur(hamOlaylar), [hamOlaylar, sozluk]);
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
        setHamOlaylar(g);
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

    /**
     * Native'deki EN SON kaydın üstüne değişikliği uygular ve yazar. Kancanın birden çok
     * örneği yaşar (Namazda sessiz + Camilerim alt sayfası; ayrıca bildirimden gelen
     * "Burası cami değil" doğrudan native'e yazar) → bellekteki kopya bayat olabilir.
     * Bayat kopyayla bütün kaydı yazmak öteki örneğin favori/kendi yer/"cami değil"
     * değişikliklerini EZERDİ (Opus incelemesi). Okuma başarısızsa bellekteki kopyaya düşülür.
     *
     * Aynı örnekteki yazımlar SIRAYA girer: iki yazım eşzamanlı koşsaydı ikisi de aynı
     * tabanı okur, sonra yazan öncekinin değişikliğini düşürürdü (harita: bir yerin
     * bekleyen sınırı yazılırken öteki yere anında sınır değişikliği).
     */
    const yazimKuyrugu = useRef<Promise<unknown>>(Promise.resolve());
    const yazIc = useCallback(
        async (degistir: (a: CamideyimAyarlari) => CamideyimAyarlari): Promise<string> => {
            let taban = ayarlarRef.current;
            try {
                taban = camideyimAyarlariniNormalize(await kopru.ayarlariAl());
            } catch {
                // bellekteki kopya
            }
            const yeni = degistir(taban);
            ayarlarRef.current = yeni;
            setAyarlar(yeni);
            const sonuc = await kopru.ayarlariYaz(yeni, merkez);
            await CamideyimServisi.getInstance().planlariGonder(merkez);
            await yenile();
            return sonuc;
        },
        [merkez, yenile]
    );
    const yaz = useCallback(
        (degistir: (a: CamideyimAyarlari) => CamideyimAyarlari): Promise<string> => {
            const is = yazimKuyrugu.current.then(
                () => yazIc(degistir),
                () => yazIc(degistir)
            );
            yazimKuyrugu.current = is.catch(() => undefined);
            return is;
        },
        [yazIc]
    );

    const guncelle = useCallback(
        (d: Partial<CamideyimAyarlari>) => yaz((a) => ({ ...a, ...d })),
        [yaz]
    );

    const yerGuncelle = useCallback(
        async (id: string, d: Partial<YerKaydi>) => {
            await yaz((a) => ({ ...a, yerler: yerDurumunuAyarla(a.yerler, id, d) }));
        },
        [yaz]
    );

    const yerSil = useCallback(
        async (id: string) => {
            await yaz((a) => {
                const yerler = { ...a.yerler };
                delete yerler[id];
                return { ...a, yerler };
            });
        },
        [yaz]
    );

    const yerEkle = useCallback(
        async (yer: { lat: number; lng: number; ad?: string }): Promise<string> => {
            const id = kullaniciYeriKimligi(Date.now());
            await yaz((a) => {
                const sayi = Object.values(a.yerler).filter((y) => y.kendi).length + 1;
                const ad = yer.ad?.trim() || (sayi === 1 ? metin().cami.eklenenYer : bicim(metin().cami.eklenenYerSirali, { n: sayi }));
                return {
                    ...a,
                    yerler: {
                        ...a.yerler,
                        [id]: { durum: 'normal', kendi: true, ad, lat: yer.lat, lng: yer.lng, alanM: KULLANICI_YERI_ALAN_M },
                    },
                };
            });
            return id;
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
            await yerEkle({ lat: konum.coords.latitude, lng: konum.coords.longitude });
            return true;
        } catch {
            return false;
        }
    }, [yerEkle]);

    const soruyuCevapla = useCallback(
        async (evet: boolean) => {
            await kopru.soruyuCevapla(evet);
            await yenile();
        },
        [yenile]
    );

    const gunluguTemizle = useCallback(async () => {
        await kopru.gunluguTemizle();
        setHamOlaylar([]);
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
        yerEkle,
        soruyuCevapla,
        gunluguTemizle,
    };
}
