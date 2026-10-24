/**
 * iPhone "Namazda sessiz" rehberinin görsel parçaları.
 *
 * - `OdakSemasi`  — imza öğesi: iki tetik (cami, vakit) → "Namaz" Odak hapı → sessiz
 *                   hatırlatmalar. Statiktir; kullanıcı neyi kurduğunu tek bakışta görür.
 * - `KurulumAdimi` — sıralı adım çerçevesi. "Tamamladım"a basınca numara dairesi dolup
 *                   ✓'e dönüşür, bir sonraki adıma giden çizgi yukarıdan aşağı dolar
 *                   (tek seferlik, ~0,5 sn; "Animasyonları azalt" açıksa anında).
 * - `YolCipleri`  — iPhone'da dokunulacak yerlerin sırası (Ayarlar › Odak › …).
 * - `KisayolBlogu` — Kısayollar düzenleyicisindeki bir eylemin sade karşılığı.
 */
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

type Renkler = ReturnType<typeof useRenkler>;

const Cip: React.FC<{ ikon: string; metin: string; renkler: Renkler; vurgulu?: boolean }> = ({
    ikon,
    metin,
    renkler,
    vurgulu,
}) => (
    <View
        className="flex-row items-center rounded-full px-3 py-1.5"
        style={{
            backgroundColor: vurgulu ? renkler.birincil : renkler.kartArkaplan,
            borderWidth: vurgulu ? 0 : 1,
            borderColor: renkler.sinir,
        }}
    >
        <FontAwesome5 name={ikon} size={12} color={vurgulu ? renkler.birincilMetin : renkler.birincil} solid />
        <Text className="text-xs font-semibold ml-1.5" style={{ color: vurgulu ? renkler.birincilMetin : renkler.metin }}>
            {metin}
        </Text>
    </View>
);

/** Kısa dikey bağlantı çizgisi (tetikten haba, haptan sonuca). */
const Bag: React.FC<{ renk: string }> = ({ renk }) => (
    <View style={{ width: 2, height: 14, backgroundColor: renk, alignSelf: 'center', borderRadius: 1 }} />
);

export const OdakSemasi: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().cami.ios;
    const cizgi = `${renkler.birincil}55`;
    return (
        <View
            testID="odak-semasi"
            accessible
            accessibilityLabel={m.semaErisim}
            className="p-5 items-center"
            style={{ backgroundColor: `${renkler.birincil}12`, borderRadius: 24 }}
        >
            {/* Eşit genişlikli iki kolon: bağ çizgileri %25 ve %75'te durur, yatay bağ tam
                onların arasında kalır (çip genişliğinden bağımsız). */}
            <View className="flex-row" style={{ alignSelf: 'stretch' }}>
                <View className="items-center" style={{ flex: 1 }}>
                    <Cip ikon="map-marker-alt" metin={m.camiyeVarinca} renkler={renkler} />
                    <Bag renk={cizgi} />
                </View>
                <View className="items-center" style={{ flex: 1 }}>
                    <Cip ikon="clock" metin={m.vakitGirince} renkler={renkler} />
                    <Bag renk={cizgi} />
                </View>
            </View>
            <View style={{ width: '50%', height: 2, backgroundColor: cizgi, borderRadius: 1 }} />
            <Bag renk={cizgi} />
            {/* iPhone Denetim Merkezi'ndeki Odak düğmesinin sade karşılığı */}
            <View
                className="flex-row items-center rounded-full pl-1.5 pr-5 py-1.5"
                style={{
                    backgroundColor: renkler.kartArkaplan,
                    shadowColor: renkler.birincil,
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                }}
            >
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: renkler.birincil }}>
                    <FontAwesome5 name="moon" size={17} color={renkler.birincilMetin} solid />
                </View>
                <View className="ml-3">
                    <Text className="text-lg font-bold" style={{ color: renkler.metin }}>
                        {m.odakAdi}
                    </Text>
                    <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                        {m.odakAcik}
                    </Text>
                </View>
            </View>
            <Bag renk={cizgi} />
            <Cip ikon="bell-slash" metin={m.telefonSessiz} renkler={renkler} vurgulu />
        </View>
    );
};

interface KurulumAdimiProps {
    sira: number;
    baslik: string;
    tamam: boolean;
    onDegistir: () => void;
    son?: boolean;
    testID?: string;
    children: React.ReactNode;
}

export const KurulumAdimi: React.FC<KurulumAdimiProps> = ({ sira, baslik, tamam, onDegistir, son, testID, children }) => {
    const renkler = useRenkler();
    const m = useMetin().cami.ios;
    const azalt = useHareketAzalt();
    const dolu = useRef(new Animated.Value(tamam ? 1 : 0)).current;
    const cizgi = useRef(new Animated.Value(tamam ? 1 : 0)).current;
    const ilk = useRef(true);

    useEffect(() => {
        const hedef = tamam ? 1 : 0;
        // İlk çizimde (kayıt diskten gelince) sahne oynamaz: yalnız kullanıcı eylemi oynatır.
        if (ilk.current || azalt) {
            ilk.current = false;
            dolu.setValue(hedef);
            cizgi.setValue(hedef);
            return;
        }
        const sahne = tamam
            ? Animated.sequence([
                  Animated.spring(dolu, { toValue: 1, useNativeDriver: true, friction: 5, tension: 140 }),
                  Animated.timing(cizgi, { toValue: 1, duration: 260, useNativeDriver: true }),
              ])
            : Animated.parallel([
                  Animated.timing(dolu, { toValue: 0, duration: 160, useNativeDriver: true }),
                  Animated.timing(cizgi, { toValue: 0, duration: 160, useNativeDriver: true }),
              ]);
        sahne.start();
        return () => sahne.stop();
    }, [tamam, azalt, dolu, cizgi]);

    const olcek = dolu.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

    return (
        <View className="flex-row" testID={testID}>
            <View className="items-center mr-3.5" style={{ width: 32 }}>
                <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ borderWidth: 2, borderColor: renkler.birincil, backgroundColor: renkler.arkaplan }}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                >
                    <Text className="text-sm font-bold" style={{ color: renkler.birincil }}>
                        {sira}
                    </Text>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: renkler.birincil,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: dolu,
                            transform: [{ scale: olcek }],
                        }}
                    >
                        <FontAwesome5 name="check" size={13} color={renkler.birincilMetin} solid />
                    </Animated.View>
                </View>
                {!son && (
                    <View className="flex-1 my-1.5" style={{ width: 2, backgroundColor: renkler.sinir, borderRadius: 1, overflow: 'hidden' }}>
                        <Animated.View
                            style={{
                                flex: 1,
                                backgroundColor: renkler.birincil,
                                transformOrigin: 'top',
                                transform: [{ scaleY: cizgi }],
                            }}
                        />
                    </View>
                )}
            </View>
            <View className="flex-1" style={{ paddingBottom: son ? 0 : 28 }}>
                <Text className="text-base font-bold" style={{ color: renkler.metin, marginTop: 5 }} accessibilityRole="header">
                    {baslik}
                </Text>
                <View className="mt-3">{children}</View>
                <TouchableOpacity
                    testID={testID ? `${testID}-tamam` : undefined}
                    onPress={onDegistir}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: tamam }}
                    accessibilityLabel={bicim(m.tamamladimErisim, { baslik })}
                    className="flex-row items-center self-start rounded-full px-4 mt-4"
                    style={{
                        minHeight: 44,
                        backgroundColor: tamam ? `${renkler.birincil}18` : renkler.arkaplan,
                        borderWidth: 1,
                        borderColor: tamam ? renkler.birincil : renkler.sinir,
                    }}
                >
                    <FontAwesome5
                        name={tamam ? 'check-circle' : 'circle'}
                        size={15}
                        color={tamam ? renkler.birincil : renkler.metinIkincil}
                        solid={tamam}
                    />
                    <Text className="text-sm font-semibold ml-2" style={{ color: renkler.metin }}>
                        {tamam ? m.tamamlandi : m.tamamladim}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/** iPhone'da sırayla dokunulacak yerler. Son çip hedeftir (vurgulu). */
export const YolCipleri: React.FC<{ adimlar: readonly string[]; testID?: string }> = ({ adimlar, testID }) => {
    const renkler = useRenkler();
    const m = useMetin().cami.ios;
    return (
        <View testID={testID} className="flex-row flex-wrap items-center" style={{ rowGap: 8 }} accessible accessibilityLabel={adimlar.join(m.yolAyirici)}>
            {adimlar.map((a, i) => {
                const son = i === adimlar.length - 1;
                return (
                    <View key={`${a}-${i}`} className="flex-row items-center">
                        <View
                            className="rounded-lg px-2.5 py-1.5"
                            style={{
                                backgroundColor: son ? `${renkler.birincil}1F` : renkler.arkaplan,
                                borderWidth: 1,
                                borderColor: son ? renkler.birincil : renkler.sinir,
                            }}
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                {a}
                            </Text>
                        </View>
                        {!son && (
                            <View className="mx-1.5">
                                <FontAwesome5 name="chevron-right" size={9} color={renkler.metinIkincil} />
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

/** Kısayollar düzenleyicisindeki bir satırın sade karşılığı. */
export const KisayolBlogu: React.FC<{ ikon: string; baslik: string; ayrinti: string; girinti?: boolean }> = ({
    ikon,
    baslik,
    ayrinti,
    girinti,
}) => {
    const renkler = useRenkler();
    return (
        <View
            className="flex-row items-center rounded-2xl p-3 mb-2"
            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, marginLeft: girinti ? 18 : 0 }}
        >
            <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${renkler.birincil}20` }}>
                <FontAwesome5 name={ikon} size={13} color={renkler.birincil} solid />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {ayrinti}
                </Text>
            </View>
        </View>
    );
};
