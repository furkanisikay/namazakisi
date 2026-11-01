// Portekizce Avrupa/Afrika normu (pt-PT; Mozambik, Gine-Bissau): Brezilya yazımı değil.
import type { Sozluk } from '../tr';

/**
 * Portekizcede vakit adları Lizbon İslam Cemaati (CIL) çizelgesinin yazımıyla: Fajr, Nascer do Sol,
 * Zuhr, Assr, Magrib, Ishá; cuma "Jumu’ah" (CIL; kesme ’ U+2019, Android kaçışı gerekmez). Ad özel
 * addır, cümle içinde de büyük harfle başlar; yalnız "nascer do sol" cümle içinde küçük. Ad önünde
 * artikel yok ("a oração de {ad}", "a hora de {ad}"): Jumu’ah ile cinsiyet uyuşmazlığı çıkmasın.
 * Namaz "oração" (dişil), fiil "rezar" (IslamHouse pt, CIL "efetuar"); durum "Rezada", düğme
 * "Rezei" (IslamHouse kaynaklı 1. tekil). Kaza "reposição" (fiil "repor a oração", IslamHouse; isim
 * türetildi), nafile "oração voluntária", kıble "Quibla", kerahat "horário proibido", ezan "Azán",
 * abdest "ablução", cami "mesquita", seri "sequência", muhafız "Guardião da Oração", hesap yöntemi
 * "método de cálculo", "Allah kabul etsin" "Que Allah aceite". Hitap kişisiz 3. tekil kibar emir
 * ("Selecione", "Tente novamente"), "você" yok; makineye komut (düğme) mastar ("Guardar").
 * İbadete çağrı aynı saygılı kipte kısa emir: "Cumpra a oração" (17:78 kalıbı). Avrupa sözcükleri:
 * ecrã, telemóvel, definições, utilizador, ficheiro, aplicação; AO1990 imlası.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Nascer do Sol', ogle: 'Zuhr', ikindi: 'Assr', aksam: 'Magrib', yatsi: 'Ishá' },
  buyuk: { imsak: 'FAJR', gunes: 'NASCER DO SOL', ogle: 'ZUHR', ikindi: 'ASSR', aksam: 'MAGRIB', yatsi: 'ISHÁ' },
  kucuk: { imsak: 'Fajr', gunes: 'nascer do sol', ogle: 'Zuhr', ikindi: 'Assr', aksam: 'Magrib', yatsi: 'Ishá' },
  /** Çizelgedeki sabah satırı fecrin girişidir (Imsak ihtiyat saati değil). */
  imsakVakti: 'Fajr',
  cuma: 'Jumu’ah',
  cumaKucuk: 'Jumu’ah',
  gunesDogusu: 'Nascer do Sol',
  gunesDogusuKucuk: 'nascer do sol',
  durum: { kilindi: 'Rezada', vaktiGeldi: 'É a hora', girmedi: 'Ainda não é a hora', gecti: 'Não rezada' },
  durumKucuk: { kilindi: 'rezada', vaktiGeldi: 'é a hora', girmedi: 'ainda não é a hora', gecti: 'não rezada' },
  eylem: { kildim: 'Rezei', kilindi: 'Rezada' },
  kerahatVakti: 'Horário proibido',
  isaretle: 'Marcar como rezada',
  geriAlEtiketi: '{durum}, toque para anular',
  geriAlindi: 'Marca removida',
};
