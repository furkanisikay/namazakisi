/**
 * İzin akışı ŞABLONU (sade tasarım, Dalga 1) — tek desen, her izin için:
 *
 *   1. Bağlam: ekran ya da `RizaModali` neden gerektiğini söyler (≤ 3 madde).
 *   2. Kullanıcı kabul eder → `istekBaslat()`; modalı kapatın. Sistem diyaloğu modal
 *      TAMAMEN kapandıktan sonra açılır: `kapanisBeklemeMs` (Android ~400 ms, iOS
 *      ~1000 ms) ya da iOS'ta `Modal.onDismiss` → `modalKapandi()`. (Kapanmakta olan RN
 *      Modal penceresiyle eşzamanlı istek Samsung'da "izin verilmedi" okutuyordu; Android'de
 *      `onDismiss` HİÇ çağrılmaz, ona bağlanmayın. `InteractionManager` kullanmayın.)
 *   3. İstekten sonra durum YENİDEN okunur ve üç sonuçtan biri döner:
 *      `verildi` · `tekrarDene` (yine sorulabilir) · `ayarlar` (kalıcı red → Ayarlar).
 *   4. Kullanıcı Ayarlar'dan dönünce (`AppState` 'active') durum kendiliğinden okunur.
 *
 * Kullanım:
 *   const izin = useIzinAkisi({ oku: konumIzniOku, iste: konumIzniIste });
 *   <RizaModali gorunur={acik} onOnayla={() => { setAcik(false); izin.istekBaslat(); }} … />
 *   izin.sonuc === 'ayarlar' → <DurumSatiri durum={{ tip:'uyari', metin:'…', eylem:'uygulamaAyarlari' }} />
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type { IzinDurumu } from '../../../core/cihaz/durumNotlari';

export type IzinSonucu = 'verildi' | 'tekrarDene' | 'ayarlar';

/** Modalın kapanış animasyonu için bekleme (TakvimCakismaBolumu dersi). */
export const MODAL_KAPANIS_BEKLEMESI_MS = Platform.OS === 'ios' ? 1000 : 400;

export interface IzinAkisiSecenekleri {
    /** Durumu SORMADAN okur. `null` = bilinmiyor. */
    oku: () => Promise<IzinDurumu | null>;
    /** Sistem diyaloğunu açar (sonucu önemsenmez; durum `oku` ile yeniden okunur). */
    iste: () => Promise<unknown>;
    /** Testte 0 verin. */
    kapanisBeklemeMs?: number;
}

export interface IzinAkisi {
    durum: IzinDurumu | null;
    /** Son isteğin sonucu (henüz istenmediyse `null`). */
    sonuc: IzinSonucu | null;
    istiyor: boolean;
    /** Kabul anında çağırın; diyalog modal kapandıktan sonra açılır. */
    istekBaslat: () => Promise<IzinSonucu | null>;
    /** iOS `Modal.onDismiss`: beklemeyi kısaltır (Android'de çağrılmaz, zararsız). */
    modalKapandi: () => void;
    ayarlariAc: () => Promise<void>;
    yenidenOku: () => Promise<IzinDurumu | null>;
}

export function sonucCoz(durum: IzinDurumu | null): IzinSonucu | null {
    if (durum === 'verildi') return 'verildi';
    if (durum === 'sorulabilir') return 'tekrarDene';
    if (durum === 'reddedildi') return 'ayarlar';
    return null;
}

export function useIzinAkisi({ oku, iste, kapanisBeklemeMs = MODAL_KAPANIS_BEKLEMESI_MS }: IzinAkisiSecenekleri): IzinAkisi {
    const [durum, setDurum] = useState<IzinDurumu | null>(null);
    const [sonuc, setSonuc] = useState<IzinSonucu | null>(null);
    const [istiyor, setIstiyor] = useState(false);
    const bagli = useRef(true);
    const bekleyen = useRef<(() => void) | null>(null);
    const okuRef = useRef(oku);
    okuRef.current = oku;
    const isteRef = useRef(iste);
    isteRef.current = iste;

    const yenidenOku = useCallback(async () => {
        let d: IzinDurumu | null = null;
        try {
            d = await okuRef.current();
        } catch {
            d = null;
        }
        if (bagli.current) setDurum(d);
        return d;
    }, []);

    useEffect(() => {
        bagli.current = true;
        void yenidenOku();
        const abonelik = AppState.addEventListener('change', async (s) => {
            if (s !== 'active') return;
            const d = await yenidenOku();
            // Ayarlar'dan dönen kullanıcı izni vermişse sonuç da güncellenir.
            if (bagli.current && d === 'verildi') setSonuc((o) => (o ? 'verildi' : o));
        });
        return () => {
            bagli.current = false;
            abonelik.remove();
        };
    }, [yenidenOku]);

    const modalKapandi = useCallback(() => {
        const b = bekleyen.current;
        bekleyen.current = null;
        b?.();
    }, []);

    const istekBaslat = useCallback(async (): Promise<IzinSonucu | null> => {
        setIstiyor(true);
        try {
            // Modal kapanışını bekle: zamanlayıcı ya da iOS onDismiss (hangisi önce).
            await new Promise<void>((coz) => {
                const zamanlayici = setTimeout(() => {
                    bekleyen.current = null;
                    coz();
                }, Math.max(0, kapanisBeklemeMs));
                bekleyen.current = () => {
                    clearTimeout(zamanlayici);
                    coz();
                };
            });
            try {
                await isteRef.current();
            } catch {
                // İstek patlasa da durum yeniden okunur.
            }
            const d = await yenidenOku();
            const s = sonucCoz(d);
            if (bagli.current) setSonuc(s);
            return s;
        } finally {
            if (bagli.current) setIstiyor(false);
        }
    }, [kapanisBeklemeMs, yenidenOku]);

    const ayarlariAc = useCallback(async () => {
        try {
            await Linking.openSettings();
        } catch {
            // Açılamazsa yapacak bir şey yok; satır yerinde kalır.
        }
    }, []);

    return { durum, sonuc, istiyor, istekBaslat, modalKapandi, ayarlariAc, yenidenOku };
}
