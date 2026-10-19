/**
 * "Vakit çıkmadan" hatırlatma DÜZEYİ (muhafız: kapalı + yoğunluk) — Hatırlatmalar sayfası
 * ve muhafız ayrıntısı AYNI kancayı kullanır (sade tasarım, Dalga 3). İki yerde ayrı
 * yazılsaydı preset kuralları (dördüncü argüman `yogunluk`, özel yedeği, sesli rıza,
 * yeniden planlama) ayrışırdı.
 *
 * Kurallar (eski muhafız ekranından birebir taşındı):
 *  - Preset `presetUygula(matris, seviyeler, sesliIzinVar, yogunluk)` ile yazılır; giriş
 *    yönlü vakit kendi yön tablosunu alır. Korunanlar: anons metni, ses, gerçek alarm.
 *  - Özelden çıkılırken mevcut matris yedeklenir (`ozelMatrisYedegi`) — "Kendi ayarınız"
 *    kartı onu geri getirir.
 *  - Sesli içeren bir düzey, sesli onay (TEK RIZA) yoksa önce `SesliOnayModal` açar;
 *    "Sesli olmadan" düzeyi sesli hücreler olmadan uygular, geri tuşu VAZGEÇER.
 *  - Zaten seçili sesli düzey + onay yok → dokunuş onayı açar (göçten gelen kullanıcı
 *    sesliyi başka yoldan açamazdı).
 *
 * DEĞİŞEN (plan §7.3): kendi ayarı varken hazır düzeye geçmek artık ONAY MODALI açmaz;
 * doğrudan uygulanır ve 6 sn'lik "Geri al" bandı çıkar (özel ayar zaten yedeklenir,
 * geri al önceki durumu BİREBİR yazar).
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    HATIRLATMA_PRESETLERI,
    matrisiGuncelle,
    muhafizAyarlariniGuncelle,
    ozelMatrisYedegiGuncelle,
    ozelYogunluguGeriYukle,
    type HatirlatmaYogunlugu,
} from '../store/muhafizSlice';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import { presetSesliIceriyorMu, presetUygula } from '../../core/muhafiz/matrisIslemleri';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { matrisGecerliMi } from '../../core/muhafiz/motorAdaptoru';
import { ANONS_SABLONLARI, anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { DUZEY_ADLARI } from '../../core/hatirlatma/duzeyOzeti';
import { useFeedback } from '../../core/feedback';
import { useGenelRiza } from './useGenelRiza';
import { useTurkceTtsDestegi } from './useTurkceTtsDestegi';
import { geriAlBandiGoster } from '../components/ortak/GeriAlBandi';
import { SesliOnayModal } from '../screens/MuhafizAyarlari/SesliOnayModal';
import type { DuzeySecimi } from '../components/hatirlatma/DuzeySecici';

type PresetDuzey = 'hafif' | 'normal' | 'yogun';

const presetMi = (d: DuzeySecimi): d is PresetDuzey => d === 'hafif' || d === 'normal' || d === 'yogun';

interface MuhafizKaynagi {
    aktif: boolean;
    yogunluk: HatirlatmaYogunlugu;
    matris?: MuhafizMatrisi;
    ozelMatrisYedegi?: MuhafizMatrisi;
    esikler?: unknown;
    sikliklar?: unknown;
}

interface Anlik {
    aktif: boolean;
    yogunluk: HatirlatmaYogunlugu;
    matris: MuhafizMatrisi;
    ozelMatrisYedegi?: MuhafizMatrisi;
}

export interface MuhafizDuzeyi {
    /** Seçicideki değer: kapalıysa 'kapali', değilse yoğunluk ('ozel' dahil). */
    secili: DuzeySecimi;
    /** "Kendi ayarınız" kartı gösterilsin mi (özel ayar ya da geçerli yedeği var). */
    ozelVar: boolean;
    sec: (d: DuzeySecimi) => void;
    /** Ana anahtar (Hatırlatmalar satırı): kapat / son düzeyle aç. */
    aktifiDegistir: (acik: boolean) => void;
    /** Sesli onay modalı — çağıranın ağacına koyulur. */
    modal: React.ReactNode;
    /**
     * Kurulu planda sesli okuyan bir adım var mı (düzey önizlemesi için). Rıza yoksa
     * preset sesli hücreleri bildirime düşürür; düzey adı yine "Normal" kalır.
     */
    sesliAcik: boolean;
}

export function useMuhafizDuzeyi(planla: () => void): MuhafizDuzeyi {
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const muhafiz = useAppSelector((s) => (s as unknown as { muhafiz: MuhafizKaynagi }).muhafiz);
    const genelRiza = useGenelRiza();
    const ttsDestekli = useTurkceTtsDestegi();
    const [sesliOnayi, setSesliOnayi] = useState<PresetDuzey | null>(null);

    const matris: MuhafizMatrisi = useMemo(
        () => muhafiz.matris ?? eskidenMatriseGoc(muhafiz as Parameters<typeof eskidenMatriseGoc>[0]),
        [muhafiz]
    );

    const secili: DuzeySecimi = !muhafiz.aktif ? 'kapali' : (muhafiz.yogunluk as DuzeySecimi);
    const ozelVar = muhafiz.yogunluk === 'ozel' || matrisGecerliMi(muhafiz.ozelMatrisYedegi);
    const sesliAcik = useMemo(
        () => Object.values(matris ?? {}).some((v) => v?.seviyeler?.some((sv) => sv?.kanallar?.sesli === true)),
        [matris]
    );

    const geriYukle = useCallback(
        (a: Anlik) => {
            dispatch(matrisiGuncelle(a.matris));
            dispatch(muhafizAyarlariniGuncelle({ aktif: a.aktif, yogunluk: a.yogunluk }));
            // KOŞULSUZ: yedek yoksa açıkça temizlenir (BİREBİR geri yazım).
            dispatch(ozelMatrisYedegiGuncelle(a.ozelMatrisYedegi));
            planla();
        },
        [dispatch, planla]
    );

    const presetiUygula = useCallback(
        (yogunluk: PresetDuzey, sesliIzinVar: boolean) => {
            void butonTiklandiFeedback();
            const once: Anlik = {
                aktif: muhafiz.aktif,
                yogunluk: muhafiz.yogunluk,
                matris,
                ozelMatrisYedegi: muhafiz.ozelMatrisYedegi,
            };
            // Özelden çıkılıyorsa mevcut matris yedeklenir (güvenlik ağı; eski kayıtlarda eksik olabilir).
            if (muhafiz.yogunluk === 'ozel') dispatch(ozelMatrisYedegiGuncelle(matris));
            const preset = HATIRLATMA_PRESETLERI[yogunluk];
            dispatch(matrisiGuncelle(presetUygula(matris, preset.seviyeler, sesliIzinVar, yogunluk)));
            dispatch(muhafizAyarlariniGuncelle(muhafiz.aktif ? { yogunluk } : { yogunluk, aktif: true }));
            // Onay yalnız VERİLDİĞİNDE kalıcılaşır (ORTAK kayıt — tek rıza).
            if (sesliIzinVar && !genelRiza.sesli) genelRiza.ver({ sesliOnayi: true });
            planla();
            if (once.yogunluk === 'ozel') {
                geriAlBandiGoster({
                    mesaj: `${DUZEY_ADLARI[yogunluk]} düzeye geçildi`,
                    ikon: 'sliders-h',
                    geriAl: () => geriYukle(once),
                });
            }
        },
        [butonTiklandiFeedback, dispatch, genelRiza, geriYukle, matris, muhafiz, planla]
    );

    const sec = useCallback(
        (d: DuzeySecimi) => {
            if (d === 'kapali') {
                if (!muhafiz.aktif) return;
                void butonTiklandiFeedback();
                dispatch(muhafizAyarlariniGuncelle({ aktif: false }));
                planla();
                return;
            }
            if (d === 'ozel') {
                if (muhafiz.yogunluk === 'ozel' && muhafiz.aktif) return;
                void butonTiklandiFeedback();
                if (muhafiz.yogunluk !== 'ozel') dispatch(ozelYogunluguGeriYukle());
                if (!muhafiz.aktif) dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
                planla();
                return;
            }
            if (!presetMi(d)) return;
            const sesliVar = presetSesliIceriyorMu(HATIRLATMA_PRESETLERI[d].seviyeler);
            if (d === muhafiz.yogunluk) {
                if (!muhafiz.aktif) {
                    void butonTiklandiFeedback();
                    dispatch(muhafizAyarlariniGuncelle({ aktif: true }));
                    planla();
                    return;
                }
                // ZATEN SEÇİLİ: yalnız sesli onay eksikse açılır (sesliyi açmanın tek yolu).
                if (sesliVar && !genelRiza.sesli) setSesliOnayi(d);
                return;
            }
            if (sesliVar && !genelRiza.sesli) {
                setSesliOnayi(d);
                return;
            }
            presetiUygula(d, sesliVar);
        },
        [butonTiklandiFeedback, dispatch, genelRiza.sesli, muhafiz.aktif, muhafiz.yogunluk, planla, presetiUygula]
    );

    const aktifiDegistir = useCallback(
        (acik: boolean) => {
            if (acik === muhafiz.aktif) return;
            dispatch(muhafizAyarlariniGuncelle({ aktif: acik }));
            planla();
        },
        [dispatch, muhafiz.aktif, planla]
    );

    /** Onay modalındaki örnek okunuş — preset'in SESLİ ilk adımının eşiğiyle. */
    const ornekMetin = useMemo(() => {
        if (!sesliOnayi) return '';
        const adimlar = HATIRLATMA_PRESETLERI[sesliOnayi].seviyeler;
        const sesliAdim = adimlar.find((a) => a.kanallar.sesli) ?? adimlar[adimlar.length - 1];
        return anonsMetniniCoz(ANONS_SABLONLARI[0], 'ogle', sesliAdim.esikDk);
    }, [sesliOnayi]);

    const modal = sesliOnayi ? (
        <SesliOnayModal
            gorunur
            yogunlukEtiketi={DUZEY_ADLARI[sesliOnayi]}
            ornekMetin={ornekMetin}
            ttsDestekli={ttsDestekli}
            onOnayla={() => {
                presetiUygula(sesliOnayi, true);
                setSesliOnayi(null);
            }}
            onSessizUygula={() => {
                presetiUygula(sesliOnayi, false);
                setSesliOnayi(null);
            }}
            onIptal={() => setSesliOnayi(null)}
        />
    ) : null;

    return { secili, ozelVar, sec, aktifiDegistir, modal, sesliAcik };
}
