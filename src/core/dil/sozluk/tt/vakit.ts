// Tatarca Kiril: `buyuk` elle yazılır (`toUpperCase` YASAK; ә ө ү җ ң һ → Ә Ө Ү Җ Ң Һ).
import type { Sozluk } from '../tr';

/**
 * Vakit adları ДУМ РТ (dumrt.ru) namaz vakitleri çizelgesi: Иртәнге · Кояш · Өйлә · Икенде ·
 * Ахшам · Ястү (çizelgede "Иртәнге намаз", "Кояш чыга", "Өйлә намазы" …). Sabah satırı ve
 * `imsakVakti` kısa ad "Иртәнге" (ana oturum kararı; çizelgedeki ayrı fecir satırı "Таң беленә").
 * Vakit adı cins isimdir: cümle içinde küçük harf ("өйлә намазы"). Fiil "уку": "Kıldım" =
 * "Укыдым" (dumrt, kaynaklı), durum "Kılındı" = "Укылды" (türetildi). Kerahat = "мәкруһ вакыт".
 * Hitap: yönetim küçük "сез" + -гыз/-гез; ibadete çağrı "син" + emir ("Намазга бас").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Иртәнге', gunes: 'Кояш', ogle: 'Өйлә', ikindi: 'Икенде', aksam: 'Ахшам', yatsi: 'Ястү' },
  buyuk: { imsak: 'ИРТӘНГЕ', gunes: 'КОЯШ', ogle: 'ӨЙЛӘ', ikindi: 'ИКЕНДЕ', aksam: 'АХШАМ', yatsi: 'ЯСТҮ' },
  kucuk: { imsak: 'иртәнге', gunes: 'кояш чыгу', ogle: 'өйлә', ikindi: 'икенде', aksam: 'ахшам', yatsi: 'ястү' },
  imsakVakti: 'Иртәнге',
  cuma: 'Җомга',
  cumaKucuk: 'җомга',
  gunesDogusu: 'Кояш чыгу',
  gunesDogusuKucuk: 'кояш чыгу',
  durum: { kilindi: 'Укылды', vaktiGeldi: 'Вакыты керде', girmedi: 'Әле кермәде', gecti: 'Укылмады' },
  durumKucuk: { kilindi: 'укылды', vaktiGeldi: 'вакыты керде', girmedi: 'әле кермәде', gecti: 'укылмады' },
  eylem: { kildim: 'Укыдым', kilindi: 'Укылды' },
  kerahatVakti: 'Мәкруһ вакыт',
  isaretle: 'Укылды дип билгеләү',
  geriAlEtiketi: '{durum}, кире кайтару өчен басыгыз',
  geriAlindi: 'Билге алынды',
};
