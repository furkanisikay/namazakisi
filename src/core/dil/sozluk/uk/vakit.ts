// Ukraynaca Kiril: `buyuk` elle yazılır (`toUpperCase` YASAK; і ї є ґ → І Ї Є Ґ).
import type { Sozluk } from '../tr';

/**
 * Terim kararları (kaynak: dalga 10 terim tablosu > Ukraynaca; QuranEnc `ukrainian_yakubovych`,
 * HadeethEnc uk, ДУМУ broşürü). Namaz = "молитва" (yazılı Ukraynaca İslami metinlerin çoğunluğu);
 * Allah = "Аллаг" (meal, HadeethEnc, umma.in.ua; ayet meali de böyle yazar). Vakit adları harf
 * çevirisi, özel ad olarak cümle içinde de büyük harfle başlar ("молитва Зугр"; çekim "молитва"
 * sözcüğünde): Фаджр · Схід сонця · Зугр (meal dipnotu, HadeethEnc) · Аср · Магріб (Arapça غ → г,
 * "Багдад" gibi; Vikipedi "маґріб") · Іша. Yalnız "схід сонця" cins isimdir. "Kıldım" ve durum
 * CİNSİYETSİZ, kişisiz edilgen ("Молитву здійснено"; "помолився/помолилася" yazılmaz). Çağrı:
 * "Звершуйте молитву" (2:43). Kesme işareti U+2019 (’). Kaza "каза" (Müslüman dillerinde ortak
 * alıntı; Ukraynaca isim terimi kaynakta yok), nafile "добровільна молитва" (HadeethEnc), kıble
 * "кибла" (meal 2:142), kerahat "небажаний час" (betimleyici; HadeethEnc 10604).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Фаджр', gunes: 'Схід сонця', ogle: 'Зугр', ikindi: 'Аср', aksam: 'Магріб', yatsi: 'Іша' },
  buyuk: { imsak: 'ФАДЖР', gunes: 'СХІД СОНЦЯ', ogle: 'ЗУГР', ikindi: 'АСР', aksam: 'МАГРІБ', yatsi: 'ІША' },
  kucuk: { imsak: 'Фаджр', gunes: 'схід сонця', ogle: 'Зугр', ikindi: 'Аср', aksam: 'Магріб', yatsi: 'Іша' },
  /** Çizelge satırı fecir adıdır ("Імсак" çoğu çizelgede fecirden önceki ihtiyat saati). */
  imsakVakti: 'Фаджр',
  cuma: 'Джума',
  cumaKucuk: 'Джума',
  gunesDogusu: 'Схід сонця',
  gunesDogusuKucuk: 'схід сонця',
  durum: { kilindi: 'Здійснено', vaktiGeldi: 'Настав час', girmedi: 'Ще не час', gecti: 'Не здійснено' },
  durumKucuk: { kilindi: 'здійснено', vaktiGeldi: 'настав час', girmedi: 'ще не час', gecti: 'не здійснено' },
  eylem: { kildim: 'Молитву здійснено', kilindi: 'Здійснено' },
  kerahatVakti: 'Небажаний час',
  isaretle: 'Позначити як здійснену',
  geriAlEtiketi: '{durum}, торкніться, щоб скасувати',
  geriAlindi: 'Позначку знято',
};
