import type { Sozluk } from '../tr';

/**
 * Vakit adları Кыргызстан мусулмандарынын дин башкармалыгы (muftiyat.kg) kullanımıyla:
 * Багымдат · Күн чыгыш · Бешим · Аср · Шам · Куптан; cuma "Жума". Kırgızcada namaz adları
 * cins isimdir → cümle içinde küçük harf (`kucuk`), `buyuk` elle büyük harf. Ek almaları
 * gerektiğinde ad değil ardından gelen "намазы"/"убактысы" çekilir ("бешим намазына").
 * Çizelgenin sabah satırı (`imsakVakti`) fecir adıdır: "Багымдат". "Kıldım" = "Окудум"
 * (namaz окуу), durum "Окулду".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Багымдат', gunes: 'Күн чыгыш', ogle: 'Бешим', ikindi: 'Аср', aksam: 'Шам', yatsi: 'Куптан' },
  buyuk: { imsak: 'БАГЫМДАТ', gunes: 'КҮН ЧЫГЫШ', ogle: 'БЕШИМ', ikindi: 'АСР', aksam: 'ШАМ', yatsi: 'КУПТАН' },
  kucuk: { imsak: 'багымдат', gunes: 'күн чыгыш', ogle: 'бешим', ikindi: 'аср', aksam: 'шам', yatsi: 'куптан' },
  imsakVakti: 'Багымдат',
  cuma: 'Жума',
  cumaKucuk: 'жума',
  gunesDogusu: 'Күн чыгыш',
  gunesDogusuKucuk: 'күн чыгыш',
  durum: { kilindi: 'Окулду', vaktiGeldi: 'Убактысы кирди', girmedi: 'Азырынча кире элек', gecti: 'Окулган жок' },
  durumKucuk: { kilindi: 'окулду', vaktiGeldi: 'убактысы кирди', girmedi: 'азырынча кире элек', gecti: 'окулган жок' },
  eylem: { kildim: 'Окудум', kilindi: 'Окулду' },
  kerahatVakti: 'Макрух убакыт',
  isaretle: 'Окулду деп белгилөө',
  geriAlEtiketi: '{durum}, кайтаруу үчүн басыңыз',
  geriAlindi: 'Белги алынды',
};
