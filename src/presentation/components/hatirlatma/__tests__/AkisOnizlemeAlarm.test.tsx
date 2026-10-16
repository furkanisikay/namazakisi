/**
 * NOBETCI — "Akışı önizle" GERÇEK ALARM tetiklerini gösterir (issue #74).
 *
 * Önizleme motorun planından beslenir; planın `alarm: true` işaretlediği tetik
 * "Alarm çalar · SS:DD" etiketini (ekran okuyucuda da) taşımalı — "her uyarıda"
 * kapsamında tekrarlar da. Alarmsız tetikte etiket YOK.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

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
        bilgi: '#2196F3',
        metin: '#212121',
        metinIkincil: '#757575',
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({ sesSec: jest.fn() }));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { temizle: jest.fn(), bildirimSesiniCal: jest.fn() },
}));

import { AkisOnizlemeModal } from '../AkisOnizlemeModal';
import { vakitPencereTanimi } from '../pencereTanimi';
import { ANDROID_YETENEKLERI } from '../../../../core/muhafiz/ios/platformYetenekleri';
import type { SeviyeAyari, VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';

const BITIS = new Date(2026, 9, 15, 14, 0, 0);
const BASLANGIC = new Date(2026, 9, 15, 12, 0, 0);

const adim = (esikDk: number, ek: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
    kademe: 'nazik',
    kanallar: { bildirim: true },
    esikDk,
    siklik: 'birkez',
    bildirimSesi: 'varsayilan',
    anonsMetni: '',
    ...ek,
});

const kur = (ayar: VakitMuhafizAyari) =>
    render(
        <AkisOnizlemeModal
            gorunur
            tanim={vakitPencereTanimi('ogle', 'cikisaDogru', 120, ANDROID_YETENEKLERI, { baslangic: BASLANGIC, bitis: BITIS })}
            ayar={ayar}
            ttsDestekli={null}
            onKapat={jest.fn()}
        />
    );

describe('Akışı önizle — gerçek alarm', () => {
    it('alarmlı adımın İLK tetiği "Alarm çalar · 13:52" der; alarmsız adımda etiket yok', () => {
        const ekran = kur({
            seviyeler: [adim(30), adim(8, { kanallar: { bildirim: true, alarm: true }, siklik: { herDk: 4 } })],
        });
        expect(ekran.getAllByText('Alarm çalar · 13:52')).toHaveLength(1);
        expect(ekran.getAllByTestId('onizleme-alarm')).toHaveLength(1);
        // Ekran okuyucu da duyar.
        expect(ekran.getByLabelText(/Alarm çalar · 13:52/)).toBeTruthy();
    });

    it('"Her uyarıda": tekrarlar da alarm olarak gösterilir', () => {
        const ekran = kur({
            seviyeler: [adim(8, { kanallar: { bildirim: true, alarm: true }, siklik: { herDk: 4 }, alarmKapsami: 'hepsi' })],
        });
        expect(ekran.getByText('Alarm çalar · 13:52')).toBeTruthy();
        expect(ekran.getByText('Alarm çalar · 13:56')).toBeTruthy();
    });

    it('alarm kanalı kapalıysa hiçbir tetikte etiket yok', () => {
        const ekran = kur({ seviyeler: [adim(30), adim(8)] });
        expect(ekran.queryByTestId('onizleme-alarm')).toBeNull();
    });
});
