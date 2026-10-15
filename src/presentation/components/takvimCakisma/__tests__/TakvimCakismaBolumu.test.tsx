/**
 * Takvim çakışması ayar bölümü (issue #291) — AÇIK RIZA akışı:
 * anahtar özelliği doğrudan AÇMAZ; açıklama modalı + sistem izni şarttır.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import takvimCakismaReducer from '../../../store/takvimCakismaSlice';
import {
    takvimCakismaAyarlariniNormalize,
    type TakvimCakismaAyarlari,
} from '../../../../core/takvimCakisma/takvimCakismaAyarlari';

jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        metin: '#111111',
        metinIkincil: '#666666',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        durum: { uyari: '#FFC107', hata: '#F44336', basarili: '#4CAF50', bilgi: '#2196F3' },
        hata: '#F44336',
    }),
}));
jest.mock('../../../../core/feedback', () => ({
    useFeedback: () => ({ butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));

let mockDisk: TakvimCakismaAyarlari = takvimCakismaAyarlariniNormalize(null);
jest.mock('../../../../data/local/LocalTakvimCakismaServisi', () => ({
    LocalTakvimCakismaServisi: {
        getAyarlar: jest.fn(async () => mockDisk),
        saveAyarlar: jest.fn(async (a: unknown) => {
            const { takvimCakismaAyarlariniNormalize: normalize } = jest.requireActual(
                '../../../../core/takvimCakisma/takvimCakismaAyarlari'
            );
            mockDisk = normalize(a);
            return true;
        }),
    },
}));
const mockPlanla = jest.fn((..._a: unknown[]) => Promise.resolve());
jest.mock('../../../../domain/services/TakvimCakismaServisi', () => ({
    TakvimCakismaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: (...a: unknown[]) => mockPlanla(...a) }) },
}));
const mockIzinDurumu = jest.fn();
const mockIzinIste = jest.fn();
jest.mock('../../../../domain/services/TakvimEtkinlikOkuyucu', () => ({
    takvimIzinDurumunuOku: (...a: unknown[]) => mockIzinDurumu(...a),
    takvimIzniIste: (...a: unknown[]) => mockIzinIste(...a),
}));

import { TakvimCakismaBolumu } from '../TakvimCakismaBolumu';

const KONUM = { lat: 41.0, lng: 29.0 };

const kur = () => {
    const store = configureStore({
        reducer: { takvimCakisma: takvimCakismaReducer, konum: () => ({ koordinatlar: KONUM }) },
    });
    const ekran = render(
        <Provider store={store}>
            <TakvimCakismaBolumu />
        </Provider>
    );
    return { store, ...ekran };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockDisk = takvimCakismaAyarlariniNormalize(null);
    mockIzinDurumu.mockResolvedValue('verilmedi');
    mockIzinIste.mockResolvedValue(true);
});

describe('TakvimCakismaBolumu', () => {
    it('anahtar özelliği DOĞRUDAN açmaz: önce açıklama, kabul + izinle açılır (rıza kaydıyla)', async () => {
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);

        expect(await findByText('Takviminiz okunsun mu?')).toBeTruthy();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
        expect(mockIzinIste).not.toHaveBeenCalled();

        fireEvent.press(getByLabelText('Kabul ediyorum, takvim iznini isteyin'));
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(true));
        expect(mockIzinIste).toHaveBeenCalledTimes(1);
        expect(store.getState().takvimCakisma.ayarlar.rizaZamani).toEqual(expect.any(String));
        expect(mockPlanla).toHaveBeenCalledWith(KONUM);
    });

    it('vazgeçilirse hiçbir şey yazılmaz ve izin istenmez', async () => {
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);
        await findByText('Takviminiz okunsun mu?');
        fireEvent.press(getByLabelText('Vazgeç'));
        await waitFor(() => expect(mockIzinIste).not.toHaveBeenCalled());
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
    });

    it('sistem izni reddedilirse özellik AÇILMAZ ve ayarlara yönlendiren bilgi çıkar', async () => {
        mockIzinIste.mockResolvedValue(false);
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);
        await findByText('Takviminiz okunsun mu?');
        fireEvent.press(getByLabelText('Kabul ediyorum, takvim iznini isteyin'));
        expect(await findByText('Takvim izni verilmedi')).toBeTruthy();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
    });

    it('açıkken izin geri alınmışsa uyarı ve "İzin verin" düğmesi görünür', async () => {
        mockDisk = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-01T00:00:00.000Z' });
        const { findByText, findByLabelText } = kur();
        expect(await findByText('Takvim izni kapalı olduğu için uyarı gönderilemiyor.')).toBeTruthy();
        fireEvent.press(await findByLabelText('Takvim iznini verin'));
        await waitFor(() => expect(mockPlanla).toHaveBeenCalledWith(KONUM));
    });

    it('kapatmak rıza kaydını siler', async () => {
        mockDisk = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-01T00:00:00.000Z' });
        mockIzinDurumu.mockResolvedValue('verildi');
        const { findByText, getByLabelText, store } = kur();
        await findByText('Ne kadar önce');
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', false);
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false));
        expect(mockDisk.rizaZamani).toBeUndefined();
    });
});
