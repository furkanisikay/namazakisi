import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

interface PaylasilabilirSeriProps {
    mevcutSeri: number;
    enUzunSeri: number;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export const PaylasilabilirSeri: React.FC<PaylasilabilirSeriProps> = ({ mevcutSeri, enUzunSeri }) => {

    return (
        <LinearGradient
            colors={['#ea580c', '#c2410c']} // Turuncu tonları (Ateş teması)
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center justify-center p-8 rounded-3xl relative overflow-hidden"
            style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5 }}
        >
            {/* Arka plan dekorları */}
            <View className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <View className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-yellow-500/10 blur-3xl" />

            {/* Üst Bilgi - En Uzun Seri */}
            <View className="absolute top-8 flex-row items-center space-x-2 bg-black/20 px-4 py-2 rounded-full">
                <FontAwesome5
                    name="trophy"
                    size={12}
                    color="#fde047"
                    style={{ marginRight: 6 }}
                />
                <Text className="text-white/90 text-xs font-semibold">
                    En Uzun Serim: {enUzunSeri} Gün
                </Text>
            </View>

            {/* Ana İçerik */}
            <View className="items-center z-10">

                {/* Ateş İkonu */}
                <View className="mb-4 relative">
                    <MaterialIcons name="local-fire-department" size={100} color="#fde047" style={{
                        textShadowColor: 'rgba(0, 0, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 4 },
                        textShadowRadius: 10
                    }} />
                </View>

                {/* Gün Sayısı */}
                <Text className="text-white text-8xl font-black tracking-tighter shadow-sm" style={{ includeFontPadding: false }}>
                    {mevcutSeri}
                </Text>

                <Text className="text-white/90 text-xl font-bold uppercase tracking-widest mb-8">
                    GÜNDÜR ZİNCİRİ KIRMADIM!
                </Text>

                {/* Motivasyon Mesajı */}
                <View className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20">
                    <Text className="text-white text-center font-medium text-base leading-6 italic">
                        "Her gün küçük bir adım, ruhumda büyük bir huzur. 🔥"
                    </Text>
                </View>

            </View>

            {/* Alt Logo */}
            <View className="absolute bottom-8 flex-row items-center opacity-90">
                <FontAwesome5 name="mosque" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold tracking-widest uppercase text-xs">Namaz Akışı</Text>
            </View>

        </LinearGradient>
    );
};
