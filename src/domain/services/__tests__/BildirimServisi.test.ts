import * as Notifications from 'expo-notifications';
import { NamazAdi, BILDIRIM_SABITLERI } from '../../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../../data/local/LocalNamazServisi';
import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';

// BildirimServisi modülünü import etmeden önce mock'ları ayarla
jest.mock('expo-notifications');
jest.mock('../../../data/local/LocalNamazServisi');
jest.mock('../ArkaplanMuhafizServisi');
jest.mock('../../../core/utils/TarihYardimcisi', () => ({
  gunEkle: jest.fn((tarih: string, gun: number) => {
    // Basit timezone-safe implementasyon (test icin)
    const parcalar = tarih.split('-').map(Number);
    const d = new Date(parcalar[0], parcalar[1] - 1, parcalar[2] + gun);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }),
}));

// ArkaplanMuhafizServisi mock singleton
const mockVakitBildirimleriniIptalEt = jest.fn().mockResolvedValue(undefined);
(ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
  vakitBildirimleriniIptalEt: mockVakitBildirimleriniIptalEt,
});

import { BildirimServisi } from '../BildirimServisi';

// ==================== YARDIMCI FONKSIYONLAR ====================

/**
 * Bildirim yanit nesnesi olustur (NotificationResponse mock)
 */
function muhafizYanitiOlustur(
  vakit: string,
  tarih: string,
  actionIdentifier: string = BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
  seviye: number = 2
) {
  const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}${BILDIRIM_SABITLERI.ONEKLEME.SEVIYE}${seviye}${BILDIRIM_SABITLERI.ONEKLEME.DAKIKA}30`;
  return {
    actionIdentifier,
    notification: {
      request: {
        identifier: bildirimId,
        content: {
          data: {
            tip: 'muhafiz',
            vakit,
            tarih,
            seviye,
          },
        },
      },
    },
  };
}

/**
 * Bildirim merkezi icin sahte bildirim nesnesi olustur
 */
function sunulanBildirimOlustur(id: string) {
  return {
    request: {
      identifier: id,
      content: { title: 'Test', body: 'Test', data: {} },
    },
    date: Date.now(),
  };
}

// ==================== TEST SUITE ====================

describe('BildirimServisi', () => {
  let servis: BildirimServisi;

  beforeEach(() => {
    jest.clearAllMocks();
    // Singleton'u sifirla
    (BildirimServisi as any).instance = undefined;
    servis = BildirimServisi.getInstance();
  });

  // ==================== COLD-START TESTLERI ====================

  describe('Cold-start bildirim yaniti isleme', () => {
    it('baslatBildirimDinleyicisi getLastNotificationResponseAsync cagirmali', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();

      expect(Notifications.getLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
    });

    it('cold-start yaniti varsa kildim aksiyonunu islemeli', async () => {
      const yanit = muhafizYanitiOlustur('ikindi', '2026-02-13');
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(yanit);
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      await servis.baslatBildirimDinleyicisi();

      // LocalNamazServisi guncellenmeli
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledWith(
        '2026-02-13',
        NamazAdi.Ikindi,
        true
      );
    });

    it('cold-start yaniti yoksa (null) hicbir islem yapmamali', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();

      expect(LocalNamazServisi.localNamazDurumunuGuncelle).not.toHaveBeenCalled();
    });

    it('cold-start hatasi diger islemleri engellemememeli', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockRejectedValue(
        new Error('API hatasi')
      );

      // Hata firlatmamali
      await expect(servis.baslatBildirimDinleyicisi()).resolves.not.toThrow();

      // Listener yine de kaydedilmis olmali
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('listener her zaman kaydedilmeli (cold-start sonucundan bagimsiz)', async () => {
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();

      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== DEDUPLIKASYON TESTLERI ====================

  describe('Bildirim yaniti deduplikasyonu', () => {
    it('ayni yanit iki kez islenmemeli (cold-start + listener cift tetikleme)', async () => {
      const yanit = muhafizYanitiOlustur('ogle', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      // Listener callback'ini yakala
      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );

      // Cold-start yaniti ayarla
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(yanit);

      await servis.baslatBildirimDinleyicisi();

      // Cold-start ile 1 kez islendi
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledTimes(1);

      // Ayni yanit listener uzerinden tekrar gelirse
      await listenerCallback!(yanit);

      // Hala 1 kez (deduplicate edildi)
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledTimes(1);
    });

    it('farkli yanitlar ayri ayri islenmeli', async () => {
      const yanit1 = muhafizYanitiOlustur('ogle', '2026-02-13');
      const yanit2 = muhafizYanitiOlustur('ikindi', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();

      await listenerCallback!(yanit1);
      await listenerCallback!(yanit2);

      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledTimes(2);
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledWith(
        '2026-02-13', NamazAdi.Ogle, true
      );
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledWith(
        '2026-02-13', NamazAdi.Ikindi, true
      );
    });

    it('basarisiz islem sonrasi ayni yanit tekrar denenebilmeli', async () => {
      const yanit = muhafizYanitiOlustur('aksam', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();

      // Ilk deneme basarisiz (LocalNamazServisi hata firlatiyor)
      (LocalNamazServisi.localNamazDurumunuGuncelle as jest.Mock).mockRejectedValueOnce(
        new Error('AsyncStorage hatasi')
      );
      await listenerCallback!(yanit);

      // Ikinci deneme basarili
      (LocalNamazServisi.localNamazDurumunuGuncelle as jest.Mock).mockResolvedValueOnce(undefined);
      await listenerCallback!(yanit);

      // 2 kez cagirilmali (retry basarili)
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledTimes(2);
    });
  });

  // ==================== HEDEFLI BILDIRIM TEMIZLEME TESTLERI ====================

  describe('Vakit bazli bildirim temizleme (dismissAllNotificationsAsync kullanilmamali)', () => {
    it('sadece ilgili vaktin bildirimlerini kapatmali', async () => {
      const yanit = muhafizYanitiOlustur('ikindi', '2026-02-13');

      // Bildirim merkezinde farkli vakitlerin bildirimleri var
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_ikindi_seviye_2_dk_30'),
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_ikindi_seviye_3_dk_15'),
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_aksam_seviye_1_dk_45'),
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_yatsi_seviye_1_dk_60'),
      ]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      // Sadece ikindi bildirimleri dismiss edilmeli
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
        'muhafiz_2026-02-13_vakit_ikindi_seviye_2_dk_30'
      );
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
        'muhafiz_2026-02-13_vakit_ikindi_seviye_3_dk_15'
      );

      // Aksam ve yatsi bildirimleri dismiss edilMEMELI
      const dismissCalls = (Notifications.dismissNotificationAsync as jest.Mock).mock.calls
        .map((c: any[]) => c[0]);
      expect(dismissCalls).not.toContain('muhafiz_2026-02-13_vakit_aksam_seviye_1_dk_45');
      expect(dismissCalls).not.toContain('muhafiz_2026-02-13_vakit_yatsi_seviye_1_dk_60');
    });

    it('dismissAllNotificationsAsync CAGIRILMAMALI', async () => {
      const yanit = muhafizYanitiOlustur('ogle', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_ogle_seviye_2_dk_20'),
      ]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      expect(Notifications.dismissAllNotificationsAsync).not.toHaveBeenCalled();
    });

    it('bildirim merkezi bossa hata firlatmamali', async () => {
      const yanit = muhafizYanitiOlustur('imsak', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await expect(listenerCallback!(yanit)).resolves.not.toThrow();
    });

    it('dun tarihli eski bildirimler de temizlenmeli', async () => {
      const yanit = muhafizYanitiOlustur('imsak', '2026-02-14');

      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
        sunulanBildirimOlustur('muhafiz_2026-02-14_vakit_imsak_seviye_2_dk_10'),
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_imsak_seviye_4_dk_2'), // dun
      ]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      // Hem bugun hem dun dismiss edilmeli
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
        'muhafiz_2026-02-14_vakit_imsak_seviye_2_dk_10'
      );
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
        'muhafiz_2026-02-13_vakit_imsak_seviye_4_dk_2'
      );
    });
  });

  // ==================== CALLBACK PATTERN TESTLERI ====================

  describe('Kildim callback pattern (circular dependency cozumu)', () => {
    it('callback ayarlanmissa kildim sonrasi cagrilmali', async () => {
      const mockCallback = jest.fn();
      servis.setOnKildimCallback(mockCallback);

      const yanit = muhafizYanitiOlustur('aksam', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      expect(mockCallback).toHaveBeenCalledWith('2026-02-13', NamazAdi.Aksam);
    });

    it('callback ayarlanmamissa hata firlatmamali', async () => {
      // Callback ayarlanmadi (null)
      const yanit = muhafizYanitiOlustur('ogle', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await expect(listenerCallback!(yanit)).resolves.not.toThrow();

      // LocalNamazServisi yine de guncellenmeli
      expect(LocalNamazServisi.localNamazDurumunuGuncelle).toHaveBeenCalledWith(
        '2026-02-13', NamazAdi.Ogle, true
      );
    });

    it('callback hata firlatirsa diger islemler devam etmeli', async () => {
      const mockCallback = jest.fn().mockImplementation(() => {
        throw new Error('Redux hatasi');
      });
      servis.setOnKildimCallback(mockCallback);

      const yanit = muhafizYanitiOlustur('yatsi', '2026-02-13');
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      // Callback cagrildi ama hataya ragmen bildirim iptal islemi de yapildi
      expect(mockCallback).toHaveBeenCalled();
      expect(mockVakitBildirimleriniIptalEt).toHaveBeenCalledWith('yatsi');
    });

    it('callback dogru tarih ve namazAdi ile cagrilmali (tum vakitler)', async () => {
      const mockCallback = jest.fn();
      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([]);

      const vakitNamazEslesmeleri: [string, NamazAdi][] = [
        ['imsak', NamazAdi.Sabah],
        ['ogle', NamazAdi.Ogle],
        ['ikindi', NamazAdi.Ikindi],
        ['aksam', NamazAdi.Aksam],
        ['yatsi', NamazAdi.Yatsi],
      ];

      for (const [vakit, beklenenNamaz] of vakitNamazEslesmeleri) {
        // Her iterasyonda singleton'u sifirla
        (BildirimServisi as any).instance = undefined;
        const yeniServis = BildirimServisi.getInstance();
        yeniServis.setOnKildimCallback(mockCallback);
        mockCallback.mockClear();

        const yanit = muhafizYanitiOlustur(vakit, '2026-02-13');
        let listenerCallback: Function;
        (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
          (cb: Function) => {
            listenerCallback = cb;
            return { remove: jest.fn() };
          }
        );
        (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

        await yeniServis.baslatBildirimDinleyicisi();
        await listenerCallback!(yanit);

        expect(mockCallback).toHaveBeenCalledWith('2026-02-13', beklenenNamaz);
      }
    });
  });

  // ==================== MUHAFIZ BILDIRIMI FILTRELEME TESTLERI ====================

  describe('Muhafiz olmayan bildirim yanitlari', () => {
    it('tip muhafiz degilse hicbir islem yapmamali', async () => {
      const yanit = {
        actionIdentifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
        notification: {
          request: {
            identifier: 'vakit_bildirim_ogle',
            content: {
              data: { tip: 'vakit_bildirim', vakit: 'ogle', tarih: '2026-02-13' },
            },
          },
        },
      };

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      expect(LocalNamazServisi.localNamazDurumunuGuncelle).not.toHaveBeenCalled();
    });

    it('vakit veya tarih eksikse islem yapmamali', async () => {
      const yanitEksikVakit = {
        actionIdentifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
        notification: {
          request: {
            identifier: 'muhafiz_2026-02-13_vakit_ogle_seviye_2_dk_30',
            content: {
              data: { tip: 'muhafiz', tarih: '2026-02-13' }, // vakit yok
            },
          },
        },
      };

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanitEksikVakit);

      expect(LocalNamazServisi.localNamazDurumunuGuncelle).not.toHaveBeenCalled();
    });

    it('gecersiz vakit adinda islem yapmamali', async () => {
      const yanit = {
        actionIdentifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
        notification: {
          request: {
            identifier: 'muhafiz_2026-02-13_vakit_gecersiz_seviye_2_dk_30',
            content: {
              data: { tip: 'muhafiz', vakit: 'gecersiz', tarih: '2026-02-13' },
            },
          },
        },
      };

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(yanit);

      expect(LocalNamazServisi.localNamazDurumunuGuncelle).not.toHaveBeenCalled();
    });
  });

  // ==================== KILDIM AKSIYON ISLEM SIRASI TESTLERI ====================

  describe('Kildim aksiyonu islem sirasi', () => {
    it('islem sirasi: AsyncStorage -> callback -> bildirim iptal -> dismiss', async () => {
      const islemSirasi: string[] = [];

      (LocalNamazServisi.localNamazDurumunuGuncelle as jest.Mock).mockImplementation(async () => {
        islemSirasi.push('asyncstorage');
      });

      const mockCallback = jest.fn().mockImplementation(() => {
        islemSirasi.push('callback');
      });
      servis.setOnKildimCallback(mockCallback);

      mockVakitBildirimleriniIptalEt.mockImplementation(async () => {
        islemSirasi.push('bildirim_iptal');
      });

      (Notifications.getPresentedNotificationsAsync as jest.Mock).mockResolvedValue([
        sunulanBildirimOlustur('muhafiz_2026-02-13_vakit_ogle_seviye_2_dk_20'),
      ]);
      (Notifications.dismissNotificationAsync as jest.Mock).mockImplementation(async () => {
        islemSirasi.push('dismiss');
      });

      let listenerCallback: Function;
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
        (cb: Function) => {
          listenerCallback = cb;
          return { remove: jest.fn() };
        }
      );
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);

      await servis.baslatBildirimDinleyicisi();
      await listenerCallback!(muhafizYanitiOlustur('ogle', '2026-02-13'));

      expect(islemSirasi).toEqual(['asyncstorage', 'callback', 'bildirim_iptal', 'dismiss']);
    });
  });

  // ==================== KATEGORI TESTLERI ====================

  describe('Bildirim kategorisi ayarlari', () => {
    it('opensAppToForeground true olmali (killed state icin)', async () => {
      await servis.baslatBildirimDinleyicisi();

      expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
        BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
        expect.arrayContaining([
          expect.objectContaining({
            identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
            options: expect.objectContaining({
              opensAppToForeground: true,
            }),
          }),
        ])
      );
    });
  });
});
