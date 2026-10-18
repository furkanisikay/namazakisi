/**
 * Ana ekranın TEK durum alanı (sade tasarım, Dalga 2).
 *
 * Vakit kartının üstünde aynı anda yalnız EN ÖNEMLİ uyarı görünür (öncelik saf
 * `core/anaEkran/durumAlani.durumSec`: kerahat > muhafız > toparlanma > seferîlik >
 * diğer). Başka uyarı da varsa küçük bir "+N daha" düğmesi çıkar; dokununca diğerleri
 * altta açılır. Hiç uyarı yoksa alan HİÇ çizilmez (boş kutu yok).
 *
 * `DurumSeridi`: alanın tek satırlık ortak görünümü — sol kenar çizgisi + tonlu ikon
 * çipi (dekoratif renk token'ı) + metin (daima `metin` rengi; kontrast tuzağı).
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { durumSec, type DurumAnahtari } from '../../../core/anaEkran/durumAlani';
import { IkonCipi } from '../ortak/IkonCipi';

export interface DurumAlaniOgesi {
    anahtar: DurumAnahtari;
    dugum: React.ReactNode;
    /** "+N daha" düğmesinin ekran okuyucu etiketinde kullanılan kısa ad. */
    ozet: string;
}

export const DurumAlani: React.FC<{ ogeler: readonly DurumAlaniOgesi[] }> = ({ ogeler }) => {
    const renkler = useRenkler();
    const [acik, setAcik] = React.useState(false);
    const secim = durumSec(ogeler.map((o) => o.anahtar));
    // Öne çıkan uyarı değişince açık liste kapanır (eski açıklık yeni duruma taşınmasın).
    React.useEffect(() => setAcik(false), [secim.birincil]);
    const bul = (a: DurumAnahtari) => ogeler.find((o) => o.anahtar === a);

    if (!secim.birincil) return null;
    const birincil = bul(secim.birincil);
    const gizli = secim.gizlenenler.map(bul).filter((o): o is DurumAlaniOgesi => !!o);
    const genis = acik && gizli.length > 0;

    return (
        <View testID="durum-alani" style={{ marginBottom: 12 }}>
            {birincil?.dugum}
            {genis ? gizli.map((o) => <View key={o.anahtar} style={{ marginTop: 8 }}>{o.dugum}</View>) : null}
            {gizli.length > 0 ? (
                <TouchableOpacity
                    testID="durum-alani-daha"
                    onPress={() => setAcik((a) => !a)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: genis }}
                    accessibilityLabel={
                        genis ? 'Diğer uyarıları gizleyin' : `${gizli.length} uyarı daha: ${gizli.map((o) => o.ozet).join(', ')}`
                    }
                    hitSlop={{ top: 8, bottom: 8 }}
                    style={{
                        alignSelf: 'flex-end',
                        flexDirection: 'row',
                        alignItems: 'center',
                        minHeight: 32,
                        marginTop: 6,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        backgroundColor: renkler.metinIkincil + '15',
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: renkler.metin }}>
                        {genis ? 'Daha az' : `+${gizli.length} daha`}
                    </Text>
                    <FontAwesome5 name={genis ? 'chevron-up' : 'chevron-down'} size={10} color={renkler.metinIkincil} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export interface DurumSeridiProps {
    ikon: string;
    /** Dekoratif vurgu rengi (tema token'ı DEĞERİ: `renkler.dikkat` vb.). Metne uygulanmaz. */
    renk: string;
    baslik: string;
    metin?: string | null;
    /** Satırın altına ek içerik (ör. ilerleme çubuğu). */
    alt?: React.ReactNode;
    onPress?: () => void;
    erisimEtiketi?: string;
    testID?: string;
}

export const DurumSeridi: React.FC<DurumSeridiProps> = ({ ikon, renk, baslik, metin, alt, onPress, erisimEtiketi, testID }) => {
    const renkler = useRenkler();
    const icerik = (
        <>
            <IkonCipi ikon={ikon} renk={renk} boyut="kucuk" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.metin }}>{baslik}</Text>
                {metin ? <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metin }}>{metin}</Text> : null}
                {alt}
            </View>
            {onPress ? <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} style={{ marginLeft: 8 }} /> : null}
        </>
    );
    const stil = {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        minHeight: 56,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: renkler.sinir,
        borderLeftWidth: 4,
        borderLeftColor: renk,
        backgroundColor: renkler.kartArkaplan,
    };
    const etiket = erisimEtiketi ?? (metin ? `${baslik}. ${metin}` : baslik);
    if (onPress) {
        return (
            <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={etiket} style={stil}>
                {icerik}
            </TouchableOpacity>
        );
    }
    return (
        <View testID={testID} accessible accessibilityLabel={etiket} style={stil}>
            {icerik}
        </View>
    );
};
