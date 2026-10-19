/**
 * TESLİM SAHİPLİĞİ — bir teslimci örneğinin hangi kimlikleri "kendisinin" saydığı (SAF).
 *
 * Ortak hatırlatma yüzeyleri (plan §4.1): muhafız, nafile, cuma, camiye gitme, yatış ve
 * takvim çakışması AYNI teslim katmanından (`MuhafizTeslimcisi`) AYRI örneklerle geçer.
 * Her örnek yeniden planlamadan önce YALNIZ KENDİ önceki turunun yan kanallarını (sesli
 * anons alarmı, gerçek alarm) iptal etmeli; başka bir örneğinkini silmek o yüzeyin
 * uyarısını sessizce yok eder.
 *
 * Önek yetmez: yatış/muhasebe kimlikleri (#290) muhafızın `muhafiz_` uzayındadır
 * (native "Kıldım" o önekle hepsini kapsar). Bu yüzden muhafız ÖNEKLE değil plan
 * kimliğiyle (`muhafizPlanKimligiMi`) temizler; muhafız KAPALIYKEN muhafız sahipli her
 * şeyi siler ama yatış kimliklerine DOKUNMAZ.
 *
 * GÖÇ: kaldırılan "Ertele"nin (#289, sahip kararı 2026-10-19) güncelleme öncesi kurulmuş
 * `_ertele` artıkları muhafız AÇIKKEN de muhafıza aittir (`MUHAFIZ_PLAN` = plan ∪ eski
 * erteleme) → bir sonraki planlama turunda anons/alarm kayıtlarından silinir.
 *
 * İKİZ: Kotlin `cekirdek/TeslimSahipligi.kt` — native iptal (`MuhafizAlarm.sahipliIptalEt`)
 * aynı kuralı uygular. İkisi de `android/app/src/test/resources/teslim-sahipligi-ornekleri.json`
 * örneğini kabul eder; birini değiştiren üçünü değiştirir.
 */
import { eskiErtelemeKimligiMi, muhafizPlanKimligiMi } from './planKimligi';

/** Native sahiplik adları — Kotlin `TeslimSahipligi` sabitleri. */
export const NATIVE_SAHIP = {
    MUHAFIZ_PLAN: 'muhafiz_plan',
    MUHAFIZ_TUMU: 'muhafiz_tumu',
    YATIS: 'yatis',
} as const;
export type NativeSahip = (typeof NATIVE_SAHIP)[keyof typeof NATIVE_SAHIP];

export type TeslimSahipligi =
    /** Kendi önekli yüzey (nafile, cuma, camiye gitme, takvim): `startsWith(onek)`. */
    | { tur: 'onek'; onek: string }
    /** Muhafız: plan kimlikleri (kapalıyken muhafız sahipli her şey, yatış HARİÇ). */
    | { tur: 'muhafiz' }
    /** Yatış + muhasebe (#290): `muhafiz_` uzayında, kendi deseniyle. */
    | { tur: 'yatis' };

const MUHAFIZ_ONEKI = 'muhafiz_';
const MUHASEBE_ONEKI = 'muhasebe_';
/** Yatış/muhasebe kimliği; tekrar tetikleri `_<kalanDk>` eki taşıyabilir (plan §3.5). */
const YATIS_DESENI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_(yatis|muhasebe)(_\d+)?$/;

/** Yatış hatırlatması / gün sonu muhasebesi kimliği mi? Kotlin `yatisKimligiMi`. */
export const yatisSahipliMi = (kimlik: string): boolean =>
    YATIS_DESENI.test(kimlik) || kimlik.startsWith(MUHASEBE_ONEKI);

/** Native kuralın JS ikizi (`TeslimSahipligi.eslesir`). Bilinmeyen ad HİÇBİR şeyle eşleşmez. */
export function nativeSahipEslesir(sahip: string, kimlik: string): boolean {
    switch (sahip) {
        case NATIVE_SAHIP.MUHAFIZ_PLAN:
            return muhafizPlanKimligiMi(kimlik) || eskiErtelemeKimligiMi(kimlik);
        case NATIVE_SAHIP.MUHAFIZ_TUMU:
            return kimlik.startsWith(MUHAFIZ_ONEKI) && !yatisSahipliMi(kimlik);
        case NATIVE_SAHIP.YATIS:
            return yatisSahipliMi(kimlik);
        default:
            return false;
    }
}

/**
 * Bu sahipliğin native adı — önekli sahiplik `null` (native önekli iptal yolları zaten var).
 * `muhafizAcik === false` muhafızda "muhafız sahipli her şey" (yatış hariç) demektir.
 */
export function nativeSahipAdi(s: TeslimSahipligi, muhafizAcik = true): NativeSahip | null {
    if (s.tur === 'muhafiz') return muhafizAcik ? NATIVE_SAHIP.MUHAFIZ_PLAN : NATIVE_SAHIP.MUHAFIZ_TUMU;
    if (s.tur === 'yatis') return NATIVE_SAHIP.YATIS;
    return null;
}

/** Sahipliğin kimlik yüklemi (JS tarafı süzmeler: iOS bütçe sayımı, AlarmKit iptali). */
export function sahipligiEslestir(s: TeslimSahipligi, muhafizAcik = true): (kimlik: string) => boolean {
    if (s.tur === 'onek') {
        const onek = s.onek;
        return (kimlik) => onek.length > 0 && kimlik.startsWith(onek);
    }
    const ad = nativeSahipAdi(s, muhafizAcik) as NativeSahip;
    return (kimlik) => nativeSahipEslesir(ad, kimlik);
}

/** Muhafız sahipliği (varsayılan teslimci). */
export const MUHAFIZ_SAHIPLIGI: TeslimSahipligi = { tur: 'muhafiz' };

/** Önekli sahiplik kısayolu. */
export const onekSahipligi = (onek: string): TeslimSahipligi => ({ tur: 'onek', onek });

const VAKIT_ONEKI_DESENI = /^(muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+)/;

/**
 * Bildirim merkezindeki GÖSTERİM GRUBU (plan §4.5): aynı gruptan yeni bir bildirim gelince
 * eskisi kaldırılır (tekrar tetikleri üst üste birikmesin). `null` = gruplanmaz.
 *
 * Muhafız planı vakit önekiyle gruplanır (`muhafiz_<gün>_vakit_<v>`). YATIŞ /
 * MUHASEBE (#290) aynı `muhafiz_` uzayında yaşar ama KENDİ grubundadır: eskiden önekle
 * gruplandığı için yatışın bir tekrarı muhafızın aynı günkü yatsı uyarısını (ve tersi)
 * kapatırdı. Yatış grubu `_<kalanDk>` eki soyulmuş köktür → yatışın tekrarları yalnız
 * birbirinin yerine geçer.
 */
export function gosterimGrubu(kimlik: string): string | null {
    if (yatisSahipliMi(kimlik)) return `yatis:${kimlik.replace(/_\d+$/, '')}`;
    const m = kimlik.match(VAKIT_ONEKI_DESENI);
    return m ? m[1] : null;
}
