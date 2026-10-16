/**
 * Takvim çakışması uyarısı ayar bölümü (issue #291) — Bildirim Ayarları'nda,
 * "Camide kılacağım" kartının altında.
 *
 * Açma akışı: anahtar → `TakvimCakismaRizaModal` (açık rıza) → sistem takvim
 * izni → ayar `aktif + rizaZamani` ile yazılır. İzin verilmezse ayar AÇILMAZ ve
 * kullanıcı sistem ayarlarına yönlendirilir (`BildirimModali`; sistem diyaloğu yeniden
 * açılabiliyorsa "Tekrar deneyin" sunulur). İzin, rıza modalı TAMAMEN kapandıktan
 * sonra istenir (`izniModalKapandiktanSonraIste`): v0.31.0 iç testinde (Samsung)
 * modal kapanırken aynı anda istenen izin verildiği hâlde "verilmedi" görünüyordu.
 * İzin sonradan
 * geri alınırsa kart bunu söyler ve "İzin verin" düğmesi gösterir; servis o
 * sırada hiçbir şey planlamaz (eski plan temizlenir).
 */
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, AppState, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { takvimCakismaAyariniGuncelle, takvimCakismaAyarlariniYukle } from '../../store/takvimCakismaSlice';
import { Anahtar } from '../common/Anahtar';
import { SayisalSecici } from '../common/SayisalSecici';
import { BildirimModali } from '../common/BildirimModali';
import { TakvimCakismaRizaModal } from './TakvimCakismaRizaModal';
import {
    TAKVIM_CAKISMA_ONCE_ADIM_DK,
    TAKVIM_CAKISMA_ONCE_MAX_DK,
    TAKVIM_CAKISMA_ONCE_MIN_DK,
} from '../../../core/takvimCakisma/takvimCakismaAyarlari';
import { KILMA_PAYI_DK } from '../../../core/bildirim/takvimCakismaPlani';
import {
    takvimIzinDurumunuOku,
    takvimIzniIste,
    type TakvimIzinDurumu,
} from '../../../domain/services/TakvimEtkinlikOkuyucu';

/** Stepper'a arka arkaya basmak TEK yazmaya insin (cuma/camiye gitme ile aynı gerekçe). */
const YAZMA_GECIKMESI_MS = 1200;

/**
 * Rıza modalının kapanış animasyonundan sonra izin isteğine kadar beklenen süre.
 * Android'de RN `Modal.onDismiss` çağrılmaz → süre esastır; iOS'ta `onDismiss`
 * önce gelirse beklemeden istenir, gelmezse bu süre güvenlik ağıdır.
 */
export const RIZA_KAPANIS_BEKLEMESI_MS = Platform.OS === 'ios' ? 1000 : 400;

/** İzin reddinde gösterilecek yol: diyalog yeniden açılabiliyorsa tekrar dene, değilse ayarlar. */
type IzinHatasi = null | 'tekrar' | 'ayarlar';

export const TakvimCakismaBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ayarlar = useAppSelector((s) => s.takvimCakisma.ayarlar);

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

    // ── Önceden süre: taslak + debounce'lu yazma ──
    const [taslakDk, setTaslakDk] = useState<number | null>(null);
    const bekleyenRef = useRef<number | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bekleyeniYaz = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
        const bekleyen = bekleyenRef.current;
        bekleyenRef.current = null;
        if (bekleyen != null) dispatch(takvimCakismaAyariniGuncelle({ oncedenDk: bekleyen }));
    }, [dispatch]);

    const sureDegistir = useCallback(
        (deger: number) => {
            setTaslakDk(deger);
            bekleyenRef.current = deger;
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            zamanlayiciRef.current = setTimeout(bekleyeniYaz, YAZMA_GECIKMESI_MS);
        },
        [bekleyeniYaz]
    );

    useEffect(() => () => bekleyeniYaz(), [bekleyeniYaz]);
    useEffect(() => {
        if (bekleyenRef.current == null) setTaslakDk(null);
    }, [ayarlar.oncedenDk]);

    const oncedenDk = taslakDk ?? ayarlar.oncedenDk;

    const anaAnahtar = useCallback(
        async (deger: boolean) => {
            await butonTiklandiFeedback();
            if (deger) {
                // Açmak HER SEFERİNDE açıklamadan geçer (kapatmak rıza kaydını siler).
                setRizaAcik(true);
                return;
            }
            dispatch(takvimCakismaAyariniGuncelle({ aktif: false }));
        },
        [butonTiklandiFeedback, dispatch]
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
                dispatch(takvimCakismaAyariniGuncelle({ aktif: true, rizaZamani: new Date().toISOString() }));
            } else {
                // Planı izinle yeniden kur (ayar değişmez).
                dispatch(takvimCakismaAyariniGuncelle({}));
            }
        },
        [dispatch]
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
            dispatch(takvimCakismaAyariniGuncelle({ baslikGoster: deger }));
        },
        [butonTiklandiFeedback, dispatch]
    );

    return (
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
                                    <FontAwesome5 name="unlock" size={12} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
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
                                Ne kadar önce
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Etkinlik başlamadan
                            </Text>
                        </View>
                        <SayisalSecici
                            deger={oncedenDk}
                            min={TAKVIM_CAKISMA_ONCE_MIN_DK}
                            max={TAKVIM_CAKISMA_ONCE_MAX_DK}
                            adim={TAKVIM_CAKISMA_ONCE_ADIM_DK}
                            onChange={sureDegistir}
                            renk={renkler.birincil}
                            aciklama="Etkinlikten önceki süre"
                        />
                    </View>

                    <View className="flex-row items-center justify-between mt-5">
                        <View className="flex-1 mr-3">
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Etkinlik adını gösterin
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Kapalıyken "Takvimindeki bir etkinlik" yazar. Açarsanız ad, kilit ekranında ve
                                bildirimleri aynalayan saat ya da bileklik uygulamalarında da görünebilir.
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

                    <View className="flex-row items-start mt-5 gap-2">
                        <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                        <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                            Bir etkinlik bittiğinde vaktin çıkmasına {KILMA_PAYI_DK} dakikadan az kalıyorsa,
                            etkinlikten {oncedenDk} dk önce uyarılırsınız (vakit o sırada henüz girmediyse vakit
                            girince). Tüm gün etkinlikleri, "meşgul değil" ya da "belki"
                            işaretliler ve uygulamanın eklediği namaz etkinlikleri sayılmaz. Takviminiz yalnızca bu
                            cihazda okunur; hiçbir yere gönderilmez.
                        </Text>
                    </View>
                </View>
            )}

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
        </View>
    );
};
