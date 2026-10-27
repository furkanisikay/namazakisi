/**
 * Kaza Defteri 2.0 — TÜRETME (fold) ve otomatik kaza İZDÜŞÜMÜ. SAF.
 *
 * Görünen her sayı buradan geçer. Girdi: hareketler + o anki namaz kaydı
 * (izdüşüm için) + özel gün kümesi + mezhep. Çıktı eski `KazaDurumu` ile
 * şekil-uyumludur (`namazlar[].kalanBorc` …) — öneri (#294) ve ekran aynı
 * alanları okumaya devam eder.
 *
 * Kurallar (sahip kararları, 2026-10-15):
 * - En son `taban` geçerlidir; eskiler tarihçe. Kılınanlar ve eklemeler
 *   tabandan bağımsızdır → taban değişince kendiliğinden yeniden uygulanır.
 * - Fold KRONOLOJİKTİR: kılınan kalanı aşarsa taşan kısım AYRI `fazla`
 *   akümülatörüne gider; sonradan eklenen borçlardan DÜŞÜLMEZ (fıkhî iddia
 *   içermesin). Fazla yalnız gösterilir; "fazlayı sıfırla" = −düzeltme.
 * - Otomatik kaza: kapanmış her namaz günü (otomatik aralık içinde) için,
 *   özel gün değilse, "bana sorun" bekleyeni değilse, temizlikle gizlenmemişse,
 *   aynı referanslı `bildirim` yoksa ve vakit işaretsizse +1 (`oto:<gün>_<v>`).
 *   Vitir yalnız mezhep Hanefî iken ve yatsı işaretsizken. Kerahat istisna DEĞİL.
 */

import type { KazaDurumu, KazaNamaz, KazaNamazAdi } from '../types/KazaTipleri';
import { gunEkle, ISOTarihiDateNesnesiNeCevir, tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import {
  FARZ_KAZA_VAKITLERI,
  KAZA_ADINDAN_VAKTE,
  GIZLENEBILIR_KAYNAKLAR,
  KAZA_VAKITLERI,
  KAZA_VAKTI_ADI,
  OTO_ONEK,
  fnv1aHex,
  isoGunMu,
  kanonikDize,
  otoKimligi,
  referansCoz,
  referansOlustur,
  siraKarsilastir,
  type KayitsizGunTercihi,
  type KazaHareketi,
  type KazaVakti,
} from './kazaHareketi';

/** İzdüşüm penceresinin üst sınırı (gün) — bozuk aralık bellek tüketmesin. */
export const IZDUSUM_AZAMI_GUN = 3700;
/** "Geçmiş günleri tarayın" en fazla bu kadar geriye gider. */
export const GECMIS_TARAMA_AZAMI_GUN = 366;

// ==================== YARDIMCILAR ====================

const sifirVakitler = (): Record<KazaVakti, number> => ({
  sabah: 0,
  ogle: 0,
  ikindi: 0,
  aksam: 0,
  yatsi: 0,
  vitir: 0,
});

/** ISO zamanın YEREL takvim günü (tempo / günlük sayaç). */
export const zamanGunu = (zaman: string): string => {
  const t = new Date(zaman);
  return Number.isFinite(t.getTime()) ? tarihiISOFormatinaCevir(t) : zaman.slice(0, 10);
};

/** Temizlikle gizlenmiş kimlikler (geri alınan temizlikler hariç). */
export function gizliKimlikler(hareketler: readonly KazaHareketi[]): Set<string> {
  const geriAlinan = new Set<string>();
  for (const h of hareketler) if (h.kaynak === 'temizlikGeriAl' && h.hedefId) geriAlinan.add(h.hedefId);
  const gizli = new Set<string>();
  for (const h of hareketler) {
    if (h.kaynak !== 'temizlik' || geriAlinan.has(h.id)) continue;
    for (const id of h.hedefIdler ?? []) gizli.add(id);
  }
  return gizli;
}

/** Bir hareket temizlikle gizlenebilir mi (taban, işaret satırları, göç hayır)? */
const gizlenebilirMi = (h: KazaHareketi): boolean =>
  (GIZLENEBILIR_KAYNAKLAR as readonly string[]).includes(h.kaynak) && !h.gocmis;

// ==================== OTOMATİK ARALIKLAR ====================

export interface OtomatikAralik {
  baslangic: string;
  /** Dahil son gün; `null` = açık (bugüne kadar). */
  bitis: string | null;
}

export interface OtomatikDurum {
  aktif: boolean;
  /** Açık aralığın başlangıcı (aktifken). */
  baslangic: string | null;
  kayitsiz: KayitsizGunTercihi;
  araliklar: OtomatikAralik[];
}

/**
 * `otoAyar` hareketlerinden aralıklar. Kapatıp açmak ARADAKİ günleri taramaz
 * (spec §9); "geçmiş günleri tarayın" açık aralığın başını geriye çeker.
 */
export function otomatikDurumu(hareketler: readonly KazaHareketi[]): OtomatikDurum {
  const olaylar = hareketler.filter((h) => h.kaynak === 'otoAyar' && h.gun).sort(siraKarsilastir);
  const araliklar: OtomatikAralik[] = [];
  let acik: string | null = null;
  let kayitsiz: KayitsizGunTercihi = 'sor';
  for (const e of olaylar) {
    if (e.kayitsiz) kayitsiz = e.kayitsiz;
    const gun = e.gun as string;
    if (e.aktif) {
      if (acik === null || gun < acik) acik = gun;
    } else if (acik !== null) {
      const bitis = gunEkle(gun, -1);
      if (bitis >= acik) araliklar.push({ baslangic: acik, bitis });
      acik = null;
    }
  }
  if (acik !== null) araliklar.push({ baslangic: acik, bitis: null });
  return { aktif: acik !== null, baslangic: acik, kayitsiz, araliklar };
}

/**
 * Otomatik eklemenin başlangıç günü geçerli mi? ISO gün olmalı, bugünün namaz
 * gününü geçmemeli ve en fazla `GECMIS_TARAMA_AZAMI_GUN` geriye gidebilir
 * ("geçmiş günleri tarayın" sınırı). Sınır YAZIM anında uygulanır; izdüşüm
 * eski kayıtları yaşa göre kırpmaz (kırpsaydı bir yıl önceki otomatik kayıtlar
 * kendiliğinden kaybolur ve kalan kullanıcı bir şey yapmadan düşerdi).
 */
export function otomatikBaslangicGecerliMi(gun: unknown, bugunNamazGunu: string): gun is string {
  if (!isoGunMu(gun)) return false;
  return gun <= bugunNamazGunu && gun >= gunEkle(bugunNamazGunu, -GECMIS_TARAMA_AZAMI_GUN);
}

/**
 * İzdüşümün baktığı KAPANMIŞ günler (artan). Namaz günü ertesi imsakta
 * kapanır: `bugunNamazGunu`'nden önceki günler kapanmıştır.
 */
export function izdusumGunleri(hareketler: readonly KazaHareketi[], bugunNamazGunu: string): string[] {
  const { araliklar } = otomatikDurumu(hareketler);
  const sonKapanan = gunEkle(bugunNamazGunu, -1);
  const kume = new Set<string>();
  for (const a of araliklar) {
    const bitis = a.bitis === null || a.bitis > sonKapanan ? sonKapanan : a.bitis;
    let g = a.baslangic;
    let sayac = 0;
    while (g <= bitis && sayac < IZDUSUM_AZAMI_GUN) {
      kume.add(g);
      g = gunEkle(g, 1);
      sayac += 1;
    }
  }
  const gunler = Array.from(kume).sort();
  return gunler.length > IZDUSUM_AZAMI_GUN ? gunler.slice(-IZDUSUM_AZAMI_GUN) : gunler;
}

// ==================== FOLD ====================

export interface DefterHesapGirdisi {
  hareketler: readonly KazaHareketi[];
  /** Şu an süren namaz günü; bundan önceki günler kapanmıştır. */
  bugunNamazGunu: string;
  /** Günlük sayaç/tempo için bugünün TAKVİM günü. */
  bugunTakvim: string;
  /**
   * İzdüşüm günlerinin işaretli farzları (namaz kaydı ∪ muhafız kılınmışlığı).
   * Kayıt yoksa anahtar olmayabilir → işaretsiz gün.
   */
  isaretliler: Readonly<Record<string, readonly KazaVakti[]>>;
  /** Özel gün (hayız/nifas) kümesi — GEÇMİŞ kayıtlar DAHİL. */
  ozelGunler: ReadonlySet<string>;
  /** Mezhep Hanefî → vitir de izdüşer. */
  vitirDahil: boolean;
  gunlukHedef: number;
  toplamGizleMi: boolean;
  /** Göç öncesi günlerin tempo geçmişi (eski `KAZA_TEMPO_GECMIS`). */
  eskiTempo?: Readonly<Record<string, number>>;
  /**
   * Namaz kaydı OKUNAMADIYSA true: izdüşüm bu turda hiç yapılmaz (her gün
   * "işaretsiz" sanılıp borç uydurulmasın).
   */
  izdusumKapali?: boolean;
}

export interface OtoKayit {
  id: string;
  referans: string;
  gun: string;
  vakit: KazaVakti;
}

export interface DefterOzeti {
  taban: number;
  elle: number;
  bildirim: number;
  otomatik: number;
  kilinan: number;
  duzeltme: number;
}

export interface TabanBilgisi {
  id: string;
  zaman: string;
  gocmis: boolean;
  /** Göç tabanının grubu (göç değilse `null`). */
  grup: string | null;
  kapsamBitis: string | null;
  toplam: number;
  degerler: Record<KazaVakti, number>;
}

export interface KazaDefterGorunumu extends KazaDurumu {
  fazla: Record<KazaNamazAdi, number>;
  toplamFazla: number;
  ozet: DefterOzeti;
  otomatik: Omit<OtomatikDurum, 'araliklar'>;
  /** Şu an sayılan otomatik kayıtlar (gizli/bildirimli olanlar HARİÇ). */
  otomatikKayitlar: OtoKayit[];
  /** Gizlemeden önceki izdüşüm referansları (tarama günlüğü bunu izler). */
  otomatikAdaylar: string[];
  /** "Bana sorun": hiç işaret olmayan, kararı verilmemiş kapanmış günler. */
  bekleyenGunler: string[];
  taban: TabanBilgisi | null;
  tempoGecmis: Record<string, number>;
}

/** Sayıya etki eden kaynaklar (göç kapısı ve türetilmiş göçün kaynak kontrolü). */
const DOLU_KAYNAKLAR: readonly string[] = ['taban', 'manuel', 'bildirim', 'kilindi', 'duzeltme'];

interface TabanSecimi {
  taban: KazaHareketi | null;
  /** Kılınanı sayılan TEK göç grubu (yoksa `null`). */
  gocGrubu: string | null;
}

/**
 * Taban + göç grubu seçimi. Birleşimin SIRASINDAN bağımsızdır (iki cihaz aynı
 * kümeden aynı sonucu kurar). Her cihaz açılışta, birleştirmeden önce kendi eski
 * kaydını göç ettirdiği için geç gelen bir göç ilk cihazın defterini EZMEMELİ:
 *
 * - Göç-OLMAYAN taban (yeniden hesap / sihirbaz) varsa en sonuncusu tabandır;
 *   göç tabanı onu, zamanı ne olursa olsun, ASLA geçmez.
 * - Birden çok göç grubu varsa kılınanı sayılan TEK grup İLK göç edendir
 *   (toplam sıra). Göç grupları temizlikle gizlenemediği için sonradan gelen
 *   grubun kuralla kaybetmesi şarttır.
 * - TÜRETİLMİŞ göç (eski sürümün sakladığı, yeni defterden türemiş görüntü)
 *   yalnız gerçek göç grubu yokken ve görüntünün kaynağı olan hareketler
 *   (`turetilmisKadar` anına kadarki başka dolu hareketler) deftere HİÇ
 *   gelmemişken sayılır; kaynak gelince görüntü çift sayılmasın diye düşer.
 */
const tabanSec = (etkin: readonly KazaHareketi[], tumu: readonly KazaHareketi[]): TabanSecimi => {
  let gercek: KazaHareketi | null = null;
  const gocTabanlari: KazaHareketi[] = [];
  for (const h of etkin) {
    if (h.kaynak !== 'taban') continue;
    if (h.gocmis) gocTabanlari.push(h);
    else if (!gercek || siraKarsilastir(h, gercek) > 0) gercek = h;
  }
  gocTabanlari.sort(siraKarsilastir);
  // Kaynak defter yalnız otomatik eklemeden (otoAyar + izdüşüm) ibaret olabilir:
  // görüntünün kalanı o izdüşümdür, `otoAyar` gelince göç düşmeli.
  const kaynakGeldi = (t: KazaHareketi): boolean =>
    tumu.some(
      (h) =>
        (DOLU_KAYNAKLAR.includes(h.kaynak) || h.kaynak === 'otoAyar') &&
        h.grup !== t.grup &&
        h.zaman <= (t.turetilmisKadar as string)
    );
  const secilen =
    gocTabanlari.find((t) => !t.turetilmisKadar) ??
    gocTabanlari.find((t) => !kaynakGeldi(t)) ??
    null;
  return { taban: gercek ?? secilen, gocGrubu: secilen?.grup ?? null };
};

/**
 * Otomatik kaydın fold'daki sözde anı: namaz gününün ertesi takvim günü 00:00
 * UTC. Deterministik ve saat diliminden bağımsız (iki cihaz aynı sırayı kurar).
 * Gösterim için değil, yalnız SIRALAMA içindir — geçmiş ekranı yerel saati
 * `gecmisSatirlari` içinde ayrıca hesaplar.
 */
export const otoSozdeZamani = (gun: string): string => `${gunEkle(gun, 1)}T00:00:00.000Z`;

/** Fold olayı: gerçek hareket ya da otomatik izdüşüm kaydı. */
interface FoldOlayi {
  zaman: string;
  /** Aynı anda eşitlik bozucu (gerçek hareket önce, sonra otomatik). */
  sira: string;
  tur: 'ekle' | 'kil' | 'fazlaDus';
  vakit: KazaVakti;
  adet: number;
  tempoGunu?: string | null;
}

/**
 * Defterin bütün görünür sayılarını türetir.
 *
 * FOLD KRONOLOJİKTİR (sahip kararı: fazla kılınan sonradan eklenen borçtan
 * DÜŞÜLMEZ). En son taban t=0'da başlangıçtır (mutlaktır, zamanından bağımsız);
 * ardından eklemeler (elle, bildirim, otomatik, +düzeltme) ve kılınanlar ZAMAN
 * sırasıyla uygulanır. Kılınan kalanı sıfırın altına iterse taşan kısım AYRI
 * `fazla` akümülatörüne gider ve kalan 0'da durur; sonraki eklemeler fazladan
 * DÜŞÜLMEZ. −düzeltme yalnız fazlayı azaltır ("fazlayı sıfırla").
 */
export function defterHesapla(g: DefterHesapGirdisi): KazaDefterGorunumu {
  const hareketler = [...g.hareketler].sort(siraKarsilastir);
  const gizli = gizliKimlikler(hareketler);
  const etkin = hareketler.filter((h) => !(gizli.has(h.id) && gizlenebilirMi(h)));

  // Taban ve sayılan göç grubu (bkz. `tabanSec`: göç, göç olmayan tabanı geçemez).
  const { taban, gocGrubu } = tabanSec(etkin, hareketler);

  const kalan = sifirVakitler();
  const fazlaSayi = sifirVakitler();
  const kilinan = sifirVakitler();
  const ozet: DefterOzeti = { taban: 0, elle: 0, bildirim: 0, otomatik: 0, kilinan: 0, duzeltme: 0 };
  if (taban?.taban) {
    for (const v of KAZA_VAKITLERI) {
      kalan[v] += taban.taban[v];
      ozet.taban += taban.taban[v];
    }
  }

  const bildirimRefleri = new Set<string>();
  const kararlar = new Map<string, 'ekle' | 'yoksay'>();
  const olaylar: FoldOlayi[] = [];
  const eskiKilinan = sifirVakitler();

  for (const h of etkin) {
    const v = h.vakit;
    const sira = `0|${h.cihaz}|${h.id}`;
    switch (h.kaynak) {
      case 'manuel':
        if (v && h.adet) {
          olaylar.push({ zaman: h.zaman, sira, tur: 'ekle', vakit: v, adet: h.adet });
          ozet.elle += h.adet;
        }
        break;
      case 'bildirim':
        if (v && h.referans && !bildirimRefleri.has(h.referans)) {
          // Aynı referans iki kez yazılmışsa (iki cihaz) tek borç sayılır.
          bildirimRefleri.add(h.referans);
          olaylar.push({ zaman: h.zaman, sira, tur: 'ekle', vakit: v, adet: 1 });
          ozet.bildirim += 1;
        }
        break;
      case 'kilindi':
        if (!v || !h.adet) break;
        if (h.gocmis && h.grup !== gocGrubu) break;
        olaylar.push({
          zaman: h.zaman,
          sira,
          tur: 'kil',
          vakit: v,
          adet: h.adet,
          tempoGunu: h.gocmis ? null : zamanGunu(h.zaman),
        });
        ozet.kilinan += h.adet;
        break;
      case 'duzeltme':
        if (v && h.adet && h.adet > 0) {
          olaylar.push({ zaman: h.zaman, sira, tur: 'ekle', vakit: v, adet: h.adet });
          ozet.duzeltme += h.adet;
        } else if (v && h.adet && h.adet < 0) {
          olaylar.push({ zaman: h.zaman, sira, tur: 'fazlaDus', vakit: v, adet: -h.adet });
        }
        break;
      case 'gunKarari':
        if (h.referans && h.karar) kararlar.set(h.referans, h.karar); // sıralı: son karar kazanır
        break;
      case 'eskiGorunum':
        for (const ev of KAZA_VAKITLERI) eskiKilinan[ev] = Math.max(eskiKilinan[ev], h.kilinanlar?.[ev] ?? 0);
        break;
      default:
        break;
    }
  }

  // ---- Otomatik izdüşüm ----
  const oto = otomatikDurumu(hareketler);
  const otomatikKayitlar: OtoKayit[] = [];
  const otomatikAdaylar: string[] = [];
  const bekleyenGunler: string[] = [];
  for (const gun of g.izdusumKapali ? [] : izdusumGunleri(hareketler, g.bugunNamazGunu)) {
    if (g.ozelGunler.has(gun)) continue;
    const isaretli = new Set(g.isaretliler[gun] ?? []);
    if (isaretli.size === 0) {
      const karar = kararlar.get(gun);
      if (karar === 'yoksay') continue;
      if (!karar && oto.kayitsiz === 'sor') {
        bekleyenGunler.push(gun);
        continue;
      }
    }
    const adayVakitler: KazaVakti[] = FARZ_KAZA_VAKITLERI.filter((v) => !isaretli.has(v));
    if (g.vitirDahil && !isaretli.has('yatsi')) adayVakitler.push('vitir');
    for (const v of adayVakitler) {
      const referans = referansOlustur(gun, v);
      otomatikAdaylar.push(referans);
      const id = otoKimligi(referans);
      if (gizli.has(id) || bildirimRefleri.has(referans)) continue;
      otomatikKayitlar.push({ id, referans, gun, vakit: v });
      olaylar.push({ zaman: otoSozdeZamani(gun), sira: `1|${id}`, tur: 'ekle', vakit: v, adet: 1 });
      ozet.otomatik += 1;
    }
  }

  // ---- Kronolojik fold ----
  olaylar.sort((a, b) =>
    a.zaman < b.zaman ? -1 : a.zaman > b.zaman ? 1 : a.sira < b.sira ? -1 : a.sira > b.sira ? 1 : 0
  );
  const tempo: Record<string, number> = {};
  const kil = (v: KazaVakti, adet: number): void => {
    kilinan[v] += adet;
    const dusen = Math.min(kalan[v], adet);
    kalan[v] -= dusen;
    fazlaSayi[v] += adet - dusen;
  };
  for (const o of olaylar) {
    if (o.tur === 'ekle') kalan[o.vakit] += o.adet;
    else if (o.tur === 'fazlaDus') fazlaSayi[o.vakit] = Math.max(0, fazlaSayi[o.vakit] - o.adet);
    else {
      kil(o.vakit, o.adet);
      if (o.tempoGunu) tempo[o.tempoGunu] = (tempo[o.tempoGunu] ?? 0) + o.adet;
    }
  }
  // Eski sürümlü cihazın gösterdiği kılınan bu defterinkinden fazlaysa aradaki
  // fark (o cihazda kılınmış kazalar) en sonda uygulanır. Maksimum → idempotent.
  for (const v of KAZA_VAKITLERI) {
    const eksik = eskiKilinan[v] - kilinan[v];
    if (eksik > 0) {
      kil(v, eksik);
      ozet.kilinan += eksik;
    }
  }

  // ---- Tempo: göç öncesi günler eski kayıttan, sonrası kılınanlardan ----
  const gocTabani = etkin
    .filter((h) => h.kaynak === 'taban' && h.gocmis && h.grup === gocGrubu)
    .sort(siraKarsilastir)
    .pop();
  const gocGunu = gocTabani ? zamanGunu(gocTabani.zaman) : null;
  const tempoGecmis: Record<string, number> = { ...tempo };
  for (const [gun, adet] of Object.entries(g.eskiTempo ?? {})) {
    if (typeof adet !== 'number' || !Number.isFinite(adet) || adet <= 0) continue;
    if (gocGunu !== null && gun > gocGunu) continue;
    tempoGecmis[gun] = (tempoGecmis[gun] ?? 0) + adet;
  }

  const namazlar: KazaNamaz[] = KAZA_VAKITLERI.map((v) => ({
    namazAdi: KAZA_VAKTI_ADI[v],
    kalanBorc: kalan[v],
    tamamlanan: kilinan[v],
    toplamBorc: kalan[v] + kilinan[v],
  }));
  const fazla = {} as Record<KazaNamazAdi, number>;
  for (const v of KAZA_VAKITLERI) fazla[KAZA_VAKTI_ADI[v]] = fazlaSayi[v];

  const sonZaman = hareketler.length > 0 ? hareketler[hareketler.length - 1].zaman : '';

  return {
    namazlar,
    toplamKalan: namazlar.reduce((t, n) => t + n.kalanBorc, 0),
    toplamTamamlanan: namazlar.reduce((t, n) => t + n.tamamlanan, 0),
    gunlukHedef: g.gunlukHedef,
    gunlukTamamlanan: tempoGecmis[g.bugunTakvim] ?? 0,
    gunlukHedefTarihi: g.bugunTakvim,
    toplamGizleMi: g.toplamGizleMi,
    guncellemeTarihi: sonZaman,
    fazla,
    toplamFazla: Object.values(fazla).reduce((t, n) => t + n, 0),
    ozet,
    otomatik: { aktif: oto.aktif, baslangic: oto.baslangic, kayitsiz: oto.kayitsiz },
    otomatikKayitlar,
    otomatikAdaylar,
    bekleyenGunler,
    taban: taban?.taban
      ? {
          id: taban.id,
          zaman: taban.zaman,
          gocmis: taban.gocmis === true,
          grup: taban.grup ?? null,
          kapsamBitis: taban.kapsamBitis ?? null,
          toplam: KAZA_VAKITLERI.reduce((t, v) => t + (taban?.taban?.[v] ?? 0), 0),
          degerler: { ...taban.taban },
        }
      : null,
    tempoGecmis,
  };
}

// ==================== ESKİ SÜRÜM UYUMLULUĞU (anlık görüntü) ====================

/**
 * Eski (1.x) `KazaDurumu` şeklinde TÜRETİLMİŞ anlık görüntü — yedeğe ve buluta
 * hareketlerin YANINDA yazılır ki eski sürümlü bir cihaz yeni cihazın
 * ilerlemesini görebilsin ("daha ilerlemiş olanı seç"). `defterOzeti` bu
 * görüntünün sayılarından türer: eski cihaz görüntüyü DEĞİŞTİRMEDEN geri
 * yüklerse özet tutar ve yeni defter onu yeniden içe almaz (temizlikle
 * gizlenen bir kılınanı geri getirmesin).
 */
export interface EskiAnlikGoruntu extends KazaDurumu {
  defterOzeti: string;
}

const anlikSayilari = (namazlar: unknown): Record<KazaVakti, { kalan: number; kilinan: number }> | null => {
  if (!Array.isArray(namazlar)) return null;
  const sonuc = {} as Record<KazaVakti, { kalan: number; kilinan: number }>;
  for (const v of KAZA_VAKITLERI) sonuc[v] = { kalan: 0, kilinan: 0 };
  for (const n of namazlar) {
    if (!n || typeof n !== 'object') continue;
    const k = n as Record<string, unknown>;
    const v = KAZA_ADINDAN_VAKTE[String(k.namazAdi)];
    if (!v) continue;
    const sayi = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.floor(x) : 0);
    sonuc[v] = { kalan: sayi(k.kalanBorc), kilinan: sayi(k.tamamlanan) };
  }
  return sonuc;
};

const anlikOzeti = (sayilar: Record<KazaVakti, { kalan: number; kilinan: number }>): string =>
  `defter-${fnv1aHex(kanonikDize(sayilar))}`;

/** Görünümden eski şekilli anlık görüntü üretir. */
export function eskiAnlikGoruntuUret(g: KazaDurumu): EskiAnlikGoruntu {
  const namazlar = g.namazlar.map((n) => ({
    namazAdi: n.namazAdi,
    kalanBorc: n.kalanBorc,
    tamamlanan: n.tamamlanan,
    toplamBorc: n.kalanBorc + n.tamamlanan,
  }));
  const sayilar = anlikSayilari(namazlar) as Record<KazaVakti, { kalan: number; kilinan: number }>;
  return {
    namazlar,
    toplamKalan: g.toplamKalan,
    toplamTamamlanan: g.toplamTamamlanan,
    gunlukHedef: g.gunlukHedef,
    gunlukTamamlanan: g.gunlukTamamlanan,
    gunlukHedefTarihi: g.gunlukHedefTarihi,
    toplamGizleMi: g.toplamGizleMi,
    guncellemeTarihi: g.guncellemeTarihi,
    defterOzeti: anlikOzeti(sayilar),
  };
}

/**
 * Eski sürümlü cihazdan gelen anlık görüntüyü (dolu bir deftere) `eskiGorunum`
 * hareketine çevirir. Kimlik İÇERİKTEN türer → aynı görüntüyü alan iki cihaz
 * aynı hareketi üretir. Bu defterin kendi (değişmemiş) görüntüsü, kılınanı
 * olmayan ya da bozuk görüntü → `null`.
 */
export function eskiGorunumHareketi(ham: unknown, zaman: string, cihaz: string): KazaHareketi | null {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return null;
  const durum = ham as Record<string, unknown>;
  const sayilar = anlikSayilari(durum.namazlar);
  if (!sayilar) return null;
  if (typeof durum.defterOzeti === 'string' && durum.defterOzeti === anlikOzeti(sayilar)) return null;
  const kilinanlar = sifirVakitler();
  for (const v of KAZA_VAKITLERI) kilinanlar[v] = sayilar[v].kilinan;
  if (KAZA_VAKITLERI.every((v) => kilinanlar[v] === 0)) return null;
  return {
    id: `eski-gorunum-${fnv1aHex(kanonikDize(kilinanlar))}`,
    zaman,
    cihaz,
    kaynak: 'eskiGorunum',
    kilinanlar,
  };
}

// ==================== GÖÇ ====================

export interface GocSonucu {
  hareketler: KazaHareketi[];
  ayarlar: { gunlukHedef?: number; toplamGizleMi?: boolean };
}

/**
 * Eski `KAZA_DURUMU` → hareketler. Her vakit: taban = kalan + tamamlanan,
 * kılındı = tamamlanan (ikisi de `gocmis`) → görünen kalan BİREBİR aynı kalır.
 * Kimlikler İÇERİKTEN türer (`goc-<fnv>`): aynı eski kaydı göç eden iki cihaz
 * aynı hareketleri üretir. Nesne-dışı / kullanılamaz değer → `null` (bozuk).
 */
export function eskiDurumdanHareketler(ham: unknown, zaman: string, cihaz: string): GocSonucu | null {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return null;
  const durum = ham as Record<string, unknown>;
  const sayi = (x: unknown): number =>
    typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.floor(x) : 0;
  const kalan = sifirVakitler();
  const tamam = sifirVakitler();
  if (Array.isArray(durum.namazlar)) {
    for (const n of durum.namazlar) {
      if (!n || typeof n !== 'object') continue;
      const kayit = n as Record<string, unknown>;
      const v = (
        { Sabah: 'sabah', 'Öğle': 'ogle', 'İkindi': 'ikindi', 'Akşam': 'aksam', 'Yatsı': 'yatsi', Vitir: 'vitir' } as Record< // dil-haric: kimlik
          string,
          KazaVakti
        >
      )[String(kayit.namazAdi)];
      if (!v) continue;
      kalan[v] = sayi(kayit.kalanBorc);
      tamam[v] = sayi(kayit.tamamlanan);
    }
  }
  const ayarlar: GocSonucu['ayarlar'] = {};
  if (typeof durum.gunlukHedef === 'number' && Number.isFinite(durum.gunlukHedef) && durum.gunlukHedef >= 0) {
    ayarlar.gunlukHedef = Math.floor(durum.gunlukHedef);
  }
  if (typeof durum.toplamGizleMi === 'boolean') ayarlar.toplamGizleMi = durum.toplamGizleMi;

  const bos = KAZA_VAKITLERI.every((v) => kalan[v] === 0 && tamam[v] === 0);
  if (bos) return { hareketler: [], ayarlar };

  // TÜRETİLMİŞ görüntü (`defterOzeti` damgalı; eski sürüm yeni bir cihazın
  // yedeğini/eşitlemesini KAZA_DURUMU'na yazmış): ayrı önekli grup + kaynağın
  // kapsadığı son an. Kaynak defter bu cihaza gelince grup sayılmaz (çift sayım
  // yok, `tabanSec`); hiç gelmezse görünen kalan yine birebir korunur. Eski
  // sürümde görüntü değiştiyse fark "en az bu kadar kılındı" olarak taşınır.
  const turetilmis = typeof durum.defterOzeti === 'string';
  const grup = `${turetilmis ? 'goct' : 'goc'}-${fnv1aHex(kanonikDize({ kalan, tamam }))}`;
  const taban = sifirVakitler();
  for (const v of KAZA_VAKITLERI) taban[v] = kalan[v] + tamam[v];
  const tabanHareketi: KazaHareketi = {
    id: `${grup}:taban`,
    zaman,
    cihaz,
    kaynak: 'taban',
    taban,
    gocmis: true,
    grup,
    kapsamBitis: zaman.slice(0, 10),
  };
  if (turetilmis) {
    const kadar = durum.guncellemeTarihi;
    // Kapsam anı okunamazsa en geniş kabul: herhangi bir kaynak hareket gelince düşer.
    tabanHareketi.turetilmisKadar =
      typeof kadar === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(kadar) ? kadar : '9999-12-31T23:59:59.999Z';
  }
  const hareketler: KazaHareketi[] = [tabanHareketi];
  for (const v of KAZA_VAKITLERI) {
    if (tamam[v] > 0) {
      hareketler.push({ id: `${grup}:kilindi:${v}`, zaman, cihaz, kaynak: 'kilindi', vakit: v, adet: tamam[v], gocmis: true, grup });
    }
  }
  if (turetilmis) {
    const enAz = eskiGorunumHareketi(ham, zaman, cihaz);
    if (enAz) hareketler.push(enAz);
  }
  return { hareketler, ayarlar };
}

/** Defterde sayıya etki eden bir hareket var mı (göç / eski yedek kapısı)? */
export const defterDoluMu = (hareketler: readonly KazaHareketi[]): boolean =>
  hareketler.some((h) => DOLU_KAYNAKLAR.includes(h.kaynak));

// ==================== YENİDEN HESAPLAMA ÖNİZLEMESİ ====================

export type OrtusmeSecimi = 'ayrica' | 'gizle';

export interface YeniTabanOnizlemesi {
  eski: KazaDefterGorunumu;
  ayrica: KazaDefterGorunumu;
  gizle: KazaDefterGorunumu | null;
  ortusenIdler: string[];
  ortusenOtomatik: number;
  ortusenBildirim: number;
  /** Değişen taban göçle gelmişse önizleme bunu AÇIKÇA söyler. */
  gocmisTabanDegisiyor: boolean;
  yazilacak: Record<OrtusmeSecimi, KazaHareketi[]>;
}

/**
 * Yeni taban yazılmadan önce ne olacağını hesaplar. Örtüşme: `kapsamBitis`
 * öncesine düşen otomatik ve bildirim kayıtları yeni hesapta da sayılmış
 * olabilir; varsayılan "ayrıca sayılsın" (veri kaybı yok), istenirse TEK bir
 * geri alınabilir temizlikle gizlenir.
 */
export function yeniTabanOnizlemesi(
  g: DefterHesapGirdisi,
  yeniTaban: Record<KazaVakti, number>,
  kapsamBitis: string,
  zaman: string,
  cihaz: string,
  kimlik: (onek: string) => string
): YeniTabanOnizlemesi {
  const eski = defterHesapla(g);
  const islem = kimlik('islem');
  const tabanHareketi: KazaHareketi = {
    id: kimlik('taban'),
    zaman,
    cihaz,
    kaynak: 'taban',
    taban: { ...yeniTaban },
    kapsamBitis,
    islem,
  };
  const gizli = gizliKimlikler(g.hareketler);
  const ortusenBildirimler = g.hareketler.filter((h) => {
    if (h.kaynak !== 'bildirim' || gizli.has(h.id)) return false;
    const ref = referansCoz(h.referans);
    return !!ref && ref.gun <= kapsamBitis;
  });
  const ortusenOto = eski.otomatikKayitlar.filter((o) => o.gun <= kapsamBitis);
  const ortusenIdler = [...ortusenOto.map((o) => o.id), ...ortusenBildirimler.map((h) => h.id)];
  const ayricaListe = [tabanHareketi];
  const gizleListe: KazaHareketi[] =
    ortusenIdler.length > 0
      ? [
          tabanHareketi,
          { id: kimlik('temizlik'), zaman, cihaz, kaynak: 'temizlik', hedefIdler: ortusenIdler, islem },
        ]
      : ayricaListe;
  const ayrica = defterHesapla({ ...g, hareketler: [...g.hareketler, ...ayricaListe] });
  const gizle = ortusenIdler.length > 0 ? defterHesapla({ ...g, hareketler: [...g.hareketler, ...gizleListe] }) : null;
  return {
    eski,
    ayrica,
    gizle,
    ortusenIdler,
    ortusenOtomatik: ortusenOto.length,
    ortusenBildirim: ortusenBildirimler.length,
    gocmisTabanDegisiyor: eski.taban?.gocmis === true,
    yazilacak: { ayrica: ayricaListe, gizle: gizleListe },
  };
}

// ==================== TEMİZLİK ====================

export type TemizlikKaynagi = 'otomatik' | 'manuel' | 'bildirim' | 'kilindi' | 'duzeltme';

export const TEMIZLIK_KAYNAKLARI: readonly TemizlikKaynagi[] = ['otomatik', 'manuel', 'bildirim', 'kilindi', 'duzeltme'];

export interface TemizlikSuzgeci {
  kaynaklar: readonly TemizlikKaynagi[];
  /** Dahil; namaz günü (otomatik/bildirim) ya da yazıldığı gün. */
  baslangic?: string | null;
  bitis?: string | null;
  /** `null`/yok = tüm vakitler. */
  vakit?: KazaVakti | null;
}

export interface TemizlikAdayi {
  id: string;
  kaynak: TemizlikKaynagi;
  vakit: KazaVakti;
  /** Kalana etkisi (gizlenince tersine döner): +1 borç, −N kılınan… */
  etki: number;
  /** Süzgeç ve gösterim günü. */
  gun: string;
}

/** Süzgece uyan, şu an ETKİN (gizlenmemiş) kayıtlar. Taban ve göç hariç. */
export function temizlikAdaylari(
  hareketler: readonly KazaHareketi[],
  otomatikKayitlar: readonly OtoKayit[],
  s: TemizlikSuzgeci
): TemizlikAdayi[] {
  const gizli = gizliKimlikler(hareketler);
  const adaylar: TemizlikAdayi[] = [];
  const uyar = (a: TemizlikAdayi): boolean =>
    s.kaynaklar.includes(a.kaynak) &&
    (!s.vakit || a.vakit === s.vakit) &&
    (!s.baslangic || a.gun >= s.baslangic) &&
    (!s.bitis || a.gun <= s.bitis);
  for (const o of otomatikKayitlar) {
    const a: TemizlikAdayi = { id: o.id, kaynak: 'otomatik', vakit: o.vakit, etki: 1, gun: o.gun };
    if (uyar(a)) adaylar.push(a);
  }
  for (const h of hareketler) {
    if (!gizlenebilirMi(h) || gizli.has(h.id) || !h.vakit) continue;
    const kaynak = h.kaynak as TemizlikKaynagi;
    const gun = h.kaynak === 'bildirim' ? referansCoz(h.referans)?.gun ?? zamanGunu(h.zaman) : zamanGunu(h.zaman);
    // −düzeltme yalnız "fazla"yı etkiler → kalana etkisi yok.
    const etki =
      h.kaynak === 'kilindi' ? -(h.adet ?? 0) : h.kaynak === 'bildirim' ? 1 : Math.max(0, h.adet ?? 0);
    const a: TemizlikAdayi = { id: h.id, kaynak, vakit: h.vakit, etki, gun };
    if (uyar(a)) adaylar.push(a);
  }
  return adaylar.sort((x, y) => (x.gun < y.gun ? 1 : x.gun > y.gun ? -1 : x.id < y.id ? -1 : 1));
}

// ==================== TARAMA GÜNLÜĞÜ ====================

/**
 * Önceki taramaların gördüğü kümeye göre fark. Günlük yalnız GEÇMİŞ ekranının
 * "otomatik eklendi / geri alındı" zaman damgalarını besler; sayıya GİRMEZ.
 */
export function taramaFarki(
  hareketler: readonly KazaHareketi[],
  adaylar: readonly string[]
): { eklenen: string[]; cikan: string[] } {
  const gorulen = new Set<string>();
  for (const h of [...hareketler].filter((x) => x.kaynak === 'tarama').sort(siraKarsilastir)) {
    for (const r of h.eklenen ?? []) gorulen.add(r);
    for (const r of h.cikan ?? []) gorulen.delete(r);
  }
  const simdi = new Set(adaylar);
  return {
    eklenen: adaylar.filter((r) => !gorulen.has(r)),
    cikan: Array.from(gorulen).filter((r) => !simdi.has(r)).sort(),
  };
}

// ==================== GEÇMİŞ SATIRLARI ====================

export type GecmisTuru =
  | 'otomatik'
  | 'otomatikGeri'
  | 'manuel'
  | 'bildirim'
  | 'kilindi'
  | 'duzeltme'
  | 'taban'
  | 'temizlik'
  | 'temizlikGeriAl'
  | 'gunKarari'
  | 'otoAyar'
  | 'eskiGorunum';

export interface GecmisSatiri {
  /** Liste anahtarı (otomatik satırda `oto:` kimliği). */
  anahtar: string;
  tur: GecmisTuru;
  zaman: string;
  vakit?: KazaVakti;
  /** İlgili namaz günü (otomatik/bildirim/gün kararı). */
  gun?: string;
  /** Kalana etkisi; `null` = sayı etkisi yok (bilgi satırı). */
  delta: number | null;
  /** Temizlikle gizlenmiş mi? */
  gizli: boolean;
  /** Temizlik satırı: geri alındı mı? */
  geriAlindi?: boolean;
  hareket?: KazaHareketi;
  /** Otomatik satırın kimliği / temizliğin kimliği. */
  kimlik: string;
  cihaz?: string;
}

/** Geçmiş ekranının satırları (yeniden eskiye). Tarama günlüğü satır değildir. */
export function gecmisSatirlari(
  hareketler: readonly KazaHareketi[],
  gorunum: Pick<KazaDefterGorunumu, 'otomatikKayitlar' | 'otomatikAdaylar'>
): GecmisSatiri[] {
  const gizli = gizliKimlikler(hareketler);
  const geriAlinan = new Set(
    hareketler.filter((h) => h.kaynak === 'temizlikGeriAl' && h.hedefId).map((h) => h.hedefId as string)
  );
  const taramalar = hareketler.filter((h) => h.kaynak === 'tarama').sort(siraKarsilastir);
  const ilkGorulme = new Map<string, string>();
  for (const t of taramalar) for (const r of t.eklenen ?? []) if (!ilkGorulme.has(r)) ilkGorulme.set(r, t.zaman);

  const satirlar: GecmisSatiri[] = [];
  for (const h of hareketler) {
    if (h.kaynak === 'tarama') {
      for (const r of h.cikan ?? []) {
        const ref = referansCoz(r);
        if (!ref) continue;
        satirlar.push({
          anahtar: `${h.id}:${r}`,
          tur: 'otomatikGeri',
          zaman: h.zaman,
          vakit: ref.vakit,
          gun: ref.gun,
          delta: null,
          gizli: false,
          kimlik: otoKimligi(r),
          cihaz: h.cihaz,
        });
      }
      continue;
    }
    let delta: number | null = null;
    if (h.kaynak === 'manuel') delta = h.adet ?? 0;
    else if (h.kaynak === 'bildirim') delta = 1;
    else if (h.kaynak === 'kilindi') delta = -(h.adet ?? 0);
    else if (h.kaynak === 'duzeltme') delta = (h.adet ?? 0) > 0 ? (h.adet as number) : null;
    else if (h.kaynak === 'temizlik') delta = null;
    const gun =
      h.kaynak === 'bildirim' ? referansCoz(h.referans)?.gun : h.kaynak === 'gunKarari' ? h.referans : undefined;
    satirlar.push({
      anahtar: h.id,
      tur: h.kaynak as GecmisTuru,
      zaman: h.zaman,
      vakit: h.vakit,
      gun,
      delta,
      gizli: gizli.has(h.id) && gizlenebilirMi(h),
      geriAlindi: h.kaynak === 'temizlik' ? geriAlinan.has(h.id) : undefined,
      hareket: h,
      kimlik: h.id,
      cihaz: h.cihaz,
    });
  }
  // Tarama günlüğü yoksa (ilk açılış) gün kapanışını YEREL gece yarısı olarak
  // göster (fold'un UTC sözde anı yalnız sıralama içindir, gösterim değil).
  const kapanisAni = (gun: string): string => ISOTarihiDateNesnesiNeCevir(gunEkle(gun, 1)).toISOString();
  for (const o of gorunum.otomatikKayitlar) {
    const zaman = ilkGorulme.get(o.referans) ?? kapanisAni(o.gun);
    satirlar.push({ anahtar: o.id, tur: 'otomatik', zaman, vakit: o.vakit, gun: o.gun, delta: 1, gizli: false, kimlik: o.id });
  }
  // Gizlenmiş otomatik kayıtlar da görünür kalsın (geri alınabilsin) — yalnız
  // hâlâ izdüşüm adayıysa (sonradan kılınmış vakit artık kayıt değildir).
  const adaylar = new Set(gorunum.otomatikAdaylar);
  for (const id of gizli) {
    if (!id.startsWith(OTO_ONEK) || !adaylar.has(id.slice(OTO_ONEK.length))) continue;
    const ref = referansCoz(id.slice(OTO_ONEK.length));
    if (!ref) continue;
    const zaman = ilkGorulme.get(id.slice(OTO_ONEK.length)) ?? kapanisAni(ref.gun);
    satirlar.push({ anahtar: `gizli:${id}`, tur: 'otomatik', zaman, vakit: ref.vakit, gun: ref.gun, delta: 1, gizli: true, kimlik: id });
  }
  return satirlar.sort((a, b) => (a.zaman < b.zaman ? 1 : a.zaman > b.zaman ? -1 : a.anahtar < b.anahtar ? -1 : 1));
}
