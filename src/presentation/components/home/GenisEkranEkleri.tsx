/**
 * Geniş ekran (tablet / iPad iki bölme) ana sayfa ekleri: yarının vakitleri ve kıble yönü.
 *
 * Yalnız iki bölmeli düzende çizilir (`GunSayfasiDuzeni` `solEk`/`sagEk`); telefonda yoktur.
 * Hesap saf `core/anaEkran/genisEkranEkleri.ts`'te. Saniyelik ana ekran çiziminden yalıtmak
 * için bileşenler `React.memo`'dur ve yalnız dize/sayı prop alır.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
            <KartBasligi ikon="kaaba" baslik="Kıble yönü" alt={`Kuzeyden ${kible.derece}°, ${kible.yon}`} />
            <View className="items-center">
                {/* Statik yön gülü (sensör yok): K/D/G/B harfleri, ibre kıble derecesinde,
                    ucunda Kâbe. Telefonu kuzeye çevirince yön bu ibredir. */}
                <View
                    style={[gulStili.gul, { borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }]}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                >
                    <Text style={[gulStili.harf, gulStili.kuzey, { color: renkler.metin }]}>K</Text>
                    <Text style={[gulStili.harf, gulStili.dogu, { color: renkler.metinIkincil }]}>D</Text>
                    <Text style={[gulStili.harf, gulStili.guney, { color: renkler.metinIkincil }]}>G</Text>
                    <Text style={[gulStili.harf, gulStili.bati, { color: renkler.metinIkincil }]}>B</Text>
                    <View style={[gulStili.ibreKatmani, { transform: [{ rotate: `${kible.derece}deg` }] }]}>
                        <View style={[gulStili.kabe, { backgroundColor: renkler.birincil + '20' }]}>
                            <FontAwesome5 name="kaaba" size={22} color={renkler.birincil} />
                        </View>
                        <View style={[gulStili.ibre, { backgroundColor: renkler.birincil }]} />
                    </View>
                    <View style={[gulStili.merkez, { backgroundColor: renkler.birincil }]} />
                </View>
                <TouchableOpacity
                    className="self-stretch flex-row items-center justify-center gap-2 rounded-2xl px-4 mt-6"
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

const GUL = 220;
const gulStili = StyleSheet.create({
    gul: { width: GUL, height: GUL, borderRadius: GUL / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    harf: { position: 'absolute', fontSize: 14, fontWeight: '700' },
    kuzey: { top: 10 },
    guney: { bottom: 10 },
    dogu: { right: 14 },
    bati: { left: 14 },
    // Tam boy katman merkezden döner; ibre üst yarıdadır (dönmeden önce kuzeyi gösterir).
    ibreKatmani: { position: 'absolute', width: GUL, height: GUL, alignItems: 'center' },
    kabe: { marginTop: 30, width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ibre: { width: 4, height: GUL / 2 - 30 - 44, borderRadius: 2 },
    merkez: { width: 12, height: 12, borderRadius: 6 },
});
