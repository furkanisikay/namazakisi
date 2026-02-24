/**
 * Paylasilabilir Kutlama Karti
 * Kutlama tiplerine gore ozellestirilmis, sosyal medyada paylasima hazir goruntusel kart.
 * PaylasimModal ile birlikte kullanilir.
 */

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { KutlamaBilgisi, KutlamaTipi } from '../../../core/types/SeriTipleri';

interface PaylasilabilirKutlamaProps {
    kutlama: KutlamaBilgisi;
}

const { width } = Dimensions.get('window');
const KART_GENISLIGI = width * 0.85;

/**
 * Kutlama tipine gore gradient renk seti
 */
const gradientAl = (tip: KutlamaTipi): readonly [string, string, ...string[]] => {
    switch (tip) {
        case 'rozet_kazanildi':
            return ['#1a1a1a', '#2d3748'];
        case 'hedef_tamamlandi':
            return ['#1b5e20', '#2e7d32'];
        case 'seviye_atlandi':
            return ['#0d47a1', '#1565c0'];
        case 'toparlanma_tamamlandi':
            return ['#4a148c', '#6a1b9a'];
        case 'en_uzun_seri':
            return ['#bf360c', '#e64a19'];
        default:
            return ['#1a1a2e', '#16213e'];
    }
};

/**
 * Kutlama tipine gore ust etiket metni
 */
const etiketMetniAl = (tip: KutlamaTipi): string => {
    switch (tip) {
        case 'rozet_kazanildi':
            return 'YENİ ROZET KAZANDIM!';
        case 'hedef_tamamlandi':
            return 'HEDEFE ULASTIM!';
        case 'seviye_atlandi':
            return 'SEVIYE ATLADI!';
        case 'toparlanma_tamamlandi':
            return 'TOPARLANDIM!';
        case 'en_uzun_seri':
            return 'YENİ REKOR!';
        default:
            return 'BASARI!';
    }
};

/**
 * Kutlama tipine gore FontAwesome5 ikon adi
 */
const ikonAdAl = (tip: KutlamaTipi): string => {
    switch (tip) {
        case 'rozet_kazanildi':
            return 'medal';
        case 'hedef_tamamlandi':
            return 'bullseye';
        case 'seviye_atlandi':
            return 'level-up-alt';
        case 'toparlanma_tamamlandi':
            return 'redo-alt';
        case 'en_uzun_seri':
            return 'trophy';
        default:
            return 'star';
    }
};

/**
 * Motivasyon mesaj listesi
 */
const MOTIVASYON_MESAJLARI: Record<KutlamaTipi, string[]> = {
    rozet_kazanildi: [
        'Azimle devam ediyorum, bu rozet benim! 💪',
        'Sabahın bereketini yakaladım! 🌅',
        'Ruhuma iyi gelen bu akışta ben de varım! ✨',
    ],
    hedef_tamamlandi: [
        'Küçük adımlar, büyük huzur getirir. 🍃',
        'Bugün kendim için harika bir adım attım! 🌟',
        'Azimle yürüyünce hedefe varılır. 🎯',
    ],
    seviye_atlandi: [
        'Her gün biraz daha olgunlaşıyorum. ⭐',
        'Ruhumu geliştirmenin tadını çıkarıyorum. 💫',
        'Yolculuk devam ediyor, daha da yukarıya! 🚀',
    ],
    toparlanma_tamamlandi: [
        'Düşmek değil, kalkmak önemlidir. 🔄',
        'Toparlandım ve daha güçlüyüm! 💪',
        'Sabır ve azimle her zorluk aşılır. 🌱',
    ],
    en_uzun_seri: [
        'Her gün küçük bir adım, ruhumda büyük bir huzur. 🔥',
        'Zincirim kırılmadı, azmim artıyor! 🏆',
        'Bu rekoru kendime adadım. 💎',
    ],
};

/**
 * Kutlama tipine gore deterministik motivasyon mesaji
 */
const motivasyonMesajiAl = (kutlama: KutlamaBilgisi): string => {
    const mesajlar = MOTIVASYON_MESAJLARI[kutlama.tip] ?? MOTIVASYON_MESAJLARI['hedef_tamamlandi'];
    const anahtar = `${kutlama.tip}-${kutlama.baslik}`;
    let hash = 0;
    for (let i = 0; i < anahtar.length; i++) {
        hash = (hash * 31 + anahtar.charCodeAt(i)) >>> 0;
    }
    return mesajlar[hash % mesajlar.length];
};

/**
 * Paylasilabilir Kutlama Karti
 * Tum kutlama tiplerini destekler; sosyal medyaya ozel story format tasarimi.
 */
export const PaylasilabilirKutlama: React.FC<PaylasilabilirKutlamaProps> = ({ kutlama }) => {
    const gradientRenkleri = gradientAl(kutlama.tip);
    const [anaRenk] = gradientRenkleri;
    const etiket = etiketMetniAl(kutlama.tip);
    const ikonAdi = ikonAdAl(kutlama.tip);
    const motivasyon = motivasyonMesajiAl(kutlama);
    const birincilRenkAcik = `${anaRenk}80`;

    return (
        <LinearGradient
            colors={gradientRenkleri}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                width: KART_GENISLIGI,
                height: KART_GENISLIGI * 1.5,
                borderRadius: 24,
                padding: 28,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {/* Arka plan dekor daireleri */}
            <View
                style={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    bottom: -40,
                    left: -40,
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                }}
            />

            {/* Ust etiket */}
            <View
                style={{
                    position: 'absolute',
                    top: 28,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)',
                }}
            >
                <FontAwesome5
                    name={ikonAdi}
                    size={11}
                    color="rgba(255,255,255,0.9)"
                    style={{ marginRight: 6 }}
                />
                <Text
                    style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 10,
                        fontWeight: 'bold',
                        letterSpacing: 1.2,
                    }}
                >
                    {etiket}
                </Text>
            </View>

            {/* Orta alan */}
            <View style={{ alignItems: 'center', width: '100%', paddingHorizontal: 16 }}>
                {/* Ikon parlama + arka plan */}
                <View style={{ marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                    {/* Dis parlama */}
                    <View
                        style={{
                            position: 'absolute',
                            width: 160,
                            height: 160,
                            borderRadius: 80,
                            backgroundColor: birincilRenkAcik,
                            opacity: 0.2,
                            transform: [{ scale: 1.3 }],
                        }}
                    />
                    {/* Ikon kutusu */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']}
                        style={{
                            width: 110,
                            height: 110,
                            borderRadius: 55,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: 'rgba(255,255,255,0.3)',
                        }}
                    >
                        {kutlama.tip === 'en_uzun_seri' ? (
                            <MaterialIcons name="local-fire-department" size={56} color="white" />
                        ) : (
                            <Text style={{ fontSize: 52 }}>{kutlama.ikon}</Text>
                        )}
                    </LinearGradient>
                </View>

                {/* Baslik */}
                <Text
                    style={{
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 8,
                        letterSpacing: 0.3,
                    }}
                >
                    {kutlama.baslik}
                </Text>

                {/* Mesaj */}
                <Text
                    style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: 13,
                        textAlign: 'center',
                        marginBottom: 20,
                        lineHeight: 20,
                        paddingHorizontal: 8,
                    }}
                >
                    {kutlama.mesaj}
                </Text>

                {/* Motivasyon kutusu */}
                <View
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.12)',
                        width: '100%',
                    }}
                >
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            textAlign: 'center',
                            fontSize: 13,
                            fontStyle: 'italic',
                            lineHeight: 20,
                        }}
                    >
                        "{motivasyon}"
                    </Text>
                </View>
            </View>

            {/* Alt logo */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: 0.85,
                }}
            >
                <FontAwesome5 name="mosque" size={14} color="white" style={{ marginRight: 7 }} />
                <Text
                    style={{
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        fontSize: 11,
                    }}
                >
                    Namaz Akısı
                </Text>
            </View>
        </LinearGradient>
    );
};
