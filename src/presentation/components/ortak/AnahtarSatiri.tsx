/**
 * İkon + başlık + tek satır özet + anahtar.
 *
 * Anahtar, satırı saran Touchable'ın İÇİNDE DEĞİL KARDEŞİDİR (TalkBack: Touchable
 * çocukları tek düğüme düzleştirir → anahtar odaklanamaz, dokunma hedefleri çakışır).
 * `onPress` verilirse yalnız metin alanı dokunulabilir olur (ayrıntı sayfasına geçiş);
 * verilmezse satırın tamamı düz `View`dır ve yalnız anahtar etkileşimlidir.
 *
 * Kapalıyken ikon gri çipe döner ve `-slash` ikonu (verilirse) kullanılır — renk tek
 * başına durum taşımaz. Anahtar değişince ikon bir kez yaylanır (`useYayVurgu`).
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../common/Anahtar';
import { IkonCipi } from './IkonCipi';
import { useYayVurgu } from '../hareket/hareketler';

export interface AnahtarSatiriProps {
    ikon: string;
    /** Kapalıyken gösterilecek ikon (ör. 'bell-slash'); verilmezse `ikon` gri. */
    kapaliIkon?: string;
    renk?: string;
    baslik: string;
    /** Tek satır durum/özet (≤ 10 kelime). */
    ozet?: string;
    deger: boolean;
    onDegistir: (yeni: boolean) => void;
    /** Metin alanına dokununca (ör. ayrıntı sayfası); anahtar ayrı kalır. */
    onPress?: () => void;
    devreDisi?: boolean;
    testID?: string;
}

export const AnahtarSatiri: React.FC<AnahtarSatiriProps> = ({
    ikon,
    kapaliIkon,
    renk,
    baslik,
    ozet,
    deger,
    onDegistir,
    onPress,
    devreDisi = false,
    testID,
}) => {
    const renkler = useRenkler();
    const olcek = useYayVurgu(deger);
    const r = renk ?? renkler.birincil;

    const icerik = (
        <>
            <IkonCipi ikon={deger ? ikon : (kapaliIkon ?? ikon)} renk={r} soluk={!deger} olcek={olcek} />
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{baslik}</Text>
                {ozet ? (
                    <Text numberOfLines={2} style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>
                        {ozet}
                    </Text>
                ) : null}
            </View>
            {onPress ? (
                <FontAwesome5 name="chevron-right" size={13} color={renkler.metinIkincil} style={{ marginHorizontal: 8 }} />
            ) : null}
        </>
    );

    return (
        // testID ERİŞİLEBİLİR öğede durur (dokunulabilir satır; yoksa anahtar): iOS
        // erişilebilirlik ağacı (idb/XCUITest) erişilebilir olmayan sarmalayıcı View'u
        // göstermez → `satir-cuma` gibi seçiciler simülatörde bulunamazdı.
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 10 }}>
            {onPress ? (
                <TouchableOpacity
                    testID={testID}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 44 }}
                    onPress={onPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={ozet ? `${baslik}. ${ozet}` : baslik}
                    accessibilityHint="Ayrıntıları açar"
                >
                    {icerik}
                </TouchableOpacity>
            ) : (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>{icerik}</View>
            )}
            <Anahtar
                testID={onPress || !testID ? undefined : testID}
                value={deger}
                onValueChange={onDegistir}
                disabled={devreDisi}
                trackColor={{ false: renkler.sinir, true: `${r}60` }}
                thumbColor={deger ? r : undefined}
                accessibilityRole="switch"
                accessibilityLabel={baslik}
                accessibilityState={{ checked: deger, disabled: devreDisi }}
            />
        </View>
    );
};
