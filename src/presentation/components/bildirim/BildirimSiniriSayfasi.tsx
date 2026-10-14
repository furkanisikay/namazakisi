/**
 * "Bildirim sınırı" / "Bu hatırlatma sığmıyor" sayfası (issue #298).
 *
 * İki mod:
 *   - ayrıntı: karta dokunulunca — sayı, kaynak dökümü ve (yakın/aşımda) öneriler.
 *   - ekleme: sığmayacak bir değişiklik denendiğinde — değişiklik UYGULANMAZ;
 *     neden ve yer açma yolları gösterilir. Öneriler BEKLEYEN değişiklik dahil
 *     ölçülür ("84 → 61 · sınırın altına iner").
 *
 * Bottom-sheet deseni `AdimDetayModal` ile aynı: backdrop KARDEŞ, sabit
 * yükseklik, `useDonanimGeriTusu`.
 */
import * as React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import type { DefterKaynagi, DefterOzeti } from '../../../core/bildirim/bildirimDefteri';
import type { ButceOnerisi } from '../../../core/bildirim/butceOnerileri';
import { butceRengi, cihazAdi } from './BildirimButceKarti';

const { height: EKRAN_YUKSEKLIGI } = Dimensions.get('window');

/** Kaynak dökümünün görünen adları (kibar "siz" dili gerektirmeyen ad öbekleri). */
export const KAYNAK_BILGILERI: Record<DefterKaynagi, { ad: string; ikon: string }> = {
    muhafiz: { ad: 'Namaz muhafızı', ikon: 'shield-alt' },
    anons: { ad: 'Sesli anons alarmları', ikon: 'volume-up' },
    alarm: { ad: 'Gerçek alarmlar', ikon: 'clock' },
    nafile: { ad: 'Nafile hatırlatmaları', ikon: 'star-and-crescent' },
    vakitBildirimi: { ad: 'Vakit girdi bildirimleri', ikon: 'bell' },
    cuma: { ad: 'Cuma hatırlatması', ikon: 'mosque' },
    camiyeGit: { ad: 'Camiye gitme hatırlatması', ikon: 'walking' },
    takvimCakisma: { ad: 'Takvim çakışması uyarısı', ikon: 'calendar-times' },
    gunSonu: { ad: 'Seri gün sonu hatırlatması', ikon: 'fire' },
    yatis: { ad: 'Yatış hatırlatması', ikon: 'bed' },
    sayac: { ad: 'Geri sayım bildirimleri', ikon: 'hourglass-half' },
    widget: { ad: 'Ana ekran widget’ı', ikon: 'th-large' },
};

export type SinirSayfasiModu =
    | { tur: 'ayrinti' }
    | { tur: 'ekleme'; baslik: string; sonraki: DefterOzeti };

interface Props {
    gorunur: boolean;
    mod: SinirSayfasiModu;
    /** Kaydedilmiş (uygulanmış) durumun özeti. */
    ozet: DefterOzeti;
    oneriler: ButceOnerisi[];
    /** Uygulanamayan ama başka ekranda yapılabilecek yer açma yolu (ör. muhafız ayarları). */
    ekYol?: { etiket: string; onPress: () => void };
    onUygula: (oneri: ButceOnerisi) => void;
    onKapat: () => void;
}

export const BildirimSiniriSayfasi: React.FC<Props> = ({ gorunur, mod, ozet, oneriler, ekYol, onUygula, onKapat }) => {
    const renkler = useRenkler();
    useDonanimGeriTusu(gorunur, onKapat);

    const ekleme = mod.tur === 'ekleme';
    const gosterilen = ekleme ? mod.sonraki : ozet;
    const cihaz = cihazAdi(ozet.platform);
    const renk = butceRengi(gosterilen.durum, renkler);
    const onerileriGoster = oneriler.length > 0 && (ekleme || gosterilen.durum !== 'normal');

    let govde: string;
    if (ekleme) {
        govde = `Bu değişiklikle bekleyen bildirim sayısı ${mod.sonraki.toplam} olacaktı. ${cihaz} en fazla ${ozet.sinir} bildirim bekletir ve fazlasını sessizce atar: en geç kurulan hatırlatmalar hiç gelmez. Aşağıdakilerden birini seçin; yer açılınca değişikliğiniz uygulanır.`;
    } else if (ozet.durum === 'asim') {
        govde = `Şu an ${ozet.toplam} bildirim bekliyor. ${cihaz} en fazla ${ozet.sinir} bildirim bekletir ve fazlasını hata vermeden atar: en geç kurulan ${ozet.gelmeyecek} bildirim gelmeyecek.`;
    } else if (ozet.durum === 'yakin') {
        govde = `Şu an ${ozet.toplam} bildirim bekliyor; sınıra ${ozet.sinir - ozet.toplam} kaldı. Yeni hatırlatma eklemeden önce yer açabilirsiniz.`;
    } else {
        govde = `Şu an ${ozet.toplam} bildirim bekliyor, sınırın altındasınız.`;
    }

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={onKapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableWithoutFeedback onPress={onKapat} accessibilityLabel="Kapat">
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    testID="bildirim-siniri-sayfasi"
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: EKRAN_YUKSEKLIGI * 0.8,
                        paddingBottom: 24,
                    }}
                >
                    <View className="items-center pt-3 pb-1">
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
                        <View className="flex-row items-center mt-2 mb-3">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: `${renk}20` }}
                            >
                                <FontAwesome5
                                    name={gosterilen.durum === 'asim' ? 'exclamation-circle' : 'layer-group'}
                                    size={18}
                                    color={renk}
                                    solid
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold" style={{ color: renkler.metin }} accessibilityRole="header">
                                    {ekleme ? mod.baslik : 'Bildirim sınırı'}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {cihaz} aynı anda en fazla {ozet.sinir} bildirim bekletir
                                </Text>
                            </View>
                        </View>

                        <Text className="text-sm leading-5 mb-4" style={{ color: renkler.metin }} testID="bildirim-siniri-govde">
                            {govde}
                        </Text>

                        {/* Kaynak dökümü */}
                        <View className="rounded-2xl border p-3 mb-4" style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}>
                            {gosterilen.kaynaklar.map(({ kaynak, sayi }) => (
                                <View key={kaynak} className="flex-row items-center py-1.5" testID={`kaynak-${kaynak}`}>
                                    <View className="w-6 items-center mr-2">
                                        <FontAwesome5 name={KAYNAK_BILGILERI[kaynak].ikon} size={12} color={renkler.metinIkincil} solid />
                                    </View>
                                    <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                                        {KAYNAK_BILGILERI[kaynak].ad}
                                    </Text>
                                    <Text className="text-sm font-bold" style={{ color: renkler.metin, fontVariant: ['tabular-nums'] }}>
                                        {sayi}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {onerileriGoster && (
                            <>
                                <Text className="text-[11px] font-bold tracking-wider mb-2" style={{ color: renkler.metinIkincil }}>
                                    ÖNERİLERİMİZ
                                </Text>
                                {oneriler.map((o) => (
                                    <View
                                        key={o.tur}
                                        testID={`oneri-${o.tur}`}
                                        className="rounded-2xl border p-3.5 mb-2.5"
                                        style={{ borderColor: renkler.sinir, backgroundColor: renkler.arkaplan }}
                                    >
                                        <View className="flex-row items-start">
                                            <View
                                                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                                style={{ backgroundColor: `${renkler.birincil}20` }}
                                            >
                                                <FontAwesome5 name={o.ikon} size={13} color={renkler.birincil} solid />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                                    {o.baslik}
                                                </Text>
                                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                                    {o.aciklama}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center mt-3">
                                            <Text
                                                className="text-xs flex-1"
                                                style={{ color: renkler.metin, fontVariant: ['tabular-nums'] }}
                                                testID={`oneri-sayi-${o.tur}`}
                                            >
                                                {o.oncekiToplam} → <Text className="font-bold">{o.sonrakiToplam}</Text>
                                                {o.sinirAltinaIner ? ' · sınırın altına iner' : ''}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => onUygula(o)}
                                                activeOpacity={0.8}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${o.baslik}: uygulayın`}
                                                className="flex-row items-center rounded-xl px-4"
                                                style={{ backgroundColor: renkler.birincil, minHeight: 44 }}
                                            >
                                                <FontAwesome5 name="check" size={12} color={renkler.birincilMetin} solid />
                                                <Text className="text-sm font-bold ml-2" style={{ color: renkler.birincilMetin }}>
                                                    Uygula
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        {ekYol && (ekleme || gosterilen.durum !== 'normal') && (
                            <TouchableOpacity
                                onPress={ekYol.onPress}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={ekYol.etiket}
                                className="flex-row items-center justify-center rounded-xl border mt-1"
                                style={{ borderColor: renkler.sinir, minHeight: 44 }}
                            >
                                <FontAwesome5 name="shield-alt" size={13} color={renkler.birincil} solid />
                                <Text className="text-sm font-semibold ml-2" style={{ color: renkler.birincil }}>
                                    {ekYol.etiket}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <View className="px-5">
                        <TouchableOpacity
                            onPress={onKapat}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={ekleme ? 'Vazgeç' : 'Kapat'}
                            className="items-center justify-center rounded-xl border"
                            style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir, minHeight: 48 }}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                {ekleme ? 'Vazgeç' : 'Kapat'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
