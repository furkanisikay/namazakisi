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
 * İLK GÖRÜNÜM = ÇÖZÜLMÜŞ CÜMLE (persona çalışması 2026-10-19): kullanıcı önce telefonun
 * GERÇEKTE ne okuyacağını görür ("Öğle vakti çıkıyor, son 25 dakika.") + Dinle. Ham şablon
 * (`{vakit}`/`{süre}`) içeren kutu, çipler ve hazır cümleler "Metni değiştir" arkasındadır —
 * süslü parantezler "bunu mu okuyacak?" kaygısı yaratıyordu. Kullanıcının kendi yazdığı metin
 * varsa (otomatik/şablon değil) düzenleyici AÇIK başlar.
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
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

export const otomatikEtiketi = (): string => metin().hatirlatma.editor.otomatik;

/** Metni imlecin olduğu yere ekler (seçim varsa yerine yazar). SAF. */
export function imlecteEkle(metin: string, ek: string, secim: { start: number; end: number } | null): string {
    const bas = secim ? Math.max(0, Math.min(secim.start, metin.length)) : metin.length;
    const son = secim ? Math.max(bas, Math.min(secim.end, metin.length)) : metin.length;
    const once = metin.slice(0, bas);
    const sonra = metin.slice(son);
    const solBosluk = once.length > 0 && !/\s$/.test(once) ? ' ' : '';
    const sagBosluk = sonra.length > 0 && !/^[\s.,;:!?]/.test(sonra) ? ' ' : '';
    const yeni = `${once}${solBosluk}${ek}${sagBosluk}${sonra}`;
    // Sığmıyorsa HİÇ ekleme: kesmek yarım bir yer tutucu (`{sü`) bırakır, TTS onu okurdu.
    return yeni.length > ANONS_METIN_UST_SINIRI ? metin : yeni;
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
    const me = useMetin().hatirlatma.editor;
    const [secim, setSecim] = useState<{ start: number; end: number } | null>(null);
    const otomatikBos = tanim.bosMetinOtomatik;
    const otomatikMetin = otomatikBos ? '' : varsayilanAnonsMetni(tanim.yon);
    // Muhafızda "Otomatik" = ilk şablon → listede ikinci kez gösterilmez.
    const sablonlar = otomatikBos ? tanim.anonsSablonlari : tanim.anonsSablonlari.filter((s) => s !== otomatikMetin);
    const dolu = anonsMetniDoluMu(taslak);
    // Planlayıcıyla AYNI kural: çözüm boş kalırsa (ör. yalnız bilinmeyen yer tutucu) ek
    // yüzeyde otomatik cümle okunur; muhafızda boş = sessiz.
    const cozulmus = dolu ? tanim.anonsCoz(taslak, seviye) : '';
    const okunacak = cozulmus.length > 0 ? cozulmus : otomatikBos ? tanim.otomatikAnons?.(seviye) ?? '' : '';
    const otomatikSecili = otomatikBos ? !dolu : taslak === otomatikMetin;
    // Kullanıcının kendi yazdığı metin → düzenleyici açık başlar (gizlenmesin).
    const kendiMetni = dolu && taslak !== otomatikMetin && !tanim.anonsSablonlari.includes(taslak);
    const [duzenleAcik, setDuzenleAcik] = useState(kendiMetni);
    // Yer tutucusu ham şablon DEĞİL, bu adımda okunacak cümle.
    const ilkSablon = tanim.anonsSablonlari[0] ?? '';
    const yerTutucu = otomatikBos
        ? bicim(me.bosBirakirsaniz, { metin: tanim.otomatikAnons?.(seviye) ?? '' })
        : tanim.anonsCoz(ilkSablon, seviye) || ilkSablon;

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
                    {me.soyleOkur}
                </Text>
                <View className="flex-row items-center">
                    <Text className="flex-1 text-sm pr-3" style={{ color: renkler.metin }}>
                        {okunacak}
                    </Text>
                    <DinleButonu
                        kanallar={seviye.kanallar}
                        bildirimSesi={seviye.bildirimSesi}
                        cozulmusMetin={okunacak}
                        erisimEtiketi={me.ornekDinle}
                    />
                </View>
            </View>
        );
    }

    const okunusKutusu = (
        <View className="p-3 rounded-2xl" style={{ backgroundColor: `${renkler.birincil}10` }}>
            <Text className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: renkler.metinIkincil }}>
                {me.soyleOkur}
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
                                ? me.sesVeOrnekDinle
                                : me.ornekDinle
                        }
                    />
                </View>
            ) : (
                <Text testID="anons-okunus" className="text-xs leading-4" style={{ color: renkler.metin }}>
                    {me.metinBos}
                </Text>
            )}
        </View>
    );

    return (
        <View testID="anons-metni-editoru" className="mt-2">
            {okunusKutusu}

            <TouchableOpacity
                testID="anons-metni-degistir"
                className="flex-row items-center mt-1"
                style={{ minHeight: 44 }}
                onPress={() => setDuzenleAcik((a) => !a)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: duzenleAcik }}
                accessibilityLabel={me.degistirEtiketi}
            >
                <FontAwesome5 name="pen" size={11} color={renkler.birincil} style={{ marginRight: 8 }} solid />
                <Text className="text-xs font-semibold flex-1" style={{ color: renkler.birincil }}>
                    {me.degistir}
                </Text>
                <FontAwesome5 name={duzenleAcik ? 'chevron-up' : 'chevron-down'} size={11} color={renkler.metinIkincil} />
            </TouchableOpacity>

            {duzenleAcik && (
                <View testID="anons-metni-duzenleyici">
                    <TextInput
                        value={taslak}
                        onChangeText={onTaslak}
                        onSelectionChange={(e) => setSecim(e.nativeEvent.selection)}
                        onEndEditing={() => onCommit(taslak)}
                        onBlur={() => onCommit(taslak)}
                        // iOS bildirim sesi 30 sn'yi aşarsa HİÇ çalmaz; sınır iki platformda aynı.
                        maxLength={ANONS_METIN_UST_SINIRI}
                        multiline
                        placeholder={yerTutucu}
                        placeholderTextColor={renkler.metinIkincil}
                        accessibilityLabel={me.kutuEtiketi}
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
                        {me.ekleyin}
                    </Text>
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
                        {tanim.anonsYerTutuculari.map((y) => (
                            <Cip
                                key={y.anahtar}
                                etiket={y.etiket}
                                ikon="plus"
                                onPress={() => cipEkle(y.anahtar)}
                                erisim={bicim(me.ekleyinEtiketi, { etiket: y.etiket })}
                            />
                        ))}
                    </View>

                    {/* Hazır cümleler — "Otomatik" ilk sırada. */}
                    <Text className="text-[11px] mt-1 mb-1" style={{ color: renkler.metinIkincil }}>
                        {me.hazirCumleler}
                    </Text>
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
                        <Cip
                            etiket={me.otomatik}
                            ikon="magic"
                            secili={otomatikSecili}
                            onPress={() => sablonSec(otomatikMetin)}
                            erisim={
                                otomatikBos
                                    ? me.otomatikOtoEtiket
                                    : bicim(me.otomatikEtiket, { metin: tanim.anonsCoz(otomatikMetin, seviye) || otomatikMetin })
                            }
                        />
                        {sablonlar.map((sablon) => {
                            // Çipte ham yer tutucu ({süre}…) değil, bu adımda okunacak cümle görünür.
                            const gorunen = tanim.anonsCoz(sablon, seviye) || sablon;
                            return (
                                <Cip
                                    key={sablon}
                                    etiket={gorunen}
                                    secili={taslak === sablon}
                                    onPress={() => sablonSec(sablon)}
                                    erisim={bicim(me.hazirEtiket, { metin: gorunen })}
                                />
                            );
                        })}
                    </View>
                    <Text className="text-[11px] mt-1.5 leading-4" style={{ color: renkler.metinIkincil }}>
                        {otomatikBos
                            ? me.bosOtomatik
                            : me.bosSessiz}
                        {tanim.anonsNotu ? ` ${tanim.anonsNotu}` : ''}
                    </Text>
                </View>
            )}
        </View>
    );
};
