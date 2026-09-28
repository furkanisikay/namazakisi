/**
 * ErrorBoundary — yedek ekran renkleri tema token'larından gelir.
 * Sınıf bileşeni hook kullanamadığı için TemaContext.Consumer ile okunur;
 * Provider yoksa varsayılan context (açık tema) devreye girmelidir.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';
import { TemaContext } from '../../../../core/theme/TemaContext';
import { ACIK_TEMA, KOYU_TEMA, RENK_PALETLERI, Tema } from '../../../../core/theme/temalar';

jest.mock('../../../../core/utils/Logger', () => ({
  Logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const Firlatan: React.FC = () => {
  throw new Error('Deneme hatası');
};

const baglamDegeri = (tema: Tema) => ({
  tema,
  palet: RENK_PALETLERI[0],
  mod: tema.mod === 'koyu' ? ('koyu' as const) : ('acik' as const),
  koyuMu: tema.mod === 'koyu',
  tumPaletler: RENK_PALETLERI,
  moduDegistir: jest.fn(),
  paletiDegistir: jest.fn(),
  yukleniyor: false,
});

const stilAl = (eleman: { props: { style?: unknown } }) =>
  StyleSheet.flatten(eleman.props.style as never) as Record<string, unknown>;

describe('ErrorBoundary yedek ekranı', () => {
  let konsolHatasi: jest.SpyInstance;

  beforeEach(() => {
    // React yakalanan hatayı konsola da yazar; test çıktısını kirletmesin.
    konsolHatasi = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    konsolHatasi.mockRestore();
  });

  it.each([
    ['açık', ACIK_TEMA],
    ['koyu', KOYU_TEMA],
  ])('%s temada renkler tema token\'larından gelir', (_ad, tema) => {
    render(
      <TemaContext.Provider value={baglamDegeri(tema)}>
        <ErrorBoundary>
          <Firlatan />
        </ErrorBoundary>
      </TemaContext.Provider>,
    );

    const baslik = screen.getByText('Bir hata oluştu');
    expect(stilAl(baslik).color).toBe(tema.renkler.durum.hata);
    expect(stilAl(screen.getByText('Deneme hatası')).color).toBe(tema.renkler.metin);

    // "Component Stack:" 13 dp → hata kırmızısı AA'yı geçmiyordu, metin rengi kullanılır.
    const yiginBasligi = screen.getByText('Component Stack:');
    expect(stilAl(yiginBasligi).color).toBe(tema.renkler.metin);

    // Kutu zeminden sınır çizgisiyle ayrılır.
    const yiginKutusu = yiginBasligi.parent?.parent as { props: { style?: unknown } };
    const kutuStili = stilAl(yiginKutusu);
    expect(kutuStili.backgroundColor).toBe(tema.renkler.kartArkaplan);
    expect(kutuStili.borderColor).toBe(tema.renkler.sinir);
    expect(kutuStili.borderWidth).toBe(1);

    const buton = screen.getByRole('button', { name: 'Tekrar Dene' });
    expect(stilAl(buton).backgroundColor).toBe(tema.renkler.durum.hata);
    // Kalın ≥18,66 dp = büyük metin → beyaz metin 3:1 eşiğini geçer.
    expect(stilAl(screen.getByText('Tekrar Dene')).fontSize).toBe(19);
  });

  it('Provider olmadan da yedek ekran varsayılan (açık) temayla çizilir', () => {
    render(
      <ErrorBoundary>
        <Firlatan />
      </ErrorBoundary>,
    );

    const baslik = screen.getByText('Bir hata oluştu');
    expect(stilAl(baslik).color).toBe(ACIK_TEMA.renkler.durum.hata);
    expect(screen.getByRole('button', { name: 'Tekrar Dene' })).toBeTruthy();
  });
});
