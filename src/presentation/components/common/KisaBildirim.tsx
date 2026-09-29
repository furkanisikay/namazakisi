/**
 * Kısa, kendiliğinden kaybolan bilgi mesajı (toast) — iki platformda da çalışır.
 *
 * Neden var: `ToastAndroid` iOS'ta YOKTUR ve sessizce hiçbir şey yapmaz; "Konumunuz
 * güncellendi" gibi geri bildirimler iPhone'da hiç görünmüyordu. Android'de sistem
 * toast'ı aynen korunur (kullanıcının alıştığı görünüm), iOS'ta ise uygulama kökünde
 * duran `KisaBildirimKatmani` tema uyumlu bir hap çizer.
 *
 * Kullanım: `kisaBildirimGoster('Konumunuz güncellendi')`. Katman `App.tsx` kökünde
 * bir kez render edilir; çağıranın React ağacında olması gerekmez.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, ToastAndroid } from 'react-native';
import { useRenkler } from '../../../core/theme';

type Dinleyici = (mesaj: string, uzun: boolean) => void;
const dinleyiciler = new Set<Dinleyici>();

const KISA_SURE_MS = 2200;
const UZUN_SURE_MS = 3800;

export function kisaBildirimGoster(mesaj: string, uzun = false): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(mesaj, uzun ? ToastAndroid.LONG : ToastAndroid.SHORT);
        return;
    }
    dinleyiciler.forEach((d) => d(mesaj, uzun));
}

export const KisaBildirimKatmani: React.FC = () => {
    const renkler = useRenkler();
    const [mesaj, setMesaj] = useState<string | null>(null);
    const opaklik = useRef(new Animated.Value(0)).current;
    const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const dinleyici: Dinleyici = (yeniMesaj, uzun) => {
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
            setMesaj(yeniMesaj);
            // Ekran okuyucu görsel hapı fark etmez; mesajı açıkça duyur.
            AccessibilityInfo.announceForAccessibility(yeniMesaj);
            void AccessibilityInfo.isReduceMotionEnabled()
                .catch(() => false)
                .then((azHareket) => {
                    const sure = azHareket ? 0 : 180;
                    Animated.timing(opaklik, { toValue: 1, duration: sure, useNativeDriver: true }).start();
                    zamanlayici.current = setTimeout(() => {
                        Animated.timing(opaklik, { toValue: 0, duration: sure, useNativeDriver: true }).start(
                            ({ finished }) => { if (finished) setMesaj(null); },
                        );
                    }, uzun ? UZUN_SURE_MS : KISA_SURE_MS);
                });
        };
        dinleyiciler.add(dinleyici);
        return () => {
            dinleyiciler.delete(dinleyici);
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
        };
    }, [opaklik]);

    if (!mesaj) return null;

    return (
        <Animated.View pointerEvents="none" style={[styles.kap, { opacity: opaklik }]}>
            {/* Ters renk (metin rengi zemin, arka plan rengi yazı): iki temada da
                zeminden ayrışır ve kontrast temanın kendi metin kontrastıdır. */}
            <Text
                style={[styles.hap, { backgroundColor: renkler.metin, color: renkler.arkaplan }]}
                accessibilityLiveRegion="polite"
            >
                {mesaj}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    kap: {
        position: 'absolute',
        left: 24,
        right: 24,
        // Sekme çubuğunun üstünde dursun.
        bottom: 110,
        alignItems: 'center',
    },
    hap: {
        overflow: 'hidden',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
