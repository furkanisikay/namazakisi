/**
 * +/− stepper davranışı — tüm sayısal seçicilerin ORTAK beyni (v0.31.0 iç testi).
 *
 * - Kısa basış: ızgaraya oturan tek adım (`sonrakiAdimDegeri`), anında `onChange`.
 *   Arka arkaya yanlış çift dokunuşu yutmak için 100 ms kısıt yalnız kısa basışta.
 * - Basılı tutma: değer hızlanarak sürekli değişir; bırakınca ya da sınıra
 *   dayanınca biter. Tutuş BOYUNCA değer yalnız seçicide gösterilir, `onChange`
 *   bırakışta TEK KEZ çağrılır: bazı ekranlar her değişimde native'e yazıyor
 *   (Namaz modu, Camideyim) — saniyede ~15 yazım ve geç dönen okuma, görünen
 *   değeri tutuşun ortasında geri sarabilirdi.
 * - Sınıra dayanınca döngü KENDİSİ durur: düğme o an `disabled` olur ve
 *   `onPressOut`'un gelmesine güvenilemez. Zamanlayıcı unmount'ta da temizlenir.
 *
 * Kural tek kaynak: `core/utils/sayisalAdim.ts`.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccessibilityActionEvent } from 'react-native';
import { metin } from '../../core/dil/aktifDil';
import {
    sinirdaMi,
    sonrakiAdimDegeri,
    tekrarAdimCarpani,
    tekrarAraligiMs,
    type AdimYonu,
} from '../../core/utils/sayisalAdim';

/** Kısa basışta iki adım arası en kısa süre (ms). */
export const KISA_BASIS_KISITI_MS = 100;
/** Basılı tutmanın başlaması için gereken süre (ms). */
export const BASILI_TUTMA_GECIKMESI_MS = 350;

export interface SayisalAdimGirdisi {
    deger: number;
    min: number;
    max: number;
    adim?: number;
    onChange: (yeniDeger: number) => void;
}

export interface DugmeOlaylari {
    onPress: () => void;
    onLongPress: () => void;
    onPressOut: () => void;
    delayLongPress: number;
}

export interface SayisalAdimDurumu {
    /** Ekranda gösterilecek değer (tutuş sırasında ara değer). */
    gorunenDeger: number;
    azaltDugmesi: DugmeOlaylari;
    artirDugmesi: DugmeOlaylari;
    /** `accessibilityActions` increment/decrement işleyicisi. */
    erisilebilirlikEylemi: (olay: AccessibilityActionEvent) => void;
}

interface Tutus {
    yon: AdimYonu;
    baslangic: number;
    deger: number;
    sayac: number;
}

export function useSayisalAdim({ deger, min, max, adim = 1, onChange }: SayisalAdimGirdisi): SayisalAdimDurumu {
    const [tutusDegeri, setTutusDegeri] = useState<number | null>(null);
    const gorunenDeger = tutusDegeri ?? deger;

    const girdiRef = useRef({ deger, min, max, adim, onChange });
    girdiRef.current = { deger, min, max, adim, onChange };

    const tutusRef = useRef<Tutus | null>(null);
    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sonKisaBasisRef = useRef(0);

    const zamanlayiciyiTemizle = useCallback(() => {
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = null;
    }, []);

    const tutusuBitir = useCallback(() => {
        zamanlayiciyiTemizle();
        const tutus = tutusRef.current;
        tutusRef.current = null;
        if (!tutus) return;
        setTutusDegeri(null);
        if (tutus.deger !== tutus.baslangic) girdiRef.current.onChange(tutus.deger);
    }, [zamanlayiciyiTemizle]);

    const tekrarla = useCallback(() => {
        const tutus = tutusRef.current;
        if (!tutus) return;
        const g = girdiRef.current;
        const carpan = tekrarAdimCarpani(tutus.sayac, g.adim, g.min, g.max);
        tutus.deger = sonrakiAdimDegeri(tutus.deger, g.adim * carpan, tutus.yon, g.min, g.max);
        tutus.sayac += 1;
        setTutusDegeri(tutus.deger);
        if (sinirdaMi(tutus.deger, tutus.yon, g.min, g.max)) {
            tutusuBitir();
            return;
        }
        zamanlayiciRef.current = setTimeout(tekrarla, tekrarAraligiMs(tutus.sayac));
    }, [tutusuBitir]);

    const tutusuBaslat = useCallback(
        (yon: AdimYonu) => {
            if (tutusRef.current) return;
            const g = girdiRef.current;
            if (sinirdaMi(g.deger, yon, g.min, g.max)) return;
            tutusRef.current = { yon, baslangic: g.deger, deger: g.deger, sayac: 0 };
            tekrarla();
        },
        [tekrarla]
    );

    const tekAdim = useCallback((yon: AdimYonu, kisitli: boolean) => {
        if (tutusRef.current) return;
        if (kisitli) {
            const simdi = Date.now();
            if (simdi - sonKisaBasisRef.current < KISA_BASIS_KISITI_MS) return;
            sonKisaBasisRef.current = simdi;
        }
        const g = girdiRef.current;
        const yeni = sonrakiAdimDegeri(g.deger, g.adim, yon, g.min, g.max);
        if (yeni !== g.deger) g.onChange(yeni);
    }, []);

    useEffect(() => zamanlayiciyiTemizle, [zamanlayiciyiTemizle]);

    const dugme = useCallback(
        (yon: AdimYonu): DugmeOlaylari => ({
            onPress: () => tekAdim(yon, true),
            onLongPress: () => tutusuBaslat(yon),
            onPressOut: tutusuBitir,
            delayLongPress: BASILI_TUTMA_GECIKMESI_MS,
        }),
        [tekAdim, tutusuBaslat, tutusuBitir]
    );

    const erisilebilirlikEylemi = useCallback(
        (olay: AccessibilityActionEvent) => {
            if (olay.nativeEvent.actionName === 'increment') tekAdim(1, false);
            else if (olay.nativeEvent.actionName === 'decrement') tekAdim(-1, false);
        },
        [tekAdim]
    );

    return {
        gorunenDeger,
        azaltDugmesi: dugme(-1),
        artirDugmesi: dugme(1),
        erisilebilirlikEylemi,
    };
}

/** Ayarlanabilir değer kutusu için ortak erişilebilirlik eylemleri. */
export const AYARLANABILIR_EYLEMLER = [
    {
        name: 'increment' as const,
        get label(): string {
            return metin().genel.ortak.artir;
        },
    },
    {
        name: 'decrement' as const,
        get label(): string {
            return metin().genel.ortak.azalt;
        },
    },
];
