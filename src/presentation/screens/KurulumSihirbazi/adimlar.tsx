/**
 * Kurulum sihirbazı adımları (sade tasarım, Dalga 2) — 5 adım, salt görünüm.
 *
 * Her adım aynı iskeleti izler: TEK resim (FontAwesome5 kompozisyonu) → başlık
 * (≤ 4 kelime) → bir cümle → en fazla üç ikonlu madde → adımın kendi içeriği.
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
import { BasariIsareti } from '../../components/hareket';
import { DuzeySecici, type HatirlatmaDuzeyi } from '../../components/hatirlatma/DuzeySecici';
import { DUZEY_ADLARI } from '../../../core/hatirlatma/duzeyOzeti';
import type { IzinDurumu } from '../../../core/cihaz/durumNotlari';
import type { IzinSonucu } from '../../components/ortak';
import type { KonumDurumu } from './tipler';

// ─── Ortak parçalar ──────────────────────────────────────────────────────────

/** Adımın tek resmi: tonlu daire içinde ana ikon + köşede küçük rozet ikonu. Dekoratif. */
export const Illustrasyon: React.FC<{ ikon: string; rozet?: string }> = ({ ikon, rozet }) => {
    const renkler = useRenkler();
    return (
        <View
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{ alignSelf: 'center', width: 120, height: 120, marginTop: 8, marginBottom: 20 }}
        >
            <View
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: renkler.birincil + '20',
                }}
            >
                <FontAwesome5 name={ikon} size={50} color={renkler.birincil} solid />
            </View>
            {rozet ? (
                <View
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 4,
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: renkler.kartArkaplan,
                        borderWidth: 2,
                        borderColor: renkler.birincil + '40',
                    }}
                >
                    <FontAwesome5 name={rozet} size={18} color={renkler.birincil} solid />
                </View>
            ) : null}
        </View>
    );
};

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
        <Illustrasyon ikon="mosque" rozet="moon" />
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
                {izinSonucu === 'ayarlar' ? (
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
            <Illustrasyon ikon="map-marker-alt" rozet="compass" />
            <AdimBasligi baslik="Konumunuz" alt="Namaz vakitleri ve kıble yönü konumunuza göre hesaplanır." />
            <Madde ikon="mobile-alt" metin="Konum yalnız bu telefonda işlenir, hiçbir yere gönderilmez." />
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
        <Illustrasyon ikon="bell" rozet="clock" />
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

export const DuzeyAdimi: React.FC<{
    duzey: HatirlatmaDuzeyi;
    onDuzey: (d: HatirlatmaDuzeyi) => void;
    sade: boolean;
    onSade: (acik: boolean) => void;
}> = ({ duzey, onDuzey, sade, onSade }) => (
    <View>
        <Illustrasyon ikon="shield-alt" rozet="bell" />
        <AdimBasligi baslik="Ne kadar hatırlatalım?" alt="Vakit çıkmadan önce gelen hatırlatmalar." />
        <DuzeySecici secili={duzey} onSec={onDuzey} testID="duzey-secici" />
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

// ─── 5. Hazır ────────────────────────────────────────────────────────────────

export interface HazirOzeti {
    konum: string;
    bildirim: boolean | null;
    duzey: HatirlatmaDuzeyi;
    sade: boolean;
}

export const HazirAdimi: React.FC<{ ozet: HazirOzeti; hata: string | null }> = ({ ozet, hata }) => {
    const renkler = useRenkler();
    const [goster, setGoster] = React.useState(false);
    // Başarı işareti adıma girişte BİR KEZ çizilir (sonsuz halka yok).
    React.useEffect(() => setGoster(true), []);
    const satirlar: { ikon: string; metin: string }[] = [
        { ikon: 'map-marker-alt', metin: ozet.konum || 'Konum seçilmedi' },
        {
            ikon: ozet.bildirim ? 'bell' : 'bell-slash',
            metin: ozet.bildirim ? 'Bildirimler açık' : 'Bildirimler kapalı',
        },
        { ikon: 'shield-alt', metin: `Hatırlatma: ${DUZEY_ADLARI[ozet.duzey]}` },
        ...(ozet.sade ? [{ ikon: 'compress-alt', metin: 'Sade görünüm açık' }] : []),
    ];
    return (
        <View>
            <View style={{ alignSelf: 'center', marginTop: 8, marginBottom: 20 }}>
                <BasariIsareti goster={goster} boyut={96} />
            </View>
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
