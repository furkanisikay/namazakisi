/**
 * BİLDİRİM SINIRI REHBERİ — öneri motoru (issue #298). SAF.
 *
 * Sınıra yaklaşan/aşan kullanıcıya "şunları kapatabilir ya da
 * seyrekleştirebiliriz" der. Fable kararları:
 *   - Öneri SIRASI anlam kaybı artan: (1) tekrarlı adımların aralığını 2×
 *     (nazikten başlayarak), (2) nazik adımların tekrarını kaldır, (3) iOS'ta
 *     nafileyi günü gününe kur, (4) adım kapat (nazik → uyarı).
 *   - SERT ve ACİL tona ASLA dokunulmaz (ham ton da etkin ton da korunur).
 *   - Her öneri AYNI defterle ölçülür ("84 → 61"): öneri uygulanmış girdiyle
 *     `bildirimDefteriOlustur` yeniden çalıştırılır, ayrı bir tahmin yok.
 *   - "Ufku kısalt" (muhafızı daha az gün kur) SUNULMAZ: muhafız tam hakla yalnız
 *     bugünü kurar; iOS'ta yarının imsağı BÜTÇE ARTIĞIDIR (yalnız kalan yere girer,
 *     `toplam`/`gelmeyecek`'e sayılmaz) → öneriler onu hiç hedeflemez ve aşımı
 *     yalnız bugünün planı belirler.
 *
 * Bir vaktin SON açık adımı asla kapatılmaz (vakit tümden susmasın).
 */
import type { MuhafizMatrisi, SeviyeAyari, SeviyeKademe, VakitMuhafizAyari } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../muhafiz/matrisTipleri';
import { adimKapaliMi } from '../muhafiz/kanalKumesi';
import { etkinKademe } from '../muhafiz/motorAdaptoru';
import { seviyeyiKapat } from '../muhafiz/seviyeAcKapa';
import { nafileHatirlatmaAcikMi } from '../nafile/nafileTipleri';
import { defterOzetiHesapla, type DefterGirdisi, type DefterOzeti } from './bildirimDefteri';

/**
 * Seyrekleştirmenin tekrar tavanı — ekrandaki tekrar stepper'ının tavanıyla
 * AYNI (`pencereTanimi.TEKRAR_MAX_DK`; nöbetçi test eşitliği doğrular). Öneri
 * ekranın kendisinin izin vermediği bir değer yazmamalı.
 */
export const ONERI_TEKRAR_UST_DK = 30;

export type OneriTuru = 'seyreklestir' | 'tekKez' | 'nafileGunuGunune' | 'adimKapat';

export interface ButceOnerisi {
    tur: OneriTuru;
    ikon: string;
    baslik: string;
    aciklama: string;
    oncekiToplam: number;
    sonrakiToplam: number;
    /** Öneri tek başına sınırın altına indiriyor mu (gelmeyecek = 0)? */
    sinirAltinaIner: boolean;
    /** Öneri uygulanmış girdi (ekran yalnız `muhafiz.matris` / `nafile` alanlarını yazar). */
    girdi: DefterGirdisi;
}

const DOKUNULABILIR: readonly SeviyeKademe[] = ['nazik', 'uyari'];

/** Bu adıma öneri dokunabilir mi? (açık, ham ve etkin ton nazik/uyarı kümesinde) */
const dokunulabilirMi = (s: SeviyeAyari, vakit: VakitMuhafizAyari, tonlar: readonly SeviyeKademe[]): boolean =>
    !adimKapaliMi(s.kanallar) && tonlar.includes(s.kademe) && tonlar.includes(etkinKademe(s, vakit.yon));

const tekrarDk = (s: SeviyeAyari): number | null =>
    typeof s.siklik === 'object' && s.siklik !== null && Number.isFinite(s.siklik.herDk) ? s.siklik.herDk : null;

/** Matrisin her adımına `donustur` uygular; değişen yoksa AYNI referans döner. */
function matrisiDonustur(
    matris: MuhafizMatrisi,
    donustur: (s: SeviyeAyari, vakit: VakitMuhafizAyari) => SeviyeAyari
): MuhafizMatrisi {
    let degisti = false;
    const yeni = { ...matris };
    for (const v of MUHAFIZ_VAKITLERI) {
        const vakit = matris[v];
        if (!vakit?.seviyeler) continue;
        const seviyeler = vakit.seviyeler.map((s) => {
            const d = donustur(s, vakit);
            if (d !== s) degisti = true;
            return d;
        });
        if (seviyeler.some((s, i) => s !== vakit.seviyeler[i])) yeni[v] = { ...vakit, seviyeler };
    }
    return degisti ? yeni : matris;
}

/** (1) Tekrar aralığını iki katına çıkar. */
export const tekrarlariSeyreklestir = (matris: MuhafizMatrisi, tonlar: readonly SeviyeKademe[]): MuhafizMatrisi =>
    matrisiDonustur(matris, (s, vakit) => {
        const her = tekrarDk(s);
        if (her === null || !dokunulabilirMi(s, vakit, tonlar)) return s;
        const yeniHer = Math.min(ONERI_TEKRAR_UST_DK, her * 2);
        return yeniHer > her ? { ...s, siklik: { herDk: yeniHer } } : s;
    });

/** (2) Nazik adımların tekrarını kaldır. */
export const nazikTekrariKaldir = (matris: MuhafizMatrisi): MuhafizMatrisi =>
    matrisiDonustur(matris, (s, vakit) =>
        tekrarDk(s) !== null && dokunulabilirMi(s, vakit, ['nazik']) ? { ...s, siklik: 'birkez' } : s
    );

/** (4) Adımları kapat — vaktin SON açık adımı korunur. */
export function adimlariKapat(matris: MuhafizMatrisi, tonlar: readonly SeviyeKademe[]): MuhafizMatrisi {
    let degisti = false;
    const yeni = { ...matris };
    for (const v of MUHAFIZ_VAKITLERI) {
        const vakit = matris[v];
        if (!vakit?.seviyeler) continue;
        let acikKalan = vakit.seviyeler.filter((s) => !adimKapaliMi(s.kanallar)).length;
        const seviyeler = vakit.seviyeler.map((s) => {
            if (acikKalan <= 1 || !dokunulabilirMi(s, vakit, tonlar)) return s;
            acikKalan--;
            return seviyeyiKapat(s);
        });
        if (seviyeler.some((s, i) => s !== vakit.seviyeler[i])) {
            yeni[v] = { ...vakit, seviyeler };
            degisti = true;
        }
    }
    return degisti ? yeni : matris;
}

const muhafizlaGirdi = (g: DefterGirdisi, matris: MuhafizMatrisi): DefterGirdisi =>
    g.muhafiz ? { ...g, muhafiz: { ...g.muhafiz, matris } } : g;

/**
 * Önce yalnız NAZİK adımlarla dener; o yetmiyorsa nazik + uyarı ile.
 * "Nazikten başlayarak" kuralı: daha az anlam kaybıyla sınırın altına
 * inilebiliyorsa uyarı tonuna hiç dokunulmaz.
 */
function kademeliDene(
    g: DefterGirdisi,
    uygula: (m: MuhafizMatrisi, tonlar: readonly SeviyeKademe[]) => MuhafizMatrisi
): { matris: MuhafizMatrisi; tonlar: readonly SeviyeKademe[]; ozet: DefterOzeti } | null {
    const matris = g.muhafiz?.matris;
    if (!g.muhafiz?.aktif || !matris) return null;
    const yalnizNazik = uygula(matris, ['nazik']);
    const ikisi = uygula(matris, DOKUNULABILIR);
    const nazikOzet = yalnizNazik !== matris ? defterOzetiHesapla(muhafizlaGirdi(g, yalnizNazik)) : null;
    if (nazikOzet && (nazikOzet.gelmeyecek === 0 || ikisi === yalnizNazik)) {
        return { matris: yalnizNazik, tonlar: ['nazik'], ozet: nazikOzet };
    }
    if (ikisi === matris) return null;
    return { matris: ikisi, tonlar: DOKUNULABILIR, ozet: defterOzetiHesapla(muhafizlaGirdi(g, ikisi)) };
}

const tonMetni = (tonlar: readonly SeviyeKademe[]): string =>
    tonlar.length > 1 ? 'Nazik ve uyarı tonundaki' : 'Nazik tonlu';

/**
 * Önerileri üret (sabit sıra). Yalnız sayıyı GERÇEKTEN düşürenler döner.
 * Defter hesabı pahalı değildir (bir günlük plan) ama her öneri en fazla iki
 * kez ölçülür.
 */
export function butceOnerileriOlustur(g: DefterGirdisi): ButceOnerisi[] {
    const once = defterOzetiHesapla(g);
    const oneriler: ButceOnerisi[] = [];
    const ekle = (o: Omit<ButceOnerisi, 'oncekiToplam' | 'sonrakiToplam' | 'sinirAltinaIner'>, ozet: DefterOzeti) => {
        if (ozet.toplam >= once.toplam) return;
        oneriler.push({
            ...o,
            oncekiToplam: once.toplam,
            sonrakiToplam: ozet.toplam,
            sinirAltinaIner: ozet.gelmeyecek === 0,
        });
    };

    // (1) Tekrarları seyrekleştir
    const seyrek = kademeliDene(g, tekrarlariSeyreklestir);
    if (seyrek) {
        ekle(
            {
                tur: 'seyreklestir',
                ikon: 'compress-alt',
                baslik: 'Tekrarları seyrekleştirin',
                aciklama: `${tonMetni(seyrek.tonlar)} tekrarlı hatırlatmaların aralığı iki katına çıkar (en fazla ${ONERI_TEKRAR_UST_DK} dk). Sert ve acil hatırlatmalar aynen kalır.`,
                girdi: muhafizlaGirdi(g, seyrek.matris),
            },
            seyrek.ozet
        );
    }

    // (2) Nazik adımların tekrarını kaldır
    if (g.muhafiz?.aktif && g.muhafiz.matris) {
        const tekKez = nazikTekrariKaldir(g.muhafiz.matris);
        if (tekKez !== g.muhafiz.matris) {
            const girdi = muhafizlaGirdi(g, tekKez);
            ekle(
                {
                    tur: 'tekKez',
                    ikon: 'dot-circle',
                    baslik: 'Nazik hatırlatmalar bir kez çalsın',
                    aciklama: 'Nazik tonlu hatırlatmalar tekrarlamaz; sonraki hatırlatmalar aynen kalır.',
                    girdi,
                },
                defterOzetiHesapla(girdi)
            );
        }
    }

    // (3) iOS: nafileyi günü gününe kur
    if (g.platform === 'ios' && g.nafile && g.nafile.gunuGununeKur !== true && nafileHatirlatmaAcikMi(g.nafile)) {
        const girdi: DefterGirdisi = { ...g, nafile: { ...g.nafile, gunuGununeKur: true } };
        ekle(
            {
                tur: 'nafileGunuGunune',
                ikon: 'calendar-day',
                baslik: 'Nafile hatırlatmalarını günü gününe kurun',
                aciklama:
                    'Şu an birkaç gün önceden kuruluyor; bundan sonra her gün yalnız o günün hatırlatmaları kurulur. Uygulamayı birkaç gün hiç açmazsanız nafile hatırlatması gelmeyebilir.',
                girdi,
            },
            defterOzetiHesapla(girdi)
        );
    }

    // (4) Adım kapat (nazik → uyarı); vaktin son açık adımı korunur
    const kapat = kademeliDene(g, adimlariKapat);
    if (kapat) {
        ekle(
            {
                tur: 'adimKapat',
                ikon: 'bell-slash',
                baslik: kapat.tonlar.length > 1 ? 'Nazik ve uyarı hatırlatmalarını kapatın' : 'Nazik hatırlatmaları kapatın',
                aciklama: `${tonMetni(kapat.tonlar)} hatırlatmalar kapanır; istediğinizde yeniden açabilirsiniz. Her vakitte en az bir hatırlatma açık kalır, sert ve acil hatırlatmalar aynen kalır.`,
                girdi: muhafizlaGirdi(g, kapat.matris),
            },
            kapat.ozet
        );
    }

    return oneriler;
}

export interface DegisiklikSimulasyonu {
    /** Değişiklik uygulanabilir mi? */
    sigar: boolean;
    once: DefterOzeti;
    sonra: DefterOzeti;
}

/**
 * EKLEME ANINDA SİMÜLASYON: bir değişiklik (adım ekleme, sıklaştırma, nafile
 * açma) sığmıyorsa uygulanmaz. Kural: değişiklik bekleyen sayıyı ARTIRIYOR ve
 * sonuç sınırı aşıyorsa sığmaz. Sayıyı artırmayan değişiklik (kapatma,
 * seyrekleştirme) zaten aşımdaki kullanıcıda bile ENGELLENMEZ — yoksa yer
 * açmanın kendisi engellenirdi.
 */
export function degisiklikSimuleEt(once: DefterGirdisi, sonra: DefterGirdisi): DegisiklikSimulasyonu {
    const o = defterOzetiHesapla(once);
    const s = defterOzetiHesapla(sonra);
    return { sigar: !(s.toplam > o.toplam && s.gelmeyecek > 0), once: o, sonra: s };
}
