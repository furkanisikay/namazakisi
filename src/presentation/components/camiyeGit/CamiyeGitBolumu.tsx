/**
 * "Camide kılacağım" ayar bölümü (issue #292) — Bildirim Ayarları sayfasında,
 * cuma kartının hemen altında.
 *
 * Neden ortak `PencereKarti` DEĞİL: o kart bir vaktin adım dizisini (eşik +
 * sıklık) çizer; burada ise beş vakit için TEK ortak ofset (yürüme + hazırlık)
 * ve vakit başına aç/kapa vardır, tekrar yoktur. Pencere tanımına zorlamak beş
 * ayrı tek adımlı kart demek olurdu — en basit kullanım ilkesine aykırı.
 *
 * Yürüme süresi kaynağı:
 *  - Camideyim (yalnız Android, köprülü build) favori camisi varsa → kayıtlı
 *    konumdan kuş uçuşu mesafeyle TAHMİN (`core/camiyeGit/yurumeSuresi`). Tek
 *    doğru kaynak native `CamiDepo`dur; burada Redux kopyası AÇILMAZ, her
 *    açılışta köprüden okunur.
 *  - Kullanıcı stepper'a dokunursa kaynak `elle` olur: KALICI ve ÖNCELİKLİ,
 *    tahmin onu bir daha ezmez (yalnız "Favori caminize göre hesaplayın" ile).
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { camiyeGitAyariniGuncelle, camiyeGitAyarlariniYukle } from '../../store/camiyeGitSlice';
import { Anahtar } from '../common/Anahtar';
import { SayisalSecici } from '../common/SayisalSecici';
import {
    CAMIYE_GIT_VAKITLERI,
    HAZIRLIK_ADIM_DK,
    HAZIRLIK_MAX_DK,
    HAZIRLIK_MIN_DK,
    YURUME_MAX_DK,
    YURUME_MIN_DK,
    type CamiyeGitAyarlari,
    type CamiyeGitVakti,
} from '../../../core/camiyeGit/camiyeGitAyarlari';
import { enYakinFavoriCami, type FavoriCami } from '../../../core/camiyeGit/yurumeSuresi';
import { camideyimAyarlariniNormalize } from '../../../core/cami/camideyimAyarlari';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import * as camiKoprusu from '../../../../modules/expo-cami-geofence/src';

/** Stepper'a arka arkaya basmak TEK yazmaya insin (cuma bölümüyle aynı gerekçe). */
const YAZMA_GECIKMESI_MS = 1200;

type SureAlani = 'yurumeDk' | 'hazirlikDk';

/** Mesafeyi okunur yazar: 850 m · 1,2 km. */
const mesafeMetni = (m: number): string =>
    m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;

export const CamiyeGitBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ayarlar = useAppSelector((s) => s.camiyeGit.ayarlar);
    const cumaAcik = useAppSelector((s) => s.cumaHatirlatma.ayarlar.aktif);
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const lat = koordinat?.lat ?? 0;
    const lng = koordinat?.lng ?? 0;

    useEffect(() => {
        dispatch(camiyeGitAyarlariniYukle());
    }, [dispatch]);

    // ── Favori cami tahmini (yalnız Camideyim köprüsü varsa) ──
    const camideyimVar = camiKoprusu.camiModuluVarMi();
    const [favori, setFavori] = useState<FavoriCami | null>(null);
    useEffect(() => {
        if (!camideyimVar) return;
        let iptal = false;
        void camiKoprusu.ayarlariAl().then((ham) => {
            if (iptal) return;
            const yerler = camideyimAyarlariniNormalize(ham).yerler;
            setFavori(enYakinFavoriCami(yerler, { lat, lng }));
        });
        return () => {
            iptal = true;
        };
    }, [camideyimVar, lat, lng]);

    const favoriYurumeMesafesinde = favori != null && favori.yurumeDk <= YURUME_MAX_DK;

    // Tahmin, kullanıcı elle düzeltmediyse uygulanır (favori değişince tazelenir).
    useEffect(() => {
        if (!ayarlar.aktif || !favori || !favoriYurumeMesafesinde) return;
        if (ayarlar.yurumeKaynagi === 'elle') return;
        if (ayarlar.yurumeKaynagi === 'tahmin' && ayarlar.yurumeDk === favori.yurumeDk && ayarlar.camiAdi === favori.ad) {
            return;
        }
        dispatch(camiyeGitAyariniGuncelle({ yurumeDk: favori.yurumeDk, yurumeKaynagi: 'tahmin', camiAdi: favori.ad }));
    }, [dispatch, ayarlar.aktif, ayarlar.yurumeKaynagi, ayarlar.yurumeDk, ayarlar.camiAdi, favori, favoriYurumeMesafesinde]);

    // ── Süre taslağı + debounce'lu yazma ──
    const [taslak, setTaslak] = useState<Partial<Record<SureAlani, number>>>({});
    const bekleyenRef = useRef<Partial<CamiyeGitAyarlari> | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bekleyeniYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen) dispatch(camiyeGitAyariniGuncelle(bekleyen));
    }, [dispatch]);

    const sureDegistir = useCallback(
        (alan: SureAlani, deger: number) => {
            setTaslak((t) => ({ ...t, [alan]: deger }));
            bekleyenRef.current = {
                ...(bekleyenRef.current ?? {}),
                [alan]: deger,
                // Yürüme süresine dokunmak = elle düzeltme → kalıcı ve öncelikli.
                ...(alan === 'yurumeDk' ? { yurumeKaynagi: 'elle' as const } : {}),
            };
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            zamanlayiciRef.current = setTimeout(bekleyeniYaz, YAZMA_GECIKMESI_MS);
        },
        [bekleyeniYaz]
    );

    // Ekrandan çıkarken bekleyen yazma kaybolmasın.
    useEffect(() => () => bekleyeniYaz(), [bekleyeniYaz]);

    // Store diskten normalize değerle dönünce taslak düşer.
    useEffect(() => {
        if (!bekleyenRef.current) setTaslak({});
    }, [ayarlar.yurumeDk, ayarlar.hazirlikDk]);

    const yurumeDk = taslak.yurumeDk ?? ayarlar.yurumeDk;
    const hazirlikDk = taslak.hazirlikDk ?? ayarlar.hazirlikDk;
    const toplamDk = Math.max(1, yurumeDk + hazirlikDk);

    const anaAnahtar = useCallback(
        async (deger: boolean) => {
            await butonTiklandiFeedback();
            dispatch(camiyeGitAyariniGuncelle({ aktif: deger }));
        },
        [butonTiklandiFeedback, dispatch]
    );

    const vakitDegistir = useCallback(
        async (vakit: CamiyeGitVakti) => {
            await butonTiklandiFeedback();
            dispatch(camiyeGitAyariniGuncelle({ vakitler: { ...ayarlar.vakitler, [vakit]: !ayarlar.vakitler[vakit] } }));
        },
        [ayarlar.vakitler, butonTiklandiFeedback, dispatch]
    );

    const tahminiKullan = useCallback(async () => {
        if (!favori) return;
        await butonTiklandiFeedback();
        bekleyenRef.current = null;
        setTaslak({});
        dispatch(camiyeGitAyariniGuncelle({ yurumeDk: favori.yurumeDk, yurumeKaynagi: 'tahmin', camiAdi: favori.ad }));
    }, [butonTiklandiFeedback, dispatch, favori]);

    const seciliVakitSayisi = useMemo(
        () => CAMIYE_GIT_VAKITLERI.filter((v) => ayarlar.vakitler[v]).length,
        [ayarlar.vakitler]
    );

    const kaynakSatiri = (() => {
        if (ayarlar.yurumeKaynagi === 'tahmin' && ayarlar.camiAdi && taslak.yurumeDk === undefined) {
            return favori
                ? `${ayarlar.camiAdi} için tahmin (${mesafeMetni(favori.mesafeM)}). Gerekirse düzeltebilirsiniz.`
                : `${ayarlar.camiAdi} için tahmin. Gerekirse düzeltebilirsiniz.`;
        }
        if (favori && !favoriYurumeMesafesinde) {
            return `${favori.ad} yürüme mesafesinde görünmüyor (${mesafeMetni(favori.mesafeM)}); süreyi siz ayarlayın.`;
        }
        if (camideyimVar && !favori) {
            return "Camideyim'de bir camiyi favorilere eklerseniz yürüme süresi oradan hesaplanır.";
        }
        return null;
    })();

    const tahminDugmesiGorunur =
        favori != null &&
        favoriYurumeMesafesinde &&
        (ayarlar.yurumeKaynagi === 'elle' || taslak.yurumeDk !== undefined) &&
        yurumeDk !== favori.yurumeDk;

    return (
        <View className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: renkler.kartArkaplan }}>
            <View className="flex-row items-center p-4">
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${renkler.birincil}20` }}
                >
                    <FontAwesome5 name="walking" size={18} color={renkler.birincil} solid />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                        Camide kılacağım
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                        Ezandan, camiye yürüme süreniz kadar önce hatırlatalım
                    </Text>
                </View>
                <Anahtar
                    value={ayarlar.aktif}
                    onValueChange={anaAnahtar}
                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                    thumbColor={ayarlar.aktif ? renkler.birincil : '#f4f3f4'}
                    accessibilityLabel="Camide kılacağım hatırlatması"
                />
            </View>

            {ayarlar.aktif && (
                <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                    <Text className="text-xs font-semibold mt-4 mb-3" style={{ color: renkler.metinIkincil }}>
                        Hangi vakitlerde camiye gidiyorsunuz?
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {CAMIYE_GIT_VAKITLERI.map((vakit) => {
                            const secili = ayarlar.vakitler[vakit];
                            return (
                                <TouchableOpacity
                                    key={vakit}
                                    onPress={() => vakitDegistir(vakit)}
                                    className="flex-row items-center px-3 rounded-xl"
                                    style={{
                                        minHeight: 44,
                                        backgroundColor: secili ? renkler.birincil : renkler.arkaplan,
                                        borderWidth: 1,
                                        borderColor: secili ? renkler.birincil : renkler.sinir,
                                    }}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: secili }}
                                    accessibilityLabel={`${VAKIT_ADLARI[vakit]} namazı`}
                                >
                                    {secili && (
                                        <FontAwesome5
                                            name="check"
                                            size={11}
                                            color={renkler.birincilMetin}
                                            style={{ marginRight: 6 }}
                                        />
                                    )}
                                    <Text
                                        className="text-sm font-semibold"
                                        style={{ color: secili ? renkler.birincilMetin : renkler.metin }}
                                    >
                                        {VAKIT_ADLARI[vakit]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View className="flex-row items-center justify-between mt-5">
                        <View className="flex-1 mr-3">
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Yürüme süresi
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Evden camiye
                            </Text>
                        </View>
                        <SayisalSecici
                            deger={yurumeDk}
                            min={YURUME_MIN_DK}
                            max={YURUME_MAX_DK}
                            onChange={(d) => sureDegistir('yurumeDk', d)}
                            renk={renkler.birincil}
                            aciklama="Yürüme süresi"
                        />
                    </View>
                    {kaynakSatiri && (
                        <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                            {kaynakSatiri}
                        </Text>
                    )}
                    {tahminDugmesiGorunur && favori && (
                        <TouchableOpacity
                            onPress={tahminiKullan}
                            className="flex-row items-center self-start mt-2 px-3 rounded-xl"
                            style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            accessibilityRole="button"
                            accessibilityLabel={`Favori caminize göre hesaplayın: ${favori.yurumeDk} dakika`}
                        >
                            <FontAwesome5 name="map-marker-alt" size={12} color={renkler.birincil} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Favori caminize göre: {favori.yurumeDk} dk
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View className="flex-row items-center justify-between mt-5">
                        <View className="flex-1 mr-3">
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Hazırlık payı
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Abdest ve giyinme
                            </Text>
                        </View>
                        <SayisalSecici
                            deger={hazirlikDk}
                            min={HAZIRLIK_MIN_DK}
                            max={HAZIRLIK_MAX_DK}
                            adim={HAZIRLIK_ADIM_DK}
                            onChange={(d) => sureDegistir('hazirlikDk', d)}
                            renk={renkler.birincil}
                            aciklama="Hazırlık payı"
                        />
                    </View>

                    <View className="flex-row items-start mt-5 gap-2">
                        <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                        <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                            {seciliVakitSayisi === 0
                                ? 'Hiçbir vakit seçili değil; hatırlatma gönderilmez.'
                                : `Seçtiğiniz vakitlerde ezandan ${toplamDk} dk önce hatırlatılırsınız.`}
                            {cumaAcik && ayarlar.vakitler.ogle
                                ? ' Cuma günleri öğle için cuma hatırlatmanız gelir; bu hatırlatma ayrıca gönderilmez.'
                                : ''}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};
