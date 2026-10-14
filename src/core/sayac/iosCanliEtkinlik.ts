/**
 * iOS canlı etkinlik (Live Activity — Dinamik Ada / kilit ekranı) SEÇİMİ (issue #295,
 * Android Now Bar'ın #282 iOS ikizi). SAF.
 *
 * Android ile AYNI seçim (`core/sayac/nowBar.ts`), AYNI aday üretimi
 * (`nowBarAdaylariniOlustur`) ve AYNI öncelik kuralı (`kazananSirasi`: vakit > cuma >
 * nafile; eşitlikte hedefi yakın olan). İKİ fark platformdan gelir:
 *
 *  1. iOS'ta ZAMANLANMIŞ başlatma yoktur. Canlı etkinlik yalnız uygulama ÖN PLANDAYKEN
 *     `Activity.request` ile başlar; arka planda başlatmak push-to-start (sunucu) ister,
 *     sunucumuz yok. Bu yüzden çıktı Android'deki gibi bir OLAY LİSTESİ değil, "ŞU AN
 *     hangi etkinlik görünmeli?" sorusunun TEK cevabıdır. Bitiş sistemdedir
 *     (`staleDate = hedef`): uygulama açılmasa da sayaç hedefte durur.
 *  2. iOS'ta vakit/iftar/sahur/seri SAYAÇ BİLDİRİMLERİ yoktur (notifee Android'e
 *     özgü). Vakit öğesinin "sayaçla" seçimi iOS'ta "son dakikalar" gibi yorumlanır
 *     (`iosEtkinBaslangic`; ekran da öyle gösterir — sessiz sapma yok). İftar, sahur
 *     ve seri yalnız kendi sayaçlarından beslendiği için iOS'ta bu aşamada YOKTUR
 *     (`IOS_CANLI_OGELERI` dışı; ekran onları listelemez).
 */
import {
  kazananSirasi,
  nowBarAdaylariniOlustur,
  secimliBaslangic,
  type CanliAday,
  type EtkinAday,
  type NowBarAdayGirdisi,
} from './canliSayacPlani';
import {
  NOW_BAR_BASLANGICLARI,
  NOW_BAR_OGE_BILGILERI,
  NOW_BAR_OGELERI,
  nowBarVaktiMi,
  type NowBarAyarlari,
  type NowBarBaslangic,
  type NowBarOgeAyari,
  type NowBarOgesi,
} from './nowBar';

/** iOS'ta canlı etkinliği olan öğeler (sayaç bildirimine bağlı olanlar hariç). */
export const IOS_CANLI_OGELERI: readonly NowBarOgesi[] = [
  'imsak',
  'ogle',
  'ikindi',
  'aksam',
  'yatsi',
  'cuma',
  'kusluk',
  'evvabin',
  'teheccud',
];

export const iosCanliOgesiMi = (oge: NowBarOgesi): boolean => IOS_CANLI_OGELERI.includes(oge);

/**
 * ActivityKit bir canlı etkinliği en fazla ~8 saat etkin tutar, sonra sistem bitirir.
 * Daha uzun pencerede (ör. "Vakit girince" seçilmiş kış yatsısı ~10 sa) etkinlik hedefe
 * varmadan SESSİZCE biterdi → başlangıç `hedef − 8 sa`'e kaydırılır
 * (`iosGorunurBaslangic`): geç başlar ama hedefe kadar sürer. Ekran bunu söyler.
 */
export const IOS_CANLI_AZAMI_SURE_MS = 8 * 60 * 60_000;

/**
 * Seçilen başlangıcın iOS'taki gerçek karşılığı: pencere 8 saati aşıyorsa başlangıç
 * `hedef − 8 sa`'e çekilir (sessiz kesinti yerine geç başlama).
 */
export const iosGorunurBaslangic = (basMs: number, hedefMs: number): number =>
  Math.max(basMs, hedefMs - IOS_CANLI_AZAMI_SURE_MS);

/** iOS'ta seçilebilen başlangıçlar: "sayaçla" yok (sayaç bildirimi yok). */
export const iosBaslangicSecenekleri = (oge: NowBarOgesi): NowBarBaslangic[] =>
  NOW_BAR_BASLANGICLARI[oge].filter((b) => b !== 'sayacla');

/** Kayıttaki seçimin iOS'taki ETKİN karşılığı: "sayaçla" → "son dakikalar". */
export const iosEtkinBaslangic = (ayar: NowBarOgeAyari): NowBarBaslangic =>
  ayar.baslangic === 'sayacla' ? 'sonDk' : ayar.baslangic;

/**
 * Ayarları iOS'a uyarlar: desteklenmeyen öğeler kapalı, "sayaçla" → "son dakikalar".
 * Kayıt DEĞİŞMEZ (aynı ayar dosyası Android yedeğine de gidebilir).
 */
export function iosAyarlariniUyarla(ayarlar: NowBarAyarlari): NowBarAyarlari {
  const ogeler = {} as NowBarAyarlari['ogeler'];
  for (const oge of NOW_BAR_OGELERI) {
    const a = ayarlar.ogeler[oge];
    ogeler[oge] = { ...a, acik: a.acik && iosCanliOgesiMi(oge), baslangic: iosEtkinBaslangic(a) };
  }
  return { ogeler };
}

/** Native'e giden istek (`modules/expo-siri-kisayollari` `CanliEtkinlikIstegi` ile aynı alanlar). */
export interface IosCanliEtkinlik {
  id: string;
  baslik: string;
  ad: string;
  /** İlerleme çubuğunun başı: seçilen görünür başlangıç. */
  baslangicMs: number;
  hedefMs: number;
  tema: string;
  /** Yalnız vakit öğesinde: "Kıldım" düğmesinin namaz günü ve KAYIT kodu (`imsak`...). */
  kildimTarih: string | null;
  kildimVakit: string | null;
}

const istegeCevir = (aday: CanliAday, bas: number): IosCanliEtkinlik => {
  const kildim = nowBarVaktiMi(aday.oge) ? aday.canli.kildim : undefined;
  return {
    id: aday.id,
    baslik: aday.baslik,
    ad: NOW_BAR_OGE_BILGILERI[aday.oge].ad,
    baslangicMs: bas,
    hedefMs: aday.hedefMs,
    tema: aday.tema,
    kildimTarih: kildim?.tarih ?? null,
    kildimVakit: kildim?.vakit ?? null,
  };
};

/** Eşitleme kararı: gösterilecek etkinlik + penceresi şu an süren TÜM adayların kimlikleri. */
export interface IosCanliEtkinlikDurumu {
  istek: IosCanliEtkinlik | null;
  /**
   * Kendi başına hâlâ geçerli olan (kılınmamış, penceresi süren) adaylar. Arka planda yeni
   * etkinlik istenemediği için native yalnız BU listenin DIŞINDAKİLERİ bitirir.
   */
  gecerliKimlikler: string[];
}

/**
 * ŞU AN gösterilecek tek canlı etkinlik + geçerli adaylar. Kılınmış vakit, özel gün ve
 * kapalı öğe aday üretiminde zaten elenir (`nowBarAdaylariniOlustur`).
 */
export function iosCanliEtkinlikDurumu(g: NowBarAdayGirdisi): IosCanliEtkinlikDurumu {
  const ayarlar = iosAyarlariniUyarla(g.ayarlar);
  const adaylar = nowBarAdaylariniOlustur({ ...g, ayarlar });
  let kazanan: EtkinAday | null = null;
  const gecerliKimlikler: string[] = [];
  for (const aday of adaylar) {
    const secim = secimliBaslangic(aday, ayarlar);
    if (secim === null) continue;
    const bas = iosGorunurBaslangic(secim, aday.hedefMs);
    if (bas > g.simdiMs || aday.hedefMs <= g.simdiMs) continue;
    if (!gecerliKimlikler.includes(aday.id)) gecerliKimlikler.push(aday.id);
    const etkin = { aday, bas };
    if (!kazanan || kazananSirasi(etkin, kazanan) < 0) kazanan = etkin;
  }
  return { istek: kazanan ? istegeCevir(kazanan.aday, kazanan.bas) : null, gecerliKimlikler };
}

/** ŞU AN gösterilecek tek canlı etkinlik (yoksa `null`). */
export function iosCanliEtkinlikSec(g: NowBarAdayGirdisi): IosCanliEtkinlik | null {
  return iosCanliEtkinlikDurumu(g).istek;
}

/**
 * Sıradaki canlı etkinliğin başlangıcı (ekranda "uygulamayı açtığınızda başlar"
 * bilgisi için); yoksa `null`.
 */
export function iosSiradakiCanliBaslangic(g: NowBarAdayGirdisi): { ad: string; basMs: number } | null {
  const ayarlar = iosAyarlariniUyarla(g.ayarlar);
  let en: { ad: string; basMs: number } | null = null;
  for (const aday of nowBarAdaylariniOlustur({ ...g, ayarlar })) {
    const secim = secimliBaslangic(aday, ayarlar);
    if (secim === null) continue;
    const bas = iosGorunurBaslangic(secim, aday.hedefMs);
    if (bas <= g.simdiMs) continue;
    if (!en || bas < en.basMs) en = { ad: NOW_BAR_OGE_BILGILERI[aday.oge].ad, basMs: bas };
  }
  return en;
}
