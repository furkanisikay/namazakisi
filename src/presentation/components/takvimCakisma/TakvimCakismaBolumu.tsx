/**
 * Takvim çakışması uyarısı ayar bölümü (issue #291; ortak hatırlatma yüzeyleri plan §5.4) —
 * Bildirim Ayarları'nda, "Camide kılacağım" kartının altında.
 *
 * ORTAK BİLEŞEN (AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA"): uyarının adımları
 * TEK `PencereKarti` (`stil="gomulu"`), adım detayı `AdimDetayModal`, önizleme
 * `AkisOnizlemeModal`, tanım `ekHatirlatmaPencereTanimi` — muhafız, nafile, cuma, camiye
 * gitme ve yatışla AYNI yetenekler (1–3 adım, kanal çipleri, ses, titreşim, gerçek alarm +
 * kapsamı, tekrar, akış önizlemesi). İstisnalar (gerekçe kartta yazılı): yön sabit, ton yok,
 * anons metni bağlamdan. Zaman şeridi ÇİZİLMEZ: olay tabanlıdır, sabit bir pencere yoktur.
 *
 * Açma akışı: anahtar → `TakvimCakismaRizaModal` (açık rıza) → sistem takvim
 * izni → ayar `aktif + rizaZamani` ile yazılır. İzin verilmezse ayar AÇILMAZ ve
 * kullanıcı sistem ayarlarına yönlendirilir (`BildirimModali`; sistem diyaloğu yeniden
 * açılabiliyorsa "Tekrar deneyin" sunulur). İzin, rıza modalı TAMAMEN kapandıktan
 * sonra istenir (`izniModalKapandiktanSonraIste`): v0.31.0 iç testinde (Samsung)
 * modal kapanırken aynı anda istenen izin verildiği hâlde "verilmedi" görünüyordu.
 * İzin sonradan geri alınırsa kart bunu söyler ve "İzin verin" düğmesi gösterir; servis o
 * sırada hiçbir şey planlamaz (eski plan temizlenir).
 *
 * ÜÇ RIZA AYRIDIR: takvim okuma (`rizaZamani`, modal), sesli anons (`sesliOnayi`,
 * `SesliOnayModal`) ve gerçek alarm (`alarmOnayi`, `AlarmOnayModal`) — sesli/alarm rızası
 * adım yazımıyla BİRLİKTE yazılır. Kapatmak yalnız takvim rızasını siler.
 *
 * YAZMA DEBOUNCE'LU (cuma deseni): adım değişikliği TEK yazmaya/planlamaya iner; ekrandan
 * çıkışta bekleyen yazma HEMEN uygulanır. Sayıyı YAPISAL artıran adım değişikliği bildirim
 * sınırı rehberinden (`degisikligiDene`) geçer; defter takvimi yalnız özellik AÇIKKEN okur.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, AppState, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { takvimCakismaAyariniGuncelle, takvimCakismaAyarlariniYukle } from '../../store/takvimCakismaSlice';
import { Anahtar } from '../common/Anahtar';
import { BildirimModali } from '../common/BildirimModali';
import { HatirlatmaModulu, ekAdimIslemleri } from '../hatirlatma/HatirlatmaModulu';
import type { AdimRizasi } from '../hatirlatma/AdimDetayModal';
import { ekHatirlatmaPencereTanimi } from '../hatirlatma/pencereTanimi';
import { usePlatformYetenekleri } from '../../hooks/usePlatformYetenekleri';
import { useTurkceTtsDestegi } from '../../hooks/useTurkceTtsDestegi';
import { useBildirimButcesi } from '../../hooks/useBildirimButcesi';
import { useButceRehberi } from '../../hooks/useButceRehberi';
import { TakvimCakismaRizaModal } from './TakvimCakismaRizaModal';
import {
    TAKVIM_CAKISMA_ADIM_KISITLARI,
    TAKVIM_CAKISMA_ONCE_ADIM_DK,
    TAKVIM_CAKISMA_ONCE_MAX_DK,
    TAKVIM_CAKISMA_ONCE_MIN_DK,
    TAKVIM_CAKISMA_TEKRAR_MAX_DK,
    TAKVIM_CAKISMA_TEKRAR_MIN_DK,
    TAKVIM_CAKISMA_VARSAYILAN_TEKRAR_DK,
    takvimCakismaAyarlariniBirlestir,
    type TakvimCakismaAyarlari,
} from '../../../core/takvimCakisma/takvimCakismaAyarlari';
import {
    KILMA_PAYI_DK,
    takvimCakismaAnonsMetni,
    takvimCakismaMetniOlustur,
} from '../../../core/bildirim/takvimCakismaPlani';
import { adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import {
    takvimIzinDurumunuOku,
    takvimIzniIste,
    type TakvimIzinDurumu,
} from '../../../domain/services/TakvimEtkinlikOkuyucu';

/** Arka arkaya değişiklik TEK yazmaya insin (cuma/camiye gitme ile aynı gerekçe). */
const YAZMA_GECIKMESI_MS = 1200;

/**
 * Rıza modalının kapanış animasyonundan sonra izin isteğine kadar beklenen süre.
 * Android'de RN `Modal.onDismiss` çağrılmaz → süre esastır; iOS'ta `onDismiss`
 * önce gelirse beklemeden istenir, gelmezse bu süre güvenlik ağıdır.
 */
export const RIZA_KAPANIS_BEKLEMESI_MS = Platform.OS === 'ios' ? 1000 : 400;

/** Yön sabit gerekçesi (plan §3.3) — kartta seçici yerine yazılır. */
export const TAKVIM_CAKISMA_YON_GEREKCESI = 'Uyarı etkinliğinizden önce gelir; yön, etkinliğin saatine bağlıdır.';

/** İzin reddinde gösterilecek yol: diyalog yeniden açılabiliyorsa tekrar dene, değilse ayarlar. */
type IzinHatasi = null | 'tekrar' | 'ayarlar';

type AyarNavigasyonu = { navigate: (ekran: string) => void };

/** Bu bölüm yalnız takvim çakışmasını yazar → muhafız/nafile önerisi burada UYGULANMAZ (cuma deseni). */
const oneriUygulanmaz = (): boolean => false;

/** Adım dönüşümleri (yüzey kısıtlarıyla) — modül düzeyinde, referans sabit. */
const TAKVIM_CAKISMA_ISLEMLERI = ekAdimIslemleri<TakvimCakismaAyarlari>(TAKVIM_CAKISMA_ADIM_KISITLARI);

/**
 * ÖRNEK çakışma (önizleme ve "Telefonunuz şöyle okur"): öğle vaktine denk gelen tek bir
 * etkinlik. Gerçek uyarının saatleri o günkü etkinlikten gelir; burada yalnız METİN gösterilir,
 * etkinlik adı GÖSTERİLMEZ.
 */
function ornekCakisma() {
    const gun = new Date();
    const an = (s: number, d: number) => new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), s, d).getTime();
    return {
        vakit: 'ogle' as const,
        tur: 'once' as const,
        girisMs: an(13, 0),
        sonAnMs: an(16, 30),
        blokBaslangicMs: an(14, 0),
        blokBitisMs: an(16, 45),
        etkinlikSayisi: 1,
        tekBaslik: null,
    };
}

export const TakvimCakismaBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const kayitli = useAppSelector((s) => s.takvimCakisma.ayarlar);
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();

    const [rizaAcik, setRizaAcik] = useState(false);
    const [izinHatasi, setIzinHatasi] = useState<IzinHatasi>(null);
    const [izin, setIzin] = useState<TakvimIzinDurumu>('bilinmiyor');

    useEffect(() => {
        dispatch(takvimCakismaAyarlariniYukle());
    }, [dispatch]);

    // İzin durumu: açılışta ve sistem ayarlarından dönüşte (sayfa odakta kalır).
    const izniTazele = useCallback(() => {
        void takvimIzinDurumunuOku().then(setIzin);
    }, []);
    useEffect(() => {
        izniTazele();
        const abonelik = AppState.addEventListener('change', (durum) => {
            if (durum === 'active') izniTazele();
        });
        return () => abonelik.remove();
    }, [izniTazele]);

    // ── Taslak + debounce'lu yazma ──
    const [taslak, setTaslak] = useState<TakvimCakismaAyarlari | null>(null);
    const bekleyenRef = useRef<Partial<TakvimCakismaAyarlari> | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ayarlar = taslak ?? kayitli;

    const hemenYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen) dispatch(takvimCakismaAyariniGuncelle(bekleyen));
    }, [dispatch]);

    /** Değişikliği taslağa yazar ve debounce'lu dispatch'i kurar (`hemen` → beklemeden). */
    const yaz = useCallback(
        (degisiklik: Partial<TakvimCakismaAyarlari>, hemen = false) => {
            setTaslak(takvimCakismaAyarlariniBirlestir(taslak ?? kayitli, degisiklik));
            bekleyenRef.current = { ...(bekleyenRef.current ?? {}), ...degisiklik };
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (hemen) {
                hemenYaz();
                return;
            }
            zamanlayiciRef.current = setTimeout(hemenYaz, YAZMA_GECIKMESI_MS);
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
    const rehber = useButceRehberi<TakvimCakismaAyarlari>(
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
        (yeni: TakvimCakismaAyarlari, ek: Partial<TakvimCakismaAyarlari> = {}, hemen = false): boolean => {
            if (
                adimYukuArtiyorMu(ayarlar, yeni) &&
                !rehber.degisikligiDene({ takvimCakisma: yeni }, { once: { takvimCakisma: ayarlar } })
            ) {
                return false;
            }
            yaz({ adimlar: yeni.adimlar, ...ek }, hemen);
            return true;
        },
        [ayarlar, rehber, yaz]
    );

    const anaAnahtar = useCallback(
        async (deger: boolean) => {
            await butonTiklandiFeedback();
            if (deger) {
                // Açmak HER SEFERİNDE açıklamadan geçer (kapatmak rıza kaydını siler).
                setRizaAcik(true);
                return;
            }
            yaz({ aktif: false }, true);
        },
        [butonTiklandiFeedback, yaz]
    );

    /**
     * İzni ister; verilirse `verilince` çalışır, verilmezse doğru yolu gösterir.
     * `etkinlestir`: rıza akışında özelliği rıza kaydıyla açar.
     */
    const izinAkisi = useCallback(
        async (etkinlestir: boolean) => {
            const sonuc = await takvimIzniIste();
            setIzin(sonuc.verildi ? 'verildi' : 'verilmedi');
            if (!sonuc.verildi) {
                setIzinHatasi(sonuc.tekrarSorulabilir ? 'tekrar' : 'ayarlar');
                return;
            }
            if (etkinlestir) {
                yaz({ aktif: true, rizaZamani: new Date().toISOString() }, true);
            } else {
                // Planı izinle yeniden kur (ayar değişmez).
                dispatch(takvimCakismaAyariniGuncelle({}));
            }
        },
        [dispatch, yaz]
    );

    // ── Rıza modalı kapandıktan SONRA izin isteği ──
    /** null = bekleyen istek yok; true = rıza akışı (özelliği aç); false = yalnız izin. */
    const bekleyenIzinRef = useRef<boolean | null>(null);
    const kapanisZamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bekleyenIzniIste = useCallback(() => {
        if (kapanisZamanlayiciRef.current) clearTimeout(kapanisZamanlayiciRef.current);
        kapanisZamanlayiciRef.current = null;
        const etkinlestir = bekleyenIzinRef.current;
        bekleyenIzinRef.current = null;
        if (etkinlestir === null) return;
        void izinAkisi(etkinlestir);
    }, [izinAkisi]);

    useEffect(() => {
        if (rizaAcik || bekleyenIzinRef.current === null) return undefined;
        // InteractionManager RN 0.86'da kullanımdan kalktı ve Modal animasyonunu
        // "etkileşim" saymaz → kapanış süresi kadar düz bekleme.
        if (kapanisZamanlayiciRef.current) clearTimeout(kapanisZamanlayiciRef.current);
        kapanisZamanlayiciRef.current = setTimeout(bekleyenIzniIste, RIZA_KAPANIS_BEKLEMESI_MS);
        return undefined;
    }, [rizaAcik, bekleyenIzniIste]);

    useEffect(
        () => () => {
            if (kapanisZamanlayiciRef.current) clearTimeout(kapanisZamanlayiciRef.current);
        },
        []
    );

    const rizaKabul = useCallback(() => {
        bekleyenIzinRef.current = true;
        setRizaAcik(false);
    }, []);

    const izinVer = useCallback(async () => {
        await butonTiklandiFeedback();
        await izinAkisi(false);
    }, [butonTiklandiFeedback, izinAkisi]);

    const baslikAnahtari = useCallback(
        async (deger: boolean) => {
            await butonTiklandiFeedback();
            yaz({ baslikGoster: deger }, true);
        },
        [butonTiklandiFeedback, yaz]
    );

    // ── Pencere tanımı (ortak kart) ──
    const ornek = useMemo(() => ornekCakisma(), []);
    const ornekAnons = useMemo(() => takvimCakismaAnonsMetni(ornek.vakit, ornek.tur), [ornek]);
    const tanim = useMemo(
        () =>
            ekHatirlatmaPencereTanimi({
                kaynak: 'takvimCakisma',
                yuzey: 'takvim',
                anonsVakitAdi: 'Öğle',
                baslik: 'Takvim çakışması',
                baslikKucuk: 'takvim çakışması',
                ikon: 'calendar-times',
                vakit: ornek.vakit,
                yonSabitGerekcesi: TAKVIM_CAKISMA_YON_GEREKCESI,
                adimSayisi: ayarlar.adimlar.length,
                maksAdim: TAKVIM_CAKISMA_ADIM_KISITLARI.maksAdim,
                esikSinirlari: { min: TAKVIM_CAKISMA_ONCE_MIN_DK, max: TAKVIM_CAKISMA_ONCE_MAX_DK },
                esikAdimDk: TAKVIM_CAKISMA_ONCE_ADIM_DK,
                tekrarMinDk: TAKVIM_CAKISMA_TEKRAR_MIN_DK,
                tekrarMaxDk: TAKVIM_CAKISMA_TEKRAR_MAX_DK,
                varsayilanTekrarDk: TAKVIM_CAKISMA_VARSAYILAN_TEKRAR_DK,
                esikBasligi: 'NE KADAR ÖNCE',
                esikAciklamasi: 'Etkinlik başlamadan',
                esikErisimAdi: 'Etkinlikten kaç dk önce',
                esikBirimi: 'dk önce',
                yetenekler,
                // Anons ADSIZDIR — ayar ne olursa olsun (gizlilik).
                otomatikAnons: () => ornekAnons,
                onizlemeMetni: () => ({
                    ...takvimCakismaMetniOlustur(ornek, { baslikGoster: false }),
                    anons: ornekAnons,
                }),
                onizlemeOzeti: (adet) =>
                    `Bir etkinlik vaktin sonunu kapladığında ${adet} uyarı alırsınız (örnek: öğle vakti)`,
            }),
        [ayarlar.adimlar.length, ornek, ornekAnons, yetenekler]
    );

    /** Modülün yazıcısı: rıza İLK kez verildiyse adımla BİRLİKTE ve hemen yazılır. */
    const modulYaz = useCallback(
        (yeni: TakvimCakismaAyarlari, riza: AdimRizasi): boolean =>
            guncelle(yeni, riza, riza.sesliOnayi === true || riza.alarmOnayi === true),
        [guncelle]
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
                        <FontAwesome5 name="calendar-times" size={18} color={renkler.birincil} solid />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                            Takvim çakışması uyarısı
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            Bir etkinlik vaktin sonunu kaplıyorsa önceden haber verelim
                        </Text>
                    </View>
                    <Anahtar
                        value={ayarlar.aktif}
                        onValueChange={anaAnahtar}
                        trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                        thumbColor={ayarlar.aktif ? renkler.birincil : '#f4f3f4'}
                        accessibilityLabel="Takvim çakışması uyarısı"
                    />
                </View>

                {ayarlar.aktif && (
                    <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        {izin === 'verilmedi' && (
                            <View
                                className="flex-row items-start mt-4 p-3 rounded-xl"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <FontAwesome5
                                    name="exclamation-triangle"
                                    size={13}
                                    color={renkler.durum.uyari}
                                    style={{ marginTop: 2, marginRight: 8 }}
                                />
                                <View className="flex-1">
                                    <Text className="text-sm" style={{ color: renkler.metin }}>
                                        Takvim izni kapalı olduğu için uyarı gönderilemiyor.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={izinVer}
                                        className="flex-row items-center self-start mt-2 px-3 rounded-xl"
                                        style={{ minHeight: 44, backgroundColor: renkler.birincil }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Takvim iznini verin"
                                    >
                                        <FontAwesome5
                                            name="unlock"
                                            size={12}
                                            color={renkler.birincilMetin}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text className="text-sm font-semibold" style={{ color: renkler.birincilMetin }}>
                                            İzin verin
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View className="flex-row items-center justify-between mt-4">
                            <View className="flex-1 mr-3">
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Etkinlik adını gösterin
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    Kapalıyken "Takvimindeki bir etkinlik" yazar. Açarsanız ad, kilit ekranında ve
                                    bildirimleri aynalayan saat ya da bileklik uygulamalarında da görünebilir. Sesli
                                    anonsta ve gerçek alarm ekranında ad hiçbir zaman yer almaz.
                                </Text>
                            </View>
                            <Anahtar
                                value={ayarlar.baslikGoster}
                                onValueChange={baslikAnahtari}
                                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                thumbColor={ayarlar.baslikGoster ? renkler.birincil : '#f4f3f4'}
                                accessibilityLabel="Etkinlik adını bildirimde gösterin"
                            />
                        </View>

                        <View className="mt-4">
                            <HatirlatmaModulu<TakvimCakismaAyarlari>
                                tanim={tanim}
                                deger={ayarlar}
                                islemler={TAKVIM_CAKISMA_ISLEMLERI}
                                yaz={modulYaz}
                                ttsDestekli={ttsDestekli}
                                // Rızalar bu yüzeyin KENDİ kaydı (muhafızınki taşınmaz).
                                sesliOnayiVar={ayarlar.sesliOnayi === true}
                                alarmOnayiVar={ayarlar.alarmOnayi === true}
                                sesliOnayMetinleri={{
                                    altBaslik: 'Takvim çakışması uyarısında sesli okuma',
                                    kapatmaNotu: 'Dilediğiniz zaman hatırlatmanın ayarından kapatabilirsiniz.',
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
                                Bir etkinlik bittiğinde vaktin çıkmasına {KILMA_PAYI_DK} dakikadan az kalıyorsa, ilk uyarı
                                etkinlikten {enErkenDk} dk önce gelir (vakit o sırada henüz girmediyse vakit girince).
                                Tekrarlar aynı uyarıyı etkinliğe kadar yeniden gönderir; namazı kıldığınızda kalanlar
                                iptal edilir. Tüm gün etkinlikleri, "meşgul değil" ya da "belki" işaretliler ve
                                uygulamanın eklediği namaz etkinlikleri sayılmaz. Takviminiz yalnızca bu cihazda okunur;
                                hiçbir yere gönderilmez.
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            <TakvimCakismaRizaModal
                gorunur={rizaAcik}
                onKabul={rizaKabul}
                onVazgec={() => setRizaAcik(false)}
                onKapandi={bekleyenIzniIste}
            />
            <BildirimModali
                gorunur={izinHatasi !== null}
                tip="bilgi"
                baslik="Takvim izni verilmedi"
                mesaj={
                    izinHatasi === 'tekrar'
                        ? 'Uyarının çalışması için takvim izni gerekiyor. İzin penceresinde "İzin ver"i seçebilirsiniz.'
                        : 'Uyarının çalışması için takvim izni gerekiyor. İzni uygulama ayarlarından, İzinler > Takvim bölümünden verebilirsiniz.'
                }
                birincilEtiket={izinHatasi === 'tekrar' ? 'Tekrar deneyin' : 'Ayarları açın'}
                birincilIkon={izinHatasi === 'tekrar' ? 'redo' : 'cog'}
                onBirincil={() => {
                    const tekrar = izinHatasi === 'tekrar';
                    setIzinHatasi(null);
                    if (tekrar) {
                        // Bilgi modalı kapansın, sonra iste (aynı kapanış tuzağı).
                        bekleyenIzinRef.current = !ayarlar.aktif;
                        if (kapanisZamanlayiciRef.current) clearTimeout(kapanisZamanlayiciRef.current);
                        kapanisZamanlayiciRef.current = setTimeout(bekleyenIzniIste, RIZA_KAPANIS_BEKLEMESI_MS);
                        return;
                    }
                    Linking.openSettings().catch(() => undefined);
                }}
                onKapat={() => setIzinHatasi(null)}
            />

            {rehber.ogeler}
        </View>
    );
};
