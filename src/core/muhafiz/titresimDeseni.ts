/**
 * Muhafiz titresim deseni (Faz 6) — SAF, tek kaynak.
 *
 * IKI AYRI YOL VAR, KARISTIRMA:
 *  1) BILDIRIM KANALI titresimi — Android 8+'ta kanal ozelligidir ve kanal
 *     olusturulduktan sonra DEGISTIRILEMEZ. Desen bu yuzden NATIVE tarafta
 *     (`MuhafizKanallari.kt`) yasar; JS oraya yalnizca "titresim acik mi" bilgisini
 *     gecer ve id'yi ona gore uretir (`sesKimligi.muhafizKanalIdOlustur`).
 *  2) BURADAKI desen — uygulama ACIKKEN ön plan uyarisinin (`NamazMuhafiziServisi`)
 *     dogrudan calistirdigi titresim ve Android 8 ONCESI cihazlarda bildirimin
 *     kendi `vibrate` alani. O surumlerde kanal kavrami yoktur; bildirimin kendi
 *     deseni islenir (8+'ta kanal kazanir, alan sessizce yok sayilir).
 *
 * Desen formati `[bekle, titret, bekle, titret, ...]` (ms) — hem RN `Vibration`
 * hem expo-notifications `content.vibrate` ayni sozlesmeyi kullanir.
 */

/** Kullanicinin acikca istedigi BELIRGIN titresim (ust uste uc kisa + bir uzun). */
export const TITRESIM_DESENI: readonly number[] = [0, 400, 150, 400, 150, 400, 150, 700];

/**
 * `Vibration.vibrate` / `content.vibrate` degistirilebilir dizi bekler; readonly
 * sabiti disari verirken kopyalanir (paylasilan sabit kazara mutasyona ugramasin).
 */
export const titresimDeseniAl = (): number[] => [...TITRESIM_DESENI];
