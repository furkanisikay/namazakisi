/**
 * Günün beş vakti tamamlanınca kısa, sessiz dua kartı: "Allah kabul etsin" (büyük, okumaktan
 * kaçınan kullanıcı için 3 kelime) + "Bugün beş vakti tamamladınız." (küçük bilgi satırı).
 *
 * Koreografi (motion-choreography): OLAYLA başlar (beşinci vakit işaretlenince), tek sefer —
 * aşağıdan 8 dp yükselerek belirir (220 ms), ~3,4 sn durur, söner (200 ms) ve kaldırılır.
 * Dokunuşları ENGELLEMEZ (`pointerEvents="none"`). "Animasyonları azalt" açıksa son karesiyle
 * görünür, aynı süre sonunda hareketsiz kalkar. Ekran okuyucuya tek cümle duyurulur.
 * Övgü/abartı yok: namaz bir başarı gösterisi değildir, dua karşılıklı bir nezakettir.
 */
import * as React from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { TAM_GUN_METNI } from '../../../core/samimiyet/kabulDuasi';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE } from '../hareket/sureler';

/** Kartın ekranda kaldığı süre (giriş + bekleme). */
export const GUN_TAMAM_SURESI_MS = 3600;

export interface GunTamamMesajiProps {
    gorunur: boolean;
    onBitti: () => void;
}

export const GunTamamMesaji: React.FC<GunTamamMesajiProps> = ({ gorunur, onBitti }) => {
    const renkler = useRenkler();
    const azalt = useHareketAzalt();
    const deger = React.useRef(new Animated.Value(0)).current;
    const onBittiRef = React.useRef(onBitti);
    onBittiRef.current = onBitti;

    React.useEffect(() => {
        if (!gorunur) return;
        AccessibilityInfo.announceForAccessibility?.(`${TAM_GUN_METNI.alt} ${TAM_GUN_METNI.ana}.`);
        if (azalt) {
            deger.setValue(1);
        } else {
            deger.setValue(0);
            Animated.timing(deger, { toValue: 1, duration: SURE.giris, easing: EGRI.giris, useNativeDriver: true }).start();
        }
        const zamanlayici = setTimeout(() => {
            if (azalt) {
                onBittiRef.current();
                return;
            }
            Animated.timing(deger, { toValue: 0, duration: SURE.cikis, easing: EGRI.cikis, useNativeDriver: true }).start(
                () => onBittiRef.current()
            );
        }, GUN_TAMAM_SURESI_MS);
        return () => clearTimeout(zamanlayici);
    }, [gorunur, azalt, deger]);

    if (!gorunur) return null;
    return (
        <View pointerEvents="none" style={stiller.kap} testID="gun-tamam-mesaji">
            <Animated.View
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
                style={[
                    stiller.kart,
                    {
                        backgroundColor: renkler.kartArkaplan,
                        borderColor: renkler.basarili,
                        opacity: deger,
                        transform: [{ translateY: deger.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                    },
                ]}
            >
                <View style={[stiller.cip, { backgroundColor: renkler.basarili + '20' }]}>
                    <FontAwesome5 name="check-circle" size={22} color={renkler.basarili} solid />
                </View>
                <Text style={[stiller.ana, { color: renkler.metin }]}>{TAM_GUN_METNI.ana}</Text>
                <Text style={[stiller.alt, { color: renkler.metinIkincil }]}>{TAM_GUN_METNI.alt}</Text>
            </Animated.View>
        </View>
    );
};

const stiller = StyleSheet.create({
    kap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    kart: {
        alignItems: 'center',
        paddingVertical: 22,
        paddingHorizontal: 28,
        borderRadius: 24,
        borderWidth: 1,
        maxWidth: 360,
        elevation: 6,
    },
    cip: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    ana: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
    alt: { fontSize: 15, marginTop: 6, textAlign: 'center' },
});
