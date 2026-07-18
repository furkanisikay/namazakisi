/**
 * Sesli anons ile ilgili kucuk, paylasilan parcalar (Faz 5).
 * Hem `SeviyeDetayModal` hem `AkisOnizlemeModal` kullanir.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { adimiOnizle } from '../../../domain/services/AnonsOnizlemeServisi';
import type { UyariModu } from '../../../core/muhafiz/matrisTipleri';
import { SESLI_MODLAR, BILDIRIMLI_MODLAR } from './sabitler';

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

export interface DinleButonuProps {
    /** Onizlenecek adimin modu — hangi seslerin calacagini BU belirler. */
    mod: UyariModu;
    /** Ses kimligi ('varsayilan' | kullanicinin sectigi 'content://...') */
    bildirimSesi: string;
    /** Yer tutuculari COZULMUS anons metni; bossa konusma yapilmaz. */
    cozulmusMetin?: string;
    /**
     * Ekran okuyucu etiketi — ZORUNLU. Ayni ekranda birden cok "Dinle" bulunur
     * (her adim icin bir tane); ortak etiket hem kullaniciyi hem testi (getByLabelText
     * "Found multiple elements") yaniltir.
     */
    erisimEtiketi: string;
}

/**
 * Bir adimi GERCEKTE nasil duyulacaksa oyle calan kucuk buton (dokunma hedefi ≥44dp).
 *
 * Gercek bildirim GONDERMEZ: bildirim sesi uygulama icinden (expo-audio), sesli
 * anons ise kisa gecikmeli tek atislik TTS ile calinir (bkz. `adimiOnizle`).
 *
 * Duyulacak bir sey yoksa (mod 'sessiz', ya da metinsiz 'sesli') HIC CIZILMEZ —
 * basildiginda sessiz kalan bir buton kullaniciyi "bozuk" hissine surukler.
 * Ikon duyulacagi ima eder: yalniz ses → zil, yalniz anons → hoparlor, ikisi → megafon.
 */
export const DinleButonu: React.FC<DinleButonuProps> = ({
    mod,
    bildirimSesi,
    cozulmusMetin = '',
    erisimEtiketi,
}) => {
    const renkler = useRenkler();

    const anonsCalinacak = SESLI_MODLAR.includes(mod) && cozulmusMetin.trim().length > 0;
    const bildirimCalinacak = BILDIRIMLI_MODLAR.includes(mod);
    if (!anonsCalinacak && !bildirimCalinacak) return null;

    const ikon = anonsCalinacak && bildirimCalinacak ? 'bullhorn' : anonsCalinacak ? 'volume-up' : 'bell';

    return (
        <TouchableOpacity
            className="flex-row items-center justify-center px-3.5 rounded-xl border"
            style={{
                minHeight: 44,
                backgroundColor: renkler.arkaplan,
                borderColor: renkler.sinir,
            }}
            onPress={() => adimiOnizle({ mod, bildirimSesi, cozulmusMetin })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={erisimEtiketi}
        >
            <FontAwesome5 name={ikon} size={11} color={renkler.birincil} solid style={{ marginRight: 7 }} />
            <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                Dinle
            </Text>
        </TouchableOpacity>
    );
};
