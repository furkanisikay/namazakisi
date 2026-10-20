/**
 * Saat ve widget (sade tasarım, Dalga 3) — telefonun DIŞINDAKİ yüzeyler tek yerde:
 * akıllı saat, canlı sayaçlar (Now Bar / Dinamik Ada), vakit sayacı, bileklik rehberi.
 * Otomasyon ve "Kıldım işaretleyebilen uygulamalar" ileri kullanıcı içindir → "Gelişmiş"
 * katında (kapalı başlar).
 *
 * Eskiden bunların evi yoktu: vakit sayacı ve bileklik rehberi Bildirimler'in dibindeydi,
 * otomasyon "Uygulama" grubundaydı. Hiçbir ayarın verisi/yazma yolu değişmedi.
 *
 * Ölçebildiğini sorma: bu telefonda olmayan yüzey soluk "bu telefonda yok" satırıdır
 * (vakit sayacı iOS'ta) ya da hiç çizilmez (Wear OS saat yalnız Android).
 */
import * as React from 'react';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { useNowBarOzeti } from '../hooks/useNowBarOzeti';
import { KildimGuvenServisi } from '../../domain/services/KildimGuvenServisi';
import { AyarSatiri } from './Ayarlar/AyarSatiri';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { VakitSayaciBolumu } from '../components/hatirlatmalar/VakitSayaciBolumu';
import { BileklikRehberKarti } from '../components/bildirim/BileklikRehberKarti';

type Navigasyon = { navigate: (ekran: string) => void };

export const SaatVeWidgetSayfasi: React.FC = () => (
    <VurguSaglayici>
        <SaatVeWidgetIcerik />
    </VurguSaglayici>
);

const SaatVeWidgetIcerik: React.FC = () => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    const navigation = useNavigation() as unknown as Navigasyon;
    const nowBar = useNowBarOzeti();
    const kildimGuvenVar = KildimGuvenServisi.kullanilabilirMi();
    const [gelismis, setGelismis] = useState(false);
    const ikon = renkler.birincil;
    const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

    const satirlar: React.ReactNode[] = [];
    if (Platform.OS === 'android') {
        satirlar.push(
            <AyarSatiri
                key="saat"
                varyant="navigasyon"
                ikon={<FontAwesome5 name="clock" size={20} color={ikon} />}
                baslik="Akıllı saat"
                ozet="Uyandırma ve sesli okuma nerede"
                onPress={() => navigation.navigate('SaatAyarlari')}
            />
        );
    }
    if (nowBar.kullanilabilir) {
        satirlar.push(
            <AyarSatiri
                key="canli"
                varyant="navigasyon"
                ikon={<FontAwesome5 name="stopwatch" size={20} color={ikon} solid />}
                baslik={Platform.OS === 'ios' ? 'Canlı etkinlikler' : 'Canlı sayaçlar'}
                ozet={nowBar.ozet ?? ''}
                onPress={() => navigation.navigate('NowBarAyarlari')}
            />
        );
    }

    return (
        <ScrollView
            ref={scrollRef}
            style={{ flex: 1, backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            {satirlar.length > 0 ? (
                <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan, marginBottom: 24 }}>
                    {satirlar.map((s, i) => (
                        <View key={i} style={i > 0 ? ayrac : undefined}>
                            {s}
                        </View>
                    ))}
                </View>
            ) : null}

            <AyarCapasi id="vakitSayaci">
                <BolumBasligi metin="Geri sayım" />
                <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                    <VakitSayaciBolumu />
                </View>
            </AyarCapasi>

            <View style={{ marginTop: 24 }}>
                <BileklikRehberKarti />
            </View>

            {kildimGuvenVar ? (
                <View style={{ marginTop: 8 }}>
                    <TouchableOpacity
                        testID="saat-gelismis"
                        onPress={() => setGelismis((g) => !g)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: gelismis }}
                        accessibilityLabel="Gelişmiş. Otomasyonlar ve Kıldım işaretleyen uygulamalar"
                        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}
                    >
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: renkler.metin }}>Gelişmiş</Text>
                        <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginRight: 8 }}>Otomasyonlar</Text>
                        <FontAwesome5 name={gelismis ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                    {gelismis ? (
                        <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
                            <AyarSatiri
                                varyant="navigasyon"
                                ikon={<FontAwesome5 name="magic" size={20} color={ikon} solid />}
                                baslik="Otomasyonlarla kullanın"
                                ozet="Samsung Rutinler, Tasker, MacroDroid"
                                onPress={() => navigation.navigate('OtomasyonRehberi')}
                            />
                            <View style={ayrac}>
                                <AyarSatiri
                                    varyant="navigasyon"
                                    ikon={<FontAwesome5 name="check-double" size={20} color={ikon} solid />}
                                    baslik="Kıldım işaretleyen uygulamalar"
                                    ozet="İzin verdiğiniz uygulamalar"
                                    onPress={() => navigation.navigate('KildimUygulamalari')}
                                />
                            </View>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </ScrollView>
    );
};

export default SaatVeWidgetSayfasi;
