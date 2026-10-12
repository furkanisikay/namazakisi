/**
 * Ana ekran nafile şeridi (issue #77).
 *
 * Vakit kartının altında TEK satırlık sakin bilgi: içinde bulunulan ya da
 * sıradaki nafile vakti. İmza öğesi değildir — vakit kartı ekranın odağı kalır.
 *
 * Ana ekran SANİYEDE BİR çizilir → `React.memo` + yalnız dize/boolean prop'lar
 * (AGENTS.md: Date nesnesi her render'da yeni referans olur, memo'yu kırar).
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { BildirimModali } from '../common/BildirimModali';

export interface NafileSeridiProps {
    /** FontAwesome5 ikon adı */
    ikon: string;
    /** "Kuşluk vakti · bitiş 11:47" */
    metin: string;
    /** Dokununca açılan bilgi modalının başlığı */
    bilgiBaslik: string;
    /** Dokununca açılan bilgi modalının metni */
    bilgiMetni: string;
    /** Pencere içinde mi? (vurgu tonu) */
    aktif: boolean;
}

const NafileSeridiIc: React.FC<NafileSeridiProps> = ({ ikon, metin, bilgiBaslik, bilgiMetni, aktif }) => {
    const renkler = useRenkler();
    const [bilgiAcik, setBilgiAcik] = useState(false);

    return (
        <>
            <TouchableOpacity
                testID="nafile-seridi"
                onPress={() => setBilgiAcik(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${metin}. Ayrıntı için dokunun.`}
                className="flex-row items-center mb-4 px-4 rounded-2xl border"
                style={{
                    minHeight: 48,
                    backgroundColor: aktif ? `${renkler.birincil}12` : renkler.kartArkaplan,
                    borderColor: aktif ? `${renkler.birincil}40` : renkler.sinir,
                }}
            >
                <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${renkler.birincil}20` }}
                >
                    <FontAwesome5 name={ikon} size={13} color={renkler.birincil} solid />
                </View>
                <Text className="flex-1 text-sm font-medium" style={{ color: renkler.metin }} numberOfLines={1}>
                    {metin}
                </Text>
                <FontAwesome5 name="info-circle" size={13} color={renkler.metinIkincil} />
            </TouchableOpacity>
            <BildirimModali
                gorunur={bilgiAcik}
                tip="bilgi"
                baslik={bilgiBaslik}
                mesaj={bilgiMetni}
                onKapat={() => setBilgiAcik(false)}
            />
        </>
    );
};

export const NafileSeridi = React.memo(NafileSeridiIc);
