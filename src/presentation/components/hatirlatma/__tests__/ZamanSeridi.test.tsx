import React from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        metin: '#212121',
        metinIkincil: '#757575',
    }),
}));

import { ZamanSeridi, CUBUK_YUKSEKLIKLERI } from '../ZamanSeridi';
import { MUHAFIZ_ADIM_BILGILERI } from '../pencereTanimi';
import { vakitUyariPlaniOlustur } from '../../../../core/muhafiz/motorAdaptoru';
import { GIRIS_ZAMANLAMA_TABLOSU } from '../../../../core/muhafiz/girisZamanlamasi';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';
import type { Siklik, VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../../core/muhafiz/pencereTipleri';

const BASLANGIC = new Date(2026, 0, 10, 20, 12);
const PENCERE_DK = 539;
const BITIS = new Date(BASLANGIC.getTime() + PENCERE_DK * 60000);

const vakit = (yon: PencereYonu, z: { esikDk: number; siklik: Siklik }[]): VakitMuhafizAyari => ({
    yon,
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i) => ({
        kademe,
        kanallar: { bildirim: true },
        esikDk: z[i].esikDk,
        siklik: z[i].siklik,
        bildirimSesi: VARSAYILAN_SES,
        anonsMetni: '',
    })),
});

const CIKIS_PLANI = vakitUyariPlaniOlustur(
    vakit('cikisaDogru', [
        { esikDk: 45, siklik: 'birkez' },
        { esikDk: 25, siklik: { herDk: 10 } },
        { esikDk: 10, siklik: { herDk: 5 } },
        { esikDk: 3, siklik: 'birkez' },
    ]),
    24 * 60,
    { pencereUzunluguDk: PENCERE_DK }
);
const GIRIS_PLANI = vakitUyariPlaniOlustur(
    vakit('girisindenItibaren', SEVIYE_KADEMELERI.map((k) => GIRIS_ZAMANLAMA_TABLOSU.uzun.normal[k])),
    1,
    { pencereUzunluguDk: PENCERE_DK }
);

const kur = (props: Partial<React.ComponentProps<typeof ZamanSeridi>> = {}) =>
    render(
        <ZamanSeridi
            plan={CIKIS_PLANI}
            pencereUzunluguDk={PENCERE_DK}
            baslangic={BASLANGIC}
            bitis={BITIS}
            yon="cikisaDogru"
            adimBilgileri={MUHAFIZ_ADIM_BILGILERI}
            erisimEtiketi="Yatsı şeridi"
            testID="serit"
            {...props}
        />
    );

/** Genislik `onLayout` gelene kadar 0'dir → cubuklar cizilmez. Olcumu tetikle. */
const olc = (ekran: ReturnType<typeof kur>, genislik = 300) => {
    const serit = ekran.getByTestId('serit');
    // onLayout ic kapta; ilk cocuk.
    const kap = serit.children[0] as unknown as { props: { onLayout?: unknown } };
    act(() => {
        fireEvent(kap as never, 'layout', { nativeEvent: { layout: { width: genislik, height: 30 } } });
    });
};

beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});

describe('ZamanSeridi', () => {
    it('olcum gelmeden cubuk CIZILMEZ (yanlis konumda bir kare bile yok)', () => {
        const ekran = kur();
        expect(ekran.queryAllByTestId('zaman-seridi-cubuk')).toHaveLength(0);
    });

    it('her adim icin bir cubuk; yukseklik SERTLIGI tasir (nazik kisa → acil uzun)', () => {
        const ekran = kur();
        olc(ekran);

        const cubuklar = ekran.getAllByTestId('zaman-seridi-cubuk');
        expect(cubuklar).toHaveLength(4);
        const yukseklikler = cubuklar.map((c) => StyleSheet.flatten(c.props.style).height);
        expect(yukseklikler).toEqual(CUBUK_YUKSEKLIKLERI);
    });

    it('tekrarlar tik olarak cizilir (cubuk + tik = plan)', () => {
        const ekran = kur({ plan: GIRIS_PLANI, yon: 'girisindenItibaren' });
        olc(ekran);

        const toplam =
            ekran.getAllByTestId('zaman-seridi-cubuk').length +
            ekran.queryAllByTestId('zaman-seridi-tik').length;
        expect(toplam).toBe(GIRIS_PLANI.length);
    });

    it('saat etiketleri pencerenin uclarini yazar', () => {
        const ekran = kur();
        expect(ekran.getByText('20:12')).toBeTruthy();
        expect(ekran.getByText('05:11')).toBeTruthy();
    });

    it('tek erisilebilirlik dugumu: role image + etiket', () => {
        const serit = kur().getByTestId('serit');
        expect(serit.props.accessibilityRole).toBe('image');
        expect(serit.props.accessibilityLabel).toBe('Yatsı şeridi');
    });

    it('imlec YALNIZ vakit suruyorsa cizilir', () => {
        const disarida = kur({ simdi: new Date(BASLANGIC.getTime() - 60000) });
        olc(disarida);
        expect(disarida.queryByTestId('zaman-seridi-imlec')).toBeNull();

        const icerde = kur({ simdi: new Date(BASLANGIC.getTime() + 60 * 60000) });
        olc(icerde);
        expect(icerde.getByTestId('zaman-seridi-imlec')).toBeTruthy();
    });

    it('YON degisince cokus/yukselis animasyonu calisir', async () => {
        const zamanlama = jest.spyOn(Animated, 'timing');
        const ekran = kur();
        olc(ekran);
        await act(async () => {
            await Promise.resolve();
        });

        ekran.rerender(
            <ZamanSeridi
                plan={GIRIS_PLANI}
                pencereUzunluguDk={PENCERE_DK}
                baslangic={BASLANGIC}
                bitis={BITIS}
                yon="girisindenItibaren"
                adimBilgileri={MUHAFIZ_ADIM_BILGILERI}
                erisimEtiketi="Yatsı şeridi"
                testID="serit"
            />
        );

        expect(zamanlama).toHaveBeenCalled();
        // Animasyon bitince yeni plan cizilir (gercek zamanda bekle — sahte saat YOK).
        await waitFor(() =>
            expect(
                ekran.getAllByTestId('zaman-seridi-cubuk').length +
                ekran.queryAllByTestId('zaman-seridi-tik').length
            ).toBe(GIRIS_PLANI.length)
        );
    });

    it('HAREKET AZALTMA acikken animasyon HIC kurulmaz, yeni plan dogrudan cizilir', async () => {
        jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
        const zamanlama = jest.spyOn(Animated, 'timing');
        const ekran = kur();
        olc(ekran);
        await act(async () => {
            await Promise.resolve();
        });

        ekran.rerender(
            <ZamanSeridi
                plan={GIRIS_PLANI}
                pencereUzunluguDk={PENCERE_DK}
                baslangic={BASLANGIC}
                bitis={BITIS}
                yon="girisindenItibaren"
                adimBilgileri={MUHAFIZ_ADIM_BILGILERI}
                erisimEtiketi="Yatsı şeridi"
                testID="serit"
            />
        );

        expect(zamanlama).not.toHaveBeenCalled();
        expect(
            ekran.getAllByTestId('zaman-seridi-cubuk').length +
            ekran.queryAllByTestId('zaman-seridi-tik').length
        ).toBe(GIRIS_PLANI.length);
    });

    it('esik degisimi (yon ayni) animasyon KURMAZ', async () => {
        const zamanlama = jest.spyOn(Animated, 'timing');
        const ekran = kur();
        olc(ekran);

        ekran.rerender(
            <ZamanSeridi
                plan={CIKIS_PLANI.slice(0, 3)}
                pencereUzunluguDk={PENCERE_DK}
                baslangic={BASLANGIC}
                bitis={BITIS}
                yon="cikisaDogru"
                adimBilgileri={MUHAFIZ_ADIM_BILGILERI}
                erisimEtiketi="Yatsı şeridi"
                testID="serit"
            />
        );

        expect(zamanlama).not.toHaveBeenCalled();
    });
});
