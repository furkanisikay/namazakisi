/**
 * Saat ayarları ekranı (saat W3) — inceleme bulguları 5 ve 10: seçimin bedeli ekranda
 * SÖYLENİR (sessiz sapma yok): saatte uygulama yoksa/eskiyse "saatte" seçimi telefonu her
 * sabah 3 dk geç çaldırır; "yalnız saatte" anons, saat şarjda/bağlantısızken hiç duyulmaz.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { SaatAyarlariSayfasi } from '../SaatAyarlariSayfasi';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_SAAT_AYARLARI } from '../../../core/saat/saatAyarlari';

jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('../../hooks/useSaatAyarlari', () => ({
    useSaatAyarlari: () => ({ ayarlar: { uyandirmaYeri: 'saat', anonsYeri: 'saat' }, guncelle: jest.fn() }),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});

const mockRenkler = {
    arkaplan: '#ffffff',
    kartArkaplan: '#f0f0f0',
    birincil: '#4CAF50',
    metin: '#333333',
    metinIkincil: '#666666',
    sinir: '#cccccc',
};

describe('SaatAyarlariSayfasi', () => {
    beforeEach(() => {
        (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    });

    it('NÖBETÇİ (bulgu 10): saatte uygulama yoksa telefonun her sabah geç çalacağını söyler', () => {
        const { getByText } = render(<SaatAyarlariSayfasi />);
        expect(getByText(/Saatinizde Namaz Akışı yoksa ya da güncel değilse telefonunuz her sabah 3 dakika geç çalar/)).toBeTruthy();
    });

    it('NÖBETÇİ (bulgu 5): "yalnız saatte" anonsun ne zaman hiç duyulmayacağını söyler', () => {
        const { getByText } = render(<SaatAyarlariSayfasi />);
        expect(getByText(/Saatiniz şarjdayken, telefonunuzla bağlantısı yokken ya da saatte Namaz Akışı yoksa okuma hiç duyulmaz/)).toBeTruthy();
    });

    it('camide / Namaz modunda saatin de susacağını söyler (bulgu 4)', () => {
        const { getByText } = render(<SaatAyarlariSayfasi />);
        expect(getByText(/Camideyken ya\s+da Namaz modu açıkken saatiniz de konuşmaz/)).toBeTruthy();
        expect(VARSAYILAN_SAAT_AYARLARI.anonsYeri).toBe('otomatik');
    });
});
