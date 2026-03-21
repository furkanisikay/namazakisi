import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { HomeHeader } from '../HomeHeader';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFF',
    arkaplan: '#F5F5F5',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { uyari: '#FF6B35', hata: '#F44336', basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../../../../core/utils/TarihYardimcisi', () => ({
  tarihiGorunumFormatinaCevir: () => '21 Mart 2026',
  gunAdiniAl: () => 'Cumartesi',
}));

jest.useFakeTimers();

const temelProps = {
  tarih: '2026-03-21',
  streakGun: 10,
  bugunMu: true,
  onTarihTikla: jest.fn(),
  onSeriTikla: jest.fn(),
};

describe('HomeHeader — Kademeli Ateş İkonu', () => {
  it('normal modda ateş ikonu SERI_RENKLERI.ATES renginde (#FF6B35)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeHeader {...temelProps} />); });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('FF6B35');
    expect(json).not.toContain('9ca3af');
  });

  it('toparlanma gün 0/3 → gri/donuk', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 0, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('9ca3af');
  });

  it('toparlanma gün 1/3 → amber', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('f59e0b');
  });

  it('toparlanma gün 2/3 → turuncu', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 2, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('f97316');
  });

  it('recovery label X/Y gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('1/3');
  });
});
