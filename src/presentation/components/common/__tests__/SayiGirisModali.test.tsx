import React from 'react';
import { Modal } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#fff',
    metin: '#000',
    metinIkincil: '#888',
    sinir: '#ccc',
    arkaplan: '#eee',
    birincil: '#4caf50',
  }),
}));

import { SayiGirisModali } from '../SayiGirisModali';

const temelProps = {
  gorunur: true,
  baslik: 'Test Başlık',
  aciklama: 'Açıklama',
  placeholder: 'Örn',
  onayMetni: 'Kaydet',
  deger: '5',
  onDegisim: jest.fn(),
  onIptal: jest.fn(),
  onOnay: jest.fn(),
};

describe('SayiGirisModali', () => {
  it('onay butonu onOnay çağırır', () => {
    const onOnay = jest.fn();
    const { getByLabelText } = render(<SayiGirisModali {...temelProps} onOnay={onOnay} />);
    fireEvent.press(getByLabelText('Kaydet'));
    expect(onOnay).toHaveBeenCalled();
  });

  it('iptal butonu onIptal çağırır', () => {
    const onIptal = jest.fn();
    const { getByLabelText } = render(<SayiGirisModali {...temelProps} onIptal={onIptal} />);
    fireEvent.press(getByLabelText('İptal'));
    expect(onIptal).toHaveBeenCalled();
  });

  // Gap 0: onDegisim (onChangeText) wiring — bileşenin temel sözleşmesi.
  // Üretimde TextInput onChangeText={onDegisim}; bu bağ koparsa girilen değer
  // hiç dışarı verilmez ve kullanıcı sayı giremez.
  it('TextInput değişiminde onDegisim girilen ham metinle çağrılır', () => {
    const onDegisim = jest.fn();
    const { getByPlaceholderText } = render(
      <SayiGirisModali {...temelProps} onDegisim={onDegisim} />
    );
    fireEvent.changeText(getByPlaceholderText('Örn'), '12');
    expect(onDegisim).toHaveBeenCalledTimes(1);
    expect(onDegisim).toHaveBeenCalledWith('12');
  });

  // Gap 1: Controlled value bağlanması — value={deger} invariant'ı.
  // deger prop'u TextInput.value'ya yansımazsa bileşen kontrollü olmaktan çıkar
  // (yazılan değer ekranda görünmez / dışarıdan güncellenemez).
  it('deger prop’u TextInput.value olarak render edilir (kontrollü değer)', () => {
    const { getByDisplayValue, rerender, queryByDisplayValue } = render(
      <SayiGirisModali {...temelProps} deger="5" />
    );
    expect(getByDisplayValue('5')).toBeTruthy();

    // Prop değişince görünen değer de değişmeli (tek yönlü veri akışı).
    rerender(<SayiGirisModali {...temelProps} deger="42" />);
    expect(getByDisplayValue('42')).toBeTruthy();
    expect(queryByDisplayValue('5')).toBeNull();
  });

  // Gap 2: gorunur -> Modal visible bağlanması.
  // NOT: RN Modal testte içeriği visible=false iken de render eder (jest-expo
  // davranışı; repodaki ToparlanmaModal.test.tsx ile aynı kalıp). Bu yüzden
  // güvenilir invariant: alttaki Modal'ın visible prop'u gorunur ile birebir eşleşmeli.
  it('gorunur=true iken Modal visible=true geçirir', () => {
    const { UNSAFE_getByType } = render(<SayiGirisModali {...temelProps} gorunur />);
    expect(UNSAFE_getByType(Modal).props.visible).toBe(true);
  });

  it('gorunur=false iken Modal visible=false geçirir (modal gizli)', () => {
    const { UNSAFE_getByType } = render(<SayiGirisModali {...temelProps} gorunur={false} />);
    expect(UNSAFE_getByType(Modal).props.visible).toBe(false);
  });

  // Gap 3: Sayı doğrulaması UPSTREAM'dedir — bu bileşen ham metni filtrelemeden iletir.
  // Bu testi kıran tek değişiklik: birinin bileşene gizlice harf/ondalık temizleme
  // eklemesi. O zaman onDegisim '1a.b' yerine '1' alır ve test FAIL eder; böylece
  // "validasyon nerede yapılıyor" domain kararı sabitlenir. Ayrıca number-pad klavye
  // kontratı da doğrulanır.
  it('geçersiz/harf içeren girişi temizlemeden ham iletir ve number-pad klavye kullanır', () => {
    const onDegisim = jest.fn();
    const { getByPlaceholderText } = render(
      <SayiGirisModali {...temelProps} onDegisim={onDegisim} />
    );
    const input = getByPlaceholderText('Örn');

    // Klavye türü number-pad olmalı (girişi UI seviyesinde sayıya yönlendirir).
    expect(input.props.keyboardType).toBe('number-pad');

    // Bileşen metni filtrelemez: harf/ondalık dahil aynen yukarı iletilir.
    fireEvent.changeText(input, '1a.b');
    expect(onDegisim).toHaveBeenCalledWith('1a.b');
  });
});
