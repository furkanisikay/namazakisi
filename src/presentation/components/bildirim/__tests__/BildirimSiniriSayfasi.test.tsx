/**
 * Bildirim sınırı sayfası — yarının imsağı BÜTÇE ARTIĞI satırı (issue #74 M2, iOS).
 * Yedek sınıra sayılmaz; sayfa onu ayrı ve sakin bir satırla söyler.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import { defterOzeti, type DefterKaydi } from '../../../../core/bildirim/bildirimDefteri';
import { BildirimSiniriSayfasi } from '../BildirimSiniriSayfasi';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});

const RENKLER = {
    birincil: '#4CAF50',
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const kayitlar = (n: number, yedek = false): DefterKaydi[] =>
    Array.from({ length: n }, (_, i) => ({
        kaynak: 'muhafiz',
        zamanMs: i + 1,
        tur: 'bildirim',
        ...(yedek ? { yedek: true as const } : {}),
    }));

const ciz = (ozet: ReturnType<typeof defterOzeti>) =>
    render(
        <BildirimSiniriSayfasi
            gorunur
            mod={{ tur: 'ayrinti' }}
            ozet={ozet}
            oneriler={[]}
            onUygula={jest.fn()}
            onKapat={jest.fn()}
        />
    );

describe('BildirimSiniriSayfasi — bütçe artığı', () => {
    beforeEach(() => (useRenkler as jest.Mock).mockReturnValue(RENKLER));

    it('yedek varsa sayıyla birlikte söylenir; sayım yedeği içermez', () => {
        const ekran = ciz(defterOzeti([...kayitlar(20), ...kayitlar(6, true)], 'ios'));
        expect(ekran.getByTestId('bildirim-siniri-yedek')).toBeTruthy();
        expect(ekran.getByText(/imsak hatırlatmalarından 6 tanesi de yedek/)).toBeTruthy();
        expect(ekran.getByTestId('bildirim-siniri-govde').props.children).toBe(
            'Şu an 20 bildirim bekliyor, sınırın altındasınız.'
        );
    });

    it('yedek yoksa satır çizilmez', () => {
        const ekran = ciz(defterOzeti(kayitlar(20), 'ios'));
        expect(ekran.queryByTestId('bildirim-siniri-yedek')).toBeNull();
    });
});
