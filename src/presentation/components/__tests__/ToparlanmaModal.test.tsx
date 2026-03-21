import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { ToparlanmaModal } from '../ToparlanmaModal';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    kartArkaplan: '#FFF',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../ToparlanmaKarti', () => ({ ToparlanmaKarti: 'ToparlanmaKarti' }));

jest.useFakeTimers();

const ornekToparlanmaDurumu = {
  tamamlananGun: 2,
  hedefGunSayisi: 3,
  baslangicTarihi: '2026-03-20',
  oncekiSeri: 10,
};

describe('ToparlanmaModal', () => {
  it('görünür modda render olur', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaModal
          gorunur={true}
          onKapat={jest.fn()}
          toparlanmaDurumu={ornekToparlanmaDurumu}
          oncekiSeri={10}
        />
      );
    });
    expect(tree!.toJSON()).toMatchSnapshot();
  });

  it('Anladım butonunu içerir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaModal
          gorunur={true}
          onKapat={jest.fn()}
          toparlanmaDurumu={ornekToparlanmaDurumu}
          oncekiSeri={10}
        />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Anlad');
  });
});
