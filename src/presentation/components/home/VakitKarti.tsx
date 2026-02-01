import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { VakitBilgisi } from '../../../domain/services/NamazVaktiHesaplayiciServisi';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';

interface VakitKartiProps {
    vakitBilgisi: VakitBilgisi | null;
    kalanSureStr: string; // "02:45:12" formatında
    suankiVakitAdi: string; // "İkindi"
    vakitAraligi: string; // "15:15 - 17:42"
    tamamlandi: boolean;
    onTamamla: () => void;
    kilitli?: boolean;
}

const getVakitIkonu = (vakit: string): string => {
    switch (vakit) {
        case 'İmsak': return 'cloud-sun';
        case 'Sabah': return 'cloud-sun';
        case 'Güneş': return 'sun';
        case 'Öğle': return 'sun';
        case 'İkindi': return 'cloud-sun'; // afternoon
        case 'Akşam': return 'moon';
        case 'Yatsı': return 'star-and-crescent';
        default: return 'mosque';
    }
};

export const VakitKarti: React.FC<VakitKartiProps> = ({
    vakitBilgisi,
    kalanSureStr,
    suankiVakitAdi,
    vakitAraligi,
    tamamlandi,
    onTamamla,
    kilitli = false
}) => {
    const renkler = useRenkler();
    const ikonAdi = getVakitIkonu(suankiVakitAdi);

    return (
        <View className="mb-6 relative overflow-hidden rounded-3xl shadow-lg border"
            style={{
                backgroundColor: renkler.kartArkaplan,
                borderColor: renkler.sinir
            }}>

            {/* Dekoratif Arka Plan Efektleri */}
            <View className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.vurgu }} />

            <View className="p-6 text-center items-center">
                {/* Badge: Şu Anki Vakit */}
                <View className="flex-row items-center gap-2 px-3 py-1 rounded-full mb-4"
                    style={{ backgroundColor: kilitli ? renkler.metinIkincil + '15' : renkler.birincil + '15' }}>
                    {!kilitli && (
                        <View className="relative flex h-2 w-2">
                            <View className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                style={{ backgroundColor: renkler.birincil }} />
                            <View className="relative inline-flex rounded-full h-2 w-2"
                                style={{ backgroundColor: renkler.birincil }} />
                        </View>
                    )}
                    <Text className="text-xs font-bold" style={{ color: kilitli ? renkler.metinIkincil : renkler.birincil }}>
                        {kilitli ? 'SIRADAKİ VAKİT' : 'ŞU ANKİ VAKİT'}
                    </Text>
                </View>

                {/* İkon ve Başlık */}
                <View className="flex-col items-center justify-center mb-2">
                    <View className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                        style={{ backgroundColor: renkler.birincil + '10' }}>
                        <FontAwesome5 name={ikonAdi} size={36} color={renkler.birincil} />
                    </View>
                    <Text className="text-4xl font-black tracking-tight" style={{ color: renkler.metin }}>
                        {suankiVakitAdi}
                    </Text>
                    <Text className="font-medium text-sm mt-1" style={{ color: renkler.metinIkincil }}>
                        {vakitAraligi}
                    </Text>
                </View>

                {/* Sayaç */}
                <View className="my-6 items-center">
                    <Text className="text-5xl font-mono font-bold tracking-tighter tabular-nums" style={{ color: renkler.metin }}>
                        {kalanSureStr}
                    </Text>
                    <Text className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: renkler.metinIkincil }}>
                        Kalan Süre
                    </Text>
                </View>

                {/* Buton */}
                <TouchableOpacity
                    className="w-full py-4 px-6 rounded-2xl shadow-md flex-row items-center justify-center gap-3 active:scale-95 transition-transform"
                    style={{
                        backgroundColor: tamamlandi ? renkler.durum.basarili : (kilitli ? renkler.metinIkincil : renkler.birincil),
                        opacity: kilitli ? 0.7 : 1
                    }}
                    onPress={onTamamla}
                    disabled={tamamlandi || kilitli}
                >
                    <FontAwesome5
                        name={tamamlandi ? "check-circle" : (kilitli ? "clock" : "pray")}
                        size={20}
                        color="#fff"
                    />
                    <Text className="text-white font-bold text-lg">
                        {tamamlandi ? "Kılındı" : (kilitli ? "Vakit Girmedi" : "Kılındı Olarak İşaretle")}
                    </Text>
                </TouchableOpacity>

                {!tamamlandi && !kilitli && (
                    <Text className="text-xs text-center mt-4" style={{ color: renkler.metinIkincil }}>
                        Seriyi bozma! 🔥
                    </Text>
                )}
            </View>
        </View>
    );
};
