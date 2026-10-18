/**
 * Android 16 "Live Update" (öne çıkarılmış sayaç) — SAF kurallar (issue #282).
 *
 * Sayaç bildirimleri (`modules/expo-countdown-notification`) API 36+ cihazlarda
 * durum çubuğu çipine ve One UI 8 Now Bar'a taşınabilir. Burada yalnız karar ve
 * hesap vardır; React'a, store'a ve native köprüye bağımlı DEĞİLDİR.
 *
 * KOTLIN İKİZİ: `CanliGuncellemeKurallari.kt`. Kısa metin ("12 dk") ilk gösterimde
 * değil, native taraf HER DAKİKA yeniden çizerken üretilir (JS o an çalışmıyor
 * olabilir) — bu yüzden kural iki dilde de yaşar ve ikisi AYNI fikstürü kabul
 * eder: `modules/expo-countdown-notification/android/src/test/resources/kisa-metin-ornekleri.json`.
 */

export type SayacTemasi = 'vakit' | 'iftar' | 'sahur' | 'seri';

const DAKIKA_MS = 60_000;

/**
 * Öne çıkarılabilecek sayaçlar. SERİ BİLİNÇLİ OLARAK YOK: seri sayacı bir
 * kayıp/tehlike baskısı taşır, durum çubuğuna ve Now Bar'a taşınmaz. Sürekli
 * "sonraki vakit" kartı da YOKTUR (politika) — yalnız kılınmamış vaktin son
 * dakikaları, iftar ve sahur.
 */
export const CANLI_GUNCELLEME_TEMALARI: readonly SayacTemasi[] = ['vakit', 'iftar', 'sahur'];

/** Sahur ilerleme çubuğunda vurgulanan son bölüm: imsaktan önceki bu kadar dakika. */
export const SAHUR_VURGU_DK = 60;

export function canliGuncellemeyeUygunMu(tema: SayacTemasi): boolean {
  return CANLI_GUNCELLEME_TEMALARI.includes(tema);
}

/**
 * Kalan dakika, YUKARI yuvarlanır: 30 sn kala "1 dk" — aşağı yuvarlama son
 * dakikada, geri sayım hâlâ sürerken "0 dk" yazdırırdı.
 */
export function kalanDakika(kalanMs: number): number {
  if (!(kalanMs > 0)) return 0;
  return Math.ceil(kalanMs / DAKIKA_MS);
}

/** Durum çubuğu çipi metni: "12 dk", "1 sa", "1 sa 5 dk". Saniye yok (onu chronometer çizer). */
export function kisaKritikMetin(kalanMs: number): string {
  const dk = kalanDakika(kalanMs);
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  const artan = dk % 60;
  return artan === 0 ? `${sa} sa` : `${sa} sa ${artan} dk`;
}

/**
 * Kısa metnin bir sonraki değişeceği an (`hedef − (dk − 1)·60 sn`); son dakikada
 * ya da hedef geçtiyse `null` (bildirimi bitiş alarmı kaldırır).
 */
export function sonrakiTazelemeMs(simdiMs: number, hedefMs: number): number | null {
  const kalan = hedefMs - simdiMs;
  if (kalan <= 0) return null;
  const dk = kalanDakika(kalan);
  if (dk <= 1) return null;
  return hedefMs - (dk - 1) * DAKIKA_MS;
}

export interface IlerlemeBolumu {
  uzunlukDk: number;
  vurgulu: boolean;
}

/**
 * İlerleme çubuğunun (ProgressStyle) bölümleri.
 *
 * `baslangicMs → hedefMs` aralığı `araSinirlarMs` noktalarından bölünür; başlangıcı
 * `vurguBaslangicMs` ve sonrası olan bölümler "vurgulu" (son dakikalar) çizilir.
 * Sınırlar dakikaya yuvarlanır, sıfır uzunluklu bölüm ATILIR (sistem reddeder) ve
 * aralık dışındaki sınırlar yok sayılır. Aralık geçersizse boş dizi → çubuk çizilmez.
 */
export function ilerlemeBolumleriOlustur(
  baslangicMs: number,
  hedefMs: number,
  araSinirlarMs: readonly number[] = [],
  vurguBaslangicMs?: number
): IlerlemeBolumu[] {
  if (!Number.isFinite(baslangicMs) || !Number.isFinite(hedefMs) || hedefMs <= baslangicMs) return [];
  const toplamDk = Math.round((hedefMs - baslangicMs) / DAKIKA_MS);
  if (toplamDk <= 0) return [];

  const icinde = (t: number) => Number.isFinite(t) && t > baslangicMs && t < hedefMs;
  const sinirMs = [...araSinirlarMs.filter(icinde)];
  if (vurguBaslangicMs !== undefined && icinde(vurguBaslangicMs)) sinirMs.push(vurguBaslangicMs);

  const ofsetler = [0, ...sinirMs.map((t) => Math.round((t - baslangicMs) / DAKIKA_MS)), toplamDk]
    .filter((d) => d >= 0 && d <= toplamDk)
    .sort((a, b) => a - b)
    .filter((d, i, dizi) => i === 0 || d !== dizi[i - 1]);

  const vurguDk =
    vurguBaslangicMs === undefined
      ? Number.POSITIVE_INFINITY
      : vurguBaslangicMs <= baslangicMs
        ? 0
        : Math.round((vurguBaslangicMs - baslangicMs) / DAKIKA_MS);

  const bolumler: IlerlemeBolumu[] = [];
  for (let i = 0; i < ofsetler.length - 1; i++) {
    const uzunlukDk = ofsetler[i + 1] - ofsetler[i];
    if (uzunlukDk > 0) bolumler.push({ uzunlukDk, vurgulu: ofsetler[i] >= vurguDk });
  }
  return bolumler;
}

/** Native köprüye giden öne çıkarma verisi (`CanliGuncellemeSecenekleri` ile yapısal uyumlu). */
export interface CanliGuncellemeYuku {
  baslangicMs: number;
  bolumler: IlerlemeBolumu[];
  kildim?: { tarih: string; vakit: string };
}

/**
 * Vakit sayacı: vaktin GİRİŞİNDEN çıkışına; sayacın başladığı eşikten sonrası
 * vurgulu ("son dakikalar"). "Kıldım" eylemi yalnız burada.
 */
export function vakitCanliYukuOlustur(girdi: {
  girisMs: number;
  cikisMs: number;
  sayacBaslangicMs: number;
  tarih: string;
  vakit: string;
}): CanliGuncellemeYuku {
  return {
    baslangicMs: girdi.girisMs,
    bolumler: ilerlemeBolumleriOlustur(girdi.girisMs, girdi.cikisMs, [], girdi.sayacBaslangicMs),
    kildim: { tarih: girdi.tarih, vakit: girdi.vakit },
  };
}

/**
 * İftar sayacı: GÜN BOYU orucun ilerleyişi — imsak → öğle → ikindi → akşam;
 * son bölüm (ikindi → akşam) vurgulu.
 */
export function iftarCanliYukuOlustur(girdi: {
  imsakMs: number;
  ogleMs: number;
  ikindiMs: number;
  aksamMs: number;
}): CanliGuncellemeYuku {
  return {
    baslangicMs: girdi.imsakMs,
    bolumler: ilerlemeBolumleriOlustur(girdi.imsakMs, girdi.aksamMs, [girdi.ogleMs], girdi.ikindiMs),
  };
}

/** Sahur sayacı: yatsı → imsak; imsaktan önceki son `SAHUR_VURGU_DK` vurgulu. */
export function sahurCanliYukuOlustur(girdi: { yatsiMs: number; imsakMs: number }): CanliGuncellemeYuku {
  return {
    baslangicMs: girdi.yatsiMs,
    bolumler: ilerlemeBolumleriOlustur(
      girdi.yatsiMs,
      girdi.imsakMs,
      [],
      girdi.imsakMs - SAHUR_VURGU_DK * DAKIKA_MS
    ),
  };
}
