import React from 'react';
import { AccessibilityInfo, Platform, ToastAndroid } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ metin: '#212121', arkaplan: '#FAFAFA' }),
}));

import { KisaBildirimKatmani, kisaBildirimGoster } from '../KisaBildirim';

describe('kisaBildirimGoster', () => {
    afterEach(() => jest.restoreAllMocks());

    it('Android: sistem toastını kullanır (kullanıcının alıştığı görünüm korunur)', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => undefined);

        kisaBildirimGoster('Konumunuz güncellendi');
        kisaBildirimGoster('Konum izni gerekiyor', true);

        expect(toast).toHaveBeenNthCalledWith(1, 'Konumunuz güncellendi', ToastAndroid.SHORT);
        expect(toast).toHaveBeenNthCalledWith(2, 'Konum izni gerekiyor', ToastAndroid.LONG);
    });

    it('iOS: ToastAndroid YOKTUR — mesaj uygulama katmanında görünür ve ekran okuyucuya duyurulur', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => undefined);
        const duyuru = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
        jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

        const { findByText, queryByText } = render(<KisaBildirimKatmani />);
        expect(queryByText('Konumunuz güncellendi')).toBeNull();

        act(() => kisaBildirimGoster('Konumunuz güncellendi'));

        expect(await findByText('Konumunuz güncellendi')).toBeTruthy();
        expect(duyuru).toHaveBeenCalledWith('Konumunuz güncellendi');
        expect(toast).not.toHaveBeenCalled();
    });

    it('iOS: katman yokken çağrı çökmez (ör. katman henüz bağlanmadı)', () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(() => kisaBildirimGoster('Bir mesaj')).not.toThrow();
    });

    it('katman kaldırılınca dinleyici bırakılır, sonraki çağrı ona ulaşmaz', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const duyuru = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
        jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

        const { unmount } = render(<KisaBildirimKatmani />);
        unmount();
        duyuru.mockClear();
        kisaBildirimGoster('Görünmemeli');

        await waitFor(() => expect(duyuru).not.toHaveBeenCalled());
    });
});
