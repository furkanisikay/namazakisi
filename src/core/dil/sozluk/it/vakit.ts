// İtalyancada `buyuk` elle yazılır (`toUpperCase` YASAK).
import type { Sozluk } from '../tr';

/**
 * İtalyanca terim kararları (kaynak: dalga 10 terim tablosu). Vakit adları IslamHouse kitapçığı
 * "La Modalità di Preghiera del Profeta" yazımıyla, ʿ işaretsiz: Fajr, Zuhr, Asr, Maghrib, Isha;
 * güneş meal 50:39 "sorgere del sole" (küçük harf, cümle içinde de). Vakit adları özel addır,
 * cümle içinde büyük harfle başlar; artikel eril ("il Fajr", "l’Asr"). Cuma "Jumu’ah" (kitapçık).
 * Namaz "preghiera" (dişil; "salat"/"Salēt" yok); durum "Compiuta", düğme "Ho pregato"
 * (türetildi, 1. tekil geçmiş cinsiyetsiz). Kaza "recupero" / "preghiera da recuperare"
 * (HadeethEnc fiili "recuperare"; isim türetildi), nafile "preghiera supererogatoria"
 * (kitapçık), kıble "qibla", abdest "abluzione", cami "moschea", ezan "adhan", seri "serie",
 * muhafız "Custode della preghiera", kerahat "tempo makruh" (doğrulanmadı). Hitap "Lei"
 * (3. tekil kibar: "Selezioni"), ibadete çağrı da Lei + kısa emir ("Compia la preghiera").
 * Kesme işareti hep ’ (U+2019; Android kaçışı gerekmez). "Allāh" makronu arayüze taşınmaz.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Sorgere del sole', ogle: 'Zuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SORGERE DEL SOLE', ogle: 'ZUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'sorgere del sole', ogle: 'Zuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  /** Çizelgedeki sabah satırı fecrin girişidir (Imsak ihtiyat saati değil). */
  imsakVakti: 'Fajr',
  cuma: 'Jumu’ah',
  cumaKucuk: 'Jumu’ah',
  gunesDogusu: 'Sorgere del sole',
  gunesDogusuKucuk: 'sorgere del sole',
  durum: { kilindi: 'Compiuta', vaktiGeldi: 'È l’ora', girmedi: 'Non è ancora l’ora', gecti: 'Non compiuta' },
  durumKucuk: { kilindi: 'compiuta', vaktiGeldi: 'è l’ora', girmedi: 'non è ancora l’ora', gecti: 'non compiuta' },
  eylem: { kildim: 'Ho pregato', kilindi: 'Compiuta' },
  kerahatVakti: 'Tempo makruh',
  isaretle: 'Segnare come compiuta',
  geriAlEtiketi: '{durum}, tocchi per annullare',
  geriAlindi: 'Segno rimosso',
};
