import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../data/local/LocalNamazServisi';

/**
 * Bildirim ID onek sabiti (ArkaplanMuhafizServisi ile eslesir)
 */
const MUHAFIZ_BILDIRIM_ONEK = 'muhafiz_';

/**
 * Muhafiz bildirim aksiyonlari
 */
export const MUHAFIZ_AKSIYONLARI = {
  KILDIM: 'kildim_action',
} as const;

/**
 * Muhafiz bildirim kategorisi
 */
export const MUHAFIZ_KATEGORISI = 'muhafiz_category';

/**
 * Vakit adi donusturme - ArkaplanMuhafizServisi'nin kullandigi format ile NamazAdi enum arasinda
 */
const vakitAdiToNamazAdi: Record<string, NamazAdi> = {
  'imsak': NamazAdi.Sabah,
  'gunes': NamazAdi.Gunes,
  'ogle': NamazAdi.Ogle,
  'ikindi': NamazAdi.Ikindi,
  'aksam': NamazAdi.Aksam,
  'yatsi': NamazAdi.Yatsi,
};

/**
 * Onceki muhafiz bildirimlerini bildirim merkezinden temizle
 * Yeni bildirim geldiginde eski bildirimlerin birikmesini onler
 */
async function oncekiMuhafizBildirimleriniTemizle(yeniBildirimId: string): Promise<void> {
  try {
    const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();

    for (const bildirim of mevcutBildirimler) {
      // Muhafiz bildirimi mi ve yeni gelen bildirim degil mi?
      if (
        bildirim.request.identifier.startsWith(MUHAFIZ_BILDIRIM_ONEK) &&
        bildirim.request.identifier !== yeniBildirimId
      ) {
        await Notifications.dismissNotificationAsync(bildirim.request.identifier);
      }
    }
  } catch (error) {
    console.error('[BildirimServisi] Onceki muhafiz bildirimleri temizlenirken hata:', error);
  }
}

/**
 * Belirli bir vakit icin planlanan tum bildirimleri iptal et
 * @param vakit Vakit adi (imsak, ogle, ikindi, aksam, yatsi)
 * @param tarih Vakit tarihi (YYYY-MM-DD)
 */
async function vakitBildirimleriniIptalEt(vakit: string, tarih: string): Promise<void> {
  try {
    const tumBildirimler = await Notifications.getAllScheduledNotificationsAsync();
    const bildirimOneki = `${MUHAFIZ_BILDIRIM_ONEK}${tarih}_vakit_${vakit}`;

    for (const bildirim of tumBildirimler) {
      if (bildirim.identifier.startsWith(bildirimOneki)) {
        await Notifications.cancelScheduledNotificationAsync(bildirim.identifier);
        console.log(`[BildirimServisi] Bildirim iptal edildi: ${bildirim.identifier}`);
      }
    }
  } catch (error) {
    console.error('[BildirimServisi] Vakit bildirimleri iptal edilirken hata:', error);
  }
}

/**
 * Bildirim ayarlarini yapilandir
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Eger bu bir muhafiz bildirimiyse, onceki muhafiz bildirimlerini temizle
    if (notification.request.identifier.startsWith(MUHAFIZ_BILDIRIM_ONEK)) {
      await oncekiMuhafizBildirimleriniTemizle(notification.request.identifier);
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

/**
 * Bildirim kanallari
 */
const BILDIRIM_KANALLARI = {
  VARSAYILAN: 'default',
  MUHAFIZ: 'muhafiz',
  MUHAFIZ_ACIL: 'muhafiz_acil',
};

/**
 * Bildirim response listener subscription
 */
let responseListenerSubscription: Notifications.EventSubscription | null = null;

/**
 * Uygulama bildirimlerini yoneten servis
 */
export class BildirimServisi {
  private static instance: BildirimServisi;
  private kategorilerOlusturuldu: boolean = false;

  private constructor() { }

  public static getInstance(): BildirimServisi {
    if (!BildirimServisi.instance) {
      BildirimServisi.instance = new BildirimServisi();
    }
    return BildirimServisi.instance;
  }

  /**
   * Bildirim dinleyicisini baslat
   * Uygulama basladiginda cagrilmali
   */
  public async baslatBildirimDinleyicisi(): Promise<void> {
    // Kategorileri olustur
    await this.kategorileriOlustur();

    // Eger zaten listener varsa kaldir
    if (responseListenerSubscription) {
      responseListenerSubscription.remove();
    }

    // Yeni listener ekle
    responseListenerSubscription = Notifications.addNotificationResponseReceivedListener(
      this.bildirimYanitiniIsle.bind(this)
    );

    console.log('[BildirimServisi] Bildirim dinleyicisi baslatildi');
  }

  /**
   * Bildirim kategorilerini olustur
   */
  private async kategorileriOlustur(): Promise<void> {
    if (this.kategorilerOlusturuldu) {
      return;
    }

    try {
      // Muhafiz kategorisi - "Kildim" aksiyonu ile
      await Notifications.setNotificationCategoryAsync(MUHAFIZ_KATEGORISI, [
        {
          identifier: MUHAFIZ_AKSIYONLARI.KILDIM,
          buttonTitle: '✅ Kıldım',
          options: {
            opensAppToForeground: false, // Uygulama acilmadan islem yapilsin
          },
        },
      ]);

      this.kategorilerOlusturuldu = true;
      console.log('[BildirimServisi] Bildirim kategorileri olusturuldu');
    } catch (error) {
      console.error('[BildirimServisi] Kategori olusturma hatasi:', error);
    }
  }

  /**
   * Bildirim yanitini isle
   * Kullanici bildirim aksiyonuna tikladiginda cagrilir
   */
  private async bildirimYanitiniIsle(
    response: Notifications.NotificationResponse
  ): Promise<void> {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data as {
      tip?: string;
      vakit?: string;
      tarih?: string;
      seviye?: number;
    };

    console.log('[BildirimServisi] Bildirim yaniti alindi:', {
      actionIdentifier,
      data,
    });

    // Muhafiz bildirimi mi?
    if (data?.tip !== 'muhafiz') {
      return;
    }

    // "Kildim" aksiyonuna mi tiklandi?
    if (actionIdentifier === MUHAFIZ_AKSIYONLARI.KILDIM) {
      await this.kildimAksiyonunuIsle(data.vakit, data.tarih);
    }
  }

  /**
   * "Kildim" aksiyonunu isle
   * Namaz durumunu guncelle ve kalan bildirimleri iptal et
   */
  private async kildimAksiyonunuIsle(
    vakit: string | undefined,
    tarih: string | undefined
  ): Promise<void> {
    if (!vakit || !tarih) {
      console.error('[BildirimServisi] Vakit veya tarih eksik');
      return;
    }

    try {
      // Vakit adini NamazAdi enum'una donustur
      const namazAdi = vakitAdiToNamazAdi[vakit];
      if (!namazAdi) {
        console.error('[BildirimServisi] Gecersiz vakit:', vakit);
        return;
      }

      // Namaz durumunu guncelle
      await LocalNamazServisi.localNamazDurumunuGuncelle(tarih, namazAdi, true);
      console.log(`[BildirimServisi] Namaz kilindi: ${namazAdi} (${tarih})`);

      // Bu vakit icin kalan tum bildirimleri iptal et
      await vakitBildirimleriniIptalEt(vakit, tarih);

      // Bildirim merkezindeki bu bildirimi de kapat
      await Notifications.dismissAllNotificationsAsync();

      console.log(`[BildirimServisi] ${vakit} icin kalan bildirimler iptal edildi`);
    } catch (error) {
      console.error('[BildirimServisi] Kildim aksiyonu isleme hatasi:', error);
    }
  }

  /**
   * Bildirim izinlerini kontrol et ve iste
   */
  public async izinIste(): Promise<boolean> {
    const { status: mevcutDurum } = await Notifications.getPermissionsAsync();
    let finalDurum = mevcutDurum;

    if (mevcutDurum !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalDurum = status;
    }

    if (finalDurum !== 'granted') {
      return false;
    }

    // Android icin bildirim kanallarini olustur
    if (Platform.OS === 'android') {
      // Varsayilan kanal
      await Notifications.setNotificationChannelAsync(BILDIRIM_KANALLARI.VARSAYILAN, {
        name: 'Genel Bildirimler',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Muhafiz kanali (normal)
      await Notifications.setNotificationChannelAsync(BILDIRIM_KANALLARI.MUHAFIZ, {
        name: 'Namaz Muhafızı',
        description: 'Namaz vakti hatırlatmaları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF9500',
        sound: 'bildirim.mp3',
      });

      // Muhafiz acil kanali (seviye 3-4)
      await Notifications.setNotificationChannelAsync(BILDIRIM_KANALLARI.MUHAFIZ_ACIL, {
        name: 'Acil Namaz Hatırlatıcı',
        description: 'Vakit çıkmak üzere - acil hatırlatmalar',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
        lightColor: '#FF3B30',
        sound: 'bildirim.mp3',
        enableVibrate: true,
        bypassDnd: true,
      });
    }

    return true;
  }

  /**
   * Anlik bildirim gonder (Yerel)
   */
  public async anlikBildirimGonder(baslik: string, mesaj: string, veri: any = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: baslik,
        body: mesaj,
        data: veri,
        sound: true,
      },
      trigger: null, // Hemen gonder
    });
  }

  /**
   * Belirli bir zaman icin bildirim planla
   */
  public async bildirimPlanla(
    id: string,
    baslik: string,
    mesaj: string,
    saat: number,
    dakika: number,
    tekrarla: boolean = true
  ) {
    // Once varsa eski bildirimi iptal et
    await this.bildirimIptalEt(id);

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: baslik,
          body: mesaj,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: saat,
          minute: dakika,
        },
      });
    } catch (error) {
      console.error('Bildirim planlanamadı:', error);
    }
  }


  /**
   * Planli bildirimi iptal et
   */
  public async bildirimIptalEt(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Tum planli bildirimleri iptal et
   */
  public async tumBildirimleriIptalEt() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
