/**
 * Sesli okuma uyarı bandı: cihaz sorgusu "ses yok" derse ya da etkin dil telefonlarda hiç
 * sesi olmayan bir dilse (iPhone'da sorgu `null` döner) bant çizilir.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({}) }));
jest.mock('../../../../domain/services/CihazDurumOkuyucu', () => ({ surumuOku: () => 34 }));
jest.mock('../../../../domain/services/AnonsOnizlemeServisi', () => ({ adimiOnizle: jest.fn() }));
jest.mock('../../ortak/DurumSatiri', () => {
    const { Text } = require('react-native');
    return { DurumSatiri: ({ durum }: { durum: { metin: string } }) => <Text>{durum.metin}</Text> };
});

import { TurkceTtsUyarisi } from '../AnonsBilesenleri';
import { aktifDiliKur, aktifDilSifirla, sozluk } from '../../../../core/dil/aktifDil';

afterEach(() => aktifDilSifirla());

describe('TurkceTtsUyarisi', () => {
    it('sesi olan dilde cihaz sorgusu bilinmiyorsa (null) bant çizilmez', () => {
        aktifDiliKur('en');
        const { toJSON } = render(<TurkceTtsUyarisi destekli={null} />);
        expect(toJSON()).toBeNull();
    });

    it('sesi olmayan dilde sorgu null olsa da (iPhone) "ses yok" bandı çizilir', () => {
        aktifDiliKur('nqo');
        const { getByText } = render(<TurkceTtsUyarisi destekli={null} />);
        expect(getByText(sozluk('nqo').cihaz.durum.ttsDilYok)).toBeTruthy();
    });

    it('listedeki dilde cihaz ses bildiriyorsa (üçüncü taraf motor) bant çizilmez', () => {
        aktifDiliKur('ka');
        const { toJSON } = render(<TurkceTtsUyarisi destekli={true} />);
        expect(toJSON()).toBeNull();
    });

    it('sesi olan dilde cihaz "yok" derse bant çizilir', () => {
        aktifDiliKur('en');
        const { toJSON } = render(<TurkceTtsUyarisi destekli={false} />);
        expect(toJSON()).not.toBeNull();
    });
});
