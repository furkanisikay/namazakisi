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
import { hicKanalAcikMi } from '../muhafiz/kanalKumesi';

/**
 * Seviye no (1-4) -> matris seviye indeksi (0-3).
 * Gecersiz/aralik disi deger -> seviye 1 (en erken baslangic; eski davranis).
 */
const seviyeIndeksi = (seviye: number | undefined): number => {
  if (typeof seviye !== 'number' || !Number.isInteger(seviye)) return 0;
  if (seviye < 1 || seviye > SEVIYE_KADEMELERI.length) return 0;
  return seviye - 1;
};

/**
 * DIKKAT (Faz 1 / B12): dondurulen esik "vaktin CIKMASINA kala" anlamindadir.
 * Giris yonune (`yon: 'girisindenItibaren'`) cevrilmis bir vakitte hucrenin
 * `esikDk`'si "girisin uzerinden gecen dakika" demektir; ikisi ayni sayi degildir
 * ve donusum icin pencere uzunlugu gerekir — bu yardimci SAF oldugu icin onu
 * bilemez. Bu yuzden cozum donusum DEGIL BASTIRMADIR: giris-yonlu vakit
 * `muhafizUyarilanVakitleriBul` uzerinden "tumuyle kapsanmis" sayilir ve sayac o
 * vakitte planlanmaz (bkz. asagi). Esigi burada "cevirmeye" calisma.
 */
export const sayacBaslangicEsikleriHesapla = (
  seviye: number | undefined,
  matris: MuhafizMatrisi
): Record<MuhafizVakti, number> => {
  const indeks = seviyeIndeksi(seviye);
  const sonuc = {} as Record<MuhafizVakti, number>;
  for (const vakit of MUHAFIZ_VAKITLERI) {
    // Eşik yalnız bir ZAMAN referansıdır; adımın kanalları (hepsi kapalı olsa
    // bile) sayacın ne zaman başlayacağını değiştirmez.
    sonuc[vakit] = matris[vakit]?.seviyeler?.[indeks]?.esikDk ?? 0;
  }
  return sonuc;
};

/**
 * Muhafizin GERCEKTEN uyari urettigi vakitler: en az bir adimi ACIK (bir kanali
 * acik) olan vakitler. #90 bastirmasi yalniz bu vakitlerde uygulanir.
 *
 * DIKKAT: bu listeyi `esikDk` ile DARALTMA — giris yonlu vakitte esik "cikisa
 * kala" degil "giristen itibaren" demektir ve daraltma giris yonunu SESSIZCE
 * bozar (Faz 1 / A3c'de olculdu).
 *
 * Neden: matris oncesi muhafiz ya tamamen acikti ya tamamen kapali; artik
 * kullanici TEK bir vakti (or. Ogle) tumden susturabilir. Global bastirma o
 * vakitte sayaci da susturur ve kullanici HICBIR hatirlatma almaz — bu Faz 2/3
 * ile acilan bir bosluktur. Vakit bazli bastirma hem #90 cakismasini onler hem
 * bu boslugu kapatir.
 *
 * FAZ 1 / B12 — YON BURADA AND'LENIR, sayac servisinde DEGIL. Iki kapsama
 * kurali var ve ikisi de ayni sonucu ("bu vakitte muhafiz uyarir") verir:
 *   - `girisindenItibaren`: uyari pencerenin TAMAMINA yayilir → vakit tumuyle
 *     kapsanir; sayacin baslangic esigi zaten anlamini yitirmistir (esik "cikisa
 *     kala" degil "giristen itibaren"dir, bkz. `sayacBaslangicEsikleriHesapla`).
 *   - `cikisaDogru` (tarihsel): en az bir acik adim kapsama icin yeterlidir.
 * ONCE gelen "hic acik adim yok" kapisi HER IKI YONDE de onceliklidir: tum
 * adimlari kapali bir vakit — giris yonlu olsa bile — bastirilmamalidir, yoksa
 * kullanici o vakitte ne muhafiz ne sayac uyarisi alir.
 */
export const muhafizUyarilanVakitleriBul = (matris: MuhafizMatrisi): MuhafizVakti[] =>
  MUHAFIZ_VAKITLERI.filter((vakit) => {
    const seviyeler = matris[vakit]?.seviyeler ?? [];
    // Hic acik adim yoksa muhafiz o vakitte KONUSMAZ -> bastirma da olmaz.
    if (!seviyeler.some((s) => !hicKanalAcikMi(s.kanallar))) return false;
    // Kalan iki dal (giris/cikis) da kapsama uretir — yukaridaki nota bak.
    return true;
  });
