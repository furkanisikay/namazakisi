/**
 * Televizyonda gösterin — telefonun konumunu evdeki Android TV'ye aktarır.
 *
 * İki yol, ikisi de sunucusuz:
 * 1. QR (önerilen): TV'deki kare kodu okutun → konum aynı Wi-Fi'deki TV'ye DOĞRUDAN gider.
 * 2. Kod (yedek): Wi-Fi/kamera yoksa TV'ye 7 haneli kodu girin; hiç ağ gerekmez.
 *
 * Sahne (imza öğesi, `TelevizyonSahnesi`): konum iğnesi telefondan kalkar; istek sürerken
 * yerinde süzülür (dürüst bekleme — gerçek isteğe bağlı), başarıda yay çizip TV'ye konar ve
 * TV ekranı dolar; hatada iğne telefona geri düşer, köprü çizgisi kırmızı ve düz kalır.
 * Boşta hiçbir şey hareket etmez. "Hareketi azalt" açıksa sahne son karesine atlar.
 *
 * `namazakisi://tv?...` derin bağlantısı (iPhone kamerasıyla okutulan QR) bu sayfayı sorgu
 * alanlarıyla açar; sayfa onları aynı doğrulamadan (`tvQrCoz`) geçirip gönderimi başlatır.
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
import { tvQrCoz, type TvBaglantisi } from '../../core/tv/eslemeBaglantisi';
import { TvEslemeServisi, type GonderimSonucu } from '../../domain/services/TvEslemeServisi';
import { TelevizyonSahnesi, type SahneDurumu } from '../components/tv/TelevizyonSahnesi';
import type { TvDerinParametreleri } from '../../navigation/ayarlarEkranlari';

type Hata = Exclude<GonderimSonucu, 'tamam'> | 'gecersizQr' | 'tarayiciYok';

const HATA_METNI: Record<Hata, string> = {
    ulasilamadi:
        "TV'ye ulaşılamadı. Telefon ile TV aynı Wi-Fi ağında olmalı; misafir ağı ya da VPN bağlantıyı engelleyebilir. Olmazsa aşağıdaki kodu TV'ye girin.",
    suresiDoldu: "Bu kare kodun süresi doldu. TV'de ekranı yeniden açın ve yeni kodu okutun.",
    reddedildi: 'TV konumu kabul etmedi. Konumunuzu yenileyip yeniden deneyin.',
    gecersizQr:
        "Bu kare kod Namaz Akışı TV'ye ait değil. TV'deki “Vakitleri telefonunuzdan alın” ekranındaki kodu okutun.",
    tarayiciYok: "Kamera tarayıcısı bu telefonda açılamadı. Aşağıdaki 7 haneli kodu TV'ye girin.",
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
    const [hareketAzalt, setHareketAzalt] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const kodY = useRef(0);
    const islemde = useRef(false);

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

    const gonder = useCallback(
        async (baglanti: TvBaglantisi) => {
            setHata(null);
            setDurum('gonderiliyor');
            const sonuc = await TvEslemeServisi.konumuGonder(baglanti, { ad: konumAdi, lat, lng });
            if (sonuc === 'tamam') {
                setDurum('tamam');
                AccessibilityInfo.announceForAccessibility(`Konumunuz televizyona aktarıldı: ${konumAdi}`);
            } else {
                setDurum('hata');
                setHata(sonuc);
                if (sonuc === 'ulasilamadi') koduGoster();
            }
        },
        [konumAdi, lat, lng, koduGoster],
    );

    const metniIsle = useCallback(
        async (metin: string) => {
            const baglanti = tvQrCoz(metin);
            if (!baglanti) {
                setDurum('hata');
                setHata('gecersizQr');
                return;
            }
            await gonder(baglanti);
        },
        [gonder],
    );

    const okut = useCallback(async () => {
        if (islemde.current || !konumVar) return;
        islemde.current = true;
        try {
            setHata(null);
            setDurum('hazir');
            const okuma = await TvEslemeServisi.qrOku();
            if (okuma.tur === 'okundu') await metniIsle(okuma.metin);
            else if (okuma.tur === 'tarayiciYok') {
                setDurum('hata');
                setHata('tarayiciYok');
                koduGoster();
            }
        } finally {
            islemde.current = false;
        }
    }, [konumVar, metniIsle, koduGoster]);

    // Derin bağlantı: iPhone kamerasıyla okutulan QR bu sayfayı sorgu alanlarıyla açar.
    // Aynı anahtar bir kez işlenir (yeniden çizimde ikinci gönderim olmasın).
    const p = route.params;
    const derinQr = p?.k ? `namazakisi://tv?v=${p.v ?? ''}&a=${p.a ?? ''}&p=${p.p ?? ''}&k=${p.k}` : null;
    const islenenDerinQr = useRef<string | null>(null);
    useEffect(() => {
        if (!derinQr || !konumVar || islemde.current || islenenDerinQr.current === derinQr) return;
        islenenDerinQr.current = derinQr;
        islemde.current = true;
        navigation.setParams?.({ v: undefined, a: undefined, p: undefined, k: undefined });
        metniIsle(derinQr).finally(() => {
            islemde.current = false;
        });
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
                    <SonucSatiri durum={durum} hata={hata} konumAdi={konumAdi} />
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
                        <Adim sira={3} metin="Konum TV'ye gelir; vakitler orada da hazırdır." />
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
                    Konumunuz yalnız evinizin ağında doğrudan TV'ye gider; hesap açılmaz, başka hiçbir yere gönderilmez.
                    {Platform.OS === 'ios' ? ' iPhone ilk seferde yerel ağ izni sorar.' : ''}
                </Text>
            </View>
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

const SonucSatiri: React.FC<{ durum: SahneDurumu; hata: Hata | null; konumAdi: string }> = ({ durum, hata, konumAdi }) => {
    const renkler = useRenkler();
    const gorunurluk = useRef(new Animated.Value(1)).current;
    const metin =
        durum === 'tamam'
            ? `TV artık ${konumAdi} vakitlerini gösteriyor.`
            : durum === 'gonderiliyor'
              ? "TV'ye gönderiliyor…"
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
