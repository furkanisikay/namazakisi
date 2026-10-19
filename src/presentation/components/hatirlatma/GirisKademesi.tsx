/**
 * Açılış koreografisi için kademeli giriş: içerik bölümleri sheet yükselirken 40 ms
 * arayla aşağıdan süzülür (opaklık + kayma, native driver). Yalnız doğuşta bir kez;
 * "Animasyonları azalt" açıksa son kare doğrudan çizilir. Bilgi beklemez — içerik
 * ilk karede de ağaçtadır (ekran okuyucu ve testler için).
 */
import * as React from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI } from '../hareket/sureler';

/** Bölümler arası gecikme (ms). */
export const KADEME_ARALIGI_MS = 40;
/** Sheet'in yükselişi başlasın diye ilk bölümün beklemesi. */
const ILK_BEKLEME_MS = 90;
const SURE_MS = 260;

export const GirisKademesi: React.FC<{
    sira: number;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /** İlk bölümden önceki bekleme (açılır bölümde 0: dokunuşa anında cevap). */
    ilkBeklemeMs?: number;
}> = ({ sira, children, style, ilkBeklemeMs = ILK_BEKLEME_MS }) => {
    const azalt = useHareketAzalt();
    const deger = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        if (azalt) {
            deger.setValue(1);
            return;
        }
        const a = Animated.timing(deger, {
            toValue: 1,
            duration: SURE_MS,
            delay: ilkBeklemeMs + sira * KADEME_ARALIGI_MS,
            easing: EGRI.giris,
            useNativeDriver: true,
        });
        a.start();
        return () => a.stop();
        // Yalnız doğuşta.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [azalt]);
    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: deger,
                    transform: [{ translateY: deger.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};
