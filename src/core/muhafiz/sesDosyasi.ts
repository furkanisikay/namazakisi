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
import { paketSesiBul, type PaketSesAdi } from './ios/paketSesleri';
import type { MuhafizPlatformu } from './ios/platformYetenekleri';

/** expo-audio `AudioSource` ile uyumlu paketleyici (metro) varlik kimligi. */
export type SesKaynagi = number;

/** Uygulamayla gelen ses; ozel ses secilmemisse her yerde bu calinir. */
const VARSAYILAN_SES_DOSYASI: SesKaynagi = require('../../../assets/sounds/bildirim.mp3');

/**
 * iPhone'un paketlenmis sesleri (`paket:<ad>`) — bildirimin calacagi dosyanin AYNISI
 * (`app.json > expo-notifications.sounds`), onizlemede duyulan = bildirimde duyulan.
 */
const PAKET_KAYNAKLARI: Readonly<Record<PaketSesAdi, SesKaynagi>> = {
  zil: require('../../../assets/sounds/zil_ios.wav'),
  ikiton: require('../../../assets/sounds/ikiton_ios.wav'),
  damla: require('../../../assets/sounds/damla_ios.wav'),
  sabah: require('../../../assets/sounds/sabah_ios.wav'),
};

/**
 * Paketlenmis kaynagi dondurur. `content://` kimlikleri BURADAN gecmemelidir —
 * cagiran once `ozelSesOnizlemesiMi` ile ayirmalidir; yine de savunmaci olarak
 * varsayilana duser (kullanici "Dinle" dediginde hicbir sey duymamamali).
 *
 * iPhone'un paket sesi YALNIZ iPhone'da kendi dosyasini calar: Android'de o kimlik
 * (iPhone yedeginden) varsayilan kanala duser, onizleme de varsayilani calar.
 */
export function sesDosyasiniCoz(sesKimligi: string, platform: MuhafizPlatformu = 'android'): SesKaynagi {
  const paket = platform === 'ios' ? paketSesiBul(sesKimligi) : null;
  return paket ? PAKET_KAYNAKLARI[paket.ad] : VARSAYILAN_SES_DOSYASI;
}

/** Bu kimlik native onizleme yolundan mi calinmali? */
export function ozelSesOnizlemesiMi(sesKimligi: string): boolean {
  return ozelSesMi(sesKimligi);
}
