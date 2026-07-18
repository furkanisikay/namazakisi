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
import {
  matrisiGuncelle,
  muhafizAyarlariniGuncelle,
  ozelMatrisYedegiGuncelle,
  ozelYogunluguGeriYukle,
} from '../../store/muhafizSlice';
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
// Native sesli-anons köprüsü (Faz 4/5). Gerçek modül `requireNativeModule` çağırır
// → jest ortamında yoktur. `trDestekleniyorMu` cevabı testten testte değişebilsin
// diye mutable bir kutu üzerinden okunur.
const ttsDurumu: { destekli: boolean; hataVer: boolean } = { destekli: true, hataVer: false };
const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
  planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
  iptalEtAnons: jest.fn(),
  iptalEtTumAnonslar: jest.fn(),
  trDestekleniyorMu: () =>
    ttsDurumu.hataVer ? Promise.reject(new Error('native yok')) : Promise.resolve(ttsDurumu.destekli),
}));
// Önizleme bildirim sesi (uygulama içi, expo-audio). Gerçek ses çalmasın; yalnız
// hangi modda çağrıldığı ölçülebilsin.
const mockBildirimSesiniCal = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../domain/services/OnizlemeSesServisi', () => ({
  OnizlemeSesServisi: {
    bildirimSesiniCal: (...args: unknown[]) => mockBildirimSesiniCal(...args),
    temizle: jest.fn(),
  },
}));

jest.mock('../../store/muhafizSlice', () => {
  const gercek = jest.requireActual('../../store/muhafizSlice');
  return {
    HATIRLATMA_PRESETLERI: gercek.HATIRLATMA_PRESETLERI,
    matrisiGuncelle: jest.fn((arg) => ({ type: 'muhafiz/matris', payload: arg })),
    muhafizAyarlariniGuncelle: jest.fn((arg) => ({ type: 'muhafiz/ayar', payload: arg })),
    ozelMatrisYedegiGuncelle: jest.fn((arg) => ({ type: 'muhafiz/ozelYedek', payload: arg })),
    ozelYogunluguGeriYukle: jest.fn(() => ({ type: 'muhafiz/ozelGeriYukle' })),
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

  /**
   * Ekranı kurar ve `useTurkceTtsDestegi`'nin asenkron sorgusunu act içinde
   * boşaltır — aksi halde promise test bittikten sonra çözülüp "not wrapped in
   * act(...)" uyarısı üretir (davranış doğru olsa bile gürültü/kırılganlık).
   */
  const kur = async (ustyaz: Record<string, unknown> = {}) => {
    (useAppSelector as unknown as jest.Mock).mockImplementation(
      (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
    );
    const { MuhafizAyarlariSayfasi } = require('../MuhafizAyarlariSayfasi');
    const sonuc = render(<MuhafizAyarlariSayfasi />);
    await act(async () => { await Promise.resolve(); });
    return sonuc;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    ttsDurumu.destekli = true;
    ttsDurumu.hataVer = false;
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
  it('5 vakit satırını dinamik özetiyle listeler', async () => {
    const { getByText, getAllByText } = await kur();
    expect(getByText('Sabah')).toBeTruthy();
    expect(getByText('Öğle')).toBeTruthy();
    expect(getByText('İkindi')).toBeTruthy();
    expect(getByText('Akşam')).toBeTruthy();
    expect(getByText('Yatsı')).toBeTruthy();
    // Göç varsayılanı: mod=bildirim, en erken eşik 45
    expect(getAllByText('Sadece bildirim · 45 dk kala başlar')).toHaveLength(5);
  });

  it('muhafız kapalıyken vakit listesi gösterilmez', async () => {
    const { queryByText, getByText } = await kur({ aktif: false });
    expect(getByText(/Muhafız kapalı/)).toBeTruthy();
    expect(queryByText('İkindi')).toBeNull();
  });

  it('vakit kapalıysa (tüm adımlar sessiz) özet "Kapalı" olur', async () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler.forEach((s) => { s.mod = 'sessiz'; });
    const { getByText } = await kur({ matris });
    expect(getByText('Kapalı')).toBeTruthy();
  });

  // ── Katman 2 ──────────────────────────────────────────────────────────────
  it('vakte dokununca 4 adım ve "Tüm vakitlere uygula" açılır', async () => {
    const { getByText, queryByText } = await kur();
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

  it('"Tüm vakitlere uygula" önce onay ister, onaylanınca matrisi kopyalar', async () => {
    const matris = varsayilanMatris();
    matris.ikindi.seviyeler[0].esikDk = 90;
    const { getByText, getByLabelText } = await kur({ matris });

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
  it('adıma dokununca detay modalı mod/eşik/sıklık ile açılır', async () => {
    const { getByText, getByLabelText, queryByText } = await kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));

    expect(getByText('NASIL UYARSIN')).toBeTruthy();
    expect(getByText('KAÇ DK KALA')).toBeTruthy();
    expect(getByText('SIKLIK')).toBeTruthy();
    expect(getByText('BİLDİRİM SESİ')).toBeTruthy();
    // Faz 5: TTS bağlandı → "yakında" rozeti YOK, modlar sade etikette
    expect(getByLabelText('Sesli anons')).toBeTruthy();
    expect(getByLabelText('İkisi de')).toBeTruthy();
    expect(queryByText('yakında')).toBeNull();
  });

  it('eşik stepper sınırları komşu seviyeye göre kısıtlanır (spec 4.2)', async () => {
    const { getByText, getByLabelText } = await kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    // nazik=45, komşusu uyari=25 → min 26, max 120
    expect(getByText('26–120 dk arası seçebilirsiniz')).toBeTruthy();
  });

  it('eşik değişince matris yazılır ve yoğunluk "ozel" olur', async () => {
    const { getByText, getByLabelText } = await kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Kaç dk kala artır'));

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].esikDk).toBe(50);
    // Diğer vakitler etkilenmez
    expect(yeni.ikindi.seviyeler[0].esikDk).toBe(45);
    expect(muhafizAyarlariniGuncelle).toHaveBeenCalledWith({ yogunluk: 'ozel' });
    // 'ozel'e yeni geçiş: en son özel hâli yedeklenir (preset'e geçilse bile kaybolmasın diye)
    expect(ozelMatrisYedegiGuncelle).toHaveBeenCalledWith(yeni);
  });

  it('mod değişikliği yoğunluğu "ozel" YAPMAZ (zamanlama ekseni değil)', async () => {
    const { getByText, getByLabelText } = await kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Sessiz'));

    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].mod).toBe('sessiz');
    expect(muhafizAyarlariniGuncelle).not.toHaveBeenCalled();
    // Preset'te kalınıyor (zamanlama değişmedi) → özel yedek de güncellenmez
    expect(ozelMatrisYedegiGuncelle).not.toHaveBeenCalled();
  });

  it('sesli moda geçince anons metni boş bırakılmaz (şablonla ön-doldurulur)', async () => {
    const { getByText, getByLabelText } = await kur();
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
    fireEvent.press(getByLabelText('Sesli anons'));

    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].mod).toBe('sesli');
    expect(yeni.ogle.seviyeler[0].anonsMetni).toContain('{vakit}');
  });

  it('sessiz adımda eşik/sıklık alanları gizlenir', async () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler[0].mod = 'sessiz';
    const { getByText, getByLabelText, queryByText } = await kur({ matris });
    fireEvent.press(getByText('Öğle'));
    fireEvent.press(getByLabelText(/Nazik hatırlatma adımını düzenleyin/));

    expect(queryByText('KAÇ DK KALA')).toBeNull();
    expect(queryByText('SIKLIK')).toBeNull();
    expect(getByText(/Bu adım kapalı/)).toBeTruthy();
  });

  it('sesli modda anons metni düzenlenebilir ve örnek okunuş gösterilir', async () => {
    const matris = varsayilanMatris();
    matris.ogle.seviyeler[0].mod = 'ikisi';
    matris.ogle.seviyeler[0].anonsMetni = '{vakit} vakti çıkıyor, son {süre} dakika.';
    const { getByText, getByLabelText } = await kur({ matris });
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
    const { getByLabelText } = await kur();
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
    const { getByLabelText } = await kur({ matris });
    await act(async () => { fireEvent.press(getByLabelText(/^Hafif yoğunluk/)); });

    const yeni: MuhafizMatrisi = (matrisiGuncelle as unknown as jest.Mock).mock.calls[0][0];
    expect(yeni.ogle.seviyeler[0].esikDk).toBe(30);
    expect(yeni.ogle.seviyeler[0].mod).toBe('ikisi');
    expect(yeni.ogle.seviyeler[0].bildirimSesi).toBe('alarm');
  });

  it('yoğunluk "ozel" iken preset seçimi önce onay ister', async () => {
    const { getByLabelText, getByText } = await kur({ yogunluk: 'ozel' });
    fireEvent.press(getByLabelText(/^Normal yoğunluk/));

    expect(getByText('Özel ayarlarınız hazır yoğunluğa dönecek')).toBeTruthy();
    expect(getByText(/saklanacak/)).toBeTruthy();
    expect(matrisiGuncelle).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(getByLabelText('Uygula')); });
    expect(matrisiGuncelle).toHaveBeenCalledTimes(1);
    expect(muhafizAyarlariniGuncelle).toHaveBeenCalledWith({ yogunluk: 'normal' });
  });

  it('"ozel" iken preset onayından vazgeçilirse hiçbir şey yazılmaz', async () => {
    const { getByLabelText } = await kur({ yogunluk: 'ozel' });
    fireEvent.press(getByLabelText(/^Normal yoğunluk/));
    fireEvent.press(getByLabelText('Vazgeç'));

    expect(matrisiGuncelle).not.toHaveBeenCalled();
    expect(muhafizAyarlariniGuncelle).not.toHaveBeenCalled();
  });

  it('"ozel" yoğunlukta preset çubuğunda hiçbiri seçili değil, "Özel" etiketi görünür', async () => {
    const { getByText } = await kur({ yogunluk: 'ozel' });
    expect(getByText('Özel')).toBeTruthy();
  });

  // ── Özel yoğunluk yedeği (preset'ten dönünce hatırlama) ────────────────────
  describe('Özel yoğunluk yedeği', () => {
    it('yedek yokken "Özel" seçeneği gösterilmez', async () => {
      const { queryByLabelText } = await kur();
      expect(queryByLabelText(/^Özel yoğunluk/)).toBeNull();
    });

    it('yedek varsa "Özel" seçeneği preset çubuğunda tıklanabilir buton olarak görünür', async () => {
      const { getByLabelText } = await kur({ yogunluk: 'normal', ozelMatrisYedegi: varsayilanMatris() });
      expect(getByLabelText(/^Özel yoğunluk/)).toBeTruthy();
    });

    it('preset\'e geçince mevcut özel matris yedeklenir (onaylayınca)', async () => {
      const matris = varsayilanMatris();
      matris.ogle.seviyeler[0].esikDk = 77;
      const { getByLabelText } = await kur({ yogunluk: 'ozel', matris });

      fireEvent.press(getByLabelText(/^Normal yoğunluk/));
      await act(async () => { fireEvent.press(getByLabelText('Uygula')); });

      expect(ozelMatrisYedegiGuncelle).toHaveBeenCalledWith(matris);
    });

    it('"Özel" seçeneğine dokununca yedek geri yüklenir; preset UYGULANMAZ, onay istenmez', async () => {
      const yedek = varsayilanMatris();
      yedek.ogle.seviyeler[0].esikDk = 77;
      const { getByLabelText, queryByText } = await kur({ yogunluk: 'normal', ozelMatrisYedegi: yedek });

      fireEvent.press(getByLabelText(/^Özel yoğunluk/));

      expect(ozelYogunluguGeriYukle).toHaveBeenCalledTimes(1);
      expect(matrisiGuncelle).not.toHaveBeenCalled();
      expect(muhafizAyarlariniGuncelle).not.toHaveBeenCalled();
      // Veri kaybı riski yok → onay modalı çıkmamalı
      expect(queryByText('Özel ayarlarınız hazır yoğunluğa dönecek')).toBeNull();
    });

    it('zaten "ozel" iken "Özel" seçeneğine dokunmak hiçbir şey yapmaz (zaten seçili)', async () => {
      const { getByLabelText } = await kur({ yogunluk: 'ozel', ozelMatrisYedegi: varsayilanMatris() });

      fireEvent.press(getByLabelText(/^Özel yoğunluk/));

      expect(ozelYogunluguGeriYukle).not.toHaveBeenCalled();
    });
  });

  // ── Faz 5: Türkçe TTS uyarısı ─────────────────────────────────────────────
  describe('Türkçe konuşma paketi uyarısı', () => {
    const sesliMatris = () => {
      const matris = varsayilanMatris();
      matris.ogle.seviyeler[0].mod = 'ikisi';
      matris.ogle.seviyeler[0].anonsMetni = '{vakit} vakti çıkıyor, son {süre} dakika.';
      return matris;
    };

    const detayiAc = async (ustyaz: Record<string, unknown>) => {
      const ekran = await kur(ustyaz);
      fireEvent.press(ekran.getByText('Öğle'));
      fireEvent.press(ekran.getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
      return ekran;
    };

    it('Türkçe paketi YOKSA sesli adımda kibar uyarı gösterir (engellemez)', async () => {
      ttsDurumu.destekli = false;
      const { getByText, getByLabelText } = await detayiAc({ matris: sesliMatris() });

      expect(getByText(/Türkçe konuşma paketi bulunamadı/)).toBeTruthy();
      // Engelleme YOK: mod butonları hâlâ seçilebilir, ayar kutusu duruyor
      expect(getByLabelText('Sesli anons')).toBeTruthy();
      expect(getByLabelText('Sesli anons metni')).toBeTruthy();
    });

    it('Türkçe paketi VARSA uyarı gösterilmez', async () => {
      ttsDurumu.destekli = true;
      const { queryByText } = await detayiAc({ matris: sesliMatris() });
      expect(queryByText(/Türkçe konuşma paketi bulunamadı/)).toBeNull();
    });

    it('destek sorgulanamazsa (hata) uyarı gösterilmez — yanlış alarm yok', async () => {
      ttsDurumu.hataVer = true;
      const { queryByText } = await detayiAc({ matris: sesliMatris() });
      expect(queryByText(/Türkçe konuşma paketi bulunamadı/)).toBeNull();
    });

    it('sesli olmayan (yalnız bildirim) adımda uyarı çıkmaz', async () => {
      ttsDurumu.destekli = false;
      const { queryByText } = await detayiAc({});
      expect(queryByText(/Türkçe konuşma paketi bulunamadı/)).toBeNull();
    });
  });

  // ── Adım detayında "Dinle": mod başına doğru ses kombinasyonu ─────────────
  describe('Adım detayı — Dinle', () => {
    const detayiAc = async (matris?: MuhafizMatrisi) => {
      const ekran = await kur(matris ? { matris } : {});
      fireEvent.press(ekran.getByText('Öğle'));
      fireEvent.press(ekran.getByLabelText(/Nazik hatırlatma adımını düzenleyin/));
      return ekran;
    };

    const moduAyarla = (mod: string, ekle: Partial<{ anonsMetni: string; bildirimSesi: string }> = {}) => {
      const matris = varsayilanMatris();
      Object.assign(matris.ogle.seviyeler[0], { mod, ...ekle });
      return matris;
    };

    it("'bildirim' modunda Dinle butonu vardır ve YALNIZ bildirim sesini çalar", async () => {
      // Şikâyet #1: sadece bildirim seçiliyken sesi dinleyecek buton yoktu.
      const { getByLabelText } = await detayiAc();

      fireEvent.press(getByLabelText('Bildirim sesini dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledWith('can');
      expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    it('seçili ses değişince o ses çalınır', async () => {
      const { getByLabelText } = await detayiAc(moduAyarla('bildirim', { bildirimSesi: 'melodi' }));

      fireEvent.press(getByLabelText('Bildirim sesini dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledWith('melodi');
    });

    it("'sesli' modunda bildirim sesi bölümü yoktur; Dinle yalnız konuşur", async () => {
      const matris = moduAyarla('sesli', { anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.' });
      const { getByLabelText, queryByLabelText, queryByText } = await detayiAc(matris);

      expect(queryByText('BİLDİRİM SESİ')).toBeNull();
      expect(queryByLabelText('Bildirim sesini dinleyin')).toBeNull();

      fireEvent.press(getByLabelText('Örnek okunuşu dinleyin'));

      expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
      expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
    });

    it("'ikisi' modunda örnek okunuş Dinle'si HEM sesi HEM anonsu çalar", async () => {
      const matris = moduAyarla('ikisi', {
        anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
        bildirimSesi: 'alarm',
      });
      const { getByLabelText } = await detayiAc(matris);

      fireEvent.press(getByLabelText('Bildirim sesini ve örnek okunuşu dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledWith('alarm');
      expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
      const [, zaman] = mockPlanlaAnons.mock.calls[0];
      // Anons bildirim sesinin ARDINDAN gelir (üstüne binmez)
      expect(zaman - Date.now()).toBeGreaterThan(1000);
    });

    it("'ikisi' modunda ses bölümündeki Dinle yalnız SESİ çalar (seçimi dinletir)", async () => {
      const matris = moduAyarla('ikisi', {
        anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
      });
      const { getByLabelText } = await detayiAc(matris);

      fireEvent.press(getByLabelText('Bildirim sesini dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledTimes(1);
      expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    it("'sessiz' adımda hiçbir Dinle butonu gösterilmez", async () => {
      const { queryByLabelText } = await detayiAc(moduAyarla('sessiz'));

      expect(queryByLabelText('Bildirim sesini dinleyin')).toBeNull();
      expect(queryByLabelText('Örnek okunuşu dinleyin')).toBeNull();
      expect(queryByLabelText('Bildirim sesini ve örnek okunuşu dinleyin')).toBeNull();
    });

    it('üst üste basmak sesi çoğaltmaz — her basış tek çağrı, tekilleştirme serviste', async () => {
      const { getByLabelText } = await detayiAc();
      const buton = getByLabelText('Bildirim sesini dinleyin');

      fireEvent.press(buton);
      fireEvent.press(buton);
      fireEvent.press(buton);

      // Her basış TEK çalma isteği üretir; üst üste binmeyi OnizlemeSesServisi
      // (tek çalar + başa sarma) engeller — bkz. OnizlemeSesServisi.test.ts
      expect(mockBildirimSesiniCal).toHaveBeenCalledTimes(3);
      expect(mockBildirimSesiniCal).toHaveBeenLastCalledWith('can');
    });
  });

  // ── Faz 5: Akışı önizle (spec 3.4) ────────────────────────────────────────
  describe('Akışı önizle', () => {
    it('vakit açılınca "Akışı önizle" butonu görünür ve akış modalını açar', async () => {
      const { getByText, getByLabelText, queryByText } = await kur();
      expect(queryByText('Akışı önizle')).toBeNull();

      fireEvent.press(getByText('İkindi'));
      expect(getByText('Akışı önizle')).toBeTruthy();

      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));
      expect(getByText('İkindi akışı')).toBeTruthy();
    });

    it('adımları gerçek plan sırasıyla (azalan dakika) ve bildirim başlığıyla listeler', async () => {
      const { getByText, getByLabelText } = await kur();
      fireEvent.press(getByText('İkindi'));
      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));

      // normal preset: nazik 45/20, uyari 25/10, sert 10/5, acil 3/2
      // → 45, 25, 15, 10, 5, 3, 1 (kazanan seviye en küçük eşikli olan)
      expect(getByText('Vakit çıkmadan önce 7 hatırlatma alırsınız')).toBeTruthy();
      // basligiOlustur çıktısı — ilk adım nazik (seviye 1)
      expect(getByText('⏰ 45 dk · İkindi vakti')).toBeTruthy();
      // son adım acil (seviye 4) — büyük harf haritası kullanılır
      expect(getByText('🚨 1 dk · İKİNDİ VAKTİ ÇIKIYOR')).toBeTruthy();
    });

    it('sesli adımda çözülmüş anons metnini gösterir ve "Dinle" onu okutur', async () => {
      const matris = varsayilanMatris();
      matris.ikindi.seviyeler.forEach((s, i) => { s.mod = i === 0 ? 'sesli' : 'sessiz'; });
      matris.ikindi.seviyeler[0].anonsMetni = '{vakit} vakti çıkıyor, son {süre} dakika.';
      const { getByText, getByLabelText } = await kur({ matris });

      fireEvent.press(getByText('İkindi'));
      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));

      // {vakit}/{süre} gerçek değerle çözülür
      expect(getByText('İkindi vakti çıkıyor, son 45 dakika.')).toBeTruthy();

      fireEvent.press(getByLabelText('45 dakika kala çalacak uyarıyı dinleyin'));
      expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
      const [id, , metin] = mockPlanlaAnons.mock.calls[0];
      expect(metin).toBe('İkindi vakti çıkıyor, son 45 dakika.');
      // Önizleme SABİT id kullanır → gerçek muhafız bildirim id'leriyle çakışmaz
      expect(id).toBe('muhafiz_anons_onizleme');
      // Mod yalnız 'sesli' → bildirim sesi ÇALINMAZ
      expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
    });

    it('SADECE BİLDİRİM olan adımda da "Dinle" vardır ve bildirim sesini çalar', async () => {
      // Şikâyet #2: bildirimli adımlarda hiç ses duyulmuyordu (buton yalnız sesli
      // adımlarda çiziliyordu) → artık her duyulur adımda buton var.
      const { getByText, getByLabelText } = await kur();

      fireEvent.press(getByText('İkindi'));
      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));
      fireEvent.press(getByLabelText('45 dakika kala çalacak uyarıyı dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledWith('can');
      // Bildirim modunda TTS yok → sessizlik + konuşma yerine yalnız ses
      expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    it("'ikisi' adımında hem bildirim sesi hem anons çalar", async () => {
      const matris = varsayilanMatris();
      matris.ikindi.seviyeler.forEach((s, i) => { s.mod = i === 0 ? 'ikisi' : 'sessiz'; });
      matris.ikindi.seviyeler[0].anonsMetni = '{vakit} vakti çıkıyor, son {süre} dakika.';
      matris.ikindi.seviyeler[0].bildirimSesi = 'alarm';
      const { getByText, getByLabelText } = await kur({ matris });

      fireEvent.press(getByText('İkindi'));
      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));
      fireEvent.press(getByLabelText('45 dakika kala çalacak uyarıyı dinleyin'));

      expect(mockBildirimSesiniCal).toHaveBeenCalledWith('alarm');
      expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    });

    it('tüm adımlar sessizse boş durum gösterilir', async () => {
      const matris = varsayilanMatris();
      matris.aksam.seviyeler.forEach((s) => { s.mod = 'sessiz'; });
      const { getByText, getByLabelText } = await kur({ matris });

      fireEvent.press(getByText('Akşam'));
      fireEvent.press(getByLabelText('Akşam akışını önizleyin'));

      expect(getByText('Bu vakitte hatırlatma yok')).toBeTruthy();
      expect(getByText(/tüm adımlar kapalı/)).toBeTruthy();
    });

    it('önizleme GERÇEK bildirim planlamaz — yalnız açmak hiçbir native çağrı yapmaz', async () => {
      const { getByText, getByLabelText } = await kur();
      fireEvent.press(getByText('İkindi'));
      fireEvent.press(getByLabelText('İkindi akışını önizleyin'));

      expect(mockPlanlaAnons).not.toHaveBeenCalled();
      expect(mockBildirimSesiniCal).not.toHaveBeenCalled();
    });
  });

  // ── Dayanıklılık ──────────────────────────────────────────────────────────
  it('matris yoksa (eski kayıt) eski alanlardan türetip render eder', async () => {
    const { getByText } = await kur({ matris: undefined });
    expect(getByText('Sabah')).toBeTruthy();
    expect(getByText('İkindi')).toBeTruthy();
  });
});
