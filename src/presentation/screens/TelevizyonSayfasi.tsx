/**
 * TV ekleyin (Ayarlar › Cihazlarım › TV ekleyin) — telefonu evdeki Android TV ile eşleştirir.
 *
 * Eşleştirme v2 (tasarım `docs/superpowers/specs/2026-10-21-cihaz-ekosistemi-design.md` §4.1):
 * 1. TV'deki kare kodu okutun → QR yalnız GEÇİCİ sır taşır.
 * 2. Bu telefonda onay: "Şu TV'ye bağlanıyorsunuz: <ad>" (derin bağlantı dahil; denetim D-01:
 *    onaysız HİÇBİR ŞEY gönderilmez).
 * 3. TV'de kumandayla "Ekleyin" → üyeye özel anahtar gelir (secure-store), ilk eşitleme konumu
 *    (~1 km'ye yuvarlanmış) ve kılınmışlığı TV'ye taşır.
 * Yedek: Wi-Fi/kamera yoksa TV'ye 7 haneli konum kodu (yalnız konum, hiç ağ yok).
 *
 * Sahne (`TelevizyonSahnesi`): konum iğnesi telefondan kalkar; TV onayı beklenirken yerinde
 * süzülür (dürüst bekleme), başarıda yay çizip TV'ye konar; hatada geri düşer. Boşta hareket yok.
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { useAppSelector } from '../store/hooks';
import { konumMetniHesapla } from '../../core/ayarlar/konumMetni';
import { koduBicimle, konumuKodla } from '../../core/tv/eslemeKodu';
import { eslesmeQrCoz, tvQrSurumu, type EslesmeQr } from '../../core/cihazAgi/eslesme';
import { TvEslemeServisi } from '../../domain/services/TvEslemeServisi';
import { esles, type EslesmeSonucu } from '../../domain/services/CihazEslesmeServisi';
import { TvSenkronServisi } from '../../domain/services/TvSenkronServisi';
import { TelevizyonSahnesi, type SahneDurumu } from '../components/tv/TelevizyonSahnesi';
import { BildirimModali } from '../components/common/BildirimModali';
import type { TvDerinParametreleri } from '../../navigation/ayarlarEkranlari';

type Hata = Exclude<EslesmeSonucu, 'onay' | 'iptal'> | 'gecersizQr' | 'eskiTv' | 'tarayiciYok' | 'kameraIzniYok';

const HATA_METNI: Record<Hata, string> = {
    ulasilamadi:
        "TV'ye ulaşılamadı. Telefon ile TV aynı Wi-Fi ağında olmalı; misafir ağı ya da VPN bağlantıyı engelleyebilir. Olmazsa aşağıdaki kodu TV'ye girin." +
        (Platform.OS === 'ios' ? ' iPhone yerel ağ izni sorduysa izin verip yeniden okutun.' : ''),
    gecersiz: "Bu kare kodun süresi doldu. TV'de “Telefonunuzu ekleyin” ekranını yeniden açın ve yeni kodu okutun.",
    zamanAsimi: "TV'de onay gelmedi. Kodu yeniden okutun ve TV'de kumandayla “Ekleyin”e basın.",
    red: "TV'de “Hayır” seçildi; bu telefon eklenmedi.",
    gecersizQr: "Bu kare kod Namaz Akışı TV'ye ait değil. TV'deki “Telefonunuzu ekleyin” ekranındaki kodu okutun.",
    eskiTv: "TV'deki Namaz Akışı eski. TV'de Google Play'den güncelleyin; o zamana kadar aşağıdaki 7 haneli kodla konumu aktarabilirsiniz.",
    tarayiciYok: "Kamera bu telefonda açılamadı. Aşağıdaki 7 haneli kodu TV'ye girin.",
    kameraIzniYok:
        "Kodu okumak için kamera izni gerekir. Telefon ayarlarından kamerayı açın ya da aşağıdaki 7 haneli kodu TV'ye girin.",
};

type Rota = { params?: TvDerinParametreleri };

export const TelevizyonSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation() as unknown as { navigate: (ekran: string) => void; setParams?: (p: object) => void };
    const route = useRoute() as unknown as Rota;
    const konum = useAppSelector((s) => s.konum);

    const lat = konum.koordinatlar?.lat ?? 0;
    const lng = konum.koordinatlar?.lng ?? 0;
    const konumVar = !(lat === 0 && lng === 0);
    const konumAdi = konumMetniHesapla(konum);
    const kod = useMemo(() => (konumVar ? konumuKodla(lat, lng) : null), [konumVar, lat, lng]);

    const [durum, setDurum] = useState<SahneDurumu>('hazir');
    const [hata, setHata] = useState<Hata | null>(null);
    const [tvOnayiBekleniyor, setTvOnayiBekleniyor] = useState(false);
    const [onayBekleyen, setOnayBekleyen] = useState<EslesmeQr | null>(null);
    const [eklenenTv, setEklenenTv] = useState<string | null>(null);
    const [hareketAzalt, setHareketAzalt] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const kodY = useRef(0);
    const islemde = useRef(false);
    const bagli = useRef(true);
    useEffect(
        () => () => {
            bagli.current = false;
        },
        [],
    );

    useEffect(() => {
        let iptal = false;
        AccessibilityInfo.isReduceMotionEnabled()
            .then((d) => {
                if (!iptal) setHareketAzalt(d === true);
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, []);

    const koduGoster = useCallback(() => {
        setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, kodY.current - 24), animated: true }), 250);
    }, []);

    /** Okunan / derin bağlantıyla gelen metin: doğrula, sonra BU TELEFONDA onay iste. */
    const metniIsle = useCallback(async (metin: string) => {
        if (tvQrSurumu(metin) === 1) {
            setDurum('hata');
            setHata('eskiTv');
            return;
        }
        const qr = eslesmeQrCoz(metin);
        if (!qr) {
            setDurum('hata');
            setHata('gecersizQr');
            return;
        }
        setHata(null);
        setDurum('hazir');
        setOnayBekleyen(qr);
    }, []);

    const eslestir = useCallback(
        async (qr: EslesmeQr) => {
            setOnayBekleyen(null);
            if (islemde.current) return;
            islemde.current = true;
            setHata(null);
            setDurum('gonderiliyor');
            setTvOnayiBekleniyor(true);
            try {
                const sonuc = await esles(qr, { iptalMi: () => !bagli.current });
                if (!bagli.current) return;
                setTvOnayiBekleniyor(false);
                if (sonuc === 'onay') {
                    // İlk eşitleme: konum + kılınmışlık TV'ye hemen gider.
                    await TvSenkronServisi.getInstance().gonder(true).catch(() => undefined);
                    setEklenenTv(qr.aliciAdi);
                    setDurum('tamam');
                    AccessibilityInfo.announceForAccessibility(`${qr.aliciAdi} eklendi`);
                } else if (sonuc !== 'iptal') {
                    setDurum('hata');
                    setHata(sonuc);
                    if (sonuc === 'ulasilamadi') koduGoster();
                }
            } finally {
                islemde.current = false;
            }
        },
        [koduGoster],
    );

    const okut = useCallback(async () => {
        if (islemde.current || !konumVar) return;
        setHata(null);
        setDurum('hazir');
        const okuma = await TvEslemeServisi.qrOku();
        if (okuma.tur === 'okundu') await metniIsle(okuma.metin);
        else if (okuma.tur === 'tarayiciYok' || okuma.tur === 'kameraIzniYok') {
            setDurum('hata');
            setHata(okuma.tur);
            koduGoster();
        }
    }, [konumVar, metniIsle, koduGoster]);

    // iOS: tarayıcı okumayı OLAYLA bildirir (kullanıcı tarayıcıyı kapatırsa hiçbir şey gelmez).
    const metniIsleRef = useRef(metniIsle);
    metniIsleRef.current = metniIsle;
    useEffect(() => TvEslemeServisi.iosOkumaDinle((metin) => void metniIsleRef.current(metin)), []);

    // Derin bağlantı (iPhone kamerası): yalnız ONAY EKRANINI açar; gönderim kullanıcı onayıyla.
    const p = route.params;
    const derinQr = p?.s
        ? `namazakisi://tv?v=${p.v ?? ''}&a=${p.a ?? ''}&p=${p.p ?? ''}&i=${p.i ?? ''}&s=${p.s}&d=${encodeURIComponent(p.d ?? '')}`
        : p?.k
          ? `namazakisi://tv?v=${p.v ?? ''}&a=${p.a ?? ''}&p=${p.p ?? ''}&k=${p.k}`
          : null;
    const islenenDerinQr = useRef<string | null>(null);
    useEffect(() => {
        if (!derinQr || !konumVar || islenenDerinQr.current === derinQr) return;
        islenenDerinQr.current = derinQr;
        navigation.setParams?.({ v: undefined, a: undefined, p: undefined, k: undefined, i: undefined, s: undefined, d: undefined });
        void metniIsle(derinQr);
    }, [derinQr, konumVar, metniIsle, navigation]);

    const gonderiliyor = durum === 'gonderiliyor';
    const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, padding: 18 };

    return (
        <ScrollView
            ref={scrollRef}
            style={{ flex: 1, backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={{ fontSize: 15, lineHeight: 22, color: renkler.metinIkincil, marginBottom: 14 }}>
                Evdeki Android TV, vakitleri sizin konumunuza göre büyük ekranda gösterir. Konumu bir kez aktarmanız yeter.
            </Text>

            <View style={[kart, { padding: 0, overflow: 'hidden' }]}>
                <TelevizyonSahnesi durum={durum} hareketAzalt={hareketAzalt} />
                <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
                    <SonucSatiri durum={durum} hata={hata} konumAdi={konumAdi} tvOnayi={tvOnayiBekleniyor} eklenenTv={eklenenTv} />
                </View>
            </View>

            {!konumVar ? (
                <View style={[kart, { marginTop: 16 }]}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>Önce konumunuzu belirleyin</Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginTop: 6 }}>
                        TV'ye gönderilecek bir konum henüz yok.
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('KonumAyarlari')}
                        accessibilityRole="button"
                        style={{ marginTop: 12, minHeight: 44, justifyContent: 'center' }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: '600', color: renkler.birincil }}>Konum ayarlarını açın</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={[kart, { marginTop: 16, flexDirection: 'row', alignItems: 'center' }]}>
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: renkler.birincil + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14,
                            }}
                        >
                            <FontAwesome5 name="map-marker-alt" size={18} color={renkler.birincil} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, color: renkler.metinIkincil }}>TV'ye gidecek konum</Text>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin, marginTop: 2 }}>{konumAdi}</Text>
                            {konum.konumModu === 'oto' ? (
                                <Text style={{ fontSize: 13, lineHeight: 18, color: renkler.metinIkincil, marginTop: 4 }}>
                                    Şu an bulunduğunuz yer gider. TV başka bir şehirdeyse TV'de ili kendiniz seçin.
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <TouchableOpacity
                        testID="tv-kodu-okut"
                        onPress={okut}
                        disabled={gonderiliyor}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: gonderiliyor, busy: gonderiliyor }}
                        accessibilityLabel="TV'deki kodu okutun"
                        style={{
                            marginTop: 16,
                            minHeight: 56,
                            borderRadius: 18,
                            backgroundColor: renkler.birincil,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: gonderiliyor ? 0.6 : 1,
                        }}
                    >
                        <FontAwesome5 name="qrcode" size={18} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 10 }}>
                            {durum === 'tamam' ? 'Başka bir TV için okutun' : "TV'deki kodu okutun"}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ marginTop: 20 }}>
                        <Adim sira={1} metin="TV'de Namaz Akışı'nı açın. Uygulama yoksa TV'deki Google Play'den kurun." />
                        <Adim sira={2} metin="Ekranda bir kare kod görünür; yukarıdaki düğmeyle okutun." />
                        <Adim sira={3} metin="TV'de kumandayla “Ekleyin”e basın. Konumunuz TV'ye gelir." />
                    </View>

                    <View
                        onLayout={(e) => {
                            kodY.current = e.nativeEvent.layout.y;
                        }}
                        style={[kart, { marginTop: 16 }]}
                    >
                        <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>Wi-Fi ya da kamera yoksa</Text>
                        {kod ? (
                            <>
                                <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginTop: 6 }}>
                                    TV'de {'“'}Kodla girin{'”'}i seçin ve bu 7 haneyi yazın:
                                </Text>
                                <Text
                                    testID="tv-konum-kodu"
                                    accessibilityLabel={`Kod: ${kod.split('').join(' ')}`}
                                    style={{
                                        fontSize: 36,
                                        fontWeight: '700',
                                        letterSpacing: 4,
                                        color: renkler.metin,
                                        marginTop: 10,
                                        fontVariant: ['tabular-nums'],
                                    }}
                                >
                                    {koduBicimle(kod)}
                                </Text>
                            </>
                        ) : (
                            <Text style={{ fontSize: 14, lineHeight: 20, color: renkler.metinIkincil, marginTop: 6 }}>
                                Bu konum için kod yok. TV'de {'“'}İli kendim seçeyim{'”'} ile ilinizi seçebilirsiniz.
                            </Text>
                        )}
                    </View>
                </>
            )}

            <View style={{ flexDirection: 'row', marginTop: 18, paddingHorizontal: 4 }}>
                <FontAwesome5 name="lock" size={12} color={renkler.metinIkincil} style={{ marginTop: 3, marginRight: 8 }} />
                <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: renkler.metinIkincil }}>
                    Bilgiler yalnız evinizin ağında, şifreli olarak doğrudan TV'ye gider; hesap açılmaz, başka hiçbir yere gönderilmez. Konum yaklaşık 1 km hassasiyetle gider.
                    {Platform.OS === 'ios' ? ' iPhone ilk seferde yerel ağ izni sorar.' : ''}
                </Text>
            </View>
            <BildirimModali
                gorunur={onayBekleyen != null}
                tip="bilgi"
                baslik="Bu TV'ye bağlanılsın mı?"
                mesaj={
                    onayBekleyen
                        ? `Şu TV'ye bağlanıyorsunuz: ${onayBekleyen.aliciAdi}. Onaylarsanız konumunuz ve kıldığınız namazlar bu TV'ye gidebilir; TV'de de kumandayla onay istenir.`
                        : ''
                }
                birincilEtiket="Bağlanın"
                birincilIkon="tv"
                onBirincil={() => onayBekleyen && void eslestir(onayBekleyen)}
                kapatEtiketi="Vazgeçin"
                onKapat={() => setOnayBekleyen(null)}
            />
        </ScrollView>
    );
};

const Adim: React.FC<{ sira: number; metin: string }> = ({ sira, metin }) => {
    const renkler = useRenkler();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View
                style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 1.5,
                    borderColor: renkler.birincil,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                }}
            >
                <Text style={{ fontSize: 13, fontWeight: '700', color: renkler.birincil }}>{sira}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: renkler.metin }}>{metin}</Text>
        </View>
    );
};

const SonucSatiri: React.FC<{ durum: SahneDurumu; hata: Hata | null; konumAdi: string; tvOnayi: boolean; eklenenTv: string | null }> = ({
    durum,
    hata,
    konumAdi,
    tvOnayi,
    eklenenTv,
}) => {
    const renkler = useRenkler();
    const gorunurluk = useRef(new Animated.Value(1)).current;
    const metin =
        durum === 'tamam'
            ? `${eklenenTv ?? 'TV'} eklendi. TV artık ${konumAdi} vakitlerini gösteriyor.`
            : durum === 'gonderiliyor'
              ? tvOnayi
                  ? "TV'de kumandayla “Ekleyin”e basın…"
                  : "TV'ye gönderiliyor…"
              : durum === 'hata' && hata
                ? HATA_METNI[hata]
                : 'Hazır. TV ekranındaki kare kodu okutun.';
    useEffect(() => {
        gorunurluk.setValue(0);
        Animated.timing(gorunurluk, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, [metin, gorunurluk]);
    return (
        <Animated.Text
            testID="tv-sonuc"
            accessibilityLiveRegion="polite"
            style={{
                opacity: gorunurluk,
                fontSize: 15,
                lineHeight: 22,
                fontWeight: durum === 'tamam' ? '600' : '400',
                color: renkler.metin,
                textAlign: 'center',
            }}
        >
            {metin}
        </Animated.Text>
    );
};

export default TelevizyonSayfasi;
