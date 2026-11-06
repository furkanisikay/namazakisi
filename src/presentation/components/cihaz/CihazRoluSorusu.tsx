/**
 * "Bu cihaz sizin ana telefonunuz mu?" — kurulumu ÖNCEKİ sürümde bitirmiş geniş ekranlı
 * cihazda (tablet, iPad) BİR KEZ sorulur (yeni kurulum soruyu sihirbazda görür).
 *
 * Geri tuşu / backdrop / "Sonra" rolü YAZMAZ, yalnız bir daha sormaz: rol bilinmiyorken
 * hatırlatma KURULUR. Tek cihazlı kullanıcının hatırlatmaları yanlışlıkla bir dokunuşla
 * susmasın — susturmak yalnız açık "Hayır, bu ikinci cihaz" seçimidir.
 */
import * as React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { rolSorulmaliMi } from '../../../core/cihaz/cihazRolu';
import { cihazRoluOku, cihazRoluYaz } from '../../../data/local/LocalCihazRoluServisi';
import { cihazRoluAyarla } from '../../hooks/useHatirlatmaKapisi';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { useMetin } from '../../hooks/useMetin';

export const CihazRoluSorusu: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().cihaz.rol;
    const [gorunur, setGorunur] = React.useState(false);

    React.useEffect(() => {
        let canli = true;
        const ekran = Dimensions.get('screen');
        void cihazRoluOku().then((ayar) => {
            if (canli && rolSorulmaliMi(ayar, Math.min(ekran.width, ekran.height))) setGorunur(true);
        });
        return () => {
            canli = false;
        };
    }, []);

    const sec = (rol: 'ana' | 'ikincil') => {
        setGorunur(false);
        void cihazRoluAyarla(rol);
    };
    const sonra = React.useCallback(() => {
        setGorunur(false);
        void cihazRoluYaz({ soruldu: true }).catch(() => undefined);
    }, []);
    useDonanimGeriTusu(gorunur, sonra);

    const dugme = (etiket: string, ikon: string, birincil: boolean, onPress: () => void, testID: string) => (
        <Pressable
            testID={testID}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            className="flex-row items-center justify-center rounded-2xl mt-3"
            style={{
                minHeight: 48,
                backgroundColor: birincil ? renkler.birincil : renkler.arkaplan,
                borderWidth: birincil ? 0 : 1,
                borderColor: renkler.sinir,
            }}
        >
            <FontAwesome5 name={ikon} size={14} color={birincil ? renkler.birincilMetin : renkler.metin} style={{ marginRight: 8 }} />
            <Text className="text-base font-semibold" style={{ color: birincil ? renkler.birincilMetin : renkler.metin }}>
                {etiket}
            </Text>
        </Pressable>
    );

    return (
        <Modal visible={gorunur} animationType="fade" transparent statusBarTranslucent onRequestClose={sonra}>
            <View style={stil.kok}>
                <Pressable style={[StyleSheet.absoluteFill, stil.perde]} onPress={sonra} accessibilityLabel={m.sonraKararErisim} />
                <View
                    testID="cihaz-rolu-sorusu"
                    style={[stil.kart, { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }]}
                >
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: renkler.birincil + '20' }}
                        >
                            <FontAwesome5 name="tablet-alt" size={18} color={renkler.birincil} />
                        </View>
                        <Text className="flex-1 text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
                            {m.soru}
                        </Text>
                    </View>
                    <Text className="text-sm leading-5" style={{ color: renkler.metinIkincil }}>
                        {m.aciklama}
                    </Text>
                    {dugme(m.ana, 'mobile-alt', true, () => sec('ana'), 'cihaz-rolu-ana')}
                    {dugme(m.ikincil, 'tablet-alt', false, () => sec('ikincil'), 'cihaz-rolu-ikincil')}
                    <Pressable
                        onPress={sonra}
                        accessibilityRole="button"
                        accessibilityLabel={m.sonra}
                        className="items-center justify-center mt-2"
                        style={{ minHeight: 44 }}
                    >
                        <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                            {m.sonra}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const stil = StyleSheet.create({
    kok: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    perde: { backgroundColor: 'rgba(0,0,0,0.5)' },
    kart: { width: '88%', maxWidth: 440, borderRadius: 24, padding: 24, borderWidth: 1 },
});
