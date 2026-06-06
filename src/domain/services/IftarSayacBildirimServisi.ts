/**
 * Iftar Sayaci Bildirim Servisi
 *
 * Native Kotlin modulu (expo-countdown-notification) kullanarak
 * bildirim body'sinde iftar vaktine geri sayim gosterir.
 * Foreground Service + CountDownTimer ile batarya verimli calisir.
 *
 * - Sabah namazindan sonra aktif olur
 * - Aksam namazi vaktine kalan sureyi body'de gosterir
 * - Vakit girdikten sonra 10 dk boyunca "vakit girdi" bildirimi gosterir
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

interface IftarSayacAyarlari {
  aktif: boolean;
  koordinatlar: { lat: number; lng: number };
}

export class IftarSayacBildirimServisi extends SayacBildirimTemeli {
  private static instance: IftarSayacBildirimServisi;
  private ayarlar: IftarSayacAyarlari | null = null;

  private constructor() { super(); }

  public static getInstance(): IftarSayacBildirimServisi {
    if (!IftarSayacBildirimServisi.instance) {
      IftarSayacBildirimServisi.instance = new IftarSayacBildirimServisi();
    }
    return IftarSayacBildirimServisi.instance;
  }

  protected get konfig(): SayacKonfig {
    return {
      idOneki: BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC,
      kanalId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
      eskiKanalId: 'iftar_sayac',
      kanalAdi: 'İftar Sayacı',
      kanalAciklamasi: 'İftar vaktine geri sayım bildirimi',
      countdownBaslik: '🌙 İftar Sayacı',
      countdownBodyTemplate: 'Ezanı duymadan orucunuzu açmayınız!\n⏱️ {time}',
      themeType: 'iftar',
    };
  }

  /**
   * Servisi yapılandır ve bildirimleri planla
   */
  public async yapilandirVePlanla(ayarlar: IftarSayacAyarlari): Promise<void> {
    this.ayarlar = ayarlar;

    // Önce tüm iftar sayaç bildirimlerini temizle
    await this.tumBildirimleriniTemizle();

    if (Platform.OS !== 'android') return;
    if (!ayarlar.aktif) return;

    await this.kanalOlustur();

    const { lat, lng } = ayarlar.koordinatlar;
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Turkey();
    const simdi = new Date();
    const prayerTimes = new PrayerTimes(coordinates, simdi, params);

    const sabahVakti = prayerTimes.fajr;
    const aksamVakti = prayerTimes.maghrib;
    const aksamArti10 = new Date(aksamVakti.getTime() + 10 * 60 * 1000);

    const bugun = bugunuAl();
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.IFTAR_SAYAC}${bugun}`;
    const vakitGirdiId = `${bildirimId}_vakitgirdi`;
    const temizlemeId = `${bildirimId}_bitis`;

    if (simdi < sabahVakti) {
      // Sabah namazindan once: aksam vaktinde "vakit girdi" goster, aksam+10dk'da temizle
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamVakti) {
      // Sabah ile aksam arasi: hemen native countdown baslat
      this.nativeCountdownBaslat(bildirimId, aksamVakti.getTime());
      await this.vakitGirdiBildirimiPlanla(vakitGirdiId, aksamVakti.getTime());
      await this.temizlemePlanla(temizlemeId, aksamArti10.getTime());
    } else if (simdi < aksamArti10) {
      // Aksam ile aksam+10dk arasi: "vakit girdi" hemen goster
      await this.vakitGirdiBildirimiHemenGoster(vakitGirdiId, aksamVakti.getTime());
    }
    // Aksam + 10 dk'dan sonra: hicbir sey gosterme
  }

  /**
   * "Vakit girdi" bildirim icerigi - 10 dk sonra otomatik kapanir (autoCancel)
   */
  protected vakitGirdiBildirimIcerigi(bildirimId: string, _aksamVaktiMs: number): any {
    return {
      id: bildirimId,
      title: '🌙 İftar Vakti!',
      body: 'Hayırlı iftarlar!',
      android: {
        channelId: BILDIRIM_SABITLERI.KANALLAR.IFTAR_SAYAC,
        ongoing: false,
        autoCancel: true,
        timeoutAfter: 10 * 60 * 1000, // 10 dakika sonra otomatik kapanır
        pressAction: { id: 'default' },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: 'Hayırlı iftarlar!\n\n⚠️ Ezanı duymadan orucunuzu açmayınız! Duanızda bize de yer vermeyi unutmayın :)',
        },
      },
    };
  }
}
