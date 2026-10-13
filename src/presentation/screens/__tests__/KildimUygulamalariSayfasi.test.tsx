/**
 * KildimUygulamalariSayfasi (issue #299) — güven listesi: boş durum, izin ↔ engel,
 * listeden kaldırma (bir dahaki istekte yeniden sorulur).
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRenkler } from '../../../core/theme';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{`ikon:${props.name}`}</Text> };
});
// AGENTS.md: ekran test deseni useFocusEffect'i düşürür → açıkça taklit edilir.
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (cb: () => void | (() => void)) => {
        const React = require('react');
        React.useEffect(cb, [cb]);
    },
}));
const mockListeAl = jest.fn();
const mockKararDegistir = jest.fn();
const mockKaldir = jest.fn();
const mockKullanilabilir = jest.fn();
jest.mock('../../../domain/services/KildimGuvenServisi', () => ({
    KildimGuvenServisi: {
        kullanilabilirMi: () => mockKullanilabilir(),
        listeAl: () => mockListeAl(),
        kararDegistir: (...a: unknown[]) => mockKararDegistir(...a),
        kaldir: (...a: unknown[]) => mockKaldir(...a),
    },
}));

import { KildimUygulamalariSayfasi } from '../KildimUygulamalariSayfasi';

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    hata: '#F44336',
};

const RUTIN = { paket: 'com.samsung.android.app.routines', karar: 'izin', ad: 'Modlar ve Rutinler', zamanMs: 1 };
const TASKER = { paket: 'net.dinglisch.android.taskerm', karar: 'engel', ad: 'Tasker', zamanMs: 2 };

const kur = () => {
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    return render(<KildimUygulamalariSayfasi />);
};

describe('KildimUygulamalariSayfasi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockKullanilabilir.mockReturnValue(true);
        mockListeAl.mockResolvedValue([TASKER, RUTIN]);
        mockKararDegistir.mockResolvedValue(true);
        mockKaldir.mockResolvedValue(true);
    });

    it('boş listede yön gösteren açıklama çizilir', async () => {
        mockListeAl.mockResolvedValue([]);
        const { findByTestId, getByText } = kur();
        await findByTestId('kildim-uygulamalari-bos');
        expect(getByText(/ilk kez "Kıldım" gönderdiğinde size sorulur/)).toBeTruthy();
    });

    it('kararlar listelenir: izinliler önce, durum etiketiyle', async () => {
        const { findByTestId, getByText } = kur();
        await findByTestId(`kildim-uygulama-${RUTIN.paket}`);
        expect(getByText(/İzin verildi/)).toBeTruthy();
        expect(getByText(/Engellendi/)).toBeTruthy();
    });

    it('anahtar izin ↔ engel değiştirir', async () => {
        const { findByLabelText } = kur();
        const anahtar = await findByLabelText('Tasker: namazlarınızı işaretleyebilsin');
        fireEvent(anahtar, 'valueChange', true);
        await waitFor(() => expect(mockKararDegistir).toHaveBeenCalledWith(TASKER.paket, 'izin'));
    });

    it('yazım başarısızsa anahtar geri alınır ve kullanıcı bilgilendirilir', async () => {
        mockKararDegistir.mockResolvedValue(false);
        const { findByLabelText } = kur();
        const anahtar = await findByLabelText('Modlar ve Rutinler: namazlarınızı işaretleyebilsin');
        fireEvent(anahtar, 'valueChange', false);
        await waitFor(() => expect(kisaBildirimGoster).toHaveBeenCalledWith('Karar kaydedilemedi. Lütfen yeniden deneyin.'));
        expect((await findByLabelText('Modlar ve Rutinler: namazlarınızı işaretleyebilsin')).props.value).toBe(true);
    });

    it('listeden kaldırılan uygulamaya bir dahaki istekte yeniden sorulur', async () => {
        const { findByLabelText, queryByTestId } = kur();
        fireEvent.press(await findByLabelText('Tasker uygulamasını listeden kaldırın'));
        await waitFor(() => expect(mockKaldir).toHaveBeenCalledWith(TASKER.paket));
        await waitFor(() => expect(queryByTestId(`kildim-uygulama-${TASKER.paket}`)).toBeNull());
        expect(kisaBildirimGoster).toHaveBeenCalledWith('Tasker listeden kaldırıldı. Bir dahaki istekte size yeniden sorulacak.');
    });

    it('köprü yoksa (iOS) açıklayıcı boş durum', () => {
        mockKullanilabilir.mockReturnValue(false);
        const { getByText } = kur();
        expect(getByText('Bu ayar yalnız Android telefonlarda kullanılabilir.')).toBeTruthy();
    });
});
