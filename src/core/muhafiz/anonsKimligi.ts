/**
 * Muhafiz bildirim/anons KIMLIGI — tek uretici (Faz 5).
 *
 * NEDEN TEK YER: sesli anons alarmi, esdegeri olan bildirimle AYNI id'yi kullanir.
 * Boylece
 *   - bildirim iptal edilirken anons da ayni id ile iptal edilir, ve
 *   - on plan (uygulama acik) ayni dakikanin anonsunu YENIDEN planlayinca alarm
 *     COGALMAZ, DEGISIR (`FLAG_UPDATE_CURRENT`) → cift konusma olmaz.
 *
 * Iki taraf id'yi ayri ayri kurarsa kucuk bir format sapmasi sessizce CIFT
 * KONUSMA uretir; bu yuzden hem `ArkaplanMuhafizServisi` hem `NamazMuhafiziServisi`
 * bu fonksiyonu kullanmak ZORUNDA (noberci test: anonsKimligi.test.ts).
 */
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';

/** `muhafiz_<tarih>_vakit_<vakit>_seviye_<n>` — dakikasiz kok (iptal onekiyle uyumlu). */
export function muhafizBildirimKokuOlustur(vakit: string, seviye: number, tarih: string): string {
  const { ONEKLEME } = BILDIRIM_SABITLERI;
  return `${ONEKLEME.MUHAFIZ}${tarih}${ONEKLEME.VAKIT}${vakit}${ONEKLEME.SEVIYE}${seviye}`;
}

/** `muhafiz_<tarih>_vakit_<vakit>_seviye_<n>_dk_<kalanDk>` — tekil bildirim/anons id'si. */
export function muhafizBildirimIdOlustur(
  vakit: string,
  seviye: number,
  tarih: string,
  kalanDk: number
): string {
  return (
    muhafizBildirimKokuOlustur(vakit, seviye, tarih) +
    BILDIRIM_SABITLERI.ONEKLEME.DAKIKA +
    kalanDk
  );
}

/**
 * Iki tarihin ayni TAKVIM gununde olup olmadigi (yerel saat).
 */
function ayniTakvimGunu(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Vaktin ait oldugu tarihi secer — `ArkaplanMuhafizServisi`'nin planlama sirasinda
 * kullandigi tarihle BIREBIR ayni sonucu vermelidir (id parite sarti).
 *
 * Tek ozel durum yatsidir: gece yarisi gecildikten sonra hala suren yatsi DUNE
 * aittir. Bunu fajr saatini tekrar hesaplamadan anlarız — o durumda vaktin CIKISI
 * (bugunun imsagi) `simdi` ile AYNI takvim gunundedir. Aksam saatlerinde suren
 * yatsinin cikisi (yarinin imsagi) ise ERTESI gundedir.
 */
export function muhafizVaktiTarihiniSec(
  vakit: string,
  simdi: Date,
  cikis: Date,
  bugun: string,
  dun: string
): string {
  if (vakit === 'yatsi' && ayniTakvimGunu(simdi, cikis)) return dun;
  return bugun;
}
