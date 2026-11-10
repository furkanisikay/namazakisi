/**
 * Günün ayeti native yükü (sözleşme v1, `docs/ajan/gunun-ayeti.md`) ve duvar kâğıdı ayarı — SAF.
 *
 * Duvar kâğıdı ayarı CİHAZA ÖZGÜDÜR ve YEDEKLENMEZ: duvar kâğıdını değiştirmek o cihazda verilen
 * açık onaya bağlıdır; yedekten dönen bir kayıt yeni cihazda onaysız açılmamalı.
 */
import { Coordinates } from 'adhan';
import { aktifDil, sozluk } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import { aktifPrayerTimes } from '../vakit/aktifHesap';
import { aktifNamazGunu, gununAyetiPlani, type GununAyetiPlanKaydi, type ImsakKaynagi } from './gununAyeti';
import {
  DUVAR_GOKLERI,
  fotoAyariNormalize,
  GOK_SAHNELERI,
  susAyariNormalize,
  VARSAYILAN_FOTO,
  VARSAYILAN_SUS,
  VARSAYILAN_YAZI,
  yaziAyariNormalize,
  type DuvarFotoAyari,
  type DuvarGogu,
  type DuvarSusAyari,
  type DuvarYaziAyari,
  type GokSahnesi,
  type GunVakitleri,
  type SaatAlani,
  saatAlaniNormalize,
  vaktinGogu,
} from './duvarTasarimi';

export type DuvarYeri = 'kilit' | 'ana' | 'ikisi';
/** Düz zeminler + vakit gökleri (`duvarTasarimi.GOK_SAHNELERI`) + kullanıcının fotoğrafı. */
export type DuvarZemini = 'gece' | 'kagit' | 'palet' | DuvarGogu | 'foto';

export interface DuvarKagidiAyari {
  acik: boolean;
  yer: DuvarYeri;
  zemin: DuvarZemini;
  /** Sahip kararı: varsayılan KAPALI. */
  arapca: boolean;
  /** `palet` zemininin rengi (seçildiği andaki tema rengi). */
  paletRenk: string;
  /**
   * Zemin bir vakit göğüyse gün içinde o anki vaktin göğüne geçer (sahip kararı 2026-11-07:
   * varsayılan AÇIK). Android'de her vakit sınırında yeniden yazılır; iPhone'da Kısayollar
   * görseli çalıştığı anın göğünü çizer.
   */
  vakteUysun: boolean;
  yazi: DuvarYaziAyari;
  sus: DuvarSusAyari;
  foto: DuvarFotoAyari;
  /** Kilit ekranında saatin kapladığı alan (bu cihazda ölçülen/ayarlanan); `null` = platform varsayılanı. */
  saatAlani: SaatAlani | null;
}

export const VARSAYILAN_DUVAR_AYARI: DuvarKagidiAyari = {
  acik: false,
  yer: 'kilit',
  zemin: 'imsak',
  arapca: false,
  paletRenk: '#2E7D32',
  vakteUysun: true,
  yazi: VARSAYILAN_YAZI,
  sus: VARSAYILAN_SUS,
  foto: VARSAYILAN_FOTO,
  saatAlani: null,
};

const YERLER: readonly DuvarYeri[] = ['kilit', 'ana', 'ikisi'];
const ZEMINLER: readonly DuvarZemini[] = ['gece', 'kagit', 'palet', ...DUVAR_GOKLERI, 'foto'];

/** Bozuk ya da eksik kayıt varsayılanla tamamlanır. */
export function duvarAyariNormalize(ham: unknown): DuvarKagidiAyari {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Partial<Record<keyof DuvarKagidiAyari, unknown>>;
  return {
    acik: k.acik === true,
    yer: YERLER.includes(k.yer as DuvarYeri) ? (k.yer as DuvarYeri) : VARSAYILAN_DUVAR_AYARI.yer,
    zemin: ZEMINLER.includes(k.zemin as DuvarZemini) ? (k.zemin as DuvarZemini) : VARSAYILAN_DUVAR_AYARI.zemin,
    arapca: k.arapca === true,
    paletRenk:
      typeof k.paletRenk === 'string' && /^#[0-9A-Fa-f]{6}$/.test(k.paletRenk) ? k.paletRenk : VARSAYILAN_DUVAR_AYARI.paletRenk,
    vakteUysun: k.vakteUysun !== false,
    yazi: yaziAyariNormalize(k.yazi),
    sus: susAyariNormalize(k.sus),
    foto: fotoAyariNormalize(k.foto),
    saatAlani: saatAlaniNormalize(k.saatAlani),
  };
}

export interface GununAyetiYuku {
  v: 1;
  dil: DilKodu;
  metin: { etiket: string; sigmiyor: string; acin: string; arapcaKaynagi: string };
  plan: (Omit<GununAyetiPlanKaydi, 'tamKunye'> & { vakitler?: GunVakitleri })[];
  duvar: DuvarKagidiAyari;
  /** Vakit gökleri (tek kaynak `duvarTasarimi.GOK_SAHNELERI`); native sanatı yeniden tanımlamaz. */
  sahneler: Readonly<Record<DuvarGogu, GokSahnesi>>;
}

/** Bir namaz gününün vakitleri; konum yoksa null (vakte uyan gök o gün kullanıcının seçtiği gökte kalır). */
export type VakitKaynagi = (tarih: Date) => GunVakitleri | null;

/** Koordinattan imsak kaynağı; konum yoksa her gün `null` (plan 05:00 sınırına düşer). */
export function koordinatImsakKaynagi(koordinat: { lat: number; lng: number } | null): ImsakKaynagi {
  if (!koordinat || (koordinat.lat === 0 && koordinat.lng === 0)) return () => null;
  const c = new Coordinates(koordinat.lat, koordinat.lng);
  return (tarih) => aktifPrayerTimes(c, tarih).fajr;
}

/** Koordinattan günün vakitleri (imsak, güneş, ikindi, akşam, yatsı); konum yoksa null. */
export function koordinatVakitKaynagi(koordinat: { lat: number; lng: number } | null): VakitKaynagi {
  if (!koordinat || (koordinat.lat === 0 && koordinat.lng === 0)) return () => null;
  const c = new Coordinates(koordinat.lat, koordinat.lng);
  return (tarih) => {
    const p = aktifPrayerTimes(c, tarih);
    return [p.fajr.getTime(), p.sunrise.getTime(), p.asr.getTime(), p.maghrib.getTime(), p.isha.getTime()];
  };
}

/**
 * O an çizilen ayar: "vakte uysun" açık ve zemin bir gökse, gök o anın vaktine göre seçilir
 * (native `etkinGok` ile aynı: aktif namaz gününün vakitleri; konum yoksa seçilen gök kalır).
 * Ayar sayfasındaki önizleme ve iPhone'da elle kaydedilen görsel bunu çizer.
 */
export function anlikDuvarAyari(ayar: DuvarKagidiAyari, simdi: Date, imsak: ImsakKaynagi, vakitler: VakitKaynagi): DuvarKagidiAyari {
  if (!ayar.vakteUysun || !(DUVAR_GOKLERI as readonly string[]).includes(ayar.zemin)) return ayar;
  const gun = aktifNamazGunu(simdi, imsak);
  const v = vakitler(new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), 12));
  if (!v) return ayar;
  const gok = vaktinGogu(simdi.getTime(), v);
  return gok === ayar.zemin ? ayar : { ...ayar, zemin: gok };
}

export function gununAyetiYukuOlustur(
  simdi: Date,
  imsak: ImsakKaynagi,
  duvar: DuvarKagidiAyari,
  dil: DilKodu = aktifDil(),
  gunSayisi = 14,
  vakitler: VakitKaynagi = () => null
): GununAyetiYuku {
  const m = sozluk(dil).gununAyeti;
  return {
    v: 1,
    dil,
    metin: { etiket: m.etiket, sigmiyor: m.sigmiyor, acin: m.acin, arapcaKaynagi: m.arapcaKaynagi },
    plan: gununAyetiPlani(simdi, imsak, gunSayisi, dil).map(({ tamKunye: _tam, ...kayit }) => {
      const [yil, ay, gun] = kayit.gun.split('-').map(Number);
      const v = vakitler(new Date(yil, ay - 1, gun, 12));
      return v ? { ...kayit, vakitler: v } : kayit;
    }),
    duvar,
    sahneler: GOK_SAHNELERI,
  };
}
