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
 *
 * KONUM İZNİ AÇIKLAMASIZ İSTENMEZ: `konumIzni` eylemi sistem diyaloğunu doğrudan açmaz;
 * önce Prominent Disclosure (`KonumIzniDisclosureModali`, sihirbazla aynı metin)
 * gösterilir, kabul edilirse `useIzinAkisi` şablonu modal kapandıktan sonra ister ve
 * durumu yeniden okur. Vazgeç/geri tuşu = hiçbir şey istenmez.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { EYLEM_ETIKETLERI, type DurumEylemi, type DurumNotu } from '../../../core/cihaz/durumNotlari';
import { kisaBildirimGoster } from '../common/KisaBildirim';
import { KonumIzniDisclosureModali } from '../KonumIzniDisclosureModali';
import { useIzinAkisi } from './useIzinAkisi';
import { metin } from '../../../core/dil/aktifDil';
import type { IzinDurumu } from '../../../core/cihaz/durumNotlari';

const konumIzniOku = async (): Promise<IzinDurumu | null> => {
    const { alaniOku } = require('../../../domain/services/CihazDurumOkuyucu') as typeof import('../../../domain/services/CihazDurumOkuyucu');
    return alaniOku('konumIzni');
};
const konumIzniIste = async (): Promise<void> => {
    const { konumIzniIste: iste } = require('../../../domain/services/DurumEylemleri') as typeof import('../../../domain/services/DurumEylemleri');
    await iste();
};

/** Açıklama (rıza) adımı + izin akışı şablonu; yalnız konum izni satırında bağlanır. */
const KonumIzniAkisi: React.FC<{ gorunur: boolean; onKapat: () => void; onSonra?: () => void }> = ({ gorunur, onKapat, onSonra }) => {
    const izin = useIzinAkisi({ oku: konumIzniOku, iste: konumIzniIste });
    return (
        <KonumIzniDisclosureModali
            gorunur={gorunur}
            tip="onPlan"
            onKabul={() => {
                onKapat();
                void izin.istekBaslat().then(() => onSonra?.());
            }}
            onReddet={onKapat}
        />
    );
};

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
    const [aciklamaAcik, setAciklamaAcik] = React.useState(false);
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

    // Konum izni (sorulabilir) özel yol: önce açıklama, sonra şablonla istek.
    const aciklamaliIzin = eylem === 'konumIzni' && !onEylem;

    const bas = async () => {
        if (!eylem || mesgul) return;
        if (aciklamaliIzin) {
            setAciklamaAcik(true);
            return;
        }
        setMesgul(true);
        try {
            if (onEylem) {
                await onEylem(eylem);
            } else {
                // Tembel: eylemler native köprü çeker (test ve iOS güvenliği).
                const { durumEylemiUygula } = require('../../../domain/services/DurumEylemleri') as typeof import('../../../domain/services/DurumEylemleri');
                const acildi = await durumEylemiUygula(eylem);
                if (!acildi) kisaBildirimGoster(metin().genel.ortak.ayarEkraniAcilamadi, true);
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
            {aciklamaliIzin ? <KonumIzniAkisi gorunur={aciklamaAcik} onKapat={() => setAciklamaAcik(false)} onSonra={onSonra} /> : null}
        </View>
    );
};
