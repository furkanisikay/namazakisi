/**
 * Nafile Namazlar ayar sayfası (issue #77).
 *
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde) — gövde
 * yalnız kısa bir açıklama satırıyla başlar.
 *
 * Kuşluk ve evvâbîn kartları ORTAK hatırlatma bileşeninden gelir (`PencereKarti`
 * + `nafilePencereTanimi`; AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran
 * YAZMA"). Teheccüd kartı özeldir: hedefi ("gecenin son üçte biri") bir eşik
 * dakikası olarak ifade edilemez.
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    nafileAyariniGuncelle,
    nafileAyarlariniBirlestir,
    type NafileAyarDegisikligi,
} from '../store/nafileSlice';
import { useNavigation } from '@react-navigation/native';
import { useBildirimButcesi } from '../hooks/useBildirimButcesi';
import { useButceRehberi } from '../hooks/useButceRehberi';
import { BildirimButceKarti } from '../components/bildirim/BildirimButceKarti';
import type { ButceOnerisi } from '../../core/bildirim/butceOnerileri';
import type { NafileAyarlari } from '../../core/nafile/nafileTipleri';
import { Anahtar } from '../components/common/Anahtar';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { PencereKarti } from '../components/hatirlatma/PencereKarti';
import { AdimDetayModal } from '../components/hatirlatma/AdimDetayModal';
import { nafilePencereTanimi } from '../components/hatirlatma/pencereTanimi';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../core/muhafiz/matrisTipleri';
import {
    NAFILE_ADLARI,
    NAFILE_OFSET_ADIM_DK,
    NAFILE_OFSET_MAX_DK,
    NAFILE_OFSET_MIN_DK,
    TEHECCUD_IMSAK_ONCESI_ADIM_DK,
    TEHECCUD_IMSAK_ONCESI_MAX_DK,
    TEHECCUD_IMSAK_ONCESI_MIN_DK,
    type GunduzNafile,
    type TeheccudHedefi,
} from '../../core/nafile/nafileTipleri';
import { NAFILE_ACIKLAMALARI } from '../../core/nafile/nafileMetinleri';
import { teheccudHedefZamani, type NafilePencere } from '../../core/nafile/nafileVakitleri';
import { useNafilePencereleri } from '../hooks/useNafilePencereleri';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

const GUNDUZ_KARTLARI: { tur: GunduzNafile; ikon: string; kisa: string }[] = [
    { tur: 'kusluk', ikon: 'sun', kisa: 'Güneş yükseldikten sonra, öğleden önce' },
    { tur: 'evvabin', ikon: 'cloud-sun', kisa: 'Akşam namazından sonra, yatsıya kadar' },
];

const KUCUK_ADLAR: Record<GunduzNafile, string> = { kusluk: 'kuşluk', evvabin: 'evvâbîn' };

/** Nafile ekranında yalnız nafile önerisi UYGULANIR; muhafız önerileri kendi ekranında. */
const yalnizNafileOnerisi = (o: ButceOnerisi): boolean => o.tur === 'nafileGunuGunune';

/** Tam ayarı kısmi değişiklik biçimine çevirir (geri al / rehber yazımı). */
const tamDegisiklik = (a: NafileAyarlari): NafileAyarDegisikligi => ({
    gostergeAktif: a.gostergeAktif,
    hatirlatmalar: a.hatirlatmalar,
    teheccud: a.teheccud,
    gunuGununeKur: a.gunuGununeKur === true,
});

type AyarNavigasyonu = { navigate: (ekran: string) => void };

const TEHECCUD_HEDEFLERI: { hedef: TeheccudHedefi; etiket: string; ikon: string }[] = [
    { hedef: 'sonUcteBir', etiket: 'Gecenin son üçte biri', ikon: 'star' },
    { hedef: 'imsaktanOnce', etiket: 'İmsaktan önce', ikon: 'hourglass-half' },
];

export const NafileAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const ayarlar = useAppSelector((s) => s.nafile.ayarlar);
    const { pencereler } = useNafilePencereleri();
    const [detayAcik, setDetayAcik] = useState<GunduzNafile | null>(null);
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;

    /**
     * BİLDİRİM SINIRI REHBERİ (issue #298). iOS'ta 64 bekleyen bildirimin asıl
     * yükü nafileden gelir (gündüz 3 gün + teheccüd 7 gece ileri kurulur).
     * Burada yalnız nafile önerisi ("günü gününe kurun") uygulanır; muhafız
     * önerileri için Namaz Muhafızı ekranına yönlendirilir.
     */
    const butce = useBildirimButcesi();
    const rehber = useButceRehberi<NafileAyarlari>(
        butce,
        {
            yaz: (hedef) => {
                if (hedef.nafile && hedef.nafile !== ayarlar) dispatch(nafileAyariniGuncelle(tamDegisiklik(hedef.nafile)));
            },
            yedekAl: () => ayarlar,
            geriYukle: (yedek) => {
                dispatch(nafileAyariniGuncelle(tamDegisiklik(yedek)));
            },
        },
        {
            oneriFiltresi: yalnizNafileOnerisi,
            ekYol: navigation
                ? { etiket: 'Namaz Muhafızı ayarlarında yer açın', onPress: () => navigation.navigate('MuhafizAyarlari') }
                : undefined,
        }
    );

    /**
     * Ayar değişikliği — EKLEME ANINDA SİMÜLASYON: hatırlatmayı açan/sıklaştıran
     * değişiklik sığmıyorsa yazılmaz, rehber açılır.
     */
    const guncelle = useCallback(
        (d: NafileAyarDegisikligi) => {
            const yeni = nafileAyarlariniBirlestir(ayarlar, d);
            if (!rehber.degisikligiDene({ nafile: yeni })) return;
            dispatch(nafileAyariniGuncelle(d));
        },
        [dispatch, ayarlar, rehber]
    );

    const pencereBul = (tur: string): NafilePencere | undefined => pencereler.find((p) => p.tur === tur);

    const tanimlar = useMemo(() => {
        const sonuc = {} as Record<GunduzNafile, ReturnType<typeof nafilePencereTanimi>>;
        for (const k of GUNDUZ_KARTLARI) {
            const p = pencereler.find((x) => x.tur === k.tur);
            sonuc[k.tur] = nafilePencereTanimi({
                kaynak: `nafile:${k.tur}`,
                baslik: NAFILE_ADLARI[k.tur],
                baslikKucuk: KUCUK_ADLAR[k.tur],
                ikon: k.ikon,
                esikSinirlari: { min: NAFILE_OFSET_MIN_DK, max: NAFILE_OFSET_MAX_DK },
                esikAdimDk: NAFILE_OFSET_ADIM_DK,
                pencere: p ? { baslangic: p.baslangic, bitis: p.bitis } : undefined,
            });
        }
        return sonuc;
    }, [pencereler]);

    /** Ayar → ortak bileşenin beklediği tek adımlı pencere (adım daima açık; kart anahtarı kapatır). */
    const pencereAyari = useCallback(
        (tur: GunduzNafile): VakitMuhafizAyari => ({
            yon: 'girisindenItibaren',
            seviyeler: [
                {
                    kademe: 'nazik',
                    kanallar: { bildirim: true },
                    esikDk: ayarlar.hatirlatmalar[tur].ofsetDk,
                    siklik: 'birkez',
                    bildirimSesi: VARSAYILAN_SES,
                    anonsMetni: '',
                },
            ],
        }),
        [ayarlar.hatirlatmalar]
    );

    const teheccudPenceresi = pencereBul('teheccud');
    const teheccudHedefi = teheccudPenceresi
        ? teheccudHedefZamani(teheccudPenceresi, ayarlar.teheccud.hedef, ayarlar.teheccud.imsaktanOnceDk)
        : null;

    const bolumBasligi = (metin: string) => (
        <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );

    const kartBasligi = (ikon: string, baslik: string, aciklama: string, deger: boolean, onDegis: (v: boolean) => void) => (
        <View className="flex-row items-center p-4">
            <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${renkler.birincil}20` }}
            >
                <FontAwesome5 name={ikon} size={17} color={renkler.birincil} solid />
            </View>
            <View className="flex-1 pr-2">
                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {aciklama}
                </Text>
            </View>
            <Anahtar
                value={deger}
                onValueChange={onDegis}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={deger ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel={`${baslik} hatırlatması`}
            />
        </View>
    );

    const bilgiSatiri = (metin: string) => (
        <View className="flex-row items-start mt-3 gap-2">
            <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2 }} />
            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                {metin}
            </Text>
        </View>
    );

    const kartStili = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                className="flex-1"
                style={{ backgroundColor: renkler.arkaplan }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-sm mb-5" style={{ color: renkler.metinIkincil }}>
                    Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, girdiklerinde hatırlatılabilirsiniz.
                </Text>

                {/* Bildirim sınırı (issue #298) — üstte tek kart */}
                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                {/* Gösterge */}
                <View className="mb-6 overflow-hidden" style={kartStili}>
                    {kartBasligi(
                        'eye',
                        'Ana ekranda göster',
                        'Günlük akışta, vakitlerin arasında',
                        ayarlar.gostergeAktif,
                        (v) => guncelle({ gostergeAktif: v })
                    )}
                </View>

                {bolumBasligi('GÜNDÜZ VE AKŞAM')}
                {GUNDUZ_KARTLARI.map((k) => {
                    const ayar = ayarlar.hatirlatmalar[k.tur];
                    return (
                        <View key={k.tur} className="mb-4 overflow-hidden" style={kartStili} testID={`nafile-kart-${k.tur}`}>
                            {kartBasligi(k.ikon, NAFILE_ADLARI[k.tur], k.kisa, ayar.aktif, (v) =>
                                guncelle({ hatirlatmalar: { [k.tur]: { aktif: v } } })
                            )}
                            {ayar.aktif && (
                                <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                                    <PencereKarti
                                        tanim={tanimlar[k.tur]}
                                        ayar={pencereAyari(k.tur)}
                                        onAdimSec={() => setDetayAcik(k.tur)}
                                        stil="gomulu"
                                    />
                                    {bilgiSatiri(NAFILE_ACIKLAMALARI[k.tur])}
                                </View>
                            )}
                        </View>
                    );
                })}

                {detayAcik && (
                    <AdimDetayModal
                        gorunur
                        tanim={tanimlar[detayAcik]}
                        seviyeler={pencereAyari(detayAcik).seviyeler}
                        indeks={0}
                        ttsDestekli={null}
                        onDegistir={(s: SeviyeAyari) => {
                            if (s.esikDk !== ayarlar.hatirlatmalar[detayAcik].ofsetDk) {
                                guncelle({ hatirlatmalar: { [detayAcik]: { ofsetDk: s.esikDk } } });
                            }
                        }}
                        onKapat={() => setDetayAcik(null)}
                    />
                )}

                <View className="mt-2">{bolumBasligi('GECE')}</View>
                <View className="mb-4 overflow-hidden" style={kartStili} testID="nafile-kart-teheccud">
                    {kartBasligi('moon', 'Teheccüd', 'Yatsıdan sonra, imsaka kadar', ayarlar.teheccud.aktif, (v) =>
                        guncelle({ teheccud: { aktif: v } })
                    )}
                    {ayarlar.teheccud.aktif && (
                        <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                            <Text className="text-xs font-bold tracking-wider mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                                NE ZAMAN
                            </Text>
                            <View className="flex-row gap-2">
                                {TEHECCUD_HEDEFLERI.map((h) => {
                                    const secili = ayarlar.teheccud.hedef === h.hedef;
                                    return (
                                        <TouchableOpacity
                                            key={h.hedef}
                                            className="flex-1 flex-row items-center justify-center py-3 px-2 rounded-2xl border"
                                            style={{
                                                backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                borderColor: secili ? renkler.birincil : renkler.sinir,
                                                borderWidth: secili ? 2 : 1,
                                                minHeight: 44,
                                            }}
                                            onPress={() => guncelle({ teheccud: { hedef: h.hedef } })}
                                            activeOpacity={0.7}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: secili }}
                                            accessibilityLabel={h.etiket}
                                        >
                                            <FontAwesome5
                                                name={h.ikon}
                                                size={12}
                                                color={secili ? renkler.birincil : renkler.metinIkincil}
                                                style={{ marginRight: 6 }}
                                                solid
                                            />
                                            <Text
                                                className="text-xs font-semibold"
                                                style={{ color: secili ? renkler.birincil : renkler.metin }}
                                            >
                                                {h.etiket}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {ayarlar.teheccud.hedef === 'imsaktanOnce' && (
                                <View
                                    className="flex-row items-center justify-between p-3.5 rounded-2xl border mt-2"
                                    style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                                >
                                    <Text className="text-sm font-medium flex-1 pr-3" style={{ color: renkler.metin }}>
                                        İmsaka kalan süre
                                    </Text>
                                    <SayisalSecici
                                        deger={ayarlar.teheccud.imsaktanOnceDk}
                                        min={TEHECCUD_IMSAK_ONCESI_MIN_DK}
                                        max={TEHECCUD_IMSAK_ONCESI_MAX_DK}
                                        adim={TEHECCUD_IMSAK_ONCESI_ADIM_DK}
                                        birim="dk önce"
                                        onChange={(v) => guncelle({ teheccud: { imsaktanOnceDk: v } })}
                                        renk={renkler.birincil}
                                        degerGenisligi={92}
                                        aciklama="İmsaktan kaç dk önce"
                                    />
                                </View>
                            )}

                            {teheccudHedefi && teheccudPenceresi && (
                                <Text className="text-sm mt-3" style={{ color: renkler.metin }} testID="teheccud-hedef">
                                    Bu gece {saatMetni(teheccudHedefi)} · imsak {saatMetni(teheccudPenceresi.bitis)}
                                </Text>
                            )}

                            <View
                                className="flex-row items-center mt-4 p-3.5 rounded-2xl border"
                                style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                            >
                                <View className="flex-1 pr-3">
                                    <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                                        Uyandırma
                                    </Text>
                                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {Platform.OS === 'ios'
                                            ? 'Odak modunu deler ve 3 dakika sonra bir kez daha hatırlatır. Telefonun sessiz anahtarı açıksa ses çıkmaz.'
                                            : 'Sessiz modda da çalar ve 3 dakika sonra bir kez daha hatırlatır. Alarm ses düzeyiniz kapalıysa duyulmaz.'}
                                    </Text>
                                </View>
                                <Anahtar
                                    value={ayarlar.teheccud.uyandirma}
                                    onValueChange={(v) => guncelle({ teheccud: { uyandirma: v } })}
                                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                    thumbColor={ayarlar.teheccud.uyandirma ? renkler.birincil : '#f4f3f4'}
                                    accessibilityLabel="Teheccüd uyandırması"
                                />
                            </View>

                            {bilgiSatiri(NAFILE_ACIKLAMALARI.teheccud)}
                        </View>
                    )}
                </View>
            </ScrollView>
            {/* Rehber sayfası + GERİ AL şeridi kaydırılan içeriğin DIŞINDA (şerit sabit kalsın) */}
            {rehber.ogeler}
        </View>
    );
};

export default NafileAyarlariSayfasi;
