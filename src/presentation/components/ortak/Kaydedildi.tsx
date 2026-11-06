/**
 * "Kaydedildi" geri bildirimi — geri alınabilir ayarlarda kayıt sessizdir, ama İLK
 * değişiklikte küçük bir onay gösterilir (plan §7.3). Kayıt BİTMEDEN gösterilmez:
 * `goster()`'ü yazım çözüldükten sonra çağırın.
 *
 * Kullanım:
 *   const kaydedildi = useKaydedildi();
 *   await dispatch(ayariGuncelle(...)).unwrap(); kaydedildi.goster();
 *   <KaydedildiIsareti {...kaydedildi.ozellikler} />
 *
 * Yerinde, küçük: ✓ + "Kaydedildi", 1,6 sn sonra söner; ekran okuyucuya bir kez duyurulur.
 * `yalnizIlk` (varsayılan true): ekran açıkken yalnız ilk kayıtta gösterilir.
 */
import * as React from 'react';
import { AccessibilityInfo, Animated, Text, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { SURE } from '../hareket/sureler';
import { metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export const KAYDEDILDI_SURESI_MS = 1600;
/** "Kaydedildi" (etkin dilde). */
export const kaydedildiMetni = (): string => metin().genel.ortak.kaydedildi;

export interface KaydedildiIsaretiProps {
    gorunur: boolean;
    style?: StyleProp<ViewStyle>;
}

export function useKaydedildi(yalnizIlk = true): { goster: () => void; ozellikler: KaydedildiIsaretiProps } {
    const [gorunur, setGorunur] = React.useState(false);
    const gosterildi = React.useRef(false);
    const zamanlayici = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    React.useEffect(() => () => {
        if (zamanlayici.current) clearTimeout(zamanlayici.current);
    }, []);
    const goster = React.useCallback(() => {
        if (yalnizIlk && gosterildi.current) return;
        gosterildi.current = true;
        if (zamanlayici.current) clearTimeout(zamanlayici.current);
        setGorunur(true);
        AccessibilityInfo.announceForAccessibility?.(kaydedildiMetni());
        zamanlayici.current = setTimeout(() => setGorunur(false), KAYDEDILDI_SURESI_MS);
    }, [yalnizIlk]);
    return { goster, ozellikler: { gorunur } };
}

export const KaydedildiIsareti: React.FC<KaydedildiIsaretiProps> = ({ gorunur, style }) => {
    const renkler = useRenkler();
    const m = useMetin().genel.ortak;
    const azalt = useHareketAzalt();
    const opaklik = React.useRef(new Animated.Value(gorunur ? 1 : 0)).current;
    React.useEffect(() => {
        if (azalt) {
            opaklik.setValue(gorunur ? 1 : 0);
            return;
        }
        Animated.timing(opaklik, { toValue: gorunur ? 1 : 0, duration: SURE.durum, useNativeDriver: true }).start();
    }, [gorunur, azalt, opaklik]);
    return (
        <Animated.View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[{ flexDirection: 'row', alignItems: 'center', opacity: opaklik }, style]}
        >
            <FontAwesome5 name="check-circle" size={12} color={renkler.basarili} solid style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: renkler.metinIkincil }}>{m.kaydedildi}</Text>
        </Animated.View>
    );
};
