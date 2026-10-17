/**
 * Cuma namazı hatırlatması bölümü (issue #173; ortak hatırlatma yüzeyleri plan §5.1) —
 * Bildirim Ayarları'nda, yatış hatırlatmasının üstünde.
 *
 * ORTAK BİLEŞEN (AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA"): kart
 * `PencereKarti` (`stil="gomulu"`), adım detayı `AdimDetayModal`, önizleme
 * `AkisOnizlemeModal`, tanım `ekHatirlatmaPencereTanimi` — muhafız ve nafileyle AYNI
 * yetenekler: 1–3 adım, kanal çipleri (bildirim / sesli anons / ikisi / kapalı), ses,
 * titreşim, gerçek alarm + kapsamı, tekrar, akış önizlemesi, zaman şeridi (bu cumanın
 * öğlesi). İstisnalar (gerekçe kartta yazılı): yön sabit, ton yok, anons metni bağlamdan.
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
import { PencereKarti } from '../hatirlatma/PencereKarti';
import { AdimDetayModal } from '../hatirlatma/AdimDetayModal';
import { AkisOnizlemeModal } from '../hatirlatma/AkisOnizlemeModal';
import { ekHatirlatmaPencereTanimi } from '../hatirlatma/pencereTanimi';
import { SesliOnayModal } from '../../screens/MuhafizAyarlari/SesliOnayModal';
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
import { adimEkle, adimGuncelle, adimSil, adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import { seviyeyiAc, seviyeyiKapat } from '../../../core/muhafiz/seviyeAcKapa';
import { cumaAnonsMetni, cumaBildirimMetni, cumaMi, sonrakiCumalar } from '../../../core/utils/cumaYardimcisi';
import { turkiyeHesapParametreleri } from '../../../core/vakit/hesapParametreleri';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';

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

const vakitAyari = (a: Pick<CumaHatirlatmaAyarlari, 'adimlar'>): VakitMuhafizAyari => ({
    yon: 'cikisaDogru',
    seviyeler: a.adimlar,
});

export const CumaHatirlatmaBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const kayitli = useAppSelector((s) => s.cumaHatirlatma.ayarlar);
    const koordinat = useAppSelector((s) => s.konum?.koordinatlar);
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();

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
                ? { etiket: 'Namaz Muhafızı ayarlarında yer açın', onPress: () => navigation.navigate('MuhafizAyarlari') }
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
                anonsOrnegiOlustur: (s) => cumaAnonsMetni(s.esikDk),
                onizlemeMetni: (adim, ilk) => ({ ...cumaBildirimMetni(adim.kalanDk, ilk), anons: cumaAnonsMetni(adim.kalanDk) }),
                onizlemeOzeti: (adet) => `Öğle vaktinden önce ${adet} hatırlatma alırsınız`,
            }),
        [ayarlar.adimlar.length, pencere, yetenekler]
    );

    // ── Adım işlemleri ──
    const [detay, setDetay] = useState<number | null>(null);
    const [onizleme, setOnizleme] = useState(false);
    const [sesliBekleyen, setSesliBekleyen] = useState<{ indeks: number; seviye: SeviyeAyari } | null>(null);
    /** `AlarmOnayModal` onaylandı; rıza bir sonraki adım yazımıyla birlikte kaydedilir. */
    const alarmOnayiBekliyor = useRef(false);

    const adimEkleyin = () => {
        const yeni = adimEkle(ayarlar, 'cikisaDogru', CUMA_ADIM_KISITLARI);
        if (yeni === ayarlar || !guncelle(yeni)) return;
        const eskiEsikler = new Set(ayarlar.adimlar.map((a) => a.esikDk));
        const indeks = yeni.adimlar.findIndex((a) => !eskiEsikler.has(a.esikDk));
        if (indeks >= 0) setDetay(indeks);
    };

    const adimAcKapa = (indeks: number, acik: boolean) => {
        const mevcut = ayarlar.adimlar[indeks];
        if (!mevcut) return;
        const seviye = acik ? seviyeyiAc(mevcut, 'cikisaDogru') : seviyeyiKapat(mevcut);
        if (seviye === mevcut) return;
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', CUMA_ADIM_KISITLARI));
    };

    const adimDegistir = (indeks: number, seviye: SeviyeAyari) => {
        const eski = ayarlar.adimlar[indeks];
        if (!eski) return;
        if (alarmOnayiBekliyor.current) {
            alarmOnayiBekliyor.current = false;
            guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', CUMA_ADIM_KISITLARI), { alarmOnayi: true }, true);
            return;
        }
        const sesliAciliyor = seviye.kanallar?.sesli === true && eski.kanallar?.sesli !== true;
        if (sesliAciliyor && ayarlar.sesliOnayi !== true) {
            setSesliBekleyen({ indeks, seviye });
            return;
        }
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', CUMA_ADIM_KISITLARI));
    };

    const sesliOnayla = () => {
        if (!sesliBekleyen) return;
        const { indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', CUMA_ADIM_KISITLARI), { sesliOnayi: true }, true);
    };

    /** "Sesli olmadan": adım bildirimle kalır (titreşim/alarm korunur). */
    const sesliOlmadan = () => {
        if (!sesliBekleyen) return;
        const { indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        const kanallar = { ...seviye.kanallar, sesli: false, bildirim: true };
        guncelle(adimGuncelle(ayarlar, indeks, { ...seviye, kanallar }, 'cikisaDogru', CUMA_ADIM_KISITLARI));
    };

    const detaySeviyesi = detay !== null ? ayarlar.adimlar[detay] : undefined;

    return (
        <View className="mb-6">
            <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                CUMA NAMAZI
            </Text>

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
                        <PencereKarti
                            tanim={tanim}
                            ayar={vakitAyari(ayarlar)}
                            onAdimSec={(indeks) => setDetay(indeks)}
                            onAdimEkle={adimEkleyin}
                            onAdimAcKapa={ayarlar.adimlar.length > 1 ? adimAcKapa : undefined}
                            onAkisiOnizle={() => setOnizleme(true)}
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

            {detay !== null && detaySeviyesi && (
                <AdimDetayModal
                    gorunur
                    tanim={tanim}
                    seviyeler={ayarlar.adimlar}
                    indeks={detay}
                    ttsDestekli={ttsDestekli}
                    onDegistir={(s: SeviyeAyari) => adimDegistir(detay, s)}
                    onSil={
                        ayarlar.adimlar.length > 1
                            ? () => {
                                guncelle(adimSil(ayarlar, detay));
                                setDetay(null);
                            }
                            : undefined
                    }
                    onKapat={() => {
                        setDetay(null);
                        // Modal kapanışında bekleyen yazma hemen uygulanır (planlama gecikmesin).
                        hemenYaz();
                    }}
                    // Gerçek alarm rızası (#74) — cumanın KENDİ kaydı (muhafızınki taşınmaz).
                    alarmOnayiVar={ayarlar.alarmOnayi === true}
                    onAlarmOnayiVer={() => {
                        alarmOnayiBekliyor.current = true;
                    }}
                />
            )}

            {onizleme && (
                <AkisOnizlemeModal
                    gorunur
                    tanim={tanim}
                    ayar={vakitAyari(ayarlar)}
                    ttsDestekli={ttsDestekli}
                    onKapat={() => setOnizleme(false)}
                />
            )}

            <SesliOnayModal
                gorunur={sesliBekleyen !== null}
                altBaslik="Cuma hatırlatmasında sesli anons"
                kapatmaNotu="Dilediğiniz zaman hatırlatmanın ayarından kapatabilirsiniz."
                ornekMetin={sesliBekleyen ? cumaAnonsMetni(sesliBekleyen.seviye.esikDk) : ''}
                ttsDestekli={ttsDestekli}
                onOnayla={sesliOnayla}
                onSessizUygula={sesliOlmadan}
                onIptal={() => setSesliBekleyen(null)}
            />

            {rehber.ogeler}
        </View>
    );
};

export default CumaHatirlatmaBolumu;
