/**
 * "Bu tetik bir UYANDIRMA mı?" — saat W3 (fikir 2) TEK KAPISI. SAF, yalnız tip import eder
 * (üreticilerle döngü olmasın).
 *
 * Üç tüketici AYNI soruyu sorar, cevap ayrışırsa saat ile telefon farklı tetikleri
 * uyandırma sayar ve "saatte kapattım ama telefon yine çaldı" olur:
 *  - saat yükünün uyandırma listesi (`core/wear/wearUyandirma.ts`),
 *  - telefonun yedek gecikmesi (muhafız: `muhafizTeslimPlani`, nafile: `nafilePlani`),
 *  - bildirim defteri (#298) — o iki üreticiyi kuru çalıştırdığı için kendiliğinden.
 *
 * Kapsam (araştırma raporu, fikir 2): SABAH = imsak vaktinin GERÇEK ALARM tetiği
 * (`UyariPlani.alarm`, #74); TEHECCÜD = uyandırma kanalındaki ya da gerçek alarmlı
 * teheccüd tetiği. Diğer vakitlerin alarmları uyandırma değildir (kişi uyanıktır).
 */
import type { UyariPlani } from '../muhafiz/motorAdaptoru';
import type { VakitAdi } from '../types';

/** Muhafız adayı sabah uyandırması mı? */
export const muhafizUyandirmasiMi = (vakit: VakitAdi, uyari: Pick<UyariPlani, 'alarm'>): boolean =>
    vakit === 'imsak' && uyari.alarm === true;

/** Nafile tetiği teheccüd uyandırması mı? (`ekAlarmKurarMi` ile aynı alarm kuralı) */
export const nafileUyandirmasiMi = (p: {
    tur: string;
    uyandirma: boolean;
    uyari: Pick<UyariPlani, 'alarm' | 'kanallar'>;
}): boolean => p.tur === 'teheccud' && (p.uyandirma || (p.uyari.alarm === true && p.uyari.kanallar?.alarm === true));
