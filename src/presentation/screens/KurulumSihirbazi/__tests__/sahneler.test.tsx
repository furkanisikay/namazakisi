/**
 * Sihirbazın canlı resimleri (görsel anlatı, sahip kararı 2026-10-19): her adımın sahnesi
 * çizilir, görünürken döngü kurar, iş bitince (konum alındı / izin verildi) döngü KAPANIR.
 * `Animated.loop` sahtelenir — gerçek zamanlayıcı kurulmaz.
 */
import * as React from 'react';
import { Animated } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

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
        expect(normal.getByText('25 dk', G)).toBeTruthy();
        expect(normal.getByText('Vakit çıkar', G)).toBeTruthy();
    });

    it('düzey önizlemesi motorun planını çizer; sesli izin yokken sesli nokta YOK', () => {
        const { duzeyOnizlemeAdimlari } = require('../../../../core/hatirlatma/duzeyOzeti');
        const { HATIRLATMA_PRESETLERI } = require('../../../store/muhafizSlice');
        const plan = duzeyOnizlemeAdimlari(HATIRLATMA_PRESETLERI.normal.seviyeler);
        const sesliPlan = plan.filter((a: { sesli: boolean }) => a.sesli).length;
        expect(sesliPlan).toBeGreaterThan(0);

        const olc = (r: ReturnType<typeof render>) => {
            // Ray genişliği ölçülünce noktalar çizilir (ölçü yokken boş).
            const ray = r.getByTestId('duzey-onizleme-ray', G);
            fireEvent(ray, 'layout', { nativeEvent: { layout: { width: 300, height: 36 } } });
        };
        const izinli = render(<DuzeyOnizlemesi duzey="normal" />);
        olc(izinli);
        expect(izinli.queryAllByTestId('duzey-onizleme-nokta-sesli', G)).toHaveLength(sesliPlan);
        expect(izinli.queryAllByTestId(/duzey-onizleme-nokta/, G)).toHaveLength(plan.length);
        // Noktaların altında kısa etiketler: kanal ikonu (sesliyse hoparlör) + "N dk".
        expect(izinli.queryAllByTestId('duzey-onizleme-etiket', G).length).toBeGreaterThan(0);
        expect(izinli.getAllByText('volume-up', G).length).toBeGreaterThan(0);
        expect(izinli.getByText('25 dk', G)).toBeTruthy();
        // "Vakit çıkar" ile bayrak TEK satırda, yazı bayrağın solunda (üst üste binmez).
        const cikis = izinli.getByTestId('duzey-onizleme-vakit-cikar', G);
        expect(cikis.props.style).toMatchObject({ flexDirection: 'row' });
        const cocuklar = cikis.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children);
        expect(cocuklar.indexOf('Vakit çıkar')).toBeLessThan(cocuklar.indexOf('flag-checkered'));
        expect(izinli.getAllByText('flag-checkered', G)).toHaveLength(1);

        const izinsiz = render(<DuzeyOnizlemesi duzey="normal" sesliAcik={false} />);
        olc(izinsiz);
        expect(izinsiz.queryAllByTestId('duzey-onizleme-nokta-sesli', G)).toHaveLength(0);
        expect(izinsiz.queryAllByTestId('duzey-onizleme-nokta', G)).toHaveLength(plan.length);
        expect(izinsiz.queryByText('volume-up', G)).toBeNull();
    });
});
