/**
 * NÖBETÇİ — adım listesinin zaman çizelgesi rayı (sahip geri bildirimi 2026-10).
 *
 * - Satır başlığı ZAMANDIR; sıra numarası ve ton adı yalnız etikette.
 * - Kanallar ikon çipidir; `·` ayraçlı özet metni ekranda yok.
 * - Etiket öneki SABİT ("1. hatırlatma, Nazik — düzenleyin") — testler ve Maestro bağlı.
 * - Silinen satırın görsel hayaleti ekran okuyucudan gizli ve dokunulmaz; veri beklemez.
 * - "Animasyonları azalt" açıksa hayalet hiç çizilmez.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        metin: '#212121',
        metinIkincil: '#757575',
        uyari: '#FFC107',
    }),
}));
let mockAzalt = false;
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => mockAzalt }));

import { PencereKarti } from '../PencereKarti';
import { vakitPencereTanimi } from '../pencereTanimi';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';

const ESIKLER = [45, 25, 10, 3];
const seviyeler = (esikler: number[]): SeviyeAyari[] =>
    esikler.map((esikDk, i) => ({
        kademe: SEVIYE_KADEMELERI[i],
        kanallar: i === 2 ? { bildirim: true, titresim: true } : { bildirim: true },
        esikDk,
        siklik: i === 1 ? { herDk: 5 } : 'birkez',
        bildirimSesi: VARSAYILAN_SES,
        anonsMetni: '',
    }));
const ayar = (esikler: number[]): VakitMuhafizAyari => ({ yon: 'cikisaDogru', seviyeler: seviyeler(esikler) });
const TANIM = vakitPencereTanimi('ikindi', 'cikisaDogru', 180);

const kart = (a: VakitMuhafizAyari, onAdimSec = jest.fn()) => (
    <PencereKarti tanim={TANIM} ayar={a} acikMi onAdimSec={onAdimSec} onAdimAcKapa={jest.fn()} onAdimEkle={jest.fn()} />
);

beforeEach(() => {
    mockAzalt = false;
});

describe('PencereKarti — adım rayı', () => {
    test('başlık zamandır; sıra numarası ve ton adı ekranda yazılmaz', () => {
        const e = render(kart(ayar(ESIKLER)));
        for (const z of ['45 dk kala', '25 dk kala', '10 dk kala', '3 dk kala']) expect(e.getByText(z)).toBeTruthy();
        expect(e.queryByText(/hatırlatma$/)).toBeNull();
        expect(e.queryByText(/Nazik|Acil/)).toBeNull();
    });

    test('kanallar ikon çipi; özet metninde orta nokta yok; tekrar rozeti görünür', () => {
        const e = render(kart(ayar(ESIKLER)));
        expect(e.queryByText(/ · /)).toBeNull();
        expect(e.getByText('5 dk', { includeHiddenElements: true })).toBeTruthy();
        // Titreşim çipi: adım satırında + vakit başlığındaki kanal birleşiminde.
        expect(e.getAllByText('mobile-alt', { includeHiddenElements: true }).length).toBe(2);
    });

    test('etiket öneki sabit + tam cümle', () => {
        const e = render(kart(ayar(ESIKLER)));
        expect(e.getByLabelText('2. hatırlatma, Uyarı — düzenleyin. 25 dk kala: bildirim (Uygulama sesi); 5 dakikada bir tekrarlanır')).toBeTruthy();
        expect(e.getByLabelText('3. hatırlatma, Sert — düzenleyin. 10 dk kala: bildirim (Uygulama sesi) ve titreşim')).toBeTruthy();
    });

    test('silinen satırın hayaleti erişilebilirlik ağacında yok ve dokunulmaz; gerçek satırlar doğru indeksle açılır', () => {
        const onAdimSec = jest.fn();
        const e = render(kart(ayar(ESIKLER), onAdimSec));
        e.rerender(kart(ayar([45, 10, 3]), onAdimSec));
        // Hayalet (25 dk) görsel olarak duruyor ama ekran okuyucu görmüyor.
        expect(e.queryByText('25 dk kala')).toBeNull();
        expect(e.getByText('25 dk kala', { includeHiddenElements: true })).toBeTruthy();
        // Yeni 2. satır 10 dk'lık adımdır.
        fireEvent.press(e.getByLabelText(/^2\. hatırlatma, Uyarı — düzenleyin\. 10 dk kala/));
        expect(onAdimSec).toHaveBeenCalledWith(1);
        expect(e.getAllByLabelText(/— düzenleyin/)).toHaveLength(3);
    });

    test('"Animasyonları azalt" açıksa hayalet hiç çizilmez', () => {
        mockAzalt = true;
        const e = render(kart(ayar(ESIKLER)));
        e.rerender(kart(ayar([45, 10, 3])));
        expect(e.queryByText('25 dk kala', { includeHiddenElements: true })).toBeNull();
    });

    test('ortaya eklenen satır doğru yerde (kronolojik) ve diğerleri yerinde', () => {
        const e = render(kart(ayar([45, 10, 3])));
        e.rerender(kart(ayar([45, 25, 10, 3])));
        const etiketler = e.getAllByLabelText(/— düzenleyin/).map((n) => n.props.accessibilityLabel as string);
        expect(etiketler.map((l) => l.match(/\. (\d+ dk kala)/)?.[1])).toEqual(['45 dk kala', '25 dk kala', '10 dk kala', '3 dk kala']);
    });
});
