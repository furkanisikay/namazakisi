/**
 * Kart/bölüm başlığı — küçük, aralıklı BÜYÜK HARF etiket (≤ 3 kelime).
 *
 * Büyük harf etkin dilin kuralıyla `dilBuyukHarf` ile yapılır (Türkçede `turkceBuyukHarf`:
 * `toUpperCase` 'Bildirim' → 'BILDIRIM' yazardı; `textTransform: 'uppercase'` de aynı
 * tuzağa düşer; İngilizcede `i → I`, yoksa "REMİNDERS" çıkardı). Metni normal yazın:
 * `<BolumBasligi metin="Bildirim sesi" />` → "BİLDİRİM SESİ". Ekran okuyucu başlık
 * olarak okur ve büyük harfle değil, verilen metinle duyurur.
 */
import * as React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { dilBuyukHarf } from '../../../core/utils/turkceHarf';
import { aktifDil, dilDegisiminiDinle } from '../../../core/dil/aktifDil';

export interface BolumBasligiProps {
    metin: string;
    ikon?: string;
    /** Başlığın sağında küçük bir öğe (ör. "Tümü" bağlantısı). */
    sag?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const BolumBasligi: React.FC<BolumBasligiProps> = ({ metin, ikon, sag, style }) => {
    const renkler = useRenkler();
    // Etkin dile abone (büyük harf kuralı dile göre değişir).
    const dil = React.useSyncExternalStore(dilDegisiminiDinle, aktifDil);
    return (
        <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, minHeight: 20 }, style]}>
            {ikon ? <FontAwesome5 name={ikon} size={11} color={renkler.metinIkincil} solid style={{ marginRight: 6 }} /> : null}
            <Text
                accessibilityRole="header"
                accessibilityLabel={metin}
                style={{ flex: 1, fontSize: 12, fontWeight: '700', letterSpacing: 1, color: renkler.metinIkincil }}
            >
                {dilBuyukHarf(metin, dil)}
            </Text>
            {sag}
        </View>
    );
};
