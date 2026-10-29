/**
 * Ülke (ISO 3166-1 alfa-2) → varsayılan hesap profili. SAF tablo.
 *
 * Her satır kaynağını profilden alır (`HESAP_PROFILLERI[..].kaynakUrl`); `guven` bu ÜLKE
 * için ne kadar emin olduğumuzu söyler (aynı profil bir ülkede ölçülmüş, ötekinde genel
 * olabilir). Tabloda olmayan ülke `mwl` + `genel`e düşer. Araştırma ve ampirik uydurma:
 * `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md` §6.2.
 *
 * Caferî profil hiçbir ülkenin varsayılanı OLAMAZ (sahip kararı 2026-10-24; nöbetçi).
 */
import {
  HESAP_PROFILLERI,
  type HesapProfiliKimligi,
  type IkindiYontemi,
  type ProfilGuveni,
} from './hesapProfilleri';

export interface UlkeVarsayilani {
  profil: HesapProfiliKimligi;
  guven: ProfilGuveni;
  /** Profilin ikindisini bu ülke için ezer (Orta Asya: MWL açıları + asr-ı sânî). */
  ikindi?: IkindiYontemi;
}

const T = (profil: HesapProfiliKimligi, guven: ProfilGuveni, ikindi?: IkindiYontemi): UlkeVarsayilani =>
  ikindi ? { profil, guven, ikindi } : { profil, guven };

export const ULKE_VARSAYILANLARI: Readonly<Record<string, UlkeVarsayilani>> = {
  // Türkiye ve Türk diasporasının yoğun olduğu Avrupa: Diyanet (Avrupa'da 45° üstü yatsı
  // Diyanet'in kendi tablosundan 5–7 dk sapar → ekran bilgi satırı gösterir).
  TR: T('diyanet', 'olculdu'),
  CY: T('diyanet', 'genel'),
  DE: T('diyanet', 'genel'), AT: T('diyanet', 'genel'), NL: T('diyanet', 'genel'),
  BE: T('diyanet', 'genel'), CH: T('diyanet', 'genel'), DK: T('diyanet', 'genel'),
  // Körfez
  SA: T('ummulKura', 'kaynakli'),
  AE: T('dubai', 'kaynakli'),
  QA: T('katar', 'kaynakli'),
  KW: T('kuveyt', 'kaynakli'),
  BH: T('ummulKura', 'genel'),
  OM: T('mwl', 'genel'),
  YE: T('mwl', 'genel'),
  // Levant, Mısır, Irak, İran
  EG: T('misir', 'kaynakli'),
  JO: T('urdun', 'olculdu'),
  PS: T('urdun', 'genel'),
  LB: T('misir', 'genel'),
  SY: T('misir', 'genel'),
  IQ: T('mwl', 'genel'),
  // İran: Tahran yöntemi Caferî hesabıdır (akşam 4,5°); Caferî yalnız elle seçilir (sahip kararı).
  IR: T('mwl', 'genel'),
  // Mağrip ve Afrika
  MA: T('fas', 'genel'),
  DZ: T('mwl', 'genel'),
  TN: T('tunus', 'genel'),
  LY: T('misir', 'genel'),
  SD: T('misir', 'genel'),
  NG: T('mwl', 'genel'), SN: T('mwl', 'genel'), ML: T('mwl', 'genel'),
  NE: T('mwl', 'genel'), TD: T('mwl', 'genel'),
  SO: T('misir', 'genel'), ET: T('misir', 'genel'), KE: T('misir', 'genel'), TZ: T('misir', 'genel'),
  ZA: T('karachi', 'genel'),
  // Güney Asya: camiler ikindiyi asr-ı sânîde okur.
  PK: T('karachi', 'kaynakli'),
  IN: T('karachi', 'kaynakli'),
  BD: T('karachi', 'kaynakli'),
  AF: T('karachi', 'genel'),
  // Güneydoğu Asya
  ID: T('kemenag', 'olculdu'),
  MY: T('jakim', 'olculdu'),
  SG: T('muis', 'olculdu'),
  BN: T('muis', 'genel'),
  PH: T('mwl', 'genel'),
  // Orta Asya ve Kafkasya: Hanefî, açılar doğrulanmadı.
  UZ: T('mwl', 'genel', 'sani'), KZ: T('mwl', 'genel', 'sani'), KG: T('mwl', 'genel', 'sani'),
  TJ: T('mwl', 'genel', 'sani'), TM: T('mwl', 'genel', 'sani'),
  AZ: T('mwl', 'genel'),
  RU: T('mwl', 'genel'),
  // Balkanlar
  BA: T('bosna', 'olculdu'),
  AL: T('bosna', 'genel'), XK: T('bosna', 'genel'), MK: T('bosna', 'genel'),
  // Kuzey Avrupa (yüksek enlem kuralı profilden bağımsız uygulanır)
  GB: T('moonsighting', 'kaynakli'),
  IE: T('moonsighting', 'genel'),
  FR: T('mwl', 'genel'),
  NO: T('mwl', 'genel'), SE: T('mwl', 'genel'), FI: T('mwl', 'genel'),
  // Kuzey Amerika ve Okyanusya
  US: T('isna', 'kaynakli'),
  CA: T('kanada', 'kaynakli'),
  AU: T('mwl', 'genel'),
};

export const GENEL_VARSAYILAN: UlkeVarsayilani = { profil: 'mwl', guven: 'genel' };

/** Ülke koduna göre varsayılan; bilinmeyen/boş kod genel yönteme düşer. */
/** ISO kodu büyük harfe (yalnız ASCII; `toUpperCase` yasağı Türkçe içindir ama tek yol bu). */
const kodNormal = (ulkeKodu: string): string =>
  ulkeKodu.length === 2 ? ulkeKodu.replace(/[a-z]/g, (h) => String.fromCharCode(h.charCodeAt(0) - 32)) : '';

/**
 * Varsayılanı KULLANICININ seçtiği ülkeler: iki takvim yaygın, uygulama birini seçmez.
 * Kurulum yöntemi kendiliğinden kurmaz; bölge kartı iki takvimi EŞİT seçenek olarak sorar
 * (önerilen yok), kullanıcı ikisinden birini seçince bir daha sorulmaz.
 * Sahip kararı (2026-10-29): Azerbaycan'da Sünnî (MWL) ve QMİ'nin Caferî takvimi eşit.
 */
export const ULKE_ALTERNATIFLERI: Readonly<Record<string, HesapProfiliKimligi>> = {
  AZ: 'qmi',
};

/** Ülkede eşit iki takvim varsa `[varsayılan profil, alternatif]`; yoksa null. */
export function esitSecenekler(ulkeKodu: string | null | undefined): readonly [HesapProfiliKimligi, HesapProfiliKimligi] | null {
  if (!ulkeKodu) return null;
  const alternatif = ULKE_ALTERNATIFLERI[kodNormal(ulkeKodu)];
  return alternatif ? [ulkeVarsayilani(ulkeKodu).profil, alternatif] : null;
}

/**
 * Bölge kartının önerisi: ülke varsayılanı; `alternatif` varsa iki takvim EŞİT seçenektir
 * (`profil` yalnız sıradır, öneri değil).
 */
export interface BolgeOnerisi extends UlkeVarsayilani {
  alternatif?: HesapProfiliKimligi;
}

export function ulkeVarsayilani(ulkeKodu: string | null | undefined): UlkeVarsayilani {
  if (!ulkeKodu) return GENEL_VARSAYILAN;
  const kod = kodNormal(ulkeKodu);
  const v = ULKE_VARSAYILANLARI[kod];
  if (!v || HESAP_PROFILLERI[v.profil]?.yalnizElle) return GENEL_VARSAYILAN;
  return v;
}

/**
 * "Bölgenizin takvimine geçelim mi?" kartı gösterilmeli mi? Önerilecek varsayılanı ya da
 * `null` döner. Ülke başına BİR KEZ sorulur (`sorulanUlkeler`); yöntem asla sessizce değişmez.
 */
export function bolgeOnerisi(
  ulkeKodu: string | null | undefined,
  ayar: { profil: HesapProfiliKimligi; ikindi?: IkindiYontemi; sorulanUlkeler?: string[] },
): BolgeOnerisi | null {
  if (!ulkeKodu || ayar.sorulanUlkeler?.includes(ulkeKodu)) return null;
  const v = ulkeVarsayilani(ulkeKodu);
  const alternatif = ULKE_ALTERNATIFLERI[kodNormal(ulkeKodu)];
  // Eşit iki takvimden birini zaten kullanan kişiye sorulmaz (seçim onundur).
  if (alternatif) return ayar.profil === alternatif || ayar.profil === v.profil ? null : { ...v, alternatif };
  const onerilenIkindi = v.ikindi ?? HESAP_PROFILLERI[v.profil].ikindi;
  const mevcutIkindi = ayar.ikindi ?? HESAP_PROFILLERI[ayar.profil]?.ikindi;
  if (v.profil === ayar.profil && onerilenIkindi === mevcutIkindi) return null;
  return v;
}
