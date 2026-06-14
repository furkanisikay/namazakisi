/**
 * Yedekleme servisi — tüm yerel veriyi tek bir şifreli zarfta toplar ve
 * içe-aktarmada bu zarfı çözer/doğrular.
 *
 * Mimari: domain saf kalır (store'a bağımsız). Tüm AsyncStorage erişimi merkezî
 * `Depolama` katmanından geçer (atomik kuyruk + güvenli parse). Paylaşılan tipler
 * `core/types`'tadır (domain'in sunuma bağımlı olmaması için).
 *
 * Dosya biçimi (düz JSON zarf): { bicim, surum, olusturulma, uygulamaSurumu,
 * sifreli, nonce, veri, kontrol }. `veri` şifreli payload'ı, `kontrol` payload
 * düz-metninin SHA-256'sını taşır (bütünlük). Detay: spec §4.
 *
 * Hata sözleşmesi: `zarfiCoz` ASLA fırlatmaz — bozuk/yanlış/yeni-sürüm dosyada
 * `null` döner (UI kibar mesaj gösterir).
 *
 * Tasarım: docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md
 */

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import {
  YedekZarfi,
  YedekPayload,
  NamazGunleri,
  GunNamazHaritasi,
  YEDEK_BICIMI,
  YEDEK_SURUMU,
} from '../../core/types';
import { DEPOLAMA_ANAHTARLARI, UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Depolama } from '../../data/local/Depolama';
import { sifrele, coz, kontrolHesapla } from '../../core/utils/yedekSifreleme';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';

/** Kılınan-vakitler anahtar öneki: `${MUHAFIZ_AYARLARI}_kilinan_<tarih>`. */
const KILINAN_VAKIT_ONEK = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_`;

/**
 * `cogunuOku`/multiGet HAM string döndürür (Depolama.oku'nun aksine güvenli-parse
 * uygulanmaz). Düz `JSON.parse` yerine bunu kullan: `JSON.parse('null')` → null,
 * `('42')` → sayı gibi nesne-dışı sonuçlar downstream'de çökmeye yol açar; bunları
 * `{}` yapar. (LocalNamazServisi.hamGunVerisiniCoz ile aynı sözleşme.)
 */
const hamNesneyiCoz = (ham: string | null): GunNamazHaritasi => {
  if (!ham) return {};
  try {
    const cozulen: unknown = JSON.parse(ham);
    return cozulen !== null && typeof cozulen === 'object'
      ? (cozulen as GunNamazHaritasi)
      : {};
  } catch {
    return {};
  }
};

/** HAM string'i `string[]`'e güvenli çözer (dizi değilse boş dizi). */
const hamDiziyiCoz = (ham: string | null): string[] => {
  if (!ham) return [];
  try {
    const cozulen: unknown = JSON.parse(ham);
    return Array.isArray(cozulen) ? (cozulen as string[]) : [];
  } catch {
    return [];
  }
};

/** Tüm `namaz_gun_*` anahtarlarını { tarih: {namazAdi:bool} } olarak toplar. */
const namazGunleriniTopla = async (): Promise<NamazGunleri> => {
  const anahtarlar = await Depolama.onEkiOlanAnahtarlar(
    DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK
  );
  const ciftler = await Depolama.cogunuOku(anahtarlar);
  const sonuc: NamazGunleri = {};
  for (const [anahtar, ham] of ciftler) {
    const tarih = anahtar.slice(DEPOLAMA_ANAHTARLARI.NAMAZ_GUN_ONEK.length);
    sonuc[tarih] = hamNesneyiCoz(ham);
  }
  return sonuc;
};

/** Tüm `${MUHAFIZ_AYARLARI}_kilinan_*` anahtarlarını { tarih: string[] } olarak toplar. */
const kilinanVakitleriTopla = async (): Promise<Record<string, string[]>> => {
  const anahtarlar = await Depolama.onEkiOlanAnahtarlar(KILINAN_VAKIT_ONEK);
  const ciftler = await Depolama.cogunuOku(anahtarlar);
  const sonuc: Record<string, string[]> = {};
  for (const [anahtar, ham] of ciftler) {
    const tarih = anahtar.slice(KILINAN_VAKIT_ONEK.length);
    sonuc[tarih] = hamDiziyiCoz(ham);
  }
  return sonuc;
};

/** Yedeklenecek ayar anahtarlarını tek nesnede toplar. */
const ayarlariTopla = async (): Promise<Record<string, unknown>> => {
  const [
    muhafiz,
    vakitBildirim,
    konum,
    takvim,
    vakitSayac,
    sahurSayac,
    iftarSayac,
    seriAyarlari,
    ozelGun,
  ] = await Promise.all([
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.TAKVIM_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SERI_AYARLARI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI),
  ]);
  return {
    muhafiz,
    vakitBildirim,
    konum,
    takvim,
    vakitSayac,
    sahurSayac,
    iftarSayac,
    seriAyarlari,
    ozelGun,
  };
};

/** Tüm yedeklenecek anahtarları okuyup `YedekPayload` kurar. */
const payloadOlustur = async (): Promise<YedekPayload> => {
  const [
    namazGunleri,
    kilinanVakitler,
    seri,
    rozetler,
    seviye,
    bonusPuan,
    toplamKilinan,
    mukemmelGun,
    toparlanma,
    kaza,
    kazaTempo,
    ayarlar,
  ] = await Promise.all([
    namazGunleriniTopla(),
    kilinanVakitleriTopla(),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SERI_DURUMU),
    Depolama.oku<unknown[]>(DEPOLAMA_ANAHTARLARI.ROZET_VERILERI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU),
    Depolama.oku<number>(DEPOLAMA_ANAHTARLARI.BONUS_PUAN),
    Depolama.oku<number>(DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ),
    Depolama.oku<number>(DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI),
    Depolama.oku<number>(DEPOLAMA_ANAHTARLARI.TOPARLANMA_SAYISI),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU),
    Depolama.oku<Record<string, number>>(DEPOLAMA_ANAHTARLARI.KAZA_TEMPO_GECMIS),
    ayarlariTopla(),
  ]);

  return {
    namazGunleri,
    kilinanVakitler,
    seri: seri ?? null,
    rozetler: rozetler ?? [],
    seviye: seviye ?? null,
    bonusPuan: bonusPuan ?? 0,
    istatistik: {
      toplamKilinan: toplamKilinan ?? 0,
      mukemmelGun: mukemmelGun ?? 0,
      toparlanma: toparlanma ?? 0,
    },
    kaza: kaza ?? null,
    kazaTempo: kazaTempo ?? {},
    ayarlar,
  };
};

/**
 * Mevcut yerel verinin anlık görüntüsünü `YedekPayload` olarak toplar (şifrelemeden).
 * İçe-aktarma orkestratörü (yedeklemeSlice) birleştirme için mevcut tarafı bununla alır.
 */
export const mevcutVeriyiTopla = (): Promise<YedekPayload> => payloadOlustur();

/**
 * Tüm yerel veriyi okur, payload'ı kurar, bütünlük özetini hesaplar, şifreler ve
 * dış zarfı JSON string olarak döndürür (diske/paylaşıma hazır).
 */
export const yedekZarfiOlustur = async (): Promise<string> => {
  const payload = await payloadOlustur();
  const duzMetin = JSON.stringify(payload);
  const kontrol = await kontrolHesapla(duzMetin);
  const { nonce, veri } = await sifrele(duzMetin);

  const zarf: YedekZarfi = {
    bicim: YEDEK_BICIMI,
    surum: YEDEK_SURUMU,
    olusturulma: new Date().toISOString(),
    uygulamaSurumu: UYGULAMA.VERSIYON,
    sifreli: true,
    nonce,
    veri,
    kontrol,
  };

  return JSON.stringify(zarf);
};

/**
 * Tüm yerel veriyi yedek zarfına alır, cache dizinine JSON dosyası olarak yazar ve
 * sistem paylaşım iletişim kutusunu açar (DebugLogsSayfasi.handleShareLogs deseni).
 * `Sharing.isAvailableAsync()` false ise sessizce döner.
 */
export const yedeginiPaylas = async (): Promise<void> => {
  const zarf = await yedekZarfiOlustur();
  const dosyaAdi = `namaz-yedek-${bugunuAl()}.json`;
  const dosyaUri = `${FileSystem.cacheDirectory ?? ''}${dosyaAdi}`;
  await FileSystem.writeAsStringAsync(dosyaUri, zarf, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const paylasimVar = await Sharing.isAvailableAsync();
  if (paylasimVar) {
    await Sharing.shareAsync(dosyaUri, {
      mimeType: 'application/json',
      dialogTitle: 'Yedeğinizi paylaşın',
    });
  }
};

/**
 * Sürüm göçü: eski şema sürümlerini güncel sürüme yükseltir. Şu an tek sürüm (1)
 * olduğundan değişiklik yok; ileride şema değişince burada adım adım dönüştürülür.
 */
const surumGocu = (payload: YedekPayload, _surum: number): YedekPayload => {
  // surum === YEDEK_SURUMU (1): değişiklik yok.
  return payload;
};

/**
 * Yedek dosyası içeriğini çözer ve doğrular. Sırasıyla: JSON ayrıştır → biçim →
 * sürüm (uygulamadan yeni ise null) → şifre çöz → bütünlük (checksum) → payload
 * ayrıştır → sürüm göçü. Herhangi bir adımda hata/uyuşmazlık → `null` (fırlatmaz).
 */
export const zarfiCoz = async (dosyaIcerigi: string): Promise<YedekPayload | null> => {
  let zarf: YedekZarfi;
  try {
    zarf = JSON.parse(dosyaIcerigi) as YedekZarfi;
  } catch {
    return null;
  }

  if (!zarf || typeof zarf !== 'object') return null;
  // Biçim doğrulama: bu bir Namaz Akışı yedeği mi?
  if (zarf.bicim !== YEDEK_BICIMI) return null;
  // İleri-uyum: dosya uygulamadan daha yeni bir şemayla oluşturulmuşsa açma.
  if (typeof zarf.surum !== 'number' || zarf.surum > YEDEK_SURUMU) return null;
  if (typeof zarf.nonce !== 'string' || typeof zarf.veri !== 'string') return null;

  // Şifre çöz (yanlış nonce/bozuk veri/MAC hatası → null).
  const duzMetin = coz(zarf.nonce, zarf.veri);
  if (duzMetin === null) return null;

  // Bütünlük: payload düz-metninin SHA-256'sı zarftaki kontrol ile eşleşmeli.
  const kontrol = await kontrolHesapla(duzMetin);
  if (kontrol !== zarf.kontrol) return null;

  let payload: YedekPayload;
  try {
    payload = JSON.parse(duzMetin) as YedekPayload;
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;

  return surumGocu(payload, zarf.surum);
};
