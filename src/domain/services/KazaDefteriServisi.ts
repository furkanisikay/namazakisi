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
 * Arka planda imsak kaynağı yapılandırılmamışsa 05:00 yedeğine düşülür — gün
 * mevsime göre imsaktan biraz ERKEN (kış) ya da GEÇ (yaz) kapanabilir. Sayılar
 * etkilenmez (izdüşüm her türetmede yeniden kurulur); en fazla tarama günlüğünde
 * "eklendi → geri alındı" çifti oluşur (ör. kışın 05:00–imsak arası kılınan yatsı).
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
  KAZA_VAKITLERI,
  hareketKimligi,
} from '../../core/kaza/kazaHareketi';
import {
  defterHesapla,
  izdusumGunleri,
  otomatikBaslangicGecerliMi,
  taramaFarki,
  yeniTabanOnizlemesi,
  type DefterHesapGirdisi,
  type KazaDefterGorunumu,
  type YeniTabanOnizlemesi,
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
  /** Bu sürümün çözemediği hareketler (yedek/eşitleme yüküne aynen gider). */
  bilinmeyenler: LocalKaza.DefterOkumasi['bilinmeyenler'];
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
    bilinmeyenler: okuma.bilinmeyenler,
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

// ==================== ÖNİZLEMELER (yazmaz) ====================

/** Önizlemede ekranın ihtiyaç duyduğu, serileştirilebilir özet. */
export interface TabanOnizlemeOzeti {
  kapsamBitis: string;
  eskiKalan: number;
  ayricaKalan: number;
  /** Örtüşen kayıt yoksa `null`. */
  gizleKalan: number | null;
  eskiTaban: number | null;
  yeniTaban: number;
  ortusenOtomatik: number;
  ortusenBildirim: number;
  /** Değişen taban önceki sürümden aktarılmışsa ekran bunu AÇIKÇA söyler. */
  gocmisTabanDegisiyor: boolean;
  /** Önceki sürümde kılınanlar (göçle gelen) — yeni tabandan da düşülür. */
  gocmisKilinan: number;
  ozet: KazaDefterGorunumu['ozet'];
  /** Vakit başına eski → yeni kalan. */
  vakitler: Array<{ vakit: KazaVakti; eski: number; yeni: number }>;
  yeniFazla: number;
}

/**
 * Sihirbazın son adımı: yeni taban DİSKTEN TAZE okunan defterle önizlenir.
 * HİÇBİR ŞEY YAZMAZ. Uygulama anında (`yeniTabanUygula`) önizleme yeniden
 * kurulur; arada disk değiştiyse sayılar küçük farklarla güncellenebilir.
 */
export async function yeniTabanOnizlemesiHesapla(
  taban: Record<KazaVakti, number>,
  s: GirdiSecenekleri = {}
): Promise<TabanOnizlemeOzeti> {
  const { girdi, cihaz } = await defteriHesapla(s);
  const simdi = s.simdi ?? new Date();
  const kapsamBitis = girdi.bugunNamazGunu;
  const o: YeniTabanOnizlemesi = yeniTabanOnizlemesi(girdi, taban, kapsamBitis, simdi.toISOString(), cihaz, (onek) =>
    hareketKimligi(onek, simdi.getTime())
  );
  const gocGrubu = o.eski.taban?.gocmis ? o.eski.taban.grup : null;
  const gocmisKilinan = gocGrubu
    ? girdi.hareketler
        .filter((h) => h.kaynak === 'kilindi' && h.gocmis && h.grup === gocGrubu)
        .reduce((t, h) => t + (h.adet ?? 0), 0)
    : 0;
  return {
    kapsamBitis,
    eskiKalan: o.eski.toplamKalan,
    ayricaKalan: o.ayrica.toplamKalan,
    gizleKalan: o.gizle ? o.gizle.toplamKalan : null,
    eskiTaban: o.eski.taban?.toplam ?? null,
    yeniTaban: KAZA_VAKITLERI.reduce((t, v) => t + (taban[v] ?? 0), 0),
    ortusenOtomatik: o.ortusenOtomatik,
    ortusenBildirim: o.ortusenBildirim,
    gocmisTabanDegisiyor: o.gocmisTabanDegisiyor,
    gocmisKilinan,
    ozet: o.eski.ozet,
    vakitler: KAZA_VAKITLERI.map((v, i) => ({
      vakit: v,
      eski: o.eski.namazlar[i].kalanBorc,
      yeni: o.ayrica.namazlar[i].kalanBorc,
    })),
    yeniFazla: o.ayrica.toplamFazla,
  };
}

/** "Geçmiş günleri tarayın" önizlemesi: başlangıç geriye alınırsa ne eklenir? */
export interface GecmisTaramaOnizlemesi {
  baslangic: string;
  /** Eklenecek otomatik kayıt sayısı (şu anki görünüme göre fark). */
  eklenecek: number;
  /** Hiç işaret olmayan ("bana sorun") günler — karar bekler. */
  bekleyenGun: number;
  yeniKalan: number;
  eskiKalan: number;
}

export async function gecmisTaramaOnizlemesi(
  baslangic: string,
  s: GirdiSecenekleri = {}
): Promise<GecmisTaramaOnizlemesi> {
  const bugun = bugunNamazGunuAl(s.simdi ?? new Date(), s.imsakSaglayici);
  if (!otomatikBaslangicGecerliMi(baslangic, bugun)) throw new Error('Geçersiz başlangıç günü');
  const simdiki = await defteriHesapla(s);
  const temel = { id: 'onizleme:otoAyar', zaman: (s.simdi ?? new Date()).toISOString(), cihaz: simdiki.cihaz };
  const sonra = await defteriHesapla({
    ...s,
    ekHareketler: [hareketUret.otoAyar(temel, true, baslangic, simdiki.gorunum.otomatik.kayitsiz)],
  });
  return {
    baslangic,
    eklenecek: Math.max(0, sonra.gorunum.ozet.otomatik - simdiki.gorunum.ozet.otomatik),
    bekleyenGun: Math.max(0, sonra.gorunum.bekleyenGunler.length - simdiki.gorunum.bekleyenGunler.length),
    yeniKalan: sonra.gorunum.toplamKalan,
    eskiKalan: simdiki.gorunum.toplamKalan,
  };
}

/** Temizlik önizlemesi: seçili kayıtlar gizlenince kalan kaç olur? (yazmaz) */
export async function temizlikOnizlemesi(
  hedefIdler: readonly string[],
  s: GirdiSecenekleri = {}
): Promise<{ eskiKalan: number; yeniKalan: number }> {
  const simdiki = await defteriHesapla(s);
  if (hedefIdler.length === 0) return { eskiKalan: simdiki.gorunum.toplamKalan, yeniKalan: simdiki.gorunum.toplamKalan };
  const temel = { id: 'onizleme:temizlik', zaman: (s.simdi ?? new Date()).toISOString(), cihaz: simdiki.cihaz };
  const gorunum = defterHesapla({
    ...simdiki.girdi,
    hareketler: [...simdiki.girdi.hareketler, hareketUret.temizlik(temel, [...hedefIdler])],
  });
  return { eskiKalan: simdiki.gorunum.toplamKalan, yeniKalan: gorunum.toplamKalan };
}
