/**
 * Geniş ekran (tablet / iPad iki bölme) ana sayfa ekleri: yarının vakitleri ve kıble yönü.
 *
 * Yalnız iki bölmeli düzende çizilir (`GunSayfasiDuzeni` `solEk`/`sagEk`); telefonda yoktur.
 * Hesap saf `core/anaEkran/genisEkranEkleri.ts`'te. Saniyelik ana ekran çiziminden yalıtmak
 * için bileşenler `React.memo`'dur ve yalnız dize/sayı prop alır.
 */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { kibleOzetiHesapla, yarinVakitleriniHesapla } from '../../../core/anaEkran/genisEkranEkleri';

/** Ek kart ana ekranı ASLA düşürmez: hesap patlarsa kart çizilmez. */
function guvenli<T>(hesap: () => T | null): T | null {
    try {
        return hesap();
    } catch {
        return null;
    }
}

interface KoordinatProps {
    lat: number | undefined;
    lng: number | undefined;
}

const KartBasligi: React.FC<{ ikon: string; baslik: string; alt?: string }> = ({ ikon, baslik, alt }) => {
    const renkler = useRenkler();
    return (
        <View className="flex-row items-center gap-3 mb-4">
            <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: renkler.birincil + '20' }}>
                <FontAwesome5 name={ikon} size={18} color={renkler.birincil} />
            </View>
            <View>
                <Text className="text-lg font-bold" style={{ color: renkler.metin }}>{baslik}</Text>
                {alt ? <Text className="text-sm" style={{ color: renkler.metinIkincil }}>{alt}</Text> : null}
            </View>
        </View>
    );
};

/** Gösterilen günün ertesi gününün altı vakti. */
export const YarinVakitleriKarti: React.FC<KoordinatProps & { gunTarihiIso: string }> = React.memo(
    ({ lat, lng, gunTarihiIso }) => {
        const renkler = useRenkler();
        const yarin = React.useMemo(
            () => guvenli(() => (lat === undefined || lng === undefined ? null : yarinVakitleriniHesapla({ lat, lng }, gunTarihiIso))),
            [lat, lng, gunTarihiIso]
        );
        if (!yarin) return null;
        return (
            <View
                testID="genis-yarin-vakitleri"
                className="rounded-3xl border p-6 mb-6"
                style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 }}
            >
                <KartBasligi ikon="calendar-day" baslik="Yarın" alt={yarin.tarihMetni} />
                <View className="flex-row flex-wrap">
                    {yarin.satirlar.map((s) => (
                        <View
                            key={s.ad}
                            className="w-1/3 py-3"
                            accessible
                            accessibilityLabel={`Yarın ${s.ad} ${s.saat}`}
                        >
                            <Text className="text-sm" style={{ color: renkler.metinIkincil }}>{s.ad}</Text>
                            <Text className="text-2xl font-bold tabular-nums" style={{ color: renkler.metin }}>{s.saat}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }
);
YarinVakitleriKarti.displayName = 'YarinVakitleriKarti';

/** Kıble yönü (kuzeye göre) + Kıble sekmesine geçiş. Pusula sensörü KULLANMAZ. */
export const KibleMiniKarti: React.FC<KoordinatProps> = React.memo(({ lat, lng }) => {
    const renkler = useRenkler();
    const navigation = useNavigation<{ navigate: (ad: string) => void }>();
    const kible = React.useMemo(
        () => guvenli(() => (lat === undefined || lng === undefined ? null : kibleOzetiHesapla({ lat, lng }))),
        [lat, lng]
    );
    if (!kible) return null;
    return (
        <View
            testID="genis-kible"
            className="rounded-3xl border p-6 mb-6"
            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 }}
        >
            <KartBasligi ikon="kaaba" baslik="Kıble" alt={`Kuzeyden ${kible.derece}°, ${kible.yon}`} />
            <View className="flex-row items-center gap-6">
                {/* Statik yön gülü: N işareti üstte, ok kıble derecesinde (sensör yok). */}
                <View
                    className="w-28 h-28 rounded-full items-center justify-center border"
                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                >
                    <Text className="absolute top-1 text-xs font-bold" style={{ color: renkler.metinIkincil }}>K</Text>
                    {/* `location-arrow` 45°'yi (kuzeydoğu) gösterir → kıble derecesinden 45 düşülür. */}
                    <View style={{ transform: [{ rotate: `${kible.derece - 45}deg` }] }}>
                        <FontAwesome5 name="location-arrow" size={40} color={renkler.birincil} />
                    </View>
                </View>
                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4"
                    style={{ minHeight: 52, backgroundColor: renkler.birincil }}
                    onPress={() => navigation.navigate('Kible')}
                    accessibilityRole="button"
                    accessibilityLabel="Kıble pusulasını açın"
                >
                    <FontAwesome5 name="compass" size={16} color={renkler.birincilMetin} />
                    <Text className="font-bold text-base" style={{ color: renkler.birincilMetin }}>Pusulayı açın</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});
KibleMiniKarti.displayName = 'KibleMiniKarti';
