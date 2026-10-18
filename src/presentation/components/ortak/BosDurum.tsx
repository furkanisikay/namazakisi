/**
 * Boş ve yükleniyor durumları.
 *
 * `BosDurum`: büyük tonlu ikon + bir cümle NEDEN + (varsa) tek düğme NE YAPMALI.
 * Nedeni yanlış söylemeyin (izin yoksa "veri yok" demeyin — `DurumSatiri` kullanın).
 *
 * `Yukleniyor`: gerçek bekleme sırasında dönen gösterge + fiil ("Konum alınıyor").
 * Kısa işlerde FLAŞ etmesin diye `gecikmeMs` (400) dolmadan HİÇBİR ŞEY çizmez; sonsuz
 * döngü yalnız iş sürerken vardır (dürüst bekleme), iş bitince bileşen kalkar.
 */
import * as React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { IkonCipi } from './IkonCipi';

export interface BosDurumProps {
    ikon: string;
    /** Bir cümle: neden boş. */
    baslik: string;
    aciklama?: string;
    eylemEtiketi?: string;
    eylemIkonu?: string;
    onEylem?: () => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const BosDurum: React.FC<BosDurumProps> = ({ ikon, baslik, aciklama, eylemEtiketi, eylemIkonu, onEylem, style, testID }) => {
    const renkler = useRenkler();
    return (
        <View testID={testID} style={[{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }, style]}>
            <IkonCipi ikon={ikon} boyut="buyuk" renk={renkler.metinIkincil} />
            <Text style={{ marginTop: 14, fontSize: 16, fontWeight: '600', textAlign: 'center', color: renkler.metin }}>{baslik}</Text>
            {aciklama ? (
                <Text style={{ marginTop: 6, fontSize: 14, textAlign: 'center', color: renkler.metinIkincil }}>{aciklama}</Text>
            ) : null}
            {eylemEtiketi && onEylem ? (
                <TouchableOpacity
                    onPress={onEylem}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={eylemEtiketi}
                    style={{
                        marginTop: 18,
                        minHeight: 48,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: renkler.birincil,
                    }}
                >
                    {eylemIkonu ? <FontAwesome5 name={eylemIkonu} size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} /> : null}
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.birincilMetin }}>{eylemEtiketi}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export const YUKLENIYOR_GECIKMESI_MS = 400;

export interface YukleniyorProps {
    /** Fiil: "Konum alınıyor". */
    metin?: string;
    gecikmeMs?: number;
    style?: StyleProp<ViewStyle>;
}

export const Yukleniyor: React.FC<YukleniyorProps> = ({ metin, gecikmeMs = YUKLENIYOR_GECIKMESI_MS, style }) => {
    const renkler = useRenkler();
    const [gorunur, setGorunur] = React.useState(gecikmeMs <= 0);
    React.useEffect(() => {
        if (gecikmeMs <= 0) return;
        const z = setTimeout(() => setGorunur(true), gecikmeMs);
        return () => clearTimeout(z);
    }, [gecikmeMs]);
    if (!gorunur) return null;
    return (
        <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={metin ?? 'Yükleniyor'}
            accessibilityState={{ busy: true }}
            style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }, style]}
        >
            <ActivityIndicator color={renkler.birincil} />
            {metin ? <Text style={{ marginLeft: 10, fontSize: 14, color: renkler.metinIkincil }}>{metin}</Text> : null}
        </View>
    );
};
