/**
 * Sade görünüm (issue #295) — SAF kararlar.
 *
 * Yaşlı kullanıcılar için tek ekran: "Şimdi İkindi · 42 dk · [Kıldım]". Bu dosya
 * ekranın NE göstereceğini ve dokununca NE okunacağını üretir; React'e, store'a ve
 * native köprüye bağımsızdır (zaman `simdi` ile ENJEKTE edilir → test deterministik).
 *
 * Kurallar:
 * - Süre DAKİKA çözünürlüğündedir (saniye yok): pil + ekran okuyucu gürültüsü.
 *   Dakika YUKARI yuvarlanır — 30 sn kala "0 dk" yazmasın.
 * - Güneş → öğle arası "Öğle vakti henüz girmedi" durumudur (AnaSayfa'daki
 *   `vakitBilgisi.vakit === 'gunes'` kuralının aynısı): Kıldım KAPALI; bu bir
 *   kerahat engeli değil, vaktin girmemiş olmasıdır.
 * - Kerahat vakti işaretlemeyi ENGELLEMEZ (issue #82): düğme açıktır, çağıran
 *   taraf (`AnaSayfa.namazToggle`) onay modalını gösterir. Burada yalnız bilgi verilir.
 * - Okunan metin ARAYÜZ kaydındadır (kibar, bilgilendirici) — ibadet çağrısı değil.
 * - Küçük harfli vakit adı için `toLowerCase()` KULLANILMAZ (`'İkindi'` → `'i̇kindi'`);
 *   sabit harita.
 */
import { NamazAdi } from '../constants/UygulamaSabitleri';
import { namazGorunenAdi } from '../utils/cumaYardimcisi';
import { kontrastOrani } from '../utils/kontrastOrani';

/** `NamazVaktiHesaplayiciServisi.VakitBilgisi.vakit` ile aynı uzay (yapısal uyum). */
export type SadeVakitKodu = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export interface SadeGorunumAyarlari {
  /** Açıksa ana ekranın yerine sade görünüm çizilir. */
  aktif: boolean;
}

export const VARSAYILAN_SADE_GORUNUM_AYARLARI: SadeGorunumAyarlari = { aktif: false };

/** Bozuk / eksik / nesne-dışı kayıt varsayılana düşer (okuma asla reddetmez). */
export function sadeGorunumAyarlariniNormalize(ham: unknown): SadeGorunumAyarlari {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return { ...VARSAYILAN_SADE_GORUNUM_AYARLARI };
  const k = ham as Partial<SadeGorunumAyarlari>;
  return { aktif: k.aktif === true };
}

const KOD_NAMAZ: Record<SadeVakitKodu, NamazAdi> = {
  imsak: NamazAdi.Sabah,
  gunes: NamazAdi.Gunes,
  ogle: NamazAdi.Ogle,
  ikindi: NamazAdi.Ikindi,
  aksam: NamazAdi.Aksam,
  yatsi: NamazAdi.Yatsi,
};

/** Cümle içi küçük harf — SABİT harita (Türkçe `i/İ` tuzağı). */
const KUCUK_AD: Record<string, string> = {
  Sabah: 'sabah',
  Güneş: 'güneş',
  Öğle: 'öğle',
  İkindi: 'ikindi',
  Akşam: 'akşam',
  Yatsı: 'yatsı',
  Cuma: 'cuma',
};

/** "Sıradaki" satırında güneş bir namaz değil, sabah vaktinin bitişidir. */
const SONRAKI_ETIKET: Record<SadeVakitKodu, string> = {
  imsak: 'Sabah',
  gunes: 'Güneş doğuşu',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
};

const kucukAd = (ad: string): string => KUCUK_AD[ad] ?? ad;

const saatMetni = (t: Date): string =>
  `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;

/** Kalan ms → dakika (YUKARI yuvarlanır, negatif 0'a sabitlenir). */
export function kalanDakika(kalanMs: number): number {
  if (!Number.isFinite(kalanMs) || kalanMs <= 0) return 0;
  return Math.ceil(kalanMs / 60000);
}

/** Ekranda: "42 dk", "1 sa 5 dk", "2 sa". */
export function kalanSureKisa(dk: number): string {
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan === 0 ? `${sa} sa` : `${sa} sa ${kalan} dk`;
}

/** Sesli okumada: "42 dakika", "1 saat 5 dakika". */
export function kalanSureUzun(dk: number): string {
  if (dk < 60) return `${dk} dakika`;
  const sa = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan === 0 ? `${sa} saat` : `${sa} saat ${kalan} dakika`;
}

export interface SadeDurumGirdisi {
  /** Şu anki vakit (`VakitBilgisi.vakit`); hesap hazır değilse null. */
  vakit: SadeVakitKodu | null;
  /** Şu anki vaktin GİRİŞİ (ilerleme halkası için). */
  giris: Date | null;
  /** Bir sonraki vaktin girişi = şu anki vaktin ÇIKIŞI. */
  sonrakiGiris: Date | null;
  /** Bir sonraki vaktin kodu. */
  sonrakiVakit: SadeVakitKodu | null;
  simdi: Date;
  /** Şu anki vaktin namazı aktif günün kaydında "kılındı" mı? */
  tamamlandi: boolean;
  /** Aktif günün namaz kaydı yüklü mü? (Değilse işaretleme yapılamaz.) */
  kayitHazir: boolean;
  /** Kerahat (mekruh) vakti mi? Yalnız bilgi — engellemez. */
  mekruhMu: boolean;
  /** Kullanıcı cuma hatırlatmasını açtıysa cuma günü öğle "Cuma" görünür. */
  cumaEtiketi: boolean;
  /** Kılınmışken söylenen dua ("Allah kabul etsin"); verilirse sesli okumaya da eklenir. */
  kabulMetni?: string;
}

export type SadeDurumTuru = 'vakit' | 'girmedi' | 'yok';

export interface SadeDurum {
  tur: SadeDurumTuru;
  /** İşaretlenecek namaz (yalnız `tur === 'vakit'`). */
  namazAdi: NamazAdi | null;
  /** Büyük başlık: "İkindi" / "Öğle" / "Cuma". */
  vakitAdi: string;
  /** "Şimdi" / "Henüz girmedi". */
  ustEtiket: string;
  kalanDk: number;
  kalanMetni: string;
  /** "Çıkmasına" (vakit sürüyor) / "Girmesine" (güneş → öğle). */
  kalanEtiketi: string;
  /** 0–1: vaktin geçen kısmı (halka). Bilinmiyorsa 0. */
  ilerleme: number;
  tamamlandi: boolean;
  kildimEtkin: boolean;
  kerahat: boolean;
  /** "Akşam · 18:12" — yoksa null. */
  sonrakiMetni: string | null;
  /** Dokununca okunacak cümle(ler). */
  okunacakMetin: string;
}

const BOS_DURUM: SadeDurum = {
  tur: 'yok',
  namazAdi: null,
  vakitAdi: 'Namaz vakti',
  ustEtiket: 'Hesaplanıyor',
  kalanDk: 0,
  kalanMetni: '',
  kalanEtiketi: '',
  ilerleme: 0,
  tamamlandi: false,
  kildimEtkin: false,
  kerahat: false,
  sonrakiMetni: null,
  okunacakMetin: 'Vakit bilgisi henüz hazır değil. Konumunuzu kontrol edin.',
};

/** Sade görünümün tek karar noktası. */
export function sadeDurumuHesapla(g: SadeDurumGirdisi): SadeDurum {
  if (!g.vakit || !g.sonrakiGiris || Number.isNaN(g.sonrakiGiris.getTime())) return BOS_DURUM;

  const kalanDk = kalanDakika(g.sonrakiGiris.getTime() - g.simdi.getTime());
  const kalanMetni = kalanSureKisa(kalanDk);

  if (g.vakit === 'gunes') {
    const ad = namazGorunenAdi(NamazAdi.Ogle, g.simdi, g.cumaEtiketi);
    return {
      ...BOS_DURUM,
      tur: 'girmedi',
      vakitAdi: ad,
      ustEtiket: 'Henüz girmedi',
      kalanDk,
      kalanMetni,
      kalanEtiketi: 'Girmesine',
      sonrakiMetni: `Giriş · ${saatMetni(g.sonrakiGiris)}`,
      okunacakMetin:
        `${ad} vakti henüz girmedi. Girmesine ${kalanSureUzun(kalanDk)} var. ` +
        `Giriş saati ${saatMetni(g.sonrakiGiris)}.`,
    };
  }

  const namazAdi = KOD_NAMAZ[g.vakit];
  const ad = namazGorunenAdi(namazAdi, g.simdi, g.cumaEtiketi);

  let ilerleme = 0;
  if (g.giris && !Number.isNaN(g.giris.getTime())) {
    const toplam = g.sonrakiGiris.getTime() - g.giris.getTime();
    if (toplam > 0) {
      ilerleme = Math.min(1, Math.max(0, (g.simdi.getTime() - g.giris.getTime()) / toplam));
    }
  }

  // Bilinmeyen kod (bozuk girdi) "undefined · 18:12" yazmasın: satır hiç çizilmez.
  const sonrakiEtiket = g.sonrakiVakit ? SONRAKI_ETIKET[g.sonrakiVakit] : undefined;
  const sonrakiMetni = sonrakiEtiket ? `${sonrakiEtiket} · ${saatMetni(g.sonrakiGiris)}` : null;
  const kerahat = g.mekruhMu && !g.tamamlandi;

  const cumleler = [`Şimdi ${kucukAd(ad)} vakti.`];
  if (g.tamamlandi) cumleler.push(`${ad} namazını kıldınız.${g.kabulMetni ? ` ${g.kabulMetni}.` : ''}`);
  cumleler.push(`Çıkmasına ${kalanSureUzun(kalanDk)} var.`);
  if (kerahat) cumleler.push('Şu an kerahat vakti.');
  if (sonrakiEtiket) {
    const sonrakiAd = g.sonrakiVakit === 'gunes' ? 'güneş doğuşu' : `${kucukAd(sonrakiEtiket)} vakti`;
    cumleler.push(`Sıradaki ${sonrakiAd}, saat ${saatMetni(g.sonrakiGiris)}.`);
  }

  return {
    tur: 'vakit',
    namazAdi,
    vakitAdi: ad,
    ustEtiket: 'Şimdi',
    kalanDk,
    kalanMetni,
    kalanEtiketi: 'Çıkmasına',
    ilerleme,
    tamamlandi: g.tamamlandi,
    kildimEtkin: g.kayitHazir && !g.tamamlandi,
    kerahat,
    sonrakiMetni,
    okunacakMetin: cumleler.join(' '),
  };
}

/** Bir sonraki dakika sınırına kalan ms (dakikalık yenileme saatini hizalamak için). */
export function sonrakiDakikayaKalanMs(simdiMs: number): number {
  return 60000 - (simdiMs % 60000);
}

/**
 * Dolu düğme zemininde okunur metin rengi: verilen adaylardan kontrastı EN YÜKSEK
 * olanı. Palet `birincilKoyu`'su bazı paletlerde beyazla AA'yı tutmaz (Güneş:
 * `#F57C00` ≈ 2.9:1) — göz kararı değil ölçüm (AGENTS.md kontrast tuzağı).
 */
export function okunurMetinRengi(zemin: string, adaylar: readonly string[]): string {
  let enIyi = adaylar[0];
  let enIyiOran = -1;
  for (const aday of adaylar) {
    const oran = kontrastOrani(zemin, aday);
    if (oran > enIyiOran) {
      enIyiOran = oran;
      enIyi = aday;
    }
  }
  return enIyi;
}
