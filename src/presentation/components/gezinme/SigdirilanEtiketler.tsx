/**
 * Uzun dilde kesilmeyen gezinme metinleri: alt sekme etiketi ve sayfa başlığı.
 *
 * Kütüphanenin kendi etiketi (`@react-navigation/elements` `Label`, `HeaderTitle`) tek satır
 * + üç noktadır ve `adjustsFontSizeToFit` almaz; Tamilce/Malayalamca kare turunda
 * "முன்னேற்…", "ക്രമീകരണ…" ve ayar sayfa başlıkları kesik çıkıyordu. Buradaki metinler tek
 * satırda kalır, sığmazsa yazı küçülür. Türkçe/İngilizce zaten sığdığı için görünüm aynıdır.
 */
import * as React from 'react';
import { Platform, Text, type TextStyle } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/** Alt sekme etiketinin stili (eskiden `tabBarLabelStyle`; fonksiyon etikete uygulanmaz). */
export const SEKME_ETIKETI_STILI = { fontSize: 11, fontWeight: '600', marginTop: 2 } as const satisfies TextStyle;

/** Sekme etiketi ve başlığın inebileceği en küçük ölçek. */
export const EN_KUCUK_OLCEK = 0.7;

export const SekmeEtiketi: React.FC<{ metin: string; renk: string }> = ({ metin, renk }) => (
    <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={EN_KUCUK_OLCEK}
        style={[SEKME_ETIKETI_STILI, { color: renk, textAlign: 'center', alignSelf: 'stretch' }]}
    >
        {metin}
    </Text>
);

type Tanimlar = BottomTabBarProps['descriptors'];

/**
 * Alt çubuğa giden tanımlarda dize `tabBarLabel`'ı küçülebilen etiket bileşeniyle değiştirir.
 *
 * Seçenekler AppNavigator'da DİZE kalır (kenar gezinme ve erişilebilirlik dizeyi okur);
 * yalnız `BottomTabBar`'a verilen kopya değişir. Fonksiyon etikette kütüphane `children`
 * olarak `title`'ı verir (Bugün sekmesinde marka adı), bu yüzden dize kapatılır.
 * Kütüphane iOS'ta erişilebilirlik etiketini yalnız dize etikette kurar; aynısı korunur.
 */
export function sigdirilanSekmeTanimlari(tanimlar: Tanimlar, rotalar: BottomTabBarProps['state']['routes']): Tanimlar {
    const sonuc: Tanimlar = {};
    rotalar.forEach((rota, i) => {
        const tanim = tanimlar[rota.key];
        if (!tanim) return;
        const etiket = tanim.options.tabBarLabel;
        if (typeof etiket !== 'string') {
            sonuc[rota.key] = tanim;
            return;
        }
        sonuc[rota.key] = {
            ...tanim,
            options: {
                ...tanim.options,
                tabBarLabel: ({ color }) => <SekmeEtiketi metin={etiket} renk={color} />,
                tabBarAccessibilityLabel:
                    tanim.options.tabBarAccessibilityLabel ??
                    (Platform.OS === 'ios' ? `${etiket}, tab, ${i + 1} of ${rotalar.length}` : undefined),
            },
        };
    });
    return sonuc;
}

/**
 * Yığın başlığı (native-stack `headerTitle`): tek satır, sığmazsa küçülür. Yalnız Android'de
 * verilir (iOS'ta özel başlık görünümü gezinme çubuğunun ortasına yerleşir ve genişliği
 * sınırlanmaz; iOS kareleri sığıyor). Yazı boyu Android `HeaderTitle` ile aynı (20).
 */
export const SigdirilanBaslik: React.FC<{ children: string; tintColor?: string }> = ({ children, tintColor }) => (
    <Text
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={EN_KUCUK_OLCEK}
        style={{ color: tintColor, fontSize: 20, fontWeight: 'bold' }}
    >
        {children}
    </Text>
);

/** `screenOptions`'a yayılır: Android'de küçülebilen başlık, iOS'ta kütüphanenin kendisi. */
export const sigdirilanBaslikSecenegi = (): { headerTitle?: (p: { children: string; tintColor?: string }) => React.ReactNode } =>
    Platform.OS === 'android' ? { headerTitle: (p) => <SigdirilanBaslik {...p} /> } : {};
