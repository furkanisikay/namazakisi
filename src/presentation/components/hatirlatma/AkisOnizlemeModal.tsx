/**
 * "Akisi onizle" (spec 3.4) — bir pencerenin TUM hatirlatma akisini zaman
 * cizelgesinde sirayla gosterir: 45 dk kala nazik ... 3 dk kala acil.
 * (Faz 3'te ortak bilesen katmanina tasindi; muhafiz ve cuma ayni modali acar.)
 *
 * ONEMLI: Burasi bir ONIZLEMEdir — GERCEK BILDIRIM GONDERMEZ, hicbir sey
 * planlamaz. Yalniz kullanicinin istegiyle ("Dinle") tek bir adim oldugu gibi
 * calinir: bildirimli adimda BILDIRIM SESI (uygulama ici, expo-audio), sesli
 * adimda TTS, ikisi de acikken once ses sonra anons (bkz. `AnonsOnizlemeServisi`).
 *
 * Adimlar motor adaptorunun SAF `vakitUyariPlaniOlustur` fonksiyonundan gelir —
 * yani ekranda gorulen sira, arka planin gercekten planlayacagi sirayla
 * BIREBIR aynidir (ayri bir "onizleme mantigi" yok, sapma riski yok).
 */
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import type { VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import { bildirimSesiGerekliMi, vakitUyariPlaniOlustur } from '../../../core/muhafiz/motorAdaptoru';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { anonsMetniniCoz } from '../../../core/muhafiz/anonsMetni';
import {
    basligiOlustur,
    bildirimGovdesiOlustur,
    type MuhafizSeviye,
} from '../../../core/utils/muhafizMetinYardimcisi';
import { seviyeOzetiOlustur, esikIfadesi } from '../../../core/muhafiz/seviyeOzeti';
import { SEVIYE_KADEMELERI } from '../../../core/muhafiz/matrisTipleri';
import { TurkceTtsUyarisi, DinleButonu } from './AnonsBilesenleri';
import {
    ONIZLEME_TARAMA_SINIRI_DK,
    GIRIS_SESLI_GECIKME_NOTU,
    type PencereTanimi,
} from './pencereTanimi';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

export interface AkisOnizlemeModalProps {
    gorunur: boolean;
    tanim: PencereTanimi;
    ayar: VakitMuhafizAyari;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    onKapat: () => void;
}

export const AkisOnizlemeModal: React.FC<AkisOnizlemeModalProps> = ({
    gorunur,
    tanim,
    ayar,
    ttsDestekli,
    onKapat,
}) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onKapat);

    // "Dinle" ile baslatilan ses ekran kapaninca DEVAM ETMEMELI: native
    // `RingtoneManager` calmayi surdurur ve `AudioPlayer` serbest birakilmaz.
    useEffect(() => {
        if (gorunur) return;
        OnizlemeSesServisi.temizle();
    }, [gorunur]);
    useEffect(() => () => OnizlemeSesServisi.temizle(), []);

    const girisYonu = tanim.yon === 'girisindenItibaren';

    /**
     * Gercek motor plani — arka planin planlayacagi dakikalarla birebir ayni.
     *
     * Giris yonunde pencere uzunlugu ZORUNLUdur (motor onsuz plan uretmez);
     * `pencereUzunluguDk` yoksa liste bos doner ve bos durum metni cikar —
     * bu, motorun gercek davranisidir, gizlenmez.
     */
    const adimlar = useMemo(
        () =>
            vakitUyariPlaniOlustur(ayar, ONIZLEME_TARAMA_SINIRI_DK, {
                pencereUzunluguDk: tanim.pencereUzunluguDk,
            }),
        [ayar, tanim.pencereUzunluguDk]
    );

    const sesliAdimVar = adimlar.some((a) => a.sesliAnons && a.anonsMetni.trim().length > 0);
    const sertAdimVar = adimlar.some((a) => a.seviye === 3);

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {/* Backdrop — absolute sibling: ic ScrollView scroll'unu takmaz */}
                <TouchableWithoutFeedback onPress={onKapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: EKRAN_YUKSEKLIGI * 0.85,
                        paddingBottom: 24,
                    }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    >
                        {/* Baslik */}
                        <View className="flex-row items-center mt-2 mb-1">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: `${renkler.birincil}20` }}
                            >
                                <FontAwesome5 name="stream" size={16} color={renkler.birincil} solid />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                    {tanim.baslik} akışı
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {adimlar.length > 0
                                        ? girisYonu
                                            ? `Vakit girdikten sonra ${adimlar.length} hatırlatma alırsınız`
                                            : `Vakit çıkmadan önce ${adimlar.length} hatırlatma alırsınız`
                                        : 'Bu vakitte hatırlatma yok'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="w-11 h-11 items-center justify-center"
                                onPress={onKapat}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Kapat"
                            >
                                <FontAwesome5 name="times" size={18} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        </View>

                        <View
                            className="flex-row items-start p-3 rounded-xl mt-2 mb-1"
                            style={{ backgroundColor: `${renkler.bilgi}12` }}
                        >
                            <FontAwesome5
                                name="info-circle"
                                size={13}
                                color={renkler.bilgi}
                                style={{ marginRight: 8, marginTop: 1 }}
                            />
                            <Text className="flex-1 text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                                Bu bir önizlemedir; bildirim gönderilmez. Bir adımın nasıl duyulacağını
                                denemek için “Dinle” düğmesine dokunun.
                                {girisYonu && sesliAdimVar ? ` ${GIRIS_SESLI_GECIKME_NOTU}` : ''}
                            </Text>
                        </View>

                        {sesliAdimVar && <TurkceTtsUyarisi destekli={ttsDestekli} />}

                        {adimlar.length === 0 ? (
                            <View className="items-center py-12">
                                <FontAwesome5 name="bell-slash" size={34} color={renkler.metinIkincil} />
                                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                    {tanim.baslik} vaktinde tüm adımlar kapalı. Bir adımı açarak akışı
                                    oluşturabilirsiniz.
                                </Text>
                            </View>
                        ) : (
                            <View className="mt-3">
                                {adimlar.map((adim) => {
                                    const kademe = SEVIYE_KADEMELERI[adim.seviye - 1];
                                    const bilgi = tanim.adimBilgileri[adim.seviye - 1] ?? tanim.adimBilgileri[0];
                                    const seviye = adim.seviye as MuhafizSeviye;
                                    const anonsMetni =
                                        adim.sesliAnons && adim.anonsMetni.trim().length > 0
                                            ? anonsMetniniCoz(adim.anonsMetni, tanim.vakit, adim.olcuDk, tanim.yon)
                                            : null;
                                    // Duyulacak bir sey var mi? (metinsiz 'sesli' adim sessiz kalir)
                                    const dinlenebilir = bildirimSesiGerekliMi(adim.kanallar) || !!anonsMetni;

                                    return (
                                        <View
                                            key={`${adim.olcuDk}-${adim.seviye}`}
                                            className="rounded-2xl border p-3.5 mb-2.5"
                                            style={{
                                                backgroundColor: renkler.arkaplan,
                                                borderColor: renkler.sinir,
                                                borderLeftWidth: 4,
                                                borderLeftColor: bilgi.renk,
                                            }}
                                            accessible
                                            accessibilityLabel={`${esikIfadesi(adim.olcuDk, tanim.yon)}, ${bilgi.baslik}`}
                                        >
                                            {/* Adim basligi: olcu rozeti + kademe */}
                                            <View className="flex-row items-center mb-2">
                                                <View
                                                    className="px-2 py-0.5 rounded-lg mr-2.5"
                                                    style={{ backgroundColor: `${bilgi.renk}20` }}
                                                >
                                                    <Text className="text-[11px] font-bold" style={{ color: renkler.metin }}>
                                                        {adim.olcuDk} dk
                                                    </Text>
                                                </View>
                                                <FontAwesome5
                                                    name={bilgi.ikon}
                                                    size={12}
                                                    color={bilgi.renk}
                                                    solid
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text
                                                    className="text-xs font-semibold flex-1"
                                                    style={{ color: renkler.metinIkincil }}
                                                >
                                                    {bilgi.baslik}
                                                </Text>
                                            </View>

                                            {/* Bildirim onizlemesi (adim kapali olamaz — plan kapalilari elemistir) */}
                                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                                {basligiOlustur(tanim.vakit, seviye, adim.olcuDk, tanim.yon)}
                                            </Text>
                                            <Text className="text-xs mt-1 leading-4" style={{ color: renkler.metinIkincil }}>
                                                {bildirimGovdesiOlustur(seviye, tanim.yon)}
                                            </Text>

                                            {/* Ayar ozeti (kanallar · ses) */}
                                            <Text className="text-[11px] mt-2" style={{ color: renkler.metinIkincil }}>
                                                {seviyeOzetiOlustur(
                                                    {
                                                        kademe,
                                                        kanallar: adim.kanallar,
                                                        esikDk: adim.olcuDk,
                                                        siklik: 'birkez',
                                                        bildirimSesi: adim.bildirimSesi,
                                                        anonsMetni: adim.anonsMetni,
                                                    },
                                                    tanim.yon
                                                )}
                                            </Text>

                                            {/* Sesli anons — cozulmus metin */}
                                            {anonsMetni && (
                                                <View
                                                    className="flex-row items-center p-2.5 rounded-xl mt-2.5"
                                                    style={{ backgroundColor: `${renkler.birincil}10` }}
                                                >
                                                    <FontAwesome5
                                                        name="volume-up"
                                                        size={12}
                                                        color={renkler.birincil}
                                                        solid
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <Text className="flex-1 text-xs" style={{ color: renkler.metin }}>
                                                        {anonsMetni}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Adimi OLDUGU GIBI dinle — sadece-bildirim adimlarinda da ses
                                                cikar. Iki kanal da acikken sira gercek akisla ayni: once
                                                bildirim sesi, sonra anons. */}
                                            {dinlenebilir && (
                                                <View className="flex-row justify-end mt-2.5">
                                                    <DinleButonu
                                                        kanallar={adim.kanallar}
                                                        bildirimSesi={adim.bildirimSesi}
                                                        cozulmusMetin={anonsMetni ?? ''}
                                                        erisimEtiketi={`${adim.olcuDk} dakika ${girisYonu ? 'sonra' : 'kala'} çalacak uyarıyı dinleyin`}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}

                                {sertAdimVar && (
                                    <Text className="text-[11px] mt-1 px-1 leading-4" style={{ color: renkler.metinIkincil }}>
                                        Not: “Sert uyarı” adımının bildirim metni her seferinde hatırlatma
                                        havuzundan seçilir; burada örnek bir metin gösterilir.
                                    </Text>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
