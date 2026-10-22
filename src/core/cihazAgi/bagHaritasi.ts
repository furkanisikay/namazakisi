/**
 * Cihazlarım bağ haritasının SAF yerleşimi: telefon üstte ortada, bağlı cihazlar altında
 * kartlar; her karta telefondan bir bağ çizgisi. En fazla 3 düğüm (fazlası "+N" düğümünde):
 *   1 düğüm  → ortada tek kart
 *   2 düğüm  → yan yana
 *   3 düğüm  → üstte iki, altta ortada bir (çizgisi iki kartın arasındaki oluktan iner)
 * Kenarlardan dolaşan çizgi YOK (kartların üstünden geçmesin). Saf modül (test edilir).
 */

export const HARITA = {
    telefon: 92,
    ustBosluk: 4,
    etiket: 26,
    cizgiBoy: 46,
    kartYukseklik: 104,
    oluk: 14,
} as const;

export const AZAMI_DUGUM = 3;

export interface DugumYeri {
    x: number;
    y: number;
    en: number;
    boy: number;
    /** Telefondan bu karta SVG yolu. */
    yol: string;
    /** Yolun yaklaşık uzunluğu (çizim animasyonu için). */
    uzunluk: number;
}

export interface HaritaYerlesimi {
    yukseklik: number;
    telefonX: number;
    telefonY: number;
    dugumler: DugumYeri[];
}

const kubikUzunluk = (p: number[][]): number => {
    let toplam = 0;
    let [ox, oy] = p[0];
    for (let i = 1; i <= 16; i++) {
        const t = i / 16;
        const u = 1 - t;
        const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
        const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
        toplam += Math.hypot(x - ox, y - oy);
        ox = x;
        oy = y;
    }
    return toplam;
};

const yuvarla = (n: number) => Math.round(n * 10) / 10;

export function haritaYerlesimi(genislik: number, adet: number): HaritaYerlesimi {
    const n = Math.max(1, Math.min(AZAMI_DUGUM, adet));
    const { telefon, ustBosluk, etiket, cizgiBoy, kartYukseklik, oluk } = HARITA;
    const cx = genislik / 2;
    const cizgiBasi = ustBosluk + telefon + etiket;
    const ilkSira = cizgiBasi + cizgiBoy;
    const kartEn = n === 1 ? Math.min(genislik, 240) : (genislik - oluk) / 2;
    const yerler: Array<{ x: number; y: number }> =
        n === 1
            ? [{ x: cx - kartEn / 2, y: ilkSira }]
            : [
                  { x: 0, y: ilkSira },
                  { x: kartEn + oluk, y: ilkSira },
                  ...(n === 3 ? [{ x: cx - kartEn / 2, y: ilkSira + kartYukseklik + oluk }] : []),
              ];
    const dugumler = yerler.map(({ x, y }, i): DugumYeri => {
        const hx = x + kartEn / 2;
        if (i === 2) {
            // Alt sıradaki tek kart: oluktan dimdik iner.
            return { x, y, en: kartEn, boy: kartYukseklik, yol: `M${yuvarla(cx)} ${cizgiBasi} L${yuvarla(cx)} ${y}`, uzunluk: y - cizgiBasi };
        }
        const k = [
            [cx, cizgiBasi],
            [cx, cizgiBasi + cizgiBoy * 0.6],
            [hx, y - cizgiBoy * 0.6],
            [hx, y],
        ];
        return {
            x,
            y,
            en: kartEn,
            boy: kartYukseklik,
            yol: `M${yuvarla(k[0][0])} ${k[0][1]} C${yuvarla(k[1][0])} ${yuvarla(k[1][1])} ${yuvarla(k[2][0])} ${yuvarla(k[2][1])} ${yuvarla(k[3][0])} ${k[3][1]}`,
            uzunluk: Math.ceil(kubikUzunluk(k)),
        };
    });
    const son = dugumler[dugumler.length - 1];
    return { yukseklik: son.y + son.boy, telefonX: cx, telefonY: ustBosluk + telefon / 2, dugumler };
}
