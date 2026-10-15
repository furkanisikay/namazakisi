/**
 * "Camide kılacağım" ayar bölümü (issue #292) — davranış testleri.
 * Favori cami tahmini köprüden (global `expo-cami-geofence` mock'u) gelir.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import camiyeGitReducer from '../../../store/camiyeGitSlice';
import {
    camiyeGitAyarlariniNormalize,
    type CamiyeGitAyarlari,
} from '../../../../core/camiyeGit/camiyeGitAyarlari';

jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        metin: '#111111',
        metinIkincil: '#666666',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
    }),
}));
jest.mock('../../../../core/feedback', () => ({
    useFeedback: () => ({ butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

let mockDisk: CamiyeGitAyarlari = camiyeGitAyarlariniNormalize(null);
jest.mock('../../../../data/local/LocalCamiyeGitServisi', () => ({
    LocalCamiyeGitServisi: {
        getAyarlar: jest.fn(async () => mockDisk),
        saveAyarlar: jest.fn(async (a: unknown) => {
            const { camiyeGitAyarlariniNormalize: normalize } = jest.requireActual(
                '../../../../core/camiyeGit/camiyeGitAyarlari'
            );
            mockDisk = normalize(a);
            return true;
        }),
    },
}));
const mockPlanla = jest.fn((..._a: unknown[]) => Promise.resolve());
jest.mock('../../../../domain/services/CamiyeGitHatirlatmaServisi', () => ({
    CamiyeGitHatirlatmaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: (...a: unknown[]) => mockPlanla(...a) }) },
}));

import { CamiyeGitBolumu } from '../CamiyeGitBolumu';

// `require` ŞART: moduleNameMapper mock'una `jest.requireMock` ayrı örnek döndürür (AGENTS.md).
const kopru = require('../../../../../modules/expo-cami-geofence/src') as {
    camiModuluVarMi: jest.Mock;
    ayarlariAl: jest.Mock;
};

const KONUM = { lat: 41.0, lng: 29.0 };

const kur = (cumaAktif = false) => {
    const store = configureStore({
        reducer: {
            camiyeGit: camiyeGitReducer,
            cumaHatirlatma: () => ({ ayarlar: { aktif: cumaAktif, oncedenDk: 60, siklik: 'birkez' } }),
            konum: () => ({ koordinatlar: KONUM }),
        },
    });
    const ekran = render(
        <Provider store={store}>
            <CamiyeGitBolumu />
        </Provider>
    );
    return { store, ...ekran };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockDisk = camiyeGitAyarlariniNormalize(null);
    kopru.camiModuluVarMi.mockReturnValue(false);
    kopru.ayarlariAl.mockResolvedValue(null);
});

describe('CamiyeGitBolumu', () => {
    it('kapalıyken yalnız ana anahtar görünür; açınca kaydedip planlar', async () => {
        const { getByLabelText, queryByText, store } = kur();
        expect(queryByText('Hangi vakitlerde camiye gidiyorsunuz?')).toBeNull();

        fireEvent(getByLabelText('Camide kılacağım hatırlatması'), 'valueChange', true);

        await waitFor(() => expect(store.getState().camiyeGit.ayarlar.aktif).toBe(true));
        expect(mockPlanla).toHaveBeenCalledWith(KONUM);
        expect(queryByText('Hangi vakitlerde camiye gidiyorsunuz?')).not.toBeNull();
    });

    it('vakit çipi aç/kapa yapar ve özet ofseti gösterir', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 12, hazirlikDk: 5 });
        const { findByLabelText, getByText, store } = kur();

        const ikindi = await findByLabelText('İkindi namazı');
        expect(ikindi.props.accessibilityState).toMatchObject({ checked: true });
        await waitFor(() => expect(getByText('Seçtiğiniz vakitlerde ezandan 17 dk önce hatırlatılırsınız.')).toBeTruthy());

        fireEvent.press(ikindi);
        await waitFor(() => expect(store.getState().camiyeGit.ayarlar.vakitler.ikindi).toBe(false));
        expect(store.getState().camiyeGit.ayarlar.vakitler.ogle).toBe(true);
    });

    it('cuma açıkken öğle çakışması kullanıcıya söylenir', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true });
        const { findByText } = kur(true);
        expect(await findByText(/Cuma günleri öğle için cuma hatırlatmanız gelir/)).toBeTruthy();
    });

    it('favori cami varsa yürüme süresi TAHMİNDEN gelir (kaynak tahmin)', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true });
        kopru.camiModuluVarMi.mockReturnValue(true);
        // ~1 km kuzey → 1112 sn ≈ 19 dk
        kopru.ayarlariAl.mockResolvedValue({ yerler: { 'osm:n1': { durum: 'favori', ad: 'Merkez Camii', lat: 41.01, lng: 29.0 } } });
        const { store, findByText } = kur();

        await waitFor(() => expect(store.getState().camiyeGit.ayarlar.yurumeKaynagi).toBe('tahmin'));
        expect(store.getState().camiyeGit.ayarlar.yurumeDk).toBe(19);
        expect(store.getState().camiyeGit.ayarlar.camiAdi).toBe('Merkez Camii');
        expect(await findByText(/Merkez Camii için tahmin/)).toBeTruthy();
    });

    it('ELLE düzeltilen süre tahminle EZİLMEZ; düğmeyle tahmine dönülebilir', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 7, yurumeKaynagi: 'elle' });
        kopru.camiModuluVarMi.mockReturnValue(true);
        kopru.ayarlariAl.mockResolvedValue({ yerler: { 'osm:n1': { durum: 'favori', ad: 'Merkez Camii', lat: 41.01, lng: 29.0 } } });
        const { store, findByLabelText } = kur();

        const dugme = await findByLabelText('Favori caminize göre hesaplayın: 19 dakika');
        expect(store.getState().camiyeGit.ayarlar.yurumeDk).toBe(7);
        expect(store.getState().camiyeGit.ayarlar.yurumeKaynagi).toBe('elle');

        fireEvent.press(dugme);
        await waitFor(() => expect(store.getState().camiyeGit.ayarlar.yurumeDk).toBe(19));
        expect(store.getState().camiyeGit.ayarlar.yurumeKaynagi).toBe('tahmin');
    });

    it('stepper elle düzeltme olarak YAZILIR (debounce sonrası kaynak elle)', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 10 });
        const { findByLabelText, store, unmount } = kur();

        fireEvent.press(await findByLabelText('Yürüme süresi artır'));
        // Ekrandan çıkışta bekleyen yazma HEMEN uygulanır.
        unmount();
        await waitFor(() => expect(mockDisk.yurumeDk).toBe(11));
        expect(mockDisk.yurumeKaynagi).toBe('elle');
        expect(store.getState().camiyeGit.ayarlar.yurumeDk).toBe(11);
    });
});
