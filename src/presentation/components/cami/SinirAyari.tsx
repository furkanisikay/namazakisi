/**
 * Algılama SINIRI ayarı — harita paneli ve "Namazda sessiz" yer listesi AYNI bileşeni
 * kullanır (iki ayrı stepper, aynı tuzağı iki yerde yaşatıyordu).
 *
 * Kurallar saf `core/cami/sinirAyari.ts`'te: kip seçimi (Bina sınırı / Daire)
 * birbirini dışlar, ölçek %100–%300 (büyük binada daha az), "Özgün sınıra dön"
 * iki ayarı da siler. Bina poligonu olmayan kayıtta yalnız daire stepper'ı çıkar.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { SayisalSecici } from '../common/SayisalSecici';
import { SecenekCipleri } from './SecenekCipleri';
import { ALAN_ADIM_M, ALAN_MAX_M, ALAN_MIN_M, type YerKaydi } from '../../../core/cami/camiTipleri';
import {
    OLCEK_ADIM_YUZDE,
    OZGUN_SINIR_DEGISIKLIGI,
    daireDegisikligi,
    etkinYaricapM,
    gorunenOlcekYuzde,
    kipDegisikligi,
    olcekDegisikligi,
    olcekUstYuzde,
    ozgunSinirdaMi,
    sinirAciklamasi,
    sinirModu,
    type SinirGirdisi,
    type SinirModu,
} from '../../../core/cami/sinirAyari';

interface Props {
    girdi: SinirGirdisi;
    /** Yerin görünen adı — ekran okuyucu etiketleri ayırt edilsin (aynı ekranda birden çok olabilir). */
    ad: string;
    /** `aninda`: tek dokunuşlu eylem (kip, özgün sınır) → hemen yazılsın; stepper → ertelenebilir. */
    onDegistir: (d: Partial<YerKaydi>, aninda: boolean) => void;
    testIDOnEki?: string;
}


export const SinirAyari: React.FC<Props> = ({ girdi, ad, onDegistir, testIDOnEki = 'sinir' }) => {
    const renkler = useRenkler();
    const m = useMetin().cami.sinir;
    const kipler = [
        { deger: 'bina' as const, etiket: m.kipBina, ikon: 'draw-polygon' },
        { deger: 'daire' as const, etiket: m.kipDaire, ikon: 'circle' },
    ];
    const kip = sinirModu(girdi);
    const ustYuzde = olcekUstYuzde(girdi.yaricapM);
    const ozgun = ozgunSinirdaMi(girdi);

    return (
        <View testID={`${testIDOnEki}-ayari`}>
            <Text className="text-sm font-medium" style={{ color: renkler.metin }}>
                {m.baslik}
            </Text>
            <Text className="text-xs mb-2" style={{ color: renkler.metinIkincil }} testID={`${testIDOnEki}-aciklama`}>
                {sinirAciklamasi(girdi)} {m.icindeyseniz}
            </Text>

            {girdi.poligonVar && (
                <View className="mb-2">
                    <SecenekCipleri<SinirModu>
                        secenekler={kipler}
                        secili={kip}
                        onSec={(k) => k !== kip && onDegistir(kipDegisikligi(girdi, k), true)}
                        grupEtiketi={bicim(m.kipErisim, { ad })}
                        testIDOnEki={`${testIDOnEki}-kip`}
                    />
                </View>
            )}

            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs flex-1 pr-2" style={{ color: renkler.metinIkincil }}>
                    {kip === 'bina' ? m.merkezdenBuyutme : m.yaricap}
                </Text>
                {kip === 'bina' ? (
                    ustYuzde > 100 ? (
                        <SayisalSecici
                            deger={gorunenOlcekYuzde(girdi)}
                            min={100}
                            max={ustYuzde}
                            adim={OLCEK_ADIM_YUZDE}
                            birim="%"
                            onChange={(v) => onDegistir(olcekDegisikligi(v), false)}
                            renk={renkler.birincil}
                            aciklama={bicim(m.buyutmeErisim, { ad })}
                        />
                    ) : (
                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                            {m.zatenGenis}
                        </Text>
                    )
                ) : (
                    <SayisalSecici
                        deger={etkinYaricapM(girdi)}
                        min={ALAN_MIN_M}
                        max={ALAN_MAX_M}
                        adim={ALAN_ADIM_M}
                        birim="m"
                        onChange={(v) => onDegistir(daireDegisikligi(v), false)}
                        renk={renkler.birincil}
                        aciklama={bicim(m.alanErisim, { ad })}
                    />
                )}
            </View>

            {!ozgun && (
                <TouchableOpacity
                    testID={`${testIDOnEki}-ozgun`}
                    className="flex-row items-center self-start mt-1"
                    style={{ minHeight: 44 }}
                    onPress={() => onDegistir(OZGUN_SINIR_DEGISIKLIGI, true)}
                    accessibilityRole="button"
                    accessibilityLabel={bicim(m.ozgunErisim, { ad })}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                    <FontAwesome5 name="undo" size={11} color={renkler.birincil} style={{ marginRight: 6 }} />
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        {girdi.poligonVar ? m.ozgunBina : m.varsayilanAlan}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SinirAyari;
