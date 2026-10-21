/**
 * "Nasıl" bölümünün KANAL KARTI — kanal + KENDİ alt ayarları tek kartta (ilerleyen açıklama).
 *
 * Neden (sahip sorusu 2026-10, persona değerlendirmesi): eski 2 sütunlu karo ızgarasında
 * Bildirim anahtarı yukarıda, onun sesi ("Uygulama sesi" satırı) aşağıda ayrı duruyordu;
 * sebep-sonuç kopuktu. Büyük puntoda (P1) yarım genişlikteki karo etiketi de kırılıyordu.
 * Şimdi: tam genişlik başlık (ikon + ad + anahtar); anahtar AÇIKKEN gövde (alt ayarlar)
 * kartın içinde belirir, KAPALIYKEN gövde HİÇ çizilmez (soluk gövde "bozuk mu" sorusu doğurur).
 *
 * Anahtar dokunulabilir bir sarmalayıcının İÇİNDE DEĞİL (TalkBack düzleştirme tuzağı); kart
 * yalnız `View`dır, kontrol anahtarın kendisidir. Genişleme animasyonunu çağıran kurar
 * (`LayoutAnimation`, "Animasyonları azalt"ta yok).
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { Anahtar } from '../common/Anahtar';

export interface KanalKartiProps {
    ikon: string;
    renk: string;
    etiket: string;
    /** Anahtarın ekran okuyucu ipucu (ekranda yazılmaz — az metin). */
    ipucu: string;
    deger: boolean;
    onDegis: (v: boolean) => void;
    testID: string;
    /** Kartın kendisinin testID'si (kareler/testler gövdeyi bulsun). */
    kartTestID?: string;
    /** Açıkken kartın içinde gösterilen alt ayarlar. Yoksa kart yalnız başlıktır (iOS). */
    children?: React.ReactNode;
}

export const KanalKarti: React.FC<KanalKartiProps> = ({
    ikon,
    renk,
    etiket,
    ipucu,
    deger,
    onDegis,
    testID,
    kartTestID,
    children,
}) => {
    const renkler = useRenkler();
    const govdeVar = deger && React.Children.toArray(children).some(Boolean);
    return (
        <View
            testID={kartTestID}
            className="rounded-2xl border"
            style={{
                backgroundColor: deger ? `${renk}0D` : renkler.arkaplan,
                borderColor: deger ? `${renk}80` : renkler.sinir,
                overflow: 'hidden',
            }}
        >
            <View className="flex-row items-center px-3" style={{ minHeight: 56 }}>
                <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: deger ? `${renk}20` : renkler.sinir }}
                >
                    <FontAwesome5 name={ikon} size={14} color={deger ? renk : renkler.metinIkincil} solid />
                </View>
                <Text className="text-[15px] font-semibold flex-1" style={{ color: renkler.metin }}>
                    {etiket}
                </Text>
                <View style={{ minHeight: 44, justifyContent: 'center', marginLeft: 8 }}>
                    <Anahtar
                        value={deger}
                        onValueChange={onDegis}
                        trackColor={{ false: renkler.sinir, true: `${renk}80` }}
                        thumbColor={deger ? renk : '#f4f3f4'}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: deger }}
                        accessibilityLabel={etiket}
                        accessibilityHint={ipucu}
                        testID={testID}
                    />
                </View>
            </View>
            {govdeVar ? (
                <View
                    className="px-3 pb-3 pt-2"
                    style={{ borderTopWidth: 1, borderTopColor: `${renk}30` }}
                >
                    {children}
                </View>
            ) : null}
        </View>
    );
};

/**
 * Kartın İÇİNDEKİ alt anahtar satırı (ör. Bildirim → Titreşim). Çip değil, bağımsız anahtar.
 */
export const AltAnahtarSatiri: React.FC<{
    ikon: string;
    renk: string;
    etiket: string;
    ipucu: string;
    deger: boolean;
    onDegis: (v: boolean) => void;
    testID: string;
}> = ({ ikon, renk, etiket, ipucu, deger, onDegis, testID }) => {
    const renkler = useRenkler();
    return (
        <View className="flex-row items-center" style={{ minHeight: 48 }}>
            <FontAwesome5
                name={ikon}
                size={13}
                color={deger ? renk : renkler.metinIkincil}
                solid
                style={{ width: 22, textAlign: 'center', marginRight: 10 }}
            />
            <Text className="text-sm flex-1" style={{ color: renkler.metin }}>
                {etiket}
            </Text>
            <Anahtar
                value={deger}
                onValueChange={onDegis}
                trackColor={{ false: renkler.sinir, true: `${renk}80` }}
                thumbColor={deger ? renk : '#f4f3f4'}
                accessibilityRole="switch"
                accessibilityState={{ checked: deger }}
                accessibilityLabel={etiket}
                accessibilityHint={ipucu}
                testID={testID}
            />
        </View>
    );
};
