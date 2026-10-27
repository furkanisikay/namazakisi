/**
 * Kaza Defteri 2.0 — ekran metinleri ve kaynak görünümü (SAF; React'e bağlı değil).
 *
 * Metinler sözlükten (`kaza` ad alanı, etkin dil; kibar "siz"); vakit adları da
 * sözlükten (`toUpperCase` / `toLowerCase` YOK — 'İ' bozulur). Fonksiyonlar her
 * çağrıda etkin dili okur. Kaynak renkleri yalnız DEKORATİF (ikon +
 * çip zemini); metin daima tema metnidir.
 */

import { ayAdiniAl, ISOTarihiDateNesnesiNeCevir, tarihiISOFormatinaCevir, gunEkle } from '../../../core/utils/TarihYardimcisi';
import { kazaVaktiGoster, type KazaVakti } from '../../../core/kaza/kazaHareketi';
import type { GecmisSatiri, GecmisTuru, TemizlikKaynagi } from '../../../core/kaza/kazaDefteriHesabi';
import { bicim, canli, metin, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import type { Sozluk } from '../../../core/dil/sozluk/tr';

/** Tema renk anahtarı (useRenkler alanı) — hardcoded renk YOK. */
export type KaynakRenkAnahtari = 'bilgi' | 'vurgu' | 'dikkat' | 'basarili' | 'birincil' | 'uyari' | 'metinIkincil';

export interface KaynakGorunumu {
  ikon: string;
  renk: KaynakRenkAnahtari;
  /** Süzgeç çipi etiketi (etkin dilde; okunduğu an çözülür). */
  readonly etiket: string;
}

type KaynakAnahtari = keyof Sozluk['kaza']['kaynak'];

/** Etiketi okunduğu an etkin dilden çözen görünüm. */
function gorunum(ikon: string, renk: KaynakRenkAnahtari, anahtar: KaynakAnahtari): KaynakGorunumu {
  return {
    ikon,
    renk,
    get etiket() {
      return metin().kaza.kaynak[anahtar];
    },
  };
}

export const KAYNAK_GORUNUMU: Record<GecmisTuru, KaynakGorunumu> = {
  otomatik: gorunum('robot', 'bilgi', 'otomatik'),
  otomatikGeri: gorunum('undo', 'basarili', 'otomatik'),
  manuel: gorunum('pen', 'vurgu', 'elle'),
  bildirim: gorunum('bell', 'dikkat', 'bildirimden'),
  kilindi: gorunum('check', 'basarili', 'kilinan'),
  duzeltme: gorunum('sliders-h', 'uyari', 'duzeltme'),
  taban: gorunum('calculator', 'birincil', 'hesaplama'),
  temizlik: gorunum('broom', 'metinIkincil', 'temizlik'),
  temizlikGeriAl: gorunum('undo', 'metinIkincil', 'temizlik'),
  gunKarari: gorunum('calendar-check', 'bilgi', 'gunKarari'),
  otoAyar: gorunum('robot', 'bilgi', 'otomatik'),
  eskiGorunum: gorunum('sync-alt', 'basarili', 'esitleme'),
};

export const TEMIZLIK_KAYNAK_ETIKETI: Readonly<Record<TemizlikKaynagi, string>> = canli((s) => ({
  otomatik: s.kaza.kaynak.otomatik,
  manuel: s.kaza.kaynak.elle,
  bildirim: s.kaza.kaynak.bildirimden,
  kilindi: s.kaza.kaynak.kilinan,
  duzeltme: s.kaza.kaynak.duzeltme,
}));

/** Cümle içi küçük harfli kaynak adı (sözlük — `toLowerCase` 'İ'yi bozar). */
export const TEMIZLIK_KAYNAK_KUCUK: Readonly<Record<TemizlikKaynagi, string>> = canli((s) => ({
  otomatik: s.kaza.kaynakKucuk.otomatik,
  manuel: s.kaza.kaynakKucuk.elle,
  bildirim: s.kaza.kaynakKucuk.bildirimden,
  kilindi: s.kaza.kaynakKucuk.kilinan,
  duzeltme: s.kaza.kaynakKucuk.duzeltme,
}));

/** Geçmiş süzgeç çipleri (Tümü hariç). */
export type GecmisSuzgeci = 'tumu' | 'otomatik' | 'manuel' | 'bildirim' | 'kilindi' | 'taban';

function suzgec(id: GecmisSuzgeci, anahtar: KaynakAnahtari): { id: GecmisSuzgeci; readonly etiket: string } {
  return {
    id,
    get etiket() {
      return metin().kaza.kaynak[anahtar];
    },
  };
}

export const GECMIS_SUZGECLERI: ReadonlyArray<{ id: GecmisSuzgeci; readonly etiket: string }> = [
  suzgec('tumu', 'tumu'),
  suzgec('otomatik', 'otomatik'),
  suzgec('manuel', 'elle'),
  suzgec('bildirim', 'bildirimden'),
  suzgec('kilindi', 'kilinan'),
  suzgec('taban', 'hesaplama'),
];

export function suzgeceUyarMi(satir: GecmisSatiri, s: GecmisSuzgeci): boolean {
  if (s === 'tumu') return true;
  if (s === 'otomatik') return satir.tur === 'otomatik' || satir.tur === 'otomatikGeri' || satir.tur === 'otoAyar';
  return satir.tur === s;
}

/** '2026-10-14' → '14 Ekim' / '14 October'. */
export function gunMetni(iso: string): string {
  const t = ISOTarihiDateNesnesiNeCevir(iso);
  return Number.isFinite(t.getTime()) ? bicim(metin().kaza.gunAy, { gun: t.getDate(), ay: ayAdiniAl(t.getMonth()) }) : iso;
}

/** ISO zaman → yerel 'HH:mm'. */
export function saatMetni(zaman: string): string {
  const t = new Date(zaman);
  if (!Number.isFinite(t.getTime())) return '';
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

/** Geçmiş gün başlığı: 'BUGÜN · 15 EKİM' gibi değil — sentence case: 'Bugün · 15 Ekim'. */
export function gunBasligi(zaman: string, bugun: Date = new Date()): string {
  const gun = tarihiISOFormatinaCevir(new Date(zaman));
  const bugunIso = tarihiISOFormatinaCevir(bugun);
  const m = metin().kaza.satir;
  if (gun === bugunIso) return bicim(m.bugun, { gun: gunMetni(gun) });
  if (gun === gunEkle(bugunIso, -1)) return bicim(m.dun, { gun: gunMetni(gun) });
  return gunMetni(gun);
}

export const vakitAdi = (v: KazaVakti | undefined): string => (v ? kazaVaktiGoster(v) : '');

/** Geçmiş satırının başlığı. */
export function satirBasligi(s: GecmisSatiri): string {
  const ad = vakitAdi(s.vakit);
  const h = s.hareket;
  const m = metin().kaza.satir;
  switch (s.tur) {
    case 'otomatik':
      return bicim(m.otomatik, { ad });
    case 'otomatikGeri':
      return bicim(m.otomatikGeri, { ad });
    case 'manuel':
      return bicim(m.manuel, { ad });
    case 'bildirim':
      return bicim(m.bildirim, { ad });
    case 'kilindi':
      return bicim(h?.gocmis ? m.kilindiGocmis : m.kilindi, { ad });
    case 'duzeltme':
      return bicim((h?.adet ?? 0) < 0 ? m.fazlaSifirlandi : m.duzeltme, { ad });
    case 'taban':
      return h?.gocmis ? m.tabanGocmis : m.taban;
    case 'temizlik':
      return sayili(m.temizlik, h?.hedefIdler?.length ?? 0);
    case 'temizlikGeriAl':
      return metin().kaza.temizlikGeriAlindi;
    case 'gunKarari':
      return h?.karar === 'ekle' ? m.gunEklendi : m.gunYokSayildi;
    case 'otoAyar':
      return h?.aktif ? m.otoAcildi : m.otoKapatildi;
    case 'eskiGorunum':
      return m.eskiGorunum;
    default:
      return '';
  }
}

/** Geçmiş satırının alt satırı. */
export function satirAltMetni(s: GecmisSatiri, cihaz: string | null): string {
  const m = metin().kaza.satir;
  const parcalar: string[] = [];
  if (s.gun) parcalar.push(s.tur === 'gunKarari' ? gunMetni(s.gun) : bicim(m.namazi, { gun: gunMetni(s.gun) }));
  if (s.hareket?.not) parcalar.push(`"${s.hareket.not}"`);
  if (s.tur === 'taban' && s.hareket?.taban) {
    const toplam = Object.values(s.hareket.taban).reduce((t, n) => t + n, 0);
    parcalar.push(bicim(m.tabanToplam, { n: sayiYaz(toplam) }));
  }
  if (s.tur === 'otoAyar' && s.hareket?.gun) parcalar.push(bicim(m.itibariyla, { gun: gunMetni(s.hareket.gun) }));
  parcalar.push(saatMetni(s.zaman));
  if (s.cihaz && cihaz) parcalar.push(s.cihaz === cihaz ? m.buCihaz : m.baskaCihaz);
  else if (!s.cihaz && s.tur === 'otomatik') parcalar.push(m.otoTarama);
  return parcalar.filter(Boolean).join(' · ');
}

/** Kalana etki metni: '+1', '−2', '=' (taban), '' (bilgi satırı). */
export function deltaMetni(s: GecmisSatiri): string {
  if (s.tur === 'taban') return '=';
  if (s.delta === null || s.delta === 0) return '';
  return s.delta > 0 ? `+${s.delta}` : `−${Math.abs(s.delta)}`;
}

/** Satırın erişilebilirlik etiketi. */
export function satirErisimEtiketi(s: GecmisSatiri, cihaz: string | null): string {
  const m = metin().kaza.satir;
  const delta = deltaMetni(s);
  const etki = delta && delta !== '=' ? bicim(m.etki, { delta: delta.replace('−', m.eksi) }) : '';
  const gizli = s.gizli ? m.gizlenmisErisim : '';
  return bicim(m.erisim, { baslik: satirBasligi(s), alt: satirAltMetni(s, cihaz), etki, gizli });
}
