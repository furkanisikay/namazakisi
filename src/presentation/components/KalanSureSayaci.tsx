import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRenkler } from '../../core/theme';

interface KalanSureSayaciProps {
    hedefZaman: Date | null;
    vakitAdi: string;
}

export const KalanSureSayaci: React.FC<KalanSureSayaciProps> = ({ hedefZaman, vakitAdi }) => {
    const renkler = useRenkler();
    const [kalanSure, setKalanSure] = useState<string>('00:00:00');
    const pulseAnim = useMemo(() => new Animated.Value(1), []);

    useEffect(() => {
        if (!hedefZaman) return;

        const guncelle = () => {
            const simdi = new Date().getTime();
            const hedef = hedefZaman.getTime();
            const fark = hedef - simdi;

            if (fark <= 0) {
                setKalanSure('00:00:00');
                return;
            }

            const saat = Math.floor((fark / (1000 * 60 * 60)) % 24);
            const dakika = Math.floor((fark / (1000 * 60)) % 60);
            const saniye = Math.floor((fark / 1000) % 60);

            const formatli = `${saat.toString().padStart(2, '0')}:${dakika.toString().padStart(2, '0')}:${saniye.toString().padStart(2, '0')}`;
            setKalanSure(formatli);

            // Son 5 dakika ise nabiz animasyonu yap
            if (fark < 5 * 60 * 1000) {
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                ]).start();
            }
        };

        guncelle();
        const interval = setInterval(guncelle, 1000);
        return () => clearInterval(interval);
    }, [hedefZaman, pulseAnim]);

    if (!hedefZaman) return null;

    return (
        <View style={[styles.container, { backgroundColor: renkler.kartArkaplan + '80' }]}>
            <Text style={[styles.etiket, { color: renkler.metinIkincil }]}>
                {vakitAdi.toUpperCase()} VAKTİNE KALAN
            </Text>
            <Animated.Text style={[
                styles.sayac,
                { color: renkler.birincil, transform: [{ scale: pulseAnim }] }
            ]}>
                {kalanSure}
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    etiket: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    sayac: {
        fontSize: 18,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
});
