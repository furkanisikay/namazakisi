/**
 * Saat ayarları (saat W3) — saatle telefonun İŞ BÖLÜMÜ.
 *
 * Android'de Wear OS saati için; iOS'ta Apple Watch uygulamasını taşıyan build'de
 * (#285 cilası). Apple Watch konuşmaz → iOS'ta yalnız uyandırma seçimi vardır, ve
 * watchOS'un sınırı (sessiz alarm yalnız saat uygulaması açıkken kurulabilir) söylenir.
 * Başlık navigasyon header'ındadır (AGENTS "başlık tek yerde"); gövdede yalnız özet.
 * Ayar cihaza özgüdür, yedeklemeye girmez. Değişiklik planları hemen yeniden kurar.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { AyarGrubu } from './Ayarlar/AyarGrubu';
import { useSaatAyarlari } from '../hooks/useSaatAyarlari';
import { SAAT_YEDEK_GECIKMESI_DK, type AnonsYeri, type UyandirmaYeri } from '../../core/saat/saatAyarlari';
import { bicim } from '../../core/dil/aktifDil';
import type { Sozluk } from '../../core/dil/sozluk/tr';
import { useMetin } from '../hooks/useMetin';

type AyarNavigasyonu = { navigate: (ekran: string) => void };

interface Secenek<T extends string> {
    deger: T;
    ikon: string;
    baslik: string;
    aciklama: string;
}

type SaatMetinleri = Sozluk['saat'];

function uyandirmaSecenekleri(m: SaatMetinleri, ios: boolean): Secenek<UyandirmaYeri>[] {
    const dk = SAAT_YEDEK_GECIKMESI_DK;
    return [
        { deger: 'telefon', ikon: 'mobile-alt', baslik: m.uyandirma.telefonBaslik, aciklama: m.uyandirma.telefonAciklama },
        {
            deger: 'saat',
            ikon: 'clock',
            baslik: m.uyandirma.saatBaslik,
            // Apple Watch metni: watchOS'ta sessiz alarm yalnız saat uygulaması açıkken kurulabilir.
            aciklama: bicim(ios ? m.uyandirma.saatAciklamaIos : m.uyandirma.saatAciklama, { dk }),
        },
        {
            deger: 'ikisi',
            ikon: 'clone',
            baslik: m.uyandirma.ikisiBaslik,
            aciklama: ios ? m.uyandirma.ikisiAciklamaIos : m.uyandirma.ikisiAciklama,
        },
    ];
}

function anonsSecenekleri(m: SaatMetinleri): Secenek<AnonsYeri>[] {
    return [
        { deger: 'otomatik', ikon: 'exchange-alt', baslik: m.anons.otomatikBaslik, aciklama: m.anons.otomatikAciklama },
        { deger: 'saat', ikon: 'clock', baslik: m.anons.saatBaslik, aciklama: m.anons.saatAciklama },
        { deger: 'telefon', ikon: 'mobile-alt', baslik: m.anons.telefonBaslik, aciklama: m.anons.telefonAciklama },
    ];
}

export const SaatAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const navigation = useNavigation() as unknown as AyarNavigasyonu | undefined;
    const metinler = useMetin().saat;
    const m = metinler.ayarlar;
    const { ayarlar, guncelle } = useSaatAyarlari();
    if (!ayarlar) return null;
    const ios = Platform.OS === 'ios';

    const secenekSatiri = <T extends string>(s: Secenek<T>, secili: boolean, onSec: () => void) => (
        <TouchableOpacity
            key={s.deger}
            onPress={onSec}
            accessibilityRole="radio"
            accessibilityState={{ selected: secili, checked: secili }}
            accessibilityLabel={bicim(m.secenekErisim, { baslik: s.baslik, aciklama: s.aciklama })}
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
                    {ios ? m.girisIos : m.giris}
                </Text>

                <AyarGrubu baslik={m.uyandirmaBaslik}>
                    {uyandirmaSecenekleri(metinler, ios).map((s) =>
                        secenekSatiri(s, ayarlar.uyandirmaYeri === s.deger, () => {
                            void guncelle({ uyandirmaYeri: s.deger });
                        })
                    )}
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                    {m.uyandirmaNotu}{' '}
                    {ios ? m.uyandirmaNotuIos : m.uyandirmaNotuAndroid}
                </Text>
                {gecisDugmesi(m.muhafizAyarlari, 'MuhafizAyarlari', 'shield-alt')}
                {gecisDugmesi(m.nafileAyarlari, 'NafileAyarlari', 'star-and-crescent')}

                {ios ? (
                    <>
                        <View className="h-6" />
                        <AyarGrubu baslik={m.bilektenBaslik}>
                            <View className="px-4 py-3">
                                {m.bilektenIos.map((madde) => (
                                    <View key={madde} className="flex-row mb-2">
                                        <FontAwesome5 name="check" size={11} color={renkler.birincil} style={{ marginTop: 4, marginRight: 8 }} />
                                        <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>
                                            {madde}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </AyarGrubu>
                    </>
                ) : (
                    <>
                <View className="h-6" />
                <AyarGrubu baslik={m.anonsBaslik}>
                    {anonsSecenekleri(metinler).map((s) =>
                        secenekSatiri(s, ayarlar.anonsYeri === s.deger, () => {
                            void guncelle({ anonsYeri: s.deger });
                        })
                    )}
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-6" style={{ color: renkler.metinIkincil }}>
                    {m.anonsNotu}
                </Text>

                <AyarGrubu baslik={m.bilektenBaslik}>
                    <View className="px-4 py-3">
                        {m.bilekten.map((madde) => (
                            <View key={madde} className="flex-row mb-2">
                                <FontAwesome5 name="check" size={11} color={renkler.birincil} style={{ marginTop: 4, marginRight: 8 }} />
                                <Text className="flex-1 text-sm leading-5" style={{ color: renkler.metin }}>
                                    {madde}
                                </Text>
                            </View>
                        ))}
                    </View>
                </AyarGrubu>
                <Text className="text-xs leading-5 mx-4 -mt-4 mb-2" style={{ color: renkler.metinIkincil }}>
                    {m.namazModuNotu}
                </Text>
                {gecisDugmesi(m.namazModuAyarlari, 'NamazModuAyarlari', 'moon')}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
