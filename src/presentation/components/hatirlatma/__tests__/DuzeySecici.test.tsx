/**
 * Düzey seçici: dört düzey, canlı tek cümle, sesli düzeyde TEK bilgilendirme maddesi
 * (rıza kaydının "görüldü" şartı buna bağlıdır).
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{`ikon:${p.name}`}</Text>;
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({ metin: '#000', metinIkincil: '#666', birincil: '#4CAF50', sinir: '#ddd', kartArkaplan: '#fff' }),
}));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));

import { AccessibilityInfo } from 'react-native';
import { DuzeySecici, sesliBilgiGosterildiMi, duzeySesliMi } from '../DuzeySecici';

describe('DuzeySecici', () => {
    it('dört düzeyi radyo olarak çizer, seçim canlı cümleyi değiştirir', () => {
        const onSec = jest.fn();
        const { getByLabelText, getByText, rerender } = render(<DuzeySecici secili="normal" onSec={onSec} />);
        expect(getByText('Çıkmadan 45 dk önce başlar, 6 uyarı. Son dakikada sesli okur.')).toBeTruthy();
        fireEvent.press(getByLabelText(/^Yoğun\./));
        expect(onSec).toHaveBeenCalledWith('yogun');
        rerender(<DuzeySecici secili="hafif" onSec={onSec} />);
        expect(getByText('Çıkmadan 30 dk önce başlar, 4 uyarı. Sesli okuma yok.')).toBeTruthy();
        expect(getByLabelText(/^Hafif\./).props.accessibilityState).toMatchObject({ selected: true });
    });

    it('sesli bilgi yalnız sesli düzeyde ve izin verildiyse görünür', () => {
        const { queryByTestId, rerender } = render(<DuzeySecici secili="yogun" onSec={jest.fn()} />);
        expect(queryByTestId('duzey-sesli-bilgi')).toBeTruthy();
        rerender(<DuzeySecici secili="hafif" onSec={jest.fn()} />);
        expect(queryByTestId('duzey-sesli-bilgi')).toBeNull();
        rerender(<DuzeySecici secili="normal" onSec={jest.fn()} sesliBilgiGoster={false} />);
        expect(queryByTestId('duzey-sesli-bilgi')).toBeNull();
    });

    it('NÖBETÇİ: sesli bilgi göründüğü an ekran okuyucuya duyurulur; iPhone metni "sessizde duyulmaz" der', async () => {
        const duyur = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
        const { rerender, getByText } = render(<DuzeySecici secili="hafif" onSec={jest.fn()} />);
        // Önceki testlerin bekleyen işleri (platform yeteneği okuması) boşalsın.
        await act(async () => {
            await Promise.resolve();
        });
        duyur.mockClear();
        rerender(<DuzeySecici secili="hafif" onSec={jest.fn()} />);
        expect(duyur).not.toHaveBeenCalledWith(expect.stringMatching(/Sesli okuma/));
        rerender(<DuzeySecici secili="yogun" onSec={jest.fn()} />);
        // jest varsayılan platformu iOS → bildirim sesi metni.
        expect(duyur).toHaveBeenCalledWith('Sesli okuma bildirim sesiyle çalar; telefon sessizdeyken duyulmaz.');
        expect(getByText('Sesli okuma bildirim sesiyle çalar; telefon sessizdeyken duyulmaz.')).toBeTruthy();
        duyur.mockRestore();
    });

    it('rıza yardımcısı ekranla aynı kuralı verir', () => {
        expect(duzeySesliMi('normal')).toBe(true);
        expect(duzeySesliMi('kapali')).toBe(false);
        expect(sesliBilgiGosterildiMi('yogun')).toBe(true);
        expect(sesliBilgiGosterildiMi('hafif')).toBe(false);
        expect(sesliBilgiGosterildiMi('normal', false)).toBe(false);
    });
});

describe('DuzeySecici — "Kendi ayarınız" (Dalga 3)', () => {
    it('yalnız istenince ya da seçiliyken beşinci kart olur; seçiliyken cümle kendi ayarını söyler', () => {
        const onSec = jest.fn();
        const { queryByLabelText, getByLabelText, getByText, rerender } = render(<DuzeySecici secili="normal" onSec={onSec} />);
        expect(queryByLabelText(/^Kendi ayarınız\./)).toBeNull();
        rerender(<DuzeySecici secili="normal" onSec={onSec} ozelGoster />);
        fireEvent.press(getByLabelText(/^Kendi ayarınız\./));
        expect(onSec).toHaveBeenCalledWith('ozel');
        rerender(<DuzeySecici secili="ozel" onSec={onSec} />);
        expect(getByLabelText(/^Kendi ayarınız\./).props.accessibilityState).toMatchObject({ selected: true });
        expect(getByText('Her vakit sizin ayarladığınız gibi hatırlatılır.')).toBeTruthy();
    });
});
