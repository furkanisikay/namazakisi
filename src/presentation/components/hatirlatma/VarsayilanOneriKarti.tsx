/**
 * "Daha az bildirim" öneri kartı — mevcut kullanıcıya bir kez (`useVarsayilanOnerisi`).
 * Tek cümle ne değişeceğini söyler; "Uygulayın" tek dokunuştur ve "Geri al" bandı çıkar.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { IkonCipi } from '../ortak/IkonCipi';
import { useMetin } from '../../hooks/useMetin';

export const VarsayilanOneriKarti: React.FC<{ onUygula: () => void; onKapat: () => void; kendiAyari?: boolean }> = ({
    onUygula,
    onKapat,
    kendiAyari = false,
}) => {
    const renkler = useRenkler();
    const m = useMetin();
    const mo = m.hatirlatma.varsayilanOneri;
    return (
        <View
            testID="varsayilan-oneri-karti"
            style={{
                borderRadius: 24,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: renkler.birincil + '50',
                backgroundColor: renkler.kartArkaplan,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IkonCipi ikon="leaf" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text accessibilityRole="header" style={{ fontSize: 16, fontWeight: '700', color: renkler.metin }}>
                        {mo.baslik}
                    </Text>
                    <Text style={{ fontSize: 14, lineHeight: 20, marginTop: 2, color: renkler.metin }}>
                        {mo.metin}
                        {kendiAyari ? mo.kendiAyari : ''}
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                    testID="varsayilan-oneri-kapat"
                    onPress={onKapat}
                    accessibilityRole="button"
                    accessibilityLabel={m.ortak.kapatin}
                    style={{
                        flex: 1,
                        minHeight: 44,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                        backgroundColor: renkler.arkaplan,
                    }}
                >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: renkler.metin }}>{m.ortak.kapatin}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="varsayilan-oneri-uygula"
                    onPress={onUygula}
                    accessibilityRole="button"
                    accessibilityLabel={mo.uygulaEtiketi}
                    style={{
                        flex: 1.3,
                        minHeight: 44,
                        borderRadius: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: renkler.birincil,
                    }}
                >
                    <FontAwesome5 name="check" size={13} color={renkler.birincilMetin} solid style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.birincilMetin }}>{mo.uygula}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
