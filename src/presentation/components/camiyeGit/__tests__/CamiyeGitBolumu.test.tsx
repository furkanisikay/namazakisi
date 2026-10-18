/**
 * "Camide kılacağım" ayar bölümü (issue #292) — davranış testleri.
 * Favori cami tahmini köprüden (global `expo-cami-geofence` mock'u) gelir.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import camiyeGitReducer from '../../../store/camiyeGitSlice';
import rizaReducer from '../../../store/hatirlatmaRizaSlice';
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
        bilgi: '#2196F3',
        durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
    }),
}));
jest.mock('../../../../core/feedback', () => ({
    useFeedback: () => ({ butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
const mockButceKutusu: { deger: unknown } = { deger: null };
jest.mock('../../../hooks/useBildirimButcesi', () => {
    const gercek = jest.requireActual('../../../hooks/useBildirimButcesi');
    return {
        ...gercek,
        useBildirimButcesi: () => mockButceKutusu.deger ?? gercek.butceNesnesiOlustur('android', null, null),
    };
});
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    sesSec: jest.fn(),
    sesiOnizle: jest.fn(),
    onizlemeyiDurdur: jest.fn(),
    trDestekleniyorMu: () => Promise.resolve(true),
}));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { bildirimSesiniCal: jest.fn(), bitisiniBekle: jest.fn(), temizle: jest.fn() },
}));

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

import { CamiyeGitBolumu, CAMIYE_GIT_YON_GEREKCESI } from '../CamiyeGitBolumu';

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
            hatirlatmaRiza: rizaReducer,
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
    mockButceKutusu.deger = null;
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
        await waitFor(() => expect(getByText('Seçtiğiniz vakitlerde ilk hatırlatma ezandan 17 dk önce gelir.')).toBeTruthy());

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

    it('ortak kart: YÖN GEREKÇESİ ekranda, akış önizlemesi, adım ekleme; yola çıkış özeti', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true, yurumeDk: 12, hazirlikDk: 5 });
        const ekran = kur();
        expect(await ekran.findByTestId('yon-sabit-gerekcesi')).toBeTruthy();
        expect(ekran.getByText(CAMIYE_GIT_YON_GEREKCESI)).toBeTruthy();
        expect(ekran.getByText('Yola çıkış: 17 dk (yürüme 12 + hazırlık 5)')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Camide kılacağım akışını önizleyin'));
        expect(ekran.getByText('Camide kılacağım akışı')).toBeTruthy();
    });

    it('STANDART yetenekler adım detayında: iki kanal anahtarı + GERÇEK ALARM; sesli rıza ORTAK kayda (tek rıza) yazılır', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: true });
        const ekran = kur();
        fireEvent.press(await ekran.findByLabelText(/^Hatırlatma — düzenleyin/));
        // Birleşik modül: iki ANA anahtar + "Gelişmiş" bölümünde gerçek alarm.
        expect(ekran.getByTestId('adim-bildirim-anahtari')).toBeTruthy();
        fireEvent.press(ekran.getByTestId('adim-gelismis'));
        expect(ekran.getByTestId('adim-alarm-anahtari')).toBeTruthy();
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(ekran.getByText('Sesli anons açılsın mı?')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Sesli anonsu açın'));
        await waitFor(() => expect(mockDisk.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true }));
        expect(ekran.store.getState().hatirlatmaRiza.kayit.sesliOnayi).toBe(true);
        expect(mockDisk.sesliOnayi).toBeUndefined();
    });

    it('yürüme süresi değişince adımların TÜMÜ aynı farkla kayar', async () => {
        mockDisk = camiyeGitAyarlariniNormalize({
            aktif: true,
            yurumeDk: 10,
            hazirlikDk: 5,
            yurumeKaynagi: 'elle',
            adimlar: [{ esikDk: 30, kanallar: { bildirim: true } }, { esikDk: 15, kanallar: { bildirim: true } }],
        });
        const { findByLabelText, unmount } = kur();
        fireEvent.press(await findByLabelText('Yürüme süresi artır'));
        unmount();
        await waitFor(() => expect(mockDisk.yurumeDk).toBe(11));
        expect(mockDisk.adimlar.map((a) => a.esikDk)).toEqual([31, 16]);
    });

    it('bildirim sınırı: sığmayan AÇMA yazılmaz (rehber açılır, muhafıza yönlendirir)', async () => {
        const { butceNesnesiOlustur } = jest.requireActual('../../../hooks/useBildirimButcesi');
        const { matrisKur, ISTANBUL } = jest.requireActual('../../../../core/bildirim/__tests__/defterFikstur');
        // iOS 64: muhafız + 5 vakit × (180 dk'dan 5 dk'da bir) sınırı aşar → açma sığmaz.
        mockDisk = camiyeGitAyarlariniNormalize({ aktif: false, adimlar: [{ esikDk: 180, siklik: { herDk: 5 } }] });
        mockButceKutusu.deger = butceNesnesiOlustur('ios', {
            platform: 'ios',
            simdi: new Date(2026, 9, 15, 9, 0, 0),
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matrisKur() },
            camiyeGit: mockDisk,
        });
        const ekran = kur();
        await waitFor(() => expect(ekran.store.getState().camiyeGit.ayarlar.adimlar[0].esikDk).toBe(180));
        fireEvent(ekran.getByLabelText('Camide kılacağım hatırlatması'), 'valueChange', true);
        fireEvent.press(await ekran.findByText('Namaz Muhafızı ayarlarında yer açın'));
        expect(mockNavigate).toHaveBeenCalledWith('MuhafizAyarlari');
        ekran.unmount();
        expect(mockDisk.aktif).toBe(false);
    });
});
