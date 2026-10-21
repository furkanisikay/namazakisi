/**
 * Kare kod (QR) — `qrcode-generator` (MIT, saf JS, bağımlılıksız) + react-native-svg. Tek
 * <Path>: koyu modüller tek yol olarak çizilir (yüzlerce <Rect> yerine; ucuz). Okunurluk için
 * zemin daima beyaz, modül daima siyah (tema renginden bağımsız — kameralar kontrast ister) ve
 * 4 modül sessiz bölge bırakılır.
 */
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const qrcode = require('qrcode-generator') as typeof import('qrcode-generator');

/** Saf: metnin modül matrisinden SVG yolu (test edilir). */
export function kareKodYolu(metin: string): { boyut: number; yol: string } {
    const qr = qrcode(0, 'M');
    qr.addData(metin);
    qr.make();
    const n = qr.getModuleCount();
    let yol = '';
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            if (qr.isDark(y, x)) yol += `M${x} ${y}h1v1h-1z`;
        }
    }
    return { boyut: n, yol };
}

export const KareKod: React.FC<{ metin: string; boyut: number; erisimEtiketi: string }> = ({ metin, boyut, erisimEtiketi }) => {
    const { boyut: n, yol } = React.useMemo(() => kareKodYolu(metin), [metin]);
    const kenar = 4;
    const toplam = n + kenar * 2;
    return (
        <View accessible accessibilityRole="image" accessibilityLabel={erisimEtiketi} style={{ width: boyut, height: boyut, borderRadius: 20, overflow: 'hidden' }}>
            {/* QR kontrastı sabit: beyaz zemin + siyah modül (kamera okuyabilsin). */}
            <Svg width={boyut} height={boyut} viewBox={`0 0 ${toplam} ${toplam}`}>
                <Rect x={0} y={0} width={toplam} height={toplam} fill="#FFFFFF" />
                <Path d={yol} fill="#000000" transform={`translate(${kenar} ${kenar})`} />
            </Svg>
        </View>
    );
};
