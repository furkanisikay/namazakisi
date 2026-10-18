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

/** Kanal gücü — alarm > sesli anons > bildirim > titreşim (aynı ana düşenlerde kazanan). */
const kanalGucu = (u: UyariPlani): number => {
    const k = u.kanallar ?? {};
    return (
        (ekAlarmKurarMi({ uyari: u }) ? 8 : 0) +
        (k.sesli === true ? 4 : 0) +
        (k.bildirim === true ? 2 : 0) +
        (k.titresim === true ? 1 : 0)
    );
};

/**
 * Birleşik tetiğin OKUNACAK metni sesli kanalı açık adımdan gelir: en güçlü adım (ör. sesli
 * kanalı kapalı bir gerçek alarm) okunacak metni taşımıyor olabilir; onun metnini almak sesli
 * adımın kullanıcının yazdığı cümlesini sessizce değiştirirdi.
 */
function anonsKaynagi(guclu: UyariPlani, diger: UyariPlani): UyariPlani {
    if (guclu.kanallar?.sesli === true) return guclu;
    return diger.kanallar?.sesli === true ? diger : guclu;
}

/**
 * AYNI ANA düşen iki tetiği TEK uyarıda BİRLEŞTİRİR (SAF). Ek yüzeylerde tetik bir tabana
 * kenetlenebilir (takvim `kapliyor`: giriş − 60 dk; yatış: yatsı girişi kayması) ve farklı
 * adımlar aynı dakikaya düşer. Eskiden motor sırasındaki İLKİ (en uzak eşik = çoğu zaman
 * en yumuşak adım) kalıyordu: "120 dk bildirim + 30 dk gerçek alarm" kurulumunda ikisi de
 * tabana düşünce yalnız bildirim kuruluyor, alarm SESSİZCE kayboluyordu.
 *
 * Kural: kanallar OR'lanır (bildirim/sesli/titreşim/alarm), gerçek alarm anı (`alarm`)
 * herhangi biri taşıyorsa kalır; ses, ses adı, ton ve aciliyet EN GÜÇLÜ
 * adımdan gelir (okunacak metin ise sesli kanalı AÇIK adımdan — `anonsKaynagi`) (alarm > sesli > bildirim > titreşim; eşitlikte önceki). Zamanlama
 * kimliği (`kalanDk`, `olcuDk`, `adimIndeks`) ÖNCEKİNİN kalır — kayıt kimliği ve sırası
 * değişmez. Defter aynı üreticiyi koştuğu için sayım da birleşmiş uyarıdan yapılır.
 */
export function ayniAnaDusenleriBirlestir(onceki: UyariPlani, yeni: UyariPlani): UyariPlani {
    const guclu = kanalGucu(yeni) > kanalGucu(onceki) ? yeni : onceki;
    const a = onceki.kanallar ?? {};
    const b = yeni.kanallar ?? {};
    const kanallar: UyariPlani['kanallar'] = {};
    for (const ad of ['bildirim', 'sesli', 'titresim', 'alarm'] as const) {
        if (a[ad] === true || b[ad] === true) kanallar[ad] = true;
    }
    const birlesik: UyariPlani = {
        ...onceki,
        kanallar,
        seviye: guclu.seviye,
        bildirimSesi: guclu.bildirimSesi,
        anonsMetni: anonsKaynagi(guclu, guclu === yeni ? onceki : yeni).anonsMetni,
        sesliAnons: onceki.sesliAnons || yeni.sesliAnons,
    };
    if (guclu.sesAdi !== undefined) birlesik.sesAdi = guclu.sesAdi;
    else delete birlesik.sesAdi;
    if (guclu.acilKanal !== undefined) birlesik.acilKanal = guclu.acilKanal;
    else delete birlesik.acilKanal;
    if (onceki.alarm === true || yeni.alarm === true) birlesik.alarm = true;
    return birlesik;
}
