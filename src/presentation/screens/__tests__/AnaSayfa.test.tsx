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
 * Not: sabit takvim tarihi YAZILMAZ (AGENTS.md) — indeksler `bugunuAl()`e
 * göreceli doğrulanır. SAHTE ZAMANLAYICI DA KULLANILMAZ: `jest.useFakeTimers` +
 * `setSystemTime` bu tam-sayfa render testlerini CI runner'ında asıyordu
 * (yerelde 0.1 sn, CI'da 30 sn'lik testTimeout — üstelik hep aynı testler
 * değil). Senaryolar imsak mock'undan kurulur, sayaç tick'i `waitFor` ile
 * gerçek zamanda beklenir.
 */
import React from 'react';
import { render, fireEvent, act, waitFor, within } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler, useTema } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { bugunuAl } from '../../../core/utils/TarihYardimcisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../../core/nafile/nafileTipleri';
import { useEkranSinifi } from '../../hooks/useEkranSinifi';

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

/** Pager cocuklarini ciz (yalniz sayfa duzeni testleri; varsayilan KAPALI). */
const mockPagerCocuklari = { ciz: false };

jest.mock('react-native-pager-view', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  const Pager = ReactMock.forwardRef((props: PagerProplari, ref: unknown) => {
    mockPagerProplari.push(props);
    ReactMock.useImperativeHandle(ref, () => ({
      setPage: mockPagerSetPage,
      setPageWithoutAnimation: mockPagerSetPageWithoutAnimation,
    }));
    // Cocuklari RENDER ETME: gercek pager 92 gun sayfasi (3 ay geri + bugun + yarin)
    // alir ve bu testlerin olctugu sey yalnizca Pager'a giden PROP'lar. Coverage
    // enstrumantasyonu altinda 92 sayfayi cizmek suiti CI runner'inda 30 sn'lik
    // testTimeout'u asacak kadar yavaslatiyordu (yerelde ~3 sn, CI'da timeout).
    // Istisna: duzen testleri (issue #283) sayfa icerigini olcer → yalniz onlar acar.
    return mockPagerCocuklari.ciz ? <View>{props.children}</View> : <View />;
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
const mockVakitKartiProplari: { vakitAraligi?: string }[] = [];
jest.mock('../../components/home/VakitKarti', () => {
  const { View } = require('react-native');
  return {
    VakitKarti: (props: { vakitAraligi?: string }) => {
      mockVakitKartiProplari.push(props);
      return <View testID="vakit-karti" />;
    },
  };
});
const mockVakitAkisiProplari: { onVakitTikla?: (ad: string, val: boolean) => void }[] = [];
jest.mock('../../components/home/VakitAkisi', () => {
  const { View } = require('react-native');
  return {
    VakitAkisi: (props: { onVakitTikla?: (ad: string, val: boolean) => void }) => {
      mockVakitAkisiProplari.push(props);
      return <View testID="vakit-akisi" />;
    },
  };
});
jest.mock('../../hooks/useEkranSinifi', () => ({ useEkranSinifi: jest.fn(() => 'kompakt') }));
jest.mock('../../components/home/SeriKartiModal', () => {
  const { View } = require('react-native');
  return { SeriKartiModal: () => <View /> };
});
const mockKerahatModalProplari: { gorunur: boolean; onOnayla: () => void }[] = [];
jest.mock('../../components/home/KerahatOnayModal', () => {
  const { View } = require('react-native');
  return {
    KerahatOnayModal: (props: { gorunur: boolean; onOnayla: () => void }) => {
      mockKerahatModalProplari.push(props);
      return <View />;
    },
  };
});
// "Her farzla bir kaza" (issue #294): karar hook'ta (kendi testi var); burada yalnız
// ana ekranın onu DOĞRU girdiyle çağırdığı ölçülür.
const mockKazaDegerlendir = jest.fn();
jest.mock('../../hooks/useFarzSonrasiKazaOnerisi', () => ({
  useFarzSonrasiKazaOnerisi: () => ({
    oneri: null,
    isleniyor: false,
    degerlendir: mockKazaDegerlendir,
    kildim: jest.fn(),
    simdiDegil: jest.fn(),
    birDahaSorma: jest.fn(),
  }),
}));
jest.mock('../../components/home/KazaOneriModal', () => {
  const { View } = require('react-native');
  return { KazaOneriModal: () => <View /> };
});
// Sade görünüm (issue #295): bileşen native TTS köprüsünü çeker (requireNativeModule
// tuzağı) → hafif taklit; ana ekranın ona DOĞRU girdiyi verdiği ölçülür.
interface SadeProplari {
  vakit: string | null;
  tamamlandi: boolean;
  kayitHazir: boolean;
  mekruhMu: boolean;
  onKildim: () => void;
  onTumUygulama: () => void;
}
const mockSadeProplari: SadeProplari[] = [];
jest.mock('../../components/sade/SadeGorunum', () => {
  const { View } = require('react-native');
  return {
    SadeGorunum: (props: SadeProplari) => {
      mockSadeProplari.push(props);
      return <View testID="sade-gorunum" />;
    },
  };
});
/** `state.sadeGorunum` — undefined iken dilim YOK (eski davranış birebir). */
const mockSadeDurumu: { deger: unknown } = { deger: undefined };

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: (props: { children?: React.ReactNode }) => <View>{props.children}</View> };
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});

// ── Domain servisleri (native köprü / yan etki yok) ──────────────────────────
const mockVakitBilgisi: {
  vakit: 'ogle' | 'yatsi';
  saat: Date;
  kalanSureMs: number;
  sonrakiVakitAdi: string;
  sonrakiVakitGiris: string;
} = {
  vakit: 'ogle',
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

/**
 * Senaryo kurulumu SİSTEM SAATİNE DEĞİL, imsak (fajr) mock'una dayanır.
 *
 * Ölçülen şey saatin kendisi değil, `şu an < imsak` koşuludur — ve o koşul adhan
 * mock'undan gelir. `jest.setSystemTime` ile sahte bir "şimdi" kurmak testleri CI
 * runner'ında KARARSIZ hâle getiriyordu: sahte zamanlayıcı + React `act`
 * etkileşimi yüzünden yerelde 0.1 sn süren üç test CI'da 30 sn'lik testTimeout'a
 * takılıyordu (hep aynı üçü de değil — flaky). İmsağı gerçek "şimdi"nin iki yanına
 * koymak aynı iki dalı sahte saat olmadan, deterministik biçimde kurar.
 *
 * Sayaç hedefi de ileriye kurulur ki her tick'te kalan süre metni DEĞİŞSİN —
 * yeniden render olmadan prop stabilitesi ölçülemez.
 */
const geceYarisiSenaryosu = () => {
  // İmsak günün SONUNDA → şu an kesinlikle imsaktan önce → aktif gün DÜN
  mockAdhanAyari.fajrSaat = 23;
  mockAdhanAyari.fajrDakika = 59;
  mockVakitBilgisi.sonrakiVakitGiris = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
};

const gunduzSenaryosu = () => {
  // İmsak gün BAŞINDA → şu an kesinlikle imsaktan sonra → aktif gün BUGÜN
  mockAdhanAyari.fajrSaat = 0;
  mockAdhanAyari.fajrDakika = 0;
  mockVakitBilgisi.sonrakiVakitGiris = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
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
      nafile: { ayarlar: VARSAYILAN_NAFILE_AYARLARI, yuklendi: true, hata: null },
      sadeGorunum: mockSadeDurumu.deger,
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
    mockPagerCocuklari.ciz = false;
    mockVakitAkisiProplari.length = 0;
    mockKerahatModalProplari.length = 0;
    mockSadeProplari.length = 0;
    mockSadeDurumu.deger = undefined;
    (useEkranSinifi as jest.Mock).mockReturnValue('kompakt');
    mockAdhanAyari.fajrSaat = 5;
    mockAdhanAyari.fajrDakika = 30;
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useTema as jest.Mock).mockReturnValue({ koyuMu: false });
    (useFeedback as jest.Mock).mockReturnValue(feedbackMock);
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
  });

  // ── NÖBETÇİ 0 — vakit listesi YEREL takvim gününe göre hesaplanır ─────────
  it('vakit listesi gösterilen günün YEREL gece yarısıyla hesaplanır (UTC ile değil)', async () => {
    // new Date('YYYY-MM-DD') UTC gece yarısıdır: TR'de (UTC+3) 03:00, UTC'nin gerisindeki
    // bölgelerde ise ÖNCEKİ GÜN olur ve liste bir önceki günün vakitlerini gösterirdi.
    // Not: CI UTC'de koştuğu için eski kod orada tesadüfen geçer; yerel (TR) koşum yakalar.
    const bugun = bugunuAl();
    const [y, a, g] = bugun.split('-').map(Number);
    await kur(bugun);

    const { PrayerTimes } = jest.requireMock('adhan');
    const tarihler: Date[] = (PrayerTimes as jest.Mock).mock.calls.map((c: unknown[]) => c[1] as Date);
    expect(tarihler).toContainEqual(new Date(y, a - 1, g));
  });

  // ── NÖBETÇİ 1 — tarih seçici geri çağrısı stabil ──────────────────────────
  describe('Tarih seçici prop stabilitesi (dialog yeniden açılma bug\'ı)', () => {
    const tarihSeciciyiAc = async () => {
      gunduzSenaryosu();
      const ekran = await kur(bugunuAl());
      fireEvent.press(ekran.getByText('tarih-ac'));
      return ekran;
    };

    it('sayaç tick\'i ile yeniden render olsa da onChange AYNI REFERANS kalır', async () => {
      await tarihSeciciyiAc();

      expect(mockTarihSeciciProplari.length).toBeGreaterThan(0);
      const ilk = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      const renderSayisi = mockTarihSeciciProplari.length;

      // Geri sayım sayacı GERÇEK zamanlayıcıdır (1 sn); en az bir tick bekle.
      // Test vakum olmasın: yeniden render olduğu bekleyişin kendisiyle KANITLANIR.
      await waitFor(() =>
        expect(mockTarihSeciciProplari.length).toBeGreaterThan(renderSayisi)
      );

      const son = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      expect(son.onChange).toBe(ilk.onChange);
    });

    it('sayaç tick\'i ile value/minimumDate/maximumDate timestamp\'i DEĞİŞMEZ', async () => {
      await tarihSeciciyiAc();

      const ilk = mockTarihSeciciProplari[mockTarihSeciciProplari.length - 1];
      const renderSayisi = mockTarihSeciciProplari.length;

      await waitFor(() =>
        expect(mockTarihSeciciProplari.length).toBeGreaterThan(renderSayisi)
      );

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
      // İmsak henüz gelmemiş → yatsı sürüyor, aktif gün dün
      geceYarisiSenaryosu();
      await kur(bugunuAl());

      expect(mockPagerProplari.length).toBeGreaterThan(0);
      expect(mockPagerProplari[0].initialPage).toBe(BUGUN_INDEKSI - 1);
    });

    it('normal gündüzde (şu an > imsak) initialPage = bugün indeksi', async () => {
      gunduzSenaryosu();
      await kur(bugunuAl());

      expect(mockPagerProplari.length).toBeGreaterThan(0);
      expect(mockPagerProplari[0].initialPage).toBe(BUGUN_INDEKSI);
    });

    it('açılış sayfası ilk render\'da DONDURULUR — sonraki render\'larda değişmez', async () => {
      geceYarisiSenaryosu();
      await kur(bugunuAl());

      // Sayaç tick'i yeniden render tetikler; açılış sayfası yine de değişmemeli
      const renderSayisi = mockPagerProplari.length;
      await waitFor(() => expect(mockPagerProplari.length).toBeGreaterThan(renderSayisi));

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
      geceYarisiSenaryosu();
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
      geceYarisiSenaryosu();
      await kur(bugunuAl());

      expect(mockPagerSetPage).not.toHaveBeenCalled();
      expect(mockPagerSetPageWithoutAnimation).not.toHaveBeenCalled();
    });
  });

  // ── Katlanabilir / tablet düzeni (issue #283) ─────────────────────────────
  describe('Katlanabilir/tablet düzeni', () => {
    it('telefonda (kompakt) düzen DEĞİŞMEZ: tek sütun, iki bölme yok', async () => {
      gunduzSenaryosu();
      mockPagerCocuklari.ciz = true;
      const ekran = await kur(bugunuAl());

      expect(ekran.getByTestId('vakit-karti')).toBeTruthy();
      expect(ekran.getByTestId('vakit-akisi')).toBeTruthy();
      expect(ekran.queryByTestId('anasayfa-iki-bolme')).toBeNull();
    });

    it.each(['orta', 'genis'] as const)(
      '%s pencerede vakit kartı SOL, Günlük Akış SAĞ bölmede çizilir',
      async (sinif) => {
        gunduzSenaryosu();
        mockPagerCocuklari.ciz = true;
        (useEkranSinifi as jest.Mock).mockReturnValue(sinif);
        const ekran = await kur(bugunuAl());

        const sol = ekran.getByTestId('anasayfa-sol-bolme');
        const sag = ekran.getByTestId('anasayfa-sag-bolme');
        expect(within(sol).getByTestId('vakit-karti')).toBeTruthy();
        expect(within(sol).queryByTestId('vakit-akisi')).toBeNull();
        expect(within(sag).getByTestId('vakit-akisi')).toBeTruthy();
        expect(within(sag).queryByTestId('vakit-karti')).toBeNull();
      }
    );

    it('iki bölmeli düzen pager açılış sayfasını ETKİLEMEZ (gece yarısı = dün)', async () => {
      geceYarisiSenaryosu();
      (useEkranSinifi as jest.Mock).mockReturnValue('genis');
      await kur(bugunuAl());

      expect(mockPagerProplari[0].initialPage).toBe(BUGUN_INDEKSI - 1);
      expect(mockPagerSetPage).not.toHaveBeenCalled();
      expect(mockPagerSetPageWithoutAnimation).not.toHaveBeenCalled();
    });
  });
  describe('Vakit kartı aralığı', () => {
    afterEach(() => {
      mockVakitBilgisi.vakit = 'ogle';
      mockVakitBilgisi.saat = new Date();
    });

    it('yatsıda bitiş "..." DEĞİL, servisin verdiği çıkış (ertesi imsak) saatidir', async () => {
      gunduzSenaryosu();
      mockPagerCocuklari.ciz = true;
      const cikis = new Date();
      cikis.setHours(5, 7, 0, 0);
      mockVakitBilgisi.vakit = 'yatsi';
      mockVakitBilgisi.saat = cikis;
      mockVakitKartiProplari.length = 0;

      await kur(bugunuAl());

      const son = mockVakitKartiProplari[mockVakitKartiProplari.length - 1];
      expect(son.vakitAraligi).toBe('20:30 - 05:07');
    });
  });

  // ── "Her farzla bir kaza" (issue #294) ────────────────────────────────────
  describe('Kaza önerisi tetiklemesi', () => {
    const vakitTikla = (ad: string, val: boolean) =>
      act(async () => {
        mockVakitAkisiProplari[mockVakitAkisiProplari.length - 1].onVakitTikla!(ad, val);
        await Promise.resolve();
      });

    it('aktif günde o anki vakit "kıldım" işaretlenince öneri doğru girdiyle değerlendirilir', async () => {
      gunduzSenaryosu();
      mockPagerCocuklari.ciz = true;
      await kur(bugunuAl());
      await vakitTikla('Öğle', true);

      expect(mockKazaDegerlendir).toHaveBeenCalledWith(
        expect.objectContaining({
          kilinanNamaz: 'Öğle',
          tamamlandi: true,
          gosterilenGun: bugunuAl(),
          aktifGun: bugunuAl(),
          suankiVakitNamazi: 'Öğle',
          koordinat: { lat: 41.0082, lng: 28.9784 },
        })
      );
    });

    it('geri almada da çağrılır (bekleyen değerlendirme iptal edilsin) — tamamlandi=false', async () => {
      gunduzSenaryosu();
      mockPagerCocuklari.ciz = true;
      await kur(bugunuAl());
      await vakitTikla('Öğle', false);
      expect(mockKazaDegerlendir).toHaveBeenCalledWith(expect.objectContaining({ tamamlandi: false }));
    });

    it('KERAHAT vaktinde önce kerahat onayı açılır; öneri onay beklenirken değerlendirilmez', async () => {
      const { mekruhVakitKontrolEt } = jest.requireMock('../../../domain/services/KazaHesaplayiciServisi');
      (mekruhVakitKontrolEt as jest.Mock).mockReturnValue({ mekruhMu: true, aciklama: 'gurub' });
      try {
        gunduzSenaryosu();
        mockPagerCocuklari.ciz = true;
        await kur(bugunuAl());
        await vakitTikla('Öğle', true);
        expect(mockKazaDegerlendir).not.toHaveBeenCalled();
        expect(mockKerahatModalProplari[mockKerahatModalProplari.length - 1].gorunur).toBe(true);
      } finally {
        (mekruhVakitKontrolEt as jest.Mock).mockReturnValue({ mekruhMu: false, aciklama: null });
      }
    });
  });

  // ── Sade görünüm (issue #295) ─────────────────────────────────────────────
  describe('Sade görünüm seçim dalı', () => {
    const sadeAcik = (ek: Record<string, unknown> = {}) => {
      mockSadeDurumu.deger = {
        ayarlar: { aktif: true },
        yuklendi: true,
        yukleniyor: false,
        geciciCikis: false,
        hata: null,
        ...ek,
      };
    };
    const sonSade = () => mockSadeProplari[mockSadeProplari.length - 1];

    it('açıkken ana ekranın YERİNE sade görünüm çizilir (pager yok)', async () => {
      gunduzSenaryosu();
      sadeAcik();
      const ekran = await kur(bugunuAl());
      expect(ekran.getByTestId('sade-gorunum')).toBeTruthy();
      expect(mockPagerProplari.length).toBe(0);
      expect(sonSade().vakit).toBe('ogle');
      expect(sonSade().kayitHazir).toBe(true);
      expect(sonSade().tamamlandi).toBe(false);
    });

    it('"Kıldım" AYNI işaretleme yolundan geçer (aktif gün, şu anki vakit)', async () => {
      gunduzSenaryosu();
      sadeAcik();
      await kur(bugunuAl());
      await act(async () => {
        sonSade().onKildim();
        await Promise.resolve();
      });
      const { namazDurumunuDegistir } = jest.requireMock('../../store/namazSlice');
      expect(namazDurumunuDegistir).toHaveBeenCalledWith({ tarih: bugunuAl(), namazAdi: 'Öğle', tamamlandi: true });
    });

    it('KERAHAT vaktinde "Kıldım" ENGELLENMEZ ama önce onay modalı açılır', async () => {
      const { mekruhVakitKontrolEt } = jest.requireMock('../../../domain/services/KazaHesaplayiciServisi');
      (mekruhVakitKontrolEt as jest.Mock).mockReturnValue({ mekruhMu: true, aciklama: 'gurub' });
      try {
        gunduzSenaryosu();
        sadeAcik();
        await kur(bugunuAl());
        expect(sonSade().mekruhMu).toBe(true);
        await act(async () => {
          sonSade().onKildim();
          await Promise.resolve();
        });
        const { namazDurumunuDegistir } = jest.requireMock('../../store/namazSlice');
        expect(namazDurumunuDegistir).not.toHaveBeenCalled();
        expect(mockKerahatModalProplari[mockKerahatModalProplari.length - 1].gorunur).toBe(true);
      } finally {
        (mekruhVakitKontrolEt as jest.Mock).mockReturnValue({ mekruhMu: false, aciklama: null });
      }
    });

    it('ayar diskten okunmadan karar verilmez: yükleniyor gösterilir', async () => {
      gunduzSenaryosu();
      sadeAcik({ yuklendi: false, ayarlar: { aktif: false } });
      const ekran = await kur(bugunuAl());
      expect(ekran.getByText('yukleniyor')).toBeTruthy();
      expect(mockPagerProplari.length).toBe(0);
    });

    it('geçici çıkışta normal ekran + "Sade görünüme dönün" düğmesi', async () => {
      gunduzSenaryosu();
      sadeAcik({ geciciCikis: true });
      const ekran = await kur(bugunuAl());
      expect(ekran.queryByTestId('sade-gorunum')).toBeNull();
      expect(mockPagerProplari.length).toBeGreaterThan(0);
      fireEvent.press(ekran.getByLabelText('Sade görünüme dönün'));
      expect(dispatchMock).toHaveBeenCalledWith({ type: 'sadeGorunum/geciciCikisiBitir', payload: undefined });
    });

    it('dilim yoksa (eski kayıt/test) ana ekran BİREBİR eskisi gibi', async () => {
      gunduzSenaryosu();
      const ekran = await kur(bugunuAl());
      expect(ekran.queryByTestId('sade-gorunum')).toBeNull();
      expect(ekran.queryByLabelText('Sade görünüme dönün')).toBeNull();
      expect(mockPagerProplari.length).toBeGreaterThan(0);
    });
  });
});
