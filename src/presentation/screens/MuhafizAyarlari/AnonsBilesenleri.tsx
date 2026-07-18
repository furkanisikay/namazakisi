/**
 * Sesli anons ile ilgili kucuk, paylasilan parcalar (Faz 5).
 * Hem `SeviyeDetayModal` hem `AkisOnizlemeModal` kullanir.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { anonsuOnizle } from '../../../domain/services/AnonsOnizlemeServisi';

/**
 * Cihazda Turkce konusma paketi yoksa gosterilen kibar bilgilendirme.
 * ENGELLEME YAPMAZ — kullanici sesli modu yine secebilir.
 *
 * `destekli === null` (henuz bilinmiyor/sorgulanamadi) iken hicbir sey cizilmez;
 * yanlis alarm vermek, uyariyi hic vermemekten kotudur.
 *
 * RENK: `renkler.uyari` (#FFC107 sari-amber) yalniz DEKORATIF kullanilir (ikon +
 * %15 zemin tonu); govde metni `renkler.metin` ile cizilir → kontrast tabani tema
 * token'indan gelir (AGENTS.md kontrast tuzagi).
 */
export const TurkceTtsUyarisi: React.FC<{ destekli: boolean | null }> = ({ destekli }) => {
    const renkler = useRenkler();
    if (destekli !== false) return null;

    return (
        <View
            className="flex-row items-start p-3 rounded-xl mt-1"
            style={{ backgroundColor: `${renkler.uyari}15` }}
            accessibilityRole="alert"
        >
            <FontAwesome5
                name="exclamation-triangle"
                size={13}
                color={renkler.uyari}
                solid
                style={{ marginRight: 8, marginTop: 1 }}
            />
            <Text className="flex-1 text-xs leading-4" style={{ color: renkler.metin }}>
                Cihazınızda Türkçe konuşma paketi bulunamadı; sesli anons çalışmayabilir.
                Telefonunuzun ayarlarından Türkçe metin okuma (TTS) paketini kurabilirsiniz.
                Ayarlarınız yine de kaydedilir.
            </Text>
        </View>
    );
};

/**
 * Cozulmus anons metnini ~1 sn sonra okutan kucuk buton (dokunma hedefi ≥44dp).
 * Gercek bildirim GONDERMEZ; yalniz TTS konusur.
 */
export const DinleButonu: React.FC<{ cozulmusMetin: string; erisimEtiketi?: string }> = ({
    cozulmusMetin,
    erisimEtiketi,
}) => {
    const renkler = useRenkler();

    return (
        <TouchableOpacity
            className="flex-row items-center justify-center px-3.5 rounded-xl border"
            style={{
                minHeight: 44,
                backgroundColor: renkler.arkaplan,
                borderColor: renkler.sinir,
            }}
            onPress={() => anonsuOnizle(cozulmusMetin)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={erisimEtiketi ?? 'Sesli anonsu dinleyin'}
        >
            <FontAwesome5 name="play" size={11} color={renkler.birincil} solid style={{ marginRight: 7 }} />
            <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                Dinle
            </Text>
        </TouchableOpacity>
    );
};
