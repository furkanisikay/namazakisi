/**
 * Widget Servisi — ana ekran widget'ı ve hızlı ayarlar kutusunun veri kaynağı
 * (issue #275/#276). Yalnız Android.
 *
 * Veri akışı: adhan (`core/widget/widgetYuku.ts`) → WidgetServisi → `WidgetVeri`
 * native modülü → SharedPreferences → `WidgetGuncelleyici.kt` (widget + kutu HEMEN
 * tazelenir).
 *
 * İKİ YAZIM:
 * - `vakitleriyaz(koordinat)`: dün + 8 günlük vakit çizelgesi. Konuma bağlı
 *   tüketicidir → `App.tsx` açılışı + `KonumDegisikligiServisi` + 15 dk arka plan görevi.
 * - `kilinanlariYaz()`: dün + bugünün kılınmışlığı. Kılınmışlık her değiştiğinde
 *   (`LocalNamazServisi` gözlemcisi, `baslat`) çağrılır → uygulamada, bildirimde ya da
 *   saatte yapılan işaretleme ≤ 1 sn'de widget'a yansır.
 *
 * Store'a BAĞIMLI DEĞİLDİR: headless görevde (Redux yok) de çalışır.
 */
import { NativeModules, Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { widgetKilinanlariOlustur, widgetVerisiOlustur } from '../../core/widget/widgetYuku';
import {
  kayitDegistiDinleyicisiEkle,
  localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';

interface WidgetVeriModulu {
  vakitlerKaydet(json: string): void;
  kilinanlarKaydet?(json: string): void;
}

/** `LocalNamazServisi` dinleyici yuvasının adı. */
export const WIDGET_DINLEYICI_ADI = 'widget';

const modul = (): WidgetVeriModulu | null => {
  if (Platform.OS !== 'android') return null;
  return (NativeModules.WidgetVeri as WidgetVeriModulu | undefined) ?? null;
};

export class WidgetServisi {
  private static instance: WidgetServisi;
  /** Kılınmışlık yazımları SIRALI: hızlı aç/kapa'da eski durum yenisinin üstüne yazılmasın. */
  private kilinanZinciri: Promise<void> = Promise.resolve();

  public static getInstance(): WidgetServisi {
    if (!WidgetServisi.instance) {
      WidgetServisi.instance = new WidgetServisi();
    }
    return WidgetServisi.instance;
  }

  /** Kılınmışlık her değiştiğinde widget'ı tazele (idempotent — adlı yuva). */
  public baslat(): void {
    if (!modul()) return;
    kayitDegistiDinleyicisiEkle(WIDGET_DINLEYICI_ADI, () => {
      this.kilinanlariYaz().catch(() => undefined);
    });
  }

  /**
   * Verilen koordinatlar için dün + 8 günlük vakitleri yazar. (0,0) "konum yok"
   * nöbetçisidir: Gine Körfezi vakitleri yazılmaz. Android dışında no-op.
   */
  public async vakitleriyaz(koordinatlar: { lat: number; lng: number }): Promise<void> {
    const m = modul();
    if (!m || !koordinatGecerliMi(koordinatlar)) return;
    try {
      m.vakitlerKaydet(JSON.stringify(widgetVerisiOlustur(koordinatlar, bugunuAl())));
    } catch (e) {
      Logger.error('WidgetServisi', 'Widget verisi kaydedilemedi', e);
    }
  }

  /** Dün + bugünün kılınmışlığını yazar (gece yarısından sonra yatsı dünündür). */
  public kilinanlariYaz(): Promise<void> {
    const tur = this.kilinanZinciri.then(() => this.kilinanTuru());
    this.kilinanZinciri = tur.catch(() => undefined);
    return tur;
  }

  private async kilinanTuru(): Promise<void> {
    const m = modul();
    if (!m?.kilinanlarKaydet) return;
    try {
      const bugun = bugunuAl();
      const kayit = await localTarihAraligindakiNamazlariGetir(gunEkle(bugun, -1), bugun);
      if (!kayit.basarili || !kayit.veri) return;
      m.kilinanlarKaydet(JSON.stringify(widgetKilinanlariOlustur(kayit.veri)));
    } catch (e) {
      Logger.warn('WidgetServisi', 'Widget kilinmislik verisi yazilamadi', e);
    }
  }

  /** Yalnız testler için. */
  public __testIcinSifirla(): void {
    this.kilinanZinciri = Promise.resolve();
  }
}
