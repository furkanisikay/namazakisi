import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useDonanimGeriTusu } from '../../../hooks/useDonanimGeriTusu';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    arkaplan: '#FAFAFA',
    durum: { basarili: '#4CAF50', uyari: '#FFC107' },
  }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));

import { KazaOneriModal } from '../KazaOneriModal';

const proplar = () => ({
  gorunur: true,
  kilinanFarz: 'İkindi',
  kazaNamazi: 'İkindi' as const,
  onKildim: jest.fn(),
  onSimdiDegil: jest.fn(),
  onBirDahaSorma: jest.fn(),
});

describe('KazaOneriModal (issue #294)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('soruyu ve küçük harfli kaza adını (toLowerCase tuzağı olmadan) gösterir', () => {
    const { getByText } = render(<KazaOneriModal {...proplar()} />);
    expect(getByText('Bir kaza da kılar mısınız?')).toBeTruthy();
    expect(getByText(/Bir ikindi kazası/)).toBeTruthy();
  });

  it('üç eylem doğru geri çağrıya bağlı', () => {
    const p = proplar();
    const { getByLabelText } = render(<KazaOneriModal {...p} />);
    fireEvent.press(getByLabelText('Kıldım, kazadan düşün'));
    fireEvent.press(getByLabelText('Şimdi değil'));
    fireEvent.press(getByLabelText('Bir daha sormayın'));
    expect(p.onKildim).toHaveBeenCalledTimes(1);
    expect(p.onSimdiDegil).toHaveBeenCalledTimes(1);
    expect(p.onBirDahaSorma).toHaveBeenCalledTimes(1);
  });

  it('donanım geri tuşu = "Şimdi değil"', () => {
    const p = proplar();
    render(<KazaOneriModal {...p} />);
    const [gorunur, geri] = (useDonanimGeriTusu as jest.Mock).mock.calls.at(-1)!;
    expect(gorunur).toBe(true);
    geri();
    expect(p.onSimdiDegil).toHaveBeenCalledTimes(1);
  });

  it('işlenirken düğmeler pasif, geri tuşu öneriyi kapatmaz', () => {
    const p = proplar();
    const { getByLabelText } = render(<KazaOneriModal {...p} isleniyor />);
    fireEvent.press(getByLabelText('Kıldım, kazadan düşün'));
    const geri = (useDonanimGeriTusu as jest.Mock).mock.calls.at(-1)![1];
    geri();
    expect(p.onKildim).not.toHaveBeenCalled();
    expect(p.onSimdiDegil).not.toHaveBeenCalled();
  });

  it('metin ibadete çağrı tonunda değil, arayüz kaydında (sen dili / "secde" / "terk" yok)', () => {
    const { toJSON } = render(<KazaOneriModal {...proplar()} />);
    const metin = JSON.stringify(toJSON());
    expect(metin).not.toMatch(/secde|terk|\bsen\b|senin/i);
  });
});
