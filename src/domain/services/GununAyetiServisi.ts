/**
 * Günün ayeti servisi — native yüzeylerin (ayet widget'ı, duvar kâğıdı, iOS widget ve
 * Kısayollar eylemi) TEK veri kaynağı. Plan JS'te kurulur (`core/icerik/gununAyetiYuku.ts`),
 * native ayet seçmez ve vakit hesaplamaz.
 *
 * Yazım noktaları: açılış (`App.tsx`), konum değişimi (`KonumDegisikligiServisi`, ikiz liste),
 * arka plan görevi, dil değişimi ve duvar kâğıdı ayarı. İçerik aynıysa native'e gidilmez (D-21);
 * plan 14 gün olduğundan günlük arka plan yazımı planı hep ileride tutar.
 *
 * Store'a BAĞIMLI DEĞİLDİR: headless görevde de çalışır.
 */
import { NativeModules, Platform } from 'react-native';
import { siriVeriYazici } from '../../../modules/expo-siri-kisayollari/src';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import {
  duvarAyariNormalize,
  gununAyetiYukuOlustur,
  koordinatImsakKaynagi,
  koordinatVakitKaynagi,
  type DuvarKagidiAyari,
} from '../../core/icerik/gununAyetiYuku';
import type { SaatAlaniKaynagi } from '../../core/icerik/duvarTasarimi';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from '../../data/local/Depolama';

interface AyetYazici {
  gununAyetiKaydet?(json: string): void | Promise<void>;
}

/** Android `WidgetVeri` köprüsünün widget sabitleme yöntemleri (eski ikilide yok). */
interface WidgetSabitleyici {
  widgetSabitlemeDestekleniyorMu?(): Promise<boolean>;
  gununAyetiWidgetiniSabitle?(): Promise<boolean>;
}

const widgetKoprusu = (): WidgetSabitleyici | null =>
  Platform.OS === 'android' ? ((NativeModules.WidgetVeri as WidgetSabitleyici | undefined) ?? null) : null;

/**
 * Kilit ekranı görüntüsünün son uygulanan kilit görseliyle karşılaştırması (native): satır başına
 * farklı piksel oranı ya da neden ölçülemediği. Android `DuvarKagidi` ve iOS siri modülü aynı şekli
 * döner; eski ikilide yöntem yoktur.
 */
export type KilitEkraniProfili = { profil: number[] } | { hata: 'referans-yok' | 'okunamadi' | 'oran' };
type KilitProfiliKoprusu = { kilitEkraniProfili?: (uri: string) => Promise<KilitEkraniProfili> };

/** Android `DuvarKagidi` native modülü (iOS'ta yok). */
interface DuvarKagidiModulu extends KilitProfiliKoprusu {
  durum(): Promise<{ izinli: boolean; sonHata?: string | null }>;
  simdiUygula(): Promise<boolean>;
}

export interface DuvarKagidiDurumu {
  /** Bu platform/cihaz duvar kâğıdını uygulamadan değiştirebilir mi? */
  destekli: boolean;
  /** Sistem (iş/okul yönetimi) engelliyor mu? */
  engelli: boolean;
  /** Son otomatik değişim başarısız oldu mu? */
  sonHataVar: boolean;
}

const yazici = (): AyetYazici | null => {
  if (Platform.OS === 'ios') return siriVeriYazici() as AyetYazici | null;
  if (Platform.OS !== 'android') return null;
  return (NativeModules.WidgetVeri as AyetYazici | undefined) ?? null;
};

const duvarModulu = (): DuvarKagidiModulu | null =>
  Platform.OS === 'android' ? ((NativeModules.DuvarKagidi as DuvarKagidiModulu | undefined) ?? null) : null;

export class GununAyetiServisi {
  private static instance: GununAyetiServisi;
  private sonYuk: string | null = null;
  private sonKoordinat: { lat: number; lng: number } | null = null;

  public static getInstance(): GununAyetiServisi {
    if (!GununAyetiServisi.instance) GununAyetiServisi.instance = new GununAyetiServisi();
    return GununAyetiServisi.instance;
  }

  public async duvarAyariOku(): Promise<DuvarKagidiAyari> {
    return duvarAyariNormalize(await Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.GUNUN_AYETI_DUVAR).catch(() => null));
  }

  /** Ayarı kaydeder ve yükü hemen yeniden yazar (native yeni ayarla planlar). */
  public async duvarAyariKaydet(ayar: DuvarKagidiAyari): Promise<void> {
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.GUNUN_AYETI_DUVAR, ayar);
    await this.yaz(this.sonKoordinat);
  }

  /** Kilit ekranı saat alanının kaynağı; yoksa, bozuksa ya da okunamazsa `null`. ASLA reddetmez. */
  public async saatAlaniKaynagiOku(): Promise<SaatAlaniKaynagi | null> {
    try {
      const ham = await Depolama.ham(DEPOLAMA_ANAHTARLARI.GUNUN_AYETI_SAAT_KAYNAGI);
      return ham === 'olcum' || ham === 'elle' ? ham : null;
    } catch {
      return null;
    }
  }

  /** Kaynağı yazar; `null` anahtarı siler (alan varsayılana döndü). */
  public async saatAlaniKaynagiKaydet(kaynak: SaatAlaniKaynagi | null): Promise<void> {
    if (kaynak) await Depolama.hamYaz(DEPOLAMA_ANAHTARLARI.GUNUN_AYETI_SAAT_KAYNAGI, kaynak);
    else await Depolama.sil(DEPOLAMA_ANAHTARLARI.GUNUN_AYETI_SAAT_KAYNAGI);
  }

  /**
   * 14 günlük planı native'e yazar. `koordinat` verilmezse son bilinen kullanılır; o da yoksa
   * gün sınırı 05:00'e düşer (konum gelince yeniden yazılır). ASLA reddetmez.
   */
  public async yaz(koordinat?: { lat: number; lng: number } | null): Promise<void> {
    if (koordinat) this.sonKoordinat = koordinat;
    const hedef = yazici();
    if (!hedef?.gununAyetiKaydet) return;
    try {
      const duvar = await this.duvarAyariOku();
      const yuk = JSON.stringify(
        gununAyetiYukuOlustur(new Date(), koordinatImsakKaynagi(this.sonKoordinat), duvar, undefined, undefined, koordinatVakitKaynagi(this.sonKoordinat))
      );
      if (yuk === this.sonYuk) return;
      await hedef.gununAyetiKaydet(yuk);
      this.sonYuk = yuk;
    } catch (e) {
      Logger.warn('GununAyetiServisi', 'Günün ayeti yükü yazılamadı', e);
    }
  }

  public async duvarKagidiDurumu(): Promise<DuvarKagidiDurumu> {
    const modul = duvarModulu();
    if (!modul) return { destekli: false, engelli: false, sonHataVar: false };
    try {
      const d = await modul.durum();
      return { destekli: true, engelli: !d.izinli, sonHataVar: d.sonHata === 'yazilamadi' };
    } catch {
      return { destekli: true, engelli: false, sonHataVar: false };
    }
  }

  /** Bugünün görselini hemen uygular (açma onayından ve ayar değişiminden sonra). */
  public async duvarKagidiniSimdiUygula(): Promise<boolean> {
    const modul = duvarModulu();
    if (!modul) return false;
    await this.yaz();
    try {
      return await modul.simdiUygula();
    } catch (e) {
      Logger.warn('GununAyetiServisi', 'Duvar kâğıdı uygulanamadı', e);
      return false;
    }
  }

  /**
   * Kullanıcının seçtiği kilit ekranı görüntüsünün satır profili (karar `saatAlaniBul`'da). Görüntü
   * yalnız okunur, kopyalanmaz. Köprü yoksa (eski ikili), reddederse ya da bozuk dönerse
   * `{ hata: 'okunamadi' }`; ASLA reddetmez.
   */
  public async kilitEkraniProfili(uri: string): Promise<KilitEkraniProfili> {
    let kopru: KilitProfiliKoprusu | null = null;
    if (Platform.OS === 'android') kopru = duvarModulu();
    else if (Platform.OS === 'ios') {
      try {
        kopru = require('../../../modules/expo-siri-kisayollari/src') as KilitProfiliKoprusu;
      } catch {
        kopru = null;
      }
    }
    if (typeof kopru?.kilitEkraniProfili !== 'function') return { hata: 'okunamadi' };
    try {
      const ham = await kopru.kilitEkraniProfili(uri);
      if (ham && 'profil' in ham && Array.isArray(ham.profil)) return { profil: ham.profil };
      if (ham && 'hata' in ham && (ham.hata === 'referans-yok' || ham.hata === 'oran')) return { hata: ham.hata };
      return { hata: 'okunamadi' };
    } catch (e) {
      Logger.warn('GununAyetiServisi', 'Kilit ekranı görüntüsü ölçülemedi', e);
      return { hata: 'okunamadi' };
    }
  }

  /** Başlatıcı widget'ı uygulamadan eklemeyi destekliyor mu (yalnız Android)? */
  public async widgetSabitlenebilirMi(): Promise<boolean> {
    const k = widgetKoprusu();
    if (!k?.widgetSabitlemeDestekleniyorMu) return false;
    try {
      return (await k.widgetSabitlemeDestekleniyorMu()) === true;
    } catch {
      return false;
    }
  }

  /** Başlatıcının "ana ekrana ekle" penceresini açar; açılamazsa `false`. */
  public async widgetiSabitle(): Promise<boolean> {
    const k = widgetKoprusu();
    if (!k?.gununAyetiWidgetiniSabitle) return false;
    await this.yaz();
    try {
      return (await k.gununAyetiWidgetiniSabitle()) === true;
    } catch (e) {
      Logger.warn('GununAyetiServisi', 'Widget sabitlenemedi', e);
      return false;
    }
  }
}
