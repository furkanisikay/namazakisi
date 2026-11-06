/**
 * Dünya şehirleri (Türkiye hariç) — SAF çözücü ve arama.
 *
 * Veri `assets/konum/dunya.bin` (GeoNames, CC BY 4.0; üretici
 * `scripts/konum/dunya-sehirleri-uret.js`, biçim orada). JS paketine GÖMÜLMEZ: dosyayı
 * `data/local/dunyaSehirVerisi.ts` gerektiğinde okur, burası yalnız metni çözer.
 * Türkiye il/ilçe seçicisi (OSM, ODbL) bu verinin dışındadır.
 *
 * Arama Türkçe harf ve aksan duyarsızdır; `toLowerCase` KULLANILMAZ (AGENTS.md) —
 * yalnız ASCII aralığı elle küçültülür.
 */

export interface DunyaSehri {
  ad: string;
  /** Aramada kullanılan ASCII biçim (ad zaten ASCII ise adın kendisi). */
  ascii: string;
  lat: number;
  lng: number;
  /** ISO 3166-1 alfa-2 */
  ulke: string;
  /** Yönetim bölgesi adı (ASCII; bilinmiyorsa boş). */
  bolge: string;
  /** IANA saat dilimi */
  saatDilimi: string;
  /** Nüfus (bin). */
  nufusBin: number;
}

export interface DunyaSehirVerisi {
  sehirler: readonly DunyaSehri[];
  /** Arama anahtarları, `sehirler` ile aynı sırada. */
  anahtarlar: readonly string[];
  ulkeler: readonly string[];
}

const HARF: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u', ß: 'ss', æ: 'ae', Æ: 'ae', ø: 'o', Ø: 'o',
  đ: 'd', Đ: 'd', ł: 'l', Ł: 'l', œ: 'oe', Œ: 'oe', þ: 'th',
};

/** Aksan/harf duyarsız arama anahtarı: yalnız [a-z0-9], boşluklar tek boşluk. */
export function aramaAnahtari(metin: string): string {
  let sonuc = '';
  let bosluk = false;
  for (const ham of metin.normalize('NFD')) {
    const kod = ham.charCodeAt(0);
    if (kod >= 0x300 && kod <= 0x36f) continue; // birleşik aksan işaretleri
    const eslenen = HARF[ham];
    let parca = '';
    if (eslenen !== undefined) parca = eslenen;
    else if (kod >= 65 && kod <= 90) parca = String.fromCharCode(kod + 32);
    else if ((kod >= 97 && kod <= 122) || (kod >= 48 && kod <= 57)) parca = ham;
    if (parca) {
      if (bosluk && sonuc) sonuc += ' ';
      sonuc += parca;
      bosluk = false;
    } else {
      bosluk = true;
    }
  }
  return sonuc;
}

/** `dunya.bin` metnini çözer. Bozuk satırları atlar, asla fırlatmaz. */
export function dunyaVerisiniCoz(metin: string): DunyaSehirVerisi {
  const sehirler: DunyaSehri[] = [];
  const anahtarlar: string[] = [];
  const ulkeler = new Set<string>();
  let saatDilimleri: string[] = [];
  const bolgeler = new Map<string, string>();
  for (const satir of metin.split('\n')) {
    if (!satir) continue;
    if (satir.startsWith('#S ')) {
      saatDilimleri = satir.slice(3).split('\t');
      continue;
    }
    if (satir.startsWith('#B ')) {
      const p = satir.slice(3).split('\t');
      for (let i = 0; i + 1 < p.length; i += 2) bolgeler.set(p[i], p[i + 1]);
      continue;
    }
    const a = satir.split('\t');
    if (a.length < 8) continue;
    const lat = Number(a[2]);
    const lng = Number(a[3]);
    const tz = saatDilimleri[Number(a[6])];
    if (!a[0] || !Number.isFinite(lat) || !Number.isFinite(lng) || !tz || !/^[A-Z]{2}$/.test(a[4])) continue;
    const ascii = a[1] || a[0];
    sehirler.push({
      ad: a[0],
      ascii,
      lat,
      lng,
      ulke: a[4],
      bolge: a[5] ? bolgeler.get(`${a[4]}.${a[5]}`) ?? '' : '',
      saatDilimi: tz,
      nufusBin: Number(a[7]) || 0,
    });
    anahtarlar.push(aramaAnahtari(ascii === a[0] ? a[0] : `${ascii} ${a[0]}`));
    ulkeler.add(a[4]);
  }
  return { sehirler, anahtarlar, ulkeler: [...ulkeler].sort() };
}

export interface AramaSecenegi {
  /** Yalnız bu ülke (ISO alfa-2). */
  ulke?: string;
  limit?: number;
}

/**
 * Şehir arar: önce adı sorguyla BAŞLAYANLAR, sonra içinde geçenler; her grup nüfusa göre.
 * Boş sorguda ülke verilmişse o ülkenin en kalabalık şehirleri döner.
 */
export function sehirAra(veri: DunyaSehirVerisi, sorgu: string, secenek: AramaSecenegi = {}): DunyaSehri[] {
  const limit = secenek.limit ?? 30;
  const anahtar = aramaAnahtari(sorgu);
  const basla: DunyaSehri[] = [];
  const icerir: DunyaSehri[] = [];
  for (let i = 0; i < veri.sehirler.length; i++) {
    const s = veri.sehirler[i];
    if (secenek.ulke && s.ulke !== secenek.ulke) continue;
    if (!anahtar) {
      basla.push(s);
      continue;
    }
    const k = veri.anahtarlar[i];
    if (k.startsWith(anahtar) || k.includes(` ${anahtar}`)) basla.push(s);
    else if (anahtar.length >= 3 && k.includes(anahtar)) icerir.push(s);
  }
  if (!anahtar && !secenek.ulke) return [];
  const nufusa = (a: DunyaSehri, b: DunyaSehri) => b.nufusBin - a.nufusBin;
  return [...basla.sort(nufusa), ...icerir.sort(nufusa)].slice(0, limit);
}

/** Yaklaşık mesafe (km, eşdikdörtgen izdüşüm — en yakın şehir seçimi için yeterli). */
function yaklasikKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const x = ((lng2 - lng1) * Math.PI / 180) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  const y = (lat2 - lat1) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371;
}

/** Koordinata en yakın şehir (GPS modunda ülkeyi bulmak için). `azamiKm` dışındaysa `null`. */
export function enYakinSehir(veri: DunyaSehirVerisi, lat: number, lng: number, azamiKm = 150): DunyaSehri | null {
  let enIyi: DunyaSehri | null = null;
  let enIyiKm = azamiKm;
  for (const s of veri.sehirler) {
    if (Math.abs(s.lat - lat) > 3) continue;
    const km = yaklasikKm(lat, lng, s.lat, s.lng);
    if (km < enIyiKm) {
      enIyi = s;
      enIyiKm = km;
    }
  }
  return enIyi;
}
