/**
 * Platforma uygun ANAHTAR (Switch).
 *
 * NEDEN VAR (iPhone ic testinde goruldu): uygulamadaki tum anahtarlar Android
 * Material desenine gore renklendirilmisti — YARI SAYDAM iz (`renk + '60'`) ve
 * RENKLI basparmak (`thumbColor`). iOS'ta bu desen bozuk gorunur: `thumbColor`
 * yerel beyaz basparmagi boyar, yari saydam iz soluk kalir; renkli kart
 * uzerindeki anahtarlarda (`rgba(255,255,255,0.3)` iz + beyaz basparmak) iz
 * zeminle kaynasir ve anahtar "acik mi kapali mi" okunmaz.
 *
 * SOZLESME: cagiran bugunku Android renklerini AYNEN verir.
 *   - Android: props DOKUNULMADAN gecer → gorunum birebir aynı kalir.
 *   - iOS: `thumbColor` atilir (yerel beyaz basparmak), iz rengi OPAK yapilir,
 *     kapali iz `ios_backgroundColor` ile verilir (iOS `trackColor.false`'u
 *     yalniz kismen uygular).
 *
 * Yeni anahtar eklerken react-native `Switch`'i DOGRUDAN kullanma.
 */
import * as React from 'react';
import { Platform, Switch, type ColorValue, type SwitchProps } from 'react-native';

/**
 * Renkli (birincil) zemin uzerindeki acik iz rengi.
 *
 * Android'deki `rgba(255,255,255,0.x)` iOS'ta beyaz basparmakla kaynasir;
 * koyu bir tul zemin rengini koyulastirir ve beyaz basparmak okunur kalir.
 */
export const IOS_RENKLI_ZEMIN_IZI = 'rgba(0,0,0,0.25)';

const YARI_SAYDAM_BEYAZ = /^rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/i;
const ALFALI_HEX = /^#([0-9a-f]{6})[0-9a-f]{2}$/i;

/**
 * Android iz rengini iOS karsiligina cevirir (saf).
 *
 * `#RRGGBBAA` → `#RRGGBB` (Android'in yari saydamligi iOS'ta soluk durur),
 * yari saydam beyaz → `IOS_RENKLI_ZEMIN_IZI`, gerisi aynen.
 */
export function iosIzRengi(renk: ColorValue | null | undefined): ColorValue | null | undefined {
    if (typeof renk !== 'string') return renk;
    if (YARI_SAYDAM_BEYAZ.test(renk)) return IOS_RENKLI_ZEMIN_IZI;
    const hex = ALFALI_HEX.exec(renk);
    return hex ? `#${hex[1]}` : renk;
}

export const Anahtar: React.FC<SwitchProps> = (props) => {
    if (Platform.OS !== 'ios') return <Switch {...props} />;

    const { thumbColor: _androidBasparmak, trackColor, ios_backgroundColor, ...kalan } = props;
    return (
        <Switch
            {...kalan}
            trackColor={{ false: trackColor?.false, true: iosIzRengi(trackColor?.true) }}
            ios_backgroundColor={
                ios_backgroundColor ?? (typeof trackColor?.false === 'string' ? trackColor.false : undefined)
            }
        />
    );
};
