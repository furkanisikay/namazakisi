/**
 * Bildirim Ayarları > "Yatış hatırlatması" bölümü (issue #290; ortak hatırlatma yüzeyleri
 * plan §5.3).
 *
 * Kullanıcı her zamanki yatış saatini girer; yatıştan önce hatırlatma: yatsı kılınmadıysa
 * yatsı hatırlatması, kılındıysa gün sonu muhasebesi ("Bugün 4/5 · öğle işaretlenmemiş" +
 * Kıldım / Kazaya ekle).
 *
 * ORTAK BİLEŞEN (AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA"): kart
 * `PencereKarti` (`stil="gomulu"`), adım detayı `AdimDetayModal`, önizleme
 * `AkisOnizlemeModal`, tanım `ekHatirlatmaPencereTanimi` — muhafız, nafile, cuma ve camiye
 * gitmeyle AYNI yetenekler (1–3 adım, kanal çipleri, ses, titreşim, gerçek alarm + kapsamı,
 * tekrar, akış önizlemesi, zaman şeridi = bu gecenin yatışa kadarki iki saati). İstisnalar
 * (gerekçe kartta yazılı): yön sabit, ton yok, anons metni içerikten. İÇERİK (yatsı mı
 * muhasebe mi) günde bir kez seçilir ve o günün bütün tekrarları aynı içeriği taşır.
 *
 * YAZMA DEBOUNCE'LU (cuma deseni): saat stepper'ına arka arkaya basmak TEK yazmaya/
 * planlamaya iner; ekrandan çıkışta bekleyen yazma HEMEN uygulanır. Rıza (sesli / alarm)
 * ilgili adım yazımıyla BİRLİKTE gider. Sayıyı YAPISAL artıran değişiklik bildirim sınırı
 * rehberinden (`degisikligiDene`) geçer; salt zaman değişimi geçmez.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { yatisHatirlatmaAyariniGuncelle } from '../../store/yatisHatirlatmaSlice';
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
import type { SeviyeAyari, VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import { adimEkle, adimGuncelle, adimSil, adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import { seviyeyiAc, seviyeyiKapat } from '../../../core/muhafiz/seviyeAcKapa';
import {
    YATIS_ADIM_KISITLARI,
    YATIS_DAKIKA_ADIM,
    YATIS_ONCE_ADIM_DK,
    YATIS_ONCE_MAX_DK,
    YATIS_ONCE_MIN_DK,
    YATIS_TEKRAR_MAX_DK,
    YATIS_TEKRAR_MIN_DK,
    YATIS_VARSAYILAN_TEKRAR_DK,
    yatisAni,
    yatisOrnekIcerigi,
    yatisTetikAni,
    yatsiOncesiTetikBilgisi,
    type YatisAyarlari,
} from '../../../core/yatis/yatisPlani';
import { yatisAyarlariniBirlestir } from '../../../core/yatis/yatisAyarlari';

export const YATIS_YAZMA_GECIKMESI_MS = 1200;

/** Yön sabit gerekçesi (plan §3.3) — kartta seçici yerine yazılır. */
export const YATIS_YON_GEREKCESI = 'Hatırlatma yatış saatinizden önce gelir.';

/** Yatış saati 20:00 – 02:55 aralığında; stepper bu aralığı 20:00'den dakika olarak tutar. */
const PENCERE_BASI_SAAT = 20;
const PENCERE_UZUNLUGU_DK = 7 * 60 - YATIS_DAKIKA_ADIM; // 02:55

export const saatiPencereDakikasinaCevir = (saat: number, dakika: number): number =>
    ((saat - PENCERE_BASI_SAAT + 24) % 24) * 60 + dakika;

export const pencereDakikasindanSaate = (dk: number): { saat: number; dakika: number } => ({
    saat: (PENCERE_BASI_SAAT + Math.floor(dk / 60)) % 24,
    dakika: dk % 60,
});

const ikiHane = (n: number) => String(n).padStart(2, '0');
const saatDakika = (t: Date) => `${ikiHane(t.getHours())}:${ikiHane(t.getMinutes())}`;

type AyarNavigasyonu = { navigate: (ekran: string) => void };

/** Bu bölüm yalnız yatışı yazar → muhafız/nafile önerisi burada UYGULANMAZ (cuma deseni). */
const oneriUygulanmaz = (): boolean => false;

const vakitAyari = (a: Pick<YatisAyarlari, 'adimlar'>): VakitMuhafizAyari => ({
    yon: 'cikisaDogru',
    seviyeler: a.adimlar,
});

/** Bu gecenin (yatışı henüz geçmemiş ilk namaz günü) penceresi: [yatış − 120 dk, yatış]. */
function buGecePenceresi(a: Pick<YatisAyarlari, 'saat' | 'dakika'>, simdi: Date): { baslangic: Date; bitis: Date } {
    const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
    let yatis = yatisAni(bugun, a);
    // Gece yarısından sonra hâlâ DÜNÜN namaz günü sürebilir; yoksa yarın.
    const dun = yatisAni(new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - 1), a);
    if (dun.getTime() > simdi.getTime()) yatis = dun;
    else if (yatis.getTime() <= simdi.getTime()) {
        yatis = yatisAni(new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() + 1), a);
    }
    return { baslangic: new Date(yatis.getTime() - YATIS_ONCE_MAX_DK * 60000), bitis: yatis };
}

export const YatisHatirlatmaBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const kayitli = useAppSelector((s) => s.yatisHatirlatma.ayarlar);
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();

    // ── Taslak + debounce'lu yazma ──
    const [taslak, setTaslak] = useState<YatisAyarlari | null>(null);
    const bekleyenRef = useRef<Partial<YatisAyarlari> | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ayarlar = taslak ?? kayitli;

    const hemenYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen) dispatch(yatisHatirlatmaAyariniGuncelle(bekleyen));
    }, [dispatch]);

    /** Değişikliği taslağa yazar ve debounce'lu dispatch'i kurar (`hemen` → beklemeden). */
    const yaz = useCallback(
        (degisiklik: Partial<YatisAyarlari>, hemen = false) => {
            setTaslak((onceki) => yatisAyarlariniBirlestir(onceki ?? kayitli, degisiklik));
            bekleyenRef.current = { ...(bekleyenRef.current ?? {}), ...degisiklik };
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (hemen) {
                hemenYaz();
                return;
            }
            zamanlayiciRef.current = setTimeout(hemenYaz, YATIS_YAZMA_GECIKMESI_MS);
        },
        [kayitli, hemenYaz]
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
    const rehber = useButceRehberi<YatisAyarlari>(
        butce,
        {
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
        (yeni: YatisAyarlari, ek: Partial<YatisAyarlari> = {}, hemen = false): boolean => {
            const icerikAciliyor =
                !(ayarlar.yatsiHatirlatmasi || ayarlar.muhasebe) && (yeni.yatsiHatirlatmasi || yeni.muhasebe);
            const artiyor = adimYukuArtiyorMu(ayarlar, yeni) || (yeni.aktif && icerikAciliyor);
            if (artiyor && !rehber.degisikligiDene({ yatis: yeni }, { once: { yatis: ayarlar } })) return false;
            yaz(
                {
                    aktif: yeni.aktif,
                    adimlar: yeni.adimlar,
                    yatsiHatirlatmasi: yeni.yatsiHatirlatmasi,
                    muhasebe: yeni.muhasebe,
                    ...ek,
                },
                hemen
            );
            return true;
        },
        [ayarlar, rehber, yaz]
    );

    const pencereDk = saatiPencereDakikasinaCevir(ayarlar.saat, ayarlar.dakika);

    const saatDegistir = (adim: number) => {
        const yeni = Math.min(PENCERE_UZUNLUGU_DK, Math.max(0, pencereDk + adim));
        if (yeni === pencereDk) return;
        void butonTiklandiFeedback();
        yaz(pencereDakikasindanSaate(yeni));
    };

    const anahtar = async (degisiklik: Partial<YatisAyarlari>) => {
        await butonTiklandiFeedback();
        guncelle({ ...ayarlar, ...degisiklik }, {}, true);
    };

    // ── Pencere tanımı ──
    const ornek = useMemo(
        () => yatisOrnekIcerigi({ yatsiHatirlatmasi: ayarlar.yatsiHatirlatmasi, muhasebe: ayarlar.muhasebe }),
        [ayarlar.yatsiHatirlatmasi, ayarlar.muhasebe]
    );
    const pencere = useMemo(
        () => buGecePenceresi({ saat: ayarlar.saat, dakika: ayarlar.dakika }, new Date()),
        [ayarlar.saat, ayarlar.dakika]
    );
    const tanim = useMemo(
        () =>
            ekHatirlatmaPencereTanimi({
                kaynak: 'yatis',
                baslik: 'Yatış hatırlatması',
                baslikKucuk: 'yatış hatırlatması',
                ikon: 'bed',
                // Kimlik yatsıdır; anons metni içerikten gelir (yer tutucusuz).
                vakit: 'yatsi',
                yonSabitGerekcesi: YATIS_YON_GEREKCESI,
                adimSayisi: ayarlar.adimlar.length,
                maksAdim: YATIS_ADIM_KISITLARI.maksAdim,
                esikSinirlari: { min: YATIS_ONCE_MIN_DK, max: YATIS_ONCE_MAX_DK },
                esikAdimDk: YATIS_ONCE_ADIM_DK,
                tekrarMinDk: YATIS_TEKRAR_MIN_DK,
                tekrarMaxDk: YATIS_TEKRAR_MAX_DK,
                varsayilanTekrarDk: YATIS_VARSAYILAN_TEKRAR_DK,
                esikBasligi: 'NE KADAR ÖNCE',
                esikAciklamasi: 'Yatış saatinize',
                esikErisimAdi: 'Yatıştan kaç dk önce',
                esikBirimi: 'dk kala',
                pencere,
                seritGunEtiketi: 'Bu gece',
                yetenekler,
                anonsOrnegiOlustur: () => ornek?.anons ?? '',
                onizlemeMetni: () => ({
                    baslik: ornek?.baslik ?? '',
                    govde: ornek?.govde ?? '',
                    anons: ornek?.anons ?? '',
                }),
                onizlemeOzeti: (adet) => `Yatmadan önce ${adet} hatırlatma alırsınız`,
            }),
        [ayarlar.adimlar.length, ornek, pencere, yetenekler]
    );

    // ── Adım işlemleri (cuma deseni) ──
    const [detay, setDetay] = useState<number | null>(null);
    const [onizleme, setOnizleme] = useState(false);
    const [sesliBekleyen, setSesliBekleyen] = useState<{ indeks: number; seviye: SeviyeAyari } | null>(null);
    /** `AlarmOnayModal` onaylandı; rıza bir sonraki adım yazımıyla birlikte kaydedilir. */
    const alarmOnayiBekliyor = useRef(false);

    const adimEkleyin = () => {
        const yeni = adimEkle(ayarlar, 'cikisaDogru', YATIS_ADIM_KISITLARI);
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
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', YATIS_ADIM_KISITLARI));
    };

    const adimDegistir = (indeks: number, seviye: SeviyeAyari) => {
        const eski = ayarlar.adimlar[indeks];
        if (!eski) return;
        if (alarmOnayiBekliyor.current) {
            alarmOnayiBekliyor.current = false;
            guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', YATIS_ADIM_KISITLARI), { alarmOnayi: true }, true);
            return;
        }
        const sesliAciliyor = seviye.kanallar?.sesli === true && eski.kanallar?.sesli !== true;
        if (sesliAciliyor && ayarlar.sesliOnayi !== true) {
            setSesliBekleyen({ indeks, seviye });
            return;
        }
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', YATIS_ADIM_KISITLARI));
    };

    const sesliOnayla = () => {
        if (!sesliBekleyen) return;
        const { indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        guncelle(adimGuncelle(ayarlar, indeks, seviye, 'cikisaDogru', YATIS_ADIM_KISITLARI), { sesliOnayi: true }, true);
    };

    /** "Sesli olmadan": adım bildirimle kalır (titreşim/alarm korunur). */
    const sesliOlmadan = () => {
        if (!sesliBekleyen) return;
        const { indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        const kanallar = { ...seviye.kanallar, sesli: false, bildirim: true };
        guncelle(adimGuncelle(ayarlar, indeks, { ...seviye, kanallar }, 'cikisaDogru', YATIS_ADIM_KISITLARI));
    };

    const detaySeviyesi = detay !== null ? ayarlar.adimlar[detay] : undefined;
    const saatMetni = `${ikiHane(ayarlar.saat)}:${ikiHane(ayarlar.dakika)}`;

    // Yazın erken yatış (20:30) yatsı girişinden (~22:00) önce düşer: yatsı
    // hatırlatması yatsı girdikten sonraya kayar (plan üreticisi), muhasebe ise
    // seçilen saatte gelir ve yatsıyı saymaz. Sessiz sapma bırakılmaz — söylenir.
    // Ölçü İLK (yatıştan en uzak) hatırlatmadır (`onceDk` türevi).
    const yatsiOncesi = useMemo(
        () =>
            yatsiOncesiTetikBilgisi(
                koordinat,
                { saat: ayarlar.saat, dakika: ayarlar.dakika, onceDk: ayarlar.onceDk },
                new Date()
            ),
        [koordinat, ayarlar.saat, ayarlar.dakika, ayarlar.onceDk]
    );
    const yatsiOncesiMetni = (() => {
        if (!yatsiOncesi || (!ayarlar.yatsiHatirlatmasi && !ayarlar.muhasebe)) return null;
        const tetik = saatDakika(yatisTetikAni(new Date(), ayarlar));
        const yatsi = saatDakika(yatsiOncesi.yatsiGiris);
        const giris = `Hatırlatma saati (${tetik}) bugün yatsı vaktinden (${yatsi}) önce. `;
        return ayarlar.yatsiHatirlatmasi
            ? `${giris}Yatsı hatırlatması yatsı girdikten sonra gelir.`
            : `${giris}Gün sonu muhasebesi yatsıyı saymaz.`;
    })();
    const stepperDugmesi = (ikon: 'minus' | 'plus', adim: number, etiket: string, pasif: boolean) => (
        <TouchableOpacity
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: pasif ? renkler.sinir : renkler.birincil }}
            onPress={() => saatDegistir(adim)}
            disabled={pasif}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            accessibilityState={{ disabled: pasif }}
        >
            <FontAwesome5 name={ikon} size={14} color={pasif ? renkler.metinIkincil : renkler.birincilMetin} />
        </TouchableOpacity>
    );

    const altSecenek = (
        baslik: string,
        aciklama: string,
        deger: boolean,
        alan: 'yatsiHatirlatmasi' | 'muhasebe'
    ) => (
        <View className="flex-row items-center mt-4">
            <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {aciklama}
                </Text>
            </View>
            <Anahtar
                value={deger}
                onValueChange={(v) => anahtar({ [alan]: v })}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={deger ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel={baslik}
            />
        </View>
    );

    return (
        <View className="mb-6">
            <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
                YATIŞ HATIRLATMASI
            </Text>

            <View className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: renkler.kartArkaplan }}>
                <View className="flex-row items-center p-4">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}15` }}
                    >
                        <FontAwesome5 name="bed" size={16} color={renkler.birincil} solid />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                            Yatmadan önce hatırlat
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            Yatsıyı ve günün eksiklerini uyumadan önce hatırlatalım
                        </Text>
                    </View>
                    <Anahtar
                        value={ayarlar.aktif}
                        onValueChange={(v) => anahtar({ aktif: v })}
                        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                        thumbColor={ayarlar.aktif ? renkler.birincil : '#f4f3f4'}
                        accessibilityLabel="Yatış hatırlatması"
                    />
                </View>

                {ayarlar.aktif && (
                    <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        <Text className="text-xs font-semibold mt-4 mb-3" style={{ color: renkler.metinIkincil }}>
                            Genelde saat kaçta yatıyorsunuz?
                        </Text>
                        <View className="flex-row items-center justify-center gap-3">
                            {stepperDugmesi('minus', -YATIS_DAKIKA_ADIM, 'Yatış saatini 5 dakika geri alın', pencereDk <= 0)}
                            <View
                                className="px-5 py-2 rounded-2xl min-w-[110px] items-center"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                                accessible
                                accessibilityLabel={`Yatış saati ${saatMetni}`}
                            >
                                <Text className="text-2xl font-bold" style={{ color: renkler.metin }}>
                                    {saatMetni}
                                </Text>
                            </View>
                            {stepperDugmesi(
                                'plus',
                                YATIS_DAKIKA_ADIM,
                                'Yatış saatini 5 dakika ileri alın',
                                pencereDk >= PENCERE_UZUNLUGU_DK
                            )}
                        </View>

                        {altSecenek(
                            'Yatsı hatırlatması',
                            'Yatsıyı işaretlemediyseniz uyumadan önce hatırlatır.',
                            ayarlar.yatsiHatirlatmasi,
                            'yatsiHatirlatmasi'
                        )}
                        {altSecenek(
                            'Gün sonu muhasebesi',
                            'İşaretlenmemiş vakitleri gösterir; tek eksik varsa bildirimden işaretleyebilir ya da kazaya ekleyebilirsiniz.',
                            ayarlar.muhasebe,
                            'muhasebe'
                        )}

                        <View className="mt-4">
                            <PencereKarti
                                tanim={tanim}
                                ayar={vakitAyari(ayarlar)}
                                onAdimSec={(indeks) => setDetay(indeks)}
                                onAdimEkle={adimEkleyin}
                                onAdimAcKapa={ayarlar.adimlar.length > 1 ? adimAcKapa : undefined}
                                onAkisiOnizle={() => setOnizleme(true)}
                                stil="gomulu"
                            />
                        </View>

                        {yatsiOncesiMetni && (
                            <View className="flex-row items-start mt-4 gap-2" accessible accessibilityRole="text">
                                <FontAwesome5 name="clock" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                                <Text className="text-xs flex-1" style={{ color: renkler.metin }}>
                                    {yatsiOncesiMetni}
                                </Text>
                            </View>
                        )}

                        <View className="flex-row items-start mt-4 gap-2">
                            <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                İlk hatırlatma yatıştan {ayarlar.onceDk} dk önce gelir; tekrarlar aynı içeriği taşır.
                                Yatsı vakti uzundur; muhafızın “vakit çıkıyor” uyarısı sabaha kalır, bu hatırlatma
                                uykuya dalmadan önce gelir. Özel gün aralığında gönderilmez.
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
                    // Gerçek alarm rızası (#74) — yatışın KENDİ kaydı (muhafızınki taşınmaz).
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
                altBaslik="Yatış hatırlatmasında sesli anons"
                kapatmaNotu="Dilediğiniz zaman hatırlatmanın ayarından kapatabilirsiniz."
                ornekMetin={ornek?.anons ?? ''}
                ttsDestekli={ttsDestekli}
                onOnayla={sesliOnayla}
                onSessizUygula={sesliOlmadan}
                onIptal={() => setSesliBekleyen(null)}
            />

            {rehber.ogeler}
        </View>
    );
};
