/**
 * Muhafiz bildirim sesi kimligi -> UYGULAMA ICI onizlemede calinabilir kaynak.
 *
 * IKI AYRI SES YOLU VAR (bilincli):
 *   1. Paketlenmis VARSAYILAN ses -> metro varligi, `expo-audio` ile calinir.
 *   2. Kullanicinin sistem seciciden sectigi `content://...` -> `expo-audio`'nun
 *      bu semayi calabildigi DOGRULANMADI; native `RingtoneManager` ile calinir
 *      (bkz. `OnizlemeSesServisi`). Bu dosya o ayrimin karar noktasidir.
 *
 * NOT: gercek BILDIRIMLERDE ses Android'de KANAL ozelligidir (bkz.
 * `sesKimligi.muhafizKanalIdOlustur`) — onizleme yolu ile bildirim yolu ayridir.
 */
import { ozelSesMi } from './sesKimligi';

/** expo-audio `AudioSource` ile uyumlu paketleyici (metro) varlik kimligi. */
export type SesKaynagi = number;

/** Uygulamayla gelen ses; ozel ses secilmemisse her yerde bu calinir. */
const VARSAYILAN_SES_DOSYASI: SesKaynagi = require('../../../assets/sounds/bildirim.mp3');

/**
 * Paketlenmis kaynagi dondurur. `content://` kimlikleri BURADAN gecmemelidir —
 * cagiran once `ozelSesOnizlemesiMi` ile ayirmalidir; yine de savunmaci olarak
 * varsayilana duser (kullanici "Dinle" dediginde hicbir sey duymamamali).
 */
export function sesDosyasiniCoz(_sesKimligi: string): SesKaynagi {
  return VARSAYILAN_SES_DOSYASI;
}

/** Bu kimlik native onizleme yolundan mi calinmali? */
export function ozelSesOnizlemesiMi(sesKimligi: string): boolean {
  return ozelSesMi(sesKimligi);
}
