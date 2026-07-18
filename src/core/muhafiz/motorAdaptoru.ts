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
import {
  ESKI_ALARM_SESI,
  eskiAlarmSesiniGoc,
  eskidenMatriseGoc,
  type EskiMuhafizAyari,
} from './muhafizGoc';
import { muhafizKanalIdOlustur } from './sesKimligi';

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
 * mod BILDIRIM SESI calmali mi?
 *
 * TEK KAYNAK: ekran (`BILDIRIMLI_MODLAR` idi) ve domain (`AnonsOnizlemeServisi`)
 * ayni kurali AYRI AYRI yaziyordu; ikizler ayrisirsa onizleme gercek akistan
 * sapar. `sesliAnonsGerekliMi` gibi burada paylasilir.
 */
export function bildirimSesiGerekliMi(mod: UyariModu): boolean {
  return mod === 'bildirim' || mod === 'ikisi';
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
  /** `VARSAYILAN_SES` ya da kullanicinin sectigi `content://...` URI'si */
  bildirimSesi: string;
  /** Secilen sesin adi — kanal ADInda gosterilir (Android ayarlarinda ayirt edilsin) */
  sesAdi?: string;
  /** Hucrenin acil kanal tercihi (ham); cozulmus hali icin `muhafizAcilKanalMi` */
  acilKanal?: boolean;
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
      sesAdi: kazanan.sesAdi,
      acilKanal: kazanan.acilKanal,
      anonsMetni: kazanan.anonsMetni,
      sesliAnons: sesliAnonsGerekliMi(kazanan.mod),
    });
  }
  return plan;
}

/**
 * Bu adim ACIL kanaldan mi gonderilmeli? (MAX onem + bypassDnd)
 *
 * SES ILE ONEM AYRILDI: aciliyet artik `acilKanal` alanindan gelir; ses
 * kullanicinin secimidir ve onem tasimaz.
 *
 * `acilKanal` UC DURUMLUdur — bu SART, cunku alan yalnizca yukseltebilseydi
 * (OR) preset'lerin yazdigi `false` OLU BAYRAK olurdu:
 *   - `true`      -> ACIL (seviye ne olursa olsun)
 *   - `false`     -> ACIL DEGIL (seviye ne olursa olsun). "Hafif" yogunlugu
 *     secen kullanicinin sert/acil adimlari `acilKanal: false` tasir; OR
 *     semantiginde bunlar yine `muhafiz_acil` kanalina (IMPORTANCE_MAX +
 *     setBypassDnd) dusuyor ve kullanicinin Rahatsiz Etmeyin modu deliniyordu.
 *     Preset yazarinin niyeti zaten aciktir: "'dengeli' yogunlukta sessizce
 *     acil kanala dusulmesin" (bkz. `matrisIslemleri.PresetSeviyeAyari`).
 *   - `undefined` -> alan hic yazilmamis (ESKI kayit) -> tarihsel taban kural.
 *
 * Eski kayit yedegi (`acilKanal` yokken): `bildirimSesi === 'alarm'` aciliyet
 * sayilir — eski semada aciliyet ses id'siyle tasiniyordu. Bu deger normalde
 * `eskiAlarmSesiniGoc` ile `acilKanal: true`'ya TASINIR; buradaki dal, goc
 * yolundan gecmemis ham bir kayit dogrudan motora ulasirsa aciliyeti kaybetmesin
 * diye duruyor.
 */
export function muhafizAcilKanalMi(
  seviye: SeviyeNo,
  bildirimSesi: string,
  acilKanal?: boolean
): boolean {
  if (typeof acilKanal === 'boolean') return acilKanal;
  if (bildirimSesi === ESKI_ALARM_SESI) return true;
  return seviye >= 3;
}

/**
 * Hucrenin (ses, aciliyet) secimi -> bildirim kanal id'si.
 *
 * Kanal id SESIN FONKSIYONUDUR (bkz. `sesKimligi.ts`): Android'de kanal sesi
 * olusturulduktan sonra degistirilemez, silip yeniden olusturmak da tombstone'a
 * takilir. Id'yi sese baglayinca bu tuzaklarin ikisi de dogar dogmaz olur.
 *
 * TUM TUKETICILER BU FONKSIYONDAN GECMELI — kanal id artik DINAMIK oldugu icin
 * elle yazilan bir id (ozellikle ham AsyncStorage okuyan arka plan yollarinda)
 * bayat kalir ve kullanici SESSIZCE yanlis sesi duyar.
 */
export function muhafizKanaliSec(
  seviye: SeviyeNo,
  bildirimSesi: string,
  acilKanal?: boolean
): string {
  return muhafizKanalIdOlustur(
    bildirimSesi,
    muhafizAcilKanalMi(seviye, bildirimSesi, acilKanal)
  );
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
 *
 * Eski 'alarm' ses id'si BURADA da goc ettirilir (`eskiAlarmSesiniGoc`): bes
 * tuketicinin ikisi (`ArkaplanGorevServisi`, `KonumTakipServisi`) store'u degil
 * HAM AsyncStorage'i okur, yani slice'in yukleme gocunden gecmez. Goc gerekmiyorsa
 * AYNI referans doner (kimlik korunur).
 */
export function muhafizMatrisiniCoz(kaynak: MatrisKaynagi): MuhafizMatrisi {
  return matrisGecerliMi(kaynak.matris)
    ? eskiAlarmSesiniGoc(kaynak.matris)
    : eskidenMatriseGoc(kaynak);
}
