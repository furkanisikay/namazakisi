/**
 * Muhafiz bildirim sesi id'si -> CALINABILIR ses dosyasi (TEK COZUM NOKTASI).
 *
 * NEDEN AYRI DOSYA: `SES_PALETI` (matrisTipleri.ts) uc isim vaat eder
 * (Çan / Melodi / Alarm) ama bugun uygulamada tek bir ses dosyasi vardir
 * (`assets/sounds/bildirim.mp3`; native tarafta da `res/raw/bildirim.mp3`).
 * Gercek palet dosyalarini eklemek AYRI bir istir. O is bittiginde
 * **yalniz asagidaki `SES_DOSYALARI` haritasi** guncellenir — cagiran hicbir
 * yerin (onizleme servisi, ekranlar) degismesi gerekmez.
 *
 * Bilinmeyen/eksik id sessizce varsayilana duser: kullanici "Dinle" dedigi anda
 * hicbir sey duymamaktansa mevcut sesi duymalidir.
 *
 * NOT: bu cozum yalniz UYGULAMA ICI onizleme (expo-audio) icindir. Gercek
 * bildirimlerde ses Android'de KANAL ozelligidir (bkz. `muhafizKanaliSec`) ve
 * res/raw'dan native tarafca calinir — iki yol bilincli olarak ayridir.
 */

/** expo-audio `AudioSource` ile uyumlu paketleyici (metro) varlik kimligi. */
export type SesKaynagi = number;

/** Palet gercek dosyalarina kavusana kadar herkesin dustugu ses. */
const VARSAYILAN_SES_DOSYASI: SesKaynagi = require('../../../assets/sounds/bildirim.mp3');

/**
 * Palet id -> dosya. Gercek sesler eklendiginde YALNIZ BURASI degisir:
 *   melodi: require('../../../assets/sounds/muhafiz_melodi.mp3'),
 */
const SES_DOSYALARI: Record<string, SesKaynagi> = {
  can: VARSAYILAN_SES_DOSYASI,
  melodi: VARSAYILAN_SES_DOSYASI,
  alarm: VARSAYILAN_SES_DOSYASI,
};

/** Palet id'sini calinabilir kaynaga cevirir; bilinmeyen id varsayilana duser. */
export function sesDosyasiniCoz(sesId: string): SesKaynagi {
  return SES_DOSYALARI[sesId] ?? VARSAYILAN_SES_DOSYASI;
}
