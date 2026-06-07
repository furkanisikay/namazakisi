/**
 * TakvimAyarlari — Etkinlik temizleme modalı (4 aşamalı: kriter/taranıyor/onay/tamamlandı).
 * (Ana ekran dosyasından ayrıldı.)
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
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { TakvimServisi } from '../../../domain/services/TakvimServisi';
import { Logger } from '../../../core/utils/Logger';
import type { TakvimVakitAdi } from '../../store/takvimSlice';
import { VAKIT_SIRASI, VAKIT_GORUNTU_ADLARI, VAKIT_TEMIZLE_BASLIK, saatFormatla } from './sabitler';
import { OzetSatir, takvimUygulamasiniAc, BasariIcerigi } from './bilesenler';
import { SayisalSecici } from '../../components/common/SayisalSecici';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

type TemizleAdim = 'kriter' | 'taraniyor' | 'onay' | 'tamamlandi';
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
    secilenTakvimId: string | null;
    secilenTakvimAdi: string | null;
    cihazTakvimleri: Array<{ id: string; title: string; color: string }>;
}

const ARALIK_PRESETLER: { gun: number; etiket: string; aciklama: string }[] = [
    { gun: 7,  etiket: '7 Gün',  aciklama: 'Bu hafta' },
    { gun: 30, etiket: '30 Gün', aciklama: 'Bu ay' },
    { gun: 90, etiket: '90 Gün', aciklama: '3 ay' },
];

export const TemizleModali: React.FC<TemizleModaliProps> = ({
    gorunur, onKapat,
    secilenTakvimId, secilenTakvimAdi, cihazTakvimleri,
}) => {
    const renkler = useRenkler();

    const [adim, setAdim] = useState<TemizleAdim>('kriter');
    const [takvimMod, setTakvimMod] = useState<TakvimModTipi>('secili');
    const [aralikGun, setAralikGun] = useState<number>(30);
    const [ozelAralikAktif, setOzelAralikAktif] = useState(false);
    const [secilenVakitler, setSecilenVakitler] = useState<Set<TakvimVakitAdi>>(
        new Set<TakvimVakitAdi>(VAKIT_SIRASI)
    );
    const [bulunanEtkinlikler, setBulunanEtkinlikler] = useState<BulunanEtkinlik[]>([]);
    const [siliniyor, setSiliniyor] = useState(false);
    const [silinenSayi, setSilinenSayi] = useState(0);

    useEffect(() => {
        if (!gorunur) {
            setAdim('kriter');
            setTakvimMod('secili');
            setAralikGun(30);
            setOzelAralikAktif(false);
            setSecilenVakitler(new Set<TakvimVakitAdi>(VAKIT_SIRASI));
            setBulunanEtkinlikler([]);
            setSiliniyor(false);
            setSilinenSayi(0);
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
        } catch (error) {
            Logger.error('TakvimAyarlari', 'Etkinlikler getirilemedi', error);
            setAdim('kriter');
        }
    };

    const handleSil = async () => {
        setSiliniyor(true);
        try {
            const ids = bulunanEtkinlikler.map(e => e.id);
            const silinen = await TakvimServisi.getInstance().etkinlikleriSil(ids);
            setSilinenSayi(silinen);
            setSiliniyor(false);
            setAdim('tamamlandi');
        } catch (error) {
            Logger.error('TakvimAyarlari', 'Etkinlikler silinemedi', error);
            setSiliniyor(false);
        }
    };

    const handleTakvimiAc = async () => {
        await takvimUygulamasiniAc();
    };

    const temizlemeOzetSatirlari: OzetSatir[] = [
        { ikon: 'trash-alt', etiket: 'Silinen', deger: `${silinenSayi} etkinlik` },
        {
            ikon: takvimMod === 'tumu' ? 'layer-group' : 'bookmark',
            etiket: 'Takvim',
            deger: takvimMod === 'tumu' ? 'Tüm takvimler' : (secilenTakvimAdi ?? 'Seçili takvim'),
        },
        { ikon: 'clock', etiket: 'Aralık', deger: `${aralikGun} gün` },
        {
            ikon: 'list-ul',
            etiket: 'Vakitler',
            deger: secilenVakitler.size === VAKIT_SIRASI.length
                ? 'Tüm vakitler'
                : Array.from(secilenVakitler).map(v => VAKIT_GORUNTU_ADLARI[v]).join(', '),
        },
    ];

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

    // Android donanim geri tusu + backdrop dokunusu: adima gore akilli davranis
    const handleGeriIstegi = useCallback(() => {
        if (siliniyor) return;
        if (adim === 'onay') setAdim('kriter');
        else if (adim === 'taraniyor') { /* tarama suruyor, yok say */ }
        else onKapat();
    }, [siliniyor, adim, onKapat]);

    // New Architecture'da Modal onRequestClose guvenilir degil → BackHandler ile garanti
    useDonanimGeriTusu(gorunur, handleGeriIstegi);

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={handleGeriIstegi}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {/* Backdrop — absolute sibling: FlatList/ScrollView gesture'larini engellemez */}
                <TouchableWithoutFeedback onPress={adim === 'kriter' ? onKapat : undefined}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: EKRAN_YUKSEKLIGI * 0.87,
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
                                    <View className="flex-row gap-2 mb-2">
                                        {ARALIK_PRESETLER.map(({ gun, etiket, aciklama }) => {
                                            const secili = !ozelAralikAktif && aralikGun === gun;
                                            return (
                                                <TouchableOpacity
                                                    key={gun}
                                                    className="flex-1 py-3 rounded-2xl items-center"
                                                    style={{
                                                        backgroundColor: secili ? renkler.birincil : renkler.arkaplan,
                                                        borderWidth: 1,
                                                        borderColor: secili ? renkler.birincil : renkler.sinir,
                                                    }}
                                                    onPress={() => { setAralikGun(gun); setOzelAralikAktif(false); }}
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
                                        <TouchableOpacity
                                            className="flex-1 py-3 rounded-2xl items-center"
                                            style={{
                                                backgroundColor: ozelAralikAktif ? renkler.birincil : renkler.arkaplan,
                                                borderWidth: 1,
                                                borderColor: ozelAralikAktif ? renkler.birincil : renkler.sinir,
                                            }}
                                            onPress={() => {
                                                if (!ozelAralikAktif) {
                                                    const presetler = ARALIK_PRESETLER.map(p => p.gun);
                                                    if (presetler.includes(aralikGun)) setAralikGun(60);
                                                }
                                                setOzelAralikAktif(true);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-sm font-bold" style={{ color: ozelAralikAktif ? '#FFF' : renkler.metin }}>
                                                Özel
                                            </Text>
                                            <Text className="text-xs mt-0.5" style={{ color: ozelAralikAktif ? 'rgba(255,255,255,0.75)' : renkler.metinIkincil }}>
                                                Gün gir
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {ozelAralikAktif && (
                                        <View className="flex-row items-center justify-between mt-1 mb-2">
                                            <Text className="text-sm" style={{ color: renkler.metin }}>Gün sayısı</Text>
                                            <SayisalSecici
                                                deger={aralikGun}
                                                min={1}
                                                max={365}
                                                adim={1}
                                                birim="gün"
                                                onChange={setAralikGun}
                                                renk={renkler.birincil}
                                            />
                                        </View>
                                    )}
                                    <View className="mb-1" />

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

                            {/* ── Aşama: Tamamlandı (başarı) ── */}
                            {adim === 'tamamlandi' && (
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                >
                                    <BasariIcerigi
                                        tip="temizleme"
                                        baslik="Etkinlikler Temizlendi"
                                        altBaslik={silinenSayi > 0
                                            ? 'Seçtiğiniz etkinlikler takviminizden başarıyla silindi.'
                                            : 'Belirttiğiniz kriterlerde silinecek etkinlik kalmadı.'}
                                        satirlar={temizlemeOzetSatirlari}
                                        onTakvimiAc={handleTakvimiAc}
                                        onKapat={onKapat}
                                    />
                                </ScrollView>
                            )}
                </View>
            </View>
        </Modal>
    );
};
