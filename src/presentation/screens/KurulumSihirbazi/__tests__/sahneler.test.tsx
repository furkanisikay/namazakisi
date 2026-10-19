/**
 * Sihirbazın canlı resimleri (görsel anlatı, sahip kararı 2026-10-19): her adımın sahnesi
 * çizilir, görünürken döngü kurar, iş bitince (konum alındı / izin verildi) döngü KAPANIR.
 * `Animated.loop` sahtelenir — gerçek zamanlayıcı kurulmaz.
 */
import * as React from 'react';
import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{p.name}</Text>;
});
const RENKLER = {
    birincil: '#2E7D32',
    birincilMetin: '#FFFFFF',
    basarili: '#4CAF50',
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    metin: '#111111',
    metinIkincil: '#666666',
};
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => false }));

import { BildirimSahnesi, HazirSahnesi, HosgeldinizSahnesi, KonumSahnesi } from '../sahneler';
import { DuzeyOnizlemesi } from '../../../components/hatirlatma/DuzeyOnizlemesi';

/** Sahneler dekoratiftir (ekran okuyucudan gizli) → sorgular gizli öğeleri de görmeli. */
const G = { includeHiddenElements: true };

describe('Kurulum sahneleri', () => {
    let start: jest.Mock;
    beforeEach(() => {
        start = jest.fn();
        jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop: jest.fn(), reset: jest.fn() } as unknown as Animated.CompositeAnimation);
    });
    afterEach(() => jest.restoreAllMocks());

    it('hoş geldiniz sahnesi çizilir ve görünürken döngü kurar', () => {
        const r = render(<HosgeldinizSahnesi />);
        expect(r.getByTestId('sahne-hosgeldiniz', G)).toBeTruthy();
        expect(start).toHaveBeenCalledTimes(1);
    });

    it('konum alınana kadar iğne düşer; alınınca döngü kurulmaz, ✓ görünür', () => {
        render(<KonumSahnesi alindi={false} />);
        expect(start).toHaveBeenCalledTimes(1);
        start.mockClear();
        const r = render(<KonumSahnesi alindi />);
        expect(start).not.toHaveBeenCalled();
        expect(r.getByText('check', G)).toBeTruthy();
    });

    it('bildirim izni verilince zil susar (döngü yok), ✓ görünür', () => {
        const r = render(<BildirimSahnesi izinVar />);
        expect(start).not.toHaveBeenCalled();
        expect(r.getByText('check', G)).toBeTruthy();
    });

    it('hazır sahnesi döngü KURMAZ (tek seferlik kutlama)', () => {
        const r = render(<HazirSahnesi />);
        expect(r.getByTestId('sahne-hazir', G)).toBeTruthy();
        expect(start).not.toHaveBeenCalled();
    });

    it('düzey önizlemesi: kapalıda sakin resim, açık düzeyde kenarlarda gerçek ilk eşik', () => {
        const kapali = render(<DuzeyOnizlemesi duzey="kapali" dongu />);
        expect(kapali.getByText('Hatırlatma yok', G)).toBeTruthy();
        const normal = render(<DuzeyOnizlemesi duzey="normal" dongu />);
        expect(normal.getByText('45 dk önce', G)).toBeTruthy();
        expect(normal.getByText('Vakit çıkar', G)).toBeTruthy();
    });
});
