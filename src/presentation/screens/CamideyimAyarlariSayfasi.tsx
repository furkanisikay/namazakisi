/**
 * Camideyim ayar sayfası (issue #297, Faz 1 — haritasız).
 *
 * Harita (MapLibre) bu fazda YOK (yeni bağımlılık; sahibin onayı bekleniyor).
 * Yerine: mesafe sıralı yakın camiler listesi + "bulunduğum yeri ekleyin" +
 * "cami değil" + "favori" + alan (m) ayarı, ve "Son algılamalar" zaman çizelgesi
 * (neden algılandı / neden algılanmadı).
 *
 * Karar native'de verilir; ekran yalnız ayarı yazar ve olay günlüğünü okur.
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde).
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRenkler } from '../../core/theme';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { AyarKutusu } from '../components/ayar/AyarKutusu';
import { KonumIzniDisclosureModali } from '../components/KonumIzniDisclosureModali';
import { useCamideyim } from '../hooks/useCamideyim';
import {
    ALAN_ADIM_M,
    ALAN_MAX_M,
    ALAN_MIN_M,
    BEKLEME_MAX_DK,
    BEKLEME_MIN_DK,
    KAPI_CUMA_ONCE_DK,
    KAPI_CUMA_SONRA_DK,
    KAPI_ONCE_DK,
    KAPI_SONRA_DK,
    VARSAYILAN_ALAN_M,
    type YerKaydi,
} from '../../core/cami/camiTipleri';
import { mesafeM } from '../../core/cami/geometri';
import type { OlaySatiri } from '../../core/cami/olayMetinleri';
import { camidenCik } from '../../../modules/expo-cami-geofence/src';
import type { AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';

interface ListeYeri {
    id: string;
    ad: string;
    mesafe: number | null;
    yaricapM: number;
    poligonVar: boolean;
    ayar?: YerKaydi;
}

export const mesafeMetni = (m: number | null): string => {
    if (m == null) return 'uzakta';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
};

const saatMetni = (ms: number): string => {
    const d = new Date(ms);
    const bugun = new Date();
    const saat = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (d.toDateString() === bugun.toDateString()) return saat;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${saat}`;
};

export const CamideyimAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
    const c = useCamideyim();
    const { ayarlar, durum } = c;
    const [disclosure, setDisclosure] = useState(false);
    const [izinUyarisi, setIzinUyarisi] = useState(false);
    const [acikYer, setAcikYer] = useState<string | null>(null);
    const [ekleniyor, setEkleniyor] = useState(false);

    const aktiflestir = useCallback(async () => {
        const sonuc = await c.guncelle({ aktif: true });
        if (sonuc === 'izinYok') setIzinUyarisi(true);
    }, [c]);

    const aktifDegis = useCallback(
        async (v: boolean) => {
            if (!v) {
                await c.guncelle({ aktif: false });
                return;
            }
            const arka = await Location.getBackgroundPermissionsAsync().catch(() => null);
            if (arka?.status === 'granted') {
                await aktiflestir();
            } else {
                setDisclosure(true);
            }
        },
        [c, aktiflestir]
    );

    const disclosureKabul = useCallback(async () => {
        setDisclosure(false);
        try {
            const on = await Location.requestForegroundPermissionsAsync();
            if (on?.status !== 'granted') {
                setIzinUyarisi(true);
                return;
            }
            const arka = await Location.requestBackgroundPermissionsAsync();
            if (arka?.status !== 'granted') {
                setIzinUyarisi(true);
                return;
            }
            await aktiflestir();
        } catch {
            setIzinUyarisi(true);
        }
    }, [aktiflestir]);

    const yerEkle = useCallback(async () => {
        setEkleniyor(true);
        const eklendi = await c.bulundugumYeriEkle();
        setEkleniyor(false);
        kisaBildirimGoster(
            eklendi ? 'Bulunduğunuz yer eklendi' : 'Konumunuz alınamadı; konum izni ve GPS açık mı kontrol edin.',
            !eklendi
        );
    }, [c]);


    const liste = useMemo<ListeYeri[]>(() => {
        const sonuc: ListeYeri[] = c.yakinlar.map((y) => ({
            id: y.id,
            ad: y.ad,
            mesafe: y.mesafeM,
            yaricapM: y.yaricapM,
            poligonVar: y.poligonVar,
            ayar: ayarlar.yerler[y.id],
        }));
        const var_ = new Set(sonuc.map((y) => y.id));
        const merkez = c.merkez;
        for (const [id, ayar] of Object.entries(ayarlar.yerler)) {
            if (var_.has(id)) continue;
            if (!ayar.kendi && ayar.durum === 'normal') continue;
            const mesafe =
                merkez && typeof ayar.lat === 'number' && typeof ayar.lng === 'number'
                    ? mesafeM(merkez.lat, merkez.lng, ayar.lat, ayar.lng)
                    : null;
            sonuc.push({ id, ad: ayar.ad ?? '', mesafe, yaricapM: 0, poligonVar: false, ayar });
        }
        return sonuc.sort((a, b) => (a.mesafe ?? Infinity) - (b.mesafe ?? Infinity));
    }, [c.yakinlar, c.merkez, ayarlar.yerler]);

    const bolum = (metin: string) => (
        <Text className="text-xs font-bold tracking-wider mt-6 mb-2" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );
    const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };

    if (!c.kullanilabilir) {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="mosque" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    Camideyim yalnız Android telefonlarda kullanılabilir.
                </Text>
            </View>
        );
    }

    const izinEksik = ayarlar.aktif && durum != null && durum.izin !== 'tamam';
    const modKapali = ayarlar.namazModu && durum?.namazModu && !durum.namazModu.ayarlar.etkin;

    const yerSatiri = (y: ListeYeri) => {
        const ayar = y.ayar;
        const kendi = ayar?.kendi === true;
        const haric = ayar?.durum === 'haric';
        const favori = ayar?.durum === 'favori';
        const acik = acikYer === y.id;
        const ad = y.ad || (kendi ? 'Eklediğim yer' : 'Adı bilinmeyen cami');
        const etiketler = [mesafeMetni(y.mesafe), kendi ? 'sizin yeriniz' : null, favori ? 'favori' : null, haric ? 'cami değil' : null]
            .filter(Boolean)
            .join(' · ');
        const alan = ayar?.alanM ?? (y.yaricapM > 0 ? y.yaricapM : VARSAYILAN_ALAN_M);
        return (
            <View key={y.id} className="rounded-2xl border mb-2" style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}>
                <TouchableOpacity
                    testID={`cami-${y.id}`}
                    className="flex-row items-center p-3"
                    style={{ minHeight: 56 }}
                    onPress={() => setAcikYer(acik ? null : y.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: acik }}
                    accessibilityLabel={`${ad}, ${etiketler}`}
                >
                    <View
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${haric ? renkler.metinIkincil : renkler.birincil}20` }}
                    >
                        <FontAwesome5
                            name={haric ? 'ban' : kendi ? 'home' : 'mosque'}
                            size={14}
                            color={haric ? renkler.metinIkincil : renkler.birincil}
                            solid
                        />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                            {ad}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {etiketler}
                        </Text>
                    </View>
                    {favori && <FontAwesome5 name="star" size={12} color={renkler.birincil} solid style={{ marginRight: 8 }} />}
                    <FontAwesome5 name={acik ? 'chevron-up' : 'chevron-down'} size={12} color={renkler.metinIkincil} />
                </TouchableOpacity>
                {acik && (
                    <View className="px-3 pb-3">
                        {haric ? (
                            <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }}>
                                Burada hiçbir zaman "camidesiniz" denmez.
                            </Text>
                        ) : (
                            <>
                                <View className="flex-row items-center justify-between mb-1">
                                    <View className="flex-1 pr-2">
                                        <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                            Algılama alanı
                                        </Text>
                                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                            Bu alanın içindeyseniz camide sayılırsınız
                                        </Text>
                                    </View>
                                    <SayisalSecici
                                        deger={alan}
                                        min={ALAN_MIN_M}
                                        max={ALAN_MAX_M}
                                        adim={ALAN_ADIM_M}
                                        birim="m"
                                        onChange={(v) => c.yerGuncelle(y.id, { alanM: v })}
                                        renk={renkler.birincil}
                                        aciklama={`${ad} alanı`}
                                    />
                                </View>
                                {y.poligonVar && (
                                    <Text className="text-xs mb-1" style={{ color: renkler.metinIkincil }}>
                                        {ayar?.alanM == null
                                            ? 'Şu an caminin bina sınırı kullanılıyor; alan seçerseniz onun yerine geçer.'
                                            : 'Seçtiğiniz alan bina sınırının yerine kullanılıyor.'}
                                    </Text>
                                )}
                            </>
                        )}
                        <View className="flex-row gap-2 mt-2">
                            {kendi ? (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() => c.yerSil(y.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${ad} yerini silin`}
                                >
                                    <FontAwesome5 name="trash-alt" size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        Sil
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() =>
                                        c.yerGuncelle(y.id, haric ? { durum: 'normal' } : { durum: 'haric', ad: y.ad })
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={haric ? `${ad}: geri alın` : `${ad}: cami değil`}
                                >
                                    <FontAwesome5 name={haric ? 'undo' : 'ban'} size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {haric ? 'Geri alın' : 'Cami değil'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {!haric && (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl"
                                    style={{
                                        backgroundColor: favori ? renkler.birincil : renkler.kartArkaplan,
                                        borderWidth: favori ? 0 : 1,
                                        borderColor: renkler.sinir,
                                        minHeight: 44,
                                    }}
                                    onPress={() => {
                                        const kayit = c.yakinlar.find((k) => k.id === y.id);
                                        c.yerGuncelle(
                                            y.id,
                                            favori
                                                ? { durum: 'normal' }
                                                : { durum: 'favori', ad: y.ad, ...(kayit ? { lat: kayit.lat, lng: kayit.lng } : {}) }
                                        );
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: favori }}
                                    accessibilityLabel={favori ? `${ad}: favoriden çıkarın` : `${ad}: favorilere ekleyin`}
                                >
                                    <FontAwesome5
                                        name="star"
                                        size={12}
                                        color={favori ? renkler.birincilMetin : renkler.metin}
                                        solid
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text className="text-sm font-semibold" style={{ color: favori ? renkler.birincilMetin : renkler.metin }}>
                                        {favori ? 'Favoride' : 'Favori'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const olaySatiri = (o: OlaySatiri, i: number, son: boolean) => {
        const renk = o.ton === 'uyari' ? renkler.durum.uyari : o.ton === 'iyi' ? renkler.birincil : renkler.metinIkincil;
        return (
            <View key={`${o.zamanMs}-${i}`} className="flex-row">
                <Text className="text-xs pt-1" style={{ color: renkler.metinIkincil, width: 72, fontVariant: ['tabular-nums'] }}>
                    {saatMetni(o.zamanMs)}
                </Text>
                <View className="items-center mr-2.5" style={{ width: 24 }}>
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: `${renk}26` }}>
                        <FontAwesome5 name={o.ikon} size={10} color={o.ton === 'uyari' ? renkler.metin : renk} solid />
                    </View>
                    {!son && <View style={{ flex: 1, width: 2, minHeight: 14, backgroundColor: renkler.sinir }} />}
                </View>
                <View className="flex-1 pb-3">
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        {o.baslik}
                    </Text>
                    {o.aciklama ? (
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {o.aciklama}
                        </Text>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                Bir camide namaz için durduğunuzda telefonunuz bunu kendiliğinden anlar. Konumunuz telefonunuzdan çıkmaz.
            </Text>

            <View className="p-3" style={kartStili}>
                <AyarKutusu
                    testID="camideyim-ana"
                    ikon="mosque"
                    baslik="Camideyim"
                    aciklama="Yakınınızdaki camileri izler; geçip gitmek sayılmaz"
                    deger={ayarlar.aktif}
                    onDegis={aktifDegis}
                />
                {izinEksik && (
                    <TouchableOpacity
                        testID="camideyim-izin-uyarisi"
                        className="flex-row items-center p-3.5 rounded-2xl mb-2"
                        style={{ backgroundColor: `${renkler.durum.uyari}20`, minHeight: 56 }}
                        onPress={() => Linking.openSettings().catch(() => undefined)}
                        accessibilityRole="button"
                        accessibilityLabel="Konum izni eksik. Uygulama ayarlarını açın"
                    >
                        <FontAwesome5 name="exclamation-circle" size={16} color={renkler.metin} style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                            {durum?.izin === 'arkaPlanYok'
                                ? 'Konum izni "Her zaman" olmadığı için uygulama kapalıyken algılanamaz. Ayarları açmak için dokunun.'
                                : 'Konum izni verilmediği için camiler izlenemiyor. Ayarları açmak için dokunun.'}
                        </Text>
                    </TouchableOpacity>
                )}
                {durum?.camide && (
                    <View className="flex-row items-center p-3.5 rounded-2xl mb-2" style={{ backgroundColor: `${renkler.birincil}15` }}>
                        <FontAwesome5 name="mosque" size={16} color={renkler.birincil} solid style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1 font-semibold" style={{ color: renkler.metin }}>
                            Camidesiniz · {durum.camide.ad || 'Cami'}
                        </Text>
                        <TouchableOpacity
                            className="px-3 rounded-xl items-center justify-center"
                            style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }}
                            onPress={async () => {
                                await camidenCik();
                                await c.yenile();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Camide değilim"
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                Camide değilim
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {ayarlar.aktif && (
                <>
                    {bolum('NE ZAMAN "CAMİDESİNİZ" DENİR')}
                    <View className="p-3" style={kartStili}>
                        <AyarKutusu
                            ikon="hourglass-half"
                            baslik="En az kalma süresi"
                            aciklama="Önünden geçmek ya da kısa uğramak sayılmaz"
                            sag={
                                <SayisalSecici
                                    deger={ayarlar.beklemeDk}
                                    min={BEKLEME_MIN_DK}
                                    max={BEKLEME_MAX_DK}
                                    birim="dk"
                                    onChange={(v) => c.guncelle({ beklemeDk: v })}
                                    renk={renkler.birincil}
                                    aciklama="En az kalma süresi"
                                />
                            }
                        />
                        <AyarKutusu
                            ikon="clock"
                            baslik="Yalnız vakit yakınında"
                            aciklama={`Vakit girişinden ${KAPI_ONCE_DK} dk önce → ${KAPI_SONRA_DK} dk sonra · cuma: ${KAPI_CUMA_ONCE_DK} dk önce → ${KAPI_CUMA_SONRA_DK} dk sonra. Teravih, cenaze ya da sohbet için kapatabilirsiniz.`}
                            deger={ayarlar.vakitKapisi}
                            onDegis={(v) => c.guncelle({ vakitKapisi: v })}
                        />
                    </View>

                    {bolum('CAMİDEYKEN')}
                    <View className="p-3" style={kartStili}>
                        <AyarKutusu
                            ikon="moon"
                            baslik="Namaz moduna geçin"
                            aciklama={'Telefonunuzun Modlar ekranındaki "Namaz" modu açılır'}
                            deger={ayarlar.namazModu}
                            onDegis={(v) => c.guncelle({ namazModu: v })}
                        />
                        {modKapali && (
                            <TouchableOpacity
                                className="flex-row items-center px-3.5 mb-2 rounded-2xl"
                                style={{ minHeight: 44 }}
                                onPress={() => navigation.navigate('NamazModuAyarlari')}
                                accessibilityRole="button"
                                accessibilityLabel="Namaz modu kapalı. Namaz modu ayarlarını açın"
                            >
                                <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginRight: 6 }} />
                                <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                    Namaz modu henüz açık değil. Açmak için dokunun.
                                </Text>
                                <FontAwesome5 name="chevron-right" size={11} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        )}
                        <AyarKutusu
                            ikon="volume-mute"
                            baslik="Hatırlatmalar sessiz gelsin"
                            aciklama="Muhafız bildirimi iptal edilmez; sesli anons konuşmaz, acil kanal kullanılmaz"
                            deger={ayarlar.sessiz}
                            onDegis={(v) => c.guncelle({ sessiz: v })}
                        />
                        <AyarKutusu
                            ikon="check-circle"
                            baslik={'Çıkınca "Kıldınız mı?" diye sorulsun'}
                            aciklama="Tek dokunuşla işaretleyebilirsiniz"
                            deger={ayarlar.kildimSor}
                            onDegis={(v) => c.guncelle({ kildimSor: v })}
                        />
                    </View>

                    {bolum('CAMİLER')}
                    <View className="p-3" style={kartStili}>
                        <TouchableOpacity
                            testID="yer-ekle"
                            className="flex-row items-center justify-center rounded-2xl mb-3"
                            style={{ backgroundColor: renkler.birincil, minHeight: 48, opacity: ekleniyor ? 0.6 : 1 }}
                            onPress={yerEkle}
                            disabled={ekleniyor}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: ekleniyor, busy: ekleniyor }}
                            accessibilityLabel="Bulunduğunuz yeri ekleyin"
                        >
                            <FontAwesome5 name="plus" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                Bulunduğunuz yeri ekleyin
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
                            İş yerindeki mescit, Kur'an kursu ya da namaz kıldığınız herhangi bir yer. Favoriler uzakta da olsa hep izlenir.
                        </Text>
                        {liste.length === 0 ? (
                            <Text className="text-sm text-center py-4" style={{ color: renkler.metinIkincil }}>
                                {durum?.veriVar === false
                                    ? 'Bu sürümde cami verisi yok; eklediğiniz yerler yine algılanır.'
                                    : 'Yakınınızda cami bulunamadı. Konumunuzu Konum Ayarları\'ndan kontrol edin.'}
                            </Text>
                        ) : (
                            liste.map(yerSatiri)
                        )}
                        {durum?.veriVar ? (
                            <Text className="text-[11px] mt-1" style={{ color: renkler.metinIkincil }}>
                                Cami verisi: © OpenStreetMap katkıcıları (ODbL)
                            </Text>
                        ) : null}
                    </View>
                </>
            )}

            {bolum('SON ALGILAMALAR')}
            <View className="p-4" style={kartStili} testID="son-algilamalar">
                {c.olaylar.length === 0 ? (
                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                        Henüz bir algılama yok. Bir camide vakit yakınında birkaç dakika kaldığınızda burada neden algılandığını
                        göreceksiniz.
                    </Text>
                ) : (
                    <>
                        {c.olaylar.slice(0, 12).map((o, i, d) => olaySatiri(o, i, i === d.length - 1))}
                        <TouchableOpacity
                            className="self-start justify-center"
                            style={{ minHeight: 44 }}
                            onPress={c.gunluguTemizle}
                            accessibilityRole="button"
                            accessibilityLabel="Son algılamaları temizleyin"
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                                Listeyi temizleyin
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <KonumIzniDisclosureModali
                gorunur={disclosure}
                tip="camideyim"
                onKabul={disclosureKabul}
                onReddet={() => setDisclosure(false)}
            />
            <BildirimModali
                gorunur={izinUyarisi}
                tip="bilgi"
                baslik={'"Her zaman" konum izni gerekiyor'}
                mesaj={
                    'Camideyim, uygulama kapalıyken de camide olduğunuzu anlamak için konum iznini "Her zaman" olarak ister. Ayarlardan izin verip buraya dönebilirsiniz.'
                }
                birincilEtiket="Ayarları açın"
                birincilIkon="external-link-alt"
                onBirincil={() => {
                    setIzinUyarisi(false);
                    Linking.openSettings().catch(() => undefined);
                }}
                onKapat={() => setIzinUyarisi(false)}
            />
        </ScrollView>
    );
};

export default CamideyimAyarlariSayfasi;
