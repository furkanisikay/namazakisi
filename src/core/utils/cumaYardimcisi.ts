/**
 * Cuma namazi hatirlatmasi icin saf (yan etkisiz) tarih yardimcilari — issue #173.
 *
 * Cuma, ogle vaktinin YERINE gecer; ayri bir vakit degildir. Bu yuzden burada
 * yeni bir "vakit" kavrami yoktur — yalnizca "haftanin hangi gunu" ve "ogle
 * vaktinden ne kadar once" sorulari yanitlanir.
 *
 * TUM gun aritmetigi YEREL gundur (`getDay`/`getDate`, `new Date(yil, ay, gun)`).
 * ISO string uzerinden `new Date('2026-08-07')` UTC gece yarisi uretir ve negatif
 * timezone'larda gunu bir geri kaydirir — ana ekran gun navigasyonunda yasanmis
 * tuzak (#13). Buraya ISO parse SOKMA.
 */

import { NamazAdi } from '../constants/UygulamaSabitleri';
import type { Siklik, VakitMuhafizAyari } from '../muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../muhafiz/matrisTipleri';

/** JavaScript `Date.getDay()` degeri: 0 Pazar … 5 Cuma. */
const CUMA_GUN_INDEKSI = 5;

/** Verilen an cuma gunune mi denk geliyor (yerel gun)? */
export const cumaMi = (tarih: Date): boolean => tarih.getDay() === CUMA_GUN_INDEKSI;

/**
 * `baslangic` tarihinden itibaren sonraki `adet` cumayi, gun basina normalize
 * edilmis (00:00) olarak dondurur.
 *
 * Baslangic gunu cuma ise O GUN de dahildir: cuma sabahi uygulamayi acan
 * kullanicinin o haftaki hatirlatmasi kaybolmamali. Vaktin gecip gecmedigine
 * cagiran karar verir (planlayici gecmis zamanli hedefi atlar) — bu fonksiyon
 * saf takvim mantigidir, "simdi"yi bilmez.
 */
export const sonrakiCumalar = (baslangic: Date, adet: number): Date[] => {
  if (adet <= 0) return [];

  const ilkCuma = new Date(baslangic.getFullYear(), baslangic.getMonth(), baslangic.getDate());
  const cumayaKalanGun = (CUMA_GUN_INDEKSI - ilkCuma.getDay() + 7) % 7;
  ilkCuma.setDate(ilkCuma.getDate() + cumayaKalanGun);

  return Array.from({ length: adet }, (_, hafta) => {
    const cuma = new Date(ilkCuma.getFullYear(), ilkCuma.getMonth(), ilkCuma.getDate());
    cuma.setDate(cuma.getDate() + hafta * 7);
    return cuma;
  });
};

/**
 * Ogle vaktinden `oncedenDk` dakika oncesini dondurur. Kaynak tarihi DEGISTIRMEZ.
 *
 * Hatirlatma "vakit cikiyor" degil "cemaate yetis" mantigindadir: kisi camiye
 * GITMEK zorunda oldugu icin uyari vaktin cikisina degil, girisine gore ve
 * cok daha erken kurulur.
 */
export const hatirlatmaZamaniHesapla = (ogleVakti: Date, oncedenDk: number): Date =>
  new Date(ogleVakti.getTime() - oncedenDk * 60 * 1000);

/**
 * Dakikayi kullaniciya okunur sureye cevirir: 60 → "1 saat",
 * 45 → "45 dakika", 90 → "1 saat 30 dakika".
 */
/**
 * Bir namazin O GUN EKRANDA gorunecek adi.
 *
 * SALT GORUNUM — KIMLIK DEGIL. Cuma, ogle namazinin yerine gecer ama kayit,
 * istatistik, seri, yedekleme ve isaretleme her yerde `NamazAdi.Ogle`'dir.
 * Bu fonksiyonun ciktisini bir esitlik/anahtar/depolama degeri olarak KULLANMA
 * (aktif vakit eslesmesi ve toggle bu yuzden ham `namazAdi` ile calisir).
 *
 * `cumaGosterilsin` kullanicinin cuma hatirlatmasi ayaridir: cuma herkese
 * farz-i ayn degildir, etiketi herkese dayatmak yanlis olur.
 *
 * @param tarih GOSTERILEN gunun tarihi (`new Date()` DEGIL) — gecmis bir gune
 *              bakarken etiket o gune gore hesaplanmali.
 */
export const namazGorunenAdi = (
  namazAdi: string,
  tarih: Date,
  cumaGosterilsin: boolean
): string => (cumaGosterilsin && namazAdi === NamazAdi.Ogle && cumaMi(tarih) ? 'Cuma' : namazAdi);

/**
 * Cuma ayarini ORTAK HATIRLATMA PENCERESI'ne cevirir (Faz 4).
 *
 * Pencere: `baslangic = ogleVakti − oncedenDk`, `bitis = ogleVakti`,
 * `yon: 'cikisaDogru'`, TEK adim. Boylece hem planlama (`vakitUyariPlaniOlustur`)
 * hem de ayar ekrani (`PencereKarti`) muhafizla AYNI motoru/bileseni kullanir;
 * cumaya ozel bir zamanlama mantigi ya da ikinci bir kart tasarimi YOKTUR.
 *
 * Kanal kumesi sabittir (`{ bildirim: true }`): cuma mevcut `vakit_bildirim`
 * kanalindan gonderilir (yeni kanal ACILMAZ) ve sesli anons (TTS) kullanmaz —
 * bu yuzden ekranda kanal/ses secimi de gosterilmez.
 */
export const cumaPenceresiOlustur = (oncedenDk: number, siklik: Siklik): VakitMuhafizAyari => ({
  yon: 'cikisaDogru',
  seviyeler: [
    {
      kademe: 'nazik',
      kanallar: { bildirim: true },
      esikDk: oncedenDk,
      siklik,
      bildirimSesi: VARSAYILAN_SES,
      anonsMetni: '',
    },
  ],
});

/** Pencerenin duzenlenmis halinden ayara geri donus (ekran yazma yolu). */
export const cumaPencereAyariCoz = (
  pencere: VakitMuhafizAyari
): { oncedenDk: number; siklik: Siklik } => {
  const adim = pencere.seviyeler[0];
  return { oncedenDk: adim.esikDk, siklik: adim.siklik };
};

export const sureMetniOlustur = (dakika: number): string => {
  const saat = Math.floor(dakika / 60);
  const kalanDk = dakika % 60;

  if (saat === 0) return `${kalanDk} dakika`;
  if (kalanDk === 0) return `${saat} saat`;
  return `${saat} saat ${kalanDk} dakika`;
};
