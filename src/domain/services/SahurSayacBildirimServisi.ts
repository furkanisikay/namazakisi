/**
 * Sahur Sayaci Bildirim Servisi
 *
 * Native Kotlin modulu (expo-countdown-notification) kullanarak
 * bildirim body'sinde imsak (sahur) vaktine geri sayim gosterir.
 * Foreground Service + CountDownTimer ile batarya verimli calisir.
 *
 * - Yatsi namazindan sonra aktif olur
 * - Imsak vaktine kalan sureyi body'de gosterir
 * - Imsak girdikten sonra 10 dk boyunca "imsak girdi" bildirimi gosterir
 * - 10 dk sonra otomatik kaybolur
 *
 * Ortak mekanikler (kanal, temizleme, trigger planlama) SayacBildirimTemeli'nde.
 */

import { AndroidStyle } from '@notifee/react-native';
import { Platform } from 'react-native';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { SayacBildirimTemeli, SayacKonfig } from './SayacBildirimTemeli';

interface SahurSayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
}

export class SahurSayacBildirimServisi extends SayacBildirimTemeli {
  private static instance: SahurSayacBildirimServisi;
  private ayarlar: SahurSayacAyarlari | null = null;

  private constructor() { super(); }

  public static getInstance(): SahurSayacBildirimServisi {
    if (!SahurSayacBildirimServisi.instance) {
      SahurSayacBildirimServisi.instance = new SahurSayacBildirimServisi();
    }
    return SahurSayacBildirimServisi.instance;
  }

  protected get konfig(): SayacKonfig {
    return {
      idOneki: BILDIRIM_SABITLERI.ONEKLEME.SAHUR_SAYAC,
      kanalId: BILDIRIM_SABITLERI.KANALLAR.SAHUR_SAYAC,
      eskiKanalId: 'sahur_sayac',
      kanalAdi: 'Sahur Sayacı',
      kanalAciklamasi: 'İmsak (Sahur bitiş) vaktine geri sayım bildirimi',
      countdownBaslik: '🌙 Sahur Sayacı',
      countdownBodyTemplate: 'Yemeye içmeye devam, imsak yaklaşıyor!\n⏱️ {time}',
      themeType: 'sahur',
    };
  }

  /**
   * Servisi yapılandır ve bildirimleri planla
   */
  public async yapilandirVePlanla(ayarlar: SahurSayacAyarlari): Promise<void> {
    this.ayarlar = ayarlar;

    // Önce tüm sahur sayaç bildirimlerini temizle
    await this.tumBildirimleriniTemizle();

    if (Platform.OS !== 'android') return;
    if (!ayarlar.aktif) return;

    await this.kanalOlustur();

    const { lat, lng } = ayarlar.koordinatlar;
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Turkey();
    const simdi = new Date();

    const prayerTimesBugun = new PrayerTimes(coordinates, simdi, params);
    const imsakBugun = prayerTimesBugun.fajr;
    const yatsiBugun = prayerTimesBugun.isha;

    const yarin = new Date(simdi);
    yarin.setDate(yarin.getDate() + 1);
    const prayerTimesYarin = new PrayerTimes(coordinates, yarin, params);
    const imsakYarin = prayerTimesYarin.fajr;

    const bugunTarihStr = bugunuAl();
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAHUR_SAYAC}${bugunTarihStr}`;
    const vakitGirdiId = `${bildirimId}_vakitgirdi`;
    const temizlemeId = `${bildirimId}_bitis`;

    if (simdi.getTime() < imsakBugun.getTime()) {
      // Gece yarisini gecmisiz, imsak (sahur) vaktine dogru ilerliyoruz
      const imsakArti10 = new Date(imsakBugun.getTime() + 10 * 60 * 1000);
      this.nativeCountdownBaslat(bildirimId, imsakBugun.getTime());
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, imsakBugun.getTime());
      await this.temizlemePlanla(temizlemeId, imsakArti10.getTime());
    } else if (simdi.getTime() < imsakBugun.getTime() + 10 * 60 * 1000) {
      // Imsak yeni girmis, 10 dk boyunca vakit girdi bildirimi kalsin
      const imsakArti10 = new Date(imsakBugun.getTime() + 10 * 60 * 1000);
      await this.vakitGirdiBildirimiHemenGoster(vakitGirdiId, imsakBugun.getTime());
      await this.temizlemePlanla(temizlemeId, imsakArti10.getTime());
    } else if (simdi.getTime() < yatsiBugun.getTime()) {
      // Gunduz vakti, sahur sayaci BUGUN YATSI VAKTINDE baslayacak
      const imsakArti10Yarin = new Date(imsakYarin.getTime() + 10 * 60 * 1000);
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, imsakYarin.getTime());
      await this.temizlemePlanla(temizlemeId, imsakArti10Yarin.getTime());
    } else {
      // Yatsi vaktini gecmisiz (aksam/gece vakti), yarin sabahki imsak hedefimiz
      const imsakArti10Yarin = new Date(imsakYarin.getTime() + 10 * 60 * 1000);
      this.nativeCountdownBaslat(bildirimId, imsakYarin.getTime());
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, imsakYarin.getTime());
      await this.temizlemePlanla(temizlemeId, imsakArti10Yarin.getTime());
    }
  }

  /**
   * "Vakit girdi" bildirim icerigi - imsak girince, kullanici kapatana kadar kalir (ongoing)
   */
  protected vakitGirdiBildirimIcerigi(bildirimId: string, _imsakVaktiMs: number): any {
    return {
      id: bildirimId,
      title: '🌙 Sahur Vakti Bitti!',
      body: 'Niyet etme vakti geldi.',
      android: {
        channelId: this.konfig.kanalId,
        ongoing: true,
        autoCancel: false,
        pressAction: { id: 'default' },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: 'İmsak vakti girdi, niyet etmeyi unutmayınız!\n\n⚠️ Sabah namazınızı eda edebilirsiniz. Duanızda bize de yer vermeyi unutmayın :)',
        },
      },
    };
  }
}
