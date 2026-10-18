/**
 * Saatin SESSİZ UYANDIRMA listesi (saat W3, fikir 2) — SAF.
 *
 * Kullanıcı "Uyandırma nerede çalsın?" sorusuna `saat`/`ikisi` dediyse telefon, sabahın
 * gerçek alarm tetiklerini ve teheccüd uyandırmalarını saate HAZIR liste olarak gönderir;
 * saat bunları yalnız titreşimle, alarm zincirinde ÖNCELİKLİ kayıt olarak çalar. Saatte
 * ikinci bir motor YOKTUR (muhafız planıyla aynı ilke): tetikler telefonun kendi
 * üreticilerinden (`pencereninUyarilari`, `nafilePlaniOlustur`) gelir ve kapı
 * `core/saat/uyandirmaKapisi.ts`'tir — telefonun yedek gecikmesi de aynı kapıdan geçer.
 *
 * Kimlik telefondakiyle AYNIDIR: saat "kapattım" dediğinde telefon yedeğini bu kimlikle
 * iptal eder. Zaman ise ÖZGÜN andır (telefonun yedeği +3 dk kaydırılmış olsa da).
 */
import type { VakitAdi } from '../types';
import type { NafileKoordinat } from '../nafile/gunVakitleri';
import type { NafileAyarlari, NafileTuru } from '../nafile/nafileTipleri';
import { nafilePlaniOlustur } from '../nafile/nafilePlani';
import type { MuhafizMatrisi } from '../muhafiz/matrisTipleri';
import { muhafizUyandirmasiMi, nafileUyandirmasiMi } from '../saat/uyandirmaKapisi';
import { ertelemeSusturuyorMu } from '../muhafiz/erteleme';
import { WEAR_PLAN_UFKU_MS, pencereninUyarilari, vakitPencereleriniOlustur } from './wearMuhafizPlani';

export type WearUyandirmaTuru = 'imsak' | 'teheccud';

export interface WearUyandirmaKaydi {
    /** Telefondaki bildirim/alarmla AYNI kimlik (yedek bununla iptal edilir). */
    id: string;
    /** Özgün tetik anı (epoch ms) — telefonun yedeği bundan `SAAT_YEDEK_GECIKMESI_DK` sonra. */
    ms: number;
    /** Uyandırmanın anlamını yitirdiği an (vakit / pencere sonu) — sonrasında çalınmaz. */
    sonMs: number;
    /** İmsakta vaktin günü, teheccüdde gecesinin yatsısının günü. */
    tarih: string;
    tur: WearUyandirmaTuru;
    baslik: string;
    govde: string;
}

export interface WearUyandirmaGirdisi {
    koordinat: NafileKoordinat;
    bugunIso: string;
    simdiMs: number;
    ufukMs?: number;
    muhafiz?: {
        aktif: boolean;
        matris: MuhafizMatrisi;
        kilinanlar: Record<string, readonly VakitAdi[]>;
        ozelGundeMi?: (tarih: string) => boolean;
        ertelemeler?: Readonly<Record<string, number>>;
    };
    nafile?: {
        ayarlar: NafileAyarlari;
        kilindiMi?: (gunIso: string, tur: NafileTuru) => boolean;
        ozelGundeMi?: (tarih: string) => boolean;
    };
}

const GUN_MS = 24 * 60 * 60 * 1000;

export function wearUyandirmaListesiOlustur(g: WearUyandirmaGirdisi): WearUyandirmaKaydi[] {
    const ufukMs = g.ufukMs ?? WEAR_PLAN_UFKU_MS;
    const ufuk = g.simdiMs + ufukMs;
    const liste: WearUyandirmaKaydi[] = [];

    const m = g.muhafiz;
    if (m?.aktif) {
        const gunSayisi = Math.ceil(ufukMs / GUN_MS) + 2;
        for (const p of vakitPencereleriniOlustur(g.koordinat, g.bugunIso, gunSayisi)) {
            if (p.vakit !== 'imsak') continue;
            if (p.cikis.getTime() <= g.simdiMs || p.giris.getTime() >= ufuk) continue;
            if ((m.kilinanlar[p.tarih] ?? []).includes('imsak') || m.ozelGundeMi?.(p.tarih)) continue;
            for (const { kayit, uyari } of pencereninUyarilari(p, m.matris)) {
                if (!muhafizUyandirmasiMi('imsak', uyari) || kayit.ms <= g.simdiMs) continue;
                if (ertelemeSusturuyorMu(m.ertelemeler, kayit.tarih, kayit.vakit, kayit.ms)) continue;
                liste.push({
                    id: kayit.id,
                    ms: kayit.ms,
                    sonMs: p.cikis.getTime(),
                    tarih: kayit.tarih,
                    tur: 'imsak',
                    baslik: kayit.baslik,
                    govde: kayit.govde,
                });
            }
        }
    }

    const n = g.nafile;
    if (n && n.ayarlar.teheccud.aktif) {
        // Gündüz nafileleri istenmez (0); iki gece = dün gecesi (gece yarısı sonrası) + bu gece.
        const planlar = nafilePlaniOlustur(
            g.koordinat,
            n.ayarlar,
            new Date(g.simdiMs),
            g.bugunIso,
            n.ozelGundeMi ?? (() => false),
            { gunduzGunSayisi: 0, teheccudGeceSayisi: 2, kilindiMi: n.kilindiMi }
        );
        for (const p of planlar) {
            if (!nafileUyandirmasiMi(p) || p.zaman.getTime() >= ufuk) continue;
            liste.push({
                id: p.id,
                ms: p.zaman.getTime(),
                sonMs: p.son.getTime(),
                tarih: p.tarih,
                tur: 'teheccud',
                baslik: p.baslik,
                govde: p.govde,
            });
        }
    }

    return liste.sort((a, b) => a.ms - b.ms);
}

/** Sözleşme doğrulayıcısı (opsiyonel alan; varsa TAM doğrulanır — Kotlin `YukCozucu` ile aynı). */
export function wearUyandirmaGecerliMi(u: unknown): boolean {
    if (u === undefined) return true;
    if (!Array.isArray(u)) return false;
    return u.every((k) => {
        const r = k as Record<string, unknown>;
        return (
            !!r &&
            typeof r.id === 'string' &&
            typeof r.ms === 'number' &&
            typeof r.sonMs === 'number' &&
            (r.sonMs as number) > (r.ms as number) &&
            typeof r.tarih === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(r.tarih) &&
            (r.tur === 'imsak' || r.tur === 'teheccud') &&
            typeof r.baslik === 'string' &&
            typeof r.govde === 'string'
        );
    });
}
