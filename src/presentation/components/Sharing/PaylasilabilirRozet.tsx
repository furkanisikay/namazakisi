import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { RozetDetay, RozetSeviyesi, rozetMetni } from '../../../core/types/SeriTipleri';
import { useMetin } from '../../hooks/useMetin';

interface PaylasilabilirRozetProps {
    rozet: RozetDetay;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Story formatına uygun genişlik (yaklaşık)

export const PaylasilabilirRozet: React.FC<PaylasilabilirRozetProps> = ({ rozet }) => {
    const m = useMetin().seri.paylasim;
    // Ad kimlikten, etkin dilde (slice'taki kopya dil değişince bayatlar).
    const rozetAdi = rozetMetni(rozet.id)?.ad ?? rozet.ad;

    // Rozet seviyesine göre renk belirleme
    const seviyeRengiAl = (seviye: RozetSeviyesi): readonly [string, string, ...string[]] => {
        switch (seviye) {
            case 'bronz': return ['#CD7F32', '#A0522D'];
            case 'gumus': return ['#C0C0C0', '#808080'];
            case 'altin': return ['#FFD700', '#DAA520'];
            case 'elmas': return ['#B9F2FF', '#00BFFF'];
            default: return ['#4ade80', '#22c55e'];
        }
    };

    const gradientColors = seviyeRengiAl(rozet.seviye);

    // Motivasyon mesajları (Ben Dili) - Aynı rozet için deterministik mesaj
    const getMotivationMessage = () => {
        const messages = m.rozetSozleri;
        
        // Rozet ID'sine göre deterministik bir indeks hesapla
        const key = String(rozet.id);
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
        }
        const index = hash % messages.length;
        
        return messages[index];
    };

    const rozetIkonuAl = (emojiIkon: string): string => {
        // RozetKarti.tsx'den alındı, tutarlılık için
        const ROZET_IKONLARI: Record<string, string> = {
            '🌱': 'seedling',
            '🔥': 'fire-alt',
            '💎': 'gem',
            '👑': 'crown',
            '🔄': 'sync-alt',
            '⭐': 'star',
            '💯': 'percent',
            '🏅': 'medal',
        };
        return ROZET_IKONLARI[emojiIkon] || 'award';
    };

    return (
        <LinearGradient
            colors={['#1a1a1a', '#2d3748']} // [AYAR] Kart arka plan renkleri
            // [AYAR] Kart boyutu ve köşe yuvarlaklıği
            style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 24, padding: 32 }}
            className="items-center justify-center"
        >
            {/* [BOLUM] Üst Başlık */}
            <View className="absolute top-8 flex-row items-center">
                {/* Seviye Etiketi */}
                <View
                    className="flex-row items-center px-3 py-1 rounded-full bg-white/10 border border-white/20"
                    style={{ borderColor: gradientColors[0] }}
                >
                    <FontAwesome5
                        name={rozet.seviye === 'elmas' ? 'gem' : 'medal'}
                        size={12}
                        color={gradientColors[0]}
                        style={{ marginRight: 6 }}
                    />
                    <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: gradientColors[0] }}>
                        {m.rozetYeni}
                    </Text>
                </View>
            </View>



            {/* [BOLUM] Orta Alan */}
            <View className="items-center w-full px-6">

                {/* Rozet İkonu & Halesi */}
                <View className="mb-12 relative items-center justify-center mt-4">
                    {/* Arkadaki parlama efekti */}
                    <View
                        className="absolute w-40 h-40 rounded-full opacity-20"
                        style={{ backgroundColor: gradientColors[0], transform: [{ scale: 1.4 }] }}
                    />

                    {/* İkon Arka Planı */}
                    <LinearGradient
                        colors={gradientColors}
                        style={{
                            width: 128,      // [AYAR] İkon arka plan genişliği
                            height: 128,     // [AYAR] İkon arka plan yüksekliği
                            borderRadius: 64, // [AYAR] Tam yuvarlak olması için genişliğin yarısı olmalı
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: gradientColors[0],
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.6,
                            shadowRadius: 20,
                            elevation: 15
                        }}
                    >
                        <FontAwesome5
                            name={rozetIkonuAl(rozet.ikon)}
                            size={56} // [AYAR] İkon boyutu
                            color="white"
                        />
                    </LinearGradient>
                </View>

                {/* Başlık ve Seviye */}
                <View className="flex-row items-center justify-center mb-3 flex-wrap">
                    <Text className="text-white text-2xl font-bold text-center shadow-sm mr-2">
                        {rozetAdi}
                    </Text>
                </View>

                {/* Açıklama */}
                {/* <Text className="text-white/70 text-center text-sm font-medium mb-8 px-2 leading-5">
                    {rozet.aciklama}
                </Text> */}

                {/* Motivasyon Mesajı Kutusu */}
                <View className="bg-white/5 p-4 rounded-xl border border-white/10 w-full">
                    <Text className="text-white/90 text-center text-sm font-medium italic">
                        "{getMotivationMessage()}"
                    </Text>
                </View>

            </View>

            {/* [BOLUM] Alt Bilgi */}
            {/* <View className="absolute bottom-6 w-full items-center flex-row justify-center opacity-40">
                <FontAwesome5 name="mosque" size={10} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white text-[10px] font-medium uppercase tracking-widest">
                    NAMAZ AKIŞI • {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </Text>
            </View> */}

            {/* Alt Logo */}
            <View className="absolute bottom-8 flex-row items-center opacity-90">
                <FontAwesome5 name="mosque" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold tracking-widest uppercase text-xs">{m.marka}</Text>
            </View>

        </LinearGradient>
    );
};
