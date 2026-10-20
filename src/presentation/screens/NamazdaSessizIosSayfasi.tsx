/**
 * "Namazda sessiz" — iPhone (Android'deki Camideyim + Namaz modunun iOS karşılığı).
 *
 * iOS bir uygulamanın sessiz modu, Rahatsız Etmeyin'i ya da Odak'ı kendisinin açmasına
 * İZİN VERMEZ. Apple'ın izin verdiği iki yol rehber olarak sunulur:
 *   1) Kullanıcının "Namaz" Odak'ı + uygulamanın Odak filtresi (`NamazOdakFiltresi`):
 *      Odak açıkken hatırlatmalar `passive` gelir (`core/muhafiz/ios/odakFiltresi.ts`).
 *   2) Odak'ın kendi "Zamanlama ekle › Konum" tetiği → camiye ya da kendi belirlediğiniz
 *      yere varınca açılır, ayrılınca kapanır. Yakındaki camiler paketlenmiş OSM
 *      verisinden JS ile listelenir (`IosCamiAramaServisi`, konum İSTENMEZ).
 *   3) Vakit tabanlı: Kısayollar'ın saat tetiği SABİTTİR, değişen vakitlere uymaz →
 *      kişisel otomasyon "Namaz Akışı açıldığında" + uygulamanın "Namaz sessizliği"
 *      App Intent'i (`targets/siri-kisayollari/NamazSessizlikIntentleri.swift`) + Odak'ı
 *      ayarla (bitiş: "Namaz sessizliğinin bitişi"). Vakit bildirimine dokunmak yeter.
 * Uygulama Odak'ın kurulu olup olmadığını OKUYAMAZ; işaretler kullanıcının kendi notudur.
 * Ayarlar'ın Odak sayfasına açık bir bağlantı yoktur (`App-Prefs:` özel API'dir, App
 * Review reddeder) → "Ayarlar'ı açın" uygulamanın kendi ayar sayfasını açar.
 */
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppSelector } from '../store/hooks';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { widgetVerisiOlustur } from '../../core/widget/widgetYuku';
import { gununSessizlikPencereleri, namazSessizligi, SESSIZLIK_EN_AZ_DK, SESSIZLIK_EN_COK_DK } from '../../core/siri/sessizlikKarari';
import { vakitGorunenAdi } from '../../core/siri/siriKarari';
import { yakinCamileriBul, type YakinCamiOzeti } from '../../domain/services/IosCamiAramaServisi';
import { useIosSessizKurulum } from '../hooks/useIosSessizKurulum';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { KisayolBlogu, KurulumAdimi, OdakSemasi, YolCipleri } from '../components/sessizIos/SessizIosParcalari';

const CAMI_SAYISI = 4;

const ikiHane = (n: number) => String(n).padStart(2, '0');
const saat = (ms: number) => {
    const d = new Date(ms);
    return `${ikiHane(d.getHours())}:${ikiHane(d.getMinutes())}`;
};
const mesafeMetni = (m: number) =>
    m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;

async function ac(url: string, hata: string) {
    try {
        await Linking.openURL(url);
    } catch {
        kisaBildirimGoster(hata);
    }
}

export const NamazdaSessizIosSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    const { kurulum, adimiDegistir, dakikaYaz } = useIosSessizKurulum();
    const [camiler, setCamiler] = useState<YakinCamiOzeti[] | null>(null);
    const lat = koordinat?.lat;
    const lng = koordinat?.lng;
    const konumVar = lat != null && lng != null && !(lat === 0 && lng === 0);

    useEffect(() => {
        if (!konumVar) {
            setCamiler([]);
            return;
        }
        let iptal = false;
        yakinCamileriBul(lat as number, lng as number, CAMI_SAYISI)
            .then((l) => {
                if (!iptal) setCamiler(l);
            })
            .catch(() => {
                if (!iptal) setCamiler([]);
            });
        return () => {
            iptal = true;
        };
    }, [lat, lng, konumVar]);

    const bugun = useMemo(() => {
        if (!konumVar) return null;
        const tarih = bugunuAl();
        const vakitler = widgetVerisiOlustur({ lat: lat as number, lng: lng as number }, tarih).vakitler;
        return {
            pencereler: gununSessizlikPencereleri(vakitler, tarih, kurulum.dakika),
            simdi: namazSessizligi(vakitler, Date.now(), kurulum.dakika),
        };
    }, [konumVar, lat, lng, kurulum.dakika]);

    const tamam = (a: 'odak' | 'cami' | 'vakit') => kurulum.tamam.includes(a);
    const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24 };
    const birincilDugme = (testID: string, ikon: string, metin: string, onPress: () => void) => (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            accessibilityRole="button"
            className="flex-row items-center justify-center rounded-2xl px-5 mt-4"
            style={{ minHeight: 48, backgroundColor: renkler.birincil }}
        >
            <FontAwesome5 name={ikon} size={15} color={renkler.birincilMetin} solid />
            <Text className="text-base font-bold ml-2" style={{ color: renkler.birincilMetin }}>
                {metin}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: renkler.arkaplan }}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} testID="namazda-sessiz-ios">
                <OdakSemasi />
                <Text className="text-sm leading-5 mt-4 mb-6 px-1" style={{ color: renkler.metinIkincil }}>
                    iPhone sessize almayı yalnız Odak ile yapar. Bir kez kurun, gerisini iPhone halleder.
                </Text>

                <View className="p-5" style={kart}>
                    <KurulumAdimi
                        testID="adim-odak"
                        sira={1}
                        baslik="Namaz odağını oluşturun"
                        tamam={tamam('odak')}
                        onDegistir={() => adimiDegistir('odak')}
                    >
                        <YolCipleri adimlar={['Ayarlar', 'Odak', '+', 'Özel', 'Namaz']} />
                        <Text className="text-sm font-semibold mt-4 mb-2" style={{ color: renkler.metin }}>
                            Hatırlatmalarımızı da sessize alın
                        </Text>
                        <YolCipleri adimlar={['Namaz', 'Odak filtreleri', 'Namaz Akışı', 'Hatırlatmaları sessiz ver']} />
                        <Text className="text-xs leading-4 mt-2" style={{ color: renkler.metinIkincil }}>
                            Odak açıkken hatırlatmalar ses çıkarmadan, ekranı yakmadan gelir. Hiçbiri kaybolmaz.
                        </Text>
                        {birincilDugme('ayarlari-ac', 'cog', "Ayarlar'ı açın", () => {
                            Linking.openSettings().catch(() => kisaBildirimGoster("Ayarlar açılamadı. Ayarlar uygulamasından Odak'a girin."));
                        })}
                    </KurulumAdimi>

                    <KurulumAdimi
                        testID="adim-cami"
                        sira={2}
                        baslik="Camiye varınca açılsın"
                        tamam={tamam('cami')}
                        onDegistir={() => adimiDegistir('cami')}
                    >
                        <YolCipleri adimlar={['Namaz', 'Zamanlama ekle', 'Konum', 'Caminin adı']} />
                        <Text className="text-xs leading-4 mt-2 mb-3" style={{ color: renkler.metinIkincil }}>
                            Camiden çıkınca Odak kendiliğinden kapanır.
                        </Text>
                        {camiler == null ? null : camiler.length === 0 ? (
                            <Text testID="cami-yok" className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                                Yakında cami bulunamadı. Caminizin adını Konum ekranında arayabilirsiniz.
                            </Text>
                        ) : (
                            camiler.map((c) => (
                                <TouchableOpacity
                                    key={c.id}
                                    testID={`cami-${c.id}`}
                                    onPress={() =>
                                        ac(
                                            `maps://?q=${encodeURIComponent(c.ad)}&ll=${c.lat},${c.lng}`,
                                            'Haritalar açılamadı.'
                                        )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={`${c.ad}, ${mesafeMetni(c.mesafeM)}. Haritalar'da görün.`}
                                    className="flex-row items-center rounded-2xl p-3 mb-2"
                                    style={{ minHeight: 52, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                                >
                                    <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: `${renkler.birincil}20` }}>
                                        <FontAwesome5 name="mosque" size={14} color={renkler.birincil} solid />
                                    </View>
                                    <View className="flex-1 mx-3">
                                        <Text selectable className="text-sm font-semibold" style={{ color: renkler.metin }} numberOfLines={2}>
                                            {c.ad}
                                        </Text>
                                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            {mesafeMetni(c.mesafeM)}
                                        </Text>
                                    </View>
                                    <FontAwesome5 name="map" size={14} color={renkler.metinIkincil} />
                                </TouchableOpacity>
                            ))
                        )}
                        <View className="flex-row items-center mt-2">
                            <FontAwesome5 name="home" size={12} color={renkler.birincil} solid />
                            <Text className="text-xs leading-4 ml-2 flex-1" style={{ color: renkler.metinIkincil }}>
                                Ev, iş ya da başka bir yer için aynı yoldan konum ekleyebilirsiniz.
                            </Text>
                        </View>
                    </KurulumAdimi>

                    <KurulumAdimi
                        testID="adim-vakit"
                        sira={3}
                        baslik="Namaz vakitlerinde açılsın"
                        tamam={tamam('vakit')}
                        onDegistir={() => adimiDegistir('vakit')}
                        son
                    >
                        <YolCipleri adimlar={['Kısayollar', 'Otomasyon', '+', 'Uygulama', 'Namaz Akışı', 'Açıldığında']} />
                        <View className="mt-3">
                            <KisayolBlogu
                                ikon="moon"
                                baslik="Namaz sessizliği"
                                ayrinti={`Vakit girdikten sonraki ${kurulum.dakika} dakika`}
                            />
                            <KisayolBlogu ikon="code-branch" baslik="Eğer" ayrinti="Sonuç doğruysa" />
                            <KisayolBlogu
                                ikon="toggle-on"
                                baslik="Odak'ı ayarla"
                                ayrinti="Namaz açık, bitiş: Namaz sessizliğinin bitişi"
                                girinti
                            />
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Sessizlik süresi
                            </Text>
                            <SayisalSecici
                                deger={kurulum.dakika}
                                min={SESSIZLIK_EN_AZ_DK}
                                max={SESSIZLIK_EN_COK_DK}
                                adim={5}
                                birim="dk"
                                aciklama="Sessizlik süresi"
                                renk={renkler.birincil}
                                onChange={dakikaYaz}
                            />
                        </View>
                        {bugun && bugun.pencereler.length > 0 && (
                            <View testID="bugun-pencereleri" className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
                                {bugun.pencereler.map((p) => {
                                    const simdi = bugun.simdi.sessiz && bugun.simdi.vakit === p.vakit && bugun.simdi.bitisMs === p.bitisMs;
                                    return (
                                        <View
                                            key={p.vakit}
                                            className="rounded-lg px-2.5 py-1.5"
                                            style={{
                                                backgroundColor: simdi ? renkler.birincil : renkler.arkaplan,
                                                borderWidth: simdi ? 0 : 1,
                                                borderColor: renkler.sinir,
                                            }}
                                        >
                                            <Text
                                                className="text-xs font-semibold"
                                                style={{ color: simdi ? renkler.birincilMetin : renkler.metin, fontVariant: ['tabular-nums'] }}
                                            >
                                                {`${vakitGorunenAdi(p.vakit)} ${saat(p.baslangicMs)}–${saat(p.bitisMs)}`}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                        <Text className="text-xs leading-4 mt-3" style={{ color: renkler.metinIkincil }}>
                            Otomasyonda Hemen çalıştır'ı seçin. Vakit bildirimine dokunduğunuzda iPhone Namaz odağına geçer.
                        </Text>
                        {birincilDugme('kisayollari-ac', 'magic', "Kısayollar'ı açın", () =>
                            ac('shortcuts://', 'Kısayollar açılamadı. Uygulama silinmiş olabilir; App Store\'dan yükleyebilirsiniz.')
                        )}
                    </KurulumAdimi>
                </View>
            </ScrollView>
        </View>
    );
};
