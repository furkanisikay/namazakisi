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
        durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
    }),
}));
jest.mock('../../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('../../../hooks/useBildirimButcesi', () => {
    const gercek = jest.requireActual('../../../hooks/useBildirimButcesi');
    return { ...gercek, useBildirimButcesi: () => gercek.butceNesnesiOlustur('android', null, null) };
});
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

// Bugünün yatsı girişi test anına ve saat dilimine bağlı → karar mock'lanır (saf
// fonksiyonun kendisi `yatisPlani.test.ts`'te ölçülür).
const mockYatsiOncesi = jest.fn();
jest.mock('../../../../core/yatis/yatisPlani', () => ({
    ...jest.requireActual('../../../../core/yatis/yatisPlani'),
    yatsiOncesiTetikBilgisi: (...a: unknown[]) => mockYatsiOncesi(...a),
}));

import reducer from '../../../store/yatisHatirlatmaSlice';
import rizaReducer from '../../../store/hatirlatmaRizaSlice';
import {
    YatisHatirlatmaBolumu,
    YATIS_YON_GEREKCESI,
    pencereDakikasindanSaate,
    saatiPencereDakikasinaCevir,
} from '../YatisHatirlatmaBolumu';
import { YATIS_VARSAYILAN_AYARLARI, type YatisAyarlari } from '../../../../core/yatis/yatisPlani';

const kur = (ayarlar: Partial<YatisAyarlari> = {}) => {
    const baslangic = { ...YATIS_VARSAYILAN_AYARLARI, ...ayarlar };
    mockDisk = baslangic;
    const store = configureStore({
        reducer: {
            yatisHatirlatma: reducer,
            hatirlatmaRiza: rizaReducer,
            konum: () => ({ koordinatlar: { lat: 41, lng: 29 } }),
        },
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
    mockYatsiOncesi.mockReturnValue(null);
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

    describe('yatış yatsıdan önce (Fable M2 — sessiz sapma yok)', () => {
        const yatsi = new Date(2026, 5, 21, 22, 4);

        it('yatsı hatırlatması açıkken: saat yatsıdan önce, hatırlatma yatsı girdikten sonra gelir', () => {
            mockYatsiOncesi.mockReturnValue({ yatsiGiris: yatsi });
            const { getByText } = kur({ aktif: true, saat: 20, dakika: 30, onceDk: 30 });
            expect(
                getByText('Hatırlatma saati (20:00) bugün yatsı vaktinden (22:04) önce. Yatsı hatırlatması yatsı girdikten sonra gelir.')
            ).toBeTruthy();
            expect(mockYatsiOncesi).toHaveBeenCalledWith(
                { lat: 41, lng: 29 },
                { saat: 20, dakika: 30, onceDk: 30 },
                expect.any(Date)
            );
        });

        it('yalnız muhasebe açıkken: muhasebenin yatsıyı saymadığını söyler', () => {
            mockYatsiOncesi.mockReturnValue({ yatsiGiris: yatsi });
            const { getByText } = kur({ aktif: true, saat: 20, dakika: 30, onceDk: 30, yatsiHatirlatmasi: false });
            expect(getByText(/Gün sonu muhasebesi yatsıyı saymaz\./)).toBeTruthy();
        });

        it('saat yatsıdan sonraysa satır YOK', () => {
            const { queryByText } = kur({ aktif: true });
            expect(queryByText(/yatsı vaktinden/)).toBeNull();
        });
    });

    describe('ortak hatırlatma kartı (plan §5.3)', () => {
        it('YÖN GEREKÇESİ ekranda; akış önizlemesi yatışın GERÇEK içeriğini gösterir', () => {
            const ekran = kur({ aktif: true });
            expect(ekran.getByTestId('yon-sabit-gerekcesi')).toBeTruthy();
            expect(ekran.getByText(YATIS_YON_GEREKCESI)).toBeTruthy();
            fireEvent.press(ekran.getByLabelText('Yatış hatırlatması akışını önizleyin'));
            expect(ekran.getByText('Yatış hatırlatması akışı')).toBeTruthy();
            expect(ekran.getAllByText(/^Yatsı · yatmadan önce kıl/).length).toBeGreaterThan(0);
        });

        it('STANDART yetenekler: iki kanal anahtarı + gerçek alarm; sesli rıza ORTAK kayda (tek rıza) yazılır', async () => {
            const ekran = kur({ aktif: true });
            fireEvent.press(ekran.getByLabelText(/^Hatırlatma — düzenleyin/));
            // Birleşik modül: iki ANA anahtar + "Gelişmiş" bölümünde gerçek alarm.
            expect(ekran.getByTestId('adim-bildirim-anahtari')).toBeTruthy();
            fireEvent.press(ekran.getByTestId('adim-gelismis'));
            expect(ekran.getByTestId('adim-alarm-anahtari')).toBeTruthy();
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            expect(mockKaydet).not.toHaveBeenCalled();
            fireEvent.press(ekran.getByLabelText('Sesli okumayı açın'));
            await waitFor(() => expect(mockKaydet).toHaveBeenCalledTimes(1));
            const kayit = mockKaydet.mock.calls[0][0];
            expect(kayit.sesliOnayi).toBeUndefined();
            expect(ekran.store.getState().hatirlatmaRiza.kayit.sesliOnayi).toBe(true);
            expect(kayit.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true });
        });

        it('adım ekleme yeni adımı (5 dk katında, yatıştan daha önce) yazar; çıkışta kaybolmaz', async () => {
            const ekran = kur({ aktif: true });
            fireEvent.press(ekran.getByText(/Hatırlatma ekleyin/));
            ekran.unmount();
            await waitFor(() => expect(mockKaydet).toHaveBeenCalledTimes(1));
            expect(mockKaydet.mock.calls[0][0].adimlar.map((a: { esikDk: number }) => a.esikDk)).toEqual([35, 30]);
        });
    });
});
