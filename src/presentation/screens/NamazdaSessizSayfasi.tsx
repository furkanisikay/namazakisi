/**
 * "Namazda sessiz" — Camideyim (#297) + Namaz modu (#277) TEK sayfa (sade tasarım, Dalga 3;
 * ad sahip onaylı). Sonucu anlatan iki tetik satırı:
 *   - "Camiye girince"     → Camideyim (konumdan camide olduğunuzu anlar)
 *   - "Namaz vakitlerinde" → Namaz modunun zamanlı tetikleri (cuma hutbesi, her vakit)
 * "Camilerim" (harita) alt sayfadır; bekleme, açılış biçimi, izleme kapsamı, nasıl
 * çalışır ve son algılamalar "Ayrıntılar" katındadır (kapalı başlar). Eski iç sekme
 * çubuğu (Ayarlar | Harita | Nasıl algılanır) kalktı.
 *
 * Native ve veri davranışı DEĞİŞMEDİ: Camideyim yazımı `useCamideyim`, Namaz modu
 * `useNamazModu` (kaynak native SharedPreferences, Redux kopyası yok). "Her zaman"
 * konum izni öncesi açıklama (`KonumIzniDisclosureModali tip="camideyim"`) ve izin
 * uyarısı korunur. Rota adları (`CamideyimAyarlari`, `NamazModuAyarlari`) bu sayfayı
 * açar — derin bağlantı `namazakisi://camideyim` ve saat W3 çalışmaya devam eder.
 *
 * "Namaz vakitlerinde" anahtarı: açmak modu etkinleştirir (hiçbir tetik seçili değilse
 * cuma hutbesini açar); kapatmak zamanlı tetikleri kapatır, Camideyim modu kullanıyorsa
 * modun kendisini AÇIK bırakır (camide sessize alma çalışmaya devam etsin).
 */
import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LocalKapatmaOncesiSecim } from '../../data/local/LocalKapatmaOncesiSecim';
import { useRenkler } from '../../core/theme';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { AyarKutusu } from '../components/ayar/AyarKutusu';
import { KonumIzniDisclosureModali } from '../components/KonumIzniDisclosureModali';
import { NamazModuRehberModal } from '../components/namazModu/NamazModuRehberi';
import { useCamideyim } from '../hooks/useCamideyim';
import { useNamazModu } from '../hooks/useNamazModu';
import {
    IZLENEN_CAMI_SAYISI,
    BEKLEME_MAX_DK,
    BEKLEME_MIN_DK,
    KAPI_CUMA_ONCE_DK,
    KAPI_CUMA_SONRA_DK,
    KAPI_ONCE_DK,
    KAPI_SONRA_DK,
    type YerKaydi,
} from '../../core/cami/camiTipleri';
import { SinirAyari } from '../components/cami/SinirAyari';
import { YakinCamilerOnizlemesi } from '../components/cami/YakinCamilerOnizlemesi';
import { mesafeKmYaz, mesafeM } from '../../core/cami/geometri';
import { bicim, metin, sayili } from '../../core/dil/aktifDil';
import type { Sozluk } from '../../core/dil/sozluk/tr';
import { useMetin } from '../hooks/useMetin';
import type { OlaySatiri } from '../../core/cami/olayMetinleri';
import { camidenCik } from '../../../modules/expo-cami-geofence/src';
import { SecenekCipleri, type Secenek } from '../components/cami/SecenekCipleri';
import { guvenOrnekleriOlustur } from '../../core/cami/guvenOrnekleri';
import type { AcilisBicimi, IzlemeKapsami } from '../../core/cami/guvenPuani';
import {
    CUMA_HUTBE_SURESI_DK,
    VAKIT_SURE_ADIM_DK,
    VAKIT_SURE_MAX_DK,
    VAKIT_SURE_MIN_DK,
} from '../../core/namazModu/namazModuPlani';
import { camideyimOzetiOlustur } from '../hooks/useCamideyimOzeti';
import { AnahtarSatiri } from '../components/ortak/AnahtarSatiri';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { DurumSatiri } from '../components/ortak/DurumSatiri';
import { NotSatiri } from '../components/ortak/NotSatiri';
import { IkonCipi } from '../components/ortak/IkonCipi';

interface ListeYeri {
    id: string;
    ad: string;
    mesafe: number | null;
    yaricapM: number;
    poligonVar: boolean;
    ayar?: YerKaydi;
}

type Navigasyon = { navigate: (ekran: string) => void };

export const mesafeMetni = (m: number | null): string => (m == null ? metin().cami.yer.uzakta : mesafeKmYaz(m));

const saatMetni = (ms: number): string => {
    const d = new Date(ms);
    const bugun = new Date();
    const saat = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (d.toDateString() === bugun.toDateString()) return saat;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${saat}`;
};

type SessizMetinleri = Sozluk['cami']['sessiz'];

const acilisSecenekleri = (t: SessizMetinleri): readonly Secenek<AcilisBicimi>[] => [
    { deger: 'akilli', etiket: t.acilisAkilli, ikon: 'magic' },
    { deger: 'otomatik', etiket: t.acilisOtomatik, ikon: 'bolt' },
    { deger: 'sorarak', etiket: t.acilisSorarak, ikon: 'question' },
];

const acilisAciklamasi = (t: SessizMetinleri, b: AcilisBicimi): string =>
    b === 'akilli' ? t.acilisAkilliAciklama : b === 'otomatik' ? t.acilisOtomatikAciklama : t.acilisSorarakAciklama;

const kapsamSecenekleri = (t: SessizMetinleri): readonly Secenek<IzlemeKapsami>[] => [
    { deger: 'yakindakiler', etiket: t.kapsamYakin, ikon: 'mosque' },
    { deger: 'secilenler', etiket: t.kapsamSecilen, ikon: 'star' },
];

const nasilCalisir = (t: SessizMetinleri) => [
    { ikon: 'hourglass-half', metin: t.nasil1 },
    { ikon: 'crosshairs', metin: t.nasil2 },
    { ikon: 'balance-scale', metin: t.nasil3 },
];

/** Küçük ikonlu sayı çipi (ör. ★ 2) — "·" ayraçlı metin yerine. */
const SayiCipi: React.FC<{ ikon: string; sayi: number }> = ({ ikon, sayi }) => {
    const renkler = useRenkler();
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                backgroundColor: `${renkler.birincil}18`,
            }}
        >
            <FontAwesome5 name={ikon} size={10} color={renkler.birincil} solid style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: renkler.metin }}>{sayi}</Text>
        </View>
    );
};

export const NamazdaSessizSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const metinler = useMetin().cami;
    const t = metinler.sessiz;
    const my = metinler.yer;
    const navigation = useNavigation() as unknown as Navigasyon;
    const c = useCamideyim();
    const m = useNamazModu();
    const { ayarlar, durum } = c;
    const [disclosure, setDisclosure] = useState(false);
    const [izinUyarisi, setIzinUyarisi] = useState(false);
    const [acikYer, setAcikYer] = useState<string | null>(null);
    const [ekleniyor, setEkleniyor] = useState(false);
    const [ayrinti, setAyrinti] = useState(false);

    // Camilerim alt sayfası kancanın AYRI bir örneğini kullanır (favori/kendi yer/"cami
    // değil" orada yazılır) → geri dönünce native'den tazele; bellekteki bayat kopya
    // hem ekranda yanlış görünür hem de bir sonraki yazımın tabanı olurdu.
    const ilkOdak = useRef(true);
    const camiYenile = c.yenile;
    const modYenile = m.yenile;
    useFocusEffect(
        useCallback(() => {
            if (ilkOdak.current) {
                ilkOdak.current = false;
                return;
            }
            void camiYenile().catch(() => undefined);
            void modYenile().catch(() => undefined);
        }, [camiYenile, modYenile])
    );

    const aktiflestir = useCallback(async () => {
        const sonuc = await c.guncelle({ aktif: true });
        if (sonuc === 'izinYok') setIzinUyarisi(true);
    }, [c]);

    const camiyeGirince = useCallback(
        async (v: boolean) => {
            if (!v) {
                await c.guncelle({ aktif: false });
                // İki tetik de kapalıyken mod kuralı "etkin" kalmasın (zamanlı tetiği olmayan
                // etkin mod yalnız camide işe yarıyordu).
                if (m.ayarlar.etkin && !m.ayarlar.cuma && !m.ayarlar.vakit) await m.guncelle({ etkin: false });
                return;
            }
            const arka = await Location.getBackgroundPermissionsAsync().catch(() => null);
            if (arka?.status === 'granted') {
                await aktiflestir();
            } else {
                setDisclosure(true);
            }
        },
        [c, m, aktiflestir]
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

    // ── Namaz vakitlerinde (Namaz modunun zamanlı tetikleri) ──
    const mod = m.ayarlar;
    const vakitlerdeAcik = mod.etkin && (mod.cuma || mod.vakit);
    const camideModKullanilir = ayarlar.aktif && ayarlar.namazModu;
    const namazVakitlerinde = useCallback(
        async (v: boolean) => {
            if (v) {
                // Kapatmadan önceki tetik seçimi geri gelir; hiç yoksa cuma hutbesiyle başlar.
                const once = await LocalKapatmaOncesiSecim.oku('namazVakitlerinde');
                const tetik =
                    once && (once.cuma || once.vakit)
                        ? { cuma: once.cuma, vakit: once.vakit }
                        : mod.cuma || mod.vakit
                          ? { cuma: mod.cuma, vakit: mod.vakit }
                          : { cuma: true, vakit: false };
                await m.guncelle({ etkin: true, ...tetik });
                return;
            }
            await LocalKapatmaOncesiSecim.yaz('namazVakitlerinde', { cuma: mod.cuma, vakit: mod.vakit });
            // Camide mod kullanılıyorsa kural etkin kalır, yalnız zamanlı tetikler kapanır;
            // değilse tümden kapanır (tetikler de sıfırlanır: sonradan "Camiye girince" modu
            // açarsa eski cuma/vakit tetikleri kendiliğinden dirilmesin).
            await m.guncelle(camideModKullanilir ? { cuma: false, vakit: false } : { etkin: false, cuma: false, vakit: false });
        },
        [m, mod.cuma, mod.vakit, camideModKullanilir]
    );

    const yerEkle = useCallback(async () => {
        setEkleniyor(true);
        const eklendi = await c.bulundugumYeriEkle();
        setEkleniyor(false);
        kisaBildirimGoster(eklendi ? t.yerEklendi : t.yerEklenemedi, !eklendi);
    }, [c, t]);

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

    const secilenSayisi = Object.values(ayarlar.yerler).filter((y) => y.kendi || y.durum === 'favori').length;
    const yerSay = (kosul: (y: YerKaydi) => boolean) => Object.values(ayarlar.yerler).filter(kosul).length;
    const favoriSayisi = yerSay((y) => y.durum === 'favori');
    const kendiSayisi = yerSay((y) => y.kendi === true);
    // Ekran okuyucu metni; ekranda sayılar ikonlu çip olarak çizilir ("·" ayracı YOK), ikisi 0 ise hiç.
    const haritaOzeti = [favoriSayisi > 0 ? sayili(t.favoriSayisi, favoriSayisi) : null, kendiSayisi > 0 ? sayili(t.kendiSayisi, kendiSayisi) : null]
        .filter(Boolean)
        .join(', ');
    const ornekler = guvenOrnekleriOlustur(ayarlar);
    const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };
    const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

    if (!c.kullanilabilir) {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="mosque" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    {t.yok}
                </Text>
            </View>
        );
    }

    const izinEksik = ayarlar.aktif && durum != null && durum.izin !== 'tamam';
    const erisimYok = mod.etkin && m.durum != null && !m.durum.erisim;
    const modKapali = ayarlar.namazModu && m.durum != null && !mod.etkin;
    const ozet = camideyimOzetiOlustur(ayarlar, durum);
    const vakitlerdeOzet = !vakitlerdeAcik
        ? metinler.ozet.kapali
        : [mod.cuma ? t.cumaHutbesi : null, mod.vakit ? bicim(t.herVakit, { dk: mod.vakitSureDk }) : null].filter(Boolean).join(', ');

    const yerSatiri = (y: ListeYeri) => {
        const ayar = y.ayar;
        const kendi = ayar?.kendi === true;
        const haric = ayar?.durum === 'haric';
        const favori = ayar?.durum === 'favori';
        const acik = acikYer === y.id;
        const ad = y.ad || (kendi ? metinler.eklenenYer : metinler.adsizCami);
        const etiketler = [mesafeMetni(y.mesafe), kendi ? my.sizinYeriniz : null, favori ? my.favori : null, haric ? my.camiDegil : null]
            .filter(Boolean)
            .join(', ');
        return (
            <View key={y.id} className="rounded-2xl border mb-2" style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}>
                <TouchableOpacity
                    testID={`cami-${y.id}`}
                    className="flex-row items-center p-3"
                    style={{ minHeight: 56 }}
                    onPress={() => setAcikYer(acik ? null : y.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: acik }}
                    accessibilityLabel={bicim(my.etiketErisim, { ad, etiketler })}
                >
                    <IkonCipi ikon={haric ? 'ban' : kendi ? 'home' : 'mosque'} boyut="kucuk" soluk={haric} />
                    <View className="flex-1 px-3">
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
                                {my.hicbirZaman}
                            </Text>
                        ) : (
                            // Harita paneliyle AYNI bileşen: tek metre stepper'ı eskiden poligonu
                            // sessizce daireye çeviriyor, geri dönüş yolu bırakmıyordu.
                            <SinirAyari
                                girdi={{
                                    poligonVar: y.poligonVar,
                                    yaricapM: y.yaricapM,
                                    alanM: ayar?.alanM ?? null,
                                    olcek: ayar?.olcek ?? null,
                                    kendi,
                                }}
                                ad={ad}
                                onDegistir={(d) => {
                                    c.yerGuncelle(y.id, d).catch(() => undefined);
                                }}
                                testIDOnEki={`liste-sinir-${y.id}`}
                            />
                        )}
                        <View className="flex-row gap-2 mt-2">
                            {kendi ? (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() => c.yerSil(y.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel={bicim(my.silErisim, { ad })}
                                >
                                    <FontAwesome5 name="trash-alt" size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {my.sil}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-center rounded-2xl border"
                                    style={{ borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan, minHeight: 44 }}
                                    onPress={() => c.yerGuncelle(y.id, haric ? { durum: 'normal' } : { durum: 'haric', ad: y.ad })}
                                    accessibilityRole="button"
                                    accessibilityLabel={bicim(haric ? my.geriAlErisim : my.camiDegilErisim, { ad })}
                                >
                                    <FontAwesome5 name={haric ? 'undo' : 'ban'} size={12} color={renkler.metin} style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {haric ? my.geriAlin : my.camiDegilDugme}
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
                                    accessibilityLabel={bicim(favori ? my.favoridenCikarin : my.favorilereEkleyin, { ad })}
                                >
                                    <FontAwesome5 name="star" size={12} color={favori ? renkler.birincilMetin : renkler.metin} solid style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-semibold" style={{ color: favori ? renkler.birincilMetin : renkler.metin }}>
                                        {favori ? my.favoride : my.favoriDugme}
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
        const renk = o.ton === 'uyari' ? renkler.dikkat : o.ton === 'iyi' ? renkler.birincil : renkler.metinIkincil;
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
        <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={{ fontSize: 15, marginBottom: 14, color: renkler.metin }}>
                    {t.giris}
                </Text>

                {/* ── İki tetik ── */}
                <View style={[kartStili, { paddingHorizontal: 16, paddingVertical: 4 }]}>
                    <AnahtarSatiri
                        ikon="mosque"
                        baslik={t.camiyeGirince}
                        ozet={ozet.cami}
                        deger={ayarlar.aktif}
                        onDegistir={(v) => void camiyeGirince(v)}
                        testID="camideyim-ana"
                    />
                    <View style={ayrac}>
                        <AnahtarSatiri
                            ikon="clock"
                            baslik={t.namazVakitlerinde}
                            ozet={vakitlerdeOzet}
                            deger={vakitlerdeAcik}
                            onDegistir={(v) => void namazVakitlerinde(v)}
                            testID="namaz-modu-ana"
                        />
                    </View>
                    {/* Camideyim kapalıyken de açılır: harita keşif içindir, izin istemez, izleme başlatmaz. */}
                    <View style={ayrac}>
                        <TouchableOpacity
                            testID="camilerim"
                            onPress={() => navigation.navigate('Camilerim')}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={haritaOzeti ? bicim(t.camilerimErisim, { ozet: haritaOzeti }) : t.camilerimErisimBos}
                            style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 10 }}
                        >
                            <IkonCipi ikon="map-marked-alt" />
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{t.camilerim}</Text>
                                {favoriSayisi > 0 || kendiSayisi > 0 ? (
                                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }} testID="camilerim-sayilari">
                                        {favoriSayisi > 0 ? <SayiCipi ikon="star" sayi={favoriSayisi} /> : null}
                                        {kendiSayisi > 0 ? <SayiCipi ikon="home" sayi={kendiSayisi} /> : null}
                                    </View>
                                ) : null}
                            </View>
                            <FontAwesome5 name="chevron-right" size={13} color={renkler.metinIkincil} style={{ marginHorizontal: 8 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Görsel anlatı: yakındaki camilerin mini önizlemesi (dokununca harita). */}
                <YakinCamilerOnizlemesi merkez={c.merkez} onAc={() => navigation.navigate('Camilerim')} />

                {/* ── Durum: düzeltilebilir sorunlar sebep + tek düğme ── */}
                {izinEksik ? (
                    <DurumSatiri
                        testID="camideyim-izin-uyarisi"
                        style={{ marginTop: 12 }}
                        durum={{
                            tip: 'uyari',
                            metin:
                                durum?.izin === 'arkaPlanYok'
                                    ? t.izinArkaPlan
                                    : t.izinGenel,
                            eylem: 'uygulamaAyarlari',
                        }}
                        onEylem={() => Linking.openSettings().catch(() => undefined)}
                    />
                ) : null}
                {erisimYok ? (
                    <DurumSatiri
                        testID="namaz-modu-erisim-uyarisi"
                        style={{ marginTop: 12 }}
                        durum={{ tip: 'uyari', metin: t.erisimYok, eylem: 'dnd' }}
                        onEylem={() => m.rehberiAc()}
                    />
                ) : null}
                {modKapali ? (
                    <DurumSatiri
                        testID="namaz-modu-kapali"
                        style={{ marginTop: 12 }}
                        durum={{
                            tip: 'bilgi',
                            metin: t.modKapali,
                            eylem: 'dnd',
                            eylemEtiketi: t.acin,
                        }}
                        onEylem={() => m.guncelle({ etkin: true })}
                    />
                ) : null}

                {durum?.camide ? (
                    <View className="flex-row items-center p-3.5 rounded-2xl mt-3" style={{ backgroundColor: `${renkler.birincil}15` }}>
                        <FontAwesome5 name="mosque" size={16} color={renkler.birincil} solid style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1 font-semibold" style={{ color: renkler.metin }}>
                            {bicim(t.camidesiniz, { ad: durum.camide.ad || metinler.camiVarsayilan })}
                        </Text>
                        <TouchableOpacity
                            className="px-3 rounded-xl items-center justify-center"
                            style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }}
                            onPress={async () => {
                                await camidenCik();
                                await c.yenile();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={t.camideDegilim}
                        >
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                {t.camideDegilim}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                {durum?.soru && !durum.camide ? (
                    <View className="p-3.5 rounded-2xl mt-3" style={{ backgroundColor: `${renkler.bilgi}15` }} testID="camideyim-soru">
                        <View className="flex-row items-center mb-2">
                            <FontAwesome5 name="question-circle" size={16} color={renkler.bilgi} solid style={{ marginRight: 10 }} />
                            <Text className="text-sm flex-1 font-semibold" style={{ color: renkler.metin }}>
                                {bicim(t.camideMisiniz, { ad: durum.soru.yer.ad || metinler.camiVarsayilan })}
                            </Text>
                        </View>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="flex-1 items-center justify-center rounded-xl"
                                style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan }}
                                onPress={() => c.soruyuCevapla(false)}
                                accessibilityRole="button"
                                accessibilityLabel={t.hayirErisim}
                            >
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    {t.hayir}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-xl"
                                style={{ flex: 1.4, minHeight: 44, backgroundColor: renkler.birincil }}
                                onPress={() => c.soruyuCevapla(true)}
                                accessibilityRole="button"
                                accessibilityLabel={ayarlar.namazModu ? t.namazModunuAcin : t.evetCamideyim}
                            >
                                <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                    {ayarlar.namazModu ? t.namazModunuAcin : t.evetCamideyim}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {/* ── Ayrıntılar (kapalı başlar) ── */}
                <TouchableOpacity
                    testID="sessiz-ayrintilar"
                    onPress={() => setAyrinti((a) => !a)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: ayrinti }}
                    accessibilityLabel={t.ayrintilar}
                    style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, marginTop: 20 }}
                >
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{t.ayrintilar}</Text>
                    <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginRight: 8 }}>{t.ayrintilarOzet}</Text>
                    <FontAwesome5 name={ayrinti ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
                </TouchableOpacity>

                {ayrinti ? (
                    <View>
                        {ayarlar.aktif ? (
                            <>
                                <BolumBasligi metin={t.camideyken} style={{ marginTop: 8 }} />
                                <View className="p-3" style={kartStili}>
                                    <AyarKutusu
                                        ikon="moon"
                                        baslik={t.sessizeAlin}
                                        aciklama={t.sessizeAlinAciklama}
                                        deger={ayarlar.namazModu}
                                        onDegis={(v) => c.guncelle({ namazModu: v })}
                                    />
                                    <AyarKutusu
                                        ikon="volume-mute"
                                        baslik={t.hatirlatmaSessiz}
                                        aciklama={t.hatirlatmaSessizAciklama}
                                        deger={ayarlar.sessiz}
                                        onDegis={(v) => c.guncelle({ sessiz: v })}
                                    />
                                    <AyarKutusu
                                        ikon="check-circle"
                                        baslik={t.kildimSor}
                                        aciklama={t.kildimSorAciklama}
                                        deger={ayarlar.kildimSor}
                                        onDegis={(v) => c.guncelle({ kildimSor: v })}
                                    />
                                </View>

                                <BolumBasligi metin={t.neZaman} style={{ marginTop: 20 }} />
                                <View className="p-3" style={kartStili}>
                                    <AyarKutusu
                                        ikon="hourglass-half"
                                        baslik={t.enAzKalma}
                                        aciklama={t.gecmekSayilmaz}
                                        sag={
                                            <SayisalSecici
                                                deger={ayarlar.beklemeDk}
                                                min={BEKLEME_MIN_DK}
                                                max={BEKLEME_MAX_DK}
                                                birim={t.dk}
                                                onChange={(v) => c.guncelle({ beklemeDk: v })}
                                                renk={renkler.birincil}
                                                aciklama={t.enAzKalma}
                                            />
                                        }
                                    />
                                    <AyarKutusu
                                        ikon="clock"
                                        baslik={t.vakitYakininda}
                                        aciklama={bicim(t.vakitYakinindaAciklama, { once: KAPI_ONCE_DK, sonra: KAPI_SONRA_DK, cumaOnce: KAPI_CUMA_ONCE_DK, cumaSonra: KAPI_CUMA_SONRA_DK })}
                                        deger={ayarlar.vakitKapisi}
                                        onDegis={(v) => c.guncelle({ vakitKapisi: v })}
                                    />
                                    <View className="px-1 pt-2 pb-1" testID="acilis-bicimi">
                                        <Text className="text-sm font-semibold mb-2" style={{ color: renkler.metin }}>
                                            {t.nasilAcilsin}
                                        </Text>
                                        <SecenekCipleri
                                            secenekler={acilisSecenekleri(t)}
                                            secili={ayarlar.acilisBicimi}
                                            onSec={(v) => c.guncelle({ acilisBicimi: v })}
                                            grupEtiketi={t.acilisBicimi}
                                            testIDOnEki="acilis"
                                        />
                                        <Text style={{ fontSize: 14, marginTop: 8, color: renkler.metin }}>
                                            {acilisAciklamasi(t, ayarlar.acilisBicimi)}
                                        </Text>
                                    </View>
                                </View>

                                <BolumBasligi metin={t.hangiCamiler} style={{ marginTop: 20 }} />
                                <View className="p-3" style={kartStili} testID="izleme-kapsami">
                                    <SecenekCipleri
                                        secenekler={kapsamSecenekleri(t)}
                                        secili={ayarlar.izlemeKapsami}
                                        onSec={(v) => c.guncelle({ izlemeKapsami: v })}
                                        grupEtiketi={t.izlemeKapsami}
                                        testIDOnEki="kapsam"
                                    />
                                    <Text style={{ fontSize: 14, marginTop: 8, color: renkler.metin }}>
                                        {ayarlar.izlemeKapsami === 'secilenler'
                                            ? t.secilenlerAciklama
                                            : bicim(t.yakinlarAciklama, { n: IZLENEN_CAMI_SAYISI })}
                                    </Text>
                                    {ayarlar.izlemeKapsami === 'secilenler' && secilenSayisi === 0 ? (
                                        <NotSatiri tip="uyari" metin={t.seciliYok} style={{ marginTop: 8 }} />
                                    ) : null}
                                </View>

                                <BolumBasligi metin={t.yakindakiCamiler} style={{ marginTop: 20 }} />
                                <View className="p-3" style={kartStili}>
                                    <TouchableOpacity
                                        testID="yer-ekle"
                                        className="flex-row items-center justify-center rounded-2xl mb-3"
                                        style={{ backgroundColor: renkler.birincil, minHeight: 48, opacity: ekleniyor ? 0.6 : 1 }}
                                        onPress={yerEkle}
                                        disabled={ekleniyor}
                                        accessibilityRole="button"
                                        accessibilityState={{ disabled: ekleniyor, busy: ekleniyor }}
                                        accessibilityLabel={t.yeriEkleyin}
                                    >
                                        <FontAwesome5 name="plus" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                                        <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                            {t.yeriEkleyin}
                                        </Text>
                                    </TouchableOpacity>
                                    {liste.length === 0 ? (
                                        <Text className="text-sm text-center py-4" style={{ color: renkler.metinIkincil }}>
                                            {durum?.veriVar === false
                                                ? my.veriYok
                                                : t.camiBulunamadi}
                                        </Text>
                                    ) : (
                                        liste.map(yerSatiri)
                                    )}
                                    {durum?.veriVar ? (
                                        <Text className="text-[11px] mt-1" style={{ color: renkler.metinIkincil }}>
                                            {t.atif}
                                        </Text>
                                    ) : null}
                                </View>
                            </>
                        ) : null}

                        {mod.etkin ? (
                            <>
                                <BolumBasligi metin={t.namazVakitlerinde} style={{ marginTop: 20 }} />
                                <View className="p-3" style={kartStili}>
                                    <AyarKutusu
                                        ikon="mosque"
                                        baslik={t.cumaHutbesi}
                                        aciklama={bicim(t.cumaHutbesiAciklama, { dk: CUMA_HUTBE_SURESI_DK })}
                                        deger={mod.cuma}
                                        onDegis={(v) => m.guncelle({ cuma: v })}
                                    />
                                    <AyarKutusu
                                        ikon="clock"
                                        baslik={t.herVakitBaslik}
                                        aciklama={bicim(t.herVakitAciklama, { dk: mod.vakitSureDk })}
                                        deger={mod.vakit}
                                        onDegis={(v) => m.guncelle({ vakit: v })}
                                    />
                                    {mod.vakit ? (
                                        <AyarKutusu
                                            ikon="hourglass-half"
                                            baslik={t.sure}
                                            sag={
                                                <SayisalSecici
                                                    deger={mod.vakitSureDk}
                                                    min={VAKIT_SURE_MIN_DK}
                                                    max={VAKIT_SURE_MAX_DK}
                                                    adim={VAKIT_SURE_ADIM_DK}
                                                    birim={t.dk}
                                                    onChange={(v) => m.guncelle({ vakitSureDk: v })}
                                                    renk={renkler.birincil}
                                                    aciklama={t.modSuresi}
                                                />
                                            }
                                        />
                                    ) : null}
                                    <AyarKutusu
                                        ikon="check-circle"
                                        baslik={t.kildimKapat}
                                        aciklama={t.kildimKapatAciklama}
                                        deger={mod.kildimKapat}
                                        onDegis={(v) => m.guncelle({ kildimKapat: v })}
                                    />
                                    {m.durum?.destek !== 'filtre' ? (
                                        <TouchableOpacity
                                            className="flex-row items-center justify-center rounded-2xl mt-2"
                                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 48 }}
                                            onPress={m.modAyarlariniAc}
                                            accessibilityRole="button"
                                            accessibilityLabel={t.modAyarlari}
                                        >
                                            <FontAwesome5 name="external-link-alt" size={12} color={renkler.metin} style={{ marginRight: 8 }} />
                                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                                {t.modAyarlari}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                                <NotSatiri metin={t.elleKapatma} style={{ marginTop: 8 }} />
                            </>
                        ) : null}

                        {ayarlar.aktif ? (
                            <>
                                <BolumBasligi metin={t.nasilCalisir} style={{ marginTop: 20 }} />
                                <View className="p-4" style={kartStili} testID="nasil-algilanir">
                                    {nasilCalisir(t).map((m2) => (
                                        <NotSatiri key={m2.ikon} ikon={m2.ikon} metin={m2.metin} />
                                    ))}
                                    <NotSatiri ikon="lock" metin={t.konumCikmaz} />
                                </View>

                                <BolumBasligi metin={t.sizinAyarlarinizla} style={{ marginTop: 20 }} />
                                <View className="p-3" style={kartStili} testID="guven-ornekleri">
                                    {ornekler.map((o) => (
                                        <View
                                            key={o.id}
                                            className="flex-row items-center py-2"
                                            accessible
                                            accessibilityLabel={bicim(t.ornekErisim, { baslik: o.baslik, eylem: o.olculmez ? t.olculmezErisim : metinler.eylem[o.eylem] })}
                                        >
                                            <FontAwesome5 name={o.ikon} size={13} color={renkler.metinIkincil} style={{ width: 22, textAlign: 'center', marginRight: 8 }} />
                                            <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                                                {o.baslik}
                                            </Text>
                                            <View
                                                className="px-2.5 py-1 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        o.eylem === 'otomatik'
                                                            ? `${renkler.birincil}20`
                                                            : o.eylem === 'sor'
                                                              ? `${renkler.bilgi}20`
                                                              : `${renkler.metinIkincil}20`,
                                                }}
                                            >
                                                <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                                    {o.olculmez ? t.olculmez : metinler.eylem[o.eylem]}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <BolumBasligi metin={t.sonAlgilamalar} style={{ marginTop: 20 }} />
                                <View className="p-4" style={kartStili} testID="son-algilamalar">
                                    {c.olaylar.length === 0 ? (
                                        <Text style={{ fontSize: 14, color: renkler.metinIkincil }}>
                                            {t.algilamaYok}
                                        </Text>
                                    ) : (
                                        <>
                                            {c.olaylar.slice(0, 12).map((o, i, d) => olaySatiri(o, i, i === d.length - 1))}
                                            <TouchableOpacity
                                                className="self-start justify-center"
                                                style={{ minHeight: 44 }}
                                                onPress={c.gunluguTemizle}
                                                accessibilityRole="button"
                                                accessibilityLabel={t.temizleErisim}
                                            >
                                                <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                                                    {t.temizle}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>

            <KonumIzniDisclosureModali gorunur={disclosure} tip="camideyim" onKabul={disclosureKabul} onReddet={() => setDisclosure(false)} />
            <BildirimModali
                gorunur={izinUyarisi}
                tip="bilgi"
                baslik={t.herZamanBaslik}
                mesaj={t.herZamanMesaj}
                birincilEtiket={t.ayarlariAcin}
                birincilIkon="external-link-alt"
                onBirincil={() => {
                    setIzinUyarisi(false);
                    Linking.openSettings().catch(() => undefined);
                }}
                onKapat={() => setIzinUyarisi(false)}
            />
            <NamazModuRehberModal gorunur={m.rehberGorunur} onAc={m.erisimAyariniAc} onKapat={m.rehberiKapat} />
        </View>
    );
};

export default NamazdaSessizSayfasi;
