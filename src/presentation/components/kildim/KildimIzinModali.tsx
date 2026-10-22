/**
 * `namazakisi://kildim` için soru penceresi (issue #299) — tema uyumlu, `BildirimModali`
 * görsel dilinde.
 *
 * İki biçimi vardır:
 *  - Başlatan TANINIYOR (Android, paket adı biliniyor): "<Uygulama> namazlarınızı kılındı
 *    olarak işaretleyebilsin mi?" + [Her zaman izin ver] [Yalnız bu sefer] [Engelle].
 *    Tarayıcıya "her zaman" sunulmaz (native kural; `herZaman=false`).
 *  - Başlatan BİLİNMİYOR (iOS, uydurulabilir referrer): karar saklanamaz → "Öğle namazı
 *    kılındı olarak işaretlensin mi?" + [Vazgeç] [Kıldım].
 *
 * Geri tuşu ve dışarı dokunma = Vazgeç: karar SAKLANMAZ, bir dahaki istekte yine sorulur.
 */
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import {
    KILDIM_GUVEN_ETIKETLERI,
    kildimIzinAciklamasi,
    kildimIzinSorusu,
    kildimTarayiciAciklamasi,
    type KildimBaglantiKarari,
} from '../../../core/kildim/kildimGuven';

export interface KildimIzinModaliProps {
    /** Görünen vakit adı ("Öğle"); null iken pencere kapalıdır. */
    vakitAdi: string | null;
    baslatan: KildimBaglantiKarari | null;
    /** Başlatanı bilinmeyen biçimin başlığı ve açıklaması. */
    kimliksizBaslik: string;
    kimliksizMesaj: string;
    onHerZaman: () => void;
    onBuSefer: () => void;
    onEngelle: () => void;
    onVazgec: () => void;
}

export const KildimIzinModali: React.FC<KildimIzinModaliProps> = ({
    vakitAdi,
    baslatan,
    kimliksizBaslik,
    kimliksizMesaj,
    onHerZaman,
    onBuSefer,
    onEngelle,
    onVazgec,
}) => {
    const renkler = useRenkler();
    const gorunur = vakitAdi != null;
    useDonanimGeriTusu(gorunur, onVazgec);

    /** Paket adı biliniyorsa başlatan TANINIYOR (kalıcı karar sunulabilir). */
    const tanidik = baslatan?.paket ? baslatan : null;
    const taniniyor = tanidik != null;
    const baslik = tanidik ? kildimIzinSorusu(tanidik.ad) : kimliksizBaslik;
    const mesaj = !vakitAdi
        ? ''
        : !tanidik
          ? kimliksizMesaj
          : tanidik.herZaman
            ? kildimIzinAciklamasi(vakitAdi)
            : kildimTarayiciAciklamasi(vakitAdi);

    // Kapanış animasyonunda metin boşalıp titremesin (BildirimModali deseni).
    const [son, setSon] = React.useState({ baslik, mesaj });
    React.useEffect(() => {
        if (gorunur && baslik) setSon({ baslik, mesaj });
    }, [gorunur, baslik, mesaj]);

    const ikincilDugme = (etiket: string, ikon: string, onPress: () => void, renk = renkler.metin) => (
        <TouchableOpacity
            key={etiket}
            className="flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir, minHeight: 44 }}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={etiket}
        >
            <FontAwesome5 name={ikon} size={13} color={renk} style={{ marginRight: 8 }} />
            <Text className="text-sm font-semibold" style={{ color: renk }}>
                {etiket}
            </Text>
        </TouchableOpacity>
    );

    const birincilDugme = (etiket: string, ikon: string, onPress: () => void) => (
        <TouchableOpacity
            key={etiket}
            className="flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={etiket}
        >
            <FontAwesome5 name={ikon} size={13} color={renkler.birincilMetin} style={{ marginRight: 8 }} />
            <Text className="text-sm font-bold" style={{ color: renkler.birincilMetin }}>
                {etiket}
            </Text>
        </TouchableOpacity>
    );

    let dugmeler: React.ReactNode[];
    if (!tanidik) {
        dugmeler = [birincilDugme('Kıldım', 'check', onBuSefer), ikincilDugme('Vazgeç', 'times', onVazgec, renkler.metinIkincil)];
    } else {
        dugmeler = [];
        if (tanidik.herZaman) {
            dugmeler.push(birincilDugme(KILDIM_GUVEN_ETIKETLERI.herZaman, 'check-double', onHerZaman));
            dugmeler.push(ikincilDugme(KILDIM_GUVEN_ETIKETLERI.buSefer, 'check', onBuSefer));
        } else {
            dugmeler.push(birincilDugme(KILDIM_GUVEN_ETIKETLERI.buSefer, 'check', onBuSefer));
        }
        if (tanidik.engel) {
            dugmeler.push(ikincilDugme(KILDIM_GUVEN_ETIKETLERI.engelle, 'ban', onEngelle, renkler.hata));
        }
    }

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={onVazgec}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={onVazgec}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    testID="kildim-izin-modali"
                    style={{
                        width: '88%',
                        maxWidth: 420,
                        backgroundColor: renkler.kartArkaplan,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: renkler.sinir,
                    }}
                >
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: renkler.birincil + '20' }}
                        >
                            <FontAwesome5 name={taniniyor ? 'user-shield' : 'check-circle'} size={18} color={renkler.birincil} solid />
                        </View>
                        <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }}>
                            {son.baslik}
                        </Text>
                    </View>

                    <Text className="text-sm leading-5 mb-5" style={{ color: renkler.metinIkincil }}>
                        {son.mesaj}
                    </Text>

                    <View style={{ gap: 10 }}>{dugmeler}</View>
                </View>
            </View>
        </Modal>
    );
};
