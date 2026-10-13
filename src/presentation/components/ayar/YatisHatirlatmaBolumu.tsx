/**
 * Bildirim Ayarları > "Yatış hatırlatması" bölümü (issue #290).
 *
 * Kullanıcı her zamanki yatış saatini girer; yatıştan X dk önce TEK bildirim:
 * yatsı kılınmadıysa yatsı hatırlatması, kılındıysa gün sonu muhasebesi
 * ("Bugün 4/5 · öğle işaretlenmemiş" + Kıldım / Kazaya ekle).
 *
 * "Ne kadar önce" ayarı ORTAK hatırlatma bileşeniyle (`PencereKarti` +
 * `AdimDetayModal`, tek adımlı `yatisPencereTanimi`) — cuma deseni. Saat ve
 * önce-dk değişiklikleri taslaktan çizilir, diske/planlamaya debounce ile yazılır
 * (stepper'a arka arkaya basmak tek planlamaya iner), ekrandan çıkışta bekleyen
 * yazma HEMEN uygulanır.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { yatisHatirlatmaAyariniGuncelle } from '../../store/yatisHatirlatmaSlice';
import { Anahtar } from '../common/Anahtar';
import { PencereKarti } from '../hatirlatma/PencereKarti';
import { AdimDetayModal } from '../hatirlatma/AdimDetayModal';
import { yatisPencereTanimi } from '../hatirlatma/pencereTanimi';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../../core/muhafiz/matrisTipleri';
import {
    YATIS_DAKIKA_ADIM,
    YATIS_ONCE_ADIM_DK,
    YATIS_ONCE_MAX_DK,
    YATIS_ONCE_MIN_DK,
    type YatisAyarlari,
} from '../../../core/yatis/yatisPlani';

const YAZMA_GECIKMESI_MS = 1200;

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

type Taslak = Partial<Pick<YatisAyarlari, 'saat' | 'dakika' | 'onceDk'>>;

export const YatisHatirlatmaBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const { ayarlar } = useAppSelector((s) => s.yatisHatirlatma);

    const [taslak, setTaslak] = useState<Taslak | null>(null);
    const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bekleyen = useRef<Taslak | null>(null);

    const yaz = useCallback(
        (degisiklik: Partial<YatisAyarlari>) => {
            dispatch(yatisHatirlatmaAyariniGuncelle(degisiklik));
        },
        [dispatch]
    );

    const taslakYaz = useCallback(
        (degisiklik: Taslak) => {
            const birlesik = { ...(bekleyen.current ?? {}), ...degisiklik };
            bekleyen.current = birlesik;
            setTaslak(birlesik);
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
            zamanlayici.current = setTimeout(() => {
                zamanlayici.current = null;
                const gonder = bekleyen.current;
                bekleyen.current = null;
                if (gonder) yaz(gonder);
            }, YAZMA_GECIKMESI_MS);
        },
        [yaz]
    );

    // Ekrandan çıkışta bekleyen yazma sessizce kaybolmasın.
    useEffect(
        () => () => {
            if (zamanlayici.current) clearTimeout(zamanlayici.current);
            if (bekleyen.current) yaz(bekleyen.current);
        },
        [yaz]
    );

    // Store taslakla eşitlenince taslağı bırak (normalize edilmiş değer görünsün).
    useEffect(() => {
        if (!taslak || bekleyen.current) return;
        const esit = (Object.keys(taslak) as (keyof Taslak)[]).every((k) => ayarlar[k] === taslak[k]);
        if (esit) setTaslak(null);
    }, [ayarlar, taslak]);

    const gosterilen = { ...ayarlar, ...(taslak ?? {}) };
    const pencereDk = saatiPencereDakikasinaCevir(gosterilen.saat, gosterilen.dakika);

    const saatDegistir = (adim: number) => {
        const yeni = Math.min(PENCERE_UZUNLUGU_DK, Math.max(0, pencereDk + adim));
        if (yeni === pencereDk) return;
        void butonTiklandiFeedback();
        taslakYaz(pencereDakikasindanSaate(yeni));
    };

    const anahtar = async (degisiklik: Partial<YatisAyarlari>) => {
        await butonTiklandiFeedback();
        yaz(degisiklik);
    };

    const tanim = useMemo(
        () =>
            yatisPencereTanimi({
                esikSinirlari: { min: YATIS_ONCE_MIN_DK, max: YATIS_ONCE_MAX_DK },
                esikAdimDk: YATIS_ONCE_ADIM_DK,
            }),
        []
    );

    // Adım daima AÇIKtır: kapatma bölümün ana anahtarıyla yapılır (cuma deseni).
    const pencere: VakitMuhafizAyari = useMemo(
        () => ({
            yon: 'cikisaDogru',
            seviyeler: [
                {
                    kademe: 'nazik',
                    kanallar: { bildirim: true },
                    esikDk: gosterilen.onceDk,
                    siklik: 'birkez',
                    bildirimSesi: VARSAYILAN_SES,
                    anonsMetni: '',
                },
            ],
        }),
        [gosterilen.onceDk]
    );

    const [detayAcik, setDetayAcik] = useState(false);
    const adimDegisti = useCallback(
        (s: SeviyeAyari) => {
            if (s.esikDk !== gosterilen.onceDk) taslakYaz({ onceDk: s.esikDk });
        },
        [gosterilen.onceDk, taslakYaz]
    );

    const saatMetni = `${ikiHane(gosterilen.saat)}:${ikiHane(gosterilen.dakika)}`;
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

                        <View className="mt-4">
                            <PencereKarti tanim={tanim} ayar={pencere} onAdimSec={() => setDetayAcik(true)} stil="gomulu" />
                        </View>
                        {detayAcik && (
                            <AdimDetayModal
                                gorunur
                                tanim={tanim}
                                seviyeler={pencere.seviyeler}
                                indeks={0}
                                ttsDestekli={null}
                                onDegistir={adimDegisti}
                                onKapat={() => setDetayAcik(false)}
                            />
                        )}

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

                        <View className="flex-row items-start mt-4 gap-2">
                            <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
                            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                                Yatıştan {gosterilen.onceDk} dk önce tek bildirim gelir. Yatsı vakti uzundur; muhafızın
                                “vakit çıkıyor” uyarısı sabaha kalır, bu hatırlatma uykuya dalmadan önce gelir.
                                Özel gün aralığında gönderilmez.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
