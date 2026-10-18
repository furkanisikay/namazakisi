/**
 * Sesli anons ile ilgili kucuk, paylasilan parcalar (Faz 5).
 * Hem `SeviyeDetayModal` hem `AkisOnizlemeModal` kullanir.
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { adimiOnizle } from '../../../domain/services/AnonsOnizlemeServisi';
import type { UyariKanallari } from '../../../core/muhafiz/matrisTipleri';
import { bildirimSesiGerekliMi, sesliAnonsGerekliMi } from '../../../core/muhafiz/motorAdaptoru';
import { BOS_CIHAZ_DURUMU, durumNotu } from '../../../core/cihaz/durumNotlari';
import { surumuOku } from '../../../domain/services/CihazDurumOkuyucu';
import { DurumSatiri } from '../ortak/DurumSatiri';

/**
 * Cihazda Turkce konusma paketi yoksa gosterilen kibar bilgilendirme.
 * ENGELLEME YAPMAZ — kullanici sesli modu yine secebilir.
 *
 * `destekli === null` (henuz bilinmiyor/sorgulanamadi) iken hicbir sey cizilmez;
 * yanlis alarm vermek, uyariyi hic vermemekten kotudur.
 *
 * Android'de tek dokunus cozum: "Türkçe sesi indirin" sistemin TTS veri indirme
 * ekranini acar (`DurumEylemleri.ttsIndir`); iPhone'da ekran yolu yazilir. Metin ve
 * eylem tek kaynaktan: `core/cihaz/durumNotlari` ('turkceTts').
 */
export const TurkceTtsUyarisi: React.FC<{ destekli: boolean | null }> = ({ destekli }) => {
    if (destekli !== false) return null;
    const not = durumNotu('turkceTts', { ...BOS_CIHAZ_DURUMU, surum: surumuOku(), turkceTts: destekli });
    if (!not) return null;
    return (
        <View className="mt-1" accessibilityRole="alert">
            <DurumSatiri durum={not} />
        </View>
    );
};

export interface DinleButonuProps {
    /** Onizlenecek adimin KANAL KUMESI — hangi seslerin calacagini BU belirler. */
    kanallar: UyariKanallari;
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
 * Duyulacak bir sey yoksa (adim kapali, ya da metinsiz sesli adim) HIC CIZILMEZ —
 * basildiginda sessiz kalan bir buton kullaniciyi "bozuk" hissine surukler.
 * Ikon duyulacagi ima eder: yalniz ses → zil, yalniz anons → hoparlor, ikisi → megafon.
 */
export const DinleButonu: React.FC<DinleButonuProps> = ({
    kanallar,
    bildirimSesi,
    cozulmusMetin = '',
    erisimEtiketi,
}) => {
    const renkler = useRenkler();

    const anonsCalinacak = sesliAnonsGerekliMi(kanallar) && cozulmusMetin.trim().length > 0;
    const bildirimCalinacak = bildirimSesiGerekliMi(kanallar);
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
            // Yangin-ve-unut: `adimiOnizle` sesin bitisini bekledigi icin artik
            // async; servis kendi hatalarini yutar, buton beklemez.
            onPress={() => { void adimiOnizle({ kanallar, bildirimSesi, cozulmusMetin }); }}
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
