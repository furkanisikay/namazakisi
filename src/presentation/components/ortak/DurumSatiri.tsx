/**
 * Cihaz/sistem durumunun ekrandaki TEK görünümü — üç hâl:
 *
 *  1. düzeltilebilir → sebep (tek cümle) + TEK düğme (`durum` bir `DurumNotu`);
 *  2. bu cihazda yok → soluk satır, dokununca kısa açıklama (`durum.yok === true`);
 *  3. hazır ya da bilinmiyor → HİÇBİR ŞEY çizilmez (`durum` null).
 *
 * Kullanım:
 *   const { durum, yenile } = useCihazDurumu(['tamAlarm']);
 *   <DurumSatiri durum={durumNotu('tamAlarm', durum)} onSonra={yenile} />
 *
 * Düğme varsayılan olarak `durumEylemiUygula` ile sistem ekranını açar; dönüşte
 * `useCihazDurumu` zaten yeniden okur (AppState), `onSonra` izin diyaloğu gibi aynı
 * ekranda biten eylemlerden hemen sonra tazelemek içindir.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { EYLEM_ETIKETLERI, type DurumEylemi, type DurumNotu } from '../../../core/cihaz/durumNotlari';
import { kisaBildirimGoster } from '../common/KisaBildirim';

export interface CihazdaYok {
    yok: true;
    /** Soluk satırın metni (ör. "Canlı sayaç bu telefonda yok"). */
    metin: string;
    /** Dokununca gösterilen kısa neden. */
    aciklama: string;
}

export type DurumSatiriDurumu = DurumNotu | CihazdaYok;

export interface DurumSatiriProps {
    durum: DurumSatiriDurumu | null | undefined;
    /** Eylemi özel bir işle değiştirmek için (verilmezse sistem eylemi). */
    onEylem?: (eylem: DurumEylemi) => void | Promise<unknown>;
    /** Eylem tamamlanınca (ör. durumu yeniden oku). */
    onSonra?: () => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

const yokMu = (d: DurumSatiriDurumu): d is CihazdaYok => (d as CihazdaYok).yok === true;

export const DurumSatiri: React.FC<DurumSatiriProps> = ({ durum, onEylem, onSonra, style, testID }) => {
    const renkler = useRenkler();
    const [mesgul, setMesgul] = React.useState(false);
    if (!durum) return null;

    if (yokMu(durum)) {
        return (
            <TouchableOpacity
                testID={testID}
                onPress={() => kisaBildirimGoster(durum.aciklama, true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${durum.metin}. ${durum.aciklama}`}
                style={[{ flexDirection: 'row', alignItems: 'center', minHeight: 44, opacity: 0.6 }, style]}
            >
                <FontAwesome5 name="minus-circle" size={13} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                <Text style={{ flex: 1, fontSize: 14, color: renkler.metinIkincil }}>{durum.metin}</Text>
                <FontAwesome5 name="info-circle" size={13} color={renkler.metinIkincil} />
            </TouchableOpacity>
        );
    }

    const uyari = durum.tip === 'uyari';
    const renk = uyari ? renkler.dikkat : renkler.bilgi;
    const eylem = durum.eylem;
    const etiket = eylem ? (durum.eylemEtiketi ?? EYLEM_ETIKETLERI[eylem]) : null;

    const bas = async () => {
        if (!eylem || mesgul) return;
        setMesgul(true);
        try {
            if (onEylem) {
                await onEylem(eylem);
            } else {
                // Tembel: eylemler native köprü çeker (test ve iOS güvenliği).
                const { durumEylemiUygula } = require('../../../domain/services/DurumEylemleri') as typeof import('../../../domain/services/DurumEylemleri');
                const acildi = await durumEylemiUygula(eylem);
                if (!acildi) kisaBildirimGoster('Ayar ekranı açılamadı; telefonunuzun Ayarlar bölümünden açabilirsiniz.', true);
            }
            onSonra?.();
        } finally {
            setMesgul(false);
        }
    };

    return (
        <View
            testID={testID}
            style={[
                { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: renk },
                style,
            ]}
        >
            <FontAwesome5 name={uyari ? 'exclamation-triangle' : 'info-circle'} size={13} color={renk} solid style={{ marginRight: 8 }} />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: renkler.metin }}>{durum.metin}</Text>
            {etiket ? (
                <TouchableOpacity
                    onPress={bas}
                    disabled={mesgul}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={etiket}
                    accessibilityState={{ disabled: mesgul, busy: mesgul }}
                    style={{
                        marginLeft: 10,
                        minHeight: 44,
                        paddingHorizontal: 14,
                        borderRadius: 16,
                        justifyContent: 'center',
                        backgroundColor: renkler.birincil,
                        opacity: mesgul ? 0.6 : 1,
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: renkler.birincilMetin }}>{etiket}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};
