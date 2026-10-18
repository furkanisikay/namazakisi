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
        bilgi: '#2196F3',
        durum: { uyari: '#FFC107', hata: '#F44336', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
        hata: '#F44336',
    }),
}));
jest.mock('../../../../core/feedback', () => ({
    useFeedback: () => ({ butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined) }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
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

import { TakvimCakismaBolumu, TAKVIM_CAKISMA_YON_GEREKCESI } from '../TakvimCakismaBolumu';
import rizaReducer from '../../../store/hatirlatmaRizaSlice';

const KONUM = { lat: 41.0, lng: 29.0 };

const kur = (props: { acilistaAc?: boolean } = {}) => {
    const store = configureStore({
        reducer: { takvimCakisma: takvimCakismaReducer, hatirlatmaRiza: rizaReducer, konum: () => ({ koordinatlar: KONUM }) },
    });
    const ekran = render(
        <Provider store={store}>
            <TakvimCakismaBolumu {...props} />
        </Provider>
    );
    return { store, ...ekran };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockDisk = takvimCakismaAyarlariniNormalize(null);
    mockIzinDurumu.mockResolvedValue('verilmedi');
    mockIzinIste.mockResolvedValue({ verildi: true, tekrarSorulabilir: true });
});

describe('TakvimCakismaBolumu', () => {
    it('anahtar özelliği DOĞRUDAN açmaz: önce açıklama, kabul + izinle açılır (rıza kaydıyla)', async () => {
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);

        expect(await findByText('Takviminiz okunsun mu?')).toBeTruthy();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
        expect(mockIzinIste).not.toHaveBeenCalled();

        fireEvent.press(getByLabelText('Kabul ediyorum, takvim iznini isteyin'));
        // İzin, rıza modalı kapanırken AYNI ANDA istenmez (Samsung iç testi): önce modal kapanır.
        expect(mockIzinIste).not.toHaveBeenCalled();
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(true));
        expect(mockIzinIste).toHaveBeenCalledTimes(1);
        expect(store.getState().takvimCakisma.ayarlar.rizaZamani).toEqual(expect.any(String));
        expect(mockPlanla).toHaveBeenCalledWith(KONUM);
    });

    it('Hatırlatmalar sayfasından "aç" isteğiyle gelinince açıklama kendiliğinden açılır; yine rızasız AÇILMAZ', async () => {
        const { findByText, store } = kur({ acilistaAc: true });
        expect(await findByText('Takviminiz okunsun mu?')).toBeTruthy();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
        expect(mockIzinIste).not.toHaveBeenCalled();
    });

    it('açma isteği olmadan açıklama kendiliğinden açılmaz', async () => {
        const { queryByText } = kur();
        await waitFor(() => expect(mockIzinDurumu).toHaveBeenCalled());
        expect(queryByText('Takviminiz okunsun mu?')).toBeNull();
    });

    it('vazgeçilirse hiçbir şey yazılmaz ve izin istenmez', async () => {
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);
        await findByText('Takviminiz okunsun mu?');
        fireEvent.press(getByLabelText('Vazgeç'));
        await waitFor(() => expect(mockIzinIste).not.toHaveBeenCalled());
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
    });

    it('sistem izni kalıcı reddedilmişse özellik AÇILMAZ ve ayarlara yönlendiren bilgi çıkar', async () => {
        mockIzinIste.mockResolvedValue({ verildi: false, tekrarSorulabilir: false });
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);
        await findByText('Takviminiz okunsun mu?');
        fireEvent.press(getByLabelText('Kabul ediyorum, takvim iznini isteyin'));
        expect(await findByText('Takvim izni verilmedi')).toBeTruthy();
        expect(await findByText('Ayarları açın')).toBeTruthy();
        expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false);
    });

    it('diyalog yeniden açılabiliyorsa "Tekrar deneyin" sunulur ve ikinci denemede açılır', async () => {
        mockIzinIste
            .mockResolvedValueOnce({ verildi: false, tekrarSorulabilir: true })
            .mockResolvedValueOnce({ verildi: true, tekrarSorulabilir: true });
        const { getByLabelText, findByText, store } = kur();
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', true);
        await findByText('Takviminiz okunsun mu?');
        fireEvent.press(getByLabelText('Kabul ediyorum, takvim iznini isteyin'));
        fireEvent.press(await findByText('Tekrar deneyin'));
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(true));
        expect(mockIzinIste).toHaveBeenCalledTimes(2);
        expect(store.getState().takvimCakisma.ayarlar.rizaZamani).toEqual(expect.any(String));
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
        await findByText('Etkinlik adını gösterin');
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', false);
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false));
        expect(mockDisk.rizaZamani).toBeUndefined();
    });

    it('ortak kart: YÖN GEREKÇESİ ekranda, akış önizlemesi; ad gizliliği açıklaması', async () => {
        mockDisk = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-01T00:00:00.000Z' });
        mockIzinDurumu.mockResolvedValue('verildi');
        const ekran = kur();
        expect(await ekran.findByTestId('yon-sabit-gerekcesi')).toBeTruthy();
        expect(ekran.getByText(TAKVIM_CAKISMA_YON_GEREKCESI)).toBeTruthy();
        expect(ekran.getByText(/Sesli anonsta ve gerçek alarm ekranında ad hiçbir zaman yer almaz/)).toBeTruthy();
        expect(ekran.getByText(/ilk uyarı etkinlikten 30 dk önce gelir/)).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Takvim çakışması akışını önizleyin'));
        expect(ekran.getByText('Takvim çakışması akışı')).toBeTruthy();
    });

    it('STANDART yetenekler adım detayında: iki kanal anahtarı + GERÇEK ALARM; sesli rıza ORTAK kayda (tek rıza), adsız örnekle', async () => {
        mockDisk = takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-01T00:00:00.000Z' });
        mockIzinDurumu.mockResolvedValue('verildi');
        const ekran = kur();
        fireEvent.press(await ekran.findByLabelText(/^Hatırlatma — düzenleyin/));
        // Birleşik modül: iki ANA anahtar + "Gelişmiş" bölümünde gerçek alarm.
        expect(ekran.getByTestId('adim-bildirim-anahtari')).toBeTruthy();
        fireEvent.press(ekran.getByTestId('adim-gelismis'));
        expect(ekran.getByTestId('adim-alarm-anahtari')).toBeTruthy();
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(ekran.getByText('Sesli okuma açılsın mı?')).toBeTruthy();
        expect(ekran.getAllByText(/Takviminizdeki bir etkinlik öğle vaktine denk geliyor/).length).toBeGreaterThan(0);
        fireEvent.press(ekran.getByLabelText('Sesli okumayı açın'));
        await waitFor(() => expect(mockDisk.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true }));
        expect(ekran.store.getState().hatirlatmaRiza.kayit.sesliOnayi).toBe(true);
        expect(mockDisk.sesliOnayi).toBeUndefined();
        // Takvim rızası korunur (sesli rızası ayrı alan).
        expect(mockDisk.rizaZamani).toBe('2026-10-01T00:00:00.000Z');
        expect(mockDisk.aktif).toBe(true);
    });

    it('kapatmak sesli/alarm rızasını SİLMEZ (yalnız takvim rızası)', async () => {
        mockDisk = takvimCakismaAyarlariniNormalize({
            aktif: true,
            rizaZamani: '2026-10-01T00:00:00.000Z',
            sesliOnayi: true,
            alarmOnayi: true,
        });
        mockIzinDurumu.mockResolvedValue('verildi');
        const { findByText, getByLabelText, store } = kur();
        await findByText('Etkinlik adını gösterin');
        fireEvent(getByLabelText('Takvim çakışması uyarısı'), 'valueChange', false);
        await waitFor(() => expect(store.getState().takvimCakisma.ayarlar.aktif).toBe(false));
        expect(mockDisk).toMatchObject({ sesliOnayi: true, alarmOnayi: true });
        expect(mockDisk.rizaZamani).toBeUndefined();
    });
});
