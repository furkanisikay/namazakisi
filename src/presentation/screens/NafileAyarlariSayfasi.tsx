/**
 * Nafile Namazlar ayar sayfası (issue #77, #273).
 *
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde) — gövde
 * yalnız kısa bir açıklama satırıyla başlar.
 *
 * Her nafile kartının gövdesi BİRLEŞİK hatırlatma modülüdür (`HatirlatmaModulu` +
 * `nafilePencereTanimi`; AGENTS.md: "yeni hatırlatma yüzeyi için ayrı ekran YAZMA"): yön,
 * zaman şeridi, en fazla 3 adım (birden çok adımda aç/kapa anahtarı), her adımın tekrarı,
 * Bildirim + Sesli okuma anahtarları, titreşim ve sesli okuma METNİ (`{vakit}` = nafilenin
 * adı). Teheccüd ayrıca pencere (son üçte bir / yatsıdan) ve uyandırma sesi taşır.
 *
 * SESLİ OKUMA / ALARM RIZASI — TEK RIZA (sade tasarım, Dalga 3): bir hatırlatmada verilen
 * onay hepsinde geçerlidir (`useGenelRiza`; eski `NafileAyarlari.sesliOnayi` okunur, yeni
 * onay ortak kayda yazılır). Onay yoksa adım detayının içinde `SesliOnayModal`; reddedilirse
 * adım kurulu kanallarıyla kalır, geri tuşu hiçbir şey yazmaz.
 */
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    nafileAyariniGuncelle,
    nafileAyarlariniBirlestir,
    type NafileAyarDegisikligi,
} from '../store/nafileSlice';
import { useBildirimButcesi } from '../hooks/useBildirimButcesi';
import { useButceRehberi } from '../hooks/useButceRehberi';
import { usePlatformYetenekleri } from '../hooks/usePlatformYetenekleri';
import { useTurkceTtsDestegi } from '../hooks/useTurkceTtsDestegi';
import { useGenelRiza } from '../hooks/useGenelRiza';
import { useNafilePencereleri } from '../hooks/useNafilePencereleri';
import { BildirimButceKarti } from '../components/bildirim/BildirimButceKarti';
import { Anahtar } from '../components/common/Anahtar';
import { HatirlatmaModulu } from '../components/hatirlatma/HatirlatmaModulu';
import type { AdimRizasi } from '../components/hatirlatma/AdimDetayModal';
import { nafilePencereTanimi, type PencereTanimi } from '../components/hatirlatma/pencereTanimi';
import type { HatirlatmaIslemleri } from '../hooks/useHatirlatmaDuzenleyici';
import type { ButceOnerisi } from '../../core/bildirim/butceOnerileri';
import type { VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import {
    NAFILE_ADLARI,
    NAFILE_ADLARI_KUCUK,
    nafileAyariniAl,
    type NafileAyarlari,
    type NafileHatirlatmaAyari,
    type NafileTuru,
    type TeheccudPenceresi,
} from '../../core/nafile/nafileTipleri';
import {
    nafileAdimEkle,
    nafileAdimGuncelle,
    nafileAdimSil,
    nafileYonunuDegistir,
    nafileYukuArtiyorMu,
} from '../../core/nafile/nafileAdimlari';
import { NAFILE_ACIKLAMALARI, nafileAnonsMetni, nafileBildirimMetni } from '../../core/nafile/nafileMetinleri';
import { nafileAnonsOrnegi, nafilePencereUzunluguDk } from '../../core/nafile/nafilePlani';
import { teheccudPenceresiniUygula, type NafilePencere } from '../../core/nafile/nafileVakitleri';
import { useCihazDurumu } from '../hooks/useCihazDurumu';
import { durumNotu } from '../../core/cihaz/durumNotlari';
import { DurumSatiri } from '../components/ortak/DurumSatiri';
import { bicim, metin, sayili } from '../../core/dil/aktifDil';
import { useMetin } from '../hooks/useMetin';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

const nm = () => metin().muhafizAyar.nafile;

const KARTLAR: { tur: NafileTuru; ikon: string; readonly kisa: string }[] = [
    { tur: 'kusluk', ikon: 'sun', get kisa() { return nm().kisa.kusluk; } },
    { tur: 'evvabin', ikon: 'cloud-sun', get kisa() { return nm().kisa.evvabin; } },
    { tur: 'teheccud', ikon: 'moon', get kisa() { return nm().kisa.teheccud; } },
];

const TEHECCUD_PENCERELERI: { pencere: TeheccudPenceresi; readonly etiket: string; ikon: string }[] = [
    { pencere: 'sonUcteBir', get etiket() { return nm().pencereler.sonUcteBir; }, ikon: 'star' },
    { pencere: 'yatsi', get etiket() { return nm().pencereler.yatsi; }, ikon: 'moon' },
];

/** Nafile ekranında yalnız nafile önerisi UYGULANIR; muhafız önerileri kendi ekranında. */
const yalnizNafileOnerisi = (o: ButceOnerisi): boolean => o.tur === 'nafileGunuGunune';

/** Tam ayarı kısmi değişiklik biçimine çevirir (geri al / rehber yazımı). */
const tamDegisiklik = (a: NafileAyarlari): NafileAyarDegisikligi => ({
    // Nafile başına gösterge — `gostergeAktif` (türev) üçünü birden yazardı.
    gosterge: a.gosterge,
    hatirlatmalar: a.hatirlatmalar,
    teheccud: a.teheccud,
    gunuGununeKur: a.gunuGununeKur === true,
});

/** Bir nafilenin ayarını değişiklik biçimine sarar. */
const turDegisikligi = (tur: NafileTuru, ayar: Partial<NafileHatirlatmaAyari>): NafileAyarDegisikligi =>
    tur === 'teheccud' ? { teheccud: ayar } : { hatirlatmalar: { [tur]: ayar } };

type AyarNavigasyonu = { navigate: (ekran: string) => void };

/** Bir nafilenin adım dönüşümleri (nafile kısıtları; yeni adım bugünkü pencereye sığdırılır). */
const nafileIslemleri = (pencereUzunluguDk: number | undefined): HatirlatmaIslemleri<NafileHatirlatmaAyari> => ({
    adimlar: (a) => a.adimlar,
    ekle: (a) => nafileAdimEkle(a, pencereUzunluguDk),
    guncelle: (a, i, seviye) => nafileAdimGuncelle(a, i, seviye),
    sil: (a, i) => nafileAdimSil(a, i),
});

const SES_ALANLARI = ['alarmSesiAcik'] as const;

export const NafileAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const sozluk = useMetin();
    const mn = sozluk.muhafizAyar.nafile;
    // Teheccüd uyandırması alarm sesiyle çalar: alarm ses düzeyi 0 ise SÖYLE (ölç, varsayma).
    const { durum: cihaz } = useCihazDurumu(SES_ALANLARI, Platform.OS === 'android');
    const dispatch = useAppDispatch();
    const ayarlar = useAppSelector((s) => s.nafile.ayarlar);
    const { pencereler } = useNafilePencereleri();
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();
    const genelRiza = useGenelRiza();
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;

    /**
     * BİLDİRİM SINIRI REHBERİ (issue #298). Burada yalnız nafile önerisi
     * ("günü gününe kurun") uygulanır; muhafız önerileri için Namaz Muhafızı
     * ekranına yönlendirilir.
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
                ? { etiket: sozluk.hatirlatma.ek.ekYol, onPress: () => navigation.navigate('MuhafizAyarlari') }
                : undefined,
        }
    );

    /**
     * Ayar değişikliği — EKLEME ANINDA SİMÜLASYON yalnız sayıyı YAPISAL olarak
     * artıran değişikliklerde (`nafileYukuArtiyorMu`): açma, adım ekleme, sesli
     * kanal, tekrar. Salt zaman değişimi (eşik/yön/pencere) kapıdan GEÇMEZ —
     * aşımdaki kullanıcı var olan hatırlatmasının saatini değiştirebilmeli.
     */
    const guncelle = useCallback(
        (d: NafileAyarDegisikligi): boolean => {
            const yeni = nafileAyarlariniBirlestir(ayarlar, d);
            if (nafileYukuArtiyorMu(ayarlar, yeni) && !rehber.degisikligiDene({ nafile: yeni })) return false;
            dispatch(nafileAyariniGuncelle(d));
            return true;
        },
        [dispatch, ayarlar, rehber]
    );

    const ayariYaz = useCallback(
        (tur: NafileTuru, yeni: NafileHatirlatmaAyari, ek: Partial<NafileAyarDegisikligi> = {}) => {
            if (yeni === nafileAyariniAl(ayarlar, tur) && Object.keys(ek).length === 0) return true;
            return guncelle({ ...turDegisikligi(tur, yeni), ...ek });
        },
        [ayarlar, guncelle]
    );

    /** Her nafilenin BUGÜNKÜ hatırlatma penceresi (teheccüdde seçilen pencere). */
    const pencereAl = useCallback(
        (tur: NafileTuru): NafilePencere | undefined => {
            const ham = pencereler.find((p) => p.tur === tur);
            if (!ham) return undefined;
            return tur === 'teheccud' ? teheccudPenceresiniUygula(ham, ayarlar.teheccud.pencere) : ham;
        },
        [pencereler, ayarlar.teheccud.pencere]
    );

    const tanimlar = useMemo(() => {
        const sonuc = {} as Record<NafileTuru, PencereTanimi>;
        for (const k of KARTLAR) {
            const ayar = nafileAyariniAl(ayarlar, k.tur);
            const p = pencereAl(k.tur);
            const pencere = p ? { baslangic: p.baslangic, bitis: p.bitis } : undefined;
            const uzunluk = pencere ? nafilePencereUzunluguDk(pencere) : undefined;
            const teheccudPenceresi = k.tur === 'teheccud' ? ayarlar.teheccud.pencere : undefined;
            const uyandirma = k.tur === 'teheccud' && ayarlar.teheccud.uyandirma;
            sonuc[k.tur] = nafilePencereTanimi({
                kaynak: `nafile:${k.tur}`,
                baslik: NAFILE_ADLARI[k.tur],
                baslikKucuk: NAFILE_ADLARI_KUCUK[k.tur],
                ikon: k.ikon,
                yon: ayar.yon,
                adimSayisi: ayar.adimlar.length,
                pencere,
                yetenekler,
                otomatikAnons: (s) =>
                    nafileAnonsOrnegi(k.tur, ayar.yon, s.esikDk, {
                        pencereUzunluguDk: uzunluk,
                        teheccudPenceresi,
                    }),
                // Önizlemede nafilenin GERÇEK metni (plan üreticisiyle aynı kaynak).
                onizlemeMetni: (adim, ilk) => {
                    const girdi = {
                        tur: k.tur,
                        son: pencere?.bitis ?? new Date(),
                        yon: ayar.yon,
                        ilk,
                        kalanDk: adim.kalanDk,
                        teheccudPenceresi,
                        uyandirma,
                    };
                    return { ...nafileBildirimMetni(girdi), anons: nafileAnonsMetni(girdi) };
                },
                onizlemeOzeti: (adet) => sayili(nm().onizlemeOzeti, adet, { ad: NAFILE_ADLARI_KUCUK[k.tur] }),
            });
        }
        return sonuc;
        // Dil değişince tanım (başlık, metinler) yeniden kurulur.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ayarlar, pencereAl, yetenekler, sozluk]);

    const vakitAyari = (ayar: NafileHatirlatmaAyari): VakitMuhafizAyari => ({ yon: ayar.yon, seviyeler: ayar.adimlar });

    const yonDegistir = (tur: NafileTuru, yon: PencereYonu) =>
        ayariYaz(tur, nafileYonunuDegistir(nafileAyariniAl(ayarlar, tur), yon));

    /** Her nafilenin adım dönüşümleri (bugünkü pencere uzunluğuyla). */
    const islemler = useMemo(() => {
        const sonuc = {} as Record<NafileTuru, HatirlatmaIslemleri<NafileHatirlatmaAyari>>;
        for (const k of KARTLAR) sonuc[k.tur] = nafileIslemleri(tanimlar[k.tur].pencereUzunluguDk);
        return sonuc;
    }, [tanimlar]);

    const bolumBasligi = (metin: string) => (
        <Text className="text-xs font-bold tracking-wider mb-3" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );

    const kartBasligi = (ikon: string, baslik: string, aciklama: string, deger: boolean, onDegis: (v: boolean) => unknown) => (
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
                onValueChange={(v) => {
                    onDegis(v);
                }}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={deger ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel={bicim(mn.anahtarEtiketi, { ad: baslik })}
            />
        </View>
    );

    const bilgiSatiri = (metin: string, ikon = 'info-circle', renk = renkler.metinIkincil) => (
        <View className="flex-row items-start mt-3 gap-2">
            <FontAwesome5 name={ikon} size={12} color={renk} style={{ marginTop: 2 }} solid />
            <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                {metin}
            </Text>
        </View>
    );

    const teheccudPenceresiSecici = () => {
        const ham = pencereler.find((p) => p.tur === 'teheccud');
        return (
            <>
                <Text className="text-xs font-bold tracking-wider mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                    {mn.pencere}
                </Text>
                <View className="flex-row gap-2 mb-3">
                    {TEHECCUD_PENCERELERI.map((h) => {
                        const secili = ayarlar.teheccud.pencere === h.pencere;
                        const an = ham ? (h.pencere === 'yatsi' ? ham.baslangic : ham.faziletli) : null;
                        const etiket = an ? `${h.etiket} · ${saatMetni(an)}` : h.etiket;
                        return (
                            <TouchableOpacity
                                key={h.pencere}
                                className="flex-1 flex-row items-center justify-center py-3 px-2 rounded-2xl border"
                                style={{
                                    backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                    borderColor: secili ? renkler.birincil : renkler.sinir,
                                    borderWidth: secili ? 2 : 1,
                                    minHeight: 44,
                                }}
                                onPress={() => guncelle({ teheccud: { pencere: h.pencere } })}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityState={{ selected: secili }}
                                accessibilityLabel={bicim(mn.pencereEtiketi, { etiket })}
                            >
                                <FontAwesome5
                                    name={h.ikon}
                                    size={12}
                                    color={secili ? renkler.birincil : renkler.metinIkincil}
                                    style={{ marginRight: 6 }}
                                    solid
                                />
                                <Text className="text-xs font-semibold" style={{ color: secili ? renkler.birincil : renkler.metin }}>
                                    {etiket}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </>
        );
    };

    const uyandirmaSatiri = () => (
        <>
            <View
                className="flex-row items-center mt-2 p-3.5 rounded-2xl border"
                style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
            >
                <View className="flex-1 pr-3">
                    <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                        {mn.uyandirma}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {Platform.OS === 'ios'
                            ? mn.uyandirmaIos
                            : mn.uyandirmaAndroid}
                    </Text>
                </View>
                <Anahtar
                    value={ayarlar.teheccud.uyandirma}
                    onValueChange={(v) => {
                        guncelle({ teheccud: { uyandirma: v } });
                    }}
                    trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                    thumbColor={ayarlar.teheccud.uyandirma ? renkler.birincil : '#f4f3f4'}
                    accessibilityLabel={mn.uyandirmaEtiketi}
                />
            </View>
            {ayarlar.teheccud.uyandirma && <DurumSatiri durum={durumNotu('alarmSesi', cihaz)} style={{ marginTop: 8 }} />}
        </>
    );

    /**
     * "Ana ekranda göster" — nafilenin KENDİ kartında (sahip geri bildirimi; eskiden üç
     * anahtar ayrı bir kartta duruyordu). Hatırlatmadan BAĞIMSIZDIR: hatırlatma kapalıyken
     * de görünür, çünkü gösterge yalnız günlük akıştaki satırı açar.
     */
    const gostergeSatiri = (tur: NafileTuru) => (
        <View
            className="flex-row items-center p-3.5 rounded-2xl border"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 52 }}
        >
            <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${renkler.birincil}20` }}
            >
                <FontAwesome5 name="eye" size={13} color={renkler.birincil} solid />
            </View>
            <View className="flex-1 pr-3">
                <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                    {mn.gosterge}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {mn.gostergeAciklama}
                </Text>
            </View>
            <Anahtar
                testID={`nafile-gosterge-${tur}`}
                value={ayarlar.gosterge[tur]}
                onValueChange={(v) => {
                    guncelle({ gosterge: { [tur]: v } });
                }}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={ayarlar.gosterge[tur] ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel={bicim(mn.gostergeEtiketi, { ad: NAFILE_ADLARI[tur] })}
            />
        </View>
    );

    const kart = (k: (typeof KARTLAR)[number]) => {
        const ayar = nafileAyariniAl(ayarlar, k.tur);
        const tanim = tanimlar[k.tur];
        const karsiYon: PencereYonu = ayar.yon === 'girisindenItibaren' ? 'cikisaDogru' : 'girisindenItibaren';
        return (
            <View
                key={k.tur}
                className="mb-4 overflow-hidden"
                style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}
                testID={`nafile-kart-${k.tur}`}
            >
                {kartBasligi(k.ikon, NAFILE_ADLARI[k.tur], k.kisa, ayar.aktif, (v) =>
                    guncelle(turDegisikligi(k.tur, { aktif: v }))
                )}
                <View className={ayar.aktif ? 'px-4 pb-3' : 'px-4 pb-4'}>{gostergeSatiri(k.tur)}</View>
                {ayar.aktif && (
                    <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        {k.tur === 'teheccud' ? teheccudPenceresiSecici() : <View className="h-3" />}
                        <HatirlatmaModulu<NafileHatirlatmaAyari>
                            tanim={tanim}
                            deger={ayar}
                            islemler={islemler[k.tur]}
                            // Rıza adım yazımıyla BİRLİKTE (iki eşzamanlı thunk birbirini ezerdi).
                            yaz={(yeni, riza: AdimRizasi) => {
                                // TEK RIZA (Dalga 3): onay nafilenin alanına değil ORTAK kayda.
                                const yazildi = ayariYaz(k.tur, yeni);
                                if (yazildi) genelRiza.ver(riza);
                                return yazildi;
                            }}
                            ttsDestekli={ttsDestekli}
                            // Rızalar nafilenin KENDİ kaydı (muhafızınki taşınmaz).
                            sesliOnayiVar={genelRiza.sesli}
                            alarmOnayiVar={genelRiza.alarm}
                            sesliOnayMetinleri={{
                                altBaslik: mn.sesliAltBaslik,
                                kapatmaNotu: sozluk.hatirlatma.adim.sesliKapatmaNotu,
                            }}
                            silinebilirMi={(a) => a.adimlar.length > 1}
                            karsiYonAyari={vakitAyari(nafileYonunuDegistir(ayar, karsiYon))}
                            onYonDegistir={(yon) => yonDegistir(k.tur, yon)}
                            stil="gomulu"
                        />
                        {k.tur === 'teheccud' && uyandirmaSatiri()}
                        {bilgiSatiri(
                            mn.kildim,
                            'check-circle',
                            renkler.birincil
                        )}
                        {bilgiSatiri(NAFILE_ACIKLAMALARI[k.tur])}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                className="flex-1"
                style={{ backgroundColor: renkler.arkaplan }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-sm mb-5" style={{ color: renkler.metinIkincil }}>
                    {mn.giris}
                </Text>

                {/* Bildirim sınırı (issue #298) — üstte tek kart */}
                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                {bolumBasligi(mn.gunduz)}
                {kart(KARTLAR[0])}
                {kart(KARTLAR[1])}

                <View className="mt-2">{bolumBasligi(mn.gece)}</View>
                {kart(KARTLAR[2])}
            </ScrollView>

            {/* Rehber sayfası + GERİ AL şeridi kaydırılan içeriğin DIŞINDA (şerit sabit kalsın) */}
            {rehber.ogeler}
        </View>
    );
};

export default NafileAyarlariSayfasi;
