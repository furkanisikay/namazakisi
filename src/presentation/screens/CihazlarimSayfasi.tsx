/**
 * Cihazlarım (tasarım `2026-10-21-cihaz-ekosistemi-design.md` §3) — bu telefona bağlı TV'ler
 * ve saat. Her TV için: durum (son eşitleme), "TV'de durumum sayılsın", "vakit daralınca TV'de
 * hatırlatın" ve eşleşmeyi kaldırma (iki uçta). Başlık navigasyon header'ındadır.
 *
 * İmza öğesi `AgHaritasi`: telefon ile cihazlar arasındaki bağ çizgileri yalnız İLK görünüşte ve
 * yeni bir cihaz eklendiğinde bir kez çizilir; çizgi rengi bağın durumunu söyler (bilgi hiçbir
 * zaman yalnız harekette değildir — azaltılmış harekette çizgiler doğrudan son hâlindedir).
 *
 * Veri kaynağı `CihazAgiDeposu` (güvenli depo) — Redux kopyası YOK; ekran her odakta okur ve
 * arka planda bir eşitleme turu başlatıp durumu tazeler.
 */
import * as React from 'react';
import { Animated, Easing, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { Anahtar } from '../components/common/Anahtar';
import { BildirimModali } from '../components/common/BildirimModali';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { useHareketAzalt } from '../hooks/useHareketAzalt';
import { CihazAgiDeposu, type CihazUyeligi } from '../../data/local/CihazAgiDeposu';
import { TvSenkronServisi } from '../../domain/services/TvSenkronServisi';
import { esitlemeVaadi, uyelikDurumMetni } from '../../core/cihazAgi/cihazlarimMetni';

type Renkler = ReturnType<typeof useRenkler>;

const kartStili = (r: Renkler) => ({ backgroundColor: r.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: r.sinir });

export const CihazlarimSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation() as unknown as { navigate: (ekran: string) => void };
    const [liste, setListe] = React.useState<CihazUyeligi[] | null>(null);
    const [simdi, setSimdi] = React.useState(() => Date.now());
    const [kaldirilacak, setKaldirilacak] = React.useState<CihazUyeligi | null>(null);

    const oku = React.useCallback(async () => {
        const l = await CihazAgiDeposu.liste().catch(() => [] as CihazUyeligi[]);
        setListe(l.filter((u) => u.tur === 'tv').sort((a, b) => a.eklenmeMs - b.eklenmeMs));
        setSimdi(Date.now());
    }, []);

    // Her odakta oku; ardından bir eşitleme turu (yalnız içerik değiştiyse gönderir) ve tazele.
    useFocusEffect(
        React.useCallback(() => {
            let iptal = false;
            void oku();
            TvSenkronServisi.getInstance()
                .gonder()
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
                kisaBildirimGoster('Ayar kaydedilemedi. Lütfen yeniden deneyin.');
                return;
            }
            await TvSenkronServisi.getInstance().gonder().catch(() => undefined);
            void oku();
        },
        [oku],
    );

    const kaldir = React.useCallback(
        async (u: CihazUyeligi) => {
            setKaldirilacak(null);
            await TvSenkronServisi.getInstance().kaldir(u.aliciKimlik).catch(() => undefined);
            kisaBildirimGoster(`${u.aliciAdi} kaldırıldı.`);
            void oku();
        },
        [oku],
    );

    const tvEkle = () => navigation.navigate('TelevizyonAyarlari');

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <AgHaritasi renkler={renkler} liste={liste ?? []} onEkle={tvEkle} />
            <Text testID="cihazlarim-vaat" className="text-xs mt-3 mb-5 px-1" style={{ color: renkler.metinIkincil, lineHeight: 18 }}>
                {esitlemeVaadi(Platform.OS)}
            </Text>

            <Text className="text-base font-bold mb-3 px-1" style={{ color: renkler.metin }} accessibilityRole="header">
                Televizyonlar
            </Text>

            {liste != null && liste.length === 0 && (
                <View testID="cihazlarim-bos" className="p-5" style={kartStili(renkler)}>
                    <Text className="text-base font-semibold mb-1" style={{ color: renkler.metin }}>
                        Henüz bir TV eklemediniz
                    </Text>
                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                        Android TV&apos;ye Namaz Akışı&apos;nı kurun, ekrandaki kare kodu bu telefonla okutun. Vakitler ve
                        Ramazan sayacı evin büyük ekranında görünür.
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
                accessibilityLabel="TV ekleyin"
            >
                <FontAwesome5 name="plus" size={14} color={renkler.birincilMetin} style={{ marginRight: 10 }} />
                <Text className="text-base font-bold" style={{ color: renkler.birincilMetin }}>
                    TV ekleyin
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'android' && (
                <>
                    <Text className="text-base font-bold mt-7 mb-3 px-1" style={{ color: renkler.metin }} accessibilityRole="header">
                        Saat
                    </Text>
                    <TouchableOpacity
                        testID="cihazlarim-saat"
                        className="flex-row items-center p-4"
                        style={kartStili(renkler)}
                        onPress={() => navigation.navigate('SaatAyarlari')}
                        accessibilityRole="button"
                        accessibilityLabel="Akıllı saat ayarlarını açın"
                    >
                        <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: renkler.birincil + '20' }}>
                            <FontAwesome5 name="clock" size={18} color={renkler.birincil} />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                Akıllı saat
                            </Text>
                            <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                                Wear OS saatiniz telefonla kendiliğinden eşleşir; ayrıca kod okutmanız gerekmez.
                            </Text>
                        </View>
                        <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                </>
            )}

            <BildirimModali
                gorunur={kaldirilacak != null}
                tip="bilgi"
                baslik="Bu TV kaldırılsın mı?"
                mesaj={
                    kaldirilacak
                        ? `${kaldirilacak.aliciAdi} artık bu telefondan bilgi almaz; bağlantı anahtarı iki tarafta da silinir. Yeniden eklemek için TV'deki kodu okutmanız yeterli.`
                        : ''
                }
                birincilEtiket="Kaldırın"
                birincilIkon="unlink"
                tehlikeli
                onBirincil={() => kaldirilacak && void kaldir(kaldirilacak)}
                kapatEtiketi="Vazgeçin"
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
                    accessibilityLabel={`${u.aliciAdi} TV'sini yeniden ekleyin`}
                >
                    <FontAwesome5 name="qrcode" size={13} color={renkler.metin} style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        Yeniden ekleyin
                    </Text>
                </TouchableOpacity>
            ) : (
                <View className="mt-3" style={{ gap: 4 }}>
                    <AnahtarSatiri
                        testID={`cihaz-sayilsin-${u.aliciKimlik}`}
                        baslik="TV'de durumum sayılsın"
                        aciklama="Kıldığınız vakitler TV'deki hatırlatmayı etkiler. Kapalıyken TV yalnız vakitleri gösterir."
                        deger={u.durumumSayilsin}
                        onDegistir={(v) => onAyar({ durumumSayilsin: v })}
                        renkler={renkler}
                    />
                    <AnahtarSatiri
                        testID={`cihaz-hatirlat-${u.aliciKimlik}`}
                        baslik="Vakit daralınca TV'de hatırlatın"
                        aciklama={
                            u.durumumSayilsin
                                ? 'Vaktin son 30 dakikasında, kılmadıysanız ekranın altında sessiz bir bant çıkar. Ses çalmaz.'
                                : 'Önce “TV’de durumum sayılsın”ı açın.'
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
                accessibilityLabel={`${u.aliciAdi} TV'sini kaldırın`}
            >
                <FontAwesome5 name="unlink" size={12} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                    Kaldırın
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

/** Görünen en fazla düğüm; fazlası "+N" düğümünde toplanır (küçük ekranda sıkışmasın). */
const AZAMI_DUGUM = 3;

/**
 * Telefon üstte, cihazlar altta; aralarındaki bağ çizgileri. Çizgi bir kez çizilir: önce
 * telefondan inen gövde, sonra yatay kol, sonra her cihaza inen dal. Yeni bir cihaz eklenince
 * (kimlik kümesi büyüdüğünde) sahne bir kez daha oynar; durum değişimi çizgiyi yeniden ÇİZMEZ,
 * yalnız rengini değiştirir.
 */
const AgHaritasi: React.FC<{ renkler: Renkler; liste: CihazUyeligi[]; onEkle: () => void }> = ({ renkler, liste, onEkle }) => {
    const azalt = useHareketAzalt();
    const ilerleme = React.useRef(new Animated.Value(0)).current;
    const gorulen = React.useRef<Set<string>>(new Set());
    const gorunen = liste.slice(0, AZAMI_DUGUM);
    const fazla = liste.length - gorunen.length;
    const dugumSayisi = Math.max(1, gorunen.length + (fazla > 0 ? 1 : 0));
    const anahtar = liste.map((u) => u.aliciKimlik).join(',');

    React.useEffect(() => {
        const kimlikler = anahtar ? anahtar.split(',') : [];
        const yeniVar = kimlikler.some((k) => !gorulen.current.has(k));
        kimlikler.forEach((k) => gorulen.current.add(k));
        if (kimlikler.length === 0) {
            ilerleme.setValue(0);
            return;
        }
        if (!yeniVar) return;
        if (azalt) {
            ilerleme.setValue(1);
            return;
        }
        ilerleme.setValue(0);
        const a = Animated.timing(ilerleme, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true });
        a.start();
        return () => a.stop();
    }, [anahtar, azalt, ilerleme]);

    const govde = ilerleme.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });
    const kol = ilerleme.interpolate({ inputRange: [0, 0.3, 0.65, 1], outputRange: [0, 0, 1, 1] });
    const dal = ilerleme.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0, 0, 1] });
    const bagRengi = (u?: CihazUyeligi) =>
        !u ? renkler.sinir : u.durum === 'tamam' ? renkler.birincil : u.durum === 'reddedildi' ? renkler.hata : renkler.metinIkincil;
    const bos = liste.length === 0;
    const kolPayi = `${50 / dugumSayisi}%` as const;

    return (
        <View
            testID="cihazlarim-harita"
            className="px-4 pt-5 pb-4"
            style={kartStili(renkler)}
            accessible
            accessibilityLabel={
                bos ? 'Bu telefona bağlı TV yok' : `Bu telefona bağlı ${liste.length} TV: ${liste.map((u) => u.aliciAdi).join(', ')}`
            }
        >
            <View className="items-center">
                <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: renkler.birincil + '20' }}>
                    <FontAwesome5 name="mobile-alt" size={20} color={renkler.birincil} />
                </View>
                <Text className="text-xs mt-1.5" style={{ color: renkler.metinIkincil }}>
                    Bu telefon
                </Text>
            </View>

            {/* Gövde: telefondan kola inen çizgi */}
            <View style={{ alignItems: 'center', height: 18 }}>
                <Animated.View
                    style={{
                        width: 2,
                        height: 18,
                        backgroundColor: bos ? renkler.sinir : renkler.birincil,
                        transformOrigin: 'top',
                        transform: [{ scaleY: bos ? 1 : govde }],
                    }}
                />
            </View>
            {/* Kol: ilk düğümün ortasından son düğümün ortasına */}
            {dugumSayisi > 1 && (
                <View style={{ height: 2, marginHorizontal: 0 }}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: kolPayi,
                            right: kolPayi,
                            height: 2,
                            backgroundColor: renkler.birincil,
                            transform: [{ scaleX: kol }],
                        }}
                    />
                </View>
            )}

            <View className="flex-row">
                {(bos ? [undefined] : gorunen).map((u, i) => (
                    <View key={u?.aliciKimlik ?? 'bos'} className="flex-1 items-center">
                        <Animated.View
                            style={{
                                width: 2,
                                height: 16,
                                backgroundColor: bagRengi(u),
                                opacity: u?.durum === 'ulasilamadi' ? 0.5 : 1,
                                transformOrigin: 'top',
                                transform: [{ scaleY: bos ? 1 : dal }],
                            }}
                        />
                        {u ? (
                            <View className="items-center" style={{ maxWidth: '100%' }}>
                                <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: bagRengi(u) + '20' }}>
                                    <FontAwesome5 name="tv" size={15} color={bagRengi(u)} />
                                </View>
                                <Text className="text-xs mt-1.5 px-1" style={{ color: renkler.metin }} numberOfLines={1}>
                                    {u.aliciAdi}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                key={`bos-${i}`}
                                className="items-center"
                                onPress={onEkle}
                                accessibilityRole="button"
                                accessibilityLabel="TV ekleyin"
                                hitSlop={8}
                            >
                                <View
                                    className="w-11 h-11 rounded-2xl items-center justify-center"
                                    style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: renkler.metinIkincil }}
                                >
                                    <FontAwesome5 name="plus" size={13} color={renkler.metinIkincil} />
                                </View>
                                <Text className="text-xs mt-1.5" style={{ color: renkler.metinIkincil }}>
                                    TV ekleyin
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                {fazla > 0 && (
                    <View className="flex-1 items-center">
                        <Animated.View
                            style={{ width: 2, height: 16, backgroundColor: renkler.birincil, transformOrigin: 'top', transform: [{ scaleY: dal }] }}
                        />
                        <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: renkler.birincil + '20' }}>
                            <Text className="text-sm font-bold" style={{ color: renkler.birincil }}>
                                +{fazla}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
