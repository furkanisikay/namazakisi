/**
 * Now Bar ve canlı sayaçlar — KULLANICI SEÇİMİ (issue #282, ikinci aşama). SAF.
 *
 * Kullanıcı durum çubuğu çipinde / One UI 8 Now Bar'da (Android 16 Live Update)
 * neyin görüneceğini öğe öğe açar ve her öğenin ne zaman başlayacağını seçer.
 * Aynı seçim Wear OS saatine de gider (`src/core/wear/wearYuku.ts > canli`).
 *
 * VARSAYILAN = İLK AŞAMANIN DAVRANIŞI: beş vakit + iftar + sahur açık ve
 * "sayaçla" (mevcut sayaç ne zaman başlıyorsa); cuma, nafileler ve seri KAPALI.
 * Seri bilinçli olarak kapalı başlar (kayıp/tehlike baskısı) — yalnız kullanıcı
 * açarsa öne çıkar.
 *
 * React'a, store'a ve native köprüye bağımlı DEĞİLDİR.
 */

export const NOW_BAR_OGELERI = [
  'imsak',
  'ogle',
  'ikindi',
  'aksam',
  'yatsi',
  'iftar',
  'sahur',
  'cuma',
  'kusluk',
  'evvabin',
  'teheccud',
  'seri',
] as const;

export type NowBarOgesi = (typeof NOW_BAR_OGELERI)[number];

/** Farz vakit öğeleri (muhafız/sayaç anahtar uzayı `VakitAdi` ile aynı). */
export const NOW_BAR_VAKITLERI = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
export type NowBarVakti = (typeof NOW_BAR_VAKITLERI)[number];

export const nowBarVaktiMi = (oge: NowBarOgesi): oge is NowBarVakti =>
  (NOW_BAR_VAKITLERI as readonly string[]).includes(oge);

/**
 * Ne zaman öne çıksın?
 * - `sayacla`: mevcut sayaç (vakit/iftar/sahur/seri sayacı) ne zaman başlıyorsa —
 *   o sayacın kendi ayarı AÇIK olmalı.
 * - `girince`: öğenin penceresi başlayınca (vakit girişi, kuşluk girişi, güneş doğuşu…).
 * - `sonDk`: hedefe son N dakika kala.
 */
export type NowBarBaslangic = 'sayacla' | 'girince' | 'sonDk';

export interface NowBarOgeAyari {
  acik: boolean;
  baslangic: NowBarBaslangic;
  /** Yalnız `sonDk` iken okunur ama her zaman saklanır (seçim geri dönünce kaybolmasın). */
  sonDk: number;
}

export interface NowBarAyarlari {
  ogeler: Record<NowBarOgesi, NowBarOgeAyari>;
}

export const NOW_BAR_SON_DK_MIN = 5;
export const NOW_BAR_SON_DK_MAX = 180;
export const NOW_BAR_SON_DK_ADIM = 5;

/**
 * Öğe başına seçilebilen başlangıçlar. İftar/sahur/seri yalnız kendi sayaçlarından
 * beslenir (o sayacın penceresi zaten "girince"dir: iftar imsaktan, sahur
 * yatsıdan); cuma ve nafilelerin sayacı yoktur.
 */
export const NOW_BAR_BASLANGICLARI: Record<NowBarOgesi, readonly NowBarBaslangic[]> = {
  imsak: ['sayacla', 'girince', 'sonDk'],
  ogle: ['sayacla', 'girince', 'sonDk'],
  ikindi: ['sayacla', 'girince', 'sonDk'],
  aksam: ['sayacla', 'girince', 'sonDk'],
  yatsi: ['sayacla', 'girince', 'sonDk'],
  iftar: ['sayacla', 'sonDk'],
  sahur: ['sayacla', 'sonDk'],
  seri: ['sayacla', 'sonDk'],
  cuma: ['girince', 'sonDk'],
  kusluk: ['girince', 'sonDk'],
  evvabin: ['girince', 'sonDk'],
  teheccud: ['girince', 'sonDk'],
};

/**
 * ÖNCELİK (küçük sayı kazanır): aynı anda birden çok öğe uygunsa yalnız biri öne
 * çıkar — Android birden çok öne çıkarılmış sürekli bildirime izin verir ama
 * durum çubuğunda yarışan iki çip gürültüdür. Vakit çıkışı > iftar > sahur >
 * cuma > nafile > seri.
 */
export const NOW_BAR_ONCELIK: Record<NowBarOgesi, number> = {
  imsak: 1,
  ogle: 1,
  ikindi: 1,
  aksam: 1,
  yatsi: 1,
  iftar: 2,
  sahur: 3,
  cuma: 4,
  kusluk: 5,
  evvabin: 5,
  teheccud: 5,
  seri: 6,
};

const ogeAyari = (acik: boolean, baslangic: NowBarBaslangic, sonDk: number): NowBarOgeAyari => ({
  acik,
  baslangic,
  sonDk,
});

export const VARSAYILAN_NOW_BAR_AYARLARI: NowBarAyarlari = {
  ogeler: {
    imsak: ogeAyari(true, 'sayacla', 30),
    ogle: ogeAyari(true, 'sayacla', 30),
    ikindi: ogeAyari(true, 'sayacla', 30),
    aksam: ogeAyari(true, 'sayacla', 30),
    yatsi: ogeAyari(true, 'sayacla', 30),
    iftar: ogeAyari(true, 'sayacla', 60),
    sahur: ogeAyari(true, 'sayacla', 60),
    cuma: ogeAyari(false, 'sonDk', 60),
    kusluk: ogeAyari(false, 'girince', 30),
    evvabin: ogeAyari(false, 'girince', 30),
    teheccud: ogeAyari(false, 'girince', 30),
    seri: ogeAyari(false, 'sayacla', 60),
  },
};

const nesneMi = (d: unknown): d is Record<string, unknown> =>
  !!d && typeof d === 'object' && !Array.isArray(d);

export const sonDkKenetle = (deger: unknown, varsayilan: number): number => {
  if (typeof deger !== 'number' || !Number.isFinite(deger)) return varsayilan;
  const adimli = Math.round(deger / NOW_BAR_SON_DK_ADIM) * NOW_BAR_SON_DK_ADIM;
  return Math.min(NOW_BAR_SON_DK_MAX, Math.max(NOW_BAR_SON_DK_MIN, adimli));
};

/**
 * Herhangi bir değeri geçerli ayara çevirir (disk + slice + yedek yolu). ASLA
 * fırlatmaz: bozuk öğe varsayılana, öğe için geçersiz başlangıç (ör. cuma için
 * `sayacla`) o öğenin varsayılanına düşer.
 */
export function nowBarAyarlariniNormalize(ham: unknown): NowBarAyarlari {
  const kaynak = nesneMi(ham) && nesneMi(ham.ogeler) ? ham.ogeler : {};
  const ogeler = {} as Record<NowBarOgesi, NowBarOgeAyari>;
  for (const oge of NOW_BAR_OGELERI) {
    const v = VARSAYILAN_NOW_BAR_AYARLARI.ogeler[oge];
    const h = kaynak[oge];
    if (!nesneMi(h)) {
      ogeler[oge] = { ...v };
      continue;
    }
    const baslangic =
      typeof h.baslangic === 'string' && NOW_BAR_BASLANGICLARI[oge].includes(h.baslangic as NowBarBaslangic)
        ? (h.baslangic as NowBarBaslangic)
        : v.baslangic;
    ogeler[oge] = {
      acik: typeof h.acik === 'boolean' ? h.acik : v.acik,
      baslangic,
      sonDk: sonDkKenetle(h.sonDk, v.sonDk),
    };
  }
  return { ogeler };
}

/** Kısmi değişikliği birleştirir (normalize ederek). */
export function nowBarAyariniBirlestir(
  mevcut: NowBarAyarlari,
  oge: NowBarOgesi,
  degisiklik: Partial<NowBarOgeAyari>
): NowBarAyarlari {
  return nowBarAyarlariniNormalize({
    ogeler: { ...mevcut.ogeler, [oge]: { ...mevcut.ogeler[oge], ...degisiklik } },
  });
}

/**
 * Sayaç servisinin ESKİ yolunda (planlayıcı devralmadığında: API < 36, kullanıcı
 * sistemde kapattı, eski native ikili) öne çıkarma isteği gönderilsin mi?
 * İlk aşamanın davranışı: açık + `sayacla`.
 */
export const sayacOneCikarilsinMi = (ayarlar: NowBarAyarlari, oge: NowBarOgesi): boolean =>
  ayarlar.ogeler[oge].acik && ayarlar.ogeler[oge].baslangic === 'sayacla';

/** Açık öğe sayısı (ayarlar satırı özeti). */
export const acikOgeSayisi = (ayarlar: NowBarAyarlari): number =>
  NOW_BAR_OGELERI.filter((o) => ayarlar.ogeler[o].acik).length;

// ---------------------------------------------------------------------------
// Görünüm metinleri (arayüz: kibar "siz"). Ekran ve özet AYNI kaynaktan beslenir.
// ---------------------------------------------------------------------------

export interface NowBarOgeBilgisi {
  ad: string;
  /** FontAwesome5 adı */
  ikon: string;
  /** Kısa açıklama: neye geri sayar */
  aciklama: string;
  /** Başlangıç seçeneklerinin bu öğedeki adı */
  baslangicEtiketleri: Partial<Record<NowBarBaslangic, string>>;
  /** Öğe yalnız bir sayaç açıkken çalışıyorsa, onu söyleyen satır */
  sayacGereksinimi?: string;
}

const VAKIT_ETIKETLERI = { sayacla: 'Sayaçla', girince: 'Vakit girince', sonDk: 'Son dakikalar' } as const;
const VAKIT_GEREKSINIMI = '"Sayaçla" seçeneği vakit sayacı açıkken çalışır.';

export const NOW_BAR_OGE_BILGILERI: Record<NowBarOgesi, NowBarOgeBilgisi> = {
  imsak: {
    ad: 'Sabah',
    ikon: 'cloud-sun',
    aciklama: 'Sabah vaktinin çıkışına (güneşin doğuşuna) kalan süre',
    baslangicEtiketleri: VAKIT_ETIKETLERI,
    sayacGereksinimi: VAKIT_GEREKSINIMI,
  },
  ogle: {
    ad: 'Öğle',
    ikon: 'sun',
    aciklama: 'Öğle vaktinin çıkışına kalan süre',
    baslangicEtiketleri: VAKIT_ETIKETLERI,
    sayacGereksinimi: VAKIT_GEREKSINIMI,
  },
  ikindi: {
    ad: 'İkindi',
    ikon: 'cloud-sun',
    aciklama: 'İkindi vaktinin çıkışına kalan süre',
    baslangicEtiketleri: VAKIT_ETIKETLERI,
    sayacGereksinimi: VAKIT_GEREKSINIMI,
  },
  aksam: {
    ad: 'Akşam',
    ikon: 'cloud-moon',
    aciklama: 'Akşam vaktinin çıkışına kalan süre',
    baslangicEtiketleri: VAKIT_ETIKETLERI,
    sayacGereksinimi: VAKIT_GEREKSINIMI,
  },
  yatsi: {
    ad: 'Yatsı',
    ikon: 'moon',
    aciklama: 'Yatsı vaktinin çıkışına (imsaka) kalan süre',
    baslangicEtiketleri: VAKIT_ETIKETLERI,
    sayacGereksinimi: VAKIT_GEREKSINIMI,
  },
  iftar: {
    ad: 'İftar',
    ikon: 'utensils',
    aciklama: 'Akşam ezanına kalan süre',
    baslangicEtiketleri: { sayacla: 'İmsaktan itibaren', sonDk: 'Son dakikalar' },
    sayacGereksinimi: 'İftar sayacı açıkken çalışır (Ramazan özel).',
  },
  sahur: {
    ad: 'Sahur',
    ikon: 'mug-hot',
    aciklama: 'İmsaka kalan süre',
    baslangicEtiketleri: { sayacla: 'Yatsıdan itibaren', sonDk: 'Son dakikalar' },
    sayacGereksinimi: 'Sahur sayacı açıkken çalışır (Ramazan özel).',
  },
  cuma: {
    ad: 'Cuma',
    ikon: 'mosque',
    aciklama: 'Cuma günü öğle vaktine (hutbeye) kalan süre',
    baslangicEtiketleri: { girince: 'Güneş doğunca', sonDk: 'Son dakikalar' },
  },
  kusluk: {
    ad: 'Kuşluk',
    ikon: 'sun',
    aciklama: 'Kuşluk vaktinin bitişine kalan süre',
    baslangicEtiketleri: { girince: 'Vakit girince', sonDk: 'Son dakikalar' },
  },
  evvabin: {
    ad: 'Evvâbîn',
    ikon: 'cloud-sun',
    aciklama: 'Evvâbîn vaktinin (yatsıya kadar) bitişine kalan süre',
    baslangicEtiketleri: { girince: 'Vakit girince', sonDk: 'Son dakikalar' },
  },
  teheccud: {
    ad: 'Teheccüd',
    ikon: 'star',
    aciklama: 'Gecenin son üçte birinden imsaka kalan süre',
    baslangicEtiketleri: { girince: 'Son üçte bir girince', sonDk: 'Son dakikalar' },
  },
  seri: {
    ad: 'Seri',
    ikon: 'fire',
    aciklama: 'Gün eksikken seri gününün bitişine (imsaka) kalan süre',
    baslangicEtiketleri: { sayacla: 'Son 2 saatte', sonDk: 'Son dakikalar' },
    sayacGereksinimi: 'Gün sonu hatırlatması açıkken ve gün eksikken çalışır.',
  },
};

/** Ekrandaki zorunlu uyarı satırı (sahibin isteği; metin değişirse test de değişmeli). */
export const NOW_BAR_POLITIKA_UYARISI =
  'Google sürekli açık kartları önermez; telefonunuz öne çıkarmayı geri çekebilir.';
