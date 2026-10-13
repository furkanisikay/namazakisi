/**
 * Bildirim defteri testlerinin ortak fikstürü (test değil — `__tests__` altında
 * ama `.test.ts` uzantısız olduğu için jest koşturmaz).
 */
import type { MuhafizMatrisi, SeviyeAyari, VakitMuhafizAyari } from '../../muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI, VARSAYILAN_SES } from '../../muhafiz/matrisTipleri';

export const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

export const adim = (d: Partial<SeviyeAyari> & Pick<SeviyeAyari, 'kademe' | 'esikDk'>): SeviyeAyari => ({
    kanallar: { bildirim: true },
    siklik: 'birkez',
    bildirimSesi: VARSAYILAN_SES,
    anonsMetni: '',
    ...d,
});

/** "Yoğun özel" ayar: dört ton, sık tekrar, son iki adım sesli. */
export const yogunVakit = (): VakitMuhafizAyari => ({
    seviyeler: [
        adim({ kademe: 'nazik', esikDk: 60, siklik: { herDk: 5 } }),
        adim({ kademe: 'uyari', esikDk: 30, siklik: { herDk: 5 } }),
        adim({
            kademe: 'sert',
            esikDk: 15,
            siklik: { herDk: 3 },
            kanallar: { bildirim: true, sesli: true },
            anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
        }),
        adim({
            kademe: 'acil',
            esikDk: 5,
            siklik: { herDk: 1 },
            kanallar: { bildirim: true, sesli: true },
            anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
        }),
    ],
});

export const matrisKur = (vakit: () => VakitMuhafizAyari = yogunVakit): MuhafizMatrisi => {
    const m = {} as MuhafizMatrisi;
    for (const v of MUHAFIZ_VAKITLERI) m[v] = vakit();
    return m;
};
