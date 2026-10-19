/**
 * Tanıtım resmi — tonlu halka içinde ana ikon + çevresinde küçük eşlik ikonları
 * (ör. hilal ve yıldızlar). Sayfa başlığını TEKRAR ETMEZ (başlık header'da); yalnız
 * görsel anlatıdır, dekoratif (ekran okuyucudan gizli).
 *
 *  - Girişte BİR KEZ: halka yayla oturur, eşlik ikonları sırayla (≈90 ms arayla) belirir.
 *  - `dongu`: tanıtım/boş durum ekranında, görünürken halka yavaşça nefes alır
 *    (`useDonguAcik` kapısı). Ayar listelerinde VERMEYİN.
 *  - "Animasyonları azalt"ta son karede doğar. Yalnız transform/opaklık, native driver.
 */
import * as React from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { useDonguAcik, useDonguAnimasyonu } from './dongu';
import { YAY } from './sureler';

export interface EslikIkonu {
    ikon: string;
    /** Merkeze göre konum (dp). */
    x: number;
    y: number;
    boyut?: number;
}

export interface TanitimResmiProps {
    ikon: string;
    /** Dekoratif renk (tema token'ı ya da sayfanın kendi vurgu rengi). */
    renk: string;
    eslik?: EslikIkonu[];
    dongu?: boolean;
    boyut?: number;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const TanitimResmi: React.FC<TanitimResmiProps> = ({ ikon, renk, eslik = [], dongu = false, boyut = 84, style, testID }) => {
    const azalt = useHareketAzalt();
    const donguAcik = useDonguAcik();
    const giris = React.useRef(new Animated.Value(azalt ? 1 : 0)).current;
    const nefes = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (azalt) {
            giris.setValue(1);
            return;
        }
        const a = Animated.spring(giris, { toValue: 1, ...YAY });
        a.start();
        return () => a.stop();
    }, [azalt, giris]);

    useDonguAnimasyonu(
        dongu && donguAcik,
        () =>
            Animated.sequence([
                Animated.timing(nefes, { toValue: 1.1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(nefes, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]),
        () => nefes.setValue(1),
    );

    const alan = boyut * 1.9;
    return (
        <View
            testID={testID}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[{ alignSelf: 'center', width: alan, height: alan * 0.82, alignItems: 'center', justifyContent: 'center' }, style]}
        >
            <Animated.View
                style={{
                    position: 'absolute',
                    width: boyut * 1.45,
                    height: boyut * 1.45,
                    borderRadius: boyut,
                    backgroundColor: renk + '12',
                    opacity: giris,
                    transform: [{ scale: Animated.multiply(nefes, giris.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] })) }],
                }}
            />
            <Animated.View
                style={{
                    width: boyut,
                    height: boyut,
                    borderRadius: boyut / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: renk + '22',
                    transform: [{ scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
                }}
            >
                <FontAwesome5 name={ikon} size={Math.round(boyut * 0.42)} color={renk} solid />
            </Animated.View>
            {eslik.map((e, i) => {
                const bas = Math.min(0.9, 0.25 + i * 0.12);
                return (
                    <Animated.View
                        key={`${e.ikon}-${i}`}
                        style={{
                            position: 'absolute',
                            opacity: giris.interpolate({ inputRange: [0, bas, 1], outputRange: [0, 0, 1] }),
                            transform: [
                                { translateX: e.x },
                                { translateY: giris.interpolate({ inputRange: [0, 1], outputRange: [e.y + 6, e.y] }) },
                            ],
                        }}
                    >
                        <FontAwesome5 name={e.ikon} size={e.boyut ?? 12} color={renk} solid />
                    </Animated.View>
                );
            })}
        </View>
    );
};
