/**
 * Katman 1 + Katman 2 — vakit satiri ve acildiginda o vaktin 4 adimi.
 * (spec 3: "Vakit listesi" / "Vakit acik → adimlar")
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import type { MuhafizVakti, VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import { seviyeOzetiOlustur } from '../../../core/muhafiz/seviyeOzeti';
import { vakitOzetiOlustur, aktifSeviyeSayisi } from '../../../core/muhafiz/vakitOzeti';
import { SEVIYE_BILGILERI } from './sabitler';

export interface VakitKartiProps {
    vakit: MuhafizVakti;
    vakitAyari: VakitMuhafizAyari;
    acikMi: boolean;
    onAcKapa: () => void;
    /** Katman 3'u acar */
    onSeviyeSec: (indeks: number) => void;
    onTumVakitlereUygula: () => void;
    /** "Akisi onizle" (spec 3.4) */
    onAkisiOnizle: () => void;
}

export const VakitKarti: React.FC<VakitKartiProps> = ({
    vakit,
    vakitAyari,
    acikMi,
    onAcKapa,
    onSeviyeSec,
    onTumVakitlereUygula,
    onAkisiOnizle,
}) => {
    const renkler = useRenkler();

    const vakitAdi = VAKIT_ADLARI[vakit];
    const ozet = vakitOzetiOlustur(vakitAyari);
    const aktifSayi = aktifSeviyeSayisi(vakitAyari);
    const tamamenKapali = aktifSayi === 0;

    return (
        <View
            className="rounded-2xl border mb-3 overflow-hidden"
            style={{ backgroundColor: renkler.kartArkaplan, borderColor: acikMi ? renkler.birincil : renkler.sinir }}
        >
            {/* ── Katman 1: vakit satiri ── */}
            <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={onAcKapa}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: acikMi }}
                accessibilityLabel={`${vakitAdi} vakti hatırlatma ayarları. ${ozet}`}
            >
                <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: tamamenKapali ? renkler.arkaplan : `${renkler.birincil}20` }}
                >
                    <FontAwesome5
                        name={tamamenKapali ? 'bell-slash' : 'mosque'}
                        size={16}
                        color={tamamenKapali ? renkler.metinIkincil : renkler.birincil}
                        solid
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                        {vakitAdi}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                        {ozet}
                    </Text>
                </View>

                <View
                    className="px-2 py-0.5 rounded-lg mr-2.5"
                    style={{ backgroundColor: tamamenKapali ? renkler.arkaplan : `${renkler.birincil}15` }}
                >
                    <Text
                        className="text-[11px] font-bold"
                        style={{ color: tamamenKapali ? renkler.metinIkincil : renkler.birincil }}
                    >
                        {aktifSayi}/{vakitAyari.seviyeler.length}
                    </Text>
                </View>

                <FontAwesome5
                    name={acikMi ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color={renkler.metinIkincil}
                />
            </TouchableOpacity>

            {/* ── Katman 2: adimlar ── */}
            {acikMi && (
                <View className="px-4 pb-4 border-t pt-3" style={{ borderTopColor: renkler.sinir }}>
                    <Text
                        className="text-[11px] font-semibold tracking-wider mb-2.5"
                        style={{ color: renkler.metinIkincil }}
                    >
                        HATIRLATMA ADIMLARI
                    </Text>

                    {vakitAyari.seviyeler.map((seviye, indeks) => {
                        const bilgi = SEVIYE_BILGILERI[seviye.kademe];
                        const sessiz = seviye.mod === 'sessiz';
                        return (
                            <TouchableOpacity
                                key={seviye.kademe}
                                className="flex-row items-center p-3 rounded-xl border mb-2"
                                style={{
                                    backgroundColor: renkler.arkaplan,
                                    borderColor: renkler.sinir,
                                    borderLeftWidth: 4,
                                    borderLeftColor: sessiz ? renkler.sinir : bilgi.renk,
                                    opacity: sessiz ? 0.65 : 1,
                                }}
                                onPress={() => onSeviyeSec(indeks)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`${bilgi.baslik} adımını düzenleyin. ${seviyeOzetiOlustur(seviye)}`}
                            >
                                <View
                                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: sessiz ? renkler.sinir : `${bilgi.renk}20` }}
                                >
                                    <FontAwesome5
                                        name={sessiz ? 'bell-slash' : bilgi.ikon}
                                        size={14}
                                        color={sessiz ? renkler.metinIkincil : bilgi.renk}
                                        solid
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {bilgi.baslik}
                                    </Text>
                                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {seviyeOzetiOlustur(seviye)}
                                    </Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={12} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        );
                    })}

                    {/* Akisi onizle (spec 3.4) — gercek bildirim GONDERMEZ */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center py-3.5 rounded-2xl mt-1"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        onPress={onAkisiOnizle}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`${vakitAdi} akışını önizleyin`}
                    >
                        <FontAwesome5 name="stream" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
                        <Text className="text-sm font-semibold" style={{ color: renkler.birincil }}>
                            Akışı önizle
                        </Text>
                    </TouchableOpacity>

                    {/* Tum vakitlere uygula (spec 4.3) */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center py-3.5 rounded-2xl mt-2"
                        style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                        onPress={onTumVakitlereUygula}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Tüm vakitlere uygula"
                    >
                        <FontAwesome5 name="clone" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
                        <Text className="text-sm font-semibold" style={{ color: renkler.birincil }}>
                            Tüm vakitlere uygula
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
