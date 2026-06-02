/**
 * Takvim Entegrasyonu Ayarlari Sayfasi
 * Namaz vakitleri icin cihaz takvimi etkinlikleri yapilandirmasi
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
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

const THROTTLE_SURESI = 100;

const VAKIT_GORUNTU_ADLARI: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah',
    ogle:   'Öğle',
    ikindi: 'İkindi',
    aksam:  'Akşam',
    yatsi:  'Yatsı',
};

const VAKIT_SIRASI: TakvimVakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

// ─── SayisalSecici ────────────────────────────────────────────────────────────

interface SayisalSeciciProps {
    deger: number;
    min: number;
    max: number;
    adim?: number;
    birim?: string;
    onChange: (yeniDeger: number) => void;
    renk: string;
}

const SayisalSecici: React.FC<SayisalSeciciProps> = ({
    deger, min, max, adim = 1, birim = 'dk', onChange, renk,
}) => {
    const renkler = useRenkler();
    const sonTiklamaRef = useRef<number>(0);

    const throttleKontrol = useCallback((): boolean => {
        const simdi = Date.now();
        if (simdi - sonTiklamaRef.current < THROTTLE_SURESI) return false;
        sonTiklamaRef.current = simdi;
        return true;
    }, []);

    const azalt = useCallback(() => {
        if (!throttleKontrol()) return;
        onChange(Math.max(min, deger - adim));
    }, [deger, min, adim, onChange, throttleKontrol]);

    const artir = useCallback(() => {
        if (!throttleKontrol()) return;
        onChange(Math.min(max, deger + adim));
    }, [deger, max, adim, onChange, throttleKontrol]);

    return (
        <View className="flex-row items-center rounded-lg overflow-hidden border" style={{ borderColor: renkler.sinir }}>
            <TouchableOpacity
                className="w-9 h-9 items-center justify-center"
                style={{ backgroundColor: deger <= min ? renkler.sinir : renk }}
                onPress={azalt}
                disabled={deger <= min}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="minus" size={12} color="#FFF" />
            </TouchableOpacity>
            <View
                className="px-3 h-9 items-center justify-center flex-row min-w-[80px]"
                style={{ backgroundColor: renkler.kartArkaplan }}
            >
                <Text className="text-base font-bold mr-1" style={{ color: renkler.metin }}>{deger}</Text>
                <Text className="text-xs" style={{ color: renkler.metinIkincil }}>{birim}</Text>
            </View>
            <TouchableOpacity
                className="w-9 h-9 items-center justify-center"
                style={{ backgroundColor: deger >= max ? renkler.sinir : renk }}
                onPress={artir}
                disabled={deger >= max}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="plus" size={12} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

// ─── VakitAyarSatiri ──────────────────────────────────────────────────────────

interface VakitAyarSatiriProps {
    vakitAdi: TakvimVakitAdi;
    gorununumAdi: string;
    ayar: VakitTakvimAyari;
    onChange: (yeni: Partial<VakitTakvimAyari>) => void;
    sonMu: boolean;
}

const BASLANGIC_TIPLERI: { tip: BaslangicTipi; etiket: string }[] = [
    { tip: 'vakit_oncesi',  etiket: 'Çıkmadan Önce' },
    { tip: 'vakit_girisi',  etiket: 'Vakitte' },
    { tip: 'vakit_sonrasi', etiket: 'Vakitten Sonra' },
];

const VakitAyarSatiri: React.FC<VakitAyarSatiriProps> = ({
    vakitAdi, gorununumAdi, ayar, onChange, sonMu,
}) => {
    const renkler = useRenkler();

    return (
        <View
            className="py-3"
            style={!sonMu ? { borderBottomWidth: 1, borderBottomColor: renkler.sinir } : undefined}
        >
            {/* Vakit başlığı + toggle */}
            <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                    {gorununumAdi} Vakti
                </Text>
                <Switch
                    value={ayar.aktif}
                    onValueChange={v => onChange({ aktif: v })}
                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                    thumbColor={ayar.aktif ? renkler.birincil : '#f4f3f4'}
                />
            </View>

            {/* Aktifse detay ayarlar */}
            {ayar.aktif && (
                <View className="mt-3 gap-3">
                    {/* Başlangıç tipi seçici */}
                    <View>
                        <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }}>
                            Etkinlik Ne Zaman Başlasın
                        </Text>
                        <View className="flex-row gap-1">
                            {BASLANGIC_TIPLERI.map(({ tip, etiket }) => {
                                const secili = ayar.baslangicTipi === tip;
                                return (
                                    <TouchableOpacity
                                        key={tip}
                                        onPress={() => onChange({ baslangicTipi: tip })}
                                        className="flex-1 py-2 px-1 rounded-lg items-center"
                                        style={{
                                            backgroundColor: secili ? renkler.birincil : `${renkler.birincil}15`,
                                            borderWidth: 1,
                                            borderColor: secili ? renkler.birincil : renkler.sinir,
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className="text-xs font-semibold text-center"
                                            style={{ color: secili ? '#FFF' : renkler.metinIkincil }}
                                            numberOfLines={2}
                                        >
                                            {etiket}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Dakika seçici — sadece önce/sonra durumunda */}
                    {ayar.baslangicTipi !== 'vakit_girisi' && (
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                {ayar.baslangicTipi === 'vakit_oncesi' ? 'Kaç dk önce' : 'Kaç dk sonra'}
                            </Text>
                            <SayisalSecici
                                deger={ayar.dakika}
                                min={1}
                                max={60}
                                adim={5}
                                birim="dk"
                                onChange={v => onChange({ dakika: v })}
                                renk={renkler.birincil}
                            />
                        </View>
                    )}

                    {/* Süre seçici */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                            Etkinlik Süresi
                        </Text>
                        <SayisalSecici
                            deger={ayar.sureDakika}
                            min={5}
                            max={120}
                            adim={5}
                            birim="dk"
                            onChange={v => onChange({ sureDakika: v })}
                            renk={renkler.birincil}
                        />
                    </View>
                </View>
            )}
        </View>
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

function saatFormatla(tarih: Date): string {
    const s = tarih.getHours().toString().padStart(2, '0');
    const d = tarih.getMinutes().toString().padStart(2, '0');
    return `${s}:${d}`;
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
        case 'vakit_girisi':
            startDate = new Date(girisSaati);
            break;
        case 'vakit_sonrasi':
            startDate = new Date(girisSaati.getTime() + ms);
            break;
        case 'vakit_oncesi':
            startDate = new Date(cikisSaati.getTime() - ms);
            break;
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
                    {saatFormatla(startDate)} – {saatFormatla(endDate)}
                    {'  '}({ayar.sureDakika} dk)
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {baslangicAciklamasi}
                </Text>
            </View>
        </View>
    );
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

export const TakvimAyarlariSayfasi: React.FC<any> = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();

    const { ayarlar, olayOlusturuluyor } = useAppSelector(state => state.takvim);
    const koordinatlar = useAppSelector(state => state.konum.koordinatlar);

    const [cihazTakvimleri, setCihazTakvimleri] = useState<Array<{ id: string; title: string; color: string }>>([]);
    const [takvimYukleniyor, setTakvimYukleniyor] = useState(false);
    const [temizleniyor, setTemizleniyor] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        dispatch(takvimAyarlariniYukle());
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, []);

    // Takvim izni sadece entegrasyon aktif olduğunda istenir (App Store/Play politikalari)
    useEffect(() => {
        if (ayarlar.aktif) {
            takvimleriniYenile();
        }
    }, [ayarlar.aktif]);

    const takvimleriniYenile = async () => {
        setTakvimYukleniyor(true);
        const takvimler = await TakvimServisi.getInstance().cihazTakvimleriniGetir();
        setCihazTakvimleri(takvimler);
        setTakvimYukleniyor(false);
    };

    const handleAktifToggle = (val: boolean) => {
        dispatch(takvimAyarlariniGuncelle({ aktif: val }));
    };

    const handleTakvimSec = (id: string, adi: string) => {
        dispatch(takvimAyarlariniGuncelle({ takvimId: id, takvimAdi: adi }));
    };

    const handleVakitAyarDegistir = (vakit: TakvimVakitAdi, yeni: Partial<VakitTakvimAyari>) => {
        dispatch(takvimAyarlariniGuncelle({
            vakitAyarlari: {
                ...ayarlar.vakitAyarlari,
                [vakit]: { ...ayarlar.vakitAyarlari[vakit], ...yeni },
            },
        }));
    };

    const handleEtkinlikleriTemizle = async () => {
        await butonTiklandiFeedback();
        if (!ayarlar.takvimId) {
            Alert.alert('Takvim Seçin', 'Lütfen önce bir takvim seçin.');
            return;
        }
        Alert.alert(
            'Etkinlikleri Temizle',
            'Bu takvimde Namaz Akışı tarafından oluşturulmuş tüm etkinlikler silinecek. Devam edilsin mi?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    style: 'destructive',
                    onPress: async () => {
                        setTemizleniyor(true);
                        try {
                            await TakvimServisi.getInstance().eskiOlaylariTemizle(ayarlar.takvimId!, 31);
                            Alert.alert('Tamamlandı', 'Takvim etkinlikleri temizlendi.');
                        } catch {
                            Alert.alert('Hata', 'Etkinlikler temizlenirken hata oluştu.');
                        } finally {
                            setTemizleniyor(false);
                        }
                    },
                },
            ]
        );
    };

    const handleOlaylariOlustur = async () => {
        await butonTiklandiFeedback();
        if (!ayarlar.takvimId) {
            Alert.alert('Takvim Seçin', 'Lütfen önce bir takvim seçin.');
            return;
        }
        if (!koordinatlar) {
            Alert.alert('Konum Bulunamadı', 'Lütfen önce konum ayarlarından konumunuzu belirleyin.');
            return;
        }
        const result = await dispatch(takvimOlaylariniOlustur({ ayarlar, koordinatlar }));
        if (takvimOlaylariniOlustur.fulfilled.match(result)) {
            Alert.alert('Başarılı', `${result.payload.olusturulanSayi} takvim etkinliği oluşturuldu.`);
        } else {
            Alert.alert('Hata', String(result.payload) || 'Etkinlikler oluşturulurken bir hata oluştu.');
        }
    };

    // Bugünün vakitleri (önizleme için)
    const bugunVakitler = useMemo(() => {
        const hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        const sonuclar = hesaplayici.getGunlukVakitler(new Date());
        if (!sonuclar) return null;
        return {
            imsak:  sonuclar.imsak,
            ogle:   sonuclar.ogle,
            ikindi: sonuclar.ikindi,
            aksam:  sonuclar.aksam,
            yatsi:  sonuclar.yatsi,
        } as Record<TakvimVakitAdi, Date>;
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

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Master Toggle */}
                    <TouchableOpacity
                        className="flex-row items-center p-4 rounded-2xl mb-4"
                        style={{ backgroundColor: ayarlar.aktif ? renkler.birincil : renkler.kartArkaplan }}
                        onPress={() => handleAktifToggle(!ayarlar.aktif)}
                        activeOpacity={0.8}
                    >
                        <View
                            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: ayarlar.aktif ? 'rgba(255,255,255,0.2)' : `${renkler.birincil}15` }}
                        >
                            <FontAwesome5
                                name="calendar-alt"
                                size={20}
                                color={ayarlar.aktif ? '#FFF' : renkler.birincil}
                                solid
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-base font-semibold"
                                style={{ color: ayarlar.aktif ? '#FFF' : renkler.metin }}
                            >
                                Takvim Entegrasyonu
                            </Text>
                            <Text
                                className="text-xs mt-0.5"
                                style={{ color: ayarlar.aktif ? 'rgba(255,255,255,0.75)' : renkler.metinIkincil }}
                            >
                                {ayarlar.aktif ? 'Aktif — etkinlikler oluşturulacak' : 'Namaz vakitlerini takvime ekle'}
                            </Text>
                        </View>
                        <Switch
                            value={ayarlar.aktif}
                            onValueChange={handleAktifToggle}
                            trackColor={{ false: renkler.sinir, true: 'rgba(255,255,255,0.4)' }}
                            thumbColor="#FFF"
                        />
                    </TouchableOpacity>

                    {/* Pasif durumu */}
                    {!ayarlar.aktif && (
                        <View
                            className="items-center p-10 rounded-2xl"
                            style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        >
                            <FontAwesome5 name="calendar-times" size={48} color={renkler.metinIkincil} />
                            <Text className="text-base font-semibold mt-4 text-center" style={{ color: renkler.metin }}>
                                Takvim Entegrasyonu Kapalı
                            </Text>
                            <Text className="text-xs text-center mt-2" style={{ color: renkler.metinIkincil }}>
                                Aktifleştirerek namaz vakitlerini cihaz takviminize otomatik ekleyebilirsiniz.
                            </Text>
                        </View>
                    )}

                    {/* Aktif içerik */}
                    {ayarlar.aktif && (
                        <>
                            {/* Takvim Seçici */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-xs font-bold tracking-wider" style={{ color: renkler.metinIkincil }}>
                                        TAKVİM SEÇİMİ
                                    </Text>
                                    <TouchableOpacity
                                        onPress={takvimleriniYenile}
                                        className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
                                        style={{ backgroundColor: `${renkler.birincil}15` }}
                                    >
                                        {takvimYukleniyor
                                            ? <ActivityIndicator size="small" color={renkler.birincil} />
                                            : <FontAwesome5 name="sync-alt" size={12} color={renkler.birincil} />
                                        }
                                        <Text className="text-xs" style={{ color: renkler.birincil }}>Yenile</Text>
                                    </TouchableOpacity>
                                </View>

                                {cihazTakvimleri.length === 0 ? (
                                    <Text className="text-sm text-center py-4" style={{ color: renkler.metinIkincil }}>
                                        Cihazınızda düzenlenebilir takvim bulunamadı.
                                    </Text>
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
                                                onPress={() => handleTakvimSec(takvim.id, takvim.title)}
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    className="w-3 h-3 rounded-full mr-3"
                                                    style={{ backgroundColor: takvim.color }}
                                                />
                                                <Text
                                                    className="flex-1 text-sm"
                                                    style={{ color: secili ? renkler.birincil : renkler.metin, fontWeight: secili ? '600' : '400' }}
                                                >
                                                    {takvim.title}
                                                </Text>
                                                {secili && (
                                                    <FontAwesome5 name="check" size={12} color={renkler.birincil} />
                                                )}
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
                                <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                                    VAKİT AYARLARI
                                </Text>
                                {VAKIT_SIRASI.map((vakit, idx) => (
                                    <VakitAyarSatiri
                                        key={vakit}
                                        vakitAdi={vakit}
                                        gorununumAdi={VAKIT_GORUNTU_ADLARI[vakit]}
                                        ayar={ayarlar.vakitAyarlari[vakit]}
                                        onChange={yeni => handleVakitAyarDegistir(vakit, yeni)}
                                        sonMu={idx === VAKIT_SIRASI.length - 1}
                                    />
                                ))}
                            </View>

                            {/* Kaç Gün İlerisi */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                                    KAÇ GÜN İLERİSİ
                                </Text>
                                <View className="flex-row gap-2">
                                    {([7, 14, 30] as const).map(gun => {
                                        const secili = ayarlar.kaciGunIlerisi === gun;
                                        return (
                                            <TouchableOpacity
                                                key={gun}
                                                className="flex-1 py-2.5 rounded-xl items-center"
                                                style={{
                                                    backgroundColor: secili ? renkler.birincil : `${renkler.birincil}10`,
                                                    borderWidth: 1,
                                                    borderColor: secili ? renkler.birincil : renkler.sinir,
                                                }}
                                                onPress={() => dispatch(takvimAyarlariniGuncelle({ kaciGunIlerisi: gun }))}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    className="text-sm font-semibold"
                                                    style={{ color: secili ? '#FFF' : renkler.metinIkincil }}
                                                >
                                                    {gun} Gün
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Önizleme */}
                            <View
                                className="rounded-2xl p-4 mb-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                                    BUGÜN İÇİN ÖNİZLEME
                                </Text>
                                {aktifVakitler.length === 0 ? (
                                    <View className="items-center py-6">
                                        <FontAwesome5 name="calendar-minus" size={32} color={renkler.metinIkincil} />
                                        <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                            Henüz aktif vakit seçilmedi.{'\n'}Vakit Ayarları bölümünden vakit seçin.
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

                            {/* Butonlar */}
                            <TouchableOpacity
                                className="flex-row items-center justify-center p-4 rounded-2xl mb-2"
                                style={{ backgroundColor: renkler.birincil }}
                                onPress={handleOlaylariOlustur}
                                disabled={olayOlusturuluyor || temizleniyor}
                                activeOpacity={0.8}
                            >
                                {olayOlusturuluyor ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <FontAwesome5 name="calendar-plus" size={16} color="#FFF" solid style={{ marginRight: 8 }} />
                                        <Text className="text-base font-semibold" style={{ color: '#FFF' }}>
                                            Olayları Oluştur ({ayarlar.kaciGunIlerisi} gün)
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center justify-center p-3.5 rounded-2xl mb-3"
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#EF4444',
                                    backgroundColor: `#EF444415`,
                                }}
                                onPress={handleEtkinlikleriTemizle}
                                disabled={olayOlusturuluyor || temizleniyor}
                                activeOpacity={0.8}
                            >
                                {temizleniyor ? (
                                    <ActivityIndicator color="#EF4444" />
                                ) : (
                                    <>
                                        <FontAwesome5 name="calendar-times" size={15} color="#EF4444" solid style={{ marginRight: 8 }} />
                                        <Text className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                                            Mevcut Etkinlikleri Temizle
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Bilgi Notu */}
                            <View
                                className="flex-row items-start p-4 rounded-xl"
                                style={{ backgroundColor: `${renkler.birincil}10` }}
                            >
                                <FontAwesome5
                                    name="info-circle"
                                    size={14}
                                    color={renkler.birincil}
                                    style={{ marginTop: 1, marginRight: 8 }}
                                />
                                <Text className="flex-1 text-xs leading-5" style={{ color: renkler.metinIkincil }}>
                                    Etkinlikler her oluşturmada öncekiler silinerek yeniden oluşturulur.
                                    Ayarlarınızı değiştirdikten sonra "Olayları Oluştur" butonuna tekrar basmanız gerekir.
                                </Text>
                            </View>
                        </>
                    )}

                    <View className="h-10" />
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};
