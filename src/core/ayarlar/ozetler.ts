/**
 * Ayarlar ekranındaki her satırın mevcut değerini özetleyen saf fonksiyonlar.
 * Hiçbiri store/React/AsyncStorage/native modül import ETMEZ; girdiler
 * parametre olarak alınır (`AGENTS.md`: core saf kalmalı).
 */
import { konumMetniHesapla, type KonumMetniGirdisi } from './konumMetni';

const AY_ADLARI = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

/**
 * Konum satırının özetini üretir: konum metni + mod bilgisi.
 * örn. "Kadıköy, İstanbul · otomatik"
 */
export function konumOzeti(konum: KonumMetniGirdisi): string {
  const mod = konum.konumModu === 'oto' ? 'otomatik' : 'manuel';
  return `${konumMetniHesapla(konum)} · ${mod}`;
}

/** Takvim entegrasyonu satırının özeti. */
export function takvimOzeti(aktif: boolean): string {
  return aktif ? 'Açık' : 'Kapalı';
}

export interface MuhafizOzetiGirdisi {
  aktif: boolean;
  yogunluk: 'hafif' | 'normal' | 'yogun' | 'ozel';
}

/** Muhafız satırının özeti. */
export function muhafizOzeti(g: MuhafizOzetiGirdisi): string {
  if (!g.aktif) return 'Kapalı';
  if (g.yogunluk === 'ozel') return 'Açık · özel ayarlar';
  return `Açık · ${g.yogunluk} yoğunluk`;
}

/**
 * Vakit bildirimleri satırının özeti.
 * `vakitler`: vakit adı -> bildirim açık mı.
 */
export function bildirimOzeti(vakitler: Record<string, boolean>, cumaAktif: boolean): string {
  const acikSayisi = Object.values(vakitler).filter(Boolean).length;
  if (acikSayisi === 0) {
    return cumaAktif ? 'Yalnız cuma hatırlatması' : 'Kapalı';
  }
  const temel = `${acikSayisi} vakit`;
  return cumaAktif ? `${temel} · cuma hatırlatması açık` : temel;
}

export interface SeriOzetiGirdisi {
  tamGunEsigi: number;
  gunSonuBildirimAktif: boolean;
}

/** Seri/puanlama ayarları satırının özeti. */
export function seriOzeti(g: SeriOzetiGirdisi): string {
  const gunSonu = g.gunSonuBildirimAktif ? 'gün sonu açık' : 'gün sonu kapalı';
  return `Tam gün: ${g.tamGunEsigi} namaz · ${gunSonu}`;
}

/** Ramazan (iftar/sahur sayacı) satırının özeti. */
export function ramazanOzeti(iftarAktif: boolean, sahurAktif: boolean): string {
  if (iftarAktif && sahurAktif) return 'İftar ve sahur sayacı açık';
  if (iftarAktif) return 'İftar sayacı açık';
  if (sahurAktif) return 'Sahur sayacı açık';
  return 'Kapalı';
}

/**
 * Görünüm (tema) satırının özeti.
 * DİKKAT: `temaModu` ÇÖZÜLMÜŞ moddur (`useTema().tema.mod`, 'acik'|'koyu') —
 * 'sistem' de içerebilen `useTema().mod` DEĞİLDİR.
 */
export function gorunumOzeti(temaModu: 'acik' | 'koyu', paletAdi: string): string {
  const temaEtiketi = temaModu === 'koyu' ? 'Koyu tema' : 'Açık tema';
  return `${temaEtiketi} · ${paletAdi}`;
}

/**
 * Yedekleme satırının özeti.
 * `simdi` ZORUNLU parametredir — "aynı yıl" kuralı bugünün yılına bağlı,
 * fonksiyon içinde `new Date()` çağırmak testi yılbaşında kırardı.
 */
export function yedeklemeOzeti(sonDisaAktarmaISO: string | null, simdi: Date): string {
  if (!sonDisaAktarmaISO) return 'Henüz dışa aktarılmadı';
  const tarih = new Date(sonDisaAktarmaISO);
  const gun = tarih.getDate();
  const ay = AY_ADLARI[tarih.getMonth()];
  const ayniYilMi = tarih.getFullYear() === simdi.getFullYear();
  const yilKismi = ayniYilMi ? '' : ` ${tarih.getFullYear()}`;
  return `Son dışa aktarma: ${gun} ${ay}${yilKismi}`;
}

/** Hakkında satırının özeti. */
export function hakkindaOzeti(surum: string, guncellemeVar: boolean): string {
  return `Sürüm ${surum} · ${guncellemeVar ? 'güncelleme var' : 'güncel'}`;
}
