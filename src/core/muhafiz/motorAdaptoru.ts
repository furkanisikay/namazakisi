/**
 * Motor adaptoru (Faz 3) — vakit x seviye matrisini uc tuketicinin
 * (`ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`)
 * dogrudan kullanabilecegi plana cevirir.
 *
 * SAF: store'a, native'e ve tarihe bagimli DEGIL -> tam test edilebilir.
 *
 * KANAL semantigi (Faz 2 — eski `mod` enum'unun yerini aldi):
 *   hicbiri  -> adim KAPALI (pencere bile saglamaz, bkz. `aktifSeviyeyiBul`)
 *   bildirim -> Android bildirimi (+ on planda bildirim sesi)
 *   sesli    -> native TTS anonsu; `sesliAnons` bayragi + `anonsMetni` veriye tasinir
 *   titresim -> kanal titresimi + on planda `Vibration.vibrate` (Faz 6); kanal
 *               id'sinin de girdisidir (bkz. `muhafizKanaliSec`)
 */
import type {
  MuhafizMatrisi,
  SeviyeAyari,
  SeviyeKademe,
  Siklik,
  UyariKanallari,
  VakitMuhafizAyari,
} from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from './matrisTipleri';
import { adimKapaliMi, kanalAcikMi } from './kanalKumesi';
import { aktifSeviyeyiBul } from './aktifSeviye';
import {
  ESKI_ALARM_SESI,
  eskiAlarmSesiniGoc,
  eskidenMatriseGoc,
  modlariKanallaraGoc,
  type EskiMuhafizAyari,
} from './muhafizGoc';
import { muhafizKanalIdOlustur } from './sesKimligi';
import { cikisSegmentiHesapla, girisSegmentiHesapla, etkinSiklikHesapla } from './planButcesi';
import { VARSAYILAN_PENCERE_YONU, type PencereYonu } from './pencereTipleri';

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

/** Kanal kumesi sesli anons (TTS) istiyor mu? */
export function sesliAnonsGerekliMi(kanallar: UyariKanallari | undefined): boolean {
  return kanalAcikMi(kanallar, 'sesli');
}

/**
 * Kanal kumesi BILDIRIM SESI calmali mi?
 *
 * TEK KAYNAK: ekran (`BILDIRIMLI_MODLAR` idi) ve domain (`AnonsOnizlemeServisi`)
 * ayni kurali AYRI AYRI yaziyordu; ikizler ayrisirsa onizleme gercek akistan
 * sapar. `sesliAnonsGerekliMi` gibi burada paylasilir.
 */
export function bildirimSesiGerekliMi(kanallar: UyariKanallari | undefined): boolean {
  return kanalAcikMi(kanallar, 'bildirim');
}

/**
 * Kanal kumesi TITRESIM istiyor mu? (Faz 6)
 *
 * `bildirimSesiGerekliMi`/`sesliAnonsGerekliMi` ile ayni gerekce: kural tek
 * yerde dursun. Burasi hem kanal id'sini (`muhafizKanaliSec`) hem on plan
 * titresimini besler; ikizlenirse kanal ile davranis ayrisir.
 */
export function titresimGerekliMi(kanallar: UyariKanallari | undefined): boolean {
  return kanalAcikMi(kanallar, 'titresim');
}

/**
 * Bu seviye, vaktin cikmasina `kalanDk` varken tetiklenir mi?
 * Pencere (kalanDk <= esikDk) + siklik kurali birlikte degerlendirilir.
 *
 * Siklik, seviyenin KENDI esigine GORECELI olcuulur ((esik - kalan) % herDk):
 * boylece seviye gecis noktasinda (kalan == esik) her zaman bir tetik olur ve
 * arka plan (zamanlanmis) ile on plan (banner) ayni dakikalarda konusur.
 * `herDk <= 0` savunmasi: mod/NaN yerine sessizce hic tetiklenmez.
 *
 * ALT SINIR `kalanDk >= 1` — TEK KAYNAK BURASI (yasanmis bug): `vakitUyariPlaniOlustur`
 * dongusu zaten `k > 0` ile taradigi icin arka plan 0. dakikayi HIC planlamaz; on plan
 * (`NamazMuhafiziServisi.kontrolEt`) ise `kalanDk`yi ham veriyordu ve `kalanDk = 0`
 * (vaktin son 60 saniyesi) siklik kuralindan gecebiliyordu -> "2 dk kala" kurulu bir
 * adim hem 2. dakikada hem de vakit cikarken konusuyordu. Kurali dongu sinirina degil
 * bu fonksiyona koymak iki motoru da ayni yerden besler.
 *
 * PLAN BUTCESI (Faz 0) DA BURADA: esik tavani artik vaktin gercek penceresinden
 * geldigi icin (720 dk'ya kadar) 1 dk'lik siklik tek vakitte yuzlerce alarm
 * uretebilirdi. Seyreltme `planButcesi.etkinSiklikHesapla` ile YALNIZ bu kapida
 * uygulanir; boylece arka plan plani, on plan banner'i ve onizleme kendiliginden
 * ayni dakikalarda konusur.
 *
 * `kardesler` = o vaktin TUM seviyeleri. Verilirse butce, seviyenin gercekten
 * kazandigi segmentten hesaplanir (varsayilan matris hic seyrelmez); verilmezse
 * esigin tamami segment sayilir — daha temkinli, ama iki motorun da AYNI degeri
 * gecmesi sarttir (ayrisirlarsa banner ile bildirim ayri dakikalara duser).
 *
 * FAZ 1 — YON: `aktifSeviyeyiBul` kazanani secer ama TETIKLEME buradadir; yon
 * yalniz orada uygulansaydi kazanan secilir ama HIC konusmazdi. Bu kapida DORT
 * sey yone gore doner (YENI-1): pencere kapisi, siklik capasi, `birkez` ve
 * (`vakitUyariPlaniOlustur` icinde) tarama siniri.
 *
 * Giris yonunde `pencereUzunluguDk` ZORUNLUdur: ust sinir (`kalanDk >= 1`)
 * ancak pencereden turetilebilir. Verilmezse hic tetiklenmez — sessizce yanlis
 * dakikalarda konusmaktansa hic konusmamak yeglenir ve iki motor ayrismaz.
 */
export interface TetikSecenekleri {
  /** Pencere yonu. Verilmezse `cikisaDogru` — eski cagiranlar birebir korunur. */
  yon?: PencereYonu;
  /** Vaktin bugunku pencere uzunlugu (dk). Giris yonunde ZORUNLU. */
  pencereUzunluguDk?: number;
}

export function seviyeTetiklenirMi(
  seviye: SeviyeAyari,
  olcuDk: number,
  kardesler?: SeviyeAyari[],
  secenekler?: TetikSecenekleri
): boolean {
  if (adimKapaliMi(seviye.kanallar)) return false;
  if (olcuDk < 1) return false;

  const girisYonu = (secenekler?.yon ?? VARSAYILAN_PENCERE_YONU) === 'girisindenItibaren';

  let span: number;
  if (girisYonu) {
    const pencere = secenekler?.pencereUzunluguDk;
    if (!Number.isFinite(pencere) || (pencere as number) <= 0) return false;
    // Vakit cikarken/ciktiktan sonra uyari yok — `kalanDk >= 1` kuralinin aynasi.
    if (olcuDk >= (pencere as number)) return false;
    if (olcuDk < seviye.esikDk) return false;
    span = kardesler
      ? girisSegmentiHesapla(kardesler, seviye, pencere as number)
      : seviye.esikDk;
  } else {
    if (olcuDk > seviye.esikDk) return false;
    span = kardesler ? cikisSegmentiHesapla(kardesler, seviye) : seviye.esikDk;
  }

  const herDk = siklikDakikasi(etkinSiklikHesapla(span, seviye.siklik));
  if (herDk === null) return olcuDk === seviye.esikDk; // birkez: iki yonde de yalniz esik aninda
  if (herDk <= 0) return false;
  // Capa daima seviyenin KENDI esigidir; yalniz isaret doner.
  return (girisYonu ? olcuDk - seviye.esikDk : seviye.esikDk - olcuDk) % herDk === 0;
}

/** Bir vakit icin planlanmis tek bir uyari. */
export interface UyariPlani {
  /**
   * Vaktin cikmasina kalan dakika — ZAMANLAMA alani. Tuketiciler bildirimi
   * `cikis - kalanDk` anina kurar, yon ne olursa olsun.
   */
  kalanDk: number;
  /**
   * Seviyeyi kazandiran OLCU. Cikis yonunde `kalanDk` ile AYNIdir; giris
   * yonunde vaktin girisinden gecen dakikadir. Metin uretimi (anons/banner)
   * bunu kullanir — `kalanDk` ile karistirilirsa giris yonunde "son 42 dakika"
   * gibi ters cumleler dogar (Faz 1 / B11).
   */
  olcuDk: number;
  seviye: SeviyeNo;
  /** Kazanan adimin KANAL KUMESI (Faz 2'de `mod: UyariModu` yerini aldi). */
  kanallar: UyariKanallari;
  /** `VARSAYILAN_SES` ya da kullanicinin sectigi `content://...` URI'si */
  bildirimSesi: string;
  /** Secilen sesin adi — kanal ADInda gosterilir (Android ayarlarinda ayirt edilsin) */
  sesAdi?: string;
  /** Hucrenin acil kanal tercihi (ham); cozulmus hali icin `muhafizAcilKanalMi` */
  acilKanal?: boolean;
  anonsMetni: string;
  /** TTS bayragi ('sesli' kanali acik mi) */
  sesliAnons: boolean;
}

export interface PlanSecenekleri {
  /** Vaktin bugunku pencere uzunlugu (dk). Giris yonunde ZORUNLU. */
  pencereUzunluguDk?: number;
}

/**
 * Bir vaktin tum uyari dakikalarini hesaplar.
 *
 * `olcuDkSiniri` su ANKI olcudur (cikis yonunde kalan, giris yonunde gecen
 * dakika); tarama oradan baslar, boylece gecmis dakikalar planlanmaz.
 *
 * Her dakika icin kazanan seviye `aktifSeviyeyiBul` ile bulunur → ayni dakikaya
 * birden cok seviye dusemez, cakisma dogal olarak tekillesir.
 *
 * TARAMA SINIRI YONE GORE (Faz 1 / YENI-1, dorduncu yer):
 * - `cikisaDogru`: en buyuk SESSIZ OLMAYAN esikten 1'e AZALAN.
 * - `girisindenItibaren`: 1'den PENCERE SONUNA ARTAN — `enBuyukEsik`te DEGIL.
 *   En sert adim kendi esiginden sonra pencere bitene kadar surer; `enBuyukEsik`te
 *   durulsaydi "cikana kadar devam et" hic gerceklesmez ve on plan (`kontrolEt`
 *   surer) ile arka plan AYRISIRDI.
 *
 * Pencere uzunlugu bilinmeden giris plani uretilmez (bos doner): tetik kapisiyla
 * ayni sozlesme.
 */
export function vakitUyariPlaniOlustur(
  vakitAyari: VakitMuhafizAyari,
  olcuDkSiniri: number,
  secenekler?: PlanSecenekleri
): UyariPlani[] {
  const yon: PencereYonu = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const girisYonu = yon === 'girisindenItibaren';
  const pencereUzunluguDk = secenekler?.pencereUzunluguDk;

  if (girisYonu && (!Number.isFinite(pencereUzunluguDk) || (pencereUzunluguDk as number) <= 0)) {
    return [];
  }

  const enBuyukEsik = vakitAyari.seviyeler.reduce(
    (enBuyuk, s) => (!adimKapaliMi(s.kanallar) && s.esikDk > enBuyuk ? s.esikDk : enBuyuk),
    0
  );

  const baslangic = girisYonu ? Math.max(olcuDkSiniri, 1) : Math.min(olcuDkSiniri, enBuyukEsik);
  const bitis = girisYonu ? (pencereUzunluguDk as number) - 1 : 1;
  const adim = girisYonu ? 1 : -1;

  const plan: UyariPlani[] = [];
  for (let o = baslangic; girisYonu ? o <= bitis : o >= bitis; o += adim) {
    const kazanan = aktifSeviyeyiBul(vakitAyari, o);
    if (!kazanan) continue;
    if (!seviyeTetiklenirMi(kazanan, o, vakitAyari.seviyeler, { yon, pencereUzunluguDk })) continue;

    plan.push({
      // Zamanlama daima cikistan sayilir; giris yonunde pencereden turetilir.
      kalanDk: girisYonu ? (pencereUzunluguDk as number) - o : o,
      olcuDk: o,
      seviye: kademeSeviyeNo(kazanan.kademe),
      kanallar: kazanan.kanallar,
      bildirimSesi: kazanan.bildirimSesi,
      sesAdi: kazanan.sesAdi,
      acilKanal: kazanan.acilKanal,
      anonsMetni: kazanan.anonsMetni,
      sesliAnons: sesliAnonsGerekliMi(kazanan.kanallar),
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
 * Hucrenin (ses, aciliyet, titresim) secimi -> bildirim kanal id'si.
 *
 * Kanal id SES ILE TITRESIMIN FONKSIYONUDUR (bkz. `sesKimligi.ts`): Android'de
 * kanal sesi de titresimi de olusturulduktan sonra degistirilemez, silip yeniden
 * olusturmak da tombstone'a takilir. Id'yi bu iki girdiye baglayinca tuzaklarin
 * hepsi dogar dogmaz olur.
 *
 * TUM TUKETICILER BU FONKSIYONDAN GECMELI — kanal id artik DINAMIK oldugu icin
 * elle yazilan bir id (ozellikle ham AsyncStorage okuyan arka plan yollarinda)
 * bayat kalir ve kullanici SESSIZCE yanlis sesi/titresimi alir.
 */
export function muhafizKanaliSec(
  seviye: SeviyeNo,
  bildirimSesi: string,
  acilKanal?: boolean,
  titresimAcik: boolean = false
): string {
  return muhafizKanalIdOlustur(
    bildirimSesi,
    muhafizAcilKanalMi(seviye, bildirimSesi, acilKanal),
    titresimAcik
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
 * Eski semalar BURADA da goc ettirilir (`eskiAlarmSesiniGoc` + Faz 2'nin
 * `modlariKanallaraGoc`'u): bes tuketicinin ikisi (`ArkaplanGorevServisi`,
 * `KonumTakipServisi`) store'u degil HAM AsyncStorage'i okur, yani slice'in
 * yukleme gocunden gecmez. Goc gerekmiyorsa her ikisi de AYNI referansi dondurur
 * (kimlik korunur, gereksiz kopya yok).
 */
export function muhafizMatrisiniCoz(kaynak: MatrisKaynagi): MuhafizMatrisi {
  return matrisGecerliMi(kaynak.matris)
    ? modlariKanallaraGoc(eskiAlarmSesiniGoc(kaynak.matris))
    : eskidenMatriseGoc(kaynak);
}
