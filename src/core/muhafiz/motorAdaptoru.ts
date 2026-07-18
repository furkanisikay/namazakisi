/**
 * Motor adaptoru (Faz 3) — vakit x seviye matrisini uc tuketicinin
 * (`ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`)
 * dogrudan kullanabilecegi plana cevirir.
 *
 * SAF: store'a, native'e ve tarihe bagimli DEGIL -> tam test edilebilir.
 *
 * Mod semantigi (spec 3/9):
 *   sessiz   -> hicbir sey (pencere bile saglamaz, bkz. `aktifSeviyeyiBul`)
 *   bildirim -> bildirim
 *   sesli    -> Faz 4'te TTS; SIMDILIK bildirim gibi davranir, `sesliAnons`
 *               bayragi + `anonsMetni` veriye tasinir (Faz 4 kancasi)
 *   ikisi    -> bildirim (+ Faz 4'te TTS)
 */
import type {
  MuhafizMatrisi,
  SeviyeAyari,
  SeviyeKademe,
  Siklik,
  UyariModu,
  VakitMuhafizAyari,
} from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from './matrisTipleri';
import { aktifSeviyeyiBul } from './aktifSeviye';
import { eskidenMatriseGoc, type EskiMuhafizAyari } from './muhafizGoc';
import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';

/** Kademe'nin sayisal karsiligi (1..4) — baslik/oncelik/icerik havuzu bunu kullanir. */
export type SeviyeNo = 1 | 2 | 3 | 4;

export function kademeSeviyeNo(kademe: SeviyeKademe): SeviyeNo {
  const indeks = SEVIYE_KADEMELERI.indexOf(kademe);
  return (indeks >= 0 ? indeks + 1 : 1) as SeviyeNo;
}

/** 'birkez' -> null (tek atis); {herDk:n} -> n. */
export function siklikDakikasi(siklik: Siklik): number | null {
  return siklik === 'birkez' ? null : siklik.herDk;
}

/** mod sesli anons (Faz 4 TTS) istiyor mu? */
export function sesliAnonsGerekliMi(mod: UyariModu): boolean {
  return mod === 'sesli' || mod === 'ikisi';
}

/**
 * Bu seviye, vaktin cikmasina `kalanDk` varken tetiklenir mi?
 * Pencere (kalanDk <= esikDk) + siklik kurali birlikte degerlendirilir.
 *
 * Siklik, seviyenin KENDI esigine GORECELI olcuulur ((esik - kalan) % herDk):
 * boylece seviye gecis noktasinda (kalan == esik) her zaman bir tetik olur ve
 * arka plan (zamanlanmis) ile on plan (banner) ayni dakikalarda konusur.
 * `herDk <= 0` savunmasi: mod/NaN yerine sessizce hic tetiklenmez.
 */
export function seviyeTetiklenirMi(seviye: SeviyeAyari, kalanDk: number): boolean {
  if (seviye.mod === 'sessiz') return false;
  if (kalanDk > seviye.esikDk) return false;

  const herDk = siklikDakikasi(seviye.siklik);
  if (herDk === null) return kalanDk === seviye.esikDk; // birkez: yalniz esik aninda
  if (herDk <= 0) return false;
  return (seviye.esikDk - kalanDk) % herDk === 0;
}

/** Bir vakit icin planlanmis tek bir uyari. */
export interface UyariPlani {
  /** Vaktin cikmasina kalan dakika */
  kalanDk: number;
  seviye: SeviyeNo;
  mod: UyariModu;
  bildirimSesi: string;
  anonsMetni: string;
  /** Faz 4 TTS bayragi (mod 'sesli' | 'ikisi') */
  sesliAnons: boolean;
}

/**
 * Bir vaktin tum uyari dakikalarini hesaplar (kalan dakika AZALAN sirada).
 *
 * `kalanDkSiniri` su an vaktin cikmasina kalan dakikadir; tarama
 * min(kalanDkSiniri, en buyuk SESSIZ OLMAYAN esik) noktasindan baslar.
 * Her dakika icin kazanan seviye `aktifSeviyeyiBul` ile bulunur (sessiz seviye
 * pencere saglamaz; en kucuk esikli = en acil kazanir) -> ayni dakikaya birden
 * cok seviye dusemez, cakisma dogal olarak tekillesir.
 */
export function vakitUyariPlaniOlustur(
  vakitAyari: VakitMuhafizAyari,
  kalanDkSiniri: number
): UyariPlani[] {
  const enBuyukEsik = vakitAyari.seviyeler.reduce(
    (enBuyuk, s) => (s.mod !== 'sessiz' && s.esikDk > enBuyuk ? s.esikDk : enBuyuk),
    0
  );

  const plan: UyariPlani[] = [];
  for (let k = Math.min(kalanDkSiniri, enBuyukEsik); k > 0; k--) {
    const kazanan = aktifSeviyeyiBul(vakitAyari, k);
    if (!kazanan) continue;
    if (!seviyeTetiklenirMi(kazanan, k)) continue;

    plan.push({
      kalanDk: k,
      seviye: kademeSeviyeNo(kazanan.kademe),
      mod: kazanan.mod,
      bildirimSesi: kazanan.bildirimSesi,
      anonsMetni: kazanan.anonsMetni,
      sesliAnons: sesliAnonsGerekliMi(kazanan.mod),
    });
  }
  return plan;
}

/**
 * Hucrenin `bildirimSesi` secimi + seviye -> bildirim kanali.
 *
 * Spec 6: Android'de bildirim sesi KANAL ozelligidir; her ses icin ayri kanal
 * gerekir. Kanal ENFLASYONU yasak -> palet SABIT. Bugun yalnizca iki muhafiz
 * kanali var (`MUHAFIZ`, `MUHAFIZ_ACIL`); res/raw ses dosyalari native degisiklik
 * gerektirdigi icin gercek ses paleti Faz 4'e birakildi. Bu yuzden secim
 * MEVCUT kanallarla birlestirilir:
 *   - 'alarm' sesi seciliyse seviye ne olursa olsun acil kanal (yuksek onem),
 *   - aksi halde onceki kural korunur: seviye >= 3 -> acil, degilse normal.
 * Seçim ayrıca bildirim `data`sina yazilir (Faz 4 gercek kanali oradan turetir).
 */
export function muhafizKanaliSec(seviye: SeviyeNo, bildirimSesi: string): string {
  if (bildirimSesi === 'alarm') return BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL;
  return seviye >= 3
    ? BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ_ACIL
    : BILDIRIM_SABITLERI.KANALLAR.MUHAFIZ;
}

/** Matris yapisal olarak kullanilabilir mi? (5 vakit x 4 seviye + gecerli esik) */
export function matrisGecerliMi(matris: MuhafizMatrisi | undefined): matris is MuhafizMatrisi {
  if (!matris) return false;
  return MUHAFIZ_VAKITLERI.every((vakit) => {
    const vakitAyari = matris[vakit];
    return (
      !!vakitAyari &&
      Array.isArray(vakitAyari.seviyeler) &&
      vakitAyari.seviyeler.length === SEVIYE_KADEMELERI.length &&
      vakitAyari.seviyeler.every((s) => !!s && Number.isFinite(s.esikDk))
    );
  });
}

export type MatrisKaynagi = EskiMuhafizAyari & { matris?: MuhafizMatrisi };

/**
 * Tuketicilerin TEK matris kaynagi.
 *
 * Slice yukleme migrasyonu matrisi garanti eder; yine de savunmaci davranilir:
 * matris yoksa VEYA yapisal olarak bozuksa eski global esik/sikliklardan
 * (`eskidenMatriseGoc`) turetilir. Boylece bozuk tek bir kayit muhafizi
 * tamamen susturamaz.
 */
export function muhafizMatrisiniCoz(kaynak: MatrisKaynagi): MuhafizMatrisi {
  return matrisGecerliMi(kaynak.matris) ? kaynak.matris : eskidenMatriseGoc(kaynak);
}
