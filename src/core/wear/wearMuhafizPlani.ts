/**
 * Saat için HAZIR muhafız planı (issue #280) — SAF.
 *
 * Telefon yanında değilken de bilekte hatırlatma çalsın diye saat, telefonun
 * GERÇEK motorunun ürettiği planı taşır: her kayıt bir bildirimdir (an, ton,
 * başlık, gövde). Saatte ikinci bir motor YAZILMAZ — iki motor ayrışır (bu
 * projede ön plan/arka plan çift-anons dersiyle ödendi).
 *
 * Parite: kimlik `muhafizBildirimIdOlustur` (telefondaki bildirimle AYNI), zaman
 * `çıkış − kalanDk`, başlık `basligiOlustur(…, olcuDk, yon)`, gövde
 * `muhafizGovdesiSec` — rastgelelik yerine KİMLİKTEN deterministik oran (aynı
 * uyarı her gönderimde aynı metni taşır, yük boşuna "yeni" sayılmaz).
 *
 * Kapsam: çıkışı henüz geçmemiş ve girişi `ufukMs` içinde kalan vakit
 * pencerelerinin TAMAMI (geçmiş dakikalar dahil; saat zaten yalnız gelecektekini
 * kurar). Böylece içerik ancak bir vakit bittiğinde değişir.
 */
import type { VakitAdi } from '../types';
import { gunEkle } from '../utils/TarihYardimcisi';
import { gunVakitleriniHesapla, type NafileKoordinat } from '../nafile/gunVakitleri';
import { basligiOlustur } from '../utils/muhafizMetinYardimcisi';
import type { MuhafizMatrisi, MuhafizVakti } from '../muhafiz/matrisTipleri';
import {
    muhafizAcilKanalMi,
    sesliAnonsGerekliMi,
    titresimGerekliMi,
    vakitUyariPlaniOlustur,
    type UyariPlani,
} from '../muhafiz/motorAdaptoru';
import { anonsMetniniCoz } from '../muhafiz/anonsMetni';
import { VARSAYILAN_PENCERE_YONU } from '../muhafiz/pencereTipleri';
import { pencereUzunluguDkHesapla } from '../muhafiz/pencereUzunlugu';
import { muhafizBildirimIdOlustur } from '../muhafiz/anonsKimligi';
import { kimliktenOran, muhafizGovdesiSec } from '../muhafiz/muhafizGovdesi';

/** Plan ufku: 2 gün. Bağlantısız bir gece + ertesi gün kapsanır. */
export const WEAR_PLAN_UFKU_MS = 48 * 60 * 60 * 1000;

const DK_MS = 60 * 1000;

export interface WearMuhafizKaydi {
    /** Telefondaki bildirimle AYNI kimlik (`muhafiz_<tarih>_vakit_<v>_seviye_<n>_dk_<k>`). */
    id: string;
    /** Tetik anı (epoch ms). */
    ms: number;
    /** Vaktin ait olduğu gün — gece yarısından sonra süren yatsı DÜNE aittir. */
    tarih: string;
    vakit: MuhafizVakti;
    /** 1 nazik · 2 uyarı · 3 sert · 4 acil */
    seviye: 1 | 2 | 3 | 4;
    baslik: string;
    govde: string;
    /** Kullanıcının açtığı BELİRGİN titreşim (`titresimGerekliMi`). */
    titresim: boolean;
    /** Acil ton (`muhafizAcilKanalMi`) — saatte acil kanal + `CATEGORY_ALARM`. */
    acil: boolean;
    /**
     * Adımın KRONOLOJİK sırası (0'dan, `UyariPlani.adimIndeks`) — issue #274.
     * Ton sırayı ima etmediği için saat "vaktin son adımını" (kadrandaki son
     * dakikalar sayacı) bununla bulur. Eklemeli opsiyonel alan: sürüm artmaz,
     * eski saat yok sayar.
     */
    adim: number;
    /**
     * ÇÖZÜLMÜŞ sesli anons cümlesi (saat W3, fikir 9) — yalnız adımın sesli kanalı
     * açıkken ve metin boş değilken. Saat telefon yanında değilken (ya da kullanıcı
     * "saatte" seçtiyse) bunu kendi hoparlöründen okur. `olcuDk` ile çözülür (AGENTS:
     * üçüncü argüman `kalanDk` DEĞİL). Eklemeli opsiyonel alan: sürüm artmaz.
     */
    anons?: string;
}

export interface VakitPenceresi {
    vakit: MuhafizVakti;
    tarih: string;
    giris: Date;
    cikis: Date;
}

export interface WearMuhafizGirdisi {
    koordinat: NafileKoordinat;
    bugunIso: string;
    simdiMs: number;
    aktif: boolean;
    matris: MuhafizMatrisi;
    /** tarih → kılınmış vakitler; kılınmış vaktin penceresi planlanmaz. */
    kilinanlar: Record<string, readonly VakitAdi[]>;
    /**
     * Özel gün kapısı (issue #272, `ozelGunAktifMi`) — VAKTİN GÜNÜNE uygulanır
     * (gece yarısından sonraki yatsı dünün). Telefon özel günde muhafız planlamaz;
     * saat de planlamamalı. Verilmezse kapı kapalı sayılır.
     */
    ozelGundeMi?: (tarih: string) => boolean;
    ufukMs?: number;
}

/**
 * Dünden başlayarak `gunSayisi` günün muhafız pencereleri (yatsı → ertesi imsak).
 * `ArkaplanMuhafizServisi.bugunVakitleriniHesapla` ile aynı tanım, çok güne yayılmış.
 */
export function vakitPencereleriniOlustur(
    koordinat: NafileKoordinat,
    bugunIso: string,
    gunSayisi: number
): VakitPenceresi[] {
    const pencereler: VakitPenceresi[] = [];
    let ertesi = gunVakitleriniHesapla(koordinat, gunEkle(bugunIso, -1));
    for (let i = 0; i < gunSayisi; i++) {
        const tarih = gunEkle(bugunIso, i - 1);
        const v = ertesi;
        ertesi = gunVakitleriniHesapla(koordinat, gunEkle(tarih, 1));
        pencereler.push(
            { vakit: 'imsak', tarih, giris: v.imsak, cikis: v.gunes },
            { vakit: 'ogle', tarih, giris: v.ogle, cikis: v.ikindi },
            { vakit: 'ikindi', tarih, giris: v.ikindi, cikis: v.aksam },
            { vakit: 'aksam', tarih, giris: v.aksam, cikis: v.yatsi },
            { vakit: 'yatsi', tarih, giris: v.yatsi, cikis: ertesi.imsak }
        );
    }
    return pencereler;
}

/** Bir pencerenin TÜM uyarıları — telefonun motoru, telefonun kimliği, telefonun metni. */
export function pencereninKayitlari(
    pencere: VakitPenceresi,
    matris: MuhafizMatrisi
): WearMuhafizKaydi[] {
    return pencereninUyarilari(pencere, matris).map((u) => u.kayit);
}

/**
 * Kayıtlar, motorun HAM uyarısıyla birlikte — uyandırma listesi (`wearUyandirma`)
 * gerçek alarm bayrağını (`UyariPlani.alarm`) buradan okur; ikinci bir tarama yok.
 */
export function pencereninUyarilari(
    pencere: VakitPenceresi,
    matris: MuhafizMatrisi
): { kayit: WearMuhafizKaydi; uyari: UyariPlani }[] {
    const vakitAyari = matris[pencere.vakit];
    if (!vakitAyari) return [];
    const yon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
    const girisYonu = yon === 'girisindenItibaren';
    const pencereUzunluguDk = pencereUzunluguDkHesapla(pencere.giris, pencere.cikis);
    // Tarama pencerenin BAŞINDAN: çıkışta motor `min(sınır, enBüyükEşik)`, girişte
    // `max(sınır, 1)` alır → telefonun vakit girmeden önceki planıyla birebir aynı.
    const plan = vakitUyariPlaniOlustur(vakitAyari, girisYonu ? 1 : Number.MAX_SAFE_INTEGER, {
        pencereUzunluguDk,
    });
    const cikisMs = pencere.cikis.getTime();
    return plan.map((u) => {
        const id = muhafizBildirimIdOlustur(pencere.vakit, u.seviye, pencere.tarih, u.kalanDk);
        const anons =
            sesliAnonsGerekliMi(u.kanallar) && u.anonsMetni.trim().length > 0
                ? anonsMetniniCoz(u.anonsMetni, pencere.vakit, u.olcuDk, yon)
                : undefined;
        const kayit: WearMuhafizKaydi = {
            id,
            ms: cikisMs - u.kalanDk * DK_MS,
            tarih: pencere.tarih,
            vakit: pencere.vakit,
            seviye: u.seviye,
            baslik: basligiOlustur(pencere.vakit, u.seviye, u.olcuDk, yon),
            govde: muhafizGovdesiSec(pencere.vakit, u.seviye, yon, () => kimliktenOran(id), u.olcuDk),
            titresim: titresimGerekliMi(u.kanallar),
            acil: muhafizAcilKanalMi(u.seviye, u.bildirimSesi, u.acilKanal),
            adim: u.adimIndeks,
            ...(anons ? { anons } : {}),
        };
        return { kayit, uyari: u };
    });
}

/**
 * Saate gidecek plan, PENCERE gruplarıyla (boyut sınırı vakit bütünlüğünde keser —
 * bir vaktin yarısını göndermek, sert adımları kaybetmek demektir).
 */
export function wearMuhafizPlaniOlustur(g: WearMuhafizGirdisi): WearMuhafizKaydi[][] {
    if (!g.aktif) return [];
    const ufuk = g.simdiMs + (g.ufukMs ?? WEAR_PLAN_UFKU_MS);
    // Dün (gece yarısı sonrası yatsı) + bugün + ufkun kapsadığı günler + 1 tampon.
    const gunSayisi = Math.ceil((g.ufukMs ?? WEAR_PLAN_UFKU_MS) / (24 * 60 * DK_MS)) + 2;
    return vakitPencereleriniOlustur(g.koordinat, g.bugunIso, gunSayisi)
        .filter((p) => p.cikis.getTime() > g.simdiMs && p.giris.getTime() < ufuk)
        .filter((p) => !(g.kilinanlar[p.tarih] ?? []).includes(p.vakit))
        .filter((p) => !g.ozelGundeMi?.(p.tarih))
        .map((p) => pencereninKayitlari(p, g.matris))
        .filter((kayitlar) => kayitlar.length > 0);
}

/** UTF-8 bayt uzunluğu (TextEncoder Hermes'te garanti değil). */
export function utf8BaytUzunlugu(metin: string): number {
    let bayt = 0;
    for (let i = 0; i < metin.length; i++) {
        const c = metin.charCodeAt(i);
        if (c < 0x80) bayt += 1;
        else if (c < 0x800) bayt += 2;
        else if (c >= 0xd800 && c <= 0xdbff && i + 1 < metin.length) {
            // Vekil çift (emoji) → 4 bayt
            bayt += 4;
            i++;
        } else bayt += 3;
    }
    return bayt;
}
