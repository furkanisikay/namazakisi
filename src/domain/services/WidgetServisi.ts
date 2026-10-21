/**
 * Widget Servisi — ana ekran widget'ı ve hızlı ayarlar kutusunun veri kaynağı
 * (issue #275/#276). Android'de widget/kutu; iOS'ta AYNI YÜK Siri / Kısayollar /
 * Spotlight içindir (issue #279): App Intents uygulama JS'i çalışmadan cevap verir
 * ve çizelgeyi `modules/expo-siri-kisayollari` deposundan okur.
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
import { siriVeriYazici } from '../../../modules/expo-siri-kisayollari/src';
import { Logger } from '../../core/utils/Logger';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { widgetKilinanlariOlustur, widgetVerisiOlustur } from '../../core/widget/widgetYuku';
import {
  kayitDegistiDinleyicisiEkle,
  localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';

/** Android `@ReactMethod` void döner, iOS köprüsü `AsyncFunction` (Promise) — ikisi de `await`lenir. */
interface WidgetVeriModulu {
  vakitlerKaydet(json: string): void | Promise<void>;
  kilinanlarKaydet?(json: string): void | Promise<void>;
}

/** İçerik aynı olsa da Android'de vakit yükünün yeniden yazılma aralığı (bkz. `onarimZamaniMi`). */
export const WIDGET_ONARIM_ARALIGI_MS = 60 * 60 * 1000;

/** `LocalNamazServisi` dinleyici yuvasının adı. */
export const WIDGET_DINLEYICI_ADI = 'widget';

const modul = (): WidgetVeriModulu | null => {
  // iOS: Siri/Kısayollar deposu (aynı fonksiyon adları); modül yoksa null → no-op.
  if (Platform.OS === 'ios') return siriVeriYazici();
  if (Platform.OS !== 'android') return null;
  return (NativeModules.WidgetVeri as WidgetVeriModulu | undefined) ?? null;
};

export class WidgetServisi {
  private static instance: WidgetServisi;
  /** Kılınmışlık yazımları SIRALI: hızlı aç/kapa'da eski durum yenisinin üstüne yazılmasın. */
  private kilinanZinciri: Promise<void> = Promise.resolve();
  /**
   * Son BAŞARIYLA yazılan yükler (denetim D-21). İçerik aynıysa native'e gidilmez:
   * Android'de her yazım `commit()` + tüm widget örneklerinin yeniden çizimi + sınır
   * alarmının yeniden kurulumu demektir (başlatıcı sürecini uyandırır), iOS'ta
   * `reloadAllTimelines` WidgetKit'in günlük bütçesinden yer. Hafıza bellek-içidir:
   * süreç yeniden başlayınca bir kez yazılır (zararsız). Yazım reddedilirse hafıza
   * GÜNCELLENMEZ → sonraki çağrı yeniden dener.
   */
  private sonVakitYuku: string | null = null;
  private sonVakitYazimMs = 0;
  private sonKilinanYuku: string | null = null;

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
   * nöbetçisidir: Gine Körfezi vakitleri yazılmaz. Modül yoksa no-op.
   */
  public async vakitleriyaz(koordinatlar: { lat: number; lng: number }): Promise<void> {
    const m = modul();
    if (!m || !koordinatGecerliMi(koordinatlar)) return;
    try {
      const json = JSON.stringify(widgetVerisiOlustur(koordinatlar, bugunuAl()));
      if (json === this.sonVakitYuku && !this.onarimZamaniMi()) return;
      await m.vakitlerKaydet(json);
      this.sonVakitYuku = json;
      this.sonVakitYazimMs = Date.now();
    } catch (e) {
      Logger.error('WidgetServisi', 'Widget verisi kaydedilemedi', e);
    }
  }

  /**
   * ANDROID ONARIMI: native yazım widget'ın vakit SINIRI alarmını da yeniden kurar
   * (`WidgetGuncelleyici.tumunuGuncelle`). Zincir bir sebeple koparsa (OEM alarmı düşürdü)
   * eskiden 15 dk'da bir kendiliğinden onarılıyordu; içerik aynı olsa da saatte bir
   * yazılır ki bu güvenlik ağı kaybolmasın. iOS'ta zaman çizelgesini sistem yönetir ve
   * her tazeleme WidgetKit bütçesinden yer → orada onarım YOK.
   */
  private onarimZamaniMi(): boolean {
    return Platform.OS === 'android' && Date.now() - this.sonVakitYazimMs >= WIDGET_ONARIM_ARALIGI_MS;
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
      const json = JSON.stringify(widgetKilinanlariOlustur(kayit.veri));
      if (json === this.sonKilinanYuku) return;
      await m.kilinanlarKaydet(json);
      this.sonKilinanYuku = json;
    } catch (e) {
      Logger.warn('WidgetServisi', 'Widget kilinmislik verisi yazilamadi', e);
    }
  }

  /** Yalnız testler için. */
  public __testIcinSifirla(): void {
    this.kilinanZinciri = Promise.resolve();
    this.sonVakitYuku = null;
    this.sonVakitYazimMs = 0;
    this.sonKilinanYuku = null;
  }
}
