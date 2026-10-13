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
import { adimKapaliMi } from './kanalKumesi';

/** Bir SEVIYENIN tek vakitte uretebilecegi en fazla uyari sayisi. */
export const PLAN_ADIM_UST_SINIRI = 15;

/**
 * Bir VAKTIN tek pencerede uretebilecegi en fazla uyari sayisi (issue #274).
 *
 * Vakit artik 1..6 adim tasiyabilir; seviye basi 15 tek basina 6 x 15 = 90
 * eder. Vakit tavani 60 → bes vakitte 300, Android muhafiz alarm butcesinin
 * (360) altinda kalir. Dort adimli vakitte seviye basi butce yine 15'tir
 * (4 x 15 = 60) → varsayilan matris ve mevcut hicbir kayit seyrelmez.
 */
export const VAKIT_PLAN_UST_SINIRI = 60;

/**
 * Seviye basina butce — vakit tavanini ACIK adim sayisina esit bolustur.
 *
 * `min(PLAN_ADIM_UST_SINIRI, floor(VAKIT_PLAN_UST_SINIRI / acikAdimSayisi))`:
 * 1–4 adim 15, 5 adim 12, 6 adim 10. Her seviye kendi segmentinde en fazla bu
 * kadar tetiklenir (`etkinSiklikHesapla` bunu garanti eder), yani toplam
 * `acikAdimSayisi x butce <= 60`.
 *
 * NEDEN ESIT BOLUSUM (ve vakit toplaminin dinamik dagitimi DEGIL): kural her
 * dakika icin SAF ve yerel kalmali — `seviyeTetiklenirMi` tek bir dakikaya
 * bakar; butce kardes listesinden turetilebildigi icin on plan, arka plan ve
 * onizleme ayni sonucu verir (cift-anons dersi).
 */
export function adimButcesiHesapla(acikAdimSayisi: number): number {
  if (!Number.isFinite(acikAdimSayisi) || acikAdimSayisi <= 0) return PLAN_ADIM_UST_SINIRI;
  return Math.max(
    1,
    Math.min(PLAN_ADIM_UST_SINIRI, Math.floor(VAKIT_PLAN_UST_SINIRI / acikAdimSayisi))
  );
}

/** Kardes listesinden seviye basi butce (kapali adim sayilmaz — hic tetiklenmez). */
export function kardeslerdenButce(kardesler: readonly SeviyeAyari[]): number {
  return adimButcesiHesapla(kardesler.filter((s) => !adimKapaliMi(s.kanallar)).length);
}

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
 * FAZ 1 (giris yonu) icin ikizi: `girisSegmentiHesapla`.
 */
export function cikisSegmentiHesapla(seviyeler: SeviyeAyari[], seviye: SeviyeAyari): number {
  const altKomsuEsigi = seviyeler.reduce(
    (enBuyuk, s) =>
      s !== seviye && !adimKapaliMi(s.kanallar) && s.esikDk < seviye.esikDk && s.esikDk > enBuyuk
        ? s.esikDk
        : enBuyuk,
    0
  );
  return seviye.esikDk - altKomsuEsigi;
}

/**
 * `cikisSegmentiHesapla`nin GIRIS yonundeki ikizi.
 *
 * Giris yonunde sira ARTANdir ve "kapsayan icinden en BUYUK esik kazanir": bir
 * adim kendi esiginden, bir SONRAKI daha sert ACIK komsunun esigine kadar
 * konusur. En sert adimin komsusu yoktur → PENCERE SONUNA kadar kazanir; bu
 * yuzden segment icin pencere uzunlugu sarttir.
 *
 * Pencere bilinmiyorsa guvenli taban seviyenin KENDI esigidir (cikis yonundeki
 * `kardesler` verilmemis dali ile ayni temkin): butce daha siki hesaplanir,
 * ayrisma degil yalnizca fazladan seyreltme riski dogar.
 *
 * KAPALI komsu ATLANIR — `aktifSeviyeyiBul`un sessiz-atlama kuraliyla ayni.
 */
export function girisSegmentiHesapla(
  seviyeler: SeviyeAyari[],
  seviye: SeviyeAyari,
  pencereUzunluguDk?: number
): number {
  const ustKomsuEsigi = seviyeler.reduce<number | null>(
    (enKucuk, s) =>
      s !== seviye &&
      !adimKapaliMi(s.kanallar) &&
      s.esikDk > seviye.esikDk &&
      (enKucuk === null || s.esikDk < enKucuk)
        ? s.esikDk
        : enKucuk,
    null
  );

  if (ustKomsuEsigi !== null) return ustKomsuEsigi - seviye.esikDk;

  const pencereGecerli =
    Number.isFinite(pencereUzunluguDk) && (pencereUzunluguDk as number) > seviye.esikDk;
  return pencereGecerli ? (pencereUzunluguDk as number) - seviye.esikDk : seviye.esikDk;
}

/**
 * Butceye uyacak sekilde seyreltilmis siklik.
 *
 * `max(herDk, ceil(span / butce))` — deger degismiyorsa AYNI referans doner
 * (kimlik korunur, gereksiz fark uretilmez). Segmentteki tetik sayisi
 * `floor((span - 1) / herDk) + 1 <= butce` olur.
 *
 * `'birkez'` sikliga HIC DOKUNULMAZ: zaten tek atistir.
 *
 * @param butce Seviye basi ust sinir; verilmezse `PLAN_ADIM_UST_SINIRI`.
 */
export function etkinSiklikHesapla(
  span: number,
  siklik: Siklik,
  butce: number = PLAN_ADIM_UST_SINIRI
): Siklik {
  if (siklik === 'birkez') return siklik;

  const herDk = siklik.herDk;
  if (!Number.isFinite(herDk) || herDk <= 0) return siklik; // motor kendi kapisinda susturur
  if (!Number.isFinite(span) || span <= 0) return siklik;

  const gerekli = Math.ceil(span / Math.max(1, butce));
  return gerekli > herDk ? { herDk: gerekli } : siklik;
}

/**
 * Bir adimin ETKIN sikligi — `seviyeTetiklenirMi` ve ekran notu (`AdimNotlari`)
 * AYNI hesaptan gecsin diye tek yer. Segment yone gore, butce kardeslerden.
 */
export function adimEtkinSikligi(
  seviye: SeviyeAyari,
  kardesler: SeviyeAyari[],
  yon: 'cikisaDogru' | 'girisindenItibaren',
  pencereUzunluguDk?: number
): Siklik {
  const segment =
    yon === 'girisindenItibaren'
      ? girisSegmentiHesapla(kardesler, seviye, pencereUzunluguDk)
      : cikisSegmentiHesapla(kardesler, seviye);
  return etkinSiklikHesapla(segment, seviye.siklik, kardeslerdenButce(kardesler));
}
