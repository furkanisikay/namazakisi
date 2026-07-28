/**
 * AnaSayfa — iki yaşanmış bug için NÖBETÇİ testler.
 *
 * 1) Tarih seçici geri çağrısı STABİL olmalı.
 *    Ana ekran geri sayım sayacı yüzünden saniyede bir re-render olur.
 *    `@react-native-community/datetimepicker` Android dialog'unu
 *    `[onChange, value.getTime(), mode]` bağımlılıklı bir effect içinde açar →
 *    `onChange` her render'da yeni referans olursa dialog yeniden açılır ve
 *    kullanıcının seçtiği gün `value`ya (bugüne) geri döner.
 *
 * 2) Pager açılışta AKTİF GÜNDE doğmalı.
 *    Gece yarısından sonra (yatsı sürerken, şu an < imsak) aktif gün DÜNdür →
 *    `initialPage` "bugün indeksi − 1" olmalı. Sabit bugün indeksiyle doğup
 *    sonradan imperatif komutla düzeltmek native tarafta yutulabiliyordu.
 *
 * Not: sabit takvim tarihi YAZILMAZ (AGENTS.md) — sistem saati sahte
 * zamanlayıcıyla BUGÜNÜN belirli bir saatine sabitlenir, indeksler
 * `bugunuAl()`e göreceli doğrulanır.
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler, useTema } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';

// AnaSayfa sabitleri: GECMIS_GUN_SAYISI = 90 → bugünün sayfa indeksi 90.
const BUGUN_INDEKSI = 90;

// ── Sahte imsak (fajr) saati — testten teste değişebilsin diye mutable kutu ──
const mockAdhanAyari = { fajrSaat: 5, fajrDakika: 30 };

// ── PagerView: aldığı prop'ları ve imperatif çağrıları dışa verir ────────────
interface PagerProplari {
  initialPage: number;
  children?: React.ReactNode;
}
const mockPagerProplari: PagerProplari[] = [];
const mockPagerSetPage = jest.fn();
const mockPagerSetPageWithoutAnimation = jest.fn();

// ── DateTimePicker: aldığı prop'ları dışa verir (referans stabilitesi ölçümü) ─
interface TarihSeciciProplari {
  value: Date;
  minimumDate: Date;
  maximumDate: Date;
  onChange: (...args: unknown[]) => void;
}
const mockTarihSeciciProplari: TarihSeciciProplari[] = [];

jest.mock('react-native-pager-view', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  const Pager = ReactMock.forwardRef((props: PagerProplari, ref: unknown) => {
    mockPagerProplari.push(props);
    ReactMock.useImperativeHandle(ref, () => ({
      setPage: mockPagerSetPage,
      setPageWithoutAnimation: mockPagerSetPageWithoutAnimation,
    }));
    return <View>{props.children}</View>;
  });
  return { __esModule: true, default: Pager };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: TarihSeciciProplari) => {
      mockTarihSeciciProplari.push(props);
      return <View testID="tarih-secici" />;
    },
  };
});

jest.mock('adhan', () => {
  const vakitOlustur = (tarih: Date, saat: number, dakika: number) =>
    new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate(), saat, dakika, 0, 0);
  return {
    Coordinates: jest.fn(),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_koordinat: unknown, tarih: Date) => ({
      fajr: vakitOlustur(tarih, mockAdhanAyari.fajrSaat, mockAdhanAyari.fajrDakika),
      sunrise: vakitOlustur(tarih, 7, 0),
      dhuhr: vakitOlustur(tarih, 13, 0),
      asr: vakitOlustur(tarih, 16, 0),
      maghrib: vakitOlustur(tarih, 19, 0),
      isha: vakitOlustur(tarih, 20, 30),
    })),
  };
});

// ── Navigasyon / store / tema / feedback ─────────────────────────────────────
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn(), useTema: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../../core/feedback/HaptikServisi', () => ({
  HaptikServisi: { uyariTitresimi: jest.fn(), gucluTitresim: jest.fn() },
}));

jest.mock('../../store/namazSlice', () => ({
  namazlariYukle: jest.fn((arg) => ({ type: 'namaz/yukle', payload: arg })),
  namazDurumunuDegistir: jest.fn((arg) => ({ type: 'namaz/degistir', payload: arg })),
  tumNamazlariTamamla: jest.fn((arg) => ({ type: 'namaz/tumunuTamamla', payload: arg })),
  tumNamazlariSifirla: jest.fn((arg) => ({ type: 'namaz/tumunuSifirla', payload: arg })),
  tarihiDegistir: jest.fn((arg) => ({ type: 'namaz/tarih', payload: arg })),
}));
jest.mock('../../store/seriSlice', () => ({
  seriVerileriniYukle: jest.fn(() => ({ type: 'seri/yukle' })),
  seriKontrolet: jest.fn((arg) => ({ type: 'seri/kontrol', payload: arg })),
  puanlamayiYenidenHesapla: jest.fn((arg) => ({ type: 'seri/reconcile', payload: arg })),
  kutlamayiKaldir: jest.fn(() => ({ type: 'seri/kutlamaKaldir' })),
  seriOzetiSelector: jest.fn(() => ({ mevcutSeri: 0, enUzunSeri: 0, toparlanmaModu: false })),
  ilkKutlamaSelector: jest.fn(() => null),
}));
jest.mock('../../store/store', () => ({ store: { getState: jest.fn(() => ({})) } }));

// ── Alt bileşenler: hafif taklitler ──────────────────────────────────────────
jest.mock('../../components', () => {
  const { View, Text } = require('react-native');
  return {
    YuklemeGostergesi: () => <Text>yukleniyor</Text>,
    KutlamaAnimasyonu: () => <View />,
    KutlamaModal: () => <View />,
    AnimasyonluButon: () => <View />,
    ToparlanmaModal: () => <View />,
  };
});
jest.mock('../../components/home/HomeHeader', () => {
  const { Text } = require('react-native');
  return {
    HomeHeader: (props: { onTarihTikla: () => void }) => (
      <Text onPress={props.onTarihTikla}>tarih-ac</Text>
    ),
  };
});
jest.mock('../../components/home/VakitKarti', () => {
  const { View } = require('react-native');
  return { VakitKarti: () => <View /> };
});
jest.mock('../../components/home/VakitAkisi', () => {
  const { View } = require('react-native');
  return { VakitAkisi: () => <View /> };
});
jest.mock('../../components/home/SeriKartiModal', () => {
  const { View } = require('react-native');
  return { SeriKartiModal: () => <View /> };
});
jest.mock('../../components/home/KerahatOnayModal', () => {
  const { View } = require('react-native');
  return { KerahatOnayModal: () => <View /> };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: (props: { children?: React.ReactNode }) => <View>{props.children}</View> };
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});

// ── Domain servisleri (native köprü / yan etki yok) ──────────────────────────
const mockVakitBilgisi = {
  vakit: 'ogle' as const,
  saat: new Date(),
  kalanSureMs: 3600000,
  sonrakiVakitAdi: 'İkindi',
  sonrakiVakitGiris: '',
};
jest.mock('../../../domain/services/NamazVaktiHesaplayiciServisi', () => ({
  NamazVaktiHesaplayiciServisi: {
    getInstance: () => ({
      yapilandir: jest.fn(),
      getSuankiVakitBilgisi: () => mockVakitBilgisi,
    }),
  },
}));
jest.mock('../../../domain/services/NamazMuhafiziServisi', () => ({
  NamazMuhafiziServisi: {
    getInstance: () => ({
      yapilandir: jest.fn(),
      acilistaKilinanlariYukle: jest.fn().mockResolvedValue(undefined),
      baslat: jest.fn(),
      durdur: jest.fn(),
      namazKilindiIsaretle: jest.fn(),
      namazKilindiTemizle: jest.fn(),
    }),
  },
}));
jest.mock('../../../domain/services/KazaHesaplayiciServisi', () => ({
  mekruhVakitKontrolEt: jest.fn(() => ({ mekruhMu: false, aciklama: null })),
}));
jest.mock('../../../domain/services/ArkaplanMuhafizServisi', () => ({
  ArkaplanMuhafizServisi: {
    getInstance: () => ({ vakitKilindisiniGeriAl: jest.fn().mockResolvedValue(undefined) }),
  },
}));
jest.mock('../../../domain/services/VakitSayacBildirimServisi', () => ({
  VakitSayacBildirimServisi: {
    getInstance: () => ({ yapilandirVePlanla: jest.fn().mockResolvedValue(undefined) }),
  },
}));
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: {
    getInstance: () => ({ vakitKilindiTemizle: jest.fn().mockResolvedValue(undefined) }),
  },
}));
jest.mock('../../../domain/services/ArkaplanGorevServisi', () => ({
  ArkaplanGorevServisi: {
    getInstance: () => ({ kaydetVeBaslat: jest.fn().mockResolvedValue(false) }),
  },
}));
jest.mock('../../../domain/services/OnizlemeSesServisi', () => ({
  OnizlemeSesServisi: { bildirimSesiniCal: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
};

/** Bugünün belirli bir saatini üretir (sabit takvim tarihi YAZILMAZ). */
const bugunSaatinde = (saat: number, dakika = 0): Date => {
  const d = new Date();
  d.setHours(saat, dakika, 0, 0);
  return d;
};

describe('AnaSayfa', () => {
  const dispatchMock = jest.fn();
  const feedbackMock = { tumNamazlarTamamlandiFeedback: jest.fn().mockResolvedValue(undefined) };

  /**
   * Redux useSelector ÜRETİMDE stabil referans döndürür. Mock'ta da TEK ve SABİT
   * bir state nesnesi kullanılmalı: her render'da yeni nesne dönerse
   * `konum.koordinatlar` referansı değişir ve effect'ler sonsuz döngüye girer.
   */
  const stateOlustur = (mevcutTarih: string) =>
    Object.freeze({
      namaz: {
        mevcutTarih,
        yukleniyor: false,
        hata: null,
        gunlukNamazlar: {
          tarih: mevcutTarih,
          namazlar: [
            { namazAdi: 'Sabah', tamamlandi: false },
            { namazAdi: 'Öğle', tamamlandi: false },
            { namazAdi: 'İkindi', tamamlandi: false },
            { namazAdi: 'Akşam', tamamlandi: false },
            { namazAdi: 'Yatsı', tamamlandi: false },
          ],
        },
      },
      // sonYukleme null → seri/puanlama senkron effect'i çalışmaz (bu testlerin konusu değil)
      seri: { ozelGunAyarlari: null, sonYukleme: null, seriDurumu: null, migreEdildi: false },
      muhafiz: { aktif: false, yogunluk: 'normal' },
      konum: {
        konumModu: 'manuel',
        koordinatlar: { lat: 41.0082, lng: 28.9784 },
        seciliIlAdi: 'İstanbul',
        seciliIlceAdi: 'Fatih',
      },
      vakitSayac: { ayarlar: { aktif: false } },
      cumaHatirlatma: { ayarlar: { aktif: false, oncedenDk: 60 } },
    });

  /**
   * Ekranı kurar. Mount'ta çözülen promise'ler (arka plan görevi, muhafız
   * hidrasyonu) test gövdesi bittikten sonra çözülüp "not wrapped in act(...)"
   * uyarısı üretmesin diye mikro görevler act içinde boşaltılır.
   */
  const kur = async (mevcutTarih: string) => {
    const state = stateOlustur(mevcutTarih);
    (useAppSelector as unknown as jest.Mock).mockImplementation(
      (selector: (s: typeof state) => unknown) => selector(state)
    );
    const { AnaSayfa } = require('../AnaSayfa');
    const sonuc = render(<AnaSayfa />);
    await act(async () => { await Promise.resolve(); });
    return sonuc;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPagerProplari.length = 0;
    mockTarihSeciciProplari.length = 0;
    mockAdhanAyari.fajrSaat = 5;
    mockAdhanAyari.fajrDakika = 30;
    jest.useFakeTimers();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useTema as jest.Mock).mockReturnValue({ koyuMu: false });
    (useFeedback as jest.Mock).mockReturnValue(feedbackMock);
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── NÖBETÇİ 1 — tarih seçici geri çağrısı stabil ──────────────────────────
  describe('Tarih seçici prop stabilitesi (dialog yeniden açılma bug\'ı)', () => {
    const tarihSeciciyiAc = async () => {
      // Gündüz: imsak geçmiş → aktif gün bugün
      jest.setSystemTime(bugunSaatinde(12, 0));
      // Sayaç hedefi ileride olsun ki her tick'te kalan süre stringi DEĞİŞSİN
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(16, 0).toISOString();
      const ekran = await kur(bugunuAl());
      fireEvent.press(ekran.getByText('tarih-ac'));
      return ekran;
    };

    it('sayaç tick\'i ile yeniden render olsa da onChange AYNI REFERANS kalır', async () => {
      await tarihSeciciyiAc();

      expect(mockTarihSeciciProplari.length).toBeGreaterThan(0);
      const ilk = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      const renderSayisi = mockTarihSeciciProplari.length;

      // Geri sayım sayacı: 3 saniye ilerlet → en az bir kez yeniden render olmalı
      await act(async () => { jest.advanceTimersByTime(3000); });

      // Test vakum olmasın: gerçekten yeniden render olduğunu KANITLA
      expect(mockTarihSeciciProplari.length).toBeGreaterThan(renderSayisi);

      const son = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      expect(son.onChange).toBe(ilk.onChange);
    });

    it('sayaç tick\'i ile value/minimumDate/maximumDate timestamp\'i DEĞİŞMEZ', async () => {
      await tarihSeciciyiAc();

      const ilk = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      const renderSayisi = mockTarihSeciciProplari.length;

      await act(async () => { jest.advanceTimersByTime(3000); });
      expect(mockTarihSeciciProplari.length).toBeGreaterThan(renderSayisi);

      const son = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      // datetimepicker effect'i `value.getTime()`e bakar → timestamp sabit kalmalı
      expect(son.value.getTime()).toBe(ilk.value.getTime());
      expect(son.value).toBe(ilk.value);
      expect(son.minimumDate.getTime()).toBe(ilk.minimumDate.getTime());
      expect(son.maximumDate.getTime()).toBe(ilk.maximumDate.getTime());
    });
  });

  // ── NÖBETÇİ 2 — pager açılışta aktif günde doğar ──────────────────────────
  describe('Pager açılış sayfası (initialPage)', () => {
    it('gece yarısından SONRA (şu an < imsak) aktif gün DÜN → initialPage = bugün-1', async () => {
      // Gece 02:00, imsak 05:30 → yatsı sürüyor, aktif gün dün
      jest.setSystemTime(bugunSaatinde(2, 0));
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(5, 30).toISOString();
      await kur(bugunuAl());

      expect(mockPagerProplari.length).toBeGreaterThan(0);
      expect(mockPagerProplari[0].initialPage).toBe(BUGUN_INDEKSI - 1);
    });

    it('normal gündüzde (şu an > imsak) initialPage = bugün indeksi', async () => {
      jest.setSystemTime(bugunSaatinde(12, 0));
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(16, 0).toISOString();
      await kur(bugunuAl());

      expect(mockPagerProplari.length).toBeGreaterThan(0);
      expect(mockPagerProplari[0].initialPage).toBe(BUGUN_INDEKSI);
    });

    it('açılış sayfası ilk render\'da DONDURULUR — sonraki render\'larda değişmez', async () => {
      jest.setSystemTime(bugunSaatinde(2, 0));
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(5, 30).toISOString();
      await kur(bugunuAl());

      await act(async () => { jest.advanceTimersByTime(3000); });

      const tumIndeksler = mockPagerProplari.map((p) => p.initialPage);
      expect(new Set(tumIndeksler).size).toBe(1);
      expect(tumIndeksler[0]).toBe(BUGUN_INDEKSI - 1);
    });

    /**
     * Açılışta imperatif bir düzeltme komutu gitse bile hedefi AKTİF GÜN olmalı;
     * "gelecek gün" toast'ını tetikleyen geri-snap (aktif güne dönüş) OLMAMALI.
     * Eski davranışta pager bugünde doğuyor ve düzeltme komutu native'de
     * yutulabildiği için uygulama gece yarısından sonra yanlış günde açılıyordu.
     */
    it('gece yarısı senaryosunda hiçbir sayfa komutu BUGÜNÜ hedeflemez', async () => {
      jest.setSystemTime(bugunSaatinde(2, 0));
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(5, 30).toISOString();
      await kur(bugunuAl());

      const hedefler = [
        ...mockPagerSetPage.mock.calls,
        ...mockPagerSetPageWithoutAnimation.mock.calls,
      ].map((c) => c[0]);
      expect(hedefler.every((h) => h === BUGUN_INDEKSI - 1)).toBe(true);
    });

    /**
     * Pager doğru sayfada DOĞDUĞU için açılışta hiçbir sayfa komutu gitmemeli.
     *
     * Gereksiz komut zararsız görünür ama DEĞİLDİR: komut sayfayı değiştirmediği
     * için `onPageSelected` hiç tetiklenmez, dolayısıyla komuttan önce set edilen
     * programatik-geçiş bayrağı TÜKETİLEMEZ ve asılı kalır. Kullanıcının bir
     * sonraki ELLE kaydırması "programatik" sanılır → gelecek güne kayma engeli
     * ve uyarısı o sefer için yutulur.
     */
    it('açılışta pager zaten aktif gündeyse sayfa komutu HİÇ gönderilmez', async () => {
      jest.setSystemTime(bugunSaatinde(2, 0));
      mockVakitBilgisi.sonrakiVakitGiris = bugunSaatinde(5, 30).toISOString();
      await kur(bugunuAl());

      expect(mockPagerSetPage).not.toHaveBeenCalled();
      expect(mockPagerSetPageWithoutAnimation).not.toHaveBeenCalled();
    });
  });
});
