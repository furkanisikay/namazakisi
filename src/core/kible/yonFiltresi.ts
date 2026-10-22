/**
 * Kıble yön süzgeci — SAF (React/expo import ETMEZ).
 *
 * SORUN (sahip geri bildirimi): Kâbe'nin yeri pusulada ve özellikle kamera görünümünde
 * sensör gürültüsüyle sürekli titriyordu. Kök nedenler:
 *  1. Yön, ham manyetometre + `accelerationIncludingGravity`'den kuruluyordu. İkincisi
 *     elin DOĞRUSAL ivmesini de taşır: el titredikçe "aşağı" vektörü sallanır, eğim
 *     düzeltmesi bunu yöne çevirir (dikken 0,3 m/s² titreşim ≈ 2° yön oynaması).
 *  2. Kamera işareti süzülmüş yönden DEĞİL, her karede yeniden kurulan ham tabandan
 *     çiziliyordu; pusuladaki 110 ms'lik açısal süzgeç kameraya hiç uğramıyordu.
 *  3. Sabit zaman sabitli tek süzgeç ya titrer (kısa τ) ya geç döner (uzun τ).
 *
 * ÇÖZÜM (her katman ölçüldü, bkz. `__tests__/yonFiltresi.test.ts`):
 *  - "Aşağı" = işletim sisteminin FÜZYONLU yerçekimi (`accelerationIncludingGravity −
 *    acceleration`; Android TYPE_GRAVITY jiroskop destekli, iOS CMDeviceMotion.gravity).
 *    Seçim çağıranda (`asagiVektoru`); füzyon yoksa eski ham vektöre düşer.
 *  - Jiroskop DOĞRULANINCA tamamlayıcı süzgeç: yön jiroskopla ilerletilir (gecikmesiz,
 *    gürültüsüz), manyetik yön onu τ≈0,7 sn'de yavaşça düzeltir (kaymayı siler).
 *    Jiroskop eksen eşlemesi platformdan platforma farklıdır ve cihazda DOĞRULANMADI →
 *    `JiroskopDenetimi` dönüşlerde jiroskop hızını manyetik yön hızıyla karşılaştırır;
 *    tutmazsa jiroskop hiç kullanılmaz (sessizce yanlış yön göstermektense).
 *  - Ardından One Euro süzgeci (Casiez vd., CHI 2012): yavaşken güçlü süzme (kesim
 *    `minKesimHz`), hızlı dönüşte kesim hızla büyür (`beta`) → titreme yok, gecikme düşük.
 *    Açı sarmasına karşı süzme sin/cos uzayında yapılır.
 *  - Ekrandaki değere ±`oluBolgeDerece` ölü bölge: algılanamayan alt-derece kıpırtılar
 *    çizimi hiç değiştirmez.
 *  - Kamera tabanı DA süzülmüş yönden yeniden kurulur (`tabanKur`): pusula ve kamera
 *    AYNI süzgeçten beslenir.
 *
 * NEDEN EKF DEĞİL: girdiler zaten işletim sisteminin füzyonundan geçmiş (yerçekimi
 * jiroskop destekli; iOS'ta CMDeviceMotion, Android'de TYPE_GRAVITY), bizim tahmin
 * ettiğimiz durum tek bir açı. Tam EKF/UKF'nin kovaryans makinesi burada gözlenebilir
 * bir kazanç getirmez, ama cihaza göre ayarlanması gereken gürültü parametreleri ve
 * doğrulanamayan bir eksen modeli ekler. Tamamlayıcı süzgeç + One Euro aynı gürültü
 * bastırmayı sabit, test edilebilir birkaç katsayıyla ve ihmal edilebilir CPU'yla verir.
 * İşletim sisteminin kendi yönelimi (Android rotation vector) expo'da yalnız Euler
 * açısı olarak gelir ve telefon dikken (kamera duruşu) tekilleşir → kullanılamaz.
 */
import { aciFarki, aciNormalize } from './acilar';
import {
  BAKIS_VEKTORU,
  DunyaTabani,
  Vektor3,
  VektorSuzgeci,
  azimut,
  birim,
  capraz,
  dunyaTabaniKur,
  egimDerece,
  nokta,
  sonluMu,
  uzunluk,
} from './cihazYonelimi';

const DERECE = 180 / Math.PI;

/** Ayar sabitleri — testler bu değerlerle ölçer; değiştirirsen ölçümü yeniden koş. */
export const YON_FILTRESI = {
  /** One Euro: duruşta kesim frekansı (Hz). Düşük = daha sakin, daha geç. */
  minKesimHz: 0.45,
  /** One Euro: hız katsayısı (Hz / (°/sn)). 90°/sn dönüşte kesim ≈ 0,45 + 4,5 Hz. */
  beta: 0.05,
  /** One Euro: hız tahmininin kesim frekansı (Hz). */
  hizKesimHz: 1.2,
  /** Tamamlayıcı süzgeçte manyetik düzeltmenin zaman sabiti (ms). */
  tamamlayiciTauMs: 700,
  /** Ekrandaki yönün ölü bölgesi (derece). */
  oluBolgeDerece: 0.25,
  /** Yerçekimi / manyetik ön süzgeci (ms). */
  vektorTauMs: 60,
} as const;

// ---------------------------------------------------------------------------
// One Euro (açısal)
// ---------------------------------------------------------------------------

function alfa(kesimHz: number, dtSn: number): number {
  const tau = 1 / (2 * Math.PI * kesimHz);
  return 1 / (1 + tau / dtSn);
}

/**
 * Açısal One Euro süzgeci. Değer sin/cos uzayında süzülür (350° ile 10°'nin ortası 0°'dir,
 * 180° değil). Hız dışarıdan (jiroskop) verilebilir; verilmezse sonlu farktan kestirilir.
 */
export class OneEuroAcisal {
  private s = 0;
  private c = 0;
  private hazir = false;
  private sonMs = 0;
  private hiz = 0; // °/sn, süzülmüş
  private oncekiHam = 0;

  constructor(
    private readonly minKesimHz: number = YON_FILTRESI.minKesimHz,
    private readonly beta: number = YON_FILTRESI.beta,
    private readonly hizKesimHz: number = YON_FILTRESI.hizKesimHz,
  ) {}

  /** Yeni okuma; süzülmüş açıyı [0,360) döndürür. `disHiz` (°/sn) varsa o kullanılır. */
  ekle(aci: number, simdiMs: number, disHiz?: number | null): number {
    if (!Number.isFinite(aci)) return this.deger;
    const r = aci / DERECE;
    if (!this.hazir) {
      this.s = Math.sin(r);
      this.c = Math.cos(r);
      this.hazir = true;
      this.sonMs = simdiMs;
      this.oncekiHam = aciNormalize(aci);
      return this.oncekiHam;
    }
    const dtMs = Math.max(1, Math.min(500, simdiMs - this.sonMs));
    this.sonMs = simdiMs;
    const dt = dtMs / 1000;
    // Hız, ÖNCEKİ HAM okumadan (Casiez'in C++ başvuru uygulaması `lastRawValue`): süzülmüş
    // değerden alınsaydı rampada 1/alfa kat şişerdi.
    const hamHiz = typeof disHiz === 'number' && Number.isFinite(disHiz) ? disHiz : aciFarki(aci, this.oncekiHam) / dt;
    this.oncekiHam = aciNormalize(aci);
    this.hiz += alfa(this.hizKesimHz, dt) * (hamHiz - this.hiz);
    const kesim = this.minKesimHz + this.beta * Math.abs(this.hiz);
    const a = alfa(kesim, dt);
    this.s += a * (Math.sin(r) - this.s);
    this.c += a * (Math.cos(r) - this.c);
    return this.deger;
  }

  get deger(): number {
    if (!this.hazir) return 0;
    return aciNormalize(Math.atan2(this.s, this.c) * DERECE);
  }

  /** Süzülmüş açısal hız (°/sn). */
  get acisalHiz(): number {
    return this.hiz;
  }

  sifirla(): void {
    this.hazir = false;
    this.hiz = 0;
  }
}

// ---------------------------------------------------------------------------
// Jiroskop eksen eşlemesi + denetim
// ---------------------------------------------------------------------------

export type Platform = 'android' | 'ios';

/**
 * expo-sensors `DeviceMotion.rotationRate` (°/sn) → cihaz eksenlerinde açısal hız (rad/sn).
 * Kanal eşlemesi platforma göre FARKLIDIR (expo-sensors 57 kaynağı okundu):
 *  - Android `DeviceMotionModule.kt`: alpha = values[0] (x), beta = values[1] (y), gamma = values[2] (z)
 *  - iOS `DeviceMotionModule.swift`: alpha = rotationRate.z, beta = .y, gamma = .x
 * İki platformda da cihaz eksenleri aynıdır (x sağ, y üst kenar, z ekrandan dışarı) ve
 * dönüş sağ el kuralıyla pozitiftir. Cihazda DOĞRULANMADI → `JiroskopDenetimi` emniyet ağıdır.
 */
export function donusHiziCihazEkseni(
  rr: { alpha?: number; beta?: number; gamma?: number } | null | undefined,
  platform: Platform,
): Vektor3 | null {
  if (!rr) return null;
  const { alpha, beta, gamma } = rr;
  if (![alpha, beta, gamma].every((v) => typeof v === 'number' && Number.isFinite(v))) return null;
  const v =
    platform === 'android'
      ? { x: alpha as number, y: beta as number, z: gamma as number }
      : { x: gamma as number, y: beta as number, z: alpha as number };
  return { x: v.x / DERECE, y: v.y / DERECE, z: v.z / DERECE };
}

/**
 * Pusula yönünün (saat yönü pozitif, °/sn) jiroskoptan değişim hızı: dikey eksen etrafındaki
 * dönüşün tersi (sağ el kuralında yukarı ekseni etrafında saat yönünün tersi pozitiftir).
 */
export function yonHizi(donus: Vektor3, yukari: Vektor3): number {
  return -nokta(donus, yukari) * DERECE;
}

/**
 * Jiroskop doğrulaması: belirgin dönüşlerde (|manyetik hız| ≥ `ESIK`) jiroskop yön hızı ile
 * manyetik yön hızının uyuşması aranır. Yeterli kanıtla korelasyon yüksek ve ölçek ~1 ise
 * `dogrulandi`; ters işaret / ölçek tutmuyorsa `bozuk`. Henüz kanıt yoksa ikisi de false →
 * jiroskop KULLANILMAZ (güvenli varsayılan).
 */
export class JiroskopDenetimi {
  static readonly ESIK_DERECE_SN = 25;
  static readonly GEREKEN_ORNEK = 20;
  private sgm = 0;
  private sgg = 0;
  private smm = 0;
  private sayi = 0;

  ekle(jiroHiz: number, manyetikHiz: number): void {
    if (!Number.isFinite(jiroHiz) || !Number.isFinite(manyetikHiz)) return;
    if (Math.abs(manyetikHiz) < JiroskopDenetimi.ESIK_DERECE_SN) return;
    this.sgm += jiroHiz * manyetikHiz;
    this.sgg += jiroHiz * jiroHiz;
    this.smm += manyetikHiz * manyetikHiz;
    this.sayi += 1;
  }

  private get korelasyon(): number {
    if (this.sgg <= 0 || this.smm <= 0) return 0;
    return this.sgm / Math.sqrt(this.sgg * this.smm);
  }

  private get olcek(): number {
    return this.smm > 0 ? this.sgm / this.smm : 0;
  }

  get dogrulandi(): boolean {
    return (
      this.sayi >= JiroskopDenetimi.GEREKEN_ORNEK &&
      this.korelasyon >= 0.8 &&
      this.olcek > 0.6 &&
      this.olcek < 1.6
    );
  }

  get bozuk(): boolean {
    return this.sayi >= JiroskopDenetimi.GEREKEN_ORNEK && !this.dogrulandi;
  }
}

// ---------------------------------------------------------------------------
// Manyetik bozulma / tutarsızlık teşhisi (kalibrasyon rehberini besler)
// ---------------------------------------------------------------------------

/** Yeryüzü manyetik alanı her yerde ~25–65 µT; dışı metal/mıknatıs bozulmasıdır. */
export const ALAN_ALT_UT = 22;
export const ALAN_UST_UT = 70;
/** Bozulmanın "kararlı" sayılması için gereken süre (ms) — anlık geçişler uyarı açmasın. */
export const BOZULMA_KARARLI_MS = 1200;
/** Duruşta ham yönün süzülmüş yönden tipik sapması (derece) bu eşiği aşarsa tutarsız. */
export const TUTARSIZLIK_GIRIS_DERECE = 8;
export const TUTARSIZLIK_CIKIS_DERECE = 4;

export interface YonTeshisi {
  /** Ham manyetik alan büyüklüğü (µT), yoksa null. */
  alanUt: number | null;
  /** Alan büyüklüğü beklenen aralığın dışında (metal/mıknatıs yakın). */
  alanBozuk: boolean;
  /** Telefon dururken yön tutarsız sıçrıyor. */
  tutarsiz: boolean;
  /** Duruşta anlık yönün süzülmüş yönden sapmasının etkin değeri (derece). */
  sapmaRms: number;
  /** Jiroskop: kullanılıyor / reddedildi / henüz bilinmiyor. */
  jiroskop: 'kullaniliyor' | 'reddedildi' | 'bekliyor' | 'yok';
}

/** Jiroskop denetiminde iki hızın ortak alçak geçiren kesimi (Hz). */
const DENETIM_KESIM_HZ = 2;

// ---------------------------------------------------------------------------
// Ana süzgeç
// ---------------------------------------------------------------------------

export interface YonGirdisi {
  /** Aşağı yönlü yerçekimi (cihaz ekseni, m/s²) — mümkünse füzyonlu. */
  asagi: Vektor3 | null;
  /** Manyetik alan (cihaz ekseni, µT); bu karede yeni okuma yoksa null. */
  manyetik?: Vektor3 | null;
  /** Açısal hız (cihaz ekseni, rad/sn) — `donusHiziCihazEkseni`. */
  donus?: Vektor3 | null;
  ms: number;
}

export interface YonCiktisi {
  /** Süzülmüş MANYETİK yön [0,360) — telefonun baktığı yön. */
  manyetikYon: number;
  /** Sarmasız birikimli manyetik yön (dönüş animasyonu tur atmasın). */
  surekli: number;
  /** Süzülmüş yönden yeniden kurulan dünya tabanı (kamera izdüşümü). */
  taban: DunyaTabani;
  egim: number | null;
}

/**
 * Süzülmüş `yukari` ve bakış vektörünün süzülmüş azimutundan dünya tabanı.
 * h = bakışın yatay izdüşümü (azimutu ψ), w = yukarı × h:
 *   kuzey = cosψ·h + sinψ·w,  doğu = sinψ·h − cosψ·w   (kuzey = yukarı × doğu sağlanır).
 * Bakış dikeye çok yakınsa (izdüşüm yok) null.
 */
export function tabanKur(yukari: Vektor3, bakis: Vektor3, psiDerece: number): DunyaTabani | null {
  const u = birim(yukari);
  if (!u) return null;
  const yatay = { x: bakis.x - nokta(bakis, u) * u.x, y: bakis.y - nokta(bakis, u) * u.y, z: bakis.z - nokta(bakis, u) * u.z };
  if (uzunluk(yatay) < 0.1 * uzunluk(bakis)) return null;
  const h = birim(yatay);
  if (!h) return null;
  const w = capraz(u, h);
  const r = psiDerece / DERECE;
  const s = Math.sin(r);
  const c = Math.cos(r);
  return {
    kuzey: { x: c * h.x + s * w.x, y: c * h.y + s * w.y, z: c * h.z + s * w.z },
    dogu: { x: s * h.x - c * w.x, y: s * h.y - c * w.y, z: s * h.z - c * w.z },
    yukari: u,
  };
}

/**
 * Pusula + kamera için TEK yön süzgeci. Her hareket karesinde `ekle` çağrılır; manyetik
 * okuma olaydan olaya gelir (`manyetik` verilmediği karelerde son değer kullanılır).
 */
export class YonFiltresi {
  private readonly asagiSuzgeci = new VektorSuzgeci(YON_FILTRESI.vektorTauMs);
  private readonly manyetikSuzgeci = new VektorSuzgeci(YON_FILTRESI.vektorTauMs);
  private readonly oneEuro = new OneEuroAcisal();
  // Jiroskop denetimi: iki hız AYNI alçak geçirenden geçer (gecikmeleri eşit olsun).
  private oncekiHamYon: number | null = null;
  private manyetikHiz = 0;
  private jiroHizSuzulmus = 0;
  private readonly jiroDenetim = new JiroskopDenetimi();
  private readonly jiroskopVar: boolean;
  private tamamlayici: number | null = null;
  private gosterilen: number | null = null;
  private toplam = 0;
  private sonMs = 0;
  private alanUt: number | null = null;
  private alanDisindaMs: number | null = null;
  private alanIcindeMs: number | null = null;
  private alanBozuk = false;
  private sapmaKare = 0;
  private tutarsiz = false;
  private jiroGoruldu = false;

  constructor(secenek: { jiroskop?: boolean } = {}) {
    this.jiroskopVar = secenek.jiroskop !== false;
  }

  /** Jiroskop doğrulandıysa ve kullanımı açıksa true. */
  get jiroskopKullaniliyor(): boolean {
    return this.jiroskopVar && this.jiroDenetim.dogrulandi;
  }

  ekle(g: YonGirdisi): YonCiktisi | null {
    const t = g.ms;
    if (g.manyetik && sonluMu(g.manyetik)) {
      this.manyetikSuzgeci.ekle(g.manyetik, t);
      this.alanTakibi(uzunluk(g.manyetik), t);
    }
    if (g.asagi && sonluMu(g.asagi)) this.asagiSuzgeci.ekle(g.asagi, t);
    const asagi = this.asagiSuzgeci.deger;
    const manyetik = this.manyetikSuzgeci.deger;
    if (!asagi || !manyetik) return null;
    const hamTaban = dunyaTabaniKur(asagi, manyetik);
    if (!hamTaban) return null;
    const hamYon = azimut(hamTaban, BAKIS_VEKTORU);
    if (hamYon === null) return null;

    const dtMs = this.tamamlayici === null ? 0 : Math.max(0, Math.min(500, t - this.sonMs));
    this.sonMs = t;
    const dt = dtMs / 1000;

    // Jiroskop yön hızı (°/sn) — yalnız doğrulamaya + doğrulandıysa tahmine girer.
    const jiroHiz = g.donus && sonluMu(g.donus) ? yonHizi(g.donus, hamTaban.yukari) : null;
    if (jiroHiz !== null) this.jiroGoruldu = true;
    if (this.oncekiHamYon !== null && dt > 0) {
      const a = alfa(DENETIM_KESIM_HZ, dt);
      this.manyetikHiz += a * (aciFarki(hamYon, this.oncekiHamYon) / dt - this.manyetikHiz);
      if (jiroHiz !== null) {
        this.jiroHizSuzulmus += a * (jiroHiz - this.jiroHizSuzulmus);
        this.jiroDenetim.ekle(this.jiroHizSuzulmus, this.manyetikHiz);
      }
    }
    this.oncekiHamYon = hamYon;

    // 1) Tamamlayıcı: jiroskopla ilerlet, manyetikle yavaşça düzelt.
    const jiroKullan = jiroHiz !== null && this.jiroskopKullaniliyor;
    if (this.tamamlayici === null || !jiroKullan) {
      this.tamamlayici = hamYon;
    } else {
      const tahmin = this.tamamlayici + jiroHiz * dt;
      const k = 1 - Math.exp(-dtMs / YON_FILTRESI.tamamlayiciTauMs);
      this.tamamlayici = aciNormalize(tahmin + k * aciFarki(hamYon, tahmin));
    }

    // 2) One Euro (jiroskop varsa hız ondan — gürültüsüz hız, doğru kesim).
    const suzulmus = this.oneEuro.ekle(this.tamamlayici, t, jiroKullan ? jiroHiz : null);

    // 3) Ölü bölge.
    if (this.gosterilen === null) {
      this.gosterilen = suzulmus;
      this.toplam = suzulmus;
    } else {
      const fark = aciFarki(suzulmus, this.gosterilen);
      if (Math.abs(fark) >= YON_FILTRESI.oluBolgeDerece) {
        this.toplam += fark;
        this.gosterilen = suzulmus;
      }
    }

    // Tutarsızlık: duruşta ANLIK (ön süzgeçsiz) manyetik okumanın yönünün süzülmüş yönden
    // sapmasının etkin değeri (τ ≈ 1 sn). Ön süzgeçli yön gürültüyü saklardı.
    const anlikTaban = g.manyetik && sonluMu(g.manyetik) ? dunyaTabaniKur(asagi, g.manyetik) : null;
    const anlikYon = anlikTaban ? azimut(anlikTaban, BAKIS_VEKTORU) : null;
    const yavas = Math.abs(this.oneEuro.acisalHiz) < 20;
    if (yavas && dtMs > 0 && anlikYon !== null) {
      const sapma = aciFarki(anlikYon, suzulmus);
      const k = 1 - Math.exp(-dtMs / 1000);
      this.sapmaKare += k * (sapma * sapma - this.sapmaKare);
      const rms = Math.sqrt(this.sapmaKare);
      if (!this.tutarsiz && rms > TUTARSIZLIK_GIRIS_DERECE) this.tutarsiz = true;
      else if (this.tutarsiz && rms < TUTARSIZLIK_CIKIS_DERECE) this.tutarsiz = false;
    }

    const taban = tabanKur(hamTaban.yukari, BAKIS_VEKTORU, this.gosterilen) ?? hamTaban;
    return { manyetikYon: this.gosterilen, surekli: this.toplam, taban, egim: egimDerece(asagi) };
  }

  private alanTakibi(buyukluk: number, t: number): void {
    if (!Number.isFinite(buyukluk)) return;
    this.alanUt = buyukluk;
    const disarida = buyukluk < ALAN_ALT_UT || buyukluk > ALAN_UST_UT;
    if (disarida) {
      this.alanIcindeMs = null;
      if (this.alanDisindaMs === null) this.alanDisindaMs = t;
      if (t - this.alanDisindaMs >= BOZULMA_KARARLI_MS) this.alanBozuk = true;
    } else {
      this.alanDisindaMs = null;
      if (this.alanIcindeMs === null) this.alanIcindeMs = t;
      if (t - this.alanIcindeMs >= BOZULMA_KARARLI_MS) this.alanBozuk = false;
    }
  }

  get teshis(): YonTeshisi {
    return {
      alanUt: this.alanUt,
      alanBozuk: this.alanBozuk,
      tutarsiz: this.tutarsiz,
      sapmaRms: Math.sqrt(this.sapmaKare),
      jiroskop: !this.jiroskopVar || !this.jiroGoruldu
        ? 'yok'
        : this.jiroDenetim.dogrulandi
          ? 'kullaniliyor'
          : this.jiroDenetim.bozuk
            ? 'reddedildi'
            : 'bekliyor',
    };
  }
}

/**
 * "Aşağı" vektörü: füzyonlu yerçekimi (`accelerationIncludingGravity − acceleration`) varsa o,
 * yoksa ham `accelerationIncludingGravity`. İki platformda da sonuç aşağıyı gösterir:
 * Android `(ham − 2·g) − (ham − g) = −g` (TYPE_GRAVITY, düzken +z) ; iOS
 * `(kullanıcı + gravity)·G − kullanıcı·G = gravity·G` (düzken −z).
 */
export function asagiVektoru(
  dahil: Vektor3 | null | undefined,
  dogrusal: Vektor3 | null | undefined,
): Vektor3 | null {
  if (!sonluMu(dahil)) return null;
  if (!sonluMu(dogrusal)) return { x: dahil.x, y: dahil.y, z: dahil.z };
  const g = { x: dahil.x - dogrusal.x, y: dahil.y - dogrusal.y, z: dahil.z - dogrusal.z };
  // Bozuk/eksik füzyon (≈0 vektör) → ham vektöre düş.
  return uzunluk(g) > 3 ? g : { x: dahil.x, y: dahil.y, z: dahil.z };
}

/**
 * Yön kalitesi 0..1 (kalibrasyon rehberindeki canlı gösterge). En zayıf halka belirler:
 *  - alan büyüklüğü: 25–65 µT tam; 0 µT ya da 130 µT'de sıfır,
 *  - duruş tutarlılığı: sapma etkin değeri ≤ 2° tam, ≥ 10° sıfır,
 *  - işletim sisteminin pusula doğruluğu (0–3; bilinmiyorsa hesaba katılmaz).
 */
export function yonKalitesi(t: Pick<YonTeshisi, 'alanUt' | 'sapmaRms'>, dogruluk: number | null): number {
  const sinirla = (v: number) => Math.max(0, Math.min(1, v));
  let alan = 1;
  if (t.alanUt !== null && Number.isFinite(t.alanUt)) {
    if (t.alanUt < 25) alan = sinirla(t.alanUt / 25);
    else if (t.alanUt > 65) alan = sinirla((130 - t.alanUt) / 65);
  }
  const tutarlilik = sinirla((10 - t.sapmaRms) / 8);
  const os =
    dogruluk === null || !Number.isFinite(dogruluk)
      ? 1
      : dogruluk >= 3
        ? 1
        : dogruluk >= 2
          ? 0.75
          : dogruluk >= 1
            ? 0.35
            : 0.1;
  return Math.min(alan, tutarlilik, os);
}
