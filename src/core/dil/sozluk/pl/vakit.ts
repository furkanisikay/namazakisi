// Lehçede `buyuk` elle yazılır (`toUpperCase` YASAK; ą ć ę ł ń ó ś ź ż → Ą Ć Ę Ł Ń Ó Ś Ź Ż).
import type { Sozluk } from '../tr';

/**
 * Terim kararları (kaynak: dalga 11 terim tablosu > Lehçe; MZR "Modlitwa", MZR Kur'an 2018,
 * IslamHouse pl, pl.wikipedia "Salat (modlitwa)"). Namaz = "modlitwa" (MZR); Allah = "Allah"
 * (arayüz; MZR meali "Bóg" der, yalnız ayet metninde kalır). Vakit adları Vikipedi/PWN Lehçe
 * yazımı, özel ad olarak cümle içinde de büyük harfle başlar ve ÇEKİLMEZ ("modlitwa Asr"; çekim
 * "modlitwa" sözcüğünde): Fadżr · Wschód słońca · Zuhr · Asr · Maghrib · Isza. Yalnız "wschód
 * słońca" cins isimdir. Cuma "Dżumu’a" (IslamHouse), cümle içinde "modlitwa piątkowa" (MZR).
 * "Kıldım" ve durum CİNSİYETSİZ, kişisiz ("Modlitwa odprawiona", düğmede "Odprawiono";
 * "modliłem/modliłam się" yazılmaz). Çağrı: "Odprawiaj modlitwę" (MZR 17:78), "Stań do modlitwy".
 * Kaza "zaległa modlitwa" (MZR oruç için "odrobić"; namaz için DOĞRULANMADI), nafile "modlitwa
 * dobrowolna" (IslamHouse), kıble "kibla" (Vikipedi), kerahat "czas niezalecany" (betimleyici,
 * DOĞRULANMADI).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fadżr', gunes: 'Wschód słońca', ogle: 'Zuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isza' },
  buyuk: { imsak: 'FADŻR', gunes: 'WSCHÓD SŁOŃCA', ogle: 'ZUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISZA' },
  kucuk: { imsak: 'Fadżr', gunes: 'wschód słońca', ogle: 'Zuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isza' },
  /** Çizelge satırı fecir adıdır ("Imsak" çoğu çizelgede fecirden önceki ihtiyat saati). */
  imsakVakti: 'Fadżr',
  cuma: 'Dżumu’a',
  cumaKucuk: 'Dżumu’a',
  gunesDogusu: 'Wschód słońca',
  gunesDogusuKucuk: 'wschód słońca',
  durum: { kilindi: 'Odprawiona', vaktiGeldi: 'Czas modlitwy', girmedi: 'Jeszcze nie czas', gecti: 'Nieodprawiona' },
  durumKucuk: { kilindi: 'odprawiona', vaktiGeldi: 'czas modlitwy', girmedi: 'jeszcze nie czas', gecti: 'nieodprawiona' },
  eylem: { kildim: 'Modlitwa odprawiona', kilindi: 'Odprawiona' },
  kerahatVakti: 'Czas niezalecany',
  isaretle: 'Oznacz jako odprawioną',
  geriAlEtiketi: '{durum}, dotknij, aby cofnąć',
  geriAlindi: 'Oznaczenie cofnięte',
};
