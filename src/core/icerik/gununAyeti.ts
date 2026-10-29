/**
 * Günün ayeti — SAF seçim ve görünüm (widget, duvar kâğıdı ve uygulama aynı kaynaktan).
 *
 * Gün NAMAZ GÜNÜDÜR (sahip kararı 2026-10-24): ayet imsakta değişir; gece yarısından sonra
 * yatsı sürerken dünün ayeti kalır. Seçim namaz gününün tarihinden ve dilin havuzundan
 * deterministiktir: Türkçe ile İngilizce aynı havuzu paylaşır; diğer diller meali sığan alt
 * kümeden seçer (`dilHavuzu`), o yüzden aynı gün farklı ayet görebilir. Native yüzeyler ayeti
 * kendileri seçmez; JS bir sonraki günleri `gununAyetiPlani` ile yazar, onlar `baslangicMs`'i
 * geçmiş son kaydı çizer (rakiplerdeki "widget ile uygulama farklı ayet" şikâyetinin çaresi).
 *
 * Yalnız ayet (sahip kararı: hadis eklenmez). Meal QuranEnc'ten, Arapça Tanzil'den birebir.
 */
import { aktifDil, bicim, sozluk, yaziyaCevir } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import { GUNUN_AYETI_HAVUZU, GUNUN_AYETI_KAYNAKLARI, type GununAyetiKaydi, type MealDili } from '../data/gununAyetiHavuzu';
import { sureAdiTr } from '../data/sureAdlari';

/** Verilen takvim gününün imsakı; kaynak yoksa `null` (yapısal: `ImsakSaglayici`). */
export type ImsakKaynagi = (tarih: Date) => Date | null;

/** İmsak bilinmeyen günde (konum yok) gün sınırı: yerel 05:00 (seri ile aynı yedek). */
const YEDEK_SINIR_SAATI = 5;

/**
 * Ardışık günler havuzda bu adımla ilerler; havuz boyuyla aralarında asal olduğu sürece her
 * ayet bir turda tam bir kez çıkar ve art arda iki gün yakın ayet gelmez.
 */
const ADIM = 73;

function ebob(a: number, b: number): number {
  return b === 0 ? a : ebob(b, a % b);
}

/** "YYYY-MM-DD" → 1970-01-01'den bu yana gün sayısı (saat diliminden bağımsız). */
export function gunNumarasi(namazGunu: string): number {
  const [y, a, g] = namazGunu.split('-').map(Number);
  return Math.floor(Date.UTC(y, a - 1, g) / 86_400_000);
}

const mealDiliMi = (dil: DilKodu): dil is DilKodu & MealDili => dil in GUNUN_AYETI_KAYNAKLARI.mealler;

const dilHavuzlari = new Map<DilKodu, readonly GununAyetiKaydi[]>();

/**
 * Dilin ayet havuzu: o dilde meali olan kayıtlar. Meal kaynağı olmayan dil tüm havuzu
 * kullanır ve yalnız Arapçayı gösterir.
 */
export function dilHavuzu(dil: DilKodu): readonly GununAyetiKaydi[] {
  let havuz = dilHavuzlari.get(dil);
  if (!havuz) {
    havuz = mealDiliMi(dil) ? GUNUN_AYETI_HAVUZU.filter((k) => k.mealler[dil] != null) : GUNUN_AYETI_HAVUZU;
    dilHavuzlari.set(dil, havuz);
  }
  return havuz;
}

/** Namaz gününün ayeti. Havuz boyu `ADIM`'ın katıysa adım bir artırılır (tam tur korunur). */
export function gununAyetiKaydi(namazGunu: string, dil: DilKodu = aktifDil()): GununAyetiKaydi {
  const havuz = dilHavuzu(dil);
  const n = havuz.length;
  let adim = ADIM;
  while (ebob(adim, n) !== 1) adim++;
  const i = (((gunNumarasi(namazGunu) * adim) % n) + n) % n;
  return havuz[i];
}

export interface GununAyetiGorunumu {
  ref: string;
  /** Tanzil Uthmani, birebir. */
  ar: string;
  /** Etkin dildeki meal; meali olmayan dilde `null` (yalnız Arapça gösterilir). */
  meal: string | null;
  /** "İnşirâh 94:6" / "Quran 94:6". */
  kisaKunye: string;
  /** "Rowwad Translation Center, QuranEnc 1.0.4"; meal yoksa `null`. */
  mealKaynagi: string | null;
  /** Sayfadaki tam künye (Arapça kaynağı dahil). */
  tamKunye: string;
}

export function gununAyetiGorunumu(kayit: GununAyetiKaydi, dil: DilKodu = aktifDil()): GununAyetiGorunumu {
  const m = sozluk(dil).gununAyeti;
  const kunye = mealDiliMi(dil) ? GUNUN_AYETI_KAYNAKLARI.mealler[dil] : null;
  const meal = mealDiliMi(dil) ? (kayit.mealler[dil] ?? null) : null;
  // QuranEnc mealleri ve yayımcı başlığı Kiril olabilir (uz, kk): dilin gösterilen yazısına çevrilir (`core/dil/yazi`).
  const yayimci = kunye ? { yayimci: yaziyaCevir(kunye.baslik, dil), surum: kunye.surum } : null;
  return {
    ref: kayit.ref,
    ar: kayit.ar,
    meal: meal === null ? null : yaziyaCevir(meal, dil),
    kisaKunye: bicim(m.kisaKunye, { sure: dil === 'tr' ? sureAdiTr(kayit.sure) : m.kuran, ref: kayit.ref }),
    mealKaynagi: yayimci ? bicim(m.mealKaynagi, yayimci) : null,
    tamKunye: yayimci ? bicim(m.sayfaKunye, { ref: kayit.ref, ...yayimci }) : `${kayit.ref} · ${m.arapcaKaynagi}`,
  };
}

/** Yerel takvim günü "YYYY-MM-DD" (UTC'ye kaymaz). */
export function isoGun(t: Date): string {
  const a = String(t.getMonth() + 1).padStart(2, '0');
  const g = String(t.getDate()).padStart(2, '0');
  return `${t.getFullYear()}-${a}-${g}`;
}

/** Takvim gününün başlangıç anı: o günün imsakı, yoksa yerel 05:00. */
function gunBaslangici(gun: Date, imsak: ImsakKaynagi): Date {
  let deger: Date | null = null;
  try {
    deger = imsak(gun);
  } catch {
    deger = null;
  }
  if (deger && !Number.isNaN(deger.getTime()) && isoGun(deger) === isoGun(gun)) return deger;
  return new Date(gun.getFullYear(), gun.getMonth(), gun.getDate(), YEDEK_SINIR_SAATI, 0, 0, 0);
}

/** `simdi` anında süren namaz gününün takvim tarihi. */
export function aktifNamazGunu(simdi: Date, imsak: ImsakKaynagi): Date {
  const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
  if (simdi.getTime() >= gunBaslangici(bugun, imsak).getTime()) return bugun;
  return new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate() - 1);
}

export interface GununAyetiPlanKaydi extends GununAyetiGorunumu {
  /** Namaz günü (YYYY-MM-DD). */
  gun: string;
  /** Bu kaydın gösterilmeye başladığı an (o günün imsakı), epoch ms. */
  baslangicMs: number;
}

/**
 * Süren namaz gününden başlayarak `gunSayisi` günlük plan. Native yüzeyler `baslangicMs <= şimdi`
 * olan SON kaydı çizer; uygulama açılmasa da plan biterken arka plan görevi yeniler.
 */
export function gununAyetiPlani(
  simdi: Date,
  imsak: ImsakKaynagi,
  gunSayisi = 14,
  dil: DilKodu = aktifDil()
): GununAyetiPlanKaydi[] {
  const ilk = aktifNamazGunu(simdi, imsak);
  const plan: GununAyetiPlanKaydi[] = [];
  for (let i = 0; i < gunSayisi; i++) {
    const gun = new Date(ilk.getFullYear(), ilk.getMonth(), ilk.getDate() + i);
    const gunMetni = isoGun(gun);
    plan.push({
      gun: gunMetni,
      baslangicMs: gunBaslangici(gun, imsak).getTime(),
      ...gununAyetiGorunumu(gununAyetiKaydi(gunMetni, dil), dil),
    });
  }
  return plan;
}
