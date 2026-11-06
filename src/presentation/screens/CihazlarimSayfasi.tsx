/**
 * Cihazlarım (tasarım `2026-10-21-cihaz-ekosistemi-design.md` §3) — bu telefona bağlı TV'ler
 * ve saat. Her TV için: durum (son eşitleme), "TV'de durumum sayılsın", "vakit daralınca TV'de
 * hatırlatın" ve eşleşmeyi kaldırma (iki uçta). Başlık navigasyon header'ındadır.
 *
 * İmza öğesi `BagHaritasi` (components/cihazlar): bu telefon ortada büyük, bağlı cihazlar
 * durum rozetli kartlar; bağ çizgisi yalnız yeni cihaz eklenince bir kez çizilir.
 *
 * Veri kaynağı `CihazAgiDeposu` (güvenli depo) — Redux kopyası YOK; ekran her odakta okur ve
 * arka planda bir eşitleme turu başlatıp durumu tazeler.
 */
import * as React from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { YonluIkon } from '../components/common/YonluIkon';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { Anahtar } from '../components/common/Anahtar';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { BagHaritasi, type HaritaDugumu } from '../components/cihazlar/BagHaritasi';
import { alaniOku } from '../../domain/services/CihazDurumOkuyucu';
import { AZAMI_DUGUM } from '../../core/cihazAgi/bagHaritasi';
import { CihazAgiDeposu, type CihazUyeligi } from '../../data/local/CihazAgiDeposu';
import { TvSenkronServisi } from '../../domain/services/TvSenkronServisi';
import { CihazEsServisi, buCihazinTuru, cihazAgiDinleyicisiVarMi } from '../../domain/services/CihazEsServisi';
import { esitlemeVaadi, haritaRozeti, saatDurumMetni, uyelikDurumMetni, type SaatDurumu } from '../../core/cihazAgi/cihazlarimMetni';
import { bicim } from '../../core/dil/aktifDil';
import { useMetin } from '../hooks/useMetin';

type Renkler = ReturnType<typeof useRenkler>;

const kartStili = (r: Renkler) => ({ backgroundColor: r.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: r.sinir });

export const CihazlarimSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const cm = useMetin().cihaz;
    const mt = cm.cihazlarim;
    const rozetBagli = cm.uyelik.rozetBagli;
    const navigation = useNavigation() as unknown as { navigate: (ekran: string) => void };
    const [liste, setListe] = React.useState<CihazUyeligi[] | null>(null);
    // Çift yönlü eşler (tablet / telefon): TV'lerden ayrı bölüm.
    const [esler, setEsler] = React.useState<CihazUyeligi[]>([]);
    const [kaldirilacakEs, setKaldirilacakEs] = React.useState<CihazUyeligi | null>(null);
    const [simdi, setSimdi] = React.useState(() => Date.now());
    const [kaldirilacak, setKaldirilacak] = React.useState<CihazUyeligi | null>(null);
    // Saat durumu GERÇEK okumadır (Wear Data Layer bağlı düğüm): "saatiniz eşleşir" cümlesi
    // saati olmayana söylenmesin. iOS'ta ve okunamazsa null → genel metin.
    const [saat, setSaat] = React.useState<SaatDurumu | null>(null);

    const oku = React.useCallback(async () => {
        const l = await CihazAgiDeposu.liste().catch(() => [] as CihazUyeligi[]);
        setListe(l.filter((u) => u.tur === 'tv').sort((a, b) => a.eklenmeMs - b.eklenmeMs));
        setEsler(l.filter((u) => u.tur === 'tablet' || u.tur === 'telefon').sort((a, b) => a.eklenmeMs - b.eklenmeMs));
        setSimdi(Date.now());
    }, []);

    // Her odakta oku; ardından bir eşitleme turu (yalnız içerik değiştiyse gönderir) ve tazele.
    useFocusEffect(
        React.useCallback(() => {
            let iptal = false;
            void oku();
            alaniOku('esliSaat')
                .then((d) => {
                    if (!iptal) setSaat(d ?? null);
                })
                .catch(() => undefined);
            TvSenkronServisi.getInstance()
                .gonder()
                .then(() => {
                    if (!iptal) void oku();
                })
                .catch(() => undefined);
            CihazEsServisi.getInstance()
                .esitle()
                .then(() => {
                    if (!iptal) void oku();
                })
                .catch(() => undefined);
            return () => {
                iptal = true;
            };
        }, [oku]),
    );

    const ayarDegistir = React.useCallback(
        async (u: CihazUyeligi, degisim: Pick<Partial<CihazUyeligi>, 'durumumSayilsin' | 'tvHatirlat'>) => {
            setListe((l) => l && l.map((x) => (x.aliciKimlik === u.aliciKimlik ? { ...x, ...degisim } : x)));
            const yeni = await CihazAgiDeposu.guncelle(u.aliciKimlik, degisim).catch(() => null);
            if (!yeni) {
                setListe((l) => l && l.map((x) => (x.aliciKimlik === u.aliciKimlik ? u : x)));
                kisaBildirimGoster(mt.ayarKaydedilemedi);
                return;
            }
            await TvSenkronServisi.getInstance().gonder().catch(() => undefined);
            void oku();
        },
        [oku, mt],
    );

    const kaldir = React.useCallback(
        async (u: CihazUyeligi) => {
            setKaldirilacak(null);
            await TvSenkronServisi.getInstance().kaldir(u.aliciKimlik).catch(() => undefined);
            kisaBildirimGoster(bicim(mt.kaldirildi, { ad: u.aliciAdi }));
            void oku();
        },
        [oku, mt],
    );

    const tvEkle = React.useCallback(() => navigation.navigate('TelevizyonAyarlari'), [navigation]);

    const dugumler = React.useMemo((): HaritaDugumu[] => {
        const cihazlar: HaritaDugumu[] = (liste ?? []).map((u) => {
            const m = uyelikDurumMetni(u.durum, u.sonEsitlemeMs, simdi);
            return { kimlik: u.aliciKimlik, tur: 'tv', ad: u.aliciAdi, rozet: haritaRozeti(u.durum, u.sonEsitlemeMs, simdi), ton: m.ton };
        });
        for (const e of esler) {
            const m = uyelikDurumMetni(e.durum, e.sonEsitlemeMs, simdi);
            cihazlar.push({ kimlik: e.aliciKimlik, tur: e.tur === 'telefon' ? 'telefon' : 'tablet', ad: e.aliciAdi, rozet: haritaRozeti(e.durum, e.sonEsitlemeMs, simdi), ton: m.ton });
        }
        if (saat === 'esli') cihazlar.push({ kimlik: 'saat', tur: 'saat', ad: mt.akilliSaat, rozet: rozetBagli, ton: 'iyi' });
        if (cihazlar.length > AZAMI_DUGUM) {
            const kalan = cihazlar.length - (AZAMI_DUGUM - 1);
            return [...cihazlar.slice(0, AZAMI_DUGUM - 1), { kimlik: 'fazla', tur: 'fazla', ad: `+${kalan}`, rozet: mt.asagidaListelenir, ton: 'notr' }];
        }
        return cihazlar.length < AZAMI_DUGUM
            ? [...cihazlar, { kimlik: 'ekle', tur: 'ekle', ad: mt.tvEkleyin, rozet: mt.kareKoduOkutun, ton: 'notr', onPress: tvEkle }]
            : cihazlar;
    }, [liste, esler, saat, simdi, tvEkle, mt, rozetBagli]);

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="px-1 pt-2 pb-5 mb-1" style={kartStili(renkler)}>
                <View className="px-3 pt-3">
                    <BagHaritasi dugumler={dugumler} merkezAdi={buCihazinTuru() === 'tablet' ? mt.buTablet : mt.buTelefon} merkezTablet={buCihazinTuru() === 'tablet'} />
                </View>
            </View>
            <Text testID="cihazlarim-vaat" className="text-sm mt-3 mb-6 px-1" style={{ color: renkler.metinIkincil, lineHeight: 20 }}>
                {esitlemeVaadi(Platform.OS)}
            </Text>

            <Text className="text-lg font-bold mb-3 px-1" style={{ color: renkler.metin }} accessibilityRole="header">
                {mt.televizyonlar}
            </Text>

            {liste != null && liste.length === 0 && (
                <View testID="cihazlarim-bos" className="p-5" style={kartStili(renkler)}>
                    <Text className="text-base font-semibold mb-1" style={{ color: renkler.metin }}>
                        {mt.tvYok}
                    </Text>
                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                        {mt.tvYokAciklama}
                    </Text>
                </View>
            )}

            {liste != null && liste.length > 0 && (
                <View style={{ gap: 12 }}>
                    {liste.map((u) => (
                        <TvKarti
                            key={u.aliciKimlik}
                            u={u}
                            simdi={simdi}
                            renkler={renkler}
                            onAyar={(d) => void ayarDegistir(u, d)}
                            onKaldir={() => setKaldirilacak(u)}
                            onYenidenEkle={tvEkle}
                        />
                    ))}
                </View>
            )}

            <TouchableOpacity
                testID="cihazlarim-tv-ekle"
                className="flex-row items-center justify-center rounded-2xl mt-4 px-5"
                style={{ minHeight: 52, backgroundColor: renkler.birincil }}
                onPress={tvEkle}
                accessibilityRole="button"
                accessibilityLabel={mt.tvEkleyin}
            >
                <FontAwesome5 name="plus" size={14} color={renkler.birincilMetin} style={{ marginRight: 10 }} />
                <Text className="text-base font-bold" style={{ color: renkler.birincilMetin }}>
                    {mt.tvEkleyin}
                </Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold mt-8 mb-3 px-1" style={{ color: renkler.metin }} accessibilityRole="header">
                {mt.tabletVeTelefonlar}
            </Text>
            {esler.length === 0 ? (
                <Text className="text-sm mb-3 px-1" style={{ color: renkler.metinIkincil, lineHeight: 20 }}>
                    {mt.esYok}
                </Text>
            ) : (
                <View style={{ gap: 12 }}>
                    {esler.map((e) => {
                        const d = uyelikDurumMetni(e.durum, e.sonEsitlemeMs, simdi);
                        const tonRengi = d.ton === 'iyi' ? renkler.basarili : d.ton === 'sorun' ? renkler.hata : renkler.metinIkincil;
                        return (
                            <View key={e.aliciKimlik} testID={`es-${e.aliciKimlik}`} className="p-4 flex-row items-center" style={kartStili(renkler)}>
                                <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: tonRengi + '20' }}>
                                    <FontAwesome5 name={e.tur === 'telefon' ? 'mobile-alt' : 'tablet-alt'} size={17} color={tonRengi} />
                                </View>
                                <View className="flex-1 mr-2">
                                    <Text className="text-base font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                                        {e.aliciAdi}
                                    </Text>
                                    <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                        {haritaRozeti(e.durum, e.sonEsitlemeMs, simdi)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className="px-3 rounded-xl items-center justify-center"
                                    style={{ minHeight: 44 }}
                                    onPress={() => setKaldirilacakEs(e)}
                                    accessibilityRole="button"
                                    accessibilityLabel={bicim(mt.cihaziKaldirinErisim, { ad: e.aliciAdi })}
                                >
                                    <FontAwesome5 name="unlink" size={13} color={renkler.metinIkincil} />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            )}
            {cihazAgiDinleyicisiVarMi() && (
                <TouchableOpacity
                    testID="cihazlarim-cihaz-ekle"
                    className="flex-row items-center justify-center rounded-2xl mt-4 px-5"
                    style={{ minHeight: 52, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                    onPress={() => navigation.navigate('CihazEkle')}
                    accessibilityRole="button"
                    accessibilityLabel={mt.tabletEkleyin}
                >
                    <FontAwesome5 name="plus" size={14} color={renkler.metin} style={{ marginRight: 10 }} />
                    <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                        {mt.tabletEkleyin}
                    </Text>
                </TouchableOpacity>
            )}

            {Platform.OS === 'android' && saat !== 'yok' && (
                <>
                    <Text className="text-lg font-bold mt-8 mb-3 px-1" style={{ color: renkler.metin }} accessibilityRole="header">
                        {mt.saat}
                    </Text>
                    <TouchableOpacity
                        testID="cihazlarim-saat"
                        className="flex-row items-center p-4"
                        style={kartStili(renkler)}
                        onPress={() => navigation.navigate('SaatAyarlari')}
                        accessibilityRole="button"
                        accessibilityLabel={mt.saatAyarlariErisim}
                    >
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: (saat === 'esli' ? renkler.birincil : renkler.metinIkincil) + '20' }}
                        >
                            <FontAwesome5 name="clock" size={18} color={saat === 'esli' ? renkler.birincil : renkler.metinIkincil} />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                {saatDurumMetni(saat).baslik}
                            </Text>
                            <Text testID="cihazlarim-saat-durum" className="text-sm" style={{ color: renkler.metinIkincil }}>
                                {saatDurumMetni(saat).aciklama}
                            </Text>
                        </View>
                        <YonluIkon name="chevron-right" size={14} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                </>
            )}

            <BildirimModali
                gorunur={kaldirilacakEs != null}
                tip="bilgi"
                baslik={mt.cihazKaldirBaslik}
                mesaj={kaldirilacakEs ? bicim(mt.cihazKaldirMesaj, { ad: kaldirilacakEs.aliciAdi }) : ''}
                birincilEtiket={mt.kaldirin}
                birincilIkon="unlink"
                tehlikeli
                onBirincil={() => {
                    const e = kaldirilacakEs;
                    setKaldirilacakEs(null);
                    if (e) void CihazEsServisi.getInstance().kaldir(e.aliciKimlik).then(() => { kisaBildirimGoster(bicim(mt.kaldirildi, { ad: e.aliciAdi })); void oku(); });
                }}
                kapatEtiketi={mt.vazgecin}
                onKapat={() => setKaldirilacakEs(null)}
            />
            <BildirimModali
                gorunur={kaldirilacak != null}
                tip="bilgi"
                baslik={mt.tvKaldirBaslik}
                mesaj={
                    kaldirilacak
                        ? bicim(mt.tvKaldirMesaj, { ad: kaldirilacak.aliciAdi })
                        : ''
                }
                birincilEtiket={mt.kaldirin}
                birincilIkon="unlink"
                tehlikeli
                onBirincil={() => kaldirilacak && void kaldir(kaldirilacak)}
                kapatEtiketi={mt.vazgecin}
                onKapat={() => setKaldirilacak(null)}
            />
        </ScrollView>
    );
};

const TvKarti: React.FC<{
    u: CihazUyeligi;
    simdi: number;
    renkler: Renkler;
    onAyar: (d: Pick<Partial<CihazUyeligi>, 'durumumSayilsin' | 'tvHatirlat'>) => void;
    onKaldir: () => void;
    onYenidenEkle: () => void;
}> = ({ u, simdi, renkler, onAyar, onKaldir, onYenidenEkle }) => {
    const metinler = useMetin().cihaz;
    const mt = metinler.cihazlarim;
    const yenidenEkleyin = metinler.uyelik.yenidenEkleyin;
    const d = uyelikDurumMetni(u.durum, u.sonEsitlemeMs, simdi);
    const tonRengi = d.ton === 'iyi' ? renkler.basarili : d.ton === 'sorun' ? renkler.hata : renkler.metinIkincil;
    const reddedildi = u.durum === 'reddedildi';
    return (
        <View testID={`cihaz-${u.aliciKimlik}`} className="p-4" style={kartStili(renkler)}>
            <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: tonRengi + '20' }}>
                    <FontAwesome5 name="tv" size={16} color={tonRengi} />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                        {u.aliciAdi}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: tonRengi, marginRight: 6 }} />
                        <Text testID={`cihaz-durum-${u.aliciKimlik}`} className="text-xs" style={{ color: renkler.metinIkincil }}>
                            {d.cip}
                        </Text>
                    </View>
                </View>
            </View>

            {d.aciklama && (
                <Text className="text-sm mt-3" style={{ color: renkler.metinIkincil }}>
                    {d.aciklama}
                </Text>
            )}

            {reddedildi ? (
                <TouchableOpacity
                    className="flex-row items-center self-start mt-3 px-4 rounded-xl"
                    style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                    onPress={onYenidenEkle}
                    accessibilityRole="button"
                    accessibilityLabel={bicim(mt.tvYenidenEkleErisim, { ad: u.aliciAdi })}
                >
                    <FontAwesome5 name="qrcode" size={13} color={renkler.metin} style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        {yenidenEkleyin}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View className="mt-3" style={{ gap: 4 }}>
                    <AnahtarSatiri
                        testID={`cihaz-sayilsin-${u.aliciKimlik}`}
                        baslik={mt.durumumSayilsin}
                        aciklama={mt.durumumSayilsinAciklama}
                        deger={u.durumumSayilsin}
                        onDegistir={(v) => onAyar({ durumumSayilsin: v })}
                        renkler={renkler}
                    />
                    <AnahtarSatiri
                        testID={`cihaz-hatirlat-${u.aliciKimlik}`}
                        baslik={mt.tvHatirlat}
                        aciklama={
                            u.durumumSayilsin
                                ? mt.tvHatirlatAciklama
                                : mt.tvHatirlatOnce
                        }
                        deger={u.durumumSayilsin && u.tvHatirlat}
                        pasif={!u.durumumSayilsin}
                        onDegistir={(v) => onAyar({ tvHatirlat: v })}
                        renkler={renkler}
                    />
                </View>
            )}

            <TouchableOpacity
                className="flex-row items-center self-start mt-2 px-3 rounded-xl"
                style={{ minHeight: 44 }}
                onPress={onKaldir}
                accessibilityRole="button"
                accessibilityLabel={bicim(mt.tvKaldirErisim, { ad: u.aliciAdi })}
            >
                <FontAwesome5 name="unlink" size={12} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                    {mt.kaldirin}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const AnahtarSatiri: React.FC<{
    testID: string;
    baslik: string;
    aciklama: string;
    deger: boolean;
    pasif?: boolean;
    onDegistir: (v: boolean) => void;
    renkler: Renkler;
}> = ({ testID, baslik, aciklama, deger, pasif, onDegistir, renkler }) => (
    <View className="flex-row items-center py-2" style={{ opacity: pasif ? 0.55 : 1 }}>
        <View className="flex-1 mr-3">
            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                {baslik}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil, lineHeight: 17 }}>
                {aciklama}
            </Text>
        </View>
        <Anahtar
            testID={testID}
            value={deger}
            disabled={pasif}
            onValueChange={onDegistir}
            trackColor={{ false: renkler.sinir, true: renkler.birincil + '60' }}
            thumbColor={deger ? renkler.birincil : '#f4f3f4'}
            accessibilityLabel={baslik}
        />
    </View>
);
