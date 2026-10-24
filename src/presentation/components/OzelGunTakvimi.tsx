/**
 * Ozel Gun Takvimi (Secici)
 * Kullanicinin mazeret donemini baslatmasi icin tarih secimi yaptigi modal
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRenkler } from '../../core/theme';
import { BOYUTLAR } from '../../core/constants/UygulamaSabitleri';
import { OZEL_GUN_RENGI } from '../../core/constants/OzelGunRengi';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { bicim, metin } from '../../core/dil/aktifDil';
import { useMetin } from '../hooks/useMetin';

const ikiHane = (n: number) => String(n).padStart(2, '0');

/** Sayısal tarih ("24.10.2026"); `Intl`/`toLocale*`'e bağlı değil (Hermes ICU). */
export const sayisalTarih = (t: Date): string =>
    bicim(metin().hatirlatma.ozelGun.tarih, { gun: ikiHane(t.getDate()), ay: ikiHane(t.getMonth() + 1), yil: t.getFullYear() });

interface OzelGunTakvimiProps {
    gorunur: boolean;
    onKapat: () => void;
    onBaslat: (baslangic: Date, bitis: Date) => void;
}

export const OzelGunTakvimi: React.FC<OzelGunTakvimiProps> = ({
    gorunur,
    onKapat,
    onBaslat,
}) => {
    const renkler = useRenkler();
    const m = useMetin().hatirlatma.ozelGun;
    const [baslangicTarihi, setBaslangicTarihi] = useState(new Date());
    const [bitisTarihi, setBitisTarihi] = useState(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Varsayilan 7 gun
    );
    const [seciciModu, setSeciciModu] = useState<'baslangic' | 'bitis' | null>(null);
    useDonanimGeriTusu(gorunur, onKapat);

    const handleTarihDegisimi = (_event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setSeciciModu(null);
        }

        if (selectedDate) {
            if (seciciModu === 'baslangic') {
                const yeniBaslangic = new Date(selectedDate);
                setBaslangicTarihi(yeniBaslangic);
                // Baslangic bitisten buyukse veya esitse bitisi 7 gun sonraya guncelle
                if (yeniBaslangic >= bitisTarihi) {
                    setBitisTarihi(new Date(yeniBaslangic.getTime() + 7 * 24 * 60 * 60 * 1000));
                }
            } else if (seciciModu === 'bitis') {
                setBitisTarihi(new Date(selectedDate));
            }
        }
    };

    return (
        <Modal
            visible={gorunur}
            transparent
            animationType="fade"
            onRequestClose={onKapat}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.kapatAlan}
                    activeOpacity={1}
                    onPress={onKapat}
                />
                <View style={[styles.kart, { backgroundColor: renkler.arkaplan }]}>
                    <View style={[styles.suruklemeBar, { backgroundColor: renkler.sinir }]} />

                    <Text style={[styles.baslik, { color: renkler.metin }]}>
                        {m.takvimBaslik}
                    </Text>
                    <Text style={[styles.aciklama, { color: renkler.metinIkincil }]}>
                        {m.takvimAciklama}
                    </Text>

                    <View style={styles.seciciGrup}>
                        <Text style={[styles.etiket, { color: renkler.metin }]}>{m.baslangic}</Text>
                        <TouchableOpacity
                            style={[styles.tarihButon, { backgroundColor: renkler.kartArkaplan }]}
                            onPress={() => setSeciciModu('baslangic')}
                        >
                            <Text style={[styles.tarihMetin, { color: renkler.metin }]}>
                                {sayisalTarih(baslangicTarihi)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.seciciGrup}>
                        <Text style={[styles.etiket, { color: renkler.metin }]}>{m.bitis}</Text>
                        <TouchableOpacity
                            style={[styles.tarihButon, { backgroundColor: renkler.kartArkaplan }]}
                            onPress={() => setSeciciModu('bitis')}
                        >
                            <Text style={[styles.tarihMetin, { color: renkler.metin }]}>
                                {sayisalTarih(bitisTarihi)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {(seciciModu || Platform.OS === 'ios') && (
                        <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : undefined}>
                            <DateTimePicker
                                value={seciciModu === 'bitis' ? bitisTarihi : baslangicTarihi}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTarihDegisimi}
                                minimumDate={seciciModu === 'bitis' ? baslangicTarihi : undefined}
                                textColor={renkler.metin}
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={styles.iosTamamButon}
                                    onPress={() => setSeciciModu(null)}
                                >
                                    <Text style={{ color: renkler.vurgu, fontWeight: 'bold' }}>{m.tamam}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View style={styles.butonlar}>
                        {/* İkincil buton deseni: arkaplan + sınır (AGENTS.md) */}
                        <TouchableOpacity
                            style={[styles.buton, styles.iptalButon, { backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }]}
                            onPress={onKapat}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.butonMetin, { color: renkler.metinIkincil }]}>{m.iptal}</Text>
                        </TouchableOpacity>
                        {/* Birincil: "Özel Gün Başlat" ile aynı pembe. renkler.birincil DEĞİL —
                            beyaz metin varsayılan yeşil üstünde 2,78:1 kalıyor (OzelGunRengi.ts). */}
                        <TouchableOpacity
                            style={[styles.buton, { backgroundColor: OZEL_GUN_RENGI }]}
                            onPress={() => onBaslat(baslangicTarihi, bitisTarihi)}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.butonMetin, styles.birincilButonMetin]}>{m.modu}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    kapatAlan: {
        flex: 1,
    },
    kart: {
        borderTopLeftRadius: BOYUTLAR.YUVARLATMA_BUYUK * 2,
        borderTopRightRadius: BOYUTLAR.YUVARLATMA_BUYUK * 2,
        padding: BOYUTLAR.PADDING_BUYUK,
        paddingBottom: Platform.OS === 'ios' ? 40 : BOYUTLAR.PADDING_BUYUK,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    suruklemeBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: BOYUTLAR.MARGIN_BUYUK,
    },
    baslik: {
        fontSize: BOYUTLAR.FONT_BASLIK,
        fontWeight: 'bold',
        marginBottom: BOYUTLAR.MARGIN_KUCUK,
        textAlign: 'center',
    },
    aciklama: {
        fontSize: BOYUTLAR.FONT_ORTA,
        marginBottom: BOYUTLAR.MARGIN_BUYUK,
        textAlign: 'center',
        lineHeight: 20,
    },
    seciciGrup: {
        marginBottom: BOYUTLAR.MARGIN_BUYUK,
    },
    etiket: {
        fontSize: BOYUTLAR.FONT_NORMAL,
        fontWeight: '600',
        marginBottom: BOYUTLAR.MARGIN_KUCUK,
        marginLeft: 5,
    },
    tarihButon: {
        padding: BOYUTLAR.PADDING_ORTA,
        borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
    },
    tarihMetin: {
        fontSize: BOYUTLAR.FONT_ORTA,
        fontWeight: '500',
    },
    iosPickerContainer: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
        marginBottom: BOYUTLAR.MARGIN_ORTA,
    },
    iosTamamButon: {
        alignItems: 'center',
        padding: BOYUTLAR.PADDING_ORTA,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    butonlar: {
        flexDirection: 'row',
        marginTop: BOYUTLAR.MARGIN_ORTA,
        gap: BOYUTLAR.MARGIN_ORTA,
    },
    buton: {
        flex: 1,
        padding: BOYUTLAR.PADDING_ORTA,
        borderRadius: BOYUTLAR.YUVARLATMA_ORTA,
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
    },
    iptalButon: {
        borderWidth: 1,
    },
    butonMetin: {
        fontWeight: 'bold',
        fontSize: BOYUTLAR.FONT_ORTA,
    },
    birincilButonMetin: {
        // Dolu OZEL_GUN_RENGI zeminde beyaz metin: 4,95:1 (WCAG AA).
        color: '#FFFFFF',
    },
});
