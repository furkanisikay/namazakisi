import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';

/** Bildirim türü — ikon ve renk bununla belirlenir */
export type BildirimTipi = 'hata' | 'bilgi' | 'basari';

export interface BildirimModaliProps {
    /** Modal görünür mü */
    gorunur: boolean;
    /** Bildirim türü (ikon + renk): hata=kırmızı, bilgi=mavi, başarı=yeşil */
    tip: BildirimTipi;
    /** Başlık (örn: "Yedek oluşturulamadı") */
    baslik: string;
    /** Açıklama metni — kibar "siz" dili */
    mesaj: string;
    /** Opsiyonel birincil eylem etiketi (örn: "Tekrar dene") */
    birincilEtiket?: string;
    /** Birincil eyleme basılınca çağrılır (birincilEtiket verildiyse) */
    onBirincil?: () => void;
    /** Kapat / geri tuşu / backdrop çağrısı */
    onKapat: () => void;
    /** Kapat butonu etiketi (varsayılan "Kapat") */
    kapatEtiketi?: string;
}

/**
 * Genel amaçlı, tema-uyumlu bildirim modalı (RN `Alert.alert` yerine).
 *
 * `Alert.alert` kötü/yerel görünür ve uygulamanın görsel diline uymaz; bunun yerine
 * KerahatOnayModal kalitesinde tema-uyumlu bir modal sunar. Üç durum (hata/bilgi/başarı)
 * için otomatik ikon + renk seçilir. İsteğe bağlı birincil eylem (örn. "Tekrar dene").
 *
 * New Architecture'da <Modal> onRequestClose donanım geri tuşunda güvenilmez olduğundan
 * useDonanimGeriTusu ile geri tuşu garanti altına alınır.
 */
export const BildirimModali: React.FC<BildirimModaliProps> = ({
    gorunur,
    tip,
    baslik,
    mesaj,
    birincilEtiket,
    onBirincil,
    onKapat,
    kapatEtiketi = 'Kapat',
}) => {
    const renkler = useRenkler();

    // Modal "fade" ile kapanırken parent başlık/mesajı boşaltabilir; son geçerli
    // metni önbelleğe alıp animasyon boyunca göstererek kaymayı (flicker) önle.
    const [sonBaslik, setSonBaslik] = React.useState(baslik);
    const [sonMesaj, setSonMesaj] = React.useState(mesaj);
    React.useEffect(() => {
        if (gorunur) {
            if (baslik) setSonBaslik(baslik);
            if (mesaj) setSonMesaj(mesaj);
        }
    }, [gorunur, baslik, mesaj]);

    // New Architecture'da Modal onRequestClose güvenilir değil → BackHandler ile garanti
    useDonanimGeriTusu(gorunur, onKapat);

    // Türe göre ikon + vurgu rengi
    const tipBilgisi: Record<BildirimTipi, { ikon: string; renk: string }> = {
        hata: { ikon: 'exclamation-circle', renk: renkler.hata },
        bilgi: { ikon: 'info-circle', renk: renkler.bilgi },
        basari: { ikon: 'check-circle', renk: renkler.basarili },
    };
    const { ikon, renk } = tipBilgisi[tip];

    const birincilVar = !!birincilEtiket && !!onBirincil;

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute sibling (içeriği sarmaz) */}
                <TouchableWithoutFeedback onPress={onKapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    {/* Başlık + ikon */}
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: renk + '20' }}
                        >
                            <FontAwesome5 name={ikon} size={18} color={renk} solid />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                {sonBaslik}
                            </Text>
                        </View>
                    </View>

                    {/* Mesaj — kibar "siz" dili */}
                    <Text className="text-sm leading-5 mb-5" style={{ color: renkler.metinIkincil }}>
                        {sonMesaj}
                    </Text>

                    {/* Butonlar */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={onKapat}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={kapatEtiketi}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                {kapatEtiketi}
                            </Text>
                        </TouchableOpacity>

                        {birincilVar && (
                            <TouchableOpacity
                                className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                                style={{ backgroundColor: renkler.birincil }}
                                onPress={onBirincil}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={birincilEtiket}
                            >
                                <FontAwesome5 name="redo" size={13} color="#FFF" style={{ marginRight: 8 }} />
                                <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                    {birincilEtiket}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
