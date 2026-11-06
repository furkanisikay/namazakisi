/**
 * Now Bar / Live Update TANISI — SAF yorum katmanı (issue #282 saha raporu: "Now Bar
 * saatte görünüyor, telefonda görünmüyor", Samsung One UI 8 / Android 16).
 *
 * Native (`cekirdek/CanliTaniKurallari.taniJsonu`) üç ayrı gerçeği ölçer:
 *  1. Kullanıcı izni (`canPostPromotedNotifications`) — `CanliDurum`.
 *  2. Bildirimin şartları (`hasPromotableCharacteristics`) — gösterim kaydında.
 *  3. Sistemin GERÇEKTEN öne çıkarıp çıkarmadığı (`FLAG_PROMOTED_ONGOING`).
 * 1 ve 2 true iken 3 false olabilir: üretici ek ölçüt koyabilir (Google: "OEMs can
 * enforce additional criteria"). Samsung One UI 8'de üçüncü taraf uygulamaların Now
 * Bar'a çıkması geliştirici seçeneğine bağlı olarak bildirildi (ikincil kaynaklar;
 * cihazda DOĞRULANMADI). Tanı bu yüzden kararını 3'e dayandırır.
 *
 * Kişisel veri YOK (kimlik, sayı, bayrak, zaman) → tanı raporu loguna yazılabilir.
 */
import { bicim, metin } from '../dil/aktifDil';

/** Köprünün `CanliDurum`'u ile yapısal olarak aynı (çekirdek köprüye bağımlı olmasın). */
export type CanliDurum = 'desteklenmiyor' | 'kapali' | 'acik';

export interface CanliTaniGosterimi {
  zamanMs: number;
  id: string;
  tema: string;
  kanalId: string;
  kanalOnemi: number | null;
  oneCikarilabilir: boolean;
  izinVar: boolean;
  /** null = ölçülemedi (bildirim o an görünmüyordu). */
  oneCikarildi: boolean | null;
  hata: string | null;
}

export interface CanliTani {
  sdkInt: number;
  sdkTam: number | null;
  samsung: boolean;
  oneUi: string | null;
  /** `POST_PROMOTED_NOTIFICATIONS` izni (normal izin, manifestten); null = API < 36. */
  izinVar: boolean | null;
  planOlaySayisi: number;
  sonrakiAlarmMs: number | null;
  sonPlanMs: number | null;
  gosterilenler: string[];
  sonGosterim: CanliTaniGosterimi | null;
  aktifBildirimler: { id: string; oneCikarildi: boolean | null }[];
  /** `FLAG_PROMOTED_ONGOING` bu cihazda okunabiliyor mu (API 36 + yansıma başarılı). */
  bayrakOkunabilir: boolean;
  /** Cihaz düzeyindeki son CANLI ölçüm; hiç ölçülmediyse null. */
  sonOlcum: { deger: boolean; olcumMs: number } | null;
}

/**
 * Muhafız bastırmasından gelen Now Bar YEDEĞİ gösterilsin mi? (Sahip kararı.)
 *  - Bayrak okunamıyorsa (eski ikili, yansıma başarısız, tanı yok) → HAYIR: ölçemediğimiz
 *    gürültüyü almayız.
 *  - Son ölçüm "öne çıkardı" → EVET.
 *  - Hiç ölçüm yok → EVET: bir kez gösterilir ve ölçülür (ölçüm gelince bu kural karar verir).
 *  - Son ölçüm "öne çıkarmadı" → yalnız kullanıcı o ölçümden SONRA yeniden deneme
 *    hakkı verdiyse (ayarlardan dönüş / tanı yenileme) EVET; yeni ölçüm gelince yine karar.
 * "Vakit girince" / "Son dakikalar" adaylarına UYGULANMAZ (kullanıcı onları açıkça seçti).
 */
export function yedekGosterilsinMi(tani: CanliTani | null, yeniDenemeMs: number | null): boolean {
  if (!tani || !tani.bayrakOkunabilir) return false;
  const olcum = tani.sonOlcum;
  if (!olcum) return true;
  if (olcum.deger) return true;
  return yeniDenemeMs !== null && yeniDenemeMs > olcum.olcumMs;
}

/** `NotificationManager.IMPORTANCE_MIN` — öne çıkarma bu önemde OLMAZ. */
const ONEM_MIN = 1;

const sayi = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const metinMi = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const mantik = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);

function gosterimCoz(o: unknown): CanliTaniGosterimi | null {
  if (!o || typeof o !== 'object') return null;
  const g = o as Record<string, unknown>;
  const id = metinMi(g.id);
  if (!id) return null;
  return {
    zamanMs: sayi(g.zamanMs) ?? 0,
    id,
    tema: metinMi(g.tema) ?? '',
    kanalId: metinMi(g.kanalId) ?? '',
    kanalOnemi: sayi(g.kanalOnemi),
    oneCikarilabilir: g.oneCikarilabilir === true,
    izinVar: g.izinVar === true,
    oneCikarildi: mantik(g.oneCikarildi),
    hata: metinMi(g.hata),
  };
}

function olcumCoz(o: unknown): { deger: boolean; olcumMs: number } | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const deger = mantik(r.deger);
  const olcumMs = sayi(r.olcumMs);
  return deger === null || olcumMs === null ? null : { deger, olcumMs };
}

/** Native JSON'u çözer; bozuksa `null`. Asla fırlatmaz. */
export function canliTaniCoz(ham: string | null | undefined): CanliTani | null {
  if (!ham) return null;
  try {
    const o = JSON.parse(ham) as Record<string, unknown> | null;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    const sdkInt = sayi(o.sdkInt);
    if (sdkInt === null) return null;
    const aktif = Array.isArray(o.aktifBildirimler) ? o.aktifBildirimler : [];
    return {
      sdkInt,
      sdkTam: sayi(o.sdkTam),
      samsung: o.samsung === true,
      oneUi: metinMi(o.oneUi),
      izinVar: mantik(o.izinVar),
      planOlaySayisi: sayi(o.planOlaySayisi) ?? 0,
      sonrakiAlarmMs: sayi(o.sonrakiAlarmMs),
      sonPlanMs: sayi(o.sonPlanMs),
      gosterilenler: Array.isArray(o.gosterilenler) ? o.gosterilenler.filter((x): x is string => typeof x === 'string') : [],
      sonGosterim: gosterimCoz(o.sonGosterim),
      aktifBildirimler: aktif
        .map((a) => {
          const r = a as Record<string, unknown> | null;
          const id = metinMi(r?.id);
          return id ? { id, oneCikarildi: mantik(r?.oneCikarildi) } : null;
        })
        .filter((a): a is { id: string; oneCikarildi: boolean | null } => a !== null),
      bayrakOkunabilir: o.bayrakOkunabilir === true,
      sonOlcum: olcumCoz(o.sonOlcum),
    };
  } catch {
    return null;
  }
}

export type CanliTeshisTipi =
  | 'oneCikti'
  | 'ureticiEngeli'
  | 'sartEksik'
  | 'hata'
  | 'izinKapali'
  | 'manifestIzniYok'
  | 'desteklenmiyor'
  | 'planBos'
  | 'henuzGosterilmedi'
  | 'olculemedi';

export interface CanliTeshis {
  tip: CanliTeshisTipi;
  /** Kullanıcıya gösterilen tek cümle (kibar "siz"). */
  metin: string;
  /** Samsung'da geliştirici seçeneği yönlendirmesi gösterilsin mi? */
  samsungIpucu: boolean;
}

/** Samsung One UI 8 için ekranda gösterilen yönlendirme (ikincil kaynaklara dayanır). */
export const samsungCanliBildirimIpucu = (): string => metin().nowBar.tani.samsungIpucu;

/** `yedekGosterilsinMi` "hayır" ölçümünde yedeği durdurur — kart bunu söyler (sessiz sapma yok). */
export const yedekDurduNotu = (): string => metin().nowBar.tani.yedekDurdu;

const saatMetni = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Tek cümlelik teşhis. Sıra önemlidir: önce izin/destek kapıları, sonra plan, en son
 * sistemin bayrağı (asıl gerçek).
 */
export function canliTeshisi(durum: CanliDurum, tani: CanliTani | null): CanliTeshis {
  const yok = (tip: CanliTeshisTipi, cumle: string): CanliTeshis => ({ tip, metin: cumle, samsungIpucu: false });
  const t = metin().nowBar.tani;
  if (durum === 'desteklenmiyor' || !tani) {
    return yok('desteklenmiyor', t.desteklenmiyor);
  }
  if (durum === 'kapali') {
    return yok('izinKapali', t.izinKapali);
  }
  if (tani.izinVar === false) {
    return yok('manifestIzniYok', t.manifestIzniYok);
  }
  const son = tani.sonGosterim;
  // Görünen bir sayaç varsa onun CANLI bayrağı son kayıttan önce gelir.
  const canli = tani.aktifBildirimler.find((a) => a.oneCikarildi !== null);
  if (canli?.oneCikarildi === true) {
    return yok('oneCikti', t.oneCikti);
  }
  if (son?.hata) {
    return yok('hata', bicim(t.hata, { hata: son.hata }));
  }
  if (son && (!son.oneCikarilabilir || son.kanalOnemi === ONEM_MIN)) {
    return yok('sartEksik', t.sartEksik);
  }
  const olculen = canli?.oneCikarildi ?? tani.sonOlcum?.deger ?? son?.oneCikarildi ?? null;
  if (olculen === false) {
    return {
      tip: 'ureticiEngeli',
      metin: `${tani.samsung ? t.ureticiSamsung : t.uretici} ${t.yedekDurdu}`,
      samsungIpucu: tani.samsung,
    };
  }
  if (tani.planOlaySayisi === 0) {
    return yok('planBos', t.planBos);
  }
  if (!son) {
    return yok(
      'henuzGosterilmedi',
      tani.sonrakiAlarmMs !== null ? bicim(t.planlandiSaat, { saat: saatMetni(tani.sonrakiAlarmMs) }) : t.planlandi
    );
  }
  return yok('olculemedi', t.olculemedi);
}

/**
 * Ekrandaki ve tanı logundaki ayrıntı satırları (teknik, kısa). Saat yerel saatle
 * yazılır; tarih yazılmaz (gün bilgisi tanıda gereksiz).
 */
export function canliTaniSatirlari(durum: CanliDurum, tani: CanliTani | null): string[] {
  const m = metin().nowBar.taniSatir;
  if (!tani) return [bicim(m.durum, { durum }), m.okunamadi];
  const evetHayir = (v: boolean | null): string => (v === null ? m.bilinmiyor : v ? m.evet : m.hayir);
  const satirlar = [
    bicim(m.durum, { durum }),
    bicim(m.api, {
      api: `${tani.sdkTam ?? tani.sdkInt}${tani.samsung ? ` · Samsung${tani.oneUi ? ` One UI ${tani.oneUi}` : ''}` : ''}`,
    }),
    bicim(m.izin, { deger: evetHayir(tani.izinVar) }),
    bicim(m.bayrak, {
      deger: evetHayir(tani.bayrakOkunabilir),
      olcum: tani.sonOlcum ? `${evetHayir(tani.sonOlcum.deger)} (${saatMetni(tani.sonOlcum.olcumMs)})` : m.yok,
    }),
    `${bicim(m.plan, { n: tani.planOlaySayisi })}${
      tani.sonrakiAlarmMs !== null ? bicim(m.siradaki, { saat: saatMetni(tani.sonrakiAlarmMs) }) : ''
    }${tani.sonPlanMs !== null ? bicim(m.sonUygulama, { saat: saatMetni(tani.sonPlanMs) }) : ''}`,
  ];
  const s = tani.sonGosterim;
  if (s) {
    satirlar.push(
      bicim(m.sonGosterim, {
        saat: saatMetni(s.zamanMs),
        tema: s.tema || '-',
        kanal: s.kanalId || '-',
        onem: s.kanalOnemi ?? '?',
      }),
      `${bicim(m.sartlar, { uygun: evetHayir(s.oneCikarilabilir), cikti: evetHayir(s.oneCikarildi) })}${
        s.hata ? bicim(m.hata, { hata: s.hata }) : ''
      }`
    );
  } else {
    satirlar.push(m.sonGosterimYok);
  }
  satirlar.push(
    bicim(m.gorunenler, {
      liste: tani.aktifBildirimler.length
        ? tani.aktifBildirimler.map((a) => `${a.id} (${evetHayir(a.oneCikarildi)})`).join(', ')
        : m.yok,
    })
  );
  return satirlar;
}
