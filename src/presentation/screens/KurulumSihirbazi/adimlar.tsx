/**
 * Kurulum sihirbazı adımları (sade tasarım, Dalga 2) — 5 adım, salt görünüm.
 *
 * Her adım aynı iskeleti izler: CANLI resim (`sahneler.tsx`; görünürken yumuşak döngü,
 * arka planda/odak dışında/"Animasyonları azalt"ta durur) → başlık (≤ 4 kelime) → bir
 * cümle → en fazla üç ikonlu madde → adımın kendi içeriği. Sadeleştirme metni kısaltır,
 * görsel anlatıyı SİLMEZ (sahip kararı 2026-10-19).
 * Düğmeler sayfanın altındadır (`KurulumSihirbaziSayfasi`). Renkler yalnız tema
 * token'ı (`useRenkler`); sihirbaz koyu temada da koyu çizilir.
 *
 * İzin adımlarında açıklama maddeleri İZİN DÜĞMESİNDEN ÖNCE ekrandadır: Play'in
 * "prominent disclosure" şartını adım ekranının kendisi karşılar, ayrı bir
 * açıklama modalı açılmaz (aynı şeyi iki kez okutmuyoruz).
 */
import * as React from 'react';
import { AccessibilityInfo, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { TURKIYE_ILLERI_OFFLINE, type Il } from '../../../domain/services/TurkiyeKonumServisi';
import { AnahtarSatiri, BolumBasligi } from '../../components/ortak';
import { DuzeyOnizlemesi } from '../../components/hatirlatma/DuzeyOnizlemesi';
import { BildirimSahnesi, HazirSahnesi, HosgeldinizSahnesi, KonumSahnesi } from './sahneler';
import { DuzeySecici, type HatirlatmaDuzeyi } from '../../components/hatirlatma/DuzeySecici';
import { DUZEY_ADLARI } from '../../../core/hatirlatma/duzeyOzeti';
import { AnahtarKarti, DinleDugmesi, SoruKarti } from './secenekKartlari';
import type { IzinDurumu } from '../../../core/cihaz/durumNotlari';
import type { IzinSonucu } from '../../components/ortak';
import type { KonumDurumu } from './tipler';

// ─── Ortak parçalar ──────────────────────────────────────────────────────────

export const AdimBasligi: React.FC<{ baslik: string; alt?: string }> = ({ baslik, alt }) => {
    const renkler = useRenkler();
    return (
        <View style={{ marginBottom: 16 }}>
            <Text accessibilityRole="header" style={{ fontSize: 26, fontWeight: '800', textAlign: 'center', color: renkler.metin }}>
                {baslik}
            </Text>
            {alt ? (
                <Text style={{ fontSize: 16, lineHeight: 23, marginTop: 8, textAlign: 'center', color: renkler.metinIkincil }}>{alt}</Text>
            ) : null}
        </View>
    );
};

export const Madde: React.FC<{ ikon: string; metin: string }> = ({ ikon, metin }) => {
    const renkler = useRenkler();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <FontAwesome5 name={ikon} size={14} color={renkler.birincil} solid style={{ width: 26, marginTop: 3 }} />
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: renkler.metin }}>{metin}</Text>
        </View>
    );
};

/** Bir eylemin yerinde sonucu: "✓ İzin verildi" ya da "İzin verilmedi". Ekran okuyucu duyurur. */
export const SonucSatiri: React.FC<{ tip: 'basari' | 'uyari'; metin: string; testID?: string }> = ({ tip, metin, testID }) => {
    const renkler = useRenkler();
    const renk = tip === 'basari' ? renkler.basarili : renkler.dikkat;
    // `accessibilityLiveRegion` yalnız Android'de çalışır; VoiceOver için açık duyuru.
    React.useEffect(() => {
        AccessibilityInfo.announceForAccessibility?.(metin);
    }, [metin]);
    return (
        <View
            testID={testID}
            accessibilityLiveRegion="polite"
            accessible
            accessibilityLabel={metin}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 16,
                borderLeftWidth: 3,
                borderLeftColor: renk,
                backgroundColor: renkler.kartArkaplan,
            }}
        >
            <FontAwesome5 name={tip === 'basari' ? 'check-circle' : 'exclamation-triangle'} size={16} color={renk} solid style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{metin}</Text>
        </View>
    );
};

// ─── 1. Hoş geldiniz ─────────────────────────────────────────────────────────

export const HosgeldinizAdimi: React.FC = () => (
    <View>
        <HosgeldinizSahnesi />
        <AdimBasligi baslik="Namaz Akışı" alt="Vakitleri bilin, kıldığınızı tek dokunuşla işaretleyin." />
        <Madde ikon="map-marker-alt" metin="Bulunduğunuz yerin vakitleri" />
        <Madde ikon="bell" metin="Vakit çıkmadan önce hatırlatma" />
        <Madde ikon="lock" metin="Her şey bu telefonda kalır" />
    </View>
);

// ─── 2. Konum ────────────────────────────────────────────────────────────────

/**
 * Türkçe küçük harf (aramada). `toLocaleLowerCase('tr-TR')` Hermes'te ICU'ya bağlıdır
 * ve 'İ'.toLowerCase() 'i̇' (birleşik nokta) üretir → önce İ/I elle çevrilir.
 */
export const kucukHarf = (s: string): string => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

export interface KonumAdimiProps {
    durum: KonumDurumu;
    /** Alınan konumun adı ("Kadıköy"). */
    konumBilgi: string;
    /** Konum izni (okunmadıysa `null`). */
    izin: IzinDurumu | null;
    /** Son izin isteğinin sonucu. */
    izinSonucu: IzinSonucu | null;
    /** GPS hatası: neden yazılır, il listesi açılır. */
    hata: string | null;
    manuelIl: Il | null;
    onIlSec: (il: Il) => void;
}

export const KonumAdimi: React.FC<KonumAdimiProps> = ({ durum, konumBilgi, izin, izinSonucu, hata, manuelIl, onIlSec }) => {
    const renkler = useRenkler();
    const [arama, setArama] = React.useState('');
    const iller = React.useMemo(() => {
        const a = kucukHarf(arama.trim());
        return a ? TURKIYE_ILLERI_OFFLINE.filter((il) => kucukHarf(il.ad).includes(a)) : TURKIYE_ILLERI_OFFLINE;
    }, [arama]);

    if (durum === 'manuel') {
        return (
            <View style={{ flex: 1 }}>
                <AdimBasligi baslik="Şehrinizi seçin" alt="Vakitler seçtiğiniz ile göre hesaplanır." />
                {hata ? <SonucSatiri tip="uyari" metin={hata} testID="konum-hata" /> : null}
                {izinSonucu === 'ayarlar' || izin === 'reddedildi' ? (
                    <SonucSatiri tip="uyari" metin="Konum izni kapalı. Ayarlardan açabilir ya da şehir seçebilirsiniz." />
                ) : null}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 12,
                        marginBottom: 8,
                        paddingHorizontal: 14,
                        minHeight: 48,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                        backgroundColor: renkler.kartArkaplan,
                    }}
                >
                    <FontAwesome5 name="search" size={14} color={renkler.metinIkincil} style={{ marginRight: 10 }} />
                    <TextInput
                        value={arama}
                        onChangeText={setArama}
                        placeholder="Şehir arayın"
                        placeholderTextColor={renkler.metinIkincil}
                        accessibilityLabel="Şehir arayın"
                        style={{ flex: 1, fontSize: 16, color: renkler.metin, paddingVertical: 10 }}
                    />
                </View>
                <FlatList
                    data={iller}
                    keyExtractor={(il) => String(il.id)}
                    keyboardShouldPersistTaps="handled"
                    style={{ flex: 1 }}
                    renderItem={({ item }) => {
                        const secili = manuelIl?.id === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => onIlSec(item)}
                                accessibilityRole="radio"
                                accessibilityLabel={item.ad}
                                accessibilityState={{ selected: secili, checked: secili }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    minHeight: 48,
                                    paddingHorizontal: 14,
                                    borderRadius: 14,
                                    backgroundColor: secili ? renkler.birincil + '14' : 'transparent',
                                }}
                            >
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: secili ? '700' : '400', color: renkler.metin }}>{item.ad}</Text>
                                {secili ? <FontAwesome5 name="check" size={14} color={renkler.birincil} /> : null}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        );
    }

    return (
        <View>
            <KonumSahnesi alindi={durum === 'alindi'} />
            <AdimBasligi baslik="Konumunuz" alt="Namaz vakitleri ve kıble yönü konumunuza göre hesaplanır." />
            <Madde ikon="mobile-alt" metin="Konumunuz sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz." />
            <Madde ikon="ban" metin="Reklam ya da takip için kullanılmaz." />
            {durum === 'aliniyor' ? <SonucSatiri tip="basari" metin="Konumunuz bulunuyor…" testID="konum-aliniyor" /> : null}
            {durum === 'alindi' ? <SonucSatiri tip="basari" metin={`Konum alındı · ${konumBilgi}`} testID="konum-alindi" /> : null}
            {durum === 'bekliyor' && izin === 'verildi' ? (
                <SonucSatiri tip="basari" metin="Konum izni verildi" testID="konum-izin-var" />
            ) : null}
            {durum === 'bekliyor' && izinSonucu === 'tekrarDene' ? (
                <SonucSatiri tip="uyari" metin="Konum izni verilmedi." />
            ) : null}
        </View>
    );
};

// ─── 3. Bildirim ─────────────────────────────────────────────────────────────

export const BildirimAdimi: React.FC<{ izin: IzinDurumu | null; izinSonucu: IzinSonucu | null }> = ({ izin, izinSonucu }) => (
    <View>
        <BildirimSahnesi izinVar={izin === 'verildi'} />
        <AdimBasligi baslik="Bildirimler" alt="Vakit girince ve çıkmadan önce haber verelim." />
        <Madde ikon="mosque" metin="Yalnız namaz için kullanılır." />
        <Madde ikon="ban" metin="Reklam bildirimi gönderilmez." />
        {izin === 'verildi' ? <SonucSatiri tip="basari" metin="Bildirim izni verildi" testID="bildirim-izin-var" /> : null}
        {izin !== 'verildi' && izinSonucu === 'tekrarDene' ? (
            <SonucSatiri tip="uyari" metin="İzin verilmedi. Tekrar deneyebilirsiniz." testID="bildirim-red" />
        ) : null}
        {izin !== 'verildi' && (izinSonucu === 'ayarlar' || izin === 'reddedildi') ? (
            <SonucSatiri tip="uyari" metin="Bildirim izni kapalı. Ayarlardan açabilirsiniz." testID="bildirim-kalici-red" />
        ) : null}
    </View>
);

// ─── 4. Hatırlatma düzeyi ────────────────────────────────────────────────────

/**
 * Düzey adımındaki seçimler (persona çalışması 2026-10-19). Hepsi ayarlara hiç
 * bakmayacak kişi için en iyi varsayılanla başlar: Kıldım'ı işaretler · sesli okuma
 * KAPALI (rıza ister) · gece sessiz AÇIK · sabah alarmı KAPALI · cuma KAPALI.
 */
export interface KurulumSecimleri {
    isaretler: 'evet' | 'hayir';
    sesli: boolean;
    gece: boolean;
    sabahAlarm: boolean;
    cuma: boolean;
}

export const VARSAYILAN_KURULUM_SECIMLERI: KurulumSecimleri = {
    isaretler: 'evet',
    sesli: false,
    gece: true,
    sabahAlarm: false,
    cuma: false,
};

const ANA_CIHAZ_SECENEKLERI = [
    { deger: 'evet', etiket: 'Evet, ana telefonum', ikon: 'mobile-alt' },
    { deger: 'hayir', etiket: 'Hayır, ikinci cihaz', ikon: 'tablet-alt' },
] as const;

const ISARETLER_SECENEKLERI = [
    { deger: 'evet', etiket: 'Evet', ikon: 'check' },
    { deger: 'hayir', etiket: 'Hayır', ikon: 'times' },
] as const;

export const DuzeyAdimi: React.FC<{
    duzey: HatirlatmaDuzeyi;
    onDuzey: (d: HatirlatmaDuzeyi) => void;
    secimler: KurulumSecimleri;
    onIsaretler: (d: 'evet' | 'hayir') => void;
    onSecim: (degisiklik: Partial<KurulumSecimleri>) => void;
    /** "Sabah beni uyandırsın" açılırken rıza modalı (çağıranda). */
    onSabahAlarmiIste: () => void;
    /** Sesli okumanın platforma göre doğru açıklaması (rıza bunun ekranda görünmesine dayanır). */
    sesliBilgi: string;
    /** "Dinleyin" için çözülmüş örnek cümle. */
    sesliOrnek: string;
    sade: boolean;
    onSade: (acik: boolean) => void;
    /**
     * Tek beyin: geniş ekranlı cihazda (tablet, iPad) "Bu cihaz sizin ana telefonunuz mu?"
     * sorusu. Verilmezse (telefon) kart çizilmez.
     */
    anaCihaz?: { secili: 'evet' | 'hayir'; onSec: (d: 'evet' | 'hayir') => void };
}> = ({ duzey, onDuzey, secimler, onIsaretler, onSecim, onSabahAlarmiIste, sesliBilgi, sesliOrnek, sade, onSade, anaCihaz }) => {
    const renkler = useRenkler();
    const acik = duzey !== 'kapali';
    const sesliVar = duzey === 'normal' || duzey === 'yogun';
    return (
    <View>
        <AdimBasligi baslik="Ne kadar hatırlatalım?" alt="Vakit çıkmadan önce gelen hatırlatmalar." />
        {anaCihaz ? (
            <>
                <SoruKarti
                    ikon="mobile-alt"
                    baslik="Bu cihaz sizin ana telefonunuz mu?"
                    aciklama="Hatırlatmaları tek cihaz verir. İkinci cihaz vakitleri gösterir ve Kıldım işaretler."
                    secenekler={ANA_CIHAZ_SECENEKLERI}
                    secili={anaCihaz.secili}
                    onSec={(d) => anaCihaz.onSec(d === 'hayir' ? 'hayir' : 'evet')}
                    not={
                        anaCihaz.secili === 'hayir'
                            ? 'Bu cihazda hatırlatma kurulmaz; telefonunuz hatırlatır. Ayarlar > Ekran ve cihazlar bölümünden değiştirebilirsiniz.'
                            : null
                    }
                    testID="kart-ana-cihaz"
                />
                <View style={{ height: 12 }} />
            </>
        ) : null}
        <SoruKarti
            ikon="check-circle"
            baslik="Kıldığınızı işaretler misiniz?"
            aciklama="Kıldım'a basınca o namazın hatırlatmaları durur."
            secenekler={ISARETLER_SECENEKLERI}
            secili={secimler.isaretler}
            onSec={(d) => onIsaretler(d === 'hayir' ? 'hayir' : 'evet')}
            not={
                secimler.isaretler === 'hayir'
                    ? 'İşaretlemezseniz hatırlatmalar susmaz. Bu yüzden vakit başına tek hatırlatma seçildi.'
                    : null
            }
            testID="kart-isaretler"
        />
        <View style={{ height: 12 }} />
        {/* Canlı önizleme: seçilen düzeyin gerçek uyarıları zaman rayında (görünürken döngü). */}
        <DuzeyOnizlemesi duzey={duzey} sesliAcik={secimler.sesli} dongu testID="duzey-onizlemesi" />
        <View style={{ height: 12 }} />
        {/* Sihirbazda "Kendi ayarınız" kartı yoktur (`ozelGoster` verilmez) → 'ozel' gelmez.
            Sesli okuma ayrı kartta, açık rızayla sorulur (`sesliBilgiGoster={false}`). */}
        <DuzeySecici
            secili={duzey}
            onSec={(d) => d !== 'ozel' && onDuzey(d)}
            sesliBilgiGoster={false}
            sesliIzinVar={secimler.sesli}
            testID="duzey-secici"
        />
        {acik && sesliVar ? (
            <AnahtarKarti
                ikon="volume-up"
                tur="dalga"
                baslik="Telefon vakti sesli söylesin mi?"
                aciklama="Son hatırlatmada vakti sesle okur."
                deger={secimler.sesli}
                onDegistir={(v) => onSecim({ sesli: v })}
                testID="kart-sesli"
                ek={
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <Text testID="kart-sesli-bilgi" style={{ flex: 1, fontSize: 14, lineHeight: 20, color: renkler.metin, marginRight: 10 }}>
                            {sesliBilgi}
                        </Text>
                        <DinleDugmesi metin={sesliOrnek} />
                    </View>
                }
            />
        ) : null}
        {acik ? (
            <AnahtarKarti
                ikon="bell"
                tur="salla"
                baslik="Sabah beni uyandırsın"
                aciklama="Sabahın ilk hatırlatması alarm olarak çalar."
                deger={secimler.sabahAlarm}
                onDegistir={(v) => (v ? onSabahAlarmiIste() : onSecim({ sabahAlarm: false }))}
                testID="kart-sabah-alarm"
            />
        ) : null}
        {acik ? (
            <AnahtarKarti
                ikon="moon"
                tur="salin"
                baslik="Gece sessiz olsun"
                aciklama="23:00'ten imsağa kadar hatırlatma gelmez."
                deger={secimler.gece}
                onDegistir={(v) => onSecim({ gece: v })}
                testID="kart-gece"
            />
        ) : null}
        <AnahtarKarti
            ikon="mosque"
            tur="nabiz"
            baslik="Cumayı hatırlat"
            aciklama="Cuma günü öğleden 1 saat önce hatırlatır."
            deger={secimler.cuma}
            onDegistir={(v) => onSecim({ cuma: v })}
            testID="kart-cuma"
        />
        <View style={{ marginTop: 24 }}>
            <BolumBasligi metin="Görünüm" />
            <AnahtarSatiri
                ikon="compress-alt"
                baslik="Sade görünüm"
                ozet="Ana ekranda yalnız şu anki vakit ve Kıldım"
                deger={sade}
                onDegistir={onSade}
                testID="sade-anahtari"
            />
        </View>
    </View>
    );
};

// ─── 5. Hazır ────────────────────────────────────────────────────────────────

export interface HazirOzeti {
    konum: string;
    bildirim: boolean | null;
    duzey: HatirlatmaDuzeyi;
    sade: boolean;
    secimler: KurulumSecimleri;
}

export const HazirAdimi: React.FC<{ ozet: HazirOzeti; hata: string | null }> = ({ ozet, hata }) => {
    const renkler = useRenkler();
    const satirlar: { ikon: string; metin: string }[] = [
        { ikon: 'map-marker-alt', metin: ozet.konum || 'Konum seçilmedi' },
        {
            ikon: ozet.bildirim ? 'bell' : 'bell-slash',
            metin: ozet.bildirim ? 'Bildirimler açık' : 'Bildirimler kapalı',
        },
        { ikon: 'shield-alt', metin: `Hatırlatma: ${DUZEY_ADLARI[ozet.duzey]}` },
        ...(ozet.duzey !== 'kapali' && ozet.secimler.sesli && (ozet.duzey === 'normal' || ozet.duzey === 'yogun')
            ? [{ ikon: 'volume-up', metin: 'Sesli okuma açık' }]
            : []),
        ...(ozet.duzey !== 'kapali' && ozet.secimler.sabahAlarm ? [{ ikon: 'bell', metin: 'Sabah alarmı açık' }] : []),
        ...(ozet.duzey !== 'kapali' && ozet.secimler.gece ? [{ ikon: 'moon', metin: 'Gece 23:00 – imsak sessiz' }] : []),
        ...(ozet.secimler.cuma ? [{ ikon: 'mosque', metin: 'Cuma hatırlatması açık' }] : []),
        ...(ozet.sade ? [{ ikon: 'compress-alt', metin: 'Sade görünüm açık' }] : []),
    ];
    return (
        <View>
            {/* Kutlama adıma girişte BİR KEZ oynar (✓ + saçılan noktalar). */}
            <HazirSahnesi />
            <AdimBasligi baslik="Her şey hazır" alt="Ayarları istediğiniz zaman değiştirebilirsiniz." />
            <View
                style={{
                    borderRadius: 24,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: renkler.sinir,
                    backgroundColor: renkler.kartArkaplan,
                }}
            >
                {satirlar.map((s) => (
                    <Madde key={s.metin} ikon={s.ikon} metin={s.metin} />
                ))}
            </View>
            {hata ? <SonucSatiri tip="uyari" metin={hata} testID="kurulum-hata" /> : null}
        </View>
    );
};
