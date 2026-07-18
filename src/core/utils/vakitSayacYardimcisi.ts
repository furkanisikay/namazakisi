/**
 * Vakit sayaci bildiriminin baslangic esiklerini (dakika) hesaplar.
 *
 * Kullanici, vakit sayacinin hangi muhafiz seviyesinde baslayacagini secer
 * (`sayacBaslangicSeviyesi`, 1-4). Bu yardimci o seviyeyi muhafiz matrisinden
 * okur. Seviye 1 = en erken baslangic (varsayilan).
 *
 * Faz 3: esikler artik GLOBAL degil VAKIT BAZLI -> her vakit icin ayri deger
 * doner. (Kullanici Ogle'ye 45 dk, Ikindi'ye 20 dk verebilir.)
 *
 * TEK KAYNAK: App.tsx, AnaSayfa.tsx ve BildirimAyarlariSayfasi ayni eslemeyi
 * kullanir. (Onceden App/AnaSayfa `esikler.seviye1`'e sabitti -> kullanicinin
 * sectigi baslangic seviyesi yok sayiliyordu; #90 review bulgusu.)
 */
import type { MuhafizMatrisi, MuhafizVakti } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from '../muhafiz/matrisTipleri';

/**
 * Seviye no (1-4) -> matris seviye indeksi (0-3).
 * Gecersiz/aralik disi deger -> seviye 1 (en erken baslangic; eski davranis).
 */
const seviyeIndeksi = (seviye: number | undefined): number => {
  if (typeof seviye !== 'number' || !Number.isInteger(seviye)) return 0;
  if (seviye < 1 || seviye > SEVIYE_KADEMELERI.length) return 0;
  return seviye - 1;
};

export const sayacBaslangicEsikleriHesapla = (
  seviye: number | undefined,
  matris: MuhafizMatrisi
): Record<MuhafizVakti, number> => {
  const indeks = seviyeIndeksi(seviye);
  const sonuc = {} as Record<MuhafizVakti, number>;
  for (const vakit of MUHAFIZ_VAKITLERI) {
    // Eşik yalnız bir ZAMAN referansıdır; seviyenin modu (sessiz olsa bile)
    // sayacın ne zaman başlayacağını değiştirmez.
    sonuc[vakit] = matris[vakit]?.seviyeler?.[indeks]?.esikDk ?? 0;
  }
  return sonuc;
};

/**
 * Muhafizin GERCEKTEN uyari urettigi vakitler: en az bir seviyesi sessiz olmayan
 * vakitler. #90 bastirmasi yalniz bu vakitlerde uygulanir.
 *
 * Neden: matris oncesi muhafiz ya tamamen acikti ya tamamen kapali; artik
 * kullanici TEK bir vakti (or. Ogle) tumden susturabilir. Global bastirma o
 * vakitte sayaci da susturur ve kullanici HICBIR hatirlatma almaz — bu Faz 2/3
 * ile acilan bir bosluktur. Vakit bazli bastirma hem #90 cakismasini onler hem
 * bu boslugu kapatir.
 */
export const muhafizUyarilanVakitleriBul = (matris: MuhafizMatrisi): MuhafizVakti[] =>
  MUHAFIZ_VAKITLERI.filter((vakit) =>
    (matris[vakit]?.seviyeler ?? []).some((s) => s.mod !== 'sessiz')
  );
