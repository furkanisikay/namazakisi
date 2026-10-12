/**
 * NafileAyarlariSayfasi (issue #77) — anahtarlar doğru kısmi güncellemeyi
 * gönderir; kapalı kartın ayrıntısı gizlidir; teheccüd seçicileri benzersiz etiketlidir.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../../core/nafile/nafileTipleri';
import { nafileAyariniGuncelle } from '../../store/nafileSlice';

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../store/nafileSlice', () => ({
    nafileAyariniGuncelle: jest.fn((d: unknown) => ({ type: 'nafile/guncelle', payload: d })),
}));
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    sesSec: jest.fn(),
    sesiOnizle: jest.fn(),
    onizlemeyiDurdur: jest.fn(),
    trDestekleniyorMu: () => Promise.resolve(true),
}));
jest.mock('../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { bildirimSesiniCal: jest.fn(), bitisiniBekle: jest.fn(), temizle: jest.fn() },
}));

import { NafileAyarlariSayfasi } from '../NafileAyarlariSayfasi';

const RENKLER = {
    birincil: '#4CAF50',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const dispatch = jest.fn();
const kur = (ayarlar: NafileAyarlari) => {
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
        sec({ nafile: { ayarlar }, konum: { koordinatlar: { lat: 41.0082, lng: 28.9784 } } })
    );
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    return render(<NafileAyarlariSayfasi />);
};

describe('NafileAyarlariSayfasi', () => {
    beforeEach(() => jest.clearAllMocks());

    it('başlık gövdede tekrarlanmaz; hepsi kapalıyken ayrıntılar gizli', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        expect(ekran.queryByText('Nafile Namazlar')).toBeNull();
        expect(ekran.queryByText('NE ZAMAN')).toBeNull();
        expect(ekran.queryByTestId('teheccud-hedef')).toBeNull();
    });

    it('kuşluk anahtarı yalnız kendi alanını günceller', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        fireEvent(ekran.getByLabelText('Kuşluk hatırlatması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ hatirlatmalar: { kusluk: { aktif: true } } });
        expect(dispatch).toHaveBeenCalled();
    });

    it('gösterge anahtarı', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        fireEvent(ekran.getByLabelText('Ana ekranda göster hatırlatması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ gostergeAktif: true });
    });

    it('teheccüd açıkken hedef seçimi, bu gecenin saati ve uyandırma görünür', () => {
        const ekran = kur({
            ...VARSAYILAN_NAFILE_AYARLARI,
            teheccud: { aktif: true, hedef: 'imsaktanOnce', imsaktanOnceDk: 60, uyandirma: false },
        });
        expect(ekran.getByTestId('teheccud-hedef')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Gecenin son üçte biri'));
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ teheccud: { hedef: 'sonUcteBir' } });
        expect(ekran.getByLabelText('İmsaktan kaç dk önce artır')).toBeTruthy();
        fireEvent(ekran.getByLabelText('Teheccüd uyandırması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ teheccud: { uyandirma: true } });
    });

    it('kuşluk açıkken ortak pencere kartı çizilir', () => {
        const ekran = kur({
            ...VARSAYILAN_NAFILE_AYARLARI,
            hatirlatmalar: { ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar, kusluk: { aktif: true, ofsetDk: 5 } },
        });
        expect(ekran.getAllByText(/girişten 5 dk sonra/).length).toBeGreaterThan(0);
    });
});
