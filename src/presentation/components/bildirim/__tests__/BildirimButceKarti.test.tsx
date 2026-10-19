/**
 * Bildirim sınırı kartı (issue #298): renk eşikleri ve görünürlük.
 * Özetler GERÇEK `defterOzeti` ile kurulur (kayıt sayısı = senaryo).
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import { defterOzeti, type DefterKaydi } from '../../../../core/bildirim/bildirimDefteri';
import { BildirimButceKarti } from '../BildirimButceKarti';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});

const RENKLER = {
    birincil: '#4CAF50',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const kayitlar = (n: number, kaynak: DefterKaydi['kaynak'] = 'muhafiz'): DefterKaydi[] =>
    Array.from({ length: n }, (_, i) => ({ kaynak, zamanMs: i + 1, tur: 'bildirim' }));

const cubukRengi = (ekran: ReturnType<typeof render>) =>
    ekran.getByTestId('bildirim-butce-cubuk', { includeHiddenElements: true }).props.style.backgroundColor;

describe('BildirimButceKarti', () => {
    beforeEach(() => (useRenkler as jest.Mock).mockReturnValue(RENKLER));

    it('iOS normal (%75–%85): birincil renk, sayı ve sınır', () => {
        const ekran = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(50), 'ios')} onPress={jest.fn()} />);
        expect(cubukRengi(ekran)).toBe('#4CAF50');
        expect(ekran.getByText('Bekleyen bildirimleriniz')).toBeTruthy();
        expect(ekran.getByTestId('bildirim-butce-sayi').props.children.join('')).toBe('50 / 64');
    });

    it('iOS %75 altında kart HİÇ çizilmez (D11: sınır aşılmamışken gürültü)', () => {
        const ekran = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(39), 'ios')} onPress={jest.fn()} />);
        expect(ekran.queryByTestId('bildirim-butce-karti')).toBeNull();
    });

    it('iOS %85 üstü: TURUNCU (durum.dikkat — sarı-amber uyari DEĞİL)', () => {
        const ekran = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(58), 'ios')} onPress={jest.fn()} />);
        expect(cubukRengi(ekran)).toBe('#E65100');
        expect(ekran.getByText('Bildirim sınırına yaklaştınız')).toBeTruthy();
    });

    it('aşımda KIRMIZI ve gelmeyecek sayısı', () => {
        const ekran = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(84), 'ios')} onPress={jest.fn()} />);
        expect(cubukRengi(ekran)).toBe('#F44336');
        expect(
            // Kayıtların hepsi muhafız: teslimci 64 − 4 güvenlik payı = 60 slot bırakır → 24 kesilir.
            ekran.getByText('iPhone en fazla 64 bildirim bekletir; en geç kurulan 24 bildirim gelmeyecek. Düzeltmek için dokunun.')
        ).toBeTruthy();
    });

    it('metin rengi DAİMA tema metni (renk yalnız dekoratif)', () => {
        const ekran = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(84), 'ios')} onPress={jest.fn()} />);
        expect(ekran.getByTestId('bildirim-butce-sayi').props.style.color).toBe('#212121');
    });

    // Kaynak nafile: muhafız 360'lık kendi payını aşsaydı toplamdan bağımsız aşım olurdu.
    it('Android: 400 altı GİZLİ, 400+ görünür', () => {
        const alt = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(399, 'nafile'), 'android')} onPress={jest.fn()} />);
        expect(alt.queryByTestId('bildirim-butce-karti')).toBeNull();
        const ust = render(<BildirimButceKarti ozet={defterOzeti(kayitlar(400, 'nafile'), 'android')} onPress={jest.fn()} />);
        expect(ust.getByText('Android en fazla 480 bildirim bekletir. Yer açmanın yolları için dokunun.')).toBeTruthy();
    });

    it('özet hazır değilse hiçbir şey çizilmez', () => {
        const ekran = render(<BildirimButceKarti ozet={null} onPress={jest.fn()} />);
        expect(ekran.toJSON()).toBeNull();
    });
});
