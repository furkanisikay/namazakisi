/**
 * Tek beyin kapısının ekran tarafı: bu cihaz hatırlatma kurar mı? (`null` = okunuyor.)
 *
 * Ön plan muhafızı (banner, ses, sesli anons) da hatırlatmadır: ikinci cihazda
 * `AnaSayfa` onu başlatmaz. Rol ya da ev ekranı ayarı değişince `hatirlatmaKapisiDegisti`
 * çağrılır → açık ekranlar yeniden okur (modül düzeyi abone kümesi; Redux gerekmez).
 */
import * as React from 'react';
import { cihazRoluOku, cihazRoluYaz, hatirlatmaKurulabilirMi } from '../../data/local/LocalCihazRoluServisi';
import type { CihazRolu } from '../../core/cihaz/cihazRolu';

const aboneler = new Set<() => void>();

/** Rol/ev ekranı yazıldıktan SONRA çağrılır (yalnız açık ekranları tazeler). */
export function hatirlatmaKapisiDegisti(): void {
    for (const f of aboneler) f();
}

/**
 * Kapı değişti: ekranları tazele + TÜM hatırlatmaları yeniden kur. Planlama servisi
 * TEMBEL yüklenir (`konumSlice` deseni): konum yayma zinciri native köprüleri çeker,
 * statik import Ayarlar/Görünüm ekran testlerini düşürürdü.
 */
export async function hatirlatmaKapisiniUygula(): Promise<void> {
    hatirlatmaKapisiDegisti();
    try {
        const { hatirlatmaKapisiDegistiUygula } =
            require('../../domain/services/CihazRoluDegisikligiServisi') as typeof import('../../domain/services/CihazRoluDegisikligiServisi');
        await hatirlatmaKapisiDegistiUygula();
    } catch {
        // Planlama bir sonraki açılışta / 15 dk görevinde yine kapıdan geçer.
    }
}

/** Ayarlar anahtarı: "Hatırlatmaları bu cihazda kur". */
export async function cihazRoluAyarla(rol: CihazRolu): Promise<void> {
    await cihazRoluYaz({ rol, soruldu: true });
    await hatirlatmaKapisiniUygula();
}

/** Bu cihazın rolü (`undefined` = seçilmedi → ana sayılır; `null` = okunuyor). */
export function useCihazRolu(): CihazRolu | undefined | null {
    const [rol, setRol] = React.useState<CihazRolu | undefined | null>(null);
    React.useEffect(() => {
        let canli = true;
        const oku = () => {
            void cihazRoluOku().then((a) => {
                if (canli) setRol(a.rol);
            });
        };
        oku();
        aboneler.add(oku);
        return () => {
            canli = false;
            aboneler.delete(oku);
        };
    }, []);
    return rol;
}

export function useHatirlatmaKapisi(): boolean | null {
    const [kurulur, setKurulur] = React.useState<boolean | null>(null);
    React.useEffect(() => {
        let canli = true;
        const oku = () => {
            hatirlatmaKurulabilirMi()
                .then((v) => {
                    if (canli) setKurulur(v);
                })
                .catch(() => {
                    if (canli) setKurulur(true);
                });
        };
        oku();
        aboneler.add(oku);
        return () => {
            canli = false;
            aboneler.delete(oku);
        };
    }, []);
    return kurulur;
}
