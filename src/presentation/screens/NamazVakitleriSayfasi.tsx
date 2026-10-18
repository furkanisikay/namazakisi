/**
 * Namaz vakitleri (sade tasarım, Dalga 3) — vakit hesabına ve vakte bağlı içeriğe
 * dair her şey tek yerde: Konum · Mezhep · Yolculuk bilgisi · Vakitleri takvime ekleme.
 *
 * MEZHEP buraya "Yolculuk bilgisi"nden taşındı: ortak bir ayardır (yolculuk kartı +
 * Kaza Defteri'nde vitir) ve yolculuk sayfasında aranmıyordu. Yazma yolu AYNI
 * (`useSeferilik().mezhepAyarla` → seferîlik dilimi → ortak `MEZHEP_AYARI`).
 * Namaz vakti hesabına DOKUNMAZ (Diyanet takvimi asr-ı evvel; AGENTS.md).
 */
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useSeferilik } from '../hooks/useSeferilik';
import { useKonumYenile } from '../hooks/useKonumYenile';
import { konumOzeti, takvimOzeti } from '../../core/ayarlar/ozetler';
import { takvimAyarlariniYukle } from '../store/takvimSlice';
import { MEZHEPLER, MEZHEP_ADLARI, type Mezhep } from '../../core/seferilik/seferilikAyarlari';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { KonumYenileButonu } from '../components/common/KonumYenileButonu';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { SecenekListesi, type Secenek } from '../components/ortak/SecenekListesi';
import { NotSatiri } from '../components/ortak/NotSatiri';

type Navigasyon = { navigate: (ekran: string) => void };

const MEZHEP_ACIKLAMASI: Record<Mezhep, string> = {
    hanefi: 'Vitir vacip, yolculukta 15 gün',
    safii: 'Vitir sünnet, yolculukta 4 gün',
};

export const NamazVakitleriSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation() as unknown as Navigasyon;
    const konum = useAppSelector((s) => s.konum);
    const takvimAktif = useAppSelector((s) => s.takvim?.ayarlar?.aktif === true);
    const { durum: seferilik, mezhepAyarla } = useSeferilik();
    const konumYenile = useKonumYenile();
    const dispatch = useAppDispatch();
    const ikon = renkler.birincil;

    // `takvim` dilimi açılışta YÜKLENMEZ (AGENTS.md hidrasyon kuralı) — salt okuma.
    React.useEffect(() => {
        dispatch(takvimAyarlariniYukle());
    }, [dispatch]);

    const mezhep: Mezhep = seferilik?.ayarlar.mezhep ?? 'hanefi';
    const mezhepler = React.useMemo<Secenek<Mezhep>[]>(
        () => MEZHEPLER.map((m) => ({ deger: m, etiket: MEZHEP_ADLARI[m], aciklama: MEZHEP_ACIKLAMASI[m] })),
        []
    );

    const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
                <AyarSatiri
                    varyant="navigasyon"
                    ikon={<FontAwesome5 name="map-marker-alt" size={20} color={ikon} solid />}
                    baslik="Konum"
                    ozet={konumOzeti({
                        konumModu: konum.konumModu,
                        gpsAdres: konum.gpsAdres,
                        seciliIlceAdi: konum.seciliIlceAdi,
                        seciliIlAdi: konum.seciliIlAdi,
                    })}
                    onPress={() => navigation.navigate('KonumAyarlari')}
                    ekEylem={
                        konumYenile.yenilenebilir ? (
                            <KonumYenileButonu onPress={konumYenile.yenile} yenileniyor={konumYenile.yenileniyor} />
                        ) : undefined
                    }
                />
                <View style={ayrac}>
                    <AyarSatiri
                        varyant="navigasyon"
                        ikon={<FontAwesome5 name="route" size={20} color={ikon} solid />}
                        baslik="Yolculuk bilgisi"
                        ozet={(seferilik?.ayarlar.kartAcik ?? true) ? 'Bilgi kartı açık' : 'Kapalı'}
                        onPress={() => navigation.navigate('SeferilikAyarlari')}
                    />
                </View>
                <View style={ayrac}>
                    <AyarSatiri
                        varyant="navigasyon"
                        ikon={<FontAwesome5 name="calendar-alt" size={20} color={ikon} solid />}
                        baslik="Vakitleri takvime ekleyin"
                        ozet={takvimOzeti(takvimAktif)}
                        onPress={() => navigation.navigate('TakvimAyarlari')}
                    />
                </View>
            </View>

            <View style={{ marginHorizontal: 16, marginTop: 24 }} testID="mezhep-secimi">
                <BolumBasligi metin="Mezhep" />
                <SecenekListesi
                    secenekler={mezhepler}
                    secili={mezhep}
                    onSec={mezhepAyarla}
                    erisimEtiketi="Mezhep"
                />
                <NotSatiri
                    metin="Yolculuk kartını ve kazada vitri belirler; vakitleri değiştirmez."
                    style={{ marginTop: 10 }}
                />
            </View>
        </ScrollView>
    );
};

export default NamazVakitleriSayfasi;
