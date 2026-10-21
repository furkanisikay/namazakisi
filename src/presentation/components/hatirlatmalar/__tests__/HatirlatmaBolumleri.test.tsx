/**
 * Hatırlatmalar ayrıntı bölümleri (sade tasarım, Dalga 3): Vakit girince + Özel gün.
 * Yazma yolları eski sayfalarla AYNI thunk'lar (Bildirimler / Seri ve hedefler'den taşındı).
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        sinir: '#E0E0E0',
    }),
}));
jest.mock('../../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn(() => Promise.resolve()) }) }));
const mockKisaBildirim = jest.fn();
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: (...a: unknown[]) => mockKisaBildirim(...a) }));
let mockTakvim: { onBaslat: (b: Date, s: Date) => void } | null = null;
jest.mock('../../OzelGunTakvimi', () => ({
    OzelGunTakvimi: (p: { onBaslat: (b: Date, s: Date) => void }) => {
        mockTakvim = p;
        return null;
    },
}));
jest.mock('../../../store/vakitBildirimSlice', () => ({
    vakitBildirimAyarlariniYukle: jest.fn(() => ({ type: 'vb/yukle' })),
    vakitBildirimAyariniGuncelle: jest.fn((a) => ({ type: 'vb/guncelle', payload: a })),
    vakitBildirimSesleriniYukle: jest.fn(() => ({ type: 'vb/sesleriYukle' })),
    vakitBildirimSesiniGuncelle: jest.fn((a) => ({ type: 'vb/sesGuncelle', payload: a })),
}));
// Ses köprüsü (native) — dar mock; "kendi dosyanız" yalnız destek varken çizilir.
const mockSesSec = jest.fn();
const mockSesDosyasiSec = jest.fn();
let mockDosyaDestegi = true;
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({
    sesSec: (...a: unknown[]) => mockSesSec(...a),
    sesDosyasiSec: () => mockSesDosyasiSec(),
    sesDosyasiDestekleniyor: () => mockDosyaDestegi,
}));
const mockSesCal = jest.fn();
const mockSesTemizle = jest.fn();
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { bildirimSesiniCal: (s: string) => mockSesCal(s), temizle: () => mockSesTemizle() },
}));
let mockSesSecici = true;
jest.mock('../../../hooks/usePlatformYetenekleri', () => ({
    usePlatformYetenekleri: () => ({ sesSecici: mockSesSecici }),
}));
jest.mock('../../../store/seriSlice', () => ({
    ozelGunBaslat: Object.assign(
        jest.fn((a) => ({ type: 'seri/ozelBaslat', payload: a })),
        { fulfilled: { match: (x: { type?: string }) => x?.type === 'seri/ozelBaslat/fulfilled' } }
    ),
    ozelGunModuDurumunuGuncelle: jest.fn((a) => ({ type: 'seri/ozelMod', payload: a })),
}));

const mockDispatch = jest.fn();
let mockState: Record<string, unknown>;
jest.mock('../../../store/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (sec: (s: unknown) => unknown) => sec(mockState),
}));

import { VakitGirinceBolumu } from '../VakitGirinceBolumu';
import { OzelGunBolumu } from '../OzelGunBolumu';
import { gunSonuSinirVakitleri } from '../GunSonuBolumu';
import { NamazVaktiHesaplayiciServisi } from '../../../../domain/services/NamazVaktiHesaplayiciServisi';

beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
        vakitBildirim: { ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: false, yatsi: false } },
        seri: { ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null } },
    };
});

describe('VakitGirinceBolumu', () => {
    it('açılınca ayarı diskten yükler (dilim açılışta hidrate değil)', () => {
        render(<VakitGirinceBolumu />);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'vb/yukle' });
    });

    it('beş vakit ayrı anahtar; değiştirmek tek vakti eski thunk ile yazar', async () => {
        const e = render(<VakitGirinceBolumu />);
        expect(e.getByLabelText('Sabah vakti').props.accessibilityState).toMatchObject({ checked: true });
        expect(e.getByLabelText('İkindi vakti').props.accessibilityState).toMatchObject({ checked: false });
        fireEvent(e.getByLabelText('İkindi vakti'), 'valueChange', true);
        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'vb/guncelle', payload: { vakit: 'ikindi', aktif: true } })
        );
    });
});

describe('VakitGirinceBolumu — ses', () => {
    beforeEach(() => {
        mockSesSecici = true;
        mockDosyaDestegi = true;
    });

    it('yalnız AÇIK vaktin altında ses satırı çizilir; açılınca sesler de yüklenir', () => {
        const e = render(<VakitGirinceBolumu />);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'vb/sesleriYukle' });
        expect(e.getByLabelText(/^Sabah bildirim sesi: Telefonun bildirim sesi/)).toBeTruthy();
        expect(e.queryByLabelText(/^İkindi bildirim sesi/)).toBeNull();
        // Varsayılanda "uzun ses" notu yok (ilk görünüm sade).
        expect(e.queryByTestId('vakit-sesi-uzunluk-notu')).toBeNull();
    });

    it('iOS (ses seçici yok): ses satırı HİÇ çizilmez', () => {
        mockSesSecici = false;
        const e = render(<VakitGirinceBolumu />);
        expect(e.queryByLabelText(/bildirim sesi:/)).toBeNull();
    });

    it('kendi dosyanızdan seçilen ses o vakte yazılır', async () => {
        mockSesDosyasiSec.mockResolvedValueOnce({ uri: 'content://media/external_primary/audio/media/7', ad: 'Ezan' });
        const e = render(<VakitGirinceBolumu />);
        fireEvent.press(e.getByLabelText(/^Sabah bildirim sesi:/));
        await act(async () => {
            fireEvent.press(e.getByLabelText('Sabah bildirim sesi: kendi dosyanızdan seçin'));
        });
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'vb/sesGuncelle',
            payload: { vakit: 'imsak', secim: { bildirimSesi: 'content://media/external_primary/audio/media/7', sesAdi: 'Ezan' } },
        });
    });

    it('dosya eklenemezse kullanıcıya kibar dille söylenir, hiçbir şey yazılmaz', async () => {
        mockSesDosyasiSec.mockResolvedValueOnce({ hata: 'sure' });
        const e = render(<VakitGirinceBolumu />);
        fireEvent.press(e.getByLabelText(/^Sabah bildirim sesi:/));
        await act(async () => {
            fireEvent.press(e.getByLabelText('Sabah bildirim sesi: kendi dosyanızdan seçin'));
        });
        expect(mockKisaBildirim).toHaveBeenCalledWith(expect.stringMatching(/8 dakika/), true);
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'vb/sesGuncelle' }));
    });

    it('Android 10 altında "kendi dosyanız" seçeneği yok; telefonun sesleri kalır', () => {
        mockDosyaDestegi = false;
        const e = render(<VakitGirinceBolumu />);
        fireEvent.press(e.getByLabelText(/^Sabah bildirim sesi:/));
        expect(e.queryByLabelText('Sabah bildirim sesi: kendi dosyanızdan seçin')).toBeNull();
        expect(e.getByLabelText('Sabah bildirim sesi: telefonun seslerinden seçin')).toBeTruthy();
    });

    it('özel ses: adı görünür, not çıkar, varsayılana dönüş kaydı siler; Dinle o sesi çalar', async () => {
        mockState = {
            ...mockState,
            vakitBildirim: {
                ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: false, yatsi: false },
                sesler: { imsak: { bildirimSesi: 'content://media/external/audio/media/3', sesAdi: 'Ezan' } },
            },
        };
        const e = render(<VakitGirinceBolumu />);
        expect(e.getByLabelText(/^Sabah bildirim sesi: Ezan/)).toBeTruthy();
        expect(e.getByTestId('vakit-sesi-uzunluk-notu')).toBeTruthy();
        fireEvent.press(e.getByLabelText('Sabah bildirim sesini dinleyin'));
        expect(mockSesCal).toHaveBeenCalledWith('content://media/external/audio/media/3');
        fireEvent.press(e.getByLabelText(/^Sabah bildirim sesi:/));
        fireEvent.press(e.getByLabelText('Telefonun bildirim sesine dönün'));
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'vb/sesGuncelle', payload: { vakit: 'imsak', secim: null } });
    });

    it('sayfadan çıkınca çalan önizleme susar', () => {
        const e = render(<VakitGirinceBolumu />);
        e.unmount();
        expect(mockSesTemizle).toHaveBeenCalled();
    });

    it('varsayılan seste Dinle telefonun bildirim sesini çalar', () => {
        const e = render(<VakitGirinceBolumu />);
        fireEvent.press(e.getByLabelText('Sabah bildirim sesini dinleyin'));
        expect(mockSesCal).toHaveBeenCalledWith('content://settings/system/notification_sound');
    });
});

describe('OzelGunBolumu', () => {
    it('anahtar özel gün modunu yazar; başlatma düğmesi yalnız mod açık ve sürmüyorken', async () => {
        const e = render(<OzelGunBolumu />);
        expect(e.queryByLabelText('Özel günü başlatın')).toBeNull();
        fireEvent(e.getByLabelText('Özel gün'), 'valueChange', true);
        await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith({ type: 'seri/ozelMod', payload: { aktif: true } }));

        mockState = { ...mockState, seri: { ozelGunAyarlari: { ozelGunModuAktif: true, aktifOzelGun: null } } };
        e.rerender(<OzelGunBolumu />);
        expect(e.getByLabelText('Özel günü başlatın')).toBeTruthy();
    });

    it('NÖBETÇİ: "Özel gün başladı" yalnız kayıt BAŞARIYLA bitince söylenir', async () => {
        mockState = { ...mockState, seri: { ozelGunAyarlari: { ozelGunModuAktif: true, aktifOzelGun: null } } };
        render(<OzelGunBolumu />);
        mockDispatch.mockResolvedValueOnce({ type: 'seri/ozelBaslat/rejected' });
        await act(async () => mockTakvim!.onBaslat(new Date(2026, 9, 18), new Date(2026, 9, 22)));
        await waitFor(() => expect(mockKisaBildirim).toHaveBeenCalled());
        expect(mockKisaBildirim).not.toHaveBeenCalledWith(expect.stringMatching(/başladı/));
        expect(mockKisaBildirim).toHaveBeenCalledWith(expect.stringMatching(/başlatılamadı/), true);

        mockKisaBildirim.mockClear();
        mockDispatch.mockResolvedValueOnce({ type: 'seri/ozelBaslat/fulfilled' });
        await act(async () => mockTakvim!.onBaslat(new Date(2026, 9, 18), new Date(2026, 9, 22)));
        await waitFor(() => expect(mockKisaBildirim).toHaveBeenCalledWith(expect.stringMatching(/Özel gün başladı/)));
    });

    it('sürerken tarih aralığı gösterilir', () => {
        mockState = {
            ...mockState,
            seri: {
                ozelGunAyarlari: {
                    ozelGunModuAktif: true,
                    aktifOzelGun: { baslangicTarihi: '2026-10-15', bitisTarihi: '2026-10-20' },
                },
            },
        };
        const e = render(<OzelGunBolumu />);
        expect(e.getByTestId('ozel-gun-suruyor')).toBeTruthy();
        expect(e.queryByLabelText('Özel günü başlatın')).toBeNull();
    });
});

describe('GunSonuBolumu — saat sınırları', () => {
    it('vakitler NamazVaktiHesaplayiciServisi\'nden gelir (KonumYoneticiServisi üretimde boş)', () => {
        NamazVaktiHesaplayiciServisi.getInstance().yapilandir({ latitude: 41.01, longitude: 28.97 });
        const simdi = new Date(2026, 5, 15, 12, 0);
        const { yatsi, imsak } = gunSonuSinirVakitleri(simdi);
        expect(yatsi).not.toBeNull();
        expect(imsak).not.toBeNull();
        expect(yatsi!.getDate()).toBe(15);
        expect(imsak!.getDate()).toBe(16);
        expect(imsak!.getTime()).toBeGreaterThan(yatsi!.getTime());
    });

    it('konum yapılandırılmadıysa ({0,0}) yedek sınıra düşülür', () => {
        NamazVaktiHesaplayiciServisi.getInstance().yapilandir({ latitude: 0, longitude: 0 });
        expect(gunSonuSinirVakitleri(new Date(2026, 5, 15, 12, 0))).toEqual({ yatsi: null, imsak: null });
    });
});
