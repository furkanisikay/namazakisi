/**
 * Muhafız ayarı ekranda değişince GERÇEK planı tazeler (debounce'lu) — Muhafız ayrıntı
 * sayfası ve Hatırlatmalar sayfası (sade tasarım, Dalga 3) AYNI yoldan geçer.
 *
 * NEDEN ZORUNLU (AGENTS.md): bildirimler vakit başına ÖNCEDEN planlanır ve kanal kimliği
 * seçilen sesin fonksiyonudur. Yeniden planlanmazsa o günün kalan bildirimleri ESKİ
 * kanaldan ESKİ sesle çalar → "ayarım kaydedilmedi" hissi. Vakit sayacı da yeniden
 * kurulur: bastırma listesi (`muhafizUyarilanVakitler`) ve sayaç başlangıç eşiği
 * matristen türer; eksik geçilirse sayaç bastırması bozulur.
 *
 * Stepper'a arka arkaya basmak TEK planlamaya iner (1200 ms); ekrandan çıkışta bekleyen
 * planlama HEMEN uygulanır. Geri çağrı kapanış değil REF okur — gecikme boyunca değişen
 * ayar kaybolmasın.
 */
import { useCallback, useEffect, useRef } from 'react';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { sayacBaslangicEsikleriHesapla, muhafizUyarilanVakitleriBul } from '../../core/utils/vakitSayacYardimcisi';
import { ArkaplanMuhafizServisi } from '../../domain/services/ArkaplanMuhafizServisi';
import { VakitSayacBildirimServisi } from '../../domain/services/VakitSayacBildirimServisi';
import { Logger } from '../../core/utils/Logger';

export const MUHAFIZ_YENIDEN_PLANLAMA_GECIKMESI_MS = 1200;

export interface MuhafizPlanlamaVerisi {
    aktif: boolean;
    matris: MuhafizMatrisi;
    koordinatlar: { lat: number; lng: number };
    sayacAyarlari?: { aktif?: boolean; sayacBaslangicSeviyesi?: number };
}

export function useMuhafizPlanlama(veri: MuhafizPlanlamaVerisi): { planlamayiKuyrugaAl: () => void } {
    const veriRef = useRef(veri);
    veriRef.current = veri;

    const yenidenPlanla = useCallback(async () => {
        const { aktif, matris, koordinatlar, sayacAyarlari: sayac } = veriRef.current;
        try {
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif, koordinatlar, matris });
            await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
                aktif: sayac?.aktif === true,
                koordinatlar,
                baslangicEsikleri: sayacBaslangicEsikleriHesapla(sayac?.sayacBaslangicSeviyesi, matris),
                muhafizAktif: aktif,
                muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(matris),
            });
        } catch (hata) {
            Logger.error('MuhafizAyarlari', 'Bildirimler yeniden planlanamadi', hata);
        }
    }, []);

    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bekleyenRef = useRef(false);

    const planlamayiKuyrugaAl = useCallback(() => {
        bekleyenRef.current = true;
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = setTimeout(() => {
            zamanlayiciRef.current = null;
            bekleyenRef.current = false;
            void yenidenPlanla();
        }, MUHAFIZ_YENIDEN_PLANLAMA_GECIKMESI_MS);
    }, [yenidenPlanla]);

    // Ekrandan çıkışta bekleyen planlama varsa HEMEN uygula.
    useEffect(
        () => () => {
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (bekleyenRef.current) {
                bekleyenRef.current = false;
                void yenidenPlanla();
            }
        },
        [yenidenPlanla]
    );

    return { planlamayiKuyrugaAl };
}
