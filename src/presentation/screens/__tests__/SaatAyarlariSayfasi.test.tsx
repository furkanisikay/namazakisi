/**
 * Saat ayarları ekranı (saat W3) — inceleme bulguları 5 ve 10: seçimin bedeli ekranda
 * SÖYLENİR (sessiz sapma yok): saatte uygulama yoksa/eskiyse "saatte" seçimi telefonu her
 * sabah 3 dk geç çaldırır; "yalnız saatte" anons, saat şarjda/bağlantısızken hiç duyulmaz.
 */
import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { SaatAyarlariSayfasi } from '../SaatAyarlariSayfasi';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_SAAT_AYARLARI } from '../../../core/saat/saatAyarlari';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

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
        // Jest varsayılanı iOS (AGENTS.md): Wear OS metinleri Android'de.
        jest.replaceProperty(Platform, 'OS', 'android');
    });
    afterEach(() => jest.restoreAllMocks());

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

    describe('iOS — Apple Watch (#285 cilası)', () => {
        beforeEach(() => jest.replaceProperty(Platform, 'OS', 'ios'));

        it("yalnız uyandırma seçimi: sesli okuma bölümü ve Android'e özgü Namaz modu YOK", () => {
            const { queryByText, getByText } = render(<SaatAyarlariSayfasi />);
            expect(getByText('Uyandırma nerede çalsın?')).toBeTruthy();
            expect(queryByText('Sesli okuma nerede yapılsın?')).toBeNull();
            expect(queryByText('Namaz modu ayarlarını açın')).toBeNull();
        });

        it('NÖBETÇİ: watchOS sınırını söyler (sessiz alarm yalnız saat uygulaması açıkken kurulur)', () => {
            const { getByText } = render(<SaatAyarlariSayfasi />);
            expect(getByText(/saatinizde Namaz Akışı'nı günde bir kez açın/)).toBeTruthy();
        });
    });
});

describe('SaatAyarlariSayfasi — İngilizce', () => {
    const YASAKLI = ['Saat', 'saat', 'Telefon', 'telefon', 'Namaz modu', 'Camide', 'Kaza', 'Nafile', 'dakika'];
    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
        (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    });
    afterEach(() => {
        act(() => geriAl());
        jest.restoreAllMocks();
    });

    it.each(['android', 'ios'] as const)('%s: Türkçe metin kalmaz', (os) => {
        jest.replaceProperty(Platform, 'OS', os);
        const e = render(<SaatAyarlariSayfasi />);
        // Marka adı ("Namaz Akışı") cümle içinde de her dilde aynı kalır; onu çıkarıp denetle.
        const kalanlar = turkceKalanlar(e.toJSON() as never, YASAKLI).filter(
            (m) => turkceKalanlar(m.replace(/Namaz Akışı/g, ''), YASAKLI).length > 0,
        );
        expect(kalanlar).toEqual([]);
        expect(e.getByText('Where should the wake-up ring?')).toBeTruthy();
        e.unmount();
    });
});
