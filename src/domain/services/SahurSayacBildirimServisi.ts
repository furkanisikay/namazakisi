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

import { hatirlatmaKurulabilirMi } from '../../data/local/LocalCihazRoluServisi';
import { AndroidStyle } from '@notifee/react-native';
import { Platform } from 'react-native';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { Coordinates } from 'adhan';
import { aktifPrayerTimes } from '../../core/vakit/aktifHesap';
import { BILDIRIM_SABITLERI } from '../../core/constants/UygulamaSabitleri';
import { SayacBildirimTemeli, SayacKonfig } from './SayacBildirimTemeli';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import { metin } from '../../core/dil/aktifDil';
import { sahurCanliYukuOlustur } from '../../core/sayac/canliGuncelleme';

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
      kanalAdi: metin().sayac.sahur.kanal,
      kanalAciklamasi: metin().sayac.sahur.kanalAciklama,
      countdownBaslik: metin().sayac.sahur.baslik,
      countdownBodyTemplate: `${metin().sayac.sahur.govde}\n⏱️ {time}`,
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
    // Now Bar (issue #282): kapalıyken planlayıcıya "aday yok" denir.
    if (!ayarlar.aktif || !(await hatirlatmaKurulabilirMi())) return this.canliKaynagiBildir('sahurSayac', []);

    await this.kanalOlustur();

    const { lat, lng } = ayarlar.koordinatlar;
    const coordinates = new Coordinates(lat, lng);
    const simdi = new Date();

    const prayerTimesBugun = aktifPrayerTimes(coordinates, simdi);
    const imsakBugun = prayerTimesBugun.fajr;
    const yatsiBugun = prayerTimesBugun.isha;

    const yarin = new Date(simdi);
    yarin.setDate(yarin.getDate() + 1);
    const prayerTimesYarin = aktifPrayerTimes(coordinates, yarin);
    const imsakYarin = prayerTimesYarin.fajr;

    // Özel gün (issue #272): sayaç, hedeflediği imsakla BAŞLAYAN oruç günü
    // içindir (imsak + 10 dk'ya kadar bugünün imsağı, sonra yarınınki). O gün
    // özel günse (hayız/nifas → oruç tutulmaz) sahur sayacı kurulmaz; eski plan
    // yukarıda temizlendi. Özel günün SON gecesinde ertesi günün sahuru kurulur.
    const hedefImsak =
      simdi.getTime() < imsakBugun.getTime() + 10 * 60 * 1000 ? imsakBugun : imsakYarin;
    const ozelGundeMi = await ozelGunSuzgeciniOku();
    if (ozelGundeMi(tarihiISOFormatinaCevir(hedefImsak))) return this.canliKaynagiBildir('sahurSayac', []);

    const bugunTarihStr = bugunuAl();
    const bildirimId = `${BILDIRIM_SABITLERI.ONEKLEME.SAHUR_SAYAC}${bugunTarihStr}`;
    const vakitGirdiId = `${bildirimId}_vakitgirdi`;
    const temizlemeId = `${bildirimId}_bitis`;

    // Now Bar (issue #282 ikinci aşama): sahur penceresi (yatsı → imsak) planlayıcıya
    // bildirilir. Android 16'da öğe açıksa planlayıcı tam yatsıda (exact alarm)
    // gösterir — gündüz kurulan plan artık arka plan turunu beklemez — ve bu servis
    // kendi bildirimini kurmaz.
    const dunTarihi = new Date(simdi);
    dunTarihi.setDate(dunTarihi.getDate() - 1);
    const yatsiDun = aktifPrayerTimes(coordinates, dunTarihi).isha;
    const pencere =
      simdi.getTime() < imsakBugun.getTime()
        ? { yatsi: yatsiDun, imsak: imsakBugun }
        : simdi.getTime() < imsakBugun.getTime() + 10 * 60 * 1000
          ? null
          : { yatsi: yatsiBugun, imsak: imsakYarin };
    const karar = await this.canliKarari('sahur');
    await this.canliKaynagiBildir(
      'sahurSayac',
      pencere
        ? [
            this.canliAdayi(
              'sahur',
              bildirimId,
              pencere.yatsi.getTime(),
              pencere.imsak.getTime(),
              sahurCanliYukuOlustur({ yatsiMs: pencere.yatsi.getTime(), imsakMs: pencere.imsak.getTime() })
            ),
          ]
        : []
    );

    if (simdi.getTime() < imsakBugun.getTime()) {
      // Gece yarisini gecmisiz, imsak (sahur) vaktine dogru ilerliyoruz
      const imsakArti10 = new Date(imsakBugun.getTime() + 10 * 60 * 1000);
      // Live Update (issue #282): ilerleme = DÜNÜN yatsısından bugünün imsağına.
      if (!karar.devralir) {
        this.nativeCountdownBaslat(
          bildirimId,
          imsakBugun.getTime(),
          karar.oneCikar
            ? sahurCanliYukuOlustur({ yatsiMs: yatsiDun.getTime(), imsakMs: imsakBugun.getTime() })
            : undefined
        );
      }
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
      if (!karar.devralir) {
        this.nativeCountdownBaslat(
          bildirimId,
          imsakYarin.getTime(),
          karar.oneCikar
            ? sahurCanliYukuOlustur({ yatsiMs: yatsiBugun.getTime(), imsakMs: imsakYarin.getTime() })
            : undefined
        );
      }
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
      title: metin().sayac.sahur.girdiBaslik,
      body: metin().sayac.sahur.girdiGovde,
      android: {
        channelId: this.konfig.kanalId,
        ongoing: true,
        autoCancel: false,
        pressAction: { id: 'default' },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: metin().sayac.sahur.girdiUzun,
        },
      },
    };
  }
}
