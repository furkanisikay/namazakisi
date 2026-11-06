/**
 * Takvim çakışması uyarısı — AÇIK RIZA modalı (issue #291).
 *
 * Başka takvimleri okumak bir kapsam genişlemesidir: özellik ancak kullanıcı
 * bu açıklamayı EKRANDA görüp "Kabul ediyorum" dediğinde açılır (rıza kaydı
 * `rizaZamani` yalnız buradan doğar). Geri tuşu / backdrop / "Vazgeç" =
 * hiçbir şey yazılmaz (sesli onay modalındaki "geri tuşu = vazgeç" dersi).
 *
 * Görsel dil `KerahatOnayModal` / `BildirimModali` ile aynı: fade + şeffaf,
 * backdrop içeriğin KARDEŞİ, `useDonanimGeriTusu`.
 */
import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, ScrollView, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

interface TakvimCakismaRizaModalProps {
    gorunur: boolean;
    onKabul: () => void;
    onVazgec: () => void;
    /**
     * Modal ekrandan TAMAMEN kalkınca (yalnız iOS; RN Android'de `onDismiss`
     * çağırmaz). Sistem izin diyaloğu bundan sonra açılmalı.
     */
    onKapandi?: () => void;
}

interface Madde {
    ikon: string;
    metin: string;
}

const MADDE_IKONLARI = { saatler: 'clock', ad: 'eye-slash', cihaz: 'mobile-alt', kapatma: 'toggle-off' } as const;

export const TakvimCakismaRizaModal: React.FC<TakvimCakismaRizaModalProps> = ({ gorunur, onKabul, onVazgec, onKapandi }) => {
    const renkler = useRenkler();
    const sozluk = useMetin();
    const mr = sozluk.takvim.riza;
    // Bildirimdeki ad yerine geçen ifade bildirim üreticisiyle aynı kaynaktan.
    const MADDELER: Madde[] = (Object.keys(MADDE_IKONLARI) as (keyof typeof MADDE_IKONLARI)[]).map((k) => ({
        ikon: MADDE_IKONLARI[k],
        metin: bicim(mr.maddeler[k], { etkinlik: sozluk.bildirim.takvim.etkinlikBir }),
    }));
    useDonanimGeriTusu(gorunur, onVazgec);

    return (
        <Modal
            visible={gorunur}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onVazgec}
            onDismiss={onKapandi}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={onVazgec} accessibilityLabel={mr.vazgecin}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        maxHeight: '86%',
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                        <View className="flex-row items-center mb-3">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: renkler.birincil + '20' }}
                            >
                                <FontAwesome5 name="calendar-check" size={18} color={renkler.birincil} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                    {mr.baslik}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {mr.altBaslik}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-sm leading-5 mb-4" style={{ color: renkler.metin }}>
                            {mr.aciklama}
                        </Text>

                        <View
                            className="rounded-xl p-3 mb-5"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            {MADDELER.map((m, i) => (
                                <View key={m.ikon} className={`flex-row items-start ${i > 0 ? 'mt-3' : ''}`}>
                                    <View className="w-6 items-center" style={{ marginTop: 2 }}>
                                        <FontAwesome5 name={m.ikon} size={13} color={renkler.birincil} />
                                    </View>
                                    <Text className="text-sm leading-5 flex-1 ml-2" style={{ color: renkler.metin }}>
                                        {m.metin}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Text className="text-xs leading-4 mb-5" style={{ color: renkler.metinIkincil }}>
                            {mr.izinNotu}
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
                                onPress={onVazgec}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={mr.vazgec}
                            >
                                <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                    {mr.vazgec}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
                                onPress={onKabul}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={mr.kabulEtiketi}
                            >
                                <FontAwesome5 name="check" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                    {mr.kabul}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
