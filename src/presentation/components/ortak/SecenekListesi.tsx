/**
 * Tek seçimli liste — radyo KARTLARI (dikey, açıklamalı) ya da ÇİPLER (yatay, kısa).
 *
 * Seçimde zemin ve kenar yumuşakça geçer (150 ms, ölçek yok): renk animasyonu native
 * driver'da olmadığı için seçili dolgu AYRI bir katmandır ve yalnız opaklığı değişir.
 * Seçim yalnız renkle değil biçimle de söylenir: kartta dolu daire ✓, çipte ✓ ikonu.
 *
 * "Bu cihazda yok" seçenekleri (`kullanilamaz`) silinmez: soluk çizilir, dokununca
 * kısa açıklama (`kullanilamazNedeni`) gösterilir — kullanıcı neden seçemediğini öğrenir.
 */
import * as React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useSecimGecisi } from '../hareket/hareketler';
import { kisaBildirimGoster } from '../common/KisaBildirim';

export interface Secenek<T extends string | number> {
    deger: T;
    etiket: string;
    aciklama?: string;
    ikon?: string;
    /** Bu cihazda yok: soluk + dokununca `kullanilamazNedeni`. */
    kullanilamaz?: boolean;
    kullanilamazNedeni?: string;
}

export interface SecenekListesiProps<T extends string | number> {
    secenekler: readonly Secenek<T>[];
    secili: T;
    onSec: (deger: T) => void;
    gorunum?: 'kart' | 'cip';
    /** Grubun ekran okuyucu adı (ör. "Hatırlatma düzeyi"). */
    erisimEtiketi: string;
    testID?: string;
}

function SecenekOgesi<T extends string | number>({
    secenek,
    secili,
    onSec,
    gorunum,
}: {
    secenek: Secenek<T>;
    secili: boolean;
    onSec: (d: T) => void;
    gorunum: 'kart' | 'cip';
}) {
    const renkler = useRenkler();
    const gecis = useSecimGecisi(secili);
    const kart = gorunum === 'kart';
    const bas = () => {
        if (secenek.kullanilamaz) {
            if (secenek.kullanilamazNedeni) kisaBildirimGoster(secenek.kullanilamazNedeni, true);
            return;
        }
        onSec(secenek.deger);
    };
    return (
        <TouchableOpacity
            onPress={bas}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityLabel={secenek.aciklama ? `${secenek.etiket}. ${secenek.aciklama}` : secenek.etiket}
            accessibilityState={{ selected: secili, checked: secili }}
            accessibilityHint={secenek.kullanilamaz ? secenek.kullanilamazNedeni : undefined}
            style={[
                kart ? styles.kart : styles.cip,
                { borderColor: renkler.sinir, backgroundColor: renkler.kartArkaplan },
                secenek.kullanilamaz ? { opacity: 0.5 } : null,
            ]}
        >
            {/* Seçili katman: yalnız opaklığı geçer. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    {
                        borderRadius: kart ? 16 : 22,
                        borderWidth: 2,
                        borderColor: renkler.birincil,
                        backgroundColor: renkler.birincil + '14',
                        opacity: gecis,
                    },
                ]}
            />
            {kart ? (
                <View style={[styles.radyo, { borderColor: secili ? renkler.birincil : renkler.sinir }]}>
                    {secili ? <View style={[styles.radyoIc, { backgroundColor: renkler.birincil }]} /> : null}
                </View>
            ) : secili ? (
                <FontAwesome5 name="check" size={11} color={renkler.birincil} style={{ marginRight: 6 }} />
            ) : null}
            {secenek.ikon && kart ? (
                <FontAwesome5 name={secenek.ikon} size={15} color={secili ? renkler.birincil : renkler.metinIkincil} solid style={{ marginRight: 10 }} />
            ) : null}
            <View style={kart ? { flex: 1 } : null}>
                <Text style={{ fontSize: kart ? 16 : 14, fontWeight: secili ? '700' : '600', color: renkler.metin }}>
                    {secenek.etiket}
                </Text>
                {kart && secenek.aciklama ? (
                    <Text style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>{secenek.aciklama}</Text>
                ) : null}
            </View>
            {secenek.kullanilamaz && kart ? (
                <FontAwesome5 name="info-circle" size={13} color={renkler.metinIkincil} style={{ marginLeft: 8 }} />
            ) : null}
        </TouchableOpacity>
    );
}

export function SecenekListesi<T extends string | number>({
    secenekler,
    secili,
    onSec,
    gorunum = 'kart',
    erisimEtiketi,
    testID,
}: SecenekListesiProps<T>) {
    return (
        <View
            testID={testID}
            accessibilityRole="radiogroup"
            accessibilityLabel={erisimEtiketi}
            style={gorunum === 'kart' ? { gap: 8 } : { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
        >
            {secenekler.map((s) => (
                <SecenekOgesi key={String(s.deger)} secenek={s} secili={s.deger === secili} onSec={onSec} gorunum={gorunum} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    kart: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    cip: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 22,
        borderWidth: 1,
    },
    radyo: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radyoIc: { width: 10, height: 10, borderRadius: 5 },
});
