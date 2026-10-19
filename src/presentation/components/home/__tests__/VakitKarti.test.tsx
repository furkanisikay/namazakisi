import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));

// Tema renklerini deterministik sabit bir palete sabitle (üretim renk seçimine bağımlı değiliz)
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    basarili: '#4CAF50',
    vurgu: '#00BFA5',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
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

  // @expo/vector-icons mock'u FontAwesome5'i 'FontAwesome5' adlı host bileşenine indirdiğinden
  // ağaçtaki tüm ikonların `name` prop'unu toplayabiliriz (ikon eşlemesini doğrulamak için).
  const ikonAdlariniTopla = (root: ReturnType<typeof render>['root']): string[] =>
    root
      .findAll((dugum) => (dugum.type as unknown as string) === 'FontAwesome5')
      .map((dugum) => dugum.props.name as string);

  it('eski kart: "ŞU ANKİ VAKİT" rozeti, başlık, aralık, sayaç, tam genişlik işaretleme düğmesi ve tek satır teşvik', () => {
    const { getByText, getByLabelText, getByTestId } = render(<VakitKarti {...varsayilanProps} kilitli={false} />);
    expect(getByText('ŞU ANKİ VAKİT')).toBeTruthy();
    expect(getByText('Öğle')).toBeTruthy();
    expect(getByText('13:00 - 16:30')).toBeTruthy();
    expect(getByText('01:30:00')).toBeTruthy();
    expect(getByText('KALAN SÜRE')).toBeTruthy();
    expect(getByLabelText('Öğle — Kılındı olarak işaretle')).toBeTruthy();
    expect(getByTestId('vakit-karti-tesvik')).toBeTruthy();
  });

  it('konumMetni verilince konum rozetini gösterir, verilmeyince göstermez', () => {
    const { queryByText, rerender } = render(<VakitKarti {...varsayilanProps} />);
    expect(queryByText('Nilüfer, Bursa')).toBeNull();
    rerender(<VakitKarti {...varsayilanProps} konumMetni="Nilüfer, Bursa" />);
    expect(queryByText('Nilüfer, Bursa')).toBeTruthy();
  });

  it('düğmeye basınca onTamamla bir kez çağrılır', () => {
    const onTamamla = jest.fn();
    const { getByLabelText } = render(<VakitKarti {...varsayilanProps} onTamamla={onTamamla} kilitli={false} />);
    fireEvent.press(getByLabelText('Öğle — Kılındı olarak işaretle'));
    expect(onTamamla).toHaveBeenCalledTimes(1);
  });

  it('kilitli (vakit girmedi) modda "SIRADAKİ VAKİT" + gri "Henüz girmedi" düğmesi, işaretleme yok', () => {
    const { getByLabelText, queryByLabelText, getByText, queryByTestId } = render(
      <VakitKarti {...varsayilanProps} kilitli={true} />,
    );
    expect(getByText('SIRADAKİ VAKİT')).toBeTruthy();
    expect(getByLabelText('Henüz girmedi').props.accessibilityState).toMatchObject({ disabled: true });
    expect(queryByLabelText('Öğle — Kılındı olarak işaretle')).toBeNull();
    expect(queryByTestId('vakit-karti-tesvik')).toBeNull();
  });

  it('kılındığında düğme "Kılındı" olur ve AYNI karttan geri alınır (onGeriAl)', () => {
    const onTamamla = jest.fn();
    const onGeriAl = jest.fn();
    const { getByLabelText, queryByTestId } = render(
      <VakitKarti {...varsayilanProps} tamamlandi={true} onTamamla={onTamamla} onGeriAl={onGeriAl} kilitli={false} />,
    );
    const dugme = getByLabelText('Öğle — Kılındı, geri almak için dokunun');
    expect(dugme.props.accessibilityState).toMatchObject({ checked: true, disabled: false });
    fireEvent.press(dugme);
    expect(onGeriAl).toHaveBeenCalledTimes(1);
    expect(onTamamla).not.toHaveBeenCalled();
    // Kılınmışken teşvik satırı yok.
    expect(queryByTestId('vakit-karti-tesvik')).toBeNull();
  });

  it('NÖBETÇİ: kayıt gösterilen güne ait değilse düğme DOĞMAZ (bayat veriyle animasyon/duyuru yok)', () => {
    const { queryByLabelText, getByTestId, rerender } = render(
      <VakitKarti {...varsayilanProps} kilitli={false} kayitHazir={false} />,
    );
    expect(queryByLabelText('Öğle — Kılındı olarak işaretle')).toBeNull();
    // Yer tutucu düğmeyle aynı yükseklikte: kayıt gelince kart zıplamaz.
    expect(getByTestId('vakit-karti-kayit-bekleniyor').props.style).toMatchObject({ height: 56 });
    // Kayıt gelince düğme DOĞRU değerle doğar (kılınmışsa doğrudan "Kılındı", geçişsiz).
    rerender(<VakitKarti {...varsayilanProps} kilitli={false} kayitHazir tamamlandi />);
    expect(queryByLabelText('Öğle — Kılındı')).toBeTruthy();
  });

  it('gösterilen ad (cuma) başlıkta ve düğme etiketinde kullanılır', () => {
    const { getByText, getByLabelText } = render(
      <VakitKarti {...varsayilanProps} gorunenVakitAdi="Cuma" kilitli={false} />,
    );
    expect(getByText('Cuma')).toBeTruthy();
    expect(getByLabelText('Cuma — Kılındı olarak işaretle')).toBeTruthy();
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

  describe('konum çipi — yenileme düğmesi', () => {
    it('otomatik modda yenile simgesi çıkar ve dokununca geri çağrı çalışır', () => {
      const onKonumYenile = jest.fn();
      const { getByLabelText, root } = render(
        <VakitKarti
          {...varsayilanProps}
          konumModu="oto"
          konumMetni="Görükle, Bursa"
          onKonumYenile={onKonumYenile}
        />
      );

      expect(ikonAdlariniTopla(root)).toContain('sync-alt');

      fireEvent.press(getByLabelText('Konumu yenile'));
      expect(onKonumYenile).toHaveBeenCalledTimes(1);
    });

    it('MANUEL modda yenileme YOK (konum kullanıcının seçimi, tazelenecek bir şey yok)', () => {
      const onKonumYenile = jest.fn();
      const { queryByLabelText, root } = render(
        <VakitKarti
          {...varsayilanProps}
          konumModu="manuel"
          konumMetni="Nilüfer, Bursa"
          onKonumYenile={onKonumYenile}
        />
      );

      expect(ikonAdlariniTopla(root)).not.toContain('sync-alt');
      expect(queryByLabelText('Konumu yenile')).toBeNull();
    });

    it('yenileme sürerken metin "Güncelleniyor…" olur ve ikinci dokunuş geçmez', () => {
      const onKonumYenile = jest.fn();
      const { getByText, queryByText, getByLabelText } = render(
        <VakitKarti
          {...varsayilanProps}
          konumModu="oto"
          konumMetni="Görükle, Bursa"
          onKonumYenile={onKonumYenile}
          konumYenileniyor
        />
      );

      expect(getByText('Güncelleniyor…')).toBeTruthy();
      expect(queryByText('Görükle, Bursa')).toBeNull();

      fireEvent.press(getByLabelText('Konumu yenile'));
      expect(onKonumYenile).not.toHaveBeenCalled();
    });

    it('geri çağrı verilmezse çip düz metin kalır (eski davranış)', () => {
      const { queryByLabelText, getByText } = render(
        <VakitKarti {...varsayilanProps} konumModu="oto" konumMetni="Görükle, Bursa" />
      );

      expect(getByText('Görükle, Bursa')).toBeTruthy();
      expect(queryByLabelText('Konumu yenile')).toBeNull();
    });
  });
});
