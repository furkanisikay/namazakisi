import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ metin: '#212121', arkaplan: '#FAFAFA', birincilAcik: '#C8E6C9' }),
}));

import { GeriAlBandiKatmani, geriAlBandiGoster, geriAlBandiniKapat } from '../GeriAlBandi';
import { sonucCoz, useIzinAkisi } from '../useIzinAkisi';
import type { IzinDurumu } from '../../../../core/cihaz/durumNotlari';

beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});
afterEach(() => jest.restoreAllMocks());

describe('GeriAlBandi', () => {
    it('gösterir, duyurur, "Geri al" önceki durumu geri yazar ve bant kapanır', async () => {
        const duyuru = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
        const geriAl = jest.fn();
        const { getByText, getByLabelText, queryByText } = render(<GeriAlBandiKatmani />);
        act(() => geriAlBandiGoster({ mesaj: 'Hatırlatma silindi', geriAl }));
        expect(getByText('Hatırlatma silindi')).toBeTruthy();
        expect(duyuru).toHaveBeenCalledWith(expect.stringContaining('Hatırlatma silindi'));
        await act(async () => {
            fireEvent.press(getByLabelText('Geri al'));
        });
        expect(geriAl).toHaveBeenCalledTimes(1);
        expect(queryByText('Hatırlatma silindi')).toBeNull();
    });

    it('aynı anda tek bant: yeni çağrı öncekinin yerine geçer', () => {
        const { queryByText } = render(<GeriAlBandiKatmani />);
        act(() => geriAlBandiGoster({ mesaj: 'Bir', geriAl: jest.fn() }));
        act(() => geriAlBandiGoster({ mesaj: 'İki', geriAl: jest.fn() }));
        expect(queryByText('Bir')).toBeNull();
        expect(queryByText('İki')).toBeTruthy();
        act(() => geriAlBandiniKapat());
        expect(queryByText('İki')).toBeNull();
    });

    it('süre dolunca kendiliğinden kapanır', async () => {
        const { queryByText } = render(<GeriAlBandiKatmani />);
        act(() => geriAlBandiGoster({ mesaj: 'Kısa', geriAl: jest.fn(), sureMs: 20 }));
        await act(async () => {
            await new Promise((r) => setTimeout(r, 60));
        });
        expect(queryByText('Kısa')).toBeNull();
    });
});

describe('useIzinAkisi', () => {
    it('sonucCoz: üç sonuç', () => {
        expect(sonucCoz('verildi')).toBe('verildi');
        expect(sonucCoz('sorulabilir')).toBe('tekrarDene');
        expect(sonucCoz('reddedildi')).toBe('ayarlar');
        expect(sonucCoz(null)).toBeNull();
    });

    it('istek modal kapandıktan SONRA yapılır ve durum YENİDEN okunur', async () => {
        let durum: IzinDurumu = 'sorulabilir';
        const sira: string[] = [];
        const oku = jest.fn(async () => {
            sira.push('oku');
            return durum;
        });
        const iste = jest.fn(async () => {
            sira.push('iste');
            durum = 'verildi';
        });
        const { result } = renderHook(() => useIzinAkisi({ oku, iste, kapanisBeklemeMs: 0 }));
        await waitFor(() => expect(result.current.durum).toBe('sorulabilir'));
        let sonuc: unknown;
        await act(async () => {
            sonuc = await result.current.istekBaslat();
        });
        expect(sonuc).toBe('verildi');
        expect(result.current.sonuc).toBe('verildi');
        expect(sira.slice(-2)).toEqual(['iste', 'oku']);
    });

    it('kalıcı red → ayarlar; iOS onDismiss beklemeyi kısaltır', async () => {
        const oku = jest.fn(async (): Promise<IzinDurumu> => 'reddedildi');
        const iste = jest.fn(async () => undefined);
        const { result } = renderHook(() => useIzinAkisi({ oku, iste, kapanisBeklemeMs: 60_000 }));
        let vaat: Promise<unknown> = Promise.resolve();
        act(() => {
            vaat = result.current.istekBaslat();
        });
        expect(iste).not.toHaveBeenCalled();
        await act(async () => {
            result.current.modalKapandi();
            await vaat;
        });
        expect(iste).toHaveBeenCalled();
        expect(result.current.sonuc).toBe('ayarlar');
    });
});
