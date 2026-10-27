/**
 * Ayarlar ekranındaki her satırın mevcut değerini özetleyen saf fonksiyonlar.
 * Hiçbiri store/React/AsyncStorage/native modül import ETMEZ; girdiler
 * parametre olarak alınır (`AGENTS.md`: core saf kalmalı).
 */
import { bicim, metin, sayili } from '../dil/aktifDil';
import { konumMetniHesapla, type KonumMetniGirdisi } from './konumMetni';

/**
 * Konum satırının özetini üretir: konum metni + mod bilgisi.
 * örn. "Kadıköy, İstanbul · otomatik"
 */
export function konumOzeti(konum: KonumMetniGirdisi): string {
  const m = metin().ayarlar.ozet;
  return bicim(m.konum, { konum: konumMetniHesapla(konum), mod: konum.konumModu === 'oto' ? m.otomatik : m.manuel });
}

/** Takvim entegrasyonu satırının özeti. */
export function takvimOzeti(aktif: boolean): string {
  const m = metin().ayarlar.ozet;
  return aktif ? m.acik : m.kapali;
}

export interface MuhafizOzetiGirdisi {
  aktif: boolean;
  yogunluk: 'hafif' | 'normal' | 'yogun' | 'ozel';
}

/**
 * Muhafız satırının özeti. Ham `yogunluk` enum değeri doğrudan ekrana basılmaz
 * (ör. 'yogun' diakritiksiz görünür) — sözlükteki görünen ad kullanılır.
 */
export function muhafizOzeti(g: MuhafizOzetiGirdisi): string {
  const m = metin().ayarlar.ozet;
  if (!g.aktif) return m.kapali;
  if (g.yogunluk === 'ozel') return m.muhafizOzel;
  return bicim(m.muhafizDuzey, { duzey: m.yogunluk[g.yogunluk] });
}

/**
 * Vakit bildirimleri satırının özeti.
 * `acikSayisi`: açık vakit bildirimi sayısı — çağıran hesaplar (bu dosya
 * hangi alanların "vakit" sayıldığına karar vermez, yalnız sayıyı biçimler).
 */
export function bildirimOzeti(acikSayisi: number, cumaAktif: boolean): string {
  const m = metin().ayarlar.ozet;
  if (acikSayisi === 0) {
    return cumaAktif ? m.yalnizCuma : m.kapali;
  }
  const temel = sayili(m.vakitSayisi, acikSayisi);
  return cumaAktif ? bicim(m.cumaAcik, { temel }) : temel;
}

export interface SeriOzetiGirdisi {
  tamGunEsigi: number;
  gunSonuBildirimAktif: boolean;
}

/**
 * Seri hedefi satırının özeti. Gün sonu hatırlatması Dalga 3'te Hatırlatmalar'a
 * taşındı (`gunSonuBildirimAktif` artık burada gösterilmez; alan geriye uyum için kalır).
 */
export function seriOzeti(g: SeriOzetiGirdisi): string {
  return sayili(metin().ayarlar.ozet.tamGun, g.tamGunEsigi);
}

/** Nafile namazlar satırının özeti (issue #77). */
export function nafileOzeti(g: {
  kusluk: boolean;
  evvabin: boolean;
  teheccud: boolean;
  gosterge: boolean;
}): string {
  // [açık mı, sözlük anahtarı] — cümle başı `adlar`, cümle içi `kucuk`: büyük/küçük
  // harf dönüşümü YAPILMAZ (AGENTS.md toUpperCase/toLowerCase tuzağı).
  const s = metin();
  const acik = (
    [
      [g.kusluk, 'kusluk'],
      [g.evvabin, 'evvabin'],
      [g.teheccud, 'teheccud'],
    ] as const
  ).filter(([a]) => a);
  if (acik.length === 0) return g.gosterge ? s.ayarlar.ozet.nafileGosterge : s.ayarlar.ozet.kapali;
  const adlar = acik.map(([, k], i) => (i === 0 ? s.nafile.adlar[k] : s.nafile.kucuk[k]));
  return sayili(s.ayarlar.ozet.nafileAcik, adlar.length, { adlar: adlar.join(', ') });
}

/** Ramazan (iftar/sahur sayacı) satırının özeti. */
export function ramazanOzeti(iftarAktif: boolean, sahurAktif: boolean): string {
  const m = metin().ayarlar.ozet;
  if (iftarAktif && sahurAktif) return m.iftarSahur;
  if (iftarAktif) return m.iftar;
  if (sahurAktif) return m.sahur;
  return m.kapali;
}

/**
 * Görünüm (tema) satırının özeti.
 * DİKKAT: `temaModu` ÇÖZÜLMÜŞ moddur (`useTema().tema.mod`, 'acik'|'koyu') —
 * 'sistem' de içerebilen `useTema().mod` DEĞİLDİR.
 */
export function gorunumOzeti(temaModu: 'acik' | 'koyu', paletAdi: string): string {
  const m = metin().ayarlar.ozet;
  return bicim(m.gorunum, { tema: temaModu === 'koyu' ? m.koyuTema : m.acikTema, palet: paletAdi });
}

/**
 * Yedekleme satırının özeti.
 * `simdi` ZORUNLU parametredir — "aynı yıl" kuralı bugünün yılına bağlı,
 * fonksiyon içinde `new Date()` çağırmak testi yılbaşında kırardı.
 */
export function yedeklemeOzeti(sonDisaAktarmaISO: string | null, simdi: Date): string {
  const s = metin();
  const m = s.ayarlar.ozet;
  if (!sonDisaAktarmaISO) return m.disaAktarilmadi;
  const tarih = new Date(sonDisaAktarmaISO);
  if (Number.isNaN(tarih.getTime())) return m.disaAktarilmadi;
  const degerler = { gun: tarih.getDate(), ay: s.tarih.aylar[tarih.getMonth()], yil: tarih.getFullYear() };
  const ayniYilMi = tarih.getFullYear() === simdi.getFullYear();
  return bicim(m.sonDisaAktarma, { tarih: bicim(ayniYilMi ? m.tarihYilsiz : s.tarih.uzun, degerler) });
}

/** Hakkında satırının özeti. */
export function hakkindaOzeti(surum: string, guncellemeVar: boolean): string {
  const m = metin().ayarlar.ozet;
  return bicim(m.surum, { surum, durum: guncellemeVar ? m.guncellemeVar : m.guncel });
}
