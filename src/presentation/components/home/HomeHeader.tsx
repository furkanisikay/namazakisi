import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { tarihiGorunumFormatinaCevir, gunAdiniAl } from '../../../core/utils/TarihYardimcisi';

interface HomeHeaderProps {
    tarih: string;
    streakGun: number;
    bugunMu: boolean;
    aktifGunMu?: boolean;
    onTarihTikla: () => void;
    onSeriTikla?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    tarih,
    streakGun,
    bugunMu,
    aktifGunMu,
    onTarihTikla,
    onSeriTikla
}) => {
    const renkler = useRenkler();

    // Tarih parçalarını ayır (Örn: "18 Ocak 2026")
    const formatliTarih = tarihiGorunumFormatinaCevir(tarih);
    const tarihParcalari = formatliTarih.split(' '); // ["18", "Ocak", "2026"]
    const gun = tarihParcalari[0];
    const ay = tarihParcalari[1]?.substring(0, 3); // "Oca"
    const yil = tarihParcalari[2];
    const gunAdi = gunAdiniAl(tarih); // "Pazar"

    return (
        <View
            className="flex-row justify-between items-center px-6 py-4 border-b w-full z-50 backdrop-blur-md"
            style={{
                backgroundColor: renkler.kartArkaplan + 'E6', // %90 opacity
                borderColor: renkler.sinir
            }}
        >
            <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={onTarihTikla}
                activeOpacity={0.7}
            >
                <View
                    className="p-2 rounded-lg items-center min-w-[3.5rem] border"
                    style={{
                        backgroundColor: renkler.arkaplan,
                        borderColor: renkler.sinir
                    }}
                >
                    <Text className="text-xs font-bold uppercase" style={{ color: renkler.durum.hata }}>
                        {ay}
                    </Text>
                    <Text className="text-lg font-bold leading-none" style={{ color: renkler.metin }}>
                        {gun}
                    </Text>
                </View>

                <View>
                    <Text className="text-xs font-medium" style={{ color: renkler.metinIkincil }}>
                        {aktifGunMu ? 'Aktif Gün' : (bugunMu ? 'Bugün' : 'Seçili Tarih')}
                    </Text>
                    <Text className="text-sm font-bold" style={{ color: renkler.metin }}>
                        {gunAdi}, {yil}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                    backgroundColor: renkler.durum.uyari + '20', // Opacity 20
                    borderColor: renkler.durum.uyari + '50' // Opacity 50
                }}
                onPress={onSeriTikla}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="fire" size={14} color={renkler.durum.uyari} />
                <Text className="font-bold text-sm" style={{ color: renkler.durum.uyari }}>
                    {streakGun} Gün
                </Text>
            </TouchableOpacity>
        </View>
    );
};
