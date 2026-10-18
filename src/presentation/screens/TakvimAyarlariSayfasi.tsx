/**
 * Takvim Entegrasyonu ("Vakitleri takvime ekleyin") — cihaz takvimine etkinlik yazar.
 *
 * Sade tasarım Dalga 4:
 *   - İZİN AKIŞI: ana anahtar açılırken izin yoksa önce açıklama (`RizaModali`, 3 madde),
 *     modal TAMAMEN kapanınca sistem diyaloğu (`useIzinAkisi`), sonra durum yeniden okunur.
 *     Takvim listesi yalnız izin VERİLMİŞKEN okunur (eskiden okuma izni açıklamasız
 *     istiyordu; red "takvim bulunamadı" diye yanlış teşhis ediliyordu).
 *   - BEKLEYEN DEĞİŞİKLİK: ayar değişikliği takvime kendiliğinden yazılmaz (uygulama
 *     dışına geri alınamaz yazım) → son aktarımdan beri ayar değiştiyse kalıcı bant
 *     "Takvime aktarılmayı bekleyen değişiklik · Şimdi aktarın" (`aktarimOzeti`).
 *   - Adımlar numaralı (1 Takvim · 2 Vakitler · 3 Süre · 4 Önizleme), başarıda
 *     "Takvime ekle" sahnesi (`TakvimeEkleHareketi`). Silme akışı (önizleme listesi +
 *     sayılı düğme + özet) aynen korunur.
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Modal,
    Animated,
    Easing,
    Dimensions,
    StyleSheet,
    Platform,
} from 'react-native';
import { Anahtar } from '../components/common/Anahtar';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { Logger } from '../../core/utils/Logger';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    takvimAyarlariniYukle,
    takvimAyarlariniGuncelle,
    takvimOlaylariniOlustur,
    type TakvimVakitAdi,
    type VakitTakvimAyari,
    type BaslangicTipi,
} from '../store/takvimSlice';
import { TakvimServisi } from '../../domain/services/TakvimServisi';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { useFeedback } from '../../core/feedback';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { OzetSatir, takvimUygulamasiniAc, BildirimBanneri, OzellikBilgi, BasariIcerigi } from './TakvimAyarlari/bilesenler';
import { VAKIT_GORUNTU_ADLARI, VAKIT_SIRASI, VAKIT_TEMIZLE_BASLIK, saatFormatla } from './TakvimAyarlari/sabitler';
import { TemizleModali } from './TakvimAyarlari/TemizleModali';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { aktarimOzeti, bekleyenDegisiklikVarMi } from '../../core/takvim/aktarimOzeti';
import { RizaModali } from '../components/ortak/RizaModali';
import { useIzinAkisi } from '../components/ortak/useIzinAkisi';
import { DurumSatiri } from '../components/ortak/DurumSatiri';
import { BOS_CIHAZ_DURUMU, durumNotu, type IzinDurumu } from '../../core/cihaz/durumNotlari';

/** Takvim izni yalnız OKUNUR (diyalog açmaz); `expo-calendar/legacy` (kök giriş fırlatır). */
const takvimIzniOku = async (): Promise<IzinDurumu | null> => {
    const { alaniOku } = require('../../domain/services/CihazDurumOkuyucu') as typeof import('../../domain/services/CihazDurumOkuyucu');
    return alaniOku('takvimIzni');
};
const takvimIzniIste = async (): Promise<void> => {
    const C = require('expo-calendar/legacy') as typeof import('expo-calendar/legacy');
    await C.requestCalendarPermissionsAsync();
};

/** Numaralı adım başlığı — takvim akışının ilerlemesi (1 → 4). */
const AdimBasligi: React.FC<{ no: number; metin: string; tamam?: boolean; sag?: React.ReactNode }> = ({ no, metin, tamam, sag }) => {
    const renkler = useRenkler();
    return (
        <View className="flex-row items-center mb-3">
            <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: tamam ? renkler.birincil : `${renkler.birincil}20` }}
            >
                {tamam ? (
                    <FontAwesome5 name="check" size={10} color={renkler.birincilMetin} />
                ) : (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: renkler.birincil }}>{no}</Text>
                )}
            </View>
            {/* Başlık rolü ve etiket YALNIZ metinde: satırı `accessible` yapmak sağdaki
                "Yenile" düğmesini tek düğüme düzleştirir, TalkBack odaklanamazdı. */}
            <Text
                className="flex-1 text-sm font-bold"
                style={{ color: renkler.metin }}
                accessibilityRole="header"
                accessibilityLabel={`Adım ${no}: ${metin}${tamam ? ', tamam' : ''}`}
            >
                {metin}
            </Text>
            {sag}
        </View>
    );
};

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');


// ─── SayisalSecici ────────────────────────────────────────────────────────────

// SayisalSecici artik ../components/common/SayisalSecici icinde (paylasilan).

// ─── VakitSatiri (kompakt satır) ──────────────────────────────────────────────

const BASLANGIC_TIPLERI: { tip: BaslangicTipi; etiket: string; aciklama: string }[] = [
    { tip: 'vakit_oncesi',  etiket: 'Çıkmadan Önce', aciklama: 'Vakit bitmeden X dk önce' },
    { tip: 'vakit_girisi',  etiket: 'Vakitte',        aciklama: 'Tam vakit girince başlar' },
    { tip: 'vakit_sonrasi', etiket: 'Vakitten Sonra', aciklama: 'Vakit girdikten X dk sonra' },
];

function vakitOzetMetni(ayar: VakitTakvimAyari): string {
    if (!ayar.aktif) return 'Kapalı — eklenmeyecek';
    const baslangic =
        ayar.baslangicTipi === 'vakit_girisi' ? 'Vakitte başlar'
        : ayar.baslangicTipi === 'vakit_oncesi' ? `Çıkmadan ${ayar.dakika} dk önce`
        : `Vakitten ${ayar.dakika} dk sonra`;
    return `${baslangic} · ${ayar.sureDakika} dk`;
}

interface VakitSatiriProps {
    gorununumAdi: string;
    ayar: VakitTakvimAyari;
    onAc: () => void;
    onToggle: (v: boolean) => void;
    sonMu: boolean;
}

const VakitSatiri: React.FC<VakitSatiriProps> = ({ gorununumAdi, ayar, onAc, onToggle, sonMu }) => {
    const renkler = useRenkler();

    return (
        <TouchableOpacity
            className="flex-row items-center py-3"
            style={!sonMu ? { borderBottomWidth: 1, borderBottomColor: renkler.sinir } : undefined}
            onPress={onAc}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`${gorununumAdi} vakti: ${vakitOzetMetni(ayar)}. Ayarlamak için dokunun`}
        >
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: ayar.aktif ? `${renkler.birincil}15` : renkler.arkaplan }}
            >
                <FontAwesome5
                    name={ayar.aktif ? 'check' : 'minus'}
                    size={13}
                    color={ayar.aktif ? renkler.birincil : renkler.metinIkincil}
                />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                    {gorununumAdi} Vakti
                </Text>
                <Text
                    className="text-xs mt-0.5"
                    style={{ color: ayar.aktif ? renkler.birincil : renkler.metinIkincil }}
                    numberOfLines={1}
                >
                    {vakitOzetMetni(ayar)}
                </Text>
            </View>
            <FontAwesome5
                name="sliders-h"
                size={13}
                color={renkler.metinIkincil}
                style={{ marginRight: 12, opacity: 0.55 }}
            />
            <Anahtar
                value={ayar.aktif}
                onValueChange={onToggle}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={ayar.aktif ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel={`${gorununumAdi} vaktini takvime ekleyin`}
            />
        </TouchableOpacity>
    );
};

// ─── Önizleme ─────────────────────────────────────────────────────────────────

interface OnizlemeSatiriProps {
    vakitAdi: TakvimVakitAdi;
    gorununumAdi: string;
    ayar: VakitTakvimAyari;
    bugunVakitler: Record<TakvimVakitAdi, Date> | null;
    bugunCikisVakitleri: Record<TakvimVakitAdi, Date> | null;
}


function tarihSaatFormatla(tarih: Date): string {
    const gun = tarih.getDate().toString().padStart(2, '0');
    const ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    return `${gun}.${ay}  ${saatFormatla(tarih)}`;
}

const OnizlemeSatiri: React.FC<OnizlemeSatiriProps> = ({
    vakitAdi, gorununumAdi, ayar, bugunVakitler, bugunCikisVakitleri,
}) => {
    const renkler = useRenkler();

    if (!bugunVakitler || !bugunCikisVakitleri) return null;

    const girisSaati = bugunVakitler[vakitAdi];
    const cikisSaati = bugunCikisVakitleri[vakitAdi];

    let startDate: Date;
    const ms = (ayar.dakika || 0) * 60 * 1000;
    switch (ayar.baslangicTipi) {
        case 'vakit_girisi':  startDate = new Date(girisSaati); break;
        case 'vakit_sonrasi': startDate = new Date(girisSaati.getTime() + ms); break;
        case 'vakit_oncesi':  startDate = new Date(cikisSaati.getTime() - ms); break;
    }
    const endDate = new Date(startDate.getTime() + ayar.sureDakika * 60 * 1000);

    const baslangicAciklamasi = (() => {
        switch (ayar.baslangicTipi) {
            case 'vakit_girisi':  return 'Vakit girince';
            case 'vakit_sonrasi': return `Vakitten ${ayar.dakika || 0} dk sonra`;
            case 'vakit_oncesi':  return `Vakit çıkmadan ${ayar.dakika || 0} dk önce`;
        }
    })();

    return (
        <View
            className="flex-row items-start py-3 px-3 rounded-xl mb-2"
            style={{ backgroundColor: `${renkler.birincil}10` }}
        >
            <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: `${renkler.birincil}20` }}
            >
                <FontAwesome5 name="calendar-check" size={14} color={renkler.birincil} />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-semibold mb-1" style={{ color: renkler.metin }}>
                    {gorununumAdi} Namazı
                </Text>
                <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                    {saatFormatla(startDate)} – {saatFormatla(endDate)}{'  '}({ayar.sureDakika} dk)
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {baslangicAciklamasi}
                </Text>
            </View>
        </View>
    );
};

// ─── VakitEditorModali (bottom-sheet) ─────────────────────────────────────────

interface VakitEditorModaliProps {
    gorunur: boolean;
    onKapat: () => void;
    vakitAdi: TakvimVakitAdi | null;
    ayar: VakitTakvimAyari | null;
    onChange: (yeni: Partial<VakitTakvimAyari>) => void;
    bugunVakitler: Record<TakvimVakitAdi, Date> | null;
    bugunCikisVakitleri: Record<TakvimVakitAdi, Date> | null;
}

const VakitEditorModali: React.FC<VakitEditorModaliProps> = ({
    gorunur, onKapat, vakitAdi, ayar, onChange, bugunVakitler, bugunCikisVakitleri,
}) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onKapat);

    // Kapanış slide-out'u sırasında içerik kaybolmasın diye son geçerli değeri tut
    const snapRef = useRef<{ vakitAdi: TakvimVakitAdi; ayar: VakitTakvimAyari } | null>(null);
    if (vakitAdi && ayar) snapRef.current = { vakitAdi, ayar };
    const snap = snapRef.current;

    const aktifVakit = vakitAdi ?? snap?.vakitAdi ?? null;
    const aktifAyar = ayar ?? snap?.ayar ?? null;
    const gorununumAdi = aktifVakit ? VAKIT_GORUNTU_ADLARI[aktifVakit] : '';

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={onKapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingBottom: 32,
                    }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                    </View>

                    {aktifVakit && aktifAyar && (
                        <View className="px-5 pt-2">
                            {/* Başlık + aktiflik */}
                            <View className="flex-row items-center mb-4">
                                <View
                                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                    style={{ backgroundColor: `${renkler.birincil}15` }}
                                >
                                    <FontAwesome5 name="clock" size={18} color={renkler.birincil} solid />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                        {gorununumAdi} Namazı
                                    </Text>
                                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {aktifAyar.aktif ? 'Bu vakit takvime eklenecek' : 'Bu vakit şu an kapalı'}
                                    </Text>
                                </View>
                                <Anahtar
                                    value={aktifAyar.aktif}
                                    onValueChange={v => onChange({ aktif: v })}
                                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                    thumbColor={aktifAyar.aktif ? renkler.birincil : '#f4f3f4'}
                                />
                            </View>

                            {aktifAyar.aktif ? (
                                <View className="gap-4">
                                    {/* Başlangıç tipi */}
                                    <View>
                                        <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: renkler.metinIkincil }}>
                                            ETKİNLİK NE ZAMAN BAŞLASIN
                                        </Text>
                                        <View className="flex-row gap-2">
                                            {BASLANGIC_TIPLERI.map(({ tip, etiket, aciklama }) => {
                                                const secili = aktifAyar.baslangicTipi === tip;
                                                return (
                                                    <TouchableOpacity
                                                        key={tip}
                                                        onPress={() => onChange({ baslangicTipi: tip })}
                                                        className="flex-1 py-3 px-1 rounded-2xl items-center"
                                                        style={{
                                                            backgroundColor: secili ? renkler.birincil : `${renkler.birincil}10`,
                                                            borderWidth: 1,
                                                            borderColor: secili ? renkler.birincil : renkler.sinir,
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text
                                                            className="text-xs font-bold text-center"
                                                            style={{ color: secili ? '#FFF' : renkler.metin }}
                                                            numberOfLines={2}
                                                        >
                                                            {etiket}
                                                        </Text>
                                                        <Text
                                                            className="text-[10px] text-center mt-1 leading-3"
                                                            style={{ color: secili ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                                                            numberOfLines={2}
                                                        >
                                                            {aciklama}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Dakika (offset) */}
                                    {aktifAyar.baslangicTipi !== 'vakit_girisi' && (
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-sm" style={{ color: renkler.metin }}>
                                                {aktifAyar.baslangicTipi === 'vakit_oncesi' ? 'Kaç dk önce' : 'Kaç dk sonra'}
                                            </Text>
                                            <SayisalSecici
                                                deger={aktifAyar.dakika}
                                                min={1}
                                                max={60}
                                                adim={5}
                                                birim="dk"
                                                onChange={v => onChange({ dakika: v })}
                                                renk={renkler.birincil}
                                            />
                                        </View>
                                    )}

                                    {/* Süre */}
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-sm" style={{ color: renkler.metin }}>
                                            Etkinlik süresi
                                        </Text>
                                        <SayisalSecici
                                            deger={aktifAyar.sureDakika}
                                            min={5}
                                            max={120}
                                            adim={5}
                                            birim="dk"
                                            onChange={v => onChange({ sureDakika: v })}
                                            renk={renkler.birincil}
                                        />
                                    </View>

                                    {/* Bugün için mini önizleme */}
                                    {bugunVakitler && bugunCikisVakitleri && (
                                        <View>
                                            <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: renkler.metinIkincil }}>
                                                BUGÜN İÇİN ÖNİZLEME
                                            </Text>
                                            <OnizlemeSatiri
                                                vakitAdi={aktifVakit}
                                                gorununumAdi={gorununumAdi}
                                                ayar={aktifAyar}
                                                bugunVakitler={bugunVakitler}
                                                bugunCikisVakitleri={bugunCikisVakitleri}
                                            />
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View className="items-center py-8">
                                    <FontAwesome5 name="bell-slash" size={28} color={renkler.metinIkincil} />
                                    <Text className="text-sm text-center mt-3 leading-5" style={{ color: renkler.metinIkincil }}>
                                        Bu vakit için etkinlik oluşturulmayacak.{'\n'}Ayarlamak için yukarıdan açın.
                                    </Text>
                                </View>
                            )}

                            {/* Tamam */}
                            <TouchableOpacity
                                className="items-center justify-center p-4 rounded-2xl mt-5"
                                style={{ backgroundColor: renkler.birincil }}
                                onPress={onKapat}
                                activeOpacity={0.85}
                            >
                                <Text className="text-base font-semibold" style={{ color: renkler.birincilMetin }}>
                                    Tamam
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

interface Bildirim {
    mesaj: string;
    tip: 'basari' | 'hata' | 'bilgi';
}

export const TakvimAyarlariSayfasi: React.FC<any> = () => {
    return (
        <VurguSaglayici>
            <TakvimAyarlariIcerik />
        </VurguSaglayici>
    );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir.
 */
const TakvimAyarlariIcerik: React.FC = () => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();

    const { ayarlar, olayOlusturuluyor } = useAppSelector(state => state.takvim);
    const koordinatlar = useAppSelector(state => state.konum.koordinatlar);

    const [cihazTakvimleri, setCihazTakvimleri] = useState<Array<{ id: string; title: string; color: string }>>([]);
    const [takvimYukleniyor, setTakvimYukleniyor] = useState(false);
    const [temizleModaliGorunur, setTemizleModaliGorunur] = useState(false);
    const [ozelGunAktif, setOzelGunAktif] = useState(false);
    const [aktifVakitEditor, setAktifVakitEditor] = useState<TakvimVakitAdi | null>(null);
    const [olusturmaSonucu, setOlusturmaSonucu] = useState<{ sayi: number } | null>(null);
    const [bildirim, setBildirim] = useState<Bildirim | null>(null);
    const bildirimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [rizaAcik, setRizaAcik] = useState(false);
    const izin = useIzinAkisi({ oku: takvimIzniOku, iste: takvimIzniIste });
    // Son başarılı aktarımın ayar özeti (cihaza özgü; yedeklenmez). null = hiç aktarılmadı.
    const [sonAktarim, setSonAktarim] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    const bildirimGoster = useCallback((mesaj: string, tip: Bildirim['tip']) => {
        if (bildirimTimerRef.current) clearTimeout(bildirimTimerRef.current);
        setBildirim({ mesaj, tip });
        bildirimTimerRef.current = setTimeout(() => setBildirim(null), 5000);
    }, []);

    useEffect(() => {
        dispatch(takvimAyarlariniYukle());
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
        return () => { if (bildirimTimerRef.current) clearTimeout(bildirimTimerRef.current); };
    }, []);

    useEffect(() => {
        let iptal = false;
        Depolama.ham(DEPOLAMA_ANAHTARLARI.TAKVIM_SON_AKTARIM)
            .then((d) => { if (!iptal) setSonAktarim(d); })
            .catch(() => undefined);
        return () => { iptal = true; };
    }, []);

    // Takvim listesi YALNIZ izin verilmişken okunur: okuma yolu (`cihazTakvimleriniGetir`)
    // izin yoksa sistem diyaloğunu açıklamasız açardı.
    useEffect(() => {
        if (ayarlar.aktif && izin.durum === 'verildi') takvimleriniYenile();
    }, [ayarlar.aktif, izin.durum]);

    /** Ana anahtar: açarken izin yoksa önce açıklama (rıza) modalı. */
    const anaAnahtariDegistir = (acik: boolean) => {
        if (acik && izin.durum !== 'verildi') {
            setRizaAcik(true);
            return;
        }
        dispatch(takvimAyarlariniGuncelle({ aktif: acik }));
    };

    const rizaOnayla = () => {
        setRizaAcik(false);
        dispatch(takvimAyarlariniGuncelle({ aktif: true }));
        // Sistem diyaloğu modal TAMAMEN kapandıktan sonra açılır (şablon bekler).
        void izin.istekBaslat();
    };

    const takvimleriniYenile = async () => {
        setTakvimYukleniyor(true);
        const takvimler = await TakvimServisi.getInstance().cihazTakvimleriniGetir();
        setCihazTakvimleri(takvimler);
        setTakvimYukleniyor(false);
    };

    const handleVakitAyarDegistir = (vakit: TakvimVakitAdi, yeni: Partial<VakitTakvimAyari>) => {
        dispatch(takvimAyarlariniGuncelle({
            vakitAyarlari: {
                ...ayarlar.vakitAyarlari,
                [vakit]: { ...ayarlar.vakitAyarlari[vakit], ...yeni },
            },
        }));
    };

    const handleOlaylariOlustur = async () => {
        await butonTiklandiFeedback();

        if (!ayarlar.takvimId) {
            bildirimGoster('Önce bir takvim seçin.', 'bilgi');
            return;
        }
        if (!koordinatlar) {
            bildirimGoster('Konum bulunamadı. Lütfen konum ayarlarını kontrol edin.', 'hata');
            return;
        }

        const aktarilan = aktarimOzeti(ayarlar);
        const result = await dispatch(takvimOlaylariniOlustur({ ayarlar, koordinatlar }));
        if (takvimOlaylariniOlustur.fulfilled.match(result)) {
            setOlusturmaSonucu({ sayi: result.payload.olusturulanSayi });
            setSonAktarim(aktarilan);
            Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.TAKVIM_SON_AKTARIM, aktarilan).catch(() => undefined);
        } else {
            bildirimGoster(String(result.payload) || 'Etkinlikler oluşturulurken hata oluştu.', 'hata');
        }
    };

    const bugunVakitler = useMemo(() => {
        const sonuclar = NamazVaktiHesaplayiciServisi.getInstance().getGunlukVakitler(new Date());
        if (!sonuclar) return null;
        return { imsak: sonuclar.imsak, ogle: sonuclar.ogle, ikindi: sonuclar.ikindi, aksam: sonuclar.aksam, yatsi: sonuclar.yatsi } as Record<TakvimVakitAdi, Date>;
    }, []);

    const bugunCikisVakitleri = useMemo(() => {
        if (!bugunVakitler) return null;
        const hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        const bugunTum = hesaplayici.getGunlukVakitler(new Date());
        if (!bugunTum) return null;
        const yarinTarih = new Date();
        yarinTarih.setDate(yarinTarih.getDate() + 1);
        const yarinTum = hesaplayici.getGunlukVakitler(yarinTarih);
        return {
            imsak:  bugunTum.gunes,
            ogle:   bugunTum.ikindi,
            ikindi: bugunTum.aksam,
            aksam:  bugunTum.yatsi,
            yatsi:  yarinTum ? yarinTum.imsak : bugunTum.yatsi,
        } as Record<TakvimVakitAdi, Date>;
    }, [bugunVakitler]);

    const aktifVakitler = useMemo(
        () => VAKIT_SIRASI.filter(v => ayarlar.vakitAyarlari[v].aktif),
        [ayarlar.vakitAyarlari]
    );

    // Oluşturma başarı modalında donanım geri tuşu modalı kapatsın (ekrandan çıkmasın)
    const sonucModaliniKapat = useCallback(() => setOlusturmaSonucu(null), []);
    useDonanimGeriTusu(olusturmaSonucu !== null, sonucModaliniKapat);

    const bekleyenDegisiklik = bekleyenDegisiklikVarMi(sonAktarim, ayarlar);
    const izinNotu =
        izin.durum === 'sorulabilir' || izin.durum === 'reddedildi'
            ? durumNotu('takvimIzni', { ...BOS_CIHAZ_DURUMU, takvimIzni: izin.durum })
            : null;

    const olusturButonuMesaji = !ayarlar.takvimId
        ? 'Takvim seçilmedi'
        : !koordinatlar
            ? 'Konum bulunamadı'
            : null;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
            <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Master Toggle */}
                    <AyarCapasi id="takvimSenkron">
                    <TouchableOpacity
                        className="flex-row items-center p-4 rounded-2xl mb-4"
                        style={{ backgroundColor: ayarlar.aktif ? renkler.birincil : renkler.kartArkaplan }}
                        onPress={() => anaAnahtariDegistir(!ayarlar.aktif)}
                        activeOpacity={0.8}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: ayarlar.aktif }}
                        accessibilityLabel="Takvime ekleme"
                    >
                        <View
                            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: ayarlar.aktif ? `${renkler.birincilMetin}33` : `${renkler.birincil}15` }}
                        >
                            <FontAwesome5
                                name="calendar-alt"
                                size={20}
                                color={ayarlar.aktif ? renkler.birincilMetin : renkler.birincil}
                                solid
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold" style={{ color: ayarlar.aktif ? renkler.birincilMetin : renkler.metin }}>
                                Takvime ekleme
                            </Text>
                            <Text className="text-sm mt-0.5" style={{ color: ayarlar.aktif ? `${renkler.birincilMetin}C0` : renkler.metinIkincil }}>
                                {ayarlar.aktif ? 'Açık' : 'Kapalı'}
                            </Text>
                        </View>
                        <Anahtar
                            value={ayarlar.aktif}
                            onValueChange={anaAnahtariDegistir}
                            trackColor={{ false: renkler.sinir, true: `${renkler.birincilMetin}66` }}
                            thumbColor={renkler.birincilMetin}
                            accessibilityLabel="Takvime ekleme"
                        />
                    </TouchableOpacity>
                    </AyarCapasi>

                    {/* ── Pasif ── */}
                    {!ayarlar.aktif && <OzellikBilgi />}

                    {/* ── Aktif ── */}
                    {ayarlar.aktif && (
                        <>
                            {/* BEKLEYEN DEĞİŞİKLİK — ayar takvime kendiliğinden yazılmaz; ölü uç bırakma */}
                            {bekleyenDegisiklik && (
                                <View
                                    testID="takvim-bekleyen-degisiklik"
                                    className="flex-row items-center p-3 mb-4"
                                    style={{ borderRadius: 16, borderLeftWidth: 3, borderLeftColor: renkler.dikkat, backgroundColor: renkler.kartArkaplan }}
                                >
                                    <FontAwesome5 name="sync-alt" size={14} color={renkler.dikkat} style={{ marginRight: 10 }} />
                                    <Text className="flex-1 text-sm" style={{ color: renkler.metin }}>
                                        Takvime aktarılmayı bekleyen değişiklik var
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleOlaylariOlustur}
                                        disabled={olayOlusturuluyor}
                                        accessibilityRole="button"
                                        accessibilityLabel="Şimdi aktarın"
                                        className="px-3 rounded-2xl items-center justify-center"
                                        style={{ minHeight: 44, backgroundColor: renkler.birincil, opacity: olayOlusturuluyor ? 0.6 : 1 }}
                                    >
                                        <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>Şimdi aktarın</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Takvim Seçici */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <AdimBasligi
                                    no={1}
                                    metin="Hangi takvime?"
                                    tamam={!!ayarlar.takvimId}
                                    sag={izin.durum === 'verildi' ? (
                                    <TouchableOpacity
                                        onPress={takvimleriniYenile}
                                        className="flex-row items-center gap-1 px-3 rounded-lg"
                                        style={{ backgroundColor: `${renkler.birincil}15`, minHeight: 44 }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Takvim listesini yenileyin"
                                    >
                                        {takvimYukleniyor
                                            ? <ActivityIndicator size="small" color={renkler.birincil} />
                                            : <FontAwesome5 name="sync-alt" size={12} color={renkler.birincil} />
                                        }
                                        <Text className="text-sm" style={{ color: renkler.birincil }}>Yenile</Text>
                                    </TouchableOpacity>
                                    ) : null}
                                />

                                {izinNotu ? (
                                    // İzin yoksa "takvim bulunamadı" DENMEZ (yanlış teşhis); sebep + tek düğme.
                                    <DurumSatiri
                                        testID="takvim-izin-satiri"
                                        durum={izinNotu}
                                        onEylem={(e) => (e === 'takvimIzni' ? setRizaAcik(true) : izin.ayarlariAc())}
                                    />
                                ) : izin.durum !== 'verildi' ? null : cihazTakvimleri.length === 0 ? (
                                    <View className="items-center py-5">
                                        <FontAwesome5 name="calendar-times" size={28} color={renkler.metinIkincil} />
                                        <Text className="text-sm text-center mt-2" style={{ color: renkler.metinIkincil }}>
                                            Cihazınızda düzenlenebilir takvim bulunamadı.
                                        </Text>
                                        <Text className="text-xs text-center mt-1" style={{ color: renkler.metinIkincil }}>
                                            {Platform.OS === 'ios'
                                                ? "Ayarlar'dan iCloud'a giriş yapıp takvimi açın."
                                                : 'Telefonunuza bir Google hesabı ekleyin.'}
                                        </Text>
                                    </View>
                                ) : (
                                    cihazTakvimleri.map(takvim => {
                                        const secili = ayarlar.takvimId === takvim.id;
                                        return (
                                            <TouchableOpacity
                                                key={takvim.id}
                                                className="flex-row items-center py-2.5 px-3 rounded-xl mb-1"
                                                style={{
                                                    backgroundColor: secili ? `${renkler.birincil}15` : 'transparent',
                                                    borderWidth: 1,
                                                    borderColor: secili ? renkler.birincil : renkler.sinir,
                                                }}
                                                onPress={() => dispatch(takvimAyarlariniGuncelle({ takvimId: takvim.id, takvimAdi: takvim.title }))}
                                                activeOpacity={0.7}
                                                accessibilityRole="radio"
                                                accessibilityState={{ selected: secili, checked: secili }}
                                                accessibilityLabel={takvim.title}
                                            >
                                                <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: takvim.color }} />
                                                <Text
                                                    className="flex-1 text-sm"
                                                    style={{ color: secili ? renkler.birincil : renkler.metin, fontWeight: secili ? '600' : '400' }}
                                                >
                                                    {takvim.title}
                                                </Text>
                                                {secili && <FontAwesome5 name="check" size={12} color={renkler.birincil} />}
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>

                            {/* Vakit Ayarları */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <AdimBasligi no={2} metin="Hangi vakitler?" tamam={aktifVakitler.length > 0} />
                                {VAKIT_SIRASI.map((vakit, idx) => (
                                    <VakitSatiri
                                        key={vakit}
                                        gorununumAdi={VAKIT_GORUNTU_ADLARI[vakit]}
                                        ayar={ayarlar.vakitAyarlari[vakit]}
                                        onAc={() => setAktifVakitEditor(vakit)}
                                        onToggle={v => handleVakitAyarDegistir(vakit, { aktif: v })}
                                        sonMu={idx === VAKIT_SIRASI.length - 1}
                                    />
                                ))}
                            </View>

                            {/* Kaç Gün İlerisi */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <AdimBasligi no={3} metin="Kaç gün ileriye?" tamam />
                                <View className="flex-row gap-2 mb-2">
                                    {([7, 14, 30] as const).map(gun => {
                                        const secili = !ozelGunAktif && ayarlar.kaciGunIlerisi === gun;
                                        return (
                                            <TouchableOpacity
                                                key={gun}
                                                className="flex-1 py-2.5 rounded-xl items-center"
                                                style={{
                                                    backgroundColor: secili ? renkler.birincil : `${renkler.birincil}10`,
                                                    borderWidth: 1,
                                                    borderColor: secili ? renkler.birincil : renkler.sinir,
                                                }}
                                                onPress={() => { dispatch(takvimAyarlariniGuncelle({ kaciGunIlerisi: gun })); setOzelGunAktif(false); }}
                                                activeOpacity={0.7}
                                            >
                                                <Text className="text-sm font-semibold" style={{ color: secili ? renkler.birincilMetin : renkler.metinIkincil }}>
                                                    {gun} gün
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                    <TouchableOpacity
                                        className="flex-1 py-2.5 rounded-xl items-center"
                                        style={{
                                            backgroundColor: ozelGunAktif ? renkler.birincil : `${renkler.birincil}10`,
                                            borderWidth: 1,
                                            borderColor: ozelGunAktif ? renkler.birincil : renkler.sinir,
                                        }}
                                        onPress={() => {
                                            if (!ozelGunAktif) {
                                                if ([7, 14, 30].includes(ayarlar.kaciGunIlerisi)) {
                                                    dispatch(takvimAyarlariniGuncelle({ kaciGunIlerisi: 60 }));
                                                }
                                            }
                                            setOzelGunAktif(true);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-sm font-semibold" style={{ color: ozelGunAktif ? renkler.birincilMetin : renkler.metinIkincil }}>
                                            Özel
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {ozelGunAktif && (
                                    <View className="flex-row items-center justify-between mt-1">
                                        <Text className="text-sm" style={{ color: renkler.metin }}>Gün sayısı</Text>
                                        <SayisalSecici
                                            deger={ayarlar.kaciGunIlerisi}
                                            min={1}
                                            max={90}
                                            adim={1}
                                            birim="gün"
                                            onChange={v => dispatch(takvimAyarlariniGuncelle({ kaciGunIlerisi: v }))}
                                            renk={renkler.birincil}
                                            aciklama="Kaç gün ileri"
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Önizleme */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <AdimBasligi no={4} metin="Bugün böyle görünecek" tamam={aktifVakitler.length > 0} />
                                {aktifVakitler.length === 0 ? (
                                    <View className="items-center py-6">
                                        <FontAwesome5 name="calendar-minus" size={28} color={renkler.metinIkincil} />
                                        <Text className="text-sm text-center mt-3 leading-5" style={{ color: renkler.metinIkincil }}>
                                            Henüz vakit seçmediniz. Yukarıdan bir vakit açın.
                                        </Text>
                                    </View>
                                ) : (
                                    aktifVakitler.map(vakit => (
                                        <OnizlemeSatiri
                                            key={vakit}
                                            vakitAdi={vakit}
                                            gorununumAdi={VAKIT_GORUNTU_ADLARI[vakit]}
                                            ayar={ayarlar.vakitAyarlari[vakit]}
                                            bugunVakitler={bugunVakitler}
                                            bugunCikisVakitleri={bugunCikisVakitleri}
                                        />
                                    ))
                                )}
                            </View>

                            {/* Sonuç/hata bandı eylemin YANINDA (üstte kalsaydı en alttaki düğmeye basan görmezdi) */}
                            {bildirim && (
                                <BildirimBanneri
                                    mesaj={bildirim.mesaj}
                                    tip={bildirim.tip}
                                    onKapat={() => setBildirim(null)}
                                />
                            )}

                            {/* Takvime ekle düğmesi */}
                            <TouchableOpacity
                                testID="takvime-ekle-dugmesi"
                                accessibilityRole="button"
                                accessibilityLabel={`Takvime ekleyin, ${ayarlar.kaciGunIlerisi} gün`}
                                accessibilityState={{ disabled: olayOlusturuluyor, busy: olayOlusturuluyor }}
                                className="flex-row items-center justify-center p-4 rounded-2xl mb-2"
                                style={{ backgroundColor: olayOlusturuluyor ? `${renkler.birincil}80` : renkler.birincil }}
                                onPress={handleOlaylariOlustur}
                                disabled={olayOlusturuluyor}
                                activeOpacity={0.8}
                            >
                                {olayOlusturuluyor ? (
                                    <ActivityIndicator color={renkler.birincilMetin} />
                                ) : (
                                    <>
                                        <FontAwesome5 name="calendar-plus" size={16} color={renkler.birincilMetin} solid style={{ marginRight: 8 }} />
                                        <Text className="text-base font-semibold" style={{ color: renkler.birincilMetin }}>
                                            Takvime ekleyin ({ayarlar.kaciGunIlerisi} gün)
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {olusturButonuMesaji && (
                                <View className="flex-row items-center justify-center mb-2 gap-1.5">
                                    <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} />
                                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                                        {olusturButonuMesaji}
                                    </Text>
                                </View>
                            )}

                            {/* Temizle Butonu */}
                            <TouchableOpacity
                                className="flex-row items-center justify-center p-3.5 rounded-2xl mb-3"
                                style={{ borderWidth: 1, borderColor: renkler.hata, backgroundColor: `${renkler.hata}15` }}
                                onPress={async () => { await butonTiklandiFeedback(); setTemizleModaliGorunur(true); }}
                                disabled={olayOlusturuluyor}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityLabel="Etkinlikleri silin"
                            >
                                <FontAwesome5 name="broom" size={14} color={renkler.hata} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-semibold" style={{ color: renkler.hata }}>
                                    Etkinlikleri silin
                                </Text>
                            </TouchableOpacity>

                            {/* Bilgi Notu */}
                            <View
                                className="flex-row items-start p-4 rounded-xl"
                                style={{ backgroundColor: `${renkler.birincil}10` }}
                            >
                                <FontAwesome5 name="info-circle" size={14} color={renkler.birincil} style={{ marginTop: 1, marginRight: 8 }} />
                                <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                                    Her eklemede bu uygulamanın eski etkinlikleri silinip yeniden yazılır.
                                </Text>
                            </View>
                        </>
                    )}

                    <View className="h-10" />
                </Animated.View>
            </ScrollView>

            {/* Vakit Editör Modalı */}
            <VakitEditorModali
                gorunur={aktifVakitEditor !== null}
                onKapat={() => setAktifVakitEditor(null)}
                vakitAdi={aktifVakitEditor}
                ayar={aktifVakitEditor ? ayarlar.vakitAyarlari[aktifVakitEditor] : null}
                onChange={yeni => { if (aktifVakitEditor) handleVakitAyarDegistir(aktifVakitEditor, yeni); }}
                bugunVakitler={bugunVakitler}
                bugunCikisVakitleri={bugunCikisVakitleri}
            />

            {/* Temizle Modalı */}
            <TemizleModali
                gorunur={temizleModaliGorunur}
                onKapat={() => setTemizleModaliGorunur(false)}
                secilenTakvimId={ayarlar.takvimId}
                secilenTakvimAdi={ayarlar.takvimAdi}
                cihazTakvimleri={cihazTakvimleri}
            />

            {/* İzin açıklaması (rıza) — kabulde sistem diyaloğu modal kapandıktan SONRA açılır */}
            <RizaModali
                gorunur={rizaAcik}
                ikon="calendar-alt"
                baslik="Takviminize erişim"
                maddeler={[
                    { ikon: 'calendar-plus', metin: 'Seçtiğiniz takvime namaz vakitlerini ekler.' },
                    { ikon: 'shield-alt', metin: 'Yalnız kendi eklediği etkinlikleri siler.' },
                    { ikon: 'mobile-alt', metin: 'Her şey cihazınızda kalır.' },
                ]}
                onaylaEtiketi="Devam edin"
                vazgecEtiketi="Şimdi değil"
                onOnayla={rizaOnayla}
                onVazgec={() => setRizaAcik(false)}
                onKapandi={izin.modalKapandi}
                testID="takvim-riza-modali"
            />

            {/* Oluşturma Başarı Modalı */}
            <Modal
                visible={olusturmaSonucu !== null}
                animationType="slide"
                transparent
                statusBarTranslucent
                onRequestClose={() => setOlusturmaSonucu(null)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableWithoutFeedback onPress={() => setOlusturmaSonucu(null)}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                    </TouchableWithoutFeedback>
                    <View
                        style={{
                            backgroundColor: renkler.kartArkaplan,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingBottom: 32,
                        }}
                    >
                        <View className="items-center pt-3 pb-1">
                            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                        </View>
                        {olusturmaSonucu && (
                            <BasariIcerigi
                                tip="olusturma"
                                baslik="Takviminize eklendi"
                                altBaslik={olusturmaSonucu.sayi > 0
                                    ? 'Namaz vakitleriniz takviminizde.'
                                    : 'Eklenecek vakit yok; yukarıdan bir vakit açın.'}
                                sayi={olusturmaSonucu.sayi}
                                satirlar={[
                                    { ikon: 'calendar-check', etiket: 'Oluşturulan', deger: `${olusturmaSonucu.sayi} etkinlik` },
                                    { ikon: 'bookmark', etiket: 'Takvim', deger: ayarlar.takvimAdi ?? '—' },
                                    { ikon: 'clock', etiket: 'Süre', deger: `${ayarlar.kaciGunIlerisi} gün` },
                                    {
                                        ikon: 'list-ul',
                                        etiket: 'Vakitler',
                                        deger: aktifVakitler.length === VAKIT_SIRASI.length
                                            ? 'Tüm vakitler'
                                            : aktifVakitler.map(v => VAKIT_GORUNTU_ADLARI[v]).join(', ') || '—',
                                    },
                                ]}
                                onTakvimiAc={() => { takvimUygulamasiniAc(); }}
                                onKapat={() => setOlusturmaSonucu(null)}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
