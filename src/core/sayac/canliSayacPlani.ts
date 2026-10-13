/**
 * Canlı sayaç PLANI (issue #282, ikinci aşama) — hangi öğe NE ZAMAN öne çıkar? SAF.
 *
 * İki kaynaktan "aday" gelir:
 *  - `sayac`: mevcut sayaç servislerinin (vakit/iftar/sahur/seri) bildirdiği
 *    pencereler. Bu bildirimleri kullanıcı ayrıca açmıştır → öne çıkma
 *    yarışını kaybettiğinde SIRADAN (özel görünümlü) sayaç olarak gösterilir.
 *  - `nowBar`: yalnız Now Bar için üretilen pencereler (vakit "girince/son N dk",
 *    cuma, nafileler). Yarışı kaybeden GİZLENİR — kullanıcı bunu bildirim
 *    çekmecesinde değil, yalnız Now Bar'da istedi.
 *
 * TEK ÖNE ÇIKAN KURALI: her an en fazla bir aday öne çıkar; kazanan
 * `NOW_BAR_ONCELIK`'e göre (eşitlikte hedefi yakın olan). Çıktı OLAY listesidir:
 * native taraf (`CanliPlan.kt`) tek bir alarm zinciriyle sıradaki olayı uygular —
 * dakikalık yoklama YOK. Hedefe varınca bildirimi bitiş alarmı / `setTimeoutAfter`
 * kaldırır, ayrıca olay üretilmez.
 *
 * Saat (Wear OS) aynı zaman çizelgesinin öne çıkan dilimlerini taşır
 * (`saatPencereleriniOlustur`).
 */

import { BILDIRIM_SABITLERI } from '../constants/UygulamaSabitleri';
import { nafilePencereleriHesapla, type GunVakitleri } from '../nafile/nafileVakitleri';
import {
  vakitCanliYukuOlustur,
  type CanliGuncellemeYuku,
  type SayacTemasi,
} from './canliGuncelleme';
import {
  NOW_BAR_ONCELIK,
  NOW_BAR_VAKITLERI,
  NOW_BAR_OGE_BILGILERI,
  nowBarVaktiMi,
  type NowBarAyarlari,
  type NowBarOgesi,
  type NowBarVakti,
} from './nowBar';

const DK = 60_000;

/** Planın ileriye bakış ufku: bundan sonra BAŞLAYAN aday planlanmaz (yeniden planlama sıktır). */
export const CANLI_PLAN_UFKU_MS = 48 * 60 * DK;

/** Now Bar'a özel adayların kanalı (native taraf yoksa kendisi kurar). */
export const CANLI_SAYAC_KANALI = 'canli_sayac';

/** Now Bar'a özel adayların bildirim kimliği öneki (vakit hariç — o sayaç kimliğini kullanır). */
export const CANLI_SAYAC_ONEKI = 'canli_sayac_';

export type CanliKaynak = 'sayac' | 'nowBar';
export type CanliTema = SayacTemasi | 'cuma' | 'nafile';

export interface CanliAday {
  oge: NowBarOgesi;
  kaynak: CanliKaynak;
  /** Bildirim kimliği. Sayaç adayında sayacın KENDİ kimliği (iptal yolları aynen çalışsın). */
  id: string;
  /** Sayacın kendi başladığı an (`sayacla`). */
  baslangicMs: number;
  /**
   * Öğenin doğal penceresinin başı (`girince` ve `sonDk` alt sınırı). Verilmezse
   * `baslangicMs`.
   */
  dogalBaslangicMs?: number;
  hedefMs: number;
  baslik: string;
  govdeSablonu: string;
  kanalId: string;
  tema: CanliTema;
  hedefteKaybol: boolean;
  canli: CanliGuncellemeYuku;
}

export type CanliEylem = 'oneCikar' | 'normal' | 'gizle';

export interface CanliOlay {
  anMs: number;
  id: string;
  eylem: CanliEylem;
  /** `gizle` dışında dolu: gösterilecek bildirim. */
  aday?: CanliAday;
}

// ---------------------------------------------------------------------------
// Adayların başlangıcını kullanıcı seçimine göre kur
// ---------------------------------------------------------------------------

/**
 * Bir adayın kullanıcı seçimine göre GÖRÜNÜR başlangıcı. `null` → öğe kapalı ya
 * da pencere boş.
 */
export function secimliBaslangic(aday: CanliAday, ayarlar: NowBarAyarlari): number | null {
  const ayar = ayarlar.ogeler[aday.oge];
  if (!ayar.acik) return null;
  const dogal = aday.dogalBaslangicMs ?? aday.baslangicMs;
  let bas: number;
  switch (ayar.baslangic) {
    case 'sayacla':
      bas = aday.baslangicMs;
      break;
    case 'girince':
      bas = dogal;
      break;
    case 'sonDk':
      bas = Math.max(dogal, aday.hedefMs - ayar.sonDk * DK);
      break;
  }
  return bas < aday.hedefMs ? bas : null;
}

/**
 * Sayaç adayı planlayıcıya mı devredilir? Vakit öğesinde `girince`/`sonDk`
 * seçildiyse vakit penceresini planlayıcı KENDİSİ üretir (sayaçtan bağımsız,
 * muhafız bastırmasına takılmaz) → sayacın bildirdiği aday yok sayılır.
 */
export function sayacAdayiKullanilirMi(aday: CanliAday, ayarlar: NowBarAyarlari): boolean {
  const ayar = ayarlar.ogeler[aday.oge];
  if (!ayar.acik) return false;
  if (nowBarVaktiMi(aday.oge)) return ayar.baslangic === 'sayacla';
  return true;
}

// ---------------------------------------------------------------------------
// Planlayıcının kendi adayları (vakit girince/son dk, cuma, nafile)
// ---------------------------------------------------------------------------

export interface PlanGunu {
  /** 'YYYY-MM-DD' */
  tarih: string;
  vakitler: GunVakitleri;
}

export interface NowBarAdayGirdisi {
  ayarlar: NowBarAyarlari;
  simdiMs: number;
  /** Ardışık günler: DÜN, bugün, yarın, öbür gün (yatsı ve teheccüd ertesi imsağa uzanır). */
  gunler: readonly PlanGunu[];
  kilinmisMi: (tarih: string, vakit: NowBarVakti) => boolean;
  ozelGundeMi: (tarih: string) => boolean;
}

const VAKIT_CIKISI: Record<Exclude<NowBarVakti, 'yatsi'>, keyof GunVakitleri> = {
  imsak: 'gunes',
  ogle: 'ikindi',
  ikindi: 'aksam',
  aksam: 'yatsi',
};

const tarihGunu = (tarih: string): number => {
  const [y, a, g] = tarih.split('-').map(Number);
  return new Date(y, a - 1, g).getDay();
};

/** Vakit sayacıyla AYNI kimlik — "Kıldım"daki `vakitSayaciniIptalEt` bunu da kaldırır. */
export const vakitSayacKimligi = (tarih: string, vakit: NowBarVakti): string =>
  `${BILDIRIM_SABITLERI.ONEKLEME.SAYAC}${tarih}_${vakit}`;

const pencereIcindeMi = (simdiMs: number, bas: number, hedef: number): boolean =>
  hedef > simdiMs && bas < simdiMs + CANLI_PLAN_UFKU_MS;

export function nowBarAdaylariniOlustur(g: NowBarAdayGirdisi): CanliAday[] {
  const adaylar: CanliAday[] = [];
  const { ayarlar, simdiMs } = g;
  const acikVeKendi = (oge: NowBarOgesi): boolean =>
    ayarlar.ogeler[oge].acik && (!nowBarVaktiMi(oge) || ayarlar.ogeler[oge].baslangic !== 'sayacla');

  g.gunler.forEach((gun, i) => {
    const ertesi = g.gunler[i + 1];

    // Vakitler (giriş → çıkış).
    for (const vakit of NOW_BAR_VAKITLERI) {
      if (!acikVeKendi(vakit)) continue;
      const giris = gun.vakitler[vakit].getTime();
      const cikis =
        vakit === 'yatsi' ? ertesi?.vakitler.imsak.getTime() : gun.vakitler[VAKIT_CIKISI[vakit]].getTime();
      if (cikis === undefined || !(cikis > giris)) continue;
      if (!pencereIcindeMi(simdiMs, giris, cikis)) continue;
      if (g.ozelGundeMi(gun.tarih) || g.kilinmisMi(gun.tarih, vakit)) continue;
      const ad = NOW_BAR_OGE_BILGILERI[vakit].ad;
      adaylar.push({
        oge: vakit,
        kaynak: 'nowBar',
        id: vakitSayacKimligi(gun.tarih, vakit),
        baslangicMs: giris,
        dogalBaslangicMs: giris,
        hedefMs: cikis,
        baslik: `⏱️ ${ad} Namazı`,
        govdeSablonu: `${ad} vaktinin çıkmasına kalan süre\n⏱️ {time}`,
        kanalId: CANLI_SAYAC_KANALI,
        tema: 'vakit',
        hedefteKaybol: true,
        // Vurgu son 30 dk (ya da seçilen son dakikalar): çubuk vaktin tamamını gösterir.
        canli: vakitCanliYukuOlustur({
          girisMs: giris,
          cikisMs: cikis,
          sayacBaslangicMs: Math.max(giris, cikis - Math.max(30, ayarlar.ogeler[vakit].sonDk) * DK),
          tarih: gun.tarih,
          vakit,
        }),
      });
    }

    // Cuma: güneş doğuşu → öğle girişi (hutbe öğle vaktinde okunur).
    if (acikVeKendi('cuma') && tarihGunu(gun.tarih) === 5) {
      const bas = gun.vakitler.gunes.getTime();
      const hedef = gun.vakitler.ogle.getTime();
      if (hedef > bas && pencereIcindeMi(simdiMs, bas, hedef)) {
        adaylar.push({
          oge: 'cuma',
          kaynak: 'nowBar',
          id: `${CANLI_SAYAC_ONEKI}cuma_${gun.tarih}`,
          baslangicMs: bas,
          dogalBaslangicMs: bas,
          hedefMs: hedef,
          baslik: '🕌 Cuma Namazı',
          govdeSablonu: 'Öğle vaktine (hutbeye) kalan süre\n⏱️ {time}',
          kanalId: CANLI_SAYAC_KANALI,
          tema: 'cuma',
          hedefteKaybol: true,
          canli: { baslangicMs: bas, bolumler: [] },
        });
      }
    }

    // Nafileler — teheccüd o günün gecesidir (yatsı → ertesi imsak).
    if (!ertesi) return;
    const nafileAcik = (['kusluk', 'evvabin', 'teheccud'] as const).some((t) => acikVeKendi(t));
    if (!nafileAcik || g.ozelGundeMi(gun.tarih)) return;
    for (const p of nafilePencereleriHesapla(gun.vakitler, ertesi.vakitler.imsak)) {
      if (!acikVeKendi(p.tur)) continue;
      // Teheccüdün "girince"si yatsı değil, gecenin son üçte biridir (uyuyup kalkma
      // şartı dakikayla modellenmez — AGENTS.md nafile maddesi).
      const dogal = p.tur === 'teheccud' ? p.faziletli.getTime() : p.baslangic.getTime();
      const hedef = p.bitis.getTime();
      if (!(hedef > dogal) || !pencereIcindeMi(simdiMs, dogal, hedef)) continue;
      const ad = NOW_BAR_OGE_BILGILERI[p.tur].ad;
      adaylar.push({
        oge: p.tur,
        kaynak: 'nowBar',
        id: `${CANLI_SAYAC_ONEKI}${p.tur}_${gun.tarih}`,
        baslangicMs: dogal,
        dogalBaslangicMs: dogal,
        hedefMs: hedef,
        baslik: `✨ ${ad}`,
        govdeSablonu: `${ad} vaktinin bitişine kalan süre\n⏱️ {time}`,
        kanalId: CANLI_SAYAC_KANALI,
        tema: 'nafile',
        hedefteKaybol: true,
        canli: { baslangicMs: dogal, bolumler: [] },
      });
    }
  });
  return adaylar;
}

// ---------------------------------------------------------------------------
// Zaman çizelgesi (tek öne çıkan kuralı)
// ---------------------------------------------------------------------------

interface EtkinAday {
  aday: CanliAday;
  bas: number;
}

const kazananSirasi = (a: EtkinAday, b: EtkinAday): number =>
  NOW_BAR_ONCELIK[a.aday.oge] - NOW_BAR_ONCELIK[b.aday.oge] ||
  a.aday.hedefMs - b.aday.hedefMs ||
  (a.aday.id < b.aday.id ? -1 : a.aday.id > b.aday.id ? 1 : 0);

/**
 * Adayları seçime göre süzer, aynı kimliği tekilleştirir (önceliği yüksek olan
 * kalır) ve görünür başlangıcı (`bas`) kurar.
 */
export function etkinAdaylar(adaylar: readonly CanliAday[], ayarlar: NowBarAyarlari, simdiMs: number): EtkinAday[] {
  const kimlikle = new Map<string, EtkinAday>();
  for (const aday of adaylar) {
    if (aday.kaynak === 'sayac' && !sayacAdayiKullanilirMi(aday, ayarlar)) continue;
    const secim = secimliBaslangic(aday, ayarlar);
    if (secim === null || aday.hedefMs <= simdiMs) continue;
    const etkin = { aday, bas: Math.max(secim, simdiMs) };
    const onceki = kimlikle.get(aday.id);
    if (!onceki || kazananSirasi(etkin, onceki) < 0) kimlikle.set(aday.id, etkin);
  }
  return [...kimlikle.values()];
}

type Durum = 'oneCikar' | 'normal' | 'gizli';

/**
 * Olay listesi. Her aralıkta (başlangıç/hedef sınırları arası) en fazla BİR aday
 * öne çıkar; kaybeden sayaç adayı `normal`, kaybeden Now Bar adayı gizlidir.
 * Durum yalnız DEĞİŞTİĞİNDE olay üretilir. Kronolojik; aynı anda önce gizleme,
 * sonra gösterme (kısa süre de olsa iki çip görünmesin).
 */
export function canliZamanCizelgesiOlustur(
  adaylar: readonly CanliAday[],
  ayarlar: NowBarAyarlari,
  simdiMs: number
): CanliOlay[] {
  const etkinler = etkinAdaylar(adaylar, ayarlar, simdiMs);
  const sinirlar = [...new Set(etkinler.flatMap((e) => [e.bas, e.aday.hedefMs]))].sort((a, b) => a - b);
  const durumlar = new Map<string, Durum>();
  const olaylar: CanliOlay[] = [];

  for (const t of sinirlar) {
    const aktifler = etkinler.filter((e) => e.bas <= t && t < e.aday.hedefMs).sort(kazananSirasi);
    // Hedefi geçenler listeden düşer — olay yok (bitiş alarmı kaldırır).
    for (const e of etkinler) {
      if (t >= e.aday.hedefMs) durumlar.delete(e.aday.id);
    }
    const gizlemeler: CanliOlay[] = [];
    const gosterimler: CanliOlay[] = [];
    aktifler.forEach((e, i) => {
      const yeni: Durum = i === 0 ? 'oneCikar' : e.aday.kaynak === 'sayac' ? 'normal' : 'gizli';
      const eski = durumlar.get(e.aday.id) ?? 'gizli';
      if (yeni === eski) return;
      durumlar.set(e.aday.id, yeni);
      if (yeni === 'gizli') gizlemeler.push({ anMs: t, id: e.aday.id, eylem: 'gizle' });
      else gosterimler.push({ anMs: t, id: e.aday.id, eylem: yeni, aday: e.aday });
    });
    olaylar.push(...gizlemeler, ...gosterimler);
  }
  return olaylar;
}

// ---------------------------------------------------------------------------
// Native sözleşmesi (Kotlin `CanliPlanKurallari.planiCoz` ile ortak fikstür)
// ---------------------------------------------------------------------------

/**
 * Native'e giden JSON. Alan adları Kotlin tarafıyla kilitlidir:
 * `modules/expo-countdown-notification/android/src/test/resources/canli-plan-ornegi.json`.
 */
export function canliPlanJsonuOlustur(olaylar: readonly CanliOlay[]): string {
  return JSON.stringify(
    olaylar.map((o) =>
      o.eylem === 'gizle' || !o.aday
        ? { anMs: o.anMs, id: o.id, eylem: 'gizle' }
        : {
            anMs: o.anMs,
            id: o.id,
            eylem: o.eylem,
            kaynak: o.aday.kaynak,
            hedefMs: o.aday.hedefMs,
            baslik: o.aday.baslik,
            govde: o.aday.govdeSablonu,
            kanalId: o.aday.kanalId,
            tema: o.aday.tema,
            ek: {
              baslangicMs: o.aday.canli.baslangicMs,
              bolumler: o.aday.canli.bolumler,
              kildim: o.aday.canli.kildim,
              hedefteKaybol: o.aday.hedefteKaybol,
            },
          }
    )
  );
}

// ---------------------------------------------------------------------------
// Saat (Wear OS) — aynı seçim, saatin kendi yüzeyi
// ---------------------------------------------------------------------------

export interface SaatCanliPenceresi {
  oge: NowBarOgesi;
  baslik: string;
  /** Kısa durum metni (ör. "İftar"). */
  ad: string;
  bas: number;
  bitis: number;
  oncelik: number;
  /** Yalnız vakit öğelerinde: saatte "Kıldım" ve kılınmışlık kontrolü. */
  tarih?: string;
  vakit?: NowBarVakti;
}

/** Yükte en fazla bu kadar pencere (48 sa ufukta pratikte < 20). */
export const SAAT_CANLI_MAKS = 40;

/**
 * Saate giden öne çıkan dilimler. Vakitlerin `sayacla` seçeneği saatte kendi
 * "son dakikalar" sayacıyla (muhafız planından) karşılanır → o adaylar DIŞARIDA
 * tutulur; saat vakit başına `vakitler` seçimine bakar.
 */
export function saatPencereleriniOlustur(
  adaylar: readonly CanliAday[],
  ayarlar: NowBarAyarlari,
  simdiMs: number
): SaatCanliPenceresi[] {
  const saatAdaylari = adaylar.filter((a) => !(a.kaynak === 'sayac' && nowBarVaktiMi(a.oge)));
  const olaylar = canliZamanCizelgesiOlustur(saatAdaylari, ayarlar, simdiMs);
  const pencereler: SaatCanliPenceresi[] = [];
  const acik = new Map<string, SaatCanliPenceresi>();
  const kapat = (id: string, t: number) => {
    const p = acik.get(id);
    if (!p) return;
    p.bitis = Math.min(p.bitis, t);
    if (p.bitis > p.bas) pencereler.push(p);
    acik.delete(id);
  };
  for (const o of olaylar) {
    if (o.eylem === 'oneCikar' && o.aday) {
      // Yeni kazanan çıkınca önceki öne çıkan (varsa) burada biter.
      for (const id of [...acik.keys()]) if (id !== o.id) kapat(id, o.anMs);
      const a = o.aday;
      const kildim = a.canli.kildim;
      acik.set(o.id, {
        oge: a.oge,
        baslik: a.baslik,
        ad: NOW_BAR_OGE_BILGILERI[a.oge].ad,
        bas: o.anMs,
        bitis: a.hedefMs,
        oncelik: NOW_BAR_ONCELIK[a.oge],
        ...(kildim && nowBarVaktiMi(a.oge) ? { tarih: kildim.tarih, vakit: a.oge } : {}),
      });
    } else {
      kapat(o.id, o.anMs);
    }
  }
  for (const id of [...acik.keys()]) kapat(id, Number.POSITIVE_INFINITY);
  return pencereler.sort((a, b) => a.bas - b.bas).slice(0, SAAT_CANLI_MAKS);
}

/**
 * Saatin vakit başına "son dakikalar" seçimi: yalnız öğe açık VE `sayacla` iken
 * saat kendi (muhafız planından türeyen) sayacını gösterir. `girince/sonDk`
 * seçilen vakit `pencereler` ile gelir; kapalı vakit hiç gösterilmez.
 */
export function saatVakitSecimi(ayarlar: NowBarAyarlari): Record<NowBarVakti, boolean> {
  const sonuc = {} as Record<NowBarVakti, boolean>;
  for (const v of NOW_BAR_VAKITLERI) {
    sonuc[v] = ayarlar.ogeler[v].acik && ayarlar.ogeler[v].baslangic === 'sayacla';
  }
  return sonuc;
}
