import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NamazAdi, BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../data/local/LocalNamazServisi';
import { ArkaplanMuhafizServisi, VakitAdi } from './ArkaplanMuhafizServisi';
import { VakitSayacBildirimServisi } from './VakitSayacBildirimServisi';
import { gunEkle } from '../../core/utils/TarihYardimcisi';
import { Logger } from '../../core/utils/Logger';

/**
 * Vakit adi donusturme - ArkaplanMuhafizServisi'nin kullandigi format ile NamazAdi enum arasinda
 * Export edildi: notifee background handler tarafindan kullaniliyor
 */
export const vakitAdiToNamazAdi: Record<string, NamazAdi> = {
  'imsak': NamazAdi.Sabah,
  'gunes': NamazAdi.Gunes,
  'ogle': NamazAdi.Ogle,
  'ikindi': NamazAdi.Ikindi,
  'aksam': NamazAdi.Aksam,
  'yatsi': NamazAdi.Yatsi,
};

/**
 * String'in gecerli bir VakitAdi olup olmadigini kontrol et
 */
function isVakitAdi(vakit: string): vakit is VakitAdi {
  return ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'].includes(vakit);
}

/**
 * Onceki muhafiz bildirimlerini bildirim merkezinden temizle
 * Yeni bildirim geldiginde sadece AYNI VAKTin eski bildirimlerini temizler
 * Farkli vakitlerin bildirimleri korunur
 */
async function oncekiMuhafizBildirimleriniTemizle(yeniBildirimId: string): Promise<void> {
  try {
    const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();

    // Yeni bildirimin vakit onekini cikar (ornegin: "muhafiz_2025-02-13_vakit_iksam")
    // ID format: muhafiz_YYYY-MM-DD_vakit_VAKITADI_seviye_X_dk_Y
    const vakitOnekMatch = yeniBildirimId.match(
      new RegExp(`^(${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}\\d{4}-\\d{2}-\\d{2}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}[a-z]+)`)
    );
    const yeniVakitOneki = vakitOnekMatch ? vakitOnekMatch[1] : null;

    for (const bildirim of mevcutBildirimler) {
      // Ayni vaktin eski muhafiz bildirimi mi ve yeni gelen bildirim degil mi?
      if (
        bildirim.request.identifier !== yeniBildirimId &&
        yeniVakitOneki &&
        bildirim.request.identifier.startsWith(yeniVakitOneki)
      ) {
        await Notifications.dismissNotificationAsync(bildirim.request.identifier);
      }
    }
  } catch (error) {
    Logger.error('BildirimServisi', 'Onceki muhafiz bildirimleri temizlenirken hata:', error);
  }
}

/**
 * Vakit onekini bildirim ID'sinden cikar
 * Ornek: "muhafiz_2026-03-10_vakit_ikindi_seviye_2_dk_15" → "muhafiz_2026-03-10_vakit_ikindi"
 */
function vakitOnekiniCikar(bildirimId: string): string | null {
  const eslesme = bildirimId.match(
    new RegExp(`^(${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}\\d{4}-\\d{2}-\\d{2}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}[a-z]+)`)
  );
  return eslesme ? eslesme[1] : null;
}

/**
 * Bildirim ayarlarini yapilandir
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Eger bu bir muhafiz bildirimiyse, onceki muhafiz bildirimlerini temizle
      if (notification.request.identifier.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)) {
        await oncekiMuhafizBildirimleriniTemizle(notification.request.identifier);
      }

      return {
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
    },
  });
} catch (_) {}

/**
 * Bildirim response listener subscription
 */
let responseListenerSubscription: Notifications.EventSubscription | null = null;

/**
 * Kildim aksiyonu callback tipi
 * Domain katmanindan presentation katmanina olay bildirimi icin kullanilir
 */
type KildimCallback = (tarih: string, namazAdi: NamazAdi) => void;

export class BildirimServisi {
  private static instance: BildirimServisi;
  private kategorilerOlusturuldu: boolean = false;
  private islenmisYanitId: string | null = null; // Cold-start tekrar isleme korumasi
  private onKildimCallback: KildimCallback | null = null;

  private constructor() { }

  /**
   * Kildim aksiyonu callback'ini ayarla
   * Presentation katmani bu callback uzerinden Redux store'u gunceller
   * Bu sayede domain katmani store'a dogrudan bagimli olmaz
   */
  public setOnKildimCallback(callback: KildimCallback): void {
    this.onKildimCallback = callback;
  }

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

    // Cold-start kontrolu: Uygulama bildirim aksiyonuyla baslatildiysa
    // getLastNotificationResponseAsync ile kacirilmis aksiyonu yakala
    try {
      const sonYanit = await Notifications.getLastNotificationResponseAsync();
      if (sonYanit) {
        await this.bildirimYanitiniIsle(sonYanit);
      }
    } catch (error) {
      Logger.error('BildirimServisi', 'Cold-start bildirim kontrolu hatasi:', error);
    }

    Logger.info('BildirimServisi', 'Bildirim dinleyicisi baslatildi');
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
      await Notifications.setNotificationCategoryAsync(BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ, [
        {
          identifier: BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM,
          buttonTitle: '✅ Kıldım',
          options: {
            opensAppToForeground: true, // Uygulama oldurulmus olsa bile aksiyonun calismasi icin true
          },
        },
      ]);

      this.kategorilerOlusturuldu = true;
      Logger.info('BildirimServisi', 'Bildirim kategorileri olusturuldu');
    } catch (error) {
      Logger.error('BildirimServisi', 'Kategori olusturma hatasi:', error);
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

    // Ayni yaniti tekrar isleme (cold-start + listener cift tetikleme korumasi)
    const yanitId = notification.request.identifier + '_' + actionIdentifier;
    if (this.islenmisYanitId === yanitId) {
      Logger.info('BildirimServisi', 'Yanit zaten islendi, atlaniyor:', yanitId);
      return;
    }

    const data = notification.request.content.data as {
      tip?: string;
      vakit?: string;
      tarih?: string;
      seviye?: number;
    };

    Logger.info('BildirimServisi', 'Bildirim yaniti alindi:', {
      actionIdentifier,
      data,
    });

    // Muhafiz bildirimi mi?
    if (data?.tip !== 'muhafiz') {
      return;
    }

    // "Kildim" aksiyonuna mi tiklandi?
    if (actionIdentifier === BILDIRIM_SABITLERI.AKSIYONLAR.KILDIM) {
      try {
        await this.kildimAksiyonunuIsle(data.vakit, data.tarih);
        // Basariyla islendikten sonra tekrar islemeyi engelle
        this.islenmisYanitId = yanitId;
      } catch (error) {
        // Basarisiz oldu - yanitId set edilmez, boylece retry mumkun
        Logger.error('BildirimServisi', 'Kildim isleme basarisiz, tekrar denenebilir:', error);
      }
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
      Logger.error('BildirimServisi', 'Vakit veya tarih eksik');
      return;
    }

    try {
      // Vakit adini NamazAdi enum'una donustur
      const namazAdi = vakitAdiToNamazAdi[vakit];
      if (!namazAdi) {
        Logger.error('BildirimServisi', 'Gecersiz vakit:', vakit);
        return;
      }

      // Namaz durumunu guncelle
      await LocalNamazServisi.localNamazDurumunuGuncelle(tarih, namazAdi, true);
      Logger.info('BildirimServisi', `Namaz kilindi: ${namazAdi} (${tarih})`);

      // Presentation katmanini bilgilendir (UI guncellemesi icin)
      if (this.onKildimCallback) {
        try {
          this.onKildimCallback(tarih, namazAdi);
        } catch (callbackError) {
          Logger.warn('BildirimServisi', 'Kildim callback hatasi:', callbackError);
        }
      }

      if (!isVakitAdi(vakit)) {
        Logger.warn('BildirimServisi', 'Vakit adı doğrulanamadı, iptal işlemi atlandı:', vakit);
      }
      // Zamanlanmış/aktif tüm vakit bildirimlerini temizle
      await this.vakitKilindiTemizle(vakit, tarih);

      Logger.info('BildirimServisi', `${vakit} icin kalan bildirimler iptal edildi`);
    } catch (error) {
      Logger.error('BildirimServisi', 'Kildim aksiyonu isleme hatasi:', error);
      throw error; // Hatayi yukari ilet (deduplikasyon retry mekanizmasi icin)
    }
  }

  /**
   * Namaz kılındığında tüm vakit bildirimlerini temizler:
   * zamanlanmış muhafız bildirimleri, vakit sayacı ve bildirim merkezindeki aktif bildirimler.
   * AnaSayfa (uygulama içi toggle) ve kildimAksiyonunuIsle (bildirimden "Kıldım") tarafından kullanılır.
   */
  public async vakitKilindiTemizle(vakit: string, tarih: string): Promise<void> {
    const gorevler: Promise<void>[] = [this.vakitBildirimleriniKapat(vakit, tarih)];
    if (isVakitAdi(vakit)) {
      gorevler.push(ArkaplanMuhafizServisi.getInstance().vakitBildirimleriniIptalEt(vakit));
      gorevler.push(VakitSayacBildirimServisi.getInstance().vakitSayaciniIptalEt(vakit));
    }
    await Promise.allSettled(gorevler);
  }

  /**
   * Sadece belirli bir vakte ait muhafiz bildirimlerini bildirim merkezinden kapat
   * Diger vakitlerin bildirimleri korunur
   */
  private async vakitBildirimleriniKapat(vakit: string, tarih: string): Promise<void> {
    try {
      const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();
      // Timezone-safe: gunEkle YYYY-MM-DD string uzerinde calisir, new Date() UTC sorununa yol acmaz
      const dunStr = gunEkle(tarih, -1);

      // Prefix'leri dongu disinda hesapla (performans)
      const bugunOneki = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`;
      const dunOneki = `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${dunStr}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}`;

      const kapatilacaklar = mevcutBildirimler
        .map(b => b.request.identifier)
        .filter(id => id.startsWith(bugunOneki) || id.startsWith(dunOneki));

      await Promise.all(kapatilacaklar.map(id => Notifications.dismissNotificationAsync(id)));
    } catch (error) {
      Logger.error('BildirimServisi', 'Vakit bildirimleri kapatilirken hata:', error);
    }
  }

  /**
   * Bildirim merkezindeki eski muhafiz bildirimlerini temizle
   * Her vakit icin yalnizca en son gosterilen bildirimi tutar, daha eskileri siler
   * Uygulama on plana geldiginde veya ilk basladiginda cagrilir (arka plan senaryosu icin)
   */
  public async sunulanEskiMuhafizBildirimleriniTemizle(): Promise<void> {
    try {
      const mevcutBildirimler = await Notifications.getPresentedNotificationsAsync();

      // Muhafiz bildirimlerini vakit onekine gore grupla
      const vakitGruplari = new Map<string, Array<{ id: string; date: number }>>();

      for (const bildirim of mevcutBildirimler) {
        const id = bildirim.request.identifier;
        if (!id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ)) continue;

        const vakitOneki = vakitOnekiniCikar(id);
        if (!vakitOneki) continue;

        if (!vakitGruplari.has(vakitOneki)) {
          vakitGruplari.set(vakitOneki, []);
        }
        vakitGruplari.get(vakitOneki)!.push({ id, date: bildirim.date });
      }

      // Her vakit grubu icin en son bildirimi tut, daha eskileri sil
      for (const [, bildirimler] of vakitGruplari) {
        if (bildirimler.length <= 1) continue;

        // Tarihe gore sirala (buyukten kucuge) - en son = en buyuk tarih
        bildirimler.sort((a, b) => b.date - a.date);

        // Ilki (en son) haric diger bildirimleri kaldir
        for (let i = 1; i < bildirimler.length; i++) {
          await Notifications.dismissNotificationAsync(bildirimler[i].id);
        }
      }

      Logger.info('BildirimServisi', 'Eski muhafiz bildirimleri temizlendi');
    } catch (error) {
      Logger.error('BildirimServisi', 'Eski muhafiz bildirimleri temizlenirken hata:', error);
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
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.VARSAYILAN, {
        name: 'Genel Bildirimler',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Muhafiz kanali (normal)
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ, {
        name: 'Namaz Muhafızı',
        description: 'Namaz vakti hatırlatmaları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF9500',
        sound: 'bildirim.mp3',
      });

      // Muhafiz acil kanali (seviye 3-4)
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL, {
        name: 'Acil Namaz Hatırlatıcı',
        description: 'Vakit çıkmak üzere - acil hatırlatmalar',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000, 500, 1000],
        lightColor: '#FF3B30',
        sound: 'bildirim.mp3',
        enableVibrate: true,
        bypassDnd: true,
      });

      // Vakit Bildirimleri kanali
      await Notifications.setNotificationChannelAsync(BILDIRIM_SABITLERI.KANALLAR.VAKIT_BILDIRIM, {
        name: 'Vakit Bildirimleri',
        description: 'Vakit girdiğinde gönderilen hatırlatmalar',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
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
      Logger.error('BildirimServisi', 'Bildirim planlanamadı:', error);
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
