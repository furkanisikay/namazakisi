/**
 * Kaza Defteri 2.0 — ekran metinleri ve kaynak görünümü (SAF; React'e bağlı değil).
 *
 * Metinler kibar "siz" dilinde; vakit adları sabit haritadan (`toUpperCase` /
 * `toLowerCase` YOK — 'İ' bozulur). Kaynak renkleri yalnız DEKORATİF (ikon +
 * çip zemini); metin daima tema metnidir.
 */

import { ayAdiniAl, ISOTarihiDateNesnesiNeCevir, tarihiISOFormatinaCevir, gunEkle } from '../../../core/utils/TarihYardimcisi';
import { KAZA_VAKTI_ADI, type KazaVakti } from '../../../core/kaza/kazaHareketi';
import type { GecmisSatiri, GecmisTuru, TemizlikKaynagi } from '../../../core/kaza/kazaDefteriHesabi';

/** Tema renk anahtarı (useRenkler alanı) — hardcoded renk YOK. */
export type KaynakRenkAnahtari = 'bilgi' | 'vurgu' | 'dikkat' | 'basarili' | 'birincil' | 'uyari' | 'metinIkincil';

export interface KaynakGorunumu {
  ikon: string;
  renk: KaynakRenkAnahtari;
  /** Süzgeç çipi etiketi. */
  etiket: string;
}

export const KAYNAK_GORUNUMU: Record<GecmisTuru, KaynakGorunumu> = {
  otomatik: { ikon: 'robot', renk: 'bilgi', etiket: 'Otomatik' },
  otomatikGeri: { ikon: 'undo', renk: 'basarili', etiket: 'Otomatik' },
  manuel: { ikon: 'pen', renk: 'vurgu', etiket: 'Elle' },
  bildirim: { ikon: 'bell', renk: 'dikkat', etiket: 'Bildirimden' },
  kilindi: { ikon: 'check', renk: 'basarili', etiket: 'Kılınan' },
  duzeltme: { ikon: 'sliders-h', renk: 'uyari', etiket: 'Düzeltme' },
  taban: { ikon: 'calculator', renk: 'birincil', etiket: 'Hesaplama' },
  temizlik: { ikon: 'broom', renk: 'metinIkincil', etiket: 'Temizlik' },
  temizlikGeriAl: { ikon: 'undo', renk: 'metinIkincil', etiket: 'Temizlik' },
  gunKarari: { ikon: 'calendar-check', renk: 'bilgi', etiket: 'Gün kararı' },
  otoAyar: { ikon: 'robot', renk: 'bilgi', etiket: 'Otomatik' },
  eskiGorunum: { ikon: 'sync-alt', renk: 'basarili', etiket: 'Eşitleme' },
};

export const TEMIZLIK_KAYNAK_ETIKETI: Record<TemizlikKaynagi, string> = {
  otomatik: 'Otomatik',
  manuel: 'Elle',
  bildirim: 'Bildirimden',
  kilindi: 'Kılınan',
  duzeltme: 'Düzeltme',
};

/** Cümle içi küçük harfli kaynak adı (sabit harita — `toLowerCase` 'İ'yi bozar). */
export const TEMIZLIK_KAYNAK_KUCUK: Record<TemizlikKaynagi, string> = {
  otomatik: 'otomatik',
  manuel: 'elle',
  bildirim: 'bildirimden',
  kilindi: 'kılınan',
  duzeltme: 'düzeltme',
};

/** Geçmiş süzgeç çipleri (Tümü hariç). */
export type GecmisSuzgeci = 'tumu' | 'otomatik' | 'manuel' | 'bildirim' | 'kilindi' | 'taban';

export const GECMIS_SUZGECLERI: ReadonlyArray<{ id: GecmisSuzgeci; etiket: string }> = [
  { id: 'tumu', etiket: 'Tümü' },
  { id: 'otomatik', etiket: 'Otomatik' },
  { id: 'manuel', etiket: 'Elle' },
  { id: 'bildirim', etiket: 'Bildirimden' },
  { id: 'kilindi', etiket: 'Kılınan' },
  { id: 'taban', etiket: 'Hesaplama' },
];

export function suzgeceUyarMi(satir: GecmisSatiri, s: GecmisSuzgeci): boolean {
  if (s === 'tumu') return true;
  if (s === 'otomatik') return satir.tur === 'otomatik' || satir.tur === 'otomatikGeri' || satir.tur === 'otoAyar';
  return satir.tur === s;
}

/** '2026-10-14' → '14 Ekim'. */
export function gunMetni(iso: string): string {
  const t = ISOTarihiDateNesnesiNeCevir(iso);
  return Number.isFinite(t.getTime()) ? `${t.getDate()} ${ayAdiniAl(t.getMonth())}` : iso;
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
  if (gun === bugunIso) return `Bugün · ${gunMetni(gun)}`;
  if (gun === gunEkle(bugunIso, -1)) return `Dün · ${gunMetni(gun)}`;
  return gunMetni(gun);
}

export const vakitAdi = (v: KazaVakti | undefined): string => (v ? KAZA_VAKTI_ADI[v] : '');

/** Geçmiş satırının başlığı. */
export function satirBasligi(s: GecmisSatiri): string {
  const ad = vakitAdi(s.vakit);
  const h = s.hareket;
  switch (s.tur) {
    case 'otomatik':
      return `${ad} · otomatik eklendi`;
    case 'otomatikGeri':
      return `${ad} · otomatik kayıt geri alındı`;
    case 'manuel':
      return `${ad} · elle eklendi`;
    case 'bildirim':
      return `${ad} · bildirimden eklendi`;
    case 'kilindi':
      return h?.gocmis ? `${ad} · önceki sürümde kılınanlar` : `${ad} · kılındı`;
    case 'duzeltme':
      return (h?.adet ?? 0) < 0 ? `${ad} · fazla kılınan sıfırlandı` : `${ad} · düzeltme`;
    case 'taban':
      return h?.gocmis ? 'Önceki sürümden aktarılan borç' : 'Yeniden hesaplandı';
    case 'temizlik':
      return `Temizlik · ${h?.hedefIdler?.length ?? 0} kayıt gizlendi`;
    case 'temizlikGeriAl':
      return 'Temizlik geri alındı';
    case 'gunKarari':
      return h?.karar === 'ekle' ? 'İşaretsiz gün kazaya eklendi' : 'İşaretsiz gün yok sayıldı';
    case 'otoAyar':
      return h?.aktif ? 'Otomatik ekleme açıldı' : 'Otomatik ekleme kapatıldı';
    case 'eskiGorunum':
      return 'Eski sürümlü cihazdaki kılınanlar eşitlendi';
    default:
      return '';
  }
}

/** Geçmiş satırının alt satırı. */
export function satirAltMetni(s: GecmisSatiri, cihaz: string | null): string {
  const parcalar: string[] = [];
  if (s.gun) parcalar.push(s.tur === 'gunKarari' ? gunMetni(s.gun) : `${gunMetni(s.gun)} namazı`);
  if (s.hareket?.not) parcalar.push(`"${s.hareket.not}"`);
  if (s.tur === 'taban' && s.hareket?.taban) {
    const toplam = Object.values(s.hareket.taban).reduce((t, n) => t + n, 0);
    parcalar.push(`Taban ${toplam.toLocaleString('tr-TR')}`);
  }
  if (s.tur === 'otoAyar' && s.hareket?.gun) parcalar.push(`${gunMetni(s.hareket.gun)} itibarıyla`);
  parcalar.push(saatMetni(s.zaman));
  if (s.cihaz && cihaz) parcalar.push(s.cihaz === cihaz ? 'bu cihaz' : 'başka cihaz');
  else if (!s.cihaz && s.tur === 'otomatik') parcalar.push('otomatik tarama');
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
  const delta = deltaMetni(s);
  const etki = delta && delta !== '=' ? `, kalana etkisi ${delta.replace('−', 'eksi ')}` : '';
  const gizli = s.gizli ? ', gizlenmiş' : '';
  return `${satirBasligi(s)}, ${satirAltMetni(s, cihaz)}${etki}${gizli}. Ayrıntı için dokunun.`;
}
