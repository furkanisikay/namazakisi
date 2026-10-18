/**
 * Saat (Wear OS) ayarları (saat W3) — saatle telefonun İŞ BÖLÜMÜ.
 *
 * Yalnız Android'de listelenir (Wear OS saati yalnız Android telefonla eşleşir).
 * Başlık navigasyon header'ındadır (AGENTS "başlık tek yerde"); gövdede yalnız özet.
 * Ayar cihaza özgüdür, yedeklemeye girmez. Değişiklik planları hemen yeniden kurar.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { AyarGrubu } from './Ayarlar/AyarGrubu';
import { useSaatAyarlari } from '../hooks/useSaatAyarlari';
import { SAAT_YEDEK_GECIKMESI_DK, type AnonsYeri, type UyandirmaYeri } from '../../core/saat/saatAyarlari';

type AyarNavigasyonu = { navigate: (ekran: string) => void };

interface Secenek<T extends string> {
    deger: T;
    ikon: string;
    baslik: string;
    aciklama: string;
}

const UYANDIRMA_SECENEKLERI: Secenek<UyandirmaYeri>[] = [
    {
        deger: 'telefon',
        ikon: 'mobile-alt',
        baslik: 'Telefonda',
        aciklama: 'Sabah alarmı ve teheccüd uyandırması telefonunuzda çalar.',
    },
    {
        deger: 'saat',
        ikon: 'clock',
        baslik: 'Saatte, sessizce',
        aciklama: `Yalnız bileğiniz titrer, yanınızda uyuyan uyanmaz. Saatte kapatmazsanız telefonunuz ${SAAT_YEDEK_GECIKMESI_DK} dakika sonra yedek olarak çalar. Saatinizde Namaz Akışı yoksa ya da güncel değilse telefonunuz her sabah ${SAAT_YEDEK_GECIKMESI_DK} dakika geç çalar.`,
    },
    {
        deger: 'ikisi',
        ikon: 'clone',
        baslik: 'İkisinde birden',
        aciklama: 'Saat ve telefon aynı anda çalar; saatte kapatmanız telefonu da susturur.',
    },
];

const ANONS_SECENEKLERI: Secenek<AnonsYeri>[] = [
    {
        deger: 'otomatik',
        ikon: 'exchange-alt',
        baslik: 'Telefonda, uzaktaysa saatte',
        aciklama: 'Telefonunuz yanınızda değilken sesli anonsu saatiniz okur.',
    },
    {
        deger: 'saat',
        ikon: 'clock',
        baslik: 'Yalnız saatte',
        aciklama:
            'Anonsu her zaman saatiniz okur, telefonunuz konuşmaz. Saatiniz şarjdayken, telefonunuzla bağlantısı yokken ya da saatte Namaz Akışı yoksa anons hiç duyulmaz; bunu istemiyorsanız ilk seçeneği kullanın.',
    },
    {
        deger: 'telefon',
        ikon: 'mobile-alt',
        baslik: 'Yalnız telefonda',
        aciklama: 'Saatiniz hiç konuşmaz.',
    },
];

export const SaatAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;
    const { ayarlar, guncelle } = useSaatAyarlari();
    if (!ayarlar) return null;

    const secenekSatiri = <T extends string>(s: Secenek<T>, secili: boolean, onSec: () => void) => (
        <TouchableOpacity
            key={s.deger}
            onPress={onSec}
            accessibilityRole="radio"
            accessibilityState={{ selected: secili, checked: secili }}
            accessibilityLabel={`${s.baslik}. ${s.aciklama}`}
            className="flex-row items-center px-4 py-3"
            style={{ minHeight: 56 }}
        >
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: renkler.birincil + '20' }}
            >
                <FontAwesome5 name={s.ikon} size={15} color={renkler.birincil} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                    {s.baslik}
                </Text>
                <Text className="text-xs mt-0.5 leading-4" style={{ color: renkler.metinIkincil }}>
                    {s.aciklama}
                </Text>
            </View>
            <FontAwesome5
                name={secili ? 'dot-circle' : 'circle'}
                size={20}
                color={secili ? renkler.birincil : renkler.metinIkincil}
                style={{ marginLeft: 8 }}
            />
        </TouchableOpacity>
    );

    const gecisDugmesi = (etiket: string, ekran: string, ikon: string) => (
        <TouchableOpacity
            onPress={() => navigation?.navigate(ekran)}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            className="flex-row items-center justify-center rounded-xl border mx-4 mt-2"
            style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
        >
            <FontAwesome5 name={ikon} size={13} color={renkler.metin} style={{ marginRight: 6 }} />
            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                {etiket}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
                <Text className="text-sm leading-5 mx-4 mb-4" style={{ color: renkler.metinIkincil }}>
                    Saatinizde Namaz Akışı yüklüyse telefonunuzla işleri bölüşür. Burada uyandırmanın ve sesli
                    anonsun nerede duyulacağını seçersiniz.
                </Text>

                <AyarGrubu baslik="Uyandırma nerede çalsın?">
                    {UYANDIRMA_SECENEKLERI.map((s) =>
                        secenekSatiri(s, ayarlar.uyandirmaYeri === s.deger, () => {
                            void guncelle({ uyandirmaYeri: s.deger });
                        })
                    )}
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                    Uyandırma, Namaz Muhafızı'nda sabah vaktine açtığınız gerçek alarm ve Nafile Namazlar'da açtığınız
                    teheccüd uyandırmasıdır. Saatiniz şarjdayken çalmaz; o zaman telefonunuz çalar.
                </Text>
                {gecisDugmesi('Namaz Muhafızı ayarlarını açın', 'MuhafizAyarlari', 'shield-alt')}
                {gecisDugmesi('Nafile namaz ayarlarını açın', 'NafileAyarlari', 'star-and-crescent')}

                <View className="h-6" />
                <AyarGrubu baslik="Sesli anons nerede okunsun?">
                    {ANONS_SECENEKLERI.map((s) =>
                        secenekSatiri(s, ayarlar.anonsYeri === s.deger, () => {
                            void guncelle({ anonsYeri: s.deger });
                        })
                    )}
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-6" style={{ color: renkler.metinIkincil }}>
                    Yalnız sesli anonsu açık hatırlatmalar okunur. İki cihaz aynı cümleyi birlikte okumaz. Camideyken ya
                    da Namaz modu açıkken saatiniz de konuşmaz. Saatinizde hoparlör ya da Türkçe ses yoksa saat yalnız
                    titreşir.
                </Text>

                <AyarGrubu baslik="Bilekten yapabilecekleriniz">
                    <View className="px-4 py-3">
                        {[
                            'Namaz modunu saatteki düğmeyle açıp kapatabilirsiniz (vaktin sonuna, en fazla 30 dakika).',
                            'Camideyken saatiniz durumu gösterir; "Burası cami değil" ve "Camide misiniz?" sorusunu bilekten cevaplarsınız.',
                            'Saate sığmayan ekranları (Kaza Defteri, Camideyim, ayarlar) "Telefonda açın" ile telefonunuzda açarsınız.',
                        ].map((m) => (
                            <View key={m} className="flex-row mb-2">
                                <FontAwesome5 name="check" size={11} color={renkler.birincil} style={{ marginTop: 4, marginRight: 8 }} />
                                <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>
                                    {m}
                                </Text>
                            </View>
                        ))}
                    </View>
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                    Namaz modunu saatten açabilmek için önce telefonunuzda bir kez açmanız gerekir.
                </Text>
                {gecisDugmesi('Namaz modu ayarlarını açın', 'NamazModuAyarlari', 'moon')}
            </ScrollView>
        </SafeAreaView>
    );
};
