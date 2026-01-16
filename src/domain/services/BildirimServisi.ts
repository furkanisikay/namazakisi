import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Bildirim ayarlarini yapilandir
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
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
 * Uygulama bildirimlerini yoneten servis
 */
export class BildirimServisi {
  private static instance: BildirimServisi;

  private constructor() { }

  public static getInstance(): BildirimServisi {
    if (!BildirimServisi.instance) {
      BildirimServisi.instance = new BildirimServisi();
    }
    return BildirimServisi.instance;
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

      // Muhafız kanalı (normal)
      await Notifications.setNotificationChannelAsync(BILDIRIM_KANALLARI.MUHAFIZ, {
        name: 'Namaz Muhafızı',
        description: 'Namaz vakti hatırlatmaları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF9500',
        sound: 'bildirim.mp3',
      });

      // Muhafız acil kanalı (seviye 3-4)
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


