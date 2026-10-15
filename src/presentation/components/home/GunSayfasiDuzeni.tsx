/**
 * Ana ekranın tek gün sayfasının DÜZENİ (issue #283 — katlanabilir/tablet).
 *
 * - `tek` (telefon): tek sütun, tek ScrollView — eski düzenle BİREBİR aynı.
 * - `ikiBolme` (Fold iç ekranı, tablet): solda üst bölüm (uyarı bantları + şu
 *   anki vakit kartı: geri sayım, Kıldım), sağda "Günlük Akış". Her bölme kendi
 *   içinde kayar; akış uzasa da vakit kartı görünür kalır.
 * - `masaustu` (yarı açık, yatay menteşe): menteşenin ÜSTÜNDE büyük geri sayım
 *   (dik duran yarı — bakılır), ALTINDA bantlar + günlük akış (masadaki yarı —
 *   dokunulur). Yarılar menteşe sınırına göre boyutlanır (`masaustuBolmeleriHesapla`).
 *
 * Yalnız yerleşimi bilir; içerik çağırandan hazır düğüm olarak gelir. Böylece
 * AnaSayfa'nın pager/gün navigasyonu ve saniyelik render mantığına dokunmadan
 * düzenler aynı bileşenleri yeniden kullanır.
 */
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
    masaustuBolmeleriHesapla,
    type GunDuzeni,
    type MenteseSiniri,
} from '../../../core/utils/katlanmaPosturu';

interface GunSayfasiDuzeniProps {
    /** `gunDuzeniSec(ekranSinifi, postur)` sonucu. */
    duzen: GunDuzeni;
    /** Uyarı bantları + şu anki vakit kartı (ya da geçmiş gün kartı). */
    ustBolum: React.ReactNode;
    /** Günlük Akış. */
    akis: React.ReactNode;
    /** Masaüstü düzeninde menteşenin üstü (büyük geri sayım / geçmiş gün kartı). */
    masaustuUst?: React.ReactNode;
    /** Masaüstü düzeninde alt yarıda akıştan ÖNCE çizilen uyarı bantları. */
    masaustuBantlar?: React.ReactNode;
    /** Masaüstü düzeninde menteşe sınırı (dp, pencereye göre). */
    mentese?: MenteseSiniri | null;
}

interface SayfaOlcusu {
    y: number;
    yukseklik: number;
}

const MasaustuDuzeni: React.FC<{
    ust: React.ReactNode;
    alt: React.ReactNode;
    mentese: MenteseSiniri | null;
}> = ({ ust, alt, mentese }) => {
    const kokRef = React.useRef<View>(null);
    const [olcu, setOlcu] = React.useState<SayfaOlcusu | null>(null);

    // Menteşe pencereye göre verilir; sayfanın penceredeki konumu (başlık, durum
    // çubuğu) bilinmeden yarılar hesaplanamaz → her yerleşimde yeniden ölçülür.
    const olc = React.useCallback(() => {
        const kok = kokRef.current as unknown as {
            measureInWindow?: (cb: (x: number, y: number, g: number, h: number) => void) => void;
        } | null;
        if (typeof kok?.measureInWindow !== 'function') return;
        kok.measureInWindow((_x, y, _g, yukseklik) => {
            setOlcu((onceki) =>
                onceki && onceki.y === y && onceki.yukseklik === yukseklik ? onceki : { y, yukseklik }
            );
        });
    }, []);

    const bolmeler = mentese && olcu ? masaustuBolmeleriHesapla(mentese, olcu.y, olcu.yukseklik) : null;

    return (
        <View ref={kokRef} testID="anasayfa-masaustu" style={stiller.masaustu} onLayout={olc}>
            <View
                testID="anasayfa-masaustu-ust"
                style={bolmeler ? { height: bolmeler.ustYukseklik } : stiller.esitYari}
            >
                {ust}
            </View>
            {bolmeler && bolmeler.menteseYukseklik > 0 && (
                <View style={{ height: bolmeler.menteseYukseklik }} />
            )}
            <ScrollView
                testID="anasayfa-masaustu-alt"
                style={bolmeler ? { height: bolmeler.altYukseklik, flexGrow: 0 } : stiller.esitYari}
                contentContainerStyle={stiller.altIcerik}
                showsVerticalScrollIndicator={false}
            >
                {alt}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export const GunSayfasiDuzeni: React.FC<GunSayfasiDuzeniProps> = ({
    duzen,
    ustBolum,
    akis,
    masaustuUst,
    masaustuBantlar,
    mentese,
}) => {
    if (duzen === 'masaustu') {
        return (
            <MasaustuDuzeni
                ust={masaustuUst ?? ustBolum}
                alt={
                    <>
                        {masaustuBantlar}
                        {akis}
                    </>
                }
                mentese={mentese ?? null}
            />
        );
    }

    if (duzen === 'tek') {
        return (
            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                {ustBolum}
                {akis}
                {/* ScrollView sonu için boşluk */}
                <View className="h-10" />
            </ScrollView>
        );
    }

    return (
        <View testID="anasayfa-iki-bolme" style={stiller.ikiBolme}>
            <ScrollView testID="anasayfa-sol-bolme" style={stiller.solBolme} showsVerticalScrollIndicator={false}>
                {ustBolum}
                <View className="h-10" />
            </ScrollView>
            <ScrollView testID="anasayfa-sag-bolme" style={stiller.sagBolme} showsVerticalScrollIndicator={false}>
                {akis}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

const stiller = StyleSheet.create({
    ikiBolme: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 20,
    },
    // Akış sütunu biraz daha geniş: satırlar saat | halka | kart üç sütunludur,
    // vakit kartı ise tek blok — prototipteki 1 : 1.1 oranı.
    solBolme: { flex: 1 },
    sagBolme: { flex: 1.1 },
    masaustu: { flex: 1 },
    // Ölçü yokken (ilk çizim) ya da menteşe sayfaya sığmıyorsa eşit yarılar.
    esitYari: { flex: 1 },
    altIcerik: { paddingHorizontal: 20, paddingTop: 16 },
});
