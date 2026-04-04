/**
 * Widget Servisi — Hesaplanan namaz vakitlerini Android home screen widget'ı için
 * native SharedPreferences'a yazar.
 *
 * Veri akışı: adhan.js → WidgetServisi → WidgetVeriModulu.kt → SharedPreferences → NamazWidget.kt
 */

import { NativeModules, Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Logger } from '../../core/utils/Logger';

interface WidgetVakitVeri {
  vakit: 'sabah' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
  ms: number;
}

interface WidgetVerisi {
  tarih: string; // YYYY-MM-DD
  vakitler: WidgetVakitVeri[]; // Kronolojik sırada, 3 günlük veri
}

const { WidgetVeri } = NativeModules;

export class WidgetServisi {
  private static instance: WidgetServisi;

  public static getInstance(): WidgetServisi {
    if (!WidgetServisi.instance) {
      WidgetServisi.instance = new WidgetServisi();
    }
    return WidgetServisi.instance;
  }

  /**
   * Verilen koordinatlar için bugün, yarın ve 2 gün sonrasının namaz vakitlerini
   * hesaplayıp widget SharedPreferences'ına yazar.
   *
   * Android dışında no-op.
   */
  public async vakitleriyaz(koordinatlar: { lat: number; lng: number }): Promise<void> {
    if (Platform.OS !== 'android' || !WidgetVeri) {
      return;
    }

    try {
      const coordinates = new Coordinates(koordinatlar.lat, koordinatlar.lng);
      const params = CalculationMethod.Turkey();

      const vakitler: WidgetVakitVeri[] = [];

      for (let gunOffset = 0; gunOffset < 3; gunOffset++) {
        const tarih = new Date();
        tarih.setDate(tarih.getDate() + gunOffset);

        const prayerTimes = new PrayerTimes(coordinates, tarih, params);

        vakitler.push({ vakit: 'sabah', ms: prayerTimes.fajr.getTime() });
        vakitler.push({ vakit: 'gunes', ms: prayerTimes.sunrise.getTime() });
        vakitler.push({ vakit: 'ogle', ms: prayerTimes.dhuhr.getTime() });
        vakitler.push({ vakit: 'ikindi', ms: prayerTimes.asr.getTime() });
        vakitler.push({ vakit: 'aksam', ms: prayerTimes.maghrib.getTime() });
        vakitler.push({ vakit: 'yatsi', ms: prayerTimes.isha.getTime() });
      }

      // Kronolojik sırala (adhan zaten sıralı üretir ama güvenlik için)
      vakitler.sort((a, b) => a.ms - b.ms);

      const bugun = new Date();
      const tarihStr = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;

      const verisi: WidgetVerisi = { tarih: tarihStr, vakitler };

      WidgetVeri.vakitlerKaydet(JSON.stringify(verisi));
    } catch (e) {
      Logger.error('WidgetServisi', 'Widget verisi kaydedilemedi', e);
    }
  }
}
