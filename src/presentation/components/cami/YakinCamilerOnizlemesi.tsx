/**
 * "Yakınınızda N cami" — Namazda sessiz sayfasının mini harita önizlemesi.
 *
 * Gerçek harita (MapLibre + karolar) bu karta pahalıdır; burada yalnız yakın camilerin
 * merkeze göre konumu nokta olarak çizilir (saf `onizlemeNoktalari`). Dokununca tam
 * harita (`Camilerim`) açılır. Camideyim KAPALIYKEN de görünür: keşif içindir, izin
 * istemez, izleme başlatmaz. Veri native `yakinCamiler` sorgusundan (en çok 150).
 */
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import {
    HARITA_CAMI_SAYISI,
    ONIZLEME_SAYIM_M,
    ONIZLEME_YARI_GENISLIK_M,
    onizlemeNoktalari,
    yakinCamiSayisi,
} from '../../../core/cami/haritaVerisi';
import * as kopru from '../../../../modules/expo-cami-geofence/src';

interface Props {
    merkez: { lat: number; lng: number } | null;
    onAc: () => void;
}

const ALAN_YUKSEKLIGI = 112;
/** Dikeyde 2 km (±1 km) sığar; ölçek her iki eksende aynı (izotrop). */
const PIKSEL_BASINA_M = (2 * ONIZLEME_YARI_GENISLIK_M) / ALAN_YUKSEKLIGI;
/** 500 m'lik dekor halkası (çap, px). */
const HALKA_CAPI = 1000 / PIKSEL_BASINA_M;

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

    // Yatayda genişlik kadar metre görünür (kart enine uzun); dikeyde ±1 km.
    const noktalar = useMemo(() => {
        if (lat == null || lng == null || !camiler || genislik <= 0) return [];
        const yariX = Math.max(ONIZLEME_YARI_GENISLIK_M, (genislik / 2) * PIKSEL_BASINA_M);
        return onizlemeNoktalari({ lat, lng }, camiler, yariX)
            .map((n) => ({
                id: n.id,
                sol: genislik / 2 + ((n.x - 0.5) * 2 * yariX) / PIKSEL_BASINA_M,
                ust: ALAN_YUKSEKLIGI / 2 + ((n.y - 0.5) * 2 * yariX) / PIKSEL_BASINA_M,
            }))
            .filter((n) => n.ust >= 0 && n.ust <= ALAN_YUKSEKLIGI);
    }, [lat, lng, camiler, genislik]);
    if (!merkez || camiler == null || camiler.length === 0) return null;
    const sayi = yakinCamiSayisi(camiler);
    const baslik = sayi > 0 ? `Yakınınızda ${sayi} cami` : 'Yakındaki camiler';
    const alt = `${ONIZLEME_SAYIM_M / 1000} km içinde · haritada görün, sınırlarını ayarlayın`;

    return (
        <TouchableOpacity
            testID="yakin-camiler-onizleme"
            onPress={onAc}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${baslik}. Haritayı açın.`}
            style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, marginTop: 12, overflow: 'hidden' }}
        >
            <View
                style={{ height: ALAN_YUKSEKLIGI, backgroundColor: `${renkler.birincil}10` }}
                onLayout={(e) => setGenislik(e.nativeEvent.layout.width)}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {/* 500 m halkası (yalnız dekor). */}
                <View
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: HALKA_CAPI,
                        height: HALKA_CAPI,
                        marginLeft: -HALKA_CAPI / 2,
                        marginTop: -HALKA_CAPI / 2,
                        borderRadius: HALKA_CAPI / 2,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: renkler.sinir,
                    }}
                />
                {noktalar.map((n) => (
                    <View
                        key={n.id}
                        style={{
                            position: 'absolute',
                            left: n.sol,
                            top: n.ust,
                            width: 9,
                            height: 9,
                            marginLeft: -4.5,
                            marginTop: -4.5,
                            borderRadius: 4.5,
                            backgroundColor: renkler.birincil,
                            borderWidth: 1.5,
                            borderColor: renkler.kartArkaplan,
                        }}
                    />
                ))}
                {/* Siz / ayarlı konum */}
                <View
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 14,
                        height: 14,
                        marginLeft: -7,
                        marginTop: -7,
                        borderRadius: 7,
                        backgroundColor: renkler.durum.bilgi,
                        borderWidth: 2.5,
                        borderColor: renkler.kartArkaplan,
                    }}
                />
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
