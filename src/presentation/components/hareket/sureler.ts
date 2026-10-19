/**
 * Hareket sözlüğü — süre ve eğriler TEK yerde (sade tasarım, Dalga 1).
 *
 * Kurallar (motion-choreography + plan): hareket bir OLAYLA başlar ve ~1 sn içinde
 * biter; sonsuz döngü yalnız gerçek beklemede ve tanıtım/sihirbaz/boş durum ekranında görünürken
 * (`dongu.ts` kapısı: odak + ön plan + hareket azaltılmamış — sahip kararı 2026-10-19); yalnız transform
 * ve opaklık (`useNativeDriver: true`); "Animasyonları azalt" açıksa sahne son
 * karesine atlar; bilgi hiçbir zaman yalnız hareketle verilmez (metin de değişir).
 */
import { Easing } from 'react-native';

export const SURE = {
    /** Seçim/anahtar renk geçişi (ölçek yok). */
    secim: 150,
    /** Durum çapraz solması (açıldı/kapandı ikonu). */
    durum: 150,
    /** Satır çıkışı (silme). */
    cikis: 200,
    /** Bant/hap girişi. */
    giris: 220,
    /** Başarı içeriğinin gecikmeli gelişi. */
    basariIcerik: 240,
    /** Kıldım: hap → daire büzülmesi. */
    buzulme: 180,
    /** Kıldım: halka bir kez açılır. */
    halka: 420,
} as const;

export const EGRI = {
    cikis: Easing.in(Easing.quad),
    giris: Easing.out(Easing.cubic),
} as const;

/** Başarı yayı (friction 7, tension 120): hafif aşma, çabuk sönüm. */
export const YAY = { friction: 7, tension: 120, useNativeDriver: true } as const;
