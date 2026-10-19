/**
 * "Yakınınızda N cami" — Namazda sessiz sayfasının mini harita önizlemesi.
 *
 * Gerçek harita (MapLibre + karolar) bu karta pahalıdır; burada yalnız 2 km içindeki
 * camilerin konuma göre yeri nokta olarak çizilir. Yerleşim saf `onizlemeYerlesimi`'nden
 * gelir: konum DAİMA ortada, tüm noktalar kenar payı içinde (kırpma yok), tek ölçek.
 * Dokununca tam harita (`Camilerim`) açılır. Camideyim KAPALIYKEN de görünür: keşif
 * içindir, izin istemez, izleme başlatmaz. Veri native `yakinCamiler` (en çok 150).
 */
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { HARITA_CAMI_SAYISI, ONIZLEME_SAYIM_M, onizlemeYerlesimi, yakinCamiSayisi } from '../../../core/cami/haritaVerisi';
import * as kopru from '../../../../modules/expo-cami-geofence/src';

interface Props {
    merkez: { lat: number; lng: number } | null;
    onAc: () => void;
}

const ALAN_YUKSEKLIGI = 112;
const NOKTA = 9;
const KONUM = 14;

export const YakinCamilerOnizlemesi: React.FC<Props> = ({ merkez, onAc }) => {
    const renkler = useRenkler();
    const [camiler, setCamiler] = useState<kopru.YakinCami[] | null>(null);
    const [genislik, setGenislik] = useState(0);
    const lat = merkez?.lat;
    const lng = merkez?.lng;

    useEffect(() => {
        if (lat == null || lng == null) return;
        let iptal = false;
        kopru
            .yakinCamiler(lat, lng, HARITA_CAMI_SAYISI)
            .then((liste) => {
                if (!iptal) setCamiler(liste);
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, [lat, lng]);

    const yerlesim = useMemo(
        () => (lat != null && lng != null && camiler && genislik > 0 ? onizlemeYerlesimi({ lat, lng }, camiler, genislik, ALAN_YUKSEKLIGI) : null),
        [lat, lng, camiler, genislik]
    );
    if (!merkez || camiler == null || camiler.length === 0) return null;
    const sayi = yakinCamiSayisi(camiler);
    const baslik = sayi > 0 ? `Yakınınızda ${sayi} cami` : 'Yakındaki camiler';
    const alt = `${ONIZLEME_SAYIM_M / 1000} km içinde`;

    return (
        <TouchableOpacity
            testID="yakin-camiler-onizleme"
            onPress={onAc}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${baslik}, ${alt}. Haritayı açın.`}
            style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, marginTop: 12, overflow: 'hidden' }}
        >
            <View
                style={{ height: ALAN_YUKSEKLIGI, backgroundColor: `${renkler.birincil}10` }}
                onLayout={(e) => setGenislik(e.nativeEvent.layout.width)}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {yerlesim?.noktalar.map((n) => (
                    <View
                        key={n.id}
                        style={{
                            position: 'absolute',
                            left: n.sol - NOKTA / 2,
                            top: n.ust - NOKTA / 2,
                            width: NOKTA,
                            height: NOKTA,
                            borderRadius: NOKTA / 2,
                            backgroundColor: renkler.birincil,
                            borderWidth: 1.5,
                            borderColor: renkler.kartArkaplan,
                        }}
                    />
                ))}
                {yerlesim ? (
                    <View
                        testID="yakin-camiler-konum"
                        style={{
                            position: 'absolute',
                            left: yerlesim.merkez.sol - KONUM / 2,
                            top: yerlesim.merkez.ust - KONUM / 2,
                            width: KONUM,
                            height: KONUM,
                            borderRadius: KONUM / 2,
                            backgroundColor: renkler.durum.bilgi,
                            borderWidth: 2.5,
                            borderColor: renkler.kartArkaplan,
                        }}
                    />
                ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${renkler.birincil}20`,
                    }}
                >
                    <FontAwesome5 name="mosque" size={14} color={renkler.birincil} solid />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{baslik}</Text>
                    <Text style={{ fontSize: 13, marginTop: 2, color: renkler.metinIkincil }}>{alt}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={13} color={renkler.metinIkincil} />
            </View>
        </TouchableOpacity>
    );
};

export default YakinCamilerOnizlemesi;
