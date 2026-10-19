/**
 * Kıble açı yardımcıları — SAF (React/expo import ETMEZ).
 *
 * Pusula açıları 359° ↔ 0° sınırında sarar. Bu dosyadaki her kural o sarmaya dayanıklıdır:
 * fark daima en kısa yoldan (−180, 180] aralığında alınır, süzgeç açının kendisini değil
 * sin/cos bileşenlerini yumuşatır (ham açıyı ortalamak 350° ile 10°'yi 180° yapardı).
 * Wear `cekirdek/KibleKarari.kt` ile aynı dil ve aynı eşikler.
 */

/** Açıyı [0, 360) aralığına indirger. Sonlu olmayan değer 0 olur. */
export function aciNormalize(aci: number): number {
  if (!Number.isFinite(aci)) return 0;
  const m = aci % 360;
  return m < 0 ? m + 360 : m === 0 ? 0 : m;
}

/**
 * `hedef − kaynak` farkını en kısa yoldan verir: (−180, 180].
 * Pozitif = hedef SAĞDA (saat yönünde dönülmeli), negatif = solda.
 */
export function aciFarki(hedef: number, kaynak: number): number {
  let f = aciNormalize(hedef) - aciNormalize(kaynak);
  if (f > 180) f -= 360;
  if (f <= -180) f += 360;
  return f;
}

/** Hizaya GİRİŞ eşiği (derece) — telefon ve saat ortak. */
export const HIZA_GIRIS_ESIGI = 10;
/** Hizadan ÇIKIŞ eşiği (derece). Girişten büyük: sınırda titreyen "hizalandı" olmasın. */
export const HIZA_CIKIS_ESIGI = 15;

/** Histerezisli hizalanma kararı. `fark` = kıble − yön (işaretli ya da mutlak). */
export function hizalandiMi(oncekiHizali: boolean, fark: number): boolean {
  const mutlak = Math.abs(fark);
  if (!Number.isFinite(mutlak)) return false;
  return oncekiHizali ? mutlak <= HIZA_CIKIS_ESIGI : mutlak < HIZA_GIRIS_ESIGI;
}

/**
 * Açısal düşük geçiren süzgeç (sin/cos uzayında, zaman sabitli).
 *
 * Örnekleme aralığı cihazdan cihaza değişir (Android'de kare zamanlayıcısına bağlı,
 * iOS'ta sabit); sabit bir katsayı hızlı cihazda süzgeci gevşetir, yavaşta sıkılaştırırdı.
 * Bu yüzden katsayı ölçülen `dt`'den türer: `a = 1 − e^(−dt/τ)`.
 *
 * `surekli` ekrandaki dönüş için SARMASIZ değerdir: 359 → 1 geçişi 2° ilerler, 358° geri
 * dönmez (dönen kadranın bir anda tam tur atmaması bunun sayesindedir).
 */
export class AcisalSuzgec {
  private s = 0;
  private c = 0;
  private hazir = false;
  private sonMs = 0;
  private sonAci = 0;
  private toplam = 0;

  constructor(private readonly tauMs: number) {}

  /** Yeni okuma; süzülmüş açıyı [0,360) döndürür. */
  ekle(aci: number, simdiMs: number): number {
    if (!Number.isFinite(aci)) return this.deger;
    const r = (aci * Math.PI) / 180;
    if (!this.hazir) {
      this.s = Math.sin(r);
      this.c = Math.cos(r);
      this.hazir = true;
      this.sonMs = simdiMs;
      this.sonAci = aciNormalize(aci);
      this.toplam = this.sonAci;
      return this.sonAci;
    }
    const dt = Math.max(0, Math.min(500, simdiMs - this.sonMs));
    this.sonMs = simdiMs;
    const a = this.tauMs <= 0 ? 1 : 1 - Math.exp(-dt / this.tauMs);
    this.s += a * (Math.sin(r) - this.s);
    this.c += a * (Math.cos(r) - this.c);
    const yeni = this.deger;
    this.toplam += aciFarki(yeni, this.sonAci);
    this.sonAci = yeni;
    return yeni;
  }

  get hazirMi(): boolean {
    return this.hazir;
  }

  /** Süzülmüş açı [0,360). */
  get deger(): number {
    if (!this.hazir) return 0;
    return aciNormalize((Math.atan2(this.s, this.c) * 180) / Math.PI);
  }

  /** Sarmasız birikimli açı (dönüş animasyonu için). */
  get surekli(): number {
    return this.toplam;
  }

  sifirla(): void {
    this.hazir = false;
    this.s = 0;
    this.c = 0;
    this.toplam = 0;
  }
}

/** Kâbe (Mescid-i Haram) koordinatı. */
export const KABE = { lat: 21.4225, lng: 39.8262 } as const;

/** Büyük daire mesafesi (km), haversine. */
export function kabeyeMesafeKm(lat: number, lng: number): number | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const R = 6371.0088;
  const rad = Math.PI / 180;
  const dLat = (KABE.lat - lat) * rad;
  const dLng = (KABE.lng - lng) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(KABE.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** "2.184 km" — Türkçe binlik ayıracıyla, sabit tablo (Intl'e bağımlı değil). */
export function mesafeMetni(km: number | null): string | null {
  if (km === null || !Number.isFinite(km) || km < 0) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  const yuvarlak = Math.round(km);
  return `${String(yuvarlak).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} km`;
}

/**
 * Ekran okuyucuya ve ekrana yazılan yön cümlesi. `fark` = kıble − yön.
 * Kibar "siz" dili (arayüz metni; ibadete çağrı değil).
 */
export function yonCumlesi(fark: number, hizali: boolean): string {
  if (hizali) return 'Kıble yönündesiniz';
  const derece = Math.round(Math.abs(fark));
  if (derece >= 170) return 'Kıble arkanızda, geri dönün';
  return fark > 0 ? `Kıble ${derece}° sağınızda` : `Kıble ${derece}° solunuzda`;
}
