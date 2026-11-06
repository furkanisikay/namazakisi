/**
 * Pil kısıtı rehberi — uygulama bilgisi → Pil → Kısıtlanmamış.
 *
 * Uygulama izin İSTEMEZ (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` Play riski);
 * telefonun kendi ayar ekranını açar. O ekranda ne yapılacağını kullanıcı
 * önceden görsün diye kısa bir rehber gösterilir: küçük bir ekran örneği
 * (imza öğesi — seçilecek "Kısıtlanmamış" seçeneği hafifçe nabız atar, hareket
 * azaltma açıksa yalnız çerçeve) ve üç adım.
 *
 * İki yerde kullanılır: Ayarlar'daki kurulum sağlığı kartı (bottom-sheet) ve
 * kurulum sihirbazının Samsung adımı (gömülü `PilMinyatur` + `PilAdimlari`).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
    AccessibilityInfo,
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useMetin } from '../../hooks/useMetin';
import { canli } from '../../../core/dil/aktifDil';

/**
 * Hedef her cihazda AYNI ayar: uygulama bilgisi → Pil → Kısıtlanmamış. Samsung'un
 * "Asla uyumayan uygulamalar" listesi bilinçli olarak hedef DEĞİL: Android'in
 * pil muafiyetinden ayrı bir durumdur ve okunamaz → kart hiç kaybolmazdı.
 * Kısıtlanmamış uygulamalar One UI'da uyutma listelerine düşmez.
 */
export const PIL_ADIM_METINLERI: readonly string[] = canli((s) => s.ayarlar.pil.adimlar);

/** Telefonun ayar ekranının küçük örneği — yalnız görsel yönlendirme (erişilebilirlik ağacına girmez). */
export const PilMinyatur: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().ayarlar.pil;
    const nabiz = useRef(new Animated.Value(0)).current;
    const [hareketAzalt, setHareketAzalt] = useState(true);

    useEffect(() => {
        let iptal = false;
        AccessibilityInfo.isReduceMotionEnabled()
            .then((azalt) => {
                if (!iptal) setHareketAzalt(azalt);
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, []);

    useEffect(() => {
        if (hareketAzalt) return;
        const dongu = Animated.loop(
            Animated.sequence([
                Animated.timing(nabiz, { toValue: 1, duration: 1100, useNativeDriver: true }),
                Animated.timing(nabiz, { toValue: 0, duration: 0, useNativeDriver: true }),
                Animated.delay(500),
            ])
        );
        dongu.start();
        return () => dongu.stop();
    }, [hareketAzalt, nabiz]);

    const secenek = (ad: string, aciklama: string, secili: boolean) => (
        <View
            className="flex-row items-center rounded-xl px-2.5 py-2"
            style={{
                backgroundColor: renkler.kartArkaplan,
                marginTop: 6,
                borderWidth: secili ? 1.5 : 0,
                borderColor: renkler.birincil,
            }}
        >
            <View className="w-5 h-5 mr-2.5 items-center justify-center">
                {secili && !hareketAzalt && (
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                borderRadius: 10,
                                backgroundColor: renkler.birincil,
                                opacity: nabiz.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                                transform: [{ scale: nabiz.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
                            },
                        ]}
                    />
                )}
                <View
                    className="w-4 h-4 rounded-full items-center justify-center"
                    style={{ borderWidth: 2, borderColor: secili ? renkler.birincil : renkler.sinir }}
                >
                    {secili && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: renkler.birincil }} />}
                </View>
            </View>
            <View className="flex-1">
                <Text className={`text-xs ${secili ? 'font-bold' : ''}`} style={{ color: renkler.metin }}>
                    {ad}
                </Text>
                <Text className="text-[10px]" style={{ color: renkler.metinIkincil }}>
                    {aciklama}
                </Text>
            </View>
        </View>
    );

    return (
        <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID="pil-minyatur"
        >
            <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: renkler.birincil }}>
                    <FontAwesome5 name="mosque" size={10} color="#fff" solid />
                </View>
                <Text className="text-xs font-bold" style={{ color: renkler.metin }}>
                    {m.minyaturBaslik}
                </Text>
            </View>
            {secenek(m.kisitlanmamis, m.kisitlanmamisAciklama, true)}
            {secenek(m.optimize, m.optimizeAciklama, false)}
        </View>
    );
};

export const PilAdimlari: React.FC = () => {
    const renkler = useRenkler();
    const adimlar = useMetin().ayarlar.pil.adimlar;
    return (
        <View>
            {adimlar.map((metin, i) => (
                <View key={metin} className="flex-row items-start" style={{ marginTop: i === 0 ? 0 : 10 }}>
                    <View
                        className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
                        style={{ backgroundColor: `${renkler.birincil}20` }}
                    >
                        <Text className="text-xs font-bold" style={{ color: renkler.birincil }}>
                            {i + 1}
                        </Text>
                    </View>
                    <Text className="text-sm flex-1 leading-5" style={{ color: renkler.metin, paddingTop: 4 }}>
                        {metin}
                    </Text>
                </View>
            ))}
        </View>
    );
};

export interface PilRehberModalProps {
    gorunur: boolean;
    samsung: boolean;
    onAc: () => void;
    onKapat: () => void;
}

/** Bottom-sheet: backdrop içeriği SARMAZ, kardeştir (AGENTS.md). */
export const PilRehberModal: React.FC<PilRehberModalProps> = ({ gorunur, samsung, onAc, onKapat }) => {
    const renkler = useRenkler();
    const s = useMetin();
    const m = s.ayarlar.pil;
    useDonanimGeriTusu(gorunur, onKapat);

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={onKapat} accessibilityLabel={m.kapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>
                <View
                    testID="pil-rehberi"
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingHorizontal: 20,
                        paddingTop: 10,
                        paddingBottom: 28,
                    }}
                >
                    <View className="self-center w-10 h-1 rounded-full mb-4" style={{ backgroundColor: renkler.sinir }} />
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}20` }}
                        >
                            <FontAwesome5 name={samsung ? 'moon' : 'battery-full'} size={17} color={renkler.birincil} solid />
                        </View>
                        <Text className="text-base font-bold flex-1" style={{ color: renkler.metin }}>
                            {samsung ? m.baslikSamsung : m.baslik}
                        </Text>
                    </View>

                    <PilMinyatur />
                    <View className="mt-4">
                        <PilAdimlari />
                    </View>

                    <View className="flex-row items-start mt-4">
                        <FontAwesome5 name="lock" size={11} color={renkler.metinIkincil} style={{ marginTop: 3, marginRight: 6 }} />
                        <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                            {m.guvence}
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center justify-center rounded-2xl mt-5"
                        style={{ backgroundColor: renkler.birincil, minHeight: 48 }}
                        onPress={onAc}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={s.ortak.ayarlariAcin}
                    >
                        <FontAwesome5 name="external-link-alt" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                        <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                            {s.ortak.ayarlariAcin}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center justify-center rounded-2xl mt-2.5"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 48 }}
                        onPress={onKapat}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={s.ortak.vazgecin}
                    >
                        <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                            {m.vazgec}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
