/**
 * TakvimAyarlari ekranının paylaşılan/sunum bileşenleri.
 * (Ana ekran dosyasını küçültmek için ayrıldı.)
 */

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Platform, Linking } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';

export interface OzetSatir {
    ikon: string;
    etiket: string;
    deger: string;
}

// ─── Takvim uygulamasını aç ─────────────────────────────────────────────────
export async function takvimUygulamasiniAc(): Promise<boolean> {
    // Android: takvim provider intent · iOS: calshow scheme
    const url = Platform.OS === 'ios'
        ? 'calshow:'
        : 'content://com.android.calendar/time/';
    try {
        await Linking.openURL(url);
        return true;
    } catch {
        return false;
    }
}

// ─── BildirimBanneri ──────────────────────────────────────────────────────────
interface BildirimBanneriProps {
    mesaj: string;
    tip: 'basari' | 'hata' | 'bilgi';
    onKapat: () => void;
}

export const BildirimBanneri: React.FC<BildirimBanneriProps> = ({ mesaj, tip, onKapat }) => {
    const renkler = useRenkler();
    const renk = tip === 'basari' ? '#22C55E' : tip === 'hata' ? '#EF4444' : renkler.birincil;
    const ikon = tip === 'basari' ? 'check-circle' : tip === 'hata' ? 'exclamation-circle' : 'info-circle';

    return (
        <View
            className="flex-row items-center p-3.5 rounded-xl mb-3"
            style={{ backgroundColor: `${renk}15`, borderWidth: 1, borderColor: `${renk}40` }}
        >
            <FontAwesome5 name={ikon} size={16} color={renk} style={{ marginRight: 10 }} />
            <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>{mesaj}</Text>
            <TouchableOpacity
                onPress={onKapat}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
                <FontAwesome5 name="times" size={13} color={renkler.metinIkincil} />
            </TouchableOpacity>
        </View>
    );
};

// ─── OzellikBilgi (inactive state) ────────────────────────────────────────────
export const OzellikBilgi: React.FC = () => {
    const renkler = useRenkler();

    const ozellikler = [
        {
            ikon: 'sliders-h',
            baslik: 'Vakit Başına Özelleştirme',
            aciklama: 'Her namaz için etkinlik süresi, başlangıç ve ofset ayrı ayrı ayarlanır.',
        },
        {
            ikon: 'calendar-check',
            baslik: 'Anlık Önizleme',
            aciklama: 'Bugün için hesaplanan saatleri kaydetmeden önce ekranda görebilirsin.',
        },
        {
            ikon: 'trash-alt',
            baslik: 'Seçici Temizleme',
            aciklama: 'Takvim, zaman aralığı ve vakit seçerek etkinlikleri istediğin gibi silebilirsin.',
        },
    ];

    return (
        <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
        >
            <View className="items-center mb-5">
                <View
                    className="w-20 h-20 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: `${renkler.birincil}12` }}
                >
                    <FontAwesome5 name="calendar-alt" size={36} color={renkler.birincil} solid />
                </View>
                <Text className="text-base font-bold text-center" style={{ color: renkler.metin }}>
                    Namaz Vakitlerini Takvimine Ekle
                </Text>
                <Text className="text-xs text-center mt-2 leading-5" style={{ color: renkler.metinIkincil }}>
                    Seçtiğin vakitler için cihaz takvimine ileriye dönük etkinlikler otomatik oluşturulur.
                </Text>
            </View>

            {ozellikler.map((o, i) => (
                <View key={i} className={`flex-row items-start ${i < ozellikler.length - 1 ? 'mb-4' : ''}`}>
                    <View
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}15` }}
                    >
                        <FontAwesome5 name={o.ikon} size={15} color={renkler.birincil} />
                    </View>
                    <View className="flex-1 justify-center">
                        <Text className="text-sm font-semibold mb-0.5" style={{ color: renkler.metin }}>
                            {o.baslik}
                        </Text>
                        <Text className="text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                            {o.aciklama}
                        </Text>
                    </View>
                </View>
            ))}

            <View
                className="mt-5 flex-row items-center justify-center p-3 rounded-xl gap-2"
                style={{ backgroundColor: `${renkler.birincil}10` }}
            >
                <FontAwesome5 name="arrow-up" size={11} color={renkler.birincil} />
                <Text className="text-xs font-medium" style={{ color: renkler.birincil }}>
                    Başlamak için yukarıdaki düğmeyi aktif edin
                </Text>
            </View>
        </View>
    );
};

// ─── BasariIcerigi (paylaşılan başarı ekranı) ────────────────────────────────
interface BasariIcerigiProps {
    tip: 'olusturma' | 'temizleme';
    baslik: string;
    altBaslik: string;
    satirlar: OzetSatir[];
    onTakvimiAc: () => void;
    onKapat: () => void;
}

export const BasariIcerigi: React.FC<BasariIcerigiProps> = ({
    tip, baslik, altBaslik, satirlar, onTakvimiAc, onKapat,
}) => {
    const renkler = useRenkler();
    const renk = tip === 'olusturma' ? '#22C55E' : '#EF4444';

    const ikonScale = useRef(new Animated.Value(0)).current;
    const halkaScale = useRef(new Animated.Value(0)).current;
    const halkaOpacity = useRef(new Animated.Value(0.45)).current;
    const icerikOpacity = useRef(new Animated.Value(0)).current;
    const icerikY = useRef(new Animated.Value(14)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(ikonScale, {
                toValue: 1, friction: 5, tension: 140, useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.parallel([
                Animated.timing(halkaScale, {
                    toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true,
                }),
                Animated.timing(halkaOpacity, {
                    toValue: 0, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.parallel([
            Animated.timing(icerikOpacity, {
                toValue: 1, duration: 320, delay: 140, useNativeDriver: true,
            }),
            Animated.timing(icerikY, {
                toValue: 0, duration: 320, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View className="px-6 pt-2 pb-1 items-center">
            {/* Animasyonlu ikon + pulse halka */}
            <View className="items-center justify-center mb-4" style={{ width: 96, height: 96 }}>
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: 96, height: 96, borderRadius: 48,
                        backgroundColor: renk,
                        opacity: halkaOpacity,
                        transform: [{ scale: halkaScale.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.35] }) }],
                    }}
                />
                <Animated.View
                    style={{
                        width: 76, height: 76, borderRadius: 38,
                        backgroundColor: `${renk}1A`,
                        alignItems: 'center', justifyContent: 'center',
                        transform: [{ scale: ikonScale }],
                    }}
                >
                    <View
                        style={{
                            width: 52, height: 52, borderRadius: 26,
                            backgroundColor: renk,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <FontAwesome5 name="check" size={24} color={renkler.birincilMetin} />
                    </View>
                </Animated.View>
            </View>

            <Animated.View
                style={{ opacity: icerikOpacity, transform: [{ translateY: icerikY }], alignSelf: 'stretch' }}
            >
                <Text className="text-lg font-bold text-center" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                <Text className="text-sm text-center mt-1 leading-5" style={{ color: renkler.metinIkincil }}>
                    {altBaslik}
                </Text>

                {/* Özet kartı */}
                <View
                    className="rounded-2xl mt-5 mb-5 overflow-hidden"
                    style={{ borderWidth: 1, borderColor: renkler.sinir }}
                >
                    {satirlar.map((s, i) => (
                        <View
                            key={s.etiket}
                            className="flex-row items-center px-4 py-3"
                            style={{
                                borderBottomWidth: i < satirlar.length - 1 ? 1 : 0,
                                borderBottomColor: renkler.sinir,
                            }}
                        >
                            <View
                                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                style={{ backgroundColor: `${renk}15` }}
                            >
                                <FontAwesome5 name={s.ikon} size={13} color={renk} />
                            </View>
                            <Text className="text-sm flex-1" style={{ color: renkler.metinIkincil }}>
                                {s.etiket}
                            </Text>
                            <Text className="text-sm font-semibold ml-2 text-right flex-shrink" style={{ color: renkler.metin }} numberOfLines={1}>
                                {s.deger}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* CTA */}
                <TouchableOpacity
                    className="flex-row items-center justify-center p-4 rounded-2xl mb-2.5"
                    style={{ backgroundColor: renkler.birincil }}
                    onPress={onTakvimiAc}
                    activeOpacity={0.85}
                >
                    <FontAwesome5 name="external-link-alt" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                    <Text className="text-base font-semibold" style={{ color: renkler.birincilMetin }}>
                        Takvim Uygulamasını Aç
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center justify-center p-3.5 rounded-2xl"
                    style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                    onPress={onKapat}
                    activeOpacity={0.7}
                >
                    <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                        Tamam
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
