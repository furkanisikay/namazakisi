/**
 * CANLI MİNİ ÖNİZLEME — adım detayının imza öğesi: "Telefonunuz böyle uyaracak".
 *
 * Kullanıcı bir anahtarı çevirdikçe kart da değişir: bildirim kartı taklidi (başlık +
 * gövde, yüzeyin GERÇEK metin üreticisinden — `adimOnizlemeIcerigi`), sesli okuma
 * açıksa okunacak cümle, sağ üstte kanalların ikonları. Bir kanal AÇILDIĞINDA ikonu bir
 * kez canlanır: titreşim sallanır, alarm çalar gibi sağa sola yatar, diğerleri yaylanır.
 * Boşta hareket yok. Karta dokunmak adımı gerçekte nasıl duyulacaksa öyle çalar
 * (`adimiOnizle`, "Dinle" ile aynı yol); duyulacak bir şey yoksa kart dokunulmaz.
 *
 * Gerçek bildirim GÖNDERMEZ.
 */
import * as React from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { YAY } from '../hareket/sureler';
import type { OzetKanali } from '../../../core/muhafiz/seviyeOzeti';
import type { UyariKanallari } from '../../../core/muhafiz/matrisTipleri';
import { bildirimSesiGerekliMi, sesliAnonsGerekliMi } from '../../../core/muhafiz/motorAdaptoru';
import { adimiOnizle } from '../../../domain/services/AnonsOnizlemeServisi';
import { KANAL_IKONLARI } from './OzetCipleri';
import type { AdimOnizlemeIcerigi } from './pencereTanimi';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';


/** Kanal açıldığında bir kez oynayan ikon hareketi. */
const KanalIkonu: React.FC<{ kanal: OzetKanali; renk: string; canlan: boolean }> = ({ kanal, renk, canlan }) => {
    const azalt = useHareketAzalt();
    const deger = React.useRef(new Animated.Value(canlan ? 0 : 1)).current;
    React.useEffect(() => {
        if (!canlan || azalt) {
            deger.setValue(1);
            return;
        }
        const a =
            kanal === 'titresim' || kanal === 'alarm'
                ? Animated.timing(deger, { toValue: 1, duration: 420, easing: Easing.linear, useNativeDriver: true })
                : Animated.spring(deger, { toValue: 1, ...YAY });
        a.start();
        return () => a.stop();
        // Yalnız doğuşta (kanal açıldığı an).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sallanma =
        kanal === 'titresim'
            ? [{ translateX: deger.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -3, 3, -2, 2, 0] }) }]
            : kanal === 'alarm'
              ? [
                    {
                        rotate: deger.interpolate({
                            inputRange: [0, 0.25, 0.5, 0.75, 1],
                            outputRange: ['0deg', '-16deg', '14deg', '-8deg', '0deg'],
                        }),
                    },
                ]
              : [{ scale: deger.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }];

    return (
        <Animated.View
            className="items-center justify-center"
            style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: `${renk}20`,
                opacity: kanal === 'titresim' || kanal === 'alarm' ? 1 : deger,
                transform: sallanma,
            }}
        >
            <FontAwesome5 name={KANAL_IKONLARI[kanal]} size={11} color={renk} solid />
        </Animated.View>
    );
};

export interface AdimOnizlemeKartiProps {
    icerik: AdimOnizlemeIcerigi;
    kanallar: UyariKanallari;
    /** Ekranda gösterilecek kanallar (gösterim sırasında). */
    ozetKanallari: readonly OzetKanali[];
    bildirimSesi: string;
    renk: string;
    /** Pencere ikonu (uygulama simgesi yerine). */
    ikon: string;
    /** Uyarının bugünkü saati ("13:52"); bilinmiyorsa yazılmaz. */
    saat?: string | null;
    /** Kartın altındaki tek satırlık not (ör. acil tonun Rahatsız Etmeyin davranışı). */
    not?: string;
}

export const AdimOnizlemeKarti: React.FC<AdimOnizlemeKartiProps> = ({
    icerik,
    kanallar,
    ozetKanallari,
    bildirimSesi,
    renk,
    ikon,
    saat,
    not,
}) => {
    const renkler = useRenkler();
    const marka = useMetin().ortak.marka;
    const mo = useMetin().hatirlatma;
    const YALNIZ_SESLI_METNI = mo.onizlemeKart.yalnizSesli;
    // İlk çizimde ikonlar sakin doğar; sonradan AÇILAN kanalın ikonu canlanır.
    const ilkCizim = React.useRef(true);
    React.useEffect(() => {
        ilkCizim.current = false;
    }, []);

    const bildirimVar = ozetKanallari.includes('bildirim');
    const anons = icerik.anons;
    const anonsCalar = sesliAnonsGerekliMi(kanallar) && !!anons;
    const sesCalar = bildirimSesiGerekliMi(kanallar);
    const dinlenebilir = anonsCalar || sesCalar;
    const dinleIkonu = anonsCalar && sesCalar ? 'bullhorn' : anonsCalar ? 'volume-up' : 'bell';

    const govde = (
        <View
            className="rounded-2xl p-3"
            style={{
                backgroundColor: renkler.arkaplan,
                borderWidth: 1,
                borderColor: renkler.sinir,
            }}
        >
            {/* Bildirim başlığı satırı: uygulama + saat, sağda kanallar */}
            <View className="flex-row items-center">
                <View
                    className="items-center justify-center mr-2"
                    style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: renkler.birincil }}
                >
                    <FontAwesome5 name={ikon} size={10} color="#FFFFFF" solid />
                </View>
                <Text className="text-[11px] font-semibold" style={{ color: renkler.metinIkincil }}>
                    {marka}{saat ? `  ${saat}` : ''}
                </Text>
                <View className="flex-1" />
                <View className="flex-row" style={{ gap: 4 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                    {ozetKanallari.map((k) => (
                        <KanalIkonu key={k} kanal={k} renk={renk} canlan={!ilkCizim.current} />
                    ))}
                </View>
            </View>

            {bildirimVar ? (
                <>
                    <Text className="text-sm font-semibold mt-2" style={{ color: renkler.metin }} numberOfLines={2}>
                        {icerik.baslik}
                    </Text>
                    <Text className="text-xs mt-0.5 leading-4" style={{ color: renkler.metinIkincil }} numberOfLines={2}>
                        {icerik.govde}
                    </Text>
                </>
            ) : (
                <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                    {YALNIZ_SESLI_METNI}
                </Text>
            )}

            {anons && (
                <View className="flex-row items-start mt-2.5 p-2.5 rounded-xl" style={{ backgroundColor: `${renk}12` }}>
                    <FontAwesome5 name="volume-up" size={11} color={renk} solid style={{ marginRight: 7, marginTop: 2 }} />
                    <Text className="flex-1 text-xs leading-4" style={{ color: renkler.metin }} numberOfLines={3}>
                        {anons}
                    </Text>
                </View>
            )}

            {dinlenebilir && (
                <View className="flex-row items-center justify-end mt-2">
                    <FontAwesome5 name={dinleIkonu} size={10} color={renkler.birincil} solid style={{ marginRight: 6 }} />
                    <Text className="text-xs font-semibold" style={{ color: renkler.birincil }}>
                        {mo.akis.dinle}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <View testID="adim-onizleme">
            <Text className="text-xs mb-1.5" style={{ color: renkler.metinIkincil }}>
                {mo.onizlemeKart.boyleUyaracak}
            </Text>
            {dinlenebilir ? (
                <TouchableOpacity
                    onPress={() => {
                        void adimiOnizle({ kanallar, bildirimSesi, cozulmusMetin: anonsCalar ? (anons ?? '') : '' });
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={bicim(mo.onizlemeKart.dinleEtiketi, {
                        metin: `${bildirimVar ? `${icerik.baslik}. ` : ''}${anons ?? ''}`,
                    }).trim()}
                    testID="adim-onizleme-dinle"
                >
                    {govde}
                </TouchableOpacity>
            ) : (
                <View accessible accessibilityLabel={bildirimVar ? `${icerik.baslik}. ${icerik.govde}` : YALNIZ_SESLI_METNI}>
                    {govde}
                </View>
            )}
            {!!not && (
                <Text className="text-[11px] mt-1.5 leading-4" style={{ color: renkler.metinIkincil }}>
                    {not}
                </Text>
            )}
        </View>
    );
};
