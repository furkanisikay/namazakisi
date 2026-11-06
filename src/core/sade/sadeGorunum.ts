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
import { bicim, metin } from '../dil/aktifDil';
import { dakikaKisa, dakikaUzun } from '../dil/sure';
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

/** Cümle içi küçük ad (sözlükte sabit harita — Türkçe `i/İ` tuzağı). Cuma, öğlenin görünen adıdır. */
const kucukAd = (kod: SadeVakitKodu, gorunenAd: string): string => {
  const v = metin().vakit;
  return gorunenAd === v.cuma ? v.cumaKucuk : v.kucuk[kod];
};

/** "Sıradaki" satırında güneş bir namaz değil, sabah vaktinin bitişidir. */
const sonrakiEtiketi = (kod: SadeVakitKodu): string => {
  const v = metin().vakit;
  return kod === 'gunes' ? v.gunesDogusu : v.adlar[kod];
};

const saatMetni = (t: Date): string =>
  `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;

/** Kalan ms → dakika (YUKARI yuvarlanır, negatif 0'a sabitlenir). */
export function kalanDakika(kalanMs: number): number {
  if (!Number.isFinite(kalanMs) || kalanMs <= 0) return 0;
  return Math.ceil(kalanMs / 60000);
}

/** Ekranda: "42 dk", "1 sa 5 dk", "2 sa". */
export const kalanSureKisa = dakikaKisa;

/** Sesli okumada: "42 dakika", "1 saat 5 dakika". */
export const kalanSureUzun = dakikaUzun;

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

const bosDurum = (): SadeDurum => ({
  tur: 'yok',
  namazAdi: null,
  vakitAdi: metin().sade.bosBaslik,
  ustEtiket: metin().sade.hesaplaniyor,
  kalanDk: 0,
  kalanMetni: '',
  kalanEtiketi: '',
  ilerleme: 0,
  tamamlandi: false,
  kildimEtkin: false,
  kerahat: false,
  sonrakiMetni: null,
  okunacakMetin: metin().sade.hazirDegil,
});

/** Sade görünümün tek karar noktası. */
export function sadeDurumuHesapla(g: SadeDurumGirdisi): SadeDurum {
  if (!g.vakit || !g.sonrakiGiris || Number.isNaN(g.sonrakiGiris.getTime())) return bosDurum();
  const m = metin().sade;

  const kalanDk = kalanDakika(g.sonrakiGiris.getTime() - g.simdi.getTime());
  const kalanMetni = kalanSureKisa(kalanDk);

  if (g.vakit === 'gunes') {
    const ad = namazGorunenAdi(NamazAdi.Ogle, g.simdi, g.cumaEtiketi);
    return {
      ...bosDurum(),
      tur: 'girmedi',
      vakitAdi: ad,
      ustEtiket: m.henuzGirmedi,
      kalanDk,
      kalanMetni,
      kalanEtiketi: m.girmesine,
      sonrakiMetni: bicim(m.giris, { saat: saatMetni(g.sonrakiGiris) }),
      okunacakMetin: bicim(m.girmediSesli, { ad, sure: kalanSureUzun(kalanDk), saat: saatMetni(g.sonrakiGiris) }),
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
  const sonrakiKod = g.sonrakiVakit && g.sonrakiVakit in KOD_NAMAZ ? g.sonrakiVakit : null;
  const sonrakiEtiket = sonrakiKod ? sonrakiEtiketi(sonrakiKod) : undefined;
  const sonrakiMetni = sonrakiEtiket ? bicim(m.sonraki, { ad: sonrakiEtiket, saat: saatMetni(g.sonrakiGiris) }) : null;
  const kerahat = g.mekruhMu && !g.tamamlandi;

  const cumleler = [bicim(m.simdiSesli, { ad: kucukAd(g.vakit, ad) })];
  if (g.tamamlandi) cumleler.push(`${bicim(m.kildinizSesli, { ad })}${g.kabulMetni ? ` ${g.kabulMetni}.` : ''}`);
  cumleler.push(bicim(m.cikmasinaSesli, { sure: kalanSureUzun(kalanDk) }));
  if (kerahat) cumleler.push(m.kerahatSesli);
  if (sonrakiKod) {
    const sonrakiAd =
      sonrakiKod === 'gunes'
        ? metin().vakit.gunesDogusuKucuk
        : bicim(m.siradakiVakit, { ad: kucukAd(sonrakiKod, sonrakiEtiketi(sonrakiKod)) });
    cumleler.push(bicim(m.siradakiSesli, { ad: sonrakiAd, saat: saatMetni(g.sonrakiGiris) }));
  }

  return {
    tur: 'vakit',
    namazAdi,
    vakitAdi: ad,
    ustEtiket: m.simdi,
    kalanDk,
    kalanMetni,
    kalanEtiketi: m.cikmasina,
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
