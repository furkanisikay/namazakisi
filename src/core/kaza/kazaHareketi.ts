/**
 * Kaza Defteri 2.0 — değişmez hareket defteri: TİPLER, normalize, birleştirme.
 *
 * Durum saklanmaz, HAREKET saklanır; ekranda görünen her sayı hareketlerden
 * türetilir (`kazaDefteriHesabi.defterHesapla`). Hiçbir hareket silinmez ya da
 * değiştirilmez: silme de geri alma da birer harekettir.
 *
 * OTOMATİK KAZA SAKLANMAZ — İZDÜŞÜMDÜR. Kapanmış namaz gününün işaretsiz farzı
 * fold anında `oto:<gün>_<vakit>` kimliğiyle +1 sayılır; namaz kaydı "kıldım"
 * olunca düşer, "kılmadım" olunca geri gelir. Toggle olayı saklansaydı birleşim
 * (union) ile çalışan namaz eşitlemesinde iki cihaz farklı defter üretirdi.
 *
 * Birleştirme bir G-Set'tir (kimliğe göre birleşim): değişmeli, birleşmeli,
 * tekrar uygulanabilir. Aynı kimlikli iki FARKLI içerik (yalnız bozuk/eski
 * veride olur) deterministik kuralla seçilir → iki cihaz aynı defterde buluşur.
 *
 * SAF: react-native / depolama import ETMEZ.
 */

import type { KazaNamazAdi } from '../types/KazaTipleri';
import type { VakitAdi } from '../types';
import { canli } from '../dil/aktifDil';

// ==================== VAKİT KODLARI ====================

/** Defterde saklanan vakit kodu (ASCII; kimliklerde kullanılır). */
export type KazaVakti = 'sabah' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi' | 'vitir';

export const KAZA_VAKITLERI: readonly KazaVakti[] = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi', 'vitir'];

/** Namaz kaydında izlenen farzlar (vitir namaz kaydında YOKTUR). */
export const FARZ_KAZA_VAKITLERI: readonly KazaVakti[] = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/**
 * Vakit kodu → KİMLİK adı (`KazaNamazAdi`, eski `KazaDurumu` anahtarı). EKRANA ÇIKMAZ:
 * görünen ad `kazaVaktiGoster(v)` (etkin dilde).
 */
export const KAZA_VAKTI_ADI: Record<KazaVakti, KazaNamazAdi> = {
  sabah: 'Sabah',
  ogle: 'Öğle', // dil-haric: kimlik
  ikindi: 'İkindi', // dil-haric: kimlik
  aksam: 'Akşam', // dil-haric: kimlik
  yatsi: 'Yatsı', // dil-haric: kimlik
  vitir: 'Vitir',
};

/** Vakit kodunun görünen adı, etkin dilde ("Öğle" / "Dhuhr"). */
const KAZA_VAKTI_GORUNEN: Readonly<Record<KazaVakti, string>> = canli((s) => s.kaza.adlar);
export const kazaVaktiGoster = (v: KazaVakti): string => KAZA_VAKTI_GORUNEN[v];

/** Cümle içinde küçük harfli ad, etkin dilde (sözlük — `toLowerCase` 'İ'yi bozar). */
export const KAZA_VAKTI_KUCUK: Readonly<Record<KazaVakti, string>> = canli((s) => s.kaza.kucuk);

/** Ad → kod (namaz kaydı anahtarları ve eski `KazaDurumu.namazlar[].namazAdi`). */
export const KAZA_ADINDAN_VAKTE: Record<string, KazaVakti> = {
  Sabah: 'sabah',
  'Öğle': 'ogle', // dil-haric: kimlik
  'İkindi': 'ikindi', // dil-haric: kimlik
  'Akşam': 'aksam', // dil-haric: kimlik
  'Yatsı': 'yatsi', // dil-haric: kimlik
  Vitir: 'vitir',
};

/** Muhafız kılınmışlık kaydının (`VakitAdi`) kodu → defter kodu. */
export const VAKIT_ADINDAN_KAZAYA: Partial<Record<VakitAdi | string, KazaVakti>> = {
  imsak: 'sabah',
  ogle: 'ogle',
  ikindi: 'ikindi',
  aksam: 'aksam',
  yatsi: 'yatsi',
};

export const kazaVaktiMi = (x: unknown): x is KazaVakti =>
  typeof x === 'string' && (KAZA_VAKITLERI as readonly string[]).includes(x);

// ==================== HAREKET ====================

export type KazaKaynagi =
  | 'taban' // hesaplanan borç (mutlak; en sonuncusu geçerli, eskiler tarihçe)
  | 'manuel' // kullanıcı +N ekledi
  | 'bildirim' // gün sonu muhasebesi "Kazaya ekle" (#290) — referanslı
  | 'kilindi' // kaza kılındı → −N (vakit ZORUNLU; genel tamamlama kaldırıldı)
  // +N → kalana eklenir · −N → "fazla kılınan" göstergesinden düşülür (fazlayı
  // sıfırla). Kalanı AZALTAN düzeltme yoktur: yanlış eklenmiş kayıt temizlikle gizlenir.
  | 'duzeltme'
  | 'temizlik' // seçili hareketleri (ve oto: kimliklerini) gizler
  | 'temizlikGeriAl' // bir temizliği geri alır
  | 'gunKarari' // "Kontrol bekleyen gün" kararı (ekle / yok say)
  | 'otoAyar' // otomatik ekleme aç/kapa (+ işaretsiz gün tercihi)
  | 'tarama' // otomatik izdüşüm günlüğü (yalnız geçmiş ekranı; sayıya girmez)
  // ESKİ SÜRÜMLÜ cihazın (1.x) anlık görüntüsünden gelen "en az bu kadar kılındı"
  // tabanı (karışık sürüm eşitlemesi). Vakit başına MAKSİMUM alınır → tekrar
  // uygulanabilir, değişmeli. Borç yönü bilinçli olarak YOKTUR (eski cihazdaki
  // bayat bir hesap yeni hesaplamayı geri getirmesin).
  | 'eskiGorunum';

export const KAZA_KAYNAKLARI: readonly KazaKaynagi[] = [
  'taban',
  'manuel',
  'bildirim',
  'kilindi',
  'duzeltme',
  'temizlik',
  'temizlikGeriAl',
  'gunKarari',
  'otoAyar',
  'tarama',
  'eskiGorunum',
];

/** Hiç işaret olmayan (uygulamanın açılmadığı) günler için tercih. */
export type KayitsizGunTercihi = 'sor' | 'ekle';

export interface KazaHareketi {
  /** Tekil. Rastgele (`kaynak:` önekli) ya da deterministik (göç). */
  id: string;
  /** Yazıldığı an (ISO, `toISOString`). Sıralama + taban seçimi. */
  zaman: string;
  /** Kısa cihaz kimliği (eşitlik bozucu + "bu telefon" gösterimi). */
  cihaz: string;
  kaynak: KazaKaynagi;
  vakit?: KazaVakti;
  /** Pozitif tamsayı; YALNIZ `duzeltme`'de işaretlidir (±). */
  adet?: number;
  /** `bildirim`: '<namazGünü>_<vakit>' · `gunKarari`: '<namazGünü>'. */
  referans?: string;
  /** `taban`: vakit başına mutlak borç. */
  taban?: Record<KazaVakti, number>;
  /** `taban`: hesabın kapsadığı son gün (örtüşme sorusu). */
  kapsamBitis?: string;
  /** Eski `KAZA_DURUMU`'ndan göçle geldi (taban + kılınan). */
  gocmis?: boolean;
  /** Göç grubu: yalnız KAZANAN göç grubunun kılınanı sayılır (çift sayım yok). */
  grup?: string;
  /**
   * Göç `taban`ı: kaynak eski kayıt bir defterin TÜRETİLMİŞ görüntüsüydü
   * (`defterOzeti` damgalı). Değer görüntünün kapsadığı son hareket anıdır;
   * o ana kadarki kaynak hareketler deftere gelince bu göç grubu sayılmaz.
   */
  turetilmisKadar?: string;
  /** `temizlik`: gizlenen kimlikler. */
  hedefIdler?: string[];
  /** `temizlikGeriAl`: geri alınan temizliğin kimliği. */
  hedefId?: string;
  /** `gunKarari`. */
  karar?: 'ekle' | 'yoksay';
  /** `otoAyar`. */
  aktif?: boolean;
  /** `otoAyar`: aralığın başladığı / kapandığı namaz günü. */
  gun?: string;
  /** `otoAyar`: işaretsiz gün tercihi. */
  kayitsiz?: KayitsizGunTercihi;
  /** `eskiGorunum`: eski cihazın gösterdiği vakit başına toplam kılınan. */
  kilinanlar?: Record<KazaVakti, number>;
  /** `tarama`: izdüşüme giren / çıkan referanslar. */
  eklenen?: string[];
  cikan?: string[];
  /** Aynı kullanıcı eyleminden doğan hareketleri gruplar. */
  islem?: string;
  /** İsteğe bağlı kullanıcı notu. */
  not?: string;
}

/** Temizlikle gizlenebilen kaynaklar (taban ve işaret satırları gizlenmez). */
// `eskiGorunum` da gizlenebilir: eski cihazdan gelen "en az bu kadar kılındı" tabanı
// her fold'da yeniden uygulanır; gizlenemeseydi temizlik onu hiç kaldıramazdı.
export const GIZLENEBILIR_KAYNAKLAR: readonly KazaKaynagi[] = ['manuel', 'bildirim', 'kilindi', 'duzeltme', 'eskiGorunum'];

export const OTO_ONEK = 'oto:';
export const otoKimligi = (referans: string): string => `${OTO_ONEK}${referans}`;

const ISO_GUN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_ZAMAN = /^\d{4}-\d{2}-\d{2}T/;
const REFERANS = /^(\d{4}-\d{2}-\d{2})_(sabah|ogle|ikindi|aksam|yatsi|vitir)$/;
const AZAMI_ADET = 100_000;
const AZAMI_HEDEF = 20_000;

export const isoGunMu = (x: unknown): x is string => typeof x === 'string' && ISO_GUN.test(x);

/** '<gün>_<vakit>' referansını çözer; geçersizse null. */
export function referansCoz(ref: unknown): { gun: string; vakit: KazaVakti } | null {
  if (typeof ref !== 'string') return null;
  const m = REFERANS.exec(ref);
  return m ? { gun: m[1], vakit: m[2] as KazaVakti } : null;
}

export const referansOlustur = (gun: string, vakit: KazaVakti): string => `${gun}_${vakit}`;

const nesneMi = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

const pozitifTamsayi = (x: unknown, ust = AZAMI_ADET): number | null =>
  typeof x === 'number' && Number.isInteger(x) && x > 0 && x <= ust ? x : null;

const negatifOlmayanTamsayi = (x: unknown): number =>
  typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.min(Math.floor(x), 10_000_000) : 0;

const kisaMetin = (x: unknown, azami: number): string | undefined =>
  typeof x === 'string' && x.length > 0 && x.length <= azami ? x : undefined;

const kimlikDizisi = (x: unknown): string[] | null => {
  if (!Array.isArray(x)) return null;
  const temiz = x.filter((k): k is string => typeof k === 'string' && k.length > 0 && k.length <= 120);
  return Array.from(new Set(temiz)).slice(0, AZAMI_HEDEF);
};

/**
 * Diskten / yedekten / buluttan gelen ham değeri doğrular. Geçersiz → `null`
 * (çağıran atlar; ham kayıt diskte KORUNUR). ASLA fırlatmaz.
 */
export function hareketNormalize(ham: unknown): KazaHareketi | null {
  if (!nesneMi(ham)) return null;
  const id = kisaMetin(ham.id, 160);
  const zaman = typeof ham.zaman === 'string' && ISO_ZAMAN.test(ham.zaman) && Number.isFinite(Date.parse(ham.zaman))
    ? ham.zaman
    : null;
  const kaynak = ham.kaynak as KazaKaynagi;
  if (!id || !zaman || !(KAZA_KAYNAKLARI as readonly string[]).includes(kaynak)) return null;
  const cihaz = kisaMetin(ham.cihaz, 40) ?? '?';
  const h: KazaHareketi = { id, zaman, cihaz, kaynak };
  const islem = kisaMetin(ham.islem, 160);
  if (islem) h.islem = islem;
  const not = kisaMetin(ham.not, 200);
  if (not) h.not = not;

  switch (kaynak) {
    case 'taban': {
      if (!nesneMi(ham.taban)) return null;
      const taban = {} as Record<KazaVakti, number>;
      for (const v of KAZA_VAKITLERI) taban[v] = negatifOlmayanTamsayi((ham.taban as Record<string, unknown>)[v]);
      h.taban = taban;
      if (isoGunMu(ham.kapsamBitis)) h.kapsamBitis = ham.kapsamBitis;
      if (ham.gocmis === true) h.gocmis = true;
      const grup = kisaMetin(ham.grup, 80);
      if (grup) h.grup = grup;
      if (h.gocmis && typeof ham.turetilmisKadar === 'string' && ISO_ZAMAN.test(ham.turetilmisKadar)) {
        h.turetilmisKadar = ham.turetilmisKadar.slice(0, 40);
      }
      return h;
    }
    case 'manuel':
    case 'kilindi': {
      const adet = pozitifTamsayi(ham.adet);
      if (!kazaVaktiMi(ham.vakit) || adet === null) return null;
      h.vakit = ham.vakit;
      h.adet = adet;
      if (kaynak === 'kilindi' && ham.gocmis === true) {
        h.gocmis = true;
        const grup = kisaMetin(ham.grup, 80);
        if (!grup) return null;
        h.grup = grup;
      }
      return h;
    }
    case 'bildirim': {
      const ref = referansCoz(ham.referans);
      if (!ref) return null;
      h.vakit = ref.vakit;
      h.adet = 1;
      h.referans = ham.referans as string;
      return h;
    }
    case 'duzeltme': {
      const adet = typeof ham.adet === 'number' && Number.isInteger(ham.adet) && ham.adet !== 0 &&
        Math.abs(ham.adet) <= 10_000_000 ? ham.adet : null;
      if (!kazaVaktiMi(ham.vakit) || adet === null) return null;
      h.vakit = ham.vakit;
      h.adet = adet;
      return h;
    }
    case 'temizlik': {
      const hedefler = kimlikDizisi(ham.hedefIdler);
      if (!hedefler || hedefler.length === 0) return null;
      h.hedefIdler = hedefler;
      return h;
    }
    case 'temizlikGeriAl': {
      const hedef = kisaMetin(ham.hedefId, 160);
      if (!hedef) return null;
      h.hedefId = hedef;
      return h;
    }
    case 'gunKarari': {
      if (!isoGunMu(ham.referans) || (ham.karar !== 'ekle' && ham.karar !== 'yoksay')) return null;
      h.referans = ham.referans;
      h.karar = ham.karar;
      return h;
    }
    case 'otoAyar': {
      if (typeof ham.aktif !== 'boolean' || !isoGunMu(ham.gun)) return null;
      h.aktif = ham.aktif;
      h.gun = ham.gun;
      if (ham.kayitsiz === 'sor' || ham.kayitsiz === 'ekle') h.kayitsiz = ham.kayitsiz;
      return h;
    }
    case 'eskiGorunum': {
      if (!nesneMi(ham.kilinanlar)) return null;
      const kilinanlar = {} as Record<KazaVakti, number>;
      for (const v of KAZA_VAKITLERI) kilinanlar[v] = negatifOlmayanTamsayi((ham.kilinanlar as Record<string, unknown>)[v]);
      h.kilinanlar = kilinanlar;
      return h;
    }
    case 'tarama': {
      const eklenen = kimlikDizisi(ham.eklenen) ?? [];
      const cikan = kimlikDizisi(ham.cikan) ?? [];
      h.eklenen = eklenen.filter((r) => referansCoz(r) !== null);
      h.cikan = cikan.filter((r) => referansCoz(r) !== null);
      return h;
    }
    default:
      return null;
  }
}

// ==================== İLERİ UYUMLULUK ====================

/**
 * Yeni bir sürümün yazdığı, bu sürümün ÇÖZEMEDİĞİ ama yapısal olarak geçerli
 * hareket (bilinmeyen `kaynak` ya da tanınan kaynağın yeni biçimi). Hesaba
 * KATILMAZ ama diskte/yedekte/bulutta KORUNUR: atılsaydı eski sürüm, yeni
 * sürümün hareketini bir sonraki yazımda siler ve iki cihaz birbirinin
 * defterini budardı.
 */
export interface BilinmeyenHareket {
  id: string;
  zaman: string;
  kaynak: string;
  [alan: string]: unknown;
}

/**
 * Yapısal olarak geçerli (kimlik + zaman + kaynak dizesi) ama bu sürümün
 * `hareketNormalize`'ından GEÇMEYEN öğe mi? Yapısız değer → hayır (atlanır).
 */
export function bilinmeyenHareketMi(ham: unknown): ham is BilinmeyenHareket {
  if (!nesneMi(ham)) return false;
  const id = kisaMetin(ham.id, 160);
  const zamanGecerli =
    typeof ham.zaman === 'string' && ISO_ZAMAN.test(ham.zaman) && Number.isFinite(Date.parse(ham.zaman));
  const kaynak = kisaMetin(ham.kaynak, 40);
  return !!id && zamanGecerli && !!kaynak && hareketNormalize(ham) === null;
}

/**
 * Ham listeyi ikiye ayırır: tanınan (normalize) + bilinmeyen (ham, kimliğe göre
 * tekil). Yalnız yapısız değer atlanır.
 */
export function hareketleriAyristir(ham: unknown): { taninan: KazaHareketi[]; bilinmeyen: BilinmeyenHareket[] } {
  const taninan: KazaHareketi[] = [];
  const bilinmeyen = new Map<string, BilinmeyenHareket>();
  if (!Array.isArray(ham)) return { taninan, bilinmeyen: [] };
  for (const oge of ham) {
    const h = hareketNormalize(oge);
    if (h) taninan.push(h);
    else if (bilinmeyenHareketMi(oge) && !bilinmeyen.has(oge.id)) bilinmeyen.set(oge.id, oge);
  }
  return { taninan, bilinmeyen: Array.from(bilinmeyen.values()) };
}

/** Bilinmeyen listeleri kimliğe göre birleştirir (ilk görülen kalır; sıralı). */
export function bilinmeyenleriBirlestir(...listeler: ReadonlyArray<readonly BilinmeyenHareket[]>): BilinmeyenHareket[] {
  const harita = new Map<string, BilinmeyenHareket>();
  for (const liste of listeler) for (const h of liste) if (!harita.has(h.id)) harita.set(h.id, h);
  return Array.from(harita.values()).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// ==================== SIRALAMA VE BİRLEŞTİRME ====================

/**
 * TOPLAM SIRA: (zaman, cihaz, id). Taban seçimi ve göç grubu bu sırayla verilir;
 * iki cihazda aynı sonucu vermesi için eşitlik bozucular şarttır.
 */
export const siraAnahtari = (h: Pick<KazaHareketi, 'zaman' | 'cihaz' | 'id'>): string =>
  `${h.zaman}\u0000${h.cihaz}\u0000${h.id}`;

export const siraKarsilastir = (a: KazaHareketi, b: KazaHareketi): number => {
  const x = siraAnahtari(a);
  const y = siraAnahtari(b);
  return x < y ? -1 : x > y ? 1 : 0;
};

/** Anahtar sıralı JSON (aynı içerik → aynı dize). */
export function kanonikDize(deger: unknown): string {
  if (Array.isArray(deger)) return `[${deger.map(kanonikDize).join(',')}]`;
  if (nesneMi(deger)) {
    const anahtarlar = Object.keys(deger).filter((a) => deger[a] !== undefined).sort();
    return `{${anahtarlar.map((a) => `${JSON.stringify(a)}:${kanonikDize(deger[a])}`).join(',')}}`;
  }
  return JSON.stringify(deger ?? null);
}

/** Aynı kimlikli iki içerikten deterministik kazanan (değişmeli seçim). */
const kazananiSec = (a: KazaHareketi, b: KazaHareketi): KazaHareketi => {
  const s = siraKarsilastir(a, b);
  if (s !== 0) return s > 0 ? a : b;
  return kanonikDize(a) >= kanonikDize(b) ? a : b;
};

/**
 * Hareket listelerini kimliğe göre birleştirir (G-Set). Sonuç toplam sıraya
 * göre sıralıdır; girdinin sırası/tekrarı sonucu DEĞİŞTİRMEZ.
 */
export function hareketleriBirlestir(...listeler: ReadonlyArray<readonly KazaHareketi[]>): KazaHareketi[] {
  const harita = new Map<string, KazaHareketi>();
  for (const liste of listeler) {
    for (const h of liste) {
      const mevcut = harita.get(h.id);
      harita.set(h.id, mevcut ? kazananiSec(mevcut, h) : h);
    }
  }
  return Array.from(harita.values()).sort(siraKarsilastir);
}

/** Hareketin depolandığı ay anahtarının son eki: `zaman`ın UTC ayı (YYYY-MM). */
export const hareketAyi = (h: Pick<KazaHareketi, 'zaman'>): string => h.zaman.slice(0, 7);

// ==================== KİMLİK ÜRETİMİ ====================

let kimlikSayaci = 0;

/**
 * Rastgele, sıralanabilir kimlik: `<önek>:<zaman36>-<sayaç36><rastgele>`.
 * Süreç içi sayaç aynı milisaniyede (ve `Math.random` sabitlenmiş testte) N
 * kimliğin çakışmasını önler; rastgele kısım iki cihazı ayırır.
 */
export function hareketKimligi(onek: string, simdiMs: number = Date.now()): string {
  kimlikSayaci = (kimlikSayaci + 1) % 1_679_616; // 36^4
  let r = '';
  for (let i = 0; i < 8; i++) r += Math.floor(Math.random() * 36).toString(36);
  return `${onek}:${simdiMs.toString(36)}-${kimlikSayaci.toString(36)}${r}`;
}

/** FNV-1a (32 bit, hex) — göç grubu gibi içerikten türeyen kimlikler için. */
export function fnv1aHex(metin: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
