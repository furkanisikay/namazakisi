/**
 * Namaz modu ayar sayfası (issue #277).
 *
 * Telefonun kendi Modlar özelliğine bağlanır: telefonun namazda NE yapacağını
 * kullanıcı sistem ekranında seçer, burası yalnız NE ZAMAN açılacağını söyler.
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde).
 * Yalnız Android (köprü yoksa açıklayıcı boş durum).
 */
import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRenkler } from '../../core/theme';
import { SayisalSecici } from '../components/common/SayisalSecici';
import { AyarKutusu } from '../components/ayar/AyarKutusu';
import { NamazModuRehberModal } from '../components/namazModu/NamazModuRehberi';
import { useNamazModu } from '../hooks/useNamazModu';
import {
    CUMA_HUTBE_SURESI_DK,
    VAKIT_SURE_ADIM_DK,
    VAKIT_SURE_MAX_DK,
    VAKIT_SURE_MIN_DK,
} from '../../core/namazModu/namazModuPlani';
import type { AyarlarStackParamList } from '../../navigation/ayarlarEkranlari';

export const NamazModuAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation<NativeStackNavigationProp<AyarlarStackParamList>>();
    const m = useNamazModu();
    const { ayarlar, durum } = m;
    const eskiSurum = durum?.destek === 'filtre';
    const erisimYok = ayarlar.etkin && durum != null && !durum.erisim;

    const bolum = (metin: string) => (
        <Text className="text-xs font-bold tracking-wider mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );

    if (!m.kullanilabilir) {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="moon" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    Namaz modu yalnız Android telefonlarda kullanılabilir.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                Telefonunuzun kendi Modlar özelliğiyle çalışır. Hatırlatmalarınız iptal edilmez; modda nasıl görüneceklerini
                telefonunuzun ayarlarında siz seçersiniz.
            </Text>

            <View className="p-3 overflow-hidden" style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24 }}>
                <AyarKutusu
                    testID="namaz-modu-ana"
                    ikon="moon"
                    baslik="Namaz modunu kullanın"
                    aciklama={
                        eskiSurum
                            ? 'Namaz vaktinde telefonunuzun Rahatsız Etmeyin modu açılır'
                            : 'Ayarlar → Modlar listesine "Namaz" eklenir; ne yapacağını orada siz seçersiniz'
                    }
                    deger={ayarlar.etkin}
                    onDegis={(v) => m.guncelle({ etkin: v })}
                />

                {erisimYok && (
                    <TouchableOpacity
                        testID="namaz-modu-erisim-uyarisi"
                        className="flex-row items-center p-3.5 rounded-2xl mb-2"
                        style={{ backgroundColor: `${renkler.durum.uyari}20`, minHeight: 56 }}
                        onPress={m.rehberiAc}
                        accessibilityRole="button"
                        accessibilityLabel="Rahatsız Etmeyin erişimi verilmedi. Rehberi açın"
                    >
                        <FontAwesome5 name="exclamation-circle" size={16} color={renkler.metin} style={{ marginRight: 10 }} />
                        <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                            Rahatsız Etmeyin erişimi verilmediği için mod açılamıyor. Erişimi vermek için dokunun.
                        </Text>
                        <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                )}

                {ayarlar.etkin && (
                    <>
                        {bolum('NE ZAMAN AÇILSIN')}
                        <AyarKutusu
                            ikon="mosque"
                            baslik="Cuma hutbesi"
                            aciklama={`Cuma öğle girişinden ${CUMA_HUTBE_SURESI_DK} dk sonrasına kadar`}
                            deger={ayarlar.cuma}
                            onDegis={(v) => m.guncelle({ cuma: v })}
                        />
                        <AyarKutusu
                            ikon="clock"
                            baslik="Her vakit girince"
                            aciklama={`${ayarlar.vakitSureDk} dk boyunca · beş vakit`}
                            deger={ayarlar.vakit}
                            onDegis={(v) => m.guncelle({ vakit: v })}
                        />
                        {ayarlar.vakit && (
                            <AyarKutusu
                                ikon="hourglass-half"
                                baslik="Süre"
                                sag={
                                    <SayisalSecici
                                        deger={ayarlar.vakitSureDk}
                                        min={VAKIT_SURE_MIN_DK}
                                        max={VAKIT_SURE_MAX_DK}
                                        adim={VAKIT_SURE_ADIM_DK}
                                        birim="dk"
                                        onChange={(v) => m.guncelle({ vakitSureDk: v })}
                                        renk={renkler.birincil}
                                        aciklama="Mod süresi"
                                    />
                                }
                            />
                        )}
                        <TouchableOpacity
                            className="flex-row items-center p-3.5 rounded-2xl border mb-2"
                            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 56 }}
                            onPress={() => navigation.navigate('CamideyimAyarlari')}
                            accessibilityRole="button"
                            accessibilityLabel="Camiye girince: Camideyim ayarlarını açın"
                        >
                            <View
                                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${renkler.birincil}20` }}
                            >
                                <FontAwesome5 name="map-marker-alt" size={14} color={renkler.birincil} solid />
                            </View>
                            <View className="flex-1 pr-2">
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Camiye girince
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    Camideyim ayarlarından açılır
                                </Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
                        </TouchableOpacity>
                        <AyarKutusu
                            ikon="check-circle"
                            baslik={'"Kıldım" deyince kapansın'}
                            aciklama="Namazı işaretlediğiniz an mod biter"
                            deger={ayarlar.kildimKapat}
                            onDegis={(v) => m.guncelle({ kildimKapat: v })}
                        />

                        {!eskiSurum && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-2xl mt-2"
                                style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 48 }}
                                onPress={m.modAyarlariniAc}
                                accessibilityRole="button"
                                accessibilityLabel="Modun ayarlarını açın"
                            >
                                <FontAwesome5 name="external-link-alt" size={12} color={renkler.metin} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    Modun ayarlarını açın
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            <View className="flex-row items-start mt-4 px-1">
                <FontAwesome5 name="info-circle" size={12} color={renkler.metinIkincil} style={{ marginTop: 2, marginRight: 6 }} />
                <Text className="text-xs flex-1" style={{ color: renkler.metinIkincil }}>
                    Modu elle kapatırsanız o vakit için yeniden açılmaz. Uygulamayı kaldırırsanız mod da telefonunuzdan silinir.
                </Text>
            </View>

            <NamazModuRehberModal gorunur={m.rehberGorunur} onAc={m.erisimAyariniAc} onKapat={m.rehberiKapat} />
        </ScrollView>
    );
};

export default NamazModuAyarlariSayfasi;
