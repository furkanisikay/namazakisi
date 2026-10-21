import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { KAZA_ADLARI_KUCUK } from '../../../core/kaza/farzSonrasiKazaOnerisi';
import type { KazaNamazAdi } from '../../../core/types/KazaTipleri';

interface KazaOneriModalProps {
    gorunur: boolean;
    /** "Kıldım" işaretlenen farz (örn: "Öğle"). */
    kilinanFarz: string | null;
    /** Önerilen kaza. */
    kazaNamazi: KazaNamazAdi | null;
    /** Kaza düşülürken düğmeler pasif. */
    isleniyor?: boolean;
    /** "Kıldım, kazadan düşün" */
    onKildim: () => void;
    /** "Şimdi değil" — geri tuşu ve backdrop da bunu çağırır. */
    onSimdiDegil: () => void;
    /** "Bir daha sormayın" — ayarı kapatır. */
    onBirDahaSorma: () => void;
}

/**
 * "Her farzla bir kaza" önerisi (issue #294).
 *
 * Arayüz kaydındadır (kibar "siz"), ibadete çağrı tonunda DEĞİL: kullanıcı bir
 * şeyi kaçırmış değil, alışkanlığına küçük bir ek öneriliyor. İmza öğesi
 * "farz → kaza" zinciridir: yeni bir hatırlatma değil, mevcut alışkanlığa
 * bağlanan bir halka olduğunu tek bakışta anlatır.
 */
export const KazaOneriModal: React.FC<KazaOneriModalProps> = ({
    gorunur,
    kilinanFarz,
    kazaNamazi,
    isleniyor = false,
    onKildim,
    onSimdiDegil,
    onBirDahaSorma,
}) => {
    const renkler = useRenkler();

    // Fade ile kapanırken üst bileşen öneriyi boşaltır; son geçerli değeri
    // animasyon boyunca göstererek metin kaymasını önle (KerahatOnayModal deseni).
    const [son, setSon] = React.useState<{ farz: string; kaza: KazaNamazAdi }>({
        farz: kilinanFarz ?? 'Namaz',
        kaza: kazaNamazi ?? 'Sabah',
    });
    React.useEffect(() => {
        if (gorunur && kilinanFarz && kazaNamazi) setSon({ farz: kilinanFarz, kaza: kazaNamazi });
    }, [gorunur, kilinanFarz, kazaNamazi]);

    const vazgec = React.useCallback(() => {
        if (!isleniyor) onSimdiDegil();
    }, [isleniyor, onSimdiDegil]);

    useDonanimGeriTusu(gorunur, vazgec);

    const kazaKucuk = KAZA_ADLARI_KUCUK[son.kaza];

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={vazgec}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute kardeş (içeriği sarmaz) */}
                <TouchableWithoutFeedback onPress={vazgec} accessible={false}>
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
                    accessibilityViewIsModal
                >
                    {/* Başlık + ikon */}
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: renkler.birincil + '20' }}
                        >
                            <FontAwesome5 name="book" size={18} color={renkler.birincil} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
                                Bir kaza da kılar mısınız?
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {son.farz} namazınızı işaretlediniz
                            </Text>
                        </View>
                    </View>

                    {/* İmza öğesi: farz → kaza zinciri */}
                    <View
                        className="flex-row items-center justify-center rounded-xl py-3 px-3 mb-4"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        accessible
                        accessibilityLabel={`${son.farz} namazının ardından bir ${kazaKucuk} kazası`}
                    >
                        <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: renkler.durum.basarili + '20' }}>
                            <FontAwesome5 name="check-circle" size={12} color={renkler.durum.basarili} />
                            <Text className="text-xs font-semibold ml-1.5" style={{ color: renkler.metin }}>
                                {son.farz}
                            </Text>
                        </View>
                        <FontAwesome5 name="link" size={12} color={renkler.metinIkincil} style={{ marginHorizontal: 10 }} />
                        <View
                            className="flex-row items-center px-3 py-1.5 rounded-full"
                            style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: renkler.birincil }}
                        >
                            <FontAwesome5 name="plus" size={10} color={renkler.birincil} />
                            <Text className="text-xs font-semibold ml-1.5" style={{ color: renkler.metin }}>
                                {son.kaza} kazası
                            </Text>
                        </View>
                    </View>

                    <Text className="text-sm leading-5 mb-5" style={{ color: renkler.metin }}>
                        Kıldığınız her farzın ardından bir kaza, borcunuzu adım adım azaltır. Bir {kazaKucuk} kazası
                        kıldığınızda işaretleyin; defterinizden düşelim.
                    </Text>

                    {/* Butonlar */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
                            onPress={vazgec}
                            disabled={isleniyor}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Şimdi değil"
                            accessibilityState={{ disabled: isleniyor }}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                Şimdi değil
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                            style={{ backgroundColor: renkler.birincil, minHeight: 44, opacity: isleniyor ? 0.6 : 1 }}
                            onPress={onKildim}
                            disabled={isleniyor}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Kıldım, kazadan düşün"
                            accessibilityState={{ disabled: isleniyor, busy: isleniyor }}
                        >
                            <FontAwesome5 name="check" size={14} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                Kıldım, kazadan düşün
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="items-center justify-center mt-3"
                        style={{ minHeight: 44 }}
                        onPress={onBirDahaSorma}
                        disabled={isleniyor}
                        accessibilityRole="button"
                        accessibilityLabel="Bir daha sormayın"
                        accessibilityHint="Bu öneriyi kapatır; Kaza Defteri'nden yeniden açabilirsiniz"
                    >
                        <Text className="text-xs font-semibold underline" style={{ color: renkler.metinIkincil }}>
                            Bir daha sormayın
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
