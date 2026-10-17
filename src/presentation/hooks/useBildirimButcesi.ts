/**
 * Bildirim sınırı rehberi (issue #298) — ekranların ortak hook'u.
 *
 * Muhafız ve nafile ayarları CANLI store'dan gelir (kullanıcı onları bu
 * ekranlarda değiştiriyor); diğer kaynaklar bir kez diskten okunur
 * (`defterDisGirdisiniOku` — vakitBildirim slice'ı açılışta yüklenmez).
 *
 * Sayı defterden gelir (`bildirimDefteriOlustur`); cihaz ölçümü yalnız TANI
 * içindir: ikisi ayrışırsa loga yazılır (bir plan üreticisi servisinden
 * kopmuş demektir).
 */
import type { CumaPlanAyarlari } from '../../core/bildirim/cumaPlani';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import type { NafileAyarlari } from '../../core/nafile/nafileTipleri';
import {
    defterOzetiHesapla,
    type DefterGirdisi,
    type DefterOzeti,
} from '../../core/bildirim/bildirimDefteri';
import {
    butceOnerileriOlustur,
    degisiklikSimuleEt,
    type ButceOnerisi,
    type DegisiklikSimulasyonu,
} from '../../core/bildirim/butceOnerileri';
import type { BildirimPlatformu } from '../../core/bildirim/butceSabitleri';
import {
    bekleyenleriOlc,
    defterDisGirdisiniOku,
    type DefterDisGirdisi,
} from '../../domain/services/BildirimDefteriServisi';
import { Logger } from '../../core/utils/Logger';

/** Defter girdisinde ekranların değiştirebildiği alanlar. */
export interface DefterDegisikligi {
    matris?: MuhafizMatrisi;
    nafile?: NafileAyarlari;
    /** Cuma (ortak hatırlatma yüzeyi) — ekleme anı simülasyonu. */
    cuma?: CumaPlanAyarlari;
}

export interface BildirimButcesi {
    platform: BildirimPlatformu;
    /** Dış girdi henüz okunmadıysa `null` (kart çizilmez — yanlış sayı göstermeyiz). */
    ozet: DefterOzeti | null;
    /** Güncel girdi (yoksa `null`). */
    girdi: DefterGirdisi | null;
    /** Güncel girdiye değişiklik uygulanmış hâli. */
    girdiyiKur: (d: DefterDegisikligi) => DefterGirdisi | null;
    /** Öneriler — verilen girdi (ör. bekleyen ekleme) için; verilmezse güncel. */
    onerileriHesapla: (g?: DefterGirdisi | null) => ButceOnerisi[];
    /** Değişiklik sığar mı? Girdi hazır değilse `null` (engellenmez). */
    simuleEt: (d: DefterDegisikligi) => DegisiklikSimulasyonu | null;
}

/**
 * Hazır bir girdiden rehber nesnesi kurar — SAF (testler de kullanır). Değişiklik
 * girdisi AYNI `simdi`yi taşır: önce/sonra ayrı anlarla ölçülseydi dakika
 * sınırında bir tetik iki tarafa farklı düşebilirdi.
 */
export function butceNesnesiOlustur(
    platform: BildirimPlatformu,
    girdi: DefterGirdisi | null,
    ozet: DefterOzeti | null = girdi ? defterOzetiHesapla(girdi) : null
): BildirimButcesi {
    const girdiyiKur = (d: DefterDegisikligi): DefterGirdisi | null =>
        girdi
            ? {
                ...girdi,
                muhafiz: d.matris && girdi.muhafiz ? { ...girdi.muhafiz, matris: d.matris } : girdi.muhafiz,
                nafile: d.nafile ?? girdi.nafile,
                cuma: d.cuma ?? girdi.cuma,
            }
            : null;
    return {
        platform,
        ozet,
        girdi,
        girdiyiKur,
        onerileriHesapla: (g?: DefterGirdisi | null) => {
            const hedef = g ?? girdi;
            return hedef ? butceOnerileriOlustur(hedef) : [];
        },
        simuleEt: (d: DefterDegisikligi) => {
            const sonra = girdiyiKur(d);
            return girdi && sonra ? degisiklikSimuleEt(girdi, sonra) : null;
        },
    };
}

export const bildirimPlatformu = (): BildirimPlatformu => (Platform.OS === 'ios' ? 'ios' : 'android');

export function useBildirimButcesi(): BildirimButcesi {
    const muhafiz = useAppSelector((s) => s.muhafiz);
    const nafile = useAppSelector((s) => s.nafile?.ayarlar);
    const koordinat = useAppSelector((s) => s.konum?.koordinatlar);
    const sayac = useAppSelector((s) => s.vakitSayac?.ayarlar);
    const platform = bildirimPlatformu();

    const [dis, setDis] = useState<DefterDisGirdisi | null>(null);

    useEffect(() => {
        let iptal = false;
        void defterDisGirdisiniOku().then((g) => {
            if (!iptal) setDis(g);
        });
        return () => {
            iptal = true;
        };
    }, []);

    // Store'da muhafız dilimi yoksa (yalın test kurulumları) muhafız sayılmaz.
    // Servislerle AYNI çözücü: yapısal bozuk matris eski alanlardan kurulur
    // (`?? eskidenMatriseGoc` bozuk ama var olan matrisi "0 muhafız" sayardı).
    const matris: MuhafizMatrisi | null = useMemo(() => (muhafiz ? muhafizMatrisiniCoz(muhafiz) : null), [muhafiz]);

    // "Bekleyen" şu andan sonrasıdır: ekran açık kaldıkça geçmişe düşen tetikler
    // sayılmaya devam etmesin diye an dakikada bir tazelenir (yoksa kart şişer ve
    // simülasyon sahte aşımla meşru eklemeyi engellerdi).
    const [dakika, setDakika] = useState(() => Math.floor(Date.now() / 60_000));
    useEffect(() => {
        const zamanlayici = setInterval(() => setDakika(Math.floor(Date.now() / 60_000)), 60_000);
        return () => clearInterval(zamanlayici);
    }, []);

    const girdi = useMemo<DefterGirdisi | null>(() => {
        if (!dis) return null;
        return {
            ...dis,
            platform,
            // `dakika` her tick'te memo'yu yeniden kurar; an yine gerçek saattir.
            simdi: new Date(Math.max(Date.now(), dakika * 60_000)),
            koordinat: koordinat ?? null,
            muhafiz: muhafiz && matris ? { aktif: muhafiz.aktif, matris } : null,
            nafile: nafile ?? null,
            vakitSayaci: sayac ? { aktif: sayac.aktif === true, sayacBaslangicSeviyesi: sayac.sayacBaslangicSeviyesi } : null,
        };
    }, [dis, platform, koordinat, muhafiz, matris, nafile, sayac, dakika]);

    const ozet = useMemo(() => (girdi ? defterOzetiHesapla(girdi) : null), [girdi]);

    // TANI: defter ↔ cihazda gerçekten bekleyen. Yalnız bir kez (ilk özet hazır
    // olunca) — her ayar dokunuşunda native listeyi okumak gereksiz.
    const ozetRef = useRef(ozet);
    ozetRef.current = ozet;
    const ozetHazir = ozet !== null;
    useEffect(() => {
        if (!ozetHazir) return;
        const defterToplami = ozetRef.current?.toplam;
        void bekleyenleriOlc().then((olcum) => {
            if (olcum) {
                Logger.info(
                    'BildirimDefteri',
                    `Defter ${defterToplami}, cihazda bekleyen ${olcum.toplam} (bildirim ${olcum.bildirim}, notifee ${olcum.notifee}, anons ${olcum.anons})`
                );
            }
        });
    }, [ozetHazir]);

    return useMemo(() => butceNesnesiOlustur(platform, girdi, ozet), [platform, girdi, ozet]);
}
