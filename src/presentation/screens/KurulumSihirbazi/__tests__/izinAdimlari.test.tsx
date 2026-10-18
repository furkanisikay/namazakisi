/**
 * Sihirbaz izin adımları: izin ZATEN verilmişse soru sorulmaz, "geçiliyor" denmez
 * (otomatik ilerleme yok); kalıcı red Ayarlar yolunu söyler.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (p: { name: string }) => <Text>{p.name}</Text> };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{p.name}</Text>;
});
jest.mock('../../../../core/theme', () => ({ useTema: () => ({ tema: { renkler: {} }, palet: {} }), useRenkler: () => ({}) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: { children: React.ReactNode }) => children }));

import { BildirimIzniAdimi, KonumAdimi } from '../adimlar';

describe('BildirimIzniAdimi', () => {
    it('izin zaten açıksa "açık" der, "geçiliyor" demez', () => {
        const { getByText, queryByText } = render(<BildirimIzniAdimi bildirimIzni="verildi" zatenVar />);
        expect(getByText('Bildirim izni açık')).toBeTruthy();
        expect(queryByText(/geçiliyor/)).toBeNull();
    });
    it('kalıcı redde Ayarlar düğmesini işaret eder', () => {
        const { getByText } = render(<BildirimIzniAdimi bildirimIzni="reddedildi" kaliciRed />);
        expect(getByText(/"Ayarları açın"/)).toBeTruthy();
    });
});

describe('KonumAdimi', () => {
    it('izin zaten açıksa izin istemez, konumu almayı söyler', () => {
        const ortak = {
            konumBilgi: '',
            manuelIl: null,
            setManuelIl: jest.fn(),
            onIzinIste: jest.fn(),
            onAtla: jest.fn(),
            onManuelKaydet: jest.fn(),
        };
        const { getByText } = render(<KonumAdimi konumDurumu="bekliyor" izinZatenVar {...ortak} />);
        expect(getByText(/Konum izni açık/)).toBeTruthy();
    });
});
