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
import { saatUygulamasiDestekli } from '../../../modules/expo-siri-kisayollari/src';
import { useMetin } from '../hooks/useMetin';

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
    const m = useMetin().saat.sayfa;
    const ikon = renkler.birincil;
    const ayrac = { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir };

    const satirlar: React.ReactNode[] = [];
    // Apple Watch (#285 cilası): yalnız saat uygulamasını taşıyan build'de; orada saat
    // konuşmadığı için yalnız uyandırma seçimi vardır.
    const appleWatch = Platform.OS === 'ios' && saatUygulamasiDestekli();
    if (Platform.OS === 'android' || appleWatch) {
        satirlar.push(
            <AyarSatiri
                key="saat"
                varyant="navigasyon"
                ikon={<FontAwesome5 name="clock" size={20} color={ikon} />}
                baslik={appleWatch ? 'Apple Watch' : m.akilliSaat}
                ozet={appleWatch ? m.appleWatchOzet : m.saatOzet}
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
                baslik={Platform.OS === 'ios' ? m.canliEtkinlikler : m.canliSayaclar}
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
                <BolumBasligi metin={m.geriSayim} />
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
                        accessibilityLabel={m.gelismisErisim}
                        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}
                    >
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: renkler.metin }}>{m.gelismis}</Text>
                        <Text style={{ fontSize: 14, color: renkler.metinIkincil, marginRight: 8 }}>{m.otomasyonlar}</Text>
                        <FontAwesome5 name={gelismis ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
                    </TouchableOpacity>
                    {gelismis ? (
                        <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: renkler.kartArkaplan }}>
                            <AyarSatiri
                                varyant="navigasyon"
                                ikon={<FontAwesome5 name="magic" size={20} color={ikon} solid />}
                                baslik={m.otomasyonBaslik}
                                ozet={m.otomasyonOzet}
                                onPress={() => navigation.navigate('OtomasyonRehberi')}
                            />
                            <View style={ayrac}>
                                <AyarSatiri
                                    varyant="navigasyon"
                                    ikon={<FontAwesome5 name="check-double" size={20} color={ikon} solid />}
                                    baslik={m.kildimBaslik}
                                    ozet={m.kildimOzet}
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
