/**
 * Vakit sayaci bildiriminin baslangic esiklerini (dakika) hesaplar.
 *
 * Kullanici, vakit sayacinin vaktin KACINCI hatirlatmasinda baslayacagini secer
 * (`sayacBaslangicSeviyesi`, 1..6 — tarihsel adi "seviye"). Issue #274'ten beri
 * sayi TONU degil KRONOLOJIK sirayi anlatir: "2" = o vaktin 2. hatirlatmasi.
 * 1 = en erken baslangic (varsayilan). Vakitte o kadar hatirlatma yoksa SON
 * hatirlatmaya duser (en gec baslangic — kullanicinin "gec baslasin" niyeti).
 *
 * Faz 3: esikler artik GLOBAL degil VAKIT BAZLI -> her vakit icin ayri deger
 * doner. (Kullanici Ogle'ye 45 dk, Ikindi'ye 20 dk verebilir.)
 *
 * TEK KAYNAK: App.tsx, AnaSayfa.tsx ve BildirimAyarlariSayfasi ayni eslemeyi
 * kullanir. (Onceden App/AnaSayfa `esikler.seviye1`'e sabitti -> kullanicinin
 * sectigi baslangic seviyesi yok sayiliyordu; #90 review bulgusu.)
 */
import type { MuhafizMatrisi, MuhafizVakti, VakitMuhafizAyari } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_MAKS_ADIM, MUHAFIZ_VAKITLERI } from '../muhafiz/matrisTipleri';
import { kronolojikSirala } from '../muhafiz/aktifSeviye';
import { adimKapaliMi } from '../muhafiz/kanalKumesi';

/**
 * Hatirlatma no (1..6) -> kronolojik indeks (0..5).
 * Gecersiz/aralik disi deger -> 1. hatirlatma (en erken baslangic; eski davranis).
 */
const seviyeIndeksi = (seviye: number | undefined): number => {
  if (typeof seviye !== 'number' || !Number.isInteger(seviye)) return 0;
  if (seviye < 1 || seviye > MUHAFIZ_MAKS_ADIM) return 0;
  return seviye - 1;
};

/** Diziden kronolojik `indeks`'teki eleman; dizi kisaysa SON eleman. */
const sinirliAl = <T>(dizi: readonly T[] | undefined, indeks: number): T | undefined =>
  dizi && dizi.length > 0 ? dizi[Math.min(indeks, dizi.length - 1)] : undefined;

/**
 * Giris-yonlu vakitte sayac esigi icin CIKIS tabani (dk, nazik → acil).
 *
 * Tarihsel varsayilan matris; `ArkaplanGorevServisi` ve `KonumDegisikligiServisi`
 * de ham okumada ayni sayilara duser. Yalniz `yonYedegi` yokken kullanilir.
 */
export const VARSAYILAN_CIKIS_ESIKLERI = [45, 25, 10, 3];

/**
 * DIKKAT (Faz 1 / B12): dondurulen esik "vaktin CIKMASINA kala" anlamindadir.
 * Giris yonune (`yon: 'girisindenItibaren'`) cevrilmis bir vakitte hucrenin
 * `esikDk`'si "girisin uzerinden gecen dakika" demektir; ikisi AYNI SAYI DEGILDIR
 * ve donusum icin pencere uzunlugu gerekir — bu yardimci SAF oldugu icin onu
 * bilemez.
 *
 * MUHAFIZ ACIKKEN sorun yok: giris-yonlu vakit `muhafizUyarilanVakitleriBul`
 * uzerinden "tumuyle kapsanmis" sayilir ve sayac orada hic planlanmaz.
 * MUHAFIZ KAPALIYKEN bastirma uygulanmaz ve esik ham okunur → giris degeri
 * "cikisa kala" diye yorumlanir. Eskiden bu tesaduffen zararsizdi (giris-yonlu
 * kayitlar cikis sirasindaki esikleri tasiyordu — duzeltilen hatanin ta kendisi);
 * esikler yone uygun kurulunca gorunur olur: or. acil 180 dk, 87 dk'lik aksam
 * penceresinde sayaci vakit girer girmez baslatirdi.
 *
 * COZUM YINE DONUSUM DEGIL: giris-yonlu vakitte esik, o vaktin CIKIS
 * zamanlamasindan okunur — `yonYedegi.cikisaDogru` (kullanicinin ayrildigi cikis
 * ayari) varsa ondan, yoksa tarihsel varsayilandan. Esigi pencereyle "cevirmeye"
 * calisma.
 */
export const sayacBaslangicEsikleriHesapla = (
  seviye: number | undefined,
  matris: MuhafizMatrisi
): Record<MuhafizVakti, number> => {
  const sonuc = {} as Record<MuhafizVakti, number>;
  for (const vakit of MUHAFIZ_VAKITLERI) {
    sonuc[vakit] = vakitSayacEsigiHesapla(seviye, matris[vakit]);
  }
  return sonuc;
};

/**
 * TEK vaktin sayac baslangic esigi (dk) — `sayacBaslangicEsikleriHesapla`'nin
 * vakit basina cekirdegi. Bir kerelik kapali adim temizligi
 * (`muhafizGoc.kapaliVarsayilanAdimlariTemizle`) da AYNI fonksiyonla "temizlik bu
 * vaktin sayac esigini kaydiriyor mu?" diye sorar: sira KRONOLOJIK indekstir ve
 * kapali adimlari da sayar, yani bir adimi silmek sonraki adimlarin sirasini kaydirir.
 */
export const vakitSayacEsigiHesapla = (
  seviye: number | undefined,
  vakitAyari: VakitMuhafizAyari | undefined
): number => {
  const indeks = seviyeIndeksi(seviye);
  if (vakitAyari?.yon === 'girisindenItibaren') {
    // Yedek de kronolojik (cikista AZALAN) saklanir.
    const cikisYedegi = sinirliAl(
      kronolojikSirala(vakitAyari.yonYedegi?.cikisaDogru ?? [], 'cikisaDogru'),
      indeks
    )?.esikDk;
    return Number.isFinite(cikisYedegi)
      ? (cikisYedegi as number)
      : (sinirliAl(VARSAYILAN_CIKIS_ESIKLERI, indeks) as number);
  }
  // Eşik yalnız bir ZAMAN referansıdır; adımın kanalları (hepsi kapalı olsa
  // bile) sayacın ne zaman başlayacağını değiştirmez. Sıra DİZİ indeksinden
  // değil kronolojik görünümden gelir (ton artık sırayı ima etmez).
  return sinirliAl(kronolojikSirala(vakitAyari?.seviyeler ?? [], 'cikisaDogru'), indeks)?.esikDk ?? 0;
};

/** Vakit sayaci baslangic secenegi: kronolojik N. hatirlatma + gorunen metin. */
export interface SayacBaslangicSecenegi {
  seviye: number;
  metin: string;
}

/**
 * Vakit sayaci "Ne zaman calismaya baslasin?" secenekleri (issue #274).
 *
 * Eskiden ekran bayat GLOBAL `esikler.seviye1..4`'ten dort sabit secenek
 * uretiyordu: matris Faz 3'ten beri motoru besliyor, adim sayisi 1..6 ve
 * zamanlama vakit bazli → "Son 45 Dakika (1. hatirlatma)" gercek planla
 * ayrisiyordu. Secenek sayisi = matristeki EN FAZLA adim sayisi; metin
 * `sayacBaslangicEsikleriHesapla`'dan (sayacin GERCEKTEN kullandigi esik) gelir.
 * Vakitler farkli esik veriyorsa aralik gosterilir.
 */
export const sayacBaslangicSecenekleriOlustur = (
  matris: MuhafizMatrisi
): SayacBaslangicSecenegi[] => {
  const enFazla = Math.max(
    1,
    ...MUHAFIZ_VAKITLERI.map((v) => matris[v]?.seviyeler?.length ?? 0)
  );
  const adet = Math.min(enFazla, MUHAFIZ_MAKS_ADIM);
  return Array.from({ length: adet }, (_, i) => {
    const seviye = i + 1;
    const esikler = Object.values(sayacBaslangicEsikleriHesapla(seviye, matris)).filter(
      (e) => Number.isFinite(e) && e > 0
    );
    const enAz = Math.min(...esikler);
    const enCok = Math.max(...esikler);
    const metin =
      esikler.length === 0
        ? `${seviye}. hatırlatmadan itibaren`
        : enAz === enCok
          ? `Son ${enAz} Dakika`
          : `Son ${enAz}–${enCok} Dakika (vakte göre)`;
    return { seviye, metin };
  });
};

/**
 * Secili secenek: kayitli deger secenek sayisini asiyorsa (adim silinmis) sayac
 * zaten SON hatirlatmaya duser (`sayacBaslangicEsikleriHesapla`) → o secili gorunur.
 */
export const seciliSayacBaslangici = (kayitli: number | undefined, secenekSayisi: number): number =>
  Math.min(seviyeIndeksi(kayitli) + 1, Math.max(1, secenekSayisi));

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
    if (!seviyeler.some((s) => !adimKapaliMi(s.kanallar))) return false;
    // Kalan iki dal (giris/cikis) da kapsama uretir — yukaridaki nota bak.
    return true;
  });
