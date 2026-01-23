/**
 * Ozel Gun Karti
 * Ana sayfada ozel gun modu aktifken gosterilen bilgilendirme karti
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { OzelGunKaydi } from '../../core/types/SeriTipleri';

interface OzelGunKartiProps {
    aktifOzelGun: OzelGunKaydi;
    onBitir: () => void;
    onIptal: () => void;
}

export const OzelGunKarti: React.FC<OzelGunKartiProps> = ({
    aktifOzelGun,
    onBitir,
    onIptal,
}) => {
    const renkler = useRenkler();

    const baslangic = new Date(aktifOzelGun.baslangicTarihi);
    const bitis = new Date(aktifOzelGun.bitisTarihi);
    const bugun = new Date();

    // Kalan gun sayisi
    const kalanZaman = bitis.getTime() - bugun.getTime();
    const kalanGun = Math.ceil(kalanZaman / (1000 * 60 * 60 * 24));

    return (
        <View style={[styles.konteyner, { backgroundColor: '#FFF0F5' }]}>
            <View style={styles.icerik}>
                <View style={styles.ikonKonteyner}>
                    <Text style={styles.ikon}>🌸</Text>
                </View>

                <View style={styles.metinKonteyner}>
                    <Text style={[styles.baslik, { color: '#D81B60' }]}>
                        Özel Gün Modu Aktif
                    </Text>
                    <Text style={[styles.altBaslik, { color: '#AD1457' }]}>
                        Seriniz donduruldu.
                        {kalanGun > 0 ? ` Tahmini ${kalanGun} gün kaldı.` : ' Süre doldu.'}
                    </Text>
                </View>
            </View>

            <View style={styles.aksiyonlar}>
                <TouchableOpacity
                    style={styles.ikincilButon}
                    onPress={onIptal}
                >
                    <Text style={styles.ikincilButonMetin}>İptal Et</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.birincilButon, { backgroundColor: '#D81B60' }]}
                    onPress={onBitir}
                >
                    <Text style={styles.birincilButonMetin}>Modu Bitir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    konteyner: {
        margin: BOYUTLAR.MARGIN_ORTA,
        padding: BOYUTLAR.PADDING_ORTA,
        borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
        borderWidth: 1,
        borderColor: '#FFC0CB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    icerik: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: BOYUTLAR.MARGIN_ORTA,
    },
    ikonKonteyner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: BOYUTLAR.MARGIN_ORTA,
    },
    ikon: {
        fontSize: 24,
    },
    metinKonteyner: {
        flex: 1,
    },
    baslik: {
        fontSize: BOYUTLAR.FONT_ORTA,
        fontWeight: 'bold',
    },
    altBaslik: {
        fontSize: BOYUTLAR.FONT_KUCUK,
        marginTop: 2,
    },
    aksiyonlar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: BOYUTLAR.MARGIN_ORTA,
    },
    birincilButon: {
        paddingHorizontal: BOYUTLAR.PADDING_ORTA,
        paddingVertical: BOYUTLAR.PADDING_KUCUK,
        borderRadius: BOYUTLAR.YUVARLATMA_KUCUK,
    },
    birincilButonMetin: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: BOYUTLAR.FONT_KUCUK,
    },
    ikincilButon: {
        paddingHorizontal: BOYUTLAR.PADDING_ORTA,
        paddingVertical: BOYUTLAR.PADDING_KUCUK,
    },
    ikincilButonMetin: {
        color: '#666',
        fontSize: BOYUTLAR.FONT_KUCUK,
    },
});
