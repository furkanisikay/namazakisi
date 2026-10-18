import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ birincil: '#4CAF50', birincilMetin: '#FFFFFF', basarili: '#4CAF50', metin: '#212121' }),
}));
const mockAzalt = { deger: false };
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => mockAzalt.deger }));

import { KildimDugmesi } from '../KildimDugmesi';
import { BasariIsareti, SilinebilirSatir } from '../hareketler';
import { Text } from 'react-native';

beforeEach(() => {
    mockAzalt.deger = false;
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('KildimDugmesi', () => {
    it('kılınmamışken "Kıldım", basınca onKildim', () => {
        const onKildim = jest.fn();
        const { getByLabelText } = render(<KildimDugmesi kilindi={false} onKildim={onKildim} vakitAdi="Öğle" />);
        fireEvent.press(getByLabelText('Öğle — Kıldım'));
        expect(onKildim).toHaveBeenCalled();
    });

    it('ilk çizimde zaten kılınmışsa animasyon OYNAMAZ (boşta sıfır hareket), son karede doğar', () => {
        const sira = jest.spyOn(Animated, 'sequence');
        const { getByLabelText } = render(<KildimDugmesi kilindi onKildim={jest.fn()} vakitAdi="Öğle" />);
        expect(getByLabelText('Öğle — Kılındı').props.accessibilityState).toMatchObject({ checked: true });
        expect(sira).not.toHaveBeenCalled();
    });

    it('false → true geçişinde sahne BİR KEZ oynar ve "Kılındı" duyurulur; yeniden çizim tekrar oynatmaz', () => {
        const sira = jest.spyOn(Animated, 'sequence');
        const duyuru = AccessibilityInfo.announceForAccessibility as jest.Mock;
        const { rerender } = render(<KildimDugmesi kilindi={false} onKildim={jest.fn()} />);
        rerender(<KildimDugmesi kilindi onKildim={jest.fn()} />);
        rerender(<KildimDugmesi kilindi onKildim={jest.fn()} />);
        expect(sira).toHaveBeenCalledTimes(1);
        expect(duyuru).toHaveBeenCalledWith('Kılındı');
    });

    it('animasyonları azalt: sahne oynamaz, bilgi yine duyurulur', () => {
        mockAzalt.deger = true;
        const sira = jest.spyOn(Animated, 'sequence');
        const { rerender } = render(<KildimDugmesi kilindi={false} onKildim={jest.fn()} />);
        rerender(<KildimDugmesi kilindi onKildim={jest.fn()} />);
        expect(sira).not.toHaveBeenCalled();
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Kılındı');
    });

    it('kılınmışken geri alma yoksa dokunulmaz', () => {
        const { getByLabelText } = render(<KildimDugmesi kilindi onKildim={jest.fn()} />);
        expect(getByLabelText('Kılındı').props.accessibilityState).toMatchObject({ disabled: true });
    });
});

describe('SilinebilirSatir', () => {
    it('çıkış bitince onCikti çağrılır', async () => {
        const onCikti = jest.fn();
        const { rerender } = render(
            <SilinebilirSatir siliniyor={false} onCikti={onCikti}>
                <Text>satır</Text>
            </SilinebilirSatir>,
        );
        expect(onCikti).not.toHaveBeenCalled();
        rerender(
            <SilinebilirSatir siliniyor onCikti={onCikti}>
                <Text>satır</Text>
            </SilinebilirSatir>,
        );
        await waitFor(() => expect(onCikti).toHaveBeenCalledTimes(1));
    });

    it('animasyonları azalt: hemen çıkar', () => {
        mockAzalt.deger = true;
        const onCikti = jest.fn();
        render(
            <SilinebilirSatir siliniyor onCikti={onCikti}>
                <Text>satır</Text>
            </SilinebilirSatir>,
        );
        expect(onCikti).toHaveBeenCalledTimes(1);
    });
});

describe('BasariIsareti', () => {
    it('yalnız false → true geçişinde oynar', () => {
        const paralel = jest.spyOn(Animated, 'parallel');
        const { rerender } = render(<BasariIsareti goster={false} />);
        act(() => rerender(<BasariIsareti goster />));
        act(() => rerender(<BasariIsareti goster />));
        expect(paralel).toHaveBeenCalledTimes(1);
    });
});
