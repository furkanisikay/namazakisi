/**
 * Vakit adı takımları — aynı dilde birden çok yerleşik adlandırma geleneği olduğunda
 * (Almancada "Fajr" / "Sabah" / "Morgengebet", Fransızcada ülkeye göre "Dohr" / "Dhuhr")
 * kullanıcının seçebileceği seçenekler.
 *
 * Sözlüğün kendi `vakit.*` adları her dilin TEMEL takımıdır (kimliği `TEMEL_TAKIM`);
 * buradaki kayıt yalnız ALTERNATİFLERİ tutar. Tek otoritesi olan dilde (id, ms, bs, ru)
 * kayıt yoktur, seçici görünmez. Çözüm sırası: kullanıcının açık seçimi → ülke varsayılanı
 * → temel takım. Bilinmeyen kimlik yok sayılır (yedekten gelen eski kimlik).
 *
 * `buyuk` elle yazılır (`toUpperCase` Türkçe İ/ı'yı bozar). SAF çekirdek.
 */
import type { DilKodu } from './diller';
import type { Sozluk } from './sozluk/tr';

/** Takımın geçersiz kıldığı adlandırma alanları (sözlükteki `vakit` dalının alt kümesi). */
export const TAKIM_ALANLARI = [
  'adlar',
  'buyuk',
  'kucuk',
  'imsakVakti',
  'cuma',
  'cumaKucuk',
  'gunesDogusu',
  'gunesDogusuKucuk',
] as const;

type VakitDali = Sozluk['vakit'];
type AdHaritasi = { readonly [K in keyof VakitDali['adlar']]: string };

export interface VakitAdlari {
  readonly adlar: AdHaritasi;
  readonly buyuk: AdHaritasi;
  readonly kucuk: AdHaritasi;
  readonly imsakVakti: string;
  readonly cuma: string;
  readonly cumaKucuk: string;
  readonly gunesDogusu: string;
  readonly gunesDogusuKucuk: string;
}

export type TakimEtiketi = keyof Sozluk['dilAyar']['vakitAdlari']['takimlar'];

export interface VakitAdiTakimi {
  /** Kalıcı kimlik (kayıtta tutulur, asla değişmez). */
  readonly id: string;
  /** Seçicideki adı (`dilAyar.vakitAdlari.takimlar`). */
  readonly etiket: TakimEtiketi;
  readonly adlar: VakitAdlari;
}

/** Sözlüğün kendi adları. Kayıtta bu kimlik "temel takımı açıkça seçti" demektir. */
export const TEMEL_TAKIM = 'temel';

/**
 * Dil başına alternatif takımlar. Kaynak: `docs/ajan/coklu-dil.md > Vakit adı takımları`
 * (mağaza uygulamaları, kurum sayfaları, kullanıcı yorumları taraması).
 */
export const VAKIT_TAKIMLARI: Partial<Record<DilKodu, readonly VakitAdiTakimi[]>> = {
  de: [
    {
      // Diyanet DE'nin Almanca adları. Almancada ad cümle içinde de büyük harfle başlar.
      id: 'diyanet-de',
      etiket: 'diyanetDe',
      adlar: {
        adlar: { imsak: 'Morgengebet', gunes: 'Sonnenaufgang', ogle: 'Mittagsgebet', ikindi: 'Nachmittagsgebet', aksam: 'Abendgebet', yatsi: 'Nachtgebet' },
        buyuk: { imsak: 'MORGENGEBET', gunes: 'SONNENAUFGANG', ogle: 'MITTAGSGEBET', ikindi: 'NACHMITTAGSGEBET', aksam: 'ABENDGEBET', yatsi: 'NACHTGEBET' },
        kucuk: { imsak: 'Morgengebet', gunes: 'Sonnenaufgang', ogle: 'Mittagsgebet', ikindi: 'Nachmittagsgebet', aksam: 'Abendgebet', yatsi: 'Nachtgebet' },
        imsakVakti: 'Imsak',
        cuma: 'Freitagsgebet',
        cumaKucuk: 'Freitagsgebet',
        gunesDogusu: 'Sonnenaufgang',
        gunesDogusuKucuk: 'Sonnenaufgang',
      },
    },
    {
      // Türkçe adlar (DİTİB çevresi). Güneş doğuşu açıklayıcı terimdir, Almanca kalır.
      id: 'turkce',
      etiket: 'turkce',
      adlar: {
        adlar: { imsak: 'Sabah', gunes: 'Güneş', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' }, // dil-haric: Türkçe ad takımı (veri; Almanca arayüzde seçilir)
        buyuk: { imsak: 'SABAH', gunes: 'GÜNEŞ', ogle: 'ÖĞLE', ikindi: 'İKİNDİ', aksam: 'AKŞAM', yatsi: 'YATSI' }, // dil-haric: Türkçe ad takımı (veri; Almanca arayüzde seçilir)
        kucuk: { imsak: 'Sabah', gunes: 'Güneş', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' }, // dil-haric: Türkçe ad takımı (veri; Almanca arayüzde seçilir)
        imsakVakti: 'İmsak', // dil-haric: Türkçe ad takımı (veri; Almanca arayüzde seçilir)
        cuma: 'Cuma',
        cumaKucuk: 'Cuma',
        gunesDogusu: 'Sonnenaufgang',
        gunesDogusuKucuk: 'Sonnenaufgang',
      },
    },
  ],
  fr: [
    {
      // Mağrip yazımı (Tunus, Moritanya; Fas'ta seçenek).
      id: 'magrip',
      etiket: 'magrip',
      adlar: {
        adlar: { imsak: 'Fajr', gunes: 'Chourouk', ogle: 'Dohr', ikindi: 'Asr', aksam: 'Maghreb', yatsi: 'Icha' },
        buyuk: { imsak: 'FAJR', gunes: 'CHOUROUK', ogle: 'DOHR', ikindi: 'ASR', aksam: 'MAGHREB', yatsi: 'ICHA' },
        kucuk: { imsak: 'Fajr', gunes: 'Chourouk', ogle: 'Dohr', ikindi: 'Asr', aksam: 'Maghreb', yatsi: 'Icha' },
        imsakVakti: 'Fajr',
        cuma: 'Joumoua',
        cumaKucuk: 'Joumoua',
        gunesDogusu: 'Lever du soleil',
        gunesDogusuKucuk: 'lever du soleil',
      },
    },
    {
      // Cezayir yazımı: sabah "Sobh".
      id: 'cezayir',
      etiket: 'cezayir',
      adlar: {
        adlar: { imsak: 'Sobh', gunes: 'Chourouk', ogle: 'Dohr', ikindi: 'Asr', aksam: 'Maghreb', yatsi: 'Icha' },
        buyuk: { imsak: 'SOBH', gunes: 'CHOUROUK', ogle: 'DOHR', ikindi: 'ASR', aksam: 'MAGHREB', yatsi: 'ICHA' },
        kucuk: { imsak: 'Sobh', gunes: 'Chourouk', ogle: 'Dohr', ikindi: 'Asr', aksam: 'Maghreb', yatsi: 'Icha' },
        imsakVakti: 'Sobh',
        cuma: 'Joumoua',
        cumaKucuk: 'Joumoua',
        gunesDogusu: 'Lever du soleil',
        gunesDogusuKucuk: 'lever du soleil',
      },
    },
  ],
};

/** Dil başına ülke (ISO 3166-1 alfa-2) → varsayılan takım kimliği. Listede olmayan ülke temel takımı alır. */
export const ULKE_VARSAYILANLARI: Partial<Record<DilKodu, Readonly<Record<string, string>>>> = {
  fr: { DZ: 'cezayir', TN: 'magrip', MR: 'magrip' },
};

/** Dilin seçilebilir takım kimlikleri (temel dahil). Tek seçenekse seçici gösterilmez. */
export function takimKimlikleri(dil: DilKodu): string[] {
  return [TEMEL_TAKIM, ...(VAKIT_TAKIMLARI[dil] ?? []).map((t) => t.id)];
}

function bul(dil: DilKodu, id: unknown): VakitAdiTakimi | null | undefined {
  if (id === TEMEL_TAKIM) return null;
  if (typeof id !== 'string') return undefined;
  return VAKIT_TAKIMLARI[dil]?.find((t) => t.id === id);
}

/** Ülkenin varsayılan takımı; yoksa `null` (temel takım). */
export function ulkeVarsayilani(dil: DilKodu, ulke: string | null): VakitAdiTakimi | null {
  if (!ulke) return null;
  return bul(dil, ULKE_VARSAYILANLARI[dil]?.[ulke]) ?? null;
}

/**
 * Etkin takımı çözer: geçerli açık seçim → ülke varsayılanı → temel. `null` = sözlüğün kendi adları.
 */
export function takimCoz(dil: DilKodu, secim: unknown, ulke: string | null): VakitAdiTakimi | null {
  const acik = bul(dil, secim);
  if (acik !== undefined) return acik;
  return ulkeVarsayilani(dil, ulke);
}
