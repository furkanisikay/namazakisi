/**
 * Yon secicisinin KENDINI ANLATMASI — kart entegrasyonu.
 *
 * Kullanici "Vakit cikarken / Vakit girer girmez" seceneginin ne demek oldugunu
 * ekranda anlayamiyordu. Kart artik (a) iki cipte de kisa aciklama, (b) vaktin
 * bugunku penceresinde hatirlatmalarin nereye dustugunu gosteren zaman seridi,
 * (c) "?" ile iki yonu yan yana gosteren bilgi modali cizer.
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        hata: '#F44336',
        bilgi: '#2196F3',
        basarili: '#4CAF50',
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));

import { PencereKarti } from '../PencereKarti';
import { vakitPencereTanimi, YON_SECENEKLERI } from '../pencereTanimi';
import { vaktinYonunuDegistir } from '../../../../core/muhafiz/matrisIslemleri';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';
import type { VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';

const BASLANGIC = new Date(2026, 0, 10, 20, 12);
const PENCERE_DK = 539;
const BITIS = new Date(BASLANGIC.getTime() + PENCERE_DK * 60000);

const CIKIS_TABLOSU = {
    nazik: { esikDk: 45, siklik: 'birkez' as const },
    uyari: { esikDk: 25, siklik: { herDk: 10 } },
    sert: { esikDk: 10, siklik: { herDk: 5 } },
    acil: { esikDk: 3, siklik: 'birkez' as const },
};

const AYAR: VakitMuhafizAyari = {
    yon: 'cikisaDogru',
    seviyeler: SEVIYE_KADEMELERI.map((kademe) => ({
        kademe,
        kanallar: { bildirim: true },
        esikDk: CIKIS_TABLOSU[kademe].esikDk,
        siklik: CIKIS_TABLOSU[kademe].siklik,
        bildirimSesi: VARSAYILAN_SES,
        anonsMetni: '',
    })),
};

const kur = (pencereVar: boolean) =>
    render(
        <PencereKarti
            tanim={vakitPencereTanimi(
                'yatsi',
                'cikisaDogru',
                pencereVar ? PENCERE_DK : undefined,
                undefined,
                pencereVar ? { baslangic: BASLANGIC, bitis: BITIS } : undefined
            )}
            ayar={AYAR}
            acikMi
            onAdimSec={jest.fn()}
            onYonDegistir={jest.fn()}
            karsiYonAyari={vaktinYonunuDegistir(AYAR, 'yatsi', 'girisindenItibaren', CIKIS_TABLOSU, 'normal')}
        />
    );

beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
});

describe('PencereKarti — zaman seridi', () => {
    it('iki cipte de kisa aciklama gorunur (secmeden karsilastirilabilir)', () => {
        const ekran = kur(true);
        for (const secenek of YON_SECENEKLERI) {
            expect(ekran.getByText(secenek.kisaAciklama)).toBeTruthy();
        }
    });

    it('pencere biliniyorsa serit + veriden uretilen cumle cizilir', () => {
        const ekran = kur(true);

        expect(ekran.getByTestId('zaman-seridi')).toBeTruthy();
        expect(ekran.getByTestId('zaman-seridi-cumle').props.children).toMatch(
            /^Bugün ilk hatırlatma 04:26, sonuncusu 05:08/
        );
    });

    /** Konum yoksa yanlis resim cizmektense yalniz metin. */
    it('pencere bilinmiyorsa serit CIZILMEZ, sabit aciklama kalir', () => {
        const ekran = kur(false);

        expect(ekran.queryByTestId('zaman-seridi')).toBeNull();
        expect(ekran.getByText(YON_SECENEKLERI[0].aciklama)).toBeTruthy();
    });

    it('"?" iki yonu bugunun saatleriyle yan yana gosterir', () => {
        const ekran = kur(true);

        fireEvent.press(ekran.getByLabelText('Bu seçenek ne anlama geliyor?'));

        expect(ekran.getByText('Hatırlatmalar ne zaman gelsin?')).toBeTruthy();
        for (const secenek of YON_SECENEKLERI) {
            expect(ekran.getByText(secenek.uzunAciklama)).toBeTruthy();
        }
        // Karsi yonun cumlesi de gercek plandan uretilir.
        expect(ekran.getByText(/^Vakit girince başlar: ilk hatırlatma 20:27/)).toBeTruthy();
    });
});
