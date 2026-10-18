/**
 * Cuma namazı hatırlatması bölümü (issue #173; ortak hatırlatma yüzeyleri plan §5.1) —
 * Hatırlatmalar > "Cuma namazı" ayrıntı sayfasında.
 *
 * BİRLEŞİK HATIRLATMA MODÜLÜ (`HatirlatmaModulu` + `useHatirlatmaDuzenleyici`; AGENTS.md:
 * "yeni hatırlatma yüzeyi için ayrı ekran YAZMA") — muhafız ve nafileyle AYNI yetenekler:
 * 1–3 adım, Bildirim + Sesli okuma anahtarları, ses, titreşim, sesli okuma METNİ (`{vakit}` =
 * Cuma), gerçek alarm + kapsamı, tekrar, akış önizlemesi, zaman şeridi (bu cumanın öğlesi).
 * İstisnalar (gerekçe kartta yazılı): yön sabit, ton yok.
 *
 * YAZMA DEBOUNCE'LU: stepper'a arka arkaya basmak TEK yazmaya/planlamaya inmeli (her
 * dispatch diske yazıp dört cumayı yeniden planlar). UI yerel taslaktan çizilir; ekrandan
 * çıkışta bekleyen yazma HEMEN uygulanır. Rıza (sesli / alarm) ilgili adım yazımıyla
 * BİRLİKTE gider (iki eşzamanlı thunk aynı eski durumu birleştirip birbirini ezerdi).
 *
 * BİLDİRİM SINIRI (issue #298): sayıyı YAPISAL olarak artıran değişiklik (açma, adım
 * ekleme/açma, sesli, "her uyarıda" alarm, tekrar) `degisikligiDene`'den geçer; salt
 * zaman (eşik) değişimi geçmez.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { Coordinates, PrayerTimes } from 'adhan';
import { useRenkler } from '../../../core/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { cumaHatirlatmaAyariniGuncelle } from '../../store/cumaHatirlatmaSlice';
import { Anahtar } from '../common/Anahtar';
import { HatirlatmaModulu, ekAdimIslemleri } from '../hatirlatma/HatirlatmaModulu';
import { ekHatirlatmaPencereTanimi } from '../hatirlatma/pencereTanimi';
import type { AdimRizasi } from '../hatirlatma/AdimDetayModal';
import { useGenelRiza } from '../../hooks/useGenelRiza';
import { usePlatformYetenekleri } from '../../hooks/usePlatformYetenekleri';
import { useTurkceTtsDestegi } from '../../hooks/useTurkceTtsDestegi';
import { useBildirimButcesi } from '../../hooks/useBildirimButcesi';
import { useButceRehberi } from '../../hooks/useButceRehberi';
import {
    CUMA_ADIM_KISITLARI,
    CUMA_ONCEDEN_ADIM_DK,
    CUMA_ONCEDEN_MAX_DK,
    CUMA_ONCEDEN_MIN_DK,
    CUMA_TEKRAR_MAX_DK,
    CUMA_TEKRAR_MIN_DK,
    CUMA_VARSAYILAN_TEKRAR_DK,
    cumaAyarlariniBirlestir,
    type CumaHatirlatmaAyarlari,
} from '../../../core/cuma/cumaAyarlari';
import { adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import { cumaAnonsMetni, cumaBildirimMetni, cumaMi, sonrakiCumalar } from '../../../core/utils/cumaYardimcisi';
import { turkiyeHesapParametreleri } from '../../../core/vakit/hesapParametreleri';


/** Taslağın diske yazılmadan önce beklediği süre (stepper → tek yazma). */
export const CUMA_YAZMA_GECIKMESI_MS = 1200;

type AyarNavigasyonu = { navigate: (ekran: string) => void };

/**
 * Bütçe rehberinin önerileri (`butceOnerileri`) muhafız matrisini ya da nafileyi değiştirir;
 * bu bölüm yalnız cumayı YAZAR → öneri burada UYGULANMAZ (uygulansaydı yer açan değişiklik
 * yazılmaz, sığmayan cuma değişikliği yazılırdı). Yer açma Namaz Muhafızı ekranından.
 */
const oneriUygulanmaz = (): boolean => false;

/** Yön sabit gerekçesi (plan §3.3) — kartta seçici yerine yazılır. */
export const CUMA_YON_GEREKCESI =
    'Hatırlatma öğle vaktinden ÖNCE gelir; vakit girdikten sonra cuma için geç olur.';

/** Bu cumanın (öğlesi henüz geçmemiş ilk cuma) penceresi: [öğle − 180 dk, öğle]. */
function buCumaninPenceresi(
    koordinat: { lat: number; lng: number } | null | undefined,
    simdi: Date
): { baslangic: Date; bitis: Date; bugun: boolean } | undefined {
    if (!koordinat || (koordinat.lat === 0 && koordinat.lng === 0)) return undefined;
    try {
        const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
        for (const cuma of sonrakiCumalar(simdi, 2)) {
            const ogle = new PrayerTimes(coordinates, cuma, turkiyeHesapParametreleri()).dhuhr;
            if (ogle.getTime() <= simdi.getTime()) continue;
            return {
                baslangic: new Date(ogle.getTime() - CUMA_ONCEDEN_MAX_DK * 60000),
                bitis: ogle,
                bugun: cumaMi(simdi) && cuma.getDate() === simdi.getDate(),
            };
        }
    } catch {
        // Vakit hesaplanamazsa şerit çizilmez (yanlış resim çizmektense hiç).
    }
    return undefined;
}

/** Cumanın adım dönüşümleri (kısıtlarıyla) — modül düzeyinde, referans sabit. */
const CUMA_ISLEMLERI = ekAdimIslemleri<CumaHatirlatmaAyarlari>(CUMA_ADIM_KISITLARI);

export interface CumaHatirlatmaBolumuProps {
    /** Ayrıntı sayfasında başlık header'dadır (AGENTS.md: başlık TEK yerde). */
    baslikGizle?: boolean;
}

export const CumaHatirlatmaBolumu: React.FC<CumaHatirlatmaBolumuProps> = ({ baslikGizle = false }) => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const kayitli = useAppSelector((s) => s.cumaHatirlatma.ayarlar);
    const koordinat = useAppSelector((s) => s.konum?.koordinatlar);
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();
    const genelRiza = useGenelRiza();

    // ── Taslak + debounce'lu yazma ──
    const [taslak, setTaslak] = useState<CumaHatirlatmaAyarlari | null>(null);
    const bekleyenRef = useRef<Partial<CumaHatirlatmaAyarlari> | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ayarlar = taslak ?? kayitli;

    const hemenYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen) dispatch(cumaHatirlatmaAyariniGuncelle(bekleyen));
    }, [dispatch]);

    /** Değişikliği taslağa yazar ve debounce'lu dispatch'i kurar (`hemen` → beklemeden). */
    const yaz = useCallback(
        (degisiklik: Partial<CumaHatirlatmaAyarlari>, hemen = false) => {
            setTaslak((onceki) => cumaAyarlariniBirlestir(onceki ?? kayitli, degisiklik));
            bekleyenRef.current = { ...(bekleyenRef.current ?? {}), ...degisiklik };
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (hemen) {
                hemenYaz();
                return;
            }
            zamanlayiciRef.current = setTimeout(hemenYaz, CUMA_YAZMA_GECIKMESI_MS);
        },
        [kayitli, hemenYaz]
    );

    // Ekrandan çıkışta bekleyen yazma varsa HEMEN uygulanır (sessizce kaybolmasın).
    useEffect(() => () => hemenYaz(), [hemenYaz]);

    // Store taslağa eşitlenince taslak bırakılır (normalize edilmiş değer gösterilsin).
    useEffect(() => {
        if (taslak && !bekleyenRef.current && JSON.stringify(kayitli) === JSON.stringify(taslak)) setTaslak(null);
    }, [kayitli, taslak]);

    // ── Bildirim sınırı (issue #298) ──
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;
    const butce = useBildirimButcesi();
    const rehber = useButceRehberi<CumaHatirlatmaAyarlari>(
        butce,
        {
            // Öneri bu bölümde uygulanmaz (`oneriUygulanmaz`); yalnız geri alma yolu.
            yaz: () => undefined,
            yedekAl: () => ayarlar,
            geriYukle: (yedek) => yaz(yedek, true),
        },
        {
            oneriFiltresi: oneriUygulanmaz,
            ekYol: navigation
                ? { etiket: '"Vakit çıkmadan" ayarlarında yer açın', onPress: () => navigation.navigate('MuhafizAyarlari') }
                : undefined,
        }
    );

    /** Yapısal artışta sığma denetimi; sığmazsa YAZILMAZ (rehber açılır). */
    const guncelle = useCallback(
        (yeni: CumaHatirlatmaAyarlari, ek: Partial<CumaHatirlatmaAyarlari> = {}, hemen = false): boolean => {
            if (adimYukuArtiyorMu(ayarlar, yeni) && !rehber.degisikligiDene({ cuma: yeni }, { once: { cuma: ayarlar } })) {
                return false;
            }
            yaz({ aktif: yeni.aktif, adimlar: yeni.adimlar, ...ek }, hemen);
            return true;
        },
        [ayarlar, rehber, yaz]
    );

    // ── Pencere tanımı ──
    const pencere = useMemo(() => buCumaninPenceresi(koordinat, new Date()), [koordinat]);
    const tanim = useMemo(
        () =>
            ekHatirlatmaPencereTanimi({
                kaynak: 'cuma',
                yuzey: 'cuma',
                anonsVakitAdi: 'Cuma',
                baslik: 'Cuma namazı',
                baslikKucuk: 'cuma namazı',
                ikon: 'mosque',
                // Kimlik öğle namazıdır; "Cuma" salt görünüm (AGENTS.md).
                vakit: 'ogle',
                yonSabitGerekcesi: CUMA_YON_GEREKCESI,
                adimSayisi: ayarlar.adimlar.length,
                maksAdim: CUMA_ADIM_KISITLARI.maksAdim,
                esikSinirlari: { min: CUMA_ONCEDEN_MIN_DK, max: CUMA_ONCEDEN_MAX_DK },
                esikAdimDk: CUMA_ONCEDEN_ADIM_DK,
                tekrarMinDk: CUMA_TEKRAR_MIN_DK,
                tekrarMaxDk: CUMA_TEKRAR_MAX_DK,
                varsayilanTekrarDk: CUMA_VARSAYILAN_TEKRAR_DK,
                esikBasligi: 'NE KADAR ÖNCE',
                esikAciklamasi: 'Öğle vaktine',
                esikErisimAdi: 'Ne kadar önce',
                esikBirimi: 'dk kala',
                pencere: pencere ? { baslangic: pencere.baslangic, bitis: pencere.bitis } : undefined,
                seritGunEtiketi: pencere?.bugun ? 'Bugün' : 'Bu cuma',
                yetenekler,
                otomatikAnons: (s) => cumaAnonsMetni(s.esikDk),
                onizlemeMetni: (adim, ilk) => ({ ...cumaBildirimMetni(adim.kalanDk, ilk), anons: cumaAnonsMetni(adim.kalanDk) }),
                onizlemeOzeti: (adet) => `Öğle vaktinden önce ${adet} hatırlatma alırsınız`,
            }),
        [ayarlar.adimlar.length, pencere, yetenekler]
    );

    /** Modülün yazıcısı: rıza İLK kez verildiyse adımla BİRLİKTE ve hemen yazılır. */
    const modulYaz = useCallback(
        (yeni: CumaHatirlatmaAyarlari, riza: AdimRizasi): boolean => {
            const rizaVar = riza.sesliOnayi === true || riza.alarmOnayi === true;
            const yazildi = guncelle(yeni, {}, rizaVar);
            // TEK RIZA (Dalga 3): onay yüzeyin kendi alanına değil ORTAK kayda yazılır.
            if (yazildi && rizaVar) genelRiza.ver(riza);
            return yazildi;
        },
        [guncelle, genelRiza]
    );

    return (
        <View className="mb-6">
            {!baslikGizle && (
                <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                    CUMA NAMAZI
                </Text>
            )}

            <View className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: renkler.kartArkaplan }}>
                <View className="flex-row items-center p-4">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}15` }}
                    >
                        <FontAwesome5 name="mosque" size={18} color={renkler.birincil} solid />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                            Cuma hatırlatması
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            Her cuma, öğle vaktinden önce hatırlatalım
                        </Text>
                    </View>
                    <Anahtar
                        value={ayarlar.aktif}
                        onValueChange={(v) => {
                            guncelle({ ...ayarlar, aktif: v }, {}, true);
                        }}
                        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                        thumbColor={ayarlar.aktif ? renkler.birincil : '#f4f3f4'}
                        accessibilityLabel="Cuma hatırlatması"
                    />
                </View>

                {ayarlar.aktif && (
                    <View className="px-4 pb-4 pt-3 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        <HatirlatmaModulu<CumaHatirlatmaAyarlari>
                            tanim={tanim}
                            deger={ayarlar}
                            islemler={CUMA_ISLEMLERI}
                            yaz={modulYaz}
                            ttsDestekli={ttsDestekli}
                            // Rızalar cumanın KENDİ kaydı (muhafızınki taşınmaz).
                            sesliOnayiVar={genelRiza.sesli}
                            alarmOnayiVar={genelRiza.alarm}
                            sesliOnayMetinleri={{
                                altBaslik: 'Cuma hatırlatmasında sesli okuma',
                                kapatmaNotu: 'Dilediğiniz zaman hatırlatmanın ayarından kapatabilirsiniz.',
                            }}
                            silinebilirMi={(a) => a.adimlar.length > 1}
                            // Modal kapanışında bekleyen yazma hemen uygulanır (planlama gecikmesin).
                            onDetayKapandi={hemenYaz}
                            stil="gomulu"
                        />

                        <View className="flex-row items-start mt-4 gap-2">
                            <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                Camiye yetişecek zamanı siz belirleyin. Cuma, öğle namazının yerine geçtiği için
                                ayrı bir kayıt tutulmaz; işaretlemeyi öğle namazından yaparsınız.
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {rehber.ogeler}
        </View>
    );
};

export default CumaHatirlatmaBolumu;
