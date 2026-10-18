/**
 * SESLİ OKUMA METNİ EDİTÖRÜ — her hatırlatma yüzeyinde AYNI (birleşik hatırlatma modülü §3.4).
 *
 * Kullanıcı ne duyacağını yazar; yüzeye özgü GÜVENLİ yer tutucular çip olarak imlecin
 * olduğu yere eklenir (`PencereTanimi.anonsYerTutuculari` — takvimde etkinlik adı için çip
 * YOKTUR). Hazır cümleler + "Otomatik" ile başlanır; alttaki önizleme cümlenin GERÇEKTE nasıl
 * okunacağını gösterir ve "Dinle" ile duyulur (duymadan karar verdirmeyiz).
 *
 * BOŞ METİN yüzeye göre farklıdır (`tanim.bosMetinOtomatik`):
 *  - ek yüzey / nafile: boş = otomatik cümle → "Otomatik" kutuyu BOŞALTIR;
 *  - muhafız: boş = SESSİZ → "Otomatik" yön-uygun şablonu kutuya YAZAR (boş bırakmaz).
 *
 * Metin her tuşta değil düzenleme bitince yazılır (`onCommit`) — her karakterde tüm ayar
 * diske gitmesin. Çip/hazır cümle dokunuşu hemen yazar.
 */
import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { SeviyeAyari } from '../../../core/muhafiz/matrisTipleri';
import { kanalAcikMi } from '../../../core/muhafiz/kanalKumesi';
import { ANONS_METIN_UST_SINIRI } from '../../../core/muhafiz/ios/anonsKlibi';
import { varsayilanAnonsMetni } from '../../../core/muhafiz/anonsMetni';
import { anonsMetniDoluMu } from '../../../core/hatirlatma/anonsYerTutucu';
import { DinleButonu } from './AnonsBilesenleri';
import type { PencereTanimi } from './pencereTanimi';

export const OTOMATIK_ETIKETI = 'Otomatik';

/** Metni imlecin olduğu yere ekler (seçim varsa yerine yazar). SAF. */
export function imlecteEkle(metin: string, ek: string, secim: { start: number; end: number } | null): string {
    const bas = secim ? Math.max(0, Math.min(secim.start, metin.length)) : metin.length;
    const son = secim ? Math.max(bas, Math.min(secim.end, metin.length)) : metin.length;
    const once = metin.slice(0, bas);
    const sonra = metin.slice(son);
    const solBosluk = once.length > 0 && !/\s$/.test(once) ? ' ' : '';
    const sagBosluk = sonra.length > 0 && !/^[\s.,;:!?]/.test(sonra) ? ' ' : '';
    return `${once}${solBosluk}${ek}${sagBosluk}${sonra}`.slice(0, ANONS_METIN_UST_SINIRI);
}

/** Editörün küçük seçim çipi (≥44dp). */
const Cip: React.FC<{ etiket: string; secili?: boolean; onPress: () => void; erisim: string; ikon?: string }> = ({
        etiket,
        secili = false,
        onPress,
        erisim,
        ikon,
}) => {
    const renkler = useRenkler();
    return (
        <View style={{ paddingHorizontal: 3, paddingBottom: 6 }}>
            <TouchableOpacity
                className="flex-row px-3 rounded-xl border items-center justify-center"
                style={{
                    minHeight: 44,
                    backgroundColor: secili ? `${renkler.birincil}15` : renkler.kartArkaplan,
                    borderColor: secili ? renkler.birincil : renkler.sinir,
                }}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: secili }}
                accessibilityLabel={erisim}
            >
                {ikon && (
                    <FontAwesome5
                        name={ikon}
                        size={10}
                        color={secili ? renkler.birincil : renkler.metinIkincil}
                        style={{ marginRight: 6 }}
                        solid
                    />
                )}
                <Text className="text-xs" style={{ color: secili ? renkler.birincil : renkler.metin }}>
                    {etiket}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export interface AnonsMetniEditoruProps {
    tanim: PencereTanimi;
    seviye: SeviyeAyari;
    /** Kutudaki (henüz yazılmamış olabilir) metin. */
    taslak: string;
    onTaslak: (metin: string) => void;
    /** Metni ayara yazar (düzenleme bitince / çip / hazır cümle). */
    onCommit: (metin: string) => void;
}

export const AnonsMetniEditoru: React.FC<AnonsMetniEditoruProps> = ({ tanim, seviye, taslak, onTaslak, onCommit }) => {
    const renkler = useRenkler();
    const [secim, setSecim] = useState<{ start: number; end: number } | null>(null);
    const otomatikBos = tanim.bosMetinOtomatik;
    const otomatikMetin = otomatikBos ? '' : varsayilanAnonsMetni(tanim.yon);
    // Muhafızda "Otomatik" = ilk şablon → listede ikinci kez gösterilmez.
    const sablonlar = otomatikBos ? tanim.anonsSablonlari : tanim.anonsSablonlari.filter((s) => s !== otomatikMetin);
    const dolu = anonsMetniDoluMu(taslak);
    const okunacak = dolu
        ? tanim.anonsCoz(taslak, seviye)
        : otomatikBos
          ? tanim.otomatikAnons?.(seviye) ?? ''
          : '';
    const otomatikSecili = otomatikBos ? !dolu : taslak === otomatikMetin;

    const cipEkle = (anahtar: string) => {
        const yeni = imlecteEkle(taslak, anahtar, secim);
        onTaslak(yeni);
        onCommit(yeni);
    };
    const sablonSec = (sablon: string) => {
        onTaslak(sablon);
        onCommit(sablon);
    };

    // iOS'ta düzenlenemeyen yüzey (eski yapılandırma) — salt okunur örnek.
    if (!tanim.anonsMetniDuzenlenebilir) {
        return (
            <View testID="anons-ornegi" className="p-3 rounded-2xl mt-2" style={{ backgroundColor: `${renkler.birincil}10` }}>
                <Text className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: renkler.metinIkincil }}>
                    TELEFONUNUZ ŞÖYLE OKUR
                </Text>
                <View className="flex-row items-center">
                    <Text className="flex-1 text-sm pr-3" style={{ color: renkler.metin }}>
                        {okunacak}
                    </Text>
                    <DinleButonu
                        kanallar={seviye.kanallar}
                        bildirimSesi={seviye.bildirimSesi}
                        cozulmusMetin={okunacak}
                        erisimEtiketi="Örnek okunuşu dinleyin"
                    />
                </View>
            </View>
        );
    }

    return (
        <View testID="anons-metni-editoru" className="mt-2">
            <Text className="text-xs mb-1.5" style={{ color: renkler.metinIkincil }}>
                Telefonunuz şöyle okur:
            </Text>
            <TextInput
                value={taslak}
                onChangeText={onTaslak}
                onSelectionChange={(e) => setSecim(e.nativeEvent.selection)}
                onEndEditing={() => onCommit(taslak)}
                onBlur={() => onCommit(taslak)}
                // iOS bildirim sesi 30 sn'yi aşarsa HİÇ çalmaz; sınır iki platformda aynı.
                maxLength={ANONS_METIN_UST_SINIRI}
                multiline
                placeholder={otomatikBos ? `Boş bırakırsanız: ${tanim.otomatikAnons?.(seviye) ?? ''}` : tanim.anonsSablonlari[0]}
                placeholderTextColor={renkler.metinIkincil}
                accessibilityLabel="Sesli okuma metni"
                testID="anons-metni-kutusu"
                className="text-sm p-3.5 rounded-2xl border"
                style={{
                    backgroundColor: renkler.kartArkaplan,
                    borderColor: renkler.sinir,
                    color: renkler.metin,
                    minHeight: 80,
                    textAlignVertical: 'top',
                }}
            />

            {/* Yer tutucular — imlecin olduğu yere eklenir. */}
            <Text className="text-[11px] mt-2.5 mb-1" style={{ color: renkler.metinIkincil }}>
                Ekleyin:
            </Text>
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
                {tanim.anonsYerTutuculari.map((y) => (
                    <Cip
                        key={y.anahtar}
                        etiket={y.etiket}
                        ikon="plus"
                        onPress={() => cipEkle(y.anahtar)}
                        erisim={`Ekleyin: ${y.etiket}`}
                    />
                ))}
            </View>

            {/* Hazır cümleler — "Otomatik" ilk sırada. */}
            <Text className="text-[11px] mt-1 mb-1" style={{ color: renkler.metinIkincil }}>
                Hazır cümleler:
            </Text>
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
                <Cip
                    etiket={OTOMATIK_ETIKETI}
                    ikon="magic"
                    secili={otomatikSecili}
                    onPress={() => sablonSec(otomatikMetin)}
                    erisim={
                        otomatikBos
                            ? 'Otomatik cümle: hatırlatmanın kendi cümlesi okunur'
                            : `Otomatik cümle: ${otomatikMetin}`
                    }
                />
                {sablonlar.map((sablon) => (
                    <Cip
                        key={sablon}
                        etiket={sablon}
                        secili={taslak === sablon}
                        onPress={() => sablonSec(sablon)}
                        erisim={`Hazır cümle: ${sablon}`}
                    />
                ))}
            </View>

            {/* Gerçek okunuş + Dinle */}
            <View className="p-3 rounded-2xl mt-1" style={{ backgroundColor: `${renkler.birincil}10` }}>
                <Text className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: renkler.metinIkincil }}>
                    ÖRNEK OKUNUŞ
                </Text>
                {okunacak ? (
                    <View className="flex-row items-center">
                        <Text testID="anons-okunus" className="flex-1 text-sm pr-3" style={{ color: renkler.metin }}>
                            {okunacak}
                        </Text>
                        <DinleButonu
                            kanallar={seviye.kanallar}
                            bildirimSesi={seviye.bildirimSesi}
                            cozulmusMetin={okunacak}
                            erisimEtiketi={
                                kanalAcikMi(seviye.kanallar, 'bildirim')
                                    ? 'Bildirim sesini ve örnek okunuşu dinleyin'
                                    : 'Örnek okunuşu dinleyin'
                            }
                        />
                    </View>
                ) : (
                    <Text testID="anons-okunus" className="text-xs leading-4" style={{ color: renkler.metin }}>
                        {`Metin boş: bu hatırlatma sesli okumaz. “${OTOMATIK_ETIKETI}”e dokunarak bir cümle ekleyebilirsiniz.`}
                    </Text>
                )}
            </View>
            <Text className="text-[11px] mt-1.5 leading-4" style={{ color: renkler.metinIkincil }}>
                {otomatikBos
                    ? 'Boş bırakırsanız hatırlatmanın otomatik cümlesi okunur.'
                    : 'Boş bırakırsanız bu hatırlatma sesli okumaz.'}
                {tanim.anonsNotu ? ` ${tanim.anonsNotu}` : ''}
            </Text>
        </View>
    );
};
