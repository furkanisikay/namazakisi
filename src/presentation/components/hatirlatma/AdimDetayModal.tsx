/**
 * ORTAK ADIM DETAY MODALI (Faz 3) — eski `MuhafizAyarlari/SeviyeDetayModal`.
 *
 * Katman 3: bir hatirlatma penceresinin bir adiminin detayi (kanallar / esik /
 * siklik / bildirim sesi / sesli anons metni). Hangi bolumlerin gorunecegini
 * `PencereTanimi` belirler → cuma yalnizca esik + siklik gorur, muhafiz hepsini.
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
import { Anahtar } from '../common/Anahtar';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { SayisalSecici } from '../common/SayisalSecici';
import type { AlarmKapsami, SeviyeAyari, SeviyeKademe, UyariKanallari } from '../../../core/muhafiz/matrisTipleri';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../core/muhafiz/matrisTipleri';
import { basligiOlustur } from '../../../core/utils/muhafizMetinYardimcisi';
import { adimKapaliMi, kanalAcikMi } from '../../../core/muhafiz/kanalKumesi';
import { ozelSesMi } from '../../../core/muhafiz/sesKimligi';
import { sesSec } from '../../../../modules/expo-countdown-notification/src';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { SesSecimSatiri } from './SesSecimSatiri';
import { anonsSablonlari, anonsMetniniCoz, varsayilanAnonsMetni } from '../../../core/muhafiz/anonsMetni';
import { esikSinirlariniHesapla } from '../../../core/muhafiz/esikSinirlari';
import { TurkceTtsUyarisi, DinleButonu } from './AnonsBilesenleri';
import { AdimNotlari, adimNotlariniOlustur } from './AdimNotlari';
import { AlarmOnayModal } from './AlarmOnayModal';
import { AlarmBilgiSatirlari, alarmNotlariniOlustur } from './AlarmBilgiSatirlari';
import { useAlarmIzinleri } from '../../hooks/useAlarmIzinleri';
import { ANONS_METIN_UST_SINIRI } from '../../../core/muhafiz/ios/anonsKlibi';
import {
    acilTonSecilebilirMi,
    bildirimSesiGerekliMi,
    etkinKademe,
    kademeSeviyeNo,
    sesliAnonsGerekliMi,
} from '../../../core/muhafiz/motorAdaptoru';
import { seviyeyiKapat } from '../../../core/muhafiz/seviyeAcKapa';
import { tonSecimiUygula } from '../../../core/muhafiz/adimDuzenleme';
import {
    KANAL_CIPLERI,
    SEVIYE_BILGILERI,
    TON_ETIKETLERI,
    acilTonKisitNotu,
    adimBasligiOlustur,
    adimBilgisiAl,
    TITRESIM_ACIKLAMASI,
    TITRESIM_ETIKETI,
    ALARM_ETIKETI,
    ALARM_KAPSAMI_NOTU,
    ALARM_KAPSAMI_SECENEKLERI,
    IOS_ALARM_KAPSAMI_NOTU,
    alarmAciklamasiOlustur,
    cipKanallariniBirlestir,
    kanalCipiSeciliMi,
    esikBasligiOlustur,
    esikAciklamasiOlustur,
    esikErisimAdiOlustur,
    esikBirimiOlustur,
    type PencereTanimi,
} from './pencereTanimi';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

export interface AdimDetayModalProps {
    gorunur: boolean;
    tanim: PencereTanimi;
    /** Pencerenin TUM adimlari — esik sinirlari komsulardan hesaplanir (spec 4.2) */
    seviyeler: SeviyeAyari[];
    indeks: number;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    onDegistir: (yeniSeviye: SeviyeAyari) => void;
    onKapat: () => void;
    /**
     * Hatırlatmayı sil (issue #274). Verilmezse "Sil" düğmesi çizilmez —
     * çağıran, son hatırlatmada (en az bir tane kalmalı) bunu geçmez.
     */
    onSil?: () => void;
    /**
     * Gerçek alarm rızası (issue #74, `muhafizSlice.alarmOnayi`) verildi mi? Verilmediyse
     * anahtarı açmak önce `AlarmOnayModal`'ı gösterir.
     */
    alarmOnayiVar?: boolean;
    /** Kullanıcı `AlarmOnayModal`'da onayladı — rıza kaydını yazar. */
    onAlarmOnayiVer?: () => void;
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

export const AdimDetayModal: React.FC<AdimDetayModalProps> = ({
    gorunur,
    tanim,
    seviyeler,
    indeks,
    ttsDestekli,
    onDegistir,
    onKapat,
    onSil,
    alarmOnayiVar = false,
    onAlarmOnayiVer,
}) => {
    const renkler = useRenkler();
    const seviye = seviyeler[indeks];
    /** Gerçek alarm rıza modalı açık mı (anahtar ilk kez açılırken). */
    const [alarmOnayAcik, setAlarmOnayAcik] = useState(false);
    const alarmAcikMi = gorunur && kanalAcikMi(seviye?.kanallar, 'alarm');
    // iOS'ta AlarmKit durumu rıza modalının metnini de belirler → adım detayı açıkken okunur.
    const alarmIzinleri = useAlarmIzinleri(
        gorunur &&
            tanim.alarmSecilebilir === true &&
            (tanim.yetenekler.platform === 'ios' || alarmAcikMi),
        tanim.yetenekler.platform
    );

    const [metinTaslak, setMetinTaslak] = useState(seviye?.anonsMetni ?? '');
    /** Ses secici acik mi? Cift dokunusa karsi butonu kilitler (bkz. `sesiSec`). */
    const [seciciAcik, setSeciciAcik] = useState(false);

    // Modal acilinca / baska adima gecince taslagi tazele
    useEffect(() => {
        if (gorunur) setMetinTaslak(seviye?.anonsMetni ?? '');
    }, [gorunur, tanim.kaynak, indeks, seviye?.anonsMetni]);

    // "Dinle" ile baslatilan ses modal kapaninca DEVAM ETMEMELI: native
    // `RingtoneManager` calmayi surdurur ve `AudioPlayer` serbest birakilmaz.
    useEffect(() => {
        if (gorunur) return;
        OnizlemeSesServisi.temizle();
    }, [gorunur]);
    useEffect(() => () => OnizlemeSesServisi.temizle(), []);

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

    const bilgi = adimBilgisiAl(tanim, seviye, indeks);
    const adimBasligi = adimBasligiOlustur(tanim, seviye, indeks);
    // Ekranda görünen ton = motorun kullandığı ton (acil kısıtı dahil).
    const etkinTon = etkinKademe(seviye, tanim.yon);
    const acilSecilebilir = acilTonSecilebilirMi(seviye.esikDk, tanim.yon);
    const sinirlar =
        tanim.esikSinirlari ??
        esikSinirlariniHesapla(seviyeler, indeks, {
            pencereUzunluguDk: tanim.pencereUzunluguDk,
            yon: tanim.yon,
        });
    const notlar = adimNotlariniOlustur(seviye, seviyeler, {
        pencereAdi: tanim.baslikKucuk,
        pencereUzunluguDk: tanim.pencereUzunluguDk,
        yon: tanim.yon,
        yetenekler: tanim.yetenekler,
    });
    const kapaliMi = adimKapaliMi(seviye.kanallar);
    const titresimliMi = kanalAcikMi(seviye.kanallar, 'titresim');
    const alarmliMi = kanalAcikMi(seviye.kanallar, 'alarm');
    const sesliMi = sesliAnonsGerekliMi(seviye.kanallar);
    const bildirimliMi = bildirimSesiGerekliMi(seviye.kanallar) && tanim.sesSecimiVar;
    const tekrarliMi = seviye.siklik !== 'birkez';
    const tekrarDk = seviye.siklik === 'birkez' ? tanim.varsayilanTekrarDk : seviye.siklik.herDk;
    const sablonlar = anonsSablonlari(tanim.yon);

    const kanallariSec = (kanallar: UyariKanallari) => {
        // "Kapalı" secmek, karttaki anahtari kapatmakla AYNI eylemdir → ayni
        // yardimciyi kullanir. Yoksa iki yol ayrisirdi: modaldan susturan
        // kullanicinin kanallari `oncekiKanallar`a yazilmaz, anahtarla geri
        // actiginda kurdugu kume yerine yalniz bildirime duserdi.
        if (adimKapaliMi(kanallar)) {
            onDegistir(seviyeyiKapat(seviye));
            return;
        }

        // Sesli kanal acilirken bos anons kutusu birakma (spec 7): YON-UYGUN
        // sablonla on-doldur (giris yonune cikis dilli metin yazilmasin).
        const sesliyeGecis = sesliAnonsGerekliMi(kanallar) && !seviye.anonsMetni;
        const anonsMetni = sesliyeGecis ? varsayilanAnonsMetni(tanim.yon) : seviye.anonsMetni;
        if (sesliyeGecis) setMetinTaslak(anonsMetni);
        // Kapaliliktan CIKISTA kanal hafizasi bayat kalmamali ("oncekiKanallar var
        // ⟺ hucre kapali" invarianti; `matrisIslemleri.seviyeyeUygula` de ayni
        // temizligi yapar).
        onDegistir({ ...seviye, kanallar, anonsMetni, oncekiKanallar: undefined });
    };

    /**
     * Titresimi ac/kapat. Cip kumesine DOKUNMAZ (bagimsiz eksen) ve `kanallariSec`
     * yolundan GECMEZ: o yol sesli-anons on-doldurmasi + kanal hafizasi temizligi
     * yapar; titresim ikisini de ilgilendirmez.
     */
    const titresimiAyarla = (acik: boolean) => {
        onDegistir({
            ...seviye,
            kanallar: acik
                ? { ...seviye.kanallar, titresim: true }
                : { ...seviye.kanallar, titresim: false },
        });
    };

    /**
     * GERÇEK ALARM aç/kapat (issue #74). Titreşim gibi bağımsız eksen: çip kümesine
     * dokunmaz. AÇMAK rıza ister — kayıt yoksa önce `AlarmOnayModal`; "Vazgeç" hiçbir
     * şey yazmaz. KAPATMAK rıza istemez.
     */
    const alarmiYaz = (acik: boolean) => {
        onDegistir({ ...seviye, kanallar: { ...seviye.kanallar, alarm: acik } });
    };
    /** Alarm kapsamı (#74): "ilk" alanı SİLER (yokluğu "ilk" demektir). */
    const alarmKapsaminiYaz = (kapsam: AlarmKapsami) => {
        if ((seviye.alarmKapsami ?? 'ilk') === kapsam) return;
        if (kapsam === 'hepsi') {
            onDegistir({ ...seviye, alarmKapsami: 'hepsi' });
            return;
        }
        const { alarmKapsami: _eski, ...kalan } = seviye;
        onDegistir(kalan);
    };
    const alarmiAyarla = (acik: boolean) => {
        if (acik && !alarmOnayiVar) {
            setAlarmOnayAcik(true);
            return;
        }
        alarmiYaz(acik);
    };

    /**
     * Ton seçimi (issue #274). Aciliyet tonla birlikte yazılır: yalnız ACİL ton
     * acil kanaldan (en üst önem) gider, diğerleri gitmez — kullanıcı ekranda
     * neyi seçtiyse bildirim de o ağırlıkta gelir.
     */
    const tonSec = (kademe: SeviyeKademe) => {
        // Seçili çipe (etkin ton) dokunmak eski kaydın aciliyetini düşürmez.
        const yeni = tonSecimiUygula(seviye, kademe, tanim.yon);
        if (yeni) onDegistir(yeni);
    };

    const sablonSec = (sablon: string) => {
        setMetinTaslak(sablon);
        onDegistir({ ...seviye, anonsMetni: sablon });
    };

    /**
     * Sistem ses secicisini acar. IZIN ISTEMEZ (RingtoneManager) — bu yuzden
     * disclosure modali da yoktur; secici kullanicinin kendi ekledigi sesleri de
     * listeler. Vazgecilirse (`null`) mevcut secim BOZULMADAN kalir.
     *
     * CIFT DOKUNUS KORUMASI: native taraf tek slotlu bir promise tutar; ikinci
     * cagri (kullanici satira iki kez dokunursa) reddedilir. Butonu bekleyen sure
     * boyunca kilitleyerek kullaniciya da "bir sey oluyor" geri bildirimi verilir.
     */
    const sesiSec = async () => {
        if (seciciAcik) return;
        setSeciciAcik(true);
        try {
            const secilen = await sesSec(
                ozelSesMi(seviye.bildirimSesi) ? seviye.bildirimSesi : null,
                'Bildirim sesi'
            );
            if (!secilen) return;
            onDegistir({ ...seviye, bildirimSesi: secilen.uri, sesAdi: secilen.ad });
        } finally {
            setSeciciAcik(false);
        }
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
                                    {adimBasligi}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {tanim.kanalSecimiVar ? `${tanim.baslik} vakti` : tanim.baslik}
                                    {tanim.tonSecilebilir ? ` · ${TON_ETIKETLERI[etkinTon]} ton` : ''}
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

                        {/* ── Nasil uyarsin (kanallar) ── */}
                        {tanim.kanalSecimiVar && (
                            <>
                                <BolumBasligi metin="NASIL UYARSIN" />
                                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                                    {KANAL_CIPLERI.filter((m) => tanim.kapaliCipiVar !== false || m.id !== 'kapali').map((m) => {
                                        const secili = kanalCipiSeciliMi(seviye.kanallar, m);
                                        return (
                                            <View key={m.id} style={{ width: tanim.kapaliCipiVar === false ? '33.33%' : '50%', paddingHorizontal: 4, paddingBottom: 8 }}>
                                                <TouchableOpacity
                                                    className="items-center justify-center py-3 px-2 rounded-2xl border"
                                                    style={{
                                                        minHeight: 76,
                                                        backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                        borderColor: secili ? renkler.birincil : renkler.sinir,
                                                        borderWidth: secili ? 2 : 1,
                                                    }}
                                                    onPress={() =>
                                                        kanallariSec(
                                                            cipKanallariniBirlestir(seviye.kanallar, m)
                                                        )
                                                    }
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

                                {/* TITRESIM — ciplerle AYNI eksende degil (bkz.
                                    `pencereTanimi.KANAL_CIPLERI`): bagimsiz bir
                                    kanal oldugu icin bagimsiz bir anahtar. Adim
                                    kapaliyken gosterilmez; kapali adimda tek
                                    anlamli eylem onu geri acmaktir.

                                    PLATFORM KAPISI: iOS'ta bildirim haptigi
                                    sistem ayarina baglidir, uygulama adim basina
                                    kontrol EDEMEZ → hicbir seyi degistirmeyen
                                    bir anahtar gostermek yaniltici olur. */}
                                {!kapaliMi && tanim.titresimSecilebilir && (
                                    <View
                                        className="flex-row items-center p-3.5 rounded-2xl border mt-1"
                                        style={{
                                            backgroundColor: renkler.arkaplan,
                                            borderColor: renkler.sinir,
                                        }}
                                    >
                                        <View
                                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                            style={{ backgroundColor: `${bilgi.renk}20` }}
                                        >
                                            <FontAwesome5
                                                name="mobile-alt"
                                                size={16}
                                                color={bilgi.renk}
                                                solid
                                            />
                                        </View>
                                        <View className="flex-1 pr-3">
                                            <Text
                                                className="text-sm font-semibold"
                                                style={{ color: renkler.metin }}
                                            >
                                                {TITRESIM_ETIKETI}
                                            </Text>
                                            <Text
                                                className="text-xs mt-0.5"
                                                style={{ color: renkler.metinIkincil }}
                                            >
                                                {TITRESIM_ACIKLAMASI}
                                            </Text>
                                        </View>
                                        <Anahtar
                                            value={titresimliMi}
                                            onValueChange={titresimiAyarla}
                                            trackColor={{ false: renkler.sinir, true: `${bilgi.renk}80` }}
                                            thumbColor={titresimliMi ? bilgi.renk : '#f4f3f4'}
                                            accessibilityRole="switch"
                                            accessibilityState={{ checked: titresimliMi }}
                                            accessibilityLabel={TITRESIM_ETIKETI}
                                            testID="adim-titresim-anahtari"
                                        />
                                    </View>
                                )}

                                {/* GERÇEK ALARM (issue #74) — titreşimle AYNI gerekçe: bağımsız
                                    kanal → bağımsız anahtar. Adım kapalıyken gösterilmez. */}
                                {!kapaliMi && tanim.alarmSecilebilir === true && (
                                    <View
                                        className="p-3.5 rounded-2xl border mt-2"
                                        style={{
                                            backgroundColor: renkler.arkaplan,
                                            borderColor: alarmliMi ? bilgi.renk : renkler.sinir,
                                        }}
                                    >
                                        <View className="flex-row items-center">
                                            <View
                                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                                style={{ backgroundColor: `${bilgi.renk}20` }}
                                            >
                                                <FontAwesome5 name="clock" size={16} color={bilgi.renk} solid />
                                            </View>
                                            <View className="flex-1 pr-3">
                                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                                    {ALARM_ETIKETI}
                                                </Text>
                                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                                    {alarmAciklamasiOlustur(alarmliMi ? seviye.alarmKapsami : undefined)}
                                                </Text>
                                            </View>
                                            <Anahtar
                                                value={alarmliMi}
                                                onValueChange={alarmiAyarla}
                                                trackColor={{ false: renkler.sinir, true: `${bilgi.renk}80` }}
                                                thumbColor={alarmliMi ? bilgi.renk : '#f4f3f4'}
                                                accessibilityRole="switch"
                                                accessibilityState={{ checked: alarmliMi }}
                                                accessibilityLabel={ALARM_ETIKETI}
                                                testID="adim-alarm-anahtari"
                                            />
                                        </View>
                                        {/* KAPSAM: yalnız ilk uyarıda (varsayılan) / her uyarıda. Alan
                                            yalnız "hepsi" iken yazılır — "ilk" alanı SİLER (eski kayıtla
                                            birebir aynı plan; kayıt-oynat değişmez). */}
                                        {alarmliMi && (
                                            <View className="mt-3">
                                                <View className="flex-row gap-2">
                                                    {ALARM_KAPSAMI_SECENEKLERI.map((s) => {
                                                        const secili = (seviye.alarmKapsami ?? 'ilk') === s.kapsam;
                                                        return (
                                                            <TouchableOpacity
                                                                key={s.kapsam}
                                                                testID={`alarm-kapsami-${s.kapsam}`}
                                                                className="flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-2xl border"
                                                                style={{
                                                                    minHeight: 44,
                                                                    backgroundColor: secili ? `${bilgi.renk}15` : renkler.kartArkaplan,
                                                                    borderColor: secili ? bilgi.renk : renkler.sinir,
                                                                    borderWidth: secili ? 2 : 1,
                                                                }}
                                                                onPress={() => alarmKapsaminiYaz(s.kapsam)}
                                                                activeOpacity={0.7}
                                                                accessibilityRole="button"
                                                                accessibilityState={{ selected: secili }}
                                                                accessibilityLabel={`Alarm: ${s.etiket}`}
                                                            >
                                                                <FontAwesome5
                                                                    name={s.ikon}
                                                                    size={12}
                                                                    color={secili ? bilgi.renk : renkler.metinIkincil}
                                                                    style={{ marginRight: 6 }}
                                                                />
                                                                <Text
                                                                    className="text-xs font-semibold"
                                                                    style={{ color: secili ? bilgi.renk : renkler.metin }}
                                                                >
                                                                    {s.etiket}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                                {seviye.alarmKapsami === 'hepsi' && (
                                                    <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                                                        {ALARM_KAPSAMI_NOTU}
                                                        {tanim.yetenekler.platform === 'ios' ? ` ${IOS_ALARM_KAPSAMI_NOTU}` : ''}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                        {alarmliMi && (
                                            <AlarmBilgiSatirlari
                                                notlar={alarmNotlariniOlustur({
                                                    platform: tanim.yetenekler.platform,
                                                    tamEkran: alarmIzinleri.tamEkran,
                                                    tamAlarm: alarmIzinleri.tamAlarm,
                                                    alarmKit: alarmIzinleri.alarmKit,
                                                })}
                                                onIzinAyari={() => void alarmIzinleri.ayariAc()}
                                                onAlarmIzni={() => void alarmIzinleri.izinIste()}
                                            />
                                        )}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Faz 5: "yakında" bandi kalkti — sesli anons gercekten calisiyor.
                            Yerine yalniz Turkce paket eksikse kibar bilgilendirme cikar.

                            iOS'ta GOSTERILMEZ: anons TTS ile degil on-kayitli
                            klip ile calisir, dolayisiyla "Turkce konusma paketi"
                            diye bir kavram yoktur (`useTurkceTtsDestegi` orada
                            zaten `null` doner, bu kapi ikinci savunmadir). */}
                        {sesliMi && (tanim.anonsMetniDuzenlenebilir || !!tanim.anonsOrnegiOlustur) && (
                            <TurkceTtsUyarisi destekli={ttsDestekli} />
                        )}

                        {kapaliMi ? (
                            <View className="items-center py-10">
                                <FontAwesome5 name="bell-slash" size={34} color={renkler.metinIkincil} />
                                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                    Bu adım kapalı. {tanim.baslik} vaktinde bu aşamada uyarı almazsınız.
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* ── Esik ── */}
                                <BolumBasligi metin={tanim.esikBasligi ?? esikBasligiOlustur(tanim.yon)} />
                                <View
                                    className="flex-row items-center justify-between p-3.5 rounded-2xl border"
                                    style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                                >
                                    <View className="flex-1 pr-3">
                                        <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                            {tanim.esikAciklamasi ?? esikAciklamasiOlustur(tanim.yon)}
                                        </Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            {sinirlar.min}–{sinirlar.max} dk arası seçebilirsiniz
                                        </Text>
                                    </View>
                                    <SayisalSecici
                                        deger={seviye.esikDk}
                                        min={sinirlar.min}
                                        max={sinirlar.max}
                                        adim={tanim.esikAdimDk}
                                        birim={tanim.esikBirimi ?? esikBirimiOlustur(tanim.yon)}
                                        onChange={(val) => onDegistir({ ...seviye, esikDk: val })}
                                        renk={bilgi.renk}
                                        degerGenisligi={92}
                                        aciklama={tanim.esikErisimAdi ?? esikErisimAdiOlustur(tanim.yon)}
                                    />
                                </View>

                                {/* Faz 0: pencereye sigmayan / seyreltilen adim uyarisi */}
                                <AdimNotlari notlar={notlar} />

                                {/* ── Siklik ── (tek atışlık hatırlatmalarda — nafile — gizlenir) */}
                                {tanim.siklikSecimiVar !== false && (<>
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
                                            min={tanim.tekrarMinDk}
                                            max={tanim.tekrarMaxDk}
                                            adim={1}
                                            birim="dk'da bir"
                                            onChange={(val) => onDegistir({ ...seviye, siklik: { herDk: val } })}
                                            renk={bilgi.renk}
                                            degerGenisligi={96}
                                            aciklama="Tekrar aralığı"
                                        />
                                    </View>
                                )}
                                </>)}

                                {/* ── Ton (issue #274) ── sıra zamandan gelir, sertlik buradan */}
                                {tanim.tonSecilebilir && (
                                    <>
                                        <BolumBasligi metin="TON" />
                                        <View className="flex-row gap-1.5">
                                            {SEVIYE_KADEMELERI.map((kademe) => {
                                                const tonBilgi = SEVIYE_BILGILERI[kademe];
                                                const secili = etkinTon === kademe;
                                                const devreDisi = kademe === 'acil' && !acilSecilebilir;
                                                return (
                                                    <TouchableOpacity
                                                        key={kademe}
                                                        className="flex-1 items-center justify-center py-2.5 rounded-2xl border"
                                                        style={{
                                                            minHeight: 56,
                                                            opacity: devreDisi ? 0.4 : 1,
                                                            backgroundColor: secili ? `${tonBilgi.renk}15` : renkler.arkaplan,
                                                            borderColor: secili ? tonBilgi.renk : renkler.sinir,
                                                            borderWidth: secili ? 2 : 1,
                                                        }}
                                                        disabled={devreDisi}
                                                        onPress={() => tonSec(kademe)}
                                                        activeOpacity={0.7}
                                                        accessibilityRole="button"
                                                        accessibilityState={{ selected: secili, disabled: devreDisi }}
                                                        accessibilityLabel={`${TON_ETIKETLERI[kademe]} ton`}
                                                    >
                                                        <FontAwesome5
                                                            name={tonBilgi.ikon}
                                                            size={14}
                                                            color={secili ? tonBilgi.renk : renkler.metinIkincil}
                                                            solid
                                                        />
                                                        <Text
                                                            className="text-xs font-semibold mt-1"
                                                            style={{ color: renkler.metin }}
                                                        >
                                                            {TON_ETIKETLERI[kademe]}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        {!acilSecilebilir && (
                                            <Text className="text-xs mt-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                                {acilTonKisitNotu(tanim.yon)}
                                            </Text>
                                        )}
                                        {/* Örnek: bu tonla ve bu eşikte GERÇEK bildirim başlığı */}
                                        <View
                                            className="flex-row items-start p-3 rounded-2xl mt-2"
                                            style={{ backgroundColor: `${bilgi.renk}10` }}
                                        >
                                            <FontAwesome5
                                                name="quote-left"
                                                size={10}
                                                color={renkler.metinIkincil}
                                                style={{ marginRight: 8, marginTop: 3 }}
                                            />
                                            <Text className="flex-1 text-xs leading-4" style={{ color: renkler.metin }}>
                                                {basligiOlustur(
                                                    tanim.vakit,
                                                    kademeSeviyeNo(etkinTon),
                                                    seviye.esikDk,
                                                    tanim.yon
                                                )}
                                                {etkinTon === 'acil'
                                                    ? ' · Bildirim ekranın üstünde kalır; Rahatsız Etmeyin modunu delebilir.'
                                                    : ''}
                                            </Text>
                                        </View>
                                    </>
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
                                            seciliyor={seciciAcik}
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

                                {/* ── Sesli anons ÖRNEĞİ (nafile, #273) — metin bağlamdan
                                    üretilir, yazılmaz; kullanıcı ne duyacağını görür/dinler. */}
                                {sesliMi && tanim.anonsOrnegiOlustur && (
                                    <View
                                        testID="anons-ornegi"
                                        className="p-3 rounded-2xl mt-4"
                                        style={{ backgroundColor: `${renkler.birincil}10` }}
                                    >
                                        <Text
                                            className="text-[10px] font-semibold tracking-wider mb-1"
                                            style={{ color: renkler.metinIkincil }}
                                        >
                                            TELEFONUNUZ ŞÖYLE OKUR
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Text className="flex-1 text-sm pr-3" style={{ color: renkler.metin }}>
                                                {tanim.anonsOrnegiOlustur(seviye)}
                                            </Text>
                                            <DinleButonu
                                                kanallar={seviye.kanallar}
                                                bildirimSesi={seviye.bildirimSesi}
                                                cozulmusMetin={tanim.anonsOrnegiOlustur(seviye)}
                                                erisimEtiketi="Örnek okunuşu dinleyin"
                                            />
                                        </View>
                                        <Text className="text-xs mt-1.5 leading-4" style={{ color: renkler.metinIkincil }}>
                                            Sesli anons sessiz modda da duyulur.
                                        </Text>
                                    </View>
                                )}

                                {/* ── Sesli anons metni ── */}
                                {sesliMi && !tanim.anonsOrnegiOlustur && (
                                    <>
                                        <BolumBasligi metin="SESLİ ANONS METNİ" />
                                        {tanim.anonsMetniDuzenlenebilir ? (
                                            <Text className="text-xs mb-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                                {'{vakit}'}, {'{süre}'} ve {'{yön}'} yer tutucularını kullanın; okunurken
                                                vakit adı, dakika ve “kaldı/geçti” ile değiştirilir. {'{yön}'} kullanan bir
                                                metin, hatırlatma yönünü değiştirseniz de doğru okunur.
                                            </Text>
                                        ) : (
                                            /* iOS: metin calisma aninda seslendirilemez (arka planda kod
                                               calistirilamaz) → anons hazir bir ses klibidir ve metni sabittir.
                                               Kutu GIZLENMEZ, salt okunur gosterilir; kullanicinin Android'de
                                               yazdigi metin matriste DURUR, yalnizca burada duzenlenemez. */
                                            <Text className="text-xs mb-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                                Bu adımda hazır bir ses kaydı çalınır; metni iPhone’da
                                                değiştirilemez.
                                            </Text>
                                        )}

                                        <View
                                            className="flex-row flex-wrap"
                                            style={{
                                                marginHorizontal: -3,
                                                display: tanim.anonsMetniDuzenlenebilir ? 'flex' : 'none',
                                            }}
                                        >
                                            {sablonlar.map((sablon) => {
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
                                            editable={tanim.anonsMetniDuzenlenebilir}
                                            // iOS bildirim sesi 30 sn'yi asarsa HIC calmaz; sinir
                                            // iki platformda ayni tutulur (yedek tasininca kirilmasin).
                                            maxLength={ANONS_METIN_UST_SINIRI}
                                            multiline
                                            placeholder={sablonlar[0]}
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
                                                        {anonsMetniniCoz(metinTaslak, tanim.vakit, seviye.esikDk, tanim.yon)}
                                                    </Text>
                                                    {/* Iki kanal da acikken gercek akisla ayni sirayla calar:
                                                        once bildirim sesi, ardindan anons. */}
                                                    <DinleButonu
                                                        kanallar={seviye.kanallar}
                                                        bildirimSesi={seviye.bildirimSesi}
                                                        cozulmusMetin={anonsMetniniCoz(
                                                            metinTaslak,
                                                            tanim.vakit,
                                                            seviye.esikDk,
                                                            tanim.yon
                                                        )}
                                                        erisimEtiketi={
                                                            kanalAcikMi(seviye.kanallar, 'bildirim')
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

                        {/* ── Sil (issue #274) — en az bir hatırlatma kalır ── */}
                        {onSil && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-2xl mt-6"
                                style={{
                                    minHeight: 48,
                                    backgroundColor: renkler.arkaplan,
                                    borderWidth: 1,
                                    borderColor: renkler.sinir,
                                }}
                                onPress={onSil}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`${adimBasligi} — silin`}
                            >
                                <FontAwesome5
                                    name="trash-alt"
                                    size={13}
                                    color={renkler.metinIkincil}
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Bu hatırlatmayı silin
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                {/* Gerçek alarm rızası — modal AĞACININ İÇİNDE (iç içe): iOS aynı anda iki
                    kardeş modal sunamaz. Onay rızayı yazar VE anahtarı açar. */}
                {alarmOnayAcik && (
                    <AlarmOnayModal
                        gorunur
                        platform={tanim.yetenekler.platform}
                        alarmKit={alarmIzinleri.alarmKit}
                        onOnayla={() => {
                            setAlarmOnayAcik(false);
                            onAlarmOnayiVer?.();
                            if (tanim.yetenekler.platform !== 'ios') {
                                alarmiYaz(true);
                                return;
                            }
                            // iOS: sistem alarm izni (AlarmKit) anahtar YAZILMADAN ÖNCE istenir —
                            // matris değişince ekranın planlaması izin sonucuyla koşsun. Red
                            // edilse de anahtar açılır (uzun sesli bildirim + ekranda uyarı).
                            void alarmIzinleri.izinIste(false).finally(() => alarmiYaz(true));
                        }}
                        onIptal={() => setAlarmOnayAcik(false)}
                    />
                )}
            </View>
        </Modal>
    );
};
