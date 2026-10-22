/**
 * Tablet ev ekranı ayarı (varsayılan KAPALI). Cihaza özgüdür: mutfaktaki tablet ile
 * cepteki telefon ayrı karar verir → yedeklenmez, eşitlenmez.
 *
 * Modül düzeyi tek değer + dinleyiciler: Görünüm sayfasındaki anahtar ile kök gezinme
 * aynı değeri görür (Redux dilimi açmaya değmeyecek kadar küçük, store'suz).
 */
import { useEffect, useState } from 'react';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

let deger: boolean | null = null;
const dinleyiciler = new Set<(acik: boolean) => void>();

function yayinla(acik: boolean) {
    deger = acik;
    dinleyiciler.forEach((d) => d(acik));
}

async function yukle(): Promise<void> {
    if (deger !== null) return;
    try {
        const okunan = await Depolama.oku<{ acik?: boolean }>(DEPOLAMA_ANAHTARLARI.EV_EKRANI_AYARI);
        yayinla(okunan?.acik === true);
    } catch {
        yayinla(false);
    }
}

export async function evEkraniAyarla(acik: boolean): Promise<void> {
    yayinla(acik);
    await Depolama.yaz(DEPOLAMA_ANAHTARLARI.EV_EKRANI_AYARI, { acik });
}

/** Yalnız testler için. */
export function evEkraniAyariniSifirla(): void {
    deger = null;
    dinleyiciler.clear();
}

export function useEvEkraniAyari(): { acik: boolean; yuklendi: boolean } {
    const [acik, setAcik] = useState<boolean>(deger ?? false);
    const [yuklendi, setYuklendi] = useState(deger !== null);
    useEffect(() => {
        const dinle = (yeni: boolean) => {
            setAcik(yeni);
            setYuklendi(true);
        };
        dinleyiciler.add(dinle);
        yukle().catch(() => undefined);
        if (deger !== null) dinle(deger);
        return () => {
            dinleyiciler.delete(dinle);
        };
    }, []);
    return { acik, yuklendi };
}
