/**
 * Bildirim sınırı kartı (issue #298) — ekranın üstünde TEK kart.
 *
 * Sayaç çubuğu: normal birincil renk, sınıra yaklaşınca (%85) turuncu
 * (`durum.dikkat`), aşımda kırmızı (`durum.hata`). Renkler YALNIZ dekoratiftir
 * (ikon, çubuk, kenar); metin daima tema metin rengindedir (AGENTS.md
 * kontrast tuzağı). Dokununca ayrıntı/öneri sayfası açılır.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { ButceDurumu, DefterOzeti } from '../../../core/bildirim/bildirimDefteri';
import type { BildirimPlatformu } from '../../../core/bildirim/butceSabitleri';

export const cihazAdi = (platform: BildirimPlatformu): string => (platform === 'ios' ? 'iPhone' : 'Android');

/** Durum → dekoratif renk (tema token'ı). */
export const butceRengi = (
    durum: ButceDurumu,
    renkler: { birincil: string; durum: { dikkat: string; hata: string } }
): string => (durum === 'asim' ? renkler.durum.hata : durum === 'yakin' ? renkler.durum.dikkat : renkler.birincil);

export const butceBasligi = (durum: ButceDurumu): string =>
    durum === 'asim'
        ? 'Bazı hatırlatmalar gelmeyecek'
        : durum === 'yakin'
            ? 'Bildirim sınırına yaklaştınız'
            : 'Bekleyen bildirimleriniz';

export const butceAciklamasi = (ozet: DefterOzeti): string => {
    const cihaz = cihazAdi(ozet.platform);
    if (ozet.durum === 'asim') {
        return `${cihaz} en fazla ${ozet.sinir} bildirim bekletir; en geç kurulan ${ozet.gelmeyecek} bildirim gelmeyecek. Düzeltmek için dokunun.`;
    }
    if (ozet.durum === 'yakin') {
        return `${cihaz} en fazla ${ozet.sinir} bildirim bekletir. Yer açmanın yolları için dokunun.`;
    }
    return `${cihaz} sınırı ${ozet.sinir}. Ayrıntı için dokunun.`;
};

interface Props {
    ozet: DefterOzeti | null;
    onPress: () => void;
}

export const BildirimButceKarti: React.FC<Props> = ({ ozet, onPress }) => {
    const renkler = useRenkler();
    if (!ozet || !ozet.kartGorunur) return null;

    const renk = butceRengi(ozet.durum, renkler);
    const ikon = ozet.durum === 'asim' ? 'exclamation-circle' : 'layer-group';
    const baslik = butceBasligi(ozet.durum);

    return (
        <TouchableOpacity
            testID="bildirim-butce-karti"
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${baslik}: ${ozet.toplam} / ${ozet.sinir}. ${butceAciklamasi(ozet)}`}
            className="rounded-2xl border p-4 mb-4"
            style={{
                backgroundColor: renkler.kartArkaplan,
                borderColor: ozet.durum === 'normal' ? renkler.sinir : `${renk}66`,
                borderRadius: 24,
            }}
        >
            <View className="flex-row items-center">
                <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${renk}20` }}
                >
                    <FontAwesome5 name={ikon} size={15} color={renk} solid />
                </View>
                <Text className="text-sm font-bold flex-1" style={{ color: renkler.metin }}>
                    {baslik}
                </Text>
                <Text
                    testID="bildirim-butce-sayi"
                    className="text-sm font-bold"
                    style={{ color: renkler.metin, fontVariant: ['tabular-nums'] }}
                >
                    {ozet.toplam} / {ozet.sinir}
                </Text>
            </View>
            <View
                className="mt-3 rounded-full overflow-hidden"
                style={{ height: 6, backgroundColor: renkler.sinir }}
                importantForAccessibility="no-hide-descendants"
            >
                <View
                    testID="bildirim-butce-cubuk"
                    style={{ height: 6, width: `${Math.round(ozet.oran * 100)}%`, backgroundColor: renk, borderRadius: 3 }}
                />
            </View>
            <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                {butceAciklamasi(ozet)}
            </Text>
        </TouchableOpacity>
    );
};
