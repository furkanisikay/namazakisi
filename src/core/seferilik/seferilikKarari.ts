/**
 * Seferîlik bilgi kartı — saf gösterim kararı (issue #296).
 *
 * Kart HÜKÜM VERMEZ ("seferîsiniz" demez): ikamet yerinden kuş uçuşu ≈90 km
 * uzaklaşınca "yolculuktasınız gibi görünüyor" bilgisi verir. Dinî ölçü yola
 * çıkış niyeti ve gidilen yerdir (DİYK "Seferîliğin başlangıcı"); kuş uçuşu
 * mesafe karayolundan kısa olduğu için eşik ihtiyatlı taraftadır — kart
 * gereğinden geç çıkabilir, erken çıkmaz.
 *
 * Kaynaklar: `docs/superpowers/specs/2026-10-13-seferilik-bilgi-karti-kaynaklar.md`.
 */
import { mesafeHesapla } from '../utils/MesafeHesaplayici';
import { konumAdiMetni } from '../konum/konumDegisimBildirimi';
import {
  gecerliKoordinatMi,
  type IkametYeri,
  type Mezhep,
  type SeferilikAyarlari,
  type SeferilikKartHafizasi,
} from './seferilikAyarlari';

/**
 * Sefer mesafesi (km). DİYK: Hanefî "en az doksan km", Şâfiî "yaklaşık 90 km"
 * (vatan-ı aslî/ikamet/süknâ fetvası). İki mezhepte de birincil metin aynı
 * ölçüyü verir; değişirse kaynak notunu da güncelleyin.
 */
export const SEFER_MESAFESI_KM: Record<Mezhep, number> = {
  hanefi: 90,
  safii: 90,
};

/**
 * "Yolculuk bitti" eşiği (km). Kapatma hafızası ancak ikamete bu kadar
 * yaklaşınca sıfırlanır. Eşiğin hemen altında (ör. 89 km) sıfırlamak, 90 km
 * çizgisinde gidip gelen kullanıcıya kartı tekrar tekrar gösterirdi (titreme).
 */
export const YOLCULUK_BITIS_KM = 30;

export interface Koordinat {
  lat: number;
  lng: number;
}

export interface SeferilikGirdisi {
  ayarlar: SeferilikAyarlari;
  hafiza: SeferilikKartHafizasi;
  /** Uygulamanın şu an kullandığı konum (yoksa/geçersizse karar verilmez). */
  konum: Koordinat | null | undefined;
  /** İlk konum ikamet olarak yazılacaksa gösterim adı. */
  konumAdi?: string;
}

export interface SeferilikSonucu {
  /** Ana ekranda kart gösterilsin mi? */
  kartGoster: boolean;
  /** İkamete kuş uçuşu uzaklık (km); karar verilemediyse null. */
  mesafeKm: number | null;
  /** Mesafe sefer eşiğini aşıyor mu? (kart kapalı olsa da hesaplanır) */
  yolculukta: boolean;
  /** İkamet hiç yoksa yazılacak ilk konum; değilse null. */
  yeniIkamet: IkametYeri | null;
  /** Kapatma hafızası sıfırlanmalı mı? (ikamete dönüldü) */
  hafizaSifirla: boolean;
}

/** İki nokta arası kuş uçuşu uzaklık (km). */
export function ikametUzakligiKm(ikamet: Koordinat, konum: Koordinat): number {
  return mesafeHesapla(ikamet.lat, ikamet.lng, konum.lat, konum.lng) / 1000;
}

/**
 * Tek karar noktası. Hem ana ekran kartı hem arka plan (konum değişimi
 * yayma listesi) aynı kurala bakar.
 *
 * - Konum geçersiz → hiçbir şey yapma (ilk açılışta `{0,0}` nöbetçisi).
 * - İkamet yok → konumu ikamet olarak öner, kart yok (kıyaslanacak bir yer yok).
 * - Mesafe ≥ eşik → yolculukta; kart açık ve bu yolculukta kapatılmadıysa göster.
 * - Mesafe < `YOLCULUK_BITIS_KM` → yolculuk bitti; kapatma hafızasını sıfırla.
 */
export function seferilikDurumunuHesapla(g: SeferilikGirdisi): SeferilikSonucu {
  const bos: SeferilikSonucu = {
    kartGoster: false,
    mesafeKm: null,
    yolculukta: false,
    yeniIkamet: null,
    hafizaSifirla: false,
  };
  if (!gecerliKoordinatMi(g.konum)) return bos;
  const konum = g.konum;

  if (!g.ayarlar.ikamet) {
    const yeniIkamet: IkametYeri = { lat: konum.lat, lng: konum.lng, kaynak: 'ilkKonum' };
    const ad = g.konumAdi?.trim();
    if (ad) yeniIkamet.ad = ad;
    return { ...bos, yeniIkamet };
  }

  const mesafeKm = ikametUzakligiKm(g.ayarlar.ikamet, konum);
  const yolculukta = mesafeKm >= SEFER_MESAFESI_KM[g.ayarlar.mezhep];
  const hafizaSifirla = mesafeKm < YOLCULUK_BITIS_KM && g.hafiza.yolculuktaKapatildi;
  return {
    kartGoster: yolculukta && g.ayarlar.kartAcik && !g.hafiza.yolculuktaKapatildi,
    mesafeKm,
    yolculukta,
    yeniIkamet: null,
    hafizaSifirla,
  };
}

/** Gösterim için yuvarlanmış mesafe: 100 km altında 1, üstünde 5 km'lik adım. */
export function mesafeYuvarla(km: number): number {
  if (!Number.isFinite(km) || km < 0) return 0;
  if (km < 100) return Math.round(km);
  return Math.round(km / 5) * 5;
}

/** "1.250" gibi binlik ayraçlı yazım (Intl/ICU'ya bağlı değil — Hermes). */
export function kmMetni(km: number): string {
  return String(mesafeYuvarla(km)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Diskteki konum kaydının (`KONUM_AYARLARI`) kartın okuduğu alanları. Tip
 * yerelleştirilmiştir — `src/core/` veri katmanına bağımlı olamaz.
 */
export interface KonumKaydiGirdisi {
  konumModu?: unknown;
  koordinatlar?: { lat?: unknown; lng?: unknown } | null;
  gpsAdres?: { ilce?: unknown; il?: unknown } | null;
  seciliIlAdi?: unknown;
  seciliIlceAdi?: unknown;
}

const dize = (d: unknown): string => (typeof d === 'string' ? d.trim() : '');

/**
 * Konum kaydından gösterim adı: otomatik modda GPS adresi, manuel modda seçili
 * ilçe/il (`konumMetniHesapla` ile aynı kaynak sırası; oto modda `seciliIlAdi`
 * BAYATTIR, okunmaz). Ad yoksa `undefined` ("Konum takip ediliyor" gibi durum
 * metinleri ad sayılmaz).
 */
export function konumKaydindanAd(kayit: KonumKaydiGirdisi): string | undefined {
  if (kayit.konumModu === 'oto') {
    const gps = kayit.gpsAdres;
    if (!gps) return undefined;
    const ad = konumAdiMetni({ ilce: dize(gps.ilce), il: dize(gps.il) });
    return ad || undefined;
  }
  const ilce = dize(kayit.seciliIlceAdi);
  const il = dize(kayit.seciliIlAdi);
  if (ilce && il) return `${ilce}, ${il}`;
  return il || ilce || undefined;
}
