/**
 * CumaHatirlatmaBolumu — ortak hatırlatma bileşenleriyle cuma (plan §5.1).
 *
 * Ölçülen: muhafız/nafileyle AYNI yetenekler (kanal çipleri + gerçek alarm + adım ekleme +
 * akış önizlemesi), yön istisnasının gerekçesi EKRANDA, rıza (sesli / alarm) TEK RIZA'dır
 * (ortak kayıt; başka bir hatırlatmada verilen onay burada da geçerli), debounce'lu yazma ekrandan çıkışta kaybolmaz.
 * Sahte zamanlayıcı KULLANILMAZ (AGENTS.md CI asılma tuzağı): debounce'lu yol unmount
 * ile boşaltılır.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useRenkler } from '../../../../core/theme';
import { cumaHatirlatmaAyariniGuncelle } from '../../../store/cumaHatirlatmaSlice';
import { cumaAyarlariniNormalize, type CumaHatirlatmaAyarlari } from '../../../../core/cuma/cumaAyarlari';
import { CumaHatirlatmaBolumu, CUMA_YON_GEREKCESI } from '../CumaHatirlatmaBolumu';

jest.mock('../../../store/hooks');
jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../store/cumaHatirlatmaSlice', () => ({
    cumaHatirlatmaAyariniGuncelle: jest.fn((d: unknown) => ({ type: 'cuma/guncelle', payload: d })),
}));
// TEK RIZA (Dalga 3): onay ORTAK kayda yazılır.
jest.mock('../../../store/hatirlatmaRizaSlice', () => ({
    hatirlatmaRizalariniYukle: jest.fn(() => ({ type: 'riza/yukle' })),
    hatirlatmaRizasiVer: jest.fn((d: unknown) => ({ type: 'riza/ver', payload: d })),
}));
const { hatirlatmaRizasiVer: rizaVerMock } = jest.requireMock('../../../store/hatirlatmaRizaSlice');
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
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
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

const RENKLER = {
    birincil: '#4CAF50',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincilMetin: '#FFFFFF',
    bilgi: '#2196F3',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
};

const guncelleMock = cumaHatirlatmaAyariniGuncelle as unknown as jest.Mock;
const kur = (ayarlar: CumaHatirlatmaAyarlari) => {
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
        sec({ cumaHatirlatma: { ayarlar }, konum: { koordinatlar: { lat: 41.0082, lng: 28.9784 } } })
    );
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    return render(<CumaHatirlatmaBolumu />);
};

const ACIK = cumaAyarlariniNormalize({ aktif: true, oncedenDk: 60, siklik: 'birkez' });
const KAPALI = cumaAyarlariniNormalize({ aktif: false, oncedenDk: 60, siklik: 'birkez' });

beforeEach(() => {
    jest.clearAllMocks();
    mockButceKutusu.deger = null;
});

describe('CumaHatirlatmaBolumu', () => {
    it('kapalıyken yalnız anahtar; açınca TEK yazımla aktif + adımlar gider', () => {
        const ekran = kur(KAPALI);
        expect(ekran.queryByTestId('yon-sabit-gerekcesi')).toBeNull();
        fireEvent(ekran.getByLabelText('Cuma hatırlatması'), 'valueChange', true);
        expect(guncelleMock).toHaveBeenCalledTimes(1);
        const d = guncelleMock.mock.calls[0][0];
        expect(d.aktif).toBe(true);
        expect(d.adimlar.map((a: { esikDk: number }) => a.esikDk)).toEqual([60]);
    });

    it('açıkken ortak kart: YÖN GEREKÇESİ ekranda, akış önizlemesi ve adım ekleme var', () => {
        const ekran = kur(ACIK);
        expect(ekran.getByTestId('yon-sabit-gerekcesi')).toBeTruthy();
        expect(ekran.getByText(CUMA_YON_GEREKCESI)).toBeTruthy();
        // Yön seçici çizilmez (istisna sessiz değil, gerekçeli).
        expect(ekran.queryByText('NE ZAMAN HATIRLATILSIN')).toBeNull();
        expect(ekran.getByLabelText('Cuma namazı akışını önizleyin')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Cuma namazı akışını önizleyin'));
        expect(ekran.getByText('Cuma namazı akışı')).toBeTruthy();
        // Önizleme cumanın GERÇEK metnini gösterir (muhafız vakit dili değil).
        expect(ekran.getAllByText(/^Cuma · 1 sa kaldı/).length).toBeGreaterThan(0);
    });

    it('adım ekleme yeni adımı (15 dk katında, öncesine) debounce ile yazar; çıkışta kaybolmaz', () => {
        const ekran = kur(ACIK);
        fireEvent.press(ekran.getByText(/Hatırlatma ekleyin/));
        // Debounce: henüz yazılmadı; ekrandan çıkış HEMEN uygular.
        ekran.unmount();
        expect(guncelleMock).toHaveBeenCalledTimes(1);
        const d = guncelleMock.mock.calls[0][0];
        expect(d.adimlar.map((a: { esikDk: number }) => a.esikDk)).toEqual([75, 60]);
    });

    describe('adım detayı', () => {
        const ac = (ayarlar: CumaHatirlatmaAyarlari) => {
            const ekran = kur(ayarlar);
            fireEvent.press(ekran.getByLabelText(/^Hatırlatma — düzenleyin/));
            return ekran;
        };

        it('STANDART yetenekler: Bildirim + Sesli okuma anahtarları, Gelişmiş bölümünde tekrar ve GERÇEK ALARM', () => {
            const ekran = ac(ACIK);
            expect(ekran.getByTestId('adim-bildirim-anahtari')).toBeTruthy();
            expect(ekran.getByTestId('adim-sesli-anahtari')).toBeTruthy();
            fireEvent.press(ekran.getByTestId('adim-gelismis'));
            expect(ekran.getByTestId('adim-tekrar-anahtari')).toBeTruthy();
            expect(ekran.getByTestId('adim-alarm-anahtari')).toBeTruthy();
        });

        it('sesli İLK kez: rıza sorulur; onay ORTAK kayda (tek rıza), adım cumaya yazılır', () => {
            const ekran = ac(ACIK);
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            expect(guncelleMock).not.toHaveBeenCalled();
            expect(ekran.getByText('Sesli okuma açılsın mı?')).toBeTruthy();
            fireEvent.press(ekran.getByLabelText('Sesli okumayı açın'));
            expect(guncelleMock).toHaveBeenCalledTimes(1);
            const d = guncelleMock.mock.calls[0][0];
            expect(d.sesliOnayi).toBeUndefined();
            expect(rizaVerMock).toHaveBeenCalledWith({ sesliOnayi: true });
            expect(d.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true });
        });

        it('"Sesli olmadan" HİÇBİR ŞEY yazmaz: adım bildirimle kalır, rıza yazılmaz', () => {
            const ekran = ac(ACIK);
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            fireEvent.press(ekran.getByLabelText('Sesli olmadan uygula'));
            // Adım kurulu kanallarıyla kalır (yalnız bildirim) — yazılacak bir değişiklik yok.
            expect(ekran.getByTestId('adim-sesli-anahtari').props.value).toBe(false);
            ekran.unmount();
            expect(guncelleMock).not.toHaveBeenCalled();
        });

        it('BİRLEŞİK MODÜL: sesli okuma METNİ düzenlenir, {vakit} = Cuma okunur ve kaydedilir', () => {
            const sesli = cumaAyarlariniNormalize({
                aktif: true,
                sesliOnayi: true,
                adimlar: [{ esikDk: 60, kanallar: { bildirim: true, sesli: true } }],
            });
            const ekran = ac(sesli);
            // Boş metin = otomatik cuma cümlesi (eski kayıt birebir).
            expect(ekran.getByTestId('anons-okunus').props.children).toMatch(/^Cuma için öğle vaktine/);
            fireEvent.press(ekran.getByLabelText('Metni değiştirin'));
            const kutu = ekran.getByLabelText('Sesli okuma metni');
            fireEvent.changeText(kutu, '{vakit} namazına {süre} dakika.');
            expect(ekran.getByTestId('anons-okunus').props.children).toBe('Cuma namazına 60 dakika.');
            fireEvent(kutu, 'endEditing');
            ekran.unmount();
            const d = guncelleMock.mock.calls.at(-1)[0];
            expect(d.adimlar[0].anonsMetni).toBe('{vakit} namazına {süre} dakika.');
        });

        it('gerçek alarm İLK kez: rıza sorulur; onay ORTAK kayda, anahtar cumaya yazılır', async () => {
            const ekran = ac(ACIK);
            fireEvent.press(ekran.getByTestId('adim-gelismis'));
            fireEvent(ekran.getByTestId('adim-alarm-anahtari'), 'valueChange', true);
            expect(guncelleMock).not.toHaveBeenCalled();
            fireEvent.press(ekran.getByLabelText('Alarmı açın'));
            await waitFor(() => expect(guncelleMock).toHaveBeenCalledTimes(1));
            const d = guncelleMock.mock.calls[0][0];
            expect(d.alarmOnayi).toBeUndefined();
            expect(rizaVerMock).toHaveBeenCalledWith({ alarmOnayi: true });
            expect(d.adimlar[0].kanallar).toEqual({ bildirim: true, alarm: true });
        });
    });

    it('bildirim sınırı: sığmayan AÇMA yazılmaz (rehber açılır)', () => {
        const { butceNesnesiOlustur } = jest.requireActual('../../../hooks/useBildirimButcesi');
        const { matrisKur, ISTANBUL } = jest.requireActual('../../../../core/bildirim/__tests__/defterFikstur');
        // iOS 64: muhafız + 4 cuma × 15 tekrar sınırı aşar → açma sığmaz.
        const dolu = cumaAyarlariniNormalize({ aktif: false, adimlar: [{ esikDk: 180, siklik: { herDk: 5 } }] });
        mockButceKutusu.deger = butceNesnesiOlustur('ios', {
            platform: 'ios',
            simdi: new Date(2026, 9, 15, 9, 0, 0),
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matrisKur() },
            cuma: dolu,
        });
        const ekran = kur(dolu);
        fireEvent(ekran.getByLabelText('Cuma hatırlatması'), 'valueChange', true);
        // Rehber açılır: bu bölüm muhafız/nafile önerisi UYGULAMAZ, yer açma için yönlendirir.
        fireEvent.press(ekran.getByText('"Vakit çıkmadan" ayarlarında yer açın'));
        expect(mockNavigate).toHaveBeenCalledWith('MuhafizAyarlari');
        ekran.unmount();
        expect(guncelleMock).not.toHaveBeenCalled();
    });
});

describe('CumaHatirlatmaBolumu — TEK RIZA (Dalga 3)', () => {
    it('başka bir hatırlatmada (muhafız) verilmiş sesli onay cumada da geçerlidir: modal ÇIKMAZ', () => {
        (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
        (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
            sec({
                cumaHatirlatma: { ayarlar: ACIK },
                muhafiz: { sesliOnayi: true },
                konum: { koordinatlar: { lat: 41.0082, lng: 28.9784 } },
            })
        );
        (useRenkler as jest.Mock).mockReturnValue(RENKLER);
        const ekran = render(<CumaHatirlatmaBolumu />);
        fireEvent.press(ekran.getByLabelText(/^Hatırlatma — düzenleyin/));
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(ekran.queryByText('Sesli okuma açılsın mı?')).toBeNull();
        ekran.unmount();
        const d = guncelleMock.mock.calls.at(-1)[0];
        expect(d.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true });
        expect(rizaVerMock).not.toHaveBeenCalled();
    });
});
