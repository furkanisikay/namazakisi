/**
 * Uzun dilde (Tamilce/Malayalamca kare turu) kesilen/taşan metinlerin yerleşim nöbetçisi.
 * Piksel ölçmez; kesilmeyi önleyen özellikleri (küçülme, satır sayısı, esneme) denetler.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        metin: '#212121',
        metinIkincil: '#757575',
    }),
}));

import { ParcaliSecici } from '../ParcaliSecici';
import { SesSecimSatiri } from '../SesSecimSatiri';

const duzStil = (stil: unknown) => (StyleSheet.flatten(stil as never) ?? {}) as Record<string, unknown>;

describe('ParcaliSecici uzun etiket', () => {
    it('eşit parçada etiket tek satırda kalır ve sığmazsa küçülür', () => {
        const { getByText } = render(
            <ParcaliSecici
                boyut="buyuk"
                secenekler={[
                    { deger: 'a', etiket: 'Hafif' },
                    { deger: 'b', etiket: 'தனிப்பயனாக்கப்பட்டது' },
                ]}
                secili="a"
                onSec={jest.fn()}
            />
        );
        const etiket = getByText('தனிப்பயனாக்கப்பட்டது');
        expect(etiket.props.numberOfLines).toBe(1);
        expect(etiket.props.adjustsFontSizeToFit).toBe(true);
        expect(etiket.props.minimumFontScale).toBeLessThan(1);
        expect(duzStil(etiket.props.style).flexShrink).toBe(1);
    });
});

describe('SesSecimSatiri uzun metin', () => {
    it('kompakt satırdaki ses adı iki satıra kadar sarılır (tek satır üç noktası yok)', () => {
        const { getByText } = render(
            <SesSecimSatiri bildirimSesi="varsayilan" varsayilanAdi="கிடைக்கவில்லை · ஃபோன் ஒலி" onSec={jest.fn()} onDinle={jest.fn()} kompakt />
        );
        expect(getByText('கிடைக்கவில்லை · ஃபோன் ஒலி').props.numberOfLines).toBe(2);
    });

    it('"Kendi dosyanızı seçin": etiket ve ipucu esneyen, sarılan satırda (ipucu sıfır genişliğe inmez)', () => {
        const { getByTestId, getByText } = render(
            <SesSecimSatiri
                bildirimSesi="varsayilan"
                onSec={jest.fn()}
                onDinle={jest.fn()}
                onDosyadanSec={jest.fn()}
                kompakt
                testID="ses"
            />
        );
        fireEvent.press(getByText('Uygulama sesi'));
        const kap = getByTestId('ses-dosya-metinler');
        expect(duzStil(kap.props.style)).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap', flexShrink: 1 });
        const ipucu = getByText('Örneğin bir ezan kaydı');
        const etiket = getByText('Kendi dosyanızdan seçin');
        expect(duzStil(etiket.props.style).flexShrink).toBe(1);
        expect(duzStil(ipucu.props.style).flexShrink).toBe(1);
    });
});
