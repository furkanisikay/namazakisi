/**
 * Rıza modalı İSKELETİ — kapsam genişleten her eylem için tek desen (sesli okuma,
 * gerçek alarm, takvim okuma, konum…): ikon + başlık (soru) + ≤ 3 madde + isteğe
 * bağlı örnek (Dinle / önizleme) + iki düğme.
 *
 * Kurallar (plan + `SesliOnayModal` dersi):
 *  - Geri tuşu / backdrop / "Vazgeç" = VAZGEÇ: hiçbir şey yazılmaz.
 *  - Rıza kaydı yalnız kullanıcı bu ekranı GÖRÜP onayladığında yazılır (çağıranın işi).
 *  - Madde ≤ 3 (fazlası okunmaz; ayrıntı ilgili ekranda). Geliştirmede uyarı verir.
 *  - Sistem izni gerekiyorsa `onOnayla` içinde modalı kapatıp `useIzinAkisi().istekBaslat()`.
 *  - iOS iki kardeş modal sunamaz: başka bir modalın içinden açılacaksa o modalın
 *    AĞACININ İÇİNE koyun (`AdimDetayModal` → `AlarmOnayModal` deseni).
 */
import * as React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { IkonCipi } from './IkonCipi';

export interface RizaMaddesi {
    ikon: string;
    metin: string;
}

export interface RizaModaliProps {
    gorunur: boolean;
    ikon: string;
    /** Soru biçiminde, ≤ 4 kelime: "Sesli okuma açılsın mı?" */
    baslik: string;
    altBaslik?: string;
    maddeler: readonly RizaMaddesi[];
    /** Örnek: Dinle düğmesi, bildirim kartı minyatürü… */
    ornek?: React.ReactNode;
    /** Sonucu söyleyen fiil: "Sesli okumayı açın". */
    onaylaEtiketi: string;
    onaylaIkonu?: string;
    vazgecEtiketi?: string;
    onOnayla: () => void;
    /** Geri tuşu / backdrop / Vazgeç. */
    onVazgec: () => void;
    /** Üçüncü yol (ör. "Sesli olmadan uygula"); vazgeçten ayrıdır. */
    ikincil?: { etiket: string; onPress: () => void };
    /** iOS: modal tamamen kapanınca (izin akışı için `useIzinAkisi().modalKapandi`). */
    onKapandi?: () => void;
    testID?: string;
}

export const RIZA_AZAMI_MADDE = 3;

export const RizaModali: React.FC<RizaModaliProps> = ({
    gorunur,
    ikon,
    baslik,
    altBaslik,
    maddeler,
    ornek,
    onaylaEtiketi,
    onaylaIkonu = 'check',
    vazgecEtiketi = 'Vazgeç',
    onOnayla,
    onVazgec,
    ikincil,
    onKapandi,
    testID,
}) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onVazgec);
    if (__DEV__ && maddeler.length > RIZA_AZAMI_MADDE) {
        // eslint-disable-next-line no-console -- geliştirici uyarısı (metin bütçesi)
        console.warn(`RizaModali: en fazla ${RIZA_AZAMI_MADDE} madde (${maddeler.length} verildi)`);
    }

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onVazgec} onDismiss={onKapandi}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} testID={testID}>
                <TouchableWithoutFeedback onPress={onVazgec} accessible={false}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>
                <View
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        maxHeight: '85%',
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    <ScrollView bounces={false}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                            <IkonCipi ikon={ikon} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text accessibilityRole="header" style={{ fontSize: 17, fontWeight: '700', color: renkler.metin }}>
                                    {baslik}
                                </Text>
                                {altBaslik ? (
                                    <Text style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>{altBaslik}</Text>
                                ) : null}
                            </View>
                        </View>

                        {maddeler.map((m) => (
                            <View key={m.metin} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                                <FontAwesome5 name={m.ikon} size={13} color={renkler.birincil} solid style={{ width: 22, marginTop: 3 }} />
                                <Text style={{ flex: 1, fontSize: 15, lineHeight: 21, color: renkler.metin }}>{m.metin}</Text>
                            </View>
                        ))}

                        {ornek ? <View style={{ marginTop: 6, marginBottom: 4 }}>{ornek}</View> : null}
                    </ScrollView>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                        <TouchableOpacity
                            onPress={onVazgec}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={vazgecEtiketi}
                            style={{
                                flex: 1,
                                minHeight: 48,
                                borderRadius: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: renkler.arkaplan,
                                borderWidth: 1,
                                borderColor: renkler.sinir,
                            }}
                        >
                            <Text style={{ fontSize: 15, fontWeight: '600', color: renkler.metinIkincil }}>{vazgecEtiketi}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onOnayla}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={onaylaEtiketi}
                            style={{
                                flex: 1.4,
                                minHeight: 48,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 10,
                                backgroundColor: renkler.birincil,
                            }}
                        >
                            <FontAwesome5 name={onaylaIkonu} size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: renkler.birincilMetin, flexShrink: 1 }}>
                                {onaylaEtiketi}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {ikincil ? (
                        <TouchableOpacity
                            onPress={ikincil.onPress}
                            accessibilityRole="button"
                            accessibilityLabel={ikincil.etiket}
                            style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.birincil }}>{ikincil.etiket}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
};
