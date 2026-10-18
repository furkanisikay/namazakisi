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

/**
 * Ham `yogunluk` enum değeri doğrudan ekrana basılmaz (ör. 'yogun' diakritiksiz
 * görünür) — görünen ad haritası kullanılır.
 */
const YOGUNLUK_GORUNEN_ADLARI: Record<'hafif' | 'normal' | 'yogun', string> = {
  hafif: 'hafif',
  normal: 'normal',
  yogun: 'yoğun',
};

/** Muhafız satırının özeti. */
export function muhafizOzeti(g: MuhafizOzetiGirdisi): string {
  if (!g.aktif) return 'Kapalı';
  if (g.yogunluk === 'ozel') return 'Açık · özel ayarlar';
  return `Açık · ${YOGUNLUK_GORUNEN_ADLARI[g.yogunluk]} yoğunluk`;
}

/**
 * Vakit bildirimleri satırının özeti.
 * `acikSayisi`: açık vakit bildirimi sayısı — çağıran hesaplar (bu dosya
 * hangi alanların "vakit" sayıldığına karar vermez, yalnız sayıyı biçimler).
 */
export function bildirimOzeti(acikSayisi: number, cumaAktif: boolean): string {
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

/**
 * Seri hedefi satırının özeti. Gün sonu hatırlatması Dalga 3'te Hatırlatmalar'a
 * taşındı (`gunSonuBildirimAktif` artık burada gösterilmez; alan geriye uyum için kalır).
 */
export function seriOzeti(g: SeriOzetiGirdisi): string {
  return `Tam gün: ${g.tamGunEsigi} namaz`;
}

/** Nafile namazlar satırının özeti (issue #77). */
export function nafileOzeti(g: {
  kusluk: boolean;
  evvabin: boolean;
  teheccud: boolean;
  gosterge: boolean;
}): string {
  // [açık mı, cümle başı, cümle içi] — sabit adlar: Türkçe büyük/küçük harf
  // dönüşümü YAPILMAZ (AGENTS.md toUpperCase/toLowerCase tuzağı).
  const acik = (
    [
      [g.kusluk, 'Kuşluk', 'kuşluk'],
      [g.evvabin, 'Evvâbîn', 'evvâbîn'],
      [g.teheccud, 'Teheccüd', 'teheccüd'],
    ] as const
  ).filter(([a]) => a);
  if (acik.length === 0) return g.gosterge ? 'Ana ekranda gösteriliyor' : 'Kapalı';
  const adlar = acik.map(([, bas, ic], i) => (i === 0 ? bas : ic));
  return `${adlar.join(', ')} hatırlatması açık`;
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
  if (Number.isNaN(tarih.getTime())) return 'Henüz dışa aktarılmadı';
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
