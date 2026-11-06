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
import { gununAyetiPlani, type GununAyetiPlanKaydi, type ImsakKaynagi } from './gununAyeti';

export type DuvarYeri = 'kilit' | 'ana' | 'ikisi';
export type DuvarZemini = 'gece' | 'kagit' | 'palet';

export interface DuvarKagidiAyari {
  acik: boolean;
  yer: DuvarYeri;
  zemin: DuvarZemini;
  /** Sahip kararı: varsayılan KAPALI. */
  arapca: boolean;
  /** `palet` zemininin rengi (seçildiği andaki tema rengi). */
  paletRenk: string;
}

export const VARSAYILAN_DUVAR_AYARI: DuvarKagidiAyari = {
  acik: false,
  yer: 'kilit',
  zemin: 'gece',
  arapca: false,
  paletRenk: '#2E7D32',
};

const YERLER: readonly DuvarYeri[] = ['kilit', 'ana', 'ikisi'];
const ZEMINLER: readonly DuvarZemini[] = ['gece', 'kagit', 'palet'];

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
  };
}

export interface GununAyetiYuku {
  v: 1;
  dil: DilKodu;
  metin: { etiket: string; sigmiyor: string; acin: string; arapcaKaynagi: string };
  plan: Omit<GununAyetiPlanKaydi, 'tamKunye'>[];
  duvar: DuvarKagidiAyari;
}

/** Koordinattan imsak kaynağı; konum yoksa her gün `null` (plan 05:00 sınırına düşer). */
export function koordinatImsakKaynagi(koordinat: { lat: number; lng: number } | null): ImsakKaynagi {
  if (!koordinat || (koordinat.lat === 0 && koordinat.lng === 0)) return () => null;
  const c = new Coordinates(koordinat.lat, koordinat.lng);
  return (tarih) => aktifPrayerTimes(c, tarih).fajr;
}

export function gununAyetiYukuOlustur(
  simdi: Date,
  imsak: ImsakKaynagi,
  duvar: DuvarKagidiAyari,
  dil: DilKodu = aktifDil(),
  gunSayisi = 14
): GununAyetiYuku {
  const m = sozluk(dil).gununAyeti;
  return {
    v: 1,
    dil,
    metin: { etiket: m.etiket, sigmiyor: m.sigmiyor, acin: m.acin, arapcaKaynagi: m.arapcaKaynagi },
    plan: gununAyetiPlani(simdi, imsak, gunSayisi, dil).map(({ tamKunye: _tam, ...kayit }) => kayit),
    duvar,
  };
}
