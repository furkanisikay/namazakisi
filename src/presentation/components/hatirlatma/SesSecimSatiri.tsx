/**
 * Bildirim sesi secimi — TEK SATIR (eski 3 cipli sahte palet yerine).
 *
 * NEDEN TEK SATIR: eski palet uc isim ('Çan'/'Melodi'/'Alarm') gosteriyordu ama
 * ucu de AYNI dosyaya cozuluyordu; kullanici "Melodi" secince "Çan" duyuyordu.
 * Artik secim sistem ses secicisine devrediliyor (kullanicinin KENDI muzikleri
 * dahil), bu yuzden sabit bir grid'in anlami kalmadi: gosterilecek tek sey
 * "su an hangi ses secili"dir.
 *
 * MIKRO GECIS: secici kapandiginda yeni ad satira yumusak bir gecisle yerlesir.
 * Ekranin IMZA OGESI artik bu satir degil `ZamanSeridi`dir (AGENTS.md: "cesareti
 * tek imza ogesinde harca"); bu gecis olay-tetiklemeli ve modal icinde oldugu
 * icin seritle ayni anda hic gorunmez.
 */
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { YonluIkon } from '../common/YonluIkon';
import { useRenkler } from '../../../core/theme';
import { ozelSesMi, sesGorunenAdi } from '../../../core/muhafiz/sesKimligi';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/** Satırın altındaki/açılır listedeki ikincil eylem. */
interface Eylem {
    ikon: string;
    etiket: string;
    erisimEtiketi: string;
    ipucu?: string;
    onPress: () => void;
    testID?: string;
}

export interface SesSecimSatiriProps {
    /** `varsayilan` ya da `content://...` */
    bildirimSesi: string;
    /** Kayitli gorunen ad (yoksa kibar yedek metin gosterilir) */
    sesAdi?: string;
    /**
     * Secici acilmayi bekliyor mu? Ust uste dokunusa karsi satir kilitlenir —
     * native taraf ayni anda yalniz TEK secici acabilir, ikinci cagri reddedilir.
     */
    seciliyor?: boolean;
    /** Sistem ses secicisini acar */
    onSec: () => void;
    /** Secili sesi calar */
    onDinle: () => void;
    /**
     * "Kendi dosyanizdan secin" (Android 10+; SAF → MediaStore). Verilmezse secenek
     * cizilmez. Ornegin bir ezan kaydi buradan eklenir.
     */
    onDosyadanSec?: () => void;
    /** Dosya ice aktariliyor mu? (satir ve secenek kilitlenir) */
    dosyaAktariliyor?: boolean;
    /** Ozel ses seciliyken varsayilana donus. Verilmezse secenek cizilmez. */
    onVarsayilanaDon?: () => void;
    /** Varsayilan sesin gorunen adi (muhafiz: "Uygulama sesi"; vakit bildirimi: telefonun sesi). */
    varsayilanAdi?: string;
    /** Varsayilana donus eyleminin metni (varsayilan: "Uygulama sesine dön"). */
    varsayilanaDonEtiketi?: string;
    /**
     * KOMPAKT: liste icinde (vakit basina) kucuk satir. Dokunus sistem secicisini
     * DOGRUDAN acmaz; secenekleri (telefonun sesleri / kendi dosyaniz / varsayilan)
     * satirin altinda acar — ilk gorunum tek satir kalir.
     */
    kompakt?: boolean;
    /** Erisilebilirlik etiketinin basi (ayni ekranda birden cok satir varsa AYIRT EDICI olmali). */
    sesEtiketi?: string;
    testID?: string;
}

export const SesSecimSatiri: React.FC<SesSecimSatiriProps> = ({
    bildirimSesi,
    sesAdi,
    seciliyor = false,
    onSec,
    onDinle,
    onDosyadanSec,
    dosyaAktariliyor = false,
    onVarsayilanaDon,
    varsayilanAdi,
    varsayilanaDonEtiketi: varsayilanaDonEtiketiProp,
    kompakt = false,
    sesEtiketi: sesEtiketiProp,
    testID,
}) => {
    const renkler = useRenkler();
    const ms = useMetin().hatirlatma.sesSecim;
    const varsayilanaDonEtiketi = varsayilanaDonEtiketiProp ?? ms.varsayilanaDon;
    const sesEtiketi = sesEtiketiProp ?? ms.sesEtiketi;
    const ozelMi = ozelSesMi(bildirimSesi);
    const ad = !ozelMi && varsayilanAdi ? varsayilanAdi : sesGorunenAdi(bildirimSesi, sesAdi);
    const mesgul = seciliyor || dosyaAktariliyor;
    const [acik, setAcik] = useState(false);

    const eylemler: Eylem[] = [];
    if (kompakt) {
        eylemler.push({
            ikon: 'bell',
            etiket: ms.telefonSesleri,
            erisimEtiketi: bicim(ms.telefonSesleriErisim, { ses: sesEtiketi }),
            onPress: () => {
                setAcik(false);
                onSec();
            },
            testID: testID ? `${testID}-sistem` : undefined,
        });
    }
    if (onDosyadanSec) {
        eylemler.push({
            ikon: 'folder-open',
            etiket: ms.dosyadan,
            erisimEtiketi: bicim(ms.dosyadanErisim, { ses: sesEtiketi }),
            ipucu: ms.dosyaIpucu,
            onPress: () => {
                setAcik(false);
                onDosyadanSec();
            },
            testID: testID ? `${testID}-dosya` : 'ses-dosyadan-sec',
        });
    }
    if (onVarsayilanaDon && ozelMi) {
        eylemler.push({
            ikon: 'undo',
            etiket: varsayilanaDonEtiketi,
            erisimEtiketi: bicim(ms.donErisim, { etiket: varsayilanaDonEtiketi }),
            onPress: () => {
                setAcik(false);
                onVarsayilanaDon();
            },
            testID: testID ? `${testID}-varsayilan` : undefined,
        });
    }

    // Ad degisince yumusak gecis: hafif yukari kayma + fade.
    const [gosterilenAd, setGosterilenAd] = useState(ad);
    const canlandirma = useRef(new Animated.Value(1)).current;
    const oncekiAd = useRef(ad);

    useEffect(() => {
        if (oncekiAd.current === ad) return;
        oncekiAd.current = ad;
        setGosterilenAd(ad);
        canlandirma.setValue(0);
        Animated.timing(canlandirma, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [ad, canlandirma]);

    const eylemListesi = (
        <View style={kompakt ? { marginTop: 6 } : { marginTop: 4 }}>
            {eylemler.map((e) => (
                <TouchableOpacity
                    key={e.etiket}
                    testID={e.testID}
                    className={
                        kompakt
                            ? 'flex-row items-center px-3 rounded-xl'
                            : 'flex-row items-center justify-center px-3 rounded-xl'
                    }
                    style={{ minHeight: 44, opacity: mesgul ? 0.6 : 1 }}
                    onPress={e.onPress}
                    disabled={mesgul}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: mesgul }}
                    accessibilityLabel={e.erisimEtiketi}
                    accessibilityHint={e.ipucu}
                >
                    <FontAwesome5
                        name={e.ikon}
                        size={kompakt ? 13 : 11}
                        color={kompakt ? renkler.birincil : renkler.metinIkincil}
                        style={{ marginRight: 8, width: 16, textAlign: 'center' }}
                    />
                    <Text
                        className={kompakt ? 'text-sm' : 'text-xs font-medium'}
                        style={{ color: kompakt ? renkler.metin : renkler.metinIkincil }}
                    >
                        {e.etiket}
                    </Text>
                    {kompakt && e.ipucu ? (
                        <Text className="text-xs ml-2" style={{ color: renkler.metinIkincil, flexShrink: 1 }}>
                            {e.ipucu}
                        </Text>
                    ) : null}
                </TouchableOpacity>
            ))}
        </View>
    );

    if (kompakt) {
        return (
            <View testID={testID}>
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="flex-row items-center flex-1"
                        style={{ minHeight: 44, opacity: mesgul ? 0.6 : 1 }}
                        onPress={() => setAcik((a) => !a)}
                        disabled={mesgul}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: mesgul, expanded: acik }}
                        accessibilityLabel={
                            mesgul
                                ? ms.ekleniyorErisim
                                : bicim(ms.degistirErisim, { ses: sesEtiketi, ad })
                        }
                    >
                        <FontAwesome5
                            name={ozelMi ? 'music' : 'volume-up'}
                            size={12}
                            color={renkler.metinIkincil}
                            style={{ width: 18, textAlign: 'center', marginRight: 8 }}
                            solid
                        />
                        <Animated.Text
                            numberOfLines={1}
                            className="text-sm flex-1"
                            style={{
                                color: renkler.metinIkincil,
                                opacity: canlandirma,
                                transform: [
                                    {
                                        translateY: canlandirma.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [6, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            {mesgul ? ms.ekleniyor : gosterilenAd}
                        </Animated.Text>
                        <FontAwesome5
                            name={acik ? 'chevron-up' : 'chevron-down'}
                            size={11}
                            color={renkler.metinIkincil}
                            style={{ marginHorizontal: 8 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-11 h-11 items-center justify-center rounded-xl"
                        onPress={onDinle}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={bicim(ms.dinleErisim, { ses: sesEtiketi })}
                    >
                        <FontAwesome5 name="play" size={11} color={renkler.birincil} solid />
                    </TouchableOpacity>
                </View>
                {acik ? eylemListesi : null}
            </View>
        );
    }

    return (
        <View>
            <View
                className="flex-row items-center p-3 rounded-2xl border"
                style={{
                    backgroundColor: renkler.arkaplan,
                    borderColor: renkler.sinir,
                }}
            >
                {/* Secime goturen ana dokunma hedefi (satirin govdesi) */}
                <TouchableOpacity
                    className="flex-row items-center flex-1"
                    style={{ minHeight: 44, opacity: mesgul ? 0.6 : 1 }}
                    onPress={onSec}
                    disabled={mesgul}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: seciliyor }}
                    accessibilityLabel={
                        seciliyor
                            ? ms.aciliyorErisim
                            : bicim(ms.degistirErisim, { ses: ms.sesEtiketi, ad })
                    }
                >
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${renkler.birincil}20` }}
                    >
                        <FontAwesome5
                            name={ozelMi ? 'music' : 'bell'}
                            size={16}
                            color={renkler.birincil}
                            solid
                        />
                    </View>
                    <View className="flex-1 pr-2">
                        <Animated.Text
                            numberOfLines={1}
                            className="text-sm font-semibold"
                            style={{
                                color: renkler.metin,
                                opacity: canlandirma,
                                transform: [
                                    {
                                        translateY: canlandirma.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [6, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            {gosterilenAd}
                        </Animated.Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {seciliyor
                                ? ms.aciliyor
                                : ozelMi
                                  ? ms.kendiSesiniz
                                  : ms.dokunarak}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-11 h-11 items-center justify-center rounded-xl border mr-1.5"
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderColor: renkler.sinir,
                    }}
                    onPress={onDinle}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={ms.seciliDinle}
                >
                    <FontAwesome5 name="play" size={12} color={renkler.birincil} solid />
                </TouchableOpacity>

                <YonluIkon name="chevron-right" size={13} color={renkler.metinIkincil} />
            </View>
            {eylemler.length > 0 ? eylemListesi : null}
        </View>
    );
};
