/**
 * "Camide kılacağım" ayar bölümü (issue #292; ortak hatırlatma yüzeyleri plan §5.2) —
 * Hatırlatmalar > "Camiye gitme vakti" ayrıntı sayfasında.
 *
 * ORTAK BİLEŞEN (AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA"): beş vakit TEK
 * adım dizisini paylaşır → TEK `PencereKarti` (`stil="gomulu"`), adım detayı
 * `AdimDetayModal`, önizleme `AkisOnizlemeModal`, tanım `ekHatirlatmaPencereTanimi` —
 * muhafız, nafile ve cumayla AYNI yetenekler (1–3 adım, kanal çipleri, ses, titreşim,
 * gerçek alarm + kapsamı, tekrar, akış önizlemesi, zaman şeridi). İstisnalar (gerekçe
 * kartta yazılı): yön sabit, ton yok, anons metni bağlamdan. Vakit başına aç/kapa (çipler)
 * ve "yola çıkış süresi" (yürüme + hazırlık) kartın ÜSTÜNDE kalır.
 *
 * YOLA ÇIKIŞ SÜRESİ değişince adımların TÜMÜ aynı farkla kayar (`camiyeGitAyarlariniBirlestir`).
 * Yürüme süresi kaynağı:
 *  - Camideyim (yalnız Android, köprülü build) favori camisi varsa → kayıtlı
 *    konumdan kuş uçuşu mesafeyle TAHMİN (`core/camiyeGit/yurumeSuresi`). Tek
 *    doğru kaynak native `CamiDepo`dur; burada Redux kopyası AÇILMAZ, her
 *    açılışta köprüden okunur.
 *  - Kullanıcı stepper'a dokunursa kaynak `elle` olur: KALICI ve ÖNCELİKLİ,
 *    tahmin onu bir daha ezmez (yalnız "Favori caminize göre hesaplayın" ile).
 *
 * YAZMA DEBOUNCE'LU (cuma deseni): stepper'a arka arkaya basmak TEK yazmaya/planlamaya
 * iner; ekrandan çıkışta bekleyen yazma HEMEN uygulanır. Rıza (sesli / alarm) ilgili adım
 * yazımıyla BİRLİKTE gider. Sayıyı YAPISAL artıran değişiklik bildirim sınırı rehberinden
 * (`degisikligiDene`) geçer; salt zaman değişimi geçmez.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { Coordinates } from 'adhan';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useHesapSurumu } from '../../hooks/useHesapSurumu';
import { camiyeGitAyariniGuncelle, camiyeGitAyarlariniYukle } from '../../store/camiyeGitSlice';
import { Anahtar } from '../common/Anahtar';
import { SayisalSecici } from '../common/SayisalSecici';
import { HatirlatmaModulu, ekAdimIslemleri } from '../hatirlatma/HatirlatmaModulu';
import type { AdimRizasi } from '../hatirlatma/AdimDetayModal';
import { useGenelRiza } from '../../hooks/useGenelRiza';
import { ekHatirlatmaPencereTanimi, VAKIT_ADLARI_KUCUK } from '../hatirlatma/pencereTanimi';
import { usePlatformYetenekleri } from '../../hooks/usePlatformYetenekleri';
import { useTurkceTtsDestegi } from '../../hooks/useTurkceTtsDestegi';
import { useBildirimButcesi } from '../../hooks/useBildirimButcesi';
import { useButceRehberi } from '../../hooks/useButceRehberi';
import {
    CAMIYE_GIT_ADIM_KISITLARI,
    CAMIYE_GIT_ESIK_ADIM_DK,
    CAMIYE_GIT_ESIK_MAX_DK,
    CAMIYE_GIT_ESIK_MIN_DK,
    CAMIYE_GIT_TEKRAR_MAX_DK,
    CAMIYE_GIT_TEKRAR_MIN_DK,
    CAMIYE_GIT_VAKITLERI,
    CAMIYE_GIT_VARSAYILAN_TEKRAR_DK,
    HAZIRLIK_ADIM_DK,
    HAZIRLIK_MAX_DK,
    HAZIRLIK_MIN_DK,
    YURUME_MAX_DK,
    YURUME_MIN_DK,
    camiyeGitAyarlariniBirlestir,
    camiyeGitOncedenDk,
    type CamiyeGitAyarlari,
    type CamiyeGitVakti,
} from '../../../core/camiyeGit/camiyeGitAyarlari';
import { camiyeGitAnonsMetni, camiyeGitMetniOlustur } from '../../../core/bildirim/camiyeGitPlani';
import { adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import { enYakinFavoriCami, type FavoriCami } from '../../../core/camiyeGit/yurumeSuresi';
import { camideyimAyarlariniNormalize } from '../../../core/cami/camideyimAyarlari';
import { aktifPrayerTimes } from '../../../core/vakit/aktifHesap';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import { bicim, metin, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import * as camiKoprusu from '../../../../modules/expo-cami-geofence/src';

/** Stepper'a arka arkaya basmak TEK yazmaya insin (cuma bölümüyle aynı gerekçe). */
export const CAMIYE_GIT_YAZMA_GECIKMESI_MS = 1200;

/** Yön sabit gerekçesi (plan §3.3) — kartta seçici yerine yazılır. */
export const camiyeGitYonGerekcesi = (): string => metin().hatirlatma.camiye.yonGerekce;

type AyarNavigasyonu = { navigate: (ekran: string) => void };

/** Bu bölüm yalnız camiye gitmeyi yazar → muhafız/nafile önerisi burada UYGULANMAZ (cuma deseni). */
const oneriUygulanmaz = (): boolean => false;

/** Mesafeyi okunur yazar: 850 m · 1,2 km. */
const mesafeMetni = (m: number): string => {
    const c = metin().hatirlatma.camiye;
    if (m < 1000) return bicim(c.metre, { m: Math.round(m / 10) * 10 });
    const [tam, kesir] = (m / 1000).toFixed(1).split('.');
    return bicim(c.km, { tam, kesir });
};

/** Adım dönüşümleri (yüzey kısıtlarıyla) — modül düzeyinde, referans sabit. */
const CAMIYE_GIT_ISLEMLERI = ekAdimIslemleri<CamiyeGitAyarlari>(CAMIYE_GIT_ADIM_KISITLARI);

/**
 * Zaman şeridinin penceresi: girişi henüz gelmemiş İLK seçili vakit (bugün, yoksa yarın),
 * `[giriş − 180 dk, giriş]`. Vakit hesaplanamazsa şerit çizilmez.
 */
function siradakiPencere(
    koordinat: { lat: number; lng: number } | null | undefined,
    vakitler: CamiyeGitAyarlari['vakitler'],
    simdi: Date
): { baslangic: Date; bitis: Date; vakit: CamiyeGitVakti; bugun: boolean } | undefined {
    if (!koordinat || (koordinat.lat === 0 && koordinat.lng === 0)) return undefined;
    try {
        const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
        for (let i = 0; i < 2; i++) {
            const gun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + i);
            const pt = aktifPrayerTimes(coordinates, gun);
            const girisler: Record<CamiyeGitVakti, Date> = {
                imsak: pt.fajr,
                ogle: pt.dhuhr,
                ikindi: pt.asr,
                aksam: pt.maghrib,
                yatsi: pt.isha,
            };
            for (const vakit of CAMIYE_GIT_VAKITLERI) {
                if (!vakitler[vakit]) continue;
                const giris = girisler[vakit];
                if (giris.getTime() <= simdi.getTime()) continue;
                return {
                    baslangic: new Date(giris.getTime() - CAMIYE_GIT_ESIK_MAX_DK * 60000),
                    bitis: giris,
                    vakit,
                    bugun: i === 0,
                };
            }
        }
    } catch {
        // Vakit hesaplanamazsa şerit çizilmez (yanlış resim çizmektense hiç).
    }
    return undefined;
}

export const CamiyeGitBolumu: React.FC = () => {
    const renkler = useRenkler();
    const sozluk = useMetin();
    const mh = sozluk.hatirlatma;
    const mc = mh.camiye;
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const kayitli = useAppSelector((s) => s.camiyeGit.ayarlar);
    const cumaAcik = useAppSelector((s) => s.cumaHatirlatma.ayarlar.aktif);
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();
    const genelRiza = useGenelRiza();
    const lat = koordinat?.lat ?? 0;
    const lng = koordinat?.lng ?? 0;

    useEffect(() => {
        dispatch(camiyeGitAyarlariniYukle());
    }, [dispatch]);

    // ── Taslak + debounce'lu yazma ──
    const [taslak, setTaslak] = useState<CamiyeGitAyarlari | null>(null);
    const bekleyenRef = useRef<Partial<CamiyeGitAyarlari> | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ayarlar = taslak ?? kayitli;

    const hemenYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen) dispatch(camiyeGitAyariniGuncelle(bekleyen));
    }, [dispatch]);

    /**
     * Değişikliği taslağa yazar ve debounce'lu dispatch'i kurar (`hemen` → beklemeden).
     * Bekleyen değişiklikler BİRLEŞİR: yürüme + adım değişikliği aynı yazıma girer. Adımlar
     * yazılırken taslağın (kaydırılmış) dizisi gönderilir → slice ikinci kez kaydırmaz.
     */
    const yaz = useCallback(
        (degisiklik: Partial<CamiyeGitAyarlari>, hemen = false) => {
            const yeni = camiyeGitAyarlariniBirlestir(taslak ?? kayitli, degisiklik);
            setTaslak(yeni);
            const birlesik = { ...(bekleyenRef.current ?? {}), ...degisiklik };
            // Ofset değişikliği slice'ta adımları kaydırır; taslak zaten kaydırdıysa
            // kaydırılmış diziyi açıkça gönder (çift kayma olmasın).
            if (birlesik.yurumeDk !== undefined || birlesik.hazirlikDk !== undefined) {
                birlesik.adimlar = yeni.adimlar;
            }
            bekleyenRef.current = birlesik;
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (hemen) {
                hemenYaz();
                return;
            }
            zamanlayiciRef.current = setTimeout(hemenYaz, CAMIYE_GIT_YAZMA_GECIKMESI_MS);
        },
        [taslak, kayitli, hemenYaz]
    );

    // Ekrandan çıkışta bekleyen yazma HEMEN uygulanır (sessizce kaybolmasın).
    useEffect(() => () => hemenYaz(), [hemenYaz]);

    // Store taslağa eşitlenince taslak bırakılır (normalize edilmiş değer gösterilsin).
    useEffect(() => {
        if (taslak && !bekleyenRef.current && JSON.stringify(kayitli) === JSON.stringify(taslak)) setTaslak(null);
    }, [kayitli, taslak]);

    // ── Bildirim sınırı (issue #298) ──
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;
    const butce = useBildirimButcesi();
    const rehber = useButceRehberi<CamiyeGitAyarlari>(
        butce,
        {
            yaz: () => undefined,
            yedekAl: () => ayarlar,
            geriYukle: (yedek) => yaz(yedek, true),
        },
        {
            oneriFiltresi: oneriUygulanmaz,
            ekYol: navigation
                ? { etiket: mh.ek.ekYol, onPress: () => navigation.navigate('MuhafizAyarlari') }
                : undefined,
        }
    );

    /** Yapısal artışta sığma denetimi; sığmazsa YAZILMAZ (rehber açılır). */
    const guncelle = useCallback(
        (yeni: CamiyeGitAyarlari, ek: Partial<CamiyeGitAyarlari> = {}, hemen = false): boolean => {
            if (
                adimYukuArtiyorMu(ayarlar, yeni) &&
                !rehber.degisikligiDene({ camiyeGit: yeni }, { once: { camiyeGit: ayarlar } })
            ) {
                return false;
            }
            yaz({ aktif: yeni.aktif, adimlar: yeni.adimlar, ...ek }, hemen);
            return true;
        },
        [ayarlar, rehber, yaz]
    );

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
        if (!kayitli.aktif || !favori || !favoriYurumeMesafesinde) return;
        if (kayitli.yurumeKaynagi === 'elle' || bekleyenRef.current) return;
        if (kayitli.yurumeKaynagi === 'tahmin' && kayitli.yurumeDk === favori.yurumeDk && kayitli.camiAdi === favori.ad) {
            return;
        }
        dispatch(camiyeGitAyariniGuncelle({ yurumeDk: favori.yurumeDk, yurumeKaynagi: 'tahmin', camiAdi: favori.ad }));
    }, [dispatch, kayitli.aktif, kayitli.yurumeKaynagi, kayitli.yurumeDk, kayitli.camiAdi, favori, favoriYurumeMesafesinde]);

    const elleDuzenleniyor = taslak !== null && taslak.yurumeDk !== kayitli.yurumeDk;

    const anaAnahtar = useCallback(
        async (deger: boolean) => {
            await butonTiklandiFeedback();
            guncelle({ ...ayarlar, aktif: deger }, {}, true);
        },
        [ayarlar, butonTiklandiFeedback, guncelle]
    );

    const vakitDegistir = useCallback(
        async (vakit: CamiyeGitVakti) => {
            await butonTiklandiFeedback();
            const vakitler = { ...ayarlar.vakitler, [vakit]: !ayarlar.vakitler[vakit] };
            // Vakit açmak sayıyı YAPISAL artırır → sığma denetimi; kapatmak engellenmez.
            if (vakitler[vakit] && !rehber.degisikligiDene({ camiyeGit: { ...ayarlar, vakitler } }, { once: { camiyeGit: ayarlar } })) {
                return;
            }
            yaz({ vakitler }, true);
        },
        [ayarlar, butonTiklandiFeedback, rehber, yaz]
    );

    const tahminiKullan = useCallback(async () => {
        if (!favori) return;
        await butonTiklandiFeedback();
        yaz({ yurumeDk: favori.yurumeDk, yurumeKaynagi: 'tahmin', camiAdi: favori.ad }, true);
    }, [butonTiklandiFeedback, favori, yaz]);

    const seciliVakitSayisi = useMemo(
        () => CAMIYE_GIT_VAKITLERI.filter((v) => ayarlar.vakitler[v]).length,
        [ayarlar.vakitler]
    );

    const kaynakSatiri = (() => {
        if (ayarlar.yurumeKaynagi === 'tahmin' && ayarlar.camiAdi && !elleDuzenleniyor) {
            return favori
                ? bicim(mc.tahminMesafe, { cami: ayarlar.camiAdi, mesafe: mesafeMetni(favori.mesafeM) })
                : bicim(mc.tahmin, { cami: ayarlar.camiAdi });
        }
        if (favori && !favoriYurumeMesafesinde) {
            return bicim(mc.uzak, { cami: favori.ad, mesafe: mesafeMetni(favori.mesafeM) });
        }
        if (camideyimVar && !favori) {
            return mc.favoriYok;
        }
        return null;
    })();

    const tahminDugmesiGorunur =
        favori != null &&
        favoriYurumeMesafesinde &&
        (ayarlar.yurumeKaynagi === 'elle' || elleDuzenleniyor) &&
        ayarlar.yurumeDk !== favori.yurumeDk;

    // ── Pencere tanımı ──
    const hesapSurumu = useHesapSurumu();
    const pencere = useMemo(
        () => siradakiPencere(koordinat, ayarlar.vakitler, new Date()),
        // hesapSurumu: yöntem değişince yeniden hesaplanır (değer kapanışta okunmaz).
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [koordinat, ayarlar.vakitler, hesapSurumu]
    );
    const ornekVakit: CamiyeGitVakti = pencere?.vakit ?? CAMIYE_GIT_VAKITLERI.find((v) => ayarlar.vakitler[v]) ?? 'ogle';
    const sure = useMemo(() => ({ yurumeDk: ayarlar.yurumeDk, hazirlikDk: ayarlar.hazirlikDk }), [ayarlar.yurumeDk, ayarlar.hazirlikDk]);
    const tanim = useMemo(
        () =>
            ekHatirlatmaPencereTanimi({
                kaynak: 'camiyeGit',
                yuzey: 'camiyeGit',
                anonsVakitAdi: VAKIT_ADLARI[ornekVakit],
                baslik: metin().hatirlatma.camiye.baslik,
                baslikKucuk: metin().hatirlatma.camiye.baslikKucuk,
                ikon: 'walking',
                vakit: ornekVakit,
                yonSabitGerekcesi: camiyeGitYonGerekcesi(),
                adimSayisi: ayarlar.adimlar.length,
                maksAdim: CAMIYE_GIT_ADIM_KISITLARI.maksAdim,
                esikSinirlari: { min: CAMIYE_GIT_ESIK_MIN_DK, max: CAMIYE_GIT_ESIK_MAX_DK },
                esikAdimDk: CAMIYE_GIT_ESIK_ADIM_DK,
                tekrarMinDk: CAMIYE_GIT_TEKRAR_MIN_DK,
                tekrarMaxDk: CAMIYE_GIT_TEKRAR_MAX_DK,
                varsayilanTekrarDk: CAMIYE_GIT_VARSAYILAN_TEKRAR_DK,
                esikBasligi: metin().hatirlatma.ek.neKadarOnce,
                esikAciklamasi: metin().hatirlatma.camiye.esikAciklamasi,
                esikErisimAdi: metin().hatirlatma.camiye.esikErisimAdi,
                esikBirimi: metin().hatirlatma.ek.dkKala,
                pencere: pencere ? { baslangic: pencere.baslangic, bitis: pencere.bitis } : undefined,
                seritGunEtiketi: pencere
                    ? bicim(pencere.bugun ? metin().hatirlatma.camiye.seritBugun : metin().hatirlatma.camiye.seritYarin, {
                          vakit: VAKIT_ADLARI_KUCUK[pencere.vakit],
                      })
                    : undefined,
                yetenekler,
                otomatikAnons: (s) => camiyeGitAnonsMetni(ornekVakit, s.esikDk, sure),
                onizlemeMetni: (adim) => ({
                    ...camiyeGitMetniOlustur(ornekVakit, adim.kalanDk, sure),
                    anons: camiyeGitAnonsMetni(ornekVakit, adim.kalanDk, sure),
                }),
                onizlemeOzeti: (adet) => sayili(metin().hatirlatma.camiye.onizlemeOzeti, adet),
            }),
        // Dil değişince tanım (başlık, eşik metinleri) yeniden kurulur.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ayarlar.adimlar.length, ornekVakit, pencere, sure, yetenekler, sozluk]
    );

    /** Modülün yazıcısı: rıza İLK kez verildiyse adımla BİRLİKTE ve hemen yazılır. */
    const modulYaz = useCallback(
        (yeni: CamiyeGitAyarlari, riza: AdimRizasi): boolean => {
            const rizaVar = riza.sesliOnayi === true || riza.alarmOnayi === true;
            const yazildi = guncelle(yeni, {}, rizaVar);
            // TEK RIZA (Dalga 3): onay yüzeyin kendi alanına değil ORTAK kayda yazılır.
            if (yazildi && rizaVar) genelRiza.ver(riza);
            return yazildi;
        },
        [guncelle, genelRiza]
    );
    const enErkenDk = Math.max(...ayarlar.adimlar.map((a) => a.esikDk));

    return (
        <View>
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
                            {mc.baslik}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {mc.altBaslik}
                        </Text>
                    </View>
                    <Anahtar
                        value={ayarlar.aktif}
                        onValueChange={anaAnahtar}
                        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                        thumbColor={ayarlar.aktif ? renkler.birincil : '#f4f3f4'}
                        accessibilityLabel={mc.anahtarEtiketi}
                    />
                </View>

                {ayarlar.aktif && (
                    <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        <Text className="text-xs font-semibold mt-4 mb-3" style={{ color: renkler.metinIkincil }}>
                            {mc.hangiVakitler}
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
                                        accessibilityLabel={bicim(mc.vakitEtiketi, { ad: VAKIT_ADLARI[vakit] })}
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

                        <Text className="text-xs font-semibold mt-5" style={{ color: renkler.metinIkincil }}>
                            {bicim(mc.yolaCikis, { dk: camiyeGitOncedenDk(ayarlar), yurume: ayarlar.yurumeDk, hazirlik: ayarlar.hazirlikDk })}
                        </Text>

                        <View className="flex-row items-center justify-between mt-3">
                            <View className="flex-1 mr-3">
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    {mc.yurume}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {mc.evdenCamiye}
                                </Text>
                            </View>
                            <SayisalSecici
                                deger={ayarlar.yurumeDk}
                                min={YURUME_MIN_DK}
                                max={YURUME_MAX_DK}
                                onChange={(d) => yaz({ yurumeDk: d, yurumeKaynagi: 'elle' })}
                                renk={renkler.birincil}
                                aciklama={mc.yurume}
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
                                accessibilityLabel={bicim(mc.favoriEtiketi, { dk: favori.yurumeDk })}
                            >
                                <FontAwesome5 name="map-marker-alt" size={12} color={renkler.birincil} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    {bicim(mc.favori, { dk: favori.yurumeDk })}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View className="flex-row items-center justify-between mt-5">
                            <View className="flex-1 mr-3">
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    {mc.hazirlik}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {mc.abdest}
                                </Text>
                            </View>
                            <SayisalSecici
                                deger={ayarlar.hazirlikDk}
                                min={HAZIRLIK_MIN_DK}
                                max={HAZIRLIK_MAX_DK}
                                adim={HAZIRLIK_ADIM_DK}
                                onChange={(d) => yaz({ hazirlikDk: d })}
                                renk={renkler.birincil}
                                aciklama={mc.hazirlik}
                            />
                        </View>
                        <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                            {mc.kayar}
                        </Text>

                        <View className="mt-4">
                            <HatirlatmaModulu<CamiyeGitAyarlari>
                                tanim={tanim}
                                deger={ayarlar}
                                islemler={CAMIYE_GIT_ISLEMLERI}
                                yaz={modulYaz}
                                ttsDestekli={ttsDestekli}
                                // Rızalar bu yüzeyin KENDİ kaydı (muhafızınki taşınmaz).
                                sesliOnayiVar={genelRiza.sesli}
                                alarmOnayiVar={genelRiza.alarm}
                                sesliOnayMetinleri={{
                                    altBaslik: mc.sesliAltBaslik,
                                    kapatmaNotu: mh.adim.sesliKapatmaNotu,
                                }}
                                silinebilirMi={(a) => a.adimlar.length > 1}
                                // Modal kapanışında bekleyen yazma hemen uygulanır (planlama gecikmesin).
                                onDetayKapandi={hemenYaz}
                                stil="gomulu"
                            />
                        </View>

                        <View className="flex-row items-start mt-5 gap-2">
                            <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                {seciliVakitSayisi === 0
                                    ? mc.vakitYok
                                    : bicim(mc.ilkHatirlatma, { dk: enErkenDk })}
                                {cumaAcik && ayarlar.vakitler.ogle ? mc.cumaNotu : ''}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {rehber.ogeler}
        </View>
    );
};
