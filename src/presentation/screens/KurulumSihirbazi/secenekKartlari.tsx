/**
 * Kurulum sihirbazının düzey adımındaki seçenek kartları (persona çalışması 2026-10-19).
 *
 * Ayarlara hiç bakmayacak kişiye en az eforla iyi bir kurulum: her kart TEK soru, kısa
 * cümle, canlı küçük bir resim. Resim kartın fiilini oynar (zil sallanır, ses dalgası
 * yayılır, ay salınır, onay işareti nabız atar) ve YALNIZ kart açıkken hareket eder —
 * kapalı kart durgundur (hareket "bu açık" demektir). Döngü kapısı ortak
 * (`useDonguAcik`): odak dışında, arka planda ve "Animasyonları azalt"ta durur, son kare
 * dinlenme pozudur. Yalnız transform/opaklık + native driver, renkler tema token'ı.
 *
 * Rıza kuralları çağırandadır (`KurulumSihirbaziSayfasi`): sesli okuma açıklaması kart
 * açıkken ekranda yazılıdır; sabah alarmı `AlarmOnayModal` onayıyla açılır.
 */
import * as React from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../../components/common/Anahtar';
import { useDonguAcik, useDonguAnimasyonu } from '../../components/hareket';

export type CanliIkonTuru = 'nabiz' | 'salla' | 'dalga' | 'salin';

/** Kartın canlı resmi: tonlu çip + fiile göre küçük döngü. */
export const CanliIkon: React.FC<{ ikon: string; tur: CanliIkonTuru; oynat: boolean; testID?: string }> = ({ ikon, tur, oynat, testID }) => {
    const renkler = useRenkler();
    const acik = useDonguAcik() && oynat;
    const d = React.useRef(new Animated.Value(0)).current; // 0 = dinlenme pozu
    useDonguAnimasyonu(
        acik,
        () => {
            const git = (to: number, duration: number, easing = Easing.inOut(Easing.sin)) =>
                Animated.timing(d, { toValue: to, duration, easing, useNativeDriver: true });
            switch (tur) {
                case 'salla':
                    // Zil: kısa sallanış, sonra uzun sessizlik.
                    return Animated.sequence([git(1, 120), git(-1, 160), git(0.6, 140), git(-0.4, 120), git(0, 120), Animated.delay(1800)]);
                case 'dalga':
                    return Animated.sequence([git(1, 1200, Easing.out(Easing.cubic)), Animated.timing(d, { toValue: 0, duration: 0, useNativeDriver: true }), Animated.delay(600)]);
                case 'salin':
                    return Animated.sequence([git(1, 1600), git(-1, 1600)]);
                default:
                    return Animated.sequence([git(1, 500, Easing.out(Easing.back(2))), git(0, 400), Animated.delay(1600)]);
            }
        },
        () => d.setValue(0),
        tur,
    );
    const donme = d.interpolate({ inputRange: [-1, 1], outputRange: tur === 'salin' ? ['-10deg', '10deg'] : ['-18deg', '18deg'] });
    const nabiz = d.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
    const dalgaOlcek = d.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
    const dalgaOpak = d.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.5, 0] });
    const renk = oynat ? renkler.birincil : renkler.metinIkincil;
    const ikonStil =
        tur === 'salla' || tur === 'salin' ? { transform: [{ rotate: donme }] } : tur === 'nabiz' ? { transform: [{ scale: nabiz }] } : undefined;
    return (
        <View
            testID={testID}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
            {tur === 'dalga' ? (
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: renk,
                        opacity: dalgaOpak,
                        transform: [{ scale: dalgaOlcek }],
                    }}
                />
            ) : null}
            <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: renk + '20' }}>
                <Animated.View style={ikonStil}>
                    <FontAwesome5 name={ikon} size={20} color={renk} solid />
                </Animated.View>
            </View>
        </View>
    );
};

const kartStili = (renkler: ReturnType<typeof useRenkler>) => ({
    borderRadius: 24,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: renkler.sinir,
    backgroundColor: renkler.kartArkaplan,
});

/** Anahtarlı seçenek kartı: canlı resim + başlık + tek cümle + anahtar (+ isteğe bağlı ek). */
export const AnahtarKarti: React.FC<{
    ikon: string;
    tur: CanliIkonTuru;
    baslik: string;
    aciklama: string;
    deger: boolean;
    onDegistir: (v: boolean) => void;
    ek?: React.ReactNode;
    testID: string;
}> = ({ ikon, tur, baslik, aciklama, deger, onDegistir, ek, testID }) => {
    const renkler = useRenkler();
    return (
        <View style={kartStili(renkler)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CanliIkon ikon={ikon} tur={tur} oynat={deger} testID={`${testID}-resim`} />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: renkler.metin }}>{baslik}</Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metin }}>{aciklama}</Text>
                </View>
                <Anahtar
                    value={deger}
                    onValueChange={onDegistir}
                    accessibilityLabel={baslik}
                    accessibilityHint={aciklama}
                    testID={testID}
                    trackColor={{ false: renkler.sinir, true: renkler.birincil }}
                />
            </View>
            {ek}
        </View>
    );
};

/** İki seçenekli soru kartı (radyo): "Kıldığınızı işaretler misiniz?" */
export const SoruKarti: React.FC<{
    ikon: string;
    baslik: string;
    aciklama: string;
    secenekler: readonly { deger: string; etiket: string; ikon: string }[];
    secili: string;
    onSec: (d: string) => void;
    not?: string | null;
    testID: string;
}> = ({ ikon, baslik, aciklama, secenekler, secili, onSec, not, testID }) => {
    const renkler = useRenkler();
    return (
        <View style={kartStili(renkler)} testID={testID}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CanliIkon ikon={ikon} tur="nabiz" oynat testID={`${testID}-resim`} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text accessibilityRole="header" style={{ fontSize: 16, fontWeight: '700', color: renkler.metin }}>
                        {baslik}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metin }}>{aciklama}</Text>
                </View>
            </View>
            <View accessibilityRole="radiogroup" accessibilityLabel={baslik} style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {secenekler.map((s) => {
                    const sec = s.deger === secili;
                    return (
                        <TouchableOpacity
                            key={s.deger}
                            testID={`${testID}-${s.deger}`}
                            onPress={() => onSec(s.deger)}
                            accessibilityRole="radio"
                            accessibilityLabel={s.etiket}
                            accessibilityState={{ selected: sec, checked: sec }}
                            style={{
                                flex: 1,
                                minHeight: 48,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: sec ? renkler.birincil : renkler.sinir,
                                backgroundColor: sec ? renkler.birincil : renkler.arkaplan,
                            }}
                        >
                            <FontAwesome5 name={s.ikon} size={13} color={sec ? renkler.birincilMetin : renkler.metin} solid style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: sec ? renkler.birincilMetin : renkler.metin }}>{s.etiket}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {not ? (
                <Text testID={`${testID}-not`} accessibilityLiveRegion="polite" style={{ fontSize: 14, lineHeight: 20, marginTop: 10, color: renkler.metin }}>
                    {not}
                </Text>
            ) : null}
        </View>
    );
};

/**
 * "Dinleyin" — örnek okunuşu bir kez seslendirir (gerçek bildirim GÖNDERMEZ). Önizleme
 * servisi native köprü çeker → TEMBEL yüklenir (sihirbazı yükleyen testler köprüyü
 * mock'lamak zorunda kalmasın; AGENTS ekran kuralı).
 */
export const DinleDugmesi: React.FC<{ metin: string }> = ({ metin }) => {
    const renkler = useRenkler();
    const dinle = () => {
        try {
            const { adimiOnizle } = require('../../../domain/services/AnonsOnizlemeServisi') as typeof import('../../../domain/services/AnonsOnizlemeServisi');
            void adimiOnizle({ kanallar: { sesli: true }, bildirimSesi: '', cozulmusMetin: metin });
        } catch {
            // Önizleme yoksa (eski ikili) sessizce geç: ayar yine seçilebilir.
        }
    };
    return (
        <TouchableOpacity
            testID="kart-sesli-dinle"
            onPress={dinle}
            accessibilityRole="button"
            accessibilityLabel="Sesli okumayı dinleyin"
            style={{
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: renkler.sinir,
                backgroundColor: renkler.arkaplan,
            }}
        >
            <FontAwesome5 name="play" size={11} color={renkler.birincil} solid style={{ marginRight: 7 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: renkler.birincil }}>Dinleyin</Text>
        </TouchableOpacity>
    );
};
