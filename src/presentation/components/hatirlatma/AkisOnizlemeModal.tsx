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
import { bildirimSesiGerekliMi } from '../../../core/muhafiz/motorAdaptoru';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { anonsMetniniCoz } from '../../../core/muhafiz/anonsMetni';
import {
    basligiOlustur,
    bildirimGovdesiOlustur,
    type MuhafizSeviye,
} from '../../../core/utils/muhafizMetinYardimcisi';
import { acikOzetKanallari, esikIfadesi, kanalListesiMetni } from '../../../core/muhafiz/seviyeOzeti';
import { OzetCipleri } from './OzetCipleri';
import { SEVIYE_KADEMELERI } from '../../../core/muhafiz/matrisTipleri';
import { TurkceTtsUyarisi, DinleButonu } from './AnonsBilesenleri';
import { ZamanSeridi } from './ZamanSeridi';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import {
    kalanDkAni,
    saatMetni,
    seritCumlesiOlustur,
    seritDuzeniHesapla,
    seritErisimEtiketi,
} from '../../../core/muhafiz/zamanSeridi';
import {
    pencerePlaniOlustur,
    girisSesliGecikmeNotu,
    TON_ETIKETLERI,
    alarmOnizlemeEtiketi,
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
    const mh = useMetin().hatirlatma;
    const mk = mh.akis;
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
     *
     * TARAMA BASLANGICI YONE GORE (yasanmis bug): ikinci arguman motorda
     * "cagiranin SU ANKI olcusu" demektir ve tarama oradan cikisa dogru AZALIR,
     * girise dogru ARTAR. Onizleme tum pencereyi gormek istedigi icin cikista
     * buyuk bir sayi (`ONIZLEME_TARAMA_SINIRI_DK`) verilir; ayni sayi giriste
     * `baslangic = max(1440, 1)` yapip `bitis = pencere - 1`'i ASAR → dongu HIC
     * calismaz ve kullaniciya "tum adimlar kapali" gosterilirdi. Girisin
     * karsiligi pencerenin BASIDIR.
     */
    const { yon, pencereUzunluguDk } = tanim;
    const adimlar = useMemo(
        () => pencerePlaniOlustur(ayar, { yon, pencereUzunluguDk }),
        [ayar, yon, pencereUzunluguDk]
    );

    // Ek yüzey (nafile, cuma): her tetiğin GERÇEK metni tanımdan; adımın ilk tetiği nass taşır.
    const ozelMetinler = useMemo(() => {
        const uret = tanim.onizlemeMetni;
        if (!uret) return null;
        const goruldu = new Set<number>();
        return adimlar.map((a) => {
            const ilk = !goruldu.has(a.adimIndeks);
            goruldu.add(a.adimIndeks);
            return uret(a, ilk);
        });
    }, [adimlar, tanim.onizlemeMetni]);

    const sesliAdimVar = ozelMetinler
        ? ozelMetinler.some((m, i) => adimlar[i].sesliAnons && !!m.anons)
        : adimlar.some((a) => a.sesliAnons && a.anonsMetni.trim().length > 0);
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
                                    {bicim(mk.baslik, { ad: tanim.baslik })}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {adimlar.length > 0 && tanim.onizlemeOzeti
                                        ? tanim.onizlemeOzeti(adimlar.length)
                                        : adimlar.length > 0
                                        ? girisYonu
                                            ? sayili(mk.girisOzet, adimlar.length)
                                            : sayili(mk.cikisOzet, adimlar.length)
                                        : mk.yok}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="w-11 h-11 items-center justify-center"
                                onPress={onKapat}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={mh.adim.kapat}
                            >
                                <FontAwesome5 name="times" size={18} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        </View>

                        {/* Karttaki seridin statik kopyasi — ayni plan, ayni resim. */}
                        {tanim.pencere && pencereUzunluguDk !== undefined && pencereUzunluguDk > 0 && adimlar.length > 0 && (
                            <ZamanSeridi
                                plan={adimlar}
                                pencereUzunluguDk={pencereUzunluguDk}
                                baslangic={tanim.pencere.baslangic}
                                bitis={tanim.pencere.bitis}
                                yon={yon}
                                adimBilgileri={tanim.adimBilgileri}
                                animasyonlu={false}
                                erisimEtiketi={seritErisimEtiketi(
                                    tanim.baslik,
                                    tanim.pencere.baslangic,
                                    tanim.pencere.bitis,
                                    seritCumlesiOlustur({
                                        duzen: seritDuzeniHesapla(adimlar, pencereUzunluguDk),
                                        yon,
                                        bitis: tanim.pencere.bitis,
                                        tumAdimlarKapali: false,
                                    })
                                )}
                            />
                        )}

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
                                {mk.bilgi}
                                {girisYonu && sesliAdimVar ? ` ${girisSesliGecikmeNotu()}` : ''}
                            </Text>
                        </View>

                        {sesliAdimVar && <TurkceTtsUyarisi destekli={ttsDestekli} />}

                        {adimlar.length === 0 ? (
                            <View className="items-center py-12">
                                <FontAwesome5 name="bell-slash" size={34} color={renkler.metinIkincil} />
                                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                    {bicim(mk.tumKapali, { ad: tanim.baslik })}
                                </Text>
                            </View>
                        ) : (
                            <View className="mt-3">
                                {adimlar.map((adim, sira) => {
                                    const ozelMetin = ozelMetinler?.[sira] ?? null;
                                    const kademe = SEVIYE_KADEMELERI[adim.seviye - 1];
                                    const bilgi = tanim.adimBilgileri[adim.seviye - 1] ?? tanim.adimBilgileri[0];
                                    // Issue #274: ton sırayı ima etmez. Ton ADI ekranda yazılmaz
                                    // (persona çalışması 2026-10-19: "Nazik/Uyarı/Sert/Acil" jargon);
                                    // sertlik renk/ikonla görünür, ekran okuyucuya etikette söylenir.
                                    const adimEtiketi = tanim.tonSecilebilir
                                        ? bicim(mh.pencere.adimNumara, { n: adim.adimIndeks + 1 })
                                        : bilgi.baslik;
                                    const tonErisim = tanim.tonSecilebilir ? `, ${TON_ETIKETLERI[kademe]}` : '';
                                    // Alarm yalnız planın işaretlediği tetikte çalar; diğer tetikler bildirimdir.
                                    const tetikKanallari = acikOzetKanallari(adim.kanallar).filter(
                                        (k) => k !== 'alarm' || adim.alarm === true
                                    );
                                    const seviye = adim.seviye as MuhafizSeviye;
                                    const anonsMetni = ozelMetin
                                        ? adim.sesliAnons
                                            ? ozelMetin.anons
                                            : null
                                        : adim.sesliAnons && adim.anonsMetni.trim().length > 0
                                          ? anonsMetniniCoz(adim.anonsMetni, tanim.vakit, adim.olcuDk, tanim.yon)
                                          : null;
                                    // Duyulacak bir sey var mi? (metinsiz 'sesli' adim sessiz kalir)
                                    const dinlenebilir = bildirimSesiGerekliMi(adim.kanallar) || !!anonsMetni;
                                    // GERCEK ALARM (issue #74): planin isaretledigi tetik (ilk ya da
                                    // "her uyarida"). Motorla ayni alan → onizleme gercegi soyler.
                                    const alarmSaati = tanim.pencere
                                        ? saatMetni(kalanDkAni(tanim.pencere.bitis, adim.kalanDk))
                                        : undefined;
                                    const alarmEtiketi = adim.alarm === true ? alarmOnizlemeEtiketi(alarmSaati) : null;

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
                                            accessibilityLabel={`${esikIfadesi(adim.olcuDk, tanim.yon)}, ${adimEtiketi}${tonErisim}, ${kanalListesiMetni(tetikKanallari)}${alarmEtiketi ? `, ${alarmEtiketi}` : ''}`}
                                        >
                                            {/* Adım başlığı: SAAT büyük, yönlü ifade küçük ("45 dk" tek
                                                başına giriş yönünde belirsizdi — kala mı, sonra mı?);
                                                kanallar sağda ikon çipi. Orta noktalı metin yok. */}
                                            <View className="flex-row items-center mb-2">
                                                <View
                                                    className="w-2.5 h-2.5 rounded-full mr-2"
                                                    style={{ backgroundColor: bilgi.renk }}
                                                />
                                                <View className="flex-1 flex-row items-baseline flex-wrap" style={{ gap: 6 }}>
                                                    {tanim.pencere && (
                                                        <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                                            {saatMetni(kalanDkAni(tanim.pencere.bitis, adim.kalanDk))}
                                                        </Text>
                                                    )}
                                                    <Text
                                                        className={tanim.pencere ? 'text-xs' : 'text-sm font-bold'}
                                                        style={{ color: tanim.pencere ? renkler.metinIkincil : renkler.metin }}
                                                    >
                                                        {esikIfadesi(adim.olcuDk, tanim.yon)}
                                                    </Text>
                                                </View>
                                                <OzetCipleri
                                                    kanallar={tetikKanallari}
                                                    renk={bilgi.renk}
                                                    boyut="kucuk"
                                                />
                                            </View>

                                            {alarmEtiketi && (
                                                <View
                                                    testID="onizleme-alarm"
                                                    className="flex-row items-center self-start px-2 py-1 rounded-lg mb-2"
                                                    style={{ backgroundColor: `${bilgi.renk}20` }}
                                                >
                                                    <FontAwesome5
                                                        name="clock"
                                                        size={11}
                                                        color={bilgi.renk}
                                                        solid
                                                        style={{ marginRight: 6 }}
                                                    />
                                                    <Text className="text-[11px] font-bold" style={{ color: renkler.metin }}>
                                                        {alarmEtiketi}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Bildirim onizlemesi (adim kapali olamaz — plan kapalilari elemistir) */}
                                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                                {ozelMetin
                                                    ? ozelMetin.baslik
                                                    : basligiOlustur(tanim.vakit, seviye, adim.olcuDk, tanim.yon)}
                                            </Text>
                                            <Text className="text-xs mt-1 leading-4" style={{ color: renkler.metinIkincil }}>
                                                {ozelMetin ? ozelMetin.govde : bildirimGovdesiOlustur(seviye, tanim.yon, adim.olcuDk)}
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
                                                        erisimEtiketi={bicim(girisYonu ? mk.dinleGiris : mk.dinleCikis, { dk: adim.olcuDk })}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}

                                {sertAdimVar && (
                                    <Text className="text-[11px] mt-1 px-1 leading-4" style={{ color: renkler.metinIkincil }}>
                                        {bicim(mk.sertNot, { ad: mh.pencere.seviye.sert })}
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
