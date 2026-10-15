/**
 * Nafile Namazlar ayar sayfası (issue #77, #273).
 *
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde) — gövde
 * yalnız kısa bir açıklama satırıyla başlar.
 *
 * Her nafile kartı ORTAK hatırlatma bileşeninden gelir (`PencereKarti` +
 * `AdimDetayModal` + `nafilePencereTanimi`; AGENTS.md: "yeni hatırlatma yüzeyi
 * için ayrı ekran YAZMA"): yön, zaman şeridi, en fazla 3 adım, her adımın
 * sıklığı ve kanalları (bildirim / sesli anons / ikisi + titreşim). Teheccüd
 * ayrıca pencere (son üçte bir / yatsıdan) ve uyandırma sesi taşır.
 *
 * SESLİ ANONS RIZASI (`NafileAyarlari.sesliOnayi`, muhafızınkinden AYRI): bir
 * adımda sesli kanal İLK kez açılırken `SesliOnayModal`; reddedilirse adım
 * bildirimle kalır, geri tuşu hiçbir şey yazmaz.
 */
import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import { useNafilePencereleri } from '../hooks/useNafilePencereleri';
import { BildirimButceKarti } from '../components/bildirim/BildirimButceKarti';
import { Anahtar } from '../components/common/Anahtar';
import { PencereKarti } from '../components/hatirlatma/PencereKarti';
import { AdimDetayModal } from '../components/hatirlatma/AdimDetayModal';
import { nafilePencereTanimi, type PencereTanimi } from '../components/hatirlatma/pencereTanimi';
import { SesliOnayModal } from './MuhafizAyarlari/SesliOnayModal';
import type { ButceOnerisi } from '../../core/bildirim/butceOnerileri';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
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
import { NAFILE_ACIKLAMALARI } from '../../core/nafile/nafileMetinleri';
import { nafileAnonsOrnegi, nafilePencereUzunluguDk } from '../../core/nafile/nafilePlani';
import { teheccudPenceresiniUygula, type NafilePencere } from '../../core/nafile/nafileVakitleri';

const saatMetni = (t: Date): string =>
    `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

const KARTLAR: { tur: NafileTuru; ikon: string; kisa: string }[] = [
    { tur: 'kusluk', ikon: 'sun', kisa: 'Güneş yükseldikten sonra, öğleden önce' },
    { tur: 'evvabin', ikon: 'cloud-sun', kisa: 'Akşam namazından sonra, yatsıya kadar' },
    { tur: 'teheccud', ikon: 'moon', kisa: 'Yatsıdan sonra, imsaka kadar' },
];

const TEHECCUD_PENCERELERI: { pencere: TeheccudPenceresi; etiket: string; ikon: string }[] = [
    { pencere: 'sonUcteBir', etiket: 'Son üçte bir', ikon: 'star' },
    { pencere: 'yatsi', etiket: 'Yatsıdan', ikon: 'moon' },
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

interface SesliBekleyen {
    tur: NafileTuru;
    indeks: number;
    seviye: SeviyeAyari;
}

export const NafileAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const ayarlar = useAppSelector((s) => s.nafile.ayarlar);
    const { pencereler } = useNafilePencereleri();
    const yetenekler = usePlatformYetenekleri();
    const ttsDestekli = useTurkceTtsDestegi();
    const [detay, setDetay] = useState<{ tur: NafileTuru; indeks: number } | null>(null);
    const [sesliBekleyen, setSesliBekleyen] = useState<SesliBekleyen | null>(null);
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
                ? { etiket: 'Namaz Muhafızı ayarlarında yer açın', onPress: () => navigation.navigate('MuhafizAyarlari') }
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
            sonuc[k.tur] = nafilePencereTanimi({
                kaynak: `nafile:${k.tur}`,
                baslik: NAFILE_ADLARI[k.tur],
                baslikKucuk: NAFILE_ADLARI_KUCUK[k.tur],
                ikon: k.ikon,
                yon: ayar.yon,
                adimSayisi: ayar.adimlar.length,
                pencere,
                yetenekler,
                anonsOrnegiOlustur: (s) =>
                    nafileAnonsOrnegi(k.tur, ayar.yon, s.esikDk, {
                        pencereUzunluguDk: uzunluk,
                        teheccudPenceresi: k.tur === 'teheccud' ? ayarlar.teheccud.pencere : undefined,
                    }),
            });
        }
        return sonuc;
    }, [ayarlar, pencereAl, yetenekler]);

    const vakitAyari = (ayar: NafileHatirlatmaAyari): VakitMuhafizAyari => ({ yon: ayar.yon, seviyeler: ayar.adimlar });

    const adimEkle = (tur: NafileTuru) => {
        const ayar = nafileAyariniAl(ayarlar, tur);
        const yeni = nafileAdimEkle(ayar, tanimlar[tur].pencereUzunluguDk);
        if (yeni === ayar) return;
        if (!ayariYaz(tur, yeni)) return;
        // Yeni adımın detayını aç (prototip): dizide eski eşiklerde olmayan tek adım.
        const eskiEsikler = new Set(ayar.adimlar.map((a) => a.esikDk));
        const indeks = yeni.adimlar.findIndex((a) => !eskiEsikler.has(a.esikDk));
        if (indeks >= 0) setDetay({ tur, indeks });
    };

    const yonDegistir = (tur: NafileTuru, yon: PencereYonu) =>
        ayariYaz(tur, nafileYonunuDegistir(nafileAyariniAl(ayarlar, tur), yon));

    /** `AlarmOnayModal` onaylandı; rıza bir sonraki adım yazımıyla birlikte kaydedilir. */
    const alarmOnayiBekliyor = useRef(false);

    /** Adım detayındaki değişiklik — sesli kanal ilk kez açılıyorsa önce rıza. */
    const adimDegistir = (tur: NafileTuru, indeks: number, seviye: SeviyeAyari) => {
        const ayar = nafileAyariniAl(ayarlar, tur);
        const eski = ayar.adimlar[indeks];
        if (!eski) return;
        if (alarmOnayiBekliyor.current) {
            alarmOnayiBekliyor.current = false;
            ayariYaz(tur, nafileAdimGuncelle(ayar, indeks, seviye), { alarmOnayi: true });
            return;
        }
        const sesliAciliyor = seviye.kanallar?.sesli === true && eski.kanallar?.sesli !== true;
        if (sesliAciliyor && ayarlar.sesliOnayi !== true) {
            setSesliBekleyen({ tur, indeks, seviye });
            return;
        }
        ayariYaz(tur, nafileAdimGuncelle(ayar, indeks, seviye));
    };

    const sesliOnayla = () => {
        if (!sesliBekleyen) return;
        const { tur, indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        ayariYaz(tur, nafileAdimGuncelle(nafileAyariniAl(ayarlar, tur), indeks, seviye), { sesliOnayi: true });
    };

    /** "Sesli olmadan": adım bildirimle kalır (titreşim korunur). */
    const sesliOlmadan = () => {
        if (!sesliBekleyen) return;
        const { tur, indeks, seviye } = sesliBekleyen;
        setSesliBekleyen(null);
        const kanallar = { ...seviye.kanallar, sesli: false, bildirim: true };
        ayariYaz(tur, nafileAdimGuncelle(nafileAyariniAl(ayarlar, tur), indeks, { ...seviye, kanallar }));
    };

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
                accessibilityLabel={`${baslik} hatırlatması`}
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
                    PENCERE
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
                                accessibilityLabel={`Teheccüd penceresi: ${etiket}`}
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
        <View
            className="flex-row items-center mt-2 p-3.5 rounded-2xl border"
            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
        >
            <View className="flex-1 pr-3">
                <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                    Uyandırma sesi
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                    {Platform.OS === 'ios'
                        ? 'Odak modunu deler. Telefonun sessiz anahtarı açıksa ses çıkmaz.'
                        : 'Alarm sesiyle çalar, sessiz modu deler. Alarm ses düzeyiniz kapalıysa duyulmaz.'}
                </Text>
            </View>
            <Anahtar
                value={ayarlar.teheccud.uyandirma}
                onValueChange={(v) => {
                    guncelle({ teheccud: { uyandirma: v } });
                }}
                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                thumbColor={ayarlar.teheccud.uyandirma ? renkler.birincil : '#f4f3f4'}
                accessibilityLabel="Teheccüd uyandırması"
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
                {ayar.aktif && (
                    <View className="px-4 pb-4 border-t" style={{ borderTopColor: `${renkler.sinir}50` }}>
                        {k.tur === 'teheccud' ? teheccudPenceresiSecici() : <View className="h-3" />}
                        <PencereKarti
                            tanim={tanim}
                            ayar={vakitAyari(ayar)}
                            karsiYonAyari={vakitAyari(nafileYonunuDegistir(ayar, karsiYon))}
                            onAdimSec={(indeks) => setDetay({ tur: k.tur, indeks })}
                            onAdimEkle={() => adimEkle(k.tur)}
                            onYonDegistir={(yon) => yonDegistir(k.tur, yon)}
                            stil="gomulu"
                        />
                        {k.tur === 'teheccud' && uyandirmaSatiri()}
                        {bilgiSatiri(
                            "Bildirimdeki Kıldım'a dokunduğunuzda o günün kalan hatırlatmaları durur. Bu kayıt puana ve seriye karışmaz.",
                            'check-circle',
                            renkler.birincil
                        )}
                        {bilgiSatiri(NAFILE_ACIKLAMALARI[k.tur])}
                    </View>
                )}
            </View>
        );
    };

    const detayAyari = detay ? nafileAyariniAl(ayarlar, detay.tur) : null;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                className="flex-1"
                style={{ backgroundColor: renkler.arkaplan }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-sm mb-5" style={{ color: renkler.metinIkincil }}>
                    Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, namaz hatırlatmasındaki gibi
                    dilediğiniz sıklıkta hatırlatılabilirsiniz.
                </Text>

                {/* Bildirim sınırı (issue #298) — üstte tek kart */}
                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                {/* Gösterge — nafile BAŞINA (eskiden tek anahtar üçünü birden açıyordu) */}
                <View className="mb-6 overflow-hidden" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
                    <View className="flex-row items-center px-4 pt-4 pb-2">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${renkler.birincil}20` }}
                        >
                            <FontAwesome5 name="eye" size={17} color={renkler.birincil} solid />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                Ana ekranda göster
                            </Text>
                            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                Günlük akışta, vakitlerin arasında
                            </Text>
                        </View>
                    </View>
                    {KARTLAR.map((k) => (
                        <View
                            key={k.tur}
                            className="flex-row items-center px-4 py-2 border-t"
                            style={{ borderTopColor: `${renkler.sinir}50`, minHeight: 52 }}
                        >
                            <FontAwesome5 name={k.ikon} size={14} color={renkler.metinIkincil} solid style={{ width: 24 }} />
                            <Text className="flex-1 text-sm font-medium ml-2" style={{ color: renkler.metin }}>
                                {NAFILE_ADLARI[k.tur]}
                            </Text>
                            <Anahtar
                                testID={`nafile-gosterge-${k.tur}`}
                                value={ayarlar.gosterge[k.tur]}
                                onValueChange={(v) => {
                                    guncelle({ gosterge: { [k.tur]: v } });
                                }}
                                trackColor={{ false: renkler.sinir, true: `${renkler.birincil}60` }}
                                thumbColor={ayarlar.gosterge[k.tur] ? renkler.birincil : '#f4f3f4'}
                                accessibilityLabel={`${NAFILE_ADLARI[k.tur]} ana ekranda gösterilsin`}
                            />
                        </View>
                    ))}
                </View>

                {bolumBasligi('GÜNDÜZ VE AKŞAM')}
                {kart(KARTLAR[0])}
                {kart(KARTLAR[1])}

                <View className="mt-2">{bolumBasligi('GECE')}</View>
                {kart(KARTLAR[2])}
            </ScrollView>

            {detay && detayAyari && (
                <AdimDetayModal
                    gorunur
                    tanim={tanimlar[detay.tur]}
                    seviyeler={detayAyari.adimlar}
                    indeks={detay.indeks}
                    ttsDestekli={ttsDestekli}
                    onDegistir={(s: SeviyeAyari) => adimDegistir(detay.tur, detay.indeks, s)}
                    onSil={
                        detayAyari.adimlar.length > 1
                            ? () => {
                                ayariYaz(detay.tur, nafileAdimSil(detayAyari, detay.indeks));
                                setDetay(null);
                            }
                            : undefined
                    }
                    onKapat={() => setDetay(null)}
                    // Gerçek alarm rızası (#74) — nafilenin KENDİ kaydı (muhafızınki taşınmaz).
                    alarmOnayiVar={ayarlar.alarmOnayi === true}
                    onAlarmOnayiVer={() => {
                        // Ayrı bir yazım DEĞİL: modal onaydan hemen sonra anahtarı yazar
                        // (`onDegistir`); iki eşzamanlı thunk aynı eski durumu birleştirip
                        // birbirini ezerdi. Rıza o yazımla BİRLİKTE gider (`adimDegistir`).
                        alarmOnayiBekliyor.current = true;
                    }}
                />
            )}

            <SesliOnayModal
                gorunur={sesliBekleyen !== null}
                altBaslik="Nafile hatırlatmasında sesli anons"
                kapatmaNotu="Dilediğiniz zaman hatırlatmanın ayarından kapatabilirsiniz."
                ornekMetin={
                    sesliBekleyen
                        ? tanimlar[sesliBekleyen.tur].anonsOrnegiOlustur?.(sesliBekleyen.seviye) ?? ''
                        : ''
                }
                ttsDestekli={ttsDestekli}
                onOnayla={sesliOnayla}
                onSessizUygula={sesliOlmadan}
                onIptal={() => setSesliBekleyen(null)}
            />

            {/* Rehber sayfası + GERİ AL şeridi kaydırılan içeriğin DIŞINDA (şerit sabit kalsın) */}
            {rehber.ogeler}
        </View>
    );
};

export default NafileAyarlariSayfasi;
