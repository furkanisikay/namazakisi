import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PUAN_DEGERLERI } from '../../../../core/types/SeriTipleri';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));

// Tema renklerini deterministik sabit bir palete sabitle (üretim renk seçimine bağımlı değiliz)
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    vurgu: '#00BFA5',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
    devredisi: '#BDBDBD',
  }),
}));

import { VakitKarti } from '../VakitKarti';

describe('VakitKarti Bileşeni', () => {
  const varsayilanProps = {
    vakitBilgisi: null,
    kalanSureStr: '01:30:00',
    suankiVakitAdi: 'Öğle',
    vakitAraligi: '13:00 - 16:30',
    tamamlandi: false,
    onTamamla: jest.fn(),
  };

  // +N puan rozetindeki N, üretimle AYNI kaynaktan (PUAN_DEGERLERI) türetilir;
  // sabit değişirse test de değişen değeri bekler (totoloji değil, tek-kaynak doğrulaması).
  const puanMetni = `+${PUAN_DEGERLERI.namaz_kilindi} puan`;

  // @expo/vector-icons mock'u FontAwesome5'i 'FontAwesome5' adlı host bileşenine indirdiğinden
  // ağaçtaki tüm ikonların `name` prop'unu toplayabiliriz (ikon eşlemesini doğrulamak için).
  const ikonAdlariniTopla = (root: ReturnType<typeof render>['root']): string[] =>
    root
      .findAll((dugum) => (dugum.type as unknown as string) === 'FontAwesome5')
      .map((dugum) => dugum.props.name as string);

  it('aktif vakitte sözleşmeyi (badge, başlık, aralık, sayaç, buton, puan) render eder', () => {
    const { getByText } = render(<VakitKarti {...varsayilanProps} kilitli={false} />);

    // Aktif vakit rozeti — kilitli DEĞİL
    expect(getByText('ŞU ANKİ VAKİT')).toBeTruthy();
    // Başlık ve aralık prop'tan birebir gelmeli
    expect(getByText('Öğle')).toBeTruthy();
    expect(getByText('13:00 - 16:30')).toBeTruthy();
    // Kalan süre sayacı prop'tan birebir gelmeli
    expect(getByText('01:30:00')).toBeTruthy();
    expect(getByText('Kalan Süre')).toBeTruthy();
    // Aktif buton metni
    expect(getByText('Kılındı Olarak İşaretle')).toBeTruthy();
    // Puan teşvik rozeti yalnızca aktif (tamamlanmamış + kilitsiz) durumda görünür
    expect(getByText(puanMetni)).toBeTruthy();
    expect(getByText('Seriyi bozma! 🔥')).toBeTruthy();
  });

  it('konumMetni verilince konum rozetini gösterir, verilmeyince göstermez', () => {
    const { queryByText, rerender } = render(
      <VakitKarti {...varsayilanProps} kilitli={false} />
    );
    // konumMetni yokken rozet render edilmemeli
    expect(queryByText('Nilüfer, Bursa')).toBeNull();

    rerender(
      <VakitKarti {...varsayilanProps} kilitli={false} konumModu="oto" konumMetni="Nilüfer, Bursa" />
    );
    expect(queryByText('Nilüfer, Bursa')).toBeTruthy();
  });

  it('aktif butona basınca onTamamla bir kez çağrılır (buton etkin)', () => {
    const onTamamla = jest.fn();
    const { getByText } = render(
      <VakitKarti {...varsayilanProps} onTamamla={onTamamla} kilitli={false} />
    );

    fireEvent.press(getByText('Kılındı Olarak İşaretle'));
    expect(onTamamla).toHaveBeenCalledTimes(1);
  });

  it('kilitli modda SIRADAKİ VAKİT gösterir, butonu devre dışı bırakır ve puan rozetini gizler', () => {
    const onTamamla = jest.fn();
    const { getByText, queryByText } = render(
      <VakitKarti {...varsayilanProps} onTamamla={onTamamla} kilitli={true} />
    );

    // Rozet metni 'SIRADAKİ VAKİT' olmalı, aktif metin 'ŞU ANKİ VAKİT' GÖRÜNMEMELİ
    expect(getByText('SIRADAKİ VAKİT')).toBeTruthy();
    expect(queryByText('ŞU ANKİ VAKİT')).toBeNull();

    // Kilitli buton metni
    expect(getByText('Vakit Girmedi')).toBeTruthy();

    // Puan teşvik rozeti kilitli modda render EDİLMEMELİ
    expect(queryByText(puanMetni)).toBeNull();
    expect(queryByText('Seriyi bozma! 🔥')).toBeNull();

    // Disabled buton: press handler tetiklenmemeli (üretim satır 128: disabled={tamamlandi || kilitli})
    fireEvent.press(getByText('Vakit Girmedi'));
    expect(onTamamla).not.toHaveBeenCalled();
  });

  it('tamamlandığında buton "Kılındı" olur, devre dışı kalır ve puan rozeti gizlenir', () => {
    const onTamamla = jest.fn();
    const { getByText, queryByText } = render(
      <VakitKarti {...varsayilanProps} onTamamla={onTamamla} tamamlandi={true} kilitli={false} />
    );

    expect(getByText('Kılındı')).toBeTruthy();
    // Tamamlanmış durumda da teşvik rozeti gizli (üretim: !tamamlandi && !kilitli)
    expect(queryByText(puanMetni)).toBeNull();

    // Tamamlanmış buton disabled: tekrar tamamla çağrılmamalı
    fireEvent.press(getByText('Kılındı'));
    expect(onTamamla).not.toHaveBeenCalled();
  });

  it('tamamlandığında buton check-circle ikonunu gösterir (pray/clock değil)', () => {
    // Buton ikonu üretim satır 131: tamamlandi -> "check-circle" (kilitli "clock", aksi "pray")
    const { root } = render(
      <VakitKarti {...varsayilanProps} tamamlandi={true} kilitli={false} />
    );

    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('check-circle');
    expect(ikonlar).not.toContain('pray');
    expect(ikonlar).not.toContain('clock');
  });

  it('aktif (tamamlanmamış, kilitsiz) durumda buton "pray" ikonunu gösterir', () => {
    // tamamlandi=false && kilitli=false -> üretim satır 131: "pray"
    const { root } = render(<VakitKarti {...varsayilanProps} kilitli={false} />);
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('pray');
    expect(ikonlar).not.toContain('check-circle');
    expect(ikonlar).not.toContain('clock');
  });

  it('kilitli durumda buton "clock" ikonunu gösterir', () => {
    // kilitli=true -> üretim satır 131: "clock"
    const { root } = render(<VakitKarti {...varsayilanProps} kilitli={true} />);
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('clock');
    expect(ikonlar).not.toContain('pray');
  });

  // getVakitIkonu eşlemesi (üretim satır 21-32) — vakit adına göre ana ikon seçimi.
  // suankiVakitAdi ana ikon olarak ilk FontAwesome5 (satır 100) ile render edilir.
  it.each([
    ['Güneş', 'sun'],
    ['Öğle', 'sun'],
    ['Akşam', 'moon'],
    ['Yatsı', 'star-and-crescent'],
    ['İmsak', 'cloud-sun'],
    ['Sabah', 'cloud-sun'],
    ['İkindi', 'cloud-sun'],
  ])('vakit "%s" için ana ikon "%s" seçilir', (vakitAdi, beklenenIkon) => {
    const { root } = render(
      <VakitKarti {...varsayilanProps} suankiVakitAdi={vakitAdi} kilitli={false} />
    );
    // Ana vakit ikonu, ikon listesinde bulunmalı (default 'mosque' DEĞİL)
    expect(ikonAdlariniTopla(root)).toContain(beklenenIkon);
  });

  it('bilinmeyen/beklenmedik vakit adı için ana ikon "mosque" (default) olur', () => {
    // Üretim satır 30: switch default -> 'mosque'. Boş veya tanımsız vakit adında fallback.
    const { root } = render(
      <VakitKarti {...varsayilanProps} suankiVakitAdi="Teravih" kilitli={false} />
    );
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('mosque');
    // Bilinen ana ikonların hiçbiri seçilmemeli
    expect(ikonlar).not.toContain('sun');
    expect(ikonlar).not.toContain('moon');
    expect(ikonlar).not.toContain('star-and-crescent');
  });

  it('konumModu="oto" iken konum rozeti "satellite-dish" ikonu kullanır', () => {
    // Üretim satır 85: konumModu === 'oto' ? 'satellite-dish' : 'map-marker-alt'
    const { root, getByText } = render(
      <VakitKarti {...varsayilanProps} kilitli={false} konumModu="oto" konumMetni="Nilüfer, Bursa" />
    );
    expect(getByText('Nilüfer, Bursa')).toBeTruthy();
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('satellite-dish');
    expect(ikonlar).not.toContain('map-marker-alt');
  });

  it('konumModu="manuel" iken konum rozeti "map-marker-alt" ikonu kullanır', () => {
    const { root, getByText } = render(
      <VakitKarti {...varsayilanProps} kilitli={false} konumModu="manuel" konumMetni="Kadıköy, İstanbul" />
    );
    expect(getByText('Kadıköy, İstanbul')).toBeTruthy();
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).toContain('map-marker-alt');
    expect(ikonlar).not.toContain('satellite-dish');
  });

  it('konumMetni verilmeyince konum ikonlarının hiçbiri render edilmez', () => {
    // Üretim satır 81: konumMetni yoksa tüm konum badge bloğu render edilmez.
    const { root } = render(<VakitKarti {...varsayilanProps} kilitli={false} />);
    const ikonlar = ikonAdlariniTopla(root);
    expect(ikonlar).not.toContain('satellite-dish');
    expect(ikonlar).not.toContain('map-marker-alt');
  });
});
