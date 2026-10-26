/**
 * Küçük fiil animasyonları (sade tasarım, Dalga 1). Hepsi olayla başlar, < 1 sn biter,
 * yalnız transform/opaklık kullanır (native driver) ve "Animasyonları azalt"ta son
 * kareye atlar. Buradakiler olay sahneleridir, döngü kurmaz; tanıtım/sihirbaz ekranlarında
 * görünürken oynayan döngüler ayrı kapıdan geçer (`dongu.ts`, sahip kararı 2026-10-19).
 *
 *  - `useSecimGecisi(secili)`  → 0..1 değer; seçili dolgu katmanının OPAKLIĞI (150 ms).
 *                                 Renk animasyonu native driver'da yok; iki katmanın
 *                                 opaklık geçişi aynı yumuşak renk geçişini verir.
 *  - `useYayVurgu(deger)`      → değer DEĞİŞİNCE bir kez 1 → 1.12 → 1 yay ölçeği
 *                                 (anahtarın yanındaki ikon "yaylanır").
 *  - `SilinebilirSatir`        → satır çıkışı: sola kayıp söner (200 ms), sonra
 *                                 `onCikti` (listeden çıkarma + `LayoutAnimation`).
 *  - `BasariIsareti`           → tek seferlik başarı: ✓ yayla oturur + halka bir kez.
 */
import * as React from 'react';
import { Animated, LayoutAnimation, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE, YAY } from './sureler';
import { yatayIsaret } from '../common/yon';

export function useSecimGecisi(secili: boolean): Animated.Value {
    const azalt = useHareketAzalt();
    const deger = React.useRef(new Animated.Value(secili ? 1 : 0)).current;
    const ilk = React.useRef(true);
    React.useEffect(() => {
        if (ilk.current) {
            ilk.current = false;
            return;
        }
        if (azalt) {
            deger.setValue(secili ? 1 : 0);
            return;
        }
        Animated.timing(deger, { toValue: secili ? 1 : 0, duration: SURE.secim, useNativeDriver: true }).start();
    }, [secili, azalt, deger]);
    return deger;
}

export function useYayVurgu(tetik: unknown): Animated.Value {
    const azalt = useHareketAzalt();
    const olcek = React.useRef(new Animated.Value(1)).current;
    const onceki = React.useRef(tetik);
    React.useEffect(() => {
        if (Object.is(onceki.current, tetik)) return;
        onceki.current = tetik;
        if (azalt) return;
        olcek.setValue(1.12);
        Animated.spring(olcek, { toValue: 1, ...YAY }).start();
    }, [tetik, azalt, olcek]);
    return olcek;
}

export interface SilinebilirSatirProps {
    /** true olunca çıkış oynar, bitince `onCikti` çağrılır. */
    siliniyor: boolean;
    onCikti: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

/** Listeden çıkan satır. Geri al bandıyla birlikte kullanın (`geriAlBandiGoster`). */
export const SilinebilirSatir: React.FC<SilinebilirSatirProps> = ({ siliniyor, onCikti, children, style }) => {
    const azalt = useHareketAzalt();
    const ilerleme = React.useRef(new Animated.Value(0)).current;
    const cikti = React.useRef(onCikti);
    cikti.current = onCikti;

    React.useEffect(() => {
        if (!siliniyor) {
            ilerleme.setValue(0);
            return;
        }
        const bitir = () => {
            // Kalan satırlar yerine kayarak otursun (tek seferlik düzen geçişi).
            if (!azalt) LayoutAnimation.configureNext(LayoutAnimation.create(SURE.cikis, 'easeInEaseOut', 'opacity'));
            cikti.current();
        };
        if (azalt) {
            bitir();
            return;
        }
        Animated.timing(ilerleme, { toValue: 1, duration: SURE.cikis, easing: EGRI.cikis, useNativeDriver: true }).start(
            ({ finished }) => {
                if (finished) bitir();
            },
        );
    }, [siliniyor, azalt, ilerleme]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: ilerleme.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                    // Başa doğru kayar (sağdan solada sağa).
                    transform: [{ translateX: ilerleme.interpolate({ inputRange: [0, 1], outputRange: [0, -24 * yatayIsaret()] }) }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export interface BasariIsaretiProps {
    /** false → true geçişinde bir kez oynar; ilk çizimde true ise son karede doğar. */
    goster: boolean;
    boyut?: number;
    renk?: string;
}

export const BasariIsareti: React.FC<BasariIsaretiProps> = ({ goster, boyut = 56, renk }) => {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const r = renk ?? renkler.basarili;
    const ikon = React.useRef(new Animated.Value(goster ? 1 : 0)).current;
    const halka = React.useRef(new Animated.Value(goster ? 1 : 0)).current;
    const onceki = React.useRef(goster);

    React.useEffect(() => {
        const eski = onceki.current;
        onceki.current = goster;
        if (eski === goster) return;
        if (!goster || azalt) {
            ikon.setValue(goster ? 1 : 0);
            halka.setValue(goster ? 1 : 0);
            return;
        }
        ikon.setValue(0);
        halka.setValue(0);
        Animated.parallel([
            Animated.spring(ikon, { toValue: 1, ...YAY }),
            Animated.timing(halka, { toValue: 1, duration: SURE.halka, easing: EGRI.giris, useNativeDriver: true }),
        ]).start();
    }, [goster, azalt, ikon, halka]);

    const daire = { width: boyut, height: boyut, borderRadius: boyut / 2 };
    return (
        <View style={[daire, styles.ortala]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    daire,
                    {
                        borderWidth: 2,
                        borderColor: r,
                        opacity: halka.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.6, 0] }),
                        transform: [{ scale: halka.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    daire,
                    styles.ortala,
                    {
                        backgroundColor: r + '20',
                        opacity: ikon.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
                        transform: [{ scale: ikon.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
                    },
                ]}
            >
                <FontAwesome5 name="check" size={Math.round(boyut * 0.4)} color={r} solid />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    ortala: { alignItems: 'center', justifyContent: 'center' },
});
