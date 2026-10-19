/**
 * Muhafız PLAN kimliği — SAF kurallar.
 *
 * `muhafiz_` uzayı tek sahipli değildir (yatış/muhasebe #290 de oradadır): plan
 * sahipliğini önekle değil bu desenle sor — plan temizliği, iOS bütçesinin "muhafız
 * dışı" sayımı, saat köprü etiketi, teslim sahipliği.
 *
 * İKİZ: `android/app/.../cekirdek/MuhafizPlanKimligi.kt`. İkisi de AYNI fikstürü kabul
 * eder: `android/app/src/test/resources/muhafiz-plan-kimligi-ornekleri.json`.
 *
 * ERTELE YOK (sahip kararı 2026-10-19): muhafızdaki "Ertele" (#289) kaldırıldı.
 * `eskiErtelemeKimligiMi` / `eskiErteleEylemiMi` yalnız GÜNCELLEME ÖNCESİ kurulmuş
 * artıkları tanır — `_ertele` kopyaları bir sonraki planlama turunda silinir, eski
 * bildirimdeki "Ertele" basışı yalnız bildirimi kapatır. Yeni erteleme KURMAYIN.
 */

const PLAN_DESENI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_seviye_\d+_dk_(-?\d+)$/;
const ESKI_ERTELEME_DESENI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_ertele$/;
const ESKI_ERTELE_EYLEMLERI: ReadonlySet<string> = new Set(['ertele_10', 'ertele_20']);

/** Muhafız PLANININ (seviye/dakika) kimliği mi? */
export const muhafizPlanKimligiMi = (kimlik: string): boolean => PLAN_DESENI.test(kimlik);

/** Plan kimliğindeki `kalanDk` (tetik = çıkış − kalanDk). Plan kimliği değilse `null`. */
export function kimliktenKalanDk(kimlik: string): number | null {
    const m = PLAN_DESENI.exec(kimlik);
    return m ? Number(m[1]) : null;
}

/** Kaldırılan Ertele'nin artığı (`muhafiz_<tarih>_vakit_<vakit>_ertele`) mı? */
export const eskiErtelemeKimligiMi = (kimlik: string): boolean => ESKI_ERTELEME_DESENI.test(kimlik);

/** Güncelleme öncesi gösterilmiş bildirimdeki "Ertele" düğmesinin eylemi mi? */
export const eskiErteleEylemiMi = (eylem: string | null | undefined): boolean =>
    typeof eylem === 'string' && ESKI_ERTELE_EYLEMLERI.has(eylem);
