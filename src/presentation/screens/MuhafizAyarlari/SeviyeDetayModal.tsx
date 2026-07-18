/**
 * Katman 3 — bir vaktin bir adiminin (seviyesinin) detayi.
 * (spec 3: mod / kac dk kala / siklik / bildirim sesi / sesli anons metni)
 *
 * Degisiklikler ANINDA uygulanir (uygulamanin genel ayar davranisi); serbest metin
 * alani yalniz duzenleme bitince yazilir — her tusa basista tum matrisi diske
 * yazmamak icin.
 */
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    ScrollView,
    TextInput,
    StyleSheet,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { SayisalSecici } from '../../components/common/SayisalSecici';
import type { MuhafizVakti, SeviyeAyari, UyariModu } from '../../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../../core/muhafiz/matrisTipleri';
import { ozelSesMi } from '../../../core/muhafiz/sesKimligi';
import { sesSec } from '../../../../modules/expo-countdown-notification/src';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { SesSecimSatiri } from './SesSecimSatiri';
import { ANONS_SABLONLARI, anonsMetniniCoz } from '../../../core/muhafiz/anonsMetni';
import { esikSinirlariniHesapla } from '../../../core/muhafiz/esikSinirlari';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import { TurkceTtsUyarisi, DinleButonu } from './AnonsBilesenleri';
import {
    SEVIYE_BILGILERI,
    MOD_BILGILERI,
    SESLI_MODLAR,
    BILDIRIMLI_MODLAR,
    VARSAYILAN_TEKRAR_DK,
    TEKRAR_MIN_DK,
    TEKRAR_MAX_DK,
    ESIK_ADIM_DK,
} from './sabitler';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

export interface SeviyeDetayModalProps {
    gorunur: boolean;
    vakit: MuhafizVakti;
    /** Vaktin TUM seviyeleri — esik sinirlari komsulardan hesaplanir (spec 4.2) */
    seviyeler: SeviyeAyari[];
    indeks: number;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    onDegistir: (yeniSeviye: SeviyeAyari) => void;
    onKapat: () => void;
}

/** Bolum basligi (kucuk, harf arali); `sag` ile satirin sagina aksiyon konabilir. */
const BolumBasligi: React.FC<{ metin: string; sag?: React.ReactNode }> = ({ metin, sag }) => {
    const renkler = useRenkler();
    return (
        <View className="flex-row items-center justify-between mb-2 mt-4">
            <Text
                className="text-[11px] font-semibold tracking-wider"
                style={{ color: renkler.metinIkincil }}
            >
                {metin}
            </Text>
            {sag}
        </View>
    );
};

export const SeviyeDetayModal: React.FC<SeviyeDetayModalProps> = ({
    gorunur,
    vakit,
    seviyeler,
    indeks,
    ttsDestekli,
    onDegistir,
    onKapat,
}) => {
    const renkler = useRenkler();
    const seviye = seviyeler[indeks];

    const [metinTaslak, setMetinTaslak] = useState(seviye?.anonsMetni ?? '');

    // Modal acilinca / baska adima gecince taslagi tazele
    useEffect(() => {
        if (gorunur) setMetinTaslak(seviye?.anonsMetni ?? '');
    }, [gorunur, vakit, indeks, seviye?.anonsMetni]);

    const metniIsle = useCallback(() => {
        if (!seviye) return;
        if (metinTaslak !== seviye.anonsMetni) {
            onDegistir({ ...seviye, anonsMetni: metinTaslak });
        }
    }, [metinTaslak, seviye, onDegistir]);

    const kapat = useCallback(() => {
        metniIsle();
        onKapat();
    }, [metniIsle, onKapat]);

    useDonanimGeriTusu(gorunur, kapat);

    if (!seviye) return null;

    const bilgi = SEVIYE_BILGILERI[seviye.kademe];
    const vakitAdi = VAKIT_ADLARI[vakit];
    const sinirlar = esikSinirlariniHesapla(seviyeler, indeks);
    const sessizMi = seviye.mod === 'sessiz';
    const sesliMi = SESLI_MODLAR.includes(seviye.mod);
    const bildirimliMi = BILDIRIMLI_MODLAR.includes(seviye.mod);
    const tekrarliMi = seviye.siklik !== 'birkez';
    const tekrarDk = seviye.siklik === 'birkez' ? VARSAYILAN_TEKRAR_DK : seviye.siklik.herDk;

    const modSec = (mod: UyariModu) => {
        // Sesli moda gecerken bos anons kutusu birakma (spec 7): sablonla on-doldur.
        const sesliyeGecis = SESLI_MODLAR.includes(mod) && !seviye.anonsMetni;
        const anonsMetni = sesliyeGecis ? ANONS_SABLONLARI[0] : seviye.anonsMetni;
        if (sesliyeGecis) setMetinTaslak(anonsMetni);
        onDegistir({ ...seviye, mod, anonsMetni });
    };

    const sablonSec = (sablon: string) => {
        setMetinTaslak(sablon);
        onDegistir({ ...seviye, anonsMetni: sablon });
    };

    /**
     * Sistem ses secicisini acar. IZIN ISTEMEZ (RingtoneManager) — bu yuzden
     * disclosure modali da yoktur; secici kullanicinin kendi ekledigi sesleri de
     * listeler. Vazgecilirse (`null`) mevcut secim BOZULMADAN kalir.
     */
    const sesiSec = async () => {
        const secilen = await sesSec(
            ozelSesMi(seviye.bildirimSesi) ? seviye.bildirimSesi : null,
            'Bildirim sesi'
        );
        if (!secilen) return;
        onDegistir({ ...seviye, bildirimSesi: secilen.uri, sesAdi: secilen.ad });
    };

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={kapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {/* Backdrop — absolute sibling: ic ScrollView scroll'unu takmaz */}
                <TouchableWithoutFeedback onPress={kapat}>
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
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    >
                        {/* Baslik */}
                        <View className="flex-row items-center mt-2 mb-1">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: `${bilgi.renk}20` }}
                            >
                                <FontAwesome5 name={bilgi.ikon} size={17} color={bilgi.renk} solid />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                    {bilgi.baslik}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {vakitAdi} vakti
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="w-11 h-11 items-center justify-center"
                                onPress={kapat}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel="Kapat"
                            >
                                <FontAwesome5 name="times" size={18} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        </View>

                        {/* ── Nasil uyarsin (mod) ── */}
                        <BolumBasligi metin="NASIL UYARSIN" />
                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                            {MOD_BILGILERI.map((m) => {
                                const secili = seviye.mod === m.id;
                                return (
                                    <View key={m.id} style={{ width: '50%', paddingHorizontal: 4, paddingBottom: 8 }}>
                                        <TouchableOpacity
                                            className="items-center justify-center py-3 px-2 rounded-2xl border"
                                            style={{
                                                minHeight: 76,
                                                backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                borderColor: secili ? renkler.birincil : renkler.sinir,
                                                borderWidth: secili ? 2 : 1,
                                            }}
                                            onPress={() => modSec(m.id)}
                                            activeOpacity={0.7}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: secili }}
                                            accessibilityLabel={m.etiket}
                                        >
                                            <FontAwesome5
                                                name={m.ikon}
                                                size={16}
                                                color={secili ? renkler.birincil : renkler.metinIkincil}
                                                solid
                                            />
                                            <Text
                                                className="text-xs font-semibold mt-1.5"
                                                style={{ color: secili ? renkler.birincil : renkler.metin }}
                                            >
                                                {m.etiket}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Faz 5: "yakında" bandi kalkti — sesli anons gercekten calisiyor.
                            Yerine yalniz Turkce paket eksikse kibar bilgilendirme cikar. */}
                        {sesliMi && <TurkceTtsUyarisi destekli={ttsDestekli} />}

                        {sessizMi ? (
                            <View className="items-center py-10">
                                <FontAwesome5 name="bell-slash" size={34} color={renkler.metinIkincil} />
                                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                    Bu adım kapalı. {vakitAdi} vaktinde bu aşamada uyarı almazsınız.
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* ── Kac dk kala ── */}
                                <BolumBasligi metin="KAÇ DK KALA" />
                                <View
                                    className="flex-row items-center justify-between p-3.5 rounded-2xl border"
                                    style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                                >
                                    <View className="flex-1 pr-3">
                                        <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                            Vaktin çıkmasına
                                        </Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            {sinirlar.min}–{sinirlar.max} dk arası seçebilirsiniz
                                        </Text>
                                    </View>
                                    <SayisalSecici
                                        deger={seviye.esikDk}
                                        min={sinirlar.min}
                                        max={sinirlar.max}
                                        adim={ESIK_ADIM_DK}
                                        birim="dk kala"
                                        onChange={(val) => onDegistir({ ...seviye, esikDk: val })}
                                        renk={bilgi.renk}
                                        degerGenisligi={92}
                                        aciklama="Kaç dk kala"
                                    />
                                </View>

                                {/* ── Siklik ── */}
                                <BolumBasligi metin="SIKLIK" />
                                <View className="flex-row gap-2">
                                    {[
                                        { tekrar: false, etiket: 'Bir kez', ikon: 'dot-circle' },
                                        { tekrar: true, etiket: 'Tekrarlı', ikon: 'redo' },
                                    ].map(({ tekrar, etiket, ikon }) => {
                                        const secili = tekrarliMi === tekrar;
                                        return (
                                            <TouchableOpacity
                                                key={etiket}
                                                className="flex-1 flex-row items-center justify-center py-3 rounded-2xl border"
                                                style={{
                                                    backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                    borderColor: secili ? renkler.birincil : renkler.sinir,
                                                    borderWidth: secili ? 2 : 1,
                                                    minHeight: 44,
                                                }}
                                                onPress={() =>
                                                    onDegistir({
                                                        ...seviye,
                                                        siklik: tekrar ? { herDk: tekrarDk } : 'birkez',
                                                    })
                                                }
                                                activeOpacity={0.7}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: secili }}
                                                accessibilityLabel={etiket}
                                            >
                                                <FontAwesome5
                                                    name={ikon}
                                                    size={13}
                                                    color={secili ? renkler.birincil : renkler.metinIkincil}
                                                    style={{ marginRight: 7 }}
                                                />
                                                <Text
                                                    className="text-sm font-semibold"
                                                    style={{ color: secili ? renkler.birincil : renkler.metin }}
                                                >
                                                    {etiket}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {tekrarliMi && (
                                    <View
                                        className="flex-row items-center justify-between p-3.5 rounded-2xl border mt-2"
                                        style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                                    >
                                        <Text className="text-sm font-medium flex-1 pr-3" style={{ color: renkler.metin }}>
                                            Tekrar aralığı
                                        </Text>
                                        <SayisalSecici
                                            deger={tekrarDk}
                                            min={TEKRAR_MIN_DK}
                                            max={TEKRAR_MAX_DK}
                                            adim={1}
                                            birim="dk'da bir"
                                            onChange={(val) => onDegistir({ ...seviye, siklik: { herDk: val } })}
                                            renk={bilgi.renk}
                                            degerGenisligi={96}
                                            aciklama="Tekrar aralığı"
                                        />
                                    </View>
                                )}

                                {/* ── Bildirim sesi ──
                                    Tek satir: secili sesin adi + "dinle" + secici.
                                    (Eski uc cipli palet ucunu de AYNI dosyaya cozuyordu — kaldirildi.) */}
                                {bildirimliMi && (
                                    <>
                                        <BolumBasligi metin="BİLDİRİM SESİ" />
                                        <SesSecimSatiri
                                            bildirimSesi={seviye.bildirimSesi}
                                            sesAdi={seviye.sesAdi}
                                            onSec={() => { void sesiSec(); }}
                                            onDinle={() => {
                                                void OnizlemeSesServisi.bildirimSesiniCal(seviye.bildirimSesi);
                                            }}
                                        />
                                        {ozelSesMi(seviye.bildirimSesi) && (
                                            <TouchableOpacity
                                                className="flex-row items-center justify-center mt-2 px-3 rounded-xl"
                                                style={{ minHeight: 44 }}
                                                onPress={() =>
                                                    onDegistir({
                                                        ...seviye,
                                                        bildirimSesi: VARSAYILAN_SES,
                                                        sesAdi: undefined,
                                                    })
                                                }
                                                activeOpacity={0.7}
                                                accessibilityRole="button"
                                                accessibilityLabel="Uygulama sesine dönün"
                                            >
                                                <FontAwesome5
                                                    name="undo"
                                                    size={11}
                                                    color={renkler.metinIkincil}
                                                    style={{ marginRight: 7 }}
                                                />
                                                <Text className="text-xs font-medium" style={{ color: renkler.metinIkincil }}>
                                                    Uygulama sesine dön
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}

                                {/* ── Sesli anons metni ── */}
                                {sesliMi && (
                                    <>
                                        <BolumBasligi metin="SESLİ ANONS METNİ" />
                                        <Text className="text-xs mb-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                            {'{vakit}'} ve {'{süre}'} yer tutucularını kullanın; okunurken vakit adı ve
                                            kalan dakika ile değiştirilir.
                                        </Text>

                                        <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
                                            {ANONS_SABLONLARI.map((sablon) => {
                                                const secili = metinTaslak === sablon;
                                                return (
                                                    <View key={sablon} style={{ paddingHorizontal: 3, paddingBottom: 6 }}>
                                                        <TouchableOpacity
                                                            className="px-3 rounded-xl border items-center justify-center"
                                                            style={{
                                                                minHeight: 44,
                                                                backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                                borderColor: secili ? renkler.birincil : renkler.sinir,
                                                            }}
                                                            onPress={() => sablonSec(sablon)}
                                                            activeOpacity={0.7}
                                                            accessibilityRole="button"
                                                            accessibilityState={{ selected: secili }}
                                                            accessibilityLabel={`Hazır metin: ${sablon}`}
                                                        >
                                                            <Text
                                                                className="text-xs"
                                                                style={{ color: secili ? renkler.birincil : renkler.metin }}
                                                            >
                                                                {sablon}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        <TextInput
                                            value={metinTaslak}
                                            onChangeText={setMetinTaslak}
                                            onEndEditing={metniIsle}
                                            onBlur={metniIsle}
                                            multiline
                                            placeholder="{vakit} vakti çıkıyor, son {süre} dakika."
                                            placeholderTextColor={renkler.metinIkincil}
                                            accessibilityLabel="Sesli anons metni"
                                            className="text-sm p-3.5 rounded-2xl border mt-1"
                                            style={{
                                                backgroundColor: renkler.arkaplan,
                                                borderColor: renkler.sinir,
                                                color: renkler.metin,
                                                minHeight: 88,
                                                textAlignVertical: 'top',
                                            }}
                                        />

                                        {!!metinTaslak && (
                                            <View
                                                className="p-3 rounded-2xl mt-2"
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
                                                        {anonsMetniniCoz(metinTaslak, vakit, seviye.esikDk)}
                                                    </Text>
                                                    {/* Mod 'ikisi' ise gercek akisla ayni sirayla calar:
                                                        once bildirim sesi, ardindan anons. */}
                                                    <DinleButonu
                                                        mod={seviye.mod}
                                                        bildirimSesi={seviye.bildirimSesi}
                                                        cozulmusMetin={anonsMetniniCoz(metinTaslak, vakit, seviye.esikDk)}
                                                        erisimEtiketi={
                                                            seviye.mod === 'ikisi'
                                                                ? 'Bildirim sesini ve örnek okunuşu dinleyin'
                                                                : 'Örnek okunuşu dinleyin'
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
