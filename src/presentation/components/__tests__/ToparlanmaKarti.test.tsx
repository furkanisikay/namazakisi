import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { ToparlanmaKarti } from '../ToparlanmaKarti';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));

jest.useFakeTimers();

const ornekToparlanmaDurumu = {
  tamamlananGun: 1,
  hedefGunSayisi: 3,
  baslangicTarihi: '2026-03-20',
  oncekiSeri: 10,
};

describe('ToparlanmaKarti', () => {
  it('ilerleme dairelerini gösterir, progress bar olmadan', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain('progressBarContainer');
  });

  it('yumuşatılmış uyarı metnini gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('aradaki bo');
    expect(json).not.toContain('Dikkat:');
  });
});
