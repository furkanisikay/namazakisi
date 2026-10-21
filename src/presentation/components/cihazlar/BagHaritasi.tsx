/**
 * Cihazlarım'ın imza öğesi: "bu telefon" üstte ortada ve büyük; bağlı cihazlar altında simgeli
 * kartlar, her birinde durum rozeti ("bağlı · 2 dk önce"). Telefondan her karta bir bağ çizgisi;
 * çizgi YALNIZ yeni bir cihaz eklendiğinde (ve ilk görünüşte) bir kez çizilir, durum değişince
 * yalnız rengi değişir. Bilgi hareketle verilmez: azaltılmış harekette çizgiler son hâlindedir.
 * Yerleşim saf `core/cihazAgi/bagHaritasi.ts`'ten gelir.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { haritaYerlesimi, HARITA } from '../../../core/cihazAgi/bagHaritasi';

export type DugumTonu = 'iyi' | 'bekliyor' | 'sorun' | 'notr';

export interface HaritaDugumu {
    kimlik: string;
    tur: 'tv' | 'saat' | 'tablet' | 'ekle' | 'fazla';
    ad: string;
    rozet: string;
    ton: DugumTonu;
    onPress?: () => void;
}

const SIMGE: Record<HaritaDugumu['tur'], string> = { tv: 'tv', saat: 'clock', tablet: 'tablet-alt', ekle: 'plus', fazla: 'ellipsis-h' };
const CIZIM_MS = 700;

export const BagHaritasi: React.FC<{ dugumler: HaritaDugumu[] }> = ({ dugumler }) => {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const [genislik, setGenislik] = React.useState(0);
    const [ilerleme, setIlerleme] = React.useState(1);
    const gorulen = React.useRef<Set<string>>(new Set());
    const gercekler = dugumler.filter((d) => d.tur !== 'ekle' && d.tur !== 'fazla').map((d) => d.kimlik);
    const anahtar = gercekler.join(',');

    React.useEffect(() => {
        const kimlikler = anahtar ? anahtar.split(',') : [];
        const yeniVar = kimlikler.some((k) => !gorulen.current.has(k));
        kimlikler.forEach((k) => gorulen.current.add(k));
        if (!yeniVar || azalt) {
            setIlerleme(1);
            return;
        }
        // JS saati ile kısa bir çizim (tek seferlik; ~40 kare). Native sürücü SVG yol özelliğini sürmez.
        let iptal = false;
        const bas = Date.now();
        setIlerleme(0);
        const adim = () => {
            if (iptal) return;
            const t = Math.min(1, (Date.now() - bas) / CIZIM_MS);
            setIlerleme(1 - (1 - t) * (1 - t) * (1 - t));
            if (t < 1) requestAnimationFrame(adim);
        };
        requestAnimationFrame(adim);
        return () => {
            iptal = true;
        };
    }, [anahtar, azalt]);

    const yer = genislik > 0 ? haritaYerlesimi(genislik, dugumler.length) : null;
    const renk = (t: DugumTonu) =>
        t === 'iyi' ? renkler.birincil : t === 'sorun' ? renkler.hata : t === 'bekliyor' ? renkler.metinIkincil : renkler.metinIkincil;

    return (
        <View
            testID="cihazlarim-harita"
            onLayout={(e: LayoutChangeEvent) => setGenislik(Math.round(e.nativeEvent.layout.width))}
            style={{ height: yer?.yukseklik ?? 330 }}
        >
            {yer && (
                <Svg width={genislik} height={yer.yukseklik} style={{ position: 'absolute', left: 0, top: 0 }} importantForAccessibility="no-hide-descendants">
                    {yer.dugumler.map((d, i) => {
                        const dugum = dugumler[i];
                        if (!dugum) return null;
                        const sabit = dugum.tur === 'ekle' || dugum.tur === 'fazla';
                        return (
                            <Path
                                key={dugum.kimlik}
                                d={d.yol}
                                stroke={renk(dugum.ton)}
                                strokeWidth={sabit ? 2 : 3}
                                strokeLinecap="round"
                                fill="none"
                                opacity={dugum.ton === 'bekliyor' || sabit ? 0.55 : 1}
                                strokeDasharray={sabit || dugum.ton === 'bekliyor' ? '5 8' : `${d.uzunluk} ${d.uzunluk}`}
                                strokeDashoffset={sabit || dugum.ton === 'bekliyor' ? 0 : d.uzunluk * (1 - ilerleme)}
                            />
                        );
                    })}
                </Svg>
            )}

            {/* Bu telefon: ortada büyük, dolu birincil + yumuşak hâle. */}
            <View style={{ alignItems: 'center', paddingTop: HARITA.ustBosluk }} accessible accessibilityLabel="Bu telefon">
                <View style={{ width: HARITA.telefon, height: HARITA.telefon, borderRadius: 30, backgroundColor: renkler.birincil + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: renkler.birincil, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="mobile-alt" size={30} color={renkler.birincilMetin} />
                    </View>
                </View>
                <Text className="text-sm font-bold mt-1.5" style={{ color: renkler.metin }}>
                    Bu telefon
                </Text>
            </View>

            {yer &&
                yer.dugumler.map((d, i) => {
                    const dugum = dugumler[i];
                    if (!dugum) return null;
                    const r = renk(dugum.ton);
                    const ekle = dugum.tur === 'ekle';
                    const icerik = (
                        <>
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center"
                                style={ekle ? { borderWidth: 1.5, borderStyle: 'dashed', borderColor: renkler.metinIkincil } : { backgroundColor: r + '20' }}
                            >
                                {dugum.tur === 'fazla' ? (
                                    <Text className="text-sm font-bold" style={{ color: r }}>
                                        {dugum.ad}
                                    </Text>
                                ) : (
                                    <FontAwesome5 name={SIMGE[dugum.tur]} size={17} color={ekle ? renkler.metinIkincil : r} />
                                )}
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="font-semibold" style={{ color: renkler.metin, fontSize: 15 }} numberOfLines={1}>
                                    {dugum.tur === 'fazla' ? 'Diğer cihazlar' : dugum.ad}
                                </Text>
                                <View className="flex-row items-center mt-1">
                                    {!ekle && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: r, marginRight: 6 }} />}
                                    <Text className="text-xs" style={{ color: renkler.metinIkincil, flexShrink: 1 }} numberOfLines={2}>
                                        {dugum.rozet}
                                    </Text>
                                </View>
                            </View>
                        </>
                    );
                    const stil = {
                        position: 'absolute' as const,
                        left: d.x,
                        top: d.y,
                        width: d.en,
                        height: d.boy,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: dugum.ton === 'iyi' ? renkler.birincil + '55' : renkler.sinir,
                        backgroundColor: renkler.kartArkaplan,
                        paddingHorizontal: 12,
                        flexDirection: 'row' as const,
                        alignItems: 'center' as const,
                    };
                    return dugum.onPress ? (
                        <TouchableOpacity
                            key={dugum.kimlik}
                            style={stil}
                            onPress={dugum.onPress}
                            accessibilityRole="button"
                            accessibilityLabel={ekle ? dugum.ad : `${dugum.ad}: ${dugum.rozet}`}
                        >
                            {icerik}
                        </TouchableOpacity>
                    ) : (
                        <View key={dugum.kimlik} style={stil} accessible accessibilityLabel={`${dugum.ad}: ${dugum.rozet}`}>
                            {icerik}
                        </View>
                    );
                })}
        </View>
    );
};
