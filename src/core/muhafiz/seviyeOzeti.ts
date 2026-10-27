/**
 * Adim (seviye) OZETI — yapisal veri + ekran okuyucu cumlesi.
 *
 * GORSEL DIL (sahip geri bildirimi 2026-10): ozet artik `·` ile birlestirilmis bir metin
 * DEGILDIR ("20 dk kala · bildirim + sesli okuma · titreşim · alarm" kisaltma yiginiydi).
 * Ekran zamani buyuk yazar, kanallari ikon cipiyle (`OzetCipleri`), tekrari kucuk bir
 * rozetle, tonu renkle gosterir. Bu dosya o resmin VERISINI (`adimOzetiOlustur`) ve
 * ekran okuyucunun okudugu TAM cumleyi (`seviyeOzetiOlustur`) uretir — bilgi hicbir
 * zaman yalniz ikonla verilmez.
 *
 * SAF: store/React import etmez.
 */
import type { SeviyeAyari, SeviyeKademe } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { sesGorunenAdi } from './sesKimligi';
import { adimKapaliMi, kanalAcikMi } from './kanalKumesi';
import { gercekTekrarDk } from './planButcesi';
import { bicim, canli, metin } from '../dil/aktifDil';

/** Ozette gosterilen kanallar — GOSTERIM SIRASI budur (bildirim, sesli, titresim, alarm). */
export type OzetKanali = 'bildirim' | 'sesli' | 'titresim' | 'alarm';

export const OZET_KANAL_SIRASI: readonly OzetKanali[] = ['bildirim', 'sesli', 'titresim', 'alarm'];

/** Kanalin cumle icindeki adi (kucuk harf; Turkce `toLowerCase` tuzagi yok — sabit). */
export const OZET_KANAL_ADLARI: Readonly<Record<OzetKanali, string>> = canli((s) => s.muhafizAyar.ozet.kanal);

export interface AdimOzeti {
  /** Hicbir kanal acik degil — "Kapali" (motorun dili: uyari GELMEZ). */
  kapali: boolean;
  /** Buyuk yazilan zaman: "45 dk kala" / "girişten 15 dk sonra". */
  zaman: string;
  /** Acik kanallar, `OZET_KANAL_SIRASI` sirasinda. */
  kanallar: OzetKanali[];
  /** Bildirim sesi adi — yalniz bildirim aciksa. Ham `content://` ASLA. */
  sesAdi?: string;
  /** Tekrar araligi (dk) — yalniz tekrarliysa. */
  tekrarDk?: number;
  /** Kayittaki ton (renk icin; ekran ETKIN tonu `etkinKademe` ile ayrica bulur). */
  kademe: SeviyeKademe;
}

/**
 * Esigin okunan hali — yone gore. Cikista esik "cikisa kalan", giriste
 * "girisinden gecen" dakikadir; ayni sayi iki yonde ZIT ani gosterir.
 * Kullaniciya donuk metin (kibar "siz" kaydi, cumle parcasi).
 */
export const esikIfadesi = (esikDk: number, yon: PencereYonu): string =>
  bicim(yon === 'girisindenItibaren' ? metin().muhafizAyar.ozet.esikGiris : metin().muhafizAyar.ozet.esikCikis, { dk: esikDk });

/** Kanal kumesinden acik kanallari GOSTERIM sirasinda cikarir. */
export function acikOzetKanallari(kanallar: SeviyeAyari['kanallar'] | undefined): OzetKanali[] {
  return OZET_KANAL_SIRASI.filter((k) => kanalAcikMi(kanallar, k));
}

/** Tekrarın GERÇEKTEN doğup doğmadığını bilmek için bağlam (kardeş adımlar + pencere). */
export interface OzetBaglami {
  kardesler?: SeviyeAyari[];
  pencereUzunluguDk?: number;
}

export function adimOzetiOlustur(
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
  baglam: OzetBaglami = {}
): AdimOzeti {
  const kapali = adimKapaliMi(seviye.kanallar);
  const kanallar = kapali ? [] : acikOzetKanallari(seviye.kanallar);
  const ozet: AdimOzeti = { kapali, zaman: esikIfadesi(seviye.esikDk, yon), kanallar, kademe: seviye.kademe };
  if (kanallar.includes('bildirim')) ozet.sesAdi = sesGorunenAdi(seviye.bildirimSesi, seviye.sesAdi);
  // Rozet yalnız GERÇEK tekrarda: aralık segmentten küçük değilse ikinci tetik hiç doğmaz
  // (hazır düzeylerin 'birkez' türevi herDk = esikDk böyledir).
  const tekrar = kapali
    ? null
    : gercekTekrarDk(seviye, baglam.kardesler ?? [seviye], yon, baglam.pencereUzunluguDk);
  if (tekrar !== null) ozet.tekrarDk = tekrar;
  return ozet;
}

/** "bildirim", "bildirim ve titreşim", "bildirim, sesli okuma ve titreşim". */
export function kanalListesiMetni(kanallar: readonly OzetKanali[], sesAdi?: string): string {
  const o = metin().muhafizAyar.ozet;
  const adlar = kanallar.map((k) =>
    k === 'bildirim' && sesAdi ? bicim(o.kanalSesli, { kanal: o.kanal.bildirim, ses: sesAdi }) : o.kanal[k]
  );
  if (adlar.length <= 1) return adlar[0] ?? '';
  return bicim(o.listeSon, { bas: adlar.slice(0, -1).join(', '), son: adlar[adlar.length - 1] });
}

/**
 * Ekran okuyucu (ve test) icin TAM cumle. Ornekler:
 *   "45 dk kala: bildirim (Uygulama sesi)"
 *   "15 dk kala: bildirim (Melodi 3), sesli okuma ve gerçek alarm; 5 dakikada bir tekrarlanır"
 *   "Kapalı — uyarı almazsınız"
 *
 * Motorun ic dili "hicbir kanal acik degil"dir; kullaniciya "Kapali" denir. "Sessiz"
 * demek, bildirimin gelip ses cikarmadigi durumla karisiyordu. "bildirim" degil "uyari":
 * adim yalnizca sesli anonsla da kurulmus olabilir.
 */
export function seviyeOzetiOlustur(
  seviye: SeviyeAyari,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
  baglam: OzetBaglami = {}
): string {
  const ozet = adimOzetiOlustur(seviye, yon, baglam);
  const o = metin().muhafizAyar.ozet;
  if (ozet.kapali) return o.kapali;
  const govde = `${ozet.zaman}: ${kanalListesiMetni(ozet.kanallar, ozet.sesAdi)}`;
  return ozet.tekrarDk ? bicim(o.tekrar, { govde, dk: ozet.tekrarDk }) : govde;
}
