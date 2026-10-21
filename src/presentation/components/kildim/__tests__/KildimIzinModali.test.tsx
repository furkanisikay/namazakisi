/**
 * KildimIzinModali (issue #299) — hangi başlatana hangi seçenekler sunulur.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import type { KildimBaglantiKarari } from '../../../../core/kildim/kildimGuven';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{`ikon:${props.name}`}</Text> };
});
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));

import { KildimIzinModali } from '../KildimIzinModali';

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

const RUTIN: KildimBaglantiKarari = {
    eylem: 'sor',
    paket: 'com.samsung.android.app.routines',
    ad: 'Modlar ve Rutinler',
    herZaman: true,
    engel: true,
};

const kur = (baslatan: KildimBaglantiKarari | null, vakitAdi: string | null = 'Öğle') => {
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    const cb = { onHerZaman: jest.fn(), onBuSefer: jest.fn(), onEngelle: jest.fn(), onVazgec: jest.fn() };
    const r = render(
        <KildimIzinModali
            vakitAdi={vakitAdi}
            baslatan={baslatan}
            kimliksizBaslik="Öğle namazı kılındı olarak işaretlensin mi?"
            kimliksizMesaj="Bu istek bir bağlantı üzerinden geldi. Namazınızı kıldıysanız onaylayın."
            {...cb}
        />
    );
    return { ...r, cb };
};

describe('KildimIzinModali', () => {
    beforeEach(() => jest.clearAllMocks());

    it('tanınan uygulamaya üç seçenek: her zaman / bu sefer / engelle', () => {
        const { getByText, getByLabelText, cb } = kur(RUTIN);
        expect(getByText('Modlar ve Rutinler namazlarınızı kılındı olarak işaretleyebilsin mi?')).toBeTruthy();
        expect(getByText(/Şu an işaretlenecek vakit: Öğle\./)).toBeTruthy();
        fireEvent.press(getByLabelText('Her zaman izin verin'));
        fireEvent.press(getByLabelText('Yalnız bu sefer'));
        fireEvent.press(getByLabelText('Engelleyin'));
        expect(cb.onHerZaman).toHaveBeenCalledTimes(1);
        expect(cb.onBuSefer).toHaveBeenCalledTimes(1);
        expect(cb.onEngelle).toHaveBeenCalledTimes(1);
    });

    it('tarayıcıya "her zaman" sunulmaz, nedeni açıklanır', () => {
        const { queryByLabelText, getByLabelText, getByText } = kur({ ...RUTIN, ad: 'Chrome', herZaman: false });
        expect(queryByLabelText('Her zaman izin verin')).toBeNull();
        expect(getByLabelText('Yalnız bu sefer')).toBeTruthy();
        expect(getByLabelText('Engelleyin')).toBeTruthy();
        expect(getByText(/kalıcı izin verilemez/)).toBeTruthy();
    });

    it('başlatanı bilinmeyen istekte yalnız tek seferlik onay (Kıldım / Vazgeç)', () => {
        const { getByText, getByLabelText, queryByLabelText, cb } = kur({
            eylem: 'sor',
            paket: null,
            ad: '',
            herZaman: false,
            engel: false,
        });
        expect(getByText('Öğle namazı kılındı olarak işaretlensin mi?')).toBeTruthy();
        expect(queryByLabelText('Her zaman izin verin')).toBeNull();
        expect(queryByLabelText('Engelleyin')).toBeNull();
        fireEvent.press(getByLabelText('Kıldım'));
        expect(cb.onBuSefer).toHaveBeenCalledTimes(1);
        fireEvent.press(getByLabelText('Vazgeç'));
        expect(cb.onVazgec).toHaveBeenCalled();
    });

    it('vakit yokken kapalıdır', () => {
        const { queryByTestId } = kur(RUTIN, null);
        expect(queryByTestId('kildim-izin-modali')).toBeNull();
    });
});
