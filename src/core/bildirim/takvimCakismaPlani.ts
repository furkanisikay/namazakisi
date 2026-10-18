/**
 * Takvim çakışması uyarısı PLANI — SAF (issue #291).
 *
 * `TakvimCakismaServisi` ve bildirim defteri (issue #298) AYNI üreticiyi
 * kullanır: servise eklenecek her eleme kuralı BURAYA eklenir, yoksa rehber
 * ekranı "sığıyor" derken cihaz keser.
 *
 * KARAR KURALI (tek cümle): **etkinlik bittiğinde vaktin çıkmasına
 * `KILMA_PAYI_DK`'dan az kalıyorsa, etkinlik o vaktin sonunu yutar** ve kişi
 * önceden uyarılır. Ayrıntılar:
 *
 *  1. Etkinlik süzgeci (`etkinlikleriSuz`): tüm gün etkinlikleri, "meşgul
 *     değil" (availability `free`), "belki" (availability ya da status
 *     `tentative` — yanıtlanmamış/kesinleşmemiş davetler; meşgul sayılınca
 *     yanlış pozitif yağıyordu) ve iptal edilmiş (`canceled`) etkinlikler,
 *     uygulamanın KENDİ yazdığı namaz etkinlikleri (`UYGULAMA_TAKVIM_NOTU`),
 *     bozuk tarihliler ve `ETKINLIK_AZAMI_SURE_DK`'dan (8 sa) uzun olanlar
 *     atlanır. Uzun blok çoğu zaman "mesai/izin" işaretidir; onu her gün öğle
 *     ve ikindiyle çakıştırmak bildirimi gürültüye çevirirdi.
 *  2. Bloklar: aralarında `KILMA_PAYI_DK`'dan kısa boşluk olan etkinlikler TEK
 *     blok sayılır (14:00–15:30 + 15:35–17:30 → 14:00–17:30). Beş dakikalık
 *     arada namaz kılınamaz; ayrı ayrı bakılsaydı art arda toplantılar hiçbir
 *     zaman "çakışma" sayılmazdı.
 *  3. Vaktin SON UYGUN ANI: çıkış. İkindide çıkış değil gurub kerahatinin
 *     başlangıcı (`gurubKerahatiBaslangiciMs` — kaza ve erteleme ile TEK kaynak):
 *     ikindiyi güneşin sararmasına bırakmak da bir kayıptır.
 *  4. Çakışma: blok `sonAn − PAY`'den ÖNCE başlar ve `sonAn − PAY`'den SONRA
 *     biter. Blok vaktin son dakikalarında başlıyorsa (sonAn − PAY sonrası)
 *     kayıp önemsizdir → uyarı yok.
 *  5. Tür:
 *     - `once`: girişle blok arasında en az PAY dakika var → "etkinlik
 *       başlamadan kıl". Bildirim `max(blok başı − öncedenDk, vakit girişi)`:
 *       vakit girmeden "kıl" denmez.
 *     - `kapliyor`: vakit girdiğinde blok zaten sürüyor (ya da PAY'den az sonra
 *       başlıyor) → vakit tümden kaplanmış; "ara verip kılmayı planla".
 *       Bildirim `min(blok başı, giriş) − öncedenDk`, ama vakit girişinden en
 *       fazla `KAPLIYOR_AZAMI_ONCELIK_DK` (60) önce: blok vakitten saatler önce
 *       başlıyorsa (09:00–16:25 toplantısı) öğle uyarısı sabah 08:30'a düşerdi.
 *  6. Vakit başına (gün başına) en fazla BİR çakışma; bloklardan sonuncusu
 *     (vaktin sonunu yutan) seçilir. Kılınmış vakit, özel gün (issue #272) ve
 *     geçmiş tetikler atlanır.
 *
 * ADIM DİZİSİ (ortak hatırlatma yüzeyleri plan §5.4): her çakışmanın tetikleri muhafızın bir
 * vakti gibi `vakitUyariPlaniOlustur`'dan gelir (eşik, sıklık, kanallar, gerçek alarm anı
 * AYNI motordan). Ölçü = ÇAPAYA kalan süre; her tetik `max(çapa − kalanDk, taban)`:
 *   - `once`: çapa = blok başı, taban = vakit girişi.
 *   - `kapliyor`: çapa = `min(blok başı, giriş)`, taban = `giriş − KAPLIYOR_AZAMI_ONCELIK_DK`.
 * Tekrar çapaya kadar sürer (= AYNI uyarının yeniden teslimi; metin değişmez). Tabana
 * kenetlenip AYNI ana düşen tetikler TEK uyarıda BİRLEŞİR (`ayniAnaDusenleriBirlestir`:
 * kanallar OR, ses/anons/alarm en güçlü adımdan; kimlik ve sıra öncekinin).
 * KİMLİK: çakışmanın İLK tetiği (motor sırası) tarihsel `takvim_cakisma_<gün>_<vakit>`
 * kimliğini korur — göçten gelen tek adımlı kayıt birebir aynı planı üretir; diğerleri
 * `_<kalanDk>` ekiyle ayrışır. Android alarm payı (`alarmButcesi`) KRONOLOJİK keser.
 *
 * GİZLİLİK: etkinlik ADI yalnız `baslikGoster` açıkken ve yalnız BİLDİRİM metnine girer.
 * Sesli anons metni (`takvimCakismaAnonsMetni`) adı ve saati HİÇ taşımaz; GERÇEK ALARM
 * kuran tetiğin metni `baslikGoster` kapalıymış gibi üretilir (alarm tam ekran kilit
 * ekranında açılır). Bedel: alarm kurulamayıp bildirime düşerse o bildirim de adsızdır.
 *
 * Kimlik `takvim_cakisma_<vaktin günü>_<vakit>` (yatsının günü girdiği gündür).
 * Bildirim metni (`takvimCakismaMetniOlustur`) İBADETE ÇAĞRI kaydındadır ("sen" + emir
 * kipi — AGENTS.md istisnası); anons metni ve ayar ekranı kibar "siz".
 *
 * SAF: `simdi` enjekte edilir; React/expo import ETMEZ.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import type { VakitAdi } from '../types';
import type { BildirimPlatformu } from './butceSabitleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';
import { VAKIT_ADLARI } from '../utils/muhafizMetinYardimcisi';
import { gurubKerahatiBaslangiciMs } from '../muhafiz/erteleme';
import { UYGULAMA_TAKVIM_NOTU, type TakvimCakismaAyarlari } from '../takvimCakisma/takvimCakismaAyarlari';
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import { vakitUyariPlaniOlustur, type UyariPlani } from '../muhafiz/motorAdaptoru';
import { alarmPayinaSigdir, ayniAnaDusenleriBirlestir, ekAlarmKurarMi } from '../hatirlatma/ekPlan';
import { adimAnonsMetni } from '../hatirlatma/anonsYerTutucu';

export type CakismaVakti = Exclude<VakitAdi, 'gunes'>;
export const CAKISMA_VAKITLERI: readonly CakismaVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

/** Bildirim id öneki — temizlik bu önekle SÜZER, başka sistemlere dokunmaz. */
export const TAKVIM_CAKISMA_ID_ONEKI = 'takvim_cakisma_';

/** Kaç gün ileri planlanır (bugün dahil) — iOS 64 bekleyen bildirim bütçesi. */
export const TAKVIM_CAKISMA_PLAN_GUN_SAYISI: Record<BildirimPlatformu, number> = { android: 7, ios: 3 };

/** Bir farz namaz için gereken en kısa boşluk (abdestli, kısa kıraat). */
export const KILMA_PAYI_DK = 10;

/**
 * "Kaplıyor" uyarısı vakit girişinden en fazla bu kadar önce gelir (bkz. kural 5).
 * Uyarının konusu o vakit; saatler önce gelen uyarı unutulur ve gürültüdür.
 */
export const KAPLIYOR_AZAMI_ONCELIK_DK = 60;

/** Bundan uzun TEK etkinlik (mesai, izin bloğu) çakışma sayılmaz. */
export const ETKINLIK_AZAMI_SURE_DK = 8 * 60;

const DK = 60_000;

/** expo-calendar `Event`'in kullandığımız alanları (core expo import etmez). */
export interface HamTakvimEtkinligi {
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    allDay?: boolean | null;
    /** expo `Availability`: 'busy' | 'free' | 'tentative' | 'unavailable' | 'notSupported' */
    availability?: string | null;
    /** expo `EventStatus`: 'none' | 'confirmed' | 'tentative' | 'canceled' */
    status?: string | null;
    title?: string | null;
    notes?: string | null;
}

export interface TakvimEtkinligi {
    baslangicMs: number;
    bitisMs: number;
    /** Kırpılmış ad; yoksa null. YALNIZ bellekte yaşar, diske/loga yazılmaz. */
    baslik: string | null;
}

const BASLIK_AZAMI_UZUNLUK = 60;

const zamanMs = (d: string | Date | null | undefined): number => {
    if (d instanceof Date) return d.getTime();
    if (typeof d === 'string' && d.length > 0) return Date.parse(d);
    return Number.NaN;
};

/** Ham etkinlikleri kurala göre süzer ve sıralar (bkz. dosya başı, kural 1). */
export function etkinlikleriSuz(hamlar: readonly HamTakvimEtkinligi[]): TakvimEtkinligi[] {
    const sonuc: TakvimEtkinligi[] = [];
    const gorulen = new Set<string>();
    for (const e of hamlar) {
        if (!e || e.allDay === true) continue;
        if (e.availability === 'free') continue;
        // "Belki": kesinleşmemiş davet — meşgul sayılırsa her yanıtlanmamış davet uyarı üretir.
        if (e.availability === 'tentative' || e.status === 'tentative') continue;
        if (e.status === 'canceled') continue;
        if (typeof e.notes === 'string' && e.notes.includes(UYGULAMA_TAKVIM_NOTU)) continue;
        const baslangicMs = zamanMs(e.startDate);
        const bitisMs = zamanMs(e.endDate);
        if (!Number.isFinite(baslangicMs) || !Number.isFinite(bitisMs) || bitisMs <= baslangicMs) continue;
        if (bitisMs - baslangicMs > ETKINLIK_AZAMI_SURE_DK * DK) continue;
        const kirpilmis = typeof e.title === 'string' ? e.title.trim().slice(0, BASLIK_AZAMI_UZUNLUK) : '';
        const baslik = kirpilmis.length > 0 ? kirpilmis : null;
        // Aynı etkinlik iki takvimde (davetli + kendi kopyası) görünebilir.
        const anahtar = `${baslangicMs}|${bitisMs}|${baslik ?? ''}`;
        if (gorulen.has(anahtar)) continue;
        gorulen.add(anahtar);
        sonuc.push({ baslangicMs, bitisMs, baslik });
    }
    return sonuc.sort((a, b) => a.baslangicMs - b.baslangicMs || a.bitisMs - b.bitisMs);
}

export interface MesgulBlok {
    baslangicMs: number;
    bitisMs: number;
    etkinlikler: TakvimEtkinligi[];
}

/** Arası `KILMA_PAYI_DK`'dan kısa etkinlikleri tek bloğa birleştirir (kural 2). */
export function mesgulBloklariOlustur(etkinlikler: readonly TakvimEtkinligi[]): MesgulBlok[] {
    const sirali = [...etkinlikler].sort((a, b) => a.baslangicMs - b.baslangicMs);
    const bloklar: MesgulBlok[] = [];
    for (const e of sirali) {
        const son = bloklar[bloklar.length - 1];
        if (son && e.baslangicMs - son.bitisMs < KILMA_PAYI_DK * DK) {
            son.bitisMs = Math.max(son.bitisMs, e.bitisMs);
            son.etkinlikler.push(e);
        } else {
            bloklar.push({ baslangicMs: e.baslangicMs, bitisMs: e.bitisMs, etkinlikler: [e] });
        }
    }
    return bloklar;
}

export interface VakitAraligi {
    girisMs: number;
    /** Vaktin son uygun anı (ikindide gurub kerahati başı). */
    sonAnMs: number;
}

export type CakismaTuru = 'once' | 'kapliyor';

export interface CakismaKarari {
    tur: CakismaTuru;
    blok: MesgulBlok;
}

/**
 * Tek vakit için karar (kural 4–6). Saf ve zamandan bağımsız: tetik anını
 * çağıran hesaplar. Çakışma yoksa `null`.
 */
export function vakitCakismasiniBul(vakit: VakitAraligi, bloklar: readonly MesgulBlok[]): CakismaKarari | null {
    const pay = KILMA_PAYI_DK * DK;
    const kritik = vakit.sonAnMs - pay;
    if (kritik <= vakit.girisMs) return null;
    let onceki: MesgulBlok | null = null;
    for (const blok of bloklar) {
        if (blok.baslangicMs < kritik && blok.bitisMs > kritik) {
            const serbestBas = Math.max(vakit.girisMs, onceki ? onceki.bitisMs : Number.NEGATIVE_INFINITY);
            const tur: CakismaTuru = blok.baslangicMs - serbestBas >= pay ? 'once' : 'kapliyor';
            return { tur, blok };
        }
        if (blok.baslangicMs >= kritik) break;
        onceki = blok;
    }
    return null;
}

export interface TakvimCakismaPlanKaydi {
    id: string;
    vakit: CakismaVakti;
    /** Vaktin ait olduğu gün (YYYY-MM-DD). */
    tarih: string;
    tur: CakismaTuru;
    /** Bildirim anı. */
    zaman: Date;
    /** Çapaya kaç dk kala (motorun `kalanDk`'sı; tabana kenetlenmiş tetikte de motorun değeri). */
    kalanDk: number;
    /**
     * Uyarının anlamlı olduğu SON an (gerçek alarm geç tetikte burada atlar): `max(blok başı,
     * vakit girişi)` — `once`'da blok başı, `kapliyor`'da çoğunlukla giriş; daima tetikten SONRA.
     */
    cikis: Date;
    girisMs: number;
    sonAnMs: number;
    blokBaslangicMs: number;
    blokBitisMs: number;
    etkinlikSayisi: number;
    /** Tek etkinlik varsa adı (yalnız `baslikGoster` iken METNE girer). */
    tekBaslik: string | null;
    /** Bildirim başlığı/gövdesi (gerçek alarm tetiğinde ADSIZ). */
    baslik: string;
    govde: string;
    /** Motorun uyarısı — kanallar, gerçek alarm anı; `anonsMetni` ÇÖZÜLMÜŞ ve ADSIZ cümledir. */
    uyari: UyariPlani;
}

export type TakvimCakismaPlanAyarlari = Pick<TakvimCakismaAyarlari, 'aktif' | 'adimlar'> &
    Partial<Pick<TakvimCakismaAyarlari, 'baslikGoster'>>;

export interface TakvimCakismaPlanGirdisi {
    koordinat: { lat: number; lng: number };
    ayarlar: TakvimCakismaPlanAyarlari;
    simdi: Date;
    gunSayisi: number;
    etkinlikler: readonly TakvimEtkinligi[];
    /** Gün (YYYY-MM-DD) → kılınmış vakitler. */
    kilinanlar?: (tarih: string) => readonly VakitAdi[];
    /** Özel gün kapısı — `true` dönen günün hiçbir uyarısı kurulmaz. */
    gunAtlanirMi?: (tarih: string) => boolean;
    /** Android alarm payı (bildirim + anons alarmı, kronolojik). Verilmezse kesilmez. */
    alarmButcesi?: number;
}

const adimlarGecerliMi = (adimlar: unknown): adimlar is SeviyeAyari[] => Array.isArray(adimlar) && adimlar.length > 0;

const vakitAraliklari = (gun: Date, coordinates: Coordinates): Record<CakismaVakti, VakitAraligi> | null => {
    const params = turkiyeHesapParametreleri();
    const pt = new PrayerTimes(coordinates, gun, params);
    const yarin = new PrayerTimes(coordinates, new Date(gun.getFullYear(), gun.getMonth(), gun.getDate() + 1), params);
    const zamanlar = [pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha, yarin.fajr];
    if (zamanlar.some((z) => !(z instanceof Date) || !Number.isFinite(z.getTime()))) return null;
    return {
        imsak: { girisMs: pt.fajr.getTime(), sonAnMs: pt.sunrise.getTime() },
        ogle: { girisMs: pt.dhuhr.getTime(), sonAnMs: pt.asr.getTime() },
        ikindi: { girisMs: pt.asr.getTime(), sonAnMs: gurubKerahatiBaslangiciMs(pt.maghrib.getTime()) },
        aksam: { girisMs: pt.maghrib.getTime(), sonAnMs: pt.isha.getTime() },
        yatsi: { girisMs: pt.isha.getTime(), sonAnMs: yarin.fajr.getTime() },
    };
};

/**
 * Önümüzdeki `gunSayisi` günün uyarıları (kronolojik). Plan DÜNDEN başlar:
 * gece yarısından sonra dünün yatsısı hâlâ sürüyordur.
 */
export function takvimCakismaPlaniOlustur(g: TakvimCakismaPlanGirdisi): TakvimCakismaPlanKaydi[] {
    if (!g.ayarlar.aktif || g.etkinlikler.length === 0 || !adimlarGecerliMi(g.ayarlar.adimlar)) return [];
    const bloklar = mesgulBloklariOlustur(g.etkinlikler);
    const coordinates = new Coordinates(g.koordinat.lat, g.koordinat.lng);
    const simdiMs = g.simdi.getTime();
    const gunAtlanirMi = g.gunAtlanirMi ?? (() => false);
    const baslikGoster = g.ayarlar.baslikGoster === true;

    // Tarama en uzak eşikten başlar (çıkış yönü: ölçü azalarak çapaya yaklaşır). Motor
    // çıktısı kalanDk'ya göre AZALAN = kronolojik; ilk = çakışmanın ilk tetiği.
    const enBuyukEsik = Math.max(...g.ayarlar.adimlar.map((a) => a.esikDk));
    const adimPlani = vakitUyariPlaniOlustur({ yon: 'cikisaDogru', seviyeler: g.ayarlar.adimlar }, enBuyukEsik);
    const plan: TakvimCakismaPlanKaydi[] = [];

    for (let i = -1; i < g.gunSayisi; i++) {
        // YEREL gün aritmetiği (ISO parse UTC tuzağı).
        const gun = new Date(g.simdi.getFullYear(), g.simdi.getMonth(), g.simdi.getDate() + i);
        const tarih = tarihiISOFormatinaCevir(gun);
        if (gunAtlanirMi(tarih)) continue;
        const araliklar = vakitAraliklari(gun, coordinates);
        if (!araliklar) continue;
        const kilinan = g.kilinanlar?.(tarih) ?? [];
        for (const vakit of CAKISMA_VAKITLERI) {
            if (kilinan.includes(vakit)) continue;
            const aralik = araliklar[vakit];
            const karar = vakitCakismasiniBul(aralik, bloklar);
            if (!karar) continue;
            const { blok, tur } = karar;
            const tetikGirdisi = { tur, girisMs: aralik.girisMs, blokBaslangicMs: blok.baslangicMs };
            const cikis = new Date(Math.max(blok.baslangicMs, aralik.girisMs));
            const ortak = {
                vakit,
                tarih,
                tur,
                girisMs: aralik.girisMs,
                sonAnMs: aralik.sonAnMs,
                blokBaslangicMs: blok.baslangicMs,
                blokBitisMs: blok.bitisMs,
                etkinlikSayisi: blok.etkinlikler.length,
                tekBaslik: blok.etkinlikler.length === 1 ? blok.etkinlikler[0].baslik : null,
            };
            const kok = takvimCakismaKimligi(tarih, vakit);
            const anons = takvimCakismaAnonsMetni(vakit, tur);
            // Tabana kenetlenip AYNI ana düşen tetikler TEK uyarıda BİRLEŞİR (kanallar OR,
            // ses/alarm en güçlü adımdan) — ilkini tutmak güçlü kanalı (alarm) düşürürdü.
            const anlar = new Map<number, { sira: number; uyari: UyariPlani }>();
            for (const [sira, uyari] of adimPlani.entries()) {
                const { zamanMs } = takvimCakismaTetigi(tetikGirdisi, uyari.kalanDk);
                if (zamanMs <= simdiMs) continue;
                const mevcut = anlar.get(zamanMs);
                if (mevcut) mevcut.uyari = ayniAnaDusenleriBirlestir(mevcut.uyari, uyari);
                else anlar.set(zamanMs, { sira, uyari });
            }
            for (const [zamanMs, { sira, uyari }] of anlar) {
                // Kullanıcının metni: `{süre}` = `takvimCakismaTetigi` ölçüsü (önizlemeyle AYNI
                // kural; asla negatif değil). Bağlamda etkinlik ADI YOKTUR — tip taşımaz, ad
                // hiçbir yer tutucuyla okunamaz (gizlilik). Boşsa otomatik.
                const adimUyarisi: UyariPlani = {
                    ...uyari,
                    anonsMetni: adimAnonsMetni(
                        uyari.anonsMetni,
                        { vakit: VAKIT_ADLARI[vakit], sureDk: takvimCakismaTetigi(tetikGirdisi, uyari.kalanDk).sureDk },
                        () => anons
                    ),
                };
                // Gerçek alarm tam ekran kilit ekranında açılır → ad ASLA (baslikGoster olsa bile).
                const adGosterilir = baslikGoster && !ekAlarmKurarMi({ uyari: adimUyarisi });
                plan.push({
                    ...ortak,
                    id: sira === 0 ? kok : `${kok}_${uyari.kalanDk}`,
                    zaman: new Date(zamanMs),
                    kalanDk: uyari.kalanDk,
                    cikis,
                    ...takvimCakismaMetniOlustur(ortak, { baslikGoster: adGosterilir }),
                    uyari: adimUyarisi,
                });
            }
        }
    }
    plan.sort((a, b) => a.zaman.getTime() - b.zaman.getTime());
    return alarmPayinaSigdir(plan, g.alarmButcesi);
}

/**
 * Bir çakışma adımının TETİK anı ve sesli okumadaki `{süre}` ölçüsü — planlayıcı ve ekran
 * önizlemesi AYNI kuraldan beslenir.
 *
 * Tetik `max(çapa − kalanDk, taban)`: `once`'ta çapa blok başı, taban vakit girişi;
 * `kapliyor`'da çapa `min(blok, giriş)`, taban `giriş − KAPLIYOR_AZAMI_ONCELIK_DK`.
 *
 * `{süre}` "kaç dakika sonra çakışma başlıyor"dur: `once`'ta ETKİNLİĞİN başına, `kapliyor`'da
 * VAKİT GİRİŞİNE kalan dakika (etkinlik çoktan başlamış olabilir — çapaya göre ölçmek
 * "-174 dakika" okuturdu). Tetik her iki türde de o andan önce kurulduğu için ölçü pozitiftir;
 * yine de 0'ın altına inmez.
 */
export function takvimCakismaTetigi(
    c: { tur: CakismaTuru; girisMs: number; blokBaslangicMs: number },
    kalanDk: number
): { zamanMs: number; sureDk: number } {
    const capaMs = c.tur === 'once' ? c.blokBaslangicMs : Math.min(c.blokBaslangicMs, c.girisMs);
    const tabanMs = c.tur === 'once' ? c.girisMs : c.girisMs - KAPLIYOR_AZAMI_ONCELIK_DK * DK;
    const zamanMs = Math.max(capaMs - kalanDk * DK, tabanMs);
    const olcuAniMs = c.tur === 'once' ? c.blokBaslangicMs : c.girisMs;
    return { zamanMs, sureDk: Math.max(0, Math.round((olcuAniMs - zamanMs) / DK)) };
}

/** Bu servisin bildirim kimliği mi? */
export const takvimCakismaKimligiMi = (kimlik: string): boolean => kimlik.startsWith(TAKVIM_CAKISMA_ID_ONEKI);

/**
 * Bir vaktin uyarı kimlik KÖKÜ (`takvim_cakisma_<gün>_<vakit>`): ilk tetiğin kimliği budur,
 * tekrarlar `_<kalanDk>` eki taşır. Kılınma anında iptal bu kökle (sınırlı) yapılır.
 */
export const takvimCakismaKimligi = (tarih: string, vakit: CakismaVakti): string =>
    `${TAKVIM_CAKISMA_ID_ONEKI}${tarih}_${vakit}`;

/** `kimlik` bu köke (ilk tetik ya da `_<k>` tekrarı) mi ait? Sınır kontrollü — önek çakışmasın. */
export const takvimCakismaKokuneAitMi = (kimlik: string, kok: string): boolean =>
    kimlik === kok || kimlik.startsWith(`${kok}_`);

const VAKIT_KUCUK: Record<CakismaVakti, string> = {
    imsak: 'sabah',
    ogle: 'öğle',
    ikindi: 'ikindi',
    aksam: 'akşam',
    yatsi: 'yatsı',
};

const saat = (ms: number): string => {
    const t = new Date(ms);
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
};

/**
 * Bildirim metni. Saate HAL EKİ eklenmez (AGENTS.md: "04:26'da" okunuşa göre
 * değişir) → "çıkışı 17:12" gibi isim tamlaması kullanılır. Başlık önden
 * okunur (issue #287): vakit adı önde, bileklik ilk ~16 karakteri gösterir.
 * Etkinlik adı YALNIZ `baslikGoster` açıkken ve blokta tek etkinlik varken yazılır.
 */
export function takvimCakismaMetniOlustur(
    kayit: Pick<
        TakvimCakismaPlanKaydi,
        'vakit' | 'tur' | 'girisMs' | 'sonAnMs' | 'blokBaslangicMs' | 'blokBitisMs' | 'etkinlikSayisi' | 'tekBaslik'
    >,
    ayarlar: Pick<TakvimCakismaAyarlari, 'baslikGoster'>
): { baslik: string; govde: string } {
    const ad = VAKIT_ADLARI[kayit.vakit];
    const kucuk = VAKIT_KUCUK[kayit.vakit];
    const aralik = `${saat(kayit.blokBaslangicMs)}–${saat(kayit.blokBitisMs)}`;
    const etkinlik =
        ayarlar.baslikGoster && kayit.etkinlikSayisi === 1 && kayit.tekBaslik
            ? `“${kayit.tekBaslik}”`
            : kayit.etkinlikSayisi > 1
                ? `Takvimindeki ${kayit.etkinlikSayisi} etkinlik art arda`
                : 'Takvimindeki bir etkinlik';

    if (kayit.tur === 'once') {
        const sonAn =
            kayit.vakit === 'ikindi'
                ? `ikindi için son uygun an ${saat(kayit.sonAnMs)} (sonrası kerahat)`
                : `${kucuk} vaktinin çıkışı ${saat(kayit.sonAnMs)}`;
        return {
            baslik: `${ad} · etkinlik ${saat(kayit.blokBaslangicMs)} · önce kıl`,
            govde: `${etkinlik} ${aralik} arası sürüyor; ${sonAn}. Etkinlik başlamadan ${kucuk} namazını kıl.`,
        };
    }
    return {
        baslik: `${ad} · etkinlik vakti kaplıyor`,
        govde:
            `${etkinlik} ${aralik} arası sürüyor ve ${kucuk} vaktini ` +
            `(${saat(kayit.girisMs)}–${saat(kayit.sonAnMs)}) kaplıyor. ` +
            `Kısa bir ara verip ${kucuk} namazını kılmayı şimdiden planla.`,
    };
}

/**
 * Sesli anons metni — kibar "siz" (plan §3.4). Etkinlik ADI ve SAATİ HİÇBİR KOŞULDA girmez:
 * anons yüksek sesle okunur ve sesli okuma `baslikGoster` seçeneğinin kapsamında değildir
 * (rıza modalı ve gizlilik politikası bunu söyler). Nass okunmaz; yer tutucu yoktur.
 */
export function takvimCakismaAnonsMetni(vakit: CakismaVakti, tur: CakismaTuru): string {
    const giris = `Takviminizdeki bir etkinlik ${VAKIT_KUCUK[vakit]} vaktine denk geliyor.`;
    return tur === 'once' ? `${giris} Etkinlikten önce kılmayı unutmayın.` : `${giris} Ara verip kılmayı unutmayın.`;
}
