/**
 * Tablet ev ekranı — TV panosunun tablet hâli (ayardan açılır, varsayılan kapalı).
 *
 * Yalnız GÖSTERİR: hatırlatma kurmaz, kayıt yazmaz. Yatay tam ekranda kök gezinmenin
 * üstüne çizilir (Split View'da gösterilmez — `evEkraniGosterilsinMi`). Daima koyu
 * (gece mutfakta parlak zemin göz yorar), ekran açık tutulur (yalnız pano görünürken),
 * içerik dakikada bir birkaç nokta kayar (ekran yanığı). Aynı oturumda "Uygulamaya dönün"
 * ile kapatılabilir; ayar Görünüm sayfasındadır.
 */
import { BirimliSure } from '../common/BirimliSure';
import { kalanSureSesli } from '../../../core/utils/kalanSureParcalari';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { KOYU_TEMA, useRenkler } from '../../../core/theme';
import {
    PANO_ADLARI,
    PANO_VAKITLERI,
    geriSayimMetni,
    kaydirmaOfseti,
    panoDurumuHesapla,
} from '../../../core/evEkrani/evEkrani';
import { gunVakitleriniHesapla } from '../../../core/nafile/gunVakitleri';
import type { GunVakitleri } from '../../../core/nafile/nafileVakitleri';
import { useHesapSurumu } from '../../hooks/useHesapSurumu';
import { bugunuAl, tarihiGorunumFormatinaCevir } from '../../../core/utils/TarihYardimcisi';

const K = KOYU_TEMA.renkler;
const iki = (n: number) => String(n).padStart(2, '0');
const saatMetni = (d: Date) => `${iki(d.getHours())}:${iki(d.getMinutes())}`;

interface Props {
    lat: number;
    lng: number;
    konumMetni: string;
    onKapat: () => void;
}

export const EvEkraniPanosu: React.FC<Props> = ({ lat, lng, konumMetni, onKapat }) => {
    useKeepAwake();
    const renkler = useRenkler();
    const [simdi, setSimdi] = React.useState(() => Date.now());

    // Saniye sınırına hizalı tik: yalnız bu pano çizilir (uygulamanın geri kalanı ona bağlı değil).
    React.useEffect(() => {
        let zaman: ReturnType<typeof setTimeout>;
        const tik = () => {
            const n = Date.now();
            setSimdi(n);
            zaman = setTimeout(tik, 1000 - (n % 1000));
        };
        zaman = setTimeout(tik, 1000 - (Date.now() % 1000));
        return () => clearTimeout(zaman);
    }, []);

    // Gün bazlı önbellek: saniyelik çizim adhan hesabını yinelemesin.
    const onbellek = React.useRef(new Map<string, GunVakitleri>());
    const hesapSurumu = useHesapSurumu();
    const vakitHesapla = React.useCallback(
        (iso: string) => {
            const anahtar = `${lat},${lng},${iso},${hesapSurumu}`;
            const var_ = onbellek.current.get(anahtar);
            if (var_) return var_;
            if (onbellek.current.size > 6) onbellek.current.clear();
            const v = gunVakitleriniHesapla({ lat, lng }, iso);
            onbellek.current.set(anahtar, v);
            return v;
        },
        [lat, lng, hesapSurumu]
    );

    const durum = panoDurumuHesapla(simdi, bugunuAl(), vakitHesapla);
    const [dx, dy] = kaydirmaOfseti(simdi);
    const saat = new Date(simdi);

    return (
        <View testID="ev-ekrani" style={[StyleSheet.absoluteFill, stil.kok, { backgroundColor: K.arkaplan }]}>
            <View style={[stil.icerik, { transform: [{ translateX: dx }, { translateY: dy }] }]}>
                <View style={stil.sol}>
                    <View>
                        <Text style={[stil.konum, { color: K.metin }]}>{konumMetni}</Text>
                        <Text style={[stil.tarih, { color: K.metinIkincil }]}>{tarihiGorunumFormatinaCevir(durum.tarih)}</Text>
                    </View>
                    <View style={stil.saatSatiri}>
                        <Text style={[stil.saat, { color: K.metin }]}>{`${iki(saat.getHours())}:${iki(saat.getMinutes())}`}</Text>
                        <Text style={[stil.saniye, { color: K.metinIkincil }]}>{iki(saat.getSeconds())}</Text>
                    </View>
                    <View accessible accessibilityLabel={`${PANO_ADLARI[durum.siradaki]} vaktine ${kalanSureSesli(geriSayimMetni(durum.kalanMs))} kaldı`}>
                        <Text style={[stil.kalanEtiket, { color: K.metinIkincil }]}>{`${PANO_ADLARI[durum.siradaki]} vaktine kalan`}</Text>
                        <BirimliSure
                            sure={geriSayimMetni(durum.kalanMs)}
                            rakamBoyu={72}
                            birimRengi={K.metinIkincil}
                            style={[stil.kalan, { color: K.metin }]}
                        />
                    </View>
                    <Pressable
                        onPress={onKapat}
                        accessibilityRole="button"
                        accessibilityLabel="Uygulamaya dönün"
                        style={[stil.cikis, { borderColor: K.sinir }]}
                    >
                        <FontAwesome5 name="th-large" size={16} color={K.metinIkincil} />
                        <Text style={[stil.cikisMetni, { color: K.metinIkincil }]}>Uygulamaya dönün</Text>
                    </Pressable>
                </View>
                <View style={stil.sag}>
                    {PANO_VAKITLERI.map((ad) => {
                        const aktif = ad === durum.aktif;
                        const siradaki = ad === durum.siradaki && durum.siradakiMs === durum.vakitler[ad].getTime();
                        return (
                            <View
                                key={ad}
                                accessible
                                accessibilityLabel={`${PANO_ADLARI[ad]} ${saatMetni(durum.vakitler[ad])}${aktif ? ', şu anki vakit' : ''}${siradaki ? ', sıradaki vakit' : ''}`}
                                style={[
                                    stil.satir,
                                    { backgroundColor: aktif ? renkler.birincilKoyu : K.kartArkaplan },
                                    siradaki && { borderColor: renkler.birincil, borderWidth: 2 },
                                ]}
                            >
                                <Text style={[stil.vakitAdi, { color: K.metin, fontWeight: aktif ? '700' : '400' }]}>{PANO_ADLARI[ad]}</Text>
                                <Text style={[stil.vakitSaati, { color: K.metin, fontWeight: aktif ? '700' : '500' }]}>
                                    {saatMetni(durum.vakitler[ad])}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const stil = StyleSheet.create({
    kok: { zIndex: 10, elevation: 10 },
    icerik: { flex: 1, flexDirection: 'row', paddingHorizontal: 64, paddingVertical: 48, gap: 56 },
    sol: { flex: 1.1, justifyContent: 'space-between' },
    sag: { flex: 1, justifyContent: 'center', gap: 12 },
    konum: { fontSize: 30, fontWeight: '600' },
    tarih: { fontSize: 20, marginTop: 4 },
    saatSatiri: { flexDirection: 'row', alignItems: 'flex-end' },
    saat: { fontSize: 140, fontWeight: '200', lineHeight: 150, fontVariant: ['tabular-nums'] },
    saniye: { fontSize: 40, marginLeft: 8, marginBottom: 22, fontVariant: ['tabular-nums'] },
    kalanEtiket: { fontSize: 22 },
    kalan: { fontWeight: '600', fontVariant: ['tabular-nums'] },
    cikis: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 10,
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 22,
        borderWidth: StyleSheet.hairlineWidth,
    },
    cikisMetni: { fontSize: 16 },
    satir: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 76,
        paddingHorizontal: 28,
        borderRadius: 18,
        borderColor: 'transparent',
    },
    vakitAdi: { fontSize: 30 },
    vakitSaati: { fontSize: 34, fontVariant: ['tabular-nums'] },
});
