/**
 * Vakit satiri (Katman 1) dinamik ozeti — yapisal veri + ekran okuyucu cumlesi.
 *
 * Ekran ilk uyarinin anini yazar ("45 dk kala başlar") ve kullanilan kanallari ikon
 * cipiyle gosterir (`OzetCipleri`); `·` ile birlestirilmis metin YOK.
 *
 * SAF: store'a/UI'a bagimli degil. Ozet KALICI DEGIL, ayarlardan turetilir.
 */
import type { VakitMuhafizAyari } from './matrisTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { acikOzetKanallari, esikIfadesi, kanalListesiMetni, OZET_KANAL_SIRASI, type OzetKanali } from './seviyeOzeti';
import { adimKapaliMi } from './kanalKumesi';

export interface VakitOzeti {
  kapali: boolean;
  /** Ilk uyarinin ani — "45 dk kala" / "girişten 5 dk sonra"; kapaliysa ''. */
  baslangic: string;
  /** Acik adimlarin kanallarinin BIRLESIMI, gosterim sirasinda. */
  kanallar: OzetKanali[];
}

/**
 * YON, "ILK uyari hangi adimda?" sorusunun cevabini TERSINE cevirir: cikista
 * eskalasyon en BUYUK esikten baslar, giriste en KUCUKten (vakit girdikten 5 dk
 * sonra). `Math.max`i oldugu gibi birakmak "45 dk sonra baslar" der ama motor
 * 5. dakikada konusur — ekran ile motor ayrisirdi.
 */
export function vakitOzetiVerisi(vakitAyari: VakitMuhafizAyari): VakitOzeti {
  const aktifler = vakitAyari.seviyeler.filter((s) => !adimKapaliMi(s.kanallar));
  if (aktifler.length === 0) return { kapali: true, baslangic: '', kanallar: [] };

  const kume = new Set<OzetKanali>();
  for (const s of aktifler) for (const k of acikOzetKanallari(s.kanallar)) kume.add(k);

  const yon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const esikler = aktifler.map((s) => s.esikDk);
  const ilkEsik = yon === 'girisindenItibaren' ? Math.min(...esikler) : Math.max(...esikler);
  return {
    kapali: false,
    baslangic: esikIfadesi(ilkEsik, yon),
    kanallar: OZET_KANAL_SIRASI.filter((k) => kume.has(k)),
  };
}

/**
 * Ekran okuyucu cumlesi. Ornekler:
 *   "45 dk kala başlar: bildirim"
 *   "girişten 5 dk sonra başlar: bildirim ve sesli okuma"
 *   "Kapalı"
 */
export function vakitOzetiOlustur(vakitAyari: VakitMuhafizAyari): string {
  const ozet = vakitOzetiVerisi(vakitAyari);
  if (ozet.kapali) return 'Kapalı';
  return `${ozet.baslangic} başlar: ${kanalListesiMetni(ozet.kanallar)}`;
}

/** Vakitte kac adim aktif (en az bir kanali acik)? Rozet icin. */
export function aktifSeviyeSayisi(vakitAyari: VakitMuhafizAyari): number {
  return vakitAyari.seviyeler.filter((s) => !adimKapaliMi(s.kanallar)).length;
}
