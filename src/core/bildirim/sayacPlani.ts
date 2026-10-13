/**
 * Vakit sayacı (Android geri sayım bildirimi) PLANI — SAF (issue #298).
 *
 * `VakitSayacBildirimServisi` ve bildirim defteri aynı eleme kuralını kullanır.
 * Her uygun vakit için iki notifee tetiği kurulur: (A) sayaç başlangıcı —
 * başlangıç zaten geldiyse tetik değil ANINDA native sayaç başlar (havuza
 * girmez), (B) vakit çıkışında temizleme.
 */
import type { VakitAdi } from '../types';
import type { MuhafizVakti } from '../muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../muhafiz/matrisTipleri';
import type { MuhafizVakitZamani } from '../muhafiz/muhafizTeslimPlani';

/** Sayaç başlangıcı bu kadar yakınsa tetik değil anında native sayaç kurulur. */
export const SAYAC_ANINDA_ESIGI_MS = 5000;

export interface SayacPlanGirdisi {
    vakitler: MuhafizVakitZamani[];
    simdi: Date;
    baslangicEsikleri?: Partial<Record<MuhafizVakti, number>>;
    muhafizAktif?: boolean;
    /** Verilmezse (undefined) TÜM vakitler kapsanmış sayılır (#90 geriye uyum). */
    muhafizUyarilanVakitler?: MuhafizVakti[];
    kilindiMi?: (tarih: string, vakit: VakitAdi) => boolean;
    ozelGundeMi?: (tarih: string) => boolean;
}

export interface SayacPlanKaydi {
    vakit: MuhafizVakitZamani;
    /** Başlangıç tetiği (ms); `null` = başlangıç geldi, sayaç ANINDA başlar. */
    baslangicTetikMs: number | null;
    temizlemeMs: number;
}

/** Geçersiz/eksik/0 eşik → 0 (o vakit planlanmaz). */
export const sayacEsigiAl = (
    esikler: Partial<Record<MuhafizVakti, number>> | undefined,
    vakit: VakitAdi
): number => {
    const esik = esikler?.[vakit as MuhafizVakti];
    return typeof esik === 'number' && Number.isFinite(esik) && esik > 0 ? esik : 0;
};

/** Sayaç planlanacak vakitler (sıra korunur). */
export function sayacVakitleriniSec(girdi: SayacPlanGirdisi): MuhafizVakitZamani[] {
    const { vakitler, simdi } = girdi;
    const bastirilan = new Set<string>(
        girdi.muhafizAktif ? (girdi.muhafizUyarilanVakitler ?? MUHAFIZ_VAKITLERI) : []
    );
    const kilindiMi = girdi.kilindiMi ?? (() => false);
    const ozelGundeMi = girdi.ozelGundeMi ?? (() => false);
    return vakitler.filter(
        (v) =>
            v.cikis.getTime() > simdi.getTime() &&
            !ozelGundeMi(v.tarih) &&
            v.vakit !== 'gunes' &&
            !bastirilan.has(v.vakit) &&
            sayacEsigiAl(girdi.baslangicEsikleri, v.vakit) > 0 &&
            !kilindiMi(v.tarih, v.vakit)
    );
}

export function sayacPlaniOlustur(girdi: SayacPlanGirdisi): SayacPlanKaydi[] {
    const simdiMs = girdi.simdi.getTime();
    return sayacVakitleriniSec(girdi).map((v) => {
        const cikis = v.cikis.getTime();
        const baslangic = cikis - sayacEsigiAl(girdi.baslangicEsikleri, v.vakit) * 60 * 1000;
        const tetik = Math.max(baslangic, simdiMs + SAYAC_ANINDA_ESIGI_MS);
        return {
            vakit: v,
            baslangicTetikMs: tetik <= simdiMs + SAYAC_ANINDA_ESIGI_MS ? null : tetik,
            temizlemeMs: cikis,
        };
    });
}
