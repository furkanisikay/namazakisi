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
