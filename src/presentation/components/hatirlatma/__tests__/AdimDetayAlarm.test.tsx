/**
 * NOBETCI — Adim detayindaki GERCEK ALARM anahtari (issue #74).
 *
 * - Yalniz muhafiz vakitlerinde (`alarmSecilebilir`) ve adim ACIKKEN gorunur.
 * - Riza yoksa anahtar once `AlarmOnayModal`'i acar; "Vazgec" HICBIR SEY yazmaz,
 *   onay rizayi yazar VE alarmi acar. Riza varsa dogrudan yazar.
 * - Kanal cipi degisince acik alarm KORUNUR (titresim gibi bagimsiz eksen);
 *   'kapali' cipi alarmi da dusurur.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        metin: '#212121',
        metinIkincil: '#757575',
        durum: { bilgi: '#2196F3', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', hata: '#F44336' },
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({
    sesSec: jest.fn(),
}));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { temizle: jest.fn(), bildirimSesiniCal: jest.fn() },
}));

import { AdimDetayModal } from '../AdimDetayModal';
import { cipKanallariniBirlestir, KANAL_CIPLERI, vakitPencereTanimi, cumaPencereTanimi } from '../pencereTanimi';
import type { SeviyeAyari, UyariKanallari } from '../../../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';

const adim = (kanallar: UyariKanallari): SeviyeAyari => ({
    kademe: 'nazik',
    kanallar,
    esikDk: 30,
    siklik: { herDk: 10 },
    bildirimSesi: VARSAYILAN_SES,
    anonsMetni: '',
});

function kur(kanallar: UyariKanallari, alarmOnayiVar: boolean) {
    const onDegistir = jest.fn();
    const onAlarmOnayiVer = jest.fn();
    const ekran = render(
        <AdimDetayModal
            gorunur
            tanim={vakitPencereTanimi('imsak')}
            seviyeler={[adim(kanallar)]}
            indeks={0}
            ttsDestekli={null}
            onDegistir={onDegistir}
            onKapat={jest.fn()}
            alarmOnayiVar={alarmOnayiVar}
            onAlarmOnayiVer={onAlarmOnayiVer}
        />
    );
    return { ekran, onDegistir, onAlarmOnayiVer };
}

describe('Gerçek alarm anahtarı', () => {
    test('rıza yoksa önce onay modalı; "Vazgeç" hiçbir şey yazmaz', () => {
        const { ekran, onDegistir, onAlarmOnayiVer } = kur({ bildirim: true }, false);
        fireEvent(ekran.getByLabelText('Gerçek alarm'), 'valueChange', true);
        expect(ekran.getByText('Gerçek alarm açılsın mı?')).toBeTruthy();
        expect(onDegistir).not.toHaveBeenCalled();

        fireEvent.press(ekran.getByLabelText('Vazgeç'));
        expect(onDegistir).not.toHaveBeenCalled();
        expect(onAlarmOnayiVer).not.toHaveBeenCalled();
    });

    test('onay rızayı yazar VE alarmı açar (diğer kanallar korunur)', () => {
        const { ekran, onDegistir, onAlarmOnayiVer } = kur({ bildirim: true, titresim: true }, false);
        fireEvent(ekran.getByLabelText('Gerçek alarm'), 'valueChange', true);
        fireEvent.press(ekran.getByLabelText('Alarmı açın'));
        expect(onAlarmOnayiVer).toHaveBeenCalledTimes(1);
        expect(onDegistir).toHaveBeenCalledWith(
            expect.objectContaining({ kanallar: { bildirim: true, titresim: true, alarm: true } })
        );
    });

    test('rıza varsa doğrudan yazar; kapatmak rıza istemez', () => {
        const acik = kur({ bildirim: true }, true);
        fireEvent(acik.ekran.getByLabelText('Gerçek alarm'), 'valueChange', true);
        expect(acik.ekran.queryByText('Gerçek alarm açılsın mı?')).toBeNull();
        expect(acik.onDegistir).toHaveBeenCalledWith(expect.objectContaining({ kanallar: { bildirim: true, alarm: true } }));

        const kapat = kur({ bildirim: true, alarm: true }, false);
        fireEvent(kapat.ekran.getByLabelText('Gerçek alarm'), 'valueChange', false);
        expect(kapat.ekran.queryByText('Gerçek alarm açılsın mı?')).toBeNull();
        expect(kapat.onDegistir).toHaveBeenCalledWith(expect.objectContaining({ kanallar: { bildirim: true, alarm: false } }));
    });

    test('kapalı adımda anahtar gösterilmez', () => {
        const { ekran } = kur({}, true);
        expect(ekran.queryByLabelText('Gerçek alarm')).toBeNull();
    });

    test('alarm kanalı muhafız vakitlerinde seçilebilir, cumada (teslimci dışı) değil', () => {
        expect(vakitPencereTanimi('ogle').alarmSecilebilir).toBe(true);
        const cuma = cumaPencereTanimi({
            esikSinirlari: { min: 15, max: 180 },
            esikAdimDk: 5,
            tekrarMinDk: 5,
            tekrarMaxDk: 60,
            varsayilanTekrarDk: 10,
        });
        expect(cuma.alarmSecilebilir).not.toBe(true);
    });
});

describe('Alarm kapsamı ("Yalnız ilk uyarıda" / "Her uyarıda")', () => {
    test('alarm açıkken iki seçenek görünür; varsayılan "Yalnız ilk uyarıda"', () => {
        const { ekran } = kur({ bildirim: true, alarm: true }, true);
        expect(ekran.getByLabelText('Alarm: Yalnız ilk uyarıda').props.accessibilityState.selected).toBe(true);
        expect(ekran.getByLabelText('Alarm: Her uyarıda').props.accessibilityState.selected).toBe(false);
    });

    test('"Her uyarıda" alanı yazar; "Yalnız ilk" alanı SİLER (yokluğu "ilk" — kayıt-oynat değişmez)', () => {
        const { ekran, onDegistir } = kur({ bildirim: true, alarm: true }, true);
        fireEvent.press(ekran.getByLabelText('Alarm: Her uyarıda'));
        expect(onDegistir).toHaveBeenLastCalledWith(expect.objectContaining({ alarmKapsami: 'hepsi' }));

        const onDegistir2 = jest.fn();
        const ikinci = render(
            <AdimDetayModal
                gorunur
                tanim={vakitPencereTanimi('imsak')}
                seviyeler={[{ ...adim({ bildirim: true, alarm: true }), alarmKapsami: 'hepsi' }]}
                indeks={0}
                ttsDestekli={null}
                onDegistir={onDegistir2}
                onKapat={jest.fn()}
                alarmOnayiVar
            />
        );
        // "Her uyarıda" seçiliyken bedel söylenir.
        expect(ikinci.getByText(/Her alarm tam ekran açılır ve bildirim sınırına sayılır/)).toBeTruthy();
        fireEvent.press(ikinci.getByLabelText('Alarm: Yalnız ilk uyarıda'));
        const yazilan = onDegistir2.mock.calls.at(-1)[0];
        expect('alarmKapsami' in yazilan).toBe(false);
    });

    test('alarm kapalıyken kapsam seçimi gösterilmez', () => {
        const { ekran } = kur({ bildirim: true }, true);
        expect(ekran.queryByLabelText('Alarm: Her uyarıda')).toBeNull();
    });
});

describe('cipKanallariniBirlestir — alarm bağımsız eksen', () => {
    const cip = (id: string) => KANAL_CIPLERI.find((c) => c.id === id)!;
    test('çip değişince açık alarm korunur', () => {
        expect(cipKanallariniBirlestir({ bildirim: true, alarm: true }, cip('ikisi'))).toEqual({
            bildirim: true,
            sesli: true,
            alarm: true,
        });
    });
    test("'kapalı' çipi alarmı da düşürür (yoksa 'kapattım ama çalıyor')", () => {
        expect(cipKanallariniBirlestir({ bildirim: true, alarm: true }, cip('kapali'))).toEqual({});
    });
});

describe('iPhone — AlarmKit izni (iOS 26, issue #74)', () => {
    const alarmKit = require('../../../../../modules/expo-muhafiz-alarmkit/src') as {
        alarmKitDurumu: jest.Mock;
        alarmKitIzniIste: jest.Mock;
    };
    const { iosYetenekleri } = require('../../../../core/muhafiz/ios/platformYetenekleri');
    afterEach(() => {
        alarmKit.alarmKitDurumu.mockResolvedValue('desteklenmiyor');
        alarmKit.alarmKitIzniIste.mockResolvedValue('desteklenmiyor');
    });

    const iosKur = (kanallar: UyariKanallari, alarmOnayiVar: boolean) => {
        const onDegistir = jest.fn();
        const ekran = render(
            <AdimDetayModal
                gorunur
                tanim={vakitPencereTanimi('imsak', 'cikisaDogru', undefined, iosYetenekleri(false))}
                seviyeler={[adim(kanallar)]}
                indeks={0}
                ttsDestekli={null}
                onDegistir={onDegistir}
                onKapat={jest.fn()}
                alarmOnayiVar={alarmOnayiVar}
                onAlarmOnayiVer={jest.fn()}
            />
        );
        return { ekran, onDegistir };
    };

    test('onayda sistem izni anahtar YAZILMADAN önce istenir, sonra anahtar açılır', async () => {
        alarmKit.alarmKitDurumu.mockResolvedValue('belirsiz');
        alarmKit.alarmKitIzniIste.mockResolvedValue('izinli');
        const { ekran, onDegistir } = iosKur({ bildirim: true }, false);
        fireEvent(ekran.getByLabelText('Gerçek alarm'), 'valueChange', true);
        expect(await ekran.findByText(/bir kez alarm izni isteyecek/)).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Alarmı açın'));
        expect(onDegistir).not.toHaveBeenCalled();
        await waitFor(() =>
            expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ kanallar: { bildirim: true, alarm: true } }))
        );
        expect(alarmKit.alarmKitIzniIste).toHaveBeenCalledTimes(1);
    });

    test('izin reddedilmişse not Ayarlar düğmesini gösterir', async () => {
        alarmKit.alarmKitDurumu.mockResolvedValue('reddedildi');
        const { ekran } = iosKur({ bildirim: true, alarm: true }, true);
        expect(await ekran.findByLabelText('Alarm iznini Ayarlar’dan açın')).toBeTruthy();
    });
});
