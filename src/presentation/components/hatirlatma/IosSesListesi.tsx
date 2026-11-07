/**
 * iPhone'un BİLDİRİM SESİ LİSTESİ — `SesSecimSatiri`'nın altında açılır (modal DEĞİL).
 *
 * iOS'ta sistem ses seçicisi yoktur; liste: varsayılan ses, uygulamanın sesleri
 * (`core/muhafiz/ios/paketSesleri.ts`), kullanıcının eklediği dosyalar ve "Kendi
 * dosyanızdan seçin". Satırın içinde açılır çünkü adım detayı zaten bir modaldır ve
 * iOS aynı anda iki kardeş modal sunamaz (AGENTS.md); ayrıca seçim tek dokunuşla biter.
 *
 * Her satır: seçim (radyo) + "dinle"; eklenen dosyada ayrıca "sil". Silinen dosyayı
 * kullanan HER kayıt varsayılana döner ve planlar yenilenir (`store/iosSesSilme`).
 * Listede olmayan dosya seçiliyse varsayılan seçili görünür (`cihazdaCalinirMi`).
 */
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { PAKET_SESLERI, dosyaSesKimligi, paketSesKimligi } from '../../../core/muhafiz/ios/paketSesleri';
import { cihazdaCalinirMi } from '../../../core/muhafiz/sesKimligi';
import type { IosSesSecimi } from '../../hooks/useIosSesSecimi';

export interface IosSesListesiProps {
    /** Şu an seçili kimlik (`varsayilan`, `paket:…`, `dosya:…`; başka platformun kimliği = varsayılan). */
    secili: string | undefined;
    /** Varsayılan sesin adı (muhafız: "Uygulama sesi"; vakit bildirimi: telefonun sesi). */
    varsayilanAdi: string;
    /** Varsayılan ses uygulama içinde dinlenebilir mi? (telefonun sesi dinletilemez) */
    varsayilanDinlenir?: boolean;
    /** `null` = varsayılan; `ad` yalnız eklenen dosyada (kullanıcının dosya adı). */
    onSec: (kimlik: string | null, ad?: string) => void;
    /** `null` = varsayılan sesi dinlet. */
    onDinle: (kimlik: string | null) => void;
    secim: IosSesSecimi;
    testID?: string;
}

interface Satir {
    kimlik: string | null;
    ad: string;
    dosyaAdi?: string;
    dinlenir: boolean;
    testID: string;
}

export const IosSesListesi: React.FC<IosSesListesiProps> = ({
    secili,
    varsayilanAdi,
    varsayilanDinlenir = true,
    onSec,
    onDinle,
    secim,
    testID = 'ios-ses-listesi',
}) => {
    const renkler = useRenkler();
    const ms = useMetin().hatirlatma.sesSecim;
    // Silinmiş dosya ya da başka platformun kimliği: varsayılan seçili görünür (çalan odur).
    const seciliKimlik = secili && cihazdaCalinirMi(secili) ? secili : null;

    const satirlar: Satir[] = [
        { kimlik: null, ad: varsayilanAdi, dinlenir: varsayilanDinlenir, testID: `${testID}-varsayilan` },
        ...PAKET_SESLERI.map((p) => ({
            kimlik: paketSesKimligi(p.ad),
            ad: ms.paket[p.ad],
            dinlenir: true,
            testID: `${testID}-paket-${p.ad}`,
        })),
        ...secim.dosyalar.map((d) => ({
            kimlik: dosyaSesKimligi(d.dosya),
            ad: d.ad || ms.kendiSesiniz,
            dosyaAdi: d.ad,
            dinlenir: true,
            testID: `${testID}-dosya-${d.dosya}`,
        })),
    ];

    // Seçili dosya silinince bu satır da varsayılana döner: `secim.sil` onu kullanan HER kaydı
    // (bu adım dahil) diskte varsayılana çevirip slice'ları tazeler — burada ayrıca yazılmaz.
    const sil = (kimlik: string) => secim.sil(kimlik);

    const ekle = async () => {
        const eklenen = await secim.ekle();
        if (eklenen) onSec(eklenen.kimlik, eklenen.ad);
    };

    return (
        <View testID={testID} style={{ marginTop: 6 }} accessibilityRole="radiogroup">
            {satirlar.map((s) => {
                const seciliMi = s.kimlik === seciliKimlik;
                return (
                    <View key={s.kimlik ?? 'varsayilan'} className="flex-row items-center">
                        <TouchableOpacity
                            testID={s.testID}
                            className="flex-row items-center flex-1 px-2 rounded-xl"
                            style={{ minHeight: 44 }}
                            onPress={() => onSec(s.kimlik, s.dosyaAdi)}
                            activeOpacity={0.7}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: seciliMi, selected: seciliMi }}
                            accessibilityLabel={s.ad}
                        >
                            <FontAwesome5
                                name={seciliMi ? 'check-circle' : 'circle'}
                                size={15}
                                solid={seciliMi}
                                color={seciliMi ? renkler.birincil : renkler.metinIkincil}
                                style={{ width: 20, textAlign: 'center', marginRight: 10 }}
                            />
                            <Text
                                numberOfLines={1}
                                className={seciliMi ? 'text-sm font-semibold flex-1' : 'text-sm flex-1'}
                                style={{ color: renkler.metin }}
                            >
                                {s.ad}
                            </Text>
                        </TouchableOpacity>
                        {s.dinlenir ? (
                            <TouchableOpacity
                                testID={`${s.testID}-dinle`}
                                className="w-11 h-11 items-center justify-center rounded-xl"
                                onPress={() => onDinle(s.kimlik)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={bicim(ms.ornekDinleErisim, { ad: s.ad })}
                            >
                                <FontAwesome5 name="play" size={11} color={renkler.birincil} solid />
                            </TouchableOpacity>
                        ) : null}
                        {s.dosyaAdi !== undefined && s.kimlik ? (
                            <TouchableOpacity
                                testID={`${s.testID}-sil`}
                                className="w-11 h-11 items-center justify-center rounded-xl"
                                onPress={() => void sil(s.kimlik!)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={bicim(ms.silErisim, { ad: s.ad })}
                            >
                                <FontAwesome5 name="trash-alt" size={12} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                );
            })}

            {secim.destekleniyor ? (
                <TouchableOpacity
                    testID={`${testID}-dosya-ekle`}
                    className="flex-row items-center px-2 rounded-xl"
                    style={{ minHeight: 44, opacity: secim.ekleniyor ? 0.6 : 1 }}
                    onPress={() => void ekle()}
                    disabled={secim.ekleniyor}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: secim.ekleniyor }}
                    accessibilityLabel={secim.ekleniyor ? ms.ekleniyorErisim : ms.dosyadan}
                    accessibilityHint={ms.uzunlukNotu}
                >
                    <FontAwesome5
                        name="folder-open"
                        size={13}
                        color={renkler.birincil}
                        style={{ width: 20, textAlign: 'center', marginRight: 10 }}
                    />
                    <View style={{ flexShrink: 1 }}>
                        <Text className="text-sm" style={{ color: renkler.birincil }}>
                            {secim.ekleniyor ? ms.ekleniyor : ms.dosyadan}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {ms.uzunlukNotu}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};
