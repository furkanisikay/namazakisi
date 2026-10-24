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
  type DuvarKagidiAyari,
} from '../../core/icerik/gununAyetiYuku';
import { Logger } from '../../core/utils/Logger';
import { Depolama } from '../../data/local/Depolama';

interface AyetYazici {
  gununAyetiKaydet?(json: string): void | Promise<void>;
}

/** Android `DuvarKagidi` native modülü (iOS'ta yok). */
interface DuvarKagidiModulu {
  durum(): Promise<{ izinli: boolean; sonHata?: string | null }>;
  simdiUygula(): Promise<boolean>;
  onizlemeUret(genislik: number, yukseklik: number): Promise<string>;
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
      const yuk = JSON.stringify(gununAyetiYukuOlustur(new Date(), koordinatImsakKaynagi(this.sonKoordinat), duvar));
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

  /** Bugünün görselinin önizlemesi (yerel dosya adresi); üretilemezse `null`. */
  public async duvarOnizlemesi(genislik: number, yukseklik: number): Promise<string | null> {
    const modul = duvarModulu();
    if (!modul) return null;
    await this.yaz();
    try {
      return await modul.onizlemeUret(Math.round(genislik), Math.round(yukseklik));
    } catch {
      return null;
    }
  }
}
