/**
 * EK HATIRLATMA PLANI — teslim maliyeti kuralları (SAF; ortak hatırlatma yüzeyleri §4.4).
 *
 * Ek yüzeylerin (nafile, cuma; sonra camiye gitme, yatış, takvim) üreticileri ve bildirim
 * defteri AYNI kuralı kullanır: ekranda sayılan ile cihazda kurulan ayrışmasın. Kurallar
 * teslimcinin (`AndroidMuhafizTeslimcisi`) kapılarıyla birebirdir:
 *   - GERÇEK ALARM tetiği o tetiğin bildirimi + anonsunun YERİNE geçer → 1 alarm.
 *   - Aksi halde 1 bildirim + (sesli anons metni varsa, Android) 1 anons alarmı.
 */
import type { UyariPlani } from '../muhafiz/motorAdaptoru';

/** Bu tetik GERÇEK ALARM mı? (teslimciyle aynı kapı) */
export const ekAlarmKurarMi = (p: { uyari: UyariPlani }): boolean =>
    p.uyari.alarm === true && p.uyari.kanallar?.alarm === true;

/** Bu tetik Android'de ayrı bir sesli anons alarmı kurar mı? (teslimciyle aynı kapı) */
export const ekAnonsAlarmiKurarMi = (p: { uyari: UyariPlani }): boolean =>
    !ekAlarmKurarMi(p) && p.uyari.sesliAnons && p.uyari.anonsMetni.trim().length > 0;

/**
 * Android alarm payına KRONOLOJİK sığdırır (planlar zaman sırasında gelmeli): en uzak
 * tetikler düşer, sonraki tur kurar. `butce` verilmezse aynen döner (iOS: bütçeyi teslimci
 * ölçer).
 */
export function alarmPayinaSigdir<T extends { uyari: UyariPlani }>(planlar: T[], butce?: number): T[] {
    if (butce === undefined) return planlar;
    const sigan: T[] = [];
    let kullanilan = 0;
    for (const p of planlar) {
        const maliyet = 1 + (ekAnonsAlarmiKurarMi(p) ? 1 : 0);
        if (kullanilan + maliyet > butce) break;
        kullanilan += maliyet;
        sigan.push(p);
    }
    return sigan;
}
