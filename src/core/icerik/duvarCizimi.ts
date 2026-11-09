/**
 * Duvar kâğıdı ÇİZİM AYRINTILARI (SAF): süs geometrisi, yazı ölçüleri, düz zemin renkleri,
 * fotoğraf kırpması, yazı yerleşimi ve hazır görünümler.
 *
 * Kurallar sözleşmeden (`duvarTasarimi.ts`) gelir ve burada YENİDEN YAZILMAZ: yerleşim
 * `yaziYerlesimi` + `IZINLI_BANTLAR` + `VARSAYILAN_MERKEZ`, okunurluk `okunurlukKarari`.
 * Bu dosya uygulamadaki düzenleyicinin (ve önizlemelerin) çizim sayılarını tek yerde tutar
 * (sahip onaylı taslak 2'nin görünümü). Android çizicisi (`cekirdek/DuvarTasarimi.kt` >
 * `DuvarCizim`) ve iPhone Kısayollar görseli (`WidgetKarari.swift` > `DuvarCizim`) aynı sayıları
 * taşır; eşlik `duvarTasarimOrnegi` > `cizim` ile denetlenir
 * (`docs/ajan/gunun-ayeti.md > Duvar kâğıdı kişiselleştirme`).
 *
 * Birimler: süs ve fotoğraf geometrisi ekran GENİŞLİĞİNİN kesri (taslak 2 tuvali 330 geniş);
 * yazı ölçüleri Android çizicisinin tasarım genişliği 412'ye göre (px → genişlik × px / 412).
 */
import { kontrastOrani } from '../utils/kontrastOrani';
import {
  GOK_SAHNELERI,
  IZINLI_BANTLAR,
  VARSAYILAN_MERKEZ,
  VARSAYILAN_SUS,
  okunurlukKarari,
  yaziYerlesimi,
  type DuvarEkrani,
  type DuvarFotoAyari,
  type DuvarGogu,
  type DuvarPlatformu,
  type YaziHizasi,
} from './duvarTasarimi';
import type { DuvarKagidiAyari, DuvarYeri } from './gununAyetiYuku';

// --- Yazı ölçüleri (Android `DuvarKagidiCizici` ile aynı) ------------------------------

export const YAZI_TASARIM_GENISLIGI = 412;
export const YAZI_OLCULERI = {
  meal: 24,
  /** Arapça satırı varken meal. */
  mealArapcali: 17,
  arapca: 28,
  kunye: 12,
  atif: 10,
  /** Yazı bloğunun yan payı (düz yerleşim). */
  yanBosluk: 30,
  /** Yıldız süsünde, Arapça yokken mealin üstündeki küçük sekiz köşeli yıldız. */
  kucukYildiz: 22,
  /** Satır yüksekliği (yazı boyunun katı, mutlak): Arapça ve meal; künye/atıf yazı tipinin kendi satırı. */
  /** 2'nin altında Amiri Quran'da üst satırın harekesi alt satırınkine değer (1,75'te piksel çakışması ölçüldü). */
  arapcaSatir: 2,
  mealSatir: 1.4,
  /** Künyenin harf aralığı (yazı boyunun katı). */
  kunyeHarfAraligi: 0.04,
  /** Parçalar arası boşluk (412 tasarım px × ölçek): Arapça → meal, küçük yıldız → meal. Başka durumda meal 0. */
  mealUstArapcali: 6,
  mealUstYildizli: 10,
  /** Meal (ya da Arapça) → künye: Arapça varken 14, yokken 18. */
  kunyeUstArapcali: 14,
  kunyeUst: 18,
  /** Künye → atıf. */
  atifUst: 6,
  /** Atıf zorunlu ve okunur: kullanıcının yazı ölçeği bunun altına indirmez. */
  atifEnAzOlcek: 0.9,
} as const;

// --- Süs geometrisi (taslak 2, sahip onaylı) ---------------------------------------------

const T = (v: number) => v / 330;

/**
 * - `mihrap`: yazı kutusunu çevreleyen iki kemer (dış + iç). Bacaklar ekranın altına iner,
 *   kemerin merkezi yazı kutusunun ÜSTÜNDEN `merkezAlti` aşağıdadır (kemer kutunun üstünden
 *   döner). Kemerin tepesinde küçük beş köşeli yıldız (dolu). Mihrap seçiliyken yazının yan
 *   payı `yaziYanPayi` olur (yazı kemerin içinde kalır).
 * - `girih`: bütün ekranı kaplayan 48 birimlik karo: dört köşeli yıldız + daire (çizgi).
 * - `yildiz`: arka planda büyük silik sekiz köşeli yıldız + daire (24 birimlik çerçeve: iki
 *   kare, yarı kenar 7 ve köşegen 9,9; daire r 4,2; çizgi 0,12 birim); Arapça yokken mealin
 *   üstünde küçük yıldız.
 * Opaklıklar `belirginlik` 0,5 (varsayılan) içindir; çizim `susCarpani` ile çarpar.
 */
export const SUS_GEOMETRISI = {
  mihrap: {
    yaziYanPayi: T(84),
    dis: { yanPay: T(58), r: T(107), merkezAlti: T(54), kalinlik: T(2.2), opaklik: 0.28 },
    ic: { yanPay: T(74), r: T(91), merkezAlti: T(58), kalinlik: T(1.3), opaklik: 0.14 },
    /** Beş köşeli yıldız: merkez kutu üstünün `merkezUstu` yukarısında. */
    yildiz: { merkezUstu: T(36), disR: T(14), icR: T(6.5), opaklik: 0.3 },
  },
  girih: {
    karo: T(48),
    /** Karo içinde (0–48 birim) dört köşeli yıldız yolu. */
    yol: 'M24 0l6 18 18 6-18 6-6 18-6-18-18-6 18-6z',
    daireR: 5,
    yildizKalinlik: 0.9,
    daireKalinlik: 0.7,
    opaklik: 0.06,
  },
  yildiz: {
    /** Yıldızın boyu (412 tasarım genişliğinde 420 px) / 24 birim. */
    birim: 420 / YAZI_TASARIM_GENISLIGI / 24,
    yariKenar: 7,
    kosegen: 9.9,
    daireR: 4.2,
    kalinlik: 0.12,
    /** Merkez (x, y ekran kesri). Düz zeminler eski yerinde; gök ve fotoğraf gecenin yerinde. */
    konum: { gece: [0.855, 0.878], kagit: [0.097, 0.64], palet: [0.903, 0.693], diger: [0.855, 0.878] },
    opaklik: 0.08,
    kucukKalinlik: 1.6,
  },
} as const;

/** Fotoğrafta okunurluk perdesi: yazı kutusunun her yanından `pay` taşan, köşesi `yaricap` dolgu (kesin kenarlı). */
export const PERDE_GEOMETRISI = { pay: T(12), yaricap: T(18) } as const;

/** Yazı bloğunun yan payı (genişlik kesri): mihrapta kemerin içine daralır. */
export const yaziYanPayiKesri = (susTuru: DuvarKagidiAyari['sus']['tur']): number =>
  susTuru === 'mihrap' ? SUS_GEOMETRISI.mihrap.yaziYanPayi : YAZI_OLCULERI.yanBosluk / YAZI_TASARIM_GENISLIGI;

/** Süs opaklık çarpanı: varsayılan belirginlikte 1, 0'da görünmez, 1'de iki kat. */
export const susCarpani = (belirginlik: number): number => Math.max(0, belirginlik) / VARSAYILAN_SUS.belirginlik;

/** Beş köşeli yıldızın köşe noktaları (merkez cx, cy; dış/iç yarıçap). */
export function besKoseliYildiz(cx: number, cy: number, dis: number, ic: number): string {
  const noktalar: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? dis : ic;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    noktalar.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return noktalar.join(' ');
}

// --- Renkler -----------------------------------------------------------------------------

export interface DuvarRenkleri {
  /** Düz zeminin rengi; gök ve fotoğrafta `null` (sahne çizilir). */
  zemin: string | null;
  metin: string;
  kunye: string;
  kunyeOpaklik: number;
  atif: string;
  atifOpaklik: number;
  sus: string;
  susOpaklik: number;
  /** Fotoğrafta okunurluk açıkken yazının arkasındaki perde. */
  perde: { renk: string; opaklik: number } | null;
}

const ACIK = '#F1F8E9';
const KOYU = '#1F2A22';

const karistir = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const k = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((k(16) << 16) | (k(8) << 8) | k(0)).toString(16).padStart(6, '0')}`;
};

/** Orta tonlu palet rengi metin 4,5:1'i tutana kadar %10 adımla koyulaşır (Android `okunurPaletZemini`). */
export function okunurPaletZemini(palet: string): string {
  let zemin = palet;
  for (let i = 0; i < 10; i++) {
    if (Math.max(kontrastOrani(ACIK, zemin), kontrastOrani(KOYU, zemin)) >= 4.5) return zemin;
    zemin = karistir(zemin, '#000000', 0.1);
  }
  return zemin;
}

/** Metni zemine doğru en çok %35 karıştırır; 4,5:1 altına inmeden durur (Android `ikincilTon`). */
function ikincilTon(metin: string, zemin: string): string {
  for (let t = 0.35; t > 0; t = Math.round((t - 0.05) * 100) / 100) {
    const aday = karistir(metin, zemin, t);
    if (kontrastOrani(aday, zemin) >= 4.5) return aday;
  }
  return metin;
}

/**
 * Önizlemede fotoğrafın ortalama bağıl parlaklığı ÖLÇÜLMEZ (yeni native bağımlılık yok): orta
 * gri (0,18) karartmayla çarpılır. Asıl karar native çizicide, yazı kutusunun ortalamasıyla.
 */
export const fotoParlaklikTahmini = (karartma: number): number => 0.18 * (1 - karartma);

export function duvarRenkleri(ayar: Pick<DuvarKagidiAyari, 'zemin' | 'paletRenk' | 'foto'>): DuvarRenkleri {
  const z = ayar.zemin;
  if (z === 'gece')
    return { zemin: '#14211A', metin: ACIK, kunye: '#A5D6A7', kunyeOpaklik: 1, atif: '#81C784', atifOpaklik: 1, sus: '#FFFFFF', susOpaklik: 0.08, perde: null };
  if (z === 'kagit')
    return { zemin: '#F3F1EA', metin: KOYU, kunye: '#2E7D32', kunyeOpaklik: 1, atif: '#4E5B52', atifOpaklik: 1, sus: '#1B5E20', susOpaklik: 0.07, perde: null };
  if (z === 'palet') {
    const zemin = okunurPaletZemini(ayar.paletRenk);
    const acik = kontrastOrani(ACIK, zemin) >= kontrastOrani(KOYU, zemin);
    const metin = acik ? ACIK : KOYU;
    const ikincil = ikincilTon(metin, zemin);
    return { zemin, metin, kunye: ikincil, kunyeOpaklik: 1, atif: ikincil, atifOpaklik: 1, sus: acik ? '#FFFFFF' : '#000000', susOpaklik: 0.09, perde: null };
  }
  if (z === 'foto') {
    const karar = ayar.foto.okunurluk ? okunurlukKarari(fotoParlaklikTahmini(ayar.foto.karartma)) : null;
    const metin = karar?.metin ?? '#FFFFFF';
    return {
      zemin: null,
      metin,
      kunye: metin,
      kunyeOpaklik: 0.72,
      atif: metin,
      atifOpaklik: 0.55,
      sus: metin,
      susOpaklik: SUS_GEOMETRISI.yildiz.opaklik,
      perde: karar && karar.perdeOpakligi > 0 ? { renk: karar.perde, opaklik: karar.perdeOpakligi } : null,
    };
  }
  const metin = GOK_SAHNELERI[z].metin;
  return { zemin: null, metin, kunye: metin, kunyeOpaklik: 0.72, atif: metin, atifOpaklik: 0.55, sus: metin, susOpaklik: SUS_GEOMETRISI.yildiz.opaklik, perde: null };
}

/** Zemin bir vakit göğü mü? */
export const gokMu = (zemin: DuvarKagidiAyari['zemin']): zemin is DuvarGogu =>
  zemin === 'imsak' || zemin === 'kusluk' || zemin === 'ikindi' || zemin === 'aksam' || zemin === 'yatsi';

// --- Fotoğraf kırpması --------------------------------------------------------------------

/**
 * Fotoğraf ekranı KAPLAR (cover) ve `yakinlik` ile büyür; kırpma merkezi (x, y görsel kesri)
 * ekranın ortasına gelir, görsel kenarı ekranın içine girmez. Döner: görselin ekrandaki
 * sol/üst konumu ve boyutu (ekranla aynı birim).
 */
export function fotoYerlesimi(
  ekranG: number,
  ekranY: number,
  gorselG: number,
  gorselY: number,
  foto: Pick<DuvarFotoAyari, 'x' | 'y' | 'yakinlik'>
): { sol: number; ust: number; genislik: number; yukseklik: number } {
  const olcek = Math.max(ekranG / Math.max(1, gorselG), ekranY / Math.max(1, gorselY)) * Math.max(1, foto.yakinlik);
  const genislik = gorselG * olcek;
  const yukseklik = gorselY * olcek;
  const sol = Math.min(0, Math.max(ekranG - genislik, ekranG / 2 - foto.x * genislik));
  const ust = Math.min(0, Math.max(ekranY - yukseklik, ekranY / 2 - foto.y * yukseklik));
  return { sol, ust, genislik, yukseklik };
}

/** Sürükleme (ekran birimi dx, dy) sonrası kırpma merkezi; görsel ekranın dışına taşmaz. */
export function fotoKaydir(
  ekranG: number,
  ekranY: number,
  gorselG: number,
  gorselY: number,
  foto: Pick<DuvarFotoAyari, 'x' | 'y' | 'yakinlik'>,
  dx: number,
  dy: number
): { x: number; y: number } {
  const y0 = fotoYerlesimi(ekranG, ekranY, gorselG, gorselY, foto);
  const sinirla = (v: number, yari: number) => Math.min(1 - yari, Math.max(yari, v));
  return {
    x: sinirla(foto.x - dx / y0.genislik, ekranG / (2 * y0.genislik)),
    y: sinirla(foto.y - dy / y0.yukseklik, ekranY / (2 * y0.yukseklik)),
  };
}

// --- Yazı yerleşimi ----------------------------------------------------------------------

/** Ayarın ekranı: `ikisi`'nde düzenlenen ekran ayrıca seçilir. */
export const yerEkranlari = (yer: DuvarYeri): DuvarEkrani[] => (yer === 'ikisi' ? ['kilit', 'ana'] : [yer]);

export const istenenMerkez = (ayar: Pick<DuvarKagidiAyari, 'yazi'>, ekran: DuvarEkrani, platform: DuvarPlatformu): number =>
  (ekran === 'kilit' ? ayar.yazi.kilitY : ayar.yazi.anaY) ?? VARSAYILAN_MERKEZ[platform][ekran];

/**
 * Bloğun ekrandaki yeri. `yaziYerlesimi` bloğu sığdırabiliyorsa onun sonucu (küçültme 1);
 * hiçbir banda sığmıyorsa en geniş bandın üstüne oturur ve blok o banda sığacak kadar
 * küçültülür (önizleme; native çizici yazıyı küçültüp gerekirse Arapçayı düşürür).
 */
export function duvarYazisiYeri(
  merkez: number,
  blokYuksekligi: number,
  platform: DuvarPlatformu,
  ekran: DuvarEkrani
): { ust: number; merkez: number; kucultme: number } {
  const bantlar = IZINLI_BANTLAR[platform][ekran];
  const sonuc = yaziYerlesimi(merkez, blokYuksekligi, bantlar);
  if (sonuc) return { ust: sonuc.ust, merkez: sonuc.ust + blokYuksekligi / 2, kucultme: 1 };
  const enGenis = bantlar.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
  const kucultme = blokYuksekligi > 0 ? (enGenis[1] - enGenis[0]) / blokYuksekligi : 1;
  return { ust: enGenis[0], merkez: (enGenis[0] + enGenis[1]) / 2, kucultme };
}

/** Sürüklemede merkezin varsayılana oturma payı (ekran kesri). */
export const MERKEZ_MIKNATISI = 0.015;
/** Yatay sürüklemede hizanın değiştiği kayma (ekran genişliği kesri). */
export const HIZA_ESIGI = 0.12;

/**
 * Sürükleme: istenen merkez (parmak) → saklanacak merkez. Varsayılana `MERKEZ_MIKNATISI`
 * kadar yakınsa ona oturur (`oturdu`); sonra izinli banda kıstırılır (saat alanına girmez).
 */
export function surukleMerkezi(
  parmakMerkezi: number,
  blokYuksekligi: number,
  platform: DuvarPlatformu,
  ekran: DuvarEkrani
): { merkez: number; oturdu: boolean } {
  const varsayilan = VARSAYILAN_MERKEZ[platform][ekran];
  const oturdu = Math.abs(parmakMerkezi - varsayilan) < MERKEZ_MIKNATISI;
  const yer = duvarYazisiYeri(oturdu ? varsayilan : parmakMerkezi, blokYuksekligi, platform, ekran);
  return { merkez: Math.round(yer.merkez * 10000) / 10000, oturdu: oturdu && Math.abs(yer.merkez - varsayilan) < 1e-6 };
}

/**
 * Yatay sürükleme → hiza: blok merkezinin ekran ortasından kayması (genişlik kesri). Sola
 * kayma soldan sağa yazıda "baş", sağdan sola yazıda "son"dur.
 */
export function hizaSec(kayma: number, sagdanSola: boolean): YaziHizasi {
  if (Math.abs(kayma) < HIZA_ESIGI) return 'orta';
  const sola = kayma < 0;
  return sola !== sagdanSola ? 'bas' : 'son';
}

/** Yazının izinli bantlar DIŞINDA kalan dikey bölgeler (saat, alt simgeler, durum çubuğu). */
export function yasakBolgeler(platform: DuvarPlatformu, ekran: DuvarEkrani): [number, number][] {
  const sirali = [...IZINLI_BANTLAR[platform][ekran]].sort((a, b) => a[0] - b[0]);
  const sonuc: [number, number][] = [];
  let onceki = 0;
  for (const b of sirali) {
    if (b[0] > onceki) sonuc.push([onceki, b[0]]);
    onceki = Math.max(onceki, b[1]);
  }
  if (onceki < 1) sonuc.push([onceki, 1]);
  return sonuc;
}

// --- Hazır görünümler --------------------------------------------------------------------

export type DuvarHazirAdi = 'sade' | 'mihrap' | 'gece' | 'foto';
export const DUVAR_HAZIRLARI: readonly DuvarHazirAdi[] = ['sade', 'mihrap', 'gece', 'foto'];

/**
 * Hazır görünüm yalnız zemin, yazı tipi ve süsü değiştirir ("Gece" ayrıca vakte uymayı kapatır);
 * yer, Arapça, yazının konumu ve boyutu ve fotoğraf ayarı kalır. `foto` fotoğraf seçilmişse zemini fotoğrafa
 * çevirir (seçimi düzenleyici yapar).
 */
export function hazirUygula(ayar: DuvarKagidiAyari, ad: DuvarHazirAdi): DuvarKagidiAyari {
  switch (ad) {
    case 'sade':
      return { ...ayar, zemin: 'kagit', yazi: { ...ayar.yazi, tip: 'sade' }, sus: { ...ayar.sus, tur: 'yok' } };
    case 'mihrap':
      return { ...ayar, zemin: 'ikindi', yazi: { ...ayar.yazi, tip: 'klasik' }, sus: { ...ayar.sus, tur: 'mihrap' } };
    case 'gece':
      // Adı gece: gün içinde vakte göre başka göğe dönmesin.
      return { ...ayar, zemin: 'yatsi', vakteUysun: false, sus: { ...ayar.sus, tur: 'girih' } };
    case 'foto':
      return ayar.foto.dosya ? { ...ayar, zemin: 'foto' } : ayar;
  }
}

/** Uygulamanın kendi fotoğraf kopyasının adı: `duvar-foto-<özet>.jpg` (normalize kuralına uyar). */
export function fotoDosyaAdi(ozet: string): string {
  const temiz = ozet.replace(/[^0-9a-z]/g, '').slice(0, 24);
  return `duvar-foto-${temiz.length >= 8 ? temiz : temiz.padEnd(8, '0')}.jpg`;
}
