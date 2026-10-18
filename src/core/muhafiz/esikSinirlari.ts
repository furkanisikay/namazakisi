/**
 * Esik stepper sinirlari — spec 4.2 "Esikleri ZORLA SIRALA".
 *
 * Kullanici kronolojik sirayi bozamasin diye her adimin stepper'i ESIGE GORE
 * KOMSULARINA kilitlenir; boylece dizi kronolojik kalir (ayrica
 * `esikSiralamasiGecerliMi` ile dogrulanabilir) ve esikler tekil kalir.
 *
 * FAZ 0 — TAVAN ARTIK SABIT DEGIL: vaktin O GUNKU penceresinden gelir. Sabit 120
 * dk, yatsi gibi 6-11 saat suren vakitlerde kullaniciyi gereksiz kisitliyordu.
 *
 * SAF: store'a/UI'a bagimli degil.
 */
import type { SeviyeAyari } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';

export const ESIK_MUTLAK_MIN = 1;

/**
 * Pencere BILINMIYORKEN (konum/vakit hesabi yoksa) uygulanan tavan.
 * Gercek geriye uyumluluk: eski davranis birebir korunur.
 */
export const ESIK_MUTLAK_MAX = 120;

/**
 * Pencere bilinse bile asilamayan guvenlik tavani.
 *
 * Yalniz "cok buyuk sayi" korkusu degil: 720 dk'lik bir esik `TEKRAR_MIN_DK = 1`
 * ile birlesince tek vakitte yuzlerce bildirim + exact alarm demektir. Ikinci
 * muhafiz `planButcesi` (seviye basina adim siniri).
 */
export const ESIK_GUVENLIK_TAVANI = 720;

export interface EsikSinirlari {
  min: number;
  max: number;
}

export interface EsikSinirSecenekleri {
  /** Vaktin bugunku pencere uzunlugu (dk). Verilmezse tavan `ESIK_MUTLAK_MAX`. */
  pencereUzunluguDk?: number;
  /**
   * Pencere yonu (Faz 1). Issue #274'ten beri sinirlar ESIGE GORE SIRALI
   * gorunumden geldigi icin sonucu degistirmez; cagiranlar icin korunur.
   */
  yon?: PencereYonu;
}

/** Pencereden turetilen mutlak tavan (komsu kisiti bunun USTUNE uygulanir). */
function tavaniHesapla(pencereUzunluguDk?: number): number {
  if (!Number.isFinite(pencereUzunluguDk) || (pencereUzunluguDk as number) <= 0) {
    return ESIK_MUTLAK_MAX;
  }
  // Pencereye ESIT esik calismaz (uyari vaktin giris anina duser) -> -1.
  const pencereTavani = Math.floor(pencereUzunluguDk as number) - 1;
  return Math.max(ESIK_MUTLAK_MIN, Math.min(pencereTavani, ESIK_GUVENLIK_TAVANI));
}

/**
 * Bir adimin esik stepper sinirlari — komsular DIZI INDEKSINDEN degil ESIGE
 * GORE SIRALI GORUNUMDEN gelir (issue #274): ton artik sirayi ima etmez, dizi
 * de degisken uzunluklu.
 *
 * Kural yonden BAGIMSIZDIR: adim, kendisinden kucuk en buyuk esigin bir
 * ustunde, kendisinden buyuk en kucuk esigin bir altinda kalir. Cikista
 * (AZALAN) bu "sonraki hatirlatmadan once, oncekinden sonra"; giriste
 * (ARTAN) ayni seydir. Boylece kronolojik sira (ve "N. hatirlatma" numarasi)
 * stepper'la bozulamaz, esikler de tekil kalir.
 *
 * KAPALI adim da sinirlari kilitler (bilincli; AGENTS.md): kanallara bakilmaz,
 * yoksa adim yeniden acilinca sira bozulmus olurdu.
 *
 * `yon` artik sonucu degistirmez; imza geriye uyumluluk icin korunur.
 */
export function esikSinirlariniHesapla(
  seviyeler: SeviyeAyari[],
  indeks: number,
  secenekler?: EsikSinirSecenekleri
): EsikSinirlari {
  const tavan = tavaniHesapla(secenekler?.pencereUzunluguDk);

  if (indeks < 0 || indeks >= seviyeler.length) {
    return { min: ESIK_MUTLAK_MIN, max: tavan };
  }

  const esik = seviyeler[indeks].esikDk;
  let altKomsu = -Infinity; // kendisinden kucuk en buyuk esik
  let ustKomsu = Infinity; // kendisinden buyuk en kucuk esik
  for (let i = 0; i < seviyeler.length; i++) {
    const diger = seviyeler[i].esikDk;
    if (i === indeks || !Number.isFinite(diger)) continue;
    if (diger < esik && diger > altKomsu) altKomsu = diger;
    if (diger > esik && diger < ustKomsu) ustKomsu = diger;
  }

  const min = Math.max(ESIK_MUTLAK_MIN, Number.isFinite(altKomsu) ? altKomsu + 1 : ESIK_MUTLAK_MIN);
  const hamMax = Math.min(tavan, Number.isFinite(ustKomsu) ? ustKomsu - 1 : tavan);

  // Tavan komsudan kucukse (pencere bugun kisa) min > max cikabilir; stepper'i
  // kilitlemek yerine daralt (min'e sabitle).
  return { min, max: Math.max(min, hamMax) };
}

/**
 * Sabit sınırlı yüzeylerde (cuma, camiye gitme, yatış, takvim) eşik seçicisini KOMŞU
 * adımlara kilitler. Ek yüzeylerin normalize'ı eşikleri tekilleştirir: iki adım aynı eşiğe
 * çekilseydi biri (metni ve kanallarıyla) SESSİZCE düşerdi. Muhafızdaki
 * `esikSinirlariniHesapla` kuralının ikizi; tek fark sınırların yüzeyin `esikAdimDk`
 * ızgarasına oturmasıdır (stepper ızgara dışı değer üretmesin). Kapalı adımlar da kilitler
 * (geri açıldığında çakışmasın). Izgarada yer kalmazsa adımın kendi değerine sabitlenir.
 */
export function komsuyaKilitliSinirlar(
  taban: EsikSinirlari,
  seviyeler: SeviyeAyari[],
  indeks: number,
  adimDk: number
): EsikSinirlari {
  if (indeks < 0 || indeks >= seviyeler.length) return taban;
  const esik = seviyeler[indeks].esikDk;
  const adim = Math.max(1, adimDk);
  let alt = -Infinity;
  let ust = Infinity;
  for (let i = 0; i < seviyeler.length; i++) {
    const diger = seviyeler[i].esikDk;
    if (i === indeks || !Number.isFinite(diger)) continue;
    if (diger < esik && diger > alt) alt = diger;
    if (diger > esik && diger < ust) ust = diger;
    // Eşit eşikli (bozuk/eski) komşu: seçici o değerden uzaklaşabilsin, kilitlenmesin.
  }
  const min = Number.isFinite(alt) ? Math.max(taban.min, Math.ceil((alt + 1) / adim) * adim) : taban.min;
  const max = Number.isFinite(ust) ? Math.min(taban.max, Math.floor((ust - 1) / adim) * adim) : taban.max;
  if (min > max) return { min: Math.min(esik, taban.max), max: Math.min(esik, taban.max) };
  return { min, max };
}
