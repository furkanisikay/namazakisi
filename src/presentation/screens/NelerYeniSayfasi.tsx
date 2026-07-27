/**
 * Neler Yeni Sayfası
 * Uygulamaya eklenen yeni özelliklerin kronolojik, açılır-kapanır listesi.
 * Kapalı görünüm özelliğin ~%70'ini anlatır; dokununca detay açılır.
 * Sayfaya girince tüm özellikler "görüldü" işaretlenir (rozetler kalkar).
 */

import * as React from 'react';
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Animated, Easing,
    LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch } from '../store/hooks';
import { ozellikGorulduIsaretle } from '../store/ozelliklerSlice';
import { YENI_OZELLIKLER, type YeniOzellik } from '../../core/constants/YeniOzellikler';
import { useFeedback } from '../../core/feedback';

// Android'de LayoutAnimation'ı etkinleştir (eski mimari güvencesi)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

function tarihFormatla(iso: string): string {
    const [yil, ay, gun] = iso.split('-');
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const ayIdx = parseInt(ay, 10) - 1;
    return `${parseInt(gun, 10)} ${aylar[ayIdx] ?? ''} ${yil}`;
}

interface OzellikKartiProps {
    ozellik: YeniOzellik;
    acik: boolean;
    onTogglePress: () => void;
    onAc?: () => void;
}

const OzellikKarti: React.FC<OzellikKartiProps> = ({ ozellik, acik, onTogglePress, onAc }) => {
    const renkler = useRenkler();
    const okAnim = useRef(new Animated.Value(acik ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(okAnim, {
            toValue: acik ? 1 : 0,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [acik, okAnim]);

    const okDonus = okAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

    return (
        <View
            className="rounded-2xl mb-3 mx-4 overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
        >
            {/* Başlık satırı — her zaman görünür */}
            <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={onTogglePress}
                activeOpacity={0.7}
            >
                <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${renkler.birincil}15` }}
                >
                    <FontAwesome5 name={ozellik.ikon} size={18} color={renkler.birincil} solid />
                </View>
                <View className="flex-1 pr-2">
                    <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                        {ozellik.baslik}
                    </Text>
                    <Text className="text-[11px] mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {tarihFormatla(ozellik.tarih)}  ·  v{ozellik.surum}
                    </Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: okDonus }] }}>
                    <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
                </Animated.View>
            </TouchableOpacity>

            {/* Özet — kapalıyken de görünür (%70 anlaşılırlık) */}
            <View className="px-4 pb-4 -mt-1">
                <Text className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                    {ozellik.aciklama}
                </Text>
            </View>

            {/* Detay — açılınca görünür */}
            {acik && (
                <View className="px-4 pb-4">
                    <View style={{ height: 1, backgroundColor: renkler.sinir, marginBottom: 12 }} />

                    {ozellik.detayAciklama && (
                        <Text className="text-sm leading-6 mb-3" style={{ color: renkler.metin }}>
                            {ozellik.detayAciklama}
                        </Text>
                    )}

                    {ozellik.detaylar && ozellik.detaylar.length > 0 && (
                        <View className="gap-2">
                            {ozellik.detaylar.map((d, i) => (
                                <View key={i} className="flex-row items-start">
                                    <FontAwesome5
                                        name="check-circle"
                                        size={13}
                                        color={renkler.birincil}
                                        style={{ marginTop: 2, marginRight: 8 }}
                                    />
                                    <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>
                                        {d}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {ozellik.hedefSayfa && onAc && (
                        <TouchableOpacity
                            className="flex-row items-center justify-center mt-4 py-3 rounded-xl"
                            style={{ backgroundColor: renkler.birincil }}
                            onPress={onAc}
                            activeOpacity={0.85}
                        >
                            <FontAwesome5 name="arrow-right" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-semibold" style={{ color: renkler.birincilMetin }}>
                                {ozellik.ctaEtiketi ?? 'İnceleyin'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

export const NelerYeniSayfasi: React.FC<any> = ({ navigation }) => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Kronolojik (en yeni üstte)
    const siraliOzellikler = useMemo(
        () => [...YENI_OZELLIKLER].sort((a, b) => b.tarih.localeCompare(a.tarih)),
        []
    );

    // En güncel özellik başta açık gelsin
    const [acikIdler, setAcikIdler] = useState<Set<string>>(
        () => new Set(siraliOzellikler.length > 0 ? [siraliOzellikler[0].id] : [])
    );

    const toggle = useCallback(async (id: string) => {
        await butonTiklandiFeedback();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAcikIdler(prev => {
            const yeni = new Set(prev);
            if (yeni.has(id)) yeni.delete(id); else yeni.add(id);
            return yeni;
        });
    }, [butonTiklandiFeedback]);

    useEffect(() => {
        // Sayfayı görünce tüm özellikler okundu sayılır → rozetler kalkar
        dispatch(ozellikGorulduIsaretle(YENI_OZELLIKLER.map(o => o.id)));

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, []);

    const handleAc = async (sayfa: string) => {
        await butonTiklandiFeedback();
        navigation.navigate(sayfa);
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View className="px-4 mb-4">
                        <Text className="text-2xl font-bold" style={{ color: renkler.metin }}>
                            Neler Yeni
                        </Text>
                        <Text className="text-sm mt-1 leading-5" style={{ color: renkler.metinIkincil }}>
                            Namaz Akışı'na eklenen yeni özellikleri burada bulabilirsiniz. Detay için bir başlığa dokunun.
                        </Text>
                    </View>

                    {siraliOzellikler.map(ozellik => (
                        <OzellikKarti
                            key={ozellik.id}
                            ozellik={ozellik}
                            acik={acikIdler.has(ozellik.id)}
                            onTogglePress={() => toggle(ozellik.id)}
                            onAc={ozellik.hedefSayfa ? () => handleAc(ozellik.hedefSayfa!) : undefined}
                        />
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};
