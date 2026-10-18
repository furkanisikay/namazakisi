/**
 * Sesli anons ilk-kez onayi.
 *
 * NEDEN VAR: sesli anons `USAGE_ALARM` ile calinir — telefon sessizde veya
 * Rahatsiz Etmeyin modundayken BILE duyulur (AGENTS.md Faz 4). Hazir yogunluk
 * secmek gibi tek bir dokunusla bu davranisin acilmasi kullaniciyi sasirtir;
 * bu yuzden sesli iceren bir preset ILK kez secildiginde ne olacagi anlatilir.
 *
 * "Sesli olmadan" denirse preset YINE UYGULANIR, yalniz sesli hucreler 'bildirim'e
 * duser (bkz. `presetUygula(..., sesliIzinVar)`). Geri tusu/backdrop ise VAZGECMEDIR:
 * hicbir sey uygulanmaz. Onay kalicidir (`muhafizSlice.sesliOnayi`) — bir daha sorulmaz.
 *
 * Kullanici DUYMADAN karar vermek zorunda kalmasin diye ornek okunusu "Dinle"
 * ile deneyebilir (gercek bildirim gonderilmez; bkz. `AnonsOnizlemeServisi`).
 */
import * as React from 'react';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { TurkceTtsUyarisi, DinleButonu } from '../../components/hatirlatma/AnonsBilesenleri';

export interface SesliOnayModalProps {
    gorunur: boolean;
    /** Secilen yogunlugun gorunen adi ("Normal" / "Yoğun") */
    yogunlukEtiketi?: string;
    /** Baslik alti satiri; verilmezse yogunluk etiketinden uretilir (nafile #273 kendi metnini verir). */
    altBaslik?: string;
    /** Alt bilgi notu; verilmezse muhafiz metni. */
    kapatmaNotu?: string;
    /** Yer tutuculari COZULMUS ornek anons metni */
    ornekMetin: string;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    onOnayla: () => void;
    /** "Sesli olmadan" butonu: preset sesli OLMADAN uygulanir. */
    onSessizUygula: () => void;
    /**
     * Geri tusu / backdrop / vazgecme: HICBIR SEY UYGULANMAZ.
     *
     * Geri tusunu `onSessizUygula`'ya baglamak yikici bir jestti: fikrini degistirip
     * geri tusuna basan kullanicinin 20 hucresi (5 vakit x 4 seviye) preset degerleriyle
     * eziliyor ve yogunlugu degisiyordu. Geri = vazgec.
     */
    onIptal: () => void;
}

/**
 * Rıza maddeleri — platforma göre. iPhone'da anons bildirimin SESİDİR: sessiz anahtarı
 * açıkken duyulmaz (Android'deki gibi alarm olarak çalmaz). İki platforma aynı cümleyi
 * söylemek iPhone kullanıcısına yanlış bilgi veriyordu.
 */
export function sesliOnayMaddeleri(platform: string): { ikon: string; metin: string }[] {
    return [
        {
            ikon: 'volume-up',
            // Yon-bagimsiz: "son dakikalarinda" giris yonunde YANLISTI (orada vakit
            // girdikten sonra, gecen sureyi soyler).
            metin: 'Yalnızca ayarladığınız adımlarda, kalan ya da geçen süreyi sesli olarak söyler.',
        },
        platform === 'ios'
            ? { ikon: 'bell-slash', metin: "iPhone'da bildirim sesi olarak çalar; sessiz anahtarı açıkken duyulmaz." }
            : { ikon: 'bell-slash', metin: 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulur.' },
        {
            ikon: 'mobile-alt',
            metin: 'Bildirim de gönderilir; sesi duymazsanız ekranda izi kalır.',
        },
    ];
}

export const SesliOnayModal: React.FC<SesliOnayModalProps> = ({
    gorunur,
    yogunlukEtiketi,
    altBaslik,
    kapatmaNotu,
    ornekMetin,
    ttsDestekli,
    onOnayla,
    onSessizUygula,
    onIptal,
}) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onIptal);

    // "Dinle" ile baslatilan ses modal kapaninca DEVAM ETMEMELI: native
    // `RingtoneManager` calmayi surdurur ve `AudioPlayer` serbest birakilmaz.
    useEffect(() => {
        if (gorunur) return;
        OnizlemeSesServisi.temizle();
    }, [gorunur]);
    useEffect(() => () => OnizlemeSesServisi.temizle(), []);

    return (
        <Modal
            visible={gorunur}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onIptal}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Backdrop — absolute sibling (içeriği sarmaz); dokunmak VAZGEÇER */}
                <TouchableWithoutFeedback onPress={onIptal}>
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
                                Sesli okuma açılsın mı?
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                {altBaslik ?? `${yogunlukEtiketi ?? ''} düzey sesli okuma içerir`}
                            </Text>
                        </View>
                    </View>

                    {sesliOnayMaddeleri(Platform.OS).map(({ ikon, metin }) => (
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
                                kanallar={{ sesli: true }}
                                bildirimSesi=""
                                cozulmusMetin={ornekMetin}
                                erisimEtiketi="Sesli okumayı dinleyin"
                            />
                        </View>
                    </View>

                    <TurkceTtsUyarisi destekli={ttsDestekli} />

                    {/* TEK RIZA (Dalga 3): bir kez sorulur, tüm hatırlatmalarda geçerli. */}
                    <Text className="text-sm leading-5 mt-3" style={{ color: renkler.metin }}>
                        Bu izin bir kez sorulur, tüm hatırlatmalarda geçerlidir.
                    </Text>
                    <Text className="text-xs leading-4 mt-1" style={{ color: renkler.metinIkincil }}>
                        {kapatmaNotu ?? 'Dilediğiniz zaman her hatırlatmanın ayarından kapatabilirsiniz.'}
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
                            accessibilityLabel="Sesli okumayı açın"
                        >
                            <FontAwesome5 name="check" size={13} color="#FFF" style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: '#FFF' }}>
                                Sesli okumayı açın
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
