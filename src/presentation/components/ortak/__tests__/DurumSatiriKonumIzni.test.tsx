/**
 * Konum izni satırı AÇIKLAMA adımını atlamaz: düğme önce Prominent Disclosure'ı açar,
 * sistem diyaloğu ancak kabulden sonra `useIzinAkisi` şablonuyla istenir.
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        bilgi: '#2196F3',
        dikkat: '#E65100',
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
const mockEylem = jest.fn(async (..._a: unknown[]) => true);
const mockKonumIste = jest.fn(async () => undefined);
jest.mock('../../../../domain/services/DurumEylemleri', () => ({
    durumEylemiUygula: (...a: unknown[]) => mockEylem(...a),
    konumIzniIste: () => mockKonumIste(),
}));
const mockOku = jest.fn(async (..._a: unknown[]) => 'sorulabilir');
jest.mock('../../../../domain/services/CihazDurumOkuyucu', () => ({ alaniOku: (...a: unknown[]) => mockOku(...a) }));

import { DurumSatiri } from '../DurumSatiri';

beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    mockEylem.mockClear();
    mockKonumIste.mockClear();
});
afterEach(() => jest.restoreAllMocks());

describe('DurumSatiri — konum izni', () => {
    it('NÖBETÇİ: "İzin verin" doğrudan istemez, önce açıklamayı gösterir; vazgeç = hiçbir şey istenmez', async () => {
        const { getByLabelText, getByText, queryByText } = render(
            <DurumSatiri durum={{ tip: 'uyari', metin: 'Konum izni kapalı.', eylem: 'konumIzni' }} />,
        );
        expect(queryByText('Konum Verisi Kullanımı')).toBeNull();
        await act(async () => {
            fireEvent.press(getByLabelText('İzin verin'));
        });
        expect(getByText('Konum Verisi Kullanımı')).toBeTruthy();
        expect(mockEylem).not.toHaveBeenCalled();
        expect(mockKonumIste).not.toHaveBeenCalled();
        fireEvent.press(getByText('Şimdi Değil'));
        await waitFor(() => expect(queryByText('Konum Verisi Kullanımı')).toBeNull());
        expect(mockKonumIste).not.toHaveBeenCalled();
    });

    it('açıklama kabul edilince izin şablonla istenir ve durum yeniden okunur', async () => {
        const onSonra = jest.fn();
        const { getByLabelText, getByText } = render(
            <DurumSatiri durum={{ tip: 'uyari', metin: 'Konum izni kapalı.', eylem: 'konumIzni' }} onSonra={onSonra} />,
        );
        await act(async () => {
            fireEvent.press(getByLabelText('İzin verin'));
        });
        fireEvent.press(getByText('Devam Et ve İzin Ekranını Aç'));
        await waitFor(() => expect(mockKonumIste).toHaveBeenCalledTimes(1), { timeout: 5000 });
        await waitFor(() => expect(onSonra).toHaveBeenCalled());
        expect(mockOku).toHaveBeenCalledWith('konumIzni');
        expect(mockEylem).not.toHaveBeenCalled();
    });
});
