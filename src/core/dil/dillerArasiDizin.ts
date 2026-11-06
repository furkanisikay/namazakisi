/**
 * Diller arası dizin (SAF): bütün dillerin sözlüğünü dolaşmayı gerektiren iki aramanın ÖNCEDEN
 * hesaplanmış hâli. Sözlükler tembel ve sıkıştırılmış yüklendiği için çalışma zamanında 78 dili
 * açmak (≈20 MB) yerine paketleme adımında bir kez kurulur (`scripts/dil/paketle.js`).
 *
 * - `takvim`: her vaktin bütün dillerdeki (ve iki alfabeli dilde her alfabedeki) takvim etkinliği
 *   başlığı — dil değiştiren kullanıcının eski etkinliklerini temizlemek için.
 * - `sablon`: hazır sesli okuma şablonu → (liste, sıra); ilk eşleşme dil sırasıyla
 *   (`anonsSablonlari.sablonKonumu`).
 *
 * Çalışma zamanı bunu YALNIZ paketten okur (`aktifDil.dillerArasiDizin`); bu dosya paketleyici ve
 * nöbetçi test içindir.
 */
import { bicimle } from './bicim';
import { DILLER, type DilKodu } from './diller';
import { derinCevir, dilYaziVarsayilani, YAZI_SECENEKLERI, yaziyaCevir, type YaziSistemi } from './yazi';
import type { Sozluk } from './sozluk/tr';

export const DIZIN_VAKITLERI = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
export type DizinVakti = (typeof DIZIN_VAKITLERI)[number];

export interface DillerArasiDizin {
  takvim: Record<DizinVakti, string[]>;
  sablon: Record<string, [string, number]>;
}

/**
 * Dilin dizine giren yazı biçimleri: iki alfabeli dilde her alfabe (`YAZI_SECENEKLERI` sırası,
 * `sablonKonumu`'nun ilk eşleşme sırası), değilse dilin tek hâli. Varsayılan alfabe listede yoksa eklenir.
 */
function yazilar(kod: DilKodu): (YaziSistemi | null)[] {
  const secenekler = YAZI_SECENEKLERI[kod];
  if (!secenekler) return [null];
  const varsayilan = dilYaziVarsayilani(kod);
  return varsayilan && !secenekler.includes(varsayilan) ? [...secenekler, varsayilan] : [...secenekler];
}

export function dillerArasiDizinKur(hamSozluk: (kod: DilKodu) => Sozluk): DillerArasiDizin {
  const takvim = Object.fromEntries(DIZIN_VAKITLERI.map((v) => [v, new Set<string>()])) as Record<DizinVakti, Set<string>>;
  const sablon: Record<string, [string, number]> = {};
  for (const d of DILLER) {
    const ham = hamSozluk(d.kod);
    for (const yazi of yazilar(d.kod)) {
      const s = yazi === null ? ham : derinCevir(ham, (t) => yaziyaCevir(d.kod, t, yazi));
      for (const v of DIZIN_VAKITLERI) takvim[v].add(bicimle(s.takvim.etkinlikBasligi, { ad: s.vakit.adlar[v] }));
      const tablo = s.anons.sablon as Record<string, readonly string[]>;
      for (const liste of Object.keys(tablo)) {
        tablo[liste].forEach((metin, sira) => {
          if (!Object.prototype.hasOwnProperty.call(sablon, metin)) sablon[metin] = [liste, sira];
        });
      }
    }
  }
  return {
    takvim: Object.fromEntries(DIZIN_VAKITLERI.map((v) => [v, [...takvim[v]]])) as Record<DizinVakti, string[]>,
    sablon,
  };
}
