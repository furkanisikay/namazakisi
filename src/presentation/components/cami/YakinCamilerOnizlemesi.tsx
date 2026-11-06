/**
 * "Yakınınızda N cami" — Namazda sessiz sayfasının mini harita önizlemesi.
 *
 * Gerçek harita (MapLibre + karolar) bu karta pahalıdır; burada yakın camilerin konuma
 * göre yeri küçük, hafif saydam noktalarla çizilir. Yerleşim saf `onizlemeYerlesimi`'nden
 * gelir: konum DAİMA ortada, ölçek en yakın ~30 camiye göre (250 m–1 km), kart enine
 * uzun olduğu için noktalar yatay dağılır; 250/500 m kesikli halkalar ölçeği anlatır.
 * Başlıktaki sayı (2 km içi) çizilen noktalardan BAĞIMSIZDIR.
 * Dokununca tam harita (`Camilerim`) açılır. Camideyim KAPALIYKEN de görünür: keşif
 * içindir, izin istemez, izleme başlatmaz. Veri native `yakinCamiler` (en çok 150).
 */
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { YonluIkon } from '../common/YonluIkon';
import { SOLDAN_SAGA } from '../common/yon';
import { useRenkler } from '../../../core/theme';
import { HARITA_CAMI_SAYISI, ONIZLEME_SAYIM_M, onizlemeYerlesimi, yakinCamiSayisi } from '../../../core/cami/haritaVerisi';
import * as kopru from '../../../../modules/expo-cami-geofence/src';
import { bicim, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

interface Props {
    merkez: { lat: number; lng: number } | null;
    onAc: () => void;
}

const ALAN_YUKSEKLIGI = 120;
const NOKTA = 6;
const KONUM = 12;

export const YakinCamilerOnizlemesi: React.FC<Props> = ({ merkez, onAc }) => {
    const renkler = useRenkler();
    const m = useMetin().cami.onizleme;
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
    const baslik = sayi > 0 ? sayili(m.yakininizda, sayi) : m.yakindakiler;
    const alt = bicim(m.kmIcinde, { km: sayiYaz(ONIZLEME_SAYIM_M / 1000) });

    return (
        <TouchableOpacity
            testID="yakin-camiler-onizleme"
            onPress={onAc}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={bicim(m.erisim, { baslik, alt })}
            style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, marginTop: 12, overflow: 'hidden' }}
        >
            <View
                // Coğrafi önizleme: doğu her dilde sağda.
                style={[SOLDAN_SAGA, { height: ALAN_YUKSEKLIGI, backgroundColor: `${renkler.birincil}10` }]}
                onLayout={(e) => setGenislik(e.nativeEvent.layout.width)}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {yerlesim?.halkalarPx.map((r) => (
                    <View
                        key={`halka-${r}`}
                        style={{
                            position: 'absolute',
                            left: yerlesim.merkez.sol - r,
                            top: yerlesim.merkez.ust - r,
                            width: 2 * r,
                            height: 2 * r,
                            borderRadius: r,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: renkler.metinIkincil,
                            opacity: 0.45,
                        }}
                    />
                ))}
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
                            opacity: 0.7,
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
                            borderWidth: 2,
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
                <YonluIkon name="chevron-right" size={13} color={renkler.metinIkincil} />
            </View>
        </TouchableOpacity>
    );
};

export default YakinCamilerOnizlemesi;
