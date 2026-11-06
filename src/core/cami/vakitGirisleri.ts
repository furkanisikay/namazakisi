/**
 * Camideyim vakit kapısı ve Namaz modu planı için günlük farz vakit girişleri.
 *
 * Uygulamanın tamamıyla AYNI hesap (`gunVakitleriniHesapla` — etkin hesap ayarı,
 * gün bazında ayrı `PrayerTimes`). Native taraf vakit hesaplamaz; bu girişlerden
 * türetilen pencereleri JS gönderir (Wear 8 günlük pencere deseni).
 */
import { gunEkle, ISOTarihiDateNesnesiNeCevir } from '../utils/TarihYardimcisi';
import { gunVakitleriniHesapla, koordinatGecerliMi, type NafileKoordinat } from '../nafile/gunVakitleri';
import type { GunGirisleri } from './camiKarar';

/** Native'e gönderilen pencere ufku: dün (gece yarısı sonrası yatsı) + bugün + 7 gün. */
export const VAKIT_UFKU_GUN = 8;

export const cumaMi = (isoGun: string): boolean => ISOTarihiDateNesnesiNeCevir(isoGun).getDay() === 5;

export function gunGirisleriniHesapla(
    koordinat: NafileKoordinat | null | undefined,
    bugunIso: string,
    gunSayisi: number = VAKIT_UFKU_GUN
): GunGirisleri[] {
    if (!koordinatGecerliMi(koordinat)) return [];
    const sonuc: GunGirisleri[] = [];
    for (let i = -1; i < gunSayisi; i++) {
        const tarih = gunEkle(bugunIso, i);
        const v = gunVakitleriniHesapla(koordinat, tarih);
        sonuc.push({
            tarih,
            cuma: cumaMi(tarih),
            girisler: {
                imsak: v.imsak.getTime(),
                ogle: v.ogle.getTime(),
                ikindi: v.ikindi.getTime(),
                aksam: v.aksam.getTime(),
                yatsi: v.yatsi.getTime(),
            },
        });
    }
    return sonuc;
}
