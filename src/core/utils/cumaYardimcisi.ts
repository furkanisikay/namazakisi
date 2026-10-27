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

import { NamazAdi, namazAdiGoster } from '../constants/UygulamaSabitleri';
import { aktifDil, bicim, metin } from '../dil/aktifDil';
import { dakikaKisa, dakikaUzun } from '../dil/sure';
import { ayetMeali } from '../icerik/nassDili';

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
): string =>
  cumaGosterilsin && namazAdi === NamazAdi.Ogle && cumaMi(tarih) ? metin().vakit.cuma : namazAdiGoster(namazAdi);

/** Cümle içi süre ("1 saat 30 dakika" / "1 hour 30 minutes"), etkin dilde (sesli okuma da). */
export const sureMetniOlustur = (dakika: number): string => dakikaUzun(dakika);

/**
 * Cuma hatırlatmasının başlığı — ÖNDEN OKUNUR (issue #287): bileklikler
 * (Galaxy Fit, Mi Band…) telefon bildiriminin başlığından yalnız ilk ~16
 * karakteri gösterir → "Cuma · 1 sa kaldı" başta durur. Süre öğle vaktinin
 * girişine kalan süredir (gövde bunu açıkça söyler).
 */
export const cumaBasligiOlustur = (oncedenDk: number): string =>
  bicim(metin().bildirim.cuma.baslik, { sure: dakikaKisa(oncedenDk) });

/** Cuma'ya ÖZGÜ nass (Cuma 62/9) — yalnız bu bildirimde, yalnız cumanın İLK tetiğinde. */
export const CUMA_NASSI = `"Cuma günü namaza çağırıldığında Allah'ı anmaya koşun." (Cuma, 62/9)`; // dil-haric: Türkçe nass

/** Cuma nassı etkin dilde: Türkçede yukarıdaki metin, diğer dillerde QuranEnc meali + künye (yoksa boş). */
export function cumaNassi(): string {
  if (aktifDil() === 'tr') return CUMA_NASSI;
  const meal = ayetMeali('62:9');
  return meal ? `${meal.metin}\n— ${meal.kaynak}` : '';
}

/**
 * Cuma hatırlatmasının başlık + gövdesi — üretici (`cumaPlaniOlustur`), servis ve "Akışı
 * önizle" AYNI kaynaktan okur. İbadete çağrı kaydı ("sen" + emir kipi, AGENTS.md istisnası).
 * Nass yalnız İLK tetikte: her tekrarda okunması hem gürültü hem nassın değerini aşındırır.
 */
export const cumaBildirimMetni = (kalanDk: number, ilk: boolean): { baslik: string; govde: string } => {
  const sure = dakikaUzun(kalanDk);
  const m = metin().bildirim.cuma;
  const nass = ilk ? cumaNassi() : '';
  return {
    // Önden okunur (issue #287): bileklikler başlığın ilk ~16 karakterini gösterir.
    baslik: cumaBasligiOlustur(kalanDk),
    govde: ilk
      ? `${bicim(m.govdeIlk, { sure })}${nass ? `\n${nass}` : ''}`
      : bicim(m.govde, { sure }),
  };
};

/**
 * Sesli anons cümlesi ("Telefonunuz şöyle okur"). Nass OKUNMAZ (plan §3.4); süre öğle
 * GİRİŞİNE kalan süredir — cuma namazı hutbeyle öğle girdikten sonra başlar.
 */
export const cumaAnonsMetni = (kalanDk: number): string =>
  bicim(metin().anons.otomatik.cuma, { sure: sureMetniOlustur(kalanDk) });

