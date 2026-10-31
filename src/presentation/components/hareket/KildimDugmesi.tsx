/**
 * Ana ekran vakit kartının "Kıldım" düğmesi — eski kartın görünümü, dönüşerek.
 *
 * Görünüm eski karttaki gibidir: tam genişlik, köşeleri yuvarlak dolu düğme; kılınmamışken
 * birincil renkte "🙏 Kılındı olarak işaretle", kılınmışken yeşil "✓ Kılındı". ✓ düğmenin
 * İÇİNDE, metnin yanında ortalı durur (Dalga 2'nin "daire sola kayar, yazı zeminsiz kalır"
 * son karesi sahibin geri bildirimiyle kaldırıldı).
 *
 * Geçiş (motion-choreography "süreklilik" — düğme kaybolmaz, kendisi dönüşür), ~700 ms:
 *   1. hazırlık (180 ms): eski içerik yukarı kayarak söner, zemin yeşile döner (iki hap
 *      katmanı arasında opaklık çaprazı; `backgroundColor` native driver'da animasyonlanamaz);
 *   2. eylem (yay): ✓ ikonun yerinde yayla oturur, çevresinde halka BİR KEZ açılıp söner;
 *   3. sonuç: "Kılındı" (ana ekranda kılınan namazın duası, `kilindiMetni`) aşağıdan gelir ve
 *      öyle KALIR. Sahip isteği: "Kılındı / Tamamlandı" yerine "Allah kabul etsin".
 * Geri almada (kılındı → kılınmadı) aynı yol kısaltılmış süreyle tersine oynar, halka yok.
 *
 * Kurallar: yalnız transform + opaklık (native driver). Animasyon YALNIZ gerçek geçişte
 * oynar — ilk çizimde ve `kimlik` (vakit/gün) değiştiğinde değer son karesine ATLAR: ana
 * ekran saniyede bir çizilir, vakit değişince (öğle kılındı → ikindi kılınmadı) ters geçiş
 * oynasaydı kullanıcı geri alma yaptığını sanardı. "Animasyonları azalt" açıksa son kare.
 * Bilgi hareketle sınırlı değildir: metin değişir ve ekran okuyucuya duyurulur.
 */
import * as React from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { EGRI, SURE, YAY } from './sureler';
import { NAMAZ_EYLEMI } from '../../../core/vakit/durumSozlugu';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { kildimDugmesiRenkleri } from '../../../core/anaEkran/kildimDugmesiRenkleri';

export const KILDIM_DUGMESI_YUKSEKLIK = 56;
const IKON = 20;

// Metinler sözlükte (`vakit.isaretle`, `vakit.geriAlEtiketi`, `vakit.geriAlindi`): kılınmamışken
// düğmede yazan, kılınmışken (geri alınabilirse) ekran okuyucu etiketi ve geri almada duyurulan.

export interface KildimDugmesiProps {
    kilindi: boolean;
    /** Kılınmamışken dokununca. */
    onKildim: () => void;
    /** Kılınmışken dokununca (geri alma); verilmezse kılınmış düğme dokunulmaz. */
    onGeriAl?: () => void;
    /** Ekran okuyucu etiketine eklenir: "Öğle — Kılındı olarak işaretle". */
    vakitAdi?: string;
    /**
     * Kılınmışken düğmede yazan. Ana ekranda kılınan namazın duası ("Allah kabul etsin" —
     * `core/samimiyet/kabulDuasi`); verilmezse durum adı "Kılındı". Ekran okuyucu her durumda
     * önce DURUMU duyar ("Kılındı. Allah kabul etsin"): dua durum bilgisinin yerine geçmez.
     */
    kilindiMetni?: string;
    /**
     * Gösterilen kaydın kimliği (ör. "<gün>_<vakit>"). Değişirse durum değişimi animasyonsuz
     * uygulanır: yeni vakit/gün gerçek bir işaretleme değildir.
     */
    kimlik?: string;
    devreDisi?: boolean;
    testID?: string;
}

export const KildimDugmesi: React.FC<KildimDugmesiProps> = React.memo(function KildimDugmesi({
    kilindi,
    onKildim,
    onGeriAl,
    vakitAdi,
    kilindiMetni = NAMAZ_EYLEMI.kilindi,
    kimlik,
    devreDisi = false,
    testID,
}) {
    const renkler = useRenkler();
    const m = useMetin().vakit;
    const azalt = useHareketAzalt();
    const baslangic = kilindi ? 1 : 0;
    /** Zemin + metin çaprazı (0 = kılınmadı, 1 = kılındı). */
    const gecis = React.useRef(new Animated.Value(baslangic)).current;
    /** ✓ ölçeği (yay). */
    const isaret = React.useRef(new Animated.Value(baslangic)).current;
    /** Halka: 0 → 1 bir kez; dinlenmede 0 (görünmez). */
    const halka = React.useRef(new Animated.Value(0)).current;
    const onceki = React.useRef({ kilindi, kimlik });
    // "Kılındı" ya da "Kılındı. Allah kabul etsin" — durum önce, dua sonra.
    const kilindiDuyurusu =
        kilindiMetni === NAMAZ_EYLEMI.kilindi ? NAMAZ_EYLEMI.kilindi : `${NAMAZ_EYLEMI.kilindi}. ${kilindiMetni}`;

    React.useEffect(() => {
        const eski = onceki.current;
        onceki.current = { kilindi, kimlik };
        if (eski.kilindi === kilindi) return;
        const hedef = kilindi ? 1 : 0;
        const gercekGecis = eski.kimlik === kimlik;
        if (!gercekGecis || azalt) {
            gecis.setValue(hedef);
            isaret.setValue(hedef);
            halka.setValue(0);
            if (gercekGecis) {
                AccessibilityInfo.announceForAccessibility?.(kilindi ? kilindiDuyurusu : metin().vakit.geriAlindi);
            }
            return;
        }
        if (kilindi) {
            isaret.setValue(0);
            halka.setValue(0);
            Animated.sequence([
                Animated.timing(gecis, { toValue: 1, duration: SURE.buzulme, easing: EGRI.giris, useNativeDriver: true }),
                Animated.parallel([
                    Animated.spring(isaret, { toValue: 1, ...YAY }),
                    Animated.timing(halka, { toValue: 1, duration: SURE.halka, easing: EGRI.giris, useNativeDriver: true }),
                ]),
            ]).start(() => halka.setValue(0));
            AccessibilityInfo.announceForAccessibility?.(kilindiDuyurusu);
        } else {
            halka.setValue(0);
            Animated.sequence([
                Animated.timing(isaret, { toValue: 0, duration: SURE.durum, easing: EGRI.cikis, useNativeDriver: true }),
                Animated.timing(gecis, { toValue: 0, duration: SURE.buzulme, easing: EGRI.giris, useNativeDriver: true }),
            ]).start();
            AccessibilityInfo.announceForAccessibility?.(metin().vakit.geriAlindi);
        }
    // kilindiDuyurusu bağımlılık DEĞİL: dua metni gün/vakitle değişir, geçiş tetiklemez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kilindi, kimlik, azalt, gecis, isaret, halka]);

    const dokunulabilir = !devreDisi && (!kilindi || !!onGeriAl);
    // Etiket DURUMU söyler; kılınmış ve geri alınabilirse ne olacağını da (ipucu kapalı olabilir).
    const durumMetni = !kilindi
        ? m.isaretle
        : onGeriAl
          ? bicim(m.geriAlEtiketi, { durum: kilindiDuyurusu })
          : kilindiDuyurusu;
    const etiket = vakitAdi ? `${vakitAdi} — ${durumMetni}` : durumMetni;
    // Metin rengi zemine göre ÖLÇÜLÜR (beyaz yeşil/turuncu zeminde AA'yı tutmaz).
    const { isaretleMetin, kilindiMetin } = kildimDugmesiRenkleri({
        birincil: renkler.birincil,
        basarili: renkler.basarili,
        metinIkincil: renkler.metinIkincil,
        birincilMetin: renkler.birincilMetin,
    });

    return (
        <TouchableOpacity
            testID={testID}
            onPress={kilindi ? onGeriAl : onKildim}
            disabled={!dokunulabilir}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            accessibilityState={{ checked: kilindi, disabled: !dokunulabilir }}
            style={[styles.kap, devreDisi && !kilindi ? { opacity: 0.5 } : null]}
        >
            {/* Zemin: birincil hap, üstünde yeşil hap opaklıkla gelir. */}
            <View style={[StyleSheet.absoluteFill, styles.hap, { backgroundColor: renkler.birincil }]} />
            <Animated.View
                style={[StyleSheet.absoluteFill, styles.hap, { backgroundColor: renkler.basarili, opacity: gecis }]}
            />

            {/* Kılınmamış içerik: yukarı kayarak söner. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.ortala,
                    {
                        opacity: gecis.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
                        transform: [{ translateY: gecis.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
                    },
                ]}
            >
                <FontAwesome5 name="pray" size={IKON} color={isaretleMetin} />
                {/* Düğme sabit yükseklikli (56 dp): uzun dilde en çok iki satır ve sığana kadar
                    küçülür; flexShrink genişliği sınırlar (yoksa ortalanan metin ikonu dışarı iter). */}
                <Text
                    testID={testID ? `${testID}-metin` : undefined}
                    style={[styles.yazi, styles.esnekYazi, { color: isaretleMetin }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                >
                    {m.isaretle}
                </Text>
            </Animated.View>

            {/* Kılınmış içerik: ✓ yayla oturur (halka bir kez), "Kılındı" aşağıdan gelir. */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.ortala,
                    {
                        opacity: gecis.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
                        transform: [{ translateY: gecis.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                    },
                ]}
            >
                <View style={styles.ikonKutusu}>
                    <Animated.View
                        style={[
                            styles.halka,
                            {
                                borderColor: kilindiMetin,
                                opacity: halka.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.7, 0] }),
                                transform: [{ scale: halka.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={{
                            transform: [
                                { scale: isaret.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                                { rotate: isaret.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) },
                            ],
                        }}
                    >
                        <FontAwesome5 name="check-circle" size={IKON} color={kilindiMetin} solid />
                    </Animated.View>
                </View>
                <Text style={[styles.yazi, styles.esnekYazi, { color: kilindiMetin }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {kilindiMetni}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    kap: { height: KILDIM_DUGMESI_YUKSEKLIK, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' },
    hap: { borderRadius: 16 },
    ortala: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
    },
    ikonKutusu: { width: IKON + 4, height: IKON + 4, alignItems: 'center', justifyContent: 'center' },
    halka: {
        position: 'absolute',
        width: IKON + 4,
        height: IKON + 4,
        borderRadius: (IKON + 4) / 2,
        borderWidth: 2,
    },
    yazi: { fontSize: 18, fontWeight: '700' },
    esnekYazi: { flexShrink: 1, textAlign: 'center' },
});

/** Test/kanıt için: ileri sahne kaç ms sürer (yay hariç tahmini). */
export const KILDIM_SAHNE_SURESI_MS = SURE.buzulme + SURE.halka;
