/**
 * Masaüstü postürünün ÜST yarısı (issue #283): yarı açık katlanabilir masada
 * dururken dik duran ekran — uzaktan okunacak büyük geri sayım + şu anki vakit.
 *
 * SALT GÖSTERİM: dik duran yarıya dokunmak cihazı devirir; "Kıldım" alt yarıdaki
 * günlük akıştan işaretlenir. Prop'lar ilkel değerlerdir ve bileşen `React.memo`
 * ile sarılıdır — ana ekranın saniyelik çiziminde yalnız `kalanSureStr`
 * değiştiğinde (o da saniyede bir, beklenen) yeniden çizilir.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { useRenkler } from '../../../core/theme';
import { BirimliSure } from '../common/BirimliSure';
import { kalanSureSesli } from '../../../core/utils/kalanSureParcalari';

interface MasaustuGeriSayimProps {
    /** Başlıkta görünen ad ("Öğle", cuma günü "Cuma"). */
    vakitAdi: string;
    /** "02:45:12" */
    kalanSureStr: string;
    /** "12:30 - 15:45" */
    vakitAraligi: string;
    tamamlandi: boolean;
    /** Güneş → öğle arası: öğle henüz girmedi (sayaç girişe kalan süredir). */
    kilitli: boolean;
}

const MasaustuGeriSayimBileseni: React.FC<MasaustuGeriSayimProps> = ({
    vakitAdi,
    kalanSureStr,
    vakitAraligi,
    tamamlandi,
    kilitli,
}) => {
    const renkler = useRenkler();
    const ustEtiket = kilitli ? 'SIRADAKİ VAKİT' : 'ŞU ANKİ VAKİT';
    const sayacEtiketi = kilitli ? 'Vaktin girmesine kalan' : 'Vaktin çıkmasına kalan';
    const erisimEtiketi = `${vakitAdi} vakti, ${vakitAraligi}. ${sayacEtiketi} ${kalanSureSesli(kalanSureStr)}.${
        tamamlandi ? ' Kılındı.' : ''
    }`;

    return (
        <View
            testID="masaustu-geri-sayim"
            style={stiller.kap}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={erisimEtiketi}
        >
            <View style={stiller.ustSatir}>
                <Text style={[stiller.ustEtiket, { color: renkler.birincil }]}>{ustEtiket}</Text>
                {tamamlandi && (
                    <View style={[stiller.cip, { backgroundColor: renkler.durum.basarili + '20' }]}>
                        <FontAwesome5 name="check-circle" size={12} color={renkler.durum.basarili} />
                        <Text style={[stiller.cipMetni, { color: renkler.metin }]}>Kılındı</Text>
                    </View>
                )}
            </View>
            <Text style={[stiller.vakitAdi, { color: renkler.metin }]} numberOfLines={1}>
                {vakitAdi}
            </Text>
            <BirimliSure
                sure={kalanSureStr}
                rakamBoyu={88}
                birimOrani={0.36}
                birimRengi={renkler.metinIkincil}
                style={[stiller.sayac, { color: renkler.metin }]}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
            />
            <Text style={[stiller.altMetin, { color: renkler.metinIkincil }]}>
                {sayacEtiketi} · {vakitAraligi}
            </Text>
        </View>
    );
};

export const MasaustuGeriSayim = React.memo(MasaustuGeriSayimBileseni);

const stiller = StyleSheet.create({
    kap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    ustSatir: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    ustEtiket: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    cip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    cipMetni: {
        fontSize: 12,
        fontWeight: '600',
    },
    vakitAdi: {
        fontSize: 28,
        fontWeight: '800',
    },
    sayac: {
        fontSize: 88,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
    },
    altMetin: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
});
