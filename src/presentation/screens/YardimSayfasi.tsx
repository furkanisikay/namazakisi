/**
 * Yardım (sade tasarım, Dalga 3) — sorun bildirme, yenilikler, hakkında ve kurulumu
 * yeniden başlatma tek yerde. "Kurulumu yeniden başlat" eskiden "Seri ve hedefler"in
 * "Tehlikeli bölge"sindeydi; verileri silmediği için tehlikeli değildir, yardımdır.
 * Tanı kayıtları (geliştirici günlüğü) Tanı sayfasının içinde kalır.
 */
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRenkler } from '../../core/theme';
import { useAppSelector } from '../store/hooks';
import { useYeniOzellikler } from '../hooks/useYeniOzellikler';
import { DEPOLAMA_ANAHTARLARI, UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { hakkindaOzeti } from '../../core/ayarlar/ozetler';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { BildirimModali } from '../components/common/BildirimModali';
import { useMetin } from '../hooks/useMetin';

type Navigasyon = {
    navigate: (ekran: string) => void;
    dispatch: (eylem: ReturnType<typeof CommonActions.reset>) => void;
};

export const YardimSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const s = useMetin();
    const m = s.genel.yardim;
    const navigation = useNavigation() as unknown as Navigasyon;
    const { okunmamisVarMi } = useYeniOzellikler();
    const guncellemeMevcut = useAppSelector((s) => s.guncelleme?.guncellemeMevcut === true);
    const [kurulumOnayi, setKurulumOnayi] = useState(false);
    const ikon = renkler.birincil;
    const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

    const kurulumuBaslat = async () => {
        setKurulumOnayi(false);
        await AsyncStorage.removeItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'KurulumSihirbazi' }] }));
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
                <AyarSatiri
                    varyant="navigasyon"
                    ikon={<FontAwesome5 name="comment-dots" size={20} color={ikon} solid />}
                    baslik={m.sorunBildirin}
                    ozet={m.sorunBildirinOzet}
                    onPress={() => navigation.navigate('TaniGeriBildirim')}
                />
                <View style={ayrac}>
                    <AyarSatiri
                        varyant="navigasyon"
                        ikon={<FontAwesome5 name="gift" size={20} color={ikon} solid />}
                        baslik={m.nelerYeni}
                        ozet={m.nelerYeniOzet}
                        yeniRozetGoster={okunmamisVarMi}
                        onPress={() => navigation.navigate('NelerYeni')}
                    />
                </View>
                <View style={ayrac}>
                    <AyarSatiri
                        varyant="navigasyon"
                        ikon={<FontAwesome5 name="info-circle" size={20} color={ikon} solid />}
                        baslik={s.genel.ekranlar.Hakkinda}
                        ozet={hakkindaOzeti(UYGULAMA.VERSIYON, guncellemeMevcut)}
                        onPress={() => navigation.navigate('Hakkinda')}
                    />
                </View>
            </View>

            <View style={{ marginTop: 24, borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
                <AyarSatiri
                    varyant="navigasyon"
                    ikon={<FontAwesome5 name="redo-alt" size={20} color={ikon} solid />}
                    baslik={m.kurulum}
                    ozet={m.kurulumOzet}
                    onPress={() => setKurulumOnayi(true)}
                />
            </View>

            <BildirimModali
                gorunur={kurulumOnayi}
                tip="bilgi"
                baslik={m.kurulumSoru}
                mesaj={m.kurulumMesaj}
                birincilEtiket={m.kurulumuAcin}
                birincilIkon="redo-alt"
                kapatEtiketi={s.genel.ortak.vazgec}
                onBirincil={() => void kurulumuBaslat()}
                onKapat={() => setKurulumOnayi(false)}
            />
        </ScrollView>
    );
};

export default YardimSayfasi;
