/**
 * adhan köprüsü — bir takvim gününün farz vakitlerini `GunVakitleri` olarak üretir.
 *
 * Uygulamanın tamamıyla AYNI hesap: `CalculationMethod.Turkey()`, gün bazında ayrı
 * `PrayerTimes` (AGENTS.md). Saf hesap (`nafileVakitleri.ts`) adhan'a bağımlı
 * değildir; bu dosya ikisini birleştirir.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { ISOTarihiDateNesnesiNeCevir, gunEkle } from '../utils/TarihYardimcisi';
import { nafilePencereleriHesapla, type GunVakitleri, type NafilePencere } from './nafileVakitleri';

export interface NafileKoordinat {
    lat: number;
    lng: number;
}

/** `{0,0}` "konum henüz yapılandırılmadı" nöbetçisidir (Gine Körfezi'ne göre hesap yapılmaz). */
export const koordinatGecerliMi = (k: NafileKoordinat | null | undefined): k is NafileKoordinat =>
    !!k &&
    Number.isFinite(k.lat) &&
    Number.isFinite(k.lng) &&
    !(k.lat === 0 && k.lng === 0);

/** Bir ISO günün ('YYYY-MM-DD') farz vakitleri. */
export function gunVakitleriniHesapla(koordinat: NafileKoordinat, isoGun: string): GunVakitleri {
    const pt = new PrayerTimes(
        new Coordinates(koordinat.lat, koordinat.lng),
        ISOTarihiDateNesnesiNeCevir(isoGun),
        CalculationMethod.Turkey()
    );
    return {
        imsak: pt.fajr,
        gunes: pt.sunrise,
        ogle: pt.dhuhr,
        ikindi: pt.asr,
        aksam: pt.maghrib,
        yatsi: pt.isha,
    };
}

/**
 * Bir GÜNÜN nafile pencereleri (teheccüd o günün gecesidir: yatsı → ertesi imsak).
 * Taban aktif gündür: gece yarısından sonra çağıran DÜNÜ geçmelidir.
 */
export function gununNafilePencereleri(koordinat: NafileKoordinat, isoGun: string): NafilePencere[] {
    const gun = gunVakitleriniHesapla(koordinat, isoGun);
    const ertesi = gunVakitleriniHesapla(koordinat, gunEkle(isoGun, 1));
    return nafilePencereleriHesapla(gun, ertesi.imsak);
}
