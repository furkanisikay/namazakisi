/**
 * Bildirim Ayarları > Yatış hatırlatması bölümü (issue #290).
 *
 * Ölçülen: kapalıyken yalnız ana anahtar; açılınca yatış saati stepper'ı
 * (20:00–02:55, gece yarısını sarar) ve ortak hatırlatma kartı çizilir; saat
 * değişikliği DEBOUNCE ile tek yazmaya iner.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        hata: '#F44336',
        bilgi: '#2196F3',
        basarili: '#4CAF50',
    }),
}));
jest.mock('../../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
// Modal native ses/TTS köprüsünü çeker (requireNativeModule jest'te yok); burada açılmaz.
jest.mock('../../hatirlatma/AdimDetayModal', () => ({ AdimDetayModal: () => null }));

const mockKaydet = jest.fn();
let mockDisk: Record<string, unknown> = {};
jest.mock('../../../../data/local/LocalYatisHatirlatmaServisi', () => ({
    LocalYatisHatirlatmaServisi: {
        saveAyarlar: async (a: Record<string, unknown>) => {
            mockKaydet(a);
            mockDisk = a;
            return true;
        },
        getAyarlar: async () => mockDisk,
    },
}));
jest.mock('../../../../domain/services/YatisHatirlatmaServisi', () => ({
    YatisHatirlatmaServisi: { getInstance: () => ({ hatirlatmalariGuncelle: jest.fn().mockResolvedValue(undefined) }) },
}));

import reducer from '../../../store/yatisHatirlatmaSlice';
import {
    YatisHatirlatmaBolumu,
    pencereDakikasindanSaate,
    saatiPencereDakikasinaCevir,
} from '../YatisHatirlatmaBolumu';
import { YATIS_VARSAYILAN_AYARLARI, type YatisAyarlari } from '../../../../core/yatis/yatisPlani';

const kur = (ayarlar: Partial<YatisAyarlari> = {}) => {
    const baslangic = { ...YATIS_VARSAYILAN_AYARLARI, ...ayarlar };
    mockDisk = baslangic;
    const store = configureStore({
        reducer: { yatisHatirlatma: reducer, konum: () => ({ koordinatlar: { lat: 41, lng: 29 } }) },
        preloadedState: { yatisHatirlatma: { ayarlar: baslangic, yukleniyor: false, hata: null } },
    });
    const ekran = render(
        <Provider store={store}>
            <YatisHatirlatmaBolumu />
        </Provider>
    );
    return { store, ...ekran };
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('saat dönüşümü (20:00 tabanlı, gece yarısını sarar)', () => {
    it.each([
        [20, 0, 0],
        [23, 30, 210],
        [0, 0, 240],
        [2, 55, 415],
    ])('%i:%i ↔ %i dk', (saat, dakika, dk) => {
        expect(saatiPencereDakikasinaCevir(saat, dakika)).toBe(dk);
        expect(pencereDakikasindanSaate(dk)).toEqual({ saat, dakika });
    });
});

describe('YatisHatirlatmaBolumu', () => {
    it('kapalıyken yalnız ana anahtar görünür', () => {
        const { queryByLabelText, getByLabelText } = kur();
        expect(getByLabelText('Yatış hatırlatması')).toBeTruthy();
        expect(queryByLabelText(/Yatış saati/)).toBeNull();
    });

    it('ana anahtar ayarı kaydeder', async () => {
        const { getByLabelText, store } = kur();
        fireEvent(getByLabelText('Yatış hatırlatması'), 'valueChange', true);
        await waitFor(() => expect(store.getState().yatisHatirlatma.ayarlar.aktif).toBe(true));
        expect(mockKaydet).toHaveBeenCalledWith(expect.objectContaining({ aktif: true }));
    });

    it('açıkken yatış saati, ortak kart ve iki alt seçenek görünür', () => {
        const { getByLabelText, getByText } = kur({ aktif: true });
        expect(getByLabelText('Yatış saati 23:00')).toBeTruthy();
        expect(getByText('Yatsı hatırlatması')).toBeTruthy();
        expect(getByText('Gün sonu muhasebesi')).toBeTruthy();
    });

    it('saat stepper\'ı gece yarısını aşar ve arka arkaya basışlar TEK yazmaya iner', async () => {
        // Yalnız setTimeout sahte: React scheduler'ının API'leri gerçek kalsın (AGENTS.md CI asılma dersi).
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'performance'] });
        try {
            const { getByLabelText } = kur({ aktif: true, saat: 23, dakika: 55 });
            const ileri = getByLabelText('Yatış saatini 5 dakika ileri alın');
            fireEvent.press(ileri);
            fireEvent.press(ileri);
            expect(getByLabelText('Yatış saati 00:05')).toBeTruthy();
            expect(mockKaydet).not.toHaveBeenCalled();
            await act(async () => {
                jest.advanceTimersByTime(1300);
            });
            expect(mockKaydet).toHaveBeenCalledTimes(1);
            expect(mockKaydet).toHaveBeenCalledWith(expect.objectContaining({ saat: 0, dakika: 5 }));
        } finally {
            jest.useRealTimers();
        }
    });

    it('aralığın uçlarında stepper pasif', () => {
        const { getByLabelText } = kur({ aktif: true, saat: 20, dakika: 0 });
        expect(getByLabelText('Yatış saatini 5 dakika geri alın').props.accessibilityState).toMatchObject({ disabled: true });
    });
});
