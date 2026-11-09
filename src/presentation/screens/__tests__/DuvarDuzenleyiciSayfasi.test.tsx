/**
 * Duvar kâğıdı düzenleyicisi: sekmeler, hazır görünüm, "Uygulayın" (kaydet; Android'de açıksa
 * hemen uygula, kapalıysa yalnız kaydet), "Vazgeçin" (kaydetmez), yazı saat alanına girmez
 * (ekran okuyucu taşıması da kıstırılır), fotoğraf akışı (sistem seçicisi + uygulama kopyası;
 * değiştirilen ve uygulanmayan kopyalar silinir; iPhone'da eski ikilide bilgi satırı).
 *
 * Sahte zamanlayıcı YOK (tam sayfa render, test-tuzaklari.md).
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Image, Platform } from 'react-native';
import { DuvarDuzenleyiciSayfasi } from '../DuvarDuzenleyiciSayfasi';
import { VARSAYILAN_DUVAR_AYARI, type DuvarKagidiAyari } from '../../../core/icerik/gununAyetiYuku';
import { IZINLI_BANTLAR, saatAlaniBul } from '../../../core/icerik/duvarTasarimi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const mockServis = {
    duvarAyariOku: jest.fn(),
    duvarAyariKaydet: jest.fn(),
    duvarKagidiniSimdiUygula: jest.fn(),
    kilitEkraniProfili: jest.fn(),
    saatAlaniKaynagiOku: jest.fn(),
    saatAlaniKaynagiKaydet: jest.fn(),
};
jest.mock('../../../domain/services/GununAyetiServisi', () => ({ GununAyetiServisi: { getInstance: () => mockServis } }));

const mockGoBack = jest.fn();
let mockParametreler: Record<string, unknown> | undefined;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    // Geçiş sonu (`transitionEnd`) hemen yayılır: düzenleyici "Fotoğraf" hazırında seçiciyi ancak ondan sonra açar.
    useNavigation: () => ({
        goBack: mockGoBack,
        navigate: jest.fn(),
        addListener: (olay: string, dinleyici: (e: { data?: { closing?: boolean } }) => void) => {
            if (olay === 'transitionEnd') setTimeout(() => dinleyici({ data: { closing: false } }), 0);
            return () => undefined;
        },
    }),
    useRoute: () => ({ params: mockParametreler }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('../../../core/theme', () => ({
    useRenkler: () => ({ arkaplan: '#ffffff', kartArkaplan: '#eeeeee', birincil: '#2E7D32', metin: '#333333', metinIkincil: '#666666', sinir: '#cccccc' }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => () => null);
jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('../../store/hooks', () => ({
    useAppSelector: (sec: (s: unknown) => unknown) => sec({ konum: { koordinatlar: { lat: 0, lng: 0 } } }),
}));
const mockKisaBildirim = jest.fn();
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: (...a: unknown[]) => mockKisaBildirim(...a) }));

// Fotoğraf: sistem seçicisi, dosya sistemi ve özet (gerçek `duvarFotografi` bunlarla çalışır).
const mockSec = jest.fn();
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: (...a: unknown[]) => mockSec(...a) }));
const mockKopyala = jest.fn();
const mockSil = jest.fn();
jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: 'file:///belge/',
    makeDirectoryAsync: jest.fn(() => Promise.resolve()),
    copyAsync: (...a: unknown[]) => mockKopyala(...a),
    deleteAsync: (...a: unknown[]) => mockSil(...a),
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'abcdef12-3456-7890-abcd-ef1234567890' }));
// iPhone köprüsünde `duvarFotografiniYaz` eski ikilide yok: bilgi satırı beklenir.
jest.mock('../../../../modules/expo-siri-kisayollari/src', () => ({}));

const YENI_DOSYA = 'duvar-foto-abcdef1234567890.jpg';

const kaydedilen = (): DuvarKagidiAyari => mockServis.duvarAyariKaydet.mock.calls.at(-1)?.[0];

async function ac(ayar: Partial<DuvarKagidiAyari> = {}) {
    mockServis.duvarAyariOku.mockResolvedValue({ ...VARSAYILAN_DUVAR_AYARI, ...ayar });
    const e = render(<DuvarDuzenleyiciSayfasi />);
    const alan = await e.findByTestId('duvar-alan');
    fireEvent(alan, 'layout', { nativeEvent: { layout: { width: 360, height: 500, x: 0, y: 0 } } });
    await e.findByTestId('duvar-tuval');
    return e;
}

/** Önizlemenin görünmez ölçüm kopyası ölçülür (yerleşim native gibi ölçüden hesaplanır). */
function olcBlok(e: Awaited<ReturnType<typeof ac>>, yukseklik: number) {
    const olcum = e.getByTestId('duvar-yazi-olcum', { includeHiddenElements: true });
    fireEvent(olcum, 'layout', { nativeEvent: { layout: { width: 200, height: yukseklik, x: 0, y: 0 } } });
}

describe('DuvarDuzenleyiciSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockParametreler = undefined;
        mockServis.duvarAyariKaydet.mockResolvedValue(undefined);
        mockServis.duvarKagidiniSimdiUygula.mockResolvedValue(true);
        mockServis.saatAlaniKaynagiOku.mockResolvedValue(null);
        mockServis.saatAlaniKaynagiKaydet.mockResolvedValue(undefined);
        mockSec.mockResolvedValue({ canceled: true, assets: null });
        mockKopyala.mockResolvedValue(undefined);
        mockSil.mockResolvedValue(undefined);
        jest.replaceProperty(Platform, 'OS', 'android');
        // Kayıtlı fotoğrafın boyutu (kırpma için).
        jest.spyOn(Image, 'getSize').mockImplementation(((_u: string, ok: (g: number, y: number) => void) => ok(1000, 2000)) as never);
    });
    afterEach(() => jest.restoreAllMocks());

    it('sekmeler arasında geçilir; zemin, yazı tipi, hiza ve süs seçimi kaydedilir', async () => {
        const e = await ac();
        expect(e.getByText('Vakte uysun')).toBeTruthy();
        expect(e.getByText(/Her vakit girdiğinde/)).toBeTruthy();
        fireEvent.press(e.getByTestId('duvar-zemin-yatsi'));
        fireEvent(e.getByTestId('duvar-vakte-uysun'), 'valueChange', false);

        fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
        expect(e.queryByTestId('duvar-zemin-yatsi')).toBeNull();
        fireEvent.press(e.getByTestId('duvar-tip-zarif'));
        fireEvent.press(e.getByTestId('duvar-hiza-bas'));
        expect(e.getAllByText(/lavaboya/).length).toBeGreaterThan(0);
        fireEvent(e.getByTestId('duvar-arapca'), 'valueChange', true);

        fireEvent.press(e.getByTestId('duvar-sekme-sus'));
        fireEvent.press(e.getByTestId('duvar-sus-girih'));

        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({
            zemin: 'yatsi',
            vakteUysun: false,
            arapca: true,
            acik: false,
            yazi: { tip: 'zarif', hiza: 'bas' },
            sus: { tur: 'girih' },
        });
        // Duvar kâğıdı kapalı: yalnız kaydedilir, uygulanmaz ve açılmaz.
        expect(mockServis.duvarKagidiniSimdiUygula).not.toHaveBeenCalled();
        expect(mockKisaBildirim).toHaveBeenCalledWith('Görünüm kaydedildi');
    });

    it('Android\'de duvar kâğıdı açıksa "Uygulayın" kaydedip hemen uygular', async () => {
        const e = await ac({ acik: true });
        fireEvent.press(e.getByTestId('duvar-zemin-kusluk'));
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarKagidiniSimdiUygula).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({ acik: true, zemin: 'kusluk' });
        expect(mockKisaBildirim).toHaveBeenCalledWith('Duvar kâğıdı yerleştirildi', false);
    });

    it('"Vazgeçin" kaydetmeden döner', async () => {
        const e = await ac();
        fireEvent.press(e.getByTestId('duvar-zemin-aksam'));
        fireEvent.press(e.getByTestId('duvar-vazgec'));
        expect(mockGoBack).toHaveBeenCalled();
        expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
    });

    it('hazır görünüm açılışta bir kez uygulanır ve düzenlenebilir', async () => {
        mockParametreler = { hazir: 'mihrap' };
        const e = await ac({ zemin: 'gece', sus: { tur: 'yok', belirginlik: 0.5 } });
        fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
        fireEvent.press(e.getByTestId('duvar-tip-sade'));
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        expect(kaydedilen()).toMatchObject({ zemin: 'ikindi', sus: { tur: 'mihrap' }, yazi: { tip: 'sade' } });
    });

    it('yazı taşınırken saat alanına girmez (Android kilit ekranı)', async () => {
        const e = await ac();
        // Blok yüksekliği: tuval 484 px; 60 px blok ≈ ekranın %12'si.
        olcBlok(e, 60);
        const tuval = e.getByTestId('duvar-tuval');
        for (let i = 0; i < 40; i++) {
            fireEvent(tuval, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
        }
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        const merkez = kaydedilen().yazi.kilitY as number;
        const blok = 60 / 484;
        const [ust, alt] = [merkez - blok / 2, merkez + blok / 2];
        // Yukarı taşındıkça saatin üstündeki ince banda geçer; saat alanına (%26–%64) asla girmez.
        expect(IZINLI_BANTLAR.android.kilit.some(([a, b]) => ust >= a - 1e-6 && alt <= b + 1e-6)).toBe(true);
        expect(alt <= 0.26 + 1e-6 || ust >= 0.64 - 1e-6).toBe(true);
    });

    describe('kilit ekranı saat alanı', () => {
        const GORUNTU = { canceled: false, assets: [{ uri: 'file:///secici/kilit.png', width: 1080, height: 2400 }] };
        /** 100 satır; 30–60 arası "üstte çizilmiş" (saat): `saatAlaniBul` → tamam. */
        const SAATLI = Array.from({ length: 100 }, (_, i) => (i >= 30 && i <= 60 ? 0.1 : 0));

        async function olc(e: Awaited<ReturnType<typeof ac>>) {
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            fireEvent.press(e.getByTestId('duvar-saat-olcun'));
            // Pencere üç adımı ve seçim düğmesini gösterir (görüntü SEÇİLMEDEN ölçüm yok).
            expect(e.getByTestId('duvar-saat-adimlar')).toBeTruthy();
            expect(mockServis.kilitEkraniProfili).not.toHaveBeenCalled();
            fireEvent.press(e.getByText('Görüntüyü seçin'));
            return e.findByTestId('duvar-saat-sonuc');
        }

        beforeEach(() => {
            mockSec.mockResolvedValue(GORUNTU);
            mockServis.kilitEkraniProfili.mockResolvedValue({ profil: SAATLI });
        });

        it('Yazı sekmesinde yalnız kilit ekranı düzenlenirken görünür', async () => {
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            expect(e.getByTestId('duvar-saat-bolumu')).toBeTruthy();
            expect(e.getByText('Tahmini konum')).toBeTruthy();
            // Varsayılandayken "Varsayılana dönün" yok.
            expect(e.queryByTestId('duvar-saat-varsayilan')).toBeNull();
            e.unmount();

            const ana = await ac({ yer: 'ana' });
            fireEvent.press(ana.getByTestId('duvar-sekme-yazi'));
            expect(ana.queryByTestId('duvar-saat-bolumu')).toBeNull();
            ana.unmount();

            const ikisi = await ac({ yer: 'ikisi' });
            fireEvent.press(ikisi.getByTestId('duvar-sekme-yazi'));
            expect(ikisi.getByTestId('duvar-saat-bolumu')).toBeTruthy();
            fireEvent.press(ikisi.getByTestId('duvar-ekran-ana'));
            expect(ikisi.queryByTestId('duvar-saat-bolumu')).toBeNull();
        });

        it('ölçüm tamamsa alan taslağa girer, "Uygulayın" kaydeder; görüntü kopyalanmaz', async () => {
            const e = await ac();
            const sonuc = await olc(e);
            expect(sonuc.props.accessibilityLabel).toBe('Saat alanı ölçüldü; kesikli alan güncellendi.');
            expect(mockServis.kilitEkraniProfili).toHaveBeenCalledWith('file:///secici/kilit.png');
            expect(mockSec).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'], allowsEditing: false }));
            expect(mockKopyala).not.toHaveBeenCalled();
            expect(e.getByText('Bu telefonda ölçüldü')).toBeTruthy();
            expect(e.getByTestId('duvar-saat-varsayilan')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            const beklenen = saatAlaniBul(SAATLI);
            if (beklenen.sonuc !== 'tamam') throw new Error('profil saat vermeli');
            expect(kaydedilen().saatAlani).toEqual(beklenen.alan);
            // Kaynak ayrı, cihaza özgü anahtara yazılır; yeniden açılınca "ölçüldü" kalır.
            await waitFor(() => expect(mockServis.saatAlaniKaynagiKaydet).toHaveBeenCalledWith('olcum'));
            e.unmount();
            mockServis.saatAlaniKaynagiOku.mockResolvedValue('olcum');
            const yeniden = await ac({ saatAlani: beklenen.alan });
            fireEvent.press(yeniden.getByTestId('duvar-sekme-yazi'));
            expect(yeniden.getByText('Bu telefonda ölçüldü')).toBeTruthy();
        });

        it('kaynağı bilinmeyen kayıtlı alan "Elle ayarlandı" gösterir ("ölçüldü" demez)', async () => {
            const e = await ac({ saatAlani: [0.3, 0.5] });
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            expect(e.getByText('Elle ayarlandı')).toBeTruthy();
            expect(e.queryByText('Bu telefonda ölçüldü')).toBeNull();
        });

        it('görüntü eşleşmezse bilgi satırı çıkar ve kayıtlı alan korunur', async () => {
            mockServis.kilitEkraniProfili.mockResolvedValue({ profil: Array.from({ length: 100 }, () => 0.5) });
            const e = await ac({ saatAlani: [0.3, 0.5] });
            const sonuc = await olc(e);
            expect(sonuc.props.accessibilityLabel).toBe(
                'Bu görüntü son uygulanan duvar kâğıdıyla eşleşmedi. Duvar kâğıdını uyguladıktan sonra alınmış bir kilit ekranı görüntüsü seçin.'
            );
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            expect(kaydedilen().saatAlani).toEqual([0.3, 0.5]);
        });

        it.each([
            ['saat bulunamadı', { profil: Array.from({ length: 100 }, () => 0) }, 'android', 'Görüntüde saat bulunamadı; kenarları elle ayarlayabilirsiniz.'],
            ['referans yok (Android)', { hata: 'referans-yok' }, 'android', 'Önce duvar kâğıdını uygulayın; ölçüm son uygulanan görselle yapılır.'],
            ['referans yok (iPhone)', { hata: 'referans-yok' }, 'ios', 'Önce Kısayollar ile duvar kâğıdını bir kez uygulayın.'],
            ['oran uymuyor', { hata: 'oran' }, 'android', 'Görüntü okunamadı. Kilit ekranının tam ekran görüntüsünü seçin.'],
            ['okunamadı', { hata: 'okunamadi' }, 'ios', 'Görüntü okunamadı. Kilit ekranının tam ekran görüntüsünü seçin.'],
        ])('%s: kibar sonuç satırı, alan değişmez', async (_ad, ham, platform, metin) => {
            jest.replaceProperty(Platform, 'OS', platform as 'ios' | 'android');
            mockServis.kilitEkraniProfili.mockResolvedValue(ham);
            const e = await ac();
            const sonuc = await olc(e);
            expect(sonuc.props.accessibilityLabel).toBe(metin);
            expect(e.getByText('Tahmini konum')).toBeTruthy();
        });

        it("pencere seçiciden önce kapanır (iOS'ta Modal üstünde seçici sunulamaz); iptal edilirse ölçülmez", async () => {
            mockSec.mockResolvedValue({ canceled: true, assets: null });
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            fireEvent.press(e.getByTestId('duvar-saat-olcun'));
            fireEvent.press(e.getByText('Görüntüyü seçin'));
            await waitFor(() => expect(mockSec).toHaveBeenCalled());
            expect(mockServis.kilitEkraniProfili).not.toHaveBeenCalled();
            expect(e.queryByTestId('duvar-saat-sonuc')).toBeNull();
            expect(e.queryByTestId('duvar-saat-adimlar')).toBeNull();
        });

        it('elle ayar: tuvalde sürüklenen kenar taşınır, ekran okuyucu kenarı adım adım ayarlar, "Uygulayın" kaydeder', async () => {
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            fireEvent.press(e.getByTestId('duvar-saat-elle'));
            expect(e.getByText('Kesikli alanın kenarlarını saatinize göre sürükleyin.')).toBeTruthy();
            expect(e.getByTestId('duvar-saat-tutamak-ust', { includeHiddenElements: true })).toBeTruthy();

            // Tuval 484 px: varsayılan alan %26–%64. Alt kenarın yakınına (%62) dokunup 48 px (≈%10) yukarı sürükleme.
            const tuval = e.getByTestId('duvar-tuval');
            const dokunus = (onceki: number, y: number, zaman: number) => ({
                touchHistory: {
                    numberActiveTouches: 1,
                    indexOfSingleActiveTouch: 0,
                    mostRecentTimeStamp: zaman,
                    touchBank: [
                        {
                            touchActive: true,
                            startPageX: 100,
                            startPageY: 300,
                            startTimeStamp: 0,
                            currentPageX: 100,
                            currentPageY: y,
                            currentTimeStamp: zaman,
                            previousPageX: 100,
                            previousPageY: onceki,
                            previousTimeStamp: zaman,
                        },
                    ],
                },
                nativeEvent: { locationY: 0.62 * 484, pageX: 100, pageY: y, touches: [{ pageX: 100, pageY: y }], changedTouches: [], identifier: 0, timestamp: zaman },
            });
            fireEvent(tuval, 'responderGrant', dokunus(300, 300, 1));
            fireEvent(tuval, 'responderMove', dokunus(300, 252, 2));
            fireEvent(tuval, 'responderRelease', dokunus(252, 252, 3));
            expect(e.getByText('Elle ayarlandı')).toBeTruthy();
            expect(e.queryByText('Bu telefonda ölçüldü')).toBeNull();
            expect(e.getByTestId('duvar-saat-alt').props.accessibilityValue).toEqual({ text: '%54' });
            expect(e.getByTestId('duvar-saat-ust').props.accessibilityValue).toEqual({ text: '%26' });

            // Ekran okuyucu: üst kenar 2 adım aşağı.
            fireEvent(e.getByTestId('duvar-saat-ust'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
            fireEvent(e.getByTestId('duvar-saat-ust'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
            expect(e.getByTestId('duvar-saat-ust').props.accessibilityValue).toEqual({ text: '%28' });

            // Moddan çıkınca alan taslakta kalır; "Uygulayın" kaydeder.
            fireEvent.press(e.getByTestId('duvar-saat-elle'));
            expect(e.queryByTestId('duvar-saat-ust')).toBeNull();
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            const [ust, alt] = kaydedilen().saatAlani as [number, number];
            expect(ust).toBeCloseTo(0.28, 4);
            expect(alt).toBeCloseTo(0.54, 2);

            // Kaynak "elle" kaydedilir; yeniden açılınca "Elle ayarlandı" kalır.
            await waitFor(() => expect(mockServis.saatAlaniKaynagiKaydet).toHaveBeenCalledWith('elle'));
            e.unmount();
            mockServis.saatAlaniKaynagiOku.mockResolvedValue('elle');
            const yeniden = await ac({ saatAlani: [ust, alt] });
            fireEvent.press(yeniden.getByTestId('duvar-sekme-yazi'));
            expect(yeniden.getByText('Elle ayarlandı')).toBeTruthy();
        });

        it('ölçülen alan ekran okuyucuyla kaydırılınca "Elle ayarlandı" olur', async () => {
            mockServis.saatAlaniKaynagiOku.mockResolvedValue('olcum');
            const e = await ac({ saatAlani: [0.3, 0.5] });
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            expect(e.getByText('Bu telefonda ölçüldü')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-saat-elle'));
            fireEvent(e.getByTestId('duvar-saat-alt'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
            expect(e.getByText('Elle ayarlandı')).toBeTruthy();
            // Vazgeçilirse kaynak yazılmaz (taslak).
            fireEvent.press(e.getByTestId('duvar-vazgec'));
            expect(mockServis.saatAlaniKaynagiKaydet).not.toHaveBeenCalled();
        });

        it('"Varsayılana dönün" alanı ve kaynağı siler', async () => {
            mockServis.saatAlaniKaynagiOku.mockResolvedValue('olcum');
            const e = await ac({ saatAlani: [0.3, 0.5] });
            fireEvent.press(e.getByTestId('duvar-sekme-yazi'));
            expect(e.getByText('Bu telefonda ölçüldü')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-saat-varsayilan'));
            expect(e.getByText('Tahmini konum')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            expect(kaydedilen().saatAlani).toBeNull();
            await waitFor(() => expect(mockServis.saatAlaniKaynagiKaydet).toHaveBeenCalledWith(null));
        });

        it('ölçülen alan yazının girebileceği bantları değiştirir', async () => {
            // Alan %30–%50: yazı %52'ye taşınabilir (varsayılan alanda yasaktı).
            const e = await ac({ saatAlani: [0.3, 0.5] });
            olcBlok(e, 60);
            const tuval = e.getByTestId('duvar-tuval');
            for (let i = 0; i < 8; i++) fireEvent(tuval, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            const merkez = kaydedilen().yazi.kilitY as number;
            const blok = 60 / 484;
            expect(merkez - blok / 2).toBeGreaterThanOrEqual(0.5 - 1e-6);
            expect(merkez - blok / 2).toBeLessThan(0.64);
        });
    });

    it('sığmayan blok native gibi küçültülüp yeniden ölçülür; sığınca görünür', async () => {
        const e = await ac();
        expect(e.queryByTestId('duvar-yazi')).toBeNull();
        // 200 px ≈ %41: hiçbir banda sığmaz → bir sonraki küçültme adımı ölçülür (yazı henüz görünmez).
        olcBlok(e, 200);
        expect(e.queryByTestId('duvar-yazi')).toBeNull();
        expect(e.getByTestId('duvar-yazi-olcum', { includeHiddenElements: true })).toBeTruthy();
        olcBlok(e, 60);
        expect(e.getByTestId('duvar-yazi')).toBeTruthy();
        expect(e.queryByTestId('duvar-yazi-olcum', { includeHiddenElements: true })).toBeNull();
    });

    it('"ikisi"nde kilit ve ana ekran ayrı düzenlenir', async () => {
        const e = await ac({ yer: 'ikisi' });
        olcBlok(e, 60);
        fireEvent.press(e.getByTestId('duvar-ekran-ana'));
        fireEvent(e.getByTestId('duvar-tuval'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
        fireEvent.press(e.getByTestId('duvar-uygula'));
        await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
        expect(kaydedilen().yazi.kilitY).toBeNull();
        expect(kaydedilen().yazi.anaY).not.toBeNull();
    });

    describe('fotoğraf', () => {
        const secim = { canceled: false, assets: [{ uri: 'file:///secici/a.heic', width: 1200, height: 1600 }] };

        it('seçilen fotoğraf uygulama dizinine kopyalanır; uygulanınca eski kopya silinir', async () => {
            mockSec.mockResolvedValue(secim);
            mockParametreler = { hazir: 'foto' };
            const e = await ac({ foto: { ...VARSAYILAN_DUVAR_AYARI.foto, dosya: 'duvar-foto-eskieski1.jpg' } });
            await waitFor(() => expect(mockKopyala).toHaveBeenCalledWith({ from: 'file:///secici/a.heic', to: `file:///belge/duvar/${YENI_DOSYA}` }));
            expect(mockSec).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
            expect(await e.findByText('Fotoğrafınız')).toBeTruthy();
            fireEvent(e.getByTestId('duvar-okunurluk'), 'valueChange', false);
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
            expect(kaydedilen()).toMatchObject({ zemin: 'foto', foto: { dosya: YENI_DOSYA, okunurluk: false, x: 0.5, y: 0.5, yakinlik: 1 } });
            expect(mockSil).toHaveBeenCalledWith('file:///belge/duvar/duvar-foto-eskieski1.jpg', { idempotent: true });
            expect(mockSil).not.toHaveBeenCalledWith(`file:///belge/duvar/${YENI_DOSYA}`, expect.anything());
        });

        it('vazgeçilirse bu oturumda kopyalanan fotoğraf silinir, kayıtlı olana dokunulmaz', async () => {
            mockSec.mockResolvedValue(secim);
            const e = await ac({ zemin: 'foto', foto: { ...VARSAYILAN_DUVAR_AYARI.foto, dosya: 'duvar-foto-eskieski1.jpg' } });
            // Kayıtlı fotoğraf seçicisiz açılır; "Değiştirin" yenisini seçtirir.
            fireEvent.press(await e.findByTestId('duvar-foto-degistir'));
            await waitFor(() => expect(mockKopyala).toHaveBeenCalled());
            fireEvent.press(e.getByTestId('duvar-vazgec'));
            e.unmount();
            await waitFor(() => expect(mockSil).toHaveBeenCalledWith(`file:///belge/duvar/${YENI_DOSYA}`, { idempotent: true }));
            expect(mockSil).not.toHaveBeenCalledWith('file:///belge/duvar/duvar-foto-eskieski1.jpg', expect.anything());
            expect(mockServis.duvarAyariKaydet).not.toHaveBeenCalled();
        });

        it('kayıtlı kopya okunamıyorsa Fotoğraf karesi seçiciyi yeniden açar', async () => {
            jest.spyOn(Image, 'getSize').mockImplementation(((_u: string, _ok: unknown, hata: () => void) => hata()) as never);
            const e = await ac({ foto: { ...VARSAYILAN_DUVAR_AYARI.foto, dosya: 'duvar-foto-kayipkayip.jpg' } });
            fireEvent.press(e.getByTestId('duvar-zemin-foto'));
            await waitFor(() => expect(mockSec).toHaveBeenCalled());
        });

        it('kopyalanamazsa bilgi satırı çıkar, zemin değişmez', async () => {
            mockSec.mockResolvedValue(secim);
            mockKopyala.mockRejectedValue(new Error('disk'));
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-zemin-foto'));
            expect(await e.findByTestId('duvar-foto-hata')).toBeTruthy();
            fireEvent.press(e.getByTestId('duvar-uygula'));
            await waitFor(() => expect(mockServis.duvarAyariKaydet).toHaveBeenCalled());
            expect(kaydedilen().zemin).toBe('imsak');
        });

        it('iPhone\'da Kısayollar görseline aktaramayan eski ikilide bilgi satırı gösterir', async () => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            mockSec.mockResolvedValue(secim);
            const e = await ac();
            fireEvent.press(e.getByTestId('duvar-zemin-foto'));
            expect(await e.findByTestId('duvar-foto-ios')).toBeTruthy();
            // Kısayollar görmeyeceği fotoğraf kullanılmaz: kopya silinir, zemin değişmez.
            await waitFor(() => expect(mockSil).toHaveBeenCalledWith(`file:///belge/duvar/${YENI_DOSYA}`, { idempotent: true }));
            expect(e.queryByText('Fotoğrafınız')).toBeNull();
            // iPhone'da "Vakte uysun" açıklamasında Android'e özgü cümle yok.
            fireEvent.press(e.getByTestId('duvar-zemin-imsak'));
            expect(e.queryByText(/Her vakit girdiğinde/)).toBeNull();
        });
    });

    it('İngilizcede Türkçe metin kalmaz', async () => {
        const geriAl = ingilizceyeGec();
        try {
            const e = await ac();
            for (const sekme of ['zemin', 'yazi', 'sus'] as const) {
                fireEvent.press(e.getByTestId(`duvar-sekme-${sekme}`));
                expect(turkceKalanlar(e.toJSON() as never, ['Günün', 'Kur'])).toEqual([]);
            }
        } finally {
            act(() => geriAl());
        }
    });
});
