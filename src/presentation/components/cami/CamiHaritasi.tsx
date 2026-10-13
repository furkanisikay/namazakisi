/**
 * Camideyim haritası (issue #297 Faz 2) — MapLibre + OpenFreeMap (anahtarsız karolar).
 *
 * Gösterilen: yakındaki camiler ve kullanıcının kendi yerleri, her birinin ALGILAMA
 * ALANI (dolgu: bina sınırı ya da daire), seçili yerin 100 m'lik UYANDIRMA çemberi
 * (kesikli — telefonun ilk uyandığı çevre) ve kullanıcının konumu. Bir yere
 * dokununca alt panel: alan (10–150 m), Favori, Cami değil / Geri alın, (kendi
 * yerinde) Sil. "Yer ekleyin": haritanın ortasına iğne, ad girilir, eklenir.
 *
 * Çizilen şekiller saf `core/cami/haritaVerisi`'nden gelir — native karar katmanıyla
 * AYNI alan kuralı (kullanıcı alanı > bina poligonu > daire). Ayar yazımı
 * `useCamideyim` üzerinden native'e gider (tek doğru kaynak SharedPreferences).
 *
 * Konum İSTENMEZ: izin zaten verilmişse kullanıcının noktası çizilir, yoksa harita
 * ayarlı konumda açılır. "© OpenStreetMap katkıcıları" atfı her zaman görünür.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import {
    Camera,
    GeoJSONSource,
    Layer,
    Map as Harita,
    type CameraRef,
    type Expression,
    type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import { useRenkler, useTema } from '../../../core/theme';
import { SayisalSecici } from '../common/SayisalSecici';
import { kisaBildirimGoster } from '../common/KisaBildirim';
import {
    HARITA_BASLANGIC_YAKINLIGI,
    HARITA_CAMI_SAYISI,
    HARITA_STILI_ACIK,
    HARITA_STILI_KOYU,
    basilanYerKimligi,
    gorunenAlanM,
    haritaKatmanlariOlustur,
    haritaYerleriniBirlestir,
    type HaritaKaynakCami,
    type HaritaYeri,
} from '../../../core/cami/haritaVerisi';
import { ALAN_ADIM_M, ALAN_MAX_M, ALAN_MIN_M } from '../../../core/cami/camiTipleri';
import { mesafeM } from '../../../core/cami/geometri';
import type { CamideyimDurumu } from '../../hooks/useCamideyim';
import * as kopru from '../../../../modules/expo-cami-geofence/src';

/** Harita kaydırıldıktan sonra yakın camiler yeniden sorgulanmadan önce beklenen süre ve mesafe. */
const SORGU_GECIKMESI_MS = 600;
const SORGU_ESIK_M = 300;
/** Alan stepper'ı: her basışta geofence yeniden kurulmasın diye yazım ertelenir. */
const ALAN_YAZIM_GECIKMESI_MS = 700;

export const mesafeYazisi = (m: number): string =>
    m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;

interface Nokta {
    lat: number;
    lng: number;
}

interface Props {
    c: CamideyimDurumu;
}

export const CamiHaritasi: React.FC<Props> = ({ c }) => {
    const renkler = useRenkler();
    const { koyuMu } = useTema();
    const kamera = useRef<CameraRef>(null);
    const [kullanici, setKullanici] = useState<Nokta | null>(null);
    const [sorguMerkezi, setSorguMerkezi] = useState<Nokta | null>(c.merkez);
    const [yakinlar, setYakinlar] = useState<HaritaKaynakCami[]>([]);
    const [seciliId, setSeciliId] = useState<string | null>(null);
    const [ekleme, setEkleme] = useState(false);
    const [eklemeAdi, setEklemeAdi] = useState('');
    const [ekleniyor, setEkleniyor] = useState(false);
    const [taslakAlan, setTaslakAlan] = useState<{ id: string; alanM: number } | null>(null);
    const gorunumMerkezi = useRef<Nokta | null>(c.merkez);
    const sorguZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
    const alanZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ilkMerkez = useRef<Nokta | null>(c.merkez);

    // Kullanıcının noktası — izin İSTENMEZ (yalnız verilmişse çizilir).
    useEffect(() => {
        let iptal = false;
        (async () => {
            try {
                const izin = await Location.getForegroundPermissionsAsync();
                if (izin?.status !== 'granted') return;
                const son = await Location.getLastKnownPositionAsync();
                if (!iptal && son?.coords) setKullanici({ lat: son.coords.latitude, lng: son.coords.longitude });
                const taze = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (!iptal && taze?.coords) setKullanici({ lat: taze.coords.latitude, lng: taze.coords.longitude });
            } catch {
                // Konum yoksa harita ayarlı konumda kalır.
            }
        })();
        return () => {
            iptal = true;
        };
    }, []);

    // Ayarlı konum sonradan gelirse ilk sorgu merkezi olsun.
    useEffect(() => {
        if (!sorguMerkezi && c.merkez) {
            setSorguMerkezi(c.merkez);
            gorunumMerkezi.current = c.merkez;
        }
    }, [c.merkez, sorguMerkezi]);

    useEffect(() => {
        if (!sorguMerkezi) return;
        let iptal = false;
        kopru
            .yakinCamiler(sorguMerkezi.lat, sorguMerkezi.lng, HARITA_CAMI_SAYISI)
            .then((liste) => {
                if (!iptal) setYakinlar(liste);
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, [sorguMerkezi]);

    useEffect(
        () => () => {
            if (sorguZamanlayici.current) clearTimeout(sorguZamanlayici.current);
            if (alanZamanlayici.current) clearTimeout(alanZamanlayici.current);
        },
        []
    );

    const bolgeDegisti = useCallback((e: NativeSyntheticEvent<ViewStateChangeEvent>) => {
        const merkez = e?.nativeEvent?.center;
        if (!Array.isArray(merkez)) return;
        const yeni = { lat: merkez[1], lng: merkez[0] };
        gorunumMerkezi.current = yeni;
        if (sorguZamanlayici.current) clearTimeout(sorguZamanlayici.current);
        sorguZamanlayici.current = setTimeout(() => {
            setSorguMerkezi((onceki) =>
                !onceki || mesafeM(onceki.lat, onceki.lng, yeni.lat, yeni.lng) > SORGU_ESIK_M ? yeni : onceki
            );
        }, SORGU_GECIKMESI_MS);
    }, []);

    const yerler = useMemo<HaritaYeri[]>(() => {
        const liste = haritaYerleriniBirlestir(yakinlar, c.ayarlar.yerler);
        if (!taslakAlan) return liste;
        return liste.map((y) => (y.id === taslakAlan.id ? { ...y, alanM: taslakAlan.alanM } : y));
    }, [yakinlar, c.ayarlar.yerler, taslakAlan]);

    const katmanlar = useMemo(() => haritaKatmanlariOlustur(yerler, ekleme ? null : seciliId), [yerler, seciliId, ekleme]);
    const secili = ekleme ? undefined : yerler.find((y) => y.id === seciliId);

    const kaynakBasildi = useCallback((e: NativeSyntheticEvent<{ features: { properties?: unknown }[] }>) => {
        const id = basilanYerKimligi(e?.nativeEvent?.features);
        if (id) setSeciliId(id);
    }, []);

    // Tema rengi ifadeleri (dekoratif dolgu/çizgi; metin daima tema token'ı).
    const turRengi = useMemo<Expression>(
        () => ['match', ['get', 'tur'], 'haric', renkler.metinIkincil, 'kendi', renkler.durum.bilgi, renkler.birincil],
        [renkler.metinIkincil, renkler.durum.bilgi, renkler.birincil]
    );
    const kullaniciVerisi = useMemo(
        () =>
            kullanici
                ? {
                      type: 'Feature' as const,
                      properties: {},
                      geometry: { type: 'Point' as const, coordinates: [kullanici.lng, kullanici.lat] },
                  }
                : null,
        [kullanici]
    );

    const alanDegis = useCallback(
        (y: HaritaYeri, alanM: number) => {
            setTaslakAlan({ id: y.id, alanM });
            if (alanZamanlayici.current) clearTimeout(alanZamanlayici.current);
            alanZamanlayici.current = setTimeout(() => {
                c.yerGuncelle(y.id, { alanM })
                    .finally(() => setTaslakAlan((t) => (t?.id === y.id ? null : t)))
                    .catch(() => undefined);
            }, ALAN_YAZIM_GECIKMESI_MS);
        },
        [c]
    );

    const favoriDegis = useCallback(
        (y: HaritaYeri) => {
            c.yerGuncelle(
                y.id,
                // Favori uzaktayken de izlenir → konum ve ad anlık görüntüsü saklanır.
                y.favori ? { durum: 'normal' } : { durum: 'favori', ad: y.ad, lat: y.lat, lng: y.lng }
            ).catch(() => undefined);
        },
        [c]
    );

    const haricDegis = useCallback(
        (y: HaritaYeri) => {
            c.yerGuncelle(y.id, y.tur === 'haric' ? { durum: 'normal' } : { durum: 'haric', ad: y.ad }).catch(() => undefined);
        },
        [c]
    );

    const sil = useCallback(
        (y: HaritaYeri) => {
            setSeciliId(null);
            c.yerSil(y.id).catch(() => undefined);
        },
        [c]
    );

    const eklemeyiOnayla = useCallback(async () => {
        const merkez = gorunumMerkezi.current;
        if (!merkez) {
            kisaBildirimGoster('Haritanın ortası okunamadı; haritayı biraz kaydırıp yeniden deneyin.', true);
            return;
        }
        Keyboard.dismiss();
        setEkleniyor(true);
        try {
            const id = await c.yerEkle({ lat: merkez.lat, lng: merkez.lng, ad: eklemeAdi });
            setEkleme(false);
            setEklemeAdi('');
            setSeciliId(id);
            kisaBildirimGoster('Yer eklendi');
        } catch {
            kisaBildirimGoster('Yer eklenemedi; yeniden deneyin.', true);
        } finally {
            setEkleniyor(false);
        }
    }, [c, eklemeAdi]);

    const konumumaGit = useCallback(() => {
        const hedef = kullanici ?? c.merkez;
        if (!hedef) return;
        kamera.current?.flyTo({ center: [hedef.lng, hedef.lat], zoom: HARITA_BASLANGIC_YAKINLIGI, duration: 600 });
    }, [kullanici, c.merkez]);

    const baslangic = ilkMerkez.current ?? c.merkez;
    if (!baslangic) {
        return (
            <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="map-marked-alt" size={28} color={renkler.metinIkincil} />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    Haritayı açmak için önce konumunuzu Konum Ayarları'ndan belirleyin.
                </Text>
            </View>
        );
    }

    const etiketKutusu = { backgroundColor: renkler.kartArkaplan, borderRadius: 12 };
    const ikincilButon = {
        backgroundColor: renkler.arkaplan,
        borderWidth: 1,
        borderColor: renkler.sinir,
        minHeight: 44,
    };

    const panel = () => {
        if (ekleme) {
            return (
                <View testID="harita-ekleme-paneli">
                    <Text className="text-sm font-semibold mb-1" style={{ color: renkler.metin }}>
                        Yer ekleyin
                    </Text>
                    <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }}>
                        Haritayı kaydırıp iğneyi namaz kıldığınız yere getirin. İş yerindeki mescit, Kur'an kursu ya da herhangi bir yer
                        olabilir.
                    </Text>
                    <TextInput
                        value={eklemeAdi}
                        onChangeText={setEklemeAdi}
                        placeholder="Yerin adı (isteğe bağlı)"
                        placeholderTextColor={renkler.metinIkincil}
                        maxLength={60}
                        accessibilityLabel="Yerin adı"
                        className="rounded-xl px-3 mb-2"
                        style={{ minHeight: 44, borderWidth: 1, borderColor: renkler.sinir, color: renkler.metin, backgroundColor: renkler.arkaplan }}
                    />
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center rounded-2xl"
                            style={ikincilButon}
                            onPress={() => setEkleme(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Vazgeçin"
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Vazgeçin
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="harita-yeri-ekle-onay"
                            className="flex-row items-center justify-center rounded-2xl"
                            style={{ flex: 1.3, minHeight: 44, backgroundColor: renkler.birincil, opacity: ekleniyor ? 0.6 : 1 }}
                            onPress={eklemeyiOnayla}
                            disabled={ekleniyor}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: ekleniyor, busy: ekleniyor }}
                            accessibilityLabel="Buraya ekleyin"
                        >
                            <FontAwesome5 name="map-pin" size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                                Buraya ekleyin
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        if (!secili) {
            return (
                <View className="flex-row items-center" testID="harita-ipucu">
                    <FontAwesome5 name="hand-pointer" size={14} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                    <Text className="text-sm flex-1" style={{ color: renkler.metinIkincil }}>
                        Bir camiye dokunun. Renkli alan, içindeyken "camidesiniz" denen yerdir.
                    </Text>
                </View>
            );
        }
        const haric = secili.tur === 'haric';
        const kendi = secili.tur === 'kendi';
        const ad = secili.ad || (kendi ? 'Eklediğim yer' : 'Adı bilinmeyen cami');
        const referans = kullanici ?? c.merkez;
        const uzaklik = referans ? mesafeYazisi(mesafeM(referans.lat, referans.lng, secili.lat, secili.lng)) : null;
        const altYazi = [uzaklik ? `${uzaklik} uzakta` : null, kendi ? 'sizin eklediğiniz yer' : 'OpenStreetMap', haric ? 'cami değil' : null, secili.favori ? 'favori' : null]
            .filter(Boolean)
            .join(' · ');
        const renk = haric ? renkler.metinIkincil : kendi ? renkler.durum.bilgi : renkler.birincil;
        return (
            <View testID="harita-yer-paneli">
                <View className="flex-row items-center mb-2">
                    <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${renk}20` }}>
                        <FontAwesome5 name={haric ? 'ban' : kendi ? 'home' : 'mosque'} size={14} color={renk} solid />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-sm font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                            {ad}
                        </Text>
                        <Text className="text-xs" style={{ color: renkler.metinIkincil }} numberOfLines={1}>
                            {altYazi}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="w-11 h-11 items-center justify-center"
                        onPress={() => setSeciliId(null)}
                        accessibilityRole="button"
                        accessibilityLabel="Paneli kapatın"
                    >
                        <FontAwesome5 name="times" size={14} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                </View>
                {haric ? (
                    <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }}>
                        Burada hiçbir zaman "camidesiniz" denmez.
                    </Text>
                ) : (
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1 pr-2">
                            <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                Algılama alanı
                            </Text>
                            <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                {secili.alanM == null && secili.poligon
                                    ? 'Şu an bina sınırı kullanılıyor; alan seçerseniz onun yerine geçer.'
                                    : 'Bu alanın içindeyseniz camide sayılırsınız'}
                            </Text>
                        </View>
                        <SayisalSecici
                            deger={gorunenAlanM(secili)}
                            min={ALAN_MIN_M}
                            max={ALAN_MAX_M}
                            adim={ALAN_ADIM_M}
                            birim="m"
                            onChange={(v) => alanDegis(secili, v)}
                            renk={renkler.birincil}
                            aciklama={`${ad} alanı`}
                        />
                    </View>
                )}
                <View className="flex-row gap-2">
                    {kendi ? (
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center rounded-2xl"
                            style={ikincilButon}
                            onPress={() => sil(secili)}
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
                            className="flex-1 flex-row items-center justify-center rounded-2xl"
                            style={ikincilButon}
                            onPress={() => haricDegis(secili)}
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
                            style={secili.favori ? { backgroundColor: renkler.birincil, minHeight: 44 } : ikincilButon}
                            onPress={() => favoriDegis(secili)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: secili.favori }}
                            accessibilityLabel={secili.favori ? `${ad}: favoriden çıkarın` : `${ad}: favorilere ekleyin`}
                        >
                            <FontAwesome5
                                name="star"
                                size={12}
                                color={secili.favori ? renkler.birincilMetin : renkler.metin}
                                solid
                                style={{ marginRight: 6 }}
                            />
                            <Text className="text-sm font-semibold" style={{ color: secili.favori ? renkler.birincilMetin : renkler.metin }}>
                                {secili.favori ? 'Favoride' : 'Favori'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
            <View className="flex-1">
                <Harita
                    testID="cami-haritasi"
                    style={StyleSheet.absoluteFill}
                    mapStyle={koyuMu ? HARITA_STILI_KOYU : HARITA_STILI_ACIK}
                    logo={false}
                    attribution
                    attributionPosition={{ bottom: 8, right: 8 }}
                    compass={false}
                    touchPitch={false}
                    onRegionDidChange={bolgeDegisti}
                >
                    <Camera
                        ref={kamera}
                        initialViewState={{ center: [baslangic.lng, baslangic.lat], zoom: HARITA_BASLANGIC_YAKINLIGI }}
                    />
                    <GeoJSONSource id="cami-alanlari" data={katmanlar.alanlar} onPress={kaynakBasildi}>
                        <Layer
                            id="cami-alan-dolgu"
                            type="fill"
                            style={{
                                fillColor: turRengi,
                                fillOpacity: ['case', ['==', ['get', 'tur'], 'haric'], 0.08, 0.2],
                            }}
                        />
                        <Layer
                            id="cami-alan-cizgi"
                            type="line"
                            style={{ lineColor: turRengi, lineWidth: ['case', ['==', ['get', 'secili'], 1], 2.5, 1] }}
                        />
                    </GeoJSONSource>
                    <GeoJSONSource id="cami-uyandirma" data={katmanlar.uyandirma}>
                        <Layer
                            id="cami-uyandirma-cizgi"
                            type="line"
                            style={{ lineColor: renkler.metinIkincil, lineWidth: 1.2, lineDasharray: [2, 2] }}
                        />
                    </GeoJSONSource>
                    <GeoJSONSource id="cami-noktalari" data={katmanlar.noktalar} onPress={kaynakBasildi} hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                        <Layer
                            id="cami-nokta"
                            type="circle"
                            style={{
                                circleRadius: ['case', ['==', ['get', 'secili'], 1], 9, 7],
                                circleColor: turRengi,
                                circleStrokeColor: renkler.kartArkaplan,
                                circleStrokeWidth: 2,
                            }}
                        />
                        <Layer
                            id="cami-favori"
                            type="circle"
                            filter={['==', ['get', 'favori'], 1]}
                            style={{
                                circleRadius: 3.5,
                                circleColor: renkler.durum.uyari,
                                circleTranslate: [7, -7],
                                circleStrokeColor: renkler.kartArkaplan,
                                circleStrokeWidth: 1,
                            }}
                        />
                    </GeoJSONSource>
                    {kullaniciVerisi ? (
                        <GeoJSONSource id="kullanici-konumu" data={kullaniciVerisi}>
                            <Layer
                                id="kullanici-hale"
                                type="circle"
                                style={{ circleRadius: 14, circleColor: renkler.durum.bilgi, circleOpacity: 0.18 }}
                            />
                            <Layer
                                id="kullanici-nokta"
                                type="circle"
                                style={{
                                    circleRadius: 6,
                                    circleColor: renkler.durum.bilgi,
                                    circleStrokeColor: renkler.kartArkaplan,
                                    circleStrokeWidth: 2.5,
                                }}
                            />
                        </GeoJSONSource>
                    ) : null}
                </Harita>

                {/* Lejant */}
                <View className="absolute left-3 top-3 px-2.5 py-2" style={etiketKutusu} pointerEvents="none">
                    {[
                        { etiket: 'Cami', renk: renkler.birincil },
                        { etiket: 'Sizin yeriniz', renk: renkler.durum.bilgi },
                        { etiket: 'Cami değil', renk: renkler.metinIkincil },
                    ].map((l) => (
                        <View key={l.etiket} className="flex-row items-center" style={{ marginVertical: 1 }}>
                            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: l.renk }} />
                            <Text className="text-[11px]" style={{ color: renkler.metin }}>
                                {l.etiket}
                            </Text>
                        </View>
                    ))}
                    <View className="flex-row items-center" style={{ marginVertical: 1 }}>
                        <View
                            className="w-2.5 h-2.5 rounded-full mr-1.5"
                            style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: renkler.metinIkincil }}
                        />
                        <Text className="text-[11px]" style={{ color: renkler.metin }}>
                            Uyanma çevresi
                        </Text>
                    </View>
                </View>

                {/* Eylemler */}
                <View className="absolute right-3 top-3 items-end">
                    {!ekleme && (
                        <TouchableOpacity
                            testID="harita-yer-ekle"
                            className="flex-row items-center px-3.5 rounded-full mb-2"
                            style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
                            onPress={() => {
                                setSeciliId(null);
                                setEkleme(true);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Yer ekleyin"
                        >
                            <FontAwesome5 name="plus" size={12} color={renkler.birincilMetin} style={{ marginRight: 6 }} />
                            <Text className="text-xs font-bold" style={{ color: renkler.birincilMetin }}>
                                Yer ekleyin
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full items-center justify-center"
                        style={{ backgroundColor: renkler.kartArkaplan }}
                        onPress={konumumaGit}
                        accessibilityRole="button"
                        accessibilityLabel="Konumunuza gidin"
                    >
                        <FontAwesome5 name="location-arrow" size={14} color={renkler.birincil} />
                    </TouchableOpacity>
                </View>

                {/* Ekleme iğnesi: haritanın tam ortası */}
                {ekleme && (
                    <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
                        <View style={{ marginBottom: 30 }}>
                            <FontAwesome5 name="map-marker-alt" size={32} color={renkler.durum.bilgi} solid />
                        </View>
                    </View>
                )}

                {/* Atıf — MapLibre "i" düğmesine ek olarak daima görünür */}
                <View className="absolute left-3 bottom-2 px-2 py-0.5" style={etiketKutusu} pointerEvents="none">
                    <Text className="text-[10px]" style={{ color: renkler.metinIkincil }}>
                        © OpenStreetMap katkıcıları · OpenFreeMap
                    </Text>
                </View>
            </View>

            <View className="p-4" style={{ backgroundColor: renkler.kartArkaplan, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                {panel()}
            </View>
        </View>
    );
};

export default CamiHaritasi;
