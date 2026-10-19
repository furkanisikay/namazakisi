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
export const SAMSUNG_CANLI_BILDIRIM_IPUCU =
  'Samsung, One UI 8\'de başka uygulamaların canlı bildirimlerini Now Bar\'a almayı Geliştirici seçenekleri\'ndeki "Live notifications for all apps" (tüm uygulamalar için canlı bildirimler) ayarına bağlayabiliyor. Bu ayarı açıp bir sonraki geri sayımda yeniden bakabilirsiniz. Geliştirici seçenekleri, Ayarlar > Telefon hakkında > Yazılım bilgileri\'nde "Yapım numarası"na yedi kez dokunarak açılır.';

const saatMetni = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Tek cümlelik teşhis. Sıra önemlidir: önce izin/destek kapıları, sonra plan, en son
 * sistemin bayrağı (asıl gerçek).
 */
export function canliTeshisi(durum: CanliDurum, tani: CanliTani | null): CanliTeshis {
  const yok = (tip: CanliTeshisTipi, metin: string): CanliTeshis => ({ tip, metin, samsungIpucu: false });
  if (durum === 'desteklenmiyor' || !tani) {
    return yok('desteklenmiyor', 'Bu telefon ya da uygulama sürümü canlı güncellemeleri desteklemiyor.');
  }
  if (durum === 'kapali') {
    return yok('izinKapali', 'Telefonunuzun ayarlarında bu uygulama için canlı güncellemeler kapalı.');
  }
  if (tani.izinVar === false) {
    return yok('manifestIzniYok', 'Uygulamanın öne çıkarma izni eksik; lütfen sorunu bize bildirin.');
  }
  const son = tani.sonGosterim;
  // Görünen bir sayaç varsa onun CANLI bayrağı son kayıttan önce gelir.
  const canli = tani.aktifBildirimler.find((a) => a.oneCikarildi !== null);
  if (canli?.oneCikarildi === true) {
    return yok('oneCikti', 'Sistem geri sayımı öne çıkardı; durum çubuğunda görünüyor olmalı.');
  }
  if (son?.hata) {
    return yok('hata', `Geri sayım öne çıkarılırken bir hata oluştu (${son.hata}); lütfen sorunu bize bildirin.`);
  }
  if (son && (!son.oneCikarilabilir || son.kanalOnemi === ONEM_MIN)) {
    return yok('sartEksik', 'Geri sayım bildirimi öne çıkarma şartlarını karşılamadı; lütfen sorunu bize bildirin.');
  }
  const olculen = canli?.oneCikarildi ?? son?.oneCikarildi ?? null;
  if (olculen === false) {
    return {
      tip: 'ureticiEngeli',
      metin: tani.samsung
        ? 'Uygulama geri sayımı öne çıkarmayı istedi ve şartlar tamam, ancak telefonunuz onu Now Bar\'a almadı.'
        : 'Uygulama geri sayımı öne çıkarmayı istedi ve şartlar tamam, ancak telefonunuz onu öne çıkarmadı.',
      samsungIpucu: tani.samsung,
    };
  }
  if (tani.planOlaySayisi === 0) {
    return yok('planBos', 'Şu an planlanmış bir canlı sayaç yok: açtığınız öğelerin zamanı henüz gelmedi.');
  }
  if (!son) {
    return yok(
      'henuzGosterilmedi',
      tani.sonrakiAlarmMs !== null
        ? `Canlı sayaç planlandı; ilk geri sayım ${saatMetni(tani.sonrakiAlarmMs)} civarında başlar.`
        : 'Canlı sayaç planlandı ama henüz gösterilmedi.'
    );
  }
  return yok('olculemedi', 'Şu an görünen bir geri sayım yok; bir sonraki geri sayımda yeniden bakabilirsiniz.');
}

/**
 * Ekrandaki ve tanı logundaki ayrıntı satırları (teknik, kısa). Saat yerel saatle
 * yazılır; tarih yazılmaz (gün bilgisi tanıda gereksiz).
 */
export function canliTaniSatirlari(durum: CanliDurum, tani: CanliTani | null): string[] {
  if (!tani) return [`Durum: ${durum}`, 'Tanı okunamadı'];
  const evetHayir = (v: boolean | null): string => (v === null ? 'bilinmiyor' : v ? 'evet' : 'hayır');
  const satirlar = [
    `Durum: ${durum}`,
    `Android API: ${tani.sdkTam ?? tani.sdkInt}${tani.samsung ? ` · Samsung${tani.oneUi ? ` One UI ${tani.oneUi}` : ''}` : ''}`,
    `Öne çıkarma izni (manifest): ${evetHayir(tani.izinVar)}`,
    `Plan: ${tani.planOlaySayisi} olay${tani.sonrakiAlarmMs !== null ? ` · sıradaki ${saatMetni(tani.sonrakiAlarmMs)}` : ''}${
      tani.sonPlanMs !== null ? ` · son uygulama ${saatMetni(tani.sonPlanMs)}` : ''
    }`,
  ];
  const s = tani.sonGosterim;
  if (s) {
    satirlar.push(
      `Son gösterim: ${saatMetni(s.zamanMs)} · ${s.tema || '-'} · kanal ${s.kanalId || '-'} (önem ${s.kanalOnemi ?? '?'})`,
      `Şartlar uygun: ${evetHayir(s.oneCikarilabilir)} · sistem öne çıkardı: ${evetHayir(s.oneCikarildi)}${s.hata ? ` · hata ${s.hata}` : ''}`
    );
  } else {
    satirlar.push('Son gösterim: yok');
  }
  satirlar.push(
    `Görünen sayaçlar: ${
      tani.aktifBildirimler.length
        ? tani.aktifBildirimler.map((a) => `${a.id} (${evetHayir(a.oneCikarildi)})`).join(', ')
        : 'yok'
    }`
  );
  return satirlar;
}
