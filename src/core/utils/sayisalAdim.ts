/**
 * Sayısal seçici (+/− stepper) kuralları — TEK kaynak (v0.31.0 iç testi).
 *
 * Eski davranış `deger ± adim` idi: 1 dk'ya inen kullanıcı 5'lik adımla bir daha
 * 15'e dönemiyordu (1 → 6 → 11 → 16). Yeni kural: değer adımın IZGARASINA oturur —
 * basış yönündeki bir sonraki `adim` katına gider (0'dan başlayan mutlak ızgara),
 * sonra [min, max] aralığına kelepçelenir. 1'den yukarı → 5, 16'dan aşağı → 15,
 * 5'ten aşağı (min 1) → 1.
 *
 * Basılı tutma: tekrar aralığı her tekrarda kısalır (`tekrarAraligiMs`), çok geniş
 * aralıklarda bir süre sonra adım da büyür (`tekrarAdimCarpani`) — büyütülen adım
 * `adim`ın katı olduğu için ızgara bozulmaz.
 *
 * Saf: React/RN import ETMEZ (jest'te sahte zamanlayıcısız test edilir).
 */

export type AdimYonu = 1 | -1;

/** Basılı tutunca ilk tekrar aralığı (ms). */
export const TEKRAR_ILK_ARALIK_MS = 220;
/** Hızlanmanın alt sınırı (ms). */
export const TEKRAR_EN_KISA_ARALIK_MS = 60;
/** Her tekrarda aralığın çarpanı. */
export const TEKRAR_HIZLANMA_ORANI = 0.85;
/** Adım büyütmenin başladığı tekrar sayısı. */
export const ADIM_BUYUTME_ESIGI = 25;
/** Adım büyütmeye değecek en az ızgara adımı sayısı (aralık / adim). */
export const ADIM_BUYUTME_ARALIK_ESIGI = 60;
/** Büyütülen adımın çarpanı. */
export const ADIM_BUYUTME_CARPANI = 5;

const gecerliAdim = (adim: number): number => (Number.isFinite(adim) && adim > 0 ? adim : 1);

/** Değeri [min, max] aralığına kelepçeler. */
export function kelepcele(deger: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, deger));
}

/**
 * Basış yönündeki bir sonraki ızgara değeri (`adim` katı), [min, max] ile
 * kelepçelenmiş. Değer zaten ızgaradaysa tam bir adım gider.
 */
export function sonrakiAdimDegeri(deger: number, adim: number, yon: AdimYonu, min: number, max: number): number {
    const a = gecerliAdim(adim);
    // Kayan nokta artığı (ör. 0.1 adımı) ızgara hesabını bozmasın.
    const oran = Math.round((deger / a) * 1e9) / 1e9;
    const hedef = yon > 0 ? (Math.floor(oran) + 1) * a : (Math.ceil(oran) - 1) * a;
    return kelepcele(hedef, min, max);
}

/** Basılı tutmada `tekrarSayisi`. tekrardan sonra beklenecek süre (0'dan başlar). */
export function tekrarAraligiMs(tekrarSayisi: number): number {
    const n = Math.max(0, Math.floor(tekrarSayisi));
    return Math.max(TEKRAR_EN_KISA_ARALIK_MS, Math.round(TEKRAR_ILK_ARALIK_MS * Math.pow(TEKRAR_HIZLANMA_ORANI, n)));
}

/**
 * Basılı tutmada adım çarpanı: yalnız geniş aralıkta (ör. 1–365 gün) ve uzun
 * tutuşta büyür; dar aralıkta (ör. 10–40 dk) hep 1 kalır.
 */
export function tekrarAdimCarpani(tekrarSayisi: number, adim: number, min: number, max: number): number {
    const a = gecerliAdim(adim);
    const izgaraAdimSayisi = (max - min) / a;
    return tekrarSayisi >= ADIM_BUYUTME_ESIGI && izgaraAdimSayisi > ADIM_BUYUTME_ARALIK_ESIGI ? ADIM_BUYUTME_CARPANI : 1;
}

/** Değer bu yönde artık değişemiyor mu (sınıra dayandı)? */
export function sinirdaMi(deger: number, yon: AdimYonu, min: number, max: number): boolean {
    return yon > 0 ? deger >= max : deger <= min;
}
