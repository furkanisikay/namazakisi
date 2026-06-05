import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import type { YeniOzellik } from '../../core/constants/YeniOzellikler';

interface YeniOzellikKartiProps {
    ozellik: YeniOzellik;
    /** CTA / karta dokunma → özelliği aç (görüldü işaretlenir) */
    onAc: () => void;
    /** X → kartı kapat (rozet kalır) */
    onKapat: () => void;
}

/**
 * Ayarlar ekranının üstünde görünen, kapatılabilir tanıtım kartı.
 * Çekirdek akışa (anasayfa/vakit) dokunmaz; yalnızca Ayarlar'a girince görünür.
 */
export const YeniOzellikKarti: React.FC<YeniOzellikKartiProps> = ({ ozellik, onAc, onKapat }) => {
    const renkler = useRenkler();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-12)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.timing(translateY, {
                toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
                marginHorizontal: 16,
                marginBottom: 16,
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: `${renkler.birincil}40`,
                backgroundColor: `${renkler.birincil}10`,
            }}
        >
            <View className="p-4">
                <View className="flex-row items-center mb-2">
                    <View
                        className="px-2 py-0.5 rounded-full mr-2"
                        style={{ backgroundColor: renkler.birincil }}
                    >
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
                            YENİ
                        </Text>
                    </View>
                    <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                        Uygulamaya eklendi
                    </Text>
                    <TouchableOpacity
                        onPress={onKapat}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        style={{ marginLeft: 'auto' }}
                    >
                        <FontAwesome5 name="times" size={14} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-start">
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}20` }}
                    >
                        <FontAwesome5 name={ozellik.ikon} size={18} color={renkler.birincil} solid />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                            {ozellik.baslik}
                        </Text>
                        <Text className="text-xs mt-1 leading-5" style={{ color: renkler.metinIkincil }}>
                            {ozellik.aciklama}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-center mt-3 py-3 rounded-xl"
                    style={{ backgroundColor: renkler.birincil }}
                    onPress={onAc}
                    activeOpacity={0.85}
                >
                    <FontAwesome5 name="arrow-right" size={13} color="#FFF" style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold" style={{ color: '#FFF' }}>
                        {ozellik.ctaEtiketi ?? 'İncele'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
