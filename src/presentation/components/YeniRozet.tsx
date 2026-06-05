import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useRenkler } from '../../core/theme';

interface YeniRozetProps {
    /** Metin (varsayılan: "Yeni") */
    etiket?: string;
}

/**
 * Küçük "Yeni" rozeti — menü öğeleri ve başlıkların yanında kullanılır.
 * Hafif bir nabız animasyonuyla dikkat çeker ama rahatsız etmez.
 */
export const YeniRozet: React.FC<YeniRozetProps> = ({ etiket = 'Yeni' }) => {
    const renkler = useRenkler();
    const nabiz = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animasyon = Animated.loop(
            Animated.sequence([
                Animated.timing(nabiz, { toValue: 1.12, duration: 850, useNativeDriver: true }),
                Animated.timing(nabiz, { toValue: 1, duration: 850, useNativeDriver: true }),
            ])
        );
        animasyon.start();
        return () => animasyon.stop();
    }, [nabiz]);

    return (
        <Animated.View
            style={{
                backgroundColor: renkler.birincil,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                transform: [{ scale: nabiz }],
            }}
        >
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
                {etiket}
            </Text>
        </Animated.View>
    );
};
