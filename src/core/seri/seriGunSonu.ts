/**
 * Seri gununun BITISI ve geri sayim penceresi — saf kurallar.
 *
 * Seri gunu takvim gunu DEGILDIR: ertesi IMSAK'ta biter (`namazGunuHesapla`).
 * Kullaniciya "gun bitmek uzere" diyen her yol (gun sonu bildirimi, buyuk
 * sayacli bildirim) ayni bitis anini kullanmali, yoksa bildirim bir saatte
 * sayac baska bir saatte konusur.
 *
 * SAF: store'a, native'e ve `new Date()`'e bagimli DEGIL — hem Redux thunk'i
 * hem de Redux'un OLMADIGI arka plan gorevi ayni fonksiyonlari cagirabilsin.
 */
/**
 * Bir gunun imsagini veren saglayici.
 *
 * TIP YERELDIR (AGENTS.md katman kurali): `core/` `domain/`e bagimli olamaz.
 * `SeriHesaplayiciServisi.ImsakSaglayici` ile YAPISAL olarak ayni; uretim
 * saglayicisi (`uygulamaImsakSaglayici`) ikisine de uyar.
 */
export type ImsakSaglayici = (tarih: Date) => Date | null;

/**
 * Sayac hedefe bu kadar kala baslar. Gerekce PIL DEGIL: sayac kalici bir
 * bildirimdir ve dikkat maliyeti vardir; iki saat "bugunu kurtarmak icin hala
 * vakit var" demeye yeter, gece boyunca ekranda durmaz.
 */
export const SERI_SAYAC_VARSAYILAN_ESIK_DK = 120;

const gecerliTarihMi = (t: Date | null): t is Date =>
  t instanceof Date && Number.isFinite(t.getTime());

/** Saglayici uretim kodudur (adhan) — patlarsa sayac dusmemeli. */
const guvenliCagir = (saglayici: ImsakSaglayici, tarih: Date): Date | null => {
  try {
    const sonuc = saglayici(tarih);
    return gecerliTarihMi(sonuc) ? sonuc : null;
  } catch {
    return null;
  }
};

/**
 * SU ANDAN SONRAKI ILK imsak.
 *
 * Eski `KonumYoneticiServisi.sonrakiGunImsakVaktiGetir` KOSULSUZ yarinin
 * fajr'ini donduruyordu; saat 02:00'de seri gununun gercek sonu BUGUNUN
 * imsagidir (~3,5 saat), yarininki degil (~27,5 saat) → sayac bir gun ileriyi
 * sayar, gun sonu bildirimi de yanlis gune kurulurdu.
 *
 * Imsak ANINDA gecmis sayilir: hedefe sifir kala gosterilecek bir sure yoktur
 * ve chronometer sifiri gecince ILERI saymaya baslar (bkz. `sayacBaslamaliMi`).
 */
export function sonrakiImsakVaktiBul(simdi: Date, imsakSaglayici: ImsakSaglayici): Date | null {
  const bugunkuImsak = guvenliCagir(imsakSaglayici, simdi);
  if (bugunkuImsak && bugunkuImsak.getTime() > simdi.getTime()) return bugunkuImsak;

  const yarin = new Date(simdi.getTime());
  yarin.setDate(yarin.getDate() + 1);
  return guvenliCagir(imsakSaglayici, yarin);
}

/**
 * Sayac SIMDI gosterilmeli mi?
 *
 * Hedef gecmisse (ya da tam hedef anindaysa) BASLAMAZ — Android chronometer
 * hedefte kendiliginden DURMAZ, sifiri gecince yukari saymaya devam eder
 * (`setChronometerCountDown` yalnizca yonu belirler). Bu yuzden "gecmis hedef"
 * kapisi burada, tek yerde durur.
 */
export function sayacBaslamaliMi(
  simdi: Date,
  hedef: Date | null,
  esikDk: number = SERI_SAYAC_VARSAYILAN_ESIK_DK
): boolean {
  if (!gecerliTarihMi(hedef)) return false;

  const kalanMs = hedef.getTime() - simdi.getTime();
  if (kalanMs <= 0) return false;

  const gecerliEsik =
    Number.isFinite(esikDk) && esikDk > 0 ? esikDk : SERI_SAYAC_VARSAYILAN_ESIK_DK;
  return kalanMs <= gecerliEsik * 60000;
}
