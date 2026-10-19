/**
 * Görsel anlatı döngüsü kapısı (sahip kararı 2026-10-19): döngü YALNIZ ekran odakta,
 * uygulama ön planda ve "Animasyonları azalt" kapalıyken oynar; kapı düşünce ya da
 * unmount'ta DURUR ve sahne dinlenme pozuna döner. `Animated.loop` sahtelenir (gerçek
 * zamanlayıcı kurulmaz — CI asılma dersi).
 */
import * as React from 'react';
import { Animated, AppState } from 'react-native';
import { act, render } from '@testing-library/react-native';

let mockAzalt = false;
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => mockAzalt }));

import { useDonguAcik, useDonguAnimasyonu } from '../dongu';

const Sahne: React.FC<{ dinlen: () => void }> = ({ dinlen }) => {
    const acik = useDonguAcik();
    const v = React.useRef(new Animated.Value(0)).current;
    useDonguAnimasyonu(acik, () => Animated.timing(v, { toValue: 1, duration: 100, useNativeDriver: true }), dinlen);
    return null;
};

describe('useDonguAnimasyonu + useDonguAcik', () => {
    let start: jest.Mock;
    let stop: jest.Mock;
    let appStateDinleyici: ((d: string) => void) | null;

    beforeEach(() => {
        mockAzalt = false;
        start = jest.fn();
        stop = jest.fn();
        jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop, reset: jest.fn() } as unknown as Animated.CompositeAnimation);
        appStateDinleyici = null;
        jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, cb: (d: string) => void) => {
            appStateDinleyici = cb;
            return { remove: jest.fn() };
        }) as unknown as typeof AppState.addEventListener);
    });

    afterEach(() => jest.restoreAllMocks());

    it('görünürken döngü başlar; unmount\'ta durur ve dinlenme pozuna döner', () => {
        const dinlen = jest.fn();
        const r = render(<Sahne dinlen={dinlen} />);
        expect(start).toHaveBeenCalledTimes(1);
        r.unmount();
        expect(stop).toHaveBeenCalledTimes(1);
        expect(dinlen).toHaveBeenCalled();
    });

    it('"Animasyonları azalt" açıksa döngü HİÇ kurulmaz (son kare)', () => {
        mockAzalt = true;
        const dinlen = jest.fn();
        render(<Sahne dinlen={dinlen} />);
        expect(start).not.toHaveBeenCalled();
        expect(dinlen).toHaveBeenCalled();
    });

    it('ekran odaktan çıkınca (blur) döngü durur, odağa dönünce yeniden başlar', () => {
        const { NavigationContext } = require('@react-navigation/native');
        const dinleyiciler: Record<string, () => void> = {};
        const gezinme = {
            isFocused: () => true,
            addListener: (olay: string, cb: () => void) => {
                dinleyiciler[olay] = cb;
                return () => undefined;
            },
        };
        render(
            <NavigationContext.Provider value={gezinme}>
                <Sahne dinlen={jest.fn()} />
            </NavigationContext.Provider>,
        );
        expect(start).toHaveBeenCalledTimes(1);
        act(() => dinleyiciler.blur());
        expect(stop).toHaveBeenCalledTimes(1);
        act(() => dinleyiciler.focus());
        expect(start).toHaveBeenCalledTimes(2);
    });

    it('uygulama arka plana geçince döngü durur, öne gelince yeniden başlar', () => {
        const dinlen = jest.fn();
        render(<Sahne dinlen={dinlen} />);
        expect(start).toHaveBeenCalledTimes(1);
        act(() => appStateDinleyici?.('background'));
        expect(stop).toHaveBeenCalledTimes(1);
        act(() => appStateDinleyici?.('active'));
        expect(start).toHaveBeenCalledTimes(2);
    });
});
