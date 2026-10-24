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
import { metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export const VAKIT_SAYACI_YOK = {
    yok: true as const,
    get metin() {
        return metin().hatirlatma.vakitSayaci.yokMetin;
    },
    get aciklama() {
        return metin().hatirlatma.vakitSayaci.yokAciklama;
    },
};

export const VakitSayaciBolumu: React.FC = () => {
    const sozluk = useMetin();
    const m = sozluk.hatirlatma.vakitSayaci;
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const sayac = useAppSelector((s) => s.vakitSayac.ayarlar);
    const muhafiz = useAppSelector((s) => s.muhafiz);
    const android = Platform.OS === 'android';

    useEffect(() => {
        dispatch(vakitSayacAyarlariniYukle());
    }, [dispatch]);

    // Başlangıç seçenekleri GERÇEK matristen (bayat global eşiklerden değil).
    // Seçenek metni etkin dilde: dil değişince yeniden kurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const secenekler = useMemo(() => sayacBaslangicSecenekleriOlustur(muhafizMatrisiniCoz(muhafiz)), [muhafiz, sozluk]);
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
                baslik={m.baslik}
                ozet={m.ozet}
                deger={sayac.aktif}
                onDegistir={(v) => void anahtar(v)}
                testID="vakit-sayaci-anahtari"
            />
            {sayac.aktif && liste.length > 0 ? (
                <View style={{ marginTop: 8 }}>
                    <BolumBasligi metin={m.neZaman} />
                    <SecenekListesi
                        secenekler={liste}
                        secili={secili}
                        onSec={(v) => void baslangic(v)}
                        erisimEtiketi={m.neZamanEtiketi}
                        testID="vakit-sayaci-baslangic"
                    />
                </View>
            ) : null}
            {sayac.aktif ? <CanliGuncellemeBilgisi /> : null}
        </View>
    );
};
