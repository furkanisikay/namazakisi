/**
 * Cihaz yönelimi: yerçekimi + manyetik alan vektörlerinden dünya tabanı — SAF.
 *
 * NEDEN EULER AÇILARI DEĞİL: expo-sensors `DeviceMotion.rotation` iki platformda farklı
 * Euler sözleşmesi taşır (Android `getOrientation` −azimut/−pitch/roll, iOS CoreMotion
 * yaw/pitch/roll) ve telefon DİK tutulduğunda (tam da kamera görünümünün duruşu) Android
 * azimutu tekilleşir. Yerçekimi ve manyetik alan ise iki platformda da AYNI cihaz
 * eksenlerinde (x sağ, y üst kenar, z ekrandan dışarı) fiziksel vektörlerdir; tabanı onlardan
 * kurmak sözleşme farkını ve tekilliği birlikte ortadan kaldırır (Android
 * `SensorManager.getRotationMatrix` ile aynı yöntem).
 *
 * İşaret sözleşmesi (expo-sensors 57 kaynağından okundu):
 *  - `DeviceMotion.accelerationIncludingGravity` iki platformda da AŞAĞIYI gösterir
 *    (düz, ekran yukarı: z ≈ −9,8). Android `ivme − 2·yerçekimi`, iOS `(kullanıcı + gravity)·g`.
 *  - `Magnetometer` cihaz ekseninde alan vektörü (μT); kuzey yarımkürede kuzeye ve aşağıya.
 * Cihazda DOĞRULANMADI — yanlış çıkarsa düzeltilecek tek yer burası; ayrıca çalışma anında
 * `EksenDenetimi` (aşağıda) telefon düzken konum servisinin manyetik yönüyle karşılaştırır.
 */

export type Vektor3 = { x: number; y: number; z: number };

export function v3(x: number, y: number, z: number): Vektor3 {
  return { x, y, z };
}

export function capraz(a: Vektor3, b: Vektor3): Vektor3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

export function nokta(a: Vektor3, b: Vektor3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function uzunluk(a: Vektor3): number {
  return Math.sqrt(nokta(a, a));
}

export function birim(a: Vektor3): Vektor3 | null {
  const u = uzunluk(a);
  if (!Number.isFinite(u) || u < 1e-6) return null;
  return { x: a.x / u, y: a.y / u, z: a.z / u };
}

export function sonluMu(a: Vektor3 | null | undefined): a is Vektor3 {
  return !!a && Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z);
}

/** Dünya tabanının cihaz eksenlerindeki ifadesi (manyetik doğu/kuzey, yukarı). */
export interface DunyaTabani {
  dogu: Vektor3;
  kuzey: Vektor3;
  yukari: Vektor3;
}

/**
 * Yerçekimi (aşağı) + manyetik alandan taban. Telefon manyetik alana paralel tutulursa
 * (ya da vektör yoksa) doğu belirsizdir → `null`.
 */
export function dunyaTabaniKur(asagi: Vektor3, manyetik: Vektor3): DunyaTabani | null {
  if (!sonluMu(asagi) || !sonluMu(manyetik)) return null;
  const yukari = birim({ x: -asagi.x, y: -asagi.y, z: -asagi.z });
  if (!yukari) return null;
  const doguHam = capraz(manyetik, yukari);
  // Alan neredeyse dikeyse (|doğu| ≪ |alan|) yatay bileşen gürültüdür.
  if (uzunluk(doguHam) < 0.05 * Math.max(uzunluk(manyetik), 1e-6)) return null;
  const dogu = birim(doguHam);
  if (!dogu) return null;
  const kuzey = capraz(yukari, dogu);
  return { dogu, kuzey, yukari };
}

/**
 * Telefonun "baktığı" yön vektörü (cihaz ekseninde): `y − z`.
 * Düzken yatay izdüşümü üst kenardır (klasik pusula), dikken arka kameradır (kamera
 * görünümü); aradaki her eğimde ikisi AYNI azimutu gösterir (telefon yalnız x ekseni
 * etrafında eğildiğinde). Böylece düz ↔ dik geçişte yön sıçramaz, tek kural iki moda da yeter.
 */
export const BAKIS_VEKTORU: Vektor3 = { x: 0, y: 1, z: -1 };

/** Taban altında bir cihaz vektörünün manyetik azimutu [0,360). Yatay izdüşüm yoksa null. */
export function azimut(taban: DunyaTabani, v: Vektor3): number | null {
  const e = nokta(v, taban.dogu);
  const n = nokta(v, taban.kuzey);
  if (Math.hypot(e, n) < 1e-6) return null;
  const a = (Math.atan2(e, n) * 180) / Math.PI;
  return a < 0 ? a + 360 : a;
}

/**
 * Eğim: ekranın yukarıya göre açısı. 0 = düz (ekran göğe), 90 = dik, 180 = ekran yere.
 * Yalnız yerçekiminden; manyetik alan gerekmez.
 */
export function egimDerece(asagi: Vektor3): number | null {
  const yukari = birim({ x: -asagi.x, y: -asagi.y, z: -asagi.z });
  if (!yukari) return null;
  return (Math.acos(Math.max(-1, Math.min(1, yukari.z))) * 180) / Math.PI;
}

/**
 * Düz ↔ dik geçiş oranı (0 = klasik pusula, 1 = 3B / kamera duruşu). Doğrusal değil,
 * yumuşak basamak: 25°'ye kadar tamamen düz, 65°'den sonra tamamen dik.
 */
export function dikOrani(egim: number | null): number {
  if (egim === null || !Number.isFinite(egim)) return 0;
  // Dikeyi geçip göğe bakan telefon (egim > 90) da "dik" sayılır: açı 90 etrafında katlanır.
  const katli = egim > 90 ? 180 - egim : egim;
  const t = Math.max(0, Math.min(1, (katli - 25) / 40));
  return t * t * (3 - 2 * t);
}

/** Vektör düşük geçiren süzgeç (bileşen bileşen, zaman sabitli). */
export class VektorSuzgeci {
  private v: Vektor3 | null = null;
  private sonMs = 0;
  constructor(private readonly tauMs: number) {}

  ekle(yeni: Vektor3, simdiMs: number): Vektor3 | null {
    if (!sonluMu(yeni)) return this.v;
    if (!this.v) {
      this.v = { ...yeni };
      this.sonMs = simdiMs;
      return this.v;
    }
    const dt = Math.max(0, Math.min(500, simdiMs - this.sonMs));
    this.sonMs = simdiMs;
    const a = 1 - Math.exp(-dt / this.tauMs);
    this.v = {
      x: this.v.x + a * (yeni.x - this.v.x),
      y: this.v.y + a * (yeni.y - this.v.y),
      z: this.v.z + a * (yeni.z - this.v.z),
    };
    return this.v;
  }

  get deger(): Vektor3 | null {
    return this.v;
  }

  sifirla(): void {
    this.v = null;
  }
}

/**
 * Çalışma anı eksen denetimi: telefon DÜZKEN bizim vektör azimutumuz ile konum servisinin
 * (expo-location, platformun kendi pusulası) manyetik yönü aynı olmalı. Sürekli büyük fark,
 * bu cihazda eksen/işaret sözleşmesinin tuttuğu varsayımın bozulduğunu gösterir → yön
 * konum servisine düşer ve kamera görünümü kapanır (sessizce yanlış yön göstermektense).
 */
export class EksenDenetimi {
  private ortalama = 0;
  private sayi = 0;
  static readonly GEREKEN_ORNEK = 40;
  static readonly ESIK_DERECE = 30;

  ekle(farkMutlak: number): void {
    if (!Number.isFinite(farkMutlak)) return;
    this.sayi += 1;
    const a = this.sayi < 10 ? 1 / this.sayi : 0.1;
    this.ortalama += a * (Math.abs(farkMutlak) - this.ortalama);
  }

  /** `true` = yeterli kanıt var ve fark sürekli büyük. */
  get bozuk(): boolean {
    return this.sayi >= EksenDenetimi.GEREKEN_ORNEK && this.ortalama > EksenDenetimi.ESIK_DERECE;
  }

  /** `true` = yeterli kanıt var ve fark küçük (kamera görünümü güvenle açılabilir). */
  get dogrulandi(): boolean {
    return this.sayi >= EksenDenetimi.GEREKEN_ORNEK && this.ortalama <= EksenDenetimi.ESIK_DERECE;
  }
}
