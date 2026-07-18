/**
 * Sesli anons ilk-kez onayi.
 *
 * NEDEN VAR: sesli anons `USAGE_ALARM` ile calinir — telefon sessizde veya
 * Rahatsiz Etmeyin modundayken BILE duyulur (AGENTS.md Faz 4). Hazir yogunluk
 * secmek gibi tek bir dokunusla bu davranisin acilmasi kullaniciyi sasirtir;
 * bu yuzden sesli iceren bir preset ILK kez secildiginde ne olacagi anlatilir.
 *
 * Onaylanmazsa preset YINE UYGULANIR, yalniz sesli hucreler 'bildirim'e duser
 * (bkz. `presetUygula(..., sesliIzinVar)`), yani kullanici hicbir sey kaybetmez.
 * Onay kalicidir (`muhafizSlice.sesliOnayi`) — bir daha sorulmaz.
 *
 * Kullanici DUYMADAN karar vermek zorunda kalmasin diye ornek okunusu "Dinle"
 * ile deneyebilir (gercek bildirim gonderilmez; bkz. `AnonsOnizlemeServisi`).
 */
import * as React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { TurkceTtsUyarisi, DinleButonu } from './AnonsBilesenleri';

export interface SesliOnayModalProps {
    gorunur: boolean;
    /** Secilen yogunlugun gorunen adi ("Normal" / "Yoğun") */
    yogunlukEtiketi: string;
    /** Yer tutuculari COZULMUS ornek anons metni */
    ornekMetin: string;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    onOnayla: () => void;
    /** Vazgecme / geri tusu / backdrop: preset sesli OLMADAN uygulanir. */
    onSessizUygula: () => void;
}

const MADDELER: { ikon: string; metin: string }[] = [
    {
        ikon: 'volume-up',
        metin: 'Yalnızca vaktin son dakikalarında, kalan süreyi sesli olarak söyler.',
    },
    {
        ikon: 'bell-slash',
        metin: 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulur.',
    },
    {
        ikon: 'mobile-alt',
        metin: 'Bildirim de gönderilir; sesi duymazsanız ekranda izi kalır.',
    },
];

export const SesliOnayModal: React.FC<SesliOnayModalProps> = ({
    gorunur,
    yogunlukEtiketi,
    ornekMetin,
    ttsDestekli,
    onOnayla,
    onSessizUygula,
}) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onSessizUygula);

    return (
        <Modal
            visible={gorunur}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onSessizUygula}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute sibling (içeriği sarmaz) */}
                <TouchableWithoutFeedback onPress={onSessizUygula}>
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
                    {/* Başlık */}
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}20` }}
                        >
                            <FontAwesome5 name="bullhorn" size={17} color={renkler.birincil} solid />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                Sesli anons açılsın mı?
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {yogunlukEtiketi} yoğunluğu sesli anons içerir
                            </Text>
                        </View>
                    </View>

                    {MADDELER.map(({ ikon, metin }) => (
                        <View key={ikon} className="flex-row items-start mb-2.5">
                            <FontAwesome5
                                name={ikon}
                                size={12}
                                color={renkler.birincil}
                                solid
                                style={{ marginRight: 10, marginTop: 3 }}
                            />
                            <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                                {metin}
                            </Text>
                        </View>
                    ))}

                    {/* Örnek okunuş — duymadan onaylamak zorunda kalmayın */}
                    <View
                        className="p-3 rounded-2xl mt-1.5"
                        style={{ backgroundColor: `${renkler.birincil}10` }}
                    >
                        <Text
                            className="text-[10px] font-semibold tracking-wider mb-1"
                            style={{ color: renkler.metinIkincil }}
                        >
                            ÖRNEK OKUNUŞ
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="flex-1 text-sm pr-3" style={{ color: renkler.metin }}>
                                {ornekMetin}
                            </Text>
                            <DinleButonu
                                mod="sesli"
                                bildirimSesi=""
                                cozulmusMetin={ornekMetin}
                                erisimEtiketi="Sesli anonsu dinleyin"
                            />
                        </View>
                    </View>

                    <TurkceTtsUyarisi destekli={ttsDestekli} />

                    <Text className="text-xs leading-4 mt-3" style={{ color: renkler.metinIkincil }}>
                        Dilediğiniz zaman her vaktin adımlarından kapatabilirsiniz.
                    </Text>

                    {/* Butonlar */}
                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center py-3.5 rounded-2xl"
                            style={{
                                minHeight: 44,
                                backgroundColor: renkler.arkaplan,
                                borderWidth: 1,
                                borderColor: renkler.sinir,
                            }}
                            onPress={onSessizUygula}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Sesli olmadan uygula"
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                Sesli olmadan
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-[1.4] flex-row items-center justify-center py-3.5 rounded-2xl"
                            style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                            onPress={onOnayla}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Sesli anonsu açın"
                        >
                            <FontAwesome5 name="check" size={13} color="#FFF" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                Sesli anonsu açın
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
