/**
 * Vakit sayacı — vakit çıkmadan bildirimde canlı geri sayım. Sade tasarımda (Dalga 3)
 * Bildirimler sayfasından "Saat ve widget" sayfasına taşındı (geri sayım tek yerde).
 * Yazma yolu birebir: `vakitSayacAyariniGuncelle` + `VakitSayacBildirimServisi`'nin
 * hemen yeniden planlanması (`muhafizAktif` + `muhafizUyarilanVakitler` ile — eksik
 * geçilirse sayaç bastırması bozulur, AGENTS.md #90).
 *
 * Yalnız Android'de çalışır (servis iOS'ta planlamaz) → iOS'ta "bu telefonda yok"
 * satırı (soluk, dokununca kısa açıklama); sabit "yalnız Android" yazısı yok.
 */
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { store } from '../../store/store';
import { vakitSayacAyariniGuncelle, vakitSayacAyarlariniYukle } from '../../store/vakitSayacSlice';
import { muhafizMatrisiniCoz } from '../../../core/muhafiz/motorAdaptoru';
import {
    muhafizUyarilanVakitleriBul,
    sayacBaslangicEsikleriHesapla,
    sayacBaslangicSecenekleriOlustur,
    seciliSayacBaslangici,
} from '../../../core/utils/vakitSayacYardimcisi';
import { VakitSayacBildirimServisi } from '../../../domain/services/VakitSayacBildirimServisi';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { BolumBasligi } from '../ortak/BolumBasligi';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { DurumSatiri } from '../ortak/DurumSatiri';
import { CanliGuncellemeBilgisi } from '../common/CanliGuncellemeBilgisi';

export const VAKIT_SAYACI_YOK = {
    yok: true as const,
    metin: 'Vakit sayacı bu telefonda yok',
    aciklama: 'Bildirimde canlı geri sayım Android telefonlarda çalışır.',
};

export const VakitSayaciBolumu: React.FC = () => {
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const sayac = useAppSelector((s) => s.vakitSayac.ayarlar);
    const muhafiz = useAppSelector((s) => s.muhafiz);
    const android = Platform.OS === 'android';

    useEffect(() => {
        dispatch(vakitSayacAyarlariniYukle());
    }, [dispatch]);

    // Başlangıç seçenekleri GERÇEK matristen (bayat global eşiklerden değil).
    const secenekler = useMemo(() => sayacBaslangicSecenekleriOlustur(muhafizMatrisiniCoz(muhafiz)), [muhafiz]);
    const secili = seciliSayacBaslangici(sayac.sayacBaslangicSeviyesi, secenekler.length);
    const liste = useMemo<Secenek<number>[]>(
        () => secenekler.map((s) => ({ deger: s.seviye, etiket: s.metin })),
        [secenekler]
    );

    const planla = async (aktif: boolean, seviye: number) => {
        const durum = store.getState();
        const matris = muhafizMatrisiniCoz(durum.muhafiz);
        await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
            aktif,
            koordinatlar: durum.konum.koordinatlar,
            baslangicEsikleri: sayacBaslangicEsikleriHesapla(seviye, matris),
            muhafizAktif: durum.muhafiz.aktif,
            muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(matris),
        });
    };

    const anahtar = async (aktif: boolean) => {
        await butonTiklandiFeedback();
        dispatch(vakitSayacAyariniGuncelle({ aktif }));
        await planla(aktif, sayac.sayacBaslangicSeviyesi || 1);
    };

    const baslangic = async (seviye: number) => {
        await butonTiklandiFeedback();
        dispatch(vakitSayacAyariniGuncelle({ sayacBaslangicSeviyesi: seviye }));
        await planla(sayac.aktif, seviye);
    };

    if (!android) return <DurumSatiri durum={VAKIT_SAYACI_YOK} testID="vakit-sayaci-yok" />;

    return (
        <View>
            <AnahtarSatiri
                ikon="hourglass-half"
                baslik="Vakit sayacı"
                ozet="Vakit çıkmadan bildirimde geri sayım"
                deger={sayac.aktif}
                onDegistir={(v) => void anahtar(v)}
                testID="vakit-sayaci-anahtari"
            />
            {sayac.aktif && liste.length > 0 ? (
                <View style={{ marginTop: 8 }}>
                    <BolumBasligi metin="Ne zaman başlasın" />
                    <SecenekListesi
                        secenekler={liste}
                        secili={secili}
                        onSec={(v) => void baslangic(v)}
                        erisimEtiketi="Vakit sayacı ne zaman başlasın"
                        testID="vakit-sayaci-baslangic"
                    />
                </View>
            ) : null}
            {sayac.aktif ? <CanliGuncellemeBilgisi /> : null}
        </View>
    );
};
