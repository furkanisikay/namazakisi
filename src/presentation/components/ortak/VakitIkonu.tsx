/**
 * Vakit simgesi — saat (Wear OS) ve Apple Watch ile AYNI aile, telefonda.
 *
 * Neden: FontAwesome5 "sun" küçük boyutta dişliye benziyor ve Ayarlar simgesiyle karışıyordu;
 * sabah/ikindi aynı "cloud-sun"du, yatsı tek "star"dı. Bu simgeler her vakti tek bakışta ayırır:
 *   imsak  — ufukta tan ışığı + sönen yıldız        güneş — ufuktan yükselen güneş, yukarı ok
 *   öğle   — tepedeki güneş, ince belirgin ışınlar  ikindi — alçalmış güneş, ufuk çizgisi
 *   akşam  — ufka inen güneş, aşağı ok              yatsı  — hilal + yıldız
 *
 * Çizimler `wear/app/src/main/res/drawable/ic_vakit_*.xml` ile BİREBİR aynıdır (24×24 kutu);
 * `VakitIkonu.test.tsx` iki tarafın path verisini karşılaştırır — biri değişirse öteki de.
 * Apple Watch karşılığı SF Symbols (`sunrise / sun.max / sun.haze / sunset / moon.stars`).
 * Renk her zaman çağırandan (tema token'ı) gelir; tek renk, dolgu + çizgi aynı renk.
 */
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export type VakitIkonKodu = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

interface Parca {
    d: string;
    /** true → dolgu, false → 2 birim çizgi (yuvarlak uç). */
    dolgu: boolean;
}

/** Wear `ic_vakit_*.xml` ile aynı veri (sıra dahil). */
export const VAKIT_IKON_PARCALARI: Record<VakitIkonKodu, Parca[]> = {
    imsak: [
        { d: 'M2,20.5h20M7,17a5,5 0,0 1,10 0', dolgu: false },
        { d: 'M17,3l0.8,1.7 1.9,0.3 -1.4,1.3 0.4,1.9 -1.7,-0.9 -1.7,0.9 0.4,-1.9 -1.4,-1.3 1.9,-0.3z', dolgu: true },
    ],
    gunes: [
        { d: 'M6.5,18a5.5,5.5 0,0 1,11 0z', dolgu: true },
        { d: 'M2,20.5h20M12,2v7M9,5l3,-3 3,3', dolgu: false },
    ],
    ogle: [
        { d: 'M12,7.5a4.5,4.5 0,1 0,0.01 0z', dolgu: true },
        {
            d: 'M12,1.5v2M12,20.5v2M1.5,12h2M20.5,12h2M4.6,4.6l1.4,1.4M18,18l1.4,1.4M4.6,19.4l1.4,-1.4M18,6l1.4,-1.4',
            dolgu: false,
        },
    ],
    ikindi: [
        { d: 'M12,10a4.5,4.5 0,1 0,0.01 0z', dolgu: true },
        { d: 'M12,4v2M3.5,14.5h2M18.5,14.5h2M6,8.5l1.4,1.4M18,8.5l-1.4,1.4M3,21.5h18', dolgu: false },
    ],
    aksam: [
        { d: 'M6.5,18a5.5,5.5 0,0 1,11 0z', dolgu: true },
        { d: 'M2,20.5h20M12,2v7M9,6l3,3 3,-3', dolgu: false },
    ],
    yatsi: [
        { d: 'M12.5,3a9,9 0,1 0,8.5 12A7,7 0,1 1,12.5 3z', dolgu: true },
        { d: 'M18,5l0.9,1.9 2.1,0.3 -1.5,1.5 0.4,2.1 -1.9,-1 -1.9,1 0.4,-2.1 -1.5,-1.5 2.1,-0.3z', dolgu: true },
    ],
};

/** Görünen ad ya da `VakitAdi` → simge kodu. Bilinmeyen → `null` (çağıran yedeğe düşer). */
export function vakitIkonKodu(vakit: string): VakitIkonKodu | null {
    switch (vakit) {
        case 'imsak':
        case 'sabah':
        case 'Sabah':
        case 'İmsak': // dil-haric: kimlik
            return 'imsak';
        case 'gunes':
        case 'Güneş': // dil-haric: kimlik
            return 'gunes';
        case 'ogle':
        case 'Öğle': // dil-haric: kimlik
        case 'Cuma':
            return 'ogle';
        case 'ikindi':
        case 'İkindi': // dil-haric: kimlik
            return 'ikindi';
        case 'aksam':
        case 'Akşam': // dil-haric: kimlik
            return 'aksam';
        case 'yatsi':
        case 'Yatsı': // dil-haric: kimlik
            return 'yatsi';
        default:
            return null;
    }
}

export interface VakitIkonuProps {
    kod: VakitIkonKodu;
    boyut: number;
    renk: string;
    opaklik?: number;
    testID?: string;
}

export const VakitIkonu: React.FC<VakitIkonuProps> = React.memo(function VakitIkonu({ kod, boyut, renk, opaklik, testID }) {
    return (
        <Svg
            width={boyut}
            height={boyut}
            viewBox="0 0 24 24"
            testID={testID}
            opacity={opaklik}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            {VAKIT_IKON_PARCALARI[kod].map((p, i) =>
                p.dolgu ? (
                    <Path key={i} d={p.d} fill={renk} />
                ) : (
                    <Path
                        key={i}
                        d={p.d}
                        fill="none"
                        stroke={renk}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )
            )}
        </Svg>
    );
});
