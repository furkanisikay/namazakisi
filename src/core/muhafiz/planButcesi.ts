/**
 * Plan butcesi (Faz 0) — bir seviyenin tek vakitte uretebilecegi uyari sayisini
 * sinirlar.
 *
 * NEDEN: esik tavani artik vaktin gercek penceresinden geliyor (720 dk'ya kadar).
 * `TEKRAR_MIN_DK = 1` ile kurulmus bir adim tek vakitte 720 bildirim + (sesli
 * modda) 720 exact alarm uretebilirdi; Android'in es zamanli alarm siniri (~500)
 * tek vakitte asilirdi.
 *
 * SINIR SEVIYE BASINADIR: dort adimli bir vakitte toplam ~60, bes vakitte ~300
 * uyari eder — alarm sinirinin guvenli altinda.
 *
 * BUTCE `motorAdaptoru.seviyeTetiklenirMi` ICINDE uygulanir, plan ureticisinde
 * DEGIL: ureticiye konsaydi arka plan seyrelir ama on plan (`kontrolEt`) ham
 * siklikla calisip banner'i her dakika gosterirdi ve `AkisOnizlemeModal` gercek
 * davranisi yansitmazdi (AGENTS.md'de kayitli cift-anons dersi).
 *
 * SAF: `Logger` dahil hicbir store/native bagimliligi YOK — seyreltme logu
 * `ArkaplanMuhafizServisi`'nde atilir.
 */
import type { SeviyeAyari, Siklik } from './matrisTipleri';

/** Bir SEVIYENIN tek vakitte uretebilecegi en fazla uyari sayisi. */
export const PLAN_ADIM_UST_SINIRI = 15;

/**
 * Seviyenin GERCEKTEN kazandigi dakika acikligi (cikis yonu).
 *
 * Esigi dogrudan kullanmak yanlis olurdu: `aktifSeviyeyiBul` "kapsayan icinden
 * en KUCUK esik kazanir" der, yani 45 dk'lik nazik adim 45..26 arasinda (bir alt
 * komsu 25 ise) yalnizca 20 dakika konusur. Esikten turetilen butce orta
 * seviyeleri gereksiz seyreltir ve "seyreltildi" bilgi satirini neredeyse her
 * adimda yakardi.
 *
 * KAPALI komsu ATLANIR — `aktifSeviyeyiBul`'un sessiz-atlama kuraliyla ayni:
 * kapali adim pencere saglamaz, segmentini ustteki devralir.
 *
 * FAZ 1 (giris yonu) icin ikizi: `span = (bir sonraki daha sert ACIK komsunun
 * esigi ?? pencereUzunluguDk) - esikDk`.
 */
export function cikisSegmentiHesapla(seviyeler: SeviyeAyari[], seviye: SeviyeAyari): number {
  const altKomsuEsigi = seviyeler.reduce(
    (enBuyuk, s) =>
      s !== seviye && s.mod !== 'sessiz' && s.esikDk < seviye.esikDk && s.esikDk > enBuyuk
        ? s.esikDk
        : enBuyuk,
    0
  );
  return seviye.esikDk - altKomsuEsigi;
}

/**
 * Butceye uyacak sekilde seyreltilmis siklik.
 *
 * `max(herDk, ceil(span / PLAN_ADIM_UST_SINIRI))` — deger degismiyorsa AYNI
 * referans doner (kimlik korunur, gereksiz fark uretilmez).
 *
 * `'birkez'` sikliga HIC DOKUNULMAZ: zaten tek atistir.
 */
export function etkinSiklikHesapla(span: number, siklik: Siklik): Siklik {
  if (siklik === 'birkez') return siklik;

  const herDk = siklik.herDk;
  if (!Number.isFinite(herDk) || herDk <= 0) return siklik; // motor kendi kapisinda susturur
  if (!Number.isFinite(span) || span <= 0) return siklik;

  const gerekli = Math.ceil(span / PLAN_ADIM_UST_SINIRI);
  return gerekli > herDk ? { herDk: gerekli } : siklik;
}
