import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { tarihiGorunumFormatinaCevir, gunAdiniAl } from '../../../core/utils/TarihYardimcisi';
import { SERI_RENKLERI } from '../../../core/constants/UygulamaSabitleri';

/**
 * Home page header component props.
 */
interface HomeHeaderProps {
    tarih: string;
    streakGun: number;
    bugunMu: boolean;
    aktifGunMu?: boolean;
    onTarihTikla: () => void;
    onSeriTikla?: () => void;
    onKibleTikla?: () => void;
    toparlanmaModu?: boolean;
    toparlanmaIlerleme?: { tamamlanan: number; hedef: number } | null;
}

/**
 * Home page header component.
 * Displays current date, streak counter, and qibla shortcut button.
 * @param {HomeHeaderProps} props - Component props.
 * @returns {React.JSX.Element} Header with date info, qibla and streak buttons.
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
    tarih,
    streakGun,
    bugunMu,
    aktifGunMu,
    onTarihTikla,
    onSeriTikla,
    onKibleTikla,
    toparlanmaModu,
    toparlanmaIlerleme,
}) => {
    const renkler = useRenkler();

    // Tarih parçalarını ayır (Örn: "18 Ocak 2026")
    const formatliTarih = tarihiGorunumFormatinaCevir(tarih);
    const tarihParcalari = formatliTarih.split(' '); // ["18", "Ocak", "2026"]
    const gun = tarihParcalari[0];
    const ay = tarihParcalari[1]?.substring(0, 3); // "Oca"
    const yil = tarihParcalari[2];
    const gunAdi = gunAdiniAl(tarih); // "Pazar"

    // Kademeli ateş rengi — toparlanma moduna göre değişir, useMemo ile hesaplanır
    const { atesRenk, atesOpacity } = useMemo(() => {
        if (!toparlanmaModu || !toparlanmaIlerleme) {
            return { atesRenk: SERI_RENKLERI.ATES, atesOpacity: 1 };
        }
        const { tamamlanan, hedef } = toparlanmaIlerleme;
        const ilerleme = hedef > 0 ? tamamlanan / hedef : 0;
        if (ilerleme === 0) return { atesRenk: '#9ca3af', atesOpacity: 0.5 };
        if (ilerleme < 0.5) return { atesRenk: '#f59e0b', atesOpacity: 0.7 };
        if (ilerleme < 1) return { atesRenk: '#f97316', atesOpacity: 0.85 };
        return { atesRenk: SERI_RENKLERI.ATES, atesOpacity: 1 }; // tamamlandı → tam alev
    }, [toparlanmaModu, toparlanmaIlerleme]);

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

            <View className="flex-row items-center gap-2">
                {/* Kıble Butonu */}
                <TouchableOpacity
                    className="flex-row items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{
                        backgroundColor: renkler.birincil + '15',
                        borderColor: renkler.birincil + '50'
                    }}
                    onPress={onKibleTikla}
                    activeOpacity={0.7}
                    accessibilityLabel="Kıble yönünü bul"
                    accessibilityRole="button"
                >
                    <FontAwesome5 name="compass" size={14} color={renkler.birincil} />
                    <Text className="font-bold text-sm" style={{ color: renkler.birincil }}>Kıble</Text>
                </TouchableOpacity>

                {/* Seri Butonu */}
                <TouchableOpacity
                    className="items-center px-3 py-1.5 rounded-full border"
                    style={{
                        backgroundColor: SERI_RENKLERI.ATES + '20',
                        borderColor: atesRenk + '80',
                        opacity: atesOpacity,
                    }}
                    onPress={onSeriTikla}
                    activeOpacity={0.7}
                    accessibilityLabel={
                        toparlanmaModu && toparlanmaIlerleme
                            ? `Toparlanma modu: ${toparlanmaIlerleme.tamamlanan}/${toparlanmaIlerleme.hedef} gün tamamlandı`
                            : `Seri: ${streakGun} gün`
                    }
                    accessibilityRole="button"
                >
                    <View className="flex-row items-center gap-2">
                        <FontAwesome5
                            name="fire"
                            size={14}
                            color={atesRenk}
                            accessibilityRole="text"
                            accessibilityLabel={
                                toparlanmaModu && toparlanmaIlerleme
                                    ? `Toparlanma modu: ${toparlanmaIlerleme.tamamlanan}/${toparlanmaIlerleme.hedef} gün tamamlandı`
                                    : undefined
                            }
                        />
                        <Text className="font-bold text-sm" style={{ color: atesRenk }}>
                            {streakGun} Gün
                        </Text>
                    </View>
                    {toparlanmaModu && toparlanmaIlerleme && (
                        <Text
                            style={{ color: '#f59e0b', fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 1 }}
                            accessibilityElementsHidden
                        >
                            🔄 {toparlanmaIlerleme.tamamlanan}/{toparlanmaIlerleme.hedef}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
