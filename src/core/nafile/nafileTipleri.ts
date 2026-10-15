/**
 * Nafile namaz vakitleri (issue #77) — tipler ve varsayılanlar.
 *
 * Tasarım: docs/superpowers/specs/2026-10-12-nafile-namaz-vakitleri-design.md
 * (Fable incelemesinden geçen nihai hali "Nihai kararlar" bölümündedir).
 *
 * Issue #273: her nafile artık muhafızla AYNI dili konuşur — yön + en fazla 3
 * adım (`SeviyeAyari`), her adımın eşiği, sıklığı ve kanalları (bildirim /
 * sesli anons / titreşim). Eski tek-ofsetli kayıt `nafileAdimlari.ts`
 * içindeki göçle tek adıma çevrilir (idempotent, birebir aynı plan).
 */
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import type { PencereYonu } from '../muhafiz/pencereTipleri';

/** Gündüz/akşam nafileleri. */
export type GunduzNafile = 'kusluk' | 'evvabin';

export type NafileTuru = GunduzNafile | 'teheccud';

/**
 * Teheccüd hatırlatma PENCERESİ (issue #273).
 * - `sonUcteBir`: gecenin son üçte biri → imsak (en faziletli an; adhan
 *   `SunnahTimes` ile birebir)
 * - `yatsi`: yatsı → imsak
 */
export type TeheccudPenceresi = 'sonUcteBir' | 'yatsi';

/**
 * Bir nafilenin hatırlatma planı — muhafızın bir vaktiyle aynı şekil.
 *
 * `adimlar` KRONOLOJİK sıradadır (çıkışta eşik AZALAN, girişte ARTAN) ve
 * eşikler tekildir; 1..`NAFILE_MAKS_ADIM` eleman. Adımlarda ton YOKTUR
 * (`kademe` daima 'nazik', `acilKanal` daima false), ses seçilemez
 * (`bildirimSesi` daima varsayılan) — nafile gönüllüdür, ısrar değil davettir.
 */
export interface NafileHatirlatmaAyari {
    aktif: boolean;
    yon: PencereYonu;
    adimlar: SeviyeAyari[];
}

/** Geriye uyumlu ad (issue #273 öncesi tek ofsetli gündüz ayarı). */
export type GunduzHatirlatmaAyari = NafileHatirlatmaAyari;

export interface TeheccudAyari extends NafileHatirlatmaAyari {
    pencere: TeheccudPenceresi;
    /**
     * Uyandırma: bildirim alarm ses kanalından (sessiz modu deler) gider ve
     * metin emir kipindedir ("Kalk"). Kapalıyken adımın kendi kanalları geçerlidir.
     */
    uyandirma: boolean;
}

export interface NafileAyarlari {
    /**
     * Ana ekranda en az bir nafile gösteriliyor mu? TÜREV alandır (`gosterge`'nin
     * "herhangi biri"): normalize her zaman yeniden hesaplar. Diske yine yazılır —
     * eski sürüm bu yedeği açarsa tek bayrağı okur.
     */
    gostergeAktif: boolean;
    /**
     * Ana ekran "Günlük Akış"ında HER nafile ayrı ayrı gösterilir mi? (Eskiden tek
     * anahtar üçünü birden açıp kapatıyordu.) Alan yoksa (eski kayıt) üçü de eski
     * `gostergeAktif` değerini alır — göç yok, kullanıcı aynı ekranı görür.
     */
    gosterge: Record<NafileTuru, boolean>;
    hatirlatmalar: Record<GunduzNafile, NafileHatirlatmaAyari>;
    teheccud: TeheccudAyari;
    /**
     * Sesli anons RIZASI (issue #273) — muhafızınkinden AYRI tutulur: TTS
     * `USAGE_ALARM` ile sessiz modu ve DND'yi deler; muhafız için verilen onay
     * nafileye taşınmaz. Yalnız kullanıcı `SesliOnayModal`'ı EKRANDA onayladığında
     * yazılır; göç ya da varsayılan bunu UYDURAMAZ.
     */
    sesliOnayi?: boolean;
    /**
     * GERÇEK ALARM rızası (issue #74) — muhafızınkinden (`muhafizSlice.alarmOnayi`)
     * AYRI: alarm tam ekran açılır ve Rahatsız Etmeyin'de duyulur; muhafız için
     * verilen onay nafileye taşınmaz (`sesliOnayi` deseni). Yalnız `AlarmOnayModal`
     * onayında yazılır; göç ya da varsayılan UYDURAMAZ.
     */
    alarmOnayi?: boolean;
    /**
     * Hatırlatmalar yalnız BUGÜN (ve sürmekte olan gece) için kurulsun mu?
     * (issue #298 — iOS 64 bildirim sınırı rehberinin önerisi.) Alan YOKSA
     * `false`: gündüz 3 gün, teheccüd 7 gece ileri kurulur.
     */
    gunuGununeKur?: boolean;
}

/** En az bir hatırlatma açık mı? (planlama kısa devresi + ekran özeti + bildirim defteri) */
export const nafileHatirlatmaAcikMi = (a: NafileAyarlari): boolean =>
    a.hatirlatmalar.kusluk.aktif || a.hatirlatmalar.evvabin.aktif || a.teheccud.aktif;

/** Bir nafileye kurulabilecek en fazla hatırlatma. */
export const NAFILE_MAKS_ADIM = 3;

/** Eşik stepper adımı. */
export const NAFILE_ESIK_ADIM_DK = 5;

/**
 * Tekrar aralığı sınırları (Fable kararı): alt sınır 10 dk — gönüllü bir
 * ibadeti dakika dakika hatırlatmak davet değil ısrar olur.
 */
export const NAFILE_TEKRAR_MIN_DK = 10;
export const NAFILE_TEKRAR_MAX_DK = 60;
export const NAFILE_VARSAYILAN_TEKRAR_DK = 10;

/** Eski (issue #273 öncesi) ofset sınırları — yalnız göç kenetlemesi için. */
export const NAFILE_OFSET_MIN_DK = 5;
export const NAFILE_OFSET_MAX_DK = 120;
export const TEHECCUD_IMSAK_ONCESI_MIN_DK = 15;
export const TEHECCUD_IMSAK_ONCESI_MAX_DK = 120;

/**
 * Varsayılanlar: HEPSİ KAPALI (nafile gönüllüdür, ayardan açılır).
 * Kuşluk 5 dk → pratikte "işrak" (kuşluğun ilk vakti); evvâbîn 15 dk →
 * akşamın farzı ve sünneti kılınmış sayılır; teheccüd son üçte bir girince.
 * Hepsi yalnız BİLDİRİM: sesli anons rıza ister.
 */
const tekAdim = (esikDk: number): SeviyeAyari => ({
    kademe: 'nazik',
    kanallar: { bildirim: true },
    esikDk,
    siklik: 'birkez',
    bildirimSesi: 'varsayilan',
    acilKanal: false,
    anonsMetni: '',
});

export const VARSAYILAN_NAFILE_AYARLARI: NafileAyarlari = {
    gostergeAktif: false,
    gosterge: { kusluk: false, evvabin: false, teheccud: false },
    hatirlatmalar: {
        kusluk: { aktif: false, yon: 'girisindenItibaren', adimlar: [tekAdim(5)] },
        evvabin: { aktif: false, yon: 'girisindenItibaren', adimlar: [tekAdim(15)] },
    },
    teheccud: {
        aktif: false,
        yon: 'girisindenItibaren',
        adimlar: [tekAdim(5)],
        pencere: 'sonUcteBir',
        uyandirma: false,
    },
};

/** Görünen adlar (Title Case) — büyük/küçük harf dönüşümü YAPILMAZ (Türkçe İ tuzağı). */
export const NAFILE_ADLARI: Record<NafileTuru, string> = {
    kusluk: 'Kuşluk',
    evvabin: 'Evvâbîn',
    teheccud: 'Teheccüd',
};

/** Cümle içi küçük harfli adlar — `toLowerCase()` YAZMA (sabit harita). */
export const NAFILE_ADLARI_KUCUK: Record<NafileTuru, string> = {
    kusluk: 'kuşluk',
    evvabin: 'evvâbîn',
    teheccud: 'teheccüd',
};

export const NAFILE_TURLERI: NafileTuru[] = ['kusluk', 'evvabin', 'teheccud'];

/** Bir nafilenin hatırlatma ayarı (gündüz ya da teheccüd) — tek erişim noktası. */
export const nafileAyariniAl = (a: NafileAyarlari, tur: NafileTuru): NafileHatirlatmaAyari =>
    tur === 'teheccud' ? a.teheccud : a.hatirlatmalar[tur];
