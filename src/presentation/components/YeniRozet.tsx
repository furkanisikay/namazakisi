import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useRenkler } from '../../core/theme';
import { useDonguAcik } from './hareket/dongu';

interface YeniRozetProps {
    /** Metin (varsayılan: "Yeni") */
    etiket?: string;
}

/**
 * Küçük "Yeni" rozeti — menü öğeleri ve başlıkların yanında kullanılır.
 * Hafif bir nabızla dikkat çeker ama rahatsız etmez: ayar listesinde olduğu için
 * ekran ilk görünür olduğunda YALNIZ BİR KEZ (iki nabız) oynar, sonra durur
 * (AGENTS hareket kuralı; denetim D-16 — eskiden Ayarlar'da sonsuza dek dönüyordu).
 * Odak dışı / arka plan / "Animasyonları azalt"ta oynamaz; dinlenme pozu ölçek 1.
 */
export const YeniRozet: React.FC<YeniRozetProps> = ({ etiket = 'Yeni' }) => {
    const renkler = useRenkler();
    const nabiz = useRef(new Animated.Value(1)).current;
    const acik = useDonguAcik();
    const oynandi = useRef(false);

    useEffect(() => {
        if (!acik || oynandi.current) return;
        oynandi.current = true;
        const tekNabiz = () =>
            Animated.sequence([
                Animated.timing(nabiz, { toValue: 1.12, duration: 850, useNativeDriver: true }),
                Animated.timing(nabiz, { toValue: 1, duration: 850, useNativeDriver: true }),
            ]);
        const animasyon = Animated.sequence([tekNabiz(), tekNabiz()]);
        animasyon.start();
        return () => {
            animasyon.stop();
            nabiz.setValue(1);
        };
    }, [acik, nabiz]);

    return (
        <Animated.View
            accessibilityRole="text"
            accessibilityLabel={etiket}
            style={{
                backgroundColor: renkler.birincil,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                transform: [{ scale: nabiz }],
            }}
        >
            <Text style={{ color: renkler.birincilMetin, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
                {etiket}
            </Text>
        </Animated.View>
    );
};
