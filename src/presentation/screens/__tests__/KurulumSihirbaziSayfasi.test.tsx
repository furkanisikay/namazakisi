/**
 * Kurulum sihirbazı (5 adım) — davranış sözleşmesi:
 *  - izin ÖNCE okunur; zaten verilmişse sistem diyaloğu HİÇ açılmaz,
 *  - otomatik ilerleme yok (izin/konum sonrası aynı adımda kalınır),
 *  - kayıt yalnız son düğmede; bayrak en son; hata ekranda,
 *  - sesli okuma rızası yalnız bilgilendirme maddesi görüldüyse yazılır.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{`ikon:${p.name}`}</Text>;
});
jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');
    return { SafeAreaView: (p: { children?: React.ReactNode }) => <View>{p.children}</View> };
});
const RENKLER = {
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    basarili: '#4CAF50',
    dikkat: '#E65100',
    bilgi: '#2196F3',
    hata: '#F44336',
};
jest.mock('../../../core/theme', () => ({ useRenkler: () => RENKLER, useTema: () => ({ koyuMu: false }) }));
jest.mock('../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
const mockDispatch = jest.fn((_a: unknown) => ({ unwrap: () => Promise.resolve() }));
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
const mockAlaniOku = jest.fn();
jest.mock('../../../domain/services/CihazDurumOkuyucu', () => ({ alaniOku: (a: string) => mockAlaniOku(a) }));
jest.mock('../../../core/utils/Logger', () => ({ Logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() } }));
jest.mock('../../store/sadeGorunumSlice', () => ({ sadeGorunumuAyarla: (a: boolean) => ({ type: 'test/sade', payload: a }) }));

import { KurulumSihirbaziSayfasi, zamanAsimiyla, GPS_ZAMAN_ASIMI_MS } from '../KurulumSihirbaziSayfasi';

const izinler: Record<string, string | null> = {};
const navigation = { replace: jest.fn() };

const kur = async () => {
    const ekran = render(<KurulumSihirbaziSayfasi navigation={navigation as never} route={{} as never} />);
    await act(async () => {
        await Promise.resolve();
    });
    return ekran;
};

const muhafizEylemi = () =>
    mockDispatch.mock.calls
        .map((c) => c[0] as { type?: string; payload?: Record<string, unknown> })
        .find((a) => a?.type === 'muhafiz/muhafizAyarlariniGuncelle');

/** Hoş geldiniz → konum (izin var) → bildirim → düzey. */
const duzeyeGit = async (e: Awaited<ReturnType<typeof kur>>) => {
    fireEvent.press(e.getByTestId('basla'));
    await waitFor(() => e.getByText('Konumumu kullanın'));
    fireEvent.press(e.getByTestId('konum-bul'));
    await waitFor(() => e.getByTestId('konum-alindi'));
    fireEvent.press(e.getByTestId('devam'));
    await waitFor(() => e.getByTestId('bildirim-izin-var'));
    fireEvent.press(e.getByTestId('devam'));
    await waitFor(() => e.getByTestId('duzey-secici'));
};

beforeEach(() => {
    jest.clearAllMocks();
    izinler.konumIzni = 'verildi';
    izinler.bildirimIzni = 'verildi';
    mockAlaniOku.mockImplementation(async (a: string) => izinler[a] ?? null);
    mockDispatch.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 40.99, longitude: 29.03 } });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ city: 'İstanbul', district: 'Kadıköy' }]);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

describe('KurulumSihirbaziSayfasi', () => {
    it('beş adımı "Adım N / 5" ile söyler', async () => {
        const e = await kur();
        expect(e.getByLabelText('Adım 1 / 5')).toBeTruthy();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByLabelText('Adım 2 / 5'));
    });

    it('izinler zaten verilmişse sistem diyaloğu açılmaz ve kendiliğinden ilerlenmez', async () => {
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-izin-var'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByText('Konum alındı · Kadıköy'));
        // Konum alındıktan sonra adımda KALINIR.
        expect(e.getByLabelText('Adım 2 / 5')).toBeTruthy();
        expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('bildirim-izin-var'));
        expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
        expect(e.getByLabelText('Adım 3 / 5')).toBeTruthy();
    });

    it('bildirim izni istenince sonuç YENİDEN okunur; verildiyse adımda kalınır', async () => {
        izinler.bildirimIzni = 'sorulabilir';
        (Notifications.requestPermissionsAsync as jest.Mock).mockImplementation(async () => {
            izinler.bildirimIzni = 'verildi';
            return { status: 'granted' };
        });
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByTestId('devam'));
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('bildirim-izin'));
        fireEvent.press(e.getByTestId('bildirim-izin'));
        await waitFor(() => e.getByTestId('bildirim-izin-var'));
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
        expect(e.getByLabelText('Adım 3 / 5')).toBeTruthy();
    });

    it('kalıcı redde "Ayarları açın" ve "Şimdilik geçin" sunulur', async () => {
        izinler.bildirimIzni = 'reddedildi';
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByTestId('devam'));
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('bildirim-ayarlar'));
        expect(e.getByTestId('bildirim-kalici-red')).toBeTruthy();
        expect(e.getByTestId('bildirim-gec')).toBeTruthy();
    });

    it('GPS başarısızsa nedeni yazar ve şehir listesine düşer', async () => {
        (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('gps'));
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByTestId('konum-hata'));
        fireEvent.changeText(e.getByLabelText('Şehir arayın'), 'izmir');
        fireEvent.press(e.getByLabelText('İzmir'));
        fireEvent.press(e.getByText('İzmir ile devam edin'));
        await waitFor(() => e.getByLabelText('Adım 3 / 5'));
        const konum = mockDispatch.mock.calls.map((c) => c[0] as { type?: string; payload?: { konumModu?: string } }).find((a) => a?.payload?.konumModu === 'manuel');
        expect(konum).toBeTruthy();
    });

    it('Normal düzey: sesli bilgi görünür → rıza yazılır; bayrak EN SON; ana ekrana geçilir', async () => {
        const e = await kur();
        await duzeyeGit(e);
        expect(e.getByTestId('duzey-sesli-bilgi')).toBeTruthy();
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('MainTabs'));
        const m = muhafizEylemi();
        expect(m?.payload).toMatchObject({ aktif: true, yogunluk: 'normal', sesliOnayi: true });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@namaz_akisi/ilk_kurulum_tamamlandi', 'true');
        const bayrakSirasi = (AsyncStorage.setItem as jest.Mock).mock.invocationCallOrder[0];
        expect(Math.max(...mockDispatch.mock.invocationCallOrder)).toBeLessThan(bayrakSirasi);
    });

    it('Hafif ve Kapalı düzeyde sesli bilgi görünmez → rıza YAZILMAZ', async () => {
        const e = await kur();
        await duzeyeGit(e);
        fireEvent.press(e.getByLabelText(/^Hafif\./));
        expect(e.queryByTestId('duzey-sesli-bilgi')).toBeNull();
        fireEvent.press(e.getByLabelText(/^Kapalı\./));
        expect(e.queryByTestId('duzey-sesli-bilgi')).toBeNull();
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalled());
        const m = muhafizEylemi();
        expect(m?.payload?.aktif).toBe(false);
        expect(m?.payload?.sesliOnayi).toBeUndefined();
    });

    it('sade görünüm anahtarı açılırsa ayar yazılır', async () => {
        const e = await kur();
        await duzeyeGit(e);
        fireEvent(e.getByRole('switch'), 'valueChange', true);
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByText('Sade görünüm açık'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalled());
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'test/sade', payload: true });
    });

    it('sade görünüm kapalı bırakılırsa ayarına hiç dokunulmaz', async () => {
        const e = await kur();
        await duzeyeGit(e);
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalled());
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'test/sade' }));
    });

    it('kayıt hatası ekranda yazılır, ana ekrana geçilmez', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('disk'));
        const e = await kur();
        await duzeyeGit(e);
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => e.getByTestId('kurulum-hata'));
        expect(navigation.replace).not.toHaveBeenCalled();
        expect(e.getByText('Tekrar deneyin')).toBeTruthy();
    });

    it('NÖBETÇİ: vakit bildirimi yazımı başarısızsa kurulum yine TAMAMLANIR (döngü yok)', async () => {
        mockDispatch.mockImplementation((a: unknown) => ({
            unwrap: () => (typeof a === 'function' ? Promise.reject(new Error('disk')) : Promise.resolve()),
        }));
        const e = await kur();
        await duzeyeGit(e);
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('MainTabs'));
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@namaz_akisi/ilk_kurulum_tamamlandi', 'true');
    });

    it('NÖBETÇİ: sade görünüm yazımı başarısızsa kurulum yine TAMAMLANIR', async () => {
        mockDispatch.mockImplementation((a: unknown) => ({
            unwrap: () =>
                (a as { type?: string })?.type === 'test/sade' ? Promise.reject(new Error('disk')) : Promise.resolve(),
        }));
        const e = await kur();
        await duzeyeGit(e);
        fireEvent(e.getByRole('switch'), 'valueChange', true);
        fireEvent.press(e.getByTestId('devam'));
        await waitFor(() => e.getByTestId('tamamla'));
        fireEvent.press(e.getByTestId('tamamla'));
        await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('MainTabs'));
    });

    it('konum alınırken "Vazgeçin" şehir listesine geçer; geç gelen GPS sonucu yok sayılır', async () => {
        let coz: (v: unknown) => void = () => undefined;
        (Location.getCurrentPositionAsync as jest.Mock).mockReturnValue(new Promise((c) => (coz = c)));
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByTestId('konum-vazgec'));
        fireEvent.press(e.getByTestId('konum-vazgec'));
        await waitFor(() => e.getByLabelText('Şehir arayın'));
        await act(async () => {
            coz({ coords: { latitude: 1, longitude: 2 } });
            await Promise.resolve();
        });
        expect(e.getByLabelText('Şehir arayın')).toBeTruthy();
        const oto = mockDispatch.mock.calls.map((c) => c[0] as { payload?: { konumModu?: string } }).find((a) => a?.payload?.konumModu === 'oto');
        expect(oto).toBeUndefined();
    });

    it('konum izni kalıcı reddedilmişse boş istek turu yapılmaz, liste + nedeni gösterilir', async () => {
        izinler.konumIzni = 'reddedildi';
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByLabelText('Şehir arayın'));
        expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
        expect(e.getByText('Konum izni kapalı. Ayarlardan açabilir ya da şehir seçebilirsiniz.')).toBeTruthy();
        expect(e.getByTestId('konum-ayarlar')).toBeTruthy();
    });

    it('konum izni okunamazsa (null) kullanıcıya söylenir ve listeye geçilir', async () => {
        izinler.konumIzni = null;
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByTestId('konum-bul'));
        fireEvent.press(e.getByTestId('konum-bul'));
        await waitFor(() => e.getByText('Konum izni okunamadı. Şehrinizi seçin.'));
    });

    it('konum açıklaması yanlış vaat vermez ("hiçbir yere gönderilmez" DEMEZ)', async () => {
        const e = await kur();
        fireEvent.press(e.getByTestId('basla'));
        await waitFor(() => e.getByText('Konumunuz sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz.'));
        expect(e.queryByText(/hiçbir yere gönderilmez/)).toBeNull();
    });
});

describe('zamanAsimiyla (GPS)', () => {
    afterEach(() => jest.useRealTimers());
    it(`${GPS_ZAMAN_ASIMI_MS} ms içinde yanıt yoksa reddeder`, async () => {
        jest.useFakeTimers();
        const p = zamanAsimiyla(new Promise(() => undefined), GPS_ZAMAN_ASIMI_MS);
        jest.advanceTimersByTime(GPS_ZAMAN_ASIMI_MS);
        await expect(p).rejects.toThrow('zaman aşımı');
    });
    it('zamanında gelen sonucu geçirir', async () => {
        await expect(zamanAsimiyla(Promise.resolve(5), 1000)).resolves.toBe(5);
    });
});
