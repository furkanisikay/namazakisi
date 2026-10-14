/**
 * Cihazlar arası eşitleme (issue #288) — eşitlenen İÇERİK ve içerik ÖZETİ.
 *
 * İçerik, yerel yedekle AYNI şemadır (`YedekPayload`): uygulama tarafı yeni bir
 * birleştirme yolu YAZMAZ, gelen veri `YedekBirlestirmeServisi.birlestirmePlaniOlustur`
 * ("akıllı" strateji = union, geri alma yok) ile mevcut içe aktarma zincirinden geçer.
 *
 * VERİ AZALTMA: buluta yalnız birleştirmede KULLANILAN alanlar gider. "Akıllı"
 * strateji ayarlara dokunmaz (her cihaz kendi ayarını korur) ve seviye/istatistiği
 * kayıttan yeniden türetir → `ayarlar` (konum dahil), `seviye`, `istatistik` boş
 * gönderilir. Union'da bilgi taşımayan `false` işaretler de atılır (`false || x = x`).
 *
 * ÖZET (`icerikOzeti`) "yalnız değiştiyse yükle" kararının ölçüsüdür ve YALNIZ
 * birleştirmenin YAKINSADIĞI görünüme bakar: işaretli namazlar, kılınan vakitler,
 * rozet kimlikleri, bonus puan, en uzun seri, kaza ilerlemesi, kaza temposu. Cihaza
 * özgü kalan alanlar (güncel seri ayrıntısı, rozet tarihleri) özete girseydi iki
 * cihaz HİÇ aynı özete ulaşamaz ve her eşitlemede birbirinin üzerine yükleme
 * yapardı (sonsuz ping-pong).
 */

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';
import naclUtil from 'tweetnacl-util';
import { YedekPayload, NamazGunleri, GunNamazHaritasi } from '../types/YedeklemeTipleri';

const TARIH_BICIMI = /^\d{4}-\d{2}-\d{2}$/;

const nesneMi = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);

const sonluSayi = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);

/** Namaz günlerinden yalnız `true` işaretleri bırakır (boş gün atılır). */
const yalnizIsaretliGunler = (gunler: NamazGunleri): NamazGunleri => {
  const sonuc: NamazGunleri = {};
  for (const [tarih, gun] of Object.entries(gunler)) {
    if (!TARIH_BICIMI.test(tarih) || !nesneMi(gun)) continue;
    const isaretli: GunNamazHaritasi = {};
    for (const [namaz, kilindi] of Object.entries(gun)) {
      if (kilindi === true) isaretli[namaz] = true;
    }
    if (Object.keys(isaretli).length > 0) sonuc[tarih] = isaretli;
  }
  return sonuc;
};

/** Kılınan vakitleri temizler (geçersiz tarih / boş dizi / metin olmayan öğe atılır). */
const temizKilinanVakitler = (deger: unknown): Record<string, string[]> => {
  const sonuc: Record<string, string[]> = {};
  if (!nesneMi(deger)) return sonuc;
  for (const [tarih, liste] of Object.entries(deger)) {
    if (!TARIH_BICIMI.test(tarih) || !Array.isArray(liste)) continue;
    const vakitler = Array.from(new Set(liste.filter((v): v is string => typeof v === 'string')));
    if (vakitler.length > 0) sonuc[tarih] = vakitler;
  }
  return sonuc;
};

/** Kaza temposunu temizler (tarih → sonlu sayı). */
const temizTempo = (deger: unknown): Record<string, number> => {
  const sonuc: Record<string, number> = {};
  if (!nesneMi(deger)) return sonuc;
  for (const [tarih, adet] of Object.entries(deger)) {
    if (TARIH_BICIMI.test(tarih) && typeof adet === 'number' && Number.isFinite(adet)) {
      sonuc[tarih] = adet;
    }
  }
  return sonuc;
};

/** Yerel anlık görüntüyü buluta gidecek (azaltılmış) içeriğe indirir. */
export function esitlemeIcerigineIndir(yerel: YedekPayload): YedekPayload {
  return {
    namazGunleri: yalnizIsaretliGunler(yerel.namazGunleri ?? {}),
    kilinanVakitler: temizKilinanVakitler(yerel.kilinanVakitler),
    seri: nesneMi(yerel.seri) ? yerel.seri : null,
    rozetler: Array.isArray(yerel.rozetler) ? yerel.rozetler : [],
    seviye: null,
    bonusPuan: sonluSayi(yerel.bonusPuan),
    istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
    kaza: nesneMi(yerel.kaza) ? yerel.kaza : null,
    kazaTempo: temizTempo(yerel.kazaTempo),
    ayarlar: {},
  };
}

/**
 * Çözülmüş uzak metni güvenle `YedekPayload`'a çevirir (kurcalanmış/eksik alanlar
 * temizlenir). Nesne değilse `null`. Birleştirme servisi diziler/nesneler üzerinde
 * doğrudan gezindiği için tip doğrulaması burada yapılır.
 */
export function icerikNormalizeEt(deger: unknown): YedekPayload | null {
  if (!nesneMi(deger)) return null;
  const namazGunleri = nesneMi(deger.namazGunleri)
    ? yalnizIsaretliGunler(deger.namazGunleri as NamazGunleri)
    : {};
  return {
    namazGunleri,
    kilinanVakitler: temizKilinanVakitler(deger.kilinanVakitler),
    seri: nesneMi(deger.seri) ? deger.seri : null,
    rozetler: Array.isArray(deger.rozetler) ? deger.rozetler : [],
    seviye: null,
    bonusPuan: sonluSayi(deger.bonusPuan),
    istatistik: { toplamKilinan: 0, mukemmelGun: 0, toparlanma: 0 },
    kaza: nesneMi(deger.kaza) ? deger.kaza : null,
    kazaTempo: temizTempo(deger.kazaTempo),
    ayarlar: {},
  };
}

/** Rozet kimliği (birleştirme servisiyle aynı anahtar: `id` ya da JSON). */
const rozetKimligi = (rozet: unknown): string => {
  const id = (rozet as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id : JSON.stringify(rozet);
};

/** Anahtarları SIRALI JSON (aynı veri → aynı dize; nesne anahtar sırası değişse bile). */
export function kanonikJson(deger: unknown): string {
  if (Array.isArray(deger)) return `[${deger.map(kanonikJson).join(',')}]`;
  if (nesneMi(deger)) {
    const anahtarlar = Object.keys(deger)
      .filter((a) => deger[a] !== undefined)
      .sort();
    return `{${anahtarlar.map((a) => `${JSON.stringify(a)}:${kanonikJson(deger[a])}`).join(',')}}`;
  }
  return JSON.stringify(deger ?? null);
}

/** Birleştirmenin yakınsadığı görünüm (özet girdisi). */
const yakinsayanGorunum = (icerik: YedekPayload): unknown => {
  const indirgenmis = esitlemeIcerigineIndir(icerik);
  const namaz = Object.entries(indirgenmis.namazGunleri).map(
    ([tarih, gun]) => [tarih, Object.keys(gun).sort()] as const
  );
  const kilinan = Object.entries(indirgenmis.kilinanVakitler).map(
    ([tarih, vakitler]) => [tarih, [...vakitler].sort()] as const
  );
  const seri = indirgenmis.seri as { enUzunSeri?: unknown } | null;
  const kaza = indirgenmis.kaza as { toplamTamamlanan?: unknown } | null;
  return {
    namaz: namaz.sort((a, b) => a[0].localeCompare(b[0])),
    kilinan: kilinan.sort((a, b) => a[0].localeCompare(b[0])),
    rozetler: Array.from(new Set(indirgenmis.rozetler.map(rozetKimligi))).sort(),
    bonusPuan: indirgenmis.bonusPuan,
    enUzunSeri: sonluSayi(seri?.enUzunSeri),
    kazaIlerleme: typeof kaza?.toplamTamamlanan === 'number' ? kaza.toplamTamamlanan : -1,
    kazaTempo: indirgenmis.kazaTempo,
  };
};

/** İçeriğin yakınsayan görünümünün SHA-256 özeti (hex). */
export function icerikOzeti(icerik: YedekPayload): string {
  return bytesToHex(sha256(naclUtil.decodeUTF8(kanonikJson(yakinsayanGorunum(icerik)))));
}
