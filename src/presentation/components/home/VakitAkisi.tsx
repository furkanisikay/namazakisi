import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { Namaz } from '../../../core/types';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';

interface VakitAkisiProps {
    namazlar: (Namaz & { saat: string })[];
    suankiVakitAdi: string;
    tamamlananSayisi: number;
    toplamSayi: number;
    onVakitTikla: (namazAdi: string, tamamlandi: boolean) => void;
}

const getVakitIkonu = (vakit: string): string => {
    switch (vakit) {
        case NamazAdi.Sabah: return 'cloud-sun';
        case NamazAdi.Gunes: return 'sun';
        case NamazAdi.Ogle: return 'sun';
        case NamazAdi.Ikindi: return 'cloud-sun';
        case NamazAdi.Aksam: return 'moon';
        case NamazAdi.Yatsi: return 'star';
        default: return 'mosque';
    }
};

export const VakitAkisi: React.FC<VakitAkisiProps> = ({
    namazlar,
    suankiVakitAdi,
    tamamlananSayisi,
    toplamSayi,
    onVakitTikla
}) => {
    const renkler = useRenkler();

    return (
        <View className="flex-1">
            {/* Başlık ve İlerleme */}
            <View className="flex-row items-center justify-between mb-4 px-2">
                <Text className="font-bold text-lg" style={{ color: renkler.metin }}>
                    Günlük Akış
                </Text>
                <View className="px-2 py-1 rounded" style={{ backgroundColor: renkler.arkaplan }}>
                    <Text className="text-xs font-bold" style={{ color: renkler.metinIkincil }}>
                        {tamamlananSayisi} / {toplamSayi} Tamamlandı
                    </Text>
                </View>
            </View>

            <View className="relative space-y-3">
                {/* Dikey Çizgi */}
                <View className="absolute left-[27px] top-4 bottom-4 w-0.5 -z-10"
                    style={{ backgroundColor: renkler.sinir }} />

                {namazlar.map((namaz, index) => {
                    // Güneş vaktini listede göstermeyebiliriz
                    if ((namaz.namazAdi as any) === NamazAdi.Gunes) return null;

                    const aktifMi = namaz.namazAdi === suankiVakitAdi;
                    const tamamlandi = namaz.tamamlandi === true; // undefined veya false durumunda false
                    const vakitIkonu = getVakitIkonu(namaz.namazAdi);

                    // Kart Stili
                    let kartStili = "flex-row items-center gap-4 p-3 rounded-xl shadow-sm";
                    let opacity = 1;

                    if (tamamlandi) {
                        opacity = 0.6;
                    } else if (aktifMi) {
                        kartStili = "flex-row items-center gap-4 p-4 rounded-xl shadow-md overflow-hidden relative";
                    }

                    // Arka plan rengi belirleme
                    const arkaplanRengi = renkler.kartArkaplan;

                    return (
                        <TouchableOpacity
                            key={namaz.namazAdi}
                            className={kartStili}
                            style={{
                                backgroundColor: arkaplanRengi,
                                opacity,
                                borderColor: 'transparent',
                                borderLeftColor: aktifMi ? renkler.birincil : 'transparent',
                                borderLeftWidth: aktifMi ? 4 : 0,
                                minHeight: 60,
                            }}
                            activeOpacity={0.7}
                            onPress={() => onVakitTikla(namaz.namazAdi, !namaz.tamamlandi)}
                            disabled={namaz.namazAdi === NamazAdi.Gunes}
                        >
                            {aktifMi && (
                                <View className="absolute right-0 top-0 bottom-0 w-24 opacity-5 pointer-events-none z-0"
                                    style={{ backgroundColor: renkler.birincil }} />
                            )}

                            {/* Sol İkon (Check / Hourglass / Lock) */}
                            <View className={`w-10 h-10 rounded-full items-center justify-center shrink-0 border-4 ${aktifMi ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: tamamlandi ? renkler.durum.basarili : (aktifMi ? renkler.birincil : renkler.arkaplan),
                                    borderColor: renkler.kartArkaplan
                                }}>
                                {tamamlandi ? (
                                    <FontAwesome5 name="check" size={14} color="#fff" />
                                ) : aktifMi ? (
                                    <FontAwesome5 name="hourglass-half" size={14} color="#fff" />
                                ) : (
                                    <FontAwesome5 name="clock" size={14} color={renkler.metinIkincil} />
                                )}
                            </View>

                            {/* Orta Kısım */}
                            <View className="flex-1">
                                <Text
                                    className={`font-bold ${aktifMi ? 'text-lg' : ''}`}
                                    style={{
                                        color: renkler.metin,
                                        textDecorationLine: tamamlandi ? 'line-through' : 'none',
                                        textDecorationColor: renkler.metinIkincil
                                    }}>
                                    {namaz.namazAdi}
                                </Text>
                                <Text className="text-xs font-medium"
                                    style={{
                                        color: tamamlandi ? renkler.durum.basarili : (aktifMi ? renkler.birincil : renkler.metinIkincil)
                                    }}>
                                    {tamamlandi ? 'Kılındı' : (aktifMi ? 'Vakti Geldi • Şimdi Kıl' : 'Bekliyor')}
                                </Text>
                            </View>

                            {/* Sağ İkon (Güneş/Ay) */}
                            <FontAwesome5
                                name={vakitIkonu}
                                size={aktifMi ? 20 : 16}
                                color={aktifMi ? renkler.birincil : renkler.sinir}
                                style={{ opacity: tamamlandi ? 0.5 : 1 }}
                            />

                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
