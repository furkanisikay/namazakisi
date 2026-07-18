/**
 * MuhafizAyarlariSayfasi (Faz 2 — vakit-merkezli ekran) render + etkileşim testleri.
 *
 * Gerçek timer'lardan kaçınmak için jest.useFakeTimers kullanılır (AGENTS.md test
 * konvansiyonu: ağır sayfa testlerinde gerçek timer'a girme).
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { matrisiGuncelle, muhafizAyarlariniGuncelle } from '../../store/muhafizSlice';
import { eskidenMatriseGoc } from '../../../core/muhafiz/muhafizGoc';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';

jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../hooks/useKonumMetni', () => ({ useKonumMetni: () => 'İstanbul' }));
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../store/muhafizSlice', () => {
  const gercek = jest.requireActual('../../store/muhafizSlice');
  return {
    HATIRLATMA_PRESETLERI: gercek.HATIRLATMA_PRESETLERI,
    matrisiGuncelle: jest.fn((arg) => ({ type: 'muhafiz/matris', payload: arg })),
    muhafizAyarlariniGuncelle: jest.fn((arg) => ({ type: 'muhafiz/ayar', payload: arg })),
  };
});

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  hata: '#F44336',
  bilgi: '#2196F3',
  basarili: '#4CAF50',
  uyari: '#FFC107',
};

const NORMAL_ESIKLER = { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 };
const NORMAL_SIKLIKLAR = { seviye1: 20, seviye2: 10, seviye3: 5, seviye4: 2 };

const varsayilanMatris = (): MuhafizMatrisi =>
  eskidenMatriseGoc({ esikler: NORMAL_ESIKLER, sikliklar: NORMAL_SIKLIKLAR });

describe('MuhafizAyarlariSayfasi', () => {
  const dispatchMock = jest.fn();

  const stateOlustur = (ustyaz: Record<string, unknown> = {}) => ({
    muhafiz: {
      aktif: true,
      yogunluk: 'normal',
      gelismisMod: false,
      esikler: NORMAL_ESIKLER,
      sikliklar: NORMAL_SIKLIKLAR,
      matris: varsayilanMatris(),
      ...ustyaz,
    },
    konum: { konumModu: 'manuel', sonGpsGuncellemesi: null, akilliTakipAktif: false },
  });

  const kur = (ustyaz: Record<string, unknown> = {}) => {
    (useAppSelector as unknown as jest.Mock).mockImplementation(
      (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
    );
    const { MuhafizAyarlariSayfasi } = require('../MuhafizAyarlariSayfasi');
    return render(<MuhafizAyarlariSayfasi />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useFeedback as jest.Mock).mockReturnValue({
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Katman 1 ──────────────────────────────────────────────────────────────
  it('5 vakit satırını dinamik özetiyle listeler', () => {
    const { getByText, getAllByText } = kur();
    expect(getByText('Sabah')).toBeTruthy();
    expect(getByText('Öğle')).toBeTruthy();
    expect(getByText('İkindi')).toBeTruthy();
    expect(getByText('Akşam')).toBeTruthy();
    expect(getByText('Yatsı')).toBeTruthy();
    // Göç varsayılanı: mod=bildirim, en erken eşik 45
    expect(getAllByText('Sadece bildirim · 45 dk kala başlar')).toHaveLength(5);
  });

  it('muhafız kapalıyken vakit listesi gösterilmez', () => {
    const { queryByText, getByText } = kur({ aktif: false });
    expect(getByText(/Muhafız kapalı/)).toBeTruthy();
    expect(queryByText('İkindi')).toBeNull();
  });

  it('vakit kapalıysa (tüm adımlar sessiz) özet "Kapalı" olur', () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler.forEach((s) => { s.mod = 'sessiz'; });
    const { getByText } = kur({ matris });
    expect(getByText('Kapalı')).toBeTruthy();
  });

  // ── Katman 2 ──────────────────────────────────────────────────────────────
  it('vakte dokununca 4 adım ve "Tüm vakitlere uygula" açılır', () => {
    const { getByText, queryByText } = kur();
    expect(queryByText('Nazik hatırlatma')).toBeNull();

    fireEvent.press(getByText('İkindi'));

    expect(getByText('Nazik hatırlatma')).toBeTruthy();
    expect(getByText('Uyarı')).toBeTruthy();
    expect(getByText('Sert uyarı')).toBeTruthy();
    expect(getByText('Acil')).toBeTruthy();
    expect(getByText('Tüm vakitlere uygula')).toBeTruthy();
    // Adım özeti seviyeOzetiOlustur'dan gelir
    expect(getByText('45 dk kala · bildirim · Çan')).toBeTruthy();
  });

  it('"Tüm vakitlere uygula" önce onay ister, onaylanınca matrisi kopyalar', () => {
    const matris = varsayilanMatris();
    matris.ikindi.seviyeler[0].esikDk = 90;
    const { getByText, getByLabelText } = kur({ matris });

    fireEvent.press(getByText('İkindi'));
    fireEvent.press(getByText('Tüm vakitlere uygula'));

    // Onay modalı — {vakit} ipucu (spec 3.3)
    expect(getByText(/\{vakit\} yer tutucusunu/)).toBeTruthy();
    expect(matrisiGuncelle).not.toHaveBeenCalled();

    fireEvent.press(getByLabelText('Tümüne uygula'));

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    for (const v of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
      expect(yeni[v].seviyeler[0].esikDk).toBe(90);
    }
  });

  // ── Katman 3 ──────────────────────────────────────────────────────────────
  it('adıma dokununca detay modalı mod/eşik/sıklık ile açılır', () => {
    const { getByText, getByLabelText } = kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));

    expect(getByText('NASIL UYARSIN')).toBeTruthy();
    expect(getByText('KAÇ DK KALA')).toBeTruthy();
    expect(getByText('SIKLIK')).toBeTruthy();
    expect(getByText('BİLDİRİM SESİ')).toBeTruthy();
    // TTS Faz 4 → sesli modlar "yakında" rozetli
    expect(getByLabelText('Sesli anons (yakında)')).toBeTruthy();
    expect(getByLabelText('İkisi de (yakında)')).toBeTruthy();
  });

  it('eşik stepper sınırları komşu seviyeye göre kısıtlanır (spec 4.2)', () => {
    const { getByText, getByLabelText } = kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    // nazik=45, komşusu uyari=25 → min 26, max 120
    expect(getByText('26–120 dk arası seçebilirsiniz')).toBeTruthy();
  });

  it('eşik değişince matris yazılır ve yoğunluk "ozel" olur', () => {
    const { getByText, getByLabelText } = kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Kaç dk kala artır'));

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].esikDk).toBe(50);
    // Diğer vakitler etkilenmez
    expect(yeni.ikindi.seviyeler[0].esikDk).toBe(45);
    expect(muhafizAyarlariniGuncelle).toHaveBeenCalledWith({ yogunluk: 'ozel' });
  });

  it('mod değişikliği yoğunluğu "ozel" YAPMAZ (zamanlama ekseni değil)', () => {
    const { getByText, getByLabelText } = kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Sessiz'));

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].mod).toBe('sessiz');
    expect(muhafizAyarlariniGuncelle).not.toHaveBeenCalled();
  });

  it('sesli moda geçince anons metni boş bırakılmaz (şablonla ön-doldurulur)', () => {
    const { getByText, getByLabelText } = kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Sesli anons (yakında)'));

    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].mod).toBe('sesli');
    expect(yeni.ogle.seviyeler[0].anonsMetni).toContain('{vakit}');
  });

  it('sessiz adımda eşik/sıklık alanları gizlenir', () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler[0].mod = 'sessiz';
    const { getByText, getByLabelText, queryByText } = kur({ matris });
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));

    expect(queryByText('KAÇ DK KALA')).toBeNull();
    expect(queryByText('SIKLIK')).toBeNull();
    expect(getByText(/Bu adım kapalı/)).toBeTruthy();
  });

  it('sesli modda anons metni düzenlenebilir ve örnek okunuş gösterilir', () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler[0].mod = 'ikisi';
    matris.ogle.seviyeler[0].anonsMetni = '{vakit} vakti çıkıyor, son {süre} dakika.';
    const { getByText, getByLabelText } = kur({ matris });
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));

    expect(getByText('SESLİ ANONS METNİ')).toBeTruthy();
    // {vakit}/{süre} çözülmüş önizleme (eşik 45)
    expect(getByText('Öğle vakti çıkıyor, son 45 dakika.')).toBeTruthy();

    const kutu = getByLabelText('Sesli anons metni');
    fireEvent.changeText(kutu, 'Kalk, {vakit} namazına {süre} dakika.');
    // Yazarken diske yazılmaz — yalnız düzenleme bitince
    expect(matrisiGuncelle).not.toHaveBeenCalled();

    fireEvent(kutu, 'endEditing');
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].anonsMetni).toBe('Kalk, {vakit} namazına {süre} dakika.');
  });

  // ── Yoğunluk preset'i ─────────────────────────────────────────────────────
  it('yoğunluk preset\'i seçilince presetUygula sonucu yazılır ve yoğunluk güncellenir', async () => {
    const { getByLabelText } = kur();
    // presetiUygula haptik geri bildirimi await eder → mikro görevleri boşalt
    await act(async () => { fireEvent.press(getByLabelText(/^Yoğun yoğunluk/)); });

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].esikDk).toBe(60); // yogun preset
    expect(muhafizAyarlariniGuncelle).toHaveBeenCalledWith({ yogunluk: 'yogun' });
  });

  it('preset yalnız zamanlamayı ezer, mod/ses korunur (spec 4.1)', async () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler[0].mod = 'ikisi';
    matris.ogle.seviyeler[0].bildirimSesi = 'alarm';
    const { getByLabelText } = kur({ matris });
    await act(async () => { fireEvent.press(getByLabelText(/^Hafif yoğunluk/)); });

    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].esikDk).toBe(30);
    expect(yeni.ogle.seviyeler[0].mod).toBe('ikisi');
    expect(yeni.ogle.seviyeler[0].bildirimSesi).toBe('alarm');
  });

  it('yoğunluk "ozel" iken preset seçimi önce onay ister', async () => {
    const { getByLabelText, getByText } = kur({ yogunluk: 'ozel' });
    fireEvent.press(getByLabelText(/^Normal yoğunluk/));

    expect(getByText('Özel zamanlamanız sıfırlanacak')).toBeTruthy();
    expect(matrisiGuncelle).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(getByLabelText('Uygula')); });
    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    expect(muhafizAyarlariniGuncelle).toHaveBeenCalledWith({ yogunluk: 'normal' });
  });

  it('"ozel" iken preset onayından vazgeçilirse hiçbir şey yazılmaz', () => {
    const { getByLabelText } = kur({ yogunluk: 'ozel' });
    fireEvent.press(getByLabelText(/^Normal yoğunluk/));
    fireEvent.press(getByLabelText('Vazgeç'));

    expect(matrisiGuncelle).not.toHaveBeenCalled();
    expect(muhafizAyarlariniGuncelle).not.toHaveBeenCalled();
  });

  it('"ozel" yoğunlukta preset çubuğunda hiçbiri seçili değil, "Özel" etiketi görünür', () => {
    const { getByText } = kur({ yogunluk: 'ozel' });
    expect(getByText('Özel')).toBeTruthy();
  });

  // ── Dayanıklılık ──────────────────────────────────────────────────────────
  it('matris yoksa (eski kayıt) eski alanlardan türetip render eder', () => {
    const { getByText } = kur({ matris: undefined });
    expect(getByText('Sabah')).toBeTruthy();
    expect(getByText('İkindi')).toBeTruthy();
  });
});
