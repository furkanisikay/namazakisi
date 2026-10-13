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
 * Daha uzun pencere (ör. "Vakit girince" seçilmiş yaz yatsısı) hedefe varmadan biter;
 * ekran bunu söyler.
 */
export const IOS_CANLI_AZAMI_SURE_MS = 8 * 60 * 60_000;

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

/**
 * ŞU AN gösterilecek tek canlı etkinlik (yoksa `null`). Kılınmış vakit, özel gün ve
 * kapalı öğe aday üretiminde zaten elenir (`nowBarAdaylariniOlustur`).
 */
export function iosCanliEtkinlikSec(g: NowBarAdayGirdisi): IosCanliEtkinlik | null {
  const ayarlar = iosAyarlariniUyarla(g.ayarlar);
  const adaylar = nowBarAdaylariniOlustur({ ...g, ayarlar });
  let kazanan: EtkinAday | null = null;
  for (const aday of adaylar) {
    const bas = secimliBaslangic(aday, ayarlar);
    if (bas === null || bas > g.simdiMs || aday.hedefMs <= g.simdiMs) continue;
    const etkin = { aday, bas };
    if (!kazanan || kazananSirasi(etkin, kazanan) < 0) kazanan = etkin;
  }
  return kazanan ? istegeCevir(kazanan.aday, kazanan.bas) : null;
}

/**
 * Sıradaki canlı etkinliğin başlangıcı (ekranda "uygulamayı açtığınızda başlar"
 * bilgisi için); yoksa `null`.
 */
export function iosSiradakiCanliBaslangic(g: NowBarAdayGirdisi): { ad: string; basMs: number } | null {
  const ayarlar = iosAyarlariniUyarla(g.ayarlar);
  let en: { ad: string; basMs: number } | null = null;
  for (const aday of nowBarAdaylariniOlustur({ ...g, ayarlar })) {
    const bas = secimliBaslangic(aday, ayarlar);
    if (bas === null || bas <= g.simdiMs) continue;
    if (!en || bas < en.basMs) en = { ad: NOW_BAR_OGE_BILGILERI[aday.oge].ad, basMs: bas };
  }
  return en;
}
