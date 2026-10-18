/**
 * Dönüşen "Kıldım" düğmesi — fiil: işaretle (sade tasarım, Dalga 1).
 *
 * Düğme kaybolup yerine bir onay gelmez; düğmenin KENDİSİ dönüşür (motion-choreography
 * "süreklilik"). Üç perde, toplam ~850 ms:
 *   1. hazırlık (180 ms): yeşil hap ortasına doğru daireye büzülür, "Kıldım" yazısı söner;
 *   2. eylem (yay ~420 ms): dairenin içinde ✓ yayla oturur, çevresinde halka BİR KEZ açılıp söner;
 *   3. sonuç (240 ms): daire sola kayar, yanına "Kılındı" gelir — ve öyle KALIR (kalıcı iz).
 *
 * Yalnız transform + opaklık (native driver; genişlik/köşe animasyonu YOK — hap → daire
 * `scaleX` ile taklit edilir). Animasyon YALNIZ `kilindi` false → true geçişinde oynar:
 * ekran açıldığında zaten kılınmış vakit son karesinde doğar (ana ekran saniyede bir
 * çizilir; her çizimde oynasaydı boşta hareket olurdu). "Animasyonları azalt" açıkken
 * son kareye atlar. Bilgi hareketle sınırlı değildir: metin "Kılındı" olur ve ekran
 * okuyucuya duyurulur.
 */
import * as React from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE, YAY } from './sureler';
import { NAMAZ_EYLEMI } from '../../../core/vakit/durumSozlugu';

const DAIRE = 48;

export interface KildimDugmesiProps {
    kilindi: boolean;
    /** Kılınmadıyken dokununca. */
    onKildim: () => void;
    /** Kılındıyken dokununca (geri alma); verilmezse kılınmış düğme dokunulmaz. */
    onGeriAl?: () => void;
    /** Ekran okuyucu etiketine eklenir: "Öğle — Kıldım". */
    vakitAdi?: string;
    devreDisi?: boolean;
    testID?: string;
}

export const KildimDugmesi: React.FC<KildimDugmesiProps> = React.memo(function KildimDugmesi({
    kilindi,
    onKildim,
    onGeriAl,
    vakitAdi,
    devreDisi = false,
    testID,
}) {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const [genislik, setGenislik] = React.useState(160);
    const baslangic = kilindi ? 1 : 0;
    const buzul = React.useRef(new Animated.Value(baslangic)).current;
    const daire = React.useRef(new Animated.Value(baslangic)).current;
    const halka = React.useRef(new Animated.Value(baslangic)).current;
    const sonuc = React.useRef(new Animated.Value(baslangic)).current;
    const onceki = React.useRef(kilindi);

    React.useEffect(() => {
        const eski = onceki.current;
        onceki.current = kilindi;
        if (eski === kilindi) return;
        const degerler = [buzul, daire, halka, sonuc];
        if (!kilindi || azalt) {
            // Geri alma ya da azaltılmış hareket: son kareye/başa anında.
            degerler.forEach((d) => d.setValue(kilindi ? 1 : 0));
            if (kilindi) AccessibilityInfo.announceForAccessibility?.(NAMAZ_EYLEMI.kilindi);
            return;
        }
        degerler.forEach((d) => d.setValue(0));
        Animated.sequence([
            Animated.timing(buzul, { toValue: 1, duration: SURE.buzulme, easing: EGRI.cikis, useNativeDriver: true }),
            Animated.parallel([
                Animated.spring(daire, { toValue: 1, ...YAY }),
                Animated.timing(halka, { toValue: 1, duration: SURE.halka, easing: EGRI.giris, useNativeDriver: true }),
            ]),
            Animated.timing(sonuc, { toValue: 1, duration: SURE.basariIcerik, easing: EGRI.giris, useNativeDriver: true }),
        ]).start();
        AccessibilityInfo.announceForAccessibility?.(NAMAZ_EYLEMI.kilindi);
    }, [kilindi, azalt, buzul, daire, halka, sonuc]);

    const olcu = (e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== genislik) setGenislik(w);
    };

    const dairePayi = Math.max(0, genislik / 2 - DAIRE / 2);
    const etiket = vakitAdi ? `${vakitAdi} — ${kilindi ? NAMAZ_EYLEMI.kilindi : NAMAZ_EYLEMI.kildim}` : kilindi ? NAMAZ_EYLEMI.kilindi : NAMAZ_EYLEMI.kildim;
    const dokunulabilir = !devreDisi && (!kilindi || !!onGeriAl);

    return (
        <TouchableOpacity
            testID={testID}
            onLayout={olcu}
            onPress={kilindi ? onGeriAl : onKildim}
            disabled={!dokunulabilir}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            accessibilityState={{ checked: kilindi, disabled: !dokunulabilir }}
            accessibilityHint={kilindi && onGeriAl ? 'Dokunursanız işaret kaldırılır' : undefined}
            style={[styles.kap, devreDisi && !kilindi ? { opacity: 0.5 } : null]}
        >
            {/* Hap: ortasına doğru daireye büzülür. */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.hap,
                    {
                        backgroundColor: renkler.birincil,
                        opacity: buzul.interpolate({ inputRange: [0, 0.9, 1], outputRange: [1, 1, 0] }),
                        transform: [{ scaleX: buzul.interpolate({ inputRange: [0, 1], outputRange: [1, DAIRE / genislik] }) }],
                    },
                ]}
            />
            <Animated.View
                pointerEvents="none"
                style={[styles.ortala, { opacity: buzul.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
            >
                <FontAwesome5 name="check" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                <Text style={[styles.yazi, { color: renkler.birincilMetin }]}>{NAMAZ_EYLEMI.kildim}</Text>
            </Animated.View>

            {/* Halka: bir kez açılıp söner. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.daire,
                    {
                        borderWidth: 2,
                        borderColor: renkler.basarili,
                        opacity: halka.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.6, 0] }),
                        transform: [
                            { translateX: sonuc.interpolate({ inputRange: [0, 1], outputRange: [0, -dairePayi] }) },
                            { scale: halka.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) },
                        ],
                    },
                ]}
            />

            {/* Daire + ✓: yayla oturur, sonra sola kayar. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.daire,
                    {
                        backgroundColor: renkler.basarili,
                        opacity: buzul.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] }),
                        transform: [
                            { translateX: sonuc.interpolate({ inputRange: [0, 1], outputRange: [0, -dairePayi] }) },
                            { scale: daire.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                        ],
                    },
                ]}
            >
                <FontAwesome5 name="check" size={18} color={renkler.birincilMetin} solid />
            </Animated.View>

            {/* Sonuç: "Kılındı" kalır. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.ortala,
                    {
                        paddingLeft: DAIRE,
                        opacity: sonuc,
                        transform: [{ translateX: sonuc.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                    },
                ]}
            >
                <Text style={[styles.yazi, { color: renkler.metin }]}>{NAMAZ_EYLEMI.kilindi}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    kap: { height: DAIRE, minWidth: 140, justifyContent: 'center', alignItems: 'center' },
    hap: { borderRadius: DAIRE / 2 },
    ortala: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    daire: {
        position: 'absolute',
        width: DAIRE,
        height: DAIRE,
        borderRadius: DAIRE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    yazi: { fontSize: 16, fontWeight: '700' },
});

/** Test/kanıt için: sahne kaç ms sürer (perdelerin toplamı, yay hariç tahmini). */
export const KILDIM_SAHNE_SURESI_MS = SURE.buzulme + SURE.halka + SURE.basariIcerik;
