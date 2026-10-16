/**
 * Kaza Defteri 2.0 — girdi toplama, türetme ve otomatik tarama (store'suz).
 *
 * Defterin görünen sayıları `defterHesapla` (saf) ile türetilir; bu servis o
 * fonksiyonun girdisini DİSKTEN kurar: hareketler + izdüşüm günlerinin namaz
 * kaydı (∪ muhafız kılınmışlığı) + özel gün kümesi (GEÇMİŞ DAHİL) + mezhep.
 *
 * Arka planda Redux yoktur: ön plan (slice), 15 dk görevi, headless "Kıldım"
 * ve kılınmışlık dinleyicisi aynı fonksiyonlardan geçer.
 *
 * GÜN SINIRI: `namazGunuHesapla` + `uygulamaImsakSaglayici` (seri ile TEK
 * kaynak). `KonumYoneticiServisi` KULLANILMAZ (üretimde hiç doldurulmuyor).
 * Arka planda imsak kaynağı yapılandırılmamışsa 05:00 yedeğine düşülür —
 * gün en kötü ihtimalle biraz geç kapanır (erken DEĞİL).
 */

import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { tarihiISOFormatinaCevir } from '../../core/utils/TarihYardimcisi';
import { Depolama } from '../../data/local/Depolama';
import * as LocalKaza from '../../data/local/LocalKazaServisi';
import { LocalMezhepServisi } from '../../data/local/LocalMezhepServisi';
import {
  kayitDegistiDinleyicisiEkle,
  localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { vitirOtomatikEklenirMi } from '../../core/mezhep/mezhepAyari';
import { ozelGunKumesi, type OzelGunAraligi } from '../../core/seri/ozelGunKumesi';
import {
  KAZA_ADINDAN_VAKTE,
  VAKIT_ADINDAN_KAZAYA,
  type KayitsizGunTercihi,
  type KazaHareketi,
  type KazaVakti,
} from '../../core/kaza/kazaHareketi';
import {
  defterHesapla,
  izdusumGunleri,
  taramaFarki,
  type DefterHesapGirdisi,
  type KazaDefterGorunumu,
} from '../../core/kaza/kazaDefteriHesabi';
import {
  namazGunuHesapla,
  uygulamaImsakSaglayici,
  VARSAYILAN_GUN_SINIRI_SAATI,
  type ImsakSaglayici,
} from './SeriHesaplayiciServisi';

const KILINAN_ONEK = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_`;
const DINLEYICI_ADI = 'kazaDefteri';
const TARAMA_GECIKMESI_MS = 1500;

export interface DefterSonucu {
  gorunum: KazaDefterGorunumu;
  girdi: DefterHesapGirdisi;
  bozukAylar: string[];
  eskiKayitBozuk: boolean;
  sonTarama: string | null;
  cihaz: string;
}

/** Özel gün kaydını (geçmiş DAHİL) kümeye çevirir. Bozuk → boş küme. */
export function ozelGunleriCoz(ham: unknown): Set<string> {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return new Set();
  const k = ham as Record<string, unknown>;
  const aralikMi = (x: unknown): x is OzelGunAraligi =>
    !!x &&
    typeof x === 'object' &&
    typeof (x as OzelGunAraligi).baslangicTarihi === 'string' &&
    typeof (x as OzelGunAraligi).bitisTarihi === 'string';
  const gun = (s: string): string => s.slice(0, 10);
  const normal = (a: OzelGunAraligi): OzelGunAraligi => ({ baslangicTarihi: gun(a.baslangicTarihi), bitisTarihi: gun(a.bitisTarihi) });
  try {
    return ozelGunKumesi({
      ozelGunModuAktif: k.ozelGunModuAktif === true,
      aktifOzelGun: aralikMi(k.aktifOzelGun) ? normal(k.aktifOzelGun) : null,
      gecmisKayitlar: Array.isArray(k.gecmisKayitlar) ? k.gecmisKayitlar.filter(aralikMi).map(normal) : [],
    });
  } catch {
    return new Set();
  }
}

/** İzdüşüm günlerinin işaretli farzları: namaz kaydı ∪ muhafız kılınmışlığı. */
async function isaretlileriOku(gunler: readonly string[]): Promise<Record<string, KazaVakti[]>> {
  const sonuc: Record<string, KazaVakti[]> = {};
  if (gunler.length === 0) return sonuc;
  const ekle = (gun: string, v: KazaVakti | undefined) => {
    if (!v) return;
    const liste = (sonuc[gun] ??= []);
    if (!liste.includes(v)) liste.push(v);
  };
  const istenen = new Set(gunler);
  const yanit = await localTarihAraligindakiNamazlariGetir(gunler[0], gunler[gunler.length - 1]);
  if (!yanit.basarili || !yanit.veri) throw new Error(yanit.hata ?? 'Namaz kaydı okunamadı');
  {
    for (const g of yanit.veri) {
      if (!istenen.has(g.tarih)) continue;
      for (const n of g.namazlar) if (n.tamamlandi) ekle(g.tarih, KAZA_ADINDAN_VAKTE[n.namazAdi]);
    }
  }
  const ciftler = await Depolama.cogunuOku(gunler.map((g) => `${KILINAN_ONEK}${g}`));
  for (const [anahtar, ham] of ciftler) {
    if (!ham) continue;
    try {
      const liste: unknown = JSON.parse(ham);
      if (!Array.isArray(liste)) continue;
      const gun = anahtar.slice(KILINAN_ONEK.length);
      for (const v of liste) if (typeof v === 'string') ekle(gun, VAKIT_ADINDAN_KAZAYA[v]);
    } catch {
      // Bozuk kılınmışlık kaydı: yalnız namaz kaydı sayılır.
    }
  }
  return sonuc;
}

export interface GirdiSecenekleri {
  simdi?: Date;
  imsakSaglayici?: ImsakSaglayici;
  /** Önizleme: henüz yazılmamış hareketler de girdiye katılsın. */
  ekHareketler?: readonly KazaHareketi[];
}

/** Şu an süren namaz günü (seri ile aynı sınır; kaynak yoksa 05:00 yedeği). */
export function bugunNamazGunuAl(simdi: Date = new Date(), imsakSaglayici: ImsakSaglayici = uygulamaImsakSaglayici): string {
  try {
    return namazGunuHesapla(simdi, VARSAYILAN_GUN_SINIRI_SAATI, imsakSaglayici);
  } catch {
    return tarihiISOFormatinaCevir(simdi);
  }
}

/** Defteri diskten okuyup türetir. ASLA reddetmez (okuma yolları reddetmez). */
export async function defteriHesapla(s: GirdiSecenekleri = {}): Promise<DefterSonucu> {
  const simdi = s.simdi ?? new Date();
  const [okuma, ayarlar, mezhep, eskiTempo, ozelHam, sonTarama, cihaz] = await Promise.all([
    LocalKaza.defteriOku(),
    LocalKaza.ayarlariOku(),
    LocalMezhepServisi.oku(),
    LocalKaza.eskiTempoOku(),
    Depolama.oku<unknown>(DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI).catch(() => null),
    LocalKaza.sonTaramaOku(),
    LocalKaza.cihazKimligiAl(),
  ]);
  const hareketler = s.ekHareketler ? [...okuma.hareketler, ...s.ekHareketler] : okuma.hareketler;
  const bugunNamazGunu = bugunNamazGunuAl(simdi, s.imsakSaglayici);
  let isaretliler: Record<string, KazaVakti[]> = {};
  let izdusumKapali = false;
  try {
    isaretliler = await isaretlileriOku(izdusumGunleri(hareketler, bugunNamazGunu));
  } catch (e) {
    // Okunamayan kayıt "işaretsiz" sayılsaydı her gün borç uydurulurdu.
    izdusumKapali = true;
    Logger.warn('KazaDefteri', 'Namaz kaydı okunamadı; otomatik kayıtlar bu turda sayılmıyor', e);
  }
  const girdi: DefterHesapGirdisi = {
    hareketler,
    bugunNamazGunu,
    bugunTakvim: tarihiISOFormatinaCevir(simdi),
    isaretliler,
    ozelGunler: ozelGunleriCoz(ozelHam),
    vitirDahil: vitirOtomatikEklenirMi(mezhep),
    gunlukHedef: ayarlar.gunlukHedef,
    toplamGizleMi: ayarlar.toplamGizleMi,
    eskiTempo,
    izdusumKapali,
  };
  return {
    gorunum: defterHesapla(girdi),
    girdi,
    bozukAylar: okuma.bozukAylar,
    eskiKayitBozuk: okuma.eskiKayitBozuk,
    sonTarama,
    cihaz,
  };
}

/**
 * Otomatik izdüşümün TARAMA GÜNLÜĞÜNÜ tazeler: önceki taramalara göre giren /
 * çıkan referans varsa tek bir `tarama` hareketi yazar (yalnız geçmiş ekranı).
 * Sayılar günlüğe BAĞLI DEĞİLDİR. ASLA fırlatmaz.
 */
export async function taramaYap(s: GirdiSecenekleri = {}): Promise<DefterSonucu | null> {
  try {
    const sonuc = await defteriHesapla(s);
    const zaman = (s.simdi ?? new Date()).toISOString();
    if (!sonuc.girdi.izdusumKapali && (sonuc.gorunum.otomatik.aktif || sonuc.gorunum.otomatikAdaylar.length > 0)) {
      const fark = taramaFarki(sonuc.girdi.hareketler, sonuc.gorunum.otomatikAdaylar);
      if (fark.eklenen.length > 0 || fark.cikan.length > 0) {
        const temel = await LocalKaza.yeniHareketTemeli('tarama', s.simdi);
        await LocalKaza.hareketleriEkle([{ ...temel, kaynak: 'tarama', eklenen: fark.eklenen, cikan: fark.cikan }]);
      }
      await LocalKaza.sonTaramaYaz(zaman);
      return { ...sonuc, sonTarama: zaman };
    }
    return sonuc;
  } catch (e) {
    Logger.warn('KazaDefteri', 'Otomatik kaza taraması yapılamadı', e);
    return null;
  }
}

let taramaZamanlayici: ReturnType<typeof setTimeout> | null = null;
let degisimDinleyicisi: (() => void) | null = null;

/**
 * Kılınmışlık değişince (geçmiş günü "kıldım"/"kılmadım") tarama günlüğü
 * tazelenir. Adlı yuva → idempotent; HER JS bağlamında (headless dahil) kurulur.
 */
export function baslat(): void {
  kayitDegistiDinleyicisiEkle(DINLEYICI_ADI, () => {
    if (taramaZamanlayici) clearTimeout(taramaZamanlayici);
    taramaZamanlayici = setTimeout(() => {
      taramaZamanlayici = null;
      taramaYap()
        .then(() => degisimDinleyicisi?.())
        .catch(() => undefined);
    }, TARAMA_GECIKMESI_MS);
  });
}

/** Ön plan: tarama bitince ekran tazelensin (App.tsx store'a bağlar). */
export function degisimDinleyicisiniAyarla(fn: (() => void) | null): void {
  degisimDinleyicisi = fn;
}

// ==================== HAREKET ÜRETİCİLERİ ====================

type Temel = Pick<KazaHareketi, 'id' | 'zaman' | 'cihaz'>;

export const hareketUret = {
  manuel: (t: Temel, vakit: KazaVakti, adet: number, not?: string): KazaHareketi => ({
    ...t,
    kaynak: 'manuel',
    vakit,
    adet,
    ...(not ? { not } : {}),
  }),
  kilindi: (t: Temel, vakit: KazaVakti, adet: number): KazaHareketi => ({ ...t, kaynak: 'kilindi', vakit, adet }),
  duzeltme: (t: Temel, vakit: KazaVakti, adet: number): KazaHareketi => ({ ...t, kaynak: 'duzeltme', vakit, adet }),
  otoAyar: (t: Temel, aktif: boolean, gun: string, kayitsiz?: KayitsizGunTercihi): KazaHareketi => ({
    ...t,
    kaynak: 'otoAyar',
    aktif,
    gun,
    ...(kayitsiz ? { kayitsiz } : {}),
  }),
  gunKarari: (t: Temel, gun: string, karar: 'ekle' | 'yoksay'): KazaHareketi => ({
    ...t,
    kaynak: 'gunKarari',
    referans: gun,
    karar,
  }),
  temizlik: (t: Temel, hedefIdler: string[], islem?: string): KazaHareketi => ({
    ...t,
    kaynak: 'temizlik',
    hedefIdler,
    ...(islem ? { islem } : {}),
  }),
  temizlikGeriAl: (t: Temel, temizlikId: string): KazaHareketi => ({ ...t, kaynak: 'temizlikGeriAl', hedefId: temizlikId }),
};

/** Yazıp türetir (thunk'ların ortak yolu). */
export async function yazVeHesapla(uret: (temel: (onek: string) => Promise<Temel>) => Promise<KazaHareketi[]>): Promise<DefterSonucu> {
  const hareketler = await uret((onek) => LocalKaza.yeniHareketTemeli(onek));
  if (hareketler.length > 0) await LocalKaza.hareketleriEkle(hareketler);
  return defteriHesapla();
}
