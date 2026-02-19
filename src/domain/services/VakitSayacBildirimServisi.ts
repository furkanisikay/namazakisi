/**
 * Vakit Sayacı Bildirim Servisi
 *
 * Notifee kullanarak Android chronometer ile gerçek zamanlı dk:sn geri sayımı gösterir.
 * Her vakit için tek bir trigger notification yeterli - chronometer Android sistemi
 * tarafından otomatik güncellenir.
 */

import notifee, { TriggerType, AndroidImportance, TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI, BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';

export type VakitAdi = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

interface VakitZamani {
  vakit: VakitAdi;
  giris: Date;
  cikis: Date;
  tarih: string; // YYYY-MM-DD formatında vakit günü
}

interface SayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
  seviye2Esik: number; // Dakika (muhafiz seviye 2 başlangıcı)
}

export class VakitSayacBildirimServisi {
  private static instance: VakitSayacBildirimServisi;
  private ayarlar: SayacAyarlari | null = null;
  private kanalOlusturuldu: boolean = false;

  private constructor() {}

  public static getInstance(): VakitSayacBildirimServisi {
    if (!VakitSayacBildirimServisi.instance) {
      VakitSayacBildirimServisi.instance = new VakitSayacBildirimServisi();
    }
    return VakitSayacBildirimServisi.instance;
  }

  /**
   * Servisi yapılandır ve bildirimleri planla
   */
  public async yapilandirVePlanla(ayarlar: SayacAyarlari): Promise<void> {
    this.ayarlar = ayarlar;

    // Önce tüm sayaç bildirimlerini temizle
    await this.tumSayacBildirimleriniTemizle();

    // iOS'ta desteklenmiyor
    if (Platform.OS !== 'android') {
      console.log('[VakitSayac] iOS desteklenmiyor, atlanıyor');
      return;
    }

    // Aktif değilse bitir
    if (!ayarlar.aktif) {
      console.log('[VakitSayac] Sayaç devre dışı');
      return;
    }

    // notifee kanalını oluştur (ilk seferinde)
    await this.kanalOlustur();

    // Bugünün vakit zamanlarını hesapla
    const vakitler = this.bugunVakitleriniHesapla();
    const simdi = new Date();

    // Kılınan vakitleri al (bugün ve dün için - gece yarısı geçişleri)
    const kilinanBugun = await this.tarihIcinKilinanVakitleriAl(this.bugunTarihiAl());
    const kilinanDun = await this.tarihIcinKilinanVakitleriAl(this.dunTarihiAl());
    const kilinanMap: Record<string, VakitAdi[]> = {
      [this.bugunTarihiAl()]: kilinanBugun,
      [this.dunTarihiAl()]: kilinanDun,
    };

    // Çıkış süresi henüz geçmemiş VE kılınmamış vakitler için planlama yap
    const gelecekVakitler = vakitler.filter(v => {
      // Vakit zamanı geçmiş mi?
      if (v.cikis.getTime() <= simdi.getTime()) {
        return false;
      }

      // Güneş vakti değil (namaz olarak kılınmaz)
      if (v.vakit === 'gunes') {
        return false;
      }

      // Bu vakit kılınmış mı?
      const tarihinKilinanVakitleri = kilinanMap[v.tarih] || [];
      if (tarihinKilinanVakitleri.includes(v.vakit)) {
        console.log(`[VakitSayac] ${v.vakit} (${v.tarih}) zaten kılınmış, atlanıyor`);
        return false;
      }

      return true;
    });

    if (gelecekVakitler.length === 0) {
      console.log('[VakitSayac] Gelecek veya kılınmamış vakit bulunamadı');
      return;
    }

    for (const vakit of gelecekVakitler) {
      await this.vakitIcinSayacPlanla(vakit);
    }

    console.log(`[VakitSayac] Toplam ${gelecekVakitler.length} vakit için sayaç planlandı`);
  }

  /**
   * notifee kanalını oluştur
   */
  private async kanalOlustur(): Promise<void> {
    if (this.kanalOlusturuldu) {
      return;
    }

    try {
      // Eski kanali sil (LOW importance, Samsung'da gorunmuyor)
      try { await notifee.deleteChannel('vakit_sayac'); } catch (_) {}

      await notifee.createChannel({
        id: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
        name: 'Vakit Sayacı',
        description: 'Vakit çıkmadan önce geri sayım bildirimi',
        importance: AndroidImportance.DEFAULT,
        vibration: false,
        sound: '', // Sessiz
      });

      this.kanalOlusturuldu = true;
      console.log('[VakitSayac] notifee kanalı oluşturuldu');
    } catch (error) {
      console.error('[VakitSayac] Kanal oluşturulamadı:', error);
    }
  }

  /**
   * Bugün için tüm namaz vakitlerini hesapla
   * ArkaplanMuhafizServisi ile aynı mantık
   */
  private bugunVakitleriniHesapla(): VakitZamani[] {
    if (!this.ayarlar) return [];

    const { lat, lng } = this.ayarlar.koordinatlar;
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Turkey();
    const simdi = new Date();

    const bugunTarih = new Date(simdi);
    const dunTarih = new Date(simdi);
    dunTarih.setDate(dunTarih.getDate() - 1);
    const yarinTarih = new Date(simdi);
    yarinTarih.setDate(yarinTarih.getDate() + 1);

    const bugunPrayerTimes = new PrayerTimes(coordinates, bugunTarih, params);
    const dunPrayerTimes = new PrayerTimes(coordinates, dunTarih, params);
    const yarinPrayerTimes = new PrayerTimes(coordinates, yarinTarih, params);

    const formatDate = (d: Date) => {
      const yil = d.getFullYear();
      const ay = String(d.getMonth() + 1).padStart(2, '0');
      const gun = String(d.getDate()).padStart(2, '0');
      return `${yil}-${ay}-${gun}`;
    };

    const bugunStr = formatDate(bugunTarih);
    const dunStr = formatDate(dunTarih);

    const vakitler: VakitZamani[] = [];

    // Eğer şu an imsak vaktinden önceyse, dünün yatsı vakti hala aktiftir
    if (simdi < bugunPrayerTimes.fajr) {
      vakitler.push({
        vakit: 'yatsi',
        giris: dunPrayerTimes.isha,
        cikis: bugunPrayerTimes.fajr,
        tarih: dunStr, // Düne ait!
      });
    }

    // Bugünün vakitleri
    vakitler.push(
      {
        vakit: 'imsak',
        giris: bugunPrayerTimes.fajr,
        cikis: bugunPrayerTimes.sunrise,
        tarih: bugunStr,
      },
      {
        vakit: 'ogle',
        giris: bugunPrayerTimes.dhuhr,
        cikis: bugunPrayerTimes.asr,
        tarih: bugunStr,
      },
      {
        vakit: 'ikindi',
        giris: bugunPrayerTimes.asr,
        cikis: bugunPrayerTimes.maghrib,
        tarih: bugunStr,
      },
      {
        vakit: 'aksam',
        giris: bugunPrayerTimes.maghrib,
        cikis: bugunPrayerTimes.isha,
        tarih: bugunStr,
      },
      {
        vakit: 'yatsi',
        giris: bugunPrayerTimes.isha,
        cikis: yarinPrayerTimes.fajr,
        tarih: bugunStr,
      }
    );

    return vakitler;
  }

  /**
   * Belirli bir vakit için sayaç bildirimi planla
   * Her vakit için 2 trigger notification:
   * 1. Seviye 2 zamanında başlayan chronometer countdown
   * 2. Vakit çıkışında replace + otomatik kapanma
   */
  private async vakitIcinSayacPlanla(vakit: VakitZamani): Promise<void> {
    if (!this.ayarlar) return;

    const simdi = new Date();
    const cikisSuresi = vakit.cikis.getTime();
    const seviye2Baslangic = cikisSuresi - (this.ayarlar.seviye2Esik * 60 * 1000);

    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${vakit.tarih}_${vakit.vakit}`;

    const vakitAdlari: Record<VakitAdi, string> = {
      imsak: 'Sabah',
      gunes: 'Güneş',
      ogle: 'Öğle',
      ikindi: 'İkindi',
      aksam: 'Akşam',
      yatsi: 'Yatsı',
    };

    // A) Geri sayım bildirimi
    const bildirimIcerigi = {
      id: bildirimId,
      title: `⏱️ ${vakitAdlari[vakit.vakit]} Namazı`,
      body: 'Vakit çıkmak üzere! Namazını kıl!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
        ongoing: true, // Kaydırılamaz
        autoCancel: false,
        showChronometer: true, // Chronometer göster
        chronometerCountDown: true, // Geri sayım modu
        timestamp: cikisSuresi, // Hedef zaman (vakit çıkışı)
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
        actions: [
          {
            title: '✅ Kıldım',
            pressAction: { id: 'kildim' },
          },
        ],
      },
    };

    // Seviye 2 başlangıç zamanı
    const tetikZamani = Math.max(seviye2Baslangic, simdi.getTime() + 5000);

    // Eğer zaten seviye 2 aralığındaysak hemen göster
    if (tetikZamani <= simdi.getTime() + 5000) {
      try {
        await notifee.displayNotification(bildirimIcerigi);
        console.log(`[VakitSayac] ${vakit.vakit} için sayaç hemen gösterildi`);
      } catch (error) {
        console.error(`[VakitSayac] Bildirim gösterilemedi (${vakit.vakit}):`, error);
      }
    } else {
      // Gelecekte tetiklenecek
      try {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: tetikZamani,
        };
        await notifee.createTriggerNotification(bildirimIcerigi, trigger);
        const tetikTarih = new Date(tetikZamani);
        console.log(`[VakitSayac] ${vakit.vakit} için sayaç planlandı: ${tetikTarih.toLocaleTimeString()}`);
      } catch (error) {
        console.error(`[VakitSayac] Trigger bildirim planlanamadı (${vakit.vakit}):`, error);
      }
    }

    // B) Vakit sonu temizleme (farkli ID - trigger cakismasini onler)
    const temizlemeId = `${bildirimId}_bitis`;
    try {
      const temizlemeTrigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: cikisSuresi,
      };

      await notifee.createTriggerNotification(
        {
          id: temizlemeId,
          title: '',
          body: '',
          android: {
            channelId: BILDIRIM_SABITLERI.KANALLAR.VAKIT_SAYAC,
            ongoing: false,
            autoCancel: true,
            timeoutAfter: 100, // 100ms sonra otomatik kapan
            smallIcon: 'ic_notification',
          },
        },
        temizlemeTrigger
      );

      console.log(`[VakitSayac] ${vakit.vakit} için temizleme planlandı`);
    } catch (error) {
      console.error(`[VakitSayac] Temizleme planlanamadı (${vakit.vakit}):`, error);
    }
  }

  /**
   * Belirli bir vakit için sayaç bildirimini iptal et
   */
  public async vakitSayaciniIptalEt(vakit: VakitAdi): Promise<void> {
    const bugun = this.bugunTarihiAl();
    const dun = this.dunTarihiAl();

    for (const tarih of [bugun, dun]) {
      const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${tarih}_${vakit}`;
      try {
        await notifee.cancelNotification(bildirimId);
        await notifee.cancelTriggerNotification(bildirimId);
        // Temizleme trigger'ini da iptal et
        await notifee.cancelTriggerNotification(`${bildirimId}_bitis`);
        console.log(`[VakitSayac] Bildirim iptal edildi: ${bildirimId}`);
      } catch (error) {
        // Hata olsa bile devam et
      }
    }
  }

  /**
   * Tüm sayaç bildirimlerini temizle
   */
  public async tumSayacBildirimleriniTemizle(): Promise<void> {
    try {
      // Trigger bildirimleri iptal et
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SAYAC)) {
          await notifee.cancelTriggerNotification(id);
        }
      }

      // Görüntülenen bildirimleri temizle
      const gosterilenler = await notifee.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(BILDIRIM_SABITLERI.ONEKLEME.SAYAC)) {
          await notifee.cancelNotification(bildirim.id);
        }
      }

      console.log('[VakitSayac] Tüm sayaç bildirimleri temizlendi');
    } catch (error) {
      console.error('[VakitSayac] Bildirimler temizlenirken hata:', error);
    }
  }

  // ============================================================
  // TARİH YARDIMCI METOTLARI
  // ============================================================

  private bugunTarihiAl(): string {
    const bugun = new Date();
    const yil = bugun.getFullYear();
    const ay = String(bugun.getMonth() + 1).padStart(2, '0');
    const gun = String(bugun.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
  }

  private dunTarihiAl(): string {
    const dun = new Date();
    dun.setDate(dun.getDate() - 1);
    const yil = dun.getFullYear();
    const ay = String(dun.getMonth() + 1).padStart(2, '0');
    const gun = String(dun.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
  }

  /**
   * Belirli bir tarih için kılınan vakitleri al
   * ArkaplanMuhafizServisi ile aynı storage key kullanır
   */
  private async tarihIcinKilinanVakitleriAl(tarih: string): Promise<VakitAdi[]> {
    try {
      const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;
      const veri = await AsyncStorage.getItem(anahtar);
      return veri ? JSON.parse(veri) : [];
    } catch (error) {
      console.error('[VakitSayac] Kılınan vakitler alınamadı:', error);
      return [];
    }
  }
}
