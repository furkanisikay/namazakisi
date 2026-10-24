/**
 * "Daha az bildirim: önerilen ayarlar" (persona çalışması 2026-10-19) — MEVCUT kullanıcıya
 * bir kez gösterilen kapatılabilir öneri.
 *
 * Varsayılanlar değişti (Normal = vakit başına 3 hatırlatma, gece sessiz saatler) ama
 * mevcut kayıtlar GÖÇLE değişmez (sahip kararı). Bu kanca farkı tek dokunuşla uygular:
 * Normal düzey (sesli okuma yalnız rıza varsa) + gece sessizliği; "Geri al" önceki durumu
 * BİREBİR yazar (matris, düzey, özel yedek, gece ayarı). Kapatmak ya da uygulamak kartı
 * kalıcı olarak gizler (`varsayilanOnerisiGoruldu`, muhafız kaydında).
 *
 * Kart yalnız bir şey değişecekse görünür: muhafız açık, kart görülmemiş ve kullanıcı
 * zaten yeni Normal + gece sessizliğinde DEĞİL.
 */
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    HATIRLATMA_PRESETLERI,
    matrisiGuncelle,
    muhafizAyarlariniGuncelle,
    ozelMatrisYedegiGuncelle,
    type HatirlatmaYogunlugu,
} from '../store/muhafizSlice';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { presetUygula } from '../../core/muhafiz/matrisIslemleri';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import {
    VARSAYILAN_GECE_SESSIZLIGI,
    geceSessizliginiNormalize,
    type GeceSessizligi,
} from '../../core/muhafiz/geceSessizligi';
import { ortakDuzeyiBul } from '../components/hatirlatma/VakitDuzeyListesi';
import { geriAlBandiGoster } from '../components/ortak/GeriAlBandi';
import { useGenelRiza } from './useGenelRiza';
import { metin } from '../../core/dil/aktifDil';

interface MuhafizKaydi {
    aktif: boolean;
    yogunluk: HatirlatmaYogunlugu;
    matris?: MuhafizMatrisi;
    ozelMatrisYedegi?: MuhafizMatrisi;
    geceSessizligi?: unknown;
    varsayilanOnerisiGoruldu?: boolean;
}

export interface VarsayilanOnerisi {
    goster: boolean;
    uygula: () => void;
    kapat: () => void;
}

export function useVarsayilanOnerisi(planla: () => void): VarsayilanOnerisi {
    const dispatch = useAppDispatch();
    const muhafiz = useAppSelector((s) => (s as unknown as { muhafiz: MuhafizKaydi }).muhafiz);
    const genelRiza = useGenelRiza();
    const matris = useMemo(() => muhafizMatrisiniCoz(muhafiz as unknown as Parameters<typeof muhafizMatrisiniCoz>[0]), [muhafiz]);
    const gece = geceSessizliginiNormalize(muhafiz.geceSessizligi);

    const zatenOnerilen = muhafiz.yogunluk === 'normal' && ortakDuzeyiBul(matris) === 'normal' && gece?.aktif === true;
    const goster = muhafiz.aktif && muhafiz.varsayilanOnerisiGoruldu !== true && !zatenOnerilen;

    const kapat = useCallback(() => {
        dispatch(muhafizAyarlariniGuncelle({ varsayilanOnerisiGoruldu: true }));
    }, [dispatch]);

    const uygula = useCallback(() => {
        const once = {
            matris,
            yogunluk: muhafiz.yogunluk,
            ozelMatrisYedegi: muhafiz.ozelMatrisYedegi,
            geceSessizligi: gece,
        };
        // Kendi ayarı olan kişinin matrisi kaybolmasın: "Kendi ayarınız" kartı geri getirir.
        if (muhafiz.yogunluk === 'ozel') dispatch(ozelMatrisYedegiGuncelle(matris));
        dispatch(matrisiGuncelle(presetUygula(matris, HATIRLATMA_PRESETLERI.normal.seviyeler, genelRiza.sesli, 'normal')));
        const yeniGece: GeceSessizligi = gece ? { ...gece, aktif: true } : VARSAYILAN_GECE_SESSIZLIGI;
        dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'normal', geceSessizligi: yeniGece, varsayilanOnerisiGoruldu: true }));
        planla();
        geriAlBandiGoster({
            mesaj: metin().muhafizAyar.kanca.onerilenUygulandi,
            ikon: 'leaf',
            geriAl: () => {
                dispatch(matrisiGuncelle(once.matris));
                dispatch(muhafizAyarlariniGuncelle({ yogunluk: once.yogunluk, geceSessizligi: once.geceSessizligi }));
                // KOŞULSUZ: yedek yoksa açıkça temizlenir (BİREBİR geri yazım).
                dispatch(ozelMatrisYedegiGuncelle(once.ozelMatrisYedegi));
                planla();
            },
        });
    }, [dispatch, gece, genelRiza.sesli, matris, muhafiz.ozelMatrisYedegi, muhafiz.yogunluk, planla]);

    return { goster, uygula, kapat };
}
