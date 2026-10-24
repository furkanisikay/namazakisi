/**
 * AyarlarSayfasi (Plan 1 yeniden kurulumu) render + etkileşim testleri.
 *
 * `useFocusEffect` bu repoda AyarlarSayfasi zincirinde (useAyarOzetleri
 * üzerinden) kullanılıyor — mock reçetesi task-5-brief ile birebir:
 * `useEffect`'e devredilir, böylece async okuma gerçek zamanda `waitFor` ile
 * beklenebilir (sahte zamanlayıcıya gerek yok, AGENTS.md test dersleri).
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler, useTema } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { Depolama } from '../../../data/local/Depolama';
import { YENI_OZELLIKLER } from '../../../core/constants/YeniOzellikler';
import { yeniOzellikGorunurMu } from '../../hooks/yeniOzellikYetenegi';
import { AyarlarSayfasi } from '../AyarlarSayfasi';
import { KildimGuvenServisi } from '../../../domain/services/KildimGuvenServisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../../core/nafile/nafileTipleri';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: (cb: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(cb, [cb]);
  },
}));
jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn(), useTema: jest.fn() }));
jest.mock('../../../core/feedback', () => ({ useFeedback: jest.fn() }));
jest.mock('../../../data/local/Depolama', () => ({ Depolama: { oku: jest.fn() } }));
const mockPilDurumu = { muaf: null as boolean | null, samsung: false };
const mockPilAyarlariniAc = jest.fn().mockResolvedValue('uygulama');
jest.mock('../../../domain/services/SistemDurumuOkuyucu', () => ({
  pilDurumunuOku: jest.fn(async () => ({ ...mockPilDurumu })),
  tamAlarmDurumunuOku: jest.fn(async () => 'verildi'),
  alarmIzniAyariniAc: jest.fn(),
  pilAyarlariniAc: (...a: unknown[]) => mockPilAyarlariniAc(...a),
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{props.name}</Text>;
});

const mockRenkler = {
  arkaplan: '#ffffff',
  kartArkaplan: '#f0f0f0',
  birincil: '#4CAF50',
  birincilMetin: '#FFFFFF',
  metin: '#333333',
  metinIkincil: '#666666',
  sinir: '#cccccc',
  durum: {
    basarili: '#4CAF50',
    uyari: '#FFC107',
    hata: '#F44336',
    bilgi: '#2196F3',
  },
};

const mockTema = {
  tema: { mod: 'acik' as const, renkler: {} as unknown },
  palet: { id: 'zumrut', ad: 'Zümrüt' },
};

const stateOlustur = (ustyaz: Record<string, unknown> = {}) => ({
  konum: {
    konumModu: 'oto',
    seciliIlAdi: 'Istanbul',
    seciliIlceAdi: '',
    gpsAdres: { ilce: 'Kadıköy', il: 'İstanbul' },
    sonGpsGuncellemesi: new Date(Date.now() - 1000).toISOString(),
    akilliTakipAktif: true,
    yukleniyor: false,
  },
  muhafiz: { aktif: true, yogunluk: 'normal' },
  vakitBildirim: {
    ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false },
  },
  cumaHatirlatma: { ayarlar: { aktif: false, oncedenDk: 60 } },
  nafile: { ayarlar: VARSAYILAN_NAFILE_AYARLARI, yuklendi: true, hata: null },
  seri: { ayarlar: { tamGunEsigi: 4, gunSonuBildirimAktif: true } },
  iftarSayac: { ayarlar: { aktif: false } },
  sahurSayac: { ayarlar: { aktif: false } },
  takvim: { ayarlar: { aktif: true } },
  guncelleme: { guncellemeMevcut: false },
  ozellikler: { gorulenIdler: [], kapatilanKartIdler: [], yuklendi: true },
  ...ustyaz,
});

function selectorlaKur(ustyaz: Record<string, unknown> = {}) {
  (useAppSelector as unknown as jest.Mock).mockImplementation(
    (selector: (state: ReturnType<typeof stateOlustur>) => unknown) => selector(stateOlustur(ustyaz))
  );
}

describe('AyarlarSayfasi', () => {
  const dispatchMock = jest.fn();
  const navigateMock = jest.fn();
  const titresimDurumunuDegistirMock = jest.fn();
  const sesDurumunuDegistirMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useTema as jest.Mock).mockReturnValue(mockTema);
    (useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(dispatchMock);
    (useFeedback as jest.Mock).mockReturnValue({
      ayarlar: { titresimAktif: true, sesAktif: false },
      titresimDurumunuDegistir: titresimDurumunuDegistirMock,
      sesDurumunuDegistir: sesDurumunuDegistirMock,
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (Depolama.oku as jest.Mock).mockResolvedValue(null);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    selectorlaKur();
  });

  it('üç görev grubu render edilir (Namaz · Ekran ve cihazlar · Hesap)', async () => {
    const { getByRole, getByText } = render(<AyarlarSayfasi />);

    expect(getByRole('header', { name: 'Namaz' })).toBeTruthy();
    expect(getByRole('header', { name: 'Ekran ve cihazlar' })).toBeTruthy();
    expect(getByRole('header', { name: 'Hesap' })).toBeTruthy();
    for (const satir of ['Hatırlatmalar', 'Namaz vakitleri', 'Seri hedefi', 'Görünüm', 'Yedek ve eşitleme', 'Yardım']) {
      expect(getByText(satir)).toBeTruthy();
    }

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('NÖBETÇİ: Otomasyon ve "Kıldım işaretleyen uygulamalar" kökte YOK (Saat ve widget > Gelişmiş)', async () => {
    const spy = jest.spyOn(KildimGuvenServisi, 'kullanilabilirMi').mockReturnValue(true);
    try {
      const { queryByText } = render(<AyarlarSayfasi />);

      expect(queryByText('Otomasyonlarla kullanın')).toBeNull();
      expect(queryByText(/Kıldım işaret/)).toBeNull();
      // Taşınan diğer ayarlar da kökte yok: Bildirimler, Camideyim, Neler yeni, Hakkında.
      expect(queryByText('Bildirimler')).toBeNull();
      expect(queryByText('Neler yeni')).toBeNull();
      expect(queryByText('Hakkında')).toBeNull();

      await act(async () => {
        await Promise.resolve();
      });
    } finally {
      spy.mockRestore();
    }
  });

  it('Hatırlatmalar satırı canlı özeti gösterir (düzey + açık diğer hatırlatmalar)', async () => {
    const { getByLabelText } = render(<AyarlarSayfasi />);

    expect(getByLabelText(/^Hatırlatmalar\. Normal düzey, \d+ hatırlatma daha$/)).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('Namaz vakitleri satırı konum + mezhebi özetler ve kendi sayfasına gider', async () => {
    const { getByText, getByLabelText } = render(<AyarlarSayfasi />);

    expect(getByLabelText('Namaz vakitleri. Kadıköy, İstanbul · Hanefî')).toBeTruthy();
    fireEvent.press(getByText('Namaz vakitleri'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('NamazVakitleriAyarlari');
    });
  });

  it('Görünüm satırına dokununca Türkçe "ü" ile "GorünumAyarlari" ile navigate çağrılır', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Görünüm'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('GorünumAyarlari');
    });
  });

  it('NÖBETÇİ: yeni özellik tanıtım kartı hâlâ render edilir', async () => {
    // Sabit dize DEĞİL — katalogdan türetilir: AGENTS.md'nin duyuru reçetesi diziye
    // EN ÜSTE kayıt eklemeyi söylüyor, sabit başlık bir sonraki özellik duyurusunda
    // bu testi sebepsiz kırardı. Kart, `useYeniOzellikler` ile aynı kuraldan seçilir:
    // okunmamışlar arasında kartGoster'i olan İLK kayıt (her kayıt kart göstermez).
    // Yetenek isteyen duyuru (ör. iPhone widget'ı) bu cihazda yoksa atlanır.
    const kartOzelligi = YENI_OZELLIKLER.find(o => o.kartGoster && yeniOzellikGorunurMu(o));
    expect(kartOzelligi).toBeDefined();

    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Uygulamaya eklendi')).toBeTruthy();
    expect(getByText(kartOzelligi!.baslik)).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('NÖBETÇİ: satır rozeti (YeniRozet) okunmamış özellik için hâlâ render edilir', async () => {
    const { getAllByText } = render(<AyarlarSayfasi />);

    // Hatırlatmalar satırı (alt sayfaların hedefSayfa eşleşmesi) rozet taşır.
    expect(getAllByText('Yeni').length).toBeGreaterThan(0);

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('bir satıra dokununca ilgili özellik görüldü işaretlenir (dispatch çağrılır)', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Hatırlatmalar'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('Hatirlatmalar');
    });
    expect(dispatchMock).toHaveBeenCalled();
  });

  it('Yardım satırı Yardım sayfasına gider (Neler yeni, Hakkında, kurulum orada)', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    fireEvent.press(getByText('Yardım'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('Yardim');
    });
  });

  it('sağlık kartı: sorun varken kartın başlığı görünür (muhafiz kapalı + tüm vakit bildirimleri kapalı)', async () => {
    selectorlaKur({
      muhafiz: { aktif: false, yogunluk: 'normal' },
      vakitBildirim: {
        ayarlar: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false },
      },
      cumaHatirlatma: { ayarlar: { aktif: false, oncedenDk: 60 } },
      nafile: { ayarlar: VARSAYILAN_NAFILE_AYARLARI, yuklendi: true, hata: null },
    });
    const { getByText } = render(<AyarlarSayfasi />);

    expect(getByText('Vakit hatırlatmaları kapalı')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });
  });

  it('sağlık kartı: sorun yokken tek satırlık özet gösterilir', async () => {
    const { getByText } = render(<AyarlarSayfasi />);

    await waitFor(() => {
      expect(getByText(/Kurulumunuz eksiksiz/)).toBeTruthy();
    });
  });

  it('sağlık kartı: sistem ayarları eylemi Linking.openSettings çağırır', async () => {
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockImplementation(() => Promise.resolve());
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { getByText } = render(<AyarlarSayfasi />);

    await waitFor(() => {
      expect(getByText('İzni açın')).toBeTruthy();
    });
    fireEvent.press(getByText('İzni açın'));

    expect(openSettingsSpy).toHaveBeenCalled();
    openSettingsSpy.mockRestore();
  });

  it('Titreşim satırındaki toggle useFeedback.titresimDurumunuDegistir çağırır', async () => {
    const { getByRole } = render(<AyarlarSayfasi />);

    const anahtarlar = getByRole('switch', { name: /Dokunma titreşimi/ });
    fireEvent(anahtarlar, 'valueChange', false);

    await waitFor(() => {
      expect(titresimDurumunuDegistirMock).toHaveBeenCalledWith(false);
    });
  });

  it('Ses efektleri satırındaki toggle useFeedback.sesDurumunuDegistir çağırır', async () => {
    const { getByRole } = render(<AyarlarSayfasi />);

    const anahtarlar = getByRole('switch', { name: /Dokunma sesleri/ });
    fireEvent(anahtarlar, 'valueChange', true);

    await waitFor(() => {
      expect(sesDurumunuDegistirMock).toHaveBeenCalledWith(true);
    });
  });

  describe('arama', () => {
    it('sorgu yazılınca gruplar ve sağlık kartı gizlenir, sonuçlar görünür; temizlenince geri gelir', async () => {
      const { getByLabelText, getByText, queryByRole, queryByText } = render(<AyarlarSayfasi />);

      await waitFor(() => {
        expect(queryByRole('header', { name: 'Namaz' })).toBeTruthy();
      });

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'muhafız');

      // Grup başlıkları (accessibilityRole="header") kaybolur — bağlam
      // metni ("Hatırlatmalar") sonuç kartında geçebilir, o AYRI bir Text'tir.
      expect(queryByRole('header', { name: 'Namaz' })).toBeNull();
      expect(queryByRole('header', { name: 'Hesap' })).toBeNull();
      expect(queryByText(/Kurulumunuz eksiksiz/)).toBeNull();
      // "muhafız" eski adla da bulunur (anahtar kelime) — yeni adı "Vakit çıkmadan".
      expect(getByText('Vakit çıkmadan')).toBeTruthy();

      fireEvent.press(getByLabelText('Aramayı temizle'));

      await waitFor(() => {
        expect(queryByRole('header', { name: 'Namaz' })).toBeTruthy();
      });
    });

    it('eşleşme yoksa kibar boş durum metni görünür', async () => {
      const { getByLabelText, getByText } = render(<AyarlarSayfasi />);

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'zzzzz-eslesmeyen-sorgu');

      await waitFor(() => {
        expect(getByText('Eşleşen ayar bulunamadı')).toBeTruthy();
      });
    });

    it('bir sonuca dokununca ilgili sayfaya çapasıyla navigate edilir', async () => {
      const { getByLabelText, getByText } = render(<AyarlarSayfasi />);

      fireEvent.changeText(getByLabelText('Ayarlarda arayın'), 'cuma');

      await waitFor(() => {
        expect(getByText('Cuma namazı')).toBeTruthy();
      });
      fireEvent.press(getByText('Cuma namazı'));

      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('CumaHatirlatmaAyarlari', { vurgula: 'cumaHatirlatmasi' });
      });
    });
  });

  describe('pil kısıtı (Samsung)', () => {
    afterEach(() => {
      mockPilDurumu.muaf = null;
      mockPilDurumu.samsung = false;
    });

    it('Samsung + kısıtlı → kartta "Uyutulmasın"; dokununca rehber açılır, "Ayarları açın" ayar ekranını açar', async () => {
      mockPilDurumu.muaf = false;
      mockPilDurumu.samsung = true;
      const { findByText, getByTestId, getByLabelText } = render(<AyarlarSayfasi />);
      fireEvent.press(await findByText('Uyutulmasın'));
      expect(getByTestId('pil-rehberi')).toBeTruthy();
      // Minyatür bilinçli olarak erişilebilirlik ağacının DIŞINDA (yalnız görsel yönlendirme).
      expect(getByTestId('pil-minyatur', { includeHiddenElements: true })).toBeTruthy();
      await act(async () => {
        fireEvent.press(getByLabelText('Ayarları açın'));
      });
      expect(mockPilAyarlariniAc).toHaveBeenCalledTimes(1);
    });

    it('NÖBETÇİ: durum okunamazsa (null) kartta pil uyarısı yok', async () => {
      const { queryByText } = render(<AyarlarSayfasi />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(queryByText('Uyutulmasın')).toBeNull();
      expect(queryByText('Pil ayarlarını açın')).toBeNull();
    });
  });
});

describe('AyarlarSayfasi — İngilizce', () => {
  let geriAl: () => void;
  beforeEach(() => {
    jest.clearAllMocks();
    geriAl = ingilizceyeGec();
    (useRenkler as jest.Mock).mockReturnValue(mockRenkler);
    (useTema as jest.Mock).mockReturnValue({ ...mockTema, palet: { id: 'zumrut', ad: 'Emerald' } });
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());
    (useFeedback as jest.Mock).mockReturnValue({
      ayarlar: { titresimAktif: true, sesAktif: false },
      titresimDurumunuDegistir: jest.fn(),
      sesDurumunuDegistir: jest.fn(),
      butonTiklandiFeedback: jest.fn().mockResolvedValue(undefined),
    });
    (Depolama.oku as jest.Mock).mockResolvedValue(null);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied', canAskAgain: false });
    // Tanıtım kartı ("Neler yeni" içeriği) koordinatörün dosyasıdır: hepsi görülmüş sayılır.
    selectorlaKur({
      muhafiz: { aktif: false, yogunluk: 'normal' },
      vakitBildirim: { ayarlar: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false } },
      ozellikler: {
        gorulenIdler: YENI_OZELLIKLER.flatMap((o) => [o.id, `${o.id}@${o.surum}`]),
        kapatilanKartIdler: YENI_OZELLIKLER.map((o) => o.id),
        yuklendi: true,
      },
    });
  });
  afterEach(() => geriAl());

  it('kök sayfa, sağlık kartı ve arama sonuçları İngilizce (yer adları hariç)', async () => {
    const e = render(<AyarlarSayfasi />);
    await waitFor(() => expect(e.getByText('Notification permission is off')).toBeTruthy());
    const yasakli = ['Ayarlar', 'Namaz', 'Hesap', 'Yedek', 'Seri', 'Kapal', 'Konum', 'Dokunma', 'Yard'];
    const yerAdi = (m: string) => m.includes('Kadıköy, İstanbul');
    expect(turkceKalanlar(e.toJSON() as never, yasakli).filter((m) => !yerAdi(m))).toEqual([]);
    expect(e.getAllByText('Settings').length).toBe(2);
    fireEvent.changeText(e.getByLabelText('Search settings'), 'qibla calculation');
    await waitFor(() => expect(e.getByText('No matching setting found')).toBeTruthy());
    fireEvent.changeText(e.getByLabelText('Search settings'), 'theme');
    await waitFor(() => expect(e.getAllByText('Theme').length).toBeGreaterThan(0));
    expect(turkceKalanlar(e.toJSON() as never, yasakli)).toEqual([]);
  });
});
