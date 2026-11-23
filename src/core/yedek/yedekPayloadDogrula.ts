/**
 * Yedek içeriği DARALTICISI — güvenilmeyen değeri `YedekPayload`'a indirir (SAF).
 *
 * Yerel yedek zarfının anahtarı sır değildir (`core/utils/yedekSifreleme`): MAC ve özet
 * dosyanın ÖZGÜN olduğunu kanıtlamaz, herkes "geçerli" zarf üretebilir. Bu yüzden diske
 * gidecek her alan burada tek tek ele alınır: tanınmayan atılır, tipi tutmayan güvenli
 * varsayılana iner, sayılar sonlu + negatif olmayan + tavanlı, haritalar gerçek tarih
 * anahtarlı ve sınırlı uzunlukta çıkar.
 *
 * SÖZLEŞME: uygulamanın kendi ürettiği içerik buradan DEĞİŞMEDEN geçer (nöbetçi:
 * `yedekPayloadDogrula.test.ts`, `YedeklemeServisi.test.ts`). Yeni bir `YedekPayload`
 * alanı `ELE_ALINAN_ALANLAR`'a eklenmeden derlenmez; eklenen alanın daraltması da
 * buraya yazılır.
 *
 * react-native / depolama import ETMEZ; ASLA fırlatmaz.
 */

import { NamazAdi } from '../constants/UygulamaSabitleri';
import type { VakitAdi } from '../types';
import type { GunNamazHaritasi, NamazGunleri, YedekPayload } from '../types/YedeklemeTipleri';
import type { KullaniciRozeti } from '../types/SeriTipleri';
import { KAZA_ADINDAN_VAKTE, hareketleriAyristir } from '../kaza/kazaHareketi';
import { olaylariBirlestir } from '../cihazAgi/olayGunlugu';

// ==================== SINIRLAR ====================

/**
 * İçe aktarılacak yedek dosyasının azami boyutu. Gerçek yedek birkaç yüz KB'tır; Android'de
 * tüm yerel veri 6 MB'a sığar (zarf ≈ 1,34 katı), bu sınır onun iki katıdır.
 */
export const AZAMI_YEDEK_DOSYASI_BAYT = 16 * 1024 * 1024;

/** Tarih anahtarlı haritalarda tutulan en fazla gün (100 yıl). Aşılırsa EN YENİ günler kalır. */
export const AZAMI_GUN_SAYISI = 36_600;
const AZAMI_ROZET = 500;
const AZAMI_KAZA_HAREKETI = 200_000;
const AZAMI_PUAN = 1_000_000_000;
const AZAMI_NAMAZ_SAYISI = 10_000_000;
const AZAMI_SERI = 100_000;
const AZAMI_SEVIYE = 10_000;
const AZAMI_TOPARLANMA_GUNU = 1_000;
const AZAMI_KAZA_TOPLAMI = 100_000_000;
const AZAMI_TEMPO = 100_000;

/** Gerçek takvim biçimi (ay 01-12, gün 01-31) — depolama anahtarına dönüşen tek serbest metin. */
const TARIH = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ZAMAN_BASI = /^\d{4}-\d{2}-\d{2}/;
const ROZET_KIMLIGI = /^[A-Za-z0-9_.-]{1,64}$/;

/** Namaz kaydı anahtarları (gün haritası). Enum değerleri depolama kimliğidir. */
const NAMAZ_ADLARI: ReadonlySet<string> = new Set<string>(Object.values(NamazAdi));

/** Kılınmışlık kaydındaki vakit kodları; `VakitAdi`'na eklenen kod buraya yazılmadan derlenmez. */
const VAKIT_KODLARI: Readonly<Record<VakitAdi, true>> = {
  imsak: true,
  gunes: true,
  ogle: true,
  ikindi: true,
  aksam: true,
  yatsi: true,
};

/** Her `YedekPayload` alanının burada ele alındığının derleme zamanı kanıtı. */
const ELE_ALINAN_ALANLAR: Readonly<Record<keyof YedekPayload, true>> = {
  namazGunleri: true,
  kilinanVakitler: true,
  seri: true,
  rozetler: true,
  seviye: true,
  bonusPuan: true,
  istatistik: true,
  kaza: true,
  kazaTempo: true,
  kazaHareketleri: true,
  cihazOlaylari: true,
  ayarlar: true,
};

/** Daraltıcının çıktısında bulunabilecek alan adları (nöbetçi testler için). */
export const YEDEK_PAYLOAD_ALANLARI: readonly string[] = Object.keys(ELE_ALINAN_ALANLAR);

// ==================== TEMEL DARALTICILAR ====================

type Nesne = Record<string, unknown>;

const nesneMi = (x: unknown): x is Nesne => x !== null && typeof x === 'object' && !Array.isArray(x);

const sahip = (n: Nesne, alan: string): boolean => Object.prototype.hasOwnProperty.call(n, alan);

const sayiMi = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0;

/** Sonlu, negatif olmayan, tavanlı tamsayı; tutmayan değer 0. */
const tamsayi = (x: unknown, tavan: number): number => (sayiMi(x) ? Math.min(Math.floor(x), tavan) : 0);

/** ISO tarih/zaman dizesi ya da null. */
const zamanYaDaNull = (x: unknown): string | null =>
  typeof x === 'string' && x.length <= 40 && ZAMAN_BASI.test(x) && Number.isFinite(Date.parse(x)) ? x : null;

const kisaMetin = (x: unknown, azami: number): string => (typeof x === 'string' && x.length <= azami ? x : '');

/**
 * Haritanın geçerli tarih anahtarlı girdileri. Sınır aşılırsa en yeni günler kalır
 * (ISO tarih sözlük sırası = takvim sırası).
 */
const tarihliGirdiler = (ham: unknown): Array<[string, unknown]> => {
  if (!nesneMi(ham)) return [];
  let tarihler = Object.keys(ham).filter((anahtar) => TARIH.test(anahtar));
  if (tarihler.length > AZAMI_GUN_SAYISI) {
    tarihler = tarihler.sort().slice(tarihler.length - AZAMI_GUN_SAYISI);
  }
  return tarihler.map((tarih) => [tarih, ham[tarih]]);
};

// ==================== ALANLAR ====================

const namazGunleriniDaralt = (ham: unknown): NamazGunleri => {
  const sonuc: NamazGunleri = {};
  for (const [tarih, gun] of tarihliGirdiler(ham)) {
    if (!nesneMi(gun)) continue;
    const temiz: GunNamazHaritasi = {};
    for (const ad of Object.keys(gun)) {
      const deger = gun[ad];
      if (NAMAZ_ADLARI.has(ad) && typeof deger === 'boolean') temiz[ad] = deger;
    }
    sonuc[tarih] = temiz;
  }
  return sonuc;
};

const kilinanVakitleriDaralt = (ham: unknown): Record<string, string[]> => {
  const sonuc: Record<string, string[]> = {};
  for (const [tarih, liste] of tarihliGirdiler(ham)) {
    if (!Array.isArray(liste)) continue;
    const temiz: string[] = [];
    for (const vakit of liste) {
      if (typeof vakit !== 'string' || !sahip(VAKIT_KODLARI, vakit) || temiz.includes(vakit)) continue;
      temiz.push(vakit);
    }
    sonuc[tarih] = temiz;
  }
  return sonuc;
};

const kazaTemposunuDaralt = (ham: unknown): Record<string, number> => {
  const sonuc: Record<string, number> = {};
  for (const [tarih, adet] of tarihliGirdiler(ham)) {
    if (sayiMi(adet)) sonuc[tarih] = tamsayi(adet, AZAMI_TEMPO);
  }
  return sonuc;
};

const toparlanmayiDaralt = (ham: unknown): Nesne | null => {
  if (!nesneMi(ham)) return null;
  const baslangicTarihi = zamanYaDaNull(ham.baslangicTarihi);
  if (baslangicTarihi === null) return null;
  return {
    tamamlananGun: tamsayi(ham.tamamlananGun, AZAMI_TOPARLANMA_GUNU),
    baslangicTarihi,
    hedefGunSayisi: tamsayi(ham.hedefGunSayisi, AZAMI_TOPARLANMA_GUNU),
    oncekiSeri: tamsayi(ham.oncekiSeri, AZAMI_SERI),
  };
};

/**
 * `SeriDurumu` ile `BugunOncesiSnapshot`'ın ortak alanları. Eski sürüm kayıtlarında
 * bulunmayan dondurma alanları yoksa EKLENMEZ (okuyucu kendi varsayılanını uygular).
 */
const seriAlanlariniDaralt = (ham: Nesne): Nesne => {
  const sonuc: Nesne = {
    mevcutSeri: tamsayi(ham.mevcutSeri, AZAMI_SERI),
    enUzunSeri: tamsayi(ham.enUzunSeri, AZAMI_SERI),
    sonTamGun: zamanYaDaNull(ham.sonTamGun),
    seriBaslangici: zamanYaDaNull(ham.seriBaslangici),
    toparlanmaDurumu: toparlanmayiDaralt(ham.toparlanmaDurumu),
  };
  if (sahip(ham, 'dondurulduMu')) sonuc.dondurulduMu = ham.dondurulduMu === true;
  if (sahip(ham, 'dondurulmaTarihi')) sonuc.dondurulmaTarihi = zamanYaDaNull(ham.dondurulmaTarihi);
  return sonuc;
};

/** Seri durumu; iki çekirdek sayıdan hiçbiri yoksa "yedekte seri yok" (null). */
const seriyiDaralt = (ham: unknown): Nesne | null => {
  if (!nesneMi(ham)) return null;
  if (!sayiMi(ham.mevcutSeri) && !sayiMi(ham.enUzunSeri)) return null;
  const sonuc = seriAlanlariniDaralt(ham);
  if (sahip(ham, 'sonGuncelleme')) sonuc.sonGuncelleme = zamanYaDaNull(ham.sonGuncelleme) ?? new Date(0).toISOString();
  if (sahip(ham, 'bugunOncesi')) {
    const onceki = ham.bugunOncesi;
    if (nesneMi(onceki)) {
      const anlik = seriAlanlariniDaralt(onceki);
      const tarih = zamanYaDaNull(onceki.tarih);
      if (tarih !== null) anlik.tarih = tarih;
      sonuc.bugunOncesi = anlik;
    } else {
      sonuc.bugunOncesi = null;
    }
  }
  if (sahip(ham, 'bugunKazanilanPuan')) {
    sonuc.bugunKazanilanPuan = sayiMi(ham.bugunKazanilanPuan) ? tamsayi(ham.bugunKazanilanPuan, AZAMI_PUAN) : null;
  }
  return sonuc;
};

/** Seviye durumu; toplam puanı okunamıyorsa null (reconcile kayıttan yeniden türetir). */
const seviyeyiDaralt = (ham: unknown): Nesne | null => {
  if (!nesneMi(ham) || !sayiMi(ham.toplamPuan)) return null;
  const sonuc: Nesne = {
    mevcutSeviye: Math.max(1, tamsayi(ham.mevcutSeviye, AZAMI_SEVIYE)),
    toplamPuan: tamsayi(ham.toplamPuan, AZAMI_PUAN),
    mevcutSeviyePuani: tamsayi(ham.mevcutSeviyePuani, AZAMI_PUAN),
    sonrakiSeviyeKalanPuan: tamsayi(ham.sonrakiSeviyeKalanPuan, AZAMI_PUAN),
  };
  // Eski kayıtta bulunmayabilir; boşsa okuyucu puandan yeniden üretir.
  const rank = kisaMetin(ham.rank, 60);
  if (rank) sonuc.rank = rank;
  const rankIkonu = kisaMetin(ham.rankIkonu, 16);
  if (rankIkonu) sonuc.rankIkonu = rankIkonu;
  return sonuc;
};

const rozetiDaralt = (ham: unknown): KullaniciRozeti | null => {
  if (!nesneMi(ham)) return null;
  const { rozetId, kazanildiMi } = ham;
  if (typeof rozetId !== 'string' || !ROZET_KIMLIGI.test(rozetId) || typeof kazanildiMi !== 'boolean') return null;
  return { rozetId, kazanildiMi, kazanilmaTarihi: zamanYaDaNull(ham.kazanilmaTarihi) };
};

const zamanDegeri = (tarih: string): number => Date.parse(tarih);

/** Aynı rozetin iki kaydı: kazanılmış olan kalır, kazanılma tarihi en eskisidir. */
const rozetKayitlariniBirlestir = (a: KullaniciRozeti, b: KullaniciRozeti): KullaniciRozeti => {
  if (!a.kazanildiMi && !b.kazanildiMi) return a;
  let tarih: string | null = null;
  for (const kayit of [a, b]) {
    if (!kayit.kazanildiMi || kayit.kazanilmaTarihi === null) continue;
    if (tarih === null || zamanDegeri(kayit.kazanilmaTarihi) < zamanDegeri(tarih)) tarih = kayit.kazanilmaTarihi;
  }
  return { rozetId: a.rozetId, kazanildiMi: true, kazanilmaTarihi: tarih };
};

/**
 * Rozet listesini biçimce doğrular ve `rozetId` ile tekilleştirir (ilk görülen sıra korunur).
 * Biçimi tutmayan öğe (null, eksik alan, yabancı kimlik biçimi) atılır. Birleştirme servisi
 * de aynı işlevi kullanır: rozet reconcile ile TÜRETİLMEZ, kazanım yalnız bu listede yaşar.
 */
export function rozetleriTekillestir(ham: unknown): KullaniciRozeti[] {
  if (!Array.isArray(ham)) return [];
  const harita = new Map<string, KullaniciRozeti>();
  for (const oge of ham) {
    const rozet = rozetiDaralt(oge);
    if (!rozet) continue;
    const onceki = harita.get(rozet.rozetId);
    if (onceki) harita.set(rozet.rozetId, rozetKayitlariniBirlestir(onceki, rozet));
    else if (harita.size < AZAMI_ROZET) harita.set(rozet.rozetId, rozet);
  }
  return Array.from(harita.values());
}

const istatistigiDaralt = (ham: unknown): YedekPayload['istatistik'] => {
  const kaynak = nesneMi(ham) ? ham : {};
  return {
    toplamKilinan: tamsayi(kaynak.toplamKilinan, AZAMI_NAMAZ_SAYISI),
    mukemmelGun: tamsayi(kaynak.mukemmelGun, AZAMI_SERI),
    toparlanma: tamsayi(kaynak.toparlanma, AZAMI_SERI),
  };
};

/**
 * Eski (`KazaDurumu`) şekilli anlık görüntü. Diske YAZILMAZ; yalnız göç / "en az bu kadar
 * kılındı" kaynağıdır. Bulunmayan alan EKLENMEZ: `defterOzeti`'nin ve `toplamTamamlanan`'ın
 * varlığı okuyucular için anlam taşır (türetilmiş görüntü / eski sürüm ilerlemesi).
 */
const eskiKazaGoruntusunuDaralt = (ham: unknown): Nesne | null => {
  if (!nesneMi(ham)) return null;
  const sonuc: Nesne = {};
  if (Array.isArray(ham.namazlar)) {
    const namazlar: Nesne[] = [];
    for (const oge of ham.namazlar) {
      if (namazlar.length >= Object.keys(KAZA_ADINDAN_VAKTE).length) break;
      if (!nesneMi(oge) || typeof oge.namazAdi !== 'string' || !sahip(KAZA_ADINDAN_VAKTE, oge.namazAdi)) continue;
      namazlar.push({
        namazAdi: oge.namazAdi,
        toplamBorc: tamsayi(oge.toplamBorc, AZAMI_KAZA_TOPLAMI),
        kalanBorc: tamsayi(oge.kalanBorc, AZAMI_NAMAZ_SAYISI),
        tamamlanan: tamsayi(oge.tamamlanan, AZAMI_NAMAZ_SAYISI),
      });
    }
    sonuc.namazlar = namazlar;
  }
  for (const alan of ['toplamKalan', 'toplamTamamlanan', 'gunlukHedef', 'gunlukTamamlanan']) {
    if (sahip(ham, alan)) sonuc[alan] = tamsayi(ham[alan], AZAMI_KAZA_TOPLAMI);
  }
  for (const alan of ['gunlukHedefTarihi', 'guncellemeTarihi']) {
    if (sahip(ham, alan)) sonuc[alan] = kisaMetin(ham[alan], 40);
  }
  if (sahip(ham, 'toplamGizleMi')) sonuc.toplamGizleMi = ham.toplamGizleMi === true;
  if (typeof ham.defterOzeti === 'string' && ham.defterOzeti.length <= 200) sonuc.defterOzeti = ham.defterOzeti;
  return sonuc;
};

/**
 * Kaza defteri hareketleri: tanınan öğe defterin kendi normalize'ından geçer, bu sürümün
 * çözemediği ama yapısal olarak geçerli (yeni sürüm) öğe AYNEN korunur, yapısız öğe atılır.
 */
const kazaHareketleriniDaralt = (ham: unknown[]): unknown[] => {
  const { taninan, bilinmeyen } = hareketleriAyristir(ham.slice(0, AZAMI_KAZA_HAREKETI));
  return [...taninan, ...bilinmeyen];
};

/** Yalnız yedek beyaz listesindeki ayar alanları; değerlere dokunulmaz (okuyucular normalize eder). */
const ayarlariDaralt = (ham: unknown, ayarAlanlari: readonly string[]): Record<string, unknown> => {
  const sonuc: Record<string, unknown> = {};
  if (!nesneMi(ham)) return sonuc;
  for (const alan of ayarAlanlari) {
    if (sahip(ham, alan) && ham[alan] !== undefined) sonuc[alan] = ham[alan];
  }
  return sonuc;
};

// ==================== GİRİŞ ====================

/**
 * Güvenilmeyen değeri `YedekPayload`'a daraltır. Düz nesne değilse `null`.
 *
 * @param ayarAlanlari Yedek beyaz listesindeki ayar alanları
 *   (`YedekBirlestirmeServisi.YEDEK_AYAR_ALANLARI` — tek kaynak; burada kopyası tutulmaz).
 */
export function yedekPayloadDogrula(ham: unknown, ayarAlanlari: readonly string[]): YedekPayload | null {
  if (!nesneMi(ham)) return null;
  const olaylar = Array.isArray(ham.cihazOlaylari) ? olaylariBirlestir(ham.cihazOlaylari, []) : [];
  return {
    namazGunleri: namazGunleriniDaralt(ham.namazGunleri),
    kilinanVakitler: kilinanVakitleriDaralt(ham.kilinanVakitler),
    seri: seriyiDaralt(ham.seri),
    rozetler: rozetleriTekillestir(ham.rozetler),
    seviye: seviyeyiDaralt(ham.seviye),
    bonusPuan: tamsayi(ham.bonusPuan, AZAMI_PUAN),
    istatistik: istatistigiDaralt(ham.istatistik),
    kaza: eskiKazaGoruntusunuDaralt(ham.kaza),
    kazaTempo: kazaTemposunuDaralt(ham.kazaTempo),
    // Alan YOKSA yok kalır: birleştirme eski sürümün yükünü bundan tanır.
    ...(Array.isArray(ham.kazaHareketleri) ? { kazaHareketleri: kazaHareketleriniDaralt(ham.kazaHareketleri) } : {}),
    ...(olaylar.length > 0 ? { cihazOlaylari: olaylar } : {}),
    ayarlar: ayarlariDaralt(ham.ayarlar, ayarAlanlari),
  };
}
