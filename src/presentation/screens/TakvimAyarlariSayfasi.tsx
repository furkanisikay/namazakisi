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
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Switch,
    ActivityIndicator,
    Modal,
    Animated,
    Easing,
    Dimensions,
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

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');
const THROTTLE_SURESI = 100;

const VAKIT_GORUNTU_ADLARI: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah',
    ogle:   'Öğle',
    ikindi: 'İkindi',
    aksam:  'Akşam',
    yatsi:  'Yatsı',
};

const VAKIT_SIRASI: TakvimVakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

// Event title → temizle filtresi için
const VAKIT_TEMIZLE_BASLIK: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah Namazı',
    ogle:   'Öğle Namazı',
    ikindi: 'İkindi Namazı',
    aksam:  'Akşam Namazı',
    yatsi:  'Yatsı Namazı',
};

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

const BASLANGIC_TIPLERI: { tip: BaslangicTipi; etiket: string; aciklama: string }[] = [
    { tip: 'vakit_oncesi',  etiket: 'Çıkmadan Önce', aciklama: 'Vakit bitmeden X dk önce' },
    { tip: 'vakit_girisi',  etiket: 'Vakitte',        aciklama: 'Tam vakit girince başlar' },
    { tip: 'vakit_sonrasi', etiket: 'Vakitten Sonra', aciklama: 'Vakit girdikten X dk sonra' },
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

            {ayar.aktif && (
                <View className="mt-3 gap-3">
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
    return `${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`;
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

// ─── BildirimBanneri ──────────────────────────────────────────────────────────

interface BildirimBanneriProps {
    mesaj: string;
    tip: 'basari' | 'hata' | 'bilgi';
    onKapat: () => void;
}

const BildirimBanneri: React.FC<BildirimBanneriProps> = ({ mesaj, tip, onKapat }) => {
    const renkler = useRenkler();
    const renk = tip === 'basari' ? '#22C55E' : tip === 'hata' ? '#EF4444' : renkler.birincil;
    const ikon = tip === 'basari' ? 'check-circle' : tip === 'hata' ? 'exclamation-circle' : 'info-circle';

    return (
        <View
            className="flex-row items-center p-3.5 rounded-xl mb-3"
            style={{ backgroundColor: `${renk}15`, borderWidth: 1, borderColor: `${renk}40` }}
        >
            <FontAwesome5 name={ikon} size={16} color={renk} style={{ marginRight: 10 }} />
            <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>{mesaj}</Text>
            <TouchableOpacity
                onPress={onKapat}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
                <FontAwesome5 name="times" size={13} color={renkler.metinIkincil} />
            </TouchableOpacity>
        </View>
    );
};

// ─── OzellikBilgi (inactive state) ────────────────────────────────────────────

const OzellikBilgi: React.FC = () => {
    const renkler = useRenkler();

    const ozellikler = [
        {
            ikon: 'sliders-h',
            baslik: 'Vakit Başına Özelleştirme',
            aciklama: 'Her namaz için etkinlik süresi, başlangıç ve ofset ayrı ayrı ayarlanır.',
        },
        {
            ikon: 'calendar-check',
            baslik: 'Anlık Önizleme',
            aciklama: 'Bugün için hesaplanan saatleri kaydetmeden önce ekranda görebilirsin.',
        },
        {
            ikon: 'trash-alt',
            baslik: 'Seçici Temizleme',
            aciklama: 'Takvim, zaman aralığı ve vakit seçerek etkinlikleri istediğin gibi silebilirsin.',
        },
    ];

    return (
        <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: renkler.kartArkaplan, borderWidth: 1, borderColor: renkler.sinir }}
        >
            <View className="items-center mb-5">
                <View
                    className="w-20 h-20 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: `${renkler.birincil}12` }}
                >
                    <FontAwesome5 name="calendar-alt" size={36} color={renkler.birincil} solid />
                </View>
                <Text className="text-base font-bold text-center" style={{ color: renkler.metin }}>
                    Namaz Vakitlerini Takvimine Ekle
                </Text>
                <Text className="text-xs text-center mt-2 leading-5" style={{ color: renkler.metinIkincil }}>
                    Seçtiğin vakitler için cihaz takvimine ileriye dönük etkinlikler otomatik oluşturulur.
                </Text>
            </View>

            {ozellikler.map((o, i) => (
                <View key={i} className={`flex-row items-start ${i < ozellikler.length - 1 ? 'mb-4' : ''}`}>
                    <View
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}15` }}
                    >
                        <FontAwesome5 name={o.ikon} size={15} color={renkler.birincil} />
                    </View>
                    <View className="flex-1 justify-center">
                        <Text className="text-sm font-semibold mb-0.5" style={{ color: renkler.metin }}>
                            {o.baslik}
                        </Text>
                        <Text className="text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                            {o.aciklama}
                        </Text>
                    </View>
                </View>
            ))}

            <View
                className="mt-5 flex-row items-center justify-center p-3 rounded-xl gap-2"
                style={{ backgroundColor: `${renkler.birincil}10` }}
            >
                <FontAwesome5 name="arrow-up" size={11} color={renkler.birincil} />
                <Text className="text-xs font-medium" style={{ color: renkler.birincil }}>
                    Başlamak için yukarıdaki düğmeyi aktif edin
                </Text>
            </View>
        </View>
    );
};

// ─── TemizleModali ────────────────────────────────────────────────────────────

type TemizleAdim = 'kriter' | 'taraniyor' | 'onay';
type TakvimModTipi = 'secili' | 'tumu';

interface BulunanEtkinlik {
    id: string;
    title: string;
    startDate: Date;
    takvimId: string;
}

interface TemizleModaliProps {
    gorunur: boolean;
    onKapat: () => void;
    onTemizlendi: (silinen: number, ozet: string) => void;
    secilenTakvimId: string | null;
    secilenTakvimAdi: string | null;
    cihazTakvimleri: Array<{ id: string; title: string; color: string }>;
}

const ARALIK_PRESETLER: { gun: 7 | 30 | 90; etiket: string; aciklama: string }[] = [
    { gun: 7,  etiket: '7 Gün',  aciklama: 'Bu hafta' },
    { gun: 30, etiket: '30 Gün', aciklama: 'Bu ay' },
    { gun: 90, etiket: '90 Gün', aciklama: '3 ay' },
];

const TemizleModali: React.FC<TemizleModaliProps> = ({
    gorunur, onKapat, onTemizlendi,
    secilenTakvimId, secilenTakvimAdi, cihazTakvimleri,
}) => {
    const renkler = useRenkler();

    const [adim, setAdim] = useState<TemizleAdim>('kriter');
    const [takvimMod, setTakvimMod] = useState<TakvimModTipi>('secili');
    const [aralikGun, setAralikGun] = useState<7 | 30 | 90>(30);
    const [secilenVakitler, setSecilenVakitler] = useState<Set<TakvimVakitAdi>>(
        new Set<TakvimVakitAdi>(VAKIT_SIRASI)
    );
    const [bulunanEtkinlikler, setBulunanEtkinlikler] = useState<BulunanEtkinlik[]>([]);
    const [siliniyor, setSiliniyor] = useState(false);

    useEffect(() => {
        if (!gorunur) {
            setAdim('kriter');
            setTakvimMod('secili');
            setAralikGun(30);
            setSecilenVakitler(new Set<TakvimVakitAdi>(VAKIT_SIRASI));
            setBulunanEtkinlikler([]);
            setSiliniyor(false);
        }
    }, [gorunur]);

    const toggleVakit = (vakit: TakvimVakitAdi) => {
        setSecilenVakitler(prev => {
            const yeni = new Set(prev);
            if (yeni.has(vakit)) {
                if (yeni.size > 1) yeni.delete(vakit);
            } else {
                yeni.add(vakit);
            }
            return yeni;
        });
    };

    const tumunuSec = () => {
        if (secilenVakitler.size === VAKIT_SIRASI.length) {
            setSecilenVakitler(new Set([VAKIT_SIRASI[0]]));
        } else {
            setSecilenVakitler(new Set<TakvimVakitAdi>(VAKIT_SIRASI));
        }
    };

    const handleTara = async () => {
        const takvimIds = takvimMod === 'secili'
            ? (secilenTakvimId ? [secilenTakvimId] : [])
            : cihazTakvimleri.map(t => t.id);

        if (takvimIds.length === 0) return;

        setAdim('taraniyor');

        try {
            const baslangic = new Date();
            baslangic.setHours(0, 0, 0, 0);
            const bitis = new Date(baslangic);
            bitis.setDate(bitis.getDate() + aralikGun);

            const tumVakitlerSecili = secilenVakitler.size === VAKIT_SIRASI.length;
            const vakitBasliklari = tumVakitlerSecili
                ? undefined
                : Array.from(secilenVakitler).map(v => VAKIT_TEMIZLE_BASLIK[v]);

            const etkinlikler = await TakvimServisi.getInstance().etkinlikleriGetir(
                takvimIds, baslangic, bitis, vakitBasliklari
            );

            setBulunanEtkinlikler(etkinlikler);
            setAdim('onay');
        } catch {
            setAdim('kriter');
        }
    };

    const handleSil = async () => {
        setSiliniyor(true);
        try {
            const ids = bulunanEtkinlikler.map(e => e.id);
            const silinen = await TakvimServisi.getInstance().etkinlikleriSil(ids);

            const takvimOzeti = takvimMod === 'tumu' ? 'Tüm takvimler' : (secilenTakvimAdi ?? 'Seçili takvim');
            const vakitOzeti = secilenVakitler.size === VAKIT_SIRASI.length
                ? 'tüm vakitler'
                : Array.from(secilenVakitler).map(v => VAKIT_GORUNTU_ADLARI[v]).join(', ');
            onTemizlendi(silinen, `${takvimOzeti} · ${aralikGun} gün · ${vakitOzeti}`);
            onKapat();
        } catch {
            setSiliniyor(false);
        }
    };

    const takvimRengi = (tid: string) =>
        cihazTakvimleri.find(t => t.id === tid)?.color ?? '#007AFF';

    const renderEtkinlik = ({ item }: { item: BulunanEtkinlik }) => (
        <View className="flex-row items-center py-2.5 px-1" style={{ borderBottomWidth: 1, borderBottomColor: renkler.sinir }}>
            <View
                className="w-2.5 h-2.5 rounded-full mr-3"
                style={{ backgroundColor: takvimRengi(item.takvimId) }}
            />
            <Text className="text-sm mr-2 font-medium tabular-nums" style={{ color: renkler.metinIkincil, minWidth: 44 }}>
                {`${item.startDate.getDate().toString().padStart(2,'0')}.${(item.startDate.getMonth()+1).toString().padStart(2,'0')}`}
            </Text>
            <Text className="flex-1 text-sm" style={{ color: renkler.metin }}>
                {item.title}
            </Text>
            <Text className="text-xs tabular-nums" style={{ color: renkler.metinIkincil }}>
                {saatFormatla(item.startDate)}
            </Text>
        </View>
    );

    const taraButonuAktif = takvimMod === 'secili' ? !!secilenTakvimId : cihazTakvimleri.length > 0;

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent>
            <TouchableWithoutFeedback onPress={adim === 'kriter' ? onKapat : undefined}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <TouchableWithoutFeedback>
                        <View
                            style={{
                                backgroundColor: renkler.kartArkaplan,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                maxHeight: EKRAN_YUKSEKLIGI * 0.87,
                                paddingBottom: 32,
                            }}
                        >
                            {/* Handle */}
                            <View className="items-center pt-3 pb-2">
                                <View
                                    style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }}
                                />
                            </View>

                            {/* ── Aşama 1: Kriter Seçimi ── */}
                            {adim === 'kriter' && (
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
                                >
                                    {/* Başlık */}
                                    <View className="flex-row items-center mb-4">
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                            style={{ backgroundColor: '#EF444415' }}
                                        >
                                            <FontAwesome5 name="broom" size={16} color="#EF4444" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                                Etkinlikleri Temizle
                                            </Text>
                                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                                Hangi etkinliklerin silineceğini seç
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Takvim Seçimi */}
                                    <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: renkler.metinIkincil }}>
                                        HANGİ TAKVİM
                                    </Text>
                                    <View
                                        className="rounded-2xl overflow-hidden mb-4"
                                        style={{ borderWidth: 1, borderColor: renkler.sinir }}
                                    >
                                        {[
                                            {
                                                mod: 'secili' as TakvimModTipi,
                                                baslik: secilenTakvimAdi ?? 'Seçili Takvim',
                                                aciklama: secilenTakvimAdi ? 'Sadece bu takvimde ara' : 'Önce bir takvim seçin',
                                                ikon: 'bookmark',
                                                disabled: !secilenTakvimId,
                                            },
                                            {
                                                mod: 'tumu' as TakvimModTipi,
                                                baslik: 'Tüm Takvimler',
                                                aciklama: `${cihazTakvimleri.length} takvimde ara`,
                                                ikon: 'layer-group',
                                                disabled: false,
                                            },
                                        ].map(({ mod, baslik, aciklama, ikon, disabled }) => {
                                            const secili = takvimMod === mod;
                                            return (
                                                <TouchableOpacity
                                                    key={mod}
                                                    className="flex-row items-center p-3.5"
                                                    style={{
                                                        backgroundColor: secili ? `${renkler.birincil}10` : 'transparent',
                                                        opacity: disabled ? 0.4 : 1,
                                                        borderBottomWidth: mod === 'secili' ? 1 : 0,
                                                        borderBottomColor: renkler.sinir,
                                                    }}
                                                    onPress={() => !disabled && setTakvimMod(mod)}
                                                    disabled={disabled}
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                                        style={{ backgroundColor: secili ? `${renkler.birincil}20` : renkler.arkaplan }}
                                                    >
                                                        <FontAwesome5 name={ikon} size={14} color={secili ? renkler.birincil : renkler.metinIkincil} />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-sm font-semibold" style={{ color: secili ? renkler.birincil : renkler.metin }}>
                                                            {baslik}
                                                        </Text>
                                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                                            {aciklama}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        className="w-5 h-5 rounded-full items-center justify-center"
                                                        style={{ borderWidth: 2, borderColor: secili ? renkler.birincil : renkler.sinir, backgroundColor: secili ? renkler.birincil : 'transparent' }}
                                                    >
                                                        {secili && <FontAwesome5 name="check" size={9} color="#FFF" />}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Zaman Aralığı */}
                                    <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: renkler.metinIkincil }}>
                                        ZAMAN ARALIĞI (BUGÜNDEN İTİBAREN)
                                    </Text>
                                    <View className="flex-row gap-2 mb-4">
                                        {ARALIK_PRESETLER.map(({ gun, etiket, aciklama }) => {
                                            const secili = aralikGun === gun;
                                            return (
                                                <TouchableOpacity
                                                    key={gun}
                                                    className="flex-1 py-3 rounded-2xl items-center"
                                                    style={{
                                                        backgroundColor: secili ? renkler.birincil : renkler.arkaplan,
                                                        borderWidth: 1,
                                                        borderColor: secili ? renkler.birincil : renkler.sinir,
                                                    }}
                                                    onPress={() => setAralikGun(gun)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text className="text-sm font-bold" style={{ color: secili ? '#FFF' : renkler.metin }}>
                                                        {etiket}
                                                    </Text>
                                                    <Text className="text-xs mt-0.5" style={{ color: secili ? 'rgba(255,255,255,0.75)' : renkler.metinIkincil }}>
                                                        {aciklama}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Vakitler */}
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xs font-bold tracking-wider" style={{ color: renkler.metinIkincil }}>
                                            VAKİTLER
                                        </Text>
                                        <TouchableOpacity onPress={tumunuSec}>
                                            <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                                                {secilenVakitler.size === VAKIT_SIRASI.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View
                                        className="rounded-2xl overflow-hidden mb-5"
                                        style={{ borderWidth: 1, borderColor: renkler.sinir }}
                                    >
                                        {VAKIT_SIRASI.map((vakit, idx) => {
                                            const secili = secilenVakitler.has(vakit);
                                            return (
                                                <TouchableOpacity
                                                    key={vakit}
                                                    className="flex-row items-center px-4 py-3"
                                                    style={{
                                                        backgroundColor: secili ? `${renkler.birincil}08` : 'transparent',
                                                        borderBottomWidth: idx < VAKIT_SIRASI.length - 1 ? 1 : 0,
                                                        borderBottomColor: renkler.sinir,
                                                    }}
                                                    onPress={() => toggleVakit(vakit)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        className="w-5 h-5 rounded items-center justify-center mr-3"
                                                        style={{
                                                            backgroundColor: secili ? renkler.birincil : 'transparent',
                                                            borderWidth: 2,
                                                            borderColor: secili ? renkler.birincil : renkler.sinir,
                                                        }}
                                                    >
                                                        {secili && <FontAwesome5 name="check" size={10} color="#FFF" />}
                                                    </View>
                                                    <Text className="text-sm" style={{ color: renkler.metin, fontWeight: secili ? '600' : '400' }}>
                                                        {VAKIT_GORUNTU_ADLARI[vakit]} Namazı
                                                    </Text>
                                                    <Text className="ml-auto text-xs" style={{ color: renkler.metinIkincil }}>
                                                        {VAKIT_TEMIZLE_BASLIK[vakit]}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Tara Butonu */}
                                    <TouchableOpacity
                                        className="flex-row items-center justify-center p-4 rounded-2xl"
                                        style={{
                                            backgroundColor: taraButonuAktif ? '#EF4444' : renkler.sinir,
                                        }}
                                        onPress={handleTara}
                                        disabled={!taraButonuAktif}
                                        activeOpacity={0.8}
                                    >
                                        <FontAwesome5 name="search" size={14} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text className="text-base font-semibold" style={{ color: '#FFF' }}>
                                            Etkinlikleri Tara
                                        </Text>
                                    </TouchableOpacity>

                                    {!taraButonuAktif && (
                                        <Text className="text-xs text-center mt-2" style={{ color: renkler.metinIkincil }}>
                                            Önce takvim ayarlarından bir takvim seçin
                                        </Text>
                                    )}
                                </ScrollView>
                            )}

                            {/* ── Aşama: Taranıyor ── */}
                            {adim === 'taraniyor' && (
                                <View className="items-center justify-center py-16">
                                    <ActivityIndicator size="large" color="#EF4444" />
                                    <Text className="text-sm mt-4" style={{ color: renkler.metinIkincil }}>
                                        Etkinlikler taranıyor…
                                    </Text>
                                </View>
                            )}

                            {/* ── Aşama 2: Onay ── */}
                            {adim === 'onay' && (
                                <View style={{ flex: 1, minHeight: 0 }}>
                                    {/* Özet */}
                                    <View className="px-5 pb-3">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                                                Silinecek Etkinlikler
                                            </Text>
                                            <View
                                                className="ml-2 px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: bulunanEtkinlikler.length > 0 ? '#EF444420' : `${renkler.birincil}20` }}
                                            >
                                                <Text className="text-xs font-bold" style={{ color: bulunanEtkinlikler.length > 0 ? '#EF4444' : renkler.birincil }}>
                                                    {bulunanEtkinlikler.length}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                                            {takvimMod === 'tumu' ? 'Tüm takvimler' : (secilenTakvimAdi ?? 'Seçili takvim')}
                                            {'  ·  '}{aralikGun} gün
                                            {'  ·  '}{secilenVakitler.size === VAKIT_SIRASI.length ? 'Tüm vakitler' : Array.from(secilenVakitler).map(v => VAKIT_GORUNTU_ADLARI[v]).join(', ')}
                                        </Text>
                                    </View>

                                    {bulunanEtkinlikler.length === 0 ? (
                                        <View className="flex-1 items-center justify-center py-10 px-5">
                                            <FontAwesome5 name="calendar-check" size={40} color={renkler.metinIkincil} />
                                            <Text className="text-sm font-semibold mt-3 text-center" style={{ color: renkler.metin }}>
                                                Etkinlik Bulunamadı
                                            </Text>
                                            <Text className="text-xs text-center mt-1.5 leading-5" style={{ color: renkler.metinIkincil }}>
                                                Belirtilen kriterlerde silinecek etkinlik bulunamadı.
                                            </Text>
                                        </View>
                                    ) : (
                                        <FlatList
                                            data={bulunanEtkinlikler}
                                            keyExtractor={item => item.id}
                                            renderItem={renderEtkinlik}
                                            style={{ flex: 1 }}
                                            contentContainerStyle={{ paddingHorizontal: 20 }}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    )}

                                    {/* Alt Butonlar */}
                                    <View className="flex-row gap-3 px-5 pt-3" style={{ borderTopWidth: 1, borderTopColor: renkler.sinir }}>
                                        <TouchableOpacity
                                            className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl"
                                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                                            onPress={() => setAdim('kriter')}
                                            disabled={siliniyor}
                                            activeOpacity={0.7}
                                        >
                                            <FontAwesome5 name="arrow-left" size={13} color={renkler.metinIkincil} style={{ marginRight: 6 }} />
                                            <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                                                Geri
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="flex-[2] flex-row items-center justify-center py-3.5 rounded-2xl"
                                            style={{
                                                backgroundColor: bulunanEtkinlikler.length > 0 ? '#EF4444' : renkler.sinir,
                                            }}
                                            onPress={handleSil}
                                            disabled={siliniyor || bulunanEtkinlikler.length === 0}
                                            activeOpacity={0.8}
                                        >
                                            {siliniyor ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <>
                                                    <FontAwesome5 name="trash-alt" size={14} color="#FFF" style={{ marginRight: 8 }} />
                                                    <Text className="text-base font-semibold" style={{ color: '#FFF' }}>
                                                        {bulunanEtkinlikler.length > 0
                                                            ? `${bulunanEtkinlikler.length} Etkinliği Sil`
                                                            : 'Silinecek Etkinlik Yok'}
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

interface Bildirim {
    mesaj: string;
    tip: 'basari' | 'hata' | 'bilgi';
}

export const TakvimAyarlariSayfasi: React.FC<any> = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();

    const { ayarlar, olayOlusturuluyor } = useAppSelector(state => state.takvim);
    const koordinatlar = useAppSelector(state => state.konum.koordinatlar);

    const [cihazTakvimleri, setCihazTakvimleri] = useState<Array<{ id: string; title: string; color: string }>>([]);
    const [takvimYukleniyor, setTakvimYukleniyor] = useState(false);
    const [temizleModaliGorunur, setTemizleModaliGorunur] = useState(false);
    const [bildirim, setBildirim] = useState<Bildirim | null>(null);
    const bildirimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (ayarlar.aktif) takvimleriniYenile();
    }, [ayarlar.aktif]);

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

        const result = await dispatch(takvimOlaylariniOlustur({ ayarlar, koordinatlar }));
        if (takvimOlaylariniOlustur.fulfilled.match(result)) {
            bildirimGoster(`${result.payload.olusturulanSayi} etkinlik takvime eklendi.`, 'basari');
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

    const olusturButonuMesaji = !ayarlar.takvimId
        ? 'Takvim seçilmedi'
        : !koordinatlar
            ? 'Konum bulunamadı'
            : null;

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
                        onPress={() => dispatch(takvimAyarlariniGuncelle({ aktif: !ayarlar.aktif }))}
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
                            <Text className="text-base font-semibold" style={{ color: ayarlar.aktif ? '#FFF' : renkler.metin }}>
                                Takvim Entegrasyonu
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: ayarlar.aktif ? 'rgba(255,255,255,0.75)' : renkler.metinIkincil }}>
                                {ayarlar.aktif ? 'Aktif — etkinlikler oluşturulabilir' : 'Namaz vakitlerini takvime ekle'}
                            </Text>
                        </View>
                        <Switch
                            value={ayarlar.aktif}
                            onValueChange={v => { dispatch(takvimAyarlariniGuncelle({ aktif: v })); }}
                            trackColor={{ false: renkler.sinir, true: 'rgba(255,255,255,0.4)' }}
                            thumbColor="#FFF"
                        />
                    </TouchableOpacity>

                    {/* ── Pasif ── */}
                    {!ayarlar.aktif && <OzellikBilgi />}

                    {/* ── Aktif ── */}
                    {ayarlar.aktif && (
                        <>
                            {/* Bildirim Banneri */}
                            {bildirim && (
                                <BildirimBanneri
                                    mesaj={bildirim.mesaj}
                                    tip={bildirim.tip}
                                    onKapat={() => setBildirim(null)}
                                />
                            )}

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
                                    <View className="items-center py-5">
                                        <FontAwesome5 name="calendar-times" size={28} color={renkler.metinIkincil} />
                                        <Text className="text-sm text-center mt-2" style={{ color: renkler.metinIkincil }}>
                                            Cihazınızda düzenlenebilir takvim bulunamadı.
                                        </Text>
                                        <Text className="text-xs text-center mt-1" style={{ color: renkler.metinIkincil }}>
                                            Cihazınıza bir Google veya iCloud hesabı ekleyin.
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
                                                <Text className="text-sm font-semibold" style={{ color: secili ? '#FFF' : renkler.metinIkincil }}>
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
                                        <FontAwesome5 name="calendar-minus" size={28} color={renkler.metinIkincil} />
                                        <Text className="text-sm text-center mt-3 leading-5" style={{ color: renkler.metinIkincil }}>
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

                            {/* Oluştur Butonu */}
                            <TouchableOpacity
                                className="flex-row items-center justify-center p-4 rounded-2xl mb-2"
                                style={{ backgroundColor: olayOlusturuluyor ? `${renkler.birincil}80` : renkler.birincil }}
                                onPress={handleOlaylariOlustur}
                                disabled={olayOlusturuluyor}
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

                            {olusturButonuMesaji && (
                                <View className="flex-row items-center justify-center mb-2 gap-1.5">
                                    <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} />
                                    <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                        {olusturButonuMesaji}
                                    </Text>
                                </View>
                            )}

                            {/* Temizle Butonu */}
                            <TouchableOpacity
                                className="flex-row items-center justify-center p-3.5 rounded-2xl mb-3"
                                style={{ borderWidth: 1, borderColor: '#EF4444', backgroundColor: '#EF444415' }}
                                onPress={async () => { await butonTiklandiFeedback(); setTemizleModaliGorunur(true); }}
                                disabled={olayOlusturuluyor}
                                activeOpacity={0.8}
                            >
                                <FontAwesome5 name="broom" size={14} color="#EF4444" style={{ marginRight: 8 }} />
                                <Text className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                                    Etkinlikleri Temizle
                                </Text>
                            </TouchableOpacity>

                            {/* Bilgi Notu */}
                            <View
                                className="flex-row items-start p-4 rounded-xl"
                                style={{ backgroundColor: `${renkler.birincil}10` }}
                            >
                                <FontAwesome5 name="info-circle" size={14} color={renkler.birincil} style={{ marginTop: 1, marginRight: 8 }} />
                                <Text className="flex-1 text-xs leading-5" style={{ color: renkler.metinIkincil }}>
                                    Etkinlikler her oluşturmada öncekiler silinerek yeniden oluşturulur.
                                    Ayarları değiştirdikten sonra "Olayları Oluştur" butonuna tekrar basın.
                                </Text>
                            </View>
                        </>
                    )}

                    <View className="h-10" />
                </Animated.View>
            </ScrollView>

            {/* Temizle Modalı */}
            <TemizleModali
                gorunur={temizleModaliGorunur}
                onKapat={() => setTemizleModaliGorunur(false)}
                onTemizlendi={(silinen, ozet) => {
                    setTemizleModaliGorunur(false);
                    bildirimGoster(`${silinen} etkinlik temizlendi. (${ozet})`, 'basari');
                }}
                secilenTakvimId={ayarlar.takvimId}
                secilenTakvimAdi={ayarlar.takvimAdi}
                cihazTakvimleri={cihazTakvimleri}
            />
        </SafeAreaView>
    );
};
