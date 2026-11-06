/**
 * "Her farzla bir kaza" önerisi (issue #294) — SAF karar çekirdeği.
 *
 * Uygulama içinde bir farz "kıldım" işaretlenince isteğe bağlı bir soru açılır:
 * "Bir kaza da kılar mısınız?". Mevcut alışkanlığa (farz) bağlanan ipucu, yeni
 * bir hatırlatmadan daha iyi tutar. Bu dosya store'a, React'a ve AsyncStorage'a
 * bağımsızdır; tüm girdiler (ayar, kerahat, defter, sorulma kaydı) DIŞARIDAN
 * verilir → nöbetçi testler saat/konum kurmadan deterministiktir.
 *
 * Kurallar (issue gövdesi bağlayıcı):
 * - Yalnız İŞARETLEME yönünde (geri almada değil), yalnız AKTİF günün o anki
 *   vakti için (geçmiş gün işaretlemesinde sorulmaz).
 * - Kerahat vaktinde sorulmaz; kerahat bilinmiyorsa da (konum yok) sorulmaz —
 *   doğrulayamadığımız bir anda kaza kılmaya davet etmeyiz.
 * - Ayardan kapatılabilir; kaza defteri boşsa / okunamadıysa hiç sorulmaz.
 * - Aynı gün aynı vakit için en fazla BİR kez; "Şimdi değil" denince o gün
 *   bir daha hiç sorulmaz (gürültü olmasın).
 */

import { NamazAdi } from '../constants/UygulamaSabitleri';
import { KAZA_NAMAZ_LISTESI, type KazaNamazAdi } from '../types/KazaTipleri';
import { canli } from '../dil/aktifDil';

/** Ayar (yedeklenir). YOKLUĞU "açık" demektir. */
export interface KazaOneriAyarlari {
  farzSonrasiOner: boolean;
}

export const VARSAYILAN_KAZA_ONERI_AYARLARI: KazaOneriAyarlari = {
  farzSonrasiOner: true,
};

/**
 * Sorulma hafızası (cihaza özgü, yedeklenmez). Yalnız TEK günü tutar: tarih
 * değişince kayıt kendiliğinden sıfırlanmış sayılır, budama gerekmez.
 */
export interface KazaOneriKaydi {
  /** Namaz günü (aktif gün, `YYYY-MM-DD`) — gece yarısından sonraki yatsı DÜNE aittir. */
  tarih: string;
  /** O gün sorusu açılmış farzlar (cevap ne olursa olsun). */
  sorulanVakitler: string[];
  /** "Şimdi değil" dendi mi? O gün başka vakitte de sorulmaz. */
  ertelendi: boolean;
}

/** Soruyu tetikleyebilen farzlar (Güneş bir namaz değildir). */
const FARZLAR: readonly string[] = [
  NamazAdi.Sabah,
  NamazAdi.Ogle,
  NamazAdi.Ikindi,
  NamazAdi.Aksam,
  NamazAdi.Yatsi,
];

export type KazaOneriSebebi =
  | 'ayarKapali'
  | 'geriAlma'
  | 'farzDegil'
  | 'gecmisGun'
  | 'suankiVakitDegil'
  | 'kerahat'
  | 'kerahatBilinmiyor'
  | 'zatenSoruldu'
  | 'bugunErtelendi'
  | 'defterBos';

export type KazaOneriKarari =
  | { sor: true; kazaNamazi: KazaNamazAdi }
  | { sor: false; sebep: KazaOneriSebebi };

/** Defterden kararın ihtiyaç duyduğu dar görünüm. */
export interface KazaBorcGorunumu {
  namazAdi: KazaNamazAdi;
  kalanBorc: number;
}

export interface KazaOneriOnKosulGirdisi {
  ayarlar: KazaOneriAyarlari;
  /** true = "kıldım" yönü; false = geri alma. */
  tamamlandi: boolean;
  /** İşaretlenen namaz (NamazAdi değeri). */
  kilinanNamaz: string;
  /** Ekranda gösterilen gün. */
  gosterilenGun: string;
  /** Aktif (namaz) gün. */
  aktifGun: string;
  /** Şu an süren vaktin namazı (Güneş vaktinde `NamazAdi.Gunes`); bilinmiyorsa null. */
  suankiVakitNamazi: string | null;
  /** Şu an kerahat vakti mi? null = bilinmiyor (konum yok). */
  kerahatMi: boolean | null;
  kayit: KazaOneriKaydi;
}

export interface KazaOneriGirdisi extends KazaOneriOnKosulGirdisi {
  /** Kaza defteri; null = yüklenemedi. */
  namazlar: readonly KazaBorcGorunumu[] | null;
}

/** Boş kayıt (verilen gün için). */
export const bosKazaOneriKaydi = (tarih: string): KazaOneriKaydi => ({
  tarih,
  sorulanVakitler: [],
  ertelendi: false,
});

/** Diskten gelen ham ayarı güvenle çözer (bozuk → varsayılan). */
export const kazaOneriAyarlariniNormalize = (ham: unknown): KazaOneriAyarlari => {
  if (ham && typeof ham === 'object' && !Array.isArray(ham)) {
    const deger = (ham as { farzSonrasiOner?: unknown }).farzSonrasiOner;
    if (typeof deger === 'boolean') return { farzSonrasiOner: deger };
  }
  return { ...VARSAYILAN_KAZA_ONERI_AYARLARI };
};

/**
 * Diskten gelen ham kaydı güvenle çözer. Başka güne aitse ya da bozuksa o gün
 * için BOŞ kayıt döner (dünkü "Şimdi değil" bugünü susturmaz).
 */
export const kazaOneriKaydiniNormalize = (ham: unknown, tarih: string): KazaOneriKaydi => {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return bosKazaOneriKaydi(tarih);
  const k = ham as Partial<KazaOneriKaydi>;
  if (k.tarih !== tarih) return bosKazaOneriKaydi(tarih);
  return {
    tarih,
    sorulanVakitler: Array.isArray(k.sorulanVakitler)
      ? k.sorulanVakitler.filter((v): v is string => typeof v === 'string')
      : [],
    ertelendi: k.ertelendi === true,
  };
};

/**
 * Hangi kaza önerilir? Önce KILINAN farzın kendi kazası ("öğle kıldım → bir öğle
 * kazası"); onun borcu yoksa en çok borcu olan (Kaza Defteri'nin genel tamamlama
 * kuralıyla aynı: "en yüksek kalan vakitten düşer"); eşitlikte defter sırası.
 * Hiç borç yoksa null.
 */
export const onerilecekKazayiSec = (
  kilinanNamaz: string,
  namazlar: readonly KazaBorcGorunumu[]
): KazaNamazAdi | null => {
  const borc = (ad: KazaNamazAdi): number => {
    const n = namazlar.find((x) => x.namazAdi === ad);
    return n && Number.isFinite(n.kalanBorc) && n.kalanBorc > 0 ? n.kalanBorc : 0;
  };

  const ayni = KAZA_NAMAZ_LISTESI.find((ad) => ad === kilinanNamaz);
  if (ayni && borc(ayni) > 0) return ayni;

  let secilen: KazaNamazAdi | null = null;
  let enCok = 0;
  for (const ad of KAZA_NAMAZ_LISTESI) {
    const b = borc(ad);
    if (b > enCok) {
      enCok = b;
      secilen = ad;
    }
  }
  return secilen;
};

/**
 * Ucuz (diske gitmeden bilinebilen) kapılar. null = engel yok, defter bakılabilir.
 * Hook defteri yalnız bu geçerse yükler.
 */
export const kazaOnerisiOnKosulu = (g: KazaOneriOnKosulGirdisi): KazaOneriSebebi | null => {
  if (!g.tamamlandi) return 'geriAlma';
  if (!g.ayarlar.farzSonrasiOner) return 'ayarKapali';
  if (!FARZLAR.includes(g.kilinanNamaz)) return 'farzDegil';
  if (g.gosterilenGun !== g.aktifGun) return 'gecmisGun';
  if (g.suankiVakitNamazi !== g.kilinanNamaz) return 'suankiVakitDegil';
  if (g.kerahatMi === null) return 'kerahatBilinmiyor';
  if (g.kerahatMi) return 'kerahat';

  const kayit = g.kayit.tarih === g.aktifGun ? g.kayit : bosKazaOneriKaydi(g.aktifGun);
  if (kayit.ertelendi) return 'bugunErtelendi';
  if (kayit.sorulanVakitler.includes(g.kilinanNamaz)) return 'zatenSoruldu';
  return null;
};

/** Tam karar: ön kapılar + defter. */
export const kazaOnerisiKarari = (g: KazaOneriGirdisi): KazaOneriKarari => {
  const sebep = kazaOnerisiOnKosulu(g);
  if (sebep) return { sor: false, sebep };
  if (!g.namazlar) return { sor: false, sebep: 'defterBos' };
  const kazaNamazi = onerilecekKazayiSec(g.kilinanNamaz, g.namazlar);
  if (!kazaNamazi) return { sor: false, sebep: 'defterBos' };
  return { sor: true, kazaNamazi };
};

/** Soru AÇILDIĞINDA yazılır: aynı vakit o gün bir daha sorulmaz (cevap ne olursa olsun). */
export const soruAcildiKaydet = (
  kayit: KazaOneriKaydi,
  aktifGun: string,
  kilinanNamaz: string
): KazaOneriKaydi => {
  const temel = kayit.tarih === aktifGun ? kayit : bosKazaOneriKaydi(aktifGun);
  if (temel.sorulanVakitler.includes(kilinanNamaz)) return temel;
  return { ...temel, sorulanVakitler: [...temel.sorulanVakitler, kilinanNamaz] };
};

/** "Şimdi değil" (ya da geri tuşu/backdrop): o gün başka vakitte de sorulmaz. */
export const simdiDegilKaydet = (kayit: KazaOneriKaydi, aktifGun: string): KazaOneriKaydi => {
  const temel = kayit.tarih === aktifGun ? kayit : bosKazaOneriKaydi(aktifGun);
  return temel.ertelendi ? temel : { ...temel, ertelendi: true };
};

/** Kaza adı (kimlik, Türkçe) → sözlük anahtarı. */
const KAZA_ANAHTARI = {
  Sabah: 'sabah',
  'Öğle': 'ogle', // dil-haric: kimlik
  'İkindi': 'ikindi', // dil-haric: kimlik
  'Akşam': 'aksam', // dil-haric: kimlik
  'Yatsı': 'yatsi', // dil-haric: kimlik
  Vitir: 'vitir',
} as const satisfies Record<KazaNamazAdi, string>;

/** Kaza namazının görünen adı, etkin dilde ("Öğle" / "Dhuhr"). */
export const KAZA_ADLARI: Readonly<Record<KazaNamazAdi, string>> = canli((s) => {
  const o = {} as Record<KazaNamazAdi, string>;
  for (const k of Object.keys(KAZA_ANAHTARI) as KazaNamazAdi[]) o[k] = s.kaza.adlar[KAZA_ANAHTARI[k]];
  return o;
});

/**
 * Cümle içinde küçük harfli kaza adı ("bir öğle kazası"). `toLowerCase()` KULLANMA:
 * 'İkindi'.toLowerCase() → 'i̇kindi' (AGENTS.md Türkçe harf tuzağı).
 */
export const KAZA_ADLARI_KUCUK: Readonly<Record<KazaNamazAdi, string>> = canli((s) => {
  const o = {} as Record<KazaNamazAdi, string>;
  for (const k of Object.keys(KAZA_ANAHTARI) as KazaNamazAdi[]) o[k] = s.kaza.kucuk[KAZA_ANAHTARI[k]];
  return o;
});
