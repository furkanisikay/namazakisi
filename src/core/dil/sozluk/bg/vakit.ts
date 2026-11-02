// Bulgarca Kiril: `buyuk` elle yazılır (`toUpperCase` YASAK; ъ ь ю я щ → Ъ Ь Ю Я Щ).
import type { Sozluk } from '../tr';

/**
 * Terim kararları (kaynak: dalga 11 terim tablosu > Bulgarca; Başmüftülük grandmufti.bg,
 * QuranEnc `bulgarian_translation`, HadeethEnc bg). Vakit adları Başmüftülük vakit kutusunun
 * karşılıklarıdır: Зора · Изгрев · Обяд · Следобяд · Залез · Нощ. Cins isim oldukları için ("обяд"
 * tek başına öğle yemeği de demek) cümle içinde de BÜYÜK harfle, vakit adı olarak yazılır
 * ("времето за Обяд"); yalnız "изгрев" küçük. Namaz = "намаз" (Başmüftülük "Времена за намаз").
 * Düz anlatımda fiil "изпълнявам намаза" ("Kıldım" = "Изпълних намаза": aorist, cinsiyetsiz;
 * perfekt "изпълнил/а съм" YAZILMAZ); ibadete çağrı meal 2:43 "Извършвайте намаза",
 * "Застанете за намаз". Cuma = "Джума" (HadeethEnc "джума намаз"). Allah "Аллах", kıble "кибля"
 * (meal 2:142), cami "джамия", abdest "абдест", ezan "езан", nafile "нафиле" (HadeethEnc 65003),
 * Ramazan "Рамазан" (Başmüftülük bayram adı). DOĞRULANMADI (kaynak bulunamadı): kaza "каза намаз",
 * kerahat "нежелано време" (betimleyici), vitir "витр", teheccüd "техеджуд", sahur "сахур".
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Зора', gunes: 'Изгрев', ogle: 'Обяд', ikindi: 'Следобяд', aksam: 'Залез', yatsi: 'Нощ' },
  buyuk: { imsak: 'ЗОРА', gunes: 'ИЗГРЕВ', ogle: 'ОБЯД', ikindi: 'СЛЕДОБЯД', aksam: 'ЗАЛЕЗ', yatsi: 'НОЩ' },
  kucuk: { imsak: 'Зора', gunes: 'изгрев', ogle: 'Обяд', ikindi: 'Следобяд', aksam: 'Залез', yatsi: 'Нощ' },
  /** Çizelge satırı fecir adıdır (Başmüftülük kutusu "Зора"). */
  imsakVakti: 'Зора',
  cuma: 'Джума',
  cumaKucuk: 'Джума',
  gunesDogusu: 'Изгрев',
  gunesDogusuKucuk: 'изгрев',
  durum: { kilindi: 'Изпълнен', vaktiGeldi: 'Време е', girmedi: 'Още не е време', gecti: 'Неизпълнен' },
  durumKucuk: { kilindi: 'изпълнен', vaktiGeldi: 'време е', girmedi: 'още не е време', gecti: 'неизпълнен' },
  eylem: { kildim: 'Изпълних намаза', kilindi: 'Изпълнен' },
  kerahatVakti: 'Нежелано време',
  isaretle: 'Отбележете като изпълнен',
  geriAlEtiketi: '{durum}, докоснете за отмяна',
  geriAlindi: 'Отметката е премахната',
};
